// Non-combat screens: title, map, rewards, rest, shop, event, treasure, game over.
import { el, $, cardEl, renderTopbar, cardGridOverlay, overlay, potionMenu, toast, sleep } from './ui.js';
import { MAP_ICONS, SPRITES } from './art.js';
import { ROWS, reachable } from './map.js';
import { rollRewardCards, makeCard, CARDS, cardData, CARD_POOL } from './data/cards.js';
import { RELICS, rollRelic } from './data/relics.js';
import { POTIONS, rollPotion } from './data/potions.js';
import { randInt, pick, chance } from './rng.js';

const NODE_LABEL = { monster: '몬스터', elite: '정예', event: '미지의 장소', rest: '휴식처', shop: '상인', treasure: '보물', boss: '보스' };

function setScreen(cls) {
  const s = $('#screen');
  s.innerHTML = '';
  s.className = cls;
  return s;
}

// 전투 밖 물약 사용
function outsidePotionHandler(run, refresh) {
  return (slot, anchor) => {
    const pid = run.potions[slot];
    if (!pid) return;
    const def = POTIONS[pid];
    potionMenu(anchor, {
      canUse: !def.combatOnly,
      onUse: () => {
        if (pid === 'bloodPotion') {
          run.hp = Math.min(run.maxHp, run.hp + Math.floor(run.maxHp * 0.2));
          run.potions[slot] = null;
          toast('체력을 회복했습니다.');
        }
        refresh();
      },
      onDiscard: () => { run.potions[slot] = null; refresh(); },
    });
  };
}

function topbar(run) {
  renderTopbar(run, {
    onDeck: () => cardGridOverlay('내 덱', [...run.deck].sort((a, b) => a.id.localeCompare(b.id)), {}),
    onPotion: outsidePotionHandler(run, () => topbar(run)),
  });
}

// ============ 타이틀 ============
export function titleScreen(hasSave) {
  return new Promise((resolve) => {
    const s = setScreen('screen-title');
    s.innerHTML = `
      <div class="title-bg">
        <div class="spire-silhouette"></div>
        <div class="spire-light"></div>
      </div>
      <div class="title-content">
        <h1 class="game-logo">스파이어<br>어센트</h1>
        <p class="game-sub">SPIRE ASCENT — 로그라이크 덱 빌딩</p>
        <div class="title-menu"></div>
        <p class="title-foot">Slay the Spire에서 영감을 받은 팬 메이드 오마주 · 오리지널 코드 & 아트</p>
      </div>`;
    $('#topbar').innerHTML = '';
    $('#relicbar').innerHTML = '';
    const menu = s.querySelector('.title-menu');
    if (hasSave) {
      const cont = el('button', 'title-btn', '이어서 등반');
      cont.onclick = () => resolve('continue');
      menu.appendChild(cont);
    }
    const start = el('button', 'title-btn', hasSave ? '새로 시작' : '등반 시작');
    start.onclick = () => resolve('new');
    menu.appendChild(start);
    const help = el('button', 'title-btn sub', '플레이 방법');
    help.onclick = showHelp;
    menu.appendChild(help);
  });
}

function showHelp() {
  const content = el('div', 'help-body', `
    <p>● 매 턴 <b>에너지 3</b>으로 카드를 사용해 적을 처치하세요.</p>
    <p>● <b>공격</b> 카드는 피해를 주고, <b>스킬</b> 카드는 방어도 등 효과를 줍니다. 방어도는 턴 시작 시 사라집니다.</p>
    <p>● 적 머리 위 <b>의도 아이콘</b>으로 다음 행동(공격 피해량 등)을 미리 볼 수 있습니다.</p>
    <p>● 전투 승리 후 <b>카드 보상</b>으로 덱을 강화하고, 지도에서 길을 선택해 첨탑을 오르세요.</p>
    <p>● <b>휴식처</b>에서 회복하거나 카드를 강화하고, 15층의 <b>보스</b>를 물리치면 승리합니다.</p>
    <p>● 단축키: <b>E</b> 턴 종료 · <b>ESC</b> 선택 취소</p>`);
  overlay('플레이 방법', content, {});
}

// ============ 지도 ============
export function mapScreen(run) {
  return new Promise((resolve) => {
    const s = setScreen('screen-map');
    topbar(run);

    const W = 1920;
    const rowH = 132;
    const H = ROWS * rowH + 420;
    const nodeX = (col, jx) => 420 + col * 180 + jx;
    const nodeY = (row, jy) => H - 180 - row * rowH + jy;

    let svg = '';
    // edges
    for (let row = 0; row < ROWS - 1; row++) {
      for (const node of Object.values(run.map.grid[row])) {
        for (const nc of node.next) {
          const to = run.map.grid[row + 1][nc];
          if (!to) continue;
          const x1 = nodeX(node.col, node.jx), y1 = nodeY(node.row, node.jy);
          const x2 = nodeX(to.col, to.jx), y2 = nodeY(to.row, to.jy);
          const onPath = run.path.some((p) => p.row === node.row && p.col === node.col) &&
                         run.path.some((p) => p.row === to.row && p.col === to.col);
          svg += `<line x1="${x1}" y1="${y1 - 34}" x2="${x2}" y2="${y2 + 34}" class="map-edge${onPath ? ' traveled' : ''}"/>`;
        }
      }
    }
    // boss edge
    const bossX = W / 2 + 40, bossY = nodeY(ROWS - 1, 0) - 190;
    for (const node of Object.values(run.map.grid[ROWS - 1])) {
      const onPath = run.path.some((p) => p.row === node.row && p.col === node.col);
      svg += `<line x1="${nodeX(node.col, node.jx)}" y1="${nodeY(node.row, node.jy) - 34}" x2="${bossX}" y2="${bossY + 60}" class="map-edge${onPath ? ' traveled' : ''}"/>`;
    }

    const container = el('div', 'map-scroll');
    const sheet = el('div', 'map-sheet');
    sheet.style.height = H + 'px';
    sheet.innerHTML = `<svg class="map-lines" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svg}</svg>
      <div class="map-header">첨탑 지도 — 다음 행선지를 선택하세요</div>
      <div class="map-legend">
        ${['monster', 'elite', 'event', 'rest', 'shop', 'treasure'].map((t) => `<span class="legend-item"><span class="legend-icon">${MAP_ICONS[t]}</span>${NODE_LABEL[t]}</span>`).join('')}
      </div>`;

    const reach = run.pos ? reachable(run.map, run.map.grid[run.pos.row][run.pos.col]) : Object.values(run.map.grid[0]);
    const atTop = run.pos && run.pos.row === ROWS - 1;

    for (let row = 0; row < ROWS; row++) {
      for (const node of Object.values(run.map.grid[row])) {
        const ne = el('div', `map-node type-${node.type}`);
        ne.style.left = (nodeX(node.col, node.jx) - 30) + 'px';
        ne.style.top = (nodeY(node.row, node.jy) - 30) + 'px';
        ne.style.transform = `rotate(${node.rot}deg)`;
        ne.innerHTML = MAP_ICONS[node.type];
        ne.dataset.tip = `<b class="tip-title">${NODE_LABEL[node.type]}</b>${row + 1}층`;
        const visited = run.path.some((p) => p.row === node.row && p.col === node.col);
        if (visited) ne.classList.add('visited');
        if (run.pos && run.pos.row === node.row && run.pos.col === node.col) ne.classList.add('current');
        if (!atTop && reach.includes(node)) {
          ne.classList.add('clickable');
          ne.onclick = () => resolve(node);
        } else if (!visited && !reach.includes(node)) {
          ne.classList.add('dim');
        }
        sheet.appendChild(ne);
      }
    }

    // boss node
    const be = el('div', 'map-node boss' + (atTop ? ' clickable' : ' dim'));
    be.style.left = (bossX - 55) + 'px';
    be.style.top = (bossY - 40) + 'px';
    be.innerHTML = MAP_ICONS.boss;
    be.dataset.tip = `<b class="tip-title">보스</b>첨탑의 수호자가 기다립니다…`;
    if (atTop) be.onclick = () => resolve({ type: 'boss', row: ROWS, col: 3 });
    sheet.appendChild(be);

    container.appendChild(sheet);
    s.appendChild(container);
    // scroll so current position is near the bottom of the view
    const focusRow = run.pos ? run.pos.row : 0;
    container.scrollTop = Math.max(0, nodeY(focusRow, 0) - 760);
  });
}

// ============ 보상 ============
export function rewardsScreen(run, rewards, title = '승리!') {
  return new Promise((resolve) => {
    const s = setScreen('screen-rewards');
    topbar(run);
    s.innerHTML = `<h1 class="big-banner">${title}</h1>`;
    const panel = el('div', 'reward-panel');
    panel.appendChild(el('h2', 'panel-title', '전리품'));

    const addRow = (icon, label, claim) => {
      const row = el('button', 'reward-row', `<span class="reward-icon">${icon}</span><span>${label}</span>`);
      row.onclick = () => {
        const done = claim();
        if (done !== false) {
          row.classList.add('claimed');
          row.disabled = true;
        }
      };
      panel.appendChild(row);
    };

    if (rewards.gold) {
      addRow('🪙', `금화 ${rewards.gold}`, () => { run.gold += rewards.gold; topbar(run); });
    }
    if (rewards.potion) {
      const p = POTIONS[rewards.potion];
      addRow('🧪', p.name, () => {
        const slot = run.potions.indexOf(null);
        if (slot < 0) { toast('물약 슬롯이 가득 찼습니다!'); return false; }
        run.potions[slot] = rewards.potion;
        topbar(run);
      });
    }
    if (rewards.relic) {
      const r = RELICS[rewards.relic];
      addRow(r.icon, r.name, () => {
        gainRelic(run, rewards.relic);
        topbar(run);
      });
    }
    if (rewards.cards) {
      addRow('🂠', '카드 한 장을 덱에 추가', () => {
        cardChoice(run, rewards.cards).then((picked) => {
          if (picked) {
            const row = [...panel.querySelectorAll('.reward-row')].find((r) => r.textContent.includes('카드 한 장'));
            if (row) { row.classList.add('claimed'); row.disabled = true; }
          }
        });
        return false; // claimed via overlay
      });
    }

    const proceed = el('button', 'proceed-btn', '계속 등반 ▲');
    proceed.onclick = () => resolve();
    panel.appendChild(proceed);
    s.appendChild(panel);
  });
}

export function gainRelic(run, relicId) {
  run.relics.push(relicId);
  if (RELICS[relicId].onPickup === 'maxHp7') {
    run.maxHp += 7;
    run.hp += 7;
  }
  toast(`유물 획득: ${RELICS[relicId].name}`);
}

function cardChoice(run, cards) {
  return new Promise((resolve) => {
    const content = el('div', '');
    const row = el('div', 'choice-row');
    for (const card of cards) {
      const ce = cardEl(card, null);
      ce.classList.add('pickable');
      ce.onclick = () => { ov.close(); run.deck.push(card); toast(`획득: ${cardData(card).displayName}`); resolve(card); };
      row.appendChild(ce);
    }
    content.appendChild(row);
    const skip = el('button', 'skip-btn', '건너뛰기');
    content.appendChild(skip);
    const ov = overlay('카드를 선택하세요', content, { closable: false });
    skip.onclick = () => { ov.close(); resolve(null); };
  });
}

// ============ 휴식처 ============
export function restScreen(run) {
  return new Promise((resolve) => {
    const s = setScreen('screen-rest');
    topbar(run);
    s.innerHTML = `
      <div class="rest-scene">
        <div class="rest-glow"></div>
        <div class="rest-fire">${SPRITES.campfire()}</div>
        <div class="rest-hero">${SPRITES.player()}</div>
      </div>
      <h1 class="rest-title">휴식처</h1>
      <div class="rest-options"></div>`;
    const opts = s.querySelector('.rest-options');

    const heal = Math.floor(run.maxHp * 0.3);
    const restBtn = el('button', 'rest-option', `<span class="ro-icon">🛌</span><b>휴식</b><span>체력을 ${heal} 회복합니다<br>(최대 체력의 30%)</span>`);
    restBtn.onclick = () => {
      run.hp = Math.min(run.maxHp, run.hp + heal);
      topbar(run);
      done(`체력을 회복했습니다. (${run.hp}/${run.maxHp})`);
    };

    const upgradable = run.deck.filter((cd) => !cd.upgraded && !['status', 'curse'].includes(CARDS[cd.id].type));
    const smithBtn = el('button', 'rest-option' + (upgradable.length ? '' : ' disabled'), `<span class="ro-icon">⚒️</span><b>단련</b><span>카드 1장을 영구히<br>강화합니다</span>`);
    if (upgradable.length) {
      smithBtn.onclick = () => {
        cardGridOverlay('강화할 카드를 선택하세요', upgradable, {
          onPick: (card) => {
            card.upgraded = true;
            done(`강화 완료: ${cardData(card).displayName}`);
          },
        });
      };
    }
    opts.append(restBtn, smithBtn);

    function done(msg) {
      toast(msg);
      opts.innerHTML = '';
      const btn = el('button', 'proceed-btn', '계속 등반 ▲');
      btn.onclick = () => resolve();
      opts.appendChild(btn);
    }
  });
}

// ============ 상점 ============
export function shopScreen(run, rng) {
  return new Promise((resolve) => {
    const s = setScreen('screen-shop');
    topbar(run);
    s.innerHTML = `
      <div class="shop-head"><span class="shop-keeper">🧙</span><h1>떠돌이 상인</h1><p>"천천히 골라 보게. 물건은 확실하니까."</p></div>
      <div class="shop-cards"></div>
      <div class="shop-row2"></div>
      <div class="shop-foot"></div>`;

    const pickByRarity = (pool) => {
      const r = rng();
      const rarity = r < 0.55 ? 'common' : r < 0.9 ? 'uncommon' : 'rare';
      const ids = pool.filter((id) => CARDS[id].rarity === rarity);
      return pick(rng, ids.length ? ids : pool);
    };
    const price = (rarity) => rarity === 'rare' ? randInt(rng, 135, 165) : rarity === 'uncommon' ? randInt(rng, 68, 82) : randInt(rng, 45, 55);

    const attacks = [...CARD_POOL.common, ...CARD_POOL.uncommon, ...CARD_POOL.rare].filter((id) => CARDS[id].type === 'attack');
    const skills = [...CARD_POOL.common, ...CARD_POOL.uncommon, ...CARD_POOL.rare].filter((id) => CARDS[id].type === 'skill');
    const powers = [...CARD_POOL.uncommon, ...CARD_POOL.rare].filter((id) => CARDS[id].type === 'power');
    const stockIds = [pickByRarity(attacks), pickByRarity(attacks), pickByRarity(skills), pickByRarity(skills), pick(rng, powers)];
    const saleIdx = randInt(rng, 0, stockIds.length - 1);
    const cardStock = stockIds.map((id, i) => {
      const card = makeCard(id, run.relics.includes('toxicEgg'));
      let p = price(CARDS[id].rarity);
      if (i === saleIdx) p = Math.floor(p / 2);
      return { card, price: p, sale: i === saleIdx, sold: false };
    });

    const relicStock = [];
    const ownedPlus = [...run.relics];
    for (let i = 0; i < 2; i++) {
      const rid = rollRelic(rng, ownedPlus);
      if (rid) { ownedPlus.push(rid); relicStock.push({ rid, price: randInt(rng, 143, 157), sold: false }); }
    }
    const potionStock = Array.from({ length: 3 }, () => ({ pid: rollPotion(rng), price: randInt(rng, 48, 52), sold: false }));

    const cardsBox = s.querySelector('.shop-cards');
    const row2 = s.querySelector('.shop-row2');
    const foot = s.querySelector('.shop-foot');

    function refresh() {
      topbar(run);
      cardsBox.innerHTML = '';
      for (const item of cardStock) {
        const wrap = el('div', 'shop-item' + (item.sold ? ' sold' : ''));
        const ce = cardEl(item.card, null, { small: true });
        wrap.appendChild(ce);
        wrap.appendChild(el('div', 'price' + (run.gold < item.price ? ' poor' : '') + (item.sale ? ' sale' : ''), item.sold ? '판매됨' : `🪙 ${item.price}${item.sale ? ' <s>할인!</s>' : ''}`));
        if (!item.sold && run.gold >= item.price) {
          wrap.classList.add('buyable');
          wrap.onclick = () => {
            run.gold -= item.price;
            run.deck.push(item.card);
            item.sold = true;
            toast(`구매: ${cardData(item.card).displayName}`);
            refresh();
          };
        }
        cardsBox.appendChild(wrap);
      }

      row2.innerHTML = '';
      for (const item of relicStock) {
        const r = RELICS[item.rid];
        const wrap = el('div', 'shop-item small-item' + (item.sold ? ' sold' : ''));
        wrap.innerHTML = `<span class="shop-relic" data-tip="<b class='tip-title'>${r.name}</b>${r.desc}">${r.icon}</span>`;
        wrap.appendChild(el('div', 'price' + (run.gold < item.price ? ' poor' : ''), item.sold ? '판매됨' : `🪙 ${item.price}`));
        if (!item.sold && run.gold >= item.price) {
          wrap.classList.add('buyable');
          wrap.onclick = () => { run.gold -= item.price; item.sold = true; gainRelic(run, item.rid); refresh(); };
        }
        row2.appendChild(wrap);
      }
      for (const item of potionStock) {
        const p = POTIONS[item.pid];
        const wrap = el('div', 'shop-item small-item' + (item.sold ? ' sold' : ''));
        wrap.innerHTML = `<span class="shop-relic" style="--pc:${p.color}" data-tip="<b class='tip-title'>${p.name}</b>${p.desc}">🧪</span>`;
        wrap.appendChild(el('div', 'price' + (run.gold < item.price ? ' poor' : ''), item.sold ? '판매됨' : `🪙 ${item.price}`));
        if (!item.sold && run.gold >= item.price) {
          wrap.classList.add('buyable');
          wrap.onclick = () => {
            const slot = run.potions.indexOf(null);
            if (slot < 0) { toast('물약 슬롯이 가득 찼습니다!'); return; }
            run.gold -= item.price;
            run.potions[slot] = item.pid;
            item.sold = true;
            toast(`구매: ${p.name}`);
            refresh();
          };
        }
        row2.appendChild(wrap);
      }

      foot.innerHTML = '';
      const removeBtn = el('button', 'shop-service' + (run.gold < run.removalCost || run.removedThisShop ? ' disabled' : ''),
        `🗑️ 카드 제거 서비스 — 🪙 ${run.removalCost}${run.removedThisShop ? ' (이용 완료)' : ''}`);
      if (run.gold >= run.removalCost && !run.removedThisShop) {
        removeBtn.onclick = () => {
          cardGridOverlay('제거할 카드를 선택하세요', [...run.deck], {
            onPick: (card) => {
              run.gold -= run.removalCost;
              run.removalCost += 25;
              run.removedThisShop = true;
              run.deck.splice(run.deck.indexOf(card), 1);
              toast(`제거: ${cardData(card).displayName}`);
              refresh();
            },
          });
        };
      }
      const leave = el('button', 'proceed-btn', '상점 나가기 ▲');
      leave.onclick = () => resolve();
      foot.append(removeBtn, leave);
    }
    refresh();
  });
}

// ============ 이벤트 ============
export function eventScreen(run, event, rng) {
  return new Promise((resolve) => {
    const s = setScreen('screen-event');
    topbar(run);
    s.innerHTML = `
      <div class="event-panel">
        <div class="event-art">${event.art}</div>
        <h1>${event.title}</h1>
        <p class="event-text">${event.text}</p>
        <div class="event-options"></div>
      </div>`;
    const optsBox = s.querySelector('.event-options');

    const finish = (resultText) => {
      optsBox.innerHTML = '';
      if (resultText) {
        const p = el('p', 'event-result', resultText);
        optsBox.appendChild(p);
      }
      const btn = el('button', 'proceed-btn', '계속 등반 ▲');
      btn.onclick = () => resolve();
      optsBox.appendChild(btn);
      topbar(run);
    };

    for (const opt of event.options) {
      const available = !opt.cond || opt.cond(run);
      const btn = el('button', 'event-option' + (available ? '' : ' disabled'),
        `<b>${opt.label}</b><span>${opt.sub}</span>`);
      if (available) {
        btn.onclick = () => applyEventEffect(run, opt.effect, rng, finish);
      }
      optsBox.appendChild(btn);
    }
  });
}

function applyEventEffect(run, fx, rng, finish) {
  const parts = [];
  if (fx.leave) return finish('당신은 발걸음을 재촉했습니다.');
  if (fx.gold) {
    run.gold = Math.max(0, run.gold + fx.gold);
    parts.push(fx.gold > 0 ? `금화 +${fx.gold}` : `금화 ${fx.gold}`);
  }
  if (fx.hp) {
    if (fx.hp < 0) run.hp = Math.max(1, run.hp + fx.hp);
    else run.hp = Math.min(run.maxHp, run.hp + fx.hp);
    parts.push(fx.hp > 0 ? `체력 +${fx.hp}` : `체력 ${fx.hp}`);
  }
  if (fx.maxHp) {
    run.maxHp += fx.maxHp;
    run.hp += fx.maxHp;
    parts.push(`최대 체력 +${fx.maxHp}`);
  }
  if (fx.healPct) {
    const n = Math.floor(run.maxHp * fx.healPct);
    run.hp = Math.min(run.maxHp, run.hp + n);
    parts.push(`체력 +${n}`);
  }
  if (fx.relic) {
    const rid = rollRelic(rng, run.relics);
    if (rid) { gainRelic(run, rid); parts.push(`유물: ${RELICS[rid].name}`); }
    else parts.push('획득할 유물이 없습니다');
  }
  if (fx.potion) {
    const slot = run.potions.indexOf(null);
    const pid = rollPotion(rng);
    if (slot >= 0) { run.potions[slot] = pid; parts.push(`물약: ${POTIONS[pid].name}`); }
    else parts.push('물약 슬롯이 가득 찼습니다');
  }
  if (fx.curse) {
    run.deck.push(makeCard(fx.curse));
    parts.push(`저주 획득: ${CARDS[fx.curse].name}`);
  }
  if (fx.cardReward) {
    cardChoice(run, rollRewardCards(rng, fx.cardReward));
    parts.push('');
  }
  if (fx.gamble) {
    run.gold -= fx.gamble.cost;
    if (rng() < fx.gamble.p) {
      run.gold += fx.gamble.win;
      parts.push(`승리! 금화 +${fx.gamble.win - fx.gamble.cost}`);
    } else {
      parts.push(`패배… 금화 -${fx.gamble.cost}`);
    }
  }
  if (fx.pickUpgrade) {
    const upgradable = run.deck.filter((cd) => !cd.upgraded && !['status', 'curse'].includes(CARDS[cd.id].type));
    if (!upgradable.length) return finish('강화할 카드가 없습니다.');
    cardGridOverlay('강화할 카드를 선택하세요', upgradable, {
      onPick: (card) => { card.upgraded = true; finish(`강화 완료: ${cardData(card).displayName}`); },
    });
    return;
  }
  if (fx.pickRemove) {
    cardGridOverlay('제거할 카드를 선택하세요', [...run.deck], {
      onPick: (card) => {
        run.deck.splice(run.deck.indexOf(card), 1);
        finish(`제거: ${cardData(card).displayName}`);
      },
    });
    return;
  }
  finish(parts.filter(Boolean).join(' · ') || '…');
}

// ============ 보물 ============
export function treasureScreen(run, rng) {
  return new Promise((resolve) => {
    const s = setScreen('screen-treasure');
    topbar(run);
    s.innerHTML = `
      <div class="treasure-panel">
        <h1>보물 상자</h1>
        <button class="chest">${MAP_ICONS.treasure}</button>
        <p class="treasure-hint">상자를 클릭해 열어보세요</p>
        <div class="treasure-result"></div>
      </div>`;
    const chest = s.querySelector('.chest');
    chest.onclick = () => {
      chest.classList.add('open');
      chest.onclick = null;
      const parts = [];
      const rid = rollRelic(rng, run.relics);
      if (rid) { gainRelic(run, rid); parts.push(`${RELICS[rid].icon} ${RELICS[rid].name}`); }
      if (chance(rng, 0.5)) {
        const g = randInt(rng, 20, 40);
        run.gold += g;
        parts.push(`🪙 금화 ${g}`);
      }
      topbar(run);
      const box = s.querySelector('.treasure-result');
      box.innerHTML = `<p>${parts.join(' · ') || '비어 있습니다…'}</p>`;
      const btn = el('button', 'proceed-btn', '계속 등반 ▲');
      btn.onclick = () => resolve();
      box.appendChild(btn);
    };
  });
}

// ============ 게임 오버 / 승리 ============
export function gameOverScreen(run, victory) {
  return new Promise((resolve) => {
    const s = setScreen('screen-gameover' + (victory ? ' victory' : ''));
    $('#topbar').innerHTML = '';
    $('#relicbar').innerHTML = '';
    const floors = run.path.length;
    const lines = [
      ['등반한 층', floors, floors * 5],
      ['처치한 몬스터', run.monstersSlain, run.monstersSlain * 3],
      ['처치한 정예', run.elitesSlain, run.elitesSlain * 15],
      ['모은 금화', run.gold, Math.floor(run.gold / 5)],
    ];
    if (victory) lines.push(['첨탑의 수호자 격파', 1, 100]);
    const total = lines.reduce((a, l) => a + l[2], 0);

    s.innerHTML = `
      <h1 class="big-banner ${victory ? 'gold' : 'red'}">${victory ? '승리!' : '사망'}</h1>
      <p class="go-sub">${victory ? '첨탑의 수호자를 쓰러뜨렸습니다. 등반은 계속됩니다…' : '첨탑은 당신을 삼켰습니다. 다음 도전자가 기다립니다.'}</p>
      <div class="score-panel"><h2>기록</h2><ul class="score-list"></ul><div class="score-total"></div></div>
      <button class="title-btn" id="go-restart">처음으로</button>`;
    const list = s.querySelector('.score-list');
    lines.forEach((l, i) => {
      setTimeout(() => {
        list.appendChild(el('li', '', `<span>${l[0]} × ${l[1]}</span><b>${l[2]}</b>`));
        if (i === lines.length - 1) {
          setTimeout(() => {
            s.querySelector('.score-total').innerHTML = `총점 <b>${total}</b>`;
          }, 250);
        }
      }, 350 * (i + 1));
    });
    s.querySelector('#go-restart').onclick = () => resolve();
  });
}
