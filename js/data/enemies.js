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

  // ════════════ 2막 일반 ════════════
  sphericGuardian: {
    name: '구체 파수병', hp: [20, 20], size: 'medium',
    init(e) { e.block = 40; e.statuses.barricadeE = 1; e.statuses.artifact = 3; },
    ai(e) {
      if (e.turn === 0) return { key: 'activate', label: '기동', intent: 'defend', block: 25 };
      if (e.turn === 1) return { key: 'slamFrail', label: '공명 타격', intent: 'attack-debuff', dmg: 10, apply: (c2) => c2.applyStatusPlayer('frail', 5) };
      return e.turn % 2 === 0
        ? { key: 'harden', label: '경화 타격', intent: 'attack-defend', dmg: 10, block: 15 }
        : { key: 'slam', label: '내리치기', intent: 'attack', dmg: 10 };
    },
  },
  chosen: {
    name: '선택받은 자', hp: [95, 99], size: 'medium',
    ai(e, c) {
      if (e.turn === 0) return { key: 'poke', label: '찌르기', intent: 'attack', dmg: 5, hits: 2 };
      const cyc = [
        { key: 'zap', label: '뇌격', intent: 'attack', dmg: 18 },
        { key: 'debilitate', label: '쇠약의 저주', intent: 'attack-debuff', dmg: 10, apply: (c2) => c2.applyStatusPlayer('vuln', 2) },
        { key: 'drain', label: '흡수', intent: 'debuff', apply: (c2, self) => { c2.applyStatusPlayer('weak', 3); c2.addEnemyStatus(self, 'str', 3); } },
        { key: 'poke', label: '찌르기', intent: 'attack', dmg: 5, hits: 2 },
      ];
      return cyc[(e.turn - 1) % 4];
    },
  },
  byrd: {
    name: '새', hp: [25, 31], size: 'small',
    ai(e, c) {
      const r = c.rng();
      const lastKey = last(e);
      if (r < 0.5 && !(lastKey === 'peck' && last(e, 2) === 'peck')) {
        return { key: 'peck', label: '쪼기', intent: 'attack', dmg: 1, hits: 5 };
      }
      if (r < 0.8 && lastKey !== 'caw') {
        return { key: 'caw', label: '깍깍 울기', intent: 'buff', apply: (c2, self) => c2.addEnemyStatus(self, 'str', 1) };
      }
      return { key: 'swoop', label: '급강하', intent: 'attack', dmg: 12 };
    },
  },
  snakePlant: {
    name: '뱀풀', hp: [75, 79], size: 'large',
    ai(e, c) {
      const lastKey = last(e);
      if ((c.rng() < 0.65 && !(lastKey === 'chomp' && last(e, 2) === 'chomp')) || lastKey === 'spores') {
        return { key: 'chomp', label: '삼연속 깨물기', intent: 'attack', dmg: 7, hits: 3 };
      }
      return { key: 'spores', label: '쇠약의 포자', intent: 'debuff', apply: (c2) => { c2.applyStatusPlayer('frail', 2); c2.applyStatusPlayer('weak', 2); } };
    },
  },
  shelledParasite: {
    name: '껍질 기생충', hp: [68, 72], size: 'medium',
    init(e) { e.statuses.metallicizeE = 4; },
    ai(e, c) {
      if (e.turn === 0) return { key: 'fell', label: '쓰러뜨리기', intent: 'attack-debuff', dmg: 18, apply: (c2) => c2.applyStatusPlayer('frail', 2) };
      if (c.rng() < 0.6 && !(last(e) === 'double' && last(e, 2) === 'double')) {
        return { key: 'double', label: '이중 타격', intent: 'attack', dmg: 6, hits: 2 };
      }
      return { key: 'suck', label: '흡혈', intent: 'attack', dmg: 10, apply: (c2, self) => c2.healEnemy(self, 10) };
    },
  },
  centurion: {
    name: '백부장', hp: [76, 80], size: 'medium',
    ai(e, c) {
      const ally = c.aliveEnemies().find((x) => x.id === 'mystic');
      if (ally && c.rng() < 0.35) {
        return { key: 'protect', label: '엄호', intent: 'defend', apply: (c2, self) => {
          const m = c2.aliveEnemies().find((x) => x.id === 'mystic');
          if (m) c2.gainEnemyBlock(m, 15); else c2.gainEnemyBlock(self, 15);
        } };
      }
      if (!ally && c.rng() < 0.4) return { key: 'fury', label: '분쇄 연타', intent: 'attack', dmg: 6, hits: 3 };
      return { key: 'slash', label: '베기', intent: 'attack', dmg: 12 };
    },
  },
  mystic: {
    name: '신비술사', hp: [48, 56], size: 'medium',
    ai(e, c) {
      const allies = c.aliveEnemies();
      const wounded = allies.find((x) => x.hp < x.maxHp - 15);
      if (wounded && last(e) !== 'heal') {
        return { key: 'heal', label: '치유의 빛', intent: 'buff', apply: (c2) => {
          for (const a of c2.aliveEnemies()) c2.healEnemy(a, 16);
        } };
      }
      if (c.rng() < 0.5 && last(e) !== 'buff') {
        return { key: 'buff', label: '전투 축복', intent: 'buff', apply: (c2) => {
          for (const a of c2.aliveEnemies()) c2.addEnemyStatus(a, 'str', 2);
        } };
      }
      return { key: 'stab', label: '단검 찌르기', intent: 'attack-debuff', dmg: 9, apply: (c2) => c2.applyStatusPlayer('frail', 2) };
    },
  },

  // ════════════ 2막 정예 ════════════
  bookOfStabbing: {
    name: '찌르기 전서', hp: [160, 164], size: 'large',
    init(e) { e.stabs = 2; },
    ai(e, c) {
      if (c.rng() < 0.25 && last(e) !== 'single') {
        return { key: 'single', label: '관통 찌르기', intent: 'attack', dmg: 24 };
      }
      const hits = e.stabs++;
      return { key: 'multi', label: '난도질', intent: 'attack', dmg: 6, hits: Math.min(hits, 7) };
    },
  },
  gremlinLeader: {
    name: '도깨비 대장', hp: [140, 148], size: 'large',
    ai(e, c) {
      const minions = c.aliveEnemies().filter((x) => x.uid !== e.uid);
      if (minions.length < 2 && last(e) !== 'rally') {
        return { key: 'rally', label: '소집', intent: 'unknown', apply: (c2, self) => {
          const pool = ['madGremlin', 'sneakyGremlin', 'fatGremlin', 'shieldGremlin'];
          c2.spawnEnemy(pool[Math.floor(c2.rng() * pool.length)], self);
          c2.spawnEnemy(pool[Math.floor(c2.rng() * pool.length)], self);
        } };
      }
      if (c.rng() < 0.45 && last(e) !== 'encourage') {
        return { key: 'encourage', label: '독려', intent: 'defend-buff', apply: (c2) => {
          for (const a of c2.aliveEnemies()) { c2.addEnemyStatus(a, 'str', 3); c2.gainEnemyBlock(a, 6); }
        } };
      }
      return { key: 'stab', label: '마구 찌르기', intent: 'attack', dmg: 6, hits: 3 };
    },
  },
  snecko: {
    name: '스네코', hp: [114, 120], size: 'large',
    ai(e, c) {
      if (e.turn === 0) return { key: 'glare', label: '혼란의 눈빛', intent: 'debuff', apply: (c2) => c2.applyStatusPlayer('weak', 3) };
      if (c.rng() < 0.4 && last(e) !== 'bite') return { key: 'bite', label: '깨물기', intent: 'attack', dmg: 15 };
      return { key: 'tail', label: '꼬리 후리기', intent: 'attack-debuff', dmg: 8, apply: (c2) => c2.applyStatusPlayer('vuln', 2) };
    },
  },

  // ════════════ 2막 보스 ════════════
  champ: {
    name: '투기장의 챔피언', hp: [420, 420], size: 'boss',
    ai(e, c) {
      if (e.hp <= Math.floor(e.maxHp / 2) && !e.angered) {
        e.angered = true;
        return { key: 'anger', label: '대노', intent: 'buff', apply: (c2, self) => {
          delete self.statuses.vuln; delete self.statuses.weak;
          if ((self.statuses.str || 0) < 0) delete self.statuses.str;
          c2.addEnemyStatus(self, 'str', 9);
        } };
      }
      const cyc = e.angered
        ? [
          { key: 'execute', label: '처형', intent: 'attack', dmg: 10, hits: 2 },
          { key: 'heavySlash', label: '대검 휘두르기', intent: 'attack', dmg: 16 },
          { key: 'defensive', label: '방어 태세', intent: 'defend-buff', block: 18, apply: (c2, self) => c2.addEnemyStatus(self, 'str', 2) },
          { key: 'faceSlap', label: '따귀 갈기기', intent: 'attack-debuff', dmg: 12, apply: (c2) => { c2.applyStatusPlayer('frail', 2); c2.applyStatusPlayer('vuln', 1); } },
        ]
        : [
          { key: 'defensive', label: '방어 태세', intent: 'defend-buff', block: 18, apply: (c2, self) => c2.addEnemyStatus(self, 'str', 2) },
          { key: 'heavySlash', label: '대검 휘두르기', intent: 'attack', dmg: 16 },
          { key: 'faceSlap', label: '따귀 갈기기', intent: 'attack-debuff', dmg: 12, apply: (c2) => { c2.applyStatusPlayer('frail', 2); c2.applyStatusPlayer('vuln', 1); } },
          { key: 'gloat', label: '으스대기', intent: 'buff', apply: (c2, self) => c2.addEnemyStatus(self, 'str', 3) },
        ];
      return cyc[e.turn % 4];
    },
  },
  bronzeAutomaton: {
    name: '청동 자동인형', hp: [320, 320], size: 'boss',
    init(e) { e.statuses.artifact = 3; },
    ai(e) {
      if (e.turn === 0) {
        return { key: 'spawn', label: '구체 사출', intent: 'unknown', apply: (c2, self) => {
          c2.spawnEnemy('bronzeOrb', self);
          c2.spawnEnemy('bronzeOrb', null);
        } };
      }
      const cyc = [
        { key: 'boost', label: '과부하', intent: 'defend-buff', block: 12, apply: (c2, self) => c2.addEnemyStatus(self, 'str', 4) },
        { key: 'flail', label: '도리깨질', intent: 'attack', dmg: 7, hits: 2 },
        { key: 'boost', label: '과부하', intent: 'defend-buff', block: 12, apply: (c2, self) => c2.addEnemyStatus(self, 'str', 4) },
        { key: 'hyperBeam', label: '초광선', intent: 'attack', dmg: 45 },
        { key: 'charge', label: '재충전', intent: 'unknown' },
      ];
      return cyc[(e.turn - 1) % 5];
    },
  },
  bronzeOrb: {
    name: '청동 구체', hp: [54, 60], size: 'small',
    ai(e, c) {
      if (c.rng() < 0.5 && last(e) !== 'support') {
        return { key: 'support', label: '지원 광선', intent: 'defend', apply: (c2) => {
          const boss = c2.aliveEnemies().find((x) => x.id === 'bronzeAutomaton');
          if (boss) c2.gainEnemyBlock(boss, 12);
        } };
      }
      return { key: 'beam', label: '광선', intent: 'attack', dmg: 8 };
    },
  },
  collector: {
    name: '수집가', hp: [282, 282], size: 'boss',
    ai(e, c) {
      if (e.turn === 0) {
        return { key: 'summon', label: '횃불 머리 소환', intent: 'unknown', apply: (c2, self) => {
          c2.spawnEnemy('torchHead', self); c2.spawnEnemy('torchHead', self);
        } };
      }
      if (e.turn >= 3 && !e.megaUsed) {
        e.megaUsed = true;
        return { key: 'mega', label: '대저주', intent: 'debuff', apply: (c2) => {
          c2.applyStatusPlayer('weak', 3); c2.applyStatusPlayer('frail', 3); c2.applyStatusPlayer('vuln', 3);
        } };
      }
      const minions = c.aliveEnemies().filter((x) => x.id === 'torchHead');
      if (minions.length === 0 && c.rng() < 0.4) {
        return { key: 'summon', label: '횃불 머리 소환', intent: 'unknown', apply: (c2, self) => {
          c2.spawnEnemy('torchHead', self); c2.spawnEnemy('torchHead', self);
        } };
      }
      if (c.rng() < 0.55 && last(e) !== 'fireball2') {
        return { key: 'fireball2', label: '화염구', intent: 'attack', dmg: 21 };
      }
      return { key: 'buffAll', label: '어둠의 가호', intent: 'defend-buff', block: 18, apply: (c2) => {
        for (const a of c2.aliveEnemies()) c2.addEnemyStatus(a, 'str', 3);
      } };
    },
  },
  torchHead: {
    name: '횃불 머리', hp: [38, 40], size: 'small',
    ai() { return { key: 'tackle', label: '몸통 박치기', intent: 'attack', dmg: 7 }; },
  },

  // ════════════ 3막 일반 ════════════
  darkling: {
    name: '어둠덩이', hp: [48, 56], size: 'small',
    init(e, rng) { e.nipDmg = randInt(rng, 7, 11); },
    ai(e, c) {
      if (c.rng() < 0.25 && last(e) !== 'harden') {
        return { key: 'harden', label: '경화', intent: 'defend-buff', block: 12, apply: (c2, self) => c2.addEnemyStatus(self, 'str', 2) };
      }
      if (c.rng() < 0.5) return { key: 'nip', label: '깨물기', intent: 'attack', dmg: e.nipDmg };
      return { key: 'chomp', label: '으적 씹기', intent: 'attack', dmg: 9 };
    },
  },
  orbWalker: {
    name: '구체 보행자', hp: [90, 96], size: 'medium',
    init(e) { e.statuses.ritual = 3; },
    ai(e, c) {
      if (c.rng() < 0.6 && !(last(e) === 'laser' && last(e, 2) === 'laser')) {
        return { key: 'laser', label: '작열 광선', intent: 'attack-debuff', dmg: 10, apply: (c2) => c2.addStatusCardToDiscard('burn', 1) };
      }
      return { key: 'claw', label: '할퀴기', intent: 'attack', dmg: 15 };
    },
  },
  spireGrowth: {
    name: '첨탑 덩굴', hp: [170, 170], size: 'large',
    ai(e, c) {
      if (e.turn === 0) return { key: 'quick', label: '재빠른 후려치기', intent: 'attack', dmg: 16 };
      const r = c.rng();
      if (r < 0.35 && last(e) !== 'constrict') {
        return { key: 'constrict', label: '옭아매기', intent: 'debuff', apply: (c2) => { c2.applyStatusPlayer('weak', 2); c2.applyStatusPlayer('frail', 2); } };
      }
      if (r < 0.7) return { key: 'smash', label: '내리찍기', intent: 'attack', dmg: 22 };
      return { key: 'quick', label: '재빠른 후려치기', intent: 'attack', dmg: 16 };
    },
  },
  theMaw: {
    name: '아귀', hp: [300, 300], size: 'large',
    ai(e) {
      if (e.turn === 0) {
        return { key: 'roar', label: '포효', intent: 'debuff', apply: (c2) => { c2.applyStatusPlayer('weak', 3); c2.applyStatusPlayer('frail', 3); } };
      }
      const cyc = [
        { key: 'slam', label: '짓씹기', intent: 'attack', dmg: 25 },
        { key: 'drool', label: '침 흘리기', intent: 'buff', apply: (c2, self) => c2.addEnemyStatus(self, 'str', 5) },
        { key: 'nom', label: '우적우적', intent: 'attack', dmg: 5, hits: 3 },
      ];
      return cyc[(e.turn - 1) % 3];
    },
  },
  transient: {
    name: '일렁이는 형상', hp: [999, 999], size: 'large',
    init(e) { e.statuses.fading = 5; },
    ai(e, c) {
      if (e.turn >= 5) return { key: 'fade', label: '소멸', intent: 'escape' };
      return {
        key: 'blast', label: '혼돈의 일격', intent: 'attack', dmg: 30 + e.turn * 10,
        apply: (c2, self) => {
          if (self.statuses.fading > 1) c2.addEnemyStatus(self, 'fading', -1);
        },
      };
    },
  },

  // ════════════ 3막 정예 ════════════
  giantHead: {
    name: '거대한 두상', hp: [500, 500], size: 'boss',
    ai(e, c) {
      if (e.turn >= 4) {
        const n = Math.min(64, 30 + (e.turn - 4) * 5);
        return { key: 'time', label: '종언의 시간', intent: 'attack', dmg: n };
      }
      if (c.rng() < 0.5 && !(last(e) === 'glare' && last(e, 2) === 'glare')) {
        return { key: 'glare', label: '응시', intent: 'debuff', apply: (c2) => c2.applyStatusPlayer('weak', 1) };
      }
      return { key: 'count', label: '셈하기', intent: 'attack', dmg: 13 };
    },
  },
  nemesis: {
    name: '응보자', hp: [185, 185], size: 'large',
    init(e) { e.statuses.intangible = 1; },
    ai(e) {
      const cyc = [
        { key: 'attack3', label: '삼연격', intent: 'attack', dmg: 6, hits: 3, apply: (c2, self) => c2.addEnemyStatus(self, 'intangible', 2) },
        { key: 'scythe', label: '낫질', intent: 'attack', dmg: 45 },
        { key: 'burns', label: '겁화', intent: 'status', apply: (c2, self) => { c2.addStatusCardToDiscard('burn', 3); c2.addEnemyStatus(self, 'intangible', 2) } },
      ];
      return cyc[e.turn % 3];
    },
  },
  reptomancer: {
    name: '파충류 술사', hp: [190, 200], size: 'large',
    ai(e, c) {
      if (e.turn === 0) {
        return { key: 'summon', label: '단검 소환', intent: 'unknown', apply: (c2, self) => {
          c2.spawnEnemy('dagger', self); c2.spawnEnemy('dagger', null);
        } };
      }
      const daggers = c.aliveEnemies().filter((x) => x.id === 'dagger');
      if (daggers.length === 0 && c.rng() < 0.5) {
        return { key: 'summon', label: '단검 소환', intent: 'unknown', apply: (c2, self) => {
          c2.spawnEnemy('dagger', self);
        } };
      }
      if (c.rng() < 0.33) return { key: 'bigBite', label: '독니', intent: 'attack', dmg: 30 };
      return { key: 'snakeStrike', label: '뱀의 일격', intent: 'attack-debuff', dmg: 13, hits: 2, apply: (c2) => c2.applyStatusPlayer('weak', 1) };
    },
  },
  dagger: {
    name: '춤추는 단검', hp: [20, 25], size: 'small',
    ai(e) {
      if (e.turn === 0) return { key: 'stab', label: '찌르기', intent: 'attack', dmg: 9 };
      return { key: 'explode', label: '산화', intent: 'attack', dmg: 25, selfDestruct: true };
    },
  },

  // ════════════ 3막 보스 ════════════
  awakenedOne: {
    name: '각성자', hp: [300, 300], size: 'boss',
    init(e) { e.statuses.ritual = 2; e.phase = 1; },
    onDeath(e, c) {
      if (e.phase === 1) {
        e.phase = 2;
        e.hp = e.maxHp;
        e.statuses = { ritual: 2 };
        e.turn = 0;
        e.history = [];
        c.fx.push({ t: 'text', who: e.uid, msg: '각성…!' });
        c.refreshIntent(e);
        return 'revive';
      }
    },
    ai(e, c) {
      if (e.phase === 1) {
        if (c.rng() < 0.75 && !(last(e) === 'slash' && last(e, 2) === 'slash')) {
          return { key: 'slash', label: '베어가르기', intent: 'attack', dmg: 20 };
        }
        return { key: 'soulStrike', label: '영혼 강타', intent: 'attack', dmg: 6, hits: 4 };
      }
      if (e.turn === 0) return { key: 'echo', label: '어둠의 메아리', intent: 'attack', dmg: 40 };
      return c.rng() < 0.5
        ? { key: 'sludge', label: '오물 뱉기', intent: 'attack-debuff', dmg: 18, apply: (c2) => c2.addStatusCardToDiscard('slimed', 1) }
        : { key: 'tackle', label: '맹습', intent: 'attack', dmg: 10, hits: 3 };
    },
  },
  timeEater: {
    name: '시간 포식자', hp: [456, 456], size: 'boss',
    ai(e, c) {
      if (e.hp <= Math.floor(e.maxHp / 2) && !e.healed) {
        e.healed = true;
        return { key: 'haste', label: '시간 역행', intent: 'buff', apply: (c2, self) => {
          c2.healEnemy(self, Math.max(0, Math.floor(self.maxHp / 2) - self.hp)); // 절반까지 회복
          delete self.statuses.vuln; delete self.statuses.weak;
        } };
      }
      const r = c.rng();
      const lastKey = last(e);
      if (r < 0.45 && !(lastKey === 'reverb' && last(e, 2) === 'reverb')) {
        return { key: 'reverb', label: '잔향', intent: 'attack', dmg: 7, hits: 3 };
      }
      if (r < 0.8 && lastKey !== 'headSlam') {
        return { key: 'headSlam', label: '머리 내리치기', intent: 'attack-debuff', dmg: 26, apply: (c2) => c2.addStatusCardToDiscard('slimed', 1) };
      }
      return { key: 'ripple', label: '시간의 파문', intent: 'defend', block: 20, apply: (c2) => { c2.applyStatusPlayer('weak', 1); c2.applyStatusPlayer('frail', 1); } };
    },
  },
  donu: {
    name: '도누', hp: [250, 250], size: 'boss',
    init(e) { e.statuses.artifact = 2; },
    ai(e) {
      return e.turn % 2 === 0
        ? { key: 'circle', label: '힘의 원환', intent: 'buff', apply: (c2) => { for (const a of c2.aliveEnemies()) c2.addEnemyStatus(a, 'str', 3); } }
        : { key: 'beam', label: '광선', intent: 'attack', dmg: 10, hits: 2 };
    },
  },
  deca: {
    name: '데카', hp: [250, 250], size: 'boss',
    init(e) { e.statuses.artifact = 2; },
    ai(e) {
      return e.turn % 2 === 0
        ? { key: 'beam', label: '광선', intent: 'attack-debuff', dmg: 10, hits: 2, apply: (c2) => c2.addStatusCardToDiscard('dazed', 1) }
        : { key: 'square', label: '수호의 방진', intent: 'defend', apply: (c2) => { for (const a of c2.aliveEnemies()) c2.gainEnemyBlock(a, 16); } };
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

// ============ 막(Act) 구성 / 조우 테이블 ============
export const ACTS = {
  1: {
    name: '1막 — 첨탑 기슭',
    easy: ['cultist', 'jawWorm', 'twoLice', 'smallSlimes'],
    hard: ['gremlinGang', 'largeSlime', 'lotsOfSlimes', 'blueSlaver', 'redSlaver', 'threeLice', 'twoFungi', 'looter'],
    elite: ['gremlinNobE', 'lagavulinE', 'sentriesE'],
    boss: ['guardian', 'hexaghost', 'slimeBoss'],
  },
  2: {
    name: '2막 — 첨탑 중턱',
    easy: ['sphericGuardian', 'byrds', 'shelledParasite'],
    hard: ['chosen1', 'snakePlant', 'centurionMystic', 'chosenByrd', 'cultistTrio'],
    elite: ['bookOfStabbingE', 'gremlinLeaderE', 'sneckoE'],
    boss: ['champ', 'bronzeAutomaton', 'collector'],
  },
  3: {
    name: '3막 — 첨탑 정상',
    easy: ['darklings', 'orbWalker1', 'jawWormHorde'],
    hard: ['spireGrowth1', 'maw', 'transient1', 'darklings', 'orbWalkerPair'],
    elite: ['giantHeadE', 'nemesisE', 'reptomancerE'],
    boss: ['awakenedOne', 'timeEater', 'donuDeca'],
  },
};
export const FINAL_ACT = 3;

function encounterIds(key, rng) {
  switch (key) {
    // 1막
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
    // 2막
    case 'sphericGuardian': return ['sphericGuardian'];
    case 'byrds': return ['byrd', 'byrd', 'byrd'];
    case 'shelledParasite': return ['shelledParasite'];
    case 'chosen1': return ['chosen'];
    case 'snakePlant': return ['snakePlant'];
    case 'centurionMystic': return ['centurion', 'mystic'];
    case 'chosenByrd': return ['chosen', 'byrd'];
    case 'cultistTrio': return ['cultist', 'cultist', 'cultist'];
    case 'bookOfStabbingE': return ['bookOfStabbing'];
    case 'gremlinLeaderE': return [pick(rng, ['madGremlin', 'sneakyGremlin']), 'gremlinLeader', pick(rng, ['fatGremlin', 'shieldGremlin'])];
    case 'sneckoE': return ['snecko'];
    // 3막
    case 'darklings': return ['darkling', 'darkling', 'darkling'];
    case 'orbWalker1': return ['orbWalker'];
    case 'orbWalkerPair': return ['orbWalker', 'orbWalker'];
    case 'jawWormHorde': return ['jawWorm', 'jawWorm', 'jawWorm'];
    case 'spireGrowth1': return ['spireGrowth'];
    case 'maw': return ['theMaw'];
    case 'transient1': return ['transient'];
    case 'giantHeadE': return ['giantHead'];
    case 'nemesisE': return ['nemesis'];
    case 'reptomancerE': return ['reptomancer'];
    case 'donuDeca': return ['deca', 'donu'];
    default: return [key];
  }
}

export function rollEncounter(rng, kind, exclude = [], act = 1) {
  const cfg = ACTS[act] || ACTS[1];
  const pool = kind === 'easy' ? cfg.easy : kind === 'elite' ? cfg.elite : cfg.hard;
  const filtered = pool.filter((k) => !exclude.includes(k));
  const key = pick(rng, filtered.length ? filtered : pool);
  return { key, ids: encounterIds(key, rng) };
}

export function rollBoss(rng, act = 1) {
  return pick(rng, (ACTS[act] || ACTS[1]).boss);
}

export function bossEncounterIds(bossKey, rng) {
  return encounterIds(bossKey, rng);
}

// 하위 호환 (1막 보스 키 목록)
export const BOSS_IDS = ACTS[1].boss;
