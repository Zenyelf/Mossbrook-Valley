'use strict';
// Stage 3 people and quests: the road south, the camp, the coast, the mine, the Keep.

npc({
  id: 'wick', name: 'Old Wick', role: 'Hermit of Saltmere',
  look: { skin: '#c99a72', skinD: '#a87c58', hair: '#b4b0a8', hairD: '#8e8a82', style: 'messy', beard: '#b4b0a8', shirt: '#4a6a7a', shirtD: '#38525e', pants: '#54483e', pantsD: '#3e342c' },
  sched: [[360, 'saltmere', 62, 12], [720, 'saltmere', 55, 31], [1080, 'saltmere', 62, 12]],
  loves: ['anglerjaw', 'tuna', 'shell'], likes: ['kind:fish', 'kind:food'], hates: ['kind:material'],
  greet: ['The tide does not care either.', 'Mind the crabs. They hold grudges.', 'You came a long way to bother one old man.'],
  chat: [
    { h: 0, t: 'Ships used to come in here. Then one night a great many of them came, and after that, none.' },
    { h: 0, t: 'Mackerel inshore, greyfin further out. Anything that bites after dark, I would let go.' },
    { h: 2, t: 'That wreck went down in Year 76. I watched her founder. I have spent a good while wishing I had looked somewhere else.' },
    { h: 4, t: 'Lime and chain and no grain. Grain ships do not ride that low in the water, boy.' },
  ],
  reactions: [],
});

npc({
  id: 'rusk', name: 'Rusk', role: 'Master of the south road',
  gone: () => Memory.get('camp_war') || S.dead.rusk,
  look: RUSK_LOOK,
  sched: [[360, 'greywood', 45, 42]],
  loves: ['stew'], likes: ['kind:food'], hates: [],
  greet: ['This is the road. I am the toll.', 'Well now. A farmer, with all of his teeth.', 'State your business, and do it slowly.'],
  chat: [
    { h: 0, t: 'Everyone here was somebody before the Tithe came through. Now we are the people the Tithe does not count.' },
    { h: 0, t: 'The Crown calls us bandits. I took that as a compliment. I have met the Crown.' },
  ],
  reactions: [],
  extra(opts, p) {
    if (Memory.get('camp_deal')) return;
    opts.push({ text: 'Pay the toll (200g)', locked: S.gold < 200, fn() {
      S.gold -= 200; Sfx.play('coin');
      Memory.flag('camp_deal'); Memory.deed('paid_rusk', 'Paid Rusk\'s toll on the south road.', { gossip: true, witness: ['rusk'], rep: { town: -1 } });
      Script.run(['Wise. Walk through. Nobody here will touch you, and you will not touch them.'], 'rusk', () => Quests.pulse());
    } });
    opts.push({ text: '[Persuasion 2] "Joren Ashgrove was my grandfather."', locked: S.skills.persuasion.lvl < 2, fn() {
      gainXP('persuasion', 80);
      Memory.flag('camp_deal'); Memory.deed('talked_rusk', 'Talked Rusk into letting you pass, using your grandfather\'s name.', { witness: ['rusk'] });
      Script.run([
        'Ashgrove. The old man left bread at the edge of these woods every winter for thirty years, and never said one word about it.',
        'Go on through. No charge. If you find out why he did it, come and tell me.',
      ], 'rusk', () => Quests.pulse());
    } });
    opts.push({ text: 'Draw your weapon.', fn() {
      Memory.flag('camp_war'); Memory.deed('fought_rusk', 'Drew steel on Rusk at the south road.', { gossip: true, rep: { crown: 1 } });
      p.hidden = true; p.fighting = true;
      Foes.spawn('rusk', p.x, p.y, { alert: true });
      Foes.alertAll();
      Sfx.play('bad');
    } });
  },
});

NPCS.odile.reactions.push({ id: 'killed_human', if: () => Memory.knows('odile', 'killed_human'), t: 'I heard about the bodies on the south road. I will write it down as self-defence. Do not make me regret my handwriting.' });
NPCS.ansa.reactions.push({ id: 'killed_human_ansa', if: () => Memory.did('killed_human'), t: 'You have killed someone. I can always tell. It is the way people start standing. Come and sit a while, when you can.' });
NPCS.ansa.reactions.push({ id: 'paid_rusk', if: () => Memory.knows('ansa', 'paid_rusk'), t: 'You paid Rusk. I do not judge it. Half of that camp has parents buried in my yard.' });
NPCS.bram.reactions.push({ id: 'found_relic_key', if: () => Inv.count('relic_key') > 0, t: 'Where did you get that key? No. Do not tell me. Put it away, and do not take it out where people can see it.' });

// Weapons Ivo can make. `after` is a flag that must be set first.
const WEAPON_FORGE = [
  { id: 'iron_sword', gold: 600, needs: { iron: 8 } },
  { id: 'war_axe', gold: 900, needs: { iron: 10, wood: 10 } },
  { id: 'hunting_bow', gold: 500, needs: { wood: 20, fiber: 10 } },
  { id: 'greyblade', gold: 2500, needs: { gold_ore: 8, iron: 8 } },
];

quest({
  id: 'r1', title: 'The Greywood Road', giver: 'odile', main: true, req: () => qDone('m2'),
  offer: [
    'The south road has been closed since the rockfall, and the Crown will not spend a copper on it. Things have started coming up it at night regardless.',
    'A big trunk blocks the way. Brandt could make a wedge that would split it, if you bring him lumber and stone. And if you are going down there, you will need this.',
  ],
  accept() {
    Inv.add('rusty_sword', 1);
    Memory.deed('given_sword', 'Sgt. Varr handed you a Crown sword.');
    Script.run([[null, 'Select the sword on your hotbar. C or left click swings it. F dodges and costs stamina, and while you are rolling nothing can touch you. Z toggles sneaking, which keeps you out of sight, and a strike on something that has not noticed you does far more damage.']], null);
  },
  stages: [
    { desc: 'Bring Ivo 15 wood and 10 stone for a felling wedge.', goals: [{ type: 'have', item: 'wood', n: 15, label: 'Wood' }, { type: 'have', item: 'stone', n: 10, label: 'Stone' }], turnin: 'ivo', gain: [['felling_wedge', 1]], done: ['That is a stupid amount of wood for one wedge. Most of it was for me. Here. Hit it where the grain splits.'] },
    { desc: 'Use the wedge on the fallen trunk at the south end of town.', goals: [{ type: 'flag', flag: 'road_cleared', label: 'Clear the south road' }], say: false },
    { desc: 'Tell Sgt. Varr the road is open.', goals: [], turnin: 'odile', done: ['Good. Now whatever is down there can get out, and so can we. Stay on the path, Ashgrove.'] },
  ],
  reward: { gold: 250, trust: { odile: 80 } }, deed: 'Opened the road to Greywood.',
});

quest({
  id: 'r2', title: 'Thorns at the Door', giver: 'bram', req: () => qDone('r1'),
  offer: ['I knew that wood when I was a boy. There was nothing in it but deer. Now there are those thorn-things. Go and kill four, and tell me if they bleed.'],
  stages: [{ desc: 'Kill 4 Thornlings in Greywood, then report to Old Bram.', goals: [{ type: 'kill', item: 'thornling', n: 4, label: 'Thornlings slain' }], turnin: 'bram', done: [
    [ME, 'They do not bleed. They leak water.'],
    'Aye. I thought they might. Water from where, is the question I would ask, if I were someone who wanted to keep sleeping.',
  ] }],
  reward: { gold: 200, trust: { bram: 60 } }, deed: 'Hunted the thorn-things in Greywood.',
});

quest({
  id: 'r3', title: 'The Coast Road', giver: 'sera', req: () => qDone('r1') && hearts('sera') >= 1,
  offer: ['My salt comes up from Saltmere, or it did until a man named Rusk decided the road was his. Get to the coast. How you do it is your own affair. Pay him, charm him, slip past him, or end him.'],
  stages: [{ desc: 'Reach Saltmere Coast, past the bandit camp in south Greywood. Talk, pay, sneak, or fight.', goals: [{ type: 'goto', map: 'saltmere', x: 78, y: 21, r: 8, label: 'Reach Saltmere Coast' }], turnin: 'sera', done: [
    { if: () => S.dead.rusk, then: ['Rusk is dead, then. People will be grateful, and afraid of you, in about equal parts.'], else: [
      { if: () => Memory.get('camp_deal'), then: ['A deal with Rusk. Sensible. Now you owe him, or he owes you, and neither of you will ever be sure which.'], else: ['You got past them without a word? I will not ask how. I will just stop leaving my purse on the bar.'] },
    ] },
  ] }],
  reward: { gold: 300, trust: { sera: 90 } }, deed: 'Reopened the road to the coast.',
});

quest({
  id: 'r4', title: 'Better Ore', giver: 'ivo', req: () => qDone('ivo1') && qDone('r1'),
  offer: ['Copper only goes so far. There is iron under the Ironback, past the pass, deep in the mine. Bring me five and I will show you what real work looks like.'],
  stages: [{ desc: 'Bring Ivo 5 Iron Ore from the Deep Mine. It starts around floor 6.', goals: [{ type: 'have', item: 'iron', n: 5, label: 'Iron Ore' }], turnin: 'ivo', done: ['Hm. Good ore. Better than Crown ore, and they own the mine.', 'Now I can make you iron tools, and a decent blade. Bring gold ore from the deep levels and I can do better than decent.'] }],
  reward: { gold: 200, trust: { ivo: 90 }, flag: 'forge_iron' }, deed: 'Brought the first iron out of the Deep Mine.',
});

quest({
  id: 'r5', title: 'Lime and Chain', giver: 'wick', req: () => hearts('wick') >= 1,
  offer: ['That wreck on the sand, she carried a manifest. I never dared. You are young and stupid, so you go. Bring it to me.'],
  stages: [{ desc: 'Search the wreck on Saltmere beach for the ship\'s manifest, then bring it to Old Wick.', goals: [{ type: 'have', item: 'relic_manifest', n: 1, keep: true, label: 'Cargo manifest' }], turnin: 'wick', done: [
    'Lime. Chain. Forty barrels. Four hundred pair.',
    [ME, 'What is Lower M?'],
    'Keep that paper dry, and keep it out of Mossbrook. There are people who would burn a house to get it, and they would not check who was inside.',
  ] }],
  reward: { gold: 300, trust: { wick: 120 } }, deed: 'Read the manifest of the wrecked ship.',
});

quest({
  id: 'r6', title: 'The Old Keep', giver: 'bram', main: true, req: () => Memory.get('act1_done') && qDone('r1'),
  needs: () => [['Finish Act One: "Names on the Stone"', !!Memory.get('act1_done')], ['Open the Greywood Road', qDone('r1')]],
  offer: [
    'You have seen the stone. You have seen what grew by it. There is one more place, and I have kept the means of opening it hidden under my floor for fifty years.',
    'The Old Keep, on the coast. Whatever they wrote down, they wrote down there. Someone still walks that hall. Be ready.',
  ],
  accept() { Inv.add('keep_seal', 1); },
  stages: [
    { desc: 'Use Bram\'s seal to enter the Old Keep on Saltmere Coast, find the key to the iron door, and face what guards the inner hall.', goals: [{ type: 'kill', item: 'warden', n: 1, label: 'Defeat the Warden' }], say: false },
    { desc: 'Open the chest behind the Warden\'s throne and bring what you find to Old Bram.', goals: [{ type: 'have', item: 'tithe_roll', n: 1, keep: true, label: 'The Tithe Roll' }], turnin: 'bram', done: [
      'That is it, then. That is the Roll.',
      [ME, 'There are hundreds of names. The last ones were added this year.'],
      'I know. I know there are.',
      'Put it somewhere safe, boy. Soon, someone is going to send for you. And when they do, I would very much like you to remember what you are carrying.',
    ] },
  ],
  reward: { gold: 1000, flag: 'keep_done', trust: { bram: 120 } }, deed: 'Took the Tithe Roll from the Old Keep.', gossip: true,
  then: [[null, 'The wider world is open to you now. Whatever comes next, it will come for you at the farm.']],
});
