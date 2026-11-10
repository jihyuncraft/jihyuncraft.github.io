/* 여러 화면이 같이 쓰는 작은 도구. DOM에 의존하지 않는 함수는 test/site.test.mjs 로 확인한다. */

export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];

/* 관리 화면에서 입력한 글은 HTML로 해석하지 않는다 */
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* 파일 이름에 한글·공백이 있어도 깨지지 않게 */
export const url = p => esc(encodeURI(p || ''));

/* 빈 줄은 문단, 줄바꿈은 <br> */
export const paras = t => String(t || '').trim().split(/\n\s*\n/).filter(Boolean)
  .map(p => `<p>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`).join('');

/* 사진 태그. 파일이 없으면 data-hide-broken 이 붙은 가장 가까운 묶음을 지운다 */
export const img = (src, alt, eager = false) =>
  `<img src="${url(src)}" alt="${esc(alt)}"${eager ? '' : ' loading="lazy"'} decoding="async" onerror="this.closest('[data-hide-broken]')?.remove()">`;

/* 전시 연도: 입력한 연도가 없으면 전시일의 첫 네 자리 숫자 */
export const yearOf = n => n.year || ((n.period || '').match(/\d{4}/) || [''])[0];
