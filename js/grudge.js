'use strict';
// Grudges. Wrong someone and let them find out (they catch you stealing from them, from their home or
// shop, picking their pocket, breaking into their house; or you blackmail them or beat them) and their
// hearts fall to -10. Broken hearts. Everything that earns trust (talking each day, gifts, favours) climbs
// them back, and only at +10 do they forgive you, which leaves you closer than ever. Another wrong on the
// way puts them back at -10. Until then they are cold with you and charge more, but they still trade and
// the story carries on as it would.

const Grudge = {
  start(id, why) {
    const d = NPCS[id], st = S && S.npc[id];
    if (!d || !st) return;
    const fresh = !st.grudge;
    st.grudge = { g: -1000, why: why || 'You wronged them.', day: absDay() };
    Sfx.play('sad');
    toast(`${d.name} knows what you did. Hearts: -10.`);
    if (fresh) Memory.deed('grudge_' + id + '_' + absDay(), `${d.name} found out what you did, and will not forget it.`, { once: false });
  },
  forgive(id) {
    const d = NPCS[id], st = S.npc[id];
    delete st.grudge; st.trust = 1000; st.forgiven = absDay();
    Sfx.play('heart'); toast(`${d.name} has forgiven you!`);
    Memory.deed('forgiven_' + id + '_' + absDay(), `Won back ${d.name}'s trust after everything.`, { once: false });
  },
  holds(id) { return !!(S && S.npc[id] && S.npc[id].grudge); },
  left(id) { return Math.ceil((1000 - S.npc[id].grudge.g) / 100); },
  // What they say while they are still hurt. Worse at first, softer as you win them back.
  GREET: [
    ['Oh. It\'s you.', 'I know what you did.', 'Say what you came to say.', 'I haven\'t forgotten. I don\'t think I can.'],
    ['You again. Well.', 'I\'m still angry with you, you know.', 'Don\'t expect a smile.', 'I suppose you want something.'],
    ['Hello. I\'m... still thinking about it.', 'You keep coming back. I\'ll give you that.', 'It\'s getting easier to look at you.', 'Not yet. But maybe, one day.'],
  ],
  CHAT: [
    ['I trusted you. That\'s what I keep coming back to.', 'Everyone in town has heard by now, I expect.', 'I don\'t want to talk about it. I don\'t want to talk at all, really.'],
    ['You could have just asked. Did you think of that?', 'I count things twice now. Because of you.', 'Some days I almost forget. Then I see you.'],
    ['The gifts help. I won\'t pretend they don\'t.', 'Maybe people can change. I\'d like to think so.', 'I\'ve been hard on you. You did earn it, mind.'],
  ],
  stage(id) { const h = hearts(id); return h < -3 ? 0 : h < 4 ? 1 : 2; },
};

(() => {
  // Caught in the act: the person it was done to knows. (A witness who wasn't wronged isn't hurt.)
  const caught = Crime.caught.bind(Crime);
  Crime.caught = function (p, c) {
    const r = caught(p, c);
    if (c && c.owner && NPCS[c.owner]) Grudge.start(c.owner, c.desc);
    return r;
  };
  // Blackmailing someone, or beating them senseless, is done to their face.
  const deed = Memory.deed.bind(Memory);
  Memory.deed = function (id, text, opt) {
    const r = deed(id, text, opt);
    const m = /^(blackmail|beat)_([A-Za-z0-9_]+?)(?:_\d+)?$/.exec(id || '');
    if (m && NPCS[m[2]]) Grudge.start(m[2], text);
    return r;
  };
  // Cold words instead of their usual greeting, every time you speak to them.
  const menu = Talk.menu.bind(Talk);
  Talk.menu = function (p) {
    if (!Grudge.holds(p.id)) return menu(p);
    const ask = UI.ask;
    UI.ask = function (who, text, opts) { UI.ask = ask; return ask.call(UI, who, pick(Grudge.GREET[Grudge.stage(p.id)]), opts); };
    try { return menu(p); } finally { UI.ask = ask; }
  };
  const chatLine = Talk.chatLine.bind(Talk);
  Talk.chatLine = function (p) { return Grudge.holds(p.id) ? pick(Grudge.CHAT[Grudge.stage(p.id)]) : chatLine(p); };
  // Higher prices while they are still angry.
  const pf = priceFactor;
  priceFactor = npc => pf(npc) + (Grudge.holds(npc) ? 0.1 : 0);
  // Broken hearts: dark, cracked, one for each heart still to win back below zero.
  const row = heartsRow;
  heartsRow = function (g, x, y, n) {
    if (n >= 0) return row(g, x, y, n);
    for (let i = 0; i < 10; i++) {
      const broken = i < -n, hx = x + i * 8;
      g.fillStyle = broken ? '#4a2a3a' : '#c9b08a';
      g.fillRect(hx, y, 2, 2); g.fillRect(hx + 3, y, 2, 2); g.fillRect(hx, y + 1, 5, 2); g.fillRect(hx + 1, y + 3, 3, 1); g.fillRect(hx + 2, y + 4, 1, 1);
      if (broken) { g.fillStyle = '#c9b08a'; g.fillRect(hx + 2, y, 1, 1); g.fillRect(hx + 3, y + 2, 1, 1); g.fillRect(hx + 2, y + 3, 1, 1); }
    }
  };
  // In the People tab: who is hurt, and how far there is to go.
  const tab = UI.tabPeople.bind(UI);
  UI.tabPeople = function (g, a, m) {
    tab(g, a, m);
    const ids = Object.keys(NPCS).filter(id => !NPCS[id].minor && (!NPCS[id].remote || S.npc[id].talked >= 0)), rowH = 26, vis = Math.floor(a.h / rowH), sc = Math.min(m.scroll, Math.max(0, ids.length - vis));
    ids.slice(sc, sc + vis).forEach((id, i) => {
      if (!Grudge.holds(id)) return;
      const y = a.y + i * rowH, h = hearts(id), msg = h < 0 ? `Hurt: ${-h} broken, then 10 more` : `Forgiving: ${Grudge.left(id)} hearts to go`;
      g.fillStyle = C.paper; g.fillRect(a.x + 170, y + 11, 104, 9);
      Font.draw(g, msg, a.x + 170, y + 12, C.bad);
    });
  };
})();
