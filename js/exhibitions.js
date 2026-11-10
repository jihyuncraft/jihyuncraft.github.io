/* EXHIBITIONS: 목록(구분 탭, 사진은 원래 비율)과 상세(대표 이미지 → 정보 → 소개 글 KR/EN → 포스터 → 전경 + 선택 작품 액자). */
import { $, esc, img, paras, yearOf } from './util.js';
import { TYPE_EN, EX_LANGS } from './constants.js';
import { reveal } from './reveal.js';

export const coverOf = n => n.cover || (n.photos || [])[0] || n.poster;
const typeOf = n => esc(TYPE_EN[n.type] || n.type || '');

const isSolo = n => n.type === '개인전';
const FILTERS = [['all', 'All'], ['solo', 'Solo Exhibition'], ['group', 'Group Exhibition']];

/* 개인전이 먼저, 그 안에서 연도가 최근인 순서. 같은 해는 관리 화면 순서를 지킨다 */
export const sortExhibitions = items => items.map((n, i) => ({ ...n, _i: i }))
  .sort((a, b) => isSolo(b) - isSolo(a) || (+yearOf(b) || 0) - (+yearOf(a) || 0) || a._i - b._i);

/* 구분 탭: solo 는 개인전만, group 은 개인전이 아닌 것(단체전·아트페어) */
export const filterExhibitions = (list, filter) => list.filter(n => filter === 'all' || isSolo(n) === (filter === 'solo'));

/* 소개 글이 채워진 언어만: [{ code, label, text }] */
export const exLangs = n => EX_LANGS.filter(([, key]) => n[key]?.trim()).map(([code, key, label]) => ({ code, label, text: n[key] }));

/* 전경 사진 한 장마다 작품 액자 두 개씩 끼우고, 남은 액자는 끝에 둔다 */
export function interleave(photos, works, size = 2) {
  const out = []; let wi = 0;
  for (const p of photos) {
    out.push({ shot: p });
    if (wi < works.length) { out.push({ pair: works.slice(wi, wi + size) }); wi += size; }
  }
  for (; wi < works.length; wi += size) out.push({ pair: works.slice(wi, wi + size) });
  return out;
}

/* 목록 순서에서 다음 전시(끝이면 처음으로). 전시가 하나뿐이면 없다 */
export function nextExhibition(items, i) {
  const list = sortExhibitions(items), k = list.findIndex(n => n._i === i);
  return list.length > 1 && k >= 0 ? list[(k + 1) % list.length] : null;
}

export function renderExList(root, items, tabs, filter = 'all') {
  const list = filterExhibitions(sortExhibitions(items), filter);
  tabs.innerHTML = FILTERS.map(([k, label]) =>
    `<button type="button" data-f="${k}" class="${k === filter ? 'on' : ''}" aria-pressed="${k === filter}">${label}</button>`).join('');
  tabs.onclick = e => { const b = e.target.closest('[data-f]'); if (b) renderExList(root, items, tabs, b.dataset.f); };
  root.innerHTML = list.length ? list.map((n, k) => `
    <a class="ex fi hov" href="/exhibitions/${n._i}/">
      <div class="ph frame">${img(coverOf(n), n.title, k === 0)}</div>
      <p class="cap"><span class="ty">${typeOf(n)}</span>
        <span class="ti">${esc(n.title)}${yearOf(n) ? `, ${esc(yearOf(n))}` : ''}</span>
        ${n.titleEn ? `<span class="en">${esc(n.titleEn)}</span>` : ''}
        <span>${esc(n.place || n.venue || '')}</span></p>
    </a>`).join('') : '<p class="empty">해당하는 전시가 아직 없습니다.</p>';
  reveal(root);
}

export function renderExhibition(root, n, gallery, next) {
  const cover = coverOf(n);
  const shots = [];   // 이 화면의 사진을 화면 순서대로 크게 보기에 넣는다
  const add = (src, alt, capText = '') => shots.push({ src, alt, cap: capText ? `<div class="text">${paras(capText)}</div>` : '' }) - 1;

  const coverBtn = `<button class="ph" data-g="${add(cover, n.title)}">${img(cover, n.title, true)}</button>`;
  const posterBtn = n.poster && n.poster !== cover
    ? `<button class="ph poster" data-g="${add(n.poster, n.title + ' 포스터')}" data-hide-broken>${img(n.poster, n.title + ' 포스터')}</button>` : '';
  const shotHtml = src => `<button class="ph fi" data-g="${add(src, n.title + ' 전시 전경')}" data-hide-broken>${img(src, n.title + ' 전시 전경')}</button>`;
  const pieceHtml = w => `<figure class="fi" data-hide-broken>
      <button class="ph frame" data-g="${add(w.img, w.cap || n.title, w.cap)}">${img(w.img, w.cap || n.title)}</button>
      ${w.cap ? `<figcaption class="pc">${esc(w.cap)}</figcaption>` : ''}</figure>`;

  const body = interleave((n.photos || []).filter(p => p !== cover), (n.works || []).filter(w => w?.img))
    .map(b => b.shot ? shotHtml(b.shot) : `<div class="pair">${b.pair.map(pieceHtml).join('')}</div>`).join('');

  const info = [n.period, n.closed, n.hours, n.venue].filter(Boolean).map(esc).join('<br>');
  const langs = exLangs(n);

  root.innerHTML = `
    <a class="back" href="/exhibitions/">EXHIBITIONS</a>
    ${coverBtn}
    <div class="head">
      <p class="ty">${typeOf(n)}</p>
      <h1>${esc(n.title)}</h1>
      ${n.titleEn ? `<p class="ten">${esc(n.titleEn)}</p>` : ''}
      ${n.sub ? `<p class="sub">${esc(n.sub)}</p>` : ''}
      ${info ? `<p class="info">${info}</p>` : ''}
    </div>
    ${langs.length > 1 ? `<div class="langs" id="exLangs">${langs.map((l, k) =>
      `<button type="button" data-lang="${k}" lang="${l.code}" class="${k ? '' : 'on'}" aria-pressed="${!k}">${l.label}</button>`).join('')}</div>` : ''}
    ${langs.length ? `<div class="text" id="exText" lang="${langs[0].code}">${paras(langs[0].text)}</div>` : ''}
    ${posterBtn}
    ${body ? `<div class="shots">${body}</div>` : ''}
    ${next ? `<a class="next" href="/exhibitions/${next._i}/"><span>Next exhibition</span>${esc(next.title)}</a>` : ''}`;

  root.onclick = e => {
    const lb = e.target.closest('#exLangs button');
    if (lb) {
      const t = $('#exText', root), l = langs[+lb.dataset.lang];
      t.innerHTML = paras(l.text); t.lang = l.code;
      root.querySelectorAll('#exLangs button').forEach(b => { b.classList.toggle('on', b === lb); b.setAttribute('aria-pressed', b === lb); });
      return;
    }
    const b = e.target.closest('[data-g]');
    if (b) gallery.open(shots, +b.dataset.g);
  };
  reveal(root);
}
