/* 첫 화면: 도면 선이 그려지고, 그 위에 작품 사진이 5초마다 저절로 바뀐다.
   손으로 밀어 넘기거나 멈춤 버튼으로 세울 수 있다. */
import { img } from './util.js';

const INTERVAL = 5000;

/* 작품의 평면도에서 가져온 선: 겹친 두 원통, 바닥 판, 중심선, 눈금. */
const DRAFT = `<svg class="draft" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g>
  <path class="d1" d="M0 470H1440"/>
  <path class="d1" d="M720 0V900"/>
  <circle class="d2" cx="590" cy="470" r="262"/>
  <circle class="d2" cx="850" cy="470" r="262"/>
  <path class="d3" d="M850 470H1250V790H850Z"/>
  <path class="d3" d="M590 208L404 656"/>
  <path class="d3" d="M440 840v-14M500 840v-8M560 840v-8M620 840v-8M680 840v-8M740 840v-14M800 840v-8M860 840v-8M920 840v-8M980 840v-8M1040 840v-14M440 840H1040"/>
</g></svg>`;

export function createHome(root, images) {
  const many = images.length > 1;
  root.innerHTML = DRAFT +
    images.map((s, i) => `<div class="slide${i ? '' : ' on'}">${img(s, 'Jihyun Kim 작품', i === 0)}</div>`).join('') +
    `<div class="h-bar"><span class="cr">&copy; JIHYUN KIM</span>${many
      ? '<button class="h-pause" type="button"></button><span class="h-count" aria-hidden="true"></span>' : ''}</div>`;
  const slides = [...root.querySelectorAll('.slide')];
  const draft = root.querySelector('.draft'), lines = draft.firstElementChild;
  const count = root.querySelector('.h-count'), pause = root.querySelector('.h-pause');
  let idx = 0, timer = null, startX = null, paused = false, visible = false;

  const label = () => {
    if (!many) return;
    count.textContent = `${idx + 1} / ${slides.length}`;
    pause.textContent = paused ? 'Play' : 'Pause';
    pause.setAttribute('aria-label', paused ? '사진 자동 넘김 다시 시작' : '사진 자동 넘김 멈춤');
  };
  /* 사진이 바뀔 때마다 도면을 좌우로 뒤집어 다시 그린다 */
  const redraw = () => {
    lines.setAttribute('transform', idx % 2 ? 'translate(1440 0) scale(-1 1)' : '');
    draft.classList.remove('draw');
    void draft.getBoundingClientRect();   // 효과를 처음부터 다시 시작시키려고 한 번 읽는다
    draft.classList.add('draw');
  };
  const go = i => {
    slides[idx].classList.remove('on');
    idx = (i + slides.length) % slides.length;
    slides[idx].classList.add('on');
    label(); redraw();
  };
  /* 첫 화면이 보이고 멈춤 상태가 아닐 때만 돈다 */
  const run = () => {
    clearInterval(timer);
    if (visible && !paused && many) timer = setInterval(() => go(idx + 1), INTERVAL);
  };
  const play = on => { if (on && !visible) redraw(); visible = on; run(); };

  pause?.addEventListener('click', () => { paused = !paused; label(); run(); });
  root.addEventListener('pointerdown', e => { startX = e.target.closest('.h-bar') ? null : e.clientX; });
  root.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX; startX = null;
    if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); run(); }
  });

  label();
  return { play };
}
