'use strict';
// All pixel art is painted by code into offscreen canvases and memoised.

const Art = (() => {
  const OUTLINE = '#2c1c14';
  const cache = new Map();
  const memo = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k); };

  function mk(w, h, fn) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    fn(g, c); return c;
  }
  function P(g, c, x, y, w = 1, h = 1) { g.fillStyle = c; g.fillRect(x, y, w, h); }

  // Stamps a 1px dark outline around every opaque shape.
  function outlined(src, col = OUTLINE) {
    const w = src.width, h = src.height, sg = src.getContext('2d');
    const d = sg.getImageData(0, 0, w, h).data;
    return mk(w, h, g => {
      g.fillStyle = col;
      const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!op(x, y) && (op(x + 1, y) || op(x - 1, y) || op(x, y + 1) || op(x, y - 1))) g.fillRect(x, y, 1, 1);
      }
      g.drawImage(src, 0, 0);
    });
  }

  // ---- Ground ------------------------------------------------------------
  const GRASS = [
    { b: '#74b04a', l: '#8fc75c', d: '#5d9a41', f: ['#f7e26b', '#f4a6c0', '#ffffff'] },
    { b: '#5aa03f', l: '#74b84d', d: '#468937', f: ['#f7c948', '#ffffff'] },
    { b: '#b19e45', l: '#c9b557', d: '#917d35', f: ['#d9793a', '#a94f2a'] },
    { b: '#e3ecf5', l: '#f8fcff', d: '#c6d5e6', f: [] },
  ];
  const DIRT = [
    { b: '#c29560', l: '#d3a874', d: '#a87c4c' }, { b: '#c29560', l: '#d3a874', d: '#a87c4c' },
    { b: '#b48755', l: '#c79a68', d: '#9a7045' }, { b: '#cfc5bb', l: '#e6dfd8', d: '#b0a79d' },
  ];

  function paintGround(g, code, px, py, season, r, map, tx, ty) {
    const sp = (c, n, w = 1, h = 1) => { for (let i = 0; i < n; i++) P(g, c, px + Math.floor(r() * (17 - w)), py + Math.floor(r() * (17 - h)), w, h); };
    switch (code) {
      case 0: { // grass
        const p = GRASS[season];
        P(g, p.b, px, py, 16, 16);
        sp(p.d, 12); sp(p.l, 9);
        for (let i = 0; i < 3; i++) { // little V tufts
          const x = px + 1 + Math.floor(r() * 13), y = py + 2 + Math.floor(r() * 12);
          P(g, p.d, x, y); P(g, p.d, x + 2, y); P(g, p.d, x + 1, y + 1);
          if (r() < 0.6) { P(g, p.l, x, y - 1); P(g, p.l, x + 2, y - 1); }
        }
        if (p.f.length && r() < 0.09) {
          const x = px + 3 + Math.floor(r() * 9), y = py + 3 + Math.floor(r() * 9), c = p.f[Math.floor(r() * p.f.length)];
          P(g, c, x - 1, y); P(g, c, x + 1, y); P(g, c, x, y - 1); P(g, c, x, y + 1); P(g, '#e8b53c', x, y);
        }
        break;
      }
      case 1: { // dirt path
        const p = DIRT[season];
        P(g, p.b, px, py, 16, 16); sp(p.d, 16); sp(p.l, 12); sp(p.d, 2, 2, 1);
        break;
      }
      case 2: { // cobble
        P(g, season === 3 ? '#9aa0a8' : '#7f7869', px, py, 16, 16);
        const stones = season === 3 ? ['#c8ced8', '#dbe0e8', '#b5bcc6'] : ['#a8a292', '#b8b2a2', '#979182'];
        const off = (tx + ty) % 2 ? 3 : 0;
        for (let row = 0; row < 3; row++) {
          const y = py + row * 5 + 1, sh = (row % 2) * 4 + off;
          for (let i = -1; i < 3; i++) {
            const x = px + i * 7 + sh, c = stones[Math.floor(r() * 3)];
            const a = Math.max(x, px), b = Math.min(x + 6, px + 16);
            if (b > a) { P(g, c, a, y, b - a, 4); P(g, '#ffffff33', a, y, b - a, 1); P(g, '#00000026', a, y + 3, b - a, 1); }
          }
        }
        break;
      }
      case 4: P(g, '#e5cf94', px, py, 16, 16); sp('#d2ba7d', 14); sp('#f2e0ad', 10); break;
      case 5: { // wood floor
        P(g, '#b7814d', px, py, 16, 16);
        for (let row = 0; row < 4; row++) {
          const y = py + row * 4;
          P(g, row % 2 ? '#ab7743' : '#c08a55', px, y, 16, 3);
          P(g, '#7d5430', px, y + 3, 16, 1);
          const seam = (tx * 5 + row * 7 + ty * 3) % 16;
          P(g, '#7d5430', px + seam, y, 1, 3);
          P(g, '#d29b64', px + (seam + 5) % 16, y + 1, 3, 1);
        }
        break;
      }
      case 6: { // interior wall
        const c = (map && map.wall) || ['#c9a877', '#b39162', '#8a6a44'];
        P(g, c[0], px, py, 16, 16);
        for (let i = 0; i < 16; i += 4) P(g, c[1], px + i + 3, py, 1, 16);
        const below = map ? map.ground[(ty + 1) * map.w + tx] : 5;
        if (below !== 6 && below !== 10) { // wainscot along the bottom of the wall
          P(g, c[2], px, py + 9, 16, 7); P(g, '#ffffff22', px, py + 9, 16, 1); P(g, '#00000040', px, py + 15, 16, 1);
          for (let i = 1; i < 16; i += 5) P(g, '#00000026', px + i, py + 10, 1, 5);
        } else {
          P(g, '#4a3522', px, py, 16, 16); P(g, '#5d452e', px, py + 12, 16, 4);
        }
        break;
      }
      case 7: { // rug
        const same = (dx, dy) => map && map.ground[(ty + dy) * map.w + tx + dx] === 7;
        P(g, '#a33b3b', px, py, 16, 16);
        for (let i = 0; i < 8; i++) P(g, '#b5484a', px + Math.floor(r() * 15), py + Math.floor(r() * 15), 2, 1);
        if (!same(0, -1)) { P(g, '#e0b85a', px, py + 1, 16, 1); P(g, '#7a2a2c', px, py, 16, 1); }
        if (!same(0, 1)) { P(g, '#e0b85a', px, py + 14, 16, 1); P(g, '#7a2a2c', px, py + 15, 16, 1); }
        if (!same(-1, 0)) { P(g, '#e0b85a', px + 1, py, 1, 16); P(g, '#7a2a2c', px, py, 1, 16); }
        if (!same(1, 0)) { P(g, '#e0b85a', px + 14, py, 1, 16); P(g, '#7a2a2c', px + 15, py, 1, 16); }
        break;
      }
      case 8: { // bridge planks
        P(g, '#3d86c6', px, py, 16, 16);
        for (let i = 0; i < 4; i++) { P(g, i % 2 ? '#a87a4a' : '#b98a58', px + 1, py + i * 4, 14, 3); P(g, '#6b4a2a', px + 1, py + i * 4 + 3, 14, 1); }
        P(g, '#6b4a2a', px, py, 2, 16); P(g, '#6b4a2a', px + 14, py, 2, 16);
        break;
      }
      case 9: { // stone floor
        P(g, '#8f8a84', px, py, 16, 16);
        P(g, '#a09b95', px + 1, py + 1, 6, 6); P(g, '#a8a39d', px + 9, py + 1, 6, 6);
        P(g, '#a39e98', px + 1, py + 9, 6, 6); P(g, '#99948e', px + 9, py + 9, 6, 6);
        sp('#7c7771', 6);
        break;
      }
      case 10: P(g, '#14100c', px, py, 16, 16); break;
      case 11: P(g, '#4a4038', px, py, 16, 16); sp('#3e352e', 16); sp('#574c42', 12); sp('#332b25', 2, 2, 1); break;
      case 12: { // cave and cliff rock
        const under = map && ty + 1 < map.h ? map.ground[(ty + 1) * map.w + tx] : 12;
        if (under !== 12) {
          P(g, '#6b5d4e', px, py, 16, 16); P(g, '#2e2822', px, py, 16, 4); P(g, '#7d6e5c', px, py + 4, 16, 2);
          sp('#574b3e', 10); for (let i = 0; i < 3; i++) P(g, '#4a3f33', px + Math.floor(r() * 12), py + 7 + Math.floor(r() * 8), 4, 1);
          P(g, '#00000055', px, py + 14, 16, 2);
        } else { P(g, '#2e2822', px, py, 16, 16); sp('#3a332c', 12); sp('#25201b', 8); }
        break;
      }
      case 13: {
        P(g, season === 3 ? '#dfe6ee' : '#8f8270', px, py, 16, 16);
        sp(season === 3 ? '#c6d0da' : '#7c705f', 16); sp(season === 3 ? '#f4f8fc' : '#a29582', 12); sp(season === 3 ? '#b8c2cc' : '#6a5f50', 2, 2, 1);
        break;
      }
    }
  }

  // Ragged grass over path edges, muddy bank around water.
  function paintFringe(g, code, nCode, side, px, py, season, r) {
    const p = GRASS[season];
    const isLand = c => c === 0 || c === 13;
    if ((code === 1 || code === 2) && isLand(nCode)) {
      for (let i = 0; i < 16; i += 2) {
        const len = 1 + Math.floor(r() * 3);
        if (side === 0) P(g, p.b, px + i, py, 2, len);
        if (side === 1) P(g, p.b, px + i, py + 16 - len, 2, len);
        if (side === 2) P(g, p.b, px, py + i, len, 2);
        if (side === 3) P(g, p.b, px + 16 - len, py + i, len, 2);
      }
    }
    if (code === 3 && nCode !== 3 && nCode !== 8) {
      const sandy = nCode === 4, bank = sandy ? '#c9b077' : season === 3 ? '#b8b0a8' : '#8a6a44', lip = sandy ? '#e5cf94' : season === 3 ? '#e3ecf5' : p.d;
      if (side === 0) { P(g, bank, px, py, 16, 5); P(g, lip, px, py, 16, 2); P(g, '#2f6da8', px, py + 5, 16, 1); }
      if (side === 1) { P(g, bank, px, py + 14, 16, 2); P(g, lip, px, py + 15, 16, 1); }
      if (side === 2) { P(g, bank, px, py, 3, 16); P(g, lip, px, py, 1, 16); }
      if (side === 3) { P(g, bank, px + 13, py, 3, 16); P(g, lip, px + 15, py, 1, 16); }
    }
  }

  function water(frame, season) {
    return memo('water' + frame + season, () => mk(16, 16, g => {
      const ice = season === 3;
      P(g, ice ? '#7fb0d8' : '#3d86c6', 0, 0, 16, 16);
      const r = mulberry(77 + frame);
      for (let i = 0; i < 4; i++) P(g, ice ? '#94c0e2' : '#357ab8', Math.floor(r() * 12), Math.floor(r() * 15), 4, 1);
      for (let i = 0; i < 3; i++) {
        const x = (Math.floor(r() * 12) + frame * 2) % 12, y = Math.floor(r() * 15);
        P(g, ice ? '#cfe4f4' : '#7dbbe6', x, y, 3 + Math.floor(r() * 2), 1);
      }
    }));
  }

  function soil(wet) {
    return memo('soil' + wet, () => mk(16, 16, g => {
      const r = mulberry(5);
      P(g, wet ? '#4f3522' : '#7c5433', 0, 0, 16, 16);
      for (let row = 2; row < 16; row += 4) {
        P(g, wet ? '#3e2919' : '#65432a', 1, row, 14, 1);
        P(g, wet ? '#5e4029' : '#8e6340', 1, row - 1, 14, 1);
      }
      for (let i = 0; i < 8; i++) P(g, wet ? '#3e2919' : '#65432a', Math.floor(r() * 15), Math.floor(r() * 15));
    }));
  }

  // ---- Characters --------------------------------------------------------
  // Frames are 18x28 with the feet at the bottom edge.
  function paintChar(g, o, dir, f) {
    const bob = f === 1 || f === 3 ? -1 : 0, y0 = bob;
    const pants = o.pants, pantsD = o.pantsD, shoes = o.shoes || '#4a2f1d';
    if (dir < 2) {
      const lift = s => (f === s ? 2 : 0);
      P(g, pants, 5, 20, 4, 4 - lift(1)); P(g, pants, 9, 20, 4, 4 - lift(3));
      P(g, pantsD, 8, 20, 1, 4); P(g, pantsD, 12, 20, 1, 4 - lift(3));
      P(g, shoes, 5, 24 - lift(1), 4, 2); P(g, shoes, 9, 24 - lift(3), 4, 2);
      if (o.greaves) { P(g, o.greaves[1], 5, 21 - lift(1), 4, 3); P(g, o.greaves[1], 9, 21 - lift(3), 4, 3); P(g, o.greaves[2], 5, 21 - lift(1), 1, 3); P(g, o.greaves[2], 9, 21 - lift(3), 1, 3); }
      const swing = f === 1 ? 1 : f === 3 ? -1 : 0;
      P(g, o.shirtD, 3, 13 + y0 + swing, 2, 6); P(g, o.shirtD, 13, 13 + y0 - swing, 2, 6);
      P(g, o.skin, 3, 19 + y0 + swing, 2, 2); P(g, o.skin, 13, 19 + y0 - swing, 2, 2);
      P(g, o.shirt, 5, 13 + y0, 8, 8); P(g, o.shirtD, 12, 13 + y0, 1, 8);
      if (o.overalls) {
        P(g, o.overalls, 5, 17 + y0, 8, 4);
        P(g, o.overalls, 6, 13 + y0, 2, 4); P(g, o.overalls, 10, 13 + y0, 2, 4);
        if (dir === 0) { P(g, o.overalls, 6, 16 + y0, 6, 2); P(g, '#e8c95a', 6, 14 + y0, 1, 1); P(g, '#e8c95a', 11, 14 + y0, 1, 1); }
      }
      if (o.apron && dir === 0) { P(g, o.apron, 6, 15 + y0, 6, 7); P(g, '#00000022', 6, 21 + y0, 6, 1); }
      if (o.cape) { if (dir === 1) P(g, o.cape, 4, 13 + y0, 10, 10); else { P(g, o.cape, 4, 13 + y0, 1, 7); P(g, o.cape, 13, 13 + y0, 1, 7); } }
      if (o.belt) P(g, o.belt, 5, 19 + y0, 8, 1);
      // Plate armour: shoulder guards, a shine and a centre seam.
      if (o.plate) { const [, pd, pl] = o.plate; P(g, pd, 2, 12 + y0, 4, 3); P(g, pd, 12, 12 + y0, 4, 3); P(g, pl, 3, 12 + y0, 2, 1); P(g, pl, 13, 12 + y0, 2, 1); if (dir === 0) { P(g, pl, 6, 14 + y0, 2, 4); P(g, pd, 9, 13 + y0, 1, 6); } else P(g, pd, 5, 16 + y0, 8, 1); }
      // A gown: a full skirt to the floor, trimmed, and a necklace.
      if (o.dress) { P(g, o.dress, 4, 18 + y0, 10, 5); P(g, o.dress, 3, 22, 12, 3); P(g, o.dressD || o.shirtD, 3, 24, 12, 1); P(g, o.dressD || o.shirtD, 8, 19 + y0, 1, 5); if (o.trim) { P(g, o.trim, 4, 18 + y0, 10, 1); P(g, o.trim, 3, 23, 12, 1); } }
      if (o.jewel && dir === 0) { P(g, o.jewel, 6, 13 + y0, 6, 1); P(g, o.gem || '#c43050', 8, 14 + y0, 2, 1); }
      // head
      P(g, o.skin, 4, 4 + y0, 10, 9); P(g, o.skinD, 4, 12 + y0, 10, 1); P(g, o.skinD, 13, 5 + y0, 1, 7);
      if (dir === 0) {
        P(g, '#2a1a12', 6, 8 + y0, 2, 2); P(g, '#2a1a12', 10, 8 + y0, 2, 2);
        P(g, '#ffffff', 6, 8 + y0); P(g, '#ffffff', 10, 8 + y0);
        P(g, '#e89a84', 5, 10 + y0); P(g, '#e89a84', 12, 10 + y0);
        P(g, o.skinD, 8, 11 + y0, 2, 1);
        if (o.beard) { P(g, o.beard, 5, 10 + y0, 8, 3); P(g, o.beard, 6, 13 + y0, 6, 2); P(g, o.skinD, 8, 11 + y0, 2, 1); }
        if (o.scar) { P(g, '#b0605a', 11, 6 + y0, 1, 4); }
        if (o.patch) { P(g, '#14100c', 10, 7 + y0, 3, 3); P(g, '#14100c', 4, 6 + y0, 10, 1); }
      }
      paintHairFront(g, o, y0, dir === 1);
    } else {
      // Side view facing right; left is drawn by flipping.
      const a = f === 1 ? 3 : f === 3 ? -3 : 0;
      P(g, pants, 7 + a, 20, 4, 4); P(g, shoes, 7 + a, 24, 5, 2);
      if (o.greaves) { P(g, o.greaves[1], 7 + a, 21, 4, 3); P(g, o.greaves[2], 7 + a, 21, 1, 3); if (a) P(g, o.greaves[1], 7 - a, 21, 4, 2); }
      if (a) { P(g, pantsD, 7 - a, 20, 4, 3); P(g, shoes, 7 - a, 23, 5, 2); }
      P(g, o.shirt, 6, 13 + y0, 7, 8); P(g, o.shirtD, 6, 13 + y0, 1, 8);
      if (o.overalls) { P(g, o.overalls, 6, 17 + y0, 7, 4); P(g, o.overalls, 9, 13 + y0, 2, 4); }
      if (o.apron) P(g, o.apron, 10, 15 + y0, 3, 7);
      if (o.cape) P(g, o.cape, 4, 13 + y0, 3, 10);
      if (o.belt) P(g, o.belt, 6, 19 + y0, 7, 1);
      if (o.plate) { const [, pd, pl] = o.plate; P(g, pd, 7, 12 + y0, 5, 3); P(g, pl, 8, 12 + y0, 3, 1); P(g, pl, 11, 14 + y0, 1, 4); }
      if (o.dress) { P(g, o.dress, 5, 18 + y0, 9, 5); P(g, o.dress, 4, 22, 11, 3); P(g, o.dressD || o.shirtD, 4, 24, 11, 1); if (o.trim) P(g, o.trim, 4, 23, 11, 1); }
      const sw = f === 1 ? 2 : f === 3 ? -2 : 0;
      P(g, o.shirtD, 8 + sw, 14 + y0, 3, 5); P(g, o.skin, 8 + sw, 19 + y0, 3, 2);
      P(g, o.skin, 5, 4 + y0, 9, 9); P(g, o.skinD, 5, 12 + y0, 9, 1); P(g, o.skin, 14, 8 + y0, 1, 2);
      P(g, '#2a1a12', 11, 8 + y0, 2, 2); P(g, '#ffffff', 12, 8 + y0);
      P(g, '#e89a84', 10, 10 + y0);
      if (o.beard) { P(g, o.beard, 9, 10 + y0, 5, 3); P(g, o.beard, 9, 13 + y0, 4, 2); }
      if (o.patch) { P(g, '#14100c', 11, 7 + y0, 3, 3); P(g, '#14100c', 5, 6 + y0, 9, 1); }
      paintHairSide(g, o, y0);
    }
  }

  function paintHairFront(g, o, y, back) {
    const h = o.hair, d = o.hairD, s = o.style;
    if (s === 'hood') {
      P(g, h, 3, 2 + y, 12, 5); P(g, h, 3, 7 + y, 2, 9); P(g, h, 13, 7 + y, 2, 9); P(g, d, 3, 15 + y, 12, 1);
      if (back) P(g, h, 3, 2 + y, 12, 14);
      return;
    }
    if (s === 'bald') {
      P(g, h, 4, 6 + y, 1, 3); P(g, h, 13, 6 + y, 1, 3);
      if (back) P(g, h, 4, 8 + y, 10, 4);
    } else {
      P(g, h, 4, 2 + y, 10, 4); P(g, d, 4, 5 + y, 10, 1);
      P(g, h, 4, 6 + y, 2, 2); P(g, h, 12, 6 + y, 2, 2); P(g, h, 7, 5 + y, 3, 2);
      P(g, '#ffffff22', 6, 2 + y, 5, 1);
      if (back) { P(g, h, 4, 2 + y, 10, 10); P(g, d, 4, 11 + y, 10, 1); }
      if (s === 'long') { P(g, h, 3, 5 + y, 2, 11); P(g, h, 13, 5 + y, 2, 11); P(g, d, 3, 15 + y, 2, 1); P(g, d, 13, 15 + y, 2, 1); if (back) P(g, h, 4, 2 + y, 10, 13); }
      if (s === 'bun') { P(g, h, 7, 0 + y, 4, 3); P(g, d, 7, 2 + y, 4, 1); }
      if (s === 'messy') { P(g, h, 5, 1 + y, 2, 1); P(g, h, 9, 1 + y, 2, 1); P(g, h, 12, 2 + y, 2, 1); }
      if (s === 'crop') { P(g, h, 4, 2 + y, 10, 3); }
    }
    paintHat(g, o, y, 0);
  }
  function paintHairSide(g, o, y) {
    const h = o.hair, d = o.hairD, s = o.style;
    if (s === 'hood') { P(g, h, 3, 2 + y, 11, 5); P(g, h, 3, 7 + y, 5, 9); P(g, d, 3, 15 + y, 5, 1); return; }
    if (s === 'bald') { P(g, h, 5, 6 + y, 3, 4); return; }
    P(g, h, 4, 2 + y, 10, 4); P(g, h, 4, 6 + y, 4, 5); P(g, d, 4, 10 + y, 4, 1); P(g, h, 11, 5 + y, 2, 1);
    if (s === 'long') P(g, h, 3, 5 + y, 4, 11);
    if (s === 'bun') P(g, h, 2, 3 + y, 3, 4);
    if (s === 'messy') { P(g, h, 6, 1 + y, 2, 1); P(g, h, 10, 1 + y, 2, 1); }
    paintHat(g, o, y, 1);
  }
  function paintHat(g, o, y) {
    if (o.hat === 'straw') {
      P(g, '#e8c766', 1, 5 + y, 16, 2); P(g, '#c9a548', 1, 6 + y, 16, 1);
      P(g, '#e8c766', 5, 1 + y, 8, 4); P(g, '#f4dc8a', 6, 1 + y, 5, 1);
      P(g, '#b23a3a', 5, 4 + y, 8, 1);
    }
    if (o.hat === 'helm') {
      P(g, o.hatC || '#9aa4b2', 4, 1 + y, 10, 5); P(g, o.hatL || '#c4ccd8', 5, 1 + y, 5, 1);
      P(g, o.hatD || '#6c7686', 3, 5 + y, 12, 1); P(g, o.plume || '#b23a3a', 8, 0 + y, 2, 2);
      if (o.hatGuard) { P(g, o.hatD, 3, 6 + y, 2, 5); P(g, o.hatD, 13, 6 + y, 2, 5); P(g, o.hatC, 3, 6 + y, 1, 4); P(g, o.hatL, 6, 3 + y, 6, 1); }
    }
    if (o.hat === 'witch') {
      P(g, '#3a2050', 1, 5 + y, 16, 2); P(g, '#4a2a68', 5, 1 + y, 8, 4); P(g, '#4a2a68', 7, -2 + y, 5, 3); P(g, '#4a2a68', 10, -4 + y, 3, 2); P(g, '#c9a06a', 5, 4 + y, 8, 1);
    }
    if (o.hat === 'crown') {
      P(g, '#e0b85a', 4, 1 + y, 10, 3); P(g, '#e0b85a', 4, 0 + y, 2, 1); P(g, '#e0b85a', 8, -1 + y, 2, 2); P(g, '#e0b85a', 12, 0 + y, 2, 1); P(g, '#c43030', 8, 2 + y, 2, 1); P(g, '#f7dd7a', 5, 1 + y, 2, 1);
    }
    if (o.hat === 'tiara') { P(g, '#e8c040', 5, 3 + y, 8, 1); P(g, '#e8c040', 8, 1 + y, 2, 2); P(g, o.gem || '#c43050', 8, 2 + y, 2, 1); P(g, '#fff0a0', 6, 3 + y); }
    if (o.hat === 'tricorn') {
      const k = o.hatC || '#2a2024', d = o.hatD || '#181216';
      P(g, d, 1, 4 + y, 16, 2); P(g, k, 2, 3 + y, 14, 1); P(g, k, 4, 0 + y, 10, 4); P(g, d, 1, 2 + y, 2, 2); P(g, d, 15, 2 + y, 2, 2);
      P(g, o.hatL || '#e8c040', 4, 3 + y, 10, 1); if (o.skull) { P(g, '#f0ece0', 8, 1 + y, 2, 2); }
    }
    if (o.hat === 'bandana') {
      P(g, o.hatC || '#b23a3a', 4, 1 + y, 10, 4); P(g, o.hatD || '#8a2a2a', 3, 4 + y, 12, 1); P(g, o.hatD || '#8a2a2a', 13, 5 + y, 3, 2); P(g, o.hatC || '#b23a3a', 15, 7 + y, 2, 2);
      P(g, '#f0ece0', 6, 2 + y, 1, 1); P(g, '#f0ece0', 10, 3 + y, 1, 1);
    }
    if (o.hat === 'cap') {
      P(g, o.hatC || '#6a4a7a', 4, 2 + y, 10, 3); P(g, o.hatD || '#513860', 3, 5 + y, 12, 1);
    }
  }

  function charSheet(id, look) {
    return memo('char' + id, () => [0, 1, 2].map(dir => [0, 1, 2, 3].map(f =>
      outlined(mk(18, 28, g => paintChar(g, look, dir, f))))));
  }
  function charFrame(id, look, dir, f) {
    const sheet = charSheet(id, look);
    if (dir < 3) return sheet[dir][f];
    return memo('charL' + id + f, () => mk(18, 28, g => { g.translate(18, 0); g.scale(-1, 1); g.drawImage(sheet[2][f], 0, 0); }));
  }
  function portrait(id, look) {
    return memo('port' + id, () => mk(48, 48, g => {
      P(g, '#d9c08f', 0, 0, 48, 48);
      P(g, '#c9ad7a', 0, 30, 48, 18);
      g.drawImage(charSheet(id, look)[0][0], 1, 0, 16, 16, 0, 2, 48, 48);
    }));
  }

  // ---- Trees and scenery ---------------------------------------------------
  function blob(g, cx, cy, rad, pal, r) {
    for (let y = -rad; y <= rad; y++) for (let x = -rad; x <= rad; x++) {
      const d = Math.sqrt(x * x + y * y);
      if (d > rad + r() * 1.2 - 0.6) continue;
      const s = (x * 0.55 + y) / rad + (r() - 0.5) * 0.25;
      P(g, pal[s < -0.5 ? 3 : s < 0 ? 2 : s < 0.5 ? 1 : 0], cx + x, cy + y);
    }
  }
  const LEAVES = [
    ['#3a7a3f', '#4f9642', '#6fb44b', '#9ccf63'],
    ['#2a6a38', '#3a853b', '#55a043', '#7cbe4e'],
    ['#93462a', '#c4672a', '#e0912f', '#f4bb48'],
  ];

  function tree(kind, season, v) {
    return memo(`tree${kind}${season}${v}`, () => outlined(mk(48, 64, g => {
      const r = mulberry(v * 97 + 13);
      if (kind === 'pine') {
        P(g, '#5c3f28', 21, 54, 6, 10); P(g, '#725036', 22, 54, 2, 10);
        const pal = season === 2 ? ['#2d5d3a', '#3d7342', '#528a4b', '#6ba055'] : ['#1f5a3c', '#2d7044', '#40894c', '#5ba25a'];
        for (let tier = 0; tier < 5; tier++) {
          const top = 4 + tier * 10, h = 15, w = 7 + tier * 3.5;
          for (let y = 0; y < h; y++) {
            const half = Math.floor((y / h) * w + 2);
            for (let x = -half; x <= half; x++) {
              if (y === h - 1 && r() < 0.35) continue;
              const s = (x / (half + 1)) * 0.7 + (y / h) * 0.7 + (r() - 0.5) * 0.25;
              P(g, season === 3 && y < 7 && r() < 0.8 ? '#f0f6fc' : pal[s < -0.1 ? 3 : s < 0.25 ? 2 : s < 0.6 ? 1 : 0], 24 + x, top + y);
            }
          }
        }
        return;
      }
      P(g, '#5f4128', 20, 40, 8, 24); P(g, '#775438', 21, 40, 3, 24); P(g, '#4a301d', 27, 40, 1, 24);
      P(g, '#5f4128', 17, 61, 14, 3);
      if (season === 3) {
        P(g, '#5f4128', 13, 28, 3, 14); P(g, '#5f4128', 13, 40, 10, 3); P(g, '#5f4128', 32, 22, 3, 18); P(g, '#5f4128', 26, 37, 9, 3);
        P(g, '#5f4128', 21, 14, 4, 28); P(g, '#5f4128', 8, 20, 6, 2); P(g, '#5f4128', 34, 16, 7, 2);
        P(g, '#f0f6fc', 13, 27, 3, 2); P(g, '#f0f6fc', 32, 21, 3, 2); P(g, '#f0f6fc', 21, 13, 4, 2); P(g, '#f0f6fc', 8, 19, 6, 1); P(g, '#f0f6fc', 34, 15, 7, 1);
        return;
      }
      const pal = LEAVES[season];
      const blobs = [[24, 30, 15], [12, 28, 10], [36, 28, 10], [16, 18, 11], [32, 18, 11], [24, 12, 11]];
      blobs.forEach(b => blob(g, b[0] + Math.floor(r() * 3) - 1, b[1] + Math.floor(r() * 3) - 1, b[2], pal, r));
      for (let i = 0; i < 28; i++) P(g, pal[3], 8 + Math.floor(r() * 32), 4 + Math.floor(r() * 36), 2, 1);
      if (season === 0) for (let i = 0; i < 26; i++) P(g, r() < 0.5 ? '#f7c4d8' : '#fbe3ec', 8 + Math.floor(r() * 32), 4 + Math.floor(r() * 36), 2, 2);
    })));
  }

  const STATIC = {
    rock: s => outlined(mk(16, 16, g => {
      const r = mulberry(11);
      blob(g, 8, 10, 5, ['#6e6e74', '#85858c', '#a0a0a8', '#c2c2c8'], r);
      if (s === 3) P(g, '#f0f6fc', 5, 5, 6, 2);
    })),
    boulder: s => outlined(mk(24, 22, g => {
      const r = mulberry(12);
      blob(g, 12, 13, 8, ['#5f5f66', '#78787f', '#94949c', '#b6b6be'], r);
      P(g, '#54545b', 9, 12, 4, 1); P(g, '#54545b', 13, 13, 1, 3);
      if (s === 3) P(g, '#f0f6fc', 6, 6, 12, 3);
    })),
    stump: () => outlined(mk(16, 16, g => {
      P(g, '#6f4c30', 3, 7, 10, 8); P(g, '#57391f', 11, 7, 2, 8); P(g, '#57391f', 1, 13, 14, 2);
      P(g, '#c79a68', 3, 5, 10, 4); P(g, '#a87c4c', 5, 6, 6, 2); P(g, '#c79a68', 7, 7, 2, 1);
    })),
    branch: () => outlined(mk(16, 16, g => {
      P(g, '#7a5535', 2, 11, 12, 2); P(g, '#7a5535', 8, 8, 2, 3); P(g, '#7a5535', 5, 9, 2, 2); P(g, '#987048', 3, 11, 6, 1);
    })),
    weed: s => outlined(mk(16, 16, g => {
      const c = [['#4c8c38', '#6aa848'], ['#3d7c32', '#58983f'], ['#8e7a30', '#ac9440'], ['#8896a4', '#a8b4c0']][s];
      for (let i = 0; i < 6; i++) { const x = 3 + i * 2; const h = 4 + (i * 7) % 5; P(g, i % 2 ? c[0] : c[1], x, 14 - h, 1, h); P(g, c[1], x + (i % 2 ? 1 : -1), 13 - h, 1, 1); }
      P(g, c[0], 3, 13, 11, 2);
    })),
    bush: s => outlined(mk(24, 20, g => {
      const r = mulberry(31), pal = LEAVES[Math.min(s, 2)];
      if (s === 3) { blob(g, 12, 12, 7, ['#b9c6d2', '#d4dee8', '#e9f0f6', '#ffffff'], r); return; }
      blob(g, 7, 13, 6, pal, r); blob(g, 17, 13, 6, pal, r); blob(g, 12, 9, 7, pal, r);
      if (s === 1) for (let i = 0; i < 6; i++) P(g, '#3f2d5a', 4 + Math.floor(r() * 16), 6 + Math.floor(r() * 10), 2, 2);
    })),
    fence: s => outlined(mk(16, 18, g => {
      P(g, '#b08a5a', 6, 2, 4, 15); P(g, '#c9a170', 7, 2, 1, 15); P(g, '#a07a4c', 0, 6, 16, 2); P(g, '#a07a4c', 0, 11, 16, 2); P(g, '#c9a170', 0, 6, 16, 1); P(g, '#c9a170', 0, 11, 16, 1);
      if (s === 3) P(g, '#f0f6fc', 6, 1, 4, 2);
    })),
    sign: () => outlined(mk(16, 20, g => {
      P(g, '#7a5535', 7, 10, 2, 10); P(g, '#b58a55', 1, 2, 14, 9); P(g, '#c9a170', 1, 2, 14, 1); P(g, '#7a5535', 3, 5, 10, 1); P(g, '#7a5535', 3, 8, 8, 1);
    })),
    board: () => outlined(mk(32, 34, g => {
      P(g, '#6f4c30', 3, 8, 3, 26); P(g, '#6f4c30', 26, 8, 3, 26);
      P(g, '#9a7145', 1, 3, 30, 22); P(g, '#c9a170', 1, 3, 30, 2); P(g, '#7a5535', 3, 6, 26, 17);
      P(g, '#f2e3bd', 5, 8, 9, 11); P(g, '#c9b78e', 6, 10, 7, 1); P(g, '#c9b78e', 6, 13, 7, 1); P(g, '#c9b78e', 6, 16, 5, 1);
      P(g, '#ecd9a8', 17, 9, 10, 8); P(g, '#c9b78e', 18, 11, 8, 1); P(g, '#c9b78e', 18, 14, 6, 1); P(g, '#c43030', 9, 8, 1, 1); P(g, '#c43030', 22, 9, 1, 1);
    })),
    well: s => outlined(mk(32, 44, g => {
      P(g, '#8d8d94', 3, 24, 26, 18); P(g, '#a4a4ab', 3, 24, 26, 3); P(g, '#2c3c55', 7, 26, 18, 2);
      for (let y = 29; y < 42; y += 4) for (let x = 3 + (y % 8 ? 0 : 4); x < 28; x += 8) P(g, '#74747b', x, y, 1, 3);
      P(g, '#74747b', 3, 32, 26, 1); P(g, '#74747b', 3, 36, 26, 1); P(g, '#74747b', 3, 40, 26, 1);
      P(g, '#6f4c30', 4, 8, 3, 18); P(g, '#6f4c30', 25, 8, 3, 18); P(g, '#a07a4c', 7, 14, 18, 2); P(g, '#c9a170', 14, 14, 3, 11);
      P(g, '#a84a3a', 1, 8, 30, 3); P(g, '#bf5a44', 3, 5, 26, 3); P(g, '#a84a3a', 6, 2, 20, 3);
      if (s === 3) { P(g, '#f0f6fc', 3, 3, 26, 3); P(g, '#f0f6fc', 1, 6, 30, 2); }
    })),
    bench: () => outlined(mk(32, 22, g => {
      P(g, '#8a6239', 3, 2, 26, 3); P(g, '#a57a4c', 3, 2, 26, 1); P(g, '#8a6239', 3, 7, 26, 3);
      P(g, '#b08a5a', 2, 12, 28, 4); P(g, '#c9a170', 2, 12, 28, 1);
      P(g, '#5f4128', 4, 2, 2, 19); P(g, '#5f4128', 26, 2, 2, 19);
    })),
    lamp: () => outlined(mk(16, 40, g => {
      P(g, '#3c3c46', 7, 12, 2, 28); P(g, '#3c3c46', 4, 36, 8, 3); P(g, '#3c3c46', 3, 1, 10, 2);
      P(g, '#f7dd7a', 4, 3, 8, 8); P(g, '#fff2b8', 6, 4, 3, 5); P(g, '#3c3c46', 3, 11, 10, 2); P(g, '#3c3c46', 7, 3, 1, 8);
    })),
    crate: () => outlined(mk(16, 18, g => {
      P(g, '#b58a55', 1, 3, 14, 14); P(g, '#c9a170', 1, 3, 14, 2); P(g, '#7a5535', 1, 8, 14, 1); P(g, '#7a5535', 1, 12, 14, 1);
      P(g, '#7a5535', 1, 3, 1, 14); P(g, '#7a5535', 14, 3, 1, 14);
    })),
    barrel: () => outlined(mk(16, 20, g => {
      P(g, '#9a6c3e', 3, 3, 10, 16); P(g, '#b58a55', 4, 3, 3, 16); P(g, '#74502c', 11, 3, 2, 16);
      P(g, '#55555f', 3, 6, 10, 1); P(g, '#55555f', 3, 15, 10, 1); P(g, '#c9a170', 3, 2, 10, 2);
    })),
    flowers: s => mk(16, 16, g => {
      if (s === 3) return;
      const c = s === 2 ? ['#d9793a', '#e8b53c'] : ['#e8688a', '#f7e26b', '#8fa8f0'];
      [[1, 3], [8, 1], [4, 7], [12, 5], [0, 10], [8, 10], [12, 11]].forEach(([x, y], i) => {
        P(g, '#3f7d35', x + 1, y + 2, 1, 3);
        P(g, c[i % c.length], x, y + 1, 3, 1); P(g, c[i % c.length], x + 1, y, 1, 3); P(g, '#fff0a0', x + 1, y + 1);
      });
    }),
    grave: s => outlined(mk(16, 20, g => {
      P(g, '#8d8d94', 3, 5, 10, 14); P(g, '#8d8d94', 5, 3, 6, 2); P(g, '#a4a4ab', 4, 5, 2, 12); P(g, '#6e6e74', 6, 8, 4, 1); P(g, '#6e6e74', 6, 11, 4, 1);
      if (s === 3) P(g, '#f0f6fc', 3, 3, 10, 3);
    })),
    namestone: s => outlined(mk(24, 40, g => {
      P(g, '#6c6c74', 3, 6, 18, 33); P(g, '#6c6c74', 6, 2, 12, 4); P(g, '#85858d', 4, 6, 4, 32); P(g, '#55555c', 19, 6, 2, 33);
      for (let y = 9; y < 36; y += 3) { P(g, '#4a4a52', 7, y, 8 + (y * 7) % 6, 1); P(g, '#7c7c84', 8 + (y * 3) % 6, y, 3, 1); }
      P(g, '#5d9a41', 2, 36, 8, 3); P(g, '#74b04a', 15, 37, 7, 2);
      if (s === 3) P(g, '#f0f6fc', 6, 1, 12, 3);
    })),
    log: s => outlined(mk(48, 22, g => {
      P(g, '#6f4c30', 2, 6, 44, 14); P(g, '#8a6239', 2, 6, 44, 3); P(g, '#57391f', 2, 17, 44, 3);
      P(g, '#c79a68', 40, 6, 7, 14); P(g, '#a87c4c', 42, 9, 3, 8);
      for (let i = 6; i < 38; i += 7) P(g, '#57391f', i, 10, 4, 1);
      if (s === 3) P(g, '#f0f6fc', 2, 5, 40, 3);
    })),
    gate: () => outlined(mk(16, 44, g => {
      P(g, '#55555f', 1, 0, 3, 44); P(g, '#55555f', 6, 0, 3, 44); P(g, '#55555f', 11, 0, 3, 44);
      P(g, '#787884', 1, 0, 1, 44); P(g, '#787884', 6, 0, 1, 44); P(g, '#787884', 11, 0, 1, 44);
      P(g, '#3c3c46', 0, 8, 16, 3); P(g, '#3c3c46', 0, 30, 16, 3);
    })),
    shedchest: () => outlined(mk(16, 16, g => {
      P(g, '#7a5535', 1, 5, 14, 10); P(g, '#a07a4c', 1, 5, 14, 3); P(g, '#55555f', 1, 8, 14, 1); P(g, '#e0b85a', 7, 7, 2, 3);
    })),
    mailbox: () => outlined(mk(16, 24, g => {
      P(g, '#6f4c30', 7, 11, 2, 13); P(g, '#b23a3a', 2, 3, 12, 8); P(g, '#d4504a', 3, 3, 10, 2); P(g, '#7d2828', 12, 5, 1, 3); P(g, '#e0b85a', 13, 2, 1, 4);
    })),
    trough: () => outlined(mk(24, 14, g => {
      P(g, '#8a6239', 1, 3, 22, 9); P(g, '#a57a4c', 1, 3, 22, 2); P(g, '#4a3522', 3, 5, 18, 3);
    })),
    troughfull: () => outlined(mk(24, 14, g => {
      P(g, '#8a6239', 1, 3, 22, 9); P(g, '#a57a4c', 1, 3, 22, 2); P(g, '#e0c060', 3, 4, 18, 4); P(g, '#c79a3c', 5, 6, 6, 1); P(g, '#c79a3c', 13, 5, 6, 1);
    })),
    // Furniture
    bed: () => outlined(mk(26, 34, g => {
      P(g, '#7a5535', 1, 1, 24, 32); P(g, '#a07a4c', 1, 1, 24, 3);
      P(g, '#f1e9d8', 3, 4, 20, 8); P(g, '#d8cdb8', 3, 11, 20, 1);
      P(g, '#3f6fa8', 3, 12, 20, 19); P(g, '#5a8ac0', 3, 12, 20, 2); P(g, '#2f5a8c', 3, 29, 20, 2);
      for (let i = 5; i < 23; i += 6) P(g, '#5a8ac0', i, 18, 3, 1);
    })),
    table: () => outlined(mk(32, 24, g => {
      P(g, '#a57a4c', 1, 2, 30, 12); P(g, '#c49a66', 1, 2, 30, 2); P(g, '#7a5535', 1, 13, 30, 3);
      P(g, '#5f4128', 3, 16, 3, 8); P(g, '#5f4128', 26, 16, 3, 8);
    })),
    lettertable: () => outlined(mk(32, 24, g => {
      P(g, '#a57a4c', 1, 2, 30, 12); P(g, '#c49a66', 1, 2, 30, 2); P(g, '#7a5535', 1, 13, 30, 3);
      P(g, '#5f4128', 3, 16, 3, 8); P(g, '#5f4128', 26, 16, 3, 8);
      P(g, '#f4ead0', 10, 5, 10, 7); P(g, '#c9b78e', 11, 7, 8, 1); P(g, '#c9b78e', 11, 9, 6, 1); P(g, '#c43030', 14, 11, 2, 1);
    })),
    chair: () => outlined(mk(14, 22, g => {
      P(g, '#8a6239', 2, 2, 10, 10); P(g, '#a57a4c', 2, 2, 10, 1); P(g, '#b08a5a', 2, 11, 10, 3); P(g, '#5f4128', 2, 14, 2, 8); P(g, '#5f4128', 10, 14, 2, 8);
    })),
    stove: () => outlined(mk(20, 30, g => {
      P(g, '#3c3c46', 2, 8, 16, 21); P(g, '#55555f', 2, 8, 16, 2); P(g, '#23232b', 5, 15, 10, 9); P(g, '#e88a2c', 7, 19, 6, 4); P(g, '#f7dd7a', 9, 21, 2, 2);
      P(g, '#3c3c46', 12, 0, 4, 8);
    })),
    bookshelf: () => outlined(mk(32, 38, g => {
      P(g, '#6f4c30', 1, 1, 30, 36); P(g, '#8a6239', 1, 1, 30, 2);
      const r = mulberry(4), cols = ['#b23a3a', '#3f6fa8', '#d9a13c', '#4f9642', '#7c4fb0', '#c9b78e'];
      for (let row = 0; row < 3; row++) {
        const y = 4 + row * 11; P(g, '#3f2c1c', 3, y, 26, 9);
        for (let x = 4; x < 27;) { const w = 2 + Math.floor(r() * 2), h = 5 + Math.floor(r() * 4); P(g, cols[Math.floor(r() * 6)], x, y + 9 - h, w, h); x += w + (r() < 0.2 ? 2 : 0); }
      }
    })),
    fireplace: () => outlined(mk(32, 40, g => {
      P(g, '#8d8378', 1, 1, 30, 38); P(g, '#a59b8f', 1, 1, 30, 3);
      for (let y = 6; y < 36; y += 6) P(g, '#6f6659', 1, y, 30, 1);
      P(g, '#23201c', 7, 18, 18, 21); P(g, '#7a5535', 8, 34, 16, 3);
      P(g, '#e0602c', 10, 26, 12, 8); P(g, '#f4a23a', 12, 28, 8, 6); P(g, '#fbe08a', 14, 31, 4, 3);
    })),
    plant: () => outlined(mk(16, 24, g => {
      const r = mulberry(8);
      P(g, '#b5603e', 4, 17, 8, 6); P(g, '#cf7650', 3, 16, 10, 2);
      blob(g, 8, 9, 6, LEAVES[0], r);
    })),
    counter: () => outlined(mk(16, 24, g => {
      P(g, '#8a6239', 0, 8, 16, 15); P(g, '#c49a66', 0, 4, 16, 5); P(g, '#dcb684', 0, 4, 16, 1); P(g, '#6f4c30', 0, 22, 16, 1);
      P(g, '#6f4c30', 3, 12, 10, 7);
    })),
    shelf: () => outlined(mk(32, 38, g => {
      P(g, '#7a5535', 1, 1, 30, 36);
      const r = mulberry(19), cols = ['#e0403f', '#f0cf4e', '#5fb04e', '#e88a2c', '#f1e7ea', '#7c4fb0', '#c9a06a'];
      for (let row = 0; row < 3; row++) {
        const y = 3 + row * 12; P(g, '#4a3522', 3, y, 26, 10);
        for (let x = 4; x < 26; x += 6) { const c = cols[Math.floor(r() * 7)]; P(g, c, x, y + 4, 4, 6); P(g, '#ffffff66', x, y + 4, 1, 3); P(g, '#c9b78e', x + 1, y + 2, 2, 2); }
      }
    })),
    anvil: () => outlined(mk(24, 20, g => {
      P(g, '#55555f', 3, 3, 18, 5); P(g, '#787884', 3, 3, 18, 1); P(g, '#55555f', 0, 3, 5, 3); P(g, '#3c3c46', 8, 8, 8, 7); P(g, '#55555f', 5, 15, 14, 4);
    })),
    forge: () => outlined(mk(32, 42, g => {
      P(g, '#6e665c', 1, 8, 30, 33); P(g, '#857d72', 1, 8, 30, 3); P(g, '#6e665c', 9, 0, 14, 8);
      P(g, '#23201c', 6, 18, 20, 15); P(g, '#e0602c', 8, 24, 16, 9); P(g, '#f4a23a', 11, 26, 10, 7); P(g, '#fbe08a', 14, 29, 5, 4);
      for (let y = 13; y < 40; y += 7) P(g, '#514b43', 1, y, 30, 1);
    })),
    altar: () => outlined(mk(32, 28, g => {
      P(g, '#d4cbb8', 1, 6, 30, 21); P(g, '#ece4d2', 1, 6, 30, 3); P(g, '#a89f8c', 1, 25, 30, 2);
      P(g, '#4f9642', 13, 12, 6, 10); P(g, '#6fb44b', 14, 13, 2, 8); P(g, '#b23a3a', 8, 2, 2, 5); P(g, '#b23a3a', 22, 2, 2, 5); P(g, '#f7dd7a', 8, 0, 2, 2); P(g, '#f7dd7a', 22, 0, 2, 2);
    })),
    pew: () => outlined(mk(16, 18, g => {
      P(g, '#8a6239', 0, 2, 16, 8); P(g, '#a57a4c', 0, 2, 16, 1); P(g, '#b08a5a', 0, 10, 16, 3); P(g, '#5f4128', 1, 13, 2, 5); P(g, '#5f4128', 13, 13, 2, 5);
    })),
    window_i: () => mk(16, 16, g => {
      P(g, '#6f4c30', 1, 2, 14, 12); P(g, '#a8d8f0', 3, 4, 10, 8); P(g, '#d8f0fc', 4, 5, 3, 3); P(g, '#6f4c30', 8, 4, 1, 8); P(g, '#6f4c30', 3, 8, 10, 1);
    }),
    picture: () => mk(16, 16, g => {
      P(g, '#8a6239', 2, 2, 12, 10); P(g, '#74b04a', 3, 3, 10, 8); P(g, '#a8d8f0', 3, 3, 10, 4); P(g, '#5f4128', 7, 6, 2, 3);
    }),
    stall: () => outlined(mk(48, 44, g => {
      P(g, '#6f4c30', 3, 14, 3, 30); P(g, '#6f4c30', 42, 14, 3, 30); P(g, '#a57a4c', 2, 30, 44, 12); P(g, '#c49a66', 2, 30, 44, 2);
      for (let x = 0; x < 48; x += 8) { P(g, x % 16 ? '#f2e3bd' : '#6a4a9a', x, 4, 8, 12); P(g, x % 16 ? '#d8c8a0' : '#513860', x, 14, 8, 2); }
      const cols = ['#e0403f', '#f0cf4e', '#8fd0c0', '#e88a2c'];
      for (let i = 0; i < 6; i++) P(g, cols[i % 4], 7 + i * 6, 26, 4, 4);
    })),
  };
  function obj(type, season = 0) { return memo('o' + type + season, () => STATIC[type](season)); }

  // ---- Crops ---------------------------------------------------------------
  function cropSprite(crop, stage, mature, dead) {
    return memo(`crop${crop.id}${stage}${mature}${dead}`, () => outlined(mk(16, 28, g => {
      const G = dead ? '#7a6a48' : '#4f9642', L = dead ? '#94845a' : '#74b84d', B = 27;
      if (stage === 0) { P(g, '#3e2919', 6, B - 3, 4, 2); P(g, L, 7, B - 5, 2, 2); return; }
      if (stage === 1) { P(g, G, 7, B - 7, 2, 7); P(g, L, 5, B - 8, 3, 2); P(g, L, 8, B - 6, 3, 2); return; }
      const sh = crop.shape;
      if (sh === 'stalk') {
        const h = stage === 2 ? 12 : stage === 3 ? 18 : 24;
        P(g, G, 7, B - h, 2, h);
        for (let y = B - h + 2; y < B - 1; y += 4) { P(g, L, 9, y, 5, 1); P(g, L, 2, y + 2, 5, 1); P(g, G, 12, y + 1, 2, 1); P(g, G, 2, y + 3, 2, 1); }
        if (mature) { P(g, crop.c1, 9, B - 16, 3, 8); P(g, crop.c2, 11, B - 16, 1, 8); P(g, crop.c1, 4, B - 13, 3, 8); P(g, crop.c2, 6, B - 13, 1, 8); P(g, '#e8d9a0', 7, B - 26, 2, 3); }
        return;
      }
      if (sh === 'vine') {
        const h = stage === 2 ? 11 : stage === 3 ? 16 : 20;
        P(g, '#8a6239', 7, B - h - 2, 2, h + 2);
        for (let y = B - h; y < B - 1; y += 3) { P(g, y % 2 ? G : L, 3, y, 10, 2); P(g, L, 2 + (y % 3) * 2, y - 1, 3, 1); }
        if (mature) for (let i = 0; i < 5; i++) { const x = 2 + (i * 5) % 11, y = B - h + 2 + (i * 7) % (h - 3); P(g, crop.c1, x, y, 3, 3); P(g, crop.c2, x + 2, y + 2, 1, 1); }
        return;
      }
      if (sh === 'ground') {
        P(g, G, 2, B - 3, 12, 2); P(g, L, 4, B - 7, 3, 4); P(g, G, 9, B - 6, 3, 3);
        if (stage >= 3) { P(g, L, 1, B - 5, 4, 2); P(g, L, 11, B - 8, 4, 3); }
        if (mature) { P(g, crop.c1, 2, B - 11, 12, 11); P(g, crop.c2, 11, B - 11, 3, 11); P(g, '#ffffff55', 4, B - 10, 3, 2); P(g, crop.c2, 6, B - 11, 1, 11); P(g, '#5f4128', 7, B - 13, 2, 2); }
        return;
      }
      // root and bush
      const big = stage >= 3 ? 2 : 0;
      for (let i = 0; i < 5; i++) { const x = 2 + i * 3, h = 6 + big + (i === 2 ? 4 : i % 2 * 2); P(g, i % 2 ? G : L, x, B - h, 2, h); P(g, L, x - 1, B - h, 4, 2); }
      if (mature && sh === 'root') { P(g, crop.c1, 4, B - 5, 8, 5); P(g, crop.c2, 4, B - 5, 8, 2); P(g, '#ffffff55', 5, B - 3, 2, 1); }
      if (mature && sh === 'bush') for (let i = 0; i < 6; i++) { const x = 2 + (i * 5) % 11, y = B - 12 + (i * 3) % 10; P(g, crop.c1, x, y, 3, 3); P(g, crop.c2, x + 2, y + 2, 1, 1); }
    })));
  }

  // ---- Item icons ----------------------------------------------------------
  const STEEL = '#b4bcc8', HAND = '#8a6239';
  const ICONS = {
    root: (g, a, b) => { P(g, '#4f9642', 6, 1, 2, 4); P(g, '#74b84d', 8, 2, 3, 3); P(g, '#74b84d', 4, 2, 2, 2); P(g, a, 3, 5, 10, 6); P(g, a, 5, 11, 6, 2); P(g, a, 7, 13, 2, 2); P(g, b, 3, 5, 10, 2); P(g, '#ffffff66', 5, 8, 2, 2); },
    potato: (g, a, b) => { P(g, a, 2, 5, 12, 8); P(g, a, 4, 3, 8, 12); P(g, b, 10, 8, 4, 5); P(g, b, 5, 7, 1, 1); P(g, b, 8, 11, 1, 1); P(g, b, 7, 5, 1, 1); P(g, '#ffffff44', 4, 4, 3, 2); },
    berry: (g, a, b) => { P(g, '#4f9642', 4, 2, 8, 2); P(g, '#74b84d', 7, 1, 2, 2); P(g, a, 3, 4, 10, 5); P(g, a, 4, 9, 8, 3); P(g, a, 6, 12, 4, 2); P(g, b, 11, 5, 2, 4); for (const [x, y] of [[5, 6], [9, 6], [7, 9], [5, 9], [10, 9]]) P(g, '#f7e26b', x, y); },
    round: (g, a, b) => { P(g, a, 3, 4, 10, 10); P(g, a, 2, 6, 12, 6); P(g, b, 11, 6, 3, 7); P(g, '#ffffff77', 4, 6, 3, 2); P(g, '#4f9642', 6, 2, 4, 3); P(g, '#74b84d', 7, 1, 2, 2); },
    corn: (g, a, b) => { P(g, a, 5, 1, 6, 11); for (let y = 2; y < 12; y += 2) P(g, b, 5, y, 6, 1); P(g, b, 7, 1, 1, 11); P(g, '#74b84d', 3, 7, 3, 8); P(g, '#74b84d', 10, 7, 3, 8); P(g, '#4f9642', 6, 11, 4, 4); },
    melon: (g, a, b) => { P(g, a, 2, 3, 12, 11); P(g, a, 1, 5, 14, 7); for (let x = 3; x < 14; x += 3) P(g, b, x, 3, 1, 11); P(g, '#ffffff55', 3, 5, 2, 2); },
    grape: (g, a, b) => { P(g, '#4f9642', 7, 1, 2, 3); P(g, '#74b84d', 9, 2, 3, 2); for (const [x, y] of [[3, 4], [6, 4], [9, 4], [4, 7], [7, 7], [10, 7], [5, 10], [8, 10], [6, 13]]) { P(g, a, x, y, 3, 3); P(g, b, x + 2, y + 2); } },
    pumpkin: (g, a, b) => { P(g, a, 1, 5, 14, 9); P(g, a, 3, 4, 10, 11); P(g, b, 5, 4, 1, 11); P(g, b, 10, 4, 1, 11); P(g, '#ffffff55', 3, 6, 2, 3); P(g, '#5f4128', 7, 1, 2, 3); P(g, '#74b84d', 9, 2, 3, 1); },
    kale: (g, a, b) => { P(g, a, 3, 3, 10, 7); P(g, b, 5, 5, 6, 8); P(g, a, 1, 5, 3, 4); P(g, a, 12, 5, 3, 4); P(g, '#f0f6fc', 7, 2, 2, 11); P(g, b, 7, 13, 2, 2); },
    seed: (g, a, b) => { P(g, '#e6d4a8', 3, 1, 10, 14); P(g, '#c9b78e', 3, 1, 10, 2); P(g, '#c9b78e', 12, 1, 1, 14); P(g, a, 5, 5, 6, 6); P(g, b, 5, 9, 6, 2); P(g, '#4f9642', 7, 3, 2, 2); },
    flower: (g, a, b) => { P(g, '#4f9642', 7, 8, 2, 7); P(g, '#74b84d', 9, 11, 3, 2); P(g, a, 4, 2, 8, 7); P(g, a, 3, 4, 10, 3); P(g, b, 7, 4, 2, 3); },
    leek: (g, a, b) => { P(g, b, 5, 1, 2, 8); P(g, b, 9, 1, 2, 7); P(g, b, 7, 2, 2, 7); P(g, a, 6, 8, 4, 7); P(g, '#c9d0b0', 9, 8, 1, 7); },
    herb: (g, a, b) => { P(g, b, 7, 5, 2, 10); P(g, a, 2, 3, 5, 4); P(g, a, 9, 2, 5, 4); P(g, a, 3, 8, 4, 3); P(g, a, 9, 7, 5, 3); P(g, '#ffffff77', 3, 4, 2, 1); P(g, '#ffffff77', 10, 3, 2, 1); },
    bunch: (g, a, b) => { P(g, '#4f9642', 6, 1, 4, 3); for (const [x, y] of [[3, 4], [8, 4], [5, 7], [10, 8], [3, 9], [7, 11]]) { P(g, a, x, y, 4, 4); P(g, b, x + 3, y + 3); P(g, '#ffffff66', x + 1, y + 1); } },
    nut: (g, a, b) => { P(g, a, 3, 6, 10, 8); P(g, a, 5, 13, 6, 2); P(g, b, 11, 7, 2, 7); P(g, '#c79a68', 2, 3, 12, 4); P(g, b, 2, 6, 12, 1); P(g, '#5f4128', 7, 1, 2, 2); },
    mushroom: (g, a, b) => { P(g, b, 6, 8, 4, 7); P(g, a, 2, 3, 12, 6); P(g, a, 4, 1, 8, 2); P(g, '#ffffff', 4, 4, 2, 2); P(g, '#ffffff', 9, 3, 2, 2); P(g, '#ffffff', 11, 6, 2, 1); },
  };
  ICONS.wood = g => { P(g, '#8a6239', 1, 7, 14, 5); P(g, '#a57a4c', 1, 7, 14, 1); P(g, '#c79a68', 12, 7, 3, 5); P(g, '#a87c4c', 13, 8, 1, 3); P(g, '#8a6239', 3, 3, 11, 4); P(g, '#a57a4c', 3, 3, 11, 1); P(g, '#c79a68', 11, 3, 3, 4); };
  ICONS.stone = g => { P(g, '#85858c', 3, 5, 10, 8); P(g, '#a0a0a8', 4, 4, 7, 4); P(g, '#6e6e74', 9, 9, 4, 4); P(g, '#c2c2c8', 5, 5, 3, 1); };
  ICONS.fiber = g => { for (let i = 0; i < 5; i++) P(g, i % 2 ? '#74b84d' : '#4f9642', 4 + i * 2, 2, 1, 12); P(g, '#c9a170', 3, 7, 11, 2); };
  ICONS.ore = (g, a, b) => { P(g, '#85858c', 2, 5, 12, 9); P(g, '#a0a0a8', 3, 4, 8, 3); P(g, a, 4, 6, 3, 3); P(g, a, 9, 8, 3, 3); P(g, b, 6, 10, 2, 2); };
  ICONS.drop = (g, a, b) => { P(g, a, 7, 2, 2, 3); P(g, a, 5, 5, 6, 3); P(g, a, 4, 8, 8, 5); P(g, a, 6, 13, 4, 1); P(g, b, 10, 8, 2, 5); P(g, '#ffffff77', 5, 8, 2, 2); };
  ICONS.feed = g => { P(g, '#d9c08f', 3, 4, 10, 11); P(g, '#b89f6e', 3, 4, 10, 2); P(g, '#b89f6e', 12, 4, 1, 11); P(g, '#e0c060', 5, 2, 6, 3); P(g, '#c79a3c', 6, 8, 4, 4); };
  ICONS.egg = (g, a, b) => { P(g, a, 5, 3, 6, 2); P(g, a, 4, 5, 8, 7); P(g, a, 5, 12, 6, 2); P(g, b, 10, 7, 2, 5); P(g, '#ffffff', 5, 5, 2, 2); };
  ICONS.fish = (g, a, b) => { P(g, a, 3, 6, 9, 5); P(g, a, 5, 5, 5, 7); P(g, b, 3, 9, 9, 2); P(g, b, 12, 5, 3, 2); P(g, b, 12, 10, 3, 2); P(g, b, 11, 7, 2, 3); P(g, '#fff', 4, 7, 2, 2); P(g, '#222', 4, 8); P(g, b, 7, 3, 3, 2); };
  ICONS.bag = (g, a, b) => { P(g, a, 3, 5, 10, 10); P(g, b, 11, 5, 2, 10); P(g, b, 5, 3, 6, 2); P(g, '#e6d4a8', 6, 8, 4, 4); };
  ICONS.sprinkler = g => { P(g, '#c87a48', 6, 7, 4, 7); P(g, '#e09a68', 6, 7, 1, 7); P(g, '#55555f', 3, 13, 10, 2); P(g, '#7dbbe6', 2, 3, 2, 2); P(g, '#7dbbe6', 12, 3, 2, 2); P(g, '#7dbbe6', 7, 1, 2, 2); P(g, '#c87a48', 4, 5, 8, 2); };
  ICONS.bowl = (g, a, b) => { P(g, a, 3, 5, 10, 3); P(g, b, 6, 5, 3, 1); P(g, '#d8c8a8', 2, 8, 12, 3); P(g, '#b8a888', 2, 10, 12, 1); P(g, '#d8c8a8', 4, 11, 8, 2); P(g, '#b8a888', 6, 13, 4, 1); };
  ICONS.pipe = g => { P(g, '#6f4c30', 2, 4, 6, 8); P(g, '#8a6239', 3, 4, 2, 7); P(g, '#23201c', 3, 4, 4, 2); P(g, '#6f4c30', 7, 9, 7, 2); P(g, '#55555f', 12, 8, 3, 2); };
  ICONS.ring = (g, a, b) => { const c = a || '#e0b85a', d = b || '#a87f2e'; P(g, c, 5, 3, 6, 2); P(g, c, 3, 5, 2, 6); P(g, d, 11, 5, 2, 6); P(g, d, 5, 11, 6, 2); P(g, '#fff6', 5, 4, 3, 1); };
  ICONS.letter = g => { P(g, '#f4ead0', 1, 4, 14, 9); P(g, '#c9b78e', 1, 4, 7, 1); P(g, '#c9b78e', 8, 4, 7, 1); P(g, '#d4c6a0', 2, 5, 12, 3); P(g, '#c43030', 7, 7, 3, 3); P(g, '#d4504a', 7, 7, 1, 1); };
  ICONS.page = g => { P(g, '#e8dcbc', 3, 1, 10, 14); P(g, '#3a2414', 5, 4, 6, 1); P(g, '#3a2414', 5, 6, 5, 1); P(g, '#3a2414', 5, 8, 6, 1); P(g, '#3a2414', 5, 10, 3, 1); P(g, '#c9b78e', 10, 12, 3, 3); };
  ICONS.hoe = (g, m, d, l) => { P(g, HAND, 5, 3, 2, 12); P(g, m, 3, 1, 9, 3); P(g, l, 3, 1, 9, 1); P(g, d, 9, 1, 3, 5); };
  ICONS.can = (g, m, d, l) => { P(g, m, 4, 6, 8, 8); P(g, l, 4, 6, 2, 8); P(g, m, 12, 8, 3, 2); P(g, m, 14, 6, 2, 2); P(g, d, 1, 7, 3, 1); P(g, d, 1, 7, 1, 5); P(g, d, 1, 12, 3, 1); P(g, d, 6, 4, 4, 2); };
  ICONS.axe = (g, m, d, l) => { P(g, HAND, 7, 2, 2, 13); P(g, m, 2, 2, 5, 7); P(g, l, 2, 2, 1, 7); P(g, d, 6, 3, 1, 5); };
  ICONS.pick = (g, m, d, l) => { P(g, HAND, 7, 3, 2, 12); P(g, m, 2, 2, 12, 2); P(g, d, 2, 3, 12, 1); P(g, m, 1, 4, 2, 2); P(g, m, 13, 4, 2, 2); P(g, l, 3, 2, 8, 1); };
  ICONS.scythe = g => { P(g, HAND, 9, 3, 2, 12); P(g, STEEL, 3, 2, 8, 2); P(g, STEEL, 1, 3, 3, 3); P(g, '#e0e6ee', 4, 2, 6, 1); };
  ICONS.rod = g => { P(g, HAND, 3, 12, 2, 3); P(g, HAND, 5, 9, 2, 3); P(g, '#a57a4c', 7, 6, 2, 3); P(g, '#a57a4c', 9, 3, 2, 3); P(g, '#a57a4c', 11, 1, 2, 2); P(g, '#fff', 13, 2, 1, 8); P(g, '#c43030', 12, 10, 3, 2); };

  // Worn iron at first, then copper, then bright iron as tools are upgraded.
  const METALS = [['#8c8478', '#645c52', '#aca498'], ['#d08a50', '#94562c', '#f4c090'], ['#c8d4e4', '#7c8aa0', '#f4f9ff'], ['#f0c840', '#b08a1c', '#fff0a0'], ['#a878d8', '#6a4498', '#e0c8ff']];
  function icon(id) {
    const it = ITEMS[id], lvl = UPGRADES[id] ? S.tools[id] : -1;
    return memo('icon' + id + (lvl >= 0 ? lvl : ''), () => {
      const [name, a, b] = it.icon;
      return outlined(mk(16, 16, g => (lvl >= 0 ? ICONS[name](g, ...METALS[lvl]) : ICONS[name](g, a, b))));
    });
  }

  // ---- Buildings -----------------------------------------------------------
  // A frontal house: walls with a shingled roof above. Returns a canvas whose
  // bottom-left corner lines up with the building's footprint.
  function house(o, season, night) {
    const W = o.tw * 16, H = o.wallH + o.roofH, OVER = 4;
    return mk(W + OVER * 2, H, g => {
      const r = mulberry(o.tw * 31 + o.roofH);
      const wy = o.roofH, x0 = OVER;
      // Walls
      P(g, o.wall[0], x0, wy, W, o.wallH);
      if (o.stone) {
        for (let row = 0; row < o.wallH / 6; row++) {
          P(g, o.wall[2], x0, wy + row * 6 + 5, W, 1);
          for (let x = (row % 2) * 7; x < W; x += 14) P(g, o.wall[2], x0 + x, wy + row * 6, 1, 5);
          for (let x = 3; x < W; x += 11) if (r() < 0.4) P(g, o.wall[1], x0 + x, wy + row * 6 + 1, 5, 2);
        }
      } else {
        for (let y = wy; y < H; y += 6) { P(g, o.wall[1], x0, y, W, 1); P(g, o.wall[2], x0, y + 5, W, 1); }
        for (let i = 0; i < W / 3; i++) P(g, o.wall[2], x0 + Math.floor(r() * W), wy + Math.floor(r() * o.wallH), 3, 1);
      }
      P(g, '#5f4128', x0, wy, 3, o.wallH); P(g, '#5f4128', x0 + W - 3, wy, 3, o.wallH);
      P(g, '#00000040', x0, wy, W, 4); // shadow under the eaves
      P(g, '#6e6e74', x0, H - 5, W, 5); P(g, '#85858c', x0, H - 5, W, 1);
      for (let x = 2; x < W; x += 9) P(g, '#55555c', x0 + x, H - 4, 1, 4);
      // Roof
      const rows = Math.floor(o.roofH / 5);
      for (let i = 0; i < rows; i++) {
        const y = o.roofH - (i + 1) * 5, inset = Math.floor((i / rows) * o.slope);
        const x = inset, w = W + OVER * 2 - inset * 2;
        P(g, o.roof[0], x, y, w, 5); P(g, o.roof[1], x, y, w, 1); P(g, o.roof[2], x, y + 4, w, 1);
        for (let sx = (i % 2) * 4; sx < w; sx += 8) {
          P(g, o.roof[2], x + sx, y, 1, 5);
          if (r() < 0.25) P(g, o.roof[1], x + sx + 2, y + 2, 4, 1);
        }
        if (season === 3) { for (let sx = 0; sx < w; sx += 2) P(g, r() < 0.82 ? '#f0f6fc' : '#d6e2ee', x + sx, y, 2, 3 + Math.floor(r() * 3)); }
      }
      P(g, o.roof[2], 0, o.roofH - 2, W + OVER * 2, 2);
      if (season === 3) P(g, '#f0f6fc', 0, o.roofH - 2, W + OVER * 2, 1);
      if (o.chimney !== undefined) {
        const cx = o.chimney; P(g, '#7f7869', cx, 0, 12, 18); P(g, '#a8a292', cx, 0, 12, 3); P(g, '#5f5a4e', cx + 10, 3, 2, 15);
        if (season === 3) P(g, '#f0f6fc', cx, 0, 12, 2);
      }
      // Door
      if (o.doorCol !== undefined) {
        const dx = x0 + o.doorCol * 16 + 1, dy = H - 24;
        P(g, '#4a301d', dx - 1, dy - 1, 16, 25);
        P(g, o.door || '#8a4f2a', dx, dy, 14, 24); P(g, '#a8653a', dx, dy, 14, 2);
        P(g, '#6b3b1e', dx + 6, dy, 1, 24); P(g, '#6b3b1e', dx, dy + 11, 14, 1);
        P(g, '#e0b85a', dx + 10, dy + 13, 2, 2);
      }
      // Windows
      (o.windows || []).forEach(col => {
        const wx = x0 + col * 16 + 1, wyy = wy + 8;
        P(g, '#5f4128', wx - 1, wyy - 1, 16, 16);
        P(g, night ? '#f7d774' : '#9ccde8', wx, wyy, 14, 14);
        P(g, night ? '#ffeeb0' : '#d4ecf8', wx + 1, wyy + 1, 5, 5);
        P(g, '#5f4128', wx + 6, wyy, 2, 14); P(g, '#5f4128', wx, wyy + 6, 14, 2);
        P(g, '#c9a170', wx - 2, wyy + 14, 18, 2);
      });
      if (o.deco) o.deco(g, x0, wy, W, H, season);
    });
  }

  const BUILDINGS = {
    farmhouse: { tw: 6, wallH: 44, roofH: 44, slope: 12, wall: ['#c9a877', '#d9bc8e', '#a98a5c'], roof: ['#b5533e', '#cc6a50', '#8c3c2c'], chimney: 66, doorCol: 2, windows: [0.5, 4] },
    store: { tw: 8, wallH: 48, roofH: 44, slope: 12, wall: ['#d8c49a', '#e8d6b0', '#b8a278'], roof: ['#4f7da8', '#6995c0', '#3a6085'], doorCol: 3, windows: [1, 5.5], deco(g, x0, wy, W) {
      for (let x = 0; x < W; x += 8) { P(g, x % 16 ? '#f2e3bd' : '#3f8a5a', x0 + x, wy - 2, 8, 9); P(g, x % 16 ? '#d8c8a0' : '#2f6b45', x0 + x, wy + 6, 8, 2); }
      P(g, '#7a5535', x0 + 44, wy + 10, 36, 11); P(g, '#c9a170', x0 + 45, wy + 11, 34, 1);
      Font.draw(g, 'GOODS', x0 + 49, wy + 12, '#fff2c8');
    } },
    inn: { tw: 9, wallH: 56, roofH: 48, slope: 14, wall: ['#b98e60', '#cda476', '#96704a'], roof: ['#7d5a8a', '#9676a4', '#5e426a'], chimney: 112, doorCol: 4, windows: [1, 2.6, 6, 7.4], deco(g, x0, wy) {
      P(g, '#3c3c46', x0 + 88, wy + 2, 14, 2); P(g, '#7a5535', x0 + 90, wy + 4, 12, 12); P(g, '#f5ecd8', x0 + 93, wy + 8, 6, 5); P(g, '#d4504a', x0 + 97, wy + 6, 2, 2);
    } },
    smithy: { tw: 7, wallH: 44, roofH: 40, slope: 10, stone: true, wall: ['#8d8378', '#a59b8f', '#6f6659'], roof: ['#55555f', '#6e6e7a', '#3c3c46'], chimney: 20, doorCol: 3, windows: [1], deco(g, x0, wy, W, H) {
      P(g, '#3c3c46', x0 + 86, H - 16, 14, 4); P(g, '#55555f', x0 + 90, H - 12, 7, 12);
    } },
    guard: { tw: 7, wallH: 44, roofH: 40, slope: 10, stone: true, wall: ['#9a9aa2', '#b2b2ba', '#74747c'], roof: ['#7a2f30', '#94403f', '#5a2122'], doorCol: 3, windows: [1, 5], deco(g, x0, wy) {
      P(g, '#b23a3a', x0 + 40, wy + 3, 12, 15); P(g, '#e0b85a', x0 + 43, wy + 7, 6, 2); P(g, '#e0b85a', x0 + 44, wy + 5, 1, 2); P(g, '#e0b85a', x0 + 47, wy + 5, 1, 2);
    } },
    cottageA: { tw: 5, wallH: 40, roofH: 36, slope: 10, wall: ['#cbb48c', '#dcc8a2', '#a8926c'], roof: ['#6a8a4a', '#83a35f', '#4f6d36'], chimney: 14, doorCol: 2, windows: [0.4, 3.6] },
    cottageB: { tw: 5, wallH: 40, roofH: 36, slope: 10, wall: ['#a9b8c0', '#bfccd2', '#8a99a2'], roof: ['#a8743f', '#c28d54', '#82562c'], chimney: 58, doorCol: 2, windows: [0.4, 3.6] },
    shrine: { tw: 6, wallH: 48, roofH: 52, slope: 30, stone: true, wall: ['#c4bcac', '#d8d0c0', '#9e9686'], roof: ['#4a6a7a', '#628494', '#34505e'], doorCol: 2, windows: [0.5, 4], deco(g, x0) {
      P(g, '#e0b85a', x0 + 46, 2, 4, 14); P(g, '#e0b85a', x0 + 41, 6, 14, 3);
    } },
    coop: { tw: 5, wallH: 34, roofH: 26, slope: 8, wall: ['#b5805a', '#cb9770', '#90623f'], roof: ['#8a6a3f', '#a38258', '#6a4f2c'], windows: [3.4], deco(g, x0, wy, W, H) {
      P(g, '#23201c', x0 + 12, H - 18, 16, 18); P(g, '#a57a4c', x0 + 10, H - 4, 20, 4);
    } },
    shed: { tw: 4, wallH: 30, roofH: 22, slope: 6, wall: ['#7a6a55', '#8e7e68', '#5e5040'], roof: ['#5a5a50', '#6e6e62', '#44443c'], windows: [2.6], deco(g, x0, wy, W, H) {
      g.clearRect(30, 0, 18, 18); P(g, '#23201c', x0 + 8, H - 22, 14, 22); P(g, '#7a5535', x0 + 4, wy + 12, 22, 2);
    } },
  };

  function bin(season) {
    return outlined(mk(32, 26, g => {
      P(g, '#8a6239', 1, 8, 30, 17); P(g, '#a57a4c', 1, 8, 30, 2);
      P(g, '#6f4c30', 1, 15, 30, 1); P(g, '#6f4c30', 1, 21, 30, 1); P(g, '#55555f', 2, 8, 2, 17); P(g, '#55555f', 28, 8, 2, 17);
      P(g, '#b08a5a', 0, 2, 32, 7); P(g, '#c9a170', 0, 2, 32, 2); P(g, '#7a5535', 0, 8, 32, 1);
      if (season === 3) P(g, '#f0f6fc', 0, 1, 32, 3);
    }));
  }

  function building(type, season, night) {
    return memo(`b${type}${season}${night}`, () => {
      if (type === 'bin') return bin(season);
      return outlined(house(BUILDINGS[type], season, night));
    });
  }

  // ---- Creatures and small effects ----------------------------------------
  function chicken(f, dir) {
    return memo('chick' + f + dir, () => outlined(mk(14, 14, g => {
      if (dir) { g.translate(14, 0); g.scale(-1, 1); }
      const y = f === 1 ? -1 : 0;
      P(g, '#f7f1e3', 3, 5 + y, 8, 6); P(g, '#d8cdb8', 3, 10 + y, 8, 1); P(g, '#ffffff', 1, 4 + y, 3, 3);
      P(g, '#f7f1e3', 9, 2 + y, 4, 5); P(g, '#2a1a12', 11, 3 + y); P(g, '#e88a2c', 13, 4 + y, 1, 1); P(g, '#c43030', 10, 1 + y, 2, 1); P(g, '#c43030', 12, 6 + y, 1, 1);
      P(g, '#e88a2c', 5, 11, 1, 2); P(g, '#e88a2c', 8, 11, 1, 2);
    })));
  }
  function sprout(f) {
    return memo('sprout' + f, () => outlined(mk(14, 18, g => {
      const y = f ? -1 : 0;
      P(g, '#a8e0b0', 3, 8 + y, 8, 8); P(g, '#c8f0cc', 4, 8 + y, 3, 4); P(g, '#74b890', 3, 15 + y, 8, 1);
      P(g, '#2a3a2e', 5, 11 + y); P(g, '#2a3a2e', 9, 11 + y);
      P(g, '#74b84d', 6, 4 + y, 2, 4); P(g, '#8fd05c', 8, 2 + y, 4, 3); P(g, '#8fd05c', 2, 3 + y, 4, 3);
    })));
  }

  const house_defs = BUILDINGS;
  return { METALS, mk, P, memo, outlined, blob, STATIC, obj, tree, water, soil, paintGround, paintFringe, charFrame, portrait, cropSprite, icon, building, chicken, sprout, ICONS, house_defs };
})();
