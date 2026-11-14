'use strict';
// Stage 5 places: the Evergreen Court, the throne room, the undercroft, and
// Lower Mossbrook, which only exists once the river gives it back.

Object.assign(OBJDEF, {
  throne: { solid: 1, fw: 3 },
  banner: { flat: 1 },
  pillar: { solid: 1, act: 'read' },
  root: { solid: 1 },
  rootglow: { flat: 1, light: 1 },
  heart: { solid: 1, fw: 4, fh: 2, act: 'heart', light: 1 },
  remains: { solid: 1, act: 'remains' },
  rootsleeper: { solid: 1, act: 'rootsleeper' },
  ruinwall: { solid: 1 },
  memorial: { solid: 1, act: 'memorial' },
  bellframe: { solid: 1, fw: 2, act: 'read' },
  reedchest: { solid: 1, act: 'reedchest' },
  fountain: { solid: 1, fw: 2, fh: 2, act: 'read' },
});
OBJDEF.mailbox.act = 'mail';

(() => {
  const { mk, P, outlined, blob, STATIC, house_defs } = Art;
  STATIC.throne = () => outlined(mk(48, 44, g => {
    P(g, '#2f6b45', 8, 0, 32, 30); P(g, '#3f8a5a', 10, 2, 28, 4); P(g, '#e0b85a', 8, 0, 32, 2); P(g, '#e0b85a', 22, 0, 4, 6);
    P(g, '#e0b85a', 2, 20, 44, 6); P(g, '#7a2f30', 10, 24, 28, 10); P(g, '#c9a06a', 4, 26, 6, 18); P(g, '#c9a06a', 38, 26, 6, 18); P(g, '#a08038', 2, 40, 44, 4);
    for (let i = 0; i < 5; i++) P(g, '#4f9642', 12 + i * 5, 6 + (i % 2) * 3, 3, 10);
  }));
  STATIC.banner = () => mk(16, 16, g => { P(g, '#2f6b45', 3, 0, 10, 15); P(g, '#e0b85a', 6, 4, 4, 4); P(g, '#2f6b45', 3, 15, 3, 1); P(g, '#2f6b45', 10, 15, 3, 1); });
  STATIC.pillar = () => outlined(mk(16, 40, g => {
    P(g, '#d4cbb8', 3, 4, 10, 34); P(g, '#ece4d2', 4, 4, 3, 34); P(g, '#a89f8c', 1, 0, 14, 5); P(g, '#a89f8c', 1, 36, 14, 4);
    for (let y = 8; y < 34; y += 3) P(g, '#a89f8c', 8, y, 3, 1);
  }));
  STATIC.root = () => outlined(mk(20, 20, g => {
    const c = ['#3a2a1e', '#4e3a28', '#634a32'];
    for (let i = 0; i < 18; i++) P(g, c[i % 3], 1 + i, 9 + Math.round(Math.sin(i / 3) * 4), 3, 4);
    for (let i = 0; i < 10; i++) P(g, c[(i + 1) % 3], 8 + Math.round(Math.sin(i / 2) * 2), 2 + i, 3, 3);
    P(g, '#7ad07a', 6, 8, 1, 1); P(g, '#7ad07a', 13, 12, 1, 1);
  }));
  STATIC.rootglow = () => mk(16, 16, g => { P(g, '#4e3a28', 2, 9, 12, 3); P(g, '#7ad07a', 6, 6, 4, 4); P(g, '#c8f0a0', 7, 7, 2, 2); });
  STATIC.heart = () => outlined(mk(64, 52, g => {
    const r = mulberry(76);
    for (let i = 0; i < 9; i++) { const x = 4 + i * 7; P(g, '#4e3a28', x, 30 + (i % 3) * 3, 4, 22 - (i % 3) * 3); }
    blob(g, 32, 24, 18, ['#2a3a24', '#3f6a34', '#5a9a44', '#8ad060'], r);
    blob(g, 32, 24, 9, ['#4a7a3a', '#7ab84d', '#a8e070', '#e0ffb0'], r);
    for (let i = 0; i < 14; i++) P(g, '#c8f0a0', 18 + Math.floor(r() * 28), 10 + Math.floor(r() * 28), 1, 2);
  }));
  STATIC.remains = () => outlined(mk(20, 18, g => {
    P(g, '#4e3a28', 0, 10, 20, 6); P(g, '#5e4a38', 2, 8, 16, 3);
    P(g, '#d8d0c0', 5, 4, 6, 6); P(g, '#2a2420', 6, 6, 1, 1); P(g, '#2a2420', 9, 6, 1, 1); P(g, '#7a6a55', 10, 9, 8, 4); P(g, '#e8c766', 2, 2, 10, 2);
  }));
  STATIC.rootsleeper = () => outlined(mk(20, 24, g => {
    P(g, '#dcae88', 7, 3, 7, 7); P(g, '#d8d4cc', 7, 2, 7, 3); P(g, '#8a7a5a', 5, 10, 11, 12);
    for (let i = 0; i < 6; i++) P(g, '#4e3a28', 2 + i * 3, 8 + (i % 2) * 6, 4, 2);
    P(g, '#4e3a28', 3, 20, 15, 4); P(g, '#7ad07a', 10, 14, 1, 1);
  }));
  STATIC.ruinwall = s => outlined(mk(16, 22, g => {
    P(g, '#7a7468', 1, 6, 14, 16); P(g, '#948e80', 1, 6, 14, 2); P(g, '#5e584c', 1, 12, 14, 1); P(g, '#5e584c', 1, 17, 14, 1); P(g, '#5e584c', 7, 6, 1, 6);
    P(g, '#4f7a3a', 2, 4, 5, 3); P(g, '#5e8a45', 10, 5, 4, 2);
  }));
  STATIC.memorial = s => outlined(mk(28, 44, g => {
    P(g, '#8d8d94', 4, 6, 20, 37); P(g, '#a4a4ab', 5, 6, 4, 36); P(g, '#8d8d94', 7, 2, 14, 4);
    for (let y = 10; y < 40; y += 3) P(g, '#4a4a52', 9, y, 10 + (y * 5) % 4, 1);
    P(g, '#e8688a', 2, 40, 3, 3); P(g, '#f7e26b', 23, 41, 3, 2); P(g, '#8fa8f0', 6, 42, 2, 2);
  }));
  STATIC.bellframe = () => outlined(mk(32, 40, g => {
    P(g, '#5f4128', 3, 6, 4, 34); P(g, '#5f4128', 25, 6, 4, 34); P(g, '#5f4128', 1, 4, 30, 4);
    P(g, '#a07a4c', 12, 10, 8, 2); P(g, '#c9a06a', 10, 12, 12, 12); P(g, '#a08038', 9, 22, 14, 3); P(g, '#e0b85a', 12, 13, 3, 8);
  }));
  STATIC.reedchest = () => STATIC.chest();
  STATIC.fountain = () => outlined(mk(32, 34, g => {
    P(g, '#a4a4ab', 1, 20, 30, 12); P(g, '#c2c2c8', 1, 20, 30, 2); P(g, '#3d86c6', 4, 22, 24, 6); P(g, '#7dbbe6', 6, 23, 8, 1);
    P(g, '#a4a4ab', 13, 4, 6, 18); P(g, '#c2c2c8', 10, 2, 12, 4); P(g, '#7dbbe6', 15, 0, 2, 4);
  }));
  Object.assign(house_defs, {
    palace: { tw: 12, wallH: 64, roofH: 40, slope: 16, stone: true, wall: ['#e0d8c8', '#f0e8d8', '#b8b0a0'], roof: ['#2f6b45', '#3f8a5a', '#22502f'], doorCol: 5, door: '#2f6b45', windows: [1, 3, 8, 10], deco(g, x0, wy) {
      P(g, '#e0b85a', x0 + 88, 4, 16, 14); P(g, '#e0b85a', x0 + 90, 0, 3, 5); P(g, '#e0b85a', x0 + 99, 0, 3, 5); P(g, '#e0b85a', x0 + 94, 0, 4, 6);
      P(g, '#2f6b45', x0 + 64, wy + 4, 10, 30); P(g, '#2f6b45', x0 + 118, wy + 4, 10, 30); P(g, '#e0b85a', x0 + 67, wy + 12, 4, 4); P(g, '#e0b85a', x0 + 121, wy + 12, 4, 4);
    } },
    crypt: { tw: 4, wallH: 34, roofH: 22, slope: 8, stone: true, wall: ['#6c7a6c', '#849484', '#4e5a4e'], roof: ['#2f4a34', '#3f5e44', '#203424'], doorCol: 1, door: '#2a3a2a' },
  });
  // The Kept, each in their own colour.
  Art.kept = (id, f) => Art.memo('kept' + id + f, () => outlined(mk(14, 18, g => {
    const [a, b, c] = SPROUTS[id].color, y = f ? -1 : 0;
    P(g, a, 3, 8 + y, 8, 8); P(g, b, 4, 8 + y, 3, 4); P(g, c, 3, 15 + y, 8, 1);
    P(g, '#2a3a2e', 5, 11 + y); P(g, '#2a3a2e', 9, 11 + y);
    P(g, '#74b84d', 6, 4 + y, 2, 4); P(g, '#8fd05c', 8, 2 + y, 4, 3); P(g, '#8fd05c', 2, 3 + y, 4, 3);
  })));
})();

Object.assign(World, {
  buildStage5() {
    this.buildCapital(); this.buildThrone(); this.buildUndercroft(); this.buildLower();
    const v = this.maps.village;
    [23, 24, 25].forEach((y, i) => v.warps.push({ x: v.w - 1, y, to: 'capital', tx: 1, ty: 20 + i, dir: DIRS.right }));
  },

  buildCapital() {
    const m = this.newMap('capital', 'The Evergreen Court', 64, 44, T.G, { region: true });
    const r = mulberry(8128);
    this.rect(m, 0, 20, 26, 3, T.D);
    this.rect(m, 24, 12, 18, 20, T.C);
    this.rect(m, 31, 9, 3, 3, T.C);
    this.rect(m, 42, 20, 10, 3, T.D);
    this.rect(m, 50, 18, 3, 2, T.D);
    this.border(m, r, 3, (x, y) => x < 3 && y >= 20 && y <= 22);
    this.addBuilding(m, 'palace', 27, 5, 12, 4, { door: { x: 32, y: 8 } });
    this.addBuilding(m, 'crypt', 50, 16, 4, 2, { door: { x: 51, y: 17 } });
    this.addBuilding(m, 'cottageA', 8, 9, 5, 3, { msg: 'A courtier\'s townhouse. The shutters are painted green, like every other shutter in the city.' });
    this.addBuilding(m, 'cottageB', 8, 29, 5, 3, { msg: 'A townhouse. Through the window, a family is eating. Their bread is very white.' });
    this.addBuilding(m, 'store', 14, 34, 8, 3, { msg: 'A royal granary. It is full to the rafters, and guarded.' });
    this.add(m, 'fountain', 32, 20, { text: 'A fountain of the King. Water runs from his open hands. The water is very slightly green.' });
    this.add(m, 'statue', 28, 15, { text: 'King Oswin, Year 128. His face exactly matches the statue beside it, which says Year 1.' });
    this.add(m, 'statue', 37, 15, { text: 'King Oswin, Year 1.' });
    this.add(m, 'stall', 25, 27); this.add(m, 'stall', 37, 27);
    this.add(m, 'sign', 4, 18, { text: 'The Evergreen Court. No famine in fifty-two years, by the King\'s grace.' });
    this.add(m, 'sign', 47, 19, { text: 'The Royal Garden. By appointment only.' });
    [[26, 13], [40, 13], [26, 30], [40, 30], [30, 10], [35, 10]].forEach(([x, y]) => this.add(m, 'lamp', x, y));
    for (let x = 45; x <= 58; x += 2) { this.add(m, 'bush', x, 9); this.add(m, 'bush', x, 33); }
    for (let i = 0; i < 14; i++) { const x = 45 + Math.floor(r() * 14), y = 11 + Math.floor(r() * 20); if (!this.solid(m, x, y) && this.g(m, x, y) === T.G && !(y >= 15 && y <= 23 && x >= 47)) this.add(m, 'btree', x, y, { kind: 'pine', v: Math.floor(r() * 4) }); }
    m.warps.push(...[20, 21, 22].map((y, i) => ({ x: 0, y, to: 'village', tx: this.maps.village.w - 2, ty: 23 + i, dir: DIRS.left })));
    m.warps.push({ x: 32, y: 8, to: 'throne', tx: 10, ty: 12, dir: DIRS.up, door: true });
    m.warps.push({ x: 51, y: 17, to: 'undercroft', tx: 20, ty: 31, dir: DIRS.up, door: true, needs: 'undercroft_key', closedMsg: 'A heavy door, carved with roots. It is locked.' });
  },

  buildThrone() {
    const m = this.room('throne', 'The Throne Room', 20, 14, T.ST, ['#e0d8c8', '#c8c0b0', '#a8a090']);
    this.rect(m, 9, 4, 3, 9, T.R);
    this.add(m, 'throne', 9, 2);
    [[4, 4], [4, 8], [15, 4], [15, 8]].forEach(([x, y]) => this.add(m, 'pillar', x, y, { text: 'A marble pillar. The names of every province are carved on it, and every province has given its Tithe.' }));
    [[3, 1], [7, 1], [12, 1], [16, 1]].forEach(([x, y]) => this.add(m, 'banner', x, y));
    m.warps.push({ x: 10, y: 13, to: 'capital', tx: 32, ty: 9, dir: DIRS.down });
  },

  buildUndercroft() {
    const m = this.newMap('undercroft', 'The Undercroft', 40, 34, T.ROCK, { indoor: true, dark: true, region: true });
    const r = mulberry(1076);
    const carve = (x, y, w, h) => this.rect(m, x, y, w, h, T.CAVE);
    carve(14, 22, 13, 9); carve(19, 31, 3, 3); carve(19, 14, 3, 8); carve(9, 3, 23, 11);
    carve(3, 16, 8, 9); carve(11, 22, 3, 3); carve(30, 16, 7, 9); carve(27, 22, 3, 3);
    this.add(m, 'heart', 18, 4);
    this.add(m, 'remains', 5, 18);
    this.add(m, 'rootsleeper', 33, 18, { who: 'bram' });
    this.add(m, 'rootsleeper', 32, 22, { who: 'dell' });
    const names = ['Hanne Moss', 'Tobias Reed', 'Eda Tallow', 'Brother Aldo', 'Corin Tolley', 'Wil Fenn', 'Agnes Fenn', 'Piet Marr', 'Lotte Marr'];
    [[19, 16], [21, 18], [19, 20], [21, 15]].forEach(([x, y], i) => this.add(m, 'pillar', x, y, { text: `A root as thick as a pillar. Names are scratched into it, hundreds of them, in many hands. One near the bottom reads "${names[i]}". One near the top was cut this year.` }));
    for (let i = 0; i < 40; i++) { const x = 3 + Math.floor(r() * 34), y = 3 + Math.floor(r() * 28); if (this.g(m, x, y) === T.CAVE && !this.at(m, x, y) && Math.abs(x - 20) > 1 && r() < 0.5) this.add(m, 'root', x, y); }
    [[12, 6], [28, 6], [16, 24], [24, 24], [6, 20], [34, 20], [20, 12]].forEach(([x, y]) => { const o = this.at(m, x, y); if (o) this.remove(m, o); this.add(m, 'rootglow', x, y); });
    // Keep the main path and the doorways into the side chambers clear.
    const clear = (x0, y0, w, h) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { const o = this.at(m, x, y); if (o && o.type === 'root') this.remove(m, o); } };
    clear(19, 12, 3, 22); clear(10, 21, 5, 5); clear(26, 21, 5, 5); clear(4, 17, 3, 3); clear(31, 17, 4, 7);
    m.spawns = [{ t: 'rootling', x: 20, y: 26, n: 3, r: 4 }, { t: 'rootling', x: 6, y: 20, n: 2, r: 2 }, { t: 'rootling', x: 33, y: 20, n: 2, r: 2 }, { t: 'rootling', x: 14, y: 9, n: 2, r: 3, if: () => !S.ending }];
    m.warps.push({ x: 20, y: 33, to: 'capital', tx: 51, ty: 18, dir: DIRS.down });
  },

  // The streets the river kept for fifty-two years.
  buildLower() {
    const m = this.newMap('lower', 'Lower Mossbrook', 48, 36, T.D, { region: true });
    const r = mulberry(76);
    this.rect(m, 0, 0, 48, 3, T.W);
    for (let i = 0; i < 9; i++) { const cx = 4 + Math.floor(r() * 40), cy = 6 + Math.floor(r() * 24); for (let y = -2; y <= 2; y++) for (let x = -3; x <= 3; x++) if ((x * x) / 9 + (y * y) / 4 < 1) this.set(m, cx + x, cy + y, T.W); }
    this.rect(m, 22, 3, 5, 33, T.S); this.rect(m, 4, 17, 40, 3, T.S);
    for (let y = 0; y < 36; y++) for (let x = 0; x < 48; x++) if (x < 2 || x >= 46) m.block.add(key(x, y));
    const house = (x, y) => { for (let i = 0; i < 6; i++) { if (i !== 2) this.add(m, 'ruinwall', x + i, y); this.add(m, 'ruinwall', x + i, y + 4); } for (let j = 1; j < 4; j++) { this.add(m, 'ruinwall', x, y + j); this.add(m, 'ruinwall', x + 5, y + j); } };
    [[5, 5], [13, 5], [30, 5], [37, 6], [5, 23], [13, 24], [30, 24], [37, 23]].forEach(([x, y]) => { for (let j = 0; j < 5; j++) for (let i = 0; i < 6; i++) this.set(m, x + i, y + j, T.D); house(x, y); });
    this.add(m, 'reedchest', 15, 7);
    this.add(m, 'memorial', 24, 13);
    this.add(m, 'bellframe', 32, 26, { text: 'The bell of Lower Mossbrook, still hanging. When the wind comes off the river it rings once, softly, and stops.' });
    this.add(m, 'sign', 12, 11, { text: 'REED LANE. The sign has been underwater for fifty-two years. You can still read it.' });
    m.warps.push(...[23, 24, 25].map((x, i) => ({ x, y: 35, to: 'village', tx: 31 + i, ty: 3, dir: DIRS.down })));
  },
});
