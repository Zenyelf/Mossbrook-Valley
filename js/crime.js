'use strict';
// Theft, witnesses, bounties, the Crown's guards, Ironback Gaol and escape.
// Everything stolen is marked, and every crime goes into the permanent record.

const CELL = [13, 4];
const GAOL_GATE = [10, 8];
const CULVERT = [6, 13];
const LOOT = {
  store: { items: [['turnip_seed', 3, 6], ['potato_seed', 2, 4], ['strawberry_seed', 1, 3], ['feed', 2, 5], ['trailmix', 1, 1]], gold: [0, 20] },
  inn: { items: [['omelette', 1, 1], ['stew', 1, 1], ['trailmix', 1, 2], ['egg', 2, 4], ['grape', 2, 3]], gold: [10, 60] },
  smithy: { items: [['copper', 2, 4], ['iron', 1, 2], ['coal', 2, 4], ['arrow', 5, 10]], gold: [0, 30] },
  shrine: { items: [['herb', 2, 4], ['salve', 1, 2], ['holly', 1, 2]], gold: [20, 80] },
  bram_home: { items: [['hazelnut', 2, 4], ['potato', 2, 3]], gold: [20, 50], unique: 'bram_medal' },
  tolley_home: { items: [['salve', 1, 1], ['carp', 1, 2]], gold: [5, 15] },
  village: { items: [['wood', 3, 6], ['stone', 3, 6], ['feed', 2, 4], ['copper', 1, 2]], gold: [0, 0] },
};

Object.assign(ACT_LABEL, { jailbed: 'Sleep', grate: 'Inspect grate', locker: 'Open locker' });
const LABOR_LABEL = { rocks: 'Break rocks', laundry: 'Scrub laundry', kitchen: 'Peel potatoes' };

const Crime = {
  cool: 0,

  // ---- Who sees you ---------------------------------------------------------
  los(m, x0, y0, x1, y1) {
    const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / 8);
    for (let i = 1; i < n; i++) {
      const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
      if (World.solid(m, Math.floor(x / TILE), Math.floor(y / TILE))) return false;
    }
    return true;
  },

  asleep(p) { return p.map.indoor && p.map.owner === p.id && (S.time >= 1260 || S.time < 360); },

  sees(p, mul = 1) {
    const m = Player.map;
    if (p.hidden || p.map !== m || this.asleep(p)) return false;
    const dx = Player.x - p.x, dy = Player.y - p.y, d = Math.hypot(dx, dy);
    let range = (p.def.guard ? 150 : 125) * mul;
    if (Combat.sneaking) range *= 0.55;
    if (!m.indoor && Render.darkness() > 0.5) range *= 0.6;
    if (m.id === 'gaol' && (S.time >= 1260 || S.time < 360)) range *= 0.7;
    range *= 1 - S.skills.stealth.lvl * 0.04;
    if (Inv.count('softboots')) range *= 0.8;
    if (d > range) return false;
    if (d > (Combat.sneaking ? 20 : 40)) {
      const dot = (dx * DX[p.dir] + dy * DY[p.dir]) / (d || 1);
      if (dot < 0.3) return false;
    }
    return this.los(m, p.x, p.y - 8, Player.x, Player.y - 8);
  },

  // The owner of a home is asleep in it at night, and may wake.
  sleeper(m) {
    if (!m.owner || !m.bed) return null;
    const p = People.get(m.owner);
    return p && p.hidden && !People.absent(p) && (S.time >= 1260 || S.time < 420) ? p : null;
  },

  witnesses(exclude, staffOnly) {
    const out = People.list.filter(p => p.id !== exclude && (!staffOnly || p.def.guard) && this.sees(p));
    People.list.forEach(p => { if (!p.hidden && p.map === Player.map && p.id !== exclude && this.asleep(p) && Math.random() < (Combat.sneaking ? 0.08 : 0.3)) out.push(p); });
    const s = this.sleeper(Player.map);
    if (s && s.id !== exclude && Math.random() < (Combat.sneaking ? 0.1 : 0.3)) out.push(s);
    return out.sort((a, b) => (b.def.guard ? 1 : 0) - (a.def.guard ? 1 : 0));
  },

  // ---- What you can take ----------------------------------------------------
  ownerOf(o, m) { return o.owner || m.owner || null; },
  canSteal(o, m) { return Combat.sneaking && STEALABLE.has(o.type) && !!this.ownerOf(o, m) && !o.tolley; },
  stealLabel(o) { return this.canSteal(o, Player.map) ? 'Steal from ' + (o.type === 'bookshelf' ? 'shelf' : o.type) : null; },
  gardenOwner(m, x, y) { const gd = (m.gardens || []).find(q => x >= q.x && x < q.x + q.w && y >= q.y && y < q.y + q.h); return gd ? gd.owner : null; },

  behind(p) {
    const dx = Player.x - p.x, dy = Player.y - p.y, d = Math.hypot(dx, dy) || 1;
    return (dx * DX[p.dir] + dy * DY[p.dir]) / d < 0.25;
  },
  canPick(p) { return Combat.sneaking && !!p.def.pockets && this.behind(p) && S.npc[p.id].picked !== absDay(); },

  lootContainer(o, m) {
    const k = m.id + ':' + o.x + ',' + o.y, owner = this.ownerOf(o, m);
    if (S.loot[k] && absDay() - S.loot[k] < 3) { toast('Nothing worth taking. Not yet.'); return; }
    S.loot[k] = absDay();
    const table = LOOT[m.id] || LOOT.village, items = [];
    let gold = rnd(table.gold[0], table.gold[1]);
    if (o.type === 'lockbox' && table.unique && !S.picked[table.unique]) { S.picked[table.unique] = 1; items.push([table.unique, 1]); gold += 40; }
    else { const [id, a, b] = pick(table.items); items.push([id, rnd(a, b)]); }
    this.commit({ owner, items, gold, place: m.id, desc: `Stole from ${NPCS[owner].name}` });
  },

  stealCrop(m, x, y) {
    const s = Farm.soilAt(m, x, y), owner = this.gardenOwner(m, x, y), id = s.c.id;
    s.c = null;
    this.commit({ owner, items: [[id, 1]], gold: 0, place: m.id, desc: `Pulled a ${CROPS[id].name.toLowerCase()} from ${NPCS[owner].name}'s garden` });
  },

  pickpocket(p) {
    const st = S.npc[p.id], name = p.def.name, pk = p.def.pockets;
    st.picked = absDay();
    const night = S.time >= 1200 || S.time < 420;
    const chance = clamp(0.5 + S.skills.stealth.lvl * 0.06 + (night ? 0.08 : 0) + (Inv.count('softboots') ? 0.08 : 0), 0.1, 0.95);
    if (Math.random() > chance) {
      Sfx.play('alarm');
      return this.caught(p, { owner: p.id, items: [], gold: 0, value: 60, desc: `Tried to pick ${name}'s pocket` });
    }
    const items = [];
    let gold = rnd(pk.gold[0], pk.gold[1]);
    if (pk.unique && !S.picked[pk.unique]) { S.picked[pk.unique] = 1; items.push([pk.unique, 1]); }
    else if (pk.items && Math.random() < 0.5) { const [id, a, b] = pick(pk.items); items.push([id, rnd(a, b)]); }
    if (!gold && !items.length) gold = 1;
    this.commit({ owner: p.id, items, gold, place: Player.map.id, desc: `Picked ${name}'s pocket` }, p.id);
  },

  // Hands over the goods, then decides whether anyone noticed.
  commit(c, exclude) {
    c.value = c.value || c.items.reduce((t, [id, n]) => t + ITEMS[id].price * n, 0) + c.gold;
    const seen = this.witnesses(exclude)[0];
    c.items.forEach(([id, n]) => Inv.add(id, n, 0, false, true));
    if (c.gold) { S.gold += c.gold; toast(`+${c.gold} gold (stolen)`); }
    gainXP('stealth', 10 + Math.floor(c.value / 20));
    Sfx.play('steal');
    S.crimes = (S.crimes || 0) + 1;
    const what = c.items.map(([id, n]) => `${n} ${ITEMS[id].name}`).concat(c.gold ? [`${c.gold}g`] : []).join(', ');
    if (!seen) {
      Memory.deed('crime_' + S.crimes, `${c.desc} (${what}). No one saw.`, { once: false });
      if (c.place === 'store') Memory.flag('clean_store');
      if (c.owner === 'marta') Memory.deed('robbed_marta', 'Hale\'s Goods has been coming up short.', { once: true, witness: ['marta'] });
      S.notoriety = Math.min(100, S.notoriety + 1);
      toast('Unseen.');
      Quests.pulse();
      return;
    }
    Memory.deed('crime_' + S.crimes, `${c.desc} (${what}), and ${seen.def.name} saw it.`, { once: false, gossip: true, witness: [seen.id, c.owner] });
    this.caught(seen, c);
  },

  // ---- Getting caught -------------------------------------------------------
  leverage(id) {
    if (id === 'odile' && S.known.odile_notes) return '"I have read your notebook, Sergeant. Dell Hale. Detained. Not reassigned."';
    if (id === 'sera' && S.known.sera_ledger) return '"Two hundred gold for names, Sera. From a Crown clerk."';
    if (id === 'bram' && S.known.bram_medal) return '"River Detail, Year 76. I found your medal, Bram."';
    if (id === 'ivo' && Memory.did('kept_shackle')) return '"I still have the small shackle, Ivo. With your mark on it."';
    if (id === 'marta' && S.known.sera_ledger) return '"Sera\'s ledger has your name in it, Marta. Shall I read it out?"';
    return null;
  },

  reportTo(c) {
    if (S.ending === 'keep') { toast('Nobody dares report the King\'s Warden.'); return; }
    const add = Math.floor(c.value * 2) + 50;
    S.bounty += add;
    S.notoriety = Math.min(100, S.notoriety + 6 + Math.floor(c.value / 50));
    S.rep.town -= 1;
    toast(`Reported to the Crown. Bounty: ${S.bounty}g`);
  },

  returnGoods(c) {
    c.items.forEach(([id, n]) => Inv.remove(id, n));
    S.gold = Math.max(0, S.gold - c.gold);
  },

  caught(p, c) {
    const id = p.id, def = p.def, h = hearts(id);
    Combat.sneaking = false; Horse.dismount();
    if (def.guard) { this.reportTo(c); return this.confront(p); }
    const need = Math.min(5, 1 + Math.floor(c.value / 150)), lev = this.leverage(id);
    const quiet = (loss, text) => { Trust.add(id, -loss); if (c.owner && c.owner !== id) Trust.add(c.owner, -Math.floor(loss / 2)); return text; };
    const opts = [];
    if (c.items.length || c.gold) opts.push({ t: 'Give it back.', do: () => { this.returnGoods(c); quiet(25); S.notoriety = Math.min(100, S.notoriety + 2); }, then: ['Fine. But I will remember this.'] });
    opts.push({ t: `[Persuasion ${need}] Talk your way out of it.`, lock: () => S.skills.persuasion.lvl >= need, xp: ['persuasion', 30], do: () => {
      if (Math.random() < 0.45 + S.skills.persuasion.lvl * 0.08) { quiet(10); this.said = 'Fine. I did not see anything. This once.'; }
      else { quiet(30); this.said = 'No. I know what I saw.'; if (!def.outlaw && !def.remote) this.reportTo(c); }
    }, then: [{ do: () => UI.say(id, this.said) }] });
    if (lev) opts.push({ t: lev, do: () => { quiet(120); S.rep.shadow += 1; Memory.deed('blackmail_' + id, `Blackmailed ${def.name} into silence.`, { witness: [id] }); }, then: ['...Get out of my sight.'] });
    if (h >= 6) opts.push({ t: '"Please. Do not tell anyone."', do: () => quiet(60), then: ['I should. I will not. Do not ever make me regret it.'] });
    opts.push({ t: 'Say nothing.', do: () => {
      quiet(40);
      if (def.outlaw) { if (id === 'rusk') { Memory.flag('camp_deal', false); toast('Rusk will not deal with you now.'); } }
      else if (!def.remote) this.reportTo(c);
    }, then: [def.outlaw || def.remote ? 'You will regret that.' : 'Then Sgt. Varr can hear about it.'] });
    Script.run([def.caughtLine || 'What do you think you are doing?', { ask: 'You have been caught.', who: null, opts }], id);
  },

  // ---- The Crown's guards ------------------------------------------------------
  update(dt) {
    this.cool -= dt;
    if ((!S.bounty && !S.wanted) || this.cool > 0 || UI.busy() || S.jail || S.ending === 'keep') return;
    const g = People.list.find(p => p.def.guard && !p.def.inGaol && this.sees(p, 1.1));
    if (g) this.confront(g);
  },

  confront(p) {
    this.cool = 30;
    Horse.dismount(); Combat.sneaking = false;
    const b = S.bounty, need = Math.min(5, 1 + Math.floor(b / 150)), lev = this.leverage(p.id);
    const opts = [
      { t: `Pay the fine (${b}g)`, lock: () => S.gold >= b, do: () => { S.gold -= b; S.bounty = 0; S.wanted = false; Sfx.play('coin'); Memory.deed('fined_' + absDay(), `Paid a ${b}g fine to the Crown.`, { once: false, gossip: true }); }, then: ['Paid in full. Do not make me do this again.'] },
    ];
    if (!S.wanted && b <= 400) opts.push({ t: `[Persuasion ${need}] "There has been a misunderstanding."`, lock: () => S.skills.persuasion.lvl >= need, xp: ['persuasion', 30], do: () => {
      const ok = Math.random() < 0.4 + S.skills.persuasion.lvl * 0.08;
      if (ok) S.bounty = Math.floor(S.bounty / 2); else S.bounty += 50;
      this.said = ok ? `Hm. Perhaps. Call it ${S.bounty}g, and pay it soon.` : `Do not insult me. It is ${S.bounty}g now.`;
    }, then: [{ do: () => UI.say(p.id, this.said) }] });
    if (lev) opts.push({ t: lev, do: () => { S.bounty = 0; S.wanted = false; Trust.add(p.id, -150); Memory.deed('blackmail_' + p.id, `Blackmailed ${p.def.name} into dropping the charges.`, { witness: [p.id] }); }, then: ['...This conversation did not happen. Neither did your crimes. Go.'] });
    opts.push({ t: 'Come quietly.', do: () => { this.after = () => this.arrest(false); } });
    opts.push({ t: 'Run!', do: () => {
      if (!S.wanted) Memory.deed('fled_guard', 'Ran from the Crown\'s guard.', { gossip: true });
      S.wanted = true; S.bounty += 100; S.notoriety = Math.min(100, S.notoriety + 10); this.cool = 45; toast('You are wanted by the Crown.');
    } });
    if (S.wanted) opts.push({ t: 'Fight.', do: () => { this.after = () => this.fight(p); } });
    this.after = null;
    Script.run([{ ask: S.wanted ? `There you are. You will come with me now, Ashgrove. ${b}g, or the gaol.` : `Hold. You owe the Crown ${b}g for your crimes.`, opts }], p.id, () => { if (this.after) this.after(); });
  },

  fight(p) {
    p.hidden = true; p.fighting = true;
    Foes.spawn(p.def.foe || 'crownguard', p.x, p.y, { alert: true, npc: p.id });
    Memory.deed('fought_guard_' + absDay(), `Drew steel on ${p.def.name}.`, { once: false, gossip: true, rep: { crown: -3 } });
  },

  // A beaten guard is knocked down, not killed, and back on duty tomorrow.
  guardDown(f) {
    const id = f.npc;
    if (id) S.downed[id] = absDay();
    S.bounty += 400; S.notoriety = Math.min(100, S.notoriety + 20);
    Memory.deed('beat_' + (id || 'guard') + '_' + absDay(), `Beat ${f.def.name} senseless in a fight.`, { once: false, gossip: true, rep: { crown: -3 } });
    toast('The guard goes down. Every guard in the valley will hear of it.');
  },

  // ---- Locks ---------------------------------------------------------------
  pickLock(w) {
    const owner = World.maps[w.to].owner;
    const seen = this.witnesses(owner)[0];
    if (seen) return this.caught(seen, { owner, items: [], gold: 0, value: 120, desc: `Tried to break into ${World.maps[w.to].name}` });
    UI.push(this.lockpickScreen(owner, ok => {
      if (!ok) return;
      S.unlocked[w.to] = absDay();
      Memory.deed('broke_into_' + w.to, `Picked the lock of ${World.maps[w.to].name}.`, {});
      gainXP('stealth', 25);
      toast('The lock gives.');
    }));
  },

  // Noise from a fumbled lock can be heard without being seen.
  noise() {
    const near = People.list.find(p => !p.hidden && p.map === Player.map && Math.hypot(p.x - Player.x, p.y - Player.y) < 70);
    return near || null;
  },

  // ---- Ironback Gaol ----------------------------------------------------------
  arrest(fromFight) {
    const days = clamp(1 + Math.floor(S.bounty / 200) + Math.floor(S.notoriety / 25) + (S.wanted ? 3 : 0), 1, 10);
    Game.fade(() => {
      const locker = S.jail ? S.jail.locker : [];
      S.inv.forEach((s, i) => { if (s && (s.s || ITEMS[s.id].kind === 'weapon' || s.id === 'lockpick')) { locker.push(s); S.inv[i] = null; } });
      S.jail = { left: days, total: days, tokens: 0, worked: 0, locker };
      Memory.deed('jailed', 'Was locked up in Ironback Gaol for the first time.', { gossip: true });
      Memory.deed('arrested_' + absDay(), `Arrested${fromFight ? ' after a beating' : ''} and sentenced to ${days} day${days > 1 ? 's' : ''} in Ironback Gaol.`, { once: false, gossip: true, rep: { crown: -1, town: -2 } });
      S.bounty = 0; S.wanted = false; S.notoriety = Math.min(100, S.notoriety + 5);
      Combat.sneaking = false; S.riding = false; Foes.list = []; S.hp = Math.max(S.hp, 30);
      Memory.flag('grate_open', false);
      Player.place('gaol', CELL[0] * TILE + 8, CELL[1] * TILE + 12, DIRS.down);
      UI.say(null, `You are sentenced to ${days} day${days > 1 ? 's' : ''} in Ironback Gaol. Your weapons and anything stolen are locked in the evidence locker. Work shifts to earn tokens and shorten your time.`);
    });
  },

  // Called every morning. Returns true if you wake up in a cell.
  morning(lines) {
    if (!S.jail) return false;
    S.jail.left--; S.jail.worked = 0;
    if (S.jail.left <= 0) { this.release(lines); return false; }
    Player.place('gaol', CELL[0] * TILE + 8, CELL[1] * TILE + 12, DIRS.down);
    lines.push({ t: `Ironback Gaol. ${S.jail.left} day${S.jail.left > 1 ? 's' : ''} left on your sentence.`, c: C.bad });
    return true;
  },

  release(lines, bribed) {
    const back = S.jail.locker.concat(S.evidence || []);
    S.evidence = [];
    back.forEach(s => { const left = Inv.add(s.id, s.n, s.q || 0, true, !!s.s); if (left) S.storage[Storage.slotKey(s.id, s.q, s.s)] = (S.storage[Storage.slotKey(s.id, s.q, s.s)] || 0) + left; });
    S.jail = null;
    S.notoriety = Math.max(0, S.notoriety - 5);
    if (S.quests.esc && S.quests.esc.state === 'active') Quests.lose('esc', 'You walked out the front gate instead.');
    Memory.flag('grate_open', false);
    Memory.deed('released_' + absDay(), bribed ? 'Bribed your way out of Ironback Gaol.' : 'Served your sentence and walked out of Ironback Gaol.', { once: false, gossip: !!bribed, rep: bribed ? { crown: -1 } : {} });
    const o = World.at(World.maps.ironback, GAOL_GATE[0], GAOL_GATE[1]); if (o && OBJDEF[o.type].dyn) World.remove(World.maps.ironback, o);
    Player.place('ironback', GAOL_GATE[0] * TILE + 8, GAOL_GATE[1] * TILE + 12, DIRS.down);
    if (lines) lines.push({ t: 'Your sentence is served. You are free, and your things are returned.', c: C.good });
  },

  bribe(cost) {
    const chance = clamp(0.5 + S.skills.persuasion.lvl * 0.08 - S.notoriety / 200, 0.15, 0.95);
    S.gold -= cost;
    if (Math.random() < chance) {
      Game.fade(() => { this.release(null, true); UI.say(null, 'Brann counts the coin twice, unlocks the gate, and looks the other way.'); });
    } else {
      S.jail.left++;
      Memory.deed('bribe_failed_' + absDay(), 'Tried to bribe the gaoler. He kept the gold and added a day.', { once: false });
      UI.say('brann', 'I will keep this as evidence. And you can keep another day.');
    }
  },

  caughtInGaol(p, what) {
    S.jail.left += 2;
    Memory.deed('gaol_caught_' + absDay(), `Caught ${what} in Ironback Gaol. Two days added.`, { once: false });
    Script.run([[p.id, 'And where do you think you are going? Back to your cell. Two more days.']], p.id, () => Game.fade(() => Player.place('gaol', CELL[0] * TILE + 8, CELL[1] * TILE + 12, DIRS.down)));
  },

  escape() {
    const left = S.jail.left;
    S.evidence = (S.evidence || []).concat(S.jail.locker);
    S.jail = null;
    S.wanted = true; S.bounty = 300 + left * 200; S.notoriety = Math.min(100, S.notoriety + 20);
    Memory.flag('escaped'); Memory.flag('tunnel_sealed'); Memory.flag('grate_open', false);
    Memory.deed('escaped_gaol', 'Escaped from Ironback Gaol through the laundry drain.', { gossip: true, rep: { crown: -4, shadow: 2 } });
    Game.fade(() => {
      Player.place('ironback', CULVERT[0] * TILE + 8, CULVERT[1] * TILE + 12, DIRS.down);
      UI.say(null, 'You crawl out of a culvert on the mountainside into the cold air. You are free, and you are a fugitive. Every guard in the valley will be looking for you.', () => Quests.pulse());
    });
  },

  // ---- Each morning ----------------------------------------------------------
  newDay(lines) {
    if (!S.wanted) S.notoriety = Math.max(0, S.notoriety - 1);
    this.tendGardens(true);
  },

  // Marta keeps her plot planted and watered. grow advances it a day.
  tendGardens(grow) {
    const v = World.maps.village;
    (v.gardens || []).forEach(gd => {
      const crops = Object.keys(CROPS).filter(id => CROPS[id].seasons.includes(S.season) && !CROPS[id].regrow);
      for (let y = gd.y; y < gd.y + gd.h; y++) for (let x = gd.x; x < gd.x + gd.w; x++) {
        const k = key(x, y);
        if (!v.soil[k]) v.soil[k] = { w: 1, f: 0, c: null };
        const s = v.soil[k];
        s.w = 1;
        if (s.c && (!CROPS[s.c.id].seasons.includes(S.season) || s.c.dead)) s.c = null;
        if (!s.c) { const id = pick(crops.length ? crops : ['frostkale']); s.c = { id, age: CROPS[id].days - 1 - (x + y) % 3, dry: 0 }; }
        else if (grow) s.c.age++;
      }
    });
  },

  // Bram, asleep in his bed, if you are in his house at night.
  drawSleepers(g, m, items) {
    People.list.forEach(q => { if (!q.hidden && q.map === m && this.asleep(q)) items.push({ y: q.y + 1, draw: () => Font.shadow(g, 'z'.repeat(Math.floor(Render.waterT * 1.5) % 3 + 1), Math.round(q.x) + 4, Math.round(q.y) - 34, '#ffffff') }); });
    const p = this.sleeper(m);
    if (!p) return;
    const [bx, by] = m.bed;
    items.push({ y: (by + 2) * TILE, draw: () => {
      g.drawImage(Art.charFrame(p.id, p.def.look, 0, 0), 1, 0, 16, 12, bx * TILE + 5, by * TILE + 2, 16, 12);
      g.fillStyle = '#3f6fa8'; g.fillRect(bx * TILE + 3, by * TILE + 13, 20, 16); g.fillStyle = '#5a8ac0'; g.fillRect(bx * TILE + 3, by * TILE + 13, 20, 2);
      const z = Math.floor(Render.waterT * 1.5) % 3;
      Font.shadow(g, 'z'.repeat(z + 1), bx * TILE + 20, by * TILE - 4 - z * 2, '#ffffff');
    } });
  },

  // Old saves: Rusk survived.
  migrate() {
    if (S.dead.rusk && !Memory.get('rusk_back')) {
      delete S.dead.rusk;
      Memory.flag('camp_war', false); Memory.flag('camp_deal', false); Memory.flag('rusk_back');
      Memory.deed('rusk_back', 'Rusk survived your blade. Word is he crawled back to his camp, and is waiting.', { gossip: true });
      toast('Word reaches you: Rusk is alive.');
    }
  },

  standing() {
    const n = S.notoriety;
    return n >= 80 ? 'Infamous' : n >= 60 ? 'Notorious' : n >= 30 ? 'Suspected' : n >= 10 ? 'Talked about' : 'Unknown';
  },
  // Shopkeepers stop serving a notorious thief, unless they are close to you.
  refuses(id) { return S.notoriety >= 60 && ['marta', 'ivo', 'sera', 'dara', 'ansa', 'wick'].includes(id) && hearts(id) < 6; },
};

Object.assign(Actions, {
  jailbed() {
    if (!S.jail) return UI.say(null, 'A prison bunk. You have slept in worse. No, you have not.');
    UI.ask(null, 'Lie down and end the day?', [{ text: 'Sleep', fn() { Game.endDay(false); } }, { text: 'Not yet', fn() {} }]);
  },
  labor(o) {
    if (!S.jail) return UI.say(null, 'Prison work. Not yours, thankfully.');
    if (S.jail.worked >= 3) return UI.say(null, 'You have done all the work they will give you today.');
    if (S.time < 480 || S.time >= 1080) return UI.say(null, 'Work hours are 8:00 to 18:00.');
    S.jail.worked++; S.jail.tokens += 2;
    for (let i = 0; i < 6 && S.time < 1080; i++) { S.time += 10; People.tick(); }
    Game.spend(12); gainXP('strength', 8);
    Sfx.play(o.task === 'rocks' ? 'pick' : o.task === 'laundry' ? 'water' : 'hoe');
    const msg = { rocks: 'An hour breaking rocks. Your hands blister.', laundry: 'An hour scrubbing prison linens. They never come clean.', kitchen: 'An hour peeling potatoes for a hundred men.' }[o.task];
    let extra = '';
    if (S.jail.worked === 3 && S.jail.left > 1) { S.jail.left--; extra = ' Good behaviour is noted: a day comes off your sentence.'; }
    if (o.task === 'kitchen' && S.quests.esc && S.quests.esc.state === 'active' && !Inv.count('iron_bar') && Math.random() < 0.35) { Inv.add('iron_bar', 1); extra += ' A bar on the stove grate is loose. You work it free and hide it.'; }
    UI.say(null, `${msg} +2 tokens.${extra}`);
  },
  grate() {
    if (!S.jail) return UI.say(null, Memory.get('tunnel_sealed') ? 'The drain grate. Since your escape, it has been welded shut.' : 'A rusted drain grate.');
    if (Memory.get('tunnel_sealed')) return UI.say(null, 'The grate has been welded shut since the last escape.');
    if (!Memory.get('grate_open')) {
      if (!Inv.count('iron_bar')) return UI.say(null, 'An old drain grate, rusted in. You would need something to lever it up.');
      if (S.time < 1470) return UI.say(null, 'Too many eyes about. Pip said to wait until half past midnight.');
      const w = Crime.witnesses(null, true)[0];
      if (w) { Inv.remove('iron_bar', 1); return Crime.caughtInGaol(w, 'prying at the drain grate'); }
      Memory.flag('grate_open'); Sfx.play('metal');
      return UI.say(null, 'You lean on the bar. The grate shrieks, then gives. Below, a dark culvert runs out under the wall.', () => Quests.pulse());
    }
    UI.ask(null, 'Crawl into the drain and escape? Once you go, you are a fugitive.', [{ text: 'Go', fn() { Crime.escape(); } }, { text: 'Not yet', fn() {} }]);
  },
  locker() {
    if (!S.jail) return UI.say(null, 'The evidence locker. Nothing in it is yours, right now.');
    if (!S.jail.locker.length) return UI.say(null, 'Your shelf in the locker is empty.');
    const w = Crime.witnesses(null, true)[0];
    if (w) return Crime.caughtInGaol(w, 'breaking into the evidence locker');
    S.jail.locker.forEach(s => Inv.add(s.id, s.n, s.q || 0, true, !!s.s));
    S.jail.locker = [];
    Sfx.play('quest');
    UI.say(null, 'You ease the locker open and take back what is yours.');
  },
  gaolgate() {
    if (Memory.get('final_choice')) return Game.warp({ to: 'gaol', tx: 24, ty: 20, dir: DIRS.up });
    if (S.bounty > 0 || S.wanted) {
      return UI.ask(null, `Ironback Gaol. You could turn yourself in, and serve your time for the ${S.bounty}g you owe.`, [
        { text: 'Turn yourself in', fn() { S.notoriety = Math.max(0, S.notoriety - 5); Memory.deed('surrendered_' + absDay(), 'Turned yourself in at Ironback Gaol.', { once: false }); Crime.arrest(false); } },
        { text: 'Walk away', fn() {} },
      ]);
    }
    UI.say(null, 'Ironback Gaol. The gate is shut, and a face at the grille watches you until you leave.');
  },
});

Object.assign(Crime, {
  // Three pins. Stop the sweeping marker inside the gold band to set each one.
  lockpickScreen(owner, done) {
    const ui = UI;
    let pin = 0, pos = 0, dir = 1, zone = 0.3 + Math.random() * 0.4, flash = 0;
    const width = () => Math.max(0.08, 0.22 - pin * 0.04 + S.skills.stealth.lvl * 0.01);
    const speed = () => 1.1 + pin * 0.35;
    const finish = ok => { ui.pop(); done(ok); };
    return {
      lockState: () => ({ inZone: Math.abs(pos - zone) < width() / 2, centred: Math.abs(pos - zone) < width() / 5 }),
      update(dt) {
        if (Input.hit('cancel')) return finish(false);
        pos += dir * speed() * dt;
        if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; }
        flash = Math.max(0, flash - dt);
        if (Input.hit('use') || Input.hit('act') || Input.mouse.clickL) {
          ui.consumeClick();
          if (Math.abs(pos - zone) < width() / 2) {
            pin++; Sfx.play('pin'); zone = 0.15 + Math.random() * 0.7;
            if (pin >= 3) { Sfx.play('unlock'); finish(true); }
          } else {
            flash = 0.3; Sfx.play('pin_fail');
            const heard = Crime.noise();
            if (!Inv.count('master_pick') && Math.random() < 0.4) {
              Inv.remove('lockpick', 1); toast('Your lockpick snaps.');
              if (!Crime.hasPick()) return finish(false);
            }
            if (heard && Math.random() < 0.35) {
              finish(false);
              return Crime.caught(heard, { owner, items: [], gold: 0, value: 120, desc: 'Was heard breaking a lock' });
            }
          }
        }
      },
      draw(g) {
        const W = 200, H = 64, x = Math.round((ui.W - W) / 2), y = Math.round(ui.H / 2 - H / 2);
        panel(g, x, y, W, H);
        Font.draw(g, `Picking the lock. Pin ${Math.min(pin + 1, 3)} of 3`, x + 12, y + 10, C.ink);
        const bx = x + 12, bw = W - 24, by = y + 26;
        g.fillStyle = flash > 0 ? '#a83232' : '#5b2f1a'; g.fillRect(bx, by, bw, 12);
        g.fillStyle = '#e0b85a'; g.fillRect(Math.round(bx + (zone - width() / 2) * bw), by + 1, Math.round(width() * bw), 10);
        g.fillStyle = '#ffffff'; g.fillRect(Math.round(bx + pos * bw) - 1, by - 2, 3, 16);
        Font.draw(g, `Press C or E in the gold. Lockpicks: ${Inv.count('master_pick') ? 'master' : Inv.count('lockpick')}`, x + 12, y + 44, C.soft);
      },
    };
  },
});
