/* Herr Fuhs’ großartige Biber Simulation – Oberfläche und Ablauf.
   Gespeichert wird ausschließlich im localStorage des Browsers. */
(function (B) {
  'use strict';
  const h = B.h, W = B.widgets;
  const DURATION = 35 * 60 * 1000;
  const POINTS = { 1: 6, 2: 9, 3: 12 };
  const LEVEL = { 1: 'leicht', 2: 'mittel', 3: 'schwer' };
  const KEY = 'fuhs-biber-simulation-v1';
  const app = document.getElementById('app');
  const val = x => (typeof x === 'function' ? x() : x);

  /* ---------- Speicher ---------- */
  let db = (() => {
    try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.contests) return d; } catch (e) { /* kein Speicher verfügbar */ }
    return { contests: {} };
  })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* ignorieren */ } };
  const st = id => (db.contests[id] = db.contests[id] || { status: 'idle', history: [] });
  const contestById = id => B.contests.find(c => c.id === id);
  const maxPoints = c => c.tasks.reduce((t, k) => t + POINTS[k.level], 0);
  const fmt = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const remaining = s => DURATION - (Date.now() - s.startedAt);

  let timer = null;
  const stopTimer = () => { if (timer) { clearInterval(timer); timer = null; } };

  /* ---------- Dialoge ---------- */
  function dialog({ title, body, ok = 'OK', cancel = null }) {
    return new Promise(resolve => {
      const d = h('dialog', { class: 'dlg' },
        h('h2', null, title), h('div', { class: 'dlg-body', html: body }),
        h('div', { class: 'dlg-actions' },
          cancel ? h('button', { class: 'btn', onclick: () => d.close('cancel') }, cancel) : null,
          h('button', { class: 'btn primary', onclick: () => d.close('ok') }, ok)));
      d.addEventListener('close', () => { d.remove(); resolve(d.returnValue === 'ok'); });
      document.body.append(d); d.showModal();
    });
  }

  /* ---------- Auswertung ---------- */
  function evaluate(c, s) {
    const per = {};
    let score = 0;
    c.tasks.forEach(t => {
      const w = W[t.widget.type], ans = s.answers[t.id];
      const empty = w.isEmpty(ans);
      const ok = !empty && w.check(t.widget, ans) >= 1;
      per[t.id] = { empty, ok, points: ok ? POINTS[t.level] : 0, max: POINTS[t.level] };
      score += per[t.id].points;
    });
    return { score, max: maxPoints(c), per };
  }

  function finish(id) {
    const c = contestById(id), s = st(id);
    stopTimer();
    const used = Math.min(DURATION, Date.now() - s.startedAt);
    s.result = Object.assign(evaluate(c, s), { usedMs: used, finishedAt: Date.now() });
    s.status = 'done';
    s.history = (s.history || []).concat({ score: s.result.score, max: s.result.max, at: s.result.finishedAt });
    save();
  }

  /* ---------- Startseite ---------- */
  function home() {
    stopTimer();
    app.innerHTML = '';
    const running = B.contests.filter(c => st(c.id).status === 'running');
    app.append(
      h('header', { class: 'hero' },
        h('div', { class: 'hero-text' },
          h('p', { class: 'eyebrow' }, 'Klassenstufe 9 · Informatik-Wettbewerb zum Üben'),
          h('h1', null, 'Herr Fuhs’ großartige Biber Simulation'),
          h('p', { class: 'lead' }, 'Drei Wettbewerbe im Stil des Informatik-Bibers. Jeder hat 12 Aufgaben, die leicht beginnen und zum Schluss richtig knifflig werden. Du hast pro Wettbewerb 35 Minuten – danach gibt es Punkte und alle Lösungen.'),
          h('ul', { class: 'chips' }, ['⏱ 35 Minuten', '🧩 12 Aufgaben', '🎯 108 Punkte', '💾 nur lokal gespeichert'].map(t => h('li', null, t)))),
        h('figure', { class: 'hero-img' }, h('img', { src: 'assets/biber.webp', alt: 'Ein erstaunt blickender Biber mit weit aufgerissenen Augen', width: 498, height: 544 }))));

    if (running.length) {
      const c = running[0];
      app.append(h('div', { class: 'banner' }, h('span', null, `⏳ „${c.title}“ läuft noch – Restzeit ${fmt(remaining(st(c.id)))}.`),
        h('button', { class: 'btn primary', onclick: () => contest(c.id) }, 'Weitermachen')));
    }

    app.append(h('section', { class: 'rules' },
      h('h2', null, 'So funktioniert’s'),
      h('ul', null,
        h('li', null, 'Mit dem Start läuft die Uhr – sie kann nicht angehalten werden, auch nicht beim Schließen der Seite.'),
        h('li', null, 'Du kannst zwischen den Aufgaben springen, Antworten ändern und Aufgaben mit einer Flagge markieren.'),
        h('li', null, 'Während des Wettbewerbs erfährst du nicht, ob eine Antwort richtig ist. Das Feedback kommt erst nach der Abgabe oder wenn die Zeit abgelaufen ist.'),
        h('li', null, 'Punkte: leichte Aufgaben 6, mittlere 9, schwere 12. Falsche Antworten geben keine Minuspunkte, es gibt keine Teilpunkte.'),
        h('li', null, 'Tipp: Fang mit den leichten Aufgaben an. Die schweren stehen am Ende jedes Wettbewerbs.'))));

    const grid = h('div', { class: 'cards' });
    B.contests.forEach((c, i) => {
      const s = st(c.id), best = (s.history || []).reduce((m, r) => Math.max(m, r.score), -1);
      let action, status;
      if (s.status === 'running') {
        status = `Läuft – noch ${fmt(remaining(s))}`;
        action = h('button', { class: 'btn primary', onclick: () => contest(c.id) }, 'Weitermachen');
      } else if (s.status === 'done') {
        status = `Zuletzt: ${s.result.score} von ${s.result.max} Punkten` + (best >= 0 ? ` · Bestwert ${best}` : '');
        action = h('div', { class: 'card-actions' },
          h('button', { class: 'btn primary', onclick: () => result(c.id) }, 'Ergebnis ansehen'),
          h('button', { class: 'btn', onclick: () => start(c.id, true) }, 'Nochmal versuchen'));
      } else {
        status = 'Noch nicht gestartet';
        action = h('button', { class: 'btn primary', onclick: () => start(c.id) }, 'Wettbewerb starten');
      }
      const levels = [1, 2, 3].map(l => `${c.tasks.filter(t => t.level === l).length}× ${LEVEL[l]}`).join(' · ');
      grid.append(h('article', { class: 'card contest-card c' + (i + 1) },
        h('div', { class: 'num' }, String(i + 1)),
        h('h3', null, c.subtitle),
        h('p', { class: 'muted' }, c.title),
        h('p', null, c.blurb),
        h('p', { class: 'meta' }, `${c.tasks.length} Aufgaben (${levels}) · ${maxPoints(c)} Punkte`),
        h('p', { class: 'status' }, status), action));
    });
    app.append(grid);

    app.append(h('footer', { class: 'foot' },
      h('p', null, 'Alle Aufgaben sind eigens für diese Simulation geschrieben, angelehnt an Themen und Aufgabenformate des ',
        h('a', { href: 'https://bwinf.de/biber/', target: '_blank', rel: 'noopener' }, 'Informatik-Bibers (BWINF)'), '. Dein Fortschritt bleibt in diesem Browser gespeichert.'),
      h('button', {
        class: 'btn link', onclick: async () => {
          if (await dialog({ title: 'Alles zurücksetzen?', body: '<p>Alle Ergebnisse und laufenden Wettbewerbe in diesem Browser werden gelöscht.</p>', ok: 'Ja, löschen', cancel: 'Abbrechen' })) {
            db = { contests: {} }; save(); home();
          }
        },
      }, 'Gespeicherten Fortschritt löschen')));
    window.scrollTo(0, 0);
  }

  async function start(id, again) {
    const c = contestById(id);
    const ok = await dialog({
      title: `${c.title} starten?`,
      body: `<p>Sobald du startest, hast du <b>35 Minuten</b> Zeit für ${c.tasks.length} Aufgaben. Die Uhr läuft weiter, auch wenn du die Seite schließt.</p>` +
        (again ? '<p>Dein bisheriges Ergebnis bleibt in der Bestwert-Anzeige erhalten.</p>' : '') + '<p>Bereit?</p>',
      ok: 'Los geht’s!', cancel: 'Noch nicht',
    });
    if (!ok) return;
    const s = st(id);
    Object.assign(s, { status: 'running', startedAt: Date.now(), answers: {}, marked: {}, cur: 0, result: null });
    save(); contest(id);
  }

  /* ---------- Wettbewerb ---------- */
  function contest(id) {
    const c = contestById(id), s = st(id);
    if (s.status !== 'running') return home();
    if (remaining(s) <= 0) { finish(id); return result(id, true); }
    stopTimer();
    app.innerHTML = '';
    const timerEl = h('div', { class: 'timer', role: 'timer' }, fmt(remaining(s)));
    const bar = h('div', { class: 'timebar' }, h('i'));
    const nav = h('nav', { class: 'tasknav', 'aria-label': 'Aufgabenübersicht' });
    const card = h('section', { class: 'card task' });
    const foot = h('div', { class: 'taskfoot' });
    app.append(
      h('div', { class: 'topbar' },
        h('div', { class: 'topbar-in' }, h('strong', null, c.title), timerEl,
          h('button', { class: 'btn danger small', onclick: submit }, 'Abgeben')), bar),
      nav, card, foot);

    const navBtns = c.tasks.map((t, i) => {
      const b = h('button', { class: 'navbtn lv' + t.level, 'aria-label': `Aufgabe ${i + 1}, ${LEVEL[t.level]}`, onclick: () => show(i) }, String(i + 1));
      nav.append(b); return b;
    });
    function paintNav() {
      c.tasks.forEach((t, i) => {
        const b = navBtns[i];
        b.classList.toggle('cur', s.cur === i);
        b.classList.toggle('done', !W[t.widget.type].isEmpty(s.answers[t.id]));
        b.classList.toggle('flag', !!s.marked[t.id]);
      });
    }
    function show(i) {
      s.cur = i; save();
      const t = c.tasks[i], w = W[t.widget.type];
      card.innerHTML = ''; foot.innerHTML = '';
      const flag = h('button', { class: 'btn small flagbtn', 'aria-pressed': !!s.marked[t.id] }, s.marked[t.id] ? '🚩 Markiert' : '🏳 Markieren');
      flag.addEventListener('click', () => { s.marked[t.id] = !s.marked[t.id]; save(); flag.textContent = s.marked[t.id] ? '🚩 Markiert' : '🏳 Markieren'; flag.setAttribute('aria-pressed', !!s.marked[t.id]); paintNav(); });
      const body = h('div', { class: 'widget' });
      card.append(
        h('div', { class: 'task-head' },
          h('span', { class: 'kicker' }, `Aufgabe ${i + 1} von ${c.tasks.length}`),
          h('span', { class: 'badge lv' + t.level }, `${LEVEL[t.level]} · ${POINTS[t.level]} Punkte`), flag),
        h('h2', null, t.title),
        h('div', { class: 'task-text', html: val(t.text) }), body);
      w.render(body, t.widget, {
        answer: s.answers[t.id], locked: false, review: false,
        set(v) { if (w.isEmpty(v)) delete s.answers[t.id]; else s.answers[t.id] = v; save(); paintNav(); },
      });
      foot.append(
        h('button', { class: 'btn', disabled: i === 0, onclick: () => show(i - 1) }, '← Zurück'),
        i < c.tasks.length - 1
          ? h('button', { class: 'btn primary', onclick: () => show(i + 1) }, 'Weiter →')
          : h('button', { class: 'btn danger', onclick: submit }, 'Wettbewerb abgeben'));
      paintNav();
      window.scrollTo({ top: 0 });
    }
    async function submit() {
      const open = c.tasks.filter(t => W[t.widget.type].isEmpty(s.answers[t.id])).length;
      const ok = await dialog({
        title: 'Wettbewerb abgeben?',
        body: open ? `<p>Du hast noch <b>${open}</b> Aufgabe${open === 1 ? '' : 'n'} ohne Antwort. Nach der Abgabe kannst du nichts mehr ändern.</p>` : '<p>Du hast alle Aufgaben bearbeitet. Nach der Abgabe kannst du nichts mehr ändern.</p>',
        ok: 'Ja, abgeben', cancel: 'Weiterarbeiten',
      });
      if (ok && s.status === 'running') { finish(id); result(id); }
    }
    function tick() {
      const rem = remaining(s);
      timerEl.textContent = fmt(rem);
      timerEl.classList.toggle('warn', rem < 5 * 60 * 1000);
      timerEl.classList.toggle('crit', rem < 60 * 1000);
      bar.firstChild.style.width = Math.max(0, rem / DURATION * 100) + '%';
      if (rem <= 0) {
        finish(id);
        document.querySelectorAll('dialog').forEach(d => d.remove());
        result(id, true);
      }
    }
    timer = setInterval(tick, 500); tick();
    show(Math.min(s.cur || 0, c.tasks.length - 1));
  }

  /* ---------- Ergebnis ---------- */
  function rank(p) {
    if (p >= 90) return ['🏆', 'Legendärer Biber-Baumeister', 'Das war Spitzenklasse – fast fehlerfrei!'];
    if (p >= 75) return ['🥇', 'Dammbau-Profi', 'Sehr stark. Nur noch wenige Knobelaufgaben fehlen.'];
    if (p >= 55) return ['🥈', 'Fleißiger Holzfäller', 'Solide Leistung – bei den schweren Aufgaben ist noch Luft nach oben.'];
    if (p >= 30) return ['🥉', 'Junger Biber auf gutem Weg', 'Die Grundlagen sitzen. Schau dir die Lösungen genau an.'];
    return ['🌱', 'Biber-Azubi', 'Kein Problem – mit den Lösungen unten lernst du am meisten.'];
  }

  function result(id, timeUp) {
    stopTimer();
    const c = contestById(id), s = st(id), r = s.result;
    app.innerHTML = '';
    const pct = Math.round(r.score / r.max * 100), [icon, title, line] = rank(pct);
    const right = c.tasks.filter(t => r.per[t.id].ok).length;
    const byLevel = [1, 2, 3].map(l => {
      const ts = c.tasks.filter(t => t.level === l);
      return `<li><span class="badge lv${l}">${LEVEL[l]}</span> ${ts.filter(t => r.per[t.id].ok).length} von ${ts.length} richtig</li>`;
    }).join('');
    const mins = Math.floor(r.usedMs / 60000), secs = Math.round(r.usedMs % 60000 / 1000);

    if (timeUp) app.append(h('div', { class: 'banner' }, h('span', null, '⏰ Die Zeit ist abgelaufen – dein Wettbewerb wurde automatisch abgegeben.')));
    app.append(
      h('section', { class: 'card summary' },
        h('div', { class: 'ring', style: { '--pct': pct } }, h('b', null, String(r.score)), h('small', null, 'von ' + r.max)),
        h('div', { class: 'summary-text' },
          h('p', { class: 'eyebrow' }, c.title + ' · ' + c.subtitle),
          h('h1', null, `${icon} ${title}`), h('p', { class: 'lead' }, line),
          h('p', null, `${right} von ${c.tasks.length} Aufgaben richtig · ${pct} % · benötigte Zeit ${mins} min ${secs} s`),
          h('ul', { class: 'levels', html: byLevel }),
          h('div', { class: 'card-actions' },
            h('button', { class: 'btn primary', onclick: home }, '← Zur Startseite'),
            h('button', { class: 'btn', onclick: () => window.print() }, '🖨 Drucken / PDF')))));

    const filter = h('div', { class: 'filter' },
      h('strong', null, 'Lösungen und Erklärungen'),
      h('button', { class: 'btn small', onclick: () => document.querySelectorAll('.rev').forEach(d => { d.open = true; }) }, 'Alle aufklappen'),
      h('button', { class: 'btn small', onclick: () => document.querySelectorAll('.rev').forEach(d => { d.open = false; }) }, 'Alle zuklappen'));
    app.append(filter);

    c.tasks.forEach((t, i) => {
      const pr = r.per[t.id], w = W[t.widget.type];
      const cls = pr.ok ? 'ok' : pr.empty ? 'empty' : 'bad';
      const label = pr.ok ? '✓ richtig' : pr.empty ? '– nicht bearbeitet' : '✗ falsch';
      const body = h('div', { class: 'widget review' });
      const det = h('details', { class: 'rev card ' + cls, open: !pr.ok },
        h('summary', null,
          h('span', { class: 'rev-no' }, String(i + 1)),
          h('span', { class: 'rev-title' }, t.title),
          h('span', { class: 'badge lv' + t.level }, LEVEL[t.level]),
          h('span', { class: 'rev-res' }, `${label} · ${pr.points}/${pr.max}`)),
        h('div', { class: 'task-text', html: val(t.text) }),
        h('p', { class: 'yours' }, pr.empty ? 'Du hast keine Antwort gegeben.' : 'Deine Antwort:'), body,
        h('div', { class: 'solution' },
          h('h4', null, 'Lösung'),
          h('p', { html: w.solutionHtml(t.widget) }),
          h('div', { html: val(t.explain) }),
          h('p', { class: 'info', html: '💡 <b>Das ist Informatik!</b> ' + t.info })));
      app.append(det);
      if (!pr.empty) w.render(body, t.widget, { answer: s.answers[t.id], locked: true, review: true, set() {} });
      else body.remove();
    });
    app.append(h('div', { class: 'card-actions center' }, h('button', { class: 'btn primary', onclick: home }, '← Zur Startseite')));
    window.scrollTo(0, 0);
  }

  /* ---------- Start ---------- */
  B.contests.forEach(c => { const s = st(c.id); if (s.status === 'running' && remaining(s) <= 0) finish(c.id); });
  save();
  document.addEventListener('visibilitychange', () => { /* Timer rechnet über Zeitstempel – kein Handlungsbedarf */ });
  home();
})(window.Biber);
