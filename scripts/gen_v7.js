// Demo 7 v8 (ROUND7, ROUND7B, ROUND8, ROUND9): Pokémon-style coach cards + Battle Arena. render({live}) returns the pieces so the live
// coaching-staff.html can be built from the same source (build_v217.js). Run directly to write demos/v7.html.
// Rules (owner 2026-10-22): energy gain = round number (1, 2, 3...), moves cost energy, 1-cost moves top out at
// 10 damage (15 for directors), 2-cost ~20, 3-cost ~30; Block / Dig / Timeout are 1-cost shields; COBO jerseys
// (black, teal, white) with the card number; sprites turn to face the opponent and spike.
// Round 7: every attack / block value is a multiple of 5; HP 80-110 (directors 120-140); a block is armed on
// your turn and triggers at the moment the opponent's ball arrives (animation at impact, hit negated up to the
// block value); hit bursts + more SFX; RYL comic-burst logo behind the ring and on the fieldhouse back wall;
// You Play mode (pick moves vs the AI) next to Auto Play; Battle Now button in the hero.
// Round 8: move names drawn from per-element pools (no two cards alike), directors have their own sets; 1-cost
// attacks are 10 (directors 15); HP by position (liberos / DS 110-120, middles 70-80, others 90-100); Super Dig and
// Big Block are 2-cost 25 shields; per-turn energy gain caps at 3 and Charge banks +3; sprites have black eyes, a
// winning dance, and only side-facing frames mirror on the right; You Play picks moves on the card itself (Charge
// button in the portrait) or on a 4-button pad beside the 16-bit court.
// Round 9: outsides, right sides and setters trade their 2-cost swing for a minor 1-cost shield (10); the ball
// lands on the floor on a scoring hit in 16-bit; Street-Fighter K.O. + Next Opponent overlay with a win-streak
// counter; pad: bigger labels, smaller buttons, opaque, Auto button; HUD bar shortened so 3-digit HP never
// overlaps; card names shrink to fit; every card has a RYL card back (tap / click a card to flip it, arena cards
// flip in from the back).
const fs = require('fs');
const path = require('path');
const OUT = __dirname + '/demos/';
const SITE = 'https://coloradoboom.com/';
const A = {
  '12 Colorado - Makayla': 't12-colorado', '13 Colorado - Zhu': 't13-colorado', '14 National - Tara': 't14-national',
  '14 Colorado - Kimberly': 't14-colorado-krise', '14 Colorado - Rob': 't14-colorado-rob', '14 Colorado - Janci': 't14-colorado-janci',
  '15 National - Tara': 't15-national-tucker', '15 National - Sidney': 't15-national-reese', '15 Colorado - Jae': 't15-colorado',
  '15 Regional - Adam': 't15-regional', '16 National - Damon': 't16-national', '16 Colorado - Zhu': 't16-colorado-zhu',
  '16 Colorado - Brian': 't16-colorado-peterson', '16 Regional - Will': 't16-regional', '17 National - Jawn': 't17-national', '17 Colorado - Will': 't17-colorado',
};
const POS = {
  'Makayla Clemons': 'Right Side', 'Zhu': 'Outside', 'Megan Daugherty': 'DS', 'Matt Jueng': 'Outside', 'Tara Tucker': 'Libero', 'Alicia Hall': 'Setter',
  'Kimberly Krise': 'Outside', 'Rudy Garcia': 'Outside', 'Rob Oschner': 'Right Side', 'Janci Ige': 'Libero', 'Dax Martin': 'Right Side',
  'Adam Ray': 'Middle', 'Sidney Reese': 'Right Side', 'Hanfei Li': 'Setter', 'Brian Peterson': 'Trainer', 'Jae Spain': 'Middle', 'Claire Kwok': 'Outside',
  'Damon Sichler': 'Setter', 'Randy Vang': 'Libero', 'Will Ly': 'Libero', 'Kyn Van': 'Right Side', 'Jawn Suzuki': 'Libero', 'Brian Xu': 'Middle',
  'Jamison Crowley': 'Trainer', 'Lena Cox': 'Trainer',
};
const REAL = new Set(['coach-kyn-van', 'coach-makayla-clemons', 'coach-tara-tucker', 'coach-tara-tucker-director', 'coach-jae-spain', 'coach-claire-kwok', 'coach-zhu', 'coach-will-ly', 'coach-jawn-suzuki', 'coach-kimberly-krise', 'coach-damon-sichler', 'coach-damon-sichler-director', 'coach-sidney-reese']);
const ELEM = { Outside: 'Fighter', Setter: 'Psychic', 'Right Side': 'Fire', Middle: 'Rock', Libero: 'Grass', DS: 'Wind', Trainer: 'Water', Director: 'Shiny', Dragon: 'Dragon' };
const WEAK = { Fighter: 'Psychic', Psychic: 'Wind', Wind: 'Rock', Rock: 'Water', Water: 'Grass', Grass: 'Fire', Fire: 'Water', Shiny: 'Shiny', Dragon: 'Shiny', Lightning: 'Rock' };
const RESIST = { Fighter: 'Rock', Psychic: 'Fighter', Wind: 'Grass', Rock: 'Fire', Water: 'Fire', Grass: 'Water', Fire: 'Grass', Shiny: 'Psychic', Dragon: 'Fire', Lightning: 'Wind' };
const ICON = { Fighter: '✊', Psychic: '◉', Fire: '🔥', Rock: '⬢', Grass: '✿', Wind: '≋', Water: '💧', Shiny: '✦', Dragon: '🐉', Lightning: '⚡' };
const TINT = { Fighter: '#ff8a3d', Psychic: '#d66cff', Fire: '#ff6a3d', Rock: '#c9a063', Grass: '#63d46a', Wind: '#8fd1f2', Water: '#4fb7f2', Shiny: '#E5B800', Dragon: '#7a5cff', Lightning: '#d7ff3a' };
// Kits (round 10). Each element plays differently: [names, cost, kind, pow, extra]. kind 'atk' | 'shield:<stops>' | 'heal'.
// extra: pierce (a tip that goes over a block), drain (takes the other side's banked energy).
const MOVES = {
  Fighter: [[['Hard Spike', 'Pipe Attack', 'Six-Pack Swing', 'Big Swing'], 3, 'atk', 35], [['Cross Hit', 'Angle Hit', 'Tool Swing', 'Line Shot'], 2, 'atk', 20], [['Roll Shot', 'Tip', 'Off-Speed', 'Dink'], 1, 'atk', 10, { pierce: 1 }]],
  Fire: [[['Slide Crush', 'Back-Row Bomb', 'Line Kill', 'Pin Hammer'], 3, 'atk', 40], [['Wipe Off', 'Tool Hit', 'Seam Shot', 'Push Shot'], 2, 'atk', 25], [['Tip Over', 'Dump', 'Soft Tip', 'Roll'], 1, 'atk', 10, { pierce: 1 }]],
  Psychic: [[['2-Ball', 'Back Set Trick', 'Quick Fake', 'Shoot Set'], 3, 'atk', 35], [['Setter Dump', 'Second Touch', 'Quick One', 'Push'], 2, 'atk', 20, { drain: 1 }], [['Setter Block', 'Cover', 'Pancake', 'Hand Block'], 1, 'shield:15']],
  Rock: [[['Net Crush', 'Slide Hammer', 'Quick Smash', 'Hard Spike'], 3, 'atk', 40], [['Attack Block', 'Stuff Block', 'Roof', 'Wall Up'], 2, 'shield:30', 0, { counter: 10 }], [['Joust', 'Quick One', 'Soft Block Tip', 'Quick Push'], 1, 'atk', 10]],
  Grass: [[['Free Corner Ball', 'Chase Down', 'Deep Serve', 'Pancake Rally'], 3, 'atk', 30], [['Super Dig'], 2, 'shield:35'], [['Float Serve', 'Short Serve', 'Jump Float', 'Pass Up'], 1, 'atk', 10]],
  Wind: [[['Top Spin Serve', 'Serve Ace', 'Deep Float', 'Jump Serve'], 2, 'atk', 25], [['Chase Tip', 'Roll Shot', 'Quick Pass', 'Back Row Bump'], 1, 'atk', 15, { pierce: 1 }], [['Platform Dig', 'Dig', 'Cover', 'Pancake'], 1, 'shield:15']],
  Water: [[['Max Rep', 'Burnout Set', 'Box Jump Bomb', 'Sprint Finish'], 4, 'atk', 50], [['Foam Roll', 'Stretch Out', 'Water Break', 'Ice Bath'], 2, 'heal', 15], [['Jump Rope', 'Ladder Drill', 'Band Pull', 'Wall Sit'], 1, 'atk', 10]],
};
const DIRECTOR = {
  'Tara Tucker': { moves: [['Rotation Reset', 3, 'atk', 35], ['Yellow Card', 2, 'atk', 20, { drain: 1 }], ['Timeout', 1, 'shield:20']], flavor: 'Sets the schedule the whole club runs on. Holds the yellow card.' },
  'Damon Sichler': { moves: [['Schedule Shuffle', 3, 'atk', 35], ['Benched', 2, 'atk', 20, { drain: 1 }], ['Challenge Flag', 1, 'shield:20']], flavor: 'Books the gym, orders the uniforms, still runs the drill.' },
};
// Kula, the dragon boss that drops in after a three-fight streak. Scales take 10 off every hit; Kong Block stops a whole turn.
const KULA = { n: 'Kula', frame: 'dragon', r: 'Dragon Boss', team: 'The Pit', id: 'kula', director: false, head: false, no: 0, boss: true,
  s: { frame: 'dragon', el: 'Dragon', pos: 'Dragon', hp: 80, atk: 90, def: 90, spd: 1, scales: 1, slow: 1, jersey: 'black', seed: 7,
    moves: [{ name: 'GigaSpike', cost: 3, kind: 'atk', pow: 35 }, { name: 'Headbutt', cost: 2, kind: 'atk', pow: 15, drain: 2 }, { name: 'Kong Block', cost: 2, kind: 'shield:all', pow: 0 }],
    weak: 'Mortals Who Charge', flavor: 'YOU FACE ME NOW MORTAL! Every hit glances off the scales. Slow to wake: one energy a turn.' } };
// Guests: anime fighters and the Karasuno squad. They never sit in the staff grid or the Boomdex; they turn up at random as
// the Away card (GUEST_RATE in the page script). gi = the 16-bit figure's colours (hair, skin, top, trim, shorts, socks, shoes).
// Saitama has no moves: every hit does nothing, and on his third turn he throws the Serious Punch.
let TUNE = {}; try { TUNE = JSON.parse(fs.readFileSync(__dirname + '/balance-tune.json', 'utf8')); } catch (e) { TUNE = {}; }
const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
const GUEST_DEFS = [
  { n: 'Goku', frame: 'ki', entry: 'flash', exit: 'flash', r: 'Saiyan Raised on Earth', team: 'Dragon Ball', el: 'Lightning', hp: 90, spd: 80, gi: { H: '#111111', S: '#f0c8a0', J: '#ff7a1f', D: '#1e5fb8', K: '#ff7a1f', N: '#1e5fb8', E: '#1e5fb8' },
    moves: [['Kamehameha', 3, 'atk', 40], ['Dragon Fist', 2, 'atk', 25], ['Instant Transmission', 1, 'shield:15']], weak: 'Needles', flavor: 'Ka... me... ha... me... HA! Fights anyone, anywhere, mostly for fun.' },
  { n: 'Goku Black', frame: 'rose', entry: 'float', exit: 'float', r: 'Zamasu in a Saiyan Body', team: 'Dragon Ball Super', el: 'Lightning', holo: true, hp: 90, spd: 82, gi: { H: '#111111', S: '#f0c8a0', J: '#2a2a33', D: '#d0334a', K: '#2a2a33', N: '#d0334a', E: '#111111' },
    moves: [['Black Kamehameha', 3, 'atk', 40], ['Divine Lasso', 2, 'atk', 20, { drain: 1 }], ['Ki Barrier', 1, 'shield:15']], weak: 'Mortals Who Dodge', flavor: 'Rosé. Judges every mortal on the court and finds them lacking.' },
  { n: 'Gojo', frame: 'void', entry: 'walk', exit: 'flash', r: 'The Strongest Sorcerer', team: 'Jujutsu Kaisen', el: 'Lightning', hp: 85, spd: 88, gi: { H: '#f2f2f2', S: '#f0c8a0', J: '#161616', D: '#161616', K: '#161616', N: '#161616', E: '#161616', W: '#000000' },
    moves: [['Hollow Purple', 3, 'atk', 45], ['Infinity', 2, 'shield:30'], ['Cursed Technique: Blue', 1, 'atk', 15, { pierce: 1 }]], weak: 'Kikufuku Shortages', flavor: 'Blindfold on. Nothing touches him; Infinity sits between the ball and his hands.' },
  { n: 'Akuma', frame: 'demon', entry: 'drop', exit: 'dash', r: 'Master of the Fist', team: 'Street Fighter', el: 'Lightning', hp: 80, spd: 70, gi: { H: '#d0334a', S: '#c08260', J: '#1a1a1a', D: '#1a1a1a', K: '#1a1a1a', N: '#f2f2f2', E: '#2a2a2a' },
    moves: [['Shun Goku Satsu', 3, 'atk', 45], ['Gohadoken', 2, 'atk', 20], ['Ashura Senku', 1, 'shield:15']], weak: 'Mercy', flavor: 'The Raging Demon. The kanji on his back means the point is over.' },
  { n: 'Scorpion', frame: 'hell', entry: 'fire', exit: 'fire', r: 'Netherrealm Ninja', team: 'Mortal Kombat', el: 'Lightning', hp: 85, spd: 76, gi: { H: '#f2c200', S: '#e4b48d', J: '#f2c200', D: '#161616', K: '#161616', N: '#f2c200', E: '#161616', W: '#f2f2f2' },
    moves: [['Hellfire', 3, 'atk', 35], ['Spear: Get Over Here', 2, 'atk', 20, { drain: 1 }], ['Teleport Punch', 1, 'atk', 10, { pierce: 1 }]], weak: 'Sub-Zero', flavor: 'GET OVER HERE! The spear pulls the ball, and your energy, to his side.' },
  { n: 'Yuji', frame: 'curse', entry: 'run', exit: 'run', r: 'Vessel of Sukuna', team: 'Jujutsu Kaisen', el: 'Lightning', hp: 95, spd: 78, gi: { H: '#d98c7a', S: '#f0c8a0', J: '#161616', D: '#d0334a', K: '#161616', N: '#f2f2f2', E: '#f2f2f2' },
    moves: [['Divergent Fist', 3, 'atk', 35], ['Black Flash', 2, 'atk', 30], ['Manji Kick', 1, 'atk', 10, { pierce: 1 }]], weak: 'Movie Recommendations', flavor: 'Hits twice: the punch, then the cursed energy a beat later.' },
  { n: 'Saitama', frame: 'hero', entry: 'saitama', exit: 'walk', r: 'Hero for Fun', team: 'One-Punch Man', el: 'Lightning', hp: 100, spd: 1, saitama: 1, invuln: 1, gi: { H: '#f6dcc4', S: '#f6dcc4', J: '#f2c200', D: '#f2c200', K: '#f2c200', N: '#d7262b', E: '#d7262b' },
    moves: [['Serious Punch', 0, 'atk', 999], ['(nothing)', 0, 'shield:all'], ['OK.', 0, 'shield:all']], weak: 'Grocery Sales', flavor: 'OK. Takes no damage, takes no notice, then takes you off the court.' },
  { n: 'Tanjiro', frame: 'sun', entry: 'run', exit: 'run', r: 'Demon Slayer Corps', team: 'Demon Slayer', el: 'Fire', hp: 85, spd: 76, gi: { H: '#7a2a3a', S: '#f0c8a0', J: '#1f6f4f', D: '#161616', K: '#161616', N: '#f2f2f2', E: '#d0334a' },
    moves: [['Water Breathing: Tenth Form', 3, 'atk', 40], ['Hinokami Kagura', 2, 'atk', 25], ['Total Concentration', 1, 'shield:15']], weak: 'His Sister Being Insulted', flavor: 'Water Surface Slash. Smells the ball coming before the setter touches it.' },
  /* Karasuno */
  { n: 'Hinata', frame: 'crow', happy: 1, entry: 'jump', exit: 'run', r: 'Karasuno #10 · Middle', team: 'Haikyu!!', el: 'Fighter', hp: 85, spd: 92, gi: { H: '#ff7a1f', S: '#f0c8a0', J: '#161616', D: '#ff7a1f', K: '#161616', N: '#f2f2f2', E: '#f2f2f2' },
    moves: [['Minus-Tempo Quick', 3, 'atk', 35], ['Freak Quick', 2, 'atk', 25], ['Wide Broad', 1, 'atk', 10, { pierce: 1 }]], weak: 'Bus Rides', flavor: 'Eyes closed, arm up, the ball is already there.' },
  { n: 'Kageyama', frame: 'king', entry: 'walk', exit: 'walk', r: 'Karasuno #9 · Setter', team: 'Haikyu!!', el: 'Psychic', hp: 85, spd: 84, gi: { H: '#111111', S: '#f0c8a0', J: '#161616', D: '#ff7a1f', K: '#161616', N: '#f2f2f2', E: '#f2f2f2' },
    moves: [["King's Toss", 3, 'atk', 30], ['Pinpoint Set', 2, 'atk', 15, { drain: 1 }], ['Setter Block', 1, 'shield:15']], weak: 'Being Called King', flavor: 'The set lands where the hitter will be, not where he is.' },
  { n: 'Tsukishima', frame: 'moon', entry: 'walk', exit: 'walk', r: 'Karasuno #11 · Middle', team: 'Haikyu!!', el: 'Rock', hp: 70, spd: 66, gi: { H: '#e8d57a', S: '#f0c8a0', J: '#161616', D: '#ff7a1f', K: '#161616', N: '#f2f2f2', E: '#f2f2f2' },
    moves: [['Delayed Spike', 3, 'atk', 35], ['Read Block', 2, 'shield:30'], ['Soft Block Tip', 1, 'atk', 10]], weak: 'Enthusiasm', flavor: 'Reads the setter, waits, then puts a hand exactly where the ball goes.' },
];
const GUESTS = GUEST_DEFS.map(d => {
  const id = 'guest-' + d.n.toLowerCase().replace(/[^a-z]+/g, '-'); const tune = TUNE[id] || {};
  const moves = d.moves.map(([name, cost, kind, pow, extra], i) => Object.assign({ name, cost, kind, pow: kind === 'atk' ? Math.max(5, pow + ((tune.pow || {})[i] || 0)) : 0 }, extra || {}));
  const s = { el: d.el, pos: 'Guest', hp: d.hp + (tune.hp || 0), atk: 70, def: 65, spd: d.spd + (tune.spd || 0), moves, weak: d.weak, flavor: d.flavor, seed: hash(d.n), jersey: 'black', gi: d.gi, entry: d.entry, exit: d.exit, happy: d.happy, frame: d.frame };
  if (d.saitama) { s.saitama = 1; s.invuln = 1; }
  return { n: d.n, r: d.r, team: d.team, id, s, director: false, head: false, no: 0, guest: true, holo: !!d.holo };
});
const HPB = { Fighter: [75, 85], Fire: [65, 75], Psychic: [75, 85], Rock: [55, 65], Grass: [90, 100], Wind: [85, 95], Water: [75, 85], Shiny: [105, 120], Lightning: [80, 90] };
// per-card tuning from the balance simulator (balance-sim.js writes it); hp / pow deltas in multiples of 5
let PHOTO_PAL = {}; try { PHOTO_PAL = JSON.parse(fs.readFileSync(__dirname + '/photo-palette.json', 'utf8')); } catch (e) { PHOTO_PAL = {}; }
const PERSONAL = { 'Damon Sichler': 'Tara', 'Tara Tucker': 'Bad Teammates', 'Will Ly': 'Bad Footwear', 'Matt Jueng': 'Bad Korean Food', 'Zhu': 'Early Mornings', 'Alicia Hall': 'HR', 'Rob Oschner': 'Overhead Press', 'Sidney Reese': 'Seafood', 'Brian Peterson': 'Gas Prices' };
const WPOOL = ['Serve Receive', 'Not Calling Timeout', 'Line Judges', 'Net Violations', '6 AM Practice', 'Tournament Parking', 'Cold Gyms', 'Rotation Errors', 'Bad Refs', 'Shanked Passes', 'Libero Tracking Sheets', 'Hotel Breakfast', 'Ball Carts With One Bad Wheel', 'Day Three of a Qualifier'];
const FLAVOR = {
  Fighter: ['Six rotations, zero fear. Swings away on every out-of-system ball.', 'Terminates in transition. Loves a high ball and a tight block.', 'Back-row attack cleared. Pipe is always on.',
    'Passes a 2.4 and still wants the ball on the next swing.', 'Hits line until you take it away, then hits line anyway.', 'Lives in the left front and rents out the back row.',
    'Has never seen a seam it did not want to hit.', 'Four-step approach, one-step decision.'],
  Fire: ['Lives on the right pin. Crushes the slide and the tool.', 'Blocks the opposing outside, then hits over the double.', 'Opposite by trade, hitter by heart.',
    'Lefty-tempo swing from the right side. Keeps setters honest.', 'Turns a tight set into a tool off the block every single time.', 'Red zone specialist. Closes the match with a kill, not a tip.',
    'Hits the angle, then the line, then the angle again. Nobody adjusts in time.', 'Two blockers, one swing, floor.'],
  Psychic: ['Runs the offense like a point guard. Dumps when you least expect it.', 'Reads the block before the pass lands. Second touch, every rally.', 'Quiet hands, loud decisions.',
    'Knows where the ball is going before the passer does.', 'Sets a 1 off a 1-pass and smiles about it.', 'Calls the play, runs the play, takes none of the credit.',
    'The middle thinks it was their idea. It never is.', 'A footwork clinic in a 10-foot box.'],
  Rock: ['Closes the block and owns the net. Nothing gets through the middle.', 'Quick-tempo terror. One step, one swing, floor.', 'Reads the setter like a book, then slams it shut.',
    'Blocks the outside, then the opposite, then the outside again. Still not tired.', 'Three touches of the net per practice. Zero in matches.', 'Jumps on the setter\'s hands and lands on the ball.',
    'Takes away the line like it was never there.', 'Nobody runs a slide against this card twice.'],
  Grass: ['Pancakes, platforms and a perfect pass. The floor is lava for the ball.', 'First to every ball. Serve receive starts here.', 'Dives first, asks later. Jersey is a different color for a reason.',
    'Digs the hardest swing in the gym and calls it a free ball.', 'Reads the hitter\'s shoulder, not the ball.', 'Passing a 3.0 on a Tuesday and a 3.0 on a Sunday.',
    'Covers more floor than the custodian.', 'Platform never breaks. Neither does the rotation.'],
  Wind: ['In for the back row, out before you notice. Pure defense.', 'Chases down tips and reads the roll shot every time.', 'Serves tough, passes nails, rotates out smiling.',
    'The scoreboard never shows how many points this card saved.', 'Takes serve receive so the hitters can hit.', 'Reads the tip from the setter\'s eyes.',
    'Short serve, deep serve, same spot on the floor every time.', 'Quiet on the bench, loud on the floor.'],
  Water: ['Builds the engine the whole roster runs on.', 'Reps, mobility, recovery. Every athlete leaves stronger.', 'Keeps the team moving, strong and loose.',
    'Turns a vertical into a bigger vertical.', 'Hamstrings, hips, ankles. The boring stuff that wins in April.', 'Warm-up is the first drill, not the thing before the drill.',
    'Makes the third set feel like the first.', 'No cramps. No excuses. Lots of water.'],
  Shiny: ['Sets the schedule the whole club runs on. Holds the lineup card.', 'Runs the bench, the budget and the timeouts.', 'Answers every parent email before the second practice.',
    'Knows every kid\'s name, number and school by week two.', 'Books the gym, orders the uniforms, still runs the drill.', 'Somehow at every court at once.'],
};
const slug = n => 'coach-' + n.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
const esc = s => s.replace(/&/g, '&amp;');
function mk(n, r, team, opts = {}) {
  const pos = opts.director ? 'Director' : POS[n]; const el = ELEM[pos]; const h = hash(n + r);
  const id = slug(n) + (opts.director ? '-director' : '');
  const head = r.startsWith('Head');
  const hb = HPB[el]; const tune = TUNE[id] || {};
  const s = { el, pos, hp: hb[0] + (h >>> 3) % ((hb[1] - hb[0]) / 5 + 1) * 5 + (head ? 5 : 0) + (tune.hp || 0), atk: 50 + (h >>> 7) % 40, def: 45 + (h >>> 11) % 40, spd: 40 + (h >>> 15) % 50 + (tune.spd || 0),
    moves: (opts.director ? DIRECTOR[n].moves : MOVES[el]).map(([names, cost, kind, pow, extra], i) => {
      const name = Array.isArray(names) ? names[(h >>> (21 + i * 3)) % names.length] : names;
      const m = { name, cost, kind, pow: pow || 0 };
      if (kind === 'atk') m.pow = Math.max(5, (pow || 10) + (i === 0 ? ((h >>> 18) % 3 - 1) * 5 : 0) + ((tune.pow || {})[i] || 0));
      if (extra) Object.assign(m, extra);
      return m;
    }),
    weak: PERSONAL[n] || WPOOL[(h >>> 9) % WPOOL.length], flavor: opts.director ? DIRECTOR[n].flavor : FLAVOR[el][(h >>> 5) % FLAVOR[el].length], seed: h, jersey: ['black', 'teal', 'white'][(h >>> 13) % 3] };
  if (PHOTO_PAL[id]) s.pal = PHOTO_PAL[id];
  return { n, r, team, id, s, director: !!opts.director, head };
}
const BANDS = [
  { id: 'b1', title: '12U – 14U', bg: 'pat', groups: [
    { age: '12', teams: ['12 Colorado - Makayla'], people: [mk('Makayla Clemons', 'Head Coach', '12 Colorado')] },
    { age: '13 / 16', teams: ['13 Colorado - Zhu', '16 Colorado - Zhu'], people: [mk('Zhu', 'Head Coach', '13 & 16 Colorado'), mk('Megan Daugherty', 'Assistant Coach', '13 Colorado'), mk('Matt Jueng', 'Assistant Coach', '16 Colorado')] },
    { age: '14 / 15', teams: ['14 National - Tara', '15 National - Tara'], people: [mk('Tara Tucker', 'Head Coach', '14 & 15 National'), mk('Alicia Hall', 'Assistant Coach', '14 & 15 National')] },
    { age: '14', teams: ['14 Colorado - Kimberly'], people: [mk('Kimberly Krise', 'Head Coach', '14 Colorado'), mk('Rudy Garcia', 'Assistant Coach', '14 Colorado')] },
    { age: '14', teams: ['14 Colorado - Rob'], people: [mk('Rob Oschner', 'Head Coach', '14 Colorado')] },
    { age: '14', teams: ['14 Colorado - Janci'], people: [mk('Janci Ige', 'Head Coach', '14 Colorado'), mk('Dax Martin', 'Assistant Coach', '14 Colorado')] },
  ] },
  { id: 'b2', title: '15U – 16U', bg: 'teal', groups: [
    { age: '15', teams: ['15 Regional - Adam'], people: [mk('Adam Ray', 'Head Coach', '15 Regional')] },
    { age: '15', teams: ['15 National - Sidney'], people: [mk('Sidney Reese', 'Head Coach', '15 National'), mk('Hanfei Li', 'Assistant Coach', '15 National')] },
    { age: '16', teams: ['16 Colorado - Brian'], people: [mk('Brian Peterson', 'Head Coach', '16 Colorado')] },
    { age: '15', teams: ['15 Colorado - Jae'], people: [mk('Jae Spain', 'Head Coach', '15 Colorado'), mk('Claire Kwok', 'Assistant Coach', '15 Colorado')] },
    { age: '16', teams: ['16 National - Damon'], people: [mk('Damon Sichler', 'Head Coach', '16 National'), mk('Randy Vang', 'Assistant Coach', '16 National')] },
  ] },
  { id: 'b3', title: '16U – 17U', bg: 'pat', groups: [
    { age: '16 / 17', teams: ['16 Regional - Will', '17 Colorado - Will'], people: [mk('Will Ly', 'Head Coach', '16 Regional & 17 Colorado'), mk('Kyn Van', 'Assistant Coach', '16 Regional & 17 Colorado')] },
    { age: '17', teams: ['17 National - Jawn'], people: [mk('Jawn Suzuki', 'Head Coach', '17 National'), mk('Brian Xu', 'Assistant Coach', '17 National')] },
  ] },
];
const LEAD = [mk('Tara Tucker', 'Club Operations Director', 'Colorado Boom', { director: true }), mk('Damon Sichler', 'Assistant Club Director', 'Colorado Boom', { director: true })];
const TRAIN = [mk('Jamison Crowley', 'Strength & Conditioning', 'Gym Trainer'), mk('Lena Cox', 'Yoga, Mobility & Flexibility', 'Gym Trainer')];
const ALLP = [...LEAD, ...BANDS.flatMap(b => b.groups.flatMap(g => g.people)), ...TRAIN].map((p, i) => Object.assign(p, { no: i + 1 }));
const dots = n => '<i></i>'.repeat(n);
const rar = p => p.director ? '✦' : p.head ? '★' : p.r.startsWith('Assistant') ? '◆' : '●';

function render(o) {
  const IMG = o.img; // 'img/' for the demo, 'assets/img/coaches/' on the site
  const LOGO = o.live ? 'assets/img/logo.png' : 'img/logo.png';
  const CORE_SRC = fs.readFileSync(__dirname + '/battle-core.js', 'utf8').replace(/if \(typeof module[^\n]*\n?/, '');
  const CORE = require('./battle-core.js');
  const SPR32 = IMG + 'sprites32/', STG32 = IMG + 'stages32/', FX32 = IMG + 'fx32/';
  const SHEETS32 = JSON.parse(fs.readFileSync(__dirname + '/sheets32.json', 'utf8'));
  const teamHref = t => o.live ? `teams.html#${A[t]}` : `${SITE}teams.html#${A[t]}`;
  const tgt = o.live ? '' : ' target="_blank" rel="noopener"';
  const photoOf = p => REAL.has(p.id) ? IMG + 'cut/' + p.id + '.webp' : null;
  const portraitOf = p => p.guest && fs.existsSync(__dirname + '/../assets/img/coaches/sprites32/' + p.id + '-portrait.webp') ? SPR32 + p.id + '-portrait.webp' : null;
  const art = p => portraitOf(p) ? `<img class="por" src="${portraitOf(p)}" alt="${p.n}" width="480" height="280" loading="lazy">` : p.boss ? `<canvas class="spr boss" data-id="kula" width="120" height="96" role="img" aria-label="Kula the dragon"></canvas>` : photoOf(p) ? `<img src="${photoOf(p)}" alt="${p.n}, ${esc(p.r)}" width="480" height="520" loading="lazy">` : `<canvas class="spr" data-id="${p.id}" width="60" height="84" role="img" aria-label="${p.n}, ${esc(p.r)} (pixel sprite placeholder)"></canvas>`;
  const mval = m => m.kind === 'atk' ? m.pow : m.kind === 'heal' ? '<small>heals</small>' + m.pow : '<small>blocks</small>' + (m.kind.split(':')[1] === 'all' ? 'ALL' : m.kind.split(':')[1]);
  const mtag = m => m.pierce ? '<em class="tag">over block</em>' : m.drain ? '<em class="tag">' + (m.drain === 'all' ? 'drains all' : '-' + m.drain + ' en') + '</em>' : m.counter ? '<em class="tag">hits back ' + m.counter + '</em>' : '';
  const card = p => `
      <article class="card el-${p.s.el}${p.director || p.holo ? ' shiny' : ''}" id="${p.id}">
        <div class="ci">
          <header class="ch"><span class="stage">${esc(p.r)}</span><h4>${p.n}</h4><span class="hp"><b data-hp>${p.s.hp}</b> HP</span><span class="ty" title="${p.s.el} (${p.s.pos})">${ICON[p.s.el]}</span></header>
          <div class="ph">${art(p)}</div>
          <div class="meta"><span>${esc(p.team)}</span><span>${p.director ? 'Director' : p.boss ? 'Boss' : p.guest ? 'Guest &middot; ' + p.s.el : p.s.pos + ' &middot; ' + p.s.el}</span></div>
          <ul class="moves">${p.s.moves.map(m => `
            <li><span class="cost">${dots(m.cost)}</span><span class="mn">${m.name}${mtag(m)}</span><span class="dmg">${mval(m)}</span></li>`).join('')}
          </ul>
          <p class="flavor">${p.s.flavor}</p>
          <footer class="cfoot"><span><small>weak</small>${p.s.weak}</span><span><small>resist</small>${RESIST[p.s.el]}</span><span><small>retreat</small>${dots(1 + (p.s.def > 70 ? 1 : 0))}</span><span class="no">${p.boss ? 'BOSS' : p.guest ? 'GUEST' : String(p.no).padStart(2, '0') + '/' + ALLP.length} <em>${p.boss ? '🐉' : p.guest ? '★' : rar(p)}</em></span></footer>
        </div>
        <div class="cb" aria-hidden="true"><img src="${LOGO}" alt="" loading="lazy" width="372" height="240"><span>Colorado Boom</span><i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i></div>
      </article>`;
  const group = g => `
    <section class="grp span-${g.people.length}" id="g-${A[g.teams[0]]}">
      <header class="gh"><span class="age" aria-hidden="true">${g.age}</span><h3>${g.teams.map(t => `<a href="${teamHref(t)}"${tgt}>${t}</a>`).join('<span class="sep" aria-hidden="true">&middot;</span>')}</h3></header>
      <div class="tiles">${g.people.map(card).join('')}
      </div>
    </section>`;
  const CSS = `
:root{--teal:#0E7C86;--teal-dark:#065A62;--gold:#E5B800;--gold-dark:#C49A00;--black:#050505;--ink:#0d1f22;--ease:cubic-bezier(.23,1,.32,1);--max:1240px;--display:'Bebas Neue',Impact,sans-serif;--pixel:'Press Start 2P',monospace}
#tc,#tc *,#tc *::before,#tc *::after{box-sizing:border-box}
#tc{font-family:'Open Sans',system-ui,sans-serif;font-size:18px;line-height:1.6;color:#fff;background:var(--black);-webkit-font-smoothing:antialiased;overflow-x:hidden;margin:0}
#tc img{max-width:100%;height:auto;display:block}#tc a{color:inherit;text-decoration:none}
#tc h1,#tc h2,#tc h3{font-family:var(--display);font-weight:400;text-transform:uppercase;line-height:1;letter-spacing:.03em;text-wrap:balance;margin:0;color:#fff}
#tc .wrap{max-width:var(--max);margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
#tc .pat{background-color:var(--black);background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.035) 0 2px,transparent 2px 14px)}
#tc .teal{background:radial-gradient(ellipse 70% 120% at 50% 0%,var(--teal) 0%,var(--teal-dark) 70%,#043f45 100%)}
#tc .teald{background:radial-gradient(ellipse 60% 150% at 50% 50%,var(--teal) 0%,var(--teal-dark) 34%,#040404 100%)}
#tc .hero{position:relative;min-height:clamp(280px,36vw,460px);display:grid;align-items:end;overflow:hidden}
#tc .hero>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 40%;opacity:.5}
#tc .hero::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,var(--black) 0%,rgba(5,5,5,.5) 55%,rgba(5,5,5,.15) 100%)}
#tc .hero .wrap{position:relative;z-index:1;padding-block:28px}
#tc .hero .eyebrow{font-family:'Montserrat',sans-serif;font-weight:700;font-size:14px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold)}
#tc .hero h1{font-size:clamp(56px,8.5vw,112px);margin:4px 0 6px;color:#fff;text-shadow:3px 4px 0 #000,0 0 3px #000,-1px -1px 0 #000,0 12px 30px rgba(0,0,0,.75)}
#tc .hero .hbtns{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}#tc .hero .hero-btn{font-size:16px;padding:14px 32px}
#tc .hero p{max-width:680px;color:rgba(255,255,255,.94);font-size:17px;margin:0}
#tc .hero .hero-sub{margin-top:10px}
#tc section.band{padding-block:clamp(24px,3.5vw,40px)}
#tc .bt{display:flex;align-items:center;gap:14px;margin-bottom:16px}#tc .bt::before{content:"";width:10px;height:44px;background:var(--gold);flex:none}
#tc .bt h2{font-size:clamp(36px,4.8vw,54px)}#tc .bt .sub{font-family:'Montserrat',sans-serif;font-weight:700;font-size:13px;letter-spacing:.14em;text-transform:uppercase;margin-left:auto;color:var(--gold)}
#tc .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;align-items:start}
#tc .grp{min-width:0}#tc .span-1{grid-column:span 1}#tc .span-2{grid-column:span 2}#tc .span-3{grid-column:span 3}
#tc .tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:16px;align-items:stretch}
#tc .gh{display:flex;align-items:center;gap:10px;min-width:0;min-height:44px;margin-bottom:6px}
#tc .gh h3{font-family:'Montserrat',sans-serif;font-weight:700;font-size:14px;letter-spacing:.05em;line-height:1.3;min-width:0;text-transform:uppercase}
#tc .gh .sep{margin:0 8px;color:var(--gold)}#tc .gh a{text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--gold)}#tc .gh a:hover{color:var(--gold)}
#tc .gh .age{font-family:var(--display);font-size:32px;line-height:1;flex:none;color:var(--gold)}
#tc .card{container-type:inline-size;position:relative;min-width:0;display:flex;padding:7px;border-radius:12px;aspect-ratio:var(--cr,.62);scroll-margin-top:90px;transition:transform .25s var(--ease),box-shadow .25s var(--ease);box-shadow:0 10px 30px rgba(0,0,0,.6);background:linear-gradient(160deg,var(--f1) 0%,var(--f2) 28%,var(--f3) 50%,var(--f2) 72%,var(--f1) 100%)}
#tc .el-Fighter{--f1:#ff9a4d;--f2:#b3410f;--f3:#ffd1a6;--tint:#ff8a3d}
#tc .el-Psychic{--f1:#ff7ae0;--f2:#6d1fb8;--f3:#f3c9ff;--tint:#d66cff}
#tc .el-Fire{--f1:#ff5a36;--f2:#b51d05;--f3:#ffc46b;--tint:#ff6a3d}
#tc .el-Rock{--f1:#d9b27c;--f2:#6e4f22;--f3:#f6e4c4;--tint:#c9a063}
#tc .el-Grass{--f1:#7ee081;--f2:#166e2d;--f3:#d4ffd6;--tint:#63d46a}
#tc .el-Wind{--f1:#cfefff;--f2:#3f8fbf;--f3:#ffffff;--tint:#8fd1f2}
#tc .el-Water{--f1:#5ec8ff;--f2:#0b4f8f;--f3:#c9eeff;--tint:#4fb7f2}
#tc .el-Dragon{--f1:#9d7bff;--f2:#2a1455;--f3:#e0d6ff;--tint:#7a5cff}
#tc .el-Lightning{--f1:#e4ff5a;--f2:#3f5200;--f3:#ffffe0;--tint:#d7ff3a}
#tc .card.shiny{--tint:#fff;background:conic-gradient(from var(--ang,0deg),#ff5a5a,#ffd36b,#7dff8a,#5ad7ff,#8f7bff,#ff6bd6,#ff5a5a);animation:holo 6s linear infinite}
@property --ang{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes holo{to{--ang:360deg}}
#tc .card.shiny .ph::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(120deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.35) 35%,rgba(120,220,255,.35) 50%,rgba(255,120,220,.3) 65%,rgba(255,255,255,0) 100%);background-size:250% 250%;mix-blend-mode:screen;animation:sheen 4s ease-in-out infinite alternate;pointer-events:none}
@keyframes sheen{from{background-position:0% 0%}to{background-position:100% 100%}}
#tc .card:target,#tc .card.is-hit{outline:3px solid var(--gold);outline-offset:4px}
#tc .ci{flex:1;min-width:0;border-radius:7px;background:var(--ink);display:grid;grid-template-rows:auto auto auto auto 1fr auto;overflow:hidden;color:#fff;backface-visibility:hidden}
/* card back: the club logo on black pinstripe, teal inner field, gold frame + corner brackets; .flipped turns the card over */
#tc .cb{position:absolute;inset:0;border-radius:12px;visibility:hidden;transition:visibility 0s .22s;transform:scaleX(-1);background:#070707 repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0 2px,transparent 2px 12px);display:grid;place-items:center;overflow:hidden;box-shadow:inset 0 0 0 7px var(--gold),inset 0 0 0 9px #000}
#tc .cb::before{content:"";position:absolute;inset:14px;border:2px solid var(--gold);border-radius:6px;background:radial-gradient(ellipse 80% 60% at 50% 50%,rgba(14,124,134,.55) 0%,rgba(6,90,98,.35) 45%,rgba(0,0,0,0) 75%)}
#tc .cb::after{content:"";position:absolute;inset:22px;border:1px solid rgba(229,184,0,.45);border-radius:4px;background:repeating-linear-gradient(-45deg,rgba(255,255,255,.04) 0 1px,transparent 1px 9px)}
#tc .cb img{position:relative;z-index:1;width:74%;height:auto;filter:drop-shadow(0 6px 10px rgba(0,0,0,.85)) drop-shadow(0 0 14px rgba(229,184,0,.25))}
#tc .cb span{position:absolute;z-index:1;bottom:17px;left:0;right:0;text-align:center;font-family:var(--display);font-size:max(11px,5.6cqw);letter-spacing:.24em;color:var(--gold);text-transform:uppercase}
#tc .cb .corner{position:absolute;z-index:1;width:16px;height:16px;border:3px solid var(--gold)}#tc .cb .tl{top:11px;left:11px;border-right:0;border-bottom:0}#tc .cb .tr{top:11px;right:11px;border-left:0;border-bottom:0}#tc .cb .bl{bottom:11px;left:11px;border-right:0;border-top:0}#tc .cb .br{bottom:11px;right:11px;border-left:0;border-top:0}
#tc .card.flipped{transform:scaleX(-1)!important}#tc .card.flipped .cb{visibility:visible}#tc .ci{transition:visibility 0s .22s}#tc .card.flipped .ci{visibility:hidden}/* 2-D squash flip: cheaper than a 3-D turn on a page with 28 cards; the faces swap by visibility at the half turn */#tc .card.flipped .ph::after{display:none}#tc .fighter .card{transition:transform .45s cubic-bezier(.4,0,.2,1),box-shadow .25s var(--ease)}
#tc .tiles .card,#tc .lead-grid .card,#tc .train-grid .card{cursor:pointer}#tc .card.turning{will-change:transform}#tc .card.turning.shiny{animation:none}#tc .card.turning .ph::before{animation:none}
#tc .ch{display:grid;grid-template-columns:1fr auto auto;grid-template-areas:"stage stage stage" "name hp ty";align-items:center;column-gap:2.2cqw;padding:1.6cqw 3cqw 1.2cqw;background:linear-gradient(90deg,color-mix(in srgb,var(--tint) 28%,transparent),transparent)}
#tc .ch .stage{grid-area:stage;font-family:'Montserrat',sans-serif;font-weight:700;font-size:max(8px,3.6cqw);letter-spacing:.14em;text-transform:uppercase;color:var(--gold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#tc .ch h4{grid-area:name;font-family:var(--display);font-weight:400;font-size:max(15px,7.4cqw);line-height:1;letter-spacing:.01em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0;color:#fff}
#tc .ch .hp{grid-area:hp;font-family:'Montserrat',sans-serif;font-weight:900;font-size:max(9px,3.8cqw);letter-spacing:.04em;white-space:nowrap}#tc .ch .hp b{font-size:max(12px,5.6cqw);color:#ff5a4e}
#tc .ch .ty{grid-area:ty;width:max(20px,8.6cqw);height:max(20px,8.6cqw);border-radius:50%;display:grid;place-items:center;font-size:max(12px,5.2cqw);font-weight:900;line-height:1;color:#000;background:var(--tint);box-shadow:0 0 0 2px #fff,0 0 0 3.5px rgba(0,0,0,.7)}
#tc .card.shiny .ch .ty{background:#000;color:#fff;box-shadow:0 0 0 2px var(--gold),0 0 0 3.5px rgba(0,0,0,.7)}
#tc .ph{position:relative;margin:1cqw 3cqw 0;aspect-ratio:1.42;border:2px solid color-mix(in srgb,var(--tint) 60%,#fff 0%);overflow:hidden;min-height:0;background:repeating-conic-gradient(from 0deg at 50% 68%,rgba(255,255,255,.13) 0 5deg,transparent 5deg 15deg),radial-gradient(ellipse 70% 80% at 50% 70%,color-mix(in srgb,var(--tint) 65%,#fff) 0%,var(--tint) 40%,color-mix(in srgb,var(--tint) 45%,#000) 100%)}
#tc .card.shiny .ph{background:repeating-conic-gradient(from 0deg at 50% 68%,rgba(255,255,255,.18) 0 5deg,transparent 5deg 15deg),radial-gradient(ellipse 70% 80% at 50% 70%,#fff2b8 0%,var(--gold) 40%,#6b5400 100%)}
#tc .el-Dragon .ph{background:repeating-conic-gradient(from 0deg at 50% 68%,rgba(255,255,255,.1) 0 5deg,transparent 5deg 15deg),radial-gradient(ellipse 70% 80% at 50% 70%,#2a1455 0%,#120726 60%,#000 100%)}
#tc .ph img{position:absolute;left:0;bottom:0;width:100%;height:96%;object-fit:contain;object-position:50% 100%;}#tc .ph img.por{height:100%;object-fit:cover;object-position:50% 20%;filter:drop-shadow(0 5px 6px rgba(0,0,0,.5))}
#tc .ph canvas.spr{position:absolute;left:50%;bottom:4%;height:88%;width:auto;transform:translateX(-50%);image-rendering:pixelated;filter:drop-shadow(0 5px 6px rgba(0,0,0,.5))}
#tc .ph canvas.spr.boss{height:auto;width:90%;bottom:6%}
#tc .ph canvas.spr.flip{transform:translateX(-50%) scaleX(-1)}
#tc .ph::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.25) 50%,rgba(255,255,255,0) 70%);transform:translateX(-120%);transition:transform .7s var(--ease);pointer-events:none;z-index:2}
#tc .card:hover .ph::after{transform:translateX(120%)}
#tc .meta{margin:1.4cqw 3cqw 0;padding:.8cqw 2cqw;display:flex;justify-content:space-between;gap:6px;background:color-mix(in srgb,var(--tint) 16%,transparent);border:1px solid color-mix(in srgb,var(--tint) 40%,transparent);font-family:'Montserrat',sans-serif;font-weight:700;font-size:max(8.5px,3.4cqw);letter-spacing:.06em;text-transform:uppercase}
#tc .meta span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
#tc .moves{list-style:none;margin:1.4cqw 3cqw 0;padding:0;display:grid;gap:1px}
#tc .moves li{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:2.2cqw;font-family:'Montserrat',sans-serif;font-size:max(10.5px,4.6cqw);font-weight:700;padding:.6cqw 0;border-bottom:1px solid rgba(255,255,255,.08)}
#tc .cost{display:inline-flex;gap:3px}#tc .cost i,#tc .cfoot i{width:max(9px,3.8cqw);height:max(9px,3.8cqw);border-radius:50%;background:var(--tint);box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.45),0 0 0 1.5px rgba(255,255,255,.75);display:inline-block}
#tc .mn{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#tc .mn .tag{display:block;font-style:normal;font-size:max(7px,2.9cqw);letter-spacing:.08em;text-transform:uppercase;color:var(--tint);line-height:1.1}
#tc .dmg{font-family:var(--display);font-size:max(14px,6.4cqw);letter-spacing:.04em;white-space:nowrap}#tc .dmg small{font-family:'Montserrat',sans-serif;font-size:max(7px,2.8cqw);letter-spacing:.1em;text-transform:uppercase;margin-right:3px;color:#fff}
#tc .flavor{margin:1.2cqw 3cqw .6cqw;font-size:max(10px,4cqw);font-style:italic;line-height:1.35;color:rgba(255,255,255,.86);overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;align-self:center}
#tc .cfoot{display:grid;grid-template-columns:1.8fr .95fr .85fr auto;align-items:end;gap:1.8cqw;padding:1.2cqw 3cqw 1.8cqw;font-family:'Montserrat',sans-serif;font-weight:700;font-size:max(9.5px,3.7cqw);letter-spacing:.02em;border-top:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.35)}
#tc .cfoot span{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#tc .cfoot span:first-child{white-space:normal;line-height:1.15;overflow:visible}
#tc .cfoot small{display:block;font-size:max(7px,2.8cqw);letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.62)}
#tc .cfoot .no{color:var(--gold)}#tc .cfoot em{font-style:normal}#tc .cfoot i{width:max(6px,2.6cqw);height:max(6px,2.6cqw)}
#tc .lead-grid,#tc .train-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;max-width:600px;margin:0 auto}
#tc .cta{text-align:center;margin-top:18px}
#tc .btn{display:inline-block;font-family:'Montserrat',sans-serif;font-weight:700;font-size:15px;text-transform:uppercase;letter-spacing:.05em;padding:13px 26px;background:var(--gold);color:#000;border:0;border-radius:0;cursor:pointer;line-height:1.2;transition:transform .18s var(--ease),box-shadow .18s var(--ease)}
#tc .btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(229,184,0,.35)}#tc .btn:disabled{opacity:.5;cursor:default;transform:none;box-shadow:none}
#tc .btn-line{background:transparent;color:var(--gold);border:2px solid var(--gold)}
#tc .btn-tab{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.4);padding:10px 18px;font-size:13px}#tc .btn-tab[aria-pressed="true"]{background:#fff;color:#000;border-color:#fff}
/* ---- arena ---- */
#tc .arena{max-width:900px;margin:0 auto}
#tc .arena .row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;align-items:center;margin-bottom:14px}
#tc .pick{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:end;margin-bottom:14px}
#tc .pick label,#tc .pxopts label{display:block;font-family:'Montserrat',sans-serif;font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:5px}
#tc .pick select,#tc .pxopts select{width:100%;font:inherit;font-size:16px;padding:10px 12px;border:2px solid var(--gold);background:#000;color:#fff}
#tc .pick .vsm{font-family:var(--display);font-size:34px;color:var(--gold);padding-bottom:4px}
#tc .pxopts{display:inline-flex;gap:14px;align-items:end}#tc .pxopts[hidden]{display:none}#tc .pxopts label{display:inline-flex;align-items:center;gap:8px;margin:0}#tc .pxopts select{width:auto;font-size:14px;padding:7px 10px}
#tc .ring{position:relative;display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:start;min-height:380px;padding:18px 0;isolation:isolate}
#tc .ring::before{content:"";position:absolute;inset:0;background:url(${IMG}ryl-logo.webp) center/min(82%,640px) no-repeat;opacity:.16;pointer-events:none;z-index:0}
#tc .ring>*{position:relative;z-index:1}
#tc .ring .vs{font-family:var(--display);font-size:60px;color:var(--gold);text-align:center;align-self:center}
#tc .ring .empty{grid-column:1/-1;text-align:center;align-self:center;color:rgba(255,255,255,.8);font-size:16px;margin:0}
#tc .fighter{min-width:0}
#tc .fighter .card{max-width:320px;margin:0 auto}
#tc .fname{display:none;font-family:var(--display);font-size:26px;text-align:center;letter-spacing:.04em;margin-bottom:4px}
#tc .hpbar{height:10px;background:#333;margin:10px auto 0;max-width:320px;border:1px solid rgba(255,255,255,.25);overflow:hidden}
#tc .hpbar b{display:block;height:100%;background:#49d26a;width:100%;transition:width .5s var(--ease),background .3s}#tc .hpbar b.low{background:#ff5a4e}
#tc .hpnum{font-family:var(--display);font-size:22px;text-align:center;margin-top:4px}
#tc .en{display:flex;justify-content:center;gap:5px;margin-top:4px;align-items:center}#tc .en i{width:16px;height:9px;background:#333;border:1px solid rgba(255,255,255,.3);display:inline-block}#tc .en i.on{background:var(--gold);box-shadow:0 0 6px rgba(229,184,0,.8)}#tc .en small{font-family:'Montserrat',sans-serif;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-right:4px}
/* 16-bit view: the court replaces the two cards, the stat screen stays */
#tc .pxwrap{grid-column:1/-1;display:none;margin:0 auto 6px;width:100%;max-width:860px}
#tc .ring.px .pxwrap{display:block}#tc .ring.px .card,#tc .ring.px .vs{display:none}#tc .ring.px .fname{display:block}#tc .ring.px{grid-template-columns:1fr 1fr}
#tc #px.hd{image-rendering:auto}#tc #px{display:block;width:100%;aspect-ratio:16/10;image-rendering:pixelated;image-rendering:crisp-edges;border:3px solid #000;box-shadow:0 0 0 2px var(--gold),0 16px 40px rgba(0,0,0,.6);background:#0a3d43}
#tc .shield{position:absolute;inset:-10px;border-radius:40% 40% 30% 30%/50% 50% 20% 20%;background:radial-gradient(ellipse 60% 70% at 50% 80%,color-mix(in srgb,var(--tint) 55%,#fff) 0%,color-mix(in srgb,var(--tint) 45%,transparent) 40%,transparent 72%);filter:blur(2px);pointer-events:none;animation:shieldIn .4s var(--ease),aura .18s steps(2) infinite alternate;z-index:4}
@keyframes shieldIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}
#tc .vb{position:absolute;left:0;top:0;width:46px;height:46px;z-index:6;pointer-events:none;filter:drop-shadow(0 6px 6px rgba(0,0,0,.55))}
#tc .log{margin-top:12px;max-height:160px;overflow:auto;font-size:15px;line-height:1.5;border-top:1px solid rgba(255,255,255,.12);padding-top:8px;max-width:900px;margin-inline:auto}
#tc .log p{margin:0}#tc .log p b{color:var(--gold)}
#tc .played{text-align:center;font-family:'Montserrat',sans-serif;font-weight:700;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);margin:22px auto 0;max-width:900px}#tc .played b{display:block;font-family:var(--display);font-size:34px;letter-spacing:.04em;color:#fff;line-height:1.1;margin-top:2px}#tc .played small{display:block;font-size:10px;letter-spacing:.14em;color:rgba(255,255,255,.6);margin-top:4px}
#tc .winner{font-family:var(--display);font-size:clamp(30px,4vw,48px);color:var(--gold);text-align:center;margin:8px 0 0;min-height:1em}
#tc .lunge-l{animation:lungeL .55s var(--ease)}#tc .lunge-r{animation:lungeR .55s var(--ease)}
@keyframes lungeL{30%{transform:translateX(44px) rotate(3deg)}60%{transform:translateX(-8px)}100%{transform:none}}
@keyframes lungeR{30%{transform:translateX(-44px) rotate(-3deg)}60%{transform:translateX(8px)}100%{transform:none}}
#tc .hit{animation:hit .5s}@keyframes hit{0%,100%{filter:none;transform:none}20%{filter:brightness(2.2) saturate(0);transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
#tc .pop{position:absolute;left:50%;top:30%;transform:translateX(-50%);font-family:var(--display);font-size:48px;color:#ff5a4e;text-shadow:0 2px 0 #000,0 0 18px rgba(255,90,78,.7);animation:pop 1s var(--ease) forwards;pointer-events:none;z-index:5;white-space:nowrap}
#tc .pop.blk{color:#8fd1f2;text-shadow:0 2px 0 #000,0 0 18px rgba(143,209,242,.8);font-size:32px}
#tc .pop.chg{color:var(--gold);text-shadow:0 2px 0 #000,0 0 18px rgba(229,184,0,.8);font-size:30px}
#tc .pop.heal{color:#49d26a;text-shadow:0 2px 0 #000,0 0 18px rgba(73,210,106,.8)}
@keyframes pop{from{opacity:0;transform:translate(-50%,10px) scale(.6)}25%{opacity:1;transform:translate(-50%,-10px) scale(1.15)}to{opacity:0;transform:translate(-50%,-60px) scale(1)}}
#tc .ko{filter:grayscale(1) brightness(.5);transform:translateY(12px) scale(.96)!important;transition:filter .6s,transform .6s}/* no rotation: a rotated card in the left corner painted its right edge clipped after a fight (Chrome compositor), see round 9 */
#tc .champ{box-shadow:0 0 0 3px var(--gold),0 0 60px rgba(229,184,0,.7)!important;animation:champ 1.2s ease-in-out infinite alternate}
@keyframes champ{to{box-shadow:0 0 0 3px #fff,0 0 90px rgba(229,184,0,.95)}}
/* Charge: a Dragon Ball style aura flares around the whole card */
#tc .aura{position:absolute;inset:-18px -12px -10px;z-index:4;pointer-events:none;border-radius:40% 40% 30% 30%/50% 50% 20% 20%;background:radial-gradient(ellipse 60% 70% at 50% 80%,rgba(255,240,150,.75) 0%,rgba(255,190,40,.45) 40%,rgba(255,120,0,.15) 65%,transparent 80%);filter:blur(2px);animation:aura .14s steps(2) infinite alternate,auraUp .9s var(--ease)}
#tc .aura::before,#tc .aura::after{content:"";position:absolute;left:10%;right:10%;top:-8%;height:60%;border-radius:50% 50% 20% 20%;background:radial-gradient(ellipse 40% 90% at 50% 100%,rgba(255,255,255,.7),rgba(255,210,60,.35) 50%,transparent 75%);animation:flame .22s steps(3) infinite alternate}
#tc .aura::after{left:20%;right:20%;top:-22%;animation-delay:.08s;opacity:.7}
@keyframes aura{from{transform:scale(1) translateY(0)}to{transform:scale(1.05,1.1) translateY(-4px)}}
@keyframes auraUp{from{opacity:0;transform:scale(.6)}to{opacity:1}}
@keyframes flame{from{transform:scaleY(1) skewX(-4deg)}50%{transform:scaleY(1.25) skewX(5deg)}to{transform:scaleY(.9) skewX(-2deg)}}
/* You Play: the left card's move rows become buttons, Charge sits in the portrait; in 16-Bit View a 4-button pad */
#tc .card.pickable .moves li{transition:background .15s}#tc .card.pickable .moves li.can{cursor:pointer;background:rgba(229,184,0,.16);outline:2px solid var(--gold);outline-offset:-2px;animation:canPulse .9s ease-in-out infinite alternate}
#tc .card.pickable .moves li.no{opacity:.38}#tc .card.pickable .moves li.can:hover,#tc .card.pickable .moves li.can:focus-visible{background:var(--gold);color:#000;outline-color:#fff;animation:none}#tc .card.pickable .moves li.can:hover .dmg small,#tc .card.pickable .moves li.can:focus-visible .dmg small,#tc .card.pickable .moves li.can:hover .tag{color:#000}#tc .card.pickable .moves li.can:hover .cost i{background:#000}
@keyframes canPulse{from{background:rgba(229,184,0,.10)}to{background:rgba(229,184,0,.30)}}
#tc .chg{position:absolute;left:4px;bottom:4px;z-index:3;display:inline-flex;align-items:center;gap:4px;font-family:'Montserrat',sans-serif;font-weight:900;font-size:max(9px,3.4cqw);letter-spacing:.05em;text-transform:uppercase;padding:4px 7px;min-height:26px;background:#000;color:var(--gold);border:2px solid var(--gold);cursor:pointer;line-height:1}
#tc .chg b{font-family:var(--display);font-size:max(13px,5.4cqw);font-weight:400}#tc .chg:hover,#tc .chg:focus-visible{background:var(--gold);color:#000;outline:none}
#tc .turnlbl{position:absolute;top:-14px;left:50%;transform:translateX(-50%);z-index:5;background:var(--gold);color:#000;font-family:var(--display);font-size:18px;letter-spacing:.06em;padding:2px 12px;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.5);animation:turnPulse .7s ease-in-out infinite alternate}
@keyframes turnPulse{to{transform:translateX(-50%) translateY(-3px)}}
#tc .pxwrap{position:relative}
#tc .pad{position:absolute;left:10px;top:36%;transform:translateY(-50%);z-index:3;display:flex;align-items:center;gap:14px;background:#07090a;border:2px solid var(--gold);padding:10px 12px;font-family:var(--pixel);box-shadow:0 10px 30px rgba(0,0,0,.6)}#tc .pad[hidden]{display:none}
#tc .dia{position:relative;width:100px;height:100px;flex:none}
#tc .pb{position:absolute;width:34px;height:34px;border-radius:50%;border:3px solid #000;box-shadow:inset 0 -4px 0 rgba(0,0,0,.35),0 0 0 2px #fff;color:#000;font:10px var(--pixel);cursor:pointer;padding:0;line-height:1}
#tc .pb:active{transform:translateY(2px);box-shadow:inset 0 -2px 0 rgba(0,0,0,.35),0 0 0 2px #fff}#tc .pb:disabled{opacity:.3;cursor:default}#tc .pb:not(:disabled):hover,#tc .pb:focus-visible{box-shadow:inset 0 -5px 0 rgba(0,0,0,.35),0 0 0 3px var(--gold);outline:none}
#tc .pb-y{top:0;left:33px;background:#49d26a}#tc .pb-x{top:33px;left:0;background:#4fb7f2}#tc .pb-a{top:33px;left:66px;background:#ff5a4e}#tc .pb-b{top:66px;left:33px;background:#E5B800}
#tc .pauto{align-self:stretch;font:10px var(--pixel);padding:8px 10px;background:#000;color:var(--gold);border:2px solid var(--gold);cursor:pointer;writing-mode:vertical-rl;text-orientation:upright;letter-spacing:2px}#tc .pauto:hover,#tc .pauto:focus-visible{background:var(--gold);color:#000;outline:none}
#tc .pl{list-style:none;margin:0;padding:0;display:grid;gap:6px;font-size:12px;line-height:1.5;color:#fff}#tc .pl li{display:flex;align-items:center;gap:9px;min-height:30px;cursor:pointer;padding:2px 6px}#tc .pl li.no{opacity:.35;cursor:default}#tc .pl li:not(.no):hover{background:rgba(229,184,0,.25)}
#tc .pl i{width:12px;height:12px;border-radius:50%;border:2px solid #000;flex:none}#tc .pl i.y{background:#49d26a}#tc .pl i.x{background:#4fb7f2}#tc .pl i.a{background:#ff5a4e}#tc .pl i.b{background:#E5B800}#tc .pl b{color:var(--gold);font-weight:400}
#tc .pen{display:flex;align-items:center;gap:4px;font:9px var(--pixel);color:var(--gold);padding:6px 6px 0;border-top:1px solid rgba(255,255,255,.15);margin-top:4px}#tc .pen i{width:12px;height:7px;background:#333;border:1px solid rgba(255,255,255,.35)}#tc .pen i.on{background:var(--gold);box-shadow:0 0 5px rgba(229,184,0,.8)}
#tc .dex-btn.hide{display:none}
/* overlays over the ring: FIGHT button, big K.O., winner + streak + Next Opponent, boss text box */
#tc .ring .ov{position:absolute;left:0;right:0;top:42%;transform:translateY(-50%);z-index:8;display:grid;justify-items:center;gap:10px;pointer-events:none;text-align:center}
#tc .ring .ov[hidden]{display:none}
#tc .kobig{font-family:var(--display);font-size:clamp(96px,18vw,220px);line-height:.9;color:#ff5a4e;-webkit-text-stroke:3px #000;text-shadow:0 10px 0 #000,0 0 50px rgba(255,90,78,.9);animation:kobig .9s cubic-bezier(.2,1.4,.4,1) both}
#tc .kobig.win{color:var(--gold);font-size:clamp(64px,13vw,160px);text-shadow:0 10px 0 #000,0 0 60px rgba(229,184,0,.95)}
@keyframes kobig{from{opacity:0;transform:scale(3.2) rotate(-10deg)}55%{opacity:1;transform:scale(.92) rotate(2deg)}to{transform:scale(1)}}
#tc .ov .wname{font-family:var(--display);font-size:clamp(32px,5.5vw,60px);color:var(--gold);text-shadow:0 4px 0 #000,0 0 30px rgba(0,0,0,.95);animation:kobig .7s cubic-bezier(.2,1.4,.4,1) both}
#tc .ov .streak{font-family:'Montserrat',sans-serif;font-weight:900;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.8);padding:5px 14px;border:1px solid var(--gold)}
#tc .ov .btn{pointer-events:auto;font-size:18px;padding:16px 36px;box-shadow:0 12px 40px rgba(0,0,0,.8)}
#tc .ov .btn.big{font-family:var(--display);font-size:clamp(34px,5vw,54px);letter-spacing:.08em;padding:12px 48px;animation:fightPulse .8s ease-in-out infinite alternate}
@keyframes fightPulse{to{transform:scale(1.06);box-shadow:0 12px 50px rgba(229,184,0,.6)}}
#tc .fade{position:absolute;inset:0;z-index:7;background:#000;opacity:0;pointer-events:none;transition:opacity .9s ease}#tc .fade.on{opacity:1}#tc .fade.white{background:#fff;transition:none}
/* fighting-game intro banner: a skewed black band a third of the ring tall, the character's face and name slide in */
#tc .intro{position:absolute;left:0;right:0;top:33%;height:34%;z-index:9;display:flex;align-items:center;gap:4%;padding:0 6%;background:linear-gradient(100deg,#000 0 58%,var(--gold) 58% 60%,rgba(0,0,0,.86) 60%);transform:skewY(-3deg);box-shadow:0 10px 40px rgba(0,0,0,.7);animation:introIn .45s cubic-bezier(.2,1.2,.4,1) both;pointer-events:none}
#tc .intro.out{animation:introOut .35s ease-in both}
@keyframes introIn{from{transform:translateX(110%) skewY(-3deg)}to{transform:translateX(0) skewY(-3deg)}}
@keyframes introOut{to{transform:translateX(-110%) skewY(-3deg);opacity:0}}
#tc .intro .iface{width:22%;max-width:160px;aspect-ratio:1;background:#111 center/cover no-repeat;border:3px solid var(--gold);box-shadow:0 0 0 3px #000;flex:none;transform:skewY(3deg)}
#tc .intro .itext{color:#fff;font-family:var(--display);font-size:clamp(26px,6vw,64px);line-height:.95;text-shadow:3px 3px 0 #000;letter-spacing:.04em;min-width:0}
#tc .intro .itext small{display:block;font-family:'Montserrat',sans-serif;font-weight:700;font-size:clamp(9px,1.5vw,14px);letter-spacing:.2em;color:var(--gold);text-transform:uppercase;margin-top:6px}
#tc .intro .itext em{font-style:normal;color:var(--gold)}
/* banner frames: --fa accent, --fb ground, --pat an overlay pattern; one per character */
#tc .intro{--fa:var(--gold);--fb:#000;--pat:none;background:linear-gradient(100deg,var(--fb) 0 58%,var(--fa) 58% 60%,rgba(0,0,0,.86) 60%)}
#tc .intro::before{content:"";position:absolute;inset:0;background:var(--pat);opacity:.5;pointer-events:none;mix-blend-mode:screen}
#tc .intro .iface{border-color:var(--fa)}#tc .intro .itext em,#tc .intro .itext small{color:var(--fa)}
#tc .intro.f-ki{--fa:#ff9a1f;--fb:#1b1b5a;--pat:repeating-linear-gradient(-20deg,rgba(255,255,255,.14) 0 3px,transparent 3px 16px)}
#tc .intro.f-rose{--fa:#ff5fb0;--fb:#1a0b1f;--pat:radial-gradient(circle,rgba(255,120,200,.45) 1.5px,transparent 2px) 0 0/14px 14px}
#tc .intro.f-void{--fa:#6c8cff;--fb:#06061a;--pat:radial-gradient(ellipse at 70% 50%,rgba(170,80,255,.55),transparent 55%)}
#tc .intro.f-demon{--fa:#ff2a2a;--fb:#200000;--pat:repeating-linear-gradient(135deg,rgba(255,60,60,.25) 0 10px,transparent 10px 22px)}
#tc .intro.f-hell{--fa:#ffd400;--fb:#2a1200;--pat:linear-gradient(0deg,rgba(255,140,0,.5),transparent 60%)}
#tc .intro.f-curse{--fa:#ff4d79;--fb:#120008;--pat:repeating-linear-gradient(90deg,rgba(255,77,121,.18) 0 2px,transparent 2px 9px)}
#tc .intro.f-hero{--fa:#ffd400;--fb:#c81e1e;--pat:repeating-linear-gradient(45deg,rgba(255,255,255,.12) 0 14px,transparent 14px 28px)}
#tc .intro.f-sun{--fa:#ff8a1f;--fb:#2a0800;--pat:radial-gradient(circle at 80% 120%,rgba(255,120,30,.55),transparent 55%),repeating-linear-gradient(-15deg,rgba(255,200,80,.18) 0 3px,transparent 3px 14px)}
#tc .intro.f-water{--fa:#3fd8c8;--fb:#031a20;--pat:repeating-radial-gradient(circle at 20% 120%,rgba(63,216,200,.22) 0 6px,transparent 6px 18px)}
#tc .intro.f-crow{--fa:#ff7a1f;--fb:#111;--pat:repeating-linear-gradient(-30deg,rgba(255,122,31,.22) 0 4px,transparent 4px 20px)}
#tc .intro.f-king{--fa:#4f8cff;--fb:#06112a;--pat:linear-gradient(90deg,rgba(79,140,255,.35),transparent 50%)}
#tc .intro.f-moon{--fa:#f2e394;--fb:#1a1a14;--pat:radial-gradient(circle at 85% 30%,rgba(242,227,148,.5) 0 8%,transparent 9%)}
#tc .intro.f-dragon{--fa:#b388ff;--fb:#12062a;--pat:repeating-linear-gradient(60deg,rgba(179,136,255,.25) 0 2px,transparent 2px 12px,rgba(255,255,255,.15) 12px 13px,transparent 13px 30px)}
/* move call-outs: a comic tag on the mover's side */
#tc .callout{position:absolute;top:24%;z-index:9;max-width:40%;padding:3px 10px;font-family:var(--display);font-size:clamp(13px,2.4vw,22px);letter-spacing:.06em;color:#fff;background:rgba(0,0,0,.84);border:3px solid var(--gold);box-shadow:4px 4px 0 #000;text-shadow:2px 2px 0 #000;pointer-events:none;animation:coIn .18s cubic-bezier(.2,1.4,.4,1) both,coOut .25s ease-in 1s both;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#tc .callout.L{left:3%}#tc .callout.R{right:3%}#tc .callout.lo{top:58%}
#tc .ring.px:not(.hd) .callout{font-family:var(--pixel);font-size:clamp(7px,1.2vw,11px);letter-spacing:0;padding:6px 8px;border-width:2px;box-shadow:3px 3px 0 #000;text-shadow:none;border-radius:0}
#tc .ring.hd .callout{border-radius:6px;background:linear-gradient(180deg,rgba(20,20,20,.92),rgba(0,0,0,.88));box-shadow:0 6px 18px rgba(0,0,0,.6),inset 0 0 0 1px rgba(255,255,255,.08)}
#tc .ring:not(.px) .callout{top:8%}
#tc .callout.blk{border-color:#8fd1f2;color:#8fd1f2}#tc .callout.crit{border-color:#ff5a4e;color:#ffd36b}#tc .callout.cochg{color:var(--gold)}#tc .callout.heal{border-color:#49d26a;color:#49d26a}#tc .callout.drain{border-color:#c65cff;color:#e6b3ff}
@keyframes coIn{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}@keyframes coOut{to{opacity:0;transform:translateY(-14px)}}
#tc .tbox{position:absolute;left:4%;right:4%;bottom:6%;z-index:9;background:#000;color:#fff;border:4px double #fff;box-shadow:0 0 0 3px #000,0 14px 40px rgba(0,0,0,.8);padding:14px 18px;font:11px/1.9 var(--pixel);text-align:left;min-height:64px;cursor:pointer}
#tc .tbox b{color:var(--gold);font-weight:400;display:block;margin-bottom:4px}#tc .tbox::after{content:"\\25BC";position:absolute;right:12px;bottom:6px;font-size:9px;animation:turnPulse .5s ease-in-out infinite alternate}
#tc .blockup{animation:blockup .7s var(--ease)}@keyframes blockup{25%{transform:translateY(-30px) scale(1.03)}55%{transform:translateY(-26px) scale(1.03)}100%{transform:none}}
#tc .burst{position:absolute;left:50%;top:34%;width:180px;height:180px;margin:-90px 0 0 -90px;pointer-events:none;z-index:4;background:radial-gradient(circle,#fff 0 18%,#ffd36b 18% 40%,#ff5a4e 40% 70%,transparent 71%);clip-path:polygon(50% 0,58% 30%,85% 12%,70% 40%,100% 50%,70% 60%,85% 88%,58% 70%,50% 100%,42% 70%,15% 88%,30% 60%,0 50%,30% 40%,15% 12%,42% 30%);animation:burst .5s var(--ease) forwards;mix-blend-mode:screen}
#tc .burst.blk{background:radial-gradient(circle,#fff 0 22%,#8fd1f2 22% 55%,transparent 56%);clip-path:none;border-radius:50%;width:150px;height:150px;margin:-75px 0 0 -75px}
@keyframes burst{from{opacity:1;transform:scale(.15) rotate(0deg)}to{opacity:0;transform:scale(1.5) rotate(35deg)}}
/* boomdex */
#tc .dex-btn{position:fixed;${o.live ? 'left' : 'right'}:max(16px,env(safe-area-inset-${o.live ? 'left' : 'right'},0px));bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:60;display:inline-flex;align-items:center;gap:10px;background:#000;color:var(--gold);border:2px solid var(--gold);font-family:var(--display);font-size:22px;letter-spacing:.08em;text-transform:uppercase;padding:9px 16px;cursor:pointer;box-shadow:0 10px 26px rgba(0,0,0,.5)}
#tc .dex-btn .led{width:12px;height:12px;border-radius:50%;background:#49d26a;box-shadow:0 0 8px #49d26a}
#tc .dex-btn:hover,#tc .dex-btn:focus-visible{background:var(--gold);color:#000;outline:none}
#tc .dex{position:fixed;${o.live ? 'left' : 'right'}:max(16px,env(safe-area-inset-${o.live ? 'left' : 'right'},0px));bottom:calc(max(16px,env(safe-area-inset-bottom,0px)) + 58px);z-index:61;width:min(360px,calc(100vw - 32px));background:#0a1416;color:#fff;border:2px solid var(--gold);box-shadow:0 18px 44px rgba(0,0,0,.6);padding:14px 16px 16px}
#tc .dex[hidden]{display:none}
#tc .dex-h{display:flex;align-items:center;justify-content:space-between;font-family:var(--display);font-size:28px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px}
#tc .dex-x{font-size:28px;line-height:1;width:32px;height:32px;cursor:pointer;background:none;border:0;color:#fff}
#tc .dex label{display:block;font-family:'Montserrat',sans-serif;font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin:10px 0 4px}
#tc .dex select{width:100%;font:inherit;font-size:16px;padding:9px 10px;border:1px solid var(--gold);background:#000;color:#fff}
#tc .dex-note{font-size:13px;margin:10px 0 0}
#tc .bossbank{display:none}
/* narrow cards (two across on a phone): tighter header, smaller move rows, footer drops the retreat column so weak / resist never collide */
@container (max-width:210px){#tc .ch{column-gap:4px}#tc .ch .hp{font-size:8px}#tc .ch .hp b{font-size:11px}#tc .ch .ty{width:18px;height:18px;font-size:11px}#tc .moves li{font-size:10px;gap:5px}#tc .dmg{font-size:13px}#tc .cfoot{grid-template-columns:1.3fr 1fr auto;font-size:8.5px;gap:5px}#tc .cfoot span:nth-child(3){display:none}#tc .cfoot .no{font-size:9px}#tc .flavor{font-size:9.5px;-webkit-line-clamp:2}}
@media(max-width:1000px){#tc .grid{grid-template-columns:repeat(2,1fr)}#tc .span-3{grid-column:1/-1}#tc .tiles{grid-template-columns:repeat(auto-fit,minmax(170px,290px))}#tc .lead-grid,#tc .train-grid{grid-template-columns:repeat(2,minmax(0,290px));justify-content:center;max-width:none}}
@media(max-width:560px){#tc .grid{grid-template-columns:1fr}#tc .grp{grid-column:1/-1}#tc .tiles{grid-template-columns:repeat(2,1fr)}#tc .bt .sub{display:none}
  #tc .ring{grid-template-columns:1fr 1fr;gap:8px;padding:12px 0}#tc .ring .vs{display:none}#tc .fighter .card{max-width:100%}#tc .pick{grid-template-columns:1fr 1fr;gap:8px}#tc .pick .vsm{display:none}#tc .pick select{font-size:14px;padding:8px}#tc .ring.px{grid-template-columns:1fr 1fr}
  #tc .hero .hbtns{display:grid}#tc .hero .hero-btn{text-align:center}#tc .pxopts{flex-wrap:wrap;justify-content:center;width:100%}#tc .pxopts select{max-width:100%}#tc .pad{position:static;transform:none;margin-top:8px;width:100%;justify-content:flex-start}#tc .pl{font-size:10px}#tc .turnlbl{font-size:13px;top:-10px}
  #tc .pop{font-size:30px;top:26%}#tc .pop.blk,#tc .pop.chg{font-size:20px}#tc .burst{width:110px;height:110px;margin:-55px 0 0 -55px}#tc .hpnum{font-size:18px}#tc .fname{font-size:20px}#tc .en i{width:12px;height:8px}#tc .chg{font-size:9px;padding:3px 5px;min-height:22px}#tc .tbox{font-size:9px;padding:10px 12px;line-height:1.8}#tc .ov .btn.big{font-size:30px;padding:10px 30px}}
@media(max-width:400px){#tc .card{--cr:.7}#tc .tiles{grid-template-columns:1fr}#tc .lead-grid,#tc .train-grid{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){#tc *{transition:none!important;animation:none!important}}
`;
  const opts = ALLP.map(p => `<option value="${p.id}">${String(p.no).padStart(2, '0')} &middot; ${p.n} &mdash; ${esc(p.r)}</option>`).join('');
  const dexHtml = `
  <button type="button" class="dex-btn" id="dexBtn" aria-expanded="false" aria-controls="dex"><span class="led" aria-hidden="true"></span>Boomdex</button>
  <div class="dex" id="dex" hidden role="dialog" aria-label="Boomdex">
    <div class="dex-h"><span>Boomdex</span><button type="button" class="dex-x" id="dexX" aria-label="Close">&times;</button></div>
    <label for="selTeam">By team</label>
    <select id="selTeam"><option value="">Choose a team</option>${Object.entries(A).map(([t, a]) => `<option value="g-${a}">${t}</option>`).join('')}</select>
    <label for="selCoach">By name</label>
    <select id="selCoach"><option value="">Choose a card</option>${opts}</select>
    <button type="button" class="btn" id="dexBattle" style="width:100%;margin-top:14px">Battle Arena &darr;</button>
    <p class="dex-note">Team names on the cards open that team on Our Club Teams.</p>
  </div>`;
  const arenaHtml = `
<section class="band pat" id="arena"><div class="wrap">
  <div class="bt"><h2>Battle Arena</h2><span class="sub">Pick two cards or draw at random</span></div>
  <div class="arena">
    <div class="pick">
      <div><label for="selL">Home</label><select id="selL"><option value="">Choose a card</option>${opts}</select></div>
      <span class="vsm" aria-hidden="true">VS</span>
      <div><label for="selR">Away</label><select id="selR"><option value="">Choose a card</option>${opts}</select></div>
    </div>
    <div class="row"><button type="button" class="btn" id="btnRandom">Random Matchup</button><button type="button" class="btn btn-line" id="btnNext" disabled title="The winner stays in and fights a new random opponent right away">Next Fight</button><button type="button" class="btn btn-line" id="btnSound" aria-pressed="true">Sound: On</button></div>
    <div class="row"><button type="button" class="btn btn-tab" id="mAuto" aria-pressed="false">Auto Play</button><button type="button" class="btn btn-tab" id="mPlay" aria-pressed="true" title="You pick Home's move each turn; the AI plays Away. Switch any time: it takes effect at the next move.">You Play</button></div>
    <div class="row"><button type="button" class="btn btn-tab" id="vCard" aria-pressed="false">Card View</button><button type="button" class="btn btn-tab" id="vPx" aria-pressed="true">16-Bit View</button><button type="button" class="btn btn-tab" id="vHd" aria-pressed="false" title="Hand-drawn 32-bit stages and sprites (Tara, Damon, Will and Sidney have drawn sheets; the rest use their photo)">32-Bit View</button>
      <span class="pxopts" id="pxopts"><label>Ball <select id="selBall"><option value="classic">Classic White</option><option value="supertouch">Molten Super Touch</option><option value="flistatec">Molten Flistatec</option><option value="flincaa">Molten Flistatec NCAA</option><option value="boom">Boom Teal (custom)</option></select></label><label>Gym <select id="selGym"><option value="fieldhouse">Boomtown Fieldhouse</option><option value="arena">Championship Arena</option><option value="beach">Beach Night</option><option value="retro">Retro Gym</option></select></label></span></div>
    <div class="ring px" id="ring"><div class="pxwrap" id="pxwrap"><canvas id="px" width="320" height="200" role="img" aria-label="Pixel-art replay of the fight"></canvas>
      <div class="pad" id="pad" hidden role="group" aria-label="Your move">
        <div class="dia"><button type="button" class="pb pb-y" data-i="0" aria-label="Y: first move">Y</button><button type="button" class="pb pb-x" data-i="1" aria-label="X: second move">X</button><button type="button" class="pb pb-a" data-i="2" aria-label="A: third move">A</button><button type="button" class="pb pb-b" data-i="3" aria-label="B: Charge">B</button></div>
        <div><ul class="pl"><li data-i="0"><i class="y"></i><span></span></li><li data-i="1"><i class="x"></i><span></span></li><li data-i="2"><i class="a"></i><span></span></li><li data-i="3"><i class="b"></i><span>Charge <b>+${CORE.CHARGE}</b></span></li></ul><div class="pen" id="padEn" aria-label="Your energy">EN</div></div>
        <button type="button" class="pauto" id="padAuto" title="Let the AI play the rest of this fight">Auto</button>
      </div></div><p class="empty" id="ringEmpty">Pick two cards above, or press Random Matchup.</p>
      <div class="ov" id="fightOv" hidden><button type="button" class="btn big" id="btnFight">Fight!</button></div>
      <div class="ov" id="koOv" hidden aria-live="assertive"><div class="kobig" id="koTxt">K.O.</div></div>
      <div class="ov" id="nextOv" hidden><div class="wname" id="ovName"></div><div class="streak" id="ovStreak"></div><button type="button" class="btn" id="ovNext">Next Opponent &rarr;</button></div>
      <div class="fade" id="fade"></div></div>
    <p class="winner" id="winner"></p>
    <div class="log" id="log"></div>
    <p class="played" id="played">Thank you for playing!<b id="playedN">&hellip;</b><small id="playedNote">Total games played globally</small></p>
  </div>
  <div class="bossbank" aria-hidden="true">${card(KULA)}${GUESTS.map(card).join('')}</div>
</div></section>`;
  const SCRIPT = `<script>
(function(){
  var DATA=${JSON.stringify(Object.fromEntries(ALLP.concat([KULA], GUESTS).map(p => [p.id, { n: p.n, no: p.no, s: p.s, photo: photoOf(p), shiny: p.director || !!p.holo, boss: !!p.boss, guest: !!p.guest }])))};
  var WEAK=${JSON.stringify(WEAK)},RESIST=${JSON.stringify(RESIST)},TINT=${JSON.stringify(TINT)};
  var PERSONAL={'coach-damon-sichler':['coach-tara-tucker','coach-tara-tucker-director'],'coach-damon-sichler-director':['coach-tara-tucker','coach-tara-tucker-director']};
  ${CORE_SRC.trim()}
  var core=BattleCore,T={WEAK:WEAK,RESIST:RESIST,PERSONAL:PERSONAL,first:function(id){return DATA[id].n.split(' ')[0];}};
  var $=function(i){return document.getElementById(i);};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MAXE=core.MAXE,CHARGE=core.CHARGE;
  /* ---- RPG sprite: 20x28 volleyball player. Front frames carry the jersey number; side frames face the opponent. ---- */
  var F={
    idle:['........HHHH........','.......HHHHHH.......','......HHHHHHHH......','......HHSSSSHH......','......HSSSSSSH......','......SSWSSWSS......','......SSSSSSSS......','.......SSSSSS.......','........SSSS........','......JJJJJJJJ......','.....JJJJJJJJJJ.....','....SJJJJJJJJJJS....','....SJJJJJJJJJJS....','....S.JJJJJJJJ.S....','......JJJJJJJJ......','......KKKKKKKK......','......KKKKKKKK......','......KKK..KKK......','......SSS..SSS......','......SSS..SSS......','......NNN..NNN......','......NNN..NNN......','......SSS..SSS......','......SSS..SSS......','......EEE..EEE......','.....EEEE..EEEE.....','....................','....................'],
    run:['........HHHH........','.......HHHHHH.......','......HHHHHHHH......','......HHSSSSHH......','......HSSSSSSH......','......SSWSSWSS......','......SSSSSSSS......','.......SSSSSS.......','........SSSS........','......JJJJJJJJ......','...S.JJJJJJJJJJ.....','...SJJJJJJJJJJJS....','....JJJJJJJJJJJ.S...','......JJJJJJJJ..S...','......JJJJJJJJ......','......KKKKKKKK......','.....KKKKKKKKKK.....','.....KKK....KKK.....','.....SSS....SSS.....','....SSS......SSS....','....NNN......NNN....','....NNN......NNN....','...SSS........SSS...','...SSS........SSS...','...EEE........EEE...','..EEEE........EEEE..','....................','....................'],
    spike:['........HHHH.....S..','.......HHHHHH....S..','......HHHHHHHH...S..','......HHSSSSHH...S..','......HSSSSSSH...S..','......SSWSSWSS...S..','......SSSSSSSS..S...','.......SSSSSS...S...','........SSSS...S....','......JJJJJJJJ.S....','.....JJJJJJJJJJS....','....SJJJJJJJJJJJ....','....SJJJJJJJJJJ.....','....S.JJJJJJJJ......','......JJJJJJJJ......','......KKKKKKKK......','......KKKKKKKK......','......KKK..KKK......','......SSS..SSS......','......NNN..NNN......','......NNN..NNN......','......SSS..SSS......','......EEE..EEE......','.....EEEE..EEEE.....','....................','....................','....................','....................'],
    block:['..S.....HHHH.....S..','..S....HHHHHH....S..','..S...HHHHHHHH...S..','..S...HHSSSSHH...S..','..S...HSSSSSSH...S..','..S...SSWSSWSS...S..','...S..SSSSSSSS..S...','...S...SSSSSS...S...','....S...SSSS...S....','....SJJJJJJJJJJS....','.....JJJJJJJJJJ.....','....JJJJJJJJJJJJ....','....JJJJJJJJJJJJ....','......JJJJJJJJ......','......JJJJJJJJ......','......KKKKKKKK......','......KKKKKKKK......','......KKK..KKK......','......SSS..SSS......','......NNN..NNN......','......NNN..NNN......','......SSS..SSS......','......EEE..EEE......','.....EEEE..EEEE.....','....................','....................','....................','....................'],
    side:['........HHHH........','.......HHHHHH.......','......HHHHHHHH......','......HHHHSSSS......','......HHHSSSSS......','......HHHSSWSS......','......HHHSSSSS......','.......HHSSSS.......','........SSSS........','........JJJJ........','.......JJJJJJ.......','.......JJJJJJS......','.......JJJJJJS......','.......JJJJJJ.......','.......JJJJJJ.......','.......KKKKKK.......','.......KKKKKK.......','.......KKKKKK.......','........SSSS........','........SSSS........','........NNNN........','........NNNN........','........SSSS........','........SSSS........','........EEEE........','........EEEEE.......','....................','....................'],
    siderun:['........HHHH........','.......HHHHHH.......','......HHHHHHHH......','......HHHHSSSS......','......HHHSSSSS......','......HHHSSWSS......','......HHHSSSSS......','.......HHSSSS.......','........SSSS........','........JJJJ........','.......JJJJJJ.......','.......JJJJJJSS.....','......SJJJJJJ.......','.......JJJJJJ.......','.......JJJJJJ.......','.......KKKKKK.......','......KKKKKKKK......','.....KKK..KKKK......','....SSS....SSS......','...SSS......SSS.....','...NNN......NNN.....','..NNN........NNN....','..SSS........SSS....','.SSS..........SSS...','.EEE..........EEE...','EEEE..........EEEE..','....................','....................'],
    sidespike:['........HHHH...S....','.......HHHHHH..S....','......HHHHHHHH.S....','......HHHHSSSS.S....','......HHHSSSSS.S....','......HHHSSWSSS.....','......HHHSSSSS......','.......HHSSSS.......','........SSSS........','........JJJJ........','.......JJJJJJ.......','......SJJJJJJ.......','......SJJJJJJ.......','.......JJJJJJ.......','.......JJJJJJ.......','.......KKKKKK.......','.......KKKKKK.......','........KKKK........','........SSSS........','........NNNN........','........SSSS........','........EEEE........','.......EEEEE........','....................','....................','....................','....................','....................'],
    sidedig:['....................','....................','....................','....................','....................','....................','....................','....................','....................','........HHHH........','.......HHHHHH.......','......HHHHHHHH......','......HHHHSSSS......','......HHHSSSSS......','......HHHSSWSS......','.......HHSSSS.......','........SSSS........','......JJJJJJJJ......','....SSJJJJJJJJ......','..SSS.JJJJJJJJS.....','.SS...JJJJJJJJ.S....','......KKKKKKKKK.....','.....KKKKKKKKKKS....','....SSSS....SSSS....','...NNNN......NNNN...','..EEEE........EEEE..','....................','....................'],
    dance1:['........HHHH........','.......HHHHHH.......','......HHHHHHHH......','......HHSSSSHH......','...S..HSSSSSSH......','...S..SSWSSWSS......','...S..SSSSSSSS......','...S...SSSSSS.......','...S....SSSS........','...S..JJJJJJJJ......','....SJJJJJJJJJJ.....','......JJJJJJJJJS....','......JJJJJJJJJS....','......JJJJJJJJ.S....','......JJJJJJJJ......','......KKKKKKKK......','......KKKKKKKK......','......KKK..KKK......','......SSS..SSS......','......SSS..SSS......','......NNN..NNN......','......NNN..NNN......','......SSS..SSS......','......SSS..SSS......','......EEE..EEE......','.....EEEE..EEEE.....','....................','....................'],
    dance2:['........HHHH........','.......HHHHHH.......','......HHHHHHHH......','......HHSSSSHH......','......HSSSSSSH..S...','......SSWSSWSS..S...','......SSSSSSSS..S...','.......SSSSSS...S...','........SSSS....S...','......JJJJJJJJ..S...','.....JJJJJJJJJJS....','....SJJJJJJJJJ......','....SJJJJJJJJJ......','....S.JJJJJJJJ......','......JJJJJJJJ......','......KKKKKKKK......','......KKKKKKKK......','......KKK..KKK......','......SSS..SSS......','......SSS..SSS......','......NNN..NNN......','......NNN..NNN......','......SSS..SSS......','......SSS..SSS......','......EEE..EEE......','.....EEEE..EEEE.....','....................','....................'],
    ko:['....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','..HHHSSSJJJJJJKKSSEE','.HHHSWSSJJJJJJKKSSEE','.HHHSSSSJJJJJJKKSSEE','..HHHSSSJJJJJJKKSSEE','....................','....................','....................','....................','....................']
  };
  /* ---- Kula: a 40x32 dragon facing left (he always fights on the Away side). B body, D dark, L belly, W wing, E eye, T teeth, H horn, C claw, R blood ---- */
  var DRG={
    fly1:['........................................','..........................D.............','.........................WWW............','........................WWWWWD..........','.......................DWWWWWWW.........','..........H............WWWWWWWWW........','.........H..H..........WWWWWWWWWWD......','........H..H..........WWDWWWWWWWWW......','....BBBBBBB...........WWWWWWWWWWWWW.....','...BBBBBBBBB.........WWWWDWWWWWWWWW.....','..BBBBEEBBBBB........WWWWWWDWWWWWWWW....','.BBBBBBBBBBBBB......WWWWWWWWWWWWWWWW....','DBBBBBBBBBBBB.......WWWWWWWWWD......D...','DBBBBBBBBBBBBB.....WWWWWWWWW............','DTBTBTBBBBBBBB.....WWWWWWW..............','...B......BBBBB.......B.................','..........BBBB...BBBBBBBBBBB............','..........BBBB.BBBBBBBBBBBBBBB........BB','...........BB.BBBBBBBBBBBBBBBBB........B','............BBBBBBBBBBBBBBBBBBBB.....BBB','.............BBBBBLLLLLBBBBBBBBB...BBBBB','............BBBBLLLLLLLLLBBBBBBBBBBBBBB.','.............BBLLLLLLLLLLLBBBBBBBBBBBB..','.............BLLLLLLLLLLLLLBBBBBBBBBB...','..............BLLBBBBLLLLBBBBBBBBBBB....','...............BLLBBBLLLLBBBBB.BBBB.....','.................DDDDLLDDDDDD...........','..................BBB.B...BBB...........','..................BBB.....BBB...........','..................BBB.....BBB...........','..................CCC.....CCC...........','.................C.C.C...C.C.C..........'],
    fly2:['........................................','........................................','........................................','........................................','........................................','..........H.............................','.........H..H...........................','........H..H............................','....BBBBBBB.............................','...BBBBBBBBB............................','..BBBBEEBBBBB...........................','.BBBBBBBBBBBBB..........................','DBBBBBBBBBBBB...........................','DBBBBBBBBBBBBB..........................','DTBTBTBBBBBBBB........W.................','...B......BBBBB.....WWBWWWWWWWWWWW......','..........BBBB...BBBBBBBBBBBWWWWWW......','..........BBBB.BBBBBBBBBBBBBBBWWWWW...BB','...........BB.BBBBBBBBBBBBBBBBBWWWWW...B','............BBBBBBBBBBBBBBBBBBBBWWWWWBBB','.............BBBBBLLLLLBBBBBBBBBWWWWWWBB','............BBBBLLLLLLLLLBBBBBBBBWWWWBB.','.............BBLLLLLLLLLLLBBBBBBWWWWBB..','.............BLLLLLLLLLLLLLBBBBBWDWBB...','..............BLLBBBBLLLLBBBBBBWWWBB....','...............BLLBBBLLLLBBBBB.BBBB.....','.................DDDDLLDDDDDD...........','..................BBB.B...BBB...........','..................BBB.....BBB...........','..................BBB.....BBB...........','..................CCC.....CCC...........','.................C.C.C...C.C.C..........'],
    idle:['........................................','........................................','........................................','........................................','........................................','..........H.............................','.........H..H...........................','........H..H............................','....BBBBBBB.............................','...BBBBBBBBB...................W........','..BBBBEEBBBBB...........WWWWWWWWW.......','.BBBBBBBBBBBBB.........WWWWWWWWWWW......','DBBBBBBBBBBBB.........WDWWWWWWWWWWW.....','DBBBBBBBBBBBBB.......WWWWWDWWWWWWW......','DTBTBTBBBBBBBB......WWWWWWWWWDWWW.......','...B......BBBBB...WWWWBWWWWWWWWW........','..........BBBB...BBBBBBBBBBBWWW.........','..........BBBB.BBBBBBBBBBBBBBB........BB','...........BB.BBBBBBBBBBBBBBBBB........B','............BBBBBBBBBBBBBBBBBBBB.....BBB','.............BBBBBLLLLLBBBBBBBBB...BBBBB','............BBBBLLLLLLLLLBBBBBBBBBBBBBB.','.............BBLLLLLLLLLLLBBBBBBBBBBBB..','.............BLLLLLLLLLLLLLBBBBBBBBBB...','..............BLLBBBBLLLLBBBBBBBBBBB....','...............BLLBBBLLLLBBBBB.BBBB.....','.................DDDDLLDDDDDD...........','..................BBB.B...BBB...........','..................BBB.....BBB...........','..................BBB.....BBB...........','..................CCC.....CCC...........','.................C.C.C...C.C.C..........'],
    attack:['........................................','........................................','........................................','........................................','........................................','.......H................................','......H..H..............................','.....H..H...............................','.BBBBBBB................................','BBBBBBBBB......................W........','BBBEEBBBBB..............WWWWWWWWW.......','BBBBBBBBBBB............WWWWWWWWWWW......','BBBBBBBBBBBB..........WDWWWWWWWWWWW.....','BBBBBBBBBBBBB........WWWWWDWWWWWWW......','BBBBBBBBBBBBBB......WWWWWWWWWDWWW.......','T.T......BBBBBB...WWWWBWWWWWWWWW........','.T........BBBB...BBBBBBBBBBBWWW.........','BBB.......BBBB.BBBBBBBBBBBBBBB........BB','BB.........BB.BBBBBBBBBBBBBBBBB........B','............BBBBBBBBBBBBBBBBBBBB.....BBB','.............BBBBBLLLLLBBBBBBBBB...BBBBB','............BBBBLLLLLLLLLBBBBBBBBBBBBBB.','.............BBLLLLLLLLLLLBBBBBBBBBBBB..','.............BLLLLLLLLLLLLLBBBBBBBBBB...','..............BLLBBBBLLLLBBBBBBBBBBB....','...............BLLBBBLLLLBBBBB.BBBB.....','.................DDDDLLDDDDDD...........','..................BBB.B...BBB...........','..................BBB.....BBB...........','..................BBB.....BBB...........','..................CCC.....CCC...........','.................C.C.C...C.C.C..........'],
    ko:['........................................','........................................','........................................','........................................','........................................','........................................','........................................','........................................','........................................','........................................','........................................','........................................','........................................','........................................','........................................','........................................','........................................','..................W.....................','.................WWWWWWWWWWWWWW.........','................WWWWWWWWWWWWWWW.........','..............WWWWWWWWWWWWWWWWWW........','.............WWWWWWWWWWWWWWWWWWWW.......','.......H....WWWWWWWWWWWWWWWWWWWWWW......','......H.H....BBBBBBBBBBBBBBBBBBB........','.....B....BBBBBBBBBBBBBBBBBBBBBBBBBB.B..','..BBBBBBBBBBBBBBBBLLLLLLLLLBBBBBBBBB..B.','.DBEBBBBBBBBBBLLLLLLLLLLLLLLLLLBBBBBB..B','DBBBBBBBBBBBLLLLLLLLLLLLLLLLLLLLLBBB....','DBBBBBBBBBBBBBLLLLLLLLLLLLLLLLLBBBB.....','.TTTBBBBB....BBBBBLLLLLLLLLBBBBB........','..RR.B.R.....R....BBBBBBBBB.............','R...RR..RR..R.R.....CC..C...............']
  };
  var DPAL={B:'#6b4bb3',D:'#3a2370',L:'#c9b6ff',W:'#9d7bff',E:'#ffe14d',T:'#ffffff',H:'#e0d6ff',C:'#1a1a1a',R:'#c1121f'};
  var TOD={idle:['..HHHH..','.HHHHHH.','.HSSSSH.','.SSWSWS.','.SSSSSS.','..SSSS..','..JJJJ..','.JJJJJJ.','.SJJJJS.','..KKKK..','..S..S..','..E..E..'],
    tap:['..HHHH..','.HHHHHH.','.HSSSSH.','.SSWSWS.','.SSSSSS.','..SSSS..','..JJJJ..','SJJJJJJ.','S.JJJJ..','..KKKK..','..S..S..','..E..E..']};
  var TPAL={H:'#3b2416',S:'#f6dcc4',W:'#101010',J:'#0E7C86',K:'#161616',E:'#f2f2f2'};
  var DIG={'0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['111','001','111','100','111'],'3':['111','001','111','001','111'],'4':['101','101','111','001','001'],'5':['111','100','111','001','111'],'6':['111','100','111','101','111'],'7':['111','001','001','001','001'],'8':['111','101','111','101','111'],'9':['111','101','111','001','111']};
  var SKIN=['#f6dcc4','#efc9a6','#e4b48d','#d19b70'],HAIR=['#1a1410','#3b2416','#5a3a22','#8a5a2b','#c9a063','#d9b35c','#6b2a1a'];
  var JERSEY={black:{J:'#161616',D:'#0E7C86',num:'#ffffff'},teal:{J:'#0E7C86',D:'#065A62',num:'#ffffff'},white:{J:'#f2f2f2',D:'#0E7C86',num:'#111111'}};
  function paletteFor(id){var d=DATA[id],h=d.s.seed,j=JERSEY[d.s.jersey],pp=d.s.pal||{};if(d.s.gi){var gi=d.s.gi;return {H:gi.H,S:gi.S,J:gi.J,D:gi.D,K:gi.K||'#1a1a1a',N:gi.N||'#ffffff',W:gi.W||'#101010',E:gi.E||'#f2f2f2',num:'#fff',no:0};}return {H:pp.hair||HAIR[(h>>>2)%HAIR.length],S:pp.skin||SKIN[(h>>>6)%SKIN.length],J:j.J,D:j.D,K:'#1a1a1a',N:'#ffffff',W:'#101010',E:'#f2f2f2',num:j.num,no:d.no};}
  var FRONT={idle:1,run:1,spike:1,block:1,dance1:1,dance2:1};var SIDE=/^side/;
  function gridFrame(rows,pal,sc,numOf){var w=rows[0].length,h=rows.length,c=document.createElement('canvas');c.width=w;c.height=h;var k=c.getContext('2d'),op=[],x,y;
    for(y=0;y<h;y++){op[y]=[];for(x=0;x<w;x++){var ch=rows[y][x];op[y][x]=ch!=='.';if(ch!=='.'){k.fillStyle=pal[ch]||'#f0f';k.fillRect(x,y,1,1);}}}
    if(numOf){var s=String(numOf),x0=s.length===1?8:6;k.fillStyle=pal.num;for(var di=0;di<s.length;di++){var g2=DIG[s[di]];for(y=0;y<5;y++)for(x=0;x<3;x++)if(g2[y][x]==='1')k.fillRect(x0+di*4+x,10+y,1,1);}}
    k.fillStyle='#14101a';for(y=0;y<h;y++)for(x=0;x<w;x++){if(op[y][x])continue;if((x>0&&op[y][x-1])||(x<w-1&&op[y][x+1])||(y>0&&op[y-1][x])||(y<h-1&&op[y+1][x]))k.fillRect(x,y,1,1);}
    if(sc===1)return c;var o=document.createElement('canvas');o.width=w*sc;o.height=h*sc;var ok=o.getContext('2d');ok.imageSmoothingEnabled=false;ok.drawImage(c,0,0,o.width,o.height);return o;}
  function rpgFrame(name,pal,sc){return gridFrame(F[name],pal,sc,FRONT[name]?pal.no:0);}
  function rpgSet(pal,sc){var s={};Object.keys(F).forEach(function(n){s[n]=rpgFrame(n,pal,sc||1);});return s;}
  function dragonSet(sc){var s={};Object.keys(DRG).forEach(function(n){s[n]=gridFrame(DRG[n],DPAL,sc||1,0);});return s;}
  function toddlerSet(sc){var s={};Object.keys(TOD).forEach(function(n){s[n]=gridFrame(TOD[n],TPAL,sc||1,0);});return s;}
  var TODS=toddlerSet(1);var SETS3={},DRG3=null;function set3(id){if(id==='kula'){if(!DRG3)DRG3=dragonSet(3);return DRG3;}if(!SETS3[id])SETS3[id]=rpgSet(paletteFor(id),3);return SETS3[id];}
  function drawCard(cv,id,fr){var k=cv.getContext('2d');k.imageSmoothingEnabled=false;k.clearRect(0,0,cv.width,cv.height);k.drawImage(set3(id)[fr]||set3(id).idle,0,0);}
  document.querySelectorAll('canvas.spr').forEach(function(c){drawCard(c,c.dataset.id,'idle');});
  /* sound */
  var AC=null,soundOn=true;function ctx(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;}}return AC;}
  function noise(dur,f0,f1,vol,when){var c=ctx();if(!c||!soundOn)return;var b=c.createBuffer(1,c.sampleRate*dur,c.sampleRate),d=b.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;var s=c.createBufferSource();s.buffer=b;var f=c.createBiquadFilter();f.type='bandpass';var t=c.currentTime+(when||0);f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);var g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f).connect(g).connect(c.destination);s.start(t);}
  function tone(freq,dur,type,vol,when,slide){var c=ctx();if(!c||!soundOn)return;var o=c.createOscillator(),g=c.createGain();o.type=type||'sine';var t=c.currentTime+(when||0);o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,freq*(slide||.5)),t+dur);g.gain.setValueAtTime(vol||.2,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(c.destination);o.start(t);o.stop(t+dur);}
  function note(freq,dur,type,vol,when){var c=ctx();if(!c||!soundOn)return;var o=c.createOscillator(),g=c.createGain();o.type=type||'square';var t=c.currentTime+(when||0);o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol||.12,t+.015);g.gain.setValueAtTime(vol||.12,t+dur*.7);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(c.destination);o.start(t);o.stop(t+dur+.02);}
  function seq(notes,type,vol,start){var t=start||0;notes.forEach(function(n){if(n[0])note(n[0],n[1],type,vol,t);t+=n[1];});return t;}
  var N={C4:261.6,D4:293.7,E4:329.6,F4:349.2,G4:392,A4:440,B4:493.9,C5:523.3,D5:587.3,E5:659.3,F5:698.5,G5:784,A5:880,B5:987.8,C6:1046.5,Eb4:311.1,Ab4:415.3,Bb4:466.2,Eb5:622.3,G3:196,C3:130.8,F3:174.6,Ab3:207.7,Bb3:233.1,Eb3:155.6};
  var SFX={whoosh:function(){noise(.25,400,2400,.25);},
    el:{Fighter:function(){noise(.22,500,2600,.28);tone(110,.18,'sine',.25,.12);},Fire:function(){noise(.35,900,200,.3);tone(420,.3,'sawtooth',.12,0,.3);},Psychic:function(){[1046,1318,1568].forEach(function(f,i){tone(f,.22,'triangle',.1,i*.07,1.5);});},
      Rock:function(){noise(.2,150,40,.5);tone(55,.35,'sine',.45);},Grass:function(){noise(.3,1800,5000,.2);tone(700,.12,'triangle',.08,.1,1.4);},Wind:function(){tone(1400,.35,'sine',.12,0,.3);noise(.3,2500,600,.18);},
      Water:function(){noise(.28,700,180,.28);tone(300,.2,'sine',.15,.05,.6);},Shiny:function(){[1760,2217,2637,3520].forEach(function(f,i){tone(f,.1,'square',.07,i*.05);});},Lightning:function(){noise(.18,4000,300,.35);tone(60,.22,'square',.18,0,30);tone(2400,.08,'square',.1,.1,.5);},
      Dragon:function(){tone(90,.6,'sawtooth',.25,0,2);noise(.4,300,900,.2);}},hit:function(){tone(140,.25,'sine',.5);noise(.12,1200,300,.35);},block:function(){tone(880,.12,'square',.12);tone(1320,.18,'square',.1,.06);},ko:function(){tone(300,.5,'sawtooth',.25);tone(150,.7,'sawtooth',.2,.15);},
    win:function(){seq([[N.G4,.1],[N.C5,.1],[N.E5,.1],[N.G5,.18],[N.E5,.1],[N.G5,.4]],'square',.1);seq([[N.C3,.2],[N.G3,.2],[N.C4,.58]],'triangle',.12);},
    lose:function(){seq([[N.E4,.22],[N.Eb4,.22],[N.D4,.26],[N.C4,.5]],'square',.1);seq([[N.C3,.22],[N.G3,.22],[N.F3,.26],[N.C3,.5]],'triangle',.12);noise(.5,200,60,.12,.7);},
    draw:function(){noise(.18,800,3000,.18);tone(660,.15,'triangle',.15,.05);},jump:function(){tone(520,.1,'square',.08);tone(780,.1,'square',.06,.06);},charge:function(){tone(330,.2,'triangle',.1);tone(440,.2,'triangle',.1,.12);tone(660,.25,'triangle',.12,.24);noise(.6,300,2600,.1,0);},
    heal:function(){seq([[N.C5,.08],[N.E5,.08],[N.G5,.08],[N.C6,.2]],'triangle',.1);},drain:function(){tone(1400,.3,'sawtooth',.1,0,.15);noise(.25,3000,400,.15);},
    whistle:function(){tone(2600,.14,'square',.07);tone(2600,.22,'square',.07,.18);},crit:function(){[880,1175,1480,1760].forEach(function(f,i){tone(f,.12,'square',.09,i*.05);});},
    thud:function(){noise(.18,120,60,.5);tone(70,.3,'sine',.4);},crowd:function(){noise(1.3,300,1400,.22);noise(.9,600,2200,.12);},dig:function(){noise(.1,2500,900,.2);tone(220,.12,'triangle',.15,.02);},
    ready:function(){tone(660,.08,'square',.08);tone(990,.12,'square',.08,.08);},negate:function(){tone(1200,.08,'square',.14);tone(1800,.16,'square',.12,.05);noise(.14,2000,600,.25);},
    thunder:function(w){noise(.9,90,30,.6,w||0);noise(.35,2000,200,.3,w||0);tone(60,.8,'sawtooth',.2,w||0);},roar:function(){tone(90,1.1,'sawtooth',.3,0,2.2);tone(140,.9,'square',.12,.1,1.6);noise(1,300,900,.2,.1);},
    flap:function(w){noise(.22,150,40,.3,w||0);},land:function(){noise(.4,100,30,.6);tone(45,.6,'sine',.5);},crater:function(){noise(1.2,80,20,.7);tone(38,1.2,'sine',.5);noise(.6,1500,200,.3,.1);},
    giga:function(){tone(70,.6,'sawtooth',.35,0,.4);noise(.35,2000,100,.5);tone(1200,.2,'square',.12,.05,.3);},headbutt:function(){noise(.2,400,80,.5);tone(110,.3,'square',.3);tone(2200,.4,'sawtooth',.12,.2,.1);},kong:function(){tone(1500,.4,'square',.14,0,.6);tone(400,.5,'sawtooth',.18,.02,.9);noise(.3,3000,800,.25);},
    tap:function(w){tone(900,.05,'square',.1,w||0);},giggle:function(){[1600,1900,1700,2100,1800].forEach(function(f,i){tone(f,.07,'square',.07,i*.09,.8);});},
    intro:function(){var m=[[N.Eb4,.16],[N.Eb4,.16],[N.Eb4,.16],[N.C4,.4],[0,.12],[N.Bb3,.16],[N.Bb3,.16],[N.Bb3,.16],[N.G3,.4],[0,.12],[N.Eb4,.16],[N.G4,.16],[N.Bb4,.16],[N.Eb5,.5],[N.D5,.2],[N.C5,.2],[N.Bb4,.6]];seq(m,'square',.11);seq(m.map(function(n){return [n[0]?n[0]/2:0,n[1]];}),'sawtooth',.08);var bass=[[N.Eb3,.32],[N.Eb3,.32],[N.C3,.32],[N.C3,.32],[N.Ab3,.32],[N.Ab3,.32],[N.Bb3,.32],[N.Bb3,.32],[N.Eb3,.64],[N.Bb3,.64]];seq(bass,'triangle',.14);}};
  $('btnSound').addEventListener('click',function(){soundOn=!soundOn;this.textContent='Sound: '+(soundOn?'On':'Off');this.setAttribute('aria-pressed',String(soundOn));if(soundOn)SFX.draw();});
  function wait(ms){return new Promise(function(r){setTimeout(r,reduce?0:ms);});}
  /* ---- 16-bit court ---- */
  var PX=(function(){
    var cv=$('px'),g=cv.getContext('2d');var W=320,H=200,NET=160,FY=170,SC=2;var FAR=98,NEAR=188;var S=1,hd=false;/* 32-bit view: same 320x200 logic, drawn at 4x onto a 1280x800 canvas with hand-drawn stages and sprite sheets */
    var st={L:null,R:null,fx:[],sparks:[],bolts:[],ball:null,shake:0,flash:0,dark:0,face:0,on:false,t:0,style:'rpg',extra:[],fxs:[],trail:[]};var BEAM=null;
    var SHEETS=${JSON.stringify(SHEETS32)},IMGS={};
    var AV='?v=${o.av||'0'}';window.__AVQ=AV;/* asset version: bumps when a stage / sheet file changes so browsers and the CDN refetch it */
    function loadImg(src){if(IMGS[src])return IMGS[src];IMGS[src]=new Promise(function(res){var im=new Image();im.onload=function(){res(im);};im.onerror=function(){res(null);};im.src=src+AV;});return IMGS[src];}
    function hOf(f){return frameOf(f).height*(f.spr.k||SC);}function wOf(f){return frameOf(f).width*(f.spr.k||SC);}
    /* ball: three panel groups (A top-left, B right, C bottom-left) meeting at the centre, seams S, highlight H */
    var BALL=['.....SSSSS.....','...SSAAAAASS...','..SAHAAAAAABS..','.SAHAAAAABBBBS.','.SAAAAAABBBBBS.','SAAAAAABBBBBBBS','SAAAAABBBBBBBBS','SCCCCSSBBBBBBBS','SCCCCCCSSBBBBBS','SCCCCCCCCSSBBBS','.SCCCCCCCCCSSS.','.SCCCCCCCCCCCS.','..SCCCCCCCCCS..','...SSCCCCCSS...','.....SSSSS.....'],BR=7;
    /* liveries: w = the nine wedge colours going round the ball (three groups of three), S = seams, dim = Flistatec's flat dimpled
       surface. Super Touch: white-red-green strips repeating. Flistatec (red / white / green, and the red / white / blue NCAA
       ball): wide red and green fields split by white arrows. Boom: Flistatec layout in club colours (a custom-colour ball). */
    var BALLS={classic:{n:'Classic White',w:['#fbfbfb','#eef0f2','#f7f7f7','#fbfbfb','#eef0f2','#f7f7f7','#fbfbfb','#eef0f2','#f7f7f7'],S:'#b9bfc4',A:'#fbfbfb',B:'#e3e6e8',C:'#f4f4f4'},
      supertouch:{n:'Molten Super Touch',w:['#f7f7f7','#d7262b','#1f8a3b','#f7f7f7','#d7262b','#1f8a3b','#f7f7f7','#d7262b','#1f8a3b'],S:'#2a2a2a',A:'#d7262b',B:'#f7f7f7',C:'#1f8a3b'},
      flistatec:{n:'Molten Flistatec',w:['#d7262b','#d7262b','#f7f7f7','#1f8a3b','#1f8a3b','#f7f7f7','#d7262b','#1f8a3b','#f7f7f7'],S:'#2a2a2a',dim:1,A:'#d7262b',B:'#1f8a3b',C:'#f7f7f7'},
      flincaa:{n:'Molten Flistatec NCAA',w:['#d7262b','#d7262b','#f7f7f7','#1e5fb8','#1e5fb8','#f7f7f7','#d7262b','#1e5fb8','#f7f7f7'],S:'#1a2a4a',dim:1,A:'#d7262b',B:'#1e5fb8',C:'#f7f7f7'},
      boom:{n:'Boom Teal (custom)',w:['#0E7C86','#0E7C86','#E5B800','#161616','#161616','#E5B800','#0E7C86','#161616','#E5B800'],S:'#000000',dim:1,A:'#0E7C86',B:'#161616',C:'#E5B800'}},ballType='classic',BALLC={};
    function ballSprite(type,smooth){var key=type+(smooth?'h':'p');if(BALLC[key])return BALLC[key];var L=BALLS[type]||BALLS.classic,c=document.createElement('canvas');
      if(!smooth){c.width=17;c.height=17;var k=c.getContext('2d'),r,q,ch;for(r=0;r<15;r++)for(q=0;q<15;q++){ch=BALL[r][q];if(ch==='.')continue;k.fillStyle='#2a2a2a';k.fillRect(q,r+1,1,1);k.fillRect(q+2,r+1,1,1);k.fillRect(q+1,r,1,1);k.fillRect(q+1,r+2,1,1);}
        for(r=0;r<15;r++)for(q=0;q<15;q++){ch=BALL[r][q];if(ch==='.')continue;k.fillStyle=ch==='H'?'#ffffff':L[ch]||L.A;k.fillRect(q+1,r+1,1,1);}}
      else{var R=30;c.width=c.height=R*2+2;var g2=c.getContext('2d'),cx=R+1,cy=R+1,i2;g2.beginPath();g2.arc(cx,cy,R,0,Math.PI*2);g2.fillStyle=L.w[0];g2.fill();g2.save();g2.clip();
        /* nine curved wedges round the centre (the swirl), each split by a mid arc into two panels = 18 panels */
        function wedge(a0,a1,col){var m=(a0+a1)/2,bend=.55;g2.fillStyle=col;g2.beginPath();g2.moveTo(cx,cy);g2.quadraticCurveTo(cx+Math.cos(a0+bend)*R*.55,cy+Math.sin(a0+bend)*R*.55,cx+Math.cos(a0)*R*1.3,cy+Math.sin(a0)*R*1.3);g2.lineTo(cx+Math.cos(m)*R*1.4,cy+Math.sin(m)*R*1.4);g2.lineTo(cx+Math.cos(a1)*R*1.3,cy+Math.sin(a1)*R*1.3);g2.quadraticCurveTo(cx+Math.cos(a1+bend)*R*.55,cy+Math.sin(a1+bend)*R*.55,cx,cy);g2.closePath();g2.fill();}
        for(i2=0;i2<9;i2++)wedge(-Math.PI/2+i2*Math.PI*2/9,-Math.PI/2+(i2+1)*Math.PI*2/9,L.w[i2]);
        g2.strokeStyle=L.S;g2.lineWidth=1.3;g2.lineCap='round';g2.beginPath();for(i2=0;i2<9;i2++){var a0=-Math.PI/2+i2*Math.PI*2/9;g2.moveTo(cx,cy);g2.quadraticCurveTo(cx+Math.cos(a0+.55)*R*.55,cy+Math.sin(a0+.55)*R*.55,cx+Math.cos(a0)*R*1.3,cy+Math.sin(a0)*R*1.3);}g2.stroke();
        g2.lineWidth=1;g2.beginPath();g2.arc(cx,cy,R*.62,0,Math.PI*2);g2.stroke();
        if(L.dim){/* Flistatec: the flat hexagonal dimple texture */g2.fillStyle='rgba(0,0,0,.08)';for(var yy=2;yy<R*2;yy+=4)for(var xx=((yy/4)|0)%2?4:2;xx<R*2;xx+=4)g2.fillRect(xx,yy,2,2);}
        /* shading + highlight */var sh=g2.createRadialGradient(cx-R*.4,cy-R*.45,R*.1,cx,cy,R*1.05);sh.addColorStop(0,'rgba(255,255,255,.35)');sh.addColorStop(.55,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.42)');g2.fillStyle=sh;g2.fillRect(0,0,c.width,c.height);g2.restore();
        g2.strokeStyle='rgba(20,20,20,.8)';g2.lineWidth=1.4;g2.beginPath();g2.arc(cx,cy,R-.5,0,Math.PI*2);g2.stroke();}
      BALLC[key]=c;return c;}
    var GYMS={
      fieldhouse:{sky:['#0b2f34','#0d3a40'],band:'#0E7C86',trim:'#0c0e10',floor:'#8a5a2b',plank:'#704620',court:'#a3692f',zone:'#b5783a',line:'#111111',post:'#222',wall:true},
      arena:{sky:['#0d1424','#121c33'],band:'#1b2a4d',trim:'#ff7a1f',floor:'#2a4d8f',plank:'#24427c',court:'#e07a1f',zone:'#ea8d3a',line:'#ffffff',post:'#ddd',crowd:['#ff5a4e','#49d26a','#f2c200','#5ad7ff','#ffffff','#ff6bd6']},
      beach:{sky:['#ff9a4d','#ff5a7a','#7a2a7a','#2a1a4a'],band:'#ffd36b',trim:'#ffffff',floor:'#e8c98a',plank:'#d9b674',court:'#f0d49c',zone:'#f6dfb0',line:'#ffffff',post:'#8a5a2b',sun:true},
      retro:{sky:['#7a3b2e','#6a3327'],band:'#c9a063',trim:'#3b1f1a',floor:'#c9a063',plank:'#b08a50',court:'#d8b676',zone:'#e2c48a',line:'#8b1e1e',post:'#333',brick:true}
    };
    function cx(y,xFar,xNear){var p=(y-FAR)/(NEAR-FAR);return xFar+(xNear-xFar)*p;}
    function poly(k,pts,col){k.fillStyle=col;k.beginPath();k.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)k.lineTo(pts[i][0],pts[i][1]);k.closePath();k.fill();}
    var LOGO=new Image(),curGym='fieldhouse';LOGO.onload=function(){if(curGym==='fieldhouse'&&!hd)bg=buildBg('fieldhouse');};LOGO.src='${IMG}ryl-logo.webp';
    function wall(k){var x;
      k.fillStyle='#0E7C86';k.fillRect(0,0,W,16);k.fillStyle='#0a5a62';for(x=0;x<W;x+=8)k.fillRect(x,0,1,16);k.fillStyle='#E5B800';k.fillRect(0,14,W,2);
      k.fillStyle='#9ad7e8';[12,60,224,272].forEach(function(wx){k.fillRect(wx,3,36,9);k.fillStyle='#062d32';k.fillRect(wx+17,3,2,9);k.fillRect(wx,7,36,1);k.fillStyle='#9ad7e8';});
      k.fillStyle='#0c0e10';k.fillRect(0,16,W,FAR-14-16);
      if(LOGO.complete&&LOGO.naturalWidth){var lw=70,lh=Math.round(lw*LOGO.naturalHeight/LOGO.naturalWidth),ly=FAR-14-lh-4;[96,224].forEach(function(cxp){var lx=Math.round(cxp-lw/2);k.imageSmoothingEnabled=true;k.imageSmoothingQuality='high';k.drawImage(LOGO,lx,ly,lw,lh);k.imageSmoothingEnabled=false;});}}
    function buildBg(kind){var G=GYMS[kind]||GYMS.fieldhouse,c=document.createElement('canvas');c.width=W;c.height=H;var k=c.getContext('2d'),x,y,i;
      if(G.wall)wall(k);
      else if(G.sky.length>2){var bh=Math.ceil(FAR/G.sky.length);for(i=0;i<G.sky.length;i++){k.fillStyle=G.sky[i];k.fillRect(0,i*bh,W,bh);}if(G.sun){k.fillStyle='#fff2b8';k.fillRect(148,16,24,24);k.fillRect(144,20,32,16);k.fillRect(152,12,16,32);}}
      else{for(x=0;x<W;x+=16){k.fillStyle=(x/16)%2?G.sky[1]:G.sky[0];k.fillRect(x,0,16,FAR);}}
      if(G.brick){k.fillStyle='rgba(0,0,0,.25)';for(y=0;y<FAR-14;y+=8){k.fillRect(0,y,W,1);for(x=((y/8)%2?8:0);x<W;x+=16)k.fillRect(x,y,1,8);}k.fillStyle='#9ad7e8';for(x=40;x<W;x+=90){k.fillRect(x,10,26,26);k.fillStyle='#3b1f1a';k.fillRect(x+12,10,2,26);k.fillRect(x,22,26,2);k.fillStyle='#9ad7e8';}}
      if(G.crowd){for(y=6;y<56;y+=10){for(x=4;x<W;x+=7){k.fillStyle=G.crowd[(x*7+y*3)%G.crowd.length];k.fillRect(x+((y/10)%2?3:0),y+((x*13)%3),4,5);}k.fillStyle='rgba(0,0,0,.35)';k.fillRect(0,y+7,W,3);}}
      k.fillStyle=G.band;k.fillRect(0,FAR-14,W,10);k.fillStyle=G.trim;k.fillRect(0,FAR-4,W,2);
      k.fillStyle=G.floor;k.fillRect(0,FAR,W,H-FAR);k.fillStyle=G.plank;for(y=FAR+5;y<H;y+=6)k.fillRect(0,y,W,1);
      poly(k,[[54,FAR],[266,FAR],[312,NEAR],[8,NEAR]],G.court);
      poly(k,[[54+(NET-54)*.66,FAR],[NET,FAR],[NET,NEAR],[8+(NET-8)*.66,NEAR]],G.zone);
      poly(k,[[NET,FAR],[266-(266-NET)*.66,FAR],[312-(312-NET)*.66,NEAR],[NET,NEAR]],G.zone);
      k.fillStyle=G.plank;k.globalAlpha=.35;for(y=FAR+5;y<NEAR;y+=6)k.fillRect(cx(y,54,8),y,cx(y,266,312)-cx(y,54,8),1);k.globalAlpha=1;
      k.strokeStyle=G.line;k.lineWidth=2;k.beginPath();k.moveTo(54,FAR+1);k.lineTo(266,FAR+1);k.moveTo(8,NEAR-1);k.lineTo(312,NEAR-1);k.moveTo(54,FAR);k.lineTo(8,NEAR);k.moveTo(266,FAR);k.lineTo(312,NEAR);
      k.moveTo(54+(NET-54)*.66,FAR);k.lineTo(8+(NET-8)*.66,NEAR);k.moveTo(266-(266-NET)*.66,FAR);k.lineTo(312-(312-NET)*.66,NEAR);k.moveTo(NET,FAR);k.lineTo(NET,NEAR);k.stroke();
      drawNet(k,false);
      return c;}
    /* the net: a plane standing on the centre line and running away from the viewer. Near post (bottom of the court) is tall,
       far post short; the top tape slants between them; the mesh is a slightly angled face so it reads as a net, not a line. */
    function drawNet(k,smooth){var fx=NET,nx=NET,fTop=FAR-34,nTop=NEAR-58,fBot=FAR,nBot=NEAR-2,face=smooth?30:14;/* the plane is seen a little off edge-on, so its face widens toward the viewer */
      k.save();k.lineCap='butt';
      /* floor shadow */k.fillStyle='rgba(0,0,0,.22)';k.beginPath();k.moveTo(fx-2,fBot);k.lineTo(fx+10,fBot);k.lineTo(nx+16,nBot);k.lineTo(nx-2,nBot);k.closePath();k.fill();
      /* mesh face */k.fillStyle=smooth?'rgba(0,0,0,.10)':'rgba(235,240,245,.22)';k.beginPath();k.moveTo(fx,fTop);k.lineTo(fx+face*.5,fTop+1);k.lineTo(nx+face,nTop+2);k.lineTo(nx+face,nBot);k.lineTo(fx+face*.5,fBot);k.lineTo(fx,fBot);k.closePath();k.fill();
      k.strokeStyle=smooth?'rgba(12,12,14,.7)':'rgba(240,240,240,.7)';k.lineWidth=smooth?.35:1;k.beginPath();var i,n=smooth?30:14;
      for(i=0;i<=n;i++){var q=i/n,y0=fTop+(fBot-fTop)*q,y1=nTop+(nBot-nTop)*q;k.moveTo(fx,y0);k.lineTo(nx+face,y1+(q*2));}
      var m=smooth?26:11;for(i=0;i<=m;i++){var p=i/m,xa=fx+(nx-fx)*p,ya=fTop+(nTop-fTop)*p,yb=fBot+(nBot-fBot)*p,xb=xa+face*(.5+.5*p);k.moveTo(xb,ya+2);k.lineTo(xb,yb);}
      k.stroke();
      /* tapes */if(smooth){k.strokeStyle='rgba(0,0,0,.6)';k.lineWidth=3.2;k.beginPath();k.moveTo(fx-1,fTop+1.5);k.lineTo(nx+face,nTop+2.5);k.stroke();}k.strokeStyle='#f8f8f8';k.lineWidth=smooth?2.2:3;k.beginPath();k.moveTo(fx-1,fTop);k.lineTo(nx+face,nTop+1);k.stroke();k.lineWidth=smooth?1.2:1;k.beginPath();k.moveTo(fx,fBot-1);k.lineTo(nx+face,nBot-1);k.stroke();
      /* posts: far on the far edge, near on the near (right) edge of the face */var px2=nx+face;
      if(smooth){var pg=k.createLinearGradient(fx-2,0,fx+1,0);pg.addColorStop(0,'#777');pg.addColorStop(.5,'#333');pg.addColorStop(1,'#111');k.fillStyle=pg;k.fillRect(fx-2,fTop-4,3,fBot-fTop+6);var pg2=k.createLinearGradient(px2-2,0,px2+3,0);pg2.addColorStop(0,'#888');pg2.addColorStop(.45,'#3a3a3a');pg2.addColorStop(1,'#101010');k.fillStyle=pg2;k.fillRect(px2-2,nTop-6,5,nBot-nTop+8);k.fillStyle='rgba(0,0,0,.35)';k.fillRect(px2-3,nBot,8,2);}
      else{k.fillStyle='#2a2a2a';k.fillRect(fx-2,fTop-4,3,fBot-fTop+6);k.fillRect(px2-2,nTop-6,4,nBot-nTop+8);k.fillStyle='#6a6a6a';k.fillRect(fx-2,fTop-4,1,fBot-fTop+6);k.fillRect(px2-2,nTop-6,1,nBot-nTop+8);}
      /* antennas: red / white */for(i=0;i<6;i++){k.fillStyle=i%2?'#ffffff':'#d3202a';k.fillRect(fx+1,fTop-18+i*3,1,3);k.fillRect(px2,nTop-24+i*4,1.5,4);}
      k.restore();}
    var bg=buildBg('fieldhouse');
    /* 32-bit stage: the drawn background at 1280x800 (or the pixel court scaled up when a stage has no drawing) plus a fine net */
    var FIT={beach:1.13};/* stage drawings whose court sits above the game court get scaled up from the top so the near line lands on NEAR */
    function buildBgHd(kind,im){var c=document.createElement('canvas');c.width=W*4;c.height=H*4;var k=c.getContext('2d');if(im){var fs=FIT[kind]||1;k.drawImage(im,(c.width-c.width*fs)/2,0,c.width*fs,c.height*fs);}else{k.imageSmoothingEnabled=false;k.drawImage(buildBg(kind),0,0,c.width,c.height);}
      k.setTransform(4,0,0,4,0,0);drawNet(k,true);k.setTransform(1,0,0,1,0,0);return c;}
    function rebuildBg(){if(!hd){bg=buildBg(curGym);return Promise.resolve();}return loadImg('${STG32}'+curGym+'.webp').then(function(im){bg=buildBgHd(curGym,im);});}
    function crater(x,y){var k=bg.getContext('2d');k.setTransform(S,0,0,S,0,0);k.fillStyle='#2a1a0c';k.beginPath();k.ellipse(x,y,34,11,0,0,Math.PI*2);k.fill();k.fillStyle='#120a04';k.beginPath();k.ellipse(x,y+1,24,7,0,0,Math.PI*2);k.fill();k.strokeStyle='#1a0f06';k.lineWidth=1;k.beginPath();[[-40,-6,-58,-14],[38,-5,56,-12],[-20,10,-30,20],[22,9,34,19],[0,-12,4,-24],[-44,4,-62,6],[46,2,64,8]].forEach(function(l){k.moveTo(x+l[0],y+l[1]);k.lineTo(x+l[2],y+l[3]);});k.stroke();k.fillStyle='#5a3a1a';for(var i=0;i<14;i++)k.fillRect(x-40+Math.round(Math.random()*80),y-10+Math.round(Math.random()*20),2,1);k.setTransform(1,0,0,1,0,0);}
    function photoSprite(src,big){return new Promise(function(res){var im=new Image();im.onload=function(){var SW=big?60:30,SH=big?76:38,Q=big?24:40;
      var mid=document.createElement('canvas');mid.width=SW*4;mid.height=SH*4;var mk=mid.getContext('2d');
      var s=Math.min(mid.width/im.naturalWidth,mid.height/im.naturalHeight),dw=im.naturalWidth*s,dh=im.naturalHeight*s;mk.drawImage(im,(mid.width-dw)/2,mid.height-dh,dw,dh);
      var c=document.createElement('canvas');c.width=SW;c.height=SH;var k=c.getContext('2d');k.drawImage(mid,0,0,SW,SH);
      var d;try{d=k.getImageData(0,0,SW,SH);}catch(err){res(null);return;}var p=d.data,n=SW*SH,op=new Uint8Array(n),i;
      for(i=0;i<n;i++){if(p[i*4+3]<110){p[i*4+3]=0;continue;}op[i]=1;for(var ch=0;ch<3;ch++){var v=p[i*4+ch];v=Math.min(255,Math.round(((v-128)*1.15+128)/Q)*Q);p[i*4+ch]=Math.max(0,v);}p[i*4+3]=255;}
      for(i=0;i<n;i++){if(op[i])continue;var x=i%SW,y=(i/SW)|0;if((x>0&&op[i-1])||(x<SW-1&&op[i+1])||(y>0&&op[i-SW])||(y<SH-1&&op[i+SW])){p[i*4]=20;p[i*4+1]=16;p[i*4+2]=24;p[i*4+3]=255;}}
      k.putImageData(d,0,0);res({kind:'photo',frames:{idle:c},k:big?1:SC,smooth:!!big});};im.onerror=function(){res(null);};im.src=src;});}
    function cell(im,i,cw,ch){var c=document.createElement('canvas');c.width=cw;c.height=ch;c.getContext('2d').drawImage(im,i*cw,0,cw,ch,0,0,cw,ch);return c;}
    function rotated(c){var o=document.createElement('canvas');o.width=c.height;o.height=c.width;var k=o.getContext('2d');k.translate(o.width/2,o.height/2);k.rotate(Math.PI/2);k.drawImage(c,-c.width/2,-c.height/2);return o;}
    function flipped(im){var o=document.createElement('canvas');o.width=im.width;o.height=im.height;var k=o.getContext('2d');k.translate(o.width,0);k.scale(-1,1);k.drawImage(im,0,0);return o;}
    function bloodied(c){var o=document.createElement('canvas');o.width=c.width;o.height=c.height;var k=o.getContext('2d');k.drawImage(c,0,0);k.globalCompositeOperation='source-atop';k.fillStyle='rgba(193,18,31,.45)';k.fillRect(0,0,o.width,o.height);return o;}
    /* 32-bit sprites: the drawn sheets for Tara, Damon, Will and Sidney (ready, run, dig, set, spike, block), the photo at double
       resolution for the other photographed coaches, the pixel figure for everyone else; Kula is the drawn dragon pair */
    /* power-up aura (fx32/aura.webp: 3 frames each in gold, blue, teal) tinted to the fighter's element; hit bursts, block sparks, ball beam */
    var AURA_ROW={Fighter:[0,'#ff8a3d'],Fire:[0,'#ff3b2f'],Rock:[0,null],Shiny:[0,null],Psychic:[1,'#c65cff'],Wind:[1,'#8fd1f2'],Water:[1,null],Grass:[2,null],Dragon:[1,'#7a5cff'],Lightning:[1,'#d7ff3a']},AURAS={};
    function tinted(c,col){var o=document.createElement('canvas');o.width=c.width;o.height=c.height;var k=o.getContext('2d');k.drawImage(c,0,0);if(col){k.globalCompositeOperation='hue';k.fillStyle=col;k.fillRect(0,0,o.width,o.height);k.globalCompositeOperation='destination-in';k.drawImage(c,0,0);}return o;}
    function auraFor(el){if(AURAS[el])return AURAS[el];var spec=AURA_ROW[el]||[0,null];AURAS[el]=loadImg('${FX32}aura.webp').then(function(im){if(!im)return null;var fr=[];for(var i=0;i<3;i++){var c=document.createElement('canvas');c.width=420;c.height=420;c.getContext('2d').drawImage(im,i*420,spec[0]*420,420,420,0,0,420,420);fr.push(tinted(c,spec[1]));}return fr;});return AURAS[el];}
    var FXS={};function fxStrip(name,n,size){if(FXS[name])return FXS[name];FXS[name]=loadImg('${FX32}'+name+'.webp').then(function(im){if(!im)return null;var fr=[];for(var i=0;i<n;i++){var c=document.createElement('canvas');c.width=size;c.height=size;c.getContext('2d').drawImage(im,i*size,0,size,size,0,0,size,size);fr.push(c);}return fr;});return FXS[name];}
    function hdFx(name,x,y,sz,ms){var n=name==='burst'?5:4;fxStrip(name,n,name==='burst'?160:200).then(function(fr){if(fr)st.fxs.push({fr:fr,x:x,y:y,sz:sz,t0:performance.now(),ms:ms||60});});}
    function hdSprite(id){var d=DATA[id];
      if(d.boss)return Promise.all([loadImg('${SPR32}kula-fly.webp'),loadImg('${SPR32}kula-stand.webp')]).then(function(r){if(!r[0]||!r[1])return {kind:'boss',frames:dragonSet(1),k:3,back:[.58,.42]};var fly=flipped(r[0]),stand=flipped(r[1]);return {kind:'boss',frames:{fly1:fly,fly2:fly,idle:stand,attack:stand,ko:bloodied(rotated(stand))},k:144/stand.height,smooth:true,back:[.52,.34]};});
      var sh=SHEETS[id];if(sh)return loadImg('${SPR32}'+sh+'-32.webp').then(function(im){if(!im)return {kind:'rpg',frames:rpgSet(paletteFor(id),1),k:SC};return sheetSprite(im,.25);});
      if(d.photo)return photoSprite(d.photo,true).then(function(p){return p||{kind:'rpg',frames:rpgSet(paletteFor(id),1),k:SC};});
      return Promise.resolve({kind:'rpg',frames:rpgSet(paletteFor(id),1),k:SC});}
    function whiteOf(c){var w=document.createElement('canvas');w.width=c.width;w.height=c.height;var wk=w.getContext('2d');wk.drawImage(c,0,0);wk.globalCompositeOperation='source-in';wk.fillStyle='#fff';wk.fillRect(0,0,w.width,w.height);return w;}
    function contentH(c){try{var d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,top=-1,bot=-1;for(var y=0;y<c.height;y++){for(var x=0;x<c.width;x++){if(d[(y*c.width+x)*4+3]>40){if(top<0)top=y;bot=y;break;}}}return bot<0?c.height:bot-top+1;}catch(e){return c.height;}}
    function sheetSprite(im,k){var cw=im.height===240?200:300,n=Math.round(im.width/cw),c=function(i){return cell(im,i,cw,im.height);},ready=c(0),run=c(1),dig=c(2),set=c(3),spike=c(4),block=c(5);if(k==='fit')k=68/Math.max(60,contentH(ready));
      var fr={idle:ready,side:ready,run:run,siderun:run,spike:spike,sidespike:spike,sidedig:dig,block:block,set:set,faint1:c(6),faint2:c(7),faint3:c(8),dance1:c(9),dance2:c(10),dance3:c(11),charge1:c(12),charge2:c(13),charge3:c(14),ko:c(8)};
      if(n>=26){fr.walk1=c(15);fr.walk2=c(16);fr.punch1=c(17);fr.punch2=c(18);fr.punch3=c(19);fr.sp1=c(20);fr.sp2=c(21);fr.sp3=c(22);fr.sp4=c(23);fr.sp5=c(24);fr.run2=c(25);fr.side=fr.run2;}
      return {kind:'rpg',frames:fr,k:k,smooth:true,allSide:true,full:true};}
    function guestSprite(id){var fb={kind:'rpg',frames:rpgSet(paletteFor(id),1),k:SC};var try32=function(){return loadImg('${SPR32}'+id+'-32.webp').then(function(im){return im?sheetSprite(im,'fit'):fb;});};
      if(hd)return try32();return loadImg('${SPR32}'+id+'-16.webp').then(function(im){return im?sheetSprite(im,'fit'):try32();});}
    function makeSprite(id){var d=DATA[id];if(d.guest)return guestSprite(id);if(hd)return hdSprite(id);if(d.boss)return Promise.resolve({kind:'boss',frames:dragonSet(1),k:3,back:[.58,.42]});var rpg={kind:'rpg',frames:rpgSet(paletteFor(id),1),k:SC};
      return Promise.resolve(rpg);}
    function fighter(side,id,spr){var boss=!!DATA[id].boss;var f={side:side,id:id,spr:spr,frame:'idle',home:side==='L'?64:(boss?W-72:W-64),rider:boss,x:0,oy:0,ox:0,fy:FY,hp:DATA[id].s.hp,max:DATA[id].s.hp,shown:DATA[id].s.hp,energy:0,hit:0,shield:0,hide:false,gone:false,shiny:!!DATA[id].shiny,boss:boss,aura:0,white:{}};f.x=f.home;return f;}
    function frameOf(f){return f.spr.frames[f.frame]||f.spr.frames.idle;}
    function drawBall(x,y,fl){var c=ballSprite(ballType,hd),sz=hd?15.5:17;g.save();g.imageSmoothingEnabled=hd;if(fl){g.translate(x,y);g.scale(-1,1);g.translate(-x,-y);}g.drawImage(c,Math.round(x-sz/2),Math.round(y-sz/2),sz,sz);g.restore();}
    function drawF(f){if(!f||!f.spr||f.hide||f.gone)return;if(f.loop&&f.spr.frames[f.loop[0]])f.frame=f.loop[((st.t/f.loopMs)|0)%f.loop.length];var c=frameOf(f),kk=f.spr.k||SC,w=c.width*kk,h=c.height*kk,x=Math.round(f.x-w/2+f.ox),y=Math.round(f.fy-h+f.oy);
      if(!f.noShadow){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(Math.round(f.x-w/2+6+f.ox),f.fy-2,w-12,3);}
      if(f.windAura){var wa=f.windAura[((st.t/70)|0)%f.windAura.length],wsz=h*(f.windScale||1.2);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.95;g.imageSmoothingEnabled=true;g.drawImage(wa,Math.round(f.x-wsz/2+f.ox),Math.round(f.fy-wsz+8+f.oy),wsz,wsz);g.restore();}
      if(f.aura>0&&hd){if(f.auraFr){var af=f.auraFr[((st.t/70)|0)%f.auraFr.length],ah=h*1.7,aw=ah;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.95;g.imageSmoothingEnabled=true;g.drawImage(af,Math.round(f.x-aw/2+f.ox),Math.round(f.fy-ah+6+f.oy),aw,ah);g.restore();}}
      else if(f.aura>0){/* Dragon Ball style flare: flickering flame pixels around the body */var tw=(st.t/50)|0;for(var a=0;a<26;a++){var ax=x-6+((tw*13+a*37)%(w+12)),ay=y-10+((tw*7+a*53)%(h+14)),big=((tw+a)%3)===0;g.fillStyle=((a+tw)%4)===0?'#ffffff':((a+tw)%2)?'#ffd36b':'#ff9a2b';g.fillRect(ax,ay-((tw+a)%5)*2,big?3:2,big?5:3);}g.fillStyle='rgba(255,210,80,.18)';g.fillRect(x-8,y-12,w+16,h+14);}
      g.save();if((f.side==='R')!==!!f.faceFlip&&(SIDE.test(f.frame)||f.spr.allSide)){g.translate(f.x+f.ox,0);g.scale(-1,1);g.translate(-(f.x+f.ox),0);}
      g.imageSmoothingEnabled=!!f.spr.smooth;if(f.hit>0){if(!f.white[f.frame])f.white[f.frame]=whiteOf(c);g.drawImage(f.white[f.frame],x,y,w,h);}else g.drawImage(c,x,y,w,h);g.restore();
      if(f.boss&&f.rider&&f.frame!=='ko'){var tf=TODS[f.frame==='attack'?'tap':'idle'],bk=f.spr.back||[.58,.42];g.imageSmoothingEnabled=false;g.drawImage(tf,Math.round(x+w*bk[0]-12),Math.round(y+h*bk[1]-36),24,36);}
      if(f.shield>0&&!f.blocking){if(hd&&f.shieldFr){var sf=f.shieldFr[((st.t/110)|0)%f.shieldFr.length],sh2=h*1.45;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.6+.15*Math.sin(st.t/120);g.imageSmoothingEnabled=true;g.drawImage(sf,Math.round(f.x-sh2/2+f.ox),Math.round(f.fy-sh2+6+f.oy),sh2,sh2);g.restore();}else if(!hd){var tc=f.shield==='all'?'#ffe14d':TINT[DATA[f.id].s.el]||'#8fd1f2',tw3=(st.t/70)|0;for(var a2=0;a2<26;a2++){var ax2=x-7+((tw3*11+a2*41)%(w+14)),ay2=y-8+((tw3*5+a2*29)%(h+10)),big2=((tw3+a2)%3)===0;g.fillStyle=((a2+tw3)%4)===0?'#ffffff':tc;g.fillRect(ax2,ay2-((tw3+a2)%4),big2?3:2,big2?5:3);}}}
      if(f.shiny){var tw2=(st.t/120)|0;for(var i=0;i<3;i++){var sx=x+((tw2*7+i*23)%(w+16))-8,sy=y+((tw2*5+i*31)%(h+10))-6;if(((tw2+i)%4)===0){g.fillStyle='#ffe680';g.fillRect(sx,sy,2,2);g.fillRect(sx-1,sy+1,1,1);g.fillRect(sx+2,sy+1,1,1);}}}}
    /* 32-bit aura: radial glow behind the fighter and 9 flame tongues that lick upward, re-shaped every few frames */
    function flameAura(x,y,w,h){var t=st.t/1000,cx=x+w/2,base=y+h+2;g.save();g.globalCompositeOperation='lighter';
      var gl=g.createRadialGradient(cx,y+h*.55,w*.2,cx,y+h*.55,w*1.1);gl.addColorStop(0,'rgba(255,240,150,.55)');gl.addColorStop(.5,'rgba(255,170,40,.28)');gl.addColorStop(1,'rgba(255,120,0,0)');g.fillStyle=gl;g.beginPath();g.ellipse(cx,y+h*.55,w*1.1,h*.75,0,0,Math.PI*2);g.fill();
      for(var i=0;i<9;i++){var ph=t*9+i*1.7,fx=cx+(i-4)*w*.26+Math.sin(ph)*3,fh=h*(.45+.35*Math.abs(Math.sin(ph*.7+i)))+(i%2?10:0),fw=w*.22+Math.cos(ph)*2;
        var fl=g.createLinearGradient(0,base,0,base-fh);fl.addColorStop(0,'rgba(255,200,60,.0)');fl.addColorStop(.25,'rgba(255,180,40,.55)');fl.addColorStop(.7,'rgba(255,240,170,.75)');fl.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=fl;
        g.beginPath();g.moveTo(fx-fw,base);g.bezierCurveTo(fx-fw*1.3,base-fh*.45,fx-fw*.3,base-fh*.7,fx+Math.sin(ph*1.3)*4,base-fh);g.bezierCurveTo(fx+fw*.3,base-fh*.7,fx+fw*1.3,base-fh*.45,fx+fw,base);g.closePath();g.fill();}
      g.restore();}
    function panel(f,x){if(!f)return;var d=DATA[f.id],el=d.s.el;g.fillStyle='#111';g.fillRect(x,4,132,38);g.fillStyle='#f6f6f6';g.fillRect(x+1,5,130,36);
      g.fillStyle=TINT[el];g.fillRect(x+5,9,10,10);g.fillStyle='#000';g.font='7px "Press Start 2P",monospace';g.textBaseline='top';g.textAlign='left';g.fillText(el[0],x+7,11);
      g.fillStyle='#111';g.fillText(d.n.toUpperCase().slice(0,15),x+19,10);
      g.fillStyle='#E5B800';g.fillText('HP',x+5,24);var pct=Math.max(0,f.shown)/f.max;g.fillStyle='#333';g.fillRect(x+22,23,46,8);g.fillStyle=pct>.5?'#49d26a':pct>.2?'#f2c200':'#ff5a4e';g.fillRect(x+23,24,Math.round(44*pct),6);
      g.fillStyle='#111';g.textAlign='right';g.fillText(Math.max(0,Math.round(f.shown))+'/'+f.max,x+127,24);g.textAlign='left';
      for(var i=0;i<MAXE;i++){g.fillStyle=i<f.energy?'#E5B800':'#cfcfcf';g.fillRect(x+22+i*11,34,9,4);}g.fillStyle='#555';g.font='5px "Press Start 2P",monospace';g.fillText('EN',x+6,34);}
    var tweens=[];function tween(dur,fn){if(reduce)dur=0;return new Promise(function(res){tweens.push({t0:performance.now(),dur:dur,fn:fn,res:res});});}
    function fxText(txt,x,y,col){st.fx.push({txt:txt,x:Math.max(26,Math.min(W-26,x)),y:y,col:col,t0:performance.now()});}
    function sparks(x,y,cols,n){for(var i=0;i<n;i++){var a=Math.random()*Math.PI*2,v=1.2+Math.random()*2.4;st.sparks.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1.2,col:cols[i%cols.length],t0:performance.now(),life:380+Math.random()*260});}st.sparks.push({ring:1,x:x,y:y,t0:performance.now(),life:280,col:cols[0]});}
    function bolt(x1,y1,x2,y2,life){var pts=[[x1,y1]],n=6;for(var i=1;i<n;i++){var p=i/n;pts.push([x1+(x2-x1)*p+(Math.random()*18-9),y1+(y2-y1)*p+(Math.random()*8-4)]);}pts.push([x2,y2]);st.bolts.push({pts:pts,t0:performance.now(),life:life||160});}
    function drawSparks(now){for(var i=st.sparks.length-1;i>=0;i--){var p=st.sparks[i],q=(now-p.t0)/p.life;if(q>=1){st.sparks.splice(i,1);continue;}
      if(p.ring){g.strokeStyle=p.col;g.lineWidth=2;g.globalAlpha=1-q;g.beginPath();g.arc(p.x,p.y,4+q*22,0,Math.PI*2);g.stroke();g.globalAlpha=1;continue;}
      var t=q*p.life/16;g.fillStyle=p.col;g.globalAlpha=1-q;if(p.wind)g.fillRect(Math.round(p.x+p.vx*t),Math.round(p.y),10,1);else g.fillRect(Math.round(p.x+p.vx*t),Math.round(p.y+p.vy*t+.12*t*t),2,2);g.globalAlpha=1;}
      for(i=st.bolts.length-1;i>=0;i--){var b=st.bolts[i],q2=(now-b.t0)/b.life;if(q2>=1){st.bolts.splice(i,1);continue;}g.globalAlpha=1-q2*q2;g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(b.pts[0][0],b.pts[0][1]);for(var j=1;j<b.pts.length;j++)g.lineTo(b.pts[j][0],b.pts[j][1]);g.stroke();g.strokeStyle='#9d7bff';g.lineWidth=4;g.globalAlpha=(1-q2)*.35;g.stroke();g.globalAlpha=1;}}
    function frame(now){st.t=now;var i;
      for(i=tweens.length-1;i>=0;i--){var tw=tweens[i],p=tw.dur?Math.min(1,(now-tw.t0)/tw.dur):1;tw.fn(p);if(p>=1){tweens.splice(i,1);tw.res();}}
      ['L','R'].forEach(function(s){var f=st[s];if(!f)return;f.shown+=(Math.max(0,f.hp)-f.shown)*(f.hp<=0?.5:.12);if(Math.abs(f.shown-Math.max(0,f.hp))<.5)f.shown=Math.max(0,f.hp);if(f.hit>0)f.hit--;});
      g.setTransform(S,0,0,S,0,0);g.clearRect(0,0,W,H);
      if(st.shake>0){g.translate(Math.round(Math.random()*4-2),Math.round(Math.random()*4-2));st.shake--;}
      g.imageSmoothingEnabled=hd;g.drawImage(bg,0,0,W,H);
      /* draw order by depth: whoever stands further up the court (smaller fy) goes first */
      var order=[st.L,st.R].filter(Boolean).sort(function(a,b){return a.fy-b.fy;});order.forEach(drawF);
      st.extra.forEach(function(e){if(e.hide)return;var c=e.frames[e.frame],ek=e.k||SC,w=c.width*ek,h=c.height*ek;g.imageSmoothingEnabled=false;g.drawImage(c,Math.round(e.x-w/2),Math.round(e.y-h),w,h);});
      if(st.ball)drawBall(st.ball.x,st.ball.y,st.ball.f);
      for(i=st.fxs.length-1;i>=0;i--){var ef=st.fxs[i],fi=((now-ef.t0)/ef.ms)|0;if(fi>=ef.fr.length){st.fxs.splice(i,1);continue;}g.save();g.globalCompositeOperation='lighter';g.imageSmoothingEnabled=true;g.drawImage(ef.fr[fi],Math.round(ef.x-ef.sz/2),Math.round(ef.y-ef.sz/2),ef.sz,ef.sz);g.restore();}
      drawSparks(now);
      g.font='8px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='alphabetic';
      for(i=st.fx.length-1;i>=0;i--){var e=st.fx[i],q=(now-e.t0)/900;if(q>=1){st.fx.splice(i,1);continue;}g.globalAlpha=1-q*q;g.fillStyle='#000';g.fillText(e.txt,e.x+1,e.y-q*26+1);g.fillStyle=e.col;g.fillText(e.txt,e.x,e.y-q*26);g.globalAlpha=1;}
      panel(st.L,4);panel(st.R,W-4-132);
      if(st.dark>0){g.fillStyle='rgba(0,0,0,'+st.dark+')';g.fillRect(0,0,W,H);}
      if(st.face&&st.faceImg){g.fillStyle='#f6dcc4';g.fillRect(0,0,W,H);var fi=st.faceImg,fsc=Math.max(W/fi.width,H/fi.height)*1.05,fw=fi.width*fsc,fh=fi.height*fsc;g.imageSmoothingEnabled=true;g.drawImage(fi,Math.round((W-fw)/2),Math.round((H-fh)/2),fw,fh);}
      else if(st.face){/* Saitama's neutral face, full screen (fallback when the portrait is missing) */g.fillStyle='#f6dcc4';g.fillRect(0,0,W,H);g.fillStyle='#e8c7a6';g.fillRect(0,0,W,24);g.fillRect(0,H-22,W,22);g.fillStyle='#f6dcc4';g.beginPath();g.ellipse(W/2,H/2+4,W*.34,H*.52,0,0,Math.PI*2);g.fill();
        g.fillStyle='#e8c7a6';g.fillRect(W*.17,H*.5,10,26);g.fillRect(W*.83-10,H*.5,10,26);g.fillStyle='#111';g.fillRect(W*.4-4,H*.46,8,6);g.fillRect(W*.6-4,H*.46,8,6);g.fillRect(W*.47,H*.72,W*.06,3);g.fillStyle='#d9b08f';g.fillRect(W*.495,H*.58,3,8);}
      if(st.black){g.fillStyle='#000';g.fillRect(0,0,W,H);}
      if(st.flash>0){g.fillStyle='rgba(255,255,255,'+st.flash+')';g.fillRect(0,0,W,H);st.flash=Math.max(0,st.flash-.2);}
      if(st.on)requestAnimationFrame(frame);}
    function start(){if(!st.on){st.on=true;requestAnimationFrame(frame);}}
    start();
    function runTo(f,tx,ty){var sx=f.x,sy=f.fy,ty2=ty==null?f.fy:ty,dist=Math.max(Math.abs(tx-sx),Math.abs(ty2-sy));if(f.spr.kind!=='rpg'||dist<2){f.x=tx;f.fy=ty2;return Promise.resolve();}var alt=f.spr.frames.run2?'run2':'side',keep=f.faceFlip;if(Math.abs(tx-sx)>2)f.faceFlip=f.side==='R'?tx>sx:tx<sx;return tween(Math.max(120,dist*7),function(p){f.x=sx+(tx-sx)*p;f.fy=sy+(ty2-sy)*p;f.frame=((p*dist/8)|0)%2?'siderun':alt;}).then(function(){f.frame='side';f.faceFlip=keep&&!f.gone?keep:false;});}
    function walkTo(f,tx){var sx=f.x,dist=Math.abs(tx-sx);if(!f.spr.frames.walk1)return runTo(f,tx,f.fy);if(dist>2)f.faceFlip=f.side==='R'?tx>sx:tx<sx;return tween(Math.max(200,dist*16),function(p){f.x=sx+(tx-sx)*p;f.frame=((p*dist/10)|0)%2?'walk1':'walk2';}).then(function(){f.frame='idle';f.faceFlip=false;});}
    function nearNet(f){return f.side==='L'?NET-34:NET+34;}
    function practice(F){var seq=F.spr.frames.punch1?['idle','punch1','punch2','punch3','punch2','idle','punch1','punch2','punch3','idle']:['idle','block','idle','block','idle'];var i=0;return new Promise(function(res){(function step(){F.frame=seq[i];if(/punch2|block/.test(seq[i]))SFX.whoosh();i++;if(i<seq.length)setTimeout(step,reduce?0:200);else res();})();});}
    function bounceAway(x0,y0,dirX,dirY){var b=st.ball,hops=[[18,52],[9,34],[4,20]];if(!b)return Promise.resolve();return hops.reduce(function(pr,hp,i){return pr.then(function(){var dur=380-i*90,sx=x0,sy=y0;return tween(dur,function(p){if(st.ball!==b)return;b.x=sx+dirX*hp[1]*p;b.y=sy+dirY*6*p-hp[0]*Math.sin(p*Math.PI);b.f=((p*8)|0)%2;}).then(function(){x0=sx+dirX*hp[1];y0=Math.min(NEAR-4,Math.max(FAR+4,sy+dirY*6));if(i===0)SFX.jump();});});},Promise.resolve()).then(function(){return tween(260,function(p){if(st.ball!==b)return;b.x=x0+dirX*14*p;});}).then(function(){if(st.ball===b)st.ball=null;});}
    function bossBob(f){return tween(900,function(p){f.oy=-3*Math.abs(Math.sin(p*Math.PI));});}
    return {
      gym:function(k){curGym=k;rebuildBg();},
      _px:function(){return PX;},
      ball:function(t){if(BALLS[t])ballType=t;},
      ballPreview:function(t,smooth){return ballSprite(t,smooth).toDataURL();},
      mode:function(v){hd=v==='hd';S=hd?4:1;cv.width=W*S;cv.height=H*S;cv.classList.toggle('hd',hd);return rebuildBg().then(function(){var a=st.L&&st.L.id,b=st.R&&st.R.id;if(!a)return;return Promise.all([makeSprite(a),makeSprite(b)]).then(function(r){st.L.spr=r[0];st.L.white={};st.R.spr=r[1];st.R.white={};if(st.L.frame!=='ko')st.L.frame='idle';if(st.R.frame!=='ko')st.R.frame='idle';});});},
      style:function(s){st.style=s;var a=st.L&&st.L.id,b=st.R&&st.R.id;if(!a)return Promise.resolve();return Promise.all([makeSprite(a),makeSprite(b)]).then(function(r){st.L.spr=r[0];st.L.white={};st.R.spr=r[1];st.R.white={};st.L.frame=st.R.frame='idle';});},
      setup:function(a,b){return Promise.all([makeSprite(a),makeSprite(b),document.fonts?document.fonts.load('8px "Press Start 2P"').catch(function(){}):null]).then(function(r){st.L=fighter('L',a,r[0]);st.R=fighter('R',b,r[1]);st.fx=[];st.sparks=[];st.bolts=[];st.extra=[];st.ball=null;st.dark=0;st.face=0;st.black=0;st.fxs=[];st.trail=[];st.L.loop=st.R.loop=null;tweens=[];start();return rebuildBg();});},
      hp:function(side,hp){st[side].hp=hp;},
      energy:function(side,e){st[side].energy=e;},
      charge:function(a){var A=st[a];A.aura=1;var full=A.spr.full;if(A.spr.kind==='rpg')A.frame=full?'charge1':'block';var pr=hd?auraFor(DATA[A.id].s.el).then(function(fr){A.auraFr=fr;}):Promise.resolve();return pr.then(function(){return tween(hd?1200:900,function(p){A.oy=-3*Math.abs(Math.sin(p*Math.PI*4));if(full)A.frame=p<.3?'charge1':p<.6?'charge2':'charge3';});}).then(function(){A.oy=0;A.aura=0;A.auraFr=null;A.frame='idle';});},
      heal:function(a,amt){var A=st[a];fxText('+'+amt,A.x,A.fy-hOf(A)-8,'#49d26a');sparks(A.x,A.fy-20,['#49d26a','#ffffff','#c9ffd0'],12);return tween(600,function(p){A.oy=-4*Math.abs(Math.sin(p*Math.PI*2));}).then(function(){A.oy=0;});},
      /* attack: the ball comes off the hand on a downward line (little arc). mode 'block' meets it at the net, 'dig' sends the defender
         to the landing spot to dig from the floor, 'hit' lets it land up or down the court away from the defender. */
      attack:function(a,d,mode,land){var A=st[a],D=st[d];var rpg=A.spr.kind==='rpg',drpg=D.spr.kind==='rpg',boss=A.spr.kind==='boss';
        var pre=boss?tween(320,function(p){A.frame='attack';A.ox=-18*Math.sin(p*Math.PI/2);}):runTo(A,nearNet(A)).then(function(){SFX.jump();if(rpg)A.frame='sidespike';return tween(260,function(p){A.oy=-(rpg?26:16)*Math.sin(p*Math.PI);});});
        return pre.then(function(){
          var h=hOf(A),sx=boss?A.x-wOf(A)*.42:(A.side==='L'?A.x+10:A.x-10),sy=boss?A.fy-h*.78:A.fy-h-6,dh=hOf(D),dir=D.side==='L'?-1:1;
          var up=land==='up',lx=D.x+dir*(14+Math.round(Math.random()*18)),ly=up?D.fy-26-Math.round(Math.random()*18):Math.min(NEAR-4,D.fy+6+Math.round(Math.random()*8));lx=Math.max(24,Math.min(W-24,lx));
          var ex=lx,ey=ly-4;
          if(mode==='block'){var bx=nearNet(D);ex=bx;ey=D.fy-dh-(drpg?22:12)-4;var dx0=D.x;tween(200,function(p){D.x=dx0+(bx-dx0)*p;D.frame=drpg?(((p*6)|0)%2?'siderun':'side'):'idle';}).then(function(){if(drpg)D.frame='block';D.blocking=1;SFX.jump();return tween(240,function(p){D.oy=-(drpg?22:12)*Math.sin(p*Math.PI/2);});});}
          else if(mode==='dig'){ey=ly-10;runTo(D,lx+dir*12,ly).then(function(){if(drpg)D.frame='sidedig';D.blocking=1;});}
          var nb={x:sx,y:sy,f:0};st.ball=nb;st.land={x:lx,y:ly,dir:dir};SFX.whoosh();
          return tween(mode==='block'?420:380,function(p){if(st.ball!==nb)return;nb.x=sx+(ex-sx)*p;nb.y=sy+(ey-sy)*p-(mode==='block'?40:14)*Math.sin(p*Math.PI);nb.f=((p*12)|0)%2;});}).then(function(){A.oy=0;A.ox=0;if(boss){A.frame='idle';return;}runTo(A,A.home,FY).then(function(){A.frame='idle';});});},
      impact:function(d,amt,mode,crit,scaled){var D=st[d],dir=D.side==='L'?-1:1,b=st.ball,bx=b?b.x:D.x,by=b?b.y:D.fy-30,top=D.fy-hOf(D)-8,ld=st.land||{x:D.x,y:D.fy,dir:dir};
        if(hd)hdFx(mode==='hit'?'burst':'spark',mode==='hit'?ld.x:bx,mode==='hit'?ld.y-6:by,mode==='hit'?(crit?70:50):56,mode==='hit'?55:70);
        if(mode==='block'||mode==='dig'){D.shield=0;sparks(bx,by,['#8fd1f2','#ffffff','#E5B800'],12);fxText(amt>0?(mode==='dig'?'DIG':'BLOCK'):(mode==='dig'?'DUG UP!':'BLOCKED!'),D.x,top-14,'#8fd1f2');st.shake=amt>0?8:4;if(mode==='dig')SFX.dig();if(amt>0){st.flash=.5;D.hit=6;fxText('-'+amt,D.x,top+4,'#ff5a4e');}
          var back=-dir*58,landY=mode==='dig'?D.fy-2:D.fy-6,bb=st.ball;tween(mode==='dig'?640:520,function(p){if(!bb||st.ball!==bb)return;if(mode==='dig'){bb.x=bx+back*.6*p;bb.y=by-48*Math.sin(p*Math.PI)+(landY-by)*p;}else{bb.x=bx+back*p;bb.y=by+(landY-by)*p*p-26*Math.sin(p*Math.PI);}bb.f=((p*10)|0)%2;}).then(function(){if(!bb||st.ball!==bb)return;return bounceAway(bb.x,bb.y,-dir,Math.random()<.5?-1:1);});
          return tween(260,function(p){D.oy=-(D.spr.kind==='rpg'?22:12)*(1-p)*(mode==='block'?1:0);}).then(function(){D.oy=0;D.blocking=0;return runTo(D,D.home,FY);}).then(function(){D.frame='idle';});}
        if(scaled>0)fxText('SCALES -'+scaled,D.x,top-14,'#c9b6ff');
        st.flash=crit?1:.75;st.shake=crit?16:10;D.hit=8;sparks(ld.x,ld.y,crit?['#ffd36b','#ff5a4e','#ffffff','#E5B800']:['#ff5a4e','#ffd36b','#ffffff'],crit?22:14);
        tween(320,function(p){D.ox=Math.round(Math.sin(p*28)*3*(1-p)*dir*-1);});if(amt>0)fxText('-'+amt,D.x,top,'#ff5a4e');else fxText('NO DAMAGE',D.x,top,'#c9b6ff');if(crit)fxText('CRITICAL',D.x,top-24,'#ffd36b');
        if(st.ball)bounceAway(ld.x,ld.y-2,ld.dir,ld.y<D.fy?-1:1);return Promise.resolve();},
      block:function(d,amt,dig){var D=st[d];var rpg=D.spr.kind==='rpg';D.shield=1;if(hd)auraFor(DATA[D.id].s.el).then(function(fr){D.shieldFr=fr;});if(rpg)D.frame=dig?'sidedig':'block';if(D.spr.kind==='boss'){D.frame='idle';return tween(600,function(p){D.ox=-6*Math.sin(p*Math.PI*2);}).then(function(){D.ox=0;});}return tween(500,function(p){D.oy=-3*Math.abs(Math.sin(p*Math.PI*2));}).then(function(){D.oy=0;D.frame='idle';});},
      drain:function(d){var D=st[d];for(var i=0;i<6;i++)bolt(D.x-20+Math.random()*40,D.fy-60,D.x,D.fy-20,260);fxText('ENERGY GONE',D.x,D.fy-hOf(D)-24,'#ffe14d');return tween(400,function(p){D.ox=Math.round(Math.sin(p*20)*2);}).then(function(){D.ox=0;});},
      ko:function(l,w){var Lf=st[l],Wf=st[w];Lf.shield=Wf.shield=0;if(Lf.spr.full)return tween(900,function(p){Lf.frame=p<.35?'faint1':p<.7?'faint2':'faint3';}).then(function(){fxText('K.O.',Lf.x,Lf.fy-40,'#ff5a4e');if(Wf.spr.full){Wf.loop=['dance1','dance2','dance3'];Wf.loopMs=200;return tween(1800,function(){});}return tween(700,function(p){Wf.oy=-14*Math.abs(Math.sin(p*Math.PI*2));});}).then(function(){fxText('WINNER',Wf.x,Wf.fy-hOf(Wf)-10,'#E5B800');});
        return tween(600,function(p){Lf.hide=((p*12)|0)%2===1;}).then(function(){Lf.hide=false;if(Lf.spr.kind==='rpg'){Lf.frame='ko';return tween(500,function(){});}return tween(500,function(p){Lf.oy=p*p*90;});}).then(function(){if(Lf.spr.kind!=='rpg')Lf.gone=true;fxText('K.O.',Lf.x,Lf.fy-40,'#ff5a4e');
        if(Wf.spr.kind==='rpg')return tween(1800,function(p){Wf.frame=((p*9)|0)%2?'dance2':'dance1';Wf.oy=-5*Math.abs(Math.sin(p*Math.PI*9));}).then(function(){Wf.oy=0;Wf.frame='dance1';});
        return tween(700,function(p){Wf.oy=-14*Math.abs(Math.sin(p*Math.PI*2));});}).then(function(){fxText('WINNER',Wf.x,Wf.fy-hOf(Wf)-10,'#E5B800');});},
      /* ---- Kula ---- */
      bossIntro:function(){var K=st.R;K.hide=true;K.noShadow=true;var home=K.home;
        return tween(900,function(p){st.dark=p;}).then(function(){return wait(300);}).then(function(){/* lightning */var n=0;return new Promise(function(res){(function flashLoop(){st.flash=1;SFX.thunder();for(var i=0;i<3;i++)bolt(40+Math.random()*240,0,60+Math.random()*200,FAR+Math.random()*60,220);n++;if(n<4)setTimeout(flashLoop,reduce?0:380+Math.random()*260);else setTimeout(res,reduce?0:500);})();});})
        .then(function(){SFX.intro();SFX.roar();K.hide=false;K.x=W+40;K.oy=-150;K.frame='fly1';var fl=0;return tween(2200,function(p){st.dark=1-p*.85;K.x=W+40+(home-W-40)*Math.min(1,p*1.25);K.oy=-150*(1-p*p);K.frame=((p*14)|0)%2?'fly1':'fly2';var ff=(p*14)|0;if(ff!==fl){fl=ff;SFX.flap();}});})
        .then(function(){K.oy=0;K.frame='idle';K.noShadow=false;st.dark=0;st.shake=18;SFX.land();sparks(K.x,K.fy,['#8a5a2b','#c9a063','#ffffff'],24);for(var i=0;i<8;i++)bolt(K.x-50+Math.random()*100,K.fy-120,K.x-30+Math.random()*60,K.fy-10,420);return tween(1000,function(p){if(((p*10)|0)%3===0&&Math.random()<.3)bolt(K.x-60+Math.random()*120,K.fy-130,K.x-40+Math.random()*80,K.fy-20,200);});});},
      /* entrances and exits by character. side is 'R' for every guest today; the maths works for either side. */
      entrance:function(side){var F=st[side],e=DATA[F.id].s.entry||'walk',dir=side==='R'?1:-1,off=side==='R'?W+40:-40,el=DATA[F.id].s.el;F.hide=false;F.oy=0;F.ox=0;
        var idle=function(){F.frame='idle';};
        if(e==='walk'||e==='saitama'){F.x=off;return walkTo(F,F.home).then(function(){if(e!=='saitama')return;return practice(F);}).then(idle);}
        if(e==='run'){F.x=off;return runTo(F,F.home+dir*8,FY).then(function(){F.frame='sidedig';SFX.dig();return tween(220,function(p){F.x=F.home+dir*8*(1-p);});}).then(idle);}
        if(e==='jump'){F.x=off;return runTo(F,F.home+dir*40,FY).then(function(){SFX.jump();return tween(520,function(p){F.x=F.home+dir*40*(1-p);F.oy=-46*Math.sin(p*Math.PI);F.frame=p<.5?'set':'dance3';});}).then(function(){st.shake=4;SFX.thud();}).then(idle);}
        if(e==='drop'){F.x=F.home;F.oy=-230;F.frame='set';return wait(300).then(function(){SFX.whoosh();return tween(520,function(p){F.oy=-230*(1-p*p);});}).then(function(){F.oy=0;st.shake=16;st.flash=.5;SFX.land();sparks(F.x,F.fy,['#8a5a2b','#c9a063','#ff5a4e'],22);crater(F.x,F.fy-2);F.frame='sidedig';return wait(500);}).then(idle);}
        if(e==='flash'){F.x=F.home;F.hide=true;return wait(400).then(function(){st.flash=1;SFX.negate();F.hide=false;sparks(F.x,F.fy-30,['#ffffff','#9ad7e8','#ffe680'],18);F.frame='idle';return wait(500);});}
        if(e==='float'){F.x=F.home;F.oy=-210;F.frame='set';return auraFor(el).then(function(fr){F.windAura=fr;F.windScale=1.5;SFX.charge();return tween(1500,function(p){F.oy=-210*(1-p*(2-p));});}).then(function(){F.oy=0;F.windAura=null;F.frame='charge3';return wait(400);}).then(idle);}
        if(e==='fire'){F.x=F.home;F.hide=true;return wait(300).then(function(){st.flash=.8;SFX.giga();sparks(F.x,F.fy-24,['#ff7a1f','#ffd400','#ff3b2f','#ffffff'],40);for(var i=0;i<5;i++)bolt(F.x-30+Math.random()*60,F.fy-90,F.x-10+Math.random()*20,F.fy-10,320);return wait(260);}).then(function(){F.hide=false;F.frame='charge2';st.shake=6;return wait(500);}).then(idle);}
        F.x=off;return walkTo(F,F.home).then(idle);},
      exit:function(side){var F=st[side],e=DATA[F.id].s.exit||'walk',dir=side==='R'?1:-1,off=side==='R'?W+50:-50,el=DATA[F.id].s.el;F.loop=null;F.oy=0;F.ox=0;F.shield=0;if(e==='walk'||e==='run'||e==='dash')F.faceFlip=true;
        var gone=function(){F.gone=true;};
        if(e==='walk')return wait(400).then(function(){return walkTo(F,off);}).then(gone);
        if(e==='run'||e==='dash'){if(e==='dash'){SFX.whoosh();sparks(F.x,F.fy,['#ff3b2f','#ffffff'],12);}return wait(300).then(function(){return e==='dash'?tween(180,function(p){F.x=F.x+(off-F.x)*p*.4;F.frame='siderun';}):runTo(F,off,FY);}).then(gone);}
        if(e==='flash')return wait(500).then(function(){st.flash=1;SFX.negate();sparks(F.x,F.fy-30,['#ffffff','#9ad7e8'],14);F.hide=true;return wait(300);}).then(gone);
        if(e==='float')return auraFor(el).then(function(fr){F.windAura=fr;F.windScale=1.5;F.frame='set';SFX.charge();return tween(1200,function(p){F.oy=-240*p*p;});}).then(function(){F.windAura=null;}).then(gone);
        if(e==='fire')return wait(400).then(function(){st.flash=.8;SFX.giga();sparks(F.x,F.fy-24,['#ff7a1f','#ffd400','#ff3b2f'],36);F.hide=true;return wait(300);}).then(gone);
        return wait(400).then(function(){return walkTo(F,off);}).then(gone);},
      practice:function(side){return practice(st[side]);},
      /* Serious Punch: the wind-up frames with auras that grow around him, flashes and wind; the screen becomes his face from
         the sheet; black; then the punch dashes in and sends the other fighter off the court, leaving a crater */
      seriousPunch:function(l){var Pl=st[l],Sa=st[l==='L'?'R':'L'],fr=Sa.spr.frames,has=!!fr.sp1;Sa.frame=has?'sp1':'block';
        return Promise.all([auraFor('Rock'),loadImg('${SPR32}guest-saitama-portrait.webp')]).then(function(r){Sa.windAura=r[0];st.faceImg=r[1];
          return tween(2600,function(p){Sa.windScale=1.1+p*1.6;if(has)Sa.frame=p<.35?'sp1':p<.7?'sp2':'sp3';if(Math.random()<.16)st.flash=.7;st.shake=4+(p*8|0);for(var i=0;i<3;i++)st.sparks.push({wind:1,x:W+10,y:16+Math.random()*(H-30),vx:-(7+Math.random()*7),vy:0,col:Math.random()<.5?'#ffffff':'#dfe9ee',t0:performance.now(),life:520});if(((p*24)|0)%5===0&&Math.random()<.3)SFX.thunder();});})
        .then(function(){Sa.windAura=null;st.face=1;SFX.thud();return wait(1000);}).then(function(){st.face=0;st.black=1;return wait(600);})
        .then(function(){st.black=0;st.flash=1;SFX.giga();var sx=Sa.x,tx=Pl.x+(Pl.side==='L'?20:-20);return tween(140,function(p){Sa.x=sx+(tx-sx)*p;Sa.frame=has?'sp4':'sidespike';});})
        .then(function(){st.flash=1;st.shake=34;SFX.crater();crater(Pl.x,Pl.fy-2);sparks(Pl.x,Pl.fy-24,['#ffffff','#ffd36b','#ff5a4e'],34);var px0=Pl.x,dir=Pl.side==='L'?-1:1;return tween(700,function(p){Pl.x=px0+dir*(W+120)*p*p;Pl.oy=-60*Math.sin(p*Math.PI);Pl.frame=((p*12)|0)%2?'ko':'idle';});})
        .then(function(){Pl.gone=true;if(has)Sa.frame='sp5';return wait(500);}).then(function(){Sa.frame='idle';return walkTo(Sa,Sa.home);}).then(function(){Sa.frame='idle';return wait(300);});},
      hideRider:function(){if(hd&&st.R)st.R.rider=false;},
      bossTaunt:function(mv){var K=st.R;fxText(mv.toUpperCase(),K.x,K.fy-hOf(K)-10,'#ffe14d');for(var i=0;i<4;i++)bolt(K.x-40+Math.random()*80,K.fy-110,K.x-20+Math.random()*40,K.fy-30,300);return tween(500,function(p){K.oy=-6*Math.abs(Math.sin(p*Math.PI));});},
      /* player beat Kula: he flies up, drops, cracks the floor, lies bloody and twitching */
      bossDown:function(){var K=st.R,P=st.L;K.shield=P.shield=0;K.noShadow=true;SFX.roar();
        K.rider=false;{var tod={frames:TODS,frame:'idle',x:K.x+6,y:K.fy-40,k:3};st.extra.push(tod);SFX.giggle();var tx0=tod.x;tween(1500,function(p){tod.x=tx0+(W+40-tx0)*p;tod.y=K.fy-2-7*Math.abs(Math.sin(p*Math.PI*7));tod.frame=((p*14)|0)%2?'tap':'idle';}).then(function(){tod.hide=true;});}
        return tween(1100,function(p){K.frame=((p*10)|0)%2?'fly1':'fly2';K.oy=-150*p;}).then(function(){return wait(400);}).then(function(){SFX.flap();return tween(520,function(p){K.frame='ko';K.oy=-150+156*p*p;});}).then(function(){K.oy=0;K.noShadow=false;st.shake=26;st.flash=.9;SFX.crater();crater(K.x,K.fy-2);sparks(K.x,K.fy,['#8a5a2b','#c9a063','#c1121f','#ffffff'],36);for(var i=0;i<10;i++)bolt(K.x-60+Math.random()*120,K.fy-100,K.x-40+Math.random()*80,K.fy-10,500);fxText('K.O.',K.x,K.fy-60,'#ff5a4e');
          var tw=tween(3200,function(p){var s=(p*16)|0;K.ox=(s%4===0)?2:(s%4===2?-2:0);K.oy=(s%5===0)?-1:0;});
          if(P.spr.full){P.loop=['dance1','dance2','dance3'];P.loopMs=200;}else if(P.spr.kind==='rpg')tween(1800,function(p){P.frame=((p*9)|0)%2?'dance2':'dance1';P.oy=-5*Math.abs(Math.sin(p*Math.PI*9));}).then(function(){P.oy=0;P.frame='dance1';});return wait(900).then(function(){return tw;}).then(function(){K.ox=0;K.oy=0;});});},
      /* Kula won: he dances, a toddler hops off his back, bounces over to the body and taps it */
      bossWon:function(){var K=st.R,P=st.L;K.shield=P.shield=0;
        return (P.spr.full?tween(900,function(p){P.frame=p<.35?'faint1':p<.7?'faint2':'faint3';}):tween(600,function(p){P.hide=((p*12)|0)%2===1;}).then(function(){P.hide=false;if(P.spr.kind==='rpg'){P.frame='ko';return tween(400,function(){});}return tween(500,function(p){P.oy=p*p*90;});})).then(function(){if(P.spr.kind!=='rpg')P.gone=true;fxText('K.O.',P.x,P.fy-40,'#ff5a4e');SFX.roar();
          return tween(1600,function(p){K.frame=((p*8)|0)%2?'fly1':'idle';K.oy=-10*Math.abs(Math.sin(p*Math.PI*4));K.ox=6*Math.sin(p*Math.PI*8);});}).then(function(){K.oy=0;K.ox=0;K.frame='idle';
          K.rider=false;var t={frames:TODS,frame:'idle',x:K.x+8,y:K.fy-52,k:3};st.extra.push(t);SFX.giggle();
          return tween(700,function(p){t.y=K.fy-52-40*Math.sin(p*Math.PI)+52*p;t.x=K.x+8-30*p;}).then(function(){SFX.jump();var x0=t.x,y0=t.y,tx=P.x+(P.spr.kind==='rpg'?4:0),ty=P.fy-6;return tween(900,function(p){t.x=x0+(tx-x0)*p;t.y=y0+(ty-y0)*p-70*Math.sin(p*Math.PI);});}).then(function(){SFX.thud();st.shake=6;sparks(t.x,t.y,['#ffffff','#ff5a4e'],8);return tween(1500,function(p){var s=(p*10)|0;t.frame=s%2?'tap':'idle';});}).then(function(){t.frame='idle';[0,.3,.6].forEach(function(w){SFX.tap(w);});return tween(900,function(p){var s=(p*6)|0;t.frame=s%2?'tap':'idle';});});});}
    };
  })();
  if(location.hash==='#dev')window.__PX=PX;/* #dev exposes the court for screenshots and checks */
  /* ---- arena ---- */
  var L=null,R=null,busy=false,selL=$('selL'),selR=$('selR'),lastWin=null,view='px',mode='play',streak=0,streakId=null,autoHook=null,bossFight=false,bossBeaten=0,bossSoon=location.hash==='#kula';
  function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
  var winsTotal=+(lsGet('bt_wins')||0)||0,nextBoss=+(lsGet('bt_next')||0)||3;/* Kula comes at the third win, then again 5-7 wins later each time, counted across visits on this device */
  /* global games counter: a public hit counter (abacus.jasoncameron.dev) with a per-device fallback when it cannot be reached */
  var CNT='https://abacus.jasoncameron.dev/',CNS='coloradoboom/battle-arena-games';
  function showPlayed(n,local){$('playedN').textContent=n.toLocaleString();$('playedNote').textContent=local?'Games played on this device (the global counter is offline)':'Total games played globally';}
  function played(hit){var loc=(+(lsGet('bt_played')||0)||0)+(hit?1:0);if(hit)lsSet('bt_played',loc);fetch(CNT+(hit?'hit/':'get/')+CNS,{cache:'no-store'}).then(function(r){return r.json();}).then(function(j){if(typeof j.value==='number')showPlayed(j.value,false);else showPlayed(loc,true);}).catch(function(){showPlayed(loc,true);});}
  played(false);/* #kula on the URL previews the boss after the first win */
  var VB='<svg viewBox="0 0 40 40" width="46" height="46" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#fbfbfb" stroke="#2a2a2a" stroke-width="2"/><path d="M20 20q4-9 11-9M20 20q6 3 7 15M20 20q-6 2-16-1M7 9q8 4 14-5M35 17q-7 1-5 13M9 31q7-6 3 8" fill="none" stroke="#9aa1a6" stroke-width="1.8" stroke-linecap="round"/><circle cx="13" cy="12" r="3" fill="#fff" opacity=".9"/></svg>';
  function pips(e){var s='<small>Energy</small>';for(var i=0;i<MAXE;i++)s+='<i class="'+(i<e?'on':'')+'"></i>';return s;}
  function clone(id,side){var c=$(id).cloneNode(true);c.id='fight-'+side;c.classList.add('flipped');c.removeAttribute('tabindex');var s=DATA[id].s;var w=document.createElement('div');w.className='fighter';w.id='f'+side;
    w.insertAdjacentHTML('beforeend','<div class="fname">'+DATA[id].n+'</div>');w.appendChild(c);
    var spr=c.querySelector('canvas.spr');if(spr)drawCard(spr,id,'idle');
    w.insertAdjacentHTML('beforeend','<div class="hpbar"><b></b></div><div class="hpnum"><span data-cur>'+s.hp+'</span> / '+s.hp+' HP</div><div class="en" data-en>'+pips(0)+'</div>');return w;}
  function same(a,b){return a.replace('-director','')===b.replace('-director','');}
  function setup(a,b){SFX.draw();L=core.mkFighter(a,DATA[a].s,'L',true);R=core.mkFighter(b,DATA[b].s,'R',false);bossFight=!!DATA[b].boss;
    var ring=$('ring');ring.querySelectorAll('.fighter,.vs,.empty,.vb,.tbox').forEach(function(n){n.remove();});ring.appendChild(clone(a,'L'));ring.insertAdjacentHTML('beforeend','<div class="vs">VS</div>');ring.appendChild(clone(b,'R'));
    $('winner').textContent='';$('nextOv').hidden=true;$('koOv').hidden=true;$('fightOv').hidden=true;$('log').innerHTML='<p><b>'+DATA[a].n+'</b> ('+DATA[a].s.el+') vs <b>'+DATA[b].n+'</b> ('+DATA[b].s.el+'). Press Fight.</p>';$('btnNext').disabled=true;lastWin=null;
    setTimeout(function(){var l=$('fight-L'),r=$('fight-R');if(l)l.classList.remove('flipped');setTimeout(function(){if(r)r.classList.remove('flipped');SFX.draw();},reduce?0:220);},reduce?0:320);
    return PX.setup(a,b).then(function(){if(!bossFight){$('fightOv').hidden=false;}});}
  function fromSelects(){var a=selL.value,b=selR.value;if(busy)return;if(!a||!b){L=R=null;$('fightOv').hidden=true;return;}
    if(same(a,b)){$('log').innerHTML='<p>Pick two different people. A coach cannot fight their own other card.</p>';$('fightOv').hidden=true;L=R=null;return;}setup(a,b);}
  selL.addEventListener('change',fromSelects);selR.addEventListener('change',fromSelects);
  var IDS=Object.keys(DATA).filter(function(k){return !DATA[k].boss&&!DATA[k].guest;}),GIDS=Object.keys(DATA).filter(function(k){return DATA[k].guest&&!DATA[k].s.saitama;});
  var forceGuest=location.hash.indexOf('#guest')===0,forceGuestId=/^#guest-/.test(location.hash)?location.hash.slice(1):null,forceSaitama=location.hash==='#saitama',GBAG=[];
  var fightsTotal=+(lsGet('bt_fights')||0)||0,nextGuestAt=+(lsGet('bt_nextg')||0)||0,nextSaitamaAt=+(lsGet('bt_nexts')||0)||0,kulaSeen=lsGet('bt_kula')==='1';
  if(!nextGuestAt){nextGuestAt=fightsTotal+3+Math.floor(Math.random()*3);lsSet('bt_nextg',String(nextGuestAt));}if(!nextSaitamaAt){nextSaitamaAt=fightsTotal+13+Math.floor(Math.random()*5);lsSet('bt_nexts',String(nextSaitamaAt));}
  function staffOpp(a){var b;do{b=IDS[Math.floor(Math.random()*IDS.length)];}while(same(a,b));return b;}
  function randomOpp(a){var due=kulaSeen&&fightsTotal>=nextGuestAt;if(forceSaitama||(due&&fightsTotal>=nextSaitamaAt)){forceSaitama=false;nextSaitamaAt=fightsTotal+13+Math.floor(Math.random()*5);lsSet('bt_nexts',String(nextSaitamaAt));nextGuestAt=fightsTotal+3+Math.floor(Math.random()*3);lsSet('bt_nextg',String(nextGuestAt));return 'guest-saitama';}
    if(forceGuest||due){var fid=forceGuestId&&DATA[forceGuestId]?forceGuestId:null;forceGuest=false;forceGuestId=null;nextGuestAt=fightsTotal+3+Math.floor(Math.random()*3);lsSet('bt_nextg',String(nextGuestAt));if(fid)return fid;if(!GBAG.length)GBAG=GIDS.slice().sort(function(){return Math.random()-.5;});return GBAG.pop();}   /* a shuffled bag: every special appears once before any repeats */return staffOpp(a);}
  function randomPair(keep,side){var a=keep||IDS[Math.floor(Math.random()*IDS.length)],b=randomOpp(a);return [a,b];}   /* the champion goes Home and the new opponent Away, whichever side won: a special can only enter on the Away side */
  $('btnRandom').addEventListener('click',function(){if(busy)return;var p=randomPair();if(DATA[p[1]].guest)selR.value='';selL.value=p[0];selR.value=p[1];setup(p[0],p[1]);});
  $('btnNext').addEventListener('click',function(){if(busy||!lastWin)return;var keep=lastWin.boss?(streakId||L.id):lastWin.id;var p=mode==='play'?[L.id,randomOpp(L.id)]:randomPair(keep,lastWin.boss?'L':lastWin.side);selL.value=p[0];selR.value=DATA[p[1]].guest?'':p[1];setup(p[0],p[1]).then(fight);});
  /* mode can change mid-fight: it takes effect at the next move. Switching to Auto while waiting for your move hands that move to the AI. */
  function setMode(m){mode=m;$('mAuto').setAttribute('aria-pressed',String(m==='auto'));$('mPlay').setAttribute('aria-pressed',String(m==='play'));$('btnNext').title=m==='play'?'Your card stays in and meets a new random opponent':'The winner stays in and fights a new random opponent right away';if(L)logp(m==='play'?'<b>You Play:</b> you control Home. Pick a move each turn; the AI plays Away.':'<b>Auto Play:</b> both sides play themselves.');if(m==='auto'&&autoHook)autoHook();}
  $('ovNext').addEventListener('click',function(){$('btnNext').click();});
  $('mAuto').addEventListener('click',function(){setMode('auto');});$('mPlay').addEventListener('click',function(){setMode('play');});
  $('battleNow').addEventListener('click',function(e){e.preventDefault();$('arena').scrollIntoView({behavior:'smooth',block:'start'});if(!L&&!busy)$('btnRandom').click();else $('btnFight').focus({preventScroll:true});});
  function padEn(e){var s='EN ';for(var i=0;i<MAXE;i++)s+='<i class="'+(i<e?'on':'')+'"></i>';$('padEn').innerHTML=s;}
  /* play mode: the user picks from the card's moves (or charges). Resolves with a move or null. */
  function userMove(att,def){var card=$('f'+att.side).querySelector('.card'),ph=card.querySelector('.ph'),lis=card.querySelectorAll('.moves li'),pad=$('pad'),pbs=pad.querySelectorAll('.pb'),pls=pad.querySelectorAll('.pl li');
    return new Promise(function(res){
      function done(mv){lis.forEach(function(li){li.classList.remove('can','no');li.removeAttribute('role');li.removeAttribute('tabindex');li.removeAttribute('aria-disabled');li.onclick=li.onkeydown=null;});card.classList.remove('pickable');var c=ph.querySelector('.chg');if(c)c.remove();var t=card.querySelector('.turnlbl');if(t)t.remove();pad.hidden=true;pbs.forEach(function(b){b.onclick=null;});pls.forEach(function(l){l.onclick=null;});$('padAuto').onclick=null;$('dexBtn').classList.remove('hide');autoHook=null;res(mv);}
      function key(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();this.click();}}
      card.classList.add('pickable');card.insertAdjacentHTML('beforeend','<span class="turnlbl">Your move &middot; '+att.energy+' energy'+(core.maxCost(att.round)<3?' &middot; up to '+core.maxCost(att.round)+'-cost this turn':'')+'</span>');padEn(att.energy);
      var capC=core.maxCost(att.round);att.s.moves.forEach(function(m,i){var ok=m.cost<=att.energy&&m.cost<=capC,li=lis[i],pb=pbs[i],pl=pls[i],go=ok?function(){done(m);}:null;
        li.classList.add(ok?'can':'no');li.setAttribute('role','button');li.setAttribute('tabindex',ok?'0':'-1');li.setAttribute('aria-disabled',String(!ok));li.onclick=go;li.onkeydown=key;
        pb.disabled=!ok;pl.classList.toggle('no',!ok);pl.querySelector('span').innerHTML=esc(m.name)+' <b>'+(m.kind==='atk'?m.pow:m.kind==='heal'?'heals '+m.pow:'stops '+m.kind.split(':')[1])+'</b> '+'●'.repeat(m.cost);pb.onclick=go;pl.onclick=go;});
      pbs[3].disabled=false;pls[3].classList.remove('no');pbs[3].onclick=pls[3].onclick=function(){done(null);};autoHook=function(){done(core.pickMove(att,def,Math.random,T));};$('padAuto').onclick=function(){setMode('auto');};
      var chg=document.createElement('button');chg.type='button';chg.className='chg';chg.innerHTML='&#9889; Charge <b>+'+CHARGE+'</b>';chg.title='Skip the swing and bank '+CHARGE+' energy';chg.onclick=function(){done(null);};ph.appendChild(chg);
      pad.hidden=false;$('dexBtn').classList.add('hide');
      if(view!=='card'){var f=pad.querySelector('.pb:not(:disabled)');if(f)f.focus({preventScroll:true});if(window.innerWidth<=560)pad.scrollIntoView({behavior:'smooth',block:'nearest'});}
      else{var l=card.querySelector('.moves li.can');(l||chg).focus({preventScroll:true});card.scrollIntoView({behavior:'smooth',block:'nearest'});}});}
  function burst(card,blk){var b=document.createElement('span');b.className='burst'+(blk?' blk':'');card.appendChild(b);setTimeout(function(){b.remove();},600);}
  $('selGym').addEventListener('change',function(){PX.gym(this.value);});$('selBall').addEventListener('change',function(){PX.ball(this.value);});
  function setView(v){view=v;$('vCard').setAttribute('aria-pressed',String(v==='card'));$('vPx').setAttribute('aria-pressed',String(v==='px'));$('vHd').setAttribute('aria-pressed',String(v==='hd'));$('ring').classList.toggle('px',v!=='card');$('ring').classList.toggle('hd',v==='hd');$('pxopts').hidden=v==='card';if(v!=='card')PX.mode(v);}
  $('vCard').addEventListener('click',function(){setView('card');});$('vPx').addEventListener('click',function(){setView('px');});$('vHd').addEventListener('click',function(){setView('hd');});
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function logp(h){var l=$('log');l.insertAdjacentHTML('beforeend','<p>'+h+'</p>');l.scrollTop=l.scrollHeight;}
  function hpUI(f){var box=$('f'+f.side);box.querySelector('[data-cur]').textContent=Math.max(0,f.hp);var b=box.querySelector('.hpbar b');var pct=Math.max(0,f.hp)/f.max*100;b.style.width=pct+'%';b.classList.toggle('low',pct<30);PX.hp(f.side,f.hp);}
  function enUI(f){$('f'+f.side).querySelector('[data-en]').innerHTML=pips(f.energy);PX.energy(f.side,f.energy);if(f.side==='L'&&!$('pad').hidden)padEn(f.energy);}
  function cardSpr(f){var c=$('f'+f.side).querySelector('canvas.spr');return c||null;}
  function spriteSeq(f,frames,ms,flip){var c=cardSpr(f);if(!c)return Promise.resolve();var i=0;return new Promise(function(res){(function step(){c.classList.toggle('flip',!!flip&&SIDE.test(frames[i]));drawCard(c,f.id,frames[i]);i++;if(i<frames.length)setTimeout(step,reduce?0:ms);else res();})();});}
  function spriteIdle(f){var c=cardSpr(f);if(c){c.classList.remove('flip');drawCard(c,f.id,'idle');}}
  /* card-view projectile: from the attacker's art window to the centre of the defender's art window */
  function cardBall(att,def,blk){var ring=$('ring');if(ring.classList.contains('px'))return wait(740);var ap=$('f'+att.side).querySelector('.ph'),dp=$('f'+def.side).querySelector('.ph');
    var rr=ring.getBoundingClientRect(),a=ap.getBoundingClientRect(),d=dp.getBoundingClientRect();
    var sx=(att.side==='L'?a.right-34:a.left-12)-rr.left,sy=a.top+a.height*.3-rr.top,ex=d.left+d.width/2-23-rr.left,ey=d.top+d.height/2-23-rr.top;if(blk){ey=d.top-rr.top-40;}
    var b=document.createElement('span');b.className='vb';b.innerHTML=VB;ring.appendChild(b);
    var anim=b.animate([{transform:'translate('+sx+'px,'+sy+'px) rotate(0deg) scale(.8)'},{transform:'translate('+((sx+ex)/2)+'px,'+(Math.min(sy,ey)-90)+'px) rotate(360deg) scale(1.15)',offset:.5},{transform:'translate('+ex+'px,'+ey+'px) rotate(720deg) scale(1)'}],{duration:reduce?0:740,easing:'linear',fill:'forwards'});
    return anim.finished.catch(function(){}).then(function(){var bx=blk?(sx+ex)/2:ex,by=blk?ey+120:ey+60;return b.animate([{opacity:1,transform:'translate('+ex+'px,'+ey+'px) rotate(720deg)'},{opacity:0,transform:'translate('+bx+'px,'+by+'px) rotate('+(blk?400:800)+'deg) scale(.6)'}],{duration:reduce?0:(blk?520:300),fill:'forwards'}).finished.catch(function(){});}).then(function(){b.remove();});}
  var DIGRX=/dig|pancake|cover|pass|platform/i;
  function pop(el,cls,txt){var p=document.createElement('span');p.className='pop'+(cls?' '+cls:'');p.textContent=txt;el.appendChild(p);return p;}
  async function turn(att,def){att.round++;att.energy=Math.min(MAXE,att.energy+core.gain(att.round,att));enUI(att);
    var ac=$('f'+att.side).querySelector('.card'),dc=$('f'+def.side).querySelector('.card');
    if(att.s.saitama){if(att.round<3){await textBox('<b>SAITAMA</b>'+(att.round===1?'...':'Is this the gym? OK.'),1300);await PX.practice(att.side);logp('<b>Saitama</b> throws a few practice punches.');return;}
      await textBox('<b>SAITAMA</b>Serious Series: Serious Punch.',1400);logp('<b>Saitama</b> winds up. The air starts to move.');await PX.seriousPunch(def.side);def.hp=0;hpUI(def);dc.classList.add('ko');var kc2=cardSpr(def);if(kc2)drawCard(kc2,def.id,'ko');logp('<b>'+DATA[def.id].n+'</b> leaves the gym through the far wall. Only a crater is left.');return;}
    var mv=(mode==='play'&&att===L)?await userMove(att,def):core.pickMove(att,def,Math.random,T);
    var r=core.resolve(att,def,mv,Math.random,T);enUI(att);
    if(r.kind==='charge'){callout(att.side,'CHARGE!','cochg');var cp=pop(ac,'chg','CHARGE +'+CHARGE);var au=document.createElement('span');au.className='aura';ac.appendChild(au);SFX.charge();logp('<b>'+DATA[att.id].n+'</b> charges up: +'+CHARGE+' energy ('+att.energy+' banked).');await Promise.all([PX.charge(att.side),spriteSeq(att,['block','block','block','idle'],250),wait(900)]);cp.remove();au.remove();return;}
    if(r.kind==='heal'){callout(att.side,mv.name.toUpperCase()+'!','heal');hpUI(att);var hp=pop(ac,'heal','+'+r.amt);SFX.heal();logp('<b>'+DATA[att.id].n+'</b> uses '+esc(mv.name)+' ('+mv.cost+' energy): recovers '+r.amt+' HP.');await Promise.all([PX.heal(att.side,r.amt),wait(800)]);hp.remove();return;}
    if(r.kind==='shield'){var dig=DIGRX.test(mv.name)&&!att.boss;var sh=document.createElement('span');sh.className='shield';ac.appendChild(sh);SFX.block();if(att.boss){SFX.kong();await PX.bossTaunt('KONG BLOCK');}
      callout(att.side,mv.name.toUpperCase()+'!','blk');var p=pop(ac,'blk',r.amt==='all'?'KONG BLOCK':dig?'DIG READY':'BLOCK READY');SFX.ready();logp('<b>'+DATA[att.id].n+'</b> sets up '+esc(mv.name)+' ('+mv.cost+' energy): it triggers when the next ball comes over and stops '+(r.amt==='all'?'everything that turn':'up to '+r.amt)+'.'+(dig?' A dig is taken from the floor, so tips still go over.':''));await Promise.all([PX.block(att.side,r.amt,dig),spriteSeq(att,['block','block','idle'],300),wait(900)]);p.remove();return;}
    /* attack */
    var d=r.d,blocked=r.blocked,willBlock=r.willBlock,dig=willBlock&&DIGRX.test(def.s.moves.filter(function(m){return m.kind.indexOf('shield')===0;}).map(function(m){return m.name;}).join(' '))&&!def.boss;
    if(att.boss){SFX[mv.name==='GigaSpike'?'giga':'headbutt']();await PX.bossTaunt(mv.name);}
    callout(att.side,mv.name.toUpperCase()+'!',mv.drain?'drain':'');ac.classList.add(att.side==='L'?'lunge-l':'lunge-r');(SFX.el[att.s.el]||SFX.whoosh)();var flip=att.side==='R';
    var seqP=spriteSeq(att,['side','siderun','side','siderun','sidespike'],110,flip);var ballP=cardBall(att,def,willBlock);
    if(willBlock){setTimeout(function(){dc.classList.add('blockup');spriteSeq(def,['block','block','block','idle'],200,def.side==='L');},reduce?0:300);}
    await PX.attack(att.side,def.side,willBlock?(dig?'dig':'block'):'hit',Math.random()<.5?'up':'down');
    var crit=r.crit;
    if(willBlock)callout(def.side,dig?'DIG!':'BLOCK!','blk lo');else if(crit)callout(def.side,'CRITICAL!','crit lo');else if(r.scaled)callout(def.side,'SCALES!','blk lo');
    var sh2=dc.querySelector('.shield');if(sh2)sh2.remove();var pp=pop(dc,d>0?'':'blk',d>0?'-'+d:(willBlock?(dig?'DUG UP!':'BLOCKED!'):'NO DAMAGE'));
    if(willBlock){SFX.negate();burst(dc,true);if(d>0){dc.classList.add('hit');SFX.hit();}}else{dc.classList.add('hit');SFX.hit();if(crit){SFX.crit();}else{SFX.thud();}burst(dc,false);}
    var impP=PX.impact(def.side,d,willBlock?(dig?'dig':'block'):'hit',crit,r.scaled);
    hpUI(def);if(r.counter){hpUI(att);SFX.block();}if(r.drained){enUI(def);SFX.drain();PX.drain(def.side);}if(r.refund)enUI(def);
    logp('<b>'+DATA[att.id].n+'</b> used '+esc(mv.name)+' ('+mv.cost+' energy) for '+(d+blocked+r.scaled)+'.'+(r.scaled?' The scales shrugged off '+r.scaled+'.':'')+(willBlock?(d>0?' <b>'+T.first(def.id)+'</b> got a hand on it: '+blocked+' stopped, '+d+' through.':' <b>'+T.first(def.id)+'</b> '+(dig?'dug it up clean.':'blocked it clean.')+' Nothing got through.'):'')+(r.pierce&&def.shield===0&&mv.pierce?' (A tip goes over any block.)':'')+(r.drained?' <b>'+T.first(def.id)+'</b> loses '+r.drained+' energy.':'')+(r.refund?' The block refunds '+r.refund+' energy.':'')+(r.counter?' The block hits back for '+r.counter+'.':'')+(crit?' <b>Critical hit!</b>':'')+r.note);
    await Promise.all([ballP,seqP,impP,wait(def.hp<=0?200:650)]);ac.classList.remove('lunge-l','lunge-r');dc.classList.remove('hit','blockup');pp.remove();spriteIdle(att);}
  var AVQ='?v=${o.av||'0'}',FACES=${JSON.stringify(Object.fromEntries(GUESTS.filter(p => fs.existsSync(__dirname + '/../assets/img/coaches/sprites32/' + p.id + '-faces.webp')).map(p => [p.id, 1])))};
  function callout(side,txt,cls){var ring=$('ring'),el=document.createElement('div');el.className='callout '+side+(cls?' '+cls:'');el.textContent=txt;ring.appendChild(el);setTimeout(function(){el.remove();},reduce?0:1300);}
  /* intro banner: face (one of the sheet's expressions, or the portrait) + name; label 'WINS' for the win version */
  function intro(id,faceIdx,label){var d=DATA[id],ring=$('ring'),el=document.createElement('div');el.className='intro f-'+(d.s.frame||'plain');
    var faces='${SPR32}'+id+'-faces.webp'+AVQ,por='${SPR32}'+(id==='kula'?'kula-stand':id+'-portrait')+'.webp'+AVQ;
    el.innerHTML='<div class="iface"></div><div class="itext">'+esc(d.n)+(label?' <em>'+label+'</em>':'')+'<small>'+esc(d.s.flavor.split('.')[0])+'</small></div>';
    var f=el.querySelector('.iface');f.style.backgroundImage='url('+por+')';
    if(FACES[id]){var im=new Image();im.onload=function(){f.style.backgroundImage='url('+faces+')';f.style.backgroundSize='400% 100%';f.style.backgroundPosition=(faceIdx*100/3)+'% 0';};im.src=faces;}
    ring.appendChild(el);SFX.ready();return wait(label?1100:1500).then(function(){el.classList.add('out');return wait(300);}).then(function(){el.remove();});}
  function textBox(html,ms){return new Promise(function(res){var ring=$('ring'),box=document.createElement('div');box.className='tbox';box.setAttribute('role','status');ring.appendChild(box);var i=0,txt=html,done=false;
    function fin(){if(done)return;done=true;box.remove();res();}
    box.innerHTML=txt;setTimeout(fin,reduce?0:ms);box.onclick=fin;});}
  async function bossEnter(champ){/* fade out, lightning, Kula flies in, text box, then the fight */busy=true;$('nextOv').hidden=true;$('btnNext').disabled=true;$('btnRandom').disabled=true;selL.disabled=selR.disabled=true;
    kulaSeen=true;lsSet('bt_kula','1');if(view==='card')setView('px');logp('<b>The lights go out...</b>');var fade=$('fade');fade.classList.add('on');await wait(1000);
    selL.value=champ;selR.value='';await setup(champ,'kula');fade.classList.remove('on');$('fightOv').hidden=true;
    await PX.bossIntro();await textBox('<b>KULA</b>'+esc(DATA.kula.s.flavor),3400);PX.hideRider();await intro('kula',0,'');
    logp('<b>Kula</b> the dragon lands on the court, toddler aboard. Scales take 10 off every hit, so tips bounce off; GigaSpike hits 35; Headbutt takes the 2 energy you just banked; Kong Block stops a whole turn. He only wakes 1 energy a turn: hit hard while he is low, block when he has 3.');fight();}
  async function fight(){if(busy&&!bossFight||!L)return;busy=true;$('fightOv').hidden=true;$('btnNext').disabled=true;$('btnRandom').disabled=true;selL.disabled=selR.disabled=true;
    if(DATA[R.id].guest){logp(R.s.saitama?'A bald man in a yellow suit wanders onto the court.':'<b>'+DATA[R.id].n+'</b> enters.');await PX.entrance('R');await intro(R.id,Math.floor(Math.random()*4),'');}
    SFX.whistle();var first=L.s.spd>=R.s.spd?L:R,second=first===L?R:L;first.energy=core.startEnergy(true);second.energy=core.startEnergy(false);enUI(first);enUI(second);
    if(mode==='play')logp('<b>You Play:</b> you control <b>'+DATA[L.id].n+'</b> at Home.');logp('<b>'+DATA[first.id].n+'</b> is faster and goes first. Energy: +2 a turn; a block that stops a hit refunds its cost; Charge banks +'+CHARGE+'.');
    var t=0;while(L.hp>0&&R.hp>0&&t<core.TURN_CAP){var att=t%2===0?first:second,def=att===L?R:L;await turn(att,def);t++;if(L.hp>0&&R.hp>0)await wait(220);}
    var win=L.hp>0&&R.hp>0?(L.hp/L.max>=R.hp/R.max?L:R):(L.hp>0?L:R),lose=win===L?R:L;if(L.hp>0&&R.hp>0)logp('Turn limit: <b>'+DATA[win.id].n+'</b> takes it on HP left.');
    if(R.s.saitama){/* no K.O. screen, no streak change: he walks out and the next opponent comes */await PX.exit('R');$('winner').textContent='Saitama wandered off.';logp('<b>Saitama</b> walks out the way he came. That one does not count.');lastWin=L;busy=false;played(true);fightsTotal++;lsSet('bt_fights',String(fightsTotal));$('ovName').textContent='Saitama wandered off';$('ovStreak').textContent='That one did not count';$('nextOv').hidden=false;$('btnNext').disabled=false;$('btnRandom').disabled=false;selL.disabled=selR.disabled=false;return;}
    $('f'+lose.side).querySelector('.card').classList.add('ko');var kc=cardSpr(lose);if(kc)drawCard(kc,lose.id,'ko');SFX.ko();
    var playerWon=mode==='play'?win===L:true;
    var koP;if(bossFight&&win===L){$('koTxt').textContent='YOU WIN!';$('koTxt').classList.add('win');koP=PX.bossDown();await wait(1500);$('koOv').hidden=false;bossBeaten++;}
    else if(bossFight){$('koTxt').textContent='K.O.';$('koTxt').classList.remove('win');$('koOv').hidden=false;koP=PX.bossWon();}
    else{$('koTxt').textContent='K.O.';$('koTxt').classList.remove('win');$('koOv').hidden=false;koP=PX.ko(lose.side,win.side);}
    await wait(1300);$('koOv').hidden=true;$('f'+win.side).querySelector('.card').classList.add('champ');if(playerWon){SFX.win();SFX.crowd();}else SFX.lose();spriteSeq(win,['dance1','dance2','dance1','dance2','dance1','dance2','dance1','dance2','dance1'],220);
    if(mode==='play'){if(win===L){streak=streakId===L.id?streak+1:1;streakId=L.id;}else{streak=0;streakId=null;}}else{if(win.boss){streak=0;streakId=null;}else{streak=win.id===streakId?streak+1:1;streakId=win.id;}}
    $('winner').textContent=DATA[win.id].n+' wins!'+(streak>1?' · '+streak+' in a row':'');logp('<b>'+DATA[win.id].n+'</b> wins with '+Math.max(0,win.hp)+' HP left. '+(bossFight?(win===L?'Kula is down. The streak goes on.':'Kula takes it. The streak is over.'):mode==='play'?(win===L?'You win! ':'The AI takes it. ')+'Next Fight keeps your card in against a new opponent.':'Next Fight keeps the champion in.'));await koP;
    if(win===R&&DATA[R.id].guest){await intro(R.id,R.s.happy!=null?R.s.happy:3,'WINS');await PX.exit('R');}
    bossFight=false;lastWin=win;busy=false;played(true);fightsTotal++;lsSet('bt_fights',String(fightsTotal));
    if(!win.boss&&playerWon){winsTotal++;lsSet('bt_wins',String(winsTotal));}
    if((bossSoon||playerWon&&!kulaSeen&&winsTotal>=3)&&!win.boss){bossSoon=false;bossEnter(win.id);return;}
    $('ovName').textContent=DATA[win.id].n+' wins!';$('ovStreak').textContent=(mode==='play'?'Your win streak: ':'Win streak: ')+streak+' · wins '+winsTotal+(!kulaSeen&&winsTotal===2?' · one more for the challenger':'');$('nextOv').hidden=false;$('btnNext').disabled=false;$('btnRandom').disabled=false;selL.disabled=selR.disabled=false;}
  $('btnFight').addEventListener('click',fight);
  /* boomdex */
  var b=$('dexBtn'),f=$('dex'),x=$('dexX');function open(){f.hidden=false;b.setAttribute('aria-expanded','true');f.querySelector('select').focus();}function close(){f.hidden=true;b.setAttribute('aria-expanded','false');}
  b.addEventListener('click',function(){f.hidden?open():close();});x.addEventListener('click',close);
  $('dexHero').addEventListener('click',function(){open();});
  $('dexBattle').addEventListener('click',function(){close();$('arena').scrollIntoView({behavior:'smooth',block:'start'});$('btnRandom').focus({preventScroll:true});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!f.hidden){close();b.focus();}});
  ['selTeam','selCoach'].forEach(function(id){var s=$(id);s.addEventListener('change',function(){var el=$(s.value);if(!el)return;var g=el.closest('.grp')||el;g.scrollIntoView({behavior:'smooth',block:'start'});el.classList.add('is-hit');setTimeout(function(){el.classList.remove('is-hit');},1800);s.value='';close();});});
  if(matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches){document.querySelectorAll('#tc .tiles .card,#tc .lead-grid .card,#tc .train-grid .card').forEach(function(c){c.addEventListener('pointermove',function(e){if(c.classList.contains('flipped'))return;var r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(700px) rotateX('+(-py*8)+'deg) rotateY('+(px*10)+'deg) translateY(-4px)';});c.addEventListener('pointerleave',function(){c.style.transform='';});});}
  document.querySelectorAll('#tc .tiles .card,#tc .lead-grid .card,#tc .train-grid .card').forEach(function(c){c.tabIndex=0;c.title='Click to flip';function flip(){c.style.transition='transform .45s cubic-bezier(.4,0,.2,1)';c.style.transform='';c.classList.add('turning');c.classList.toggle('flipped');setTimeout(function(){c.style.transition='';c.classList.remove('turning');},520);}
    c.addEventListener('click',flip);c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();flip();}});});
})();
</script>`;
  const hero = `<section class="hero pat"><img src="${IMG}hero-cast.jpg" alt="" width="1800" height="640"><div class="wrap"><span class="eyebrow">Colorado Boom</span><h1>Coaching Staff</h1><p>Meet the coaches of Colorado Boom Volleyball Club. Our staff brings years of playing and coaching experience to every practice, with a focus on skill development, competitive play and building confident athletes on and off the court.</p><p class="hero-sub">Choose your coach to battle in the Arena!</p><div class="hbtns"><a class="btn hero-btn" href="#arena" id="battleNow">Battle Now &darr;</a><button type="button" class="btn btn-line hero-btn" id="dexHero" aria-controls="dex">Boomdex (Directory)</button></div></div></section>`;
  const bands = `<section class="band teald"><div class="wrap">
  <div class="bt"><h2>Club Leadership</h2><span class="sub">Director cards</span></div>
  <div class="lead-grid">${LEAD.map(card).join('')}
  </div>
</div></section>
${BANDS.map(b => `<section class="band ${b.bg}" id="${b.id}"><div class="wrap">
  <div class="bt"><h2>${b.title}</h2><span class="sub">${b.groups.length} teams</span></div>
  <div class="grid">${b.groups.map(group).join('')}
  </div>
</div></section>`).join('\n')}
<section class="band teald" id="trainers"><div class="wrap">
  <div class="bt"><h2>Gym Trainers</h2><span class="sub">Water cards</span></div>
  <div class="train-grid">${TRAIN.map(card).join('')}
  </div>
</div></section>
${arenaHtml}`;
  return { CSS, hero, bands, dexHtml, SCRIPT, count: ALLP.length, real: ALLP.filter(p => photoOf(p)).length };
}
module.exports = { render, ALLP, REAL, KULA, GUESTS, WEAK, RESIST, HPB };

if (require.main === module) {
  const VN = [['v1', 'Court Lines'], ['v2', 'Chalkboard'], ['v3', 'Spotlight'], ['v4', 'Game Program'], ['v5', 'Cast'], ['v6', 'Comic Book'], ['v7', 'Trading Cards']];
  const r = render({ img: 'img/', live: false });
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
<title>Coaching Staff — Demo 7: Trading Cards</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@600;700;900&family=Open+Sans:wght@400;600;700&family=Press+Start+2P&display=swap">
<style>*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth;color-scheme:dark}body{background:#050505;color:#fff;font-family:'Open Sans',system-ui,sans-serif}
.demo-bar{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:14px;background:#000;color:#fff;font-family:'Montserrat',sans-serif;font-size:13px;letter-spacing:.06em;text-transform:uppercase;padding:8px max(16px,env(safe-area-inset-right,0px)) 8px max(16px,env(safe-area-inset-left,0px))}
.demo-bar a{color:inherit;text-decoration:none}.demo-bar .dname{flex:1;color:#E5B800;font-weight:700;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.demo-bar .dback{border:1px solid rgba(255,255,255,.5);padding:4px 10px;white-space:nowrap}
.demo-bar .dlinks{display:flex;gap:6px}.demo-bar .dlinks a{width:28px;height:28px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.5)}
.demo-bar .dlinks a[aria-current]{background:#E5B800;color:#000;border-color:#E5B800;font-weight:900}
.site-head{background:radial-gradient(ellipse 56% 300% at 50% 50%,rgba(11,104,113,.93) 0%,rgba(6,72,80,.94) 30%,rgba(4,4,4,.96) 70%,#000 100%)}
.site-head .wrap{max-width:1240px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.site-head img{height:64px;width:auto;display:block}
.site-head nav{display:flex;gap:16px;font-family:'Montserrat',sans-serif;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.03em}.site-head nav .cur{border-bottom:2px solid #E5B800}
@media(max-width:700px){.site-head nav{display:none}}
.foot{background:#000;color:#fff;text-align:center;font-size:14px;padding-block:16px}
.cta{text-align:center}${r.CSS}</style>
</head>
<body>
  <div class="demo-bar"><a class="dback" href="index.html">&larr; All demos</a><span class="dname">Demo 7 of 7 &middot; Trading Cards</span><span class="dlinks">${VN.map(([k]) => `<a href="${k}.html"${k === 'v7' ? ' aria-current="page"' : ''}>${k.slice(1)}</a>`).join('')}</span></div>
<header class="site-head"><div class="wrap"><a href="${SITE}" target="_blank" rel="noopener"><img src="img/logo.png" alt="Colorado Boom Volleyball Club" width="372" height="240"></a><nav><span>Home</span><span>Open Gyms &amp; Tryouts</span><span>Club Info</span><span>Volleyball Programs</span><span>Club Calendar</span><span class="cur">Staff</span><span>Resources</span><span>Contact</span></nav></div></header>
<div id="tc">
${r.hero}
${r.bands}
<section class="band teal" style="padding-block:18px"><div class="wrap cta"><a class="btn" href="mailto:admin@coloradoboom.com">Interested in Coaching? Contact Us</a></div></section>
${r.dexHtml}
</div>
<footer class="foot">Demo 7 of 7 &middot; Trading Cards &middot; Pixel sprites stand in until each coach&rsquo;s photo arrives</footer>
${r.SCRIPT}
</body>
</html>
`;
  fs.writeFileSync(OUT + 'v7.html', html);
  console.log('ok v7', html.length, 'cards', r.count, 'real', r.real, 'missing photos', ALLP.filter(p => REAL.has(p.id) && !fs.existsSync(OUT + 'img/cut/' + p.id + '.webp')).map(p => p.id).join(',') || 'none');
}
