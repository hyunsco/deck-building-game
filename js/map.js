// Act map generation — 7 columns × 15 rows, ~6 upward random walks, StS-style.
import { randInt, pick, chance } from './rng.js';

export const ROWS = 15;
export const COLS = 7;

// node types: monster | elite | event | rest | shop | treasure
export function generateMap(rng) {
  // nodes[row] = Map col -> node
  const grid = Array.from({ length: ROWS }, () => ({}));
  const edges = []; // {row, from, to} between row and row+1

  const crosses = (row, from, to) =>
    edges.some((ed) => ed.row === row && ((ed.from < from && ed.to > to) || (ed.from > from && ed.to < to)));

  const starts = [];
  for (let w = 0; w < 6; w++) {
    let col;
    do { col = randInt(rng, 0, COLS - 1); }
    while (w === 1 && col === starts[0]);
    starts.push(col);

    for (let row = 0; row < ROWS; row++) {
      grid[row][col] = grid[row][col] || { row, col, type: null, next: new Set() };
      if (row === ROWS - 1) break;
      // pick next column
      let candidates = [col - 1, col, col + 1].filter((c2) => c2 >= 0 && c2 < COLS);
      candidates = candidates.filter((c2) => !crosses(row, col, c2));
      let nc;
      if (candidates.length) nc = pick(rng, candidates);
      else {
        // merge into an existing edge endpoint to avoid crossing
        const ex = edges.find((ed) => ed.row === row && Math.abs(ed.from - col) <= 1);
        nc = ex ? ex.to : col;
      }
      if (!edges.some((ed) => ed.row === row && ed.from === col && ed.to === nc)) {
        edges.push({ row, from: col, to: nc });
      }
      grid[row][col].next.add(nc);
      col = nc;
    }
  }

  // assign room types
  for (let row = 0; row < ROWS; row++) {
    for (const node of Object.values(grid[row])) {
      if (row === 0) node.type = 'monster';
      else if (row === 8) node.type = 'treasure';
      else if (row === ROWS - 1) node.type = 'rest';
      else node.type = rollType(rng, row, node, grid);
    }
  }

  // jitter for hand-drawn look
  for (let row = 0; row < ROWS; row++) {
    for (const node of Object.values(grid[row])) {
      node.next = [...node.next];
      node.jx = randInt(rng, -14, 14);
      node.jy = randInt(rng, -10, 10);
      node.rot = randInt(rng, -6, 6);
    }
  }

  return { grid, rows: ROWS, cols: COLS };
}

function rollType(rng, row, node, grid) {
  const parents = Object.values(grid[row - 1] || {}).filter((p) => p.next.has(node.col));
  const parentTypes = parents.map((p) => p.type);
  for (let i = 0; i < 20; i++) {
    const r = rng();
    let t;
    if (r < 0.45) t = 'monster';
    else if (r < 0.67) t = 'event';
    else if (r < 0.83) t = row >= 5 ? 'elite' : 'monster';
    else if (r < 0.95) t = row >= 5 && row !== ROWS - 2 ? 'rest' : 'event';
    else t = 'shop';
    // avoid consecutive identical special rooms along a path
    if (['elite', 'rest', 'shop'].includes(t) && parentTypes.includes(t)) continue;
    return t;
  }
  return 'monster';
}

// All nodes reachable from the starting row following edges
export function reachable(map, fromNode) {
  if (!fromNode) return Object.values(map.grid[0]);
  if (fromNode.row >= ROWS - 1) return [];
  return fromNode.next.map((c) => map.grid[fromNode.row + 1][c]).filter(Boolean);
}
