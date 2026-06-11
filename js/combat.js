// Combat engine — DOM-free state machine.
// UI layers call: createCombat → startCombat → playCard / usePotion / endPlayerTurn → enemyTurnStep* → beginPlayerTurn …
// Visual events accumulate in c.fx; the UI drains and animates them.

import { shuffle } from './rng.js';
import { CARDS, cardData, makeCard } from './data/cards.js';
import { ENEMIES, makeEnemy } from './data/enemies.js';
import { POTIONS } from './data/potions.js';

const STRIKE_IDS = ['strike', 'twinStrike', 'pommelStrike', 'perfectedStrike'];

export function createCombat(run, enemyIds, rng, kind = 'monster') {
  const c = {
    run, rng, kind,
    player: {
      hp: run.hp, maxHp: run.maxHp,
      block: 0, energy: 0, maxEnergy: 3,
      statuses: {},
    },
    enemies: enemyIds.map((id, i) => makeEnemy(id, rng, i)),
    hand: [], drawPile: [], discardPile: [], exhaustPile: [],
    turn: 0, phase: 'player', enemyIdx: 0,
    attacksThisTurn: 0, cardsPlayedThisTurn: 0,
    stolenGold: 0, pendingSplits: [],
    over: null, fx: [],
  };
  // combat operates on copies so combat-only changes (e.g. 무기 연마) don't persist
  c.drawPile = run.deck.map((card) => ({ ...card }));
  shuffle(rng, c.drawPile);

  // ===== ctx helpers used by enemy AI / cards =====
  c.aliveEnemies = () => c.enemies.filter((e) => !e.gone && e.hp > 0);
  c.addEnemyStatus = (e, k, n) => {
    e.statuses[k] = (e.statuses[k] || 0) + n;
    if (!e.statuses[k]) delete e.statuses[k];
    c.fx.push({ t: 'status', who: e.uid, k, n });
  };
  c.applyEnemyDebuff = (e, k, n) => {
    if (e.statuses.artifact) {
      e.statuses.artifact--;
      if (!e.statuses.artifact) delete e.statuses.artifact;
      c.fx.push({ t: 'text', who: e.uid, msg: '결계!' });
      return;
    }
    c.addEnemyStatus(e, k, n);
  };
  c.addPlayerStatus = (k, n) => {
    const p = c.player.statuses;
    p[k] = (p[k] || 0) + n;
    if (!p[k]) delete p[k];
    c.fx.push({ t: 'status', who: 'p', k, n });
  };
  c.applyStatusPlayer = (k, n) => c.addPlayerStatus(k, n);
  c.gainEnemyBlock = (e, n) => {
    e.block += n;
    c.fx.push({ t: 'blockGain', who: e.uid, amt: n });
  };
  c.addStatusCardToDiscard = (id, n, upgraded = false) => {
    for (let i = 0; i < n; i++) c.discardPile.push(makeCard(id, upgraded));
    c.fx.push({ t: 'text', who: 'p', msg: `${CARDS[id].name} +${n}` });
  };
  c.refreshIntent = (e) => { e.intent = ENEMIES[e.id].ai(e, c); };

  return c;
}

export function hasRelic(run, id) { return run.relics.includes(id); }

// ============ combat start / turn flow ============
export function startCombat(c) {
  const { run, player: p } = c;
  if (hasRelic(run, 'anchor')) gainBlockRaw(c, 10);
  if (hasRelic(run, 'vajra')) c.addPlayerStatus('str', 1);
  if (hasRelic(run, 'smoothStone')) c.addPlayerStatus('dex', 1);
  if (hasRelic(run, 'bronzeScales')) c.addPlayerStatus('thorns', 3);
  if (hasRelic(run, 'bloodVial')) healPlayer(c, 2);
  if (hasRelic(run, 'bagOfMarbles')) {
    for (const e of c.aliveEnemies()) c.applyEnemyDebuff(e, 'vuln', 1);
  }
  for (const e of c.enemies) c.refreshIntent(e);
  beginPlayerTurn(c);
}

export function beginPlayerTurn(c) {
  const { run, player: p } = c;
  c.turn++;
  c.phase = 'player';
  c.enemyIdx = 0;
  c.attacksThisTurn = 0;
  c.cardsPlayedThisTurn = 0;
  p.block = 0;
  p.energy = p.maxEnergy + (c.turn === 1 && hasRelic(run, 'lantern') ? 1 : 0);
  if (p.statuses.demonForm) c.addPlayerStatus('str', p.statuses.demonForm);
  if (c.turn === 2 && hasRelic(run, 'hornCleat')) gainBlockRaw(c, 14);
  drawCards(c, 5 + (c.turn === 1 && hasRelic(run, 'bagOfPrep') ? 2 : 0));
}

export function drawCards(c, n) {
  if (c.player.statuses.noDraw) return;
  for (let i = 0; i < n; i++) {
    if (c.hand.length >= 10) break;
    if (!c.drawPile.length) {
      if (!c.discardPile.length) break;
      c.drawPile = shuffle(c.rng, c.discardPile);
      c.discardPile = [];
      c.fx.push({ t: 'shuffle' });
    }
    c.hand.push(c.drawPile.pop());
  }
}

// ============ damage / block / heal primitives ============
export function attackDamage(base, atkStatuses, defStatuses) {
  let amt = base + (atkStatuses.str || 0);
  if (atkStatuses.weak) amt = Math.floor(amt * 0.75);
  if (defStatuses.vuln) amt = Math.floor(amt * 1.5);
  return Math.max(0, amt);
}

function blockFromCard(c, base) {
  let amt = base + (c.player.statuses.dex || 0);
  if (c.player.statuses.frail) amt = Math.floor(amt * 0.75);
  return Math.max(0, amt);
}

function gainBlockRaw(c, amt) {
  c.player.block += amt;
  c.fx.push({ t: 'blockGain', who: 'p', amt });
}

export function healPlayer(c, amt) {
  const p = c.player;
  const real = Math.min(amt, p.maxHp - p.hp);
  if (real <= 0) return;
  p.hp += real;
  c.run.hp = p.hp;
  c.fx.push({ t: 'heal', who: 'p', amt: real });
}

// damage to player; blockable=true for attack/burn style damage
export function damagePlayer(c, amt, { blockable = true } = {}) {
  const p = c.player;
  let rem = amt;
  if (blockable) {
    const absorbed = Math.min(p.block, rem);
    p.block -= absorbed;
    rem -= absorbed;
  }
  if (rem > 0) p.hp = Math.max(0, p.hp - rem);
  c.run.hp = p.hp;
  c.fx.push({ t: 'dmg', who: 'p', amt, blocked: rem <= 0 });
  if (p.hp <= 0) {
    c.over = 'lose';
    c.fx.push({ t: 'lose' });
  }
  return rem;
}

// attack damage from enemy e to player (per hit)
function enemyHitPlayer(c, e, base) {
  const amt = attackDamage(base, e.statuses, c.player.statuses);
  const unblocked = damagePlayer(c, amt, { blockable: true });
  if (c.player.statuses.thorns && e.hp > 0 && !e.gone) {
    hitEnemy(c, e, c.player.statuses.thorns, { isAttack: false });
  }
  return unblocked;
}

// damage to enemy; amt is final (already through attackDamage for attacks)
export function hitEnemy(c, e, amt, { isAttack = true } = {}) {
  if (e.gone || e.hp <= 0) return 0;
  let rem = amt;
  const absorbed = Math.min(e.block, rem);
  e.block -= absorbed;
  rem -= absorbed;
  c.fx.push({ t: 'dmg', who: e.uid, amt, blocked: rem <= 0 });
  if (rem > 0) {
    e.hp -= rem;
    if (isAttack && e.statuses.curlUp && e.hp > 0) {
      c.gainEnemyBlock(e, e.statuses.curlUp);
      delete e.statuses.curlUp;
    }
    const def = ENEMIES[e.id];
    if (def.onHpLoss && e.hp > 0) def.onHpLoss(e, c, rem);
    if (def.splitsInto && e.hp > 0 && e.hp <= Math.floor(e.maxHp / 2) && !e.didSplit) {
      e.didSplit = true;
      c.pendingSplits.push(e);
    }
  }
  if (isAttack && e.statuses.angry && e.hp > 0) {
    c.addEnemyStatus(e, 'str', e.statuses.angry);
  }
  if (e.hp <= 0) killEnemy(c, e);
  return Math.max(0, rem);
}

function killEnemy(c, e) {
  e.hp = 0;
  c.fx.push({ t: 'die', who: e.uid });
  if (e.statuses.spore) c.addPlayerStatus('vuln', e.statuses.spore);
  if (e.stolen) {
    c.run.gold += e.stolen;
    c.fx.push({ t: 'text', who: 'p', msg: `금화 ${e.stolen} 회수!` });
    e.stolen = 0;
  }
  c.run.monstersSlain++;
  checkWin(c);
}

function processSplits(c) {
  while (c.pendingSplits.length) {
    const e = c.pendingSplits.shift();
    if (e.hp <= 0 || e.gone) continue;
    const def = ENEMIES[e.id];
    const into = Array.isArray(def.splitsInto) ? def.splitsInto : [def.splitsInto, def.splitsInto];
    e.gone = true;
    c.fx.push({ t: 'split', who: e.uid });
    const idx = c.enemies.indexOf(e);
    const spawns = into.map((id, i) => {
      const s = makeEnemy(id, c.rng, e.slot + i);
      s.hp = s.maxHp = Math.max(1, e.hp);
      c.refreshIntent(s);
      return s;
    });
    c.enemies.splice(idx, 1, ...spawns);
  }
}

function checkWin(c) {
  if (c.over) return;
  if (c.enemies.every((e) => e.gone || e.hp <= 0)) {
    c.over = 'win';
    c.fx.push({ t: 'win' });
  }
}

// ============ playing cards ============
export function cardCost(c, card) {
  const d = cardData(card);
  if (d.unplayable) return null;
  if (d.cost === 'X') return c.player.energy;
  return d.cost;
}

export function canPlay(c, card) {
  if (c.over || c.phase !== 'player') return false;
  const d = cardData(card);
  if (d.unplayable) return false;
  if (d.type === 'attack' && c.player.statuses.entangled) return false;
  const cost = cardCost(c, card);
  return cost !== null && cost <= c.player.energy;
}

// preview numbers for card text (includes str/weak, excludes target vuln)
export function previewValues(c, card) {
  const d = cardData(card);
  const out = {};
  if (d.dmg !== undefined) {
    let base = d.dmg;
    if (c) {
      const s = c.player.statuses;
      if (d.special === 'heavyBlade') base = d.dmg + (s.str || 0) * (d.strMult - 1);
      if (d.special === 'perfectedStrike') {
        const all = [...c.drawPile, ...c.discardPile, ...c.hand, ...c.exhaustPile, ...(c.pendingCard ? [c.pendingCard] : [])];
        base = d.dmg + d.perStrike * all.filter((x) => STRIKE_IDS.includes(x.id)).length;
      }
      out.dmg = attackDamage(base, s, {});
    } else out.dmg = base;
  }
  if (d.special === 'bodySlam') out.dmg = c ? c.player.block : 0;
  if (d.block !== undefined) out.block = c ? blockFromCard(c, d.block) : d.block;
  return out;
}

export function playCard(c, card, targetUid = null) {
  if (!canPlay(c, card)) return false;
  const d = cardData(card);
  const idx = c.hand.indexOf(card);
  if (idx < 0) return false;

  const cost = cardCost(c, card);
  const xValue = d.cost === 'X' ? c.player.energy : 0;
  c.player.energy -= cost;
  c.hand.splice(idx, 1);
  c.pendingCard = card;
  c.fx.push({ t: 'play', card: { ...d } });
  c.cardsPlayedThisTurn++;

  let penNibDouble = false;
  if (d.type === 'attack') {
    c.attacksThisTurn++;
    if (hasRelic(c.run, 'penNib')) {
      c.run.counters.penNib++;
      if (c.run.counters.penNib >= 10) {
        c.run.counters.penNib = 0;
        penNibDouble = true;
        c.fx.push({ t: 'text', who: 'p', msg: '펜촉 발동! 피해 2배' });
      }
    }
    // 가시 외피: 공격 카드를 낼 때마다 피해
    for (const e of c.aliveEnemies()) {
      if (e.statuses.sharpHide) damagePlayer(c, e.statuses.sharpHide, { blockable: true });
    }
  }
  if (d.type === 'skill') {
    for (const e of c.aliveEnemies()) {
      if (e.statuses.enrage) c.addEnemyStatus(e, 'str', e.statuses.enrage);
    }
  }

  const target = targetUid ? c.enemies.find((e) => e.uid === targetUid) : null;
  resolveCard(c, card, d, target, { penNibDouble, xValue });

  // destination
  if (d.type === 'power') {
    c.fx.push({ t: 'consumed', uid: card.uid });
  } else if (d.exhaust || (d.special === 'limitBreak' && d.exhaust !== 0) || d.id === 'slimed') {
    exhaustCard(c, card);
  } else {
    c.discardPile.push(card);
  }
  c.pendingCard = null;

  if (d.type === 'attack' && hasRelic(c.run, 'kunai') && c.attacksThisTurn % 3 === 0) {
    c.addPlayerStatus('dex', 1);
  }

  processSplits(c);
  checkWin(c);
  return true;
}

function exhaustCard(c, card) {
  c.exhaustPile.push(card);
  c.fx.push({ t: 'exhaust', uid: card.uid });
  const fnp = c.player.statuses.feelNoPain;
  if (fnp) gainBlockRaw(c, fnp);
}

function dealCardDamage(c, d, baseOverride, targets, hits, penNibDouble) {
  let totalUnblocked = 0;
  for (let h = 0; h < hits; h++) {
    const alive = c.aliveEnemies();
    if (!alive.length) break;
    let tgts;
    if (d.target === 'all') tgts = alive;
    else if (d.target === 'random') tgts = [alive[Math.floor(c.rng() * alive.length)]];
    else {
      const t = targets && !targets.gone && targets.hp > 0 ? targets : alive[0];
      tgts = [t];
    }
    for (const t of tgts) {
      let amt = attackDamage(baseOverride, c.player.statuses, t.statuses);
      if (penNibDouble) amt *= 2;
      totalUnblocked += hitEnemy(c, t, amt);
    }
  }
  return totalUnblocked;
}

function resolveCard(c, card, d, target, { penNibDouble, xValue }) {
  const p = c.player;
  const s = p.statuses;

  switch (d.special) {
    case 'bodySlam':
      dealCardDamage(c, d, p.block, target, 1, penNibDouble);
      break;
    case 'heavyBlade':
      dealCardDamage(c, d, d.dmg + (s.str || 0) * (d.strMult - 1), target, 1, penNibDouble);
      break;
    case 'perfectedStrike': {
      const all = [...c.drawPile, ...c.discardPile, ...c.hand, ...c.exhaustPile, card];
      const n = all.filter((x) => STRIKE_IDS.includes(x.id)).length;
      dealCardDamage(c, d, d.dmg + d.perStrike * n, target, 1, penNibDouble);
      break;
    }
    case 'whirlwind':
      dealCardDamage(c, d, d.dmg, null, xValue, penNibDouble);
      break;
    case 'anger':
      dealCardDamage(c, d, d.dmg, target, 1, penNibDouble);
      c.discardPile.push(makeCard('anger', card.upgraded));
      break;
    case 'reaper': {
      const healed = dealCardDamage(c, d, d.dmg, null, 1, penNibDouble);
      if (healed > 0) healPlayer(c, healed);
      break;
    }
    case 'armaments': {
      gainBlockRaw(c, blockFromCard(c, d.block));
      const targets2 = c.hand.filter((x) => !x.upgraded && CARDS[x.id].type !== 'status' && CARDS[x.id].type !== 'curse');
      if (card.upgraded) targets2.forEach((x) => { x.upgraded = true; });
      else if (targets2.length) targets2[Math.floor(c.rng() * targets2.length)].upgraded = true;
      c.fx.push({ t: 'text', who: 'p', msg: '카드 강화!' });
      break;
    }
    case 'flex':
      c.addPlayerStatus('str', d.str);
      s.flexDown = (s.flexDown || 0) + d.str;
      break;
    case 'battleTrance':
      drawCards(c, d.draw);
      s.noDraw = 1;
      break;
    case 'disarm':
      if (target) c.applyEnemyDebuff(target, 'str', -d.strDown);
      break;
    case 'offering':
      damagePlayer(c, d.hpCost, { blockable: false });
      p.energy += d.energy;
      c.fx.push({ t: 'energy', n: d.energy });
      drawCards(c, d.draw);
      break;
    case 'limitBreak':
      if (s.str) c.addPlayerStatus('str', s.str);
      break;
    case 'inflame':
      c.addPlayerStatus('str', d.str);
      break;
    case 'metallicize':
      c.addPlayerStatus('metallicize', d.n);
      break;
    case 'feelNoPain':
      c.addPlayerStatus('feelNoPain', d.n);
      break;
    case 'demonForm':
      c.addPlayerStatus('demonForm', d.n);
      break;
    default: {
      // generic resolution
      if (d.dmg !== undefined) dealCardDamage(c, d, d.dmg, target, d.hits || 1, penNibDouble);
      if (d.block !== undefined) gainBlockRaw(c, blockFromCard(c, d.block));
      if (d.draw) drawCards(c, d.draw);
      const applyTo = (k, n) => {
        const tgts = d.target === 'all' ? c.aliveEnemies() : target && target.hp > 0 ? [target] : c.aliveEnemies().slice(0, 1);
        for (const t of tgts) c.applyEnemyDebuff(t, k, n);
      };
      if (d.vuln) applyTo('vuln', d.vuln);
      if (d.weak) applyTo('weak', d.weak);
      if (d.frail) applyTo('frail', d.frail);
    }
  }
}

// ============ potions ============
export function usePotionInCombat(c, slot, targetUid = null) {
  const id = c.run.potions[slot];
  if (!id || c.over) return false;
  const def = POTIONS[id];
  const target = targetUid ? c.enemies.find((e) => e.uid === targetUid) : null;
  switch (id) {
    case 'firePotion': {
      const t = target || c.aliveEnemies()[0];
      if (!t) return false;
      hitEnemy(c, t, 20, { isAttack: false });
      break;
    }
    case 'blockPotion': gainBlockRaw(c, 12); break;
    case 'strengthPotion': c.addPlayerStatus('str', 2); break;
    case 'dexterityPotion': c.addPlayerStatus('dex', 2); break;
    case 'energyPotion': c.player.energy += 2; c.fx.push({ t: 'energy', n: 2 }); break;
    case 'swiftPotion': drawCards(c, 3); break;
    case 'weakPotion': {
      const t = target || c.aliveEnemies()[0];
      if (!t) return false;
      c.applyEnemyDebuff(t, 'weak', 3);
      break;
    }
    case 'fearPotion': {
      const t = target || c.aliveEnemies()[0];
      if (!t) return false;
      c.applyEnemyDebuff(t, 'vuln', 3);
      break;
    }
    case 'bloodPotion': healPlayer(c, Math.floor(c.run.maxHp * 0.2)); break;
    case 'explosivePotion':
      for (const e of c.aliveEnemies()) hitEnemy(c, e, 10, { isAttack: false });
      break;
    default: return false;
  }
  c.run.potions[slot] = null;
  processSplits(c);
  checkWin(c);
  return true;
}

// ============ end of player turn / enemy phase ============
export function endPlayerTurn(c) {
  if (c.over || c.phase !== 'player') return;
  const { run, player: p } = c;
  const s = p.statuses;

  if (hasRelic(run, 'orichalcum') && p.block === 0) gainBlockRaw(c, 6);
  if (s.metallicize) gainBlockRaw(c, s.metallicize);

  // discard hand (burn / ethereal)
  for (const card of [...c.hand]) {
    const d = cardData(card);
    if (d.special === 'burn') damagePlayer(c, d.n, { blockable: true });
    if (d.ethereal) {
      c.hand.splice(c.hand.indexOf(card), 1);
      exhaustCard(c, card);
    }
  }
  c.discardPile.push(...c.hand);
  c.hand = [];

  if (s.flexDown) {
    c.addPlayerStatus('str', -s.flexDown);
    delete s.flexDown;
  }
  delete s.noDraw;
  for (const k of ['vuln', 'weak', 'frail', 'entangled']) {
    if (s[k]) { s[k]--; if (!s[k]) delete s[k]; }
  }

  c.phase = 'enemy';
  c.enemyIdx = 0;
}

// Executes the next alive enemy's move. Returns the enemy acted, or null when the phase is done.
export function enemyTurnStep(c) {
  if (c.over) return null;
  while (c.enemyIdx < c.enemies.length) {
    const e = c.enemies[c.enemyIdx++];
    if (e.gone || e.hp <= 0) continue;

    e.block = 0;
    const move = e.intent;

    if (e.stunned) {
      e.stunned = false;
      c.fx.push({ t: 'text', who: e.uid, msg: '기절!' });
    } else if (move) {
      c.fx.push({ t: 'enemyMove', who: e.uid, label: move.label });
      if (move.intent === 'escape') {
        e.gone = true;
        c.fx.push({ t: 'escape', who: e.uid });
        checkWin(c);
      } else {
        if (move.block) c.gainEnemyBlock(e, move.block);
        if (move.dmg !== undefined) {
          const hits = move.hits || 1;
          for (let h = 0; h < hits; h++) {
            if (c.over) break;
            enemyHitPlayer(c, e, move.dmg);
          }
          if (move.steal && c.run.gold > 0 && !c.over) {
            const take = Math.min(c.run.gold, move.steal);
            c.run.gold -= take;
            e.stolen = (e.stolen || 0) + take;
            c.fx.push({ t: 'text', who: 'p', msg: `금화 ${take} 도난!` });
          }
        }
        if (move.apply) move.apply(c, e);
      }
    }

    if (!e.gone && e.hp > 0) {
      if (e.statuses.metallicizeE) c.gainEnemyBlock(e, e.statuses.metallicizeE);
      if (e.statuses.ritual) c.addEnemyStatus(e, 'str', e.statuses.ritual);
      for (const k of ['vuln', 'weak']) {
        if (e.statuses[k]) { e.statuses[k]--; if (!e.statuses[k]) delete e.statuses[k]; }
      }
      e.turn++;
      if (move) e.history.push(move.key);
      c.refreshIntent(e);
    }

    processSplits(c);
    return e;
  }
  return null; // enemy phase done
}

export function finishEnemyPhase(c) {
  if (c.over) return;
  beginPlayerTurn(c);
}

// ============ card text rendering ============
export function renderCardText(card, c = null) {
  const d = cardData(card);
  const pv = c ? previewValues(c, card) : {};
  let text = d.text;
  const token = (key, val, baseVal) => {
    if (val === undefined) return;
    const mod = baseVal !== undefined && val !== baseVal;
    text = text.replaceAll(`{${key}}`, mod ? `<b class="buffed">${val}</b>` : `<b>${val}</b>`);
  };
  token('dmg', pv.dmg !== undefined ? pv.dmg : d.dmg, d.dmg);
  token('block', pv.block !== undefined ? pv.block : d.block, d.block);
  for (const k of ['vuln', 'weak', 'frail', 'draw', 'str', 'strDown', 'n', 'hits', 'strMult', 'perStrike', 'hpCost', 'energy']) {
    token(k, d[k]);
  }
  text = text.replaceAll('{N}', d.upgraded ? '모두' : '1');
  text = text.replaceAll('{exhaustText}', d.exhaust === 0 ? '' : ' 소멸.');
  // keyword highlight
  for (const kw of ['취약', '약화', '손상', '소멸', '휘발성', '힘', '민첩', '방어도']) {
    text = text.replaceAll(kw, `<span class="kw">${kw}</span>`);
  }
  return text;
}
