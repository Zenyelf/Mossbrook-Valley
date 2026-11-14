'use strict';
// Every quest is a chain of stages. Choices are written into Memory and can unlock
// or permanently close other quests.

const ME = 'me';

// ---- Main story: Act I --------------------------------------------------
quest({
  id: 'm1', title: 'An Inheritance of Weeds', auto: true, main: true, quiet: true,
  stages: [
    { desc: 'Your grandfather left something on the table in the farmhouse.', goals: [{ type: 'flag', flag: 'read_letter', label: 'Read Joren\'s letter' }], say: false },
    { desc: 'The fields have gone wild. Break some ground and get something growing. Stand near the house, select the hoe, and swing.', goals: [
      { type: 'till', n: 4, label: 'Till soil' }, { type: 'plant', n: 4, label: 'Plant seeds' }, { type: 'water', n: 4, label: 'Water them' }] },
  ],
  deed: 'Broke ground on the Ashgrove plot for the first time.',
});

quest({
  id: 'm_crop', title: 'First Yield', auto: true, main: true, req: () => qDone('m1'),
  stages: [{ desc: 'Water your crops each morning and wait. Harvest them, then sell one in the shipping bin beside the house.', goals: [
    { type: 'harvest', n: 3, label: 'Harvest crops' }, { type: 'ship', n: 1, label: 'Put a crop in the shipping bin' }] }],
  reward: { gold: 200 }, deed: 'Sold the first crop from Ashgrove in over a year.',
});

quest({
  id: 'm2', title: 'People of Mossbrook', auto: true, main: true, req: () => qDone('m1'), giver: 'bram',
  stages: [
    { desc: 'Old Bram sits by the well in town during the day. He knew your grandfather. Take the road east from your farm.', goals: [], turnin: 'bram', done: [
      'So you came. You look like him around the jaw. I am sorry about that, and about the rest.',
      [ME, 'Do you know what happened to him?'],
      'He went walking in the snow. That is what happened, and that is all that I know, and you should stop looking at me like that.',
      'Go on and meet people. A farm needs neighbours more than it needs rain. Come back when you have shaken every hand.',
    ] },
    { desc: 'Introduce yourself around town. People keep regular hours, so check the shops and the square.', goals: [
      { type: 'talk', item: 'marta', label: 'Meet Marta at the store' }, { type: 'talk', item: 'ivo', label: 'Meet Ivo at the forge' },
      { type: 'talk', item: 'sera', label: 'Meet Sera at the inn' }, { type: 'talk', item: 'odile', label: 'Meet Sgt. Varr' },
      { type: 'talk', item: 'ansa', label: 'Meet Mother Ansa at the shrine' }, { type: 'talk', item: 'finn', label: 'Meet Finn near the river' }], turnin: 'bram', done: [
      'Well. Now they have all had a look at you, and you at them.',
      'Mind what you say to them, and mind what you do. This valley does not forget anything. It only pretends to.',
    ] },
  ],
  reward: { gold: 150, trust: { bram: 40 } }, deed: 'Shook every hand in Mossbrook.',
});

quest({
  id: 'm3', title: 'The King\'s Tithe', giver: 'odile', main: true, req: () => qDone('m2') && absDay() >= 8,
  needs: () => [['Finish "People of Mossbrook"', qDone('m2')], [`Wait until ${dateName(8)}`, absDay() >= 8]],
  offer: [
    'Ashgrove. Every holding in the kingdom gives a Tithe of its harvest, each season, by royal decree. Yours is five crops.',
    [ME, 'What does the King do with it?'],
    'That is not a question I have been asked before. Bring five crops.',
  ],
  stages: [{ desc: 'Sgt. Varr expects five crops of any kind for the King\'s Tithe.', goals: [{ type: 'have', kind: 'crop', n: 5, label: 'Crops for the Tithe' }], turnin: 'odile', noTake: true, done: [
    { ask: 'You have the crops. Sgt. Varr holds out the ledger.', opts: [
      { t: 'Pay the full Tithe.', do() { Inv.removeKind('crop', 5); Memory.deed('paid_tithe', 'Paid the King\'s Tithe in full.', { rep: { crown: 1 } }); }, then: ['Five. Correct. Sign here. The Crown remembers those who are prompt.'] },
      { t: '[Persuasion 1] "Blight took half my field." Pay two.', lock: () => S.skills.persuasion.lvl >= 1, xp: ['persuasion', 30], do() { Inv.removeKind('crop', 2); Memory.deed('lied_tithe', 'Lied to the Crown about a blight and paid a short Tithe.', { gossip: true, rep: { crown: -2, town: 1 } }); }, then: ['Hm. Blight. I will write that down exactly as you said it.'] },
      { t: '"Why does a good harvest need taxing at all?"', xp: ['persuasion', 40], do() { Inv.removeKind('crop', 5); Memory.flag('asked_tithe'); Memory.deed('questioned_tithe', 'Paid the Tithe, but asked Sgt. Varr why it exists.', { witness: ['odile'], rep: { crown: 1 } }); }, then: ['Five. Correct.', 'And Ashgrove? Do not ask that again where anyone else can hear it.'] },
    ] },
  ] }],
  reward: { gold: 100, trust: { odile: 40 } }, deed: 'Settled the King\'s Tithe.',
});

quest({
  id: 'm4', title: 'Names on the Stone', giver: 'bram', main: true,
  needs: () => [['Settle the King\'s Tithe', qDone('m3')], [`Old Bram trusts you: ${hearts('bram')}/2 hearts`, hearts('bram') >= 2], [`Villagers at 2+ hearts: ${Trust.countAtLeast(2)}/3`, Trust.countAtLeast(2) >= 3]],
  req: () => qDone('m3') && Trust.countAtLeast(2) >= 3 && hearts('bram') >= 2,
  offer: [
    'People talk about you now, and not badly. So I will say this once.',
    'Joren walked out to the far corner of your land every week, past the pond and south. There is a stone there. Go and read it.',
    [ME, 'What does it say?'],
    'Go and read it.',
  ],
  stages: [
    { desc: 'Find the stone in the far south-east corner of your farm.', goals: [{ type: 'flag', flag: 'saw_stone', label: 'Inspect the stone' }], say: false },
    { desc: 'Ask Old Bram what the stone is.', goals: [], turnin: 'bram', done: [
      [ME, 'There were names on it. Dozens. Someone scratched them all off.'],
      'Yes.',
      [ME, 'Whose names?'],
      'I am an old man and I would like to get older. Ask Mother Ansa how far back her graveyard goes. Then ask yourself why you had to ask.',
    ] },
    { desc: 'Ask Mother Ansa about the graveyard.', goals: [], turnin: 'ansa', done: [
      'Bram sent you. He has been sending you towards me for a while, I think, without meaning to.',
      'The oldest grave in this valley is fifty-two years old. Mossbrook is a great deal older than that, child. Where do you suppose everyone was buried before?',
      'Your grandfather left a box in his shed. He told me that if you ever came asking, I could tell you it was there. He did not say I should be glad about it.',
      { do() { Memory.flag('shed_open'); } },
    ] },
    { desc: 'Open the box in the ruined shed in the south-west of your farm.', goals: [{ type: 'flag', flag: 'found_page', label: 'Open Joren\'s box' }], say: false },
    { desc: 'Return to the stone. Something drew you back. Go after dark if you can.', goals: [{ type: 'flag', flag: 'saw_sprout', label: 'Return to the stone' }], say: false },
  ],
  reward: { gold: 500, flag: 'act1_done', trust: { bram: 60, ansa: 60 } },
  deed: 'Found what grew beside the stone.',
  then: [
    [null, 'END OF ACT ONE'],
    [null, 'The valley knows you now. Soon, it will ask more of you. Your farm still needs tending, and your story goes on.'],
  ],
});

// ---- Marta ----------------------------------------------------------------
quest({
  id: 'marta1', title: 'Empty Shelves', giver: 'marta', req: () => qDone('m1'),
  offer: ['The carts were short again. Bring me five turnips and I will make it worth the walk.'],
  stages: [{ desc: 'Bring Marta five turnips.', goals: [{ type: 'have', item: 'turnip', n: 5, label: 'Turnips' }], turnin: 'marta', done: ['Firm. Clean. Joren\'s soil. I will put you down for a discount on seeds.'] }],
  reward: { gold: 150, trust: { marta: 60 }, flag: 'seed_discount' },
});

quest({
  id: 'marta2', title: 'Wax and Ink', giver: 'marta', req: () => qDone('marta1') && hearts('marta') >= 2,
  offer: [
    'I need a letter carried to Sgt. Varr by hand, and I need it not to go through the post. You are the only person I can ask who has no reason to read it.',
  ],
  accept() { Inv.add('sealed_letter', 1); },
  stages: [{ desc: 'Deliver Marta\'s sealed letter to Sgt. Varr.', goals: [{ type: 'have', item: 'sealed_letter', n: 1, label: 'Sealed letter' }], turnin: 'odile', done: [
    { ask: 'You stop before handing it over. The wax is soft from your pocket. It would lift without a mark. Almost without a mark.', who: null, opts: [
      { t: 'Deliver it unread.', do() { Memory.deed('kept_faith_marta', 'Carried Marta\'s letter without reading it.'); Trust.add('marta', 60); }, then: [['odile', 'From Marta? Hm. Tell her I will look into it. Again.']] },
      { t: 'Read it first.', do() { Memory.flag('read_letter_content'); Memory.deed('read_marta_letter', 'Read Marta\'s private letter before delivering it.', { gossip: true, rep: { town: -1 } }); Trust.add('marta', -30); }, then: [
        [null, '"Odile. It has been nine years. The Crown says Dell was reassigned. Nobody gets reassigned for nine years without one letter home. Tell me what the record says. Tell me even if it is bad."'],
        ['odile', 'From Marta? Hm. Tell her I will look into it. Again.'],
      ] },
    ] },
  ] }],
  reward: { gold: 100, trust: { marta: 30 } }, deed: 'Delivered Marta\'s letter.',
});

quest({
  id: 'marta3', title: 'What Dell Carried', giver: 'marta', req: () => qDone('marta2') && hearts('marta') >= 4,
  offer: [
    'Varr wrote back. Dell\'s file says "reassigned" and nothing else. No posting. No pay after the first month.',
    'He wore a ring. If it ever surfaced, it would have to pass through someone like that trader Pell. I want to know. Would you ask?',
  ],
  stages: [
    { desc: 'Ask Pell the trader about Dell\'s ring. Pell comes to the square on the 5th, 12th, 19th and 26th of each season.', goals: [], turnin: 'pell', done: [
      'A ring? I have sold a dozen rings. Oh. That one, with the writing inside. I got a crate of oddments from a Crown quartermaster\'s clearance. Four hundred gold.',
    ], say: false },
    { desc: 'Buy the ring from Pell for 400 gold.', goals: [{ type: 'flag', flag: 'bought_ring', label: 'Buy the ring' }], say: false },
    { desc: 'Bring the ring to Marta.', goals: [{ type: 'have', item: 'dell_ring', n: 1, label: 'Dell\'s ring' }], turnin: 'marta', done: [
      'That is his. It says "come home." I had it cut that way.',
      'From a Crown clearance. So they had it, all this while, and they let me keep writing.',
      { ask: 'She closes her hand over it, and looks at you.', opts: [
        { t: '"I will find out what happened to him."', do() { Memory.flag('promise_marta'); Memory.deed('promise_marta', 'Promised Marta you would find out what happened to Dell.', { witness: ['marta'] }); }, then: ['Do not promise that lightly. I will remember it. Everyone here remembers everything.'] },
        { t: '"I am sorry. I wish I had more for you."', then: ['So do I.'] },
      ] },
    ] },
  ],
  reward: { trust: { marta: 120 }, gold: 200 }, deed: 'Brought Dell\'s ring home.',
});

// ---- Finn -----------------------------------------------------------------
quest({
  id: 'finn1', title: 'The Big One', giver: 'finn', req: () => qDone('m1'),
  offer: ['Bet you have never caught a fish in your life. Bet you. Cast at the river, wait for the "!", then hit it fast and keep the green bar on the fish!'],
  stages: [{ desc: 'Catch a fish, then tell Finn about it.', goals: [{ type: 'catch', n: 1, label: 'Catch a fish' }], turnin: 'finn', done: ['You did it! Was it big? Say it was big.', [ME, 'It was enormous.'], 'I KNEW it.'] }],
  reward: { gold: 100, trust: { finn: 60 } },
});

quest({
  id: 'finn2', title: 'What the River Keeps', giver: 'finn', req: () => qDone('finn1') && hearts('finn') >= 2,
  offer: ['I have something to show you. You can\'t tell anybody. Come out to the very end of the broken bridge.'],
  stages: [
    { desc: 'Walk to the very end of the broken bridge, north of the town.', goals: [{ type: 'goto', map: 'village', x: 32, y: 3, r: 1, label: 'End of the broken bridge' }], say: false },
    { desc: 'Tell Finn you went to the end of the bridge.', goals: [], turnin: 'finn', done: [
      'Did you look down? Really look? On a clear day, when the water goes flat?',
      [ME, 'What am I looking at?'],
      'Roofs, Tam. There are roofs down there. A whole street of them.',
      { ask: 'He looks scared and thrilled in equal parts.', opts: [
        { t: '"I won\'t tell anyone. Promise."', do() { Memory.flag('promise_finn'); Memory.deed('promise_finn', 'Promised Finn to keep the river\'s secret.', { witness: ['finn'] }); Trust.add('finn', 40); }, then: ['Spit on it? No, okay. A promise is fine.'] },
        { t: '"You should tell Sergeant Varr."', do() { Memory.flag('told_finn_tell'); Trust.add('finn', -20); }, then: ['No! No, nobody can. You don\'t get it. Nobody goes near the river who is not supposed to.'] },
      ] },
    ] },
  ],
  reward: { trust: { finn: 40 } }, deed: 'Saw what lies under the river.',
});

// ---- Ivo ------------------------------------------------------------------
quest({
  id: 'ivo1', title: 'Cold Forge', giver: 'ivo', req: () => qDone('m1'),
  offer: ['Forge has been cold since the fuel cart stopped coming. Bring me ten wood and ten stone and I can do real work again. Might even look at those rusty tools of yours.'],
  stages: [{ desc: 'Bring Ivo 10 wood and 10 stone.', goals: [{ type: 'have', item: 'wood', n: 10, label: 'Wood' }, { type: 'have', item: 'stone', n: 10, label: 'Stone' }], turnin: 'ivo', done: ['That\'ll do. Bring copper and coin and I\'ll put a real edge on your tools.'] }],
  reward: { trust: { ivo: 60 }, flag: 'forge_open', gold: 80 },
});

quest({
  id: 'ivo2', title: 'Small Irons', giver: 'ivo', req: () => qDone('ivo1') && hearts('ivo') >= 3,
  offer: [
    'You asked about the scar. Fine. Sit.',
    'Twenty years ago I took a Crown contract. Shackles, four hundred pair, and no one would say what for. Good money.',
    'Some of the pairs were small, Tam. I kept one back. I don\'t know why. Take it to Mother Ansa. I cannot have it in my shop anymore and I cannot throw it in a river. Not this river.',
  ],
  accept() { Inv.add('shackle', 1); },
  stages: [{ desc: 'Take the small shackle to Mother Ansa at the shrine.', goals: [{ type: 'have', item: 'shackle', n: 1, label: 'Rusted shackle' }], turnin: 'ansa', noTake: true, done: [
    { ask: 'Mother Ansa looks at the iron for a long moment without touching it.', opts: [
      { t: 'Give it to her.', do() { Inv.remove('shackle', 1); Memory.deed('gave_shackle', 'Gave the small shackle to Mother Ansa to bury.'); }, then: ['Leave it on the altar. Go home now.'] },
      { t: 'Keep it. Someone should be able to prove this.', do() { Memory.flag('kept_shackle'); Memory.deed('kept_shackle', 'Kept the small shackle as evidence.', { witness: ['ansa'] }); }, then: ['Then you had better decide who it is you mean to show it to. And be very sure of them.'] },
    ] },
  ] }],
  reward: { trust: { ivo: 80, ansa: 60 } }, deed: 'Carried the small iron to the shrine.',
});

// ---- Sera -----------------------------------------------------------------
quest({
  id: 'sera1', title: 'Stock the Hen', giver: 'sera', req: () => qDone('m2'),
  offer: ['Stew\'s gone thin and my cook is me. Bring me five of anything you can gather from the wild. I\'ll not ask where.'],
  stages: [{ desc: 'Bring Sera 5 foraged goods.', goals: [{ type: 'have', kind: 'forage', n: 5, label: 'Foraged goods' }], turnin: 'sera', done: ['There\'s a good boy. Your first drink is free. Your second one has a price, and it is news.'] }],
  reward: { gold: 120, trust: { sera: 60 } },
});

quest({
  id: 'sera2', title: 'A Guest Upstairs', giver: 'sera', req: () => qDone('sera1') && hearts('sera') >= 2,
  offer: [
    'There is a Crown clerk in my upstairs room. Paid a month ahead, in new coin. All he asks about is who farms the land at Ashgrove, how much it yields, and whether the old man left papers.',
    'Come back tonight, after six. Tell me what you want to do about him.',
  ],
  stages: [{ desc: 'Return to Sera at the inn after 6:00 in the evening.', goals: [{ type: 'evening', label: 'Wait for evening' }], turnin: 'sera', noTake: true, done: [
    'He is down the end of the bar. Pretending to read.',
    { ask: 'What do you do about the Crown clerk?', opts: [
      { t: 'Tell him the farm barely breaks even.', do() { Memory.deed('misled_clerk', 'Told a Crown clerk that Ashgrove yields poorly.', { rep: { crown: -1 } }); }, then: ['He wrote it down. He also looked at your hands. I would not count that one as a win just yet.'] },
      { t: '[Persuasion 2] Buy him a drink and get him talking.', lock: () => S.skills.persuasion.lvl >= 2, xp: ['persuasion', 60], do() { Memory.flag('clerk_talked'); Memory.deed('turned_clerk', 'Got a Crown clerk drunk and learned he was sent to survey Ashgrove.', { gossip: true }); }, then: ['Well done. "Survey the holding. Report on the condition of the eastern stone." Who writes a report about a stone, Tam?'] },
      { t: 'Leave him alone.', do() { Memory.flag('ignored_clerk'); }, then: ['Perhaps wise. He will still be here tomorrow, of course, and he will still be writing.'] },
    ] },
  ] }],
  reward: { trust: { sera: 80 }, gold: 60 }, deed: 'Dealt with the clerk at the Hen.',
});

// ---- Sgt. Varr -------------------------------------------------------------
quest({
  id: 'odile1', title: 'Walking the Beat', giver: 'odile', req: () => qDone('m2'),
  offer: ['My knee is bad and the reports are due. Walk the east gate, the broken bridge, and the graveyard for me. Look at each one, tell me nothing is wrong.'],
  stages: [{ desc: 'Inspect the three posts, then report to Sgt. Varr.', goals: [
    { type: 'goto', map: 'village', x: 59, y: 24, r: 2, label: 'The East Gate' },
    { type: 'goto', map: 'village', x: 32, y: 6, r: 2, label: 'The Broken Bridge' },
    { type: 'goto', map: 'village', x: 56, y: 19, r: 2, label: 'The Graveyard' }], turnin: 'odile', done: ['Nothing wrong? Good. Nothing is ever wrong. Sign here.'] }],
  reward: { gold: 120, trust: { odile: 60 } },
});

quest({
  id: 'odile2', title: 'The Missing Chisels', giver: 'odile', req: () => qDone('finn1') && qDone('ivo1') && hearts('odile') >= 2,
  offer: [
    'Someone broke into Brandt\'s forge and took a set of chisels and a hammer. Small thefts in a small village end up being large problems. You go everywhere. Look around.',
    'Start near the south lane. There is a crate by the corner of the Tolley house that nobody ever seems to use. I would look in it, if I were you.',
  ],
  accept() { Memory.flag('hunt_tools'); },
  stages: [
    { desc: 'The tools are hidden in the crate on the south lane, right at the south-east corner of the Tolley House. It is marked on your map. Walk up to it and press E.', goals: [{ type: 'flag', flag: 'found_bundle', label: 'Find the tools' }], say: false },
    { desc: 'The tools were wrapped in a child\'s coat. Decide what to tell Sgt. Varr.', goals: [{ type: 'have', item: 'tool_bundle', n: 1, label: 'Stolen tools' }], turnin: 'odile', noTake: true, done: [
      { ask: 'Sgt. Varr sees the bundle. "Well? Where did you find them?"', opts: [
        { t: 'Tell the truth: it was Finn\'s coat.', do() {
          Inv.remove('tool_bundle', 1);
          Memory.deed('named_finn', 'Told Sgt. Varr that Finn Tolley stole Ivo\'s tools.', { gossip: true, witness: ['odile', 'finn'], rep: { crown: 2, town: -2 } });
          Trust.add('finn', -400); Trust.add('odile', 80);
          if (!S.quests.finn2 || S.quests.finn2.state !== 'done') Quests.lose('finn2', 'Finn will not speak to you now.');
        }, then: ['Thank you. The law does not care that he is twelve, but I will see what can be done.', [null, 'Word travels. By tomorrow, it will have reached the Tolley house.']] },
        { t: '[Persuasion 1] "By the road. Dropped, I would guess."', lock: () => S.skills.persuasion.lvl >= 1, xp: ['persuasion', 40], do() {
          Inv.remove('tool_bundle', 1);
          Memory.deed('covered_finn', 'Lied to Sgt. Varr to protect Finn Tolley.', { witness: ['finn'], rep: { crown: -1, town: 1 } });
          Trust.add('finn', 120);
        }, then: ['By the road. Wrapped in a coat. Hm. All right, Ashgrove. All right.'] },
        { t: 'Say nothing and return the tools to her.', do() {
          Inv.remove('tool_bundle', 1);
          Memory.flag('silent_tools');
          Memory.deed('silent_tools', 'Returned the stolen tools and would not say where you found them.', { rep: { crown: -1 } });
        }, then: ['You know, and you won\'t say. I will remember that, and I have not yet decided how.'] },
      ] },
    ] },
  ],
  reward: { gold: 150 }, deed: 'Settled the matter of the missing chisels.',
});

// ---- Mother Ansa and Bram ---------------------------------------------------
quest({
  id: 'ansa1', title: 'Silverleaf', giver: 'ansa', req: () => qDone('m2'),
  offer: ['Marga Tolley is coughing worse. Silverleaf eases it. It grows wild. Bring me three.'],
  stages: [{ desc: 'Bring Mother Ansa 3 Silverleaf. It grows wild on your farm and around town.', goals: [{ type: 'have', item: 'herb', n: 3, label: 'Silverleaf' }], turnin: 'ansa', done: ['Thank you, child. Kindness is the only thing in this valley that doesn\'t get written down by someone.'] }],
  reward: { gold: 90, trust: { ansa: 70, finn: 30 } }, deed: 'Gathered medicine for Marga Tolley.',
});

// If you kept the pipe, you can still change your mind.
NPCS.bram.extra = (opts, p) => {
  if (!Memory.did('kept_pipe') || Memory.did('gave_pipe') || !Inv.count('joren_pipe')) return;
  opts.push({ text: 'Give him Joren\'s pipe after all', fn() {
    Inv.remove('joren_pipe', 1);
    Memory.deed('gave_pipe', 'Changed your mind, and gave Joren\'s pipe to Old Bram after all.');
    Trust.add('bram', 100);
    Sfx.play('heart');
    UI.say('bram', 'You kept it a while. That is all right. He would have done the same. Thank you, lad.', () => Talk.menu(p));
  } });
};

quest({
  id: 'bram1', title: 'Joren\'s Pipe', giver: 'bram', req: () => qDone('m2') && hearts('bram') >= 1,
  offer: ['He had a pipe, your grandfather. Black thing, foul as a wet dog. It would be somewhere among his books, I expect. I would like to see it again. If you find it.'],
  stages: [
    { desc: 'Search the bookshelf in your farmhouse for Joren\'s pipe.', goals: [{ type: 'flag', flag: 'found_pipe', label: 'Find the pipe' }], say: false },
    { desc: 'Decide what to do with the pipe. Bram is waiting.', goals: [{ type: 'have', item: 'joren_pipe', n: 1, label: 'Joren\'s pipe' }], turnin: 'bram', noTake: true, done: [
      { ask: 'Old Bram sees the pipe in your hand, and doesn\'t reach for it.', opts: [
        { t: 'Give it to him.', do() { Inv.remove('joren_pipe', 1); Memory.deed('gave_pipe', 'Gave Joren\'s pipe to Old Bram.'); Trust.add('bram', 100); }, then: ['Thank you. It still stinks. Good.'] },
        { t: 'Keep it. It is all you have of him.', do() { Memory.deed('kept_pipe', 'Kept Joren\'s pipe for yourself.', { witness: ['bram'] }); }, then: ['Aye. Well. Aye.'] },
      ] },
    ] },
  ],
  deed: 'Settled what became of Joren\'s pipe.',
});
