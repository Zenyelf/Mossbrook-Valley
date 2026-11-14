'use strict';
// The chest at home: unlimited space, sorted into categories.

OBJDEF.homechest = { solid: 1, act: 'storage' };
ACT_LABEL.storage = 'Open chest';

const STORAGE_TABS = [
  ['All', null], ['Crops', ['crop']], ['Seeds', ['seed']], ['Forage', ['forage']], ['Fish', ['fish']], ['Animal', ['animal']],
  ['Materials', ['material']], ['Food', ['food']], ['Gear', ['tool', 'weapon', 'ammo', 'place', 'gear', 'gadget', 'potion', 'token']], ['Keepsakes', ['quest', 'relic']],
];

const Storage = {
  slotKey(id, q, s) { return id + ':' + (q || 0) + (s ? ':s' : ''); },

  rows(kinds) {
    const order = Object.keys(ITEMS);
    return Object.entries(S.storage).map(([k, n]) => {
      const [id, q, s] = k.split(':');
      return { id, q: Number(q), n, s: s ? 1 : 0 };
    }).filter(r => !kinds || kinds.includes(ITEMS[r.id].kind)).sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id) || a.q - b.q);
  },

  deposit(i, one) {
    const s = S.inv[i];
    if (!s) return;
    const n = one ? 1 : s.n, k = this.slotKey(s.id, s.q, s.s);
    S.storage[k] = (S.storage[k] || 0) + n;
    s.n -= n;
    if (s.n <= 0) S.inv[i] = null;
  },

  // Everything outside the hotbar goes in.
  depositPack() { for (let i = 10; i < S.inv.length; i++) this.deposit(i); },

  withdraw(row, one) {
    const k = this.slotKey(row.id, row.q, row.s), want = one ? 1 : Math.min(row.n, Inv.max(row.id));
    const moved = want - Inv.add(row.id, want, row.q, true, !!row.s);
    if (!moved) return false;
    S.storage[k] -= moved;
    if (S.storage[k] <= 0) delete S.storage[k];
    return true;
  },
};

Actions.storage = () => { Sfx.play('door'); UI.push(UI.storage()); };

Object.assign(UI, {
  storage() {
    const ui = this;
    let tab = 0, top = 0, packTop = 0, note = '';
    const close = () => { ui.pop(); Sfx.play('click'); };
    return {
      update() {
        if (Input.hit('menu') || Input.hit('cancel')) return close();
        if (Input.hit('tabL')) { tab = (tab + STORAGE_TABS.length - 1) % STORAGE_TABS.length; top = 0; Sfx.play('click'); }
        if (Input.hit('tabR')) { tab = (tab + 1) % STORAGE_TABS.length; top = 0; Sfx.play('click'); }
      },
      draw(g) {
        const W = Math.min(ui.W - 10, 450), H = Math.min(ui.H - 10, 240), x = Math.round((ui.W - W) / 2), y = Math.round((ui.H - H) / 2);
        g.fillStyle = '#14100c88'; g.fillRect(0, 0, ui.W, ui.H);
        panel(g, x, y, W, H);
        Font.draw(g, 'Home Chest', x + 12, y + 10, C.ink);
        const one = Input.held.has('ShiftLeft');

        // Categories
        const catW = 76, listY = y + 24;
        STORAGE_TABS.forEach(([name, kinds], i) => {
          const ry = listY + i * 16, n = Storage.rows(kinds).length;
          inset(g, x + 10, ry, catW, 14, i === tab || ui.hit(x + 10, ry, catW, 14));
          Font.draw(g, name, x + 14, ry + 3, n ? C.ink : C.grey);
          if (n) Font.draw(g, String(n), x + 10 + catW - 4 - Font.width(String(n)), ry + 3, C.soft);
          if (ui.click(x + 10, ry, catW, 14)) { tab = i; top = 0; Sfx.play('click'); }
        });

        // What is stored
        const gx = x + 10 + catW + 8, packW = 5 * 23, cols = Math.floor((W - catW - packW - 40) / 22), vis = Math.floor((H - 62) / 22);
        const rows = Storage.rows(STORAGE_TABS[tab][1]), totalRows = Math.ceil(rows.length / cols);
        Font.draw(g, 'Stored', gx, listY - 1, C.soft);
        if (Input.mouse.wheel && ui.hit(gx, listY, cols * 22, vis * 22 + 12)) top += Input.mouse.wheel;
        top = clamp(top, 0, Math.max(0, totalRows - vis));
        let hover = null;
        for (let i = 0; i < vis * cols; i++) {
          const r = rows[i + top * cols], cx = gx + (i % cols) * 22, cy = listY + 11 + Math.floor(i / cols) * 22;
          drawSlot(g, cx, cy, r || null, false);
          if (!r) continue;
          if (ui.hit(cx, cy, 20, 20)) hover = r;
          if (ui.click(cx, cy, 20, 20)) {
            if (Storage.withdraw(r, one)) { Sfx.play('click'); note = ''; } else { Sfx.play('bad'); note = 'Your pack is full.'; }
          }
        }
        if (totalRows > vis) ui.scrollBar(g, gx + cols * 22, listY + 11, vis * 22 - 2, top, totalRows, vis);

        // The pack
        const px = x + W - packW - 12, packVis = Math.floor((H - 62) / 23);
        Font.draw(g, 'Your pack', px, listY - 1, C.soft);
        if (Input.mouse.wheel && ui.hit(px, listY, packW, packVis * 23 + 12)) packTop += Input.mouse.wheel;
        packTop = clamp(packTop, 0, Math.max(0, Math.ceil(S.inv.length / 5) - packVis));
        const over = ui.packGrid(g, px, listY + 11, 5, packVis, packTop, i => {
          if (S.inv[i]) { Storage.deposit(i, one); Sfx.play('click'); note = ''; }
        });
        if (ui.button(g, 'Store pack, keep hotbar', px, y + H - 30, packW, 14)) { Storage.depositPack(); Sfx.play('coin'); note = ''; }

        const shown = hover || (over !== null ? S.inv[over] : null);
        if (shown) Font.draw(g, `${(shown.q ? qualityNames[shown.q] + ' ' : '') + ITEMS[shown.id].name} x${shown.n}`, gx, y + H - 28, C.ink);
        Font.draw(g, note || 'Click moves a stack. Hold Shift to move one.', gx, y + H - 18, note ? C.bad : C.soft);
      },
    };
  },
});
