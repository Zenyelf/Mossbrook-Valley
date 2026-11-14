'use strict';
// DLC places: a house behind every door, the Black Wing, Gull's Teeth and the Red Gull.

Object.assign(OBJDEF, {
  eye: { flat: 1, tool: 'pick', hp: 2 },
  lever: { solid: 1, act: 'lever' },
  hatch: { flat: 1, act: 'hatch' },
  sigildoor: { solid: 1, fw: 3, act: 'sigil' },
  celldoor: { solid: 1, act: 'celldoor' },
  prisoner: { solid: 1, act: 'prisoner' },
  uniformlocker: { solid: 1, act: 'uniform' },
  kesdesk: { solid: 1, fw: 2, act: 'kessick' },
  mast: { solid: 1 },
  cannon: { solid: 1 },
  cage: { solid: 1, act: 'cage' },
  skiff: { solid: 1, act: 'sail' },
  rowboat: { solid: 1, act: 'row' },
  shiphatch: { flat: 1, act: 'shiphatch' },
});
OBJDEF.wreck.act = 'wreck';

(() => {
  const { mk, P, outlined, blob, STATIC, ICONS } = Art;
  STATIC.eye = () => mk(16, 16, g => { P(g, '#3c3c46', 3, 3, 10, 10); P(g, '#55555f', 4, 4, 8, 8); P(g, '#c8e8ff', 5, 5, 6, 6); P(g, '#d4405a', 7, 7, 2, 2); P(g, '#ffffff', 6, 6, 1, 1); });
  STATIC.lever = () => outlined(mk(16, 20, g => { P(g, '#55555f', 3, 12, 10, 7); P(g, '#787884', 3, 12, 10, 2); P(g, '#7a5535', 7, 2, 2, 11); P(g, '#c43030', 6, 0, 4, 3); }));
  STATIC.hatch = () => mk(16, 16, g => { P(g, '#5f4128', 1, 1, 14, 14); P(g, '#7a5535', 2, 2, 12, 12); for (let i = 4; i < 13; i += 4) P(g, '#4a301d', 2, i, 12, 1); P(g, '#55555f', 6, 6, 4, 4); });
  STATIC.sigildoor = () => outlined(mk(48, 40, g => {
    P(g, '#24242c', 0, 0, 48, 40); P(g, '#3c3c46', 2, 2, 44, 38); for (let x = 6; x < 46; x += 8) P(g, '#24242c', x, 2, 2, 38);
    P(g, '#14141a', 20, 14, 8, 10); P(g, '#c9a06a', 22, 16, 4, 6);
  }));
  STATIC.celldoor = () => outlined(mk(16, 22, g => { P(g, '#3c3c46', 0, 2, 16, 20); for (let x = 2; x < 16; x += 4) P(g, '#14141a', x, 4, 2, 16); P(g, '#c9a06a', 12, 11, 2, 3); }));
  STATIC.prisoner = () => outlined(mk(16, 20, g => {
    P(g, '#c8b098', 5, 3, 7, 7); P(g, '#8a8478', 4, 1, 9, 3); P(g, '#2a2420', 6, 6, 1, 1); P(g, '#2a2420', 10, 6, 1, 1);
    P(g, '#6a655c', 3, 10, 11, 8); P(g, '#504c44', 3, 17, 11, 2);
  }));
  STATIC.uniformlocker = () => STATIC.locker();
  STATIC.kesdesk = () => outlined(mk(32, 26, g => {
    P(g, '#3c3c46', 1, 4, 30, 12); P(g, '#55555f', 1, 4, 30, 2); P(g, '#24242c', 3, 16, 3, 10); P(g, '#24242c', 26, 16, 3, 10);
    P(g, '#efe2c8', 6, 6, 8, 6); P(g, '#2a2a32', 18, 5, 10, 6); P(g, '#c43030', 22, 7, 2, 2);
  }));
  STATIC.mast = () => outlined(mk(40, 72, g => {
    P(g, '#6f4c30', 18, 4, 4, 68); P(g, '#8a6239', 18, 4, 1, 68); P(g, '#6f4c30', 4, 12, 32, 3);
    P(g, '#e8e0d0', 6, 15, 28, 30); P(g, '#c4baa6', 6, 40, 28, 5); P(g, '#b23a3a', 14, 22, 12, 12); P(g, '#e8e0d0', 18, 26, 4, 4);
  }));
  STATIC.cannon = () => outlined(mk(20, 14, g => { P(g, '#3c3c46', 2, 3, 16, 6); P(g, '#55555f', 2, 3, 16, 2); P(g, '#14141a', 17, 4, 2, 4); P(g, '#6f4c30', 4, 9, 4, 4); P(g, '#6f4c30', 12, 9, 4, 4); }));
  STATIC.cage = () => outlined(mk(20, 24, g => {
    P(g, '#3c3c46', 0, 0, 20, 2); P(g, '#3c3c46', 0, 22, 20, 2); for (let x = 0; x < 20; x += 4) P(g, '#55555f', x, 2, 2, 20);
    P(g, '#c8a080', 7, 6, 6, 6); P(g, '#6a7a8a', 6, 12, 8, 9);
  }));
  STATIC.skiff = () => outlined(mk(48, 30, g => {
    P(g, '#6f4c30', 4, 16, 40, 10); P(g, '#8a6239', 6, 16, 36, 3); P(g, '#57391f', 8, 24, 32, 3);
    P(g, '#6f4c30', 22, 0, 3, 18); P(g, '#e8e0d0', 25, 2, 14, 13); P(g, '#c4baa6', 25, 12, 14, 3);
  }));
  STATIC.rowboat = () => outlined(mk(28, 16, g => { P(g, '#6f4c30', 2, 5, 24, 8); P(g, '#8a6239', 4, 5, 20, 2); P(g, '#57391f', 6, 11, 16, 2); P(g, '#a07a4c', 8, 2, 2, 12); }));
  STATIC.shiphatch = () => STATIC.hatch();
  STATIC.shipfixed = () => outlined(mk(72, 64, g => {
    P(g, '#6f4c30', 4, 42, 62, 20); P(g, '#8a6239', 4, 42, 62, 3); P(g, '#57391f', 8, 58, 54, 4);
    for (let x = 6; x < 66; x += 7) P(g, '#57391f', x, 46, 1, 14);
    P(g, '#6f4c30', 34, 0, 4, 44); P(g, '#e8e0d0', 18, 6, 34, 26); P(g, '#c4baa6', 18, 28, 34, 4); P(g, '#3f6fa8', 30, 12, 10, 10);
  }));
  Object.assign(ICONS, {
    uniform: g => { P(g, '#3c3c46', 3, 3, 10, 11); P(g, '#2a2a32', 3, 3, 2, 11); P(g, '#c9a06a', 7, 4, 2, 2); P(g, '#c9a06a', 7, 8, 2, 2); P(g, '#7a5535', 3, 9, 10, 1); },
    vial: g => { P(g, '#7a5535', 6, 1, 4, 3); P(g, '#c8d0dc', 4, 4, 8, 10); P(g, '#8a92a0', 5, 7, 6, 6); P(g, '#ffffff', 5, 5, 2, 2); },
    sigil: g => { P(g, '#24242c', 3, 2, 10, 12); P(g, '#55555f', 4, 3, 8, 10); P(g, '#c9a06a', 7, 5, 2, 6); P(g, '#c9a06a', 5, 7, 6, 2); },
    spyglass: g => { for (let i = 0; i < 12; i++) P(g, i < 4 ? '#a08038' : '#c9a06a', 2 + i, 11 - i * 0.6, 2, 3); P(g, '#7dbbe6', 13, 3, 2, 2); },
  });
  Art.FOE_ART.hound = { w: 26, h: 18, draw(g, f) {
    const s = f ? 1 : -1;
    P(g, '#3a3036', 6, 7, 14, 6); P(g, '#2a2228', 6, 11, 14, 2); P(g, '#4a4046', 7, 7, 10, 1);
    P(g, '#3a3036', 18, 4, 6, 6); P(g, '#2a2228', 22, 7, 3, 3); P(g, '#e04030', 21, 5, 1, 1); P(g, '#c9a06a', 17, 9, 3, 2);
    P(g, '#2a2228', 2, 6, 5, 2); P(g, '#2a2228', 8 + s, 13, 2, 4); P(g, '#2a2228', 16 - s, 13, 2, 4); P(g, '#1a1418', 11 - s, 13, 2, 4); P(g, '#1a1418', 18 + s, 13, 2, 4);
  } };
  Art.FOE_ART.gull = { w: 18, h: 12, draw(g, f) {
    P(g, '#f0f0f0', 7, 4, 5, 4); P(g, '#2a2a2a', 10, 5); P(g, '#e8a020', 12, 6, 2, 1);
    if (f) { P(g, '#d8d8d8', 1, 2, 6, 3); P(g, '#d8d8d8', 12, 2, 5, 3); P(g, '#3a3a3a', 1, 2, 2, 1); P(g, '#3a3a3a', 15, 2, 2, 1); }
    else { P(g, '#d8d8d8', 1, 6, 6, 3); P(g, '#d8d8d8', 12, 6, 5, 3); }
  } };
})();

Object.assign(World, {
  buildDLC() {
    this.buildHouses();
    this.buildBlackWing(); this.buildIsle(); this.buildShip(); this.buildHold();
    this.add(this.maps.gaol, 'hatch', 26, 16);
  },

  // A locked door into a small home, with its own owner and things to steal.
  house(mapId, type, door, id, name, owner, fill) {
    const out = this.maps[mapId], b = out.buildings.find(q => q.type === type && (!q.door || q.door.x === door[0]));
    b.door = { x: door[0], y: door[1] }; delete b.msg;
    out.block.delete(key(door[0], door[1])); this.set(out, door[0], door[1], T.D);
    out.warps.push({ x: door[0], y: door[1], to: id, tx: 5, ty: 7, dir: DIRS.up, door: true, locked: true });
    const m = this.room(id, name, 10, 9, T.F, ['#cbb48c', '#b8a078', '#8a7452']);
    m.owner = owner;
    m.warps.push({ x: 5, y: 8, to: mapId, tx: door[0], ty: door[1] + 1, dir: DIRS.down });
    fill(m);
    return m;
  },

  buildHouses() {
    const gh = this.house('village', 'guard', [45, 36], 'guardhouse', 'The Guardhouse', 'odile', m => {
      this.add(m, 'bed', 7, 3); this.add(m, 'lockbox', 1, 3); this.add(m, 'crate', 2, 3); this.add(m, 'table', 3, 5); this.add(m, 'barrel', 8, 6);
    });
    gh.bed = [7, 3];
    const wh = this.house('saltmere', 'hut', [62, 10], 'wick_home', 'Wick\'s Hut', 'wick', m => {
      this.add(m, 'bed', 7, 3); this.add(m, 'lockbox', 1, 3); this.add(m, 'barrel', 2, 3); this.add(m, 'crate', 1, 6);
    });
    wh.bed = [7, 3];
    // The paddock gets a gate so the stable door can be reached.
    const v = this.maps.village, gate = this.at(v, 10, 22); if (gate) this.remove(v, gate);
    const dh = this.house('village', 'stable', [8, 19], 'dara_home', 'Whitlock Stables', 'dara', m => {
      this.add(m, 'bed', 7, 3); this.add(m, 'lockbox', 1, 3); this.add(m, 'barrel', 2, 3); this.add(m, 'crate', 3, 3); this.add(m, 'barrel', 1, 6);
    });
    dh.bed = [7, 3];
    const fill = m => { this.add(m, 'bookshelf', 1, 2); this.add(m, 'lockbox', 8, 3); this.add(m, 'table', 3, 5); this.add(m, 'plant', 8, 6); };
    this.house('capital', 'cottageA', [10, 11], 'townhouse_a', 'A Courtier\'s House', 'king', fill);
    this.house('capital', 'cottageB', [10, 31], 'townhouse_b', 'A Townhouse', 'king', fill);
    this.house('capital', 'store', [17, 36], 'granary', 'The Royal Granary', 'king', m => { for (let x = 1; x <= 8; x += 2) { this.add(m, 'barrel', x, 3); this.add(m, 'crate', x + 1, 3); } this.add(m, 'crate', 1, 6); this.add(m, 'crate', 8, 6); });
  },

  buildBlackWing() {
    const m = this.newMap('blackwing', 'The Black Wing', 52, 40, T.X, { indoor: true, dark: true, region: true, wall: ['#3c3c46', '#30303a', '#24242c'] });
    const room = (x, y, w, h, floor = T.ST) => {
      for (let j = y - 2; j < y; j++) for (let i = x; i < x + w; i++) if (this.g(m, i, j) === T.X) this.set(m, i, j, T.V);
      this.rect(m, x, y, w, h, floor);
    };
    room(20, 31, 11, 7); room(3, 17, 46, 3); room(3, 4, 14, 9); room(19, 3, 13, 7, T.F); room(35, 3, 14, 8); room(2, 23, 18, 12); room(32, 23, 17, 10, T.F);
    this.rect(m, 24, 10, 3, 21, T.ST); this.rect(m, 8, 13, 3, 4, T.ST); this.rect(m, 41, 11, 3, 6, T.ST); this.rect(m, 8, 20, 3, 3, T.ST); this.rect(m, 40, 20, 3, 3, T.ST);
    this.rect(m, 25, 38, 1, 2, T.ST);
    const shut = id => S && S.opened[id];
    if (!shut('bw_kessick')) this.add(m, 'sigildoor', 24, 11, { cid: 'bw_kessick' });
    if (!shut('bw_corvin')) this.add(m, 'sigildoor', 41, 13, { cid: 'bw_corvin' });
    if (!shut('bw_records')) this.add(m, 'sigildoor', 40, 21, { cid: 'bw_records' });
    // The west cell block: four cells behind bars.
    const doors = [4, 8, 12, 17];
    for (let x = 2; x <= 19; x++) if (!doors.includes(x)) this.add(m, 'bars', x, 26);
    [6, 10, 14].forEach(x => { for (let y = 23; y <= 25; y++) this.add(m, 'bars', x, y); });
    const PRISONERS = [
      { pid: 'p1', name: 'A woman with no name', line: 'I had a name. I had a husband who used it. I said it to myself every morning for the first ten years. Then one morning I could not remember the first letter.' },
      { pid: 'p2', name: 'A man with no name', line: 'Year 98. I asked a Crown clerk why my brother was on the levy list. That was the whole of my crime. Is it still Year 98?' },
      { pid: 'p3', name: 'A boy, grown old', line: 'They brought me down here when I was nine, for singing a song about the river. I do not remember the song any more. I remember the river.' },
      { pid: 'ysolde', name: 'Ysolde', line: 'I made the bargain, child. I went down to the river and I told the thing that lives there what Oswin wanted. It is not gone. You starved it. Things that are starved go looking for food.' },
    ];
    doors.forEach((x, i) => {
      if (!shut('cell' + i)) this.add(m, 'celldoor', x, 26, { cell: i });
      if (!shut('pris' + i)) this.add(m, 'prisoner', [3, 8, 12, 17][i], 24, Object.assign({ cell: i }, PRISONERS[i]));
    });
    this.add(m, 'uniformlocker', 29, 32);
    this.add(m, 'lever', 5, 5);
    this.add(m, 'chest', 14, 5, { cid: 'bw_sigil', loot: { gold: 150, items: [['warden_sigil', 1], ['smoke_vial', 2]] } });
    this.add(m, 'chest', 46, 25, { cid: 'bw_ledger', loot: { gold: 400, items: [['black_ledger', 1], ['smoke_vial', 1]] } });
    this.add(m, 'kesdesk', 24, 4);
    // Watcher Eyes: [x, y, facing in radians, sweep].
    [[23, 22, 0, 0.6], [27, 27, Math.PI, 0.6], [12, 16, Math.PI / 2, 1.0], [33, 16, Math.PI / 2, 1.0], [21, 30, Math.PI / 2 - 0.5, 0.5], [16, 22, Math.PI / 2 + 0.3, 0.7], [44, 22, Math.PI / 2, 0.8], [9, 3, Math.PI / 2, 0.7], [45, 2, Math.PI / 2 + 0.4, 0.6]].forEach(([x, y, base, sweep], i) => {
      if (!shut(`eye:${x},${y}`)) this.add(m, 'eye', x, y, { base, sweep, spd: 0.7 + (i % 3) * 0.2, ph: i * 1.3, watch: 0 });
    });
    [[28, 30], [5, 16], [44, 16], [9, 22], [36, 22], [30, 2], [40, 2]].forEach(([x, y]) => this.add(m, 'torch', x, y));
    m.spawns = [
      { t: 'gaoler', x: 25, y: 22, n: 2, r: 2, if: () => !Memory.get('kessick_done') }, { t: 'gaoler', x: 12, y: 18, n: 1, r: 1, if: () => !Memory.get('kessick_done') },
      { t: 'gaoler', x: 38, y: 18, n: 1, r: 1, if: () => !Memory.get('kessick_done') }, { t: 'hound', x: 10, y: 31, n: 2, r: 3, if: () => !Memory.get('kessick_done') },
      { t: 'crossbow', x: 40, y: 28, n: 2, r: 3, if: () => !Memory.get('kessick_done') }, { t: 'gaoler', x: 9, y: 8, n: 1, r: 2, if: () => !Memory.get('kessick_done') },
    ];
    m.warps.push({ x: 25, y: 39, to: 'gaol', tx: 25, ty: 15, dir: DIRS.down });
  },

  buildIsle() {
    const m = this.newMap('gullsteeth', 'Gull\'s Teeth', 60, 44, T.W, { region: true, sea: true, isle: true, forage: ['blackberry', 'herb'] });
    const r = mulberry(1300);
    for (let y = 0; y < 44; y++) for (let x = 0; x < 60; x++) {
      const dx = (x - 30) / 25, dy = (y - 21) / 16, d = dx * dx + dy * dy + Math.sin(x * 0.7 + y) * 0.04;
      if (d < 1) this.set(m, x, y, d < 0.4 ? T.G : T.S);
    }
    this.rect(m, 29, 36, 3, 7, T.B); this.rect(m, 29, 1, 3, 5, T.B);
    this.add(m, 'skiff', 29, 43); this.add(m, 'rowboat', 30, 0);
    this.add(m, 'tent', 24, 16); this.add(m, 'tent', 34, 15); this.add(m, 'campfire', 30, 21);
    this.add(m, 'chest', 10, 24, { cid: 'isle_cache', loot: { gold: 600, items: [['pearl', 2], ['smoke_vial', 2]] } });
    this.add(m, 'sign', 32, 34, { text: 'Gull\'s Teeth. Somebody has carved a red gull into the post, and underneath it: "TURN BACK."' });
    for (let i = 0; i < 40; i++) { const x = 6 + Math.floor(r() * 48), y = 6 + Math.floor(r() * 32); if (this.g(m, x, y) === T.S && !this.at(m, x, y) && Math.abs(x - 30) > 2) this.add(m, 'palm', x, y); }
    m.spawns = [
      { t: 'pirate', x: 28, y: 22, n: 3, r: 3, if: () => !Memory.get('vane_done') }, { t: 'gunner', x: 35, y: 19, n: 1, r: 1, if: () => !Memory.get('vane_done') },
      { t: 'gull', x: 15, y: 30, n: 3, r: 4 }, { t: 'gull', x: 46, y: 14, n: 2, r: 3 },
    ];
  },

  buildShip() {
    const m = this.newMap('redgull', 'The Red Gull', 44, 22, T.W, { region: true, sea: true });
    this.rect(m, 4, 6, 36, 10, T.F); this.set(m, 21, 16, T.F);
    for (let x = 3; x <= 40; x++) { this.add(m, 'fence', x, 5); if (x !== 21) this.add(m, 'fence', x, 16); }
    for (let y = 6; y <= 15; y++) { this.add(m, 'fence', 3, y); this.add(m, 'fence', 40, y); }
    this.add(m, 'mast', 12, 10); this.add(m, 'mast', 28, 10);
    [[7, 7], [15, 7], [23, 7], [31, 7], [7, 14], [15, 14], [31, 14]].forEach(([x, y]) => this.add(m, 'cannon', x, y));
    this.add(m, 'barrel', 36, 7); this.add(m, 'barrel', 37, 7); this.add(m, 'crate', 36, 14);
    this.add(m, 'shiphatch', 34, 10);
    this.add(m, 'rowboat', 21, 17);
    m.spawns = [
      { t: 'pirate', x: 10, y: 12, n: 2, r: 2, if: () => !Memory.get('vane_done') }, { t: 'pirate', x: 30, y: 12, n: 2, r: 2, if: () => !Memory.get('vane_done') },
      { t: 'gunner', x: 20, y: 8, n: 2, r: 2, if: () => !Memory.get('vane_done') }, { t: 'brute', x: 34, y: 13, n: 1, r: 0, if: () => !Memory.get('vane_done') },
    ];
  },

  buildHold() {
    const m = this.room('hold', 'The Hold', 30, 12, T.F, ['#6f4c30', '#5f4128', '#4a301d']);
    m.dark = true; m.region = true;
    [5, 13, 21].forEach((x, i) => { if (!(S && S.opened['cage' + i])) this.add(m, 'cage', x, 4, { cage: i }); });
    [[2, 8], [3, 8], [26, 4], [27, 4], [26, 8]].forEach(([x, y]) => this.add(m, 'barrel', x, y));
    this.add(m, 'torch', 9, 2); this.add(m, 'torch', 19, 2);
    m.spawns = [{ t: 'pirate', x: 15, y: 7, n: 2, r: 3, if: () => !Memory.get('vane_done') }, { t: 'brute', x: 24, y: 7, n: 1, r: 0, if: () => !Memory.get('vane_done') }];
    m.warps.push({ x: 15, y: 11, to: 'redgull', tx: 34, ty: 11, dir: DIRS.down });
  },
});
