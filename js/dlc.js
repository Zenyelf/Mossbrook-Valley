'use strict';
// DLC systems: Watcher Eyes and alarms, smoke, the cannon duel at sea, and the
// actions behind every new door, cage and lever.

Object.assign(ACT_LABEL, { lever: 'Pull lever', hatch: 'Trapdoor', sigil: 'Sigil door', celldoor: 'Cell door', prisoner: 'Talk', uniform: 'Search locker', kessick: 'Kessick\'s desk', cage: 'Break the cage', sail: 'Set sail', row: 'Row', shiphatch: 'Go below' });

// Pip and Corvin come back for the Black Wing even after the Crown has fallen.
const pipWas = NPCS.pip.gone, corvinWas = NPCS.corvin.gone;
NPCS.pip.gone = () => (S && S.quests.g1 && !qDone('g4') ? false : pipWas());
NPCS.corvin.gone = () => (S && S.quests.g2 ? false : corvinWas());

const EYE_RANGE = 110, EYE_FOV = 0.36, EYE_TRIP = 0.6;

const DLC = {
  alarm: 0, smoke: 0,

  eyes(m) { const out = []; m.objs.forEach(o => { if (o.type === 'eye') out.push(o); }); return out; },
  eyesOn() { return !Memory.get('eyes_off'); },

  eyeSees(o) {
    const ex = o.x * TILE + 8 + Math.cos(o.base) * 10, ey = o.y * TILE + 8 + Math.sin(o.base) * 10;
    const dx = Player.x - ex, dy = Player.y - 8 - ey, d = Math.hypot(dx, dy);
    if (d > EYE_RANGE * (Combat.sneaking ? 0.85 : 1)) return false;
    let diff = Math.atan2(dy, dx) - o.a;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    return Math.abs(diff) <= EYE_FOV && Crime.los(Player.map, ex, ey, Player.x, Player.y - 8);
  },

  update(dt) {
    this.smoke = Math.max(0, this.smoke - dt);
    const m = Player.map;
    if (m.id !== 'blackwing') { this.alarm = 0; return; }
    if (this.alarm > 0) { this.alarm -= dt; if (this.alarm <= 0) toast('The bells fall silent.'); }
    if (!this.eyesOn()) return;
    for (const o of this.eyes(m)) {
      o.a = o.base + Math.sin(Render.waterT * o.spd + o.ph) * o.sweep;
      const seen = this.smoke <= 0 && this.eyeSees(o);
      o.watch = seen ? o.watch + dt : Math.max(0, o.watch - dt * 2);
      if (o.watch >= EYE_TRIP && this.alarm <= 0) this.raise(o);
    }
  },

  // An Eye has seen you: bells, lockdown, and more gaolers.
  raise(o) {
    this.alarm = 45;
    Sfx.play('alarm');
    toast('ALARM! A Watcher Eye has seen you.');
    Memory.deed('tripped_eye', 'Set off the alarm in the Black Wing.');
    Foes.list.forEach(f => { if (f.def.gaoler) Foes.alert(f); });
    for (let i = 0; i < 2; i++) {
      for (let tries = 0; tries < 20; tries++) {
        const x = o.x + rnd(-4, 4), y = o.y + rnd(1, 5);
        if (!World.solid(Player.map, x, y)) { Foes.spawn('gaoler', x * TILE + 8, y * TILE + 12, { alert: true }); break; }
      }
    }
  },

  smash(o) { S.opened[`eye:${o.x},${o.y}`] = absDay(); gainXP('stealth', 15); toast('The Watcher Eye goes dark.'); },

  useSmoke() {
    Inv.remove('smoke_vial', 1);
    this.smoke = 12;
    Sfx.play('splat');
    FX.burst(Player.x, Player.y - 10, '#a8a8b0', 40);
    Foes.list.forEach(f => { if (Math.hypot(f.x - Player.x, f.y - Player.y) < 140) { f.state = 'idle'; f.aware = 0; f.stun = 1.2; f.vx = f.vy = 0; } });
    toast('Smoke fills the air.');
  },

  // Called after lighting, so the Eyes' cones glow through the dark.
  overlay(g) {
    const m = Player.map;
    if (m.id !== 'blackwing') return;
    const cx = Render.cam.x, cy = Render.cam.y;
    if (this.eyesOn()) for (const o of this.eyes(m)) {
      if (o.a === undefined) continue;
      const ex = o.x * TILE + 8 - cx, ey = o.y * TILE + 8 - cy;
      g.fillStyle = this.smoke > 0 ? 'rgba(160,160,170,0.10)' : `rgba(255,70,70,${0.1 + Math.min(o.watch, EYE_TRIP) * 0.5})`;
      g.beginPath(); g.moveTo(ex, ey);
      g.arc(ex, ey, EYE_RANGE, o.a - EYE_FOV, o.a + EYE_FOV); g.closePath(); g.fill();
      g.fillStyle = '#ff6070'; g.fillRect(Math.round(ex) - 1, Math.round(ey) - 1, 3, 3);
    }
    if (this.alarm > 0 && Math.floor(this.alarm * 3) % 2) Font.shadow(g, 'ALARM', Math.round(UI.W / 2 - 15), 22, '#ff6070', '#2a1a10', 2);
    if (this.smoke > 0) { g.fillStyle = `rgba(180,180,190,${Math.min(0.25, this.smoke / 30)})`; g.fillRect(0, 0, UI.W, UI.H); }
  },

  mail(m) {
    if (m !== 'pip') return false;
    Script.run([
      [null, 'A grubby note, folded very small. "Tam. It is Pip, from the gaol. They did not empty all of it. There is a wing nobody wrote down. Corvin went in and did not come out. Come to Ironback. Please. The gate is open."'],
      { do() { Memory.flag('got_pip_letter'); } },
    ], null, () => Quests.pulse());
    return true;
  },

  newDay(lines) {
    if (Memory.get('final_choice') && !Memory.get('pip_sent')) { Memory.flag('pip_sent'); S.mail.push('pip'); lines.push({ t: 'A grubby letter has arrived in your mailbox.', c: C.blue }); }
  },

  // ---- Sailing ---------------------------------------------------------------
  voyage(to) {
    if (to === 'gullsteeth' && S.quests.p2 && S.quests.p2.state === 'active' && !Memory.get('naval_won')) {
      return UI.push(this.naval(
        () => { Memory.flag('naval_won'); Memory.deed('naval_won', 'Outgunned the Red Gull at sea.', { gossip: true }); Quests.pulse(); this.arrive(to); },
        () => UI.say(null, 'Holed and listing, you limp back to Saltmere. The Red Gull will be waiting out there next time.'),
      ));
    }
    this.arrive(to);
  },
  arrive(to) {
    Sfx.play('splash');
    Game.fade(() => (to === 'gullsteeth' ? Player.place('gullsteeth', 30 * TILE + 8, 38 * TILE + 12, DIRS.up) : Player.place('saltmere', 29 * TILE + 8, 29 * TILE + 12, DIRS.down)));
  },

  // A cannon duel. Steer left and right to dodge where their shots will land
  // (marked in red), and fire when your guns are loaded.
  naval(win, lose) {
    const ui = UI;
    const st = { me: 6, them: 8, x: 0.5, ex: 0.5, edir: 1, reload: 0, eReload: 1.6, shots: [], marks: [], t: 0, over: 0 };
    const end = ok => { ui.pop(); (ok ? win : lose)(); };
    return {
      noHud: true, naval: true,
      update(dt) {
        if (st.over) { st.over -= dt; if (st.over <= 0) end(st.them <= 0); return; }
        st.t += dt;
        const steer = (Input.isDown('right') ? 1 : 0) - (Input.isDown('left') ? 1 : 0);
        st.x = clamp(st.x + steer * 0.55 * dt, 0.05, 0.95);
        st.ex += st.edir * (0.16 + (8 - st.them) * 0.012) * dt;
        if (st.ex > 0.9 || st.ex < 0.1) st.edir *= -1;
        st.reload = Math.max(0, st.reload - dt); st.eReload -= dt;
        if ((Input.hit('use') || Input.hit('act') || Input.mouse.clickL) && st.reload <= 0) {
          ui.consumeClick(); st.reload = 1.1; Sfx.play('cannon');
          st.shots.push({ x: st.x, y: 0.82, mine: true });
        }
        if (st.eReload <= 0) {
          st.eReload = 1.3 + Math.random() * 0.8;
          const aim = clamp(st.x + (Math.random() - 0.5) * 0.25, 0.05, 0.95);
          st.marks.push({ x: aim, t: 0.9 });
          Sfx.play('click');
        }
        for (const s of st.shots) s.y -= dt * 1.9;
        st.shots = st.shots.filter(s => {
          if (s.y > 0.2) return true;
          if (Math.abs(s.x - st.ex) < 0.1) { st.them--; Sfx.play('boom'); FX.burst(0, 0, '#fff', 0); }
          return false;
        });
        for (const k of st.marks) k.t -= dt;
        st.marks = st.marks.filter(k => {
          if (k.t > 0) return true;
          Sfx.play('splash');
          if (Math.abs(k.x - st.x) < 0.08) { st.me--; Sfx.play('boom'); Sfx.play('hurt'); }
          return false;
        });
        if (st.them <= 0 || st.me <= 0) { st.over = 1.2; Sfx.play(st.them <= 0 ? 'quest' : 'bad'); }
      },
      draw(g) {
        const W = ui.W, H = ui.H;
        g.fillStyle = '#2f6da8'; g.fillRect(0, 0, W, H);
        g.fillStyle = '#3d86c6';
        for (let i = 0; i < 40; i++) g.fillRect((i * 53 + st.t * 30) % W, (i * 37) % H, 10, 1);
        const ship = (cx, cy, colour, flip) => {
          g.fillStyle = '#5f4128'; g.fillRect(cx - 26, cy - 6, 52, 12);
          g.fillStyle = '#7a5535'; g.fillRect(cx - 24, cy - 6, 48, 3);
          g.fillStyle = '#6f4c30'; g.fillRect(cx - 1, cy - (flip ? -6 : 30), 3, 24);
          g.fillStyle = colour; g.fillRect(cx - 12, cy - (flip ? -10 : 28), 24, 16);
        };
        ship(st.ex * W, H * 0.18, '#b23a3a', true);
        ship(st.x * W, H * 0.86, '#e8e0d0', false);
        for (const k of st.marks) { g.strokeStyle = `rgba(255,80,80,${0.4 + (0.9 - k.t)})`; g.beginPath(); g.arc(k.x * W, H * 0.86, 14 * (k.t + 0.3), 0, 7); g.stroke(); }
        for (const s of st.shots) { g.fillStyle = '#14141a'; g.fillRect(s.x * W - 2, s.y * H - 2, 4, 4); }
        Font.shadow(g, 'THE RED GULL', 8, 6, '#ffb0a0');
        for (let i = 0; i < 8; i++) { g.fillStyle = i < st.them ? '#d4405a' : '#55555f'; g.fillRect(8 + i * 9, 18, 7, 5); }
        Font.shadow(g, 'YOUR SHIP', 8, H - 30, '#fff4d0');
        for (let i = 0; i < 6; i++) { g.fillStyle = i < st.me ? '#5cb85c' : '#55555f'; g.fillRect(8 + i * 9, H - 18, 7, 5); }
        const fire = st.reload > 0 ? 'Reloading...' : 'C / E: FIRE', steer = 'A / D: steer out of the red rings';
        Font.shadow(g, fire, W - 8 - Font.width(fire), H - 18, st.reload > 0 ? '#c8c0b0' : '#ffe08a');
        Font.shadow(g, steer, W - 8 - Font.width(steer), H - 30, '#fff4d0');
        if (st.over) Font.shadow(g, st.them <= 0 ? 'She strikes her colours!' : 'You are holed below the waterline!', Math.round(W / 2 - 70), Math.round(H / 2), '#ffe08a', '#2a1a10', 1);
      },
      state: () => st,
    };
  },
};

const storyKill = Story.onKill.bind(Story);
Story.onKill = f => {
  storyKill(f);
  if (f.type === 'kessick') { Memory.flag('kessick_done'); Memory.deed('killed_kessick', 'Killed Gaolmaster Kessick in his own chamber.', { gossip: true }); Quests.pulse(); }
  if (f.type === 'vane') { Memory.flag('vane_done'); Memory.deed('killed_vane', 'Killed Captain Vane on the deck of the Red Gull.', { gossip: true }); Quests.pulse(); }
};
const objLabel = Interact.objLabel.bind(Interact);
Interact.objLabel = o => (o.type === 'wreck' ? (Memory.get('ship_fixed') ? 'Set sail' : Memory.get('final_choice') ? 'Repair the ship' : 'Look') : objLabel(o));

Story.fightVane = () => { Memory.flag('vane_fight'); const p = People.get('vane'); p.hidden = true; p.fighting = true; Foes.spawn('vane', p.x, p.y, { alert: true }); };
Story.rescued = item => (S && S.rescued ? S.rescued[item] || 0 : 0);

Object.assign(Actions, {
  lever() {
    if (Memory.get('eyes_off')) return UI.say(null, 'The lever is down. Every Eye in the Black Wing is dark.');
    Memory.flag('eyes_off'); Sfx.play('metal');
    Memory.deed('eyes_off', 'Shut down the Watcher Eyes of the Black Wing.');
    UI.say(null, 'You haul the lever down. Somewhere in the walls, gears grind. The red glass in every Eye goes dull.');
  },
  hatch() {
    if (!Memory.get('final_choice') || !S.quests.g1) return UI.say(null, 'A heavy trapdoor, padlocked. Not your business. Not yet.');
    const go = () => Game.warp({ to: 'blackwing', tx: 25, ty: 36, dir: DIRS.up });
    if (S.opened.bw_hatch) return go();
    if (!Crime.hasPick()) return UI.say(null, 'A heavy trapdoor with a padlock. You need a lockpick.');
    UI.push(Crime.lockpickScreen(null, ok => { if (ok) { S.opened.bw_hatch = absDay(); go(); } }));
  },
  sigil(o) {
    if (!Inv.count('warden_sigil')) return UI.say(null, 'A door of black iron with a sigil-shaped hollow where a lock should be.');
    if (DLC.alarm > 0) return UI.say(null, 'Lockdown. The sigil will not turn while the bells are ringing.');
    S.opened[o.cid] = absDay(); World.remove(Player.map, o); Sfx.play('door');
    toast('The sigil turns. The door grinds open.');
  },
  celldoor(o) {
    if (!Crime.hasPick()) return UI.say(null, 'A cell door, locked. There is someone inside. You need a lockpick.');
    UI.push(Crime.lockpickScreen(null, ok => { if (ok) { S.opened['cell' + o.cell] = absDay(); World.remove(Player.map, o); toast('The cell door swings open.'); } }));
  },
  prisoner(o) {
    if (!S.opened['cell' + o.cell]) return UI.say(null, `${o.name}, behind the bars, watches you without hope.`);
    Script.run([[o.pid === 'ysolde' ? 'ysolde' : null, (o.pid === 'ysolde' ? '' : o.name + ': ') + o.line], [null, 'You help them up, and point them to the stair. They go, one hand on the wall.']], null, () => {
      S.opened['pris' + o.cell] = absDay(); World.remove(Player.map, o);
      S.rescued = S.rescued || {}; S.rescued.unwritten = (S.rescued.unwritten || 0) + 1;
      Memory.deed('freed_' + o.pid, `Freed ${o.name} from the Black Wing.`);
      Quests.event('rescue', 'unwritten');
    });
  },
  uniform() {
    if (S.opened.uniform) return UI.say(null, 'An empty locker.');
    S.opened.uniform = absDay(); Inv.add('gaol_uniform', 1);
    UI.say(null, 'A gaoler\'s uniform, folded neatly. Kept in your pack, the gaolers will take you for one of their own, unless they get a close look.');
  },
  kessick() {
    const q = S.quests.g4;
    if (Memory.get('kessick_done') || !q || q.state !== 'active') return UI.say(null, 'An iron desk, its drawers full of blank paper. He never needed to write anything down that he did not want to.');
    Script.run([
      ['kessick', 'The farmer. The one who killed my King, or knelt to him, depending on who is telling it. It does not matter to me. Nothing up there has ever mattered down here.'],
      ['kessick', 'Every soul in this wing was given to me. I kept them. That is what a gaol is for.'],
      { ask: 'Kessick rises from his desk.', who: null, opts: [
        { t: '[Persuasion 4] Open the Black Ledger to the pages signed "K."', if: () => Inv.count('black_ledger') > 0, lock: () => S.skills.persuasion.lvl >= 4, xp: ['persuasion', 100], do() {
          Memory.flag('kessick_surrendered'); Memory.flag('kessick_done'); Memory.deed('kessick_surrendered', 'Made Gaolmaster Kessick surrender with his own ledger.', { gossip: true });
        }, then: [['kessick', '...My own hand. Every page. Very well. Lock me in one of my cells, if it amuses you. I always did wonder what they looked like from the inside.']] },
        { t: 'Draw your weapon.', do() { Memory.flag('kessick_fight'); Foes.spawn('kessick', 25 * TILE + 8, 7 * TILE + 12, { alert: true }); } },
      ] },
    ], 'kessick', () => Quests.pulse());
  },
  cage(o) {
    S.opened['cage' + o.cage] = absDay(); World.remove(Player.map, o); Sfx.play('metal');
    S.rescued = S.rescued || {}; S.rescued.captive = (S.rescued.captive || 0) + 1;
    Memory.deed('freed_captive_' + o.cage, 'Broke open a cage in the hold of the Red Gull.');
    Quests.event('rescue', 'captive');
    UI.say(null, ['A fisherman, half-starved. "Ness sent you? Ness is alive?"', 'An old woman who grips your hand and will not let go.', 'A boy of fifteen, who tries to fight you before he understands.'][o.cage] + ' They head for the rowboat.', () => {
      if (Story.rescued('captive') >= 3) { People.seat(People.get('vane')); toast('Footsteps on the deck above. The captain is waiting.'); }
      Quests.pulse();
    });
  },
  wreck(o) {
    if (Memory.get('ship_fixed')) return Actions.sail(o);
    if (!Memory.get('final_choice')) return UI.say(null, 'A wreck, half buried in the sand. Her keel still looks sound, oddly enough.');
    if (!S.quests.p1) return UI.ask(null, 'Her keel is sound. With timber, iron, rope and pitch, she could float again. Start repairing her?', [
      { text: 'Start repairs', fn() { Quests.start('p1'); Quests.pulse(); } }, { text: 'Not now', fn() {} },
    ]);
    const needs = { wood: 60, iron: 10, fiber: 40, sap: 10 };
    if (!Inv.has(needs)) return UI.say(null, 'You still need ' + Object.entries(needs).filter(([k, n]) => Inv.count(k) < n).map(([k, n]) => `${n - Inv.count(k)} more ${ITEMS[k].name}`).join(', ') + '.');
    Inv.takeAll(needs); Memory.flag('ship_fixed'); Sfx.play('quest_done');
    UI.say(null, 'Days of hammering, tarring and splicing later, she sits upright on the sand, ready for the tide.', () => Quests.pulse());
  },
  sail() {
    const here = Player.map.id;
    UI.ask(null, 'Where to?', [
      here === 'saltmere' ? { text: 'Sail to Gull\'s Teeth', fn() { DLC.voyage('gullsteeth'); } } : { text: 'Sail home to Saltmere', fn() { DLC.voyage('saltmere'); } },
      { text: 'Stay ashore', fn() {} },
    ]);
  },
  row() {
    Sfx.play('splash');
    if (Player.map.id === 'gullsteeth') return Game.fade(() => Player.place('redgull', 21 * TILE + 8, 15 * TILE + 12, DIRS.up));
    Game.fade(() => Player.place('gullsteeth', 30 * TILE + 8, 2 * TILE + 12, DIRS.down));
  },
  shiphatch() { Sfx.play('door'); Game.fade(() => Player.place('hold', 15 * TILE + 8, 10 * TILE + 12, DIRS.up)); },
});

// Mother Ansa can ask the Green to give back someone the story still needs.
// The death stays in your Deeds; this only undoes its consequences.
const RITE_COST = 1500;
const REVIVABLE = {
  rusk: { dead: () => !!S.dead.rusk, back() { delete S.dead.rusk; Memory.flag('camp_war', false); Memory.flag('camp_deal', false); }, text: 'Rusk wakes in his camp, furious and confused. He will need talking to again.' },
  vane: { dead: () => !!S.dead.vane, back() { delete S.dead.vane; Memory.flag('vane_spared'); Memory.flag('vane_done'); }, text: 'Captain Vane washes up on Saltmere beach, alive, and decides to try being an honest trader.' },
  thorne: { dead: () => !!S.dead.thorne, back() { delete S.dead.thorne; Memory.flag('thorne_dead', false); }, text: 'Word comes that Maelis Thorne was found alive on the road east. She has left the valley for good.' },
};
const ansaExtra = NPCS.ansa.extra;
NPCS.ansa.extra = function (opts, p) {
  if (ansaExtra) ansaExtra.call(this, opts, p);
  for (const id in REVIVABLE) {
    const r = REVIVABLE[id];
    if (!r.dead()) continue;
    opts.push({ text: `Ask the Green to return ${NPCS[id].name} (${RITE_COST}g)`, locked: S.gold < RITE_COST, fn() {
      S.gold -= RITE_COST; r.back(); Sfx.play('revive');
      Memory.deed('revived_' + id + '_' + absDay(), `Asked the Green to return ${NPCS[id].name}, and it did.`, { once: false, gossip: true });
      People.refresh();
      Script.run([[ 'ansa', 'The Green gives back, sometimes. Not often. Do not make me ask it twice.' ], [null, r.text]], 'ansa', () => Quests.pulse());
    } });
  }
};

Crime.hasPick = () => Inv.count('lockpick') > 0 || Inv.count('master_pick') > 0;
Object.assign(LOOT, {
  guardhouse: { items: [['arrow', 5, 10], ['salve', 1, 2], ['lockpick', 1, 2]], gold: [100, 300] },
  wick_home: { items: [['shell', 2, 4], ['mackerel', 1, 2], ['pearl', 1, 1]], gold: [20, 60] },
  dara_home: { items: [['hazelnut', 2, 4], ['feed', 3, 6]], gold: [30, 80] },
  townhouse_a: { items: [['amethyst', 1, 1], ['omelette', 1, 1], ['quartz', 1, 2]], gold: [150, 400] },
  townhouse_b: { items: [['quartz', 1, 2], ['stew', 1, 1], ['pearl', 1, 1]], gold: [100, 300] },
  granary: { items: [['potato', 4, 8], ['turnip', 5, 10], ['corn', 3, 6]], gold: [0, 0] },
});
