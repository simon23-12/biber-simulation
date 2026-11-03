/* Hilfsalgorithmen: Lösungen werden berechnet statt von Hand eingetragen. */
(function (B) {
  'use strict';
  const A = {};

  A.dijkstra = function (edges, s, t) {
    const adj = {};
    edges.forEach(([a, b, w]) => {
      (adj[a] = adj[a] || []).push([b, w]);
      (adj[b] = adj[b] || []).push([a, w]);
    });
    const dist = { [s]: 0 }, done = new Set(), prev = {};
    for (;;) {
      let u = null;
      for (const k in dist) if (!done.has(k) && (u === null || dist[k] < dist[u])) u = k;
      if (u === null) break;
      done.add(u);
      if (u === t) break;
      for (const [v, w] of adj[u] || []) {
        if (dist[v] === undefined || dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; }
      }
    }
    const path = [t];
    while (path[0] !== s) path.unshift(prev[path[0]]);
    return { dist: dist[t], path };
  };

  A.maxflow = function (edges, s, t) {
    const cap = {};
    edges.forEach(([a, b, c]) => {
      cap[a] = cap[a] || {}; cap[b] = cap[b] || {};
      cap[a][b] = (cap[a][b] || 0) + c;
      if (cap[b][a] === undefined) cap[b][a] = 0;
    });
    let flow = 0;
    for (;;) {
      const prev = { [s]: null }, q = [s];
      while (q.length && !(t in prev)) {
        const u = q.shift();
        for (const v in cap[u]) if (!(v in prev) && cap[u][v] > 0) { prev[v] = u; q.push(v); }
      }
      if (!(t in prev)) break;
      let b = Infinity;
      for (let v = t; prev[v] !== null; v = prev[v]) b = Math.min(b, cap[prev[v]][v]);
      for (let v = t; prev[v] !== null; v = prev[v]) { cap[prev[v]][v] -= b; cap[v][prev[v]] += b; }
      flow += b;
    }
    return flow;
  };

  A.lcs = function (a, b) {
    const d = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        d[i][j] = a[i - 1] === b[j - 1] ? d[i - 1][j - 1] + 1 : Math.max(d[i - 1][j], d[i][j - 1]);
    return d[a.length][b.length];
  };

  A.knapsack = function (items, cap) {
    let best = 0, set = [];
    const n = items.length;
    for (let m = 0; m < (1 << n); m++) {
      let w = 0, v = 0;
      for (let i = 0; i < n; i++) if (m >> i & 1) { w += items[i].w; v += items[i].v; }
      if (w <= cap && v > best) { best = v; set = [...Array(n).keys()].filter(i => m >> i & 1); }
    }
    return { best, set };
  };

  /* Ist `order` eine mögliche Ausfahrt-Reihenfolge, wenn 1..n der Reihe nach in eine Sackgasse (Stapel) fahren? */
  A.stackPermutation = function (order) {
    const st = [], n = order.length;
    let next = 1;
    for (const x of order) {
      while (st[st.length - 1] !== x && next <= n) st.push(next++);
      if (st[st.length - 1] !== x) return false;
      st.pop();
    }
    return true;
  };

  /* Normales Nim: Wer das letzte Hölzchen nimmt, gewinnt. Liefert die Gewinnzüge für n Hölzchen. */
  A.nimWinningMoves = function (moves, n) {
    const win = [false];
    for (let i = 1; i <= n; i++) win[i] = moves.some(m => m <= i && !win[i - m]);
    return moves.filter(m => m <= n && !win[n - m]);
  };

  /* Lights Out */
  A.lightsToggle = function (n, state, idx) {
    const s = state.slice(), r = Math.floor(idx / n), c = idx % n;
    [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < n && cc >= 0 && cc < n) s[rr * n + cc] = !s[rr * n + cc];
    });
    return s;
  };
  A.lightsSolve = function (n, start) {
    const key = s => s.map(x => x ? 1 : 0).join('');
    const seen = new Map([[key(start), []]]);
    const q = [start];
    while (q.length) {
      const s = q.shift(), path = seen.get(key(s));
      if (s.every(x => !x)) return path;
      for (let i = 0; i < n * n; i++) {
        const t = A.lightsToggle(n, s, i), k = key(t);
        if (!seen.has(k)) { seen.set(k, path.concat(i)); q.push(t); }
      }
    }
    return null;
  };

  /* Pfannkuchen: Die obersten k Pfannkuchen werden gewendet. Ziel: aufsteigend von oben nach unten. */
  A.pancakeFlip = (arr, k) => arr.slice(0, k).reverse().concat(arr.slice(k));
  A.pancakeSorted = arr => arr.every((x, i) => i === 0 || arr[i - 1] < x);
  A.pancakeSolve = function (start) {
    const seen = new Map([[start.join(), []]]);
    const q = [start];
    while (q.length) {
      const s = q.shift(), path = seen.get(s.join());
      if (A.pancakeSorted(s)) return path;
      for (let k = 2; k <= s.length; k++) {
        const t = A.pancakeFlip(s, k), key = t.join();
        if (!seen.has(key)) { seen.set(key, path.concat(k)); q.push(t); }
      }
    }
    return null;
  };

  /* Roboter auf dem Raster. dirs: U D L R */
  const DIRS = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };
  A.robotRun = function (cfg, prog) {
    let [r, c] = cfg.start;
    const path = [[r, c]];
    const walls = new Set(cfg.walls.map(w => w.join()));
    for (let i = 0; i < prog.length; i++) {
      const [dr, dc] = DIRS[prog[i]];
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= cfg.size[0] || nc >= cfg.size[1] || walls.has(nr + ',' + nc)) {
        return { path, blockedAt: i + 1 };
      }
      r = nr; c = nc; path.push([r, c]);
    }
    const seen = new Set(path.map(p => p.join()));
    const got = cfg.items.filter(it => seen.has(it.join())).length;
    return { path, got, atGoal: r === cfg.goal[0] && c === cfg.goal[1] };
  };
  A.robotSolve = function (cfg) {
    const items = cfg.items.map(i => i.join());
    const walls = new Set(cfg.walls.map(w => w.join()));
    const maskOf = (r, c, m) => { const k = items.indexOf(r + ',' + c); return k >= 0 ? m | (1 << k) : m; };
    const start = [cfg.start[0], cfg.start[1], maskOf(cfg.start[0], cfg.start[1], 0)];
    const seen = new Map([[start.join(), []]]);
    const q = [start];
    const full = (1 << items.length) - 1;
    while (q.length) {
      const [r, c, m] = q.shift(), path = seen.get([r, c, m].join());
      if (r === cfg.goal[0] && c === cfg.goal[1] && m === full) return path;
      for (const d in DIRS) {
        const nr = r + DIRS[d][0], nc = c + DIRS[d][1];
        if (nr < 0 || nc < 0 || nr >= cfg.size[0] || nc >= cfg.size[1] || walls.has(nr + ',' + nc)) continue;
        const st = [nr, nc, maskOf(nr, nc, m)], k = st.join();
        if (!seen.has(k)) { seen.set(k, path.concat(d)); q.push(st); }
      }
    }
    return null;
  };

  /* Stapelmaschine (umgekehrte polnische Notation) */
  A.stackRun = function (prog) {
    const st = [], trace = [];
    for (const t of prog) {
      if (/^\d+$/.test(t)) st.push(+t);
      else {
        if (st.length < 2) return { error: 'Für „' + t + '“ liegen zu wenige Zahlen auf dem Stapel.', trace };
        const b = st.pop(), a = st.pop();
        st.push(t === '+' ? a + b : t === '×' ? a * b : a - b);
      }
      trace.push(st.slice());
    }
    return { stack: st, trace };
  };
  A.stackSolve = function (nums, ops, target, max) {
    const toks = nums.map(String).concat(ops);
    let found = null;
    (function rec(prog, st) {
      if (found) return;
      if (st.length === 1 && st[0] === target && prog.length) { found = prog.slice(); return; }
      if (prog.length >= max || st.length - 1 > max - prog.length) return;
      for (const t of toks) {
        if (/^\d+$/.test(t)) { prog.push(t); rec(prog, st.concat(+t)); prog.pop(); }
        else if (st.length >= 2) {
          const b = st[st.length - 1], a = st[st.length - 2];
          const v = t === '+' ? a + b : t === '×' ? a * b : a - b;
          prog.push(t); rec(prog, st.slice(0, -2).concat(v)); prog.pop();
        }
      }
    })([], []);
    return found;
  };

  /* Sortiernetzwerk: comps = Array aus [i,j] (i<j) oder null; legt das Minimum auf die obere Leitung i. */
  A.netRun = function (values, comps) {
    const v = values.slice();
    comps.forEach(c => { if (c && v[c[0]] > v[c[1]]) { const t = v[c[0]]; v[c[0]] = v[c[1]]; v[c[1]] = t; } });
    return v;
  };
  A.permutations = function (arr) {
    if (arr.length <= 1) return [arr.slice()];
    const out = [];
    arr.forEach((x, i) => A.permutations(arr.slice(0, i).concat(arr.slice(i + 1))).forEach(p => out.push([x].concat(p))));
    return out;
  };
  A.netSorts = function (wires, comps) {
    const base = [...Array(wires).keys()];
    return A.permutations(base).every(p => A.netRun(p, comps).every((x, i) => x === i));
  };

  /* Zusammenhangskomponenten (4er-Nachbarschaft) */
  A.countRegions = function (rows, ch) {
    const R = rows.length, C = rows[0].length, seen = new Set();
    let n = 0;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      if (rows[r][c] !== ch || seen.has(r + ',' + c)) continue;
      n++;
      const st = [[r, c]];
      seen.add(r + ',' + c);
      while (st.length) {
        const [y, x] = st.pop();
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dy, dx]) => {
          const ny = y + dy, nx = x + dx, k = ny + ',' + nx;
          if (ny >= 0 && nx >= 0 && ny < R && nx < C && rows[ny][nx] === ch && !seen.has(k)) { seen.add(k); st.push([ny, nx]); }
        });
      }
    }
    return n;
  };

  A.properColoring = function (edges, coloring) {
    return edges.every(([a, b]) => coloring[a] !== undefined && coloring[b] !== undefined && coloring[a] !== coloring[b]);
  };

  B.algo = A;
})(window.Biber = window.Biber || {});
