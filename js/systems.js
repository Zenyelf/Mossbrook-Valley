'use strict';
// Game state plus the rules that read and write it: inventory, skills, memory,
// trust and the quest engine.

let S = null; // the whole saveable state
const NPCS = {};   // filled by data_npcs.js
const QUESTS = {}; // filled by data_quests.js

const SKILLS = {
  farming: 'Farming', foraging: 'Foraging', fishing: 'Fishing', mining: 'Mining',
  persuasion: 'Persuasion', stealth: 'Stealth', strength: 'Strength',
};
const XP_PER_LEVEL = [0, 60, 160, 320, 560, 900, 1350, 1950, 2700, 3600, 5000];

function newState() {
  const st = {
    gold: 500, inv: new Array(30).fill(null), sel: 0,
    day: 1, season: 0, year: 1, time: 360, weather: 'sun', tomorrow: 'sun',
    energy: 120, maxEnergy: 120, can: 40,
    tools: { hoe: 0, can: 0, axe: 0, pick: 0, scythe: 0, rod: 0 },
    armor: { helm: { lvl: 0, dur: 0 }, chest: { lvl: 0, dur: 0 }, boots: { lvl: 0, dur: 0 } },
    socket: {},
    mounts: [], mount: null,
    racing: { rides: 0, wins: 0, placed: false, openWon: false, cup: false, bets: 0, betsWon: 0 },
    skills: {}, shipped: [], npc: {}, quests: {},
    memory: { log: [], flags: {} }, rep: { town: 0, crown: 0, shadow: 0 },
    chickens: [], troughFed: false, board: null,
    player: { map: 'house', x: 9 * TILE + 8, y: 6 * TILE, dir: DIRS.down },
    notoriety: 0, bounty: 0, wanted: false, jail: null, evidence: [], loot: {}, unlocked: {}, picked: {}, downed: {}, crimes: 0,
    horse: false, riding: false, counts: {}, storage: {}, seen: {}, sprouts: {}, mail: [], ending: null, hp: 100, stam: 60, known: {}, kills: {}, dead: {}, opened: {}, slain: {}, mineMax: 0,
  };
  for (const k in SKILLS) st.skills[k] = { lvl: 0, xp: 0 };
  for (const id in NPCS) st.npc[id] = { trust: 0, talked: -1, gifted: -1, knows: [], said: [] };
  return st;
}

const absDay = (st = S) => (st.year - 1) * 112 + st.season * 28 + st.day;
const dateName = d => {
  const z = d - 1, year = Math.floor(z / 112) + 1, season = Math.floor((z % 112) / 28), day = (z % 28) + 1;
  return `${SEASONS[season]} ${day}, Y${year}`;
};
const toast = (text, icon) => { if (typeof UI !== 'undefined') UI.toast(text, icon); };

// ---- Inventory -----------------------------------------------------------
const Inv = {
  max(id) { return ['tool', 'quest', 'relic', 'weapon', 'gear'].includes(ITEMS[id].kind) && id !== 'lockpick' ? 1 : 99; },
  // Things that cannot be sold or given away.
  keep(id) { return ['tool', 'quest', 'relic', 'weapon', 'gear'].includes(ITEMS[id].kind); },
  // Returns how many could not fit.
  // Stolen goods carry a mark and never stack with honest ones.
  add(id, n = 1, q = 0, quiet, stolen) {
    const start = n, max = this.max(id);
    for (const s of S.inv) if (s && s.id === id && (s.q || 0) === q && !!s.s === !!stolen && s.n < max) {
      const put = Math.min(n, max - s.n); s.n += put; n -= put; if (!n) break;
    }
    while (n > 0) {
      const i = S.inv.indexOf(null); if (i < 0) break;
      const put = Math.min(n, max); S.inv[i] = { id, n: put, q, s: stolen ? 1 : 0 }; n -= put;
    }
    if (start - n > 0) Codex.learn(id, 'found');
    if (start - n > 0 && !quiet) toast(`+${start - n} ${(q ? qualityNames[q] + ' ' : '') + ITEMS[id].name}${stolen ? ' (stolen)' : ''}`, id);
    if (n > 0 && !quiet) toast('Inventory full!');
    return n;
  },
  count(id) { return S.inv.reduce((t, s) => t + (s && s.id === id ? s.n : 0), 0); },
  countKind(kind, minQ = 0) { return S.inv.reduce((t, s) => t + (s && ITEMS[s.id].kind === kind && (s.q || 0) >= minQ ? s.n : 0), 0); },
  has(needs) { return Object.keys(needs).every(k => this.count(k) >= needs[k]); },
  // Plainest quality goes first, so a quest never eats your gold-star crop by surprise.
  remove(id, n = 1) {
    const stacks = S.inv.map((s, i) => [s, i]).filter(([s]) => s && s.id === id).sort((a, b) => (a[0].q || 0) - (b[0].q || 0));
    for (const [s, i] of stacks) {
      const take = Math.min(n, s.n); s.n -= take; n -= take;
      if (s.n <= 0) S.inv[i] = null;
      if (!n) break;
    }
    return n === 0;
  },
  removeKind(kind, n, minQ = 0) {
    while (n > 0) {
      const s = S.inv.filter(x => x && ITEMS[x.id].kind === kind && (x.q || 0) >= minQ).sort((a, b) => (a.q || 0) - (b.q || 0))[0];
      if (!s) return false;
      const take = Math.min(n, s.n);
      s.n -= take; n -= take;
      if (s.n <= 0) S.inv[S.inv.indexOf(s)] = null;
    }
    return true;
  },
  takeAll(needs) { for (const k in needs) this.remove(k, needs[k]); },
  held() { return S.inv[S.sel]; },
  // A tool's name reflects what it has been upgraded to.
  nameOf(id) { const lvl = UPGRADES[id] ? S.tools[id] : 0; return lvl ? UPGRADES[id][lvl - 1].name : ITEMS[id].name; },
  price(slot) { return Math.floor(ITEMS[slot.id].price * qualityMult[slot.q || 0]); },
};

// ---- Skills ---------------------------------------------------------------
function gainXP(skill, n) {
  const s = S.skills[skill];
  s.xp += n;
  while (s.lvl < 10 && s.xp >= XP_PER_LEVEL[s.lvl + 1]) {
    s.lvl++;
    Sfx.play('level');
    toast(`${SKILLS[skill]} is now level ${s.lvl}!`);
    if (skill === 'foraging' || skill === 'mining') S.maxEnergy += 4;
  }
}

// ---- Permanent memory ------------------------------------------------------
// Nothing is ever removed from the log. Dialogue, quests and endings all read it.
const Memory = {
  deed(id, text, opt = {}) {
    if (opt.once !== false && this.did(id)) return;
    S.memory.log.push({ id, text, d: absDay(), gossip: !!opt.gossip, by: opt.witness || [] });
    if (opt.rep) for (const k in opt.rep) S.rep[k] += opt.rep[k];
    (opt.witness || []).forEach(n => this.tell(n, id));
  },
  did(id) { return S.memory.log.some(e => e.id === id); },
  flag(k, v = true) { S.memory.flags[k] = v; },
  get(k) { return S.memory.flags[k]; },
  tell(npc, id) { const k = S.npc[npc].knows; if (!k.includes(id)) k.push(id); },
  knows(npc, id) { return S.npc[npc].knows.includes(id); },
  // Each night one person hears each piece of gossip they had not heard yet.
  spreadGossip() {
    const ids = Object.keys(NPCS).filter(n => !NPCS[n].wanderer && !NPCS[n].minor && !NPCS[n].remote);
    S.memory.log.filter(e => e.gossip).forEach(e => {
      const unheard = ids.filter(n => !this.knows(n, e.id));
      if (unheard.length) this.tell(pick(unheard), e.id);
    });
  },
};

// ---- Trust -----------------------------------------------------------------
// Hearts run 0 to 10. Someone who holds a grudge (see grudge.js) has their own count from -10 up to +10:
// everything that would earn trust goes into it, and at +10 they forgive you.
const hearts = id => { const st = S.npc[id]; return st.grudge ? Math.floor(st.grudge.g / 100) : Math.floor(st.trust / 100); };
const Trust = {
  add(id, n) {
    const st = S.npc[id], before = hearts(id);
    if (st.grudge) {
      st.grudge.g = clamp(st.grudge.g + n, -1000, 1000);
      if (st.grudge.g >= 1000 && typeof Grudge !== 'undefined') return Grudge.forgive(id);
    } else st.trust = clamp(st.trust + n, 0, 1000);
    const after = hearts(id), sore = !!st.grudge;
    if (after > before) { Sfx.play('heart'); toast(sore ? `${NPCS[id].name} is warming to you again. (${after} hearts)` : `${NPCS[id].name} trusts you more.`); }
    if (after < before) { Sfx.play('sad'); toast(sore ? `${NPCS[id].name} is even more hurt.` : `${NPCS[id].name} trusts you less.`); }
  },
  countAtLeast(h) { return Object.keys(NPCS).filter(n => !NPCS[n].wanderer && !NPCS[n].minor && !NPCS[n].remote && hearts(n) >= h).length; },
  giftTaste(id, itemId) {
    const d = NPCS[id], kind = ITEMS[itemId].kind;
    if (d.loves.includes(itemId)) return 'love';
    if (d.likes.includes(itemId) || d.likes.includes('kind:' + kind)) return 'like';
    if (d.hates.includes(itemId) || d.hates.includes('kind:' + kind)) return 'hate';
    return 'neutral';
  },
};
const GIFT = { love: 80, like: 40, neutral: 15, hate: -40 };

// Discount or markup a shop applies once you have standing with its owner.
function priceFactor(npc) {
  const h = hearts(npc);
  let f = 1 - Math.min(h, 10) * 0.012;
  if (S.rep.town < -2) f += 0.2;
  f += (S.notoriety || 0) / 200;
  if (npc === 'marta' && Memory.get('seed_discount')) f -= 0.05;
  return f;
}

// ---- Quest engine ----------------------------------------------------------
function quest(def) { QUESTS[def.id] = def; }
const qDone = id => S.quests[id] && S.quests[id].state === 'done';

const Quests = {
  list(state) { return Object.keys(S.quests).filter(id => S.quests[id].state === state); },
  stageOf(id) { return QUESTS[id].stages[S.quests[id].stage]; },
  available(npc) {
    return Object.values(QUESTS).filter(q => q.giver === npc && !S.quests[q.id] && (!q.req || q.req()));
  },
  start(id) {
    S.quests[id] = { state: 'active', stage: 0, prog: [], start: absDay() };
    this.resetProg(id);
    if (!QUESTS[id].quiet) { Sfx.play('quest'); toast('New quest: ' + QUESTS[id].title); }
    Memory.deed('began_' + id, `Took up "${QUESTS[id].title}".`);
  },
  resetProg(id) { S.quests[id].prog = this.stageOf(id).goals.map(() => 0); },
  goalVal(id, g, i) {
    const st = S.quests[id];
    switch (g.type) {
      case 'have': return g.kind ? Inv.countKind(g.kind, g.q) : Inv.count(g.item);
      case 'flag': return Memory.get(g.flag) ? 1 : 0;
      case 'hearts': return hearts(g.item);
      case 'wait': return absDay() - st.start;
      case 'evening': return S.time >= 1080 ? 1 : 0;
      case 'goto': return st.prog[i];
      default: return Math.max(st.prog[i] || 0, this.lifetime(g));
    }
  },
  goalTarget(g) { return g.n || 1; },
  goalsDone(id) {
    return this.stageOf(id).goals.every((g, i) => this.goalVal(id, g, i) >= this.goalTarget(g));
  },
  // Every action is tallied for life. Counted goals read this tally, so it never
  // matters whether you did the thing before or after the quest asked for it.
  lifetime(g) { return (S.counts && S.counts[g.type + ':' + (g.item || '*')]) || 0; },

  event(type, item, n = 1) {
    if (!S.counts) S.counts = {};
    S.counts[type + ':*'] = (S.counts[type + ':*'] || 0) + n;
    if (item) S.counts[type + ':' + item] = (S.counts[type + ':' + item] || 0) + n;
    for (const id of this.list('active')) {
      this.stageOf(id).goals.forEach((g, i) => {
        if (g.type === type && (!g.item || g.item === item)) S.quests[id].prog[i] += n;
      });
    }
    this.pulse();
  },
  gotoCheck(mapId, tx, ty) {
    for (const id of this.list('active')) {
      this.stageOf(id).goals.forEach((g, i) => {
        if (g.type === 'goto' && g.map === mapId && S.quests[id].prog[i] < 1 && Math.abs(tx - g.x) <= (g.r || 2) && Math.abs(ty - g.y) <= (g.r || 2)) {
          S.quests[id].prog[i] = 1; Sfx.play('click'); toast('Visited: ' + g.label);
          this.pulse();
        }
      });
    }
  },
  turnInFor(npc) {
    return this.list('active').find(id => this.stageOf(id).turnin === npc && this.goalsDone(id));
  },
  waitingOn(npc) { return this.list('active').some(id => this.stageOf(id).turnin === npc); },
  // Finish the current stage: take items, play its scene, move on.
  advance(id, done) {
    const stage = this.stageOf(id);
    if (!stage.noTake) stage.goals.forEach(g => {
      if (g.type !== 'have' || g.keep) return;
      if (g.kind) Inv.removeKind(g.kind, g.n, g.q); else Inv.remove(g.item, g.n);
    });
    if (stage.gain) stage.gain.forEach(([it, n]) => Inv.add(it, n || 1));
    const next = () => {
      const st = S.quests[id];
      if (st.state !== 'active') { if (done) done(); return; } // the scene closed the quest itself
      st.stage++;
      if (st.stage >= QUESTS[id].stages.length) this.finish(id);
      else { this.resetProg(id); Sfx.play('click'); if (stage.say !== false) toast('Quest updated: ' + QUESTS[id].title); }
      this.pulse();
      if (done) done();
    };
    if (stage.done) Script.run(stage.done, QUESTS[id].giver, next); else next();
  },
  finish(id) {
    const q = QUESTS[id], r = q.reward || {};
    S.quests[id].state = 'done';
    S.notoriety = Math.max(0, (S.notoriety || 0) - 3);
    if (r.gold) { S.gold += r.gold; toast(`+${r.gold} gold`); }
    if (r.items) r.items.forEach(([it, n]) => Inv.add(it, n || 1));
    if (r.trust) for (const n in r.trust) Trust.add(n, r.trust[n]);
    if (r.rep) for (const k in r.rep) S.rep[k] += r.rep[k];
    if (r.flag) Memory.flag(r.flag);
    Sfx.play('quest_done');
    toast('Quest complete: ' + q.title);
    Memory.deed('done_' + id, q.deed || `Finished "${q.title}".`, { gossip: !!q.gossip });
    if (q.then) Script.run(q.then, q.giver);
  },
  lose(id, why) {
    if (!S.quests[id]) S.quests[id] = { state: 'lost', stage: 0, prog: [], start: absDay() };
    else S.quests[id].state = 'lost';
    S.quests[id].why = why;
    Memory.deed('lost_' + id, `Lost forever: "${QUESTS[id].title}". ${why}`);
    toast('A path has closed: ' + QUESTS[id].title);
  },
  // Starts automatic quests and completes stages that need no one to hand them to.
  pulse() {
    for (const q of Object.values(QUESTS)) {
      if (q.auto && !S.quests[q.id] && (!q.req || q.req())) this.start(q.id);
      else if (q.main && !S.quests[q.id] && q.giver && (!q.req || q.req()) && this.giverGone(q.giver)) {
        this.start(q.id);
        if (q.accept) q.accept();
        toast(`${NPCS[q.giver].name} left word for you: "${q.title}".`);
      }
    }
    if (typeof People !== 'undefined' && People.list.length) People.refresh();
    if (typeof UI === 'undefined' || UI.busy()) return;
    for (const id of this.list('active')) {
      if (!this.stageOf(id).turnin && this.goalsDone(id)) { this.advance(id); return; }
    }
  },

  giverGone(id) {
    if (typeof People === 'undefined' || !People.list.length) return false;
    const p = People.get(id);
    return People.absent(p) && !p.def.wanderer && !(S.downed && S.downed[id] === absDay()) && !(p.def.gone && id === 'thorne');
  },

  // Rebuilds the lifetime tally for saves made before it existed.
  seedCounts() {
    if (!S.counts) S.counts = {};
    const atLeast = (k, n) => { if (n > (S.counts[k] || 0)) S.counts[k] = n; };
    let kills = 0;
    for (const t in S.kills) { atLeast('kill:' + t, S.kills[t]); kills += S.kills[t]; }
    atLeast('kill:*', kills);
    let rescues = 0;
    for (const t in (S.rescued || {})) { atLeast('rescue:' + t, S.rescued[t]); rescues += S.rescued[t]; }
    atLeast('rescue:*', rescues);
    let kept = 0;
    for (const id in (S.sprouts || {})) { atLeast('sprout:' + id, S.sprouts[id].lvl); kept += S.sprouts[id].lvl; }
    atLeast('sprout:*', kept);
    let talked = 0;
    for (const id in S.npc) if (S.npc[id].talked >= 0) { atLeast('talk:' + id, 1); talked++; }
    atLeast('talk:*', talked);
    if (Memory.did('first_fish')) atLeast('catch:*', 1);
    if (Memory.did('first_harvest')) atLeast('harvest:*', 1);
    if (Memory.did('first_ship')) atLeast('ship:*', 1);
    // Anything an active stage has already counted is kept.
    for (const id of this.list('active')) this.stageOf(id).goals.forEach((g, i) => { if (g.type !== 'goto') atLeast(g.type + ':' + (g.item || '*'), S.quests[id].prog[i] || 0); });
  },

  // Where to go for the current step, and whether it can be finished without
  // the person it needs. Used by the Journal's "Stuck?" helper.
  help(id) {
    const stage = this.stageOf(id), lines = [];
    let skip = false;
    if (stage.turnin) {
      const p = People.get(stage.turnin), name = NPCS[stage.turnin].name;
      if (!this.goalsDone(id)) lines.push('Finish the steps above first, then speak to ' + name + '.');
      if (People.absent(p)) {
        if (p.def.wanderer) lines.push(name + ' only visits on the 5th, 12th, 19th and 26th of each season.');
        else if (S.downed && S.downed[p.id] === absDay()) lines.push(name + ' is recovering, and will be back tomorrow.');
        else { lines.push(name + ' cannot be reached any more.'); skip = this.goalsDone(id); }
      } else if (p.hidden) lines.push(name + ' is at home for the night. Try again in the morning.');
      else {
        const at = MapView.outdoor(p.map.id, Math.floor(p.x / TILE), Math.floor(p.y / TILE));
        lines.push(name + ' is in ' + World.maps[at.map].name.split(',')[0] + (p.map.id !== at.map ? ' (' + p.map.name + ')' : '') + '. The map (M) marks the spot.');
      }
    }
    stage.goals.forEach((g, i) => {
      if (this.goalVal(id, g, i) >= this.goalTarget(g)) return;
      if (g.type === 'have' && g.item) {
        const stored = Object.entries(S.storage).reduce((t, [k, n]) => t + (k.split(':')[0] === g.item ? n : 0), 0);
        if (stored) lines.push(`You have ${stored} ${ITEMS[g.item].name} in your home chest. Take it out and carry it.`);
      }
      if (g.type === 'goto') lines.push(g.label + ': marked in red on your map (M).');
    });
    return { lines, skip };
  },

  // Finishes a step whose person is gone for good, so the story can go on.
  skipTurnin(id) {
    const name = NPCS[this.stageOf(id).turnin].name;
    Memory.deed('skipped_' + id + '_' + S.quests[id].stage, `Carried on with "${QUESTS[id].title}" without ${name}.`, { once: false });
    Script.run([[null, `${name} cannot be found, so you piece together what they would have told you.`]], null, () => this.advance(id, () => {}));
  },

  // Daily requests from the notice board.
  rollBoard() {
    const pool = Object.keys(ITEMS).filter(id => {
      const it = ITEMS[id];
      if (it.kind === 'forage') return true;
      return it.kind === 'crop' && CROPS[id].seasons.includes(S.season);
    });
    const people = Object.keys(NPCS).filter(n => !NPCS[n].wanderer && !NPCS[n].minor && !NPCS[n].remote && !NPCS[n].outlaw);
    const item = pick(pool), n = rnd(1, 4);
    S.board = { npc: pick(people), item, n, gold: Math.floor(ITEMS[item].price * n * 1.8) + 40, taken: false, done: false, due: absDay() + 3 };
  },
};

// Plays a list of dialogue beats. A beat is a string (spoken by `who`), a
// [speaker, text] pair, {ask, opts}, {do}, or {if, then, else}.
const Script = {
  run(list, who, done) {
    const step = i => {
      if (i >= list.length) { if (done) done(); return; }
      const b = list[i], next = () => step(i + 1);
      if (typeof b === 'string') UI.say(who, b, next);
      else if (Array.isArray(b)) UI.say(b[0], b[1], next);
      else if (b.do) { b.do(); next(); }
      else if (b.if) {
        const branch = b.if() ? b.then : b.else;
        if (branch) this.run(branch, who, next); else next();
      }
      else if (b.ask) {
        const opts = b.opts.filter(o => !o.if || o.if());
        UI.ask(b.who === undefined ? who : b.who, b.ask, opts.map(o => ({
          text: o.t, locked: o.lock ? !o.lock() : false,
          fn() {
            if (o.xp) gainXP(o.xp[0], o.xp[1]);
            if (o.do) o.do();
            if (o.then) Script.run(o.then, who, next); else next();
          },
        })));
      }
    };
    step(0);
  },
};

// ---- Codex ---------------------------------------------------------------
// What the player has learned about items. Hearing a name is enough for ordinary
// things; secrets stay out of it until you are actually holding them.
const Codex = {
  matcher: null, terms: null,
  isSecret(id) { return ['quest', 'relic'].includes(ITEMS[id].kind); },

  build() {
    this.terms = new Map();
    const plurals = t => {
      if (t.endsWith('y')) return [t, t.slice(0, -1) + 'ies'];
      if (t.endsWith('o')) return [t, t + 'es', t + 's'];
      if (/(s|sh|ch|x)$/.test(t)) return [t, t + 'es'];
      return [t, t + 's'];
    };
    for (const id in ITEMS) {
      if (this.isSecret(id)) continue;
      [ITEMS[id].name, ...(ITEMS[id].heard || [])].forEach(n => plurals(n.toLowerCase()).forEach(t => { if (!this.terms.has(t)) this.terms.set(t, id); }));
    }
    const parts = [...this.terms.keys()].sort((a, b) => b.length - a.length).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    this.matcher = new RegExp('\\b(' + parts.join('|') + ')\\b', 'gi');
  },

  learn(id, how, by) {
    const k = S.known[id];
    if (k) { if (how === 'found' && !k.held) k.held = absDay(); return false; }
    S.known[id] = { how, by: by || null, d: absDay(), held: how === 'found' ? absDay() : 0 };
    return true;
  },

  // Anything said aloud or read from a sign can teach you an ordinary item's name.
  hear(text, who) {
    if (!this.matcher) this.build();
    for (const m of String(text).matchAll(this.matcher)) {
      const id = this.terms.get(m[1].toLowerCase());
      if (id && this.learn(id, who ? 'heard' : 'read', who)) toast('Added to Codex: ' + ITEMS[id].name, id);
    }
  },

  sweep() { S.inv.forEach(s => { if (s) this.learn(s.id, 'found'); }); },
};
