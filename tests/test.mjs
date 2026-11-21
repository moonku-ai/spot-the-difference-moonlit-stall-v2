// Tests for "Spot the Difference" v2 — pure-logic modules only (no DOM).
// Run: node --test tests/  (from the repo root)
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { mulberry32, makeRng } from '../game/src/random.js';
import { PANEL, SCORING } from '../game/src/config.js';
import { LEVELS, levelById } from '../game/src/levels.js';
import { validateDifferences, findDifferenceAt } from '../game/src/differences.js';
import { createGame, applyClick, applyHint, tick, scoreForFind, starsFor } from '../game/src/logic.js';
import * as bookshop from '../game/src/scenes/bookshop.js';
import * as harbor from '../game/src/scenes/harbor.js';
import * as garden from '../game/src/scenes/garden.js';

// ---------------------------------------------------------------- RNG

test('mulberry32 is deterministic for the same seed', () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 100; i++) assert.equal(a(), b());
});

test('mulberry32 differs across seeds and stays in [0, 1)', () => {
  const a = mulberry32(1);
  const b = mulberry32(2);
  let same = 0;
  for (let i = 0; i < 100; i++) {
    const x = a();
    const y = b();
    assert.ok(x >= 0 && x < 1, 'in range');
    if (x === y) same++;
  }
  assert.ok(same < 5, 'different seeds diverge');
});

test('makeRng int() stays in bounds and pick() returns a member', () => {
  const rng = makeRng(7);
  for (let i = 0; i < 200; i++) {
    const v = rng.int(3, 9);
    assert.ok(v >= 3 && v <= 9, `int in [3,9]: ${v}`);
  }
  const arr = ['a', 'b', 'c'];
  for (let i = 0; i < 20; i++) assert.ok(arr.includes(rng.pick(arr)));
});

// ---------------------------------------------------------------- levels & differences

test('three levels, rising difficulty, valid time limits', () => {
  assert.equal(LEVELS.length, 3);
  const diffs = LEVELS.map((l) => l.scene.differences.length);
  assert.deepEqual(diffs, [6, 8, 10]);
  const times = LEVELS.map((l) => l.timeLimit);
  assert.deepEqual(times, [180, 150, 120]);
  for (const l of LEVELS) {
    assert.ok(l.hints >= 1, 'at least one hint');
    assert.ok(l.name.length > 0 && l.subtitle.length > 0);
    assert.equal(levelById(l.id), l);
  }
});

test('every difference is in bounds, non-overlapping, well-formed', () => {
  for (const level of LEVELS) {
    const problems = validateDifferences(level.scene.differences, PANEL);
    assert.deepEqual(problems, [], `${level.id}: ${problems.join('; ')}`);
    for (const d of level.scene.differences) {
      assert.ok(['missing', 'added', 'color', 'moved', 'changed'].includes(d.kind), `kind ${d.kind}`);
      assert.ok(d.label.length > 2, 'label describes the difference');
      assert.ok(d.r >= 14 && d.r <= 48, `radius sane: ${d.r}`);
    }
  }
});

test('findDifferenceAt hits inside the radius and misses outside it', () => {
  const list = LEVELS[0].scene.differences;
  const d = list[0];
  assert.equal(findDifferenceAt(list, [], d.x, d.y), d);
  assert.equal(findDifferenceAt(list, [], d.x + d.r - 1, d.y), d);
  assert.equal(findDifferenceAt(list, [], d.x + d.r + 6, d.y), null);
  assert.equal(findDifferenceAt(list, [d.id], d.x, d.y), null, 'already found is not hit again');
});

// ---------------------------------------------------------------- game logic

test('a hit finds the difference, scores, and grows the streak', () => {
  const game = createGame(0);
  const d = game.level.scene.differences[0];
  const { state, events } = applyClick(game, d.x, d.y, 'left');
  assert.equal(state.found.length, 1);
  assert.equal(state.streak, 1);
  assert.equal(state.score, scoreForFind(0));
  assert.equal(events[0].type, 'found');
  assert.equal(events[0].difference.id, d.id);
  assert.equal(events[0].points, scoreForFind(0));
});

test('score grows with the streak', () => {
  assert.equal(scoreForFind(0), SCORING.find);
  assert.equal(scoreForFind(1), SCORING.find + SCORING.streakStep);
  assert.equal(scoreForFind(4), SCORING.find + 4 * SCORING.streakStep);
});

test('a miss costs time, resets the streak, and never drops time below zero', () => {
  const game = createGame(0);
  game.streak = 3;
  game.timeLeft = 3;
  const { state, events } = applyClick(game, 5, 5, 'left'); // corner: no difference lives here
  assert.equal(events[0].type, 'miss');
  assert.equal(state.streak, 0);
  assert.equal(state.timeLeft, 0);
  assert.equal(state.status, 'lost', 'time running out loses the level');
});

test('clicking an already-found difference is a no-op', () => {
  const game = createGame(0);
  const d = game.level.scene.differences[0];
  const first = applyClick(game, d.x, d.y, 'left');
  const second = applyClick(first.state, d.x, d.y, 'right');
  assert.equal(second.events[0].type, 'already-found');
  assert.equal(second.state.score, first.state.score);
  assert.equal(second.state.found.length, 1);
});

test('finding every difference wins the level and banks a time bonus', () => {
  let game = createGame(0);
  game.timeLeft = 60;
  const before = game.score;
  for (const d of game.level.scene.differences) {
    game = applyClick(game, d.x, d.y, 'left').state;
  }
  assert.equal(game.status, 'won');
  assert.ok(game.score > before, 'time bonus added');
  assert.equal(game.score, before + game.level.scene.differences.reduce((s, _, i) => s + scoreForFind(i), 0) + 60 * SCORING.timeBonusPerSecond);
});

test('a hint reveals an unfound difference, costs points and a hint', () => {
  const game = createGame(0);
  game.score = 200;
  const d0 = game.level.scene.differences[0];
  const found = applyClick(game, d0.x, d0.y, 'left').state;
  const { state, events } = applyHint(found);
  assert.equal(state.hintsLeft, found.hintsLeft - 1);
  assert.equal(state.score, found.score - SCORING.hintCost);
  assert.equal(events[0].type, 'hint');
  assert.notEqual(events[0].difference.id, d0.id, 'hint never points at a found difference');
  assert.ok(!state.found.includes(events[0].difference.id), 'hint does not mark it found');
});

test('a hint with none left, or with everything found, does nothing', () => {
  const game = createGame(0);
  game.hintsLeft = 0;
  assert.equal(applyHint(game).events[0].type, 'no-hint');
  let won = createGame(0);
  for (const d of won.level.scene.differences) won = applyClick(won, d.x, d.y, 'left').state;
  assert.equal(applyHint(won).events[0].type, 'no-hint');
});

test('tick drains time and loses at zero; tick after the end is a no-op', () => {
  const game = createGame(0);
  game.timeLeft = 2;
  const { state, events } = tick(game, 2);
  assert.equal(state.timeLeft, 0);
  assert.equal(state.status, 'lost');
  assert.equal(events[0].type, 'time-up');
  const again = tick(state, 5);
  assert.equal(again.state.timeLeft, 0);
  assert.deepEqual(again.events, []);
});

test('stars reward fast finishes: 3 above half time, 2 above a quarter, else 1', () => {
  assert.equal(starsFor(100, 180), 3);
  assert.equal(starsFor(90, 180), 3);
  assert.equal(starsFor(89, 180), 2);
  assert.equal(starsFor(45, 180), 2);
  assert.equal(starsFor(44, 180), 1);
  assert.equal(starsFor(0, 180), 1);
});

// ---------------------------------------------------------------- scenes (mock canvas)

function createMockCtx() {
  const calls = [];
  const ctx = new Proxy(
    {},
    {
      get(target, prop) {
        if (prop === 'calls') return calls;
        if (prop === 'canvas') return { width: PANEL.w, height: PANEL.h };
        if (!(prop in target)) {
          target[prop] = (...args) => {
            calls.push([prop, ...args]);
          };
        }
        return target[prop];
      },
      set(target, prop, value) {
        target[prop] = value;
        return true;
      },
    },
  );
  return ctx;
}

const SCENES = [
  ['bookshop', bookshop],
  ['harbor', harbor],
  ['garden', garden],
];

for (const [name, scene] of SCENES) {
  test(`scene ${name} draws both variants without error and they differ`, () => {
    const ctxA = createMockCtx();
    const ctxB = createMockCtx();
    scene.draw(ctxA, 'A');
    scene.draw(ctxB, 'B');
    const fillsA = ctxA.calls.filter(([m]) => m === 'fill').length;
    const fillsB = ctxB.calls.filter(([m]) => m === 'fill').length;
    assert.ok(fillsA > 40, `variant A paints a full scene (${fillsA} fills)`);
    assert.ok(fillsB > 40, `variant B paints a full scene (${fillsB} fills)`);
    const sigA = JSON.stringify(ctxA.calls);
    const sigB = JSON.stringify(ctxB.calls);
    assert.notEqual(sigA, sigB, 'variants must render differently');
  });

  test(`scene ${name} exports its differences and they match the level`, () => {
    const level = LEVELS.find((l) => l.scene === scene);
    assert.ok(level, 'scene is used by a level');
    assert.equal(scene.differences.length, level.scene.differences.length);
  });
}
