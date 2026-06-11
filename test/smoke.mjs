// Headless engine smoke test — run with: node test/smoke.mjs
import { mulberry32 } from '../js/rng.js';
import { CARDS, CARD_POOL, makeCard, starterDeck, cardData, rollRewardCards } from '../js/data/cards.js';
import { ENEMIES, makeEnemy, rollEncounter, rollBoss, bossEncounterIds, ACTS, FINAL_ACT } from '../js/data/enemies.js';
import { RELICS, rollRelic } from '../js/data/relics.js';
import { POTIONS, rollPotion } from '../js/data/potions.js';
import { EVENTS } from '../js/data/events.js';
import { generateMap, reachable, ROWS } from '../js/map.js';
import {
  createCombat, startCombat, playCard, endPlayerTurn, enemyTurnStep, finishEnemyPhase,
  canPlay, attackDamage, usePotionInCombat, renderCardText, hitEnemy,
} from '../js/combat.js';

let failures = 0;
const ok = (cond, msg) => {
  if (!cond) { failures++; console.error('  ✗ FAIL:', msg); }
};
const section = (name) => console.log('\n=== ' + name + ' ===');

function freshRun(extraCards = [], act = 1) {
  return {
    act,
    hp: 80, maxHp: 80, gold: 99,
    deck: [...starterDeck(), ...extraCards.map((id) => makeCard(id))],
    relics: ['burningBlood'],
    potions: ['firePotion', 'blockPotion', null],
    counters: { penNib: 0 },
    monstersSlain: 0, elitesSlain: 0, bossesSlain: 0,
  };
}

// ============ 1. data integrity ============
section('card data');
for (const [id, def] of Object.entries(CARDS)) {
  ok(def.name && def.type && def.v && def.v.base, `card ${id} structure`);
  const card = makeCard(id);
  const d = cardData(card);
  ok(d.displayName === def.name, `cardData name ${id}`);
  const text = renderCardText(card);
  ok(!text.includes('{'), `card text tokens resolved for ${id}: "${text}"`);
  const up = makeCard(id, true);
  const upText = renderCardText(up);
  ok(!upText.includes('{'), `upgraded text tokens resolved for ${id}`);
}
ok(CARD_POOL.common.length >= 10, 'common pool size');
ok(CARD_POOL.uncommon.length >= 6, 'uncommon pool size');
ok(CARD_POOL.rare.length >= 5, 'rare pool size');
const rng0 = mulberry32(42);
for (const src of ['monster', 'elite', 'boss']) {
  const cards = rollRewardCards(rng0, src);
  ok(cards.length === 3, `reward cards x3 (${src})`);
}
console.log(`  ${Object.keys(CARDS).length} cards OK`);

section('enemy/relic/potion/event data');
for (const [id, def] of Object.entries(ENEMIES)) {
  ok(Array.isArray(def.hp) && def.hp[0] <= def.hp[1], `enemy hp range ${id}`);
  ok(typeof def.ai === 'function', `enemy ai ${id}`);
  ok(['small', 'medium', 'large', 'boss'].includes(def.size), `enemy size ${id}`);
}
for (const [id, r] of Object.entries(RELICS)) ok(r.name && r.desc && r.icon, `relic ${id}`);
for (const [id, p] of Object.entries(POTIONS)) ok(p.name && p.desc, `potion ${id}`);
for (const ev of EVENTS) ok(ev.title && ev.options.length >= 2, `event ${ev.id}`);
// 모든 막 구성이 유효한 적 id만 참조하는지
const rngE = mulberry32(7);
for (const act of [1, 2, 3]) {
  for (const kind of ['easy', 'hard', 'elite']) {
    for (let i = 0; i < 40; i++) {
      const enc = rollEncounter(rngE, kind, [], act);
      for (const id of enc.ids) ok(ENEMIES[id], `act${act} ${kind} encounter '${enc.key}' → unknown enemy '${id}'`);
    }
  }
  for (const bossKey of ACTS[act].boss) {
    for (const id of bossEncounterIds(bossKey, rngE)) ok(ENEMIES[id], `act${act} boss '${bossKey}' → unknown enemy '${id}'`);
  }
}
console.log(`  ${Object.keys(ENEMIES).length} enemies, ${Object.keys(RELICS).length} relics OK`);

// ============ 2. map generation ============
section('map generation (300 seeds)');
for (let seed = 1; seed <= 300; seed++) {
  const map = generateMap(mulberry32(seed));
  for (let row = 0; row < ROWS; row++) {
    const nodes = Object.values(map.grid[row]);
    ok(nodes.length >= 1, `seed ${seed} row ${row} has nodes`);
    for (const n of nodes) {
      ok(n.type, `seed ${seed} node typed`);
      if (row < ROWS - 1) {
        ok(n.next.length >= 1, `seed ${seed} node (${row},${n.col}) has next`);
        for (const nc of n.next) ok(map.grid[row + 1][nc], `seed ${seed} edge target exists (${row},${n.col})→${nc}`);
      }
    }
  }
  ok(Object.values(map.grid[0]).every((n) => n.type === 'monster'), `seed ${seed} floor1 monsters`);
  ok(Object.values(map.grid[8]).every((n) => n.type === 'treasure'), `seed ${seed} floor9 treasure`);
  ok(Object.values(map.grid[14]).every((n) => n.type === 'rest'), `seed ${seed} floor15 rest`);
  let frontier = Object.values(map.grid[0]);
  for (let row = 0; row < ROWS - 1; row++) {
    const next = new Set();
    for (const n of frontier) for (const nc of n.next) next.add(map.grid[row + 1][nc]);
    frontier = [...next];
    ok(frontier.length >= 1, `seed ${seed} reachability row ${row + 1}`);
  }
}
console.log('  300 maps OK');

// ============ 3. damage math ============
section('damage math');
ok(attackDamage(6, {}, {}) === 6, 'base 6');
ok(attackDamage(6, { str: 2 }, {}) === 8, 'str');
ok(attackDamage(9, {}, { vuln: 1 }) === 13, 'vulnerable 9→13 (floor)');
ok(attackDamage(6, { weak: 1 }, {}) === 4, 'weak 6→4 (floor)');
ok(attackDamage(1, { weak: 1 }, {}) === 0, 'weak 1→0');

// ============ 4. mechanic-specific checks ============
section('mechanics');
{
  const run = freshRun();
  const c = createCombat(run, ['guardian'], mulberry32(7), 'boss');
  startCombat(c);
  const g = c.enemies[0];
  hitEnemy(c, g, 35);
  ok(g.mode === 'def', 'guardian shifts to defensive');
  ok(g.block >= 20, 'guardian gains 20 block on shift');
  ok(g.intent && g.intent.key === 'defMode', 'guardian intent interrupted');
}
{
  const run = freshRun();
  const c = createCombat(run, ['acidSlimeL'], mulberry32(9), 'monster');
  startCombat(c);
  const s = c.enemies[0];
  hitEnemy(c, s, Math.ceil(s.maxHp * 0.6));
  const strike = c.hand.find((cd) => cd.id === 'strike') || c.hand[0];
  playCard(c, strike, c.enemies.find((e) => !e.gone && e.hp > 0)?.uid);
  const mediums = c.enemies.filter((e) => e.id === 'acidSlimeM' && !e.gone);
  ok(mediums.length === 2, `acid slime L split into 2 M (got ${mediums.length})`);
}
{
  const run = freshRun();
  const c = createCombat(run, ['sentry'], mulberry32(11), 'elite');
  startCombat(c);
  const s = c.enemies[0];
  c.applyEnemyDebuff(s, 'vuln', 2);
  ok(!s.statuses.vuln && !s.statuses.artifact, 'artifact consumed, vuln blocked');
  c.applyEnemyDebuff(s, 'vuln', 2);
  ok(s.statuses.vuln === 2, 'second debuff lands');
}
{
  const run = freshRun();
  const c = createCombat(run, ['lagavulin'], mulberry32(13), 'elite');
  startCombat(c);
  const l = c.enemies[0];
  ok(l.statuses.asleep === 1, 'lagavulin starts asleep');
  hitEnemy(c, l, 10);
  ok(!l.statuses.asleep && l.stunned, 'lagavulin wakes stunned');
}
{
  const run = freshRun();
  const c = createCombat(run, ['cultist'], mulberry32(17), 'monster');
  startCombat(c);
  c.hand.push(makeCard('burn'));
  const hpBefore = c.player.hp;
  c.player.block = 0;
  endPlayerTurn(c);
  ok(c.player.hp === hpBefore - 2, `burn deals 2 (was ${hpBefore}, now ${c.player.hp})`);
}
{
  const run = freshRun();
  const c = createCombat(run, ['acidSlimeS'], mulberry32(19), 'monster');
  startCombat(c);
  usePotionInCombat(c, 0, c.enemies[0].uid);
  ok(c.over === 'win', 'fire potion kills small slime → win');
  ok(run.potions[0] === null, 'potion consumed');
}
{
  const run = freshRun(['whirlwind']);
  const c = createCombat(run, ['jawWorm'], mulberry32(23), 'monster');
  startCombat(c);
  const ww = [...c.hand, ...c.drawPile].find((cd) => cd.id === 'whirlwind');
  c.hand.includes(ww) || (c.hand.push(c.drawPile.splice(c.drawPile.indexOf(ww), 1)[0]));
  const hpBefore = c.enemies[0].hp;
  playCard(c, ww, null);
  ok(c.player.energy === 0, 'whirlwind consumes all energy');
  ok(hpBefore - c.enemies[0].hp === 15, `whirlwind X=3 deals 15 (dealt ${hpBefore - c.enemies[0].hp})`);
}
// ===== 신규 메커니즘 (2·3막) =====
{
  // 무형: 피해가 1로 감소
  const run = freshRun();
  const c = createCombat(run, ['nemesis'], mulberry32(29), 'elite');
  startCombat(c);
  const n = c.enemies[0];
  ok(n.statuses.intangible >= 1, 'nemesis starts intangible');
  const hpBefore = n.hp;
  hitEnemy(c, n, 30);
  ok(hpBefore - n.hp === 1, `intangible caps damage at 1 (lost ${hpBefore - n.hp})`);
}
{
  // 방벽: 적 방어도 유지
  const run = freshRun();
  const c = createCombat(run, ['sphericGuardian'], mulberry32(31), 'monster');
  startCombat(c);
  const s = c.enemies[0];
  ok(s.block >= 40, `spheric guardian starts with block (${s.block})`);
  endPlayerTurn(c);
  while (enemyTurnStep(c)) { /* drain */ }
  finishEnemyPhase(c);
  ok(s.block > 0, 'barricade keeps enemy block across turns');
}
{
  // 부활: 각성자 2페이즈
  const run = freshRun();
  const c = createCombat(run, ['awakenedOne'], mulberry32(37), 'boss');
  startCombat(c);
  const a = c.enemies[0];
  hitEnemy(c, a, 9999);
  ok(a.hp === a.maxHp && a.phase === 2 && !c.over, 'awakened one revives at full hp (phase 2)');
  hitEnemy(c, a, 9999);
  ok(c.over === 'win', 'awakened one dies for real in phase 2');
}
{
  // 소환: 청동 자동인형 구체 사출
  const run = freshRun();
  const c = createCombat(run, ['bronzeAutomaton'], mulberry32(41), 'boss');
  startCombat(c);
  endPlayerTurn(c);
  while (enemyTurnStep(c)) { /* drain */ }
  finishEnemyPhase(c);
  const orbs = c.enemies.filter((e) => e.id === 'bronzeOrb' && e.hp > 0);
  ok(orbs.length === 2, `automaton spawns 2 orbs (got ${orbs.length})`);
}
{
  // 일렁이는 형상: 5턴 후 도주 → 승리
  const run = freshRun();
  const c = createCombat(run, ['transient'], mulberry32(43), 'monster');
  startCombat(c);
  let guard = 0;
  while (!c.over && guard++ < 10) {
    endPlayerTurn(c);
    while (enemyTurnStep(c)) { /* drain */ }
    if (!c.over) finishEnemyPhase(c);
  }
  ok(c.over === 'win' || c.over === 'lose', `transient combat ends (${c.over}, ${guard} turns)`);
  if (c.over === 'win') ok(c.enemies[0].gone, 'transient escaped');
}
{
  // 시간 포식자: 절반 이하 → 절반까지 회복 (1회)
  const run = freshRun();
  const c = createCombat(run, ['timeEater'], mulberry32(47), 'boss');
  startCombat(c);
  const t = c.enemies[0];
  hitEnemy(c, t, Math.ceil(t.maxHp * 0.7));
  c.refreshIntent(t);
  ok(t.intent.key === 'haste', 'time eater intends to heal below 50%');
  t.intent.apply(c, t);
  ok(t.hp === Math.floor(t.maxHp / 2), `time eater heals to half (${t.hp}/${t.maxHp})`);
}

// ============ 5. full random-play combat simulations (전 막) ============
section('combat simulations (acts 1-3)');
let sims = 0, wins = 0, losses = 0, timeouts = 0;
for (const act of [1, 2, 3]) {
  const keys = [...ACTS[act].easy, ...ACTS[act].hard, ...ACTS[act].elite, ...ACTS[act].boss];
  for (const key of [...new Set(keys)]) {
    for (let seed = 1; seed <= 20; seed++) {
      const rng = mulberry32(seed * 1000 + key.length * 17 + act);
      const ids = bossEncounterIds(key, rng);
      const run = freshRun(['cleave', 'inflame', 'metallicize', 'pommelStrike', 'carnage', 'bludgeon', 'impervious'], act);
      const c = createCombat(run, ids, rng, 'monster');
      try {
        startCombat(c);
        let guard = 0;
        while (!c.over && guard++ < 80) {
          let plays = 0;
          while (plays++ < 15) {
            const playable = c.hand.filter((cd) => canPlay(c, cd));
            if (!playable.length || rng() < 0.12) break;
            const card = playable[Math.floor(rng() * playable.length)];
            const alive = c.aliveEnemies();
            const target = alive.length ? alive[Math.floor(rng() * alive.length)].uid : null;
            playCard(c, card, target);
            if (c.over) break;
          }
          if (c.over) break;
          endPlayerTurn(c);
          while (enemyTurnStep(c)) { /* drain */ }
          if (!c.over) finishEnemyPhase(c);
          ok(c.player.hp >= 0 && c.player.hp <= c.player.maxHp, `hp bounds (${key} act${act} seed ${seed})`);
          for (const e of c.enemies) ok(e.hp >= 0 && e.hp <= e.maxHp, `enemy hp bounds (${key} ${e.id})`);
        }
        sims++;
        if (c.over === 'win') wins++;
        else if (c.over === 'lose') losses++;
        else timeouts++;
      } catch (err) {
        failures++;
        console.error(`  ✗ EXCEPTION in ${key} (act${act}) seed ${seed}:`, err.message, err.stack.split('\n')[1]);
      }
    }
  }
}
console.log(`  ${sims} sims — ${wins} wins / ${losses} losses / ${timeouts} timeouts`);
ok(timeouts < sims * 0.12, `few timeouts (${timeouts})`);
ok(wins > 0 && losses > 0, 'both outcomes occur');

// ============ 6. 3막 통과 가능성 (전체 런 플로우) ============
section('full-run flow (act 1 → 3 → ending path)');
{
  const rng = mulberry32(99);
  const run = freshRun(['bludgeon', 'demonForm', 'impervious', 'inflame', 'metallicize'], 1);
  run.hp = run.maxHp = 5000; // 플로우 검증용 (밸런스 아님)
  let endingReached = false;
  try {
    for (let act = 1; act <= FINAL_ACT; act++) {
      run.act = act;
      // 일반 2회 + 정예 1회 + 보스 1회
      const fights = [
        rollEncounter(rng, 'easy', [], act).ids,
        rollEncounter(rng, 'hard', [], act).ids,
        rollEncounter(rng, 'elite', [], act).ids,
        bossEncounterIds(rollBoss(rng, act), rng),
      ];
      for (const ids of fights) {
        const c = createCombat(run, ids, rng, 'monster');
        startCombat(c);
        let guard = 0;
        while (!c.over && guard++ < 300) {
          let plays = 0;
          while (plays++ < 20) {
            const playable = c.hand.filter((cd) => canPlay(c, cd));
            if (!playable.length) break;
            // 공격 우선 + 본체(최대 체력이 가장 큰 적) 집중 봇
            const atk = playable.filter((cd) => cardData(cd).type === 'attack');
            const card = (atk.length ? atk : playable)[0];
            const alive = [...c.aliveEnemies()].sort((a, b) => b.maxHp - a.maxHp);
            playCard(c, card, alive[0]?.uid);
            if (c.over) break;
          }
          if (c.over) break;
          endPlayerTurn(c);
          while (enemyTurnStep(c)) { /* drain */ }
          if (!c.over) finishEnemyPhase(c);
        }
        ok(c.over === 'win', `flow fight won (act ${act}, ${ids.join(',')}) → ${c.over}`);
        run.hp = run.maxHp; // 플로우 검증: 전투 간 회복
        // 보상: 카드 1장 추가
        run.deck.push(rollRewardCards(rng, 'monster')[0]);
      }
    }
    endingReached = true;
  } catch (err) {
    failures++;
    console.error('  ✗ EXCEPTION in full-run flow:', err.message, err.stack.split('\n')[1]);
  }
  ok(endingReached, 'reached ending after act 3 boss');
}

// ============ result ============
console.log('\n' + (failures === 0 ? '✅ ALL SMOKE TESTS PASSED' : `❌ ${failures} FAILURES`));
process.exit(failures === 0 ? 0 : 1);
