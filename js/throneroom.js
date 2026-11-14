'use strict';
// The Throne Room, rebuilt to match the castle around it: bigger (30 by 20), with a marble floor,
// a raised dais under a royal crest, a grander throne, gilded parade armour, golden lions, chests of
// tribute, braziers, stained glass, banners, and two portraits of the King a hundred years apart.
// The King still stands before his throne, the door still leads back into the castle, and his guards
// leave with everyone else if the Crown falls.

Object.assign(OBJDEF, {
  tr_throne: { solid: 1, fw: 3 }, tr_armor: { solid: 1, act: 'read' }, tr_lion: { solid: 1, act: 'read' }, tr_hoard: { solid: 1, fw: 2, act: 'read' },
  tr_brazier: { solid: 1, light: 1, lightY: -4 }, tr_urn: { solid: 1 },
  tr_portrait: { flat: 1, fw: 2, fh: 2, act: 'trportrait' }, tr_portrait2: { flat: 1, fw: 2, fh: 2, act: 'trportrait' }, tr_crest: { flat: 1, fw: 3, fh: 2 }, tr_window: { flat: 1, fw: 2, fh: 2 },
});
Object.assign(ACT_LABEL, { trportrait: 'Look at the portrait' });

(() => {
  const { mk, P, outlined, STATIC } = Art;
  const GOLD = '#e8c040', GOLDL = '#f7e08a', GOLDD = '#a07a28';
  // A grander throne: a tall green-and-gold back with the evergreen tree, lions' paw feet.
  STATIC.tr_throne = () => outlined(mk(52, 60, g => {
    P(g, GOLDD, 6, 0, 40, 46); P(g, GOLD, 7, 1, 38, 44);
    P(g, '#2f6b45', 11, 6, 30, 36); P(g, '#3f8a5a', 12, 7, 6, 34);
    P(g, GOLD, 22, -1, 8, 4); P(g, GOLDL, 25, -1, 2, 2); [[8, 2], [40, 2]].forEach(([x, y]) => { P(g, GOLD, x, y, 4, 6); P(g, '#c43050', x + 1, y + 2, 2, 2); });
    // The evergreen tree, in gold thread.
    for (let i = 0; i < 4; i++) P(g, GOLD, 26 - (i + 1) * 3, 12 + i * 6, (i + 1) * 6, 3); P(g, GOLDD, 25, 36, 2, 5);
    P(g, '#7a2f30', 9, 40, 34, 8); P(g, '#9a3a3a', 9, 40, 34, 2);
    P(g, GOLD, 2, 34, 8, 20); P(g, GOLD, 42, 34, 8, 20); P(g, GOLDL, 3, 34, 2, 18); P(g, GOLDL, 43, 34, 2, 18);
    P(g, GOLDD, 2, 52, 48, 4); P(g, GOLD, 4, 56, 6, 4); P(g, GOLD, 42, 56, 6, 4); P(g, GOLDL, 4, 46, 44, 2);
  }));
  // Gilded parade armour on a stand, with a halberd.
  STATIC.tr_armor = () => outlined(mk(22, 40, g => {
    P(g, '#6f4c30', 5, 36, 12, 4); P(g, '#8a6239', 5, 36, 12, 1);
    P(g, '#a0a8b8', 8, 30, 3, 6); P(g, '#a0a8b8', 12, 30, 3, 6); P(g, GOLD, 8, 30, 7, 1);
    P(g, '#b8c0d0', 7, 15, 9, 15); P(g, '#e8eef8', 8, 16, 2, 10); P(g, GOLD, 7, 15, 9, 2); P(g, GOLD, 11, 17, 1, 11); P(g, '#c43050', 10, 19, 3, 3);
    P(g, '#9aa2b2', 4, 15, 4, 5); P(g, '#9aa2b2', 15, 15, 4, 5); P(g, GOLD, 4, 15, 4, 1); P(g, GOLD, 15, 15, 4, 1);
    P(g, '#9aa2b2', 4, 20, 3, 9); P(g, '#9aa2b2', 16, 20, 3, 9);
    P(g, '#b8c0d0', 8, 5, 7, 9); P(g, '#e8eef8', 9, 6, 2, 6); P(g, '#2a2a32', 9, 9, 5, 1); P(g, GOLD, 8, 5, 7, 1); P(g, '#2f6b45', 10, 1, 3, 5); P(g, '#3f8a5a', 11, 0, 2, 3);
    P(g, '#7a5535', 19, 2, 1, 36); P(g, '#c8ccd4', 17, 0, 5, 7); P(g, '#ffffff', 18, 1, 1, 5); P(g, GOLD, 18, 7, 3, 1);
  }));
  STATIC.tr_lion = () => outlined(mk(22, 28, g => {
    P(g, '#d8d0c0', 2, 22, 18, 6); P(g, '#b8b0a0', 2, 26, 18, 2);
    P(g, GOLD, 5, 12, 12, 10); P(g, GOLDL, 6, 12, 3, 8); P(g, GOLD, 3, 18, 4, 4); P(g, GOLD, 15, 18, 4, 4);
    P(g, GOLDD, 5, 2, 12, 12); P(g, GOLD, 7, 4, 8, 9); P(g, GOLDL, 8, 5, 2, 3); P(g, '#2a1a10', 8, 7, 1, 1); P(g, '#2a1a10', 13, 7, 1, 1); P(g, GOLDD, 10, 10, 2, 1);
    P(g, GOLD, 17, 10, 3, 2); P(g, GOLD, 19, 8, 2, 3);
  }));
  STATIC.tr_hoard = () => outlined(mk(34, 22, g => {
    P(g, GOLD, 0, 14, 34, 8); P(g, GOLDD, 0, 20, 34, 2); for (let i = 1; i < 33; i += 3) P(g, GOLDL, i, 14 + (i % 2), 2, 1);
    P(g, '#5a2a1a', 7, 6, 20, 10); P(g, '#7a3a24', 7, 6, 20, 2); P(g, GOLD, 7, 10, 20, 1); P(g, GOLD, 15, 8, 4, 5);
    P(g, '#5a2a1a', 7, 0, 20, 6); P(g, '#3a1a0a', 8, 1, 18, 4); P(g, GOLD, 9, 4, 16, 3); P(g, '#c43050', 12, 4, 2, 2); P(g, '#3a8ad0', 18, 5, 2, 2); P(g, '#3ab04a', 21, 4, 2, 2);
    P(g, GOLD, 28, 8, 4, 7); P(g, GOLDL, 29, 8, 1, 4); P(g, GOLD, 27, 7, 6, 1); P(g, GOLD, 1, 9, 5, 3); P(g, '#c43050', 2, 8, 3, 1); P(g, '#ffffff', 31, 15, 1, 1);
  }));
  STATIC.tr_brazier = () => outlined(mk(16, 26, g => {
    P(g, GOLDD, 3, 20, 2, 6); P(g, GOLDD, 11, 20, 2, 6); P(g, GOLD, 7, 14, 2, 10);
    P(g, GOLD, 1, 10, 14, 5); P(g, GOLDL, 2, 10, 12, 1); P(g, GOLDD, 3, 14, 10, 1);
    P(g, '#e0602c', 3, 4, 10, 6); P(g, '#f4a23a', 5, 3, 6, 6); P(g, '#fbe08a', 7, 5, 2, 4); P(g, '#e0602c', 6, 0, 2, 4); P(g, '#f4a23a', 9, 1, 2, 3);
  }));
  STATIC.tr_urn = () => outlined(mk(18, 32, g => {
    P(g, GOLD, 4, 20, 10, 10); P(g, GOLDL, 5, 21, 2, 7); P(g, GOLDD, 4, 29, 10, 2); P(g, GOLD, 3, 18, 12, 3); P(g, GOLDD, 6, 30, 6, 2);
    for (let i = 0; i < 5; i++) { const x = 3 + i * 3; P(g, '#3a8a3a', x, 6 + (i % 2) * 3, 2, 13 - (i % 2) * 3); P(g, '#5aaa4a', x, 6 + (i % 2) * 3, 1, 6); }
  }));
  // The King, painted a hundred years apart.
  const portrait = (bg, plaque) => mk(32, 32, g => {
    P(g, GOLDD, 0, 0, 32, 32); P(g, GOLD, 1, 1, 30, 30); P(g, GOLDL, 1, 1, 30, 1); P(g, bg, 4, 4, 24, 22);
    P(g, '#2f6b45', 9, 17, 14, 9); P(g, '#3f8a5a', 10, 18, 3, 8); P(g, GOLD, 15, 18, 2, 8);
    P(g, '#e8c8a0', 12, 8, 8, 9); P(g, '#c8a880', 12, 16, 8, 1); P(g, '#2a1a10', 14, 11, 1, 1); P(g, '#2a1a10', 17, 11, 1, 1); P(g, '#a07a60', 15, 14, 2, 1);
    P(g, '#d8d4cc', 11, 8, 1, 6); P(g, '#d8d4cc', 20, 8, 1, 6);
    P(g, GOLD, 12, 5, 8, 3); P(g, GOLD, 12, 4, 1, 1); P(g, GOLD, 15, 3, 2, 2); P(g, GOLD, 19, 4, 1, 1); P(g, '#c43050', 15, 6, 2, 1);
    P(g, plaque, 10, 27, 12, 3);
  });
  STATIC.tr_portrait = () => portrait('#4a3a5a', '#c9a040');
  STATIC.tr_portrait2 = () => portrait('#5a2a2a', '#c9a040');
  STATIC.tr_crest = () => mk(48, 32, g => {
    P(g, GOLDD, 0, 0, 48, 3); P(g, GOLD, 0, 0, 48, 1);
    for (let x = 2; x < 46; x++) { const sag = Math.round(Math.sin(Math.PI * (x - 2) / 43) * 3); P(g, x % 6 < 3 ? '#2f6b45' : '#285e3c', x, 3, 1, 25 + sag); }
    for (let x = 2; x < 46; x += 3) P(g, GOLD, x, 27 + Math.round(Math.sin(Math.PI * (x - 2) / 43) * 3), 2, 2);
    for (let i = 0; i < 3; i++) P(g, GOLD, 24 - (i + 1) * 3, 9 + i * 5, (i + 1) * 6, 3); P(g, GOLDD, 23, 24, 2, 3);
    P(g, GOLD, 19, 4, 10, 3); P(g, GOLD, 19, 2, 2, 2); P(g, GOLD, 23, 1, 2, 3); P(g, GOLD, 27, 2, 2, 2); P(g, '#c43050', 23, 5, 2, 1);
  });
  STATIC.tr_window = () => mk(32, 32, g => {
    P(g, GOLDD, 2, 2, 28, 30); P(g, GOLD, 3, 3, 26, 28);
    const cols = ['#c43050', '#3a7ac0', '#3ab04a', '#e8c040', '#9a70e0'];
    for (let y = 6; y < 30; y += 4) for (let x = 5; x < 27; x += 4) P(g, cols[((x + y) / 4 | 0) % 5], x, y, 3, 3);
    for (let i = 0; i < 6; i++) { P(g, '#f8f0d0', 15 - i, 5 + i * 2, 2, 2); P(g, '#f8f0d0', 15 + i, 5 + i * 2, 2, 2); }
    P(g, '#2a2420', 15, 4, 2, 28); P(g, '#2a2420', 4, 17, 24, 2);
  });
})();

// Two paintings, a hundred years apart, of the same face.
Object.assign(Actions, {
  trportrait: o => {
    const fallen = Memory.get('crown_fallen');
    const text = o.type === 'tr_portrait2'
      ? '"OSWIN THE EVERGREEN, IN THE HUNDREDTH YEAR OF HIS REIGN." A different painter, a different century. The same face, not a day older, down to the set of the mouth.'
      : '"OSWIN I, THE EVERGREEN. YEAR ONE." The young King in green, painted from life. You know that face. Everyone in the realm knows that face. It has not changed.';
    UI.say(null, text + (fallen ? ' Someone has chalked underneath, in a child\'s hand: "AND WHO PAID FOR IT?"' : ''));
  },
});

(() => {
  // The room's people. Guards and the scribe serve the King and leave if the Crown falls;
  // petitioners only queue once the story is over; sightseers come after the fall.
  const G = { skin: '#c99a72', skinD: '#a87c58', hair: '#3a2a1a', hairD: '#2a1a10', style: 'short', hat: 'helm', hatC: '#e8c040', hatD: '#a07a28', hatL: '#f7e08a', plume: '#2f6b45', shirt: '#2f6b45', shirtD: '#1f4a28', plate: ['#e8c040', '#a07a28', '#f7e08a'], belt: '#a07a28', pants: '#e8e0d0', pantsD: '#c8c0b0', shoes: '#2a1a12' };
  const T = (more, look) => Object.assign({ map: 'throne', look: Object.assign({}, G, look || {}) }, more);
  Object.assign(EXTRAS, {
    t_guard1: T({ name: 'Throne Guard', at: [13, 17], dir: DIRS.right, night: true, royal: true, lines: ['Approach the King along the carpet. Stop at the foot of the dais.', 'Eyes down. Higher. Lower. There.'] }),
    t_guard2: T({ name: 'Throne Guard', at: [17, 17], dir: DIRS.left, night: true, royal: true, lines: ['Not a word until His Majesty speaks first.', 'Twenty years at this door. The King has never once looked tired.'] }),
    t_guard3: T({ name: 'King\'s Guard', at: [12, 7], dir: DIRS.down, night: true, royal: true, lines: ['Step back from the dais.', 'Touch the lions and lose the hand.'] }),
    t_guard4: T({ name: 'King\'s Guard', at: [18, 7], dir: DIRS.down, night: true, royal: true, lines: ['His Majesty sees all petitioners. Eventually.', 'Gold does not polish itself. I do.'] }),
    t_scribe: T({ name: 'Royal Scribe', at: [20, 9], dir: DIRS.left, royal: true, lines: ['Every word spoken in this room is written down. Every word. That one too.', 'The petitions go in this book. The answers go in that book. The second book is much thinner.'] },
      { hat: 'cap', hatC: '#2a2a32', hatD: '#1a1a22', shirt: '#2a2a32', shirtD: '#1a1a22', plate: null, pants: '#2a2a32', pantsD: '#1a1a22', hair: '#d8d4cc', hairD: '#b4b0a8', beard: '#d8d4cc' }),
    t_pet1: T({ name: 'Petitioner', at: [6, 11], dir: DIRS.right, royal: true, later: true, pair: 't_pet2', lines: ['I have waited since dawn to ask about my mill. Since dawn last week.'] },
      { hat: 'straw', plate: null, shirt: '#7a8a5a', shirtD: '#5a6a3a', pants: '#6a5a40', pantsD: '#4a3a28' }),
    t_pet2: T({ name: 'Petitioner', at: [7, 11], dir: DIRS.left, royal: true, later: true, lines: ['They say he remembers every face. I hope he remembers mine. I hope he does not.'] },
      { hat: null, style: 'bun', hair: '#8a5a30', hairD: '#6a4220', plate: null, shirt: '#a05a7a', shirtD: '#7a3a5a', pants: '#4a4a54', pantsD: '#3a3a44' }),
    t_visit1: T({ name: 'Sightseer', at: [8, 4], dir: DIRS.up, afterFall: true, lines: ['A hundred years between these paintings. Not one grey hair. I used to think that was a blessing.', 'People keep chalking things under the portraits. Nobody rubs them off.'] },
      { hat: null, style: 'long', hair: '#3a2a1a', hairD: '#2a1a10', plate: null, shirt: '#3a9a8a', shirtD: '#2a6a5a', pants: '#e8dcc4', pantsD: '#c8bca8' }),
    t_visit2: T({ name: 'Old Farmer', at: [15, 9], dir: DIRS.up, afterFall: true, lines: ['I came all this way to look at a chair. And you know what? It is just a chair.', 'All that gold. We grew it. Every coin of it, in our fields.'] },
      { hat: 'straw', plate: null, shirt: '#7a6a55', shirtD: '#5a4a38', pants: '#5a4a38', pantsD: '#44382a', hair: '#d8d4cc', hairD: '#b4b0a8', beard: '#d8d4cc' }),
  });
  GOSSIP.t_pet1 = [['t_pet1', 'What are you asking for?'], ['t_pet2', 'My son back.'], ['t_pet1', '...Oh.'], ['t_pet2', 'And you?'], ['t_pet1', 'A new roof. It seems small, now.']];
})();

// ---- Building it ------------------------------------------------------------------------------
const THRONE = { w: 30, h: 20, king: [15, 6], door: [15, 19], arrive: [15, 18] };
(() => {
  const build = World.build.bind(World);
  World.build = function () {
    build();
    const W = this, old = W.maps.throne;
    if (!old) return;
    const back = old.warps.find(w => w.to === 'castle' || w.to === 'capital');
    const m = W.room('throne', 'The Throne Room', THRONE.w, THRONE.h, T.ST, ['#2f5a40', '#24503a', '#1a3a2a']);
    // The carpet up to the dais, and the dais itself are painted on the floor (see below).
    W.rect(m, 14, 3, 3, 16, T.R);
    const add = (type, x, y, props) => W.add(m, type, x, y, props);
    const say = text => ({ text });
    add('tr_throne', 14, 4);
    // On the walls: banners, stained glass, the two portraits, and the royal crest above the throne.
    [2, 10, 20, 28].forEach(x => add('castlebanner', x, 1));
    [4, 11, 18, 25].forEach(x => add('tr_window', x, 1));
    add('tr_portrait', 7, 1); add('tr_portrait2', 22, 1);
    add('tr_crest', 14, 1);
    // On the dais: golden lions and tribute either side of the throne.
    add('tr_lion', 12, 5, say('A golden lion, life-sized and solid. Its eyes are emeralds. Its teeth are, somehow, also gold.'));
    add('tr_lion', 18, 5, say('The other lion. A child has clearly tried to ride it, long ago, and been stopped.'));
    add('tr_hoard', 10, 4, say('Tribute from the provinces: coins, cups, a crown that is not his, a necklace that was somebody\'s grandmother\'s.'));
    add('tr_hoard', 19, 4, say('More tribute. A little brass label reads "THE NORTHERN TITHE, YEAR 127." It is the smallest pile.'));
    add('tr_brazier', 11, 7); add('tr_brazier', 19, 7);
    add('candelabra', 6, 4); add('candelabra', 24, 4);
    // The hall: marble pillars, parade armour, a crown in a case, a golden statue, urns.
    [[8, 6], [8, 10], [8, 14], [22, 6], [22, 10], [22, 14]].forEach(([x, y]) => add('pillar', x, y, say('A green marble pillar with a gilded crown at the top. Every province\'s name is carved on it, and the year it first paid its Tithe.')));
    const armour = ['Gilded parade armour, polished to a mirror. Your own face looks back at you, stretched and golden.', 'A suit of ceremonial plate, never once worn in battle. The halberd is sharp anyway.', 'Parade armour with the evergreen tree inlaid in gold on the breastplate. It would take a year\'s harvest to buy one gauntlet.'];
    [[3, 5], [3, 9], [3, 13], [27, 5], [27, 9], [27, 13]].forEach(([x, y], i) => add('tr_armor', x, y, say(armour[i % 3])));
    add('crowncase', 4, 16, say('A crown under glass, older than the one he wears. The plaque says "THE FIRST CROWN." The velvet under it has never faded.'));
    add('goldstatue', 25, 16, say('A golden statue of the King, holding a sheaf of wheat. The wheat is real, and has not wilted.'));
    [[2, 3], [27, 3], [2, 18], [28, 18]].forEach(([x, y]) => add('tr_urn', x, y));
    // Doors: in from the castle's Hall of Kings, and back out.
    m.warps.push(Object.assign({ x: THRONE.door[0], y: THRONE.door[1], to: 'castle', tx: 36, ty: 12, dir: DIRS.down }, back ? { to: back.to, tx: back.tx, ty: back.ty, dir: back.dir } : {}));
    for (const id of Object.keys(W.maps)) for (const w of W.maps[id].warps) if (w.to === 'throne') Object.assign(w, { tx: THRONE.arrive[0], ty: THRONE.arrive[1] });
  };
  // The King now stands before the bigger throne.
  if (NPCS.king) NPCS.king.sched = [[360, 'throne', THRONE.king[0], THRONE.king[1]]];

  // Paint the floor: checkered marble, a gold-bordered carpet, and the raised dais with its steps.
  const ground = Render.ground.bind(Render);
  Render.ground = function (m, season) {
    const c = ground(m, season);
    if (m.id !== 'throne' || c.trPainted) return c;
    c.trPainted = true;
    const g = c.getContext('2d'), P = Art.P, S16 = 16;
    for (let y = 3; y < THRONE.h - 1; y++) for (let x = 1; x < THRONE.w - 1; x++) {
      const px = x * S16, py = y * S16, light = (x + y) % 2 === 0;
      P(g, light ? '#efe8da' : '#d8cfbd', px, py, 16, 16); P(g, light ? '#f8f4ea' : '#e4dccc', px + 1, py + 1, 6, 1);
      P(g, '#2f5a40', px - 1, py - 1, 3, 3); P(g, '#c9a040', px, py, 1, 1);
    }
    // The dais: rows 3 to 6, a raised platform with two gold-edged steps.
    const dx0 = 9 * S16, dx1 = 22 * S16;
    P(g, '#f4efe4', dx0, 3 * S16, dx1 - dx0, 3 * S16); for (let x = dx0; x < dx1; x += 16) P(g, '#e4dccc', x, 3 * S16, 1, 3 * S16);
    P(g, '#c9a040', dx0, 6 * S16 - 2, dx1 - dx0, 2); P(g, '#d8cfbd', dx0 - 4, 6 * S16, dx1 - dx0 + 8, 8); P(g, '#b8ae9a', dx0 - 4, 6 * S16 + 6, dx1 - dx0 + 8, 2);
    P(g, '#c9a040', dx0 - 4, 6 * S16, dx1 - dx0 + 8, 1); P(g, '#c8bfac', dx0 - 8, 6 * S16 + 8, dx1 - dx0 + 16, 8); P(g, '#a89e8a', dx0 - 8, 7 * S16 - 2, dx1 - dx0 + 16, 2); P(g, '#c9a040', dx0 - 8, 6 * S16 + 8, dx1 - dx0 + 16, 1);
    P(g, '#a89e8a', dx0, 3 * S16, 2, 3 * S16); P(g, '#a89e8a', dx1 - 2, 3 * S16, 2, 3 * S16);
    // The carpet, from the door up the steps to the throne.
    const cx0 = 14 * S16 + 2, cw = 3 * S16 - 4;
    P(g, '#8a2020', cx0, 3 * S16, cw, (THRONE.h - 4) * S16); P(g, '#a02a2a', cx0 + 4, 3 * S16, cw - 8, (THRONE.h - 4) * S16);
    P(g, '#e8c040', cx0 + 2, 3 * S16, 1, (THRONE.h - 4) * S16); P(g, '#e8c040', cx0 + cw - 3, 3 * S16, 1, (THRONE.h - 4) * S16);
    for (let y = 3 * S16 + 8; y < (THRONE.h - 1) * S16; y += 16) { P(g, '#e8c040', cx0 + cw / 2 - 2, y, 4, 4); P(g, '#c43050', cx0 + cw / 2 - 1, y + 1, 2, 2); }
    // A gold border round the hall floor.
    P(g, '#c9a040', 16, 3 * S16, (THRONE.w - 2) * S16, 1); P(g, '#c9a040', 16, (THRONE.h - 1) * S16 - 1, (THRONE.w - 2) * S16, 1);
    // Gold moulding along the green walls.
    for (let x = 16; x < (THRONE.w - 1) * S16; x += 12) { P(g, '#c9a040', x, 16, 1, 32); P(g, '#3a6a4a', x + 5, 22, 2, 2); }
    P(g, '#e8c040', 16, 16, (THRONE.w - 2) * S16, 2); P(g, '#a07a28', 16, 46, (THRONE.w - 2) * S16, 2);
    return c;
  };
  // Embers rise from the braziers.
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) {
    tick(dt);
    const m = Player.map;
    if (!m || m.id !== 'throne' || Math.random() > 0.3) return;
    for (const o of m.objs.values()) if (o.type === 'tr_brazier' && Math.random() < 0.5) VFX.emit('flame', o.x * TILE + 8 + (Math.random() - 0.5) * 8, o.y * TILE - 6, { vy: -24 - Math.random() * 12 });
  };
})();
