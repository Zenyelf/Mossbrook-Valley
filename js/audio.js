'use strict';
// Sound, music and ambience, all synthesised in the browser: there are no audio files.
//  - Sound effects come in variants and shift pitch a little every time, so nothing
//    sounds quite the same twice, and most actions now have a sound of their own.
//  - Every place has its own theme. Each theme is a short composed song (a melody
//    with a verse and a bridge over a chord progression, bass, pads and drums) that
//    the game writes once from the theme's seed, so a place always sounds like itself.
//    Night slows outdoor themes down; fights, champions and the Pit have their own.
//  - Ambience runs underneath: birds, crickets, waves, wind, drips, rain, a crowd.

(() => {
  const R = Math.random, any = a => a[Math.floor(R() * a.length)];
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);
  const PREFS = 'mossbrook_audio';
  const coreUnlock = Sfx.unlock, coreMute = Sfx.toggleMute;

  // ---- The mixer ------------------------------------------------------------------
  Object.assign(Sfx, {
    vol: { music: 1, sfx: 1 }, last: {}, pk: 1,
    loadPrefs() {
      try { const p = JSON.parse(localStorage.getItem(PREFS) || 'null'); if (p) { this.vol.music = clamp(+p.music, 0, 1); this.vol.sfx = clamp(+p.sfx, 0, 1); } } catch (e) { /* private window */ }
    },
    savePrefs() { try { localStorage.setItem(PREFS, JSON.stringify(this.vol)); } catch (e) { /* private window */ } },
    unlock() {
      coreUnlock.call(this);
      if (!this.ctx || this.sfxBus) return;
      const c = this.ctx;
      this.sfxBus = c.createGain(); this.musicBus = c.createGain(); this.ambBus = c.createGain(); this.duckGain = c.createGain();
      this.sfxBus.connect(this.master); this.ambBus.connect(this.master);
      // The music runs through a limiter, so it can be loud without ever crackling on a big drum hit.
      this.musicLimiter = c.createDynamicsCompressor();
      [['threshold', -8], ['knee', 6], ['ratio', 12], ['attack', 0.003], ['release', 0.25]].forEach(([k, v]) => { this.musicLimiter[k].value = v; });
      this.musicBus.connect(this.duckGain); this.duckGain.connect(this.musicLimiter); this.musicLimiter.connect(this.master);
      // A soft echo under the music and ambience; caves get more of it.
      this.echo = c.createDelay(1); this.echo.delayTime.value = 0.27;
      this.echoFb = c.createGain(); this.echoFb.gain.value = 0.25;
      const wet = c.createGain(); wet.gain.value = 0.25;
      this.duckGain.connect(this.echo); this.ambBus.connect(this.echo);
      this.echo.connect(this.echoFb); this.echoFb.connect(this.echo); this.echo.connect(wet); wet.connect(this.master);
      const n = c.sampleRate * 2, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = b;
      this.applyVol();
    },
    applyVol() {
      if (!this.sfxBus) return;
      this.sfxBus.gain.value = this.vol.sfx;
      this.ambBus.gain.value = 0.7 * this.vol.sfx;
      this.musicBus.gain.value = 2.4 * this.vol.music; // three times the original 0.8
    },
    setVol(kind, v) { this.vol[kind] = clamp(v, 0, 1); this.applyVol(); this.savePrefs(); },
    toggleMute() { coreMute.call(this); },
    // Big moments (a quest done, a level up) dip the music so you hear them.
    duck(t = 1.4) {
      if (!this.duckGain) return;
      const g = this.duckGain.gain, now = this.ctx.currentTime;
      g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(0.35, now + 0.08); g.linearRampToValueAtTime(1, now + t);
    },

    // One oscillator note. `out` defaults to the sound-effect bus.
    tone(freq, dur, type = 'square', vol = 0.12, when = 0, slide = 0, out, attack = 0) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + when, o = this.ctx.createOscillator(), g = this.ctx.createGain();
      const f = out ? freq : freq * this.pk;
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide * (out ? 1 : this.pk)), t + dur);
      if (attack) { g.gain.setValueAtTime(0.0008, t); g.gain.linearRampToValueAtTime(vol, t + attack); }
      else g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      o.connect(g); g.connect(out || this.sfxBus || this.master); o.start(t); o.stop(t + dur + 0.03);
    },
    // Filtered noise. o: { type: lowpass|highpass|bandpass, q, to (sweep), when, attack, out }
    noise(dur, vol = 0.15, cutoff = 1400, o = {}) {
      if (!this.ctx || !this.noiseBuf) return;
      const c = this.ctx, t = c.currentTime + (o.when || 0);
      const s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
      s.buffer = this.noiseBuf; f.type = o.type || 'lowpass'; f.Q.value = o.q || (f.type === 'bandpass' ? 1.2 : 0.7);
      const cut = o.out ? cutoff : cutoff * this.pk;
      f.frequency.setValueAtTime(cut, t);
      if (o.to) f.frequency.exponentialRampToValueAtTime(Math.max(40, o.to), t + dur);
      if (o.attack) { g.gain.setValueAtTime(0.0008, t); g.gain.linearRampToValueAtTime(vol, t + o.attack); }
      else g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      s.connect(f); f.connect(g); g.connect(o.out || this.sfxBus || this.master);
      s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
    },

    play(name, arg) {
      if (!this.ctx || !this.sfxBus) return;
      const fn = SOUNDS[name];
      if (!fn) return;
      const now = this.ctx.currentTime;
      if (!FREE[name] && now - (this.last[name] || -1) < 0.035) return;
      this.last[name] = now;
      this.pk = STEADY[name] ? 1 : 1 + (R() - 0.5) * 0.1;
      fn.call(this, arg);
      this.pk = 1;
      if (JINGLE[name]) this.duck(JINGLE[name]);
    },

    // Called every frame by the game loop.
    music() { if (!this.ctx || !this.sfxBus) return; try { Music.update(); } catch (e) { Music.cur = null; Music.song = null; } try { Ambience.update(); } catch (e) { /* skip this frame */ } },
  });
  Sfx.loadPrefs();

  // Sounds that may repeat as fast as they like, and ones that must stay in tune.
  const FREE = { talk: 1, step: 1, pin: 1, hoof: 1 };
  const STEADY = { quest: 1, quest_done: 1, level: 1, discover: 1, victory: 1, defeat: 1, sleep: 1, save: 1, wave_clear: 1, boss_intro: 1, revive: 1, heart: 1, sad: 1, open: 1, close: 1 };
  const JINGLE = { quest: 1.2, quest_done: 1.8, level: 1.8, discover: 1.2, victory: 2.4, defeat: 2.2, sleep: 2, wave_clear: 1.6, boss_intro: 2, revive: 1.6 };
  // ---- Building blocks: a filtered tone (warm, voice-like), a bell (sine plus the
  // inharmonic partials real bells have), a pitched thump, a knock of filtered noise.
  const ftone = (s, f, dur, type, vol, when = 0, slide = 0, cutoff = 2000, attack = 0.006) => {
    const c = s.ctx, t = c.currentTime + when, o = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain(), fr = f * s.pk;
    o.type = type; o.frequency.setValueAtTime(fr, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, fr + slide * s.pk), t + dur);
    fl.type = 'lowpass'; fl.frequency.value = cutoff; fl.Q.value = 1.2;
    g.gain.setValueAtTime(0.0008, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(fl); fl.connect(g); g.connect(s.sfxBus); o.start(t); o.stop(t + dur + 0.03);
  };
  const bell = (s, f, dur, vol, when = 0) => {
    s.tone(f, dur, 'sine', vol, when, 0, undefined, 0.003);
    s.tone(f * 2.76, dur * 0.55, 'sine', vol * 0.32, when, 0, undefined, 0.002);
    s.tone(f * 5.4, dur * 0.3, 'sine', vol * 0.1, when, 0, undefined, 0.002);
  };
  const bells = (s, notes, gap, dur, vol, when = 0) => notes.forEach((f, i) => bell(s, f, dur, vol, when + i * gap));
  const thump = (s, f0, f1, dur, vol, when = 0) => s.tone(f0, dur, 'sine', vol, when, f1 - f0);
  const knock = (s, f, dur, vol, when = 0, q = 3) => s.noise(dur, vol, f, { type: 'bandpass', q, when });
  const tick = (s, f, vol, when = 0) => s.noise(0.025, vol, f, { type: 'highpass', when });
  const debris = (s, n, from, vol) => { for (let i = 0; i < n; i++) knock(s, 2500 + R() * 3500, 0.03, vol, from + R() * 0.25, 4); };
  const bubbles = (s, n, from, vol = 0.06) => { for (let i = 0; i < n; i++) s.tone(300 + R() * 600, 0.05, 'sine', vol, from + i * (0.04 + R() * 0.04), 500); };
  // A sound with several distinct versions: one is picked each time.
  const V = (...fns) => function (a) { return fns[Math.floor(R() * fns.length)].call(this, a); };

  // ---- Every sound in the game ---------------------------------------------------
  const SOUNDS = {
    // The interface
    click: V(function () { knock(this, 2600, 0.03, 0.13, 0, 5); this.tone(1500, 0.025, 'sine', 0.04); },
      function () { knock(this, 3300, 0.025, 0.12, 0, 6); this.tone(1750, 0.02, 'sine', 0.035); }),
    open() { this.noise(0.12, 0.06, 2400, { type: 'bandpass', to: 4200 }); bell(this, 880, 0.3, 0.06, 0.02); bell(this, 1320, 0.35, 0.05, 0.08); },
    close() { this.noise(0.12, 0.06, 4000, { type: 'bandpass', to: 2000 }); bell(this, 1320, 0.25, 0.05, 0.02); bell(this, 880, 0.3, 0.05, 0.08); },
    deny() { thump(this, 330, 220, 0.12, 0.17); thump(this, 270, 170, 0.16, 0.15, 0.11); },
    bad() { ftone(this, 330, 0.28, 'sawtooth', 0.08, 0, 0, 900); ftone(this, 247, 0.4, 'sawtooth', 0.08, 0.14, 0, 800); },
    sad() { bells(this, [659, 587, 494], 0.17, 0.6, 0.06); },
    save() { knock(this, 1800, 0.05, 0.1, 0, 2); bells(this, [784, 988, 1175], 0.07, 0.7, 0.06, 0.04); },
    // Every speaker has a voice of their own, worked out from their name.
    talk(who) {
      let h = 7; for (const ch of String(who || 'tam')) h = (h * 31 + ch.charCodeAt(0)) % 9973;
      const base = 120 + (h % 220), m = any([1, 1.12, 1.25, 0.9, 1.06, 1.33]), f = base * m;
      ftone(this, f, 0.075, 'sawtooth', 0.045, 0, f * (R() < 0.5 ? 0.18 : -0.14), base * 6, 0.008);
      this.tone(f * 2, 0.06, 'sine', 0.014, 0.005);
    },

    // The farm
    hoe: V(function () { thump(this, 140, 55, 0.12, 0.24); knock(this, 800, 0.1, 0.22, 0, 1.5); tick(this, 5000, 0.05, 0.03); tick(this, 4000, 0.04, 0.07); },
      function () { thump(this, 120, 50, 0.14, 0.22); this.noise(0.14, 0.2, 1100); tick(this, 4500, 0.05, 0.05); },
      function () { thump(this, 160, 60, 0.1, 0.22); knock(this, 650, 0.12, 0.22, 0, 1.2); debris(this, 2, 0.03, 0.05); }),
    water() { this.noise(0.5, 0.09, 1600, { type: 'bandpass', to: 800, attack: 0.05 }); bubbles(this, 7, 0.04, 0.05); },
    refill() { for (let i = 0; i < 4; i++) thump(this, 200 + R() * 60, 420, 0.1, 0.14, i * 0.13); this.noise(0.5, 0.05, 900); },
    plant() { knock(this, 600, 0.06, 0.16, 0, 1); thump(this, 480, 950, 0.06, 0.11, 0.04); },
    harvest: V(function () { knock(this, 1800, 0.05, 0.18, 0, 2); thump(this, 620, 300, 0.08, 0.1); bell(this, 1047, 0.35, 0.06, 0.06); },
      function () { knock(this, 1500, 0.06, 0.18, 0, 2); thump(this, 560, 280, 0.08, 0.1); bell(this, 1175, 0.35, 0.06, 0.06); bell(this, 1568, 0.3, 0.04, 0.12); }),
    chop: V(function () { knock(this, 1400, 0.07, 0.34, 0, 4); thump(this, 330, 160, 0.09, 0.17); knock(this, 2600, 0.03, 0.1, 0.04, 6); },
      function () { knock(this, 1100, 0.08, 0.32, 0, 3); thump(this, 280, 140, 0.1, 0.17); tick(this, 5000, 0.05, 0.03); },
      function () { knock(this, 1750, 0.06, 0.32, 0, 5); thump(this, 380, 190, 0.08, 0.15); debris(this, 2, 0.02, 0.05); }),
    tree_fall() {
      ftone(this, 160, 0.6, 'sawtooth', 0.05, 0, -60, 700, 0.05);
      this.noise(0.7, 0.4, 500, { when: 0.55 }); thump(this, 90, 35, 0.5, 0.3, 0.55); this.noise(0.5, 0.06, 5000, { type: 'highpass', when: 0.6 });
    },
    pick: V(function () { bell(this, 1900, 0.22, 0.07); knock(this, 4200, 0.04, 0.2, 0, 2); tick(this, 7000, 0.06, 0.02); },
      function () { bell(this, 2150, 0.2, 0.07); knock(this, 3600, 0.04, 0.2, 0, 2); },
      function () { bell(this, 1700, 0.25, 0.06); knock(this, 4800, 0.035, 0.18, 0, 2); debris(this, 2, 0.03, 0.05); }),
    rock_break() { this.noise(0.35, 0.32, 1000); thump(this, 150, 50, 0.22, 0.22); debris(this, 6, 0.04, 0.08); },
    weed() { this.noise(0.14, 0.13, 3000, { type: 'bandpass', q: 1.5, to: 900 }); tick(this, 6000, 0.04, 0.05); },
    cluck: V(function () { ftone(this, 700, 0.06, 'square', 0.06, 0, -260, 2500); ftone(this, 640, 0.08, 'square', 0.06, 0.1, -240, 2500); },
      function () { for (let i = 0; i < 3; i++) ftone(this, 660 + i * 30, 0.05, 'square', 0.05, i * 0.08, -250, 2500); }),
    rooster() { [[500, 0, 0.12, 380], [880, 0.13, 0.1, -180], [700, 0.24, 0.12, 420], [1120, 0.37, 0.4, -500]].forEach(([f, w, d, sl]) => ftone(this, f, d, 'sawtooth', 0.06, w, sl, 2600)); },
    eat: V(function () { for (let i = 0; i < 3; i++) knock(this, 1400 + R() * 900, 0.05, 0.2, i * 0.1, 1.5); this.tone(220, 0.2, 'sine', 0.04, 0.32); },
      function () { for (let i = 0; i < 4; i++) knock(this, 1800 + R() * 900, 0.04, 0.18, i * 0.08, 2); }),
    drink() { for (let i = 0; i < 3; i++) thump(this, 180, 270, 0.09, 0.14, i * 0.15); this.noise(0.4, 0.03, 1200); },
    pickup() { thump(this, 500, 1100, 0.07, 0.13); bell(this, 1568, 0.18, 0.04, 0.04); },

    // Money and progress
    coin: V(function () { bell(this, 1568, 0.3, 0.08); bell(this, 2093, 0.45, 0.08, 0.07); },
      function () { bell(this, 1760, 0.3, 0.08); bell(this, 2349, 0.45, 0.07, 0.07); }),
    buy() { knock(this, 3000, 0.03, 0.14, 0, 4); bell(this, 1319, 0.25, 0.07, 0.04); bell(this, 1760, 0.5, 0.07, 0.12); tick(this, 6000, 0.04, 0.12); },
    sell() { for (let i = 0; i < 6; i++) bell(this, 1600 + R() * 1000, 0.16, 0.035, i * 0.045); },
    quest() { bells(this, [523, 659, 784, 1047], 0.09, 0.8, 0.07); this.tone(262, 0.9, 'triangle', 0.05, 0, 0, undefined, 0.05); },
    quest_done() {
      [523, 659, 784].forEach((f, i) => ftone(this, f, 0.14, 'square', 0.07, i * 0.08, 0, 2500));
      bells(this, [1047, 1319, 1568], 0, 1.3, 0.05, 0.26); this.tone(262, 1.2, 'triangle', 0.08, 0.26, 0, undefined, 0.02);
    },
    level() { bells(this, [392, 523, 659, 784, 1047, 1319], 0.08, 0.7, 0.06); this.noise(0.8, 0.04, 6000, { type: 'highpass', attack: 0.3 }); },
    discover() { bells(this, [1568, 2093, 2637, 3136], 0.05, 0.4, 0.05); this.noise(0.3, 0.05, 1500, { type: 'bandpass', to: 6000 }); },
    heart() { this.tone(440, 0.4, 'sine', 0.06, 0, 0, undefined, 0.02); bell(this, 880, 0.35, 0.06); bell(this, 1175, 0.45, 0.06, 0.1); },
    heal() { this.tone(400, 0.45, 'sine', 0.08, 0, 500, undefined, 0.1); bells(this, [1568, 2093], 0.08, 0.3, 0.04, 0.15); },
    revive() { bells(this, [523, 659, 784, 1047, 1319, 1568], 0.07, 0.6, 0.06); this.noise(1, 0.06, 2000, { type: 'bandpass', attack: 0.4 }); },

    // Moving about
    step(kind) {
      if (kind === 'water') { this.noise(0.1, 0.09, 1600, { type: 'bandpass' }); return bubbles(this, 1, 0.02, 0.03); }
      if (kind === 'wood') { thump(this, any([220, 240, 200]), 140, 0.05, 0.11); return knock(this, 900, 0.03, 0.06, 0, 2); }
      if (kind === 'stone') { knock(this, any([2000, 2300, 2600]), 0.03, 0.11, 0, 4); return thump(this, 160, 100, 0.03, 0.05); }
      if (kind === 'sand') return this.noise(0.08, 0.07, any([3200, 3600]), { type: 'bandpass', q: 0.5 });
      this.noise(0.06, 0.09, any([800, 950, 1100]), { type: 'bandpass', q: 0.8 }); tick(this, 5000, 0.02, 0.01);
    },
    hoof: V(function () { thump(this, 190, 90, 0.06, 0.15); knock(this, 1200, 0.03, 0.11, 0, 3); },
      function () { thump(this, 160, 80, 0.06, 0.15); knock(this, 1000, 0.03, 0.11, 0, 3); }),
    neigh() { ftone(this, 620, 0.5, 'sawtooth', 0.07, 0, -260, 1800, 0.03); ftone(this, 760, 0.3, 'sawtooth', 0.05, 0.08, -320, 2000); },
    door: V(function () { ftone(this, 150, 0.35, 'sawtooth', 0.045, 0, 40, 900, 0.04); knock(this, 2500, 0.03, 0.13, 0.3, 5); thump(this, 120, 60, 0.12, 0.2, 0.33); },
      function () { knock(this, 2800, 0.03, 0.13, 0, 5); thump(this, 130, 60, 0.14, 0.2, 0.05); },
      function () { ftone(this, 190, 0.3, 'sawtooth', 0.04, 0, -50, 1000, 0.04); thump(this, 110, 55, 0.14, 0.2, 0.28); }),
    ladder() { for (let i = 0; i < 3; i++) { knock(this, 1300 - i * 150, 0.05, 0.16, i * 0.13, 3); thump(this, 240 - i * 30, 120, 0.06, 0.1, i * 0.13); } },
    dodge() { this.noise(0.22, 0.18, 600, { type: 'bandpass', q: 2, to: 3200 }); this.noise(0.1, 0.1, 400, { when: 0.05 }); },

    // Fighting
    swing: V(function (w) { const heavy = w && (w.cool >= 0.6 || w.kb >= 1.3); if (heavy) return SOUNDS.heavy_swing.call(this); this.noise(0.14, 0.2, 800, { type: 'bandpass', q: 2.5, to: 3500 }); this.tone(2600, 0.12, 'sine', 0.02, 0.03, 600); },
      function (w) { const heavy = w && (w.cool >= 0.6 || w.kb >= 1.3); if (heavy) return SOUNDS.heavy_swing.call(this); this.noise(0.12, 0.2, 1100, { type: 'bandpass', q: 2.5, to: 4000 }); this.tone(3100, 0.1, 'sine', 0.018, 0.02, 500); }),
    heavy_swing() { this.noise(0.26, 0.25, 400, { type: 'bandpass', q: 1.6, to: 1400 }); thump(this, 90, 60, 0.2, 0.06); },
    foe_swing() { this.noise(0.13, 0.15, 700, { type: 'bandpass', q: 2, to: 2200 }); },
    whoosh() { this.noise(0.4, 0.2, 300, { type: 'bandpass', q: 1.5, to: 2800, attack: 0.1 }); },
    shoot() { ftone(this, 300, 0.14, 'sawtooth', 0.08, 0, -80, 1600); this.tone(150, 0.1, 'sine', 0.06); this.noise(0.15, 0.04, 3000, { type: 'highpass', when: 0.02 }); },
    throw() { this.noise(0.18, 0.17, 700, { type: 'bandpass', to: 1900 }); tick(this, 4000, 0.04); },
    magic_cast() { this.tone(600, 0.25, 'sine', 0.08, 0, 800); this.noise(0.3, 0.05, 6000, { type: 'highpass', attack: 0.1 }); bell(this, 1568, 0.25, 0.03, 0.1); },
    hit: V(function (f) { thump(this, 240, 70, 0.12, 0.28); knock(this, 1300, 0.05, 0.24, 0, 2); tick(this, 5000, 0.05, 0.01); SOUNDS.armour.call(this, f); },
      function (f) { thump(this, 210, 60, 0.13, 0.28); knock(this, 1700, 0.05, 0.22, 0, 2.5); SOUNDS.armour.call(this, f); },
      function (f) { thump(this, 270, 80, 0.1, 0.26); knock(this, 1000, 0.06, 0.24, 0, 1.8); tick(this, 6000, 0.04, 0.02); SOUNDS.armour.call(this, f); }),
    armour(f) { if (f && f.def && (f.def.undead || f.def.heavy)) { bell(this, any([700, 820]), 0.25, 0.05); knock(this, 3000, 0.04, 0.12, 0, 4); } },
    kill(f) {
      if (f && f.def && f.def.boss) return SOUNDS.boom.call(this);
      this.noise(0.35, 0.22, 1600, { to: 250 }); thump(this, 300, 80, 0.25, 0.13); bell(this, 1047, 0.3, 0.03, 0.1);
    },
    hurt: V(function () { ftone(this, 260, 0.18, 'triangle', 0.15, 0, -100, 1400); ftone(this, 180, 0.16, 'sawtooth', 0.05, 0, -60, 900); knock(this, 900, 0.06, 0.2, 0, 1); },
      function () { ftone(this, 300, 0.16, 'triangle', 0.15, 0, -120, 1500); ftone(this, 200, 0.14, 'sawtooth', 0.05, 0, -70, 900); knock(this, 1100, 0.06, 0.2, 0, 1); }),
    crack: V(function () { knock(this, 900, 0.22, 0.32, 0, 1); }, function () { knock(this, 1250, 0.2, 0.3, 0, 1.2); debris(this, 2, 0.05, 0.05); }),
    boom() { thump(this, 120, 35, 0.6, 0.36); this.noise(0.8, 0.45, 900, { to: 120 }); this.noise(0.1, 0.12, 3000, { type: 'highpass' }); },
    cannon() { thump(this, 100, 28, 0.9, 0.4); this.noise(1.1, 0.5, 800, { to: 90 }); this.noise(0.08, 0.2, 3500, { type: 'highpass' }); },
    fire() { this.noise(0.5, 0.22, 500, { type: 'bandpass', to: 1400, attack: 0.05 }); for (let i = 0; i < 6; i++) tick(this, 3500, 0.08, 0.05 + R() * 0.4); },
    frost() { bells(this, [2637, 3136, 3520], 0.04, 0.45, 0.04); this.noise(0.4, 0.06, 7000, { type: 'highpass' }); },
    thunder() { this.noise(0.08, 0.4, 2000, { type: 'highpass' }); this.noise(1.4, 0.35, 250, { when: 0.05 }); thump(this, 70, 30, 1, 0.2, 0.05); },
    magic() { this.tone(700, 0.3, 'sine', 0.08, 0, 700); this.tone(1050, 0.25, 'triangle', 0.05, 0.05, -550); this.noise(0.25, 0.04, 6000, { type: 'highpass' }); },
    blink() { this.tone(1500, 0.18, 'sine', 0.08, 0, -1200); this.noise(0.15, 0.06, 4000, { type: 'highpass' }); bell(this, 2093, 0.2, 0.03, 0.15); },
    splat() { this.noise(0.22, 0.28, 900, { to: 150 }); thump(this, 200, 70, 0.12, 0.17); bubbles(this, 3, 0.05, 0.05); },
    thud() { thump(this, 110, 40, 0.3, 0.32); this.noise(0.25, 0.3, 400); },
    slam() { thump(this, 90, 30, 0.45, 0.4); this.noise(0.5, 0.36, 500); debris(this, 4, 0.05, 0.06); },
    quake() { this.noise(1.4, 0.4, 180, { attack: 0.1 }); thump(this, 60, 30, 1.2, 0.26); debris(this, 6, 0.1, 0.06); },
    charge() { ftone(this, 100, 0.6, 'sawtooth', 0.12, 0, 30, 600, 0.05); this.noise(0.5, 0.16, 400, { type: 'bandpass' }); },
    tongue() { thump(this, 250, 900, 0.15, 0.15); knock(this, 1500, 0.12, 0.1, 0.12, 2); thump(this, 900, 250, 0.12, 0.1, 0.15); },
    leap() { thump(this, 150, 500, 0.3, 0.15); this.noise(0.3, 0.12, 500, { type: 'bandpass', to: 2500 }); },
    crystal() { bell(this, any([1760, 1976]), 0.4, 0.06); bell(this, any([2349, 2637]), 0.35, 0.05, 0.03); knock(this, 6000, 0.05, 0.12, 0, 3); },
    heal_foe() { this.tone(500, 0.3, 'sine', 0.06, 0, 300); bell(this, 1568, 0.2, 0.03, 0.1); },

    // Crime and its consequences
    steal() { this.noise(0.12, 0.07, 1500, { type: 'bandpass', q: 1 }); bell(this, 2093, 0.15, 0.03, 0.1); },
    alarm() { for (let i = 0; i < 4; i++) ftone(this, i % 2 ? 880 : 660, 0.19, 'square', 0.07, i * 0.19, 0, 2000); },
    pin() { knock(this, 3500, 0.02, 0.15, 0, 6); bell(this, 2600, 0.08, 0.03); },
    pin_fail() { this.noise(0.2, 0.15, 2500, { type: 'bandpass', q: 4, to: 1200 }); thump(this, 200, 120, 0.1, 0.09); },
    unlock() { knock(this, 3000, 0.03, 0.16, 0, 5); knock(this, 2200, 0.04, 0.16, 0.08, 5); thump(this, 300, 200, 0.06, 0.1, 0.08); bells(this, [1047, 1568], 0.08, 0.4, 0.05, 0.15); },
    metal() { bell(this, any([520, 600]), 0.6, 0.07); bell(this, any([1310, 1450]), 0.4, 0.05); knock(this, 3500, 0.05, 0.2, 0, 3); },

    // Water and fishing
    splash() { this.noise(0.35, 0.26, 3000, { to: 600 }); bubbles(this, 4, 0.08, 0.05); },
    cast() { this.noise(0.25, 0.12, 800, { type: 'bandpass', to: 3200 }); thump(this, 300, 700, 0.08, 0.12, 0.32); this.noise(0.15, 0.1, 2000, { when: 0.32 }); },
    bite() { bell(this, 1568, 0.15, 0.08); bell(this, 1568, 0.15, 0.08, 0.12); this.noise(0.12, 0.08, 2200, { when: 0.05 }); },
    catch() { this.noise(0.3, 0.22, 2600, { to: 700 }); bells(this, [784, 1047, 1319], 0.07, 0.45, 0.06, 0.1); },
    fish_lost() { ftone(this, 440, 0.5, 'triangle', 0.1, 0, -240, 1500); thump(this, 400, 200, 0.1, 0.08, 0.3); },

    // The Pit and big moments
    wave_start() { ftone(this, 196, 0.8, 'sawtooth', 0.07, 0, 0, 900, 0.06); ftone(this, 294, 0.8, 'sawtooth', 0.05, 0.05, 0, 1000, 0.06); thump(this, 80, 40, 0.3, 0.3); },
    wave_clear() { this.noise(1.5, 0.14, 1200, { type: 'bandpass', q: 0.6, attack: 0.3 }); bells(this, [523, 659, 784], 0.08, 0.6, 0.06); },
    boss_intro() { ftone(this, 98, 1.5, 'sawtooth', 0.1, 0, 0, 700, 0.15); ftone(this, 147, 1.5, 'sawtooth', 0.07, 0, 0, 800, 0.15); for (let i = 0; i < 3; i++) thump(this, 70, 35, 0.3, 0.32, 0.35 + i * 0.32); },
    victory() { [523, 659, 784].forEach((f, i) => ftone(this, f, 0.15, 'square', 0.07, i * 0.1, 0, 2500)); bells(this, [1047, 1319, 1568], 0, 1.3, 0.05, 0.32); this.noise(1.6, 0.12, 1300, { type: 'bandpass', q: 0.7, attack: 0.3, when: 0.2 }); },
    defeat() { [392, 349, 311, 262].forEach((f, i) => ftone(this, f, 0.55, 'triangle', 0.1, i * 0.25, 0, 1200)); this.tone(131, 1.6, 'sine', 0.06, 0.2, 0, undefined, 0.1); },
    sleep() { bells(this, [784, 659, 587, 523, 392], 0.22, 0.9, 0.05); },
  };
  Sfx.SOUNDS = SOUNDS;
  Sfx.kit = { ftone, bell, bells, thump, knock, tick, debris, bubbles, V, any };

  // ---- Music ------------------------------------------------------------------------
  const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], mixo: [0, 2, 4, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10], harmonic: [0, 2, 3, 5, 7, 8, 11], lydian: [0, 2, 4, 6, 7, 9, 11],
  };
  // bpm, root note, scale, chord progression (scale degrees), steps per bar (8, or 6 for a
  // lilt), lead voice, bass pattern (1 root, 3 third, 5 fifth, 8 octave), pad, arpeggio,
  // drums (k kick, s snare, h hat, t tom), echo, and a seed that writes the melody.
  const THEMES = {
    title: { bpm: 76, root: 62, scale: 'dorian', prog: [0, 5, 3, 4], lead: ['triangle', 0.05, 12, 0.5], bass: '1...5...', pad: 0.035, echo: 0.35, seed: 7 },
    farm0: { bpm: 104, root: 60, scale: 'major', prog: [0, 5, 3, 4], lead: ['square', 0.026, 12, 0.62], bass: '1.5.8.5.', pad: 0.02, drums: { k: 'x...x...', h: '..x...x.' }, seed: 11 },
    farm1: { bpm: 112, root: 65, scale: 'major', prog: [0, 4, 5, 3], lead: ['square', 0.026, 12, 0.66], bass: '1.5.1.5.', arp: '1358', pad: 0.015, drums: { k: 'x...x...', h: 'x.x.x.x.', s: '....x...' }, seed: 12 },
    farm2: { bpm: 92, root: 57, scale: 'dorian', prog: [0, 3, 0, 4], lead: ['triangle', 0.05, 12, 0.55], bass: '1...5.3.', pad: 0.03, drums: { k: 'x.......', h: '....x...' }, seed: 13 },
    farm3: { bpm: 80, root: 64, scale: 'lydian', prog: [0, 1, 0, 4], lead: ['sine', 0.05, 24, 0.42], bass: '1.......', pad: 0.04, arp: '1585', echo: 0.4, seed: 14 },
    night: { bpm: 64, root: 57, scale: 'minor', prog: [0, 5, 3, 4], lead: ['sine', 0.045, 12, 0.32], bass: '1.......', pad: 0.045, echo: 0.4, seed: 15 },
    village: { bpm: 118, root: 67, scale: 'major', prog: [0, 3, 4, 0], lead: ['square', 0.025, 12, 0.66], bass: '1.5.1.5.', drums: { k: 'x...x...', h: 'x.x.x.x.', s: '....x...' }, seed: 21 },
    home: { bpm: 96, bar: 6, root: 65, scale: 'major', prog: [0, 3, 4, 0], lead: ['triangle', 0.05, 12, 0.5], bass: '1..5..', pad: 0.03, seed: 22 },
    tavern: { bpm: 150, bar: 6, root: 62, scale: 'mixo', prog: [0, 6, 0, 4], lead: ['square', 0.028, 12, 0.8], bass: '1..5..', drums: { k: 'x..x..', h: '.xx.xx' }, seed: 23 },
    shop: { bpm: 100, root: 70, scale: 'major', prog: [0, 5, 1, 4], lead: ['triangle', 0.05, 0, 0.55], bass: '1.3.5.3.', arp: '1358', drums: { h: '..x...x.' }, seed: 24 },
    shrine: { bpm: 60, root: 64, scale: 'lydian', prog: [0, 1, 4, 0], lead: ['sine', 0.045, 12, 0.3], bass: '1.......', pad: 0.05, echo: 0.48, seed: 25 },
    forest: { bpm: 88, root: 64, scale: 'minor', prog: [0, 5, 6, 4], lead: ['triangle', 0.05, 12, 0.5], bass: '1...5...', pad: 0.02, drums: { t: 't...t.t.' }, seed: 31 },
    mountain: { bpm: 96, root: 62, scale: 'minor', prog: [0, 6, 5, 4], lead: ['square', 0.024, 12, 0.55], bass: '1.1.5.1.', drums: { k: 'x..x....', s: '....x...' }, seed: 32 },
    coast: { bpm: 120, bar: 6, root: 69, scale: 'dorian', prog: [0, 3, 0, 4], lead: ['triangle', 0.05, 0, 0.6], bass: '1..5..', pad: 0.02, drums: { k: 'x.....', h: '...x..' }, seed: 33 },
    keep: { bpm: 70, root: 59, scale: 'phrygian', prog: [0, 1, 0, 6], lead: ['square', 0.02, 0, 0.35], bass: '1.......', pad: 0.04, drums: { t: 't.......' }, echo: 0.42, seed: 41 },
    mine: { bpm: 72, root: 57, scale: 'harmonic', prog: [0, 0, 5, 4], lead: ['sine', 0.05, 12, 0.32], bass: '1...1...', pad: 0.025, echo: 0.48, seed: 42 },
    deep: { bpm: 66, root: 56, scale: 'phrygian', prog: [0, 1, 0, 1], lead: ['triangle', 0.04, 0, 0.3], bass: '1.......', pad: 0.035, drums: { t: 't.....t.' }, echo: 0.5, seed: 43 },
    undercroft: { bpm: 58, root: 55, scale: 'harmonic', prog: [0, 1, 0, 4], lead: ['sine', 0.045, 12, 0.28], bass: '1.......', pad: 0.045, echo: 0.5, seed: 44 },
    gaol: { bpm: 84, root: 60, scale: 'minor', prog: [0, 0, 5, 4], lead: ['triangle', 0.04, 0, 0.4], bass: '1...1...', drums: { k: 'x..x....', h: 'x.x.x.x.' }, seed: 51 },
    blackwing: { bpm: 100, root: 58, scale: 'minor', prog: [0, 0, 1, 0], lead: ['square', 0.02, 0, 0.35], bass: '11111111', drums: { h: '..x...x.', k: 'x.......' }, echo: 0.35, seed: 52 },
    pirates: { bpm: 138, bar: 6, root: 62, scale: 'harmonic', prog: [0, 3, 4, 0], lead: ['square', 0.027, 12, 0.72], bass: '1..5..', drums: { k: 'x..x..', s: '...x..' }, seed: 61 },
    island: { bpm: 116, bar: 6, root: 67, scale: 'mixo', prog: [0, 6, 3, 0], lead: ['triangle', 0.05, 12, 0.6], bass: '1..5..', drums: { k: 'x.....', h: '..x..x' }, seed: 62 },
    court: { bpm: 84, root: 70, scale: 'major', prog: [0, 3, 4, 0], lead: ['square', 0.028, 0, 0.55], bass: '1...5...', pad: 0.035, drums: { k: 'x.......', s: '....x.x.' }, seed: 71 },
    battle: { bpm: 140, root: 64, scale: 'minor', prog: [0, 0, 5, 6], lead: ['square', 0.027, 12, 0.7], bass: '1.1.8.1.', drums: { k: 'x...x...', s: '....x...', h: 'xxxxxxxx' }, seed: 81 },
    boss: { bpm: 150, root: 62, scale: 'harmonic', prog: [0, 5, 1, 4], lead: ['square', 0.03, 12, 0.75], bass: '11811181', drums: { k: 'x.x.x..x', s: '....x...', h: 'x.x.x.x.' }, seed: 82 },
    pit: { bpm: 132, root: 57, scale: 'phrygian', prog: [0, 1, 0, 6], lead: ['square', 0.026, 12, 0.6], bass: '1.1.1.5.', drums: { k: 'x..x.x..', s: '....x...', t: '......tt' }, seed: 83 },
    pit_boss: { bpm: 158, root: 55, scale: 'harmonic', prog: [0, 1, 5, 4], lead: ['sawtooth', 0.018, 12, 0.75], bass: '11811181', drums: { k: 'x.xxx.x.', s: '....x..x', h: 'xxxxxxxx' }, seed: 84 },
    race: { bpm: 168, bar: 6, root: 67, scale: 'major', prog: [0, 3, 4, 0], lead: ['square', 0.026, 12, 0.75], bass: '1..5..', drums: { k: 'x..x..', s: '...x..', h: 'x.xx.x' }, seed: 91 },
    naval: { bpm: 160, bar: 6, root: 62, scale: 'minor', prog: [0, 6, 5, 4], lead: ['square', 0.028, 12, 0.75], bass: '1..5..', drums: { k: 'x..x..', s: '.x..x.' }, seed: 85 },
  };
  const PLACES = {
    village: 'village', lower: 'village', house: 'home', inn: 'tavern', store: 'shop', smithy: 'shop', shrine: 'shrine',
    greywood: 'forest', ironback: 'mountain', saltmere: 'coast', keep: 'keep', undercroft: 'undercroft', gaol: 'gaol',
    blackwing: 'blackwing', redgull: 'pirates', hold: 'pirates', smugglers: 'pirates', gullsteeth: 'isle',
    capital: 'court', throne: 'court', arena: 'pit',
  };

  // A tiny seeded random, so a theme's melody is the same every time you hear it.
  const seeded = s => () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  // Four bars of melody over the theme's chords: chord tones on the strong beats, steps
  // between them, rests to breathe.
  const phrase = (th, rnd, start) => {
    const bar = th.bar || 8, beat = bar === 6 ? 3 : 4, dens = th.lead[3], out = [];
    let deg = start;
    for (let b = 0; b < 4; b++) {
      const ch = th.prog[b % th.prog.length];
      for (let p = 0; p < bar; p++) {
        const strong = p % beat === 0;
        if (rnd() > dens * (strong ? 1.35 : 0.8)) continue;
        if (strong) { const opts = [ch, ch + 2, ch + 4, ch + 7]; deg = opts.reduce((a, o) => (Math.abs(o - deg) + rnd() * 2 < Math.abs(a - deg) ? o : a), opts[0]); }
        else deg += [-1, 1, 1, -1, 2, -2, 0][Math.floor(rnd() * 7)];
        deg = clamp(deg, -2, 11);
        out.push({ at: b * bar + p, deg });
      }
    }
    // Last note of the phrase rests on the chord's root.
    if (out.length) out[out.length - 1].deg = th.prog[3 % th.prog.length];
    out.forEach((n, i) => { n.len = Math.min(4, ((out[i + 1] ? out[i + 1].at : 4 * bar) - n.at)); });
    return out;
  };
  const compose = id => {
    const th = THEMES[id], rnd = seeded(th.seed * 7919);
    const A = phrase(th, rnd, 2), B = phrase(th, rnd, 4), A2 = A.slice(0, A.length);
    const tail = phrase(th, rnd, 2).filter(n => n.at >= 3 * (th.bar || 8));
    const A2full = A2.filter(n => n.at < 3 * (th.bar || 8)).concat(tail);
    return [A, A2full, B, A2full];
  };
  const songs = {};

  const Music = {
    cur: null, song: null, battleT: 0,
    // Which theme fits right now.
    scene() {
      const top = UI.stack[UI.stack.length - 1];
      if (!S || (UI.stack[0] && UI.stack[0].isTitle)) return 'title';
      if (top && top.naval) return 'naval';
      if (top && top.race) return 'race';
      const m = Player.map;
      if (!m) return 'title';
      // Fight music only for a fight that is really here: the Pit while you stand in it, a boss
      // that is alive, on this map, and not far off. A leftover flag must never pin the music.
      const here = Foes.mapId === m.id, boss = here && Foes.list.find(f => f.def.boss && f.state !== 'idle' && f.hp > 0 && Math.hypot(f.x - Player.x, f.y - Player.y) < 400);
      if (Arena.active && m.id === 'arena') return boss ? 'pit_boss' : 'pit';
      // Everywhere else a fight keeps the place's own music: fight music is the Pit's alone.
      const fighting = here && Foes.list.some(f => f.hp > 0 && (f.state === 'chase' || f.state === 'windup' || f.state === 'slam') && Math.hypot(f.x - Player.x, f.y - Player.y) < 170);
      // A new place starts with its own song, not the tail of a fight left behind.
      if (this.lastMap !== m.id) { this.lastMap = m.id; this.battleT = 0; }
      this.battleT = fighting ? 5 : Math.max(0, this.battleT - 1 / 60);
      if (m.id === 'mine') return Mine.floor >= 20 ? 'deep' : 'mine';
      const night = S.time >= 1140 || S.time < 360;
      if (m.id === 'farm') return night ? 'night' : 'farm' + S.season;
      let id = PLACES[m.id] || (m.indoor ? 'home' : 'village');
      if (night && !m.indoor && THEMES[id].drums && id !== 'pit') id += '@night';
      return id;
    },
    // The place's own song, if working out the scene ever fails.
    fallback() { const m = Player.map; return !m ? 'title' : m.id === 'farm' ? 'farm' + S.season : (PLACES[m.id] || (m.indoor ? 'home' : 'village')); },
    live: [],
    update() {
      const sx = Sfx, ctx = sx.ctx, now = ctx.currentTime;
      let want = null;
      if (!sx.muted && sx.vol.music) { try { want = this.scene(); } catch (e) { want = this.fallback(); } }
      if (want !== this.cur) this.switchTo(want);
      const s = this.song;
      if (!s) return;
      if (s.next < now - 0.5) s.next = now + 0.05;
      while (s.next < now + 0.3) { this.playStep(s, s.next - now); s.next += s.stepT; s.step++; }
    },
    switchTo(id) {
      const sx = Sfx, ctx = sx.ctx, now = ctx.currentTime;
      // Fade out every song still sounding, so an old one can never linger under the new.
      for (const g of this.live) { try { g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(g.gain.value, now); g.gain.linearRampToValueAtTime(0.0001, now + 0.35); setTimeout(() => { try { g.disconnect(); } catch (er) { /* already gone */ } }, 700); } catch (er) { /* already gone */ } }
      this.live = [];
      this.cur = id; this.song = null;
      if (!id) return;
      const [base, mod] = id.split('@'), th = THEMES[base], night = mod === 'night';
      if (!songs[base]) songs[base] = compose(base);
      const gain = ctx.createGain(); gain.gain.setValueAtTime(0.0001, now); gain.gain.linearRampToValueAtTime(1, now + 1.5); gain.connect(sx.musicBus); this.live.push(gain);
      sx.echoFb.gain.setTargetAtTime(th.echo || 0.25, now, 0.5);
      const bpm = th.bpm * (night ? 0.8 : 1);
      this.song = { id, th, night, parts: songs[base], gain, step: 0, next: now + 0.15, stepT: 60 / bpm / 2, bar: th.bar || 8, scale: SCALES[th.scale] };
    },
    freq(s, deg, oct) {
      const sc = s.scale, n = sc.length, o = Math.floor(deg / n), i = ((deg % n) + n) % n;
      return midi(s.th.root + sc[i] + 12 * o + oct);
    },
    playStep(s, when) {
      const th = s.th, sx = Sfx, out = s.gain, bar = s.bar, pos = s.step % bar, b = Math.floor(s.step / bar);
      const ch = th.prog[b % th.prog.length], len = s.stepT;
      // Pad: the chord, held for the bar.
      if (pos === 0 && th.pad) [0, 2, 4].forEach(k => sx.tone(this.freq(s, ch + k, -12), len * bar * 1.05, 'sine', th.pad * (s.night ? 1.3 : 1), when, 0, out, 0.25));
      // Bass.
      const bc = th.bass[pos];
      if (bc && bc !== '.') sx.tone(this.freq(s, ch + { 1: 0, 3: 2, 5: 4, 8: 7 }[bc], -24), len * 1.8, 'triangle', 0.075, when, 0, out, 0.01);
      // Arpeggio.
      if (th.arp && !s.night) { const ac = th.arp[pos % th.arp.length]; sx.tone(this.freq(s, ch + { 1: 0, 3: 2, 5: 4, 8: 7 }[ac], 0), len * 0.9, 'triangle', 0.02, when, 0, out); }
      // Melody: verse, verse again, bridge, verse (16 bars), then round again.
      const part = s.parts[Math.floor(b / 4) % 4], at = (b % 4) * bar + pos, [type, vol, oct] = th.lead;
      for (const n of part) if (n.at === at && !(s.night && (n.at * 7 + b) % 10 < 3)) sx.tone(this.freq(s, n.deg, oct), len * n.len * 0.92, type, vol, when, 0, out, 0.015);
      // Drums (none at night).
      if (th.drums && !s.night) {
        const d = th.drums, hit = k => d[k] && d[k][pos % d[k].length] !== '.';
        if (hit('k')) sx.tone(140, 0.14, 'sine', 0.16, when, -95, out);
        if (hit('s')) { sx.noise(0.11, 0.07, 1900, { type: 'bandpass', q: 0.9, when, out }); sx.tone(190, 0.07, 'triangle', 0.04, when, 0, out); }
        if (hit('h')) sx.noise(0.03, 0.03, 7500, { type: 'highpass', when, out });
        if (hit('t')) sx.tone(170, 0.16, 'sine', 0.1, when, -60, out);
      }
    },
  };
  Sfx.Music = Music; Sfx.THEMES = THEMES; Sfx.PLACES = PLACES;

  // ---- Ambience ---------------------------------------------------------------------
  const AMB = {
    birds() { const f = 1800 + R() * 1600; for (let i = 0; i < 2 + Math.floor(R() * 3); i++) Sfx.tone(f * (1 + R() * 0.1), 0.06, 'sine', 0.025, i * 0.09, R() < 0.5 ? 600 : -400, Sfx.ambBus); },
    crickets() { const f = 4200 + R() * 400; for (let i = 0; i < 4; i++) Sfx.tone(f, 0.025, 'square', 0.006, i * 0.05, 0, Sfx.ambBus); },
    owl() { Sfx.tone(420, 0.3, 'sine', 0.03, 0, -30, Sfx.ambBus, 0.05); Sfx.tone(380, 0.45, 'sine', 0.03, 0.4, -40, Sfx.ambBus, 0.05); },
    waves() { Sfx.noise(3.2, 0.09, 520, { attack: 1.4, out: Sfx.ambBus, to: 300 }); },
    gulls() { for (let i = 0; i < 2; i++) Sfx.tone(1250 + R() * 200, 0.22, 'sawtooth', 0.008, i * 0.28, -450, Sfx.ambBus); },
    wind() { Sfx.noise(4, 0.07, 380 + R() * 300, { type: 'bandpass', q: 2, attack: 1.8, to: 900 + R() * 400, out: Sfx.ambBus }); },
    drips() { const f = 1100 + R() * 900; Sfx.tone(f, 0.08, 'sine', 0.03, 0, f * 0.6, Sfx.ambBus); },
    chains() { Sfx.tone(300 + R() * 60, 0.25, 'square', 0.008, 0, 0, Sfx.ambBus); Sfx.noise(0.12, 0.05, 3000, { type: 'bandpass', out: Sfx.ambBus }); },
    rumble() { Sfx.noise(2.5, 0.08, 160, { attack: 0.8, out: Sfx.ambBus }); },
    crowd() { Sfx.noise(2.2, 0.07, 700, { type: 'bandpass', q: 0.6, attack: 0.7, out: Sfx.ambBus }); },
    clink() { Sfx.tone(2400 + R() * 600, 0.08, 'triangle', 0.015, 0, 0, Sfx.ambBus); },
    hearth() { Sfx.noise(0.03, 0.03, 3000, { type: 'highpass', out: Sfx.ambBus }); },
    anvil() { Sfx.tone(1250, 0.4, 'triangle', 0.02, 0, 0, Sfx.ambBus); Sfx.tone(1880, 0.3, 'triangle', 0.012, 0, 0, Sfx.ambBus); },
    thunder() { Sfx.noise(3, 0.16, 260, { attack: 0.1, out: Sfx.ambBus, to: 120 }); },
  };
  // Which sounds each kind of place makes, and how often (seconds, min to max).
  const BEDS = {
    farm: { birds: [2, 6] }, village: { birds: [3, 8] }, forest: { birds: [1.5, 4], owl: [20, 40] }, coast: { waves: [3.5, 5.5], gulls: [6, 14] },
    mountain: { wind: [4, 8], birds: [8, 16] }, island: { waves: [3.5, 5.5], gulls: [5, 12], birds: [6, 12] }, pirates: { waves: [4, 6], chains: [10, 20] },
    keep: { drips: [2, 5], wind: [8, 14] }, mine: { drips: [1, 3.5], rumble: [12, 25] }, deep: { drips: [1, 3], rumble: [8, 16] },
    undercroft: { drips: [1.5, 4], rumble: [10, 20] }, gaol: { chains: [6, 12], drips: [3, 7] }, blackwing: { chains: [5, 10], drips: [2, 6] },
    tavern: { crowd: [2, 4], clink: [1.5, 5] }, home: { hearth: [0.2, 0.9] }, shop: { anvil: [3, 7] }, pit: { crowd: [1.5, 3.5] }, court: {}, shrine: { wind: [10, 18] },
  };
  const NIGHT_BEDS = { farm: { crickets: [0.6, 1.8], owl: [15, 30] }, village: { crickets: [0.8, 2] }, forest: { crickets: [0.6, 1.6], owl: [10, 22] }, mountain: { wind: [3, 6] } };

  const Ambience = {
    timers: {}, rain: null,
    update() {
      const ctx = Sfx.ctx, dt = 1 / 60;
      const id = (Music.cur || '').split('@')[0];
      const m = S && Player.map;
      if (!m || Sfx.muted || id === 'title' || id === 'naval') { this.setRain(0); return; }
      if (id === 'race') { this.setRain(0); this.timers.crowd = (this.timers.crowd || 2) - 1 / 60; if (this.timers.crowd <= 0) { AMB.crowd(); this.timers.crowd = 1.5 + R() * 2; } return; }
      let place = m.id === 'farm' ? 'farm' : m.id === 'mine' ? (Mine.floor >= 20 ? 'deep' : 'mine') : (PLACES[m.id] || (m.indoor ? 'home' : 'village'));
      if (m.id === 'smithy') place = 'shop'; else if (m.id === 'store') place = 'court';
      const night = !m.indoor && (S.time >= 1140 || S.time < 360);
      const wet = !m.indoor && (S.weather === 'rain' || S.weather === 'storm');
      const bed = Object.assign({}, night ? NIGHT_BEDS[place] || {} : wet ? {} : BEDS[place] || {});
      if (wet && S.weather === 'storm') bed.thunder = [12, 28];
      if (m.indoor || !wet) Object.assign(bed, m.indoor ? BEDS[place] || {} : {});
      for (const k in bed) {
        if (this.timers[k] === undefined) this.timers[k] = bed[k][0] + R() * (bed[k][1] - bed[k][0]);
        this.timers[k] -= dt;
        if (this.timers[k] <= 0) { AMB[k](); this.timers[k] = bed[k][0] + R() * (bed[k][1] - bed[k][0]); }
      }
      for (const k in this.timers) if (!bed[k]) delete this.timers[k];
      this.setRain(wet ? (S.weather === 'storm' ? 0.09 : 0.055) : 0);
      void ctx;
    },
    // Rain is a steady hiss, faded in and out.
    setRain(level) {
      const ctx = Sfx.ctx;
      if (!ctx || !Sfx.noiseBuf) return;
      if (level && !this.rain) {
        const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
        s.buffer = Sfx.noiseBuf; s.loop = true; hp.type = 'highpass'; hp.frequency.value = 900; lp.type = 'lowpass'; lp.frequency.value = 6500;
        g.gain.value = 0.0001; s.connect(hp); hp.connect(lp); lp.connect(g); g.connect(Sfx.ambBus); s.start();
        this.rain = { s, g, level: 0 };
      }
      if (!this.rain) return;
      if (Math.abs(this.rain.level - level) > 0.001) { this.rain.level = level; this.rain.g.gain.setTargetAtTime(Math.max(0.0001, level), ctx.currentTime, 0.8); }
      if (!level && this.rain.g.gain.value < 0.001) { this.rain.s.stop(); this.rain = null; }
    },
  };
  Sfx.Ambience = Ambience; Sfx.BEDS = BEDS; Sfx.AMB = AMB;

  // ---- Footsteps, the morning, and sleep --------------------------------------------
  const GROUND = {};
  [[T.G, 'grass'], [T.D, 'grass'], [T.S, 'sand'], [T.F, 'wood'], [T.B, 'wood'], [T.R, 'stone'], [T.C, 'stone'], [T.ST, 'stone'], [T.CAVE, 'stone'], [T.ROCK, 'stone'], [T.MTN, 'stone'], [T.W, 'water']].forEach(([k, v]) => { GROUND[k] = v; });
  const playerUpdate = Player.update.bind(Player);
  let lastStep = -1;
  Player.update = function (dt) {
    playerUpdate(dt);
    if (!this.moving || Horse.on) { lastStep = -1; return; }
    const st = Math.floor(this.frameT / 2);
    if (st !== lastStep) {
      lastStep = st;
      const g = World.g(this.map, Math.floor(this.x / TILE), Math.floor((this.y - 2) / TILE));
      Sfx.play('step', this.map.indoor && g !== T.ST ? 'wood' : GROUND[g] || 'grass');
    }
  };
  const endDay = Game.endDay.bind(Game);
  Game.endDay = function (why) { if (why !== 'defeat') Sfx.play('sleep'); Sfx.morning = true; return endDay(why); };
  const step = Game.step.bind(Game);
  Game.step = function (dt) {
    step(dt);
    if (Sfx.morning && !this.fadeState && S && Player.map && !UI.busy()) { Sfx.morning = false; if (Player.map.id === 'house' || Player.map.id === 'farm') Sfx.play('rooster'); }
  };
})();
