/* WORKS: 작품을 한 줄로 보여 주고, 누르면 그 작품의 사진(대표 + 추가)을 넘겨 본다. */
import { esc, img, paras } from './util.js';
import { reveal } from './reveal.js';

/* 캡션 줄: 재료 → 크기, 연도 */
const specs = w => [w.mat, [w.size, w.year].filter(Boolean).join(', ')].filter(Boolean).map(esc);

export function workCaption(w) {
  const spec = specs(w).join('<br>');
  return (w.title ? `<b>${esc(w.title)}</b>` : '') + (spec ? `<span>${spec}</span>` : '') +
    (w.desc ? `<div class="text">${paras(w.desc)}</div>` : '');
}

export const workImages = w => [w.img, ...(w.images || [])].filter(Boolean);

export function renderWorks(root, list, gallery, next) {
  root.innerHTML = list.map((w, i) => {
    const n = workImages(w).length, spec = specs(w).map(t => `<span>${t}</span>`).join('');
    return `<figure class="work fi" data-hide-broken><div class="hov">
      <button class="ph" data-w="${i}" aria-label="${esc(w.title || '작품')} 크게 보기">${img(w.img, w.title || `작품 ${i + 1}`, i === 0)}</button>
      <figcaption>${w.title ? `<button class="tl" data-w="${i}">${esc(w.title)}</button>` : ''}
        ${spec ? `<span class="meta">${spec}</span>` : ''}
        ${n > 1 ? `<span class="cnt">${n} images</span>` : ''}</figcaption>
    </div></figure>`;
  }).join('') + (next ? `<a class="next" href="/works/${next.id}/"><span>Next</span>${esc(next.label)}</a>` : '');
  root.onclick = e => {
    const b = e.target.closest('[data-w]'); if (!b) return;
    const w = list[+b.dataset.w], cap = workCaption(w);
    gallery.open(workImages(w).map(src => ({ src, alt: w.title, cap })), 0);
  };
  reveal(root);
}
