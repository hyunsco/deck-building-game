// Shared UI helpers — DOM builders, tooltips, top bar, card elements, overlays, floating text.
import { cardData } from './data/cards.js';
import { renderCardText, cardCost } from './combat.js';
import { RELICS } from './data/relics.js';
import { POTIONS } from './data/potions.js';
import { ACTS } from './data/enemies.js';

export function el(tag, cls = '', html = '') {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

export const $ = (sel) => document.querySelector(sel);

// ============ status metadata ============
export const STATUS_INFO = {
  str: { name: '힘', cls: 'buff', desc: '공격 피해가 {n} 증가합니다.' },
  dex: { name: '민첩', cls: 'buff', desc: '카드로 얻는 방어도가 {n} 증가합니다.' },
  vuln: { name: '취약', cls: 'debuff', desc: '공격으로 받는 피해가 50% 증가합니다. ({n}턴)' },
  weak: { name: '약화', cls: 'debuff', desc: '공격으로 주는 피해가 25% 감소합니다. ({n}턴)' },
  frail: { name: '손상', cls: 'debuff', desc: '카드로 얻는 방어도가 25% 감소합니다. ({n}턴)' },
  thorns: { name: '가시', cls: 'buff', desc: '공격을 받으면 공격자에게 피해를 {n} 줍니다.' },
  metallicize: { name: '금속화', cls: 'buff', desc: '턴 종료 시 방어도를 {n} 얻습니다.' },
  feelNoPain: { name: '고통 무시', cls: 'buff', desc: '카드가 소멸할 때마다 방어도를 {n} 얻습니다.' },
  demonForm: { name: '악마의 형상', cls: 'buff', desc: '턴 시작 시 힘을 {n} 얻습니다.' },
  ritual: { name: '의식', cls: 'buff', desc: '턴 종료 시 힘을 {n} 얻습니다.' },
  curlUp: { name: '웅크리기', cls: 'buff', desc: '처음 공격으로 피해를 입으면 방어도를 {n} 얻습니다.' },
  angry: { name: '분노', cls: 'buff', desc: '공격받을 때마다 힘을 {n} 얻습니다.' },
  enrage: { name: '격분', cls: 'buff', desc: '플레이어가 스킬을 사용할 때마다 힘을 {n} 얻습니다.' },
  artifact: { name: '결계', cls: 'buff', desc: '디버프를 {n}회 무효화합니다.' },
  spore: { name: '포자 구름', cls: 'buff', desc: '사망 시 플레이어에게 취약을 {n} 부여합니다.' },
  asleep: { name: '수면', cls: 'neutral', desc: '잠들어 있습니다. 피해를 입으면 깨어납니다.' },
  metallicizeE: { name: '금속화', cls: 'buff', desc: '턴 종료 시 방어도를 {n} 얻습니다.' },
  modeShift: { name: '모드 전환', cls: 'neutral', desc: '피해를 {n} 더 받으면 방어 태세로 전환합니다.' },
  sharpHide: { name: '가시 외피', cls: 'buff', desc: '공격 카드를 사용할 때마다 피해를 {n} 받습니다.' },
  entangled: { name: '포박', cls: 'debuff', desc: '이번 턴에 공격 카드를 사용할 수 없습니다.' },
  noDraw: { name: '뽑기 불가', cls: 'debuff', desc: '이번 턴에 카드를 더 뽑을 수 없습니다.' },
  flexDown: { name: '임시 힘', cls: 'neutral', desc: '턴 종료 시 힘을 {n} 잃습니다.' },
  barricadeE: { name: '방벽', cls: 'buff', desc: '방어도가 턴이 지나도 사라지지 않습니다.' },
  intangible: { name: '무형', cls: 'buff', desc: '받는 모든 피해가 1로 감소합니다. ({n}턴)' },
  fading: { name: '소멸 예정', cls: 'neutral', desc: '{n}턴 후 스스로 사라집니다.' },
};

export function statusChips(statuses) {
  const row = el('div', 'status-row');
  for (const [k, n] of Object.entries(statuses)) {
    const info = STATUS_INFO[k];
    if (!info) continue;
    const chip = el('span', `status-chip ${info.cls}${n < 0 ? ' negative' : ''}`, `${info.name} <b>${n}</b>`);
    chip.dataset.tip = `<b class="tip-title">${info.name}</b>${info.desc.replaceAll('{n}', `<b>${Math.abs(n) === n ? n : n}</b>`)}`;
    row.appendChild(chip);
  }
  return row;
}

// ============ tooltip (event delegation, stage coords) ============
let tipEl = null;
export function initTooltips() {
  tipEl = $('#tooltip');
  document.addEventListener('mousemove', (ev) => {
    const t = ev.target.closest('[data-tip]');
    if (!t) { tipEl.style.display = 'none'; return; }
    tipEl.innerHTML = t.dataset.tip;
    tipEl.style.display = 'block';
    const { x, y } = stageCoords(ev.clientX, ev.clientY);
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    tipEl.style.left = Math.max(8, Math.min(1920 - w - 8, x + 24)) + 'px';
    tipEl.style.top = Math.max(8, Math.min(1080 - h - 8, y - h - 16 < 8 ? y + 28 : y - h - 16)) + 'px';
  });
}

export function stageCoords(clientX, clientY) {
  const stage = $('#stage');
  const r = stage.getBoundingClientRect();
  const scale = r.width / 1920;
  return { x: (clientX - r.left) / scale, y: (clientY - r.top) / scale };
}

export function elStageRect(elm) {
  const stage = $('#stage').getBoundingClientRect();
  const scale = stage.width / 1920;
  const r = elm.getBoundingClientRect();
  return {
    x: (r.left - stage.left) / scale, y: (r.top - stage.top) / scale,
    w: r.width / scale, h: r.height / scale,
    cx: (r.left - stage.left + r.width / 2) / scale, cy: (r.top - stage.top + r.height / 2) / scale,
  };
}

// ============ card element ============
const CARD_ART = {
  strike: '⚔️', defend: '🛡️', bash: '💥', anger: '😡', armaments: '⚒️', bodySlam: '🐏',
  cleave: '🪓', clothesline: '🪢', ironWave: '🌊', pommelStrike: '🔨', shrugItOff: '🤷',
  twinStrike: '⚔️', swordBoomerang: '🪃', heavyBlade: '🗡️', flex: '💪', thunderclap: '⛈️',
  perfectedStrike: '🎯', battleTrance: '🧠', carnage: '🩸', disarm: '🫳', feelNoPain: '😤',
  inflame: '🔥', metallicize: '⚙️', uppercut: '🥊', whirlwind: '🌪️', ghostlyArmor: '👻',
  bludgeon: '🔨', demonForm: '😈', impervious: '🏰', offering: '❤️‍🔥', reaper: '💀',
  limitBreak: '💢', burn: '🔥', wound: '🩹', slimed: '💧', dazed: '💫', doubt: '🌫️',
};
const TYPE_LABEL = { attack: '공격', skill: '스킬', power: '파워', status: '상태', curse: '저주' };

// 카드 키워드 용어 사전 (설명 안 키워드 호버 툴팁)
const KEYWORD_TIPS = {
  '취약': '공격으로 받는 피해가 50% 증가합니다.',
  '약화': '공격으로 주는 피해가 25% 감소합니다.',
  '손상': '카드로 얻는 방어도가 25% 감소합니다.',
  '소멸': '사용하면 이번 전투 동안 제거됩니다.',
  '휘발성': '턴 종료 시 손에 있으면 소멸합니다.',
  '힘': '공격 피해가 수치만큼 증가합니다.',
  '민첩': '카드로 얻는 방어도가 수치만큼 증가합니다.',
  '방어도': '공격 피해를 대신 흡수합니다. 턴 시작 시 사라집니다.',
};

export function cardEl(card, c = null, opts = {}) {
  const d = cardData(card);
  const e = el('div', `card type-${d.type} rarity-${d.rarity}${card.upgraded ? ' upgraded' : ''}${opts.small ? ' small' : ''}`);
  e.dataset.uid = card.uid;
  const cost = d.unplayable ? null : d.cost;
  // 설명은 반드시 단일 <span>으로 감싼다 — flex 컨테이너에 텍스트+태그가 섞이면
  // 조각마다 flex 아이템이 되어 한국어가 세로로 깨진다.
  e.innerHTML = `
    ${cost !== null ? `<div class="card-cost">${cost === 'X' ? 'X' : cost}</div>` : ''}
    <div class="card-name">${d.displayName}</div>
    <div class="card-art"><span>${CARD_ART[d.id] || '✨'}</span></div>
    <div class="card-type">${TYPE_LABEL[d.type]}</div>
    <div class="card-desc"><span class="desc-text">${renderCardText(card, c)}</span></div>`;
  for (const kw of e.querySelectorAll('.card-desc .kw')) {
    const tip = KEYWORD_TIPS[kw.textContent];
    if (tip) kw.dataset.tip = `<b class="tip-title">${kw.textContent}</b>${tip}`;
  }
  if (c && cost !== null) {
    const real = cardCost(c, card);
    const costEl = e.querySelector('.card-cost');
    if (real > c.player.energy || (d.type === 'attack' && c.player.statuses.entangled)) {
      costEl.classList.add('unaffordable');
    }
  }
  return e;
}

// ============ top bar / relics / potions ============
export function renderTopbar(run, handlers = {}) {
  const bar = $('#topbar');
  bar.innerHTML = '';
  const left = el('div', 'tb-left');
  const actName = (ACTS[run.act] || ACTS[1]).name;
  left.appendChild(el('span', 'tb-name', `철갑 전사 <span class="tb-sub">· ${actName}</span>`));
  const hp = el('span', 'tb-hp', `❤ <b>${run.hp}</b>/${run.maxHp}`);
  hp.dataset.tip = '<b class="tip-title">체력</b>0이 되면 사망합니다. 전투가 끝나도 유지됩니다.';
  const gold = el('span', 'tb-gold', `🪙 <b>${run.gold}</b>`);
  left.append(hp, gold);

  const mid = el('div', 'tb-potions');
  run.potions.forEach((pid, i) => {
    const slot = el('button', 'potion-slot' + (pid ? '' : ' empty'));
    if (pid) {
      const p = POTIONS[pid];
      slot.innerHTML = `<span class="potion-icon" style="--pc:${p.color}">🧪</span>`;
      slot.dataset.tip = `<b class="tip-title">${p.name}</b>${p.desc}<br><span class="tip-sub">클릭하여 사용/버리기</span>`;
      slot.onclick = (ev) => { ev.stopPropagation(); handlers.onPotion && handlers.onPotion(i, slot); };
    } else {
      slot.innerHTML = '<span class="potion-icon empty">·</span>';
      slot.dataset.tip = '<b class="tip-title">빈 물약 슬롯</b>물약은 3개까지 들 수 있습니다.';
    }
    mid.appendChild(slot);
  });

  const right = el('div', 'tb-right');
  const floor = el('span', 'tb-floor', run.pos ? `${run.pos.row + 1}층` : '');
  const deckBtn = el('button', 'tb-btn', `🂠 덱 <b>${run.deck.length}</b>`);
  deckBtn.onclick = () => handlers.onDeck && handlers.onDeck();
  right.append(floor, deckBtn);

  bar.append(left, mid, right);

  const relicbar = $('#relicbar');
  relicbar.innerHTML = '';
  for (const rid of run.relics) {
    const r = RELICS[rid];
    const icon = el('span', 'relic', r.icon);
    let extra = '';
    if (rid === 'penNib') extra = `<br><span class="tip-sub">현재: ${run.counters.penNib}/10</span>`;
    icon.dataset.tip = `<b class="tip-title">${r.name}</b>${r.desc}${extra}`;
    relicbar.appendChild(icon);
  }
}

// 물약 사용/버리기 팝업
export function potionMenu(anchor, { canUse, onUse, onDiscard }) {
  closeMenus();
  const menu = el('div', 'popup-menu');
  const r = elStageRect(anchor);
  menu.style.left = r.x + 'px';
  menu.style.top = (r.y + r.h + 6) + 'px';
  const useBtn = el('button', 'menu-btn' + (canUse ? '' : ' disabled'), '사용');
  if (canUse) useBtn.onclick = () => { closeMenus(); onUse(); };
  const dropBtn = el('button', 'menu-btn', '버리기');
  dropBtn.onclick = () => { closeMenus(); onDiscard(); };
  menu.append(useBtn, dropBtn);
  $('#stage').appendChild(menu);
  setTimeout(() => document.addEventListener('click', closeMenus, { once: true }), 0);
}
export function closeMenus() {
  document.querySelectorAll('.popup-menu').forEach((m) => m.remove());
}

// ============ overlays ============
export function overlay(title, contentEl, { onClose, closable = true } = {}) {
  const ov = el('div', 'overlay');
  const panel = el('div', 'overlay-panel');
  if (title) panel.appendChild(el('h2', 'overlay-title', title));
  panel.appendChild(contentEl);
  const doClose = () => { ov.remove(); document.removeEventListener('keydown', escClose); onClose && onClose(); };
  const escClose = (ev) => { if (ev.key === 'Escape') { ev.stopPropagation(); doClose(); } };
  if (closable) {
    const x = el('button', 'overlay-close', '✕');
    x.onclick = doClose;
    panel.appendChild(x);
    // ESC 또는 패널 바깥(배경) 클릭으로 닫기
    document.addEventListener('keydown', escClose);
    ov.addEventListener('pointerdown', (ev) => { if (ev.target === ov) { ev.stopPropagation(); doClose(); } });
  }
  ov.appendChild(panel);
  $('#stage').appendChild(ov);
  return { close: doClose, root: ov };
}

// card grid (deck view / pick a card)
export function cardGridOverlay(title, cards, { c = null, onPick = null, onClose = null } = {}) {
  const grid = el('div', 'card-grid');
  if (!cards.length) grid.appendChild(el('p', 'grid-empty', '카드가 없습니다.'));
  const ov = overlay(title, grid, { onClose, closable: true });
  for (const card of cards) {
    const ce = cardEl(card, c, { small: true });
    if (onPick) {
      ce.classList.add('pickable');
      ce.onclick = () => { ov.close(); onPick(card); };
    }
    grid.appendChild(ce);
  }
  return ov;
}

// ============ floating text / vfx ============
export function floatText(x, y, text, cls = '') {
  const f = el('div', 'float-text ' + cls, text);
  f.style.left = x + 'px';
  f.style.top = y + 'px';
  $('#fxlayer').appendChild(f);
  setTimeout(() => f.remove(), 1100);
}

export function shakeStage(big = false) {
  const stage = $('#stage');
  stage.classList.remove('shake', 'shake-big');
  void stage.offsetWidth;
  stage.classList.add(big ? 'shake-big' : 'shake');
}

export function toast(msg) {
  const t = el('div', 'toast', msg);
  $('#fxlayer').appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2200);
}

export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
