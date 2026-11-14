'use strict';
// Item, crop, fish and recipe tables. `icon` is [painter, colour, shade, accent]; see Art.ICONS.

const ITEMS = {};
function item(id, name, kind, price, icon, desc, extra) {
  ITEMS[id] = Object.assign({ id, name, kind, price, icon, desc }, extra || {});
}

// Tools (level is stored on the player)
item('hoe', 'Hoe', 'tool', 0, ['hoe'], 'Breaks ground for planting.');
item('can', 'Watering Can', 'tool', 0, ['can'], 'Waters crops. Refill it at any water.');
item('axe', 'Axe', 'tool', 0, ['axe'], 'Fells trees and stumps.');
item('pick', 'Pickaxe', 'tool', 0, ['pick'], 'Breaks rock.');
item('scythe', 'Scythe', 'tool', 0, ['scythe'], 'Cuts weeds and reaps ripe crops.');
item('rod', 'Fishing Rod', 'tool', 0, ['rod'], 'Cast it at water and wait for a bite.');

// Crops: id, name, seasons, days to grow, regrow days, seed cost, sell price, plant shape
const CROPS = {};
function crop(id, name, seasons, days, regrow, seedCost, sell, shape, c1, c2, iconPainter, food) {
  CROPS[id] = { id, name, seasons, days, regrow, shape, c1, c2 };
  item(id, name, 'crop', sell, [iconPainter, c1, c2], `Grown in ${seasons.map(s => SEASONS[s]).join(' and ')}.`, { food });
  item(id + '_seed', name + ' Seeds', 'seed', Math.floor(seedCost / 2), ['seed', c1, c2],
    `Takes ${days} days. ${regrow ? 'Keeps producing. ' : ''}Plant in ${seasons.map(s => SEASONS[s]).join(' or ')}.`, { crop: id, buy: seedCost });
}
crop('turnip', 'Turnip', [0], 4, 0, 20, 35, 'root', '#f1e7ea', '#b36fa0', 'root', 10);
crop('potato', 'Potato', [0], 6, 0, 45, 80, 'bush', '#c9a06a', '#92693c', 'potato', 12);
crop('strawberry', 'Strawberry', [0], 8, 4, 100, 120, 'bush', '#e0403f', '#a8282e', 'berry', 18);
crop('tomato', 'Tomato', [1], 9, 4, 50, 60, 'vine', '#df4a35', '#a52f26', 'round', 14);
crop('corn', 'Corn', [1, 2], 12, 4, 120, 70, 'stalk', '#f0cf4e', '#c79a2c', 'corn', 14);
crop('melon', 'Melon', [1], 11, 0, 80, 250, 'ground', '#5fb04e', '#357a35', 'melon', 40);
crop('yam', 'Yam', [2], 8, 0, 60, 160, 'root', '#b9593c', '#823a29', 'root', 22);
crop('grape', 'Grape', [2], 10, 3, 70, 80, 'vine', '#7c4fb0', '#54337f', 'grape', 12);
crop('pumpkin', 'Pumpkin', [2], 12, 0, 110, 320, 'ground', '#e88a2c', '#b5611d', 'pumpkin', 40);
crop('frostkale', 'Frost Kale', [3], 7, 0, 90, 150, 'bush', '#8fd0c0', '#4f9a90', 'kale', 16);

// Forage
item('dandelion', 'Dandelion', 'forage', 30, ['flower', '#f2d23c', '#c7a124'], 'A hardy spring weed.', { food: 6 });
item('leek', 'Wild Leek', 'forage', 45, ['leek', '#e6ecd0', '#79a84a'], 'Grows along shady paths.', { food: 10 });
item('herb', 'Silverleaf', 'forage', 40, ['herb', '#a8cfae', '#5e9370'], 'A healer\'s staple.', { food: 4 });
item('blackberry', 'Blackberry', 'forage', 25, ['bunch', '#3f2d5a', '#251a3a'], 'Stains everything it touches.', { food: 12 });
item('hazelnut', 'Hazelnut', 'forage', 60, ['nut', '#a3703e', '#6d4726'], 'Dropped by the old trees.', { food: 12 });
item('mushroom', 'Forest Cap', 'forage', 55, ['mushroom', '#c0533f', '#efe2c8'], 'Probably safe.', { food: 14 });
item('holly', 'Winter Holly', 'forage', 70, ['bunch', '#c43030', '#3c7a3e'], 'One of the few things that thrive in the cold.', { food: 2 });

// Materials
item('wood', 'Wood', 'material', 2, ['wood'], 'Cut lumber.');
item('stone', 'Stone', 'material', 2, ['stone'], 'Plain grey fieldstone.');
item('fiber', 'Fiber', 'material', 1, ['fiber'], 'Tough plant strands.');
item('coal', 'Coal', 'material', 15, ['ore', '#3a3a44', '#1f1f28'], 'Dirty, and worth it.');
item('copper', 'Copper Ore', 'material', 12, ['ore', '#c87a48', '#8d4f2a'], 'Sold by the blacksmith, for now.');
item('feed', 'Chicken Feed', 'material', 5, ['feed'], 'Put it in the coop trough.', { buy: 10 });
item('sap', 'Sap', 'material', 3, ['drop', '#c78a2e', '#8f5e1a'], 'Sticky stuff from a felled tree.');

// Animal goods and fish
item('egg', 'Egg', 'animal', 50, ['egg', '#f5ecd8', '#d8c8a8'], 'Still warm.', { food: 12 });
item('carp', 'Mud Carp', 'fish', 40, ['fish', '#a68a55', '#6d5a35'], 'Tastes like the riverbed.', { food: 10, seasons: [0, 1, 2, 3], tier: 1 });
item('sunfish', 'Sunfish', 'fish', 55, ['fish', '#e8b53c', '#b87f28'], 'Only bites in good weather.', { food: 12, seasons: [0, 1], tier: 1 });
item('bass', 'River Bass', 'fish', 90, ['fish', '#6f9d6a', '#46704a'], 'A proper catch.', { food: 18, seasons: [1, 2], tier: 2 });
item('trout', 'Stone Trout', 'fish', 110, ['fish', '#9db0c0', '#667a8c'], 'Likes the cold water by the broken bridge.', { food: 18, seasons: [0, 2, 3], tier: 2 });
item('eel', 'Black Eel', 'fish', 180, ['fish', '#3a3f4a', '#20232c'], 'Comes up from somewhere deep.', { food: 24, seasons: [2, 3], tier: 3 });

// Crafted and cooked goods
item('fertilizer', 'Fertilizer', 'place', 15, ['bag', '#8a6a3f', '#5e4526'], 'Spread on tilled soil for better crop quality.');
item('sprinkler', 'Sprinkler', 'place', 60, ['sprinkler'], 'Waters the four tiles beside it each morning.');
item('trailmix', 'Trail Mix', 'food', 40, ['bowl', '#a3703e', '#6d4726'], 'Keeps you going.', { food: 30 });
item('omelette', 'Omelette', 'food', 120, ['bowl', '#f0cf4e', '#c79a2c'], 'Plain and perfect.', { food: 50 });
item('stew', 'Root Stew', 'food', 180, ['bowl', '#b9593c', '#823a29'], 'Your grandfather\'s recipe, more or less.', { food: 70 });

// Story items cannot be sold or gifted
item('joren_pipe', 'Joren\'s Pipe', 'quest', 0, ['pipe'], 'Worn smooth. It still smells of him.');
item('dell_ring', 'Dell\'s Ring', 'quest', 0, ['ring'], 'Inside the band: "Come home."');
item('sealed_letter', 'Sealed Letter', 'quest', 0, ['letter'], 'Marta\'s wax seal. You could lift it with a warm knife.');
item('journal_page', 'Torn Journal Page', 'quest', 0, ['page'], 'In your grandfather\'s hand.');
item('tool_bundle', 'Stolen Tools', 'quest', 0, ['bag', '#6b6b78', '#44444e'], 'Three chisels and a good hammer, wrapped in a child\'s coat.');
item('shackle', 'Rusted Shackle', 'quest', 0, ['ring', '#8a5a3a', '#5e3b24'], 'Small. Too small for a grown wrist.');

item('pack1', 'Travel Pack', 'upgrade', 0, ['backpack', '#a87c4c', '#7a5535'], 'A proper pack. Ten more slots.');
item('pack2', 'Field Pack', 'upgrade', 0, ['backpack', '#6f7a5a', '#4e583e'], 'Reinforced with hide. Ten more slots again.');
item('pack3', 'Expedition Pack', 'upgrade', 0, ['backpack', '#7a3a34', '#5a2822'], 'Built to carry a whole season of work. Ten more slots.');

const RECIPES = [
  { out: 'pack1', n: 1, needs: { fiber: 25, wood: 15 }, lvl: 0, pack: 40 },
  { out: 'pack2', n: 1, needs: { fiber: 30, pelt: 5 }, lvl: 0, pack: 50 },
  { out: 'pack3', n: 1, needs: { pelt: 10, iron: 8 }, lvl: 0, pack: 60 },
  { out: 'fertilizer', n: 2, needs: { fiber: 3, sap: 1 }, lvl: 0 },
  { out: 'sprinkler', n: 1, needs: { copper: 2, stone: 5, wood: 5 }, lvl: 2 },
  { out: 'salve', n: 1, needs: { herb: 2, fiber: 2 }, lvl: 1 },
  { out: 'trailmix', n: 1, needs: { hazelnut: 1, blackberry: 1 }, lvl: 0 },
  { out: 'omelette', n: 1, needs: { egg: 2 }, lvl: 1 },
  { out: 'stew', n: 1, needs: { turnip: 1, potato: 1, leek: 1 }, lvl: 3 },
];

// Tool upgrades offered at the forge. Effects are read from Player.tools[id].
const UPGRADES = {
  hoe: [{ name: 'Copper Hoe', gold: 300, needs: { copper: 5 }, note: 'Tills 3 tiles in a line.' }, { name: 'Iron Hoe', gold: 800, needs: { iron: 5 }, note: 'Tills 5 tiles in a line.' },
    { name: 'Gold Hoe', gold: 2000, needs: { gold_ore: 5 }, note: 'Tills 7 tiles in a line.' }, { name: 'Amethyst Hoe', gold: 5000, needs: { amethyst: 4, gold_ore: 2 }, note: 'Tills a strip 3 wide and 5 long.' }],
  can: [{ name: 'Copper Can', gold: 300, needs: { copper: 5 }, note: 'Holds 70, waters 3 in a line.' }, { name: 'Iron Can', gold: 800, needs: { iron: 5 }, note: 'Holds 100, waters 5 in a line.' },
    { name: 'Gold Can', gold: 2000, needs: { gold_ore: 5 }, note: 'Holds 140, waters 7 in a line.' }, { name: 'Amethyst Can', gold: 5000, needs: { amethyst: 4, gold_ore: 2 }, note: 'Holds 200, waters a strip 3 wide and 5 long.' }],
  axe: [{ name: 'Copper Axe', gold: 300, needs: { copper: 5 }, note: 'Fells trees in half the swings.' }, { name: 'Iron Axe', gold: 800, needs: { iron: 5 }, note: 'Fells trees in a third of the swings.' },
    { name: 'Gold Axe', gold: 2000, needs: { gold_ore: 5 }, note: 'Fells trees in a quarter of the swings.' }, { name: 'Amethyst Axe', gold: 5000, needs: { amethyst: 4, gold_ore: 2 }, note: 'Fells most trees in one or two swings, and gives extra wood.' }],
  pick: [{ name: 'Copper Pickaxe', gold: 300, needs: { copper: 5 }, note: 'Breaks rock in half the swings.' }, { name: 'Iron Pickaxe', gold: 800, needs: { iron: 5 }, note: 'Breaks anything the mine has.' },
    { name: 'Gold Pickaxe', gold: 2000, needs: { gold_ore: 5 }, note: 'Breaks rock in a quarter of the swings, and sometimes finds extra ore.' }, { name: 'Amethyst Pickaxe', gold: 5000, needs: { amethyst: 4, gold_ore: 2 }, note: 'Shatters almost anything in one swing, and often finds extra ore.' }],
};

const qualityNames = ['', 'Silver', 'Gold'];
const qualityMult = [1, 1.25, 1.5];
