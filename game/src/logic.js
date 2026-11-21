// Pure game logic: the state is plain data, every move returns
// { state, events } and the view animates the events. No DOM here,
// so the whole ruleset is covered by the Node tests.

import { SCORING } from './config.js';
import { LEVELS } from './levels.js';
import { findDifferenceAt, differencesAt } from './differences.js';

export function scoreForFind(streak) {
  return SCORING.find + streak * SCORING.streakStep;
}

export function starsFor(timeLeft, timeLimit) {
  const ratio = timeLeft / timeLimit;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}

export function createGame(levelIndex) {
  const level = LEVELS[levelIndex];
  return {
    levelIndex,
    level,
    found: [],
    score: 0,
    streak: 0,
    hintsLeft: level.hints,
    timeLeft: level.timeLimit,
    status: 'playing', // 'playing' | 'won' | 'lost'
  };
}

export function applyClick(state, x, y, panel) {
  if (state.status !== 'playing') return { state, events: [] };
  const list = state.level.scene.differences;

  const hit = findDifferenceAt(list, state.found, x, y);
  if (hit) {
    const points = scoreForFind(state.streak);
    const found = [...state.found, hit.id];
    let score = state.score + points;
    const events = [{ type: 'found', difference: hit, points, panel }];
    let status = 'playing';
    if (found.length === list.length) {
      status = 'won';
      const bonus = state.timeLeft * SCORING.timeBonusPerSecond;
      score += bonus;
      events.push({
        type: 'level-complete',
        bonus,
        stars: starsFor(state.timeLeft, state.level.timeLimit),
      });
    }
    return {
      state: { ...state, found, score, streak: state.streak + 1, status },
      events,
    };
  }

  const already = differencesAt(list, x, y).find((d) => state.found.includes(d.id));
  if (already) {
    return { state, events: [{ type: 'already-found', difference: already, panel }] };
  }

  const timeLeft = Math.max(0, state.timeLeft - SCORING.missPenaltySeconds);
  const status = timeLeft === 0 ? 'lost' : 'playing';
  const events = [{ type: 'miss', x, y, panel }];
  if (status === 'lost') events.push({ type: 'time-up' });
  return { state: { ...state, timeLeft, streak: 0, status }, events };
}

export function applyHint(state) {
  if (state.status !== 'playing') return { state, events: [{ type: 'no-hint' }] };
  if (state.hintsLeft <= 0) return { state, events: [{ type: 'no-hint' }] };
  const remaining = state.level.scene.differences.filter((d) => !state.found.includes(d.id));
  if (remaining.length === 0) return { state, events: [{ type: 'no-hint' }] };
  const difference = remaining[Math.floor(Math.random() * remaining.length)];
  const next = {
    ...state,
    hintsLeft: state.hintsLeft - 1,
    score: Math.max(0, state.score - SCORING.hintCost),
  };
  return { state: next, events: [{ type: 'hint', difference }] };
}

export function tick(state, dtSeconds) {
  if (state.status !== 'playing') return { state, events: [] };
  const timeLeft = Math.max(0, state.timeLeft - dtSeconds);
  if (timeLeft === 0) {
    return { state: { ...state, timeLeft, status: 'lost' }, events: [{ type: 'time-up' }] };
  }
  return { state: { ...state, timeLeft }, events: [] };
}
