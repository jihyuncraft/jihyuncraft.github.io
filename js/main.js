/* 시작점. 내용은 content/site.json 에서 불러오고(관리 화면 /admin 이 편집), 화면 조립은 각 모듈이 맡는다. */
import { $, $$, setSizes } from './util.js';
import { CATS } from './constants.js';
import { startRouter } from './router.js';
import { createGallery } from './gallery.js';
import { createHome } from './home.js';
import { renderWorks } from './works.js';
import { renderExList, renderExhibition, nextExhibition } from './exhibitions.js';
import { renderAbout } from './about.js';

let SITE;
try { SITE = await (await fetch('/content/site.json?_=' + Date.now(), { cache: 'no-store' })).json(); }
catch (e) { console.error('content/site.json 을 불러오지 못했습니다.', e); throw e; }

/* 사진 크기표는 없어도 화면이 뜬다(자리만 미리 못 잡는다) */
setSizes(await fetch('/content/sizes.json').then(r => r.ok ? r.json() : {}));

const gallery = createGallery();
const home = createHome($('#v-home'), SITE.home.images);

/* 메뉴 */
$('#navSub').innerHTML = CATS.map(c => `<li><a href="/works/${c.id}/" data-k="${c.id}">${c.label}</a></li>`).join('');
$('#cats').innerHTML = CATS.map(c => `<a href="/works/${c.id}/" data-k="${c.id}">${c.label}</a>`).join('');
const burger = $('#burger');
const setMenu = on => {
  document.body.classList.toggle('menu-open', on);
  burger.setAttribute('aria-expanded', on);
  burger.setAttribute('aria-label', on ? '메뉴 닫기' : '메뉴 열기');
};
burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));

/* ABOUT 언어 */
let aboutLang = 'ko';
$('#aboutLangs').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  aboutLang = b.dataset.lang; renderAbout($('#v-about'), SITE.about, aboutLang);
};

/* CONTACT (이메일은 조각으로 합쳐 스팸 수집 방지) */
const C = SITE.settings, mail = C.emailUser + '@' + C.emailDomain;
$$('#mail, #footMailText').forEach(el => { el.textContent = mail; });
$$('#insta, #footInstaText').forEach(el => { el.textContent = C.instaHandle; });
$$('#mail, #footMail').forEach(a => { a.href = 'mail' + 'to:' + mail; });
$$('#insta, #footInsta').forEach(a => { a.href = C.insta; });

/* 화면 이름: 브라우저 탭 제목 */
const PAGE_NAMES = { about: 'About', exhibitions: 'Exhibitions', contact: 'Contact' };
function setTitle(r) {
  const name = r.view === 'works' ? CATS.find(c => c.id === r.arg).label
    : r.view === 'exhibition' ? SITE.news.items[+r.arg]?.title
    : PAGE_NAMES[r.view];
  document.title = name ? `${name} — KIM JI HYUN` : 'KIM JI HYUN — 금속공예';
}

/* 화면 전환 */
const renderers = {
  works:      r => renderWorks($('#worksList'), SITE.works[r.arg] || [], gallery, CATS[(CATS.findIndex(c => c.id === r.arg) + 1) % CATS.length]),
  exhibitions: () => renderExList($('#exList'), SITE.news.items, $('#exFilter')),
  exhibition: r => {
    const n = SITE.news.items[+r.arg];
    if (!n) { location.hash = '#/exhibitions'; return; }
    renderExhibition($('#v-exhibition'), n, gallery, nextExhibition(SITE.news.items, +r.arg));
  },
  about:      r => { aboutLang = r.arg; renderAbout($('#v-about'), SITE.about, aboutLang); }
};

startRouter(r => {
  gallery.close(true); setMenu(false);
  $$('.view').forEach(v => { v.hidden = v.id !== 'v-' + r.view; });
  const cls = document.body.classList;
  cls.toggle('is-home', r.view === 'home');
  cls.toggle('has-view', r.view !== 'home');
  cls.toggle('in-works', r.page === 'works');
  home.play(r.view === 'home');
  renderers[r.view]?.(r);
  setTitle(r);

  $$('.nav a, .cats a').forEach(a => {
    const on = a.dataset.k === r.page || (r.page === 'works' && a.dataset.k === r.arg);
    a.classList.toggle('on', on);
    on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
}, () => aboutLang);
