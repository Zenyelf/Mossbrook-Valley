'use strict';
// Whitlock Racecourse (the old stables). Dara still sells mounts, more kinds of them now,
// and runs races: ride in one yourself, or read the form and bet.
//
// Riding takes skill, not luck. Everyone rides the course's own horses, all equally
// fast, so money cannot buy a win. What wins is riding: galloping only when it pays,
// saving stamina for the finish, tucking in behind another horse to rest yours,
// steering round mud and slower horses, and timing every jump.
// Betting takes skill too. The crowd sets the odds mostly on speed. The race is
// decided by how each horse's stamina, jumping and taste for mud suit the day.
// Five run; the first three are paid.

// ---- Mounts: they only differ in speed -------------------------------------------------
const MOUNTS = {
  donkey: { name: 'Pepper', kind: 'Donkey', speed: 1.45, price: 1000, coat: ['#8a8278', '#6a6258', '#a8a096'], mane: '#3a3430', extra: 'ears', blurb: 'Slow, steady and stubborn. Cheap.' },
  pony: { name: 'Biscuit', kind: 'Pony', speed: 1.65, price: 1600, coat: ['#b8743c', '#8a5428', '#d09058'], mane: '#f0d8a0', blurb: 'Small, quick on her feet, always hungry.' },
  horse: { name: 'Bracken', kind: 'Horse', speed: 1.9, price: 2500, coat: ['#8a5a34', '#6a4326', '#a87248'], mane: '#2f2018', blurb: 'Sound legs, no temper, afraid of nothing.' },
  ram: { name: 'Crag', kind: 'Mountain Ram', speed: 2.0, price: 4000, coat: ['#e0d8c8', '#b8ae9c', '#f4efe4'], mane: '#c8bea8', extra: 'horns', blurb: 'Bred on Ironback. Sure-footed and faster than he looks.' },
  stag: { name: 'Ashwood', kind: 'Great Stag', speed: 2.15, price: 6500, coat: ['#9a6a40', '#74502e', '#b88a5c'], mane: '#5a3a20', extra: 'antlers', blurb: 'Raised from a fawn found in Greywood. He chose to stay.' },
  moon: { name: 'Silvermoon', kind: 'Moon Mare', speed: 2.3, price: 10000, coat: ['#e8ecf4', '#b8c0d0', '#ffffff'], mane: '#a8b8e0', extra: 'star', champion: true, blurb: 'Dara sells her only to a champion of the course.' },
};
const MOUNT_ORDER = ['donkey', 'pony', 'horse', 'ram', 'stag', 'moon'];
// The course's own racehorses, in their coats.
const RACE_COATS = [
  { coat: ['#8a5a34', '#6a4326', '#a87248'], mane: '#2f2018' }, { coat: ['#3a3230', '#2a2220', '#504642'], mane: '#14100e' },
  { coat: ['#a0a4ac', '#7c8088', '#c4c8d0'], mane: '#4a4e56' }, { coat: ['#b0602c', '#884820', '#c87a40'], mane: '#5a2c14' },
  { coat: ['#d8ccb4', '#b0a48c', '#ece4d0'], mane: '#8a7a5a' },
];

(() => {
  const { mk, P, outlined, memo } = Art;
  // pal: { coat: [mid, dark, light], mane, extra }
  const paint = (g, pal, dir, f, layer) => {
    const [C, D, L] = pal.coat, M = pal.mane, H = '#241a12', SAD = '#7a2f30', HORN = pal.extra === 'horns' ? '#8a7454' : '#d8c8a0';
    const leg = (x, up) => { const h = up ? 5 : 8; P(g, D, x, 23, 3, h - 2); P(g, H, x, 21 + h, 3, 2); };
    if (dir === DIRS.down) {
      if (layer === 0) { leg(14, f === 1); leg(23, f === 3); P(g, C, 13, 12, 14, 12); P(g, D, 13, 22, 14, 2); P(g, SAD, 14, 10, 12, 3); return; }
      P(g, C, 16, 8, 8, 13); P(g, pal.extra === 'star' ? '#ffffff' : '#efe6d2', 19, 9, 2, 10); P(g, D, 17, 18, 6, 3);
      P(g, C, 16, 5, 2, 3); P(g, C, 22, 5, 2, 3); P(g, M, 18, 7, 4, 3); P(g, '#1a1210', 17, 11); P(g, '#1a1210', 22, 11);
      if (pal.extra === 'ears') { P(g, D, 15, 0, 2, 6); P(g, D, 23, 0, 2, 6); }
      if (pal.extra === 'horns') { P(g, HORN, 12, 6, 4, 2); P(g, HORN, 12, 8, 2, 3); P(g, HORN, 24, 6, 4, 2); P(g, HORN, 26, 8, 2, 3); }
      if (pal.extra === 'antlers') { P(g, HORN, 15, 0, 1, 6); P(g, HORN, 24, 0, 1, 6); P(g, HORN, 12, 1, 4, 1); P(g, HORN, 24, 1, 4, 1); P(g, HORN, 13, 0, 1, 2); P(g, HORN, 26, 0, 1, 2); }
      return;
    }
    if (layer) return;
    if (dir === DIRS.up) {
      P(g, C, 17, 3, 6, 9); P(g, M, 19, 2, 2, 10); P(g, C, 16, 1, 2, 3); P(g, C, 22, 1, 2, 3);
      leg(14, f === 3); leg(23, f === 1);
      P(g, C, 13, 12, 14, 12); P(g, L, 14, 12, 12, 2); P(g, D, 13, 22, 14, 2); P(g, SAD, 14, 10, 12, 4); P(g, M, 19, 14, 2, 13);
      if (pal.extra === 'ears') { P(g, D, 16, 0, 2, 4); P(g, D, 22, 0, 2, 4); }
      if (pal.extra === 'horns') { P(g, HORN, 13, 3, 4, 3); P(g, HORN, 23, 3, 4, 3); }
      if (pal.extra === 'antlers') { P(g, HORN, 15, 0, 1, 4); P(g, HORN, 24, 0, 1, 4); P(g, HORN, 13, 0, 3, 1); P(g, HORN, 24, 0, 3, 1); }
      return;
    }
    if (dir === DIRS.left) { g.translate(40, 0); g.scale(-1, 1); }
    P(g, M, 4, 12, 3, 12); P(g, M, 3, 18, 3, 7);
    leg(10, f === 1); leg(13, f === 3); leg(25, f === 3); leg(28, f === 1);
    P(g, C, 8, 12, 22, 11); P(g, L, 9, 12, 20, 2); P(g, D, 8, 21, 22, 2);
    if (pal.extra === 'horns') { P(g, L, 10, 14, 4, 3); P(g, L, 18, 15, 5, 3); P(g, L, 24, 13, 3, 3); }
    P(g, C, 27, 5, 6, 11); P(g, M, 26, 4, 3, 10);
    P(g, C, 31, 3, 7, 6); P(g, D, 36, 6, 3, 3); P(g, C, 31, 1, 2, 3); P(g, '#1a1210', 33, 5);
    if (pal.extra === 'ears') { P(g, D, 30, 0, 2, 4); P(g, D, 32, 0, 2, 3); }
    if (pal.extra === 'horns') { P(g, HORN, 29, 1, 5, 2); P(g, HORN, 28, 3, 2, 4); P(g, HORN, 29, 6, 3, 2); }
    if (pal.extra === 'antlers') { P(g, HORN, 31, 0, 1, 3); P(g, HORN, 29, 0, 3, 1); P(g, HORN, 34, 0, 1, 3); P(g, HORN, 34, 0, 3, 1); }
    if (pal.extra === 'star') P(g, '#ffffff', 34, 4, 2, 1);
    P(g, '#d8c8a0', 14, 13, 11, 3); P(g, SAD, 15, 10, 9, 4);
  };
  Art.mountPal = (key, pal, dir, f, layer) => memo(`mount${key}${dir}${f}${layer}`, () => outlined(mk(40, 32, g => paint(g, pal, dir, f, layer))));
  Art.mount = (id, dir, f, layer) => Art.mountPal(id, MOUNTS[id], dir, f, layer);
  Art.horse = (dir, f, layer) => Art.mount('horse', dir, f, layer);

  // The race board outside the course.
  Art.STATIC.raceboard = () => outlined(mk(26, 30, g => {
    P(g, '#6f4c30', 4, 14, 3, 16); P(g, '#6f4c30', 19, 14, 3, 16);
    P(g, '#7a5535', 1, 2, 24, 15); P(g, '#e8dcc4', 3, 4, 20, 11);
    P(g, '#8a5a34', 6, 8, 10, 4); P(g, '#8a5a34', 15, 6, 3, 4); P(g, '#2f2018', 15, 5, 2, 2); P(g, '#6a4326', 7, 12, 1, 2); P(g, '#6a4326', 14, 12, 1, 2);
    P(g, '#c43030', 18, 5, 3, 2); P(g, '#2a6aa8', 18, 8, 3, 2); P(g, '#e8c040', 18, 11, 3, 2);
  }));
})();
Object.assign(OBJDEF, { raceboard: { solid: 1, act: 'races' } });
ACT_LABEL.races = 'The races';
Art.house_defs.stable.deco = (g, x0, wy, W, H) => {
  Art.P(g, '#2a1e14', x0 + 30, H - 34, 36, 34);
  Art.P(g, '#e8dcc4', x0 + 28, H - 36, 40, 2); Art.P(g, '#e8dcc4', x0 + 28, H - 36, 2, 36); Art.P(g, '#e8dcc4', x0 + 66, H - 36, 2, 36);
  Art.P(g, '#7a5535', x0 + 20, wy + 2, 56, 9); Font.center(g, 'RACECOURSE', x0 + 48, wy + 3, '#fff2c8');
};
MAP_LABELS.stable = 'Whitlock Racecourse';

// ---- Owning and riding a mount ---------------------------------------------------------
Object.assign(Horse, {
  owned() { return S.mounts && S.mounts.length ? S.mounts : S.horse ? ['horse'] : []; },
  kind() { const o = this.owned(); return o.includes(S.mount) ? S.mount : o[o.length - 1] || 'horse'; },
  speed() { return MOUNTS[this.kind()].speed; },
  buy(id) {
    const m = MOUNTS[id];
    S.gold -= m.price;
    S.mounts = [...new Set([...this.owned(), id])]; S.mount = id; S.horse = true;
    Sfx.play('buy'); Sfx.play('neigh');
    Memory.deed('bought_' + id, `Bought ${m.name} the ${m.kind.toLowerCase()} from Whitlock Racecourse.`, { gossip: true });
  },
  draw(g) {
    const p = Player, px = Math.round(p.x), py = Math.round(p.y), f = p.moving ? Math.floor(p.frameT * 1.2) % 4 : 0, k = this.kind();
    const hx = px - 20, hy = py - 30, bob = f === 1 || f === 3 ? -1 : 0, seat = p.dir === DIRS.up ? 12 : 10;
    g.drawImage(Art.mount(k, p.dir, f, 0), hx, hy);
    g.drawImage(Armor.frame(p.dir, 0), 0, 0, 18, 19, px - 9, hy + seat - 18 + bob, 18, 19);
    if (p.dir === DIRS.down) g.drawImage(Art.mount(k, p.dir, f, 1), hx, hy);
  },
  // The next mount for sale waits in the paddock.
  paddockKind() { const o = this.owned(); return MOUNT_ORDER.find(k => !o.includes(k) && !MOUNTS[k].champion) || null; },
  drawPaddock(g) {
    const k = this.paddockKind();
    if (!k) return;
    const t = Math.floor(Render.waterT * 0.7) % 4, f = t === 2 ? 1 : 0;
    Render.shadow(g, 8 * TILE, 22 * TILE - 2, 26);
    g.drawImage(Art.mount(k, DIRS.right, f, 0), 8 * TILE - 20, 22 * TILE - 32);
  },
});
// Dara sells every kind, lets you choose which one comes when you whistle, and runs the races.
NPCS.dara.extra = function (opts) {
  opts.push({ text: 'Buy a mount', fn: () => Racing.shop() });
  if (Horse.owned().length > 1) opts.push({ text: 'Choose which mount comes to you', fn: () => Racing.choose() });
  opts.push({ text: 'The races', fn: () => Racing.menu() });
};

// ---- The races ---------------------------------------------------------------------------
const RACE_CLASSES = {
  novice: { name: 'Novice Stakes', entry: 100, prize: [400, 220, 130], len: 2600, hurdles: 2, puddles: 4,
    field: [[0.93, 0.4, 0.35, 'front'], [0.945, 0.45, 0.4, 'front'], [0.955, 0.35, 0.45, 'stalker'], [0.965, 0.4, 0.3, 'front']] },
  open: { name: 'Open Handicap', entry: 400, prize: [1600, 800, 450], len: 3200, hurdles: 4, puddles: 7, needs: 'placed',
    field: [[0.94, 0.55, 0.55, 'front'], [0.95, 0.5, 0.6, 'stalker'], [0.955, 0.6, 0.5, 'closer'], [0.96, 0.5, 0.65, 'stalker']] },
  champion: { name: 'Whitlock Cup', entry: 1500, prize: [6000, 3000, 1700], len: 3800, hurdles: 6, puddles: 10, needs: 'open',
    field: [[0.975, 0.7, 0.75, 'stalker'], [0.98, 0.65, 0.8, 'closer'], [0.985, 0.6, 0.7, 'front'], [0.99, 0.7, 0.85, 'stalker']] },
};
const JOCKEYS = [
  ['Wren Abbot', 'Thistle', '#c43030'], ['Tobin Marsh', 'Saltlick', '#2a6aa8'], ['Ada Pell', 'Juniper', '#e8c040'], ['Hob Greaves', 'Ironfoot', '#4a8a3a'],
  ['Mira Stone', 'Whisper', '#8a4ab0'], ['Cole Brandt', 'Ember', '#e07030'], ['Nell Ashby', 'Quill', '#30a0a0'], ['Fen Corrow', 'Black Tom', '#505058'],
];
const LANES = 5;
const SPEED = { cruise: 75, gallop: 118 };

const Racing = {
  // A racer: lane, distance, speed, stamina, and how it is ridden.
  racer(o) { return Object.assign({ x: 0, v: 0, lane: 0, ly: 0, stam: 1, air: 0, stumble: 0, laneT: 0, done: 0, place: 0, spd: 1, sta: 0.5, jmp: 0.5, mud: 0.5, style: 'stalker', tired: false, frame: 0 }, o); },

  build(opts) {
    const st = { t: -3, len: opts.len, hurdles: [], puddles: [], soft: !!opts.soft, racers: [], order: [], mode: opts.mode, finished: false, over: 0 };
    const gap = opts.len / (opts.hurdles + 1);
    for (let i = 1; i <= opts.hurdles; i++) st.hurdles.push(Math.round(gap * i));
    for (let i = 0; i < opts.puddles; i++) {
      const x = 350 + (i + 0.5) * (opts.len - 500) / opts.puddles + (Math.random() - 0.5) * 80;
      if (!st.hurdles.some(h => Math.abs(h - x) < 90)) st.puddles.push({ x, lane: Math.floor(Math.random() * LANES), w: 60 });
    }
    st.racers = opts.racers.map((r, i) => this.racer(Object.assign({ lane: i, ly: i }, r)));
    return st;
  },
  laneFree(st, me, lane, x) { return lane >= 0 && lane < LANES && !st.racers.some(o => o !== me && !o.done && Math.round(o.lane) === lane && Math.abs(o.x - x) < 22); },
  puddleAt(st, lane, x) { return st.puddles.find(p => p.lane === lane && x > p.x - p.w / 2 && x < p.x + p.w / 2); },
  ahead(st, me) { return st.racers.filter(o => o !== me && !o.done && o.lane === me.lane && o.x > me.x && o.x - me.x < 60).sort((a, b) => a.x - b.x)[0]; },

  // One racer's step. ctl: { gallop, jump, lane } for the rider, or decided by AI.
  move(st, r, dt, ctl) {
    if (r.done) return;
    const prog = r.x / st.len;
    r.stumble = Math.max(0, r.stumble - dt); r.laneT = Math.max(0, r.laneT - dt);
    if (r.stam <= 0) r.tired = true; if (r.tired && r.stam >= 0.4) r.tired = false;
    // Lane changes, never into another horse.
    if (ctl.lane && r.laneT <= 0) {
      const to = r.lane + ctl.lane;
      if (this.laneFree(st, r, to, r.x)) { r.lane = to; r.laneT = 0.35; }
      else if (to >= 0 && to < LANES) { r.v *= 0.92; r.laneT = 0.35; if (r.me) Sfx.play('thud'); }
    }
    r.ly += clamp(r.lane - r.ly, -dt * 4, dt * 4);
    // Jumping.
    if (ctl.jump && r.air <= 0 && r.stumble <= 0) { r.air = 0.5; r.stam = Math.max(0, r.stam - 0.02); if (r.me) Sfx.play('leap'); }
    const wasAir = r.air;
    r.air = Math.max(0, r.air - dt);
    // How fast it wants to go.
    const gallop = ctl.gallop && !r.tired && r.stumble <= 0;
    let target = (gallop ? SPEED.gallop : SPEED.cruise) * r.spd * (r.tired ? 0.6 : 1);
    if (st.soft) target *= 0.86 + 0.14 * r.mud;
    if (r.air <= 0 && this.puddleAt(st, r.lane, r.x)) target *= 0.6 + 0.3 * r.mud;
    // Behind another horse: it blocks you, but you rest in its shelter.
    const front = this.ahead(st, r), draft = front && front.x - r.x < 50;
    if (front && front.x - r.x < 20 && r.air <= 0) target = Math.min(target, front.v * 0.98);
    r.v += clamp(target - r.v, -90 * dt, 70 * dt);
    if (gallop) r.stam = Math.max(0, r.stam - 0.105 * (1.35 - 0.7 * r.sta) * (draft ? 0.55 : 1) * dt);
    else r.stam = Math.min(1, r.stam + 0.045 * (0.6 + 0.8 * r.sta) * (draft ? 1.4 : 1) * dt);
    const before = r.x;
    r.x += r.v * dt;
    r.frame += r.v * dt * 0.06;
    // Hurdles: cleared in the air, a stumble on the ground.
    for (const h of st.hurdles) {
      if (before < h && r.x >= h) {
        if (r.air > 0) {
          // The cleanest jump crosses the hurdle at the top of the leap.
          const q = r.me ? Math.abs((0.5 - wasAir) / 0.5 - 0.5) * 2 : 1 - r.jmp;
          r.v *= 1 - q * (r.me ? 0.18 : 0.3);
          if (r.me && q < 0.25) { st.flash = { text: 'Clean jump!', t: 0.8, c: '#9ad060' }; }
        } else {
          r.v *= 0.4; r.stumble = 0.7; r.stam = Math.max(0, r.stam - 0.08);
          if (r.me) { st.flash = { text: 'Clipped the hurdle!', t: 1, c: '#ff9080' }; Sfx.play('thud'); }
        }
      }
    }
    if (r.x >= st.len) { r.done = 1; st.order.push(r); r.place = st.order.length; if (r.me) Sfx.play(r.place <= 3 ? 'victory' : 'bad'); }
    void prog;
  },

  // How the course's riders ride.
  ai(st, r) {
    const prog = r.x / st.len, left = st.len - r.x;
    let gallop;
    if (r.style === 'front') gallop = r.stam > 0.3 || (left < 500 && r.stam > 0);
    else if (r.style === 'closer') gallop = prog > 0.55 || r.stam > 0.97 && prog > 0.3;
    else gallop = r.stam > 0.65 || (prog > 0.6 && r.stam > 0);
    // Jump when the hurdle is close; the better the jumper, the cleaner.
    const h = st.hurdles.find(x => x > r.x), jump = h !== undefined && h - r.x < r.v * 0.26 && h - r.x > r.v * 0.2;
    // Steer round mud and slow horses ahead, if the next lane is clear.
    let lane = 0;
    const front = this.ahead(st, r), mud = st.puddles.find(p => p.lane === r.lane && p.x - p.w / 2 - r.x > 0 && p.x - p.w / 2 - r.x < 90);
    if ((front && front.x - r.x < 34 && front.v < r.v + 3) || mud) {
      for (const d of r.lane < 2 ? [1, -1] : [-1, 1]) {
        const to = r.lane + d;
        if (this.laneFree(st, r, to, r.x) && !st.puddles.some(p => p.lane === to && Math.abs(p.x - r.x - 40) < 60)) { lane = d; break; }
      }
    }
    return { gallop, jump, lane };
  },

  step(st, dt, me) {
    if (st.t < 0) { const was = Math.ceil(-st.t); st.t += dt; if (Math.ceil(-st.t) !== was && st.t < 0) Sfx.play('click'); if (st.t >= 0) Sfx.play('wave_start'); return; }
    st.t += dt;
    if (st.flash) { st.flash.t -= dt; if (st.flash.t <= 0) st.flash = null; }
    for (const r of st.racers) this.move(st, r, dt, r.me ? me : this.ai(st, r));
    if (st.racers.every(r => r.done)) st.finished = true;
    // If you have finished, the rest of the field is run home quickly.
    const you = st.racers.find(r => r.me);
    if (you && you.done && !st.finished) for (let i = 0; i < 6; i++) for (const r of st.racers) if (!r.done) this.move(st, r, dt, this.ai(st, r));
  },

  // ---- Fields -------------------------------------------------------------------------
  field(cls) {
    const C = RACE_CLASSES[cls], picks = JOCKEYS.slice().sort(() => Math.random() - 0.5).slice(0, 4);
    const ai = C.field.map(([spd, sta, jmp, style], i) => ({ name: picks[i][0], horse: picks[i][1], silk: picks[i][2], spd: spd * (1 + (Math.random() - 0.5) * 0.02), sta, jmp, mud: 0.5, style, coat: RACE_COATS[(i + 1) % RACE_COATS.length] }));
    const you = { name: 'You', horse: 'Dusk', silk: '#f0f0f0', spd: 1, sta: 0.6, jmp: 1, mud: 0.5, me: true, coat: RACE_COATS[0] };
    const all = [...ai, you].sort(() => Math.random() - 0.5);
    return this.build({ len: C.len, hurdles: C.hurdles, puddles: C.puddles, racers: all, mode: 'ride' });
  },
  // A betting card: five horses with real differences, and a day that suits some of them.
  card() {
    const lens = [[2400, 'Sprint'], [3200, 'Mile'], [4200, 'Long']], [len, lname] = lens[Math.floor(Math.random() * 3)];
    const soft = Math.random() < 0.45, hurdles = [0, 3, 6][Math.floor(Math.random() * 3)];
    const picks = JOCKEYS.slice().sort(() => Math.random() - 0.5).slice(0, 5), styles = ['front', 'stalker', 'closer'];
    const horses = picks.map((p, i) => ({ name: p[0], horse: p[1], silk: p[2], spd: 0.93 + Math.random() * 0.12, sta: 0.25 + Math.random() * 0.7, jmp: 0.2 + Math.random() * 0.75, mud: 0.15 + Math.random() * 0.8, style: styles[Math.floor(Math.random() * 3)], coat: RACE_COATS[i] }));
    // The crowd backs speed, and only half-reads the conditions. Read them properly and
    // you find horses the crowd has underrated.
    // The bookmakers run the race in their heads forty times to learn the real chances;
    // the crowd's money, which follows speed, pulls the odds away from them.
    const card = { len, lname, soft, hurdles, horses }, wins = [0, 0, 0, 0, 0], N = 40;
    for (let n = 0; n < N; n++) { const st = this.betRace(card); st.t = 0; let g = 0; while (!st.finished && g++ < 4000) this.step(st, 1 / 15, {}); st.racers.forEach((r, i) => { if (r.place === 1) wins[i]++; }); }
    const ex = horses.map(h => Math.exp(12 * h.spd)), es = ex.reduce((a, b) => a + b, 0);
    const ps = horses.map((h, i) => 0.6 * (wins[i] + 0.5) / (N + 2.5) + 0.4 * ex[i] / es), pt = ps.reduce((a, b) => a + b, 0);
    horses.forEach((h, i) => { h.odds = Math.max(1.1, Math.round(0.58 / (ps[i] / pt) * 10) / 10); });
    // Everyone piles onto the favourite, so its odds are shorter than they should be.
    const fav = horses.reduce((a, h) => (h.odds < a.odds ? h : a));
    fav.odds = Math.max(1.1, Math.round(fav.odds * 0.78 * 10) / 10);
    return card;
  },
  // How well a horse suits the day: speed always, stamina for long races, mud on soft
  // ground, jumping for hurdles. 'read' is how much of that a punter takes in.
  fit(day, h, read = 1) {
    let s = h.spd * 10, c = 0;
    if (day.len >= 4200) c += h.sta * 1.2; else if (day.len >= 3200) c += h.sta * 0.6;
    if (day.soft) c += h.mud * 1.2;
    c += h.jmp * day.hurdles * 0.25;
    return s + c * read;
  },
  betRace(card) {
    return this.build({ len: card.len, hurdles: card.hurdles, puddles: card.soft ? 3 : 5, soft: card.soft, racers: card.horses.map(h => Object.assign({ spd: h.spd * (1 + (Math.random() - 0.5) * 0.015) }, h, { spd: h.spd * (1 + (Math.random() - 0.5) * 0.015) })), mode: 'bet' });
  },
  // What a bet pays for 1st, 2nd and 3rd.
  payout(odds, place, stake) { return place === 1 ? stake * odds : place === 2 ? stake * (0.7 + (odds - 1) * 0.3) : place === 3 ? stake * (0.3 + (odds - 1) * 0.1) : 0; },

  // ---- Menus -----------------------------------------------------------------------------
  open() { return S.time >= 540 && S.time < 1140; },
  menu() {
    if (!this.open()) return UI.say('dara', 'The races run from nine in the morning until seven. Come back then.');
    const R = S.racing, opts = [];
    for (const k in RACE_CLASSES) {
      const c = RACE_CLASSES[k], locked = (c.needs === 'placed' && !R.placed) || (c.needs === 'open' && !R.openWon);
      opts.push({ text: `Ride: ${c.name}. Entry ${c.entry}g. Prizes ${c.prize.join(' / ')}g.${locked ? (c.needs === 'placed' ? ' (Finish in the top three of a Novice race first.)' : ' (Win an Open race first.)') : ''}`,
        locked: locked || S.gold < c.entry, fn: () => this.ride(k) });
    }
    opts.push({ text: 'Bet on a race', fn: () => this.bet() });
    opts.push({ text: 'How do I win?', fn: () => UI.say('dara', 'Everyone rides my horses, so nobody buys a win. Hold Right to gallop, but it tires them; let go to cruise and she gets her breath back. Tuck in behind another horse and yours rests. Up and Down change lanes, round mud and slow horses. Space jumps: leave it late, so you cross the hurdle at the top of the leap. Save something for the finish.', () => this.menu()) });
    opts.push({ text: 'Not today', fn() {} });
    UI.ask('dara', `Whitlock Racecourse. Five run, three are paid.${R.wins ? ` You have won ${R.wins} race${R.wins > 1 ? 's' : ''} here.` : ''}`, opts);
  },
  shop() {
    const o = Horse.owned(), opts = [];
    MOUNT_ORDER.forEach(k => {
      const m = MOUNTS[k];
      if (o.includes(k)) return;
      const locked = m.champion && !S.racing.cup;
      opts.push({ text: `${m.name} the ${m.kind}: ${m.price}g. Speed ${Math.round(m.speed * 100)}%. ${locked ? 'Only for a winner of the Whitlock Cup.' : m.blurb}`, locked: locked || S.gold < m.price,
        fn: () => { Horse.buy(k); UI.say('dara', `${m.name} is yours. Press H anywhere outdoors and ${k === 'horse' || k === 'pony' || k === 'moon' ? 'she' : 'he'} comes to you.`); } });
    });
    opts.push({ text: 'Never mind', fn() {} });
    UI.ask('dara', opts.length > 1 ? 'They are all sound. The only difference is how fast they go, and how fast they eat.' : 'You have one of everything I keep. Look after them.', opts);
  },
  choose() {
    UI.ask('dara', 'Which one do you want answering your whistle?', [
      ...Horse.owned().map(k => ({ text: `${MOUNTS[k].name} the ${MOUNTS[k].kind} (speed ${Math.round(MOUNTS[k].speed * 100)}%)${Horse.kind() === k ? ' - now' : ''}`, fn: () => { S.mount = k; Sfx.play('neigh'); toast(`${MOUNTS[k].name} will come when you press H.`); } })),
      { text: 'Never mind', fn() {} },
    ]);
  },
  ride(cls) {
    const C = RACE_CLASSES[cls];
    S.gold -= C.entry; Sfx.play('coin');
    S.riding = false;
    UI.push(this.screen(this.field(cls), r => this.settleRide(cls, r)));
  },
  settleRide(cls, place) {
    const C = RACE_CLASSES[cls], R = S.racing, prize = place <= 3 ? C.prize[place - 1] : 0;
    S.time = Math.min(S.time + 30, 1550);
    R.rides++;
    if (place <= 3) { S.gold += prize; R.placed = true; }
    if (place === 1) { R.wins++; if (cls === 'open') R.openWon = true; if (cls === 'champion') R.cup = true; }
    const name = ['first', 'second', 'third', 'fourth', 'fifth'][place - 1];
    Memory.deed(`race_${cls}_${place}`, `Rode in the ${C.name} at Whitlock Racecourse and came ${name}.`, { gossip: place === 1 && cls === 'champion' });
    if (cls === 'champion' && place === 1 && !Memory.get('cup_won')) { Memory.flag('cup_won'); return UI.say('dara', `The Whitlock Cup. ${prize} gold, and something better: if you want Silvermoon, she is yours to buy.`); }
    UI.say('dara', place === 1 ? `First! ${prize} gold. You rode that like you meant it.` : place <= 3 ? `${name[0].toUpperCase() + name.slice(1)}. ${prize} gold. Not bad at all.` : `${name[0].toUpperCase() + name.slice(1)}. Nothing for that, I am afraid. Watch your stamina, and your jumps.`);
  },
  bet() {
    const card = this.card();
    UI.push(this.betScreen(card));
  },

  // ---- Drawing the course ----------------------------------------------------------------
  drawRace(g, st, camX) {
    const W = UI.W, H = UI.H, top = 66, lh = 30;
    g.fillStyle = '#9ad0f0'; g.fillRect(0, 0, W, top);
    g.fillStyle = '#7ab060'; for (let i = 0; i < 8; i++) { const x = ((i * 90 - camX * 0.2) % (W + 90) + W + 90) % (W + 90) - 45; g.beginPath(); g.ellipse(x, top - 8, 60, 22, 0, Math.PI, 0); g.fill(); }
    // The crowd in the stand.
    g.fillStyle = '#6a4a30'; g.fillRect(0, top - 14, W, 14);
    for (let i = 0; i < 120; i++) { const x = ((i * 17 - camX * 0.6) % (W + 20) + W + 20) % (W + 20) - 10; g.fillStyle = ['#c43030', '#2a6aa8', '#e8c040', '#efe2c8', '#4a8a3a'][i % 5]; g.fillRect(Math.round(x), top - 12 + (i % 3) * 3 + (Math.floor(st.t * 4 + i) % 5 === 0 ? -1 : 0), 3, 3); }
    // The track.
    g.fillStyle = st.soft ? '#8a6a44' : '#a8845a'; g.fillRect(0, top, W, lh * LANES);
    for (let l = 1; l < LANES; l++) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, top + l * lh, W, 1); }
    g.fillStyle = '#efe6d2'; g.fillRect(0, top - 2, W, 2); g.fillRect(0, top + lh * LANES, W, 2);
    for (let x = -(camX % 40); x < W; x += 40) { g.fillStyle = '#efe6d2'; g.fillRect(Math.round(x), top + lh * LANES, 2, 6); }
    // Distance poles and the finish.
    for (let d = 500; d < st.len; d += 500) { const x = Math.round(d - camX); if (x > -10 && x < W + 10) { g.fillStyle = '#c43030'; g.fillRect(x, top - 20, 2, 18); Font.draw(g, String(Math.round((st.len - d) / 100)), x + 3, top - 20, '#2a1a10'); } }
    const fx = Math.round(st.len - camX);
    if (fx > -20 && fx < W + 20) for (let y = 0; y < lh * LANES; y += 4) { g.fillStyle = (y / 4) % 2 ? '#ffffff' : '#1a1a1a'; g.fillRect(fx, top + y, 4, 4); g.fillStyle = (y / 4) % 2 ? '#1a1a1a' : '#ffffff'; g.fillRect(fx + 4, top + y, 4, 4); }
    for (const p of st.puddles) { const x = p.x - camX; if (x < -40 || x > W + 40) continue; g.fillStyle = '#5a4428'; g.beginPath(); g.ellipse(x, top + p.lane * lh + 20, p.w / 2, 6, 0, 0, 6.29); g.fill(); g.fillStyle = 'rgba(140,180,220,0.45)'; g.beginPath(); g.ellipse(x - 4, top + p.lane * lh + 19, p.w / 3, 3, 0, 0, 6.29); g.fill(); }
    for (const h of st.hurdles) { const x = Math.round(h - camX); if (x < -10 || x > W + 10) continue; for (let l = 0; l < LANES; l++) { const y = top + l * lh + 10; g.fillStyle = '#6f4c30'; g.fillRect(x - 1, y, 2, 14); g.fillRect(x + 5, y, 2, 14); g.fillStyle = l % 2 ? '#c43030' : '#ffffff'; g.fillRect(x - 2, y + 2, 10, 3); g.fillStyle = l % 2 ? '#ffffff' : '#c43030'; g.fillRect(x - 2, y + 7, 10, 3); } }
    // Racers, back lanes first.
    [...st.racers].sort((a, b) => a.ly - b.ly).forEach(r => {
      const x = Math.round(r.x - camX), y = Math.round(top + r.ly * lh + 26), lift = r.air > 0 ? Math.round(Math.sin((1 - r.air / 0.5) * Math.PI) * 12) : 0;
      if (x < -50 || x > W + 50) return;
      const f = r.v > 5 ? Math.floor(r.frame) % 4 : 0;
      Render.shadow(g, x, y, 22);
      g.drawImage(Art.mountPal('race' + RACE_COATS.indexOf(r.coat), r.coat, DIRS.right, f, 0), x - 20, y - 30 - lift);
      if (r.me) g.drawImage(Armor.frame(DIRS.right, 0), 0, 0, 18, 19, x - 9, y - 38 - lift, 18, 19);
      else { g.fillStyle = r.silk; g.fillRect(x - 4, y - 32 - lift, 7, 7); g.fillStyle = '#f0c49a'; g.fillRect(x - 3, y - 37 - lift, 5, 5); g.fillStyle = r.silk; g.fillRect(x - 4, y - 39 - lift, 7, 3); }
      if (r.stumble > 0) Font.draw(g, '!', x - 1, y - 48 - lift, '#ff8060');
      if (r.me) { g.fillStyle = '#ffe08a'; g.fillRect(x - 2, y - 46 - lift, 4, 3); }
    });
  },

  // ---- Riding a race -----------------------------------------------------------------
  screen(st, done) {
    const ui = UI, me = { gallop: false, jump: false, lane: 0 };
    let stride = 0;
    return {
      noHud: true, race: true, state: () => st,
      update(dt) {
        const you = st.racers.find(r => r.me);
        if (st.finished) {
          st.over += dt;
          if (st.over > 0.8 && (Input.hit('act') || Input.hit('use') || Input.hit('confirm') || Input.mouse.clickL)) { ui.consumeClick(); ui.pop(); done(you.place); }
          return;
        }
        if (Input.hit('cancel') && st.t >= 0 && !you.done) { you.done = 1; you.x = -1; st.order.push(you); you.place = 5; st.racers.filter(r => r !== you).forEach(r => { r.done = 1; }); st.order = [...st.racers.filter(r => r !== you).sort((a, b) => b.x - a.x), you]; st.order.forEach((r, i) => { r.place = i + 1; }); st.finished = true; return; }
        me.gallop = Input.isDown('right');
        me.jump = Input.hit('act');
        me.lane = Input.hit('up') ? -1 : Input.hit('down') ? 1 : 0;
        Racing.step(st, dt, me);
        if (st.t > 0 && !you.done) { const s = Math.floor(you.frame / 2); if (s !== stride) { stride = s; if (you.v > 20) Sfx.play('hoof'); } }
      },
      draw(g) {
        const W = ui.W, H = ui.H, you = st.racers.find(r => r.me), camX = clamp(you.x - 150, -40, st.len - W + 120);
        Racing.drawRace(g, st, camX);
        // Stamina, place, progress.
        const by = H - 40;
        g.fillStyle = '#2a1a10'; g.fillRect(0, by - 4, W, 44);
        Font.shadow(g, 'STAMINA', 8, by, '#fff4d0');
        g.fillStyle = '#14100c'; g.fillRect(58, by - 1, 122, 8);
        g.fillStyle = you.tired ? '#d4405a' : you.stam > 0.4 ? '#6ab04c' : '#e8c04a'; g.fillRect(59, by, Math.round(120 * you.stam), 6);
        if (you.tired && !you.done) Font.shadow(g, 'BLOWN! Ease off', 186, by, '#ff9080');
        const ranked = [...st.racers].sort((a, b) => (a.done && b.done ? a.place - b.place : b.done - a.done || b.x - a.x)), pos = ranked.indexOf(you) + 1;
        Font.shadow(g, `${['1st', '2nd', '3rd', '4th', '5th'][pos - 1]}`, W - 40, by - 2, pos <= 3 ? '#ffe08a' : '#c8c0b0', '#2a1a10', 2);
        g.fillStyle = '#4a3a2a'; g.fillRect(8, by + 14, W - 60, 3);
        st.racers.forEach(r => { g.fillStyle = r.me ? '#ffffff' : r.silk; g.fillRect(8 + Math.round((W - 64) * clamp(r.x / st.len, 0, 1)), by + 12, 4, 7); });
        Font.shadow(g, 'Hold RIGHT gallop   UP/DOWN change lane   SPACE jump   ESC give up', 8, by + 24, '#c8c0b0');
        if (st.t < 0) Font.shadow(g, String(Math.ceil(-st.t)), Math.round(W / 2 - 6), 30, '#ffe08a', '#2a1a10', 3);
        else if (st.t < 0.8) Font.shadow(g, 'GO!', Math.round(W / 2 - 18), 30, '#ffe08a', '#2a1a10', 3);
        if (st.flash) Font.shadow(g, st.flash.text, Math.round(W / 2 - Font.width(st.flash.text) / 2), 50, st.flash.c);
        if (you.air <= 0) { const h = st.hurdles.find(x => x > you.x); if (h !== undefined && h - you.x < 150) Font.shadow(g, 'Hurdle!', 150 - camX + you.x - 20 + 40, 54, '#ffe08a'); }
        if (st.finished) Racing.drawResults(g, st, you.place);
      },
    };
  },
  drawResults(g, st, place) {
    const W = UI.W, x = Math.round(W / 2 - 120), y = 40;
    g.fillStyle = 'rgba(20,14,10,0.85)'; g.fillRect(x, y, 240, 118);
    Font.shadow(g, 'RESULT', x + 8, y + 6, '#ffe08a', '#2a1a10', 2);
    st.order.slice(0, 5).forEach((r, i) => Font.shadow(g, `${i + 1}. ${r.me ? 'You on Dusk' : `${r.name} on ${r.horse}`}`, x + 12, y + 28 + i * 13, r.me ? '#ffe08a' : i < 3 ? '#efe2c8' : '#8a8478'));
    Font.shadow(g, place && place <= 3 ? 'In the money!' : place ? 'Out of the money.' : '', x + 12, y + 96, place <= 3 ? '#9ad060' : '#c8c0b0');
    Font.shadow(g, 'E: continue', x + 160, y + 104, '#c8c0b0');
  },

  // ---- Betting -------------------------------------------------------------------------
  betScreen(card) {
    const ui = UI, stakes = [50, 100, 250, 500, 1000];
    let sel = 0, si = 1, race = null, bet = null, paid = null, fast = false;
    const pips = (v, lo, hi) => Math.max(1, Math.min(5, Math.round(1 + 4 * (v - lo) / (hi - lo))));
    return {
      noHud: true, race: true, card: () => card, run: () => race,
      // Read by the automated tests.
      place(i, s) { sel = i; si = s; this.go(); },
      go() {
        const stake = stakes[si];
        if (S.gold < stake) { Sfx.play('deny'); return; }
        S.gold -= stake; Sfx.play('coin');
        bet = { i: sel, stake, odds: card.horses[sel].odds };
        race = Racing.betRace(card);
        race.t = -1.5;
      },
      update(dt) {
        if (!race) {
          if (Input.hit('cancel')) { ui.pop(); return; }
          if (Input.hit('up')) { sel = (sel + 4) % 5; Sfx.play('click'); }
          if (Input.hit('down')) { sel = (sel + 1) % 5; Sfx.play('click'); }
          if (Input.hit('left')) { si = Math.max(0, si - 1); Sfx.play('click'); }
          if (Input.hit('right')) { si = Math.min(stakes.length - 1, si + 1); Sfx.play('click'); }
          if (Input.hit('act') || Input.hit('confirm')) this.go();
          return;
        }
        if (race.finished) {
          if (paid === null) {
            const r = race.racers[bet.i];
            paid = Math.round(Racing.payout(bet.odds, r.place, bet.stake));
            S.gold += paid; S.time = Math.min(S.time + 30, 1550);
            if (paid > bet.stake) { S.racing.betsWon++; Sfx.play('coin'); }
            Memory.deed('bet_' + (S.racing.bets = (S.racing.bets || 0) + 1), `Bet ${bet.stake}g on ${card.horses[bet.i].horse} at Whitlock Racecourse; ${paid ? `it paid ${paid}g` : 'it lost'}.`);
          }
          race.over += dt;
          if (race.over > 0.8 && (Input.hit('act') || Input.hit('use') || Input.hit('confirm') || Input.mouse.clickL)) { ui.consumeClick(); ui.pop(); }
          return;
        }
        fast = Input.isDown('act');
        for (let i = 0; i < (fast ? 3 : 1); i++) Racing.step(race, dt, { gallop: false, jump: false, lane: 0 });
      },
      draw(g) {
        const W = ui.W, H = ui.H;
        if (race) {
          const lead = [...race.racers].sort((a, b) => b.x - a.x)[0], camX = clamp(lead.x - 260, -40, race.len - W + 120);
          Racing.drawRace(g, race, camX);
          const pick = race.racers[bet.i];
          g.fillStyle = '#2a1a10'; g.fillRect(0, H - 44, W, 44);
          Font.shadow(g, `Your bet: ${bet.stake}g on ${pick.horse} at ${bet.odds.toFixed(1)}`, 8, H - 38, '#ffe08a');
          const ranked = [...race.racers].sort((a, b) => b.x - a.x);
          Font.shadow(g, `${pick.horse} is ${['1st', '2nd', '3rd', '4th', '5th'][ranked.indexOf(pick)]}`, 8, H - 26, '#efe2c8');
          Font.shadow(g, 'Hold SPACE to watch faster', 8, H - 14, '#c8c0b0');
          // Mark your horse.
          const x = Math.round(pick.x - camX), y = Math.round(66 + pick.ly * 30 + 26);
          g.fillStyle = '#ffe08a'; g.fillRect(x - 2, y - 48, 4, 3);
          if (race.finished) {
            Racing.drawResults(g, race, 0);
            Font.shadow(g, paid ? `${pick.horse} came ${['first', 'second', 'third'][pick.place - 1]}. You collect ${paid}g.` : `${pick.horse} came ${['first', 'second', 'third', 'fourth', 'fifth'][pick.place - 1]}. Your stake is gone.`, Math.round(W / 2 - 112), 136, paid ? '#9ad060' : '#ff9080');
          }
          return;
        }
        // The form card.
        g.fillStyle = '#2a2018'; g.fillRect(0, 0, W, H);
        g.fillStyle = '#efe2c8'; g.fillRect(10, 8, W - 20, H - 16);
        Font.draw(g, 'THE CARD', 18, 14, '#2a1a10', 2);
        Font.draw(g, `${card.lname} (${card.len})   ${card.soft ? 'Soft, muddy ground' : 'Firm ground'}   ${card.hurdles ? card.hurdles + ' hurdles' : 'No hurdles'}`, 18, 34, '#7a2f30');
        const cols = [['Horse', 18], ['Speed', 150], ['Stamina', 196], ['Jumping', 250], ['Mud', 304], ['Runs', 340], ['Odds', 396]];
        cols.forEach(([t, x]) => Font.draw(g, t, x, 50, '#5a4a3a'));
        card.horses.forEach((h, i) => {
          const y = 64 + i * 20, on = i === sel;
          if (on) { g.fillStyle = '#e0c890'; g.fillRect(14, y - 3, W - 28, 18); }
          g.fillStyle = h.silk; g.fillRect(18, y, 6, 8);
          Font.draw(g, `${h.horse}`, 28, y, '#2a1a10'); Font.draw(g, h.name, 28, y + 8, '#7a6a5a');
          [[h.spd, 0.93, 1.05, 150], [h.sta, 0.25, 0.95, 196], [h.jmp, 0.2, 0.95, 250], [h.mud, 0.15, 0.95, 304]].forEach(([v, lo, hi, x]) => { const n = pips(v, lo, hi); for (let p = 0; p < 5; p++) { g.fillStyle = p < n ? '#7a2f30' : '#c8b898'; g.fillRect(x + p * 7, y + 2, 5, 5); } });
          Font.draw(g, { front: 'In front', stalker: 'Mid-pack', closer: 'Late run' }[h.style], 340, y, '#2a1a10');
          Font.draw(g, h.odds.toFixed(1), 400, y, '#2a1a10');
        });
        const h = card.horses[sel];
        Font.draw(g, `Stake: < ${stakes[si]}g >   Pays ${Math.round(h.odds * stakes[si])}g to win, ${Math.round(Racing.payout(h.odds, 2, stakes[si]))}g for 2nd, ${Math.round(Racing.payout(h.odds, 3, stakes[si]))}g for 3rd`, 18, 172, '#2a1a10');
        Font.draw(g, 'The crowd bets on speed. Long races need stamina, soft ground', 18, 186, '#5a4a3a');
        Font.draw(g, 'needs a mudder, hurdles need a jumper. Late runners need a long race.', 18, 196, '#5a4a3a');
        Font.draw(g, 'UP/DOWN pick a horse   LEFT/RIGHT stake   E place the bet   ESC leave', 18, 210, '#5a4a3a');
        Font.draw(g, `Your gold: ${S.gold}`, 18, 224, S.gold < stakes[si] ? '#c43030' : '#2a1a10');
      },
    };
  },
};

// The race board sits outside the course.
(() => {
  const build = World.build.bind(World);
  World.build = function () {
    build();
    const m = this.maps.village;
    for (const [x, y] of [[11, 20], [12, 19], [4, 20], [11, 21], [13, 20]]) {
      if (!this.solid(m, x, y) && !this.at(m, x, y) && !this.warpAt(m, x, y)) { this.add(m, 'raceboard', x, y); break; }
    }
  };
  Actions.races = () => Racing.menu();
})();

// ---- Your mounts graze on the farm ------------------------------------------------------
// Every mount you own wanders the farm (except the one you are riding). Walk up to one and
// press E to saddle it: it becomes the one that answers H, and you ride it straight away.
const Herd = {
  list: [], home: null,
  free(m, x, y) { return !World.solid(m, x, y) && !World.at(m, x, y) && !Farm.soilAt(m, x, y) && World.g(m, x, y) !== T.W && !World.warpAt(m, x, y); },
  // A pasture: the open grass east of the house if it is clear, or the clearest patch left.
  pasture(m) {
    const score = (x0, y0) => { let n = 0; for (let j = 0; j < 7; j++) for (let i = 0; i < 11; i++) if (this.free(m, x0 + i, y0 + j)) n++; return n; };
    for (const [x, y] of [[45, 16], [30, 18], [22, 24], [30, 30], [8, 26]]) if (score(x, y) >= 55) return { x: x + 5, y: y + 3 };
    let best = null;
    for (let y = 4; y < m.h - 8; y += 3) for (let x = 4; x < m.w - 12; x += 3) { const s = score(x, y); if (!best || s > best.s) best = { s, x: x + 5, y: y + 3 }; }
    return best;
  },
  riding() { return S.riding && Horse.owned().length ? Horse.kind() : null; },
  sync() {
    const m = World.maps.farm, ride = this.riding(), want = Horse.owned().filter(k => k !== ride);
    const dismounted = this.lastRide && !ride ? this.lastRide : null;
    this.lastRide = ride;
    this.list = this.list.filter(a => want.includes(a.kind));
    for (const k of want) {
      if (this.list.some(a => a.kind === k)) continue;
      if (!this.home || !this.free(m, this.home.x, this.home.y)) this.home = this.pasture(m);
      // A mount you just got down from stays where you left it.
      const here = Player.map === m && dismounted === k;
      let x = here ? Player.x : (this.home.x + Math.round((Math.random() - 0.5) * 6)) * TILE + 8, y = here ? Player.y : (this.home.y + Math.round((Math.random() - 0.5) * 4)) * TILE + 12;
      if (!here && !this.free(m, Math.floor(x / TILE), Math.floor((y - 2) / TILE))) { x = this.home.x * TILE + 8; y = this.home.y * TILE + 12; }
      this.list.push({ kind: k, x, y, tx: x, ty: y, t: Math.random() * 3, dir: DIRS.right, moving: false, frame: 0 });
    }
  },
  update(dt) {
    const m = World.maps.farm;
    this.sync();
    for (const a of this.list) {
      // Ground tilled under its hooves: it steps aside onto the nearest clear grass.
      const cx = Math.floor(a.x / TILE), cy = Math.floor((a.y - 2) / TILE);
      if (!this.free(m, cx, cy)) {
        a.offT = (a.offT || 0) + dt;
        if (a.offT > 0.8) {
          a.offT = 0;
          outer: for (let r = 1; r <= 5; r++) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (this.free(m, cx + i, cy + j)) { a.x = a.tx = (cx + i) * TILE + 8; a.y = a.ty = (cy + j) * TILE + 12; a.t = 1; break outer; }
        }
        continue;
      }
      a.offT = 0;
      a.t -= dt;
      if (a.t <= 0) {
        a.t = 2 + Math.random() * 5;
        if (Math.random() < 0.35) { a.tx = a.x; a.ty = a.y; continue; } // stop to graze
        // Somewhere clear in the pasture, or failing that, a few steps from where it stands.
        const h = this.home || { x: Math.floor(a.x / TILE), y: Math.floor(a.y / TILE) };
        for (let k = 0; k < 10; k++) {
          const near = k >= 5, bx = near ? Math.floor(a.x / TILE) : h.x, by = near ? Math.floor((a.y - 2) / TILE) : h.y;
          const tx = bx + Math.round((Math.random() - 0.5) * (near ? 6 : 12)), ty = by + Math.round((Math.random() - 0.5) * (near ? 4 : 8));
          if (this.free(m, tx, ty)) { a.tx = tx * TILE + 8; a.ty = ty * TILE + 12; break; }
        }
      }
      const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy);
      a.moving = d > 2;
      if (!a.moving) continue;
      const nx = a.x + dx / d * 20 * dt, ny = a.y + dy / d * 20 * dt;
      if (!this.free(m, Math.floor(nx / TILE), Math.floor((ny - 2) / TILE))) { a.tx = a.x; a.ty = a.y; a.t = 0.5; continue; }
      a.x = nx; a.y = ny; a.frame += dt * 5;
      a.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? DIRS.right : DIRS.left) : (dy > 0 ? DIRS.down : DIRS.up);
    }
  },
  img(a, layer) { return Art.mount(a.kind, a.dir, a.moving ? Math.floor(a.frame) % 4 : 0, layer); },
  draw(g, items) {
    for (const a of this.list) items.push({ y: a.y, draw: () => {
      Render.shadow(g, a.x, a.y, 26);
      const x = Math.round(a.x) - 20, y = Math.round(a.y) - 30;
      g.drawImage(this.img(a, 0), x, y);
      if (a.dir === DIRS.down) g.drawImage(this.img(a, 1), x, y);
    } });
  },
  saddle(a) {
    const M = MOUNTS[a.kind];
    if (S.riding) S.riding = false;
    S.mount = a.kind;
    this.list = this.list.filter(o => o !== a);
    Player.x = a.x; Player.y = a.y;
    Horse.mount();
    if (!S.riding) { this.sync(); toast(`${M.name} will come when you press H.`); return; }
    toast(`${M.name} the ${M.kind.toLowerCase()} is your ride now. Press H to get down.`);
  },
};
(() => {
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) { tick(dt); if (S && Horse.owned().length) Herd.update(dt || 1 / 60); };
  const drawWorld = Story.drawWorld.bind(Story);
  Story.drawWorld = function (g, m, items) { drawWorld(g, m, items); if (m.id === 'farm') Herd.draw(g, items); };
  // Walk up to a grazing mount and press E to saddle it.
  const scan = Interact.scan.bind(Interact);
  Interact.scan = function () {
    const base = scan();
    if (Player.map.id !== 'farm' || !Herd.list.length) return base;
    const t = Player.target(), cx = t.x * TILE + 8, cy = t.y * TILE + 8;
    const near = Herd.list.filter(a => Math.hypot(a.x - Player.x, a.y - Player.y) < 30).sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy))[0];
    // Only when the mount is nearer to where you face than anything else on offer.
    const herdD = near && Math.hypot(near.x - cx, near.y - 6 - cy), baseD = base ? Math.hypot(base.tile[0] * TILE + 8 - cx, base.tile[1] * TILE + 8 - cy) : Infinity;
    if (!near || herdD >= baseD || herdD > 20) return base;
    const M = MOUNTS[near.kind];
    return { tile: [Math.floor(near.x / TILE), Math.floor(near.y / TILE)], label: `Ride ${M.name} the ${M.kind}`, sprite: () => ({ img: Herd.img(near, 0), x: Math.round(near.x) - 20, y: Math.round(near.y) - 30 }), ax: near.x, ay: near.y - 34, run: () => Herd.saddle(near) };
  };
})();

// ---- Horses at large on the farm ---------------------------------------------------------------------
// Grazing mounts roam the whole farm, walking round fences and trees and never over tilled ground. Often
// they go looking for wild grass (weeds), wander up to it, and eat it: heads down, munching, bits flying,
// until the weed is gone. Then they are full for 10-20 minutes and just roam and nibble, so the farm keeps
// some wild grass. At night they mostly stand and doze.
(() => {
  const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const tileOf = a => [Math.floor(a.x / TILE), Math.floor((a.y - 2) / TILE)];
  Object.assign(Herd, {
    claims: new Set(),
    // Every clear tile within reach, with the way there.
    reach(m, sx, sy, maxD) {
      const prev = new Map([[key(sx, sy), null]]), dist = new Map([[key(sx, sy), 0]]), q = [[sx, sy]];
      for (let h = 0; h < q.length; h++) {
        const [x, y] = q[h], d = dist.get(key(x, y)); if (d >= maxD) continue;
        for (const [a, b] of NB) { const nx = x + a, ny = y + b, k = key(nx, ny); if (dist.has(k) || !this.free(m, nx, ny)) continue; dist.set(k, d + 1); prev.set(k, key(x, y)); q.push([nx, ny]); }
      }
      return { prev, dist, order: q };
    },
    route(r, k) { const out = []; for (let c = k; r.prev.get(c) !== null && r.prev.get(c) !== undefined; c = r.prev.get(c)) out.push(c.split(',').map(Number)); return out.reverse(); },
    release(a) { if (a.weed) this.claims.delete(key(a.weed[0], a.weed[1])); a.weed = null; },
    // Somewhere with room to wander, not a pocket of grass boxed in by soil and stones.
    roomy(m, x, y) { return this.free(m, x, y) && this.reach(m, x, y, 4).order.length >= 10; },
    rehome(m, a, cx, cy) {
      for (let rr = 1; rr <= 10; rr++) for (let j = -rr; j <= rr; j++) for (let i = -rr; i <= rr; i++) {
        if (Math.max(Math.abs(i), Math.abs(j)) !== rr || !this.roomy(m, cx + i, cy + j)) continue;
        a.x = a.tx = (cx + i) * TILE + 8; a.y = a.ty = (cy + j) * TILE + 12; a.path = null; return true;
      }
      const h = this.pasture(m); if (h) { a.x = a.tx = h.x * TILE + 8; a.y = a.ty = h.y * TILE + 12; a.path = null; return true; }
      return false;
    },
    decide(m, a) {
      const night = S.time >= 1200 || S.time < 360;
      a.t = night ? 6 + Math.random() * 6 : 1.5 + Math.random() * 3;
      if (night && Math.random() < 0.75) return;
      const [cx, cy] = tileOf(a), r = this.reach(m, cx, cy, 18), roll = Math.random();
      // Boxed in (by new soil, say): off to open grass.
      if (r.order.length < 10) { this.release(a); this.rehome(m, a, cx, cy); a.t = 1; return; }
      // Hungry: the nearest wild grass nobody else is after. After a meal a horse is full for a good while.
      if (roll < 0.55 && !(a.full > 0)) {
        for (const [x, y] of r.order) for (const [dx, dy] of NB) {
          const o = World.at(m, x + dx, y + dy);
          if (!o || o.type !== 'weed' || this.claims.has(key(o.x, o.y))) continue;
          this.claims.add(key(o.x, o.y)); a.weed = [o.x, o.y]; a.path = this.route(r, key(x, y)); a.hurry = true;
          return;
        }
      }
      // Restless: a stroll somewhere else on the farm.
      if (roll < 0.88) {
        const far = r.order.filter(([x, y]) => r.dist.get(key(x, y)) >= 5);
        if (far.length) { const [x, y] = far[Math.floor(Math.random() * far.length)]; a.path = this.route(r, key(x, y)); a.hurry = false; return; }
      }
      a.graze = 2 + Math.random() * 4; // nibbling the grass where it stands
    },
    update(dt) {
      const m = World.maps.farm;
      this.sync();
      for (const a of this.list) {
        const [cx, cy] = tileOf(a);
        // Ground tilled under its hooves: it steps aside onto the nearest clear grass.
        if (!this.free(m, cx, cy) && !a.path) {
          a.offT = (a.offT || 0) + dt;
          if (a.offT > 0.8) {
            a.offT = 0; this.release(a); this.rehome(m, a, cx, cy); a.t = 1;
          }
          continue;
        }
        a.offT = 0;
        if (a.full > 0) a.full -= dt;
        // Eating.
        if (a.eat > 0) {
          a.moving = false; a.eat -= dt; a.bitT = (a.bitT || 0) - dt;
          const w = a.weed && World.at(m, a.weed[0], a.weed[1]);
          if (!w || w.type !== 'weed') { a.eat = 0; this.release(a); continue; }
          const mx = a.x + DX[a.dir] * 16, my = a.y + DY[a.dir] * 8 - 2;
          if (a.bitT <= 0) {
            a.bitT = 0.22; VFX.emit('dust', mx, my, { vx: (Math.random() - 0.5) * 30, vy: -20 - Math.random() * 20, t: 0.5, color: Math.random() < 0.5 ? '#7ab05a' : '#5a9a3a' });
            a.munch = (a.munch || 0) - 1;
            if (a.munch <= 0) { a.munch = 6; if (Player.map === m && Math.hypot(Player.x - a.x, Player.y - a.y) < 110) Sfx.play('eat'); }
          }
          if (a.eat <= 0) { World.remove(m, w); VFX.burst('dust', w.x * TILE + 8, w.y * TILE + 10, 8, 30); this.release(a); a.t = 2 + Math.random() * 3; a.full = 600 + Math.random() * 600; }
          continue;
        }
        // Walking somewhere.
        if (a.path) {
          if (!a.path.length) {
            a.path = null; a.moving = false;
            if (a.weed) {
              const w = World.at(m, a.weed[0], a.weed[1]);
              if (w && w.type === 'weed' && Math.abs(w.x - cx) + Math.abs(w.y - cy) === 1) {
                const dx = w.x - cx, dy = w.y - cy; a.dir = dx > 0 ? DIRS.right : dx < 0 ? DIRS.left : dy > 0 ? DIRS.down : DIRS.up;
                a.eat = 3 + Math.random() * 2.5; a.munch = 0;
              } else this.release(a);
            }
            continue;
          }
          const [nx, ny] = a.path[0];
          if (!this.free(m, nx, ny)) { a.path = null; this.release(a); a.t = 0.5; continue; }
          const gx = nx * TILE + 8, gy = ny * TILE + 12, dx = gx - a.x, dy = gy - a.y, d = Math.hypot(dx, dy), sp = (a.hurry ? 26 : 18) * dt;
          a.moving = true; a.frame += dt * (a.hurry ? 6 : 5);
          a.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? DIRS.right : DIRS.left) : (dy > 0 ? DIRS.down : DIRS.up);
          if (d <= sp) { a.x = gx; a.y = gy; a.path.shift(); } else { a.x += dx / d * sp; a.y += dy / d * sp; }
          a.tx = a.x; a.ty = a.y;
          continue;
        }
        // Standing about.
        a.moving = false;
        if (a.graze > 0) a.graze -= dt;
        a.t -= dt;
        if (a.t <= 0) this.decide(m, a);
      }
    },
    draw(g, items) {
      const now = performance.now() / 1000;
      for (const a of this.list) items.push({ y: a.y, draw: () => {
        Render.shadow(g, a.x, a.y, 26);
        const eating = a.eat > 0 || a.graze > 0, bob = eating && Math.sin(now * 9 + a.x) > 0 ? 1 : 0;
        const x = Math.round(a.x) - 20, y = Math.round(a.y) - 30 + bob;
        // A tuft of grass in front of its nose, getting smaller as it goes.
        if (a.eat > 0 && a.dir !== DIRS.up) {
          const tx = Math.round(a.x + DX[a.dir] * 15), ty = Math.round(a.y + DY[a.dir] * 6), n = Math.max(1, Math.ceil(a.eat));
          g.fillStyle = '#4f9642'; for (let i = 0; i < n; i++) g.fillRect(tx - 3 + i * 2, ty - 3 - (i % 2), 1, 4 + (i % 2));
          g.fillStyle = '#74b84d'; g.fillRect(tx - 2, ty - 1, n + 1, 1);
        }
        g.drawImage(this.img(a, 0), x, y);
        if (a.dir === DIRS.down) g.drawImage(this.img(a, 1), x, y);
      } });
    },
  });
})();
