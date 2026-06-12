// Event database — original scenarios for the "?" rooms.
// Option effect descriptors are interpreted by game.js:
//   gold, hp, maxHp, healPct, relic:'random', potion:'random', cardReward:'common',
//   curse:'doubt', pickRemove, pickUpgrade, gamble:{cost, win, p}, leave
export const EVENTS = [
  {
    id: 'supplies',
    title: '버려진 보급 상자',
    art: '📦',
    text: '무너진 야영지 한가운데, 먼지 쌓인 보급 상자가 놓여 있습니다. 누군가 급히 떠난 듯합니다.',
    options: [
      { label: '뒤져본다', sub: '금화 15 획득, 무작위 물약 획득', effect: { gold: 15, potion: 'random' } },
      { label: '바닥까지 살펴본다', sub: '일반 카드 보상 획득, 체력 4 손실', effect: { hp: -4, cardReward: 'monster' } },
      { label: '지나친다', sub: '아무 일도 일어나지 않는다', effect: { leave: true } },
    ],
  },
  {
    id: 'altar',
    title: '수상한 제단',
    art: '🕯️',
    text: '검붉은 촛불이 일렁이는 낡은 제단입니다. 표면에 마른 핏자국이 보입니다. 무언가를 바치라는 듯합니다.',
    options: [
      { label: '피를 바친다', sub: '체력 7 손실, 무작위 유물 획득', effect: { hp: -7, relic: 'random' } },
      { label: '기도만 한다', sub: '체력 5 회복', effect: { healPct: 0.0, hp: 5 } },
      { label: '떠난다', sub: '아무 일도 일어나지 않는다', effect: { leave: true } },
    ],
  },
  {
    id: 'smith',
    title: '떠돌이 대장장이',
    art: '⚒️',
    text: '첨탑을 떠도는 늙은 대장장이가 화로 앞에 앉아 있습니다. "칼을 봐 줄까, 아니면 짐을 덜어 줄까?"',
    options: [
      { label: '무기를 맡긴다', sub: '카드 1장 강화', effect: { pickUpgrade: true } },
      { label: '금화 50을 내고 짐을 던다', sub: '카드 1장 제거', cond: (run) => run.gold >= 50, effect: { gold: -50, pickRemove: true } },
      { label: '떠난다', sub: '아무 일도 일어나지 않는다', effect: { leave: true } },
    ],
  },
  {
    id: 'idol',
    title: '금빛 석상',
    art: '🗿',
    text: '받침대 위에 작은 금빛 석상이 놓여 있습니다. 너무나도 쉽게 손에 들어올 위치입니다. 어쩐지 불길합니다.',
    options: [
      { label: '석상을 챙긴다', sub: '금화 80 획득, 저주 카드 "무력감" 획득', effect: { gold: 80, curse: 'doubt' } },
      { label: '욕심을 버린다', sub: '최대 체력 4 증가', effect: { maxHp: 4 } },
    ],
  },
  {
    id: 'spring',
    title: '고대의 샘',
    art: '⛲',
    text: '바위 틈에서 맑은 물이 솟아납니다. 물에 비친 자신의 모습이 낯설게 느껴집니다.',
    options: [
      { label: '물을 마신다', sub: '최대 체력의 30% 회복', effect: { healPct: 0.3 } },
      { label: '기억을 흘려보낸다', sub: '카드 1장 제거', effect: { pickRemove: true } },
    ],
  },
  {
    id: 'gambler',
    title: '도박꾼 도깨비',
    art: '🎲',
    text: '한 도깨비가 뼈로 만든 주사위를 굴리며 씩 웃습니다. "한 판 어때? 운이 좋으면 두 배로 돌려주지."',
    options: [
      { label: '금화 30을 건다', sub: '50% 확률로 75 획득, 실패 시 잃음', cond: (run) => run.gold >= 30, effect: { gamble: { cost: 30, win: 75, p: 0.5 } } },
      { label: '거절한다', sub: '아무 일도 일어나지 않는다', effect: { leave: true } },
    ],
  },
  {
    id: 'mirrorPool',
    title: '거울 연못',
    art: '🪞',
    text: '수면이 거울처럼 매끄러운 연못입니다. 물에 비친 또 다른 당신이 손짓하며, 품 안의 카드 한 장을 가리킵니다.',
    options: [
      { label: '카드를 비춰본다', sub: '카드 1장을 복제하여 덱에 추가', effect: { pickDuplicate: true } },
      { label: '연못에 손을 담근다', sub: '체력 8 회복', effect: { hp: 8 } },
      { label: '떠난다', sub: '아무 일도 일어나지 않는다', effect: { leave: true } },
    ],
  },
  {
    id: 'herbalist',
    title: '떠돌이 약초상',
    art: '🌿',
    text: '약초 냄새가 진동하는 수레 곁에서 노파가 손을 흔듭니다. "싸게 줄게. 산을 오를 거면 챙겨 가."',
    options: [
      { label: '금화 30을 낸다', sub: '무작위 물약 2개 획득', cond: (run) => run.gold >= 30, effect: { gold: -30, potions: 2 } },
      { label: '찻잎만 얻어 마신다', sub: '체력 10 회복', effect: { hp: 10 } },
      { label: '떠난다', sub: '아무 일도 일어나지 않는다', effect: { leave: true } },
    ],
  },
  {
    id: 'grave',
    title: '이름 없는 무덤',
    art: '🪦',
    text: '봉분 위에 녹슨 검이 꽂혀 있습니다. 무덤 주인은 분명 부유한 전사였을 것입니다. 흙은 부드럽고, 아무도 보고 있지 않습니다.',
    options: [
      { label: '무덤을 판다', sub: '금화 65 획득, 저주 카드 "무력감" 획득', effect: { gold: 65, curse: 'doubt' } },
      { label: '명복을 빈다', sub: '체력 6 회복', effect: { hp: 6 } },
    ],
  },
  {
    id: 'echo',
    title: '첨탑의 메아리',
    art: '🌀',
    text: '벽의 갈라진 틈에서 낮은 울림이 새어 나옵니다. 귀를 기울이자, 그 소리가 당신의 심장 박동과 겹쳐집니다.',
    options: [
      { label: '울림을 받아들인다', sub: '최대 체력 +6', effect: { maxHp: 6 } },
      { label: '소리를 거슬러 외친다', sub: '카드 1장 제거', effect: { pickRemove: true } },
    ],
  },
  {
    id: 'library',
    title: '불타는 서고',
    art: '📚',
    text: '버려진 서고에 불이 번지고 있습니다. 선반 위에 아직 멀쩡한 전투 교본 몇 권이 보입니다. 시간이 없습니다.',
    options: [
      { label: '불길로 뛰어든다', sub: '체력 5 손실, 상급 카드 보상(3택1)', effect: { hp: -5, cardReward: 'elite' } },
      { label: '잿더미를 뒤진다', sub: '금화 20 획득', effect: { gold: 20 } },
      { label: '떠난다', sub: '아무 일도 일어나지 않는다', effect: { leave: true } },
    ],
  },
  {
    id: 'wheel',
    title: '운명의 수레바퀴',
    art: '🎡',
    text: '낡은 수레바퀴가 허공에 떠서 천천히 돌고 있습니다. 바퀴살마다 알 수 없는 문양이 새겨져 있습니다. 돌리면, 무언가는 반드시 일어납니다.',
    options: [
      { label: '바퀴를 돌린다', sub: '금화 +60 / 유물 / 체력 -10 중 하나 (무작위)', effect: { wheel: true } },
      { label: '지나친다', sub: '아무 일도 일어나지 않는다', effect: { leave: true } },
    ],
  },
];
