// App bootstrap + run state machine (1막 → 3막 → 엔딩).
import { mulberry32, randInt, pick, chance } from './rng.js';
import { generateMap, ROWS } from './map.js';
import { starterDeck, rollRewardCards, bumpUid, CARDS } from './data/cards.js';
import { rollEncounter, rollBoss, bossEncounterIds, FINAL_ACT, ACTS } from './data/enemies.js';
import { rollPotion } from './data/potions.js';
import { rollRelic } from './data/relics.js';
import { EVENTS } from './data/events.js';
import { runCombat } from './combatui.js';
import {
  titleScreen, mapScreen, rewardsScreen, restScreen, shopScreen,
  eventScreen, treasureScreen, gameOverScreen, actTransitionScreen, endingScreen,
} from './screens.js';
import { initTooltips, $, toast } from './ui.js';
import { hasRelic } from './combat.js';

const SAVE_KEY = 'spire-ascent-save-v2';

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
    act: 1,
    hp: 80, maxHp: 80, gold: 99,
    deck: starterDeck(),
    relics: ['burningBlood'],
    potions: [null, null, null],
    map: generateMap(mapRng),
    bossId: pick(mapRng, ACTS[1].boss),
    pos: null, path: [],
    combats: 0, lastEncounter: null, lastElite: null,
    potionChance: 0.4,
    counters: { penNib: 0 },
    removalCost: 75, removedThisShop: false,
    monstersSlain: 0, elitesSlain: 0, bossesSlain: 0, totalFloors: 0,
  };
}

// 다음 막으로 진입 — 지도/조우 상태 리셋, HP는 유지(전환 화면에서 30% 회복)
export function advanceAct(run, rng) {
  run.act++;
  run.map = generateMap(rng);
  run.bossId = rollBoss(rng, run.act);
  run.pos = null;
  run.path = [];
  run.combats = 0;
  run.lastEncounter = null;
  run.lastElite = null;
  run.potionChance = 0.4;
  run.hp = Math.min(run.maxHp, run.hp + Math.floor(run.maxHp * 0.3));
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
    if (!run || !run.deck || !run.map || !run.act) return null;
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
      const enc = rollEncounter(rng, kind, run.lastEncounter ? [run.lastEncounter] : [], run.act);
      run.lastEncounter = enc.key;
      run.combats++;
      const result = await runCombat(run, enc.ids, rng, 'monster');
      if (result === 'lose') return 'dead';
      await afterCombatHeals(run);
      await rewardsScreen(run, combatRewards(run, rng, 'monster'));
      return 'ok';
    }
    case 'elite': {
      const enc = rollEncounter(rng, 'elite', run.lastElite ? [run.lastElite] : [], run.act);
      run.lastElite = enc.key;
      const result = await runCombat(run, enc.ids, rng, 'elite');
      if (result === 'lose') return 'dead';
      run.elitesSlain++;
      await afterCombatHeals(run);
      await rewardsScreen(run, combatRewards(run, rng, 'elite'), '정예 격파!');
      return 'ok';
    }
    case 'boss': {
      const result = await runCombat(run, bossEncounterIds(run.bossId, rng), rng, 'boss');
      if (result === 'lose') return 'dead';
      run.bossesSlain++;
      await afterCombatHeals(run);
      if (run.act >= FINAL_ACT) return 'victory';
      await rewardsScreen(run, bossRewards(run, rng), '보스 격파!');
      return 'nextAct';
    }
    case 'rest':
      await restScreen(run);
      return 'ok';
    case 'shop':
      run.removedThisShop = false;
      run.smithedThisShop = false;
      await shopScreen(run, rng);
      return 'ok';
    case 'treasure':
      await treasureScreen(run, rng);
      return 'ok';
    case 'event': {
      // ?방: 대부분 이벤트, 가끔 전투
      if (chance(rng, 0.12)) {
        const enc = rollEncounter(rng, run.combats < 3 ? 'easy' : 'hard', run.lastEncounter ? [run.lastEncounter] : [], run.act);
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

// 막이 오를수록 보상 카드가 강화되어 등장 (2막 25%, 3막 50%)
function maybeUpgradeRewards(run, rng, cards) {
  const chanceUp = run.act === 2 ? 0.25 : run.act >= 3 ? 0.5 : 0;
  for (const card of cards) {
    if (card.upgraded) continue;
    if (hasRelic(run, 'toxicEgg') && ['common', 'uncommon'].includes(CARDS[card.id].rarity)) {
      card.upgraded = true;
    } else if (chanceUp && chance(rng, chanceUp)) {
      card.upgraded = true;
    }
  }
  return cards;
}

function combatRewards(run, rng, kind) {
  const rewards = {};
  rewards.gold = kind === 'elite' ? randInt(rng, 25, 35) : randInt(rng, 10, 20);
  if (hasRelic(run, 'goldenDice')) rewards.gold = Math.ceil(rewards.gold * 1.4);
  const potionBonus = hasRelic(run, 'herbPouch') ? 0.15 : 0;
  if (chance(rng, run.potionChance + potionBonus)) {
    rewards.potion = rollPotion(rng);
    run.potionChance = Math.max(0.1, run.potionChance - 0.1);
  } else {
    run.potionChance = Math.min(0.9, run.potionChance + 0.1);
  }
  rewards.cards = maybeUpgradeRewards(run, rng, rollRewardCards(rng, kind));
  if (kind === 'elite') {
    const relic = rollRelic(rng, run.relics);
    if (relic) rewards.relic = relic;
  }
  return rewards;
}

function bossRewards(run, rng) {
  const rewards = { gold: randInt(rng, 95, 105) };
  rewards.cards = maybeUpgradeRewards(run, rng, rollRewardCards(rng, 'boss'));
  const relic = rollRelic(rng, run.relics);
  if (relic) rewards.relic = relic;
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
      run.totalFloors++;
      if (node.type !== 'boss') run.path.push({ row: node.row, col: node.col });
      const result = await resolveNode(run, node, rng);
      if (result === 'dead') { outcome = false; break; }
      if (result === 'victory') { outcome = true; break; }
      if (result === 'nextAct') {
        advanceAct(run, rng);
        save(run);
        await actTransitionScreen(run);
      }
    }
    clearSave();
    if (outcome) await endingScreen(run);
    else await gameOverScreen(run, false);
  }
}

// ============ boot ============
fitStage();
initTooltips();
gameLoop();
