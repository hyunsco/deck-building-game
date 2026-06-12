// Relic database — effects are implemented in the combat engine / run logic by id.
export const RELICS = {
  burningBlood: { name: '끓는 피', icon: '🩸', rarity: 'starter', desc: '전투 종료 시 체력을 6 회복합니다.' },
  bagOfMarbles: { name: '구슬 주머니', icon: '🔮', rarity: 'common', desc: '전투 시작 시 모든 적에게 취약을 1 부여합니다.' },
  anchor: { name: '닻', icon: '⚓', rarity: 'common', desc: '전투 시작 시 방어도를 10 얻습니다.' },
  lantern: { name: '등불', icon: '🏮', rarity: 'common', desc: '매 전투 첫 턴에 에너지를 1 추가로 얻습니다.' },
  orichalcum: { name: '오리칼쿰', icon: '🪙', rarity: 'common', desc: '방어도가 없는 채로 턴을 마치면 방어도를 6 얻습니다.' },
  bronzeScales: { name: '청동 비늘', icon: '🐉', rarity: 'common', desc: '전투 시작 시 가시를 3 얻습니다. (공격당하면 공격자에게 피해 3)' },
  vajra: { name: '바즈라', icon: '⚡', rarity: 'common', desc: '전투 시작 시 힘을 1 얻습니다.' },
  smoothStone: { name: '매끈한 돌', icon: '🥌', rarity: 'common', desc: '전투 시작 시 민첩을 1 얻습니다.' },
  bagOfPrep: { name: '준비된 가방', icon: '🎒', rarity: 'common', desc: '전투 첫 턴에 카드를 2장 추가로 뽑습니다.' },
  bloodVial: { name: '피의 약병', icon: '🧪', rarity: 'common', desc: '전투 시작 시 체력을 2 회복합니다.' },
  penNib: { name: '명필의 펜촉', icon: '🖋️', rarity: 'common', desc: '공격 카드를 10번 사용할 때마다 그 공격의 피해가 2배가 됩니다.' },
  kunai: { name: '쿠나이', icon: '🗡️', rarity: 'uncommon', desc: '한 턴에 공격 카드를 3장 사용할 때마다 민첩을 1 얻습니다.' },
  strawberry: { name: '산딸기', icon: '🍓', rarity: 'common', desc: '획득 시 최대 체력이 7 증가합니다.', onPickup: 'maxHp7' },
  meatBone: { name: '뼈다귀 고기', icon: '🍖', rarity: 'uncommon', desc: '전투 종료 시 체력이 50% 이하면 체력을 12 회복합니다.' },
  hornCleat: { name: '뿔 장식', icon: '📯', rarity: 'uncommon', desc: '매 전투 두 번째 턴 시작 시 방어도를 14 얻습니다.' },
  toxicEgg: { name: '이상한 알', icon: '🥚', rarity: 'uncommon', desc: '획득하는 일반/특별 카드가 강화된 상태로 들어옵니다.' },
  // ===== 확장 유물 =====
  redMask: { name: '붉은 가면', icon: '👹', rarity: 'common', desc: '전투 시작 시 모든 적에게 약화를 1 부여합니다.' },
  thornArmor: { name: '가시 덩굴', icon: '🌵', rarity: 'common', desc: '전투 시작 시 가시를 2 얻습니다.' },
  hourglass: { name: '모래시계', icon: '⏳', rarity: 'uncommon', desc: '매 턴 시작 시 방어도를 3 얻습니다.' },
  monocle: { name: '외알 안경', icon: '🧐', rarity: 'common', desc: '전투 첫 턴에 카드를 1장 추가로 뽑습니다.' },
  guardBanner: { name: '수호의 깃발', icon: '🚩', rarity: 'uncommon', desc: '정예·보스 전투 시작 시 방어도를 12 얻습니다.' },
  goldenDice: { name: '황금 주사위', icon: '🎲', rarity: 'uncommon', desc: '전투 보상 금화가 40% 증가합니다.' },
  herbPouch: { name: '약초 주머니', icon: '🌿', rarity: 'common', desc: '전투 후 물약을 얻을 확률이 15%p 증가합니다.' },
  whetstone: { name: '숫돌', icon: '🪨', rarity: 'common', desc: '획득 시 타격 계열 카드 2장을 강화합니다.', onPickup: 'upgradeStrikes' },
  heavyCloak: { name: '묵직한 망토', icon: '🧥', rarity: 'uncommon', desc: '획득 시 최대 체력이 10 증가합니다.', onPickup: 'maxHp10' },
  crackedCore: { name: '균열된 핵', icon: '🔆', rarity: 'rare', desc: '매 턴 에너지를 1 추가로 얻습니다.' },
};

for (const [id, def] of Object.entries(RELICS)) def.id = id;

export const RELIC_POOL = Object.keys(RELICS).filter((id) => id !== 'burningBlood');

export function rollRelic(rng, owned) {
  const avail = RELIC_POOL.filter((id) => !owned.includes(id));
  if (!avail.length) return null;
  return avail[Math.floor(rng() * avail.length)];
}
