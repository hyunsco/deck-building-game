// Enemy database — Act 1 (첨탑 1막)
// ai(e, c) returns the next move; the engine executes it and appends move.key to e.history.
// Move: { key, label, intent, dmg, hits, block, steal, apply(c, e) }
// intent: attack | defend | buff | debuff | attack-debuff | attack-defend | defend-buff | status | sleep | stunned | escape | unknown

import { randInt, pick, chance } from '../rng.js';

const last = (e, n = 1) => e.history[e.history.length - n];

export const ENEMIES = {
  // ============ 일반 몬스터 ============
  cultist: {
    name: '광신도', hp: [48, 54], size: 'medium',
    ai(e, c) {
      if (e.turn === 0) {
        return { key: 'incant', label: '주문 영창', intent: 'buff', apply: (c2, self) => c2.addEnemyStatus(self, 'ritual', 3) };
      }
      return { key: 'darkStrike', label: '어둠의 일격', intent: 'attack', dmg: 6 };
    },
  },
  jawWorm: {
    name: '턱벌레', hp: [40, 44], size: 'medium',
    ai(e, c) {
      if (e.turn === 0) return { key: 'chomp', label: '깨물기', intent: 'attack', dmg: 11 };
      const r = c.rng();
      const lastKey = last(e);
      if (r < 0.45 && lastKey !== 'bellow') {
        return { key: 'bellow', label: '포효', intent: 'defend-buff', block: 6, apply: (c2, self) => c2.addEnemyStatus(self, 'str', 3) };
      }
      if (r < 0.75 && !(lastKey === 'thrash' && last(e, 2) === 'thrash')) {
        return { key: 'thrash', label: '몸부림', intent: 'attack-defend', dmg: 7, block: 5 };
      }
      if (lastKey !== 'chomp') return { key: 'chomp', label: '깨물기', intent: 'attack', dmg: 11 };
      return { key: 'thrash', label: '몸부림', intent: 'attack-defend', dmg: 7, block: 5 };
    },
  },
  redLouse: {
    name: '붉은 유충', hp: [10, 15], size: 'small',
    init(e, rng) { e.statuses.curlUp = randInt(rng, 3, 7); e.biteDmg = randInt(rng, 5, 7); },
    ai(e, c) {
      const twice = last(e) === last(e, 2);
      if ((c.rng() < 0.75 && !(last(e) === 'bite' && twice)) || (last(e) === 'grow' && twice)) {
        return { key: 'bite', label: '물어뜯기', intent: 'attack', dmg: e.biteDmg };
      }
      return { key: 'grow', label: '성장', intent: 'buff', apply: (c2, self) => c2.addEnemyStatus(self, 'str', 3) };
    },
  },
  greenLouse: {
    name: '초록 유충', hp: [11, 17], size: 'small',
    init(e, rng) { e.statuses.curlUp = randInt(rng, 3, 7); e.biteDmg = randInt(rng, 5, 7); },
    ai(e, c) {
      const twice = last(e) === last(e, 2);
      if ((c.rng() < 0.75 && !(last(e) === 'bite' && twice)) || (last(e) === 'web' && twice)) {
        return { key: 'bite', label: '물어뜯기', intent: 'attack', dmg: e.biteDmg };
      }
      return { key: 'web', label: '거미줄 뱉기', intent: 'debuff', apply: (c2) => c2.applyStatusPlayer('weak', 2) };
    },
  },
  acidSlimeM: {
    name: '산성 슬라임 (중)', hp: [28, 32], size: 'medium',
    ai(e, c) {
      const r = c.rng();
      const lastKey = last(e);
      if (r < 0.3 && !(lastKey === 'spit' && last(e, 2) === 'spit')) {
        return { key: 'spit', label: '부식성 침', intent: 'attack-debuff', dmg: 7, apply: (c2) => c2.addStatusCardToDiscard('slimed', 1) };
      }
      if (r < 0.7 && lastKey !== 'tackle') return { key: 'tackle', label: '몸통 박치기', intent: 'attack', dmg: 10 };
      if (!(lastKey === 'lick' && last(e, 2) === 'lick')) {
        return { key: 'lick', label: '핥기', intent: 'debuff', apply: (c2) => c2.applyStatusPlayer('weak', 1) };
      }
      return { key: 'tackle', label: '몸통 박치기', intent: 'attack', dmg: 10 };
    },
  },
  acidSlimeS: {
    name: '산성 슬라임 (소)', hp: [8, 12], size: 'small',
    ai(e, c) {
      if (e.turn === 0) {
        return chance(c.rng, 0.5)
          ? { key: 'lick', label: '핥기', intent: 'debuff', apply: (c2) => c2.applyStatusPlayer('weak', 1) }
          : { key: 'tackle', label: '몸통 박치기', intent: 'attack', dmg: 3 };
      }
      return last(e) === 'lick'
        ? { key: 'tackle', label: '몸통 박치기', intent: 'attack', dmg: 3 }
        : { key: 'lick', label: '핥기', intent: 'debuff', apply: (c2) => c2.applyStatusPlayer('weak', 1) };
    },
  },
  acidSlimeL: {
    name: '산성 슬라임 (대)', hp: [65, 69], size: 'large',
    splitsInto: 'acidSlimeM',
    ai(e, c) {
      const r = c.rng();
      const lastKey = last(e);
      if (r < 0.3 && !(lastKey === 'spit' && last(e, 2) === 'spit')) {
        return { key: 'spit', label: '부식성 침', intent: 'attack-debuff', dmg: 11, apply: (c2) => c2.addStatusCardToDiscard('slimed', 2) };
      }
      if (r < 0.7 && lastKey !== 'tackle') return { key: 'tackle', label: '몸통 박치기', intent: 'attack', dmg: 16 };
      if (!(lastKey === 'lick' && last(e, 2) === 'lick')) {
        return { key: 'lick', label: '핥기', intent: 'debuff', apply: (c2) => c2.applyStatusPlayer('weak', 2) };
      }
      return { key: 'tackle', label: '몸통 박치기', intent: 'attack', dmg: 16 };
    },
  },
  spikeSlimeM: {
    name: '가시 슬라임 (중)', hp: [28, 32], size: 'medium',
    ai(e, c) {
      const lastKey = last(e);
      if (c.rng() < 0.3 && !(lastKey === 'flameTackle' && last(e, 2) === 'flameTackle')) {
        return { key: 'flameTackle', label: '화염 박치기', intent: 'attack-debuff', dmg: 8, apply: (c2) => c2.addStatusCardToDiscard('slimed', 1) };
      }
      if (!(lastKey === 'lick' && last(e, 2) === 'lick')) {
        return { key: 'lick', label: '핥기', intent: 'debuff', apply: (c2) => c2.applyStatusPlayer('frail', 1) };
      }
      return { key: 'flameTackle', label: '화염 박치기', intent: 'attack-debuff', dmg: 8, apply: (c2) => c2.addStatusCardToDiscard('slimed', 1) };
    },
  },
  spikeSlimeS: {
    name: '가시 슬라임 (소)', hp: [10, 14], size: 'small',
    ai() { return { key: 'tackle', label: '몸통 박치기', intent: 'attack', dmg: 5 }; },
  },
  spikeSlimeL: {
    name: '가시 슬라임 (대)', hp: [64, 70], size: 'large',
    splitsInto: 'spikeSlimeM',
    ai(e, c) {
      const lastKey = last(e);
      if (c.rng() < 0.3 && !(lastKey === 'flameTackle' && last(e, 2) === 'flameTackle')) {
        return { key: 'flameTackle', label: '화염 박치기', intent: 'attack-debuff', dmg: 16, apply: (c2) => c2.addStatusCardToDiscard('slimed', 2) };
      }
      if (!(lastKey === 'lick' && last(e, 2) === 'lick')) {
        return { key: 'lick', label: '핥기', intent: 'debuff', apply: (c2) => c2.applyStatusPlayer('frail', 2) };
      }
      return { key: 'flameTackle', label: '화염 박치기', intent: 'attack-debuff', dmg: 16, apply: (c2) => c2.addStatusCardToDiscard('slimed', 2) };
    },
  },
  fungiBeast: {
    name: '균사 야수', hp: [22, 28], size: 'medium',
    init(e) { e.statuses.spore = 2; },
    ai(e, c) {
      const lastKey = last(e);
      if ((c.rng() < 0.6 && !(lastKey === 'bite' && last(e, 2) === 'bite')) || lastKey === 'grow') {
        return { key: 'bite', label: '물어뜯기', intent: 'attack', dmg: 6 };
      }
      return { key: 'grow', label: '성장', intent: 'buff', apply: (c2, self) => c2.addEnemyStatus(self, 'str', 3) };
    },
  },
  looter: {
    name: '노상강도', hp: [44, 48], size: 'medium',
    ai(e, c) {
      if (e.turn <= 1) return { key: 'mug', label: '갈취', intent: 'attack', dmg: 10, steal: 15 };
      if (e.turn === 2) {
        return chance(c.rng, 0.5)
          ? { key: 'lunge', label: '돌진', intent: 'attack', dmg: 12, steal: 15 }
          : { key: 'smoke', label: '연막탄', intent: 'defend', block: 6 };
      }
      if (last(e) === 'smoke') return { key: 'escape', label: '도주', intent: 'escape' };
      return { key: 'smoke', label: '연막탄', intent: 'defend', block: 6 };
    },
  },
  blueSlaver: {
    name: '푸른 노예상', hp: [46, 50], size: 'medium',
    ai(e, c) {
      const lastKey = last(e);
      const twice = lastKey === last(e, 2);
      if ((c.rng() < 0.6 && !(lastKey === 'stab' && twice)) || (lastKey === 'rake' && twice)) {
        return { key: 'stab', label: '찌르기', intent: 'attack', dmg: 12 };
      }
      return { key: 'rake', label: '갈퀴 긁기', intent: 'attack-debuff', dmg: 7, apply: (c2) => c2.applyStatusPlayer('weak', 1) };
    },
  },
  redSlaver: {
    name: '붉은 노예상', hp: [46, 50], size: 'medium',
    ai(e, c) {
      if (e.turn === 0) return { key: 'stab', label: '찌르기', intent: 'attack', dmg: 13 };
      if (!e.usedEntangle && c.rng() < 0.25) {
        e.usedEntangle = true;
        return { key: 'entangle', label: '포박', intent: 'debuff', apply: (c2) => c2.applyStatusPlayer('entangled', 1) };
      }
      const lastKey = last(e);
      const twice = lastKey === last(e, 2);
      if ((c.rng() < 0.55 && !(lastKey === 'scrape' && twice)) || (lastKey === 'stab' && twice)) {
        return { key: 'scrape', label: '할퀴기', intent: 'attack-debuff', dmg: 8, apply: (c2) => c2.applyStatusPlayer('vuln', 1) };
      }
      return { key: 'stab', label: '찌르기', intent: 'attack', dmg: 13 };
    },
  },

  // ============ 도깨비 무리 ============
  madGremlin: {
    name: '성난 도깨비', hp: [20, 24], size: 'small',
    init(e) { e.statuses.angry = 1; },
    ai() { return { key: 'scratch', label: '할퀴기', intent: 'attack', dmg: 4 }; },
  },
  sneakyGremlin: {
    name: '교활한 도깨비', hp: [10, 14], size: 'small',
    ai() { return { key: 'puncture', label: '급소 찌르기', intent: 'attack', dmg: 9 }; },
  },
  fatGremlin: {
    name: '뚱보 도깨비', hp: [13, 17], size: 'small',
    ai() { return { key: 'smash', label: '내려치기', intent: 'attack-debuff', dmg: 4, apply: (c2) => c2.applyStatusPlayer('weak', 1) }; },
  },
  shieldGremlin: {
    name: '방패 도깨비', hp: [12, 15], size: 'small',
    ai(e, c) {
      const allies = c.aliveEnemies().filter((x) => x.uid !== e.uid);
      if (allies.length > 0) {
        return { key: 'protect', label: '보호', intent: 'defend', apply: (c2, self) => {
          const others = c2.aliveEnemies().filter((x) => x.uid !== self.uid);
          if (others.length) c2.gainEnemyBlock(pick(c2.rng, others), 7);
        } };
      }
      return { key: 'shieldBash', label: '방패 치기', intent: 'attack', dmg: 6 };
    },
  },
  wizardGremlin: {
    name: '도깨비 주술사', hp: [23, 25], size: 'small',
    ai(e) {
      if (e.turn % 3 === 2) return { key: 'blast', label: '비전 폭발', intent: 'attack', dmg: 25 };
      return { key: 'charge', label: '마력 충전', intent: 'unknown' };
    },
  },

  // ============ 정예 (Elite) ============
  gremlinNob: {
    name: '도깨비 거두', hp: [82, 86], size: 'large',
    ai(e, c) {
      if (e.turn === 0) {
        return { key: 'bellow', label: '울부짖기', intent: 'buff', apply: (c2, self) => c2.addEnemyStatus(self, 'enrage', 2) };
      }
      if (c.rng() < 0.33 || (last(e) === 'rush' && last(e, 2) === 'rush')) {
        return { key: 'skullBash', label: '두개골 강타', intent: 'attack-debuff', dmg: 6, apply: (c2) => c2.applyStatusPlayer('vuln', 2) };
      }
      return { key: 'rush', label: '돌진', intent: 'attack', dmg: 14 };
    },
  },
  lagavulin: {
    name: '잠자는 갑충', hp: [109, 111], size: 'large',
    init(e) { e.statuses.asleep = 1; e.statuses.metallicizeE = 8; },
    onHpLoss(e, c) {
      if (e.statuses.asleep) {
        delete e.statuses.asleep; delete e.statuses.metallicizeE;
        e.stunned = true; e.awakeTurn = 0;
        c.fx.push({ t: 'text', who: e.uid, msg: '기상!' });
      }
    },
    ai(e, c) {
      if (e.statuses.asleep) {
        if (e.turn >= 2) {
          delete e.statuses.asleep; delete e.statuses.metallicizeE;
          e.awakeTurn = 0;
          c.fx.push({ t: 'text', who: e.uid, msg: '기상!' });
        } else {
          return { key: 'sleep', label: '깊은 잠', intent: 'sleep' };
        }
      }
      const seq = e.awakeTurn % 3;
      e.awakeTurn++;
      if (seq < 2) return { key: 'attack', label: '내리찍기', intent: 'attack', dmg: 18 };
      return { key: 'siphon', label: '영혼 흡수', intent: 'debuff', apply: (c2) => { c2.addPlayerStatus('dex', -1); c2.addPlayerStatus('str', -1); } };
    },
  },
  sentry: {
    name: '파수꾼', hp: [38, 42], size: 'medium',
    init(e) { e.statuses.artifact = 1; },
    ai(e) {
      const startBolt = e.slot !== 1;
      const useBolt = (e.turn % 2 === 0) === startBolt;
      if (useBolt) {
        return { key: 'bolt', label: '환영 화살', intent: 'status', apply: (c2) => c2.addStatusCardToDiscard('dazed', 2) };
      }
      return { key: 'beam', label: '광선', intent: 'attack', dmg: 9 };
    },
  },

  // ============ 보스 (Boss) ============
  guardian: {
    name: '거대 수호자', hp: [240, 240], size: 'boss',
    init(e) { e.mode = 'off'; e.seq = 0; e.shiftMax = 30; e.shiftLeft = 30; e.statuses.modeShift = 30; },
    onHpLoss(e, c, amt) {
      if (e.mode !== 'off' || e.hp <= 0) return;
      e.shiftLeft -= amt;
      e.statuses.modeShift = Math.max(0, e.shiftLeft);
      if (e.shiftLeft <= 0) {
        e.mode = 'def'; e.seq = 0;
        delete e.statuses.modeShift;
        c.gainEnemyBlock(e, 20);
        c.fx.push({ t: 'text', who: e.uid, msg: '방어 태세!' });
        c.refreshIntent(e); // 현재 의도를 중단하고 방어 태세로 전환
      }
    },
    ai(e, c) {
      if (e.mode === 'off') {
        const moves = [
          { key: 'chargeUp', label: '충전', intent: 'defend', block: 9 },
          { key: 'fierceBash', label: '맹렬한 강타', intent: 'attack', dmg: 32 },
          { key: 'vent', label: '증기 분출', intent: 'debuff', apply: (c2) => { c2.applyStatusPlayer('weak', 2); c2.applyStatusPlayer('vuln', 2); } },
          { key: 'whirl', label: '회전 공격', intent: 'attack', dmg: 5, hits: 4 },
        ];
        const m = moves[e.seq % 4];
        e.seq++;
        return m;
      }
      const defSeq = [
        { key: 'defMode', label: '가시 돋우기', intent: 'buff', apply: (c2, self) => c2.addEnemyStatus(self, 'sharpHide', 3) },
        { key: 'rollAttack', label: '구르기 공격', intent: 'attack', dmg: 9 },
        { key: 'twinSlam', label: '연속 내리치기', intent: 'attack', dmg: 8, hits: 2, apply: (c2, self) => {
          delete self.statuses.sharpHide;
          self.mode = 'off'; self.seq = 3;
          self.shiftMax += 10; self.shiftLeft = self.shiftMax;
          self.statuses.modeShift = self.shiftMax;
        } },
      ];
      const m = defSeq[Math.min(e.seq, 2)];
      e.seq++;
      return m;
    },
  },
  hexaghost: {
    name: '육염령', hp: [250, 250], size: 'boss',
    init(e) { e.cycleIdx = 0; e.burnUp = false; },
    ai(e, c) {
      if (e.turn === 0) return { key: 'activate', label: '점화 준비', intent: 'unknown' };
      if (e.turn === 1) {
        const d = Math.floor(c.player.hp / 12) + 1;
        return { key: 'divider', label: '영혼 가르기', intent: 'attack', dmg: d, hits: 6 };
      }
      const sear = () => ({ key: 'sear', label: '지지기', intent: 'attack-debuff', dmg: 6, apply: (c2) => c2.addStatusCardToDiscard('burn', 1, e.burnUp) });
      const cycle = [
        sear,
        () => ({ key: 'tackle', label: '몸통 박치기', intent: 'attack', dmg: 5, hits: 2 }),
        sear,
        () => ({ key: 'inflame', label: '불꽃 점화', intent: 'defend-buff', block: 12, apply: (c2, self) => c2.addEnemyStatus(self, 'str', 2) }),
        () => ({ key: 'tackle', label: '몸통 박치기', intent: 'attack', dmg: 5, hits: 2 }),
        sear,
        () => ({ key: 'inferno', label: '업화', intent: 'attack-debuff', dmg: 2, hits: 6, apply: (c2) => {
          c2.addStatusCardToDiscard('burn', 3, true);
          e.burnUp = true;
          for (const card of [...c2.drawPile, ...c2.discardPile, ...c2.hand]) {
            if (card.id === 'burn') card.upgraded = true;
          }
        } }),
      ];
      const m = cycle[e.cycleIdx % 7]();
      e.cycleIdx++;
      return m;
    },
  },
  slimeBoss: {
    name: '슬라임 대왕', hp: [140, 140], size: 'boss',
    splitsInto: ['acidSlimeL', 'spikeSlimeL'],
    ai(e) {
      const seq = [
        { key: 'goop', label: '점액 분사', intent: 'status', apply: (c2) => c2.addStatusCardToDiscard('slimed', 3) },
        { key: 'prepare', label: '꿈틀거림', intent: 'unknown' },
        { key: 'slam', label: '짓뭉개기', intent: 'attack', dmg: 35 },
      ];
      return seq[e.turn % 3];
    },
  },
};

for (const [id, def] of Object.entries(ENEMIES)) def.id = id;

let EUID = 1;
export function makeEnemy(id, rng, slot = 0) {
  const def = ENEMIES[id];
  if (!def) throw new Error('unknown enemy: ' + id);
  const hp = randInt(rng, def.hp[0], def.hp[1]);
  const e = {
    uid: 'e' + (EUID++), id, name: def.name, size: def.size,
    hp, maxHp: hp, block: 0, statuses: {}, history: [], turn: 0,
    gone: false, slot, intent: null, stunned: false,
  };
  if (def.init) def.init(e, rng);
  return e;
}

// ============ 조우 테이블 ============
const EASY_POOL = ['cultist', 'jawWorm', 'twoLice', 'smallSlimes'];
const HARD_POOL = ['gremlinGang', 'largeSlime', 'lotsOfSlimes', 'blueSlaver', 'redSlaver', 'threeLice', 'twoFungi', 'looter'];
const ELITE_POOL = ['gremlinNobE', 'lagavulinE', 'sentriesE'];

function encounterIds(key, rng) {
  switch (key) {
    case 'cultist': return ['cultist'];
    case 'jawWorm': return ['jawWorm'];
    case 'twoLice': return [pick(rng, ['redLouse', 'greenLouse']), pick(rng, ['redLouse', 'greenLouse'])];
    case 'smallSlimes': return chance(rng, 0.5) ? ['acidSlimeM', 'spikeSlimeS'] : ['spikeSlimeM', 'acidSlimeS'];
    case 'gremlinGang': {
      const pool = ['madGremlin', 'madGremlin', 'sneakyGremlin', 'sneakyGremlin', 'fatGremlin', 'fatGremlin', 'wizardGremlin', 'shieldGremlin'];
      const out = [];
      for (let i = 0; i < 4; i++) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
      return out;
    }
    case 'largeSlime': return [pick(rng, ['acidSlimeL', 'spikeSlimeL'])];
    case 'lotsOfSlimes': return ['spikeSlimeS', 'spikeSlimeS', 'spikeSlimeS', 'acidSlimeS', 'acidSlimeS'];
    case 'blueSlaver': return ['blueSlaver'];
    case 'redSlaver': return ['redSlaver'];
    case 'threeLice': return [pick(rng, ['redLouse', 'greenLouse']), pick(rng, ['redLouse', 'greenLouse']), pick(rng, ['redLouse', 'greenLouse'])];
    case 'twoFungi': return ['fungiBeast', 'fungiBeast'];
    case 'looter': return ['looter'];
    case 'gremlinNobE': return ['gremlinNob'];
    case 'lagavulinE': return ['lagavulin'];
    case 'sentriesE': return ['sentry', 'sentry', 'sentry'];
    default: return [key];
  }
}

export function rollEncounter(rng, kind, exclude = []) {
  let pool = kind === 'easy' ? EASY_POOL : kind === 'elite' ? ELITE_POOL : HARD_POOL;
  const filtered = pool.filter((k) => !exclude.includes(k));
  const key = pick(rng, filtered.length ? filtered : pool);
  return { key, ids: encounterIds(key, rng) };
}

export const BOSS_IDS = ['guardian', 'hexaghost', 'slimeBoss'];
