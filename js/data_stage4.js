'use strict';
// Stage 4: theft, the Crown's patrols, Ironback Gaol and the people inside it.

item('lockpick', 'Lockpick', 'gear', 30, ['lockpick'], 'Bent wire and patience. Opens locked doors, sometimes. Breaks, often.');
item('softboots', 'Softsole Boots', 'gear', 300, ['boots'], 'Kept in your pack, they make you much harder to notice.');
item('iron_bar', 'Bent Iron Bar', 'quest', 0, ['ironbar'], 'Pried off a kitchen grate. Good for prying more things.');
item('bram_medal', 'Crown Service Medal', 'relic', 0, ['medal'], 'A soldier\'s medal, kept in a locked box.', { lore: 'Engraved on the back: "B. Hollis. River Detail. Year 76. For service the Crown will not forget." Someone has tried to scratch the words off and given up.' });
item('odile_notes', 'Sgt. Varr\'s Notebook', 'relic', 0, ['book', '#7a2f30', '#5a2122'], 'Every report she has filed, copied out in her own hand.', { lore: 'Her copy of a report from nine years ago reads "D. Hale refused the river order. Detained, sent east." The Crown\'s copy, which she has pinned beside it, reads "Reassigned."' });
item('sera_ledger', 'Sera\'s Ledger', 'relic', 0, ['book', '#3f6fa8', '#2f5a8c'], 'Who owes Sera, and what.', { lore: 'Most of it is bar tabs. One page is not: "Crown clerk. 200g received, for names of anyone asking about the river." Many of the names are crossed through.' });

FOES.crownguard = { name: 'Crown Guard', hp: 170, dmg: 17, speed: 58, vision: 140, reach: 22, cool: 0.9, xp: 25, human: true, heavy: true, guard: true, nonlethal: true, look: null, gold: [0, 0], drops: [] };
FOES.odile_f = { name: 'Sgt. Odile Varr', hp: 240, dmg: 20, speed: 60, vision: 150, reach: 24, cool: 0.85, xp: 40, human: true, heavy: true, guard: true, nonlethal: true, look: null, gold: [0, 0], drops: [] };

const GUARD_LOOK = { skin: '#d8a880', skinD: '#b88a64', hair: '#4a3a2a', hairD: '#33281c', style: 'crop', hat: 'helm', shirt: '#7a2f30', shirtD: '#5a2122', belt: '#3a2a1a', pants: '#44444e', pantsD: '#303038', shoes: '#2a2a30' };
FOES.crownguard.look = GUARD_LOOK;

// Night patrols walk a loop of the village, but only come out once you are notorious.
const PATROL = [[30, 26], [45, 24], [54, 20], [44, 38], [20, 38], [12, 24], [22, 20]];
const patrolSched = offset => { const s = []; for (let t = 360, i = offset; t <= 1560; t += 60, i++) s.push([t, 'village', ...PATROL[i % PATROL.length]]); return s; };
const nightOut = () => !(S.wanted || (S.notoriety >= 30 && (S.time >= 1200 || S.time < 420)));
['patrolA', 'patrolB'].forEach((id, i) => npc({
  id, name: i ? 'Guard Holm' : 'Guard Ferris', role: 'Crown Patrol', guard: true, patrol: true, minor: true, foe: 'crownguard',
  look: Object.assign({}, GUARD_LOOK, { skin: i ? '#c99a72' : '#e8b890', skinD: i ? '#a87c58' : '#c99a72' }),
  gone: nightOut, sched: patrolSched(i * 3),
  loves: [], likes: ['kind:food'], hates: [], pockets: { gold: [10, 40] },
  greet: ['Move along.', 'Keep your hands where I can see them.'],
  chat: [{ h: 0, t: 'Sergeant says there is a thief in this valley. Sergeant is usually right.' }],
  reactions: [],
}));

npc({
  id: 'brann', name: 'Gaoler Brann', role: 'Keeper of Ironback Gaol', guard: true, remote: true, inGaol: true,
  look: { skin: '#c99a72', skinD: '#a87c58', hair: '#2a221c', hairD: '#1a1410', style: 'bald', beard: '#2a221c', shirt: '#44444e', shirtD: '#303038', belt: '#7a5535', pants: '#303038', pantsD: '#22222a', shoes: '#1a1a20' },
  sched: [[360, 'gaol', 22, 15], [1380, 'gaol', 27, 16, true]],
  loves: ['stew'], likes: ['kind:food'], hates: [], pockets: { gold: [40, 90] },
  greet: ['Back to your work.', 'You again.', 'Count your days, prisoner. I count them too.'],
  chat: [
    { h: 0, t: 'Do your shifts and your sentence gets shorter. Cause trouble and it gets longer. That is the whole of the law in here.' },
    { h: 0, t: 'I have kept this place twenty years. Nobody has ever got out that I did not let out.' },
  ],
  reactions: [],
  extra(opts) {
    if (!S.jail) return;
    const cost = 350 * S.jail.left;
    opts.push({ text: `Slip him ${cost}g for an early release`, locked: S.gold < cost, fn() { Crime.bribe(cost); } });
  },
});

npc({
  id: 'watch', name: 'Night Watchman', role: 'Gaol guard', guard: true, remote: true, minor: true, inGaol: true,
  look: Object.assign({}, GUARD_LOOK, { shirt: '#4a4a5a', shirtD: '#36364a' }),
  sched: [[360, 'gaol', 25, 5], [1260, 'gaol', 9, 8], [1320, 'gaol', 20, 8], [1380, 'gaol', 9, 8], [1440, 'gaol', 20, 8], [1470, 'gaol', 24, 16, true]],
  loves: [], likes: [], hates: [], greet: ['Lights out means lights out.'], chat: [{ h: 0, t: 'Another night. Another night.' }], reactions: [],
});

npc({
  id: 'corvin', name: 'Corvin Ashe', role: 'Prisoner, a forger', remote: true, inGaol: true,
  look: { skin: '#d8c0a0', skinD: '#b8a080', hair: '#c8c4bc', hairD: '#a29e96', style: 'long', beard: '#c8c4bc', shirt: '#8a8478', shirtD: '#6a655c', pants: '#6a655c', pantsD: '#504c44' },
  sched: [[360, 'gaol', 3, 4], [600, 'gaol', 25, 4], [1080, 'gaol', 3, 4]],
  loves: [], likes: [], hates: [],
  greet: ['Ah. A new face. They are all new faces to me now.', 'Mind the drafts. They come up through the floor.'],
  chat: [
    { h: 0, t: 'They say I forged the King\'s seal. I did not. I copied a list, which is a far worse crime, as it turns out.' },
    { h: 0, t: 'Tokens buy most things in here. Shifts earn tokens. I can find you most things for the right number of them.' },
    { h: 1, t: 'Nine years ago I shared a cell with a man called Dell. He refused an order at a river and would not say which river. They took him east, in chains.' },
  ],
  reactions: [],
  extra(opts) {
    if (!S.jail) return;
    if (S.quests.esc && S.quests.esc.state === 'active' && !Inv.count('iron_bar')) opts.push({ text: 'Trade 6 tokens for an iron bar', locked: S.jail.tokens < 6, fn() { S.jail.tokens -= 6; Inv.add('iron_bar', 1); Sfx.play('coin'); } });
    opts.push({ text: 'Trade 4 tokens for a lockpick', locked: S.jail.tokens < 4, fn() { S.jail.tokens -= 4; Inv.add('lockpick', 1); Sfx.play('coin'); } });
    Memory.flag('heard_dell');
  },
});

npc({
  id: 'mags', name: 'Mags Bellow', role: 'Prisoner, a smuggler', remote: true, inGaol: true,
  look: { skin: '#b98a64', skinD: '#986e4c', hair: '#3a2a20', hairD: '#2a1e16', style: 'bun', shirt: '#4a6a7a', shirtD: '#38525e', pants: '#3e342c', pantsD: '#2c241c' },
  sched: [[360, 'gaol', 8, 4], [540, 'gaol', 4, 14], [1080, 'gaol', 8, 4]],
  loves: [], likes: [], hates: [],
  greet: ['Keep scrubbing. Keep thinking.', 'You look like someone who wants out.'],
  chat: [
    { h: 0, t: 'I ran grain out of Saltmere for six years. Funny thing, the King\'s grain. There is always more of it than anyone can eat.' },
    { h: 0, t: 'Every wall has a weak place. In here, it is under the soapsuds.' },
  ],
  reactions: [],
});

npc({
  id: 'pip', name: 'Pip', role: 'Prisoner, a pickpocket', remote: true, inGaol: true,
  look: { skin: '#f0c49a', skinD: '#d9a678', hair: '#e8c95a', hairD: '#c4a43c', style: 'messy', shirt: '#7a6a5a', shirtD: '#5e5246', pants: '#5a5040', pantsD: '#443c30' },
  sched: [[360, 'gaol', 4, 4], [540, 'gaol', 14, 14], [1020, 'gaol', 21, 4], [1200, 'gaol', 4, 4]],
  loves: [], likes: [], hates: [],
  greet: ['Didn\'t take anything. Promise.', 'Got a token? No? Worth asking.'],
  chat: [
    { h: 0, t: 'Rule one, never lift from someone looking at you. Rule two, never lift from someone looking at you. There is no rule three.' },
    { h: 0, t: 'Night you want to be up and about is half past midnight. Brann\'s snoring by then, and the watchman dozes off at the gate.' },
  ],
  reactions: [],
  extra(opts) {
    if (!S.jail) return;
    opts.push({ text: 'Pay 3 tokens for a lesson in light fingers', locked: S.jail.tokens < 3, fn() { S.jail.tokens -= 3; gainXP('stealth', 70); UI.say('pip', 'Watch their feet, not their purse. Feet tell you which way they are going to turn.'); } });
  },
});

npc({
  id: 'marga', name: 'Marga Tolley', role: 'Finn\'s mother', minor: true,
  look: { skin: '#e0c0a0', skinD: '#c0a080', hair: '#a0703a', hairD: '#7a5428', style: 'long', shirt: '#d8d0c0', shirtD: '#b8b0a0', pants: '#a09888', pantsD: '#807868' },
  sched: [[360, 'tolley_home', 3, 4]],
  loves: ['herb', 'salve'], likes: ['kind:food'], hates: [],
  greet: ['Is that you, Finn? Oh. Hello.', 'Forgive me for not getting up.'],
  chat: [
    { h: 0, t: 'Finn talks about you. He does not talk about many people.' },
    { h: 0, t: 'My husband drowned in that river. Finn still fishes it every day. I have stopped asking him not to.' },
  ],
  reactions: [],
});

// Who carries what. A unique item can only be lifted once.
Object.assign(NPCS.marta, { pockets: { gold: [30, 80], items: [['strawberry_seed', 1, 2]] } });
Object.assign(NPCS.bram, { pockets: { gold: [5, 20], items: [['hazelnut', 1, 2]] } });
Object.assign(NPCS.finn, { pockets: { gold: [0, 5], items: [['blackberry', 1, 3]] } });
Object.assign(NPCS.ivo, { pockets: { gold: [20, 60], items: [['coal', 1, 2]] } });
Object.assign(NPCS.sera, { pockets: { gold: [40, 120], unique: 'sera_ledger' } });
Object.assign(NPCS.odile, { pockets: { gold: [20, 50], unique: 'odile_notes' }, guard: true, foe: 'odile_f' });
FOES.odile_f.look = NPCS.odile.look;
Object.assign(NPCS.ansa, { pockets: { gold: [0, 10], items: [['herb', 1, 2]] } });
Object.assign(NPCS.dara, { pockets: { gold: [20, 50] } });
Object.assign(NPCS.pell, { pockets: { gold: [60, 160], items: [['quartz', 1, 1]] } });
Object.assign(NPCS.wick, { pockets: { gold: [5, 20], items: [['shell', 1, 2]] } });
Object.assign(NPCS.rusk, { pockets: { gold: [80, 200] }, outlaw: true });

// What a caught villager says first.
NPCS.marta.caughtLine = 'My shop. In front of me. Do you think I am blind, Tam?';
NPCS.bram.caughtLine = 'In my house? While I sleep? Joren would have taken his belt to you.';
NPCS.sera.caughtLine = 'Oh, darling. Not in my house. Never in my house.';
NPCS.ivo.caughtLine = 'Put it down. Slowly.';
NPCS.finn.caughtLine = 'Tam? What are you doing? That is not yours.';
NPCS.ansa.caughtLine = 'From the shrine, child? From the shrine?';
NPCS.marga.caughtLine = 'Take it, then. We have nothing else worth taking. Just do not let Finn see you.';
NPCS.odile.caughtLine = 'Hands where I can see them, Ashgrove.';

// Rusk becomes the valley's fence once you have an understanding.
const ruskTerms = NPCS.rusk.extra;
NPCS.rusk.extra = function (opts, p) {
  if (Memory.get('camp_deal')) opts.push({ text: 'Trade (fence)', fn: () => UI.push(UI.shop('fence', 'rusk')) });
  ruskTerms.call(this, opts, p);
};
NPCS.rusk.reactions.push({ id: 'rusk_back', if: () => Memory.get('rusk_back'), t: 'Look who it is. You left me in the dirt with my own blood in my mouth, farmer. I crawled home. I have decided to find that funny. Do not make me change my mind.' });

NPCS.ansa.extra = function (opts) {
  if ((S.notoriety || 0) <= 0) return;
  opts.push({ text: 'Give 500g to the shrine', locked: S.gold < 500, fn() {
    S.gold -= 500; S.notoriety = Math.max(0, S.notoriety - 12); S.rep.town += 1; Sfx.play('coin');
    Memory.deed('donated_' + absDay(), 'Gave 500 gold to the Shrine of the Green.', { once: false, gossip: true });
    UI.say('ansa', 'The Green does not keep accounts. People do. They will hear of this.');
  } });
};

NPCS.odile.reactions.push({ id: 'jailed_odile', if: () => Memory.did('jailed'), t: 'You did your time. In my book that is a clean page. Not everyone keeps their books the way I do.' });
NPCS.odile.reactions.push({ id: 'escaped_odile', if: () => Memory.knows('odile', 'escaped_gaol'), t: 'Nobody gets out of Ironback. Except, apparently, you. I will be watching you very closely from now on.' });
NPCS.bram.reactions.push({ id: 'jailed_bram', if: () => Memory.knows('bram', 'jailed'), t: 'Ironback, eh. Joren never saw the inside of it. He came close a few times, mind.' });
NPCS.finn.reactions.push({ id: 'jailed_finn', if: () => Memory.knows('finn', 'jailed'), t: 'Is it true you were in the gaol? Was it awful? Ma says not to ask you. I am asking you.' });
NPCS.marta.reactions.push({ id: 'robbed_marta', if: () => Memory.knows('marta', 'robbed_marta'), t: 'Someone has been at my shelves. I count everything, Tam. Everything.' });

quest({
  id: 'th1', title: 'Light Fingers', giver: 'rusk', req: () => Memory.get('camp_deal'),
  offer: [
    'You want to deal with me properly, I need to know you can keep your hands quiet.',
    'Walk into Hale\'s Goods. Take something off her shelf. Do not get seen. Sneak with Z and press E on a shelf when her back is turned.',
  ],
  stages: [{ desc: 'Steal anything from a shelf in Hale\'s Goods without being seen, then report to Rusk.', goals: [{ type: 'flag', flag: 'clean_store', label: 'An unseen theft from Hale\'s Goods' }], turnin: 'rusk', done: [
    'Clean. Marta Hale will count her shelves tonight and come up short, and she will never know why.',
    'Here. You will need these, for doors. And anything you lift, bring to me. Nobody else in this valley will touch it.',
  ] }],
  reward: { gold: 100, items: [['lockpick', 3]], rep: { shadow: 2 } }, deed: 'Proved your hands to Rusk.',
});

quest({
  id: 'th2', title: 'Names and Numbers', giver: 'rusk', req: () => qDone('th1'),
  offer: ['Sera Quill keeps a ledger, and she keeps it on her. Half this valley is in it. I would very much like to read it. Pick her pocket.'],
  stages: [{ desc: 'Pickpocket Sera\'s ledger at the Sleeping Hen. Sneak up behind her and press E.', goals: [{ type: 'have', item: 'sera_ledger', n: 1, keep: true, label: 'Sera\'s ledger' }], turnin: 'rusk', noTake: true, done: [
    'Well? Give it here.',
    { ask: 'Rusk holds out his hand for the ledger.', opts: [
      { t: 'Hand it over.', do() { Inv.remove('sera_ledger', 1); Memory.deed('gave_ledger', 'Gave Sera\'s ledger to Rusk.', { rep: { shadow: 2 } }); }, then: ['Ha. She sells names to the Crown. Of course she does. Everyone in this camp is in here somewhere.'] },
      { t: 'Keep it. What is in it is yours to use.', do() { Memory.deed('kept_ledger', 'Kept Sera\'s ledger for yourself.', { witness: ['rusk'] }); }, then: ['Hm. Then you know something I do not. Be careful who you let find that out.'] },
    ] },
  ] }],
  reward: { gold: 400, rep: { shadow: 1 } }, deed: 'Lifted Sera Quill\'s ledger.',
});

quest({
  id: 'esc', title: 'Under the Suds', giver: 'mags', req: () => !!S.jail && !Memory.get('tunnel_sealed'),
  offer: [
    'There is a drain under the laundry. Old, rusted, and it runs out under the wall. I am too fat for it now. You are not.',
    'You will need something to lever the grate. And you will need to know when nobody is watching. Pip knows that part.',
  ],
  stages: [
    { desc: 'Find something to pry the laundry grate. Corvin trades for tokens, and the kitchen has loose iron.', goals: [{ type: 'have', item: 'iron_bar', n: 1, keep: true, label: 'Something to pry with' }], say: false },
    { desc: 'Ask Pip when the guards are not watching.', goals: [], turnin: 'pip', done: ['Half past midnight. Brann is asleep by then, and the watchman dozes at the gate till three. Do not get caught, I am not getting more time on your account.'] },
    { desc: 'After 00:30, pry the drain grate in the laundry without being seen.', goals: [{ type: 'flag', flag: 'grate_open', label: 'Pry the grate' }], say: false },
    { desc: 'Crawl out through the drain. Grab your things from the evidence locker first, if you dare.', goals: [{ type: 'flag', flag: 'escaped', label: 'Escape' }], say: false },
  ],
  deed: 'Escaped Ironback Gaol through the laundry drain.',
});
