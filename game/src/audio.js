// Synthesized sound effects (WebAudio, no audio files). Every sound is a
// short oscillator envelope; nothing plays before the first user gesture,
// and everything no-ops when audio is unavailable or muted.

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  tone(freq, dur, type = 'sine', vol = 0.15, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  click() {
    this.tone(660, 0.07, 'triangle', 0.08);
  }

  pop() {
    this.tone(523, 0.09, 'sine', 0.18);
    this.tone(784, 0.12, 'sine', 0.16, 0.07);
  }

  miss() {
    this.tone(160, 0.16, 'square', 0.08);
    this.tone(110, 0.2, 'square', 0.06, 0.05);
  }

  hint() {
    this.tone(880, 0.14, 'sine', 0.12);
    this.tone(1174, 0.18, 'sine', 0.1, 0.1);
  }

  win() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.14, i * 0.11));
  }

  lose() {
    [392, 330, 262].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.1, i * 0.14));
  }

  tick() {
    this.tone(980, 0.05, 'square', 0.05);
  }
}
