'use strict';
// Stage 3 places: Greywood, the Ironback mountains, Saltmere coast, the Old Keep,
// and the procedurally dug Deep Mine.

Object.assign(OBJDEF, {
  copper_node: { solid: 1, dyn: 1, tool: 'pick', hp: 3, drops: [['copper', 1, 3], ['stone', 0, 1]], xp: ['mining', 8] },
  iron_node: { solid: 1, dyn: 1, tool: 'pick', hp: 5, minLvl: 1, drops: [['iron', 1, 3], ['stone', 0, 1]], xp: ['mining', 14] },
  gold_node: { solid: 1, dyn: 1, tool: 'pick', hp: 7, minLvl: 2, drops: [['gold_ore', 1, 2]], xp: ['mining', 24] },
  gem_node: { solid: 1, dyn: 1, tool: 'pick', hp: 5, minLvl: 1, drops: [['quartz', 1, 2], ['amethyst', 0, 1]], xp: ['mining', 20] },
  rubble: { solid: 1, dyn: 1, tool: 'pick', hp: 6, minLvl: 1, xp: ['mining', 10] },
  hardrubble: { solid: 1, dyn: 1, tool: 'pick', hp: 8, minLvl: 2, xp: ['mining', 16] },
  crackwall: { solid: 1, dyn: 1, tool: 'pick', hp: 4, minLvl: 1, xp: ['mining', 10] },
  thicket: { solid: 1, dyn: 1, tool: 'scythe', hp: 1, act: 'read' },
  chest: { solid: 1, act: 'chest' },
  ladder: { act: 'ladder' },
  stairs: { act: 'stairs' },
  tent: { solid: 1, fw: 3, fh: 2 },
  campfire: { solid: 1, light: 1 },
  wreck: { solid: 1, fw: 4, fh: 2 },
  palm: { solid: 1 },
  iron_door: { solid: 1, fw: 3, act: 'irondoor' },
  torch: { flat: 1, light: 1 },
  archway: { flat: 1 },
  statue: { solid: 1, act: 'read' },
});
OBJDEF.log.act = 'log';

Object.assign(World, {
  // Carves open clearings joined by L-shaped trails out of solid forest or rock.
  wilds(m, r, clearings, trails, o) {
    const open = new Uint8Array(m.w * m.h);
    const mark = (x, y) => { if (x >= 0 && y >= 0 && x < m.w && y < m.h) open[y * m.w + x] = 1; };
    clearings.forEach(([cx, cy, rad]) => {
      for (let y = cy - rad; y <= cy + rad; y++) for (let x = cx - rad; x <= cx + rad; x++) if (Math.hypot(x - cx, y - cy) <= rad) mark(x, y);
    });
    const laid = [];
    trails.forEach(([a, b, wide = 3]) => {
      const half = wide >> 1;
      const lay = (x, y) => { for (let j = -half; j <= half; j++) for (let i = -half; i <= half; i++) { mark(x + i, y + j); laid.push([x + i, y + j]); } };
      for (let x = Math.min(a[0], b[0]); x <= Math.max(a[0], b[0]); x++) lay(x, a[1]);
      for (let y = Math.min(a[1], b[1]); y <= Math.max(a[1], b[1]); y++) lay(b[0], y);
    });
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      if (open[y * m.w + x]) continue;
      if (o.rock) this.set(m, x, y, T.ROCK);
      else {
        m.block.add(key(x, y));
        if ((x + y) % 2 === 0) this.add(m, 'btree', x, y, { kind: r() < (o.pines || 0.5) ? 'pine' : 'oak', v: Math.floor(r() * 4) });
      }
    }
    laid.forEach(([x, y]) => this.set(m, x, y, o.road));
    return open;
  },

  edge(m, tiles, to, tx, ty, dir, axis) {
    tiles.forEach((p, i) => m.warps.push({ x: p[0], y: p[1], to, tx: axis === 'x' ? tx + i : tx, ty: axis === 'y' ? ty + i : ty, dir }));
  },

  buildRegions() {
    this.buildGreywood(); this.buildIronback(); this.buildCoast(); this.buildKeep(); this.buildSmugglers();
    const row = (x, y0) => [[x, y0], [x, y0 + 1], [x, y0 + 2]];
    const col = (x0, y) => [[x0, y], [x0 + 1, y], [x0 + 2, y]];
    const { village, greywood, ironback, saltmere } = this.maps;
    this.edge(village, col(31, village.h - 1), 'greywood', 44, 1, DIRS.down, 'x');
    this.edge(greywood, col(44, 0), 'village', 31, village.h - 2, DIRS.up, 'x');
    this.edge(greywood, row(89, 22), 'ironback', 1, 23, DIRS.right, 'y');
    this.edge(ironback, row(0, 23), 'greywood', 88, 22, DIRS.left, 'y');
    this.edge(greywood, row(0, 51), 'saltmere', 82, 20, DIRS.left, 'y');
    this.edge(saltmere, row(83, 20), 'greywood', 1, 51, DIRS.right, 'y');
    saltmere.warps.push({ x: 9, y: 7, to: 'keep', tx: 28, ty: 41, dir: DIRS.up, door: true, needs: 'keep_seal', closedMsg: 'The gate bears a Crown seal. It will not open for you.' });
    saltmere.warps.push({ x: 20, y: 2, to: 'smugglers', tx: 9, ty: 10, dir: DIRS.up, door: true });
    this.maps.keep.warps.push({ x: 28, y: 43, to: 'saltmere', tx: 9, ty: 8, dir: DIRS.down });
    this.maps.smugglers.warps.push({ x: 9, y: 11, to: 'saltmere', tx: 20, ty: 4, dir: DIRS.down });
  },

  buildGreywood() {
    const m = this.newMap('greywood', 'Greywood', 90, 64, T.G, { region: true, forage: ['mushroom', 'herb', 'hazelnut', 'blackberry', 'ghostcap'] });
    const r = mulberry(7001);
    this.wilds(m, r, [[45, 7, 7], [45, 27, 10], [20, 24, 9], [73, 23, 8], [45, 50, 11], [14, 52, 7], [77, 50, 6], [13, 8, 5]], [
      [[45, 0], [45, 7]], [[45, 7], [45, 27]], [[45, 27], [20, 24]], [[45, 27], [73, 23]], [[45, 27], [45, 40]],
      [[45, 50], [14, 52]], [[14, 52], [0, 52]], [[73, 23], [89, 23]], [[20, 24], [13, 8]], [[73, 23], [75, 44], 1],
      [[37, 31], [30, 31], 1], [[30, 31], [30, 58], 1], [[30, 58], [14, 54], 1],
    ], { road: T.D, pines: 0.62 });
    // The side trail past the camp is narrow, and the bandits watch it.
    [[75, 37], [75, 38], [75, 39]].forEach(([x, y]) => this.add(m, 'thicket', x, y, { text: 'The brambles here are thicker than they should be, and something has trodden them down from the far side. A scythe would clear them.' }));
    this.add(m, 'sign', 47, 12, { text: 'Greywood. Travellers keep to the road. The road does not keep to itself.' });
    this.add(m, 'sign', 47, 36, { text: 'South road to Saltmere. TOLL. Someone has added underneath: "pay it."' });
    this.add(m, 'sign', 71, 19, { text: 'East: the Ironback Pass. Mine works closed by Crown order, then quietly reopened.' });
    this.add(m, 'tent', 38, 45); this.add(m, 'tent', 50, 44); this.add(m, 'tent', 38, 53); this.add(m, 'tent', 51, 53);
    this.add(m, 'campfire', 45, 50);
    this.add(m, 'chest', 56, 51, { cid: 'gw_camp', loot: { gold: 400, items: [['arrow', 12], ['salve', 2]] } });
    this.add(m, 'chest', 78, 50, { cid: 'gw_glade', loot: { gold: 150, items: [['relic_horse', 1], ['hunting_knife', 1]] } });
    this.add(m, 'chest', 11, 6, { cid: 'gw_hut', loot: { gold: 80, items: [['relic_key', 1], ['salve', 1]] } });
    this.add(m, 'statue', 13, 11, { text: 'A statue of the King, set up here in the deep woods where no one would see it. He looks exactly as he does on this year\'s coins. The moss on it is very old.' });
    m.spawns = [
      { t: 'thornling', x: 20, y: 24, n: 4, r: 6 }, { t: 'thornling', x: 45, y: 24, n: 2, r: 5 }, { t: 'wolf', x: 66, y: 24, n: 2, r: 3 },
      { t: 'wolf', x: 14, y: 12, n: 2, r: 2 }, { t: 'thornling', x: 76, y: 50, n: 3, r: 3 }, { t: 'bandit', x: 42, y: 48, n: 2, r: 2 },
      { t: 'bandit', x: 48, y: 53, n: 2, r: 2 }, { t: 'archer', x: 33, y: 50, n: 1, r: 1 }, { t: 'archer', x: 54, y: 46, n: 1, r: 1 }, { t: 'bandit', x: 30, y: 46, n: 1, r: 0 },
      { t: 'rusk', x: 45, y: 42, n: 1, r: 0, if: () => Memory.get('camp_war') },
    ];
  },

  buildIronback() {
    const m = this.newMap('ironback', 'Ironback Pass', 72, 46, T.MTN, { region: true, forage: ['herb', 'mushroom'], ores: [['copper_node', 6], ['iron_node', 2]] });
    const r = mulberry(7102);
    this.wilds(m, r, [[6, 24, 6], [24, 22, 9], [44, 14, 8], [60, 10, 7], [36, 36, 7], [63, 35, 6], [10, 9, 6]], [
      [[0, 24], [6, 24]], [[6, 24], [24, 22]], [[24, 22], [10, 9]], [[24, 22], [44, 14]], [[44, 14], [60, 10]], [[24, 22], [36, 36]], [[36, 36], [63, 35]],
    ], { rock: true, road: T.D });
    [13, 14, 15].forEach(y => this.add(m, 'rubble', 53, y));
    [35, 36, 37].forEach(y => this.add(m, 'crackwall', 47, y));
    this.addBuilding(m, 'minehead', 58, 4, 5, 2, { act: 'mine' });
    this.add(m, 'sign', 55, 9, { text: 'THE DEEP MINE. Property of the Crown. A ladder is hidden under a rock on every floor. Bring a lamp. Bring a friend. Leave your name with someone.' });
    this.add(m, 'sign', 50, 11, { text: 'Rockfall. A copper pickaxe could shift this.' });
    this.add(m, 'chest', 64, 34, { cid: 'ib_hidden', loot: { gold: 300, items: [['iron', 6], ['quartz', 2], ['relic_roster', 1]] } });
    for (let i = 0; i < 16; i++) { const [cx, cy] = pickClearing(r); this.scatterAt(m, r, cx, cy, 'rock'); }
    function pickClearing(rand) { const c = [[24, 22], [44, 14], [36, 36]][Math.floor(rand() * 3)]; return [c[0] + Math.floor(rand() * 11) - 5, c[1] + Math.floor(rand() * 11) - 5]; }
    m.spawns = [{ t: 'rockcrab', x: 24, y: 22, n: 3, r: 6 }, { t: 'wolf', x: 44, y: 14, n: 3, r: 4 }, { t: 'rockcrab', x: 36, y: 36, n: 2, r: 4 }, { t: 'rockcrab', x: 62, y: 35, n: 2, r: 3 }];
  },
  scatterAt(m, r, x, y, type) { if (!this.solid(m, x, y) && this.g(m, x, y) === T.MTN) this.add(m, type, x, y); },

  buildCoast() {
    const m = this.newMap('saltmere', 'Saltmere Coast', 84, 44, T.S, { region: true, sea: true, forage: ['herb', 'blackberry'] });
    const r = mulberry(7203);
    this.rect(m, 0, 34, 84, 10, T.W);
    this.rect(m, 0, 0, 84, 9, T.G);
    this.rect(m, 9, 8, 3, 13, T.D);
    this.rect(m, 9, 20, 75, 3, T.D);
    for (let y = 0; y < 34; y++) for (let x = 0; x < 84; x++) {
      const inRing = y < 3 || x < 3 || (x >= 81 && !(y >= 20 && y <= 22));
      if (!inRing || x === 20) { if (!(x === 20 && y < 2)) continue; }
      m.block.add(key(x, y));
      if ((x + y) % 2 === 0 && x !== 20) this.add(m, 'palm', x, y);
    }
    this.set(m, 20, 2, T.CAVE); this.set(m, 20, 1, T.CAVE);
    this.add(m, 'archway', 20, 2);
    this.add(m, 'hardrubble', 20, 3);
    this.addBuilding(m, 'keepfront', 4, 4, 10, 4, { door: { x: 9, y: 7 } });
    this.addBuilding(m, 'hut', 60, 9, 5, 2, { msg: 'Wick\'s hut. It smells of tar and old fish.' });
    this.add(m, 'wreck', 30, 30);
    this.add(m, 'chest', 36, 32, { cid: 'sm_wreck', loot: { gold: 220, items: [['relic_manifest', 1], ['arrow', 10]] } });
    this.add(m, 'sign', 12, 12, { text: 'THE OLD KEEP. Sealed by order of the Crown. Trespass is treason.' });
    this.add(m, 'sign', 60, 18, { text: 'Saltmere. Population: varies.' });
    for (let i = 0; i < 26; i++) { const x = 5 + Math.floor(r() * 74), y = 24 + Math.floor(r() * 8); if (!this.solid(m, x, y)) this.add(m, 'rock', x, y); }
    for (let i = 0; i < 16; i++) { const x = 16 + Math.floor(r() * 60), y = 4 + Math.floor(r() * 4); if (!this.solid(m, x, y)) this.add(m, 'palm', x, y); }
    m.spawns = [{ t: 'saltclaw', x: 30, y: 26, n: 4, r: 6 }, { t: 'saltclaw', x: 58, y: 28, n: 3, r: 6 }, { t: 'saltclaw', x: 14, y: 28, n: 2, r: 4 }];
  },

  buildSmugglers() {
    const m = this.room('smugglers', 'Smugglers\' Hollow', 18, 12, T.CAVE, ['#4e453c', '#3e362e', '#2a241e']);
    m.indoor = true; m.dark = true; m.region = true;
    this.add(m, 'crate', 3, 4); this.add(m, 'crate', 4, 4); this.add(m, 'barrel', 13, 4); this.add(m, 'barrel', 14, 4); this.add(m, 'torch', 5, 2); this.add(m, 'torch', 12, 2);
    this.add(m, 'chest', 15, 8, { cid: 'sm_hollow', loot: { gold: 700, items: [['amethyst', 2], ['quartz', 3]] } });
    this.add(m, 'sign', 8, 3, { text: 'Chalked on the wall: "Grain out by night. Nothing in. The King\'s men are paid to look at the sea."' });
    m.spawns = [{ t: 'smuggler', x: 8, y: 6, n: 3, r: 3 }];
  },

  buildKeep() {
    const m = this.newMap('keep', 'The Old Keep', 56, 44, T.X, { indoor: true, dark: true, region: true, wall: ['#55555f', '#46464e', '#30303a'] });
    const room = (x, y, w, h) => {
      for (let j = y - 2; j < y; j++) for (let i = x; i < x + w; i++) if (this.g(m, i, j) === T.X) this.set(m, i, j, T.V);
      this.rect(m, x, y, w, h, T.ST);
    };
    room(23, 34, 11, 8); room(20, 20, 17, 9); room(4, 20, 11, 9); room(42, 20, 10, 9); room(17, 4, 23, 11);
    this.rect(m, 27, 29, 3, 5, T.ST); this.rect(m, 15, 24, 5, 2, T.ST); this.rect(m, 37, 24, 5, 2, T.ST); this.rect(m, 27, 15, 3, 5, T.ST);
    this.set(m, 28, 42, T.ST); this.set(m, 28, 43, T.ST);
    this.add(m, 'iron_door', 27, 17);
    this.add(m, 'chest', 6, 26, { cid: 'keep_key', loot: { gold: 120, items: [['keep_key', 1]] } });
    this.add(m, 'chest', 49, 26, { cid: 'keep_arch', loot: { gold: 260, items: [['amethyst', 2], ['salve', 2]] } });
    this.add(m, 'chest', 28, 6, { cid: 'keep_roll', loot: { gold: 500, items: [['tithe_roll', 1]] }, needs: 'warden' });
    this.add(m, 'statue', 21, 21, { text: 'The King, young. The plaque reads "Year 1." Every statue of him, in every year, is the same face.' });
    this.add(m, 'statue', 35, 21, { text: 'The King, young. The plaque reads "Year 60." It is the same face.' });
    [[25, 33], [31, 33], [23, 19], [33, 19], [7, 19], [46, 19], [20, 3], [36, 3]].forEach(([x, y]) => this.add(m, 'torch', x, y));
    m.spawns = [{ t: 'drowned', x: 28, y: 36, n: 1, r: 1 }, { t: 'drowned', x: 28, y: 24, n: 3, r: 4 }, { t: 'drowned', x: 9, y: 24, n: 3, r: 3 }, { t: 'drowned', x: 46, y: 24, n: 2, r: 3 }, { t: 'warden', x: 28, y: 9, n: 1, r: 0 }];
  },

  // Things that stay changed once the story has changed them.
  applyFlags() {
    // The King's Gate and the fallen log are found wherever they stand, not by fixed squares.
    if (Inv.count('royal_writ') || Memory.get('got_writ')) [...this.maps.village.objs.values()].filter(o => o.type === 'gate').forEach(o => this.remove(this.maps.village, o));
    Story.applyEnding(false);
    const v = this.maps.village, k = this.maps.keep;
    if (Memory.get('road_cleared')) [...v.objs.values()].filter(o => o.type === 'log').forEach(o => this.remove(v, o));
    if (S.opened.keep_door) { const o = this.at(k, 27, 17); if (o) this.remove(k, o); }
  },
});

const Mine = {
  floor: 0, serial: 0,

  oreFor(floor, r) {
    const roll = r();
    if (floor >= 12 && roll < 0.1) return 'gem_node';
    if (floor >= 18 && roll < 0.42) return 'gold_node';
    if (floor >= 6 && roll < 0.75) return 'iron_node';
    return 'copper_node';
  },

  enter(floor) {
    this.floor = floor;
    this.broken = 0;
    S.mineMax = Math.max(S.mineMax || 0, floor);
    const m = this.build(floor);
    Foes.mapId = null;
    Player.place('mine', m.start[0] * TILE + 8, m.start[1] * TILE + 12, DIRS.down);
    Memory.deed('mine_' + Math.floor(floor / 5) * 5, floor >= 5 ? `Reached floor ${Math.floor(floor / 5) * 5} of the Deep Mine.` : 'Went down into the Deep Mine.');
  },

  build(floor) {
    const w = 44, h = 32;
    const m = World.newMap('mine', 'Deep Mine, Floor ' + floor, w, h, T.ROCK, { indoor: true, dark: true, transient: true, ores: null });
    m.version = ++this.serial;
    const r = mulberry(floor * 991 + absDay() * 7 + this.serial);
    let grid = new Uint8Array(w * h);
    for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) grid[y * w + x] = r() < 0.54 ? 1 : 0;
    for (let pass = 0; pass < 4; pass++) {
      const next = new Uint8Array(w * h);
      for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) {
        let n = 0;
        for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) n += grid[(y + j) * w + x + i];
        next[y * w + x] = n >= 5 ? 1 : 0;
      }
      grid = next;
    }
    // Keep only the biggest connected cave.
    const seen = new Uint8Array(w * h);
    let best = [];
    for (let i = 0; i < w * h; i++) {
      if (!grid[i] || seen[i]) continue;
      const q = [i]; seen[i] = 1;
      for (let head = 0; head < q.length; head++) {
        const c = q[head];
        for (const n of [c - 1, c + 1, c - w, c + w]) if (grid[n] && !seen[n]) { seen[n] = 1; q.push(n); }
      }
      if (q.length > best.length) best = q;
    }
    const open = best.map(i => [i % w, Math.floor(i / w)]);
    open.forEach(([x, y]) => World.set(m, x, y, T.CAVE));

    const pick1 = () => open[Math.floor(r() * open.length)];
    const start = pick1();
    m.start = start;
    const far = (p, d) => Math.hypot(p[0] - start[0], p[1] - start[1]) >= d;
    // The way back up sits beside the arrival point.
    const beside = open.find(p => Math.abs(p[0] - start[0]) + Math.abs(p[1] - start[1]) === 1);
    if (beside) World.add(m, 'stairs', beside[0], beside[1]);
    // A note by the arrival point explains how to go deeper.
    const noteAt = open.find(p => Math.abs(p[0] - start[0]) <= 1 && Math.abs(p[1] - start[1]) <= 1 && (p[0] !== start[0] || p[1] !== start[1]) && !World.at(m, p[0], p[1]));
    if (noteAt) World.add(m, 'sign', noteAt[0], noteAt[1], { text: floor < 30
      ? `Floor ${floor}. A miner's note: The way down is a ladder hidden under one of the rocks on this floor. Look for the rock with a crack running through it and break it with your pickaxe. Any rock might hide one, so keep breaking. These stairs only go back up.`
      : 'Floor 30. A miner\'s note: This is as deep as anyone has dug. The stairs go back up.' });
    const rocks = [];
    open.forEach(p => {
      if (!far(p, 3) || World.at(m, p[0], p[1])) return;
      const roll = r();
      if (roll < 0.05 + Math.min(floor, 30) * 0.002) World.add(m, this.oreFor(floor, r), p[0], p[1]);
      else if (roll < 0.34) { const o = World.add(m, 'rock', p[0], p[1]); if (o) rocks.push(o); }
    });
    if (floor < 30) {
      const candidates = rocks.filter(o => far([o.x, o.y], 10));
      const chosen = (candidates.length ? candidates : rocks)[Math.floor(r() * (candidates.length || rocks.length))];
      if (chosen) chosen.ladder = true;
      else { const p = open.find(q => far(q, 8) && !World.at(m, q[0], q[1])); if (p) World.add(m, 'ladder', p[0], p[1]); }
    }
    const treasure = { 5: { gold: 200, items: [['copper', 8], ['salve', 1]] }, 10: { gold: 400, items: [['iron', 6], ['quartz', 2]] }, 15: { gold: 500, items: [['relic_tally', 1], ['amethyst', 1]] }, 20: { gold: 800, items: [['gold_ore', 5], ['salve', 3]] }, 25: { gold: 1000, items: [['amethyst', 3]] }, 30: { gold: 2000, items: [['relic_bell', 1], ['gold_ore', 6]] } }[floor];
    if (treasure && !S.opened['mine' + floor]) {
      const p = open.filter(q => far(q, 9)).find(q => { const o = World.at(m, q[0], q[1]); return !o || o.type === 'rock' && !o.ladder; });
      if (p) { const o = World.at(m, p[0], p[1]); if (o) World.remove(m, o); World.add(m, 'chest', p[0], p[1], { cid: 'mine' + floor, loot: treasure }); }
    }
    const types = Mine.creatures(floor);
    const count = Math.min(14, 4 + Math.floor(floor / 3));
    m.spawns = [];
    for (let i = 0; i < count * 6 && m.spawns.length < count; i++) {
      const p = pick1();
      if (far(p, 9) && !World.solid(m, p[0], p[1])) m.spawns.push({ t: types[Math.floor(r() * types.length)], x: p[0], y: p[1], n: 1, r: 0, scale: 1 + floor * 0.035 });
    }
    return m;
  },
};
