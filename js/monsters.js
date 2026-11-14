'use strict';
// New creatures with attacks of their own: goblins that lunge, throw and lob bombs,
// a shaman that heals, witches, slimes that split, imps, wraiths, spiders, ogres
// and sporelings. Also where they live, and how every attack plays out.

Object.assign(FOES, {
  goblin: { name: 'Goblin', hp: 40, dmg: 9, speed: 70, vision: 110, reach: 18, cool: 1.1, xp: 8, ai: 'lunge', drops: [['copper', 1, 1, 0.3]], gold: [2, 10] },
  goblin_spear: { name: 'Goblin Spearman', hp: 45, dmg: 11, speed: 60, vision: 140, reach: 18, cool: 1.6, xp: 10, ai: 'thrower', drops: [['wood', 1, 2, 0.4]], gold: [3, 12] },
  bomber: { name: 'Goblin Bomber', hp: 40, dmg: 14, speed: 55, vision: 150, reach: 18, cool: 2.2, xp: 12, ai: 'bomber', drops: [['coal', 1, 1, 0.5]], gold: [4, 14] },
  shaman: { name: 'Goblin Shaman', hp: 55, dmg: 7, speed: 52, vision: 150, reach: 18, cool: 1.4, xp: 16, ai: 'healer', drops: [['herb', 1, 2, 0.6]], gold: [6, 18] },
  witch: { name: 'Bog Witch', hp: 63, dmg: 14, speed: 50, vision: 170, reach: 18, cool: 2.83, kb: 0.85, xp: 24, ai: 'witch', human: true, look: null, drops: [['amethyst', 1, 1, 0.2], ['smoke_vial', 1, 1, 0.3]], gold: [10, 40] },
  slime: { name: 'Slime', hp: 42, dmg: 8, speed: 38, vision: 90, reach: 18, cool: 1.1, xp: 8, split: true, wobble: true, drops: [['sap', 1, 2, 0.6]], gold: [0, 4] },
  slimelet: { name: 'Slimelet', hp: 14, dmg: 4, speed: 54, vision: 90, reach: 14, cool: 0.9, xp: 2, scale: 0.6, drops: [], gold: [0, 1] },
  imp: { name: 'Fire Imp', hp: 50, dmg: 12, speed: 66, vision: 150, reach: 18, cool: 2.65, xp: 14, ai: 'imp', wobble: true, drops: [['coal', 1, 2, 0.6]], gold: [3, 12] },
  wraith: { name: 'Frost Wraith', hp: 85, dmg: 15, speed: 48, vision: 130, reach: 18, cool: 2.4, xp: 20, ai: 'wraith', drops: [['quartz', 1, 1, 0.3]], gold: [5, 20] },
  spider: { name: 'Cave Spider', hp: 45, dmg: 9, speed: 78, vision: 120, reach: 18, cool: 0.9, xp: 10, ai: 'spider', poison: true, drops: [['fiber', 2, 4, 0.7]], gold: [0, 5] },
  ogre: { name: 'Ogre', hp: 320, dmg: 26, speed: 40, vision: 140, reach: 26, cool: 1.4, xp: 40, ai: 'ogre', heavy: true, slam: true, drops: [['gold_ore', 1, 1, 0.3]], gold: [30, 90] },
  sporeling: { name: 'Sporeling', hp: 50, dmg: 6, speed: 34, vision: 120, reach: 18, cool: 2.6, xp: 10, ai: 'spores', drops: [['mushroom', 1, 2, 0.7]], gold: [0, 4] },
});
FOES.witch.look = { skin: '#b8d0a0', skinD: '#98b080', hair: '#2a2a32', hairD: '#1a1a20', style: 'long', hat: 'witch', shirt: '#5a3a7a', shirtD: '#44285e', belt: '#2a1a10', pants: '#44285e', pantsD: '#301c44', shoes: '#1a1210' };
Object.assign(FOES.archer, { shot: 'arrow' }); Object.assign(FOES.crossbow, { shot: 'bolt' }); Object.assign(FOES.gunner, { shot: 'harpoon' });
Object.assign(ITEMS.longbow_a.w, { shot: 'arrow' }); Object.assign(ITEMS.repeater.w, { shot: 'bolt' }); Object.assign(ITEMS.throwing_axes.w, { shot: 'axe' });
Object.assign(ITEMS.ember_wand.w, { shot: 'fireball' }); Object.assign(ITEMS.frost_staff.w, { shot: 'frost' }); Object.assign(ITEMS.hunting_bow.w, { shot: 'arrow' });

// ---- Art -------------------------------------------------------------------------
(() => {
  const { P } = Art, F = Art.FOE_ART;
  const goblin = (cloth, extra) => ({ w: 18, h: 20, draw(g, f) {
    const y = f ? -1 : 0;
    P(g, '#6aa845', 5, 4 + y, 8, 7); P(g, '#5a9035', 5, 10 + y, 8, 1); P(g, '#6aa845', 2, 5 + y, 3, 2); P(g, '#6aa845', 13, 5 + y, 3, 2);
    P(g, '#e0e040', 7, 7 + y); P(g, '#e0e040', 10, 7 + y); P(g, '#2a1a10', 8, 9 + y, 2, 1);
    P(g, cloth, 5, 11 + y, 8, 6); P(g, '#5a9035', 6, 17, 2, 3 - (f ? 1 : 0)); P(g, '#5a9035', 10, 17, 2, 2 + (f ? 1 : 0));
    extra(g, y);
  } });
  F.goblin = goblin('#7a5535', (g, y) => { P(g, '#c8ccd4', 14, 9 + y, 1, 5); P(g, '#7a5535', 13, 13 + y, 3, 1); });
  F.goblin_spear = goblin('#9a3a30', (g, y) => { P(g, '#7a5535', 15, 2 + y, 1, 16); P(g, '#c8ccd4', 14, 0 + y, 3, 3); });
  F.bomber = goblin('#5a4a38', (g, y) => { P(g, '#24242c', 13, 9 + y, 4, 4); P(g, '#ff8a30', 16, 7 + y, 1, 2); });
  F.shaman = goblin('#3f6a5a', (g, y) => { P(g, '#7a5535', 15, 4 + y, 1, 14); P(g, '#7ad07a', 14, 2 + y, 3, 3); P(g, '#c43030', 6, 2 + y, 2, 3); P(g, '#e8b53c', 9, 1 + y, 2, 4); P(g, '#3f6fa8', 12, 2 + y, 1, 3); });
  F.slime = { w: 20, h: 16, draw(g, f) {
    const sq = f ? 1 : 0;
    P(g, '#5ac05a', 3, 4 + sq, 14, 11 - sq); P(g, '#7ad87a', 5, 3 + sq, 10, 2); P(g, '#3a9a3a', 3, 13, 14, 2); P(g, '#c8f0c8', 6, 5 + sq, 3, 2);
    P(g, '#1a3a1a', 7, 8 + sq, 2, 2); P(g, '#1a3a1a', 12, 8 + sq, 2, 2);
  } };
  F.slimelet = F.slime;
  F.imp = { w: 20, h: 20, draw(g, f) {
    P(g, '#c43030', 7, 6, 7, 8); P(g, '#e04040', 8, 6, 3, 3); P(g, '#ffe070', 8, 8); P(g, '#ffe070', 12, 8); P(g, '#8a2020', 7, 4, 1, 3); P(g, '#8a2020', 13, 4, 1, 3);
    if (f) { P(g, '#8a2020', 1, 3, 6, 4); P(g, '#8a2020', 14, 3, 6, 4); } else { P(g, '#8a2020', 1, 7, 6, 4); P(g, '#8a2020', 14, 7, 6, 4); }
    P(g, '#c43030', 8, 14, 2, 3); P(g, '#c43030', 11, 14, 2, 3); P(g, '#8a2020', 13, 13, 4, 1); P(g, '#8a2020', 16, 12, 1, 1);
  } };
  F.wraith = { w: 18, h: 22, draw(g, f) {
    const y = f ? -1 : 0;
    P(g, '#d8ecf8', 4, 3 + y, 10, 12); P(g, '#b8d8f0', 3, 8 + y, 12, 9); P(g, '#ffffff', 5, 3 + y, 4, 2);
    P(g, '#3a9ad8', 6, 7 + y, 2, 2); P(g, '#3a9ad8', 10, 7 + y, 2, 2);
    for (let i = 0; i < 4; i++) P(g, '#b8d8f0', 3 + i * 3, 17 + y + (i + f) % 2, 2, 3);
  } };
  F.spider = { w: 22, h: 16, draw(g, f) {
    P(g, '#2a2228', 7, 5, 8, 7); P(g, '#3a3036', 8, 5, 4, 2); P(g, '#2a2228', 14, 7, 4, 4); P(g, '#e04030', 16, 8); P(g, '#e04030', 17, 9);
    for (let i = 0; i < 4; i++) { const up = (i + f) % 2; P(g, '#1a1418', 4 + i * 4, 11 + up, 1, 4 - up); P(g, '#1a1418', 3 + i * 4, 3 - up, 1, 3); }
  } };
  F.ogre = { w: 30, h: 30, draw(g, f) {
    const y = f ? -1 : 0;
    P(g, '#7a9a6a', 9, 3 + y, 12, 10); P(g, '#5e7e50', 9, 12 + y, 12, 1); P(g, '#2a1a10', 12, 7 + y, 2, 2); P(g, '#2a1a10', 17, 7 + y, 2, 2); P(g, '#efe2c8', 13, 11 + y, 1, 2); P(g, '#efe2c8', 17, 11 + y, 1, 2);
    P(g, '#6a5040', 7, 13 + y, 16, 11); P(g, '#7a9a6a', 3, 14 + y, 4, 8); P(g, '#7a9a6a', 23, 14 + y, 4, 8);
    P(g, '#5e7e50', 9, 24, 5, 6 - (f ? 1 : 0)); P(g, '#5e7e50', 16, 24, 5, 5 + (f ? 1 : 0));
    P(g, '#6f4c30', 25, 6 + y, 4, 16); P(g, '#55555f', 24, 4 + y, 6, 5);
  } };
  F.sporeling = { w: 18, h: 18, draw(g, f) {
    const y = f ? -1 : 0;
    P(g, '#c0533f', 3, 3 + y, 12, 6); P(g, '#d86a50', 5, 2 + y, 8, 2); P(g, '#efe2c8', 5, 4 + y, 2, 2); P(g, '#efe2c8', 10, 3 + y, 2, 2); P(g, '#efe2c8', 13, 6 + y, 1, 1);
    P(g, '#efe2c8', 6, 9 + y, 6, 6); P(g, '#2a1a10', 7, 11 + y); P(g, '#2a1a10', 10, 11 + y);
    P(g, '#c8b898', 6, 15, 2, 3 - (f ? 1 : 0)); P(g, '#c8b898', 10, 15, 2, 2 + (f ? 1 : 0));
  } };
})();

// ---- How each creature fights ------------------------------------------------------
// An AI hook returns true when it has handled the creature this frame.
Foes.fire = function (f, kind, speed, dmg, o) {
  const a = Math.atan2(Player.y - 10 - (f.y - 10), Player.x - f.x);
  this.shots.push(Object.assign({ x: f.x, y: f.y - 10, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 1.8, dmg, fx: f.x, fy: f.y, kind, pkb: f.def.kb || 1 }, o || {}));
};
Foes.keepAway = function (f, d, dx, dy, speed, near) { if (d < near) this.move(f, -dx / d * speed, -dy / d * speed); this.face(f, dx, dy); };

Foes.AI = {
  lunge(f, d, dx, dy) { if (f.cool <= 0 && d < 85 && d > 22 && this.losClear(f)) { this.face(f, dx, dy); f.state = 'windup'; f.t = 0.35; f.atk = 'lunge'; return true; } return false; },
  thrower(f, d, dx, dy, dt, speed) {
    if (d > 140) return false;
    this.keepAway(f, d, dx, dy, speed, 70);
    if (f.cool <= 0 && this.losClear(f)) { f.state = 'windup'; f.t = 0.5; f.atk = 'spear'; }
    return true;
  },
  bomber(f, d, dx, dy, dt, speed) {
    if (d > 170) return false;
    this.keepAway(f, d, dx, dy, speed, 80);
    if (f.cool <= 0) { f.state = 'windup'; f.t = 0.6; f.atk = 'lob'; }
    return true;
  },
  imp(f, d, dx, dy, dt, speed) {
    if (d > 160) return false;
    this.keepAway(f, d, dx, dy, speed, 65);
    if (f.cool <= 0 && this.losClear(f)) { f.state = 'windup'; f.t = 0.5; f.atk = 'fireball'; }
    return true;
  },
  healer(f, d, dx, dy, dt, speed) {
    f.healT = (f.healT === undefined ? 1.5 : f.healT) - dt;
    if (f.healT <= 0) {
      const ally = this.list.filter(o => o !== f && o.hp < o.max && Math.hypot(o.x - f.x, o.y - f.y) < 140).sort((a, b) => a.hp / a.max - b.hp / b.max)[0];
      if (ally) { ally.hp = Math.min(ally.max, ally.hp + ally.max * 0.25); VFX.beam(f, ally, '#7ad07a'); VFX.burst('heal', ally.x, ally.y - 12, 8, 20); Sfx.play('heal_foe'); f.healT = 3; } else f.healT = 1;
    }
    if (d > 170) return false;
    this.keepAway(f, d, dx, dy, speed, 100);
    if (f.cool <= 0 && d < 150 && this.losClear(f)) { f.state = 'windup'; f.t = 0.6; f.atk = 'hexlite'; }
    return true;
  },
  witch(f, d, dx, dy, dt, speed, m) {
    f.blinkT = (f.blinkT || 0) - dt;
    if (d < 45 && f.blinkT <= 0) {
      for (let i = 0; i < 20; i++) {
        const a = Math.random() * 6.28, x = Math.floor((f.x + Math.cos(a) * 110) / TILE), y = Math.floor((f.y + Math.sin(a) * 110) / TILE);
        if (!World.solid(m, x, y)) { VFX.burst('hex', f.x, f.y - 10, 14, 40); VFX.burst('smoke', f.x, f.y - 8, 8, 20); f.x = x * TILE + 8; f.y = y * TILE + 12; VFX.burst('hex', f.x, f.y - 10, 14, 40); Sfx.play('blink'); break; }
      }
      f.blinkT = 4;
      return true;
    }
    if (d > 180) return false;
    this.keepAway(f, d, dx, dy, speed, 90);
    if (f.cool <= 0 && this.losClear(f)) { f.state = 'windup'; f.t = 0.6; f.atk = 'hex'; }
    return true;
  },
  wraith(f, d, dx, dy) { if (f.cool <= 0 && d < 55) { this.face(f, dx, dy); f.state = 'windup'; f.t = 0.85; f.atk = 'nova'; return true; } return false; },
  spider(f, d, dx, dy, dt) {
    f.webT = (f.webT || 0) - dt;
    if (f.cool <= 0 && f.webT <= 0 && d > 45 && d < 140 && this.losClear(f)) { this.face(f, dx, dy); f.state = 'windup'; f.t = 0.45; f.atk = 'web'; f.webT = 3.5; return true; }
    return false;
  },
  ogre(f, d, dx, dy) {
    if (f.cool <= 0 && d > 45 && d < 170 && this.losClear(f)) { this.face(f, dx, dy); f.state = 'windup'; f.t = 0.85; f.atk = 'charge'; f.chargeA = Math.atan2(dy, dx); return true; }
    return false;
  },
  spores(f, d, dx, dy, dt, speed) {
    if (d > 140) return false;
    this.face(f, dx, dy);
    if (f.cool <= 0 && this.losClear(f)) { f.state = 'windup'; f.t = 0.7; f.atk = 'spores'; }
    if (d > 70) this.move(f, dx / d * speed, dy / d * speed);
    return true;
  },
};

Foes.ATTACK = {
  lunge(f) { const a = Math.atan2(Player.y - f.y, Player.x - f.x); f.vx = Math.cos(a) * 240; f.vy = Math.sin(a) * 240; f.dashT = 0.25; f.dashHit = false; VFX.burst('dust', f.x, f.y, 6, 30); Sfx.play('lunge'); },
  charge(f) { f.vx = Math.cos(f.chargeA) * 290; f.vy = Math.sin(f.chargeA) * 290; f.dashT = 0.55; f.dashHit = false; Sfx.play('charge'); },
  spear(f) { this.fire(f, 'spear', 175, f.dmg); Sfx.play('throw'); },
  fireball(f) { this.fire(f, 'fireball', 140, f.dmg, { effect: 'burn', hazard: 'fire' }); Sfx.play('spell_fire'); },
  hex(f) { this.fire(f, 'hex', 105, f.dmg, { homing: 2.4, life: 3.2, effect: 'slow' }); Sfx.play('magic'); },
  hexlite(f) { this.fire(f, 'hex', 120, f.dmg, { life: 2 }); Sfx.play('magic'); },
  web(f) { this.fire(f, 'web', 170, f.dmg * 0.4, { effect: 'root' }); Sfx.play('spit'); },
  lob(f) {
    const tx = Player.x, ty = Player.y - 4;
    this.shots.push({ lob: true, sx: f.x, sy: f.y - 10, tx, ty, x: f.x, y: f.y - 10, vx: tx - f.x, vy: ty - f.y, life: 1, total: 1, kind: 'bomb', aoe: 34, dmg: f.dmg * 1.3, fx: f.x, fy: f.y });
    Sfx.play('throw');
  },
  nova(f, d) {
    VFX.explosion(f.x, f.y - 6, 62, 'frost'); Sfx.play('frost');
    if (d < 62) { Combat.hitKind = 'magic'; Combat.hurtPlayer(f.dmg, f.x, f.y); Combat.hitKind = null; Combat.applyStatus('slow', 3); }
  },
  spores(f) {
    this.hazards.push({ x: Player.x, y: Player.y - 4, r: 30, t: 4, t0: 4, kind: 'spore' });
    // A puff from the mushroom's cap, then a burst of spores where the pool will spread.
    VFX.burst('spore', f.x, f.y - 12, 14, 35); VFX.burst('spore', Player.x, Player.y - 6, 28, 55); VFX.burst('smoke', Player.x, Player.y - 4, 8, 20);
    Sfx.play('spores');
  },
};

Foes.hazards = [];
Foes.updateHazards = function (dt) {
  for (const h of this.hazards) {
    h.t -= dt;
    if (Math.random() < 0.5) VFX.emit(h.kind === 'fire' ? 'flame' : 'spore', h.x + (Math.random() - 0.5) * h.r * 1.6, h.y + (Math.random() - 0.5) * h.r);
    if (Math.hypot(Player.x - h.x, Player.y - 4 - h.y) < h.r && Combat.roll <= 0) Combat.applyStatus(h.kind === 'fire' ? 'burn' : 'poison', 1.2);
  }
  this.hazards = this.hazards.filter(h => h.t > 0);
};
Foes.drawHazards = function (g) {
  for (const h of this.hazards) {
    const a = Math.min(1, h.t) * (h.kind === 'fire' ? 0.25 : 0.3);
    g.fillStyle = h.kind === 'fire' ? `rgba(255,120,40,${a})` : `rgba(140,200,80,${a})`;
    g.beginPath(); g.ellipse(Math.round(h.x), Math.round(h.y), h.r, h.r * 0.6, 0, 0, 6.29); g.fill();
  }
};

// ---- Where they live ---------------------------------------------------------------
PIT_TIERS[0][1].push('goblin', 'sporeling');
PIT_TIERS[1][1].push('goblin_spear', 'spider', 'bomber', 'imp', 'goblin', 'slime');
PIT_TIERS[2][1].push('shaman', 'witch', 'wraith', 'spider', 'bomber');
PIT_TIERS[3][1].push('ogre', 'witch', 'wraith', 'imp', 'shaman');

const buildBefore = World.build.bind(World);
World.build = function () {
  buildBefore();
  const add = (id, list) => { const m = this.maps[id]; m.spawns = (m.spawns || []).concat(list); };
  add('greywood', [
    { t: 'goblin', x: 22, y: 26, n: 3, r: 3 }, { t: 'goblin_spear', x: 18, y: 22, n: 2, r: 2 }, { t: 'shaman', x: 20, y: 24, n: 1, r: 1 },
    { t: 'spider', x: 75, y: 49, n: 2, r: 2 }, { t: 'witch', x: 14, y: 9, n: 1, r: 0 }, { t: 'slime', x: 12, y: 8, n: 2, r: 2 }, { t: 'sporeling', x: 45, y: 8, n: 2, r: 3 },
  ]);
  add('ironback', [{ t: 'ogre', x: 44, y: 14, n: 1, r: 2 }, { t: 'bomber', x: 24, y: 20, n: 2, r: 3 }, { t: 'goblin', x: 26, y: 24, n: 2, r: 3 }]);
};
// The Deep Mine grows stranger the deeper you go.
Mine.creatures = floor => floor < 8 ? ['bat', 'rockcrab', 'slime', 'spider', 'bat'] : floor < 20 ? ['gloomling', 'spider', 'sporeling', 'slime', 'imp', 'bat'] : ['gloomling', 'drowned', 'imp', 'wraith', 'witch', 'gloomling'];
