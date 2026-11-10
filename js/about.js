/* ABOUT: 작업실 사진 → 작가노트 → 이력(CV). KO/EN 전환. */
import { $, esc, paras } from './util.js';
import { CV_LABELS } from './constants.js';

const CV_ORDER = ['education', 'solo', 'group', 'awards'];

export function renderAbout(root, about, lang) {
  const d = about.cv[lang] || {}, L = CV_LABELS[lang];
  const photo = $('#aboutImg', root);
  photo.hidden = false; photo.onerror = () => { photo.hidden = true; };
  photo.src = encodeURI(lang === 'en' ? about.imageEn : about.imageKo);

  const block = k => d[k]?.length
    ? `<h2>${L[k]}</h2><ul>${d[k].map((r, i) => `<li><b>${r.year === d[k][i - 1]?.year ? '' : esc(r.year)}</b><span>${esc(r.text)}</span></li>`).join('')}</ul>` : '';
  const note = d.statement?.trim() ? `<h2>${L.note}</h2><div class="text note" lang="${lang}">${paras(d.statement)}</div>` : '';
  $('#aboutBody', root).innerHTML = note + `<div class="cv">${CV_ORDER.map(block).join('')}</div>`;
  root.querySelectorAll('#aboutLangs button').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
}
