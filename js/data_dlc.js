'use strict';
// Two post-game stories: The Black Wing (under Ironback Gaol) and The Red Gull (pirates).

item('gaol_uniform', 'Gaoler\'s Uniform', 'gear', 120, ['uniform'], 'Kept in your pack, it lets you pass for a gaoler in the Black Wing. Up close, they will still know your face. The Watcher Eyes are not fooled.');
item('smoke_vial', 'Smoke Vial', 'gadget', 60, ['vial'], 'Use it to fill the air with smoke: Watcher Eyes go blind and nearby enemies lose sight of you.');
item('warden_sigil', 'Warden\'s Sigil', 'quest', 0, ['sigil'], 'A black iron sigil. It turns the locks on the sigil doors of the Black Wing.');
item('black_ledger', 'The Black Ledger', 'relic', 0, ['book', '#2a2a32', '#14141a'], 'Gaolmaster Kessick\'s own record.', { lore: 'Names, dates, and who ordered each one held. Half are signed by the Crown. The rest are signed only "K." Beside some of those he has written a single word: "Mine."' });
item('master_pick', 'Gaolmaster\'s Pick', 'gear', 0, ['lockpick'], 'It opens anything, and it never breaks. It counts as a lockpick.');
item('cutlass', 'Red Gull Cutlass', 'weapon', 400, ['sword', '#d8dce4', '#8a92a0'], 'A sailor\'s blade. Short, fast, and made to be swung on a rolling deck.', { w: blade(24, 26, 2.3, 0.36, 9, 140) });
item('pearl', 'Pearl', 'material', 300, ['gem', '#f4f0e8', '#c8c0b0'], 'A gem. Not for forging. Worth a great deal to any buyer.');
item('spyglass', 'Captain\'s Spyglass', 'relic', 0, ['spyglass'], 'Brass, dented, and very old.', { lore: 'Scratched along the barrel: "Property of the Crown Fleet. Grain run." Under it, in a different hand: "Not any more."' });
item('snapper', 'Golden Snapper', 'fish', 320, ['fish', '#f0c040', '#b08820'], 'Only caught off Gull\'s Teeth.', { food: 30, seasons: [0, 1, 2, 3], tier: 3, where: 'isle' });
Object.assign(ITEMS.smoke_vial, { heard: ['smoke vial'] });

const GAOLER_LOOK = { skin: '#c8a080', skinD: '#a88060', hair: '#2a2a30', hairD: '#1a1a20', style: 'crop', hat: 'helm', shirt: '#3c3c46', shirtD: '#2a2a32', belt: '#7a5535', pants: '#2a2a32', pantsD: '#1c1c22', shoes: '#14141a' };
const KESSICK_LOOK = Object.assign({}, GAOLER_LOOK, { shirt: '#55555f', shirtD: '#3c3c46', cape: '#2a1416', belt: '#c9a06a', beard: '#5a5048', skin: '#d8b090', skinD: '#b89070' });
const PIRATE_LOOK = { skin: '#c99a72', skinD: '#a87c58', hair: '#b23a3a', hairD: '#8a2a2a', style: 'cap', hat: 'cap', hatC: '#b23a3a', hatD: '#8a2a2a', shirt: '#e8e0d0', shirtD: '#c4baa6', belt: '#3a2414', pants: '#3f5a7a', pantsD: '#2c4058', shoes: '#2a1a12' };
const GUNNER_LOOK = Object.assign({}, PIRATE_LOOK, { hair: '#3a3028', hatC: '#3a3a44', hatD: '#2a2a32', shirt: '#7a6a55' });
const VANE_LOOK = { skin: '#d8b090', skinD: '#b89070', hair: '#2a1e18', hairD: '#1a1210', style: 'long', beard: '#2a1e18', hat: 'cap', hatC: '#14141a', hatD: '#0a0a0e', shirt: '#7a2f30', shirtD: '#5a2122', cape: '#14141a', belt: '#e0b85a', pants: '#22222a', pantsD: '#16161c', shoes: '#14141a' };

Object.assign(FOES, {
  gaoler: { name: 'Gaoler', hp: 120, dmg: 16, speed: 56, vision: 120, reach: 22, cool: 0.9, xp: 20, human: true, heavy: true, gaoler: true, look: GAOLER_LOOK, gold: [10, 40], drops: [['smoke_vial', 1, 1, 0.2]] },
  hound: { name: 'Gaol Hound', hp: 55, dmg: 12, speed: 86, vision: 110, reach: 18, cool: 0.8, xp: 12, gaoler: true, drops: [], gold: [0, 0] },
  crossbow: { name: 'Gaol Crossbowman', hp: 70, dmg: 15, speed: 48, vision: 140, reach: 130, cool: 1.6, xp: 18, human: true, ranged: true, gaoler: true, look: Object.assign({}, GAOLER_LOOK, { shirt: '#4a4a3a', shirtD: '#36362a' }), gold: [10, 30], drops: [['arrow', 3, 6, 0.7]] },
  kessick: { name: 'Gaolmaster Kessick', hp: 1100, dmg: 28, speed: 50, vision: 260, reach: 26, cool: 0.85, xp: 250, human: true, heavy: true, boss: true, slam: true, unique: true, scale: 1.4, look: KESSICK_LOOK, gold: [600, 600], drops: [] },
  pirate: { name: 'Red Gull Pirate', hp: 95, dmg: 15, speed: 62, vision: 120, reach: 22, cool: 0.85, xp: 16, human: true, look: PIRATE_LOOK, gold: [20, 60], drops: [['pearl', 1, 1, 0.12]] },
  gunner: { name: 'Red Gull Gunner', hp: 60, dmg: 16, speed: 50, vision: 150, reach: 130, cool: 1.7, xp: 16, human: true, ranged: true, look: GUNNER_LOOK, gold: [10, 40], drops: [] },
  brute: { name: 'Red Gull Brute', hp: 230, dmg: 24, speed: 40, vision: 110, reach: 26, cool: 1.2, xp: 30, human: true, heavy: true, scale: 1.25, look: Object.assign({}, PIRATE_LOOK, { shirt: '#5a4a38', shirtD: '#44382a', style: 'bald', hat: null }), gold: [30, 80], drops: [['pearl', 1, 1, 0.3]] },
  gull: { name: 'Thief Gull', hp: 18, dmg: 6, speed: 88, vision: 90, reach: 16, cool: 0.9, xp: 4, wobble: true, drops: [['fiber', 1, 1, 0.3]], gold: [0, 3] },
  vane: { name: 'Captain Vane', hp: 1000, dmg: 26, speed: 60, vision: 260, reach: 26, cool: 0.8, xp: 250, human: true, heavy: true, boss: true, slam: true, unique: true, scale: 1.3, look: VANE_LOOK, gold: [800, 800], drops: [['cutlass', 1, 1, 1]] },
});

// ---- People ----------------------------------------------------------------
NPCS.pip.where = () => (S.quests.g1 && !qDone('g4') ? [[360, 'gaol', 23, 15]] : null);
NPCS.corvin.where = () => {
  if (!S.quests.g2) return null;
  if (!Memory.get('corvin_free')) return [[360, 'blackwing', 43, 6]];
  return qDone('g4') ? [[360, 'inn', 12, 8], [1320, 'village', 44, 16, true]] : [[360, 'gaol', 20, 14]];
};

npc({ id: 'kessick', name: 'Gaolmaster Kessick', role: 'Master of the Black Wing', remote: true, minor: true, gone: () => true, look: KESSICK_LOOK, sched: [[360, 'blackwing', 25, 5]], loves: [], likes: [], hates: [], greet: ['...'], chat: [{ h: 0, t: '...' }], reactions: [] });
npc({ id: 'ysolde', name: 'Ysolde', role: 'The King\'s alchemist', remote: true, minor: true, gone: () => true, look: { skin: '#e0d0c0', skinD: '#c0b0a0', hair: '#f0f0f0', hairD: '#c8c8c8', style: 'long', shirt: '#5a6e70', shirtD: '#44565a', pants: '#44565a', pantsD: '#303e42' }, sched: [[360, 'blackwing', 18, 24]], loves: [], likes: [], hates: [], greet: ['...'], chat: [{ h: 0, t: '...' }], reactions: [] });

npc({
  id: 'ness', name: 'Ness', role: 'Fisher of Saltmere', remote: true,
  gone: () => !(S.quests.p2 && (S.quests.p2.stage >= 1 || S.quests.p2.state === 'done')),
  where: () => (Memory.get('ness_free') ? [[360, 'saltmere', 56, 31]] : [[360, 'gullsteeth', 32, 22]]),
  look: { skin: '#b98a64', skinD: '#986e4c', hair: '#c8a050', hairD: '#a08038', style: 'long', shirt: '#4a6a7a', shirtD: '#38525e', pants: '#54483e', pantsD: '#3e342c' },
  sched: [[360, 'gullsteeth', 32, 22]],
  loves: ['snapper', 'mackerel'], likes: ['kind:fish'], hates: [],
  greet: ['Tide is in. Feels like good luck, for once.', 'Ahoy, Tam.'],
  chat: [{ h: 0, t: 'My father fished these waters before the Red Gull ever came. I mean to fish them after.' }, { h: 2, t: 'The people you brought back still sit on the beach at dusk, just looking at the sea. I think they are making sure it stays empty.' }],
  reactions: [],
});

npc({
  id: 'vane', name: 'Captain Vane', role: 'Master of the Red Gull', remote: true,
  gone: () => !((Story.rescued('captive') >= 3 && !Memory.get('vane_done')) || Memory.get('vane_spared')),
  where: () => (Memory.get('vane_spared') ? [[360, 'saltmere', 58, 26]] : [[360, 'redgull', 20, 10]]),
  look: VANE_LOOK, sched: [[360, 'redgull', 20, 10]],
  loves: ['stew'], likes: ['kind:food', 'kind:fish'], hates: [],
  greet: ['Farmer.', 'The sea is wide. Your patience is not, I think.'],
  chat: [{ h: 0, t: 'I sailed grain for a King who never ate it, and chains for a King who never wore them. Trade is better. Ask me what I have.' }],
  reactions: [],
  extra(opts) { if (Memory.get('vane_spared')) opts.push({ text: 'Trade', fn: () => UI.push(UI.shop('pirate', 'vane')) }); },
});

NPCS.wick.sched = [[360, 'saltmere', 62, 12], [720, 'saltmere', 55, 31], [1080, 'saltmere', 62, 12], [1260, 'saltmere', 62, 11, true]];

// ---- The Black Wing ----------------------------------------------------------
quest({
  id: 'g1', title: 'Pip\'s Letter', giver: 'pip', main: true, auto: true, req: () => !!Memory.get('final_choice'),
  stages: [
    { desc: 'A letter has come for you. Check the mailbox outside your farmhouse.', goals: [{ type: 'flag', flag: 'got_pip_letter', label: 'Check your mailbox' }], say: false },
    { desc: 'Meet Pip inside Ironback Gaol, at the top of the Ironback Pass. The gate is open to you now.', goals: [], turnin: 'pip', done: [
      'You came! I knew you would. Nobody else reads their post.',
      { if: () => S.ending === 'expose', then: ['When the Crown fell, the guards ran and we walked out the front gate. All of us who were written down, anyway.'], else: ['The Warden\'s seal on you, is it? Brann nearly fell over himself letting you in.'] },
      'There is a wing under this place, Tam. The Black Wing. They kept people there who were never written in any book. No names, no sentence, no end.',
      'Corvin went down to look for someone three days ago. He has not come back up.',
      'The trapdoor is by the evidence locker. Bring lockpicks. And watch out for the Eyes.',
      [ME, 'The eyes?'],
      'Crown artificers set them in the walls. Glass eyes that turn and look. If one sees you for more than a breath, every bell in the place goes off. Smoke blinds them. So does a pickaxe, if you get behind one.',
    ] },
  ],
  deed: 'Answered Pip\'s letter.',
});

quest({
  id: 'g2', title: 'The Black Wing', giver: 'pip', main: true, auto: true, req: () => qDone('g1'),
  stages: [
    { desc: 'Pick the trapdoor beside the evidence locker in the gaol\'s guard room and go down into the Black Wing.', goals: [{ type: 'goto', map: 'blackwing', x: 25, y: 35, r: 4, label: 'Enter the Black Wing' }], say: false },
    { desc: 'Corvin is behind a sigil door. Find a Warden\'s Sigil: try the control room in the north-west, where a lever also shuts the Watcher Eyes down. A spare uniform hangs by the entrance.', goals: [{ type: 'have', item: 'warden_sigil', n: 1, keep: true, label: 'Find a Warden\'s Sigil' }], say: false },
    { desc: 'Find Corvin behind the sigil door in the north-east of the Black Wing.', goals: [], turnin: 'corvin', done: [
      'Tam? Oh, thank the Green. I thought I would die down here and finally be written down somewhere.',
      'I came for one woman. Ysolde. She was the King\'s alchemist. She brokered his bargain in Year 76, and he locked her down here so nobody would ever know who to blame.',
      'She is still alive. Fifty-two years. And she is not the only one. There are four cells in the west block. None of them have names on the door.',
      'The Gaolmaster, Kessick, still runs this place as if nothing above had changed. His ledger is in the records room, east. Get them out. Get the ledger. I will wait for you upstairs.',
      { do() { Memory.flag('corvin_free'); People.seat(People.get('corvin')); } },
    ] },
  ],
  reward: { gold: 500 }, deed: 'Found Corvin in the Black Wing.',
});

quest({
  id: 'g3', title: 'The Unwritten', giver: 'corvin', main: true, auto: true, req: () => qDone('g2'),
  stages: [{ desc: 'Free the four prisoners in the west cell block (pick each cell door) and take the Gaolmaster\'s ledger from the records room in the east. Then meet Corvin upstairs in the gaol guard room.', goals: [{ type: 'rescue', item: 'unwritten', n: 4, label: 'Prisoners freed' }, { type: 'have', item: 'black_ledger', n: 1, keep: true, label: 'The Gaolmaster\'s ledger' }], turnin: 'corvin', done: [
    'Four. You brought out four people the world forgot. Ysolde would not stop touching the walls on the way up. She said she had forgotten what dry stone felt like.',
    'And the ledger. Every name Kessick ever held, and who sent them. Half of these orders are signed by the Crown. The other half are signed by Kessick, and nobody else.',
    'He was not just following orders, Tam. He liked it. He is in his chamber at the top of the north stair. Finish it, however you think best.',
  ] }],
  reward: { gold: 800 }, deed: 'Freed the Unwritten from the Black Wing.',
});

quest({
  id: 'g4', title: 'The Gaolmaster', giver: 'corvin', main: true, auto: true, req: () => qDone('g3'),
  stages: [
    { desc: 'Confront Gaolmaster Kessick in his chamber at the north end of the Black Wing, through the sigil door. Press E on his desk.', goals: [{ type: 'flag', flag: 'kessick_done', label: 'Deal with Kessick' }], say: false },
    { desc: 'Tell Pip it is over. He is waiting in the gaol guard room.', goals: [], turnin: 'pip', done: [
      { if: () => Memory.get('kessick_surrendered'), then: ['He walked up those stairs in his own chains? You are a strange one, Tam. A good strange.'], else: ['Kessick is dead, then. I will not pretend I am sorry.'] },
      'Corvin is writing their names down. All of them. He says that is the first thing you do, when somebody has been forgotten.',
      'Here. Kessick\'s pick. It opened every lock down there. It should belong to someone who opens doors for better reasons.',
    ] },
  ],
  reward: { gold: 3000, items: [['master_pick', 1]], trust: { pip: 300, corvin: 300 } }, deed: 'Closed the Black Wing for good.', gossip: true,
  then: [[null, 'THE BLACK WING: COMPLETE'], [null, 'Ironback Gaol stands empty and open. Whatever the Crown buried there, you have dug up.']],
});

// ---- The Red Gull ----------------------------------------------------------
quest({
  id: 'p1', title: 'A Second Chance', giver: 'wick', main: true, req: () => !!Memory.get('final_choice'),
  needs: () => [['Finish the main story', !!Memory.get('final_choice')]],
  offer: [
    'That wreck on the beach. I watched her go down in Year 76. I have watched her rot ever since.',
    'Her keel is sound. Give her timber, iron, rope and pitch, and she would float again. I am too old to sail her. You are not.',
  ],
  stages: [
    { desc: 'Gather 60 wood, 10 iron ore, 40 fiber (for rope) and 10 sap (for pitch) for the wreck on Saltmere beach.', goals: [
      { type: 'have', item: 'wood', n: 60, keep: true, label: 'Wood' }, { type: 'have', item: 'iron', n: 10, keep: true, label: 'Iron Ore' },
      { type: 'have', item: 'fiber', n: 40, keep: true, label: 'Fiber' }, { type: 'have', item: 'sap', n: 10, keep: true, label: 'Sap' }], say: false },
    { desc: 'Press E on the wreck on Saltmere beach to repair her.', goals: [{ type: 'flag', flag: 'ship_fixed', label: 'Repair the ship' }], say: false },
  ],
  deed: 'Made the wreck on Saltmere beach seaworthy.',
  then: [[null, 'She floats. Press E on her to set sail.']],
});

quest({
  id: 'p2', title: 'The Red Gull', giver: 'wick', main: true, auto: true, req: () => qDone('p1'),
  stages: [
    { desc: 'Set sail from your ship on Saltmere beach. Something is waiting out on the water.', goals: [{ type: 'flag', flag: 'naval_won', label: 'Survive the pirate ship' }], say: false },
    { desc: 'Land on Gull\'s Teeth and find the pirate camp in the middle of the island.', goals: [{ type: 'goto', map: 'gullsteeth', x: 30, y: 20, r: 6, label: 'Find the pirate camp' }], say: false },
    { desc: 'Someone is tied up in the pirate camp. Talk to her.', goals: [], turnin: 'ness', done: [
      'Untie me, quick. Thank you. I am Ness. I fish out of Saltmere, or I did.',
      'They are the Red Gull. They used to sail for the Crown, hauling grain one way and chains the other. Nobody gives them orders any more, so now they take what they want.',
      'They took eleven of us off the beach last month. Three are still in the hold of their ship, off the north shore. They mean to sell them across the sea.',
      'There is a rowboat at the north pier. I will get back to Saltmere and warn them. You get our people out.',
      { do() { Memory.flag('ness_free'); People.seat(People.get('ness')); } },
    ] },
  ],
  deed: 'Found the Red Gull\'s camp on Gull\'s Teeth.',
});

quest({
  id: 'p3', title: 'Boarding Party', giver: 'ness', main: true, auto: true, req: () => qDone('p2'),
  stages: [
    { desc: 'Take the rowboat from the north pier of Gull\'s Teeth to the Red Gull, go below decks through the hatch, and break open the cages in the hold.', goals: [{ type: 'rescue', item: 'captive', n: 3, label: 'Captives freed' }], say: false },
    { desc: 'The captain is waiting for you on deck.', goals: [], turnin: 'vane', done: [
      'So. The farmer who brought down a King comes to take my ship. I have heard of you.',
      'The Crown owned this ship, and everyone on it. We hauled their chains and their lime. When they were gone, we were nothing. A man has to eat.',
      'My mother was from Mossbrook, you know. I have not been back in thirty years.',
      { ask: 'Captain Vane draws his cutlass, slowly, and waits.', opts: [
        { t: '[Persuasion 4] "Hesper Vane. She kept bees. Her grave is in Mossbrook."', lock: () => S.skills.persuasion.lvl >= 4, xp: ['persuasion', 100], do() { Memory.flag('vane_spared'); Memory.flag('vane_done'); Memory.deed('vane_spared', 'Talked Captain Vane into giving up piracy.', { gossip: true }); People.seat(People.get('vane')); }, then: ['...She kept bees. She did. I had forgotten.', 'Keep your captives. I am done with this. Find me at Saltmere, if you ever want to trade honestly.'] },
        { t: 'Pay him 2000g to leave these waters for good.', lock: () => S.gold >= 2000, do() { S.gold -= 2000; Memory.flag('vane_done'); Memory.flag('vane_paid'); Memory.deed('vane_paid', 'Paid Captain Vane to sail away and never come back.'); }, then: ['Gold. Well, that is what we were always in it for. Farewell, farmer.'] },
        { t: 'Fight him.', do() { Story.fightVane(); } },
      ] },
    ] },
  ],
  deed: 'Boarded the Red Gull.',
});

quest({
  id: 'p4', title: 'Home Waters', giver: 'ness', main: true, auto: true, req: () => qDone('p3') && !!Memory.get('vane_done'),
  stages: [{ desc: 'Sail home and tell Ness, on Saltmere beach, that her people are free.', goals: [], turnin: 'ness', done: [
    'You brought them home. All of them. Look at them, sitting on the sand like they cannot believe it is real.',
    { if: () => Memory.get('vane_spared'), then: ['And Vane is on our beach, selling pearls like an honest man. I will believe it when I see a full year of it.'] },
    'Take this. It was in his cabin. Wick says it was his once, a long time ago, when the ship had another name.',
  ] }],
  reward: { gold: 2500, items: [['spyglass', 1]], trust: { ness: 300 }, rep: { town: 2 } }, deed: 'Brought the captives of the Red Gull home.', gossip: true,
  then: [[null, 'THE RED GULL: COMPLETE'], [null, 'Your ship can carry you between Saltmere and Gull\'s Teeth whenever you like.']],
});
