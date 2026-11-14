'use strict';
// Soil, crops, tools, livestock and the overnight rollover.

const CAN_CAPACITY = [40, 70, 100, 140, 200];
const REACH_BY_LEVEL = [1, 3, 5, 7, 5];
// How hard the axe and pickaxe hit, and how often they turn up a little extra.
const TOOL_POWER = [1, 2, 3, 4, 7];
const TOOL_BONUS = [0, 0, 0, 0.2, 0.4];
const ENERGY_COST = { hoe: 2, can: 1, axe: 3, pick: 3, scythe: 0, rod: 4 };

const Farm = {
  get map() { return World.maps.farm; },

  soilAt(m, x, y) { return m.soil[key(x, y)]; },

  canTill(m, x, y) { return m.tillable && World.g(m, x, y) === T.G && !World.at(m, x, y) && !m.block.has(key(x, y)) && !this.soilAt(m, x, y); },

  till(m, x, y) {
    if (!this.canTill(m, x, y)) return false;
    m.soil[key(x, y)] = { w: S.weather === 'rain' || S.weather === 'storm' ? 1 : 0, f: 0, c: null };
    return true;
  },

  plant(m, x, y, seedId) {
    const s = this.soilAt(m, x, y), cropId = ITEMS[seedId].crop;
    if (!s || s.c) return false;
    if (!CROPS[cropId].seasons.includes(S.season)) { toast(`${CROPS[cropId].name} will not grow in ${SEASONS[S.season]}.`); Sfx.play('bad'); return false; }
    s.c = { id: cropId, age: 0, dry: 0, ready: false };
    Sfx.play('plant');
    Quests.event('plant', cropId);
    gainXP('farming', 2);
    return true;
  },

  stage(c) {
    const d = CROPS[c.id];
    if (c.age >= d.days) return 4;
    return Math.min(3, Math.floor((c.age / d.days) * 4));
  },
  ripe(c) { return !c.dead && c.age >= CROPS[c.id].days; },

  harvest(m, x, y) {
    const s = this.soilAt(m, x, y);
    if (!s || !s.c || !this.ripe(s.c)) return false;
    const d = CROPS[s.c.id], lvl = S.skills.farming.lvl, roll = Math.random();
    const kept = Story.boost('tally') ? 0.1 : 0;
    const gold = 0.01 + lvl * 0.02 + s.f * 0.15 + kept, silver = gold + 0.1 + lvl * 0.03 + s.f * 0.2 + kept;
    const q = roll < gold ? 2 : roll < silver ? 1 : 0;
    if (Inv.add(d.id, 1, q) > 0) return false;
    Sfx.play('harvest');
    FX.burst(x * TILE + 8, y * TILE + 8, d.c1, 6);
    gainXP('farming', Math.max(4, Math.floor(ITEMS[d.id].price / 12)));
    Quests.event('harvest', d.id);
    Memory.deed('first_harvest', `Pulled the first ${d.name.toLowerCase()} from Ashgrove soil.`);
    if (d.regrow) { s.c.age = d.days - d.regrow; s.c.dry = 0; } else s.c = null;
    return true;
  },

  water(m, x, y) {
    const s = this.soilAt(m, x, y);
    if (!s || s.w) return false;
    s.w = 1;
    return true;
  },

  newDay() {
    const m = this.map, keys = Object.keys(m.soil);
    let died = 0;
    for (const k of keys) {
      const s = m.soil[k];
      if (s.c && !s.c.dead) {
        if (s.w) { s.c.age++; s.c.dry = 0; if (Story.boost('moss') && Math.random() < 0.25) s.c.age++; }
        else if (++s.c.dry >= 4 && !this.ripe(s.c) && S.ending !== 'keep') { s.c.dead = true; died++; }
      }
      s.w = 0;
      if (!s.c && !s.f && Math.random() < 0.08) delete m.soil[k]; // untended ground goes back to grass
    }
    if (died) Memory.deed('crops_died', 'Let a crop die of thirst in the field.', { gossip: true, rep: { town: -1 } });
    return died;
  },

  killOutOfSeason() {
    const m = this.map;
    let lost = 0;
    for (const k in m.soil) {
      const c = m.soil[k].c;
      if (c && !c.dead && !CROPS[c.id].seasons.includes(S.season)) { c.dead = true; lost++; }
    }
    return lost;
  },

  morningWater() {
    const m = this.map;
    if (S.weather === 'rain' || S.weather === 'storm') for (const k in m.soil) m.soil[k].w = 1;
    if (Story.boost('reed')) Story.reedWater(m);
    m.objs.forEach(o => {
      if (o.type !== 'sprinkler') return;
      for (let d = 0; d < 4; d++) this.water(m, o.x + DX[d], o.y + DY[d]);
    });
  },

  spawnDaily() {
    const m = this.map, village = World.maps.village;
    const forageBy = [['dandelion', 'leek', 'herb'], ['blackberry', 'herb', 'mushroom'], ['hazelnut', 'mushroom', 'blackberry', 'herb'], ['holly', 'herb']][S.season];
    const place = (mp, n, fn) => {
      for (let i = 0; i < n; i++) {
        const x = 4 + Math.floor(Math.random() * (mp.w - 8)), y = 6 + Math.floor(Math.random() * (mp.h - 10));
        if (World.g(mp, x, y) === T.G && !World.solid(mp, x, y) && !World.at(mp, x, y) && !this.soilAt(mp, x, y)) fn(x, y);
      }
    };
    const count = (mp, t) => [...mp.objs.values()].filter(o => o.type === t).length;
    if (count(m, 'forage') < 10) place(m, Story.boost('bell') ? 8 : 5, (x, y) => World.add(m, 'forage', x, y, { item: pick(forageBy) }));
    if (count(village, 'forage') < 6) place(village, 3, (x, y) => World.add(village, 'forage', x, y, { item: pick(forageBy) }));
    if (S.season !== 3) place(m, 6, (x, y) => World.add(m, 'weed', x, y));
    place(m, 2, (x, y) => World.add(m, Math.random() < 0.5 ? 'rock' : 'branch', x, y));
    // Wild regions restock a little each day.
    const scatter = (mp, n, ground, fn) => {
      for (let i = 0; i < 200 && n > 0; i++) {
        const x = Math.floor(Math.random() * mp.w), y = Math.floor(Math.random() * mp.h);
        if (ground.includes(World.g(mp, x, y)) && !World.solid(mp, x, y) && !World.at(mp, x, y) && !World.warpAt(mp, x, y)) { fn(x, y); n--; }
      }
    };
    for (const id in World.maps) {
      const mp = World.maps[id];
      if (mp.forage && count(mp, 'forage') < 8) scatter(mp, 3, [T.G, T.S, T.MTN], (x, y) => World.add(mp, 'forage', x, y, { item: pick(mp.forage) }));
      (mp.ores || []).forEach(([type, cap]) => { if (count(mp, type) < cap) scatter(mp, 2, [T.MTN], (x, y) => World.add(mp, type, x, y)); });
    }
  },

  chickensNewDay() {
    const m = this.map;
    const fed = S.troughFed;
    S.chickens.forEach(ch => {
      ch.petted = false;
      ch.happy = clamp(ch.happy + (fed ? 10 : -25), 0, 100);
      if (fed && (Story.boost('bell') || Math.random() < 0.55 + ch.happy / 200)) {
        for (let tries = 0; tries < 12; tries++) {
          const x = 42 + rnd(0, 9), y = 34 + rnd(0, 4);
          if (!World.solid(m, x, y) && !World.at(m, x, y)) { World.add(m, 'forage', x, y, { item: 'egg' }); break; }
        }
      }
    });
    if (S.chickens.length && !fed) Memory.deed('starved_hens', 'Left the hens unfed.', { gossip: true });
    S.troughFed = false;
  },

  buyChicken() {
    if (S.chickens.length >= 6) return false;
    S.chickens.push({ x: 45 * TILE, y: 36 * TILE, happy: 60, petted: false, dir: 0, t: 0, tx: 45 * TILE, ty: 36 * TILE });
    return true;
  },
};

// ---- Tools -----------------------------------------------------------------
const Tools = {
  // The tiles a swing covers, given a start tile and facing.
  line(tile, dir, len) {
    const out = [];
    for (let i = 0; i < len; i++) out.push([tile.x + DX[dir] * i, tile.y + DY[dir] * i]);
    return out;
  },
  // What a hoe or can covers at each level: a line, then (amethyst) a strip 3 wide.
  reach(tile, dir, lvl) {
    if (lvl < 4) return this.line(tile, dir, REACH_BY_LEVEL[lvl]);
    const sx = DY[dir] ? 1 : 0, sy = DX[dir] ? 1 : 0, out = [];
    for (let i = 0; i < REACH_BY_LEVEL[lvl]; i++) for (const s of [0, -1, 1]) out.push([tile.x + DX[dir] * i + sx * s, tile.y + DY[dir] * i + sy * s]);
    return out;
  },

  apply(toolId, tile, dir, m) {
    const lvl = S.tools[toolId];
    switch (toolId) {
      case 'hoe': {
        let n = 0;
        for (const [x, y] of this.reach(tile, dir, lvl)) if (Farm.till(m, x, y)) { n++; FX.burst(x * TILE + 8, y * TILE + 10, '#7c5433', 4); }
        if (n) { Sfx.play('hoe'); Quests.event('till', null, n); gainXP('farming', n); }
        else { Sfx.play('bad'); }
        return true;
      }
      case 'can': {
        if (World.g(m, tile.x, tile.y) === T.W) {
          S.can = CAN_CAPACITY[lvl]; Sfx.play('refill'); toast('Watering can refilled.');
          FX.burst(tile.x * TILE + 8, tile.y * TILE + 8, '#7dbbe6', 8);
          return true;
        }
        if (S.can <= 0) { toast('The can is empty. Refill it at the pond.'); Sfx.play('bad'); return false; }
        let n = 0;
        for (const [x, y] of this.reach(tile, dir, lvl)) {
          if (S.can > 0 && Farm.water(m, x, y)) { S.can--; n++; FX.burst(x * TILE + 8, y * TILE + 8, '#7dbbe6', 6); }
        }
        Sfx.play('water');
        if (n) { Quests.event('water', null, n); gainXP('farming', n); }
        return true;
      }
      case 'axe': case 'pick': return this.strike(toolId, tile, m, lvl);
      case 'scythe': {
        // Sweeps three tiles side-to-side across the facing direction.
        const side = dir < 2 ? [[0, 0], [-1, 0], [1, 0]] : [[0, 0], [0, -1], [0, 1]];
        Sfx.play('hoe');
        for (const [ox, oy] of side) {
          const x = tile.x + ox, y = tile.y + oy, o = World.at(m, x, y), s = Farm.soilAt(m, x, y);
          if (o && OBJDEF[o.type].tool === 'scythe') this.destroy(o, m);
          else if (s && s.c && s.c.dead) { s.c = null; FX.burst(x * TILE + 8, y * TILE + 8, '#94845a', 4); }
          else if (s && s.c && Farm.ripe(s.c) && !Crime.gardenOwner(m, x, y)) Farm.harvest(m, x, y);
        }
        return true;
      }
    }
    return false;
  },

  strike(toolId, tile, m, lvl) {
    const o = World.at(m, tile.x, tile.y);
    if (o && OBJDEF[o.type].tool !== toolId && !OBJDEF[o.type].solid) { Sfx.play('bad'); return true; }
    if (toolId === 'pick' && !o) {
      const s = Farm.soilAt(m, tile.x, tile.y);
      if (s && !s.c && m.tillable) { delete m.soil[key(tile.x, tile.y)]; Sfx.play('hoe'); return true; }
    }
    if (!o) { Sfx.play('chop'); return true; }
    const d = OBJDEF[o.type];
    if (d.tool !== toolId) {
      Sfx.play('bad');
      if (o.type === 'btree') toast(d.msg);
      return true;
    }
    if (d.minLvl && lvl < d.minLvl) { toast(`This needs a ${d.minLvl > 1 ? 'iron' : 'copper'} pickaxe or better.`); Sfx.play('bad'); return true; }
    Sfx.play(toolId === 'axe' ? 'chop' : 'pick');
    o.hp -= TOOL_POWER[lvl] || lvl + 1;
    o.shake = 0.2;
    FX.burst(tile.x * TILE + 8, tile.y * TILE + 4, toolId === 'axe' ? '#a87c4c' : '#a0a0a8', 4);
    if (o.hp <= 0) this.destroy(o, m);
    return true;
  },

  destroy(o, m) {
    const d = OBJDEF[o.type];
    World.remove(m, o);
    Sfx.play(o.type === 'weed' ? 'weed' : d.tool === 'axe' ? 'tree_fall' : 'rock_break');
    FX.burst(o.x * TILE + 8, o.y * TILE + 8, o.type === 'weed' ? '#6aa848' : '#8a7a60', 8);
    if (d.refund) Inv.add(d.refund, 1);
    // The marked rock always hides the ladder, and every rock broken makes a lucky find likelier.
    const lucky = m.transient && o.type === 'rock' && Mine.floor < 30 && ![...m.objs.values()].some(q => q.type === 'ladder') && Math.random() < 0.02 * ++Mine.broken;
    if (o.type === 'eye') DLC.smash(o);
    if (o.ladder || lucky) { World.add(m, 'ladder', o.x, o.y); toast('A ladder down!'); Sfx.play('discover'); }
    if (o.type === 'thicket' || o.type === 'crackwall' || o.type === 'hardrubble') Memory.deed('hidden_' + m.id + o.type, `Uncovered a hidden way in ${m.name}.`);
    const tool = d.tool === 'axe' || d.tool === 'pick' ? S.tools[d.tool] : 0;
    (d.drops || []).forEach(([id, a, b]) => {
      const n = rnd(a, b) + (b > 0 && Math.random() < (TOOL_BONUS[tool] || 0) ? 1 : 0);
      if (n > 0) { Inv.add(id, n); Quests.event(id === 'wood' ? 'chop' : id === 'stone' ? 'mine' : 'gather', id, n); }
    });
    if (d.xp) gainXP(d.xp[0], d.xp[1]);
    if (o.type === 'tree' && Math.random() < 0.3) Inv.add('hazelnut', 1);
  },
};

// Lightweight particle bursts.
const FX = {
  list: [],
  burst(x, y, color, n) {
    for (let i = 0; i < n; i++) this.list.push({ x, y, vx: (Math.random() - 0.5) * 60, vy: -20 - Math.random() * 40, t: 0.35 + Math.random() * 0.2, color });
  },
  text(x, y, s, color) { this.list.push({ x: x - Font.width(s) / 2, y, vx: 0, vy: -24, t: 0.75, color, s }); },
  update(dt) {
    for (const p of this.list) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; if (!p.s) p.vy += 140 * dt; }
    this.list = this.list.filter(p => p.t > 0);
  },
  draw(g) {
    for (const p of this.list) {
      if (p.s) { Font.shadow(g, p.s, Math.round(p.x), Math.round(p.y), p.color); continue; }
      g.fillStyle = p.color; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    }
  },
};

const WEATHER_ODDS = [
  [['rain', 0.28]], [['storm', 0.1], ['rain', 0.12]], [['rain', 0.26]], [['snow', 0.45]],
];
function rollWeather(season) {
  let r = Math.random();
  for (const [name, p] of WEATHER_ODDS[season]) { if (r < p) return name; r -= p; }
  return 'sun';
}
