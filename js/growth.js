'use strict';
// Mossbrook grows with the story. The town's east and south start as forest. When an act begins, a
// stretch is cleared and builders put up frames and scaffolding; by the next act the houses stand.
// When the main story ends, eight new people move in: a carpenter, a beekeeper, a herbalist, a tailor,
// a potter, a teacher, a fisher and a miller. Four of them keep a shop.
//
//   Act 1          the old town, with forest beyond
//   Act 2 begins   east, north of the King's Road: a workshop and a cottage go up
//   Act 3 begins   east, south of the road: the herbalist's, the tailor's, the pottery
//   Act 4 begins   south-west: the schoolhouse, a fisher's hut and a new pond
//   Act 5 begins   south-east: a windmill, the miller's house and a second square
//   the ending     everything finished, the new people arrive

// ---- New goods ------------------------------------------------------------------------------------
item('honey', 'Wildflower Honey', 'food', 45, ['nvhoney', '#f0b030', '#c88010'], 'Elsie\'s bees work the meadows by the river. You can taste the clover.', { food: 30, heal: 10 });
item('honeycomb', 'Honeycomb', 'food', 70, ['nvcomb', '#f0c040', '#b88010'], 'Straight from the frame, wax and all.', { food: 45, heal: 8 });
item('mead', 'Mossbrook Mead', 'food', 95, ['nvmead', '#e8b040', '#8a5a20'], 'Honey wine. Elsie swears by it. Elsie swears a lot, after a cup.', { food: 40, heal: 20 });
item('beeswax_candle', 'Beeswax Candle', 'gift', 90, ['nvcandle', '#f0e0a0', '#e8a040'], 'Smells of summer. A gift most people like.');
item('herb_tea', 'Silverleaf Tea', 'food', 50, ['nvtea', '#7ab05a', '#e8e0d0'], 'Juniper\'s blend. Bitter, then sweet, then you feel better.', { food: 20, heal: 30 });
item('lavender_sachet', 'Lavender Sachet', 'gift', 70, ['nvsachet', '#a080d0', '#6a4a9a'], 'For a drawer, a pillow, or a person who needs calming.');
item('bread', 'Mill Bread', 'food', 40, ['nvbread', '#d8a060', '#a07040'], 'Baked from flour ground at Mossbrook\'s own mill.', { food: 35, heal: 5 });
item('oatcake', 'Oat Cake', 'food', 30, ['nvoat', '#e0c080', '#b09050'], 'Heavy, honest and filling. Garrick\'s mother\'s recipe.', { food: 28 });
Object.assign(Art.ICONS, {
  nvhoney: (g, a, b) => { const P = Art.P; P(g, '#e8e0d0', 4, 4, 8, 2); P(g, a, 3, 6, 10, 8); P(g, b, 3, 12, 10, 2); P(g, '#a07a4c', 5, 2, 6, 2); P(g, '#fff0b0', 5, 7, 2, 3); },
  nvcomb: (g, a, b) => { const P = Art.P; for (let y = 3; y < 13; y += 3) for (let x = 2 + (y % 2) * 1; x < 13; x += 3) { P(g, b, x, y, 3, 3); P(g, a, x, y, 2, 2); } },
  nvmead: (g, a, b) => { const P = Art.P; P(g, b, 4, 4, 8, 10); P(g, a, 5, 6, 6, 6); P(g, b, 6, 1, 4, 3); P(g, '#e8e0d0', 6, 2, 4, 1); P(g, '#fff0b0', 6, 7, 1, 3); },
  nvcandle: (g, a, b) => { const P = Art.P; P(g, a, 5, 5, 6, 9); P(g, '#d8c880', 10, 5, 1, 9); P(g, '#2a1a10', 7, 3, 2, 2); P(g, b, 7, 1, 2, 2); P(g, '#fff0b0', 7, 0, 2, 1); },
  nvtea: (g, a, b) => { const P = Art.P; P(g, b, 3, 6, 9, 7); P(g, '#c8c0b0', 3, 12, 9, 1); P(g, a, 4, 7, 7, 2); P(g, b, 12, 7, 2, 4); P(g, '#ffffff', 6, 2, 1, 3); P(g, '#ffffff', 9, 3, 1, 3); },
  nvsachet: (g, a, b) => { const P = Art.P; P(g, a, 4, 6, 8, 8); P(g, b, 4, 13, 8, 1); P(g, '#e8e0d0', 5, 4, 6, 2); P(g, '#7ab05a', 7, 1, 2, 3); P(g, b, 6, 0, 1, 2); P(g, b, 9, 0, 1, 2); },
  nvbread: (g, a, b) => { const P = Art.P; P(g, a, 2, 6, 12, 7); P(g, b, 2, 12, 12, 1); P(g, '#f0c890', 3, 6, 10, 2); P(g, b, 5, 7, 1, 3); P(g, b, 8, 7, 1, 3); P(g, b, 11, 7, 1, 3); },
  nvoat: (g, a, b) => { const P = Art.P; P(g, a, 3, 5, 10, 8); P(g, b, 3, 12, 10, 1); for (let i = 0; i < 6; i++) P(g, b, 4 + (i * 3) % 8, 6 + Math.floor(i / 3) * 3, 1, 1); },
});

// ---- Things on the new streets --------------------------------------------------------------------
Object.assign(OBJDEF, {
  nvtimber: { solid: 1, fw: 2, act: 'read' }, nvstones: { solid: 1, act: 'read' }, nvsawhorse: { solid: 1 },
  nvhive: { solid: 1, act: 'read' }, nvkiln: { solid: 1, fw: 2, light: 1, lightY: 4, act: 'read' }, nvpots: { solid: 1 },
  nvline: { solid: 1, fw: 3 }, nvreeds: { flat: 1 }, nvswing: { solid: 1, fw: 2, act: 'read' }, nvboat: { solid: 1, fw: 2 },
});
(() => {
  const { mk, P, outlined, STATIC } = Art;
  STATIC.nvtimber = () => outlined(mk(32, 18, g => { for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) { const x = 2 + i * 7 + r * 3, y = 12 - r * 5; P(g, '#a07a4c', x, y, 6, 6); P(g, '#c49a64', x + 1, y + 1, 4, 4); P(g, '#7a5535', x + 2, y + 2, 2, 2); } P(g, '#8a6239', 0, 14, 32, 4); }));
  STATIC.nvstones = () => outlined(mk(16, 14, g => { [[1, 7, 7], [7, 6, 8], [4, 2, 7]].forEach(([x, y, w]) => { P(g, '#8a8a92', x, y, w, 6); P(g, '#a8a8b0', x + 1, y, w - 2, 2); }); }));
  STATIC.nvsawhorse = () => outlined(mk(18, 14, g => { P(g, '#8a6239', 1, 3, 16, 3); P(g, '#6f4c30', 2, 6, 2, 8); P(g, '#6f4c30', 14, 6, 2, 8); P(g, '#c49a64', 3, 1, 12, 2); P(g, '#d8d4cc', 8, 0, 2, 3); }));
  STATIC.nvhive = () => outlined(mk(16, 22, g => { P(g, '#6f4c30', 6, 16, 4, 6); P(g, '#e8c040', 2, 4, 12, 13); for (let y = 6; y < 17; y += 3) P(g, '#c89a20', 2, y, 12, 1); P(g, '#a07a4c', 1, 2, 14, 3); P(g, '#2a1a10', 7, 13, 2, 2); }));
  STATIC.nvkiln = () => outlined(mk(32, 34, g => { P(g, '#9a6a4a', 4, 8, 24, 26); P(g, '#b07a56', 4, 8, 24, 3); for (let y = 12; y < 34; y += 4) P(g, '#7a4a32', 4, y, 24, 1); P(g, '#1a1010', 11, 20, 10, 10); P(g, '#ff8a30', 12, 24, 8, 6); P(g, '#ffe070', 14, 26, 4, 3); P(g, '#7a4a32', 12, 0, 8, 9); P(g, '#5a5a62', 12, 0, 8, 2); }));
  STATIC.nvpots = () => outlined(mk(16, 18, g => { [[1, 10, 6], [8, 9, 7], [4, 2, 8]].forEach(([x, y, w], i) => { P(g, ['#b07050', '#9a6a4a', '#c08060'][i], x, y, w, 8); P(g, '#e0a080', x + 1, y + 1, 2, 4); P(g, '#7a4a32', x, y, w, 1); }); }));
  STATIC.nvline = () => outlined(mk(48, 26, g => { P(g, '#6f4c30', 2, 4, 2, 22); P(g, '#6f4c30', 44, 4, 2, 22); for (let x = 3; x < 45; x++) P(g, '#e8e0d0', x, 6 + Math.round(Math.sin((x - 3) / 42 * Math.PI) * 3), 1, 1); [[8, '#c43050'], [17, '#3a7ac0'], [26, '#f0d040'], [35, '#7ab05a']].forEach(([x, c]) => { const y = 7 + Math.round(Math.sin((x - 3) / 42 * Math.PI) * 3); P(g, c, x, y, 7, 9); P(g, '#ffffff', x + 1, y, 1, 9); }); }));
  STATIC.nvreeds = () => mk(16, 16, g => { for (let i = 0; i < 5; i++) { P(g, '#5a8a3a', 2 + i * 3, 4 + (i % 2) * 2, 1, 12); P(g, '#7a4a2a', 2 + i * 3, 3 + (i % 2) * 2, 2, 3); } });
  STATIC.nvswing = () => outlined(mk(32, 30, g => { P(g, '#6f4c30', 2, 2, 3, 28); P(g, '#6f4c30', 27, 2, 3, 28); P(g, '#8a6239', 2, 2, 28, 3); P(g, '#c8b088', 12, 5, 1, 16); P(g, '#c8b088', 19, 5, 1, 16); P(g, '#a07a4c', 10, 20, 12, 3); }));
  STATIC.nvboat = () => outlined(mk(32, 14, g => { P(g, '#6f4c30', 2, 4, 28, 8); P(g, '#8a6239', 4, 4, 24, 2); P(g, '#57391f', 6, 10, 20, 2); P(g, '#a07a4c', 8, 1, 2, 12); }));
  // A building half-built: a stone footing, timber posts and beams, scaffold planks, a ladder.
  const site = (w, h) => outlined(mk(w * 16 + 8, h * 16 + 34, g => {
    const W = w * 16 + 8, H = h * 16 + 34;
    P(g, '#8a8a92', 2, H - 10, W - 4, 8); P(g, '#a8a8b0', 2, H - 10, W - 4, 2);
    for (let x = 4; x < W - 2; x += 15) { P(g, '#7a5535', x, 8, 4, H - 16); P(g, '#a07a4c', x, 8, 1, H - 16); }
    for (const y of [8, Math.floor(H / 2), H - 18]) { P(g, '#8a6239', 2, y, W - 4, 3); P(g, '#a07a4c', 2, y, W - 4, 1); }
    for (let x = 2; x < W - 10; x += 14) for (let k = 0; k < 10; k++) P(g, '#6f4c30', x + k, 8 + Math.floor(H / 2 - 8) - k, 1, 1);
    P(g, '#c49a64', 0, Math.floor(H / 2) - 3, W, 3); P(g, '#c8a070', W - 10, 8, 2, H - 16); P(g, '#c8a070', W - 5, 8, 2, H - 16); for (let y = 12; y < H - 12; y += 5) P(g, '#c8a070', W - 10, y, 7, 1);
    for (let x = 6; x < W - 6; x += 8) P(g, '#c49a64', x, H - 20, 6, 10);
  }));
  Art.nvSite = (w, h) => {
    const t = 'nvsite' + w + 'x' + h;
    if (!OBJDEF[t]) { OBJDEF[t] = { solid: 1, fw: w, fh: h, act: 'read' }; STATIC[t] = () => site(w, h); }
    return t;
  };
})();

// ---- The new houses ---------------------------------------------------------------------------------
Object.assign(Art.house_defs, {
  nv_workshop: { tw: 6, wallH: 40, roofH: 34, slope: 10, wall: ['#b8946a', '#c8a47a', '#9a7a52'], roof: ['#7a4a2a', '#8a5a3a', '#5a3a1a'], chimney: 70, doorCol: 2, windows: [0.4, 4.5] },
  nv_bee: { tw: 5, wallH: 38, roofH: 34, slope: 10, wall: ['#f0e0b0', '#f8ecc4', '#d8c494'], roof: ['#c8902a', '#e0a83a', '#a0701a'], chimney: 16, doorCol: 2, windows: [0.4, 3.6] },
  nv_herbal: { tw: 5, wallH: 40, roofH: 36, slope: 10, wall: ['#b8c8a0', '#c8d8b0', '#98a880'], roof: ['#3a6a4a', '#4a7a5a', '#2a4a3a'], chimney: 60, doorCol: 2, windows: [0.4, 3.6] },
  nv_tailor: { tw: 5, wallH: 40, roofH: 36, slope: 10, wall: ['#e0c8d8', '#ecd8e4', '#c0a8b8'], roof: ['#6a4a8a', '#7a5a9a', '#4a2a6a'], chimney: 14, doorCol: 2, windows: [0.4, 3.6] },
  nv_pottery: { tw: 5, wallH: 40, roofH: 32, slope: 8, wall: ['#c89070', '#d8a080', '#a87050'], roof: ['#8a5a3a', '#9a6a4a', '#6a3a2a'], chimney: 62, doorCol: 2, windows: [0.4, 3.6] },
  nv_school: { tw: 7, wallH: 46, roofH: 40, slope: 12, wall: ['#e8e0c8', '#f4ecd8', '#c8c0a8'], roof: ['#a03a3a', '#b84a4a', '#7a2a2a'], chimney: 92, doorCol: 3, windows: [0.5, 1.6, 4.6, 5.7] },
  nv_fisher: { tw: 5, wallH: 36, roofH: 32, slope: 9, wall: ['#a0b8c8', '#b0c8d8', '#8098a8'], roof: ['#4a5a6a', '#5a6a7a', '#3a4a5a'], chimney: 58, doorCol: 2, windows: [0.4, 3.6] },
  nv_millhouse: { tw: 5, wallH: 40, roofH: 36, slope: 10, wall: ['#d8c8a8', '#e8d8b8', '#b8a888'], roof: ['#6a7a3a', '#7a8a4a', '#4a5a2a'], chimney: 16, doorCol: 2, windows: [0.4, 3.6] },
});
(() => {
  // The windmill: a white stone tower with a timber cap. The sails turn (drawn separately, below).
  const { mk, P, outlined } = Art;
  const mill = night => outlined(mk(6 * 16 + 8, 120, g => {
    const W = 104, H = 120;
    for (let y = 30; y < H; y++) { const half = Math.round(22 + (y - 30) / (H - 30) * 18); P(g, '#e8e0d0', W / 2 - half, y, half * 2, 1); P(g, '#c8c0b0', W / 2 + half - 4, y, 4, 1); if (y % 9 === 0) P(g, '#d0c8b8', W / 2 - half, y, half * 2, 1); }
    P(g, '#8a5a3a', W / 2 - 26, 14, 52, 18); P(g, '#a06a42', W / 2 - 26, 14, 52, 4); P(g, '#6a3a22', W / 2 - 22, 8, 44, 7); P(g, '#5a3a20', W / 2 - 4, 2, 8, 7);
    P(g, '#3a2414', 37, H - 26, 14, 26); P(g, '#7a5535', 38, H - 25, 12, 25); P(g, '#c9a040', 47, H - 13, 2, 2);
    [[W / 2 - 6, 48], [W / 2 - 6, 74]].forEach(([x, y]) => { P(g, '#3a2414', x, y, 12, 12); P(g, night ? '#ffd070' : '#7ab8d8', x + 1, y + 1, 10, 10); P(g, '#3a2414', x + 5, y, 2, 12); });
  }));
  const building = Art.building;
  Art.building = (type, season, night) => (type === 'nv_mill' ? Art.memo('nv_mill' + night, () => mill(night)) : building(type, season, night));
})();

// ---- The plots, and what goes on them -------------------------------------------------------------------
// Each plot opens at an act: forest before it, a construction site during it, finished after it.
const GROW_PLOTS = [
  { id: 'east_north', at: 1, rect: [64, 9, 19, 14], label: 'east of the square',
    houses: [
      { id: 'workshop', type: 'nv_workshop', x: 66, y: 12, w: 6, h: 3, door: [68, 14], room: 'Thatch\'s Workshop', who: 'wenna' },
      { id: 'beecot', type: 'nv_bee', x: 75, y: 12, w: 5, h: 3, door: [77, 14], room: 'Honeywell Cottage', who: 'elsie' },
    ],
    paths: [[68, 15, 1, 8], [77, 15, 1, 8]],
    piles: [['nvtimber', 64, 17], ['nvstones', 73, 18], ['nvsawhorse', 71, 16]],
    decor: [['nvtimber', 64, 17], ['nvsawhorse', 71, 17], ['nvhive', 81, 11], ['nvhive', 81, 14], ['nvhive', 80, 17], ['lamp', 70, 21], ['lamp', 79, 21], ['flowers', 74, 16], ['flowers', 80, 20]],
    builders: [[68, 15, DIRS.up], [77, 15, DIRS.up]], carry: [[65, 19], [68, 16]] },
  { id: 'east_south', at: 2, rect: [64, 26, 19, 18], label: 'south of the King\'s Road',
    houses: [
      { id: 'herbal', type: 'nv_herbal', x: 66, y: 29, w: 5, h: 3, door: [68, 31], room: 'The Herbalist\'s', who: 'juniper' },
      { id: 'tailor', type: 'nv_tailor', x: 74, y: 29, w: 5, h: 3, door: [76, 31], room: 'Stitchwell\'s', who: 'nell' },
      { id: 'pottery', type: 'nv_pottery', x: 66, y: 37, w: 5, h: 3, door: [68, 39], room: 'The Pottery', who: 'bryn' },
    ],
    paths: [[72, 26, 1, 7], [66, 33, 15, 1], [68, 32, 1, 1], [76, 32, 1, 1], [71, 34, 1, 7], [68, 40, 3, 1]],
    piles: [['nvtimber', 79, 34], ['nvstones', 80, 37], ['nvsawhorse', 74, 38]],
    decor: [['mkrack', 64, 34], ['flowers', 64, 30], ['flowers', 64, 31], ['flowers', 73, 31], ['nvline', 75, 35], ['nvkiln', 72, 37], ['nvpots', 74, 40], ['nvpots', 64, 40], ['lamp', 70, 27], ['lamp', 80, 27]],
    builders: [[68, 32, DIRS.up], [76, 32, DIRS.up], [68, 40, DIRS.up]], carry: [[78, 36], [71, 33]] },
  { id: 'south_west', at: 3, rect: [4, 45, 27, 12], label: 'south-west of the old lane',
    houses: [
      { id: 'school', type: 'nv_school', x: 7, y: 46, w: 7, h: 3, door: [10, 48], room: 'The Schoolhouse', who: 'edwin' },
      { id: 'fisher', type: 'nv_fisher', x: 19, y: 46, w: 5, h: 3, door: [21, 48], room: 'Linden\'s Hut', who: 'maeve' },
    ],
    paths: [[4, 50, 27, 1], [10, 49, 1, 1], [21, 49, 1, 1]],
    pond: [18, 52, 8, 4],
    piles: [['nvtimber', 15, 52], ['nvstones', 5, 53], ['nvsawhorse', 12, 53]],
    decor: [['nvswing', 6, 52], ['bench', 10, 53], ['nvreeds', 17, 53], ['nvreeds', 26, 52], ['nvreeds', 26, 55], ['nvboat', 24, 51], ['lamp', 15, 49], ['flowers', 5, 49], ['sign', 14, 49, { text: 'MOSSBROOK SCHOOL. All welcome. Wipe your boots. - E. Larke' }]],
    builders: [[10, 49, DIRS.up], [21, 49, DIRS.up]], carry: [[17, 51], [12, 50]] },
  { id: 'south_east', at: 4, rect: [34, 45, 49, 12], label: 'south-east, past the smithy',
    houses: [
      { id: 'mill', type: 'nv_mill', x: 38, y: 45, w: 6, h: 4, door: [40, 48], room: 'The Windmill', who: 'garrick' },
      { id: 'millhouse', type: 'nv_millhouse', x: 46, y: 46, w: 5, h: 3, door: [48, 48], room: 'Garrick\'s House' },
      { id: 'fair1', type: 'cottageA', x: 76, y: 46, w: 5, h: 3, door: [78, 48], room: 'Fairweather Cottage' },
      { id: 'fair2', type: 'cottageB', x: 76, y: 52, w: 5, h: 3, door: [78, 54], room: 'Amberson House' },
    ],
    paths: [[34, 50, 25, 1], [40, 49, 1, 1], [48, 49, 1, 1]],
    square: [58, 47, 17, 9],
    piles: [['nvtimber', 52, 52], ['nvstones', 60, 51], ['nvsawhorse', 55, 48], ['nvtimber', 68, 53]],
    decor: [['well', 66, 51, { text: 'The new well. Garrick dug it. It is very deep, and he is very proud of it.' }], ['bench', 60, 48], ['bench', 70, 54], ['stall', 61, 53], ['lamp', 58, 47], ['lamp', 74, 47], ['lamp', 58, 55], ['lamp', 74, 55], ['flowers', 63, 48], ['flowers', 69, 48], ['nvtimber', 52, 53],
      ['sign', 57, 49, { text: 'MOSSBROOK. Est. long ago, grown lately. Welcome.' }]],
    builders: [[40, 49, DIRS.up], [48, 49, DIRS.up], [66, 51, DIRS.down]], carry: [[52, 50], [62, 50]] },
];

const Grow = {
  stage() {
    if (!S) return 0;
    if (S.ending) return 5;
    if (S.quests && S.quests.a5_1) return 4;
    if (Memory.get('act3_done')) return 3;
    if (Memory.get('act2_done')) return 2;
    if (Memory.get('act1_done')) return 1;
    return 0;
  },
  state(p, st = this.stage()) { return st < p.at ? 'forest' : st === p.at ? 'site' : 'built'; },
  building(id) { const p = GROW_PLOTS.find(q => q.id === id); return !!p && this.state(p) === 'site'; },
  anySite() { return GROW_PLOTS.some(p => this.state(p) === 'site'); },
  inRect(r, x, y) { return x >= r[0] && y >= r[1] && x < r[0] + r[2] && y < r[1] + r[3]; },
  // The woods beyond the old town: everything east of x 61 and south of y 45, except the roads.
  wild(m, x, y) { const e = m.w - 4; return !Garden.inside(x, y) && ((x >= 61 && x <= e && y >= 5 && y <= 44) || (y >= 45 && y <= 56 && x >= 3 && x <= e)); },
  keep(m, x, y) { return World.g(m, x, y) === T.D || (x === m.w - 5 && y === 22) || (x === 30 && y === 55); },
  hash(x, y) { let h = (x * 374761393 + y * 668265263) >>> 0; h = (h ^ (h >>> 13)) * 1274126177 >>> 0; return (h % 10000) / 10000; },
  clear(m, r) {
    for (let y = r[1]; y < r[1] + r[3]; y++) for (let x = r[0]; x < r[0] + r[2]; x++) {
      const o = World.at(m, x, y); if (o && !(o.type === 'sign' && this.keep(m, x, y))) World.remove(m, o);
      if (World.g(m, x, y) === T.W) World.set(m, x, y, T.G);
      m.block.delete(key(x, y));
    }
    m.buildings = m.buildings.filter(b => !this.inRect(r, b.x, b.y));
    m.warps = m.warps.filter(w => !this.inRect(r, w.x, w.y));
  },
  forest(m, r) {
    for (let y = r[1]; y < r[1] + r[3]; y++) for (let x = r[0]; x < r[0] + r[2]; x++) {
      if (this.keep(m, x, y) || World.at(m, x, y)) continue;
      const h = this.hash(x, y);
      if ((x + y) % 2 === 0) World.add(m, 'btree', x, y, { kind: h < 0.45 ? 'pine' : 'oak', v: Math.floor(h * 40) % 4 });
      else if (h < 0.22) World.add(m, 'bush', x, y);
      m.block.add(key(x, y));
    }
  },
  // Lay out every plot for the story as it stands. Safe to run again: each plot is cleared first.
  layout(m) {
    const st = this.stage();
    // The woods outside the plots.
    for (let y = 5; y < 57; y++) for (let x = 3; x < m.w - 3; x++) if (this.wild(m, x, y) && !GROW_PLOTS.some(p => this.inRect(p.rect, x, y)) && !World.at(m, x, y) && !this.keep(m, x, y)) {
      const h = this.hash(x, y);
      if ((x + y) % 2 === 0) World.add(m, 'btree', x, y, { kind: h < 0.45 ? 'pine' : 'oak', v: Math.floor(h * 40) % 4 });
      else if (h < 0.22) World.add(m, 'bush', x, y);
      m.block.add(key(x, y));
    }
    for (const p of GROW_PLOTS) {
      const state = this.state(p, st);
      this.clear(m, p.rect);
      if (state === 'forest') { this.forest(m, p.rect); continue; }
      for (const [x, y, w, h] of p.paths) World.rect(m, x, y, w, h, T.D);
      if (p.square) World.rect(m, ...p.square, T.C);
      if (state === 'site') {
        for (const hs of p.houses) World.add(m, Art.nvSite(hs.w, hs.h), hs.x, hs.y, { text: `A building going up. The builders say it is for ${hs.room ? 'the ' + hs.room.replace(/^The /, '') : 'a new family'}, when it is done.` });
        for (const [t, x, y] of p.piles) World.add(m, t, x, y, { text: t === 'nvtimber' ? 'Fresh-cut timber, smelling of sap. Marked for the new houses.' : 'Dressed stone for the footings.' });
        continue;
      }
      // Built.
      if (p.pond) World.rect(m, ...p.pond, T.W);
      for (const hs of p.houses) {
        if (hs.door) {
          World.addBuilding(m, hs.type, hs.x, hs.y, hs.w, hs.h, { door: { x: hs.door[0], y: hs.door[1] } });
          // Locked while the house stands empty; once people live here, shops keep hours and homes stay locked.
          const w = { x: hs.door[0], y: hs.door[1], to: 'nvr_' + hs.id, tx: 6, ty: 7, dir: DIRS.up, door: true };
          if (st >= 5 && NV_HOMES[hs.id].open) w.hours = [480, 1140, `${hs.room} is shut for the night. Open 8:00 to 19:00.`]; else w.locked = true;
          m.warps.push(w);
        } else World.addBuilding(m, hs.type, hs.x, hs.y, hs.w, hs.h, { msg: hs.msg });
      }
      for (const [t, x, y, props] of p.decor) World.add(m, t, x, y, props || (OBJDEF[t].act === 'read' ? { text: this.TEXT[t] || '' } : undefined));
    }
    // A room whose house is not up yet lets you out onto the square, never into the trees.
    for (const p of GROW_PLOTS) for (const hs of p.houses) {
      const r = hs.door && World.maps['nvr_' + hs.id], w = r && r.warps[0]; if (!w) continue;
      const up = this.state(p, st) === 'built';
      w.tx = up ? hs.door[0] : 32; w.ty = up ? hs.door[1] + 1 : 21;
    }
    m.growStage = st; m.version = (m.version || 0) + 1;
  },
  TEXT: { nvhive: 'A beehive, humming. Elsie has painted a name on each one. This one is "Duchess".', nvkiln: 'The kiln, ticking as it cools. Something inside is going to be a jug.', nvswing: 'A swing. The seat is polished smooth by small trousers.', nvtimber: 'Timber left over from the building, stacked for the winter.', nvstones: 'Spare stone.' },
};

// Who owns each new building, whether it keeps shop hours, and what is inside worth stealing.
const NV_HOMES = {
  workshop: { owner: 'wenna', open: true, loot: { items: [['wood', 4, 8], ['sap', 1, 3], ['stone', 2, 4], ['fiber', 3, 6]], gold: [10, 40] } },
  beecot: { owner: 'elsie', open: true, loot: { items: [['honey', 1, 2], ['honeycomb', 1, 1], ['beeswax_candle', 1, 1], ['mead', 1, 1]], gold: [10, 30] } },
  herbal: { owner: 'juniper', open: true, loot: { items: [['herb', 2, 4], ['herb_tea', 1, 2], ['salve', 1, 1], ['lavender_sachet', 1, 1]], gold: [10, 40] } },
  tailor: { owner: 'nell', loot: { items: [['fiber', 3, 6], ['silk_ribbon', 1, 1]], gold: [20, 60] } },
  pottery: { owner: 'bryn', loot: { items: [['stone', 3, 5], ['quartz', 1, 1], ['coal', 1, 3]], gold: [5, 30] } },
  school: { owner: 'edwin', open: true, loot: { items: [['hazelnut', 2, 4], ['blackberry', 2, 3]], gold: [0, 15] } },
  fisher: { owner: 'maeve', loot: { items: [['trout', 1, 2], ['bass', 1, 1], ['eel', 1, 1]], gold: [5, 25] } },
  mill: { owner: 'garrick', open: true, loot: { items: [['bread', 1, 3], ['oatcake', 1, 3], ['corn', 2, 3]], gold: [20, 60] } },
  millhouse: { owner: 'garrick', loot: { items: [['bread', 1, 2], ['honey', 1, 1], ['omelette', 1, 1]], gold: [30, 80] } },
  fair1: { owner: 'fairweather', loot: { items: [['egg', 2, 4], ['potato', 2, 3], ['trailmix', 1, 1]], gold: [10, 40] } },
  fair2: { owner: 'amberson', loot: { items: [['blackberry', 2, 4], ['omelette', 1, 1], ['hazelnut', 1, 3]], gold: [10, 40] } },
};
for (const id in NV_HOMES) LOOT['nvr_' + id] = NV_HOMES[id].loot;
// The two families in the south-east cottages keep to themselves, but they are real people with real homes.
npc({ id: 'fairweather', name: 'Rowan Fairweather', role: 'New neighbour', remote: true, minor: true, gone: () => !S || !S.ending,
  look: { skin: '#e0b088', skinD: '#c09068', hair: '#c87a48', hairD: '#a0582c', style: 'short', shirt: '#5a8a6a', shirtD: '#3a6a4a', belt: '#3a2414', pants: '#5a4a38', pantsD: '#44382a', shoes: '#2a1a12', beard: '#c87a48' },
  sched: [[360, 'nvr_fair1', 5, 5], [1320, 'nvr_fair1', 5, 5, true]], loves: [], likes: [], hates: [],
  greet: ['Oh! Hello. We are still unpacking. We will be unpacking until we are old.', 'I sing while I work. My wife says I sing instead of working.'], chat: [{ h: 0, t: 'We came for the harvests. Everyone did.' }], reactions: [] });
npc({ id: 'amberson', name: 'Hilde Amberson', role: 'New neighbour', remote: true, minor: true, gone: () => !S || !S.ending,
  look: { skin: '#c99a72', skinD: '#a87c58', hair: '#3a2a1a', hairD: '#2a1a10', style: 'bun', shirt: '#a05a7a', shirtD: '#7a3a5a', belt: '#3a2414', pants: '#3a3a44', pantsD: '#2a2a32', shoes: '#2a1a12', dress: '#a05a7a', dressD: '#7a3a5a' },
  sched: [[360, 'nvr_fair2', 5, 5], [1320, 'nvr_fair2', 5, 5, true]], loves: [], likes: [], hates: [],
  greet: ['Three children, one house, no peace. Wipe your boots.', 'If you see a small boy with a frog, he is mine. The frog is not.'], chat: [{ h: 0, t: 'Master Larke says my eldest asks the best questions. I say he asks the most.' }], reactions: [] });

// Inside each new building: a room of its own.
(() => {
  const FURNISH = {
    workshop: [['counter', 3, 4], ['counter', 4, 4], ['shelf', 7, 3], ['nvsawhorse', 2, 6], ['nvtimber', 7, 6], ['bed', 9, 3], ['lockbox', 1, 3]],
    beecot: [['table', 3, 5], ['chair', 3, 6], ['shelf', 2, 3], ['bed', 9, 4], ['plant', 9, 7], ['nvhive', 2, 7], ['lockbox', 8, 3]],
    herbal: [['counter', 4, 4], ['counter', 5, 4], ['shelf', 2, 3], ['shelf', 8, 3], ['plant', 2, 7], ['plant', 3, 7], ['bed', 9, 6], ['lockbox', 10, 3]],
    tailor: [['table', 3, 5], ['chair', 3, 6], ['shelf', 8, 3], ['nvline', 2, 3], ['bed', 9, 6], ['lockbox', 10, 3]],
    pottery: [['nvpots', 2, 4], ['nvpots', 3, 4], ['table', 6, 5], ['shelf', 8, 3], ['bed', 9, 6], ['lockbox', 1, 7], ['crate', 2, 7]],
    school: [['table', 3, 5], ['table', 5, 5], ['table', 7, 5], ['chair', 3, 6], ['chair', 5, 6], ['chair', 7, 6], ['bookshelf', 2, 3], ['bookshelf', 8, 3], ['plant', 10, 7], ['lockbox', 1, 7]],
    fisher: [['table', 3, 5], ['chair', 3, 6], ['barrel', 2, 7], ['crate', 3, 7], ['bed', 9, 5], ['lockbox', 1, 3]],
    mill: [['crate', 2, 4], ['crate', 3, 4], ['barrel', 2, 6], ['barrel', 9, 4], ['counter', 6, 4], ['crate', 9, 6], ['barrel', 10, 6], ['lockbox', 1, 7]],
    millhouse: [['table', 2, 5], ['chair', 2, 6], ['shelf', 7, 3], ['bed', 9, 5], ['plant', 2, 7], ['lockbox', 1, 3]],
    fair1: [['table', 2, 5], ['chair', 2, 6], ['shelf', 7, 3], ['bed', 9, 3], ['barrel', 1, 7], ['lockbox', 1, 3], ['plant', 10, 7]],
    fair2: [['table', 3, 5], ['chair', 3, 6], ['bed', 9, 3], ['bed', 9, 6], ['crate', 1, 7], ['lockbox', 1, 3], ['bookshelf', 6, 3]],
  };
  const build = World.build.bind(World);
  World.build = function () {
    build();
    const m = this.maps.village; if (!m) return;
    for (const p of GROW_PLOTS) for (const hs of p.houses) {
      if (!hs.door) continue;
      const r = this.room('nvr_' + hs.id, hs.room, 12, 9, T.F, hs.id === 'mill' ? ['#e8e0d0', '#d8d0c0', '#b8b0a0'] : ['#c8a87a', '#b8986a', '#98784a']);
      r.warps.push({ x: 6, y: 8, to: 'village', tx: hs.door[0], ty: hs.door[1] + 1, dir: DIRS.down });
      for (const [t, x, y] of FURNISH[hs.id] || []) if (OBJDEF[t]) this.add(r, t, x, y);
      // Somebody's home, with things worth taking and the owner asleep in bed at night.
      r.owner = NV_HOMES[hs.id].owner;
      const bed = (FURNISH[hs.id] || []).find(f => f[0] === 'bed'); if (bed) r.bed = [bed[1], bed[2]];
    }
    Grow.layout(m);
  };
})();

// ---- The new people of Mossbrook ----------------------------------------------------------------------
(() => {
  const look = (skin, hair, style, shirt, pants, more) => Object.assign({ skin: skin[0], skinD: skin[1], hair: hair[0], hairD: hair[1], style, shirt: shirt[0], shirtD: shirt[1], belt: '#3a2414', pants: pants[0], pantsD: pants[1], shoes: '#2a1a12' }, more || {});
  const SK = [['#f0c49a', '#d9a678'], ['#c99a72', '#a87c58'], ['#8a5a3a', '#6a4228'], ['#e0b088', '#c09068']];
  const exposed = () => Memory.get('crown_fallen');
  // Where each one works by day (once the town is finished), and their own room at night.
  const PEOPLE = [
    { id: 'wenna', name: 'Wenna Thatch', role: 'Carpenter', home: 'workshop', day: [70, 16], shop: 'nv_carpenter',
      look: look(SK[1], ['#a0582c', '#7a3a1a'], 'bun', ['#7a8a5a', '#5a6a3a'], ['#5a4a38', '#44382a'], { apron: '#c8a070' }),
      loves: ['wood', 'sap', 'mead'], likes: ['stone', 'kind:food'], hates: ['kind:fish'],
      greet: ['Every house on this side of town, I built. Well. Me and eleven very loud men.', 'Mind the sawdust.', 'Need timber? I have timber. I will always have timber.'],
      chat: ['I came for one job, a barn. Then there was another, and another. Mossbrook kept growing and I kept staying.', 'A good joint needs no nails. A good town needs no walls.', 'You can tell who built a house by the doors. Mine never stick.'],
      after: ['When the Crown fell, nobody came to tell us where we could build any more. So we built where people wanted to live.', 'They say the harvests will be thinner now. Then we build granaries. That is what carpenters are for.'],
      kept: ['The harvests here never fail. That is why everyone comes. That, and my doors.'] },
    { id: 'elsie', name: 'Elsie Honeywell', role: 'Beekeeper', home: 'beecot', day: [79, 16], shop: 'nv_apiary',
      look: look(SK[0], ['#e8d8a8', '#c8b888'], 'long', ['#f0c040', '#c89a20'], ['#5a4a38', '#44382a'], { hat: 'straw' }),
      loves: ['honeycomb', 'dandelion', 'beeswax_candle'], likes: ['kind:crop', 'kind:forage'], hates: ['smoke_vial'],
      greet: ['Mind the bees. Or don\'t. They\'re very forgiving. Mostly.', 'Taste this. No, go on. Clover honey.', 'Bzzz. Sorry. You get into the habit.'],
      chat: ['Bees tell you everything about a place. Here they are fat and happy and never sting. I have never seen bees like it.', 'Every hive has a name. Duchess is the bossy one. Pudding is the lazy one.', 'My grandmother kept bees in Mossbrook, before. I came back to see if her flowers were still here. They were.'],
      after: ['The bees went quiet for a week, when everything changed. Then they went back to work. Bees are sensible.'],
      kept: ['Odd. My bees never swarm here. They never leave. Bees always leave, eventually.'] },
    { id: 'juniper', name: 'Juniper Ash', role: 'Herbalist', home: 'herbal', day: [70, 32], shop: 'nv_herbalist',
      look: look(SK[2], ['#1a1210', '#100a08'], 'long', ['#3a6a4a', '#2a4a3a'], ['#4a4a54', '#3a3a44'], { cape: '#5a7a4a' }),
      loves: ['herb', 'mushroom', 'herb_tea'], likes: ['kind:forage', 'dandelion'], hates: ['coal'],
      greet: ['Breathe in. That is lavender. You are welcome.', 'A sniffle? A burn? A broken heart? I have a jar for most of those.', 'Silverleaf grows wild here. Do you know how rare that is?'],
      chat: ['I trained in the capital, in the King\'s physic garden. Everything there was perfect. Everything there was the same.', 'The best medicine is sleep, water and a friend. I sell the other things.', 'Some plants here grow in the shapes of letters, if you look long enough. I have stopped looking.'],
      after: ['People come to me now with grief more than coughs. There is no tea for it. I make one anyway.'],
      kept: ['Nothing here ever wilts. My whole craft is about things that wilt. I am not sure what I am for.'] },
    { id: 'nell', name: 'Nell Stitchwell', role: 'Tailor', home: 'tailor', day: [77, 32],
      look: look(SK[3], ['#c87a48', '#a0582c'], 'bun', ['#a05a7a', '#7a3a5a'], ['#3a3a44', '#2a2a32'], { dress: '#a05a7a', dressD: '#7a3a5a' }),
      loves: ['silk_ribbon', 'lavender_sachet', 'pearl'], likes: ['kind:gift', 'fiber'], hates: ['kind:fish'],
      greet: ['Arms out. No, I\'m measuring. Everyone gets measured.', 'Your hem is coming down. Don\'t argue with me about your own hem.', 'I have forty orders and two hands. Come back in a month.'],
      chat: ['Everyone moving in needs curtains, coats, and something nice for the first dance. I have not slept since spring.', 'A good coat outlasts its owner. I find that comforting. Some people do not.', 'I could make you something with a little gold thread. You look like you have earned a little gold thread.'],
      after: ['I made a mourning band last week for a woman who lost her grandfather sixty years ago. She only just found out how.'],
      kept: ['The court sends patterns from the capital every season. Always green. Always the same.'] },
    { id: 'bryn', name: 'Bryn Clayton', role: 'Potter', home: 'pottery', day: [71, 40],
      look: look(SK[1], ['#5a4a3a', '#3a2a1a'], 'short', ['#c8a080', '#a88060'], ['#6a5a48', '#4a3a2a'], { beard: '#5a4a3a', apron: '#a87050' }),
      loves: ['stone', 'quartz', 'amethyst'], likes: ['kind:material', 'kind:food'], hates: ['kind:gift'],
      greet: ['Don\'t touch that, it\'s still wet. Don\'t touch that either.', 'Pots. Jugs. Bowls. Things that hold other things.', 'The kiln\'s hot. Stand back, or stand close, if you\'re cold.'],
      chat: ['The clay by the river here is the best I have ever worked. Red as a fox.', 'A pot is just a hole with a shape around it. People laugh. It is true.', 'Every house in the new streets has one of my jugs. Hale\'s Goods sells them. I am a little famous.'],
      after: ['I am making plates for a memorial supper. Hundreds of them. Every one has a name pressed in the rim.'],
      kept: ['I dug clay from the riverbank and found a child\'s shoe, very old. I put it back. I do not know why I put it back.'] },
    { id: 'edwin', name: 'Master Edwin Larke', role: 'Schoolteacher', home: 'school', day: [12, 51], spot: [6, 3],
      look: look(SK[3], ['#d8d4cc', '#b4b0a8'], 'short', ['#3a4a6a', '#2a3a5a'], ['#3a3a44', '#2a2a32'], { beard: '#d8d4cc' }),
      loves: ['ship_bottle', 'herb_tea', 'hazelnut'], likes: ['kind:food', 'kind:gift'], hates: ['coal'],
      greet: ['Ah, a former pupil? No? A future one, then. It is never too late.', 'Quiet, please. Oh, it is break. Carry on.', 'Do you know your letters? Do you know your history? I worry about the history.'],
      chat: ['Twenty-two children, and every one of them asks why. I tell them why is the best question there is.', 'The old schoolbooks all say the same thing about the King. Word for word, for a hundred years. I have started writing new ones.', 'Finn Tolley brings me frogs. I am fairly sure it is affection.'],
      after: ['I teach the true history now. Some parents complained. More of them came to listen.'],
      kept: ['The Crown sends the lessons. I teach them. The children ask why. I find I have no answers.'] },
    { id: 'maeve', name: 'Maeve Linden', role: 'Fisher', home: 'fisher', day: [23, 51],
      look: look(SK[2], ['#3a2a1a', '#2a1a10'], 'messy', ['#5a7a9a', '#3a5a7a'], ['#4a4a54', '#3a3a44'], { hat: 'cap', hatC: '#3a5a7a', hatD: '#2a4a6a' }),
      loves: ['eel', 'trout', 'bass'], likes: ['kind:fish', 'kind:food'], hates: ['kind:gift'],
      greet: ['Shh. Fish.', 'Caught a trout this big this morning. Well. This big. Fine. This big.', 'The pond\'s new, but the fish don\'t know that.'],
      chat: ['I stocked the pond myself, bucket by bucket from the river. My arms have never forgiven me.', 'The river fish here are fat and lazy. Something feeds them very well.', 'I fished the Saltmere coast for twenty years. The sea is beautiful. The pond is quiet. I like quiet now.'],
      after: ['Since the river went back, there are fish in places there never were. As if something let go of them.'],
      kept: ['I stopped fishing near the old bridge. The fish there look at you.'] },
    { id: 'garrick', name: 'Garrick Stone', role: 'Miller', home: 'millhouse', day: [44, 50], shop: 'nv_mill',
      look: look(SK[0], ['#c8a048', '#a07a30'], 'short', ['#e8e0d0', '#c4baa6'], ['#6a5a48', '#4a3a2a'], { beard: '#c8a048', apron: '#f0ece0', hat: 'cap', hatC: '#e8e0d0', hatD: '#c4baa6' }),
      loves: ['corn', 'bread', 'oatcake'], likes: ['kind:crop', 'kind:food'], hates: ['kind:fish'],
      greet: ['Flour on your boots now. Everyone gets flour on their boots.', 'Hear her turning? That is the sound of bread.', 'Fresh loaves, still warm. Mind your fingers.'],
      chat: ['Every farm in the valley brings grain to my mill now. I grind it, the town eats it. Simple. Beautiful.', 'I dug the well in the new square myself. Forty feet. Ask me about it. Please, ask me about it.', 'My mother baked these oat cakes for the whole street. Now I do. The street is longer.'],
      after: ['The harvest is smaller this year. I grind slower and I talk more. Nobody has gone hungry. We share.'],
      kept: ['The grain never runs short here. Not in any year. I keep waiting for a bad year, like a normal place.'] },
  ];
  for (const P of PEOPLE) {
    const room = 'nvr_' + P.home, [sx, sy] = P.spot || [5, 5];
    npc({
      id: P.id, name: P.name, role: P.role, remote: true,
      gone: () => !S || !S.ending,
      look: P.look,
      // Their own room is always safe to stand in; once the town is finished they work outdoors by day.
      sched: [[360, room, sx, sy], [1140, room, sx, sy], [1320, room, sx, sy, true]],
      where: () => (S && S.ending ? [[360, room, sx, sy], [480, 'village', P.day[0], P.day[1]], [1140, room, sx, sy], [1320, room, sx, sy, true]] : null),
      loves: P.loves, likes: P.likes, hates: P.hates,
      chat: P.chat.map((t, i) => ({ h: i * 2, t })),
      reactions: [],
      extra(opts) { if (P.shop) opts.push({ text: 'Trade', fn: () => UI.push(UI.shop(P.shop, P.id)) }); },
    });
    // A word about how things ended, among their usual greetings.
    Object.defineProperty(NPCS[P.id], 'greet', { get: () => P.greet.concat(exposed() ? P.after : P.kept), configurable: true });
  }
  const stock = UI.stock.bind(UI);
  UI.stock = kind => ({
    nv_carpenter: [{ id: 'wood', price: 15 }, { id: 'stone', price: 15 }, { id: 'fiber', price: 8 }, { id: 'sap', price: 25 }, { id: 'sprinkler', price: 320 }, { id: 'fertilizer', price: 60 }],
    nv_apiary: [{ id: 'honey', price: 90 }, { id: 'honeycomb', price: 140 }, { id: 'mead', price: 190 }, { id: 'beeswax_candle', price: 180 }],
    nv_herbalist: [{ id: 'salve', price: 120 }, { id: 'herb_tea', price: 100 }, { id: 'herb', price: 60 }, { id: 'lavender_sachet', price: 140 }],
    nv_mill: [{ id: 'bread', price: 80 }, { id: 'oatcake', price: 60 }, { id: 'honey', price: 100 }],
  }[kind] || stock(kind));
})();

// ---- Builders at work, and children at school -------------------------------------------------------------
(() => {
  const SK = [['#f0c49a', '#d9a678'], ['#c99a72', '#a87c58'], ['#8a5a3a', '#6a4228'], ['#e0b088', '#c09068']];
  const L = (s, hair, style, shirt, pants, more) => Object.assign({ skin: s[0], skinD: s[1], hair: hair[0], hairD: hair[1], style, shirt: shirt[0], shirtD: shirt[1], belt: '#3a2414', pants: pants[0], pantsD: pants[1], shoes: '#2a1a12' }, more || {});
  const SHIRTS = [['#a07a50', '#7a5a38'], ['#7a8a5a', '#5a6a3a'], ['#5a6a8a', '#3a4a6a'], ['#9a5a3a', '#7a3a1a']];
  const LINES = ['Mind the planks!', 'Another house, another winter roof.', 'Hold that beam. No, the other end.', 'Mossbrook\'s growing faster than we can nail it together.', 'Good harvests mean more hands. More hands need more houses.', 'Lunch is when the foreman says. The foreman never says.'];
  let n = 0;
  for (const p of GROW_PLOTS) {
    const when = () => Grow.building(p.id);
    p.builders.forEach(([x, y, dir], i) => {
      EXTRAS['nvb_' + p.id + i] = { map: 'village', name: 'Builder', look: L(SK[n % 4], [['#3a2a1a', '#2a1a10'], ['#c87a48', '#a0582c'], ['#1a1210', '#100a08']][n % 3], ['short', 'messy', 'bald'][n % 3], SHIRTS[n % 4], [['#5a4a38', '#44382a'], ['#3a3a44', '#2a2a32']][n % 2], { hat: 'cap', hatC: '#e8c040', hatD: '#c8a020' }), at: [x, y], dir, only: 'day', when, prop: 'hammer', lines: LINES };
      n++;
    });
    EXTRAS['nvc_' + p.id] = { map: 'village', name: 'Builder', look: L(SK[n % 4], ['#5a4a3a', '#3a2a1a'], 'short', SHIRTS[(n + 1) % 4], [['#5a4a38', '#44382a']][0], { hat: 'cap', hatC: '#e8c040', hatD: '#c8a020' }), route: p.carry, speed: 16, stop: 1.5, only: 'day', when, prop: 'crate', lines: LINES };
    n++;
  }
  // The foreman stands by the King's Road, watching all of it.
  EXTRAS.nv_foreman = { map: 'village', name: 'Foreman Hobb', look: L(SK[1], ['#d8d4cc', '#b4b0a8'], 'bald', ['#8a5a3a', '#6a3a1a'], ['#3a3a44', '#2a2a32'], { beard: '#d8d4cc', hat: 'cap', hatC: '#e8c040', hatD: '#c8a020' }), at: [60, 26], dir: DIRS.down, only: 'day', when: () => Grow.anySite(),
    lines: ['New plots, new families. The valley feeds everyone who comes, they say, so everyone comes.', 'One more street and I retire. I said that three streets ago.', 'Keep off the scaffolding, farmer. It is held together mostly by optimism.'] };
  // After the ending: children in the schoolyard and new neighbours in the square.
  const after = () => !!(S && S.ending);
  Object.assign(EXTRAS, {
    nv_kid1: { map: 'village', name: 'Pupil', look: L(SK[0], ['#c87a48', '#a0582c'], 'messy', ['#e04050', '#a02a38'], ['#3a7ac0', '#2a5a90']), at: [8, 51], wander: [5, 50, 16, 55], speed: 20, only: 'day', when: after, lines: ['Master Larke says ask why. WHY?', 'Tag! You\'re it!'] },
    nv_kid2: { map: 'village', name: 'Pupil', look: L(SK[2], ['#1a1210', '#100a08'], 'bun', ['#f0d040', '#c8a820'], ['#5a5048', '#40382c']), at: [13, 51], wander: [5, 50, 16, 55], speed: 20, only: 'day', when: after, lines: ['Seven sevens are... a lot.', 'I want to be a carpenter. Or a dragon.'] },
    nv_kid3: { map: 'village', name: 'Pupil', look: L(SK[3], ['#e8d8a8', '#c8b888'], 'short', ['#7ab05a', '#5a903a'], ['#3a3a44', '#2a2a32']), at: [7, 53], dir: DIRS.right, only: 'day', when: after, lines: ['Push me on the swing! Higher!', 'I can read the whole sign by myself now.'] },
    nv_neigh1: { map: 'village', name: 'New Neighbour', look: L(SK[1], ['#4a3020', '#2a1a10'], 'long', ['#e870a8', '#b84a80'], ['#5a5048', '#40382c']), at: [62, 50], wander: [58, 47, 74, 55], speed: 12, only: 'day', when: after, lines: ['We came for the harvests and stayed for the neighbours.', 'Have you tried Garrick\'s oat cakes? Have you tried NOT trying them?'] },
    nv_neigh2: { map: 'village', name: 'New Neighbour', look: L(SK[2], ['#d8d4cc', '#b4b0a8'], 'bald', ['#5a7a9a', '#3a5a7a'], ['#4a4a54', '#3a3a44'], { beard: '#d8d4cc' }), at: [70, 50], wander: [58, 47, 74, 55], speed: 10, only: 'day', when: after, lines: ['Forty years in the city. Now I have a garden. I talk to the beans.', 'Lovely new square. Lovely new well. Garrick told me about the well. Twice.'] },
  });
})();

// ---- Every frame: keep the town in step with the story; sounds of building; the mill turning --------------
(() => {
  const NOTES = { 1: 'Builders have come to Mossbrook. The town is growing.', 2: 'Houses stand east of the square. More are going up.', 3: 'Building has begun in the south-west of town.', 4: 'A windmill is going up in the south-east of town.', 5: 'Mossbrook is finished. New neighbours have moved in.' };
  let hammerT = 0;
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) {
    tick(dt);
    const v = World.maps.village; if (!v || !S) return;
    const st = Grow.stage();
    if (v.growStage !== st) { const was = v.growStage; Grow.layout(v); if (was !== undefined && st > was && NOTES[st]) toast(NOTES[st]); }
    // Hammering from the sites when you are near.
    if (Player.map !== v || !Grow.anySite()) return;
    hammerT -= dt || 1 / 60;
    if (hammerT > 0) return;
    hammerT = 0.35 + Math.random() * 0.4;
    const near = Extras.active(v).filter(p => p.e.prop === 'hammer' && Math.hypot(p.x - Player.x, p.y - Player.y) < 220);
    if (near.length) { const b = near[Math.floor(Math.random() * near.length)]; Sfx.play('hammerhit'); VFX.burst('spark', b.x + 8, b.y - 14, 3, 30); }
  };
  const { knock, thump } = Sfx.kit;
  Sfx.SOUNDS.hammerhit = function () { knock(this, 1400 + Math.random() * 300, 0.05, 0.22, 0, 3); thump(this, 300, 180, 0.05, 0.12); knock(this, 3200, 0.02, 0.08, 0.01, 6); };
  // The windmill's sails turn.
  const drawWorld = Story.drawWorld.bind(Story);
  Story.drawWorld = function (g, m, items) {
    drawWorld(g, m, items);
    if (m.id !== 'village') return;
    const mill = m.buildings.find(b => b.type === 'nv_mill'); if (!mill) return;
    const cx = mill.x * TILE - 4 + 52, cy = (mill.y + mill.h) * TILE - 120 + 24, a0 = performance.now() / 1000 * 0.8;
    items.push({ y: (mill.y + mill.h) * TILE, draw: () => {
      for (let k = 0; k < 4; k++) {
        const a = a0 + k * Math.PI / 2, c = Math.cos(a), s = Math.sin(a), px = -s, py = c;
        g.strokeStyle = '#5a3a20'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + c * 44, cy + s * 44); g.stroke();
        g.fillStyle = 'rgba(240,232,212,0.95)'; g.beginPath(); g.moveTo(cx + c * 12 + px * 2, cy + s * 12 + py * 2); g.lineTo(cx + c * 44 + px * 2, cy + s * 44 + py * 2); g.lineTo(cx + c * 44 + px * 11, cy + s * 44 + py * 11); g.lineTo(cx + c * 12 + px * 9, cy + s * 12 + py * 9); g.closePath(); g.fill();
        g.strokeStyle = '#8a6239'; g.lineWidth = 1; for (let i = 18; i < 44; i += 6) { g.beginPath(); g.moveTo(cx + c * i + px * 2, cy + s * i + py * 2); g.lineTo(cx + c * i + px * 10, cy + s * i + py * 10); g.stroke(); }
      }
      g.fillStyle = '#3a2414'; g.beginPath(); g.arc(cx, cy, 4, 0, 6.29); g.fill(); g.fillStyle = '#c9a040'; g.fillRect(cx - 1, cy - 1, 2, 2);
    } });
  };
})();
MAP_LABELS.nv_workshop = 'Thatch\'s Workshop'; MAP_LABELS.nv_bee = 'Honeywell Cottage'; MAP_LABELS.nv_herbal = 'The Herbalist\'s'; MAP_LABELS.nv_tailor = 'Stitchwell\'s';
MAP_LABELS.nv_pottery = 'The Pottery'; MAP_LABELS.nv_school = 'The Schoolhouse'; MAP_LABELS.nv_fisher = 'Linden\'s Hut'; MAP_LABELS.nv_mill = 'The Windmill'; MAP_LABELS.nv_millhouse = 'Garrick\'s House';

// ---- Mossbrook Gardens -------------------------------------------------------------------------------
// Walled gardens in the far east of town, on both sides of the King's Road, there from the start: hedges,
// fountains, ponds and beds of every colour. The flowers are for looking at; the signs ask you not to pick them.
Object.assign(OBJDEF, {
  nvb_rose: { solid: 1 }, nvb_tulip: { solid: 1 }, nvb_lav: { solid: 1 }, nvb_daisy: { solid: 1 }, nvb_blue: { solid: 1 }, nvb_pink: { solid: 1 }, nvb_sun: { solid: 1 },
  nvfountain: { solid: 1, fw: 3, fh: 2, act: 'read' },
});
(() => {
  const { mk, P, outlined, STATIC } = Art;
  // A bed of one kind of flower. In winter the beds sleep under snow.
  const bloomBed = (cols, shape) => season => mk(16, 18, g => {
    P(g, '#5a3a24', 0, 12, 16, 6); P(g, '#6a4a30', 0, 12, 16, 2);
    for (let i = 0; i < 7; i++) { const x = 1 + (i * 5) % 14, y = 4 + (i * 3) % 8; P(g, '#3f7a3a', x, y + 2, 3, 12 - y); P(g, '#5aa24a', x + 1, y + 2, 1, 10 - y); }
    if (season === 3) { P(g, '#f0f6fc', 0, 9, 16, 4); P(g, '#ffffff', 2, 8, 5, 2); P(g, '#ffffff', 9, 8, 6, 2); return; }
    const spots = [[1, 2], [6, 0], [11, 2], [3, 6], [9, 5], [13, 7], [0, 9], [6, 9], [11, 10]];
    spots.forEach(([x, y], i) => {
      const c = cols[i % cols.length];
      if (shape === 'spike') { P(g, c[0], x + 1, y, 2, 5); P(g, c[1], x + 1, y, 1, 2); }
      else if (shape === 'cup') { P(g, c[0], x, y + 1, 4, 3); P(g, c[0], x, y, 1, 1); P(g, c[0], x + 3, y, 1, 1); P(g, c[1], x + 1, y + 1, 1, 2); }
      else if (shape === 'daisy') { P(g, c[0], x, y + 1, 4, 2); P(g, c[0], x + 1, y, 2, 4); P(g, '#f0c030', x + 1, y + 1, 2, 2); }
      else { P(g, c[0], x, y, 4, 4); P(g, c[1], x + 1, y + 1, 2, 2); P(g, '#ffffff88', x, y, 1, 1); }
    });
  });
  Object.assign(STATIC, {
    nvb_rose: bloomBed([['#d42a40', '#8a1a2a'], ['#f04a5a', '#a02a3a']], 'round'),
    nvb_tulip: bloomBed([['#f0c030', '#c08a10'], ['#f07a20', '#b04a10'], ['#e83a3a', '#a02020']], 'cup'),
    nvb_lav: bloomBed([['#9a70e0', '#c8a8ff'], ['#7a50c0', '#b090f0']], 'spike'),
    nvb_daisy: bloomBed([['#ffffff', '#f0f0f0']], 'daisy'),
    nvb_blue: bloomBed([['#4a7ae0', '#a0c0ff'], ['#3a5ac0', '#7aa0f0']], 'round'),
    nvb_pink: bloomBed([['#f07ab0', '#ffc0dc'], ['#e85a98', '#ffa8cc']], 'round'),
    nvb_sun: season => outlined(mk(16, 28, g => {
      for (const x of [3, 10]) { P(g, '#3f7a3a', x + 2, 8, 2, 20); P(g, '#5aa24a', x, 16, 3, 2); P(g, '#5aa24a', x + 4, 20, 3, 2); }
      if (season === 3) { P(g, '#7a6a48', 3, 2, 6, 6); P(g, '#7a6a48', 10, 5, 6, 6); P(g, '#ffffff', 3, 1, 6, 2); P(g, '#ffffff', 10, 4, 6, 2); return; }
      for (const [x, y] of [[1, 1], [9, 4]]) { P(g, '#f0c020', x, y + 1, 8, 6); P(g, '#f0c020', x + 1, y, 6, 8); P(g, '#ffe070', x + 1, y, 3, 2); P(g, '#6a3a1a', x + 2, y + 2, 4, 4); P(g, '#8a5a2a', x + 3, y + 3, 1, 1); }
    })),
    nvfountain: season => outlined(mk(48, 40, g => {
      P(g, '#9a9aa4', 2, 22, 44, 16); P(g, '#c2c2cc', 2, 22, 44, 3); P(g, '#7a7a84', 2, 35, 44, 3);
      P(g, season === 3 ? '#d8eef8' : '#4a90cc', 5, 25, 38, 9); P(g, season === 3 ? '#ffffff' : '#7ab8e8', 7, 26, 20, 2);
      P(g, '#b0b0ba', 20, 8, 8, 20); P(g, '#d0d0d8', 20, 8, 3, 20); P(g, '#9a9aa4', 14, 6, 20, 4); P(g, '#c2c2cc', 14, 6, 20, 1);
      P(g, season === 3 ? '#d8eef8' : '#7ab8e8', 16, 7, 16, 2); P(g, '#b0b0ba', 22, 0, 4, 7);
    })),
  });
})();
// Each garden is laid out from a plan: a hedge round the outside with a gate, paths and plazas, water,
// a few set pieces, and flower beds.
Object.assign(OBJDEF, { nvgazebo: { solid: 1, fw: 3, fh: 2, act: 'read' } });
Art.STATIC.nvgazebo = season => Art.outlined(Art.mk(48, 62, g => {
  const { P } = Art;
  P(g, '#c8c0b0', 2, 52, 44, 8); P(g, '#e8e0d0', 2, 52, 44, 2);
  for (const x of [4, 22, 41]) { P(g, '#f4f0e8', x, 22, 4, 31); P(g, '#c8c0b0', x + 3, 22, 1, 31); }
  P(g, '#f4f0e8', 2, 40, 44, 2); for (let x = 6; x < 44; x += 4) P(g, '#e8e0d0', x, 42, 1, 10);
  for (let y = 0; y < 22; y++) { const half = Math.round(4 + y * 1.05); P(g, season === 3 ? '#f0f6fc' : (y % 4 < 2 ? '#c84a4a' : '#a83a3a'), 24 - half, y + 2, half * 2, 1); }
  P(g, '#f4f0e8', 0, 22, 48, 3); P(g, '#c9a040', 22, 0, 4, 3);
  if (season !== 3) for (const [x, y] of [[6, 30], [41, 34], [9, 46], [38, 47]]) { P(g, '#3f7a3a', x, y, 3, 6); P(g, '#e870a8', x, y, 2, 2); P(g, '#d42a40', x + 1, y + 3, 2, 2); }
}));
// Mossbrook Gardens: open lawns and stone plazas to walk and gather in, with the flowers kept to beds and borders.
Object.assign(OBJDEF, { nvpicnic: { flat: 1, fw: 2 } });
Art.STATIC.nvpicnic = () => Art.mk(32, 16, g => {
  const { P } = Art;
  for (let y = 0; y < 4; y++) for (let x = 0; x < 7; x++) P(g, (x + y) % 2 ? '#f4f0e8' : '#c84a4a', 2 + x * 4, 2 + y * 3, 4, 3);
  P(g, '#a03a3a', 2, 14, 28, 1);
  P(g, '#a07a4c', 21, 4, 8, 6); P(g, '#c49a64', 21, 4, 8, 2); P(g, '#7a5535', 23, 1, 4, 1); P(g, '#7a5535', 22, 2, 1, 2); P(g, '#7a5535', 27, 2, 1, 2);
  P(g, '#d8a060', 6, 6, 5, 3); P(g, '#e04050', 13, 7, 2, 2); P(g, '#7ab05a', 15, 6, 2, 2);
});
const GARDENS = [
  { id: 'north', name: 'Mossbrook Gardens: the North Lawn', zone: [85, 5, 24, 18], hedge: [86, 7, 107, 21], ground: T.C,
    paths: [[95, 20, 3, 2], [96, 15, 1, 5], [93, 9, 7, 6], [87, 14, 20, 1], [99, 12, 8, 1]],
    water: [[101, 8, 5, 3]],
    beds: [[87, 8, 6, 1, 'nvb_sun'], [88, 10, 4, 2, 'band'], [88, 17, 4, 2, 'rose'], [101, 17, 4, 2, 'band'], [100, 11, 6, 1, 'nvb_lav'], [93, 19, 2, 1, 'nvb_tulip'], [98, 19, 2, 1, 'nvb_tulip'], [104, 20, 3, 1, 'nvb_daisy']],
    pieces: [['nvgazebo', 95, 11, { text: 'A white gazebo. Two sets of initials are carved into the rail, with a heart. Later, someone crossed one set out.' }],
      ['topiary', 93, 9], ['topiary', 99, 9], ['bench', 88, 13], ['bench', 102, 15], ['bench', 91, 15],
      ['birdbath', 92, 12, { text: 'A stone birdbath, green with moss and very popular with sparrows.' }],
      ['nvpicnic', 88, 20], ['lily', 101, 8], ['lily', 104, 9], ['lily', 102, 10]],
    outside: [['sign', 107, 22, { text: "East: the King's Road. Passage by royal writ only." }], ['lamp', 94, 22], ['lamp', 98, 22], ['sign', 99, 22, { text: 'MOSSBROOK GARDENS. The North Lawn. Open to all, dawn to dusk and after. Please do not pick the flowers.' }]],
    verge: [[86, 22, 22, 1], [86, 5, 22, 2]] },
  { id: 'south', name: 'Mossbrook Gardens: the South Garden', zone: [85, 26, 24, 19], hedge: [86, 27, 107, 43], ground: T.C,
    paths: [[95, 27, 3, 4], [92, 31, 9, 6], [96, 37, 1, 1], [87, 38, 20, 1], [92, 39, 1, 4]],
    water: [[87, 40, 5, 3]],
    beds: [[88, 29, 4, 2, 'band'], [102, 29, 4, 2, 'band'], [100, 40, 6, 3, 'rose'], [93, 42, 6, 1, 'nvb_sun'], [88, 35, 3, 1, 'nvb_pink'], [103, 35, 3, 1, 'nvb_blue']],
    pieces: [['nvfountain', 95, 33, { text: 'The great fountain of Mossbrook Gardens. The water comes from the river, through a pipe Garrick says he could have dug better.' }],
      ['topiary', 92, 31], ['topiary', 100, 31], ['topiary', 92, 36], ['topiary', 100, 36], ['bench', 93, 32], ['bench', 98, 32], ['bench', 89, 37], ['bench', 103, 37],
      ['birdbath', 102, 39, { text: 'A birdbath at the edge of the roses. A wren is shouting at another wren.' }], ['nvpicnic', 103, 33], ['lily', 88, 40], ['lily', 90, 41], ['lily', 87, 42]],
    outside: [['lamp', 94, 26], ['lamp', 98, 26], ['sign', 99, 26, { text: 'MOSSBROOK GARDENS. The South Garden. Fountain in the middle, roses at the back, benches for the tired.' }]],
    verge: [[86, 26, 22, 1], [85, 44, 24, 1]] },
];
const Garden = {
  zones: GARDENS.map(g => g.zone),
  inside(x, y) { return this.zones.some(z => x >= z[0] && y >= z[1] && x < z[0] + z[2] && y < z[1] + z[3]); },
  near(x, y, pad) { return this.zones.some(z => x > z[0] - pad && y > z[1] - pad && x < z[0] + z[2] + pad && y < z[1] + z[3] + pad); },
  fountains: [],
  plant(m, G) {
    const [zx, zy, zw, zh] = G.zone, [hx0, hy0, hx1, hy1] = G.hedge;
    for (let y = zy; y < zy + zh; y++) for (let x = zx; x < zx + zw; x++) { const o = World.at(m, x, y); if (o) World.remove(m, o); m.block.delete(key(x, y)); World.set(m, x, y, T.G); }
    const path = new Set();
    for (const [x, y, w, h] of G.paths) for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { path.add(key(i, j)); World.set(m, i, j, G.ground); }
    for (const [x, y, w, h] of G.water || []) World.rect(m, x, y, w, h, T.W);
    for (let x = hx0; x <= hx1; x++) for (const y of [hy0, hy1]) if (!path.has(key(x, y))) World.add(m, 'hedge', x, y);
    for (let y = hy0 + 1; y < hy1; y++) for (const x of [hx0, hx1]) if (!path.has(key(x, y))) World.add(m, 'hedge', x, y);
    for (const [t, x, y, props] of G.pieces) { const o = World.add(m, t, x, y, props); if (o && t === 'nvfountain') this.fountains.push(o); }
    // Flowers only in their beds; everything else is lawn or stone to walk on.
    const BANDS = ['nvb_tulip', 'nvb_lav', 'nvb_pink', 'nvb_daisy', 'nvb_blue', 'nvb_rose'];
    G.beds.forEach(([x0, y0, w, h, kind], n) => {
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
        if (path.has(key(x, y)) || World.at(m, x, y) || World.g(m, x, y) === T.W) continue;
        const t = kind === 'band' ? BANDS[(n + y - y0) % BANDS.length] : kind === 'rose' ? ((x + y) % 2 ? 'rosebush' : 'nvb_rose') : kind;
        World.add(m, t, x, y);
      }
    });
    for (const [x, y, w, h] of G.verge || []) for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (!World.at(m, i, j) && World.g(m, i, j) === T.G && (i + j) % 2 === 0 && !(i >= 94 && i <= 98)) World.add(m, 'flowerbed', i, j);
    for (const [t, x, y, props] of G.outside) { const o = World.at(m, x, y); if (o) World.remove(m, o); World.add(m, t, x, y, props); }
  },
  build(m) {
    this.fountains = [];
    for (const G of GARDENS) this.plant(m, G);
    m.version = (m.version || 0) + 1;
  },
};
(() => {
  const build = World.build.bind(World);
  World.build = function () { build(); if (this.maps.village) Garden.build(this.maps.village); };
  // More butterflies and bees about the flowers.
  const kinds = Critters.kinds.bind(Critters);
  Critters.kinds = function (m) {
    const out = kinds(m);
    if (m && m.id === 'village' && Player.map === m && Garden.near(Player.x / TILE, Player.y / TILE, 7)) out.forEach(e => { if (e[0] === 'butterfly') e[1] += 10; if (e[0] === 'bee') e[1] += 4; });
    return out;
  };
  // The fountains splash.
  const drawWorld = Story.drawWorld.bind(Story);
  Story.drawWorld = function (g, m, items) {
    drawWorld(g, m, items);
    if (m.id !== 'village' || S.season === 3) return;
    const t = performance.now() / 1000;
    for (const f of Garden.fountains) {
      const cx = (f.x + 1) * TILE + 8, top = f.y * TILE - 22;
      items.push({ y: (f.y + 2) * TILE - 1, draw: () => {
        for (let i = 0; i < 10; i++) {
          const k = (t * 0.9 + i / 10) % 1, side = i % 2 ? 1 : -1, x = cx + side * k * 13, y = top + 4 - Math.sin(k * Math.PI) * 9 + k * 22;
          g.fillStyle = i % 3 ? 'rgba(160,210,250,0.85)' : 'rgba(255,255,255,0.9)'; g.fillRect(Math.round(x), Math.round(y), 1, 2);
        }
        g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(cx - 1, top - 2 + Math.round(Math.sin(t * 6)), 2, 3);
      } });
    }
  };
  // A gardener and a painter are always about; strollers come once the town has filled up.
  const L = (s, hair, style, shirt, pants, more) => Object.assign({ skin: s[0], skinD: s[1], hair: hair[0], hairD: hair[1], style, shirt: shirt[0], shirtD: shirt[1], belt: '#3a2414', pants: pants[0], pantsD: pants[1], shoes: '#2a1a12' }, more || {});
  Object.assign(EXTRAS, {
    nvg_gardener: { map: 'village', name: 'Head Gardener Primrose', look: L(['#c99a72', '#a87c58'], ['#d8d4cc', '#b4b0a8'], 'bun', ['#5a8a4a', '#3a6a2a'], ['#5a4a38', '#44382a'], { hat: 'straw', apron: '#a07a4c' }), at: [90, 14], dir: DIRS.up, prop: 'spade', only: 'day',
      lines: ['Every bed in these gardens, I planted. Every weed, I pulled. Every snail, I had words with.', 'Look, do not pick. The flowers have a long day ahead of them.', 'Tulips in spring, roses in summer, and in winter I sit on that bench and plan.'] },
    nvg_painter: { map: 'village', name: 'Painter Linnet', look: L(['#f0c49a', '#d9a678'], ['#1a1210', '#100a08'], 'long', ['#e8e0d0', '#c4baa6'], ['#3a3a44', '#2a2a32'], { cape: '#3a6ab0' }), at: [100, 12], dir: DIRS.up, prop: 'brush', only: 'day',
      lines: ['I have painted this pond eleven times. It keeps changing its mind.', 'Stand a little to the left. No, you are lovely, you are just in front of the light.', 'The gazebo is white. Except it is also blue, and gold, and a bit pink at four o\'clock.'] },
    nvg_stroll1: { map: 'village', name: 'Gentleman Strolling', look: L(['#e0b088', '#c09068'], ['#5a3a20', '#3a2410'], 'short', ['#3a5a8a', '#2a3a6a'], ['#3a3a44', '#2a2a32']), wander: [87, 28, 106, 42], at: [96, 30], speed: 10, only: 'day', later: true,
      lines: ['We come every Sunday. Today is not Sunday. We came anyway.', 'My wife likes the roses. I like that she likes the roses.'] },
    nvg_stroll2: { map: 'village', name: 'Lady with a Parasol', look: L(['#e0b088', '#c09068'], ['#c87a48', '#a0582c'], 'long', ['#e870a8', '#b84a80'], ['#5a5048', '#40382c'], { dress: '#e870a8', dressD: '#b84a80' }), wander: [87, 28, 106, 42], at: [96, 41], speed: 9, only: 'day', later: true,
      lines: ['My husband pretends he comes for me. He comes for the benches.', 'Smell that. Lavender. My grandmother\'s whole house smelled like this.'] },
    nvg_reader: { map: 'village', name: 'Reader on a Bench', look: L(['#8a5a3a', '#6a4228'], ['#1a1210', '#100a08'], 'short', ['#7a5a8a', '#5a3a6a'], ['#4a4a54', '#3a3a44']), at: [103, 14], dir: DIRS.down, only: 'day', later: true,
      lines: ['Shh. Chapter nine. Everyone is about to find out who did it.', 'Best reading spot in the valley. Do not tell anyone.'] },
  });
})();

// ---- Travellers -------------------------------------------------------------------------------------
// Eight people on the road who stop in Mossbrook now and then: never every day, and only from noon
// until early evening. Each keeps a week of their own, so two or three of them are in town on any day.
const TRAVELLERS = {
  nvt_pedlar: { name: 'Pedlar Ottilie', days: [0, 3, 5], at: [35, 27], dir: DIRS.down, prop: 'crate',
    look: ['#e0b088', '#c09068', '#8a5a3a', '#6a4228', 'bun', '#a05a3a', '#7a3a1a', '#5a4a38', '#44382a', { hat: 'straw' }],
    lines: ['Ribbons, buttons, thimbles, needles! Everything small and useful!', 'I walk the whole valley twice a year. My boots walk it three times.', 'Saltmere wants needles, Ironback wants buttons, and Mossbrook wants gossip. I carry all three.'] },
  nvt_minstrel: { name: 'Minstrel Fenwick', days: [1, 4, 6], at: [37, 21], dir: DIRS.down, prop: 'fiddle', music: '#ffd070', sound: 'fiddle',
    look: ['#f0c49a', '#d9a678', '#c87a48', '#a0582c', 'long', '#3a6ab0', '#2a4a80', '#3a3a44', '#2a2a32', { cape: '#a03a3a' }],
    lines: ['A song for a copper, two songs for a smile.', 'I played for the Pit crowd once. They threw things. Not coppers.', 'Every town has a tune. Mossbrook\'s goes up at the end, like a question.'] },
  nvt_pilgrim: { name: 'Pilgrim Hesketh', days: [2, 5], route: [[47, 19], [50, 17], [53, 16]], stop: 6, speed: 12,
    look: ['#c99a72', '#a87c58', '#d8d4cc', '#b4b0a8', 'bald', '#8a7a5a', '#6a5a3a', '#6a5a48', '#4a3a2a', { beard: '#d8d4cc', cape: '#6a5a3a' }],
    lines: ['I visit every shrine in the kingdom, one each season. My knees visit them with me, complaining.', 'Peace on your fields, young farmer.', 'The road is long, but it is mostly downhill on the way home.'] },
  nvt_mapmaker: { name: 'Mapmaker Quarrie', days: [0, 4], at: [47, 17], dir: DIRS.left, prop: 'brush',
    look: ['#f0c49a', '#d9a678', '#3a2a1a', '#2a1a10', 'short', '#5a7a5a', '#3a5a3a', '#4a4a54', '#3a3a44', { hat: 'cap', hatC: '#7a5a3a', hatD: '#5a3a1a' }],
    lines: ['Your town is bigger than it is on my map. I keep having to add bits.', 'Hold still. No, not you. The river.', 'A good map has one blank corner, to keep you humble.'] },
  nvt_grinder: { name: 'Grinder Dunstan', days: [1, 3, 6], at: [23, 40], dir: DIRS.left, prop: 'hammer',
    look: ['#8a5a3a', '#6a4228', '#1a1210', '#100a08', 'short', '#6a6a72', '#4a4a52', '#3a3a44', '#2a2a32', { beard: '#1a1210', apron: '#5a4a38' }],
    lines: ['Knives, scissors, scythes! I put the edge back on anything.', 'Your smith does fine work. I only come for the blades he is too busy for.', 'Sparks never hurt anyone who kept their eyebrows back.'] },
  nvt_storyteller: { name: 'Old Mab the Storyteller', days: [2, 6], at: [9, 28], dir: DIRS.down,
    look: ['#e0b088', '#c09068', '#e8e8e8', '#c8c8c8', 'long', '#5a3a6a', '#3a2a4a', '#3a3a44', '#2a2a32', { dress: '#5a3a6a', dressD: '#3a2a4a' }],
    lines: ['Sit, sit. Have you heard the one about the goose who wanted to be a swan? It ends badly. For the swan.', 'I have a story for every town. Some of them are even true.', 'Every village thinks its own river is the oldest. Every village is wrong, except one.'] },
  nvt_merchant: { name: 'Merchant Idris', days: [0, 2, 4], at: [14, 22], dir: DIRS.down, prop: 'crate',
    look: ['#8a5a3a', '#6a4228', '#1a1210', '#100a08', 'short', '#c8902a', '#a0701a', '#5a4a38', '#44382a', { beard: '#1a1210', hat: 'cap', hatC: '#a03a3a', hatD: '#7a2a2a' }],
    lines: ['Spices from the far coast! Well. From Saltmere. They came from the far coast first.', 'My cart is outside town. My cart is always outside town. Towns charge for carts.', 'I buy cheap in Ironback and sell dear in the capital. Mossbrook I just like.'] },
  nvt_birder: { name: 'Birdwatcher Sedge', days: [1, 3, 5], at: [38, 7], dir: DIRS.up,
    look: ['#f0c49a', '#d9a678', '#c8a048', '#a07a30', 'messy', '#7a8a5a', '#5a6a3a', '#5a5048', '#40382c', { hat: 'straw' }],
    lines: ['Shh. A kingfisher. There. No, gone.', 'Forty-one kinds of bird on this river. I have seen thirty-nine. The other two are teasing me.', 'The gulls come up from Saltmere when a storm is on the way. Watch the gulls.'] },
};
(() => {
  const visiting = id => !!S && S.time >= 720 && S.time < 1080 && TRAVELLERS[id].days.includes(absDay() % 7);
  for (const id in TRAVELLERS) {
    const t = TRAVELLERS[id], L = t.look;
    const look = Object.assign({ skin: L[0], skinD: L[1], hair: L[2], hairD: L[3], style: L[4], shirt: L[5], shirtD: L[6], belt: '#3a2414', pants: L[7], pantsD: L[8], shoes: '#2a1a12' }, L[9] || {});
    EXTRAS[id] = Object.assign({ map: 'village', name: t.name, look, when: () => visiting(id), lines: t.lines }, t.at ? { at: t.at, dir: t.dir } : { route: t.route, stop: t.stop, speed: t.speed }, t.prop ? { prop: t.prop } : {}, t.music ? { music: t.music, sound: t.sound } : {});
  }
})();

// ---- People enjoying the Gardens -----------------------------------------------------------------------
// Picnics on the lawn, friends chatting round the fountain, children running about. They come once the
// town has filled up; before that the gardener and the painter mostly have the place to themselves.
(() => {
  const L = (s, hair, style, shirt, pants, more) => Object.assign({ skin: s[0], skinD: s[1], hair: hair[0], hairD: hair[1], style, shirt: shirt[0], shirtD: shirt[1], belt: '#3a2414', pants: pants[0], pantsD: pants[1], shoes: '#2a1a12' }, more || {});
  Object.assign(EXTRAS, {
    nvg_picnic1: { map: 'village', name: 'Picnicker', look: L(['#f0c49a', '#d9a678'], ['#c87a48', '#a0582c'], 'long', ['#f0d040', '#c8a820'], ['#5a5048', '#40382c'], { dress: '#f0d040', dressD: '#c8a820', hat: 'straw' }), at: [88, 20], dir: DIRS.right, only: 'day', later: true,
      lines: ['Elderflower cordial? There is plenty. Gerald brought three jugs and one sandwich.', 'Best spot in the gardens. We were here at dawn to claim it.'] },
    nvg_picnic2: { map: 'village', name: 'Picnicker', look: L(['#c99a72', '#a87c58'], ['#3a2a1a', '#2a1a10'], 'short', ['#5a7a9a', '#3a5a7a'], ['#4a4a54', '#3a3a44']), at: [89, 20], dir: DIRS.left, only: 'day', later: true,
      lines: ['I am Gerald. I brought the cordial. Someone else was meant to bring the food.', 'Sit down, there is room. There is always room on a blanket.'] },
    nvg_picnic3: { map: 'village', name: 'Grandmother on a Picnic', look: L(['#e0b088', '#c09068'], ['#e8e8e8', '#c8c8c8'], 'bun', ['#7a5a8a', '#5a3a6a'], ['#3a3a44', '#2a2a32'], { dress: '#7a5a8a', dressD: '#5a3a6a' }), at: [103, 33], dir: DIRS.right, only: 'day', later: true,
      lines: ['Have a scone. You look like you need a scone.', 'When I was a girl, all this was forest. Now look at it.'] },
    nvg_picnic4: { map: 'village', name: 'Grandson', look: L(['#e0b088', '#c09068'], ['#e8d8a8', '#c8b888'], 'messy', ['#e04050', '#a02a38'], ['#3a7ac0', '#2a5a90']), at: [104, 33], dir: DIRS.left, only: 'day', later: true,
      lines: ['Gran says I can have another scone if I sit still. I am sitting SO still.', 'I saw a frog in the pond. It saw me too.'] },
    nvg_chat1: { map: 'village', name: 'Garden Visitor', look: L(['#8a5a3a', '#6a4228'], ['#1a1210', '#100a08'], 'bun', ['#3a8a7a', '#2a6a5a'], ['#4a4a54', '#3a3a44'], { dress: '#3a8a7a', dressD: '#2a6a5a' }), wander: [93, 31, 100, 36], at: [94, 34], speed: 9, only: 'day', later: true,
      lines: ['I meet my sister here every week. We never run out of things to say. Mostly about our other sister.', 'They say you can make a wish in the fountain. I wished for less rain. It rained.'] },
    nvg_chat2: { map: 'village', name: 'Garden Visitor', look: L(['#f0c49a', '#d9a678'], ['#e8d8a8', '#c8b888'], 'bun', ['#e8a050', '#b87030'], ['#5a5048', '#40382c'], { dress: '#e8a050', dressD: '#b87030' }), wander: [93, 31, 100, 36], at: [99, 35], speed: 9, only: 'day', later: true,
      lines: ['Have you seen the roses at the back? Go. Go now. I will wait.', 'My sister thinks the lavender is too strong. My sister is wrong.'] },
    nvg_kid1: { map: 'village', name: 'Child at Play', look: L(['#c99a72', '#a87c58'], ['#5a3a20', '#3a2410'], 'short', ['#7ab05a', '#5a903a'], ['#5a4a38', '#44382a']), wander: [87, 13, 106, 16], at: [92, 14], speed: 24, only: 'day', later: true,
      lines: ['You can\'t catch me!', 'I found a ladybird! It had seven spots! I counted twice!'] },
    nvg_kid2: { map: 'village', name: 'Child at Play', look: L(['#f0c49a', '#d9a678'], ['#c87a48', '#a0582c'], 'long', ['#e870a8', '#b84a80'], ['#3a3a44', '#2a2a32']), wander: [87, 13, 106, 16], at: [100, 14], speed: 24, only: 'day', later: true,
      lines: ['Tag! You\'re it!', 'The gardener says no running on the flowers. The lawn is not the flowers.'] },
  });
})();
