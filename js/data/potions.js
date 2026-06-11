// Potion database. combatOnly potions can only be used during combat.
// use(c, target) runs inside combat; outside combat only non-combatOnly potions work (handled in game.js).
export const POTIONS = {
  firePotion: { name: '화염 물약', color: '#ff5a2a', combatOnly: true, target: 'one', desc: '적 하나에게 피해를 20 줍니다.' },
  blockPotion: { name: '방어 물약', color: '#6fa8c9', combatOnly: true, target: 'none', desc: '방어도를 12 얻습니다.' },
  strengthPotion: { name: '힘의 물약', color: '#c0392b', combatOnly: true, target: 'none', desc: '힘을 2 얻습니다.' },
  dexterityPotion: { name: '민첩의 물약', color: '#3f9b4f', combatOnly: true, target: 'none', desc: '민첩을 2 얻습니다.' },
  energyPotion: { name: '에너지 물약', color: '#ffcf6b', combatOnly: true, target: 'none', desc: '에너지를 2 얻습니다.' },
  swiftPotion: { name: '신속의 물약', color: '#5fb6c9', combatOnly: true, target: 'none', desc: '카드를 3장 뽑습니다.' },
  weakPotion: { name: '약화의 병', color: '#7da832', combatOnly: true, target: 'one', desc: '적 하나에게 약화를 3 부여합니다.' },
  fearPotion: { name: '공포의 병', color: '#8a5fb0', combatOnly: true, target: 'one', desc: '적 하나에게 취약을 3 부여합니다.' },
  bloodPotion: { name: '피의 물약', color: '#a01f1f', combatOnly: false, target: 'none', desc: '최대 체력의 20%를 회복합니다.' },
  explosivePotion: { name: '폭발 물약', color: '#e8762a', combatOnly: true, target: 'none', desc: '모든 적에게 피해를 10 줍니다.' },
};

for (const [id, def] of Object.entries(POTIONS)) def.id = id;

const POOL = Object.keys(POTIONS);

export function rollPotion(rng) {
  return POOL[Math.floor(rng() * POOL.length)];
}
