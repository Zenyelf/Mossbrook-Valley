'use strict';
// Stage 4 places: Ironback Gaol, the two cottages you can break into, Marta's
// garden, and the art for all of it.

Object.assign(OBJDEF, {
  bunk: { solid: 1, act: 'jailbed' },
  bars: { solid: 1 },
  rockpile: { solid: 1, fw: 2, act: 'labor' },
  washtub: { solid: 1, act: 'labor' },
  kettle: { solid: 1, act: 'labor' },
  grate: { flat: 1, act: 'grate' },
  locker: { solid: 1, act: 'locker' },
  lockbox: { solid: 1 },
});
const STEALABLE = new Set(['shelf', 'barrel', 'crate', 'bookshelf', 'lockbox']);

(() => {
  const { mk, P, outlined, STATIC, ICONS, house_defs } = Art;
  STATIC.bunk = () => outlined(mk(16, 24, g => {
    P(g, '#6f4c30', 1, 4, 14, 19); P(g, '#8a6239', 1, 4, 14, 2); P(g, '#a8a090', 2, 6, 12, 5); P(g, '#7a7266', 2, 11, 12, 10); P(g, '#8a8478', 2, 11, 12, 2);
  }));
  STATIC.bars = () => outlined(mk(16, 22, g => {
    P(g, '#3c3c46', 0, 2, 16, 2); P(g, '#3c3c46', 0, 19, 16, 2);
    for (let x = 1; x < 16; x += 4) { P(g, '#55555f', x, 2, 2, 19); P(g, '#787884', x, 2, 1, 19); }
  }));
  STATIC.rockpile = () => outlined(mk(32, 22, g => {
    const r = mulberry(5);
    for (const [x, y, s] of [[8, 15, 6], [20, 16, 7], [14, 9, 5], [26, 12, 4]]) Art.blob(g, x, y, s, ['#5f5f66', '#78787f', '#94949c', '#b6b6be'], r);
    P(g, '#7a5535', 3, 4, 2, 12); P(g, '#55555f', 0, 2, 8, 4);
  }));
  STATIC.washtub = () => outlined(mk(16, 16, g => {
    P(g, '#8a6239', 1, 6, 14, 9); P(g, '#55555f', 1, 8, 14, 1); P(g, '#55555f', 1, 12, 14, 1); P(g, '#e8f0f8', 2, 4, 12, 3); P(g, '#ffffff', 4, 3, 3, 2); P(g, '#c8d8e8', 9, 3, 3, 2);
  }));
  STATIC.kettle = () => outlined(mk(16, 20, g => {
    P(g, '#3c3c46', 2, 6, 12, 9); P(g, '#55555f', 2, 6, 12, 2); P(g, '#c8b080', 3, 4, 10, 3); P(g, '#e0602c', 4, 16, 8, 3); P(g, '#f4a23a', 6, 17, 4, 2); P(g, '#3c3c46', 1, 15, 2, 4); P(g, '#3c3c46', 13, 15, 2, 4);
  }));
  STATIC.grate = () => mk(16, 16, g => {
    P(g, '#3c3c46', 2, 2, 12, 12); P(g, '#14100c', 3, 3, 10, 10);
    for (let i = 4; i < 13; i += 3) P(g, '#55555f', i, 3, 1, 10);
  });
  STATIC.grateopen = () => mk(16, 16, g => { P(g, '#3c3c46', 2, 2, 12, 12); P(g, '#0a0806', 3, 3, 10, 10); P(g, '#55555f', 10, 0, 5, 3); });
  STATIC.locker = () => outlined(mk(16, 28, g => {
    P(g, '#55555f', 1, 1, 14, 26); P(g, '#6e6e7a', 1, 1, 14, 2); P(g, '#3c3c46', 7, 3, 1, 23);
    for (let y = 5; y < 12; y += 2) { P(g, '#3c3c46', 3, y, 3, 1); P(g, '#3c3c46', 10, y, 3, 1); }
    P(g, '#c9a06a', 5, 15, 1, 3); P(g, '#c9a06a', 9, 15, 1, 3);
  }));
  STATIC.lockbox = () => outlined(mk(16, 14, g => {
    P(g, '#55555f', 1, 3, 14, 10); P(g, '#787884', 1, 3, 14, 2); P(g, '#3c3c46', 1, 8, 14, 1); P(g, '#c9a06a', 7, 6, 2, 4);
  }));
  house_defs.gaol = {
    tw: 8, wallH: 52, roofH: 30, slope: 4, stone: true, wall: ['#6c6c74', '#85858d', '#4e4e56'], roof: ['#3c3c46', '#4e4e58', '#2a2a32'], windows: [1, 6],
    deco(g, x0, wy, W, H) {
      for (let x = 0; x < W; x += 16) P(g, '#4e4e56', x0 + x, 0, 10, 6);
      for (const col of [1, 6]) for (let i = 3; i < 14; i += 4) P(g, '#2a2a32', x0 + col * 16 + 1 + i, wy + 8, 1, 14);
      P(g, '#2a2a32', x0 + 50, H - 34, 28, 34); for (let x = 52; x < 78; x += 4) P(g, '#55555f', x0 + x, H - 32, 2, 32); P(g, '#55555f', x0 + 50, H - 22, 28, 2);
      P(g, '#7a2f30', x0 + 40, wy + 4, 8, 16); P(g, '#7a2f30', x0 + 80, wy + 4, 8, 16);
    },
  };
  Object.assign(ICONS, {
    lockpick: g => { P(g, '#b4bcc8', 3, 7, 10, 1); P(g, '#b4bcc8', 12, 5, 1, 3); P(g, '#7a5535', 2, 6, 3, 3); P(g, '#b4bcc8', 4, 10, 8, 1); P(g, '#b4bcc8', 11, 10, 1, 2); },
    boots: g => { P(g, '#5a4a3a', 3, 3, 4, 9); P(g, '#5a4a3a', 3, 11, 7, 3); P(g, '#3a2e24', 3, 13, 7, 1); P(g, '#6e5c4a', 9, 4, 4, 8); P(g, '#6e5c4a', 9, 11, 6, 3); P(g, '#3a2e24', 9, 13, 6, 1); },
    ironbar: g => { for (let i = 0; i < 11; i++) P(g, '#78787f', 3 + i, 12 - i, 2, 2); P(g, '#a0a0a8', 12, 2, 2, 1); },
    medal: g => { P(g, '#7a2f30', 5, 1, 2, 6); P(g, '#3f6fa8', 9, 1, 2, 6); P(g, '#e0b85a', 4, 7, 8, 7); P(g, '#a87f2e', 5, 8, 6, 5); P(g, '#f7dd7a', 7, 9, 2, 2); },
    book: (g, a, b) => { P(g, a, 3, 2, 10, 12); P(g, b, 3, 2, 2, 12); P(g, '#efe2c8', 12, 3, 1, 10); P(g, '#e0b85a', 7, 6, 3, 1); },
  });
})();

Object.assign(World, {
  buildStage4() {
    const v = this.maps.village, ib = this.maps.ironback;
    // Cottage doors open into real rooms now, if you can get past the lock.
    const door = (type, x, y, to) => {
      const b = v.buildings.find(q => q.type === type);
      b.door = { x, y }; v.block.delete(key(x, y)); this.set(v, x, y, T.D);
      v.warps.push({ x, y, to, tx: 5, ty: 7, dir: DIRS.up, door: true, locked: true });
    };
    door('cottageA', 26, 36, 'bram_home');
    door('cottageB', 37, 36, 'tolley_home');

    const home = (id, name, owner) => {
      const m = this.room(id, name, 10, 9, T.F, ['#cbb48c', '#b8a078', '#8a7452']);
      m.owner = owner;
      m.warps.push({ x: 5, y: 8, to: 'village', tx: id === 'bram_home' ? 26 : 37, ty: 37, dir: DIRS.down });
      return m;
    };
    const bh = home('bram_home', 'Bram\'s Cottage', 'bram');
    this.add(bh, 'bed', 6, 3); this.add(bh, 'lockbox', 1, 3); this.add(bh, 'bookshelf', 2, 2); this.add(bh, 'table', 2, 5); this.add(bh, 'chair', 4, 5); this.add(bh, 'plant', 8, 6);
    bh.bed = [6, 3];
    const th = home('tolley_home', 'Tolley House', 'marga');
    this.add(th, 'bed', 1, 3); this.add(th, 'crate', 8, 3); this.add(th, 'barrel', 7, 3); this.add(th, 'lockbox', 8, 6); this.add(th, 'table', 4, 6);

    // Things in the village that belong to someone.
    [[14, 16, 'marta'], [15, 16, 'marta'], [40, 39, 'odile'], [41, 39, 'odile'], [39, 17, 'sera'], [13, 37, 'ivo']].forEach(([x, y, owner]) => { const o = this.at(v, x, y); if (o) o.owner = owner; });
    v.gardens = [{ x: 21, y: 18, w: 4, h: 3, owner: 'marta' }];
    Object.assign(this.maps.store, { owner: 'marta' }); Object.assign(this.maps.inn, { owner: 'sera' });
    Object.assign(this.maps.smithy, { owner: 'ivo' }); Object.assign(this.maps.shrine, { owner: 'ansa' });

    // Ironback Gaol stands at the top of the pass.
    this.addBuilding(ib, 'gaol', 6, 4, 8, 3, { act: 'gaolgate' });
    this.add(ib, 'sign', 5, 12, { text: 'A culvert runs up from here, under the gaol wall.', culvert: true });
    this.buildGaol();
  },

  buildGaol() {
    const m = this.newMap('gaol', 'Ironback Gaol', 30, 22, T.X, { indoor: true, wall: ['#6c6c74', '#5a5a62', '#44444c'] });
    const room = (x, y, w, h, floor) => {
      for (let j = y - 2; j < y; j++) for (let i = x; i < x + w; i++) if (this.g(m, i, j) === T.X) this.set(m, i, j, T.V);
      this.rect(m, x, y, w, h, floor);
    };
    room(1, 3, 15, 3, T.ST); room(18, 2, 11, 5, T.D); room(1, 7, 28, 2, T.ST);
    room(1, 12, 8, 5, T.ST); room(11, 12, 6, 5, T.ST); room(19, 12, 10, 6, T.F);
    [3, 8, 13].forEach(x => this.set(m, x, 6, T.ST));
    [4, 13, 23].forEach(x => this.rect(m, x, 9, 1, 3, T.ST));
    this.rect(m, 24, 18, 1, 4, T.ST);
    for (let y = 3; y <= 5; y++) { this.add(m, 'bars', 5, y); this.add(m, 'bars', 10, y); }
    this.add(m, 'bunk', 1, 3); this.add(m, 'bunk', 6, 3); this.add(m, 'bunk', 14, 3);
    this.add(m, 'rockpile', 22, 3, { task: 'rocks' });
    this.add(m, 'washtub', 2, 13, { task: 'laundry' }); this.add(m, 'washtub', 3, 13, { task: 'laundry' });
    this.add(m, 'kettle', 12, 13, { task: 'kitchen' }); this.add(m, 'kettle', 15, 13, { task: 'kitchen' });
    this.add(m, 'grate', 6, 15);
    this.add(m, 'locker', 27, 13);
    this.add(m, 'table', 21, 13); this.add(m, 'chair', 23, 13); this.add(m, 'barrel', 19, 16); this.add(m, 'crate', 1, 16);
    [[7, 1], [24, 0], [5, 10], [14, 10], [24, 10]].forEach(([x, y]) => this.add(m, 'torch', x, y));
    m.warps.push({ x: 24, y: 21, to: 'ironback', tx: 10, ty: 8, dir: DIRS.down, jail: true });
  },
});
