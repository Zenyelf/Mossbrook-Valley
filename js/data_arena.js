'use strict';
// The Pit: weapons, potions and blessings that only exist inside the arena.

const ARENA_WEAPONS = {
  pit_sword: ['Pit Shortsword', 'common', ['sword', '#b4bcc8', '#7a828e'], blade(12, 27, 2.1, 0.45, 8, 120), 'A plain blade the Pit lends to everyone.'],
  twin_daggers: ['Twin Daggers', 'rare', ['dagger', '#d8dce4', '#8a92a0'], blade(8, 21, 1.8, 0.2, 4, 50, { crit: 0.15 }), 'Very fast. Lands critical hits often.'],
  greatsword: ['Greatsword', 'rare', ['sword', '#8a92a0', '#55606f'], blade(30, 34, 2.8, 0.8, 16, 220), 'Slow, wide, and devastating.'],
  spear: ['Pit Spear', 'rare', ['spear'], blade(18, 44, 0.8, 0.48, 8, 160), 'Strikes far ahead in a narrow line.'],
  warhammer: ['Warhammer', 'epic', ['hammer'], blade(34, 28, 2.4, 0.9, 18, 320, { stun: 0.7 }), 'Every blow knocks enemies flat and stuns them.'],
  flail: ['Spinning Flail', 'epic', ['flail'], blade(16, 30, 6.3, 0.6, 12, 160), 'Hits everything around you at once.'],
  rapier: ['Duelist\'s Rapier', 'rare', ['sword', '#f0e0a0', '#b8a060'], blade(11, 31, 1.0, 0.18, 4, 60, { crit: 0.25 }), 'Lightning-fast thrusts that crit a quarter of the time.'],
  ash_scythe: ['Scythe of Ash', 'epic', ['ashscythe'], blade(20, 32, 3.0, 0.55, 10, 120, { lifesteal: 0.15 }), 'Heals you for part of every hit.'],
  frost_brand: ['Frost Brand', 'epic', ['sword', '#9ad8ff', '#5aa8e8'], blade(17, 28, 2.2, 0.42, 9, 120, { slow: 2 }), 'Chills what it cuts. Slowed enemies move at half speed.'],
  ember_blade: ['Ember Blade', 'epic', ['sword', '#ff9050', '#c04020'], blade(16, 28, 2.2, 0.42, 9, 120, { burn: 3 }), 'Sets enemies alight. Burning foes take damage over time.'],
  storm_glaive: ['Storm Glaive', 'legendary', ['spear', '#f7e26b', '#c8a020'], blade(19, 34, 2.0, 0.5, 10, 140, { chain: 2 }), 'Lightning leaps from each hit to two more enemies.'],
  longbow_a: ['Pit Longbow', 'rare', ['bow'], blade(22, 0, 0, 0.6, 6, 80, { ranged: true, free: true, pierce: true, speed: 330 }), 'Arrows pass straight through enemies. No ammunition needed.'],
  repeater: ['Repeater Crossbow', 'epic', ['crossbow'], blade(9, 0, 0, 0.22, 3, 40, { ranged: true, free: true, speed: 300 }), 'A storm of small bolts. No ammunition needed.'],
  throwing_axes: ['Throwing Axes', 'rare', ['axe', '#b4bcc8', '#7a828e', '#e0e6ee'], blade(16, 0, 0, 0.45, 6, 120, { ranged: true, free: true, multishot: 3, spread: 0.25, speed: 240 }), 'Throws three axes in a fan.'],
  ember_wand: ['Wand of Embers', 'legendary', ['wand', '#ff8040', '#c04020'], blade(14, 0, 0, 0.7, 10, 60, { ranged: true, free: true, aoe: 38, burn: 2, speed: 220, color: '#ff8040' }), 'Fireballs that explode and set everything near them burning.'],
  frost_staff: ['Frost Staff', 'epic', ['wand', '#9ad8ff', '#5aa8e8'], blade(10, 0, 0, 0.5, 8, 30, { ranged: true, free: true, aoe: 32, slow: 3, speed: 240, color: '#9ad8ff' }), 'Bursts of frost that slow everything they touch.'],
};
for (const id in ARENA_WEAPONS) {
  const [name, rarity, icon, w, desc] = ARENA_WEAPONS[id];
  item(id, name, 'weapon', 0, icon, desc + ' Only usable in the Pit.', { w, arena: true, rarity });
}

// Potions are used with C, like any held item. Flasks are thrown where you face.
const ARENA_POTIONS = {
  heal_draught: ['Healing Draught', 'common', '#d4405a', 'Restores 40% of your health.'],
  heal_greater: ['Greater Draught', 'rare', '#ff7090', 'Restores all of your health.'],
  stamina_tonic: ['Stamina Tonic', 'common', '#e8c04a', 'Refills stamina, and it recovers twice as fast for 20 seconds.'],
  fury_potion: ['Fury Potion', 'rare', '#c43030', '+50% damage for 15 seconds.'],
  swift_potion: ['Swiftness Potion', 'rare', '#7ad07a', '+40% movement speed for 15 seconds.'],
  iron_potion: ['Ironskin Potion', 'rare', '#a0a8b8', 'Take half damage for 15 seconds.'],
  phantom_potion: ['Phantom Draught', 'epic', '#c8c8f0', 'Enemies lose sight of you for 6 seconds.'],
  fire_flask: ['Fire Flask', 'common', '#ff8040', 'Throw it: an explosion that sets enemies burning.'],
  frost_flask: ['Frost Flask', 'rare', '#9ad8ff', 'Throw it: a burst that slows everything nearby.'],
  thunder_flask: ['Thunder Flask', 'epic', '#f7e26b', 'Throw it: a thunderclap that stuns and hurts.'],
  elixir_life: ['Elixir of Life', 'legendary', '#f0d070', 'Carry it. If you would fall, it saves you once at half health.'],
  armor_kit: ['Armourer\'s Kit', 'rare', '#b4bcc8', 'Hammer out every dent: restores all your armour.'],
};
for (const id in ARENA_POTIONS) {
  const [name, rarity, colour, desc] = ARENA_POTIONS[id];
  item(id, name, 'potion', 0, ['potion', colour, '#2a1a10'], desc + ' Only found in the Pit.', { arena: true, rarity });
}
item('pit_laurel', 'Laurel of the Pit', 'relic', 0, ['laurel'], 'Awarded for surviving ten waves.', { lore: 'Rusk\'s people weave these from Greywood ivy. "Most who earn one never come back for a second," he says, "because they know better."' });
item('pit_crown', 'Iron Crown of the Pit', 'relic', 0, ['ring', '#55555f', '#3c3c46'], 'Awarded for surviving thirty waves.', { lore: 'Hammered from the blades of everyone who lost. It is heavier than it looks, which is the point.' });

// Blessings change you for the rest of the run.
const BLESSINGS = {
  vitality: ['Vitality', 'common', '+25 maximum health.', m => { m.maxHP += 25; }],
  might: ['Might', 'common', '+12% damage.', m => { m.dmg += 0.12; }],
  haste: ['Haste', 'common', '+10% attack speed.', m => { m.atk += 0.1; }],
  fleet: ['Fleet Foot', 'common', '+8% movement speed.', m => { m.speed += 0.08; }],
  endurance: ['Endurance', 'common', '+30 maximum stamina.', m => { m.stam += 30; }],
  keen: ['Keen Edge', 'rare', '+7% critical chance. Critical hits deal double damage.', m => { m.crit += 0.07; }],
  vamp: ['Vampirism', 'rare', 'Heal for 4% of the damage you deal.', m => { m.lifesteal += 0.04; }],
  regen: ['Regeneration', 'rare', 'Recover 1 health every second.', m => { m.regen += 1; }],
  ironhide: ['Ironhide', 'rare', 'Take 8% less damage.', m => { m.armor = Math.min(0.6, m.armor + 0.08); }],
  wind: ['Second Breath', 'rare', 'Dodging costs 25% less stamina.', m => { m.dodge *= 0.75; }],
  thorns: ['Thorns', 'rare', 'Attackers take 30% of the damage they deal you.', m => { m.thorns += 0.3; }],
  ember: ['Ember Touch', 'epic', 'Every hit has a 20% chance to set the enemy burning.', m => { m.burn += 0.2; }],
  frost: ['Frost Touch', 'epic', 'Every hit has a 20% chance to slow the enemy.', m => { m.slow += 0.2; }],
  secondwind: ['Second Wind', 'epic', 'Heal 35% of your health after every wave.', m => { m.wave += 0.35; }],
  berserker: ['Berserker', 'epic', 'Up to +60% damage the lower your health is.', m => { m.berserk = true; }],
  titan: ['Titan', 'epic', '+20 maximum health and +50% knockback.', m => { m.maxHP += 20; m.kb += 0.5; }],
  glass: ['Glass Cannon', 'legendary', '+40% damage, but 30% less maximum health.', m => { m.dmg += 0.4; m.hpMul *= 0.7; }],
};

const RARITY = {
  common: { colour: '#c8c0b0', label: 'Common' }, rare: { colour: '#5aa8e8', label: 'Rare' },
  epic: { colour: '#b070e0', label: 'Epic' }, legendary: { colour: '#f0b030', label: 'Legendary' },
};

// Who fights at which depth, and the boss of every tenth wave.
const PIT_TIERS = [
  [1, ['thornling', 'wolf', 'bat', 'saltclaw', 'gull']],
  [5, ['bandit', 'archer', 'rockcrab', 'hound', 'pirate', 'wolf']],
  [10, ['gloomling', 'gaoler', 'crossbow', 'gunner', 'smuggler', 'rootling', 'bandit']],
  [20, ['drowned', 'brute', 'gloomling', 'crossbow', 'rootling', 'smuggler', 'gaoler']],
];
const PIT_BOSSES = ['rusk', 'warden', 'thorne', 'kessick', 'vane', 'king'];
