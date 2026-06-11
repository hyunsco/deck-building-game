// Original SVG art — stylized silhouette sprites, map icons, intent icons.
const S = (vb, body) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

const slime = (c1, c2, spikes = false) => S('0 0 120 100', `
  <defs><radialGradient id="g${c1.slice(1)}" cx="40%" cy="30%"><stop offset="0%" stop-color="${c2}"/><stop offset="100%" stop-color="${c1}"/></radialGradient></defs>
  <path d="M60 18 C95 18 108 55 104 75 C100 92 80 96 60 96 C40 96 20 92 16 75 C12 55 25 18 60 18 Z" fill="url(#g${c1.slice(1)})" stroke="#1a1208" stroke-width="3"/>
  ${spikes ? `<path d="M30 30 L24 12 L40 24 M60 22 L60 2 L72 20 M88 32 L98 16 L94 36" fill="none" stroke="${c1}" stroke-width="7" stroke-linecap="round"/>` : ''}
  <ellipse cx="44" cy="52" rx="6" ry="9" fill="#1a1208"/><ellipse cx="76" cy="52" rx="6" ry="9" fill="#1a1208"/>
  <ellipse cx="46" cy="49" rx="2" ry="3" fill="#fff" opacity=".8"/><ellipse cx="78" cy="49" rx="2" ry="3" fill="#fff" opacity=".8"/>
  <path d="M48 72 Q60 80 74 72" fill="none" stroke="#1a1208" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="38" cy="32" rx="10" ry="6" fill="#fff" opacity=".25" transform="rotate(-20 38 32)"/>`);

const louse = (c1, c2) => S('0 0 120 100', `
  <ellipse cx="60" cy="58" rx="40" ry="32" fill="${c1}" stroke="#1a1208" stroke-width="3"/>
  <ellipse cx="60" cy="50" rx="28" ry="20" fill="${c2}" opacity=".5"/>
  <path d="M28 70 L12 86 M40 78 L30 95 M80 78 L90 95 M92 70 L108 86" stroke="#1a1208" stroke-width="5" stroke-linecap="round"/>
  <circle cx="48" cy="48" r="5" fill="#1a1208"/><circle cx="72" cy="48" r="5" fill="#1a1208"/>
  <path d="M52 66 L60 62 L68 66" fill="none" stroke="#1a1208" stroke-width="3"/>
  <path d="M40 28 L34 14 M80 28 L86 14" stroke="#1a1208" stroke-width="4" stroke-linecap="round"/>`);

const gremlin = (c1, extra = '') => S('0 0 120 110', `
  <ellipse cx="60" cy="100" rx="30" ry="7" fill="#000" opacity=".3"/>
  <path d="M60 30 C80 30 88 48 84 66 C92 72 92 86 82 92 L38 92 C28 86 28 72 36 66 C32 48 40 30 60 30 Z" fill="${c1}" stroke="#1a1208" stroke-width="3"/>
  <path d="M40 34 L28 12 L48 26 M80 34 L92 12 L72 26" fill="${c1}" stroke="#1a1208" stroke-width="3"/>
  <circle cx="50" cy="50" r="6" fill="#ffe96b"/><circle cx="70" cy="50" r="6" fill="#ffe96b"/>
  <circle cx="50" cy="50" r="2.5" fill="#1a1208"/><circle cx="70" cy="50" r="2.5" fill="#1a1208"/>
  <path d="M48 66 Q60 74 72 66" fill="none" stroke="#1a1208" stroke-width="3"/>
  <path d="M52 68 L56 73 M64 73 L68 68" stroke="#fff" stroke-width="2"/>
  ${extra}`);

const humanoid = (robe, accent, extra = '') => S('0 0 120 140', `
  <ellipse cx="60" cy="132" rx="32" ry="7" fill="#000" opacity=".3"/>
  <path d="M60 22 C84 22 88 60 92 128 L28 128 C32 60 36 22 60 22 Z" fill="${robe}" stroke="#14100a" stroke-width="3"/>
  <ellipse cx="60" cy="30" rx="17" ry="19" fill="${accent}" stroke="#14100a" stroke-width="3"/>
  ${extra}`);

export const SPRITES = {
  player: () => S('0 0 140 170', `
    <defs>
      <linearGradient id="parm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#aab4c0"/><stop offset="100%" stop-color="#5d6470"/></linearGradient>
      <linearGradient id="pcape" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a32a22"/><stop offset="100%" stop-color="#5a120e"/></linearGradient>
    </defs>
    <ellipse cx="70" cy="160" rx="40" ry="8" fill="#000" opacity=".35"/>
    <path d="M58 60 C38 78 32 118 38 150 L22 150 C14 108 28 70 48 56 Z" fill="url(#pcape)" stroke="#14100a" stroke-width="3"/>
    <path d="M62 60 L42 150 L96 150 L82 60 Z" fill="#4a3226" stroke="#14100a" stroke-width="3"/>
    <path d="M48 148 L42 150 L46 156 L58 156 L56 148 Z M80 148 L78 156 L92 156 L94 150 L88 148 Z" fill="#3a444e" stroke="#14100a" stroke-width="2.5"/>
    <rect x="49" y="56" width="42" height="50" rx="9" fill="url(#parm)" stroke="#14100a" stroke-width="3"/>
    <path d="M52 62 L88 62 M52 74 L88 74" stroke="#3a444e" stroke-width="3"/>
    <circle cx="70" cy="84" r="6" fill="#e8a33d" stroke="#6b4a1e" stroke-width="2"/>
    <path d="M49 60 C42 62 38 70 38 78 L46 82 C46 72 48 64 52 60 Z M91 60 C98 62 102 70 102 78 L94 82 C94 72 92 64 88 60 Z" fill="#8a949e" stroke="#14100a" stroke-width="2.5"/>
    <circle cx="70" cy="34" r="20" fill="url(#parm)" stroke="#14100a" stroke-width="3"/>
    <path d="M52 32 L88 32 L84 46 L56 46 Z" fill="#16100c"/>
    <rect x="57" y="35" width="26" height="4" rx="2" fill="#ffb24d"/>
    <path d="M70 14 C75 4 90 2 99 8 C89 10 82 16 80 23 Z" fill="#c0392b" stroke="#14100a" stroke-width="2"/>
    <path d="M66 14 L74 14 L72 22 L68 22 Z" fill="#c9a45c" stroke="#14100a" stroke-width="1.5"/>
    <path d="M103 64 L111 142 L119 64 L111 50 Z" fill="#cdd6e0" stroke="#14100a" stroke-width="3"/>
    <path d="M111 56 L111 134" stroke="#8a949e" stroke-width="2"/>
    <path d="M99 140 L123 140 L121 148 L101 148 Z" fill="#8a6d3b" stroke="#14100a" stroke-width="2.5"/>
    <rect x="106" y="146" width="10" height="14" rx="3" fill="#5a4226" stroke="#14100a" stroke-width="2"/>
    <circle cx="32" cy="98" r="19" fill="#4a3a20" stroke="#14100a" stroke-width="3"/>
    <circle cx="32" cy="98" r="12" fill="#6b552c" stroke="#14100a" stroke-width="2"/>
    <circle cx="32" cy="98" r="4" fill="#c9a45c"/>
    <path d="M32 81 L32 91 M32 105 L32 115 M15 98 L25 98 M39 98 L49 98" stroke="#c9a45c" stroke-width="2.5"/>`),

  cultist: () => humanoid('#27203a', '#3a2f55', `
    <path d="M60 6 L52 26 L68 26 Z" fill="#d9c79a" stroke="#14100a" stroke-width="2"/>
    <path d="M44 12 L52 24 M76 12 L68 24" stroke="#d9c79a" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="60" cy="34" rx="12" ry="10" fill="#d9c79a" stroke="#14100a" stroke-width="2"/>
    <circle cx="55" cy="33" r="3" fill="#4ad0ff"/><circle cx="65" cy="33" r="3" fill="#4ad0ff"/>
    <path d="M60 40 L60 46" stroke="#14100a" stroke-width="2"/>
    <path d="M40 80 Q60 70 80 80 L80 90 Q60 80 40 90 Z" fill="#4a3f6b"/>`),

  jawWorm: () => S('0 0 150 110', `
    <ellipse cx="75" cy="102" rx="50" ry="7" fill="#000" opacity=".3"/>
    <path d="M130 80 C140 70 142 55 132 48 C140 40 134 26 122 28 C124 16 110 8 100 16 C90 4 70 6 64 18 C48 10 30 20 32 36 C18 38 12 56 24 66 C16 78 28 94 44 90 C56 102 80 102 88 90 L130 90 Z" fill="#5d7d3a" stroke="#1a1208" stroke-width="3"/>
    <path d="M36 50 C30 38 40 26 52 30 M62 24 C64 14 80 12 86 20" fill="none" stroke="#3f5526" stroke-width="5"/>
    <path d="M88 90 C84 70 92 52 112 48 C128 46 138 58 136 72 C134 84 122 92 108 92 Z" fill="#74a04a" stroke="#1a1208" stroke-width="3"/>
    <path d="M100 56 L106 70 L114 56 L122 70 L130 56" fill="#fff" stroke="#1a1208" stroke-width="2"/>
    <circle cx="104" cy="46" r="5" fill="#ffe96b"/><circle cx="104" cy="46" r="2" fill="#1a1208"/>`),

  redLouse: () => louse('#a14a2e', '#c97b50'),
  greenLouse: () => louse('#5d7d3a', '#8aa85e'),
  acidSlimeM: () => slime('#5d8a2a', '#a4cf52'),
  acidSlimeS: () => slime('#5d8a2a', '#a4cf52'),
  acidSlimeL: () => slime('#4a7a1e', '#92c344'),
  spikeSlimeM: () => slime('#7a3226', '#b85a42', true),
  spikeSlimeS: () => slime('#7a3226', '#b85a42', true),
  spikeSlimeL: () => slime('#6a281e', '#aa4a36', true),

  fungiBeast: () => S('0 0 130 110', `
    <ellipse cx="65" cy="102" rx="42" ry="7" fill="#000" opacity=".3"/>
    <path d="M65 50 C90 50 102 70 100 88 C98 98 84 100 65 100 C46 100 32 98 30 88 C28 70 40 50 65 50 Z" fill="#6e5a8a" stroke="#1a1208" stroke-width="3"/>
    <path d="M20 44 C20 24 40 10 65 10 C90 10 110 24 110 44 C110 54 96 58 65 58 C34 58 20 54 20 44 Z" fill="#9a4a6a" stroke="#1a1208" stroke-width="3"/>
    <circle cx="44" cy="32" r="6" fill="#e8d9b0" opacity=".7"/><circle cx="72" cy="24" r="8" fill="#e8d9b0" opacity=".7"/><circle cx="92" cy="38" r="5" fill="#e8d9b0" opacity=".7"/>
    <circle cx="52" cy="74" r="5" fill="#ffe96b"/><circle cx="78" cy="74" r="5" fill="#ffe96b"/>
    <path d="M36 98 L30 106 M94 98 L100 106" stroke="#1a1208" stroke-width="5" stroke-linecap="round"/>`),

  looter: () => humanoid('#3a4a2e', '#2b2118', `
    <circle cx="55" cy="32" r="3.5" fill="#ffe96b"/><circle cx="67" cy="32" r="3.5" fill="#ffe96b"/>
    <path d="M88 70 C104 64 112 74 110 86 C104 80 96 80 90 84 Z" fill="#8a6d3b" stroke="#14100a" stroke-width="2"/>
    <circle cx="102" cy="96" r="14" fill="#6b4a23" stroke="#14100a" stroke-width="3"/>
    <path d="M96 88 Q102 82 108 88" fill="none" stroke="#14100a" stroke-width="2"/>
    <path d="M22 84 L44 70 L48 76 L28 92 Z" fill="#b9c2cc" stroke="#14100a" stroke-width="2"/>`),

  blueSlaver: () => humanoid('#2e4a6b', '#7d8590', `
    <path d="M48 26 L72 26 L70 38 L50 38 Z" fill="#1a2a3a"/>
    <circle cx="56" cy="32" r="3" fill="#ff5a2a"/><circle cx="66" cy="32" r="3" fill="#ff5a2a"/>
    <path d="M94 50 L116 20 M94 50 L100 130" stroke="#6b4a23" stroke-width="5" stroke-linecap="round"/>
    <path d="M112 14 L120 26 L108 28 Z" fill="#b9c2cc" stroke="#14100a" stroke-width="2"/>`),

  redSlaver: () => humanoid('#6b2e2e', '#7d8590', `
    <path d="M48 26 L72 26 L70 38 L50 38 Z" fill="#3a1a1a"/>
    <circle cx="56" cy="32" r="3" fill="#ffe96b"/><circle cx="66" cy="32" r="3" fill="#ffe96b"/>
    <path d="M92 60 C108 60 116 72 110 84 C116 92 108 104 98 100" fill="none" stroke="#8a5a1e" stroke-width="5" stroke-linecap="round"/>
    <path d="M22 84 L40 64 L46 70 L28 90 Z" fill="#b9c2cc" stroke="#14100a" stroke-width="2"/>`),

  madGremlin: () => gremlin('#a14a2e', '<path d="M84 78 L104 70 L104 84 L86 88 Z" fill="#6b4a23" stroke="#1a1208" stroke-width="2"/>'),
  sneakyGremlin: () => gremlin('#5d6e3a', '<path d="M86 76 L102 64 L106 72 L90 84 Z" fill="#b9c2cc" stroke="#1a1208" stroke-width="2"/>'),
  fatGremlin: () => S('0 0 120 110', `
    <ellipse cx="60" cy="102" rx="36" ry="7" fill="#000" opacity=".3"/>
    <ellipse cx="60" cy="66" rx="38" ry="36" fill="#b07a3e" stroke="#1a1208" stroke-width="3"/>
    <path d="M44 32 L34 14 L52 24 M76 32 L86 14 L68 24" fill="#b07a3e" stroke="#1a1208" stroke-width="3"/>
    <circle cx="48" cy="54" r="5" fill="#1a1208"/><circle cx="72" cy="54" r="5" fill="#1a1208"/>
    <path d="M46 72 Q60 82 74 72" fill="none" stroke="#1a1208" stroke-width="3"/>
    <ellipse cx="60" cy="80" rx="20" ry="12" fill="#c9975e" opacity=".6"/>`),
  shieldGremlin: () => gremlin('#5d7d8a', '<path d="M88 56 L112 56 C112 78 104 92 100 94 C96 92 88 78 88 56 Z" fill="#7d8590" stroke="#1a1208" stroke-width="3"/><path d="M94 62 L106 62" stroke="#aab4c0" stroke-width="3"/>'),
  wizardGremlin: () => gremlin('#6e5a8a', '<path d="M60 30 L48 2 L72 14 Z" fill="#3a2f55" stroke="#1a1208" stroke-width="2"/><circle cx="98" cy="60" r="8" fill="#4ad0ff" opacity=".85"/><path d="M92 92 L98 60" stroke="#6b4a23" stroke-width="4"/>'),

  gremlinNob: () => S('0 0 170 170', `
    <ellipse cx="85" cy="160" rx="56" ry="9" fill="#000" opacity=".35"/>
    <path d="M85 28 C120 28 140 60 136 100 C150 110 148 134 132 140 L38 140 C22 134 20 110 34 100 C30 60 50 28 85 28 Z" fill="#b3452e" stroke="#14100a" stroke-width="4"/>
    <path d="M52 34 L30 4 L62 22 M118 34 L140 4 L108 22" fill="#d9c79a" stroke="#14100a" stroke-width="3"/>
    <circle cx="68" cy="62" r="8" fill="#ffe96b"/><circle cx="102" cy="62" r="8" fill="#ffe96b"/>
    <circle cx="68" cy="62" r="3" fill="#14100a"/><circle cx="102" cy="62" r="3" fill="#14100a"/>
    <path d="M60 86 Q85 100 110 86" fill="none" stroke="#14100a" stroke-width="4"/>
    <path d="M66 88 L72 96 M82 92 L85 100 M98 92 L102 88" stroke="#fff" stroke-width="3"/>
    <path d="M136 110 L162 90 L168 104 L144 122 Z" fill="#6b4a23" stroke="#14100a" stroke-width="3"/>
    <circle cx="160" cy="98" r="10" fill="#5a4226" stroke="#14100a" stroke-width="3"/>
    <path d="M40 140 L42 158 M130 140 L128 158" stroke="#14100a" stroke-width="8" stroke-linecap="round"/>`),

  lagavulin: () => S('0 0 170 130', `
    <ellipse cx="85" cy="122" rx="62" ry="8" fill="#000" opacity=".35"/>
    <path d="M85 10 C130 10 156 44 152 84 C150 106 124 118 85 118 C46 118 20 106 18 84 C14 44 40 10 85 10 Z" fill="#3a5e8a" stroke="#14100a" stroke-width="4"/>
    <path d="M40 30 C60 18 110 18 130 30 M28 56 C56 42 114 42 142 56 M24 84 C56 68 114 68 146 84" fill="none" stroke="#244668" stroke-width="6"/>
    <path d="M62 92 C62 80 74 74 85 74 C96 74 108 80 108 92 L108 104 C100 110 70 110 62 104 Z" fill="#7d9ab8" stroke="#14100a" stroke-width="3"/>
    <circle cx="76" cy="90" r="4" fill="#0a2a4a"/><circle cx="94" cy="90" r="4" fill="#0a2a4a"/>
    <path d="M54 96 L40 110 M116 96 L130 110" stroke="#14100a" stroke-width="6" stroke-linecap="round"/>`),

  sentry: () => S('0 0 110 160', `
    <ellipse cx="55" cy="152" rx="34" ry="7" fill="#000" opacity=".3"/>
    <path d="M55 8 L88 34 L80 120 L55 138 L30 120 L22 34 Z" fill="#4a4258" stroke="#14100a" stroke-width="3"/>
    <path d="M55 16 L78 36 L72 112 L55 126 L38 112 L32 36 Z" fill="#5d5470" stroke="#14100a" stroke-width="2"/>
    <circle cx="55" cy="60" r="16" fill="#14100a"/>
    <circle cx="55" cy="60" r="11" fill="#ff4a4a"><animate attributeName="r" values="11;9;11" dur="2s" repeatCount="indefinite"/></circle>
    <circle cx="55" cy="60" r="4" fill="#ffd0d0"/>
    <path d="M40 92 L70 92 M42 102 L68 102" stroke="#8a6d3b" stroke-width="3"/>`),

  guardian: () => S('0 0 210 210', `
    <ellipse cx="105" cy="200" rx="76" ry="10" fill="#000" opacity=".35"/>
    <path d="M105 14 C150 14 176 44 176 84 C176 100 168 112 156 120 L166 178 L128 188 L122 150 L88 150 L82 188 L44 178 L54 120 C42 112 34 100 34 84 C34 44 60 14 105 14 Z" fill="#5d6470" stroke="#14100a" stroke-width="5"/>
    <path d="M105 22 C144 22 166 48 166 82 C166 96 158 106 148 112 L62 112 C52 106 44 96 44 82 C44 48 66 22 105 22 Z" fill="#737d8c" stroke="#14100a" stroke-width="3"/>
    <circle cx="105" cy="120" r="26" fill="#2b2118" stroke="#14100a" stroke-width="4"/>
    <circle cx="105" cy="120" r="18" fill="#ff7a2a"><animate attributeName="opacity" values="1;.6;1" dur="2.5s" repeatCount="indefinite"/></circle>
    <circle cx="105" cy="120" r="8" fill="#ffd06b"/>
    <rect x="70" y="56" width="26" height="14" rx="4" fill="#ffb24d"/><rect x="114" y="56" width="26" height="14" rx="4" fill="#ffb24d"/>
    <path d="M34 84 L8 64 L20 100 Z M176 84 L202 64 L190 100 Z" fill="#5d6470" stroke="#14100a" stroke-width="4"/>`),

  hexaghost: () => S('0 0 210 200', `
    <defs><radialGradient id="ghg" cx="50%" cy="40%"><stop offset="0%" stop-color="#bfe8ff"/><stop offset="60%" stop-color="#4a90b8"/><stop offset="100%" stop-color="#1e3a52"/></radialGradient></defs>
    ${[0, 1, 2, 3, 4, 5].map((i) => {
      const a = Math.PI / 3 * i - Math.PI / 2;
      const x = 105 + Math.cos(a) * 78, y = 95 + Math.sin(a) * 72;
      return `<path d="M${x} ${y - 16} C${x + 11} ${y - 4} ${x + 9} ${y + 10} ${x} ${y + 14} C${x - 9} ${y + 10} ${x - 11} ${y - 4} ${x} ${y - 16} Z" fill="#6bd0ff" opacity=".85"><animate attributeName="opacity" values=".85;.4;.85" dur="${1.6 + i * 0.3}s" repeatCount="indefinite"/></path>`;
    }).join('')}
    <path d="M105 30 C140 30 152 64 150 100 C149 124 140 138 128 148 L122 136 L114 152 L105 140 L96 152 L88 136 L82 148 C70 138 61 124 60 100 C58 64 70 30 105 30 Z" fill="url(#ghg)" stroke="#14202e" stroke-width="3" opacity=".95"/>
    <ellipse cx="90" cy="86" rx="8" ry="13" fill="#0a1622"/><ellipse cx="120" cy="86" rx="8" ry="13" fill="#0a1622"/>
    <path d="M92 116 Q105 124 118 116" fill="none" stroke="#0a1622" stroke-width="4"/>`),

  slimeBoss: () => S('0 0 220 180', `
    <defs><radialGradient id="sbg" cx="40%" cy="25%"><stop offset="0%" stop-color="#b4dd62"/><stop offset="100%" stop-color="#4a7a1e"/></radialGradient></defs>
    <ellipse cx="110" cy="172" rx="86" ry="9" fill="#000" opacity=".35"/>
    <path d="M110 16 C175 16 196 80 190 124 C186 156 150 168 110 168 C70 168 34 156 30 124 C24 80 45 16 110 16 Z" fill="url(#sbg)" stroke="#1a2208" stroke-width="4"/>
    <path d="M52 50 C46 70 44 96 48 116 M168 50 C174 70 176 96 172 116" fill="none" stroke="#3a5e14" stroke-width="6" opacity=".6"/>
    <ellipse cx="80" cy="78" rx="11" ry="17" fill="#1a2208"/><ellipse cx="140" cy="78" rx="11" ry="17" fill="#1a2208"/>
    <ellipse cx="84" cy="72" rx="4" ry="6" fill="#fff" opacity=".8"/><ellipse cx="144" cy="72" rx="4" ry="6" fill="#fff" opacity=".8"/>
    <path d="M76 116 Q110 138 144 116" fill="none" stroke="#1a2208" stroke-width="5" stroke-linecap="round"/>
    <path d="M86 120 L90 132 M110 128 L110 140 M134 120 L130 132" stroke="#1a2208" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="66" cy="36" rx="16" ry="9" fill="#fff" opacity=".25" transform="rotate(-18 66 36)"/>
    <circle cx="196" cy="130" r="10" fill="#5d8a2a"><animate attributeName="cy" values="130;142;130" dur="3s" repeatCount="indefinite"/></circle>
    <circle cx="22" cy="120" r="7" fill="#5d8a2a"><animate attributeName="cy" values="120;132;120" dur="2.4s" repeatCount="indefinite"/></circle>`),

  // ════════════ 2막 ════════════
  sphericGuardian: () => S('0 0 130 130', `
    <ellipse cx="65" cy="122" rx="40" ry="7" fill="#000" opacity=".3"/>
    <circle cx="65" cy="62" r="46" fill="#3a5e8a" stroke="#14100a" stroke-width="3.5"/>
    <circle cx="65" cy="62" r="36" fill="none" stroke="#7da8cc" stroke-width="3" stroke-dasharray="10 8"/>
    <circle cx="65" cy="62" r="18" fill="#0e1c2c"/>
    <circle cx="65" cy="62" r="11" fill="#4ad0ff"><animate attributeName="r" values="11;8;11" dur="2.4s" repeatCount="indefinite"/></circle>
    <ellipse cx="48" cy="36" rx="12" ry="7" fill="#fff" opacity=".3" transform="rotate(-25 48 36)"/>
    <path d="M22 90 L10 104 M108 90 L120 104" stroke="#3a5e8a" stroke-width="7" stroke-linecap="round"/>`),
  chosen: () => humanoid('#5b3a78', '#3a2450', `
    <path d="M44 8 C50 2 70 2 76 8 L72 24 L48 24 Z" fill="#7a5298" stroke="#14100a" stroke-width="2.5"/>
    <circle cx="54" cy="32" r="4" fill="#ffd75e"/><circle cx="66" cy="32" r="4" fill="#ffd75e"/>
    <path d="M60 44 L60 50" stroke="#14100a" stroke-width="2"/>
    <path d="M42 70 Q60 60 78 70 L78 82 Q60 72 42 82 Z" fill="#8a62ad" opacity=".8"/>
    <circle cx="60" cy="92" r="8" fill="#ffd75e" opacity=".9"><animate attributeName="opacity" values=".9;.5;.9" dur="2s" repeatCount="indefinite"/></circle>`),
  byrd: () => S('0 0 120 100', `
    <ellipse cx="60" cy="94" rx="30" ry="5" fill="#000" opacity=".25"/>
    <ellipse cx="60" cy="56" rx="30" ry="24" fill="#4a7ab0" stroke="#14100a" stroke-width="3"/>
    <path d="M34 50 C18 38 14 24 24 16 C30 28 40 34 50 36 Z" fill="#3a628c" stroke="#14100a" stroke-width="2.5">
      <animateTransform attributeName="transform" type="rotate" values="0 40 48;-14 40 48;0 40 48" dur="0.7s" repeatCount="indefinite"/></path>
    <circle cx="74" cy="46" r="5" fill="#ffe96b"/><circle cx="74" cy="46" r="2" fill="#14100a"/>
    <path d="M86 50 L102 54 L86 60 Z" fill="#e8a33d" stroke="#14100a" stroke-width="2"/>
    <path d="M52 78 L48 92 M68 78 L72 92" stroke="#e8a33d" stroke-width="4" stroke-linecap="round"/>
    <path d="M48 30 L44 18 M58 28 L58 14 M68 30 L72 18" stroke="#3a628c" stroke-width="4" stroke-linecap="round"/>`),
  snakePlant: () => S('0 0 150 150', `
    <ellipse cx="75" cy="142" rx="46" ry="8" fill="#000" opacity=".3"/>
    <path d="M60 140 C52 110 56 80 50 52 C46 30 60 14 75 22 C90 14 104 30 100 52 C94 80 98 110 90 140 Z" fill="#3f6b34" stroke="#14100a" stroke-width="3"/>
    <path d="M50 56 C30 48 20 30 28 16 C38 30 50 34 58 38 Z M100 56 C120 48 130 30 122 16 C112 30 100 34 92 38 Z" fill="#5d8a4a" stroke="#14100a" stroke-width="2.5"/>
    <path d="M58 44 C64 36 86 36 92 44 C90 56 60 56 58 44 Z" fill="#8a2438" stroke="#14100a" stroke-width="2.5"/>
    <path d="M62 44 L66 52 M70 46 L73 54 M78 46 L81 52 M86 44 L84 52" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="58" cy="30" r="4" fill="#ffe96b"/><circle cx="92" cy="30" r="4" fill="#ffe96b"/>
    <path d="M40 120 C28 116 22 106 24 98 M110 120 C122 116 128 106 126 98" stroke="#3f6b34" stroke-width="5" stroke-linecap="round" fill="none"/>`),
  shelledParasite: () => S('0 0 140 110', `
    <ellipse cx="70" cy="102" rx="46" ry="7" fill="#000" opacity=".3"/>
    <path d="M70 14 C104 14 122 44 118 72 C114 92 94 98 70 98 C46 98 26 92 22 72 C18 44 36 14 70 14 Z" fill="#7a5a8a" stroke="#14100a" stroke-width="3"/>
    <path d="M38 30 C58 22 82 22 102 30 M28 52 C54 42 86 42 112 52 M26 74 C54 64 86 64 114 74" fill="none" stroke="#5a3f68" stroke-width="5"/>
    <path d="M50 88 C50 78 60 72 70 72 C80 72 90 78 90 88 L90 96 C80 100 60 100 50 96 Z" fill="#d88a9a" stroke="#14100a" stroke-width="2.5"/>
    <circle cx="62" cy="86" r="3.5" fill="#14100a"/><circle cx="78" cy="86" r="3.5" fill="#14100a"/>
    <path d="M66 94 L70 90 L74 94" stroke="#14100a" stroke-width="2" fill="none"/>`),
  centurion: () => humanoid('#6b5435', '#7d8590', `
    <path d="M50 6 L70 6 L68 16 L52 16 Z" fill="#c0392b" stroke="#14100a" stroke-width="2"/>
    <path d="M48 26 L72 26 L70 38 L50 38 Z" fill="#2b2118"/>
    <circle cx="56" cy="32" r="3" fill="#ffe96b"/><circle cx="64" cy="32" r="3" fill="#ffe96b"/>
    <path d="M20 70 C14 90 14 110 20 124 L36 120 C32 106 32 88 36 74 Z" fill="#7d8590" stroke="#14100a" stroke-width="3"/>
    <path d="M92 60 L114 40 M92 60 L98 130" stroke="#6b4a23" stroke-width="5" stroke-linecap="round"/>
    <path d="M110 34 L120 44 L106 48 Z" fill="#b9c2cc" stroke="#14100a" stroke-width="2"/>`),
  mystic: () => humanoid('#3a6b68', '#d9c79a', `
    <path d="M46 10 C52 4 68 4 74 10 L70 22 L50 22 Z" fill="#54928e" stroke="#14100a" stroke-width="2.5"/>
    <circle cx="55" cy="31" r="3" fill="#14100a"/><circle cx="65" cy="31" r="3" fill="#14100a"/>
    <path d="M92 56 L100 130" stroke="#6b4a23" stroke-width="5" stroke-linecap="round"/>
    <circle cx="91" cy="48" r="10" fill="#7fffd4" opacity=".85"><animate attributeName="opacity" values=".85;.45;.85" dur="1.8s" repeatCount="indefinite"/></circle>
    <path d="M42 72 Q60 64 78 72 L78 84 Q60 76 42 84 Z" fill="#54928e" opacity=".7"/>`),
  bookOfStabbing: () => S('0 0 160 140', `
    <ellipse cx="80" cy="132" rx="52" ry="8" fill="#000" opacity=".35"/>
    <path d="M80 20 C50 12 26 18 20 30 L20 110 C30 98 52 94 80 102 C108 94 130 98 140 110 L140 30 C134 18 110 12 80 20 Z" fill="#6b4a23" stroke="#14100a" stroke-width="3.5"/>
    <path d="M80 24 C56 17 36 21 28 32 L28 102 C40 94 60 92 80 98 Z" fill="#e8d9b0" stroke="#14100a" stroke-width="2"/>
    <path d="M80 24 C104 17 124 21 132 32 L132 102 C120 94 100 92 80 98 Z" fill="#d9c79a" stroke="#14100a" stroke-width="2"/>
    <circle cx="56" cy="56" r="7" fill="#8a2438"/><circle cx="104" cy="56" r="7" fill="#8a2438"/>
    <path d="M44 74 Q80 88 116 74" stroke="#8a2438" stroke-width="4" fill="none"/>
    <path d="M48 36 L40 8 L56 30 M80 34 L80 2 L92 30 M112 36 L122 8 L106 30" fill="#b9c2cc" stroke="#14100a" stroke-width="2.5"/>`),
  gremlinLeader: () => S('0 0 160 160', `
    <ellipse cx="80" cy="152" rx="52" ry="9" fill="#000" opacity=".35"/>
    <path d="M80 24 C112 24 130 54 126 92 C138 100 136 122 122 128 L38 128 C24 122 22 100 34 92 C30 54 48 24 80 24 Z" fill="#a8642e" stroke="#14100a" stroke-width="4"/>
    <path d="M48 30 L30 4 L58 20 M112 30 L130 4 L102 20" fill="#d9c79a" stroke="#14100a" stroke-width="3"/>
    <circle cx="64" cy="58" r="7" fill="#ffe96b"/><circle cx="96" cy="58" r="7" fill="#ffe96b"/>
    <circle cx="64" cy="58" r="3" fill="#14100a"/><circle cx="96" cy="58" r="3" fill="#14100a"/>
    <path d="M58 82 Q80 94 102 82" fill="none" stroke="#14100a" stroke-width="4"/>
    <path d="M64 84 L68 92 M78 88 L80 96 M94 86 L98 82" stroke="#fff" stroke-width="3"/>
    <path d="M126 100 L152 84 L158 98 L136 112 Z" fill="#8a6d3b" stroke="#14100a" stroke-width="3"/>
    <path d="M150 78 L162 92" stroke="#b9c2cc" stroke-width="5" stroke-linecap="round"/>
    <path d="M40 128 L44 146 M118 128 L114 146" stroke="#14100a" stroke-width="8" stroke-linecap="round"/>`),
  snecko: () => S('0 0 160 150', `
    <ellipse cx="80" cy="142" rx="52" ry="8" fill="#000" opacity=".35"/>
    <path d="M50 140 C30 130 24 106 36 88 C20 78 22 54 40 48 C36 28 56 12 76 20 C96 8 122 20 122 42 C140 50 142 76 126 86 C136 104 126 128 104 134 C96 142 70 146 50 140 Z" fill="#4a8a6e" stroke="#14100a" stroke-width="3.5"/>
    <path d="M58 56 C66 44 94 44 102 56 C108 68 100 80 80 80 C60 80 52 68 58 56 Z" fill="#2c5a44" stroke="#14100a" stroke-width="2.5"/>
    <circle cx="70" cy="60" r="8" fill="#ffd75e"><animate attributeName="fill" values="#ffd75e;#ff5a9a;#4ad0ff;#ffd75e" dur="3s" repeatCount="indefinite"/></circle>
    <circle cx="92" cy="60" r="8" fill="#4ad0ff"><animate attributeName="fill" values="#4ad0ff;#ffd75e;#ff5a9a;#4ad0ff" dur="3s" repeatCount="indefinite"/></circle>
    <circle cx="70" cy="60" r="3" fill="#14100a"/><circle cx="92" cy="60" r="3" fill="#14100a"/>
    <path d="M64 92 Q80 102 98 92 M70 96 L72 104 M88 98 L90 92" stroke="#14100a" stroke-width="3" fill="none"/>
    <path d="M120 120 C134 116 140 104 138 94" stroke="#4a8a6e" stroke-width="7" stroke-linecap="round" fill="none"/>`),
  champ: () => S('0 0 200 210', `
    <defs><linearGradient id="champA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d8b25e"/><stop offset="100%" stop-color="#8a6224"/></linearGradient></defs>
    <ellipse cx="100" cy="200" rx="66" ry="10" fill="#000" opacity=".35"/>
    <path d="M100 30 C140 30 162 62 158 108 C170 116 168 140 154 146 L46 146 C32 140 30 116 42 108 C38 62 60 30 100 30 Z" fill="url(#champA)" stroke="#14100a" stroke-width="4.5"/>
    <path d="M70 42 L130 42 L124 74 L76 74 Z" fill="#2b2118" stroke="#14100a" stroke-width="3"/>
    <rect x="78" y="50" width="44" height="7" rx="3.5" fill="#ff8a4d"/>
    <path d="M100 8 L92 30 L108 30 Z M76 14 L70 34 L86 30 Z M124 14 L130 34 L114 30 Z" fill="#c0392b" stroke="#14100a" stroke-width="2.5"/>
    <circle cx="100" cy="104" r="14" fill="#8a2438" stroke="#14100a" stroke-width="3"/>
    <path d="M44 120 L16 96 L24 134 Z M156 120 L184 96 L176 134 Z" fill="url(#champA)" stroke="#14100a" stroke-width="3.5"/>
    <path d="M58 146 L62 188 L80 188 L78 146 M142 146 L138 188 L120 188 L122 146" fill="#6b4a23" stroke="#14100a" stroke-width="3"/>
    <path d="M178 64 L196 26 L202 70 L188 84 Z" fill="#cdd6e0" stroke="#14100a" stroke-width="3"/>`),
  bronzeAutomaton: () => S('0 0 200 200', `
    <defs><linearGradient id="brz" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c9974a"/><stop offset="100%" stop-color="#6e4a1c"/></linearGradient></defs>
    <ellipse cx="100" cy="192" rx="70" ry="9" fill="#000" opacity=".35"/>
    <rect x="56" y="28" width="88" height="64" rx="10" fill="url(#brz)" stroke="#14100a" stroke-width="4"/>
    <rect x="70" y="44" width="60" height="20" rx="6" fill="#14100a"/>
    <rect x="76" y="49" width="20" height="10" rx="3" fill="#ff5a2a"><animate attributeName="opacity" values="1;.4;1" dur="1.6s" repeatCount="indefinite"/></rect>
    <rect x="104" y="49" width="20" height="10" rx="3" fill="#ff5a2a"><animate attributeName="opacity" values="1;.4;1" dur="1.6s" repeatCount="indefinite"/></rect>
    <path d="M100 8 L94 28 L106 28 Z" fill="#c9974a" stroke="#14100a" stroke-width="2.5"/>
    <rect x="44" y="96" width="112" height="64" rx="14" fill="url(#brz)" stroke="#14100a" stroke-width="4"/>
    <circle cx="100" cy="128" r="22" fill="#2b2118" stroke="#14100a" stroke-width="3"/>
    <circle cx="100" cy="128" r="13" fill="#ffb24d"><animate attributeName="r" values="13;10;13" dur="2.2s" repeatCount="indefinite"/></circle>
    <path d="M44 104 L16 92 L20 130 L44 136 Z M156 104 L184 92 L180 130 L156 136 Z" fill="url(#brz)" stroke="#14100a" stroke-width="3.5"/>
    <rect x="62" y="160" width="26" height="26" rx="6" fill="#6e4a1c" stroke="#14100a" stroke-width="3"/>
    <rect x="112" y="160" width="26" height="26" rx="6" fill="#6e4a1c" stroke="#14100a" stroke-width="3"/>`),
  bronzeOrb: () => S('0 0 110 110', `
    <ellipse cx="55" cy="102" rx="32" ry="6" fill="#000" opacity=".3"/>
    <circle cx="55" cy="52" r="38" fill="#c9974a" stroke="#14100a" stroke-width="3.5"/>
    <circle cx="55" cy="52" r="28" fill="none" stroke="#8a6224" stroke-width="4" stroke-dasharray="8 7">
      <animateTransform attributeName="transform" type="rotate" from="0 55 52" to="360 55 52" dur="7s" repeatCount="indefinite"/></circle>
    <circle cx="55" cy="52" r="12" fill="#14100a"/>
    <circle cx="55" cy="52" r="7" fill="#ff8a4d"><animate attributeName="opacity" values="1;.5;1" dur="1.4s" repeatCount="indefinite"/></circle>`),
  collector: () => S('0 0 180 210', `
    <ellipse cx="90" cy="202" rx="58" ry="9" fill="#000" opacity=".35"/>
    <path d="M90 26 C124 26 138 70 134 130 C134 168 120 196 90 196 C60 196 46 168 46 130 C42 70 56 26 90 26 Z" fill="#2c2440" stroke="#14100a" stroke-width="4"/>
    <path d="M58 20 C66 4 114 4 122 20 L116 44 L64 44 Z" fill="#3d3258" stroke="#14100a" stroke-width="3"/>
    <circle cx="74" cy="58" r="7" fill="#7fdfff"><animate attributeName="opacity" values="1;.5;1" dur="2.6s" repeatCount="indefinite"/></circle>
    <circle cx="106" cy="58" r="7" fill="#7fdfff"><animate attributeName="opacity" values="1;.5;1" dur="2.6s" repeatCount="indefinite"/></circle>
    <path d="M78 84 Q90 92 102 84" stroke="#14100a" stroke-width="3" fill="none"/>
    <path d="M50 110 C30 116 22 134 28 150 C40 142 50 140 60 142 Z M130 110 C150 116 158 134 152 150 C140 142 130 140 120 142 Z" fill="#3d3258" stroke="#14100a" stroke-width="3"/>
    <circle cx="90" cy="124" r="16" fill="#0e1c2c" stroke="#14100a" stroke-width="3"/>
    <circle cx="90" cy="124" r="9" fill="#9a5fd0"><animate attributeName="r" values="9;6;9" dur="2s" repeatCount="indefinite"/></circle>
    <path d="M62 170 Q90 186 118 170" stroke="#3d3258" stroke-width="6" fill="none"/>`),
  torchHead: () => S('0 0 100 120', `
    <ellipse cx="50" cy="112" rx="28" ry="6" fill="#000" opacity=".3"/>
    <rect x="36" y="52" width="28" height="56" rx="8" fill="#3d3258" stroke="#14100a" stroke-width="3"/>
    <circle cx="50" cy="44" r="22" fill="#2c2440" stroke="#14100a" stroke-width="3"/>
    <circle cx="43" cy="42" r="4" fill="#ff8a4d"/><circle cx="57" cy="42" r="4" fill="#ff8a4d"/>
    <path d="M50 4 C58 14 62 22 58 30 C54 36 46 36 42 30 C38 22 42 14 50 4 Z" fill="#ff7a2a" stroke="#14100a" stroke-width="2">
      <animate attributeName="opacity" values="1;.6;1" dur="0.8s" repeatCount="indefinite"/></path>`),

  // ════════════ 3막 ════════════
  darkling: () => S('0 0 110 100', `
    <ellipse cx="55" cy="92" rx="32" ry="6" fill="#000" opacity=".3"/>
    <path d="M55 16 C82 16 94 40 90 62 C86 80 72 88 55 88 C38 88 24 80 20 62 C16 40 28 16 55 16 Z" fill="#1e1a2e" stroke="#0a0812" stroke-width="3"/>
    <path d="M30 30 L20 12 M55 22 L55 4 M80 30 L90 12" stroke="#1e1a2e" stroke-width="5" stroke-linecap="round"/>
    <circle cx="42" cy="48" r="6" fill="#b44aff"><animate attributeName="opacity" values="1;.5;1" dur="2.2s" repeatCount="indefinite"/></circle>
    <circle cx="68" cy="48" r="6" fill="#b44aff"><animate attributeName="opacity" values="1;.5;1" dur="2.2s" repeatCount="indefinite"/></circle>
    <path d="M38 68 L46 62 L52 68 L58 62 L64 68 L72 62" stroke="#b44aff" stroke-width="3" fill="none"/>`),
  orbWalker: () => S('0 0 130 150', `
    <ellipse cx="65" cy="142" rx="40" ry="7" fill="#000" opacity=".3"/>
    <circle cx="65" cy="52" r="34" fill="#d8dde4" stroke="#14100a" stroke-width="3.5"/>
    <circle cx="65" cy="52" r="22" fill="#0e1c2c"/>
    <circle cx="65" cy="52" r="13" fill="#ffd75e"><animate attributeName="r" values="13;9;13" dur="1.8s" repeatCount="indefinite"/></circle>
    <path d="M40 78 L24 110 L34 140 M90 78 L106 110 L96 140 M56 84 L50 120 L58 140 M74 84 L80 120 L72 140" stroke="#8a949e" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="42" cy="30" r="5" fill="#ffd75e" opacity=".7"/><circle cx="88" cy="30" r="5" fill="#ffd75e" opacity=".7"/>`),
  spireGrowth: () => S('0 0 160 170', `
    <ellipse cx="80" cy="162" rx="50" ry="8" fill="#000" opacity=".35"/>
    <path d="M80 160 C60 130 40 120 34 92 C28 64 44 40 64 44 C60 22 84 8 100 22 C120 14 140 34 132 56 C148 70 142 98 122 102 C116 126 100 136 96 160 Z" fill="#5a2a4a" stroke="#14100a" stroke-width="3.5"/>
    <path d="M50 70 C42 60 44 48 54 46 M110 50 C120 44 130 50 130 62" stroke="#7a3e66" stroke-width="5" fill="none"/>
    <path d="M64 70 C72 62 92 62 100 70 C104 80 96 90 82 90 C68 90 60 80 64 70 Z" fill="#2c1424" stroke="#14100a" stroke-width="2.5"/>
    <circle cx="74" cy="74" r="4" fill="#ff5a9a"/><circle cx="90" cy="74" r="4" fill="#ff5a9a"/>
    <path d="M30 130 C18 124 12 112 16 102 M130 130 C142 124 148 112 144 102" stroke="#5a2a4a" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M44 50 L36 36 M120 36 L126 22" stroke="#5a2a4a" stroke-width="5" stroke-linecap="round"/>`),
  theMaw: () => S('0 0 180 160', `
    <ellipse cx="90" cy="152" rx="62" ry="9" fill="#000" opacity=".35"/>
    <path d="M90 12 C134 12 158 48 154 92 C150 128 124 148 90 148 C56 148 30 128 26 92 C22 48 46 12 90 12 Z" fill="#b05a7a" stroke="#14100a" stroke-width="4"/>
    <path d="M40 70 C56 58 124 58 140 70 C144 96 128 122 90 122 C52 122 36 96 40 70 Z" fill="#3a0d1a" stroke="#14100a" stroke-width="3"/>
    <path d="M46 70 L54 88 L62 68 L72 90 L80 68 L90 92 L100 68 L108 90 L118 68 L126 88 L134 70" fill="#fff" stroke="#14100a" stroke-width="2"/>
    <path d="M58 116 L64 102 L72 114 L80 100 L90 116 L100 100 L108 114 L116 102 L122 116" fill="#fff" stroke="#14100a" stroke-width="2"/>
    <circle cx="62" cy="38" r="7" fill="#ffe96b"/><circle cx="118" cy="38" r="7" fill="#ffe96b"/>
    <circle cx="62" cy="38" r="3" fill="#14100a"/><circle cx="118" cy="38" r="3" fill="#14100a"/>
    <path d="M88 124 C90 130 94 132 98 130" stroke="#d88a9a" stroke-width="4" fill="none"/>`),
  transient: () => S('0 0 150 170', `
    <defs><linearGradient id="trg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9adfff" stop-opacity=".95"/><stop offset="100%" stop-color="#2a5a7a" stop-opacity=".35"/></linearGradient></defs>
    <path d="M75 10 C108 10 122 48 118 86 C116 116 104 132 96 144 L90 130 L82 150 L75 136 L68 150 L60 130 L54 144 C46 132 34 116 32 86 C28 48 42 10 75 10 Z" fill="url(#trg)" stroke="#bfe8ff" stroke-width="2.5">
      <animate attributeName="opacity" values="1;.55;1" dur="2.2s" repeatCount="indefinite"/></path>
    <ellipse cx="60" cy="62" rx="7" ry="12" fill="#0a1622"/><ellipse cx="90" cy="62" rx="7" ry="12" fill="#0a1622"/>
    <circle cx="75" cy="92" r="9" fill="#fff" opacity=".8"><animate attributeName="r" values="9;5;9" dur="1.6s" repeatCount="indefinite"/></circle>`),
  giantHead: () => S('0 0 210 200', `
    <ellipse cx="105" cy="192" rx="76" ry="9" fill="#000" opacity=".35"/>
    <path d="M105 12 C156 12 184 52 180 110 C178 152 158 184 105 184 C52 184 32 152 30 110 C26 52 54 12 105 12 Z" fill="#5d5d66" stroke="#14100a" stroke-width="4.5"/>
    <path d="M60 16 L48 36 M150 16 L162 36 M40 80 L28 84 M170 80 L182 84" stroke="#44444c" stroke-width="6" stroke-linecap="round"/>
    <path d="M58 76 C66 64 84 64 92 76 C90 88 62 88 58 76 Z M118 76 C126 64 144 64 152 76 C148 88 122 88 118 76 Z" fill="#16100c" stroke="#14100a" stroke-width="2.5"/>
    <circle cx="75" cy="76" r="5" fill="#ff4a4a"><animate attributeName="opacity" values="1;.4;1" dur="3s" repeatCount="indefinite"/></circle>
    <circle cx="135" cy="76" r="5" fill="#ff4a4a"><animate attributeName="opacity" values="1;.4;1" dur="3s" repeatCount="indefinite"/></circle>
    <path d="M70 130 Q105 116 140 130" stroke="#16100c" stroke-width="5" fill="none"/>
    <path d="M85 142 L90 134 M105 138 L105 130 M125 142 L120 134" stroke="#44444c" stroke-width="4"/>
    <path d="M48 48 C60 40 76 38 88 42 M122 42 C134 38 150 40 162 48" stroke="#44444c" stroke-width="5" fill="none"/>`),
  nemesis: () => S('0 0 160 190', `
    <defs><linearGradient id="nmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3a4458"/><stop offset="100%" stop-color="#161a26"/></linearGradient></defs>
    <ellipse cx="80" cy="182" rx="50" ry="8" fill="#000" opacity=".35"/>
    <path d="M80 14 C108 14 120 44 116 86 C114 130 104 160 80 176 C56 160 46 130 44 86 C40 44 52 14 80 14 Z" fill="url(#nmg)" stroke="#5fb6c9" stroke-width="2.5" opacity=".92">
      <animate attributeName="opacity" values=".92;.5;.92" dur="3s" repeatCount="indefinite"/></path>
    <path d="M58 28 L44 6 M102 28 L116 6" stroke="#161a26" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="66" cy="58" rx="6" ry="11" fill="#7fdfff"/><ellipse cx="94" cy="58" rx="6" ry="11" fill="#7fdfff"/>
    <path d="M118 70 C140 58 152 36 148 18 L158 24 C162 48 148 74 126 86 Z" fill="#cdd6e0" stroke="#14100a" stroke-width="2.5"/>
    <path d="M112 92 L130 80" stroke="#6b4a23" stroke-width="5" stroke-linecap="round"/>`),
  reptomancer: () => humanoid('#4a6b2e', '#6e8a4a', `
    <path d="M44 8 C54 0 66 0 76 8 L70 24 L50 24 Z" fill="#36521e" stroke="#14100a" stroke-width="2.5"/>
    <circle cx="54" cy="32" r="4" fill="#ffd75e"/><circle cx="66" cy="32" r="4" fill="#ffd75e"/>
    <path d="M54 40 L58 44 M66 40 L62 44" stroke="#14100a" stroke-width="2"/>
    <path d="M90 60 C108 56 118 64 118 78 C110 74 100 76 94 82 Z" fill="#6e8a4a" stroke="#14100a" stroke-width="2.5"/>
    <path d="M24 80 C12 88 8 102 14 114 C20 104 30 100 38 100 Z" fill="#6e8a4a" stroke="#14100a" stroke-width="2.5"/>
    <path d="M40 76 Q60 66 80 76 L80 88 Q60 78 40 88 Z" fill="#36521e" opacity=".8"/>`),
  dagger: () => S('0 0 80 130', `
    <ellipse cx="40" cy="122" rx="22" ry="5" fill="#000" opacity=".3"/>
    <path d="M40 6 L52 60 L40 112 L28 60 Z" fill="#cdd6e0" stroke="#14100a" stroke-width="3">
      <animateTransform attributeName="transform" type="rotate" values="-6 40 64;6 40 64;-6 40 64" dur="1.2s" repeatCount="indefinite"/></path>
    <path d="M22 58 L58 58 L54 70 L26 70 Z" fill="#8a6d3b" stroke="#14100a" stroke-width="2.5"/>
    <circle cx="40" cy="64" r="4" fill="#c0392b"/>`),
  awakenedOne: () => S('0 0 200 210', `
    <defs><radialGradient id="awg" cx="50%" cy="35%"><stop offset="0%" stop-color="#4a3a6b"/><stop offset="100%" stop-color="#16101f"/></radialGradient></defs>
    <ellipse cx="100" cy="200" rx="68" ry="10" fill="#000" opacity=".35"/>
    <path d="M100 16 C144 16 168 56 164 110 C162 152 140 188 100 196 C60 188 38 152 36 110 C32 56 56 16 100 16 Z" fill="url(#awg)" stroke="#14100a" stroke-width="4"/>
    <path d="M56 30 L34 4 M144 30 L166 4 M48 64 L24 52 M152 64 L176 52" stroke="#16101f" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="76" cy="78" rx="9" ry="15" fill="#ff4a6a"><animate attributeName="opacity" values="1;.5;1" dur="2.4s" repeatCount="indefinite"/></ellipse>
    <ellipse cx="124" cy="78" rx="9" ry="15" fill="#ff4a6a"><animate attributeName="opacity" values="1;.5;1" dur="2.4s" repeatCount="indefinite"/></ellipse>
    <ellipse cx="100" cy="56" rx="6" ry="10" fill="#ff4a6a" opacity=".8"/>
    <path d="M68 124 Q100 142 132 124" stroke="#0a0610" stroke-width="6" fill="none"/>
    <path d="M76 128 L82 140 M98 134 L100 146 M122 128 L116 140" stroke="#ff4a6a" stroke-width="3.5"/>
    <circle cx="100" cy="170" r="11" fill="#ff4a6a" opacity=".55"><animate attributeName="r" values="11;7;11" dur="2s" repeatCount="indefinite"/></circle>`),
  timeEater: () => S('0 0 210 210', `
    <defs><radialGradient id="teg" cx="50%" cy="40%"><stop offset="0%" stop-color="#3a6b8a"/><stop offset="100%" stop-color="#101e2c"/></radialGradient></defs>
    <ellipse cx="105" cy="200" rx="74" ry="10" fill="#000" opacity=".35"/>
    <path d="M105 14 C152 14 178 54 174 108 C172 154 146 192 105 198 C64 192 38 154 36 108 C32 54 58 14 105 14 Z" fill="url(#teg)" stroke="#14100a" stroke-width="4"/>
    <circle cx="105" cy="96" r="44" fill="#0a1420" stroke="#5fb6c9" stroke-width="3"/>
    <circle cx="105" cy="96" r="36" fill="none" stroke="#2c4a62" stroke-width="2"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
      const a = Math.PI / 6 * i; const x1 = 105 + Math.cos(a) * 30, y1 = 96 + Math.sin(a) * 30, x2 = 105 + Math.cos(a) * 36, y2 = 96 + Math.sin(a) * 36;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#5fb6c9" stroke-width="2"/>`;
    }).join('')}
    <line x1="105" y1="96" x2="105" y2="70" stroke="#7fdfff" stroke-width="4" stroke-linecap="round">
      <animateTransform attributeName="transform" type="rotate" from="0 105 96" to="360 105 96" dur="9s" repeatCount="indefinite"/></line>
    <line x1="105" y1="96" x2="124" y2="96" stroke="#7fdfff" stroke-width="3" stroke-linecap="round">
      <animateTransform attributeName="transform" type="rotate" from="0 105 96" to="360 105 96" dur="60s" repeatCount="indefinite"/></line>
    <ellipse cx="70" cy="40" rx="6" ry="10" fill="#7fdfff" opacity=".8"/><ellipse cx="140" cy="40" rx="6" ry="10" fill="#7fdfff" opacity=".8"/>
    <path d="M48 160 C66 176 144 176 162 160" stroke="#2c4a62" stroke-width="6" fill="none"/>`),
  donu: () => S('0 0 150 150', `
    <ellipse cx="75" cy="142" rx="48" ry="8" fill="#000" opacity=".35"/>
    <path d="M75 10 L128 42 L128 98 L75 130 L22 98 L22 42 Z" fill="#a8642e" stroke="#14100a" stroke-width="4">
      <animateTransform attributeName="transform" type="rotate" values="-3 75 70;3 75 70;-3 75 70" dur="4s" repeatCount="indefinite"/></path>
    <path d="M75 26 L114 50 L114 90 L75 114 L36 90 L36 50 Z" fill="#7a4a1e" stroke="#14100a" stroke-width="2.5"/>
    <circle cx="75" cy="70" r="16" fill="#14100a"/>
    <circle cx="75" cy="70" r="10" fill="#ff8a4d"><animate attributeName="r" values="10;6;10" dur="1.8s" repeatCount="indefinite"/></circle>`),
  deca: () => S('0 0 150 150', `
    <ellipse cx="75" cy="142" rx="48" ry="8" fill="#000" opacity=".35"/>
    <rect x="25" y="20" width="100" height="100" rx="14" fill="#5d6470" stroke="#14100a" stroke-width="4" transform="rotate(45 75 70)">
      <animateTransform attributeName="transform" type="rotate" values="42 75 70;48 75 70;42 75 70" dur="4s" repeatCount="indefinite"/></rect>
    <rect x="42" y="37" width="66" height="66" rx="8" fill="#444b56" stroke="#14100a" stroke-width="2.5" transform="rotate(45 75 70)"/>
    <circle cx="75" cy="70" r="16" fill="#14100a"/>
    <circle cx="75" cy="70" r="10" fill="#7fdfff"><animate attributeName="r" values="10;6;10" dur="1.8s" repeatCount="indefinite"/></circle>`),

  campfire: () => S('0 0 200 160', `
    <ellipse cx="100" cy="146" rx="70" ry="10" fill="#000" opacity=".4"/>
    <path d="M48 140 L152 124 M58 124 L148 142" stroke="#5a4226" stroke-width="11" stroke-linecap="round"/>
    <path d="M100 36 C118 60 132 76 130 100 C128 122 114 134 100 134 C86 134 72 122 70 100 C68 76 82 60 100 36 Z" fill="#ff7a2a">
      <animate attributeName="d" dur="0.9s" repeatCount="indefinite" values="M100 36 C118 60 132 76 130 100 C128 122 114 134 100 134 C86 134 72 122 70 100 C68 76 82 60 100 36 Z;M100 28 C122 58 136 78 132 102 C130 122 114 134 100 134 C86 134 70 122 68 100 C66 74 78 56 100 28 Z;M100 36 C118 60 132 76 130 100 C128 122 114 134 100 134 C86 134 72 122 70 100 C68 76 82 60 100 36 Z"/>
    </path>
    <path d="M100 64 C110 80 118 90 116 104 C114 118 106 126 100 126 C94 126 86 118 84 104 C82 90 90 80 100 64 Z" fill="#ffcf6b">
      <animate attributeName="opacity" values="1;.7;1" dur="0.7s" repeatCount="indefinite"/>
    </path>`),
};

// ===== map node icons =====
export const MAP_ICONS = {
  monster: S('0 0 40 40', `<path d="M8 32 L28 8 M12 8 L32 32" stroke="#3a2c1a" stroke-width="4" stroke-linecap="round"/><path d="M6 26 L14 34 M26 34 L34 26" stroke="#3a2c1a" stroke-width="3" stroke-linecap="round"/>`),
  elite: S('0 0 40 40', `<path d="M20 4 C26 12 32 16 31 24 C30 32 25 36 20 36 C15 36 10 32 9 24 C8 16 14 12 20 4 Z" fill="#b3452e" stroke="#3a2c1a" stroke-width="2.5"/><path d="M20 14 C23 19 26 21 25 26 C24 30 22 32 20 32 C18 32 16 30 15 26 C14 21 17 19 20 14 Z" fill="#ffb24d"/>`),
  rest: S('0 0 40 40', `<path d="M8 34 L32 28 M10 28 L30 35" stroke="#3a2c1a" stroke-width="4" stroke-linecap="round"/><path d="M20 6 C25 13 28 17 27 23 C26 28 23 31 20 31 C17 31 14 28 13 23 C12 17 15 13 20 6 Z" fill="#e8762a" stroke="#3a2c1a" stroke-width="2"/>`),
  shop: S('0 0 40 40', `<circle cx="20" cy="22" r="13" fill="#c9a45c" stroke="#3a2c1a" stroke-width="2.5"/><text x="20" y="29" font-size="18" text-anchor="middle" fill="#3a2c1a" font-weight="bold">$</text><path d="M14 9 L20 3 L26 9" fill="none" stroke="#3a2c1a" stroke-width="3"/>`),
  treasure: S('0 0 40 40', `<rect x="6" y="16" width="28" height="18" rx="3" fill="#8a5a1e" stroke="#3a2c1a" stroke-width="2.5"/><path d="M6 22 L34 22" stroke="#3a2c1a" stroke-width="2.5"/><path d="M6 18 C6 10 34 10 34 18 L34 22 L6 22 Z" fill="#a8762e" stroke="#3a2c1a" stroke-width="2.5"/><rect x="17" y="19" width="6" height="8" rx="1.5" fill="#ffd75e" stroke="#3a2c1a" stroke-width="1.5"/>`),
  event: S('0 0 40 40', `<text x="20" y="31" font-size="32" text-anchor="middle" fill="#3a2c1a" font-weight="bold" font-family="serif">?</text>`),
  boss: S('0 0 60 60', `<circle cx="30" cy="28" r="20" fill="#2b1418" stroke="#3a2c1a" stroke-width="3"/><circle cx="22" cy="25" r="5" fill="#ff4a4a"/><circle cx="38" cy="25" r="5" fill="#ff4a4a"/><path d="M22 38 L26 34 L30 38 L34 34 L38 38" fill="none" stroke="#ff4a4a" stroke-width="2.5"/><path d="M12 14 L4 2 L18 8 M48 14 L56 2 L42 8" fill="#2b1418" stroke="#3a2c1a" stroke-width="3"/>`),
};

// ===== intent icons =====
const sword = (color = '#d8dde4') => `<path d="M10 38 L34 8 L40 6 L38 12 L14 42 Z" fill="${color}" stroke="#14100a" stroke-width="2"/><path d="M12 34 L18 40 M8 44 L16 36" stroke="#8a5a1e" stroke-width="4" stroke-linecap="round"/>`;
export const INTENT_ICONS = {
  attack: S('0 0 48 48', sword()),
  bigAttack: S('0 0 48 48', `<path d="M6 40 L30 6 L44 4 L40 18 L12 44 Z" fill="#ff6a4d" stroke="#14100a" stroke-width="2"/><path d="M10 36 L18 44" stroke="#8a5a1e" stroke-width="5" stroke-linecap="round"/>`),
  defend: S('0 0 48 48', `<path d="M24 4 L42 10 C42 28 36 40 24 46 C12 40 6 28 6 10 Z" fill="#9fb8c8" stroke="#14100a" stroke-width="2.5"/><path d="M24 10 L36 14 C36 27 32 36 24 40 Z" fill="#c8dce8"/>`),
  buff: S('0 0 48 48', `<path d="M24 4 L40 22 L31 22 L31 44 L17 44 L17 22 L8 22 Z" fill="#ff9a3d" stroke="#14100a" stroke-width="2.5"/>`),
  debuff: S('0 0 48 48', `<path d="M24 44 L8 26 L17 26 L17 4 L31 4 L31 26 L40 26 Z" fill="#7da832" stroke="#14100a" stroke-width="2.5"/>`),
  'attack-debuff': S('0 0 48 48', sword() + `<path d="M38 30 L30 40 L35 40 L35 46 L41 46 L41 40 L46 40 Z" fill="#7da832" stroke="#14100a" stroke-width="1.5"/>`),
  'attack-defend': S('0 0 48 48', sword() + `<path d="M38 28 L46 31 C46 39 43 44 38 46 C33 44 30 39 30 31 Z" fill="#9fb8c8" stroke="#14100a" stroke-width="1.5"/>`),
  'defend-buff': S('0 0 48 48', `<path d="M20 6 L36 12 C36 28 31 38 20 44 C9 38 4 28 4 12 Z" fill="#9fb8c8" stroke="#14100a" stroke-width="2.5"/><path d="M38 24 L46 32 L42 32 L42 44 L34 44 L34 32 L30 32 Z" fill="#ff9a3d" stroke="#14100a" stroke-width="1.5"/>`),
  status: S('0 0 48 48', `<rect x="12" y="6" width="24" height="34" rx="3" fill="#5d5470" stroke="#14100a" stroke-width="2.5" transform="rotate(8 24 24)"/><rect x="8" y="8" width="24" height="34" rx="3" fill="#6e6585" stroke="#14100a" stroke-width="2.5" transform="rotate(-6 24 24)"/><text x="20" y="32" font-size="18" text-anchor="middle" fill="#d9c79a">?</text>`),
  sleep: S('0 0 48 48', `<text x="14" y="26" font-size="20" fill="#9fb8c8" font-weight="bold">Z</text><text x="26" y="36" font-size="14" fill="#9fb8c8" font-weight="bold">z</text><text x="34" y="44" font-size="10" fill="#9fb8c8" font-weight="bold">z</text>`),
  stunned: S('0 0 48 48', `<circle cx="14" cy="20" r="4" fill="#ffe96b"/><circle cx="34" cy="14" r="4" fill="#ffe96b"/><circle cx="28" cy="32" r="4" fill="#ffe96b"/><path d="M10 38 Q24 28 40 36" fill="none" stroke="#ffe96b" stroke-width="2"/>`),
  escape: S('0 0 48 48', `<path d="M8 24 L32 24 M24 12 L38 24 L24 36" fill="none" stroke="#d9c79a" stroke-width="4" stroke-linecap="round"/>`),
  unknown: S('0 0 48 48', `<circle cx="24" cy="24" r="18" fill="#4a4258" stroke="#14100a" stroke-width="2.5"/><text x="24" y="33" font-size="24" text-anchor="middle" fill="#d9c79a" font-weight="bold">?</text>`),
};
