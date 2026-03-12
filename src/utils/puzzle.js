export const GRID_OPTIONS = [
  { size: 2, label: '2\u00d72' },
  { size: 3, label: '3\u00d73' },
  { size: 4, label: '4\u00d74' },
];

export const DOT_COUNTS = { 2: [2, 3], 3: [3, 4, 5], 4: [5, 6, 7] };

export function idx(r, c, size) {
  return r * size + c;
}

export function rc(i, size) {
  return [Math.floor(i / size), i % size];
}

export function isDiagonalEdge(a, b, gridSize) {
  const ar = rc(a, gridSize);
  const br = rc(b, gridSize);
  return Math.abs(ar[0] - br[0]) === 1 && Math.abs(ar[1] - br[1]) === 1;
}

function getNeighbours(curr, gridSize, useDiag) {
  const cr = rc(curr, gridSize);
  const dirs4 = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const dirs8 = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
  const dirs = useDiag ? dirs8 : dirs4;
  const neighbours = [];
  for (let i = 0; i < dirs.length; i++) {
    const nr = cr[0] + dirs[i][0];
    const nc = cr[1] + dirs[i][1];
    if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
      neighbours.push(idx(nr, nc, gridSize));
    }
  }
  return neighbours;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

function extendInDirection(path, visited, dir, gridSize, dotCount, turnLimit, turnsUsed, allDirs) {
  let extended = false;
  while (path.length < dotCount) {
    const last = path[path.length - 1];
    const lr = rc(last, gridSize);
    const nr = lr[0] + dir[0];
    const nc = lr[1] + dir[1];
    if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) break;
    const ni = idx(nr, nc, gridSize);
    if (visited[ni]) break;
    visited[ni] = true;
    path.push(ni);
    extended = true;
  }
  if (path.length === dotCount) return path;
  if (!extended) return null;
  if (turnsUsed >= turnLimit) return null;

  const shuffled = allDirs.slice();
  shuffle(shuffled);
  for (let d = 0; d < shuffled.length; d++) {
    if (shuffled[d][0] === dir[0] && shuffled[d][1] === dir[1]) continue;
    if (shuffled[d][0] === -dir[0] && shuffled[d][1] === -dir[1]) continue;
    const savedLen = path.length;
    const savedVisited = {};
    for (const key in visited) savedVisited[key] = true;
    const result = extendInDirection(path, visited, shuffled[d], gridSize, dotCount, turnLimit, turnsUsed + 1, allDirs);
    if (result) return result;
    while (path.length > savedLen) {
      const removed = path.pop();
      delete visited[removed];
    }
    for (const key2 in savedVisited) visited[key2] = true;
  }
  return null;
}

function buildTurnLimitedPath(gridSize, dotCount, useDiag, turnLimit) {
  const dirs4 = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const dirs8 = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
  const dirs = useDiag ? dirs8 : dirs4;
  const startR = Math.floor(Math.random() * gridSize);
  const startC = Math.floor(Math.random() * gridSize);
  const path = [idx(startR, startC, gridSize)];
  const visited = {};
  visited[path[0]] = true;
  const turnsUsed = 0;
  const shuffledDirs = dirs.slice();
  shuffle(shuffledDirs);
  for (let d = 0; d < shuffledDirs.length; d++) {
    const result = extendInDirection(path, visited, shuffledDirs[d], gridSize, dotCount, turnLimit, turnsUsed, dirs);
    if (result) return result;
  }
  return null;
}

export function generatePuzzle(gridSize, dotCount, useDiag, turnLimit) {
  const total = gridSize * gridSize;

  if (turnLimit >= 0) {
    for (let attempt = 0; attempt < 1000; attempt++) {
      const path = buildTurnLimitedPath(gridSize, dotCount, useDiag, turnLimit);
      if (path && path.length === dotCount) {
        const edges = [];
        for (let j = 0; j < path.length - 1; j++) edges.push([path[j], path[j + 1]]);
        if (!useDiag) {
          let hasDiag = false;
          for (let k = 0; k < edges.length; k++) {
            if (isDiagonalEdge(edges[k][0], edges[k][1], gridSize)) { hasDiag = true; break; }
          }
          if (hasDiag) continue;
        }
        return { dots: path, edges };
      }
    }
  }

  for (let attempt2 = 0; attempt2 < 500; attempt2++) {
    const visited = {};
    const path2 = [];
    const start = Math.floor(Math.random() * total);
    visited[start] = true;
    path2.push(start);
    while (path2.length < dotCount) {
      const curr = path2[path2.length - 1];
      const allN = getNeighbours(curr, gridSize, useDiag);
      const avail = [];
      for (let i = 0; i < allN.length; i++) {
        if (!visited[allN[i]]) avail.push(allN[i]);
      }
      if (avail.length === 0) break;
      const next = avail[Math.floor(Math.random() * avail.length)];
      visited[next] = true;
      path2.push(next);
    }
    if (path2.length === dotCount) {
      const edges3 = [];
      for (let j2 = 0; j2 < path2.length - 1; j2++) edges3.push([path2[j2], path2[j2 + 1]]);
      if (!useDiag) {
        let hasDiag2 = false;
        for (let k2 = 0; k2 < edges3.length; k2++) {
          if (isDiagonalEdge(edges3[k2][0], edges3[k2][1], gridSize)) { hasDiag2 = true; break; }
        }
        if (hasDiag2) continue;
      }
      return { dots: path2, edges: edges3 };
    }
  }

  const fbPath = [];
  for (let f = 0; f < dotCount && f < total; f++) fbPath.push(f);
  const fbEdges = [];
  for (let g = 0; g < fbPath.length - 1; g++) fbEdges.push([fbPath[g], fbPath[g + 1]]);
  return { dots: fbPath, edges: fbEdges };
}

export function getDotPositions(w, h, gridSize) {
  const pad = w * 0.15;
  const stepX = gridSize > 1 ? (w - 2 * pad) / (gridSize - 1) : 0;
  const stepY = gridSize > 1 ? (h - 2 * pad) / (gridSize - 1) : 0;
  const positions = [];
  for (let r = 0; r < gridSize; r++)
    for (let c = 0; c < gridSize; c++)
      positions.push({ x: pad + c * stepX, y: pad + r * stepY });
  return positions;
}

export function edgeKey(a, b) {
  return a < b ? a + '-' + b : b + '-' + a;
}
