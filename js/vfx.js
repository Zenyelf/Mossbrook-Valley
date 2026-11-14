'use strict';
// Combat visuals: particles with a look of their own (flames, smoke, snow, sparks,
// spores, stars), slashes, rings, lightning, and a proper sprite for every projectile.

const VFX = {
  parts: [], shapes: [],

  emit(kind, x, y, o) {
    const base = { flame: { t: 0.45, vy: -26, color: '#ff8a30' }, smoke: { t: 0.8, vy: -14, color: '#6a6470' }, flake: { t: 0.9, vy: 14, color: '#e8f6ff' },
      spark: { t: 0.3, color: '#fff4c0' }, spore: { t: 1.1, vy: -6, color: '#9ad060' }, bubble: { t: 0.7, vy: -18, color: '#7ad07a' }, heal: { t: 0.7, vy: -22, color: '#7ad07a' },
      hex: { t: 0.5, vy: -6, color: '#c070f0' }, blood: { t: 0.35, color: '#c43030' }, dust: { t: 0.4, vy: -6, color: '#c8b088' }, star: { t: 0.5, color: '#ffe08a' } }[kind] || {};
    this.parts.push(Object.assign({ kind, x, y, vx: 0, vy: 0, t: 0.5, color: '#fff' }, base, o || {}, { max: (o && o.t) || base.t || 0.5 }));
  },
  burst(kind, x, y, n, speed = 50) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28, s = speed * (0.4 + Math.random() * 0.6);
      this.emit(kind, x, y, { vx: Math.cos(a) * s, vy: Math.sin(a) * s - (kind === 'flame' || kind === 'smoke' ? 20 : 0) });
    }
  },
  slash(x, y, a, arc, r, color) { this.shapes.push({ type: 'slash', x, y, a, arc: Math.min(arc, 6.28), r: Math.max(16, r), color, t: 0.16, max: 0.16 }); },
  ring(x, y, r, color, t = 0.35) { this.shapes.push({ type: 'ring', x, y, r, color, t, max: t }); },
  beam(a, b, color) { this.shapes.push({ type: 'beam', x: a.x, y: a.y - 10, x2: b.x, y2: b.y - 10, color, t: 0.35, max: 0.35 }); },
  zap(x1, y1, x2, y2, color = '#f7e26b') {
    const pts = [[x1, y1]], n = Math.max(3, Math.floor(Math.hypot(x2 - x1, y2 - y1) / 10));
    for (let i = 1; i < n; i++) pts.push([x1 + (x2 - x1) * i / n + (Math.random() - 0.5) * 10, y1 + (y2 - y1) * i / n + (Math.random() - 0.5) * 10]);
    pts.push([x2, y2]);
    this.shapes.push({ type: 'zap', pts, color, t: 0.22, max: 0.22 });
  },
  flash(t = 0.12, color = '#ffffff') { this.shapes.push({ type: 'flash', color, t, max: t }); },

  explosion(x, y, r, kind) {
    if (kind === 'fire') { this.ring(x, y, r, '#ff8a30'); this.burst('flame', x, y, 22, 70); this.burst('smoke', x, y, 8, 30); }
    else if (kind === 'frost') { this.ring(x, y, r, '#bfe8ff', 0.5); this.burst('flake', x, y, 24, 70); this.shapes.push({ type: 'frostring', x, y, r, t: 0.6, max: 0.6 }); }
    else if (kind === 'thunder') { this.zap(x + (Math.random() - 0.5) * 20, y - 90, x, y, '#fff6a0'); this.ring(x, y, r, '#f7e26b'); this.burst('spark', x, y, 16, 90); this.flash(0.08, '#fffbe0'); }
    else if (kind === 'poison') { this.ring(x, y, r, '#9ad060'); this.burst('spore', x, y, 18, 40); }
    else { this.ring(x, y, r, '#ffe0a0'); this.burst('spark', x, y, 14, 80); this.burst('smoke', x, y, 6, 20); }
  },

  update(dt) {
    for (const p of this.parts) {
      p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.kind === 'spark' || p.kind === 'blood') { p.vx *= 0.9; p.vy += 120 * dt; }
      else if (p.kind === 'flake') p.x += Math.sin(p.t * 9 + p.y) * 10 * dt;
      else { p.vx *= 0.94; }
    }
    this.parts = this.parts.filter(p => p.t > 0);
    if (this.parts.length > 600) this.parts.splice(0, this.parts.length - 600);
    for (const s of this.shapes) s.t -= dt;
    this.shapes = this.shapes.filter(s => s.t > 0);
  },

  draw(g) {
    for (const p of this.parts) {
      const life = p.t / p.max, x = Math.round(p.x), y = Math.round(p.y);
      switch (p.kind) {
        case 'flame': g.fillStyle = life > 0.6 ? '#ffe070' : life > 0.3 ? '#ff8a30' : '#c43030'; g.fillRect(x, y, life > 0.5 ? 2 : 1, life > 0.5 ? 3 : 2); break;
        case 'smoke': g.fillStyle = `rgba(90,86,96,${life * 0.5})`; { const s = Math.round(4 - life * 2); g.fillRect(x - 1, y - 1, s, s); } break;
        case 'flake': g.fillStyle = p.color; g.fillRect(x, y - 1, 1, 3); g.fillRect(x - 1, y, 3, 1); break;
        case 'spore': g.fillStyle = `rgba(154,208,96,${life})`; g.fillRect(x, y, 2, 2); break;
        case 'bubble': g.fillStyle = p.color; g.fillRect(x - 1, y, 1, 1); g.fillRect(x + 1, y, 1, 1); g.fillRect(x, y - 1, 1, 1); g.fillRect(x, y + 1, 1, 1); break;
        case 'heal': g.fillStyle = p.color; g.fillRect(x, y - 1, 1, 3); g.fillRect(x - 1, y, 3, 1); break;
        case 'star': g.fillStyle = p.color; g.fillRect(x, y - 1, 1, 3); g.fillRect(x - 1, y, 3, 1); break;
        default: g.fillStyle = p.color; g.fillRect(x, y, 2, 2);
      }
    }
    for (const s of this.shapes) {
      const life = s.t / s.max;
      g.globalAlpha = Math.min(1, life * 1.6);
      if (s.type === 'slash') {
        g.strokeStyle = s.color; g.lineWidth = 3 * life + 1;
        g.beginPath(); g.arc(s.x, s.y, s.r * (1.1 - life * 0.3), s.a - s.arc / 2, s.a + s.arc / 2); g.stroke();
        g.strokeStyle = '#ffffff'; g.lineWidth = 1;
        g.beginPath(); g.arc(s.x, s.y, s.r * (1.1 - life * 0.3) - 2, s.a - s.arc / 3, s.a + s.arc / 3); g.stroke();
      } else if (s.type === 'ring') {
        g.strokeStyle = s.color; g.lineWidth = 2;
        g.beginPath(); g.arc(s.x, s.y, s.r * (1 - life * 0.7), 0, 6.29); g.stroke();
      } else if (s.type === 'frostring') {
        g.fillStyle = 'rgba(190,232,255,0.25)';
        g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.29); g.fill();
        g.fillStyle = '#e8f6ff';
        for (let i = 0; i < 10; i++) { const a = i * 0.628; g.fillRect(Math.round(s.x + Math.cos(a) * s.r * 0.8) - 1, Math.round(s.y + Math.sin(a) * s.r * 0.8) - 2, 2, 4); }
      } else if (s.type === 'zap') {
        for (const [w, c] of [[3, s.color], [1, '#ffffff']]) {
          g.strokeStyle = c; g.lineWidth = w; g.beginPath(); s.pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
        }
      } else if (s.type === 'beam') {
        g.strokeStyle = s.color; g.lineWidth = 2; g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(s.x2, s.y2); g.stroke();
      }
      g.globalAlpha = 1;
    }
    g.lineWidth = 1;
  },

  // Full-screen flashes are drawn after the world.
  drawScreen(g, W, H) {
    for (const s of this.shapes) if (s.type === 'flash') { g.globalAlpha = (s.t / s.max) * 0.5; g.fillStyle = s.color; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
  },

  // ---- Projectiles ----------------------------------------------------------------
  trail(s, dt) {
    s.trailT = (s.trailT || 0) - dt;
    if (s.trailT > 0) return;
    s.trailT = 0.03;
    if (s.kind === 'fireball') { this.emit('flame', s.x, s.y, { vx: -s.vx * 0.1 + (Math.random() - 0.5) * 20, vy: -s.vy * 0.1 - 10 }); if (Math.random() < 0.3) this.emit('smoke', s.x, s.y); }
    else if (s.kind === 'frost') this.emit('flake', s.x + (Math.random() - 0.5) * 4, s.y, { vx: -s.vx * 0.05, vy: 10 });
    else if (s.kind === 'hex') this.emit('hex', s.x + (Math.random() - 0.5) * 4, s.y + (Math.random() - 0.5) * 4);
    else if (s.kind === 'bomb') this.emit('spark', s.x + 2, s.y - 4 - (s.h || 0), { vy: -30, t: 0.2 });
  },

  shot(g, s) {
    const a = Math.atan2(s.vy || 0.01, s.vx || 0.01), x = Math.round(s.x), y = Math.round(s.y);
    const line = (len, colour, w = 1, back = 0) => { g.strokeStyle = colour; g.lineWidth = w; g.beginPath(); g.moveTo(x - Math.cos(a) * back, y - Math.sin(a) * back); g.lineTo(x - Math.cos(a) * len, y - Math.sin(a) * len); g.stroke(); };
    switch (s.kind) {
      case 'arrow': {
        // A real arrow: a speed streak, a wooden shaft, fletching (steel blue, or the colour of its token), a steel head.
        const c = Math.cos(a), n = Math.sin(a), px = -n, py = c;
        g.strokeStyle = 'rgba(255,250,235,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - c * 15, y - n * 15); g.lineTo(x - c * 30, y - n * 30); g.stroke();
        g.strokeStyle = 'rgba(255,250,235,0.18)'; g.beginPath(); g.moveTo(x - c * 15 + px, y - n * 15 + py); g.lineTo(x - c * 24 + px, y - n * 24 + py); g.stroke();
        line(15, '#4a2e16', 3, 1); line(15, '#b08850', 1, 1);
        const tx = x - c * 13, ty = y - n * 13;
        [[1, s.tokCol || '#5a8ab8'], [-1, '#f0ece0']].forEach(([sd, col]) => { g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.moveTo(tx + c * 2, ty + n * 2); g.lineTo(tx - c * 3 + px * 3 * sd, ty - n * 3 + py * 3 * sd); g.stroke(); });
        g.fillStyle = '#2a2a32'; g.beginPath(); g.moveTo(x + c * 4, y + n * 4); g.lineTo(x - c * 2 + px * 3, y - n * 2 + py * 3); g.lineTo(x - c * 2 - px * 3, y - n * 2 - py * 3); g.closePath(); g.fill();
        g.fillStyle = '#d8dce4'; g.beginPath(); g.moveTo(x + c * 3, y + n * 3); g.lineTo(x - c * 1.5 + px * 2, y - n * 1.5 + py * 2); g.lineTo(x - c * 1.5 - px * 2, y - n * 1.5 - py * 2); g.closePath(); g.fill();
        g.fillStyle = '#ffffff'; g.fillRect(Math.round(x + c * 1.5), Math.round(y + n * 1.5), 1, 1);
        break;
      }
      case 'bolt': line(6, '#5a4a3a', 2); g.fillStyle = '#c8ccd4'; g.fillRect(x - 1, y - 1, 2, 2); break;
      case 'harpoon': line(12, '#8a92a0', 2); line(4, '#d8dce4', 1); g.fillStyle = '#d8dce4'; g.fillRect(x - 2, y - 2, 3, 3); break;
      case 'spear': line(13, '#7a5535', 2); line(3, '#d8dce4', 2); break;
      case 'fireball': {
        g.fillStyle = 'rgba(255,138,48,0.35)'; g.beginPath(); g.arc(x, y, 6, 0, 6.29); g.fill();
        g.fillStyle = '#ff8a30'; g.beginPath(); g.arc(x, y, 4, 0, 6.29); g.fill();
        g.fillStyle = '#ffe070'; g.fillRect(x - 1, y - 1, 3, 3); break;
      }
      case 'frost': {
        g.save(); g.translate(x, y); g.rotate(a);
        g.fillStyle = '#9ad8ff'; g.fillRect(-6, -2, 9, 4); g.fillStyle = '#e8f6ff'; g.fillRect(-2, -1, 6, 2); g.fillStyle = '#ffffff'; g.fillRect(3, -1, 2, 2);
        g.restore(); break;
      }
      case 'hex': {
        g.fillStyle = 'rgba(192,112,240,0.35)'; g.beginPath(); g.arc(x, y, 6, 0, 6.29); g.fill();
        g.fillStyle = '#7a30b0'; g.beginPath(); g.arc(x, y, 3.5, 0, 6.29); g.fill();
        g.fillStyle = '#f0c0ff'; g.fillRect(x - 1, y - 1, 2, 2); break;
      }
      case 'web': {
        g.strokeStyle = '#f0f0f0'; g.lineWidth = 1;
        g.beginPath(); g.arc(x, y, 4, 0, 6.29); g.stroke();
        for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x - Math.cos(i * 0.785) * 5, y - Math.sin(i * 0.785) * 5); g.lineTo(x + Math.cos(i * 0.785) * 5, y + Math.sin(i * 0.785) * 5); g.stroke(); }
        break;
      }
      case 'axe': case 'flask': {
        const spin = (s.spin = (s.spin || 0) + 0.35);
        g.save(); g.translate(x, y); g.rotate(spin); g.drawImage(Art.icon(s.icon || 'throwing_axes'), -6, -6, 12, 12); g.restore(); break;
      }
      case 'bomb': {
        const h = s.h || 0;
        g.fillStyle = '#00000040'; g.fillRect(x - 3, y + 2, 6, 2);
        g.fillStyle = '#24242c'; g.beginPath(); g.arc(x, y - h, 4, 0, 6.29); g.fill();
        g.fillStyle = '#55555f'; g.fillRect(x - 2, y - h - 3, 2, 2); g.fillStyle = '#ff8a30'; g.fillRect(x + 1, y - h - 6, 2, 2); break;
      }
      default: line(5, s.color || (s.mine ? '#efe2c8' : '#ffb080'));
    }
    g.lineWidth = 1;
  },

  // Burning, chilled and stunned enemies look it.
  foeStatus(g, f, img, px, py, w, h) {
    if (f.burnT > 0) { g.globalAlpha = 0.3 + Math.sin(Render.waterT * 20) * 0.1; g.drawImage(Art.tinted(img, '#ff6020'), px, py, w, h); g.globalAlpha = 1; }
    if (f.slowT > 0) { g.globalAlpha = 0.45; g.drawImage(Art.tinted(img, '#9ad8ff'), px, py, w, h); g.globalAlpha = 1; }
    if (f.stunT > 0) {
      for (let i = 0; i < 3; i++) {
        const a = Render.waterT * 6 + i * 2.09, sx = Math.round(f.x + Math.cos(a) * 7), sy = Math.round(py - 3 + Math.sin(a) * 2);
        g.fillStyle = '#ffe08a'; g.fillRect(sx, sy - 1, 1, 3); g.fillRect(sx - 1, sy, 3, 1);
      }
    }
  },

  // Particles that follow whoever has a status, emitted a few times a second.
  statusTick(dt, x, y, st, key) {
    const k = '_vt' + key;
    this[k] = (this[k] || 0) - dt;
    if (this[k] > 0) return;
    this[k] = 0.07;
    if (st.burn > 0) this.emit('flame', x + (Math.random() - 0.5) * 10, y - 6 - Math.random() * 12);
    if (st.slow > 0) this.emit('flake', x + (Math.random() - 0.5) * 14, y - 26, { vy: 18 });
    if (st.poison > 0 && Math.random() < 0.5) this.emit('bubble', x + (Math.random() - 0.5) * 10, y - 10);
  },

  // A web holding you in place.
  playerRoot(g) {
    if (!(Combat.status.root > 0)) return;
    const x = Math.round(Player.x), y = Math.round(Player.y);
    g.strokeStyle = 'rgba(240,240,240,0.8)'; g.lineWidth = 1;
    g.beginPath(); g.arc(x, y - 2, 8, 0, 6.29); g.stroke();
    for (let i = 0; i < 4; i++) { const a = i * 0.785; g.beginPath(); g.moveTo(x - Math.cos(a) * 9, y - 2 - Math.sin(a) * 5); g.lineTo(x + Math.cos(a) * 9, y - 2 + Math.sin(a) * 5); g.stroke(); }
  },
};

// A sprite filled with one colour, for tinting burning and frozen things.
(() => {
  const cache = new Map();
  Art.tinted = (src, colour) => {
    let byColour = cache.get(colour);
    if (!byColour) { byColour = new WeakMap(); cache.set(colour, byColour); }
    if (byColour.has(src)) return byColour.get(src);
    const c = Art.mk(src.width, src.height, g => { g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = colour; g.fillRect(0, 0, src.width, src.height); });
    byColour.set(src, c);
    return c;
  };
})();
