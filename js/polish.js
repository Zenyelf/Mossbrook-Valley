'use strict';
// Small finishing touches:
//  - A mushroom's spore pool spreads, bubbles and fades instead of just appearing.
//  - Ranged shots carry the look of the token set in the weapon: flames, frost, venom, sparks...
//  - Arrow fletching takes the token's colour, or a plain steel blue.

// ---- The spore pool ---------------------------------------------------------------------------
(() => {
  const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  const drawPool = (g, h) => {
    const t0 = h.t0 || (h.t0 = Math.max(h.t, 0.01)), age = t0 - h.t, now = performance.now() / 1000;
    const grow = ease(age / 0.4), fade = Math.min(1, h.t / 0.8), r = h.r * (0.25 + 0.75 * grow) * (0.8 + 0.2 * fade), x = Math.round(h.x), y = Math.round(h.y);
    // A soft glow, the pool with a wobbling edge, a darker heart.
    g.fillStyle = `rgba(160,220,100,${0.16 * fade})`; g.beginPath(); g.ellipse(x, y, r + 5, (r + 5) * 0.6, 0, 0, 6.29); g.fill();
    g.fillStyle = `rgba(120,190,70,${0.38 * fade})`; g.beginPath();
    for (let i = 0; i <= 24; i++) { const a = i / 24 * 6.283, w = 1 + Math.sin(a * 5 + now * 3 + h.x) * 0.06; const px = x + Math.cos(a) * r * w, py = y + Math.sin(a) * r * 0.6 * w; i ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.fill();
    g.fillStyle = `rgba(80,140,50,${0.32 * fade})`; g.beginPath(); g.ellipse(x, y, r * 0.55, r * 0.33, 0, 0, 6.29); g.fill();
    // Bubbles rise and pop all over it.
    for (let i = 0; i < 8; i++) {
      const seed = (h.x * 13.1 + h.y * 7.7 + i * 91.3) % 1000, ph = (now * (0.7 + (seed % 7) / 10) + seed / 97) % 1;
      const ang = seed * 0.37, dist = ((seed * 0.61) % 1) * r * 0.8, bx = x + Math.cos(ang) * dist, by = y + Math.sin(ang) * dist * 0.6;
      if (ph < 0.8) { const br = 0.8 + ph * 2.4; g.fillStyle = `rgba(190,240,130,${0.7 * fade})`; g.beginPath(); g.arc(bx, by - ph * 2, br, 0, 6.29); g.fill(); g.fillStyle = `rgba(255,255,255,${0.6 * fade})`; g.fillRect(Math.round(bx - br * 0.4), Math.round(by - ph * 2 - br * 0.5), 1, 1); }
      else { g.strokeStyle = `rgba(210,250,160,${(1 - ph) * 4 * fade})`; g.lineWidth = 1; g.beginPath(); g.arc(bx, by - 2, 3 + (ph - 0.8) * 10, 0, 6.29); g.stroke(); }
    }
    // A ring that runs outward as it first spreads.
    if (age < 0.5) { g.strokeStyle = `rgba(200,250,140,${(1 - age / 0.5) * 0.8})`; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, h.r * (0.4 + age * 1.6), h.r * (0.4 + age * 1.6) * 0.6, 0, 0, 6.29); g.stroke(); }
  };
  const draw = Foes.drawHazards.bind(Foes);
  Foes.drawHazards = function (g) {
    const all = this.hazards, pools = all.filter(h => h.kind === 'spore');
    if (!pools.length) return draw(g);
    this.hazards = all.filter(h => h.kind !== 'spore');
    try { draw(g); } finally { this.hazards = all; }
    pools.forEach(h => drawPool(g, h));
  };
  // Spores drift up off any pool.
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) {
    tick(dt);
    if (!Foes.hazards) return;
    for (const h of Foes.hazards) if (h.kind === 'spore' && Math.random() < 0.35) {
      const a = Math.random() * 6.28, d = Math.random() * h.r * 0.8;
      VFX.emit('spore', h.x + Math.cos(a) * d, h.y + Math.sin(a) * d * 0.6, { vy: -12 - Math.random() * 10, vx: (Math.random() - 0.5) * 6, t: 1.2 });
    }
  };
})();

// ---- Tokens on ranged weapons -----------------------------------------------------------------
(() => {
  // What each token adds to a shot in flight: a glow, and a trail.
  const LOOK = {
    token_ember: { glow: '255,140,50', trail: (s) => { VFX.emit('flame', s.x, s.y, { vx: -s.vx * 0.08 + (Math.random() - 0.5) * 16, vy: -s.vy * 0.08 - 12 }); if (Math.random() < 0.3) VFX.emit('smoke', s.x, s.y); } },
    token_frost: { glow: '160,215,255', trail: (s) => VFX.emit('flake', s.x + (Math.random() - 0.5) * 5, s.y + (Math.random() - 0.5) * 3, { vx: -s.vx * 0.04, vy: 8, color: '#e8f6ff' }) },
    token_venom: { glow: '140,210,70', trail: (s) => VFX.emit('spore', s.x, s.y + 1, { vx: -s.vx * 0.03, vy: 18, t: 0.6 }) },
    token_storm: { glow: '250,230,110', trail: (s) => VFX.emit('spark', s.x + (Math.random() - 0.5) * 6, s.y + (Math.random() - 0.5) * 6, { vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60, color: '#fff6a0' }), crackle: true },
    token_blood: { glow: '220,60,90', trail: (s) => VFX.emit('blood', s.x, s.y, { vx: -s.vx * 0.05, vy: 12, color: '#d4405a' }) },
    token_moon: { glow: '220,220,255', trail: (s) => VFX.emit('star', s.x + (Math.random() - 0.5) * 6, s.y + (Math.random() - 0.5) * 6, { vx: 0, vy: -6, color: '#e8e8ff', t: 0.5 }) },
    token_gale: { glow: '200,245,215', trail: (s) => VFX.emit('dust', s.x, s.y, { vx: -s.vx * 0.15 + (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20, color: '#e0f8e8', t: 0.35 }), swirl: true },
  };
  // A player's shot learns its token the first moment it flies.
  const tokenOf = s => {
    if (s.tok !== undefined) return s.tok;
    const held = s.mine && Inv.held && Inv.held();
    s.tok = held ? Elem.ofHeld() : null;
    if (s.tok && TOKENS[s.tok]) s.tokCol = TOKENS[s.tok].color;
    return s.tok;
  };
  const trail = VFX.trail.bind(VFX);
  VFX.trail = function (s, dt) {
    trail(s, dt);
    const tok = s.mine && tokenOf(s), L = tok && LOOK[tok];
    if (!L) return;
    s.tokT = (s.tokT || 0) - dt;
    if (s.tokT > 0) return;
    s.tokT = 0.025; L.trail(s);
  };
  const shot = VFX.shot.bind(VFX);
  VFX.shot = function (g, s) {
    const tok = s.mine && tokenOf(s), L = tok && LOOK[tok];
    if (L) {
      const x = Math.round(s.x), y = Math.round(s.y), now = performance.now() / 1000, pulse = 0.75 + Math.sin(now * 14 + s.x * 0.1) * 0.25;
      const big = s.kind === 'fireball' || s.kind === 'frost', rad = big ? 16 : 9;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, `rgba(${L.glow},${(big ? 0.75 : 0.55) * pulse})`); gr.addColorStop(1, `rgba(${L.glow},0)`);
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 6.29); g.fill();
      if (L.crackle && Math.random() < 0.6) { g.strokeStyle = 'rgba(255,250,190,0.9)'; g.lineWidth = 1; g.beginPath(); let px = x, py = y; g.moveTo(px, py); for (let i = 0; i < 3; i++) { px += (Math.random() - 0.5) * 9; py += (Math.random() - 0.5) * 9; g.lineTo(px, py); } g.stroke(); }
      if (L.swirl) { const a = Math.atan2(s.vy || 0.01, s.vx || 0.01); g.strokeStyle = 'rgba(230,250,240,0.6)'; g.lineWidth = 1; for (let k = 0; k < 2; k++) { g.beginPath(); g.arc(x - Math.cos(a) * (8 + k * 6), y - Math.sin(a) * (8 + k * 6), 3 + k, now * 10 + k * 3, now * 10 + k * 3 + 3.5); g.stroke(); } }
    }
    shot(g, s);
  };
  Sfx.TOKEN_LOOK = LOOK;
})();

// ---- A goblin's bomb going off ---------------------------------------------------------------
const Bomb = {
  scorches: [],
  blast(x, y, r) {
    VFX.burst('flame', x, y - 4, 24, 110); VFX.burst('spark', x, y - 6, 16, 150); VFX.burst('smoke', x, y - 6, 16, 45); VFX.burst('dust', x, y, 16, 90);
    this.scorches.push({ x, y, r: r * 0.75, t: 6, flash: 0.14, seed: Math.random() * 10 });
    if (VFX.shake && Math.hypot(Player.x - x, Player.y - y) < 160) VFX.shake(0.22, 3);
  },
  draw(g) {
    for (const s of this.scorches) {
      const a = Math.min(1, s.t / 2), x = Math.round(s.x), y = Math.round(s.y);
      g.fillStyle = `rgba(40,26,18,${0.45 * a})`; g.beginPath(); g.ellipse(x, y, s.r, s.r * 0.55, 0, 0, 6.29); g.fill();
      g.fillStyle = `rgba(20,14,10,${0.5 * a})`; g.beginPath(); g.ellipse(x, y, s.r * 0.5, s.r * 0.28, 0, 0, 6.29); g.fill();
      g.strokeStyle = `rgba(20,14,10,${0.55 * a})`; g.lineWidth = 1;
      for (let i = 0; i < 6; i++) { const an = s.seed + i * 1.05; g.beginPath(); g.moveTo(x + Math.cos(an) * s.r * 0.4, y + Math.sin(an) * s.r * 0.22); g.lineTo(x + Math.cos(an) * s.r * 1.1, y + Math.sin(an) * s.r * 0.62); g.stroke(); }
      if (s.flash > 0) { g.fillStyle = `rgba(255,240,180,${s.flash / 0.14 * 0.85})`; g.beginPath(); g.arc(x, y - 4, s.r * 1.3, 0, 6.29); g.fill(); }
    }
  },
  tick(dt) { for (const s of this.scorches) { s.t -= dt; s.flash = Math.max(0, s.flash - dt); } this.scorches = this.scorches.filter(s => s.t > 0); },
};
(() => {
  const draw = Foes.drawHazards.bind(Foes);
  Foes.drawHazards = function (g) { Bomb.draw(g); draw(g); };
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) { tick(dt); Bomb.tick(dt || 1 / 60); };
  const enter = Foes.enter.bind(Foes);
  Foes.enter = function (m) { if (this.mapId !== m.id) Bomb.scorches = []; return enter(m); };
})();

// ---- Melee weapons with a token: the element flies off the blade -------------------------------
(() => {
  const R = Math.random;
  const ON_ARC = {
    token_blood: (x, y, a) => { for (let i = 0; i < 2; i++) VFX.emit('blood', x, y, { vx: Math.cos(a) * (60 + R() * 80) + (R() - 0.5) * 40, vy: Math.sin(a) * (60 + R() * 80) - 30 - R() * 40, color: R() < 0.5 ? '#a0101e' : '#d4203a', t: 0.55 }); },
    token_ember: (x, y, a) => { VFX.emit('flame', x, y, { vx: Math.cos(a) * 40, vy: Math.sin(a) * 40 - 20 }); if (R() < 0.4) VFX.emit('spark', x, y, { vx: Math.cos(a) * 90, vy: Math.sin(a) * 90 }); },
    token_frost: (x, y, a) => { VFX.emit('flake', x, y, { vx: Math.cos(a) * 50, vy: Math.sin(a) * 50, color: '#e8f6ff' }); if (R() < 0.4) VFX.emit('spark', x, y, { vx: Math.cos(a) * 70, vy: Math.sin(a) * 70, color: '#cfefff' }); },
    token_venom: (x, y, a) => VFX.emit('spore', x, y, { vx: Math.cos(a) * 40, vy: Math.sin(a) * 40 + 15, t: 0.8 }),
    token_storm: (x, y, a) => VFX.emit('spark', x, y, { vx: Math.cos(a) * 110 + (R() - 0.5) * 60, vy: Math.sin(a) * 110 + (R() - 0.5) * 60, color: '#fff6a0' }),
    token_moon: (x, y, a) => VFX.emit('star', x, y, { vx: Math.cos(a) * 30, vy: Math.sin(a) * 30 - 10, color: '#e8e8ff', t: 0.6 }),
    token_gale: (x, y, a) => VFX.emit('dust', x, y, { vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, color: '#e0f8e8', t: 0.3 }),
  };
  const meleeToken = () => { const held = Inv.held && Inv.held(), it = held && ITEMS[held.id]; return it && it.w && !it.w.ranged ? Elem.ofHeld() : null; };
  const slash = VFX.slash.bind(VFX);
  VFX.slash = function (x, y, a, arc, r, color) {
    slash(x, y, a, arc, r, color);
    if (Math.abs(x - Player.x) > 0.5 || Math.abs(y - (Player.y - 10)) > 0.5) return;
    const tok = meleeToken(), fn = tok && ON_ARC[tok];
    if (!fn) return;
    if (tok === 'token_blood') slash(x, y, a, arc, r + 5, '#7a0f1e');
    if (tok === 'token_storm' && VFX.zap) { const a1 = a - arc / 2, a2 = a + arc / 2; VFX.zap(x + Math.cos(a1) * r, y + Math.sin(a1) * r, x + Math.cos(a2) * r, y + Math.sin(a2) * r, '#fff6a0'); }
    const span = Math.min(arc, 6.28);
    for (let k = 0; k <= 10; k++) { const an = a - span / 2 + span * k / 10, rr = r * (0.55 + R() * 0.5); fn(x + Math.cos(an) * rr, y + Math.sin(an) * rr, an); }
  };
  // On every hit, a bigger burst of it.
  const ON_HIT = {
    token_blood: f => { for (let i = 0; i < 18; i++) VFX.emit('blood', f.x, f.y - 10, { vx: (R() - 0.5) * 160, vy: -40 - R() * 90, color: R() < 0.5 ? '#a0101e' : '#d4203a', t: 0.6 }); },
    token_ember: f => VFX.burst('flame', f.x, f.y - 10, 12, 60),
    token_frost: f => VFX.burst('flake', f.x, f.y - 10, 12, 60),
    token_venom: f => VFX.burst('spore', f.x, f.y - 10, 12, 40),
    token_storm: f => { VFX.burst('spark', f.x, f.y - 10, 12, 110); if (VFX.zap) VFX.zap(f.x, f.y - 40, f.x, f.y - 8, '#fff6a0'); },
    token_moon: f => VFX.burst('star', f.x, f.y - 14, 10, 50),
    token_gale: f => VFX.burst('dust', f.x, f.y - 6, 12, 120),
  };
  const damage = Foes.damage.bind(Foes);
  Foes.damage = function (f, amount, angle, kb, sneak, w) {
    const r = damage(f, amount, angle, kb, sneak, w);
    if (w && !w.ranged && f) { const tok = meleeToken(), fn = tok && ON_HIT[tok]; if (fn) fn(f); }
    return r;
  };
  Sfx.MELEE_LOOK = ON_ARC;
})();

// ---- Seeing people behind things ---------------------------------------------------------------
// Anyone hidden behind a tree, a building or anything else tall shows through as a soft silhouette,
// only where they are covered: gold for you, white for people, red for anything that wants to hurt you.
const XRay = {
  can: null,
  foeSprite(f) {
    const def = f.def, flip = f.dir === DIRS.left, moving = f.state === 'chase' || f.state === 'idle';
    let img;
    if (def.human) img = Art.charFrame('foe_' + f.type, def.look, f.dir, moving ? Math.floor(f.frame) % 4 : 0);
    else if (def.disguise && f.state === 'idle') img = Art.foe(f.type, 2, false);
    else img = Art.foe(f.type, Math.floor(f.frame) % 2, flip);
    const k = def.scale || 1, w = img.width * k, h = img.height * k;
    return { img, x: Math.round(f.x - w / 2), y: Math.round(f.y - h + 2), w, h, feet: f.y };
  },
  // Who might be hidden, with their picture and the colour of their outline.
  who(m) {
    const out = [], ch = (img, x, y, feet, col) => out.push({ img, x, y, w: img.width, h: img.height, feet, col });
    if (Player.map === m) {
      if (Horse.on) out.push({ draw: true, x: Math.round(Player.x) - 26, y: Math.round(Player.y) - 44, w: 52, h: 48, feet: Player.y, col: '#ffe070' });
      else { const p = Player, f = p.swing > 0 ? 1 : p.moving ? Math.floor(p.frameT) % 4 : 0; ch(Armor.frame(p.dir, f), Math.round(p.x) - 9, Math.round(p.y) - 26, p.y, '#ffe070'); }
    }
    for (const p of People.list) if (!p.hidden && p.map === m) ch(Art.charFrame(p.id, p.def.look, p.dir, p.moving ? Math.floor(p.frameT) % 4 : 0), Math.round(p.x) - 9, Math.round(p.y) - 26, p.y, '#ffffff');
    for (const p of Extras.active(m)) ch(Extras.frame(p), Math.round(p.x) - 9, Math.round(p.y) - 26, p.y, '#f0f0f0');
    for (const f of Foes.list) { const s = this.foeSprite(f); out.push(Object.assign(s, { col: Foes.isCalm(f) ? '#ffffff' : '#ff6050' })); }
    return out;
  },
  // The top of a market stand: its awning and posts, without the counter and goods below.
  roofs: new WeakMap(),
  roof(img) {
    let r = this.roofs.get(img);
    if (!r) { const h = img.height - 24; r = Art.mk(img.width, h, g => g.drawImage(img, 0, 0, img.width, h, 0, 0, img.width, h)); this.roofs.set(img, r); }
    return r;
  },
  // Tall things drawn over the world, with where their pictures sit and where their feet are.
  covers(m, cx, cy, W, H) {
    const out = [], season = m.indoor ? 0 : S.season, night = Render.darkness() > 0.3 ? 1 : 0;
    m.objs.forEach(o => {
      const d = OBJDEF[o.type]; if (!d || d.flat) return;
      const s = Render.objSprite(o, season); if (!s || !s.img) return;
      // A counter you reach across (a market stand) hides nobody's face, but its roof and posts can.
      let img = s.img;
      if (d.reach) { if (img.height < 50) return; img = this.roof(img); }
      if (s.x > cx + W || s.x + img.width < cx || s.y > cy + H || s.y + img.height < cy) return;
      out.push({ img, x: s.x, y: s.y, w: img.width, h: img.height, base: (o.y + (d.fh || 1)) * TILE - 1 });
    });
    m.buildings.forEach(b => {
      const img = Art.building(b.type, season, night); if (!img) return;
      const by = (b.y + b.h) * TILE, x = b.x * TILE - (b.type === 'bin' ? 0 : 4), y = by - img.height + (b.type === 'bin' ? 4 : 0);
      out.push({ img, x, y, w: img.width, h: img.height, base: by - 1 });
    });
    return out;
  },
  draw(g, m) {
    const cx = Render.cam.x, cy = Render.cam.y, W = UI.W, H = UI.H;
    const chars = this.who(m).filter(c => c.x + c.w > cx && c.x < cx + W && c.y + c.h > cy && c.y < cy + H);
    if (!chars.length) return;
    const covers = this.covers(m, cx - 40, cy - 40, W + 80, H + 120);
    if (!this.can) { this.can = Art.mk(96, 96, () => {}); this.mask = Art.mk(96, 96, () => {}); }
    const t = this.can.getContext('2d'), mk = this.mask.getContext('2d');
    this.shown = 0;
    for (const c of chars) {
      const over = covers.filter(o => o.base > c.feet && o.x < c.x + c.w && o.x + o.w > c.x && o.y < c.y + c.h && o.y + o.h > c.y);
      if (!over.length) continue;
      const bx = c.x - 2, by = c.y - 2;
      t.setTransform(1, 0, 0, 1, 0, 0); t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, 96, 96);
      t.setTransform(1, 0, 0, 1, -bx, -by);
      if (c.draw) Horse.draw(t); else t.drawImage(c.img, c.x, c.y, c.w, c.h);
      // Everything in front of them, together, is the mask: keep only what it covers, then colour it in.
      mk.setTransform(1, 0, 0, 1, 0, 0); mk.clearRect(0, 0, 96, 96); mk.setTransform(1, 0, 0, 1, -bx, -by);
      for (const o of over) mk.drawImage(o.img, o.x, o.y);
      mk.setTransform(1, 0, 0, 1, 0, 0);
      t.globalCompositeOperation = 'destination-in'; t.drawImage(this.mask, bx, by);
      t.globalCompositeOperation = 'source-atop'; t.fillStyle = c.col; t.fillRect(bx, by, 96, 96);
      t.setTransform(1, 0, 0, 1, 0, 0); t.globalCompositeOperation = 'source-over';
      g.globalAlpha = 0.3; for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) g.drawImage(this.can, bx + ox, by + oy);
      g.globalAlpha = 0.5; g.drawImage(this.can, bx, by);
      g.globalAlpha = 1; this.shown++;
    }
  },
};
(() => {
  // Drawn straight after the world's people and scenery, before shots and effects.
  const drawShots = Foes.drawShots.bind(Foes);
  Foes.drawShots = function (g) { if (Player.map) { try { XRay.draw(g, Player.map); } catch (e) { XRay.err = e.message; } } return drawShots(g); };
})();

// ---- Tokens on ranged weapons, part two: the launch, the shot itself, and the impact ------------
// A token makes the whole shot elemental: a burst as it leaves the bow or staff, a shape of its own in
// flight (a burning head, an ice crystal, venom dripping, crackling lightning, a red mist, orbiting stars,
// spinning wind), and a burst of the element where it lands.
(() => {
  const R = Math.random;
  const LAUNCH = {
    token_ember: (x, y) => { VFX.burst('flame', x, y, 12, 70); VFX.burst('smoke', x, y, 4, 20); },
    token_frost: (x, y) => { VFX.burst('flake', x, y, 12, 60); VFX.ring(x, y, 10, '#bfe8ff', 0.25); },
    token_venom: (x, y) => { VFX.burst('spore', x, y, 12, 45); },
    token_storm: (x, y) => { VFX.burst('spark', x, y, 14, 110); VFX.ring(x, y, 9, '#fff6a0', 0.2); },
    token_blood: (x, y) => { for (let i = 0; i < 10; i++) VFX.emit('blood', x, y, { vx: (R() - 0.5) * 120, vy: -20 - R() * 60, color: '#b01828', t: 0.5 }); },
    token_moon: (x, y) => { VFX.burst('star', x, y, 8, 40); VFX.ring(x, y, 11, '#e8e8ff', 0.3); },
    token_gale: (x, y) => { VFX.burst('dust', x, y, 12, 110); VFX.ring(x, y, 12, '#e0f8e8', 0.25); },
  };
  // Drawn under the shot's own sprite, around its head.
  const BODY = {
    token_ember(g, x, y, a, now) {
      for (let i = 0; i < 5; i++) {
        const back = i * 3 + R() * 2, jx = (R() - 0.5) * 3, jy = (R() - 0.5) * 3 - 1;
        g.fillStyle = i < 2 ? `rgba(255,236,140,${0.9 - i * 0.2})` : `rgba(255,${120 - i * 12},40,${0.75 - i * 0.12})`;
        g.beginPath(); g.arc(x - Math.cos(a) * back + jx, y - Math.sin(a) * back + jy, 3.2 - i * 0.45, 0, 6.29); g.fill();
      }
    },
    token_frost(g, x, y, a, now) {
      const spin = now * 6;
      g.strokeStyle = 'rgba(235,250,255,0.95)'; g.lineWidth = 1;
      for (let k = 0; k < 3; k++) { const an = spin + k * 1.047; g.beginPath(); g.moveTo(x - Math.cos(an) * 5, y - Math.sin(an) * 5); g.lineTo(x + Math.cos(an) * 5, y + Math.sin(an) * 5); g.stroke(); }
      g.fillStyle = 'rgba(190,232,255,0.8)'; g.beginPath(); g.moveTo(x, y - 3); g.lineTo(x + 3, y); g.lineTo(x, y + 3); g.lineTo(x - 3, y); g.closePath(); g.fill();
    },
    token_venom(g, x, y, a, now) {
      for (let i = 0; i < 3; i++) {
        const ph = (now * 2 + i / 3) % 1, back = 3 + i * 4;
        g.fillStyle = `rgba(140,215,70,${0.85 - ph * 0.6})`;
        g.beginPath(); g.arc(x - Math.cos(a) * back, y - Math.sin(a) * back + 2 + ph * 6, 1.5 + (1 - ph), 0, 6.29); g.fill();
      }
      g.fillStyle = 'rgba(160,230,80,0.5)'; g.beginPath(); g.arc(x, y, 3, 0, 6.29); g.fill();
    },
    token_storm(g, x, y, a, now) {
      g.fillStyle = 'rgba(255,255,230,0.95)'; g.beginPath(); g.arc(x, y, 2.4, 0, 6.29); g.fill();
      g.strokeStyle = 'rgba(255,246,160,0.9)'; g.lineWidth = 1;
      for (let k = 0; k < 2; k++) { g.beginPath(); let px = x, py = y; g.moveTo(px, py); for (let i = 0; i < 4; i++) { px += (R() - 0.5) * 10 - Math.cos(a) * 2; py += (R() - 0.5) * 10 - Math.sin(a) * 2; g.lineTo(px, py); } g.stroke(); }
    },
    token_blood(g, x, y, a, now) {
      for (let i = 0; i < 4; i++) { const back = 4 + i * 4; g.fillStyle = `rgba(170,20,35,${0.4 - i * 0.08})`; g.beginPath(); g.arc(x - Math.cos(a) * back + (R() - 0.5) * 2, y - Math.sin(a) * back + (R() - 0.5) * 2, 3.5 - i * 0.4, 0, 6.29); g.fill(); }
      g.fillStyle = 'rgba(212,32,58,0.9)'; g.beginPath(); g.arc(x, y, 1.6, 0, 6.29); g.fill();
    },
    token_moon(g, x, y, a, now) {
      g.fillStyle = 'rgba(232,232,255,0.35)'; g.beginPath(); g.arc(x, y, 6, 0, 6.29); g.fill();
      for (let k = 0; k < 3; k++) {
        const an = now * 7 + k * 2.094, sx = x + Math.cos(an) * 7, sy = y + Math.sin(an) * 4;
        g.fillStyle = '#f4f4ff'; g.fillRect(Math.round(sx), Math.round(sy) - 1, 1, 3); g.fillRect(Math.round(sx) - 1, Math.round(sy), 3, 1);
      }
    },
    token_gale(g, x, y, a, now) {
      g.strokeStyle = 'rgba(230,250,240,0.7)'; g.lineWidth = 1;
      for (let k = 0; k < 3; k++) { const back = 4 + k * 5, len = 6 + k * 2; g.beginPath(); g.moveTo(x - Math.cos(a) * back + Math.sin(a) * (k - 1) * 3, y - Math.sin(a) * back - Math.cos(a) * (k - 1) * 3); g.lineTo(x - Math.cos(a) * (back + len) + Math.sin(a) * (k - 1) * 3, y - Math.sin(a) * (back + len) - Math.cos(a) * (k - 1) * 3); g.stroke(); }
      g.beginPath(); g.arc(x, y, 4, now * 12, now * 12 + 4); g.stroke();
    },
  };
  // Where a shot lands on something.
  const IMPACT = {
    token_ember: (x, y) => VFX.explosion(x, y, 16, 'fire'),
    token_frost: (x, y) => { VFX.explosion(x, y, 16, 'frost'); for (let i = 0; i < 8; i++) VFX.emit('spark', x, y, { vx: (R() - 0.5) * 140, vy: (R() - 0.5) * 140, color: '#e8f8ff' }); },
    token_venom: (x, y) => { VFX.explosion(x, y, 15, 'poison'); for (let i = 0; i < 8; i++) VFX.emit('spore', x, y, { vx: (R() - 0.5) * 80, vy: -20 - R() * 40, t: 0.9 }); },
    token_storm: (x, y) => { VFX.zap(x + (R() - 0.5) * 16, y - 70, x, y, '#fff6a0'); VFX.ring(x, y, 14, '#f7e26b'); VFX.burst('spark', x, y, 14, 110); },
    token_blood: (x, y) => { VFX.ring(x, y, 12, '#b01828', 0.3); for (let i = 0; i < 16; i++) VFX.emit('blood', x, y, { vx: (R() - 0.5) * 150, vy: -30 - R() * 90, color: R() < 0.5 ? '#a0101e' : '#d4203a', t: 0.6 }); },
    token_moon: (x, y) => { VFX.ring(x, y, 16, '#e8e8ff', 0.4); VFX.burst('star', x, y, 12, 60); },
    token_gale: (x, y) => { VFX.ring(x, y, 18, '#e0f8e8', 0.3); VFX.burst('dust', x, y, 14, 140); },
  };
  const tokenNow = () => { const held = Inv.held && Inv.held(), it = held && ITEMS[held.id]; return it && it.w && it.w.ranged ? Elem.ofHeld() : null; };
  // The launch: the first moment a token-carrying shot flies.
  const trail = VFX.trail.bind(VFX);
  VFX.trail = function (s, dt) {
    trail(s, dt);
    if (s.mine && s.tok && !s.launched) { s.launched = true; const f = LAUNCH[s.tok]; if (f) f(s.x, s.y); }
  };
  // In flight: the element's own shape around the head, under the shot itself.
  const shot = VFX.shot.bind(VFX);
  VFX.shot = function (g, s) {
    const f = s.mine && s.tok && BODY[s.tok];
    if (f) f(g, Math.round(s.x), Math.round(s.y), Math.atan2(s.vy || 0.01, s.vx || 0.01), performance.now() / 1000);
    shot(g, s);
  };
  // On impact.
  const damage = Foes.damage.bind(Foes);
  Foes.damage = function (f, amount, angle, kb, sneak, w) {
    const r = damage(f, amount, angle, kb, sneak, w);
    if (w && w.ranged && f) { const tok = tokenNow(), fn = tok && IMPACT[tok]; if (fn) fn(f.x, f.y - 10); }
    return r;
  };
  Sfx.TOKEN_SHOT = { LAUNCH, BODY, IMPACT };
})();

// ---- Leaving the page --------------------------------------------------------------------------
// Closing the tab or the browser saves the game first.
(() => {
  const playing = () => !!(typeof S !== 'undefined' && S && Player.map && !(UI.stack[0] && UI.stack[0].isTitle));
  // Closing the tab or the browser: save quietly. (A page cannot show its own window here, and the
  // browser's own one is not wanted; refreshing gets the game's window instead, see Leave below.)
  window.addEventListener('beforeunload', () => { if (playing()) Game.save(); });
  // If the page goes away without asking (a phone, a crash of the tab), save then too.
  window.addEventListener('pagehide', () => { if (playing()) Game.save(); });
})();

// ---- Market stalls: the roof sits above the seller's head ------------------------------------
// Each stall's picture is cut in two: the awning and sign stay at the top, the posts are stretched,
// and the counter and goods keep their place, so whoever stands behind it shows their face.
(() => {
  const CUT = 20, LIFT = 22, POST = '#6f4c30', POSTL = '#8a6239';
  const raise = img => Art.mk(img.width, img.height + LIFT, g => {
    g.drawImage(img, 0, 0, img.width, CUT, 0, 0, img.width, CUT);
    g.drawImage(img, 0, CUT, img.width, img.height - CUT, 0, CUT + LIFT, img.width, img.height - CUT);
    // Longer posts through the gap, with their outline.
    for (const x of [3, img.width - 6]) { g.fillStyle = '#2a1a10'; g.fillRect(x - 1, CUT, 5, LIFT); g.fillStyle = POST; g.fillRect(x, CUT, 3, LIFT); g.fillStyle = POSTL; g.fillRect(x, CUT, 1, LIFT); }
  });
  for (const k of ['stall', 'curio', 'mkfish', 'mkkite', 'mkfruit']) {
    const draw = Art.STATIC[k];
    if (draw) Art.STATIC[k] = season => raise(draw(season));
  }
})();

// ---- Weapons born with an element look like it, token or not ------------------------------------
// The Pit's Ember Blade and Wand of Embers burn, the Frost Brand and Frost Staff freeze, the Storm Glaive
// crackles, and the Scythe of Ash bleeds, just as if a token of that kind were set in them.
const Elem = {
  ofWeapon(w) { return !w ? null : w.burn ? 'token_ember' : w.slow ? 'token_frost' : w.chain ? 'token_storm' : w.lifesteal ? 'token_blood' : null; },
  ofHeld() { const held = Inv.held && Inv.held(), it = held && ITEMS[held.id]; return held ? (Tokens.of(held.id) || Elem.ofWeapon(it && it.w)) : null; },
};

// ---- Wands: their bolts land with a bigger burst --------------------------------------------------
(() => {
  const explode = Arena.explode.bind(Arena);
  Arena.explode = function (s) {
    const r = explode(s);
    if (s && s.mine && s.w && (s.w.burn || s.w.slow)) {
      const tok = s.tok || Elem.ofWeapon(s.w), f = Sfx.TOKEN_SHOT && Sfx.TOKEN_SHOT.IMPACT[tok];
      if (f) f(s.x, s.y);
      VFX.ring(s.x, s.y, (s.aoe || 30) * 1.25, s.w.burn ? '#ffb060' : '#d8f0ff', 0.45);
      VFX.burst(s.w.burn ? 'flame' : 'flake', s.x, s.y, 26, 110);
      if (s.w.burn) VFX.burst('smoke', s.x, s.y - 4, 10, 35);
    }
    return r;
  };
})();

// ---- Magic that hits you shows on you ----------------------------------------------------------
// A witch's or a shaman's hex wraps you in purple: a burst, rings, and runes circling you for a moment.
// Frost and fire do the same in their own colours.
const MagicHit = {
  t: 0, kind: null,
  LOOK: { hex: ['#c070f0', '#e8b0ff', 'hex'], frost: ['#9ad8ff', '#e8f6ff', 'flake'], fireball: ['#ff8a30', '#ffd070', 'flame'] },
  on(kind) {
    const L = this.LOOK[kind] || this.LOOK.hex, x = Player.x, y = Player.y - 12;
    VFX.burst(L[2], x, y, 26, 70); VFX.ring(x, y, 22, L[0], 0.45); VFX.ring(x, y, 12, L[1], 0.3);
    if (kind !== 'fireball') VFX.burst('spark', x, y, 8, 60);
    this.t = 1.1; this.kind = kind in this.LOOK ? kind : 'hex';
  },
  tick(dt) {
    if (this.t <= 0) return;
    this.t -= dt;
    const L = this.LOOK[this.kind];
    if (Math.random() < 0.7) VFX.emit(L[2], Player.x + (Math.random() - 0.5) * 14, Player.y - 4 - Math.random() * 20, { vy: -22, vx: (Math.random() - 0.5) * 10, t: 0.6 });
  },
  draw(g) {
    if (this.t <= 0 || !Player.map) return;
    const L = this.LOOK[this.kind], now = performance.now() / 1000, a = Math.min(1, this.t / 0.4), px = Math.round(Player.x), py = Math.round(Player.y);
    g.globalAlpha = a;
    for (let i = 0; i < 6; i++) {
      const an = now * 4 + i * 1.047, rx = px + Math.cos(an) * 12, ry = py - 10 + Math.sin(an) * 5;
      g.fillStyle = i % 2 ? L[0] : L[1]; g.fillRect(Math.round(rx) - 1, Math.round(ry) - 1, 3, 3);
      g.fillStyle = '#ffffff'; g.fillRect(Math.round(rx), Math.round(ry), 1, 1);
    }
    g.strokeStyle = L[0]; g.lineWidth = 1; g.beginPath(); g.ellipse(px, py - 1, 11, 4, 0, 0, 6.29); g.stroke();
    g.globalAlpha = 1;
  },
};
(() => {
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) { tick(dt); MagicHit.tick(dt || 1 / 60); };
  const drawShots = Foes.drawShots.bind(Foes);
  Foes.drawShots = function (g) { const r = drawShots(g); MagicHit.draw(g); return r; };
})();

// ---- Melee slashes that look like their element ------------------------------------------------
// Ember burns, Frost splinters into ice, Venom drips, Moonlit is a silver crescent, Gale is blades of wind.
// (Bloodroot and Storm keep the blood and lightning they already have.)
const SlashFX = {
  list: [], foes: [],
  add(tok, x, y, a, arc, r) { if (this.DRAW[tok]) this.list.push({ tok, x, y, a, arc: Math.min(arc, 6.28), r, t: 0.3, max: 0.3, seed: Math.random() * 100 }); },
  onFoe(tok, f) { if (this.FOE[tok]) this.foes.push({ tok, f, t: 0.6, max: 0.6, seed: Math.random() * 100 }); },
  tick(dt) {
    for (const s of this.list) s.t -= dt; this.list = this.list.filter(s => s.t > 0);
    for (const s of this.foes) s.t -= dt; this.foes = this.foes.filter(s => s.t > 0 && s.f && s.f.hp > -999);
  },
  draw(g) {
    const now = performance.now() / 1000;
    for (const s of this.list) { const p = 1 - s.t / s.max; this.DRAW[s.tok](g, s, p, now); }
    for (const s of this.foes) { const p = 1 - s.t / s.max; this.FOE[s.tok](g, s, p, now, Math.round(s.f.x), Math.round(s.f.y)); }
    g.globalAlpha = 1;
  },
  // How much of the arc is drawn so far, and how solid it still is.
  span(s, p) { const reveal = Math.min(1, p / 0.35), fade = p < 0.5 ? 1 : 1 - (p - 0.5) / 0.5; return { a0: s.a - s.arc / 2, a1: s.a - s.arc / 2 + s.arc * reveal, fade }; },
  DRAW: {
    token_ember(g, s, p, now) {
      const { a0, a1, fade } = SlashFX.span(s, p);
      g.globalAlpha = 0.55 * fade; g.strokeStyle = '#ff6a1a'; g.lineWidth = 6; g.beginPath(); g.arc(s.x, s.y, s.r * 0.85, a0, a1); g.stroke();
      g.globalAlpha = 0.8 * fade; g.strokeStyle = '#ffd060'; g.lineWidth = 2; g.beginPath(); g.arc(s.x, s.y, s.r * 0.85, a0, a1); g.stroke();
      // Flame tongues licking outward and upward along the cut.
      for (let k = 0; k <= 12; k++) {
        const an = a0 + (a1 - a0) * k / 12, flick = Math.sin(now * 30 + k * 1.7 + s.seed) * 0.5 + 0.5, len = (5 + flick * 6) * fade;
        const bx = s.x + Math.cos(an) * s.r * 0.85, by = s.y + Math.sin(an) * s.r * 0.85, tx = bx + Math.cos(an) * len * 0.6, ty = by + Math.sin(an) * len * 0.6 - len;
        g.globalAlpha = 0.85 * fade; g.fillStyle = k % 3 ? '#ff8a30' : '#ff5020';
        g.beginPath(); g.moveTo(bx - 2.5, by); g.quadraticCurveTo(bx, by - len * 0.4, tx, ty); g.quadraticCurveTo(bx + 1, by - len * 0.3, bx + 2.5, by); g.closePath(); g.fill();
        g.fillStyle = '#ffe680'; g.beginPath(); g.arc(bx, by - 1, 1.3, 0, 6.29); g.fill();
      }
    },
    token_frost(g, s, p, now) {
      const { a0, a1, fade } = SlashFX.span(s, p), burst = Math.max(0, p - 0.45) * 14;
      g.globalAlpha = 0.7 * fade; g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.beginPath(); g.arc(s.x, s.y, s.r * 0.8, a0, a1); g.stroke();
      // A crescent of ice shards, splintering outward as it fades.
      for (let k = 0; k <= 9; k++) {
        const an = a0 + (a1 - a0) * k / 9, len = 6 + ((k * 7 + s.seed) % 5), rr = s.r * 0.8 + burst;
        const bx = s.x + Math.cos(an) * rr, by = s.y + Math.sin(an) * rr, px = -Math.sin(an), py = Math.cos(an);
        g.globalAlpha = 0.95 * fade; g.fillStyle = '#e8f8ff';
        g.beginPath(); g.moveTo(bx + px * 2, by + py * 2); g.lineTo(bx + Math.cos(an) * len, by + Math.sin(an) * len); g.lineTo(bx - px * 2, by - py * 2); g.closePath(); g.fill();
        g.strokeStyle = '#6ab0e8'; g.lineWidth = 1; g.stroke();
        g.fillStyle = '#ffffff'; g.fillRect(Math.round(bx + Math.cos(an) * len * 0.5), Math.round(by + Math.sin(an) * len * 0.5), 1, 1);
      }
    },
    token_venom(g, s, p, now) {
      const { a0, a1, fade } = SlashFX.span(s, p);
      g.globalAlpha = 0.6 * fade; g.strokeStyle = '#5a9a20'; g.lineWidth = 5; g.beginPath(); g.arc(s.x, s.y, s.r * 0.82, a0, a1); g.stroke();
      g.globalAlpha = 0.85 * fade; g.strokeStyle = '#b8f060'; g.lineWidth = 2; g.beginPath(); g.arc(s.x, s.y, s.r * 0.82, a0, a1); g.stroke();
      // Venom dripping off the cut, and bubbles popping on it.
      for (let k = 0; k <= 8; k++) {
        const an = a0 + (a1 - a0) * k / 8, bx = s.x + Math.cos(an) * s.r * 0.82, by = s.y + Math.sin(an) * s.r * 0.82, drip = p * (6 + (k * 5 + s.seed) % 7);
        g.globalAlpha = 0.85 * fade; g.strokeStyle = '#8ad040'; g.lineWidth = 1; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx, by + drip); g.stroke();
        g.fillStyle = '#9ae050'; g.beginPath(); g.arc(bx, by + drip, 1.6, 0, 6.29); g.fill();
        if ((k + Math.floor(now * 10)) % 3 === 0) { g.strokeStyle = '#d8ff90'; g.beginPath(); g.arc(bx + 2, by - 2, 1.5 + p * 2, 0, 6.29); g.stroke(); }
      }
    },
    token_moon(g, s, p, now) {
      const { a0, a1, fade } = SlashFX.span(s, p);
      // A silver crescent with a soft afterimage.
      for (const [off, al] of [[-0.25, 0.25], [0, 0.9]]) {
        const b0 = a0 + off, b1 = a1 + off;
        g.globalAlpha = al * fade; g.fillStyle = off ? '#a8a8e0' : '#f4f4ff';
        g.beginPath(); g.arc(s.x, s.y, s.r * 0.95, b0, b1); g.arc(s.x + Math.cos(s.a) * 4, s.y + Math.sin(s.a) * 4, s.r * 0.72, b1, b0, true); g.closePath(); g.fill();
      }
      g.globalAlpha = 0.35 * fade; g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.beginPath(); g.arc(s.x, s.y, s.r, a0, a1); g.stroke();
      for (let k = 0; k < 5; k++) {
        const an = a0 + (a1 - a0) * ((k + 0.5) / 5), tw = Math.sin(now * 20 + k * 2) > 0 ? 2 : 1, sx = Math.round(s.x + Math.cos(an) * (s.r + 4)), sy = Math.round(s.y + Math.sin(an) * (s.r + 4));
        g.globalAlpha = fade; g.fillStyle = '#ffffff'; g.fillRect(sx, sy - tw, 1, tw * 2 + 1); g.fillRect(sx - tw, sy, tw * 2 + 1, 1);
      }
    },
    token_gale(g, s, p, now) {
      const { a0, a1, fade } = SlashFX.span(s, p);
      // Blades of wind rushing outward, one inside the other.
      for (let k = 0; k < 3; k++) {
        const rr = s.r * (0.6 + p * 0.7 + k * 0.18);
        g.globalAlpha = (0.75 - k * 0.2) * fade; g.strokeStyle = k ? '#d0f0e0' : '#ffffff'; g.lineWidth = k ? 1 : 2;
        g.beginPath(); g.arc(s.x, s.y, rr, a0 + k * 0.15, a1 - k * 0.1); g.stroke();
      }
      // Leaves caught in the gust.
      for (let k = 0; k < 5; k++) {
        const an = a0 + (a1 - a0) * ((k * 37 + s.seed) % 10) / 10, rr = s.r * (0.7 + p * 1.1), lx = s.x + Math.cos(an) * rr, ly = s.y + Math.sin(an) * rr, spin = now * 15 + k;
        g.globalAlpha = fade; g.fillStyle = k % 2 ? '#7ab04a' : '#a8d070';
        g.save(); g.translate(lx, ly); g.rotate(spin); g.fillRect(-2, -1, 4, 2); g.restore();
      }
    },
  },
  FOE: {
    token_ember(g, s, p, now, x, y) {
      const fade = 1 - p;
      for (let k = 0; k < 7; k++) {
        const ox = (k - 3) * 3, flick = Math.sin(now * 25 + k * 2 + s.seed) * 0.5 + 0.5, h = (8 + flick * 8) * fade;
        g.globalAlpha = 0.8 * fade; g.fillStyle = k % 2 ? '#ff8a30' : '#ff5020';
        g.beginPath(); g.moveTo(x + ox - 3, y - 2); g.quadraticCurveTo(x + ox, y - 2 - h * 0.6, x + ox + (k % 2 ? 1 : -1), y - 2 - h); g.quadraticCurveTo(x + ox + 1, y - 2 - h * 0.5, x + ox + 3, y - 2); g.closePath(); g.fill();
      }
      g.globalAlpha = 0.5 * fade; g.fillStyle = '#ffe680'; g.beginPath(); g.ellipse(x, y - 6, 8, 5, 0, 0, 6.29); g.fill();
    },
    token_frost(g, s, p, now, x, y) {
      const shatter = p > 0.65, f = shatter ? (p - 0.65) / 0.35 : 0;
      for (let k = 0; k < 8; k++) {
        const an = k / 8 * 6.283 + s.seed, rr = 9 + f * 12, bx = x + Math.cos(an) * rr, by = y - 10 + Math.sin(an) * rr * 0.8, len = 7;
        g.globalAlpha = shatter ? 1 - f : 0.85; g.fillStyle = '#e8f8ff'; g.strokeStyle = '#6ab0e8'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(bx - 2, by + 3); g.lineTo(bx, by - len); g.lineTo(bx + 2, by + 3); g.closePath(); g.fill(); g.stroke();
      }
    },
    token_venom(g, s, p, now, x, y) {
      const fade = 1 - p;
      g.globalAlpha = 0.35 * fade; g.fillStyle = '#7ad040'; g.beginPath(); g.ellipse(x, y - 8, 13, 9, 0, 0, 6.29); g.fill();
      for (let k = 0; k < 6; k++) { const ph = (now * 1.5 + k / 6) % 1, an = k * 1.1 + s.seed; g.globalAlpha = (1 - ph) * fade; g.strokeStyle = '#c8f080'; g.lineWidth = 1; g.beginPath(); g.arc(x + Math.cos(an) * 8, y - 8 + Math.sin(an) * 5 - ph * 10, 1 + ph * 2, 0, 6.29); g.stroke(); }
    },
    token_moon(g, s, p, now, x, y) {
      const fade = 1 - p;
      g.globalAlpha = 0.7 * fade; g.fillStyle = '#f4f4ff'; g.beginPath(); g.arc(x, y - 12, 9, 0, 6.29); g.arc(x + 4, y - 14, 8, 6.29, 0, true); g.fill();
      for (let k = 0; k < 4; k++) { const an = now * 6 + k * 1.57, sx = Math.round(x + Math.cos(an) * 12), sy = Math.round(y - 10 + Math.sin(an) * 6); g.globalAlpha = fade; g.fillStyle = '#ffffff'; g.fillRect(sx, sy - 1, 1, 3); g.fillRect(sx - 1, sy, 3, 1); }
    },
    token_gale(g, s, p, now, x, y) {
      const fade = 1 - p;
      g.strokeStyle = '#e0f8e8'; g.lineWidth = 1;
      for (let k = 0; k < 3; k++) { const rr = 7 + k * 4 + p * 6, st = now * (8 + k * 3) + k; g.globalAlpha = (0.8 - k * 0.2) * fade; g.beginPath(); g.ellipse(x, y - 10, rr, rr * 0.55, 0, st, st + 3.6); g.stroke(); }
    },
  },
};
(() => {
  const melee = () => { const held = Inv.held && Inv.held(), it = held && ITEMS[held.id]; return it && it.w && !it.w.ranged ? Elem.ofHeld() : null; };
  const slash = VFX.slash.bind(VFX);
  VFX.slash = function (x, y, a, arc, r, color) {
    slash(x, y, a, arc, r, color);
    if (Math.abs(x - Player.x) > 0.5 || Math.abs(y - (Player.y - 10)) > 0.5) return;
    const tok = melee(); if (tok) SlashFX.add(tok, x, y, a, arc, r);
  };
  const damage = Foes.damage.bind(Foes);
  Foes.damage = function (f, amount, angle, kb, sneak, w) {
    const r = damage(f, amount, angle, kb, sneak, w);
    if (w && !w.ranged && f) { const tok = melee(); if (tok) SlashFX.onFoe(tok, f); }
    return r;
  };
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) { tick(dt); SlashFX.tick(dt || 1 / 60); };
  const drawShots = Foes.drawShots.bind(Foes);
  Foes.drawShots = function (g) { const r = drawShots(g); SlashFX.draw(g); return r; };
  const enter = Foes.enter.bind(Foes);
  Foes.enter = function (m) { if (this.mapId !== m.id) { SlashFX.list = []; SlashFX.foes = []; } return enter(m); };
})();

// ---- Rusk's camp, alive ----------------------------------------------------------------------
// The bandits have lives: some sit round the fire, two spar, an archer practises on a straw target,
// a lookout walks the edge of camp, two trade gossip by the tents, and at night most sleep while one
// keeps the fire. They talk the whole time. Spot you (without a deal) and they drop it all to fight.
Object.assign(OBJDEF, { campdummy: { solid: 1, act: 'read' } });
(() => {
  const { mk, P, outlined, STATIC } = Art;
  STATIC.campdummy = () => outlined(mk(18, 30, g => {
    P(g, '#6f4c30', 8, 16, 2, 14); P(g, '#6f4c30', 4, 27, 10, 3);
    P(g, '#d8c070', 2, 2, 14, 14); P(g, '#c43030', 4, 4, 10, 10); P(g, '#f0ece0', 6, 6, 6, 6); P(g, '#c43030', 8, 8, 2, 2);
    P(g, '#7a5535', 11, 5, 4, 1); P(g, '#7a5535', 3, 9, 4, 1); P(g, '#f0ece0', 15, 5, 1, 1); P(g, '#f0ece0', 2, 9, 1, 1);
  }));
})();
const CampLife = {
  CAMP: { map: 'greywood', fire: [45, 50], dummy: null },
  LINES: {
    fire: ['Pass the rum.', 'Who burned the beans?', 'Tell the one about the tax man again!', 'Ha! HA!', 'My feet hurt.', 'Rusk says no singing. Rusk says a lot.', 'Is it my turn on watch? It is never my turn.', 'This stew has a boot in it.', 'Warm fire, cold night.', 'Mmh. Good rabbit.'],
    spar: ['Ha! Too slow!', 'Lucky!', 'Again!', 'Watch your left.', 'You fight like a farmer.', 'Ow. Fair.'],
    archer: ['Bullseye.', '...Nearly.', 'Wind\'s wrong.', 'Middle of the middle.', 'Who moved the target?'],
    lookout: ['Road\'s quiet.', 'Someone coming? No. A deer.', 'Cold up here.', 'Eyes open, mouth shut.'],
    sleep: ['Zzz...', 'Zzz... mm... rabbit...', 'Zzz...'],
    friend: ['Evening, farmer.', 'Deal\'s a deal. Walk on.', 'Rusk says you\'re all right.', 'Mind the fire.'],
  },
  PAIRS: [
    [['a', 'Heard the Crown\'s men came through Ironback.'], ['b', 'Let \'em come. Trees don\'t pay taxes.'], ['a', 'We\'re not trees, Hob.'], ['b', 'Speak for yourself.']],
    [['a', 'If I had a farm I\'d grow nothing but onions.'], ['b', 'Why onions?'], ['a', 'Nobody steals onions.'], ['b', '...Fair.']],
    [['a', 'Rusk was a soldier, you know.'], ['b', 'Everyone was a soldier once.'], ['a', 'Not me. I was a baker.'], ['b', 'That explains the bread.']],
    [['a', 'Saltmere\'s got crab races now.'], ['b', 'I bet on a crab once.'], ['a', 'And?'], ['b', 'It went sideways.']],
  ],
  roles: new Map(), say: new Map(), arrows: [], t: 0, pairLine: 0, pairT: 0, pair: 0,
  spot(m, tx, ty) { for (let r = 0; r < 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = tx + dx, y = ty + dy; if (!World.solid(m, x, y) && !World.at(m, x, y)) return [x, y]; } return [tx, ty]; },
  night() { return S.time >= 1260 || S.time < 360; },
  assign(m) {
    this.roles.clear();
    const crew = Foes.list.filter(f => f.def.camp).sort((a, b) => (a.spawnIdx - b.spawnIdx) || (a.x - b.x));
    const [fx, fy] = this.CAMP.fire, d = this.CAMP.dummy || [44, 56];
    const SP = {
      fire0: { at: this.spot(m, fx - 2, fy), face: [fx, fy], kind: 'fire' }, fire1: { at: this.spot(m, fx + 2, fy), face: [fx, fy], kind: 'fire' },
      fire2: { at: this.spot(m, fx, fy + 2), face: [fx, fy], kind: 'fire' }, fire3: { at: this.spot(m, fx, fy - 2), face: [fx, fy], kind: 'fire' },
      spar0: { at: this.spot(m, 48, 55), face: [49, 55], kind: 'spar' }, spar1: { at: this.spot(m, 50, 55), face: [48, 55], kind: 'spar' },
      chat0: { at: this.spot(m, 41, 47), face: [42, 47], kind: 'chat', who: 'a' }, chat1: { at: this.spot(m, 43, 47), face: [41, 47], kind: 'chat', who: 'b' },
      archer: { at: this.spot(m, d[0], d[1] - 4), face: d, kind: 'archer' },
      lookout: { route: [this.spot(m, 54, 46), this.spot(m, 56, 41)], kind: 'lookout' },
    };
    const bandits = crew.filter(f => !f.def.ranged), archers = crew.filter(f => f.def.ranged);
    const bOrder = ['fire0', 'spar0', 'spar1', 'fire1', 'chat0', 'chat1', 'fire2', 'fire3'], aOrder = ['archer', 'lookout'];
    bandits.forEach((f, i) => this.roles.set(f, Object.assign({ name: bOrder[i % bOrder.length] }, SP[bOrder[i % bOrder.length]])));
    archers.forEach((f, i) => this.roles.set(f, Object.assign({ name: aOrder[i % aOrder.length] }, SP[aOrder[i % aOrder.length]])));
  },
  bubble(f, text, t = 2.6) { this.say.set(f, { text, t }); },
  near(f, r = 220) { return Math.hypot(f.x - Player.x, f.y - Player.y) < r; },
  update(dt) {
    const m = Player.map;
    if (!m || m.id !== this.CAMP.map) return;
    if (Foes.list.some(f => f.def.camp && !this.roles.has(f))) this.assign(m);
    this.t += dt;
    const night = this.night();
    for (const [f, role] of this.roles) {
      if (!Foes.list.includes(f)) { this.roles.delete(f); continue; }
      // Only while relaxed: not chasing anyone, and not about to.
      if (f.state !== 'idle' || (!Foes.isCalm(f) && f.aware > 0.3)) continue;
      f.wander = 99; f.wx = 0; f.wy = 0;
      const sleeping = night && role.kind !== 'fire' || (night && role.name === 'fire2') || (night && role.name === 'fire3');
      let goal = role.at, face = role.face;
      if (role.route) { role.leg = role.leg || 0; goal = role.route[role.leg]; }
      if (sleeping) { goal = this.spot(m, role.name.endsWith('1') ? 50 : 38, role.name.startsWith('spar') ? 52 : 46); face = null; }
      const gx = goal[0] * TILE + 8, gy = goal[1] * TILE + 12, d = Math.hypot(gx - f.x, gy - f.y);
      if (d > 3) {
        // Follow a real path, worked out again whenever the goal changes or they get stuck.
        const key = goal[0] + ',' + goal[1], ftx = Math.floor(f.x / TILE), fty = Math.floor((f.y - 2) / TILE);
        if (role.pathKey !== key || role.stuck > 1) { role.path = World.path(m, ftx, fty, goal[0], goal[1]) || []; role.pathKey = key; role.stuck = 0; if (!role.path.length) role.giveUp = key; }
        if (role.giveUp === key) continue;
        const wp = role.path[0], wx = wp ? wp[0] * TILE + 8 : gx, wy = wp ? wp[1] * TILE + 12 : gy, dx = wx - f.x, dy = wy - f.y, dd = Math.hypot(dx, dy);
        if (wp && dd < 3) { role.path.shift(); continue; }
        const ox = f.x, oy = f.y, sp = f.def.speed * 0.45 * dt;
        Foes.move(f, dx / (dd || 1) * sp, dy / (dd || 1) * sp); Foes.face(f, dx, dy);
        role.stuck = Math.hypot(f.x - ox, f.y - oy) < sp * 0.3 ? (role.stuck || 0) + dt : 0;
        continue;
      }
      if (role.route) { role.wait = (role.wait || 0) - dt; if (role.wait <= 0) { role.leg = (role.leg + 1) % role.route.length; role.wait = 4; } }
      if (face) Foes.face(f, face[0] * TILE + 8 - f.x, face[1] * TILE + 12 - f.y);
      // What they do once they are there.
      role.cd = (role.cd || 1 + Math.random() * 3) - dt;
      if (role.cd > 0) continue;
      if (sleeping) { role.cd = 4 + Math.random() * 3; this.bubble(f, this.LINES.sleep[Math.floor(Math.random() * 3)], 2.2); continue; }
      if (role.kind === 'spar') {
        role.cd = 0.7 + Math.random() * 0.5;
        const a = Math.atan2(face[1] * TILE + 12 - f.y, face[0] * TILE + 8 - f.x);
        VFX.slash(f.x, f.y - 10, a, 1.2, 14, '#d8dce4');
        if (this.near(f)) Sfx.play('metal');
        if (Math.random() < 0.3) this.bubble(f, this.LINES.spar[Math.floor(Math.random() * this.LINES.spar.length)], 1.6);
      } else if (role.kind === 'archer') {
        role.cd = 2.5 + Math.random() * 2;
        const tx = face[0] * TILE + 8, ty = face[1] * TILE + 2;
        this.arrows.push({ x: f.x, y: f.y - 10, sx: f.x, sy: f.y - 10, tx, ty, t: 0, dur: Math.hypot(tx - f.x, ty - f.y + 10) / 240 });
        if (this.near(f)) Sfx.play('shoot');
        if (Math.random() < 0.35) this.bubble(f, this.LINES.archer[Math.floor(Math.random() * this.LINES.archer.length)], 1.8);
      } else if (role.kind === 'chat') {
        role.cd = 1;
      } else {
        role.cd = 4 + Math.random() * 5;
        const pool = Foes.isCalm(f) && this.near(f, 60) ? this.LINES.friend : this.LINES[role.kind] || this.LINES.fire;
        this.bubble(f, pool[Math.floor(Math.random() * pool.length)], 2.6);
        if (role.kind === 'fire' && Math.random() < 0.3) VFX.burst('flame', this.CAMP.fire[0] * TILE + 8, this.CAMP.fire[1] * TILE + 6, 5, 25);
      }
    }
    // The two by the tents talk to each other, line by line.
    this.pairT -= dt;
    if (this.pairT <= 0) {
      const a = [...this.roles].find(([f, r]) => r.name === 'chat0' && f.state === 'idle'), b = [...this.roles].find(([f, r]) => r.name === 'chat1' && f.state === 'idle');
      if (a && b && !this.night() && Math.hypot(a[0].x - b[0].x, a[0].y - b[0].y) < 48) {
        const talk = this.PAIRS[this.pair % this.PAIRS.length], [who, line] = talk[this.pairLine];
        this.bubble(who === 'a' ? a[0] : b[0], line, 3);
        this.pairLine++; if (this.pairLine >= talk.length) { this.pairLine = 0; this.pair++; this.pairT = 6; } else this.pairT = 3.2;
      } else this.pairT = 1;
    }
    for (const [f, s] of this.say) { s.t -= dt; if (s.t <= 0 || !Foes.list.includes(f) || f.state !== 'idle') this.say.delete(f); }
    for (const a of this.arrows) a.t += dt;
    this.arrows = this.arrows.filter(a => a.t < a.dur + 2.5);
  },
  draw(g) {
    const m = Player.map;
    if (!m || m.id !== this.CAMP.map) return;
    // Practice arrows: in flight, then stuck in the target for a while.
    for (const a of this.arrows) {
      const p = Math.min(1, a.t / a.dur), x = a.sx + (a.tx - a.sx) * p, y = a.sy + (a.ty - a.sy) * p - Math.sin(p * Math.PI) * 6, an = Math.atan2(a.ty - a.sy, a.tx - a.sx);
      g.strokeStyle = '#7a5535'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(an) * 8, y - Math.sin(an) * 8); g.stroke();
      g.fillStyle = '#d8dce4'; g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
    }
    // Speech bubbles.
    for (const [f, s] of this.say) {
      if (Math.hypot(f.x - Player.x, f.y - Player.y) > 170) continue;
      const tw = Font.width(s.text), bx = Math.round(Math.max(Render.cam.x + 4, Math.min(f.x - tw / 2, Render.cam.x + UI.W - tw - 8))), by = Math.round(f.y - 44);
      g.globalAlpha = Math.min(1, s.t * 3);
      g.fillStyle = 'rgba(255,250,235,0.92)'; g.fillRect(bx - 3, by - 2, tw + 6, 11);
      g.fillStyle = '#2a1a10'; g.fillRect(bx - 3, by + 9, tw + 6, 1); g.fillRect(Math.round(f.x), by + 9, 2, 3);
      Font.draw(g, s.text, bx, by, '#2a1a10');
      g.globalAlpha = 1;
    }
  },
};
(() => {
  // The straw target the archer shoots at.
  const build = World.build.bind(World);
  World.build = function () {
    build();
    const m = this.maps.greywood; if (!m) return;
    const [x, y] = CampLife.spot(m, 44, 56); this.add(m, 'campdummy', x, y, { text: 'A straw target, bristling with arrows. Most of them are near the middle. Most.' });
    CampLife.CAMP.dummy = [x, y];
  };
  const update = Foes.update.bind(Foes);
  Foes.update = function (dt) { update(dt); try { CampLife.update(dt || 1 / 60); } catch (e) { CampLife.err = e.message; } };
  const drawShots = Foes.drawShots.bind(Foes);
  Foes.drawShots = function (g) { const r = drawShots(g); CampLife.draw(g); return r; };
  const enter = Foes.enter.bind(Foes);
  Foes.enter = function (m) { if (this.mapId !== m.id) { CampLife.roles.clear(); CampLife.say.clear(); CampLife.arrows = []; } return enter(m); };
})();

// ---- Leaving: the game's own window, not the browser's ------------------------------------------
// Refreshing (F5, Ctrl+R, Cmd+R) opens a window in the game's own style. The game is saved as it opens.
// Closing the tab or the browser cannot show a page's own window (browsers do not allow it), so it simply
// saves, quietly, and lets you go: nothing is lost either way.
const Leave = {
  playing() { return !!(typeof S !== 'undefined' && S && Player.map && !(UI.stack[0] && UI.stack[0].isTitle)); },
  clock(t) { const h24 = Math.floor(t / 60) % 24, mm = String(t % 60).padStart(2, '0'), h = h24 % 12 || 12; return `${h}:${mm} ${h24 < 12 ? 'am' : 'pm'}`; },
  ui() {
    const saved = Game.save(), ui = UI;
    let sel = 0;
    const choose = i => { if (i === 1) { Leave.going = true; location.reload(); } else { Sfx.play('close'); ui.pop(); } };
    Sfx.play('open');
    return {
      leaving: true,
      update() {
        if (Input.hit('cancel') || Input.hit('menu')) return choose(0);
        if (Input.hit('left') || Input.hit('up')) { sel = 0; Sfx.play('click'); }
        if (Input.hit('right') || Input.hit('down')) { sel = 1; Sfx.play('click'); }
        if (Input.hit('confirm')) choose(sel);
      },
      draw(g) {
        const W = 300, H = 150, x = Math.round((ui.W - W) / 2), y = Math.round((ui.H - H) / 2);
        g.fillStyle = 'rgba(20,14,10,0.6)'; g.fillRect(0, 0, ui.W, ui.H);
        panel(g, x, y, W, H);
        Font.center(g, 'Leave Mossbrook?', x + W / 2, y + 12, C.ink, 2);
        // You, waving goodbye, on a little patch of the valley.
        g.fillStyle = '#7ab04a'; g.fillRect(x + 22, y + 92, 48, 8); g.fillStyle = '#5a9036'; g.fillRect(x + 22, y + 99, 48, 2);
        const t = performance.now() / 1000, img = Armor.frame(DIRS.down, Math.floor(t * 3) % 2 ? 0 : 2);
        g.drawImage(img, x + 28, y + 40, img.width * 2, img.height * 2);
        g.fillStyle = '#e8c766'; g.fillRect(x + 62 + Math.round(Math.sin(t * 6) * 2), y + 50, 3, 3);
        const lines = [
          [saved ? 'Your journey has been saved.' : 'The game could not be saved!', saved ? '#3a7a2a' : C.bad],
          [`Day ${S.day} of ${SEASONS[S.season]}, year ${S.year}.`, C.ink],
          [`It is ${Leave.clock(S.time)} in ${Player.map.name}.`, C.soft],
          [`You carry ${S.gold} gold.`, C.soft],
        ];
        lines.forEach(([txt, col], i) => Font.draw(g, txt, x + 90, y + 42 + i * 12, col));
        const bw = 120, by = y + H - 30;
        [['Stay in the valley', x + 30], ['Leave for now', x + W - 30 - bw]].forEach(([label, bx], i) => {
          if (ui.hit(bx, by, bw, 18) && Input.mouse.moved) sel = i;
          inset(g, bx, by, bw, 18, sel === i);
          Font.center(g, label, bx + bw / 2, by + 5, C.ink);
          if (ui.click(bx, by, bw, 18)) choose(i);
        });
      },
    };
  },
};
(() => {
  // Catch the refresh keys before the game or the browser sees them.
  addEventListener('keydown', e => {
    const reload = e.code === 'F5' || ((e.ctrlKey || e.metaKey) && e.code === 'KeyR');
    if (!reload || Leave.going || !Leave.playing()) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (!UI.stack.some(u => u.leaving)) UI.push(Leave.ui());
  }, true);
})();

// ---- Standing still means standing still -----------------------------------------------------------
// An idle enemy only plays its walk when it actually moves; human foes standing about stop marching in place.
(() => {
  const last = new WeakMap();
  const update = Foes.update.bind(Foes);
  Foes.update = function (dt) {
    for (const f of this.list) last.set(f, [f.x, f.y]);
    update(dt);
    for (const f of this.list) {
      const p = last.get(f); if (!p) continue;
      if (f.def.human && Math.abs(f.x - p[0]) + Math.abs(f.y - p[1]) < 0.05) f.frame = 0;
    }
  };
})();

// ---- Tracking someone from the People tab --------------------------------------------------------------
// Pick a person and follow the arrow: over their head if they are here, or at the way out that leads to them.
const Track = {
  // The first exit to take from one map towards another, walking map to map through doors and paths.
  route(from, to) {
    if (from === to) return { steps: [] };
    const seen = new Set([from]), q = [[from, null, [from]]];
    while (q.length) {
      const [id, first, trail] = q.shift(), m = World.maps[id];
      if (!m) continue;
      for (const w of m.warps) {
        if (!w.to || seen.has(w.to) || !World.maps[w.to]) continue;
        seen.add(w.to);
        const step = first || w, path = trail.concat(w.to);
        if (w.to === to) return { warp: step, steps: path };
        q.push([w.to, step, path]);
      }
    }
    return null;
  },
  target() {
    const id = S && S.track, d = id && NPCS[id];
    if (!d) return null;
    const p = People.get(id);
    if (!p || !p.map || People.absent(p)) return { name: d.name, lost: true };
    const here = Player.map, there = p.map;
    if (there === here && !p.hidden) return { name: d.name, x: p.x, y: p.y - 30, where: here.name, here: true };
    const r = this.route(here.id, there.id);
    if (!r || !r.warp) return { name: d.name, where: there.name, away: p.hidden && there === here, far: !r };
    const w = r.warp;
    return { name: d.name, where: there.name, x: w.x * TILE + 8, y: w.y * TILE + 2, via: World.maps[w.to] ? World.maps[w.to].name : '', home: p.hidden };
  },
  // Above their head (or the doorway), a bouncing gold arrow.
  drawWorld(g) {
    const t = this.target(); if (!t || t.x === undefined) return;
    const b = Math.round(Math.sin(performance.now() / 180) * 3), x = Math.round(t.x), y = Math.round(t.y) + b;
    g.fillStyle = '#2a1a10'; g.beginPath(); g.moveTo(x - 6, y - 9); g.lineTo(x + 6, y - 9); g.lineTo(x, y); g.closePath(); g.fill();
    g.fillStyle = '#ffe070'; g.beginPath(); g.moveTo(x - 4, y - 8); g.lineTo(x + 4, y - 8); g.lineTo(x, y - 2); g.closePath(); g.fill();
    g.fillRect(x - 1, y - 14, 3, 6);
  },
  // On screen: who you are tracking and where, and an arrow at the edge when they are out of sight.
  drawHud(g) {
    const t = this.target(); if (!t) return;
    const msg = t.lost ? `${t.name}: can't be found now` : t.here ? `${t.name}: right here` : t.far ? `${t.name}: ${t.where} (no road from here)` : t.away ? `${t.name}: indoors here` : `${t.name}: ${t.where}${t.home ? ', indoors' : ''}${t.via && t.via !== t.where ? ' (via ' + t.via + ')' : ''}`;
    const w = Font.width(msg) + 10, x = Math.round((UI.W - w) / 2), y = UI.H - 46;
    g.fillStyle = 'rgba(42,26,16,0.85)'; g.fillRect(x, y, w, 12); g.fillStyle = '#ffe070'; g.fillRect(x, y + 11, w, 1);
    Font.draw(g, msg, x + 5, y + 2, '#ffe070');
    if (t.x === undefined) return;
    const sx = t.x - Render.cam.x, sy = t.y - Render.cam.y, m = 14;
    if (sx > m && sx < UI.W - m && sy > m && sy < UI.H - 60) return;
    const cx = UI.W / 2, cy = UI.H / 2, a = Math.atan2(sy - cy, sx - cx);
    // Where the line from the middle of the screen towards them meets the edge.
    const k = Math.min(Math.abs((UI.W / 2 - m) / (Math.cos(a) || 1e-6)), Math.abs((UI.H / 2 - 60) / (Math.sin(a) || 1e-6)));
    const ax = cx + Math.cos(a) * k, ay = cy + Math.sin(a) * k;
    g.save(); g.translate(Math.round(ax), Math.round(ay)); g.rotate(a);
    g.fillStyle = '#2a1a10'; g.beginPath(); g.moveTo(9, 0); g.lineTo(-6, -7); g.lineTo(-6, 7); g.closePath(); g.fill();
    g.fillStyle = '#ffe070'; g.beginPath(); g.moveTo(7, 0); g.lineTo(-4, -5); g.lineTo(-4, 5); g.closePath(); g.fill();
    g.restore();
  },
};
(() => {
  const drawShots = Foes.drawShots.bind(Foes);
  Foes.drawShots = function (g) { const r = drawShots(g); try { Track.drawWorld(g); } catch (e) { Track.err = e.message; } return r; };
  const hud = UI.hud.bind(UI);
  UI.hud = function (g) { hud(g); try { Track.drawHud(g); } catch (e) { Track.err = e.message; } };
  // Found them: within 10 tiles of you, in the open, tracking stops by itself.
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) {
    tick(dt);
    try {
      const t = S && S.track && Track.target();
      if (t && t.here && Math.hypot(t.x - Player.x, t.y + 30 - Player.y) <= 10 * TILE) { S.track = null; toast(`You found ${t.name}.`); Sfx.play('click'); }
    } catch (e) { Track.err = e.message; }
  };
  // A Track button by each person in the People tab.
  const tab = UI.tabPeople.bind(UI);
  UI.tabPeople = function (g, a, m) {
    tab(g, a, m);
    const ids = Object.keys(NPCS).filter(id => !NPCS[id].minor && (!NPCS[id].remote || S.npc[id].talked >= 0)), rowH = 26, vis = Math.floor(a.h / rowH), sc = Math.min(m.scroll, Math.max(0, ids.length - vis));
    ids.slice(sc, sc + vis).forEach((id, i) => {
      const y = a.y + i * rowH, on = S.track === id, bx = a.x + a.w - 46;
      if (this.button(g, on ? 'Stop' : 'Track', bx, y + 4, 42, 14)) { S.track = on ? null : id; Sfx.play('click'); if (!on) toast(`Tracking ${NPCS[id].name}. Follow the gold arrow.`); }
      if (on) { g.fillStyle = '#ffe070'; g.fillRect(a.x - 3, y + 2, 2, 18); }
    });
  };
})();

// ---- Cave bugs -----------------------------------------------------------------------------------
// Ironback Pass and the Deep Mine have no butterflies. A few cockroaches, little spiders and silverfish
// scuttle about on the open floor instead: never on the rock, never in water, never many, and harmless.
// They stop, turn and scurry, and run from your feet.
const CaveBugs = {
  KINDS: { roach: { speed: 26 }, cspider: { speed: 15 }, silverfish: { speed: 36 } },
  is(m) { return !!m && (m.id === 'ironback' || m.id === 'mine'); },
  floor(m, px, py) { const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE); return !World.solid(m, tx, ty) && World.g(m, tx, ty) !== T.W; },
  draw(g, c) {
    const x = Math.round(c.x), y = Math.round(c.y), horiz = Math.abs(Math.cos(c.a)) >= Math.abs(Math.sin(c.a)), s = horiz ? (Math.cos(c.a) >= 0 ? 1 : -1) : (Math.sin(c.a) >= 0 ? 1 : -1);
    const step = c.moving ? Math.floor(c.t * 14) % 2 : 0;
    // Draw in "facing right" space: dx along the body, dy across it.
    const P = (col, dx, dy, w = 1, h = 1) => {
      g.fillStyle = col;
      if (horiz) g.fillRect(s > 0 ? x + dx : x - dx - w + 1, y + dy, w, h);
      else g.fillRect(x + dy, s > 0 ? y + dx : y - dx - w + 1, h, w);
    };
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x - 2, y + 1, 5, 1);
    if (c.kind === 'roach') {
      P('#3a2010', -3, -1, 6, 3); P('#6a3a18', -2, -1, 4, 2); P('#8a5a30', -1, -1, 2, 1); P('#1a0a04', 3, -1, 1, 2);
      P('#5a3418', 4, -2); P('#5a3418', 5, -3); P('#5a3418', 4, 1); P('#5a3418', 5, 2);
      for (const lx of [-2, 0, 2]) { P('#2a1408', lx + (step && lx === 0 ? 1 : 0), -2); P('#2a1408', lx + (!step && lx === 0 ? 1 : 0), 2); }
    } else if (c.kind === 'cspider') {
      P('#1e181c', -2, -1, 3, 3); P('#2e2630', 1, -1, 2, 2); P('#c84040', 2, -1); P('#4a3a44', -2, -1);
      for (const [lx, a] of [[-2, 0], [-1, 1], [1, 0], [2, 1]]) { const o = (step + a) % 2; P('#1e181c', lx, -2 - o); P('#1e181c', lx + (lx < 0 ? -1 : 1), -3 - o); P('#1e181c', lx, 2 + o); P('#1e181c', lx + (lx < 0 ? -1 : 1), 3 + o); }
    } else {
      P('#8a929c', -4, 0, 2, 1); P('#a8b0b8', -2, -1, 4, 2); P('#c8d0d8', 2, -1, 2, 2); P('#e0e6ec', 1, -1); P('#6a727c', -1, 0); P('#6a727c', 1, 0);
      P('#8a929c', -5, -1); P('#8a929c', -6, 0); P('#8a929c', -5, 1); P('#a8b0b8', 4, -2); P('#a8b0b8', 4, 1);
    }
  },
};
(() => {
  const kinds = Critters.kinds.bind(Critters);
  Critters.kinds = function (m) {
    if (!CaveBugs.is(m)) return kinds(m);
    return m.id === 'mine' ? [['roach', 1], ['cspider', 1], ['silverfish', 1]] : [['roach', 2], ['cspider', 1], ['silverfish', 1]];
  };
  const spawn = Critters.spawn.bind(Critters);
  Critters.spawn = function (kind, cam, W, H, edge) {
    if (!CaveBugs.KINDS[kind]) return spawn(kind, cam, W, H, edge);
    const m = Player.map, c = { kind, x: 0, y: 0, vx: 0, vy: 0, t: Math.random() * 10, life: 0, crawl: true, a: Math.random() * Math.PI * 2, pause: Math.random() * 1.5, moving: false };
    // Somewhere on the open floor in view, not right under your feet.
    for (let i = 0; i < 40; i++) {
      const px = cam.x + 12 + Math.random() * (W - 24), py = cam.y + 12 + Math.random() * (H - 24);
      if (!CaveBugs.floor(m, px, py) || Math.hypot(px - Player.x, py - Player.y) < 48) continue;
      c.x = px; c.y = py; c.life = 25 + Math.random() * 30; break;
    }
    return c;
  };
  const update = Critters.update.bind(Critters);
  Critters.update = function (dt) {
    const m = Player.map;
    if (m && this.mapId === m.id) for (const c of this.list) {
      if (!c.crawl) continue;
      const K = CaveBugs.KINDS[c.kind], away = Math.hypot(c.x - Player.x, c.y - Player.y) < 30;
      let sp = K.speed;
      if (away) { c.a = Math.atan2(c.y - Player.y, c.x - Player.x) + (Math.random() - 0.5) * 0.6; c.pause = 0; sp *= 1.8; }
      else if (c.pause > 0) { c.pause -= dt; c.vx = c.vy = 0; c.moving = false; continue; }
      else if (Math.random() < dt * 0.7) { if (Math.random() < 0.5) c.pause = 0.4 + Math.random() * 1.6; else c.a += (Math.random() - 0.5) * 2.2; }
      const nx = c.x + Math.cos(c.a) * sp * dt, ny = c.y + Math.sin(c.a) * sp * dt;
      // Rock, boulders and water turn them back: they only ever walk the floor.
      if (!CaveBugs.floor(m, nx, ny) || !CaveBugs.floor(m, nx + Math.cos(c.a) * 3, ny + Math.sin(c.a) * 3)) { c.a += Math.PI * (0.5 + Math.random()); c.vx = c.vy = 0; c.moving = false; continue; }
      c.vx = Math.cos(c.a) * sp; c.vy = Math.sin(c.a) * sp; c.moving = true;
    }
    update(dt);
    // A last guard: anything that ended up off the floor is gone.
    if (m) this.list = this.list.filter(c => !c.crawl || (c.life > 0 && CaveBugs.floor(m, c.x, c.y)));
  };
  // Drawn among everything else, so rocks and walls in front of them hide them properly.
  const drawWorld = Story.drawWorld.bind(Story);
  Story.drawWorld = function (g, m, items) {
    drawWorld(g, m, items);
    if (!CaveBugs.is(m) || Critters.mapId !== m.id) return;
    for (const c of Critters.list) if (c.crawl) items.push({ y: c.y, draw: () => CaveBugs.draw(g, c) });
  };
})();

// ---- Stomps, slams and quakes ---------------------------------------------------------------------------
// The wind-up lights the ground: the danger area fills, a dashed rim turns, cracks spread as it charges and
// dust lifts at the edge. The blow sends a shockwave out, throws rocks that bounce, puffs dust and smoke,
// and leaves cracks in the ground for a moment. Each attacker has its own colours and its own debris.
const Quake = {
  fx: [], rocks: [], mapId: null,
  THEME: {
    ogre: ['#8a6a4a', '#4a3020', 'dust'], warden: ['#8a8a92', '#4a4a52', 'dust'], kessick: ['#a0a0a8', '#3a3a42', 'spark'],
    vane: ['#5a9ac8', '#2a4a6a', 'water'], king: ['#5a9a3a', '#2a4a1a', 'leaf'], gorehorn: ['#8a4a2a', '#4a2010', 'dust'],
    morrow: ['#7a6a5a', '#3a2a1a', 'dust'], frost: ['#9ad8ff', '#3a7ab0', 'flake'],
  },
  theme(f) { return this.THEME[f && f.type] || ['#8a6a4a', '#4a3020', 'dust']; },
  // A jagged crack from the centre outwards, the same every time for the same seed.
  crack(g, x, y, a, len, seed) {
    const r = mulberry(Math.floor(seed)); let px = x, py = y;
    g.beginPath(); g.moveTo(px, py);
    for (let s = 1; s <= 4; s++) { const d = len * s / 4, w = (r() - 0.5) * 0.7; px = x + Math.cos(a + w) * d; py = y + Math.sin(a + w) * d; g.lineTo(Math.round(px), Math.round(py)); }
    g.stroke();
  },
  tele(g, x, y, r, p, th) {
    const col = th[0], dark = th[1], t = performance.now() / 1000, seed = Math.floor(x * 7 + y * 13);
    p = Math.max(0, Math.min(1, p));
    g.save();
    g.globalAlpha = 0.1 + p * 0.18; g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 6.29); g.fill();
    g.globalAlpha = 0.16 + p * 0.3; g.fillStyle = '#ff5a3a'; g.beginPath(); g.arc(x, y, r * p, 0, 6.29); g.fill();
    g.globalAlpha = 0.55 + 0.35 * Math.sin(t * 14); g.strokeStyle = '#ff8060'; g.lineWidth = 2; g.setLineDash([6, 5]); g.lineDashOffset = -t * 40;
    g.beginPath(); g.arc(x, y, r, 0, 6.29); g.stroke(); g.setLineDash([]);
    g.globalAlpha = 0.4 + p * 0.5; g.strokeStyle = dark; g.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) this.crack(g, x, y, i * 0.698 + (seed % 7) * 0.1, r * (0.15 + p * 0.8), seed + i * 31);
    g.globalAlpha = 0.6 * p; g.fillStyle = '#fff0c0'; g.beginPath(); g.arc(x, y, 3 + p * 4, 0, 6.29); g.fill();
    g.restore();
    if (Math.random() < 0.35) { const a = Math.random() * 6.29; VFX.emit('dust', x + Math.cos(a) * r, y + Math.sin(a) * r, { vy: -14 - Math.random() * 10, vx: 0, t: 0.5, color: col }); }
  },
  hit(x, y, r, th) {
    const col = th[0], dark = th[1], bits = th[2];
    this.fx.push({ type: 'crack', x, y, r, t: 1.8, max: 1.8, seed: Math.random() * 1e4, col: dark });
    this.fx.push({ type: 'shock', x, y, r, t: 0.42, max: 0.42, col });
    this.fx.push({ type: 'shock', x, y, r: r * 0.75, t: 0.6, max: 0.6, col: '#ffffff', delay: 0.07 });
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * 6.29, sp = 40 + Math.random() * 90;
      this.rocks.push({ x: x + Math.cos(a) * 6, y: y + Math.sin(a) * 4, z: 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.7, vz: 70 + Math.random() * 90, col: Math.random() < 0.55 ? col : dark, s: 2 + Math.floor(Math.random() * 2), life: 1.1 + Math.random() * 0.4 });
    }
    for (let i = 0; i < 14; i++) { const a = i * 0.449; VFX.emit('dust', x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85, { vx: Math.cos(a) * 26, vy: Math.sin(a) * 18 - 10, t: 0.7, color: col }); }
    VFX.burst('smoke', x, y - 2, 8, 34);
    if (bits === 'spark') VFX.burst('spark', x, y - 4, 16, 90);
    else if (bits === 'water') for (let i = 0; i < 18; i++) VFX.emit('bubble', x + (Math.random() - 0.5) * r, y + (Math.random() - 0.5) * r * 0.6, { vy: -40 - Math.random() * 30, t: 0.6, color: Math.random() < 0.5 ? '#bfe4ff' : '#ffffff' });
    else if (bits === 'leaf') for (let i = 0; i < 16; i++) VFX.emit('dust', x + (Math.random() - 0.5) * r, y + (Math.random() - 0.5) * r * 0.6, { vy: -30 - Math.random() * 20, vx: (Math.random() - 0.5) * 30, t: 0.9, color: Math.random() < 0.5 ? '#7ab05a' : '#4a8a3a' });
    else if (bits === 'flake') VFX.burst('flake', x, y - 4, 20, 80);
    VFX.flash(0.06, '#fff0d0'); VFX.shake(0.35, 3);
  },
  // A champion's travelling shockwave: a rolling wall of rubble with dust thrown up at the front.
  wave(g, w) {
    const fade = 1 - w.r / w.max, n = Math.max(12, Math.floor(w.r / 3)), x = Math.round(w.x), y = Math.round(w.y);
    g.save();
    g.globalAlpha = 0.18 + fade * 0.25; g.strokeStyle = w.color; g.lineWidth = 9; g.beginPath(); g.arc(x, y, Math.max(1, w.r - 6), 0, 6.29); g.stroke();
    g.globalAlpha = 0.5 + fade * 0.5;
    for (let i = 0; i < n; i++) {
      const a = i * 6.29 / n, j = Math.sin(i * 12.9898 + w.r * 0.3) * 2, rx = x + Math.cos(a) * (w.r + j), ry = y + Math.sin(a) * (w.r + j);
      g.fillStyle = i % 3 ? w.color : '#2a1a10'; g.fillRect(Math.round(rx) - 2, Math.round(ry) - 3, 4, 3);
      g.fillStyle = '#e8d8c0'; g.fillRect(Math.round(rx) - 1, Math.round(ry) - 3, 2, 1);
    }
    g.strokeStyle = '#ffffff'; g.globalAlpha = 0.35 * fade; g.lineWidth = 1; g.beginPath(); g.arc(x, y, w.r + 3, 0, 6.29); g.stroke();
    g.restore();
    if (Math.random() < 0.5) { const a = Math.random() * 6.29; VFX.emit('dust', x + Math.cos(a) * w.r, y + Math.sin(a) * w.r, { vy: -18, vx: Math.cos(a) * 10, t: 0.45, color: w.color }); }
  },
  tick(dt) {
    const m = Player.map; if (m && m.id !== this.mapId) { this.mapId = m.id; this.fx = []; this.rocks = []; }
    for (const e of this.fx) { if (e.delay > 0) e.delay -= dt; else e.t -= dt; }
    this.fx = this.fx.filter(e => e.t > 0);
    for (const k of this.rocks) {
      k.life -= dt; k.x += k.vx * dt; k.y += k.vy * dt; k.vz -= 320 * dt; k.z += k.vz * dt;
      if (k.z < 0) { k.z = 0; k.vz = -k.vz * 0.35; k.vx *= 0.55; k.vy *= 0.55; if (Math.abs(k.vz) < 12) k.vz = 0; }
    }
    this.rocks = this.rocks.filter(k => k.life > 0);
  },
  draw(g, items) {
    for (const e of this.fx) {
      if (e.delay > 0) continue;
      const k = e.t / e.max;
      if (e.type === 'crack') items.push({ y: -1e9, draw: () => {
        g.save(); g.globalAlpha = Math.min(1, k * 1.6) * 0.75; g.strokeStyle = e.col; g.lineWidth = 2;
        for (let i = 0; i < 11; i++) this.crack(g, e.x, e.y, i * 0.571 + (e.seed % 10) * 0.07, e.r * (0.55 + ((e.seed + i * 37) % 10) / 25), e.seed + i * 17);
        g.globalAlpha *= 0.5; g.fillStyle = e.col; g.beginPath(); g.arc(e.x, e.y, 7, 0, 6.29); g.fill(); g.restore();
      } });
      else items.push({ y: -1e9 + 1, draw: () => {
        const rr = e.r * (0.25 + 0.75 * (1 - k));
        g.save(); g.globalAlpha = k * 0.9; g.strokeStyle = e.col; g.lineWidth = 1 + 4 * k; g.beginPath(); g.arc(e.x, e.y, rr, 0, 6.29); g.stroke(); g.restore();
      } });
    }
    for (const r of this.rocks) items.push({ y: r.y, draw: () => {
      const a = Math.min(1, r.life * 2);
      g.globalAlpha = 0.3 * a; g.fillStyle = '#000'; g.fillRect(Math.round(r.x) - 1, Math.round(r.y), r.s + 1, 1);
      g.globalAlpha = a; g.fillStyle = r.col; g.fillRect(Math.round(r.x), Math.round(r.y - r.z) - r.s, r.s, r.s);
      g.fillStyle = '#2a1a10'; g.fillRect(Math.round(r.x), Math.round(r.y - r.z) - 1, r.s, 1); g.globalAlpha = 1;
    } });
  },
};
(() => {
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) { tick(dt); Quake.tick(dt || 1 / 60); };
  const drawWorld = Story.drawWorld.bind(Story);
  Story.drawWorld = function (g, m, items) { drawWorld(g, m, items); if (Quake.fx.length || Quake.rocks.length) Quake.draw(g, items); };
})();

// ---- Weapon cooldown on the hotbar ------------------------------------------------------------------------
// After an attack, every weapon in the hotbar is shaded over, and the shade drains away as the weapon
// readies. Slow weapons show the seconds left. When the one you used is ready, its slot flashes gold.
const CoolBar = {
  max: 0, last: 0, slot: -1, readyT: 0,
  tick(dt) {
    const c = Combat.cool || 0;
    if (c > this.last + 0.01) { this.max = c; this.slot = S.sel; }
    if (this.last > 0 && c <= 0 && this.max > 0.05) this.readyT = 0.4;
    this.last = c; if (this.readyT > 0) this.readyT -= dt;
  },
  weapon(slot) { const it = slot && ITEMS[slot.id]; return !!(it && it.w); },
  draw(g, W, H) {
    const c = Combat.cool || 0, hx = Math.round((W - 216) / 2), hy = H - 28;
    for (let i = 0; i < 10; i++) {
      const slot = S.inv[i]; if (!this.weapon(slot)) continue;
      const x = hx + i * 22, y = hy;
      if (c > 0 && this.max > 0) {
        const frac = Math.min(1, c / this.max), h = Math.max(1, Math.round(18 * frac));
        g.fillStyle = 'rgba(30,18,10,0.6)'; g.fillRect(x + 1, y + 1, 18, h);
        g.fillStyle = 'rgba(255,224,112,0.85)'; g.fillRect(x + 1, y + h, 18, 1);
        if (this.max >= 1 && i === this.slot) { const t = c >= 1 ? c.toFixed(0) : c.toFixed(1); Font.shadow(g, t, x + 10 - Math.floor(Font.width(t) / 2), y + 6, '#ffffff', '#2a1a10'); }
      }
      if (this.readyT > 0 && i === this.slot) {
        const a = Math.min(1, this.readyT / 0.25);
        g.globalAlpha = a; g.fillStyle = '#fff0a0';
        g.fillRect(x - 1, y - 1, 22, 1); g.fillRect(x - 1, y + 20, 22, 1); g.fillRect(x - 1, y - 1, 1, 22); g.fillRect(x + 20, y - 1, 1, 22);
        const s = Math.round((0.4 - this.readyT) * 20);
        g.fillStyle = '#ffffff'; g.fillRect(x + 16, y + 3 - s, 1, 3); g.fillRect(x + 15, y + 4 - s, 3, 1);
        g.globalAlpha = 1;
      }
    }
  },
};
(() => {
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) { tick(dt); CoolBar.tick(dt || 1 / 60); };
  const hud = UI.hud.bind(UI);
  UI.hud = function (g) { hud(g); try { CoolBar.draw(g, UI.W, UI.H); } catch (e) { CoolBar.err = e.message; } };
})();

// ---- Bosses' attacks, drawn in their own style ---------------------------------------------------------
// Sword and claw strikes use the themed slashes (fire for Sir Ashgrave, venom for the King, wind for Vane...),
// and the circles champions mark on the ground show what is coming: flames licking up, a storm's shadow that
// ends in a lightning bolt, a falling rock's growing shadow, crystals pushing up, a swamp-green landing.
const BossFX = {
  SLASH: { ashgrave: 'token_ember', king: 'token_venom', mire: 'token_venom', vane: 'token_gale', glasswing: 'token_gale', rusk: 'token_gale', kessick: 'token_moon', warden: 'token_moon', drowned: 'token_frost' },
  // The player, for hit effects that follow whoever was struck.
  ME: { get x() { return Player.x; }, get y() { return Player.y; }, hp: 1 },
  slash(f, x, y, a, arc, r) {
    const tok = this.SLASH[f && f.type];
    if (!tok || typeof SlashFX === 'undefined' || !SlashFX.DRAW[tok]) return false;
    SlashFX.add(tok, x, y, a, arc, r); return true;
  },
  struck(f) { const tok = this.SLASH[f && f.type]; if (tok && typeof SlashFX !== 'undefined' && SlashFX.FOE[tok]) SlashFX.onFoe(tok, this.ME); },
  MIRE: ['#7aa04a', '#2a4a1a', 'leaf'],
  // A ground mark, according to what it is.
  mark(g, k, p, color) {
    const x = Math.round(k.x), y = Math.round(k.y), r = k.r, t = performance.now() / 1000;
    if (k.kind === 'slam' && typeof Quake !== 'undefined') { Quake.tele(g, x, y, r, p, this.MIRE); return; }
    g.save();
    if (k.kind === 'fire') {
      g.globalAlpha = 0.15 + p * 0.3; g.fillStyle = '#ff6a1a'; g.beginPath(); g.arc(x, y, r, 0, 6.29); g.fill();
      g.globalAlpha = 0.35 + p * 0.4; g.fillStyle = '#ffd060'; g.beginPath(); g.arc(x, y, r * p * 0.7, 0, 6.29); g.fill();
      for (let i = 0; i < 10; i++) {
        const a = i * 0.628 + t * 0.6, fl = Math.sin(t * 22 + i * 2.1) * 0.5 + 0.5, h = (2 + p * 6) * (0.6 + fl * 0.6), bx = x + Math.cos(a) * r, by = y + Math.sin(a) * r * 0.9;
        g.globalAlpha = 0.85; g.fillStyle = i % 2 ? '#ff8a30' : '#ff5020';
        g.beginPath(); g.moveTo(bx - 2, by); g.quadraticCurveTo(bx, by - h * 0.5, bx + Math.sin(t * 9 + i) * 1.5, by - h); g.quadraticCurveTo(bx + 1, by - h * 0.4, bx + 2, by); g.fill();
      }
      if (Math.random() < 0.15) VFX.emit('flame', x + (Math.random() - 0.5) * r, y + (Math.random() - 0.5) * r * 0.8, { vy: -24, t: 0.4 });
    } else if (k.kind === 'thunder') {
      g.globalAlpha = 0.2 + p * 0.35; g.fillStyle = '#2a2a40'; g.beginPath(); g.ellipse(x, y, r * (0.8 + p * 0.3), r * (0.5 + p * 0.2), 0, 0, 6.29); g.fill();
      g.strokeStyle = '#fff6a0'; g.lineWidth = 1; g.globalAlpha = 0.5 + p * 0.5;
      for (let i = 0; i < 3 + Math.floor(p * 4); i++) {
        const a = Math.random() * 6.29; let px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
        g.beginPath(); g.moveTo(px, py);
        for (let s = 0; s < 3; s++) { px += (x - px) * 0.3 + (Math.random() - 0.5) * 6; py += (y - py) * 0.3 + (Math.random() - 0.5) * 6; g.lineTo(px, py); }
        g.stroke();
      }
      g.globalAlpha = p; g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 1, 3, 3);
    } else if (k.kind === 'rock') {
      g.globalAlpha = 0.15 + p * 0.45; g.fillStyle = '#1a1208'; g.beginPath(); g.ellipse(x, y, r * (0.3 + p * 0.7), r * (0.2 + p * 0.45), 0, 0, 6.29); g.fill();
    } else if (k.kind === 'crystal') {
      g.globalAlpha = 0.15 + p * 0.25; g.fillStyle = '#c8a0f0'; g.beginPath(); g.arc(x, y, r, 0, 6.29); g.fill();
      for (let i = 0; i < 5; i++) {
        const a = i * 1.257 + (k.x % 3), cx = x + Math.cos(a) * r * 0.45, cy = y + Math.sin(a) * r * 0.35, h = Math.round(1 + p * 7 * (0.6 + (i % 3) * 0.2));
        g.globalAlpha = 0.9; g.fillStyle = '#9a70d0'; g.beginPath(); g.moveTo(cx - 2, cy); g.lineTo(cx, cy - h); g.lineTo(cx + 2, cy); g.fill();
        g.fillStyle = '#f0e0ff'; g.fillRect(Math.round(cx), Math.round(cy - h + 1), 1, 1);
      }
    }
    g.globalAlpha = 0.85; g.strokeStyle = color; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r, 0, 6.29); g.stroke();
    g.restore();
  },
  // When a mark strikes.
  boom(k) {
    if (k.kind === 'thunder') { VFX.zap(k.x + (Math.random() - 0.5) * 10, k.y - 150, k.x, k.y - 2, '#fff6a0'); VFX.zap(k.x + (Math.random() - 0.5) * 16, k.y - 120, k.x, k.y - 2, '#f7e26b'); VFX.flash(0.05, '#fffbe0'); VFX.burst('spark', k.x, k.y - 2, 10, 70); }
    else if (k.kind === 'rock' && typeof Quake !== 'undefined') { for (let i = 0; i < 6; i++) { const a = Math.random() * 6.29, sp = 30 + Math.random() * 50; Quake.rocks.push({ x: k.x, y: k.y, z: 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.7, vz: 50 + Math.random() * 50, col: i % 2 ? '#8a7a68' : '#5a4a38', s: 2, life: 0.9 }); } }
    else if (k.kind === 'slam' && typeof Quake !== 'undefined') Quake.hit(k.x, k.y, k.r, this.MIRE);
  },
  // A charge lane: arrows run along it so the direction reads at a glance.
  lane(g, x, y, a, len, p, col) {
    const t = performance.now() / 1000;
    g.save(); g.translate(x, y); g.rotate(a);
    g.globalAlpha = 0.5 + p * 0.5; g.strokeStyle = col; g.lineWidth = 2;
    for (let k = 0; k < len; k += 26) {
      const cx = (k + t * 90) % len;
      g.beginPath(); g.moveTo(cx - 4, -5); g.lineTo(cx + 2, 0); g.lineTo(cx - 4, 5); g.stroke();
    }
    g.restore();
  },
};

// ---- Fences that join up --------------------------------------------------------------------------------
// Each fence piece looks at its neighbours: rails run only towards the next piece (or a gate), so a run
// reads as a run, with proper corners, T-joins, ends and lone posts. Posts differ a little from place to
// place (a flat cap, a point, an old weathered one, a knot, a bit of moss), and wear snow in winter.
const Fence = {
  map: null,
  joins(o) { return !!o && (o.type === 'fence' || o.type === 'gate'); },
  mask(m, o) {
    if (!m) return 15;
    return (this.joins(World.at(m, o.x - 1, o.y)) ? 1 : 0) | (this.joins(World.at(m, o.x + 1, o.y)) ? 2 : 0) | (this.joins(World.at(m, o.x, o.y - 1)) ? 4 : 0) | (this.joins(World.at(m, o.x, o.y + 1)) ? 8 : 0);
  },
  look(x, y) { return ((x * 73856093) ^ (y * 19349663)) >>> 0; },
  sprite(mask, v, season) {
    return Art.memo('fence' + mask + '_' + v + '_' + season, () => Art.outlined(Art.mk(16, 18, g => {
      const P = Art.P, wood = '#a07a4c', woodL = '#c9a170', post = v === 2 ? '#8a7050' : '#b08a5a', postL = v === 2 ? '#a08a6a' : '#c9a170', L = mask & 1, R = mask & 2, U = mask & 4, D = mask & 8;
      // Rails running north and south, seen from above: two thin rails either side of the posts.
      if (U) { P(g, wood, 5, 0, 1, 8); P(g, wood, 10, 0, 1, 8); P(g, woodL, 5, 0, 1, 1); P(g, woodL, 10, 0, 1, 1); }
      if (D) { P(g, wood, 5, 10, 1, 8); P(g, wood, 10, 10, 1, 8); }
      // Rails running east and west.
      for (const ry of [6, 11]) {
        if (L) { P(g, wood, 0, ry, 7, 2); P(g, woodL, 0, ry, 7, 1); }
        if (R) { P(g, wood, 9, ry, 7, 2); P(g, woodL, 9, ry, 7, 1); }
      }
      // The post itself.
      const top = v === 1 ? 1 : v === 2 ? 3 : 2;
      P(g, post, 6, top, 4, 17 - top); P(g, postL, 7, top, 1, 17 - top);
      if (v === 0) { P(g, '#8a6239', 5, top, 6, 1); }
      if (v === 1) { P(g, post, 7, 0, 2, 1); }
      if ((v + mask) % 3 === 0) P(g, '#6f4c30', 8, 9, 1, 1); // a knot
      if (v === 2 && season !== 3) { P(g, '#5f8f48', 6, 14, 2, 1); P(g, '#74b84d', 6, 13, 1, 1); } // moss
      if (!L && !R && !U && !D) { P(g, '#8a8a92', 5, 15, 6, 2); P(g, '#a8a8b0', 5, 15, 6, 1); } // a lone post on a stone
      if (season === 3) { P(g, '#f0f6fc', 6, top - 1, 4, 2); for (const ry of [6, 11]) { if (L) P(g, '#f0f6fc', 1, ry - 1, 5, 1); if (R) P(g, '#f0f6fc', 10, ry - 1, 5, 1); } }
    })));
  },
};
(() => {
  const objSprite = Render.objSprite.bind(Render);
  Render.objSprite = function (o, season) {
    if (o.type !== 'fence') return objSprite(o, season);
    const img = Fence.sprite(Fence.mask(Fence.map || Player.map, o), Fence.look(o.x, o.y) % 3, season);
    return { img, x: Math.round((o.x + 0.5) * TILE - img.width / 2), y: (o.y + 1) * TILE - img.height };
  };
  // Fences are drawn for the map being shown.
  const world = Render.world.bind(Render);
  Render.world = function (...a) { Fence.map = Player.map; return world(...a); };
})();
