'use strict';
// Life in the world:
//  - Critters: butterflies and bees by day, fireflies and lamp moths at night,
//    dragonflies over water, gulls over the sea, leaves drifting in Greywood.
//  - Friendly animals in the safe places: cats, a dog, rabbits that bolt unless you
//    creep up on them, squirrels, pigeons that scatter, frogs, ducks, peacocks.
//    Walk up and press E to pet them.
//  - The Evergreen Court comes alive: guards at the palace and on patrol, courtiers
//    gossiping in pairs, passers-by, and two market stalls with things to buy.
//    Most of these people have no quest for you. They just live here.
// Loaded last, after the audio, so it can add sounds of its own.

// ---- New things to buy at the Court ---------------------------------------------------
item('honey_cake', 'Honey Cake', 'food', 90, ['cake', '#e8b050', '#a87028'], 'Court baking: soft, gold and far too sweet. Very filling.', { food: 70 });
item('royal_tea', 'Royal Tea', 'food', 60, ['cup', '#c8e0c0', '#6a9a5a'], 'A pale green tea poured at the palace. Refreshing.', { food: 35, heal: 25 });
item('court_bonbons', 'Court Bonbons', 'gift', 70, ['bonbon', '#d45a8a', '#8a2a5a'], 'A ribboned box of sugared fruit. Nearly anyone is glad of them.');
item('silk_ribbon', 'Silk Ribbon', 'gift', 110, ['ribbon', '#4a9a7a', '#2a6a4a'], 'Evergreen silk, the colour of the King\'s banners. A gift most people like.');
item('rose_perfume', 'Rose Perfume', 'gift', 160, ['perfume', '#e88aa8', '#a84a6a'], 'A small cut-glass bottle. It smells of a garden that is never out of season.');
item('gilded_comb', 'Gilded Comb', 'gift', 140, ['comb', '#e8c040', '#a88020'], 'A comb with a gold back. Too fine for anyone in Mossbrook to own. They will love it.');
Object.assign(Art.ICONS, {
  cake: (g, a, b) => { const P = Art.P; P(g, '#f4e8d0', 3, 9, 10, 4); P(g, a, 3, 6, 10, 3); P(g, b, 3, 12, 10, 1); P(g, '#ffffff', 5, 6, 2, 1); P(g, '#c43030', 7, 4, 2, 2); },
  cup: (g, a, b) => { const P = Art.P; P(g, '#efe6d2', 3, 6, 9, 7); P(g, a, 4, 7, 7, 3); P(g, '#efe6d2', 12, 8, 2, 3); P(g, b, 2, 13, 12, 1); P(g, '#ffffff', 6, 3, 1, 2); P(g, '#ffffff', 8, 2, 1, 2); },
  bonbon: (g, a, b) => { const P = Art.P; P(g, a, 2, 5, 12, 9); P(g, b, 2, 13, 12, 1); P(g, '#f0d070', 7, 5, 2, 9); P(g, '#f0d070', 2, 8, 12, 2); P(g, '#f0d070', 5, 2, 2, 3); P(g, '#f0d070', 9, 2, 2, 3); },
  ribbon: (g, a, b) => { const P = Art.P; P(g, a, 2, 4, 5, 4); P(g, a, 9, 4, 5, 4); P(g, b, 7, 5, 2, 3); P(g, a, 5, 8, 2, 6); P(g, a, 9, 8, 2, 6); P(g, '#ffffff', 3, 5, 1, 1); },
  perfume: (g, a, b) => { const P = Art.P; P(g, '#e0e8f0', 4, 6, 8, 8); P(g, a, 5, 8, 6, 5); P(g, '#e8c040', 6, 3, 4, 3); P(g, b, 7, 1, 2, 2); P(g, '#ffffff', 5, 7, 1, 3); },
  comb: (g, a, b) => { const P = Art.P; P(g, a, 2, 4, 12, 4); P(g, b, 2, 7, 12, 1); for (let i = 0; i < 6; i++) P(g, '#d8c8a0', 3 + i * 2, 8, 1, 5); P(g, '#ffffff', 4, 5, 3, 1); },
});
// Gifts are welcome nearly everywhere, unless someone truly hates them.
(() => {
  const taste = Trust.giftTaste.bind(Trust);
  Trust.giftTaste = (id, itemId) => { const t = taste(id, itemId); return ITEMS[itemId].kind === 'gift' && t === 'neutral' ? 'like' : t; };
})();

// ---- Sounds of the animals ----------------------------------------------------------------
(() => {
  const { ftone, bell, thump, knock } = Sfx.kit;
  Object.assign(Sfx.SOUNDS, {
    meow() { ftone(this, 700, 0.35, 'sawtooth', 0.05, 0, -200, 2200, 0.05); ftone(this, 900, 0.25, 'triangle', 0.04, 0.05, -300, 2400, 0.04); },
    purr() { for (let i = 0; i < 6; i++) this.noise(0.08, 0.06, 220, { when: i * 0.1, type: 'lowpass' }); },
    woof() { ftone(this, 260, 0.12, 'sawtooth', 0.12, 0, -90, 1100, 0.01); ftone(this, 240, 0.14, 'sawtooth', 0.11, 0.2, -90, 1000, 0.01); },
    squeak() { this.tone(2200, 0.06, 'sine', 0.05, 0, 600); },
    coo() { [0, 0.2].forEach(w => this.tone(420, 0.18, 'sine', 0.06, w, -60, undefined, 0.04)); },
    flutter() { for (let i = 0; i < 6; i++) knock(this, 1100, 0.03, 0.08, i * 0.04, 1); },
    ribbit() { ftone(this, 180, 0.08, 'sawtooth', 0.08, 0, 60, 700); ftone(this, 200, 0.1, 'sawtooth', 0.08, 0.12, 80, 700); },
    quack() { ftone(this, 520, 0.12, 'sawtooth', 0.07, 0, -120, 1400); },
    peacock() { ftone(this, 900, 0.3, 'sawtooth', 0.05, 0, 400, 2600, 0.02); ftone(this, 1100, 0.35, 'sawtooth', 0.04, 0.3, -300, 2600, 0.02); },
    chitter() { for (let i = 0; i < 4; i++) this.tone(2600 + Math.random() * 600, 0.03, 'square', 0.025, i * 0.05); },
    harp() { const n = [523, 659, 784, 988, 1047][Math.floor(Math.random() * 5)]; bell(this, n, 0.6, 0.025); bell(this, n * 1.5, 0.5, 0.015, 0.12); },
    pet() { bell(this, 1047, 0.3, 0.04); bell(this, 1319, 0.3, 0.04, 0.08); thump(this, 300, 400, 0.05, 0.04); },
  });
})();

// ---- Critters: the little things in the air ------------------------------------------------
const Critters = {
  list: [], mapId: null,
  // What lives where, by day and by night.
  kinds(m) {
    if (!m || m.indoor) return [];
    const night = S.time >= 1140 || S.time < 360, wet = S.weather === 'rain' || S.weather === 'storm', winter = S.season === 3, id = m.id;
    const sea = id === 'saltmere' || id === 'gullsteeth' || id === 'redgull';
    const out = [];
    if (sea && !night) out.push(['gull', 4]);
    if (wet) return out;
    if (night) { if (!winter && !sea) out.push(['firefly', id === 'greywood' ? 22 : 15]); if (id === 'capital' || id === 'village') out.push(['moth', 4]); return out; }
    if (!winter && !sea) out.push(['butterfly', id === 'farm' || id === 'lower' ? 8 : 6], ['bee', 3]);
    if (!winter && (id === 'lower' || id === 'village' || id === 'farm')) out.push(['dragonfly', 3]);
    if (id === 'greywood' && S.season === 2) out.push(['leaf', 10]);
    return out;
  },
  spawn(kind, cam, W, H, edge) {
    const x = cam.x + (edge ? (Math.random() < 0.5 ? -10 : W + 10) : Math.random() * W), y = cam.y + Math.random() * H;
    const c = { kind, x, y, vx: 0, vy: 0, t: Math.random() * 10, life: 20 + Math.random() * 30, color: null };
    if (kind === 'butterfly') c.color = ['#f0d040', '#ffffff', '#f08a30', '#7ab0f0', '#e870a8'][Math.floor(Math.random() * 5)];
    if (kind === 'gull') { c.vx = (Math.random() < 0.5 ? -1 : 1) * (30 + Math.random() * 20); c.y = cam.y + Math.random() * H * 0.5; }
    if (kind === 'leaf') { c.y = cam.y - 5; c.x = cam.x + Math.random() * W; c.color = ['#c4672a', '#e0912f', '#93462a'][Math.floor(Math.random() * 3)]; }
    return c;
  },
  update(dt) {
    const m = Player.map;
    if (!m) return;
    if (this.mapId !== m.id) { this.mapId = m.id; this.list = []; }
    const cam = Render.cam, W = UI.W, H = UI.H, want = this.kinds(m);
    for (const [kind, n] of want) {
      const have = this.list.filter(c => c.kind === kind).length;
      // Gulls fly in from the edge; slow drifters simply appear where you are looking.
      if (have < n) this.list.push(this.spawn(kind, cam, W, H, kind === 'gull' && this.list.length > 0));
    }
    const kinds = want.map(w => w[0]);
    for (const c of this.list) {
      c.t += dt; c.life -= dt;
      switch (c.kind) {
        case 'butterfly': c.vx += (Math.random() - 0.5) * 120 * dt; c.vy += (Math.random() - 0.5) * 120 * dt + Math.sin(c.t * 3) * 10 * dt; c.vx *= 0.97; c.vy *= 0.97; break;
        case 'bee': c.vx += (Math.random() - 0.5) * 300 * dt; c.vy += (Math.random() - 0.5) * 300 * dt; c.vx *= 0.92; c.vy *= 0.92; break;
        case 'dragonfly': if (Math.random() < dt * 0.8) { c.vx = (Math.random() - 0.5) * 140; c.vy = (Math.random() - 0.5) * 80; } c.vx *= 0.96; c.vy *= 0.96; break;
        case 'firefly': c.vx += (Math.random() - 0.5) * 30 * dt; c.vy += (Math.random() - 0.5) * 30 * dt - 1 * dt; c.vx *= 0.98; c.vy *= 0.98; break;
        case 'moth': c.vx += (Math.random() - 0.5) * 200 * dt; c.vy += (Math.random() - 0.5) * 200 * dt; c.vx *= 0.94; c.vy *= 0.94; break;
        case 'gull': c.vy = Math.sin(c.t * 1.3) * 6; break;
        case 'leaf': c.vx = Math.sin(c.t * 2) * 14; c.vy = 16; break;
        default: break;
      }
      c.x += c.vx * dt; c.y += c.vy * dt;
    }
    const margin = 60;
    this.list = this.list.filter(c => kinds.includes(c.kind) && c.life > 0 && c.x > cam.x - margin && c.x < cam.x + W + margin && c.y > cam.y - margin && c.y < cam.y + H + margin);
  },
  draw(g) {
    for (const c of this.list) {
      const x = Math.round(c.x), y = Math.round(c.y), flap = Math.floor(c.t * 12) % 2;
      switch (c.kind) {
        case 'butterfly': g.fillStyle = c.color; if (flap) { g.fillRect(x - 2, y - 1, 2, 2); g.fillRect(x + 1, y - 1, 2, 2); } else { g.fillRect(x - 1, y - 2, 1, 3); g.fillRect(x + 1, y - 2, 1, 3); } g.fillStyle = '#2a1a10'; g.fillRect(x, y - 1, 1, 2); break;
        case 'bee': g.fillStyle = '#f0c030'; g.fillRect(x, y, 2, 1); g.fillStyle = '#2a1a10'; g.fillRect(x + 1, y, 1, 1); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(x, y - 1 - flap, 1, 1); break;
        case 'dragonfly': g.fillStyle = '#3a8ad8'; g.fillRect(x - 2, y, 5, 1); g.fillStyle = 'rgba(200,230,255,0.75)'; g.fillRect(x - 1, y - 1 - flap, 3, 1); g.fillRect(x - 1, y + 1 + flap, 3, 1); break;
        case 'moth': g.fillStyle = '#d8d0c0'; g.fillRect(x - 1 - flap, y, 3 + flap * 2, 1); break;
        case 'gull': g.fillStyle = '#ffffff'; g.fillRect(x - 3, y - (flap ? 1 : 0), 3, 1); g.fillRect(x + 1, y - (flap ? 1 : 0), 3, 1); g.fillRect(x, y + 1 - (flap ? 1 : 0), 1, 1); break;
        case 'leaf': g.fillStyle = c.color; g.fillRect(x, y, 2, 1); g.fillRect(x + (flap ? 1 : 0), y + 1, 1, 1); break;
        default: break;
      }
    }
  },
  // Fireflies glow through the dark, so they are drawn after the night falls.
  glow(g) {
    const cam = Render.cam;
    for (const c of this.list) {
      if (c.kind !== 'firefly') continue;
      const a = 0.6 + Math.sin(c.t * 3 + c.life) * 0.35, x = Math.round(c.x - cam.x), y = Math.round(c.y - cam.y);
      if (a < 0.1) continue;
      g.fillStyle = `rgba(200,255,100,${a * 0.16})`; g.fillRect(x - 2, y - 2, 5, 5);
      g.fillStyle = `rgba(220,255,120,${a * 0.4})`; g.fillRect(x - 1, y - 1, 3, 3);
      g.fillStyle = `rgba(250,255,190,${Math.min(1, a + 0.2)})`; g.fillRect(x, y, 1, 1);
    }
  },
};

// ---- Friendly animals --------------------------------------------------------------------
const ANIMALS = {
  cat: { name: 'cat', w: 16, h: 12, speed: 14, sound: 'meow', petSound: 'purr', lines: ['The cat leans into your hand and purrs.', 'The cat blinks slowly at you. That means you are friends now.', 'The cat allows it. Briefly.'] },
  dog: { name: 'dog', w: 18, h: 14, speed: 30, sound: 'woof', lines: ['The dog wags so hard its whole back end wags.', 'The dog rolls over for a belly rub.', 'The dog licks your hand and decides to follow you for a bit.'] },
  rabbit: { name: 'rabbit', w: 12, h: 10, speed: 22, shy: true, sound: 'squeak', lines: ['The rabbit twitches its nose and lets you stroke its ears.', 'So soft. It holds very still, and then it does not.'] },
  squirrel: { name: 'squirrel', w: 12, h: 10, speed: 34, shy: true, sound: 'chitter', lines: ['The squirrel snatches nothing from your hand, looks offended, and stays anyway.'] },
  pigeon: { name: 'pigeon', w: 10, h: 8, speed: 10, flock: true, sound: 'coo', lines: ['The pigeon puffs up its chest at you.', 'It coos. It has no thoughts at all and is very content.'] },
  frog: { name: 'frog', w: 10, h: 8, speed: 18, sound: 'ribbit', lines: ['The frog regards you with enormous calm.', 'Cold and damp and quite pleased with itself.'] },
  duck: { name: 'duck', w: 12, h: 10, speed: 12, swims: true, sound: 'quack', lines: ['The duck quacks once, as if to say: fine.', 'The duck nibbles your sleeve, looking for bread.'] },
  peacock: { name: 'peacock', w: 18, h: 16, speed: 10, sound: 'peacock', lines: ['The peacock fans its tail at you. The whole thing. All of it.', 'It shrieks, very loudly, then preens.'] },
};
(() => {
  const { mk, P, outlined, memo } = Art;
  const DRAW = {
    cat(g, f, c) {
      const [m, d] = c;
      if (f === 2) { P(g, m, 5, 4, 6, 7); P(g, d, 6, 6, 1, 3); P(g, m, 8, 1, 5, 5); P(g, m, 8, 0, 2, 2); P(g, m, 11, 0, 2, 2); P(g, '#2a1a10', 11, 3); P(g, '#e89a9a', 12, 4); P(g, m, 2, 9, 4, 2); return; }
      P(g, m, 3, 5, 9, 4); P(g, d, 5, 5, 1, 2); P(g, d, 7, 5, 1, 2); P(g, m, 10, 2, 5, 5); P(g, m, 10, 0, 2, 2); P(g, m, 13, 0, 2, 2);
      P(g, '#2a1a10', 13, 4); P(g, '#e89a9a', 14, 5); P(g, m, 0, 2, 2, 1); P(g, m, 1, 3, 2, 3);
      if (f) { P(g, d, 5, 9, 2, 3); P(g, d, 8, 9, 2, 3); } else { P(g, d, 4, 9, 2, 3); P(g, d, 9, 9, 2, 3); }
    },
    dog(g, f, c) {
      const [m, d] = c;
      P(g, m, 3, 5, 11, 5); P(g, m, 12, 2, 5, 5); P(g, d, 12, 2, 2, 5); P(g, m, 16, 5, 2, 2); P(g, '#2a1a10', 17, 5); P(g, '#2a1a10', 14, 3);
      if (f) { P(g, m, 0, 2, 3, 2); P(g, d, 5, 10, 2, 4); P(g, d, 10, 10, 2, 4); } else { P(g, m, 1, 4, 2, 3); P(g, d, 4, 10, 2, 4); P(g, d, 11, 10, 2, 4); }
      P(g, '#c43030', 12, 7, 2, 1);
    },
    rabbit(g, f, c) {
      const [m, d] = c, y = f ? -1 : 0;
      P(g, m, 2, 4 + y, 7, 5); P(g, m, 7, 2 + y, 4, 4); P(g, m, 7, 0 + y, 1, 3); P(g, m, 9, 0 + y, 1, 3); P(g, '#2a1a10', 9, 3 + y); P(g, '#ffffff', 1, 4 + y, 2, 2);
      if (f) { P(g, d, 2, 9 + y, 4, 1); P(g, d, 7, 8 + y, 2, 1); } else { P(g, d, 3, 9, 2, 1); P(g, d, 7, 9, 2, 1); }
    },
    squirrel(g, f, c) {
      const [m, d] = c;
      P(g, d, 0, 0 + (f ? 1 : 0), 4, 6); P(g, m, 1, 1 + (f ? 1 : 0), 2, 4); P(g, m, 4, 4, 5, 4); P(g, m, 7, 2, 3, 3); P(g, '#2a1a10', 9, 3); P(g, m, 7, 1, 1, 1);
      P(g, d, 5, 8, 2, 2); P(g, d, 8, 8, 1, 2);
    },
    pigeon(g, f, c) {
      if (f === 2) { P(g, '#8a8a98', 2, 3, 6, 3); P(g, '#a8a8b8', 0, 1, 4, 2); P(g, '#a8a8b8', 6, 1, 4, 2); P(g, '#7a7a8a', 7, 2, 2, 2); return; }
      const hy = f ? 2 : 1;
      P(g, '#8a8a98', 2, 3, 6, 4); P(g, '#a0a0b0', 3, 3, 3, 2); P(g, '#7a7a8a', 6, hy, 3, 3); P(g, '#5aa08a', 6, hy + 2, 2, 1); P(g, '#e8c090', 9, hy + 1); P(g, '#2a1a10', 7, hy + 1);
      P(g, '#c87070', 4, 7); P(g, '#c87070', 6, 7); P(g, '#5a5a68', 0, 4, 2, 2);
    },
    frog(g, f) {
      const y = f ? -2 : 0, c = '#5a9a3a';
      P(g, c, 2, 3 + y, 6, 4); P(g, c, 1, 2 + y, 3, 2); P(g, c, 6, 2 + y, 3, 2); P(g, '#ffffff', 2, 2 + y); P(g, '#ffffff', 7, 2 + y); P(g, '#2a1a10', 2, 3 + y); P(g, '#2a1a10', 7, 3 + y);
      P(g, '#c8e0a0', 3, 5 + y, 4, 2); P(g, '#4a7a2e', 0, 6 + y, 2, 2); P(g, '#4a7a2e', 8, 6 + y, 2, 2);
    },
    duck(g, f, c) {
      const [m, head] = c;
      P(g, m, 2, 4, 8, 4); P(g, '#e0d8c8', 3, 5, 5, 2); P(g, head, 8, 1, 3, 4); P(g, '#e8b030', 11, 3, 1, 1); P(g, '#2a1a10', 9, 2); P(g, m, 1, 3, 2, 2);
      if (f) P(g, '#e8b030', 5, 8, 2, 1);
    },
    peacock(g, f) {
      if (f === 2) {
        for (let r = 0; r < 4; r++) for (let i = -r - 3; i <= r + 3; i++) P(g, r % 2 ? '#3a8a4a' : '#2a7a3a', 9 + i, 9 - r * 2, 1, 2);
        [[3, 6], [6, 3], [9, 2], [12, 3], [15, 6]].forEach(([x, y]) => { P(g, '#e8c040', x, y, 2, 2); P(g, '#2a4ab0', x, y, 1, 1); });
      } else { P(g, '#3a8a4a', 0, 9, 8, 3); P(g, '#e8c040', 2, 10); P(g, '#e8c040', 5, 10); }
      P(g, '#2a6ab0', 7, 8, 6, 5); P(g, '#2a6ab0', 11, 3, 2, 6); P(g, '#2a6ab0', 11, 2, 3, 2); P(g, '#2a6ab0', 12, 0, 1, 2); P(g, '#ffffff', 13, 2); P(g, '#e8c090', 14, 3);
      P(g, '#8a7a5a', 8, 13, 1, 3); P(g, '#8a7a5a', 11, 13, 1, 3);
    },
  };
  Art.animalDraw = DRAW;
  Art.animal = (kind, f, flip, colors) => memo(`ani${kind}${f}${flip}${colors ? colors.join('') : ''}`, () => {
    const a = ANIMALS[kind];
    return outlined(mk(a.w, a.h, g => { if (flip) { g.translate(a.w, 0); g.scale(-1, 1); } DRAW[kind](g, f, colors); }));
  });
})();

// Where they live: [kind, count, region x0, y0, x1, y1, colours]
const HERDS = {
  farm: [['rabbit', 2, 30, 26, 56, 40, ['#b8a088', '#8a7460']], ['cat', 1, 8, 9, 20, 16, ['#e8a050', '#b87030']], ['squirrel', 1, 2, 2, 20, 8, ['#a0582c', '#c87a48']]],
  village: [['cat', 1, 20, 18, 40, 30, ['#3a3434', '#24201e']], ['dog', 1, 24, 20, 40, 30, ['#a0703c', '#7a5028']], ['pigeon', 4, 26, 20, 36, 28], ['squirrel', 1, 40, 4, 58, 14, ['#a0582c', '#c87a48']], ['duck', 3, 0, 0, 64, 48, ['#8a6a48', '#2a7a3a']]],
  lower: [['frog', 3, 0, 0, 48, 36], ['rabbit', 2, 4, 4, 44, 32, ['#c8b8a0', '#9a8a70']], ['duck', 2, 0, 0, 48, 36, ['#f0ece0', '#f0ece0']]],
  capital: [['peacock', 2, 44, 10, 60, 32], ['pigeon', 7, 26, 16, 40, 26], ['cat', 1, 6, 24, 22, 32, ['#9a9aa4', '#6a6a74']]],
};
const Animals = {
  list: [], mapId: null,
  free(m, x, y, swims) {
    if (x < 1 || y < 1 || x >= m.w - 1 || y >= m.h - 1) return false;
    if (swims) return World.g(m, x, y) === T.W;
    return !World.solid(m, x, y) && !World.at(m, x, y) && !(Farm.soilAt && Farm.soilAt(m, x, y)) && !World.warpAt(m, x, y) && World.g(m, x, y) !== T.W;
  },
  build(m) {
    this.list = [];
    for (const [kind, n, x0, y0, x1, y1, colors] of HERDS[m.id] || []) {
      const A = ANIMALS[kind], spots = [];
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (this.free(m, x, y, A.swims)) spots.push([x, y]);
      if (!spots.length) continue;
      // Ducks keep to one pond; everyone else spreads out a little.
      const base = spots[Math.floor(Math.random() * spots.length)];
      for (let i = 0; i < n; i++) {
        const near = spots.filter(([x, y]) => Math.abs(x - base[0]) < 6 && Math.abs(y - base[1]) < 5), [x, y] = (near.length ? near : spots)[Math.floor(Math.random() * (near.length || spots.length))];
        this.list.push({ kind, colors, x: x * TILE + 8, y: y * TILE + 12, tx: x * TILE + 8, ty: y * TILE + 12, hx: x, hy: y, t: Math.random() * 3, flip: Math.random() < 0.5, moving: false, frame: 0, z: 0, gone: 0, petted: -1, follow: 0, display: 0 });
      }
    }
  },
  awake(a) { const night = S.time >= 1200 || S.time < 330; return !night || a.kind === 'cat' || a.kind === 'frog'; },
  update(dt) {
    const m = Player.map;
    if (!m || m.indoor) { this.mapId = m && m.id; this.list = []; return; }
    if (this.mapId !== m.id) { this.mapId = m.id; this.build(m); }
    for (const a of this.list) {
      const A = ANIMALS[a.kind], d = Math.hypot(a.x - Player.x, a.y - Player.y);
      a.display = Math.max(0, a.display - dt);
      // Pigeons scatter when you come at them; they settle again somewhere else.
      if (a.gone > 0) { a.gone -= dt; a.z = Math.min(40, a.z + 60 * dt); a.x += a.vx * dt; if (a.gone <= 0) { a.z = 0; const [x, y] = [a.hx + Math.round((Math.random() - 0.5) * 8), a.hy + Math.round((Math.random() - 0.5) * 6)]; if (this.free(m, x, y)) { a.x = a.tx = x * TILE + 8; a.y = a.ty = y * TILE + 12; } } continue; }
      a.run = Math.max(0, (a.run || 0) - dt);
      if (!this.awake(a)) { a.moving = false; continue; }
      // A dog you have petted trots after you for a while.
      a.follow = Math.max(0, a.follow - dt);
      if (a.follow > 0 && d > 30) { a.tx = Player.x - DX[Player.dir] * 20; a.ty = Player.y - DY[Player.dir] * 14; }
      a.t -= dt;
      if (a.t <= 0) {
        a.t = 1.5 + Math.random() * 4;
        if (Math.random() < 0.4) { a.tx = a.x; a.ty = a.y; }
        else for (let k = 0; k < 6; k++) {
          const x = a.hx + Math.round((Math.random() - 0.5) * 10), y = a.hy + Math.round((Math.random() - 0.5) * 8);
          if (this.free(m, x, y, A.swims)) { a.tx = x * TILE + 8; a.ty = y * TILE + 12; break; }
        }
        if (Math.random() < 0.08 && d < 160) Sfx.play(A.sound);
      }
      const dx = a.tx - a.x, dy = a.ty - a.y, dd = Math.hypot(dx, dy), sp = A.speed * (a.run > 0 ? 3 : a.follow > 0 ? 3 : 1);
      a.moving = dd > 2;
      if (!a.moving) continue;
      const nx = a.x + dx / dd * sp * dt, ny = a.y + dy / dd * sp * dt;
      if (!this.free(m, Math.floor(nx / TILE), Math.floor((ny - 2) / TILE), A.swims)) { a.tx = a.x; a.ty = a.y; continue; }
      a.x = nx; a.y = ny; a.frame += dt * (a.kind === 'rabbit' || a.kind === 'frog' ? 4 : 6);
      if (Math.abs(dx) > 1) a.flip = dx < 0;
    }
  },
  frameOf(a) {
    if (a.gone > 0) return a.kind === 'pigeon' ? 2 : 0;
    if (a.kind === 'peacock' && a.display > 0) return 2;
    if (a.kind === 'cat' && !a.moving && (!this.awake(a) || Math.floor(a.t) % 3 === 0)) return 2;
    return a.moving ? Math.floor(a.frame) % 2 : a.kind === 'pigeon' ? Math.floor(a.t * 2) % 2 : 0;
  },
  img(a) { return Art.animal(a.kind, this.frameOf(a), a.flip, a.colors); },
  draw(g, items) {
    for (const a of this.list) items.push({ y: a.y, draw: () => {
      const img = this.img(a), A = ANIMALS[a.kind], x = Math.round(a.x - A.w / 2), y = Math.round(a.y - A.h + 2 - a.z);
      if (A.swims) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(Math.round(a.x) - 6, Math.round(a.y) + 1, 12, 1); g.save(); g.beginPath(); g.rect(x - 2, y - 2, A.w + 4, A.h - 2); g.clip(); g.drawImage(img, x, y + 2); g.restore(); }
      else { if (!a.z) Render.shadow(g, a.x, a.y, Math.round(A.w * 0.6)); g.drawImage(img, x, y); }
      if (!this.awake(a) && a.kind !== 'cat') Font.draw(g, 'z', x + A.w - 2, y - 6 - Math.floor(Render.waterT * 2) % 3, '#efe2c8');
    } });
  },
  pet(a) {
    const A = ANIMALS[a.kind];
    a.petted = absDay(); a.run = 0; a.tx = a.x; a.ty = a.y; a.t = 2.5;
    if (a.kind === 'dog') a.follow = 25;
    if (a.kind === 'peacock') a.display = 3;
    for (let i = 0; i < 5; i++) VFX.emit('heal', a.x + (Math.random() - 0.5) * 12, a.y - A.h, { color: '#ff7090', vy: -24 });
    Sfx.play(A.petSound || A.sound); Sfx.play('pet');
    toast(A.lines[Math.floor(Math.random() * A.lines.length)]);
    if (!Memory.did('petted_' + a.kind)) Memory.deed('petted_' + a.kind, `Made friends with a ${A.name} in ${Player.map.name}.`);
  },
};

// ---- People of the Court -----------------------------------------------------------------
const COURT_GUARD_LOOK = { skin: '#e0b088', skinD: '#c09068', hair: '#5a3a20', hairD: '#3a2410', style: 'short', hat: 'helm', hatC: '#c8d4e4', hatD: '#7c8aa0', hatL: '#f4f9ff', plume: '#2f7a4a', shirt: '#2f6a3a', shirtD: '#1f4a28', belt: '#e0b85a', pants: '#6a6a74', pantsD: '#4a4a54', shoes: '#2a2420' };
const noble = (skin, hair, style, shirt, cape, hat) => ({ skin: skin[0], skinD: skin[1], hair: hair[0], hairD: hair[1], style, shirt: shirt[0], shirtD: shirt[1], cape, pants: '#3a3040', pantsD: '#2a2030', shoes: '#2a1a10', belt: '#e0b85a', hat, hatC: shirt[0], hatD: shirt[1] });
const SK = [['#f0c49a', '#d9a678'], ['#c88a5a', '#a86a40'], ['#8a5a3a', '#6a4028'], ['#f4d0b0', '#dcb090']];
// Background people: they stand, walk a beat, or talk among themselves. No quests.
const EXTRAS = {
  x_guard1: { name: 'Palace Guard', look: COURT_GUARD_LOOK, at: [30, 9], dir: DIRS.down, night: true,
    lines: ['Move along.', 'The palace is closed to petitioners today. It is closed to petitioners every day.', 'Eyes front. That is for me, not you.', 'Nice weather. It is always nice weather here.'] },
  x_guard2: { name: 'Palace Guard', look: COURT_GUARD_LOOK, at: [34, 9], dir: DIRS.down, night: true,
    lines: ['Keep your hands where I can see them.', 'Fifty-two years and not a single famine. You should be grateful.', 'No, I will not tell you what is in the cellars.'] },
  x_guard3: { name: 'Court Guard', look: COURT_GUARD_LOOK, route: [[6, 24], [24, 24]], night: true,
    lines: ['Patrol. Same route. Every day. I could do it asleep. Some days I think I do.', 'Stay out of the Royal Garden unless you are invited.', 'Seen anything odd? No? Good. Nothing odd ever happens here.'] },
  x_guard4: { name: 'Court Guard', look: COURT_GUARD_LOOK, route: [[42, 26], [58, 26]], night: true,
    lines: ['Mind the peacocks. They bite.', 'The garden gate stays locked. Always has.', 'You are from the valley? Lucky. Real soil, real weather.'] },
  // Pairs: they gossip with each other, and a little with you.
  x_lady: { name: 'Lady Corisande', look: noble(SK[0], ['#c8a048', '#a07a30'], 'long', ['#8a3a6a', '#6a2a50'], '#5a2040'), at: [27, 18], dir: DIRS.right, pair: 'x_lord',
    lines: ['Do you mind? We are in the middle of something terribly important.', 'Your boots are muddy. How rustic. How brave.'] },
  x_lord: { name: 'Lord Aubrey', look: noble(SK[1], ['#2a1a10', '#1a100a'], 'short', ['#2a4a8a', '#1a3060'], '#1a2a50', 'cap'), at: [29, 18], dir: DIRS.left, pair: 'x_lady',
    lines: ['A farmer! At Court! What a time to be alive. What a long time.', 'I have not been ill a day in my life. Nobody here has. Is that unusual where you are from?'] },
  x_scholar: { name: 'Archivist Pell', look: noble(SK[3], ['#d8d4cc', '#b4b0a8'], 'bald', ['#5a5040', '#40382c'], '#3a3028'), at: [41, 22], dir: DIRS.right, pair: 'x_merchant',
    lines: ['I keep the royal records. All of them. They go back a very long way, and the King is in every one.', 'Do not ask me about the old census. Please. I have been asked not to answer.'] },
  x_merchant: { name: 'Factor Wynn', look: noble(SK[2], ['#3a2a1a', '#2a1a10'], 'crop', ['#7a5a2a', '#5a4020'], null, 'cap'), at: [43, 22], dir: DIRS.left, pair: 'x_scholar',
    lines: ['Grain prices? Steady. They are always steady. It is almost boring.', 'I buy from every province. The Tithe comes in green and leaves in gold.'] },
  x_page: { name: 'Page Tibbet', look: noble(SK[0], ['#c2703a', '#96522a'], 'messy', ['#2f6a3a', '#1f4a28'], null), at: [12, 19], dir: DIRS.right, pair: 'x_maid',
    lines: ['I carry messages. Mostly to the kitchens. Mostly about soup.', 'One day I will be a guard. They get helmets!'] },
  x_maid: { name: 'Hester, a maid', look: Object.assign(noble(SK[1], ['#4a3020', '#2a1a10'], 'bun', ['#5a5a6a', '#40404c'], null), { apron: '#efe6d2' }), at: [14, 19], dir: DIRS.left, pair: 'x_page',
    lines: ['Off to the market for the cook. She wants honey cake again.', 'The fountain water? I would not drink it. Nobody says why. Nobody drinks it.'] },
  // Passers-by wander the square.
  x_walker1: { name: 'Townswoman', look: noble(SK[2], ['#1a100a', '#100804'], 'long', ['#c87a30', '#a05a20'], null), wander: [24, 13, 41, 31],
    lines: ['Lovely day for the market.', 'Have you tried the honey cake? Lisette makes it fresh. Well. Every day, the same.'] },
  x_walker2: { name: 'Old Courtier', look: noble(SK[3], ['#e0e0e0', '#c0c0c0'], 'short', ['#4a6a4a', '#304a30'], '#2a3a2a', 'cap'), wander: [24, 13, 41, 31],
    lines: ['I remember when I was young here. I look the same now. Funny, that.', 'Walk with me? No? Then walk somewhere else, there is a dear.'] },
};
// What the pairs say to each other, in turn.
// What gossiping pairs say instead, once the Crown has fallen.
const GOSSIP_AFTER = {};
const GOSSIP = {
  x_lady: [['x_lady', 'Did you see the Duchess\'s new gown?'], ['x_lord', 'Green again. It is always green.'], ['x_lady', 'Everything is green this year.'], ['x_lord', 'Every year, my dear. Every year.'], ['x_lady', 'Hush, the guard is looking.']],
  x_scholar: [['x_merchant', 'The northern Tithe came in early.'], ['x_scholar', 'It always does. I have the ledgers.'], ['x_merchant', 'Do the ledgers say what it is for?'], ['x_scholar', '...Lovely weather, isn\'t it?']],
  x_page: [['x_page', 'Can I come to the market?'], ['x_maid', 'Only if you carry the basket.'], ['x_page', 'Can I have a bonbon?'], ['x_maid', 'Only if you carry the basket quietly.']],
};
// What passers-by say when they bump into each other.
const MEETINGS = [
  ['Good day to you!', 'And to you. Lovely roses this year.'], ['Have you heard the news?', 'Darling, there is never any news.'],
  ['Off to the market?', 'Honey cake. I cannot help myself.'], ['What a fine day.', 'Every day is a fine day here.'],
  ['Your gown is divine.', 'This old thing? It is new.'], ['Is the King receiving today?', 'He is always receiving. Nobody is ever received.'],
  ['Mind the peacocks.', 'They bit me last week.'], ['Walk with me?', 'Only as far as the fountain.'],
];
// What passers-by say depends on where they are, and whether the King still reigns.
const MEETINGS_AT = {
  capital: () => (Memory.get('crown_fallen') ? [
    ['Good day to you!', 'And to you. Strange days.'], ['Have you heard the news?', 'Darling, there is nothing BUT news now.'],
    ['Off to the market?', 'Bread costs more this year. I do not mind. Nobody was taken for it.'], ['The gate is open.', 'I went in. It is just a big house.'],
    ['Mind the peacocks.', 'They bit me last week.'], ['Walk with me?', 'Only as far as the fountain.'],
  ] : null),
  saltmere: () => [
    ['Morning! Lovely tide.', 'Is it going out or coming in?'], ['Seen the crab races?', 'Lost three coppers on Pinchy. Again.'],
    ['Off to the market?', 'Tilda has eels. I cannot resist an eel.'], ['Sunny out!', 'Hat on, then.'],
    ['Mind the gulls.', 'One took my whole sandwich.'], ['Fancy a swim?', 'The lifeguard says no.'],
  ],
};
MEETINGS_AT.castle = MEETINGS_AT.capital;
const Extras = {
  list: [], built: 0,
  build() {
    this.list = Object.keys(EXTRAS).map(id => this.make(id)); this.built = this.list.length;
    // Someone who walks with someone else starts out at their side, not across the map.
    for (const p of this.list) { const lead = p.e.follow && this.list.find(o => o.id === p.e.follow); if (lead) { p.x = p.tx = lead.x + 14; p.y = p.ty = lead.y; } }
  },
  make(id) {
    const e = EXTRAS[id], spot = e.at || (e.route && e.route[0]) || (e.dance && [e.dance.cx, e.dance.cy]) || null;
    let p = spot || [10, 10];
    // Wanderers start somewhere clear, never inside the furniture.
    if (e.wander && !spot) {
      const mm = World.maps[e.map || 'capital'];
      for (let k = 0; k < 60; k++) {
        const c = [e.wander[0] + Math.floor(Math.random() * (e.wander[2] - e.wander[0])), e.wander[1] + Math.floor(Math.random() * (e.wander[3] - e.wander[1]))];
        p = c;
        if (!mm || (!World.solid(mm, c[0], c[1]) && !World.at(mm, c[0], c[1]))) break;
      }
    }
    return { id, e, map: e.map || 'capital', x: p[0] * TILE + 8, y: p[1] * TILE + 12, tx: p[0] * TILE + 8, ty: p[1] * TILE + 12, dir: e.dir === undefined ? DIRS.down : e.dir, leg: 1, t: Math.random() * 3, moving: false, frameT: 0, say: null, sayT: Math.random() * 3, line: 0, meetT: 4 + Math.random() * 8, queue: [], clock: Math.random() * 10 };
  },
  // The King's people leave when the Crown falls; others only come once it has.
  fallen() { return !!(S && Memory.get('crown_fallen')); },
  // The full crowds only come once the main story is over.
  here(p) { if (this.fallen() ? p.e.royal : p.e.afterFall) return false; if (p.e.later && !(S && S.ending)) return false; const night = S.time >= 1200 || S.time < 420; if (p.e.only) return p.e.only === 'night' ? S.time >= 1140 || S.time < 300 : !night; return !night || p.e.night; },
  active(m) { return this.list.filter(p => p.map === m.id && this.here(p)); },
  bubble(p, text, t = 2.8) { p.say = text; p.sayEnd = t; },
  face(p, x, y) { p.dir = Math.abs(x - p.x) > Math.abs(y - p.y) ? (x > p.x ? DIRS.right : DIRS.left) : (y > p.y ? DIRS.down : DIRS.up); },
  update(dt) {
    const m = Player.map;
    if (!m) return;
    if (this.built !== Object.keys(EXTRAS).length) this.build();
    const here = this.active(m);
    for (const p of here) this.step(p, dt, m, here);
  },
  step(p, dt, m, here) {
    const e = p.e;
    p.clock += dt; p.sayT -= dt; p.meetT -= dt;
    if (p.sayEnd > 0) { p.sayEnd -= dt; if (p.sayEnd <= 0) p.say = null; }
    for (const q of p.queue) q.t -= dt;
    p.queue = p.queue.filter(q => { if (q.t > 0) return true; this.bubble(p, q.text); return false; });
    // Pairs take turns talking.
    if (GOSSIP[p.id] && p.sayT <= 0) {
      const lines = (this.fallen() && GOSSIP_AFTER[p.id]) || GOSSIP[p.id], [who, text] = lines[p.line % lines.length], speaker = here.find(o => o.id === who);
      if (speaker) this.bubble(speaker, text);
      p.line++; p.sayT = 3.4;
    }
    // Musicians play; notes drift up.
    if (e.music && p.clock > 0.7) { p.clock = 0; VFX.emit('star', p.x + 6, p.y - 24, { vy: -18, vx: (Math.random() - 0.5) * 8, t: 1.1, color: e.music }); if (Math.hypot(p.x - Player.x, p.y - Player.y) < 140 && Math.random() < 0.35) Sfx.play(e.sound || 'harp'); }
    // Dancers turn about the floor together.
    if (e.dance) {
      const d = e.dance, a = (S.time * 0 + performance.now() / 1000) * (d.speed || 0.9) + (d.phase || 0);
      const nx = d.cx * TILE + 8 + Math.cos(a) * d.r, ny = d.cy * TILE + 12 + Math.sin(a) * d.r * 0.6;
      this.face(p, nx + (nx - p.x) * 20, ny + (ny - p.y) * 20);
      p.x = nx; p.y = ny; p.moving = true; p.frameT += dt * 5;
      return;
    }
    // Someone who walks with someone else keeps at their side.
    if (e.follow) {
      const lead = here.find(o => o.id === e.follow);
      if (lead) { p.tx = lead.x - (lead.dir === DIRS.left ? -14 : 14); p.ty = lead.y + 2; if (Math.hypot(p.tx - p.x, p.ty - p.y) < 3 && !lead.moving) p.dir = lead.dir; }
    } else if (e.route) {
      const [tx, ty] = e.route[p.leg];
      p.tx = tx * TILE + 8; p.ty = ty * TILE + 12;
      if (Math.hypot(p.tx - p.x, p.ty - p.y) < 2) { p.leg = (p.leg + 1) % e.route.length; p.pause = e.stop || 2; }
    } else if (e.wander) {
      // Two passers-by who meet stop for a word.
      if (p.meetT <= 0 && !(p.pause > 0)) {
        const o = here.find(q => q !== p && q.e.wander && !(q.pause > 0) && q.meetT <= 0 && Math.hypot(q.x - p.x, q.y - p.y) < 26);
        if (o) {
          const pool = (MEETINGS_AT[m.id] && MEETINGS_AT[m.id]()) || MEETINGS, [a, b] = pool[Math.floor(Math.random() * pool.length)];
          p.pause = o.pause = 4; p.meetT = o.meetT = 14 + Math.random() * 10; p.tx = p.x; p.ty = p.y; o.tx = o.x; o.ty = o.y;
          this.face(p, o.x, o.y); this.face(o, p.x, p.y); this.bubble(p, a, 2); o.queue.push({ t: 2, text: b });
        }
      }
      p.t -= dt;
      if (p.t <= 0 && !(p.pause > 0)) {
        p.t = 2 + Math.random() * 4;
        const x = e.wander[0] + Math.floor(Math.random() * (e.wander[2] - e.wander[0])), y = e.wander[1] + Math.floor(Math.random() * (e.wander[3] - e.wander[1]));
        if (!World.solid(m, x, y) && !World.at(m, x, y)) { p.tx = x * TILE + 8; p.ty = y * TILE + 12; }
      }
    }
    p.pause = Math.max(0, (p.pause || 0) - dt);
    const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
    p.moving = d > 2 && p.pause <= 0;
    if (p.moving) {
      const sp = (e.speed || 26) * (e.follow && d > 24 ? 1.6 : 1) * dt, nx = p.x + dx / d * Math.min(sp, d), ny = p.y + dy / d * Math.min(sp, d);
      if (World.solid(m, Math.floor(nx / TILE), Math.floor((ny - 2) / TILE)) && !e.follow && !e.swim) { p.tx = p.x; p.ty = p.y; } else { p.x = nx; p.y = ny; }
      p.frameT += dt * 6;
      this.face(p, p.x + dx, p.y + dy);
    } else if (e.dir !== undefined && !e.route && !e.wander && !e.follow && !(p.pause > 0 && p.talkT > 0)) p.dir = e.dir;
  },
  frame(p) { return Art.charFrame(p.id, p.e.look, p.dir, p.moving ? Math.floor(p.frameT) % 4 : 0); },
  // A fishing rod held out the way they face: from the hands to the tip, and the line dropping from the
  // tip to the bobber in the water ahead of them.
  ROD: { 0: [5, -12, 8, 6, 8, 16], 1: [-4, -14, -2, -30, -2, -22], 2: [4, -12, 18, -20, 18, 2], 3: [-4, -12, -18, -20, -18, 2] },
  rodGeom(p) { const r = this.ROD[p.dir] || this.ROD[0], x = Math.round(p.x), y = Math.round(p.y); return { hx: x + r[0], hy: y + r[1], tx: x + r[2], ty: y + r[3], bx: x + r[4], by: y + r[5] }; },
  drawRod(g, p) {
    const k = this.rodGeom(p), n = Math.max(Math.abs(k.tx - k.hx), Math.abs(k.ty - k.hy));
    g.fillStyle = '#7a5535';
    for (let i = 0; i <= n; i++) g.fillRect(Math.round(k.hx + (k.tx - k.hx) * i / n), Math.round(k.hy + (k.ty - k.hy) * i / n), 1, 1);
    g.fillStyle = '#a07a4c'; g.fillRect(k.hx, k.hy, 2, 2);
    const bob = Math.round(Math.sin(performance.now() / 400 + p.x));
    g.fillStyle = '#e8e8f0'; g.fillRect(k.tx, Math.min(k.ty, k.by), 1, Math.abs(k.by - k.ty) + bob);
    g.fillStyle = '#e04050'; g.fillRect(k.bx - 1, k.by + bob, 3, 2); g.fillStyle = '#ffffff'; g.fillRect(k.bx - 1, k.by + bob, 1, 1);
  },
  draw(g, items, m) {
    for (const p of this.active(m)) {
      items.push({ y: p.y, draw: () => {
        const x = Math.round(p.x), y = Math.round(p.y), e = p.e;
        // Swimmers sit low in the water and bob; surfers ride a board.
        const wet = e.prop === 'swim' || e.prop === 'surf', bob = wet ? Math.round(Math.sin(performance.now() / 420 + p.x * 0.1) * 1.5) : 0;
        if (e.prop === 'surf') { g.fillStyle = e.board || '#f0d040'; g.fillRect(x - 10, y - 2 + bob, 20, 3); g.fillStyle = '#ffffff'; g.fillRect(x - 9, y - 2 + bob, 18, 1); }
        if (!wet) Render.shadow(g, p.x, p.y, 12);
        g.drawImage(this.frame(p), x - 9, y - 26 + bob + (e.prop === 'swim' ? 9 : e.prop === 'surf' ? -2 : 0));
        if (e.prop === 'swim') { g.fillStyle = 'rgba(58,122,192,0.9)'; g.fillRect(x - 9, y - 7 + bob, 18, 8); g.fillStyle = 'rgba(240,248,255,0.8)'; g.fillRect(x - 8 + (bob > 0 ? 1 : 0), y - 8 + bob, 16, 1); }
        if (e.prop === 'surf') { g.fillStyle = 'rgba(240,248,255,0.7)'; g.fillRect(x - 13 + bob, y + 1, 5, 1); g.fillRect(x + 9 - bob, y + 1, 4, 1); }
        // A kite on a long string, high above.
        if (e.prop === 'kite') { const t = performance.now() / 1000, kx = x + 22 + Math.round(Math.sin(t * 0.9 + p.x) * 6), ky = y - 64 + Math.round(Math.cos(t * 1.3) * 4); g.fillStyle = 'rgba(240,240,240,0.7)'; for (let i = 0; i < 20; i++) g.fillRect(Math.round(x + 5 + (kx - x - 5) * i / 20), Math.round(y - 16 + (ky - y + 16) * i / 20 + Math.sin(i / 3) * 2), 1, 1); g.fillStyle = e.kite || '#e04050'; g.fillRect(kx - 3, ky - 4, 7, 4); g.fillRect(kx - 2, ky, 5, 2); g.fillRect(kx - 1, ky + 2, 3, 2); g.fillStyle = '#f0d040'; g.fillRect(kx, ky - 4, 1, 8); for (let i = 0; i < 4; i++) g.fillRect(kx + Math.round(Math.sin(t * 4 + i) * 2), ky + 5 + i * 3, 2, 1); }
        if (e.prop === 'spade') { const b = Math.round(Math.abs(Math.sin(performance.now() / 250)) * 3); g.fillStyle = '#a07a4c'; g.fillRect(x + 6, y - 14 + b, 1, 9); g.fillStyle = '#c8ccd4'; g.fillRect(x + 5, y - 6 + b, 3, 3); }
        if (e.prop === 'hammer') { const t = performance.now() / 1000 * 3.2 + p.x * 0.05, sw = Math.max(0, Math.sin(t * Math.PI)), hx = x + 6, hy = y - 18 + Math.round(sw * 6); g.fillStyle = '#7a5535'; g.fillRect(hx, hy, 1, 8); g.fillStyle = '#8a8a92'; g.fillRect(hx - 2, hy - 1, 5, 3); g.fillStyle = '#c8ccd4'; g.fillRect(hx - 2, hy - 1, 5, 1); }
        if (e.prop === 'crate') { g.fillStyle = '#a07a4c'; g.fillRect(x - 6, y - 32, 12, 9); g.fillStyle = '#7a5535'; g.fillRect(x - 6, y - 28, 12, 1); g.fillStyle = '#c0c8d0'; g.fillRect(x - 4, y - 34, 3, 2); g.fillRect(x + 1, y - 35, 4, 3); }
        if (e.prop === 'brush') { const b = Math.round(Math.sin(performance.now() / 300) * 2); g.fillStyle = '#7a5535'; g.fillRect(x + 7, y - 18 + b, 1, 6); g.fillStyle = ['#e04050', '#3a7ac0', '#f0d040'][Math.floor(performance.now() / 1500) % 3]; g.fillRect(x + 7, y - 19 + b, 1, 2); }
        // A tray of food, for those who serve.
        if (e.tray) { g.fillStyle = '#c8ccd4'; g.fillRect(x - 7, y - 17, 14, 2); g.fillStyle = e.tray; g.fillRect(x - 5, y - 20, 4, 3); g.fillStyle = '#e8b050'; g.fillRect(x, y - 20, 4, 3); }
        // Three balls in the air, for the jester.
        if (e.juggle) for (let i = 0; i < 3; i++) { const a = performance.now() / 250 + i * 2.09; g.fillStyle = ['#c43030', '#e8c040', '#2a6ab0'][i]; g.fillRect(x + Math.round(Math.cos(a) * 6) - 1, y - 32 - Math.round(Math.abs(Math.sin(a)) * 9), 3, 3); }
        if (e.prop === 'squeeze') { const w = 3 + Math.round(Math.sin(performance.now() / 160) * 2); g.fillStyle = '#8a2a2a'; g.fillRect(x - 2 - w, y - 16, 4, 6); g.fillRect(x + 2 + w, y - 16, 4, 6); g.fillStyle = '#e8e0d0'; for (let i = 0; i < w * 2 + 4; i += 2) g.fillRect(x + 2 - w + i, y - 15, 1, 4); }
        if (e.prop === 'fiddle') { g.fillStyle = '#a0502c'; g.fillRect(x + 3, y - 20, 6, 4); g.fillStyle = '#3a2414'; g.fillRect(x + 8, y - 22, 4, 1); g.fillStyle = '#e8e0d0'; const b = Math.round(Math.sin(performance.now() / 120) * 3); g.fillRect(x - 2 + b, y - 21, 9, 1); }
        if (e.prop === 'mop') { const b = Math.round(Math.sin(performance.now() / 200) * 3); g.fillStyle = '#a07a4c'; g.fillRect(x + 6 + b, y - 18, 1, 16); g.fillStyle = '#d8d0b8'; g.fillRect(x + 4 + b, y - 2, 5, 3); }
        if (e.prop === 'rod') this.drawRod(g, p, x, y);
        if (e.prop === 'dice' && Math.floor(performance.now() / 900 + x) % 4 === 0) { g.fillStyle = '#f0ece0'; g.fillRect(x + (p.dir === DIRS.left ? -10 : 8), y - 6 - Math.round(Math.abs(Math.sin(performance.now() / 120)) * 6), 3, 3); }
        if (e.prop === 'lute') { g.fillStyle = '#a0703c'; g.fillRect(x + 2, y - 16, 6, 5); g.fillStyle = '#6a4a28'; g.fillRect(x + 7, y - 20, 1, 6); }
        if (e.prop === 'harp') { g.fillStyle = '#e8c040'; g.fillRect(x + 8, y - 24, 2, 16); g.fillRect(x + 8, y - 24, 8, 2); g.fillRect(x + 14, y - 24, 2, 14); g.fillStyle = '#fff0c0'; for (let i = 0; i < 3; i++) g.fillRect(x + 10 + i * 2, y - 22, 1, 12); }
        if (e.prop === 'shears') { g.fillStyle = '#c8ccd4'; g.fillRect(x + 7, y - 14, 5, 1); g.fillRect(x + 7, y - 12, 5, 1); if (Math.floor(performance.now() / 300) % 2) VFX.emit('heal', x + 12, y - 12, { color: '#4f9642', vy: 10, t: 0.4 }); }
        if (p.say && Math.hypot(p.x - Player.x, p.y - Player.y) < 160) {
          const tw = Font.width(p.say), bx = Math.round(clamp(p.x - tw / 2, Render.cam.x + 4, Render.cam.x + UI.W - tw - 8)), by = y - 42;
          g.fillStyle = 'rgba(255,250,235,0.92)'; g.fillRect(bx - 3, by - 2, tw + 6, 11);
          g.fillStyle = '#2a1a10'; g.fillRect(bx - 3, by + 9, tw + 6, 1); g.fillRect(x, by + 9, 2, 3);
          Font.draw(g, p.say, bx, by, '#2a1a10');
        }
      } });
    }
  },
  talk(p) {
    const e = p.e;
    this.face(p, Player.x, Player.y);
    p.pause = 3; p.talkT = 3;
    const lines = (this.fallen() && e.fallen) || e.lines;
    UI.say(p.id, lines[Math.floor(Math.random() * lines.length)]);
  },
};

// Two stallholders: real people of the Court, with things to sell and things to say.
// Neither has a quest. They are just glad of the trade.
npc({
  id: 'lisette', name: 'Lisette Marrow', role: 'Court confectioner', remote: true,
  look: { skin: '#f0c49a', skinD: '#d9a678', hair: '#e8d8a8', hairD: '#c8b888', style: 'bun', shirt: '#e88aa8', shirtD: '#c86a88', apron: '#ffffff', pants: '#5a3a4a', pantsD: '#40283a', shoes: '#2a1a10' },
  sched: [[480, 'capital', 26, 26], [1140, 'capital', 26, 26, true]],
  loves: ['strawberry', 'blackberry', 'egg'], likes: ['kind:crop', 'kind:food'], hates: ['coal', 'stone'],
  greet: ['Honey cake? Fresh this morning. Fresh every morning.', 'Oh, a new face! We almost never get new faces.', 'Mind the wasps. They love me.'],
  chat: [
    { h: 0, t: 'My mother ran this stall, and her mother. Same recipes. Same stall. Same customers, come to think of it.' },
    { h: 2, t: 'Real valley eggs! You have no idea. Everything here tastes of the same green garden.' },
    { h: 4, t: 'I tried to leave the city once, to see the sea. I got as far as the gate and turned back. I still do not know why.' },
  ],
  reactions: [],
  extra(opts) { opts.push({ text: 'Trade', fn: () => UI.push(UI.shop('court_sweets', 'lisette')) }); },
});
npc({
  id: 'orrin', name: 'Orrin Vale', role: 'Silk merchant', remote: true,
  look: { skin: '#c88a5a', skinD: '#a86a40', hair: '#2a1a10', hairD: '#1a100a', style: 'short', beard: '#2a1a10', shirt: '#4a9a7a', shirtD: '#2a6a4a', cape: '#e0b85a', pants: '#3a3040', pantsD: '#2a2030', shoes: '#2a1a10', hat: 'cap', hatC: '#4a9a7a', hatD: '#2a6a4a' },
  sched: [[480, 'capital', 38, 26], [1140, 'capital', 38, 26, true]],
  loves: ['pearl', 'amethyst', 'gold_ore'], likes: ['kind:gift', 'quartz'], hates: ['kind:forage'],
  greet: ['Silks, scents, fine things. Nothing practical. That is the point.', 'Ah! Someone with mud on their boots. You need a gift for someone, I can tell.', 'Feel that silk. No, go on.'],
  chat: [
    { h: 0, t: 'A ribbon for a sweetheart, perfume for a mother, a comb for someone you are trying very hard to impress. I know my trade.' },
    { h: 2, t: 'I sell to every province. Funny thing: nobody outside the Court ever seems to get any older or richer. Only us.' },
    { h: 4, t: 'You did not get those calluses buying silk. I like you. Do not tell the other merchants.' },
  ],
  reactions: [],
  extra(opts) { opts.push({ text: 'Trade', fn: () => UI.push(UI.shop('court_silks', 'orrin')) }); },
});
(() => {
  const stock = UI.stock.bind(UI);
  UI.stock = kind => {
    if (kind === 'court_sweets') return [{ id: 'honey_cake', price: 180 }, { id: 'royal_tea', price: 120 }, { id: 'court_bonbons', price: 140 }];
    if (kind === 'court_silks') return [{ id: 'silk_ribbon', price: 220 }, { id: 'rose_perfume', price: 320 }, { id: 'gilded_comb', price: 280 }];
    return stock(kind);
  };
  // You can talk to a stallholder across the counter.
  OBJDEF.stall.reach = 1;
  // Gifts and the new foods go where they belong in the chest and the Codex.
  const kinds = STORAGE_TABS.find(t => t[0] === 'Gear'); if (kinds) kinds[1].push('gift');
})();

// ---- Hooking it all in ---------------------------------------------------------------------
(() => {
  // Speakers: background people talk with their own name and face.
  const speaker = UI.speaker.bind(UI);
  UI.speaker = who => (who && EXTRAS[who] ? { name: EXTRAS[who].name, id: who, look: EXTRAS[who].look } : speaker(who));
  // Every frame.
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) { tick(dt); const d = dt || 1 / 60; Critters.update(d); Animals.update(d); Extras.update(d); };
  // Drawn with everything else.
  const drawWorld = Story.drawWorld.bind(Story);
  Story.drawWorld = function (g, m, items) { drawWorld(g, m, items); Animals.draw(g, items); Extras.draw(g, items, m); };
  const vfxDraw = VFX.draw;
  VFX.draw = function (g) { Critters.draw(g); return vfxDraw.call(this, g); };
  const lighting = Render.lighting;
  Render.lighting = function (...a) { const r = lighting.apply(this, a); Critters.glow(a[0]); return r; };
  // Walk up to an animal or a passer-by and press E.
  const scan = Interact.scan.bind(Interact);
  Interact.scan = function () {
    const base = scan(), m = Player.map, t = Player.target(), cx = t.x * TILE + 8, cy = t.y * TILE + 8;
    const baseD = base ? Math.hypot(base.tile[0] * TILE + 8 - cx, base.tile[1] * TILE + 8 - cy) : Infinity;
    // Facing a counter with someone behind it: they get the prompt, whoever is passing.
    const over = m && World.at(m, t.x, t.y);
    if (base && /^(Talk to |Pickpocket )/.test(base.label) && over && OBJDEF[over.type].reach) return base;
    // Real characters (story people, shopkeepers) keep the prompt unless a passer-by is clearly nearer.
    let best = null, bd = Math.min(baseD - (base && /^(Talk to |Pickpocket )/.test(base.label) ? 8 : 0), 22);
    for (const a of Animals.list) {
      if (a.gone > 0 || Math.hypot(a.x - Player.x, a.y - Player.y) > 28) continue;
      const d = Math.hypot(a.x - cx, a.y - 4 - cy), A = ANIMALS[a.kind];
      if (d < bd) { bd = d; best = { tile: [Math.floor(a.x / TILE), Math.floor(a.y / TILE)], label: Animals.awake(a) ? `Pet the ${A.name}` : `The ${A.name} is asleep`, sprite: () => ({ img: Animals.img(a), x: Math.round(a.x - A.w / 2), y: Math.round(a.y - A.h + 2) }), ax: a.x, ay: a.y - A.h - 4, run: () => (Animals.awake(a) ? Animals.pet(a) : toast(`Shh. The ${A.name} is asleep.`)) }; }
    }
    if (m) for (const p of Extras.active(m)) {
      if (Math.hypot(p.x - Player.x, p.y - Player.y) > 30) continue;
      const d = Math.hypot(p.x - cx, p.y - 6 - cy);
      if (d < bd) { bd = d; best = { tile: [Math.floor(p.x / TILE), Math.floor(p.y / TILE)], label: `Talk to ${p.e.name}`, sprite: () => ({ img: Extras.frame(p), x: Math.round(p.x) - 9, y: Math.round(p.y) - 26 }), ax: p.x, ay: p.y - 30, run: () => Extras.talk(p) }; }
    }
    return best || base;
  };
})();
