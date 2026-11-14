'use strict';
// The long story: the Kept on your farm, Bram's arrest, the King's mail, the
// final choice, the epilogue, and the world that comes after it.

const SPROUT_SPOTS = { moss: [53, 36], reed: [51, 36], tally: [53, 38], bell: [51, 38] };

const Story = {
  // ---- The Kept --------------------------------------------------------------
  unlocked(id) { return id === 'moss' ? !!Memory.get('act1_done') : !!Memory.get('read_names'); },
  state(id) { if (!S.sprouts) S.sprouts = {}; if (!S.sprouts[id]) S.sprouts[id] = { lvl: 0, fed: -1 }; return S.sprouts[id]; },
  night() { return S.time >= 1200 || S.time < 300; },
  // Boosts only work while the Kept are still in your fields.
  boost(id) { return !S.ending && S.sprouts && S.sprouts[id] && S.sprouts[id].lvl >= 3; },
  visibleKept() {
    if (S.ending || Player.map.id !== 'farm' || !this.night()) return [];
    return Object.keys(SPROUTS).filter(id => this.unlocked(id));
  },

  keptAt(id) { const [x, y] = SPROUT_SPOTS[id]; return { x: x * TILE + 8, y: y * TILE + 12 }; },

  keptHit(id) {
    const st = this.state(id), sp = SPROUTS[id], held = Inv.held();
    if (st.lvl < 3 && held && held.id === sp.want && st.fed !== absDay()) return 'Offer ' + ITEMS[sp.want].name;
    return st.lvl >= 3 ? 'Greet ' + sp.name : 'Look at the sprout';
  },

  keptTalk(id) {
    const st = this.state(id), sp = SPROUTS[id], held = Inv.held();
    if (st.lvl >= 3) return UI.say(null, `${sp.name} hums at you, quietly. ${sp.boost}`);
    if (held && held.id === sp.want && st.fed !== absDay()) {
      Inv.remove(sp.want, 1);
      st.fed = absDay(); st.lvl++;
      Sfx.play('heart');
      Quests.event('sprout', id);
      const line = sp.lines[st.lvl - 1];
      if (st.lvl === 3) {
        Memory.deed('kept_' + id, `Learned the name of one of the Kept: ${sp.name}.`, { gossip: true });
        return UI.say(null, `${line} ${sp.boost}`, () => Quests.pulse());
      }
      return UI.say(null, line + ' (Come back tomorrow night.)', () => Quests.pulse());
    }
    if (st.fed === absDay()) return UI.say(null, 'It has curled up against the stone. It will want to see you again tomorrow night.');
    Codex.learn(sp.want, 'seen');
    UI.say(null, `It looks at you, then at your hands. It wants something. You think of ${ITEMS[sp.want].name}.`);
  },

  reedWater(m) {
    const dry = Object.keys(m.soil).filter(k => m.soil[k].c && !m.soil[k].w);
    for (let i = 0; i < 10 && dry.length; i++) m.soil[dry.splice(Math.floor(Math.random() * dry.length), 1)[0]].w = 1;
  },

  // Reading the Tithe Roll at the stone.
  stoneHook() {
    const q = S.quests.a2_3;
    if (!q || q.state !== 'active' || q.stage !== 0) return false;
    if (!Inv.count('tithe_roll')) { UI.say(null, 'You should bring the Tithe Roll here, after dark.'); return true; }
    if (!this.night()) { UI.say(null, 'Bram said to come at night, when the Kept come out.'); return true; }
    Script.run([
      [null, 'You unroll the Tithe Roll beside the stone, and begin to read.'],
      [null, '"Hanne Moss. Tobias Reed. Eda Tallow. Brother Aldo. Corin Tolley..." Your voice gives out halfway down the first page, and you keep going.'],
      [null, 'One by one, small green shapes push up out of the earth around the stone, and turn to listen. There are more of them than you can count.'],
      [null, 'When you finish, four of them stay. The rest sink back into the soil, very slowly, as if they are finally able to sleep.'],
      { do() { Memory.flag('read_names'); Memory.deed('read_names', 'Read the Tithe Roll aloud at the stone, and the Kept rose to listen.', { gossip: true }); } },
    ], null, () => Quests.pulse());
    return true;
  },

  // ---- Act Three ---------------------------------------------------------------
  arrestBram() {
    Memory.flag('bram_arrested');
    Memory.deed('bram_arrested', 'Watched the Inquisitor arrest Old Bram for sedition.', { gossip: true });
    People.seat(People.get('bram'));
  },

  freeBram(how) {
    if (Memory.get('bram_freed')) return;
    Memory.flag('bram_freed');
    Memory.deed('bram_freed', `Got Old Bram out of Ironback Gaol: ${how}.`, { gossip: true });
    People.seat(People.get('bram'));
    Sfx.play('quest');
    Quests.pulse();
  },

  // The ways to get Bram out, offered by whoever can make it happen.
  bramOptions(id, opts) {
    if (!Memory.get('bram_arrested') || Memory.get('bram_freed') || Memory.get('bram_taken')) return;
    if (id === 'odile') {
      if (S.known.odile_notes) opts.push({ text: 'Show her own notebook: she knows the levy is a lie', fn: () => Script.run([
        'Where did you... No. Never mind where. You are right, and I have known it for years.',
        'I will sign his release myself. Thorne will be furious. Let her be.',
      ], 'odile', () => { Trust.add('odile', -40); this.freeBram('Sgt. Varr signed his release'); }) });
      else if (hearts('odile') >= 5) opts.push({ text: 'Ask her to release Bram', fn: () => Script.run([
        'You are asking me to defy an Inquisitor. For an old man who knew your grandfather.',
        '...Yes. All right. I have obeyed enough orders I was ashamed of. Go and fetch him.',
      ], 'odile', () => this.freeBram('Sgt. Varr defied the Inquisitor')) });
    }
    if (id === 'brann') opts.push({ text: 'Pay 1500g for Old Bram\'s release', locked: S.gold < 1500, fn: () => { S.gold -= 1500; Sfx.play('coin'); UI.say('brann', 'He was never here. Neither were you.', () => this.freeBram('a bribe to Gaoler Brann')); } });
    if (id === 'thorne' && Inv.count('tithe_roll')) opts.push({ text: 'Give her the Tithe Roll in exchange for Bram', fn: () => {
      Inv.remove('tithe_roll', 1); Memory.flag('gave_roll');
      Memory.deed('gave_roll', 'Traded the Tithe Roll to the Inquisitor for Bram\'s freedom.', { gossip: true });
      UI.say('thorne', 'A sensible trade. One old man for one old piece of paper. You will regret it, I think, but not today.', () => this.freeBram('the Tithe Roll, traded to the Inquisitor'));
    } });
  },

  culvert() {
    if (Memory.get('bram_arrested') && !Memory.get('bram_freed') && !Memory.get('bram_taken')) {
      if (!this.night() || S.time < 1260) return UI.say(null, 'A culvert runs up under the gaol wall. Too many guards awake to try it now. Come back late at night.');
      if (!Crime.hasPick()) return UI.say(null, 'The culvert ends at a locked grate. You would need a lockpick.');
      return UI.ask(null, 'Crawl up the culvert, pick the grate, and try to get Bram out?', [
        { text: 'Go', fn: () => {
          if (!Inv.count('master_pick')) Inv.remove('lockpick', 1);
          const chance = clamp(0.45 + S.skills.stealth.lvl * 0.08 + (Combat.sneaking ? 0.15 : 0) + (Inv.count('softboots') ? 0.1 : 0), 0.1, 0.95);
          if (Math.random() < chance) {
            gainXP('stealth', 120);
            Script.run([[null, 'The grate gives. You slip through the laundry, past the dozing watchman, and wake Bram with a hand over his mouth. Twenty minutes later you are both standing in the cold on the mountainside.']], null, () => this.freeBram('broken out through the culvert'));
          } else {
            S.bounty += 400;
            Script.run([[null, 'A lamp swings round. "Who is there?" Hands drag you out of the drain.']], null, () => Crime.arrest(false));
          }
        } },
        { text: 'Not yet', fn() {} },
      ]);
    }
    UI.say(null, 'A culvert runs up under the gaol wall. Water drips from it.');
  },

  fightThorne() {
    Memory.flag('thorne_fight');
    const p = People.get('thorne');
    p.hidden = true; p.fighting = true;
    Foes.spawn('thorne', p.x, p.y, { alert: true });
  },

  // ---- The final choice --------------------------------------------------------
  heart() {
    const q = S.quests.a5_1;
    if (!q || q.state !== 'active') return UI.say(null, S.ending ? (S.ending === 'expose' ? 'The Heart is grey and still. Roots crumble when you touch them.' : 'The Heart beats, slow and content.') : 'Something vast and green, beating. You should not be here.');
    if (q.stage < 1) { q.stage = 1; Quests.resetProg('a5_1'); }
    const dell = Memory.get('dell_to_king'), bram = Memory.get('bram_taken');
    Script.run([
      ['king', 'You found it. Good. I wanted you to see it before you decide anything.'],
      ['king', 'Year 76. The harvest had failed three years running. Half the kingdom was starving. I was an old man then, and dying, and I was offered a bargain by something that lives under rivers.'],
      ['king', 'Feed the Green, and the Green feeds everyone. A village for a kingdom. I took it. Your grandfather opened the sluices.'],
      ['king', 'It has to eat, Tam. A little every year. The Tithe. In return, no child in this kingdom has gone hungry in fifty-two years. And I do not die.'],
      ['king', 'Joren came here last winter to cut it out. He could not. He is in the roots behind you, still, in a way, alive.' + (dell ? ' So is Dell Hale, now.' : '') + (bram ? ' So is your friend Bram.' : '')],
      ['king', 'I need a Warden for the west. Someone to keep the stone, and keep the Kept quiet. Kneel, and the valley is yours. Gold. Land. A pardon for anything you have ever done.'],
      { ask: 'The Heart beats. The King waits.', who: null, opts: [
        { t: 'Kneel.', do: () => this.end('keep') },
        { t: 'Read them their names from the Tithe Roll.', if: () => Inv.count('tithe_roll') > 0, do: () => this.end('names') },
        { t: 'Draw your weapon.', do: () => this.fightKing() },
      ] },
    ], 'king');
  },

  fightKing() {
    Memory.flag('king_fight');
    const p = People.get('king');
    p.hidden = true; p.fighting = true;
    Foes.spawn('king', p.x, p.y, { alert: true });
    toast('Destroy the King. The Heart will die with him.');
  },

  onKill(f) {
    if (f.type === 'thorne') { Memory.flag('thorne_gone'); Memory.flag('thorne_dead'); Memory.deed('killed_thorne', 'Killed Inquisitor Thorne.', { gossip: true, rep: { crown: -5 } }); }
    if (f.type === 'king') { Foes.list = []; this.end('blade'); }
  },

  end(how) {
    S.ending = how === 'keep' ? 'keep' : 'expose';
    S.endingHow = how;
    Memory.flag('final_choice');
    const text = { keep: 'Knelt before the King at the Green Heart, and became his Warden.', names: 'Read the names of the Kept at the Green Heart, and the King withered.', blade: 'Cut down the Evergreen King at the Green Heart.' }[how];
    Memory.deed('ending', text, { gossip: true });
    this.applyEnding(true);
    Quests.pulse();
    UI.push(UI.slides(this.epilogue(), () => Game.endDay(false)));
  },

  applyEnding(first) {
    if (!S.ending) return;
    if (S.ending === 'expose') {
      Memory.flag('crown_fallen');
      if (first) {
        S.bounty = 0; S.wanted = false;
        if (Memory.get('bram_taken')) Memory.flag('bram_rescued');
        if (Memory.get('dell_to_king')) Memory.flag('dell_rescued');
        S.rep.town += 5;
      }
      const v = World.maps.village;
      for (let y = 0; y <= 2; y++) for (let x = 31; x <= 33; x++) World.set(v, x, y, T.B);
      if (!v.warps.some(w => w.to === 'lower')) [31, 32, 33].forEach((x, i) => v.warps.push({ x, y: 0, to: 'lower', tx: 23 + i, ty: 34, dir: DIRS.up }));
      v.version++;
      const sign = World.at(v, 30, 6); if (sign) sign.text = 'The bridge is mended. Across it, where the river drew back, lie the streets of Lower Mossbrook.';
    } else {
      Memory.flag('warden');
      if (first) { S.bounty = 0; S.wanted = false; S.notoriety = 0; Inv.add('warden_seal', 1); }
    }
  },

  // ---- The ending, in words ------------------------------------------------------
  title() {
    const crimes = S.crimes || 0, n = S.notoriety || 0;
    if (S.ending === 'keep') return crimes > 10 || n >= 60 ? 'The King\'s Hound' : 'The King\'s Warden';
    if (crimes >= 10 && n >= 40) return 'The Outlaw Who Broke the Crown';
    if (crimes > 0 && Memory.did('jailed') && n < 20) return 'The Thief Who Came Home';
    if (S.rep.town >= 4 && crimes === 0) return 'The Hero of Mossbrook';
    return 'The Farmer Who Said Their Names';
  },

  epilogue() {
    const out = [], how = S.endingHow;
    if (how === 'keep') out.push('You knelt. The Heart beat on, and the King smiled, and the valley was given into your keeping.', 'Every autumn the list still comes from the capital. You see that it is delivered. The harvest has never failed.');
    if (how === 'names') out.push('You read the names. All of them. One by one the Kept rose out of the roots to listen, and the Heart went quiet, and the King grew old in the space of a breath, and then he was dust.');
    if (how === 'blade') out.push('You cut him down at the Heart. The roots screamed with him. When it was over there was only a very old man on the floor, and then not even that.');
    if (S.ending === 'expose') out.push('That autumn the harvest was ordinary. Some people went hungry. Nobody was taken.', 'By spring the bridge was mended. Where the river had drawn back lay the streets of Lower Mossbrook, waiting to be remembered.');
    if (Memory.get('dell_home') || Memory.get('dell_rescued')) out.push('Dell Hale came home. Marta did not let go of his hand for a week.');
    else if (Memory.get('dell_to_king')) out.push('Marta Hale never forgave you. She never should have.');
    if (Memory.get('bram_rescued')) out.push('Old Bram walked out of the roots blinking at the light, and went home, and slept for three days.');
    else if (Memory.get('bram_taken')) out.push('Old Bram was never seen again.');
    else if (Memory.get('bram_freed')) out.push('Old Bram sat on his bench by the well every morning, and said a few names out loud, just so they got said.');
    if (S.dead.rusk) out.push('Rusk\'s camp broke up without him. Some of them came to farm. Most of them did not.');
    else if (Memory.get('camp_deal')) out.push('Rusk\'s people came out of the woods' + (S.ending === 'expose' ? ' when the Crown fell, and nobody stopped them.' : ', now and then, to trade. You never asked what.'));
    if (Memory.get('thorne_ally')) out.push('Maelis Thorne found her brother\'s name in the roots. She stayed in the valley afterwards. Nobody asked her to leave.');
    else if (Memory.get('thorne_dead')) out.push('Nobody ever found out what became of the Inquisitor. You did not tell them.');
    const kept = Object.keys(SPROUTS).filter(id => S.sprouts && S.sprouts[id] && S.sprouts[id].lvl >= 3).map(id => SPROUTS[id].name);
    if (kept.length) out.push(S.ending === 'expose' ? `${kept.join(', ')} were among the names carved on the new memorial. You made sure of it.` : `${kept.join(', ')} faded from your fields that winter, and did not come back.`);
    if (S.crimes) out.push(`You stole ${S.crimes} time${S.crimes > 1 ? 's' : ''}` + (Memory.did('jailed') ? ', did time in Ironback,' : '') + (Memory.did('escaped_gaol') ? ' broke out of it,' : '') + ' and the valley remembers all of it.');
    out.push(`They remember you as: ${this.title()}.`);
    out.push('The story is over. Your farm, and the valley, go on.');
    return out;
  },

  // ---- Every morning ---------------------------------------------------------------
  newDay(lines) {
    const q = S.quests.a3_2;
    if (q && q.state === 'active' && absDay() - q.start >= 6) {
      Memory.flag('bram_taken');
      Memory.deed('bram_taken', 'The autumn levy took Old Bram east before you could free him.', { gossip: true });
      Quests.lose('a3_2', 'The levy took Bram east.');
      lines.push({ t: 'The levy took Old Bram east in the night.', c: C.bad });
    }
    if (Memory.get('thorne_fight') && !Memory.get('thorne_dead')) Memory.flag('thorne_gone');
    if (Memory.get('act3_done') && !Memory.get('writ_sent')) { Memory.flag('writ_sent'); S.mail.push('writ'); lines.push({ t: 'There is something in your mailbox.', c: C.blue }); }
    if (S.ending === 'keep') {
      if (S.day % 7 === 1) { S.mail.push('stipend'); lines.push({ t: 'The Warden\'s stipend has arrived in your mailbox.', c: C.good }); }
      // The Tithe goes on. This season it comes for someone you know.
      if (S.day === 1 && !Memory.get('keep_tithe_' + S.season + '_' + S.year)) {
        Memory.flag('keep_tithe_' + S.season + '_' + S.year);
        const who = !Memory.get('bram_taken') ? 'bram' : !Memory.get('wick_taken') ? 'wick' : null;
        if (who) {
          Memory.flag(who + '_taken');
          Memory.deed(who + '_taken_tithe', `The Tithe took ${NPCS[who].name}. You signed the list.`, { gossip: true });
          lines.push({ t: `The Tithe took ${NPCS[who].name}. Your name is on the order.`, c: C.bad });
        }
      }
    }
  },

  mail() {
    if (!S.mail.length) return UI.say(null, 'The mailbox is empty.');
    const m = S.mail.shift();
    if (DLC.mail(m)) return;
    if (m === 'writ') {
      return Script.run([
        [null, 'A letter sealed in green wax. "By order of His Majesty Oswin, the Evergreen King: Tam Ashgrove, grandson of our loyal servant Joren, is summoned to the Evergreen Court."'],
        [null, '"Let this writ open the King\'s Gate to the bearer." The King\'s Gate is at the east end of Mossbrook.'],
        { do() { Inv.add('royal_writ', 1); Memory.flag('got_writ'); World.applyFlags(); } },
      ], null, () => Quests.pulse());
    }
    if (m === 'stipend') { S.gold += 1000; Sfx.play('coin'); return UI.say(null, 'A purse of 1000 gold, sealed in green. The Warden\'s stipend.'); }
  },

  // ---- Drawing ------------------------------------------------------------------
  drawWorld(g, m, items) {
    if (m.id === 'farm') this.visibleKept().forEach(id => {
      const p = this.keptAt(id), f = Math.floor(Render.waterT * 2 + id.length) % 2;
      items.push({ y: p.y, draw: () => {
        g.drawImage(Art.kept(id, f), Math.round(p.x) - 7, Math.round(p.y) - 17);
        if (this.state(id).lvl >= 3) Font.shadow(g, SPROUTS[id].name.split(' ')[0], Math.round(p.x) - 10, Math.round(p.y) - 28, '#c8f0cc');
      } });
    });
    if (m.id === 'lower') Object.keys(SPROUTS).forEach((id, i) => {
      const x = (14 + i * 6) * TILE + 8, y = 20 * TILE + Math.sin(Render.waterT + i) * 3;
      items.push({ y, draw: () => g.drawImage(Art.kept(id, Math.floor(Render.waterT * 2 + i) % 2), Math.round(x) - 7, Math.round(y) - 17) });
    });
    if (m.id === 'farm' && S.mail && S.mail.length) {
      const bob = Math.round(Math.sin(Render.waterT * 4) * 1.5);
      Font.draw(g, '!', 14 * TILE + 5, 9 * TILE - 30 + bob, '#2a1a10', 2); Font.draw(g, '!', 14 * TILE + 4, 9 * TILE - 31 + bob, '#7dd0ff', 2);
    }
  },
};

Object.assign(ACT_LABEL, { mail: 'Check mailbox', heart: 'Approach the Heart', remains: 'Look', rootsleeper: 'Look', memorial: 'Read the names', reedchest: 'Open chest' });

// Sgt. Varr keeps the peace either way, under a new title if the Crown falls.
Object.defineProperty(NPCS.odile, 'role', { get: () => (S && S.ending === 'expose' ? 'Warden of Mossbrook' : 'Crown Sergeant') });

// The gaol staff, the King's men and the levy all go when the Crown falls.
['corvin', 'mags', 'pip', 'brann', 'watch', 'patrolA', 'patrolB', 'thorne'].forEach(id => {
  const before = NPCS[id].gone;
  NPCS[id].gone = () => !!Memory.get('crown_fallen') || (before ? before() : false);
});
NPCS.wick.gone = () => !!Memory.get('wick_taken');

Object.assign(Actions, {
  mail() { Story.mail(); },
  heart() { Story.heart(); },
  remains() {
    if (Inv.count('joren_letter') || S.known.joren_letter) return UI.say(null, 'Your grandfather, held in the roots. His straw hat sits beside him. His face is peaceful.');
    Script.run([
      [null, 'Roots have grown over an old man sitting against the wall. You know the straw hat before you know the face.'],
      [null, 'His hands are folded over a letter, addressed to you.'],
      { do() { Inv.add('joren_letter', 1); Memory.deed('found_joren', 'Found your grandfather in the roots beneath the palace.', { gossip: true }); } },
    ], null);
  },
  rootsleeper(o) {
    const taken = o.who === 'bram' ? Memory.get('bram_taken') && !Memory.get('bram_rescued') : Memory.get('dell_to_king') && !Memory.get('dell_rescued');
    UI.say(null, taken ? `${NPCS[o.who].name}, held fast in the roots, breathing slowly. His lips move. He is saying names.` : 'An empty hollow in the roots, the shape of a person.');
  },
  memorial() {
    const kept = Object.keys(SPROUTS).map(id => SPROUTS[id].name).join(', ');
    UI.say(null, `A new stone, cut this spring. Every name from the Tithe Roll is on it, the drowned and the taken. ${kept}, Corin Tolley, and hundreds more. Someone has left bread on top of it.`);
  },
  reedchest() {
    if (Memory.get('reed_open')) return UI.say(null, 'An empty chest in Hanne Moss\'s house.');
    if (!Inv.count('relic_key')) return UI.say(null, 'A strongbox in a house on Reed Lane. It is locked, and the lock is old and fine. A key would open it.');
    Memory.flag('reed_open'); Inv.add('reed_locket', 1); S.gold += 1000; Sfx.play('quest');
    Memory.deed('reed_open', 'Opened the strongbox on Reed Lane with the key from the woods.');
    UI.say(null, 'The Reed Lane key turns at last. Inside: a dowry purse of 1000 gold, and a small locket.');
  },
});
