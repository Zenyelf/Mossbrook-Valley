'use strict';
// The band: real-sounding instruments and proper arrangements, so each place sounds like itself.
// A castle has harpsichord, strings, trumpets and timpani; pirates have accordion, fiddle and
// stomping on the deck; the Pit has war drums, growling brass and a roaring crowd; the beach has
// steel drums, marimba and ukulele. Themes with a `band` use this player; the rest play as before.

(() => {
  const Music = Sfx.Music, THEMES = Sfx.THEMES, R = Math.random;

  // ---- Instruments -------------------------------------------------------------------------
  // waves: [type, level, cents]; partials: [ratio, level] sine partials (bells, steel, marimba);
  // envelope: attack, decay (to sustain), sustain (0 = plucked), release;
  // filter: cut (resting), peak (brightness at the attack), q; vib: [rate, depth, delay].
  const INSTR = {
    harpsi: { waves: [['sawtooth', 1, 0], ['square', 0.45, 1200]], attack: 0.002, decay: 0.55, sustain: 0, cut: 1500, peak: 5200, q: 1.5 },
    trumpet: { waves: [['sawtooth', 1, 0]], attack: 0.045, decay: 0.2, sustain: 0.75, release: 0.08, cut: 1100, peak: 3400, q: 2.2, vib: [5.6, 0.007, 0.18] },
    horn: { waves: [['sawtooth', 0.6, 0], ['triangle', 0.8, 0]], attack: 0.09, decay: 0.3, sustain: 0.85, release: 0.15, cut: 900, peak: 1500, q: 1 },
    strings: { waves: [['sawtooth', 0.5, -9], ['sawtooth', 0.5, 9], ['sawtooth', 0.35, -1200]], attack: 0.35, decay: 0.4, sustain: 0.9, release: 0.5, cut: 1500, peak: 1700, q: 0.7, vib: [5, 0.004, 0.3] },
    cello: { waves: [['sawtooth', 1, 0]], attack: 0.07, decay: 0.3, sustain: 0.7, release: 0.12, cut: 800, peak: 1300, q: 1, vib: [5, 0.006, 0.2] },
    flute: { waves: [['sine', 1, 0], ['triangle', 0.18, 1200]], attack: 0.06, decay: 0.2, sustain: 0.85, release: 0.1, breath: 0.12, vib: [5.2, 0.009, 0.15] },
    harp: { waves: [['triangle', 1, 0], ['sine', 0.45, 1200]], attack: 0.003, decay: 1.3, sustain: 0, cut: 3200, peak: 4200 },
    lute: { waves: [['triangle', 1, 0], ['sawtooth', 0.28, 0]], attack: 0.003, decay: 0.7, sustain: 0, cut: 1800, peak: 3600, q: 1.4 },
    accordion: { waves: [['square', 0.38, -11], ['square', 0.38, 11], ['sawtooth', 0.3, 1200]], attack: 0.03, decay: 0.15, sustain: 0.85, release: 0.06, cut: 2100, peak: 2600, q: 0.9, trem: [6.5, 0.18] },
    fiddle: { waves: [['sawtooth', 1, 0], ['sawtooth', 0.3, 5]], attack: 0.05, decay: 0.15, sustain: 0.8, release: 0.06, cut: 2600, peak: 3400, q: 1.6, vib: [6.2, 0.011, 0.09] },
    steel: { partials: [[1, 1], [2, 0.42], [3.02, 0.16], [4.17, 0.1]], attack: 0.002, decay: 0.95, sustain: 0 },
    marimba: { partials: [[1, 1], [3.98, 0.22], [9.9, 0.05]], attack: 0.001, decay: 0.5, sustain: 0 },
    uke: { waves: [['triangle', 1, 0], ['sawtooth', 0.35, 0]], attack: 0.002, decay: 0.26, sustain: 0, cut: 2600, peak: 4400, q: 1.2 },
    tuba: { waves: [['sawtooth', 1, 0], ['triangle', 0.6, 0]], attack: 0.025, decay: 0.3, sustain: 0.55, release: 0.05, cut: 520, peak: 900, q: 1.2 },
    pluckbass: { waves: [['triangle', 1, 0], ['sine', 0.7, 0]], attack: 0.004, decay: 0.55, sustain: 0.1, release: 0.05, cut: 900, peak: 1600 },
    growl: { waves: [['sawtooth', 0.7, -14], ['sawtooth', 0.7, 14], ['square', 0.5, -1200]], attack: 0.02, decay: 0.25, sustain: 0.7, release: 0.08, cut: 650, peak: 2200, q: 3.5 },
    choir: { waves: [['sawtooth', 0.55, -7], ['sawtooth', 0.55, 7]], attack: 0.35, decay: 0.3, sustain: 0.9, release: 0.4, formant: [[650, 5], [1100, 7]], vib: [4.5, 0.006, 0.4] },
    glock: { partials: [[1, 1], [2.76, 0.3], [5.4, 0.1]], attack: 0.001, decay: 1.1, sustain: 0 },
    recorder: { waves: [['triangle', 1, 0], ['sine', 0.4, 1200]], attack: 0.04, decay: 0.15, sustain: 0.8, release: 0.06, breath: 0.08, vib: [5.5, 0.006, 0.25] },
    // A music box slightly out of tune; a wailing theremin that slides into each note; a low drone.
    musicbox: { partials: [[1, 1], [2.01, 0.35], [3.97, 0.12], [6.3, 0.05]], attack: 0.001, decay: 1.6, sustain: 0 },
    theremin: { waves: [['sine', 1, 0], ['triangle', 0.15, 0]], attack: 0.25, decay: 0.3, sustain: 0.9, release: 0.35, glide: 0.94, vib: [5.5, 0.018, 0.15] },
    drone: { waves: [['sawtooth', 0.5, -6], ['sawtooth', 0.5, 6], ['sine', 0.8, -1200]], attack: 0.9, decay: 0.5, sustain: 0.9, release: 0.9, cut: 420, peak: 520, q: 2, trem: [0.4, 0.3] },
  };
  const cents = c => Math.pow(2, c / 1200);
  const play = (name, f, when, dur, vol, out) => {
    const I = INSTR[name], sx = Sfx, c = sx.ctx;
    if (!I || !c) return;
    const t = c.currentTime + Math.max(0, when), env = c.createGain(), stopAt = t + dur + (I.release || 0.05) + 0.05;
    const a = I.attack || 0.01, sus = I.sustain || 0, dec = I.decay || 0.3;
    env.gain.setValueAtTime(0.0001, t); env.gain.linearRampToValueAtTime(vol, t + a);
    if (sus > 0) { env.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * sus), t + a + dec); env.gain.setValueAtTime(Math.max(0.0002, vol * sus), t + Math.max(a + dec, dur)); env.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a + dec, dur) + (I.release || 0.05)); }
    else env.gain.exponentialRampToValueAtTime(0.0001, t + a + Math.min(dec, Math.max(dur * 1.6, 0.12)));
    env.connect(out);
    const nodes = [];
    if (I.partials) {
      for (const [ratio, lvl] of I.partials) {
        const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f * ratio;
        g.gain.setValueAtTime(lvl, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (I.decay || 0.5) / Math.sqrt(ratio));
        o.connect(g); g.connect(env); o.start(t); o.stop(stopAt); nodes.push(o);
      }
      return;
    }
    // Through a filter whose brightness opens on the attack, or a pair of vowel formants.
    let input = env;
    if (I.formant) {
      const mix = c.createGain(); mix.gain.value = 1;
      for (const [ff, q] of I.formant) { const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = q; mix.connect(bp); bp.connect(env); }
      input = mix;
    } else if (I.cut) {
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = I.q || 0.8;
      lp.frequency.setValueAtTime(I.peak || I.cut, t); lp.frequency.exponentialRampToValueAtTime(I.cut, t + a + Math.min(dec, 0.4));
      lp.connect(env); input = lp;
    }
    if (I.trem) { const lfo = c.createOscillator(), lg = c.createGain(), tg = c.createGain(); lfo.frequency.value = I.trem[0]; lg.gain.value = I.trem[1]; tg.gain.value = 1 - I.trem[1]; lfo.connect(lg); lg.connect(tg.gain); tg.connect(input); input = tg; lfo.start(t); lfo.stop(stopAt); }
    const total = I.waves.reduce((s, w) => s + w[1], 0);
    for (const [type, lvl, ct] of I.waves) {
      const o = c.createOscillator(), g = c.createGain(); o.type = type; g.gain.value = lvl / total;
      if (I.glide) { o.frequency.setValueAtTime(f * cents(ct) * I.glide, t); o.frequency.exponentialRampToValueAtTime(f * cents(ct), t + 0.18); } else o.frequency.value = f * cents(ct);
      if (I.vib) { const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = I.vib[0]; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * I.vib[1], t + I.vib[2] + 0.2); lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(stopAt); }
      o.connect(g); g.connect(input); o.start(t); o.stop(stopAt);
    }
    if (I.breath) sx.noise(Math.min(dur, 0.25), vol * I.breath, 2400, { type: 'bandpass', q: 1, when, out });
  };

  // ---- Percussion --------------------------------------------------------------------------
  const PERC = {
    kick: (w, v, out) => Sfx.tone(150, 0.18, 'sine', 0.17 * v, w, -105, out),
    snare: (w, v, out) => { Sfx.noise(0.13, 0.07 * v, 1900, { type: 'bandpass', q: 0.8, when: w, out }); Sfx.tone(200, 0.07, 'triangle', 0.04 * v, w, -40, out); },
    hat: (w, v, out) => Sfx.noise(0.035, 0.028 * v, 8000, { type: 'highpass', when: w, out }),
    ohat: (w, v, out) => Sfx.noise(0.16, 0.024 * v, 7000, { type: 'highpass', when: w, out }),
    clap: (w, v, out) => { for (let i = 0; i < 3; i++) Sfx.noise(0.02, 0.05 * v, 1300, { type: 'bandpass', q: 1.2, when: w + i * 0.011, out }); Sfx.noise(0.12, 0.035 * v, 1200, { type: 'bandpass', q: 1, when: w + 0.034, out }); },
    stomp: (w, v, out) => { Sfx.tone(95, 0.16, 'sine', 0.16 * v, w, -45, out); Sfx.noise(0.08, 0.05 * v, 380, { when: w, out }); },
    tamb: (w, v, out) => { Sfx.noise(0.09, 0.03 * v, 7200, { type: 'highpass', when: w, out }); Sfx.tone(5300, 0.06, 'sine', 0.008 * v, w, 0, out); Sfx.tone(6700, 0.05, 'sine', 0.006 * v, w + 0.01, 0, out); },
    shaker: (w, v, out) => Sfx.noise(0.06, 0.02 * v, 6200, { type: 'highpass', attack: 0.02, when: w, out }),
    conga: (w, v, out) => Sfx.tone(330, 0.14, 'sine', 0.07 * v, w, -70, out),
    bongo: (w, v, out) => Sfx.tone(560, 0.08, 'sine', 0.05 * v, w, -90, out),
    tom: (w, v, out) => Sfx.tone(165, 0.24, 'sine', 0.11 * v, w, -70, out),
    wardrum: (w, v, out) => { Sfx.tone(78, 0.5, 'sine', 0.2 * v, w, -38, out); Sfx.noise(0.25, 0.07 * v, 260, { when: w, out }); },
    crash: (w, v, out) => Sfx.noise(1.3, 0.035 * v, 4200, { type: 'highpass', when: w, out }),
    anvil: (w, v, out) => { Sfx.tone(1180, 0.32, 'triangle', 0.022 * v, w, 0, out); Sfx.tone(1770, 0.22, 'triangle', 0.014 * v, w, 0, out); Sfx.tone(2950, 0.12, 'sine', 0.008 * v, w, 0, out); },
    wood: (w, v, out) => { Sfx.tone(880, 0.04, 'sine', 0.05 * v, w, 0, out); Sfx.noise(0.03, 0.03 * v, 1600, { type: 'bandpass', q: 4, when: w, out }); },
  };
  // Timpani are tuned to the chord.
  const timp = (f, w, v, out) => { Sfx.tone(f, 0.9, 'sine', 0.14 * v, w, -f * 0.06, out, 0.004); Sfx.tone(f * 1.5, 0.5, 'sine', 0.04 * v, w, 0, out, 0.004); Sfx.noise(0.18, 0.05 * v, 240, { when: w, out }); };

  // ---- Arrangements ------------------------------------------------------------------------
  // Pattern strings, one character per step: '.' rest, 'x' hit, 'X' accent, 'o' soft.
  // Melodic patterns use chord tones: 1 root, 3 third, 5 fifth, 8 octave; 'c' a whole chord.
  // lead.parts picks the instrument for each of the song's four sections (A, A, B, A).
  const BAND = {
    // Evergreen Castle: a stately minuet in three. Harpsichord, strings, trumpet and horns, timpani.
    castle: { mix: 0.59, bpm: 104, bar: 6, root: 62, scale: 'major', prog: [0, 4, 5, 3, 0, 3, 4, 0], echo: 0.3, seed: 173,
      band: { lead: { parts: ['trumpet', 'trumpet', 'flute', 'trumpet'], oct: 12, vol: 0.05, rhythm: 'x.x.x.', rhythmB: 'x.xxx.', harmony: [1, 3], harmonyInst: 'horn' },
        arp: { inst: 'harpsi', pat: '135353', oct: 0, vol: 0.035 }, chords: { inst: 'strings', pat: 'x.....', oct: -12, vol: 0.03, hold: 6 },
        bass: { inst: 'cello', pat: '1...5.', oct: -24, vol: 0.06 }, perc: { timp: 'X.....' }, roll: true } },
    // The Throne Room: a slow brass chorale, regal and a little ominous.
    throne: { mix: 0.6, bpm: 66, root: 62, scale: 'dorian', prog: [0, 5, 3, 4, 0, 6, 4, 4], echo: 0.45, seed: 191,
      band: { lead: { parts: ['horn', 'trumpet', 'choir', 'trumpet'], oct: 0, vol: 0.05, rhythm: 'x...x...', rhythmB: 'x.x.x...', harmony: [1, 2, 3], harmonyInst: 'horn' },
        chords: { inst: 'strings', pat: 'x.......', oct: -12, vol: 0.035, hold: 8 }, bass: { inst: 'tuba', pat: '1.......', oct: -24, vol: 0.06 },
        arp: { inst: 'harp', pat: '1.3.5.8.', oct: 0, vol: 0.02, parts: [2] }, perc: { timp: 'X...o...' }, roll: true } },
    // The capital and the Court garden: an elegant dance with lute, recorder and tambourine.
    court: { mix: 1.0, bpm: 92, root: 67, scale: 'major', prog: [0, 3, 4, 0, 5, 3, 1, 4], echo: 0.25, seed: 171,
      band: { lead: { parts: ['recorder', 'recorder', 'flute', 'recorder'], oct: 12, vol: 0.045, rhythm: 'x.x.x.xx', rhythmB: 'x...x.x.', harmony: [3], harmonyInst: 'flute' },
        arp: { inst: 'lute', pat: '15381538', oct: -12, vol: 0.04 }, chords: { inst: 'strings', pat: 'x.......', oct: -12, vol: 0.02, hold: 8 },
        bass: { inst: 'pluckbass', pat: '1...5...', oct: -24, vol: 0.05 }, perc: { tamb: '..x...x.', wood: 'x.......' } } },
    // Vane's pirates: a minor sea shanty in six-eight. Accordion, fiddle, stomping and clapping.
    pirates: { mix: 0.95, bpm: 126, bar: 6, root: 62, scale: 'minor', prog: [0, 0, 6, 4, 0, 5, 6, 4], echo: 0.2, seed: 161,
      band: { lead: { parts: ['accordion', 'accordion', 'fiddle', 'accordion'], oct: 12, vol: 0.045, rhythm: 'x.xx.x', rhythmB: 'xxxx.x', harmony: [1, 3], harmonyInst: 'fiddle' },
        chords: { inst: 'accordion', pat: '.xx.xx', oct: 0, vol: 0.016 }, bass: { inst: 'tuba', pat: '1..5..', oct: -24, vol: 0.06 },
        perc: { stomp: 'X..x..', clap: '...X..', tamb: 'o.oo.o' } } },
    // The Red Gull's friendly crew: a jolly jig.
    shanty: { mix: 0.9, bpm: 146, bar: 6, root: 67, scale: 'mixo', prog: [0, 0, 6, 4, 0, 3, 6, 0], echo: 0.18, seed: 162,
      band: { lead: { parts: ['fiddle', 'fiddle', 'accordion', 'fiddle'], oct: 12, vol: 0.045, rhythm: 'xxxx.x', rhythmB: 'x.xxxx', harmony: [3], harmonyInst: 'accordion' },
        chords: { inst: 'accordion', pat: '.xx.xx', oct: 0, vol: 0.016 }, bass: { inst: 'pluckbass', pat: '1..5..', oct: -24, vol: 0.055 },
        perc: { stomp: 'X..X..', tamb: '.xx.xx', clap: '...x..' } } },
    // The Pit: fire and fury. War drums, growling brass, anvils, a choir.
    pit: { mix: 0.63, bpm: 138, root: 64, scale: 'phrygdom', prog: [0, 1, 0, 6, 0, 1, 5, 4], echo: 0.22, seed: 183,
      band: { lead: { parts: ['growl', 'growl', 'choir', 'growl'], oct: 0, vol: 0.05, rhythm: 'x..x..x.', rhythmB: 'x.xx.xx.', harmony: [3], harmonyInst: 'growl' },
        chords: { inst: 'growl', pat: 'X..x..x.', oct: -12, vol: 0.025 }, bass: { inst: 'tuba', pat: '11.1.1.5', oct: -24, vol: 0.06 },
        perc: { wardrum: 'X..x..x.', tom: '......xx', snare: '....X...', anvil: '..o...o.', hat: 'xoxoxoxo' } } },
    pit_boss: { mix: 0.45, bpm: 156, root: 62, scale: 'harmonic', prog: [0, 1, 5, 4, 0, 1, 6, 4], echo: 0.25, seed: 184,
      band: { lead: { parts: ['growl', 'choir', 'growl', 'trumpet'], oct: 0, vol: 0.05, rhythm: 'x.xx.xx.', rhythmB: 'xxxx.x.x', harmony: [0, 1, 2, 3], harmonyInst: 'choir' },
        chords: { inst: 'growl', pat: 'X.xX.xX.', oct: -12, vol: 0.026 }, bass: { inst: 'tuba', pat: '11811181', oct: -24, vol: 0.06 },
        perc: { wardrum: 'X.xX.xX.', kick: 'x.x.x.x.', snare: '....X..x', anvil: 'o...o...', crash: 'X...............' } } },
    // Saltmere Coast: a sunny beach tune. Steel drum, marimba, ukulele off-beats, shaker, congas.
    coast: { mix: 1.0, bpm: 108, root: 65, scale: 'major', prog: [0, 3, 4, 0, 0, 5, 3, 4], echo: 0.22, seed: 133,
      band: { lead: { parts: ['steel', 'steel', 'marimba', 'steel'], oct: 12, vol: 0.06, rhythm: 'x.xx.x.x', rhythmB: 'x..x..xx', harmony: [1, 3], harmonyInst: 'steel' },
        arp: { inst: 'marimba', pat: '1.5.3.8.', oct: 0, vol: 0.035, parts: [0, 1, 3] }, chords: { inst: 'uke', pat: '..c...c.', oct: 0, vol: 0.028 },
        bass: { inst: 'pluckbass', pat: '1..1.5..', oct: -24, vol: 0.06 }, perc: { shaker: 'xoxoxoxo', conga: '...x..x.', bongo: '.x....x.', kick: 'x.......' } } },
    // The horse races: a bright, galloping call to the post.
    race: { mix: 0.8, bpm: 172, bar: 6, root: 67, scale: 'major', prog: [0, 3, 4, 0, 0, 5, 4, 4], echo: 0.15, seed: 191,
      band: { lead: { parts: ['trumpet', 'trumpet', 'horn', 'trumpet'], oct: 12, vol: 0.048, rhythm: 'x.xx.x', rhythmB: 'xxx.xx', harmony: [3], harmonyInst: 'horn' },
        chords: { inst: 'strings', pat: 'x..x..', oct: -12, vol: 0.02 }, bass: { inst: 'tuba', pat: '1..5..', oct: -24, vol: 0.055 },
        perc: { snare: 'xoox.o', kick: 'x..x..', crash: 'X...........................' } } },
    // The inn: a fiddle reel with stomps.
    tavern: { mix: 0.95, bpm: 152, bar: 6, root: 62, scale: 'mixo', prog: [0, 6, 0, 4, 0, 3, 6, 4], echo: 0.2, seed: 123,
      band: { lead: { parts: ['fiddle', 'fiddle', 'accordion', 'fiddle'], oct: 12, vol: 0.042, rhythm: 'xxxxxx', rhythmB: 'x.xxx.', harmony: [3], harmonyInst: 'recorder' },
        chords: { inst: 'lute', pat: 'c..c..', oct: -12, vol: 0.03 }, bass: { inst: 'pluckbass', pat: '1..5..', oct: -24, vol: 0.05 }, perc: { stomp: 'x..x..', tamb: '.xx.xx' } } },
    // Mossbrook village: a pastoral tune with lute and recorder.
    village: { mix: 1.05, bpm: 112, root: 67, scale: 'major', prog: [0, 3, 4, 0, 5, 3, 4, 0], echo: 0.22, seed: 121,
      band: { lead: { parts: ['recorder', 'recorder', 'fiddle', 'recorder'], oct: 12, vol: 0.042, rhythm: 'x.x.xx.x', rhythmB: 'x...x.xx', harmony: [3], harmonyInst: 'flute' },
        arp: { inst: 'lute', pat: '15381538', oct: -12, vol: 0.035 }, bass: { inst: 'pluckbass', pat: '1...5...', oct: -24, vol: 0.05 }, perc: { tamb: '....x...', wood: 'x...x...' } } },
    // Greywood: harp and flute under the trees.
    forest: { mix: 0.9, bpm: 84, root: 64, scale: 'dorian', prog: [0, 3, 0, 4, 5, 3, 1, 4], echo: 0.4, seed: 141,
      band: { lead: { parts: ['flute', 'flute', 'recorder', 'flute'], oct: 12, vol: 0.04, rhythm: 'x..xx...', rhythmB: 'x.x.x...', harmony: [2] , harmonyInst: 'flute' },
        arp: { inst: 'harp', pat: '13581358', oct: -12, vol: 0.035 }, chords: { inst: 'strings', pat: 'x.......', oct: -12, vol: 0.02, hold: 8 }, bass: { inst: 'pluckbass', pat: '1.......', oct: -24, vol: 0.04 } } },
    // Gull's Teeth: an abandoned island. A music box lullaby nobody is left to hear, a ghostly choir,
    // a heartbeat, and a theremin that wails through the middle.
    isle: { mix: 1.85, bpm: 54, root: 57, scale: 'harmonic', prog: [0, 5, 3, 4, 0, 1, 5, 4], echo: 0.6, seed: 166,
      band: { lead: { parts: ['musicbox', 'musicbox', 'theremin', 'musicbox'], oct: 12, vol: 0.06, rhythm: 'x..x..x.', rhythmB: 'x...x...', harmony: [1], harmonyInst: 'musicbox' },
        chords: { inst: 'choir', pat: 'x.......', oct: -12, vol: 0.022, hold: 8 }, bass: { inst: 'drone', pat: '1.......', oct: -24, vol: 0.05 },
        arp: { inst: 'harp', pat: '1...5...', oct: -12, vol: 0.02, parts: [2] }, perc: { kick: 'o.o.............' } } },
    // The mines: dark and close. A low drone, dissonant strings, distant picks, water dripping.
    mine: { mix: 1.15, bpm: 60, root: 52, scale: 'phrygian', prog: [0, 1, 0, 6, 0, 1, 3, 1], echo: 0.55, seed: 152,
      band: { lead: { parts: ['cello', 'cello', 'theremin', 'cello'], oct: 0, vol: 0.05, rhythm: 'x...x...', rhythmB: 'x.....x.', harmony: [2], harmonyInst: 'cello' },
        chords: { inst: 'strings', pat: 'x.......', oct: -12, vol: 0.02, hold: 8 }, bass: { inst: 'drone', pat: '1.......', oct: -24, vol: 0.055 },
        arp: { inst: 'marimba', pat: '8......5....3...', oct: 12, vol: 0.022 }, perc: { anvil: '......o.........', tom: 'o...............' } } },
    // The deep floors: worse. A choir, slow war drums like a heartbeat, the theremin.
    deep: { mix: 0.78, bpm: 52, root: 50, scale: 'locrian', prog: [0, 1, 0, 4, 0, 1, 6, 1], echo: 0.6, seed: 153,
      band: { lead: { parts: ['theremin', 'choir', 'theremin', 'cello'], oct: 0, vol: 0.05, rhythm: 'x...x...', rhythmB: 'x..x....', harmony: [1, 3], harmonyInst: 'choir' },
        chords: { inst: 'choir', pat: 'x.......', oct: -12, vol: 0.025, hold: 8 }, bass: { inst: 'drone', pat: '1.......', oct: -24, vol: 0.06 },
        arp: { inst: 'musicbox', pat: '8.......5.......', oct: 12, vol: 0.02 }, perc: { wardrum: 'X.o.............', anvil: '..........o.....' } } },
    // Fights.
    battle: { mix: 0.8, bpm: 144, root: 64, scale: 'minor', prog: [0, 0, 5, 6, 0, 3, 5, 4], echo: 0.15, seed: 181,
      band: { lead: { parts: ['trumpet', 'trumpet', 'strings', 'trumpet'], oct: 12, vol: 0.045, rhythm: 'x.xx.xx.', rhythmB: 'xxxx.x.x', harmony: [3], harmonyInst: 'horn' },
        chords: { inst: 'strings', pat: 'x.x.x.x.', oct: -12, vol: 0.02 }, bass: { inst: 'cello', pat: '11.11.1.', oct: -24, vol: 0.055 },
        perc: { kick: 'x...x...', snare: '....x...', hat: 'xxxxxxxx', tom: '......xx' } } },
    boss: { mix: 0.58, bpm: 152, root: 62, scale: 'harmonic', prog: [0, 5, 1, 4, 0, 5, 6, 4], echo: 0.2, seed: 182,
      band: { lead: { parts: ['growl', 'trumpet', 'choir', 'growl'], oct: 0, vol: 0.05, rhythm: 'x.xx.x.x', rhythmB: 'xxxx.xx.', harmony: [1, 2, 3], harmonyInst: 'horn' },
        chords: { inst: 'strings', pat: 'X.x.X.x.', oct: -12, vol: 0.022 }, bass: { inst: 'tuba', pat: '11811181', oct: -24, vol: 0.06 },
        perc: { wardrum: 'X..x..x.', snare: '....X...', hat: 'x.x.x.x.', crash: 'X...............................' } } },
  };
  // A Phrygian-dominant scale for the Pit's Spanish fire.
  const SCALE_EXTRA = { phrygdom: [0, 1, 4, 5, 7, 8, 10], locrian: [0, 1, 3, 5, 6, 8, 10] };
  const scaleOf = name => SCALE_EXTRA[name] || null;

  // Each theme keeps its old settings for anything the band does not say, then takes the band's.
  for (const id in BAND) THEMES[id] = Object.assign({}, THEMES[id] || {}, BAND[id], { lead: (THEMES[id] && THEMES[id].lead) || ['triangle', 0.04, 12, 0.6] });
  // The Throne Room gets its own music now.
  Sfx.PLACES.throne = 'throne';

  // ---- Writing the tunes -------------------------------------------------------------------
  const seeded = seed => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const compose = th => {
    const rnd = seeded(th.seed * 7919), bar = th.bar || 8, beat = bar === 6 ? 3 : 4, P = th.prog, L = th.band.lead;
    const write = (part, start, rhythm) => {
      const out = []; let deg = start;
      for (let b = 0; b < 4; b++) {
        const ch = P[(part * 4 + b) % P.length];
        for (let p = 0; p < bar; p++) {
          const r = rhythm[p % rhythm.length];
          if (r === '.' || (r === 'o' && rnd() < 0.5)) continue;
          if (b === 3 && p > bar / 2 && rnd() < 0.6) continue; // breathe at the end of a phrase
          if (p % beat === 0) { const opts = [ch, ch + 2, ch + 4, ch + 7]; deg = opts.reduce((a, o) => (Math.abs(o - deg) + rnd() * 1.6 < Math.abs(a - deg) ? o : a), opts[0]); }
          else deg += [-1, 1, 1, -1, 2, -2, 0, 1][Math.floor(rnd() * 8)];
          deg = clamp(deg, -1, 10);
          out.push({ at: b * bar + p, deg, acc: p === 0 });
        }
      }
      if (out.length) { const last = out[out.length - 1]; last.deg = P[(part * 4 + 3) % P.length]; }
      out.forEach((n, i) => { n.len = Math.min(bar, ((out[i + 1] ? out[i + 1].at : 4 * bar) - n.at)); });
      return out;
    };
    const A = write(0, 2, L.rhythm), A2 = A.map(n => Object.assign({}, n)), B = write(2, 4, L.rhythmB || L.rhythm), A3 = write(3, 2, L.rhythm);
    // The second A answers the first: same start, its own ending.
    const end = write(1, 4, L.rhythm).filter(n => n.at >= 2 * bar);
    return [A, A2.filter(n => n.at < 2 * bar).concat(end), B, A3.filter(n => n.at < 2 * bar).concat(A.filter(n => n.at >= 2 * bar))];
  };
  const cache = {};
  const DEG = { 1: 0, 3: 2, 5: 4, 8: 7 };

  // ---- Playing them ------------------------------------------------------------------------
  const switchTo = Music.switchTo.bind(Music);
  Music.switchTo = function (id) {
    switchTo(id);
    const s = this.song;
    if (!s || !s.th.band) return;
    const base = id.split('@')[0];
    if (!cache[base]) cache[base] = compose(s.th);
    s.parts = cache[base];
    if (scaleOf(s.th.scale)) s.scale = scaleOf(s.th.scale);
  };
  const playStep = Music.playStep.bind(Music);
  Music.playStep = function (s, when) {
    const th = s.th;
    if (!th.band) return playStep(s, when);
    if (!s.mixGain && th.mix && Sfx.ctx) { s.mixGain = Sfx.ctx.createGain(); s.mixGain.gain.value = th.mix; s.mixGain.connect(s.gain); }
    const B = th.band, out = s.mixGain || s.gain, bar = s.bar, pos = s.step % bar, b = Math.floor(s.step / bar), len = s.stepT;
    const ch = th.prog[b % th.prog.length], partIx = Math.floor(b / 4) % 4, night = s.night;
    const f = (deg, oct) => this.freq(s, deg, oct);
    const on = (pat, i = pos) => pat && pat[i % pat.length] !== '.' ? ({ x: 1, X: 1.4, o: 0.5, c: 1 }[pat[i % pat.length]] || 1) : 0;
    const inPart = spec => !spec.parts || spec.parts.includes(partIx);
    // Chords: held, or struck on the beat pattern.
    if (B.chords && inPart(B.chords)) { const v = on(B.chords.pat); if (v) [0, 2, 4].forEach(k => play(B.chords.inst, f(ch + k, B.chords.oct), when, len * (B.chords.hold || 1) * 0.95, B.chords.vol * v * (night ? 0.8 : 1), out)); }
    // Arpeggio.
    if (B.arp && inPart(B.arp) && !(night && pos % 2)) { const c = B.arp.pat[pos % B.arp.pat.length]; if (c !== '.') play(B.arp.inst, f(ch + DEG[c], B.arp.oct), when, len * 1.6, B.arp.vol * (night ? 0.7 : 1), out); }
    // Bass.
    if (B.bass) { const c = B.bass.pat[pos % B.bass.pat.length]; if (c && c !== '.') play(B.bass.inst, f(ch + DEG[c], B.bass.oct), when, len * 1.7, B.bass.vol, out); }
    // Melody, and a harmony a third below it in some sections.
    const part = s.parts[partIx], at = (b % 4) * bar + pos, L = B.lead, inst = L.parts[partIx];
    for (const n of part) if (n.at === at && !(night && (n.at * 7 + b) % 10 < 3)) {
      const d = len * n.len * 0.94, v = L.vol * (n.acc ? 1.15 : 1) * (night ? 0.75 : 1);
      play(inst, f(n.deg, L.oct), when, d, v, out);
      if (L.harmony && L.harmony.includes(partIx)) play(L.harmonyInst || inst, f(n.deg - 2, L.oct), when, d, v * 0.55, out);
    }
    // Percussion (soft or none at night).
    if (!night && B.perc) for (const k in B.perc) {
      const pat = B.perc[k], v = pat.length > bar ? on(pat, s.step % pat.length) : on(pat);
      if (!v) continue;
      if (k === 'timp') timp(f(ch, -24), when, v, out); else if (PERC[k]) PERC[k](when, v, out);
    }
    // A timpani or snare roll to close every fourth bar.
    if (B.roll && !night && b % 4 === 3 && pos >= bar - 2) for (let i = 0; i < 4; i++) timp(f(th.prog[(b + 1) % th.prog.length], -24), when + i * len / 4, 0.35 + i * 0.12, out);
  };

  // ---- The Pit's crowd, fire and cheers; the beach's waves ------------------------------------
  Object.assign(Sfx.AMB, {
    roar() { Sfx.noise(3.2, 0.045, 900, { type: 'bandpass', q: 0.5, attack: 1, to: 700, out: Sfx.ambBus }); },
    cheer() {
      Sfx.noise(2.2, 0.09, 700, { type: 'bandpass', q: 0.7, attack: 0.25, to: 1500, out: Sfx.ambBus });
      for (let i = 0; i < 3; i++) Sfx.tone(1900 + R() * 900, 0.35, 'sine', 0.01, 0.2 + R() * 0.8, 500, Sfx.ambBus, 0.03);
      for (let i = 0; i < 4; i++) Sfx.noise(0.05, 0.03, 2500, { type: 'bandpass', q: 2, when: 0.3 + R() * 1.2, out: Sfx.ambBus });
    },
    crackle() { for (let i = 0; i < 3; i++) Sfx.noise(0.02, 0.025, 3000 + R() * 3000, { type: 'highpass', when: R() * 0.3, out: Sfx.ambBus }); },
    surf() { Sfx.noise(4.5, 0.05, 900, { type: 'lowpass', attack: 2, out: Sfx.ambBus, to: 400 }); },
  });
  Sfx.BEDS.pit = { roar: [2.2, 2.8], cheer: [6, 12], crackle: [0.25, 0.7] };
  Sfx.BEDS.coast = { waves: [2.4, 3.8], surf: [3.5, 5], gulls: [5, 11] };
  Sfx.BEDS.pirates = Object.assign({}, Sfx.BEDS.pirates, { creak: [5, 10] });
  Sfx.BEDS.castle = Sfx.BEDS.castle || {};
  Sfx.BEDS.throne = { crackle: [0.6, 1.6] };
  // The mines creak, shed pebbles, and on the deep floors something whispers.
  Sfx.AMB.pebbles = () => { for (let i = 0; i < 3 + Math.floor(R() * 4); i++) Sfx.noise(0.03, 0.03, 2200 + R() * 2500, { type: 'bandpass', q: 3, when: i * (0.05 + R() * 0.12), out: Sfx.ambBus }); };
  Sfx.BEDS.mine = Object.assign({}, Sfx.BEDS.mine, { creak: [7, 14], pebbles: [9, 18] });
  Sfx.BEDS.deep = Object.assign({}, Sfx.BEDS.deep, { creak: [6, 12], pebbles: [7, 14], murmur: [14, 28] });
  Sfx.BEDS.isle = Object.assign({}, Sfx.BEDS.isle, { murmur: [18, 34] });
  // The crowd roars when something falls in the Pit.
  let kills = 0;
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) {
    tick(dt);
    if (!Arena.active) { kills = 0; return; }
    if (Arena.kills > kills && Sfx.ctx && Sfx.ambBus) { Sfx.AMB.cheer(); }
    kills = Arena.kills;
  };
  Sfx.INSTR = INSTR; Sfx.PERC = PERC; Sfx.BAND = BAND;
})();
