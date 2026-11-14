'use strict';
// The Red Gull, rebuilt as a proper ship: a curved hull with a painted wale and gunports,
// three masts under sail with a crow's nest and rigging, a captain's cabin at the stern,
// cannons along both rails, a ship's bell, a wheel and a parrot.
//
// Once the Red Gull story is finished she has a new crew. They are friendly: they wander
// the deck, sing, fish, play dice, and two of them trade with you. Strike one of them and
// the whole ship turns on you for the rest of the day. Anyone you cut down is back aboard
// the next morning, and so is their good mood.

// ---- Things to buy and find ------------------------------------------------------------
item('treasure_map', 'Pirate Treasure Map', 'gadget', 300, ['tmap', '#e8d8a8', '#b23a3a'], 'Use it to read where the X is on Gull\'s Teeth. Bring a hoe.');
item('ship_bottle', 'Ship in a Bottle', 'gift', 260, ['shipbottle', '#a8d8c8', '#b23a3a'], 'A tiny Red Gull, all sails set, inside a green glass bottle. Nobody knows how they get them in there.');
item('grog', 'Grog', 'food', 40, ['grogmug', '#a0703c', '#e8d8a8'], 'Watered rum with lime and a little sugar. Warms you right through.', { food: 35 });
item('hardtack', 'Hardtack', 'food', 15, ['hardtack', '#d8c090', '#a08050'], 'A ship\'s biscuit. Hard enough to build a house with. Soak it first.', { food: 20 });
item('pirate_stew', 'Bilge Stew', 'food', 110, ['stewpot', '#8a5a3a', '#e8a050'], 'Better than it sounds. Salt beef, potatoes, onions and a mystery.', { food: 75, heal: 25 });
item('rum_cake', 'Rum Cake', 'food', 90, ['rumcake', '#7a3a1a', '#f0e0b0'], 'Dark, sticky, and much stronger than a cake has any right to be.', { food: 55, heal: 10 });

Object.assign(Art.ICONS, {
  tmap: (g, a, b) => { const P = Art.P; P(g, a, 2, 3, 12, 10); P(g, '#c8b888', 2, 3, 2, 10); P(g, '#c8b888', 12, 3, 2, 10); P(g, '#7a9a5a', 5, 5, 4, 3); P(g, '#7a9a5a', 7, 8, 3, 2); P(g, '#8a7a5a', 5, 10, 1, 1); P(g, '#8a7a5a', 7, 10, 1, 1); P(g, b, 9, 9, 1, 1); P(g, b, 11, 9, 1, 1); P(g, b, 10, 10, 1, 1); P(g, b, 9, 11, 1, 1); P(g, b, 11, 11, 1, 1); },
  shipbottle: (g, a, b) => { const P = Art.P; P(g, '#3a7a5a', 2, 6, 11, 7); P(g, a, 3, 7, 9, 5); P(g, '#3a7a5a', 13, 8, 2, 3); P(g, '#a07a4c', 15, 8, 1, 3); P(g, '#6f4c30', 4, 10, 7, 2); P(g, '#5a3a20', 7, 6, 1, 5); P(g, '#f0ece0', 5, 7, 2, 3); P(g, '#f0ece0', 8, 7, 2, 3); P(g, b, 7, 5, 2, 1); P(g, '#ffffff', 4, 7, 1, 1); },
  grogmug: (g, a, b) => { const P = Art.P; P(g, a, 3, 5, 8, 9); P(g, '#7a5028', 3, 8, 8, 1); P(g, '#7a5028', 3, 12, 8, 1); P(g, a, 11, 7, 3, 1); P(g, a, 13, 7, 1, 4); P(g, a, 11, 10, 3, 1); P(g, b, 3, 3, 8, 3); P(g, '#ffffff', 4, 3, 2, 1); P(g, '#9ad040', 9, 2, 3, 2); },
  hardtack: (g, a, b) => { const P = Art.P; P(g, a, 2, 4, 12, 9); P(g, b, 2, 12, 12, 1); P(g, b, 13, 4, 1, 9); for (let y = 6; y < 12; y += 2) for (let x = 4; x < 13; x += 3) P(g, b, x, y, 1, 1); },
  stewpot: (g, a, b) => { const P = Art.P; P(g, '#3c3c46', 2, 7, 12, 7); P(g, '#55555f', 2, 7, 12, 1); P(g, '#3c3c46', 1, 8, 1, 2); P(g, '#3c3c46', 14, 8, 1, 2); P(g, a, 3, 6, 10, 2); P(g, b, 5, 6, 2, 1); P(g, '#e8d070', 9, 6, 2, 1); P(g, '#ffffff', 6, 2, 1, 3); P(g, '#ffffff', 9, 1, 1, 3); },
  rumcake: (g, a, b) => { const P = Art.P; P(g, a, 2, 7, 12, 6); P(g, '#5a2a10', 2, 12, 12, 1); P(g, b, 2, 6, 12, 2); P(g, b, 4, 8, 1, 2); P(g, b, 9, 8, 1, 3); P(g, '#c43030', 7, 4, 2, 2); P(g, '#3a7a2a', 8, 3, 1, 1); },
});

// ---- Ship parts ------------------------------------------------------------------------
Object.assign(OBJDEF, {
  rgmain: { solid: 1 }, rgfore: { solid: 1 }, rgmizzen: { solid: 1 },
  rgcannonn: { solid: 1, act: 'rgfire' }, rgcannons: { solid: 1, act: 'rgfire' }, rgballs: { solid: 1 },
  rgwheel: { solid: 1, act: 'rgwheel' }, rgbell: { solid: 1, act: 'rgbell' }, rgparrot: { solid: 1, act: 'rgparrot' }, rgcapstan: { solid: 1, act: 'rgcapstan' },
  rglantern: { solid: 1, light: 1 }, rgstove: { solid: 1, light: 1 }, rgloot: { solid: 1, fw: 2 },
  rgkeg: { solid: 1 }, rgpowder: { solid: 1 }, rgcrates: { solid: 1 }, rgmop: { solid: 1 },
  rgrope: { flat: 1 }, rgnet: { flat: 1 }, rggrate: { flat: 1 },
  // The captain's cabin.
  rgwindow: { flat: 1, fw: 2, fh: 2 }, rgdesk: { solid: 1, fw: 3, act: 'rglog', light: 1 }, rgbunk: { solid: 1, fw: 2, fh: 2 }, rgshelf: { solid: 1 },
  rgglobe: { solid: 1 }, rgchest: { solid: 1, act: 'rgchest' }, rgrug: { flat: 1, fw: 4, fh: 3 }, rgswords: { flat: 1 }, rgportrait: { flat: 1 }, rgcoins: { solid: 1 }, rgrack: { solid: 1 },
  // The hold.
  rghammock: { solid: 1, fw: 2 }, rgsacks: { solid: 1 },
  // Where the treasure map's X is.
  rgx: { solid: 1, act: 'rgdig' },
});
Object.assign(ACT_LABEL, { rgfire: 'Cannon', rgwheel: 'Take the wheel', rgbell: 'Ring the bell', rgparrot: 'Talk to the parrot', rgcapstan: 'Push the capstan', rglog: 'Read the log', rgchest: 'Open the chest', rgdig: 'Dig here' });
MAP_LABELS.rgcabin = 'Captain\'s Cabin';

// ---- State and rules -------------------------------------------------------------------
const RedGull = {
  st() { return S.redgull || (S.redgull = { angry: -1, chest: false, x: null, maps: 0, salute: -1 }); },
  // The story is over and the ship has a new crew.
  open() { return !!(S && Memory.get('vane_done') && qDone('p4')); },
  angry() { return !!S && this.st().angry === absDay(); },
  lively() { return this.open() && !this.angry(); },
  crewHere() { return Foes.list.filter(f => f.def.crew); },

  // Someone struck a crewman. Everyone aboard draws steel until tomorrow.
  provoke() {
    const st = this.st();
    if (st.angry === absDay()) return;
    st.angry = absDay();
    Sfx.play('alarm');
    toast('You struck one of the crew! The whole ship turns on you.');
    Memory.deed('rg_brawl_' + absDay(), 'Started a fight with the crew of the Red Gull.', { gossip: false });
    for (const f of this.crewHere()) { f.aware = 1; Foes.alert(f); }
    // The musicians and the rest dive for cover; whatever they were saying goes unsaid.
    for (const p of Extras.list) if (p.e.when) { p.say = null; p.sayEnd = 0; p.queue = []; }
  },

  // Talk to a crewman who is still in a good mood.
  LINES: {
    rg_hand: ['Mind the wet patch. Mind all the patches, really.', 'Honest sailing! Who knew it paid? Not much, but it pays.', 'Mags runs a tight ship. Tighter than Vane. Fewer chains, though.', 'I can tie forty knots. Ask me about the bowline. Nobody ever asks about the bowline.'],
    rg_hand2: ['Lost the eye in a storm. Well. In a tavern. During a storm.', 'You are the farmer! The one who boarded us! No hard feelings. Mostly.', 'The cat runs this ship. We just sail it.', 'Grog\'s in the galley. Tell Cookie I sent you. He will charge you double.'],
    rg_gunner: ['Twenty-four guns, and we fire them at nothing but birthdays now.', 'Keep your hands off my cannons. Unless it is a salute. Salutes are fine.', 'I can hit a gull at three hundred yards. I never do. They are our namesake.'],
    rg_bosun: ['Bosun Grell. I keep this deck clean and this crew honest. Mostly the deck.', 'You strike any of my lads, you answer to me. I am telling you as a friend.', 'Six bells. That means nothing to you. It means lunch to me.'],
  },
  chat(f) {
    const lines = this.LINES[f.type] || this.LINES.rg_hand;
    f.wander = 3; f.wx = 0; f.wy = 0;
    const dx = Player.x - f.x, dy = Player.y - f.y; Foes.face(f, dx, dy);
    UI.say('rgcrew_' + f.type, lines[Math.floor(Math.random() * lines.length)]);
  },

  vaneLine() {
    if (Memory.get('vane_spared')) return 'Vane? Selling pearls on Saltmere beach like a respectable man. I visit when we are in. He cries a bit. Do not tell him I told you.';
    if (Memory.get('vane_paid')) return 'Vane took your gold, the jolly boat and a barrel of salt pork, and rowed west. He left me the ship and his debts. I paid the debts. Mostly.';
    return 'You killed Vane. I will not pretend I loved him. But some of this crew sailed with him twenty years, so keep your hands where they can see them.';
  },

  // ---- Things to do on deck --------------------------------------------------------------
  fire(o) {
    const st = this.st();
    if (!this.open()) return UI.say(null, 'The cannon is cold and the touch-hole is plugged with wax. Nobody has loaded it today.');
    if (this.angry()) return toast('The gun crew are busy trying to kill you.');
    if (st.salute === absDay()) return UI.say('rgcrew_rg_gunner', 'One salute a day. Powder costs money, and Mags counts every grain.');
    st.salute = absDay();
    const up = o.type === 'rgcannonn', mx = o.x * TILE + 8, my = up ? o.y * TILE - 6 : (o.y + 1) * TILE + 10;
    Sfx.play('cannon'); if (VFX.shake) VFX.shake(0.35, 3);
    VFX.burst('smoke', mx, my, 18, 40); VFX.burst('flame', mx, my, 10, 60); VFX.burst('spark', mx, my, 8, 80);
    o.shake = 0.4;
    for (const p of Extras.active(Player.map)) Extras.bubble(p, ['HUZZAH!', 'Hurrah!', 'Again! Again!', 'My ears!'][Math.floor(Math.random() * 4)], 2.4);
    toast('BOOM! A salute rolls out across the water.');
  },
  wheel(o) {
    o.shake = 0.6; Sfx.play('rgwheel');
    if (this.lively()) return UI.say('rg_helm', ['Oi! We are at anchor. You will steer us into the island.', 'Steady as she goes. And she goes nowhere. Very steady.', 'Want to learn? Hard to port is left. Hard to starboard is the other left.'][Math.floor(Math.random() * 3)]);
    UI.say(null, 'You spin the great wheel. Somewhere below, the rudder groans. The Red Gull, at anchor, ignores you.');
  },
  bell(o) {
    o.shake = 0.8; Sfx.play('shipbell');
    if (this.lively()) {
      for (const p of Extras.active(Player.map)) Extras.bubble(p, ['Aye!', 'All hands!', 'Who rang that?', 'Is it supper?', 'Eight bells!'][Math.floor(Math.random() * 5)], 2.4);
      return;
    }
    // Before the ship is won, the bell brings everyone running.
    const pirates = Foes.list.filter(f => !f.def.crew && f.def.human);
    if (pirates.length) { pirates.forEach(f => Foes.alert(f)); toast('The bell clangs out over the deck. Every pirate aboard turns to look.'); }
  },
  parrot(o) {
    Sfx.play('squawk'); o.shake = 0.3;
    VFX.burst('spark', o.x * TILE + 8, o.y * TILE - 14, 4, 30);
    const pirates = !this.open() && Foes.list.filter(f => !f.def.crew && f.def.human);
    if (pirates && pirates.length) { Foes.alertNear(o.x * TILE + 8, o.y * TILE + 8, 220); return UI.say(null, 'The parrot fixes you with one beady eye. "INTRUDER! INTRUDER! SQUAWK!"'); }
    const lines = ['"Pieces of eight! Pieces of eight!"', '"Pretty bird! Pretty bird!"', '"Mind the boom! Mind the boom!"', '"Who stole the rum? SQUAWK!"', '"Farmer! Farmer! Ha ha ha!"', '"Wash your hands! Wash your hands!"', '"Captain Polly! Captain Polly!" (It seems to think it is in charge.)'];
    UI.say(null, 'The parrot bobs its head. ' + lines[Math.floor(Math.random() * lines.length)]);
  },
  capstan(o) { o.shake = 0.3; Sfx.play('thud'); UI.say(null, 'You lean on a capstan bar with all your weight. It creaks a quarter of an inch. Raising the anchor takes eight sailors, or one very determined ox.'); },
  log() {
    Sfx.play('page' in Sfx.SOUNDS ? 'page' : 'click');
    if (this.open()) return UI.say(null, 'The new captain\'s log, in a neat square hand: "Day 41 as an honest ship. Sold six barrels of salt fish, two cannon to a lighthouse keeper (?), one ship in a bottle to a weeping man. Morale: good. Cat: fat."');
    UI.say(null, 'Vane\'s log, salt-stained. Most of it is weather and money. One line is underlined twice: "The Crown is gone and nobody told the sea. We are still hauling. Who for?"');
  },
  chest() {
    const st = this.st();
    if (st.chest) return UI.say(null, 'Empty, except for a moth and a very old biscuit.');
    st.chest = true;
    S.gold += 900; [['ship_bottle', 1], ['pearl', 2]].forEach(([id, n]) => { const left = Inv.add(id, n, 0, true); if (left) S.storage[Storage.slotKey(id, 0)] = (S.storage[Storage.slotKey(id, 0)] || 0) + left; });
    Sfx.play('victory'); VFX.burst('star', Player.x, Player.y - 20, 16, 50);
    UI.say(null, 'The captain\'s sea chest creaks open. Inside, wrapped in an old flag: 900 gold, two pearls, and a tiny Red Gull in a bottle.');
  },

  // ---- The treasure map ------------------------------------------------------------------
  readMap() {
    const st = this.st();
    if (st.x) return UI.say(null, `You already have an X to dig up: ${st.x.hint}. One treasure at a time.`);
    const m = World.maps.gullsteeth;
    if (!m) return;
    const marks = [['the old graves', ISLE_SPOTS.graves], ['the roofless chapel', ISLE_SPOTS.chapel], ['the fallen cottages', ISLE_SPOTS.shacks], ['the broken tower', ISLE_SPOTS.tower], ['the wreck on the sand', ISLE_SPOTS.wreck]];
    for (let i = 0; i < 400; i++) {
      const [name, at] = marks[Math.floor(Math.random() * marks.length)], dx = Math.floor(Math.random() * 11) - 5, dy = Math.floor(Math.random() * 11) - 5, x = at[0] + dx, y = at[1] + dy;
      if (Math.abs(dx) + Math.abs(dy) < 3) continue;
      const g = World.g(m, x, y);
      if ((g !== T.G && g !== T.S) || World.solid(m, x, y) || World.at(m, x, y) || World.warpAt(m, x, y)) continue;
      const p = World.path(m, 30, 35, x, y);
      if (!p || !p.length) continue;
      const way = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'east' : 'west') : (dy > 0 ? 'south' : 'north');
      st.x = { x, y, hint: `a few steps ${way} of ${name} on Gull's Teeth` };
      break;
    }
    if (!st.x) return toast('The map is too smudged to read. Try another.');
    Inv.remove('treasure_map', 1); st.maps++;
    if (Player.map === m) this.syncX(m);
    Sfx.play('discover');
    UI.say(null, `The map shows Gull's Teeth. Someone has drawn a red X ${st.x.hint.replace(' on Gull\'s Teeth', '')}, and a little skull beside it, which is either a warning or a joke.`);
  },
  syncX(m) {
    const st = this.st(), spot = [...m.objs.values()].find(o => o.type === 'rgx');
    if (st.x && !spot && !World.at(m, st.x.x, st.x.y)) World.add(m, 'rgx', st.x.x, st.x.y);
    if (!st.x && spot) World.remove(m, spot);
  },
  dig(o) {
    if (!Inv.count('hoe')) { toast('You need a hoe to dig.'); Sfx.play('deny'); return; }
    const st = this.st();
    st.x = null; World.remove(Player.map, o);
    const hoard = Math.random() < 0.12, gold = (hoard ? 2500 : 0) + 500 + Math.floor(Math.random() * 1300);
    const table = ['pearl', 'token_gale', 'token_storm', 'gold_ore', 'amethyst', 'ship_bottle', 'grog'], pick = () => table[Math.floor(Math.random() * table.length)];
    const finds = [[pick(), 1], [pick(), 1]]; if (hoard) finds.push(['token_moon', 1]);
    S.gold += gold;
    finds.forEach(([id, n]) => { if (!ITEMS[id]) return; const left = Inv.add(id, n, 0, true); if (left) S.storage[Storage.slotKey(id, 0)] = (S.storage[Storage.slotKey(id, 0)] || 0) + left; });
    Sfx.play('hoe'); Sfx.play('victory'); VFX.burst('star', o.x * TILE + 8, o.y * TILE, hoard ? 40 : 20, 60);
    Memory.deed('rg_treasure_' + st.maps, 'Dug up pirate treasure on Gull\'s Teeth.', { gossip: true });
    const what = finds.filter(([id]) => ITEMS[id]).map(([id, n]) => `${n} ${ITEMS[id].name}`).join(', ');
    UI.say(null, hoard ? `Your hoe strikes iron. A captain's strongbox, packed tight! ${gold} gold, and ${what}. Someone, long ago, was very rich and very forgetful.` : `Your hoe hits wood. A small sea chest, crusted with salt. Inside: ${gold} gold and ${what}.`);
  },
};

Object.assign(Actions, {
  rgfire: o => RedGull.fire(o), rgwheel: o => RedGull.wheel(o), rgbell: o => RedGull.bell(o), rgparrot: o => RedGull.parrot(o),
  rgcapstan: o => RedGull.capstan(o), rglog: () => RedGull.log(), rgchest: () => RedGull.chest(), rgdig: o => RedGull.dig(o),
});

// ---- The new crew ----------------------------------------------------------------------
const RG_HAND_LOOK = { skin: '#c99a72', skinD: '#a87c58', hair: '#3a2a1a', hairD: '#2a1a10', style: 'short', hat: 'bandana', hatC: '#b23a3a', hatD: '#8a2a2a', shirt: '#e8e0d0', shirtD: '#c4baa6', belt: '#3a2414', pants: '#3f5a7a', pantsD: '#2c4058', shoes: '#2a1a12' };
const RG_HAND2_LOOK = { skin: '#8a5a3a', skinD: '#6a4228', hair: '#1a1210', hairD: '#100a08', style: 'short', hat: 'bandana', hatC: '#2a6ab0', hatD: '#1a4a80', patch: true, beard: '#1a1210', shirt: '#6a8a5a', shirtD: '#4a6a3a', belt: '#3a2414', pants: '#5a4a38', pantsD: '#44382a', shoes: '#2a1a12' };
const RG_GUNNER_LOOK = { skin: '#e0b088', skinD: '#c09068', hair: '#c8a040', hairD: '#a08030', style: 'messy', hat: 'cap', hatC: '#3a3a44', hatD: '#2a2a32', shirt: '#7a6a55', shirtD: '#5a4a38', belt: '#2a1a10', pants: '#3a3a44', pantsD: '#2a2a32', shoes: '#1a1210' };
const RG_BOSUN_LOOK = { skin: '#b07850', skinD: '#905a38', hair: '#5a4a3a', hairD: '#3a2a1a', style: 'bald', beard: '#8a8478', shirt: '#2a3a5a', shirtD: '#1a2a44', belt: '#c9a040', pants: '#3a3030', pantsD: '#2a2020', shoes: '#1a1210' };
Object.assign(FOES, {
  rg_hand: Object.assign({}, FOES.pirate, { name: 'Red Gull Deckhand', crew: true, look: RG_HAND_LOOK, drops: [['grog', 1, 1, 0.3]] }),
  rg_hand2: Object.assign({}, FOES.pirate, { name: 'Red Gull Topman', crew: true, look: RG_HAND2_LOOK, drops: [['hardtack', 1, 2, 0.4]] }),
  rg_gunner: Object.assign({}, FOES.gunner, { name: 'Red Gull Gunner', crew: true, look: RG_GUNNER_LOOK, drops: [] }),
  rg_bosun: Object.assign({}, FOES.brute, { name: 'Bosun Grell', crew: true, look: RG_BOSUN_LOOK, drops: [['pearl', 1, 1, 0.25]] }),
});

// The quartermaster and the cook: real people with things to sell.
npc({
  id: 'corrigan', name: 'Mags Corrigan', role: 'Captain of the Red Gull', remote: true,
  gone: () => !RedGull.open(),
  look: { skin: '#d8a880', skinD: '#b88860', hair: '#2a1a14', hairD: '#1a100a', style: 'long', hat: 'tricorn', hatC: '#2a2024', hatD: '#181216', hatL: '#e8c040', skull: true, shirt: '#9a2a2a', shirtD: '#701a1a', cape: '#701a1a', belt: '#c9a040', pants: '#2a2a32', pantsD: '#1a1a22', shoes: '#1a1210' },
  sched: [[0, 'redgull', 15, 8]],
  loves: ['ship_bottle', 'pearl', 'gold_ore'], likes: ['kind:fish', 'kind:gift', 'grog'], hates: ['smoke_vial', 'kind:forage'],
  greet: ['Welcome aboard the Red Gull. Honest ship now. Mostly.', 'The farmer! Come to sink us again?', 'Wipe your boots. Bosun Grell has just done the deck.'],
  chat: [
    { h: 0, t: 'I was Vane\'s quartermaster for eleven years. Now I am captain, and I have learned that a captain mostly does sums.' },
    { h: 2, t: 'We carry salt fish, pearls and cloth now, island to island. The crew grumbled for a week. Then they got paid on time, and stopped.' },
    { h: 4, t: 'I kept the cages. They are in the hold, rusting. I go down sometimes and look at them, so I remember what we were.' },
  ],
  reactions: [],
  extra(opts) {
    opts.push({ text: 'Trade', fn: () => (RedGull.angry() ? UI.say('corrigan', 'Trade? You just put steel into one of my crew. Come back tomorrow, when I have stopped wanting to throw you overboard.') : UI.push(UI.shop('rg_quarter', 'corrigan'))) });
    opts.push({ text: 'Ask about Vane', fn: () => UI.say('corrigan', RedGull.vaneLine()) });
  },
});
npc({
  id: 'cookie', name: 'Cookie Dunmore', role: 'Ship\'s cook', remote: true,
  gone: () => !RedGull.open(),
  look: { skin: '#f0c49a', skinD: '#d9a678', hair: '#d8d4cc', hairD: '#b4b0a8', style: 'bald', beard: '#d8d4cc', patch: true, shirt: '#e8e0d0', shirtD: '#c4baa6', apron: '#ffffff', belt: '#5a3a20', pants: '#5a4a38', pantsD: '#44382a', shoes: '#2a1a12' },
  sched: [[0, 'redgull', 27, 13]],
  loves: ['pirate_stew', 'potato', 'tuna'], likes: ['kind:crop', 'kind:fish', 'kind:food'], hates: ['hardtack'],
  greet: ['Hungry? Course you are. Everybody is hungry at sea. It is the air.', 'Stew\'s on. Stew is always on.', 'Mind the pot. It bites.'],
  chat: [
    { h: 0, t: 'Thirty years a ship\'s cook. You know what sailors want? Hot, salty and lots of it. Same as the sea.' },
    { h: 2, t: 'Valley potatoes! Proper ones, with dirt on. You could make a grown pirate weep. I have. Twice.' },
    { h: 4, t: 'Lost the eye to a flying pan in a storm. My own pan. I was very proud of that pan.' },
  ],
  reactions: [],
  extra(opts) { opts.push({ text: 'Trade', fn: () => (RedGull.angry() ? UI.say('cookie', 'No stew for crew-cutters. Tomorrow, maybe, if you say sorry nicely.') : UI.push(UI.shop('rg_galley', 'cookie'))) }); },
});

// Background crew: musicians, dancers, a helmsman, gamblers, a fisher, two old salts.
(() => {
  const L = (skin, hair, style, shirt, pants, more) => Object.assign({ skin: skin[0], skinD: skin[1], hair: hair[0], hairD: hair[1], style, shirt: shirt[0], shirtD: shirt[1], belt: '#3a2414', pants: pants[0], pantsD: pants[1], shoes: '#2a1a12' }, more || {});
  const SK = [['#f0c49a', '#d9a678'], ['#c99a72', '#a87c58'], ['#8a5a3a', '#6a4228'], ['#e0b088', '#c09068']];
  const when = () => RedGull.lively();
  Object.assign(EXTRAS, {
    rg_singer: { map: 'redgull', name: 'Shanty Singer', look: L(SK[1], ['#b23a3a', '#8a2a2a'], 'messy', ['#e8e0d0', '#c4baa6'], ['#3f5a7a', '#2c4058'], { hat: 'bandana', hatC: '#e8c040', hatD: '#a08020' }), at: [16, 13], dir: DIRS.down, night: true, when, music: '#f0d070', prop: 'squeeze', sound: 'squeeze',
      lines: ['Oh, the Red Gull sails at dawn, me boys, and the Red Gull sails at night...', 'Requests? I know four songs. They are all about the sea.', 'Sing along! The chorus is just "heave". You can manage "heave".'] },
    rg_fiddler: { map: 'redgull', name: 'Ship\'s Fiddler', look: L(SK[3], ['#e8d8a8', '#c8b888'], 'long', ['#2a6ab0', '#1a4a80'], ['#3a3030', '#2a2020'], { hat: 'tricorn', hatC: '#3a2a20', hatD: '#2a1a14', hatL: '#a07a4c' }), at: [19, 13], dir: DIRS.down, night: true, when, music: '#c8f0d8', prop: 'fiddle', sound: 'fiddle',
      lines: ['This fiddle has been round the world twice. I have been round once. It went without me the second time.', 'A jig! Everyone jig!', 'You tap your foot like a farmer. That is a compliment.'] },
    rg_dance1: { map: 'redgull', name: 'Dancing Sailor', look: L(SK[2], ['#1a1210', '#100a08'], 'short', ['#e8e0d0', '#c4baa6'], ['#6a2a2a', '#4a1a1a'], { hat: 'bandana', hatC: '#3a8a4a', hatD: '#2a6a3a' }), dance: { cx: 17, cy: 11, r: 16, speed: 2.2, phase: 0 }, night: true, when,
      lines: ['Hornpipe! Arms folded, knees up!', 'Cannot stop! If I stop, I fall over!'] },
    rg_dance2: { map: 'redgull', name: 'Dancing Sailor', look: L(SK[0], ['#c87a48', '#a0582c'], 'bun', ['#b23a3a', '#8a2a2a'], ['#3f5a7a', '#2c4058']), dance: { cx: 17, cy: 11, r: 16, speed: 2.2, phase: 3.14 }, night: true, when,
      lines: ['Take a turn with us!', 'Mind my toes! Mind YOUR toes!'] },
    rg_helm: { map: 'redgull', name: 'Helmsman', look: L(SK[1], ['#5a4a3a', '#3a2a1a'], 'short', ['#2a3a5a', '#1a2a44'], ['#3a3030', '#2a2020'], { hat: 'tricorn', hatC: '#2a2024', hatD: '#181216', hatL: '#c9a040', beard: '#5a4a3a' }), at: [7, 12], dir: DIRS.up, night: true, when,
      lines: ['Steady as she goes.', 'At anchor, I steer by the stars anyway. Practice.', 'Do not touch the wheel. Everybody touches the wheel.'] },
    rg_dice1: { map: 'redgull', name: 'Gambling Sailor', look: L(SK[3], ['#3a2a1a', '#2a1a10'], 'messy', ['#6a8a5a', '#4a6a3a'], ['#5a4a38', '#44382a'], { hat: 'bandana', hatC: '#2a2024', hatD: '#181216' }), at: [32, 13], dir: DIRS.right, night: true, when, prop: 'dice', pair: 'rg_dice2',
      lines: ['Snake eyes again! These dice are cursed.', 'Want in? Two coppers. No, you cannot check the dice.'] },
    rg_dice2: { map: 'redgull', name: 'Gambling Sailor', look: L(SK[2], ['#d8d4cc', '#b4b0a8'], 'bald', ['#e8e0d0', '#c4baa6'], ['#3a3a44', '#2a2a32'], { patch: true, beard: '#d8d4cc' }), at: [34, 13], dir: DIRS.left, night: true, when, prop: 'dice',
      lines: ['He owes me four hundred coppers. On paper. The paper is in the sea.', 'Shh. I am winning.'] },
    rg_fisher: { map: 'redgull', name: 'Fishing Sailor', look: L(SK[0], ['#e8c040', '#c8a020'], 'short', ['#3a8aa0', '#2a6a80'], ['#5a4a38', '#44382a'], { hat: 'straw' }), at: [31, 15], dir: DIRS.down, when, prop: 'rod',
      lines: ['Off duty. Fishing for supper.', 'Caught a boot this morning. Nice boot. Wrong foot.', 'Shh. They can hear you through the hull.'] },
    rg_salt1: { map: 'redgull', name: 'Old Salt', look: L(SK[1], ['#d8d4cc', '#b4b0a8'], 'short', ['#5a4a38', '#44382a'], ['#3a3030', '#2a2020'], { beard: '#d8d4cc', hat: 'cap', hatC: '#2a3a5a', hatD: '#1a2a44' }), at: [4, 14], dir: DIRS.right, night: true, when, pair: 'rg_salt2',
      lines: ['Forty years at sea. Forty years! And I still cannot swim.', 'In my day, the sea was saltier.'] },
    rg_salt2: { map: 'redgull', name: 'Old Salt', look: L(SK[3], ['#8a8478', '#6a6458'], 'bald', ['#7a3a2a', '#5a2a1a'], ['#3f5a7a', '#2c4058'], { beard: '#8a8478', patch: true }), at: [6, 14], dir: DIRS.left, night: true, when,
      lines: ['Do not listen to him. The sea was exactly as salty.', 'I sailed with Vane\'s father. Now there was a man who could not sing.'] },
    rg_bilge: { map: 'hold', name: 'Bilge Pumper', look: L(SK[2], ['#3a2a1a', '#2a1a10'], 'messy', ['#8a8478', '#6a6458'], ['#5a4a38', '#44382a']), at: [11, 8], dir: DIRS.down, night: true, when,
      lines: ['Pump, pump, pump. The sea gets in. I put it back. Forever.', 'Mags says it builds character. I have loads of character now.', 'Mind the cages. We keep them to remember. Do not ask me to remember out loud.'] },
  });
  Object.assign(GOSSIP, {
    rg_salt1: [['rg_salt1', 'Remember the storm off the Teeth?'], ['rg_salt2', 'Which one?'], ['rg_salt1', 'The big one.'], ['rg_salt2', 'They were all big ones.'], ['rg_salt1', 'This one had a whale in it.'], ['rg_salt2', '...Ah. That one.']],
    rg_dice1: [['rg_dice1', 'Seven! Pay up.'], ['rg_dice2', 'That was a six that fell over.'], ['rg_dice1', 'That is what a seven is.'], ['rg_dice2', 'Double or nothing.']],
  });
  // Background people with a condition only show while it holds.
  const here = Extras.here.bind(Extras);
  Extras.here = p => (p.e.when && !p.e.when() ? false : here(p));
  // Crewmen speak with their own names and faces.
  const speaker = UI.speaker.bind(UI);
  UI.speaker = who => (typeof who === 'string' && who.startsWith('rgcrew_') && FOES[who.slice(7)] ? { name: FOES[who.slice(7)].name, id: who, look: FOES[who.slice(7)].look } : speaker(who));
  // Shops.
  const stock = UI.stock.bind(UI);
  UI.stock = kind => (kind === 'rg_quarter' ? [{ id: 'treasure_map', price: 1200 }, { id: 'ship_bottle', price: 650 }, { id: 'token_gale', price: 260 }, { id: 'token_storm', price: 280 }, { id: 'smoke_vial', price: 120 }, { id: 'pearl', price: 700 }, { id: 'cutlass', price: 1500, once: true }]
    : kind === 'rg_galley' ? [{ id: 'grog', price: 90 }, { id: 'hardtack', price: 30 }, { id: 'pirate_stew', price: 240 }, { id: 'rum_cake', price: 200 }]
      : stock(kind));
  // The treasure map is read by using it.
  const useHeld = Player.useHeld;
  Player.useHeld = function (fromMouse) { const s = Inv.held(); if (s && s.id === 'treasure_map') return RedGull.readMap(); return useHeld.call(this, fromMouse); };
  // A friendly crewman is someone to talk to, not just someone to fight.
  const scan = Interact.scan.bind(Interact);
  Interact.scan = function () {
    const base = scan();
    if (!Player.map || Player.map.id !== 'redgull' || !RedGull.lively()) return base;
    const t = Player.target(), cx = t.x * TILE + 8, cy = t.y * TILE + 8;
    const near = RedGull.crewHere().filter(f => Math.hypot(f.x - Player.x, f.y - Player.y) < 30).sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy))[0];
    const crewD = near && Math.hypot(near.x - cx, near.y - 6 - cy), baseD = base ? Math.hypot(base.tile[0] * TILE + 8 - cx, base.tile[1] * TILE + 8 - cy) : Infinity;
    if (!near || crewD >= baseD || crewD > 20) return base;
    return { tile: [Math.floor(near.x / TILE), Math.floor(near.y / TILE)], label: 'Talk to ' + near.def.name, ax: near.x, ay: near.y - 34, run: () => RedGull.chat(near) };
  };
  // Calm until struck. Strike one, and it is everyone.
  const calm = Foes.isCalm.bind(Foes);
  Foes.isCalm = f => (f.def.crew ? !RedGull.angry() : calm(f));
  const damage = Foes.damage.bind(Foes);
  Foes.damage = function (f, ...rest) { if (f && f.def && f.def.crew && !f.arena && !RedGull.angry()) RedGull.provoke(); return damage(f, ...rest); };
})();

// ---- Sounds and music ------------------------------------------------------------------
(() => {
  const { bell, ftone, knock, tick } = Sfx.kit;
  Object.assign(Sfx.SOUNDS, {
    shipbell() { bell(this, 880, 2.2, 0.12); bell(this, 1320, 1.6, 0.05, 0.01); bell(this, 880, 2, 0.08, 0.45); },
    squawk() { ftone(this, 1400, 0.12, 'sawtooth', 0.05, 0, 600, 3200, 0.004); ftone(this, 1700, 0.16, 'square', 0.04, 0.13, -700, 3000, 0.004); ftone(this, 1200, 0.1, 'sawtooth', 0.03, 0.3, 500, 2800, 0.004); },
    rgwheel() { for (let i = 0; i < 7; i++) tick(this, 1800 + i * 90, 0.05, i * 0.07); knock(this, 300, 0.3, 0.04, 0, 2); },
    squeeze() { const r = [294, 370, 440, 587][Math.floor(Math.random() * 4)]; ftone(this, r, 0.5, 'sawtooth', 0.022, 0, 0, 1400, 0.08); ftone(this, r * 1.5, 0.5, 'square', 0.012, 0, 0, 1600, 0.08); },
    fiddle() { const r = [587, 659, 740, 880][Math.floor(Math.random() * 4)]; ftone(this, r, 0.22, 'sawtooth', 0.025, 0, 6, 2600, 0.03); ftone(this, r * 1.122, 0.22, 'sawtooth', 0.02, 0.22, -6, 2600, 0.03); },
  });
  Sfx.THEMES.shanty = { bpm: 150, bar: 6, root: 62, scale: 'mixo', prog: [0, 6, 0, 4], lead: ['triangle', 0.05, 12, 0.5], bass: '1.51.5', arp: '135', drums: { k: 'x..x..', s: '...x..', h: 'x.xx.x' }, echo: 0.2, seed: 88 };
  Sfx.BEDS.shanty = { waves: [4, 6], creak: [6, 12], gulls: [6, 14], crowd: [5, 9] };
  // The ship's places sing a shanty once she has a happy crew aboard.
  ['redgull', 'hold', 'rgcabin'].forEach(id => Object.defineProperty(Sfx.PLACES, id, { get: () => (RedGull.lively() ? 'shanty' : 'pirates'), configurable: true, enumerable: true }));
})();

// ---- Art -------------------------------------------------------------------------------
(() => {
  const { mk, P, outlined, STATIC } = Art;
  const line = (g, x0, y0, x1, y1, c, w = 1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) P(g, c, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), w, 1); };
  // A square sail hanging from its yard, bellied out by the wind, patched here and there.
  const sail = (g, x, y, w, h, seed, emblem) => {
    P(g, '#4a301d', x - 4, y - 3, w + 8, 3); P(g, '#6f4c30', x - 4, y - 3, w + 8, 1);
    for (let i = 0; i < w; i++) {
      const belly = Math.round(Math.sin(Math.PI * i / (w - 1)) * 5), edge = i < 3 || i >= w - 3;
      P(g, edge ? '#c4baa6' : i < w / 3 ? '#efe8d8' : '#e2d8c4', x + i, y, 1, h + belly);
      P(g, '#b0a690', x + i, y + h + belly - 2, 1, 2);
      if (i % 9 === 4) P(g, '#d4c8b0', x + i, y, 1, h + belly - 2);
    }
    const r = mulberry(seed);
    for (let k = 0; k < 3; k++) { const px = x + 4 + Math.floor(r() * (w - 14)), py = y + 4 + Math.floor(r() * (h - 12)); P(g, k % 2 ? '#d8c8a0' : '#e8dcc0', px, py, 6, 5); P(g, '#b0a690', px, py + 5, 6, 1); }
    // Reef points: little ties in a row.
    for (let i = 4; i < w - 4; i += 5) P(g, '#a09680', x + i, y + 5, 1, 2);
    if (emblem) {
      const G = ['#.........#', '##.......##', '.###...###.', '...#####...', '....###....', '.....#.....'], cx = x + Math.floor(w / 2) - 11, cy = y + Math.floor(h / 2) - 4;
      G.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') P(g, '#b23a3a', cx + i * 2, cy + j * 2, 2, 2); }));
    }
  };
  // Shrouds and ratlines: two ropes each side from the masthead to the deck, with rungs between.
  const shrouds = (g, cx, top, W, H) => {
    [-1, 1].forEach(sd => {
      const a0 = cx + sd * 3, b0 = cx + sd * 6, aF = sd < 0 ? 7 : W - 8, bF = aF + sd * 4, bot = H - 4;
      line(g, a0, top, aF, bot, '#3a2a1a'); line(g, b0, top, bF, bot, '#3a2a1a');
      for (let y = top + 8; y < bot - 2; y += 6) { const f = (y - top) / (bot - top); line(g, Math.round(a0 + (aF - a0) * f), y, Math.round(b0 + (bF - b0) * f), y, '#6a5440'); }
    });
  };
  const pole = (g, cx, top, H) => { P(g, '#6f4c30', cx - 2, top, 5, H - top); P(g, '#8a6239', cx - 2, top, 1, H - top); P(g, '#4a301d', cx + 2, top, 1, H - top); P(g, '#c9a040', cx - 2, top - 2, 5, 2); };
  const nest = (g, cx, y, lookout) => {
    if (lookout) { P(g, '#c99a72', cx - 3, y - 7, 6, 6); P(g, '#b23a3a', cx - 4, y - 9, 8, 3); P(g, '#2a1a12', cx, y - 5, 1, 1); P(g, '#c9a040', cx + 3, y - 6, 9, 2); P(g, '#8a6239', cx + 11, y - 7, 2, 4); }
    P(g, '#5a3a20', cx - 10, y, 20, 9); P(g, '#7a5535', cx - 10, y, 20, 2); P(g, '#3a2414', cx - 10, y + 8, 20, 1); for (let i = cx - 9; i < cx + 10; i += 4) P(g, '#4a301d', i, y + 2, 1, 6);
  };
  const pinrail = (g, cx, H) => { P(g, '#5a3a20', cx - 14, H - 14, 28, 3); for (let i = cx - 12; i < cx + 14; i += 5) { P(g, '#c8b088', i, H - 18, 2, 4); P(g, '#a08050', i - 1, H - 11, 4, 3); } };
  const mainmast = lookout => outlined(mk(104, 164, g => {
    const cx = 52, H = 164;
    shrouds(g, cx, 30, 104, H); pole(g, cx, 6, H);
    nest(g, cx, 20, lookout);
    sail(g, 22, 38, 60, 32, 11);
    sail(g, 10, 80, 84, 42, 23, true);
    pinrail(g, cx, H);
  }));
  STATIC.rgmain = () => mainmast(false);
  STATIC.rgmainlive = () => mainmast(true);
  STATIC.rgfore = () => outlined(mk(92, 148, g => {
    const cx = 46, H = 148;
    shrouds(g, cx, 30, 92, H); pole(g, cx, 8, H);
    nest(g, cx, 22, false);
    sail(g, 20, 40, 52, 26, 37);
    sail(g, 8, 74, 76, 38, 41);
    pinrail(g, cx, H);
  }));
  // The mizzen carries a fore-and-aft sail, swept back toward the stern.
  STATIC.rgmizzen = () => outlined(mk(84, 128, g => {
    const cx = 62, H = 128;
    for (let k = 0; k < 2; k++) line(g, cx + 3 + k * 3, 24, 78 + k * 3, H - 4, '#3a2a1a');
    for (let y = 32; y < H - 6; y += 6) { const f = (y - 24) / (H - 28); line(g, Math.round(cx + 3 + (75) * f * 0.2), y, Math.round(cx + 6 + 75 * f * 0.2), y, '#6a5440'); }
    // Gaff up and back from the mast, boom along the bottom, sail between.
    const gaffY = x => 18 - 12 * (cx - x) / (cx - 14), boomY = x => 96 + 2 * (cx - x) / (cx - 8);
    for (let x = 8; x < cx - 2; x++) {
      const top = Math.round(x >= 14 ? gaffY(x) : 6 + (14 - x) * 92 / 6), bot = Math.round(boomY(x));
      for (let y = top; y < bot; y++) P(g, x < 16 || y < top + 2 ? '#c4baa6' : y > 50 && y < 57 ? '#b23a3a' : (x + y) % 13 === 0 ? '#d4c8b0' : x > cx - 12 ? '#e2d8c4' : '#efe8d8', x, y, 1, 1);
    }
    line(g, cx, 18, 14, 6, '#4a301d', 2); line(g, cx, 96, 8, 98, '#4a301d', 2);
    pole(g, cx, 6, H);
    pinrail(g, cx, H);
  }));
  // Cannons: one set pointing out over the north rail, one toward you over the south rail.
  STATIC.rgcannonn = () => outlined(mk(20, 22, g => {
    P(g, '#5a3a20', 3, 12, 14, 8); P(g, '#7a5535', 3, 12, 14, 2); P(g, '#2a1a12', 2, 13, 3, 4); P(g, '#2a1a12', 15, 13, 3, 4); P(g, '#2a1a12', 2, 18, 3, 3); P(g, '#2a1a12', 15, 18, 3, 3);
    P(g, '#3c3c46', 7, 2, 6, 14); P(g, '#6a6a76', 8, 3, 1, 12); P(g, '#24242c', 6, 1, 8, 3); P(g, '#0a0a0e', 9, 1, 2, 1); P(g, '#24242c', 6, 14, 8, 2);
  }));
  STATIC.rgcannons = () => outlined(mk(20, 20, g => {
    P(g, '#5a3a20', 3, 2, 14, 8); P(g, '#7a5535', 3, 2, 14, 2); P(g, '#2a1a12', 2, 3, 3, 4); P(g, '#2a1a12', 15, 3, 3, 4);
    P(g, '#3c3c46', 6, 5, 8, 10); P(g, '#6a6a76', 7, 6, 1, 7); P(g, '#24242c', 5, 13, 10, 5); P(g, '#0a0a0e', 8, 14, 4, 3); P(g, '#2a1a12', 2, 15, 3, 4); P(g, '#2a1a12', 15, 15, 3, 4);
  }));
  STATIC.rgballs = () => outlined(mk(14, 10, g => { [[1, 5], [5, 5], [9, 5], [3, 2], [7, 2], [5, -1]].forEach(([x, y]) => { P(g, '#24242c', x, y + 1, 4, 4); P(g, '#55555f', x + 1, y + 1, 1, 1); }); }));
  STATIC.rgwheel = () => outlined(mk(26, 32, g => {
    P(g, '#4a301d', 11, 18, 4, 12); P(g, '#5a3a20', 6, 28, 14, 4); P(g, '#7a5535', 6, 28, 14, 1);
    const cx = 13, cy = 11;
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; for (let r = 0; r <= 12; r++) P(g, r > 9 ? '#c9a040' : '#6f4c30', Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1); P(g, '#c9a040', Math.round(cx + Math.cos(a) * 12) - 1, Math.round(cy + Math.sin(a) * 12) - 1, 2, 2); }
    for (let a = 0; a < 6.3; a += 0.08) { P(g, '#8a6239', Math.round(cx + Math.cos(a) * 8), Math.round(cy + Math.sin(a) * 8), 1, 1); P(g, '#5a3a20', Math.round(cx + Math.cos(a) * 9), Math.round(cy + Math.sin(a) * 9), 1, 1); }
    P(g, '#c9a040', cx - 2, cy - 2, 4, 4); P(g, '#f0d070', cx - 1, cy - 1, 1, 1);
  }));
  STATIC.rgbell = () => outlined(mk(20, 32, g => {
    P(g, '#5a3a20', 2, 4, 3, 28); P(g, '#5a3a20', 15, 4, 3, 28); P(g, '#6f4c30', 1, 2, 18, 3); P(g, '#8a6239', 1, 2, 18, 1);
    P(g, '#c9a040', 7, 6, 6, 3); P(g, '#c9a040', 6, 9, 8, 6); P(g, '#e0b050', 5, 15, 10, 3); P(g, '#a07a28', 5, 17, 10, 1); P(g, '#f0d070', 7, 9, 1, 6); P(g, '#3c3c46', 9, 18, 2, 2);
    P(g, '#c8b088', 10, 20, 1, 8); P(g, '#a08050', 9, 27, 3, 2);
  }));
  STATIC.rgparrot = () => outlined(mk(18, 32, g => {
    P(g, '#5a3a20', 8, 12, 2, 20); P(g, '#5a3a20', 4, 30, 10, 2); P(g, '#6f4c30', 2, 11, 14, 2);
    P(g, '#d43a2a', 6, 2, 6, 9); P(g, '#e85a40', 7, 2, 4, 3); P(g, '#2a8ad0', 5, 5, 2, 6); P(g, '#3ab04a', 11, 5, 2, 5); P(g, '#e8c040', 9, 9, 3, 2);
    P(g, '#d43a2a', 7, 11, 3, 6); P(g, '#2a6ab0', 8, 13, 2, 6); P(g, '#f0c040', 12, 4, 3, 2); P(g, '#2a2a32', 13, 5, 2, 2); P(g, '#ffffff', 9, 3, 2, 2); P(g, '#14100c', 10, 3, 1, 1);
    P(g, '#3a3a44', 7, 10, 1, 2); P(g, '#3a3a44', 10, 10, 1, 2);
  }));
  STATIC.rgcapstan = () => outlined(mk(26, 18, g => {
    P(g, '#6f4c30', 1, 6, 24, 2); P(g, '#6f4c30', 12, 0, 2, 14);
    P(g, '#5a3a20', 7, 5, 12, 11); P(g, '#7a5535', 7, 5, 12, 3); P(g, '#3a2414', 7, 10, 12, 1); P(g, '#c9a040', 11, 3, 4, 3);
  }));
  STATIC.rglantern = () => outlined(mk(12, 30, g => {
    P(g, '#4a301d', 5, 10, 2, 20); P(g, '#4a301d', 3, 28, 6, 2); P(g, '#3c3c46', 5, 2, 2, 2);
    P(g, '#2a2a32', 2, 3, 8, 2); P(g, '#ffd070', 3, 5, 6, 6); P(g, '#fff4b0', 4, 6, 2, 3); P(g, '#2a2a32', 2, 11, 8, 2); P(g, '#2a2a32', 2, 5, 1, 6); P(g, '#2a2a32', 9, 5, 1, 6);
  }));
  STATIC.rgstove = () => outlined(mk(22, 24, g => {
    P(g, '#8a3a2a', 1, 10, 20, 14); P(g, '#a04a3a', 1, 10, 20, 2); for (let y = 13; y < 24; y += 3) P(g, '#6a2a1a', 1, y, 20, 1); for (let y = 13; y < 24; y += 6) { P(g, '#6a2a1a', 6, y, 1, 3); P(g, '#6a2a1a', 14, y + 3, 1, 3); }
    P(g, '#1a1210', 6, 16, 10, 6); P(g, '#ff8a30', 7, 18, 8, 4); P(g, '#ffe070', 9, 19, 4, 2);
    P(g, '#2a2a32', 3, 3, 16, 8); P(g, '#3c3c46', 3, 3, 16, 2); P(g, '#8a5a3a', 4, 2, 14, 2); P(g, '#e8a050', 7, 2, 3, 1); P(g, '#2a2a32', 1, 5, 2, 2); P(g, '#2a2a32', 19, 5, 2, 2);
  }));
  STATIC.rgloot = () => outlined(mk(34, 22, g => {
    P(g, '#e8c040', 0, 15, 34, 7); P(g, '#c9a040', 0, 20, 34, 2); for (let i = 1; i < 33; i += 3) P(g, '#f7dd7a', i, 15 + (i % 2), 2, 1);
    P(g, '#5a3a20', 6, 6, 20, 12); P(g, '#7a5535', 6, 6, 20, 2); P(g, '#c9a040', 6, 10, 20, 1); P(g, '#c9a040', 15, 8, 3, 5);
    P(g, '#5a3a20', 6, 0, 20, 6); P(g, '#3a2414', 7, 1, 18, 4);
    P(g, '#e8c040', 8, 4, 16, 3); P(g, '#f7dd7a', 9, 4, 3, 1); P(g, '#d4405a', 12, 4, 2, 2); P(g, '#3a8ad0', 18, 5, 2, 2); P(g, '#3ab04a', 21, 4, 2, 2);
    P(g, '#e8c040', 27, 9, 4, 6); P(g, '#f7dd7a', 28, 9, 1, 3); P(g, '#e8c040', 26, 8, 6, 1); P(g, '#f0ece0', 2, 11, 3, 3); P(g, '#c8ccd4', 30, 17, 3, 2);
  }));
  STATIC.rgkeg = () => outlined(mk(18, 16, g => {
    P(g, '#5a3a20', 2, 13, 3, 3); P(g, '#5a3a20', 13, 13, 3, 3);
    P(g, '#8a5a30', 1, 3, 16, 11); P(g, '#a07040', 1, 3, 16, 3); P(g, '#3a3a44', 4, 3, 1, 11); P(g, '#3a3a44', 13, 3, 1, 11);
    P(g, '#6f4c30', 0, 5, 1, 7); P(g, '#c9a040', 7, 8, 4, 2); P(g, '#3a3a44', 8, 10, 2, 3); Font.draw(g, 'XXX', 5, 4, '#3a2414');
  }));
  STATIC.rgpowder = () => outlined(mk(14, 16, g => { P(g, '#2a2a32', 2, 2, 10, 14); P(g, '#3c3c46', 2, 2, 10, 2); P(g, '#b23a3a', 2, 6, 10, 2); P(g, '#b23a3a', 2, 12, 10, 1); P(g, '#f0ece0', 6, 9, 2, 2); P(g, '#c8b088', 6, 0, 2, 3); }));
  STATIC.rgcrates = () => outlined(mk(16, 28, g => {
    [[0, 12, 16], [2, 0, 12]].forEach(([x, y, w]) => { P(g, '#a07a4c', x, y, w, 14); P(g, '#c49a64', x, y, w, 2); P(g, '#7a5535', x, y + 13, w, 1); line(g, x + 1, y + 2, x + w - 2, y + 12, '#7a5535'); P(g, '#7a5535', x, y, 1, 14); P(g, '#7a5535', x + w - 1, y, 1, 14); });
  }));
  STATIC.rgmop = () => outlined(mk(16, 26, g => { P(g, '#a07a4c', 9, 2, 2, 18); P(g, '#e8e0d0', 6, 18, 8, 6); P(g, '#c4baa6', 6, 22, 8, 2); P(g, '#6a6a76', 1, 16, 7, 10); P(g, '#8a8a96', 1, 16, 7, 2); P(g, '#3a7ac0', 2, 17, 5, 1); }));
  STATIC.rgrope = () => mk(16, 16, g => { for (let r = 6; r > 0; r -= 2) for (let a = 0; a < 6.3; a += 0.15) P(g, r % 4 ? '#c8b088' : '#a08a60', Math.round(8 + Math.cos(a) * r), Math.round(9 + Math.sin(a) * r * 0.7), 1, 1); P(g, '#c8b088', 13, 10, 3, 1); });
  STATIC.rgnet = () => mk(16, 16, g => { P(g, '#6a5a40', 1, 5, 14, 9); for (let x = 1; x < 15; x += 3) P(g, '#a08a60', x, 5, 1, 9); for (let y = 6; y < 14; y += 3) P(g, '#a08a60', 1, y, 14, 1); P(g, '#e8c040', 3, 4, 3, 2); P(g, '#e8c040', 10, 12, 3, 2); P(g, '#e04050', 12, 5, 2, 2); });
  STATIC.rggrate = () => mk(16, 16, g => { P(g, '#3a2414', 1, 1, 14, 14); P(g, '#7a5535', 1, 1, 14, 1); for (let i = 2; i < 15; i += 3) { P(g, '#8a6239', i, 2, 1, 12); P(g, '#8a6239', 2, i, 12, 1); } });
  // The cabin.
  STATIC.rgwindow = () => mk(32, 32, g => {
    P(g, '#3a2414', 0, 2, 32, 30); P(g, '#c9a040', 1, 3, 30, 1); P(g, '#c9a040', 1, 30, 30, 1);
    for (let y = 5; y < 29; y++) P(g, y < 16 ? '#a8d8f0' : y < 18 ? '#e8f4f8' : '#3a7ab0', 2, y, 28, 1);
    P(g, '#2a6aa0', 2, 22, 28, 1); P(g, '#ffffff', 6, 8, 5, 1); P(g, '#ffffff', 18, 10, 6, 1); P(g, '#5a9ad0', 4, 25, 6, 1); P(g, '#5a9ad0', 18, 27, 8, 1);
    P(g, '#3a2414', 15, 4, 2, 26); P(g, '#3a2414', 2, 16, 28, 2); P(g, '#c9a040', 13, 0, 6, 3);
  });
  STATIC.rgdesk = () => outlined(mk(48, 30, g => {
    P(g, '#4a2614', 3, 16, 4, 14); P(g, '#4a2614', 41, 16, 4, 14); P(g, '#5a3018', 1, 12, 46, 6); P(g, '#7a4424', 1, 12, 46, 2); P(g, '#c9a040', 1, 17, 46, 1);
    P(g, '#e8d8a8', 8, 6, 22, 8); P(g, '#c8b888', 8, 13, 22, 1); P(g, '#7a9a5a', 12, 8, 6, 3); P(g, '#7a9a5a', 20, 9, 5, 2); line(g, 10, 12, 26, 7, '#b23a3a'); P(g, '#b23a3a', 26, 6, 2, 2);
    P(g, '#c9a040', 33, 8, 7, 5); P(g, '#f7dd7a', 35, 9, 3, 3); P(g, '#b23a3a', 36, 10, 1, 1);
    P(g, '#e8e0d0', 4, 4, 2, 9); P(g, '#ffe070', 4, 1, 2, 3); P(g, '#ff8a30', 4, 2, 2, 1); P(g, '#c9a040', 3, 12, 4, 1);
    P(g, '#f0ece0', 42, 8, 4, 4); P(g, '#2a2420', 43, 9, 1, 1); P(g, '#2a2420', 45, 9, 1, 1);
  }));
  STATIC.rgbunk = () => outlined(mk(32, 36, g => {
    P(g, '#4a2614', 0, 0, 32, 36); P(g, '#7a4424', 1, 1, 30, 2); P(g, '#9a2a2a', 0, 3, 5, 26); P(g, '#701a1a', 4, 3, 1, 26); P(g, '#9a2a2a', 27, 3, 5, 26); P(g, '#701a1a', 27, 3, 1, 26);
    P(g, '#f0ece0', 6, 6, 20, 7); P(g, '#b23a3a', 5, 12, 22, 18); P(g, '#c9a040', 5, 12, 22, 1); P(g, '#8a2a2a', 5, 28, 22, 2); P(g, '#5a3018', 0, 30, 32, 6); P(g, '#c9a040', 0, 30, 32, 1);
  }));
  STATIC.rgshelf = () => outlined(mk(16, 32, g => {
    P(g, '#4a2614', 0, 0, 16, 32); P(g, '#5a3018', 1, 1, 14, 30);
    [8, 16, 24].forEach(y => P(g, '#7a4424', 1, y, 14, 2));
    [['#3a7a5a', 2], ['#b23a3a', 6], ['#e8d8a8', 10]].forEach(([c, x]) => P(g, c, x, 3, 3, 5));
    P(g, '#e8d8a8', 2, 12, 12, 3); P(g, '#c8b888', 2, 12, 1, 3); P(g, '#e8d8a8', 3, 20, 10, 3); P(g, '#c9a040', 4, 26, 4, 4); P(g, '#f0ece0', 10, 26, 3, 4);
  }));
  STATIC.rgglobe = () => outlined(mk(14, 24, g => { P(g, '#4a2614', 5, 14, 4, 8); P(g, '#4a2614', 2, 21, 10, 3); P(g, '#c9a040', 1, 2, 2, 12); P(g, '#3a7ab0', 2, 2, 10, 11); P(g, '#7a9a5a', 4, 4, 3, 3); P(g, '#7a9a5a', 8, 8, 3, 3); P(g, '#a8d8f0', 3, 3, 2, 2); }));
  STATIC.rgchest = () => outlined(mk(20, 16, g => { P(g, '#5a3018', 1, 4, 18, 12); P(g, '#7a4424', 1, 4, 18, 2); P(g, '#5a3018', 1, 0, 18, 5); P(g, '#7a4424', 2, 0, 16, 2); P(g, '#c9a040', 1, 5, 18, 1); P(g, '#c9a040', 4, 0, 2, 16); P(g, '#c9a040', 14, 0, 2, 16); P(g, '#c9a040', 8, 6, 4, 4); P(g, '#2a1a10', 9, 8, 2, 1); }));
  STATIC.rgchestopen = () => outlined(mk(20, 18, g => { P(g, '#5a3018', 1, 0, 18, 6); P(g, '#3a1a0a', 2, 1, 16, 4); P(g, '#5a3018', 1, 6, 18, 12); P(g, '#2a1a10', 2, 6, 16, 4); P(g, '#c9a040', 1, 9, 18, 1); P(g, '#c9a040', 4, 6, 2, 12); P(g, '#c9a040', 14, 6, 2, 12); }));
  STATIC.rgrug = () => mk(64, 48, g => {
    P(g, '#8a2a2a', 2, 2, 60, 44); P(g, '#c9a040', 4, 4, 56, 1); P(g, '#c9a040', 4, 43, 56, 1); P(g, '#c9a040', 4, 4, 1, 40); P(g, '#c9a040', 59, 4, 1, 40);
    const cx = 32, cy = 24; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, r = k % 2 ? 9 : 16; line(g, cx, cy, Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.7), k % 2 ? '#e8d8a8' : '#e8c040'); }
    P(g, '#701a1a', cx - 2, cy - 2, 4, 4); for (let x = 3; x < 62; x += 3) { P(g, '#e8d8a8', x, 0, 1, 2); P(g, '#e8d8a8', x, 46, 1, 2); }
  });
  STATIC.rgswords = () => mk(16, 16, g => { P(g, '#4a2614', 2, 2, 12, 12); P(g, '#c9a040', 2, 2, 12, 1); line(g, 3, 13, 12, 3, '#d8dce4'); line(g, 12, 13, 3, 3, '#d8dce4'); P(g, '#c9a040', 4, 10, 3, 2); P(g, '#c9a040', 9, 10, 3, 2); });
  STATIC.rgportrait = () => mk(16, 16, g => { P(g, '#c9a040', 2, 1, 12, 14); P(g, '#3a4a3a', 3, 2, 10, 12); P(g, '#c99a72', 6, 5, 4, 4); P(g, '#2a2024', 5, 3, 6, 2); P(g, '#9a2a2a', 5, 9, 6, 5); P(g, '#e8c040', 6, 3, 4, 1); });
  STATIC.rgcoins = () => outlined(mk(16, 12, g => { P(g, '#e8c040', 2, 6, 12, 6); P(g, '#e8c040', 4, 3, 8, 3); P(g, '#e8c040', 6, 1, 4, 2); P(g, '#c9a040', 2, 10, 12, 2); for (let i = 3; i < 14; i += 3) P(g, '#f7dd7a', i, 6 + (i % 2) * 2, 1, 1); }));
  STATIC.rgrack = () => outlined(mk(16, 30, g => { P(g, '#4a2614', 0, 0, 16, 30); for (let y = 2; y < 28; y += 6) for (let x = 2; x < 14; x += 4) { P(g, '#2a4a2a', x, y, 3, 4); P(g, '#c43030', x + 1, y + 1, 1, 1); } }));
  // The hold.
  STATIC.rghammock = () => outlined(mk(32, 22, g => { P(g, '#5a3a20', 0, 0, 2, 22); P(g, '#5a3a20', 30, 0, 2, 22); line(g, 2, 4, 8, 10, '#c8b088'); line(g, 30, 4, 24, 10, '#c8b088'); for (let x = 8; x < 25; x++) { const d = Math.round(Math.sin(Math.PI * (x - 8) / 16) * 4); P(g, '#c8b888', x, 9 + d, 1, 5); P(g, '#a09068', x, 13 + d, 1, 1); } P(g, '#3a5a8a', 12, 10, 10, 3); }));
  STATIC.rgsacks = () => outlined(mk(16, 14, g => { P(g, '#c8b088', 1, 4, 8, 10); P(g, '#a08a60', 1, 12, 8, 2); P(g, '#c8b088', 7, 2, 8, 12); P(g, '#a08a60', 7, 12, 8, 2); P(g, '#8a7450', 9, 1, 4, 2); P(g, '#8a7450', 3, 3, 4, 2); }));
  STATIC.rgx = () => mk(16, 12, g => { P(g, '#c8b278', 3, 6, 10, 5); line(g, 3, 1, 12, 10, '#b23a3a', 2); line(g, 12, 1, 3, 10, '#b23a3a', 2); });

  // The captain's cabin from outside: a carved stern house under the poop deck.
  const cabin = night => outlined(mk(6 * 16 + 8, 72, g => {
    const W = 104;
    P(g, '#8a6239', 2, 6, W - 4, 14); for (let y = 8; y < 20; y += 4) P(g, '#6f4c30', 2, y, W - 4, 1);
    P(g, '#4a2614', 2, 4, W - 4, 3); P(g, '#c9a040', 2, 4, W - 4, 1);
    P(g, '#4a2614', 0, 18, W, 2); for (let x = 2; x < W - 2; x += 5) P(g, '#7a5535', x, 20, 2, 5); P(g, '#4a2614', 0, 25, W, 2); P(g, '#c9a040', 0, 18, W, 1);
    [8, W - 14].forEach(x => { P(g, '#3a2414', x + 2, 0, 2, 3); P(g, '#c9a040', x, 2, 6, 2); P(g, night ? '#fff4b0' : '#ffd070', x, 4, 6, 8); P(g, '#c9a040', x, 12, 6, 2); P(g, '#c9a040', x + 2, 4, 1, 8); });
    P(g, '#6a3a22', 0, 27, W, 45); P(g, '#7a4a2a', 0, 27, W, 2); P(g, '#c9a040', 0, 29, W, 1);
    for (let x = 0; x < W; x += 20) { P(g, '#4a2614', x, 30, 4, 42); P(g, '#c9a040', x, 30, 4, 2); }
    for (let y = 36; y < 70; y += 6) for (let x = 6; x < W; x += 20) P(g, '#5a3018', x, y, 12, 1);
    [[10, 38], [68, 38]].forEach(([x, y]) => {
      P(g, '#c9a040', x - 1, y - 1, 22, 16); P(g, night ? '#ffd070' : '#7ab8d8', x, y, 20, 14); P(g, night ? '#fff0b0' : '#b8e0f0', x + 1, y + 1, 4, 5);
      P(g, '#3a2414', x + 9, y, 2, 14); P(g, '#3a2414', x, y + 6, 20, 2);
    });
    const dx = 36;
    P(g, '#2a160c', dx - 1, 44, 18, 28); P(g, '#c9a040', dx - 1, 43, 18, 1); P(g, '#8a5a30', dx + 1, 46, 14, 26); P(g, '#6f4428', dx + 7, 46, 1, 26); P(g, '#e8c040', dx + 11, 58, 2, 2);
    P(g, '#2a160c', dx + 3, 48, 10, 4); P(g, night ? '#ffd070' : '#5a7a9a', dx + 4, 49, 8, 2);
    P(g, '#c9a040', 56, 40, 4, 2); P(g, night ? '#fff4b0' : '#ffd070', 56, 42, 4, 5); P(g, '#c9a040', 56, 47, 4, 1);
  }));
  const building = Art.building;
  Art.building = (type, season, night) => (type === 'rgcabin' ? Art.memo('rgcabin' + night, () => cabin(night)) : building(type, season, night));
})();

// ---- The ship herself --------------------------------------------------------------------
// Which tiles are deck, row by row, from the stern (west) to the bow (east).
const RG_DECK = { 6: [4, 32], 7: [3, 35], 8: [3, 37], 9: [3, 38], 10: [3, 39], 11: [3, 39], 12: [3, 38], 13: [3, 37], 14: [3, 35], 15: [4, 32] };
// The deck outline in pixels, and how tall the hull side shows below it.
const RG_OUTLINE = [[64, 96], [528, 96], [576, 120], [608, 136], [624, 152], [640, 166], [658, 176], [640, 186], [624, 200], [608, 216], [576, 232], [528, 256], [64, 256], [50, 240], [46, 176], [50, 112]];
const RG_HULL_BOTTOM = [[48, 236], [64, 256], [528, 256], [576, 232], [608, 216], [624, 200], [640, 186], [658, 176]];
const RgShip = {
  bottomY(x) { const B = RG_HULL_BOTTOM; if (x <= B[0][0]) return B[0][1]; for (let i = 1; i < B.length; i++) if (x <= B[i][0]) { const [x0, y0] = B[i - 1], [x1, y1] = B[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return B[B.length - 1][1]; },
  depth(x) { return x < 120 ? 40 : x < 480 ? 40 - (x - 120) * 6 / 360 : Math.max(6, 34 - (x - 480) * 28 / 178); },
  path(g) {
    const pts = RG_OUTLINE, n = pts.length, mid = i => [(pts[i % n][0] + pts[(i + 1) % n][0]) / 2, (pts[i % n][1] + pts[(i + 1) % n][1]) / 2];
    g.beginPath(); const s = mid(0); g.moveTo(s[0], s[1]);
    for (let i = 1; i <= n; i++) { const p = pts[i % n], q = mid(i); g.quadraticCurveTo(p[0], p[1], q[0], q[1]); }
    g.closePath();
  },
  ground(m) {
    return Art.mk(m.w * TILE, m.h * TILE, g => {
      const P = Art.P, r = mulberry(4242);
      // The shadow she throws on the water.
      g.fillStyle = 'rgba(10,20,40,0.28)';
      for (let x = 46; x < 662; x++) { const y = this.bottomY(x) + this.depth(x); g.fillRect(x, y, 1, 6 + Math.round(Math.sin(x / 9) * 2)); }
      // The hull side: wale, gunports, planks, waterline.
      const ports = [13, 17, 25, 29].map(t => t * TILE + 4), fake = [8, 10, 21, 23, 31].map(t => t * TILE + 4);
      for (let x = 46; x < 660; x++) {
        const top = Math.round(this.bottomY(x)), d = Math.round(this.depth(x));
        for (let k = 0; k < d; k++) {
          let c = Math.floor(k / 5) % 2 ? '#4a2e1a' : '#56361e';
          if (k === 3) c = '#c9a040'; else if (k >= 4 && k < 8) c = '#8a2a2a';
          else if (k >= d - 3) c = '#2a3a34'; else if (k === d - 4) c = '#1a120c';
          P(g, c, x, top + k, 1, 1);
        }
        if ((x + Math.floor(r() * 3)) % 37 === 0) P(g, '#3a2414', x, top + 9, 1, d - 13);
      }
      [...ports, ...fake].forEach((px, i) => {
        const top = Math.round(this.bottomY(px + 4)), live = i < ports.length;
        P(g, '#8a2a2a', px - 1, top + 9, 10, 2); P(g, '#1a0e08', px, top + 11, 8, 7); P(g, '#c9a040', px - 1, top + 18, 10, 1);
        if (live) { P(g, '#3c3c46', px + 2, top + 13, 4, 4); P(g, '#0a0a0e', px + 3, top + 14, 2, 2); }
      });
      // Stern windows glowing out of the hull, and her name.
      for (let i = 0; i < 4; i++) { P(g, '#c9a040', 54 + i * 12, 249, 9, 8); P(g, '#ffd070', 55 + i * 12, 250, 7, 6); P(g, '#3a2414', 58 + i * 12, 250, 1, 6); }
      Font.draw(g, 'RED GULL', 112, 268, '#e8c040');
      // The anchor, hung at the bow.
      { const ax = 586, ay = Math.round(this.bottomY(586)) + 8; P(g, '#1a0e08', ax - 2, ay - 4, 5, 4); P(g, '#55555f', ax, ay, 2, 16); P(g, '#55555f', ax - 5, ay + 2, 12, 2); P(g, '#55555f', ax - 6, ay + 13, 3, 3); P(g, '#55555f', ax + 5, ay + 13, 3, 3); P(g, '#55555f', ax - 4, ay + 15, 10, 2); P(g, '#787884', ax, ay, 1, 14); for (let y = ay - 14; y < ay - 4; y += 2) P(g, '#787884', ax, y, 2, 1); }
      // The deck: long planks, staggered joints and nail heads.
      g.save(); this.path(g); g.clip();
      g.fillStyle = '#94683c'; g.fillRect(0, 0, m.w * TILE, m.h * TILE);
      for (let y = 88, row = 0; y < 268; y += 6, row++) {
        const off = (row * 17) % 44;
        for (let x = -off; x < 680; x += 44) {
          const tone = ['#9a6e40', '#94683c', '#8c6238', '#a07444'][Math.floor(r() * 4)];
          P(g, tone, x, y + 1, 44, 5); P(g, '#5a3a20', x, y + 1, 1, 5); P(g, '#4a301d', x + 2, y + 2, 1, 1); P(g, '#4a301d', x + 2, y + 4, 1, 1);
        }
        P(g, '#6f4c30', 0, y, 700, 1);
      }
      // The raised quarterdeck at the stern, and the forecastle at the bow.
      g.fillStyle = 'rgba(255,236,200,0.10)'; g.fillRect(0, 0, 11 * TILE, m.h * TILE); g.fillRect(34 * TILE, 0, 200, m.h * TILE);
      P(g, '#4a301d', 11 * TILE, 88, 2, 180); P(g, '#b08850', 11 * TILE - 1, 88, 1, 180); P(g, '#4a301d', 34 * TILE - 2, 88, 2, 180); P(g, '#b08850', 34 * TILE, 88, 1, 180);
      // The inside face of the bulwarks.
      g.lineWidth = 24; g.strokeStyle = 'rgba(40,22,10,0.32)'; this.path(g); g.stroke();
      g.lineWidth = 12; g.strokeStyle = 'rgba(70,40,20,0.35)'; this.path(g); g.stroke();
      g.restore();
      // The rail along the top of the bulwarks.
      g.lineWidth = 9; g.strokeStyle = '#4a2e1a'; this.path(g); g.stroke();
      g.lineWidth = 5; g.strokeStyle = '#8a6239'; this.path(g); g.stroke();
      g.lineWidth = 1; g.strokeStyle = '#b08850'; this.path(g); g.stroke();
      for (let x = 80; x < 520; x += 24) { P(g, '#3a2414', x, 93, 3, 6); P(g, '#3a2414', x, 253, 3, 6); }
      // The boarding ladder down to the rowboat.
      P(g, '#94683c', 337, 250, 14, 8); P(g, '#5a3a20', 337, 250, 14, 1);
      for (let y = 258; y < 292; y++) { P(g, '#a07a4c', 338, y, 1, 1); P(g, '#a07a4c', 349, y, 1, 1); if (y % 5 === 0) P(g, '#c8a070', 338, y, 12, 2); }
    });
  },
};

(() => {
  // Bake the hull instead of plain floor tiles.
  const ground = Render.ground.bind(Render);
  Render.ground = function (m, season) {
    if (m.id !== 'redgull') return ground(m, season);
    const b = this.baked.redgull;
    if (b && b.ship && b.version === m.version) return b.canvas;
    const canvas = RgShip.ground(m);
    this.baked.redgull = { season, version: m.version, canvas, ship: true };
    return canvas;
  };
  // A sail in front of you goes see-through, so you never lose yourself behind it.
  const TALL = { rgmain: 1, rgfore: 1, rgmizzen: 1 };
  const drawObj = Render.drawObj.bind(Render);
  Render.drawObj = function (g, o, season, dt) {
    if (!TALL[o.type]) return drawObj(g, o, season, dt);
    const s = this.objSprite(o, season), base = (o.y + 1) * TILE;
    const behind = Player.y < base && Player.y > s.y + 12 && Player.x > s.x + 4 && Player.x < s.x + s.img.width - 4;
    if (behind) g.globalAlpha = 0.42;
    drawObj(g, o, season, dt);
    g.globalAlpha = 1;
  };
  // A lookout in the crow's nest when there is a crew; an open chest once it is looted.
  const sprite = Render.objSprite.bind(Render);
  Render.objSprite = function (o, season) {
    const alt = o.type === 'rgmain' && RedGull.lively() ? 'rgmainlive' : o.type === 'rgchest' && S.redgull && S.redgull.chest ? 'rgchestopen' : null;
    if (!alt) return sprite(o, season);
    const d = OBJDEF[o.type], img = Art.obj(alt, 0);
    return { img, x: Math.round((o.x + (d.fw || 1) / 2) * TILE - img.width / 2), y: (o.y + (d.fh || 1)) * TILE - img.height };
  };
  // Flags, the bowsprit and figurehead, and foam along the waterline.
  const SKULL = ['...####...', '..######..', '..#.##.#..', '..######..', '...#..#...', '#...##...#', '.##....##.', '...####...', '.##....##.', '#........#'];
  const flag = (g, x, y, t, jolly) => {
    const w = jolly ? 20 : 26, h = jolly ? 14 : 6;
    for (let i = 0; i < w; i++) {
      const wave = Math.round(Math.sin(t * 6 - i * 0.45) * (i / w) * 2.5), hh = jolly ? h : Math.max(1, Math.round(h * (1 - i / w)));
      g.fillStyle = jolly ? '#14100c' : '#b23a3a'; g.fillRect(x + i, y + wave + (jolly ? 0 : Math.round((h - hh) / 2)), 1, hh);
      if (jolly && i >= 5 && i < 15) SKULL.forEach((row, j) => { if (row[i - 5] === '#' && j < h - 2) { g.fillStyle = '#f0ece0'; g.fillRect(x + i, y + wave + 2 + j, 1, 1); } });
    }
  };
  const drawWorld = Story.drawWorld.bind(Story);
  Story.drawWorld = function (g, m, items) {
    drawWorld(g, m, items);
    if (m.id !== 'redgull') return;
    const t = Render.waterT;
    items.push({ y: -1, draw: () => {
      for (let x = 50; x < 656; x += 7) {
        const y = RgShip.bottomY(x) + RgShip.depth(x), a = 0.35 + 0.35 * Math.sin(t * 2 + x * 0.21);
        g.fillStyle = `rgba(240,248,255,${a.toFixed(2)})`; g.fillRect(x + Math.round(Math.sin(t + x) * 2), Math.round(y) + 1, 4, 1);
      }
      const bw = Math.sin(t * 1.5) * 2; g.fillStyle = 'rgba(240,248,255,0.55)'; g.fillRect(652, 178 + bw, 8, 2); g.fillRect(646, 182 + bw, 6, 1);
    } });
    for (const o of m.objs.values()) {
      if (o.type !== 'rgmain' && o.type !== 'rgfore' && o.type !== 'rgmizzen') continue;
      const s = Render.objSprite(o, 0), cx = o.type === 'rgmizzen' ? s.x + 62 : o.x * TILE + 8;
      items.push({ y: (o.y + 1) * TILE, draw: () => flag(g, cx + 2, s.y + (o.type === 'rgmain' ? 2 : 4), t + o.x, o.type === 'rgmain') });
    }
    // The bowsprit, its stay to the foremast, and a carved gull under it.
    items.push({ y: 11 * TILE, draw: () => {
      const fore = [...m.objs.values()].find(o => o.type === 'rgfore');
      if (fore) { const s = Render.objSprite(fore, 0); g.fillStyle = '#3a2a1a'; const x0 = fore.x * TILE + 8, y0 = s.y + 14, x1 = 700, y1 = 146; for (let i = 0; i <= 60; i++) g.fillRect(Math.round(x0 + (x1 - x0) * i / 60), Math.round(y0 + (y1 - y0) * i / 60), 1, 1); }
      for (let i = 0; i < 60; i++) { const x = 644 + i, y = 172 - i * 0.45; g.fillStyle = '#4a301d'; g.fillRect(x, Math.round(y) - (i < 30 ? 2 : 1), 1, i < 30 ? 5 : 3); g.fillStyle = '#8a6239'; g.fillRect(x, Math.round(y) - (i < 30 ? 2 : 1), 1, 1); }
      g.fillStyle = '#c9a040'; g.fillRect(668, 160, 3, 4); g.fillRect(684, 152, 3, 4);
      g.fillStyle = '#e8e0d0'; g.fillRect(650, 176, 10, 5); g.fillStyle = '#b23a3a'; g.fillRect(646, 172, 6, 3); g.fillRect(658, 172, 6, 3); g.fillRect(642, 169, 4, 3); g.fillRect(664, 169, 4, 3);
      g.fillStyle = '#e8c040'; g.fillRect(659, 177, 3, 2); g.fillStyle = '#14100c'; g.fillRect(656, 177, 1, 1);
    } });
  };
  // Every frame: smoke from the galley, and the X on the island when a map is being followed.
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) {
    tick(dt);
    const m = Player.map;
    if (!m || !S) return;
    if (m.id === 'gullsteeth') RedGull.syncX(m);
    if (m.id === 'redgull') { const st = [...m.objs.values()].find(o => o.type === 'rgstove'); if (st && Math.random() < 0.15) VFX.emit('smoke', st.x * TILE + 8 + (Math.random() - 0.5) * 6, st.y * TILE - 6, { vy: -16, t: 1.4 }); }
  };
})();

// ---- Building her ------------------------------------------------------------------------
(() => {
  const build = World.build.bind(World);
  World.build = function () {
    build();
    const W = this, m = W.maps.redgull;
    if (!m) return;
    // Clear the old flat platform and lay down the hull.
    for (const o of [...m.objs.values()]) W.remove(m, o);
    m.block.clear(); m.buildings = [];
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) W.set(m, x, y, T.W);
    for (const y in RG_DECK) { const [a, b] = RG_DECK[y]; for (let x = a; x <= b; x++) W.set(m, x, +y, T.F); }
    // The gangway down the side to the rowboat.
    W.set(m, 21, 16, T.F); W.set(m, 21, 17, T.F);
    // The captain's cabin at the stern, under the poop deck.
    W.addBuilding(m, 'rgcabin', 4, 6, 6, 3, { door: { x: 6, y: 8 } });
    m.block.add(key(3, 7)); m.block.add(key(3, 8));
    m.warps.push({ x: 6, y: 8, to: 'rgcabin', tx: 9, ty: 8, dir: DIRS.up, door: true });
    const put = (type, list, props) => list.forEach(([x, y]) => W.add(m, type, x, y, props));
    put('rgmizzen', [[12, 9]]); put('rgmain', [[22, 10]]); put('rgfore', [[30, 10]]);
    put('rgwheel', [[7, 11]]); put('rgparrot', [[4, 11]]); put('rgbell', [[35, 8]]); put('rgcapstan', [[36, 11]]);
    put('rgcannonn', [[11, 6], [17, 6], [24, 6], [28, 6]]); put('rgcannons', [[13, 15], [17, 15], [25, 15], [29, 15]]);
    put('rgballs', [[18, 6], [27, 6], [16, 15], [28, 15]]);
    put('rglantern', [[12, 5], [21, 5], [31, 5], [11, 16], [27, 16]]);
    put('rgloot', [[13, 7]]); put('rgstove', [[26, 13]]); put('rgkeg', [[5, 14], [24, 13]]); put('rgpowder', [[34, 7]]);
    put('barrel', [[31, 7], [32, 7]]); put('rgcrates', [[33, 7]]); put('crate', [[33, 13]]); put('rgmop', [[9, 14]]);
    put('rggrate', [[17, 10], [18, 10], [26, 10], [27, 10]]); put('rgrope', [[11, 14], [34, 12]]); put('rgnet', [[10, 14]]);
    put('shiphatch', [[34, 10]]); put('rowboat', [[21, 18]]);
    // The crew. Before the story is done, Vane's cutthroats; after, Mags's honest sailors.
    const pre = () => !Memory.get('vane_done'), post = () => RedGull.open();
    m.spawns = [
      { t: 'pirate', x: 10, y: 12, n: 2, r: 2, if: pre }, { t: 'pirate', x: 30, y: 12, n: 2, r: 2, if: pre },
      { t: 'gunner', x: 20, y: 8, n: 2, r: 2, if: pre }, { t: 'brute', x: 34, y: 13, n: 1, r: 0, if: pre },
      { t: 'rg_hand', x: 22, y: 13, n: 2, r: 3, if: post }, { t: 'rg_hand2', x: 9, y: 12, n: 1, r: 2, if: post },
      { t: 'rg_gunner', x: 28, y: 8, n: 1, r: 2, if: post }, { t: 'rg_bosun', x: 33, y: 11, n: 1, r: 1, if: post },
    ];

    // The captain's cabin, inside.
    const c = W.room('rgcabin', 'Captain\'s Cabin', 18, 10, T.F, ['#6a3a22', '#5a3018', '#4a2614']);
    c.region = true;
    c.warps.push({ x: 9, y: 9, to: 'redgull', tx: 6, ty: 9, dir: DIRS.down });
    const cp = (type, list, props) => list.forEach(([x, y]) => W.add(c, type, x, y, props));
    cp('rgwindow', [[5, 1], [8, 1], [11, 1]]); cp('rgswords', [[3, 1]]); cp('rgportrait', [[14, 1]]);
    cp('rgrug', [[7, 5]]); cp('rgdesk', [[8, 3]]); cp('rgbunk', [[14, 3]]); cp('rgshelf', [[2, 3], [3, 3]]); cp('rgglobe', [[5, 4]]); cp('rgrack', [[16, 3]]);
    cp('rgchest', [[15, 7]]); cp('rgcoins', [[2, 7], [16, 6]]); cp('rglantern', [[12, 4]]); cp('chair', [[9, 4]]);

    // The hold gets hammocks, sacks and powder.
    const h = W.maps.hold;
    if (h) {
      const hp = (type, list) => list.forEach(([x, y]) => { if (!W.at(h, x, y) && !W.solid(h, x, y)) W.add(h, type, x, y); });
      hp('rghammock', [[8, 3], [16, 3]]); hp('rgsacks', [[23, 9], [24, 9]]); hp('rgpowder', [[2, 4], [3, 4]]); hp('rgcrates', [[27, 8]]); hp('rgrope', [[19, 8]]); hp('rgnet', [[7, 9]]);
    }
  };
})();
// The ship's cat, who was here before any of them.
HERDS.redgull = [['cat', 1, 10, 11, 30, 14, ['#e8a050', '#b87030']]];
