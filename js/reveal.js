/* 화면에 들어올 때 천천히 나타나기. .fi 를 붙인 요소에만 쓴다(스크립트가 없으면 CSS가 숨기지 않는다). */
const io = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' })
  : null;

export const reveal = root => root.querySelectorAll('.fi').forEach(el => io ? io.observe(el) : el.classList.add('in'));
