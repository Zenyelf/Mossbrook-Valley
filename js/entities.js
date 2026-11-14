'use strict';
// The player, villagers, and everything you can press "interact" on.

const WALK_SPEED = 88;

const Player = {
  map: null, x: 0, y: 0, dir: 0, frameT: 0, moving: false, swing: 0, swingTool: null, swingDir: 0, lastBlockMsg: 0,

  place(mapId, x, y, dir) {
    const before = this.map;
    this.map = World.maps[mapId]; this.x = x; this.y = y; this.dir = dir; this.swing = 0;
    Foes.enter(this.map);
    MapView.reveal();
    if (this.map !== before && this.map.region && !Game.inTitle) { UI.banner(this.map.name); Memory.deed('found_' + mapId, `Found your way to ${this.map.name}.`); }
  },
  tile() { return { x: Math.floor(this.x / TILE), y: Math.floor((this.y - 2) / TILE) }; },

  free(x, y) {
    const m = this.map, pts = [[x - 5, y - 6], [x + 5, y - 6], [x - 5, y - 1], [x + 5, y - 1]];
    return pts.every(([px, py]) => {
      const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
      if (World.solid(m, tx, ty)) return false;
      const w = World.warpAt(m, tx, ty);
      return !(w && World.warpClosed(w));
    });
  },

  // The tile a tool or interaction will land on.
  target() {
    const t = this.tile();
    const mouse = Render.mouseTile();
    if (mouse && !UI.mouseIdle && Math.abs(mouse.x - t.x) <= 1 && Math.abs(mouse.y - t.y) <= 1 && (mouse.x !== t.x || mouse.y !== t.y)) return mouse;
    return { x: t.x + DX[this.dir], y: t.y + DY[this.dir] };
  },
  faceTile(tile) {
    const t = this.tile(), dx = tile.x - t.x, dy = tile.y - t.y;
    if (dx === 0 && dy === 0) return;
    this.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? DIRS.right : DIRS.left) : (dy > 0 ? DIRS.down : DIRS.up);
  },

  update(dt) {
    FX.update(dt);
    if (Combat.updatePlayer(dt)) return;
    if (this.swing > 0) { this.swing -= dt; this.moving = false; return; }
    let dx = 0, dy = 0;
    if (Input.isDown('left')) dx--; if (Input.isDown('right')) dx++;
    if (Input.isDown('up')) dy--; if (Input.isDown('down')) dy++;
    this.moving = !!(dx || dy);
    if (this.moving) {
      if (dx && !dy) this.dir = dx > 0 ? DIRS.right : DIRS.left;
      else if (dy && !dx) this.dir = dy > 0 ? DIRS.down : DIRS.up;
      else if (dy) this.dir = dy > 0 ? DIRS.down : DIRS.up;
      const len = Math.hypot(dx, dy), speed = Combat.speed() * dt / len;
      const ox = this.x, oy = this.y;
      this.moveAxis(dx * speed, 0);
      this.moveAxis(0, dy * speed);
      // Pushing against a wall turns you to face it, but you don't walk, and your feet make no sound.
      if (Math.abs(this.x - ox) + Math.abs(this.y - oy) < 0.01) { this.moving = false; this.frameT = 0; }
      else this.frameT += dt * 8;
      this.afterMove();
    } else this.frameT = 0;

    if (Input.hit('use') || Input.mouse.clickL) { const mouse = Input.mouse.clickL; this.aimAtMouse(mouse); this.useHeld(mouse); }
    else if (Input.hit('act') || Input.mouse.clickR) { this.aimAtMouse(Input.mouse.clickR); Interact.run(); }
    for (let i = 0; i < 10; i++) if (Input.hits.has(i === 9 ? 'Digit0' : 'Digit' + (i + 1))) S.sel = i;
    if (Input.mouse.wheel) S.sel = (S.sel + Input.mouse.wheel + 10) % 10;
  },

  aimAtMouse(fromMouse) {
    if (!fromMouse) return;
    UI.mouseIdle = false;
    const mt = Render.mouseTile(), t = this.tile();
    if (mt && Math.abs(mt.x - t.x) <= 1 && Math.abs(mt.y - t.y) <= 1) this.faceTile(mt);
  },

  moveAxis(dx, dy) {
    if (this.free(this.x + dx, this.y + dy)) { this.x += dx; this.y += dy; return; }
    // Slide around corners by nudging toward the centre of the open tile.
    for (const off of [3, 6, -3, -6]) {
      const nx = this.x + (dy ? off : 0), ny = this.y + (dx ? off : 0);
      if (this.free(nx + dx, ny + dy)) {
        const step = Math.abs(dx || dy) * Math.sign(off);
        if (dy && this.free(this.x + step, this.y)) this.x += step;
        if (dx && this.free(this.x, this.y + step)) this.y += step;
        return;
      }
    }
    // Tell the player why a door will not open.
    const ax = Math.floor((this.x + (dx ? Math.sign(dx) * 8 : 0)) / TILE), ay = Math.floor((this.y - 3 + (dy ? Math.sign(dy) * 6 : 0)) / TILE);
    const w = World.warpAt(this.map, ax, ay);
    if (w && World.warpClosed(w) && performance.now() - this.lastBlockMsg > 2000) {
      this.lastBlockMsg = performance.now(); toast(World.warpClosed(w));
    }
  },

  afterMove() {
    const t = { x: Math.floor(this.x / TILE), y: Math.floor((this.y - 3) / TILE) };
    const w = World.warpAt(this.map, t.x, t.y);
    if (w) { Game.warp(w); return; }
    const o = World.at(this.map, t.x, t.y);
    if (o && o.type === 'forage') Interact.pickup(o);
    if (t.x !== this.lastX || t.y !== this.lastY) { this.lastX = t.x; this.lastY = t.y; Quests.gotoCheck(this.map.id, t.x, t.y); MapView.reveal(); }
  },

  useHeld(fromMouse) {
    const slot = Inv.held();
    if (!slot) return;
    const it = ITEMS[slot.id], tile = this.target(), m = this.map;
    if (it.kind === 'potion') return Arena.usePotion(slot);
    if (it.kind === 'weapon' || it.kind === 'tool') Horse.dismount();
    if (it.kind === 'weapon') return Combat.attack(slot, fromMouse);
    if (it.kind === 'tool') {
      if (slot.id === 'rod') return this.cast(tile);
      const cost = ENERGY_COST[slot.id];
      if (S.energy <= -15) { toast('You are too tired to lift that.'); return; }
      this.swing = this.swingMax = 0.28; this.swingTool = slot.id; this.swingDir = this.dir;
      if (Tools.apply(slot.id, tile, this.dir, m)) Game.spend(cost);
      return;
    }
    if (it.kind === 'seed') {
      if (!Farm.soilAt(m, tile.x, tile.y)) { toast('Till the ground first.'); return; }
      if (Farm.plant(m, tile.x, tile.y, slot.id)) Inv.remove(slot.id, 1);
      return;
    }
    if (slot.id === 'fertilizer') {
      const s = Farm.soilAt(m, tile.x, tile.y);
      if (!s) return toast('Spread this on tilled soil.');
      if (s.f) return toast('Already fertilized.');
      s.f = 1; Inv.remove('fertilizer', 1); Sfx.play('plant');
      return;
    }
    if (slot.id === 'sprinkler') {
      if (m.id !== 'farm' || World.solid(m, tile.x, tile.y) || World.at(m, tile.x, tile.y) || Farm.soilAt(m, tile.x, tile.y)) return toast('You cannot place that here.');
      World.add(m, 'sprinkler', tile.x, tile.y); Inv.remove('sprinkler', 1); Sfx.play('plant');
      return;
    }
    if (slot.id === 'smoke_vial') return DLC.useSmoke();
    if (it.food || it.heal) {
      const heal = it.heal || Math.floor(it.food / 2);
      UI.ask(null, it.food ? `Eat the ${it.name}? (+${it.food} energy, +${heal} health)` : `Use the ${it.name}? (+${heal} health)`, [
        { text: it.food ? 'Eat' : 'Use', fn() { Inv.remove(slot.id, 1); Combat.status.burn = Combat.status.poison = 0; if (it.food) S.energy = Math.min(S.maxEnergy, S.energy + it.food); S.hp = Math.min(Combat.maxHP(), S.hp + heal); Sfx.play('eat'); } },
        { text: 'Not now', fn() {} },
      ]);
    }
  },

  // The label for what the held item would do on the target tile, if anything.
  usePrompt() {
    const slot = Inv.held(), m = this.map, t = this.target();
    if (!slot) return null;
    const it = ITEMS[slot.id], s = Farm.soilAt(m, t.x, t.y), o = World.at(m, t.x, t.y), ground = World.g(m, t.x, t.y);
    const out = label => ({ label, ax: t.x * TILE + 8, ay: t.y * TILE - 2 });
    if (it.kind === 'seed') return s && !s.c ? out('Plant') : null;
    if (slot.id === 'fertilizer') return s && !s.f ? out('Fertilize') : null;
    if (slot.id === 'sprinkler') return m.id === 'farm' && !World.solid(m, t.x, t.y) && !o && !s ? out('Place') : null;
    if (it.kind !== 'tool') return null;
    if (slot.id === 'rod') {
      const far = [t.x + DX[this.dir], t.y + DY[this.dir]];
      return ground === T.W || World.g(m, far[0], far[1]) === T.W ? out('Cast line') : null;
    }
    if (slot.id === 'hoe') return Farm.canTill(m, t.x, t.y) ? out('Till') : null;
    if (slot.id === 'can') {
      if (ground === T.W) return out('Refill');
      return s && !s.w && S.can > 0 ? out('Water') : null;
    }
    if (o && OBJDEF[o.type].tool === slot.id) {
      const d = OBJDEF[o.type];
      if (d.minLvl && S.tools[slot.id] < d.minLvl) return out('Needs better pick');
      return out(slot.id === 'axe' ? 'Chop' : slot.id === 'pick' ? 'Break' : 'Cut');
    }
    if (slot.id === 'scythe' && s && s.c && (s.c.dead || Farm.ripe(s.c))) return out(s.c.dead ? 'Clear' : 'Reap');
    return null;
  },

  cast(tile) {
    const m = this.map;
    const t2 = { x: tile.x + DX[this.dir], y: tile.y + DY[this.dir] };
    const spot = [tile, t2].find(p => World.g(m, p.x, p.y) === T.W);
    if (!spot) { toast('Face the water to cast.'); return; }
    if (S.energy <= -15) { toast('You are too tired to fish.'); return; }
    Game.spend(ENERGY_COST.rod);
    Sfx.play('cast');
    UI.push(UI.fishing(spot));
  },
};

// ---- Villagers ------------------------------------------------------------
const People = {
  list: [],
  init() {
    this.list = Object.values(NPCS).map(def => ({ id: def.id, def, map: null, x: 0, y: 0, dir: 0, path: [], goal: null, hidden: false, frameT: 0, moving: false, lastEntry: -1 }));
    this.morning();
  },
  get(id) { return this.list.find(p => p.id === id); },
  pellHere() { return [5, 12, 19, 26].includes(S.day); },
  absent(p) { return !!(p.def.wanderer && !this.pellHere()) || !!(p.def.gone && p.def.gone()) || (S.downed && S.downed[p.id] === absDay()); },

  // Puts someone where their schedule says they should be right now.
  seat(p) {
    const sch = this.schedule(p);
    let idx = 0;
    sch.forEach((e, i) => { if (S.time >= e[0]) idx = i; });
    const [, mapId, x, y, hide] = sch[idx];
    p.map = World.maps[mapId]; p.x = x * TILE + 8; p.y = y * TILE + 12; p.lastEntry = idx; p.goal = null; p.path = [];
    p.hidden = !!hide;
  },
  schedule(p) {
    const special = p.def.where && p.def.where();
    if (special) return special;
    return (S.weather === 'rain' || S.weather === 'storm') && p.def.rain ? p.def.rain : p.def.sched;
  },

  morning() {
    for (const p of this.list) {
      const [, mapId, x, y, hide] = this.schedule(p)[0];
      p.map = World.maps[mapId]; p.x = x * TILE + 8; p.y = y * TILE + 12;
      p.path = []; p.goal = null; p.hop = null; p.lastEntry = 0; p.dir = DIRS.down;
      p.hidden = !!hide || this.absent(p); p.fighting = false;
    }
  },

  // Shows anyone who should be out right now and hides anyone who should not.
  // Runs constantly, so a character the story calls for appears straight away.
  refresh() {
    for (const p of this.list) {
      if (p.fighting) continue;
      if (this.absent(p)) { if (!p.hidden) { p.hidden = true; p.goal = null; p.path = []; } continue; }
      // If the story has moved where someone lives or works, move them now.
      const sch = this.schedule(p), sig = sch.map(e => e.join()).join('|');
      if (p.sig !== undefined && p.sig !== sig) { p.sig = sig; this.seat(p); continue; }
      p.sig = sig;
      if (!p.hidden || p.goal) continue;
      let idx = 0;
      sch.forEach((e, i) => { if (S.time >= e[0]) idx = i; });
      if (!sch[idx][4]) this.seat(p);
    }
  },

  // Re-seats everyone to where they should be at the current time, e.g. after loading.
  settle() {
    this.morning();
    for (const p of this.list) {
      const sch = this.schedule(p);
      let idx = 0;
      sch.forEach((e, i) => { if (S.time >= e[0]) idx = i; });
      const [, mapId, x, y, hide] = sch[idx];
      p.map = World.maps[mapId]; p.x = x * TILE + 8; p.y = y * TILE + 12; p.lastEntry = idx;
      p.hidden = !!hide || this.absent(p);
    }
  },

  tick() {
    this.refresh();
    for (const p of this.list) {
      if (this.absent(p)) { if (!p.hidden) { p.hidden = true; p.goal = null; p.path = []; } continue; }
      const sch = this.schedule(p);
      for (let i = 0; i < sch.length; i++) {
        if (sch[i][0] === S.time && i !== p.lastEntry) {
          p.lastEntry = i;
          const [, mapId, x, y, hide] = sch[i];
          p.goal = { map: mapId, x, y, hide: !!hide };
          p.hidden = false;
          p.path = null; p.hop = null;
        }
      }
    }
  },

  update(dt) {
    for (const p of this.list) {
      if (p.hidden) continue;
      p.moving = false;
      if (!p.goal) continue;
      if (!p.path) this.plan(p);
      if (!p.path) continue;
      if (!p.path.length) { this.arrive(p); continue; }
      const [tx, ty] = p.path[0], gx = tx * TILE + 8, gy = ty * TILE + 12;
      const dx = gx - p.x, dy = gy - p.y, dist = Math.hypot(dx, dy), step = 42 * dt;
      p.moving = true; p.frameT += dt * 6;
      if (Math.abs(dx) > Math.abs(dy)) p.dir = dx > 0 ? DIRS.right : DIRS.left;
      else if (dy) p.dir = dy > 0 ? DIRS.down : DIRS.up;
      if (dist <= step) { p.x = gx; p.y = gy; p.path.shift(); }
      else { p.x += dx / dist * step; p.y += dy / dist * step; }
    }
  },

  plan(p) {
    const sx = Math.floor(p.x / TILE), sy = Math.floor(p.y / TILE), g = p.goal;
    let tx = g.x, ty = g.y;
    if (p.map.id !== g.map) {
      p.hop = World.nextHop(p.map.id, g.map);
      if (!p.hop) { this.snap(p); return; }
      tx = p.hop.x; ty = p.hop.y;
    }
    p.path = World.path(p.map, sx, sy, tx, ty);
    if (!p.path) this.snap(p);
  },

  arrive(p) {
    if (p.hop) {
      const h = p.hop;
      p.map = World.maps[h.to]; p.x = h.tx * TILE + 8; p.y = h.ty * TILE + 12;
      p.path = null; p.hop = null;
      return;
    }
    p.hidden = p.goal.hide; p.goal = null; p.path = []; p.dir = DIRS.down;
  },

  // A blocked route must never strand someone for the day.
  snap(p) {
    const g = p.goal;
    p.map = World.maps[g.map]; p.x = g.x * TILE + 8; p.y = g.y * TILE + 12;
    p.hidden = g.hide; p.goal = null; p.path = []; p.hop = null;
  },

  // Whichever visible villager is closest to a tile, within reach.
  near(m, tx, ty) {
    let best = null, bd = 13;
    for (const p of this.list) {
      if (p.hidden || p.map !== m) continue;
      const d = Math.hypot(p.x - (tx * TILE + 8), p.y - 6 - (ty * TILE + 8));
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  },
};

// ---- Pressing interact ----------------------------------------------------
const ACT_LABEL = {
  bed: 'Sleep', letter: 'Read letter', bookshelf: 'Search shelf', board: 'Read notices', trough: 'Fill trough', stone: 'Inspect stone',
  shedchest: 'Open box', chest: 'Open chest', ladder: 'Climb down', stairs: 'Go to surface', irondoor: 'Try the door', log: 'Inspect trunk',
};
const READ_LABEL = { sign: 'Read sign', grave: 'Read grave', mailbox: 'Check mailbox' };

const Interact = {
  focus: null, useHint: null,

  objLabel(o) {
    if (o.type === 'forage') return 'Pick up ' + ITEMS[o.item].name;
    if (o.tolley && Memory.get('hunt_tools') && !Memory.get('found_bundle')) return 'Search crate';
    const steal = Crime.stealLabel(o);
    if (steal) return steal;
    const d = OBJDEF[o.type];
    if (!d.act) return null;
    if (d.act === 'read') return o.text ? READ_LABEL[o.type] || 'Look' : null;
    if (d.act === 'labor') return LABOR_LABEL[o.task];
    if (o.type === 'chest' && S.opened[o.cid]) return null;
    return ACT_LABEL[d.act];
  },

  // What a single tile offers, if anything.
  atTile(m, x, y) {
    const s = Farm.soilAt(m, x, y), tileAt = { tile: [x, y], ax: x * TILE + 8, ay: y * TILE - 2 };
    const garden = s && s.c && Farm.ripe(s.c) && Crime.gardenOwner(m, x, y);
    if (garden) return Combat.sneaking ? Object.assign(tileAt, { label: 'Steal ' + CROPS[s.c.id].name, sprite: () => Render.cropSprite(s.c, x, y), ay: y * TILE - 8, run: () => Crime.stealCrop(m, x, y) }) : null;
    if (s && s.c && Farm.ripe(s.c)) return Object.assign(tileAt, { label: 'Harvest ' + CROPS[s.c.id].name, sprite: () => Render.cropSprite(s.c, x, y), ay: y * TILE - 8, run: () => Farm.harvest(m, x, y) });
    const o = World.at(m, x, y);
    if (o) {
      const label = this.objLabel(o);
      if (label) {
        const sp = Render.objSprite(o, m.indoor ? 0 : S.season);
        return { tile: [o.x, o.y], label, sprite: () => Render.objSprite(o, m.indoor ? 0 : S.season), ax: sp.x + sp.img.width / 2, ay: sp.y - 2, run: () => this.object(o, m) };
      }
    }
    const w = World.warpAt(m, x, y);
    if (w) {
      const closed = World.warpClosed(w), name = World.maps[w.to].name;
      if (closed && (w.locked || w.hours) && Combat.sneaking && Crime.hasPick()) return Object.assign(tileAt, { label: 'Pick the lock', run: () => Crime.pickLock(w) });
      const label = closed ? 'Closed' : w.door ? 'Enter ' + name : m.indoor ? 'Go outside' : 'To ' + name;
      return Object.assign(tileAt, { label, closed: !!closed, run: () => { if (closed) { toast(closed); Sfx.play('deny'); } else Game.warp(w); } });
    }
    const b = World.buildingAt(m, x, y);
    if (b && (b.act || b.msg)) {
      if (b.type === 'bin') {
        const held = Inv.held(), sellable = held && !Inv.keep(held.id);
        const sp = { img: Art.building('bin', S.season, 0), x: b.x * TILE, y: (b.y + b.h) * TILE - 22 };
        return { tile: [x, y], label: sellable ? 'Ship ' + ITEMS[held.id].name : 'Shipping bin', sprite: () => sp, ax: sp.x + 16, ay: sp.y - 2, run: () => this.building(b) };
      }
      return Object.assign(tileAt, { label: b.act === 'mine' ? 'Enter the mine' : b.act === 'gaolgate' ? 'Gaol gate' : b.act === 'arena' ? 'Enter the Pit' : 'Look', run: () => this.building(b) });
    }
    return null;
  },

  // Finds the best thing in reach, preferring whatever you are facing.
  scan() {
    const m = Player.map, t = Player.target(), pt = Player.tile(), cx = t.x * TILE + 8, cy = t.y * TILE + 8;
    let best = null, bd = 34;
    const consider = (hit, cost) => { if (hit && cost < bd) { bd = cost; best = hit; } };
    for (const p of People.list) {
      if (p.hidden || p.map !== m) continue;
      const near = Math.hypot(p.x - Player.x, p.y - Player.y) <= 30;
      const over = World.at(m, t.x, t.y);
      const across = over && OBJDEF[over.type].reach && Math.hypot(p.x - (t.x + DX[Player.dir]) * TILE - 8, p.y - 6 - (t.y + DY[Player.dir]) * TILE - 8) < 13;
      if (!near && !across) continue;
      const frame = () => ({ img: Art.charFrame(p.id, p.def.look, p.dir, p.moving ? Math.floor(p.frameT) % 4 : 0), x: Math.round(p.x) - 9, y: Math.round(p.y) - 26 });
      const lift = Crime.canPick(p);
      consider({ tile: [Math.floor(p.x / TILE), Math.floor(p.y / TILE)], label: (lift ? 'Pickpocket ' : 'Talk to ') + p.def.name, sprite: frame, ax: p.x, ay: p.y - 30, run: () => (lift ? Crime.pickpocket(p) : Talk.open(p)) }, Math.hypot(p.x - cx, p.y - 6 - cy) - 1 - (Quests.turnInFor(p.id) || Quests.waitingOn(p.id) ? 8 : 0));
    }
    for (const id of Story.visibleKept()) {
      const k = Story.keptAt(id);
      if (Math.hypot(k.x - Player.x, k.y - Player.y) > 28) continue;
      consider({ tile: [Math.floor(k.x / TILE), Math.floor(k.y / TILE)], label: Story.keptHit(id), sprite: () => ({ img: Art.kept(id, 0), x: Math.round(k.x) - 7, y: Math.round(k.y) - 17 }), ax: k.x, ay: k.y - 20, run: () => Story.keptTalk(id) }, Math.hypot(k.x - cx, k.y - cy) - 2);
    }
    if (m.id === 'farm') for (const c of S.chickens) {
      if (c.petted || Math.hypot(c.x - Player.x, c.y - Player.y) > 26) continue;
      consider({ tile: [Math.floor(c.x / TILE), Math.floor(c.y / TILE)], label: 'Pet hen', sprite: () => ({ img: Art.chicken(0, c.dir), x: Math.round(c.x) - 7, y: Math.round(c.y) - 13 }), ax: c.x, ay: c.y - 16, run: () => this.pet(c) }, Math.hypot(c.x - cx, c.y - cy));
    }
    const tiles = [[t.x, t.y]];
    for (let y = pt.y - 1; y <= pt.y + 1; y++) for (let x = pt.x - 1; x <= pt.x + 1; x++) if (x !== t.x || y !== t.y) tiles.push([x, y]);
    for (const [x, y] of tiles) {
      const cost = Math.hypot(x * TILE + 8 - cx, y * TILE + 8 - cy);
      if (cost < bd) consider(this.atTile(m, x, y), cost);
    }
    return best;
  },

  run() {
    const hit = this.scan();
    if (!hit) return;
    Player.faceTile({ x: hit.tile[0], y: hit.tile[1] });
    hit.run();
  },

  pet(c) { c.petted = true; c.happy = clamp(c.happy + 12, 0, 100); Sfx.play('cluck'); toast('The hen clucks happily.'); },

  pickup(o) {
    if (Inv.add(o.item, 1) > 0) return;
    World.remove(Player.map, o);
    Sfx.play('harvest');
    if (o.item !== 'egg') { gainXP('foraging', 6); Quests.event('forage', o.item); }
  },

  building(b) {
    if (b.act === 'bin') return this.ship();
    if (b.act && Actions[b.act]) return Actions[b.act](b);
    if (b.msg) UI.say(null, b.msg);
  },

  ship() {
    const slot = Inv.held();
    if (slot && slot.s) { UI.say(null, 'These carry someone else\'s mark. The collector would know at once. Only a fence will take stolen goods.'); return; }
    if (!slot || Inv.keep(slot.id)) {
      UI.say(null, 'The shipping bin. Hold a crop or goods and press interact to sell the whole stack. It is collected overnight.');
      return;
    }
    S.shipped.push({ id: slot.id, n: slot.n, q: slot.q || 0 });
    Quests.event('ship', slot.id, slot.n);
    toast(`Shipped ${slot.n} ${ITEMS[slot.id].name}`, slot.id);
    S.inv[S.sel] = null;
    Sfx.play('coin');
    Memory.deed('first_ship', 'Sold goods through the shipping bin.');
  },

  object(o, m) {
    if (o.type === 'forage') return this.pickup(o);
    if (o.tolley && Memory.get('hunt_tools') && !Memory.get('found_bundle')) {
      Memory.flag('found_bundle'); Inv.add('tool_bundle', 1); Sfx.play('discover');
      UI.say(null, 'Behind the crate: three chisels and a hammer, wrapped in a small patched coat. You have seen that coat before.');
      Quests.pulse();
      return;
    }
    if (Crime.canSteal(o, m)) return Crime.lootContainer(o, m);
    const d = OBJDEF[o.type];
    if (d.act && Actions[d.act]) return Actions[d.act](o);
  },
};

const Actions = {
  read(o) { if (o.culvert) return Story.culvert(); if (o.text) UI.say(null, o.text); },
  bed() {
    UI.ask(null, 'Go to bed and end the day?', [
      { text: 'Sleep', fn() { Game.endDay(false); } },
      { text: 'Not yet', fn() {} },
    ]);
  },
  letter() {
    Script.run([
      [null, '"Tam. If you have this, then I did not come back, so do not wait on me."'],
      [null, '"The farm is yours. It is good ground. Better than it ought to be. Water what you plant. Mind the people and they will mind you."'],
      [null, '"Pay the Tithe and do not be clever about it."'],
      [null, '"Whatever grows beside the old stone, let it grow. - Joren"'],
    ], null, () => { Memory.flag('read_letter'); Memory.deed('read_joren', 'Read your grandfather\'s last letter.'); Quests.pulse(); });
  },
  bookshelf() {
    const q = S.quests.bram1;
    if (q && q.state === 'active' && !Memory.get('found_pipe')) {
      Memory.flag('found_pipe'); Inv.add('joren_pipe', 1); Sfx.play('discover');
      UI.say(null, 'Behind a row of almanacs, you find a black pipe. It still smells of him.');
      Quests.pulse();
      return;
    }
    UI.say(null, pick([
      'Fifty years of almanacs, every page annotated. The earliest, from Year 77 of the reign, are not about the weather.',
      'A ledger of crop yields. They are absurdly good, and he has circled every one of them, as if it upset him.',
      'A book of hymns to the Green, unopened.',
    ]));
  },
  board() {
    if (!S.board) Quests.rollBoard();
    const b = S.board, it = ITEMS[b.item], who = NPCS[b.npc].name;
    if (b.done) return UI.say(null, 'The board is bare. New requests go up in the morning.');
    if (b.taken) return UI.say(null, `Your request: bring ${b.n} ${it.name} to ${who} by ${dateName(b.due)}.`);
    UI.ask(null, `WANTED: ${b.n} ${it.name}, for ${who}. Pays ${b.gold} gold. Three days.`, [
      { text: 'Take the job', fn() { b.taken = true; Sfx.play('quest'); toast('Request accepted.'); } },
      { text: 'Leave it', fn() {} },
    ]);
  },
  trough() {
    if (!S.chickens.length) return UI.say(null, 'An empty trough. It wants chickens first, and those are sold at Hale\'s Goods.');
    if (S.troughFed) return UI.say(null, 'The trough is full for today.');
    if (Inv.count('feed') < S.chickens.length) return UI.say(null, `You need ${S.chickens.length} Chicken Feed to fill the trough.`);
    Inv.remove('feed', S.chickens.length); S.troughFed = true; Sfx.play('plant'); toast('The hens crowd around the trough.');
  },
  stone() {
    if (Story.stoneHook()) return;
    if (Memory.get('found_page') && !Memory.get('saw_sprout')) {
      const night = S.time >= 1080;
      return Script.run([
        [null, night ? 'The moon is up. The stone looks the same, but the ground beside it does not.' : 'The light is fading from the corner of the field. The ground beside the stone has been disturbed.'],
        [null, 'A small green thing pushes up out of the soil. It unfolds. It has eyes.'],
        [null, 'It looks at you, then it looks at the stone. It makes no sound at all.'],
        { ask: 'Then it puts a small green hand on the place where the first name was scratched out.', who: null, opts: [
          { t: 'Stay very still.', do() { Memory.deed('stayed_sprout', 'Stayed still when the small green thing came up beside the stone.'); } },
          { t: 'Reach out to it.', do() { Memory.flag('touched_sprout'); Memory.deed('touched_sprout', 'Reached out to the small green thing by the stone.'); } },
        ] },
        [null, 'It sinks back into the earth without leaving a mark.'],
        { do() { Memory.flag('saw_sprout'); } },
      ], null, () => Quests.pulse());
    }
    Script.run([[null, 'A standing stone, older than the wall around it. It was once covered in names, dozens of them, cut by hand. Every single one has been scratched away.']], null, () => {
      if (S.quests.m4 && S.quests.m4.state === 'active') Memory.flag('saw_stone');
      Quests.pulse();
    });
  },
  shedchest() {
    if (!Memory.get('shed_open')) return UI.say(null, 'An iron-bound box. It is locked, and you have no reason to break it. Yet.');
    if (Memory.get('found_page')) return UI.say(null, 'The box is empty now.');
    Script.run([
      [null, 'The hasp lifts as if it has been oiled recently. Inside is a single torn page in your grandfather\'s hand.'],
      [null, '"We took the bridge down in the night, as ordered. I cut their names into the stone myself so that someone would know. Then the second order came, to scratch them out, and I did that as well."'],
      [null, '"The soil has never been so good."'],
      { do() { Inv.add('journal_page', 1); Memory.flag('found_page'); Memory.deed('found_page', 'Found a torn page of your grandfather\'s journal.'); } },
    ], null, () => Quests.pulse());
  },
};

// ---- Conversations --------------------------------------------------------
const Talk = {
  open(p) {
    const id = p.id, st = S.npc[id], def = p.def;
    p.dir = (Player.dir + (Player.dir % 2 === 0 ? 1 : -1));
    Quests.event('talk', id);
    const firstToday = st.talked !== absDay();
    if (firstToday) { st.talked = absDay(); Trust.add(id, 10); gainXP('persuasion', 5); }

    // Story beats that are ready always come first.
    const ready = Quests.turnInFor(id);
    if (ready) return Quests.advance(ready, () => {});

    // Things they heard about you get said once, before anything else.
    const react = def.reactions.find(r => !st.said.includes(r.id) && r.if());
    if (react) { st.said.push(react.id); return UI.say(id, react.t, () => this.menu(p)); }
    this.menu(p);
  },

  chatLine(p) {
    const h = hearts(p.id), lines = p.def.chat.filter(l => l.h <= h);
    const top = lines.filter(l => l.h >= Math.max(0, h - 2));
    return pick(top.length ? top : lines).t;
  },

  menu(p) {
    const id = p.id, def = p.def, st = S.npc[id], opts = [];
    opts.push({ text: 'Chat', fn: () => UI.say(id, this.chatLine(p), () => this.menu(p)) });
    Quests.available(id).forEach(q => opts.push({ text: `[Quest] ${q.title}`, fn: () => this.offer(p, q) }));
    const b = S.board;
    if (b && b.taken && !b.done && b.npc === id && Inv.count(b.item) >= b.n) {
      opts.push({ text: `Deliver ${b.n} ${ITEMS[b.item].name}`, fn: () => {
        Inv.remove(b.item, b.n); S.gold += b.gold; b.done = true; Trust.add(id, 40); Sfx.play('coin'); toast(`+${b.gold} gold`);
        Memory.deed('board_' + absDay(), `Filled a request for ${def.name}.`, { once: false });
        UI.say(id, 'Good. Exactly what I needed.', () => this.menu(p));
      } });
    }
    const held = Inv.held();
    if (held && !Inv.keep(held.id)) {
      opts.push({ text: st.gifted === absDay() ? 'Give gift (already gave today)' : `Give ${ITEMS[held.id].name}`, locked: st.gifted === absDay(), fn: () => this.gift(p) });
    }
    if (def.shop && S.time >= def.hours[0] && S.time < def.hours[1]) opts.push({ text: 'Trade', fn: () => UI.push(UI.shop('store', id)) });
    if (id === 'sera') opts.push({ text: 'Trade', fn: () => UI.push(UI.shop('inn', id)) });
    if (id === 'ansa') opts.push({ text: 'Trade', fn: () => UI.push(UI.shop('shrine', id)) });
    if (id === 'wick') opts.push({ text: 'Trade', fn: () => UI.push(UI.shop('wick', id)) });
    if (id === 'ivo' && Memory.get('forge_open')) {
      opts.push({ text: 'Trade', fn: () => UI.push(UI.shop('forge', id)) });
      opts.push({ text: 'Upgrade tools', fn: () => this.upgrades(p) });
      opts.push({ text: 'Armour: forge and repair', fn: () => Armor.forgeMenu(p, () => this.menu(p)) });
      if (Memory.get('forge_iron')) opts.push({ text: 'Forge a weapon', fn: () => this.forge(p) });
    }
    if (def.wanderer) {
      opts.push({ text: 'Barter', fn: () => UI.push(UI.shop('barter', id)) });
      const q = S.quests.marta3;
      if (q && q.state === 'active' && q.stage === 1) {
        opts.push({ text: 'Buy Dell\'s ring (400g)', locked: S.gold < 400, fn: () => {
          S.gold -= 400; Inv.add('dell_ring', 1); Memory.flag('bought_ring'); Memory.deed('bought_ring', 'Bought Dell\'s ring back from a trader.');
          Sfx.play('coin'); UI.say(id, 'A pleasure. I hope it gets where it is going.', () => Quests.pulse());
        } });
      }
    }
    if (def.extra) def.extra(opts, p);
    Story.bramOptions(id, opts);
    opts.push({ text: 'Leave', fn() {} });
    UI.ask(id, pick(def.greet), opts);
  },

  offer(p, q) {
    Script.run(q.offer || [], p.id, () => {
      UI.ask(p.id, `Will you take this on? "${q.title}"`, [
        { text: 'Accept', fn: () => { Quests.start(q.id); if (q.accept) q.accept(); Quests.pulse(); } },
        { text: 'Not now', fn: () => this.menu(p) },
      ]);
    });
  },

  forge(p) {
    const opts = WEAPON_FORGE.filter(w => !Inv.count(w.id)).map(w => {
      const cost = Object.entries(w.needs).map(([k, v]) => `${v} ${ITEMS[k].name}`).join(', ');
      return {
        text: `${ITEMS[w.id].name}: ${w.gold}g + ${cost}`,
        locked: S.gold < w.gold || !Inv.has(w.needs),
        fn: () => {
          S.gold -= w.gold; Inv.takeAll(w.needs); Inv.add(w.id, 1); Sfx.play('level');
          Memory.deed('forged_' + w.id, `Had Ivo forge a ${ITEMS[w.id].name}.`);
          UI.say(p.id, 'There. Try to be the one holding the handle.', () => this.menu(p));
        },
      };
    });
    opts.push({ text: 'Never mind', fn: () => this.menu(p) });
    UI.ask(p.id, opts.length > 1 ? 'What do you want made?' : 'I have made you everything I know how to make.', opts);
  },

  gift(p) {
    const id = p.id, slot = Inv.held(), taste = Trust.giftTaste(id, slot.id), name = ITEMS[slot.id].name;
    Inv.remove(slot.id, 1) ;
    S.npc[id].gifted = absDay();
    Trust.add(id, GIFT[taste]);
    Memory.deed(`gift_${id}_${taste}`, `Gave ${NPCS[id].name} a ${name}, and it was ${taste === 'love' ? 'adored' : taste === 'like' ? 'welcome' : taste === 'hate' ? 'an insult' : 'politely taken'}.`, {});
    const lines = {
      love: 'For me? You remembered. I won\'t forget this.',
      like: 'That is kind of you. Thank you.',
      neutral: 'Oh. Thank you, I suppose.',
      hate: 'Is this meant to be a joke?',
    };
    if (taste === 'hate') Sfx.play('sad'); else Sfx.play('heart');
    UI.say(id, lines[taste], () => this.menu(p));
  },

  upgrades(p) {
    const opts = [];
    for (const tool in UPGRADES) {
      const lvl = S.tools[tool], up = UPGRADES[tool][lvl];
      if (!up || (lvl >= 1 && !Memory.get('forge_iron'))) continue;
      const cost = Object.entries(up.needs).map(([k, v]) => `${v} ${ITEMS[k].name}`).join(', ');
      opts.push({
        text: `${up.name}: ${up.gold}g + ${cost}. ${up.note}`,
        locked: S.gold < up.gold || !Inv.has(up.needs),
        fn: () => {
          S.gold -= up.gold; Inv.takeAll(up.needs); S.tools[tool]++;
          if (tool === 'can') S.can = CAN_CAPACITY[S.tools.can];
          Sfx.play('level'); toast(`Upgraded to ${up.name}!`);
          Memory.deed('upgraded_' + tool, `Had Ivo forge a ${up.name}.`);
          UI.say(p.id, ['Good copper. Try not to hit anything you shouldn\'t.', 'Real iron. That will outlast both of us.', 'Gold is soft, so I folded it over steel. It cuts like a dream.', 'I have never set a stone into a tool before. I may never again. Look at it.'][S.tools[tool] - 1], () => this.menu(p));
        },
      });
    }
    opts.push({ text: 'Never mind', fn: () => this.menu(p) });
    const maxed = Object.keys(UPGRADES).every(t => S.tools[t] >= UPGRADES[t].length);
    const none = maxed ? 'Amethyst, every one of them. There is nothing finer I can make. There is nothing finer anyone can.'
      : 'Copper is as far as I go until I have worked real iron. Bring me some from the Deep Mine.';
    UI.ask(p.id, opts.length > 1 ? 'Which one?' : none, opts);
  },
};
