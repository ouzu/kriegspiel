# Kriegspiel

Kriegspiel ist eine Schachvariante, bei der jeder Spieler nur seine eigenen Figuren sieht (siehe [Wikipedia](https://en.wikipedia.org/wiki/Kriegspiel_(chess))).

Das Hauptziel dieses Projektes war es, diese Variante zu implementieren. Nun ist aber auch Standard-Schach auf einem oder 2 Geräten unterstüzt und mehr Spielmodi wie Bauernkloppe sind geplant.

## Übersicht

Das Spiel benutzt eine Server-Client-Architektur.

Der Server ist in Go geschrieben und der Client mit TypeScript, React und scss.

Die Kommunikation geschieht dabei über websockets. Das Protokoll ist recht primitiv und sieht ungefähr so aus:

```
+---------+                  +---------+                  +---------+
| Client1 |                  | Server  |                  | Client2 |
+---------+                  +---------+                  +---------+
     |                            |                            |
     | helo                       |                            |
     |--------------------------->|                            |
     |                            |                            |
     |                       helo |                            |
     |<---------------------------|                            |
     |                            |                            |
     | start krieg                |                            |
     |--------------------------->|                            |
     |                            |                            |
     |                    id 1234 |                            |
     |<---------------------------|                            |
     |                            |                            |
     |                 role white |                            |
     |<---------------------------|                            |
     |                            |                            |
     |                            |                       helo |
     |                            |<---------------------------|
     |                            |                            |
     |                            | helo                       |
     |                            |--------------------------->|
     |                            |                            |
     |                            |                  join 1234 |
     |                            |<---------------------------|
     |                            |                            |
     |                            | role black                 |
     |                            |--------------------------->|
     |                            |                            |
     |      [FEN + mögliche Züge] |                            |
     |<---------------------------|                            |
     |                            |                            |
     |                            | [FEN]                      |
     |                            |--------------------------->|
     |                            |                            |
     | [Zug]                      |                            |
     |--------------------------->|                            |
     |                            |                            |
     |                      [FEN] |                            |
     |<---------------------------|                            |
     |                            |                            |
     |                            | [FEN + mögliche Züge]      |
     |                            |--------------------------->|
     |                            |                            |
     |                            |                        Zug |
     |                            |<---------------------------|
     |                            | -------------------\       |
     |                            |-| Und so weiter... |       |
     |                            | |------------------|       |
     |                            |                            |
```