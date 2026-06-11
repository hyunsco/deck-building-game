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
    <ellipse cx="70" cy="160" rx="40" ry="8" fill="#000" opacity=".35"/>
    <path d="M62 60 L40 150 L96 150 L82 60 Z" fill="#5a2520" stroke="#14100a" stroke-width="3"/>
    <path d="M58 64 C40 80 36 120 40 148 L26 150 C18 110 30 74 48 58 Z" fill="#8a1f1a" stroke="#14100a" stroke-width="3"/>
    <rect x="50" y="58" width="40" height="46" rx="8" fill="#7d8590" stroke="#14100a" stroke-width="3"/>
    <rect x="55" y="64" width="30" height="10" rx="4" fill="#aab4c0"/>
    <circle cx="70" cy="36" r="20" fill="#7d8590" stroke="#14100a" stroke-width="3"/>
    <path d="M52 34 L88 34 L84 46 L56 46 Z" fill="#2b2118"/>
    <rect x="56" y="36" width="28" height="4" fill="#ffb24d"/>
    <path d="M70 16 C76 6 90 4 98 10 C88 12 82 18 80 24 Z" fill="#c0392b" stroke="#14100a" stroke-width="2"/>
    <path d="M104 60 L112 140 L120 60 L112 50 Z" fill="#b9c2cc" stroke="#14100a" stroke-width="3"/>
    <rect x="106" y="138" width="13" height="10" rx="3" fill="#6b4a23"/>
    <circle cx="34" cy="96" r="17" fill="#4a3a20" stroke="#14100a" stroke-width="3"/>
    <circle cx="34" cy="96" r="9" fill="#806030"/><circle cx="34" cy="96" r="3" fill="#c9a45c"/>`),

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
