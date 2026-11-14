'use strict';
// Stage 3 art: dungeon and wilderness objects, enemies, weapon icons, highlights.

(() => {
  const { mk, P, outlined, blob, STATIC, ICONS, house_defs, memo } = Art;

  const node = (dark, mid, light, fleck) => () => outlined(mk(16, 16, g => {
    const r = mulberry(21);
    blob(g, 8, 10, 6, [dark, mid, light, '#c2c2c8'], r);
    for (const [x, y] of [[5, 7], [10, 6], [7, 11], [11, 11], [4, 11]]) { P(g, fleck, x, y, 2, 2); P(g, '#ffffffaa', x, y); }
  }));
  STATIC.copper_node = node('#5f5f66', '#78787f', '#94949c', '#d8884c');
  STATIC.iron_node = node('#54545c', '#6c6c74', '#88888f', '#dfe6ee');
  STATIC.gold_node = node('#4a4a52', '#62626a', '#7e7e86', '#f7d774');
  STATIC.gem_node = node('#4a4a58', '#5e5e70', '#7a7a90', '#b98ae8');

  // The rock hiding a mine ladder has a crack through it.
  STATIC.crackedrock = () => outlined(mk(16, 16, g => {
    blob(g, 8, 10, 5, ['#6e6e74', '#85858c', '#a0a0a8', '#c2c2c8'], mulberry(11));
    for (const [x, y] of [[7, 5], [8, 6], [8, 7], [7, 8], [8, 9], [9, 10], [9, 11], [8, 12], [6, 8], [5, 9], [10, 9], [11, 8]]) P(g, '#2a2a30', x, y);
  }));
  STATIC.rubble = s => outlined(mk(16, 20, g => {
    const r = mulberry(61);
    blob(g, 5, 14, 4, ['#66605a', '#7f7870', '#9a9288', '#b8b0a4'], r);
    blob(g, 11, 13, 5, ['#5e5852', '#776f68', '#928a80', '#b0a89c'], r);
    blob(g, 8, 8, 4, ['#6a645c', '#857d74', '#a09890', '#c0b8ac'], r);
    if (s === 3) P(g, '#f0f6fc', 5, 4, 7, 2);
  }));
  STATIC.hardrubble = () => outlined(mk(16, 22, g => {
    const r = mulberry(62);
    blob(g, 8, 13, 7, ['#3e3a40', '#524e54', '#68646a', '#8a868c'], r);
    blob(g, 8, 6, 5, ['#46424a', '#5a565e', '#726e76', '#92909a'], r);
    P(g, '#2a262c', 6, 10, 5, 1); P(g, '#2a262c', 9, 11, 1, 4);
  }));
  STATIC.crackwall = () => mk(16, 16, g => {
    P(g, '#4e453c', 0, 0, 16, 16); P(g, '#6b5d4e', 0, 4, 16, 12); P(g, '#7d6e5c', 0, 4, 16, 2);
    P(g, '#2a241e', 7, 4, 2, 4); P(g, '#2a241e', 5, 8, 3, 3); P(g, '#2a241e', 8, 10, 3, 2); P(g, '#2a241e', 10, 12, 2, 4); P(g, '#2a241e', 4, 11, 2, 3);
  });
  STATIC.thicket = s => outlined(mk(20, 22, g => {
    const r = mulberry(33), pal = s === 3 ? ['#7c8a84', '#9aa8a0', '#b8c4bc', '#dce4e0'] : ['#34603a', '#467a44', '#62964f', '#88b466'];
    blob(g, 6, 14, 6, pal, r); blob(g, 14, 14, 6, pal, r); blob(g, 10, 8, 7, pal, r);
    for (let i = 0; i < 7; i++) P(g, '#6b4a2a', 3 + Math.floor(r() * 14), 5 + Math.floor(r() * 13), 1, 3);
  }));
  const chest = open => () => outlined(mk(20, 18, g => {
    P(g, '#7a5535', 1, 7, 18, 10); P(g, '#a07a4c', 1, 7, 18, 2); P(g, '#55555f', 1, 12, 18, 1); P(g, '#55555f', 3, 7, 2, 10); P(g, '#55555f', 15, 7, 2, 10);
    if (open) { P(g, '#3a2414', 2, 3, 16, 5); P(g, '#a07a4c', 1, 1, 18, 3); P(g, '#55555f', 3, 1, 2, 3); P(g, '#55555f', 15, 1, 2, 3); }
    else { P(g, '#a07a4c', 1, 2, 18, 5); P(g, '#c49a66', 1, 2, 18, 2); P(g, '#e0b85a', 8, 6, 4, 4); P(g, '#55555f', 3, 2, 2, 5); P(g, '#55555f', 15, 2, 2, 5); }
  }));
  STATIC.chest = chest(false); STATIC.chestopen = chest(true);
  STATIC.homechest = () => outlined(mk(20, 20, g => {
    P(g, '#8a4f2a', 1, 8, 18, 11); P(g, '#a8653a', 1, 8, 18, 2); P(g, '#e0b85a', 1, 13, 18, 1); P(g, '#e0b85a', 3, 8, 2, 11); P(g, '#e0b85a', 15, 8, 2, 11);
    P(g, '#a8653a', 1, 2, 18, 6); P(g, '#c98452', 1, 2, 18, 2); P(g, '#e0b85a', 3, 2, 2, 6); P(g, '#e0b85a', 15, 2, 2, 6); P(g, '#f7dd7a', 8, 7, 4, 4); P(g, '#6b3b1e', 9, 9, 2, 1);
  }));
  STATIC.ladder = () => outlined(mk(16, 16, g => {
    P(g, '#14100c', 1, 1, 14, 14); P(g, '#a07a4c', 3, 0, 2, 16); P(g, '#a07a4c', 11, 0, 2, 16);
    for (let y = 2; y < 16; y += 4) P(g, '#c49a66', 3, y, 10, 2);
  }));
  STATIC.stairs = () => outlined(mk(16, 16, g => {
    for (let i = 0; i < 4; i++) { P(g, ['#a09890', '#8a8278', '#6e665c', '#524c44'][i], 1, 1 + i * 4, 14, 4); P(g, '#ffffff33', 1, 1 + i * 4, 14, 1); }
  }));
  STATIC.tent = () => outlined(mk(48, 36, g => {
    for (let y = 0; y < 30; y++) { const half = 3 + y * 0.72; P(g, '#8a6a4a', Math.round(24 - half), y + 4, Math.round(half * 2), 1); P(g, '#6e5238', Math.round(24 + half * 0.35), y + 4, Math.round(half * 0.65), 1); }
    for (let y = 8; y < 34; y++) { const h = (y - 8) * 0.34; P(g, '#2a1e14', Math.round(24 - h), y, Math.round(h * 2) + 1, 1); }
    P(g, '#3a2a1a', 0, 34, 48, 2);
  }));
  STATIC.campfire = () => outlined(mk(16, 18, g => {
    P(g, '#6f4c30', 2, 13, 12, 3); P(g, '#57391f', 4, 11, 8, 2);
    P(g, '#e0602c', 5, 5, 6, 7); P(g, '#f4a23a', 6, 7, 4, 5); P(g, '#fbe08a', 7, 9, 2, 3); P(g, '#e0602c', 7, 2, 2, 3);
  }));
  STATIC.wreck = () => outlined(mk(72, 44, g => {
    P(g, '#5f4128', 4, 22, 62, 20); P(g, '#775438', 4, 22, 62, 3); P(g, '#3f2c1c', 10, 28, 12, 12);
    for (let x = 6; x < 66; x += 7) P(g, '#46301e', x, 22, 1, 20);
    P(g, '#46301e', 44, 0, 4, 26); P(g, '#8a7a60', 26, 4, 20, 11); P(g, '#6a5c46', 26, 13, 20, 2);
    P(g, '#2a1e14', 50, 28, 8, 8);
  }));
  STATIC.palm = s => outlined(mk(34, 52, g => {
    P(g, '#8a6a44', 15, 18, 4, 34); P(g, '#a08058', 15, 18, 1, 34);
    const c = s === 3 ? ['#7a9a7e', '#a0bca4'] : ['#3f8a4a', '#5aa85a'];
    for (const [dx, dy] of [[-1, 0], [1, 0], [-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      for (let i = 0; i < 15; i++) P(g, i % 3 ? c[0] : c[1], 17 + dx * i, Math.round(16 + dy * i * 0.5 + i * i * 0.04), 2, 2);
    }
  }));
  STATIC.iron_door = () => outlined(mk(48, 42, g => {
    P(g, '#3c3c46', 0, 0, 48, 42); P(g, '#55555f', 2, 2, 44, 40);
    for (let x = 6; x < 46; x += 8) P(g, '#3c3c46', x, 2, 3, 40);
    P(g, '#3c3c46', 2, 14, 44, 3); P(g, '#3c3c46', 2, 28, 44, 3); P(g, '#c9a06a', 21, 18, 6, 8); P(g, '#2a241e', 23, 20, 2, 4);
  }));
  STATIC.torch = () => mk(16, 16, g => {
    P(g, '#5f4128', 7, 8, 2, 7); P(g, '#e0602c', 6, 3, 4, 5); P(g, '#f4a23a', 7, 4, 2, 4); P(g, '#fbe08a', 7, 6, 1, 2);
  });
  STATIC.archway = () => mk(16, 16, g => {
    P(g, '#14100c', 2, 2, 12, 14); P(g, '#5e564c', 0, 0, 16, 3); P(g, '#5e564c', 0, 0, 3, 16); P(g, '#5e564c', 13, 0, 3, 16);
  });
  STATIC.statue = s => outlined(mk(24, 44, g => {
    P(g, '#85858d', 3, 36, 18, 7); P(g, '#a0a0a8', 3, 36, 18, 2);
    P(g, '#8d8d94', 8, 14, 8, 22); P(g, '#a4a4ab', 8, 14, 3, 22); P(g, '#8d8d94', 9, 6, 6, 8); P(g, '#e0b85a', 8, 3, 8, 3); P(g, '#e0b85a', 9, 1, 1, 2); P(g, '#e0b85a', 14, 1, 1, 2); P(g, '#e0b85a', 11, 0, 2, 3);
    P(g, '#6e6e74', 4, 16, 4, 14); P(g, '#6e6e74', 16, 16, 4, 14);
    if (s === 3) P(g, '#f0f6fc', 8, 2, 8, 1);
  }));

  Object.assign(house_defs, {
    hut: { tw: 5, wallH: 32, roofH: 28, slope: 10, wall: ['#a89878', '#bfae8c', '#857658'], roof: ['#8a8a6a', '#a2a282', '#6a6a50'], chimney: 56, doorCol: 2, windows: [0.5, 3.5] },
    minehead: { tw: 5, wallH: 34, roofH: 30, slope: 12, wall: ['#6f4c30', '#8a6239', '#57391f'], roof: ['#55555f', '#6e6e7a', '#3c3c46'], deco(g, x0, wy, W, H) {
      P(g, '#14100c', x0 + 18, H - 26, 44, 26); P(g, '#a07a4c', x0 + 14, H - 30, 52, 5); P(g, '#a07a4c', x0 + 14, H - 30, 5, 30); P(g, '#a07a4c', x0 + 61, H - 30, 5, 30);
    } },
    keepfront: { tw: 10, wallH: 60, roofH: 22, slope: 2, stone: true, wall: ['#74747c', '#8c8c94', '#55555c'], roof: ['#44444e', '#55555f', '#30303a'], doorCol: 5, door: '#3c3c46', windows: [1.5, 7.5], deco(g, x0, wy) {
      for (let x = 0; x < 160; x += 20) P(g, '#55555c', x0 + x, 0, 12, 8);
      P(g, '#7a2f30', x0 + 60, wy + 2, 10, 24); P(g, '#7a2f30', x0 + 90, wy + 2, 10, 24); P(g, '#e0b85a', x0 + 63, wy + 8, 4, 2); P(g, '#e0b85a', x0 + 93, wy + 8, 4, 2);
    } },
  });

  // Weapon, relic and material icons
  Object.assign(ICONS, {
    sword: (g, a, b) => { P(g, a, 7, 1, 2, 10); P(g, b, 8, 2, 1, 9); P(g, '#c9a06a', 4, 10, 8, 2); P(g, '#7a5535', 7, 12, 2, 2); P(g, '#c9a06a', 7, 14, 2, 1); },
    dagger: (g, a, b) => { P(g, a, 7, 3, 2, 7); P(g, b, 8, 4, 1, 6); P(g, '#c9a06a', 5, 10, 6, 1); P(g, '#7a5535', 7, 11, 2, 3); },
    waraxe: (g, a, b) => { P(g, '#7a5535', 7, 1, 2, 14); P(g, a, 2, 2, 5, 8); P(g, a, 9, 2, 5, 8); P(g, b, 2, 8, 12, 2); P(g, '#e0e6ee', 2, 2, 1, 8); P(g, '#e0e6ee', 13, 2, 1, 8); },
    bow: g => { for (let i = 0; i < 12; i++) P(g, '#a07a4c', 4 + Math.round(Math.sin(i / 11 * 3.14) * 5), 2 + i, 2, 1); P(g, '#efe2c8', 4, 2, 1, 12); },
    arrow: g => { P(g, '#a07a4c', 4, 7, 9, 1); P(g, '#b4bcc8', 12, 6, 3, 3); P(g, '#efe2c8', 2, 5, 3, 1); P(g, '#efe2c8', 2, 9, 3, 1); P(g, '#efe2c8', 3, 6, 2, 3); },
    gem: (g, a, b) => { P(g, a, 5, 2, 6, 3); P(g, a, 3, 5, 10, 3); P(g, a, 5, 8, 6, 3); P(g, a, 7, 11, 2, 2); P(g, b, 9, 5, 4, 3); P(g, b, 8, 8, 3, 3); P(g, '#ffffffcc', 5, 3, 2, 2); },
    pelt: g => { P(g, '#8a8a92', 3, 3, 10, 10); P(g, '#6e6e76', 1, 4, 2, 3); P(g, '#6e6e76', 13, 4, 2, 3); P(g, '#6e6e76', 1, 10, 2, 3); P(g, '#6e6e76', 13, 10, 2, 3); P(g, '#a0a0a8', 5, 5, 5, 3); },
    shell: g => { for (let i = 0; i < 5; i++) P(g, i % 2 ? '#f0d8c0' : '#e0b8a0', 2 + i * 2, 4 + Math.abs(i - 2), 2, 9 - Math.abs(i - 2) * 2); P(g, '#c89880', 6, 12, 4, 2); },
    key: (g, a, b) => { P(g, a, 3, 3, 6, 6); P(g, '#00000000', 5, 5, 2, 2); g.clearRect(5, 5, 2, 2); P(g, a, 8, 7, 7, 2); P(g, b, 12, 9, 1, 3); P(g, b, 14, 9, 1, 2); },
    wedge: g => { for (let i = 0; i < 12; i++) P(g, i < 4 ? '#c87a48' : '#b4bcc8', 3 + i, 7 - Math.floor(i / 3), 1, 2 + Math.floor(i / 3) * 2); },
    horse: g => { P(g, '#6f5a40', 3, 6, 9, 4); P(g, '#6f5a40', 10, 3, 3, 5); P(g, '#57452f', 12, 3, 2, 2); P(g, '#57452f', 3, 10, 2, 3); P(g, '#57452f', 10, 10, 2, 3); P(g, '#57452f', 2, 13, 11, 1); P(g, '#7dbbe6', 6, 4, 1, 1); P(g, '#7dbbe6', 8, 11, 1, 1); },
    tally: g => { P(g, '#8a6239', 2, 2, 12, 12); P(g, '#a57a4c', 2, 2, 12, 1); for (let i = 0; i < 4; i++) P(g, '#3a2414', 4 + i * 2, 4, 1, 4); P(g, '#3a2414', 4, 6, 7, 1); for (let i = 0; i < 3; i++) P(g, '#3a2414', 4 + i * 2, 10, 1, 3); },
    backpack: (g, a, b) => { P(g, a, 3, 4, 10, 11); P(g, b, 11, 4, 2, 11); P(g, b, 5, 1, 6, 3); P(g, a, 6, 2, 4, 2); P(g, b, 3, 8, 10, 1); P(g, b, 5, 10, 6, 4); P(g, '#e0b85a', 7, 8, 2, 2); },
    bell: g => { P(g, '#85858d', 7, 1, 2, 9); P(g, '#a0a0a8', 7, 1, 1, 9); P(g, '#6c6c74', 5, 10, 6, 5); P(g, '#85858d', 6, 10, 2, 5); },
  });

  // ---- Enemies ---------------------------------------------------------
  const FOE_ART = {
    thornling: { w: 18, h: 18, draw(g, f) {
      const r = mulberry(3), y = f ? -1 : 0;
      blob(g, 9, 10 + y, 6, ['#2f4f2a', '#45703a', '#5f8f48', '#80b060'], r);
      for (const [x, yy] of [[2, 6], [15, 7], [5, 2], [12, 2], [9, 1], [1, 12], [16, 13]]) P(g, '#7a5535', x, yy + y, 1, 3);
      P(g, '#e04030', 6, 9 + y, 2, 2); P(g, '#e04030', 11, 9 + y, 2, 2);
      P(g, '#3a2a1a', 5, 16, 2, 2 - (f ? 1 : 0)); P(g, '#3a2a1a', 11, 16, 2, 1 + (f ? 1 : 0));
    } },
    // A lean, dark wolf, head low and hackles up, red-eyed, fangs bared, blood dripping from its jaw.
    wolf: { w: 31, h: 22, draw(g, f) {
      const D = '#2e2a34', M = '#45404c', L = '#625c6a', B = '#221e28', RED = '#a8141a', s = f ? 1 : -1;
      // Tail, held low and bushy.
      P(g, M, 1, 12, 2, 2); P(g, M, 2, 11, 3, 2); P(g, M, 4, 10, 4, 2); P(g, L, 4, 10, 3, 1); P(g, D, 1, 13, 3, 1);
      // Body: deep chest, tucked belly, a ridge of raised fur along the back.
      P(g, M, 7, 9, 13, 5); P(g, M, 17, 8, 5, 7); P(g, B, 8, 13, 9, 1); P(g, D, 18, 14, 4, 1);
      P(g, L, 8, 9, 9, 1); P(g, D, 10, 11, 1, 2); P(g, D, 12, 11, 1, 2); P(g, D, 14, 11, 1, 2); // ribs
      for (let x = 8; x <= 19; x += 2) { P(g, D, x, 7 + ((x / 2) % 2), 1, 2); P(g, L, x + 1, 8, 1, 1); }
      // Neck and lowered head.
      P(g, M, 20, 8, 4, 5); P(g, L, 20, 8, 3, 1);
      P(g, M, 22, 9, 5, 4); P(g, L, 22, 9, 4, 1);
      // Ears, pricked and pointed.
      P(g, D, 21, 6, 2, 3); P(g, D, 21, 5, 1, 1); P(g, D, 24, 6, 2, 3); P(g, D, 25, 5, 1, 1); P(g, '#7a4a50', 22, 7, 1, 1);
      // Long snout, black nose.
      P(g, M, 26, 10, 4, 2); P(g, L, 26, 10, 3, 1); P(g, '#101014', 29, 10, 2, 1);
      // A glowing red eye under a heavy brow.
      P(g, B, 23, 9, 3, 1); P(g, '#ff3a20', 24, 10, 1, 1); P(g, '#ffb0a0', 24, 10, 1, 1); P(g, '#ff3a20', 25, 10, 1, 1);
      // The jaw hangs open: dark mouth, white fangs, the lower jaw below.
      P(g, '#4a0a10', 25, 12, 5, 1); P(g, '#f4f0e0', 26, 12, 1, 1); P(g, '#f4f0e0', 28, 12, 1, 1);
      P(g, D, 24, 13, 5, 1); P(g, '#f4f0e0', 27, 13, 1, 1);
      // Blood on the muzzle, and a drip that grows and falls as it walks.
      P(g, RED, 29, 11, 1, 1); P(g, RED, 25, 13, 1, 1); P(g, RED, 28, 13, 1, 1);
      P(g, RED, 26, 14, 1, f ? 3 : 2); P(g, '#d02028', 26, 14, 1, 1);
      if (f) P(g, RED, 26, 19, 1, 1); else P(g, RED, 26, 16, 1, 1);
      // Legs and paws with claws; they swap as it walks.
      P(g, D, 8 + s, 14, 2, 6); P(g, D, 11 - s, 14, 2, 6); P(g, M, 18 - s, 15, 2, 5); P(g, M, 21 + s, 15, 2, 5);
      for (const x of [8 + s, 11 - s, 18 - s, 21 + s]) { P(g, B, x, 20, 3, 1); P(g, '#d8d4cc', x + 2, 20, 1, 1); }
    } },
    bat: { w: 18, h: 12, draw(g, f) {
      P(g, '#3a3044', 7, 4, 4, 5); P(g, '#e04030', 7, 5); P(g, '#e04030', 10, 5);
      if (f) { P(g, '#544660', 1, 2, 6, 3); P(g, '#544660', 11, 2, 6, 3); P(g, '#3a3044', 1, 1, 2, 1); P(g, '#3a3044', 15, 1, 2, 1); }
      else { P(g, '#544660', 1, 6, 6, 3); P(g, '#544660', 11, 6, 6, 3); P(g, '#3a3044', 0, 9, 2, 1); P(g, '#3a3044', 16, 9, 2, 1); }
    } },
    rockcrab: { w: 18, h: 18, draw(g, f) {
      const r = mulberry(11);
      blob(g, 9, 10, 6, ['#6e6e74', '#85858c', '#a0a0a8', '#c2c2c8'], r);
      if (f === 2) return;
      P(g, '#e04030', 6, 8); P(g, '#e04030', 12, 8);
      const a = f ? 1 : 0;
      for (const x of [2, 5, 12, 15]) P(g, '#54484a', x, 15 - (x + a) % 2, 1, 3);
      P(g, '#54484a', 0, 9 - a, 3, 2); P(g, '#54484a', 15, 9 + a - 1, 3, 2);
    } },
    saltclaw: { w: 20, h: 14, draw(g, f) {
      P(g, '#d4663a', 5, 5, 10, 6); P(g, '#a84a2a', 5, 9, 10, 2); P(g, '#2a1a12', 7, 3, 1, 2); P(g, '#2a1a12', 12, 3, 1, 2);
      const a = f ? 1 : 0;
      P(g, '#d4663a', 1, 3 + a, 4, 3); P(g, '#d4663a', 15, 3 + 1 - a, 4, 3); P(g, '#a84a2a', 1, 2 + a, 2, 1); P(g, '#a84a2a', 17, 2 + 1 - a, 2, 1);
      for (const x of [4, 7, 12, 15]) P(g, '#a84a2a', x, 11, 1, 2 + (x % 3 ? a : 1 - a));
    } },
    gloomling: { w: 20, h: 20, draw(g, f) {
      const r = mulberry(9), y = f ? -1 : 0;
      blob(g, 10, 11 + y, 7, ['#241c34', '#34284a', '#463660', '#604a80'], r);
      P(g, '#c8f0a0', 6, 9 + y, 3, 3); P(g, '#c8f0a0', 12, 9 + y, 3, 3); P(g, '#ffffff', 7, 10 + y); P(g, '#ffffff', 13, 10 + y);
    } },
  };
  FOE_ART.rootling = { w: 20, h: 22, draw(g, f) {
    const y = f ? -1 : 0, c = ['#3a2a1e', '#4e3a28', '#634a32'];
    P(g, c[1], 6, 6 + y, 8, 12); P(g, c[2], 7, 6 + y, 3, 10); P(g, c[0], 12, 8 + y, 2, 10);
    for (let i = 0; i < 4; i++) { P(g, c[i % 3], 2 + i * 4, 18, 2, 4 - (i + f) % 2); P(g, c[1], 1 + i * 5, 3 + y + (i % 2) * 3, 2, 6); }
    P(g, '#7ad07a', 8, 9 + y, 2, 2); P(g, '#7ad07a', 11, 9 + y, 2, 2); P(g, '#c8f0a0', 8, 9 + y); P(g, '#c8f0a0', 11, 9 + y);
  } };
  Art.FOE_ART = FOE_ART;
  Art.foe = (type, f, flip) => memo(`foe${type}${f}${flip}`, () => {
    const d = FOE_ART[type];
    return outlined(mk(d.w, d.h, g => { if (flip) { g.translate(d.w, 0); g.scale(-1, 1); } d.draw(g, f); }));
  });

  // A silhouette ring, used to highlight whatever you can interact with.
  const rings = new WeakMap(), whites = new WeakMap();
  Art.glow = src => {
    if (rings.has(src)) return rings.get(src);
    const w = src.width, h = src.height, d = src.getContext('2d').getImageData(0, 0, w, h).data;
    const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
    const c = mk(w + 2, h + 2, g => {
      g.fillStyle = '#ffe680';
      for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
        if (!op(x, y) && (op(x + 1, y) || op(x - 1, y) || op(x, y + 1) || op(x, y - 1))) g.fillRect(x + 1, y + 1, 1, 1);
      }
    });
    rings.set(src, c);
    return c;
  };
  Art.white = src => {
    if (whites.has(src)) return whites.get(src);
    const c = mk(src.width, src.height, g => {
      g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#ffffff'; g.fillRect(0, 0, src.width, src.height);
    });
    whites.set(src, c);
    return c;
  };
})();
