/* 첫 화면: 사진이 5초마다 바뀌고, 손으로 밀어 넘길 수 있다. */
import { img } from './util.js';

export function createHome(root, images) {
  root.innerHTML = images.map((s, i) => `<div class="slide${i ? '' : ' on'}">${img(s, 'KIM JI HYUN 작품', i === 0)}</div>`).join('');
  const slides = [...root.children];
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  let idx = 0, timer = null, startX = null;

  const go = i => { slides[idx].classList.remove('on'); idx = (i + slides.length) % slides.length; slides[idx].classList.add('on'); };
  const play = on => {
    clearInterval(timer);
    if (on && !reduce && slides.length > 1) timer = setInterval(() => go(idx + 1), 5000);
  };

  root.addEventListener('pointerdown', e => { startX = e.clientX; });
  root.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX; startX = null;
    if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); play(true); }
  });

  return { play };
}
