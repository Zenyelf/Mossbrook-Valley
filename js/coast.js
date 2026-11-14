'use strict';
// Saltmere Coast, a place to enjoy. The east half of the beach is now a seaside town:
//  - The Salty Gull, a beach cafe run by Marisol, with food and drink.
//  - A lighthouse whose beam sweeps the sea at night, and its keeper.
//  - A pier out over the waves, where the deep-sea fish bite.
//  - Beachcombing: shells, sea glass, starfish and coral wash up every morning, and
//    sometimes a message in a bottle. Some bottles hold a treasure map: find the X,
//    dig, and see what was buried.
//  - Barnaby the shell collector, who rewards you for every new kind of shell.
//  - Rock pools to search, sandcastles to build (the tide takes them each night),
//    beach volleyball, sunbathers, a lifeguard, fishermen, an ice-cream seller,
//    and a bonfire with music after dark.
//  - Hermit crabs and a sea turtle on the sand, dolphins and sailboats out at sea.
// The crabs that bite keep to the wild west end. Loaded after castle.js.

// ---- Things from the sea ---------------------------------------------------------------
const SHELLS = ['seashell', 'starfish', 'sea_glass', 'sand_dollar', 'conch', 'coral', 'pearl'];
item('seashell', 'Seashell', 'forage', 40, ['ribshell', '#f4e0d0', '#d8a890'], 'A ribbed shell, warm from the sun.');
item('starfish', 'Starfish', 'forage', 55, ['starfish', '#f08a50', '#c05a30'], 'Five arms and no complaints.');
item('sea_glass', 'Sea Glass', 'forage', 60, ['seaglass', '#7ad0b0', '#4a9a80'], 'A bottle the sea has spent years polishing.');
item('sand_dollar', 'Sand Dollar', 'forage', 70, ['sanddollar', '#efe6d2', '#c8b898'], 'Not legal tender. Barnaby will pay for it anyway.');
item('conch', 'Conch', 'forage', 90, ['conch', '#f0b0a0', '#c07060'], 'Hold it to your ear. It is the sea, or your own blood. Either way, it sounds nice.');
item('coral', 'Red Coral', 'forage', 120, ['coral', '#e05050', '#a02a30'], 'A branch of red coral, washed in from somewhere warmer.');
item('message_bottle', 'Message in a Bottle', 'gadget', 20, ['bottle', '#8ad0a0', '#4a8a60'], 'A corked bottle with a rolled paper inside. Use it to read it.');
item('shell_crown', 'Shell Crown', 'relic', 0, ['shellcrown', '#f0d0c0', '#c08070'], 'Barnaby\'s gift for a complete shell collection.', { lore: 'Every shell on the coast, strung on silver wire. Barnaby says the last person to finish the collection was his grandmother. She wore it every day.' });
// Deep-sea fish, only from the end of the pier.
item('sea_bass', 'Sea Bass', 'fish', 110, ['fish', '#8aa0b0', '#5a7080'], 'A sturdy fish from deeper water.', { food: 18, seasons: [0, 1, 2, 3], tier: 1, where: 'deep' });
item('moonjelly', 'Moon Jelly', 'fish', 380, ['jelly', '#c8d0f8', '#8a90d0'], 'Glows faintly. It is not quite a fish, but it fought like one.', { food: 10, seasons: [0, 1, 2, 3], tier: 2, where: 'deep' });
item('swordfish', 'Swordfish', 'fish', 650, ['fish', '#4a6a9a', '#2a4060'], 'The pride of the pier. Fishermen will talk about this for weeks.', { food: 40, seasons: [1, 2], tier: 3, where: 'deep' });
// The Salty Gull's menu.
item('fish_taco', 'Fish Taco', 'food', 70, ['taco', '#e8c070', '#a07a30'], 'Grilled mackerel, lime and cabbage in a warm flatbread.', { food: 45 });
item('coconut', 'Coconut Water', 'food', 30, ['coconut', '#8a5a34', '#f4efe4'], 'Straight from the shell, with a straw. Cool and sweet.', { food: 20, heal: 15 });
item('shave_ice', 'Shave Ice', 'food', 35, ['shaveice', '#f070a0', '#7ab0f0'], 'Ice shaved thin and soaked in berry syrup. Eat it fast.', { food: 25 });
item('chowder', 'Seafood Chowder', 'food', 130, ['chowderbowl', '#efe6d2', '#c8a070'], 'Thick, creamy and full of whatever the boats brought in.', { food: 80, heal: 30 });
Object.assign(Art.ICONS, {
  ribshell: (g, a, b) => { const P = Art.P; P(g, a, 3, 5, 10, 8); P(g, a, 5, 3, 6, 2); P(g, b, 4, 12, 8, 2); for (let i = 0; i < 4; i++) P(g, b, 4 + i * 2, 5, 1, 7); P(g, '#ffffff', 6, 4, 2, 1); },
  starfish: (g, a, b) => { const P = Art.P; P(g, a, 6, 6, 4, 4); P(g, a, 7, 1, 2, 5); P(g, a, 1, 6, 5, 2); P(g, a, 10, 6, 5, 2); P(g, a, 3, 10, 3, 4); P(g, a, 10, 10, 3, 4); P(g, b, 7, 7, 2, 2); P(g, '#ffe0c0', 7, 2); },
  seaglass: (g, a, b) => { const P = Art.P; P(g, a, 4, 5, 8, 7); P(g, a, 5, 4, 5, 1); P(g, b, 4, 11, 8, 1); P(g, '#e0fff0', 5, 6, 2, 2); },
  sanddollar: (g, a, b) => { const P = Art.P; P(g, a, 3, 3, 10, 10); P(g, a, 2, 5, 12, 6); P(g, b, 7, 4, 2, 4); P(g, b, 5, 7, 6, 1); P(g, b, 4, 10, 2, 1); P(g, b, 10, 10, 2, 1); },
  conch: (g, a, b) => { const P = Art.P; P(g, a, 3, 6, 9, 6); P(g, a, 5, 3, 5, 3); P(g, a, 11, 8, 3, 3); P(g, b, 4, 11, 8, 2); P(g, b, 6, 4, 1, 6); P(g, '#ffd8c8', 9, 7, 2, 3); },
  coral: (g, a, b) => { const P = Art.P; P(g, a, 7, 6, 2, 8); P(g, a, 4, 3, 2, 6); P(g, a, 10, 2, 2, 7); P(g, a, 5, 8, 3, 2); P(g, a, 9, 8, 2, 2); P(g, b, 6, 13, 4, 2); P(g, '#ffb0b0', 10, 2); },
  bottle: (g, a, b) => { const P = Art.P; P(g, a, 4, 6, 9, 6); P(g, a, 12, 7, 2, 4); P(g, '#a0703c', 14, 8, 1, 2); P(g, '#efe6d2', 6, 8, 5, 2); P(g, '#ffffff', 5, 7, 2, 1); P(g, b, 4, 11, 9, 1); },
  shellcrown: (g, a, b) => { const P = Art.P; P(g, '#c8ccd4', 2, 10, 12, 2); [[2, 6, a], [5, 4, '#f08a50'], [8, 3, '#7ad0b0'], [11, 5, a]].forEach(([x, y, c]) => P(g, c, x, y, 3, 6)); P(g, '#ffffff', 8, 8, 2, 2); },
  jelly: (g, a, b) => { const P = Art.P; P(g, a, 3, 3, 10, 6); P(g, a, 4, 2, 8, 1); P(g, '#ffffff', 5, 4, 2, 2); for (let i = 0; i < 4; i++) P(g, b, 4 + i * 2, 9, 1, 5 - (i % 2)); },
  taco: (g, a, b) => { const P = Art.P; P(g, a, 2, 6, 12, 7); P(g, b, 2, 12, 12, 1); P(g, '#7ab04a', 4, 5, 8, 2); P(g, '#c86a30', 5, 7, 6, 2); P(g, '#ffffff', 6, 4, 4, 1); },
  coconut: (g, a, b) => { const P = Art.P; P(g, a, 3, 5, 10, 9); P(g, '#6a4326', 3, 12, 10, 2); P(g, b, 4, 5, 8, 2); P(g, '#f070a0', 9, 1, 1, 5); P(g, '#7ab04a', 5, 2, 3, 2); },
  shaveice: (g, a, b) => { const P = Art.P; P(g, '#e8dcc4', 5, 10, 6, 4); P(g, '#ffffff', 3, 4, 10, 6); P(g, a, 3, 4, 5, 4); P(g, b, 8, 4, 5, 4); P(g, '#ffffff', 6, 2, 4, 2); },
  chowderbowl: (g, a, b) => { const P = Art.P; P(g, '#4a8ad0', 2, 8, 12, 5); P(g, '#3a7ac0', 3, 12, 10, 2); P(g, a, 2, 7, 12, 2); P(g, b, 4, 7, 3, 1); P(g, '#e86a30', 9, 7, 2, 1); P(g, '#ffffff', 5, 4, 1, 2); P(g, '#ffffff', 9, 3, 1, 2); },
});

// ---- Pieces of the beach -----------------------------------------------------------------
Object.assign(OBJDEF, {
  umbrella: { solid: 1 }, towel: { flat: 1 }, lifetower: { solid: 1, fw: 2, fh: 2, act: 'read' }, volleynet: { solid: 1, fw: 3 }, rockpool: { solid: 1, act: 'rockpool' },
  sandpile: { solid: 1, act: 'sandcastle' }, bonfire: { solid: 1, light: 1, act: 'read' }, pierpost: { solid: 1 }, digspot: { solid: 1, act: 'dig' }, curio: { solid: 1, fw: 3, reach: 1 },
});
Object.assign(ACT_LABEL, { rockpool: 'Search the rock pool', sandcastle: 'Build a sandcastle', dig: 'Dig here' });
(() => {
  const { mk, P, outlined, STATIC } = Art;
  Object.assign(STATIC, {
    umbrella: () => outlined(mk(32, 34, g => { P(g, '#e8dcc4', 15, 10, 2, 24); for (let x = 0; x < 32; x++) { const h = Math.round(Math.sin(x / 31 * Math.PI) * 9); P(g, Math.floor(x / 5) % 2 ? '#ffffff' : '#e04050', x, 10 - h, 1, h + 2); } P(g, '#c02a40', 0, 11, 32, 1); })),
    towel: () => mk(32, 16, g => { P(g, '#3a7ac0', 1, 3, 30, 11); for (let x = 1; x < 31; x += 6) P(g, '#f0d040', x, 3, 3, 11); P(g, '#2a5a90', 1, 13, 30, 1); }),
    lifetower: () => outlined(mk(32, 52, g => { P(g, '#e8dcc4', 3, 20, 3, 32); P(g, '#e8dcc4', 26, 20, 3, 32); P(g, '#c8bca8', 6, 34, 20, 2); P(g, '#c8bca8', 6, 44, 20, 2); P(g, '#e04050', 1, 12, 30, 9); P(g, '#ffffff', 1, 15, 30, 2); P(g, '#ffffff', 4, 2, 24, 3); P(g, '#e04050', 2, 5, 28, 7); Font.center(g, 'GUARD', 16, 13, '#ffffff'); })),
    volleynet: () => outlined(mk(48, 28, g => { P(g, '#6a4a30', 1, 4, 2, 24); P(g, '#6a4a30', 45, 4, 2, 24); P(g, '#ffffff', 3, 4, 42, 2); for (let x = 3; x < 45; x += 3) P(g, 'rgba(255,255,255,0.8)', x, 6, 1, 10); for (let y = 6; y < 16; y += 3) P(g, 'rgba(255,255,255,0.8)', 3, y, 42, 1); })),
    rockpool: () => outlined(mk(24, 16, g => { P(g, '#7a7a82', 0, 5, 24, 11); P(g, '#9a9aa2', 1, 4, 22, 3); P(g, '#3d86c6', 4, 7, 16, 6); P(g, '#7dbbe6', 6, 8, 5, 1); P(g, '#f08a50', 15, 10, 2, 2); P(g, '#5ac08a', 8, 11, 3, 1); })),
    sandcastle0: () => mk(16, 14, g => { P(g, '#d8c288', 2, 8, 12, 6); P(g, '#e5cf94', 3, 7, 10, 2); P(g, '#c8b278', 9, 9, 1, 1); }),
    sandcastle1: () => outlined(mk(20, 18, g => { P(g, '#d8c288', 2, 10, 16, 8); P(g, '#e5cf94', 6, 4, 8, 7); for (let x = 6; x < 14; x += 3) P(g, '#e5cf94', x, 2, 2, 2); P(g, '#a08a58', 9, 12, 2, 4); })),
    sandcastle2: () => outlined(mk(26, 22, g => { P(g, '#d8c288', 1, 14, 24, 8); P(g, '#e5cf94', 3, 8, 6, 8); P(g, '#e5cf94', 17, 8, 6, 8); P(g, '#e5cf94', 8, 5, 10, 11); for (let x = 8; x < 18; x += 3) P(g, '#e5cf94', x, 3, 2, 2); P(g, '#a08a58', 12, 11, 2, 5); P(g, '#e04050', 12, 0, 4, 2); P(g, '#8a7a5a', 12, 0, 1, 4); })),
    sandcastle3: () => outlined(mk(32, 28, g => { P(g, '#7dbbe6', 0, 22, 32, 4); P(g, '#d8c288', 2, 18, 28, 6); [[2, 10], [24, 10]].forEach(([x, y]) => { P(g, '#e5cf94', x, y, 6, 10); P(g, '#e5cf94', x, y - 2, 2, 2); P(g, '#e5cf94', x + 4, y - 2, 2, 2); }); P(g, '#e5cf94', 8, 6, 16, 14); for (let x = 8; x < 24; x += 3) P(g, '#e5cf94', x, 4, 2, 2); P(g, '#e5cf94', 13, 0, 6, 6); P(g, '#a08a58', 14, 13, 4, 7); P(g, '#f4e0d0', 4, 18, 2, 2); P(g, '#f08a50', 26, 19, 2, 2); P(g, '#e04050', 16, 0, 5, 2); P(g, '#8a7a5a', 15, 0, 1, 5); })),
    bonfire: () => outlined(mk(20, 14, g => { P(g, '#6a4a30', 2, 8, 16, 3); P(g, '#5a3a20', 4, 6, 12, 3); P(g, '#7a7a82', 0, 11, 20, 3); P(g, '#2a2420', 6, 9, 8, 2); })),
    pierpost: () => outlined(mk(8, 26, g => { P(g, '#6a4a30', 2, 4, 4, 22); P(g, '#7a5535', 2, 4, 2, 22); P(g, '#e8dcc4', 1, 2, 6, 3); })),
    digspot: () => mk(16, 12, g => { P(g, '#c8b278', 3, 6, 10, 5); P(g, '#7a2f30', 4, 4, 2, 2); P(g, '#7a2f30', 10, 4, 2, 2); P(g, '#7a2f30', 6, 6, 4, 2); P(g, '#7a2f30', 4, 8, 2, 2); P(g, '#7a2f30', 10, 8, 2, 2); }),
    curio: () => outlined(mk(48, 44, g => {
      P(g, '#6f4c30', 3, 14, 3, 30); P(g, '#6f4c30', 42, 14, 3, 30); for (let x = 0; x < 48; x++) P(g, Math.floor(x / 6) % 2 ? '#ffffff' : '#3a9ac0', x, 6, 1, 9); P(g, '#2a7aa0', 0, 14, 48, 1);
      P(g, '#a07a50', 2, 28, 44, 10); P(g, '#8a6a40', 2, 36, 44, 2); [[6, '#f4e0d0'], [13, '#f08a50'], [20, '#7ad0b0'], [27, '#efe6d2'], [34, '#f0b0a0'], [40, '#e05050']].forEach(([x, c]) => P(g, c, x, 25, 4, 4));
      P(g, '#e8dcc4', 12, 0, 24, 6); Font.center(g, 'SHELLS', 24, 0, '#3a7ac0');
    })),
  });
  // The Salty Gull: a little blue-and-white beach cafe.
  Art.house_defs.shack = {
    tw: 6, wallH: 34, roofH: 24, slope: 8, wall: ['#e8e0d0', '#f4ecdc', '#c8bca8'], roof: ['#3a7ac0', '#4a8ad0', '#2a5a90'], doorCol: 2, door: '#3a7ac0', windows: [0, 4],
    deco(g, x0, wy) { for (let x = 0; x < 96; x++) P(g, Math.floor(x / 8) % 2 ? '#ffffff' : '#e04050', x0 + x, wy, 1, 6); P(g, '#e8dcc4', x0 + 20, wy - 14, 56, 10); Font.center(g, 'SALTY GULL', x0 + 48, wy - 13, '#2a5a90'); },
  };
  // The lighthouse: tall, striped, with a lamp room at the top.
  const lighthouse = (season, night) => outlined(mk(4 * 16 + 8, 150, g => {
    const W = 72;
    P(g, '#7a7a82', 8, 126, 56, 24); P(g, '#9a9aa2', 8, 126, 56, 3);
    for (let y = 30; y < 128; y++) { const half = Math.round(13 + (y - 30) / 98 * 9), band = Math.floor((y - 30) / 14) % 2; P(g, band ? '#e04050' : '#ffffff', W / 2 - half, y, half * 2, 1); P(g, band ? '#a02a38' : '#d8d0c8', W / 2 + half - 3, y, 3, 1); }
    P(g, '#3a3436', 22, 24, 28, 7); P(g, '#5a5458', 20, 30, 32, 2);
    P(g, night ? '#ffe890' : '#b8d8f0', 25, 10, 22, 14); P(g, night ? '#ffffff' : '#e0f0ff', 29, 12, 6, 10); P(g, '#3a3436', 25, 10, 22, 2); P(g, '#3a3436', 35, 10, 2, 14);
    for (let y = 0; y < 10; y++) P(g, '#c02a38', 36 - (10 - y) * 1.4, y + 1, (10 - y) * 2.8, 1); P(g, '#e8c040', 35, 0, 2, 3);
    P(g, '#3a2a1a', 31, 112, 10, 14); P(g, '#5a4a3a', 32, 113, 8, 13); [64, 90].forEach(y => { P(g, night ? '#ffe08a' : '#3a4a6a', 33, y, 6, 8); });
  }));
  const building = Art.building;
  Art.building = (type, season, night) => (type === 'lighthouse' ? Art.memo(`lighthouse${night}`, () => lighthouse(season, night)) : building(type, season, night));
})();
MAP_LABELS.shack = 'The Salty Gull'; MAP_LABELS.lighthouse = 'Lighthouse';

// ---- Hermit crabs and a sea turtle ----------------------------------------------------------
Object.assign(ANIMALS, {
  hermit: { name: 'hermit crab', w: 10, h: 8, speed: 8, sound: 'click', lines: ['The hermit crab pulls into its shell, then peeks out again. Friends.', 'Its shell is far too big for it. It seems proud of that.'] },
  turtle: { name: 'sea turtle', w: 20, h: 12, speed: 5, sound: 'splash', lines: ['The turtle blinks at you, very slowly. It has been here longer than the lighthouse.', 'You stroke its shell. It is warm and ancient.'] },
});
Object.assign(Art.animalDraw, {
  hermit(g, f) { const P = Art.P; P(g, '#c07060', 3, 1, 6, 5); P(g, '#f0b0a0', 4, 1, 3, 2); P(g, '#a05040', 3, 5, 6, 1); P(g, '#e86a40', 1, 5, 3, 2); P(g, '#2a1a10', 1, 4); P(g, '#e86a40', f ? 0 : 1, 7, 2, 1); P(g, '#e86a40', f ? 3 : 4, 7, 2, 1); },
  turtle(g, f) { const P = Art.P; P(g, '#4a7a3a', 3, 3, 13, 7); P(g, '#5a9a4a', 5, 2, 9, 2); P(g, '#3a5a2a', 6, 4, 3, 3); P(g, '#3a5a2a', 11, 4, 3, 3); P(g, '#8ab070', 15, 5, 4, 3); P(g, '#2a1a10', 17, 5); P(g, '#8ab070', f ? 2 : 3, 9, 3, 2); P(g, '#8ab070', f ? 13 : 12, 9, 3, 2); },
});
HERDS.saltmere = [['hermit', 4, 42, 24, 80, 33], ['turtle', 1, 60, 30, 78, 33]];

// ---- The coast's people ---------------------------------------------------------------------
const BEACH = (skin, hair, style, shirt, pants, extra) => Object.assign({ skin: skin[0], skinD: skin[1], hair: hair[0], hairD: hair[1], style, shirt: shirt[0], shirtD: shirt[1], pants: pants[0], pantsD: pants[1], shoes: skin[1] }, extra || {});
npc({
  id: 'marisol', name: 'Marisol Reyes', role: 'Owner of the Salty Gull', remote: true,
  look: { skin: '#c88a5a', skinD: '#a86a40', hair: '#1a100a', hairD: '#100804', style: 'long', shirt: '#f0d040', shirtD: '#c8a820', apron: '#ffffff', pants: '#3a7ac0', pantsD: '#2a5a90', shoes: '#a86a40' },
  sched: [[420, 'saltygull', 6, 3], [1260, 'saltygull', 6, 3, true]],
  loves: ['swordfish', 'coconut', 'coral'], likes: ['kind:fish', 'kind:gift'], hates: ['coal', 'stone'],
  greet: ['Welcome to the Salty Gull! Sit, eat, take your shoes off.', 'Sun\'s out, fish are in, life is good.', 'You look like you need a shave ice.'],
  chat: [
    { h: 0, t: 'I came to Saltmere for one summer, twelve years ago. The sea does that. You will see.' },
    { h: 2, t: 'Fish caught off the end of the pier taste better. I do not know why. Do not question good things.' },
    { h: 4, t: 'Some nights we light a fire on the beach and someone plays until the stars go out. Come down. Everyone comes down.' },
  ],
  reactions: [],
  extra(opts) { opts.push({ text: 'Order something', fn: () => UI.push(UI.shop('saltygull', 'marisol')) }); },
});
npc({
  id: 'barnaby', name: 'Barnaby Whelk', role: 'Shell collector', remote: true,
  look: { skin: '#e8b890', skinD: '#c89870', hair: '#e0e0e0', hairD: '#c0c0c0', style: 'bald', beard: '#e0e0e0', shirt: '#3a9ac0', shirtD: '#2a7aa0', pants: '#e8dcc4', pantsD: '#c8bca8', shoes: '#a07a50', hat: 'straw' },
  sched: [[480, 'saltmere', 39, 9], [1140, 'saltmere', 39, 9, true]],
  loves: ['pearl', 'coral', 'conch'], likes: ['kind:forage', 'kind:fish'], hates: ['coal'],
  greet: ['Shells! Bring me shells! Every kind the sea gives up.', 'Ah, a beachcomber. I can always tell. Sandy knees.', 'The tide was generous this morning. Go and look.'],
  chat: [
    { h: 0, t: 'Seashell, starfish, sea glass, sand dollar, conch, red coral, and a pearl, if the sea is feeling kind. Seven. Bring me all seven.' },
    { h: 2, t: 'Bottles wash up too. Most hold poems. Bad poems. Some hold maps.' },
    { h: 4, t: 'My grandmother finished the collection once. Wore the crown to her wedding, and to her funeral.' },
  ],
  reactions: [],
  extra(opts) { opts.push({ text: `Show him your shells (${Coast.donated()}/${SHELLS.length})`, fn: () => Coast.donate() }); },
});
const surfer = BEACH(SK[1], ['#e8d8a8', '#c8b888'], 'messy', ['#f08a30', '#c06a20'], ['#3a7ac0', '#2a5a90']);
Object.assign(EXTRAS, {
  s_life: { map: 'saltmere', name: 'Lifeguard Kai', look: BEACH(SK[2], ['#1a100a', '#100804'], 'crop', ['#e04050', '#a02a38'], ['#e04050', '#a02a38']), at: [74, 26], dir: DIRS.down, only: 'day', lines: ['Swim between the flags! There are no flags. Do not swim.', 'Quiet day. I like quiet days.'] },
  s_sun1: { map: 'saltmere', name: 'Sunbather', look: BEACH(SK[0], ['#c8a048', '#a07a30'], 'long', ['#e870a8', '#b84a80'], ['#e870a8', '#b84a80']), at: [61, 29], dir: DIRS.down, only: 'day', lines: ['Mmm. Five more minutes.', 'Could you stand a little to the left? You are in my sun.'] },
  s_sun2: { map: 'saltmere', name: 'Sunbather', look: BEACH(SK[3], ['#3a2a1a', '#2a1a10'], 'short', ['#f4efe4', '#d8d0c0'], ['#3a9a8a', '#2a6a5a']), at: [67, 30], dir: DIRS.down, only: 'day', pair: 's_sun3', lines: ['First holiday in years. I am not moving until autumn.'] },
  s_sun3: { map: 'saltmere', name: 'Sunbather', look: BEACH(SK[1], ['#4a3020', '#2a1a10'], 'bun', ['#f0d040', '#c8a820'], ['#f0d040', '#c8a820']), at: [69, 30], dir: DIRS.down, only: 'day', pair: 's_sun2', lines: ['He says that every summer. He is always back at work in a week.'] },
  s_kid1: { map: 'saltmere', name: 'Sandy', look: BEACH(SK[0], ['#c2703a', '#96522a'], 'messy', ['#e04050', '#a02a38'], ['#3a7ac0', '#2a5a90']), at: [46, 26], dir: DIRS.right, only: 'day', pair: 's_kid2', lines: ['We are making the biggest castle in the world! Want to help? There is a good pile over there.'] },
  s_kid2: { map: 'saltmere', name: 'Pearl', look: BEACH(SK[2], ['#1a100a', '#100804'], 'bun', ['#f0d040', '#c8a820'], ['#f0d040', '#c8a820']), at: [49, 26], dir: DIRS.left, only: 'day', pair: 's_kid1', lines: ['The tide always knocks them down in the night. We build them again. That is the game.'] },
  s_v1: { map: 'saltmere', name: 'Volleyballer', look: surfer, at: [67, 14], dir: DIRS.right, only: 'day', volley: 0, lines: ['Watch the ball! No, the BALL!'] },
  s_v2: { map: 'saltmere', name: 'Volleyballer', look: BEACH(SK[3], ['#4a3020', '#2a1a10'], 'long', ['#3a9ac0', '#2a7aa0'], ['#3a9ac0', '#2a7aa0']), at: [67, 17], dir: DIRS.right, only: 'day', volley: 1, lines: ['Two points from the match! Or twenty. Nobody is counting.'] },
  s_v3: { map: 'saltmere', name: 'Volleyballer', look: BEACH(SK[1], ['#1a100a', '#100804'], 'crop', ['#e04050', '#a02a38'], ['#2a2a3a', '#1a1a2a']), at: [74, 14], dir: DIRS.left, only: 'day', volley: 2, lines: ['Want to play? We need a fifth. We always need a fifth.'] },
  s_v4: { map: 'saltmere', name: 'Volleyballer', look: BEACH(SK[0], ['#c8a048', '#a07a30'], 'bun', ['#9a70e0', '#6a4ab0'], ['#9a70e0', '#6a4ab0']), at: [74, 17], dir: DIRS.left, only: 'day', volley: 3, lines: ['Sand in everything. Worth it.'] },
  s_fish1: { map: 'saltmere', name: 'Old Fisherman', look: BEACH(SK[3], ['#e0e0e0', '#c0c0c0'], 'bald', ['#5a6a4a', '#40503a'], ['#4a4a54', '#3a3a44'], { beard: '#e0e0e0', hat: 'cap', hatC: '#e8dcc4', hatD: '#c8bca8' }), at: [64, 40], dir: DIRS.down, prop: 'rod', lines: ['End of the pier is where the deep ones bite. Swordfish, in summer. I have seen one. Once.', 'Patience. That is all fishing is. That, and lying about it afterwards.'] },
  s_fish2: { map: 'saltmere', name: 'Fisherwoman', look: BEACH(SK[2], ['#3a2a1a', '#2a1a10'], 'bun', ['#e8a040', '#b87020'], ['#5a5048', '#40382c'], { hat: 'straw' }), at: [66, 37], dir: DIRS.right, prop: 'rod', lines: ['Moon jellies glow at the end of the pier. Lovely things. Do not eat them raw.'] },
  s_ice: { map: 'saltmere', name: 'Ice Cream Seller', look: BEACH(SK[0], ['#c2703a', '#96522a'], 'short', ['#ffffff', '#e0e0e0'], ['#e04050', '#a02a38'], { hat: 'cap', hatC: '#e04050', hatD: '#ffffff' }), route: [[42, 14], [78, 14], [78, 17], [42, 17]], tray: '#f070a0', speed: 16, stop: 3, only: 'day', lines: ['Ice cream! Strawberry, honey or salt! Salt is better than it sounds.', 'Best job in the world. Worst on a cloudy day.'] },
  s_walk1: { map: 'saltmere', name: 'Beachgoer', look: BEACH(SK[1], ['#3a2a1a', '#2a1a10'], 'short', ['#3a9a8a', '#2a6a5a'], ['#e8dcc4', '#c8bca8']), wander: [42, 12, 80, 31], speed: 14, only: 'day', lines: ['Smell that air. That is what Mossbrook is missing.', 'I walk the whole beach every morning. Found a sand dollar once.'] },
  s_walk2: { map: 'saltmere', name: 'Beachgoer', look: BEACH(SK[0], ['#e8d8a8', '#c8b888'], 'long', ['#ffffff', '#e0e0e0'], ['#3a7ac0', '#2a5a90'], { hat: 'straw' }), follow: 's_walk1', speed: 14, only: 'day', lines: ['We came for the day. We have come for the day every day this week.'] },
  s_comber: { map: 'saltmere', name: 'Beachcomber Ned', look: BEACH(SK[3], ['#d8d4cc', '#b4b0a8'], 'messy', ['#a07a50', '#7a5a38'], ['#5a5048', '#40382c']), wander: [42, 24, 80, 33], speed: 10, lines: ['Shells come in at dawn. The early comber gets the conch.', 'I found a bottle once with a map in it. Dug for three days. Found a boot.'] },
  s_keeper: { map: 'saltmere', name: 'Lighthouse Keeper Gideon', look: BEACH(SK[3], ['#e0e0e0', '#c0c0c0'], 'short', ['#2a3a5a', '#1a2a4a'], ['#2a3a5a', '#1a2a4a'], { beard: '#e0e0e0', hat: 'cap', hatC: '#2a3a5a', hatD: '#e8c040' }), at: [76, 9], dir: DIRS.down, night: true, lines: ['Forty years I have kept the light. Not one ship lost on my watch. Two lost dogs. Both found.', 'At night the beam goes round once every few seconds. Count it. It helps you sleep.', 'The Red Gull used to sail past here, years back. I kept the light lit for them anyway.'] },
  // After dark, a fire on the sand and a song.
  s_fire1: { map: 'saltmere', name: 'Marisol\'s Cousin', look: BEACH(SK[1], ['#1a100a', '#100804'], 'long', ['#e8a040', '#b87020'], ['#3a7ac0', '#2a5a90']), at: [55, 24], dir: DIRS.right, only: 'night', pair: 's_fire2', lines: ['Sit! There is room by the fire. There is always room.'] },
  s_fire2: { map: 'saltmere', name: 'Sailor Bram', look: BEACH(SK[2], ['#3a2a1a', '#2a1a10'], 'crop', ['#ffffff', '#3a7ac0'], ['#2a3a5a', '#1a2a4a'], { beard: '#3a2a1a' }), at: [59, 24], dir: DIRS.left, only: 'night', pair: 's_fire1', lines: ['I have sailed every sea there is. This beach, this fire. Best one.'] },
  s_fire3: { map: 'saltmere', name: 'Fire Singer', look: surfer, at: [57, 27], dir: DIRS.up, only: 'night', music: '#ffb060', prop: 'lute', lines: ['A song about the sea. They are all about the sea, really.'] },
  // Inside the Salty Gull.
  s_cafe1: { map: 'saltygull', name: 'Regular', look: BEACH(SK[3], ['#d8d4cc', '#b4b0a8'], 'bald', ['#5a6a4a', '#40503a'], ['#4a4a54', '#3a3a44']), at: [2, 5], dir: DIRS.right, pair: 's_cafe2', lines: ['Same table, same chowder, twenty years.'] },
  s_cafe2: { map: 'saltygull', name: 'Regular', look: BEACH(SK[1], ['#4a3020', '#2a1a10'], 'bun', ['#e870a8', '#b84a80'], ['#5a5048', '#40382c']), at: [4, 5], dir: DIRS.left, pair: 's_cafe1', lines: ['He says that, but last week he had the taco.'] },
  s_cafe3: { map: 'saltygull', name: 'Tourist', look: BEACH(SK[0], ['#c8a048', '#a07a30'], 'short', ['#f0d040', '#c8a820'], ['#e8dcc4', '#c8bca8'], { hat: 'straw' }), at: [7, 6], dir: DIRS.up, lines: ['I came from the Court for the sea air. It is so... alive here. Everything is a little different every day!'] },
});
Object.assign(GOSSIP, {
  s_sun2: [['s_sun2', 'This is the life.'], ['s_sun3', 'Pass the coconut water.'], ['s_sun2', 'This is also the life.']],
  s_kid1: [['s_kid1', 'Bigger moat!'], ['s_kid2', 'The moat is the sea now.'], ['s_kid1', 'Then bigger sea!']],
  s_fire1: [['s_fire1', 'Tell the one about the swordfish.'], ['s_fire2', 'It was THIS big.'], ['s_fire1', 'It gets bigger every year.'], ['s_fire2', 'So does the sea.']],
  s_cafe1: [['s_cafe1', 'Lovely weather.'], ['s_cafe2', 'It is raining.'], ['s_cafe1', 'Lovely rain, then.']],
});

// ---- The beach, built --------------------------------------------------------------------
const Coast = {
  st() { if (!S.coast) S.coast = { day: -1, castles: {}, pools: {}, treasure: null, shells: {}, finds: 0 }; return S.coast; },
  donated() { const c = this.st(); return SHELLS.filter(s => c.shells[s]).length; },
  // Each morning: the tide brings shells in and takes the sandcastles away.
  morning(m) {
    const c = this.st();
    if (c.day === absDay()) return;
    c.day = absDay(); c.castles = {}; c.pools = {};
    [...m.objs.values()].filter(o => o.type === 'forage' && (SHELLS.includes(o.item) || o.item === 'message_bottle') && !o.keep).forEach(o => World.remove(m, o));
    const table = [['seashell', 30], ['starfish', 18], ['sea_glass', 16], ['sand_dollar', 14], ['conch', 9], ['coral', 6], ['message_bottle', 10], ['pearl', 2]], total = table.reduce((a, b) => a + b[1], 0);
    let n = 7 + Math.floor(Math.random() * 4);
    for (let i = 0; i < 400 && n > 0; i++) {
      const x = 4 + Math.floor(Math.random() * 76), y = 25 + Math.floor(Math.random() * 9);
      if (World.g(m, x, y) !== T.S || World.solid(m, x, y) || World.at(m, x, y) || World.warpAt(m, x, y)) continue;
      let r = Math.random() * total, id = table[0][0];
      for (const [k, w] of table) { r -= w; if (r <= 0) { id = k; break; } }
      World.add(m, 'forage', x, y, { item: id }); n--;
    }
  },
  sync(m) {
    this.morning(m);
    const c = this.st(), spot = [...m.objs.values()].find(o => o.type === 'digspot');
    if (c.treasure && !spot) World.add(m, 'digspot', c.treasure.x, c.treasure.y);
    if (!c.treasure && spot) World.remove(m, spot);
  },
  // Messages in bottles: poems, jokes, laments, and now and then a map.
  NOTES: [
    'If you find this, I am still on the island with the three palms. Send cake.',
    'Roses are red, the sea is quite blue, I dropped my best boot, and I miss it. Do you?',
    'To whoever finds this: be kind to the next person you meet. That is all. That is the whole message.',
    'The fish do not bite on Tuesdays. I have proof. I have had no fish for eleven Tuesdays.',
    'Dear sea. Please give back my hat. Yours, a man with no hat.',
  ],
  read() {
    const c = this.st();
    Inv.remove('message_bottle', 1);
    c.finds++;
    if (!c.treasure && Math.random() < 0.45) {
      const m = World.maps.saltmere;
      for (let i = 0; i < 300; i++) {
        const x = 6 + Math.floor(Math.random() * 74), y = 12 + Math.floor(Math.random() * 20);
        if (World.g(m, x, y) === T.S && !World.solid(m, x, y) && !World.at(m, x, y) && !World.warpAt(m, x, y)) { c.treasure = { x, y }; break; }
      }
      if (c.treasure) {
        if (Player.map === m) this.sync(m);
        Sfx.play('discover');
        return UI.say(null, `A treasure map! A sketch of Saltmere Coast, with a red X near the ${c.treasure.x > 42 ? 'east' : 'west'} end of the sand, ${c.treasure.y > 22 ? 'close to the water' : 'up near the dunes'}. Find the X and dig.`);
      }
    }
    Sfx.play('page' in Sfx.SOUNDS ? 'page' : 'click');
    UI.say(null, 'The note reads: "' + this.NOTES[Math.floor(Math.random() * this.NOTES.length)] + '"');
  },
  dig(o) {
    if (!Inv.count('hoe')) { toast('You need a hoe to dig.'); Sfx.play('deny'); return; }
    const c = this.st();
    c.treasure = null; World.remove(Player.map, o);
    const gold = 400 + Math.floor(Math.random() * 1100), finds = [['pearl', 1 + Math.floor(Math.random() * 2)], [['coral', 'conch', 'token_storm', 'token_frost', 'amethyst', 'gold_ore'][Math.floor(Math.random() * 6)], 1]];
    S.gold += gold; finds.forEach(([id, n]) => { const left = Inv.add(id, n, 0, true); if (left) S.storage[Storage.slotKey(id, 0)] = (S.storage[Storage.slotKey(id, 0)] || 0) + left; });
    Sfx.play('hoe'); Sfx.play('victory'); VFX.burst('star', o.x * TILE + 8, o.y * TILE, 20, 60);
    Memory.deed('treasure_' + c.finds, 'Dug up buried treasure on Saltmere Coast.', { gossip: true });
    UI.say(null, `Your hoe hits wood. A small sea chest, crusted with salt. Inside: ${gold} gold, ${finds.map(([id, n]) => `${n} ${ITEMS[id].name}`).join(' and ')}.`);
  },
  rockpool(o) {
    const c = this.st(), k = key(o.x, o.y);
    if (c.pools[k] === absDay()) return UI.say(null, 'Just a few tiny fish and a very grumpy crab. Come back tomorrow, after the tide.');
    c.pools[k] = absDay();
    const loot = [['seashell', 30], ['starfish', 25], ['sea_glass', 15], ['coral', 8], ['pearl', 3], ['mackerel', 19]], total = loot.reduce((a, b) => a + b[1], 0);
    let r = Math.random() * total, id = loot[0][0];
    for (const [k2, w] of loot) { r -= w; if (r <= 0) { id = k2; break; } }
    Inv.add(id, 1); Sfx.play('splash'); toast(`You find a ${ITEMS[id].name} in the rock pool.`);
  },
  sandcastle(o) {
    const c = this.st(), k = key(o.x, o.y), st = c.castles[k] || 0;
    if (st >= 3) return UI.say(null, 'It is perfect. The tide will take it tonight, and that is part of it.');
    c.castles[k] = st + 1; Sfx.play('hoe'); VFX.burst('dust', o.x * TILE + 8, o.y * TILE + 10, 8, 30);
    if (st + 1 === 3) { Sfx.play('quest_done'); toast('A magnificent sandcastle, flags and all!'); Memory.deed('sandcastle', 'Built a magnificent sandcastle on Saltmere Coast.'); }
    else toast(st === 0 ? 'You pat the sand into a tower.' : 'You add walls, a gate and a little flag.');
  },
  donate() {
    const c = this.st(), have = SHELLS.filter(s => !c.shells[s] && Inv.count(s));
    if (!have.length) return UI.say('barnaby', this.donated() === SHELLS.length ? 'You have found them all. Every one. My grandmother would have liked you.' : `Nothing new there, I am afraid. I still need: ${SHELLS.filter(s => !c.shells[s]).map(s => ITEMS[s].name).join(', ')}.`);
    let paid = 0;
    have.forEach(s => { Inv.remove(s, 1); c.shells[s] = true; paid += Math.round(ITEMS[s].price * 2.5); });
    S.gold += paid; Sfx.play('coin');
    const done = this.donated() === SHELLS.length;
    if (done) { Inv.add('shell_crown', 1); Memory.deed('shell_crown', 'Completed Barnaby\'s shell collection and was given the Shell Crown.', { gossip: true }); Sfx.play('quest_done'); }
    UI.say('barnaby', `${have.map(s => ITEMS[s].name).join(', ')}! Wonderful. Here, ${paid} gold for your trouble. ${done ? 'And that is all seven. Take this. It was my grandmother\'s. The Shell Crown.' : `That makes ${this.donated()} of ${SHELLS.length}.`}`);
  },
};
Object.assign(Actions, { rockpool: o => Coast.rockpool(o), sandcastle: o => Coast.sandcastle(o), dig: o => Coast.dig(o) });

(() => {
  const build = World.build.bind(World);
  World.build = function () {
    build();
    const W = this, m = W.maps.saltmere;
    const clear = (x0, y0, w, h) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { const o = W.at(m, x, y); if (o) W.remove(m, o); } };
    // The Salty Gull and the lighthouse, up on the grass.
    clear(46, 3, 8, 6); W.addBuilding(m, 'shack', 47, 4, 6, 4, { door: { x: 49, y: 7 } });
    m.warps.push({ x: 49, y: 7, to: 'saltygull', tx: 6, ty: 7, dir: DIRS.up, door: true });
    clear(74, 3, 6, 6); W.addBuilding(m, 'lighthouse', 74, 3, 4, 5, { msg: 'The lighthouse. Gideon keeps the lamp. The door is locked; the view is his.' });
    const cafe = W.room('saltygull', 'The Salty Gull', 12, 9, T.F, ['#e8f0f4', '#c8d8e0', '#9ab0c0']);
    [4, 5, 6, 7, 8].forEach(x => W.add(cafe, 'counter', x, 4));
    W.add(cafe, 'shelf', 2, 3); W.add(cafe, 'shelf', 9, 3); W.add(cafe, 'table', 2, 6); W.add(cafe, 'table', 8, 6); W.add(cafe, 'plant', 1, 7); W.add(cafe, 'plant', 10, 7);
    W.add(cafe, 'window_i', 3, 1); W.add(cafe, 'window_i', 8, 1);
    cafe.warps.push({ x: 6, y: 8, to: 'saltmere', tx: 49, ty: 8, dir: DIRS.down });
    // The pier, out over the sea.
    W.rect(m, 64, 33, 3, 9, T.B);
    for (const y of [35, 38, 41]) { W.add(m, 'pierpost', 63, y); W.add(m, 'pierpost', 67, y); }
    // The beach town.
    W.add(m, 'curio', 38, 10);
    W.add(m, 'volleynet', 70, 15);
    W.add(m, 'lifetower', 72, 24, { text: 'The lifeguard tower. A sign says: NO SWIMMING. Underneath, someone has added: OR FUN.' });
    [[60, 28], [66, 29], [70, 28]].forEach(([x, y]) => { W.add(m, 'umbrella', x + 2, y); W.add(m, 'towel', x, y + 1); });
    [[47, 27], [52, 28], [44, 30]].forEach(([x, y]) => { clear(x, y, 1, 1); W.add(m, 'sandpile', x, y); });
    W.add(m, 'bonfire', 57, 25, { text: 'A ring of stones and driftwood. At night the whole beach gathers here.' });
    [[76, 31], [44, 32], [12, 32], [56, 32]].forEach(([x, y]) => { clear(x, y, 1, 1); W.add(m, 'rockpool', x, y); });
    // The biting crabs keep to the wild west end now.
    m.spawns = (m.spawns || []).map(sp => (sp.t === 'saltclaw' && sp.x > 40 ? Object.assign({}, sp, { x: 22, y: 30 }) : sp));
  };
  // The cafe's menu.
  const stock = UI.stock.bind(UI);
  UI.stock = kind => (kind === 'saltygull' ? [{ id: 'fish_taco', price: 140 }, { id: 'coconut', price: 60 }, { id: 'shave_ice', price: 70 }, { id: 'chowder', price: 260 }] : stock(kind));
  // Sandcastles grow as you build them.
  const sprite = Render.objSprite.bind(Render);
  Render.objSprite = function (o, season) {
    if (o.type !== 'sandpile') return sprite(o, season);
    const st = (S.coast && S.coast.castles[key(o.x, o.y)]) || 0, img = Art.obj('sandcastle' + st, 0);
    return { img, x: Math.round((o.x + 0.5) * TILE - img.width / 2), y: (o.y + 1) * TILE - img.height };
  };
  // A bottle is used by reading it.
  const useHeld = Player.useHeld;
  Player.useHeld = function (fromMouse) { const s = Inv.held(); if (s && s.id === 'message_bottle') return Coast.read(); return useHeld.call(this, fromMouse); };
  // Deep-sea fish bite only from the end of the pier.
  const fishing = UI.fishing.bind(UI);
  UI.fishing = function (spot) {
    const m = Player.map, onPier = m.id === 'saltmere' && World.g(m, Math.floor(Player.x / TILE), Math.floor((Player.y - 2) / TILE)) === T.B && Player.y > 37 * TILE;
    if (!onPier) return fishing(spot);
    m.deep = true;
    try { return fishing(spot); } finally { m.deep = false; }
  };
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) { tick(dt); if (Player.map && Player.map.id === 'saltmere') { Coast.sync(Player.map); SeaLife.update(dt || 1 / 60); } };
})();

// ---- Out at sea: dolphins, sailboats, the volleyball, the fire, the beam -------------------------
const SeaLife = {
  dolphins: [], boats: [], ball: null, t: 0,
  update(dt) {
    this.t += dt;
    const m = Player.map, day = !(S.time >= 1140 || S.time < 360), cam = Render.cam;
    // A dolphin leaps now and then, somewhere you can see.
    if (day && Math.random() < dt * 0.25 && this.dolphins.length < 2) {
      const x = cam.x + 40 + Math.random() * (UI.W - 80), y = Math.max(35 * TILE, cam.y + UI.H - 40 - Math.random() * 60);
      if (World.g(m, Math.floor(x / TILE), Math.floor(y / TILE)) === T.W) this.dolphins.push({ x, y, t: 0, dir: Math.random() < 0.5 ? 1 : -1 });
    }
    for (const d of this.dolphins) d.t += dt;
    this.dolphins = this.dolphins.filter(d => d.t < 1.3);
    if (day && this.boats.length < 2 && Math.random() < dt * 0.05) this.boats.push({ x: Math.random() < 0.5 ? -40 : m.w * TILE + 40, y: (40 + Math.random() * 3) * TILE, v: 0 });
    for (const b of this.boats) { if (!b.v) b.v = b.x < 0 ? 9 : -9; b.x += b.v * dt; }
    this.boats = this.boats.filter(b => b.x > -60 && b.x < m.w * TILE + 60);
    // Volleyball: the ball goes back and forth over the net.
    const players = Extras.active(m).filter(p => p.e.volley !== undefined).sort((a, b) => a.e.volley - b.e.volley);
    if (players.length === 4) {
      if (!this.ball || this.ball.t >= 1) {
        const from = this.ball ? this.ball.to : players[0], side = from.e.volley < 2 ? [2, 3] : [0, 1], to = players[side[Math.floor(Math.random() * 2)]];
        this.ball = { from, to, t: 0 };
        if (Math.hypot(from.x - Player.x, from.y - Player.y) < 180) Sfx.play('pick');
      }
      this.ball.t += dt / 1.1;
      players.forEach(p => { p.dir = p.e.volley < 2 ? DIRS.right : DIRS.left; });
    } else this.ball = null;
    // The bonfire burns after dark.
    if (!day && Math.random() < 0.6) VFX.emit('flame', 57.5 * TILE + (Math.random() - 0.5) * 12, 25 * TILE + 8, { vy: -30 - Math.random() * 20 });
  },
  draw(g) {
    if (!Player.map || Player.map.id !== 'saltmere') return;
    for (const b of this.boats) {
      const x = Math.round(b.x), y = Math.round(b.y);
      g.fillStyle = '#6a4a30'; g.fillRect(x - 10, y, 20, 4); g.fillStyle = '#5a3a20'; g.fillRect(x - 8, y + 4, 16, 2);
      g.fillStyle = '#5a4a3a'; g.fillRect(x, y - 18, 1, 18); g.fillStyle = '#f4efe4'; g.fillRect(x + 1, y - 17, 8, 14); g.fillStyle = '#e04050'; g.fillRect(x + 1, y - 17, 8, 2);
    }
    for (const d of this.dolphins) {
      const p = d.t / 1.3, x = Math.round(d.x + (p - 0.5) * 40 * d.dir), y = Math.round(d.y - Math.sin(p * Math.PI) * 18);
      g.save(); g.translate(x, y); g.rotate((p - 0.5) * 1.6 * d.dir); if (d.dir < 0) g.scale(-1, 1);
      g.fillStyle = '#6a8aa8'; g.fillRect(-7, -2, 14, 4); g.fillRect(5, -1, 4, 2); g.fillStyle = '#8aa8c4'; g.fillRect(-6, 1, 10, 1); g.fillStyle = '#6a8aa8'; g.fillRect(-2, -5, 3, 3); g.fillRect(-10, -3, 3, 2); g.fillRect(-10, 1, 3, 2);
      g.restore();
      if (p < 0.12 || p > 0.88) VFX.emit('spark', d.x + (p - 0.5) * 40 * d.dir, d.y, { color: '#e0f4ff', vy: -40, t: 0.3 });
    }
    if (this.ball) {
      const b = this.ball, p = Math.min(1, b.t), x = Math.round(b.from.x + (b.to.x - b.from.x) * p), gy = b.from.y + (b.to.y - b.from.y) * p, y = Math.round(gy - 28 - Math.sin(p * Math.PI) * 30);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x - 2, Math.round(gy), 5, 2);
      g.fillStyle = '#ffffff'; g.fillRect(x - 2, y - 2, 5, 5); g.fillStyle = '#e04050'; g.fillRect(x - 2, y, 5, 1); g.fillStyle = '#3a7ac0'; g.fillRect(x, y - 2, 1, 5);
    }
  },
  // The lighthouse beam sweeps over the sea at night.
  beam(g) {
    if (!Player.map || Player.map.id !== 'saltmere' || Render.darkness() < 0.3) return;
    const cam = Render.cam, lx = 76 * TILE - cam.x, ly = 3 * TILE - 100 + 22 - cam.y, a = this.t * 1.1;
    const len = 1400, spread = 0.09;
    g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = 'rgba(255,240,170,0.16)';
    g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx + Math.cos(a - spread) * len, ly + Math.sin(a - spread) * len * 0.8); g.lineTo(lx + Math.cos(a + spread) * len, ly + Math.sin(a + spread) * len * 0.8); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,250,210,0.5)'; g.beginPath(); g.arc(lx, ly, 6, 0, 6.29); g.fill();
    g.restore();
  },
};
(() => {
  const vfxDraw = VFX.draw;
  VFX.draw = function (g) { SeaLife.draw(g); return vfxDraw.call(this, g); };
  const lighting = Render.lighting;
  Render.lighting = function (...a) { const r = lighting.apply(this, a); SeaLife.beam(a[0]); return r; };
  // Fishermen hold their rods.
  const extrasDraw = Extras.draw.bind(Extras);
  Extras.draw = function (g, items, m) {
    extrasDraw(g, items, m);
    for (const p of Extras.active(m)) if (p.e.prop === 'rod') items.push({ y: p.y + 1, draw: () => { const x = Math.round(p.x), y = Math.round(p.y); g.strokeStyle = '#8a6a40'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 4, y - 12); g.lineTo(x + 4 + (p.dir === DIRS.right ? 16 : 6), y - 26); g.stroke(); g.strokeStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.moveTo(x + 4 + (p.dir === DIRS.right ? 16 : 6), y - 26); g.lineTo(x + 4 + (p.dir === DIRS.right ? 22 : 8), y + 10); g.stroke(); } });
  };
  // The coast's music by the fire, and the cafe sounds like a cafe.
  Sfx.PLACES.saltygull = 'tavern';
})();
