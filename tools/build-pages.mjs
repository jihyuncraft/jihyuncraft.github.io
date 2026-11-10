// 실행: node tools/build-pages.mjs   (전시·작품 분류·사진을 추가하거나 index.html을 고친 뒤 실행)
// 만드는 것: 화면별 주소의 index.html(검색·공유용 제목과 설명), 404.html, sitemap.xml, content/sizes.json
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, yearOf } from '../js/util.js';
import { CATS, TYPE_EN } from '../js/constants.js';
import { coverOf } from '../js/exhibitions.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://jihyunkimcraft.com';
const site = JSON.parse(readFileSync(join(ROOT, 'content/site.json'), 'utf8'));
const base = readFileSync(join(ROOT, 'index.html'), 'utf8');

/* ---------- 사진 크기: 자리를 미리 잡아 사진이 뜰 때 화면이 밀리지 않게 한다 ---------- */
// ponytail: JPEG만 읽고 회전 정보(EXIF)는 보지 않는다. 지금 사진은 모두 회전 없는 JPG. 다른 형식이 들어오면 크기 없이 예전처럼 뜬다.
function jpegSize(buf) {
  for (let o = 2; o + 9 < buf.length && buf[o] === 0xff;) {
    const m = buf[o + 1], len = buf.readUInt16BE(o + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [buf.readUInt16BE(o + 7), buf.readUInt16BE(o + 5)];
    o += 2 + len;
  }
  return null;
}
const sizes = {};
(function walk(dir) {
  for (const name of readdirSync(join(ROOT, dir))) {
    const rel = dir + '/' + name;
    if (statSync(join(ROOT, rel)).isDirectory()) walk(rel);
    else if (/\.jpe?g$/i.test(name)) { const s = jpegSize(readFileSync(join(ROOT, rel))); if (s) sizes['/' + rel] = s; }
  }
})('images');
writeFileSync(join(ROOT, 'content/sizes.json'), JSON.stringify(sizes));

/* ---------- 화면별 페이지 ---------- */
const titles = list => list.map(w => w.title).filter(Boolean).slice(0, 8).join(', ');
const pages = [
  { path: 'about', title: 'ABOUT', desc: '김지현 | Jihyun Kim 금속공예 작가 소개와 전시 이력.', image: site.about.imageKo },
  ...CATS.map(c => ({ path: `works/${c.id}`, title: c.label, desc: `${c.label}: ${titles(site.works[c.id] || [])}`, image: site.works[c.id]?.[0]?.img })),
  { path: 'exhibitions', title: 'EXHIBITIONS', desc: site.news.items.map(n => `${n.title} ${yearOf(n)}`).join(', '), image: coverOf(site.news.items[0] || {}) },
  // ponytail: 전시 주소는 관리 화면의 순서 번호. 중간에 끼워 넣으면 번호가 밀리므로 새 전시는 맨 아래에 추가한다.
  ...site.news.items.map((n, i) => ({ path: `exhibitions/${i}`, title: n.title,
    desc: [TYPE_EN[n.type] || n.type, n.titleEn, n.period, n.place || n.venue].filter(Boolean).join(' / '), image: coverOf(n) })),
  { path: 'contact', title: 'CONTACT', desc: '김지현 | Jihyun Kim 연락처: 이메일, 인스타그램.' }
];

const meta = (html, p) => {
  const title = esc(`${p.title} — Jihyun Kim`), desc = esc(p.desc), url = `${ORIGIN}/${p.path}/`;
  const set = (re, v) => { if (!re.test(html)) throw new Error('index.html에서 못 찾음: ' + re); html = html.replace(re, v); };
  set(/<title>.*?<\/title>/, `<title>${title}</title>`);
  set(/(<meta name="description" content=")[^"]*/, `$1${desc}`);
  set(/(<link rel="canonical" href=")[^"]*/, `$1${url}`);
  set(/(<meta property="og:title" content=")[^"]*/, `$1${title}`);
  set(/(<meta property="og:description" content=")[^"]*/, `$1${desc}`);
  set(/(<meta property="og:url" content=")[^"]*/, `$1${url}`);
  if (p.image) set(/(<meta property="og:image" content=")[^"]*/, `$1${ORIGIN}${esc(encodeURI(p.image))}`);
  return html.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<!-- 자동 생성 파일. 고치지 말고 index.html을 고친 뒤 node tools/build-pages.mjs 를 실행한다 -->');
};
for (const p of pages) {
  mkdirSync(join(ROOT, p.path), { recursive: true });
  writeFileSync(join(ROOT, p.path, 'index.html'), meta(base, p));
}
// 아직 페이지를 만들지 않은 주소(관리 화면에서 막 추가한 전시 등)도 화면은 뜨게 한다
writeFileSync(join(ROOT, '404.html'), base.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<!-- 자동 생성 파일(index.html 사본) -->'));
writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${ORIGIN}/</loc></url>
${pages.map(p => `  <url><loc>${ORIGIN}/${p.path}/</loc></url>`).join('\n')}
</urlset>
`);
console.log(`페이지 ${pages.length}개, 사진 크기 ${Object.keys(sizes).length}개`);
