'use strict';
// Stage 5: Acts Two to Five. The Kept, the Inquisitor, the King, and the Heart.

item('royal_writ', 'Royal Writ', 'quest', 0, ['letter'], 'Sealed in green wax. It opens the King\'s Gate.');
item('undercroft_key', 'Undercroft Key', 'quest', 0, ['key', '#4f9642', '#2f6b45'], 'Cold, and faintly damp. It opens the door beneath the royal garden.');
item('joren_letter', 'Joren\'s Last Letter', 'relic', 0, ['page'], 'Your grandfather\'s handwriting, gone shaky.', { lore: '"Tam. I came to cut it out and I am not strong enough. The roots have my legs now. It does not hurt as much as it should. Read them their names. That is all they ever wanted. Someone saying them out loud. - J."' });
item('warden_seal', 'Warden\'s Seal', 'relic', 0, ['ring', '#4f9642', '#2f6b45'], 'The King\'s green seal. It makes doors open and people look away.', { lore: 'Given to the Warden of the West, keeper of the stone. The last one to wear it was Joren Ashgrove. He took it off, in the end.' });
item('reed_locket', 'Hanne Moss\'s Locket', 'relic', 0, ['ring', '#c9a06a', '#92693c'], 'Found in a house on Reed Lane.', { lore: 'Inside, two locks of hair, one brown and one fair, tied with blue thread. On the back: "H and T. Year 74."' });

const THORNE_LOOK = { skin: '#e8d0b8', skinD: '#c8b098', hair: '#1a1820', hairD: '#0e0c12', style: 'long', shirt: '#2a2a34', shirtD: '#1a1a22', cape: '#141418', belt: '#c8ccd4', pants: '#22222a', pantsD: '#16161c', shoes: '#101014' };
const KING_LOOK = { skin: '#f0d8bc', skinD: '#d0b89c', hair: '#d8b040', hairD: '#b08a28', style: 'short', hat: 'crown', shirt: '#2f6b45', shirtD: '#22502f', cape: '#7a2f30', belt: '#e0b85a', pants: '#22502f', pantsD: '#183a22', shoes: '#3a2414' };
const DELL_LOOK = { skin: '#d8b090', skinD: '#b89070', hair: '#6a5038', hairD: '#4e3a28', style: 'messy', beard: '#6a5038', shirt: '#7a7266', shirtD: '#5e584e', pants: '#54483e', pantsD: '#3e342c', shoes: '#3a2414' };

FOES.thorne = { name: 'Inquisitor Thorne', unique: true, hp: 650, dmg: 23, speed: 66, vision: 220, reach: 24, cool: 0.75, xp: 120, human: true, heavy: true, boss: true, look: THORNE_LOOK, gold: [400, 400], drops: [] };
FOES.king = { name: 'Oswin, the Evergreen King', unique: true, hp: 1500, dmg: 30, speed: 50, vision: 300, reach: 28, cool: 0.9, xp: 400, human: true, heavy: true, boss: true, slam: true, scale: 1.5, look: KING_LOOK, gold: [0, 0], drops: [] };
FOES.rootling = { name: 'Rootling', hp: 75, dmg: 15, speed: 44, vision: 100, reach: 20, cool: 1.0, xp: 16, heavy: true, drops: [['sap', 1, 3, 0.8], ['fiber', 1, 3, 0.5]], gold: [0, 0] };

// The Kept, and what each one wants before they will remember.
const SPROUTS = {
  moss: { name: 'Hanne Moss', want: 'herb', boost: 'Watered crops sometimes grow two days in one night.', color: ['#a8e0b0', '#c8f0cc', '#74b890'],
    lines: ['It sniffs the silverleaf, then eats it, leaf by leaf, watching you the whole time.', 'It shows you, somehow, a kitchen. Flour on a table. Someone laughing.', 'Her name was Hanne Moss. She baked bread on Reed Lane. She was going to be married in the spring.'] },
  reed: { name: 'Tobias Reed', want: 'carp', boost: 'Waters some of your dry crops every morning.', color: ['#a8c8e0', '#cce0f0', '#7898b8'],
    lines: ['It holds the fish like something precious, and then lets it go into the soil.', 'It shows you a ferry rope, and the river at dawn, and a boy who could swim like an otter.', 'His name was Tobias Reed. He ran the ferry. He tried to carry people across when the water came. He was nineteen.'] },
  tally: { name: 'Eda Tallow', want: 'copper', boost: 'Your crops come up silver and gold more often.', color: ['#e0c8a0', '#f0dcc0', '#b89870'],
    lines: ['It turns the ore over and over, counting something on its fingers.', 'It shows you a mine-face and a lamp, and a tally board scratched in fives.', 'Her name was Eda Tallow. She kept the count at the old mine. She counted the days after the flood, from underground, for as long as she could.'] },
  bell: { name: 'Brother Aldo', want: 'quartz', boost: 'Your hens always lay, and the farm grows more wild food.', color: ['#e0e0b0', '#f0f0d0', '#b8b880'],
    lines: ['It holds the crystal up to the moon and makes a sound like a very small bell.', 'It shows you a bell tower, and a rope, and a hand pulling it as hard as it can, again and again.', 'His name was Brother Aldo. He rang the bell to warn them. He was still ringing it when the water reached the tower.'] },
};

npc({
  id: 'thorne', name: 'Inquisitor Thorne', role: 'The Crown\'s Inquisitor', remote: true,
  gone: () => !Memory.get('thorne_here') || !!Memory.get('thorne_gone'),
  look: THORNE_LOOK,
  sched: [[360, 'village', 34, 21], [1080, 'inn', 10, 7], [1320, 'village', 45, 38, true]],
  loves: [], likes: [], hates: ['kind:forage'], pockets: { gold: [60, 140] },
  greet: ['Farmer.', 'I am watching you. I want you to know that.', 'Do not waste my time.'],
  chat: [
    { h: 0, t: 'I have served the Crown for fifteen years. I have never once asked what the Tithe is for. That is what makes me good at my work.' },
    { h: 0, t: 'Your village is very quiet. Quiet villages always have the loudest secrets.' },
  ],
  reactions: [],
});

npc({
  id: 'king', name: 'King Oswin', role: 'The Evergreen King', remote: true,
  gone: () => Memory.get('crown_fallen'),
  where: () => S.quests.a5_1 && S.quests.a5_1.state === 'active' ? [[360, 'undercroft', 21, 9]] : null,
  look: KING_LOOK,
  sched: [[360, 'throne', 10, 4]],
  loves: [], likes: [], hates: [],
  greet: ['Ashgrove.', 'Joren\'s grandson. Come closer.', 'The valley sends its best, I see.'],
  chat: [
    { h: 0, t: 'I have ruled for a hundred and twenty-eight years. You would be amazed how little changes, and how much it costs to keep it that way.' },
    { h: 0, t: 'Your grandfather stood exactly where you are standing. He was younger. He was more afraid.' },
  ],
  reactions: [],
});

npc({
  id: 'dell', name: 'Dell Hale', role: 'Marta\'s husband', remote: true,
  gone: () => !(Memory.get('dell_home') || Memory.get('dell_rescued') || (S.quests.a4_3 && S.quests.a4_3.state === 'active' && !Memory.get('dell_to_king'))),
  where: () => (Memory.get('dell_home') || Memory.get('dell_rescued')) ? [[360, 'store', 8, 4], [1140, 'inn', 9, 9], [1290, 'store', 8, 4]] : null,
  look: DELL_LOOK,
  sched: [[360, 'greywood', 43, 41]],
  loves: ['stew', 'strawberry'], likes: ['kind:food'], hates: [],
  greet: ['I still wake up thinking I am down there.', 'Tam. Good to see you.', 'Marta is counting the shelves again. It is the best sound in the world.'],
  chat: [
    { h: 0, t: 'Nine years. I kept a coat by the door, she tells me. Nine years she kept a coat by the door.' },
    { h: 0, t: 'If you ever go under the palace, do not listen to the roots. They hum. You start humming back.' },
  ],
  reactions: [],
});

NPCS.bram.gone = () => Memory.get('bram_taken') && !Memory.get('bram_rescued');
NPCS.bram.where = () => Memory.get('bram_arrested') && !Memory.get('bram_freed') && !Memory.get('bram_taken') ? [[360, 'gaol', 2, 4]] : null;
NPCS.marta.reactions.unshift({ id: 'dell_home_marta', if: () => Memory.get('dell_home') || Memory.get('dell_rescued'), t: 'He walked in through that door, Tam. Thin as a rake, and he walked in through that door, and he said my name. I do not know what you did. I do not want to know. Thank you.' });
NPCS.marta.reactions.unshift({ id: 'dell_taken_marta', if: () => Memory.knows('marta', 'dell_taken'), t: 'You found him. You found him, and you gave him to the King. Get out of my shop.' });
NPCS.ansa.reactions.unshift({ id: 'ending_ansa', if: () => S.ending === 'expose', t: 'I said every one of their names this morning. It took me until noon. I have never been so glad to be so tired.' });
NPCS.ansa.reactions.unshift({ id: 'ending_keep_ansa', if: () => S.ending === 'keep', t: 'The little green ones are gone from your fields, I hear. I will not ask. I do not think I could stand to hear the answer.' });
NPCS.odile.reactions.unshift({ id: 'ending_odile', if: () => S.ending === 'expose', t: 'No more lists come from the capital. No more names. They have made me Warden of Mossbrook, Ashgrove, and the first thing I did was burn my notebook. I had read it enough.' });
NPCS.bram.reactions.unshift({ id: 'bram_rescued', if: () => Memory.get('bram_rescued'), t: 'I was in the roots, boy. I could hear them all singing. I could hear Joren. Then I heard you, saying their names. I do not know how to thank you, so I am not going to try.' });

// ---- Act Two ---------------------------------------------------------------
quest({
  id: 'a2_1', title: 'The Kept', giver: 'ansa', main: true, req: () => !!Memory.get('act1_done'),
  needs: () => [['Finish Act One', !!Memory.get('act1_done')]],
  offer: [
    'You saw one, by the stone. Do not look so surprised. Your grandfather saw them too.',
    'The old shrine-books call them the Kept. They come up where something was buried that should not have been. They want what they lost.',
    'Go back after dark. Take something from the wild with you. Silverleaf, perhaps.',
  ],
  stages: [{ desc: 'After dark, go to the stone in the south-east corner of your farm. A small green sprout comes out. Hold what it wants and press E.', goals: [{ type: 'sprout', n: 1, label: 'Befriend a sprout' }], turnin: 'ansa', done: [
    'It took it from your hand? And it looked at you? Then it remembers something. Keep going back. Keep listening.',
    [ME, 'It is not just a plant, is it.'],
    'No, child. It is not.',
  ] }],
  reward: { trust: { ansa: 80 } }, deed: 'Made a friend of one of the Kept.',
});

quest({
  id: 'a2_2', title: 'Rumours of the Evergreen', giver: 'sera', main: true, req: () => qDone('a2_1'),
  needs: () => [['Finish "The Kept"', qDone('a2_1')]],
  offer: [
    'People talk about the King when they have had enough to drink. I used to sell what I heard. Lately I have started listening for myself.',
    'Ask Old Wick about the coins. Ask Dara Whitlock about the royal gardens. Ask Sgt. Varr what she does every autumn. Then come back and tell me I am imagining things.',
  ],
  stages: [
    { desc: 'Ask Old Wick, on Saltmere Coast, about the King\'s coins.', goals: [], turnin: 'wick', done: [
      'Coins? I have a purse of them going back to my grandmother. Look. Year 3. Year 40. Year 90. This year.',
      'Same face. Not a day older. Not one grey hair in a hundred and twenty-eight years. You tell me how a man does that.',
    ] },
    { desc: 'Ask Dara Whitlock, at the stables, about the royal gardens.', goals: [], turnin: 'dara', done: [
      'The palace buys strong horses from me for its gardeners. They pull carts of mud from our river bank, east, every week.',
      'I have never had one back. Not one. And the gardeners never come into town.',
    ] },
    { desc: 'Ask Sgt. Varr what she does every autumn.', goals: [], turnin: 'odile', done: [
      'Every autumn a list comes from the capital. Names. Mostly people nobody will miss. I take them to the King\'s Gate and I hand them over.',
      'I was told it is a labour levy. I have never seen one of them come back. I write all their names down. I do not know why I am telling you this.',
    ] },
    { desc: 'Tell Sera what you heard.', goals: [], turnin: 'sera', done: [
      'A King who never ages. Mud carted east from our river. People sent east who never come home.',
      'I sold names to the Crown for years, Tam, and told myself it was harmless. Find out what is under all this. I will not be selling yours.',
    ] },
  ],
  reward: { gold: 300, trust: { sera: 80 } }, deed: 'Pieced together the rumours about the King.',
});

quest({
  id: 'a2_3', title: 'The Names', giver: 'bram', main: true, req: () => qDone('a2_2') && qDone('r6'),
  needs: () => [['Finish "Rumours of the Evergreen"', qDone('a2_2')], ['Bring back the Tithe Roll from the Old Keep ("The Old Keep" quest)', qDone('r6')]],
  offer: [
    'You have the Roll. And you have been talking to the little green ones, Ansa tells me.',
    'Take the Roll to the stone tonight. Read them their names, all of them. Somebody ought to have done it fifty years ago.',
  ],
  stages: [
    { desc: 'After dark, stand at the stone with the Tithe Roll in your pack and press E to read the names.', goals: [{ type: 'flag', flag: 'read_names', label: 'Read the names at the stone' }], say: false },
    { desc: 'Talk to Old Bram about what happened at the stone.', goals: [], turnin: 'bram', done: [
      'Ansa told me. They came up out of the ground, every one of them.',
      [ME, 'You knew them. Didn\'t you.'],
      'I was there, boy. Year 76. River detail. Your grandfather and me, and forty others. We were told we were building a flood barrier.',
      'We took the bridge down in the dark so they could not run. Then they opened the sluices.',
      { if: () => !!S.known.bram_medal, then: ['You have my medal, I think. You can keep it. I never wanted it.'] },
      'Joren spent his whole life on that farm trying to make it up to them. Last winter he told me he was going to the capital to put it right. He did not come back.',
    ] },
  ],
  reward: { trust: { bram: 150 }, flag: 'act2_done' }, deed: 'Read the names of the drowned at the stone.', gossip: true,
  then: [[null, 'END OF ACT TWO'], [null, 'The Kept remember who they were. Soon, someone will come to make sure you forget.']],
});

// ---- Act Three -------------------------------------------------------------
quest({
  id: 'a3_1', title: 'The Inquisitor', giver: 'odile', main: true, req: () => !!Memory.get('act2_done'),
  needs: () => [['Finish Act Two', !!Memory.get('act2_done')]],
  offer: [
    'A Crown Inquisitor rode in at dawn. Maelis Thorne. She asked for you by name, Ashgrove. And for Bram Hollis.',
    'She is in the square. Go and talk to her before she comes to talk to you.',
  ],
  accept() { Memory.flag('thorne_here'); People.seat(People.get('thorne')); },
  stages: [{ desc: 'Speak to Inquisitor Thorne in the town square.', goals: [], turnin: 'thorne', done: [
    'Tam Ashgrove. Joren\'s grandson. You have been busy. Graves, keeps, stones. Little green things in your fields at night.',
    { ask: '"Tell me what you have been doing, farmer."', opts: [
      { t: '[Persuasion 3] "Farming. Badly. Ask anyone."', lock: () => S.skills.persuasion.lvl >= 3, xp: ['persuasion', 60], do() { Memory.flag('thorne_doubt'); }, then: ['...Perhaps. Perhaps you are only a farmer. Your friend, however, is not.'] },
      { t: '"Ask your King what happened in Year 76."', do() { Memory.deed('defied_thorne', 'Told the Inquisitor to ask her King about Year 76.', { gossip: true, rep: { crown: -2, town: 1 } }); }, then: ['Careful. I have hanged men for less than that sentence.'] },
      { t: '"Bram never told me anything."', do() { Memory.deed('lied_thorne', 'Tried to shield Bram from the Inquisitor with a lie.'); }, then: ['Interesting. I did not ask about Bram.'] },
    ] },
    'Bram Hollis is under arrest for sedition. He sits in Ironback Gaol until the autumn levy takes him east. A week, perhaps less.',
    { do() { Story.arrestBram(); } },
  ] }],
  deed: 'Faced the Crown\'s Inquisitor.',
});

quest({
  id: 'a3_2', title: 'Bring Bram Home', giver: 'odile', main: true, auto: true, req: () => qDone('a3_1'),
  stages: [{ desc: 'Bram is in Ironback Gaol, and the levy takes him east in 7 days. Sgt. Varr might bend the law for a good enough reason. Gaoler Brann takes bribes. Thorne wants the Tithe Roll. Or go at night to the culvert below the gaol, with a lockpick.', goals: [{ type: 'flag', flag: 'bram_freed', label: 'Free Old Bram' }], say: false }],
  deed: 'Got Old Bram out of Ironback Gaol.',
});

quest({
  id: 'a3_3', title: 'The Inquisitor\'s Due', giver: 'thorne', main: true, auto: true, req: () => S.quests.a3_2 && S.quests.a3_2.state !== 'active',
  stages: [{ desc: 'Inquisitor Thorne wants a final word. Find her in town.', goals: [], turnin: 'thorne', done: [
    { if: () => Memory.get('bram_freed'), then: ['So. Bram Hollis walks free. I could have you both hanged for it.'], else: ['The levy took Bram Hollis east this morning. I am told you tried to stop it.'] },
    'I have read every page of your file, farmer. Every stone you turned over. I want to know why.',
    { ask: 'Thorne waits, one hand resting on her sword.', opts: [
      { t: '[Persuasion 4] Show her the last page of the Tithe Roll.', if: () => Inv.count('tithe_roll') > 0, lock: () => S.skills.persuasion.lvl >= 4, xp: ['persuasion', 100], do() { Memory.flag('thorne_ally'); Memory.deed('thorne_ally', 'Showed Inquisitor Thorne the Tithe Roll, and she believed you.'); }, then: ['...These names. This year\'s names. My brother is on this page.', 'I am going to tell the King you are harmless. Then I am going to find out whether any of this is true. If it is, I will be standing beside you when it matters.'] },
      { t: '"Because someone has to. Now get out of my valley."', do() { Memory.deed('thorne_warned', 'Sent Inquisitor Thorne away with a warning.'); }, then: ['Brave. Stupid, but brave. The King will want to see you himself, now.'] },
      { t: 'Draw your weapon.', do() { Story.fightThorne(); } },
    ] },
    { do() { if (!Memory.get('thorne_fight')) { Memory.flag('thorne_gone'); People.get('thorne').hidden = true; } } },
  ] }],
  reward: { flag: 'act3_done' }, deed: 'Settled things with Inquisitor Thorne.',
  then: [[null, 'END OF ACT THREE'], [null, 'Word of you has reached the capital. Check your mailbox in the morning.']],
});

// ---- Act Four --------------------------------------------------------------
quest({
  id: 'a4_1', title: 'The King\'s Writ', giver: 'king', main: true, auto: true, req: () => !!Memory.get('act3_done'),
  stages: [
    { desc: 'Something has arrived in the mailbox outside your farmhouse.', goals: [{ type: 'flag', flag: 'got_writ', label: 'Check your mailbox' }], say: false },
    { desc: 'Take the King\'s Road east out of Mossbrook, through the King\'s Gate, to the Evergreen Court. The King waits in his throne room in the palace.', goals: [], turnin: 'king', done: [
      'So. You are Joren\'s grandson. You have his hands.',
      { if: () => S.dead.thorne, then: ['You killed my Inquisitor. I have others. I do not have many Ashgroves.'] },
      { if: () => Memory.get('thorne_ally'), then: ['Thorne tells me you are harmless. Thorne has never lied to me before. It is interesting that she has started.'] },
      { if: () => S.notoriety >= 60, then: ['I am told you are a thief. Good. Thieves understand what things are worth.'] },
      'Your grandfather served me well, once. Then he stopped. I should like to know which kind of servant you will be.',
      'Two things. Bring me the finest your soil can grow. And bring back a man who ran from me.',
    ] },
  ],
  deed: 'Stood before the King.',
});

quest({
  id: 'a4_2', title: 'Fruit of Ashgrove', giver: 'king', main: true, auto: true, req: () => qDone('a4_1'),
  stages: [{ desc: 'Bring the King 5 silver or gold quality crops grown on your farm.', goals: [{ type: 'have', kind: 'crop', q: 1, n: 5, label: 'Silver or gold crops' }], turnin: 'king', done: [
    [null, 'The King takes one in his bare hand and bites into it, skin and all, like a starving man.'],
    'It tastes of home. Of the river. You cannot imagine how hungry a man gets, in a hundred and twenty-eight years.',
  ] }],
  reward: { gold: 1500, rep: { crown: 2 } }, deed: 'Brought the King the fruit of Ashgrove.',
});

quest({
  id: 'a4_3', title: 'The Deserter', giver: 'king', main: true, auto: true, req: () => qDone('a4_1'),
  stages: [
    { desc: 'Find the deserter, a man named Hale. The King says he hides with the outlaws in south Greywood.', goals: [], turnin: 'dell', done: [
      'Do not shout. Please. You are the Ashgrove boy. Rusk talks about you.',
      [ME, 'Dell Hale. Marta\'s husband.'],
      'Marta. Is she... does she still... no. Do not tell me. I cannot hear it yet.',
      'They kept me under the palace for nine years. There are roots down there as thick as a house, and they run all the way west, under the ground, to our river.',
      'There are people in the roots. Asleep. And there is an old man from our valley who came to cut the roots out, and could not. He talked about you. Joren.',
      { ask: 'Dell watches you, too tired to run again.', opts: [
        { t: '"Go home to Marta. I will deal with the King."', do() { Memory.flag('dell_home'); Memory.deed('dell_home', 'Sent Dell Hale home to Marta, against the King\'s order.', { gossip: true, rep: { town: 2 } }); People.seat(People.get('dell')); }, then: ['...Home. I do not know how to thank you.'] },
        { t: '"You are coming with me to the King."', do() {
          Memory.flag('dell_to_king'); Memory.deed('dell_taken', 'Took Dell Hale to the King.', { gossip: true, rep: { crown: 3, town: -3 } });
          if (Memory.get('promise_marta')) Memory.deed('broke_promise_marta', 'Broke your promise to Marta.', { gossip: true });
          Trust.add('marta', -500);
        }, then: ['Then I am already dead. I hope he pays you well.'] },
      ] },
    ] },
    { desc: 'Report to the King about the deserter.', goals: [], turnin: 'king', done: [
      { if: () => Memory.get('dell_to_king'), then: ['Good. Take him below. You did not even hesitate. Joren hesitated.'], else: [
        { ask: '"Well? Where is my deserter?"', opts: [
          { t: '[Persuasion 4] "He drowned crossing the river."', lock: () => S.skills.persuasion.lvl >= 4, xp: ['persuasion', 80], do() { Memory.flag('king_fooled'); }, then: ['The river. Then he has gone home after all, in a manner of speaking. Very well.'] },
          { t: '"I let him go."', do() { Memory.flag('king_defied'); Memory.deed('defied_king', 'Told the King to his face that you let his prisoner go.', { gossip: true, rep: { crown: -4, town: 2 } }); }, then: ['...Honest. Joren was honest too. It did not help him.'] },
          { t: '"He got away from me."', do() { Memory.flag('king_suspicious'); }, then: ['Did he. Then I shall have to keep a closer eye on Hale\'s Goods.'] },
        ] },
      ] },
    ] },
  ],
  reward: { gold: 800 }, deed: 'Answered to the King for the deserter.',
});

// ---- Act Five --------------------------------------------------------------
quest({
  id: 'a5_1', title: 'The Green Heart', giver: 'king', main: true, req: () => qDone('a4_2') && qDone('a4_3'),
  needs: () => [['Finish "Fruit of Ashgrove"', qDone('a4_2')], ['Finish "The Deserter"', qDone('a4_3')]],
  offer: [
    'You have earned the truth. Joren earned it too, and could not carry it.',
    'Beneath my garden there is a door. Beneath the door is the reason this kingdom has never known a famine. Come down. I will be waiting at the Heart.',
  ],
  accept() { Inv.add('undercroft_key', 1); People.seat(People.get('king')); },
  stages: [
    { desc: 'Enter the undercroft through the door in the royal garden, east of the palace. Find the Heart at its far end.', goals: [{ type: 'goto', map: 'undercroft', x: 20, y: 9, r: 4, label: 'Find the Heart' }], say: false },
    { desc: 'Face the King at the Heart. Press E on the Heart.', goals: [{ type: 'flag', flag: 'final_choice', label: 'Make your choice' }], say: false },
  ],
  deed: 'Went down to the Green Heart.',
});
