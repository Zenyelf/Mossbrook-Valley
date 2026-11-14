'use strict';
// Evergreen Castle and the Evergreen Garden.
// The old palace is now a castle: corner towers, a keep, a central spire, banners and a
// great gate. Inside, a whole household: the Grand Foyer, the Ballroom, the Hall of Kings
// (which leads to the Throne Room, exactly as before), the Banquet Hall, the Library, the
// Kitchens, the Treasury, the Royal Bedchamber and the Chapel, full of nobles in gowns,
// servants, guards, dancers, musicians and a jester.
// The Evergreen Court outside becomes a formal garden: hedges, topiary, roses, flowerbeds
// and lily ponds, with gardeners, strollers, children and gossip.
// Loaded after life.js.

// ---- New furniture and garden pieces ----------------------------------------------------
Object.assign(OBJDEF, {
  hedge: { solid: 1 }, topiary: { solid: 1 }, rosebush: { solid: 1 }, flowerbed: { flat: 1 }, lily: { flat: 1 }, birdbath: { solid: 1, act: 'read' }, easel: { solid: 1 },
  candelabra: { solid: 1, light: 1 }, armorstand: { solid: 1, act: 'read' }, vase: { solid: 1 }, banquet: { solid: 1, fw: 4 }, goldpile: { solid: 1 },
  crowncase: { solid: 1, fw: 2, act: 'read' }, goldstatue: { solid: 1, act: 'read' }, globe: { solid: 1, act: 'read' }, castlebanner: { flat: 1 }, tapestry: { flat: 1 },
  canopybed: { solid: 1, fw: 3, fh: 2, act: 'read' }, harpsi: { solid: 1, fw: 2, act: 'read' },
});
(() => {
  const { mk, P, outlined, STATIC } = Art;
  const GOLD = '#e8c040', GOLDD = '#a88020', GOLDL = '#fff0a0';
  Object.assign(STATIC, {
    hedge: () => outlined(mk(16, 18, g => { P(g, '#2f6a35', 0, 4, 16, 14); P(g, '#3f8a45', 1, 4, 14, 4); P(g, '#24502a', 0, 15, 16, 3); for (let i = 0; i < 6; i++) P(g, '#4f9a52', 1 + i * 2.5, 5 + (i % 2) * 4, 2, 2); })),
    topiary: () => outlined(mk(16, 26, g => { P(g, '#7a5535', 7, 20, 2, 6); P(g, '#a0703c', 4, 23, 8, 3); P(g, '#2f6a35', 3, 11, 10, 9); P(g, '#3f8a45', 4, 11, 6, 3); P(g, '#2f6a35', 5, 3, 6, 7); P(g, '#3f8a45', 6, 3, 3, 2); P(g, '#2f6a35', 7, 0, 2, 3); })),
    rosebush: () => outlined(mk(16, 16, g => { P(g, '#2f6a35', 1, 4, 14, 12); P(g, '#3f8a45', 2, 4, 10, 3); [[3, 6, '#d4405a'], [8, 5, '#f07090'], [12, 8, '#d4405a'], [5, 11, '#f07090'], [10, 12, '#d4405a'], [6, 8, '#ffd0e0']].forEach(([x, y, c]) => { P(g, c, x, y, 2, 2); }); })),
    flowerbed: () => mk(16, 16, g => { P(g, '#6a4a30', 1, 2, 14, 13); P(g, '#7a5a3a', 1, 2, 14, 2); const c = ['#f0d040', '#e870a8', '#ffffff', '#9a70e0', '#f08a30']; for (let i = 0; i < 9; i++) { P(g, '#4f9642', 2 + (i % 3) * 5, 4 + Math.floor(i / 3) * 4, 3, 2); P(g, c[i % 5], 3 + (i % 3) * 5, 3 + Math.floor(i / 3) * 4, 2, 2); } }),
    lily: () => mk(16, 16, g => { P(g, '#4f9642', 3, 6, 9, 5); P(g, '#74b84d', 4, 6, 4, 2); P(g, '#3d86c6', 7, 8, 2, 3); P(g, '#ffd0e0', 9, 4, 3, 3); P(g, '#ffffff', 10, 4); }),
    birdbath: () => outlined(mk(16, 22, g => { P(g, '#c2c2c8', 6, 9, 4, 11); P(g, '#a4a4ab', 4, 18, 8, 4); P(g, '#c2c2c8', 1, 5, 14, 4); P(g, '#7dbbe6', 3, 5, 10, 2); P(g, '#8a8a98', 9, 2, 3, 3); })),
    easel: () => outlined(mk(16, 26, g => { P(g, '#7a5535', 3, 6, 2, 20); P(g, '#7a5535', 11, 6, 2, 20); P(g, '#efe6d2', 2, 3, 12, 12); P(g, '#7ab0f0', 3, 4, 10, 5); P(g, '#4f9642', 3, 9, 10, 5); P(g, '#e870a8', 6, 10, 2, 2); P(g, '#f0d040', 9, 5, 2, 2); })),
    candelabra: () => outlined(mk(16, 28, g => { P(g, GOLDD, 7, 10, 2, 16); P(g, GOLD, 4, 24, 8, 3); P(g, GOLD, 2, 9, 12, 2); [2, 7, 12].forEach(x => { P(g, '#f4efe4', x, 4, 2, 5); P(g, '#ffe08a', x, 1, 2, 3); P(g, '#ff9a40', x, 2, 1, 1); }); })),
    armorstand: () => outlined(mk(16, 30, g => { P(g, '#6a4a30', 5, 26, 6, 4); P(g, '#c8d4e4', 4, 4, 8, 7); P(g, '#7c8aa0', 4, 9, 8, 1); P(g, '#2a2420', 5, 6, 6, 1); P(g, '#c43030', 7, 1, 2, 3); P(g, '#c8d4e4', 3, 11, 10, 9); P(g, '#f4f9ff', 4, 12, 2, 6); P(g, '#7c8aa0', 3, 20, 10, 1); P(g, '#c8d4e4', 4, 21, 3, 5); P(g, '#c8d4e4', 9, 21, 3, 5); P(g, GOLD, 7, 13, 2, 2); })),
    vase: () => outlined(mk(16, 24, g => { P(g, '#2a6ab0', 4, 12, 8, 10); P(g, '#3a7ac0', 5, 12, 3, 8); P(g, '#2a6ab0', 6, 9, 4, 3); P(g, GOLD, 4, 15, 8, 1); P(g, '#4f9642', 5, 4, 2, 6); P(g, '#4f9642', 9, 3, 2, 7); [[4, 2, '#f07090'], [9, 1, '#ffffff'], [7, 5, '#f0d040'], [11, 4, '#e870a8']].forEach(([x, y, c]) => P(g, c, x, y, 3, 3)); })),
    banquet: () => outlined(mk(64, 24, g => {
      P(g, '#6a4a30', 2, 14, 3, 10); P(g, '#6a4a30', 59, 14, 3, 10); P(g, '#ffffff', 0, 6, 64, 9); P(g, '#e0d8c8', 0, 13, 64, 2); P(g, GOLD, 0, 14, 64, 1);
      [[4, '#c86a30'], [14, '#e8b050'], [24, '#d4405a'], [34, '#8ad040'], [44, '#c86a30'], [54, '#e8b050']].forEach(([x, c]) => { P(g, '#c8ccd4', x, 6, 8, 2); P(g, c, x + 1, 3, 6, 4); });
      [10, 30, 50].forEach(x => { P(g, GOLD, x, 0, 2, 7); P(g, '#ffe08a', x, -1, 2, 2); });
    })),
    goldpile: () => outlined(mk(16, 14, g => { P(g, GOLDD, 1, 8, 14, 6); P(g, GOLD, 2, 5, 12, 6); P(g, GOLD, 4, 2, 8, 4); P(g, GOLDL, 5, 3, 3, 2); P(g, GOLDL, 10, 7, 2, 1); P(g, '#c43050', 8, 6, 2, 2); P(g, '#3a7ac0', 4, 9, 2, 2); })),
    crowncase: () => outlined(mk(32, 26, g => { P(g, '#5a3a2a', 2, 16, 28, 10); P(g, GOLD, 2, 16, 28, 2); P(g, 'rgba(200,230,255,0.55)', 3, 2, 26, 14); P(g, '#e0e8f0', 3, 2, 26, 1); P(g, '#8a2030', 8, 10, 16, 5); P(g, GOLD, 10, 6, 12, 5); P(g, GOLD, 10, 4, 2, 2); P(g, GOLD, 15, 3, 2, 3); P(g, GOLD, 20, 4, 2, 2); P(g, '#c43050', 15, 8, 2, 2); P(g, '#3a7ac0', 12, 8, 1, 1); P(g, '#3a7ac0', 19, 8, 1, 1); })),
    goldstatue: () => outlined(mk(16, 34, g => { P(g, '#a4a4ab', 2, 28, 12, 6); P(g, '#c2c2c8', 2, 28, 12, 2); P(g, GOLD, 5, 13, 6, 15); P(g, GOLDL, 6, 14, 2, 10); P(g, GOLD, 5, 6, 6, 7); P(g, GOLD, 5, 3, 6, 2); P(g, GOLD, 5, 1, 1, 2); P(g, GOLD, 7, 0, 2, 3); P(g, GOLD, 10, 1, 1, 2); P(g, GOLDD, 3, 14, 2, 9); P(g, GOLDD, 11, 14, 2, 9); })),
    globe: () => outlined(mk(16, 26, g => { P(g, '#6a4a30', 5, 20, 6, 6); P(g, '#7a5535', 7, 14, 2, 7); P(g, GOLD, 2, 2, 12, 1); P(g, GOLD, 2, 2, 1, 12); P(g, '#3a7ac0', 3, 3, 10, 10); P(g, '#4f9642', 4, 5, 4, 3); P(g, '#4f9642', 9, 8, 3, 4); P(g, '#ffffff', 5, 4, 1, 1); })),
    castlebanner: () => mk(16, 30, g => { P(g, GOLDD, 1, 0, 14, 2); P(g, '#2f6b45', 2, 2, 12, 24); P(g, '#3f8a5a', 3, 2, 3, 24); P(g, GOLD, 2, 2, 1, 24); P(g, GOLD, 13, 2, 1, 24); P(g, '#2f6b45', 2, 26, 5, 3); P(g, '#2f6b45', 9, 26, 5, 3); P(g, GOLD, 5, 9, 6, 4); P(g, GOLD, 5, 7, 1, 2); P(g, GOLD, 7, 6, 2, 3); P(g, GOLD, 10, 7, 1, 2); }),
    tapestry: () => mk(16, 30, g => { P(g, GOLDD, 0, 0, 16, 2); P(g, '#7a2f30', 1, 2, 14, 26); P(g, '#a8503a', 2, 3, 12, 24); P(g, '#e8c040', 4, 6, 8, 1); P(g, '#2f6b45', 5, 9, 6, 8); P(g, '#e8c040', 7, 11, 2, 4); P(g, '#e8c040', 4, 20, 8, 1); P(g, GOLD, 1, 28, 14, 2); }),
    canopybed: () => outlined(mk(48, 44, g => {
      P(g, GOLDD, 1, 0, 3, 44); P(g, GOLDD, 44, 0, 3, 44); P(g, '#2f6b45', 0, 0, 48, 6); P(g, GOLD, 0, 5, 48, 1); for (let x = 2; x < 46; x += 4) P(g, '#3f8a5a', x, 6, 2, 3);
      P(g, '#5a3a2a', 3, 18, 42, 22); P(g, '#ffffff', 5, 16, 38, 8); P(g, '#e0d8c8', 5, 22, 38, 2); P(g, '#2f6b45', 5, 24, 38, 14); P(g, '#3f8a5a', 5, 24, 38, 3); P(g, GOLD, 5, 37, 38, 1);
      P(g, '#f4efe4', 8, 12, 12, 6); P(g, '#f4efe4', 28, 12, 12, 6);
    })),
    harpsi: () => outlined(mk(32, 24, g => { P(g, '#5a3a2a', 2, 6, 28, 10); P(g, GOLD, 2, 6, 28, 1); P(g, '#ffffff', 4, 13, 24, 3); for (let x = 5; x < 28; x += 3) P(g, '#1a1a1a', x, 13, 1, 2); P(g, '#5a3a2a', 4, 16, 2, 8); P(g, '#5a3a2a', 26, 16, 2, 8); P(g, '#e8dcc4', 8, 2, 12, 4); })),
  });

  // ---- The castle, seen from the garden ------------------------------------------------
  const castle = (season, night) => outlined(mk(21 * 16 + 8, 140, g => {
    const W = 21 * 16 + 8, S1 = '#e8e0d0', S2 = '#d4ccbc', S3 = '#b8b0a0', ROOF = ['#2f6b45', '#3f8a5a', '#22502f'];
    const glass = night ? '#ffe08a' : '#3a4a6a', glassL = night ? '#fff4c0' : '#5a6a8a';
    const blocks = (x, y, w, h) => { P(g, S1, x, y, w, h); for (let r = 0; r * 6 < h; r++) { P(g, S2, x, y + r * 6 + 5, w, 1); for (let c = (r % 2) * 7; c < w; c += 14) P(g, S2, x + c, y + r * 6, 1, 5); } P(g, S3, x, y + h - 2, w, 2); };
    const merlons = (x, y, w) => { for (let i = 0; i < w; i += 8) P(g, S1, x + i, y, 5, 6); P(g, S2, x, y + 5, w, 1); };
    const cone = (cx, top, base, half) => { for (let y = top; y < base; y++) { const h = Math.round((y - top) / (base - top) * half); P(g, ROOF[(y - top) % 6 < 3 ? 0 : 1], cx - h, y, h * 2, 1); P(g, ROOF[2], cx - h, y, 1, 1); } if (season === 3) for (let y = top; y < top + 8; y++) { const h = Math.round((y - top) / (base - top) * half); P(g, '#f0f6fc', cx - h, y, h * 2, 1); } P(g, GOLD, cx - 1, top - 6, 2, 6); P(g, GOLDL, cx - 2, top - 7, 4, 2); };
    const flag = (x, y, c) => { P(g, '#5a4a3a', x, y, 1, 10); P(g, c, x + 1, y, 7, 4); P(g, c, x + 1, y + 4, 4, 1); };
    const arch = (x, y, w, h) => { P(g, '#5a5048', x - 1, y - 1, w + 2, h + 1); P(g, glass, x, y + 2, w, h - 2); P(g, glass, x + 1, y, w - 2, 2); P(g, glassL, x + 1, y + 2, 1, h - 4); P(g, '#5a5048', x + Math.floor(w / 2), y + 1, 1, h - 1); };
    // Curtain wall, battlements.
    blocks(20, 72, W - 40, 68); merlons(20, 66, W - 40);
    // The keep and its spire.
    blocks(110, 30, 124, 110); merlons(110, 24, 124);
    blocks(156, 8, 32, 40); cone(172, -2, 10, 18); flag(171, 0, '#c43030');
    // Corner towers.
    [[0, 44], [W - 44, 44]].forEach(([x, w]) => { blocks(x, 36, w, 104); merlons(x, 30, w); cone(x + w / 2, 2, 30, 24); flag(x + w / 2 - 1, 0, '#2f6b45'); arch(x + 16, 50, 12, 16); arch(x + 16, 86, 12, 16); });
    // Windows on the wall and keep.
    [60, 84, 252, 276].forEach(x => arch(x, 86, 10, 14));
    [126, 150, 186, 210].forEach(x => arch(x, 44, 10, 16));
    arch(165, 20, 14, 18);
    // Banners of the crown.
    [[122, 60], [212, 60]].forEach(([x, y]) => { P(g, GOLDD, x - 1, y, 14, 2); P(g, '#2f6b45', x, y + 2, 12, 34); P(g, GOLD, x, y + 2, 1, 34); P(g, GOLD, x + 11, y + 2, 1, 34); P(g, GOLD, x + 3, y + 12, 6, 4); P(g, GOLD, x + 5, y + 9, 2, 3); P(g, '#2f6b45', x, y + 36, 5, 3); P(g, '#2f6b45', x + 7, y + 36, 5, 3); });
    // A crown over the gate.
    P(g, GOLD, 160, 70, 24, 8); P(g, GOLD, 160, 66, 3, 4); P(g, GOLD, 170, 63, 4, 7); P(g, GOLD, 181, 66, 3, 4); P(g, '#c43050', 170, 72, 4, 3); P(g, GOLDL, 162, 71, 4, 1);
    // The great gate: an arch, oak doors banded with iron, the portcullis raised.
    P(g, S3, 150, 88, 44, 52); P(g, '#2a2420', 154, 92, 36, 48); P(g, '#2a2420', 158, 88, 28, 4);
    P(g, '#6a4a30', 156, 96, 32, 44); P(g, '#7a5535', 157, 96, 14, 44); P(g, '#7a5535', 173, 96, 14, 44);
    [104, 118, 132].forEach(y => P(g, '#3a3436', 156, y, 32, 2)); P(g, GOLD, 168, 116, 2, 4); P(g, GOLD, 174, 116, 2, 4);
    for (let x = 156; x < 188; x += 5) P(g, '#4a4446', x, 92, 1, 4);
    // Steps.
    P(g, '#c8c0b0', 142, 134, 60, 3); P(g, '#d8d0c0', 146, 137, 52, 3);
  }));
  const building = Art.building;
  Art.building = (type, season, night) => (type === 'palace' ? Art.memo(`castle${season}${night}`, () => castle(season, night)) : building(type, season, night));
})();
MAP_LABELS.palace = 'Evergreen Castle';
// Window glow at night lines up with the castle's windows.
Object.assign(Art.house_defs.palace, { windows: [3, 5, 15, 17], wallH: 62 });

// ---- Building it ------------------------------------------------------------------------------
const CASTLE_ROOMS = {
  foyer: [26, 44, 21, 14, 'Grand Foyer'], ballroom: [16, 24, 41, 18, 'Ballroom'], gallery: [30, 10, 13, 12, 'Hall of Kings'],
  banquet: [2, 24, 13, 18, 'Banquet Hall'], library: [58, 24, 13, 18, 'Library'], kitchen: [4, 46, 20, 12, 'Kitchens'],
  treasury: [49, 46, 20, 12, 'Treasury'], bedchamber: [2, 4, 13, 17, 'Royal Bedchamber'], chapel: [58, 4, 13, 17, 'Chapel'],
};
(() => {
  const build = World.build.bind(World);
  World.build = function () {
    build();
    const W = this;
    // ---- The castle on the Court map ----
    const cap = W.maps.capital;
    const old = cap.buildings.find(b => b.type === 'palace');
    if (old) {
      for (let j = old.y; j < old.y + old.h; j++) for (let i = old.x; i < old.x + old.w; i++) cap.block.delete(key(i, j));
      cap.buildings = cap.buildings.filter(b => b !== old);
    }
    W.addBuilding(cap, 'palace', 22, 3, 21, 6, { door: { x: 32, y: 8 }, msg: 'Evergreen Castle.' });
    const gate = cap.warps.find(w => w.to === 'throne');
    if (gate) Object.assign(gate, { to: 'castle', tx: 36, ty: 56, dir: DIRS.up });

    // ---- Inside ----
    const m = W.newMap('castle', 'Evergreen Castle', 72, 60, T.X, { indoor: true, wall: ['#e8dcc8', '#d8ccb4', '#a89c84'] });
    const room = (x, y, w, h, floor) => { W.rect(m, x, y, w, 2, T.V); W.rect(m, x, y + 2, w, h - 2, floor); };
    const hall = (x, y, w, h, floor = T.ST) => W.rect(m, x, y, w, h, floor);
    const R = CASTLE_ROOMS;
    room(...R.foyer.slice(0, 4), T.ST); room(...R.ballroom.slice(0, 4), T.ST); room(...R.gallery.slice(0, 4), T.ST);
    room(...R.banquet.slice(0, 4), T.F); room(...R.library.slice(0, 4), T.F); room(...R.kitchen.slice(0, 4), T.ST);
    room(...R.treasury.slice(0, 4), T.ST); room(...R.bedchamber.slice(0, 4), T.F); room(...R.chapel.slice(0, 4), T.ST);
    // Corridors and doorways.
    hall(34, 42, 5, 4); hall(35, 22, 3, 4); hall(15, 31, 1, 4); hall(57, 31, 1, 4); hall(24, 51, 2, 3); hall(47, 51, 2, 3); hall(7, 21, 3, 5); hall(63, 21, 3, 5);
    // Red carpets: up the middle from the gate to the Hall of Kings, and down the chapel aisle.
    hall(35, 46, 3, 12, T.R); hall(35, 42, 3, 4, T.R); hall(35, 26, 3, 16, T.R); hall(35, 22, 3, 4, T.R); hall(35, 12, 3, 10, T.R); hall(63, 8, 3, 13, T.R);
    hall(4, 8, 9, 10, T.R);
    // The way out, and the way to the throne.
    W.set(m, 36, 57, T.R); m.warps.push({ x: 36, y: 57, to: 'capital', tx: 32, ty: 9, dir: DIRS.down });
    W.set(m, 36, 11, T.R); W.set(m, 36, 10, T.R); m.warps.push({ x: 36, y: 10, to: 'throne', tx: 10, ty: 12, dir: DIRS.up, door: true });
    const throne = W.maps.throne, back = throne && throne.warps.find(w => w.to === 'capital');
    if (back) Object.assign(back, { to: 'castle', tx: 36, ty: 12, dir: DIRS.down });
    const add = (type, x, y, props) => W.add(m, type, x, y, props);
    const say = text => ({ text });
    // Grand Foyer.
    [[28, 48], [28, 54], [44, 48], [44, 54]].forEach(([x, y]) => add('pillar', x, y, say('Marble, veined with green. Cold to the touch, even in summer.')));
    add('armorstand', 30, 46, say('A suit of ceremonial armour. It has never been worn in battle. Nothing here has.')); add('armorstand', 42, 46, say('Another suit of armour, polished until it shows your face.'));
    [[27, 46], [45, 46], [27, 56], [45, 56]].forEach(([x, y]) => add('vase', x, y));
    add('candelabra', 32, 46); add('candelabra', 40, 46);
    add('goldstatue', 31, 51, say('King Oswin, in gold. The plaque says he was crowned in Year 1.')); add('goldstatue', 41, 51, say('King Oswin, in gold. The plaque says this one was cast last spring. It is identical.'));
    [[29, 44], [43, 44]].forEach(([x, y]) => add('castlebanner', x, y)); [[32, 44], [40, 44]].forEach(([x, y]) => add('picture', x, y));
    // Ballroom.
    [[18, 28], [18, 39], [54, 28], [54, 39], [26, 26], [46, 26]].forEach(([x, y]) => add('pillar', x, y, say('A pillar wound with gold leaf and ivy.')));
    [[21, 26], [31, 26], [41, 26], [51, 26]].forEach(([x, y]) => add('candelabra', x, y));
    add('banquet', 19, 36); add('banquet', 50, 36);
    add('harpsi', 29, 27, say('A harpsichord, painted with green vines. Someone has been playing the same waltz on it for a very long time.'));
    [[20, 24], [28, 24], [44, 24], [52, 24]].forEach(([x, y]) => add('tapestry', x, y)); [[24, 24], [32, 24], [40, 24], [48, 24]].forEach(([x, y]) => add('castlebanner', x, y));
    [[17, 26], [55, 26], [17, 41], [55, 41]].forEach(([x, y]) => add('vase', x, y));
    // Hall of Kings: every king is the same king.
    [[31, 13], [31, 17], [41, 13], [41, 17]].forEach(([x, y], i) => add('statue', x, y, say(['King Oswin the First.', 'King Oswin the Just.', 'King Oswin the Green.', 'King Oswin the Unfading. The faces are all the same face.'][i])));
    [[33, 20], [39, 20]].forEach(([x, y]) => add('candelabra', x, y)); [[32, 10], [40, 10]].forEach(([x, y]) => add('castlebanner', x, y)); [[34, 10], [38, 10]].forEach(([x, y]) => add('picture', x, y));
    // Banquet Hall.
    add('banquet', 4, 29); add('banquet', 9, 29); add('banquet', 4, 35); add('banquet', 9, 35);
    add('fireplace', 11, 26); add('candelabra', 2, 26); add('candelabra', 14, 26); add('vase', 2, 41); add('vase', 14, 41);
    [[3, 24], [11, 24]].forEach(([x, y]) => add('tapestry', x, y));
    // Library.
    [[58, 26], [61, 26], [65, 26], [68, 26], [59, 31], [67, 31], [59, 36], [67, 36]].forEach(([x, y]) => add('bookshelf', x, y));
    add('globe', 63, 33, say('A globe of the realm. The valley is painted green. So is every other province.')); add('table', 63, 38); add('candelabra', 70, 29); add('candelabra', 58, 41);
    [[60, 24], [67, 24]].forEach(([x, y]) => add('tapestry', x, y));
    // Kitchens.
    [[5, 48], [7, 48], [9, 48]].forEach(([x, y]) => add('stove', x, y, say('Something is always simmering. It smells of herbs and honey.')));
    [[12, 48], [13, 48], [14, 48]].forEach(([x, y]) => add('counter', x, y)); add('shelf', 17, 48); add('shelf', 20, 48);
    add('banquet', 10, 53); [[4, 57], [5, 57], [22, 57]].forEach(([x, y]) => add('barrel', x, y)); [[21, 57], [23, 54]].forEach(([x, y]) => add('crate', x, y));
    // Treasury.
    [[51, 49], [53, 50], [56, 49], [65, 49], [67, 50], [51, 56], [54, 55], [66, 56]].forEach(([x, y]) => add('goldpile', x, y));
    add('crowncase', 58, 49, say('A crown of the old kings, under glass. It is almost exactly the same as the one the King wears.')); add('crowncase', 61, 49, say('A sceptre and an orb, set with emeralds.'));
    add('goldstatue', 59, 54, say('A golden stag. Its eyes are emeralds.')); add('goldstatue', 62, 54, say('A golden tree, every leaf beaten thin.'));
    add('candelabra', 49, 48); add('candelabra', 68, 48);
    // Royal Bedchamber.
    add('canopybed', 7, 9, say('The King\'s bed. It looks as if it has never been slept in.')); add('shelf', 2, 6); add('table', 12, 6); add('plant', 2, 19); add('plant', 14, 19); add('vase', 14, 6);
    [[5, 4], [10, 4]].forEach(([x, y]) => add('window_i', x, y)); add('tapestry', 3, 4); add('tapestry', 12, 4);
    // Chapel.
    add('altar', 63, 7, say('An altar with a living sapling growing out of the stone.'));
    for (let y = 11; y <= 18; y += 2) { [59, 60, 61, 62, 66, 67, 68, 69].forEach(x => add('pew', x, y)); }
    [[60, 4], [64, 4], [68, 4]].forEach(([x, y]) => add('window_i', x, y)); add('candelabra', 59, 7); add('candelabra', 69, 7);

    // ---- The Evergreen Garden ----
    const reserved = [[22, 3, 21, 9], [24, 12, 18, 20], [0, 19, 27, 5], [42, 19, 11, 5], [48, 14, 7, 9], [8, 9, 5, 3], [8, 29, 5, 3], [14, 34, 8, 4], [5, 23, 21, 3], [41, 25, 19, 3]];
    const isFree = (x, y) => !reserved.some(([rx, ry, rw, rh]) => x >= rx && x < rx + rw && y >= ry && y < ry + rh) && !W.solid(cap, x, y) && !W.at(cap, x, y) && !W.warpAt(cap, x, y) && W.g(cap, x, y) === T.G;
    const put = (type, x, y, props) => (isFree(x, y) ? W.add(cap, type, x, y, props) : null);
    // Flowerbeds flanking the castle steps.
    for (let x = 23; x <= 28; x++) { W.add(cap, 'flowerbed', x, 10); W.add(cap, 'flowerbed', x + 13, 10); }
    W.add(cap, 'topiary', 22, 10); W.add(cap, 'topiary', 42, 10);
    // West lawn: hedged beds, roses, topiary, a bench.
    for (let x = 4; x <= 20; x++) put('hedge', x, 4);
    for (let x = 5; x <= 19; x += 1) if (x % 4 !== 0) put('flowerbed', x, 6);
    [[15, 10], [19, 10], [15, 16], [19, 16]].forEach(([x, y]) => put('topiary', x, y));
    for (let y = 12; y <= 14; y++) for (let x = 16; x <= 18; x++) put('flowerbed', x, y);
    put('bench', 16, 17); put('birdbath', 5, 14, say('A birdbath. A pigeon is using it as a bath, a mirror and a toilet.'));
    put('easel', 21, 13); [[4, 12], [4, 16], [6, 16]].forEach(([x, y]) => put('rosebush', x, y));
    // South-west lawn.
    for (let x = 4; x <= 21; x++) if (x % 3 === 1) put('rosebush', x, 27);
    for (let x = 14; x <= 21; x++) put('flowerbed', x, 29);
    put('bench', 16, 31);
    // The lily pond south of the square.
    for (let y = 35; y <= 38; y++) for (let x = 28; x <= 37; x++) if (!((x === 28 || x === 37) && (y === 35 || y === 38))) W.set(cap, x, y, T.W);
    [[30, 36], [33, 37], [35, 36]].forEach(([x, y]) => W.add(cap, 'lily', x, y));
    for (let x = 26; x <= 39; x++) { put('flowerbed', x, 33); if (x % 2 === 0) put('rosebush', x, 40); }
    put('bench', 24, 36); put('bench', 39, 36);
    // The Royal Garden to the east.
    for (let x = 44; x <= 58; x++) { if (x % 2 === 0) put('rosebush', x, 5); put('flowerbed', x, 6); if (x !== 51 && x !== 52) put('hedge', x, 7); }
    [[44, 12], [44, 30], [59, 12], [59, 30]].forEach(([x, y]) => put('topiary', x, y));
    for (let x = 44; x <= 58; x++) if (x !== 51 && x !== 52) put('hedge', x, 34);
    for (let y = 36; y <= 39; y++) for (let x = 52; x <= 56; x++) W.set(cap, x, y, T.W);
    W.add(cap, 'lily', 53, 37); W.add(cap, 'lily', 55, 38);
    for (let x = 44; x <= 50; x++) put('flowerbed', x, 37);
    put('bench', 45, 39); put('birdbath', 58, 24, say('A birdbath carved with leaves. The water in it is very slightly green.'));
  };
})();

// ---- The people of the castle and the garden ------------------------------------------------
const gown = (skin, hair, style, dress, trim, opt) => Object.assign({ skin: skin[0], skinD: skin[1], hair: hair[0], hairD: hair[1], style, shirt: dress[0], shirtD: dress[1], dress: dress[0], dressD: dress[1], trim, jewel: '#e8c040', pants: dress[1], pantsD: dress[1], shoes: '#2a1a10' }, opt || {});
const doublet = (skin, hair, style, coat, opt) => Object.assign({ skin: skin[0], skinD: skin[1], hair: hair[0], hairD: hair[1], style, shirt: coat[0], shirtD: coat[1], cape: coat[2], belt: '#e8c040', pants: '#2a2030', pantsD: '#1a1020', shoes: '#1a1210' }, opt || {});
const SERVANT = { skin: '#e0b088', skinD: '#c09068', hair: '#3a2a1a', hairD: '#2a1a10', style: 'bun', shirt: '#2a2a3a', shirtD: '#1a1a2a', apron: '#ffffff', pants: '#2a2a3a', pantsD: '#1a1a2a', shoes: '#1a1210' };
const COOK = { skin: '#c88a5a', skinD: '#a86a40', hair: '#ffffff', hairD: '#e0e0e0', style: 'crop', shirt: '#f0ece0', shirtD: '#c8c0b0', apron: '#ffffff', pants: '#5a5048', pantsD: '#40382c', shoes: '#2a1a10', hat: 'cap', hatC: '#ffffff', hatD: '#e0e0e0' };
const JESTER = { skin: '#f0c49a', skinD: '#d9a678', hair: '#c43030', hairD: '#8a2020', style: 'short', shirt: '#c43030', shirtD: '#2a6ab0', cape: '#e8c040', pants: '#2a6ab0', pantsD: '#c43030', shoes: '#e8c040', hat: 'cap', hatC: '#e8c040', hatD: '#c43030' };
const CG = COURT_GUARD_LOOK;
const C2 = (id, e) => Object.assign({ map: 'castle' }, e);
Object.assign(EXTRAS, {
  // At the doors.
  c_gate1: C2('c_gate1', { name: 'Castle Guard', look: CG, at: [34, 56], dir: DIRS.up, night: true, lines: ['Wipe your boots. The King does not like mud.', 'You are expected. Everyone is always expected.'] }),
  c_gate2: C2('c_gate2', { name: 'Castle Guard', look: CG, at: [38, 56], dir: DIRS.up, night: true, lines: ['No weapons drawn inside the castle.', 'The Ballroom is through there. The music never stops. I have stopped hearing it.'] }),
  c_herald: C2('c_herald', { name: 'Herald Ambrose', look: doublet(SK[3], ['#d8d4cc', '#b4b0a8'], 'short', ['#2f6b45', '#1f4a28', '#e8c040'], { hat: 'cap', hatC: '#2f6b45', hatD: '#e8c040' }), at: [36, 49], dir: DIRS.down,
    lines: ['Welcome to Evergreen Castle! The Ballroom is ahead, the Banquet Hall to the west, the Library to the east. The King receives in the Throne Room, beyond the Hall of Kings.', 'The Kitchens are west of this hall, the Treasury east. Do not touch the gold. Everyone touches the gold.'] }),
  c_throne1: C2('c_throne1', { name: 'Royal Guard', look: CG, at: [35, 13], dir: DIRS.down, night: true, lines: ['Beyond this door is the Throne Room. Behave.', 'I have guarded this door for twenty years. The King has not aged a day. Neither, now I think of it, have I.'] }),
  c_throne2: C2('c_throne2', { name: 'Royal Guard', look: CG, at: [37, 13], dir: DIRS.down, night: true, lines: ['Halt. Oh. You are expected. Go on.', 'Bow when you enter. Lower than that.'] }),
  c_patrol: C2('c_patrol', { name: 'Castle Guard', look: CG, route: [[24, 32], [48, 32], [48, 40], [24, 40]], night: true, stop: 1.5, lines: ['Keep to the edges, the dancers have right of way.', 'All quiet. It is always all quiet.'] }),
  c_vault: C2('c_vault', { name: 'Treasury Guard', look: CG, at: [50, 52], dir: DIRS.right, night: true, lines: ['Look all you like. Touch, and you will see the gaol.', 'Gold does not grow on trees. Well. Here it rather does.'] }),
  // The Ballroom.
  c_harp: C2('c_harp', { name: 'Court Harpist', look: gown(SK[3], ['#e8d8a8', '#c8b888'], 'long', ['#ffffff', '#d8d0c8'], '#e8c040'), at: [33, 28], dir: DIRS.down, music: '#f0d070', prop: 'harp', lines: ['A waltz, of course. Always a waltz.', 'I have played this tune ten thousand times. It still makes them dance.'] }),
  c_lute: C2('c_lute', { name: 'Court Lutenist', look: doublet(SK[1], ['#2a1a10', '#1a100a'], 'short', ['#7a2f30', '#5a1f20', null], { hat: 'cap', hatC: '#7a2f30', hatD: '#e8c040' }), at: [39, 28], dir: DIRS.down, music: '#ffffff', prop: 'lute', lines: ['Requests? I know one song. It is very long.', 'They pay us in honey cake. I am not complaining.'] }),
  c_jester: C2('c_jester', { name: 'Pip the Jester', look: JESTER, wander: [28, 37, 44, 41], juggle: true, speed: 30, lines: ['Why did the King never grow old? He was too busy growing green! Ha! ...Please do not tell him I said that.', 'Three balls, two hands, one jester. The maths never works out.', 'Laugh! It is compulsory.'] }),
  c_d1a: C2('c_d1a', { name: 'Lady Vespera', look: gown(SK[0], ['#c8a048', '#a07a30'], 'bun', ['#c43050', '#8a2030'], '#e8c040', { hat: 'tiara' }), dance: { cx: 27, cy: 33, r: 10, phase: 0 }, lines: ['Not now, darling, I am dancing!'] }),
  c_d1b: C2('c_d1b', { name: 'Lord Fennick', look: doublet(SK[0], ['#3a2a1a', '#2a1a10'], 'short', ['#2a4a8a', '#1a3060', '#e8c040']), dance: { cx: 27, cy: 33, r: 10, phase: Math.PI }, lines: ['One, two, three. One, two, three. Mind my feet.'] }),
  c_d2a: C2('c_d2a', { name: 'Duchess Ilse', look: gown(SK[1], ['#1a100a', '#100804'], 'long', ['#2f6b45', '#1f4a28'], '#e8c040', { hat: 'tiara', gem: '#3a9a5a' }), dance: { cx: 36, cy: 34, r: 11, phase: 1, speed: 0.8 }, lines: ['The Evergreen Waltz. They have played it every night since I was a girl. I was a girl a very long time ago.'] }),
  c_d2b: C2('c_d2b', { name: 'Count Morrow', look: doublet(SK[2], ['#d8d4cc', '#b4b0a8'], 'bald', ['#5a3a6a', '#3a2a4a', '#e8c040']), dance: { cx: 36, cy: 34, r: 11, phase: 1 + Math.PI, speed: 0.8 }, lines: ['Splendid evening. Splendid castle. Splendid everything.'] }),
  c_d3a: C2('c_d3a', { name: 'Lady Marigold', look: gown(SK[3], ['#c2703a', '#96522a'], 'long', ['#e8a040', '#b87020'], '#ffffff'), dance: { cx: 45, cy: 33, r: 10, phase: 2 }, lines: ['Do you dance? Everyone dances here. Eventually.'] }),
  c_d3b: C2('c_d3b', { name: 'Sir Rowan', look: doublet(SK[1], ['#4a3020', '#2a1a10'], 'short', ['#e8e0d0', '#c8c0b0', '#2f6b45']), dance: { cx: 45, cy: 33, r: 10, phase: 2 + Math.PI }, lines: ['Charmed. Utterly charmed.'] }),
  c_n1: C2('c_n1', { name: 'Baroness Quill', look: gown(SK[0], ['#e0e0e0', '#c0c0c0'], 'bun', ['#8a3a8a', '#6a2a6a'], '#e8c040', { hat: 'tiara', gem: '#9a70e0' }), at: [21, 30], dir: DIRS.right, pair: 'c_n2', lines: ['Your coat is very... honest. How refreshing.'] }),
  c_n2: C2('c_n2', { name: 'Lord Hawley', look: doublet(SK[0], ['#c8a048', '#a07a30'], 'short', ['#7a2f30', '#5a1f20', '#e8c040']), at: [23, 30], dir: DIRS.left, pair: 'c_n1', lines: ['The valley? I sent a cousin there once. He came back older. We were all very shocked.'] }),
  c_n3: C2('c_n3', { name: 'Lady Briony', look: gown(SK[2], ['#1a100a', '#100804'], 'long', ['#3a7ac0', '#2a5a90'], '#ffffff', { hat: 'tiara', gem: '#3a7ac0' }), at: [49, 30], dir: DIRS.right, pair: 'c_n4', lines: ['Have you met the King? Of course not. Nobody meets the King. One is received.'] }),
  c_n4: C2('c_n4', { name: 'Viscount Pell', look: doublet(SK[3], ['#3a2a1a', '#2a1a10'], 'crop', ['#2f6b45', '#1f4a28', '#7a2f30']), at: [51, 30], dir: DIRS.left, pair: 'c_n3', lines: ['I came for one season. That was forty years ago. Time flies when everything stays the same.'] }),
  c_tray1: C2('c_tray1', { name: 'Footman', look: SERVANT, route: [[16, 32], [24, 34], [36, 31], [48, 34], [36, 31], [24, 34]], tray: '#d4405a', stop: 1, lines: ['Wine? Honey cake? Both? Very good.', 'Excuse me, coming through.'] }),
  // The Banquet Hall.
  c_dine1: C2('c_dine1', { name: 'Lord Stanmere', look: doublet(SK[1], ['#d8d4cc', '#b4b0a8'], 'bald', ['#7a5a2a', '#5a4020', '#2f6b45'], { beard: '#d8d4cc' }), at: [5, 28], dir: DIRS.down, pair: 'c_dine2', lines: ['Pass the pheasant. No, the other pheasant.'] }),
  c_dine2: C2('c_dine2', { name: 'Lady Stanmere', look: gown(SK[1], ['#4a3020', '#2a1a10'], 'bun', ['#7a2f30', '#5a1f20'], '#e8c040', { hat: 'tiara' }), at: [7, 28], dir: DIRS.down, pair: 'c_dine1', lines: ['We dine at every hour. It seems to do us no harm at all.'] }),
  c_dine3: C2('c_dine3', { name: 'Sir Gaunt', look: doublet(SK[2], ['#1a100a', '#100804'], 'short', ['#3a3436', '#2a2426', '#c43030']), at: [11, 34], dir: DIRS.down, lines: ['Have you tried the green soup? Everyone has the green soup.'] }),
  c_tray2: C2('c_tray2', { name: 'Serving Maid', look: SERVANT, route: [[3, 32], [13, 32], [13, 38], [3, 38]], tray: '#c86a30', stop: 1.2, lines: ['More soup, my lord? Oh. You are not a lord.', 'Busy, busy, always busy.'] }),
  // The Library.
  c_scholar: C2('c_scholar', { name: 'Royal Librarian', look: doublet(SK[3], ['#e0e0e0', '#c0c0c0'], 'short', ['#3a3048', '#2a2038', null], { beard: '#e0e0e0' }), wander: [60, 28, 70, 40], speed: 18, lines: ['The histories, the genealogies, the ledgers of the Tithe. Every page in the King\'s own hand. All of them, the same hand.', 'Quiet, please. This is a library. The books are listening.'] }),
  c_reader: C2('c_reader', { name: 'Young Lady Thea', look: gown(SK[0], ['#c2703a', '#96522a'], 'long', ['#9a70e0', '#6a4ab0'], '#ffffff'), at: [63, 28], dir: DIRS.up, lines: ['I am reading about the founding of the realm. Funny. The first king has the same name as ours.'] }),
  // The Kitchens.
  c_cook: C2('c_cook', { name: 'Head Cook Martha', look: COOK, wander: [5, 50, 22, 56], speed: 30, lines: ['Out of my kitchen! Unless you can stir. Can you stir?', 'Honey, herbs and something green from the garden. It goes in everything.'] }),
  c_cook2: C2('c_cook2', { name: 'Kitchen Boy', look: Object.assign({}, SERVANT, { style: 'messy', apron: null }), route: [[8, 50], [20, 50], [20, 55], [8, 55]], tray: '#e8b050', speed: 34, stop: 0.6, lines: ['Can\'t stop! Cook will skin me!'] }),
  // The Treasury.
  c_rich1: C2('c_rich1', { name: 'Lady Goldwyn', look: gown(SK[3], ['#e8d8a8', '#c8b888'], 'bun', ['#e8c040', '#a88020'], '#ffffff', { hat: 'tiara', gem: '#c43050' }), at: [57, 52], dir: DIRS.up, pair: 'c_rich2', lines: ['Isn\'t it beautiful? Gold never fades. Like us.'] }),
  c_rich2: C2('c_rich2', { name: 'Lord Goldwyn', look: doublet(SK[3], ['#3a2a1a', '#2a1a10'], 'short', ['#2a2a3a', '#1a1a2a', '#e8c040'], { hat: 'crown' }), at: [60, 52], dir: DIRS.up, pair: 'c_rich1', lines: ['We are the richest family in the realm. After one other.'] }),
  // The Bedchamber and Chapel.
  c_maid: C2('c_maid', { name: 'Lady-in-Waiting', look: gown(SK[1], ['#4a3020', '#2a1a10'], 'bun', ['#efe6d2', '#c8c0b0'], '#2f6b45'), wander: [3, 13, 14, 19], speed: 20, lines: ['The King\'s bed is made fresh every morning. It is never slept in. We make it anyway.'] }),
  c_priest: C2('c_priest', { name: 'Brother Alder', look: doublet(SK[0], ['#d8d4cc', '#b4b0a8'], 'bald', ['#efe6d2', '#c8c0b0', '#2f6b45']), at: [64, 9], dir: DIRS.down, lines: ['We pray to the green. It has always answered.', 'The sapling on the altar was planted by the first king. It has never grown, and it has never died.'] }),
  c_pray: C2('c_pray', { name: 'Worshipper', look: gown(SK[2], ['#1a100a', '#100804'], 'long', ['#5a5a6a', '#40404c'], null), at: [60, 12], dir: DIRS.up, lines: ['Shh.'] }),
  // ---- The garden ----
  g_garden1: { name: 'Gardener Holt', look: { skin: '#c88a5a', skinD: '#a86a40', hair: '#5a3a20', hairD: '#3a2410', style: 'short', hat: 'straw', shirt: '#6a8a4a', shirtD: '#4a6a30', overalls: '#5a4a3a', pants: '#5a4a3a', pantsD: '#40382c', shoes: '#2a1a10' }, route: [[5, 8], [20, 8]], prop: 'shears', speed: 12, stop: 4, lines: ['Every hedge, every morning. They grow back overnight. Everything here does.', 'Mind the roses. They are older than me. Older than my grandmother.'] },
  g_garden2: { name: 'Gardener Tansy', look: { skin: '#f0c49a', skinD: '#d9a678', hair: '#c2703a', hairD: '#96522a', style: 'long', hat: 'straw', shirt: '#a8503a', shirtD: '#843c2c', overalls: '#5a4a3a', pants: '#5a4a3a', pantsD: '#40382c', shoes: '#2a1a10' }, route: [[44, 8], [58, 8]], prop: 'shears', speed: 12, stop: 4, lines: ['The Royal Garden is by appointment. You look like an appointment.', 'We send carts of river mud to the roots under the castle. The roses love it.'] },
  g_dame1: { name: 'Lady Rosalind', look: gown(SK[0], ['#c8a048', '#a07a30'], 'long', ['#e870a8', '#b84a80'], '#ffffff', { hat: 'tiara' }), wander: [24, 12, 41, 31], speed: 16, lines: ['A promenade before luncheon. Then luncheon. Then a promenade.', 'Isn\'t the garden divine? It never changes. Never.'] },
  g_dame2: { name: 'Lady Wren', look: gown(SK[2], ['#1a100a', '#100804'], 'bun', ['#3a9a8a', '#2a6a5a'], '#e8c040'), wander: [43, 10, 59, 32], speed: 16, lines: ['I come to see the peacocks. They are the only ones here who say what they think.'] },
  g_lord1: { name: 'Lord Cedric', look: doublet(SK[1], ['#3a2a1a', '#2a1a10'], 'short', ['#2a4a8a', '#1a3060', '#e8c040'], { hat: 'cap', hatC: '#2a4a8a', hatD: '#e8c040' }), wander: [24, 12, 41, 31], speed: 18, lines: ['Have you seen my wife? Tall, green dress. Everyone wears green. Never mind.'] },
  g_lady1: { name: 'Lady Cedric', look: gown(SK[1], ['#4a3020', '#2a1a10'], 'long', ['#2f6b45', '#1f4a28'], '#e8c040'), follow: 'g_lord1', speed: 18, lines: ['We walk the same path every afternoon. It is good for the constitution.'] },
  g_kid1: { name: 'Little Hob', look: doublet(SK[0], ['#c2703a', '#96522a'], 'messy', ['#c43030', '#8a2020', null]), wander: [24, 13, 41, 31], speed: 44, lines: ['Tag! You\'re it! ...You\'re not playing.'] },
  g_kid2: { name: 'Little Bell', look: gown(SK[0], ['#e8d8a8', '#c8b888'], 'long', ['#f0d040', '#c8a820'], null), follow: 'g_kid1', speed: 46, lines: ['I\'ll catch him! I always nearly catch him!'] },
  g_painter: { name: 'Painter Esme', look: doublet(SK[3], ['#4a3020', '#2a1a10'], 'bun', ['#5a6a8a', '#40506a', null], { apron: '#efe6d2' }), at: [20, 13], dir: DIRS.right, lines: ['I am painting the topiary. I have painted it every day for years. The paintings are all identical. So is the topiary.'] },
  g_bard: { name: 'Garden Bard', look: doublet(SK[2], ['#1a100a', '#100804'], 'short', ['#e8a040', '#b87020', '#2f6b45'], { hat: 'cap', hatC: '#e8a040', hatD: '#2f6b45' }), at: [45, 23], dir: DIRS.down, music: '#ffe08a', prop: 'lute', lines: ['A song for the roses, a song for the King, a song for whoever drops a coin.'] },
  g_feeder: { name: 'Widow Ames', look: gown(SK[3], ['#e0e0e0', '#c0c0c0'], 'bun', ['#5a5040', '#40382c'], null), at: [34, 24], dir: DIRS.down, lines: ['The pigeons know me. They do not know anyone else, but they know me.'] },
});
Object.assign(GOSSIP, {
  c_n1: [['c_n1', 'Did you see what the Duchess is wearing?'], ['c_n2', 'Green. Again.'], ['c_n1', 'How daring.'], ['c_n2', 'How eternal.']],
  c_n3: [['c_n4', 'The King looked well today.'], ['c_n3', 'He always looks well.'], ['c_n4', 'Exactly the same, I mean.'], ['c_n3', 'Hush, darling.']],
  c_dine1: [['c_dine1', 'Splendid soup.'], ['c_dine2', 'It is always the same soup.'], ['c_dine1', 'Splendidly the same.']],
  c_rich1: [['c_rich1', 'Look at that crown.'], ['c_rich2', 'It looks just like his.'], ['c_rich1', 'It IS just like his.'], ['c_rich2', '...Shall we go?']],
});
// Ducks on the garden ponds.
HERDS.capital.push(['duck', 3, 27, 34, 39, 40, ['#f0ece0', '#f0ece0']], ['duck', 2, 51, 35, 58, 40, ['#8a6a48', '#2a7a3a']]);
(() => {
  // The castle has a waltz of its own, and the murmur of a full house.
  Sfx.THEMES.castle = { bpm: 92, bar: 6, root: 65, scale: 'major', prog: [0, 5, 3, 4], lead: ['triangle', 0.05, 12, 0.6], bass: '1..5..', pad: 0.035, arp: '135853', echo: 0.38, seed: 73 };
  Sfx.PLACES.castle = 'castle';
  Sfx.BEDS.castle = { crowd: [3, 6], clink: [2, 5] };
  Sfx.BEDS.court = { birds: [2, 6] };
})();
