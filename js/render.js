'use strict';
// Draws the world: baked ground, y-sorted scenery and characters, weather and light.

const Render = {
  cam: { x: 0, y: 0 }, baked: {}, drops: [], flash: 0, waterT: 0,

  mouseTile() {
    if (!Player.map) return null;
    return { x: Math.floor((Input.mouse.x + this.cam.x) / TILE), y: Math.floor((Input.mouse.y + this.cam.y) / TILE) };
  },

  // The static ground of a map is painted once per season into one big canvas.
  ground(m, season) {
    const k = m.id, b = this.baked[k];
    if (b && b.season === season && b.version === m.version) return b.canvas;
    const canvas = Art.mk(m.w * TILE, m.h * TILE, g => {
      const r = mulberry(m.w * 7919 + m.h * 13);
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
        const c = World.g(m, x, y);
        if (c !== T.W) Art.paintGround(g, c, x * TILE, y * TILE, season, r, m, x, y);
      }
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
        const c = World.g(m, x, y);
        if (c !== T.C && c !== T.D && c !== T.W) continue;
        [[0, -1, 0], [0, 1, 1], [-1, 0, 2], [1, 0, 3]].forEach(([dx, dy, side]) => {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < m.w && ny < m.h) Art.paintFringe(g, c, World.g(m, nx, ny), side, x * TILE, y * TILE, season, r);
        });
      }
    });
    this.baked[k] = { season, version: m.version, canvas };
    return canvas;
  },

  // 0 at noon through 1 at deep night.
  darkness() {
    const t = S.time;
    if (t < 420) return clamp((420 - t) / 60, 0, 0.5);
    return clamp((t - 1050) / 240, 0, 1);
  },

  world(g, W, H, dt) {
    const m = Player.map, season = S.season, dark = this.darkness();
    const worldW = m.w * TILE, worldH = m.h * TILE;
    this.cam.x = worldW <= W ? -Math.floor((W - worldW) / 2) : clamp(Math.round(Player.x - W / 2), 0, worldW - W);
    this.cam.y = worldH <= H ? -Math.floor((H - worldH) / 2) : clamp(Math.round(Player.y - 12 - H / 2), 0, worldH - H);
    const cx = this.cam.x, cy = this.cam.y;

    g.fillStyle = '#14100c'; g.fillRect(0, 0, W, H);
    g.save(); g.translate(-cx, -cy);

    const x0 = Math.max(0, Math.floor(cx / TILE)), y0 = Math.max(0, Math.floor(cy / TILE));
    const x1 = Math.min(m.w - 1, Math.floor((cx + W) / TILE)), y1 = Math.min(m.h - 1, Math.floor((cy + H) / TILE));

    this.waterT += dt;
    const wf = Math.floor(this.waterT * 2.5) % 3, wimg = Art.water(wf, season);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (World.g(m, x, y) === T.W) g.drawImage(wimg, x * TILE, y * TILE);
    g.drawImage(this.ground(m, season), 0, 0);

    for (const k in m.soil) {
      const [x, y] = k.split(',').map(Number);
      if (x < x0 || x > x1 || y < y0 || y > y1) continue;
      g.drawImage(Art.soil(m.soil[k].w ? 1 : 0), x * TILE, y * TILE);
      if (m.soil[k].f) { g.fillStyle = '#d8c8a855'; g.fillRect(x * TILE + 3, y * TILE + 3, 10, 10); }
    }

    // Flat wall decorations.
    m.objs.forEach(o => { if (OBJDEF[o.type].flat) g.drawImage(Art.obj(o.type, 0), o.x * TILE, o.y * TILE); });

    if (!m.indoor) this.drawTarget(g, m);
    Foes.drawHazards(g);
    VFX.playerRoot(g);

    // Everything with height, back to front.
    const items = [];
    const visible = (px, py) => px > cx - 60 && px < cx + W + 60 && py > cy - 10 && py < cy + H + 90;
    m.objs.forEach(o => {
      const d = OBJDEF[o.type];
      if (d.flat) return;
      const by = (o.y + (d.fh || 1)) * TILE;
      if (visible(o.x * TILE, by)) items.push({ y: by - 1, draw: () => this.drawObj(g, o, m.indoor ? 0 : season, dt) });
    });
    for (const k in m.soil) {
      const s = m.soil[k]; if (!s.c) continue;
      const [x, y] = k.split(',').map(Number);
      if (x < x0 - 1 || x > x1 + 1 || y < y0 - 1 || y > y1 + 2) continue;
      items.push({ y: (y + 1) * TILE - 2, draw: () => { const c = this.cropSprite(s.c, x, y); g.drawImage(c.img, c.x, c.y); } });
    }
    m.buildings.forEach(b => {
      const by = (b.y + b.h) * TILE;
      items.push({ y: by - 1, draw: () => {
        const img = Art.building(b.type, m.indoor ? 0 : season, dark > 0.3 ? 1 : 0);
        g.drawImage(img, b.x * TILE - (b.type === 'bin' ? 0 : 4), by - img.height + (b.type === 'bin' ? 4 : 0));
      } });
    });
    People.list.forEach(p => {
      if (p.hidden || p.map !== m) return;
      items.push({ y: p.y, draw: () => this.drawPerson(g, p) });
    });
    Foes.list.forEach(f => items.push({ y: f.y, draw: () => Foes.drawFoe(g, f) }));
    Crime.drawSleepers(g, m, items);
    if (m.id === 'farm') S.chickens.forEach(c => items.push({ y: c.y, draw: () => {
      this.shadow(g, c.x, c.y, 10);
      g.drawImage(Art.chicken(c.moving && Math.floor(this.waterT * 6) % 2 ? 1 : 0, c.dir), Math.round(c.x) - 7, Math.round(c.y) - 13);
    } }));
    Story.drawWorld(g, m, items);
    if (m.id === 'village' && Horse.paddockKind()) items.push({ y: 22 * TILE - 2, draw: () => Horse.drawPaddock(g) });
    items.push({ y: Player.y, draw: () => this.drawPlayer(g) });
    items.sort((a, b) => a.y - b.y).forEach(i => i.draw());

    Foes.drawShots(g);
    FX.draw(g);
    VFX.update(dt);
    VFX.draw(g);
    this.drawFocus(g);
    this.drawMarkers(g, m);
    g.restore();

    if (!m.indoor) this.weather(g, W, H, dt);
    this.lighting(g, W, H, m, dark);
    VFX.drawScreen(g, W, H);
    DLC.overlay(g);
  },

  shadow(g, x, y, w) {
    g.fillStyle = '#00000040';
    g.fillRect(Math.round(x - w / 2), Math.round(y - 2), w, 3);
    g.fillRect(Math.round(x - w / 2) + 1, Math.round(y - 3), w - 2, 5);
  },

  drawTarget(g, m) {
    const slot = Inv.held();
    if (!slot || UI.busy()) return;
    const kind = ITEMS[slot.id].kind;
    if (kind !== 'tool' && kind !== 'seed' && kind !== 'place') return;
    const t = Player.target();
    g.strokeStyle = '#ffffffb0'; g.lineWidth = 1;
    g.strokeRect(t.x * TILE + 0.5, t.y * TILE + 0.5, 15, 15);
  },

  objSprite(o, season) {
    const d = OBJDEF[o.type], fw = d.fw || 1, fh = d.fh || 1;
    let img;
    if (o.type === 'tree' || o.type === 'btree') img = Art.tree(o.kind, season, o.v);
    else if (o.type === 'forage') img = Art.icon(o.item);
    else if (o.type === 'sprinkler') img = Art.icon('sprinkler');
    else if (o.type === 'trough') img = Art.obj(S.troughFed ? 'troughfull' : 'trough', season);
    else if (o.type === 'chest') img = Art.obj(S.opened[o.cid] ? 'chestopen' : 'chest', season);
    else if (o.ladder) img = Art.obj('crackedrock', season);
    else if (o.type === 'wreck' && Memory.get('ship_fixed')) img = Art.obj('shipfixed', season);
    else if (o.type === 'grate') img = Art.obj(Memory.get('grate_open') ? 'grateopen' : 'grate', season);
    else img = Art.obj(o.type, season);
    return { img, x: Math.round((o.x + fw / 2) * TILE - img.width / 2), y: (o.y + fh) * TILE - img.height };
  },

  cropSprite(c, x, y) {
    const d = CROPS[c.id], st = Farm.stage(c);
    return { img: Art.cropSprite(d, c.dead ? Math.min(st, 3) : st, !c.dead && st === 4, !!c.dead), x: x * TILE, y: y * TILE + 16 - 27 };
  },

  drawObj(g, o, season, dt) {
    const s = this.objSprite(o, season);
    let sx = 0;
    if (o.shake > 0) { o.shake -= dt; sx = Math.round(Math.sin(o.shake * 60)); }
    g.drawImage(s.img, s.x + sx, s.y);
  },

  // Pulsing gold ring around the thing you can interact with.
  drawFocus(g) {
    const f = Interact.focus;
    if (!f || UI.busy() || Game.fadeState) return;
    g.globalAlpha = 0.6 + Math.sin(this.waterT * 7) * 0.4;
    if (f.sprite) { const s = f.sprite(); g.drawImage(Art.glow(s.img), s.x - 1, s.y - 1); }
    else {
      const x = f.tile[0] * TILE, y = f.tile[1] * TILE;
      g.fillStyle = f.closed ? '#ff9070' : '#ffe680';
      for (const [cx, cy] of [[0, 0], [12, 0], [0, 15], [12, 15]]) g.fillRect(x + cx, y + cy, 4, 1);
      for (const [cx, cy] of [[0, 0], [15, 0], [0, 12], [15, 12]]) g.fillRect(x + cx, y + cy, 1, 4);
    }
    g.globalAlpha = 1;
  },

  drawPerson(g, p) {
    this.shadow(g, p.x, p.y, 12);
    const f = p.moving ? Math.floor(p.frameT) % 4 : 0;
    g.drawImage(Art.charFrame(p.id, p.def.look, p.dir, f), Math.round(p.x) - 9, Math.round(p.y) - 26);
  },

  drawPlayer(g) {
    if (Horse.on) { this.shadow(g, Player.x, Player.y, 26); return Horse.draw(g); }
    const p = Player, f = p.swing > 0 ? 1 : p.moving ? Math.floor(p.frameT) % 4 : 0;
    this.shadow(g, p.x, p.y, 12);
    const px = Math.round(p.x), py = Math.round(p.y);
    const hidden = Combat.hurt > 0 && Math.floor(Combat.hurt * 16) % 2 === 0;
    const drawBody = () => {
      if (hidden) return;
      g.globalAlpha = Combat.roll > 0 ? 0.55 : Combat.sneaking ? 0.72 : 1;
      g.drawImage(Armor.frame(p.dir, f), px - 9, py - 26);
      g.globalAlpha = 1;
    };
    if (p.swing <= 0) return drawBody();
    const t = 1 - p.swing / (p.swingMax || 0.28), dir = p.swingDir;
    const angle = (-1.1 + t * 2.2) * (dir === DIRS.left ? -1 : 1);
    const ox = DX[dir] * 10, oy = DY[dir] * 8 - 12;
    const drawTool = () => {
      g.save();
      g.translate(px + ox, py + oy);
      g.rotate(Math.round(angle * 4) / 4);
      if (dir === DIRS.left) g.scale(-1, 1);
      g.drawImage(Art.icon(p.swingTool), -8, -14);
      g.restore();
    };
    if (dir === DIRS.up) { drawTool(); drawBody(); } else { drawBody(); drawTool(); }
  },

  drawMarkers(g, m) {
    const bob = Math.round(Math.sin(this.waterT * 4) * 1.5);
    People.list.forEach(p => {
      if (p.hidden || p.map !== m) return;
      let mark = null;
      if (Quests.turnInFor(p.id)) mark = ['?', '#7dd0ff'];
      else if (Quests.waitingOn(p.id)) mark = ['?', '#c8c0b0'];
      else if (Quests.available(p.id).length) mark = ['!', '#ffd84a'];
      if (!mark) return;
      const x = Math.round(p.x), y = Math.round(p.y) - 38 + bob;
      Font.draw(g, mark[0], x - 1, y + 1, '#2a1a10', 2);
      Font.draw(g, mark[0], x - 2, y, mark[1], 2);
    });
  },

  weather(g, W, H, dt) {
    const w = S.weather;
    if (w === 'sun') { this.drops.length = 0; return; }
    const wet = w === 'rain' || w === 'storm', want = w === 'storm' ? 220 : wet ? 140 : 90;
    while (this.drops.length < want) this.drops.push({ x: Math.random() * W, y: Math.random() * H, s: 0.6 + Math.random() * 0.6 });
    g.fillStyle = wet ? '#a8c8ec' : '#ffffff';
    for (const d of this.drops) {
      if (wet) { d.x -= 70 * dt * d.s; d.y += 380 * dt * d.s; } else { d.x += Math.sin(d.y * 0.04) * 16 * dt; d.y += 40 * dt * d.s; }
      if (d.y > H) { d.y = -6; d.x = Math.random() * W; }
      if (d.x < 0) d.x += W; if (d.x > W) d.x -= W;
      if (wet) { g.fillRect(Math.round(d.x), Math.round(d.y), 1, 5); } else { g.fillRect(Math.round(d.x), Math.round(d.y), d.s > 0.9 ? 2 : 1, d.s > 0.9 ? 2 : 1); }
    }
    if (w === 'storm') {
      if (Math.random() < dt * 0.12) { this.flash = 0.25; Sfx.noise(0.9, 0.3, 300); }
      if (this.flash > 0) { this.flash -= dt; g.fillStyle = `rgba(255,255,255,${clamp(this.flash * 2, 0, 0.5)})`; g.fillRect(0, 0, W, H); }
    }
  },

  // Mines and dungeons are black except around your lantern and any open flame.
  lantern(g, W, H, m) {
    if (!this.dk || this.dk.width !== W || this.dk.height !== H) this.dk = Art.mk(W, H, () => {});
    const d = this.dk.getContext('2d'), cx = this.cam.x, cy = this.cam.y;
    d.globalCompositeOperation = 'source-over';
    d.clearRect(0, 0, W, H);
    d.fillStyle = 'rgba(8,6,12,0.96)'; d.fillRect(0, 0, W, H);
    d.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r) => {
      for (const [f, a] of [[1, 0.1], [0.92, 0.12], [0.84, 0.14], [0.76, 0.18], [0.68, 0.22], [0.6, 0.28], [0.52, 0.36], [0.44, 0.5], [0.36, 0.7], [0.28, 1]]) { d.fillStyle = `rgba(0,0,0,${a})`; d.beginPath(); d.arc(Math.round(x - cx), Math.round(y - cy), r * f, 0, 7); d.fill(); }
    };
    hole(Player.x, Player.y - 10, 92);
    m.objs.forEach(o => { if (OBJDEF[o.type].light) hole(o.x * TILE + 8, o.y * TILE + 10, 62); });
    g.drawImage(this.dk, 0, 0);
  },

  lighting(g, W, H, m, dark) {
    const cx = this.cam.x, cy = this.cam.y;
    if (m.dark) return this.lantern(g, W, H, m);
    if (m.indoor) {
      if (dark > 0.2) { g.fillStyle = 'rgba(255,170,90,0.08)'; g.fillRect(0, 0, W, H); }
      return;
    }
    const wet = S.weather === 'rain' || S.weather === 'storm';
    if (dark > 0 || wet || S.weather === 'snow') {
      // Sunset warmth first, then a deep blue night.
      const dusk = clamp(1 - Math.abs(dark - 0.3) / 0.3, 0, 1);
      let r = 255 - dark * 175, gg = 255 - dark * 170 - dusk * 40, b = 255 - dark * 95 - dusk * 90;
      if (wet) { r *= 0.74; gg *= 0.78; b *= 0.86; }
      if (S.weather === 'snow') { r *= 0.92; gg *= 0.94; }
      g.globalCompositeOperation = 'multiply';
      g.fillStyle = `rgb(${r | 0},${gg | 0},${b | 0})`;
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'source-over';
    }
    if (dark > 0.3) {
      const a = (dark - 0.3) * 0.26;
      const glow = (x, y, rad) => {
        for (const [f, al] of [[1, 0.3], [0.66, 0.55], [0.36, 0.9]]) {
          g.fillStyle = `rgba(255,205,120,${a * al})`;
          g.beginPath(); g.arc(Math.round(x - cx), Math.round(y - cy), rad * f, 0, 7); g.fill();
        }
      };
      g.globalCompositeOperation = 'lighter';
      m.objs.forEach(o => {
        if (!OBJDEF[o.type].light) return;
        // Lamps and torches glow up high; fires and lanterns glow where the flame is (OBJDEF lightY).
        const ly0 = OBJDEF[o.type].lightY, lx = o.x * TILE + 8, ly = o.y * TILE + (ly0 === undefined ? -16 : ly0);
        if (lx > cx - 60 && lx < cx + W + 60 && ly > cy - 60 && ly < cy + H + 60) glow(lx, ly, 40);
      });
      Story.visibleKept().forEach(id => { const p = Story.keptAt(id); glow(p.x, p.y - 10, 20); });
      m.buildings.forEach(b => {
        const d = Art.house_defs[b.type];
        if (!d || !d.windows || b.type === 'shed') return;
        const base = (b.y + b.h) * TILE - d.wallH + 15;
        d.windows.forEach(col => glow(b.x * TILE + col * TILE + 8, base, 18));
      });
      g.globalCompositeOperation = 'source-over';
    }
  },
};
