'use strict';
// The Pit: an endless wave arena. Your own things are set aside on the way in
// and handed back untouched on the way out, along with whatever you earned.

const PIT_DOOR = [49, 23];

const Arena = {
  active: false, wave: 0, state: 'idle', timer: 0, queue: [], kills: 0, bosses: 0, mods: null, buffs: {}, saved: null, spawnT: 0,

  fresh() { return { maxHP: 0, hpMul: 1, dmg: 1, atk: 1, speed: 1, stam: 0, crit: 0, lifesteal: 0, regen: 0, armor: 0, dodge: 1, thorns: 0, burn: 0, slow: 0, wave: 0, berserk: false, kb: 1 }; },
  reset() { this.active = false; this.state = 'idle'; this.queue = []; this.buffs = {}; this.saved = null; },
  buff(id) { return this.active && (this.buffs[id] || 0) > 0; },

  // ---- Numbers the rest of combat reads -------------------------------------------
  mul(kind) {
    if (!this.active) return 1;
    const m = this.mods;
    if (kind === 'dmg') {
      let d = m.dmg * (this.buff('fury') ? 1.5 : 1);
      if (m.berserk) d *= 1 + 0.6 * (1 - clamp(S.hp / Combat.maxHP(), 0, 1));
      return d;
    }
    if (kind === 'atk') return m.atk;
    if (kind === 'speed') return m.speed * (this.buff('swift') ? 1.4 : 1);
    if (kind === 'taken') return (1 - m.armor) * (this.buff('iron') ? 0.5 : 1);
    if (kind === 'dodge') return m.dodge;
    if (kind === 'kb') return m.kb;
    return 1;
  },
  hpBonus() { return this.active ? this.mods.maxHP : 0; },
  hpMul() { return this.active ? this.mods.hpMul : 1; },
  stamBonus() { return this.active ? this.mods.stam : 0; },

  // Crits on the way in; lifesteal, burning, slowing and lightning on the way out.
  hitIn(f, dmg, w) {
    const crit = (w && w.crit || 0) + this.mods.crit;
    if (Math.random() < crit) { FX.text(f.x, f.y - 40, 'CRIT', '#ffe08a'); VFX.ring(f.x, f.y - 10, 18, '#ffe08a', 0.25); VFX.burst('star', f.x, f.y - 12, 6, 50); return dmg * 2; }
    return dmg;
  },
  hitOut(f, dmg, w) {
    const m = this.mods;
    const steal = (w && w.lifesteal || 0) + m.lifesteal;
    if (steal) S.hp = Math.min(Combat.maxHP(), S.hp + dmg * steal);
    if ((w && w.burn) || Math.random() < m.burn) f.burnT = Math.max(f.burnT || 0, (w && w.burn) || 3);
    if ((w && w.slow) || Math.random() < m.slow) f.slowT = Math.max(f.slowT || 0, (w && w.slow) || 2);
    if (steal && Math.random() < 0.5) VFX.emit('heal', Player.x + (Math.random() - 0.5) * 10, Player.y - 20, { color: '#ff6080' });
    if (w && w.stun && f.hp > 0) { f.stunT = w.stun; f.stun = Math.max(f.stun, w.stun); f.state = f.state === 'windup' ? 'chase' : f.state; }
    if (w && w.chain) {
      const others = Foes.list.filter(o => o !== f && o.hp > 0 && Math.hypot(o.x - f.x, o.y - f.y) < 70).slice(0, w.chain);
      others.forEach(o => { VFX.zap(f.x, f.y - 10, o.x, o.y - 10); VFX.burst('spark', o.x, o.y - 10, 6, 50); Foes.damage(o, dmg * 0.5, 0, 40, 1); });
    }
  },
  onHurt(dmg) {
    if (!this.mods.thorns) return;
    const f = Foes.list.filter(o => Math.hypot(o.x - Player.x, o.y - Player.y) < 40).sort((a, b) => Math.hypot(a.x - Player.x, a.y - Player.y) - Math.hypot(b.x - Player.x, b.y - Player.y))[0];
    if (f) Foes.damage(f, dmg * this.mods.thorns, 0, 20, 1);
  },

  // ---- In and out ---------------------------------------------------------------------
  lobby() {
    const best = S.arena && S.arena.best ? `Your best: wave ${S.arena.best}.` : 'You have never fought here.';
    UI.ask(null, `The Pit. Rusk's people run it. You fight with what they hand you; your own things wait here, safe. Waves never end, and every tenth one brings something terrible. ${best}`, [
      { text: 'Enter the Pit', fn: () => this.enter() },
      { text: 'Not today', fn() {} },
    ]);
  },

  enter() {
    this.saved = { inv: JSON.parse(JSON.stringify(S.inv)), sel: S.sel, hp: S.hp, stam: S.stam, energy: S.energy, riding: S.riding };
    this.active = true; this.wave = 0; this.kills = 0; this.bosses = 0; this.mods = this.fresh(); this.buffs = {}; this.queue = [];
    // The Pit lends you a copper breastplate; better pieces are won between waves.
    this.armor = { helm: { lvl: 0, dur: 0 }, chest: { lvl: 1, dur: ARMOR_TIERS[0].dur }, boots: { lvl: 0, dur: 0 } };
    S.inv = new Array(30).fill(null);
    [['pit_sword', 1], ['heal_draught', 3], ['fire_flask', 2]].forEach(([id, n]) => Inv.add(id, n, 0, true));
    S.sel = 0; S.riding = false; Combat.sneaking = false;
    Game.fade(() => {
      Player.place('arena', 17 * TILE + 8, 12 * TILE + 12, DIRS.down);
      S.hp = Combat.maxHP(); S.stam = Combat.maxStam();
      this.state = 'countdown'; this.timer = 3;
      Sfx.play('wave_start');
      Game.save();
    });
  },

  rewards() {
    const w = this.wave - (this.state === 'fight' ? 1 : 0), out = [];
    const gold = Math.floor(40 * Math.pow(Math.max(0, w), 1.35) + this.kills * 4 + this.bosses * 500);
    if (w >= 3) out.push(['salve', Math.min(10, Math.floor(w / 3))]);
    if (w >= 8) out.push(['quartz', Math.floor(w / 8)]);
    if (w >= 10) out.push(['amethyst', Math.floor(w / 10)]);
    if (w >= 15) out.push(['gold_ore', Math.floor(w / 5)]);
    if (w >= 20) out.push(['pearl', Math.floor(w / 10)]);
    if (w >= 10 && !(S.arena && S.arena.laurel)) out.push(['pit_laurel', 1]);
    if (w >= 30 && !(S.arena && S.arena.crown)) out.push(['pit_crown', 1]);
    return { waves: Math.max(0, w), gold, items: out };
  },

  // Leaving, by falling or by choice. Everything you brought in comes back.
  end(fell) {
    if (!this.active) return;
    const r = this.rewards();
    this.state = 'over';
    Game.fade(() => {
      const s = this.saved;
      S.inv = s.inv; S.sel = s.sel; S.hp = s.hp; S.stam = s.stam; S.energy = s.energy;
      this.active = false; this.buffs = {}; Foes.list = []; Foes.shots = []; Foes.hazards = []; Combat.status = {};
      S.gold += r.gold;
      r.items.forEach(([id, n]) => { const left = Inv.add(id, n, 0, true); if (left) S.storage[Storage.slotKey(id, 0)] = (S.storage[Storage.slotKey(id, 0)] || 0) + left; });
      S.arena = S.arena || { best: 0, runs: 0, kills: 0 };
      const record = r.waves > S.arena.best;
      S.arena.best = Math.max(S.arena.best, r.waves); S.arena.runs++; S.arena.kills += this.kills;
      if (r.items.some(([id]) => id === 'pit_laurel')) S.arena.laurel = true;
      if (r.items.some(([id]) => id === 'pit_crown')) S.arena.crown = true;
      Memory.deed('pit_' + absDay() + '_' + S.arena.runs, `Survived ${r.waves} wave${r.waves === 1 ? '' : 's'} in the Pit${this.bosses ? `, felling ${this.bosses} champion${this.bosses > 1 ? 's' : ''}` : ''}.`, { once: false, gossip: r.waves >= 10 });
      Player.place('greywood', PIT_DOOR[0] * TILE + 8, PIT_DOOR[1] * TILE + 12, DIRS.down);
      const lines = [
        { t: fell ? 'You fall in the sand. The crowd roars anyway.' : 'You walk out of the Pit on your own feet.', c: fell ? C.bad : C.good },
        { t: 'Waves survived', r: String(r.waves) }, { t: 'Enemies defeated', r: String(this.kills) }, { t: 'Champions felled', r: String(this.bosses) },
        { t: 'Gold earned', r: r.gold + 'g', c: C.good },
        ...r.items.map(([id, n]) => ({ t: ITEMS[id].name, r: 'x' + n, c: C.soft })),
        { t: record ? 'A new personal best!' : `Your best: wave ${S.arena.best}`, c: record ? C.good : C.soft },
        { t: 'Everything you brought in has been returned.', c: C.soft },
      ];
      UI.push(UI.summary(lines, null, 'Press E or click to continue'));
    });
  },

  // A run in progress, written into the save so closing the game never loses it. A wave cut off half-way
  // is fought again from the start; a reward not yet chosen is offered again.
  snapshot() {
    const half = this.state === 'fight', choose = this.state === 'cleared' || this.state === 'choosing';
    return { v: 1, wave: half ? Math.max(0, this.wave - 1) : this.wave, choose, kills: this.kills, bosses: this.bosses, mods: this.mods, armor: this.armor,
      inv: S.inv, sel: S.sel, hp: S.hp, saved: this.saved };
  },
  resume(p) {
    if (!p || !p.saved) return false;
    this.reset();
    this.saved = p.saved; this.active = true; this.wave = p.wave || 0; this.kills = p.kills || 0; this.bosses = p.bosses || 0;
    this.mods = Object.assign(this.fresh(), p.mods || {}); this.buffs = {}; this.queue = [];
    this.armor = p.armor || { helm: { lvl: 0, dur: 0 }, chest: { lvl: 1, dur: ARMOR_TIERS[0].dur }, boots: { lvl: 0, dur: 0 } };
    S.inv = p.inv; S.sel = p.sel || 0; S.riding = false; Combat.sneaking = false;
    Foes.list = []; Foes.shots = []; Foes.hazards = []; Combat.status = {};
    Player.place('arena', 17 * TILE + 8, 12 * TILE + 12, DIRS.down);
    S.hp = Math.max(1, Math.min(Combat.maxHP(), p.hp || Combat.maxHP())); S.stam = Combat.maxStam();
    if (p.choose) { this.state = 'cleared'; this.timer = 1.5; } else { this.state = 'countdown'; this.timer = 4; }
    toast(p.choose ? `Back in the Pit. Wave ${this.wave} is done: choose your reward.` : `Back in the Pit. Wave ${this.wave + 1} is coming.`);
    return true;
  },

  // A save made mid-run stores you as you were before you went in (the run itself is kept beside it).
  cleanState() {
    const s = JSON.parse(JSON.stringify(S)), v = this.saved;
    Object.assign(s, { inv: v.inv, sel: v.sel, hp: v.hp, stam: v.stam, energy: v.energy });
    s.player = { map: 'greywood', x: PIT_DOOR[0] * TILE + 8, y: PIT_DOOR[1] * TILE + 12, dir: DIRS.down };
    return s;
  },

  onDeath() {
    if (Inv.count('elixir_life')) {
      Inv.remove('elixir_life', 1);
      S.hp = Combat.maxHP() / 2; Combat.inv = 1.5;
      Sfx.play('revive'); FX.burst(Player.x, Player.y - 12, '#f0d070', 30);
      toast('The Elixir of Life pulls you back up!');
      return;
    }
    this.end(true);
  },

  // ---- Waves -----------------------------------------------------------------------
  startWave() {
    this.wave++;
    const n = this.wave, boss = n % 10 === 0;
    const pool = PIT_TIERS.filter(([from]) => n >= from).pop()[1];
    const count = Math.min(40, 3 + Math.floor(n * 0.7) - (boss ? 3 : 0));
    this.queue = [];
    if (boss) this.queue.push({ t: PIT_BOSSES[(n / 10 - 1) % PIT_BOSSES.length], boss: true });
    for (let i = 0; i < count; i++) this.queue.push({ t: pick(pool) });
    this.state = 'fight'; this.spawnT = 0;
    Sfx.play(boss ? 'boss_intro' : 'wave_start');
    UI.banner(`WAVE ${n}`);
  },

  spawnOne(e) {
    const m = Player.map, n = this.wave;
    for (let tries = 0; tries < 40; tries++) {
      const x = 3 + Math.floor(Math.random() * 28), y = 3 + Math.floor(Math.random() * 18);
      if (World.solid(m, x, y) || Math.hypot(x * TILE - Player.x, y * TILE - Player.y) < 110) continue;
      const f = Foes.spawn(e.t, x * TILE + 8, y * TILE + 12, { alert: true, arena: true });
      const cycle = e.boss ? Math.floor((n / 10 - 1) / PIT_BOSSES.length) : 0;
      const hpK = e.boss ? 0.6 + n * 0.035 + cycle * 0.5 : 1 + (n - 1) * 0.09;
      f.hp = f.max = f.def.hp * hpK;
      f.dmg = f.def.dmg * (0.85 + (n - 1) * 0.04);
      f.arena = true;
      return;
    }
  },

  update(dt) {
    if (!this.active) return;
    for (const k in this.buffs) this.buffs[k] = Math.max(0, this.buffs[k] - dt);
    if (this.mods.regen && S.hp > 0) S.hp = Math.min(Combat.maxHP(), S.hp + this.mods.regen * dt);
    if (this.buff('tonic')) S.stam = Math.min(Combat.maxStam(), S.stam + 34 * dt);
    if (this.state === 'countdown') { this.timer -= dt; if (this.timer <= 0) this.startWave(); return; }
    if (this.state === 'fight') {
      this.spawnT -= dt;
      if (this.queue.length && this.spawnT <= 0 && Foes.list.length < Math.min(10, 4 + Math.floor(this.wave / 3))) { this.spawnOne(this.queue.shift()); this.spawnT = 0.8; }
      this.unstick(dt);
      if (!this.queue.length && !Foes.list.length) { this.state = 'cleared'; this.timer = 1.2; Sfx.play('wave_clear'); }
      return;
    }
    if (this.state === 'cleared') {
      this.timer -= dt;
      if (this.timer <= 0) {
        // A breather between waves, more with Second Wind.
        S.hp = Math.min(Combat.maxHP(), S.hp + Combat.maxHP() * (0.15 + this.mods.wave));
        this.state = 'choosing';
        UI.push(this.boonScreen(this.offer()));
      }
    }
  },

  // Nothing may hide in the Pit. A foe wedged in the wall, or one that has kept
  // far from the fight too long, is pushed back onto the sand near you.
  unstick(dt) {
    const m = Player.map;
    for (const f of Foes.list) {
      const tx = Math.floor(f.x / TILE), ty = Math.floor(f.y / TILE);
      const far = !(Math.hypot(f.x - Player.x, f.y - Player.y) <= 200); // NaN counts as lost
      f.farT = far && !this.buff('phantom') ? (f.farT || 0) + dt : 0;
      if (!World.solid(m, tx, ty) && f.farT < 8) continue;
      for (let tries = 0; tries < 60; tries++) {
        const a = Math.random() * 6.28, r = 90 + Math.random() * 50;
        const x = Math.floor((Player.x + Math.cos(a) * r) / TILE), y = Math.floor((Player.y + Math.sin(a) * r) / TILE);
        if (World.solid(m, x, y)) continue;
        VFX.burst('smoke', f.x, f.y - 8, 8, 20);
        f.x = f.hx = x * TILE + 8; f.y = f.hy = y * TILE + 12; f.farT = 0; f.stun = 0; f.dashT = 0;
        VFX.burst('smoke', f.x, f.y - 8, 8, 20);
        Foes.alert(f);
        break;
      }
    }
  },

  onKill(f) {
    this.kills++;
    if (f.def.boss) { this.bosses++; Sfx.play('victory'); toast(`${f.def.name} falls!`); }
    gainXP('strength', Math.ceil(f.def.xp / 2));
  },

  // ---- Rewards between waves --------------------------------------------------------
  // Three choices. Deeper waves lean towards rarer things; champions always leave an epic.
  offer() {
    const n = this.wave, weights = { common: Math.max(10, 60 - n * 2), rare: 30, epic: 8 + n * 0.8, legendary: 1 + n * 0.3 };
    const pool = [];
    for (const id in ARENA_WEAPONS) if (id !== 'pit_sword' && !Inv.count(id)) pool.push({ kind: 'weapon', id, rarity: ITEMS[id].rarity });
    for (const id in ARENA_POTIONS) pool.push({ kind: 'potion', id, rarity: ITEMS[id].rarity });
    for (const id in TOKENS) if (!Inv.count(id)) pool.push({ kind: 'token', id, rarity: ITEMS[id].rarity });
    for (const id in BLESSINGS) pool.push({ kind: 'bless', id, rarity: BLESSINGS[id][1] });
    // A full pack only gets things that need no new slot.
    // Armour takes no pack slot: the next piece up for each part of you.
    for (const piece of ARMOR_PARTS) { const lvl = this.armor[piece].lvl; if (lvl < ARMOR_TIERS.length) pool.push({ kind: 'armor', id: piece, lvl: lvl + 1, rarity: ARMOR_TIERS[lvl].rarity }); }
    if (!S.inv.includes(null)) for (let i = pool.length - 1; i >= 0; i--) if (pool[i].kind !== 'bless' && pool[i].kind !== 'armor' && !Inv.count(pool[i].id)) pool.splice(i, 1);
    const picks = [], bossWave = n % 10 === 0;
    while (picks.length < 3 && pool.length) {
      const need = bossWave && picks.length === 0;
      const options = pool.filter(o => !need || o.rarity === 'epic' || o.rarity === 'legendary');
      // Armour comes up more often, elemental tokens a little less, and the wands six times as often.
      const wt = o => weights[o.rarity] * (o.kind === 'armor' ? 2.5 : o.kind === 'token' ? 0.85 : o.id === 'ember_wand' || o.id === 'frost_staff' ? 6 : 1);
      const total = options.reduce((t, o) => t + wt(o), 0);
      let r = Math.random() * total, choice = options[0];
      for (const o of options) { r -= wt(o); if (r <= 0) { choice = o; break; } }
      picks.push(choice);
      pool.splice(pool.indexOf(choice), 1);
    }
    return picks;
  },

  describe(o) {
    if (o.kind === 'bless') { const [name, rarity, desc] = BLESSINGS[o.id]; return { name, rarity, desc, tag: 'Blessing' }; }
    if (o.kind === 'armor') return Armor.describe(o.id, o.lvl);
    const it = ITEMS[o.id], amount = o.kind !== 'potion' ? 1 : it.rarity === 'common' ? 3 : it.rarity === 'rare' ? 2 : 1;
    return { name: (amount > 1 ? amount + ' x ' : '') + it.name, rarity: it.rarity, desc: it.desc.replace(' Only usable in the Pit.', '').replace(' Only found in the Pit.', ''), tag: o.kind === 'weapon' ? 'Weapon' : o.kind === 'token' ? 'Token' : 'Potion', icon: o.id, amount };
  },

  take(o) {
    if (o.kind === 'bless') { BLESSINGS[o.id][3](this.mods); S.hp = Math.min(S.hp, Combat.maxHP()); this.taken = BLESSINGS[o.id][0]; }
    else if (o.kind === 'armor') { const was = Combat.maxHP(); this.armor[o.id] = { lvl: o.lvl, dur: ARMOR_TIERS[o.lvl - 1].dur }; S.hp = Math.min(Combat.maxHP(), S.hp + Combat.maxHP() - was); }
    else { const d = this.describe(o); Inv.add(o.id, d.amount, 0, true); }
    Sfx.play('heal');
    this.state = 'countdown'; this.timer = 3;
    Game.save();
  },

  // ---- Potions ---------------------------------------------------------------------
  usePotion(slot) {
    const id = slot.id, max = Combat.maxHP();
    const throwIt = (colour, fx) => {
      const a = Math.atan2(DY[Player.dir], DX[Player.dir]);
      Foes.shots.push({ x: Player.x, y: Player.y - 10, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, life: 0.45, mine: true, dmg: 0, kb: 0, aoe: 44, potion: fx, color: colour, burst: true, kind: 'flask', icon: id });
    };
    Inv.remove(id, 1);
    switch (id) {
      case 'heal_draught': S.hp = Math.min(max, S.hp + max * 0.4); Combat.status = {}; VFX.burst('heal', Player.x, Player.y - 12, 10, 30); break;
      case 'heal_greater': S.hp = max; Combat.status = {}; VFX.burst('heal', Player.x, Player.y - 12, 16, 40); break;
      case 'stamina_tonic': S.stam = Combat.maxStam(); this.buffs.tonic = 20; break;
      case 'fury_potion': this.buffs.fury = 15; break;
      case 'swift_potion': this.buffs.swift = 15; break;
      case 'iron_potion': this.buffs.iron = 15; break;
      case 'phantom_potion': this.buffs.phantom = 6; Foes.list.forEach(f => { f.state = 'idle'; f.aware = 0; }); break;
      case 'fire_flask': throwIt('#ff8040', 'fire'); break;
      case 'frost_flask': throwIt('#9ad8ff', 'frost'); break;
      case 'thunder_flask': throwIt('#f7e26b', 'thunder'); break;
      case 'elixir_life': Inv.add(id, 1, 0, true); toast('Keep it in your pack. It works on its own.'); return;
      case 'armor_kit': Armor.mendAll(this.armor); toast('Your armour is as good as new.'); Sfx.play('metal'); break;
    }
    Sfx.play('drink');
    FX.burst(Player.x, Player.y - 12, ITEMS[id].icon[1], 10);
  },

  // A thrown flask or an exploding bolt bursts here.
  explode(s) {
    const r = s.aoe;
    VFX.explosion(s.x, s.y, r, s.potion || (s.w && s.w.burn ? 'fire' : s.w && s.w.slow ? 'frost' : 'blast'));
    Sfx.play(s.potion === 'thunder' ? 'thunder' : s.potion === 'frost' || (s.w && s.w.slow) ? 'frost' : s.potion === 'fire' || (s.w && s.w.burn) ? 'fire' : 'boom');
    Foes.list.filter(f => Math.hypot(f.x - s.x, f.y - 8 - s.y) < r).forEach(f => {
      if (s.potion === 'fire') { f.burnT = 4; Foes.damage(f, 15 * this.mul('dmg'), 0, 60, 1); }
      else if (s.potion === 'frost') { f.slowT = 5; Foes.damage(f, 6, 0, 30, 1); }
      else if (s.potion === 'thunder') { f.stun = 1.5; f.stunT = 1.5; Foes.damage(f, 30 * this.mul('dmg'), 0, 80, 1); }
      else Foes.damage(f, s.dmg, Math.atan2(f.y - s.y, f.x - s.x), s.kb, 1, s.w);
    });
  },

  // ---- Screens ---------------------------------------------------------------------
  boonScreen(choices) {
    const ui = UI, cards = choices.map(o => Object.assign({ o }, this.describe(o)));
    let sel = 0;
    const choose = i => { ui.pop(); this.take(cards[i].o); };
    return {
      noHud: false,
      update() {
        for (let i = 0; i < cards.length; i++) if (Input.hits.has('Digit' + (i + 1))) return choose(i);
        if (Input.hit('left')) { sel = (sel + cards.length - 1) % cards.length; Sfx.play('click'); }
        if (Input.hit('right')) { sel = (sel + 1) % cards.length; Sfx.play('click'); }
        if (Input.hit('confirm')) return choose(sel);
      },
      draw(g) {
        const W = ui.W, H = ui.H, cw = Math.min(140, Math.floor((W - 40) / 3)), ch = 132, top = Math.round(H / 2 - ch / 2 - 6);
        g.fillStyle = '#14100ccc'; g.fillRect(0, 0, W, H);
        Font.shadow(g, `WAVE ${Arena.wave} CLEARED`, Math.round(W / 2 - Font.width(`WAVE ${Arena.wave} CLEARED`)), top - 34, '#ffe08a', '#2a1a10', 2);
        Font.shadow(g, 'Choose one. Keys 1-3, arrows, or click.', Math.round(W / 2 - Font.width('Choose one. Keys 1-3, arrows, or click.') / 2), top - 14, '#fff4d0');
        cards.forEach((c, i) => {
          const x = Math.round(W / 2 - (cw * 3 + 16) / 2 + i * (cw + 8)), y = top, rar = RARITY[c.rarity];
          if (ui.hit(x, y, cw, ch) && Input.mouse.moved) sel = i;
          panel(g, x, y, cw, ch);
          g.fillStyle = rar.colour; g.fillRect(x + 4, y + 4, cw - 8, 3);
          if (i === sel) { g.strokeStyle = '#ffe08a'; g.lineWidth = 2; g.strokeRect(x - 1, y - 1, cw + 2, ch + 2); }
          if (c.icon || c.img) { inset(g, x + 10, y + 12, 36, 36, false); g.drawImage(c.img || Art.icon(c.icon), x + 12, y + 14, 32, 32); }
          else { g.fillStyle = rar.colour; g.fillRect(x + 18, y + 18, 20, 24); g.fillStyle = '#fff4d0'; g.fillRect(x + 26, y + 22, 4, 16); g.fillRect(x + 22, y + 26, 12, 4); }
          Font.draw(g, `${i + 1}`, x + cw - 14, y + 12, C.soft);
          Font.draw(g, c.tag, x + 52, y + 16, C.soft);
          Font.draw(g, rar.label, x + 52, y + 28, rar.colour);
          let ty = y + 54;
          Font.wrap(c.name, cw - 20).forEach(l => { Font.draw(g, l, x + 10, ty, C.ink); ty += 10; });
          ty += 3;
          Font.wrap(c.desc, cw - 20).forEach(l => { if (ty < y + ch - 10) Font.draw(g, l, x + 10, ty, C.soft); ty += 10; });
          if (ui.click(x, y, cw, ch)) return choose(i);
        });
        if (ui.button(g, 'Leave the Pit with your winnings', Math.round(W / 2 - 90), top + ch + 10, 180, 16)) { ui.pop(); Arena.end(false); }
      },
    };
  },

  hud(g) {
    if (!this.active) return;
    const W = UI.W;
    const left = this.queue.length + Foes.list.length;
    const head = this.state === 'fight' ? `WAVE ${this.wave}   ${left} left` : this.state === 'countdown' ? `WAVE ${this.wave + 1} IN ${Math.ceil(this.timer)}` : `WAVE ${this.wave} CLEARED`;
    Font.shadow(g, head, Math.round(W / 2 - Font.width(head) / 2), 26, '#ffe08a');
    Font.shadow(g, `Kills ${this.kills}`, Math.round(W / 2 - Font.width(`Kills ${this.kills}`) / 2), 37, '#fff4d0');
    // Red arrows at the screen's edge point to any foe you cannot see.
    if (this.state === 'fight') {
      const H = UI.H, cx = Render.cam.x, cy = Render.cam.y, pulse = 0.6 + Math.sin(performance.now() / 150) * 0.4;
      for (const f of Foes.list) {
        const sx = f.x - cx, sy = f.y - 10 - cy;
        if (sx > 4 && sx < W - 4 && sy > 4 && sy < H - 4) continue;
        // Kept inside a box clear of the clock, the bars and the toolbar.
        const L = 14, R = W - 44, T = 50, B = H - 48, ox = (L + R) / 2, oy = (T + B) / 2, dx = sx - ox, dy = sy - oy;
        const k = Math.min((R - L) / 2 / Math.abs(dx || 1e-6), (B - T) / 2 / Math.abs(dy || 1e-6));
        const ax = ox + dx * k, ay = oy + dy * k, a = Math.atan2(dy, dx);
        g.save(); g.translate(Math.round(ax), Math.round(ay)); g.rotate(a);
        g.globalAlpha = pulse; g.fillStyle = f.def.boss ? '#ffd040' : '#ff5040';
        g.beginPath(); g.moveTo(7, 0); g.lineTo(-5, -5); g.lineTo(-2, 0); g.lineTo(-5, 5); g.closePath(); g.fill();
        g.strokeStyle = '#2a1010'; g.lineWidth = 1; g.stroke();
        g.restore();
      }
    }
    const names = { fury: 'Fury', swift: 'Swift', iron: 'Ironskin', phantom: 'Phantom', tonic: 'Tonic' };
    let y = 60;
    for (const k in this.buffs) if (this.buffs[k] > 0) { Font.shadow(g, `${names[k]} ${Math.ceil(this.buffs[k])}s`, 6, y, '#b8f0b8'); y += 10; }
    if (Inv.count('elixir_life')) Font.shadow(g, 'Elixir of Life ready', 6, y, '#f0d070');
  },
};

// ---- The ring itself, and the way in from Greywood ----------------------------------
Object.assign(OBJDEF, { crowd: { flat: 1 } });
(() => {
  const { mk, P, STATIC, ICONS, house_defs } = Art;
  STATIC.crowd = () => mk(16, 16, g => {
    const r = mulberry(5), cols = ['#b23a3a', '#3f6fa8', '#4f9642', '#e8b53c', '#7c4fb0', '#e8e0d0'];
    for (let i = 0; i < 3; i++) { const x = 1 + i * 5; P(g, '#d8a880', x + 1, 3 + (i % 2), 3, 3); P(g, cols[Math.floor(r() * 6)], x, 6 + (i % 2), 5, 7); }
  });
  house_defs.pit = { tw: 4, wallH: 30, roofH: 12, slope: 0, stone: true, wall: ['#7a7468', '#948e80', '#5e584c'], roof: ['#5e584c', '#7a7468', '#44403a'], deco(g, x0, wy, W, H) {
    P(g, '#2a1e14', x0 + 18, H - 22, 28, 22); P(g, '#b23a3a', x0 + 4, wy - 4, 12, 18); P(g, '#b23a3a', x0 + 48, wy - 4, 12, 18);
    P(g, '#5f4128', x0 + 16, wy + 2, 32, 9); Font.center(g, 'THE PIT', x0 + 32, wy + 3, '#fff2c8');
  } };
  Object.assign(ICONS, {
    spear: (g, a = '#c4ccd8', b = '#8a92a0') => { P(g, '#7a5535', 3, 12, 2, 2); for (let i = 0; i < 9; i++) P(g, '#7a5535', 4 + i, 11 - i, 2, 2); P(g, a, 12, 1, 3, 4); P(g, b, 12, 3, 2, 2); },
    hammer: g => { P(g, '#7a5535', 7, 6, 2, 9); P(g, '#55555f', 2, 1, 12, 6); P(g, '#787884', 2, 1, 12, 2); P(g, '#3c3c46', 2, 6, 12, 1); },
    flail: g => { P(g, '#7a5535', 2, 10, 2, 5); P(g, '#55555f', 4, 8, 2, 2); P(g, '#55555f', 6, 6, 2, 2); P(g, '#55555f', 8, 3, 6, 6); P(g, '#787884', 9, 4, 2, 2); P(g, '#2a2a32', 7, 2, 1, 1); P(g, '#2a2a32', 14, 5, 1, 1); P(g, '#2a2a32', 11, 9, 1, 1); },
    ashscythe: g => { P(g, '#3a2a1e', 9, 3, 2, 12); P(g, '#5a5048', 2, 2, 9, 2); P(g, '#8a8078', 1, 3, 3, 3); P(g, '#c43030', 4, 2, 4, 1); },
    wand: (g, a, b) => { for (let i = 0; i < 8; i++) P(g, '#7a5535', 3 + i, 13 - i, 2, 2); P(g, a, 10, 2, 5, 5); P(g, b, 12, 4, 3, 3); P(g, '#ffffff', 11, 3, 1, 1); },
    crossbow: g => { P(g, '#7a5535', 3, 7, 11, 2); P(g, '#55555f', 10, 2, 2, 12); P(g, '#efe2c8', 11, 2, 1, 12); P(g, '#b4bcc8', 13, 7, 2, 2); },
    potion: (g, a, b) => { P(g, '#7a5535', 6, 1, 4, 2); P(g, '#c8d0dc', 7, 3, 2, 2); P(g, '#c8d0dc', 3, 5, 10, 9); P(g, a, 4, 7, 8, 6); P(g, '#ffffff99', 5, 6, 2, 3); P(g, b, 3, 13, 10, 1); },
    laurel: g => { for (let i = 0; i < 6; i++) { P(g, '#4f9642', 2 + i, 9 - Math.abs(i - 2), 2, 2); P(g, '#4f9642', 13 - i, 9 - Math.abs(i - 2), 2, 2); } P(g, '#74b84d', 4, 4, 2, 2); P(g, '#74b84d', 10, 4, 2, 2); P(g, '#e0b85a', 7, 12, 2, 2); },
  });
})();

const worldBuild = World.build.bind(World);
World.build = function () {
  worldBuild();
  const m = this.newMap('arena', 'The Pit', 34, 24, T.ROCK, { indoor: true });
  for (let y = 0; y < 24; y++) for (let x = 0; x < 34; x++) {
    const dx = (x - 16.5) / 15, dy = (y - 12) / 10;
    if (dx * dx + dy * dy < 1) this.set(m, x, y, T.S);
  }
  for (let y = 0; y < 24; y++) for (let x = 0; x < 34; x++) {
    if (this.g(m, x, y) !== T.ROCK) continue;
    const nearFloor = [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([a, b]) => this.g(m, x + a, y + b) === T.S);
    if (nearFloor && (x + y) % 3 !== 0) this.add(m, 'crowd', x, y);
  }
  [[6, 3], [27, 3], [3, 12], [30, 12], [8, 21], [25, 21]].forEach(([x, y]) => { if (this.g(m, x, y) === T.ROCK && !this.at(m, x, y)) this.add(m, 'torch', x, y); });
  this.addBuilding(this.maps.greywood, 'pit', 48, 21, 4, 2, { act: 'arena' });
};
Actions.arena = () => Arena.lobby();
MAP_LABELS.pit = 'The Pit';
