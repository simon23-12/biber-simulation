# Herr Fuhs’ großartige Biber Simulation

Wettbewerbe im Stil des [Informatik-Bibers](https://bwinf.de/biber/) für die Klassenstufen 6 und 9 (Umschalter auf der Startseite).

- Klasse 9: 3 Wettbewerbe mit je 12 Aufgaben (4× leicht, 4× mittel, 4× schwer – von leicht nach schwer sortiert), max. 108 Punkte
- Klasse 6: 3 Wettbewerbe mit je 10 Aufgaben (4× leicht, 3× mittel, 3× schwer), max. 87 Punkte
- 35 Minuten pro Wettbewerb, die Uhr läuft ab dem Start weiter (auch bei geschlossener Seite)
- Alle Aufgaben werden automatisch ausgewertet; Punkte und Lösungen gibt es erst nach der Abgabe bzw. nach Ablauf der Zeit
- Punkte: leicht 6, mittel 9, schwer 12 
- Kein Backend, keine Accounts: Antworten und Ergebnisse stehen nur im `localStorage` des Browsers

## Lokal starten

```bash
python3 -m http.server 8000   # dann http://localhost:8000 öffnen
```

## Aufgaben prüfen

```bash
node tests/verify.js
```

Das Skript prüft, dass jede Aufgabe eine gültige Beispiellösung hat, dass falsche Antworten nicht akzeptiert werden und dass die berechneten Lösungen (kürzeste Wege, maximaler Fluss, Rucksack …) stimmen.

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `js/algo.js` | Hilfsalgorithmen (Dijkstra, Max-Flow, Rucksack, BFS-Löser …) |
| `js/widgets.js` | Antwort-Widgets (Auswahl, Roboter, Sortiernetzwerk, …) und SVG-Hilfen |
| `js/tasks-1.js` … `tasks-3.js` | die drei Wettbewerbe für Klasse 9 |
| `js/tasks-k6.js` | die drei Wettbewerbe für Klasse 6 |
| `js/app.js` | Ablauf, Timer, Speicherung, Ergebnisseite |

Neue Aufgabe: in der passenden `tasks-*.js` (Klasse 6: `tasks-k6.js`, Wettbewerb mit `grade: 6`) ein Objekt mit `id`, `level`, `title`, `text`, `widget`, `explain`, `info` ergänzen und `node tests/verify.js` laufen lassen.

## Hinweis zu den Aufgaben

Die Aufgaben sind eigens für diese Simulation formuliert und greifen Themen und Formate des Informatik-Bibers auf (Automaten, Sortiernetzwerke, Prüfbits, Graphen …). Das Informatik-Biber-Aufgabenheft 2025 (BWINF, CC BY-SA 4.0) diente als Vorbild für Stil und Schwierigkeitsabstufung.
