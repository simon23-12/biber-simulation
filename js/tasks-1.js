/* Wettbewerb 1: Wege, Codes und Muster */
(function (B) {
  'use strict';
  const A = B.algo;
  B.contests = B.contests || [];

  /* --- Daten für Aufgabe 5 (Prüfbits) --- */
  const bits = [[1, 0, 1, 1], [0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 1, 1]];
  const rowP = bits.map(r => r.reduce((a, b) => a + b) % 2);
  const colP = [0, 1, 2, 3].map(c => bits.reduce((a, r) => a + r[c], 0) % 2);
  const grid5 = bits.map((r, i) => r.concat(rowP[i]));
  grid5.push(colP.concat(rowP.reduce((a, b) => a + b) % 2));
  const flipped = [2, 1];
  grid5[flipped[0]][flipped[1]] ^= 1;

  /* --- Daten für Aufgabe 7 (Teiche) --- */
  const pond = [
    '~~...~..',
    '.~.~...~',
    '..~~..~~',
    '~.......',
    '~~.~~.~~',
    '...~...~',
  ];
  const ponds = A.countRegions(pond, '~');

  /* --- Daten für Aufgabe 8 (Klausurenplan) --- */
  const fach = [['Ma', 'Mathe'], ['De', 'Deutsch'], ['En', 'Englisch'], ['Ph', 'Physik'], ['Bi', 'Bio'], ['Ch', 'Chemie'], ['If', 'Info']];
  const nodes8 = fach.map(([id, label], i) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / fach.length;
    return { id, label: id, x: Math.round(190 + 120 * Math.cos(a)), y: Math.round(150 + 105 * Math.sin(a)) };
  });
  const edges8 = [['Ma', 'De'], ['Ma', 'En'], ['De', 'En'], ['En', 'Ph'], ['Ph', 'Bi'], ['Bi', 'Ch'], ['Ch', 'Ph'], ['Ch', 'If'], ['If', 'Ma'], ['De', 'If']];

  /* --- Daten für Aufgabe 10 (Automaten) --- */
  const autoStates = [
    { id: 'S', x: 80, y: 95, start: true }, { id: 'A', x: 190, y: 95 },
    { id: 'B', x: 300, y: 95 }, { id: 'E', x: 410, y: 95, final: true },
  ];
  const base = { S: { a: 'A', b: 'S' }, A: { a: 'A', b: 'B' }, B: { a: 'E', b: 'S' }, E: { a: 'E', b: 'E' } };
  const variant = patch => { const m = JSON.parse(JSON.stringify(base)); Object.entries(patch).forEach(([k, v]) => Object.assign(m[k], v)); return m; };
  const autos = [variant({ B: { b: 'A' } }), base, variant({ A: { a: 'S' } }), variant({ E: { b: 'S' } })];
  const accepts = (m, w) => { let st = 'S'; for (const ch of w) st = m[st][ch]; return st === 'E'; };
  const words = []; for (let n = 0; n <= 7; n++) for (let i = 0; i < (1 << n); i++) words.push([...Array(n)].map((_, k) => (i >> k & 1) ? 'b' : 'a').join(''));
  const correctAuto = autos.findIndex(m => words.every(w => accepts(m, w) === w.includes('aba')));
  const autoSvg = m => {
    const tr = [];
    Object.entries(m).forEach(([from, t]) => {
      const byTarget = {};
      Object.entries(t).forEach(([ch, to]) => { (byTarget[to] = byTarget[to] || []).push(ch); });
      Object.entries(byTarget).forEach(([to, chs]) => tr.push({ from, to, label: chs.join(', ') }));
    });
    return B.automatonSvg(autoStates, tr, { w: 480, h: 200, label: 'Automat' });
  };

  /* --- Daten für Aufgabe 11 (Floß) --- */
  const logs = [['Birkenast', 3, 4], ['Erlenstamm', 4, 5], ['Weidenholz', 5, 8], ['Eichenbalken', 7, 11], ['Buchenklotz', 8, 10], ['Lindenbrett', 6, 7], ['Eschenstange', 9, 14]]
    .map(([name, w, v]) => ({ name, w, v }));

  B.contests.push({
    id: 'w1',
    title: 'Wettbewerb 1',
    subtitle: 'Wege, Codes und Muster',
    blurb: 'Roboter programmieren, Lampen deuten, Fehler finden – und am Ende knifflige Netzwerke und Automaten.',
    tasks: [
      /* ---------------- leicht ---------------- */
      {
        id: 'w1-01', level: 1, title: 'Zur Biberburg', topic: 'Programmierung, Sequenz',
        text: `<p>Der Biber 🦫 möchte zu seiner Biberburg 🏠. Unterwegs muss er unbedingt das Holzstück 🪵 einsammeln. Die Bäume 🌳 sind im Weg.</p>
               <p>Baue ein Programm aus den Befehlen <b>↑ ↓ ← →</b> (jeder Befehl bewegt den Biber um ein Feld). Das Programm darf <b>höchstens 8 Befehle</b> lang sein.</p>`,
        widget: { type: 'robot', size: [5, 5], start: [4, 0], goal: [0, 4], items: [[2, 2]], walls: [[1, 1], [1, 2], [3, 1], [3, 2]], max: 8 },
        explain: `<p>Vom Start bis zum Holzstück sind es mindestens 4 Schritte (2 nach oben, 2 nach rechts), vom Holzstück bis zur Burg noch einmal 4. Kürzer als 8 Befehle geht es also nicht – und es gibt mehrere Wege mit genau 8.</p>`,
        info: 'Ein Programm ist eine Folge von eindeutigen Anweisungen. Wer sie genau befolgt, erreicht das Ziel – Computer tun genau das.',
      },
      {
        id: 'w1-02', level: 1, title: 'Biber-Zähler', topic: 'Zahlendarstellung, Binärsystem',
        text: `<p>Der Biber-Zähler zeigt Zahlen mit sechs Lampen an. Jede Lampe hat einen festen Wert (siehe Beschriftung). Die angezeigte Zahl ist die <b>Summe der Werte aller leuchtenden Lampen</b>.</p>
               <p>Der Biber hat <b>45</b> Stämme gezählt. Schalte die Lampen so, dass der Zähler 45 anzeigt.</p>`,
        widget: { type: 'lamps', values: [32, 16, 8, 4, 2, 1], target: 45 },
        explain: `<p>45 = 32 + 8 + 4 + 1. Man beginnt mit dem größten Wert, der noch hineinpasst (32), und füllt den Rest (13) mit 8, 4 und 1 auf.</p>`,
        info: 'Computer speichern Zahlen im Binärsystem: Jede Stelle ist entweder „an“ oder „aus“ und hat den Wert einer Zweierpotenz.',
      },
      {
        id: 'w1-03', level: 1, title: 'Geheimbotschaft', topic: 'Kodierung, Verschlüsselung',
        text: `<p>Die Biber verschlüsseln Wörter nach einer festen Regel. So wird aus <b>BIBER</b> das Wort <b>ELEHU</b>.</p>
               <p>Biber Bruno hat die Nachricht <b>EXUJ</b> erhalten. Wie lautet das ursprüngliche Wort?</p>`,
        widget: { type: 'text', answers: ['BURG'], placeholder: 'Wort in Großbuchstaben' },
        explain: `<p>B→E, I→L, B→E, E→H, R→U: Jeder Buchstabe rückt im Alphabet um <b>3 Stellen</b> weiter. Zum Entschlüsseln geht man 3 Stellen zurück: E→B, X→U, U→R, J→G. Das Wort lautet <b>BURG</b>.</p>`,
        info: 'Diese Verschlüsselung heißt Caesar-Chiffre. Sie ist leicht zu knacken, weil es nur 25 mögliche Verschiebungen gibt.',
      },
      {
        id: 'w1-04', level: 1, title: 'Schleifen-Biber', topic: 'Programmierung, Wiederholung',
        text: `<p>Der Biber 🦫 steht auf dem markierten Feld und schaut nach oben (↑). Er führt dieses Programm aus:</p>
               <pre>wiederhole 3 mal:
    gehe 2 Felder vor
    drehe dich um 90° nach rechts
gehe 1 Feld vor</pre>
               <p>Auf welchem Feld steht der Biber am Ende?</p>`,
        widget: {
          type: 'gridclick', rows: 6, cols: 6, correct: [4, 2],
          cell: (r, c) => (r === 4 && c === 1 ? { html: '🦫<small>↑</small>', cls: 'start' } : {}),
        },
        explain: `<p>Start (Zeile 5, Spalte 2), Blick nach oben. Durchgang 1: 2 hoch → Zeile 3; Blick nach rechts. Durchgang 2: 2 nach rechts → Spalte 4; Blick nach unten. Durchgang 3: 2 nach unten → Zeile 5; Blick nach links. Dann 1 nach links: <b>Zeile 5, Spalte 3</b>.</p>`,
        info: 'Mit Schleifen kann man gleiche Abläufe kurz beschreiben. Beim Nachvollziehen von Programmen hilft es, jeden Durchlauf einzeln aufzuschreiben.',
      },

      /* ---------------- mittel ---------------- */
      {
        id: 'w1-05', level: 2, title: 'Fehler im Funkspruch', topic: 'Kodierung, Fehlererkennung',
        text: `<p>Ein Biber funkt 16 Datenbits als 4×4-Quadrat. Damit Fehler auffallen, hängt er an jede Zeile und jede Spalte ein <b>Prüfbit</b> (grau) an. Das Prüfbit wird so gewählt, dass in jeder Zeile und in jeder Spalte (mit Prüfbit) eine <b>gerade Anzahl von Einsen</b> steht.</p>
               <p>Beim Empfang ist genau <b>eines der 16 Datenbits</b> (weiß) falsch angekommen, weil es von 0 auf 1 oder von 1 auf 0 gekippt ist. Klicke auf dieses Bit.</p>`,
        widget: {
          type: 'gridclick', rows: 5, cols: 5, correct: flipped,
          cell: (r, c) => ({ html: String(grid5[r][c]), cls: 'bit' + (r === 4 || c === 4 ? ' parity' : '') }),
        },
        explain: `<p>Man zählt die Einsen pro Zeile und Spalte. In <b>Zeile ${flipped[0] + 1}</b> und in <b>Spalte ${flipped[1] + 1}</b> ist die Anzahl ungerade. Das gekippte Bit liegt genau auf ihrem Schnittpunkt.</p>`,
        info: 'Mit solchen Prüfbits lassen sich Übertragungsfehler nicht nur erkennen, sondern sogar korrigieren (Hamming-Code, Paritätsprüfung).',
      },
      {
        id: 'w1-06', level: 2, title: 'Stapelmaschine', topic: 'Programmierung, Postfix-Notation',
        text: `<p>Die Stapelmaschine arbeitet mit einem Stapel aus Zahlen:</p>
               <ul><li>Ein Zahlenbefehl (z. B. <b>5</b>) legt diese Zahl oben auf den Stapel.</li>
               <li><b>+</b> nimmt die obersten zwei Zahlen vom Stapel und legt ihre Summe oben auf den Stapel.</li>
               <li><b>×</b> macht dasselbe mit dem Produkt.</li></ul>
               <p>Baue ein Programm mit <b>höchstens 7 Befehlen</b>, an dessen Ende nur noch die Zahl <b>41</b> auf dem Stapel liegt. Mit „Programm ausführen“ kannst du deine Idee testen.</p>`,
        widget: { type: 'stack', nums: [2, 3, 5, 7], ops: ['+', '×'], target: 41, max: 7 },
        explain: `<p>Zum Beispiel <span class="mono">5 7 × 3 2 × +</span>: erst 5·7 = 35, dann 3·2 = 6, am Ende 35 + 6 = 41 – genau 7 Befehle. Wichtig ist, 41 sinnvoll zu zerlegen, etwa als 35 + 6.</p>`,
        info: 'Diese „umgekehrte polnische Notation“ braucht keine Klammern. Sie wird in Taschenrechnern und Compilern verwendet.',
      },
      {
        id: 'w1-07', level: 2, title: 'Teiche zählen', topic: 'Algorithmen, Flächen finden',
        text: `<p>Aus der Luft sieht das Revier der Biber so aus: Wasserfelder (<b>~</b>) und Landfelder (<b>.</b>). Ein Teich besteht aus Wasserfeldern, die <b>über Kanten</b> (oben, unten, links, rechts) zusammenhängen. Felder, die sich nur an einer Ecke berühren, gehören <b>nicht</b> zum selben Teich.</p>
               <pre class="map">${pond.join('\n')}</pre>
               <p>Wie viele Teiche gibt es?</p>`,
        widget: { type: 'number', answer: ponds },
        explain: `<p>Man geht das Gitter ab und nummeriert jeden neuen Teich. Es gibt <b>${ponds}</b> getrennte Teiche. Vorsicht bei den diagonalen Nachbarn: Sie zählen nicht als verbunden.</p>`,
        info: 'Solche Zusammenhangskomponenten findet man mit dem Flood-Fill-Algorithmus – er füllt in Zeichenprogrammen Flächen mit Farbe.',
      },
      {
        id: 'w1-08', level: 2, title: 'Klausurenplan', topic: 'Modellierung, Graphenfärbung',
        text: `<p>Die Schule schreibt in einer Woche Klausuren in 7 Fächern. Zwei Fächer dürfen <b>nicht am selben Tag</b> stattfinden, wenn es Schüler gibt, die beide Fächer belegt haben. Das ist im Bild durch eine Linie zwischen den Fächern dargestellt.</p>
               <p>Es stehen nur die drei Tage <b>Montag, Dienstag und Mittwoch</b> zur Verfügung. Verteile die Fächer so auf die Tage, dass es keine Konflikte gibt.</p>`,
        widget: {
          type: 'colorgraph', w: 380, h: 300, nodes: nodes8, edges: edges8,
          colors: [{ name: 'Montag', css: '#f2a65a' }, { name: 'Dienstag', css: '#6fc2b0' }, { name: 'Mittwoch', css: '#9db8f0' }],
        },
        explain: `<p>Drei Fächer, die paarweise verbunden sind (ein „Dreieck“), brauchen drei verschiedene Tage. Von dort aus ergeben sich die anderen Tage Schritt für Schritt. Es gibt mehrere richtige Verteilungen.</p>`,
        info: 'Das Färben von Graphen löst viele Planungsprobleme: Stundenpläne, Frequenzvergabe, Prüfungstermine.',
      },

      /* ---------------- schwer ---------------- */
      {
        id: 'w1-09', level: 3, title: 'Zahlensortierer', topic: 'Algorithmen, Sortiernetzwerke',
        text: `<p>Die Biber bauen eine Maschine, die <b>vier Zahlen</b> sortiert. Die Zahlen laufen auf vier Leitungen von links nach rechts durch Vergleichsbausteine. Ein Baustein vergleicht zwei Leitungen: Die <b>kleinere</b> Zahl läuft oben weiter, die <b>größere</b> unten.</p>
               <p>Baue ein Netzwerk aus <b>höchstens 5 Bausteinen</b>, das für jede mögliche Eingabe die kleinste Zahl auf die oberste und die größte Zahl auf die unterste Leitung bringt – also alle vier Zahlen aufsteigend sortiert.</p>`,
        widget: { type: 'sortnet', wires: 4, slots: 5, solution: [[0, 1], [2, 3], [0, 2], [1, 3], [1, 2]] },
        explain: `<p>Erst vergleicht man die Paare (1↔2) und (3↔4). Danach steht die kleinste Zahl entweder oben auf Leitung 1 oder 3, die größte auf Leitung 2 oder 4. Mit (1↔3) und (2↔4) kommen Minimum und Maximum an die richtigen Stellen, und (2↔3) ordnet die beiden mittleren Zahlen. Weniger als 5 Bausteine reichen für 4 Zahlen nicht aus.</p>`,
        info: 'Sortiernetzwerke vergleichen immer in der gleichen Reihenfolge, egal welche Zahlen kommen. Das macht sie ideal für Hardware und Grafikkarten.',
      },
      {
        id: 'w1-10', level: 3, title: 'Signal-Erkennung', topic: 'Theoretische Informatik, Automaten',
        text: () => `<p>Die Biber senden Signale aus den Buchstaben <b>a</b> und <b>b</b>. Ein Signal ist gültig, wenn es <b>irgendwo die Buchstabenfolge „aba“ enthält</b> (zum Beispiel „bbabab“ oder „aaba“, aber nicht „abbba“).</p>
               <p>Vier Automaten sollen Signale prüfen. Ein Automat startet im Zustand S (Pfeil) und liest das Signal Buchstabe für Buchstabe: Er folgt dem Pfeil mit dem passenden Buchstaben. Endet er nach dem letzten Buchstaben im Zustand E (Doppelkreis), ist das Signal erkannt.</p>
               <p>Nur einer der Automaten erkennt genau die gültigen Signale. Welcher?</p>`,
        widget: {
          type: 'choice', labels: ['Automat A', 'Automat B', 'Automat C', 'Automat D'], correct: [correctAuto],
          options: autos.map((m, i) => `<div class="opt-fig"><b>${'ABCD'[i]}</b>${autoSvg(m)}</div>`),
        },
        explain: `<p>Der richtige Automat „merkt“ sich, wie weit er im Muster „aba“ schon ist: S = noch nichts, A = „a“ gelesen, B = „ab“ gelesen, E = „aba“ gefunden. Wichtig: E darf nie verlassen werden (ein einmal gefundenes „aba“ bleibt im Signal), und nach „ab“ führt ein weiteres „b“ zurück nach S. Die falschen Automaten erkennen z. B. „abbba“ fälschlich oder lehnen „ababb“ ab.</p>`,
        info: 'Endliche Automaten haben nur endlich viele Zustände. Sie stecken in Textsuche, regulären Ausdrücken und Steuerungen.',
      },
      {
        id: 'w1-11', level: 3, title: 'Das Floß', topic: 'Algorithmen, Optimierung',
        text: `<p>Die Biber wollen Holz auf einem Floß über den See bringen. Das Floß trägt höchstens <b>17 kg</b>. Jedes Holzstück hat ein Gewicht und einen Wert für den Dammbau.</p>
               <p>Wähle Holzstücke aus, die zusammen höchstens 17 kg wiegen und den <b>größtmöglichen Gesamtwert</b> haben.</p>`,
        widget: { type: 'knapsack', items: logs, cap: 17 },
        explain: () => { const k = A.knapsack(logs, 17); return `<p>Der höchste erreichbare Wert ist <b>${k.best}</b>. Die Strategie „immer das Stück mit dem besten Wert pro Kilo“ liefert hier nur ${23} und ist damit nicht optimal – man muss Kombinationen vergleichen.</p>`; },
        info: 'Das ist das Rucksackproblem – ein berühmtes Optimierungsproblem. Für große Eingaben kennt man keinen schnellen exakten Algorithmus.',
      },
      {
        id: 'w1-12', level: 3, title: 'Der schwere Zahn', topic: 'Algorithmen, Teile und herrsche',
        text: `<p>Unter <b>28</b> gleich aussehenden Biberzähnen ist genau einer etwas schwerer als die anderen. Die Biber haben eine Balkenwaage (ohne Gewichte): Man legt auf jede Seite beliebig viele Zähne und sieht, welche Seite schwerer ist – oder dass beide gleich schwer sind.</p>
               <p>Wie viele Wägungen braucht man <b>mindestens</b>, um den schweren Zahn <b>garantiert</b> zu finden, egal wie die Zähne liegen?</p>`,
        widget: { type: 'number', answer: 4 },
        explain: `<p>Jede Wägung hat drei mögliche Ergebnisse (links schwerer, rechts schwerer, gleich) und teilt die Zähne in drei Gruppen. Mit 1 Wägung findet man den Zahn unter 3, mit 2 unter 9, mit 3 unter 27 – für 28 Zähne reicht das nicht mehr. Man braucht <b>4 Wägungen</b>.</p>`,
        info: 'Wenn jeder Schritt die Möglichkeiten durch 3 teilt, wächst die Zahl der lösbaren Fälle wie 3, 9, 27, 81 … – das ist die Idee hinter Suchalgorithmen.',
      },
    ],
  });
})(window.Biber = window.Biber || {});
