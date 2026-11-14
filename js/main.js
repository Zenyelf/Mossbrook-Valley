'use strict';
// Boot, the frame loop, the clock, sleeping, and saving.

const SAVE_KEY = 'mossbrook_save_v1';
const MINUTE_STEP_SECONDS = 7;

const INTRO = [
  'Your grandfather farmed the Ashgrove plot for fifty-one years.',
  'Last winter he walked out into the snow and did not come back. He left his boots by the door.',
  'King Oswin the Evergreen has ruled longer than anyone alive can remember. In all that time, the harvest has never once failed.',
  'You are Tam Ashgrove. You are sixteen. You have a bag of seeds, a rusty hoe, and a farm no one has touched in a year.',
];

const Game = {
  canvas: null, g: null, scale: 2, W: 480, H: 270, last: 0, clockT: 0,
  fadeState: null, fadeA: 0, inTitle: false, pulseT: 0,

  boot() {
    this.canvas = document.getElementById('game');
    this.g = this.canvas.getContext('2d');
    this.resize();
    addEventListener('resize', () => this.resize());
    Input.attach(this.canvas, (cx, cy) => ({ x: cx / this.scale, y: cy / this.scale }));
    this.toTitle();
    this.canvas.focus();
    requestAnimationFrame(t => this.frame(t));
  },

  resize() {
    const w = innerWidth, h = innerHeight;
    this.scale = Math.max(1, Math.round(Math.min(w / 480, h / 270)));
    this.W = Math.ceil(w / this.scale); this.H = Math.ceil(h / this.scale);
    this.canvas.width = this.W; this.canvas.height = this.H;
    this.canvas.style.width = this.W * this.scale + 'px';
    this.canvas.style.height = this.H * this.scale + 'px';
    this.g.imageSmoothingEnabled = false;
    UI.W = this.W; UI.H = this.H;
  },

  fresh() {
    Arena.reset();
    S = newState();
    Foes.mapId = null;
    World.build();
    Render.baked = {};
    People.init();
    Crime.tendGardens(false);
    FX.list = [];
    UI.toasts = [];
  },

  toTitle() {
    this.fresh();
    this.inTitle = true;
    S.time = 640; S.weather = 'sun';
    Player.place('village', 32 * TILE + 8, 22 * TILE, DIRS.down);
    this.titlePan = 0;
    People.settle();
    UI.stack.length = 0;
    UI.push(UI.title());
  },

  newGame() {
    this.fresh();
    this.inTitle = false;
    const start = () => {
      for (const [id, n] of [['hoe', 1], ['can', 1], ['axe', 1], ['pick', 1], ['scythe', 1], ['rod', 1], ['turnip_seed', 15]]) Inv.add(id, n, 0, true);
      Quests.pulse();
    };
    start();
    Player.place('house', 8 * TILE, 8 * TILE, DIRS.up);
    S.weather = 'sun'; S.tomorrow = 'sun';
    Farm.spawnDaily();
    Quests.rollBoard();
    UI.push(UI.slides(INTRO, () => {
      UI.say(null, 'There is a letter on the table.');
    }));
    this.save();
  },

  hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } },

  save() {
    try {
      // The mine is regenerated on every visit, so saves resume at its entrance.
      S.player = Player.map.transient ? { map: 'ironback', x: 60 * TILE + 8, y: 7 * TILE + 12, dir: DIRS.down } : { map: Player.map.id, x: Player.x, y: Player.y, dir: Player.dir };
      const pit = Arena.active && Arena.saved && Arena.state !== 'over' ? Arena.snapshot() : null;
      localStorage.setItem(SAVE_KEY, JSON.stringify({ S: Arena.active ? Arena.cleanState() : S, world: World.serialize(), pit }));
      return true;
    } catch (e) { console.warn('save failed', e); return false; }
  },

  load() {
    let data;
    try { data = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return false; }
    if (!data || !data.S) return false;
    Arena.reset();
    // Fill in anything added to the game since this save was made.
    const base = newState();
    S = Object.assign({}, base, data.S);
    S.npc = Object.assign(base.npc, data.S.npc);
    S.skills = Object.assign(base.skills, data.S.skills);
    S.rep = Object.assign(base.rep, data.S.rep);
    S.hp = Math.min(S.hp, Combat.maxHP());
    World.build();
    World.deserialize(data.world);
    World.applyFlags();
    Codex.sweep();
    Crime.migrate();
    Quests.seedCounts();
    Crime.tendGardens(false);
    Render.baked = {};
    People.init();
    People.settle();
    Player.place(S.player.map, S.player.x, S.player.y, S.player.dir);
    // In the middle of a Pit run when the game was closed: back into the Pit.
    if (data.pit) Arena.resume(data.pit);
    this.inTitle = false;
    return true;
  },

  spend(n) {
    const was = S.energy;
    S.energy -= n;
    if (was > 0 && S.energy <= 0) toast('You are exhausted. Go to bed soon.');
    if (S.energy <= -15) { toast('You collapse from exhaustion.'); this.endDay(true); }
  },

  fade(fn) { this.fadeState = 'out'; this.fadeA = 0; this.fadeFn = fn; },

  warp(w) {
    Sfx.play('door');
    this.fade(() => {
      Player.place(w.to, w.tx * TILE + 8, w.ty * TILE + 12, w.dir);
      Player.lastX = Player.lastY = null;
    });
  },

  // Ends the day: sells goods, grows crops, spreads gossip, moves the calendar, saves.
  endDay(passedOut) {
    if (this.fadeState) return;
    this.fade(() => {
      const lines = [{ t: `End of ${SEASONS[S.season]} ${S.day}` }];
      let earned = 0;
      S.shipped.forEach(s => {
        const v = Inv.price(s) * s.n; earned += v;
        lines.push({ t: `${s.n} x ${(s.q ? qualityNames[s.q] + ' ' : '') + ITEMS[s.id].name}`, r: `${v}g`, c: C.soft });
      });
      if (lines.length > 11) lines.splice(11, lines.length - 11, { t: '...and more.', c: C.soft });
      if (earned) lines.push({ t: 'Earned', r: `${earned}g`, c: C.good });
      S.gold += earned; S.shipped = [];

      if (passedOut === 'defeat') {
        const lost = Math.min(Math.floor(S.gold * 0.15), 2000);
        S.gold -= lost;
        const stacks = S.inv.map((s, i) => [s, i]).filter(([s]) => s && !Inv.keep(s.id) && ITEMS[s.id].kind !== 'ammo');
        const dropped = [];
        for (let i = 0; i < 2 && stacks.length; i++) {
          const [s, idx] = stacks.splice(Math.floor(Math.random() * stacks.length), 1)[0];
          const n = Math.ceil(s.n / 2); s.n -= n; if (s.n <= 0) S.inv[idx] = null;
          dropped.push(`${n} ${ITEMS[s.id].name}`);
        }
        lines.push({ t: 'You were beaten, and dragged home at dawn.', c: C.bad });
        lines.push({ t: `Lost ${lost}g${dropped.length ? ', ' + dropped.join(', ') : ''}.`, c: C.bad });
        Memory.deed('defeated_' + absDay(), `Beaten and left for dead in ${Player.map.name}.`, { once: false, gossip: true });
      } else if (passedOut) {
        const lost = Math.min(Math.floor(S.gold * 0.1), 500);
        S.gold -= lost;
        lines.push({ t: lost ? `You were found in the night. It cost you ${lost}g.` : 'You were found in the night and carried home.', c: C.bad });
        Memory.deed('collapsed_' + absDay(), 'Collapsed from exhaustion and had to be carried home.', { once: false, gossip: true });
      }

      const died = Farm.newDay();
      if (died) lines.push({ t: `${died} crop${died > 1 ? 's' : ''} died of thirst.`, c: C.bad });
      Farm.chickensNewDay();
      Memory.spreadGossip();
      Crime.newDay(lines);
      Story.newDay(lines);
      DLC.newDay(lines);

      const b = S.board;
      if (b && b.taken && !b.done && absDay() >= b.due) {
        Trust.add(b.npc, -30);
        Memory.deed('board_failed_' + absDay(), `Failed to deliver a promised order to ${NPCS[b.npc].name}.`, { once: false, witness: [b.npc] });
        lines.push({ t: `${NPCS[b.npc].name} waited for an order you never brought.`, c: C.bad });
        S.board = null;
      }

      S.day++;
      let newSeason = false;
      if (S.day > DAYS_IN_SEASON) {
        S.day = 1; S.season++; newSeason = true;
        if (S.season > 3) { S.season = 0; S.year++; }
      }
      S.weather = S.tomorrow; S.tomorrow = rollWeather(S.season);
      if (newSeason) {
        const lost = Farm.killOutOfSeason();
        lines.push({ t: `${SEASONS[S.season]} has come.`, c: C.blue });
        if (lost) lines.push({ t: `${lost} crop${lost > 1 ? 's' : ''} withered with the season.`, c: C.bad });
      }
      Farm.morningWater();
      Farm.spawnDaily();
      if (!S.board || S.board.done || !S.board.taken) Quests.rollBoard();

      S.time = 360;
      S.energy = passedOut ? Math.floor(S.maxEnergy * 0.6) : S.maxEnergy;
      S.hp = passedOut === 'defeat' ? Math.floor(Combat.maxHP() * 0.5) : Combat.maxHP();
      S.stam = Combat.maxStam();
      Combat.sneaking = false; Combat.roll = 0; S.riding = false; Combat.status = {};
      S.can = CAN_CAPACITY[S.tools.can];
      Player.place('house', 9 * TILE + 8, 5 * TILE + 12, DIRS.down);
      People.morning();
      Crime.morning(lines);
      this.clockT = 0;
      this.save();
      lines.push({ t: S.weather === 'sun' ? 'The morning is clear.' : `The morning brings ${S.weather}.`, c: C.soft });
      UI.push(UI.summary(lines, () => Quests.pulse()));
    });
  },

  // Losing to the Crown's guards means the gaol, not your own bed.
  defeat() { Sfx.play('defeat'); if (Foes.list.some(f => f.def.guard)) return Crime.arrest(true); this.endDay('defeat'); },

  tickClock(dt) {
    if (Arena.active) return;
    this.clockT += dt;
    if (this.clockT < MINUTE_STEP_SECONDS) return;
    this.clockT -= MINUTE_STEP_SECONDS;
    S.time += 10;
    People.tick();
    // At 2:00 the night holds still: stay out as long as you like. The day ends when you sleep.
    if (S.time >= 1560) {
      S.time = 1560;
      if (this.lateNoted !== absDay()) { this.lateNoted = absDay(); toast('It is 2:00 in the morning. Stay up as long as you like; the day ends when you sleep.'); }
    }
  },

  updateChickens(dt) {
    const m = World.maps.farm;
    S.chickens.forEach(c => {
      c.t -= dt;
      if (c.t <= 0) {
        c.t = 1 + Math.random() * 3;
        c.tx = c.x + (Math.random() - 0.5) * 48; c.ty = c.y + (Math.random() - 0.5) * 48;
      }
      const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy);
      c.moving = d > 3;
      if (!c.moving) return;
      const nx = c.x + dx / d * 16 * dt, ny = c.y + dy / d * 16 * dt;
      if (nx < 40 * TILE || nx > 53 * TILE || ny < 33 * TILE || ny > 40 * TILE || World.solid(m, Math.floor(nx / TILE), Math.floor(ny / TILE))) { c.t = 0; return; }
      c.x = nx; c.y = ny; c.dir = dx < 0 ? 0 : 1;
    });
  },

  update(dt) {
    if (this.fadeState) {
      this.fadeA += dt / 0.16 * (this.fadeState === 'out' ? 1 : -1);
      if (this.fadeState === 'out' && this.fadeA >= 1) {
        this.fadeA = 1; const fn = this.fadeFn; this.fadeFn = null; fn(); this.fadeState = 'in';
      } else if (this.fadeState === 'in' && this.fadeA <= 0) { this.fadeA = 0; this.fadeState = null; }
      UI.update(0);
      return;
    }
    if (Input.mouse.moved) UI.mouseIdle = false;
    if (Input.isDown('up') || Input.isDown('down') || Input.isDown('left') || Input.isDown('right')) UI.mouseIdle = true;

    if (UI.busy()) { UI.update(dt); if (this.inTitle) People.update(dt); return; }

    UI.update(dt);
    if (this.hotbarClick()) return;
    if (Input.hit('menu') || Input.hit('cancel')) { Sfx.play('open'); UI.push(UI.menu()); return; }
    if (Input.hit('map')) { Sfx.play('open'); UI.push(UI.menu(UI.TABS.indexOf('Map'))); return; }
    Player.update(dt);
    People.update(dt);
    Foes.update(dt);
    this.updateChickens(dt);
    this.tickClock(dt);
    Interact.focus = Interact.scan();
    Interact.useHint = Player.usePrompt();
    Crime.update(dt);
    DLC.update(dt);
    Arena.update(dt);
    this.pulseT -= dt;
    if (this.pulseT <= 0) { this.pulseT = 0.5; Quests.pulse(); }
  },

  hotbarClick() {
    if (!Input.mouse.clickL) return false;
    const hx = Math.round((this.W - 216) / 2), hy = this.H - 28;
    const { x, y } = Input.mouse;
    if (y < hy - 2 || y > hy + 22 || x < hx - 2 || x > hx + 220) return false;
    const i = Math.floor((x - hx) / 22);
    if (i >= 0 && i < 10) { S.sel = i; Sfx.play('click'); }
    Input.mouse.clickL = false;
    return true;
  },

  frame(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000 || 0);
    this.last = now;
    // Whatever goes wrong in one frame, the next frame still comes: the game never freezes on an error.
    try { this.step(dt); Sfx.music(); }
    catch (e) {
      console.error(e);
      try { localStorage.setItem('mossbrook_last_error', new Date().toISOString() + ' ' + (e && e.stack || e)); } catch (e2) { /* */ }
      if (!this.warned) { this.warned = true; try { toast('Something went wrong, but the game kept going.'); } catch (e3) { /* */ } }
      Input.endFrame();
    }
    requestAnimationFrame(t => this.frame(t));
  },

  step(dt) {
    this.update(dt);
    const g = this.g;
    Render.world(g, this.W, this.H, dt);
    UI.draw(g);
    if (this.fadeA > 0) { g.fillStyle = `rgba(20,16,12,${clamp(this.fadeA, 0, 1)})`; g.fillRect(0, 0, this.W, this.H); }
    Input.endFrame();
  },
};

Game.boot();
