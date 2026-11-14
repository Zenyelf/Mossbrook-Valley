'use strict';
// Your horse: bought at the stables, called with one key, and only ever good for
// getting somewhere faster. It is not an entity, so nothing can target or hurt it.

const HORSE_PRICE = 2500;
const HORSE_SPEED = 1.9;

npc({
  id: 'dara', name: 'Dara Whitlock', role: 'Stable keeper',
  look: { skin: '#d8a880', skinD: '#b88a64', hair: '#8a4a2a', hairD: '#6a361e', style: 'long', shirt: '#6a7a4a', shirtD: '#505e38', belt: '#4a2f1d', pants: '#54483e', pantsD: '#3e342c', shoes: '#3a2414' },
  sched: [[480, 'village', 12, 21], [1200, 'village', 12, 21, true]],
  loves: ['melon', 'hazelnut', 'strawberry'], likes: ['kind:crop', 'kind:forage'], hates: ['coal', 'stone'],
  greet: ['Mind where you step.', 'She has been fed. I have not.', 'Morning. Or whatever it is.'],
  chat: [
    { h: 0, t: 'Bracken is the best horse I ever raised. Sound legs, no temper, afraid of nothing.' },
    { h: 0, t: 'Nothing that walks will catch her, and she knows it. She just will not fight for you. Horses have more sense than that.' },
    { h: 2, t: 'Every horse I have ever owned refuses to go near the river after dark. I stopped trying to make them.' },
    { h: 4, t: 'Your grandfather kept a horse, a long while ago. He sold it the same week the bridge came down, and would not say why.' },
  ],
  reactions: [],
  extra(opts) {
    if (S.horse) return;
    opts.push({ text: `Buy Bracken the horse (${HORSE_PRICE}g)`, locked: S.gold < HORSE_PRICE, fn() {
      S.gold -= HORSE_PRICE;
      S.horse = true;
      Sfx.play('coin');
      Memory.deed('bought_horse', 'Bought Bracken the horse from Whitlock Stables.', { gossip: true });
      Script.run([
        'She is yours. Treat her better than most people treat each other.',
        [null, 'Press H anywhere outdoors and Bracken comes to you. Press H again to get down.'],
      ], 'dara');
    } });
  },
});

Art.house_defs.stable = {
  tw: 6, wallH: 44, roofH: 36, slope: 8, wall: ['#9a4a34', '#b05e46', '#763626'], roof: ['#5a4a3a', '#6e5c4a', '#443628'],
  deco(g, x0, wy, W, H) {
    Art.P(g, '#2a1e14', x0 + 30, H - 34, 36, 34);
    Art.P(g, '#e8dcc4', x0 + 28, H - 36, 40, 2); Art.P(g, '#e8dcc4', x0 + 28, H - 36, 2, 36); Art.P(g, '#e8dcc4', x0 + 66, H - 36, 2, 36);
    Art.P(g, '#7a5535', x0 + 25, wy + 2, 46, 9); Font.center(g, 'STABLES', x0 + 48, wy + 3, '#fff2c8');
  },
};

(() => {
  const { mk, P, outlined, memo } = Art;
  const COAT = '#8a5a34', DARK = '#6a4326', LIGHT = '#a87248', MANE = '#2f2018', HOOF = '#241a12';

  // Legs lift in opposite pairs across the four gait frames.
  function leg(g, x, lifted) {
    const h = lifted ? 5 : 8;
    P(g, DARK, x, 23, 3, h - 2); P(g, HOOF, x, 23 + h - 2, 3, 2);
  }
  function side(g, f) {
    P(g, MANE, 4, 12, 3, 12); P(g, MANE, 3, 18, 3, 7);
    leg(g, 10, f === 1); leg(g, 13, f === 3); leg(g, 25, f === 3); leg(g, 28, f === 1);
    P(g, COAT, 8, 12, 22, 11); P(g, LIGHT, 9, 12, 20, 2); P(g, DARK, 8, 21, 22, 2);
    P(g, COAT, 27, 5, 6, 11); P(g, MANE, 26, 4, 3, 10);
    P(g, COAT, 31, 3, 7, 6); P(g, DARK, 36, 6, 3, 3); P(g, COAT, 31, 1, 2, 3); P(g, '#1a1210', 33, 5);
    P(g, '#d8c8a0', 14, 13, 11, 3); P(g, '#7a2f30', 15, 10, 9, 4);
  }
  function front(g, f, layer) {
    if (layer === 0) {
      leg(g, 14, f === 1); leg(g, 23, f === 3);
      P(g, COAT, 13, 12, 14, 12); P(g, DARK, 13, 22, 14, 2); P(g, '#7a2f30', 14, 10, 12, 3);
    } else {
      P(g, COAT, 16, 8, 8, 13); P(g, '#efe6d2', 19, 9, 2, 10); P(g, DARK, 17, 18, 6, 3);
      P(g, COAT, 16, 5, 2, 3); P(g, COAT, 22, 5, 2, 3); P(g, MANE, 18, 7, 4, 3); P(g, '#1a1210', 17, 11); P(g, '#1a1210', 22, 11);
    }
  }
  function back(g, f) {
    P(g, COAT, 17, 3, 6, 9); P(g, MANE, 19, 2, 2, 10); P(g, COAT, 16, 1, 2, 3); P(g, COAT, 22, 1, 2, 3);
    leg(g, 14, f === 3); leg(g, 23, f === 1);
    P(g, COAT, 13, 12, 14, 12); P(g, LIGHT, 14, 12, 12, 2); P(g, DARK, 13, 22, 14, 2); P(g, '#7a2f30', 14, 10, 12, 4);
    P(g, MANE, 19, 14, 2, 13);
  }
  // layer 1 is only the head of a horse facing you, drawn in front of the rider.
  Art.horse = (dir, f, layer) => memo(`horse${dir}${f}${layer}`, () => outlined(mk(40, 32, g => {
    if (dir === DIRS.down) return front(g, f, layer);
    if (layer) return;
    if (dir === DIRS.up) return back(g, f);
    if (dir === DIRS.left) { g.translate(40, 0); g.scale(-1, 1); }
    side(g, f);
  })));
})();

const Horse = {
  lastStep: -1,
  get on() { return !!(S.horse && S.riding && !Player.map.indoor); },

  mount() {
    if (!S.horse) { toast('You have no horse. Whitlock Stables in Mossbrook sells one.'); Sfx.play('bad'); return; }
    if (Player.map.indoor) { toast('There is no room for a horse in here.'); Sfx.play('bad'); return; }
    if (Foes.list.some(f => f.state !== 'idle' && !Foes.isCalm(f) && Math.hypot(f.x - Player.x, f.y - Player.y) < 150)) { toast('Not with enemies on you.'); Sfx.play('bad'); return; }
    S.riding = true;
    Combat.sneaking = false;
    Sfx.play('neigh');
  },
  dismount() { if (S.riding) { S.riding = false; Sfx.play('click'); } },
  toggle() { if (this.on) this.dismount(); else this.mount(); },

  throwOff() { if (this.on) { S.riding = false; toast('You are thrown from the saddle.'); } },

  tick() {
    if (!this.on || !Player.moving) { this.lastStep = -1; return; }
    const step = Math.floor(Player.frameT * 1.2);
    if (step !== this.lastStep && step % 2 === 0) Sfx.play('hoof');
    this.lastStep = step;
  },

  draw(g) {
    const p = Player, px = Math.round(p.x), py = Math.round(p.y), f = p.moving ? Math.floor(p.frameT * 1.2) % 4 : 0;
    const hx = px - 20, hy = py - 30, bob = f === 1 || f === 3 ? -1 : 0;
    // The rider is the top of the walking sprite, set on the saddle.
    const seat = p.dir === DIRS.down ? 10 : p.dir === DIRS.up ? 12 : 10;
    g.drawImage(Art.horse(p.dir, f, 0), hx, hy);
    g.drawImage(Armor.frame(p.dir, 0), 0, 0, 18, 19, px - 9, hy + seat - 18 + bob, 18, 19);
    if (p.dir === DIRS.down) g.drawImage(Art.horse(p.dir, f, 1), hx, hy);
  },

  // Bracken waits in the paddock until she is yours.
  drawPaddock(g) {
    const t = Math.floor(Render.waterT * 0.7) % 4, f = t === 2 ? 1 : 0;
    Render.shadow(g, 8 * TILE, 22 * TILE - 2, 26);
    g.drawImage(Art.horse(DIRS.right, f, 0), 8 * TILE - 20, 22 * TILE - 32);
  },
};
