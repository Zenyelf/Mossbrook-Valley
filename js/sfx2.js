'use strict';
// Better, louder sound effects for weapons, tools, the dash, enemies and the Pit's flasks.
// Every swing should be heard, crisp and clear, and every weapon should sound like itself:
// a sword sings, a hammer whooms, a bow creaks and twangs, a flask shatters into fire or ice.

(() => {
  const SOUNDS = Sfx.SOUNDS, R = Math.random, old = Object.assign({}, SOUNDS);
  // Shorthands. sweep: a burst of filtered noise that slides in pitch, the body of every swish.
  const sweep = (s, dur, vol, f0, f1, o = {}) => s.noise(dur, vol, f0, Object.assign({ type: 'bandpass', q: 1.8, to: f1, attack: 0.012 }, o));
  const air = (s, dur, vol, when = 0) => s.noise(dur, vol, 6500, { type: 'highpass', when });
  const ring = (s, f, dur, vol, when = 0) => { s.tone(f, dur, 'sine', vol, when, f * 0.08); s.tone(f * 1.51, dur * 0.7, 'sine', vol * 0.45, when + 0.004, f * 0.05); };
  const crackle = (s, n, from, span, vol) => { for (let i = 0; i < n; i++) s.noise(0.02, vol, 2500 + R() * 4500, { type: 'highpass', when: from + R() * span }); };
  const tinkle = (s, n, from, span, vol) => { for (let i = 0; i < n; i++) s.tone(2600 + R() * 3600, 0.08 + R() * 0.12, 'sine', vol, from + R() * span, 0, undefined, 0.002); };
  const thump = (s, f0, f1, dur, vol, when = 0) => s.tone(f0, dur, 'sine', vol, when, f1 - f0);
  const knock = (s, f, dur, vol, when = 0, q = 3) => s.noise(dur, vol, f, { type: 'bandpass', q, when });

  // Play a sound at a given loudness: everything it makes goes through its own gain on the way out.
  const loud = (snd, g, fn, arg) => {
    const bus = snd.sfxBus;
    if (!snd.ctx || !bus) return fn.call(snd, arg);
    const gn = snd.ctx.createGain(); gn.gain.value = g; gn.connect(bus); snd.sfxBus = gn;
    try { fn.call(snd, arg); } finally { snd.sfxBus = bus; }
    setTimeout(() => { try { gn.disconnect(); } catch (e) { /* gone */ } }, 3000);
  };
  // How much each sound is lifted, measured so each one peaks clearly above the music.
  const GAIN = { sword: 5.5, light: 5.5, heavy: 2.6, thrust: 4.5, flail: 4, scythe: 4, shoot: 1.6, dodge: 2.4, hoe: 6, chop: 5.5, pick: 8, rock_break: 2.8, weed: 4, water: 1.5,
    hit: 5, foe_swing: 7, throw: 5, fire: 2.8, frost: 2.9, glass: 5, flask_throw: 4, drink: 1.6, magic_cast: 3.5 };
  // What is in your hand right now, so a swing can sound like that weapon.
  const heldKind = w => {
    const slot = Inv.held && Inv.held(), it = slot && ITEMS[slot.id], icon = it && it.icon && it.icon[0], id = slot && slot.id;
    if (w && w.ranged) return icon === 'crossbow' ? 'crossbow' : icon === 'axe' ? 'axes' : icon === 'wand' ? 'wand' : 'bow';
    if (id === 'hunting_knife' || id === 'rapier') return 'light';
    if (icon === 'hammer' || id === 'war_axe' || (w && (w.cool >= 0.8 || w.kb >= 250))) return 'heavy';
    if (icon === 'spear') return 'thrust';
    if (icon === 'flail') return 'flail';
    if (icon === 'ashscythe') return 'scythe';
    return 'sword';
  };

  const SWING = {
    // A sword sings: a bright swish and a thin metallic ring.
    sword() { sweep(this, 0.14, 0.42, 1300, 5400); air(this, 0.09, 0.16, 0.02); ring(this, 3200 + R() * 300, 0.22, 0.03, 0.03); },
    // A dagger or a rapier: quick and light.
    light() { sweep(this, 0.08, 0.36, 2300, 7000, { q: 2.2, attack: 0.006 }); air(this, 0.05, 0.14, 0.01); ring(this, 4200, 0.12, 0.018, 0.02); },
    // A hammer or a war axe: a deep, heavy whoom.
    heavy() { sweep(this, 0.32, 0.5, 240, 1500, { q: 1.3, attack: 0.07 }); thump(this, 80, 45, 0.28, 0.16, 0.04); air(this, 0.12, 0.08, 0.12); },
    // A spear: a sharp thrust and the knock of the shaft.
    thrust() { sweep(this, 0.12, 0.42, 900, 4200, { q: 2.4, attack: 0.004 }); knock(this, 520, 0.05, 0.22, 0, 4); air(this, 0.06, 0.12, 0.03); },
    // A flail: a whirl and the rattle of chain.
    flail() { sweep(this, 0.13, 0.36, 700, 2600); sweep(this, 0.13, 0.32, 900, 3000, { when: 0.13 }); for (let i = 0; i < 6; i++) knock(this, 3200 + R() * 3000, 0.025, 0.1, i * 0.04, 6); },
    // A scythe: a long airy sweep with a whistle in it.
    scythe() { sweep(this, 0.36, 0.42, 600, 4200, { q: 1.2, attack: 0.05 }); this.tone(2400, 0.28, 'sine', 0.025, 0.06, 700); air(this, 0.15, 0.1, 0.1); },
  };
  // Enchanted blades add a little of their element.
  const tail = (s, w) => {
    if (!w) return;
    if (w.burn) { sweep(s, 0.3, 0.16, 300, 1200, { q: 1, attack: 0.04, when: 0.05 }); crackle(s, 4, 0.08, 0.3, 0.07); }
    if (w.slow) { tinkle(s, 3, 0.05, 0.15, 0.022); air(s, 0.2, 0.06, 0.06); }
    if (w.chain) { s.tone(1800, 0.08, 'square', 0.02, 0.05, -900); s.noise(0.08, 0.08, 4000, { type: 'highpass', when: 0.06 }); }
  };

  Object.assign(SOUNDS, {
    swing(w) { const k = heldKind(w); loud(this, GAIN[k] || 5, function () { (SWING[k] || SWING.sword).call(this, w); tail(this, w); }); },
    heavy_swing() { loud(this, GAIN.heavy, SWING.heavy); },
    // The bow: a creak as you draw, the twang of the string, an arrow whistling away.
    // Enemy archers use the same bow; crossbows, throwing axes and wands sound like themselves.
    shoot(w) {
      const k = w ? heldKind(w) : 'bow';
      if (k === 'crossbow') { knock(this, 6000, 0.02, 0.2, 0, 3); thump(this, 150, 80, 0.12, 0.2, 0.015); knock(this, 900, 0.06, 0.3, 0.015, 2); sweep(this, 0.18, 0.14, 4200, 2500, { q: 5, when: 0.04 }); return; }
      if (k === 'axes') { for (let i = 0; i < 3; i++) sweep(this, 0.07, 0.3, 1100, 2400, { when: i * 0.07, q: 2 }); return; }
      this.tone(170, 0.07, 'sawtooth', 0.02, 0, 70); knock(this, 900, 0.06, 0.08, 0, 6);
      this.tone(240, 0.2, 'triangle', 0.16, 0.06, -40); this.tone(480, 0.12, 'triangle', 0.06, 0.06, -20);
      air(this, 0.04, 0.22, 0.06);
      sweep(this, 0.26, 0.12, 3200, 1700, { q: 6, when: 0.08 });
    },
    magic_cast(w) {
      if (w && w.burn) { thump(this, 160, 70, 0.22, 0.2); sweep(this, 0.4, 0.34, 280, 1700, { q: 1, attack: 0.04 }); crackle(this, 7, 0.05, 0.35, 0.08); return; }
      if (w && w.slow) { [2637, 3520, 4186].forEach((f, i) => ring(this, f, 0.35, 0.035, i * 0.03)); air(this, 0.3, 0.12); tinkle(this, 4, 0.05, 0.2, 0.025); return; }
      old.magic_cast.call(this, w);
    },
    // The dash: a proper whoosh past your ears.
    dodge() { sweep(this, 0.17, 0.42, 380, 2500, { q: 1.5, attack: 0.04 }); sweep(this, 0.2, 0.3, 2500, 500, { q: 1.5, when: 0.12 }); this.noise(0.25, 0.14, 300, { when: 0.02 }); },
    // Tools.
    hoe() { thump(this, 150, 55, 0.12, 0.38); this.noise(0.15, 0.34, 700, { to: 300 }); for (let i = 0; i < 5; i++) knock(this, 900 + R() * 1600, 0.03, 0.09, 0.03 + R() * 0.1, 3); },
    chop() { knock(this, 760, 0.09, 0.62, 0, 3); thump(this, 320, 150, 0.1, 0.32); this.noise(0.04, 0.22, 3200, { type: 'highpass', when: 0.005 }); knock(this, 2400, 0.04, 0.14, 0.05, 6); },
    pick() { this.tone(2600, 0.18, 'triangle', 0.1, 0, -60); this.tone(3900, 0.12, 'sine', 0.045, 0, -80); knock(this, 3500, 0.05, 0.42, 0, 2); for (let i = 0; i < 4; i++) knock(this, 2000 + R() * 3000, 0.025, 0.1, 0.03 + R() * 0.08, 5); },
    rock_break() { this.noise(0.36, 0.46, 1100); thump(this, 150, 50, 0.22, 0.36); for (let i = 0; i < 9; i++) knock(this, 1500 + R() * 4000, 0.03, 0.12, 0.04 + R() * 0.25, 4); },
    weed() { sweep(this, 0.1, 0.32, 1500, 4800, { q: 2 }); knock(this, 5000, 0.02, 0.16, 0.06, 4); knock(this, 4200, 0.02, 0.12, 0.09, 4); },
    water() { this.noise(0.55, 0.16, 1600, { type: 'bandpass', to: 800, attack: 0.05 }); for (let i = 0; i < 8; i++) this.tone(300 + R() * 600, 0.05, 'sine', 0.07, 0.04 + i * (0.04 + R() * 0.04), 500); },
    // Hits land with a crack you can feel.
    hit(f) { thump(this, 230, 70, 0.12, 0.42); knock(this, 1500, 0.05, 0.38, 0, 2); air(this, 0.04, 0.16, 0.005); if (old.armour) old.armour.call(this, f); },
    // Enemies: a clear swish before every blow, and a whistle for every throw.
    foe_swing() { sweep(this, 0.13, 0.36, 800, 3400, { q: 2 }); air(this, 0.06, 0.1, 0.03); },
    throw() { sweep(this, 0.22, 0.34, 600, 2600, { q: 1.6, attack: 0.03 }); air(this, 0.05, 0.1, 0.02); },
    // The Pit's flasks: thrown with a whoosh, they shatter, then burst into fire, ice or thunder.
    flask_throw() { this.tone(1900, 0.06, 'sine', 0.05, 0, 200); sweep(this, 0.2, 0.26, 800, 2600, { q: 1.6, attack: 0.03, when: 0.02 }); },
    glass() { this.noise(0.06, 0.42, 4500, { type: 'highpass' }); for (let i = 0; i < 9; i++) knock(this, 3000 + R() * 5000, 0.03 + R() * 0.04, 0.16, R() * 0.22, 5); tinkle(this, 7, 0.01, 0.3, 0.035); },
    fire() { thump(this, 95, 45, 0.32, 0.3); this.noise(0.55, 0.4, 500, { type: 'bandpass', to: 2000, attack: 0.03 }); crackle(this, 9, 0.05, 0.5, 0.09); },
    frost() { [2637, 3136, 3520, 4186].forEach((f, i) => ring(this, f, 0.45, 0.04, i * 0.035)); this.noise(0.45, 0.16, 6000, { type: 'highpass' }); for (let i = 0; i < 7; i++) knock(this, 3500 + R() * 3500, 0.025, 0.14, 0.02 + R() * 0.3, 7); },
    // Drinking a potion: the cork, a couple of gulps.
    drink() { this.tone(650, 0.05, 'sine', 0.12, 0, 400); knock(this, 1500, 0.03, 0.16, 0, 4); for (let i = 0; i < 2; i++) { thump(this, 230, 150, 0.09, 0.14, 0.14 + i * 0.16); this.noise(0.07, 0.08, 500, { when: 0.14 + i * 0.16 }); } },
  });

  ['shoot', 'dodge', 'hoe', 'chop', 'pick', 'rock_break', 'weed', 'water', 'hit', 'foe_swing', 'throw', 'fire', 'frost', 'glass', 'flask_throw', 'drink', 'magic_cast'].forEach(name => {
    const fn = SOUNDS[name]; SOUNDS[name] = function (arg) { loud(this, GAIN[name], fn, arg); };
  });
  // Walking, riding, eating: louder, so you hear your own feet and your horse's hooves.
  const STEP_GAIN = { grass: 5, wood: 2.4, stone: 4, sand: 3.4, water: 3 }; // about a third of the first boost: present, not loud
  const step = old.step, hoof = old.hoof, eat = old.eat, neigh = old.neigh;
  SOUNDS.step = function (kind) { loud(this, STEP_GAIN[kind] || 12, step, kind); };
  // Hooves: a proper clip-clop, two woody knocks in a range every speaker can play, alternating.
  let clop = 0;
  const hoofFn = function () {
    const hi = (clop++ % 2) === 0, f = hi ? 1350 : 1050;
    knock(this, f, 0.05, 0.5, 0, 5); knock(this, f * 1.6, 0.03, 0.22, 0.004, 6);
    this.noise(0.02, 0.18, 3500, { type: 'highpass' }); thump(this, 220, 120, 0.05, 0.18);
    knock(this, f * 0.9, 0.04, 0.3, 0.07, 5);
  };
  SOUNDS.hoof = function (a) { loud(this, 7, hoofFn, a); };
  // Eating: three crunchy bites just after the menu click, then a swallow.
  const eatFn = function () {
    for (let i = 0; i < 3; i++) { const t = 0.1 + i * 0.16; this.noise(0.07, 0.5, 2600 + R() * 900, { type: 'bandpass', q: 1.4, when: t }); this.noise(0.04, 0.25, 5000, { type: 'highpass', when: t + 0.01 }); thump(this, 180, 110, 0.06, 0.2, t); }
    thump(this, 260, 150, 0.12, 0.22, 0.62); this.noise(0.1, 0.12, 500, { when: 0.62 });
  };
  SOUNDS.eat = function (a) { loud(this, 1.2, eatFn, a); };
  SOUNDS.neigh = function (a) { loud(this, 3, neigh, a); };
  GAIN.drink = 1.9;
  // A soft tick when the mouse moves onto an item, a row or a button in a menu.
  const tickFn = function () { this.tone(2100 + R() * 250, 0.035, 'sine', 0.1, 0, 120); knock(this, 3800, 0.015, 0.08, 0, 4); };
  SOUNDS.hover = function () { loud(this, 5, tickFn); };

  // ---- Spells: each kind of magic bursts out of the staff with its own sound ------------------
  // A low punch you feel, a bright burst you hear, and a tail that trails after the bolt.
  const SPELL = {
    // Fire: ignition, a roar rising, sizzle trailing off.
    fire() {
      thump(this, 130, 55, 0.22, 0.42); this.noise(0.08, 0.3, 900, { type: 'bandpass', q: 1 });
      sweep(this, 0.42, 0.42, 280, 2600, { q: 1.1, attack: 0.03 }); this.noise(0.5, 0.12, 5000, { type: 'highpass', when: 0.08, attack: 0.05 });
      crackle(this, 10, 0.08, 0.5, 0.1);
    },
    // Frost: a crystalline shing gliding upward, chimes, an icy hiss.
    frost() {
      thump(this, 160, 80, 0.14, 0.3); this.tone(1200, 0.22, 'sine', 0.09, 0, 2000); this.tone(1800, 0.2, 'triangle', 0.05, 0.01, 2600);
      [2637, 3136, 3951, 4699].forEach((f, i) => ring(this, f, 0.4, 0.05, 0.05 + i * 0.03));
      this.noise(0.4, 0.2, 6500, { type: 'highpass', attack: 0.02 }); tinkle(this, 6, 0.08, 0.3, 0.035);
    },
    // A witch's hex: an eerie warbling wail sliding down over a deep pulse.
    hex() {
      thump(this, 90, 50, 0.4, 0.34);
      for (const [f, d] of [[720, 0], [760, 0.01]]) this.tone(f, 0.5, 'sawtooth', 0.045, d, -380, undefined, 0.04);
      this.tone(1440, 0.35, 'sine', 0.05, 0.02, -700); this.noise(0.45, 0.16, 1100, { type: 'bandpass', q: 3, attack: 0.2, to: 420 });
      for (let i = 0; i < 5; i++) this.tone(500 + R() * 400, 0.06, 'sine', 0.04, 0.05 + i * 0.07, -150);
    },
    // Anything else magical: a shimmering arcane burst.
    arcane() {
      thump(this, 150, 70, 0.18, 0.32); sweep(this, 0.3, 0.32, 600, 4200, { q: 1.4, attack: 0.02 });
      [1568, 2093, 2637].forEach((f, i) => ring(this, f, 0.35, 0.05, i * 0.04)); this.noise(0.3, 0.12, 7000, { type: 'highpass', when: 0.05 });
    },
  };
  SOUNDS.spell_fire = function () { loud(this, 2.4, SPELL.fire); };
  SOUNDS.spell_frost = function () { loud(this, 2.4, SPELL.frost); };
  SOUNDS.magic = function () { loud(this, 2.4, SPELL.hex); };
  SOUNDS.magic_cast = function (w) { const k = w && w.burn ? 'fire' : w && w.slow ? 'frost' : 'arcane'; loud(this, 2.4, SPELL[k]); };

  // ---- The bow, drinking, the spider's spit, a healer's spell ------------------------------------
  // All built from mid and high frequencies, so they come through on any speaker.
  const BOW = function () {
    this.tone(430, 0.08, 'sawtooth', 0.03, 0, 140); knock(this, 1100, 0.05, 0.12, 0, 8);                      // the draw creaks
    this.tone(330, 0.24, 'sawtooth', 0.07, 0.07, -25); this.tone(660, 0.16, 'triangle', 0.08, 0.07, -30);     // the string thwangs
    sweep(this, 0.06, 0.55, 2500, 6500, { q: 1.5, attack: 0.002, when: 0.07 });                              // thwip
    knock(this, 1700, 0.03, 0.26, 0.07, 5);                                                                   // the arrow leaves the rest
    sweep(this, 0.32, 0.32, 3200, 1300, { q: 2.5, attack: 0.02, when: 0.09 });                               // and whistles away
  };
  const shootPrev = SOUNDS.shoot;
  SOUNDS.shoot = function (w) {
    const k = w ? heldKind(w) : 'bow';
    if (k === 'bow') return loud(this, 2.4, BOW);
    return shootPrev.call(this, w);
  };
  const DRINK = function () {
    this.tone(900, 0.05, 'sine', 0.14, 0, 900); knock(this, 2200, 0.025, 0.22, 0, 3);                        // pop goes the cork
    for (let i = 0; i < 3; i++) {                                                                             // glug, glug, glug
      const t = 0.16 + i * 0.18;
      this.tone(430 + R() * 80, 0.12, 'sine', 0.14, t, -190); this.noise(0.1, 0.22, 900, { type: 'bandpass', q: 2, when: t });
      this.tone(700 + R() * 400, 0.04, 'sine', 0.07, t + 0.05, 400);
    }
    tinkle(this, 5, 0.72, 0.3, 0.03); air(this, 0.25, 0.06, 0.72);                                            // a little sparkle as it works
  };
  SOUNDS.drink = function () { loud(this, 2.2, DRINK); };
  // The spider's web: a wet spit, then the goo.
  const SPIT = function () {
    sweep(this, 0.12, 0.6, 1800, 700, { q: 1.2, attack: 0.004 }); this.tone(520, 0.09, 'sine', 0.12, 0, -260);
    this.noise(0.22, 0.28, 900, { to: 300, when: 0.05 }); for (let i = 0; i < 3; i++) this.tone(400 + R() * 500, 0.05, 'sine', 0.07, 0.08 + i * 0.05, 450);
  };
  SOUNDS.spit = function () { loud(this, 4, SPIT); };
  // A healer's spell: a rising chime, a warm swell, a shimmer.
  const HEAL = function () {
    [1047, 1319, 1568, 2093].forEach((f, i) => ring(this, f, 0.55, 0.06, i * 0.07));
    this.tone(523, 0.7, 'triangle', 0.08, 0, 523, undefined, 0.15);
    this.noise(0.6, 0.14, 6000, { type: 'highpass', attack: 0.2 }); tinkle(this, 6, 0.12, 0.5, 0.035);
  };
  SOUNDS.heal_foe = function () { loud(this, 1.4, HEAL); };

  // ---- Spores, charges and lunges ------------------------------------------------------------
  // A mushroom's spore cloud: a soft poof, a hiss, then the pool bubbling as it spreads.
  const SPORES = function () {
    sweep(this, 0.3, 0.5, 500, 1800, { q: 1, attack: 0.02 }); this.noise(0.5, 0.16, 5000, { type: 'highpass', attack: 0.08, when: 0.04 });
    for (let i = 0; i < 7; i++) { const t = 0.18 + i * 0.09 + R() * 0.05; this.tone(320 + R() * 380, 0.07, 'sine', 0.09, t, 420); knock(this, 900 + R() * 600, 0.03, 0.08, t, 4); }
  };
  SOUNDS.spores = function () { loud(this, 2.6, SPORES); };
  // A charging enemy: a growling rush, a big whoosh, pounding feet.
  const CHARGE = function () {
    this.tone(260, 0.5, 'sawtooth', 0.05, 0, -90, undefined, 0.05); this.tone(390, 0.4, 'sawtooth', 0.03, 0.02, -120, undefined, 0.05);
    sweep(this, 0.55, 0.5, 300, 2600, { q: 1.3, attack: 0.12 });
    for (let i = 0; i < 4; i++) { knock(this, 700, 0.06, 0.32, 0.1 + i * 0.11, 3); thump(this, 180, 90, 0.08, 0.2, 0.1 + i * 0.11); }
  };
  SOUNDS.charge = function () { loud(this, 2.4, CHARGE); };
  // A lunge: a sharp dash and the scrape of claws.
  const LUNGE = function () {
    sweep(this, 0.22, 0.55, 600, 3600, { q: 1.6, attack: 0.01 }); air(this, 0.1, 0.18, 0.03);
    for (let i = 0; i < 3; i++) knock(this, 2600 + R() * 2200, 0.04, 0.16, 0.08 + i * 0.035, 6);
    thump(this, 200, 100, 0.1, 0.22, 0.02);
  };
  SOUNDS.lunge = function () { loud(this, 2.6, LUNGE); };

  // A goblin's bomb: a sharp crack, a punchy boom you can hear on any speaker, debris pattering down.
  const BOMB = function () {
    this.noise(0.05, 0.6, 3000, { type: 'highpass' }); knock(this, 900, 0.12, 0.6, 0, 1.2);
    thump(this, 170, 60, 0.3, 0.42); this.noise(0.5, 0.4, 1400, { to: 300, attack: 0.005 });
    sweep(this, 0.4, 0.22, 2000, 600, { q: 0.8, when: 0.04 });
    for (let i = 0; i < 10; i++) knock(this, 1500 + R() * 4000, 0.03, 0.12, 0.12 + R() * 0.45, 4);
  };
  SOUNDS.bomb_blast = function () { loud(this, 2.6, BOMB); };

  // Flasks get their throw and their shatter.
  const usePotion = Arena.usePotion.bind(Arena);
  Arena.usePotion = function (slot) { if (slot && /_flask$/.test(slot.id)) Sfx.play('flask_throw'); return usePotion(slot); };
  const explode = Arena.explode.bind(Arena);
  Arena.explode = function (s) { if (s && s.kind === 'flask') Sfx.play('glass'); return explode(s); };

  // Menus: the first small thing under the mouse each frame (a slot, a row, a button) is remembered;
  // when it changes while a menu is open, a soft tick plays.
  const hit = UI.hit.bind(UI);
  // An empty inventory or chest slot counts as hovered, but quietly: no tick for nothing.
  UI.hit = function (x, y, w, h) { const r = hit(x, y, w, h); if (r && this.hoverKey === null && w <= 320 && h <= 40) this.hoverKey = this.emptySlots && this.emptySlots.has(x + ',' + y) ? 'empty' : x + ',' + y + ',' + w; return r; };
  const ds = drawSlot;
  drawSlot = function (g, x, y, slot, on) { if (!slot && UI.emptySlots) UI.emptySlots.add(x + ',' + y); return ds(g, x, y, slot, on); };
  const draw = UI.draw.bind(UI);
  UI.draw = function (g) {
    this.hoverKey = null; this.emptySlots = new Set();
    draw(g);
    const now = this.stack.length && !this.mouseIdle ? this.hoverKey : null;
    if (now !== this.hoverLast) { if (now && now !== 'empty') Sfx.play('hover'); this.hoverLast = now; }
  };

  // Sound effects run through a limiter too, so a crowded fight is loud but never crackles.
  const unlock = Sfx.unlock.bind(Sfx);
  Sfx.unlock = function () {
    unlock();
    if (!this.ctx || !this.sfxBus || this.sfxLimiter) return;
    const c = this.ctx, lim = c.createDynamicsCompressor();
    [['threshold', -6], ['knee', 4], ['ratio', 14], ['attack', 0.002], ['release', 0.15]].forEach(([k, v]) => { lim[k].value = v; });
    this.sfxBus.disconnect(); this.sfxBus.connect(lim); lim.connect(this.master); this.sfxLimiter = lim;
  };
  if (Sfx.ctx && Sfx.sfxBus && !Sfx.sfxLimiter) Sfx.unlock();
  Sfx.SFX_OLD = old; Sfx.weaponSound = heldKind;
})();
