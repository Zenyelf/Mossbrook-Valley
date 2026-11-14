'use strict';
// The Pit's own champions. Five fighters who were never part of the valley's story,
// each with a look, a rhythm and attacks of its own. The King keeps his place as the
// sixth. Every big attack is telegraphed on the ground first: read it, then move.

Object.assign(FOES, {
  gorehorn: { name: 'Gorehorn', hp: 400, dmg: 18, speed: 56, vision: 400, reach: 22, cool: 1.3, xp: 60, boss: true, heavy: true, pit: true, scale: 1.5, ai: 'gorehorn', wallStun: 1.4, onWall(f) { f.combo = 0; this.rockfall(f); }, gold: [0, 0], drops: [] },
  mire: { name: 'Mother Mire', hp: 760, dmg: 20, speed: 40, vision: 400, reach: 24, cool: 1.2, xp: 90, boss: true, heavy: true, pit: true, scale: 1.5, ai: 'mire', gold: [0, 0], drops: [] },
  ashgrave: { name: 'Sir Ashgrave', hp: 700, dmg: 22, speed: 58, vision: 400, reach: 26, cool: 1.1, xp: 120, boss: true, heavy: true, pit: true, scale: 1.4, ai: 'ashgrave', gold: [0, 0], drops: [] },
  glasswing: { name: 'Glasswing', hp: 640, dmg: 23, speed: 70, vision: 400, reach: 20, cool: 1.3, xp: 150, boss: true, pit: true, scale: 1.5, ai: 'glasswing', gold: [0, 0], drops: [] },
  morrow: { name: 'Morrow the Colossus', hp: 1000, dmg: 26, speed: 32, vision: 400, reach: 30, cool: 1.5, xp: 180, boss: true, heavy: true, pit: true, scale: 1.6, ai: 'morrow', kb: 1.4, gold: [0, 0], drops: [] },
});
PIT_BOSSES.splice(0, PIT_BOSSES.length, 'gorehorn', 'mire', 'ashgrave', 'glasswing', 'morrow', 'king');

// ---- Their look -------------------------------------------------------------------
(() => {
  const { P } = Art, F = Art.FOE_ART;
  // A scarred, bristle-backed boar the size of a cart, with tusks like hooks.
  F.gorehorn = { w: 34, h: 26, draw(g, f) {
    const y = f ? -1 : 0, s = f ? 1 : 0;
    P(g, '#4a2e1e', 7, 19, 4, 6 - s); P(g, '#4a2e1e', 13, 19, 4, 5 + s); P(g, '#4a2e1e', 20, 19, 4, 5 + s); P(g, '#4a2e1e', 25, 19, 4, 6 - s);
    P(g, '#2a1a10', 7, 25 - s, 4, 1); P(g, '#2a1a10', 25, 25 - s, 4, 1);
    P(g, '#3a2416', 2, 9 + y, 2, 4);
    P(g, '#7a4a2e', 4, 8 + y, 22, 12); P(g, '#8e5a38', 6, 7 + y, 17, 3); P(g, '#5e3820', 4, 18 + y, 22, 2);
    for (let i = 0; i < 7; i++) P(g, '#3a2416', 6 + i * 3, 4 + y + (i % 2), 2, 4);
    P(g, '#c8a080', 11, 11 + y, 6, 1); P(g, '#c8a080', 14, 13 + y, 5, 1); P(g, '#c8a080', 9, 15 + y, 3, 1);
    P(g, '#7a4a2e', 23, 8 + y, 8, 11); P(g, '#5e3820', 24, 5 + y, 3, 4);
    P(g, '#9a6a48', 29, 12 + y, 5, 5); P(g, '#2a1a10', 32, 13 + y, 1, 1); P(g, '#2a1a10', 32, 15 + y, 1, 1);
    P(g, '#ff4030', 26, 10 + y, 2, 1);
    P(g, '#efe2c8', 28, 17 + y, 2, 2); P(g, '#efe2c8', 30, 15 + y, 2, 3); P(g, '#efe2c8', 32, 11 + y, 2, 5); P(g, '#c8b898', 32, 11 + y, 1, 2);
  } };
  // A bog toad as wide as a door, warts and all, eyes like lamps.
  F.mire = { w: 36, h: 26, draw(g, f) {
    P(g, '#4e7a3a', 1, 18, 7, 6); P(g, '#4e7a3a', 28, 18, 7, 6); P(g, '#3a5e2a', 0, 23, 8, 2); P(g, '#3a5e2a', 28, 23, 8, 2);
    P(g, '#4e7a3a', 4, 8, 28, 15); P(g, '#5e8e46', 6, 6, 24, 4);
    P(g, '#c8c890', 9, 16, 18, 6); P(g, '#e0d8a0', 12, 15, 12, f ? 6 : 3);
    P(g, '#5e8e46', 6, 2, 8, 7); P(g, '#5e8e46', 22, 2, 8, 7);
    P(g, '#f0d040', 7, 3, 6, 5); P(g, '#f0d040', 23, 3, 6, 5); P(g, '#1a1a10', 9, 4, 2, 4); P(g, '#1a1a10', 25, 4, 2, 4);
    P(g, '#2a3a1a', 6, 13, 24, 1); P(g, '#2a3a1a', 5, 12, 1, 1); P(g, '#2a3a1a', 30, 12, 1, 1);
    [[8, 9], [14, 7], [20, 9], [26, 8], [5, 15], [29, 15], [17, 10]].forEach(([x, y]) => { P(g, '#3a5e2a', x, y, 2, 2); P(g, '#7ab05a', x, y); });
  } };
  // A knight burned black in his armour and still burning inside it.
  F.ashgrave = { w: 22, h: 30, draw(g, f) {
    const y = f ? -1 : 0, s = f ? 1 : 0;
    P(g, '#5a1a14', 4, 10 + y, 12, 15); P(g, '#5a1a14', 4, 25, 2, 2); P(g, '#5a1a14', 8, 25, 2, 1); P(g, '#5a1a14', 12, 25, 3, 2);
    P(g, '#2e2a2c', 6, 22, 3, 8 - s); P(g, '#2e2a2c', 11, 22, 3, 7 + s);
    P(g, '#3a3436', 5, 10 + y, 10, 12); P(g, '#4a4446', 6, 11 + y, 8, 3);
    P(g, '#ff8a30', 8, 14 + y, 1, 4); P(g, '#ff8a30', 9, 17 + y, 2, 1); P(g, '#ffc060', 11, 12 + y, 1, 2); P(g, '#ff8a30', 6, 19 + y, 3, 1);
    P(g, '#4a4446', 2, 9 + y, 4, 4); P(g, '#4a4446', 14, 9 + y, 4, 4);
    P(g, '#3a3436', 6, 3 + y, 8, 7); P(g, '#4a4446', 7, 2 + y, 6, 2);
    P(g, '#ffb040', 7, 6 + y, 6, 1); P(g, '#ffb040', 9, 6 + y, 2, 3);
    P(g, f ? '#ffe070' : '#ff8a30', 9, 1 + y + s, 2, 1);
    P(g, '#3a3436', 15, 13 + y, 3, 6);
    P(g, '#2a2426', 18, 3 + y, 2, 17); P(g, '#ff6a20', 19, 3 + y, 1, 17); P(g, f ? '#ffe070' : '#ffb040', 18, 2 + y, 2, 1);
    P(g, '#6a5a40', 16, 19 + y, 6, 1); P(g, '#3a2a1a', 18, 20 + y, 2, 3);
  } };
  // A storm moth with glass-pale wings and eyes painted on them.
  F.glasswing = { w: 36, h: 26, draw(g, f) {
    if (!f) {
      P(g, '#c8d8ec', 2, 4, 14, 10); P(g, '#a8bcd8', 5, 13, 11, 8); P(g, '#c8d8ec', 20, 4, 14, 10); P(g, '#a8bcd8', 20, 13, 11, 8);
      P(g, '#7a8ab0', 2, 4, 14, 1); P(g, '#7a8ab0', 20, 4, 14, 1);
      P(g, '#3a6ab0', 6, 7, 4, 4); P(g, '#e8f4ff', 7, 8, 2, 2); P(g, '#3a6ab0', 26, 7, 4, 4); P(g, '#e8f4ff', 27, 8, 2, 2);
      P(g, '#ffffff', 3, 5); P(g, '#ffffff', 32, 6); P(g, '#ffffff', 8, 17); P(g, '#ffffff', 27, 18);
    } else {
      P(g, '#c8d8ec', 4, 1, 12, 9); P(g, '#a8bcd8', 6, 10, 10, 7); P(g, '#c8d8ec', 20, 1, 12, 9); P(g, '#a8bcd8', 20, 10, 10, 7);
      P(g, '#7a8ab0', 4, 1, 12, 1); P(g, '#7a8ab0', 20, 1, 12, 1);
      P(g, '#3a6ab0', 8, 4, 3, 3); P(g, '#e8f4ff', 9, 5); P(g, '#3a6ab0', 25, 4, 3, 3); P(g, '#e8f4ff', 26, 5);
    }
    P(g, '#3a3448', 16, 8, 4, 14); P(g, '#5a5068', 15, 9, 6, 4); P(g, '#3a3448', 16, 5, 4, 3);
    P(g, '#9ad8ff', 16, 6); P(g, '#9ad8ff', 19, 6);
    P(g, '#3a3448', 15, 1, 1, 4); P(g, '#3a3448', 14, 0, 1, 1); P(g, '#3a3448', 20, 1, 1, 4); P(g, '#3a3448', 21, 0, 1, 1);
    for (let i = 0; i < 3; i++) P(g, '#4a4458', 16, 14 + i * 3, 4, 1);
  } };
  // A hill that stood up. Moss on the shoulders, a furnace for a heart.
  F.morrow = { w: 34, h: 34, draw(g, f) {
    const y = f ? -1 : 0, s = f ? 1 : 0;
    P(g, '#5e5a56', 9, 24, 6, 9 - s); P(g, '#5e5a56', 19, 24, 6, 8 + s); P(g, '#4a4744', 8, 32 - s, 8, 2); P(g, '#4a4744', 18, 31 + s, 8, 2);
    P(g, '#7a7672', 7, 10 + y, 20, 15); P(g, '#8e8a84', 8, 11 + y, 18, 4); P(g, '#4a4744', 11, 17 + y, 1, 5); P(g, '#4a4744', 23, 15 + y, 1, 4);
    P(g, '#ff9a30', 15, 16 + y, 4, 4); P(g, '#ffe070', 16, 17 + y, 2, 2);
    P(g, '#6e6a66', 1, 11 + y, 6, 12); P(g, '#6e6a66', 27, 11 + y, 6, 12);
    P(g, '#5e5a56', 0, 22 + y, 8, 7); P(g, '#5e5a56', 26, 22 + y, 8, 7); P(g, '#4a4744', 2, 27 + y, 4, 1); P(g, '#4a4744', 28, 27 + y, 4, 1);
    P(g, '#7a7672', 12, 3 + y, 10, 8); P(g, '#5e5a56', 12, 5 + y, 10, 2); P(g, '#ffb040', 14, 7 + y, 2, 1); P(g, '#ffb040', 18, 7 + y, 2, 1);
    P(g, '#5a8a3a', 7, 9 + y, 6, 2); P(g, '#5a8a3a', 22, 9 + y, 5, 2); P(g, '#4a7a2e', 1, 11 + y, 3, 1); P(g, '#6aa04e', 13, 3 + y, 4, 1); P(g, '#4a7a2e', 29, 11 + y, 3, 2);
    P(g, '#c8a0f0', 24, 5 + y, 2, 4); P(g, '#c8a0f0', 27, 6 + y, 2, 3); P(g, '#e8d0ff', 24, 5 + y);
  } };
})();

// ---- Ground strikes, shockwaves and other things a champion leaves behind --------------
const MARKS = {
  fire: { color: '#ff8a30', boom: 'fire' }, thunder: { color: '#f7e26b', boom: 'thunder' }, rock: { color: '#c8a070', boom: 'blast' },
  slam: { color: '#ff6040', boom: 'blast' }, crystal: { color: '#c8a0f0', boom: 'crystal' },
};
Object.assign(Foes, { marks: [], waves: [], bfx: [] });
// A circle on the ground that fills, then strikes whoever is still standing in it.
Foes.mark = function (x, y, r, t, kind, dmg, o) { this.marks.push(Object.assign({ x, y, r, t, max: t, kind, dmg }, o || {})); };
// A ring that rolls outward from (x, y). Dodge-roll through it, or be somewhere else.
Foes.wave = function (x, y, max, speed, dmg, color, delay = 0) { this.waves.push({ x, y, r: 4, max, speed, dmg, color, delay, hit: false }); };
Foes.rockfall = function (f) {
  VFX.flash(0.06, '#c8a070'); Sfx.play('quake');
  this.mark(Player.x, Player.y - 4, 14, 0.9, 'rock', f.dmg * 0.8);
  for (let i = 0; i < 6; i++) {
    const a = Math.random() * 6.28, r = 30 + Math.random() * 80, x = Player.x + Math.cos(a) * r, y = Player.y - 4 + Math.sin(a) * r;
    if (!World.solid(Player.map, Math.floor(x / TILE), Math.floor((y + 4) / TILE))) this.mark(x, y, 14, 0.9 + i * 0.1, 'rock', f.dmg * 0.8);
  }
};

const enterBefore = Foes.enter.bind(Foes);
Foes.enter = function (m) { if (this.mapId !== m.id) { this.marks = []; this.waves = []; this.bfx = []; } return enterBefore(m); };

const hazardsBefore = Foes.updateHazards;
Foes.updateHazards = function (dt) {
  hazardsBefore.call(this, dt);
  for (const k of this.marks) {
    k.t -= dt;
    if (k.t > 0) continue;
    const look = MARKS[k.kind];
    if (typeof BossFX !== 'undefined') BossFX.boom(k);
    if (look.boom === 'crystal') { VFX.ring(k.x, k.y, k.r, look.color); VFX.burst('spark', k.x, k.y - 4, 6, 50); this.bfx.push({ type: 'spike', x: k.x, y: k.y, t: 0.55, max: 0.55 }); }
    else { VFX.explosion(k.x, k.y, k.r, look.boom); if (k.kind === 'rock') VFX.burst('dust', k.x, k.y, 8, 40); }
    if (Math.hypot(Player.x - k.x, Player.y - 4 - k.y) < k.r) {
      const was = Combat.inv;
      Combat.hitKind = k.kind === 'rock' || k.kind === 'slam' ? null : 'magic';
      Combat.hurtPlayer(k.dmg, k.x, k.y);
      Combat.hitKind = null;
      if (was <= 0 && k.effect) Combat.applyStatus(k.effect, 2.5);
    }
    if (k.hazard) this.hazards.push({ x: k.x, y: k.y, r: k.r + 2, t: 2.2, kind: k.hazard });
  }
  for (const k of this.marks) if (k.t <= 0) Sfx.speakAs(k.voice, () => Sfx.play({ fire: 'fire', thunder: 'thunder', rock: 'boom', slam: 'slam', crystal: 'crystal' }[k.kind]));
  this.marks = this.marks.filter(k => k.t > 0);
  for (const w of this.waves) {
    if (w.delay > 0) { w.delay -= dt; continue; }
    w.r += w.speed * dt;
    if (Math.random() < 0.6) { const a = Math.random() * 6.28; VFX.emit('dust', w.x + Math.cos(a) * w.r, w.y + Math.sin(a) * w.r); }
    const d = Math.hypot(Player.x - w.x, Player.y - 4 - w.y);
    if (!w.hit && Math.abs(d - w.r) < 7) { w.hit = true; Combat.hurtPlayer(w.dmg, w.x, w.y); }
  }
  this.waves = this.waves.filter(w => w.r < w.max);
  for (const b of this.bfx) b.t -= dt;
  this.bfx = this.bfx.filter(b => b.t > 0);
};

const drawHazardsBefore = Foes.drawHazards;
Foes.drawHazards = function (g) {
  drawHazardsBefore.call(this, g);
  for (const k of this.marks) {
    const p = 1 - k.t / k.max, c = MARKS[k.kind].color, x = Math.round(k.x), y = Math.round(k.y);
    if (typeof BossFX !== 'undefined') { BossFX.mark(g, k, p, c); if (k.kind === 'rock') { const h = Math.round((1 - p) * 90); g.fillStyle = '#6a5a48'; g.fillRect(x - 4, y - h - 6, 8, 7); g.fillStyle = '#8a7a68'; g.fillRect(x - 3, y - h - 6, 4, 2); } continue; }
    g.globalAlpha = 0.18 + p * 0.3; g.fillStyle = c; g.beginPath(); g.arc(x, y, Math.max(1, k.r * p), 0, 6.29); g.fill();
    g.globalAlpha = 0.85; g.strokeStyle = c; g.lineWidth = 1; g.beginPath(); g.arc(x, y, k.r, 0, 6.29); g.stroke();
    g.globalAlpha = 1;
    if (k.kind === 'rock') { const h = Math.round((1 - p) * 90); g.fillStyle = '#6a5a48'; g.fillRect(x - 4, y - h - 6, 8, 7); g.fillStyle = '#8a7a68'; g.fillRect(x - 3, y - h - 6, 4, 2); }
  }
  for (const w of this.waves) {
    if (w.delay > 0) continue;
    if (typeof Quake !== 'undefined') { Quake.wave(g, w); continue; }
    const fade = 1 - w.r / w.max;
    g.globalAlpha = 0.3 + fade * 0.6; g.strokeStyle = w.color; g.lineWidth = 4; g.beginPath(); g.arc(Math.round(w.x), Math.round(w.y), w.r, 0, 6.29); g.stroke();
    g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.beginPath(); g.arc(Math.round(w.x), Math.round(w.y), w.r, 0, 6.29); g.stroke();
    g.globalAlpha = 1;
  }
  for (const b of this.bfx) {
    const life = b.t / b.max;
    if (b.type === 'tongue') {
      g.strokeStyle = '#d86a7a'; g.lineWidth = 4; g.beginPath(); g.moveTo(b.x1, b.y1); g.lineTo(b.x2, b.y2); g.stroke();
      g.strokeStyle = '#f0a0b0'; g.lineWidth = 1; g.beginPath(); g.moveTo(b.x1, b.y1 - 1); g.lineTo(b.x2, b.y2 - 1); g.stroke();
      g.fillStyle = '#c04a5a'; g.beginPath(); g.arc(b.x2, b.y2, 4, 0, 6.29); g.fill();
    } else if (b.type === 'spike') {
      const h = Math.round(16 * Math.min(1, life * 2)), x = Math.round(b.x), y = Math.round(b.y);
      g.fillStyle = '#9a70d0'; g.beginPath(); g.moveTo(x - 5, y); g.lineTo(x, y - h); g.lineTo(x + 5, y); g.fill();
      g.fillStyle = '#e8d0ff'; g.beginPath(); g.moveTo(x - 1, y); g.lineTo(x, y - h + 2); g.lineTo(x + 2, y); g.fill();
    }
  }
  g.lineWidth = 1;
};

// Wind-ups you can read: a lane for a charge, a line for a tongue, a ring for a stomp.
Foes.telegraph = function (g, f) {
  if (f.state !== 'windup' || !f.tmax) return;
  const p = 1 - f.t / f.tmax, x = Math.round(f.x), y = Math.round(f.y);
  if (f.atk === 'gore' || f.atk === 'swoop') {
    g.save(); g.translate(x, y - 4); g.rotate(f.chargeA);
    g.fillStyle = `rgba(255,80,80,${0.12 + p * 0.33})`; g.fillRect(0, -9, f.atk === 'gore' ? 255 : 130, 18); g.restore();
    if (typeof BossFX !== 'undefined') BossFX.lane(g, x, y - 4, f.chargeA, f.atk === 'gore' ? 255 : 130, p, f.atk === 'gore' ? '#ffd0a0' : '#d8f0ff');
  } else if (f.atk === 'tongue') {
    g.strokeStyle = `rgba(216,106,122,${0.25 + p * 0.5})`; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y - 10);
    g.lineTo(x + Math.cos(f.tongueA) * 150, y - 10 + Math.sin(f.tongueA) * 150); g.stroke(); g.lineWidth = 1;
  } else if (f.atk === 'stomp' || f.atk === 'quake') {
    const r = f.atk === 'stomp' ? 40 : 56;
    if (typeof Quake !== 'undefined') Quake.tele(g, x, y, r, p, Quake.theme(f));
    else { g.strokeStyle = `rgba(255,128,96,${0.4 + p * 0.5})`; g.beginPath(); g.arc(x, y, r * p, 0, 6.29); g.stroke(); g.beginPath(); g.arc(x, y, r, 0, 6.29); g.stroke(); }
  }
};

const drawFoeBefore = Foes.drawFoe;
Foes.drawFoe = function (g, f) {
  this.telegraph(g, f);
  if (!f.z) return drawFoeBefore.call(this, g, f);
  Render.shadow(g, f.x, f.y, Math.round(10 * (f.def.scale || 1)));
  g.save(); g.translate(0, -Math.round(f.z)); drawFoeBefore.call(this, g, f); g.restore();
};

// Mid-leap, a champion is out of reach.
const damageBefore = Foes.damage;
Foes.damage = function (f, ...rest) { if (f.air) return; return damageBefore.call(this, f, ...rest); };

// Their projectiles: toad spittle, thrown boulders, moth dust.
const shotBefore = VFX.shot;
VFX.shot = function (g, s) {
  const x = Math.round(s.x), y = Math.round(s.y), h = Math.round(s.h || 0);
  if (s.kind === 'glob') {
    g.fillStyle = '#00000040'; g.fillRect(x - 3, y + 2, 6, 2);
    g.fillStyle = '#4e8a2e'; g.beginPath(); g.arc(x, y - h, 4, 0, 6.29); g.fill(); g.fillStyle = '#9ad060'; g.fillRect(x - 2, y - h - 2, 2, 2); return;
  }
  if (s.kind === 'boulder') {
    g.fillStyle = '#00000050'; g.fillRect(x - 5, y + 2, 10, 3);
    g.fillStyle = '#6a6460'; g.beginPath(); g.arc(x, y - h, 7, 0, 6.29); g.fill();
    g.fillStyle = '#8e8a84'; g.fillRect(x - 4, y - h - 5, 4, 3); g.fillStyle = '#4a4744'; g.fillRect(x + 1, y - h, 3, 1); return;
  }
  if (s.kind === 'dust') {
    g.fillStyle = 'rgba(200,216,236,0.35)'; g.beginPath(); g.arc(x, y, 5, 0, 6.29); g.fill();
    g.fillStyle = '#e8f4ff'; g.fillRect(x - 1, y - 1, 3, 3); g.fillStyle = '#9ad8ff'; g.fillRect(x, y, 1, 1); return;
  }
  return shotBefore.call(this, g, s);
};

// ---- How each champion fights -------------------------------------------------------
(() => {
  const wind = (f, atk, t) => { f.state = 'windup'; f.t = f.tmax = t; f.atk = atk; f.last = atk; };
  const rage = f => f.hp < f.max / 2;
  const aim = f => Math.atan2(Player.y - f.y, Player.x - f.x);
  const open = (x, y) => !World.solid(Player.map, Math.floor(x / TILE), Math.floor((y + 4) / TILE));
  const lob = (f, tx, ty, o) => {
    const t = o.life || 1;
    Foes.shots.push(Object.assign({ lob: true, sx: f.x, sy: f.y - 14, tx, ty, x: f.x, y: f.y - 14, vx: tx - f.x, vy: ty - f.y, life: t, total: t, fx: f.x, fy: f.y }, o));
  };
  const segDist = (px, py, x1, y1, x2, y2) => {
    const vx = x2 - x1, vy = y2 - y1, l2 = vx * vx + vy * vy || 1, t = clamp(((px - x1) * vx + (py - y1) * vy) / l2, 0, 1);
    return Math.hypot(px - (x1 + vx * t), py - (y1 + vy * t));
  };

  Object.assign(Foes.AI, {
    // Gorehorn charges in threes (fours when wounded). Miss, and he hits the wall and
    // shakes the roof down. Get close, and he stomps.
    gorehorn(f, d, dx, dy, dt, speed, m) {
      this.face(f, dx, dy);
      if (f.combo > 0 && f.cool <= 0) { f.chargeA = Math.atan2(dy, dx); wind(f, 'gore', rage(f) ? 0.35 : 0.45); return true; }
      if (f.cool <= 0) {
        if (d < 65 && f.last !== 'stomp') { wind(f, 'stomp', 0.7); return true; }
        if (d < 190 && f.last !== 'kick' && (f.last === 'gore' || Math.random() < 0.35)) { wind(f, 'kick', 0.55); return true; }
        f.combo = rage(f) ? 4 : 3; f.chargeA = Math.atan2(dy, dx); wind(f, 'gore', 0.8); return true;
      }
      if (d > 40) this.chase(f, dx, dy, d, speed * 0.8, m, dt);
      return true;
    },
    // Mother Mire leaps on you, lashes you in with her tongue, and spits poison.
    mire(f, d, dx, dy, dt, speed, m) {
      if (f.leap) {
        const L = f.leap; L.t -= dt;
        const p = 1 - Math.max(0, L.t) / L.T;
        f.x = L.sx + (L.tx - L.sx) * p; f.y = L.sy + (L.ty - L.sy) * p; f.z = Math.sin(p * Math.PI) * 46;
        if (L.t <= 0) {
          f.leap = null; f.z = 0; f.air = false; f.cool = f.def.cool;
          this.wave(f.x, f.y, 90, 150, f.dmg * 0.7, '#4e7a3a');
          VFX.burst('dust', f.x, f.y, 16, 60); Sfx.play('slam');
        }
        return true;
      }
      this.face(f, dx, dy);
      if (f.cool <= 0) {
        const r = Math.random();
        if (d > 50 && d < 150 && r < 0.4) { f.tongueA = Math.atan2(Player.y - f.y, Player.x - f.x); wind(f, 'tongue', 0.65); }
        else if (r < 0.72) wind(f, 'leap', 0.5);
        else wind(f, 'globs', 0.6);
        return true;
      }
      this.keepAway(f, d, dx, dy, speed, 70);
      if (d > 110) this.chase(f, dx, dy, d, speed, m, dt);
      return true;
    },
    // Sir Ashgrave cuts three times, lunging with each, and sends fire along the ground.
    ashgrave(f, d, dx, dy, dt, speed, m) {
      this.face(f, dx, dy);
      if (f.combo > 0 && f.cool <= 0) { wind(f, 'ash_slash', 0.28); return true; }
      if (f.cool <= 0) {
        const r = Math.random();
        if (rage(f) && r < 0.35) wind(f, 'firering', 0.8);
        else if (d < 70 ? r < 0.7 : r < 0.25) { f.combo = 3; wind(f, 'ash_slash', 0.45); }
        else if (r < 0.7) wind(f, 'flamewave', 0.7);
        else wind(f, 'embers', 0.55);
        return true;
      }
      if (d > 30) this.chase(f, dx, dy, d, speed, m, dt);
      return true;
    },
    // Glasswing circles overhead, calls lightning, spins out dust, and dives.
    glasswing(f, d, dx, dy, dt, speed, m) {
      f.z = 10 + Math.sin(f.frame * 1.3) * 3;
      if (f.spiral) {
        const sp = f.spiral; sp.t -= dt; sp.e -= dt;
        while (sp.e <= 0) {
          sp.e += 0.07;
          for (let i = 0; i < sp.arms; i++) {
            const a = sp.a + i * 6.283 / sp.arms;
            this.shots.push({ x: f.x, y: f.y - 10, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, life: 2.6, dmg: f.dmg * 0.55, fx: f.x, fy: f.y, kind: 'dust', effect: 'slow' });
          }
          sp.a += 0.42 * sp.dir;
        }
        if (sp.t <= 0) f.spiral = null;
        return true;
      }
      this.face(f, dx, dy);
      if (f.cool <= 0) {
        const r = Math.random();
        if (d < 120 && r < 0.3) { f.chargeA = Math.atan2(dy, dx); wind(f, 'swoop', 0.5); }
        else if (r < 0.65) wind(f, 'storm', 0.6);
        else wind(f, 'spiral', 0.5);
        return true;
      }
      if (!f.orbit) f.orbit = Math.random() < 0.5 ? 1 : -1;
      f.blocked = false;
      this.keepAway(f, d, dx, dy, speed, 100);
      if (d > 140) this.move(f, dx / d * speed, dy / d * speed);
      this.move(f, -dy / d * speed * 0.6 * f.orbit, dx / d * speed * 0.6 * f.orbit);
      if (f.blocked) f.orbit = -f.orbit;
      return true;
    },
    // Morrow is slow. He does not need to be fast.
    morrow(f, d, dx, dy, dt, speed, m) {
      this.face(f, dx, dy);
      if (f.cool <= 0) {
        // Close in, he shakes the ground; far off, he throws. Never the same thing twice running.
        const opts = (d < 75 ? ['quake', 'quake', 'spikes', 'boulder'] : ['boulder', 'boulder', 'spikes']).filter(o => o !== f.last);
        const pickA = opts[Math.floor(Math.random() * opts.length)];
        wind(f, pickA, { quake: 0.9, boulder: 0.7, spikes: 0.8 }[pickA]);
        return true;
      }
      if (d > 50) this.chase(f, dx, dy, d, speed, m, dt);
      return true;
    },
  });

  Object.assign(Foes.ATTACK, {
    gore(f) {
      f.combo = (f.combo || 1) - 1;
      f.vx = Math.cos(f.chargeA) * 300; f.vy = Math.sin(f.chargeA) * 300; f.dashT = 0.85; f.dashHit = false;
      f.cool = f.combo > 0 ? 0.05 : f.def.cool;
      VFX.burst('dust', f.x, f.y, 10, 40); Sfx.play('charge');
    },
    // He scrapes the sand and sprays stones at you.
    kick(f) {
      for (let i = 0; i < (rage(f) ? 5 : 3); i++) {
        let tx = Player.x + (i ? (Math.random() - 0.5) * 70 : 0), ty = Player.y - 4 + (i ? (Math.random() - 0.5) * 50 : 0);
        if (!open(tx, ty)) { tx = Player.x; ty = Player.y - 4; }
        lob(f, tx, ty, { life: 0.7 + i * 0.08, kind: 'boulder', aoe: 18, dmg: f.dmg * 0.7 });
      }
      VFX.burst('dust', f.x, f.y, 12, 50); Sfx.play('throw');
    },
    stomp(f) {
      this.wave(f.x, f.y, 100, 170, f.dmg, '#8a4a2a');
      if (rage(f)) this.wave(f.x, f.y, 100, 170, f.dmg, '#8a4a2a', 0.35);
      VFX.burst('dust', f.x, f.y, 14, 60); Sfx.play('slam');
      if (typeof Quake !== 'undefined') Quake.hit(f.x, f.y, 40, Quake.theme(f));
    },
    tongue(f) {
      const a = f.tongueA, x1 = f.x, y1 = f.y - 10;
      let len = 150;
      for (let s = 8; s <= 150; s += 8) if (!open(x1 + Math.cos(a) * s, y1 + 6 + Math.sin(a) * s)) { len = s; break; }
      const x2 = x1 + Math.cos(a) * len, y2 = y1 + Math.sin(a) * len;
      this.bfx.push({ type: 'tongue', x1, y1, x2, y2, t: 0.3, max: 0.3 });
      Sfx.play('tongue');
      if (segDist(Player.x, Player.y - 10, x1, y1, x2, y2) < 10) {
        const was = Combat.inv;
        Combat.hurtPlayer(f.dmg * 0.8, f.x, f.y, 0);
        if (was <= 0) {
          // Reeled in, to just in front of her mouth.
          const tx = f.x + Math.cos(a) * 30, ty = f.y + Math.sin(a) * 30;
          for (let i = 0; i < 12; i++) { Player.moveAxis((tx - Player.x) / 4, 0); Player.moveAxis(0, (ty - Player.y) / 4); }
          Combat.applyStatus('slow', 1.5);
        }
      }
    },
    leap(f) {
      const [tx, ty] = this.freeSpot(Player.x, Player.y), T = rage(f) ? 0.7 : 0.85;
      f.leap = { sx: f.x, sy: f.y, tx, ty, t: T, T }; f.air = true;
      this.mark(tx, ty - 4, 34, T, 'slam', f.dmg * 1.2);
      VFX.burst('dust', f.x, f.y, 10, 40); Sfx.play('leap');
    },
    globs(f) {
      const n = rage(f) ? 5 : 3;
      for (let i = 0; i < n; i++) {
        let tx = Player.x, ty = Player.y - 4;
        if (i) { tx += (Math.random() - 0.5) * 110; ty += (Math.random() - 0.5) * 80; if (!open(tx, ty)) { tx = Player.x; ty = Player.y - 4; } }
        lob(f, tx, ty, { life: 0.9 + i * 0.1, kind: 'glob', aoe: 20, dmg: f.dmg * 0.7, pool: 'spore', poolR: 22, poolT: 4, boomKind: 'poison' });
      }
      Sfx.play('splat');
    },
    ash_slash(f, d) {
      f.combo = (f.combo || 1) - 1;
      const a = aim(f);
      f.vx = Math.cos(a) * 260; f.vy = Math.sin(a) * 260; f.dashT = 0.16; f.dashHit = true;
      if (!(typeof BossFX !== 'undefined' && BossFX.slash(f, f.x + Math.cos(a) * 10, f.y - 12 + Math.sin(a) * 10, a, 2.2, 30))) VFX.slash(f.x + Math.cos(a) * 10, f.y - 12 + Math.sin(a) * 10, a, 2.2, 30, '#ff8a30');
      VFX.burst('flame', f.x + Math.cos(a) * 24, f.y - 10 + Math.sin(a) * 24, 8, 40);
      Sfx.play('heavy_swing');
      if (d < f.def.reach + 40) { const was = Combat.inv; Combat.hurtPlayer(f.dmg, f.x, f.y); if (was <= 0) { Combat.applyStatus('burn', 2); if (typeof BossFX !== 'undefined') BossFX.struck(f); } }
      f.cool = f.combo > 0 ? 0.05 : f.def.cool + 0.4;
    },
    flamewave(f) {
      const a = aim(f), spread = rage(f) ? [-0.35, 0, 0.35] : [0];
      for (const s of spread) for (let i = 0; i < 8; i++) {
        const x = f.x + Math.cos(a + s) * (24 + i * 18), y = f.y - 4 + Math.sin(a + s) * (24 + i * 18);
        if (!open(x, y)) break;
        this.mark(x, y, 13, 0.35 + i * 0.09, 'fire', f.dmg * 0.9, { hazard: 'fire', effect: 'burn' });
      }
      VFX.burst('flame', f.x, f.y - 6, 14, 50); Sfx.play('fire');
    },
    // A fan of embers flung off the blade.
    embers(f) {
      const a = aim(f), n = rage(f) ? 5 : 3;
      for (let i = 0; i < n; i++) {
        const s = a + (i - (n - 1) / 2) * 0.22;
        this.shots.push({ x: f.x, y: f.y - 12, vx: Math.cos(s) * 150, vy: Math.sin(s) * 150, life: 1.8, dmg: f.dmg * 0.6, fx: f.x, fy: f.y, kind: 'fireball', effect: 'burn', hazard: 'fire' });
      }
      if (!(typeof BossFX !== 'undefined' && BossFX.slash(f, f.x, f.y - 12, a, 1.4, 24))) VFX.slash(f.x, f.y - 12, a, 1.4, 24, '#ffb040'); Sfx.play('fire');
    },
    firering(f) {
      const off = Math.random();
      for (let i = 0; i < 14; i++) {
        const a = off + i * 6.283 / 14;
        this.shots.push({ x: f.x, y: f.y - 10, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, life: 2.2, dmg: f.dmg * 0.7, fx: f.x, fy: f.y, kind: 'fireball', effect: 'burn' });
      }
      VFX.explosion(f.x, f.y - 8, 26, 'fire'); Sfx.play('boom');
    },
    storm(f) {
      const n = rage(f) ? 8 : 5;
      this.mark(Player.x, Player.y - 4, 18, 1.0, 'thunder', f.dmg);
      for (let i = 1; i < n; i++) {
        const a = Math.random() * 6.28, r = 25 + Math.random() * 75, x = Player.x + Math.cos(a) * r, y = Player.y - 4 + Math.sin(a) * r;
        if (open(x, y)) this.mark(x, y, 18, 1.0 + i * 0.12, 'thunder', f.dmg);
      }
      VFX.burst('star', f.x, f.y - 20, 10, 40); Sfx.play('magic');
    },
    spiral(f) { f.spiral = { t: 1.4, e: 0, a: Math.random() * 6.28, dir: Math.random() < 0.5 ? 1 : -1, arms: rage(f) ? 3 : 2 }; Sfx.play('magic_cast'); },
    swoop(f) { f.vx = Math.cos(f.chargeA) * 320; f.vy = Math.sin(f.chargeA) * 320; f.dashT = 0.4; f.dashHit = false; Sfx.play('whoosh'); },
    quake(f) {
      const n = rage(f) ? 3 : 2;
      for (let i = 0; i < n; i++) this.wave(f.x, f.y, 170, 120, f.dmg, '#6a5a4a', i * 0.5);
      VFX.burst('dust', f.x, f.y, 24, 80); VFX.flash(0.08, '#c8b088'); Sfx.play('quake');
      if (typeof Quake !== 'undefined') Quake.hit(f.x, f.y, 56, Quake.theme(f));
    },
    boulder(f) {
      const n = rage(f) ? 3 : 1;
      for (let i = 0; i < n; i++) {
        let tx = Player.x, ty = Player.y - 4;
        if (i) { tx += (Math.random() - 0.5) * 100; ty += (Math.random() - 0.5) * 70; if (!open(tx, ty)) { tx = Player.x; ty = Player.y - 4; } }
        lob(f, tx, ty, { life: 1.1 + i * 0.15, kind: 'boulder', aoe: 38, dmg: f.dmg * 1.3, pkb: 1.4 });
      }
      Sfx.play('throw');
    },
    spikes(f) {
      f.spikeTurn = !f.spikeTurn;
      const dirs = rage(f) ? 8 : 4, base = dirs === 4 && f.spikeTurn ? 0.785 : 0;
      for (let j = 0; j < dirs; j++) {
        const a = base + j * 6.283 / dirs;
        for (let i = 0; i < 8; i++) {
          const x = f.x + Math.cos(a) * (26 + i * 20), y = f.y - 4 + Math.sin(a) * (26 + i * 20);
          if (!open(x, y)) break;
          this.mark(x, y, 12, 0.4 + i * 0.08, 'crystal', f.dmg * 0.9);
        }
      }
      VFX.burst('spark', f.x, f.y - 6, 12, 50); Sfx.play('crystal');
    },
  });
})();
