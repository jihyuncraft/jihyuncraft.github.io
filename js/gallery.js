/* 크게 보기: 사진을 옆으로 넘긴다. 작품·전시가 같이 쓴다.
   items = [{ src, alt, cap(HTML) }]. 열면 기록에 한 칸을 넣어 휴대폰 뒤로 가기로 닫힌다. */
import { $, img } from './util.js';

export function createGallery(root = $('#gal')) {
  const track = $('#gTrack', root), cap = $('#gCap', root), count = $('#gCount', root);
  let items = [], idx = 0, lastFocus = null, tick;

  const show = i => {
    idx = Math.max(0, Math.min(items.length - 1, i));
    cap.innerHTML = items[idx].cap || '';
    count.textContent = items.length > 1 ? `${idx + 1} / ${items.length}` : '';
  };
  /* 열려 있는 동안 뒤 화면은 키보드·낭독기가 닿지 않게 한다 */
  const hold = on => document.querySelectorAll('body > :not(#gal)').forEach(el => { el.inert = on; });
  const step = d => track.scrollTo({ left: (idx + d) * track.clientWidth, behavior: 'smooth' });

  function open(list, i = 0) {
    if (!list.length) return;
    items = list; lastFocus = document.activeElement;
    track.innerHTML = list.map((it, k) => `<div class="g-slide">${img(it.src, it.alt || '', Math.abs(k - i) < 2)}</div>`).join('');
    root.classList.toggle('multi', list.length > 1);
    root.hidden = false; hold(true); document.documentElement.style.overflow = 'hidden';
    track.scrollLeft = i * track.clientWidth; show(i);
    history.pushState({ gal: 1 }, '');
    $('#gClose', root).focus();
  }
  function close(fromHistory = false) {
    if (root.hidden) return;
    root.hidden = true; hold(false); document.documentElement.style.overflow = '';
    track.innerHTML = '';
    if (!fromHistory && history.state?.gal) history.back();
    lastFocus?.focus({ preventScroll: true });
  }

  track.addEventListener('scroll', () => {
    cancelAnimationFrame(tick);
    tick = requestAnimationFrame(() => show(Math.round(track.scrollLeft / track.clientWidth)));
  }, { passive: true });
  $('#gClose', root).onclick = () => close();
  $('#gPrev', root).onclick = () => step(-1);
  $('#gNext', root).onclick = () => step(1);
  addEventListener('popstate', () => close(true));
  addEventListener('resize', () => { if (!root.hidden) track.scrollLeft = idx * track.clientWidth; });
  document.addEventListener('keydown', e => {
    if (root.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  return { open, close };
}
