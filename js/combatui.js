// Combat screen — drag & drop card play, number-key pickup, fx animation loop.
//  · 단일 대상 카드: 적 위에 드랍 (조준 화살표 표시)
//  · 모든 카드: 위쪽 전장으로 "꺼내서" 드랍하면 사용 (단일 대상 카드는 적이 하나일 때만)
//  · 숫자키 1~9, 0: 손패 순서대로 카드를 집음 → 마우스로 옮겨 클릭으로 드랍
import {
  createCombat, startCombat, playCard, endPlayerTurn, enemyTurnStep, finishEnemyPhase,
  usePotionInCombat, canPlay, attackDamage, previewValues,
} from './combat.js';
import { SPRITES, INTENT_ICONS } from './art.js';
import {
  el, $, cardEl, statusChips, floatText, shakeStage, elStageRect, stageCoords,
  renderTopbar, potionMenu, cardGridOverlay, sleep, toast, STATUS_INFO,
} from './ui.js';
import { POTIONS } from './data/potions.js';
import { cardData } from './data/cards.js';

const DROP_Y = 640; // 이 높이(스테이지 좌표)보다 위에서 드랍하면 "꺼내서 사용"
const SPEED_KEY = 'spire-ascent-speed';

export function runCombat(run, enemyIds, rng, kind = 'monster') {
  return new Promise((resolve) => {
    const c = createCombat(run, enemyIds, rng, kind);
    const screen = $('#screen');
    screen.innerHTML = '';
    screen.className = `screen-combat act-${run.act || 1}`;

    const root = el('div', 'combat');
    root.innerHTML = `
      <div class="battlefield">
        <div class="drop-hint">여기에 드랍하여 사용</div>
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
          <button class="end-turn"><span>턴 종료</span><kbd>E</kbd></button>
          <button class="speed-btn" data-tip="<b class='tip-title'>전투 속도</b>적 턴과 연출 속도를 조절합니다."></button>
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

    let drag = null;          // {card, viaKey, el(ghost), startX, startY, moved, hoverUid}
    let potionTarget = null;  // {slot} — 물약 대상 지정 모드
    let busy = false;
    let finished = false;
    let lastMouse = { x: 960, y: 700 };
    let speed = Number(localStorage.getItem(SPEED_KEY)) || 1; // 1=보통, 2=빠름
    const wait = (ms) => sleep(ms / speed);

    // ============ rendering ============
    const INTENT_TIP = {
      attack: (d) => `<b class='tip-title'>공격 의도</b>피해를 <b>${d}</b> 줄 생각입니다.`,
      defend: () => `<b class='tip-title'>방어 의도</b>방어도를 얻을 생각입니다.`,
      buff: () => `<b class='tip-title'>강화 의도</b>자신이나 아군을 강화할 생각입니다.`,
      debuff: () => `<b class='tip-title'>약화 의도</b>해로운 효과를 걸 생각입니다.`,
      status: () => `<b class='tip-title'>방해 의도</b>내 덱에 쓸모없는 카드를 섞을 생각입니다.`,
      sleep: () => `<b class='tip-title'>수면</b>잠들어 있습니다.`,
      stunned: () => `<b class='tip-title'>기절</b>이번 턴을 쉽니다.`,
      escape: () => `<b class='tip-title'>도주</b>곧 사라질 생각입니다!`,
      unknown: () => `<b class='tip-title'>알 수 없음</b>무슨 짓을 할지 알 수 없습니다.`,
    };

    function intentHtml(e) {
      if (e.hp <= 0 || e.gone) return '';
      if (e.stunned) return `<div class="intent" data-tip="${INTENT_TIP.stunned()}">${INTENT_ICONS.stunned}</div>`;
      const m = e.intent;
      if (!m) return '';
      let icon;
      if (m.dmg !== undefined) {
        const dmg = attackDamage(m.dmg, e.statuses, c.player.statuses);
        const hits = m.hits || 1;
        if (m.intent === 'attack-defend') icon = INTENT_ICONS['attack-defend'];
        else if (m.intent === 'attack-debuff') icon = INTENT_ICONS['attack-debuff'];
        else icon = dmg >= 20 ? INTENT_ICONS.bigAttack : INTENT_ICONS.attack;
        const total = hits > 1 ? `${dmg}×${hits}` : `${dmg}`;
        return `<div class="intent" data-tip="${INTENT_TIP.attack(total)}">${icon}<span class="intent-num">${dmg}${hits > 1 ? `×${hits}` : ''}</span></div>`;
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
      const pb = root.querySelector('.unit.player .unit-bars');
      pb.innerHTML = barsHtml(c.player.hp, c.player.maxHp, c.player.block);
      pb.appendChild(statusChips(c.player.statuses));
      enemiesBox.innerHTML = '';
      const targeting = (drag && needsSingleTarget(drag.card)) || potionTarget;
      for (const e of c.enemies) {
        if (e.gone) continue;
        const u = el('div', `unit enemy size-${e.size}${e.hp <= 0 ? ' dead' : ''}${targeting && e.hp > 0 ? ' targetable' : ''}`);
        u.dataset.uid = e.uid;
        const spriteFn = SPRITES[e.id] || SPRITES.acidSlimeM;
        u.innerHTML = `
          ${intentHtml(e)}
          <div class="sprite">${spriteFn()}</div>
          <div class="unit-bars">${barsHtml(e.hp, e.maxHp, e.block)}</div>
          <div class="unit-name">${e.name}</div>`;
        u.querySelector('.unit-bars').appendChild(statusChips(e.statuses));
        if (e.hp > 0) {
          u.addEventListener('pointerdown', (ev) => {
            if (potionTarget) {
              ev.stopPropagation();
              const slot = potionTarget.slot;
              potionTarget = null;
              arrowSvg.innerHTML = '';
              void doUsePotion(slot, e.uid);
            }
          });
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
        if (i < 10) ce.appendChild(el('span', 'card-key', String(i < 9 ? i + 1 : 0)));
        if (canPlay(c, card) && !busy) ce.classList.add('playable');
        if (drag && drag.card === card) ce.classList.add('ghost-origin');
        ce.addEventListener('pointerdown', (ev) => {
          ev.preventDefault();
          if (drag && drag.viaKey) { attemptDrop(); return; } // 숫자키로 집은 상태에서 클릭 → 드랍 시도
          onCardPointerDown(card, ev);
        });
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
      endBtn.querySelector('span').textContent = c.phase === 'player' ? '턴 종료' : '적의 턴…';
      const spdBtn = root.querySelector('.speed-btn');
      spdBtn.textContent = speed === 1 ? '▶ 보통 속도' : '⏩ 빠른 속도';
      spdBtn.onclick = () => {
        speed = speed === 1 ? 2 : 1;
        try { localStorage.setItem(SPEED_KEY, String(speed)); } catch (e) { /* ignore */ }
        refreshHud();
      };
      root.querySelector('.pile-btn.draw').onclick = () => cardGridOverlay('뽑을 카드 더미 (순서 무작위)', [...c.drawPile].sort((a, b) => a.id.localeCompare(b.id)), { c });
      root.querySelector('.pile-btn.discard').onclick = () => cardGridOverlay('버린 카드 더미', [...c.discardPile], { c });
      root.querySelector('.pile-btn.exhaust').onclick = () => cardGridOverlay('소멸된 카드', [...c.exhaustPile], { c });
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
            await wait(slow ? 220 : 120);
            break;
          }
          case 'blockGain':
            floatText(pos.cx, pos.y + 60, '🛡 ' + ev.amt, 'f-block');
            await wait(slow ? 160 : 60);
            break;
          case 'heal':
            floatText(pos.cx, pos.y + 40, '+' + ev.amt, 'f-heal');
            await wait(slow ? 160 : 60);
            break;
          case 'status': {
            const name = STATUS_INFO[ev.k]?.name || ev.k;
            floatText(pos.cx, pos.y + 20, `${name} ${ev.n > 0 ? '+' : ''}${ev.n}`, ev.n > 0 ? 'f-status' : 'f-status-neg');
            await wait(slow ? 180 : 80);
            break;
          }
          case 'enemyMove':
            if (unit) {
              floatText(pos.cx, pos.y - 30, ev.label, 'f-move');
              unit.classList.add('lunge');
              setTimeout(() => unit.classList.remove('lunge'), 400);
            }
            await wait(360);
            break;
          case 'die':
            if (unit) unit.classList.add('dead');
            await wait(slow ? 300 : 180);
            break;
          case 'escape':
            floatText(pos.cx, pos.y, '소멸…', 'f-move');
            await wait(300);
            break;
          case 'split':
            floatText(pos.cx, pos.y, '분열!', 'f-move');
            await wait(300);
            break;
          case 'spawn':
            floatText(pos.cx, pos.y + 30, '출현!', 'f-move');
            await wait(slow ? 280 : 160);
            break;
          case 'text':
            floatText(pos.cx, pos.y + 10, ev.msg, 'f-msg');
            await wait(slow ? 260 : 140);
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

    // ============ drag & drop ============
    function needsSingleTarget(card) {
      return cardData(card).target === 'one';
    }

    function beginDrag(card, viaKey, x, y, ev = null) {
      if (busy || c.over || c.phase !== 'player') return false;
      if (!canPlay(c, card)) {
        const d = cardData(card);
        if (d.type === 'attack' && c.player.statuses.entangled) toast('포박되어 공격 카드를 사용할 수 없습니다!');
        else if (d.unplayable) toast('사용할 수 없는 카드입니다.');
        else toast('에너지가 부족합니다!');
        return false;
      }
      cancelDrag(false);
      drag = { card, viaKey, moved: viaKey, hoverUid: null, startX: x, startY: y };
      const ghost = cardEl(card, c);
      ghost.classList.add('drag-ghost');
      root.appendChild(ghost);
      drag.el = ghost;
      root.classList.add('dragging');
      root.classList.toggle('drag-needs-target', needsSingleTarget(card) && c.aliveEnemies().length > 1);
      // 포인터 캡처: 버튼을 누른 채 창 밖으로 나가도 pointerup을 받는다.
      // 캡처 대상은 (재렌더링으로 사라질 수 있는 카드가 아니라) 전투 화면 루트.
      if (ev && ev.pointerId !== undefined) {
        try { root.setPointerCapture(ev.pointerId); } catch (err) { /* 미지원 환경 무시 */ }
      }
      positionGhost(x, y);
      // 주의: 손패를 재렌더링하지 않는다 — pointerdown이 발생한 원본 요소가 파괴되면
      // 터치/일부 트랙패드의 암시적 포인터 캡처가 끊겨 드래그가 중단된다.
      handBox.querySelector(`.card[data-uid="${card.uid}"]`)?.classList.add('ghost-origin');
      refreshUnits(); // 대상 강조만 갱신
      return true;
    }

    function positionGhost(x, y) {
      if (!drag || !drag.el) return;
      drag.el.style.left = (x - 100) + 'px';
      drag.el.style.top = (y - 150) + 'px';
      if (needsSingleTarget(drag.card)) {
        drawArrow(x, y, !!drag.hoverUid);
      } else {
        arrowSvg.innerHTML = '';
        root.classList.toggle('over-drop-zone', y < DROP_Y);
      }
    }

    function drawArrow(x, y, locked) {
      const x0 = drag ? Math.min(Math.max(drag.startX, 300), 1620) : 960;
      const y0 = 970;
      const mx = (x0 + x) / 2, my = Math.min(y0, y) - 150;
      const color = locked ? '#7fdd8a' : '#ff5a4d';
      const ang = Math.atan2(y - my, x - mx) * 180 / Math.PI;
      arrowSvg.innerHTML = `
        <path d="M${x0} ${y0} Q${mx} ${my} ${x} ${y}" fill="none" stroke="${color}" stroke-width="7" stroke-dasharray="16 11" opacity=".92"/>
        <path d="M${x + 16} ${y} l-22 -11 l6 11 l-6 11 Z" fill="${color}" transform="rotate(${ang} ${x} ${y})"/>`;
    }

    function updateHover(x, y) {
      if (!drag) return;
      let found = null;
      for (const u of enemiesBox.querySelectorAll('.unit.enemy:not(.dead)')) {
        const r = elStageRect(u);
        if (x >= r.x - 14 && x <= r.x + r.w + 14 && y >= r.y - 60 && y <= r.y + r.h + 14) { found = u.dataset.uid; break; }
      }
      if (found !== drag.hoverUid) {
        drag.hoverUid = found;
        root.querySelectorAll('.dmg-preview').forEach((p) => p.remove());
        enemiesBox.querySelectorAll('.unit.enemy').forEach((u) => {
          const isTarget = u.dataset.uid === found;
          u.classList.toggle('drop-target', isTarget);
          if (isTarget) showDamagePreview(u);
        });
      }
    }

    // 드랍 대상 적 위에 예상 피해(취약 포함) 표시
    function showDamagePreview(unitEl) {
      if (!drag) return;
      const d = cardData(drag.card);
      if (d.dmg === undefined && d.special !== 'bodySlam') return;
      const target = c.enemies.find((e) => e.uid === unitEl.dataset.uid);
      if (!target) return;
      let dmg = previewValues(c, drag.card).dmg ?? 0;
      if (target.statuses.vuln) dmg = Math.floor(dmg * 1.5);
      const hits = d.hits || 1;
      const chip = el('div', 'dmg-preview', `${dmg}${hits > 1 ? `×${hits}` : ''}`);
      unitEl.appendChild(chip);
    }

    function cancelDrag(rerender = true) {
      if (drag && drag.el) drag.el.remove();
      drag = null;
      arrowSvg.innerHTML = '';
      root.classList.remove('dragging', 'drag-needs-target', 'over-drop-zone');
      if (rerender) refreshAll();
    }

    function attemptDrop() {
      if (!drag) return;
      const { card, hoverUid } = drag;
      const d = cardData(card);
      const { x, y } = lastMouse;
      const alive = c.aliveEnemies();

      if (hoverUid) {
        cancelDrag(false);
        void doPlay(card, d.target === 'one' ? hoverUid : null);
        return;
      }
      if (y < DROP_Y) {
        if (d.target === 'one' && alive.length > 1) {
          toast('이 카드는 적에게 직접 드랍하세요!');
          return; // 드래그 유지
        }
        cancelDrag(false);
        void doPlay(card, d.target === 'one' ? alive[0]?.uid : null);
        return;
      }
      cancelDrag(); // 손으로 되돌림
    }

    function onCardPointerDown(card, ev) {
      const p = stageCoords(ev.clientX, ev.clientY);
      lastMouse = p;
      beginDrag(card, false, p.x, p.y, ev);
    }

    // 전역 포인터 추적
    function onPointerMove(ev) {
      const p = stageCoords(ev.clientX, ev.clientY);
      lastMouse = p;
      if (drag) {
        if (!drag.moved && Math.hypot(p.x - drag.startX, p.y - drag.startY) > 9) drag.moved = true;
        positionGhost(p.x, p.y);
        updateHover(p.x, p.y);
      } else if (potionTarget) {
        drawPotionArrow(p.x, p.y);
      }
    }

    function onPointerUp(ev) {
      if (!drag || drag.viaKey) return; // 키보드로 집은 카드는 클릭으로 드랍
      const p = stageCoords(ev.clientX, ev.clientY);
      lastMouse = p;
      updateHover(p.x, p.y);
      if (!drag.moved) { cancelDrag(); return; } // 제자리 클릭 → 취소
      attemptDrop();
    }

    function onStagePointerDown(ev) {
      if (drag && drag.viaKey) {
        if (ev.target.closest('.hand .card')) return; // 손패 클릭은 카드 핸들러가 처리
        const p = stageCoords(ev.clientX, ev.clientY);
        lastMouse = p;
        updateHover(p.x, p.y);
        if (p.y >= DROP_Y && !drag.hoverUid) { cancelDrag(); return; } // 손 근처 클릭 → 내려놓기
        attemptDrop();
      }
    }

    function drawPotionArrow(x, y) {
      arrowSvg.innerHTML = `
        <path d="M960 980 Q${(960 + x) / 2} ${Math.min(980, y) - 150} ${x} ${y}" fill="none" stroke="#5fb6c9" stroke-width="6" stroke-dasharray="12 10" opacity=".9"/>
        <circle cx="${x}" cy="${y}" r="9" fill="#5fb6c9"/>`;
    }

    // pointercancel(브라우저의 제스처 가로채기 등)·창 포커스 상실 시 드래그가 붕 뜨지 않게 정리
    function onPointerCancel() {
      if (drag) cancelDrag();
      if (potionTarget) { potionTarget = null; arrowSvg.innerHTML = ''; }
    }
    function onWindowBlur() { onPointerCancel(); }

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('blur', onWindowBlur);
    root.addEventListener('pointerdown', onStagePointerDown);
    root.addEventListener('contextmenu', (ev) => {
      if (drag || potionTarget) { ev.preventDefault(); potionTarget = null; cancelDrag(); }
    });

    // ============ 숫자키 / 단축키 ============
    // ev.code 기준으로 판정 — 한글 IME가 켜져 있어도(E키가 'ㄷ'으로 들어와도) 동작한다.
    function onKeyDown(ev) {
      if (finished) return;
      if (ev.key === 'Escape') { potionTarget = null; arrowSvg.innerHTML = ''; cancelDrag(); return; }
      if (ev.code === 'KeyE' || ev.key === 'e' || ev.key === 'E') {
        if (!busy && c.phase === 'player' && !c.over && !drag) void onEndTurn();
        return;
      }
      const digitMatch = /^(?:Digit|Numpad)([0-9])$/.exec(ev.code) || (/^[0-9]$/.test(ev.key) ? [null, ev.key] : null);
      if (digitMatch && !busy && c.phase === 'player' && !c.over) {
        const digit = digitMatch[1];
        const idx = digit === '0' ? 9 : Number(digit) - 1;
        const card = c.hand[idx];
        if (!card) return;
        if (drag && drag.card === card) { cancelDrag(); return; } // 같은 키 한 번 더 → 내려놓기
        beginDrag(card, true, lastMouse.x, lastMouse.y);
      }
    }
    document.addEventListener('keydown', onKeyDown);

    // ============ actions ============
    async function doPlay(card, targetUid) {
      busy = true;
      root.classList.remove('dragging', 'drag-needs-target', 'over-drop-zone');
      playCard(c, card, targetUid);
      await drainFx();
      busy = false;
      refreshAll();
      if (c.over) finish();
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
            potionTarget = { slot };
            refreshAll();
            toast('대상 적을 클릭하세요');
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

    endBtn.onclick = () => void onEndTurn();

    async function onEndTurn() {
      if (busy || c.over || c.phase !== 'player') return;
      potionTarget = null;
      cancelDrag(false);
      busy = true;
      endPlayerTurn(c);
      await drainFx();
      if (c.over) { busy = false; finish(); return; }
      banner('적의 턴');
      await wait(500);
      let acted;
      while ((acted = enemyTurnStep(c))) {
        await drainFx({ slow: true });
        if (c.over) break;
        await wait(250);
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
      cancelDrag(false);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('blur', onWindowBlur);
      await wait(600);
      run.hp = c.player.hp;
      resolve(c.over);
    }

    // ============ start ============
    startCombat(c);
    banner(kind === 'boss' ? '보스 전투!' : kind === 'elite' ? '정예 전투!' : '전투 시작!');
    void drainFx();
  });
}
