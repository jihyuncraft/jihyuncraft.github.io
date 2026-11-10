/* 주소(/works/hap/)를 화면 정보로 바꾼다. 뒤로 가기가 그대로 동작하도록 화면 상태는 주소에만 둔다.
   예전 주소(#/works/hap)로 들어오면 새 주소로 바꿔 준다. */
import { CATS } from './constants.js';

/* 순수 함수: '/works/hap/' 또는 '#/works/hap' → { view:'works', page:'works', arg:'hap', key:'works/hap' } */
export function parseRoute(hash, aboutLang = 'ko') {
  let [page = 'home', arg] = String(hash || '').replace(/^[#/]+/, '').split('/').filter(Boolean);
  if (page === 'news') page = 'exhibitions';   // 예전 주소 호환
  if (page === 'works') {
    arg = CATS.some(c => c.id === arg) ? arg : CATS[0].id;
    return { view: 'works', page, arg, key: 'works/' + arg };
  }
  if (page === 'exhibitions' && arg !== undefined) return { view: 'exhibition', page, arg, key: 'exhibition/' + arg };
  if (page === 'about') {
    arg = arg === 'en' || arg === 'ko' ? arg : aboutLang;
    return { view: 'about', page, arg, key: 'about' };
  }
  if (['exhibitions', 'contact'].includes(page)) return { view: page, page, arg, key: page };
  return { view: 'home', page: 'home', arg: undefined, key: 'home' };
}

/* 같은 화면으로 다시 오면 스크롤 위치를 돌려준다 */
export function startRouter(onRoute, getAboutLang) {
  const scrollMem = {};
  let curKey = null;
  const run = () => {
    if (location.hash.startsWith('#/')) history.replaceState(null, '', location.hash.slice(1).replace(/\/?$/, '/'));
    const r = parseRoute(location.pathname, getAboutLang());
    if (r.key === curKey) return;
    if (curKey) scrollMem[curKey] = scrollY;
    curKey = r.key;
    onRoute(r);
    requestAnimationFrame(() => scrollTo(0, scrollMem[r.key] || 0));
  };
  addEventListener('hashchange', run);
  addEventListener('popstate', run);
  /* 사이트 안 링크는 새로 불러오지 않고 화면만 바꾼다 */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="/"]');
    if (!a || a.target || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.pathname.startsWith('/admin')) return;
    e.preventDefault();
    if (a.pathname !== location.pathname) history.pushState(null, '', a.pathname);
    run();
  });
  run();
}
