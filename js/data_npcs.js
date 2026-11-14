'use strict';
// Villagers: looks, schedules, tastes, and what they say.
// Schedule entries are [time, map, x, y, hide?]. `rain` replaces it on wet days.

function npc(def) { NPCS[def.id] = def; }

const PLAYER_LOOK = {
  skin: '#f0c49a', skinD: '#d9a678', hair: '#7a4a24', hairD: '#5c361a', style: 'short', hat: 'straw',
  shirt: '#e8e0d0', shirtD: '#c4baa6', overalls: '#3f6fa8', pants: '#3f6fa8', pantsD: '#2f5a8c', shoes: '#5c3a22',
};

npc({
  id: 'marta', name: 'Marta Hale', role: 'Shopkeeper', shop: 'store', hours: [540, 1140],
  look: { skin: '#e8b890', skinD: '#c99a72', hair: '#6a6470', hairD: '#4e4954', style: 'bun', shirt: '#6a8f6a', shirtD: '#4f7050', apron: '#efe6d2', pants: '#54483e', pantsD: '#3e342c' },
  sched: [[360, 'store', 5, 4], [1140, 'inn', 9, 8], [1290, 'store', 5, 4]],
  loves: ['strawberry', 'melon', 'omelette'], likes: ['kind:crop', 'egg'], hates: ['stone', 'fiber', 'weed', 'kind:material'],
  greet: ['Mind the shelves.', 'What do you need, Tam?', 'Prices are written down. I don\'t haggle before noon.'],
  chat: [
    { h: 0, t: 'Your grandfather bought the same seeds every spring for fifty years. Never once asked what else I had.' },
    { h: 0, t: 'Pay on time and we will get along fine.' },
    { h: 2, t: 'You remind me of Joren when you scowl at the sky. Don\'t tell him I said so. Well.' },
    { h: 2, t: 'My husband used to stack those crates. Badly. I have never had the heart to fix how he left the corner.' },
    { h: 4, t: 'Nine years is a long time to keep a man\'s coat by the door. I know how it looks.' },
    { h: 6, t: 'Most people here smile at me. You are one of the few I would leave alone with the till.' },
  ],
  reactions: [
    { id: 'crops_died', if: () => Memory.knows('marta', 'crops_died'), t: 'I hear you let a crop rot in the ground. Joren would have been out there with a lantern.' },
    { id: 'read_letter_marta', if: () => Memory.knows('marta', 'read_marta_letter'), t: 'That letter I gave you. The wax had been lifted. Don\'t insult me by saying otherwise.' },
    { id: 'named_finn', if: () => Memory.knows('marta', 'named_finn'), t: 'The Tolley boy. You could have come to one of us first. His mother is dying, Tam.' },
  ],
});

npc({
  id: 'bram', name: 'Old Bram', role: 'Your grandfather\'s friend',
  look: { skin: '#dcae88', skinD: '#bb8f6c', hair: '#d8d4cc', hairD: '#b4b0a8', style: 'bald', beard: '#d8d4cc', shirt: '#8a7a5a', shirtD: '#6b5e44', pants: '#5a5040', pantsD: '#443c30' },
  sched: [[480, 'village', 29, 21], [780, 'village', 33, 26], [1020, 'inn', 4, 7], [1260, 'village', 26, 37, true]],
  rain: [[480, 'inn', 4, 7], [1260, 'village', 26, 37, true]],
  loves: ['potato', 'stew', 'hazelnut'], likes: ['kind:forage', 'carp'], hates: ['kind:material'],
  greet: ['Sit down before your knees learn what mine know.', 'Mm. Ashgrove\'s boy.', 'Weather\'s turning. It always is.'],
  chat: [
    { h: 0, t: 'Joren and I were boys on this road. Before. Well. A long time ago.' },
    { h: 0, t: 'They say the King has never lost a harvest. That is true. I would stop there, if I were you.' },
    { h: 2, t: 'I knew every family in this valley once. There were more of them. Don\'t ask me where they went.' },
    { h: 2, t: 'The soil on your land is the best in the valley. Joren never once looked happy about it.' },
    { h: 4, t: 'Some nights I go down to the river and say a few names out loud. Just so they get said.' },
    { h: 6, t: 'You have his hands. I hope you did not get anything else of his.' },
  ],
  reactions: [
    { id: 'kept_pipe', if: () => Memory.did('kept_pipe'), t: 'Keep the pipe if it means something to you. I just thought I would be the one to have it, is all.' },
    { id: 'lied_tithe', if: () => Memory.knows('bram', 'lied_tithe'), t: 'You lied to the Crown\'s collector and got away with it. Don\'t get used to the feeling. Joren did not.' },
  ],
});

npc({
  id: 'finn', name: 'Finn Tolley', role: 'River kid',
  look: { skin: '#f0c49a', skinD: '#d9a678', hair: '#c2703a', hairD: '#96522a', style: 'messy', shirt: '#a8503a', shirtD: '#843c2c', pants: '#6a5a44', pantsD: '#504434' },
  sched: [[480, 'village', 36, 6], [720, 'village', 30, 25], [900, 'village', 28, 6], [1140, 'village', 37, 37, true]],
  rain: [[480, 'inn', 12, 7], [1140, 'village', 37, 37, true]],
  loves: ['bass', 'trout', 'eel', 'blackberry'], likes: ['kind:fish', 'hazelnut'], hates: ['leek', 'stone'],
  greet: ['Hey! Hey Tam! Watch this. No, wait, it left.', 'You ever fished the end of the bridge? You should.', 'Ma says not to bother you. I am not bothering you, am I?'],
  chat: [
    { h: 0, t: 'The biggest fish are by the broken bridge. Nobody goes there. That is why they get big.' },
    { h: 0, t: 'Ma coughs less when it is warm. So summer will be good.' },
    { h: 2, t: 'Sergeant Varr says the bridge fell in a flood. Old Bram says it was a fire. I asked Mother Ansa and she told me to go and play.' },
    { h: 4, t: 'You are alright, Tam. Most people stop listening halfway.' },
  ],
  reactions: [
    { id: 'kept_finn_secret', if: () => Memory.did('covered_finn'), t: 'I know what you told the Sergeant. I\'ll pay Ivo back. I swear on the river.' },
  ],
});

npc({
  id: 'ivo', name: 'Ivo Brandt', role: 'Blacksmith', smith: true,
  look: { skin: '#c99a72', skinD: '#a87c58', hair: '#35302c', hairD: '#201c18', style: 'crop', beard: '#35302c', scar: true, shirt: '#57504a', shirtD: '#403a35', apron: '#6e4a2c', pants: '#3a342e', pantsD: '#2a2622' },
  sched: [[480, 'smithy', 5, 4], [1080, 'inn', 6, 7], [1320, 'village', 17, 37, true]],
  loves: ['coal', 'copper', 'stew'], likes: ['stone', 'kind:food'], hates: ['kind:forage', 'dandelion'],
  greet: ['Talk fast. Metal is cooling.', 'What.', 'Tools sharp? Then why are you here.'],
  chat: [
    { h: 0, t: 'Bring me work or bring me coal.' },
    { h: 0, t: 'I learned the trade in the capital. Crown money. Worst money there is.' },
    { h: 2, t: 'This scar? Someone did not like what I was making. They were right.' },
    { h: 4, t: 'There is a thing you learn at a forge. Everything you make goes on existing after you stop thinking about it.' },
  ],
  reactions: [
    { id: 'named_finn', if: () => Memory.did('named_finn'), t: 'Got my chisels back. Didn\'t need the boy in irons for it. Should have come to me.' },
  ],
});

npc({
  id: 'sera', name: 'Sera Quill', role: 'Keeper of the Sleeping Hen',
  look: { skin: '#b98a64', skinD: '#986e4c', hair: '#2a1e1a', hairD: '#1a1210', style: 'long', shirt: '#9a4a5a', shirtD: '#783846', apron: '#e8dcc4', pants: '#4a3a3e', pantsD: '#362a2e' },
  sched: [[600, 'inn', 5, 4]],
  loves: ['grape', 'pumpkin', 'mushroom'], likes: ['kind:food', 'kind:crop', 'kind:forage'], hates: ['coal', 'stone'],
  greet: ['Sit. Everyone tells me everything eventually.', 'Evening, farmer. Or is it morning? I stopped checking.', 'I heard you were coming. I hear most things.'],
  chat: [
    { h: 0, t: 'Rule of the house: what is said at the bar stays at the bar. Until I need it.' },
    { h: 0, t: 'The Crown\'s men tip badly and listen closely. I prefer the reverse.' },
    { h: 2, t: 'Your grandfather drank here for fifty years and never once got drunk. It takes real effort to stay that careful.' },
    { h: 4, t: 'People assume I repeat everything. I repeat exactly what I mean to.' },
  ],
  reactions: [
    { id: 'lied_tithe', if: () => Memory.knows('sera', 'lied_tithe'), t: 'A short Tithe and a straight face. Bold. People have noticed. Not all of them are the people you would want.' },
    { id: 'read_letter_sera', if: () => Memory.knows('sera', 'read_marta_letter'), t: 'Word is you read Marta\'s post. Careful. That is my job.' },
    { id: 'named_finn_sera', if: () => Memory.knows('sera', 'named_finn'), t: 'The whole bar knows what you told Varr about that boy. I am not saying you were wrong. I am saying they know.' },
  ],
});

npc({
  id: 'odile', name: 'Sgt. Odile Varr', role: 'Crown Sergeant',
  look: { skin: '#e0b48e', skinD: '#c0946e', hair: '#8a6a3a', hairD: '#6a5028', style: 'short', hat: 'helm', shirt: '#7a2f30', shirtD: '#5a2122', belt: '#3a2a1a', pants: '#44444e', pantsD: '#303038', shoes: '#2a2a30' },
  sched: [[480, 'village', 45, 38], [660, 'village', 35, 22], [840, 'village', 59, 24], [1020, 'village', 32, 22], [1200, 'village', 45, 38, true]],
  loves: ['eel', 'trailmix', 'omelette'], likes: ['kind:food', 'bass'], hates: ['dandelion', 'kind:material'],
  greet: ['State your business.', 'Ashgrove. Keeping out of trouble?', 'I have a list, farmer. I would rather you stayed off it.'],
  chat: [
    { h: 0, t: 'The law is simple. Pay what is owed, keep your hands to yourself.' },
    { h: 0, t: 'I was posted here eleven years ago. Quiet village. It is supposed to stay that way. Those were my exact orders.' },
    { h: 2, t: 'I keep every report I have ever filed. Some have been altered since I filed them. I notice that sort of thing.' },
    { h: 4, t: 'A sergeant is a person who follows orders and writes down which ones. You understand the second part is the dangerous one.' },
  ],
  reactions: [
    { id: 'paid_tithe', if: () => Memory.did('paid_tithe'), t: 'Your Tithe came in full and on time. Most boys your age try something. Noted.' },
  ],
});

npc({
  id: 'ansa', name: 'Mother Ansa', role: 'Shrine keeper',
  look: { skin: '#d8a880', skinD: '#b88a64', hair: '#e6e0d0', hairD: '#c2bca8', style: 'hood', shirt: '#e6e0d0', shirtD: '#c2bca8', belt: '#4f7050', pants: '#d0cab8', pantsD: '#aca694', shoes: '#7a6a55' },
  sched: [[420, 'shrine', 7, 4], [660, 'village', 56, 19], [900, 'shrine', 7, 4]],
  loves: ['herb', 'holly', 'frostkale'], likes: ['kind:forage', 'kind:crop'], hates: ['coal'],
  greet: ['The Green keeps you, child.', 'Have you eaten? You should eat.', 'Come in. It is warmer than it looks.'],
  chat: [
    { h: 0, t: 'We give thanks for the harvest. The harvest does not ask to be thanked. That is what makes it holy, I am told.' },
    { h: 0, t: 'Your grandfather came here every week and never once prayed. He just sat.' },
    { h: 2, t: 'I bury everyone in this valley. It is a small graveyard, for how old the valley is. You may notice that, if you are the noticing kind.' },
    { h: 4, t: 'There are things I was told in confidence by people who are now under the ground. I have not decided what I owe them.' },
  ],
  reactions: [
    { id: 'buried_shackle', if: () => Memory.did('gave_shackle'), t: 'I put that iron in the ground where it belongs. I did not say any words over it. I did not know any that would do.' },
  ],
});

npc({
  id: 'pell', name: 'Pell', role: 'Wandering trader', wanderer: true,
  look: { skin: '#cfa27c', skinD: '#ae8460', hair: '#4a3a5a', hairD: '#352a42', style: 'short', hat: 'cap', hatC: '#6a4a9a', hatD: '#513860', shirt: '#6a4a9a', shirtD: '#513860', cape: '#3f3050', pants: '#54483e', pantsD: '#3e342c' },
  sched: [[480, 'village', 30, 28], [1320, 'village', 3, 24, true]],
  loves: ['kind:none'], likes: ['kind:crop'], hates: [],
  greet: ['Everything has a price. Most things have two.', 'Friend! You look like someone who needs something strange.'],
  chat: [
    { h: 0, t: 'I go where the road lets me. Lately it lets me in fewer places.' },
    { h: 0, t: 'Buy from the living, sell to the dead, that is my grandmother\'s advice. She died very rich.' },
  ],
  reactions: [],
});

// Pell trades goods for goods. Offers shift each week.
const BARTER = [
  { give: { turnip: 5 }, get: 'strawberry_seed', n: 2 },
  { give: { potato: 3 }, get: 'copper', n: 2 },
  { give: { wood: 20 }, get: 'coal', n: 2 },
  { give: { stone: 20 }, get: 'copper', n: 3 },
  { give: { egg: 3 }, get: 'melon_seed', n: 2 },
  { give: { dandelion: 2, leek: 1 }, get: 'pumpkin_seed', n: 1 },
  { give: { carp: 2 }, get: 'grape_seed', n: 2 },
  { give: { hazelnut: 3 }, get: 'frostkale_seed', n: 3 },
  { give: { blackberry: 5 }, get: 'tomato_seed', n: 3 },
  { give: { fiber: 15 }, get: 'fertilizer', n: 4 },
];
