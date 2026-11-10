/* 첫 화면: 작가의 시그니처 도장이 크게 그려지고, 그 위에 작품 사진이 5초마다 저절로 바뀐다.
   손으로 밀어 넘기거나 멈춤 버튼으로 세울 수 있고, 마우스를 움직이면 사진과 도장이 조금씩 어긋나 깊이가 생긴다. */
import { $, img } from './util.js';

const INTERVAL = 5000;

export function createHome(root, images) {
  const many = images.length > 1;
  const stamp = $('.plan');   // 도장 선은 index.html 한곳에만 둔다
  root.innerHTML = `<svg class="draft" viewBox="${stamp.getAttribute('viewBox')}" aria-hidden="true">${stamp.innerHTML}</svg>` +
    images.map((s, i) => `<div class="slide${i ? '' : ' on'}">${img(s, 'KIM JI HYUN 작품', i === 0)}</div>`).join('') +
    `<div class="h-bar"><span class="cr">&copy; KIM JI HYUN</span>${many
      ? '<button class="h-pause" type="button"></button><span class="h-count" aria-hidden="true"></span>' : ''}</div>`;
  const slides = [...root.querySelectorAll('.slide')], draft = root.querySelector('.draft');
  const count = root.querySelector('.h-count'), pause = root.querySelector('.h-pause');
  let idx = 0, timer = null, startX = null, paused = false, visible = false;

  const label = () => {
    if (!many) return;
    count.textContent = `${idx + 1} / ${slides.length}`;
    pause.textContent = paused ? 'Play' : 'Pause';
    pause.setAttribute('aria-label', paused ? '사진 자동 넘김 다시 시작' : '사진 자동 넘김 멈춤');
  };
  const go = i => {
    slides[idx].classList.remove('on');
    idx = (i + slides.length) % slides.length;
    slides[idx].classList.add('on');
    label();
  };
  /* 첫 화면이 보이고 멈춤 상태가 아닐 때만 돈다 */
  const run = () => {
    clearInterval(timer);
    if (visible && !paused && many) timer = setInterval(() => go(idx + 1), INTERVAL);
  };
  /* 첫 화면에 들어올 때마다 도장을 처음부터 다시 그린다 */
  const play = on => {
    draft.classList.toggle('draw', on);
    visible = on; run();
  };

  pause?.addEventListener('click', () => { paused = !paused; label(); run(); });
  root.addEventListener('pointerdown', e => { startX = e.target.closest('.h-bar') ? null : e.clientX; });
  root.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX; startX = null;
    if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); run(); }
  });
  /* 마우스 위치를 -1~1 로 넘긴다(터치에서는 움직이지 않는다) */
  root.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    root.style.setProperty('--mx', (e.clientX / innerWidth * 2 - 1).toFixed(3));
    root.style.setProperty('--my', (e.clientY / innerHeight * 2 - 1).toFixed(3));
  });

  label();
  return { play };
}
