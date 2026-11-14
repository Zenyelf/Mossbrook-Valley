'use strict';
// Your own changes to the world, made in the map editor (editor.html). Loaded last.
//
// Edits are kept per map: ground painted, objects removed, objects added, and tiles opened up. They are put
// on top of the world every time it is built, after a save is loaded, and when Mossbrook grows, so they
// survive everything. They never block the way: nothing solid is ever put on a door, an exit, where a door
// lets you out, or where a villager needs to stand, and story pieces (gates, chests, beds, quest things)
// can't be removed.

const WorldEdits = {
  KEY: 'mossbrook_world_edits',
  data: null,
  // Editor-saved edits (in this browser) win over an exported world_edits.js file.
  load() {
    try { const s = localStorage.getItem(this.KEY); if (s) return JSON.parse(s); } catch (e) { /* fall through */ }
    return (typeof window.WORLD_EDITS !== 'undefined' && window.WORLD_EDITS) || null;
  },
  blank() { return { version: 1, maps: {} }; },
  forMap(id, make) { const d = this.data; if (!d) return null; if (!d.maps[id] && make) d.maps[id] = { ground: {}, remove: [], add: [], unblock: [] }; return d.maps[id] || null; },
  // Maps that are made fresh every visit can't be edited.
  editable(m) { return !!m && !m.transient && m.id !== 'arena'; },

  // ---- What must stay open ----------------------------------------------------------------------------
  // Doors and exits on the map, the spots other maps' doors drop you at, and where villagers stand.
  keepOpen(m) {
    const out = new Set();
    for (const w of m.warps) out.add(key(w.x, w.y));
    for (const id in World.maps) for (const w of World.maps[id].warps) if (w.to === m.id) out.add(key(w.tx, w.ty));
    for (const id in NPCS) for (const e of [...(NPCS[id].sched || []), ...(NPCS[id].rain || [])]) if (e && e[1] === m.id) out.add(key(e[2], e[3]));
    for (const k in GOAL_SPOTS) { const g = GOAL_SPOTS[k]; if (g[0] === m.id) out.add(key(g[1], g[2])); }
    for (const b of m.buildings) if (b.door) out.add(key(b.door.x, b.door.y + 1));
    return out;
  },
  // Objects that belong to the story or to someone, which the editor leaves alone.
  STORY_TYPES: new Set(['gate', 'log', 'rubble', 'crackwall', 'wreck', 'grate', 'hatch', 'altar', 'namestone', 'campdummy', 'minehead', 'chest', 'lockbox', 'mailbox', 'board', 'shedchest', 'homechest', 'trough', 'bin', 'digspot']),
  PLAIN_PROPS: new Set(['type', 'x', 'y', 'hp', 'text', 'kind', 'v', 'shake', 'ed']),
  isStory(o) {
    if (!o || o.ed) return false;
    const d = OBJDEF[o.type] || {};
    if (this.STORY_TYPES.has(o.type) || o.type === 'forage' || o.type.startsWith('nvsite')) return true;
    if (d.act && d.act !== 'read') return true;
    return Object.keys(o).some(k => !this.PLAIN_PROPS.has(k));
  },

  apply(m) {
    const E = this.forMap(m.id); if (!E || !this.editable(m)) return;
    const open = this.keepOpen(m);
    for (const k in E.ground || {}) {
      const [x, y] = k.split(',').map(Number), t = E.ground[k];
      if (x < 0 || y < 0 || x >= m.w || y >= m.h) continue;
      if (SOLID_GROUND.has(t) && open.has(k)) continue;
      World.set(m, x, y, t);
    }
    for (const r of E.remove || []) {
      const o = World.at(m, r.x, r.y);
      if (o && o.x === r.x && o.y === r.y && o.type === r.type && !this.isStory(o)) World.remove(m, o);
    }
    for (const k of E.unblock || []) { const [x, y] = k.split(',').map(Number); if (!World.buildingAt(m, x, y)) m.block.delete(k); }
    for (const a of E.add || []) {
      const d = OBJDEF[a.type]; if (!d) continue;
      const here = World.at(m, a.x, a.y);
      if (here && here.x === a.x && here.y === a.y && here.type === a.type) continue;
      let ok = true;
      for (let j = a.y; j < a.y + (d.fh || 1) && ok; j++) for (let i = a.x; i < a.x + (d.fw || 1); i++) {
        if (i < 0 || j < 0 || i >= m.w || j >= m.h || World.buildingAt(m, i, j) || (d.solid && open.has(key(i, j)))) { ok = false; break; }
      }
      if (ok) World.add(m, a.type, a.x, a.y, Object.assign({ ed: 1 }, a.props || {}));
    }
    m.version = (m.version || 0) + 1;
  },
  applyAll() { if (!this.data) return; for (const id in this.data.maps) if (World.maps[id]) this.apply(World.maps[id]); },
};
WorldEdits.data = WorldEdits.load();
(() => {
  const build = World.build.bind(World);
  World.build = function () { build(); WorldEdits.applyAll(); };
  // A loaded save brings back trees and rocks; put the edits on top again.
  const deserialize = World.deserialize.bind(World);
  World.deserialize = function (data) { deserialize(data); WorldEdits.applyAll(); };
  // Mossbrook rebuilds its new streets as the story moves on.
  if (typeof Grow !== 'undefined') {
    const layout = Grow.layout.bind(Grow);
    Grow.layout = function (m) { layout(m); WorldEdits.apply(m); };
  }
})();

// ---- Nobody gets stuck on your changes --------------------------------------------------------------
// Background people walk in straight lines between their stops. If something you built is in the way,
// they find a way round it (or skip that stop if there is no way at all) instead of walking on the spot.
// Anyone standing where you put something solid steps out to the nearest open tile.
const Unstick = {
  free(m, x, y, swim) { return x >= 0 && y >= 0 && x < m.w && y < m.h && !World.solid(m, x, y) && (swim || World.g(m, x, y) !== T.W); },
  near(m, x, y, swim) {
    for (let d = 0; d <= 10; d++) for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) === d && this.free(m, x + dx, y + dy, swim)) return [x + dx, y + dy];
    }
    return null;
  },
  // Only your edits move anyone: the game's own scenes stay exactly as they were made.
  byEdit(m, x, y) {
    const E = WorldEdits.forMap(m.id); if (!E) return false;
    const o = World.at(m, x, y);
    return !!(o && o.ed && OBJDEF[o.type].solid) || (E.ground[key(x, y)] !== undefined && World.solid(m, x, y));
  },
  plain: new WeakMap(),
  // The same person, minus their own walking plan, so they can be steered round an obstacle.
  steer(e) { let c = this.plain.get(e); if (!c) { c = Object.assign({}, e, { route: null, wander: null, dir: undefined }); this.plain.set(e, c); } return c; },
};
(() => {
  const step = Extras.step.bind(Extras);
  Extras.step = function (p, dt, m, here) {
    const e = p.e;
    if (!WorldEdits.data || !WorldEdits.data.maps[m.id] || e.follow || e.dance) return step(p, dt, m, here);
    const tile = () => [Math.floor(p.x / TILE), Math.floor((p.y - 2) / TILE)];
    // Standing inside something you built: step out of it.
    let [tx, ty] = tile();
    if (Unstick.byEdit(m, tx, ty)) {
      const s = Unstick.near(m, tx, ty, e.swim);
      if (s) { p.x = p.tx = s[0] * TILE + 8; p.y = p.ty = s[1] * TILE + 12; p.detour = null; [tx, ty] = s; }
    }
    // Following a way round.
    if (p.detour && p.detour.length) {
      const [wx, wy] = p.detour[0];
      if (Math.hypot(wx * TILE + 8 - p.x, wy * TILE + 12 - p.y) < 2) p.detour.shift();
    }
    if (p.detour && p.detour.length) {
      const [wx, wy] = p.detour[0], x0 = p.x, y0 = p.y;
      p.e = Unstick.steer(e); p.tx = wx * TILE + 8; p.ty = wy * TILE + 12;
      try { step(p, dt, m, here); } finally { p.e = e; }
      p.dStuck = Math.abs(p.x - x0) + Math.abs(p.y - y0) < 0.01 && !(p.pause > 0) ? (p.dStuck || 0) + dt : 0;
      if (p.dStuck > 1) { p.detour = null; p.dStuck = 0; p.moving = false; }
      return;
    }
    p.detour = null;
    // Given up on every stop for now: stand still, and try again in a while.
    if (p.restT > 0) {
      p.restT -= dt; p.e = Unstick.steer(e); p.tx = p.x; p.ty = p.y;
      try { step(p, dt, m, here); } finally { p.e = e; }
      p.moving = false; if (e.dir !== undefined) p.dir = e.dir;
      return;
    }
    const x0 = p.x, y0 = p.y;
    step(p, dt, m, here);
    if (!e.route || p.pause > 0) return;
    const [rx, ry] = e.route[p.leg], far = Math.hypot(rx * TILE + 8 - p.x, ry * TILE + 12 - p.y) > 2;
    const blocked = far && Math.abs(p.x - x0) + Math.abs(p.y - y0) < 0.01 && p.tx === p.x && p.ty === p.y;
    if (!blocked) { p.fails = 0; return; }
    p.moving = false;
    // Find a way round to the next stop; skip a stop that has been built over or can't be reached.
    const [cx, cy] = tile();
    const path = Unstick.free(m, rx, ry, e.swim) ? World.path(m, cx, cy, rx, ry) : null;
    if (path && path.length) { p.detour = path; p.fails = 0; return; }
    p.leg = (p.leg + 1) % e.route.length; p.fails = (p.fails || 0) + 1;
    if (p.fails >= e.route.length) { p.fails = 0; p.restT = 8; }
  };
})();

// ---- Step out where you can be seen -------------------------------------------------------------------
// Villagers, passers-by and enemies who aren't fighting you don't stand with their head hidden behind
// a tree, a roof or a tall object. Every so often they look round and, if they are hidden, walk a few steps
// to the nearest open spot where their face shows. Feet and legs behind something are fine, so shopkeepers
// stay behind their counters and stalls.
// Someone minding a stand or a counter: they stay where they are, so you can trade.
const Seller = {
  at(m, px, py) {
    const tx = Math.floor(px / TILE), ty = Math.floor((py - 2) / TILE);
    for (let dy = 0; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const o = World.at(m, tx + dx, ty + dy), d = o && OBJDEF[o.type];
      if (d && (d.reach || /^(stall|curio|mk[a-z]+|counter|nv_stand)$/.test(o.type))) return true;
    }
    return false;
  },
};
const Reveal = {
  masks: new WeakMap(), cache: null, t: 0,
  // Which pixels of a picture are solid.
  mask(img) {
    let k = this.masks.get(img);
    if (!k) { try { k = { w: img.width, a: img.getContext('2d').getImageData(0, 0, img.width, img.height).data }; } catch (e) { k = { w: img.width, a: null }; } this.masks.set(img, k); }
    return k;
  },
  // Everything tall that is drawn over the world on this map, worked out once per change.
  covers(m) {
    const season = m.indoor ? 0 : S.season, night = Render.darkness() > 0.3 ? 1 : 0, k = m.id + ':' + m.version + ':' + season + ':' + night + ':' + m.objs.size;
    if (!this.cache || this.cache.k !== k) this.cache = { k, list: XRay.covers(m, -1e5, -1e5, 2e5, 2e5) };
    return this.cache.list;
  },
  // Is the head (or the head and chest) of someone with this picture box hidden?
  hidden(m, x, top, w, h, feet) {
    const pts = [0.28, 0.5, 0.72].map(fx => [[x + w * fx, top + h * 0.16], [x + w * fx, top + h * 0.38]]);
    const list = this.covers(m).filter(c => c.base > feet && c.x < x + w && c.x + c.w > x && c.y < top + h && c.y + c.h > top);
    if (!list.length) return false;
    const covered = ([px, py]) => list.some(c => {
      const ix = Math.floor(px - c.x), iy = Math.floor(py - c.y);
      if (ix < 0 || iy < 0 || ix >= c.w || iy >= c.h) return false;
      const k = this.mask(c.img); return !k.a || k.a[(iy * k.w + ix) * 4 + 3] > 40;
    });
    let head = 0, chest = 0;
    for (const [hp, cp] of pts) { if (covered(hp)) head++; if (covered(cp)) chest++; }
    return head >= 2 || (head >= 1 && chest === 3);
  },
  person(m, px, py) { return this.hidden(m, px - 9, py - 26, 18, 28, py); },
  // The nearest open tile (within a few steps) where a person-sized someone can be seen.
  spot(m, px, py, check, avoid) {
    const sx = Math.floor(px / TILE), sy = Math.floor((py - 2) / TILE), seen = new Set([key(sx, sy)]), q = [[sx, sy, 0]];
    while (q.length) {
      const [x, y, d] = q.shift();
      if (d > 0 && !avoid.has(key(x, y)) && !World.warpAt(m, x, y) && !World.at(m, x, y) && !check(x * TILE + 8, y * TILE + 12)) return [x, y];
      if (d >= 3) continue;
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + a, ny = y + b; if (seen.has(key(nx, ny))) continue; seen.add(key(nx, ny));
        if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h || World.solid(m, nx, ny) || World.g(m, nx, ny) === T.W) continue;
        q.push([nx, ny, d + 1]);
      }
    }
    return null;
  },
  due(a, dt) { a.revealT = (a.revealT === undefined ? Math.random() : a.revealT) - dt; if (a.revealT > 0) return false; a.revealT = 0.8 + Math.random() * 0.6; return true; },
  tick(dt) {
    const m = Player.map; if (!m || UI.busy() || !S) return;
    const avoid = WorldEdits.keepOpen ? WorldEdits.keepOpen(m) : new Set();
    // Villagers standing where they have arrived.
    for (const p of People.list) {
      if (p.hidden || p.map !== m || p.goal || (p.path && p.path.length) || p.def.guard || !this.due(p, dt)) continue;
      if (!this.person(m, p.x, p.y) || Seller.at(m, p.x, p.y)) continue;
      const s = this.spot(m, p.x, p.y, (x, y) => this.person(m, x, y), new Set());
      if (s) { p.goal = { map: m.id, x: s[0], y: s[1], hide: false }; p.path = World.path(m, Math.floor(p.x / TILE), Math.floor(p.y / TILE), s[0], s[1]); if (!p.path) p.goal = null; }
    }
    // Passers-by who stand about or stroll.
    for (const p of Extras.active(m)) {
      const e = p.e;
      if (e.route || e.follow || e.dance || e.swim || p.moving || p.pause > 0 || !this.due(p, dt)) continue;
      if (!this.person(m, p.x, p.y) || Seller.at(m, p.x, p.y)) continue;
      const s = this.spot(m, p.x, p.y, (x, y) => this.person(m, x, y), avoid);
      if (s) { p.tx = s[0] * TILE + 8; p.ty = s[1] * TILE + 12; }
    }
    // Enemies minding their own business.
    for (const f of Foes.list) {
      const d = f.def;
      if (f.state !== 'idle' || f.arena || d.boss || d.camp || d.disguise || f.aware > 0.3 || f.revealGo > 0 || !this.due(f, dt)) continue;
      const box = XRay.foeSprite(f), look = (x, y) => this.hidden(m, x - box.w / 2, y - box.h + 2, box.w, box.h, y);
      if (!look(f.x, f.y)) continue;
      const s = this.spot(m, f.x, f.y, (x, y) => look(x, y), avoid); if (!s) continue;
      const tx = s[0] * TILE + 8, ty = s[1] * TILE + 12, dx = tx - f.x, dy = ty - f.y, dist = Math.hypot(dx, dy) || 1;
      f.wx = dx / dist; f.wy = dy / dist; f.wander = dist / ((d.speed || 30) * 0.3); f.revealGo = f.wander; f.hx = tx; f.hy = ty; Foes.face(f, dx, dy);
    }
    for (const f of Foes.list) if (f.revealGo > 0) { f.revealGo -= dt; if (f.revealGo <= 0) { f.wx = f.wy = 0; f.wander = 1 + Math.random() * 2; } }
  },
};
(() => {
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) { tick(dt); try { Reveal.tick(dt || 1 / 60); } catch (e) { Reveal.err = e.message; } };
})();

// ---- Villagers potter about -------------------------------------------------------------------------
// Once someone has got where their day takes them, outdoors, they don't stand there like a shop sign:
// every few seconds they take a few steps, look about, wander back, all within a few tiles of their spot.
// Sellers at stands and counters stay put, guards keep their patrols, and nobody walks off while you are
// standing right by them.
const Potter = {
  free(m, x, y) { return x >= 0 && y >= 0 && x < m.w && y < m.h && !World.solid(m, x, y) && World.g(m, x, y) !== T.W && !World.warpAt(m, x, y) && !World.at(m, x, y); },
  tick(dt) {
    const m = Player.map; if (!m || m.indoor || !S || UI.busy()) return;
    let open = null;
    for (const p of People.list) {
      if (p.hidden || p.map !== m || p.def.guard || p.def.patrol || p.goal || (p.path && p.path.length)) continue;
      const cx = Math.floor(p.x / TILE), cy = Math.floor(p.y / TILE);
      if (!p.anchor || p.anchor.map !== m.id) p.anchor = { map: m.id, x: cx, y: cy };
      if (p.anchor.seller === undefined) p.anchor.seller = Seller.at(m, p.anchor.x * TILE + 8, p.anchor.y * TILE + 12);
      if (p.anchor.seller) continue;
      if (Math.hypot(Player.x - p.x, Player.y - p.y) < 34) { p.potterT = Math.max(p.potterT || 0, 2.5); continue; }
      p.potterT = (p.potterT === undefined ? 1 + Math.random() * 4 : p.potterT) - dt;
      if (p.potterT > 0) continue;
      p.potterT = 3 + Math.random() * 5;
      if (Math.random() < 0.3) { p.dir = Math.floor(Math.random() * 4); continue; } // a look about
      open = open || WorldEdits.keepOpen(m);
      const a = p.anchor;
      for (let k = 0; k < 12; k++) {
        const tx = a.x + Math.round((Math.random() - 0.5) * 6), ty = a.y + Math.round((Math.random() - 0.5) * 4);
        if ((tx === cx && ty === cy) || !this.free(m, tx, ty) || (open.has(key(tx, ty)) && !(tx === a.x && ty === a.y))) continue;
        if (typeof Reveal !== 'undefined' && Reveal.person(m, tx * TILE + 8, ty * TILE + 12)) continue;
        const path = World.path(m, cx, cy, tx, ty); if (!path || !path.length || path.length > 8) continue;
        p.goal = { map: m.id, x: tx, y: ty, hide: false, potter: true }; p.path = path;
        break;
      }
    }
  },
};
(() => {
  // Where someone's day takes them is the spot they potter round; a new stop in their day moves it.
  const arrive = People.arrive.bind(People);
  People.arrive = function (p) { const g = p.goal; arrive(p); if (g && !p.goal && !g.potter) p.anchor = { map: g.map, x: g.x, y: g.y }; };
  const settle = People.settle.bind(People);
  People.settle = function () { settle(); for (const p of this.list) { p.anchor = null; p.potterT = undefined; } };
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) { tick(dt); try { Potter.tick(dt || 1 / 60); } catch (e) { Potter.err = e.message; } };
})();
