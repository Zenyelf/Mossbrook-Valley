'use strict';
// HUD and every screen. Screens live on a stack; only the top one takes input.

const C = {
  ink: '#3a2414', soft: '#7a5a3a', paper: '#f5e2b8', paperD: '#e6cd98', wood: '#b5763c', woodL: '#d99a4e', woodD: '#5b2f1a',
  good: '#3f8a3f', bad: '#a83232', blue: '#3f6fa8', grey: '#a8967a',
};

function panel(g, x, y, w, h) {
  x = Math.round(x); y = Math.round(y);
  g.fillStyle = C.woodD; g.fillRect(x + 1, y, w - 2, h); g.fillRect(x, y + 1, w, h - 2);
  g.fillStyle = C.wood; g.fillRect(x + 1, y + 1, w - 2, h - 2);
  g.fillStyle = C.woodL; g.fillRect(x + 2, y + 2, w - 4, 1); g.fillRect(x + 2, y + 2, 1, h - 4);
  g.fillStyle = C.woodD; g.fillRect(x + 3, y + 3, w - 6, h - 6);
  g.fillStyle = C.paper; g.fillRect(x + 4, y + 4, w - 8, h - 8);
  g.fillStyle = C.paperD; g.fillRect(x + 4, y + h - 6, w - 8, 2); g.fillRect(x + w - 6, y + 4, 2, h - 8);
}
function inset(g, x, y, w, h, on) {
  g.fillStyle = on ? '#f7d774' : '#c9a66f'; g.fillRect(x, y, w, h);
  g.fillStyle = on ? '#fff0b0' : '#e0c594'; g.fillRect(x + 1, y + 1, w - 2, h - 2);
}
function drawSlot(g, x, y, slot, on) {
  inset(g, x, y, 20, 20, on);
  if (!slot) return;
  g.drawImage(Art.icon(slot.id), x + 2, y + 2);
  if (slot.s) { g.fillStyle = '#2a1a10'; g.fillRect(x + 14, y + 1, 5, 5); g.fillStyle = '#d4405a'; g.fillRect(x + 15, y + 2, 3, 3); }
  // A weapon with a token set in it shows a little gem of its colour.
  const tok = S.socket && S.socket[slot.id];
  if (tok) { g.fillStyle = '#2a1a10'; g.fillRect(x + 1, y + 1, 5, 5); g.fillStyle = TOKENS[tok].color; g.fillRect(x + 2, y + 2, 3, 3); }
  if (slot.n > 1) { const t = slot.n >= 10000 ? Math.floor(slot.n / 1000) + 'k' : slot.n >= 1000 ? (slot.n / 1000).toFixed(1) + 'k' : String(slot.n); Font.shadow(g, t, x + 19 - Font.width(t), y + 12, '#fff', '#2a1a10'); }
  if (slot.q) { g.fillStyle = slot.q === 2 ? '#f2c230' : '#c8d0dc'; g.fillRect(x + 2, y + 15, 3, 3); g.fillStyle = '#2a1a10'; g.fillRect(x + 3, y + 16, 1, 1); }
  if (slot.id === 'can') { g.fillStyle = '#2a1a10'; g.fillRect(x + 3, y + 16, 14, 2); g.fillStyle = '#5aa8e8'; g.fillRect(x + 3, y + 16, Math.round(14 * S.can / CAN_CAPACITY[S.tools.can]), 2); }
}
function heartsRow(g, x, y, n) {
  for (let i = 0; i < 10; i++) {
    g.fillStyle = i < n ? '#d4405a' : '#c9b08a';
    g.fillRect(x + i * 8, y, 2, 2); g.fillRect(x + i * 8 + 3, y, 2, 2); g.fillRect(x + i * 8, y + 1, 5, 2); g.fillRect(x + i * 8 + 1, y + 3, 3, 1); g.fillRect(x + i * 8 + 2, y + 4, 1, 1);
  }
}
function timeText(t) {
  const h = Math.floor(t / 60) % 24, m = t % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const UI = {
  W: 480, H: 270, stack: [], toasts: [], mouseIdle: true, isTop: true,

  busy() { return this.stack.length > 0; },
  push(s) { this.stack.push(s); },
  pop() { this.stack.pop(); },
  toast(text, icon) { this.toasts.push({ text, icon, t: 3.4 }); if (this.toasts.length > 6) this.toasts.shift(); },
  hit(x, y, w, h) { const m = Input.mouse; return this.isTop && m.x >= x && m.y >= y && m.x < x + w && m.y < y + h; },
  click(x, y, w, h) { if (this.hit(x, y, w, h) && Input.mouse.clickL) { Input.mouse.clickL = false; return true; } return false; },
  consumeClick() { Input.mouse.clickL = false; Input.mouse.clickR = false; },
  button(g, label, x, y, w, h = 14, disabled) {
    const on = !disabled && this.hit(x, y, w, h);
    inset(g, x, y, w, h, on);
    Font.center(g, label, x + w / 2, y + Math.floor((h - 7) / 2), disabled ? C.grey : C.ink);
    return !disabled && this.click(x, y, w, h);
  },

  update(dt) {
    for (const t of this.toasts) t.t -= dt;
    if (this.bannerT > 0) this.bannerT -= dt;
    this.toasts = this.toasts.filter(t => t.t > 0);
    if (Input.hit('mute')) Sfx.toggleMute();
    const top = this.stack[this.stack.length - 1];
    if (top && top.update) top.update(dt);
  },

  draw(g) {
    const hide = this.stack.some(s => s.noHud);
    if (!hide) { this.hud(g); this.drawToasts(g); }
    this.stack.forEach((s, i) => { this.isTop = i === this.stack.length - 1; if (s.draw) s.draw(g); });
    this.isTop = this.stack.length === 0;
    this.cursor(g);
  },

  cursor(g) {
    const { x, y } = Input.mouse, X = Math.round(x), Y = Math.round(y);
    if (x <= 0 && y <= 0) return;
    g.fillStyle = '#2a1a10';
    for (let i = 0; i < 9; i++) g.fillRect(X - 1, Y + i - 1, i + 3 > 8 ? 2 : i + 3, 1);
    g.fillRect(X + 2, Y + 8, 3, 3);
    g.fillStyle = '#ffe9b0';
    for (let i = 0; i < 7; i++) g.fillRect(X, Y + i, i + 1 > 6 ? 2 : i + 1, 1);
    g.fillRect(X + 3, Y + 7, 1, 2);
  },

  // ---- HUD --------------------------------------------------------------
  hud(g) {
    const W = this.W, H = this.H;
    // Clock (not in the Pit, where time stands still and your purse waits outside)
    const px = W - 102, inPit = typeof Arena !== 'undefined' && Arena.active && Player.map && Player.map.id === 'arena';
    if (!inPit) {
      panel(g, px, 4, 98, 48);
      Font.draw(g, `${SEASONS[S.season]} ${S.day}, Y${S.year}`, px + 8, 9, C.ink);
      Font.draw(g, timeText(S.time), px + 8, 20, C.ink);
      this.weatherIcon(g, px + 76, 19);
      g.fillStyle = '#e8b53c'; g.fillRect(px + 8, 33, 6, 6); g.fillStyle = '#f7dd7a'; g.fillRect(px + 9, 34, 2, 2); g.fillStyle = '#a8751f'; g.fillRect(px + 13, 34, 1, 5); g.fillRect(px + 9, 38, 5, 1);
      Font.draw(g, String(S.gold), px + 18, 33, C.ink);
    }
    const status = S.jail ? `Gaol: ${S.jail.left}d left, ${S.jail.tokens} tokens` : S.wanted ? `WANTED  ${S.bounty}g` : S.bounty ? `Bounty ${S.bounty}g` : '';
    if (status) Font.shadow(g, status, W - 6 - Font.width(status), 56, S.jail ? '#ffe08a' : '#ff9a8a');

    // Hotbar
    const hx = Math.round((W - 216) / 2), hy = H - 28;
    panel(g, hx - 6, hy - 6, 228, 32);
    for (let i = 0; i < 10; i++) drawSlot(g, hx + i * 22, hy, S.inv[i], i === S.sel);

    // Energy
    const ex = W - 16, eh = 70, ey = H - eh - 8, frac = clamp(S.energy / S.maxEnergy, 0, 1);
    panel(g, ex - 4, ey - 4, 16, eh + 8);
    g.fillStyle = '#6a4a2a'; g.fillRect(ex, ey, 8, eh);
    g.fillStyle = frac > 0.5 ? '#5cb85c' : frac > 0.2 ? '#e8b53c' : '#d4405a';
    const fh = Math.round(eh * frac); g.fillRect(ex, ey + eh - fh, 8, fh);
    g.fillStyle = '#ffffff44'; g.fillRect(ex, ey + eh - fh, 2, fh);

    // Health
    const hxB = ex - 20, hfrac = clamp(S.hp / Combat.maxHP(), 0, 1), hfh = Math.round(eh * hfrac);
    panel(g, hxB - 4, ey - 4, 16, eh + 8);
    g.fillStyle = '#6a4a2a'; g.fillRect(hxB, ey, 8, eh);
    g.fillStyle = '#d4405a'; g.fillRect(hxB, ey + eh - hfh, 8, hfh);
    g.fillStyle = '#ffffff44'; g.fillRect(hxB, ey + eh - hfh, 2, hfh);

    // Stamina shows only when it matters.
    const held = Inv.held(), maxS = Combat.maxStam();
    if (S.stam < maxS || (held && ITEMS[held.id].kind === 'weapon')) {
      const sw = 120, sx = Math.round((W - sw) / 2), sy = hy - 12;
      g.fillStyle = '#2a1a10'; g.fillRect(sx - 1, sy - 1, sw + 2, 5);
      g.fillStyle = '#e8c04a'; g.fillRect(sx, sy, Math.round(sw * clamp(S.stam / maxS, 0, 1)), 3);
    }
    if (Combat.sneaking) Font.shadow(g, 'Sneaking', W - 60, ey - 16, '#b8d0ff');
    const STATUS = { burn: ['Burning', '#ff9a50'], poison: ['Poisoned', '#9ad060'], slow: ['Slowed', '#9ad8ff'], root: ['Webbed', '#f0f0f0'] };
    let sy = ey - (Combat.sneaking ? 28 : 16);
    for (const k in STATUS) if (Combat.status[k] > 0) { Font.shadow(g, STATUS[k][0], W - 60, sy, STATUS[k][1]); sy -= 11; }

    const boss = Foes.boss();
    if (boss) {
      const bw = Math.min(260, W - 200), bx = Math.round((W - bw) / 2);
      Font.shadow(g, boss.def.name, Math.round(W / 2 - Font.width(boss.def.name) / 2), 4, '#ffb0a0');
      g.fillStyle = '#2a1a10'; g.fillRect(bx - 1, 14, bw + 2, 6);
      g.fillStyle = '#d4405a'; g.fillRect(bx, 15, Math.round(bw * clamp(boss.hp / boss.max, 0, 1)), 4);
    }
    if (this.bannerT > 0) {
      g.globalAlpha = clamp(this.bannerT, 0, 1);
      Font.shadow(g, this.bannerText, Math.round(W / 2 - Font.width(this.bannerText)), Math.round(H * 0.18), '#ffe08a', '#2a1a10', 2);
      g.globalAlpha = 1;
    }
    this.prompts(g);
    Arena.hud(g);

    this.tracker(g);
    if (absDay() <= 2 && !this.busy()) {
      const help = 'WASD move   C/Left-click use tool   E/Right-click interact   I menu   M map';
      Font.shadow(g, help, Math.round((W - Font.width(help)) / 2), hy - 18, '#fff4d0');
    }
  },

  banner(text) { this.bannerText = text; this.bannerT = 3; },

  // "[E] Talk to Marta" labels floating over whatever is in reach.
  prompts(g) {
    if (this.busy() || Game.fadeState) return;
    const tag = (key, p, above) => {
      const lw = Font.width(p.label), w = lw + 21, h = 13;
      const x = clamp(Math.round(p.ax - Render.cam.x - w / 2), 2, this.W - w - 2);
      const y = clamp(Math.round(p.ay - Render.cam.y - h) - (above ? 15 : 0), 2, this.H - h - 2);
      g.fillStyle = '#2a1a10e0'; g.fillRect(x, y, w, h);
      g.fillStyle = '#fff0b0'; g.fillRect(x + 2, y + 2, 11, 9);
      g.fillStyle = '#c9a050'; g.fillRect(x + 2, y + 10, 11, 1);
      Font.center(g, key, x + 8, y + 3, '#3a2414');
      Font.draw(g, p.label, x + 17, y + 3, p.closed ? '#ffb0a0' : '#fff4d0');
    };
    const e = Interact.focus, c = Interact.useHint;
    if (e) tag('E', e, false);
    if (c) tag('C', c, !!e && Math.abs(e.ax - c.ax) < 80 && Math.abs(e.ay - c.ay) < 16);
  },

  weatherIcon(g, x, y) {
    const w = S.weather;
    if (w === 'sun') { g.fillStyle = '#f2c230'; g.fillRect(x + 2, y, 6, 8); g.fillRect(x, y + 2, 10, 4); g.fillStyle = '#fff0a0'; g.fillRect(x + 3, y + 1, 2, 2); return; }
    g.fillStyle = w === 'snow' ? '#c8d8e8' : '#7a8896'; g.fillRect(x + 1, y + 1, 9, 4); g.fillRect(x + 3, y, 5, 1);
    g.fillStyle = w === 'snow' ? '#ffffff' : '#5aa8e8';
    g.fillRect(x + 2, y + 6, 1, 2); g.fillRect(x + 5, y + 7, 1, 2); g.fillRect(x + 8, y + 6, 1, 2);
    if (w === 'storm') { g.fillStyle = '#f2c230'; g.fillRect(x + 4, y + 5, 2, 2); g.fillRect(x + 3, y + 7, 2, 2); }
  },

  goalText(id, g, i) {
    const v = Quests.goalVal(id, g, i), n = Quests.goalTarget(g);
    return n > 1 ? `${g.label} ${Math.min(v, n)}/${n}` : g.label;
  },

  // The next story quest you have not started, and what it is waiting on.
  nextMain() {
    const q = Object.values(QUESTS).find(d => d.main && !S.quests[d.id] && d.needs);
    if (!q) return null;
    if (q.req()) return { title: 'Next: ' + q.title, lines: ['Talk to ' + NPCS[q.giver].name + ' (look for the !)'] };
    return { title: 'Next: ' + q.title, lines: q.needs().filter(([, ok]) => !ok).map(([t]) => t) };
  },

  tracker(g) {
    if (Arena.active) return;
    const act = Quests.list('active');
    const drawBox = (title, shown) => {
      const w = Math.min(200, Math.max(Font.width(title), ...shown.map(l => Font.width(l) + 8)) + 12);
      g.fillStyle = '#2a1a1099'; g.fillRect(4, 4, w, 15 + shown.length * 10);
      Font.shadow(g, title, 9, 7, '#ffe08a');
      shown.forEach((l, i) => Font.shadow(g, '- ' + l, 9, 18 + i * 10, '#fff4d0'));
    };
    if (!act.some(q => QUESTS[q].main)) {
      const next = this.nextMain();
      if (next) return drawBox(next.title, next.lines.slice(0, 4));
    }
    if (!act.length) return;
    const id = act.find(q => QUESTS[q].main && Quests.stageOf(q).turnin) || act.find(q => QUESTS[q].main) || act[0];
    const stage = Quests.stageOf(id), lines = [];
    stage.goals.forEach((q, i) => { if (Quests.goalVal(id, q, i) < Quests.goalTarget(q)) lines.push(this.goalText(id, q, i)); });
    if (!lines.length && stage.turnin) lines.push('Speak to ' + NPCS[stage.turnin].name);
    const shown = lines.slice(0, 5);
    const w = Math.min(190, Math.max(Font.width(QUESTS[id].title), ...shown.map(l => Font.width(l) + 8)) + 12);
    g.fillStyle = '#2a1a1099'; g.fillRect(4, 4, w, 15 + shown.length * 10);
    Font.shadow(g, QUESTS[id].title, 9, 7, '#ffe08a');
    shown.forEach((l, i) => Font.shadow(g, '- ' + l, 9, 18 + i * 10, '#fff4d0'));
  },

  drawToasts(g) {
    const n = this.toasts.length;
    this.toasts.forEach((t, i) => {
      const y = this.H - 52 - (n - i) * 15, w = Font.width(t.text) + (t.icon ? 26 : 10);
      g.globalAlpha = clamp(t.t * 3, 0, 1);
      g.fillStyle = '#2a1a10cc'; g.fillRect(6, y, w, 14);
      if (t.icon) g.drawImage(Art.icon(t.icon), 8, y - 1);
      Font.draw(g, t.text, t.icon ? 27 : 11, y + 3, '#fff4d0');
      g.globalAlpha = 1;
    });
  },

  // ---- Dialogue ---------------------------------------------------------
  say(who, text, cb) { this.push(this.dialog(who, text, null, cb)); },
  ask(who, text, opts) { this.push(this.dialog(who, text, opts)); },

  speaker(who) {
    if (who === 'me') return { name: 'Tam', id: 'tam', look: PLAYER_LOOK };
    if (who && NPCS[who]) return { name: NPCS[who].name, id: who, look: NPCS[who].look };
    return null;
  },

  // A speaker's name, split to fit the 65-pixel column under the portrait (at spaces, or after hyphens).
  nameLines(name) {
    const W = 65;
    if (Font.width(name) <= W) return [name];
    const toks = [];
    name.split(' ').forEach((word, i) => word.split(/(?<=-)/).forEach((t, j) => toks.push({ t, space: i > 0 && j === 0 })));
    const lines = []; let line = '';
    for (const k of toks) { const test = line ? line + (k.space ? ' ' : '') + k.t : k.t; if (Font.width(test) > W && line) { lines.push(line); line = k.t; } else line = test; }
    lines.push(line);
    return lines.slice(0, 3);
  },

  dialog(who, text, opts, cb) {
    if (who !== 'me') Codex.hear(text, who);
    const ui = this, sp = this.speaker(who), boxW = Math.min(this.W - 12, 440);
    const textW = boxW - 24 - (sp ? 58 : 0), PER = 5;
    // The speaker's name sits under the portrait; long names wrap so they never leave the frame.
    const nameLines = sp ? this.nameLines(sp.name) : [];
    const allLines = Font.wrap(text, textW), pages = [];
    for (let i = 0; i < allLines.length; i += PER) pages.push(allLines.slice(i, i + PER));
    const optLines = (opts || []).map(o => Font.wrap(o.text, textW - 10));
    const optsH = optLines.reduce((t, l) => t + l.length * 10 + 3, 0);
    let page = 0, shown = 0, sel = (opts || []).findIndex(o => !o.locked), talkT = 0;
    if (sel < 0) sel = 0;

    const pageLen = () => pages[page].join('').length;
    const typing = () => shown < pageLen();
    const choosing = () => opts && page === pages.length - 1 && !typing();
    const layout = () => {
      const textH = pages[page].length * 11;
      const h = Math.max(sp ? 76 + Math.max(0, nameLines.length - 1) * 9 : 52, textH + 20 + (opts && page === pages.length - 1 ? optsH + 4 : 0));
      return { x: Math.round((ui.W - boxW) / 2), y: ui.H - h - 6, w: boxW, h, textH };
    };
    const optY = (L, i) => L.y + 11 + L.textH + 3 + optLines.slice(0, i).reduce((t, l) => t + l.length * 10 + 3, 0);
    const choose = () => {
      const o = opts[sel];
      if (o.locked) { Sfx.play('deny'); return; }
      Sfx.play('click'); ui.pop(); o.fn();
    };
    const finish = () => { ui.pop(); if (cb) cb(); };

    return {
      // Read by the automated tests.
      optTexts: () => (opts || []).map(o => o.text), ready: () => !!choosing(), selIndex: () => sel,
      update(dt) {
        if (typing()) {
          shown += dt * 70;
          talkT -= dt;
          if (talkT <= 0 && sp) { talkT = 0.07; Sfx.play('talk', who); }
        }
        const go = Input.hit('confirm') || Input.mouse.clickL;
        if (choosing()) {
          const n = opts.length;
          if (Input.hit('down')) { sel = (sel + 1) % n; Sfx.play('click'); }
          if (Input.hit('up')) { sel = (sel + n - 1) % n; Sfx.play('click'); }
          const L = layout();
          let overOption = false;
          opts.forEach((o, i) => {
            const y = optY(L, i), h = optLines[i].length * 10 + 1;
            if (Input.mouse.x >= L.x && Input.mouse.x < L.x + L.w && Input.mouse.y >= y && Input.mouse.y < y + h) { overOption = true; if (Input.mouse.moved) sel = i; }
          });
          if (Input.hit('confirm') || (Input.mouse.clickL && overOption)) { ui.consumeClick(); choose(); }
        } else if (go) {
          ui.consumeClick();
          if (typing()) shown = pageLen();
          else if (page < pages.length - 1) { page++; shown = 0; Sfx.play('click'); }
          else if (!opts) finish();
        }
      },
      draw(g) {
        const L = layout();
        panel(g, L.x, L.y, L.w, L.h);
        const tx = L.x + 12, ty = L.y + 11;
        let left = Math.floor(shown);
        pages[page].forEach((line, i) => {
          Font.draw(g, line.slice(0, Math.max(0, left)), tx, ty + i * 11, C.ink);
          left -= line.length;
        });
        if (sp) {
          const px = L.x + L.w - 58;
          g.fillStyle = C.woodD; g.fillRect(px - 1, L.y + 7, 50, 50);
          g.drawImage(Art.portrait(sp.id, sp.look), px, L.y + 8);
          nameLines.forEach((line, i) => {
            const w = Font.width(line), x = Math.max(L.x + L.w - 72, Math.min(px + 24 - Math.round(w / 2), L.x + L.w - 7 - w));
            Font.draw(g, line, x, L.y + 60 + i * 9, C.ink);
          });
        }
        if (choosing()) {
          opts.forEach((o, i) => {
            const y = optY(L, i);
            if (i === sel) { g.fillStyle = '#f7d774'; g.fillRect(tx - 3, y - 2, textW + 2, optLines[i].length * 10 + 2); }
            optLines[i].forEach((line, j) => Font.draw(g, line, tx + 6, y + j * 10, o.locked ? C.grey : C.ink));
          });
        } else if (!typing() && Math.floor(performance.now() / 350) % 2) {
          g.fillStyle = C.woodD; g.fillRect(L.x + L.w - 13, L.y + L.h - 13, 6, 2); g.fillRect(L.x + L.w - 12, L.y + L.h - 11, 4, 1); g.fillRect(L.x + L.w - 11, L.y + L.h - 10, 2, 1);
        }
      },
    };
  },

  // ---- Main menu --------------------------------------------------------
  TABS: ['Items', 'Gear', 'Codex', 'Map', 'Journal', 'People', 'Skills', 'Craft', 'Deeds', 'System'],

  menu(tab = 0) {
    const ui = this;
    const m = { tab, held: null, scroll: 0, sel: null, msg: '', idx: 0 };
    const close = () => {
      if (m.held) { S.inv[S.inv.indexOf(null)] = m.held; m.held = null; }
      ui.pop(); Sfx.play('click');
    };
    return {
      update() {
        if (Input.hit('menu') || Input.hit('cancel') || (Input.hit('map') && ui.TABS[m.tab] === 'Map')) return close();
        if (Input.hit('tabL')) { m.tab = (m.tab + ui.TABS.length - 1) % ui.TABS.length; m.scroll = 0; Sfx.play('click'); }
        if (Input.hit('tabR')) { m.tab = (m.tab + 1) % ui.TABS.length; m.scroll = 0; Sfx.play('click'); }
        if (ui.TABS[m.tab] === 'Codex') {
          const last = Object.keys(S.known).length - 1;
          let step = Input.mouse.wheel * 7;
          if (Input.hit('left')) step--; if (Input.hit('right')) step++;
          if (Input.hit('up')) step -= 7; if (Input.hit('down')) step += 7;
          if (step) { m.idx = clamp(m.idx + step, 0, Math.max(0, last)); Sfx.play('click'); }
          return;
        }
        if (Input.mouse.wheel) m.scroll = Math.max(0, m.scroll + Input.mouse.wheel);
        if (Input.hit('down')) m.scroll++;
        if (Input.hit('up')) m.scroll = Math.max(0, m.scroll - 1);
      },
      draw(g) {
        const W = Math.min(ui.W - 10, 440), H = Math.min(ui.H - 8, 250), x = Math.round((ui.W - W) / 2), y = Math.round((ui.H - H) / 2);
        g.fillStyle = '#14100c88'; g.fillRect(0, 0, ui.W, ui.H);
        panel(g, x, y + 14, W, H - 14);
        // Each tab as wide as its name, with the spare room shared out.
        const natural = ui.TABS.map(t => Font.width(t) + 6), spare = Math.max(0, (W - 20 - natural.reduce((p, q) => p + q, 0)) / ui.TABS.length);
        let tx = x + 10;
        ui.TABS.forEach((t, i) => {
          const tw = Math.floor(natural[i] + spare), on = i === m.tab;
          tx += i ? Math.floor(natural[i - 1] + spare) : 0;
          inset(g, tx, y + (on ? 3 : 6), tw - 2, on ? 18 : 14, on || ui.hit(tx, y + 3, tw - 2, 18));
          Font.center(g, t, tx + tw / 2 - 1, y + (on ? 8 : 9), C.ink);
          if (ui.click(tx, y + 3, tw - 2, 18)) { m.tab = i; m.scroll = 0; m.sel = null; Sfx.play('click'); }
        });
        const area = { x: x + 12, y: y + 28, w: W - 24, h: H - 40 };
        ui['tab' + ui.TABS[m.tab]](g, area, m);
        if (m.held) { g.drawImage(Art.icon(m.held.id), Input.mouse.x - 8, Input.mouse.y - 8); }
      },
    };
  },

  tabItems(g, a, m) {
    const cols = 10, cell = 22, gx = a.x + Math.round((a.w - cols * cell) / 2);
    let hover = null;
    for (let i = 0; i < S.inv.length; i++) {
      const x = gx + (i % cols) * cell, y = a.y + Math.floor(i / cols) * cell + (i >= 10 ? 6 : 0);
      drawSlot(g, x, y, S.inv[i], i === S.sel);
      if (this.hit(x, y, 20, 20)) hover = i;
      if (this.click(x, y, 20, 20)) { const t = S.inv[i]; S.inv[i] = m.held; m.held = t; Sfx.play('click'); }
    }
    const y = a.y + Math.ceil(S.inv.length / cols) * cell + 14;
    g.fillStyle = C.paperD; g.fillRect(a.x, y, a.w, 1);
    const slot = hover !== null ? S.inv[hover] : null;
    g.drawImage(Armor.frame(0, 0), a.x + 6, y + 8);
    Font.draw(g, 'Tam Ashgrove', a.x + 30, y + 9, C.ink);
    Font.draw(g, `Gold: ${S.gold}`, a.x + 30, y + 20, C.soft);
    Font.draw(g, `Energy: ${Math.max(0, Math.floor(S.energy))}/${S.maxEnergy}`, a.x + 30, y + 31, C.soft);
    if (slot) {
      const it = ITEMS[slot.id], tx = a.x + 118, tw = a.w - 118;
      Font.draw(g, (slot.q ? qualityNames[slot.q] + ' ' : '') + Inv.nameOf(slot.id) + (slot.s ? ' (stolen)' : ''), tx, y + 9, slot.s ? C.bad : C.ink);
      // As much of the description as fits, then the price, always inside the frame.
      const bottom = a.y + a.h - 12, lines = Font.wrap(it.desc, tw), room = Math.max(1, Math.floor((bottom - 10 - (y + 19)) / 9));
      const shown = lines.slice(0, room);
      if (lines.length > room) shown[room - 1] = shown[room - 1].replace(/s*S*$/, '...');
      shown.forEach((l, i) => Font.draw(g, l, tx, y + 19 + i * 9, C.soft));
      const py = Math.min(y + 19 + shown.length * 9 + 2, bottom), price = it.price ? `Sells for ${Inv.price(slot)}g` : '';
      if (price) Font.draw(g, price, tx, py, C.good);
      if (it.food) Font.draw(g, `+${it.food} energy`, tx + (price ? Font.width(price) + 12 : 0), py, C.blue);
    } else {
      Font.draw(g, 'Click to move items. The top row is your hotbar.', a.x + 118, y + 9, C.soft);
    }
  },

  tabCodex(g, a, m) {
    const KINDS = { crop: 'Crop', seed: 'Seed', forage: 'Wild forage', animal: 'Animal good', fish: 'Fish', material: 'Material', food: 'Food', place: 'Farm item', tool: 'Tool', weapon: 'Weapon', ammo: 'Ammunition', quest: 'Keepsake', relic: 'Relic', upgrade: 'Upgrade', gear: 'Gear', gadget: 'Gadget', potion: 'Potion', token: 'Elemental token', gift: 'Gift' };
    const order = Object.keys(KINDS), itemOrder = Object.keys(ITEMS);
    const ids = Object.keys(S.known).filter(id => ITEMS[id]).sort((p, q) => order.indexOf(ITEMS[p].kind) - order.indexOf(ITEMS[q].kind) || itemOrder.indexOf(p) - itemOrder.indexOf(q));
    if (!ids.length) { Font.draw(g, 'You have not learned about anything yet.', a.x, a.y, C.soft); return; }
    const cols = 7, cell = 22, vis = Math.floor(a.h / cell);
    m.idx = clamp(m.idx, 0, ids.length - 1);
    const row = Math.floor(m.idx / cols);
    m.top = clamp(m.top || 0, Math.max(0, row - vis + 1), row);
    ids.slice(m.top * cols, (m.top + vis) * cols).forEach((id, i) => {
      const n = i + m.top * cols, x = a.x + (i % cols) * cell, y = a.y + Math.floor(i / cols) * cell;
      drawSlot(g, x, y, { id, n: 1, q: 0 }, n === m.idx);
      if (this.hit(x, y, 20, 20) && Input.mouse.moved) m.idx = n;
      if (this.click(x, y, 20, 20)) { m.idx = n; Sfx.play('click'); }
    });
    const id = ids[m.idx], it = ITEMS[id], k = S.known[id], x = a.x + cols * cell + 8, w = a.w - cols * cell - 8;
    let y = a.y;
    inset(g, x, y, 56, 56, false);
    g.drawImage(Art.icon(id), x + 4, y + 4, 48, 48);
    const tx = x + 62, tw = w - 62;
    Font.wrap(Inv.nameOf(id), tw).forEach((l, i) => Font.draw(g, l, tx, y + 2 + i * 10, C.ink));
    Font.draw(g, KINDS[it.kind] + (Codex.isSecret(id) ? ' (secret)' : ''), tx, y + 24, Codex.isSecret(id) ? C.bad : C.soft);
    Font.draw(g, `${Object.keys(S.known).length} things known`, tx, y + 44, C.grey);
    y += 62;
    const para = (text, color) => Font.wrap(text, w).forEach(l => { if (y < a.y + a.h - 8) Font.draw(g, l, x, y, color); y += 10; });
    para(it.desc, C.ink); y += 3;
    if (it.lore) { para(it.lore, C.soft); y += 3; }
    const c = CROPS[id];
    if (c) para(`Grows in ${c.seasons.map(s => SEASONS[s]).join(', ')}, in ${c.days} days${c.regrow ? ', and keeps producing' : ''}.`, C.soft);
    if (it.w) para(it.w.ranged ? `Ranged. Damage ${it.w.dmg}.` : `Damage ${it.w.dmg}. Reach ${it.w.reach}.`, C.soft);
    if (it.food) para(`Restores ${it.food} energy.`, C.blue);
    if (it.heal) para(`Restores ${it.heal} health.`, C.blue);
    if (k.held && it.price) para(`Sells for ${it.price}g.`, C.good);
    const by = k.by && NPCS[k.by] ? NPCS[k.by].name : null;
    para({ heard: `${by} mentioned it on ${dateName(k.d)}.`, read: `You read about it on ${dateName(k.d)}.`, seen: `Seen for sale from ${by} on ${dateName(k.d)}.`, found: `You found it yourself on ${dateName(k.d)}.` }[k.how], C.grey);
  },

  tabJournal(g, a, m) {
    const act = Quests.list('active'), done = Quests.list('done'), lost = Quests.list('lost');
    const rows = [...act.map(id => [id, 'a']), ...done.map(id => [id, 'd']), ...lost.map(id => [id, 'l'])];
    if (!rows.length) { Font.draw(g, 'No quests yet.', a.x, a.y, C.soft); return; }
    if (!m.sel || !S.quests[m.sel]) m.sel = rows[0][0];
    const listW = 150, rowH = 13, vis = Math.floor(a.h / rowH), sc = Math.min(m.scroll, Math.max(0, rows.length - vis));
    rows.slice(sc, sc + vis).forEach(([id, st], i) => {
      const y = a.y + i * rowH;
      if (id === m.sel) { g.fillStyle = '#f7d774'; g.fillRect(a.x, y - 2, listW, rowH); }
      else if (this.hit(a.x, y - 2, listW, rowH)) { g.fillStyle = '#ecd59f'; g.fillRect(a.x, y - 2, listW, rowH); }
      if (this.click(a.x, y - 2, listW, rowH)) { m.sel = id; Sfx.play('click'); }
      Font.draw(g, (QUESTS[id].main ? '* ' : '') + QUESTS[id].title, a.x + 3, y, st === 'a' ? C.ink : st === 'd' ? C.grey : C.bad);
    });
    g.fillStyle = C.paperD; g.fillRect(a.x + listW + 5, a.y - 2, 1, a.h);
    const q = QUESTS[m.sel], inst = S.quests[m.sel], x = a.x + listW + 12, w = a.w - listW - 12;
    let y = a.y;
    Font.draw(g, q.title, x, y, C.ink); y += 11;
    if (q.giver && NPCS[q.giver]) { Font.draw(g, 'From ' + NPCS[q.giver].name, x, y, C.soft); y += 13; } else y += 3;
    if (inst.state === 'lost') {
      Font.wrap('This path is closed. ' + (inst.why || ''), w).forEach(l => { Font.draw(g, l, x, y, C.bad); y += 10; });
      return;
    }
    if (inst.state === 'done') { Font.draw(g, 'Completed.', x, y, C.good); return; }
    const stage = Quests.stageOf(m.sel);
    Font.wrap(stage.desc, w).forEach(l => { Font.draw(g, l, x, y, C.ink); y += 10; });
    y += 5;
    stage.goals.forEach((gl, i) => {
      const ok = Quests.goalVal(m.sel, gl, i) >= Quests.goalTarget(gl);
      Font.draw(g, (ok ? '[x] ' : '[ ] ') + this.goalText(m.sel, gl, i), x, y, ok ? C.good : C.ink); y += 11;
    });
    if (stage.turnin) { Font.draw(g, 'Then speak to ' + NPCS[stage.turnin].name + '.', x, y + 3, C.soft); y += 14; }
    if (!m.stuck || m.stuck !== m.sel) {
      if (this.button(g, 'Stuck?', x, a.y + a.h - 16, 60, 14)) { m.stuck = m.sel; Sfx.play('click'); }
    } else {
      const help = Quests.help(m.sel);
      y = Math.max(y, a.y + a.h - 18 - help.lines.length * 10 - (help.skip ? 18 : 0));
      help.lines.forEach(l => Font.wrap(l, w).forEach(t => { Font.draw(g, t, x, y, C.blue); y += 10; }));
      if (!help.lines.length) Font.draw(g, 'Follow the steps above. The tracker shows what is left.', x, y, C.blue);
      if (help.skip && this.button(g, 'Continue without them', x, a.y + a.h - 16, 130, 14)) { const id = m.sel; this.stack.pop(); Quests.skipTurnin(id); }
    }
  },

  tabPeople(g, a, m) {
    const ids = Object.keys(NPCS).filter(id => !NPCS[id].minor && (!NPCS[id].remote || S.npc[id].talked >= 0)), rowH = 26, vis = Math.floor(a.h / rowH), sc = Math.min(m.scroll, Math.max(0, ids.length - vis));
    ids.slice(sc, sc + vis).forEach((id, i) => {
      const y = a.y + i * rowH, d = NPCS[id], st = S.npc[id];
      inset(g, a.x, y, 22, 22, false);
      g.drawImage(Art.charFrame(id, d.look, 0, 0), 1, 0, 16, 16, a.x + 3, y + 3, 16, 16);
      Font.draw(g, d.name, a.x + 28, y + 2, C.ink);
      Font.draw(g, d.role, a.x + 28, y + 12, C.soft);
      heartsRow(g, a.x + 170, y + 4, hearts(id));
      Font.draw(g, st.gifted === absDay() ? 'Gifted today' : st.talked === absDay() ? 'Spoke today' : '', a.x + 170, y + 12, C.soft);
    });
  },

  tabSkills(g, a) {
    Object.keys(SKILLS).forEach((k, i) => {
      const y = a.y + i * 18, s = S.skills[k], nxt = XP_PER_LEVEL[Math.min(10, s.lvl + 1)], prev = XP_PER_LEVEL[s.lvl];
      Font.draw(g, SKILLS[k], a.x, y + 2, C.ink);
      for (let l = 0; l < 10; l++) { g.fillStyle = l < s.lvl ? C.good : '#c9b08a'; g.fillRect(a.x + 68 + l * 11, y + 2, 9, 7); }
      Font.draw(g, s.lvl >= 10 ? 'MAX' : `${s.xp - prev}/${nxt - prev}`, a.x + 186, y + 2, C.soft);
    });
    const y = a.y + 128;
    g.fillStyle = C.paperD; g.fillRect(a.x, y - 4, a.w, 1);
    const std = (v) => v >= 4 ? 'Respected' : v >= 1 ? 'Well regarded' : v > -2 ? 'Unremarkable' : v > -5 ? 'Whispered about' : 'Despised';
    Font.draw(g, 'Standing in Mossbrook: ' + std(S.rep.town), a.x, y, C.ink);
    Font.draw(g, 'Standing with the Crown: ' + std(S.rep.crown), a.x, y + 12, C.ink);
    Font.draw(g, 'Standing with outlaws: ' + std(S.rep.shadow || 0), a.x, y + 24, C.ink);
    Font.draw(g, `Notoriety: ${Crime.standing()}${S.wanted ? '   WANTED' : ''}${S.bounty ? `   Bounty ${S.bounty}g` : ''}`, a.x, y + 36, S.wanted || S.bounty ? C.bad : C.ink);
    Font.draw(g, `Deeds on record: ${S.memory.log.length}`, a.x, y + 48, C.soft);
  },

  tabCraft(g, a, m) {
    // Packs are one-time upgrades, so only the next one is listed.
    RECIPES.filter(r => !r.pack || r.pack === S.inv.length + 10).forEach((r, i) => {
      const y = a.y + i * 26, it = ITEMS[r.out], known = S.skills.farming.lvl >= r.lvl, can = known && Inv.has(r.needs);
      drawSlot(g, a.x, y, { id: r.out, n: r.n, q: 0 }, false);
      Font.draw(g, known ? it.name : '???', a.x + 26, y + 2, known ? C.ink : C.grey);
      const needs = Object.entries(r.needs).map(([k, v]) => `${v} ${ITEMS[k].name} (${Inv.count(k)})`).join(', ');
      Font.draw(g, known ? needs : `Requires Farming level ${r.lvl}`, a.x + 26, y + 12, C.soft);
      if (this.button(g, 'Make', a.x + a.w - 44, y + 3, 42, 14, !can)) this.craft(r);
    });
  },

  craft(r) {
    const it = ITEMS[r.out];
    Inv.takeAll(r.needs); Sfx.play('plant');
    if (r.pack) {
      while (S.inv.length < r.pack) S.inv.push(null);
      Codex.learn(r.out, 'found'); Sfx.play('level');
      toast(`${it.name} made. Your pack now holds ${r.pack} items.`, r.out);
    } else Inv.add(r.out, r.n);
    Memory.deed('made_' + r.out, `Made ${it.name} for the first time.`);
  },

  // A scrolling grid of the player's pack. Returns the hovered slot index, or null.
  // A small card by the mouse: the item, and what selling it here would get you.
  priceTip(g, s, q) {
    const it = ITEMS[s.id], stars = s.q ? ` (${qualityNames[s.q]})` : '', stolen = s.s ? ' (stolen)' : '';
    const lines = [[`${it.name}${stars}${stolen}${s.n > 1 ? ' x' + s.n : ''}`, C.ink]];
    if (q && q.each > 0) {
      lines.push([`Sells for ${q.each}g`, '#3a7a2a']);
      if (s.n > 1) lines.push([`All ${s.n}: ${q.each * s.n}g (Shift-click)`, C.soft]);
    } else lines.push([(q && q.why) || 'Worth nothing here.', C.bad]);
    const w = Math.max(...lines.map(([t]) => Font.width(t))) + 10, h = lines.length * 10 + 6;
    const bx = clamp(Input.mouse.x - w - 8, 4, this.W - w - 4), by = clamp(Input.mouse.y - h / 2, 4, this.H - h - 4);
    g.fillStyle = C.woodD; g.fillRect(bx - 1, by - 1, w + 2, h + 2);
    g.fillStyle = C.paper; g.fillRect(bx, by, w, h);
    lines.forEach(([t, col], i) => Font.draw(g, t, bx + 5, by + 4 + i * 10, col));
  },

  packGrid(g, x, y, cols, visRows, top, onClick) {
    let over = null;
    for (let i = 0; i < visRows * cols; i++) {
      const n = i + top * cols;
      if (n >= S.inv.length) break;
      const cx = x + (i % cols) * 23, cy = y + Math.floor(i / cols) * 23;
      drawSlot(g, cx, cy, S.inv[n], false);
      if (this.hit(cx, cy, 20, 20)) over = n;
      if (this.click(cx, cy, 20, 20)) onClick(n);
    }
    const rows = Math.ceil(S.inv.length / cols);
    if (rows > visRows) this.scrollBar(g, x + cols * 23 - 2, y, visRows * 23 - 3, top, rows, visRows);
    return over;
  },

  scrollBar(g, x, y, h, top, total, vis) {
    g.fillStyle = C.paperD; g.fillRect(x, y, 3, h);
    g.fillStyle = C.wood; g.fillRect(x, y + Math.round(h * top / total), 3, Math.max(6, Math.round(h * vis / total)));
  },

  tabDeeds(g, a, m) {
    Font.draw(g, 'Everything you do is remembered.', a.x, a.y, C.soft);
    const rows = [];
    [...S.memory.log].reverse().forEach(e => Font.wrap(`${dateName(e.d)}: ${e.text}`, a.w).forEach((l, i) => rows.push([l, i === 0])));
    const vis = Math.floor((a.h - 14) / 11), sc = Math.min(m.scroll, Math.max(0, rows.length - vis));
    rows.slice(sc, sc + vis).forEach(([l, first], i) => Font.draw(g, l, a.x, a.y + 14 + i * 11, first ? C.ink : C.soft));
  },

  tabSystem(g, a, m) {
    if (this.button(g, 'Save Game', a.x, a.y, 110, 16)) { m.msg = Game.save() ? 'Game saved.' : 'Could not save in this browser.'; Sfx.play('save'); }
    if (this.button(g, Sfx.muted ? 'Unmute (P)' : 'Mute (P)', a.x, a.y + 20, 110, 16)) Sfx.toggleMute();
    if (this.button(g, 'Save & Quit', a.x, a.y + 40, 110, 16)) { Game.save(); this.stack.length = 0; Game.toTitle(); return; }
    Font.draw(g, m.msg, a.x, a.y + 62, C.good);
    // Music and sound levels, remembered by this browser. Each click steps down a notch.
    const LEVELS = [1, 0.7, 0.4, 0], next = v => LEVELS[(LEVELS.findIndex(l => Math.abs(l - v) < 0.05) + 1) % LEVELS.length];
    const pct = v => (v ? Math.round(v * 100) + '%' : 'Off');
    if (this.button(g, `Music: ${pct(Sfx.vol.music)}`, a.x, a.y + 76, 110, 16)) Sfx.setVol('music', next(Sfx.vol.music));
    if (this.button(g, `Sounds: ${pct(Sfx.vol.sfx)}`, a.x, a.y + 96, 110, 16)) { Sfx.setVol('sfx', next(Sfx.vol.sfx)); Sfx.play('pickup'); }
    const help = [
      'WASD / Arrows: walk', 'C / Left click: use held tool or item', 'E / Space / Right click: talk, harvest, open',
      'F: dodge roll    Z: sneak on or off    H: ride your horse',
      'Sneaking: E on shelves, crops or people to steal',
      'I / Tab: this menu    M: map    Q / R: switch tabs', '1-0 / Mouse wheel: choose hotbar item', 'The game saves when you go to bed.',
    ];
    help.forEach((l, i) => Font.draw(g, l, a.x + 124, a.y + i * 11, C.soft));
  },

  // ---- Shop -------------------------------------------------------------
  stock(kind) {
    if (kind === 'store') {
      const seeds = Object.keys(CROPS).filter(id => CROPS[id].seasons.includes(S.season)).map(id => ({ id: id + '_seed', price: ITEMS[id + '_seed'].buy }));
      return [...seeds, { id: 'feed', price: 10 }, { special: 'chicken', price: 400, name: 'Hen', desc: 'Lives in your coop.' }];
    }
    if (kind === 'inn') return [{ id: 'trailmix', price: 80 }, { id: 'omelette', price: 220 }, { id: 'stew', price: 320 }];
    if (kind === 'forge') return [{ id: 'copper', price: 90 }, { id: 'coal', price: 40 }, { id: 'arrow', price: 6 }];
    if (kind === 'shrine') return [{ id: 'salve', price: 120 }, { id: 'token_moon', price: 1500 }];
    if (kind === 'pirate') return [{ id: 'pearl', price: 600 }, { id: 'smoke_vial', price: 120 }, { id: 'snapper', price: 500 }, { id: 'cutlass', price: 1500, once: true }];
    if (kind === 'fence') return [{ id: 'lockpick', price: 150 }, { id: 'softboots', price: 900, once: true }, { id: 'arrow', price: 4 }];
    if (kind === 'wick') return [{ id: 'hunting_bow', price: 700, once: true }, { id: 'arrow', price: 5 }, { id: 'salve', price: 150 }, { id: 'trailmix', price: 100 }];
    return [];
  },

  shop(kind, npcId) {
    if (Crime.refuses(npcId)) return this.dialog(npcId, 'I know what people are saying about you. I will not trade with a thief. Not until they stop saying it.', null);
    const ui = this, barter = kind === 'barter';
    const week = Math.floor((absDay() - 1) / 7);
    const offers = barter ? [0, 1, 2, 3].map(i => BARTER[(week * 3 + i * 2) % BARTER.length]) : ui.stock(kind);
    const factor = priceFactor(npcId);
    offers.forEach(o => { if (barter) { Codex.learn(o.get, 'seen', npcId); Object.keys(o.give).forEach(k => Codex.learn(k, 'seen', npcId)); } else if (o.id) Codex.learn(o.id, 'seen', npcId); });
    let sel = 0, note = '', packTop = 0;
    const priceOf = o => Math.ceil(o.price * factor);
    const close = () => { ui.pop(); Sfx.play('click'); };
    const buy = (o, n) => {
      if (barter) {
        if (!Inv.has(o.give)) { Sfx.play('bad'); note = 'You do not have what they want.'; return; }
        if (Inv.add(o.get, o.n, 0, true) > 0) { Sfx.play('bad'); note = 'Your pack is full.'; return; }
        Inv.takeAll(o.give); Sfx.play('buy'); note = `Traded for ${o.n} ${ITEMS[o.get].name}.`;
        Memory.deed('bartered', 'Struck a barter with the wandering trader.');
        return;
      }
      const cost = priceOf(o) * n;
      if (S.gold < cost) { Sfx.play('bad'); note = 'Not enough gold.'; return; }
      if (o.special === 'chicken') {
        if (!Farm.buyChicken()) { Sfx.play('bad'); note = 'Your coop is full.'; return; }
        S.gold -= cost; Sfx.play('buy'); note = 'A hen is on her way to your coop.';
        Memory.deed('first_hen', 'Bought a hen for the coop.');
        return;
      }
      if (o.once && Inv.count(o.id)) { Sfx.play('bad'); note = 'You already own one.'; return; }
      if (Inv.add(o.id, n, 0, true) > 0) { Sfx.play('bad'); note = 'Your pack is full.'; return; }
      S.gold -= cost; Sfx.play('buy'); note = `Bought ${n} ${ITEMS[o.id].name}.`;
    };
    // What this shop would pay for one of a stack, or why it will not buy it.
    const quote = s => {
      if (!s) return null;
      if (Inv.keep(s.id)) return { why: 'Not for sale. You keep this.' };
      if (s.s && kind !== 'fence') return { why: 'Stolen. Only a fence will buy it.' };
      if (!ITEMS[s.id].price) return { why: 'Worth nothing to a shop.' };
      return { each: Math.max(1, Math.floor(Inv.price(s) * (kind === 'fence' ? (s.s ? 0.6 : 0.5) : 0.75))) };
    };
    const sellAt = i => {
      const s = S.inv[i];
      if (!s || Inv.keep(s.id)) { Sfx.play('bad'); return; }
      if (s.s && kind !== 'fence') { Sfx.play('bad'); note = 'They know where that came from. Only a fence will buy it.'; return; }
      if (!ITEMS[s.id].price) return;
      const n = Input.held.has('ShiftLeft') ? s.n : 1, value = quote(s).each * n;
      S.gold += value; s.n -= n; if (s.n <= 0) S.inv[i] = null;
      Sfx.play('sell'); note = `Sold for ${value}g.`;
    };

    return {
      update() {
        if (Input.hit('menu') || Input.hit('cancel')) return close();
        const n = offers.length;
        if (Input.hit('down')) { sel = (sel + 1) % n; Sfx.play('click'); }
        if (Input.hit('up')) { sel = (sel + n - 1) % n; Sfx.play('click'); }
        if (Input.hit('confirm')) buy(offers[sel], Input.held.has('ShiftLeft') ? 5 : 1);
        if (Input.mouse.wheel) packTop += Input.mouse.wheel;
      },
      draw(g) {
        const W = Math.min(ui.W - 10, 430), H = Math.min(ui.H - 10, 230), x = Math.round((ui.W - W) / 2), y = Math.round((ui.H - H) / 2);
        g.fillStyle = '#14100c88'; g.fillRect(0, 0, ui.W, ui.H);
        panel(g, x, y, W, H);
        Font.draw(g, barter ? 'Barter with Pell' : kind === 'fence' ? 'Rusk (fence: 60% for stolen goods)' : NPCS[npcId].name, x + 12, y + 10, C.ink);
        Font.draw(g, `Gold: ${S.gold}`, x + W - 12 - Font.width(`Gold: ${S.gold}`), y + 10, C.ink);
        const listW = W - 142, rowH = 24, ly = y + 24;
        offers.forEach((o, i) => {
          const ry = ly + i * rowH, over = ui.hit(x + 10, ry, listW, rowH - 2);
          if (over && Input.mouse.moved) sel = i;
          inset(g, x + 10, ry, listW, rowH - 2, i === sel);
          if (barter) {
            g.drawImage(Art.icon(o.get), x + 13, ry + 3);
            const lbl = `${o.n} ${ITEMS[o.get].name} for ` + Object.entries(o.give).map(([k, v]) => `${v} ${ITEMS[k].name}`).join(' + ');
            Font.wrap(lbl, listW - 28).forEach((l, j) => Font.draw(g, l, x + 32, ry + 3 + j * 9, Inv.has(o.give) ? C.ink : C.grey));
          } else {
            if (o.special) g.drawImage(Art.chicken(0, 0), x + 14, ry + 4); else g.drawImage(Art.icon(o.id), x + 13, ry + 3);
            Font.draw(g, o.special ? o.name : ITEMS[o.id].name, x + 32, ry + 3, C.ink);
            Font.draw(g, Font.wrap(o.special ? o.desc : ITEMS[o.id].desc.split('. ')[0] + '.', listW - 30)[0], x + 32, ry + 12, C.soft);
            const p = `${priceOf(o)}g`;
            Font.draw(g, p, x + 10 + listW - 6 - Font.width(p), ry + 3, S.gold >= priceOf(o) ? C.ink : C.bad);
          }
          if (ui.click(x + 10, ry, listW, rowH - 2)) buy(o, Input.held.has('ShiftLeft') ? 5 : 1);
        });
        // The pack, for selling.
        const gx = x + W - 126;
        Font.draw(g, barter ? 'Your pack' : 'Click to sell (Shift: all)', gx, y + 24, C.soft);
        const packVis = Math.floor((H - 49) / 23);
        packTop = clamp(packTop, 0, Math.max(0, Math.ceil(S.inv.length / 5) - packVis));
        const over = ui.packGrid(g, gx, y + 35, 5, packVis, packTop, i => { if (!barter) sellAt(i); });
        Font.draw(g, note, x + 12, y + H - 18, C.soft);
        // Hover over something in your pack to see what it would sell for.
        if (!barter && over !== null && S.inv[over]) ui.priceTip(g, S.inv[over], quote(S.inv[over]));
      },
    };
  },

  // ---- Fishing ----------------------------------------------------------
  fishing(spot) {
    const ui = this, lvl = S.skills.fishing.lvl;
    let phase = 'wait', t = 1.2 + Math.random() * 3.2, fishY = 0.5, fishV = 0, zoneY = 0.5, zoneV = 0, prog = 0.3, retarget = 0, goal = 0.5, flawless = true;
    const waters = Player.map.sea ? 'sea' : 'river';
    const pool = Object.values(ITEMS).filter(i => i.kind === 'fish' && i.seasons.includes(S.season) && ((i.where || 'river') === waters || (i.where === 'isle' && Player.map.isle) || (i.where === 'deep' && Player.map.deep)));
    const weights = pool.map(i => i.tier === 1 ? 6 : i.tier === 2 ? 2 + lvl / 2 : 0.5 + lvl / 2);
    let total = weights.reduce((a, b) => a + b, 0), r = Math.random() * total, fish = pool[0];
    for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) { fish = pool[i]; break; } }
    const zoneH = 0.3 + lvl * 0.02, jump = fish.tier === 1 ? 0.25 : fish.tier === 2 ? 0.45 : 0.75, retime = fish.tier === 1 ? 1.2 : fish.tier === 2 ? 0.85 : 0.55;
    const end = () => ui.pop();
    const fishPos = { x: spot.x * TILE + 8, y: spot.y * TILE + 8 };
    const line = () => (Input.isDown('use') || Input.isDown('act') || Input.mouse.left);
    return {
      update(dt) {
        if (Input.hit('cancel')) { end(); return; }
        if (phase === 'wait') {
          t -= dt;
          if (t <= 0) { phase = 'bite'; t = 0.95; Sfx.play('bite'); }
          if (Input.hit('use') || Input.hit('act') || Input.mouse.clickL) { ui.consumeClick(); end(); toast('You reel in early.'); }
        } else if (phase === 'bite') {
          t -= dt;
          if (Input.hit('use') || Input.hit('act') || Input.mouse.clickL) { ui.consumeClick(); phase = 'reel'; Sfx.play('click'); }
          else if (t <= 0) { end(); toast('It got away.'); Sfx.play('fish_lost'); }
        } else if (phase === 'reel') {
          retarget -= dt;
          if (retarget <= 0) { retarget = retime * (0.6 + Math.random() * 0.8); goal = clamp(fishY + (Math.random() - 0.5) * jump * 2, 0.04, 0.96); }
          fishV += (goal - fishY) * 24 * dt; fishV *= Math.pow(0.04, dt); fishY = clamp(fishY + fishV * dt * 3, 0, 1);
          zoneV += (line() ? -3.4 : 2.6) * dt; zoneV *= Math.pow(0.15, dt);
          zoneY += zoneV * dt * 2;
          if (zoneY < zoneH / 2) { zoneY = zoneH / 2; zoneV = 0; }
          if (zoneY > 1 - zoneH / 2) { zoneY = 1 - zoneH / 2; zoneV = 0; }
          const inZone = Math.abs(fishY - zoneY) < zoneH / 2;
          prog += (inZone ? 0.3 : -0.2) * dt;
          if (!inZone) flawless = false;
          if (prog >= 1) {
            end();
            const q = flawless ? 2 : (Math.random() < 0.2 + lvl * 0.05 ? 1 : 0);
            Inv.add(fish.id, 1, q);
            Sfx.play('catch'); gainXP('fishing', 12 * fish.tier);
            Quests.event('catch', fish.id);
            Memory.deed('first_fish', `Caught your first fish, a ${fish.name}.`);
          } else if (prog <= 0) { end(); toast('The line went slack.'); Sfx.play('fish_lost'); }
        }
      },
      draw(g) {
        const sx = fishPos.x - Render.cam.x, sy = fishPos.y - Render.cam.y;
        g.fillStyle = '#fff'; g.fillRect(sx - 1, sy - 1, 3, 3); g.fillStyle = '#c43030'; g.fillRect(sx - 1, sy - 1, 3, 1);
        if (phase === 'bite') { Font.draw(g, '!', sx - 4, sy - 28, '#2a1a10', 3); Font.draw(g, '!', sx - 5, sy - 29, '#ffd84a', 3); }
        if (phase === 'wait') Font.shadow(g, 'Waiting for a bite...', Math.round(ui.W / 2 - 50), ui.H - 56, '#fff4d0');
        if (phase === 'reel') {
          const bx = ui.W - 86, by = 62, bh = 140;
          panel(g, bx - 8, by - 8, 58, bh + 16);
          g.fillStyle = '#3d6f9c'; g.fillRect(bx, by, 18, bh);
          g.fillStyle = '#7ad07a'; g.fillRect(bx + 1, by + (zoneY - zoneH / 2) * bh, 16, zoneH * bh);
          g.drawImage(Art.icon(fish.id), bx + 1, by + fishY * (bh - 16));
          g.fillStyle = '#6a4a2a'; g.fillRect(bx + 26, by, 10, bh);
          g.fillStyle = prog > 0.5 ? '#5cb85c' : '#e8b53c'; g.fillRect(bx + 27, by + bh - prog * bh, 8, prog * bh);
          Font.shadow(g, 'Hold use to rise', Math.round(ui.W / 2 - 40), ui.H - 56, '#fff4d0');
        }
      },
    };
  },

  // ---- Overnight, title, intro ------------------------------------------
  summary(lines, cb, footer = 'Press E or click to wake') {
    const ui = this;
    return {
      noHud: true,
      update() { if (Input.hit('confirm') || Input.mouse.clickL) { ui.consumeClick(); ui.pop(); Sfx.play('click'); if (cb) cb(); } },
      draw(g) {
        g.fillStyle = '#14100c'; g.fillRect(0, 0, ui.W, ui.H);
        const W = Math.min(ui.W - 40, 320), H = Math.min(ui.H - 30, 40 + lines.length * 12 + 26), x = (ui.W - W) / 2, y = (ui.H - H) / 2;
        panel(g, x, y, W, H);
        lines.forEach((l, i) => {
          Font.draw(g, l.t, x + 14, y + 14 + i * 12, l.c || C.ink);
          if (l.r) Font.draw(g, l.r, x + W - 14 - Font.width(l.r), y + 14 + i * 12, l.c || C.ink);
        });
        Font.center(g, footer, x + W / 2, y + H - 18, C.soft);
      },
    };
  },

  slides(texts, cb) {
    const ui = this;
    let i = 0, shown = 0;
    return {
      noHud: true,
      update(dt) {
        shown += dt * 55;
        if (Input.hit('confirm') || Input.mouse.clickL) {
          ui.consumeClick();
          if (shown < texts[i].length) { shown = texts[i].length; return; }
          i++; shown = 0;
          if (i >= texts.length) { ui.pop(); cb(); }
        }
      },
      draw(g) {
        if (i >= texts.length) return;
        g.fillStyle = '#14100c'; g.fillRect(0, 0, ui.W, ui.H);
        const lines = Font.wrap(texts[i], Math.min(ui.W - 60, 340));
        let left = Math.floor(shown), y = Math.round(ui.H / 2 - lines.length * 7);
        lines.forEach(l => { Font.center(g, l.slice(0, Math.max(0, left)), ui.W / 2, y, '#e8d8b0'); left -= l.length; y += 14; });
        if (shown >= texts[i].length && Math.floor(performance.now() / 500) % 2) Font.center(g, 'Press E or click', ui.W / 2, ui.H - 26, '#8a7a5a');
      },
    };
  },

  title() {
    const ui = this;
    let sel = 0, msg = '';
    const items = () => (Game.hasSave() ? ['Continue', 'New Game'] : ['New Game']);
    const go = () => {
      const name = items()[sel];
      Sfx.play('click');
      if (name === 'Continue') {
        if (!Game.load()) { msg = 'That save could not be read.'; return; }
        ui.pop();
      } else { ui.pop(); Game.newGame(); }
    };
    return {
      noHud: true, isTitle: true,
      update() {
        const n = items().length;
        if (Input.hit('down')) { sel = (sel + 1) % n; Sfx.play('click'); }
        if (Input.hit('up')) { sel = (sel + n - 1) % n; Sfx.play('click'); }
        if (Input.hit('confirm')) go();
      },
      draw(g) {
        g.fillStyle = '#14100c55'; g.fillRect(0, 0, ui.W, ui.H);
        const title = 'Mossbrook Valley', cx = ui.W / 2, ty = Math.round(ui.H * 0.2);
        Font.draw(g, title, cx - Font.width(title) * 3 / 2 + 2, ty + 2, '#2a1a10', 3);
        Font.draw(g, title, cx - Font.width(title) * 3 / 2, ty, '#ffe08a', 3);
        const sub = 'Everything you do is remembered.';
        Font.shadow(g, sub, Math.round(cx - Font.width(sub) / 2), ty + 32, '#fff4d0');
        items().forEach((label, i) => {
          const bw = 120, bh = 20, bx = Math.round(cx - bw / 2), by = Math.round(ui.H * 0.55) + i * 26;
          panel(g, bx - 3, by - 3, bw + 6, bh + 6);
          if (ui.hit(bx, by, bw, bh) && Input.mouse.moved) sel = i;
          if (i === sel) { g.fillStyle = '#f7d774'; g.fillRect(bx + 2, by + 2, bw - 4, bh - 4); }
          Font.center(g, label, cx, by + 6, C.ink);
          if (ui.click(bx, by, bw, bh)) { sel = i; go(); }
        });
        if (msg) Font.shadow(g, msg, Math.round(cx - Font.width(msg) / 2), ui.H - 40, '#ffb0a0');
      },
    };
  },
};
