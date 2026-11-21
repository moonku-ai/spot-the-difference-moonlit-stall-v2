// Shared constants: panel size, scoring, timing.

export const PANEL = { w: 620, h: 420 };

export const SCORING = {
  find: 100,
  streakStep: 25,
  hintCost: 50,
  missPenaltySeconds: 5,
  timeBonusPerSecond: 5,
};

export const TIMER = {
  warnAt: 30, // seconds left: bar turns amber and pulses
  dangerAt: 10, // seconds left: bar turns red, tick sound each second
};

export const HINT_RING_MS = 2500;
