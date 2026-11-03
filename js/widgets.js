/* Antwort-Widgets. Jedes Widget hat: render(root, cfg, ctx), check(cfg, answer) -> 0|1,
   isEmpty(answer), solutionHtml(cfg). ctx = { answer, set(v), locked, review }. */
(function (B) {
  'use strict';
  const A = B.algo;
  const SVGNS = 'http://www.w3.org/2000/svg';

  function apply(el, props) {
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.setAttribute('class', v);
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') {
        for (const [p, x] of Object.entries(v)) { if (p.startsWith('--')) el.style.setProperty(p, x); else el.style[p] = x; }
      }
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  function kids(el, list) {
    list.flat(Infinity).forEach(k => { if (k != null && k !== false) el.append(k.nodeType ? k : document.createTextNode(k)); });
    return el;
  }
  const h = (tag, props, ...c) => { const el = document.createElement(tag); apply(el, props); return kids(el, c); };
  const s = (tag, props, ...c) => { const el = document.createElementNS(SVGNS, tag); apply(el, props); return kids(el, c); };
  B.h = h;

  const W = {};
  const esc = t => String(t).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));

  /* ---------- Auswahl ---------- */
  W.choice = {
    isEmpty: a => !a || !a.length,
    check: (cfg, a) => a && [...a].sort().join() === [...cfg.correct].sort().join() ? 1 : 0,
    solutionHtml: cfg => 'Richtig: ' + cfg.correct.map(i => (cfg.labels ? '<b>' + cfg.labels[i] + '</b>' : cfg.options[i])).join(' &nbsp;·&nbsp; ') + (cfg.correct.length ? '' : '<b>keine Auswahl</b>'),
    render(root, cfg, ctx) {
      const sel = new Set(ctx.answer || []);
      root.append(h('p', { class: 'hint' }, cfg.multi ? 'Mehrere Antworten können richtig sein.' : 'Wähle eine Antwort.'));
      const list = h('div', { class: 'choices' + (cfg.cols ? ' cols-' + cfg.cols : '') });
      cfg.options.forEach((opt, i) => {
        const input = h('input', { type: cfg.multi ? 'checkbox' : 'radio', name: 'choice', disabled: ctx.locked });
        input.checked = sel.has(i);
        const label = h('label', { class: 'choice' }, input, h('span', { class: 'choice-body', html: opt }));
        if (ctx.review) {
          const ok = cfg.correct.includes(i);
          if (ok) label.classList.add('is-correct');
          if (sel.has(i) && !ok) label.classList.add('is-wrong');
        }
        input.addEventListener('change', () => {
          if (cfg.multi) { input.checked ? sel.add(i) : sel.delete(i); } else { sel.clear(); sel.add(i); }
          ctx.set([...sel].sort((a, b) => a - b));
        });
        list.append(label);
      });
      root.append(list);
    },
  };

  /* ---------- Zahl ---------- */
  const num = v => parseFloat(String(v).replace(',', '.'));
  W.number = {
    isEmpty: a => a == null || String(a).trim() === '',
    check: (cfg, a) => [].concat(cfg.answer).includes(num(a)) ? 1 : 0,
    solutionHtml: cfg => 'Richtig: <b>' + [].concat(cfg.answer)[0] + (cfg.unit ? ' ' + cfg.unit : '') + '</b>',
    render(root, cfg, ctx) {
      const input = h('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', class: 'answer-input', placeholder: 'Zahl', disabled: ctx.locked });
      input.value = ctx.answer ?? '';
      input.addEventListener('input', () => ctx.set(input.value));
      root.append(h('label', { class: 'answer-row' }, h('span', null, 'Deine Antwort:'), input, cfg.unit ? h('span', null, cfg.unit) : null));
    },
  };

  /* ---------- Text ---------- */
  const normText = (cfg, t) => (cfg.normalize ? cfg.normalize(String(t)) : String(t).trim().toUpperCase().replace(/\s+/g, ''));
  W.text = {
    isEmpty: a => a == null || String(a).trim() === '',
    check: (cfg, a) => cfg.answers.map(x => normText(cfg, x)).includes(normText(cfg, a ?? '')) ? 1 : 0,
    solutionHtml: cfg => 'Richtig: <b>' + esc(cfg.answers[0]) + '</b>',
    render(root, cfg, ctx) {
      const input = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', class: 'answer-input wide', placeholder: cfg.placeholder || 'Antwort', disabled: ctx.locked });
      input.value = ctx.answer ?? '';
      input.addEventListener('input', () => ctx.set(input.value));
      root.append(h('label', { class: 'answer-row' }, h('span', null, 'Deine Antwort:'), input));
    },
  };

  /* ---------- Feld anklicken ---------- */
  W.gridclick = {
    isEmpty: a => !a,
    check: (cfg, a) => a && a[0] === cfg.correct[0] && a[1] === cfg.correct[1] ? 1 : 0,
    solutionHtml: cfg => 'Richtig ist das Feld in <b>Zeile ' + (cfg.correct[0] + 1) + ', Spalte ' + (cfg.correct[1] + 1) + '</b>.',
    render(root, cfg, ctx) {
      let sel = ctx.answer || null;
      const grid = h('div', { class: 'cgrid', style: { gridTemplateColumns: `repeat(${cfg.cols}, var(--cell))` } });
      const btns = [];
      for (let r = 0; r < cfg.rows; r++) for (let c = 0; c < cfg.cols; c++) {
        const d = cfg.cell ? cfg.cell(r, c) : {};
        const b = h('button', { type: 'button', class: 'ccell ' + (d.cls || ''), html: d.html || '', disabled: ctx.locked, 'aria-label': `Zeile ${r + 1}, Spalte ${c + 1}` });
        b.addEventListener('click', () => { sel = [r, c]; ctx.set(sel); paint(); });
        btns.push(b); grid.append(b);
      }
      function paint() {
        btns.forEach((b, i) => {
          const r = Math.floor(i / cfg.cols), c = i % cfg.cols;
          b.classList.toggle('selected', !!sel && sel[0] === r && sel[1] === c);
          if (ctx.review) {
            b.classList.toggle('is-correct', r === cfg.correct[0] && c === cfg.correct[1]);
            b.classList.toggle('is-wrong', !!sel && sel[0] === r && sel[1] === c && !(r === cfg.correct[0] && c === cfg.correct[1]));
          }
        });
      }
      paint();
      root.append(h('p', { class: 'hint' }, 'Klicke auf das richtige Feld.'), grid);
    },
  };

  /* ---------- Lampen (Binärzahl) ---------- */
  W.lamps = {
    isEmpty: a => !a || !a.some(Boolean),
    check: (cfg, a) => a && a.reduce((t, on, i) => t + (on ? cfg.values[i] : 0), 0) === cfg.target ? 1 : 0,
    solutionHtml: cfg => {
      const on = cfg.values.map(v => ((cfg.target & v) ? v : null)).filter(Boolean);
      return 'Es müssen die Lampen <b>' + on.join(' + ') + '</b> leuchten.';
    },
    render(root, cfg, ctx) {
      const state = (ctx.answer || cfg.values.map(() => false)).slice();
      const row = h('div', { class: 'lamps' });
      cfg.values.forEach((v, i) => {
        const b = h('button', { type: 'button', class: 'lamp', disabled: ctx.locked, 'aria-label': 'Lampe mit Wert ' + v },
          h('span', { class: 'bulb' }, '💡'), h('span', { class: 'lamp-val' }, v));
        const paint = () => { b.classList.toggle('on', state[i]); b.setAttribute('aria-pressed', state[i]); };
        b.addEventListener('click', () => { state[i] = !state[i]; paint(); ctx.set(state.slice()); });
        paint(); row.append(b);
      });
      root.append(h('p', { class: 'hint' }, 'Klicke auf eine Lampe, um sie an- oder auszuschalten.'), row);
    },
  };

  /* ---------- Roboter-Programm ---------- */
  const ARROW = { U: '↑', D: '↓', L: '←', R: '→' };
  W.robot = {
    isEmpty: a => !a || !a.length,
    check(cfg, a) {
      if (!a || !a.length || a.length > cfg.max) return 0;
      const r = A.robotRun(cfg, a);
      return !r.blockedAt && r.atGoal && r.got === cfg.items.length ? 1 : 0;
    },
    solutionHtml(cfg) {
      const p = A.robotSolve(cfg);
      return 'Ein kürzestes Programm: <b class="mono">' + p.map(d => ARROW[d]).join(' ') + '</b> (' + p.length + ' Befehle)';
    },
    render(root, cfg, ctx) {
      let prog = (ctx.answer || []).slice();
      const [R, C] = cfg.size;
      const grid = h('div', { class: 'rgrid', style: { gridTemplateColumns: `repeat(${C}, var(--cell))` } });
      const cells = [];
      for (let i = 0; i < R * C; i++) { const c = h('div', { class: 'rcell' }); cells.push(c); grid.append(c); }
      const msg = h('p', { class: 'robot-msg', 'aria-live': 'polite' });
      const progBox = h('div', { class: 'prog' });
      const counter = h('span', { class: 'counter' });
      const key = (r, c) => r + ',' + c;
      const walls = new Set(cfg.walls.map(w => key(...w))), items = new Set(cfg.items.map(w => key(...w)));

      function draw(path) {
        const trail = new Set((path || []).map(p => key(...p)));
        const end = path ? path[path.length - 1] : cfg.start;
        cells.forEach((cell, i) => {
          const r = Math.floor(i / C), c = i % C, k = key(r, c);
          cell.className = 'rcell' + (trail.has(k) ? ' trail' : '');
          let t = '';
          if (walls.has(k)) t = '🌳';
          else if (end[0] === r && end[1] === c) t = '🦫';
          else if (k === key(...cfg.goal)) t = '🏠';
          else if (items.has(k)) t = '🪵';
          cell.textContent = t;
        });
      }
      function renderProg() {
        progBox.innerHTML = '';
        prog.forEach((d, i) => {
          const chip = h('button', { type: 'button', class: 'chip', disabled: ctx.locked, title: 'Befehl entfernen' }, ARROW[d]);
          chip.addEventListener('click', () => { prog.splice(i, 1); commit(); });
          progBox.append(chip);
        });
        if (!prog.length) progBox.append(h('span', { class: 'muted' }, 'Noch kein Befehl.'));
        counter.textContent = prog.length + ' / ' + cfg.max + ' Befehle';
        counter.classList.toggle('over', prog.length > cfg.max);
      }
      function run() {
        const r = A.robotRun(cfg, prog);
        draw(r.path);
        const pos = r.path[r.path.length - 1];
        if (r.blockedAt) msg.textContent = `Bei Befehl ${r.blockedAt} läuft der Biber gegen einen Baum oder den Rand.`;
        else msg.textContent = `Der Biber endet in Zeile ${pos[0] + 1}, Spalte ${pos[1] + 1}. Eingesammelt: ${r.got} von ${cfg.items.length} Holzstücken.`;
      }
      function commit() { renderProg(); draw(null); msg.textContent = ''; ctx.set(prog.slice()); }

      const pad = h('div', { class: 'pad' });
      ['U', 'L', 'D', 'R'].forEach(d => {
        const b = h('button', { type: 'button', class: 'key', disabled: ctx.locked, 'aria-label': 'Befehl ' + d }, ARROW[d]);
        b.addEventListener('click', () => { prog.push(d); commit(); });
        pad.append(b);
      });
      const tools = h('div', { class: 'tools' },
        h('button', { type: 'button', class: 'btn small', disabled: ctx.locked, onclick: () => { prog.pop(); commit(); } }, '⌫ Letzten löschen'),
        h('button', { type: 'button', class: 'btn small', disabled: ctx.locked, onclick: () => { prog = []; commit(); } }, 'Alles löschen'),
        h('button', { type: 'button', class: 'btn small primary', disabled: ctx.locked, onclick: run }, '▶ Programm testen'));
      root.append(h('div', { class: 'robot' }, grid,
        h('div', { class: 'robot-side' }, h('div', { class: 'row-between' }, h('strong', null, 'Dein Programm'), counter), progBox, pad, tools, msg)));
      renderProg(); draw(null);
      if (ctx.review && prog.length) run();
    },
  };

  /* ---------- Stapelmaschine ---------- */
  W.stack = {
    isEmpty: a => !a || !a.length,
    check(cfg, a) {
      if (!a || !a.length || a.length > cfg.max) return 0;
      const r = A.stackRun(a);
      return !r.error && r.stack.length === 1 && r.stack[0] === cfg.target ? 1 : 0;
    },
    solutionHtml(cfg) {
      const p = A.stackSolve(cfg.nums, cfg.ops, cfg.target, cfg.max);
      return 'Eine mögliche Lösung: <b class="mono">' + p.join(' ') + '</b>';
    },
    render(root, cfg, ctx) {
      let prog = (ctx.answer || []).slice();
      const progBox = h('div', { class: 'prog' });
      const counter = h('span', { class: 'counter' });
      const out = h('div', { class: 'stack-out', 'aria-live': 'polite' });
      function renderProg() {
        progBox.innerHTML = '';
        prog.forEach((t, i) => {
          const chip = h('button', { type: 'button', class: 'chip', disabled: ctx.locked, title: 'Befehl entfernen' }, t);
          chip.addEventListener('click', () => { prog.splice(i, 1); commit(); });
          progBox.append(chip);
        });
        if (!prog.length) progBox.append(h('span', { class: 'muted' }, 'Noch kein Befehl.'));
        counter.textContent = prog.length + ' / ' + cfg.max + ' Befehle';
        counter.classList.toggle('over', prog.length > cfg.max);
      }
      function run() {
        out.innerHTML = '';
        const r = A.stackRun(prog);
        const table = h('table', { class: 'trace' }, h('tr', null, h('th', null, 'Befehl'), h('th', null, 'Stapel danach (unten → oben)')));
        r.trace.forEach((st, i) => table.append(h('tr', null, h('td', { class: 'mono' }, prog[i]), h('td', { class: 'mono' }, '[ ' + st.join(', ') + ' ]'))));
        out.append(table);
        if (r.error) out.append(h('p', { class: 'robot-msg' }, r.error));
        else out.append(h('p', { class: 'robot-msg' }, r.stack.length === 1 ? 'Ergebnis: ' + r.stack[0] : 'Am Ende liegen ' + r.stack.length + ' Zahlen auf dem Stapel: ' + r.stack.join(', ')));
      }
      function commit() { renderProg(); out.innerHTML = ''; ctx.set(prog.slice()); }
      const pad = h('div', { class: 'pad wrap' });
      cfg.nums.map(String).concat(cfg.ops).forEach(t => {
        const b = h('button', { type: 'button', class: 'key' + (/^\d+$/.test(t) ? '' : ' op'), disabled: ctx.locked }, t);
        b.addEventListener('click', () => { prog.push(t); commit(); });
        pad.append(b);
      });
      const tools = h('div', { class: 'tools' },
        h('button', { type: 'button', class: 'btn small', disabled: ctx.locked, onclick: () => { prog.pop(); commit(); } }, '⌫ Letzten löschen'),
        h('button', { type: 'button', class: 'btn small', disabled: ctx.locked, onclick: () => { prog = []; commit(); } }, 'Alles löschen'),
        h('button', { type: 'button', class: 'btn small primary', disabled: ctx.locked, onclick: run }, '▶ Programm ausführen'));
      root.append(h('div', { class: 'row-between' }, h('strong', null, 'Dein Programm'), counter), progBox, pad, tools, out);
      renderProg();
      if (ctx.review && prog.length) run();
    },
  };

  /* ---------- Sortiernetzwerk ---------- */
  W.sortnet = {
    isEmpty: a => !a || !a.some(Boolean),
    check(cfg, a) {
      if (!a) return 0;
      const comps = a.map(x => x ? x.split('-').map(Number) : null);
      return A.netSorts(cfg.wires, comps) ? 1 : 0;
    },
    solutionHtml: cfg => 'Eine mögliche Lösung (Leitungen von oben nach unten nummeriert): ' +
      cfg.solution.map(c => '<b>' + (c[0] + 1) + '↔' + (c[1] + 1) + '</b>').join(', '),
    render(root, cfg, ctx) {
      const comps = (ctx.answer || Array(cfg.slots).fill('')).slice();
      while (comps.length < cfg.slots) comps.push('');
      const W_ = 70 + cfg.slots * 64, H_ = 30 + cfg.wires * 40;
      const svg = s('svg', { viewBox: `0 0 ${W_} ${H_}`, class: 'net', role: 'img', 'aria-label': 'Sortiernetzwerk' });
      const wy = i => 28 + i * 40;
      function drawNet() {
        svg.innerHTML = '';
        for (let i = 0; i < cfg.wires; i++) {
          svg.append(s('line', { x1: 10, x2: W_ - 10, y1: wy(i), y2: wy(i), class: 'wire' }));
          svg.append(s('text', { x: 0, y: wy(i) - 6, class: 'wlabel' }, String(i + 1)));
        }
        comps.forEach((c, k) => {
          if (!c) return;
          const [i, j] = c.split('-').map(Number), x = 56 + k * 64;
          svg.append(s('line', { x1: x, x2: x, y1: wy(i), y2: wy(j), class: 'comp' }));
          svg.append(s('circle', { cx: x, cy: wy(i), r: 5, class: 'compdot' }));
          svg.append(s('circle', { cx: x, cy: wy(j), r: 5, class: 'compdot' }));
          svg.append(s('text', { x, y: H_ - 2, class: 'slotno' }, String(k + 1)));
        });
      }
      const selects = h('div', { class: 'slots' });
      for (let k = 0; k < cfg.slots; k++) {
        const sel = h('select', { disabled: ctx.locked, 'aria-label': 'Baustein ' + (k + 1) });
        sel.append(h('option', { value: '' }, '—'));
        for (let i = 0; i < cfg.wires; i++) for (let j = i + 1; j < cfg.wires; j++)
          sel.append(h('option', { value: i + '-' + j }, `Leitung ${i + 1} ↔ ${j + 1}`));
        sel.value = comps[k] || '';
        sel.addEventListener('change', () => { comps[k] = sel.value; drawNet(); result.innerHTML = ''; ctx.set(comps.slice()); });
        selects.append(h('label', { class: 'slot' }, h('span', null, 'Baustein ' + (k + 1)), sel));
      }
      const input = h('input', { type: 'text', class: 'answer-input', value: '4 2 3 1', 'aria-label': 'Testzahlen' });
      const result = h('div', { class: 'nettrace', 'aria-live': 'polite' });
      function testRun() {
        result.innerHTML = '';
        const v = input.value.split(/[\s,;]+/).filter(Boolean).map(Number);
        if (v.length !== cfg.wires || v.some(isNaN)) { result.append(h('p', { class: 'robot-msg' }, `Gib genau ${cfg.wires} Zahlen ein, getrennt durch Leerzeichen.`)); return; }
        const table = h('table', { class: 'trace' }, h('tr', null, h('th', null, 'Schritt'), h('th', null, 'Zahlen auf den Leitungen (oben → unten)')));
        let cur = v.slice();
        table.append(h('tr', null, h('td', null, 'Eingabe'), h('td', { class: 'mono' }, cur.join('  '))));
        comps.forEach((x, k) => {
          if (!x) return;
          const [i, j] = x.split('-').map(Number);
          cur = A.netRun(cur, [[i, j]]);
          table.append(h('tr', null, h('td', null, `Baustein ${k + 1} (${i + 1} ↔ ${j + 1})`), h('td', { class: 'mono' }, cur.join('  '))));
        });
        result.append(table, h('p', { class: 'robot-msg' }, 'Ausgabe: ' + cur.join('  ')));
      }
      input.addEventListener('keydown', e => { if (e.key === 'Enter') testRun(); });
      const randomTest = () => {
        const pool = []; while (pool.length < cfg.wires) { const n = 1 + Math.floor(Math.random() * 9); if (!pool.includes(n)) pool.push(n); }
        input.value = pool.join(' '); testRun();
      };
      root.append(
        h('p', { class: 'hint' }, 'Jeder Baustein vergleicht zwei Leitungen: Die kleinere Zahl wandert auf die obere, die größere auf die untere Leitung. Die Bausteine werden von links nach rechts der Reihe nach durchlaufen.'),
        svg, selects,
        h('div', { class: 'nettest' }, h('strong', null, 'Probiere es aus: '), input,
          h('button', { type: 'button', class: 'btn small primary', onclick: testRun }, '▶ Testen'),
          h('button', { type: 'button', class: 'btn small', onclick: randomTest }, '🎲 Andere Zahlen')),
        result);
      drawNet();
      if (ctx.review) testRun();
    },
  };

  /* ---------- Graphfärbung ---------- */
  W.colorgraph = {
    isEmpty: a => !a || !Object.keys(a).length,
    check: (cfg, a) => a && cfg.nodes.every(n => a[n.id] !== undefined) && A.properColoring(cfg.edges, a) ? 1 : 0,
    solutionHtml(cfg) {
      const ids = cfg.nodes.map(n => n.id), K = cfg.colors.length;
      let sol = null;
      (function rec(i, col) {
        if (sol) return;
        if (i === ids.length) { sol = Object.assign({}, col); return; }
        for (let c = 0; c < K; c++) { col[ids[i]] = c; if (cfg.edges.every(([a, b]) => col[a] === undefined || col[b] === undefined || col[a] !== col[b])) rec(i + 1, col); delete col[ids[i]]; }
      })(0, {});
      return 'Eine mögliche Verteilung: ' + cfg.colors.map((c, k) => '<b>' + c.name + '</b>: ' + cfg.nodes.filter(n => sol[n.id] === k).map(n => n.label).join(', ')).join(' &nbsp;|&nbsp; ');
    },
    render(root, cfg, ctx) {
      const col = Object.assign({}, ctx.answer || {});
      const svg = s('svg', { viewBox: `0 0 ${cfg.w} ${cfg.h}`, class: 'graph' });
      cfg.edges.forEach(([a, b]) => {
        const na = cfg.nodes.find(n => n.id === a), nb = cfg.nodes.find(n => n.id === b);
        svg.append(s('line', { x1: na.x, y1: na.y, x2: nb.x, y2: nb.y, class: 'edge' }));
      });
      const circles = {};
      cfg.nodes.forEach(n => {
        const g = s('g', { class: 'node' + (ctx.locked ? '' : ' clickable'), tabindex: ctx.locked ? null : 0, role: 'button', 'aria-label': n.label });
        const c = s('circle', { cx: n.x, cy: n.y, r: 26 });
        g.append(c, s('text', { x: n.x, y: n.y + 5, class: 'ntext' }, n.label));
        const step = () => {
          if (ctx.locked) return;
          const cur = col[n.id];
          if (cur === undefined) col[n.id] = 0; else if (cur + 1 < cfg.colors.length) col[n.id] = cur + 1; else delete col[n.id];
          paint(); ctx.set(Object.assign({}, col));
        };
        g.addEventListener('click', step);
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); step(); } });
        circles[n.id] = c; svg.append(g);
      });
      function paint() {
        cfg.nodes.forEach(n => {
          circles[n.id].style.fill = col[n.id] === undefined ? '' : cfg.colors[col[n.id]].css;
          circles[n.id].parentNode.classList.toggle('colored', col[n.id] !== undefined);
        });
      }
      const legend = h('div', { class: 'legend' }, cfg.colors.map(c => h('span', { class: 'swatch' }, h('i', { style: { background: c.css } }), c.name)));
      root.append(h('p', { class: 'hint' }, 'Klicke mehrfach auf einen Kreis, um ihm einen Tag zuzuweisen (oder die Zuweisung zu löschen).'), svg, legend);
      paint();
    },
  };

  /* ---------- Rucksack ---------- */
  W.knapsack = {
    isEmpty: a => !a || !a.length,
    check(cfg, a) {
      if (!a) return 0;
      const w = a.reduce((t, i) => t + cfg.items[i].w, 0), v = a.reduce((t, i) => t + cfg.items[i].v, 0);
      return w <= cfg.cap && v === A.knapsack(cfg.items, cfg.cap).best ? 1 : 0;
    },
    solutionHtml(cfg) {
      const k = A.knapsack(cfg.items, cfg.cap);
      return 'Optimal: <b>' + k.set.map(i => cfg.items[i].name).join(', ') + '</b> (Wert ' + k.best + ', Gewicht ' + k.set.reduce((t, i) => t + cfg.items[i].w, 0) + ' kg)';
    },
    render(root, cfg, ctx) {
      const sel = new Set(ctx.answer || []);
      const sum = h('div', { class: 'sum' });
      const list = h('div', { class: 'items' });
      cfg.items.forEach((it, i) => {
        const input = h('input', { type: 'checkbox', disabled: ctx.locked });
        input.checked = sel.has(i);
        input.addEventListener('change', () => { input.checked ? sel.add(i) : sel.delete(i); update(); ctx.set([...sel].sort((a, b) => a - b)); });
        list.append(h('label', { class: 'item' }, input, h('span', { class: 'item-body' }, h('b', null, it.name), h('small', null, `${it.w} kg · Wert ${it.v}`))));
      });
      function update() {
        const w = [...sel].reduce((t, i) => t + cfg.items[i].w, 0), v = [...sel].reduce((t, i) => t + cfg.items[i].v, 0);
        sum.innerHTML = `Gewicht: <b class="${w > cfg.cap ? 'over' : ''}">${w} / ${cfg.cap} kg</b> &nbsp;·&nbsp; Gesamtwert: <b>${v}</b>`;
      }
      root.append(list, sum); update();
    },
  };

  /* ---------- Zuordnen (Scheduling) ---------- */
  W.assign = {
    isEmpty: a => !a || !a.some(x => x != null),
    check(cfg, a) {
      if (!a || a.length !== cfg.items.length || a.some(x => x == null)) return 0;
      const tot = cfg.bins.map(() => 0);
      a.forEach((b, i) => { tot[b] += cfg.items[i].t; });
      return Math.max(...tot) <= cfg.limit ? 1 : 0;
    },
    solutionHtml(cfg) {
      let sol = null;
      const n = cfg.items.length, K = cfg.bins.length;
      (function rec(i, a, tot) {
        if (sol) return;
        if (i === n) { sol = a.slice(); return; }
        for (let b = 0; b < K; b++) if (tot[b] + cfg.items[i].t <= cfg.limit) { a.push(b); tot[b] += cfg.items[i].t; rec(i + 1, a, tot); tot[b] -= cfg.items[i].t; a.pop(); }
      })(0, [], cfg.bins.map(() => 0));
      return 'Eine mögliche Verteilung: ' + cfg.bins.map((b, k) => '<b>' + b + '</b>: ' + cfg.items.filter((_, i) => sol[i] === k).map(x => x.t).join(' + ') + ' = ' + cfg.items.filter((_, i) => sol[i] === k).reduce((t, x) => t + x.t, 0)).join(' &nbsp;|&nbsp; ');
    },
    render(root, cfg, ctx) {
      const a = (ctx.answer || cfg.items.map(() => null)).slice();
      const totals = h('div', { class: 'totals' });
      const rows = h('div', { class: 'assign' });
      cfg.items.forEach((it, i) => {
        const seg = h('div', { class: 'seg', role: 'group' });
        const btns = cfg.bins.map((b, k) => {
          const bt = h('button', { type: 'button', class: 'segbtn', disabled: ctx.locked }, String(k + 1));
          bt.addEventListener('click', () => { a[i] = k; paint(); ctx.set(a.slice()); });
          seg.append(bt); return bt;
        });
        const paint = () => { btns.forEach((bt, k) => bt.classList.toggle('on', a[i] === k)); update(); };
        rows.append(h('div', { class: 'arow' }, h('span', { class: 'job' }, `Auftrag ${i + 1}: ${it.t} h`), seg));
        it._paint = paint;
      });
      function update() {
        const tot = cfg.bins.map(() => 0);
        a.forEach((b, i) => { if (b != null) tot[b] += cfg.items[i].t; });
        totals.innerHTML = '';
        cfg.bins.forEach((b, k) => totals.append(h('div', { class: 'total' }, h('span', null, `${k + 1} · ${b}`), h('b', { class: tot[k] > cfg.limit ? 'over' : '' }, tot[k] + ' h'))));
      }
      cfg.items.forEach(it => it._paint());
      root.append(h('p', { class: 'hint' }, 'Wähle für jeden Auftrag die Maschine (1, 2 oder 3).'), rows, totals);
    },
  };

  /* ---------- Knoten der Reihe nach anklicken ---------- */
  W.seqclick = {
    isEmpty: a => !a || !a.length,
    check: (cfg, a) => a && a.join() === cfg.correct.join() ? 1 : 0,
    solutionHtml: cfg => 'Richtige Reihenfolge: <b class="mono">' + cfg.correct.join(' → ') + '</b>',
    render(root, cfg, ctx) {
      let seq = (ctx.answer || []).slice();
      const svg = s('svg', { viewBox: `0 0 ${cfg.w} ${cfg.h}`, class: 'graph' });
      cfg.edges.forEach(([a, b]) => {
        const na = cfg.nodes.find(n => n.id === a), nb = cfg.nodes.find(n => n.id === b);
        svg.append(s('line', { x1: na.x, y1: na.y, x2: nb.x, y2: nb.y, class: 'edge' }));
      });
      const gs = {};
      cfg.nodes.forEach(n => {
        const g = s('g', { class: 'node' + (ctx.locked ? '' : ' clickable'), tabindex: ctx.locked ? null : 0, role: 'button', 'aria-label': 'Knoten ' + n.label });
        g.append(s('circle', { cx: n.x, cy: n.y, r: 22 }), s('text', { x: n.x, y: n.y + 5, class: 'ntext' }, n.label), s('text', { x: n.x + 22, y: n.y - 18, class: 'badge' }, ''));
        const click = () => { if (ctx.locked || seq.includes(n.id)) return; seq.push(n.id); commit(); };
        g.addEventListener('click', click);
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); click(); } });
        gs[n.id] = g; svg.append(g);
      });
      const line = h('div', { class: 'seqline' });
      function paint() {
        cfg.nodes.forEach(n => {
          const i = seq.indexOf(n.id), g = gs[n.id];
          g.classList.toggle('picked', i >= 0);
          g.querySelector('.badge').textContent = i >= 0 ? String(i + 1) : '';
        });
        line.textContent = seq.length ? seq.join(' → ') : 'Noch kein Knoten gewählt.';
      }
      function commit() { paint(); ctx.set(seq.slice()); }
      root.append(h('p', { class: 'hint' }, 'Klicke die Knoten in der richtigen Reihenfolge an.'), svg, line,
        h('div', { class: 'tools' },
          h('button', { type: 'button', class: 'btn small', disabled: ctx.locked, onclick: () => { seq.pop(); commit(); } }, '⌫ Letzten entfernen'),
          h('button', { type: 'button', class: 'btn small', disabled: ctx.locked, onclick: () => { seq = []; commit(); } }, 'Neu beginnen')));
      paint();
    },
  };

  /* ---------- Pixelbild malen ---------- */
  W.paint = {
    isEmpty: a => !a || !a.some(r => r.includes('#')),
    check: (cfg, a) => a && a.join('|') === cfg.target.join('|') ? 1 : 0,
    solutionHtml(cfg) {
      return 'So sieht das Bild aus:<div class="pgrid mini" style="grid-template-columns:repeat(' + cfg.target[0].length + ',14px)">' +
        cfg.target.map(r => [...r].map(c => '<i class="' + (c === '#' ? 'on' : '') + '"></i>').join('')).join('') + '</div>';
    },
    render(root, cfg, ctx) {
      const rows = (ctx.answer || cfg.target.map(r => '.'.repeat(r.length))).map(r => [...r]);
      const grid = h('div', { class: 'pgrid', style: { gridTemplateColumns: `repeat(${cfg.target[0].length}, var(--pcell))` } });
      const cells = [];
      rows.forEach((row, r) => row.forEach((_, c) => {
        const b = h('button', { type: 'button', class: 'pcell', disabled: ctx.locked, 'aria-label': `Zeile ${r + 1}, Spalte ${c + 1}` });
        b.addEventListener('click', () => { rows[r][c] = rows[r][c] === '#' ? '.' : '#'; paint(); ctx.set(rows.map(x => x.join(''))); });
        cells.push(b); grid.append(b);
      }));
      function paint() { cells.forEach((b, i) => b.classList.toggle('on', rows[Math.floor(i / rows[0].length)][i % rows[0].length] === '#')); }
      paint();
      root.append(h('p', { class: 'hint' }, 'Klicke auf ein Feld, um es schwarz oder weiß zu machen.'), grid);
    },
  };

  /* ---------- Lights Out ---------- */
  W.lightsout = {
    isEmpty: a => !a || !a.length,
    state(cfg, clicks) { let st = cfg.start.slice(); (clicks || []).forEach(i => { st = A.lightsToggle(cfg.n, st, i); }); return st; },
    check(cfg, a) { return a && a.length && a.length <= cfg.max && W.lightsout.state(cfg, a).every(x => !x) ? 1 : 0; },
    solutionHtml(cfg) {
      const p = A.lightsSolve(cfg.n, cfg.start);
      return 'Eine Lösung mit ' + p.length + ' Zügen: ' + p.map(i => '<b>Zeile ' + (Math.floor(i / cfg.n) + 1) + ', Spalte ' + (i % cfg.n + 1) + '</b>').join(' → ');
    },
    render(root, cfg, ctx) {
      let clicks = (ctx.answer || []).slice();
      const grid = h('div', { class: 'lgrid', style: { gridTemplateColumns: `repeat(${cfg.n}, var(--lcell))` } });
      const cells = [];
      for (let i = 0; i < cfg.n * cfg.n; i++) {
        const b = h('button', { type: 'button', class: 'lcell', disabled: ctx.locked, 'aria-label': `Zeile ${Math.floor(i / cfg.n) + 1}, Spalte ${i % cfg.n + 1}` });
        b.addEventListener('click', () => { clicks.push(i); commit(); });
        cells.push(b); grid.append(b);
      }
      const counter = h('span', { class: 'counter' });
      function paint() {
        const st = W.lightsout.state(cfg, clicks);
        cells.forEach((b, i) => b.classList.toggle('on', st[i]));
        counter.textContent = clicks.length + ' / ' + cfg.max + ' Züge';
        counter.classList.toggle('over', clicks.length > cfg.max);
      }
      function commit() { paint(); ctx.set(clicks.slice()); }
      root.append(h('div', { class: 'lights' }, grid, h('div', { class: 'robot-side' }, counter,
        h('div', { class: 'tools' },
          h('button', { type: 'button', class: 'btn small', disabled: ctx.locked, onclick: () => { clicks.pop(); commit(); } }, '↶ Zug zurück'),
          h('button', { type: 'button', class: 'btn small', disabled: ctx.locked, onclick: () => { clicks = []; commit(); } }, 'Neu beginnen')))));
      paint();
    },
  };

  /* ---------- Pfannkuchen ---------- */
  W.pancake = {
    isEmpty: a => !a || !a.length,
    state(cfg, flips) { let st = cfg.start.slice(); (flips || []).forEach(k => { st = A.pancakeFlip(st, k); }); return st; },
    check(cfg, a) { return a && a.length && a.length <= cfg.max && A.pancakeSorted(W.pancake.state(cfg, a)) ? 1 : 0; },
    solutionHtml(cfg) {
      const p = A.pancakeSolve(cfg.start);
      return 'Eine Lösung mit ' + p.length + ' Wendungen: Wende jeweils die obersten <b>' + p.join(', ') + '</b> Pfannkuchen (der Reihe nach).';
    },
    render(root, cfg, ctx) {
      let flips = (ctx.answer || []).slice();
      const stack = h('div', { class: 'pancakes' });
      const counter = h('span', { class: 'counter' });
      function paint() {
        const st = W.pancake.state(cfg, flips);
        stack.innerHTML = '';
        st.forEach((size, i) => {
          const b = h('button', { type: 'button', class: 'pancake', disabled: ctx.locked || i === 0, style: { width: (28 + size * 38) + 'px' }, 'aria-label': `Pfannkuchen Größe ${size}, obersten ${i + 1} wenden` }, String(size));
          b.addEventListener('click', () => { flips.push(i + 1); commit(); });
          stack.append(b);
        });
        counter.textContent = flips.length + ' / ' + cfg.max + ' Wendungen';
        counter.classList.toggle('over', flips.length > cfg.max);
      }
      function commit() { paint(); ctx.set(flips.slice()); }
      root.append(h('div', { class: 'lights' }, h('div', { class: 'pan-wrap' }, h('div', { class: 'pan-label' }, '▼ oben'), stack, h('div', { class: 'pan-label' }, '▲ unten (Teller)')),
        h('div', { class: 'robot-side' }, counter,
          h('div', { class: 'tools' },
            h('button', { type: 'button', class: 'btn small', disabled: ctx.locked, onclick: () => { flips.pop(); commit(); } }, '↶ Zug zurück'),
            h('button', { type: 'button', class: 'btn small', disabled: ctx.locked, onclick: () => { flips = []; commit(); } }, 'Neu beginnen')))));
      paint();
    },
  };

  B.widgets = W;

  /* ---------- SVG-Hilfen für Aufgabentexte ---------- */
  let uid = 0;
  const R = 20;
  function marker(id) {
    return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="currentColor"/></marker></defs>`;
  }
  /* Graph: nodes [{id,x,y}], edges [{a,b,label}], opts {w,h,directed} */
  B.graphSvg = function (nodes, edges, o) {
    const id = 'm' + (++uid), N = {};
    nodes.forEach(n => { N[n.id] = n; });
    let out = `<svg class="fig" viewBox="0 0 ${o.w} ${o.h}" role="img" aria-label="${o.label || 'Graph'}">${o.directed ? marker(id) : ''}`;
    edges.forEach(e => {
      const a = N[e.a], b = N[e.b], dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      const x1 = a.x + ux * R, y1 = a.y + uy * R, x2 = b.x - ux * (R + (o.directed ? 3 : 0)), y2 = b.y - uy * (R + (o.directed ? 3 : 0));
      out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="gedge"${o.directed ? ` marker-end="url(#${id})"` : ''}/>`;
      if (e.label !== undefined) {
        const t = e.t ?? 0.5, mx = x1 + (x2 - x1) * t, my = y1 + (y2 - y1) * t;
        out += `<rect x="${mx - 13}" y="${my - 11}" width="26" height="22" rx="6" class="glabel-bg"/><text x="${mx}" y="${my + 5}" class="glabel">${e.label}</text>`;
      }
    });
    nodes.forEach(n => {
      out += `<circle cx="${n.x}" cy="${n.y}" r="${R}" class="gnode ${n.cls || ''}"/><text x="${n.x}" y="${n.y + 5}" class="gtext">${n.label ?? n.id}</text>`;
    });
    return out + '</svg>';
  };

  /* Endlicher Automat: states [{id,x,y,final,start}], trans [{from,to,label}] */
  B.automatonSvg = function (states, trans, o) {
    const id = 'm' + (++uid), S = {};
    states.forEach(st => { S[st.id] = st; });
    const has = (a, b) => trans.some(t => t.from === b && t.to === a);
    let out = `<svg class="fig" viewBox="0 0 ${o.w} ${o.h}" role="img" aria-label="${o.label || 'Automat'}">${marker(id)}`;
    trans.forEach(t => {
      const a = S[t.from], b = S[t.to];
      if (a === b) {
        out += `<path d="M ${a.x - 10} ${a.y - R + 1} C ${a.x - 34} ${a.y - R - 38} ${a.x + 34} ${a.y - R - 38} ${a.x + 10} ${a.y - R + 1}" class="gedge" fill="none" marker-end="url(#${id})"/>`;
        out += `<text x="${a.x}" y="${a.y - R - 30}" class="glabel">${t.label}</text>`;
        return;
      }
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
      const far = Math.abs(dx) > 130 || Math.abs(dy) > 130;
      const off = far ? 46 : has(t.from, t.to) ? 24 : 0;
      const px = dy / len, py = -dx / len;
      const cx = (a.x + b.x) / 2 + px * off, cy = (a.y + b.y) / 2 + py * off;
      const ua = Math.hypot(cx - a.x, cy - a.y), ub = Math.hypot(cx - b.x, cy - b.y);
      const sx = a.x + (cx - a.x) / ua * R, sy = a.y + (cy - a.y) / ua * R;
      const ex = b.x + (cx - b.x) / ub * (R + 3), ey = b.y + (cy - b.y) / ub * (R + 3);
      out += `<path d="M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}" class="gedge" fill="none" marker-end="url(#${id})"/>`;
      const lx = (a.x + b.x) / 2 + px * (off / 2 + (off ? 11 * Math.sign(off) : -11)), ly = (a.y + b.y) / 2 + py * (off / 2 + (off ? 11 * Math.sign(off) : -11));
      out += `<text x="${lx}" y="${ly + 4}" class="glabel">${t.label}</text>`;
    });
    states.forEach(st => {
      out += `<circle cx="${st.x}" cy="${st.y}" r="${R}" class="gnode"/>`;
      if (st.final) out += `<circle cx="${st.x}" cy="${st.y}" r="${R - 5}" class="gnode inner"/>`;
      out += `<text x="${st.x}" y="${st.y + 5}" class="gtext">${st.id}</text>`;
      if (st.start) out += `<line x1="${st.x - R - 30}" y1="${st.y}" x2="${st.x - R - 3}" y2="${st.y}" class="gedge" marker-end="url(#${id})"/>`;
    });
    return out + '</svg>';
  };
})(window.Biber = window.Biber || {});
