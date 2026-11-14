'use strict';
// After the Crown falls. The castle, the Court garden and their people were added for life and
// colour, but they were written for a living King. If the story ends with the Crown brought down,
// the King's guards leave their posts, the courtiers stop talking as if he still reigns, and
// ordinary people come to see the castle for themselves. (After the other ending, the Crown goes on
// and so does the court, exactly as it was.)

(() => {
  const fallen = (id, lines) => { if (EXTRAS[id]) EXTRAS[id].fallen = lines; };
  // The King's guards are gone.
  ['x_guard1', 'x_guard2', 'x_guard3', 'x_guard4', 'c_gate1', 'c_gate2', 'c_throne1', 'c_throne2', 'c_patrol', 'c_vault'].forEach(id => { if (EXTRAS[id]) EXTRAS[id].royal = true; });

  // The ones who stay, and what they say now.
  fallen('c_herald', ['Welcome to Evergreen Castle. It belongs to everyone now, I am told. I am still the herald. Nobody told me to stop.', 'The Throne Room is open. There is nothing in it but a chair. People queue to sit in it.']);
  fallen('c_jester', ['I used to tell jokes about the King. Now the King is the joke, and nobody is laughing. Tough crowd.', 'Three balls, two hands, no master. The maths still does not work.']);
  fallen('c_d2a', ['The Evergreen Waltz. We dance it still. Nobody remembers how to stop.', 'They tell me the river gave back a whole town. I dance for them, now.']);
  fallen('c_n3', ['I used to say I had met the King. I am not saying that any more.', 'My family has been at court for ninety years. Ninety years of not asking. It is a hard habit to break.']);
  fallen('c_n4', ['They are carving names on a stone in the valley. My grandmother\'s cook is on it. I never knew her name until now.']);
  fallen('c_scholar', ['The ledgers of the Tithe. I am reading them properly, at last. Every name. Every year. Someone has to.', 'Quiet, please. I am copying the lists for the families. It will take years.']);
  fallen('c_reader', ['The founding of the realm, the first king, the second... all the same man. I suppose the histories need rewriting.']);
  fallen('c_rich1', ['The treasury is being counted out to the villages. Ours too. I am told this is "fair". I am getting used to the word.']);
  fallen('c_rich2', ['We were the richest family in the realm. We are now merely rich. It is a great tragedy, which nobody will listen to.']);
  fallen('c_maid', ['The King\'s bed was never slept in. Last night I slept in it. Do not tell anyone. It was very comfortable.', 'Nobody tells me to scrub anything any more. I scrub it anyway. It is my castle too, now.']);
  fallen('c_priest', ['The sapling on the altar has died. I am planting a new one. An ordinary one. It will grow, and get old, and that is how it should be.', 'We pray for the drowned now. All of them, by name.']);
  fallen('g_garden2', ['No more carts of river mud. The roses will have to make do with compost, like everyone else\'s.', 'The garden is open to all. Mind the beds, though. Open does not mean trampled.']);
  fallen('g_bard', ['A new song: The Bridge at Mossbrook. Every verse is a name. It is a very long song.', 'A song for the roses, a song for the river, a song for whoever drops a coin.']);
  fallen('x_lady', ['The guards are gone and the gate is open. I keep looking over my shoulder. Nobody is there.']);
  fallen('x_lord', ['Green, every year, my dear. And next year? We shall find out, like everyone else.']);
  fallen('x_scholar', ['The ledgers say exactly what the Tithe was for. I have read them now. I will never be lovely about the weather again.']);
  fallen('x_merchant', ['Prices are going up. Harvests are smaller now. I find I do not mind as much as I thought I would.']);

  Object.assign(GOSSIP_AFTER, {
    c_n1: [['c_n1', 'Did you see what the Duchess is wearing?'], ['c_n2', 'Brown. Like a farmer.'], ['c_n1', 'How daring.'], ['c_n2', 'How honest.']],
    c_n3: [['c_n4', 'Have you been down to the valley?'], ['c_n3', 'To see the town that came back?'], ['c_n4', 'To read the names.'], ['c_n3', '...Next week. I will go next week.']],
    c_rich1: [['c_rich1', 'Look at that crown.'], ['c_rich2', 'It is going to be melted down for the villages.'], ['c_rich1', 'All of it?'], ['c_rich2', 'All of it, dear.']],
    x_lady: [['x_lady', 'Did you see? The guards just left.'], ['x_lord', 'Took off their green and walked out.'], ['x_lady', 'Where do guards go?'], ['x_lord', 'Home, I expect. Like anyone.']],
    x_scholar: [['x_merchant', 'No Tithe came in this season.'], ['x_scholar', 'No. And none will.'], ['x_merchant', 'Then the ledgers are finished?'], ['x_scholar', 'The ledgers are evidence.']],
  });

  // Ordinary people come to look, where the guards used to stand.
  const V = (skin, hair, style, shirt, pants, more) => Object.assign({ skin: skin[0], skinD: skin[1], hair: hair[0], hairD: hair[1], style, shirt: shirt[0], shirtD: shirt[1], belt: '#5a3a20', pants: pants[0], pantsD: pants[1], shoes: '#3a2a1a' }, more || {});
  const visitor = (src, name, look, lines) => {
    const e = EXTRAS[src];
    return e && e.at ? { map: e.map, name, look, at: e.at.slice(), dir: e.dir, afterFall: true, lines } : null;
  };
  const add = {
    f_visit1: visitor('c_gate1', 'Visiting Farmer', V(['#e0b088', '#c09068'], ['#8a5a30', '#6a4220'], 'short', ['#7a8a5a', '#5a6a3a'], ['#6a5a40', '#4a3a28'], { hat: 'straw' }),
      ['I walked in the front door. Nobody stopped me. I keep waiting for somebody to stop me.', 'All this gold, and we paid for it in turnips. And worse.']),
    f_visit2: visitor('c_gate2', 'Visiting Weaver', V(['#c99a72', '#a87c58'], ['#2a1a10', '#1a100a'], 'bun', ['#a05a7a', '#7a3a5a'], ['#4a4a54', '#3a3a44']),
      ['My mother was taken for the Tithe when I was six. I came to see where the order was signed.', 'It is just a building. I thought it would feel like more than a building.']),
    f_visit3: visitor('c_throne1', 'Curious Child', V(['#f0c49a', '#d9a678'], ['#c87a48', '#a0582c'], 'messy', ['#e04050', '#a02a38'], ['#3a7ac0', '#2a5a90']),
      ['I sat in the throne! It is just a chair! It is not even comfy!', 'Mum says a bad man sat here for a hundred years. He must have had a sore bottom.']),
    f_visit4: visitor('c_throne2', 'Old Soldier', V(['#c99a72', '#a87c58'], ['#d8d4cc', '#b4b0a8'], 'bald', ['#5a5a4a', '#40403a'], ['#4a4a54', '#3a3a44'], { beard: '#d8d4cc' }),
      ['I stood at this door in my green coat for eleven years. Today I came in through it with my hat in my hand.', 'Someone has scratched names into the Throne Room door. People keep adding more.']),
    f_visit5: visitor('c_vault', 'Village Clerk', V(['#8a5a3a', '#6a4228'], ['#1a1210', '#100a08'], 'short', ['#2a3a5a', '#1a2a4a'], ['#3a3a44', '#2a2a32'], { hat: 'cap', hatC: '#2a3a5a', hatD: '#1a2a44' }),
      ['The treasury is being counted out to the villages. Mossbrook first, I am told. Somebody insisted.', 'Do not touch the gold. It is everyone\'s now, which means it is nobody\'s to pocket.']),
    f_visit6: visitor('x_guard1', 'Capital Baker', V(['#f0c49a', '#d9a678'], ['#e8d8a8', '#c8b888'], 'bun', ['#e8e0d0', '#c4baa6'], ['#8a5a3a', '#6a4228'], { apron: '#ffffff' }),
      ['The gate stands open now. Go in and look. Everybody does, once.', 'I baked for the palace for twenty years. Now I bake for the people who come to stare at it. Better tips.']),
    f_visit7: visitor('x_guard2', 'Pilgrim', V(['#e0b088', '#c09068'], ['#5a4a3a', '#3a2a1a'], 'hood', ['#7a6a55', '#5a4a38'], ['#5a4a38', '#44382a']),
      ['I walked from the eastern hills to see the place where it was all decided. It is smaller than I imagined.', 'They say the river gave back a whole town. I am going there next.']),
  };
  for (const id in add) if (add[id]) EXTRAS[id] = add[id];
})();

// ---- Busier once the story is over -----------------------------------------------------------
// Before the main story ends, each place has a smaller everyday crowd: the guards, the herald,
// the courtiers who let slip hints about the King, a few beachgoers, a swimmer, the market crier.
// After the ending, word gets around and everyone else turns up: dancers, diners, the volleyball
// game, surfers, picnics, kite-flyers, the juggler, couples on the pier.
(() => {
  const LATER = [
    // The Court garden.
    'x_page', 'x_maid', 'x_walker1', 'x_walker2', 'g_garden1', 'g_dame1', 'g_dame2', 'g_lord1', 'g_lady1', 'g_kid1', 'g_kid2', 'g_painter',
    // The castle.
    'c_lute', 'c_jester', 'c_d1a', 'c_d1b', 'c_d3a', 'c_d3b', 'c_n1', 'c_n2', 'c_tray1', 'c_dine1', 'c_dine2', 'c_dine3', 'c_tray2', 'c_cook2', 'c_rich1', 'c_rich2', 'c_pray',
    // Saltmere Coast and the Salty Gull.
    's_sun2', 's_sun3', 's_v1', 's_v2', 's_v3', 's_v4', 's_cafe3',
    'm_porter', 'm_shop3', 'm_shop4', 'm_gulls', 'm_mend1', 'm_mend2', 'm_fan3', 'm_fan4', 'm_fan6', 'm_fan7', 'm_pic1', 'm_pic2', 'm_kite2', 'm_kite3', 'm_painter',
    'm_swim2', 'm_swim3', 'm_swim4', 'm_surf1', 'm_surf2', 'm_dig1', 'm_dig2', 'm_juggle', 'm_pier1', 'm_pier2', 'm_walk3', 'm_walk4', 'm_walk5',
  ];
  LATER.forEach(id => { if (EXTRAS[id]) EXTRAS[id].later = true; });
  // The epilogue says so.
  const epilogue = Story.epilogue.bind(Story);
  Story.epilogue = function () {
    const out = epilogue();
    out.push('Word of the valley travelled. By the next summer the coast road and the capital were busy with people who wanted to see it for themselves: musicians, swimmers, kite-flyers, and a great many people who just wanted to sit in the sun.');
    return out;
  };
})();

// Where each low light source actually burns, in pixels from the top of its tile, so its glow sits
// on the flame rather than floating above it like a lamp post's.
Object.assign(OBJDEF.campfire, { lightY: 6 });
Object.assign(OBJDEF.bonfire, { lightY: 6 });
Object.assign(OBJDEF.rgstove, { lightY: 8 });
Object.assign(OBJDEF.rglantern, { lightY: -6 });
Object.assign(OBJDEF.oldlantern, { lightY: -2 });
Object.assign(OBJDEF.rootglow, { lightY: 8 });
