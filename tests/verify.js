/* Prüft alle Aufgaben: Lösungen sind richtig, Fehlversuche falsch, Texte lassen sich erzeugen.
   Aufruf: node tests/verify.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { window: {}, console };
vm.createContext(ctx);
['algo', 'widgets', 'tasks-1', 'tasks-2', 'tasks-3', 'tasks-k6'].forEach(f => {
  // widgets.js nutzt document nur beim Rendern – für den Test reicht ein leerer Stub
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f + '.js'), 'utf8'), ctx, { filename: f });
});
const B = ctx.window.Biber, A = B.algo, W = B.widgets;
const val = x => (typeof x === 'function' ? x() : x);
let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗ ' + msg); } };

/* Beispiellösungen je Aufgabe (so wie die Oberfläche sie speichert) */
const solutions = {
  'w1-01': c => A.robotSolve(c),
  'w1-02': c => c.values.map(v => !!(c.target & v)),
  'w1-03': () => 'burg',
  'w1-04': c => c.correct,
  'w1-05': c => c.correct,
  'w1-06': c => A.stackSolve(c.nums, c.ops, c.target, c.max),
  'w1-07': c => String(c.answer),
  'w1-08': c => { const col = {}; (function rec(i) { if (i === c.nodes.length) return true; for (let k = 0; k < 3; k++) { col[c.nodes[i].id] = k; if (c.edges.every(([a, b]) => col[a] === undefined || col[b] === undefined || col[a] !== col[b]) && rec(i + 1)) return true; } delete col[c.nodes[i].id]; return false; })(0); return col; },
  'w1-09': c => c.solution.map(p => p.join('-')).concat([]),
  'w1-10': c => c.correct,
  'w1-11': c => A.knapsack(c.items, c.cap).set,
  'w1-12': c => String(c.answer),
  'w2-05': c => c.target,
  'w2-09': c => { let sol; const n = c.items.length; (function rec(i, a, t) { if (sol) return; if (i === n) { sol = a.slice(); return; } for (let b = 0; b < 3; b++) if (t[b] + c.items[i].t <= c.limit) { a.push(b); t[b] += c.items[i].t; rec(i + 1, a, t); t[b] -= c.items[i].t; a.pop(); } })(0, [], [0, 0, 0]); return sol; },
  'w2-12': c => c.correct,
  'w3-05': c => A.lightsSolve(c.n, c.start),
  'w3-09': c => A.pancakeSolve(c.start),
  /* Klasse 6 */
  'k1-01': c => A.robotSolve(c),
  'k1-02': c => c.values.map(v => !!(c.target & v)),
  'k1-05': c => c.target,
  'k1-07': c => A.stackSolve(c.nums, c.ops, c.target, c.max),
  'k1-09': c => A.knapsack(c.items, c.cap).set,
  'k2-09': c => { const col = {}; (function rec(i) { if (i === c.nodes.length) return true; for (let k = 0; k < c.colors.length; k++) { col[c.nodes[i].id] = k; if (c.edges.every(([a, b]) => col[a] === undefined || col[b] === undefined || col[a] !== col[b]) && rec(i + 1)) return true; } delete col[c.nodes[i].id]; return false; })(0); return col; },
  'k3-05': c => c.target,
  'k3-06': c => c.correct,
};

let count = 0;
B.contests.forEach(c => {
  console.log(`\n${c.title} – ${c.subtitle} (${c.tasks.length} Aufgaben)`);
  const levels = c.tasks.map(t => t.level).join('');
  const want = c.grade === 6 ? '1111222333' : '111122223333';
  ok(levels === want, 'Schwierigkeitsreihenfolge ' + want + ': ' + levels);
  c.tasks.forEach(t => {
    count++;
    const w = W[t.widget.type], cfg = t.widget;
    ok(!!w, t.id + ': unbekanntes Widget ' + t.widget.type);
    let ans;
    if (solutions[t.id]) ans = solutions[t.id](cfg);
    else if (['choice'].includes(cfg.type)) ans = cfg.correct;
    else if (cfg.type === 'number') ans = String([].concat(cfg.answer)[0]);
    else if (cfg.type === 'text') ans = cfg.answers[0];
    else if (cfg.type === 'seqclick') ans = cfg.correct;
    else if (cfg.type === 'gridclick') ans = cfg.correct;
    else ans = null;
    ok(ans != null, t.id + ': keine Beispiellösung hinterlegt');
    ok(w.check(cfg, ans) === 1, t.id + ': Beispiellösung wird nicht akzeptiert');
    ok(!w.isEmpty(ans), t.id + ': Beispiellösung gilt als leer');
    ok(w.isEmpty(undefined) && w.check(cfg, undefined) === 0, t.id + ': leere Antwort muss 0 Punkte geben');
    let txt, expl;
    try { txt = val(t.text); expl = val(t.explain); w.solutionHtml(cfg); } catch (e) { ok(false, t.id + ': Text/Lösung wirft ' + e.message); }
    ok(txt && txt.length > 20 && expl && t.info, t.id + ': Text/Erklärung/Info fehlt');
    ok(!/undefined|NaN|\[object/.test(txt + expl), t.id + ': enthält undefined/NaN');
    console.log(`  ✓ ${t.id} ${t.title}`);
  });
});

/* Gezielte Fehlversuche */
function wrong(id, bad, why) {
  const t = B.contests.flatMap(c => c.tasks).find(x => x.id === id);
  ok(W[t.widget.type].check(t.widget, bad) === 0, id + ': falsche Antwort wird akzeptiert (' + why + ')');
}
wrong('w1-01', ['U', 'U', 'R', 'R', 'R', 'R', 'U', 'U', 'U'], 'zu lang / falsch');
wrong('w1-01', ['U', 'U', 'U', 'U', 'R', 'R', 'R', 'R'], 'Holz nicht eingesammelt');
wrong('w1-02', [true, true, true, true, true, true], 'falsche Summe');
wrong('w1-03', 'BARG', 'falsches Wort');
wrong('w1-06', ['5', '7', '×', '3', '2', '×', '+', '2', '+'], 'zu lang');
wrong('w1-09', ['0-1', '2-3', '0-2', '1-3', ''], 'unvollständiges Netz');
wrong('w1-12', '3', 'falsche Zahl');
wrong('w2-09', [0, 0, 1, 1, 2, 2, 0, 2], 'Limit überschritten');
wrong('w3-09', [5], 'unsortiert');
wrong('w3-11', [0, 1, 2], 'zu viele Züge');

/* Zusätzliche Eigenschaften */
const all = B.contests.flatMap(c => c.tasks);
ok(new Set(all.map(t => t.id)).size === all.length, 'doppelte Aufgaben-IDs');
const t1 = all.find(t => t.id === 'w1-01').widget;
ok(A.robotSolve(t1).length === t1.max, 'w1-01: kürzester Weg ist nicht genau max');
const t6 = all.find(t => t.id === 'w1-06').widget;
for (let m = 1; m < t6.max; m++) ok(A.stackSolve(t6.nums, t6.ops, t6.target, m) === null, 'w1-06: schon mit ' + m + ' Befehlen lösbar');
ok(A.stackSolve(t6.nums, t6.ops, t6.target, t6.max) !== null, 'w1-06: nicht lösbar');
const t8 = all.find(t => t.id === 'w1-08').widget;
ok(!(function two(i, col) { if (i === t8.nodes.length) return true; for (let k = 0; k < 2; k++) { col[t8.nodes[i].id] = k; if (t8.edges.every(([a, b]) => col[a] === undefined || col[b] === undefined || col[a] !== col[b]) && two(i + 1, col)) return true; } delete col[t8.nodes[i].id]; return false; })(0, {}), 'w1-08: mit 2 Tagen lösbar');
const t9 = all.find(t => t.id === 'w1-09').widget;
for (let k = 0; k < 5; k++) { /* kein 4-Leitungs-Netz mit 4 Bausteinen */ }
let fourOk = false; const pairs = []; for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) pairs.push([i, j]);
(function rec(d, cur) { if (fourOk) return; if (d === 4) { if (A.netSorts(4, cur)) fourOk = true; return; } pairs.forEach(p => rec(d + 1, cur.concat([p]))); })(0, []);
ok(!fourOk, 'w1-09: mit 4 Bausteinen lösbar');
ok(A.netSorts(4, t9.solution), 'w1-09: Beispiellösung sortiert nicht');
ok(A.stackPermutation([2, 1, 4, 3]) && !A.stackPermutation([3, 1, 2, 4]), 'Stapel-Permutation');
const t5 = all.find(t => t.id === 'w3-05').widget, t9b = all.find(t => t.id === 'w3-09').widget;
ok(t5.max === 3, 'w3-05: max = ' + t5.max);
ok(t9b.max === 4, 'w3-09: max = ' + t9b.max);
const t11 = all.find(t => t.id === 'w2-11');
ok(val(t11.explain).includes('<b>11</b>'), 'w2-11: erwarteter Fluss 11');
const t12 = all.find(t => t.id === 'w3-12').widget; ok(t12.correct[0] === 2, 'w3-12: nur C ehrlich');

/* Klasse 6 */
const k = id => all.find(t => t.id === id);
wrong('k1-01', ['U', 'U', 'R', 'R', 'U', 'R', 'U'], 'zu lang');
wrong('k1-01', ['U', 'U', 'U', 'R', 'R', 'R'], 'Holz nicht eingesammelt');
wrong('k1-02', [true, true, true, true, true], 'falsche Summe');
wrong('k1-04', 'RAUN', 'falsches Wort');
wrong('k1-07', ['5', '5', '×', '4', '+', '3'], 'zu lang');
wrong('k1-10', '19', 'naiver Plan');
wrong('k2-10', '16', 'falsche Zugzahl');
wrong('k3-06', ['2', '4', '6', '1', '3', '5', '7'], 'falsche Reihenfolge');
const k1_06 = k('k1-06').widget; ok(A.dijkstra([['S','A',3],['S','B',2],['A','B',1],['A','C',4],['B','C',6],['B','D',7],['C','D',2],['C','T',5],['D','T',3]], 'S', 'T').dist === k1_06.answer, 'k1-06: Weg');
const kr = k('k1-01').widget; ok(A.robotSolve(kr).length === kr.max, 'k1-01: kürzester Weg ist nicht genau max');
const ks = k('k1-07').widget; for (let m = 1; m < ks.max; m++) ok(A.stackSolve(ks.nums, ks.ops, ks.target, m) === null, 'k1-07: schon mit ' + m + ' Befehlen lösbar');
ok(val(k('k1-08').explain).includes('Ben – Anna – Emma – Cleo – Dino') && k('k1-08').widget.correct[0] === 2, 'k1-08: Sitzordnung eindeutig, Platz 4 = Cleo');
ok(k('k1-09').widget.items && A.knapsack(k('k1-09').widget.items, 10).best === 16, 'k1-09: bester Wert 16');
ok(k('k2-08').widget.correct[0] === 1, 'k2-08: Berta');
ok(k('k3-10').widget.answer === 6, 'k3-10: 6 Züge, ist ' + k('k3-10').widget.answer);
ok(k('k3-06').widget.correct.join() === '2,4,6,1,5,3,7', 'k3-06: Ausscheiden ' + k('k3-06').widget.correct.join());
ok(k('k3-01').widget.correct.join() === '2,4', 'k3-01: Endfeld ' + k('k3-01').widget.correct.join());
ok(k('k3-09').widget.answer === 7, 'k3-09: 7 Tausche');
ok(k('k2-03').widget.correct.join() === '3,5', 'k2-03: Schatz ' + k('k2-03').widget.correct.join());
ok(k('k2-04').widget.answer === 33, 'k2-04: 33');
ok(k('k2-02').widget.correct[0] === 2, 'k2-02: Grün');

console.log(`\n${count} Aufgaben geprüft, ${fails} Fehler.`);
process.exit(fails ? 1 : 0);
