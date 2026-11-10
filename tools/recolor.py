"""사이트 사진을 작가 원본에서 다시 만든다: 원본의 색 정보(ICC)를 읽어 sRGB로 바꾼 뒤 지금 크기로 줄인다.
원본과 사이트 사진은 작은 흑백 축소본을 비교해 짝짓는다. 인자 --apply 가 없으면 짝만 보여 준다."""
import io, sys, zipfile, warnings
from pathlib import Path
from PIL import Image, ImageCms, ImageChops, ImageStat

warnings.simplefilter('ignore')
Image.MAX_IMAGE_PIXELS = None
sys.stdout.reconfigure(encoding='utf-8')
REPO = Path(r"C:\Users\USER\Desktop\AI 툴\공용 AI툴 자료\프로젝트\jihyuncraft.github.io")
ZIP = Path(r"C:\Users\USER\Desktop\김지현 웹사이트 폴더\3_작가 제공 원본 사진 (홈페이지).zip")
SRGB = ImageCms.createProfile('sRGB')
APPLY = '--apply' in sys.argv
N = 32


def thumb(im):
    return im.convert('RGB').convert('L').resize((N, N), Image.BILINEAR)   # 색 정보를 무시한 예전 변환과 같은 방식


def profile_name(im):
    icc = im.info.get('icc_profile')
    return ImageCms.getProfileDescription(ImageCms.ImageCmsProfile(io.BytesIO(icc))).strip() if icc else ''


def to_srgb(im):
    icc = im.info.get('icc_profile')
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        bg = Image.new('RGBA', im.size, 'white'); bg.alpha_composite(im); im = bg.convert('RGB')
    if icc:
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        return ImageCms.profileToProfile(im, src, SRGB, outputMode='RGB', renderingIntent=ImageCms.Intent.RELATIVE_COLORIMETRIC)
    return im.convert('RGB')


origs = []
with zipfile.ZipFile(ZIP) as z:
    for n in z.namelist():
        if n.endswith('/'):
            continue
        try:
            nn = n.encode('cp437').decode('cp949')
        except Exception:
            nn = n
        im = Image.open(io.BytesIO(z.read(n)))
        origs.append({'zipname': n, 'name': nn.split('/', 1)[-1], 'ratio': im.width / im.height, 'thumb': thumb(im), 'profile': profile_name(im), 'mode': im.mode})

done = skipped = 0
with zipfile.ZipFile(ZIP) as z:
    for f in sorted((REPO / 'images').rglob('*')):
        if f.suffix.lower() not in ('.jpg', '.jpeg', '.png'):
            continue
        site = Image.open(f)
        st = thumb(site)
        best = None
        for o in origs:
            if abs(o['ratio'] - site.width / site.height) > 0.012:
                continue
            d = ImageStat.Stat(ImageChops.difference(st, o['thumb'])).mean[0]
            if best is None or d < best[0]:
                best = (d, o)
        rel = f.relative_to(REPO).as_posix()
        if not best or best[0] > 4.0:
            print(f'짝 없음   {rel}' + (f'  (가장 가까운 것 {best[1]["name"]} 차이 {best[0]:.1f})' if best else ''))
            skipped += 1
            continue
        d, o = best
        needs = o['mode'] == 'CMYK' or (o['profile'] and 'sRGB' not in o['profile'])
        print(f'{"다시 만듦" if needs else "그대로  "} {rel}  <=  {o["name"]}  [{o["mode"]} {o["profile"] or "색 정보 없음"}] 차이 {d:.1f}')
        if not needs:
            continue
        done += 1
        if APPLY:
            im = to_srgb(Image.open(io.BytesIO(z.read(o['zipname']))))
            im = im.resize(site.size, Image.LANCZOS)
            im.save(f, quality=88, optimize=True) if f.suffix.lower() != '.png' else im.save(f, optimize=True)
print(f'다시 만들 사진 {done}장, 짝 없는 사진 {skipped}장, 적용 {"함" if APPLY else "안 함"}')
