/* 화면 이름표. 작품 분류를 늘리려면 CATS에 한 줄, admin/config.yml 과 content/site.json 에 같은 id를 더한다. */

export const CATS = [
  { id: 'objects', label: 'Objects' },
  { id: 'hap',     label: 'Hap Series' },
  { id: 'tangram', label: 'Tangram Series' }
];

export const TYPE_EN = { '개인전': 'Solo Exhibition', '단체전': 'Group Exhibition', '아트페어': 'Art Fair' };

export const CV_LABELS = {
  ko: { note: '작가노트', solo: '개인전', group: '단체전', awards: '수상' },
  en: { note: 'Artist Note', solo: 'Solo Exhibitions', group: 'Group Exhibitions', awards: 'Award' }
};
