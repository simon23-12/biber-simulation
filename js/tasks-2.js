/* Wettbewerb 2: Daten, Graphen und Logik */
(function (B) {
  'use strict';
  const A = B.algo;
  B.contests = B.contests || [];

  /* --- Aufgabe 2: Datenbank --- */
  const tab = [
    ['Bruno', 5, 'Fluss', 'Erle'], ['Bella', 3, 'Teich', 'Birke'], ['Benno', 7, 'Fluss', 'Birke'],
    ['Biene', 4, 'Fluss', 'Weide'], ['Boris', 2, 'Fluss', 'Erle'], ['Berta', 6, 'Teich', 'Weide'],
    ['Bodo', 4, 'Teich', 'Erle'], ['Bibi', 8, 'Fluss', 'Weide'], ['Basti', 5, 'Fluss', 'Birke'], ['Bea', 9, 'See', 'Erle'],
  ];
  const dbCount = tab.filter(r => r[1] >= 4 && r[2] === 'Fluss' && r[3] !== 'Birke').length;
  const tableHtml = '<table class="data"><thead><tr><th>Name</th><th>Alter</th><th>Wohnort</th><th>Lieblingsholz</th></tr></thead><tbody>' +
    tab.map(r => '<tr>' + r.map(x => `<td>${x}</td>`).join('') + '</tr>').join('') + '</tbody></table>';

  /* --- Aufgabe 4/5: Lauflängen --- */
  const rleRows = [[4, 4, 4], [3, 6, 3], [2, 8, 2], [2, 8, 2], [3, 2, 2, 2, 3], [4, 1, 2, 1, 4]];
  const rleBlack = rleRows.reduce((t, r) => t + r.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0), 0);
  const heart = ['.##..##.', '########', '########', '########', '.######.', '..####..', '...##...', '........'];
  const encode = row => {
    const runs = []; let cur = '.', n = 0;
    for (const ch of row) { if (ch === cur) n++; else { runs.push(n); cur = ch; n = 1; } }
    runs.push(n); return runs;
  };

  /* --- Aufgabe 6: kürzester Weg --- */
  const gN = [['A', 40, 130], ['B', 140, 50], ['C', 140, 210], ['D', 250, 50], ['E', 250, 210], ['F', 360, 130], ['G', 460, 130]]
    .map(([id, x, y]) => ({ id, x, y }));
  const gE = [['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 1], ['B', 'D', 5], ['C', 'D', 8], ['C', 'E', 10], ['D', 'E', 2], ['D', 'F', 6], ['E', 'F', 3], ['E', 'G', 7], ['F', 'G', 1]];
  const dj = A.dijkstra(gE, 'A', 'G');

  /* --- Aufgabe 7: Programm nachvollziehen --- */
  let trace = 5;
  for (let i = 1; i <= 10; i++) { if (i % 3 === 0) trace += i; else trace -= 1; }

  /* --- Aufgabe 8: Wahrheitstabelle --- */
  const rows8 = [];
  for (let m = 0; m < 8; m++) rows8.push({ A: m >> 2 & 1, B: m >> 1 & 1, C: m & 1 });
  const f8 = r => ((r.A ^ r.B) | (r.C & (1 - r.B))) === 1;
  const truthCorrect = rows8.map((r, i) => f8(r) ? i : -1).filter(i => i >= 0);

  /* --- Aufgabe 10: Parkplatz --- */
  const orders = [[2, 1, 4, 3], [3, 1, 2, 4], [4, 3, 2, 1], [1, 3, 4, 2], [3, 4, 1, 2], [2, 4, 1, 3]];
  const stackCorrect = orders.map((o, i) => A.stackPermutation(o) ? i : -1).filter(i => i >= 0);

  /* --- Aufgabe 11: Rohrnetz --- */
  const fN = [['S', 40, 130], ['A', 160, 50], ['B', 160, 210], ['C', 300, 50], ['D', 300, 210], ['T', 430, 130]].map(([id, x, y]) => ({ id, x, y }));
  const fE = [['S', 'A', 9], ['S', 'B', 9], ['A', 'C', 3], ['A', 'D', 2, 0.28], ['B', 'C', 2, 0.28], ['B', 'D', 4], ['C', 'T', 8], ['D', 'T', 8]];
  const flow = A.maxflow(fE.map(e => e.slice(0, 3)), 'S', 'T');

  /* --- Aufgabe 12: Baum --- */
  const tN = [['A', 200, 40], ['B', 110, 105], ['C', 290, 105], ['D', 60, 175], ['E', 160, 175], ['F', 320, 175], ['G', 120, 240], ['H', 350, 240]].map(([id, x, y]) => ({ id, x, y }));
  const kids = { A: ['B', 'C'], B: ['D', 'E'], E: ['G', null], C: [null, 'F'], F: [null, 'H'] };
  const tEdges = []; Object.entries(kids).forEach(([p, c]) => c.forEach(x => x && tEdges.push([p, x])));
  const post = n => n ? (kids[n] || [null, null]).flatMap(post).concat(n) : [];
  const postorder = post('A');

  B.contests.push({
    id: 'w2',
    title: 'Wettbewerb 2',
    subtitle: 'Daten, Graphen und Logik',
    blurb: 'Datenbanken, Entscheidungsbäume, kürzeste Wege und Schaltlogik – dazu Planungs- und Flussprobleme.',
    tasks: [
      /* ---------------- leicht ---------------- */
      {
        id: 'w2-01', level: 1, title: 'Biber-Ampel', topic: 'Modellierung, Zustände',
        text: `<p>Die Ampel am Biberteich schaltet bei jedem Schritt eine Phase weiter, immer in dieser Reihenfolge:</p>
               <p class="center big">🔴 Rot → 🔴🟡 Rot-Gelb → 🟢 Grün → 🟡 Gelb → 🔴 Rot → …</p>
               <p>Im Moment zeigt die Ampel <b>Grün</b>. Welche Phase zeigt sie nach <b>50 Schritten</b>?</p>`,
        widget: { type: 'choice', cols: 2, options: ['🔴 Rot', '🔴🟡 Rot-Gelb', '🟢 Grün', '🟡 Gelb'], correct: [0] },
        explain: `<p>Die Phasen wiederholen sich alle 4 Schritte. 50 Schritte sind 12 volle Runden (48 Schritte) plus 2 Schritte. Von Grün aus sind das Gelb und dann <b>Rot</b>.</p>`,
        info: 'Die Ampel ist ein Zustandsautomat. Regelmäßige Abläufe berechnet man mit dem Rest einer Division (Modulo).',
      },
      {
        id: 'w2-02', level: 1, title: 'Biber-Datenbank', topic: 'Modellierung, Datenbanken',
        text: `<p>Die Biber führen eine Tabelle über ihre Familie:</p>${tableHtml}
               <p>Eine Abfrage wählt alle Zeilen aus, für die <b>alle drei</b> Bedingungen zutreffen:</p>
               <pre>Alter ≥ 4  UND  Wohnort = „Fluss“  UND  NICHT (Lieblingsholz = „Birke“)</pre>
               <p>Wie viele Zeilen liefert die Abfrage?</p>`,
        widget: { type: 'number', answer: dbCount },
        explain: `<p>Man prüft Zeile für Zeile. Es passen die Biber: ${tab.filter(r => r[1] >= 4 && r[2] === 'Fluss' && r[3] !== 'Birke').map(r => r[0]).join(', ')} – also <b>${dbCount}</b> Zeilen.</p>`,
        info: 'In Datenbanken filtert man Daten mit logischen Bedingungen (z. B. in der Abfragesprache SQL mit WHERE, AND, NOT).',
      },
      {
        id: 'w2-03', level: 1, title: 'Wetter-Entscheidung', topic: 'Algorithmen, Entscheidungsbaum',
        text: `<p>Die Biber entscheiden jeden Morgen mit diesem Entscheidungsbaum, was sie tun:</p>
               <ul class="tree">
                 <li>Regnet es?
                   <ul>
                     <li><b>ja</b> → Ist es windig?
                       <ul><li><b>ja</b> → <span class="leaf">Höhle aufräumen</span></li>
                           <li><b>nein</b> → Ist es kälter als 10 °C?
                             <ul><li><b>ja</b> → <span class="leaf">Dammbau</span></li><li><b>nein</b> → <span class="leaf">Schwimmen</span></li></ul></li></ul></li>
                     <li><b>nein</b> → Ist es wärmer als 20 °C?
                       <ul><li><b>ja</b> → <span class="leaf">Schwimmen</span></li>
                           <li><b>nein</b> → Ist es windig?
                             <ul><li><b>ja</b> → <span class="leaf">Holz sammeln</span></li><li><b>nein</b> → <span class="leaf">Dammbau</span></li></ul></li></ul></li>
                   </ul></li>
               </ul>
               <p>Heute regnet es, es weht <b>kein</b> Wind und es hat <b>8 °C</b>. Was tun die Biber?</p>`,
        widget: { type: 'choice', cols: 2, options: ['Höhle aufräumen', 'Dammbau', 'Schwimmen', 'Holz sammeln'], correct: [1] },
        explain: `<p>Regen: ja → Wind: nein → kälter als 10 °C: ja (8 °C) → <b>Dammbau</b>.</p>`,
        info: 'Entscheidungsbäume sind ein einfaches Modell des maschinellen Lernens: Jede Frage teilt die Fälle weiter auf.',
      },
      {
        id: 'w2-04', level: 1, title: 'Bild im Kurzcode', topic: 'Kodierung, Komprimierung',
        text: `<p>Ein Schwarz-Weiß-Bild ist <b>12 Pixel breit</b> und hat 6 Zeilen. Jede Zeile wird als Zahlenfolge gespeichert: Die Zahlen geben abwechselnd an, wie viele <b>weiße</b>, dann <b>schwarze</b>, dann wieder weiße Pixel nacheinander kommen (immer beginnend mit Weiß).</p>
               <pre>Zeile 1:  ${rleRows[0].join(' ')}
Zeile 2:  ${rleRows[1].join(' ')}
Zeile 3:  ${rleRows[2].join(' ')}
Zeile 4:  ${rleRows[3].join(' ')}
Zeile 5:  ${rleRows[4].join(' ')}
Zeile 6:  ${rleRows[5].join(' ')}</pre>
               <p>Wie viele Pixel des Bildes sind <b>schwarz</b>?</p>`,
        widget: { type: 'number', answer: rleBlack },
        explain: `<p>Es zählen die 2., 4., … Zahlen jeder Zeile: ${rleRows.map(r => r.filter((_, i) => i % 2 === 1).join('+')).join(' + ')} = <b>${rleBlack}</b>.</p>`,
        info: 'Diese Lauflängenkodierung spart bei Bildern mit großen einfarbigen Flächen viel Speicher.',
      },

      /* ---------------- mittel ---------------- */
      {
        id: 'w2-05', level: 2, title: 'Pixel-Herz', topic: 'Kodierung, Komprimierung',
        text: `<p>Ein Bild ist 8 Pixel breit und hat 8 Zeilen. Es ist wie in der vorigen Aufgabe kodiert: Jede Zahlenfolge beginnt mit der Zahl der <b>weißen</b> Pixel (das kann auch 0 sein), dann folgen abwechselnd schwarze und weiße Pixel.</p>
               <pre>${heart.map((r, i) => `Zeile ${i + 1}:  ${encode(r).join(' ')}`).join('\n')}</pre>
               <p>Male das Bild: Klicke die Felder an, die <b>schwarz</b> sein sollen.</p>`,
        widget: { type: 'paint', target: heart },
        explain: `<p>Zeile für Zeile: erst die weißen Felder überspringen, dann die angegebene Zahl an Feldern schwarz färben, dann wieder weiß usw. Es entsteht ein Herz.</p>`,
        info: 'Beim Dekodieren kommt es genau auf das vereinbarte Format an – etwa, dass jede Zeile mit Weiß beginnt.',
      },
      {
        id: 'w2-06', level: 2, title: 'Kürzester Weg', topic: 'Algorithmen, Graphen',
        text: () => `<p>Zwischen den Teichen A bis G haben die Biber Kanäle gegraben. Die Zahl an einem Kanal gibt an, wie viele Minuten das Schwimmen durch diesen Kanal dauert (in beide Richtungen gleich).</p>
               <div class="figure">${B.graphSvg(gN, gE.map(([a, b, w]) => ({ a, b, label: w })), { w: 500, h: 260, label: 'Kanalnetz' })}</div>
               <p>Wie viele Minuten dauert der <b>schnellste</b> Weg von A nach G?</p>`,
        widget: { type: 'number', answer: dj.dist, unit: 'Minuten' },
        explain: `<p>Der schnellste Weg ist <b>${dj.path.join(' → ')}</b> mit insgesamt <b>${dj.dist} Minuten</b>. Der Weg mit den wenigsten Kanälen ist nicht der schnellste – man muss die Zeiten vergleichen.</p>`,
        info: 'Der Algorithmus von Dijkstra findet kürzeste Wege. Navigationsgeräte verwenden Varianten davon.',
      },
      {
        id: 'w2-07', level: 2, title: 'Holzzähler', topic: 'Programmierung, Ablaufverfolgung',
        text: `<p>Ein Biber zählt Holz mit diesem Programm. Die Variable <b>s</b> speichert das Ergebnis; „i mod 3“ ist der Rest bei der Division von i durch 3.</p>
               <pre>s ← 5
für i von 1 bis 10:
    wenn i mod 3 = 0:
        s ← s + i
    sonst:
        s ← s − 1</pre>
               <p>Welchen Wert hat <b>s</b> am Ende?</p>`,
        widget: { type: 'number', answer: trace },
        explain: `<p>Durch 3 teilbar sind i = 3, 6, 9: Dafür kommen 3 + 6 + 9 = 18 dazu. Für die anderen 7 Werte von i wird je 1 abgezogen: −7. Also 5 + 18 − 7 = <b>${trace}</b>.</p>`,
        info: 'Eine Ablaufverfolgung („Schreibtischtest“) ist die wichtigste Methode, um Programme gedanklich auszuführen und Fehler zu finden.',
      },
      {
        id: 'w2-08', level: 2, title: 'Verrückte Lampe', topic: 'Modellierung, Logik',
        text: `<p>Die Lampe hängt an drei Schaltern A, B und C (jeweils 1 = an, 0 = aus). Sie leuchtet genau dann, wenn gilt:</p>
               <p class="center big"><b>(A XOR B)</b> &nbsp;ODER&nbsp; <b>(C UND NICHT B)</b></p>
               <p>„A XOR B“ bedeutet: <i>entweder</i> A <i>oder</i> B ist an, aber nicht beide.</p>
               <p>Bei welchen Schalterstellungen leuchtet die Lampe? Wähle alle aus.</p>`,
        widget: {
          type: 'choice', multi: true, cols: 2, correct: truthCorrect,
          options: rows8.map(r => `A = ${r.A}, B = ${r.B}, C = ${r.C}`),
        },
        explain: `<p>Man testet jede Zeile der Wahrheitstabelle. Die Lampe leuchtet bei: ${truthCorrect.map(i => `(${rows8[i].A}, ${rows8[i].B}, ${rows8[i].C})`).join(', ')}. Bei (0,0,0), (1,1,0) und (1,1,1) leuchtet sie nicht.</p>`,
        info: 'Wahrheitstabellen zeigen vollständig, wie eine logische Schaltung auf alle Eingaben reagiert.',
      },

      /* ---------------- schwer ---------------- */
      {
        id: 'w2-09', level: 3, title: 'Sägewerk', topic: 'Algorithmen, Planung',
        text: `<p>Im Sägewerk der Biber gibt es drei Maschinen, die gleichzeitig arbeiten. Acht Aufträge müssen erledigt werden; sie dauern 8, 7, 6, 5, 4, 4, 3 und 3 Stunden. Jeder Auftrag wird komplett auf <b>einer</b> Maschine bearbeitet.</p>
               <p>Verteile die Aufträge so auf die Maschinen, dass alle Maschinen spätestens nach <b>14 Stunden</b> fertig sind.</p>`,
        widget: {
          type: 'assign', bins: ['Maschine 1', 'Maschine 2', 'Maschine 3'], limit: 14,
          items: [8, 7, 6, 5, 4, 4, 3, 3].map(t => ({ t })),
        },
        explain: `<p>Die Gesamtdauer beträgt 40 Stunden, bei drei Maschinen sind also mindestens 14 Stunden nötig (40 : 3 ≈ 13,3). Eine passende Verteilung: 8 + 6 = 14, 7 + 4 + 3 = 14 und 5 + 4 + 3 = 12.</p>`,
        info: 'Solche Verteilungsprobleme (Scheduling) sind schwer: Schon für wenige Maschinen ist der beste Plan nur durch Ausprobieren und Abschätzen zu finden.',
      },
      {
        id: 'w2-10', level: 3, title: 'Sackgasse', topic: 'Datenstrukturen, Stapel',
        text: `<p>Vier Autos 1, 2, 3, 4 fahren in dieser Reihenfolge in eine Sackgasse. Ein Auto kann nur herausfahren, wenn es ganz vorne steht, also das Auto ist, das <b>zuletzt hineingefahren</b> ist und noch dort steht.</p>
               <p>Nach jedem Hineinfahren dürfen beliebig viele Autos wieder herausfahren (auch keine). Alle Autos müssen am Ende die Sackgasse verlassen haben.</p>
               <p>Welche der folgenden <b>Ausfahrt-Reihenfolgen</b> sind möglich? Wähle alle aus.</p>`,
        widget: { type: 'choice', multi: true, cols: 2, correct: stackCorrect, options: orders.map(o => '<span class="mono">' + o.join(' – ') + '</span>') },
        explain: `<p>Beispiel 2 – 1 – 4 – 3: 1 und 2 fahren hinein, 2 und 1 wieder hinaus, dann 3 und 4 hinein, 4 und 3 hinaus. Unmöglich sind Reihenfolgen, in denen ein Auto herauskommen soll, das von einem später hineingefahrenen Auto blockiert wird (z. B. 3 – 1 – 2 – 4: Nach der 3 steht die 2 vor der 1).</p>`,
        info: 'Die Sackgasse arbeitet nach dem Prinzip „last in, first out“ – genau wie ein Stapel (Stack) in der Informatik.',
      },
      {
        id: 'w2-11', level: 3, title: 'Wasserleitungen', topic: 'Algorithmen, Flüsse in Netzen',
        text: () => `<p>Wasser fließt von der Quelle S zum Teich T. Jede Röhre hat eine Höchstmenge (in Litern pro Sekunde), die durch sie fließen kann, und das Wasser fließt nur in Pfeilrichtung.</p>
               <div class="figure">${B.graphSvg(fN, fE.map(([a, b, c, t]) => ({ a, b, label: c, t })), { w: 480, h: 260, directed: true, label: 'Rohrnetz' })}</div>
               <p>Wie viele Liter pro Sekunde können <b>höchstens</b> von S nach T fließen?</p>`,
        widget: { type: 'number', answer: flow, unit: 'Liter pro Sekunde' },
        explain: `<p>Aus der Mitte (A, B) können insgesamt nur 3 + 2 + 2 + 4 = <b>${flow}</b> Liter pro Sekunde in Richtung C und D fließen – das ist der Engpass. Weder die Röhren an der Quelle (zusammen 18) noch die am Teich (zusammen 16) begrenzen den Fluss stärker.</p>`,
        info: 'Der Engpass eines Netzes heißt „minimaler Schnitt“. Nach dem Max-Flow-Min-Cut-Satz ist er genau so groß wie der maximale Fluss.',
      },
      {
        id: 'w2-12', level: 3, title: 'Baumwanderung', topic: 'Algorithmen, Baumdurchlauf',
        text: () => `<p>Ein Biber besucht alle Knoten dieses Baumes nach folgender Regel:</p>
               <pre>besuche(Knoten):
    wenn es einen linken Nachfolger gibt:  besuche(linker Nachfolger)
    wenn es einen rechten Nachfolger gibt: besuche(rechter Nachfolger)
    schreibe den Namen des Knotens auf</pre>
               <p>Er beginnt bei A. Ein Nachfolger links unterhalb eines Knotens ist der <i>linke</i>, rechts unterhalb der <i>rechte</i> Nachfolger.</p>
               <p>Klicke die Knoten in der Reihenfolge an, in der der Biber ihre Namen aufschreibt.</p>`,
        widget: { type: 'seqclick', w: 420, h: 280, nodes: tN, edges: tEdges, correct: postorder },
        explain: `<p>Die Regel schreibt einen Knoten erst auf, nachdem <b>beide Teilbäume</b> besucht wurden („Postorder“). Links von A: D, dann G, E, B. Rechts von A: H, F, C. Zuletzt A. Die Reihenfolge lautet: <b>${postorder.join(' – ')}</b>.</p>`,
        info: 'Rekursive Baumdurchläufe sind die Grundlage vieler Algorithmen, z. B. zum Auswerten von Rechenausdrücken.',
      },
    ],
  });
})(window.Biber = window.Biber || {});
