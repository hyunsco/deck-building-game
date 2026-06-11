// Combat screen — renders state from the engine and drives the interaction/animation loop.
import {
  createCombat, startCombat, playCard, endPlayerTurn, enemyTurnStep, finishEnemyPhase,
  usePotionInCombat, canPlay, attackDamage, cardCost,
} from './combat.js';
import { SPRITES, INTENT_ICONS } from './art.js';
import {
  el, $, cardEl, statusChips, floatText, shakeStage, elStageRect,
  renderTopbar, potionMenu, cardGridOverlay, sleep, toast, STATUS_INFO,
} from './ui.js';
import { POTIONS } from './data/potions.js';
import { cardData } from './data/cards.js';

export function runCombat(run, enemyIds, rng, kind = 'monster') {
  return new Promise((resolve) => {
    const c = createCombat(run, enemyIds, rng, kind);
    const screen = $('#screen');
    screen.innerHTML = '';
    screen.className = 'screen-combat';

    const root = el('div', 'combat');
    root.innerHTML = `
      <div class="battlefield">
        <div class="unit player" data-uid="p">
          <div class="sprite">${SPRITES.player()}</div>
          <div class="unit-bars"></div>
        </div>
        <div class="enemies"></div>
      </div>
      <div class="combat-hud">
        <div class="hud-left">
          <div class="energy-orb" data-tip="<b class='tip-title'>에너지</b>카드를 사용하는 데 필요합니다. 매 턴 3으로 회복됩니다."><b>0</b><span>/3</span></div>
          <button class="pile-btn draw" data-tip="<b class='tip-title'>뽑을 카드 더미</b>클릭하여 확인 (순서는 무작위)">🂠<b>0</b></button>
        </div>
        <div class="hand"></div>
        <div class="hud-right">
          <button class="end-turn">턴 종료</button>
          <button class="pile-btn exhaust" data-tip="<b class='tip-title'>소멸된 카드</b>이번 전투에서 제거된 카드입니다.">✦<b>0</b></button>
          <button class="pile-btn discard" data-tip="<b class='tip-title'>버린 카드 더미</b>뽑을 카드가 없으면 섞어서 다시 사용합니다.">🂠<b>0</b></button>
        </div>
      </div>
      <svg id="target-arrow" width="1920" height="1080" viewBox="0 0 1920 1080"></svg>
      <div class="turn-banner"></div>`;
    screen.appendChild(root);

    const enemiesBox = root.querySelector('.enemies');
    const handBox = root.querySelector('.hand');
    const arrowSvg = root.querySelector('#target-arrow');
    const endBtn = root.querySelector('.end-turn');

    let pending = null; // {type:'card', card} | {type:'potion', slot}
    let busy = false;
    let finished = false;

    // ============ rendering ============
    const INTENT_TIP = {
      attack: (d) => `<b class='tip-title'>공격 의도</b>피해를 <b>${d}</b> 줄 생각입니다.`,
      defend: () => `<b class='tip-title'>방어 의도</b>방어도를 얻을 생각입니다.`,
      buff: () => `<b class='tip-title'>강화 의도</b>자신이나 아군을 강화할 생각입니다.`,
      debuff: () => `<b class='tip-title'>약화 의도</b>해로운 효과를 걸 생각입니다.`,
      status: () => `<b class='tip-title'>방해 의도</b>내 덱에 쓸모없는 카드를 섞을 생각입니다.`,
      sleep: () => `<b class='tip-title'>수면</b>잠들어 있습니다.`,
      stunned: () => `<b class='tip-title'>기절</b>이번 턴을 쉽니다.`,
      escape: () => `<b class='tip-title'>도주</b>도망칠 생각입니다!`,
      unknown: () => `<b class='tip-title'>알 수 없음</b>무슨 짓을 할지 알 수 없습니다.`,
    };

    function intentHtml(e) {
      if (e.hp <= 0 || e.gone) return '';
      if (e.stunned) return `<div class="intent" data-tip="${INTENT_TIP.stunned()}">${INTENT_ICONS.stunned}</div>`;
      const m = e.intent;
      if (!m) return '';
      let icon, text = '';
      if (m.dmg !== undefined) {
        const dmg = attackDamage(m.dmg, e.statuses, c.player.statuses);
        const hits = m.hits || 1;
        if (m.intent === 'attack-defend') icon = INTENT_ICONS['attack-defend'];
        else if (m.intent === 'attack-debuff') icon = INTENT_ICONS['attack-debuff'];
        else icon = dmg >= 20 ? INTENT_ICONS.bigAttack : INTENT_ICONS.attack;
        text = `<span class="intent-num">${dmg}${hits > 1 ? `×${hits}` : ''}</span>`;
        const total = hits > 1 ? `${dmg}×${hits}` : `${dmg}`;
        return `<div class="intent" data-tip="${INTENT_TIP.attack(total)}">${icon}${text}</div>`;
      }
      icon = INTENT_ICONS[m.intent] || INTENT_ICONS.unknown;
      const tip = (INTENT_TIP[m.intent] || INTENT_TIP.unknown)();
      return `<div class="intent" data-tip="${tip}">${icon}</div>`;
    }

    function barsHtml(hp, maxHp, block) {
      const pct = Math.max(0, hp / maxHp * 100);
      return `
        ${block > 0 ? `<div class="block-badge" data-tip="<b class='tip-title'>방어도</b>공격 피해를 대신 흡수합니다. 턴 시작 시 사라집니다.">${block}</div>` : ''}
        <div class="hp-bar${block > 0 ? ' blocked' : ''}">
          <div class="hp-fill" style="width:${pct}%"></div>
          <span class="hp-num">${hp}/${maxHp}</span>
        </div>`;
    }

    function refreshUnits() {
      // player
      const pb = root.querySelector('.unit.player .unit-bars');
      pb.innerHTML = barsHtml(c.player.hp, c.player.maxHp, c.player.block);
      pb.appendChild(statusChips(c.player.statuses));
      // enemies
      enemiesBox.innerHTML = '';
      for (const e of c.enemies) {
        if (e.gone) continue;
        const u = el('div', `unit enemy size-${e.size}${e.hp <= 0 ? ' dead' : ''}${pending ? ' targetable' : ''}`);
        u.dataset.uid = e.uid;
        const spriteFn = SPRITES[e.id] || SPRITES.acidSlimeM;
        u.innerHTML = `
          ${intentHtml(e)}
          <div class="sprite">${spriteFn()}</div>
          <div class="unit-bars">${barsHtml(e.hp, e.maxHp, e.block)}</div>
          <div class="unit-name">${e.name}</div>`;
        u.querySelector('.unit-bars').appendChild(statusChips(e.statuses));
        if (e.hp > 0) {
          u.onclick = () => { if (pending) confirmTarget(e.uid); };
        }
        enemiesBox.appendChild(u);
      }
    }

    function refreshHand() {
      handBox.innerHTML = '';
      const n = c.hand.length;
      c.hand.forEach((card, i) => {
        const ce = cardEl(card, c);
        const rot = (i - (n - 1) / 2) * Math.min(7, Math.max(3, 40 / Math.max(n, 1)));
        ce.style.setProperty('--rot', rot + 'deg');
        ce.style.setProperty('--ty', Math.abs(rot) * 4 + 'px');
        ce.style.zIndex = i + 1;
        if (canPlay(c, card) && !busy) ce.classList.add('playable');
        if (pending && pending.type === 'card' && pending.card === card) ce.classList.add('selected');
        ce.onclick = (ev) => { ev.stopPropagation(); onCardClick(card); };
        handBox.appendChild(ce);
      });
    }

    function refreshHud() {
      const orb = root.querySelector('.energy-orb');
      orb.querySelector('b').textContent = c.player.energy;
      orb.querySelector('span').textContent = '/' + c.player.maxEnergy;
      orb.classList.toggle('empty', c.player.energy === 0);
      root.querySelector('.pile-btn.draw b').textContent = c.drawPile.length;
      root.querySelector('.pile-btn.discard b').textContent = c.discardPile.length;
      root.querySelector('.pile-btn.exhaust b').textContent = c.exhaustPile.length;
      endBtn.disabled = busy || c.phase !== 'player' || !!c.over;
      endBtn.textContent = c.phase === 'player' ? '턴 종료' : '적의 턴…';
    }

    function refreshAll() {
      renderTopbar(run, { onDeck: showDeck, onPotion: onPotionClick });
      refreshUnits();
      refreshHand();
      refreshHud();
    }

    // ============ fx replay ============
    async function drainFx({ slow = false } = {}) {
      const events = c.fx.splice(0);
      refreshAll();
      for (const ev of events) {
        const unit = ev.who ? root.querySelector(`.unit[data-uid="${ev.who}"]`) : null;
        const pos = unit ? elStageRect(unit) : { cx: 960, cy: 480, y: 400 };
        switch (ev.t) {
          case 'dmg': {
            if (unit) {
              unit.classList.remove('hit'); void unit.offsetWidth; unit.classList.add('hit');
            }
            floatText(pos.cx + (Math.random() * 60 - 30), pos.y + 40, String(ev.amt), ev.blocked ? 'f-blocked' : 'f-dmg');
            if (ev.who === 'p' && !ev.blocked && ev.amt >= 12) shakeStage(true);
            else if (!ev.blocked && ev.amt >= 15) shakeStage(false);
            await sleep(slow ? 220 : 120);
            break;
          }
          case 'blockGain':
            floatText(pos.cx, pos.y + 60, '🛡 ' + ev.amt, 'f-block');
            await sleep(slow ? 160 : 60);
            break;
          case 'heal':
            floatText(pos.cx, pos.y + 40, '+' + ev.amt, 'f-heal');
            await sleep(slow ? 160 : 60);
            break;
          case 'status': {
            const name = STATUS_INFO[ev.k]?.name || ev.k;
            floatText(pos.cx, pos.y + 20, `${name} ${ev.n > 0 ? '+' : ''}${ev.n}`, ev.n > 0 ? 'f-status' : 'f-status-neg');
            await sleep(slow ? 180 : 80);
            break;
          }
          case 'enemyMove':
            if (unit) {
              floatText(pos.cx, pos.y - 30, ev.label, 'f-move');
              unit.classList.add('lunge');
              setTimeout(() => unit.classList.remove('lunge'), 400);
            }
            await sleep(360);
            break;
          case 'die':
            if (unit) unit.classList.add('dead');
            await sleep(slow ? 300 : 180);
            break;
          case 'escape':
            floatText(pos.cx, pos.y, '도주!', 'f-move');
            await sleep(300);
            break;
          case 'split':
            floatText(pos.cx, pos.y, '분열!', 'f-move');
            await sleep(300);
            break;
          case 'text':
            floatText(pos.cx, pos.y + 10, ev.msg, 'f-msg');
            await sleep(slow ? 260 : 140);
            break;
          case 'energy':
            floatText(330, 880, '⚡ +' + ev.n, 'f-status');
            break;
          case 'shuffle':
            floatText(180, 950, '덱 섞는 중…', 'f-msg');
            break;
          default: break;
        }
      }
      refreshAll();
    }

    function banner(text) {
      const b = root.querySelector('.turn-banner');
      b.textContent = text;
      b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    }

    // ============ interactions ============
    function onCardClick(card) {
      if (busy || c.over || c.phase !== 'player') return;
      if (pending && pending.type === 'card' && pending.card === card) { cancelPending(); return; }
      if (!canPlay(c, card)) {
        const d = cardData(card);
        if (d.type === 'attack' && c.player.statuses.entangled) toast('포박되어 공격 카드를 사용할 수 없습니다!');
        else if (d.unplayable) toast('사용할 수 없는 카드입니다.');
        else toast('에너지가 부족합니다!');
        return;
      }
      const d = cardData(card);
      const alive = c.aliveEnemies();
      if (d.target === 'one' && alive.length > 1) {
        pending = { type: 'card', card };
        refreshAll();
      } else {
        const target = d.target === 'one' ? alive[0]?.uid : null;
        void doPlay(card, target);
      }
    }

    async function doPlay(card, targetUid) {
      cancelPending(false);
      busy = true;
      playCard(c, card, targetUid);
      await drainFx();
      busy = false;
      refreshAll();
      if (c.over) finish();
    }

    function confirmTarget(uid) {
      if (!pending) return;
      const p = pending;
      cancelPending(false);
      if (p.type === 'card') void doPlay(p.card, uid);
      else void doUsePotion(p.slot, uid);
    }

    function cancelPending(rerender = true) {
      pending = null;
      arrowSvg.innerHTML = '';
      if (rerender) refreshAll();
    }

    function onPotionClick(slot, anchor) {
      if (busy) return;
      const pid = run.potions[slot];
      if (!pid) return;
      const def = POTIONS[pid];
      potionMenu(anchor, {
        canUse: !c.over,
        onUse: () => {
          if (def.target === 'one' && c.aliveEnemies().length > 1) {
            pending = { type: 'potion', slot };
            refreshAll();
          } else void doUsePotion(slot, c.aliveEnemies()[0]?.uid);
        },
        onDiscard: () => { run.potions[slot] = null; refreshAll(); },
      });
    }

    async function doUsePotion(slot, targetUid) {
      busy = true;
      usePotionInCombat(c, slot, targetUid);
      await drainFx();
      busy = false;
      refreshAll();
      if (c.over) finish();
    }

    function showDeck() {
      cardGridOverlay('내 덱', [...run.deck].sort((a, b) => a.id.localeCompare(b.id)), { c: null });
    }

    // targeting arrow
    root.addEventListener('mousemove', (ev) => {
      if (!pending) return;
      const { x, y } = (function () {
        const stage = $('#stage').getBoundingClientRect();
        const scale = stage.width / 1920;
        return { x: (ev.clientX - stage.left) / scale, y: (ev.clientY - stage.top) / scale };
      })();
      const x0 = 960, y0 = 980;
      const mx = (x0 + x) / 2, my = Math.min(y0, y) - 140;
      arrowSvg.innerHTML = `
        <path d="M${x0} ${y0} Q${mx} ${my} ${x} ${y}" fill="none" stroke="#ff5a4d" stroke-width="6" stroke-dasharray="14 10" opacity=".9"/>
        <circle cx="${x}" cy="${y}" r="10" fill="#ff5a4d"/>`;
    });
    root.addEventListener('click', (ev) => {
      if (pending && !ev.target.closest('.unit.enemy') && !ev.target.closest('.card')) cancelPending();
    });
    document.addEventListener('keydown', escListener);
    function escListener(ev) {
      if (ev.key === 'Escape' && pending) cancelPending();
      if (ev.key === 'e' && !busy && c.phase === 'player' && !c.over) void onEndTurn();
    }

    endBtn.onclick = () => void onEndTurn();

    async function onEndTurn() {
      if (busy || c.over || c.phase !== 'player') return;
      cancelPending(false);
      busy = true;
      endPlayerTurn(c);
      await drainFx();
      if (c.over) { busy = false; finish(); return; }
      banner('적의 턴');
      await sleep(500);
      let acted;
      while ((acted = enemyTurnStep(c))) {
        await drainFx({ slow: true });
        if (c.over) break;
        await sleep(250);
      }
      if (!c.over) {
        finishEnemyPhase(c);
        banner('나의 턴');
        await drainFx();
      }
      busy = false;
      refreshAll();
      if (c.over) finish();
    }

    async function finish() {
      if (finished) return;
      finished = true;
      document.removeEventListener('keydown', escListener);
      await sleep(600);
      run.hp = c.player.hp;
      resolve(c.over);
    }

    // ============ start ============
    startCombat(c);
    banner(kind === 'boss' ? '보스 전투!' : kind === 'elite' ? '정예 전투!' : '전투 시작!');
    void drainFx();
  });
}
