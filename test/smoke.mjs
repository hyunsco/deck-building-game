// Headless engine smoke test — run with: node test/smoke.mjs
import { mulberry32 } from '../js/rng.js';
import { CARDS, CARD_POOL, makeCard, starterDeck, cardData, rollRewardCards } from '../js/data/cards.js';
import { ENEMIES, makeEnemy, rollEncounter, BOSS_IDS } from '../js/data/enemies.js';
import { RELICS } from '../js/data/relics.js';
import { POTIONS } from '../js/data/potions.js';
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

function freshRun(extraCards = []) {
  return {
    hp: 80, maxHp: 80, gold: 99,
    deck: [...starterDeck(), ...extraCards.map((id) => makeCard(id))],
    relics: ['burningBlood'],
    potions: ['firePotion', 'blockPotion', null],
    counters: { penNib: 0 },
    monstersSlain: 0, elitesSlain: 0,
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
}
for (const [id, r] of Object.entries(RELICS)) ok(r.name && r.desc && r.icon, `relic ${id}`);
for (const [id, p] of Object.entries(POTIONS)) ok(p.name && p.desc, `potion ${id}`);
for (const ev of EVENTS) ok(ev.title && ev.options.length >= 2, `event ${ev.id}`);
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
  for (let row = 1; row < 5; row++) {
    ok(Object.values(map.grid[row]).every((n) => !['elite', 'rest'].includes(n.type)), `seed ${seed} no elite/rest on early floor ${row + 1}`);
  }
  // walk reachability
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
ok(attackDamage(6, { weak: 1 }, { vuln: 1 }) === 6, 'weak+vuln 6→floor(4.5*1.5)=6');
ok(attackDamage(1, { weak: 1 }, {}) === 0, 'weak 1→0');

// ============ 4. mechanic-specific checks ============
section('mechanics');
{
  // guardian mode shift
  const run = freshRun();
  const rng = mulberry32(7);
  const c = createCombat(run, ['guardian'], rng, 'boss');
  startCombat(c);
  const g = c.enemies[0];
  hitEnemy(c, g, 35); // exceeds 30 threshold
  ok(g.mode === 'def', 'guardian shifts to defensive');
  ok(g.block >= 20, 'guardian gains 20 block on shift');
  ok(g.intent && g.intent.key === 'defMode', 'guardian intent interrupted to defensive');
}
{
  // slime split
  const run = freshRun();
  const c = createCombat(run, ['acidSlimeL'], mulberry32(9), 'monster');
  startCombat(c);
  const s = c.enemies[0];
  hitEnemy(c, s, Math.ceil(s.maxHp * 0.6));
  // splits are processed via playCard/enemyTurnStep; emulate processing through a played card
  const strike = c.hand.find((cd) => cd.id === 'strike') || c.hand[0];
  playCard(c, strike, c.enemies.find((e) => !e.gone && e.hp > 0)?.uid);
  const mediums = c.enemies.filter((e) => e.id === 'acidSlimeM' && !e.gone);
  ok(mediums.length === 2, `acid slime L split into 2 M (got ${mediums.length})`);
}
{
  // sentry artifact blocks first debuff
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
  // lagavulin wakes on damage with stun
  const run = freshRun();
  const c = createCombat(run, ['lagavulin'], mulberry32(13), 'elite');
  startCombat(c);
  const l = c.enemies[0];
  ok(l.statuses.asleep === 1, 'lagavulin starts asleep');
  hitEnemy(c, l, 10);
  ok(!l.statuses.asleep && l.stunned, 'lagavulin wakes stunned on hp loss');
}
{
  // burn damages at end of turn
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
  // potion: fire potion kills small slime
  const run = freshRun();
  const c = createCombat(run, ['acidSlimeS'], mulberry32(19), 'monster');
  startCombat(c);
  usePotionInCombat(c, 0, c.enemies[0].uid);
  ok(c.over === 'win', 'fire potion 20 dmg kills small slime → win');
  ok(run.potions[0] === null, 'potion consumed');
}
{
  // whirlwind consumes all energy and multi-hits
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

// ============ 5. full random-play combat simulations ============
section('combat simulations');
const ENCOUNTER_KEYS = ['cultist', 'jawWorm', 'twoLice', 'smallSlimes', 'gremlinGang', 'largeSlime', 'lotsOfSlimes', 'blueSlaver', 'redSlaver', 'threeLice', 'twoFungi', 'looter', 'gremlinNobE', 'lagavulinE', 'sentriesE', ...BOSS_IDS];
let sims = 0, wins = 0, losses = 0, timeouts = 0;
for (const key of ENCOUNTER_KEYS) {
  for (let seed = 1; seed <= 30; seed++) {
    const rng = mulberry32(seed * 1000 + key.length);
    let ids;
    if (BOSS_IDS.includes(key)) ids = [key];
    else {
      // re-roll until we land on the wanted key for coverage
      let enc;
      const kindFor = ['gremlinNobE', 'lagavulinE', 'sentriesE'].includes(key) ? 'elite' : ['cultist', 'jawWorm', 'twoLice', 'smallSlimes'].includes(key) ? 'easy' : 'hard';
      const pool = { easy: ['cultist', 'jawWorm', 'twoLice', 'smallSlimes'], elite: ['gremlinNobE', 'lagavulinE', 'sentriesE'] }[kindFor];
      enc = rollEncounter(rng, kindFor, (pool || ENCOUNTER_KEYS).filter((k) => k !== key && (pool ? pool.includes(k) : true)));
      ids = enc.ids;
    }
    const run = freshRun(['cleave', 'inflame', 'metallicize', 'pommelStrike', 'carnage']);
    const c = createCombat(run, ids, rng, 'monster');
    try {
      startCombat(c);
      let guard = 0;
      while (!c.over && guard++ < 80) {
        // random plays
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
        // sanity bounds
        ok(c.player.hp >= 0 && c.player.hp <= c.player.maxHp, `hp bounds (${key} seed ${seed})`);
        for (const e of c.enemies) ok(e.hp >= 0, `enemy hp bounds (${key})`);
      }
      sims++;
      if (c.over === 'win') wins++;
      else if (c.over === 'lose') losses++;
      else timeouts++;
    } catch (err) {
      failures++;
      console.error(`  ✗ EXCEPTION in ${key} seed ${seed}:`, err.message, err.stack.split('\n')[1]);
    }
  }
}
console.log(`  ${sims} sims — ${wins} wins / ${losses} losses / ${timeouts} timeouts`);
ok(timeouts < sims * 0.1, `few timeouts (${timeouts})`);
ok(wins > 0 && losses > 0, 'both outcomes occur');

// ============ result ============
console.log('\n' + (failures === 0 ? '✅ ALL SMOKE TESTS PASSED' : `❌ ${failures} FAILURES`));
process.exit(failures === 0 ? 0 : 1);
