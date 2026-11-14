'use strict';
// Stage 3 items: weapons, ores, sea fish, relics, and every enemy.

function blade(dmg, reach, arc, cool, stam, kb, extra) { return Object.assign({ dmg, reach, arc, cool, stam, kb }, extra || {}); }

item('rusty_sword', 'Rusty Sword', 'weapon', 40, ['sword', '#a8a090', '#7a7266'], 'Crown issue, long out of date. It still has an edge.', { w: blade(10, 27, 2.1, 0.52, 11, 130) });
item('hunting_knife', 'Hunting Knife', 'weapon', 90, ['dagger', '#c4ccd8', '#8a92a0'], 'Quick and quiet. Terrible in a fair fight, excellent in an unfair one.', { w: blade(7, 20, 1.6, 0.28, 6, 60, { sneak: 5 }) });
item('iron_sword', 'Iron Sword', 'weapon', 200, ['sword', '#c4ccd8', '#8a92a0'], 'Ivo\'s work. Plain, balanced, and honest.', { w: blade(20, 29, 2.2, 0.46, 11, 150) });
item('war_axe', 'War Axe', 'weapon', 300, ['waraxe', '#b4bcc8', '#7a828e'], 'Slow. You will only need to be right once.', { w: blade(34, 28, 3.2, 0.86, 22, 260) });
item('greyblade', 'Greyblade', 'weapon', 800, ['sword', '#d8c070', '#a08838'], 'Gold-veined steel from the deep ore.', { w: blade(36, 31, 2.3, 0.42, 11, 170) });
item('hunting_bow', 'Hunting Bow', 'weapon', 150, ['bow'], 'Uses arrows. Lets you start the argument from a distance.', { w: blade(14, 0, 0, 0.55, 6, 70, { ranged: true }) });
item('arrow', 'Arrow', 'ammo', 2, ['arrow'], 'Fired by a bow. Hold one anywhere in your pack.');
item('salve', 'Healing Salve', 'food', 60, ['drop', '#8fd0a0', '#4f9a70'], 'Mother Ansa\'s recipe. Closes what it can.', { heal: 50 });

item('iron', 'Iron Ore', 'material', 30, ['ore', '#a8b0b8', '#6c747c'], 'Comes from the middle of the mine.');
item('gold_ore', 'Gold Ore', 'material', 90, ['ore', '#f0cf4e', '#b08a24'], 'Deep ore, from floor 18 down. Ivo forges it into gold tools and armour, and into the Greyblade.');
item('quartz', 'Quartz', 'material', 70, ['gem', '#e8f0f8', '#a8b8cc'], 'A gem, clear enough to read through. Not for forging. It sells well.');
item('amethyst', 'Amethyst', 'material', 180, ['gem', '#a878d8', '#6a4498'], 'A gem that looks wet even when it is dry. Ivo can set it into tools and armour, the finest he makes. Any buyer will pay well for it too.');
item('pelt', 'Wolf Pelt', 'material', 45, ['pelt'], 'Warm, and hard won.');
item('shell', 'Salt Shell', 'material', 35, ['shell'], 'Common on the coast. Valued everywhere else.');
item('ghostcap', 'Ghostcap', 'forage', 140, ['mushroom', '#c8d8e0', '#efe2c8'], 'Pale mushrooms that only grow deep in Greywood.', { food: 18 });
item('mackerel', 'Salt Mackerel', 'fish', 70, ['fish', '#7a9ab0', '#4a6a80'], 'A silver sea fish.', { food: 14, seasons: [0, 1, 2, 3], tier: 1, where: 'sea' });
item('tuna', 'Greyfin', 'fish', 160, ['fish', '#5a6a86', '#3a4660'], 'Fights hard all the way in.', { food: 26, seasons: [1, 2], tier: 2, where: 'sea' });
item('anglerjaw', 'Anglerjaw', 'fish', 420, ['fish', '#3f3350', '#241c30'], 'Should not live this close to shore.', { food: 30, seasons: [2, 3], tier: 3, where: 'sea' });

// Keys and relics stay hidden from the Codex until you actually hold them.
item('felling_wedge', 'Felling Wedge', 'quest', 0, ['wedge'], 'Ivo\'s work. It will split the trunk across the Greywood road.');
item('keep_key', 'Rusted Cell Key', 'quest', 0, ['key', '#8a5a3a', '#5e3b24'], 'Opens the iron door at the heart of the Old Keep.');
item('keep_seal', 'Bram\'s Crown Seal', 'quest', 0, ['ring', '#d8c070', '#a08838'], 'A Crown seal, kept hidden for fifty years. It opens the gate of the Old Keep.');
item('relic_horse', 'Waterlogged Toy Horse', 'relic', 0, ['horse'], 'Carved by someone who loved the child it was for.', { lore: 'Found in a glade no path leads to. The wood is soaked through, though it has not rained here in days, and it never dries.' });
item('relic_key', 'Reed Lane House Key', 'relic', 0, ['key', '#c9a06a', '#92693c'], 'A key to a house on Reed Lane.', { lore: 'There is no Reed Lane in Mossbrook. Nobody you ask has heard of one. Nobody you ask will look at you when they say so.' });
item('relic_manifest', 'Crown Cargo Manifest', 'relic', 0, ['page'], 'Water-stained, signed, and sealed.', { lore: '"Lime, forty barrels. Chain, four hundred pair. Grain, none. Consigned to the Warden of the Old Keep, by the King\'s own hand. Destination: Lower M. Do not unload in daylight."' });
item('relic_roster', 'Duty Roster, Year 76', 'relic', 0, ['page'], 'A list of soldiers, and a list of orders.', { lore: 'One name on the night watch of the river detail has been underlined twice: J. Ashgrove.' });
item('relic_tally', 'Miner\'s Tally Board', 'relic', 0, ['tally'], 'Scratched marks, in groups of five, by the hundred.', { lore: 'The last miner on this level did not count ore. Above the tally, in a shaking hand: "We can hear them through the rock, and they are still singing."' });
item('relic_bell', 'Drowned Bell Clapper', 'relic', 0, ['bell'], 'From a bell that hung somewhere it should not be possible to reach.', { lore: 'It is cold, and it stays cold. When you hold it near your ear you hear running water.' });
item('tithe_roll', 'The Tithe Roll', 'relic', 0, ['page'], 'The Warden\'s own record. The ink has never faded.', { lore: 'The first page is headed "Year 76." It is a list of names. They go on for a long time, and the list has been added to every year since.' });

// Words villagers use that are not the item's full name.
Object.assign(ITEMS.copper, { heard: ['copper'] });
Object.assign(ITEMS.iron, { heard: ['iron ore'] });
Object.assign(ITEMS.mushroom, { heard: ['mushroom'] });
Object.assign(ITEMS.leek, { heard: ['leek'] });
Object.assign(ITEMS.frostkale, { heard: ['kale'] });
Object.assign(ITEMS.stew, { heard: ['stew'] });
Object.assign(ITEMS.carp, { heard: ['carp'] });
Object.assign(ITEMS.bass, { heard: ['bass'] });
Object.assign(ITEMS.trout, { heard: ['trout'] });
Object.assign(ITEMS.eel, { heard: ['eel'] });
Object.assign(ITEMS.salve, { heard: ['salve'] });
Object.assign(ITEMS.pelt, { heard: ['pelt'] });
Object.assign(ITEMS.feed, { heard: ['chicken feed'] });

const BANDIT_LOOK = { skin: '#cfa27c', skinD: '#ae8460', hair: '#3a3028', hairD: '#2a221c', style: 'hood', shirt: '#5a4a38', shirtD: '#44382a', belt: '#2a1e14', pants: '#3e3428', pantsD: '#2c241c', shoes: '#241a12' };
const ARCHER_LOOK = Object.assign({}, BANDIT_LOOK, { hair: '#3f5a3a', hairD: '#2c4228', shirt: '#4a6044', shirtD: '#384a34' });
const RUSK_LOOK = { skin: '#b98a64', skinD: '#986e4c', hair: '#6a2a24', hairD: '#4e1e1a', style: 'crop', beard: '#6a2a24', scar: true, shirt: '#7a3a34', shirtD: '#5e2c28', belt: '#c9a06a', pants: '#3e3428', pantsD: '#2c241c', shoes: '#241a12' };
const DROWNED_LOOK = { skin: '#9fb8b0', skinD: '#7a958c', hair: '#4a5a60', hairD: '#364448', style: 'crop', hat: 'helm', shirt: '#5a6e70', shirtD: '#44565a', belt: '#2a3438', pants: '#44565a', pantsD: '#303e42', shoes: '#2a3438' };
const WARDEN_LOOK = Object.assign({}, DROWNED_LOOK, { shirt: '#7a2f30', shirtD: '#5a2122', cape: '#3a1416', belt: '#d8c070', skin: '#8aa49c', skinD: '#6a847c' });

// vision is in pixels. reach is how close a melee foe must be to swing.
const FOES = {
  thornling: { name: 'Thornling', hp: 34, dmg: 8, speed: 36, vision: 72, reach: 18, cool: 1.1, xp: 6, drops: [['fiber', 1, 3, 0.8], ['sap', 1, 1, 0.4]], gold: [0, 4] },
  wolf: { name: 'Greywood Wolf', hp: 48, dmg: 12, speed: 74, vision: 100, reach: 20, cool: 1.0, xp: 10, drops: [['pelt', 1, 1, 0.6]], gold: [0, 0] },
  saltclaw: { name: 'Saltclaw', hp: 42, dmg: 10, speed: 42, vision: 70, reach: 18, cool: 1.0, xp: 7, drops: [['shell', 1, 2, 0.7]], gold: [0, 6] },
  bat: { name: 'Cave Bat', hp: 20, dmg: 7, speed: 84, vision: 90, reach: 16, cool: 0.9, xp: 5, wobble: true, drops: [['fiber', 1, 1, 0.3]], gold: [0, 3] },
  rockcrab: { name: 'Rock Crab', hp: 70, heavy: true, dmg: 13, speed: 28, vision: 34, reach: 18, cool: 1.2, xp: 11, disguise: true, drops: [['stone', 2, 4, 1], ['copper', 1, 1, 0.3]], gold: [0, 5] },
  gloomling: { name: 'Gloomling', hp: 130, heavy: true, dmg: 20, speed: 52, vision: 110, reach: 20, cool: 1.0, xp: 18, drops: [['coal', 1, 2, 0.6], ['quartz', 1, 1, 0.15]], gold: [4, 18] },
  bandit: { name: 'Bandit', hp: 88, heavy: true, dmg: 15, speed: 58, vision: 104, reach: 22, cool: 0.95, xp: 14, human: true, camp: true, look: BANDIT_LOOK, gold: [20, 60], drops: [['arrow', 2, 4, 0.3]] },
  archer: { name: 'Bandit Archer', hp: 48, dmg: 11, speed: 50, vision: 130, reach: 120, cool: 1.5, xp: 14, human: true, camp: true, ranged: true, look: ARCHER_LOOK, gold: [10, 40], drops: [['arrow', 4, 8, 0.8]] },
  smuggler: { name: 'Smuggler', hp: 120, heavy: true, dmg: 18, speed: 60, vision: 110, reach: 22, cool: 0.9, xp: 18, human: true, look: BANDIT_LOOK, gold: [40, 110], drops: [['quartz', 1, 1, 0.3]] },
  rusk: { name: 'Rusk', hp: 340, heavy: true, dmg: 19, speed: 62, vision: 180, reach: 24, cool: 0.8, xp: 80, human: true, unique: true, boss: true, look: RUSK_LOOK, gold: [300, 300], drops: [['hunting_knife', 1, 1, 1]] },
  drowned: { name: 'Drowned Soldier', hp: 170, heavy: true, dmg: 24, speed: 44, vision: 120, reach: 22, cool: 1.0, xp: 24, human: true, undead: true, look: DROWNED_LOOK, gold: [8, 30], drops: [['coal', 1, 1, 0.3]] },
  warden: { name: 'The Warden', hp: 850, heavy: true, dmg: 27, speed: 46, vision: 260, reach: 28, cool: 0.9, xp: 200, human: true, undead: true, unique: true, boss: true, slam: true, scale: 1.5, look: WARDEN_LOOK, gold: [800, 800], drops: [['greyblade', 1, 1, 1]] },
};
