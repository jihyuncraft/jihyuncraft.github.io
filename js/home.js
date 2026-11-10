/* 첫 화면: 사진이 5초마다 저절로 바뀐다. 손으로 밀어 넘기거나 멈춤 버튼으로 세울 수 있다. */
import { img } from './util.js';

const INTERVAL = 5000;

export function createHome(root, images) {
  const many = images.length > 1;
  root.innerHTML = images.map((s, i) => `<div class="slide${i ? '' : ' on'}">${img(s, 'KIM JI HYUN 작품', i === 0)}</div>`).join('') +
    `<div class="h-bar"><span class="cr">&copy; KIM JI HYUN</span>${many
      ? '<button class="h-pause" type="button"></button><span class="h-count" aria-hidden="true"></span>' : ''}</div>`;
  const slides = [...root.querySelectorAll('.slide')];
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
  const play = on => { visible = on; run(); };

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
