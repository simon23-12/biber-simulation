/* Klassenstufe 6: drei Wettbewerbe (je 10 Aufgaben: 4× leicht, 3× mittel, 3× schwer) */
(function (B) {
  'use strict';
  const A = B.algo;
  B.contests = B.contests || [];

  const perms = a => (a.length < 2 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p])));
  const encode = row => {
    const runs = []; let cur = '.', n = 0;
    for (const ch of row) { if (ch === cur) n++; else { runs.push(n); cur = ch; n = 1; } }
    runs.push(n); return runs;
  };
  const blackOf = runs => runs.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0);

  /* =====================================================================
     Wettbewerb 1 – Muster und Wege
     ===================================================================== */

  /* k1-01 Roboter */
  const robot1 = { size: [4, 4], start: [3, 0], goal: [0, 3], items: [[1, 2]], walls: [[2, 1], [2, 2], [0, 1]] };
  robot1.max = A.robotSolve(Object.assign({ max: 12 }, robot1)).length;

  /* k1-05 Tannenbaum */
  const tree = ['..##..', '.####.', '######', '..##..', '..##..', '......'];

  /* k1-06 Weg */
  const wN = [['S', 40, 130], ['A', 160, 50], ['B', 160, 210], ['C', 300, 50], ['D', 300, 210], ['T', 430, 130]].map(([id, x, y]) => ({ id, x, y }));
  const wE = [['S', 'A', 3], ['S', 'B', 2], ['A', 'B', 1], ['A', 'C', 4], ['B', 'C', 6], ['B', 'D', 7], ['C', 'D', 2], ['C', 'T', 5], ['D', 'T', 3]];
  const wDist = A.dijkstra(wE, 'S', 'T');

  /* k1-08 Sitzordnung */
  const people = ['Anna', 'Ben', 'Cleo', 'Dino', 'Emma'];
  const seatRules = [
    ['Ben sitzt direkt neben Anna.', p => Math.abs(p[0] - p[1]) === 1],
    ['Cleo sitzt weiter rechts als Anna.', p => p[2] > p[0]],
    ['Dino sitzt nicht direkt neben Emma.', p => Math.abs(p[3] - p[4]) !== 1],
    ['Emma sitzt nicht ganz außen (also nicht auf Platz 1 und nicht auf Platz 5).', p => p[4] !== 0 && p[4] !== 4],
    ['Anna sitzt nicht auf Platz 1.', p => p[0] !== 0],
  ];
  const seatSols = perms([0, 1, 2, 3, 4]).filter(s => {
    const p = {}; s.forEach((x, i) => { p[x] = i; });
    return seatRules.every(r => r[1](p));
  });
  const seatOrder = seatSols[0];

  /* k1-09 Floß */
  const logs = [['Kiefer', 6, 10], ['Birke', 5, 8], ['Erle', 5, 8], ['Weide', 2, 3], ['Eiche', 4, 6]].map(([name, w, v]) => ({ name, w, v }));

  B.contests.push({
    id: 'k1', grade: 6,
    title: 'Wettbewerb 1',
    subtitle: 'Muster und Wege',
    blurb: 'Den Biber zur Burg führen, Zahlen und Geheimschrift entschlüsseln – am Ende warten Logikrätsel und die Brücke bei Nacht.',
    tasks: [
      /* ---------------- leicht ---------------- */
      {
        id: 'k1-01', level: 1, title: 'Zur Biberburg', topic: 'Programmierung, Sequenz',
        text: `<p>Der Biber 🦫 möchte zu seiner Burg 🏠. Unterwegs muss er das Holzstück 🪵 einsammeln. Die Bäume 🌳 sind im Weg.</p>
               <p>Baue ein Programm aus den Befehlen <b>↑ ↓ ← →</b>. Jeder Befehl bewegt den Biber um <b>ein Feld</b>. Das Programm darf <b>höchstens ${robot1.max} Befehle</b> lang sein. Mit „Programm testen“ siehst du, wohin der Biber läuft.</p>`,
        widget: Object.assign({ type: 'robot' }, robot1),
        explain: `<p>Das Holzstück liegt in Zeile 2, Spalte 3. Vom Start (Zeile 4, Spalte 1) sind es 2 Schritte nach oben und 2 nach rechts. Danach geht es 1 Feld hoch und 1 Feld nach rechts zur Burg. Zusammen sind das <b>${robot1.max} Befehle</b> – kürzer geht es nicht.</p>`,
        info: 'Ein Programm ist eine Folge von genauen Anweisungen. Der Computer macht genau das, was dort steht – nicht mehr und nicht weniger.',
      },
      {
        id: 'k1-02', level: 1, title: 'Biber-Zähler', topic: 'Zahlendarstellung, Binärsystem',
        text: `<p>Der Biber-Zähler hat fünf Lampen. Jede Lampe hat einen festen Wert (steht unter der Lampe). Die angezeigte Zahl ist die <b>Summe der Werte aller leuchtenden Lampen</b>.</p>
               <p>Schalte die Lampen so, dass der Zähler <b>19</b> anzeigt.</p>`,
        widget: { type: 'lamps', values: [16, 8, 4, 2, 1], target: 19 },
        explain: `<p>19 = 16 + 2 + 1. Man nimmt zuerst die größte Lampe, die noch passt (16). Es fehlen 3. Dafür nimmt man 2 und 1.</p>`,
        info: 'Computer speichern Zahlen mit „an“ und „aus“. Jede Stelle hat dabei einen Wert, der doppelt so groß ist wie der der Stelle rechts davon.',
      },
      {
        id: 'k1-03', level: 1, title: 'Holzstapel-Folge', topic: 'Muster erkennen',
        text: `<p>Der Biber legt jeden Tag einen neuen Holzstapel an. Die Stapel haben nacheinander diese Anzahl an Stämmen:</p>
               <p class="center big"><b>2 &nbsp; 5 &nbsp; 11 &nbsp; 23 &nbsp; ?</b></p>
               <p>Es gibt eine feste Regel, nach der aus jeder Zahl die nächste entsteht. Wie viele Stämme hat der <b>nächste</b> Stapel?</p>`,
        widget: { type: 'number', answer: 47 },
        explain: `<p>Die Regel lautet: <b>mal 2, dann plus 1</b>. Probe: 2·2+1 = 5, 5·2+1 = 11, 11·2+1 = 23. Also folgt 23·2+1 = <b>47</b>.</p>`,
        info: 'Das Erkennen von Regeln und Mustern ist die Grundlage jedes Algorithmus: Wer die Regel kennt, kann beliebig weiterrechnen.',
      },
      {
        id: 'k1-04', level: 1, title: 'Geheimschrift', topic: 'Kodierung, Verschlüsselung',
        text: `<p>Die Biber schicken sich Geheimbotschaften. Dabei wird <b>jeder Buchstabe durch den nächsten im Alphabet</b> ersetzt. Aus <b>HAUS</b> wird so <b>IBVT</b>.</p>
               <p>Biber Bella hat die Nachricht <b>SBVN</b> bekommen. Wie lautet das ursprüngliche Wort?</p>`,
        widget: { type: 'text', answers: ['RAUM'], placeholder: 'Wort in Großbuchstaben' },
        explain: `<p>Zum Entschlüsseln geht man bei jedem Buchstaben <b>einen Schritt zurück</b> im Alphabet: S→R, B→A, V→U, N→M. Das Wort lautet <b>RAUM</b>.</p>`,
        info: 'Schon die alten Römer haben so verschlüsselt (Caesar-Chiffre). Zum Entschlüsseln muss man die Regel kennen und rückwärts anwenden.',
      },

      /* ---------------- mittel ---------------- */
      {
        id: 'k1-05', level: 2, title: 'Tannenbaum im Kurzcode', topic: 'Kodierung, Bilder',
        text: `<p>Ein Schwarz-Weiß-Bild ist 6 Pixel breit und 6 Zeilen hoch. Jede Zeile ist als Zahlenfolge gespeichert: Die erste Zahl sagt, wie viele <b>weiße</b> Pixel zuerst kommen (das kann auch 0 sein). Dann folgen abwechselnd <b>schwarze</b> und <b>weiße</b> Pixel.</p>
               <p><i>Beispiel:</i> „1 4 1“ bedeutet 1 weißes, 4 schwarze und 1 weißes Pixel.</p>
               <pre>${tree.map((r, i) => `Zeile ${i + 1}:  ${encode(r).join(' ')}`).join('\n')}</pre>
               <p>Male das Bild: Klicke die Felder an, die <b>schwarz</b> sein sollen.</p>`,
        widget: { type: 'paint', target: tree },
        explain: `<p>Zeile für Zeile: erst die weißen Felder überspringen, dann die genannte Anzahl Felder schwarz färben, dann wieder weiß. Zeile 3 beginnt mit „0“ – hier ist gleich das erste Feld schwarz. Zeile 6 besteht nur aus weißen Pixeln. Es entsteht ein Tannenbaum 🌲.</p>`,
        info: 'Diese Methode heißt Lauflängenkodierung. Sie spart bei Bildern mit großen einfarbigen Flächen viel Speicherplatz.',
      },
      {
        id: 'k1-06', level: 2, title: 'Der schnellste Weg', topic: 'Algorithmen, Graphen',
        text: () => `<p>Zwischen den Teichen S, A, B, C, D und T haben die Biber Kanäle gegraben. Die Zahl an einem Kanal sagt, wie viele Minuten das Schwimmen durch diesen Kanal dauert.</p>
               <div class="figure">${B.graphSvg(wN, wE.map(([a, b, w]) => ({ a, b, label: w })), { w: 480, h: 260, label: 'Kanalnetz' })}</div>
               <p>Wie viele Minuten braucht der Biber <b>mindestens</b> von S nach T?</p>`,
        widget: { type: 'number', answer: wDist.dist, unit: 'Minuten' },
        explain: `<p>Du kannst alle Wege ausprobieren und die Zeiten zusammenzählen. Zum Beispiel: S–A–C–T = 3 + 4 + 5 = <b>12</b>. S–B–C–T dauert 2 + 6 + 5 = 13 Minuten, S–A–B–C–T sogar 15. Der kürzeste Weg hat nicht die wenigsten Kanäle, sondern die kleinste Summe. Schneller als 12 Minuten geht es nicht.</p>`,
        info: 'Navigations-Apps suchen genau so nach kürzesten Wegen – nur in viel größeren Netzen aus Straßen. Der Algorithmus von Dijkstra macht das geschickt.',
      },
      {
        id: 'k1-07', level: 2, title: 'Stapelmaschine', topic: 'Programmierung, Rechnen mit Stapel',
        text: `<p>Die Stapelmaschine legt Zahlen auf einen Stapel:</p>
               <ul><li>Eine Zahl (z. B. <b>3</b>) wird oben auf den Stapel gelegt.</li>
               <li><b>+</b> nimmt die obersten zwei Zahlen weg und legt ihre Summe oben auf den Stapel.</li>
               <li><b>×</b> macht dasselbe mit dem Produkt.</li></ul>
               <p><i>Beispiel:</i> <span class="mono">2 3 +</span> legt erst 2, dann 3 auf den Stapel und rechnet dann 2 + 3 = 5.</p>
               <p>Baue ein Programm mit <b>höchstens 5 Befehlen</b>, das am Ende nur noch die Zahl <b>29</b> auf dem Stapel hat. Zahlen darfst du mehrfach benutzen.</p>`,
        widget: { type: 'stack', nums: [3, 4, 5], ops: ['+', '×'], target: 29, max: 5 },
        explain: `<p>Eine Lösung ist <span class="mono">4 5 5 × +</span>: erst 5 · 5 = 25, dann 4 + 25 = 29 – genau 5 Befehle. Der Trick: 29 = 25 + 4 und 25 = 5 · 5.</p>`,
        info: 'Rechner mit Stapel brauchen keine Klammern. Diese „umgekehrte polnische Notation“ wird in Taschenrechnern und Compilern benutzt.',
      },

      /* ---------------- schwer ---------------- */
      {
        id: 'k1-08', level: 3, title: 'Wer sitzt wo?', topic: 'Logik, Zuordnung',
        text: `<p>Fünf Biber sitzen nebeneinander auf Bänken mit den Plätzen 1 bis 5 (von links nach rechts): Anna, Ben, Cleo, Dino und Emma. Es gilt:</p>
               <ul>${seatRules.map(r => `<li>${r[0]}</li>`).join('')}</ul>
               <p>Wer sitzt auf <b>Platz 4</b>?</p>`,
        widget: { type: 'choice', cols: 3, options: people, correct: [seatOrder[3]] },
        explain: `<p>Emma darf nicht außen sitzen, und Dino darf nicht neben ihr sitzen. Probiert man das systematisch durch, bleibt nur eine Sitzordnung übrig: <b>${seatOrder.map(i => people[i]).join(' – ')}</b> (Plätze 1 bis 5). Auf Platz 4 sitzt also <b>${people[seatOrder[3]]}</b>.</p>`,
        info: 'Beim Lösen von Logikrätseln schließt man Möglichkeiten Stück für Stück aus. Computer testen dafür oft einfach alle Möglichkeiten durch.',
      },
      {
        id: 'k1-09', level: 3, title: 'Das Floß', topic: 'Algorithmen, Optimierung',
        text: `<p>Die Biber wollen Holz auf einem Floß über den See bringen. Das Floß trägt höchstens <b>10 kg</b>. Jedes Holzstück hat ein Gewicht und einen Wert für den Dammbau.</p>
               <p>Wähle Holzstücke, die zusammen höchstens 10 kg wiegen und den <b>größtmöglichen Gesamtwert</b> haben.</p>`,
        widget: { type: 'knapsack', items: logs, cap: 10 },
        explain: `<p>Der höchste erreichbare Wert ist <b>${A.knapsack(logs, 10).best}</b> (Birke + Erle, zusammen 10 kg). Wer zuerst das wertvollste Stück (Kiefer, Wert 10) nimmt, kann nur noch die Weide mitnehmen (Wert 3) und kommt auf 13. Man muss also Kombinationen vergleichen.</p>`,
        info: 'Das ist das Rucksackproblem. Für sehr viele Gegenstände kennt man keinen schnellen Weg, die beste Auswahl zu finden.',
      },
      {
        id: 'k1-10', level: 3, title: 'Brücke bei Nacht', topic: 'Algorithmen, Planen',
        text: `<p>Vier Biber müssen nachts über eine schmale Brücke. Sie haben nur <b>eine Laterne</b>. Die Brücke hält höchstens <b>zwei Biber</b> gleichzeitig, und ohne Laterne darf niemand die Brücke betreten. Gehen zwei Biber zusammen, so müssen sie im Tempo des Langsameren gehen.</p>
               <p>Die Biber brauchen allein für die Brücke: <b>1, 2, 5 und 10 Minuten</b>.</p>
               <p>Wie viele Minuten brauchen alle vier <b>mindestens</b>, bis sie auf der anderen Seite sind? (Die Laterne muss auch immer wieder zurückgebracht werden.)</p>`,
        widget: { type: 'number', answer: 17, unit: 'Minuten' },
        explain: `<p>Die beiden Langsamsten (5 und 10) sollten <b>zusammen</b> gehen, damit ihre Zeiten nicht doppelt zählen. Plan: 1 und 2 gehen hinüber (2 min), 1 bringt die Laterne zurück (1 min), 5 und 10 gehen hinüber (10 min), 2 bringt die Laterne zurück (2 min), 1 und 2 gehen noch einmal hinüber (2 min). Das sind zusammen 2 + 1 + 10 + 2 + 2 = <b>17 Minuten</b>. Der Plan „der Schnellste bringt alle einzeln“ dauert dagegen 19 Minuten.</p>`,
        info: 'Die beste Lösung ist oft nicht die naheliegende. In der Informatik zeigt man mit Beweisen, dass es nicht besser geht.',
      },
    ],
  });

  /* =====================================================================
     Wettbewerb 2 – Daten, Logik und Strategie
     ===================================================================== */

  /* k2-01 Tabelle */
  const tab = [['Bruno', 7, 'Schwimmen'], ['Bella', 5, 'Klettern'], ['Benno', 8, 'Schwimmen'], ['Biene', 6, 'Schwimmen'], ['Boris', 4, 'Schwimmen'],
    ['Berta', 9, 'Klettern'], ['Bodo', 6, 'Klettern'], ['Bibi', 10, 'Schwimmen']];
  const tabCount = tab.filter(r => r[1] >= 6 && r[2] === 'Schwimmen').length;
  const tabHtml = '<table class="data"><thead><tr><th>Name</th><th>Alter</th><th>Hobby</th></tr></thead><tbody>' + tab.map(r => '<tr>' + r.map(x => `<td>${x}</td>`).join('') + '</tr>').join('') + '</tbody></table>';

  /* k2-02 Lichterkette */
  const colors = ['Rot', 'Gelb', 'Grün', 'Blau'], lampNo = 27;
  const lampColor = (lampNo - 1) % 4;

  /* k2-03 Schatzkarte */
  const t0 = [4, 1], moves = [['rechts', 3, 0, 1], ['oben', 2, -1, 0], ['links', 1, 0, -1], ['unten', 1, 1, 0], ['rechts', 2, 0, 1]];
  const treasure = moves.reduce((p, m) => [p[0] + m[2] * m[1], p[1] + m[3] * m[1]], t0.slice());

  /* k2-04 Schleifen-Zahl */
  let zz = 3; for (let i = 0; i < 4; i++) zz = zz * 2 - 1;

  /* k2-05 Spiegelbild-Fehler */
  const leftHalf = ['#.#', '###', '.##', '#..', '.#.', '###'];
  const mirrored = leftHalf.map(r => r + [...r].reverse().join(''));
  const wrongCell = [3, 4];
  const faulty = mirrored.map(r => [...r]); faulty[wrongCell[0]][wrongCell[1]] = faulty[wrongCell[0]][wrongCell[1]] === '#' ? '.' : '#';

  /* k2-08 Wer war's? */
  const sus = ['Anton', 'Berta', 'Carlo', 'Dora'];
  const says = [['„Berta war es.“'], ['„Carlo war es.“'], ['„Berta lügt.“'], ['„Ich war es nicht.“']];
  /* Carlos Aussage ist genau dann wahr, wenn Bertas Aussage falsch ist */
  const truthOf = w => {
    const t = [w === 1, w === 2, null, w !== 3];
    t[2] = !t[1];
    return t;
  };
  const culprits = [0, 1, 2, 3].filter(w => truthOf(w).filter(x => !x).length === 1);

  /* k2-09 Aquarium */
  const fishN = [['A', 70, 70], ['B', 190, 150], ['C', 70, 230], ['D', 310, 70], ['E', 310, 230], ['F', 410, 150]].map(([id, x, y]) => ({ id, label: id, x, y }));
  const fishE = [['A', 'B'], ['A', 'C'], ['B', 'C'], ['B', 'D'], ['C', 'E'], ['D', 'E'], ['D', 'F'], ['E', 'F']];

  B.contests.push({
    id: 'k2', grade: 6,
    title: 'Wettbewerb 2',
    subtitle: 'Daten, Logik und Strategie',
    blurb: 'Tabellen auswerten, Muster und Fehler finden, Turniere zählen – und am Ende Detektivarbeit und die Türme von Hanoi.',
    tasks: [
      /* ---------------- leicht ---------------- */
      {
        id: 'k2-01', level: 1, title: 'Biber-Tabelle', topic: 'Daten, Tabellen filtern',
        text: `<p>Die Biber führen eine Liste über ihre Familie:</p>${tabHtml}
               <p>Gesucht sind alle Biber, die <b>mindestens 6 Jahre alt</b> sind <b>und</b> deren Hobby <b>Schwimmen</b> ist. Beide Bedingungen müssen zutreffen.</p>
               <p>Wie viele Biber sind das?</p>`,
        widget: { type: 'number', answer: tabCount },
        explain: `<p>Man prüft Zeile für Zeile beide Bedingungen. Es passen: ${tab.filter(r => r[1] >= 6 && r[2] === 'Schwimmen').map(r => r[0]).join(', ')} – das sind <b>${tabCount}</b> Biber. Boris schwimmt auch gern, ist aber erst 4. Berta und Bodo sind alt genug, klettern aber lieber.</p>`,
        info: 'Datenbanken filtern Daten mit Bedingungen, die mit „UND“ verknüpft sind. Nur Zeilen, die alle Bedingungen erfüllen, bleiben übrig.',
      },
      {
        id: 'k2-02', level: 1, title: 'Lichterkette', topic: 'Muster, Wiederholung',
        text: `<p>Die Lichterkette am Biberbau wiederholt immer dieselbe Farbfolge:</p>
               <p class="center big">🔴 Rot → 🟡 Gelb → 🟢 Grün → 🔵 Blau → 🔴 Rot → 🟡 Gelb → …</p>
               <p>Die erste Lampe ist rot. Welche Farbe hat die <b>${lampNo}. Lampe</b>?</p>`,
        widget: { type: 'choice', cols: 2, options: ['🔴 Rot', '🟡 Gelb', '🟢 Grün', '🔵 Blau'], correct: [lampColor] },
        explain: `<p>Die Farbfolge hat 4 Lampen. ${lampNo} : 4 = 6 Rest ${lampNo % 4}. Nach 6 vollen Runden (24 Lampen) kommen noch ${lampNo - 24} Lampen: Rot, Gelb, <b>${colors[lampColor]}</b>.</p>`,
        info: 'Wiederholungen berechnet man mit dem Rest einer Division (Modulo). Das nutzt jedes Programm, das etwas regelmäßig wiederholt.',
      },
      {
        id: 'k2-03', level: 1, title: 'Schatzkarte', topic: 'Orientierung, Anweisungen',
        text: `<p>Der Biber 🦫 startet auf dem markierten Feld und folgt dieser Wegbeschreibung (jede Anweisung bewegt ihn Feld für Feld):</p>
               <pre>${moves.map((m, i) => `${i + 1}. ${m[1]} Feld${m[1] > 1 ? 'er' : ''} nach ${m[0]}`).join('\n')}</pre>
               <p>Dort liegt der Schatz. Klicke auf das Feld mit dem Schatz.</p>`,
        widget: {
          type: 'gridclick', rows: 6, cols: 6, correct: treasure,
          cell: (r, c) => (r === t0[0] && c === t0[1] ? { html: '🦫', cls: 'start' } : {}),
        },
        explain: `<p>Start: Zeile ${t0[0] + 1}, Spalte ${t0[1] + 1}. Nach 3× rechts: Spalte 5. 2× oben: Zeile 3. 1× links: Spalte 4. 1× unten: Zeile 4. 2× rechts: Spalte 6. Der Schatz liegt in <b>Zeile ${treasure[0] + 1}, Spalte ${treasure[1] + 1}</b>.</p>`,
        info: 'Wegbeschreibungen sind kleine Programme. Man kann sie genau nachverfolgen, indem man Schritt für Schritt aufschreibt, wo man steht.',
      },
      {
        id: 'k2-04', level: 1, title: 'Zahlenmaschine', topic: 'Programmierung, Schleifen',
        text: `<p>Der Biber lässt einen kleinen Computer dieses Programm ausführen:</p>
               <pre>z ← 3
wiederhole 4 mal:
    z ← z × 2 − 1</pre>
               <p>Der Pfeil bedeutet: „Berechne die rechte Seite und speichere das Ergebnis in z.“ Welche Zahl steht am Ende in <b>z</b>?</p>`,
        widget: { type: 'number', answer: zz },
        explain: `<p>Man rechnet jeden Durchlauf einzeln: 3 → 3·2−1 = 5 → 5·2−1 = 9 → 9·2−1 = 17 → 17·2−1 = <b>${zz}</b>.</p>`,
        info: 'Bei Schleifen schreibt man sich den Wert der Variablen nach jedem Durchlauf auf. So findet man auch Fehler in fremden Programmen.',
      },

      /* ---------------- mittel ---------------- */
      {
        id: 'k2-05', level: 2, title: 'Spiegelfehler', topic: 'Muster, Symmetrie',
        text: `<p>Dieses Muster soll <b>symmetrisch</b> sein: Die rechte Hälfte (rechts von der dicken Linie) ist das Spiegelbild der linken Hälfte. Die linke Hälfte ist richtig. In der <b>rechten</b> Hälfte hat sich aber <b>ein Feld</b> verfärbt.</p>
               <p>Klicke auf das falsche Feld.</p>`,
        widget: {
          type: 'gridclick', rows: 6, cols: 6, correct: wrongCell,
          cell: (r, c) => ({ html: '', cls: 'bit' + (faulty[r][c] === '#' ? ' fill' : '') + (c === 2 ? ' sep' : '') }),
        },
        explain: `<p>Beim Spiegeln müssen sich Feld 1 und Feld 6, Feld 2 und Feld 5, Feld 3 und Feld 4 jeder Zeile entsprechen. In <b>Zeile ${wrongCell[0] + 1}</b> passt das <b>Feld in Spalte ${wrongCell[1] + 1}</b> nicht zu seinem Spiegelfeld in Spalte ${5 - wrongCell[1] + 1}.</p>`,
        info: 'Prüfbits und Symmetrien helfen, Fehler in Daten zu finden: Passt etwas nicht zur Regel, ist irgendwo ein Fehler.',
      },
      {
        id: 'k2-06', level: 2, title: 'Zahlen raten', topic: 'Algorithmen, Halbieren',
        text: `<p>Biber Bruno denkt sich eine Zahl zwischen <b>1 und 64</b> aus. Du darfst Fragen stellen, die er nur mit „Ja“ oder „Nein“ beantwortet, zum Beispiel: „Ist die Zahl größer als 32?“</p>
               <p>Wie viele Fragen reichen <b>höchstens</b>, um die Zahl <b>sicher</b> zu finden, wenn du immer klug fragst?</p>`,
        widget: { type: 'number', answer: 6 },
        explain: `<p>Mit jeder klugen Frage halbierst du die Zahl der übrigen Möglichkeiten: 64 → 32 → 16 → 8 → 4 → 2 → 1. Das sind <b>6 Fragen</b>. (Fragen wie „Ist es die 17?“ sind dagegen wenig klug.)</p>`,
        info: 'Dieses Halbieren heißt „binäre Suche“. Computer finden so einen Namen in einer Million Einträgen mit nur etwa 20 Schritten.',
      },
      {
        id: 'k2-07', level: 2, title: 'Biber-Turnier', topic: 'Zählen, Kombinatorik',
        text: `<p>Beim Turnier treten <b>7 Biber</b> an. Jeder spielt <b>genau einmal gegen jeden anderen</b>.</p>
               <p>Wie viele Spiele finden insgesamt statt?</p>`,
        widget: { type: 'number', answer: 21 },
        explain: `<p>Jeder der 7 Biber hat 6 Gegner. Das wären 7 · 6 = 42 „Spielpaarungen“, aber jedes Spiel wurde dabei zweimal gezählt (A gegen B und B gegen A). Also gibt es 42 : 2 = <b>21</b> Spiele. Oder man zählt: 6 + 5 + 4 + 3 + 2 + 1 = 21.</p>`,
        info: 'Solche Zählaufgaben treten auf, wenn man Netzwerke baut: n Computer, die alle direkt miteinander verbunden sind, brauchen so viele Kabel.',
      },

      /* ---------------- schwer ---------------- */
      {
        id: 'k2-08', level: 3, title: 'Wer war’s?', topic: 'Logik, Aussagen prüfen',
        text: `<p>Jemand hat den Damm beschädigt! Es war genau einer der vier Biber Anton, Berta, Carlo und Dora. Die Biber sagen:</p>
               <ul><li><b>Anton:</b> ${says[0][0]}</li><li><b>Berta:</b> ${says[1][0]}</li><li><b>Carlo:</b> ${says[2][0]}</li><li><b>Dora:</b> ${says[3][0]}</li></ul>
               <p>Genau <b>ein</b> Biber lügt, die anderen drei sagen die Wahrheit. Wer hat den Damm beschädigt?</p>`,
        widget: { type: 'choice', cols: 4, options: sus, correct: [culprits[0]] },
        explain: `<p>Man nimmt der Reihe nach an, wer es war, und zählt, wie viele Aussagen dann falsch sind. Wenn es <b>${sus[culprits[0]]}</b> war, stimmen Antons, Carlos und Doras Aussage; nur Berta lügt (denn Carlo war es nicht). Das ist genau ein Lügner. Bei Anton, Carlo oder Dora als Täter gäbe es jeweils mehr als einen Lügner.</p>`,
        info: 'Detektive und Computer prüfen so „Annahmen“: Man nimmt etwas an und sieht nach, ob es zu allen Angaben passt.',
      },
      {
        id: 'k2-09', level: 3, title: 'Aquarium', topic: 'Modellierung, Färben von Graphen',
        text: `<p>Im Biber-Aquarium sollen die Fische A bis F in <b>drei Becken</b> schwimmen. Zwischen zwei Fischen, die durch eine Linie verbunden sind, gibt es Streit. Sie dürfen <b>nicht im selben Becken</b> sein.</p>
               <p>Verteile die Fische so auf die Becken, dass es keinen Streit gibt.</p>`,
        widget: {
          type: 'colorgraph', w: 480, h: 300, nodes: fishN, edges: fishE, hint: 'ein Becken',
          colors: [{ name: 'Becken 1', css: '#f2a65a' }, { name: 'Becken 2', css: '#6fc2b0' }, { name: 'Becken 3', css: '#9db8f0' }],
        },
        explain: `<p>A, B und C sind paarweise verbunden – sie brauchen drei verschiedene Becken. Dasselbe gilt für D, E und F. Von dort aus ergibt sich der Rest Schritt für Schritt. Eine mögliche Verteilung: Becken 1: A, D – Becken 2: B, E – Becken 3: C, F. Es gibt mehrere richtige Lösungen.</p>`,
        info: 'Dieses „Färben von Graphen“ hilft bei Stundenplänen, Prüfungsterminen und Frequenzen beim Mobilfunk.',
      },
      {
        id: 'k2-10', level: 3, title: 'Türme von Hanoi', topic: 'Algorithmen, Rekursion',
        text: `<p>Auf dem ersten von drei Pfählen liegen <b>4 Holzscheiben</b>, die größte unten, die kleinste oben. Die Biber wollen den ganzen Turm auf den dritten Pfahl umziehen. Dabei gilt:</p>
               <ul><li>In jedem Zug wird <b>eine</b> Scheibe bewegt (die oberste eines Pfahls).</li>
               <li>Nie darf eine größere Scheibe auf einer kleineren liegen.</li></ul>
               <p>Wie viele Züge braucht man <b>mindestens</b>?</p>
               <p class="hint">Tipp: Probiere es zuerst mit 1, 2 und 3 Scheiben aus. Mit 1 Scheibe braucht man 1 Zug, mit 2 Scheiben 3 Züge.</p>`,
        widget: { type: 'number', answer: 15 },
        explain: `<p>Für n Scheiben braucht man: erst die oberen n−1 Scheiben beiseite bringen, dann die größte bewegen (1 Zug), dann die n−1 Scheiben wieder daraufsetzen. Zugzahlen: 1 → 3 → 7 → <b>15</b> (immer „Vorgänger · 2 + 1“).</p>`,
        info: 'Die Türme von Hanoi sind das Standardbeispiel für Rekursion: Ein großes Problem wird auf dasselbe Problem mit weniger Scheiben zurückgeführt.',
      },
    ],
  });

  /* =====================================================================
     Wettbewerb 3 – Rätsel und Knobeleien
     ===================================================================== */

  /* k3-01 Schleife */
  const dirs = [[-1, 0], [0, 1], [1, 0], [0, -1]]; // oben, rechts, unten, links
  let pos = [4, 1], face = 0;
  for (let i = 0; i < 2; i++) { pos = [pos[0] + dirs[face][0] * 3, pos[1] + dirs[face][1] * 3]; face = (face + 1) % 4; }
  pos = [pos[0] + dirs[face][0], pos[1] + dirs[face][1]];

  /* k3-02 Nummern-Code */
  const codeWord = 'FISCH';
  const code = [...codeWord].map(ch => ch.charCodeAt(0) - 64).join('-');

  /* k3-04 Teiche */
  const pond = ['~..~.~', '~~.~..', '...~~.', '.~....', '.~~..~'];
  const ponds = A.countRegions(pond, '~');

  /* k3-05 Pokal */
  const half = ['#.#', '###', '.##', '.##', '..#', '..#'];
  const cup = half.map(r => r + [...r].reverse().join(''));

  /* k3-06 Kreisspiel */
  const ring = [1, 2, 3, 4, 5, 6, 7];
  const out = [];
  { /* start = Index des Bibers, der „eins“ sagt; der folgende Biber sagt „zwei“ und scheidet aus */
    const circle = ring.slice(); let start = 0;
    while (circle.length > 1) {
      const gone = (start + 1) % circle.length;
      out.push(circle.splice(gone, 1)[0]);
      start = gone % circle.length;
    }
    out.push(circle[0]);
  }
  const ringNodes = ring.map((n, k) => { const a = -Math.PI / 2 + k * 2 * Math.PI / 7; return { id: String(n), label: String(n), x: Math.round(190 + 120 * Math.cos(a)), y: Math.round(150 + 115 * Math.sin(a)) }; });

  /* k3-07 Kurzcode */
  const rle = [[3, 2, 3], [1, 2, 2, 2, 1], [0, 8], [1, 2, 2, 2, 1], [3, 2, 3]];
  const rleBlack = rle.reduce((t, r) => t + blackOf(r), 0);

  /* k3-08 Streichhölzer */
  const matchStart = 13;
  const matchMoves = [1, 2, 3].filter(k => (matchStart - k) % 4 === 0);

  /* k3-09 Tauschen */
  const swapList = [4, 3, 5, 1, 2];
  let inversions = 0; for (let i = 0; i < swapList.length; i++) for (let j = i + 1; j < swapList.length; j++) if (swapList[i] > swapList[j]) inversions++;

  /* k3-10 Krüge: Breitensuche */
  const jugs = (() => {
    const key = s => s.join(','), seen = new Map([[key([0, 0]), 0]]);
    let front = [[0, 0]];
    while (front.length) {
      const next = [];
      for (const [a, b] of front) {
        if (a === 4) return seen.get(key([a, b]));
        const cand = [[5, b], [a, 3], [0, b], [a, 0], [a - Math.min(a, 3 - b), b + Math.min(a, 3 - b)], [a + Math.min(b, 5 - a), b - Math.min(b, 5 - a)]];
        for (const c of cand) if (!seen.has(key(c))) { seen.set(key(c), seen.get(key([a, b])) + 1); next.push(c); }
      }
      front = next;
    }
    return null;
  })();

  B.contests.push({
    id: 'k3', grade: 6,
    title: 'Wettbewerb 3',
    subtitle: 'Rätsel und Knobeleien',
    blurb: 'Programme nachverfolgen, Geheimcodes lesen, Teiche zählen – und zum Schluss Streichholz-Strategie und Wasserkrüge.',
    tasks: [
      /* ---------------- leicht ---------------- */
      {
        id: 'k3-01', level: 1, title: 'Schleifen-Biber', topic: 'Programmierung, Wiederholung',
        text: `<p>Der Biber 🦫 steht auf dem markierten Feld und schaut nach oben (↑). Er führt dieses Programm aus:</p>
               <pre>wiederhole 2 mal:
    gehe 3 Felder vor
    drehe dich um 90° nach rechts
gehe 1 Feld vor</pre>
               <p>Auf welchem Feld steht der Biber am Ende? Klicke es an.</p>`,
        widget: {
          type: 'gridclick', rows: 6, cols: 6, correct: pos,
          cell: (r, c) => (r === 4 && c === 1 ? { html: '🦫<small>↑</small>', cls: 'start' } : {}),
        },
        explain: `<p>Start: Zeile 5, Spalte 2, Blick nach oben. 1. Durchlauf: 3 Felder hoch (Zeile 2), dann nach rechts drehen. 2. Durchlauf: 3 Felder nach rechts (Spalte 5), dann nach unten drehen. Zum Schluss 1 Feld nach unten: <b>Zeile ${pos[0] + 1}, Spalte ${pos[1] + 1}</b>.</p>`,
        info: 'Mit Schleifen kann man gleiche Abläufe kurz hinschreiben. Beim Nachverfolgen hilft es, jeden Durchlauf einzeln aufzuschreiben.',
      },
      {
        id: 'k3-02', level: 1, title: 'Zahlen-Code', topic: 'Kodierung, Zahlen und Buchstaben',
        text: `<p>Die Biber schreiben Wörter als Zahlen: Jeder Buchstabe wird durch seine <b>Nummer im Alphabet</b> ersetzt (A = 1, B = 2, C = 3, …). Die Zahlen sind durch Striche getrennt.</p>
               <p><i>Beispiel:</i> BAD = 2-1-4.</p>
               <p>Biber Bella hat diese Nachricht bekommen: <b>${code}</b></p>
               <p>Wie lautet das Wort?</p>`,
        widget: { type: 'text', answers: [codeWord], placeholder: 'Wort in Großbuchstaben' },
        explain: `<p>Man übersetzt Zahl für Zahl zurück: ${[...codeWord].map(ch => `${ch.charCodeAt(0) - 64} = ${ch}`).join(', ')}. Das Wort lautet <b>${codeWord}</b>.</p>`,
        info: 'Computer speichern Buchstaben als Zahlen. In der Tabelle „ASCII“ steht für jedes Zeichen eine feste Nummer.',
      },
      {
        id: 'k3-03', level: 1, title: 'Rechenmaschine', topic: 'Funktionen, Muster',
        text: `<p>Die Rechenmaschine der Biber macht aus jeder Eingabezahl immer nach derselben Regel eine Ausgabezahl:</p>
               <table class="data"><thead><tr><th>Eingabe</th><th>3</th><th>5</th><th>8</th><th>10</th></tr></thead><tbody><tr><td>Ausgabe</td><td>7</td><td>11</td><td>17</td><td><b>?</b></td></tr></tbody></table>
               <p>Welche Zahl gibt die Maschine aus, wenn man <b>10</b> eingibt?</p>`,
        widget: { type: 'number', answer: 21 },
        explain: `<p>Aus 3 wird 7, aus 5 wird 11, aus 8 wird 17. Die Maschine rechnet <b>Eingabe · 2 + 1</b>: 3·2+1 = 7, 5·2+1 = 11, 8·2+1 = 17. Also 10·2+1 = <b>21</b>.</p>`,
        info: 'Eine Regel, die aus einer Eingabe eine Ausgabe macht, nennt man in der Mathematik und Informatik eine Funktion.',
      },
      {
        id: 'k3-04', level: 1, title: 'Teiche zählen', topic: 'Algorithmen, Flächen finden',
        text: `<p>Aus der Luft sieht das Revier der Biber so aus: Wasserfelder (<b>~</b>) und Landfelder (<b>.</b>). Ein Teich besteht aus Wasserfeldern, die <b>an einer Seite</b> zusammenhängen (oben, unten, links oder rechts). Felder, die sich nur an einer Ecke berühren, gehören <b>nicht</b> zum selben Teich.</p>
               <pre class="map">${pond.join('\n')}</pre>
               <p>Wie viele Teiche gibt es?</p>`,
        widget: { type: 'number', answer: ponds },
        explain: `<p>Man geht das Bild Zeile für Zeile ab und markiert jeden neuen Teich mit allen angrenzenden Wasserfeldern. Es gibt <b>${ponds}</b> Teiche. Vorsicht bei den Feldern in der Ecke: Diagonale Nachbarn zählen nicht.</p>`,
        info: 'Solche zusammenhängenden Flächen findet man mit dem „Flood-Fill“-Verfahren. Es füllt in Mal-Programmen Flächen mit Farbe.',
      },

      /* ---------------- mittel ---------------- */
      {
        id: 'k3-05', level: 2, title: 'Das Spiegelbild', topic: 'Bilder, Symmetrie',
        text: `<p>Die <b>linke Hälfte</b> eines Bildes ist 3 Pixel breit und 6 Zeilen hoch (<b>#</b> = schwarz, <b>.</b> = weiß):</p>
               <pre class="map">${half.join('\n')}</pre>
               <p>Das ganze Bild ist 6 Pixel breit. Die rechte Hälfte ist das <b>Spiegelbild</b> der linken (so, als stünde dort ein Spiegel). Male das ganze Bild: Klicke alle Felder an, die schwarz sein sollen.</p>`,
        widget: { type: 'paint', target: cup },
        explain: `<p>Jede Zeile wird gespiegelt: Die Reihenfolge der Pixel wird umgedreht und rechts angehängt. Aus „#.#“ wird so „#.##.#“, aus „###“ wird „######“, aus „.##“ wird „.####.“ und aus „..#“ wird „..##..“. Es entsteht ein Pokal 🏆.</p>`,
        info: 'Spiegeln ist eine Grundoperation in Grafikprogrammen: Man dreht die Reihenfolge der Pixel jeder Zeile um.',
      },
      {
        id: 'k3-06', level: 2, title: 'Das Kreisspiel', topic: 'Algorithmen, Simulation',
        text: `<p>Sieben Biber stehen im Kreis und sind im Uhrzeigersinn von 1 bis 7 nummeriert. Sie spielen ein Ausscheidespiel:</p>
               <ul><li>Es wird bei Biber 1 mit dem Zählen begonnen: Biber 1 sagt „eins“, der nächste (Biber 2) sagt „zwei“.</li>
               <li>Wer „zwei“ sagt, <b>scheidet aus</b>. Beim nächsten Biber im Kreis geht es wieder mit „eins“ weiter.</li>
               <li>So geht es weiter, bis nur noch ein Biber übrig ist.</li></ul>
               <p>Klicke die Biber in der Reihenfolge an, in der sie <b>ausscheiden</b>. Der Biber, der am Ende <b>übrig bleibt</b>, kommt als Letzter dran.</p>`,
        widget: { type: 'seqclick', w: 380, h: 300, nodes: ringNodes, edges: [], correct: out.map(String) },
        explain: `<p>Reihenfolge des Ausscheidens: <b>${out.slice(0, -1).join(', ')}</b>. Übrig bleibt Biber <b>${out[out.length - 1]}</b>. Man streicht dazu der Reihe nach jeden zweiten Biber durch; nach Biber 6 geht es bei 7 mit „eins“ weiter, und Biber 1 sagt „zwei“.</p>`,
        info: 'Das Spiel heißt Josephus-Problem. Man löst es, indem man den Ablauf genau durchspielt – so wie ein Computer ein Programm.',
      },
      {
        id: 'k3-07', level: 2, title: 'Bild im Kurzcode', topic: 'Kodierung, Komprimierung',
        text: `<p>Ein Schwarz-Weiß-Bild ist <b>8 Pixel breit</b> und hat 5 Zeilen. Jede Zeile ist als Zahlenfolge gespeichert: Die Zahlen sagen abwechselnd, wie viele <b>weiße</b>, dann <b>schwarze</b>, dann wieder weiße Pixel nacheinander kommen. Jede Zeile beginnt mit Weiß (die erste Zahl kann auch 0 sein).</p>
               <p><i>Beispiel:</i> „2 4 2“ bedeutet 2 weiße, 4 schwarze und 2 weiße Pixel – zusammen 8 Pixel.</p>
               <pre>${rle.map((r, i) => `Zeile ${i + 1}:  ${r.join(' ')}`).join('\n')}</pre>
               <p>Wie viele Pixel des Bildes sind <b>schwarz</b>?</p>`,
        widget: { type: 'number', answer: rleBlack },
        explain: `<p>Es zählen die 2., 4., … Zahlen jeder Zeile (die schwarzen Pixel): ${rle.map(r => r.filter((_, i) => i % 2 === 1).join('+')).join(' + ')} = <b>${rleBlack}</b>. Zeile 3 beginnt mit „0“: Sie ist komplett schwarz.</p>`,
        info: 'Mit dieser Lauflängenkodierung sparen Fax-Geräte und manche Bildformate viel Speicher.',
      },

      /* ---------------- schwer ---------------- */
      {
        id: 'k3-08', level: 3, title: 'Streichholz-Spiel', topic: 'Strategie, Spiele',
        text: `<p>Auf dem Tisch liegen <b>${matchStart} Streichhölzer</b>. Du und ein Biber nehmt abwechselnd <b>1, 2 oder 3 Hölzer</b> weg. Wer das <b>letzte Holz</b> nimmt, gewinnt. <b>Du fängst an.</b></p>
               <p>Wie viele Hölzer musst du im ersten Zug nehmen, damit du <b>sicher gewinnen</b> kannst – egal, wie der Biber spielt?</p>`,
        widget: { type: 'choice', cols: 3, options: ['1 Holz', '2 Hölzer', '3 Hölzer'], correct: [matchMoves[0] - 1] },
        explain: `<p>Wenn nach deinem Zug eine <b>Vielfache von 4</b> übrig bleibt (12, 8, 4, 0), gewinnst du: Was immer der Biber nimmt (1, 2 oder 3), du ergänzt auf 4. Dann bleibt wieder ein Vielfaches von 4 übrig, am Ende nimmst du das letzte Holz. Von 13 Hölzern musst du also <b>1</b> nehmen, damit 12 übrig bleiben.</p>`,
        info: 'Bei vielen Spielen gibt es eine Gewinnstrategie. Computer finden sie, indem sie rückwärts vom Spielende aus rechnen.',
      },
      {
        id: 'k3-09', level: 3, title: 'Tauschsortieren', topic: 'Algorithmen, Sortieren',
        text: `<p>Fünf Holzstämme mit den Nummern <b>${swapList.join(' – ')}</b> liegen nebeneinander. Die Biber wollen sie aufsteigend sortieren (<b>1 – 2 – 3 – 4 – 5</b>). Dabei dürfen sie in jedem Zug <b>nur zwei direkt nebeneinanderliegende Stämme</b> vertauschen.</p>
               <p>Wie viele Tauschzüge braucht man <b>mindestens</b>?</p>`,
        widget: { type: 'number', answer: inversions },
        explain: `<p>Jeder Tausch benachbarter Stämme behebt höchstens <b>ein</b> „Falschpaar“ (ein größerer Stamm liegt links von einem kleineren). Falschpaare: (4,3), (4,1), (4,2), (3,1), (3,2), (5,1), (5,2) – das sind <b>${inversions}</b>. Und ${inversions} Tauschzüge reichen auch aus, wenn man immer ein Falschpaar vertauscht, das nebeneinander liegt.</p>`,
        info: 'Das ist die Idee hinter dem Sortierverfahren „Bubblesort“: Es vertauscht immer wieder benachbarte Elemente, bis alles richtig liegt.',
      },
      {
        id: 'k3-10', level: 3, title: 'Wasserkrüge', topic: 'Algorithmen, Planen und Suchen',
        text: `<p>Die Biber haben zwei Krüge ohne Skala: einen mit <b>5 Litern</b> Fassungsvermögen und einen mit <b>3 Litern</b>. Am Fluss können sie Wasser beliebig oft auffüllen oder wegschütten.</p>
               <p>Ein <b>Zug</b> ist eine dieser Handlungen:</p>
               <ul><li>einen Krug ganz füllen,</li><li>einen Krug ganz leeren,</li><li>Wasser von einem Krug in den anderen gießen, bis der andere voll oder der erste leer ist.</li></ul>
               <p>Am Anfang sind beide Krüge leer. Wie viele Züge braucht man <b>mindestens</b>, bis genau <b>4 Liter</b> im 5-Liter-Krug sind?</p>`,
        widget: { type: 'number', answer: jugs },
        explain: `<p>Kürzester Weg (5-L-Krug / 3-L-Krug): (0/0) → füllen 5 (5/0) → in 3 gießen (2/3) → 3 leeren (2/0) → 2 Liter umgießen (0/2) → 5 füllen (5/2) → in 3 gießen, bis er voll ist (4/3). Das sind <b>${jugs} Züge</b>. Der Weg, bei dem man mit dem 3-Liter-Krug beginnt, braucht 8 Züge.</p>`,
        info: 'Der Computer löst solche Rätsel durch systematisches Suchen: Er probiert von jedem Zustand aus alle Züge – das nennt man Breitensuche.',
      },
    ],
  });
})(window.Biber = window.Biber || {});
