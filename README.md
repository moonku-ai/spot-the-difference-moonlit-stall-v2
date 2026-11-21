# Telltale — a spot-the-difference mystery

Two pictures look the same. They aren't. Tap a difference on **either**
picture to circle it on both, and work through three hand-painted scenes —
*The Old Bookshop* (6 differences, 3:00), *Harbor at Dawn* (8 differences,
2:30), and *The Night Garden* (10 differences, 2:00) — before the clock runs
out. A wrong tap costs five seconds and your streak; a hint costs 50 points
and rings one difference in gold.

Everything is procedural Canvas 2D — no image assets, no network, no
library. All 24 differences are planted by the scene painters and checked
by the test suite, so both panels always match except for the planted
differences.

## Play

```sh
node serve.ts
```

Then open http://localhost:8080. No build step.

## Rules

- **Find:** click a difference on either picture — 100 points, +25 per
  streak step.
- **Miss:** −5 seconds, streak resets.
- **Hint:** 3 per level, −50 points each, a pulsing gold ring marks one
  unfound difference for 2.5 seconds.
- **Finish:** time left becomes bonus points (5/second) and stars —
  3 stars above half time, 2 above a quarter, else 1.
- **Keys:** H hint · R restart · Esc pause · M sound.

## Layout

| File | One job |
| --- | --- |
| `game/index.html` | Page structure: menu, play screen, overlays |
| `game/styles.css` | All styling (indigo night frame, gold accents) |
| `game/src/main.js` | Bootstrap |
| `game/src/game.js` | Screen stack, HUD, loop, input wiring |
| `game/src/logic.js` | Pure rules: clicks, hints, timer, scoring |
| `game/src/render.js` | Panel painting and feedback effects |
| `game/src/input.js` | Pointer → panel coordinates |
| `game/src/audio.js` | Synthesized WebAudio sound effects |
| `game/src/config.js` | Panel size, scoring, timer constants |
| `game/src/random.js` | Seeded RNG (mulberry32) |
| `game/src/differences.js` | Difference lookup and validation |
| `game/src/levels.js` | The three levels and their time limits |
| `game/src/scenes/bookshop.js` | The Old Bookshop painter + its 6 differences |
| `game/src/scenes/harbor.js` | Harbor at Dawn painter + its 8 differences |
| `game/src/scenes/garden.js` | The Night Garden painter + its 10 differences |
| `game/src/shots.js` | Screenshot staging via `?shot=` URL params |
| `tests/test.mjs` | Node test suite (rules, scenes, RNG) |
| `main.ts` | Entry point: copies `game/` + `screenshots/` to `/output`, writes the dossier |
| `serve.ts` | Local static server for playtesting |

## Tests

```sh
npm test
```

21 tests: seeded RNG determinism, rule outcomes (find/miss/hint/win/lose),
star thresholds, difference bounds and overlap checks, and a render of both
variants of every scene on a mock canvas — each variant must draw without
error and differ from its twin.

## Screenshots

Staged by `shots.json` through the game's own `?shot=` parameters, so every
screenshot is a true render of the game running: mid-game with markers and
a live counter, the title screen, a hint ring in action, and the
level-clear screen with stars.
