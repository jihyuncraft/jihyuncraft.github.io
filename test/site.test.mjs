// 실행: node --test test/site.test.mjs   (브라우저 없이 화면 규칙만 확인)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, paras, yearOf } from '../js/util.js';
import { parseRoute } from '../js/router.js';
import { sortExhibitions, filterExhibitions, interleave, coverOf, nextExhibition } from '../js/exhibitions.js';

test('글은 HTML로 해석하지 않고, 빈 줄은 문단이 된다', () => {
  assert.equal(esc('<b>"a"</b>'), '&lt;b&gt;&quot;a&quot;&lt;/b&gt;');
  assert.equal(paras('첫 줄\n둘째 줄\n\n새 문단'), '<p>첫 줄<br>둘째 줄</p><p>새 문단</p>');
});

test('주소 해석: 없는 분류는 Objects, 예전 news 주소는 전시로', () => {
  assert.deepEqual(parseRoute('#/works/hap'), { view: 'works', page: 'works', arg: 'hap', key: 'works/hap' });
  assert.equal(parseRoute('#/works/zzz').arg, 'objects');
  assert.equal(parseRoute('/works/tangram/').key, 'works/tangram');
  assert.equal(parseRoute('/exhibitions/2/').view, 'exhibition');
  assert.equal(parseRoute('/').view, 'home');
  assert.equal(parseRoute('#/news').view, 'exhibitions');
  assert.equal(parseRoute('#/exhibitions/2').view, 'exhibition');
  assert.equal(parseRoute('#/about', 'en').arg, 'en');
  assert.equal(parseRoute('#/없는화면').view, 'home');
  assert.equal(parseRoute('').view, 'home');
});

test('전시: 연도 최근순, 같은 해는 입력 순서, 대표 이미지 대체 순서', () => {
  const items = [{ title: 'a', period: '2022.11.30' }, { title: 'b', year: '2026' }, { title: 'c', year: '2026' }];
  assert.deepEqual(sortExhibitions(items).map(n => n.title), ['b', 'c', 'a']);
  assert.equal(yearOf(items[0]), '2022');
  assert.equal(coverOf({ photos: ['p1'], poster: 'po' }), 'p1');
  assert.equal(coverOf({ cover: 'c', photos: ['p1'] }), 'c');
  assert.equal(coverOf({ photos: [], poster: 'po' }), 'po');
  assert.equal(nextExhibition(items, 1).title, 'c');   // 목록 순서 b, c, a
  assert.equal(nextExhibition(items, 0).title, 'b');   // 끝에서는 처음으로
  assert.equal(nextExhibition([items[0]], 0), null);
  const mixed = sortExhibitions([{ title: 'g26', year: '2026', type: '단체전' }, { title: 's22', year: '2022', type: '개인전' }, { title: 'f25', year: '2025', type: '아트페어' }]);
  assert.deepEqual(mixed.map(n => n.title), ['s22', 'g26', 'f25']);   // 개인전 먼저, 그다음 최근 연도순
  assert.deepEqual(filterExhibitions(mixed, 'solo').map(n => n.title), ['s22']);
  assert.deepEqual(filterExhibitions(mixed, 'group').map(n => n.title), ['g26', 'f25']);
});

test('전시 상세: 전경 한 장마다 작품 두 개, 남은 작품은 끝에', () => {
  assert.deepEqual(interleave(['s1', 's2'], [1, 2, 3, 4, 5]),
    [{ shot: 's1' }, { pair: [1, 2] }, { shot: 's2' }, { pair: [3, 4] }, { pair: [5] }]);
  assert.deepEqual(interleave(['s1'], []), [{ shot: 's1' }]);
});

import { exLangs } from '../js/exhibitions.js';
test('전시 소개 글: 채워진 언어만, 한국어가 먼저', () => {
  assert.deepEqual(exLangs({ text: '가', textEn: 'a', textJa: '日' }).map(l => l.code), ['ko', 'en']);
  assert.deepEqual(exLangs({}), []);
});
