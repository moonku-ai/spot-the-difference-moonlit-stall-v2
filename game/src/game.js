// The game controller: screens as a stack, HUD driven by logic events,
// the animation loop, and all input wiring. The rules live in logic.js;
// this file only turns its events into feedback.

import { PANEL, SCORING, TIMER, HINT_RING_MS } from './config.js';
import { LEVELS } from './levels.js';
import { createGame, applyClick, applyHint, tick, scoreForFind } from './logic.js';
import {
  paintPanels,
  drawFoundMarker,
  drawMissMark,
  drawHintRing,
  drawScorePop,
} from './render.js';
import { canvasCoords } from './input.js';
import { SoundFX } from './audio.js';

const BEST_KEY = 'telltale-best-stars-v2';

function loadBest() {
  try {
    return JSON.parse(window.localStorage.getItem(BEST_KEY) ?? '{}') ?? {};
  } catch {
    return {};
  }
}

function saveBest(best) {
  try {
    window.localStorage.setItem(BEST_KEY, JSON.stringify(best));
  } catch {
    // Storage unavailable (private mode, sandbox): best stars just don't persist.
  }
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export class Game {
  constructor(doc) {
    this.doc = doc;
    this.sfx = new SoundFX();
    this.best = loadBest();
    this.runScores = {};
    this.screen = 'menu';
    this.state = null;
    this.paused = false;
    this.staging = false;
    this.markers = [];
    this.fx = [];
    this.hintFx = null;
    this.acc = 0;
    this.lastNow = 0;
    this.toastTimer = null;
    this.completeTimer = null;
    this.$ = (id) => doc.getElementById(id);
    this.left = this.$('canvas-left');
    this.right = this.$('canvas-right');
    this.lctx = this.left.getContext('2d');
    this.rctx = this.right.getContext('2d');
    this.bind();
  }

  // ------------------------------------------------------------ wiring

  bind() {
    const on = (id, fn) => this.$(id).addEventListener('click', (e) => {
      this.sfx.ensure();
      fn(e);
    });
    on('btn-hint', () => this.useHint());
    on('btn-restart', () => this.restartLevel());
    on('btn-pause', () => this.togglePause());
    on('btn-mute', () => this.toggleMute());
    on('btn-next', () => this.nextLevel());
    on('btn-replay', () => this.restartLevel());
    on('btn-complete-menu', () => this.showMenu());
    on('btn-retry', () => this.restartLevel());
    on('btn-gameover-menu', () => this.showMenu());
    on('btn-resume', () => this.togglePause());
    on('btn-pause-restart', () => this.restartLevel());
    on('btn-pause-menu', () => this.showMenu());
    on('btn-final-again', () => this.startLevel(0));
    on('btn-final-menu', () => this.showMenu());

    this.left.addEventListener('click', (e) => this.onPanelClick('left', e));
    this.right.addEventListener('click', (e) => this.onPanelClick('right', e));

    this.doc.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') return this.toggleMute();
      if (this.screen === 'menu' && ['1', '2', '3'].includes(e.key)) {
        return this.startLevel(Number(e.key) - 1);
      }
      if (this.screen !== 'play') return;
      if (e.key === 'h' || e.key === 'H') this.useHint();
      if (e.key === 'r' || e.key === 'R') this.restartLevel();
      if (e.key === 'Escape') this.togglePause();
    });

    this.buildMenu();
  }

  buildMenu() {
    const host = this.$('level-cards');
    host.innerHTML = '';
    LEVELS.forEach((level, i) => {
      const card = this.doc.createElement('button');
      card.className = 'level-card';
      card.type = 'button';
      const stars = this.best[level.id] ?? 0;
      card.innerHTML =
        `<span class="level-card-num">Level ${i + 1}</span>` +
        `<span class="level-card-name">${level.name}</span>` +
        `<span class="level-card-sub">${level.subtitle}</span>` +
        `<span class="level-card-meta">${level.scene.differences.length} differences · ${fmtTime(level.timeLimit)}</span>` +
        `<span class="level-card-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span>`;
      card.addEventListener('click', () => {
        this.sfx.ensure();
        this.sfx.click();
        this.startLevel(i);
      });
      host.appendChild(card);
    });
  }

  // ------------------------------------------------------------ screens

  showScreen(name) {
    this.screen = name;
    for (const id of ['screen-menu', 'screen-play']) {
      this.$(id).classList.toggle('hidden', id !== `screen-${name}`);
    }
    for (const id of ['overlay-complete', 'overlay-gameover', 'overlay-pause', 'overlay-final']) {
      this.$(id).classList.add('hidden');
    }
    if (name === 'menu') this.buildMenu();
  }

  showMenu() {
    this.paused = false;
    this.state = null;
    this.showScreen('menu');
  }

  showOverlay(id) {
    this.$(id).classList.remove('hidden');
  }

  hideOverlay(id) {
    this.$(id).classList.add('hidden');
  }

  // ------------------------------------------------------------ play

  startLevel(index) {
    this.state = createGame(index);
    this.markers = [];
    this.fx = [];
    this.hintFx = null;
    this.paused = false;
    this.acc = 0;
    this.$('hud-level-name').textContent = `Level ${index + 1} — ${this.state.level.name}`;
    this.showScreen('play');
    this.updateHud();
    this.render(performance.now());
  }

  restartLevel() {
    if (this.state) this.startLevel(this.state.levelIndex);
  }

  nextLevel() {
    const next = this.state.levelIndex + 1;
    if (next >= LEVELS.length) {
      this.showFinal();
    } else {
      this.startLevel(next);
    }
  }

  togglePause() {
    if (this.screen !== 'play' || !this.state || this.state.status !== 'playing') return;
    this.paused = !this.paused;
    this.$('overlay-pause').classList.toggle('hidden', !this.paused);
  }

  toggleMute() {
    this.sfx.ensure();
    this.sfx.muted = !this.sfx.muted;
    this.$('btn-mute').textContent = this.sfx.muted ? 'Sound: off' : 'Sound: on';
  }

  onPanelClick(panel, event) {
    if (this.screen !== 'play' || !this.state || this.state.status !== 'playing' || this.paused) return;
    this.sfx.ensure();
    const canvas = panel === 'left' ? this.left : this.right;
    const { x, y } = canvasCoords(canvas, event.clientX, event.clientY);
    const { state, events } = applyClick(this.state, x, y, panel);
    this.state = state;
    this.handleEvents(events, x, y, panel);
    this.updateHud();
  }

  handleEvents(events, x, y, panel) {
    const now = performance.now();
    for (const ev of events) {
      if (ev.type === 'found') {
        this.markers.push({ difference: ev.difference, at: now });
        this.fx.push({ kind: 'pop', panel: 'left', x: ev.difference.x, y: ev.difference.y, at: now, text: `+${ev.points}` });
        // A moved difference sits at (x2, y2) on the right panel.
        this.fx.push({ kind: 'pop', panel: 'right', x: ev.difference.x2 ?? ev.difference.x, y: ev.difference.y2 ?? ev.difference.y, at: now, text: `+${ev.points}` });
        this.sfx.pop();
        this.toast(ev.difference.label);
      } else if (ev.type === 'miss') {
        this.fx.push({ kind: 'miss', panel, x, y, at: now });
        this.sfx.miss();
        this.toast(`Nothing there — ${SCORING.missPenaltySeconds} seconds lost`);
        this.shake();
      } else if (ev.type === 'level-complete') {
        this.sfx.win();
        this.finishLevel(ev);
      } else if (ev.type === 'time-up') {
        this.sfx.lose();
        this.showGameOver();
      }
    }
  }

  finishLevel(ev) {
    const level = this.state.level;
    this.runScores[level.id] = this.state.score;
    this.best[level.id] = Math.max(this.best[level.id] ?? 0, ev.stars);
    saveBest(this.best);
    this.completeTimer = window.setTimeout(() => {
      this.$('complete-stars').textContent = '★'.repeat(ev.stars) + '☆'.repeat(3 - ev.stars);
      this.$('complete-title').textContent =
        this.state.levelIndex + 1 >= LEVELS.length ? 'All three mysteries solved!' : `${level.name} — cleared!`;
      const finds = this.state.score - ev.bonus;
      this.$('complete-breakdown').textContent =
        `Finds ${finds} · Time bonus +${ev.bonus} · Level score ${this.state.score} · Total ${this.totalScore()}`;
      this.$('btn-next').textContent =
        this.state.levelIndex + 1 >= LEVELS.length ? 'See the ending' : 'Next level';
      this.showOverlay('overlay-complete');
    }, 900);
  }

  showGameOver() {
    const found = this.state.found.length;
    const total = this.state.level.scene.differences.length;
    this.$('gameover-found').textContent = `You found ${found} of ${total} differences.`;
    this.showOverlay('overlay-gameover');
  }

  showFinal() {
    this.$('final-score').textContent = `Total score: ${this.totalScore()}`;
    const stars = LEVELS.reduce((n, l) => n + (this.best[l.id] ?? 0), 0);
    this.$('final-stars').textContent = '★'.repeat(stars) + '☆'.repeat(9 - stars);
    this.showOverlay('overlay-final');
  }

  totalScore() {
    return Object.values(this.runScores).reduce((a, b) => a + b, 0);
  }

  useHint() {
    if (this.screen !== 'play' || !this.state || this.state.status !== 'playing' || this.paused) return;
    this.sfx.ensure();
    const { state, events } = applyHint(this.state);
    this.state = state;
    if (events[0].type === 'hint') {
      this.hintFx = { difference: events[0].difference, at: performance.now() };
      this.sfx.hint();
      this.toast(`Hint: look near here (−${SCORING.hintCost} points)`);
    } else {
      this.toast('No hints left — or nothing left to find');
    }
    this.updateHud();
  }

  shake() {
    const panels = this.$('panels');
    panels.classList.remove('shake');
    void panels.offsetWidth; // restart the animation
    panels.classList.add('shake');
  }

  toast(msg) {
    const el = this.$('toast');
    el.textContent = msg;
    el.classList.add('show');
    if (this.toastTimer) window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => el.classList.remove('show'), 2200);
  }

  // ------------------------------------------------------------ HUD

  updateHud() {
    const s = this.state;
    if (!s) return;
    const total = s.level.scene.differences.length;
    this.$('hud-found').textContent = `${s.found.length} / ${total} found`;
    this.$('hud-score').textContent = `Score ${s.score}`;
    this.$('hud-streak').textContent = s.streak >= 2 ? `Streak ×${s.streak}` : '';
    this.$('hud-time').textContent = fmtTime(s.timeLeft);
    this.$('hint-count').textContent = String(s.hintsLeft);
    const ratio = s.timeLeft / s.level.timeLimit;
    const fill = this.$('timer-fill');
    fill.style.width = `${Math.max(0, ratio * 100)}%`;
    fill.classList.toggle('warn', s.timeLeft <= TIMER.warnAt && s.timeLeft > TIMER.dangerAt);
    fill.classList.toggle('danger', s.timeLeft <= TIMER.dangerAt);
    const dots = this.$('found-dots');
    dots.innerHTML = '';
    for (const d of s.level.scene.differences) {
      const dot = this.doc.createElement('span');
      dot.className = `dot${s.found.includes(d.id) ? ' found' : ''}`;
      dots.appendChild(dot);
    }
  }

  // ------------------------------------------------------------ loop

  boot() {
    this.showScreen('menu');
    const step = (now) => {
      if (this.screen === 'play' && this.state) {
        if (!this.staging && !this.paused && this.state.status === 'playing') {
          const dt = Math.min(0.25, (now - (this.lastNow || now)) / 1000);
          this.acc += dt;
          while (this.acc >= 1) {
            this.acc -= 1;
            const before = this.state.timeLeft;
            const { state, events } = tick(this.state, 1);
            this.state = state;
            if (before <= TIMER.dangerAt && before > 1) this.sfx.tick();
            for (const ev of events) {
              if (ev.type === 'time-up') {
                this.sfx.lose();
                this.showGameOver();
              }
            }
            this.updateHud();
          }
        }
        this.render(now);
      }
      this.lastNow = now;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  render(now) {
    if (!this.state) return;
    paintPanels(this.lctx, this.rctx, this.state.level.scene);
    for (const m of this.markers) {
      const d = m.difference;
      drawFoundMarker(this.lctx, d.x, d.y, now - m.at);
      drawFoundMarker(this.rctx, d.x2 ?? d.x, d.y2 ?? d.y, now - m.at);
    }
    if (this.hintFx) {
      const d = this.hintFx.difference;
      const aliveL = drawHintRing(this.lctx, d.x, d.y, now - this.hintFx.at, HINT_RING_MS);
      const aliveR = drawHintRing(this.rctx, d.x2 ?? d.x, d.y2 ?? d.y, now - this.hintFx.at, HINT_RING_MS);
      if (!aliveL && !aliveR) this.hintFx = null;
    }
    this.fx = this.fx.filter((e) => {
      const ctx = e.panel === 'left' ? this.lctx : this.rctx;
      if (e.kind === 'miss') return drawMissMark(ctx, e.x, e.y, now - e.at);
      if (e.kind === 'pop') return drawScorePop(ctx, e.x, e.y, e.text, now - e.at);
      return false;
    });
  }

  // ------------------------------------------------------------ staging (screenshots only)

  stageFound(indices) {
    const now = performance.now();
    const list = this.state.level.scene.differences;
    let score = 0;
    indices.forEach((idx, order) => {
      const d = list[idx];
      if (!d || this.state.found.includes(d.id)) return;
      this.state.found.push(d.id);
      this.markers.push({ difference: d, at: now - 1000 });
      score += scoreForFind(order);
    });
    this.state.score += score;
    this.state.streak = this.state.found.length;
    this.updateHud();
  }

  stageTime(seconds) {
    this.state.timeLeft = seconds;
    this.updateHud();
  }

  stageScore(score) {
    this.state.score = score;
    this.updateHud();
  }

  stageHint() {
    const remaining = this.state.level.scene.differences.filter((d) => !this.state.found.includes(d.id));
    if (remaining.length > 0) {
      this.hintFx = { difference: remaining[0], at: performance.now() - 600 };
    }
  }

  stageComplete(stars) {
    this.state.status = 'won';
    this.$('complete-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    this.$('complete-title').textContent = `${this.state.level.name} — cleared!`;
    this.$('complete-breakdown').textContent =
      `Finds ${this.state.score} · Level score ${this.state.score} · Total ${this.totalScore() + this.state.score}`;
    this.$('btn-next').textContent = 'Next level';
    this.showOverlay('overlay-complete');
  }

  stageGameOver() {
    this.state.status = 'lost';
    this.state.timeLeft = 0;
    this.updateHud();
    this.showGameOver();
  }
}
