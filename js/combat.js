'use strict';
// Real-time combat: the player's attacks and dodges, enemy behaviour, and the
// world objects added for exploration.

const Combat = {
  status: {},
  cool: 0, roll: 0, rollX: 0, rollY: 0, inv: 0, hurt: 0, stamWait: 0, sneaking: false,

  maxHP() { return Math.round((100 + S.skills.strength.lvl * 8 + Arena.hpBonus() + Armor.hp()) * Arena.hpMul()); },
  maxStam() { return 60 + S.skills.strength.lvl * 4 + Arena.stamBonus(); },
  // Burning, poison, slowing and webs. Rolling shakes a web loose.
  applyStatus(kind, t) { if (this.roll > 0 && kind !== 'burn') return; this.status[kind] = Math.max(this.status[kind] || 0, t); },
  tickStatus(dt) {
    const st = this.status;
    for (const k in st) st[k] = Math.max(0, st[k] - dt);
    st.dotT = (st.dotT || 0) - dt;
    if (st.dotT <= 0 && (st.burn > 0 || st.poison > 0)) { st.dotT = 0.5; S.hp -= (st.burn > 0 ? 2.5 : 0) + (st.poison > 0 ? 1.5 : 0); }
    VFX.statusTick(dt, Player.x, Player.y, st, 'player');
  },
  speed() { if (this.status.root > 0) return 0; return (this.status.slow > 0 ? 0.6 : 1) * (S.energy <= 0 ? 52 : WALK_SPEED) * (this.sneaking ? 0.55 : 1) * (Horse.on ? Horse.speed() : 1) * Arena.mul('speed'); },

  // Returns true while the player cannot act (mid-roll).
  updatePlayer(dt) {
    this.cool = Math.max(0, this.cool - dt);
    this.inv = Math.max(0, this.inv - dt);
    this.hurt = Math.max(0, this.hurt - dt);
    this.stamWait -= dt;
    this.tickStatus(dt);
    if (this.stamWait <= 0) S.stam = Math.min(this.maxStam(), S.stam + 34 * dt);
    if (S.hp <= 0 && !Game.fadeState) { if (Arena.active) Arena.onDeath(); else Game.defeat(); return true; }

    if (this.roll > 0) {
      this.roll -= dt;
      Player.moveAxis(this.rollX * 235 * dt, 0);
      Player.moveAxis(0, this.rollY * 235 * dt);
      Player.frameT += dt * 22;
      Player.moving = true;
      Player.afterMove();
      return true;
    }
    Horse.tick(dt);
    if (Input.hit('ride')) Horse.toggle();
    if (Input.hit('sneak')) { Horse.dismount(); this.sneaking = !this.sneaking; toast(this.sneaking ? 'Sneaking.' : 'No longer sneaking.'); Sfx.play('click'); }
    if (Input.hit('dodge') && Player.swing <= 0) { Horse.dismount(); this.dodge(); }
    return this.roll > 0;
  },

  dodge() {
    this.status.root = 0;
    const cost = 16 * Arena.mul('dodge');
    if (S.stam < cost) { toast('Too winded to roll.'); return; }
    let dx = 0, dy = 0;
    if (Input.isDown('left')) dx--; if (Input.isDown('right')) dx++;
    if (Input.isDown('up')) dy--; if (Input.isDown('down')) dy++;
    if (!dx && !dy) { dx = DX[Player.dir]; dy = DY[Player.dir]; }
    const len = Math.hypot(dx, dy);
    this.rollX = dx / len; this.rollY = dy / len;
    this.roll = 0.26; this.inv = Math.max(this.inv, 0.34);
    S.stam -= cost; this.stamWait = 0.7;
    Sfx.play('dodge');
  },

  attack(slot, fromMouse) {
    const it = ITEMS[slot.id], w = it.w;
    if (this.cool > 0) return;
    if (S.stam < w.stam) { toast('Too winded.'); return; }
    let angle = Math.atan2(DY[Player.dir], DX[Player.dir]);
    if (fromMouse) {
      const mx = Input.mouse.x + Render.cam.x, my = Input.mouse.y + Render.cam.y;
      angle = Math.atan2(my - (Player.y - 10), mx - Player.x);
      const c = Math.cos(angle), s = Math.sin(angle);
      Player.dir = Math.abs(c) > Math.abs(s) ? (c > 0 ? DIRS.right : DIRS.left) : (s > 0 ? DIRS.down : DIRS.up);
    }
    if (w.ranged && !w.free) {
      if (!Inv.count('arrow')) { toast('You have no arrows.'); return; }
      Inv.remove('arrow', 1);
    }
    S.stam -= w.stam; this.stamWait = 0.55; this.cool = w.cool / Arena.mul('atk');
    Player.swing = Math.max(0.15, this.cool * 0.75); Player.swingMax = Player.swing; Player.swingTool = slot.id; Player.swingDir = Player.dir;
    Sfx.play(w.ranged ? (w.aoe || w.color ? 'magic_cast' : 'shoot') : 'swing', w);
    const power = () => (w.dmg + S.skills.strength.lvl * 1.5) * (0.9 + Math.random() * 0.2) * Arena.mul('dmg');
    const kb = w.kb * Arena.mul('kb');
    if (!w.ranged) {
      const col = Tokens.slash(slot.id) || (w.burn ? '#ff8a30' : w.slow ? '#9ad8ff' : w.chain ? '#f7e26b' : w.lifesteal ? '#c43050' : '#f0ece0');
      VFX.slash(Player.x, Player.y - 10, angle, w.arc || 1.6, w.reach, col);
    }
    if (w.ranged) {
      const n = w.multishot || 1, sp = w.speed || 270;
      for (let i = 0; i < n; i++) {
        const a = angle + (i - (n - 1) / 2) * (w.spread || 0);
        Foes.shots.push({ x: Player.x, y: Player.y - 10, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.2, mine: true, dmg: power(), kb, pierce: w.pierce, aoe: w.aoe, color: w.color, w, hit: [], kind: w.shot || 'arrow', icon: w.shot === 'axe' ? 'throwing_axes' : null });
      }
      return;
    }
    for (const f of [...Foes.list]) {
      const dx = f.x - Player.x, dy = f.y - 8 - (Player.y - 10), dist = Math.hypot(dx, dy);
      if (dist > w.reach + 6) continue;
      let diff = Math.atan2(dy, dx) - angle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      if (Math.abs(diff) <= w.arc / 2 || dist < 12) Foes.damage(f, power(), Math.atan2(dy, dx), kb, w.sneak || 3, w);
    }
  },

  // kb scales how far the hit throws you (1 = the usual shove).
  hurtPlayer(dmg, fromX, fromY, kb = 1) {
    if (this.inv > 0 || Game.fadeState) return;
    dmg *= Arena.mul('taken');
    S.hp -= dmg;
    if (Arena.active) Arena.onHurt(dmg);
    Horse.throwOff();
    this.inv = 0.7; this.hurt = 0.7;
    Sfx.play('hurt');
    FX.text(Player.x, Player.y - 30, '-' + Math.round(dmg), '#ff8070');
    const a = Math.atan2(Player.y - fromY, Player.x - fromX);
    for (let i = 0; i < 6; i++) { Player.moveAxis(Math.cos(a) * 3 * kb, 0); Player.moveAxis(0, Math.sin(a) * 3 * kb); }
    if (this.sneaking) { this.sneaking = false; }
    Foes.alertNear(Player.x, Player.y, 90);
  },
};

const Foes = {
  list: [], shots: [], mapId: null,

  enter(m) {
    if (this.mapId === m.id) return;
    this.mapId = m.id; this.list = []; this.shots = []; this.hazards = [];
    (m.spawns || []).forEach((sp, i) => {
      if (sp.if && !sp.if()) return;
      if (FOES[sp.t].unique && S.dead[sp.t]) return;
      if (!m.transient && S.slain[m.id + i] === absDay()) return;
      for (let n = 0; n < sp.n; n++) {
        for (let tries = 0; tries < 12; tries++) {
          const x = sp.x + Math.floor((Math.random() * 2 - 1) * sp.r), y = sp.y + Math.floor((Math.random() * 2 - 1) * sp.r);
          if (!World.solid(m, x, y)) { this.spawn(sp.t, x * TILE + 8, y * TILE + 12, { sp: i, scale: sp.scale }); break; }
        }
      }
    });
  },

  spawn(type, x, y, o = {}) {
    const def = FOES[type], k = o.scale || 1;
    const f = { type, def, x, y, hx: x, hy: y, hp: def.hp * k, max: def.hp * k, dmg: def.dmg * k, dir: rnd(0, 3), state: 'idle', t: 0, cool: 0, aware: 0, flash: 0, stun: 0, vx: 0, vy: 0, wander: 0, frame: 0, spawnIdx: o.sp, npc: o.npc, arena: o.arena, lost: 0, slamT: 3, repath: 0, path: null };
    this.list.push(f);
    if (o.alert) this.alert(f);
    return f;
  },

  isCalm(f) { return f.def.camp && Memory.get('camp_deal'); },

  alert(f) {
    if (f.state === 'chase' || f.state === 'windup' || f.state === 'slam') return;
    f.state = 'chase'; f.aware = 1; f.bubble = 0.8; f.lost = 0;
    if (f.def.disguise) Sfx.play('charge');
  },
  alertNear(x, y, r) { this.list.forEach(f => { if (!this.isCalm(f) && Math.hypot(f.x - x, f.y - y) < r) this.alert(f); }); },
  alertAll() { this.list.forEach(f => { if (f.def.camp) this.alert(f); }); },

  losClear(f) {
    const m = Player.map, dx = Player.x - f.x, dy = Player.y - f.y, d = Math.hypot(dx, dy), n = Math.ceil(d / 8);
    for (let i = 1; i < n; i++) {
      const x = f.x + dx * i / n, y = f.y - 6 + dy * i / n;
      if (World.solid(m, Math.floor(x / TILE), Math.floor(y / TILE))) return false;
    }
    return true;
  },

  // Foes see in a cone, and sneaking shortens how far.
  canSee(f, d) {
    if (Arena.buff('phantom')) return false;
    // A gaoler's uniform fools gaolers, unless they get close.
    if (f.def.gaoler && Inv.count('gaol_uniform') && d > 28) return false;
    const stealth = S.skills.stealth.lvl;
    let range = f.def.vision * (Combat.sneaking ? 0.5 : 1) * (1 - stealth * 0.03);
    if (!Player.map.indoor && Render.darkness() > 0.5) range *= 0.8;
    if (d > range) return false;
    if (d > (Combat.sneaking ? 12 : 26)) {
      const fx = DX[f.dir], fy = DY[f.dir], dot = ((Player.x - f.x) * fx + (Player.y - f.y) * fy) / (d || 1);
      if (dot < 0.42) return false;
    }
    return this.losClear(f);
  },

  move(f, dx, dy) {
    if (!isFinite(dx) || !isFinite(dy)) return;
    const m = Player.map, free = (x, y) => [[-5, -5], [5, -5], [-5, 0], [5, 0]].every(([ox, oy]) => !World.solid(m, Math.floor((x + ox) / TILE), Math.floor((y + oy) / TILE)));
    if (free(f.x + dx, f.y)) f.x += dx; else f.blocked = true;
    if (free(f.x, f.y + dy)) f.y += dy; else f.blocked = true;
  },
  face(f, dx, dy) { f.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? DIRS.right : DIRS.left) : (dy > 0 ? DIRS.down : DIRS.up); },

  update(dt) {
    const m = Player.map;
    for (const f of this.list) {
      // A foe whose position went bad is put back where it last stood.
      if (!isFinite(f.x) || !isFinite(f.y)) { f.x = isFinite(f.lx) ? f.lx : f.hx; f.y = isFinite(f.ly) ? f.ly : f.hy; f.vx = f.vy = 0; f.dashT = 0; }
      f.lx = f.x; f.ly = f.y;
      // Standing exactly on you must not divide by zero: lean a hair to one side.
      let dx = Player.x - f.x, dy = Player.y - f.y;
      if (Math.abs(dx) + Math.abs(dy) < 0.01) { dx = 0.01; dy = 0.005; }
      const d = Math.hypot(dx, dy), def = f.def;
      f.flash = Math.max(0, f.flash - dt); f.cool = Math.max(0, f.cool - dt); f.bubble = Math.max(0, (f.bubble || 0) - dt);
      f.frame += dt * 5;
      // Burning and slowing, from the Pit's weapons, flasks and blessings.
      if (f.slowT > 0) f.slowT -= dt;
      if (f.burnT > 0) {
        f.burnT -= dt; f.burnTick = (f.burnTick || 0) - dt;
        if (f.burnTick <= 0) { f.burnTick = 0.5; f.hp -= 5 * Arena.mul('dmg'); if (f.hp <= 0) { this.kill(f); continue; } }
      }
      if (f.stunT > 0) f.stunT -= dt;
      VFX.statusTick(dt, f.x, f.y, { burn: f.burnT, slow: f.slowT }, f.type + f.spawnIdx + Math.round(f.hx));
      // A lunge or a charge carries on until it ends or hits a wall.
      if (f.dashT > 0) {
        f.dashT -= dt; f.blocked = false; this.move(f, f.vx * dt, f.vy * dt);
        if (Math.random() < 0.5) VFX.emit('dust', f.x, f.y);
        if (!f.dashHit && Math.hypot(Player.x - f.x, Player.y - f.y) < 18) { f.dashHit = true; Combat.hurtPlayer(f.dmg * (def.ai === 'ogre' ? 1.3 : 1), f.x, f.y, def.kb || 1); }
        if (f.blocked && (def.ai === 'ogre' || def.wallStun)) { f.dashT = 0; f.stun = def.wallStun || 1; f.stunT = f.stun; f.vx = f.vy = 0; VFX.burst('spark', f.x, f.y - 12, 10, 60); Sfx.speakAs(f.type, () => { Sfx.play('thud'); if (def.onWall) def.onWall.call(this, f); }); }
        continue;
      }
      if (Arena.buff('phantom')) { if (f.state !== 'idle') { f.state = 'idle'; f.aware = 0; } }
      // In the Pit there is nowhere to hide: once the veil drops, everything hunts you again.
      else if (f.arena && f.state === 'idle') this.alert(f);
      if (f.stun > 0) {
        f.stun -= dt; this.move(f, f.vx * dt, f.vy * dt); f.vx *= 0.9; f.vy *= 0.9;
        continue;
      }
      if (f.state === 'idle') {
        f.wander -= dt;
        if (f.wander <= 0) {
          f.wander = 1 + Math.random() * 3;
          const a = Math.random() * 6.28;
          f.wx = Math.random() < 0.4 ? 0 : Math.cos(a); f.wy = f.wx === 0 ? 0 : Math.sin(a);
          if (f.wx || f.wy) this.face(f, f.wx, f.wy);
        }
        if (!def.disguise && (f.wx || f.wy) && Math.hypot(f.x - f.hx, f.y - f.hy) < 90) this.move(f, f.wx * def.speed * 0.3 * dt, f.wy * def.speed * 0.3 * dt);
        if (this.isCalm(f)) continue;
        if (this.canSee(f, d)) {
          f.aware += dt * (d < 50 ? 4 : 2.2);
          if (f.aware >= 1) { this.alert(f); this.alertNear(f.x, f.y, 70); }
        } else f.aware = Math.max(0, f.aware - dt * 0.8);
        continue;
      }
      if (f.state === 'windup') {
        f.t -= dt;
        if (f.t <= 0) this.strike(f, d);
        continue;
      }
      if (f.state === 'slam') {
        f.t -= dt;
        if (f.t <= 0) {
          Sfx.speakAs(f.type, () => Sfx.play('slam'));
          FX.burst(f.x, f.y - 4, '#c8d8e0', 16);
          if (typeof Quake !== 'undefined') Quake.hit(f.x, f.y, 72, Quake.theme(f));
          if (d < 72) Combat.hurtPlayer(f.dmg * 1.3, f.x, f.y);
          f.state = 'chase'; f.cool = 0.5; f.slamT = 3.5 + Math.random() * 2;
        }
        continue;
      }
      // Chasing
      if (!f.arena && (d > def.vision * 2.6 || !this.losClear(f))) { f.lost += dt; if (f.lost > 4) { f.state = 'idle'; f.aware = 0; f.lost = 0; continue; } } else f.lost = 0;
      const enraged = def.boss && f.hp < f.max / 2;
      const speed = def.speed * (enraged ? 1.35 : 1) * (f.slowT > 0 ? 0.5 : 1) * dt;
      if (def.ai && this.AI[def.ai] && this.AI[def.ai].call(this, f, d, dx, dy, dt, speed, m)) continue;
      if (def.slam) {
        f.slamT -= dt;
        if (f.slamT <= 0 && d < 150) { f.state = 'slam'; f.t = 0.9; f.bubble = 0.9; continue; }
      }
      if (def.ranged) {
        if (d < 60) this.move(f, -dx / d * speed, -dy / d * speed);
        else if (d > def.reach * 0.8) this.chase(f, dx, dy, d, speed, m, dt);
        this.face(f, dx, dy);
        if (f.cool <= 0 && d < def.reach && this.losClear(f)) { f.state = 'windup'; f.t = 0.55; }
        continue;
      }
      if (d <= def.reach && f.cool <= 0) { this.face(f, dx, dy); f.state = 'windup'; f.t = def.windup || 0.38; continue; }
      if (d > def.reach - 6) this.chase(f, dx, dy, d, speed, m, dt);
      if (def.wobble) this.move(f, Math.sin(f.frame * 3) * 34 * dt, Math.cos(f.frame * 2.3) * 34 * dt);
    }
    this.updateShots(dt, m);
    this.updateHazards(dt);
  },

  chase(f, dx, dy, d, speed, m, dt) {
    this.face(f, dx, dy);
    if (this.losClear(f)) { f.path = null; this.move(f, dx / d * speed, dy / d * speed); return; }
    f.repath -= dt;
    if ((!f.path || f.repath <= 0) && d < 320) {
      f.repath = 0.5;
      f.path = World.path(m, Math.floor(f.x / TILE), Math.floor(f.y / TILE), Math.floor(Player.x / TILE), Math.floor((Player.y - 3) / TILE));
    }
    if (f.path && f.path.length) {
      const [tx, ty] = f.path[0], gx = tx * TILE + 8, gy = ty * TILE + 10, ox = gx - f.x, oy = gy - f.y, od = Math.hypot(ox, oy);
      if (od < 4) f.path.shift(); else this.move(f, ox / od * speed, oy / od * speed);
    }
  },

  strike(f, d) {
    const def = f.def, atk = f.atk;
    f.state = 'chase'; f.cool = def.cool; f.atk = null;
    if (atk && this.ATTACK[atk]) return this.ATTACK[atk].call(this, f, d);
    if (def.ranged) { this.fire(f, def.shot || 'arrow', 150, f.dmg, { life: 1.6 }); Sfx.play('shoot'); return; }
    Sfx.play('foe_swing');
    if (!(typeof BossFX !== 'undefined' && BossFX.slash(f, f.x, f.y - 10, Math.atan2(Player.y - f.y, Player.x - f.x), 1.6, def.reach))) VFX.slash(f.x, f.y - 10, Math.atan2(Player.y - f.y, Player.x - f.x), 1.6, def.reach, '#ff9080');
    if (d < def.reach + 8) { const was = Combat.inv; Combat.hurtPlayer(f.dmg, f.x, f.y, def.kb || 1); if (was <= 0 && typeof BossFX !== 'undefined') BossFX.struck(f); if (def.poison) Combat.applyStatus('poison', 3); }
  },

  updateShots(dt, m) {
    for (const s of this.shots) {
      VFX.trail(s, dt);
      // A lobbed bomb arcs to where you were standing, then goes off.
      if (s.lob) {
        s.life -= dt;
        const p = 1 - Math.max(0, s.life) / s.total;
        s.x = s.sx + (s.tx - s.sx) * p; s.y = s.sy + (s.ty - s.sy) * p; s.h = Math.sin(p * Math.PI) * 34;
        if (s.life <= 0) {
          VFX.explosion(s.tx, s.ty, s.aoe, s.boomKind || 'blast'); Sfx.speakAs(s.voice, () => Sfx.play(s.kind === 'glob' ? 'splat' : s.kind === 'bomb' && !s.voice ? 'bomb_blast' : 'boom'));
          if (s.kind === 'bomb' && !s.voice && typeof Bomb !== 'undefined') Bomb.blast(s.tx, s.ty, s.aoe);
          if (Math.hypot(Player.x - s.tx, Player.y - 4 - s.ty) < s.aoe) Combat.hurtPlayer(s.dmg, s.tx, s.ty, s.pkb || 1);
          if (s.pool) this.hazards.push({ x: s.tx, y: s.ty, r: s.poolR || 22, t: s.poolT || 4, kind: s.pool });
        }
        continue;
      }
      if (s.homing && !s.mine) {
        const want = Math.atan2(Player.y - 10 - s.y, Player.x - s.x), now = Math.atan2(s.vy, s.vx), sp = Math.hypot(s.vx, s.vy);
        let diff = Math.atan2(Math.sin(want - now), Math.cos(want - now));
        const turn = now + clamp(diff, -s.homing * dt, s.homing * dt);
        s.vx = Math.cos(turn) * sp; s.vy = Math.sin(turn) * sp;
      }
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
      if (World.solid(m, Math.floor(s.x / TILE), Math.floor((s.y + 10) / TILE)) && !this.overWater(m, s)) { s.life = 0; if (s.hazard) this.hazards.push({ x: s.x, y: s.y + 8, r: 22, t: 2.5, kind: s.hazard }); continue; }
      if (s.mine) {
        const hit = this.list.find(f => Math.hypot(f.x - s.x, f.y - 8 - s.y) < 12 && !(s.hit && s.hit.includes(f)));
        if (hit) {
          if (s.aoe) { s.boom = true; s.life = 0; Arena.explode(s); }
          else { this.damage(hit, s.dmg, Math.atan2(s.vy, s.vx), s.kb, 3, s.w); if (s.pierce) s.hit.push(hit); else s.life = 0; }
        }
      } else if (Math.hypot(Player.x - s.x, Player.y - 10 - s.y) < 10) {
        const was = Combat.inv;
        Combat.hitKind = MAGIC_SHOTS[s.kind] ? 'magic' : null;
        Combat.hurtPlayer(s.dmg, s.fx, s.fy, s.pkb || 1);
        Combat.hitKind = null;
        if (was <= 0 && MAGIC_SHOTS[s.kind] && typeof MagicHit !== 'undefined') MagicHit.on(s.kind);
        if (was <= 0 && s.effect) Combat.applyStatus(s.effect, s.effect === 'root' ? 1.2 : 3);
        if (s.kind === 'fireball') VFX.explosion(s.x, s.y, 14, 'fire');
        if (s.hazard) this.hazards.push({ x: Player.x, y: Player.y - 4, r: 22, t: 2.5, kind: s.hazard });
        if (Combat.inv < 0.65) s.life = 0;
      }
    }
    for (const s of this.shots) if (s.life <= 0 && s.aoe && !s.boom) { s.boom = true; Arena.explode(s); }
    this.shots = this.shots.filter(s => s.life > 0);
  },
  overWater(m, s) { return World.g(m, Math.floor(s.x / TILE), Math.floor((s.y + 10) / TILE)) === T.W; },

  damage(f, amount, angle, kb, sneakMult, w) {
    const unaware = f.state === 'idle' && f.aware < 1;
    let dmg = amount;
    if (unaware) {
      dmg *= sneakMult; FX.text(f.x, f.y - 34, 'Sneak attack!', '#ffe08a');
      gainXP('stealth', 15);
    }
    if (f.arena) dmg = Arena.hitIn(f, dmg, w);
    f.hp -= dmg; f.flash = 0.14;
    if (f.arena && w) Arena.hitOut(f, dmg, w);
    // Light foes flinch out of an attack. Heavy ones finish the swing anyway.
    const heavy = f.def.heavy, resist = f.def.boss ? 0.15 : heavy ? 0.4 : 0.7;
    if (!(heavy && f.state === 'windup')) { f.stun = 0.09 * resist; f.vx = Math.cos(angle) * kb * 0.55 * resist; f.vy = Math.sin(angle) * kb * 0.55 * resist; }
    if (f.state === 'windup' && !heavy) { f.state = 'chase'; f.cool = 0.35; }
    if (f.state !== 'slam') this.alert(f);
    this.alertNear(f.x, f.y, 60);
    if (f.def.camp && Memory.get('camp_deal') && !f.arena) {
      Memory.flag('camp_deal', false); Memory.flag('camp_war_broken');
      Memory.deed('broke_deal', 'Broke your deal and attacked Rusk\'s people.', { gossip: true, witness: ['rusk'] });
      toast('You broke your word with the camp.');
      this.alertAll();
    }
    Sfx.play('hit', f);
    FX.text(f.x, f.y - 26, String(Math.round(dmg)), '#ffffff');
    FX.burst(f.x, f.y - 10, f.def.undead ? '#7dbbe6' : f.def.human ? '#c43030' : '#a0c070', 5);
    VFX.burst('spark', f.x, f.y - 10, 4, 60);
    gainXP('strength', 1);
    if (f.hp <= 0) this.kill(f);
  },

  // Somewhere near (x, y) a foe can stand and move from, or (x, y) itself.
  freeSpot(x, y) {
    const m = Player.map, ok = (px, py) => [[-5, -5], [5, -5], [-5, 0], [5, 0]].every(([ox, oy]) => !World.solid(m, Math.floor((px + ox) / TILE), Math.floor((py + oy) / TILE)));
    for (let r = 0; r <= 24; r += 4) for (let a = 0; a < 8; a++) {
      const px = x + Math.cos(a * 0.785) * r, py = y + Math.sin(a * 0.785) * r;
      if (ok(px, py)) return [px, py];
    }
    return [x, y];
  },

  kill(f) {
    if (f.dead) return;
    f.dead = true;
    this.list = this.list.filter(x => x !== f);
    const def = f.def, m = Player.map;
    Sfx.play('kill', f);
    FX.burst(f.x, f.y - 10, '#8a7a60', 12);
    // Slimes come apart into smaller slimes, never inside a wall.
    if (def.split) for (let i = 0; i < 2; i++) { const [sx, sy] = this.freeSpot(f.x + (i ? 8 : -8), f.y); const s = this.spawn('slimelet', sx, sy, { alert: true, arena: f.arena }); if (f.arena) { s.hp = s.max = s.def.hp * (f.max / def.hp); } }
    // Arena fights never touch the story, your kill tally or anyone's fate.
    if (f.arena) return Arena.onKill(f);
    if (!m.transient && f.spawnIdx !== undefined) S.slain[m.id + f.spawnIdx] = absDay();
    S.kills[f.type] = (S.kills[f.type] || 0) + 1;
    if (def.unique) S.dead[f.type] = absDay();
    gainXP('strength', def.xp);
    const gold = Math.round(rnd(def.gold[0], def.gold[1]) * (1 + Armor.goldBonus()));
    if (gold) { S.gold += gold; toast(`+${gold} gold`); }
    def.drops.forEach(([id, a, b, chance]) => { if (Math.random() < chance) Inv.add(id, rnd(a, b)); });
    Quests.event('kill', f.type);
    if (!def.nonlethal) Memory.deed('slew_' + f.type, `Killed your first ${def.name}.`);
    if (def.nonlethal) Crime.guardDown(f);
    else if (def.human && !def.undead) {
      Memory.deed('killed_human', 'Took a human life on the road.', { gossip: true, rep: { town: -1 } });
      if (f.type === 'rusk') Memory.deed('killed_rusk', 'Killed Rusk, master of the south road.', { gossip: true, rep: { crown: 2, town: 1 } });
    }
    Story.onKill(f);
    if (f.type === 'warden') Memory.deed('killed_warden', 'Put down the Warden of the Old Keep.', { gossip: true });
  },

  boss() { return this.list.find(f => f.def.boss && f.state !== 'idle'); },

  drawFoe(g, f) {
    const def = f.def, moving = f.state === 'chase' || f.state === 'idle', flip = f.dir === DIRS.left;
    const blink = f.flash > 0 || ((f.state === 'windup' || f.state === 'slam') && Math.floor(f.t * 18) % 2 === 0);
    let img;
    if (def.human) img = Art.charFrame('foe_' + f.type, def.look, f.dir, moving ? Math.floor(f.frame) % 4 : 0);
    else if (def.disguise && f.state === 'idle') img = Art.foe(f.type, 2, false);
    else img = Art.foe(f.type, Math.floor(f.frame) % 2, flip);
    const k = def.scale || 1, w = img.width * k, h = img.height * k;
    // Telegraphs: where a charge will run, where a frost nova will reach.
    if (f.state === 'windup' && f.atk === 'charge') {
      g.save(); g.translate(Math.round(f.x), Math.round(f.y - 4)); g.rotate(f.chargeA);
      g.fillStyle = `rgba(255,80,80,${0.15 + (1 - f.t / 0.85) * 0.3})`; g.fillRect(0, -7, 160, 14); g.restore();
    }
    if (f.state === 'windup' && f.atk === 'nova') { g.strokeStyle = '#9ad8ffaa'; g.beginPath(); g.arc(Math.round(f.x), Math.round(f.y - 6), 62 * (1 - f.t / 0.85), 0, 6.29); g.stroke(); g.beginPath(); g.arc(Math.round(f.x), Math.round(f.y - 6), 62, 0, 6.29); g.stroke(); }
    if (f.state === 'slam' && typeof Quake !== 'undefined') Quake.tele(g, Math.round(f.x), Math.round(f.y), 72, 1 - f.t / 0.9, Quake.theme(f));
    else if (f.state === 'slam') {
      g.strokeStyle = '#ff806088'; g.lineWidth = 1;
      g.beginPath(); g.arc(Math.round(f.x), Math.round(f.y), 72 * (1 - f.t / 0.9), 0, 7); g.stroke();
      g.beginPath(); g.arc(Math.round(f.x), Math.round(f.y), 72, 0, 7); g.stroke();
    }
    Render.shadow(g, f.x, f.y, Math.round(10 * k));
    const px = Math.round(f.x - w / 2), py = Math.round(f.y - h + 2);
    g.drawImage(img, px, py, w, h);
    if (blink) { g.globalAlpha = 0.75; g.drawImage(Art.white(img), px, py, w, h); g.globalAlpha = 1; }
    VFX.foeStatus(g, f, img, px, py, w, h);
    if (f.hp < f.max && !def.boss) {
      g.fillStyle = '#2a1a10'; g.fillRect(Math.round(f.x) - 9, py - 5, 18, 3);
      g.fillStyle = '#d4405a'; g.fillRect(Math.round(f.x) - 8, py - 4, Math.round(16 * Math.max(0, f.hp) / f.max), 1);
    }
    const mark = f.bubble > 0 ? ['!', '#ff8060'] : f.state === 'idle' && f.aware > 0.15 && !this.isCalm(f) ? ['?', '#ffe08a'] : null;
    if (mark) { Font.draw(g, mark[0], Math.round(f.x) - 1, py - 13, '#2a1a10', 2); Font.draw(g, mark[0], Math.round(f.x) - 2, py - 14, mark[1], 2); }
  },

  drawShots(g) {
    for (const s of this.shots) {
      if (s.lob) { const p = Math.max(0, s.life) / s.total; g.strokeStyle = `rgba(255,80,80,${0.4 + (1 - p) * 0.6})`; g.lineWidth = 1; g.beginPath(); g.arc(Math.round(s.tx), Math.round(s.ty), s.aoe * (0.4 + (1 - p) * 0.6), 0, 6.29); g.stroke(); }
      VFX.shot(g, s);
    }
  },
};

Object.assign(Actions, {
  chest(o) {
    if (o.needs && !S.dead[o.needs]) return UI.say(null, 'A seal of cold, wet iron holds this chest shut. It will not open while the one who guards it still stands.');
    if (S.opened[o.cid]) return;
    S.opened[o.cid] = absDay();
    Sfx.play('discover');
    if (o.loot.gold) { S.gold += o.loot.gold; toast(`+${o.loot.gold} gold`); }
    (o.loot.items || []).forEach(([id, n]) => Inv.add(id, n));
    Memory.deed('chest_' + o.cid, `Opened a hidden cache in ${Player.map.name}.`);
    Quests.pulse();
  },
  ladder() { Sfx.play('ladder'); Game.fade(() => Mine.enter(Mine.floor + 1)); },
  stairs() {
    Sfx.play('door');
    Game.fade(() => Player.place('ironback', 60 * TILE + 8, 7 * TILE + 12, DIRS.down));
  },
  mine() {
    const opts = [{ text: 'Floor 1', fn() { Game.fade(() => Mine.enter(1)); } }];
    for (let f = 5; f <= (S.mineMax || 0); f += 5) opts.push({ text: `Floor ${f}`, fn() { Game.fade(() => Mine.enter(f)); } });
    opts.push({ text: 'Not now', fn() {} });
    UI.ask(null, 'The lift cage creaks. It stops at every fifth floor you have already reached.', opts);
  },
  log(o) {
    if (Inv.count('felling_wedge')) {
      Inv.remove('felling_wedge', 1);
      Memory.flag('road_cleared');
      Memory.deed('cleared_road', 'Split the trunk across the Greywood road.');
      World.applyFlags();
      Sfx.play('tree_fall');
      FX.burst(o.x * TILE + 24, o.y * TILE + 8, '#a87c4c', 24);
      UI.say(null, 'The wedge bites, the grain gives, and the great trunk splits apart. The road south is open.', () => Quests.pulse());
      return;
    }
    UI.say(null, o.text);
  },
  irondoor() {
    if (!Inv.count('keep_key')) return UI.say(null, 'Black iron, as thick as your arm. It needs a key, and that key is somewhere in this place.');
    S.opened.keep_door = absDay();
    Inv.remove('keep_key', 1);
    World.applyFlags();
    Sfx.play('unlock');
    UI.say(null, 'The lock turns. Beyond the door, something large has stopped moving.');
  },
});
