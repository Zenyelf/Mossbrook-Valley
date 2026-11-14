'use strict';
// Gull's Teeth: an abandoned island. Before the pirates came, a lighthouse keeper's
// family and a handful of settlers lived here. They are gone now. What is left:
// a graveyard, a ruined chapel, a fallen watchtower, collapsed shacks, the ribs of a
// wreck on the sand, dead trees, fog that drifts in off the sea, crows by day, and
// bats and pale lights over the graves at night.
// Five pages of the keeper's journal lie among the ruins. Read them all and they lead
// you to a grave with an anchor on it. What is buried there is what the woman who
// walks the island at night is looking for. Loaded after coast.js.

item('mara_locket', 'Mara\'s Locket', 'quest', 0, ['locket', '#c8ccd4', '#8a92a0'], 'A tarnished silver locket. Inside: a lock of dark hair and a tiny painted lighthouse.');
item('wisp_lantern', 'Wisp Lantern', 'relic', 0, ['wisplantern', '#9af0d0', '#4ab090'], 'A lantern with no wick. A pale light lives in it, and it is warm.', { lore: 'Mara\'s gift, for bringing her locket home. On the nights the fog comes in, the light inside it turns, as if it is looking for the sea.' });
Object.assign(Art.ICONS, {
  locket: (g, a, b) => { const P = Art.P; P(g, b, 7, 1, 2, 4); P(g, a, 4, 5, 8, 8); P(g, b, 4, 12, 8, 1); P(g, '#ffffff', 5, 6, 2, 2); P(g, '#7a2f30', 7, 8, 2, 2); },
  wisplantern: (g, a, b) => { const P = Art.P; P(g, '#5a5048', 6, 1, 4, 2); P(g, '#5a5048', 4, 3, 8, 2); P(g, 'rgba(200,240,230,0.6)', 4, 5, 8, 8); P(g, a, 6, 7, 4, 4); P(g, '#ffffff', 7, 8, 2, 2); P(g, '#5a5048', 4, 13, 8, 2); },
});

// ---- Ruins and relics ----------------------------------------------------------------------
Object.assign(OBJDEF, {
  deadtree: { solid: 1 }, isleruin: { solid: 1, act: 'read' }, ruinarch: { solid: 1, fw: 2 }, cross: { solid: 1, act: 'read' }, anchorgrave: { solid: 1, act: 'islegrave' },
  bones: { flat: 1 }, shipribs: { solid: 1, fw: 3, act: 'read' }, brokenbarrel: { solid: 1 }, oldlantern: { solid: 1, light: 1 }, journalpage: { act: 'islepage' },
  isle_bell: { solid: 1, act: 'islebell' }, shackruin: { solid: 1, fw: 3, act: 'read' }, towerruin: { solid: 1, fw: 2, act: 'read' },
});
Object.assign(ACT_LABEL, { islepage: 'Read the page', islegrave: 'Look at the grave', islebell: 'Ring the bell' });
(() => {
  const { mk, P, outlined, STATIC } = Art;
  const ST = ['#7a7a82', '#8e8e96', '#5e5e66'], MOSS = '#4a6a3a';
  Object.assign(STATIC, {
    deadtree: () => outlined(mk(32, 44, g => { const B = '#4a3a2e', D = '#3a2c22'; P(g, B, 14, 18, 5, 26); P(g, D, 17, 18, 2, 26); P(g, B, 12, 40, 9, 4); P(g, B, 8, 10, 3, 12); P(g, B, 10, 18, 5, 3); P(g, B, 20, 6, 3, 14); P(g, B, 18, 16, 4, 3); P(g, B, 4, 6, 4, 6); P(g, B, 24, 2, 5, 5); P(g, B, 15, 8, 2, 10); P(g, B, 26, 12, 4, 2); P(g, D, 5, 4, 2, 3); })),
    isleruin: () => outlined(mk(16, 26, g => { P(g, ST[0], 1, 8, 14, 18); P(g, ST[1], 2, 8, 6, 2); P(g, ST[0], 1, 4, 6, 4); P(g, ST[0], 9, 2, 5, 6); P(g, ST[2], 1, 15, 14, 1); P(g, ST[2], 6, 9, 1, 6); P(g, MOSS, 2, 22, 6, 4); P(g, MOSS, 10, 6, 3, 2); P(g, '#2a2a30', 9, 12, 3, 3); })),
    ruinarch: () => outlined(mk(32, 40, g => { P(g, ST[0], 1, 8, 7, 32); P(g, ST[0], 24, 14, 7, 26); P(g, ST[0], 1, 4, 18, 6); P(g, ST[1], 2, 4, 14, 2); P(g, ST[2], 1, 20, 7, 1); P(g, ST[2], 24, 26, 7, 1); P(g, MOSS, 1, 34, 7, 6); P(g, MOSS, 26, 36, 5, 4); P(g, '#5a5048', 22, 10, 4, 3); })),
    cross: () => outlined(mk(16, 22, g => { P(g, '#5a4636', 7, 2, 3, 20); P(g, '#5a4636', 3, 6, 11, 3); P(g, '#4a3a2e', 8, 2, 1, 20); P(g, '#6a6a5a', 4, 20, 9, 2); })),
    anchorgrave: () => outlined(mk(16, 24, g => { P(g, ST[0], 2, 4, 12, 20); P(g, ST[1], 3, 4, 10, 2); P(g, '#3a3a42', 7, 7, 2, 11); P(g, '#3a3a42', 5, 9, 6, 2); P(g, '#3a3a42', 4, 15, 8, 2); P(g, '#3a3a42', 4, 13, 2, 3); P(g, '#3a3a42', 10, 13, 2, 3); P(g, '#3a3a42', 6, 6, 4, 1); P(g, MOSS, 2, 20, 5, 4); })),
    bones: () => mk(16, 16, g => { P(g, '#e8e0cc', 5, 4, 5, 4); P(g, '#2a2420', 6, 5, 1, 1); P(g, '#2a2420', 8, 5, 1, 1); P(g, '#e8e0cc', 3, 10, 10, 1); P(g, '#e8e0cc', 4, 12, 8, 1); P(g, '#e8e0cc', 2, 9, 2, 2); P(g, '#e8e0cc', 12, 12, 2, 2); }),
    shipribs: () => outlined(mk(48, 30, g => { const W = '#5a4636'; P(g, '#4a3a2e', 0, 24, 48, 4); for (let i = 0; i < 6; i++) { const x = 4 + i * 8, h = 18 - Math.abs(i - 2.5) * 3; P(g, W, x, 26 - h, 3, h); P(g, W, x + 1, 26 - h - 2, 4, 2); } P(g, W, 0, 20, 4, 6); P(g, '#6a6a5a', 30, 26, 6, 2); })),
    brokenbarrel: () => outlined(mk(16, 14, g => { P(g, '#6a4a30', 2, 4, 9, 10); P(g, '#3a3436', 2, 6, 9, 1); P(g, '#3a3436', 2, 11, 9, 1); P(g, '#7a5535', 10, 10, 5, 3); P(g, '#6a4a30', 12, 8, 3, 2); })),
    oldlantern: () => outlined(mk(16, 30, g => { P(g, '#4a3a2e', 7, 8, 2, 22); P(g, '#4a3a2e', 7, 6, 6, 2); P(g, '#3a3436', 10, 8, 5, 2); P(g, 'rgba(160,240,210,0.7)', 10, 10, 5, 6); P(g, '#ffffff', 12, 12, 1, 2); P(g, '#3a3436', 10, 16, 5, 1); })),
    journalpage: () => mk(16, 16, g => { P(g, '#e8dcb8', 3, 5, 10, 8); P(g, '#d0c098', 3, 12, 10, 1); for (let y = 7; y < 12; y += 2) P(g, '#7a6a5a', 4, y, 8, 1); P(g, '#a08a68', 12, 5, 1, 3); }),
    isle_bell: () => outlined(mk(20, 30, g => { P(g, '#4a3a2e', 2, 4, 3, 26); P(g, '#4a3a2e', 15, 4, 3, 26); P(g, '#4a3a2e', 2, 3, 16, 3); P(g, '#7a6a3a', 6, 7, 8, 9); P(g, '#5a4a2a', 5, 14, 10, 2); P(g, '#3a6a5a', 7, 8, 3, 3); P(g, '#2a2420', 9, 16, 2, 2); })),
    shackruin: () => outlined(mk(48, 30, g => { P(g, '#5a4636', 2, 12, 4, 18); P(g, '#5a4636', 42, 16, 4, 14); P(g, '#6a5444', 6, 18, 36, 12); P(g, '#4a3a2e', 6, 18, 36, 2); for (let x = 8; x < 40; x += 6) P(g, '#4a3a2e', x, 20, 1, 10); P(g, '#5a4a3a', 0, 8, 30, 4); P(g, '#5a4a3a', 20, 12, 26, 3); P(g, '#2a2420', 22, 22, 8, 8); P(g, MOSS, 36, 26, 6, 4); })),
    towerruin: () => outlined(mk(32, 52, g => { P(g, ST[0], 2, 14, 28, 38); P(g, ST[1], 4, 14, 8, 38); P(g, ST[0], 2, 6, 8, 8); P(g, ST[0], 14, 2, 6, 12); P(g, ST[0], 24, 10, 6, 4); for (let r = 0; r < 6; r++) P(g, ST[2], 2, 18 + r * 6, 28, 1); P(g, '#2a2a30', 12, 24, 6, 8); P(g, '#2a2420', 11, 42, 10, 10); P(g, MOSS, 2, 44, 8, 8); P(g, MOSS, 24, 40, 6, 6); })),
  });
})();

// ---- The keeper's journal ----------------------------------------------------------------------
const ISLE_PAGES = [
  'Page one. "We came to Gull\'s Teeth to keep the light for the ships to Saltmere. Mara says the island is lonely. I say it is quiet. We are both right."',
  'Page two. "Seven families now. A chapel, a bell, a watchtower for the storms. Mara wears my locket every day. I painted the lighthouse inside it, very small."',
  'Page three. "The fog comes in thicker each autumn. Some nights there are lights out on the water, pale ones, and singing. The others want to leave. Mara will not leave the light."',
  'Page four. "The fever took them one by one. I buried each in the graveyard by the chapel, and rang the bell. Mara was the last. I buried her locket with her, under the stone with the anchor, so she would have it."',
  'Page five. "The boat comes tomorrow and I will go with it. But she walks at night. I have seen her by the graves, looking for something. If you read this, and if you are kind: give it back to her."',
];
const Isle = {
  st() { if (!S.isle) S.isle = { pages: {}, dug: false, given: false }; return S.isle; },
  pagesRead() { return Object.keys(this.st().pages).length; },
  page(o) {
    const s = this.st();
    s.pages[o.page] = true; Sfx.play('page' in Sfx.SOUNDS ? 'page' : 'click');
    if (this.pagesRead() === ISLE_PAGES.length && !Memory.did('isle_journal')) Memory.deed('isle_journal', 'Read all five pages of the lighthouse keeper\'s journal on Gull\'s Teeth.');
    UI.say(null, ISLE_PAGES[o.page] + (this.pagesRead() < ISLE_PAGES.length ? `  (${this.pagesRead()} of ${ISLE_PAGES.length} pages found.)` : ''));
  },
  grave() {
    const s = this.st();
    if (s.dug || s.given) return UI.say(null, 'MARA. KEEPER OF THE LIGHT. The earth over her has settled again.');
    if (!s.pages[3]) return UI.say(null, 'A headstone carved with an anchor. The name has worn away: only M_RA is left.');
    if (!Inv.count('hoe')) return UI.say(null, 'MARA. The keeper buried her locket here. You would need a hoe to dig.');
    s.dug = true; Inv.add('mara_locket', 1, 0, true); Sfx.play('hoe'); Sfx.play('discover');
    Memory.deed('mara_locket', 'Dug Mara\'s locket out of her grave on Gull\'s Teeth.');
    UI.say(null, 'You dig carefully. A small tin box, and inside it a silver locket. Somewhere behind you, very quietly, someone sighs.');
  },
  bell() {
    Sfx.play('isletoll');
    UI.say(null, 'The bell gives one low, cracked note. It rolls out over the water. For a moment, the gulls go quiet.');
  },
  // The woman who walks the island at night.
  ghost: null,
  night() { return S.time >= 1140 || S.time < 300; },
  updateGhost(dt) {
    const s = this.st();
    if (!this.night() || s.given) { this.ghost = null; return; }
    if (!this.ghost) this.ghost = { x: ISLE_SPOTS.graves[0] * TILE + 8, y: (ISLE_SPOTS.graves[1] + 2) * TILE + 12, t: 0, fade: 0, alpha: 0, tx: 0, ty: 0, wander: 0, say: null, sayT: 0, gone: 0 };
    const g = this.ghost; g.t += dt;
    if (g.gone > 0) { g.gone -= dt; g.alpha = Math.max(0, g.alpha - dt * 2); if (g.gone <= 0) { const [x, y] = ISLE_SPOTS.haunts[Math.floor(Math.random() * ISLE_SPOTS.haunts.length)]; g.x = x * TILE + 8; g.y = y * TILE + 12; } return; }
    g.alpha = Math.min(0.65, g.alpha + dt * 0.4);
    g.wander -= dt;
    if (g.wander <= 0) { g.wander = 4 + Math.random() * 4; g.tx = g.x + (Math.random() - 0.5) * 60; g.ty = g.y + (Math.random() - 0.5) * 40; }
    const dx = g.tx - g.x, dy = g.ty - g.y, d = Math.hypot(dx, dy);
    if (d > 1) { g.x += dx / d * 8 * dt; g.y += dy / d * 8 * dt; }
    const near = Math.hypot(g.x - Player.x, g.y - Player.y);
    g.sayT -= dt;
    if (near < 70 && g.sayT <= 0) { g.say = ['Where... is it...', 'He said he would keep it safe...', 'The light... is out...', 'Have you seen it? Silver... small...'][Math.floor(Math.random() * 4)]; g.sayT = 4; if (Math.random() < 0.5) Sfx.play('whisper'); }
    if (g.sayT < 1.2) g.say = null;
  },
  speak() {
    const s = this.st(), g = this.ghost;
    if (!g) return;
    if (Inv.count('mara_locket')) {
      Inv.remove('mara_locket', 1); s.given = true;
      const left = Inv.add('wisp_lantern', 1, 0, true); if (left) S.storage[Storage.slotKey('wisp_lantern', 0)] = 1;
      S.gold += 1000;
      VFX.burst('star', g.x, g.y - 20, 30, 50); VFX.flash(0.25, '#d0fff0'); Sfx.play('revive');
      Memory.deed('mara_rest', 'Gave Mara\'s locket back to her ghost on Gull\'s Teeth. She does not walk there any more.', { gossip: true });
      UI.say(null, '"Oh." The woman takes the locket in both hands, and for a moment she is not grey at all. "Thank you. Tell the light... it can rest." Then there is only fog, and a lantern on the ground where she stood, and a purse of old silver coins. 1000 gold, and the Wisp Lantern.');
      this.ghost = null;
      return;
    }
    g.gone = 3; Sfx.play('whisper');
    UI.say(null, 'You reach out, and your hand passes through cold air. "My locket..." she breathes, and is gone. The graves are very quiet.');
  },
};
Object.assign(Actions, { islepage: o => Isle.page(o), islegrave: () => Isle.grave(), islebell: () => Isle.bell() });

// Where things are on the island (filled in when the island is built).
const ISLE_SPOTS = { graves: [19, 22], chapel: [40, 13], shacks: [40, 27], tower: [13, 15], wreck: [47, 22], haunts: [] };

(() => {
  const build = World.build.bind(World);
  World.build = function () {
    build();
    const W = this, m = W.maps.gullsteeth;
    if (!m) return;
    const camp = (x, y) => x >= 22 && x <= 38 && y >= 13 && y <= 25, docks = (x, y) => x >= 27 && x <= 33 && (y <= 6 || y >= 34);
    const ok = (x, y) => (W.g(m, x, y) === T.G || W.g(m, x, y) === T.S) && !W.solid(m, x, y) && !W.at(m, x, y) && !W.warpAt(m, x, y) && !camp(x, y) && !docks(x, y);
    const fits = (type, x, y) => { const d = OBJDEF[type], fw = d.fw || 1, fh = d.fh || 1; for (let j = 0; j < fh; j++) for (let i = 0; i < fw; i++) if (!ok(x + i, y + j)) return false; return true; };
    const near = (type, ax, ay, props) => { for (let r = 0; r < 8; r++) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue; if (fits(type, ax + i, ay + j)) return W.add(m, type, ax + i, ay + j, props); } return null; };
    // Dead trees where half the palms were.
    [...m.objs.values()].filter(o => o.type === 'palm').forEach((o, i) => { if (i % 2 === 0) { W.remove(m, o); W.add(m, 'deadtree', o.x, o.y); } });
    // The graveyard, west of the camp.
    const G = ISLE_SPOTS.graves, read = text => ({ text });
    const marker = [['cross', 'A wooden cross. Carved: TOBIAS, AGED 9.'], ['grave', 'ELSPETH FARROW. WHO WATCHED THE SEA.'], ['cross', 'A cross with no name, only a carved gull.'], ['grave', 'THE BRANNOCK FAMILY. ALL FOUR.'], ['cross', 'HUGH. HE RANG THE BELL.'], ['grave', 'Moss covers most of it. Something about singing.']];
    marker.forEach(([t, text], i) => near(t, G[0] - 3 + (i % 3) * 3, G[1] - 2 + Math.floor(i / 3) * 3, read(text)));
    const ag = near('anchorgrave', G[0], G[1] + 1); if (ag) ISLE_SPOTS.anchor = [ag.x, ag.y];
    near('oldlantern', G[0] + 4, G[1] - 3); near('bones', G[0] - 4, G[1] + 4);
    // The chapel, roofless now.
    const C = ISLE_SPOTS.chapel;
    near('ruinarch', C[0], C[1], {}); [[-3, 0], [-3, 2], [3, 0], [3, 3], [0, 4]].forEach(([dx, dy]) => near('isleruin', C[0] + dx, C[1] + dy, read('Part of a wall. A painted gull is still just visible on the plaster.')));
    near('isle_bell', C[0] + 1, C[1] + 6); near('oldlantern', C[0] - 2, C[1] + 5);
    // The shacks where the families lived.
    const H = ISLE_SPOTS.shacks;
    near('shackruin', H[0] - 4, H[1], read('A cottage, fallen in. A child\'s wooden boat lies in the doorway.')); near('shackruin', H[0] + 1, H[1] + 2, read('Another home, roofless. There are still plates on the table.'));
    [[-2, 4], [4, 4], [0, -2]].forEach(([dx, dy]) => near('brokenbarrel', H[0] + dx, H[1] + dy)); near('bones', H[0] + 3, H[1] - 1);
    // The watchtower, and the wreck on the sand.
    const Tw = ISLE_SPOTS.tower, Wr = ISLE_SPOTS.wreck;
    near('towerruin', Tw[0], Tw[1], read('The old storm tower. The stair inside has fallen. Gulls nest where the lamp was.'));
    near('shipribs', Wr[0], Wr[1], read('The ribs of a supply boat, picked clean by the sea. Barnacles spell nothing at all.')); near('bones', Wr[0] + 1, Wr[1] + 3);
    // Five pages of the keeper's journal.
    [[G[0] + 2, G[1] + 4], [C[0] + 2, C[1] + 2], [H[0] - 1, H[1] + 3], [Wr[0] - 2, Wr[1] + 1], [Tw[0] + 3, Tw[1] + 3]].forEach(([x, y], i) => near('journalpage', x, y, { page: i }));
    ISLE_SPOTS.haunts = [[G[0], G[1] + 2], [C[0], C[1] + 3], [H[0], H[1] - 2], [G[0] + 3, G[1] - 3]];
    // After the camp is freed, the pirates are gone too. At night, the drowned walk the beach.
    m.spawns = (m.spawns || []).map(sp => { if (sp.t !== 'pirate' && sp.t !== 'gunner') return sp; const was = sp.if; return Object.assign({}, sp, { if: () => (!was || was()) && !Memory.get('ness_free') }); });
    m.spawns.push({ t: 'drowned', x: 48, y: 26, n: 1, r: 2, if: () => Isle.night() }, { t: 'drowned', x: 12, y: 28, n: 1, r: 2, if: () => Isle.night() });
  };
})();

// ---- The atmosphere: fog, crows, bats, will-o'-the-wisps, and her ------------------------------------
const Gloom = {
  crows: [], bats: [], wisps: [], fog: [], t: 0,
  update(dt) {
    this.t += dt;
    const cam = Render.cam, W = UI.W, H = UI.H, night = Isle.night();
    if (!this.fog.length) for (let i = 0; i < 9; i++) this.fog.push({ x: Math.random() * (W + 200) - 100, y: Math.random() * H, r: 60 + Math.random() * 80, v: 4 + Math.random() * 6 });
    for (const f of this.fog) { f.x += f.v * dt; if (f.x - f.r > W) { f.x = -f.r; f.y = Math.random() * H; } }
    // Crows by day, perched or flapping off.
    if (!night && this.crows.length < 5) this.crows.push({ x: cam.x + Math.random() * W, y: cam.y + Math.random() * H, t: Math.random() * 5, fly: 0, vx: 0, vy: 0 });
    for (const c of this.crows) {
      c.t += dt;
      if (!c.fly && Math.hypot(c.x - Player.x, c.y - Player.y) < 40) { c.fly = 1; c.vx = (c.x > Player.x ? 1 : -1) * 50; c.vy = -30; if (Math.random() < 0.5) Sfx.play('caw'); }
      if (c.fly) { c.x += c.vx * dt; c.y += c.vy * dt; c.vy += Math.sin(c.t * 6) * 20 * dt; }
    }
    this.crows = this.crows.filter(c => !night && c.x > cam.x - 80 && c.x < cam.x + W + 80 && c.y > cam.y - 80 && c.y < cam.y + H + 80);
    // Bats and wisps after dark.
    if (night && this.bats.length < 5) this.bats.push({ x: cam.x + Math.random() * W, y: cam.y + Math.random() * H * 0.6, t: Math.random() * 6, a: Math.random() * 6.28 });
    for (const b of this.bats) { b.t += dt; b.a += (Math.random() - 0.5) * 6 * dt; b.x += Math.cos(b.a) * 60 * dt; b.y += Math.sin(b.a) * 30 * dt; }
    this.bats = this.bats.filter(b => night && b.x > cam.x - 100 && b.x < cam.x + W + 100 && b.y > cam.y - 100 && b.y < cam.y + H + 100);
    if (night && this.wisps.length < 7) { const [gx, gy] = ISLE_SPOTS.graves, h = Math.random() < 0.6; this.wisps.push({ x: (h ? gx * TILE : cam.x + Math.random() * W) + (Math.random() - 0.5) * 80, y: (h ? gy * TILE : cam.y + Math.random() * H) + (Math.random() - 0.5) * 60, t: Math.random() * 6, life: 8 + Math.random() * 8 }); }
    for (const w of this.wisps) {
      w.t += dt; w.life -= dt; w.x += Math.sin(w.t * 0.7) * 6 * dt; w.y += Math.cos(w.t * 0.5) * 4 * dt;
      const d = Math.hypot(w.x - Player.x, w.y - (Player.y - 10)); if (d < 30) { w.x += (w.x - Player.x) / (d || 1) * 30 * dt; w.life -= dt * 2; }
    }
    this.wisps = this.wisps.filter(w => night && w.life > 0);
    Isle.updateGhost(dt);
  },
  // In the world: crows and bats.
  draw(g) {
    for (const c of this.crows) {
      const x = Math.round(c.x), y = Math.round(c.y), flap = Math.floor(c.t * (c.fly ? 10 : 2)) % 2;
      g.fillStyle = '#1a1a20';
      if (c.fly) { g.fillRect(x - 4, y - (flap ? 2 : 0), 3, 1); g.fillRect(x + 2, y - (flap ? 2 : 0), 3, 1); g.fillRect(x - 1, y, 3, 2); }
      else { g.fillRect(x - 2, y - 3, 5, 3); g.fillRect(x + 2, y - 5, 2, 2); g.fillStyle = '#e8b030'; g.fillRect(x + 4, y - 4, 1, 1); g.fillStyle = '#1a1a20'; g.fillRect(x - 1, y, 1, 1); g.fillRect(x + 1, y, 1, 1); if (flap) g.fillRect(x - 3, y - 2, 1, 1); }
    }
    for (const b of this.bats) { const x = Math.round(b.x), y = Math.round(b.y), f = Math.floor(b.t * 12) % 2; g.fillStyle = '#2a2030'; g.fillRect(x - 1, y, 3, 2); g.fillRect(x - 4, y - (f ? 1 : -1), 3, 1); g.fillRect(x + 2, y - (f ? 1 : -1), 3, 1); }
  },
  // Over the dark: fog, wisps, and the ghost, who should glow.
  over(g) {
    const cam = Render.cam, W = UI.W, H = UI.H, night = Isle.night(), gh = Isle.ghost;
    g.save();
    g.fillStyle = night ? 'rgba(20,30,50,0.18)' : 'rgba(60,70,90,0.12)'; g.fillRect(0, 0, W, H);
    for (const f of this.fog) { const grd = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r); grd.addColorStop(0, night ? 'rgba(170,190,200,0.22)' : 'rgba(220,225,230,0.2)'); grd.addColorStop(1, 'rgba(220,225,230,0)'); g.fillStyle = grd; g.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2); }
    g.globalCompositeOperation = 'lighter';
    for (const w of this.wisps) {
      const a = Math.min(1, w.life / 2) * (0.55 + Math.sin(w.t * 3) * 0.3), x = Math.round(w.x - cam.x), y = Math.round(w.y - cam.y);
      g.fillStyle = `rgba(120,240,210,${a * 0.18})`; g.fillRect(x - 4, y - 4, 9, 9); g.fillStyle = `rgba(160,255,230,${a * 0.5})`; g.fillRect(x - 2, y - 2, 5, 5); g.fillStyle = `rgba(230,255,250,${a})`; g.fillRect(x - 1, y - 1, 2, 2);
    }
    g.globalCompositeOperation = 'source-over';
    if (gh && gh.alpha > 0) {
      const x = Math.round(gh.x - cam.x), y = Math.round(gh.y - cam.y + Math.sin(gh.t * 2) * 2), a = gh.alpha;
      g.globalAlpha = a; g.drawImage(Art.tinted(Art.charFrame('mara_ghost', ISLE_GHOST, DIRS.down, 0), '#c8f0e8'), x - 9, y - 28);
      g.globalAlpha = a * 0.25; g.fillStyle = '#c8f0e8'; g.fillRect(x - 10, y - 30, 20, 32); g.globalAlpha = 1;
      if (gh.say) { const tw = Font.width(gh.say); Font.draw(g, gh.say, Math.round(clamp(x - tw / 2, 4, W - tw - 4)), y - 40, '#c8f0e8'); }
    }
    g.restore();
  },
};
const ISLE_GHOST = { skin: '#f0f0f0', skinD: '#d0d0d0', hair: '#e0e0e0', hairD: '#c0c0c0', style: 'long', shirt: '#f0f0f0', shirtD: '#d0d0d0', dress: '#f0f0f0', dressD: '#d0d0d0', pants: '#f0f0f0', pantsD: '#d0d0d0', shoes: '#f0f0f0' };

(() => {
  // A tolling bell, a whisper, creaking timbers, a crow.
  const { bell, ftone } = Sfx.kit;
  Object.assign(Sfx.SOUNDS, {
    isletoll() { bell(this, 110, 3, 0.14); bell(this, 165, 2.4, 0.06, 0.02); },
    whisper() { this.noise(1.2, 0.06, 2600, { type: 'bandpass', q: 3, attack: 0.4, to: 1800 }); this.noise(0.9, 0.04, 3200, { type: 'bandpass', q: 4, attack: 0.3, when: 0.3, to: 2400 }); },
    caw() { ftone(this, 700, 0.22, 'sawtooth', 0.06, 0, -250, 1600, 0.01); ftone(this, 650, 0.2, 'sawtooth', 0.05, 0.28, -250, 1500, 0.01); },
  });
  Object.assign(Sfx.AMB, {
    creak() { Sfx.tone(140 + Math.random() * 60, 0.6, 'sawtooth', 0.012, 0, 30 * (Math.random() - 0.5), Sfx.ambBus, 0.1); },
    toll() { Sfx.tone(110, 3, 'sine', 0.03, 0, 0, Sfx.ambBus, 0.01); Sfx.tone(304, 1.6, 'sine', 0.01, 0, 0, Sfx.ambBus, 0.01); },
    murmur() { Sfx.noise(1.6, 0.025, 2600, { type: 'bandpass', q: 3, attack: 0.5, out: Sfx.ambBus, to: 1800 }); },
  });
  Sfx.THEMES.isle = { bpm: 56, root: 57, scale: 'phrygian', prog: [0, 1, 0, 6], lead: ['sine', 0.04, 12, 0.26], bass: '1.......', pad: 0.045, echo: 0.55, seed: 66 };
  Sfx.PLACES.gullsteeth = 'isle';
  Sfx.BEDS.isle = { waves: [4, 7], wind: [5, 9], creak: [7, 14], toll: [30, 55] };
  // Every frame on the island.
  const tick = Horse.tick.bind(Horse);
  Horse.tick = function (dt) { tick(dt); if (Player.map && Player.map.id === 'gullsteeth') Gloom.update(dt || 1 / 60); };
  const vfxDraw = VFX.draw;
  VFX.draw = function (g) { if (Player.map && Player.map.id === 'gullsteeth') Gloom.draw(g); return vfxDraw.call(this, g); };
  const lighting = Render.lighting;
  Render.lighting = function (...a) { const r = lighting.apply(this, a); if (Player.map && Player.map.id === 'gullsteeth') Gloom.over(a[0]); return r; };
  // Walk up to her and press E.
  const scan = Interact.scan.bind(Interact);
  Interact.scan = function () {
    const base = scan(), gh = Isle.ghost;
    if (!gh || gh.gone > 0 || gh.alpha < 0.2 || Player.map.id !== 'gullsteeth' || Math.hypot(gh.x - Player.x, gh.y - Player.y) > 32) return base;
    return { tile: [Math.floor(gh.x / TILE), Math.floor(gh.y / TILE)], label: Inv.count('mara_locket') ? 'Give her the locket' : 'Reach out to her', sprite: () => ({ img: Art.charFrame('mara_ghost', ISLE_GHOST, DIRS.down, 0), x: Math.round(gh.x) - 9, y: Math.round(gh.y) - 28 }), ax: gh.x, ay: gh.y - 32, run: () => Isle.speak() };
  };
})();
