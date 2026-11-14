'use strict';
// Shared constants, helpers, input and audio. Everything is a plain global so the
// game runs from index.html opened directly (ES modules are blocked on file://).

const TILE = 16;
const DIRS = { down: 0, up: 1, right: 2, left: 3 };
const DX = [0, 0, 1, -1];
const DY = [1, -1, 0, 0];
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
const DAYS_IN_SEASON = 28;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const key = (x, y) => x + ',' + y;

function mulberry(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// ---- Input ---------------------------------------------------------------
const KEYMAP = {
  up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
  use: ['KeyC', 'KeyJ'], act: ['KeyE', 'Space', 'KeyX'], confirm: ['Enter', 'Space', 'KeyE'],
  menu: ['Tab', 'KeyI'], cancel: ['Escape'], tabL: ['KeyQ'], tabR: ['KeyR'], mute: ['KeyP'], map: ['KeyM'], dodge: ['KeyF'], sneak: ['KeyZ'], ride: ['KeyH'],
};

const Input = {
  held: new Set(), hits: new Set(), typed: [],
  mouse: { x: 0, y: 0, left: false, right: false, clickL: false, clickR: false, wheel: 0, moved: false },
  isDown(action) { return KEYMAP[action].some(c => this.held.has(c)); },
  hit(action) { return KEYMAP[action].some(c => this.hits.has(c)); },
  // Swallow a press so a second handler in the same frame does not also see it.
  consume(action) { KEYMAP[action].forEach(c => this.hits.delete(c)); },
  endFrame() {
    this.hits.clear(); this.typed.length = 0;
    this.mouse.clickL = this.mouse.clickR = this.mouse.moved = false; this.mouse.wheel = 0;
  },
  attach(canvas, toLogical) {
    addEventListener('keydown', e => {
      if (!e.repeat) { this.held.add(e.code); this.hits.add(e.code); this.typed.push(e.code); }
      if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      Sfx.unlock();
    });
    addEventListener('keyup', e => this.held.delete(e.code));
    addEventListener('blur', () => { this.held.clear(); this.mouse.left = this.mouse.right = false; });
    canvas.addEventListener('mousemove', e => {
      const p = toLogical(e.clientX, e.clientY); this.mouse.x = p.x; this.mouse.y = p.y; this.mouse.moved = true;
    });
    canvas.addEventListener('mousedown', e => {
      const p = toLogical(e.clientX, e.clientY); this.mouse.x = p.x; this.mouse.y = p.y;
      if (e.button === 0) { this.mouse.left = true; this.mouse.clickL = true; }
      if (e.button === 2) { this.mouse.right = true; this.mouse.clickR = true; }
      Sfx.unlock(); canvas.focus(); e.preventDefault();
    });
    addEventListener('mouseup', e => {
      if (e.button === 0) this.mouse.left = false;
      if (e.button === 2) this.mouse.right = false;
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('wheel', e => { this.mouse.wheel += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
  },
};

// ---- Audio: everything is synthesised, there are no sound files ------------
const Sfx = {
  ctx: null, master: null, muted: false, nextNote: 0, step: 0,
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.ctx.destination);
    this.nextNote = this.ctx.currentTime + 0.5;
  },
  toggleMute() { this.muted = !this.muted; if (this.master) this.master.gain.value = this.muted ? 0 : 0.5; },
  tone(freq, dur, type = 'square', vol = 0.12, when = 0, slide = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol = 0.15, cutoff = 1400) {
    if (!this.ctx) return;
    const n = Math.floor(this.ctx.sampleRate * dur), b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * (1 - i / n);
    const s = this.ctx.createBufferSource(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    s.buffer = b; f.type = 'lowpass'; f.frequency.value = cutoff; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(this.master); s.start();
  },
  play(name) {
    switch (name) {
      case 'click': this.tone(640, 0.05, 'square', 0.05); break;
      case 'talk': this.tone(300 + Math.random() * 90, 0.03, 'square', 0.025); break;
      case 'hoe': this.noise(0.14, 0.22, 700); break;
      case 'water': this.noise(0.28, 0.12, 3200); break;
      case 'chop': this.noise(0.08, 0.3, 1800); this.tone(150, 0.08, 'square', 0.1); break;
      case 'pick': this.tone(900, 0.06, 'square', 0.08); this.noise(0.07, 0.2, 3600); break;
      case 'crack': this.noise(0.3, 0.32, 900); break;
      case 'plant': this.tone(420, 0.07, 'triangle', 0.14); break;
      case 'harvest': this.tone(520, 0.08, 'triangle', 0.16); this.tone(780, 0.1, 'triangle', 0.16, 0.07); break;
      case 'coin': this.tone(990, 0.06, 'square', 0.07); this.tone(1320, 0.14, 'square', 0.07, 0.06); break;
      case 'door': this.noise(0.12, 0.2, 500); this.tone(110, 0.12, 'triangle', 0.14); break;
      case 'hoof': this.noise(0.04, 0.09, 520); break;
      case 'neigh': this.tone(620, 0.34, 'sawtooth', 0.04, 0, -240); this.tone(760, 0.2, 'triangle', 0.05, 0.05, -300); break;
      case 'swing': this.noise(0.1, 0.16, 2600); break;
      case 'hurt': this.tone(220, 0.16, 'square', 0.12, 0, -120); this.noise(0.1, 0.2, 900); break;
      case 'bad': this.tone(170, 0.2, 'square', 0.08, 0, -60); break;
      case 'quest': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.15, i * 0.09)); break;
      case 'heart': this.tone(660, 0.1, 'triangle', 0.15); this.tone(880, 0.18, 'triangle', 0.15, 0.09); break;
      case 'bite': this.tone(1100, 0.1, 'square', 0.1); this.tone(1400, 0.12, 'square', 0.1, 0.1); break;
      case 'splash': this.noise(0.22, 0.2, 2400); break;
      case 'eat': this.noise(0.06, 0.2, 1000); this.noise(0.06, 0.2, 1000); break;
      case 'level': [392, 523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.15, i * 0.1)); break;
    }
  },
  // A quiet generative pentatonic melody. Season shifts the root, night slows it.
  music(season, isNight) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    if (this.nextNote < now - 1) this.nextNote = now + 0.1;
    const root = [261.6, 293.7, 220, 196][season] || 261.6;
    const scale = [0, 2, 4, 7, 9, 12, 14, 16];
    const beat = isNight ? 0.95 : 0.62;
    while (this.nextNote < now + 0.4) {
      const when = this.nextNote - now;
      if (this.step % 8 === 0) {
        const bass = root / 2 * Math.pow(2, pick([0, 0, 5, 7]) / 12);
        this.tone(bass, beat * 5, 'sine', 0.06, when);
        this.tone(bass * 1.5, beat * 5, 'sine', 0.03, when);
      }
      if (Math.random() < (isNight ? 0.34 : 0.58)) {
        const f = root * Math.pow(2, pick(scale) / 12);
        this.tone(f, beat * 2.4, 'triangle', 0.045, when);
      }
      this.nextNote += beat; this.step++;
    }
  },
};
