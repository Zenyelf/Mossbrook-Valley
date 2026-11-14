'use strict';
// Saltmere's west end, brought to life. Until now the biting crabs had the west half of the
// coast to themselves, so everyone crowded to the east end by the cafe and the pier. Now:
//  - The crabs keep to the rocks around the old wreck.
//  - A fish market north of the road: Tilda's fish stall, Wren's kite stall, a fruit stall,
//    drying racks, lobster pots, shoppers, a crier, a porter and a market cat.
//  - Crab races south of the road. Lou the bookie takes bets; every crab has a mood today,
//    and the crowd's odds only half notice it, so reading the board pays.
//  - Picnics, kite-flyers, a painter and a stargazer on the grass; swimmers and surfers in
//    the sea; sandcastle builders, a juggler and couples on the pier in the east.
//  - Kites you can buy and fly anywhere outdoors.

// ---- Things to buy -----------------------------------------------------------------------
item('kite', 'Kite', 'gadget', 120, ['kiteicon', '#e04050', '#f0d040'], 'Use it outdoors to fly it. Does nothing useful. Is wonderful.');
item('pinwheel', 'Pinwheel', 'gift', 50, ['pinwheelicon', '#e04050', '#3a7ac0'], 'Paper sails on a stick. Spins in the slightest breath.');
item('windchime', 'Shell Wind Chime', 'gift', 200, ['chimeicon', '#f0e6d2', '#8fd0c0'], 'Seashells and sea glass on fishing line. It sounds like the tide coming in.');
item('smoked_eel', 'Smoked Eel', 'food', 120, ['eelsmoked', '#7a4a2a', '#c8904a'], 'Hung over driftwood smoke for two days. Rich and salty.', { food: 50, heal: 15 });
item('crab_cakes', 'Crab Cakes', 'food', 110, ['crabcake', '#e8b060', '#c87a30'], 'Fried golden, with a squeeze of lime. Made from very slow crabs, Tilda swears.', { food: 60, heal: 10 });
item('golden_crab', 'Golden Crab Trophy', 'relic', 0, ['goldcrab'], 'Won at the Saltmere crab races.', { lore: 'Engraved on the base: "FIVE WINS. THE CRABS FEAR YOU." Under it, smaller: "They do not. They are crabs. - Lou"' });

Object.assign(Art.ICONS, {
  kiteicon: (g, a, b) => { const P = Art.P; for (let i = 0; i < 6; i++) { P(g, a, 7 - i, 2 + i, 2 + i * 2, 1); P(g, a, 7 - i, 13 - i, 2 + i * 2, 1); } P(g, b, 7, 2, 2, 12); P(g, b, 2, 7, 12, 2); P(g, '#ffffff', 8, 14, 1, 2); },
  pinwheelicon: (g, a, b) => { const P = Art.P; P(g, '#a07a4c', 7, 8, 2, 8); P(g, a, 4, 2, 4, 4); P(g, b, 8, 2, 4, 4); P(g, '#f0d040', 4, 6, 4, 4); P(g, '#3ab04a', 8, 6, 4, 4); P(g, '#ffffff', 7, 5, 2, 2); },
  chimeicon: (g, a, b) => { const P = Art.P; P(g, '#a07a4c', 2, 2, 12, 2); [3, 7, 11].forEach((x, i) => { P(g, '#e8e8f0', x + 1, 4, 1, 4 + i); P(g, i % 2 ? b : a, x, 8 + i, 3, 3); }); },
  eelsmoked: (g, a, b) => { const P = Art.P; for (let i = 0; i < 12; i++) P(g, i % 3 ? a : b, 2 + i, 7 + Math.round(Math.sin(i / 2) * 2), 2, 3); P(g, '#2a1a10', 13, 7, 1, 1); },
  crabcake: (g, a, b) => { const P = Art.P; P(g, '#e8e8f0', 1, 10, 14, 3); P(g, a, 2, 6, 6, 4); P(g, a, 8, 7, 6, 4); P(g, b, 2, 9, 6, 1); P(g, b, 8, 10, 6, 1); P(g, '#9ad040', 6, 4, 3, 2); },
  goldcrab: (g, a, b) => { const P = Art.P; P(g, '#8a6239', 3, 12, 10, 3); P(g, '#e8c040', 4, 6, 8, 5); P(g, '#f7dd7a', 5, 6, 3, 1); P(g, '#e8c040', 1, 4, 3, 3); P(g, '#e8c040', 12, 4, 3, 3); P(g, '#c9a040', 3, 10, 1, 2); P(g, '#c9a040', 12, 10, 1, 2); P(g, '#2a1a10', 6, 7, 1, 1); P(g, '#2a1a10', 9, 7, 1, 1); },
});

// ---- Market and beach things -------------------------------------------------------------
Object.assign(OBJDEF, {
  mkfish: { solid: 1, fw: 3, reach: 1 }, mkkite: { solid: 1, fw: 3, reach: 1 }, mkfruit: { solid: 1, fw: 3, reach: 1 },
  mkrack: { solid: 1, fw: 2 }, mkpots: { solid: 1 }, mkice: { solid: 1 }, mknet: { solid: 1, fw: 2 },
  mkpicnic: { flat: 1, fw: 2 }, mkeasel: { solid: 1, act: 'mkeasel' }, mkscope: { solid: 1, act: 'mkscope' },
  crabtrack: { flat: 1, fw: 14, fh: 4 }, crabboard: { solid: 1, fw: 2, act: 'crabboard' },
});
Object.assign(ACT_LABEL, { mkeasel: 'Look at the painting', mkscope: 'Look through the telescope', crabboard: 'Read the race board' });

(() => {
  const { mk, P, outlined, STATIC } = Art;
  const awning = (g, a, b, w = 48) => { for (let x = 0; x < w; x += 8) { P(g, x % 16 ? a : b, x, 4, 8, 12); P(g, '#00000022', x, 14, 8, 2); for (let i = 0; i < 8; i += 2) P(g, x % 16 ? a : b, x + i, 16, 1, 2); } P(g, '#00000033', 0, 4, w, 1); };
  const frame = (g, w = 48) => { P(g, '#6f4c30', 3, 14, 3, 30); P(g, '#6f4c30', w - 6, 14, 3, 30); P(g, '#a57a4c', 2, 30, w - 4, 12); P(g, '#c49a66', 2, 30, w - 4, 2); P(g, '#7a5535', 2, 41, w - 4, 1); };
  STATIC.mkfish = () => outlined(mk(48, 44, g => {
    frame(g); awning(g, '#f0f4f8', '#3a7ac0');
    P(g, '#e8f4f8', 4, 26, 40, 5); P(g, '#c8e0f0', 4, 30, 40, 1);
    [[6, '#b8c4d0'], [13, '#e89a84'], [20, '#b8c4d0'], [27, '#c8a040'], [34, '#b8c4d0']].forEach(([x, c]) => { P(g, c, x, 25, 6, 3); P(g, c, x + 6, 24, 2, 5); P(g, '#2a2a32', x + 1, 26, 1, 1); });
    P(g, '#c9a040', 40, 18, 1, 6); P(g, '#c8ccd4', 37, 23, 7, 2);
    P(g, '#f0f4f8', 13, 0, 22, 9); Font.center(g, 'FISH', 24, 1, '#3a7ac0');
  }));
  STATIC.mkkite = () => outlined(mk(48, 48, g => {
    frame(g); awning(g, '#f0d040', '#e04050');
    [[8, '#3a7ac0'], [20, '#3ab04a'], [32, '#9a70e0']].forEach(([x, c]) => { for (let i = 0; i < 4; i++) { P(g, c, x + 3 - i, 18 + i, 1 + i * 2, 1); P(g, c, x + 3 - i, 25 - i, 1 + i * 2, 1); } P(g, '#ffffff', x + 3, 26, 1, 3); });
    [10, 20, 30, 38].forEach((x, i) => { P(g, '#a07a4c', x, 27, 1, 4); P(g, ['#e04050', '#f0d040', '#3a7ac0', '#3ab04a'][i], x - 2, 25, 5, 3); });
    P(g, '#fff8e0', 10, 0, 28, 9); Font.center(g, 'KITES', 24, 1, '#e04050');
  }));
  STATIC.mkfruit = () => outlined(mk(48, 44, g => {
    frame(g); awning(g, '#f0f0e0', '#3a9a5a');
    for (let i = 0; i < 5; i++) { P(g, '#7a5028', 5 + i * 5, 25, 5, 5); P(g, '#5a3a18', 6 + i * 5, 26, 1, 1); }
    for (let i = 0; i < 4; i++) P(g, '#9ad040', 31 + i * 3, 27, 3, 3);
    P(g, '#e8b040', 41, 22, 4, 8); P(g, '#3a8a3a', 41, 19, 1, 3); P(g, '#3a8a3a', 43, 18, 1, 4);
  }));
  STATIC.mkrack = () => outlined(mk(32, 30, g => {
    P(g, '#6f4c30', 1, 4, 2, 26); P(g, '#6f4c30', 29, 4, 2, 26); P(g, '#8a6239', 0, 3, 32, 2); P(g, '#8a6239', 0, 14, 32, 1);
    for (let i = 0; i < 6; i++) { const x = 4 + i * 4; P(g, '#c8b088', x + 1, 5, 1, 2); P(g, i % 2 ? '#b8a890' : '#c8b8a0', x, 7, 3, 6); P(g, '#8a7860', x, 12, 3, 1); }
    for (let i = 0; i < 5; i++) { const x = 6 + i * 4; P(g, '#c8b088', x + 1, 15, 1, 2); P(g, '#a89880', x, 17, 3, 5); }
  }));
  STATIC.mkpots = () => outlined(mk(16, 24, g => { [[0, 14], [2, 6], [4, -1]].forEach(([x, y], i) => { const w = 16 - i * 4; P(g, '#8a6239', x, y + 2, w, 8); for (let k = x + 1; k < x + w; k += 3) P(g, '#4a301d', k, y + 3, 1, 6); P(g, '#c49a66', x, y + 2, w, 1); }); P(g, '#e86a30', 6, 18, 4, 2); }));
  STATIC.mkice = () => outlined(mk(16, 16, g => { P(g, '#a07a4c', 1, 6, 14, 10); P(g, '#7a5535', 1, 15, 14, 1); P(g, '#e8f4f8', 2, 5, 12, 3); P(g, '#b8c4d0', 3, 3, 5, 3); P(g, '#e89a84', 8, 4, 5, 2); P(g, '#2a2a32', 4, 4, 1, 1); }));
  STATIC.mknet = () => outlined(mk(32, 28, g => {
    P(g, '#6f4c30', 1, 2, 2, 26); P(g, '#6f4c30', 29, 2, 2, 26); P(g, '#8a6239', 0, 2, 32, 2);
    for (let y = 4; y < 24; y++) for (let x = 3; x < 29; x++) if ((x + y) % 4 === 0 || (x - y + 40) % 4 === 0) P(g, '#a08a60', x, y + Math.round(Math.sin(x / 5) * 1), 1, 1);
    P(g, '#e8c040', 8, 22, 3, 2); P(g, '#e04050', 20, 21, 3, 2);
  }));
  STATIC.mkpicnic = () => mk(32, 16, g => {
    for (let y = 1; y < 15; y += 3) for (let x = 0; x < 32; x += 3) P(g, (x + y) % 2 ? '#e04050' : '#f8f0e8', x, y, 3, 3);
    P(g, '#a07a4c', 20, 2, 8, 6); P(g, '#7a5535', 20, 2, 8, 1); P(g, '#7a5535', 23, 0, 2, 2); P(g, '#ffffff', 5, 6, 5, 3); P(g, '#e8b040', 6, 6, 3, 2); P(g, '#ffffff', 12, 9, 5, 3); P(g, '#c43030', 13, 9, 3, 2);
  });
  STATIC.mkeasel = () => outlined(mk(18, 30, g => {
    P(g, '#7a5535', 2, 10, 2, 20); P(g, '#7a5535', 14, 10, 2, 20); P(g, '#7a5535', 8, 4, 2, 26);
    P(g, '#f8f0e0', 1, 2, 16, 13); P(g, '#a8d8f0', 2, 3, 14, 6); P(g, '#3a7ac0', 2, 9, 14, 3); P(g, '#e8d8a8', 2, 12, 14, 2); P(g, '#ffffff', 4, 4, 3, 1); P(g, '#e04050', 11, 7, 2, 3); P(g, '#ffffff', 11, 6, 2, 1); P(g, '#5a3a20', 0, 15, 18, 2);
  }));
  STATIC.mkscope = () => outlined(mk(18, 26, g => { P(g, '#5a3a20', 8, 12, 2, 14); P(g, '#5a3a20', 3, 22, 2, 4); P(g, '#5a3a20', 13, 22, 2, 4); P(g, '#c9a040', 2, 6, 14, 4); P(g, '#e8c860', 3, 6, 12, 1); P(g, '#3a3a44', 15, 5, 3, 6); P(g, '#7ab8d8', 16, 6, 1, 4); P(g, '#c9a040', 0, 7, 3, 2); }));
  STATIC.crabtrack = () => mk(14 * 16, 64, g => {
    P(g, '#00000014', 0, 0, 224, 64);
    for (let l = 0; l < 4; l++) P(g, l % 2 ? '#e8d8a0' : '#f0e2b0', 0, l * 16 + 2, 224, 12);
    for (let l = 0; l <= 4; l++) for (let x = 0; x < 224; x += 4) P(g, '#8a6a40', x, l * 16 + (l === 4 ? 13 : 1), 2, 1);
    for (let x = 6; x < 224; x += 24) for (let l = 0; l <= 4; l++) { P(g, '#6f4c30', x, l * 16 - 2 + (l === 4 ? 12 : 0), 1, 4); P(g, ['#e04050', '#f0d040', '#3a7ac0'][(x / 24 | 0) % 3], x + 1, l * 16 - 2 + (l === 4 ? 12 : 0), 3, 2); }
    P(g, '#ffffff', 2, 2, 2, 60);
    for (let y = 2; y < 62; y += 3) for (let k = 0; k < 2; k++) P(g, (y / 3 + k) % 2 < 1 ? '#14100c' : '#ffffff', 212 + k * 3, y, 3, 3);
  });
  STATIC.crabboard = () => outlined(mk(32, 32, g => {
    P(g, '#6f4c30', 4, 18, 3, 14); P(g, '#6f4c30', 25, 18, 3, 14); P(g, '#3a4a3a', 1, 1, 30, 20); P(g, '#8a6239', 0, 0, 32, 2); P(g, '#8a6239', 0, 20, 32, 2);
    Font.center(g, 'CRABS', 16, 2, '#f0ece0');
    ['#e04030', '#3a7ac0', '#a8a498', '#f0a030'].forEach((c, i) => { P(g, c, 4 + i * 7, 13, 4, 3); P(g, c, 3 + i * 7, 12, 1, 1); P(g, c, 8 + i * 7, 12, 1, 1); });
  }));
})();

// ---- Crab races ------------------------------------------------------------------------
const CRABS = [{ name: 'Pinchy', c: '#e04030', d: '#a02820' }, { name: 'Sir Scuttles', c: '#3a7ac0', d: '#2a5a90' }, { name: 'Old Barnacle', c: '#a8a498', d: '#787468' }, { name: 'Little Nip', c: '#f0a030', d: '#b07020' }];
const CRAB_MOODS = { frisky: { k: 1.1, v: 0.25, say: 'frisky' }, steady: { k: 1.0, v: 0.12, say: 'steady' }, sleepy: { k: 0.9, v: 0.2, say: 'sleepy' }, moody: { k: 1.0, v: 0.6, say: 'moody' } };
const CrabRace = {
  X0: 14 * 16 + 6, X1: 27 * 16 + 8, LANE0: 24, card: null, race: null, showT: 12,
  st() { return S.market || (S.market = { wins: 0, trophy: false, races: 0 }); },
  open() { return S.time >= 420 && S.time < 1140; },
  // One step of a crab's run. Shared by the real race and the odds simulation.
  stepCrab(c, mood, dt, r) {
    if (c.nap > 0) { c.nap -= dt; return; }
    c.t -= dt;
    if (c.t <= 0) { c.t = 0.4; c.v = 22 * mood.k * (1 + (r() - 0.5) * 2 * mood.v); if (r() < 0.05) c.nap = 0.5 + r() * 0.6; }
    c.x += Math.max(4, c.v) * dt;
  },
  newCard() {
    const keys = Object.keys(CRAB_MOODS), moods = CRABS.map(() => keys[Math.floor(Math.random() * keys.length)]);
    const wins = [0, 0, 0, 0], N = 300;
    for (let n = 0; n < N; n++) wins[this.sim(moods, Math.random)]++;
    // The crowd only partly believes the board, so the odds lag a little behind the moods.
    // Simulated: random bets return about 0.74, careful mood-readers about 1.07.
    const odds = wins.map(w => { const p = 0.65 * Math.max(w, 1) / N + 0.35 * 0.25; return Math.max(1.3, Math.round(0.88 / p * 10) / 10); });
    this.card = { moods, odds };
  },
  sim(moods, r) {
    const cs = CRABS.map(() => ({ x: 0, v: 0, t: 0, nap: 0 })), L = this.X1 - this.X0;
    for (let i = 0; i < 2000; i++) { for (let k = 0; k < 4; k++) { this.stepCrab(cs[k], CRAB_MOODS[moods[k]], 0.1, r); if (cs[k].x >= L) return k; } }
    return cs.reduce((b, c, k) => (c.x > cs[b].x ? k : b), 0);
  },
  start(bet) {
    if (!this.card) this.newCard();
    this.race = { crabs: CRABS.map(() => ({ x: 0, v: 0, t: 0, nap: 0, wob: Math.random() * 6 })), bet, t: 0, over: 0, winner: -1, card: this.card };
    Sfx.play('whistle');
  },
  update(dt) {
    const m = Player.map;
    // Leaving mid-race with money on it: the race finishes without you.
    if (this.race && (!m || m.id !== 'saltmere')) { let g = 0; while (this.race && !this.race.over && g++ < 5000) this.tick(0.1); if (this.race) this.finish(); return; }
    if (!m || m.id !== 'saltmere') return;
    if (!this.race) {
      if (!this.card) this.newCard();
      // Races run all day for the crowd, bet or no bet.
      if (this.open()) { this.showT -= dt; if (this.showT <= 0) { this.showT = 40 + Math.random() * 20; this.start(null); } }
      return;
    }
    if (this.race.over) { this.race.over -= dt; if (this.race.over <= 0) this.finish(); return; }
    this.tick(dt);
  },
  tick(dt) {
    const r = this.race, L = this.X1 - this.X0;
    r.t += dt;
    r.crabs.forEach((c, k) => { this.stepCrab(c, CRAB_MOODS[r.card.moods[k]], dt, Math.random); c.wob += dt * (c.nap > 0 ? 1 : 10); });
    const lead = r.crabs.findIndex(c => c.x >= L);
    if (lead >= 0) {
      r.winner = lead; r.over = 3;
      const near = Math.hypot(Player.x - (this.X0 + this.X1) / 2, Player.y - 26 * 16) < 260;
      if (near) Sfx.play('crowdcheer');
      for (const p of Extras.active(Player.map)) if (p.e.crab) Extras.bubble(p, p.e.crab === CRABS[lead].name ? 'YES! ' + CRABS[lead].name.toUpperCase() + '!' : ['Noooo!', 'Go on, go on... oh.', 'Rigged!', CRABS[lead].name + '?!'][Math.floor(Math.random() * 4)], 2.6);
      if (near && !r.bet) toast(`${CRABS[lead].name} wins the race!`);
    }
  },
  finish() {
    const r = this.race; this.race = null;
    if (!r) return;
    const st = this.st(); st.races++;
    if (r.bet) {
      const win = r.bet.crab === r.winner;
      if (win) {
        const pay = Math.round(r.bet.amount * r.card.odds[r.winner]); S.gold += pay; st.wins++;
        Sfx.play('victory'); toast(`${CRABS[r.winner].name} wins! You collect ${pay} gold.`);
        if (st.wins >= 5 && !st.trophy) { st.trophy = true; Inv.add('golden_crab', 1, 0, true); UI.say('lou', 'Five winners! Nobody does that. Here, the Golden Crab. Do not tell the others how you read them, or I am out of business.'); }
      } else { Sfx.play('sad'); toast(`${CRABS[r.winner].name} wins. Your ${CRABS[r.bet.crab].name} was ${['still thinking about it', 'distracted by a shell', 'going sideways, mostly', 'having a little rest'][Math.floor(Math.random() * 4)]}.`); }
    }
    this.newCard();
  },
  boardText() {
    if (!this.card) this.newCard();
    return 'TODAY\'S RUNNERS: ' + CRABS.map((c, i) => `${c.name} (${CRAB_MOODS[this.card.moods[i]].say}) ${this.card.odds[i]}x`).join(', ') + '.';
  },
  bet() {
    if (!this.open()) return UI.say('lou', 'The crabs are asleep in their bucket. Races start at seven in the morning.');
    if (this.race) return UI.say('lou', 'They are off! Wait for this one to finish, then bet on the next.');
    if (!this.card) this.newCard();
    const card = this.card;
    UI.ask('lou', 'Who do you fancy? Look at their moods. A frisky crab runs fast, a sleepy one does not, and a moody one could do anything.', [
      ...CRABS.map((c, i) => ({ text: `${c.name}: ${CRAB_MOODS[card.moods[i]].say}, pays ${card.odds[i]}x`, fn: () => this.amount(i) })),
      { text: 'Just watching', fn() {} },
    ]);
  },
  amount(crab) {
    const opts = [50, 100, 200].filter(a => S.gold >= a).map(a => ({ text: `${a} gold`, fn: () => { S.gold -= a; Sfx.play('buy'); this.start({ crab, amount: a }); toast(`${a} gold on ${CRABS[crab].name}. They're off!`); } }));
    if (!opts.length) return UI.say('lou', 'Fifty gold minimum, friend. Even crabs have standards.');
    UI.ask('lou', `How much on ${CRABS[crab].name}?`, [...opts, { text: 'Changed my mind', fn() {} }]);
  },
  draw(g, items) {
    const r = this.race;
    CRABS.forEach((c, k) => {
      const cr = r && r.crabs[k], x = Math.round(this.X0 + (cr ? Math.min(cr.x, this.X1 - this.X0) : 0)), y = (this.LANE0 + k) * 16 + 10, wob = cr ? cr.wob : performance.now() / 600 + k;
      if (!r && !this.open()) return;
      items.push({ y, draw: () => {
        const leg = Math.round(Math.sin(wob) * 1);
        g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x - 5, y + 2, 11, 2);
        g.fillStyle = c.d; for (let i = 0; i < 3; i++) { g.fillRect(x - 6, y - 1 + i * 2 + (i % 2 ? leg : -leg), 2, 1); g.fillRect(x + 5, y - 1 + i * 2 + (i % 2 ? -leg : leg), 2, 1); }
        g.fillStyle = c.c; g.fillRect(x - 4, y - 3, 9, 5); g.fillRect(x - 3, y - 4, 7, 1);
        g.fillRect(x - 6, y - 7, 3, 3); g.fillRect(x + 4, y - 7, 3, 3); g.fillStyle = c.d; g.fillRect(x - 5, y - 4, 1, 2); g.fillRect(x + 5, y - 4, 1, 2);
        g.fillStyle = '#14100c'; g.fillRect(x - 2, y - 5, 1, 2); g.fillRect(x + 2, y - 5, 1, 2);
        if (cr && cr.nap > 0) { g.fillStyle = '#f0ece0'; g.fillRect(x + 3, y - 12, 3, 1); g.fillRect(x + 5, y - 11, 1, 1); g.fillRect(x + 3, y - 10, 3, 1); }
        if (r && r.winner === k && r.over > 0) { g.fillStyle = '#f0d040'; g.fillRect(x - 3, y - 12, 7, 2); g.fillRect(x - 3, y - 14, 1, 2); g.fillRect(x, y - 15, 1, 3); g.fillRect(x + 3, y - 14, 1, 2); }
      } });
    });
  },
};

// ---- Kites -------------------------------------------------------------------------------
const Kite = {
  t: 0,
  fly() {
    if (Player.map.indoor) { toast('Not indoors. Think of the lamps.'); Sfx.play('deny'); return; }
    if (this.t > 0) { this.t = 0; toast('You reel the kite in.'); return; }
    this.t = 30; Sfx.play('whoosh'); toast('Up it goes!');
    for (const p of Extras.active(Player.map)) if (Math.hypot(p.x - Player.x, p.y - Player.y) < 120 && Math.random() < 0.5) Extras.bubble(p, ['Ooh, a kite!', 'Higher! Higher!', 'Lovely colours!', 'Mind the gulls!'][Math.floor(Math.random() * 4)], 2.4);
  },
  draw(g, items) {
    if (this.t <= 0) return;
    items.push({ y: Player.y + 1, draw: () => {
      const t = performance.now() / 1000, x = Math.round(Player.x), y = Math.round(Player.y), kx = x + 26 + Math.round(Math.sin(t * 0.9) * 7), ky = y - 74 + Math.round(Math.cos(t * 1.3) * 5);
      g.fillStyle = 'rgba(240,240,240,0.75)';
      for (let i = 0; i < 24; i++) g.fillRect(Math.round(x + 4 + (kx - x - 4) * i / 24), Math.round(y - 14 + (ky - y + 14) * i / 24 + Math.sin(i / 3 + t) * 2), 1, 1);
      for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#f0d040' : '#e04050'; g.fillRect(kx - 5 + i, ky - 6 + i, 11 - i * 2, 1); g.fillRect(kx - 5 + i, ky + 5 - i, 11 - i * 2, 1); }
      g.fillStyle = '#3a7ac0'; g.fillRect(kx, ky - 6, 1, 12); g.fillRect(kx - 5, ky, 11, 1);
      for (let i = 0; i < 5; i++) { g.fillStyle = ['#e04050', '#f0d040', '#3a7ac0'][i % 3]; g.fillRect(kx + Math.round(Math.sin(t * 4 + i) * 2), ky + 7 + i * 3, 2, 1); }
    } });
  },
};

Object.assign(Actions, {
  crabboard: () => UI.say(null, 'Chalked on the board: ' + CrabRace.boardText() + ' Talk to Lou to place a bet.'),
  mkeasel: () => UI.say('m_painter', ['Do you like it? It is the sea. It is always the sea. I tried a cow once. It came out as the sea.', 'It is not finished. It will never be finished. The light keeps changing.'][Math.floor(Math.random() * 2)]),
  mkscope: () => {
    const night = S.time >= 1140 || S.time < 360;
    UI.say(null, night ? 'Stars, thick as spilled sugar. Through the brass you can see a ringed one, low over Gull\'s Teeth, and a smudge the stargazer insists is another sea.' : 'You see Gull\'s Teeth, sharp and grey on the horizon, and a gull, very close, looking back at you.');
  },
});

// ---- People ------------------------------------------------------------------------------
npc({
  id: 'tilda', name: 'Tilda Brine', role: 'Fishmonger', remote: true,
  look: { skin: '#e0b088', skinD: '#c09068', hair: '#c8c4bc', hairD: '#a8a49c', style: 'bun', shirt: '#3a7ac0', shirtD: '#2a5a90', apron: '#e8f0f4', belt: '#5a3a20', pants: '#4a4a54', pantsD: '#3a3a44', shoes: '#2a1a12' },
  sched: [[360, 'saltmere', 16, 11], [1140, 'saltmere', 16, 11, true]],
  loves: ['swordfish', 'moonjelly', 'tuna'], likes: ['kind:fish', 'shell'], hates: ['carp'],
  greet: ['Fresh fish! Fresh as the morning! Fresher, some of them.', 'You have a fisher\'s hands. Or a farmer\'s. Both get you up early.', 'Mind the drips.'],
  chat: [
    { h: 0, t: 'Forty years on this beach. The west end was all crabs when I was a girl too. We moved them. Well. We asked them very firmly.' },
    { h: 2, t: 'The trick with fish is the eye. Clear eye, good fish. Same with people, mostly.' },
    { h: 4, t: 'My husband went out past the Teeth one winter and did not come back. I still put a fish aside for him. The cat eats it. He would have liked the cat.' },
  ],
  reactions: [],
  extra(opts) { opts.push({ text: 'Trade', fn: () => UI.push(UI.shop('fishmarket', 'tilda')) }); },
});
npc({
  id: 'wren', name: 'Wren Calloway', role: 'Kite maker', remote: true,
  look: { skin: '#f0c49a', skinD: '#d9a678', hair: '#3a2a1a', hairD: '#2a1a10', style: 'messy', shirt: '#f0d040', shirtD: '#c8a820', belt: '#e04050', pants: '#3a7ac0', pantsD: '#2a5a90', shoes: '#2a1a12', hat: 'straw' },
  sched: [[360, 'saltmere', 22, 11], [1140, 'saltmere', 22, 11, true]],
  loves: ['silk_ribbon', 'windchime', 'pinwheel'], likes: ['kind:gift', 'kind:forage'], hates: ['stone', 'coal'],
  greet: ['Kites! Diamonds, boxes, a fish, a dragon. Well, a lizard. It was meant to be a dragon.', 'Good wind today. There is always good wind here.', 'Have you ever flown one? You have to. It is the law. It is not the law.'],
  chat: [
    { h: 0, t: 'I make them from sailcloth off old boats. Every kite has been to sea. Now they go to the sky instead. Promotion.' },
    { h: 2, t: 'When the kids fly them in a row along the beach, you can see them from the lighthouse. Gideon says it is the only time he smiles.' },
    { h: 4, t: 'My mother said I had my head in the clouds. So I put the rest of me on a string and sent it up there too.' },
  ],
  reactions: [],
  extra(opts) { opts.push({ text: 'Trade', fn: () => UI.push(UI.shop('kites', 'wren')) }); },
});
npc({
  id: 'lou', name: 'Lucky Lou', role: 'Crab race bookie', remote: true,
  look: { skin: '#c99a72', skinD: '#a87c58', hair: '#2a1a10', hairD: '#1a100a', style: 'short', beard: '#2a1a10', shirt: '#9a2a2a', shirtD: '#701a1a', cape: '#e8c040', belt: '#2a1a10', pants: '#e8dcc4', pantsD: '#c8bca8', shoes: '#2a1a12', hat: 'cap', hatC: '#e8c040', hatD: '#a08020' },
  sched: [[360, 'saltmere', 12, 25], [1140, 'saltmere', 12, 25, true]],
  loves: ['golden_crab', 'pearl', 'gold_ore'], likes: ['kind:food', 'shell'], hates: ['kind:crop'],
  greet: ['Step up, step up! Four crabs, one winner, no refunds!', 'Read the board, friend. The moods are chalked fresh every race.', 'Lucky Lou! That is me. Ask anyone. Do not ask the crabs.'],
  chat: [
    { h: 0, t: 'Racing crabs are nothing like the biters down by the wreck. These are gentlemen. Mostly. Pinchy is not a gentleman.' },
    { h: 2, t: 'Between you and me, the crowd bets on names. Nobody reads the moods. A frisky crab with long odds is the best friend you will ever have.' },
    { h: 4, t: 'I was a sailor once. Got seasick every single day for nine years. Now I bet on animals that walk sideways, and I have never been happier.' },
  ],
  reactions: [],
  extra(opts) { opts.push({ text: 'Bet on the crabs', fn: () => CrabRace.bet() }); opts.push({ text: 'Read the board', fn: () => UI.say('lou', CrabRace.boardText()) }); },
});

(() => {
  const L = (skin, hair, style, shirt, pants, more) => BEACH(skin, hair, style, shirt, pants, more);
  const SKN = [['#f0c49a', '#d9a678'], ['#c99a72', '#a87c58'], ['#8a5a3a', '#6a4228'], ['#e0b088', '#c09068']];
  const day = 'day', night = 'night';
  const crabFan = (id, x, y, dir, crab, look) => ({ map: 'saltmere', name: 'Race Fan', look, at: [x, y], dir, only: day, crab, lines: [`Come on, ${crab}!`, 'I have a whole copper on this.', `${crab} is due. ${crab} is SO due.`] });
  Object.assign(EXTRAS, {
    // The fish market.
    m_fruit: { map: 'saltmere', name: 'Fruit Seller', look: L(SKN[2], ['#1a100a', '#100804'], 'long', ['#3a9a5a', '#2a7a3a'], ['#e8dcc4', '#c8bca8']), at: [28, 11], dir: DIRS.down, only: day, lines: ['Coconuts! Limes! A pineapple, singular!', 'The limes keep the sailors\' teeth in. Ask any sailor. Ask to see their teeth.'] },
    m_crier: { map: 'saltmere', name: 'Market Crier', look: L(SKN[0], ['#c87a48', '#a0582c'], 'messy', ['#e8e0d0', '#c4baa6'], ['#5a4a38', '#44382a'], { hat: 'cap', hatC: '#3a7ac0', hatD: '#2a5a90' }), at: [19, 15], dir: DIRS.down, only: day, lines: ['FRESH FISH! KITES! COCONUTS! CRABS THAT RACE! FISH THAT DO NOT!', 'Market is open from dawn! Bring your own basket!', 'Hear ye! Tilda has eels! Smoked ones!'] },
    m_porter: { map: 'saltmere', name: 'Porter', look: L(SKN[2], ['#1a1210', '#100a08'], 'short', ['#a07a50', '#7a5a38'], ['#4a4a54', '#3a3a44']), route: [[13, 19], [33, 19], [33, 14], [13, 14]], speed: 18, stop: 1, prop: 'crate', only: day, lines: ['Fish for Tilda. Always fish for Tilda.', 'Mind your back! Mind MY back!'] },
    m_shop1: { map: 'saltmere', name: 'Shopper', look: L(SKN[3], ['#4a3020', '#2a1a10'], 'bun', ['#e870a8', '#b84a80'], ['#5a5048', '#40382c']), wander: [13, 13, 35, 19], speed: 12, only: day, lines: ['Is the eel fresh today? Is it ever?', 'I came for one fish and now I have a kite.'] },
    m_shop2: { map: 'saltmere', name: 'Shopper', look: L(SKN[1], ['#e8d8a8', '#c8b888'], 'short', ['#3a7ac0', '#2a5a90'], ['#e8dcc4', '#c8bca8'], { hat: 'straw' }), wander: [13, 13, 35, 19], speed: 12, only: day, lines: ['Tilda gave me the wink. That means the snapper is good.', 'Lovely morning for haggling.'] },
    m_shop3: { map: 'saltmere', name: 'Shopper', look: L(SKN[0], ['#3a2a1a', '#2a1a10'], 'long', ['#9a70e0', '#6a4ab0'], ['#3a3a44', '#2a2a32']), wander: [13, 13, 35, 19], speed: 12, only: day, lines: ['Have you tried the crab cakes? Do not ask what is in them. Crab. It is crab.'] },
    m_shop4: { map: 'saltmere', name: 'Shopper', look: L(SKN[2], ['#d8d4cc', '#b4b0a8'], 'bald', ['#e8a040', '#b87020'], ['#5a6a4a', '#40503a'], { beard: '#d8d4cc' }), wander: [13, 13, 35, 19], speed: 10, only: day, lines: ['In my day a fish cost a copper and a kite cost a lie about where your father was.'] },
    m_gulls: { map: 'saltmere', name: 'Gull Lady', look: L(SKN[3], ['#e0e0e0', '#c0c0c0'], 'bun', ['#5a7a9a', '#3a5a7a'], ['#5a5048', '#40382c']), at: [34, 17], dir: DIRS.down, only: day, lines: ['They know my name, you know. The gulls. They call it out. It sounds like "AARK".', 'Breadcrumbs. Never fish. They get ideas.'] },
    m_mend1: { map: 'saltmere', name: 'Net Mender', look: L(SKN[1], ['#3a2a1a', '#2a1a10'], 'short', ['#5a6a4a', '#40503a'], ['#4a4a54', '#3a3a44'], { beard: '#3a2a1a' }), at: [31, 17], dir: DIRS.up, only: day, pair: 'm_mend2', lines: ['Over, under, pull, knot. Over, under, pull, knot. Forever.'] },
    m_mend2: { map: 'saltmere', name: 'Net Mender', look: L(SKN[0], ['#c8a048', '#a07a30'], 'bun', ['#e8a040', '#b87020'], ['#5a5048', '#40382c']), at: [33, 15], dir: DIRS.left, only: day, lines: ['Something big went through this one. Something with opinions.'] },
    // The crab races.
    m_fan1: crabFan('m_fan1', 16, 23, DIRS.down, 'Pinchy', L(SKN[2], ['#1a100a', '#100804'], 'crop', ['#e04050', '#a02a38'], ['#3a3a44', '#2a2a32'])),
    m_fan2: crabFan('m_fan2', 19, 23, DIRS.down, 'Sir Scuttles', L(SKN[0], ['#e8d8a8', '#c8b888'], 'long', ['#3a7ac0', '#2a5a90'], ['#e8dcc4', '#c8bca8'])),
    m_fan3: crabFan('m_fan3', 23, 23, DIRS.down, 'Old Barnacle', L(SKN[3], ['#d8d4cc', '#b4b0a8'], 'bald', ['#8a8478', '#6a6458'], ['#4a4a54', '#3a3a44'], { beard: '#d8d4cc' })),
    m_fan4: crabFan('m_fan4', 26, 23, DIRS.down, 'Little Nip', L(SKN[1], ['#c2703a', '#96522a'], 'messy', ['#f0a030', '#b07020'], ['#3a7ac0', '#2a5a90'])),
    m_fan5: crabFan('m_fan5', 17, 28, DIRS.up, 'Little Nip', L(SKN[2], ['#3a2a1a', '#2a1a10'], 'bun', ['#f0d040', '#c8a820'], ['#5a5048', '#40382c'])),
    m_fan6: crabFan('m_fan6', 21, 28, DIRS.up, 'Pinchy', L(SKN[0], ['#c87a48', '#a0582c'], 'short', ['#ffffff', '#e0e0e0'], ['#e04050', '#a02a38'], { hat: 'straw' })),
    m_fan7: crabFan('m_fan7', 25, 28, DIRS.up, 'Old Barnacle', L(SKN[3], ['#4a3020', '#2a1a10'], 'long', ['#3a9a8a', '#2a6a5a'], ['#e8dcc4', '#c8bca8'])),
    // On the grass.
    m_pic1: { map: 'saltmere', name: 'Picnicker', look: L(SKN[1], ['#3a2a1a', '#2a1a10'], 'short', ['#3a9a8a', '#2a6a5a'], ['#e8dcc4', '#c8bca8']), at: [23, 5], dir: DIRS.right, only: day, pair: 'm_pic2', lines: ['Sandwich? There is sand in it. There is always sand in it.'] },
    m_pic2: { map: 'saltmere', name: 'Picnicker', look: L(SKN[0], ['#c8a048', '#a07a30'], 'long', ['#e870a8', '#b84a80'], ['#5a5048', '#40382c'], { hat: 'straw' }), at: [26, 5], dir: DIRS.left, only: day, lines: ['We come here every summer. Every summer, the same gull steals the same sandwich.'] },
    m_kite1: { map: 'saltmere', name: 'Kite Flyer', look: L(SKN[2], ['#1a100a', '#100804'], 'messy', ['#f0d040', '#c8a820'], ['#3a7ac0', '#2a5a90']), at: [25, 7], dir: DIRS.right, only: day, prop: 'kite', kite: '#3a7ac0', lines: ['Look how high! LOOK HOW HIGH!', 'Wren made it. It is a fish. A sky fish.'] },
    m_kite2: { map: 'saltmere', name: 'Kite Flyer', look: L(SKN[0], ['#c2703a', '#96522a'], 'bun', ['#e04050', '#a02a38'], ['#e8dcc4', '#c8bca8']), at: [35, 5], dir: DIRS.right, only: day, prop: 'kite', kite: '#3ab04a', lines: ['Mine is higher than his.', 'Do not tangle! DO NOT TANGLE!'] },
    m_kite3: { map: 'saltmere', name: 'Kite Flyer', look: L(SKN[3], ['#e8d8a8', '#c8b888'], 'short', ['#9a70e0', '#6a4ab0'], ['#4a4a54', '#3a3a44']), at: [57, 6], dir: DIRS.right, only: day, prop: 'kite', kite: '#f0a030', lines: ['The wind talks up there. You can feel it in the string.'] },
    m_painter: { map: 'saltmere', name: 'Painter', look: L(SKN[3], ['#4a3020', '#2a1a10'], 'long', ['#e8e0d0', '#c4baa6'], ['#3a3a44', '#2a2a32'], { hat: 'cap', hatC: '#9a2a2a', hatD: '#701a1a' }), at: [31, 5], dir: DIRS.right, only: day, prop: 'brush', lines: ['Hold still. No, you. The sea will not hold still for anyone.', 'Blue, more blue, a bit less blue. That is the whole secret.'] },
    m_old1: { map: 'saltmere', name: 'Old Sweetheart', look: L(SKN[1], ['#e0e0e0', '#c0c0c0'], 'bald', ['#5a6a4a', '#40503a'], ['#4a4a54', '#3a3a44'], { beard: '#e0e0e0' }), at: [16, 7], dir: DIRS.right, pair: 'm_old2', lines: ['Fifty years married. We met right here. She threw a crab at me.'] },
    m_old2: { map: 'saltmere', name: 'Old Sweetheart', look: L(SKN[0], ['#e0e0e0', '#c0c0c0'], 'bun', ['#e870a8', '#b84a80'], ['#5a5048', '#40382c']), at: [17, 7], dir: DIRS.left, lines: ['It was a small crab. He has never let it go.'] },
    m_stars: { map: 'saltmere', name: 'Stargazer', look: L(SKN[2], ['#1a1210', '#100a08'], 'short', ['#2a3a5a', '#1a2a4a'], ['#3a3a44', '#2a2a32']), at: [67, 6], dir: DIRS.right, only: night, lines: ['See that red one? That is not a star. That is a planet. Or a lantern on a very tall ship.', 'Shh. If you are quiet, you can hear them.'] },
    // In the sea.
    m_swim1: { map: 'saltmere', name: 'Swimmer', look: L(SKN[1], ['#1a100a', '#100804'], 'crop', ['#c99a72', '#a87c58'], ['#e04050', '#a02a38']), route: [[18, 35], [28, 35]], speed: 9, stop: 3, swim: true, prop: 'swim', only: day, lines: ['The water is lovely! It is freezing! Both!', 'Do not tell the lifeguard.'] },
    m_swim2: { map: 'saltmere', name: 'Swimmer', look: L(SKN[0], ['#c8a048', '#a07a30'], 'long', ['#f0c49a', '#d9a678'], ['#3a7ac0', '#2a5a90']), route: [[40, 35], [46, 36], [52, 35]], speed: 8, stop: 2, swim: true, prop: 'swim', only: day, lines: ['I swim to the rock and back every morning. I have never reached the rock.'] },
    m_swim3: { map: 'saltmere', name: 'Swimmer', look: L(SKN[2], ['#3a2a1a', '#2a1a10'], 'short', ['#8a5a3a', '#6a4228'], ['#3ab04a', '#2a8a3a']), route: [[70, 35], [76, 36]], speed: 8, stop: 4, swim: true, prop: 'swim', only: day, lines: ['NO SWIMMING, says the sign. I am not swimming. I am floating with purpose.'] },
    m_swim4: { map: 'saltmere', name: 'Paddling Kid', look: L(SKN[3], ['#c2703a', '#96522a'], 'messy', ['#e0b088', '#c09068'], ['#f0d040', '#c8a820']), at: [58, 34], dir: DIRS.down, swim: true, prop: 'swim', only: day, lines: ['A fish touched my foot! A FISH TOUCHED MY FOOT!'] },
    m_surf1: { map: 'saltmere', name: 'Surfer', look: L(SKN[1], ['#e8d8a8', '#c8b888'], 'messy', ['#f08a30', '#c06a20'], ['#3a7ac0', '#2a5a90']), route: [[32, 37], [38, 37]], speed: 12, stop: 2, swim: true, prop: 'surf', board: '#e04050', only: day, lines: ['Waiting for the big one. Been waiting six years.', 'Duuude.'] },
    m_surf2: { map: 'saltmere', name: 'Surfer', look: L(SKN[2], ['#1a100a', '#100804'], 'long', ['#3ab04a', '#2a8a3a'], ['#2a2a3a', '#1a1a2a']), route: [[54, 38], [60, 37]], speed: 12, stop: 3, swim: true, prop: 'surf', board: '#3a7ac0', only: day, lines: ['The sea does not care how good you are. That is why I love it.'] },
    // The east end, busier.
    m_dig1: { map: 'saltmere', name: 'Sandcastle Builder', look: L(SKN[0], ['#c2703a', '#96522a'], 'messy', ['#e04050', '#a02a38'], ['#3a7ac0', '#2a5a90']), at: [49, 28], dir: DIRS.left, only: day, prop: 'spade', pair: 'm_dig2', lines: ['It is a castle. With a moat. And a dragon. The dragon is the lump.'] },
    m_dig2: { map: 'saltmere', name: 'Sandcastle Builder', look: L(SKN[1], ['#3a2a1a', '#2a1a10'], 'short', ['#f0d040', '#c8a820'], ['#e8dcc4', '#c8bca8'], { hat: 'straw' }), at: [50, 30], dir: DIRS.up, only: day, prop: 'spade', lines: ['Dad, the tide is coming. Dad. DAD.'] },
    m_juggle: { map: 'saltmere', name: 'Street Juggler', look: L(SKN[3], ['#e04050', '#a02a38'], 'messy', ['#f0d040', '#e04050'], ['#3a7ac0', '#2a5a90']), at: [55, 12], dir: DIRS.down, only: day, juggle: true, music: '#f0d070', lines: ['Three balls! Four! No, three. It was always three.', 'A coin for the juggler? Any coin. A button. A nice shell.'] },
    m_pier1: { map: 'saltmere', name: 'Couple on the Pier', look: L(SKN[1], ['#3a2a1a', '#2a1a10'], 'short', ['#ffffff', '#e0e0e0'], ['#2a3a5a', '#1a2a4a']), route: [[65, 33], [65, 40]], speed: 10, stop: 4, night: true, lines: ['We come out here to watch the sun go down. And then the lighthouse comes on, and we watch that.'] },
    m_pier2: { map: 'saltmere', name: 'Couple on the Pier', look: L(SKN[0], ['#c8a048', '#a07a30'], 'long', ['#e870a8', '#b84a80'], ['#f4efe4', '#d8d0c0']), follow: 'm_pier1', speed: 10, night: true, lines: ['He proposed on this pier. He dropped the ring. Tilda found it in a mackerel.'] },
    m_walk3: { map: 'saltmere', name: 'Beachgoer', look: L(SKN[2], ['#1a1210', '#100a08'], 'crop', ['#e8a040', '#b87020'], ['#e8dcc4', '#c8bca8']), wander: [12, 23, 80, 32], speed: 13, only: day, lines: ['Nice to see the west end busy again. It was all crabs, you know.'] },
    m_walk4: { map: 'saltmere', name: 'Beachgoer', look: L(SKN[3], ['#3a2a1a', '#2a1a10'], 'bun', ['#3a9ac0', '#2a7aa0'], ['#5a5048', '#40382c']), wander: [12, 9, 80, 19], speed: 13, only: day, lines: ['Market first, then the races, then a nap. That is a perfect day.'] },
    m_walk5: { map: 'saltmere', name: 'Beachgoer', look: L(SKN[1], ['#c87a48', '#a0582c'], 'short', ['#5a7a9a', '#3a5a7a'], ['#3a3a44', '#2a2a32'], { hat: 'cap', hatC: '#e04050', hatD: '#a02a38' }), wander: [40, 9, 80, 19], speed: 14, only: day, lines: ['Have you seen the juggler? He dropped one on my head. I tipped him anyway.'] },
  });
  Object.assign(GOSSIP, {
    m_pic1: [['m_pic1', 'Pass the lemonade?'], ['m_pic2', 'The gull has it.'], ['m_pic1', 'The gull has the lemonade?'], ['m_pic2', 'The gull has everything, dear.']],
    m_mend1: [['m_mend1', 'Storm coming Thursday.'], ['m_mend2', 'You say that every week.'], ['m_mend1', 'And every week I am right eventually.']],
    m_old1: [['m_old1', 'Remember when we were young?'], ['m_old2', 'You threw sand at me.'], ['m_old1', 'You threw a crab.'], ['m_old2', 'You deserved the crab.']],
    m_dig1: [['m_dig2', 'Is it finished?'], ['m_dig1', 'A castle is never finished.'], ['m_dig2', 'The sea says it is.']],
  });
  HERDS.saltmere = (HERDS.saltmere || []).concat([['cat', 1, 13, 9, 36, 19, ['#e8e0d0', '#9a9488']], ['dog', 1, 40, 9, 78, 19, ['#c8a060', '#a07a40']]]);
  // The new stalls' wares.
  const stock = UI.stock.bind(UI);
  UI.stock = kind => (kind === 'fishmarket' ? [{ id: 'mackerel', price: 160 }, { id: 'sea_bass', price: 250 }, { id: 'tuna', price: 360 }, { id: 'eel', price: 400 }, { id: 'smoked_eel', price: 260 }, { id: 'crab_cakes', price: 240 }]
    : kind === 'kites' ? [{ id: 'kite', price: 300 }, { id: 'pinwheel', price: 120 }, { id: 'windchime', price: 450 }]
      : stock(kind));
  // Fly a kite by using it.
  const useHeld = Player.useHeld;
  Player.useHeld = function (fromMouse) { const s = Inv.held(); if (s && s.id === 'kite') return Kite.fly(); return useHeld.call(this, fromMouse); };
  // A cheer and a race whistle.
  const { ftone } = Sfx.kit;
  Object.assign(Sfx.SOUNDS, {
    whistle() { ftone(this, 2400, 0.35, 'sine', 0.06, 0, 0, 5000, 0.01); ftone(this, 2600, 0.12, 'sine', 0.05, 0.38, 0, 5000, 0.01); },
    crowdcheer() { this.noise(1.4, 0.07, 1800, { type: 'bandpass', q: 1, attack: 0.15 }); for (let i = 0; i < 5; i++) ftone(this, 500 + Math.random() * 500, 0.3, 'sawtooth', 0.012, Math.random() * 0.5, 120, 1600, 0.05); },
  });
})();

// ---- Building the west end -----------------------------------------------------------------
(() => {
  const build = World.build.bind(World);
  World.build = function () {
    build();
    const W = this, m = W.maps.saltmere;
    if (!m) return;
    const clear = (x0, y0, w, h) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { const o = W.at(m, x, y); if (o && o.type !== 'sign') W.remove(m, o); } };
    const put = (type, x, y, props) => { const d = OBJDEF[type]; clear(x, y, d.fw || 1, d.fh || 1); return W.add(m, type, x, y, props); };
    // The fish market.
    put('mkfish', 15, 12); put('mkkite', 21, 12); put('mkfruit', 27, 12);
    put('mkice', 18, 12); put('mkpots', 31, 12); put('mkpots', 32, 12); put('mkice', 25, 11);
    put('mkrack', 14, 17); put('mknet', 34, 11); put('crate', 24, 17); put('crate', 25, 17); put('barrel', 30, 17);
    // The crab races.
    clear(11, 23, 18, 7);
    put('crabtrack', 14, 24); put('crabboard', 11, 23);
    W.add(m, 'sign', 29, 26, { text: 'THE WRECK ROCKS. Biting crabs beyond this point. The racing crabs are the nice ones. - Lou' });
    // On the grass.
    put('mkpicnic', 24, 5); put('mkeasel', 32, 5); put('mkscope', 68, 6); put('bench', 16, 6);
    // The biters keep to the rocks around the wreck.
    m.spawns = (m.spawns || []).filter(sp => sp.t !== 'saltclaw').concat([{ t: 'saltclaw', x: 37, y: 28, n: 3, r: 4 }, { t: 'saltclaw', x: 39, y: 32, n: 2, r: 2 }, { t: 'saltclaw', x: 32, y: 33, n: 1, r: 1 }]);
  };
  // Every frame: the races and the kite.
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) {
    tick(dt);
    if (!S || !Player.map) return;
    CrabRace.update(dt || 1 / 60);
    if (Kite.t > 0) { Kite.t -= dt || 1 / 60; if (Player.map.indoor) Kite.t = 0; }
  };
  const drawWorld = Story.drawWorld.bind(Story);
  Story.drawWorld = function (g, m, items) {
    drawWorld(g, m, items);
    if (m.id === 'saltmere') CrabRace.draw(g, items);
    if (!m.indoor) Kite.draw(g, items);
  };
})();
