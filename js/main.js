// App bootstrap + run state machine.
import { mulberry32, randInt, pick, chance } from './rng.js';
import { generateMap, ROWS } from './map.js';
import { starterDeck, rollRewardCards, bumpUid, CARDS } from './data/cards.js';
import { rollEncounter, BOSS_IDS } from './data/enemies.js';
import { rollPotion } from './data/potions.js';
import { rollRelic } from './data/relics.js';
import { EVENTS } from './data/events.js';
import { runCombat } from './combatui.js';
import {
  titleScreen, mapScreen, rewardsScreen, restScreen, shopScreen,
  eventScreen, treasureScreen, gameOverScreen,
} from './screens.js';
import { initTooltips, $, toast } from './ui.js';
import { hasRelic } from './combat.js';

const SAVE_KEY = 'spire-ascent-save-v1';

// ============ stage scaling ============
function fitStage() {
  const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  $('#stage').style.transform = `scale(${scale})`;
}
window.addEventListener('resize', fitStage);

// ============ error overlay (debug aid) ============
window.addEventListener('error', (ev) => {
  const box = $('#fatal');
  box.style.display = 'block';
  box.textContent = '오류: ' + ev.message + ' @ ' + (ev.filename || '').split('/').pop() + ':' + ev.lineno;
});

// ============ run lifecycle ============
function newRun() {
  const seed = (Math.random() * 0xffffffff) >>> 0;
  const mapRng = mulberry32(seed);
  return {
    seed,
    hp: 80, maxHp: 80, gold: 99,
    deck: starterDeck(),
    relics: ['burningBlood'],
    potions: [null, null, null],
    map: generateMap(mapRng),
    bossId: BOSS_IDS[Math.floor(Math.random() * BOSS_IDS.length)],
    pos: null, path: [],
    combats: 0, lastEncounter: null, lastElite: null,
    potionChance: 0.4,
    counters: { penNib: 0 },
    removalCost: 75, removedThisShop: false,
    monstersSlain: 0, elitesSlain: 0,
  };
}

function save(run) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(run)); } catch (e) { /* private mode */ }
}
function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
}
function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const run = JSON.parse(raw);
    if (!run || !run.deck || !run.map) return null;
    const maxUid = Math.max(0, ...run.deck.map((c) => c.uid || 0));
    bumpUid(maxUid);
    return run;
  } catch (e) { return null; }
}

// ============ node resolution ============
async function resolveNode(run, node, rng) {
  switch (node.type) {
    case 'monster': {
      const kind = run.combats < 3 ? 'easy' : 'hard';
      const enc = rollEncounter(rng, kind, run.lastEncounter ? [run.lastEncounter] : []);
      run.lastEncounter = enc.key;
      run.combats++;
      const result = await runCombat(run, enc.ids, rng, 'monster');
      if (result === 'lose') return 'dead';
      await afterCombatHeals(run);
      await rewardsScreen(run, combatRewards(run, rng, 'monster'));
      return 'ok';
    }
    case 'elite': {
      const enc = rollEncounter(rng, 'elite', run.lastElite ? [run.lastElite] : []);
      run.lastElite = enc.key;
      const result = await runCombat(run, enc.ids, rng, 'elite');
      if (result === 'lose') return 'dead';
      run.elitesSlain++;
      await afterCombatHeals(run);
      await rewardsScreen(run, combatRewards(run, rng, 'elite'), '정예 격파!');
      return 'ok';
    }
    case 'boss': {
      const result = await runCombat(run, [run.bossId], rng, 'boss');
      if (result === 'lose') return 'dead';
      return 'victory';
    }
    case 'rest':
      await restScreen(run);
      return 'ok';
    case 'shop':
      run.removedThisShop = false;
      await shopScreen(run, rng);
      return 'ok';
    case 'treasure':
      await treasureScreen(run, rng);
      return 'ok';
    case 'event': {
      // ?방: 대부분 이벤트, 가끔 전투
      if (chance(rng, 0.12)) {
        const enc = rollEncounter(rng, run.combats < 3 ? 'easy' : 'hard', run.lastEncounter ? [run.lastEncounter] : []);
        run.lastEncounter = enc.key;
        run.combats++;
        const result = await runCombat(run, enc.ids, rng, 'monster');
        if (result === 'lose') return 'dead';
        await afterCombatHeals(run);
        await rewardsScreen(run, combatRewards(run, rng, 'monster'));
        return 'ok';
      }
      const ev = pick(rng, EVENTS.filter((e) => e.id !== run.lastEvent));
      run.lastEvent = ev.id;
      await eventScreen(run, ev, rng);
      return 'ok';
    }
    default:
      return 'ok';
  }
}

async function afterCombatHeals(run) {
  if (run.hp <= 0) return;
  if (hasRelic(run, 'burningBlood')) run.hp = Math.min(run.maxHp, run.hp + 6);
  if (hasRelic(run, 'meatBone') && run.hp <= Math.floor(run.maxHp / 2)) {
    run.hp = Math.min(run.maxHp, run.hp + 12);
  }
}

function combatRewards(run, rng, kind) {
  const rewards = {};
  rewards.gold = kind === 'elite' ? randInt(rng, 25, 35) : randInt(rng, 10, 20);
  if (chance(rng, run.potionChance)) {
    rewards.potion = rollPotion(rng);
    run.potionChance = Math.max(0.1, run.potionChance - 0.1);
  } else {
    run.potionChance = Math.min(0.9, run.potionChance + 0.1);
  }
  const cards = rollRewardCards(rng, kind);
  if (hasRelic(run, 'toxicEgg')) {
    for (const card of cards) {
      if (['common', 'uncommon'].includes(CARDS[card.id].rarity)) card.upgraded = true;
    }
  }
  rewards.cards = cards;
  if (kind === 'elite') {
    const relic = rollRelic(rng, run.relics);
    if (relic) rewards.relic = relic;
  }
  return rewards;
}

// ============ main loop ============
async function gameLoop() {
  for (;;) {
    const saved = loadSave();
    const choice = await titleScreen(!!saved);
    let run = choice === 'continue' && saved ? saved : newRun();
    if (choice === 'new') clearSave();

    const rng = mulberry32(((Math.random() * 0xffffffff) >>> 0) ^ 0x9e3779b9);

    let outcome = null;
    for (;;) {
      save(run);
      const node = await mapScreen(run);
      run.pos = { row: node.row, col: node.col };
      if (node.type !== 'boss') run.path.push({ row: node.row, col: node.col });
      const result = await resolveNode(run, node, rng);
      if (result === 'dead') { outcome = false; break; }
      if (result === 'victory') { outcome = true; break; }
    }
    clearSave();
    await gameOverScreen(run, outcome);
  }
}

// ============ boot ============
fitStage();
initTooltips();
gameLoop();
