'use strict';
// The player's map. Home ground is always charted; everywhere else fills in as you
// explore, so hidden places stay hidden until you have actually been near them.

const MAP_LABELS = { guard: 'Guardhouse', gaol: 'Ironback Gaol', coop: 'Coop', shed: 'Old Shed', minehead: 'Deep Mine', hut: 'Wick\'s Hut', stable: 'Whitlock Stables', palace: 'The Palace', crypt: 'Garden Door', bin: 'Shipping Bin' };
const GROUND_COLOR = { [T.G]: '#6aa845', [T.D]: '#c29560', [T.C]: '#9a9486', [T.W]: '#4a90cc', [T.S]: '#e5cf94', [T.F]: '#b7814d', [T.V]: '#4a4550', [T.R]: '#a33b3b', [T.B]: '#a87a4a', [T.ST]: '#8f8a84', [T.CAVE]: '#6a5c50', [T.ROCK]: '#3a332c', [T.MTN]: '#8f8270' };
// Goals tied to a flag, for quests where the place is not a secret.
const GOAL_SPOTS = { read_letter: ['house', 3, 3], road_cleared: ['village', 32, 57], found_page: ['farm', 8, 39], found_bundle: ['village', 40, 37] };
const REGION_ORDER = ['farm', 'village', 'greywood', 'ironback', 'saltmere', 'smugglers', 'keep', 'capital', 'undercroft', 'lower', 'blackwing', 'gullsteeth', 'redgull', 'hold', 'mine'];
const CHUNK = 2;

const MapView = {
  stamp: 0, cache: {}, mineGrid: null, mineVersion: -1,

  fogged(m) { return !!(m.region || m.transient); },

  grid(m) {
    const size = Math.ceil(m.w / CHUNK) * Math.ceil(m.h / CHUNK);
    if (m.transient) {
      if (this.mineVersion !== m.version) { this.mineVersion = m.version; this.mineGrid = new Array(size).fill(0); }
      return this.mineGrid;
    }
    if (!S.seen[m.id]) S.seen[m.id] = new Array(size).fill(0);
    return S.seen[m.id];
  },
  idx(m, x, y) { return Math.floor(y / CHUNK) * Math.ceil(m.w / CHUNK) + Math.floor(x / CHUNK); },

  reveal() {
    const m = Player.map;
    if (!this.fogged(m)) return;
    const grid = this.grid(m), cx = Math.floor(Player.x / TILE), cy = Math.floor(Player.y / TILE), r = m.dark ? 6 : 12;
    for (let y = Math.max(0, cy - r); y <= Math.min(m.h - 1, cy + r); y++) for (let x = Math.max(0, cx - r); x <= Math.min(m.w - 1, cx + r); x++) {
      if (Math.hypot(x - cx, y - cy) <= r) grid[this.idx(m, x, y)] = 1;
    }
  },
  isSeen(m, x, y) { return !this.fogged(m) || !!this.grid(m)[this.idx(m, x, y)]; },

  visited(id) {
    if (id === 'farm' || id === 'village') return true;
    if (id === 'mine') return !!(World.maps.mine && Player.map.transient);
    return Memory.did('found_' + id);
  },
  regions() { return REGION_ORDER.filter(id => this.visited(id)); },

  // A spot inside a building is shown as that building's door.
  outdoor(mapId, x, y) {
    const m = World.maps[mapId];
    if (mapId === 'gaol') return { map: 'ironback', x: 10, y: 7 };
    if (!m.indoor || m.region || m.transient) return { map: mapId, x, y };
    for (const id in World.maps) {
      const w = World.maps[id].warps.find(a => a.to === mapId && a.door);
      if (w) return { map: id, x: w.x, y: w.y };
    }
    return { map: 'farm', x: 12, y: 9 };
  },
  here() { return this.outdoor(Player.map.id, Math.floor(Player.x / TILE), Math.floor(Player.y / TILE)); },

  color(m, x, y) {
    const k = key(x, y), b = World.buildingAt(m, x, y);
    if (b) { const d = Art.house_defs[b.type]; return d ? d.roof[0] : '#8a6239'; }
    if (m.block.has(k)) return m.sea ? '#4f8a55' : '#2f5a34';
    const o = World.at(m, x, y);
    if (o) {
      if (o.type === 'tree' || o.type === 'btree' || o.type === 'thicket') return '#2f5a34';
      if (o.type === 'crackwall') return GROUND_COLOR[T.ROCK];
    }
    return GROUND_COLOR[World.g(m, x, y)] || null;
  },

  image(m) {
    const id = m.id + ':' + m.version, c = this.cache[id];
    if (c && c.stamp === this.stamp) return c.canvas;
    const canvas = Art.mk(m.w, m.h, g => {
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
        if (!this.isSeen(m, x, y)) continue;
        const col = this.color(m, x, y);
        if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }
      }
    });
    this.cache[id] = { stamp: this.stamp, canvas };
    return canvas;
  },

  // Labelled places on a map, limited to what has been uncovered.
  places(m) {
    const out = [], edges = new Map();
    m.warps.forEach(w => {
      if (w.door) out.push({ x: w.x, y: w.y, label: World.maps[w.to].name });
      else { if (!edges.has(w.to)) edges.set(w.to, []); edges.get(w.to).push(w); }
    });
    edges.forEach((list, to) => {
      const mid = list[Math.floor(list.length / 2)];
      out.push({ x: mid.x, y: mid.y, label: this.visited(to) ? World.maps[to].name : 'Unexplored' });
    });
    m.buildings.forEach(b => { if (MAP_LABELS[b.type]) out.push({ x: b.x + Math.floor(b.w / 2), y: b.y + b.h - 1, label: MAP_LABELS[b.type] }); });
    m.objs.forEach(o => {
      if (o.type === 'stairs') out.push({ x: o.x, y: o.y, label: 'Way up' });
      if (o.type === 'ladder') out.push({ x: o.x, y: o.y, label: 'Ladder' });
      if (o.type === 'board') out.push({ x: o.x, y: o.y, label: 'Notice Board' });
    });
    return out.filter(p => this.isSeen(m, p.x, p.y));
  },

  // Where your active quests want you, as far as you could know.
  targets() {
    const out = [];
    const add = (mapId, x, y, label) => {
      const p = this.outdoor(mapId, x, y), m = World.maps[p.map];
      if (this.isSeen(m, p.x, p.y)) out.push(Object.assign(p, { label }));
    };
    for (const id of Quests.list('active')) {
      const stage = Quests.stageOf(id);
      stage.goals.forEach((g, i) => {
        if (Quests.goalVal(id, g, i) >= Quests.goalTarget(g)) return;
        if (g.type === 'goto') add(g.map, g.x, g.y, g.label);
        const spot = g.type === 'flag' && GOAL_SPOTS[g.flag];
        if (spot) add(spot[0], spot[1], spot[2], g.label);
      });
      if (stage.turnin) {
        const p = People.get(stage.turnin);
        if (!People.absent(p)) add(p.map.id, Math.floor(p.x / TILE), Math.floor(p.y / TILE), p.def.name);
      }
    }
    return out;
  },
};

Object.assign(UI, {
  tabMap(g, a, m) {
    if (!m.mapReady) { m.mapReady = true; MapView.stamp++; m.view = MapView.here().map; }
    const here = MapView.here(), list = MapView.regions(), targets = MapView.targets();
    if (!World.maps[m.view] || !list.includes(m.view)) m.view = here.map;
    // The legend owns the bottom of the column; the list scrolls above it.
    const listW = 96, avail = a.h - 38, rowH = clamp(Math.floor(avail / list.length), 11, 14), vis = Math.floor(avail / rowH);
    if (Input.mouse.wheel && this.hit(a.x, a.y - 2, listW, avail)) m.mapTop = (m.mapTop || 0) + Input.mouse.wheel;
    m.mapTop = clamp(m.mapTop || 0, 0, Math.max(0, list.length - vis));
    if (list.length > vis) this.scrollBar(g, a.x + listW + 1, a.y - 2, vis * rowH, m.mapTop, list.length, vis);
    g.fillStyle = C.paperD; g.fillRect(a.x, a.y + a.h - 35, listW, 1);
    list.slice(m.mapTop, m.mapTop + vis).forEach((id, i) => {
      const y = a.y + i * rowH, on = id === m.view;
      if (on) { g.fillStyle = '#f7d774'; g.fillRect(a.x, y - 2, listW, rowH - 1); } else if (this.hit(a.x, y - 2, listW, rowH - 1)) { g.fillStyle = '#ecd59f'; g.fillRect(a.x, y - 2, listW, rowH - 1); }
      if (this.click(a.x, y - 2, listW, rowH - 1)) { m.view = id; Sfx.play('click'); }
      // Names only give way to the markers on rows that actually show one.
      const room = listW - 5 - (targets.some(t => t.map === id) ? 8 : 0) - (here.map === id ? 7 : 0);
      let label = World.maps[id].name.split(',')[0];
      if (Font.width(label) > room) label = label.replace(/^The /, '');
      while (Font.width(label) > room) label = label.slice(0, -1);
      Font.draw(g, label, a.x + 3, y, C.ink);
      if (targets.some(t => t.map === id)) { g.fillStyle = '#d4405a'; g.fillRect(a.x + listW - 8, y + 1, 5, 5); }
      if (here.map === id) { g.fillStyle = C.blue; g.fillRect(a.x + listW - 15, y + 1, 5, 5); }
    });
    g.fillStyle = C.blue; g.fillRect(a.x + 3, a.y + a.h - 28, 5, 5); Font.draw(g, 'You are here', a.x + 12, a.y + a.h - 30, C.soft);
    g.fillStyle = '#d4405a'; g.fillRect(a.x + 3, a.y + a.h - 16, 5, 5); Font.draw(g, 'Quest', a.x + 12, a.y + a.h - 18, C.soft);

    const v = World.maps[m.view], bx = a.x + listW + 6, by = a.y, bw = a.w - listW - 6, bh = a.h - 12;
    const s = Math.max(1, Math.floor(Math.min(bw / v.w, bh / v.h))), mw = v.w * s, mh = v.h * s;
    const ox = bx + Math.floor((bw - mw) / 2), oy = by + Math.floor((bh - mh) / 2);
    g.fillStyle = '#d8c49a'; g.fillRect(bx, by, bw, bh);
    g.fillStyle = C.woodD; g.fillRect(ox - 1, oy - 1, mw + 2, 1); g.fillRect(ox - 1, oy + mh, mw + 2, 1); g.fillRect(ox - 1, oy, 1, mh); g.fillRect(ox + mw, oy, 1, mh);
    g.drawImage(MapView.image(v), ox, oy, mw, mh);

    const sx = x => ox + x * s + Math.floor(s / 2), sy = y => oy + y * s + Math.floor(s / 2);
    const taken = [];
    const free = r => r.x >= bx && r.x + r.w <= bx + bw && r.y >= by && r.y + r.h <= by + bh && !taken.some(t => r.x < t.x + t.w && r.x + r.w > t.x && r.y < t.y + t.h && r.y + r.h > t.y);
    const place = (p, color) => {
      const w = Font.width(p.label) + 2, h = 9, px = sx(p.x), py = sy(p.y);
      for (const [lx, ly] of [[px - w / 2, py - 12], [px - w / 2, py + 4], [px + 5, py - 4], [px - w - 4, py - 4]]) {
        const r = { x: Math.round(lx), y: Math.round(ly), w, h };
        if (!free(r)) continue;
        taken.push(r);
        Font.shadow(g, p.label, r.x + 1, r.y + 1, color);
        return;
      }
    };
    let hover = '';
    const dot = (p, color) => {
      g.fillStyle = '#2a1a10'; g.fillRect(sx(p.x) - 2, sy(p.y) - 2, 5, 5);
      g.fillStyle = color; g.fillRect(sx(p.x) - 1, sy(p.y) - 1, 3, 3);
      if (this.hit(sx(p.x) - 4, sy(p.y) - 4, 9, 9)) hover = p.label;
    };
    const shownTargets = targets.filter(t => t.map === m.view), places = MapView.places(v);
    shownTargets.forEach(t => { dot(t, '#ff5a70'); place(t, '#ffd0d8'); });
    places.forEach(p => dot(p, '#ffe680'));
    places.forEach(p => place(p, '#fff4d0'));

    if (here.map === m.view) {
      const px = sx(here.x), py = sy(here.y);
      g.fillStyle = '#2a1a10'; g.fillRect(px - 4, py - 4, 9, 9);
      g.fillStyle = Math.floor(performance.now() / 300) % 2 ? '#ffffff' : '#7dd0ff'; g.fillRect(px - 3, py - 3, 7, 7);
      g.fillStyle = C.blue; g.fillRect(px - 1, py - 1, 3, 3);
      if (this.hit(px - 4, py - 4, 9, 9)) hover = 'You are here';
    }
    Font.draw(g, hover || v.name, bx, a.y + a.h - 8, hover ? C.ink : C.soft);
  },
});
