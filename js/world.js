'use strict';
// Tile maps, static objects, buildings and warps.

const T = { G: 0, D: 1, C: 2, W: 3, S: 4, F: 5, V: 6, R: 7, B: 8, ST: 9, X: 10, CAVE: 11, ROCK: 12, MTN: 13 };
const SOLID_GROUND = new Set([T.W, T.V, T.X, T.ROCK]);

// fw/fh: footprint in tiles. dyn objects are saved and can be destroyed or respawned.
const OBJDEF = {
  tree: { solid: 1, dyn: 1, tool: 'axe', hp: 6, drops: [['wood', 8, 12], ['sap', 1, 2]], xp: ['foraging', 12] },
  stump: { solid: 1, dyn: 1, tool: 'axe', hp: 4, drops: [['wood', 3, 6]], xp: ['foraging', 5] },
  branch: { solid: 1, dyn: 1, tool: 'axe', hp: 1, drops: [['wood', 1, 2]], xp: ['foraging', 1] },
  rock: { solid: 1, dyn: 1, tool: 'pick', hp: 2, drops: [['stone', 1, 3]], xp: ['mining', 3] },
  boulder: { solid: 1, dyn: 1, tool: 'pick', hp: 6, drops: [['stone', 6, 10], ['coal', 1, 2]], xp: ['mining', 15] },
  weed: { solid: 1, dyn: 1, tool: 'scythe', hp: 1, drops: [['fiber', 0, 1]], xp: ['foraging', 1] },
  forage: { dyn: 1 },
  sprinkler: { solid: 1, dyn: 1, tool: 'pick', hp: 1, refund: 'sprinkler' },
  btree: { solid: 1, msg: 'This tree is not yours to cut.' },
  bush: { solid: 1 }, fence: { solid: 1 }, sign: { solid: 1, act: 'read' }, board: { solid: 1, act: 'board' },
  well: { solid: 1, act: 'read' }, bench: { solid: 1, fw: 2 }, lamp: { solid: 1, light: 1 },
  crate: { solid: 1 }, barrel: { solid: 1 }, flowers: {}, grave: { solid: 1, act: 'read' },
  namestone: { solid: 1, act: 'stone' }, log: { solid: 1, fw: 3, act: 'read' }, gate: { solid: 1, act: 'read' },
  shedchest: { solid: 1, act: 'shedchest' }, mailbox: { solid: 1, act: 'read' }, trough: { solid: 1, act: 'trough', fw: 2 },
  bed: { solid: 1, act: 'bed', fw: 2, fh: 2 }, table: { solid: 1, fw: 2 }, lettertable: { solid: 1, fw: 2, act: 'letter' },
  chair: { solid: 1 }, stove: { solid: 1, act: 'read' }, bookshelf: { solid: 1, fw: 2, act: 'bookshelf' },
  fireplace: { solid: 1, fw: 2 }, plant: { solid: 1 }, counter: { solid: 1, reach: 1 }, shelf: { solid: 1, fw: 2 },
  anvil: { solid: 1, fw: 2 }, forge: { solid: 1, fw: 2 }, altar: { solid: 1, fw: 2, act: 'read' }, pew: { solid: 1 },
  window_i: { flat: 1 }, picture: { flat: 1 }, stall: { solid: 1, fw: 3 },
};

const World = {
  maps: {},
  newMap(id, name, w, h, fill, opts) {
    const m = Object.assign({
      id, name, w, h, ground: new Uint8Array(w * h).fill(fill), objs: new Map(), occ: new Map(),
      buildings: [], warps: [], block: new Set(), soil: {}, indoor: false, tillable: false, version: 0,
    }, opts || {});
    this.maps[id] = m;
    return m;
  },
  g(m, x, y) { return x < 0 || y < 0 || x >= m.w || y >= m.h ? T.X : m.ground[y * m.w + x]; },
  set(m, x, y, c) { if (x >= 0 && y >= 0 && x < m.w && y < m.h) m.ground[y * m.w + x] = c; },
  rect(m, x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(m, i, j, c); },
  add(m, type, x, y, props) {
    const d = OBJDEF[type], fw = d.fw || 1, fh = d.fh || 1;
    for (let j = y; j < y + fh; j++) for (let i = x; i < x + fw; i++) if (m.occ.has(key(i, j))) return null;
    const o = Object.assign({ type, x, y, hp: d.hp || 1 }, props || {});
    m.objs.set(key(x, y), o);
    for (let j = y; j < y + fh; j++) for (let i = x; i < x + fw; i++) m.occ.set(key(i, j), o);
    return o;
  },
  remove(m, o) {
    const d = OBJDEF[o.type], fw = d.fw || 1, fh = d.fh || 1;
    m.objs.delete(key(o.x, o.y));
    for (let j = o.y; j < o.y + fh; j++) for (let i = o.x; i < o.x + fw; i++) m.occ.delete(key(i, j));
  },
  at(m, x, y) { return m.occ.get(key(x, y)); },
  addBuilding(m, type, x, y, w, h, opts) {
    const b = Object.assign({ type, x, y, w, h }, opts || {});
    m.buildings.push(b);
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) m.block.add(key(i, j));
    if (b.door) { m.block.delete(key(b.door.x, b.door.y)); this.set(m, b.door.x, b.door.y, T.D); }
    return b;
  },
  buildingAt(m, x, y) { return m.buildings.find(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h); },
  solid(m, x, y) {
    if (!(x >= 0 && y >= 0 && x < m.w && y < m.h)) return true; // also catches NaN
    if (SOLID_GROUND.has(m.ground[y * m.w + x]) || m.block.has(key(x, y))) return true;
    const o = m.occ.get(key(x, y));
    return !!(o && OBJDEF[o.type].solid);
  },
  warpAt(m, x, y) { return m.warps.find(w => w.x === x && w.y === y); },
  // Why a warp cannot be used right now, or null if it can.
  warpClosed(w) {
    if (w.hours && (S.time < w.hours[0] || S.time >= w.hours[1]) && S.unlocked[w.to] !== absDay()) return w.hours[2];
    if (w.needs && !Inv.count(w.needs)) return w.closedMsg;
    if (w.locked && S.unlocked[w.to] !== absDay()) return Crime.hasPick() ? 'Locked. Sneak (Z) to try the lock.' : 'Locked.';
    if (w.jail && S.jail) return `The gate is locked. ${S.jail.left} day${S.jail.left > 1 ? 's' : ''} left on your sentence.`;
    return null;
  },

  // Solid ring of trees around an outdoor map.
  border(m, r, thick, skip) {
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      if (!(x < thick || y < thick || x >= m.w - thick || y >= m.h - thick) || skip(x, y)) continue;
      m.block.add(key(x, y));
      if ((x + y) % 2 === 0) this.add(m, 'btree', x, y, { kind: r() < 0.45 ? 'pine' : 'oak', v: Math.floor(r() * 4) });
    }
  },

  build() {
    this.maps = {};
    this.buildFarm(); this.buildVillage();
    this.buildHouse(); this.buildStore(); this.buildInn(); this.buildSmithy(); this.buildShrine();
    this.buildRegions();
    this.buildStage4();
    this.buildStage5();
    this.buildDLC();
    this.link();
  },

  buildFarm() {
    const m = this.newMap('farm', 'Ashgrove Farm', 60, 44, T.G, { tillable: true });
    const r = mulberry(4242);
    // Pond
    for (let y = 3; y < 16; y++) for (let x = 40; x < 56; x++) {
      const dx = (x - 47.5) / 7, dy = (y - 9) / 5;
      if (dx * dx + dy * dy < 1 + Math.sin(x * 1.3 + y) * 0.1) this.set(m, x, y, T.W);
    }
    // Lanes
    this.rect(m, 12, 9, 1, 3, T.D);
    this.rect(m, 12, 11, 29, 2, T.D);
    this.rect(m, 39, 11, 2, 13, T.D);
    this.rect(m, 39, 23, 21, 3, T.D);
    this.border(m, r, 3, (x, y) => x >= 56 && y >= 23 && y <= 25);
    this.addBuilding(m, 'farmhouse', 10, 6, 6, 3, { door: { x: 12, y: 8 } });
    this.addBuilding(m, 'bin', 15, 10, 2, 1, { act: 'bin' });
    this.addBuilding(m, 'coop', 43, 30, 5, 2, { msg: 'The old coop. Chickens from Marta\'s store will roost here.' });
    this.addBuilding(m, 'shed', 6, 37, 4, 2, { msg: 'Your grandfather\'s shed. The roof gave up years ago.' });
    this.add(m, 'mailbox', 14, 9, { text: 'The mailbox is empty. Nobody knows you are here yet.' });
    this.add(m, 'trough', 44, 33);
    this.add(m, 'shedchest', 8, 39);
    this.add(m, 'namestone', 52, 35);
    // Debris across the fields; the area by the house starts clear.
    const free = (x, y) => this.g(m, x, y) === T.G && !this.solid(m, x, y) && !(x >= 7 && x <= 26 && y >= 9 && y <= 20)
      && !(x >= 40 && x <= 52 && y >= 28 && y <= 38) && !(x >= 49 && y >= 31) && !(x >= 3 && x <= 11 && y >= 35);
    const scatter = (n, fn) => { for (let i = 0; i < n; i++) { const x = 4 + Math.floor(r() * 52), y = 4 + Math.floor(r() * 36); if (free(x, y)) fn(x, y); } };
    scatter(170, (x, y) => this.add(m, 'weed', x, y));
    scatter(70, (x, y) => this.add(m, 'rock', x, y));
    scatter(65, (x, y) => this.add(m, 'branch', x, y));
    scatter(14, (x, y) => this.add(m, 'stump', x, y));
    scatter(6, (x, y) => this.add(m, 'boulder', x, y));
    scatter(32, (x, y) => this.add(m, 'tree', x, y, { kind: r() < 0.3 ? 'pine' : 'oak', v: Math.floor(r() * 4) }));
    // Keep the stone in shade.
    [[50, 33], [54, 33], [49, 37], [55, 37]].forEach(([x, y]) => this.add(m, 'btree', x, y, { kind: 'pine', v: 2 }));
    m.warps.push({ x: 59, y: 23, to: 'village', tx: 1, ty: 23, dir: DIRS.right }, { x: 59, y: 24, to: 'village', tx: 1, ty: 24, dir: DIRS.right }, { x: 59, y: 25, to: 'village', tx: 1, ty: 25, dir: DIRS.right });
  },

  buildVillage() {
    // Mossbrook is 112 by 60. The east and south beyond the old town start as forest and are cleared,
    // act by act, as the town grows (see growth.js); the far east is the Gardens. The King's Gate and the
    // south road sit at the new edges.
    const VW = 112, m = this.newMap('village', 'Mossbrook', VW, 60, T.G);
    const r = mulberry(99);
    this.rect(m, 0, 0, VW, 5, T.W); // the river
    this.rect(m, 0, 23, VW, 3, T.D); // high road
    this.rect(m, 27, 19, 11, 11, T.C); // square
    this.rect(m, 31, 5, 3, 14, T.D); // road to the bridge
    this.rect(m, 31, 30, 3, 9, T.D);
    this.rect(m, 12, 37, 42, 2, T.D); // south lane
    this.rect(m, 19, 16, 2, 7, T.D);
    this.rect(m, 44, 16, 2, 7, T.D);
    this.rect(m, 54, 14, 2, 9, T.D);
    this.rect(m, 31, 39, 3, 21, T.D);
    this.rect(m, 31, 3, 3, 2, T.B); // what remains of the bridge
    this.border(m, r, 3, (x, y) => (y <= 7) || (y >= 23 && y <= 25) || (x >= 31 && x <= 33 && y >= 56));
    for (let x = 0; x < 3; x++) for (let y = 5; y <= 7; y++) m.block.add(key(x, y));
    for (let x = VW - 3; x < VW; x++) for (let y = 5; y <= 7; y++) m.block.add(key(x, y));

    this.addBuilding(m, 'store', 16, 13, 8, 3, { door: { x: 19, y: 15 } });
    this.addBuilding(m, 'inn', 40, 12, 9, 4, { door: { x: 44, y: 15 } });
    this.addBuilding(m, 'smithy', 14, 34, 7, 3, { door: { x: 17, y: 36 } });
    this.addBuilding(m, 'guard', 42, 34, 7, 3, { msg: 'The guardhouse. The door is barred from inside.' });
    this.addBuilding(m, 'cottageA', 24, 34, 5, 3, { msg: 'Old Bram\'s cottage. Locked.' });
    this.addBuilding(m, 'cottageB', 35, 34, 5, 3, { msg: 'The Tolley house. Someone is coughing inside.' });
    this.addBuilding(m, 'shrine', 52, 10, 6, 4, { door: { x: 54, y: 13 } });

    this.addBuilding(m, 'stable', 5, 17, 6, 3, { msg: 'Whitlock Stables. Dara Whitlock keeps the horses here.' });
    for (let y = 20; y <= 22; y++) { this.add(m, 'fence', 4, y); this.add(m, 'fence', 11, y); }
    for (let x = 5; x <= 10; x++) this.add(m, 'fence', x, 22);
    this.add(m, 'well', 32, 24, { text: 'The town well. It has never once run dry, not in any year anyone can name.' });
    this.add(m, 'bench', 28, 20);
    this.add(m, 'bench', 36, 28);
    this.add(m, 'board', 36, 19);
    this.add(m, 'stall', 28, 27);
    [[26, 22], [38, 22], [26, 26], [38, 26], [20, 26], [46, 26], [18, 39], [47, 39], [34, 8], [30, 15]].forEach(([x, y]) => this.add(m, 'lamp', x, y));
    [[25, 15], [25, 16], [39, 16], [15, 17], [24, 17], [49, 17]].forEach(([x, y]) => this.add(m, 'flowers', x, y));
    [[14, 16], [15, 16], [40, 39], [41, 39]].forEach(([x, y]) => this.add(m, 'crate', x, y));
    this.add(m, 'barrel', 39, 17); this.add(m, 'barrel', 13, 37);
    this.add(m, 'crate', 40, 37, { tolley: true });

    this.add(m, 'sign', 30, 6, { text: 'BRIDGE OUT. By order of the Crown. Do not cross. The sign is older than the post it is nailed to.' });
    this.add(m, 'sign', 3, 21, { text: 'West: Ashgrove Farm.' });
    this.add(m, 'sign', VW - 5, 22, { text: 'East: the King\'s Road. Passage by royal writ only.' });
    this.add(m, 'sign', 30, 55, { text: 'South: Greywood. Road closed since the rockfall.' });
    this.add(m, 'log', 31, 57, { text: 'A fallen trunk blocks the road into Greywood. It would take far more than your axe.' });
    this.add(m, 'gate', VW - 3, 23, { text: 'The King\'s Gate. Barred. A royal writ would open it.' });
    this.add(m, 'gate', VW - 3, 24, { text: 'The King\'s Gate. Barred. A royal writ would open it.' });
    this.add(m, 'gate', VW - 3, 25, { text: 'The King\'s Gate. Barred. A royal writ would open it.' });

    // Graveyard
    for (let x = 57; x <= 60; x++) { this.add(m, 'fence', x, 15); this.add(m, 'fence', x, 22); }
    for (let y = 15; y <= 22; y++) this.add(m, 'fence', 57, y);
    const graves = [
      [58, 17, 'Hesper Vane. Year 99 of the reign. "She kept bees."'],
      [59, 19, 'Corin Tolley. Year 81 of the reign. Lost at the river.'],
      [60, 17, 'Adla Brandt. Year 113 of the reign.'],
      [58, 20, 'Tomas Reed. Year 76 of the reign. "A fair man." The oldest stone here.'],
      [60, 20, 'Unmarked. Fresh flowers, though.'],
    ];
    graves.forEach(([x, y, text]) => this.add(m, 'grave', x, y, { text }));

    // Trees dotted through town
    [[8, 12], [12, 12], [7, 30], [10, 40], [24, 9], [40, 9], [51, 30], [55, 42], [24, 42], [6, 10], [48, 8], [14, 9], [56, 33]].forEach(([x, y]) =>
      this.add(m, 'btree', x, y, { kind: r() < 0.3 ? 'pine' : 'oak', v: Math.floor(r() * 4) }));
    [[23, 31], [41, 31], [10, 33], [52, 41], [11, 10]].forEach(([x, y]) => this.add(m, 'bush', x, y));
    m.warps.push({ x: 0, y: 23, to: 'farm', tx: 58, ty: 23, dir: DIRS.left }, { x: 0, y: 24, to: 'farm', tx: 58, ty: 24, dir: DIRS.left }, { x: 0, y: 25, to: 'farm', tx: 58, ty: 25, dir: DIRS.left });
  },

  room(id, name, w, h, floor, wall) {
    const m = this.newMap(id, name, w, h, T.X, { indoor: true, wall });
    this.rect(m, 1, 1, w - 2, 2, T.V);
    this.rect(m, 1, 3, w - 2, h - 4, floor);
    this.set(m, Math.floor(w / 2), h - 1, floor);
    return m;
  },

  buildHouse() {
    const m = this.room('house', 'Farmhouse', 12, 11, T.F);
    this.rect(m, 4, 5, 4, 3, T.R);
    this.add(m, 'bed', 9, 3); this.add(m, 'lettertable', 3, 3); this.add(m, 'chair', 5, 3);
    this.add(m, 'fireplace', 6, 2); this.add(m, 'bookshelf', 1, 2, {}); this.add(m, 'stove', 1, 5, { text: 'The stove still works. Use the Craft tab in your menu to cook and make things.' });
    this.add(m, 'homechest', 1, 7);
    this.add(m, 'plant', 10, 8); this.add(m, 'window_i', 4, 1); this.add(m, 'picture', 9, 1);
    m.warps.push({ x: 6, y: 10, to: 'farm', tx: 12, ty: 9, dir: DIRS.down });
  },
  buildStore() {
    const m = this.room('store', 'Hale\'s Goods', 14, 11, T.F, ['#b8c9a0', '#a4b68c', '#7a8c62']);
    for (let x = 2; x <= 9; x++) this.add(m, 'counter', x, 5);
    this.add(m, 'shelf', 2, 2); this.add(m, 'shelf', 5, 2); this.add(m, 'shelf', 8, 2);
    this.add(m, 'shelf', 11, 6); this.add(m, 'barrel', 11, 3); this.add(m, 'crate', 12, 3); this.add(m, 'crate', 1, 8); this.add(m, 'barrel', 2, 8);
    this.add(m, 'window_i', 11, 1); this.add(m, 'plant', 12, 8);
    m.warps.push({ x: 7, y: 10, to: 'village', tx: 19, ty: 16, dir: DIRS.down });
  },
  buildInn() {
    const m = this.room('inn', 'The Sleeping Hen', 16, 12, T.F, ['#c4a07a', '#b08c66', '#7d5f42']);
    for (let x = 2; x <= 8; x++) this.add(m, 'counter', x, 5);
    this.rect(m, 11, 6, 3, 4, T.R);
    this.add(m, 'shelf', 2, 2); this.add(m, 'shelf', 5, 2); this.add(m, 'fireplace', 11, 2);
    this.add(m, 'barrel', 8, 3); this.add(m, 'table', 3, 8); this.add(m, 'chair', 2, 8); this.add(m, 'chair', 5, 8);
    this.add(m, 'table', 11, 8); this.add(m, 'chair', 13, 8); this.add(m, 'window_i', 9, 1); this.add(m, 'picture', 14, 1);
    m.warps.push({ x: 8, y: 11, to: 'village', tx: 44, ty: 16, dir: DIRS.down });
  },
  buildSmithy() {
    const m = this.room('smithy', 'Brandt\'s Forge', 12, 10, T.ST, ['#8d8378', '#7a7166', '#5f574c']);
    this.add(m, 'forge', 8, 2); this.add(m, 'anvil', 3, 5); this.add(m, 'barrel', 1, 3); this.add(m, 'crate', 1, 7); this.add(m, 'crate', 10, 7); this.add(m, 'shelf', 3, 2);
    m.warps.push({ x: 6, y: 9, to: 'village', tx: 17, ty: 37, dir: DIRS.down });
  },
  buildShrine() {
    const m = this.room('shrine', 'Shrine of the Green', 12, 11, T.ST, ['#d0c8b8', '#bdb5a5', '#968e7e']);
    this.rect(m, 5, 3, 2, 7, T.R);
    this.add(m, 'altar', 5, 2, { text: 'A green shoot, tended daily. Every shrine in the kingdom keeps one, in thanks for the harvest.' });
    [[2, 5], [3, 5], [8, 5], [9, 5], [2, 7], [3, 7], [8, 7], [9, 7]].forEach(([x, y]) => this.add(m, 'pew', x, y));
    this.add(m, 'plant', 1, 3); this.add(m, 'plant', 10, 3); this.add(m, 'window_i', 2, 1); this.add(m, 'window_i', 9, 1);
    m.warps.push({ x: 6, y: 10, to: 'village', tx: 54, ty: 14, dir: DIRS.down });
  },

  link() {
    const addDoor = (from, b, to, tx, ty) => this.maps[from].warps.push({ x: b.x, y: b.y, to, tx, ty, dir: DIRS.up, door: true });
    addDoor('farm', { x: 12, y: 8 }, 'house', 6, 9);
    addDoor('village', { x: 19, y: 15 }, 'store', 7, 9);
    addDoor('village', { x: 44, y: 15 }, 'inn', 8, 10);
    addDoor('village', { x: 17, y: 36 }, 'smithy', 6, 8);
    addDoor('village', { x: 54, y: 13 }, 'shrine', 6, 9);
    const closes = { store: [540, 1140, 'Hale\'s Goods is closed. Open 9:00 to 19:00.'], smithy: [480, 1080, 'The forge is cold. Open 8:00 to 18:00.'], inn: [600, 1560, 'The Hen does not open until 10:00.'] };
    this.maps.village.warps.forEach(w => { if (closes[w.to]) w.hours = closes[w.to]; });
  },

  // The next map to walk through on the way from one map to another (NPC routing).
  nextHop(fromId, toId) {
    if (fromId === toId) return null;
    const seen = new Set([fromId]), queue = [[fromId, null]];
    while (queue.length) {
      const [id, first] = queue.shift();
      for (const w of this.maps[id].warps) {
        if (seen.has(w.to)) continue;
        const via = first || w;
        if (w.to === toId) return via;
        seen.add(w.to); queue.push([w.to, via]);
      }
    }
    return null;
  },

  // BFS across walkable tiles; returns [[x,y],...] excluding the start.
  path(m, sx, sy, tx, ty) {
    if (sx === tx && sy === ty) return [];
    const W = m.w, prev = new Int32Array(W * m.h).fill(-1), start = sy * W + sx, goal = ty * W + tx;
    const q = [start]; prev[start] = start;
    for (let head = 0; head < q.length; head++) {
      const cur = q[head];
      if (cur === goal) break;
      const cx = cur % W, cy = (cur - cx) / W;
      for (let d = 0; d < 4; d++) {
        const nx = cx + DX[d], ny = cy + DY[d];
        if (nx < 0 || ny < 0 || nx >= W || ny >= m.h) continue;
        const n = ny * W + nx;
        if (prev[n] !== -1) continue;
        if (this.solid(m, nx, ny) && n !== goal) continue;
        prev[n] = cur; q.push(n);
      }
    }
    if (prev[goal] === -1) return null;
    const out = [];
    for (let c = goal; c !== start; c = prev[c]) out.push([c % W, Math.floor(c / W)]);
    return out.reverse();
  },

  serialize() {
    const out = {};
    for (const id in this.maps) {
      const m = this.maps[id], objs = [];
      if (m.transient) continue;
      m.objs.forEach(o => { if (OBJDEF[o.type].dyn) objs.push(o); });
      out[id] = { objs, soil: m.soil };
    }
    return out;
  },
  deserialize(data) {
    for (const id in data) {
      const m = this.maps[id]; if (!m) continue;
      [...m.objs.values()].forEach(o => { if (OBJDEF[o.type].dyn) this.remove(m, o); });
      data[id].objs.forEach(o => { const { type, x, y, ...rest } = o; if (!m.block.has(key(x, y))) this.add(m, type, x, y, rest); });
      m.soil = data[id].soil || {};
      // Older saves could have a tree or rock sitting on a doorway.
      m.warps.forEach(w => { const o = this.at(m, w.x, w.y); if (o && OBJDEF[o.type].dyn) this.remove(m, o); delete m.soil[key(w.x, w.y)]; });
      m.version++;
    }
  },
};
