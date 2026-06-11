// Card database — warrior class (철갑 전사)
// v.base / v.up hold the numeric values per upgrade level.
// special: handled by the combat engine.

let UID = 1;

export const CARDS = {
  // ===== 기본 (Starter) =====
  strike: {
    name: '타격', type: 'attack', rarity: 'starter', target: 'one',
    v: { base: { cost: 1, dmg: 6 }, up: { cost: 1, dmg: 9 } },
    text: '피해를 {dmg} 줍니다.',
  },
  defend: {
    name: '수비', type: 'skill', rarity: 'starter', target: 'self',
    v: { base: { cost: 1, block: 5 }, up: { cost: 1, block: 8 } },
    text: '방어도를 {block} 얻습니다.',
  },
  bash: {
    name: '강타', type: 'attack', rarity: 'starter', target: 'one',
    v: { base: { cost: 2, dmg: 8, vuln: 2 }, up: { cost: 2, dmg: 10, vuln: 3 } },
    text: '피해를 {dmg} 줍니다. 취약을 {vuln} 부여합니다.',
  },

  // ===== 일반 (Common) =====
  anger: {
    name: '분노', type: 'attack', rarity: 'common', target: 'one', special: 'anger',
    v: { base: { cost: 0, dmg: 6 }, up: { cost: 0, dmg: 8 } },
    text: '피해를 {dmg} 줍니다. 이 카드의 복사본을 버린 카드 더미에 넣습니다.',
  },
  armaments: {
    name: '무기 연마', type: 'skill', rarity: 'common', target: 'self', special: 'armaments',
    v: { base: { cost: 1, block: 5 }, up: { cost: 1, block: 5 } },
    text: '방어도를 {block} 얻습니다. 손에 있는 카드를 {N}장 이번 전투 동안 강화합니다.',
  },
  bodySlam: {
    name: '몸통 박치기', type: 'attack', rarity: 'common', target: 'one', special: 'bodySlam',
    v: { base: { cost: 1 }, up: { cost: 0 } },
    text: '현재 방어도만큼 피해를 줍니다.',
  },
  cleave: {
    name: '휩쓸기', type: 'attack', rarity: 'common', target: 'all',
    v: { base: { cost: 1, dmg: 8 }, up: { cost: 1, dmg: 11 } },
    text: '모든 적에게 피해를 {dmg} 줍니다.',
  },
  clothesline: {
    name: '빨랫줄', type: 'attack', rarity: 'common', target: 'one',
    v: { base: { cost: 2, dmg: 12, weak: 2 }, up: { cost: 2, dmg: 14, weak: 3 } },
    text: '피해를 {dmg} 줍니다. 약화를 {weak} 부여합니다.',
  },
  ironWave: {
    name: '강철 파도', type: 'attack', rarity: 'common', target: 'one',
    v: { base: { cost: 1, dmg: 5, block: 5 }, up: { cost: 1, dmg: 7, block: 7 } },
    text: '방어도를 {block} 얻습니다. 피해를 {dmg} 줍니다.',
  },
  pommelStrike: {
    name: '폼멜 공격', type: 'attack', rarity: 'common', target: 'one',
    v: { base: { cost: 1, dmg: 9, draw: 1 }, up: { cost: 1, dmg: 10, draw: 2 } },
    text: '피해를 {dmg} 줍니다. 카드를 {draw}장 뽑습니다.',
  },
  shrugItOff: {
    name: '어깨 으쓱', type: 'skill', rarity: 'common', target: 'self',
    v: { base: { cost: 1, block: 8, draw: 1 }, up: { cost: 1, block: 11, draw: 1 } },
    text: '방어도를 {block} 얻습니다. 카드를 {draw}장 뽑습니다.',
  },
  twinStrike: {
    name: '쌍둥이 일격', type: 'attack', rarity: 'common', target: 'one',
    v: { base: { cost: 1, dmg: 5, hits: 2 }, up: { cost: 1, dmg: 7, hits: 2 } },
    text: '피해를 {dmg} 두 번 줍니다.',
  },
  swordBoomerang: {
    name: '검 부메랑', type: 'attack', rarity: 'common', target: 'random',
    v: { base: { cost: 1, dmg: 3, hits: 3 }, up: { cost: 1, dmg: 3, hits: 4 } },
    text: '무작위 적에게 피해를 {dmg} {hits}번 줍니다.',
  },
  heavyBlade: {
    name: '묵직한 칼날', type: 'attack', rarity: 'common', target: 'one', special: 'heavyBlade',
    v: { base: { cost: 2, dmg: 14, strMult: 3 }, up: { cost: 2, dmg: 14, strMult: 5 } },
    text: '피해를 {dmg} 줍니다. 힘이 이 카드에 {strMult}배 적용됩니다.',
  },
  flex: {
    name: '근육 과시', type: 'skill', rarity: 'common', target: 'self', special: 'flex',
    v: { base: { cost: 0, str: 2 }, up: { cost: 0, str: 4 } },
    text: '힘을 {str} 얻습니다. 턴 종료 시 힘을 {str} 잃습니다.',
  },
  thunderclap: {
    name: '천둥소리', type: 'attack', rarity: 'common', target: 'all',
    v: { base: { cost: 1, dmg: 4, vuln: 1 }, up: { cost: 1, dmg: 7, vuln: 1 } },
    text: '모든 적에게 피해를 {dmg} 주고 취약을 {vuln} 부여합니다.',
  },
  perfectedStrike: {
    name: '완벽한 일격', type: 'attack', rarity: 'common', target: 'one', special: 'perfectedStrike',
    v: { base: { cost: 2, dmg: 6, perStrike: 2 }, up: { cost: 2, dmg: 6, perStrike: 3 } },
    text: '피해를 {dmg} 줍니다. 덱에 있는 "타격" 카드 1장당 피해가 {perStrike} 증가합니다.',
  },

  // ===== 특별 (Uncommon) =====
  battleTrance: {
    name: '전투 무아지경', type: 'skill', rarity: 'uncommon', target: 'self', special: 'battleTrance',
    v: { base: { cost: 0, draw: 3 }, up: { cost: 0, draw: 4 } },
    text: '카드를 {draw}장 뽑습니다. 이번 턴에 카드를 더 뽑을 수 없습니다.',
  },
  carnage: {
    name: '대학살', type: 'attack', rarity: 'uncommon', target: 'one', ethereal: true,
    v: { base: { cost: 2, dmg: 20 }, up: { cost: 2, dmg: 28 } },
    text: '휘발성. 피해를 {dmg} 줍니다.',
  },
  disarm: {
    name: '무장 해제', type: 'skill', rarity: 'uncommon', target: 'one', exhaust: true, special: 'disarm',
    v: { base: { cost: 1, strDown: 2 }, up: { cost: 1, strDown: 3 } },
    text: '적의 힘을 {strDown} 감소시킵니다. 소멸.',
  },
  feelNoPain: {
    name: '고통 무시', type: 'power', rarity: 'uncommon', target: 'self', special: 'feelNoPain',
    v: { base: { cost: 1, n: 3 }, up: { cost: 1, n: 4 } },
    text: '카드가 소멸할 때마다 방어도를 {n} 얻습니다.',
  },
  inflame: {
    name: '타오르는 투지', type: 'power', rarity: 'uncommon', target: 'self', special: 'inflame',
    v: { base: { cost: 1, str: 2 }, up: { cost: 1, str: 3 } },
    text: '힘을 {str} 얻습니다.',
  },
  metallicize: {
    name: '금속화', type: 'power', rarity: 'uncommon', target: 'self', special: 'metallicize',
    v: { base: { cost: 1, n: 3 }, up: { cost: 1, n: 4 } },
    text: '턴이 끝날 때마다 방어도를 {n} 얻습니다.',
  },
  uppercut: {
    name: '어퍼컷', type: 'attack', rarity: 'uncommon', target: 'one',
    v: { base: { cost: 2, dmg: 13, weak: 1, vuln: 1 }, up: { cost: 2, dmg: 13, weak: 2, vuln: 2 } },
    text: '피해를 {dmg} 줍니다. 약화를 {weak}, 취약을 {vuln} 부여합니다.',
  },
  whirlwind: {
    name: '회오리바람', type: 'attack', rarity: 'uncommon', target: 'all', special: 'whirlwind',
    v: { base: { cost: 'X', dmg: 5 }, up: { cost: 'X', dmg: 8 } },
    text: '모든 적에게 피해를 {dmg} X번 줍니다.',
  },
  ghostlyArmor: {
    name: '유령 갑옷', type: 'skill', rarity: 'uncommon', target: 'self', ethereal: true,
    v: { base: { cost: 1, block: 10 }, up: { cost: 1, block: 13 } },
    text: '휘발성. 방어도를 {block} 얻습니다.',
  },

  // ===== 희귀 (Rare) =====
  bludgeon: {
    name: '대형 철퇴', type: 'attack', rarity: 'rare', target: 'one',
    v: { base: { cost: 3, dmg: 32 }, up: { cost: 3, dmg: 42 } },
    text: '피해를 {dmg} 줍니다.',
  },
  demonForm: {
    name: '악마의 형상', type: 'power', rarity: 'rare', target: 'self', special: 'demonForm',
    v: { base: { cost: 3, n: 2 }, up: { cost: 3, n: 3 } },
    text: '매 턴 시작 시 힘을 {n} 얻습니다.',
  },
  impervious: {
    name: '철벽 방어', type: 'skill', rarity: 'rare', target: 'self', exhaust: true,
    v: { base: { cost: 2, block: 30 }, up: { cost: 2, block: 40 } },
    text: '방어도를 {block} 얻습니다. 소멸.',
  },
  offering: {
    name: '피의 제물', type: 'skill', rarity: 'rare', target: 'self', exhaust: true, special: 'offering',
    v: { base: { cost: 0, hpCost: 6, energy: 2, draw: 3 }, up: { cost: 0, hpCost: 6, energy: 2, draw: 5 } },
    text: '체력을 {hpCost} 잃습니다. 에너지를 {energy} 얻고 카드를 {draw}장 뽑습니다. 소멸.',
  },
  reaper: {
    name: '수확자', type: 'attack', rarity: 'rare', target: 'all', exhaust: true, special: 'reaper',
    v: { base: { cost: 2, dmg: 4 }, up: { cost: 2, dmg: 5 } },
    text: '모든 적에게 피해를 {dmg} 줍니다. 입힌 피해만큼 체력을 회복합니다. 소멸.',
  },
  limitBreak: {
    name: '한계 돌파', type: 'skill', rarity: 'rare', target: 'self', special: 'limitBreak',
    v: { base: { cost: 1, exhaust: 1 }, up: { cost: 1, exhaust: 0 } },
    text: '힘을 두 배로 만듭니다.{exhaustText}',
  },

  // ===== 상태이상 (Status) =====
  burn: {
    name: '화상', type: 'status', rarity: 'none', target: 'none', unplayable: true, special: 'burn',
    v: { base: { n: 2 }, up: { n: 4 } },
    text: '사용 불가. 턴 종료 시 손에 있으면 피해를 {n} 받습니다.',
  },
  wound: {
    name: '상처', type: 'status', rarity: 'none', target: 'none', unplayable: true,
    v: { base: {}, up: {} },
    text: '사용 불가.',
  },
  slimed: {
    name: '점액', type: 'status', rarity: 'none', target: 'self', exhaust: true,
    v: { base: { cost: 1 }, up: { cost: 1 } },
    text: '소멸.',
  },
  dazed: {
    name: '몽롱함', type: 'status', rarity: 'none', target: 'none', unplayable: true, ethereal: true,
    v: { base: {}, up: {} },
    text: '사용 불가. 휘발성.',
  },

  // ===== 저주 (Curse) =====
  doubt: {
    name: '무력감', type: 'curse', rarity: 'none', target: 'none', unplayable: true,
    v: { base: {}, up: {} },
    text: '사용 불가. 덱에서 제거하기 전까지 자리만 차지합니다.',
  },
};

for (const [id, def] of Object.entries(CARDS)) def.id = id;

export const CARD_POOL = {
  common: Object.keys(CARDS).filter((id) => CARDS[id].rarity === 'common'),
  uncommon: Object.keys(CARDS).filter((id) => CARDS[id].rarity === 'uncommon'),
  rare: Object.keys(CARDS).filter((id) => CARDS[id].rarity === 'rare'),
};

export function makeCard(id, upgraded = false) {
  if (!CARDS[id]) throw new Error('unknown card: ' + id);
  return { uid: UID++, id, upgraded };
}

// after loading a save, push the uid counter past any loaded card uid
export function bumpUid(n) {
  if (n >= UID) UID = n + 1;
}

// Merged view of a card instance at its upgrade level
export function cardData(card) {
  const def = CARDS[card.id];
  const v = card.upgraded ? { ...def.v.base, ...def.v.up } : def.v.base;
  return {
    ...def, ...v,
    uid: card.uid, upgraded: card.upgraded,
    displayName: def.name + (card.upgraded ? '+' : ''),
  };
}

export function starterDeck() {
  const deck = [];
  for (let i = 0; i < 5; i++) deck.push(makeCard('strike'));
  for (let i = 0; i < 4; i++) deck.push(makeCard('defend'));
  deck.push(makeCard('bash'));
  return deck;
}

// rarity weights: monster 60/37/3, elite 50/40/10, boss rare only, shop handled separately
export function rollRewardCards(rng, source = 'monster', count = 3) {
  const out = [];
  const seen = new Set();
  let guard = 0;
  while (out.length < count && guard++ < 200) {
    let pool;
    if (source === 'boss') pool = CARD_POOL.rare;
    else {
      const r = rng();
      if (source === 'elite') pool = r < 0.10 ? CARD_POOL.rare : r < 0.50 ? CARD_POOL.uncommon : CARD_POOL.common;
      else pool = r < 0.03 ? CARD_POOL.rare : r < 0.40 ? CARD_POOL.uncommon : CARD_POOL.common;
    }
    const id = pool[Math.floor(rng() * pool.length)];
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(makeCard(id));
  }
  return out;
}
