'use strict';
// Elemental tokens: small charged stones you set into a weapon. Each weapon holds one.
// Hold a token and use it (C) to choose the weapon; setting a new one gives the old
// one back. Every effect is a small edge, never a new weapon.
// Found on the creatures that carry each element; one is sold at the shrine; the Pit
// offers them too (those stay in the Pit).

const TOKENS = {
  token_ember: { name: 'Ember Token', color: '#ff8a30', dark: '#a03a10', price: 160, desc: 'Set into a weapon: hits sometimes set enemies burning for a moment.' },
  token_frost: { name: 'Frost Token', color: '#9ad8ff', dark: '#3a78b0', price: 160, desc: 'Set into a weapon: hits sometimes chill enemies, slowing them briefly.' },
  token_venom: { name: 'Venom Token', color: '#8ad040', dark: '#3a6a1a', price: 160, desc: 'Set into a weapon: hits sometimes poison enemies, a little damage over a few seconds.' },
  token_storm: { name: 'Storm Token', color: '#f7e26b', dark: '#a08a20', price: 200, desc: 'Set into a weapon: hits sometimes throw a spark to another enemy nearby.' },
  token_blood: { name: 'Bloodroot Token', color: '#d4405a', dark: '#701a2a', price: 200, desc: 'Set into a weapon: every hit heals you a sliver of the damage dealt.' },
  token_moon: { name: 'Moonlit Token', color: '#d8d8f8', dark: '#5a5a90', price: 300, desc: 'Set into a weapon: it hits a little harder at night and underground.' },
  token_gale: { name: 'Gale Token', color: '#c8f0d8', dark: '#4a8a6a', price: 200, desc: 'Set into a weapon: hits push enemies further, and sometimes leave them reeling.' },
};
for (const id in TOKENS) {
  const t = TOKENS[id];
  item(id, t.name, 'token', t.price, ['token', t.color, t.dark], t.desc, { rarity: id === 'token_moon' || id === 'token_storm' || id === 'token_blood' ? 'epic' : 'rare' });
}

// Where they come from: the creatures that carry each element.
[['imp', 'token_ember', 0.05], ['wraith', 'token_frost', 0.05], ['spider', 'token_venom', 0.04], ['sporeling', 'token_venom', 0.03],
  ['drowned', 'token_storm', 0.04], ['gloomling', 'token_storm', 0.03], ['shaman', 'token_blood', 0.05], ['witch', 'token_blood', 0.03],
  ['witch', 'token_moon', 0.03], ['bat', 'token_gale', 0.02], ['goblin', 'token_gale', 0.02]].forEach(([foe, id, p]) => { if (FOES[foe]) FOES[foe].drops.push([id, 1, 1, p]); });

const Tokens = {
  of(weapon) { return (S && S.socket && S.socket[weapon]) || null; },
  // Which weapon a swing's stats belong to.
  byW: new WeakMap(),
  forW(w) {
    if (!w) return null;
    if (!this.byW.has(w)) this.byW.set(w, Object.keys(ITEMS).find(k => ITEMS[k].w === w) || null);
    const id = this.byW.get(w);
    return id ? this.of(id) : null;
  },
  slash(weapon) { const t = this.of(weapon); return t ? TOKENS[t].color : null; },
  dark() { const m = Player.map; return S.time >= 1140 || S.time < 360 || (m && (m.dark || m.id === 'mine')); },

  socketMenu(slot) {
    const id = slot.id, weapons = [...new Set(S.inv.filter(s => s && ITEMS[s.id].kind === 'weapon').map(s => s.id))];
    if (!weapons.length) { toast('You have no weapon to set it into.'); Sfx.play('deny'); return; }
    UI.ask(null, `Set the ${TOKENS[id].name} into which weapon? A weapon holds one token; the old one comes back to you.`, [
      ...weapons.map(w => { const cur = this.of(w); return { text: `${ITEMS[w].name}${cur ? ` (now: ${TOKENS[cur].name})` : ''}`, locked: cur === id, fn: () => this.socket(w, id) }; }),
      { text: 'Not now', fn() {} },
    ]);
  },
  socket(weapon, id) {
    if (!S.socket) S.socket = {};
    const old = S.socket[weapon];
    Inv.remove(id, 1);
    S.socket[weapon] = id;
    if (old) { const left = Inv.add(old, 1, 0, true); if (left) S.storage[Storage.slotKey(old, 0)] = (S.storage[Storage.slotKey(old, 0)] || 0) + left; }
    Sfx.play('crystal'); VFX.burst('star', Player.x, Player.y - 14, 10, 40);
    toast(`${TOKENS[id].name} set into the ${ITEMS[weapon].name}.${old ? ` ${TOKENS[old].name} returned.` : ''}`);
    if (!ITEMS[weapon].arena) Memory.deed('token_' + weapon + id, `Set a ${TOKENS[id].name} into the ${ITEMS[weapon].name}.`);
  },
};

(() => {
  // A token in your hand is used by choosing a weapon for it.
  const useBase = Player.useHeld;
  Player.useHeld = function (fromMouse) {
    const slot = Inv.held();
    if (slot && ITEMS[slot.id].kind === 'token') return Tokens.socketMenu(slot);
    return useBase.call(this, fromMouse);
  };

  // What a token does when its weapon lands a blow.
  const damageBase = Foes.damage;
  Foes.damage = function (f, dmg, angle, kb, sneak, w) {
    const tok = Tokens.forW(w);
    if (!tok) return damageBase.call(this, f, dmg, angle, kb, sneak, w);
    if (tok === 'token_moon' && Tokens.dark()) dmg *= 1.12;
    if (tok === 'token_gale') kb = (kb || 0) * 1.2;
    const before = f.hp, r = damageBase.call(this, f, dmg, angle, kb, sneak, w), dealt = before - Math.max(0, f.hp);
    if (dealt <= 0) return r;
    const alive = f.hp > 0 && this.list.includes(f), R = Math.random();
    switch (tok) {
      case 'token_ember': if (alive && R < 0.15) { f.burnT = Math.max(f.burnT || 0, 2); VFX.burst('flame', f.x, f.y - 12, 8, 40); } break;
      case 'token_frost': if (alive && R < 0.15) { f.slowT = Math.max(f.slowT || 0, 1.5); VFX.burst('flake', f.x, f.y - 12, 8, 40); } break;
      case 'token_venom': if (alive && R < 0.2) { f.poisonT = 3; f.poisonTick = 0.5; VFX.burst('bubble', f.x, f.y - 12, 6, 30); } break;
      case 'token_storm': if (R < 0.12) {
        const o = this.list.filter(x => x !== f && x.hp > 0 && Math.hypot(x.x - f.x, x.y - f.y) < 64).sort((a, b) => Math.hypot(a.x - f.x, a.y - f.y) - Math.hypot(b.x - f.x, b.y - f.y))[0];
        if (o) { VFX.zap(f.x, f.y - 10, o.x, o.y - 10); Sfx.play('thunder'); damageBase.call(this, o, dealt * 0.35, 0, 20, 1); }
      } break;
      case 'token_blood': S.hp = Math.min(Combat.maxHP(), S.hp + dealt * 0.03); if (R < 0.3) VFX.emit('heal', Player.x + (R - 0.15) * 30, Player.y - 20, { color: '#ff6080' }); break;
      case 'token_gale': if (alive && R < 0.1) { f.stun = Math.max(f.stun, 0.35); f.stunT = 0.35; VFX.burst('dust', f.x, f.y - 6, 8, 50); } break;
      default: break;
    }
    return r;
  };

  // Poison eats at an enemy a little at a time.
  const updateBase = Foes.update;
  Foes.update = function (dt) {
    for (const f of [...this.list]) {
      if (!(f.poisonT > 0)) continue;
      f.poisonT -= dt; f.poisonTick = (f.poisonTick || 0.5) - dt;
      if (f.poisonTick <= 0) {
        f.poisonTick = 0.5; f.hp -= 2;
        if (Math.random() < 0.6) VFX.emit('bubble', f.x + (Math.random() - 0.5) * 10, f.y - 12);
        if (f.hp <= 0) this.kill(f);
      }
    }
    return updateBase.call(this, dt);
  };
  const statusBase = VFX.foeStatus;
  VFX.foeStatus = function (g, f, img, px, py, w, h) {
    statusBase.call(this, g, f, img, px, py, w, h);
    if (f.poisonT > 0) { g.globalAlpha = 0.35; g.drawImage(Art.tinted(img, '#8ad040'), px, py, w, h); g.globalAlpha = 1; }
  };

  // The token's icon: a little charged stone in a ring.
  Art.ICONS.token = (g, a, b) => {
    const P = Art.P;
    P(g, b, 5, 2, 6, 12); P(g, b, 3, 4, 10, 8); P(g, b, 4, 3, 8, 10);
    P(g, a, 5, 3, 6, 10); P(g, a, 4, 4, 8, 8);
    P(g, '#ffffff', 6, 5, 2, 2); P(g, '#ffffff', 9, 9, 1, 1); P(g, b, 7, 8, 2, 2);
  };

  // Pit weapons vanish when you leave, and so do their tokens.
  const endBase = Arena.end;
  Arena.end = function (fell) {
    const r = endBase.call(this, fell);
    if (S.socket) for (const w in S.socket) if (ITEMS[w] && ITEMS[w].arena) delete S.socket[w];
    return r;
  };
})();
