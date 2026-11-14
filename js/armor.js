'use strict';
// Armour: a helm, a breastplate and boots. Ivo forges them from copper, iron, gold and
// amethyst, each tier tougher than the last. Armour adds health and takes a share off
// every hit, but every hit also wears it down. Worn-out armour never breaks or vanishes;
// it just stops protecting you until Ivo mends it, for a fee and a little ore.
// In the Pit you wear borrowed armour instead, won between waves.

const ARMOR_PARTS = ['helm', 'chest', 'boots'];
const ARMOR_TIERS = [
  { name: 'Copper', ore: 'copper', rarity: 'common', dur: 80, fee: 60, oreMax: 3 },
  { name: 'Iron', ore: 'iron', rarity: 'rare', dur: 120, fee: 150, oreMax: 3 },
  { name: 'Gold', ore: 'gold_ore', rarity: 'epic', dur: 170, fee: 350, oreMax: 2 },
  { name: 'Amethyst', ore: 'amethyst', rarity: 'legendary', dur: 240, fee: 700, oreMax: 2 },
];
// hp: extra health, dr: share of damage taken away, cost: [gold, ore] per tier.
const ARMOR_PIECES = {
  helm: { name: 'Helm', hp: [8, 15, 24, 35], dr: [0.03, 0.05, 0.07, 0.09], cost: [[250, { copper: 4 }], [600, { iron: 4 }], [1500, { gold_ore: 4 }], [3500, { amethyst: 3, gold_ore: 2 }]] },
  chest: { name: 'Breastplate', hp: [15, 28, 42, 60], dr: [0.05, 0.08, 0.11, 0.14], cost: [[400, { copper: 7 }], [1000, { iron: 7 }], [2500, { gold_ore: 6 }], [6000, { amethyst: 5, gold_ore: 3 }]] },
  boots: { name: 'Boots', hp: [7, 12, 19, 28], dr: [0.02, 0.04, 0.06, 0.07], cost: [[250, { copper: 4 }], [600, { iron: 4 }], [1500, { gold_ore: 4 }], [3500, { amethyst: 3, gold_ore: 2 }]] },
};
// Each piece does one small extra thing, growing with its tier.
const ARMOR_EFFECTS = {
  helm: { key: 'magic', vals: [0.04, 0.06, 0.08, 0.1], text: v => `${Math.round(v * 100)}% less damage from magic`, short: v => `-${Math.round(v * 100)}% magic damage` },
  chest: { key: 'steady', vals: [0.1, 0.15, 0.2, 0.25], text: v => `${Math.round(v * 100)}% less knockback`, short: v => `-${Math.round(v * 100)}% knockback` },
  boots: { key: 'speed', vals: [0.02, 0.03, 0.04, 0.05], text: v => `+${Math.round(v * 100)}% walking speed`, short: v => `+${Math.round(v * 100)}% walk speed` },
};
// And each metal adds a small perk of its own, per piece made of it.
const ARMOR_PERKS = [
  'Copper: poison wears off 15% sooner.',
  'Iron: this piece wears 25% slower.',
  'Gold: enemies drop 5% more gold.',
  'Amethyst: slowly mends your health (1 every 5 seconds).',
];
const ARMOR_PERK_SHORT = ['poison fades sooner', 'wears slower', '+5% gold from foes', 'slowly mends you'];
// Shots that count as magic for a helm's protection.
const MAGIC_SHOTS = { hex: 1, fireball: 1, frost: 1, dust: 1 };

const IVO_ARMOR_LINES = [
  'Copper plate. It will turn a knife, if not a bear.',
  'Iron. Now you can stand in front of something and live.',
  'Gold over steel. You will shine when they hit you.',
  'Amethyst set into the plates. Nothing in this valley has ever worn better.',
];

const Armor = {
  // The armour you are wearing right now: your own, or the Pit's.
  set() { return Arena.active && Arena.armor ? Arena.armor : (typeof S !== 'undefined' && S && S.armor) || null; },
  name(part, lvl) { return `${ARMOR_TIERS[lvl - 1].name} ${ARMOR_PIECES[part].name}`; },
  max(lvl) { return ARMOR_TIERS[lvl - 1].dur; },
  working(p) { return !!(p && p.lvl > 0 && p.dur > 0); },
  stat(kind) {
    const s = this.set();
    if (!s) return 0;
    return ARMOR_PARTS.reduce((t, k) => t + (this.working(s[k]) ? ARMOR_PIECES[k][kind][s[k].lvl - 1] : 0), 0);
  },
  hp() { return this.stat('hp'); },
  dr() { return Math.min(0.6, this.stat('dr')); },
  // The small extras: one per piece, one per metal.
  effect(key) { const s = this.set(); if (!s) return 0; return ARMOR_PARTS.reduce((t, k) => t + (ARMOR_EFFECTS[k].key === key && this.working(s[k]) ? ARMOR_EFFECTS[k].vals[s[k].lvl - 1] : 0), 0); },
  count(lvl) { const s = this.set(); return s ? ARMOR_PARTS.filter(k => this.working(s[k]) && s[k].lvl === lvl).length : 0; },
  speed() { return this.effect('speed'); },
  magicRes() { return this.effect('magic'); },
  steady() { return this.effect('steady'); },
  goldBonus() { return 0.05 * this.count(3); },
  effectText(part, lvl) { return ARMOR_EFFECTS[part].text(ARMOR_EFFECTS[part].vals[lvl - 1]); },

  // Every hit you take dents something: the breastplate always, the helm and boots often.
  wear(dmg) {
    const s = this.set();
    if (!s) return;
    const n = dmg >= 25 ? 2 : 1;
    for (const k of ARMOR_PARTS) {
      const p = s[k];
      if (!this.working(p) || (k !== 'chest' && Math.random() < 0.4)) continue;
      if (p.lvl === 2 && Math.random() < 0.25) continue;
      const max = this.max(p.lvl), before = p.dur / max;
      p.dur = Math.max(0, p.dur - n);
      if (p.dur === 0) { toast(`Your ${this.name(k, p.lvl)} is worn out. It no longer protects you.`); Sfx.play('metal'); }
      else if (before > 0.25 && p.dur / max <= 0.25) toast(`Your ${this.name(k, p.lvl)} is badly worn.${Arena.active ? '' : ' Ivo can mend it.'}`);
    }
    S.hp = Math.min(S.hp, Combat.maxHP());
  },

  repairCost(p) {
    const t = ARMOR_TIERS[p.lvl - 1], miss = 1 - p.dur / t.dur;
    return { gold: Math.max(10, Math.round(t.fee * miss)), needs: { [t.ore]: Math.max(1, Math.ceil(t.oreMax * miss)) }, miss };
  },
  mend(p) { if (p && p.lvl) p.dur = this.max(p.lvl); },
  mendAll(set) { ARMOR_PARTS.forEach(k => this.mend(set[k])); },
  // Changing armour changes your health by the same amount.
  change(fn) { const was = Combat.maxHP(); fn(); S.hp = clamp(S.hp + Combat.maxHP() - was, 1, Combat.maxHP()); },

  describe(part, lvl) {
    const P = ARMOR_PIECES[part];
    return { name: this.name(part, lvl), rarity: ARMOR_TIERS[lvl - 1].rarity, tag: 'Armour', img: this.icon(part, lvl),
      desc: `+${P.hp[lvl - 1]} health, ${Math.round(P.dr[lvl - 1] * 100)}% less damage, ${this.effectText(part, lvl)}. ${ARMOR_PERKS[lvl - 1]}` };
  },

  // ---- How it looks --------------------------------------------------------------
  icon(part, lvl) {
    return Art.memo(`armor${part}${lvl}`, () => Art.outlined(Art.mk(16, 16, g => {
      const [m, d, l] = lvl ? Art.METALS[lvl] : ['#5a5048', '#3a332c', '#6a6058'], P = Art.P;
      if (part === 'helm') { P(g, m, 4, 4, 8, 7); P(g, l, 5, 4, 4, 1); P(g, d, 3, 10, 10, 2); P(g, '#2a1a10', 5, 7, 6, 1); P(g, lvl === 4 ? '#f0d070' : '#b23a3a', 7, 1, 2, 3); }
      else if (part === 'chest') { P(g, m, 3, 3, 10, 10); P(g, d, 1, 3, 3, 4); P(g, d, 12, 3, 3, 4); P(g, '#2a1a10', 6, 3, 4, 2); P(g, l, 4, 5, 2, 6); P(g, d, 3, 12, 10, 2); P(g, d, 8, 6, 1, 5); }
      else { P(g, m, 2, 4, 4, 8); P(g, m, 2, 11, 6, 3); P(g, m, 9, 4, 4, 8); P(g, m, 9, 11, 6, 3); P(g, l, 3, 5, 1, 4); P(g, l, 10, 5, 1, 4); P(g, d, 2, 13, 6, 1); P(g, d, 9, 13, 6, 1); }
    })));
  },
  // Tam wears it: a helm in place of the straw hat, plate over the shirt, metal boots.
  look(s) {
    const L = Object.assign({}, PLAYER_LOOK);
    const metal = lvl => Art.METALS[lvl];
    if (s.helm.lvl) { const [m, d, l] = metal(s.helm.lvl); Object.assign(L, { hat: 'helm', hatC: m, hatD: d, hatL: l, hatGuard: true, plume: s.helm.lvl === 4 ? '#f0d070' : '#b23a3a' }); }
    if (s.chest.lvl) { const [m, d] = metal(s.chest.lvl); Object.assign(L, { shirt: m, shirtD: d, overalls: null, belt: '#4a2f1d', plate: metal(s.chest.lvl) }); }
    if (s.boots.lvl) { L.shoes = metal(s.boots.lvl)[1]; L.greaves = metal(s.boots.lvl); }
    return L;
  },
  frame(dir, f) {
    const s = this.set(), key = s ? ARMOR_PARTS.map(k => (s[k] ? s[k].lvl : 0)).join('') : '000';
    if (key === '000') return Art.charFrame('tam', PLAYER_LOOK, dir, f);
    return Art.charFrame('tam_a' + key, this.look(s), dir, f);
  },

  // ---- Ivo's side of it ---------------------------------------------------------------
  costText(needs) { return Object.entries(needs).map(([k, v]) => `${v} ${ITEMS[k].name}`).join(', '); },
  forgeMenu(p, back) {
    const s = S.armor, opts = [];
    for (const k of ARMOR_PARTS) {
      const cur = s[k], next = cur.lvl + 1;
      if (next <= ARMOR_TIERS.length && (next < 2 || Memory.get('forge_iron'))) {
        const [gold, needs] = ARMOR_PIECES[k].cost[next - 1], P = ARMOR_PIECES[k];
        opts.push({
          text: `${cur.lvl ? 'Upgrade to' : 'Forge'} ${this.name(k, next)}: ${gold}g + ${this.costText(needs)}. +${P.hp[next - 1]} health, ${Math.round(P.dr[next - 1] * 100)}% less damage.`,
          locked: S.gold < gold || !Inv.has(needs),
          fn: () => {
            S.gold -= gold; Inv.takeAll(needs);
            this.change(() => { s[k] = { lvl: next, dur: this.max(next) }; });
            Sfx.play('level'); toast(`Forged: ${this.name(k, next)}!`);
            Memory.deed(`armor_${k}_${next}`, `Had Ivo forge a ${this.name(k, next)}.`);
            UI.say(p.id, IVO_ARMOR_LINES[next - 1], () => this.forgeMenu(p, back));
          },
        });
      }
      if (cur.lvl && cur.dur < this.max(cur.lvl)) {
        const c = this.repairCost(cur), pct = Math.round(cur.dur / this.max(cur.lvl) * 100);
        opts.push({
          text: `Mend the ${this.name(k, cur.lvl)} (${pct}%${cur.dur ? '' : ', worn out'}): ${c.gold}g + ${this.costText(c.needs)}`,
          locked: S.gold < c.gold || !Inv.has(c.needs),
          fn: () => {
            S.gold -= c.gold; Inv.takeAll(c.needs);
            this.change(() => this.mend(cur));
            Sfx.play('metal'); toast(`${this.name(k, cur.lvl)} mended.`);
            UI.say(p.id, cur.lvl >= 3 ? 'Beaten out and polished. Try not to let them hit the same place twice.' : 'Hammered flat and riveted. Good as the day I made it.', () => this.forgeMenu(p, back));
          },
        });
      }
    }
    opts.push({ text: 'Never mind', fn: back });
    const worn = ARMOR_PARTS.some(k => s[k].lvl && s[k].dur < this.max(s[k].lvl) * 0.25);
    const none = ARMOR_PARTS.every(k => !s[k].lvl);
    UI.ask(p.id, none ? 'Armour? Sensible. Copper first. Bring me better ore and I will make you better plate.'
      : worn ? 'Look at the state of that. Sit down. Let me see what I can save.' : 'What needs doing?', opts);
  },
};

// Armour takes its share off every hit, and every hit wears it.
(() => {
  const hurtBase = Combat.hurtPlayer;
  Combat.hurtPlayer = function (dmg, x, y, kb) {
    const before = S.hp;
    const magic = Combat.hitKind === 'magic' ? 1 - Armor.magicRes() : 1;
    hurtBase.call(this, dmg * (1 - Armor.dr()) * magic, x, y, (kb === undefined ? 1 : kb) * (1 - Armor.steady()));
    if (S.hp < before) Armor.wear(dmg);
  };

  // Boots quicken your step.
  const speedBase = Combat.speed;
  Combat.speed = function () { return speedBase.call(this) * (1 + Armor.speed()); };
  // Copper shrugs off poison.
  const statusBase = Combat.applyStatus;
  Combat.applyStatus = function (kind, t) { return statusBase.call(this, kind, kind === 'poison' ? t * (1 - 0.15 * Armor.count(1)) : t); };
  // Amethyst mends you, slowly.
  const tickBase = Combat.updatePlayer;
  Combat.updatePlayer = function (dt) {
    const r = tickBase.call(this, dt), n = Armor.count(4);
    if (n && S.hp > 0 && S.hp < Combat.maxHP() && !UI.busy()) S.hp = Math.min(Combat.maxHP(), S.hp + 0.2 * n * dt);
    return r;
  };

  // ---- The Gear tab: what you wear and what you carry -------------------------------------
  UI.tabGear = function (g, a) {
    const s = Armor.set(), pit = Arena.active;
    Font.draw(g, pit ? 'Armour (borrowed from the Pit)' : 'Armour', a.x, a.y, C.ink);
    ARMOR_PARTS.forEach((k, i) => {
      const p = s[k], y = a.y + 14 + i * 44;
      inset(g, a.x, y, 22, 22, false);
      g.drawImage(Armor.icon(k, p.lvl), a.x + 3, y + 3);
      if (!p.lvl) { Font.draw(g, `No ${ARMOR_PIECES[k].name.toLowerCase()}`, a.x + 28, y + 2, C.soft); Font.draw(g, pit ? 'Win one between waves.' : 'Ivo can forge one.', a.x + 28, y + 13, C.soft); return; }
      const P = ARMOR_PIECES[k], max = Armor.max(p.lvl), frac = p.dur / max;
      Font.draw(g, Armor.name(k, p.lvl), a.x + 28, y, ARMOR_TIERS[p.lvl - 1].rarity === 'legendary' ? '#b070e0' : C.ink);
      Font.draw(g, p.dur ? `+${P.hp[p.lvl - 1]} health, -${Math.round(P.dr[p.lvl - 1] * 100)}% damage` : 'Worn out: no protection', a.x + 28, y + 10, p.dur ? C.soft : C.bad);
      const bw = 100;
      g.fillStyle = '#2a1a10'; g.fillRect(a.x + 28, y + 20, bw + 2, 4);
      g.fillStyle = frac > 0.5 ? '#6ab04c' : frac > 0.25 ? '#e8c04a' : '#d4405a'; g.fillRect(a.x + 29, y + 21, Math.round(bw * frac), 2);
      Font.draw(g, `${p.dur}/${max}`, a.x + 34 + bw, y + 18, C.soft);
      Font.draw(g, `${ARMOR_EFFECTS[k].short(ARMOR_EFFECTS[k].vals[p.lvl - 1])}, ${ARMOR_PERK_SHORT[p.lvl - 1]}`, a.x + 28, y + 28, p.dur ? '#5a7a4a' : C.soft);
    });
    const ty = a.y + 14 + 3 * 44 + 2;
    Font.draw(g, `In all: +${Armor.hp()} health, ${Math.round(Armor.dr() * 100)}% less damage taken.`, a.x, ty, C.good);
    Font.draw(g, pit ? 'An Armourer\'s Kit mends it all.' : 'Every hit wears armour. Ivo mends it for a fee and some ore.', a.x, ty + 11, C.soft);
    // Tools, and what they are made of.
    const tx = a.x + Math.max(200, Math.floor(a.w * 0.58));
    Font.draw(g, 'Tools', tx, a.y, C.ink);
    Object.keys(UPGRADES).forEach((t, i) => {
      const y = a.y + 14 + i * 24, lvl = S.tools[t];
      inset(g, tx, y, 20, 20, false); g.drawImage(Art.icon(t), tx + 2, y + 2);
      Font.draw(g, Inv.nameOf(t), tx + 26, y + 2, C.ink);
      Font.draw(g, lvl < UPGRADES[t].length ? `Next: ${UPGRADES[t][lvl].name}` : 'The finest there is.', tx + 26, y + 12, C.soft);
    });
    // Weapons, and the tokens set into them.
    const ky = a.y + 14 + Object.keys(UPGRADES).length * 24 + 6, sock = Object.entries(S.socket || {}).filter(([w]) => ITEMS[w]);
    Font.draw(g, 'Tokens', tx, ky, C.ink);
    if (!sock.length) { Font.draw(g, 'Hold a token and use it', tx, ky + 12, C.soft); Font.draw(g, 'to set it into a weapon.', tx, ky + 22, C.soft); }
    sock.slice(0, 4).forEach(([w, t], i) => { g.drawImage(Art.icon(t), tx, ky + 10 + i * 14, 12, 12); Font.draw(g, `${ITEMS[w].name}: ${TOKENS[t].name}`, tx + 16, ky + 12 + i * 14, C.soft); });
  };

  // ---- A reminder on screen when something is badly worn -----------------------------
  const hudBase = UI.hud;
  UI.hud = function (g) {
    hudBase.call(this, g);
    const s = Armor.set();
    if (!s || UI.busy()) return;
    const parts = ARMOR_PARTS.filter(k => s[k].lvl && s[k].dur <= Armor.max(s[k].lvl) * 0.25);
    if (!parts.length) return;
    const out = parts.some(k => !s[k].dur);
    const blink = out && Math.floor(performance.now() / 500) % 2;
    // Just under the date, out of the way of the quest tracker.
    const text = out ? 'Armour worn out' : 'Armour badly worn', tw = Font.width(text), x = this.W - 8 - tw;
    g.drawImage(Armor.icon(parts[0], s[parts[0]].lvl), x - 18, 56);
    Font.shadow(g, text, x, 60, blink ? '#ff9080' : out ? '#d4405a' : '#e8c04a');
  };
})();
