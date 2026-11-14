'use strict';
// Every boss arrives, fights and dies in a way of its own:
//  - a voice and attack sounds that suit it (a boar squeals, a toad croaks, armour
//    clangs, glass rings, stone grinds, a crown gets a fanfare),
//  - an entrance (dust and a roar, a drop from the sky, a pillar of fire, a swirl of
//    light, rocks pulling together) with a title card and the screen shaking,
//  - a death (toppling, deflating, burning out, shattering, crumbling, rising away).
// Loaded last: it wraps the combat, sound and drawing code it decorates.

(() => {
  const K = Sfx.kit, R = Math.random;
  const { ftone, bell, bells, thump, knock, debris, bubbles } = K;
  const hiss = (s, dur, vol, when = 0) => s.noise(dur, vol, 4000, { type: 'highpass', when });
  const jangle = (s, n, spread, vol = 0.035, from = 0) => { for (let i = 0; i < n; i++) bell(s, 2400 + R() * 1800, 0.15, vol, from + R() * spread); };
  const laugh = (s, f, n, when = 0) => { for (let i = 0; i < n; i++) ftone(s, f * (1 - i * 0.04), 0.1, 'sawtooth', 0.08, when + i * 0.13, -40, 1200, 0.01); };

  // ---- Their sounds ---------------------------------------------------------------
  Object.assign(Sfx.SOUNDS, {
    boss_hurt() {},
    // Gorehorn: snorts, squeals, hooves and stone.
    boar_roar() { ftone(this, 180, 0.9, 'sawtooth', 0.12, 0, -60, 900, 0.05); ftone(this, 240, 0.8, 'sawtooth', 0.07, 0.05, -90, 1100, 0.05); this.noise(0.9, 0.2, 500, { type: 'bandpass', attack: 0.1 }); thump(this, 80, 40, 0.5, 0.25); },
    boar_charge() { knock(this, 700, 0.12, 0.22, 0, 2); knock(this, 650, 0.12, 0.22, 0.15, 2); ftone(this, 200, 0.4, 'sawtooth', 0.1, 0.2, 140, 1000); for (let i = 0; i < 4; i++) thump(this, 120, 60, 0.06, 0.16, 0.25 + i * 0.08); },
    boar_stomp() { thump(this, 100, 30, 0.5, 0.42); this.noise(0.5, 0.36, 400); debris(this, 5, 0.05, 0.07); },
    boar_kick() { this.noise(0.25, 0.22, 1200, { type: 'bandpass', to: 3000 }); debris(this, 6, 0.02, 0.07); knock(this, 700, 0.1, 0.18, 0, 2); },
    boar_wall() { thump(this, 90, 30, 0.5, 0.45); this.noise(0.4, 0.42, 600); [0.35, 0.5, 0.65].forEach(w => bell(this, 2600 + R() * 400, 0.1, 0.035, w)); },
    rockfall() { knock(this, 700, 0.25, 0.3, 0, 1); thump(this, 140, 50, 0.2, 0.22); debris(this, 3, 0.03, 0.06); },
    boar_squeal() { ftone(this, 500, 0.25, 'sawtooth', 0.09, 0, 320, 2200); this.noise(0.1, 0.08, 1500, { type: 'bandpass' }); },
    boar_death() { ftone(this, 620, 0.9, 'sawtooth', 0.1, 0, -460, 2000, 0.02); thump(this, 80, 30, 0.6, 0.42, 0.6); this.noise(0.6, 0.32, 400, { when: 0.6 }); },
    // Mother Mire: deep croaks and wet things.
    mire_croak() { [0, 0.55].forEach(w => { ftone(this, 70, 0.5, 'sawtooth', 0.2, w, 20, 400, 0.04); thump(this, 90, 50, 0.3, 0.15, w); }); bubbles(this, 4, 0.2, 0.05); },
    mire_tongue() { thump(this, 200, 1200, 0.12, 0.17); knock(this, 1800, 0.1, 0.15, 0.1, 2); this.noise(0.2, 0.16, 1200, { when: 0.14 }); thump(this, 900, 250, 0.12, 0.1, 0.18); },
    mire_leap() { ftone(this, 90, 0.3, 'sawtooth', 0.16, 0, 60, 500); this.noise(0.4, 0.14, 400, { type: 'bandpass', to: 2400 }); },
    mire_land() { thump(this, 70, 25, 0.6, 0.48); this.noise(0.6, 0.45, 700, { to: 150 }); bubbles(this, 6, 0.1, 0.06); },
    mire_spit() { ftone(this, 120, 0.15, 'sawtooth', 0.12, 0, 80, 600); this.noise(0.2, 0.2, 900); bubbles(this, 2, 0.1, 0.05); },
    mire_glob() { this.noise(0.18, 0.22, 800, { to: 180 }); thump(this, 160, 60, 0.1, 0.13); bubbles(this, 2, 0.04, 0.04); },
    mire_hurt() { ftone(this, 110, 0.3, 'sawtooth', 0.15, 0, 60, 600); bubbles(this, 3, 0.05, 0.05); },
    mire_death() { ftone(this, 90, 1.4, 'sawtooth', 0.16, 0, -50, 500, 0.05); this.noise(1.4, 0.16, 500, { attack: 0.3 }); bubbles(this, 10, 0.1, 0.05); thump(this, 80, 30, 0.4, 0.3, 1.2); this.noise(0.4, 0.3, 600, { when: 1.2 }); },
    // Sir Ashgrave: fire roaring inside iron.
    ash_intro() { this.noise(1.4, 0.3, 300, { type: 'bandpass', to: 1200, attack: 0.4 }); bell(this, 880, 1.2, 0.06, 0.9); bell(this, 1320, 1.0, 0.04, 0.95); knock(this, 2500, 0.05, 0.2, 1.0, 5); knock(this, 2300, 0.05, 0.2, 1.2, 5); thump(this, 100, 40, 0.4, 0.3, 1.2); },
    ash_slash() { this.noise(0.25, 0.25, 500, { type: 'bandpass', q: 2, to: 2200 }); this.noise(0.3, 0.16, 400, { type: 'bandpass', to: 900 }); this.tone(2400, 0.15, 'sine', 0.025, 0.02, 400); },
    ash_flame() { this.noise(0.6, 0.28, 300, { type: 'bandpass', to: 1000, attack: 0.05 }); for (let i = 0; i < 6; i++) this.noise(0.02, 0.1, 3500, { type: 'highpass', when: R() * 0.5 }); thump(this, 120, 60, 0.3, 0.12); },
    ash_burst() { thump(this, 110, 35, 0.6, 0.36); this.noise(0.7, 0.42, 1200, { to: 200 }); for (let i = 0; i < 5; i++) this.noise(0.02, 0.1, 3500, { type: 'highpass', when: 0.1 + R() * 0.5 }); },
    ash_hurt() { knock(this, 2800, 0.05, 0.22, 0, 5); bell(this, 620, 0.35, 0.05); hiss(this, 0.3, 0.06); },
    ash_death() { for (let i = 0; i < 7; i++) knock(this, 2000 + R() * 1500, 0.06, 0.2, i * 0.12, 5); bell(this, 500, 1.4, 0.06, 0.1); bell(this, 740, 1.2, 0.05, 0.3); this.noise(1.6, 0.22, 900, { type: 'bandpass', to: 200 }); thump(this, 90, 30, 0.5, 0.3, 1.0); },
    // Glasswing: wingbeats, glass and lightning.
    moth_intro() { for (let i = 0; i < 10; i++) knock(this, 900, 0.04, 0.13, i * 0.07, 1); this.tone(400, 1.4, 'sine', 0.06, 0, 1200, undefined, 0.4); this.noise(0.12, 0.35, 2500, { type: 'highpass', when: 1.4 }); this.noise(0.9, 0.25, 300, { when: 1.45 }); },
    moth_bolt() { ftone(this, 1800, 0.12, 'sawtooth', 0.1, 0, -1500, 6000); this.noise(0.15, 0.3, 3000, { type: 'highpass' }); this.noise(0.8, 0.2, 300, { when: 0.08 }); },
    moth_call() { bells(this, [1568, 2093, 2637, 3136], 0.06, 0.5, 0.04); },
    moth_dust() { bells(this, [2349, 2793, 3136], 0.05, 0.4, 0.035); this.noise(0.5, 0.05, 6000, { type: 'highpass', attack: 0.2 }); },
    moth_dive() { for (let i = 0; i < 4; i++) knock(this, 900, 0.03, 0.12, i * 0.05, 1); this.noise(0.4, 0.2, 400, { type: 'bandpass', to: 2600 }); },
    moth_hurt() { bell(this, 3136, 0.15, 0.05); this.tone(2600, 0.12, 'sine', 0.05, 0, -800); },
    moth_death() { this.noise(0.5, 0.3, 2500, { type: 'highpass' }); for (let i = 0; i < 9; i++) bell(this, 2000 + R() * 2500, 0.2, 0.04, R() * 0.4); for (let i = 0; i < 5; i++) knock(this, 900, 0.04, 0.1, 0.4 + i * (0.1 + i * 0.05), 1); bells(this, [2093, 1568, 1319, 1047], 0.25, 0.8, 0.03, 0.6); },
    // Morrow: grinding stone, a furnace heart.
    golem_intro() { debris(this, 18, 0, 0.07); for (let i = 0; i < 6; i++) debris(this, 2, i * 0.25, 0.07); this.noise(1.6, 0.22, 200, { type: 'bandpass', to: 500, attack: 0.3 }); ftone(this, 55, 1.2, 'sawtooth', 0.16, 0.8, 20, 300, 0.2); thump(this, 80, 40, 0.5, 0.35, 1.6); bell(this, 220, 1, 0.06, 1.6); },
    golem_quake() { this.noise(1.4, 0.45, 180, { attack: 0.1 }); thump(this, 55, 25, 1.2, 0.32); ftone(this, 50, 1, 'sawtooth', 0.1, 0, 15, 250, 0.1); debris(this, 8, 0.1, 0.07); },
    golem_throw() { this.noise(0.3, 0.22, 300, { type: 'bandpass', q: 2 }); this.noise(0.4, 0.2, 200, { type: 'bandpass', to: 800, when: 0.15 }); },
    golem_boulder() { thump(this, 90, 30, 0.5, 0.42); this.noise(0.5, 0.42, 600); debris(this, 6, 0.04, 0.08); },
    golem_spikes() { bell(this, 1568, 0.5, 0.05); bell(this, 2093, 0.4, 0.04, 0.03); knock(this, 5000, 0.05, 0.12, 0, 3); knock(this, 900, 0.1, 0.2, 0, 1.5); },
    golem_hurt() { knock(this, 700, 0.15, 0.3, 0, 1.5); thump(this, 100, 60, 0.1, 0.15); debris(this, 2, 0.02, 0.06); },
    golem_death() { this.noise(2, 0.42, 400, { attack: 0.1 }); for (let i = 0; i < 8; i++) debris(this, 3, i * 0.2, 0.08); [0.3, 0.8, 1.3].forEach(w => thump(this, 90, 30, 0.4, 0.3, w)); this.tone(400, 1.2, 'sine', 0.08, 0.2, -340); },
    // The King: brass, a choir and a bell.
    king_intro() { [392, 523, 659, 784].forEach((f, i) => ftone(this, f, 0.35, 'sawtooth', 0.08, i * 0.15, 0, 1800, 0.02)); [262, 330, 392].forEach(f => this.tone(f, 1.6, 'sine', 0.05, 0.5, 0, undefined, 0.4)); bell(this, 523, 1.5, 0.07, 0.6); },
    king_strike() { this.noise(0.2, 0.22, 600, { type: 'bandpass', to: 2000 }); bell(this, 990, 0.3, 0.04); },
    king_slam() { thump(this, 80, 30, 0.6, 0.42); [196, 247, 294].forEach(f => this.tone(f, 0.6, 'sine', 0.06, 0, 0, undefined, 0.02)); this.noise(0.5, 0.32, 500); },
    king_hurt() { ftone(this, 180, 0.25, 'sawtooth', 0.1, 0, -60, 900); bell(this, 700, 0.2, 0.03); },
    king_death() { [[392, 494, 587], [349, 440, 523], [294, 370, 440]].forEach((c, i) => c.forEach(f => this.tone(f, 0.9, 'sine', 0.045, i * 0.6, 0, undefined, 0.15))); [0, 0.6, 1.2].forEach(w => bell(this, 196, 1.6, 0.08, w)); this.noise(2, 0.12, 200, { attack: 0.5 }); },
    // Rusk: a whistle, a laugh, a knife.
    rusk_intro() { this.tone(1800, 0.15, 'sine', 0.07, 0, 600); this.tone(2400, 0.2, 'sine', 0.07, 0.17, -800); laugh(this, 220, 3, 0.45); },
    rusk_slash() { this.noise(0.1, 0.2, 2000, { type: 'bandpass', q: 2, to: 5000 }); this.tone(3200, 0.08, 'sine', 0.02, 0.02, 300); },
    rusk_hurt() { ftone(this, 200, 0.15, 'sawtooth', 0.1, 0, -60, 1000); },
    rusk_death() { ftone(this, 260, 0.3, 'sawtooth', 0.1, 0, -120, 1100, 0.02); bell(this, 2600, 0.25, 0.06, 0.5); bell(this, 2900, 0.15, 0.04, 0.62); thump(this, 110, 45, 0.3, 0.3, 0.7); },
    // The Warden: chains and a cold moan.
    warden_intro() { jangle(this, 8, 0.6, 0.03); ftone(this, 220, 1.4, 'triangle', 0.1, 0.2, -60, 1500, 0.4); this.noise(1.4, 0.12, 600, { type: 'bandpass', attack: 0.5 }); },
    warden_swing() { this.noise(0.2, 0.22, 1500, { type: 'bandpass', to: 4000 }); for (let i = 0; i < 3; i++) knock(this, 3200, 0.03, 0.12, 0.05 + i * 0.04, 5); },
    warden_slam() { thump(this, 80, 28, 0.6, 0.44); bell(this, 330, 0.8, 0.06); bell(this, 466, 0.6, 0.04); this.noise(0.8, 0.12, 600, { type: 'bandpass', attack: 0.2 }); },
    warden_hurt() { knock(this, 1800, 0.04, 0.16, 0, 3); knock(this, 2400, 0.04, 0.14, 0.05, 3); bell(this, 466, 0.2, 0.03); },
    warden_death() { ftone(this, 440, 1.8, 'triangle', 0.12, 0, -300, 2000, 0.2); jangle(this, 10, 1.0, 0.03, 0.3); thump(this, 90, 30, 0.4, 0.25, 1.1); },
    // Inquisitor Thorne: a bell and a rapier.
    thorne_intro() { bell(this, 196, 2, 0.12); bell(this, 392, 1.5, 0.05); [294, 370, 440].forEach(f => this.tone(f, 1.6, 'sine', 0.045, 0.2, 0, undefined, 0.5)); },
    thorne_strike() { this.noise(0.12, 0.2, 2500, { type: 'bandpass', q: 2, to: 6000 }); this.tone(3500, 0.15, 'sine', 0.025, 0, 500); },
    thorne_hurt() { ftone(this, 240, 0.2, 'sawtooth', 0.09, 0, -80, 1100); },
    thorne_death() { bell(this, 147, 2, 0.12); bell(this, 147, 2, 0.1, 0.9); [[294, 370, 440], [262, 330, 392]].forEach((c, i) => c.forEach(f => this.tone(f, 1, 'sine', 0.04, i * 0.6, 0, undefined, 0.2))); },
    // Gaolmaster Kessick: keys and iron gates.
    kessick_intro() { jangle(this, 7, 0.4); thump(this, 80, 30, 0.5, 0.42, 0.5); knock(this, 1200, 0.3, 0.32, 0.5, 1.5); bell(this, 300, 0.8, 0.06, 0.5); },
    kessick_swing() { this.noise(0.25, 0.24, 400, { type: 'bandpass', to: 1500 }); bell(this, 500, 0.15, 0.03); },
    kessick_slam() { thump(this, 80, 30, 0.5, 0.42); knock(this, 1200, 0.3, 0.32, 0, 1.5); bell(this, 300, 0.8, 0.06); },
    kessick_hurt() { ftone(this, 150, 0.2, 'sawtooth', 0.11, 0, -40, 800); jangle(this, 2, 0.1, 0.03); },
    kessick_death() { jangle(this, 12, 0.9, 0.04); ftone(this, 140, 0.6, 'sawtooth', 0.1, 0, -60, 700, 0.02); thump(this, 100, 35, 0.4, 0.32, 0.6); },
    // Captain Vane: powder, steel and gold.
    vane_intro() { this.noise(0.08, 0.5, 1500, { type: 'highpass' }); thump(this, 200, 60, 0.2, 0.32); this.noise(0.6, 0.15, 600, { when: 0.05 }); laugh(this, 180, 2, 0.5); },
    vane_slash() { this.noise(0.15, 0.22, 1500, { type: 'bandpass', q: 2, to: 4500 }); this.tone(2800, 0.12, 'sine', 0.03, 0.02, 400); },
    vane_slam() { this.noise(0.08, 0.5, 1500, { type: 'highpass' }); thump(this, 200, 60, 0.2, 0.32); this.noise(0.5, 0.3, 700, { when: 0.03 }); },
    vane_hurt() { ftone(this, 170, 0.2, 'sawtooth', 0.11, 0, -50, 900); },
    vane_death() { ftone(this, 160, 0.6, 'sawtooth', 0.1, 0, -70, 800, 0.02); for (let i = 0; i < 10; i++) bell(this, 1500 + R() * 1200, 0.15, 0.035, 0.4 + R() * 0.6); thump(this, 100, 35, 0.4, 0.3, 0.45); },
  });

  // ---- Who each boss is ----------------------------------------------------------
  // title: shown under the name. enter/die: animation styles. color: their light.
  // sfx: generic sound -> their own sound, used while they act.
  const BOSS = {
    gorehorn: { title: 'The Pit Boar', enter: 'dust', die: 'topple', color: '#c8a070', intro: 'boar_roar',
      sfx: { charge: 'boar_charge', slam: 'boar_stomp', throw: 'boar_kick', thud: 'boar_wall', boom: 'rockfall', boss_hurt: 'boar_squeal', kill: 'boar_death' } },
    mire: { title: 'Queen of the Bog', enter: 'drop', die: 'deflate', color: '#6aa04e', intro: 'mire_croak',
      sfx: { tongue: 'mire_tongue', leap: 'mire_leap', slam: 'mire_land', splat: 'mire_glob', boss_hurt: 'mire_hurt', kill: 'mire_death' }, attackSfx: { splat: 'mire_spit' } },
    ashgrave: { title: 'The Burned Champion', enter: 'pillar', die: 'burnout', color: '#ff8a30', intro: 'ash_intro',
      sfx: { heavy_swing: 'ash_slash', fire: 'ash_flame', boom: 'ash_burst', boss_hurt: 'ash_hurt', kill: 'ash_death' } },
    glasswing: { title: 'Moth of the Storm', enter: 'gather', die: 'shatter', color: '#9ad8ff', intro: 'moth_intro',
      sfx: { thunder: 'moth_bolt', magic: 'moth_call', magic_cast: 'moth_dust', whoosh: 'moth_dive', boss_hurt: 'moth_hurt', kill: 'moth_death' } },
    morrow: { title: 'The Hill That Stood Up', enter: 'assemble', die: 'crumble', color: '#ffb040', intro: 'golem_intro',
      sfx: { quake: 'golem_quake', throw: 'golem_throw', boom: 'golem_boulder', crystal: 'golem_spikes', boss_hurt: 'golem_hurt', kill: 'golem_death' } },
    king: { title: 'Sovereign of the Valley', enter: 'light', die: 'ascend', color: '#f0d070', intro: 'king_intro',
      sfx: { foe_swing: 'king_strike', slam: 'king_slam', boss_hurt: 'king_hurt', kill: 'king_death' } },
    rusk: { title: 'Chief of the Greywood Camp', enter: 'smoke', die: 'topple', color: '#c8b088', intro: 'rusk_intro',
      sfx: { foe_swing: 'rusk_slash', boss_hurt: 'rusk_hurt', kill: 'rusk_death' } },
    warden: { title: 'Keeper of the Old Keep', enter: 'frost', die: 'dissolve', color: '#9ad8ff', intro: 'warden_intro',
      sfx: { foe_swing: 'warden_swing', slam: 'warden_slam', boss_hurt: 'warden_hurt', kill: 'warden_death' } },
    thorne: { title: 'Inquisitor of the Crown', enter: 'gather', die: 'kneel', color: '#f0d070', intro: 'thorne_intro',
      sfx: { foe_swing: 'thorne_strike', boss_hurt: 'thorne_hurt', kill: 'thorne_death' } },
    kessick: { title: 'Master of the Black Wing', enter: 'chains', die: 'topple', color: '#a0a0a8', intro: 'kessick_intro',
      sfx: { foe_swing: 'kessick_swing', slam: 'kessick_slam', boss_hurt: 'kessick_hurt', kill: 'kessick_death' } },
    vane: { title: 'Captain of the Red Gull', enter: 'smoke', die: 'topple', color: '#c43030', intro: 'vane_intro',
      sfx: { foe_swing: 'vane_slash', slam: 'vane_slam', boss_hurt: 'vane_hurt', kill: 'vane_death' } },
  };

  // While a boss acts, generic sounds become theirs.
  const playBase = Sfx.play;
  Sfx.play = function (name, arg) {
    const b = Sfx.voice && BOSS[Sfx.voice];
    if (b) name = (Sfx.voicePhase === 'attack' && b.attackSfx && b.attackSfx[name]) || b.sfx[name] || name;
    return playBase.call(this, name, arg);
  };
  const speak = (type, fn, phase) => {
    const was = Sfx.voice, wasP = Sfx.voicePhase;
    Sfx.voice = BOSS[type] ? type : null; Sfx.voicePhase = phase;
    try { return fn(); } finally { Sfx.voice = was; Sfx.voicePhase = wasP; }
  };
  // Shots, ground marks and shockwaves a boss leaves behind keep its voice.
  const tagNew = (type, n) => { if (!BOSS[type]) return; Foes.shots.slice(n.s).forEach(x => { x.voice = type; }); Foes.marks.slice(n.m).forEach(x => { x.voice = type; }); };
  const counts = () => ({ s: Foes.shots.length, m: Foes.marks.length });
  const strikeBase = Foes.strike;
  Foes.strike = function (f, d) { const n = counts(); const r = speak(f.type, () => strikeBase.call(this, f, d), 'attack'); tagNew(f.type, n); return r; };
  Object.keys(Foes.AI).forEach(k => {
    const ai = Foes.AI[k];
    Foes.AI[k] = function (f, ...rest) { if (!f.def.boss) return ai.call(this, f, ...rest); const n = counts(); const r = speak(f.type, () => ai.call(this, f, ...rest), 'move'); tagNew(f.type, n); return r; };
  });
  Sfx.speakAs = speak;
  const markBase = Foes.mark;
  Foes.mark = function (...a) { markBase.apply(this, a); if (Sfx.voice) this.marks[this.marks.length - 1].voice = Sfx.voice; };

  // ---- Screen shake ----------------------------------------------------------------
  VFX.shakeT = 0; VFX.shakeA = 0;
  VFX.shake = (t, a) => { VFX.shakeT = Math.max(VFX.shakeT, t); VFX.shakeA = Math.max(VFX.shakeT > 0 ? VFX.shakeA : 0, a); };
  const worldBase = Render.world;
  Render.world = function (g, W, H, dt) {
    if (VFX.shakeT <= 0) return worldBase.call(this, g, W, H, dt);
    const a = VFX.shakeA * Math.min(1, VFX.shakeT * 3);
    g.save(); g.translate(Math.round((R() - 0.5) * 2 * a), Math.round((R() - 0.5) * 2 * a));
    worldBase.call(this, g, W, H, dt);
    g.restore();
  };

  // ---- Entrances ---------------------------------------------------------------------
  const ENTER_T = { dust: 1.8, drop: 1.6, pillar: 1.9, gather: 1.9, assemble: 2.1, light: 2.1, smoke: 1.2, frost: 1.8, chains: 1.3 };
  const BossFX = { card: null, dying: [] };
  const begin = f => {
    const b = BOSS[f.type];
    f.introDone = true;
    if (!b) return;
    const t = ENTER_T[b.enter] || 1.5;
    f.intro = { t, max: t, style: b.enter, beat: 0, landed: false };
    BossFX.card = { name: f.def.name, title: b.title, color: b.color, t: t + 1.6, max: t + 1.6 };
    speak(f.type, () => Sfx.play(b.intro));
    VFX.shake(0.5, 2);
    if (b.enter === 'smoke') { VFX.burst('smoke', f.x, f.y - 10, 30, 60); VFX.ring(f.x, f.y, 34, '#8a8478', 0.6); if (f.type === 'vane') VFX.flash(0.1, '#ffd8a0'); }
    if (b.enter === 'chains') { VFX.burst('spark', f.x, f.y - 12, 20, 70); VFX.ring(f.x, f.y, 30, '#a0a0a8', 0.5); }
  };
  const finish = f => {
    const b = BOSS[f.type];
    f.intro = null; f.z = 0;
    VFX.ring(f.x, f.y, 46, b.color, 0.5); VFX.shake(0.35, 3);
    VFX.burst(b.enter === 'pillar' ? 'flame' : b.enter === 'frost' ? 'flake' : b.enter === 'light' || b.enter === 'gather' ? 'star' : 'dust', f.x, f.y - 12, 18, 70);
  };
  const tickIntro = (f, dt) => {
    const it = f.intro, p = 1 - it.t / it.max;
    it.t -= dt; it.beat -= dt;
    f.stun = Math.max(f.stun, 0.05); f.stunT = 0; f.vx = f.vy = 0; f.dashT = 0;
    if (f.state === 'windup') f.state = 'chase';
    const x = f.x, y = f.y;
    switch (it.style) {
      case 'dust': if (it.beat <= 0) { it.beat = 0.32; VFX.burst('dust', x + (R() - 0.5) * 20, y, 10, 50); Sfx.play('hoof'); VFX.shake(0.15, 2); } break;
      case 'drop': f.z = p < 0.75 ? Math.pow(1 - p / 0.75, 2) * 230 : 0;
        if (p >= 0.75 && !it.landed) { it.landed = true; VFX.explosion(x, y, 44, 'poison'); Foes.hazards.push({ x, y, r: 26, t: 3, kind: 'spore' }); VFX.shake(0.5, 5); speak(f.type, () => Sfx.play('slam')); } break;
      case 'pillar': if (it.beat <= 0) { it.beat = 0.03; VFX.emit('flame', x + (R() - 0.5) * 18, y - R() * 10, { vy: -90 - R() * 60, t: 0.7 }); } break;
      case 'frost': if (it.beat <= 0) { it.beat = 0.04; VFX.emit('flake', x + (R() - 0.5) * 22, y - R() * 30, { vy: -30, t: 0.9 }); VFX.emit('smoke', x + (R() - 0.5) * 20, y, { vy: -10 }); } break;
      case 'gather': if (it.beat <= 0) { it.beat = 0.03; const a = R() * 6.28, r = 20 + (1 - p) * 70; VFX.emit(f.type === 'thorne' ? 'star' : 'hex', x + Math.cos(a) * r, y - 14 + Math.sin(a) * r * 0.6, { vx: -Math.cos(a) * r * 1.6, vy: -Math.sin(a) * r, t: 0.6, color: BOSS[f.type].color }); } break;
      case 'assemble': if (it.beat <= 0) { it.beat = 0.25; VFX.shake(0.12, 2); VFX.burst('dust', x, y, 6, 30); } break;
      case 'light': if (it.beat <= 0) { it.beat = 0.05; VFX.emit('star', x + (R() - 0.5) * 24, y - R() * 40, { vy: -20, t: 0.8 }); if (R() < 0.3) VFX.emit('heal', x + (R() - 0.5) * 30, y - 10, { vy: -14, color: '#5a9a4a' }); } break;
      case 'chains': if (it.beat <= 0) { it.beat = 0.15; VFX.emit('spark', x + (R() - 0.5) * 30, y - 20, { vy: 40, color: '#a0a0a8' }); } break;
      default: break;
    }
    if (it.t <= 0) finish(f);
  };
  const drawIntro = (g, f, base) => {
    const it = f.intro, p = clamp(1 - it.t / it.max, 0, 1), x = Math.round(f.x), y = Math.round(f.y), c = BOSS[f.type].color;
    switch (it.style) {
      case 'drop': {
        const r = 10 + p * 18; g.fillStyle = `rgba(0,0,0,${0.15 + p * 0.3})`; g.beginPath(); g.ellipse(x, y, r, r * 0.45, 0, 0, 6.29); g.fill();
        return base(g, f);
      }
      case 'pillar': case 'frost': {
        const col = it.style === 'pillar' ? 'rgba(255,138,48,' : 'rgba(154,216,255,';
        g.fillStyle = col + (0.35 * (1 - p * 0.6)) + ')'; g.fillRect(x - 12, y - 120, 24, 122);
        g.fillStyle = col + '0.6)'; g.fillRect(x - 4, y - 120, 8, 122);
        const h = 60 * Math.min(1, p * 1.3);
        g.save(); g.beginPath(); g.rect(x - 60, y + 4 - h, 120, h); g.clip(); base(g, f); g.restore(); return;
      }
      case 'gather': g.globalAlpha = p * p; base(g, f); g.globalAlpha = 1;
        g.strokeStyle = c; g.globalAlpha = 0.5; g.beginPath(); g.arc(x, y - 14, 10 + (1 - p) * 60, 0, 6.29); g.stroke(); g.globalAlpha = 1; return;
      case 'assemble': {
        for (let i = 0; i < 10; i++) { const a = i * 0.628 + p * 2, r = (1 - p) * 90 + 6; g.fillStyle = i % 2 ? '#7a7672' : '#5e5a56'; g.fillRect(Math.round(x + Math.cos(a) * r) - 3, Math.round(y - 20 + Math.sin(a) * r * 0.6) - 3, 7, 6); }
        if (p > 0.55) { g.globalAlpha = (p - 0.55) / 0.45; base(g, f); g.globalAlpha = 1; } return;
      }
      case 'light': {
        g.fillStyle = `rgba(255,232,150,${0.28 * (1 - p * 0.5)})`; g.fillRect(x - 18, y - 260, 36, 262); g.fillStyle = 'rgba(255,248,210,0.45)'; g.fillRect(x - 6, y - 260, 12, 262);
        g.globalAlpha = Math.min(1, p * 1.4); base(g, f); g.globalAlpha = 1; return;
      }
      case 'smoke': if (p > 0.25) base(g, f); return;
      default: return base(g, f);
    }
  };

  // ---- Deaths ------------------------------------------------------------------------
  const DIE_T = { topple: 1.8, deflate: 2, burnout: 2.2, shatter: 1.6, crumble: 2.4, ascend: 2.4, dissolve: 2.2, kneel: 2.2 };
  const imgOf = f => (f.def.human ? Art.charFrame('foe_' + f.type, f.def.look, f.dir, 0) : Art.foe(f.type, 0, f.dir === DIRS.left));
  const dieStart = f => {
    const b = BOSS[f.type];
    if (!b) return;
    f.state = 'dead'; f.flash = 0; f.bubble = 0; f.z = 0; f.air = false; f.intro = null;
    const d = { f, t: 0, max: DIE_T[b.die] || 2, style: b.die, side: R() < 0.5 ? -1 : 1, beat: 0, done: {} };
    BossFX.dying.push(d);
    VFX.flash(0.18, '#ffffff'); VFX.shake(0.7, 4); VFX.ring(f.x, f.y - 10, 50, b.color, 0.6);
    if (b.die === 'shatter') {
      for (let i = 0; i < 40; i++) { const a = R() * 6.28, s = 40 + R() * 110; VFX.emit('spark', f.x, f.y - 16, { vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, t: 0.9 + R() * 0.5, color: R() < 0.5 ? '#c8d8ec' : '#e8f4ff' }); }
      VFX.burst('star', f.x, f.y - 16, 16, 80);
    }
    if (b.die === 'deflate') Foes.hazards.push({ x: f.x, y: f.y, r: 30, t: 3, kind: 'spore' });
  };
  const tickDie = (d, dt) => {
    const f = d.f, p = d.t / d.max, x = f.x, y = f.y;
    d.t += dt; d.beat -= dt;
    const once = (k, fn) => { if (!d.done[k]) { d.done[k] = 1; fn(); } };
    switch (d.style) {
      case 'topple': if (p > 0.3) once('thud', () => { VFX.burst('dust', x + d.side * 14, y, 16, 60); VFX.shake(0.3, 3); }); break;
      case 'deflate': if (d.beat <= 0) { d.beat = 0.08; VFX.emit('bubble', x + (R() - 0.5) * 30, y - R() * 14); } break;
      case 'burnout': if (d.beat <= 0) { d.beat = 0.03; VFX.emit('flame', x + (R() - 0.5) * 20, y - R() * 36, { vy: -40 - R() * 40 }); } if (p > 0.7) once('ash', () => { VFX.burst('smoke', x, y - 14, 30, 50); VFX.burst('flame', x, y - 14, 20, 60); }); break;
      case 'crumble': if (d.beat <= 0) { d.beat = 0.12; VFX.burst('dust', x + (R() - 0.5) * 40, y, 6, 40); VFX.shake(0.1, 2); } if (p > 0.15) once('core', () => { VFX.explosion(x, y - 22, 30, 'fire'); }); break;
      case 'ascend': case 'kneel': if (d.beat <= 0) { d.beat = 0.05; VFX.emit('star', x + (R() - 0.5) * 24, y - R() * 40, { vy: -30, color: BOSS[f.type].color }); } break;
      case 'dissolve': if (d.beat <= 0) { d.beat = 0.04; VFX.emit('flake', x + (R() - 0.5) * 22, y - R() * 36, { vy: -30, t: 0.8 }); } break;
      default: break;
    }
    if (d.t >= d.max) once('end', () => VFX.burst('smoke', x, y - 10, 12, 40));
  };
  const drawDie = (g, d) => {
    const f = d.f, p = clamp(d.t / d.max, 0, 1), x = Math.round(f.x), y = Math.round(f.y), fade = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;
    const draw = () => Foes.drawFoe(g, f);
    g.save();
    switch (d.style) {
      case 'topple': case 'kneel': {
        const a = d.style === 'kneel' ? Math.min(1, p * 2) * 0.5 : Math.min(1, p / 0.3) * 1.57;
        g.globalAlpha = fade; g.translate(x, y); g.rotate(a * d.side); g.translate(-x, -y); draw(); break;
      }
      case 'deflate': { const k = Math.min(1, p / 0.6); g.globalAlpha = fade; g.translate(x, y); g.scale(1 + k * 0.6, 1 - k * 0.75); g.translate(-x, -y); draw(); break; }
      case 'burnout': {
        if (p > 0.72) break;
        g.globalAlpha = 1; draw();
        const img = imgOf(f), k = f.def.scale || 1, w = img.width * k, h = img.height * k;
        g.globalAlpha = Math.min(1, p * 1.6); g.drawImage(Art.tinted(img, '#1a120c'), Math.round(x - w / 2), Math.round(y - h + 2), w, h); break;
      }
      case 'shatter': if (p < 0.12) { g.globalAlpha = 1 - p / 0.12; draw(); } break;
      case 'crumble': {
        const img = imgOf(f), h = img.height * (f.def.scale || 1), sink = h * Math.min(1, p / 0.8);
        g.beginPath(); g.rect(x - 80, y - 200, 160, 202); g.clip(); g.translate((R() - 0.5) * 2, sink); g.globalAlpha = fade; draw(); break;
      }
      case 'ascend': g.translate(0, -70 * p * p); g.globalAlpha = 1 - p; draw(); g.globalAlpha = 0.3 * (1 - p); g.fillStyle = '#ffe896'; g.fillRect(x - 14, y - 260, 28, 262); break;
      case 'dissolve': {
        g.globalAlpha = 1 - p; draw();
        const img = imgOf(f), k = f.def.scale || 1, w = img.width * k, h = img.height * k;
        g.globalAlpha = (1 - p) * 0.7; g.drawImage(Art.tinted(img, '#9ad8ff'), Math.round(x - w / 2), Math.round(y - h + 2), w, h); break;
      }
      default: g.globalAlpha = fade; draw();
    }
    g.restore();
  };

  // ---- Hooking it all in -------------------------------------------------------------
  const updateBase = Foes.update;
  Foes.update = function (dt) {
    for (const f of this.list) {
      if (f.def.boss && !f.introDone && f.state !== 'idle') begin(f);
      if (f.intro) tickIntro(f, dt);
    }
    return updateBase.call(this, dt);
  };
  const enterBase = Foes.enter;
  Foes.enter = function (m) { if (this.mapId !== m.id) BossFX.dying = []; return enterBase.call(this, m); };
  const damageBase = Foes.damage;
  Foes.damage = function (f, ...rest) {
    if (f.intro) return;
    const before = f.hp, r = damageBase.call(this, f, ...rest);
    if (f.def.boss && f.hp < before && f.hp > 0 && BOSS[f.type]) {
      const now = performance.now();
      if (!(now - (f.voiceT || 0) < 900)) { f.voiceT = now; speak(f.type, () => Sfx.play('boss_hurt')); }
    }
    return r;
  };
  const killBase = Foes.kill;
  Foes.kill = function (f) {
    if (f.dead) return;
    const boss = f.def.boss && BOSS[f.type];
    const r = boss ? speak(f.type, () => killBase.call(this, f)) : killBase.call(this, f);
    if (boss) dieStart(f);
    return r;
  };
  const drawFoeBase = Foes.drawFoe;
  Foes.drawFoe = function (g, f) { if (f.intro) return drawIntro(g, f, (gg, ff) => drawFoeBase.call(this, gg, ff)); return drawFoeBase.call(this, g, f); };
  const vfxUpdate = VFX.update;
  VFX.update = function (dt) {
    vfxUpdate.call(this, dt);
    this.shakeT = Math.max(0, this.shakeT - dt);
    for (const d of BossFX.dying) tickDie(d, dt);
    BossFX.dying = BossFX.dying.filter(d => d.t < d.max);
    if (BossFX.card) { BossFX.card.t -= dt; if (BossFX.card.t <= 0) BossFX.card = null; }
  };
  const vfxDraw = VFX.draw;
  VFX.draw = function (g) { for (const d of BossFX.dying) drawDie(g, d); return vfxDraw.call(this, g); };
  // The title card: the name large, what they are beneath it.
  const hudBase = UI.hud;
  UI.hud = function (g) {
    hudBase.call(this, g);
    const c = BossFX.card;
    if (!c || UI.busy()) return;
    const age = c.max - c.t, a = Math.min(1, age / 0.3, c.t / 0.6), W = this.W, y = Math.round(this.H * 0.18) + 24;
    g.globalAlpha = clamp(a, 0, 1);
    const tw = Font.width(c.name) * 2, lw = Math.min(W - 40, tw + 60 * Math.min(1, age / 0.5));
    g.fillStyle = 'rgba(20,14,10,0.55)'; g.fillRect(Math.round(W / 2 - lw / 2), y - 6, Math.round(lw), 34);
    g.fillStyle = c.color; g.fillRect(Math.round(W / 2 - lw / 2), y - 6, Math.round(lw), 1); g.fillRect(Math.round(W / 2 - lw / 2), y + 27, Math.round(lw), 1);
    Font.shadow(g, c.name, Math.round(W / 2 - tw / 2), y, c.color, '#2a1a10', 2);
    Font.shadow(g, c.title, Math.round(W / 2 - Font.width(c.title) / 2), y + 18, '#efe2c8');
    g.globalAlpha = 1;
  };
  Sfx.BOSS = BOSS; VFX.BossFX = BossFX;
})();
