/* Wettbewerb 3: Rätsel, Rekursion und Strategie */
(function (B) {
  'use strict';
  const A = B.algo;
  B.contests = B.contests || [];

  /* --- Aufgabe 3: Prüfziffer --- */
  const digits = [4, 0, 1, 9, 7, 3, 2];
  const wsum = digits.reduce((t, d, i) => t + d * (i % 2 === 0 ? 3 : 1), 0);
  const check = (10 - wsum % 10) % 10;

  /* --- Aufgabe 4: Tabellenkalkulation --- */
  const cells = {
    A1: '4', B1: '7', C1: '=A1+B1',
    A2: '=C1-3', B2: '2', C2: '=A2*B2',
    A3: '=B1+B2', B3: '=C2-A3', C3: '=SUMME(A1:B3)-C1',
  };
  const colIdx = c => c.charCodeAt(0) - 65;
  function cellValue(ref) {
    const f = cells[ref];
    if (f[0] !== '=') return Number(f);
    let e = f.slice(1).replace(/SUMME\(([A-C])(\d):([A-C])(\d)\)/g, (_, c1, r1, c2, r2) => {
      let t = 0;
      for (let c = colIdx(c1); c <= colIdx(c2); c++) for (let r = +r1; r <= +r2; r++) t += cellValue(String.fromCharCode(65 + c) + r);
      return t;
    });
    e = e.replace(/[A-C]\d/g, r => '(' + cellValue(r) + ')');
    return Function('return ' + e)();
  }
  const sheetAnswer = cellValue('C3');
  const sheetHtml = '<table class="data sheet"><thead><tr><th></th><th>A</th><th>B</th><th>C</th></tr></thead><tbody>' +
    [1, 2, 3].map(r => '<tr><th>' + r + '</th>' + ['A', 'B', 'C'].map(c => `<td>${cells[c + r].replace(/^=/, '= ')}</td>`).join('') + '</tr>').join('') + '</tbody></table>';

  /* --- Aufgabe 5: Lights Out --- */
  let lightsStart = Array(9).fill(false);
  [1, 3, 8].forEach(i => { lightsStart = A.lightsToggle(3, lightsStart, i); });
  const lightsMax = A.lightsSolve(3, lightsStart).length;

  /* --- Aufgabe 6: Präfixcode --- */
  const code = { B: '0', I: '10', E: '110', R: '1110', A: '11110', U: '11111' };
  const secret = 'BIBERBAU';
  const bitstream = [...secret].map(c => code[c]).join('');

  /* --- Aufgabe 7: Treppe --- */
  const ways = n => n < 0 ? 0 : n === 0 ? 1 : ways(n - 1) + ways(n - 2) + ways(n - 3);
  const stairs = ways(8);

  /* --- Aufgabe 8: Platzhalter --- */
  const pattern = /^b.b.*r$/;
  const wild = ['biber', 'bobr', 'bbr', 'biberburg', 'bibr', 'bar', 'babyr', 'bbbr'];
  const wildCorrect = wild.map((w, i) => pattern.test(w) ? i : -1).filter(i => i >= 0);

  /* --- Aufgabe 9: Pfannkuchen --- */
  const pan = [1, 5, 2, 4, 3];
  const panMax = A.pancakeSolve(pan).length;

  /* --- Aufgabe 10: gemeinsame Teilfolge --- */
  const seqX = 'ABCBDABEAC', seqY = 'BDCABAEBCA';
  const lcsLen = A.lcs(seqX, seqY);

  /* --- Aufgabe 11: Nim --- */
  const nimMoves = [1, 3, 4], nimN = 26;
  const nimWin = A.nimWinningMoves(nimMoves, nimN);

  /* --- Aufgabe 12: Ehrliche und Lügner --- */
  const stmts = {
    A: t => !t.B && !t.C,
    B: t => t.A === t.C,
    C: t => !(t.A === t.B && t.B === t.C),
  };
  const liarSols = [];
  for (let m = 0; m < 8; m++) {
    const t = { A: !!(m & 1), B: !!(m & 2), C: !!(m & 4) };
    if (['A', 'B', 'C'].every(p => t[p] === stmts[p](t))) liarSols.push(['A', 'B', 'C'].filter(p => t[p]).join(' und '));
  }
  const liarOpts = ['A', 'B', 'C', 'A und C', 'B und C', ''];
  const liarCorrect = liarOpts.indexOf(liarSols[0]);

  B.contests.push({
    id: 'w3',
    title: 'Wettbewerb 3',
    subtitle: 'Rätsel, Rekursion und Strategie',
    blurb: 'Prüfziffern, Tabellen, Lights Out und Pfannkuchen – zum Schluss Teilfolgen, Spielstrategie und eine Lügner-Aufgabe.',
    tasks: [
      /* ---------------- leicht ---------------- */
      {
        id: 'w3-01', level: 1, title: 'Händeschütteln', topic: 'Modellierung, Graphen',
        text: `<p>Zum Biber-Fest kommen <b>12 Biber</b>. Zur Begrüßung schüttelt jeder Biber jedem anderen Biber genau einmal die Pfote.</p>
               <p>Wie viele Pfotenschüttler gibt es insgesamt?</p>`,
        widget: { type: 'number', answer: 66 },
        explain: `<p>Jeder der 12 Biber schüttelt 11 Pfoten – das wären 12 · 11 = 132. Dabei wird aber jedes Schütteln zweimal gezählt (einmal pro Beteiligtem). Also 132 : 2 = <b>66</b>.</p>`,
        info: 'Verbindet man jeden mit jedem, entsteht ein „vollständiger Graph“. Bei n Knoten hat er n·(n−1)/2 Kanten.',
      },
      {
        id: 'w3-02', level: 1, title: 'Binär addieren', topic: 'Zahlendarstellung, Binärsystem',
        text: `<p>Der Biber-Computer addiert Zahlen im Binärsystem. Dort gilt: 0 + 0 = 0, 0 + 1 = 1 und 1 + 1 = 10 (also 0 hinschreiben, 1 weitergeben – wie beim schriftlichen Addieren).</p>
               <p>Berechne <b>1101 + 1011</b> im Binärsystem.</p>`,
        widget: { type: 'text', answers: ['11000'], placeholder: 'Binärzahl', normalize: t => t.replace(/\s/g, '').replace(/^0+(?=.)/, '') },
        explain: `<p>Stelle für Stelle von rechts: 1+1 = 0 Übertrag 1; 0+1+1 = 0 Übertrag 1; 1+0+1 = 0 Übertrag 1; 1+1+1 = 1 Übertrag 1; dann bleibt der Übertrag: <b>11000</b>. Zur Kontrolle: 13 + 11 = 24 und 24 = 16 + 8.</p>`,
        info: 'Alle Rechenwerke im Computer arbeiten mit solchen Binär-Additionen – aufgebaut aus einfachen Schaltungen.',
      },
      {
        id: 'w3-03', level: 1, title: 'Prüfziffer', topic: 'Kodierung, Fehlererkennung',
        text: `<p>Jede Biber-Ware hat einen Code aus 7 Ziffern plus einer <b>Prüfziffer</b>. So wird sie berechnet:</p>
               <ol><li>Multipliziere die Ziffern von links nach rechts abwechselnd mit <b>3</b> und <b>1</b> (die erste Ziffer mit 3, die zweite mit 1, die dritte mit 3 …).</li>
               <li>Addiere die Ergebnisse.</li>
               <li>Die Prüfziffer ist die Zahl, die zu dieser Summe fehlt, damit die Summe auf 0 endet (ist die Summe schon ein Vielfaches von 10, ist die Prüfziffer 0).</li></ol>
               <p>Der Code der Ware lautet <b class="mono">${digits.join(' ')}</b>. Wie lautet die Prüfziffer?</p>`,
        widget: { type: 'number', answer: check },
        explain: `<p>${digits.map((d, i) => `${d}·${i % 2 === 0 ? 3 : 1}`).join(' + ')} = ${wsum}. Bis zur nächsten Zehnerzahl (${Math.ceil(wsum / 10) * 10}) fehlen <b>${check}</b>.</p>`,
        info: 'Prüfziffern findet man auf Strichcodes, ISBN-Nummern und Kontonummern. Sie erkennen die meisten Tippfehler.',
      },
      {
        id: 'w3-04', level: 1, title: 'Biber-Tabelle', topic: 'Modellierung, Tabellenkalkulation',
        text: () => `<p>In einer Tabellenkalkulation stehen diese Zellen. Ein Eintrag mit „=“ ist eine Formel, die aus anderen Zellen rechnet. <b>SUMME(A1:B3)</b> bedeutet: Addiere alle Zellen von A1 bis B3 (das ganze Rechteck aus den Spalten A und B und den Zeilen 1 bis 3).</p>
               <div class="figure">${sheetHtml}</div>
               <p>Welche Zahl steht in Zelle <b>C3</b>?</p>`,
        widget: { type: 'number', answer: sheetAnswer },
        explain: `<p>C1 = 4 + 7 = 11; A2 = 11 − 3 = 8; C2 = 8 · 2 = 16; A3 = 7 + 2 = 9; B3 = 16 − 9 = 7. Die Summe im Rechteck A1:B3 ist 4 + 7 + 8 + 2 + 9 + 7 = 37. Dann ist C3 = 37 − 11 = <b>${sheetAnswer}</b>.</p>`,
        info: 'Formeln in Tabellen hängen voneinander ab. Das Programm muss die richtige Reihenfolge der Berechnung selbst finden.',
      },

      /* ---------------- mittel ---------------- */
      {
        id: 'w3-05', level: 2, title: 'Lichterkette', topic: 'Algorithmen, Logikrätsel',
        text: `<p>Auf dem Biber-Schaltkasten gibt es 3×3 Lampen. Ein Klick auf eine Lampe <b>schaltet sie und ihre direkten Nachbarn</b> (oben, unten, links, rechts) um: Aus wird an, an wird aus.</p>
               <p>Schalte alle Lampen aus – mit <b>höchstens ${lightsMax} Klicks</b>.</p>`,
        widget: { type: 'lightsout', n: 3, start: lightsStart, max: lightsMax },
        explain: `<p>Zwei Klicks auf dieselbe Lampe heben sich auf – jede Lampe wird also höchstens einmal geklickt. Man beginnt mit den Lampen, die nur über eine einzige Klickstelle erreicht werden können, und prüft, wie sich die Lichter verändern.</p>`,
        info: 'Lights Out lässt sich mit Mathematik über Gleichungen modulo 2 lösen – ein Beispiel für Algebra im Rätsel.',
      },
      {
        id: 'w3-06', level: 2, title: 'Spar-Code', topic: 'Kodierung, Präfixcodes',
        text: `<p>Die Biber kodieren Buchstaben mit unterschiedlich langen Bitfolgen:</p>
               <table class="data small"><tr><th>B</th><th>I</th><th>E</th><th>R</th><th>A</th><th>U</th></tr>
               <tr><td class="mono">${code.B}</td><td class="mono">${code.I}</td><td class="mono">${code.E}</td><td class="mono">${code.R}</td><td class="mono">${code.A}</td><td class="mono">${code.U}</td></tr></table>
               <p>Keine Bitfolge ist der Anfang einer anderen, deshalb lässt sich jede Nachricht eindeutig lesen. Es kam diese Nachricht an:</p>
               <p class="center big mono">${bitstream}</p>
               <p>Wie lautet das Wort?</p>`,
        widget: { type: 'text', answers: [secret], placeholder: 'Wort in Großbuchstaben' },
        explain: `<p>Man liest von links, bis die gelesenen Bits genau einem Buchstaben entsprechen: ${[...secret].map(c => `<span class="mono">${code[c]}</span> = ${c}`).join(', ')}. Das Wort lautet <b>${secret}</b>.</p>`,
        info: 'Häufige Buchstaben bekommen kurze Codes, seltene lange – das spart Platz. Der Huffman-Code arbeitet nach diesem Prinzip.',
      },
      {
        id: 'w3-07', level: 2, title: 'Dammtreppe', topic: 'Algorithmen, Rekursion',
        text: `<p>Eine Treppe zum Biberdamm hat <b>8 Stufen</b>. Der Biber steigt von unten nach oben. In einem Schritt nimmt er <b>1, 2 oder 3 Stufen</b> auf einmal.</p>
               <p>Auf wie vielen verschiedenen Wegen kann er die oberste Stufe erreichen? (Zwei Wege sind verschieden, wenn die Folge der Schrittgrößen verschieden ist.)</p>`,
        widget: { type: 'number', answer: stairs },
        explain: `<p>Sei w(n) die Zahl der Wege zur Stufe n. Der letzte Schritt kommt von Stufe n−1, n−2 oder n−3, also w(n) = w(n−1) + w(n−2) + w(n−3) mit w(0) = 1. Es ergibt sich w(1)=1, w(2)=2, w(3)=4, w(4)=7, w(5)=13, w(6)=24, w(7)=44 und w(8)=<b>${stairs}</b>.</p>`,
        info: 'Man baut die Lösung für große Probleme aus Lösungen kleinerer Probleme auf – das ist die Grundidee der dynamischen Programmierung.',
      },
      {
        id: 'w3-08', level: 2, title: 'Suchmuster', topic: 'Theoretische Informatik, Muster',
        text: `<p>Die Biber durchsuchen Wörter mit Suchmustern. In einem Muster steht <b>?</b> für <b>genau ein</b> beliebiges Zeichen und <b>*</b> für <b>beliebig viele</b> (auch null) beliebige Zeichen. Alle anderen Zeichen müssen genau so im Wort vorkommen.</p>
               <p>Beispiel: Das Muster <span class="mono">a?c*</span> passt auf „abc“ und „axcyz“, aber nicht auf „ac“.</p>
               <p>Welche Wörter passen auf das Muster <b class="mono">b?b*r</b>? Wähle alle aus.</p>`,
        widget: { type: 'choice', multi: true, cols: 2, correct: wildCorrect, options: wild.map(w => `<span class="mono">${w}</span>`) },
        explain: `<p>Das Wort muss mit <b>b</b> beginnen, an Stelle 2 irgendein Zeichen haben, an Stelle 3 wieder ein <b>b</b> haben und mit <b>r</b> enden – dazwischen ist alles erlaubt. Es passen: ${wildCorrect.map(i => wild[i]).join(', ')}. „bbr“ ist zu kurz, „biberburg“ endet nicht auf r, „bar“ hat an Stelle 3 kein b.</p>`,
        info: 'Solche Suchmuster werden mit Platzhaltern (Wildcards) in Dateisuchen verwendet; ihre Verwandten sind die regulären Ausdrücke.',
      },

      /* ---------------- schwer ---------------- */
      {
        id: 'w3-09', level: 3, title: 'Pfannkuchenturm', topic: 'Algorithmen, Sortieren',
        text: `<p>Ein Biber-Koch hat 5 Pfannkuchen unterschiedlicher Größe (1 = kleinster, 5 = größter) zu einem Turm gestapelt. Er hat nur einen Pfannenwender: Damit kann er den Wender unter einen beliebigen Pfannkuchen schieben und alle Pfannkuchen darüber <b>zusammen umdrehen</b> (wie ein Päckchen).</p>
               <p>Er will den Turm so sortieren, dass der kleinste oben und der größte unten liegt. Klicke auf einen Pfannkuchen, um ihn mit allen darüber umzudrehen. Schaffst du es in <b>höchstens ${panMax} Wendungen</b>?</p>`,
        widget: { type: 'pancake', start: pan, max: panMax },
        explain: `<p>Die Strategie „größten nach unten bringen“ braucht oft mehr Wendungen als nötig. Hier gibt es eine Folge mit nur ${panMax} Wendungen – man muss die Wendungen so wählen, dass zugleich zwei Pfannkuchen an die richtige Stelle kommen.</p>`,
        info: 'Das Pfannkuchen-Problem ist ein Klassiker: Auch für Sortieren in biologischen Genomen (Umkehrungen von Abschnitten) ist es wichtig.',
      },
      {
        id: 'w3-10', level: 3, title: 'Gen-Vergleich', topic: 'Algorithmen, Teilfolgen',
        text: `<p>Zwei Biber haben diese Erbgut-Abschnitte (jeder Buchstabe ist ein Baustein):</p>
               <p class="center big mono">${seqX}<br>${seqY}</p>
               <p>Eine <b>gemeinsame Teilfolge</b> entsteht, wenn man aus beiden Abschnitten Buchstaben streicht und danach in beiden dieselbe Folge übrig bleibt (die Reihenfolge der übrigen Buchstaben darf sich nicht ändern, die Buchstaben müssen aber nicht direkt nebeneinander stehen).</p>
               <p>Wie lang ist die <b>längste</b> gemeinsame Teilfolge?</p>`,
        widget: { type: 'number', answer: lcsLen },
        explain: `<p>Man füllt eine Tabelle: Für jedes Paar von Anfangsstücken beider Abschnitte steht dort die längste gemeinsame Teilfolge. Stimmen die neuen Buchstaben überein, wird der Wert aus der Diagonalen um 1 größer, sonst nimmt man das Maximum von links und oben. Das Ergebnis ist <b>${lcsLen}</b>.</p>`,
        info: 'Dieses Verfahren (LCS) vergleicht DNA-Sequenzen – und ist auch die Grundlage der Programme, die Textunterschiede („diff“) anzeigen.',
      },
      {
        id: 'w3-11', level: 3, title: 'Hölzchenspiel', topic: 'Algorithmen, Spielstrategie',
        text: `<p>Zwei Biber spielen mit <b>${nimN} Hölzchen</b> in einem Haufen. Abwechselnd nimmt jeder <b>1, 3 oder 4</b> Hölzchen weg. Wer das <b>letzte</b> Hölzchen nimmt, gewinnt.</p>
               <p>Du beginnst. Wie viele Hölzchen musst du im ersten Zug nehmen, damit du bei richtigem Weiterspielen <b>sicher gewinnst</b>? (Wähle alle Züge aus, mit denen das gelingt.)</p>`,
        widget: { type: 'choice', multi: true, cols: 3, correct: nimWin.map(m => nimMoves.indexOf(m)), options: nimMoves.map(m => m + ' Hölzchen') },
        explain: () => `<p>Man bestimmt rückwärts, welche Haufengrößen „verloren“ sind für den, der am Zug ist: 0 Hölzchen (der Gegner hat gerade das letzte genommen), 2, 7, 9, 14, 16, 21, 23, … Wer den Haufen auf so eine Zahl bringt, gewinnt. Aus ${nimN} kommt man mit <b>${nimWin.join(' / ')} Hölzchen</b> auf ${nimN - nimWin[0]}.</p>`,
        info: 'Mit einer Rückwärtsanalyse lassen sich viele einfache Spiele vollständig lösen – ein Verfahren, das auch bei Schach-Endspielen eingesetzt wird.',
      },
      {
        id: 'w3-12', level: 3, title: 'Wahr oder falsch?', topic: 'Logik, Schlussfolgern',
        text: `<p>Auf der Insel der Biber gibt es <b>Ehrliche</b>, die immer die Wahrheit sagen, und <b>Lügner</b>, deren Aussagen immer falsch sind. Drei Biber sagen:</p>
               <ul><li><b>A:</b> „B und C sind beide Lügner.“</li>
               <li><b>B:</b> „A und C sind vom gleichen Typ (beide ehrlich oder beide Lügner).“</li>
               <li><b>C:</b> „Wir drei sind nicht alle vom gleichen Typ.“</li></ul>
               <p>Wer von den dreien ist ehrlich?</p>`,
        widget: {
          type: 'choice', cols: 2, correct: [liarCorrect],
          options: ['Nur A', 'Nur B', 'Nur C', 'A und C', 'B und C', 'Niemand'],
        },
        explain: `<p>Man probiert die Möglichkeiten durch. <i>Angenommen, A ist ehrlich:</i> Dann sind B und C Lügner. B’s Aussage („A und C sind gleich“) wäre dann falsch – das passt zu einem Lügner, denn A ist ehrlich und C ein Lügner. C’s Aussage („nicht alle gleich“) wäre aber wahr, und das kann ein Lügner nicht sagen. Widerspruch. <i>Also ist A ein Lügner.</i> Dann stimmt „B und C sind beide Lügner“ nicht, und mindestens einer von beiden ist ehrlich. Wäre B ehrlich, dann wären A und C vom gleichen Typ, also C ein Lügner – dessen Aussage „nicht alle gleich“ wäre aber wahr (A und B unterscheiden sich). Widerspruch. Also ist B ein Lügner und damit <b>nur C ehrlich</b>. Probe: B’s Aussage ist falsch (A und C sind verschieden), C’s Aussage ist wahr.</p>`,
        info: 'Solche Aufgaben prüft man systematisch: Alle Möglichkeiten durchgehen und jede mit den Aussagen vergleichen – ähnlich arbeitet ein Programm, das Logikformeln löst (SAT-Solver).',
      },
    ],
  });
})(window.Biber = window.Biber || {});
