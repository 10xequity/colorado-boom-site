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
const REAL = new Set(['coach-tara-tucker', 'coach-tara-tucker-director', 'coach-jae-spain', 'coach-claire-kwok', 'coach-zhu', 'coach-will-ly', 'coach-jawn-suzuki', 'coach-kimberly-krise', 'coach-damon-sichler', 'coach-damon-sichler-director', 'coach-sidney-reese']);
const ELEM = { Outside: 'Fighter', Setter: 'Psychic', 'Right Side': 'Fire', Middle: 'Rock', Libero: 'Grass', DS: 'Wind', Trainer: 'Water', Director: 'Shiny' };
const WEAK = { Fighter: 'Psychic', Psychic: 'Wind', Wind: 'Rock', Rock: 'Water', Water: 'Grass', Grass: 'Fire', Fire: 'Water', Shiny: 'Shiny' };
const RESIST = { Fighter: 'Rock', Psychic: 'Fighter', Wind: 'Grass', Rock: 'Fire', Water: 'Fire', Grass: 'Water', Fire: 'Grass', Shiny: 'Psychic' };
const ICON = { Fighter: '✊', Psychic: '◉', Fire: '🔥', Rock: '⬢', Grass: '✿', Wind: '≋', Water: '💧', Shiny: '✦' };
const TINT = { Fighter: '#ff8a3d', Psychic: '#d66cff', Fire: '#ff6a3d', Rock: '#c9a063', Grass: '#63d46a', Wind: '#8fd1f2', Water: '#4fb7f2', Shiny: '#E5B800' };
// moves: [name, cost, kind]. kind 'atk' or 'shield:<absorb>'. Shields are 1-cost so they can offset a hit.
const MOVES = {
  Fighter: [[['Hard Spike', 'Pipe Attack', 'Six-Pack Swing', 'Big Swing'], 3], [['Dig', 'Cover', 'Platform Pass', 'Pancake'], 1, 'shield:10'], [['Cross Hit', 'Roll Shot', 'Tool Swing', 'Angle Hit'], 1]],
  Fire: [[['Slide Crush', 'Back-Row Bomb', 'Line Kill', 'Pin Hammer'], 3], [['Block', 'Soft Block', 'Reach Block', 'Swing Block'], 1, 'shield:10'], [['Roll Shot', 'Tip Over', 'Wipe Off', 'Push Shot'], 1]],
  Psychic: [[['2-Ball', 'Back Set Trick', 'Quick Fake', 'Shoot Set'], 3], [['Setter Block', 'Cover', 'Pancake', 'Hand Block'], 1, 'shield:10'], [['Tip', 'Second Touch', 'Push', 'Quick One'], 1]],
  Rock: [[['Hard Spike', 'Quick One', 'Slide Hammer', 'Net Crush'], 3], [['Big Block'], 2, 'shield:25'], [['Tip', 'Joust', 'Soft Block Tip', 'Quick Push'], 1]],
  Grass: [[['Free Corner Ball', 'Pancake Rally', 'Deep Serve', 'Chase Down'], 3], [['Super Dig'], 2, 'shield:25'], [['Float Serve', 'Short Serve', 'Jump Float', 'Pass Up'], 1]],
  Wind: [[['Top Spin Serve', 'Jump Float', 'Serve Ace', 'Deep Float'], 2], [['Super Dig'], 2, 'shield:25'], [['Roll Shot', 'Chase Tip', 'Back Row Bump', 'Quick Pass'], 1]],
  Water: [[['Max Rep', 'Burnout Set', 'Box Jump Bomb', 'Sprint Finish'], 3], [['Ladder Drill', 'Band Pull', 'Wall Sit', 'Plank Hold'], 2], [['Foam Roll', 'Jump Rope', 'Stretch Out', 'Water Break'], 1]],
};
const DIRECTOR = {
  'Tara Tucker': { moves: [['Rotation Reset', 3], ['Lineup Card', 2], ['Timeout', 1, 'shield:20']], flavor: 'Sets the schedule the whole club runs on. Holds the lineup card.' },
  'Damon Sichler': { moves: [['Schedule Shuffle', 3], ['Gym Booking', 2], ['Challenge Flag', 1, 'shield:20']], flavor: 'Books the gym, orders the uniforms, still runs the drill.' },
};
// damage by element and cost (multiples of 5); every 1-cost attack is 10, directors 15. Middles hit hardest and carry the least HP.
const POW = { Fighter: { 2: [15, 25], 3: [25, 35] }, Fire: { 2: [15, 25], 3: [25, 35] }, Psychic: { 2: [15, 20], 3: [25, 30] }, Rock: { 3: [35, 35] }, Grass: { 3: [25, 30] }, Wind: { 2: [15, 20] }, Water: { 2: [15, 25], 3: [25, 35] }, Shiny: { 1: [15, 15], 2: [20, 25], 3: [30, 35] } };
const HPB = { Fighter: [90, 100], Fire: [90, 100], Psychic: [90, 100], Rock: [70, 80], Grass: [110, 120], Wind: [110, 120], Water: [90, 100], Shiny: [120, 140] };
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
const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
const slug = n => 'coach-' + n.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
const esc = s => s.replace(/&/g, '&amp;');
function mk(n, r, team, opts = {}) {
  const pos = opts.director ? 'Director' : POS[n]; const el = ELEM[pos]; const h = hash(n + r);
  const id = slug(n) + (opts.director ? '-director' : '');
  const head = r.startsWith('Head');
  const hb = HPB[el];
  const s = { el, pos, hp: hb[0] + (h >>> 3) % ((hb[1] - hb[0]) / 10 + 1) * 10 + (head ? 10 : 0), atk: 50 + (h >>> 7) % 40, def: 45 + (h >>> 11) % 40, spd: 40 + (h >>> 15) % 50,
    moves: (opts.director ? DIRECTOR[n].moves : MOVES[el]).map(([names, cost, kind], i) => { const name = Array.isArray(names) ? names[(h >>> (21 + i * 3)) % names.length] : names; const [lo, hi] = POW[el][cost] || [10, 10]; return { name, cost, kind: kind || 'atk', pow: kind ? 0 : lo + ((h >>> (18 + i * 2)) % ((hi - lo) / 5 + 1)) * 5 }; }),
    weak: PERSONAL[n] || WPOOL[(h >>> 9) % WPOOL.length], flavor: opts.director ? DIRECTOR[n].flavor : FLAVOR[el][(h >>> 5) % FLAVOR[el].length], seed: h, jersey: ['black', 'teal', 'white'][(h >>> 13) % 3] };
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
  const teamHref = t => o.live ? `teams.html#${A[t]}` : `${SITE}teams.html#${A[t]}`;
  const tgt = o.live ? '' : ' target="_blank" rel="noopener"';
  const photoOf = p => REAL.has(p.id) ? IMG + 'cut/' + p.id + '.webp' : null;
  const art = p => photoOf(p) ? `<img src="${photoOf(p)}" alt="${p.n}, ${esc(p.r)}" width="480" height="520" loading="lazy">` : `<canvas class="spr" data-id="${p.id}" width="60" height="84" role="img" aria-label="${p.n}, ${esc(p.r)} (pixel sprite placeholder)"></canvas>`;
  const card = p => `
      <article class="card el-${p.s.el}${p.director ? ' shiny' : ''}" id="${p.id}">
        <div class="ci">
          <header class="ch"><span class="stage">${esc(p.r)}</span><h4>${p.n}</h4><span class="hp"><b data-hp>${p.s.hp}</b> HP</span><span class="ty" title="${p.s.el} (${p.s.pos})">${ICON[p.s.el]}</span></header>
          <div class="ph">${art(p)}</div>
          <div class="meta"><span>${esc(p.team)}</span><span>${p.director ? 'Director' : p.s.pos + ' &middot; ' + p.s.el}</span></div>
          <ul class="moves">${p.s.moves.map(m => `
            <li><span class="cost">${dots(m.cost)}</span><span class="mn">${m.name}</span><span class="dmg">${m.kind === 'atk' ? m.pow : '<small>blocks</small>' + m.kind.split(':')[1]}</span></li>`).join('')}
          </ul>
          <p class="flavor">${p.s.flavor}</p>
          <footer class="cfoot"><span><small>weak</small>${p.s.weak}</span><span><small>resist</small>${RESIST[p.s.el]}</span><span><small>retreat</small>${dots(1 + (p.s.def > 70 ? 1 : 0))}</span><span class="no">${String(p.no).padStart(2, '0')}/${ALLP.length} <em>${rar(p)}</em></span></footer>
        </div>
        <div class="cb" aria-hidden="true"><img src="${IMG}ryl-logo.webp" alt="" loading="lazy" width="700" height="584"><span>Colorado Boom</span></div>
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
#tc .hero .hero-btn{margin-top:18px;font-size:16px;padding:14px 32px}
#tc .hero p{max-width:680px;color:rgba(255,255,255,.94);font-size:17px;margin:0}
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
#tc .card{container-type:inline-size;position:relative;min-width:0;display:flex;padding:7px;border-radius:12px;scroll-margin-top:90px;transform-style:preserve-3d;will-change:transform;transition:transform .25s var(--ease),box-shadow .25s var(--ease);box-shadow:0 10px 30px rgba(0,0,0,.6);background:linear-gradient(160deg,var(--f1) 0%,var(--f2) 28%,var(--f3) 50%,var(--f2) 72%,var(--f1) 100%)}
#tc .el-Fighter{--f1:#ff9a4d;--f2:#b3410f;--f3:#ffd1a6;--tint:#ff8a3d}
#tc .el-Psychic{--f1:#ff7ae0;--f2:#6d1fb8;--f3:#f3c9ff;--tint:#d66cff}
#tc .el-Fire{--f1:#ff5a36;--f2:#b51d05;--f3:#ffc46b;--tint:#ff6a3d}
#tc .el-Rock{--f1:#d9b27c;--f2:#6e4f22;--f3:#f6e4c4;--tint:#c9a063}
#tc .el-Grass{--f1:#7ee081;--f2:#166e2d;--f3:#d4ffd6;--tint:#63d46a}
#tc .el-Wind{--f1:#cfefff;--f2:#3f8fbf;--f3:#ffffff;--tint:#8fd1f2}
#tc .el-Water{--f1:#5ec8ff;--f2:#0b4f8f;--f3:#c9eeff;--tint:#4fb7f2}
#tc .card.shiny{--tint:#fff;background:conic-gradient(from var(--ang,0deg),#ff5a5a,#ffd36b,#7dff8a,#5ad7ff,#8f7bff,#ff6bd6,#ff5a5a);animation:holo 6s linear infinite}
@property --ang{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes holo{to{--ang:360deg}}
#tc .card.shiny .ph::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(120deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.35) 35%,rgba(120,220,255,.35) 50%,rgba(255,120,220,.3) 65%,rgba(255,255,255,0) 100%);background-size:250% 250%;mix-blend-mode:screen;animation:sheen 4s ease-in-out infinite alternate;pointer-events:none}
@keyframes sheen{from{background-position:0% 0%}to{background-position:100% 100%}}
#tc .card:target,#tc .card.is-hit{outline:3px solid var(--gold);outline-offset:4px}
#tc .ci{flex:1;min-width:0;border-radius:7px;background:var(--ink);display:grid;grid-template-rows:auto auto auto auto 1fr auto;overflow:hidden;color:#fff;backface-visibility:hidden}
/* card back: RYL comic burst on black pinstripe with a gold frame; .flipped turns the card over */
#tc .cb{position:absolute;inset:0;border-radius:12px;backface-visibility:hidden;transform:rotateY(180deg);background:#070707 repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0 2px,transparent 2px 12px);display:grid;place-items:center;overflow:hidden;box-shadow:inset 0 0 0 7px var(--gold),inset 0 0 0 9px #000}
#tc .cb::before{content:"";position:absolute;inset:14px;border:2px solid var(--gold);border-radius:6px;opacity:.7}
#tc .cb img{width:80%;height:auto;filter:drop-shadow(0 6px 10px rgba(0,0,0,.8))}
#tc .cb span{position:absolute;bottom:18px;left:0;right:0;text-align:center;font-family:var(--display);font-size:max(12px,6cqw);letter-spacing:.22em;color:var(--gold);text-transform:uppercase}
#tc .card.flipped{transform:rotateY(180deg)!important}#tc .fighter .card{transition:transform .7s var(--ease),box-shadow .25s var(--ease)}
#tc .tiles,#tc .lead-grid,#tc .train-grid,#tc .fighter{perspective:1100px}#tc .tiles .card,#tc .lead-grid .card,#tc .train-grid .card{cursor:pointer}
#tc .ch{display:grid;grid-template-columns:1fr auto auto;grid-template-areas:"stage stage stage" "name hp ty";align-items:center;column-gap:2.2cqw;padding:1.6cqw 3cqw 1.2cqw;background:linear-gradient(90deg,color-mix(in srgb,var(--tint) 28%,transparent),transparent)}
#tc .ch .stage{grid-area:stage;font-family:'Montserrat',sans-serif;font-weight:700;font-size:max(8px,3.6cqw);letter-spacing:.14em;text-transform:uppercase;color:var(--gold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#tc .ch h4{grid-area:name;font-family:var(--display);font-weight:400;font-size:max(15px,7.4cqw);line-height:1;letter-spacing:.01em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0;color:#fff}
#tc .ch .hp{grid-area:hp;font-family:'Montserrat',sans-serif;font-weight:900;font-size:max(9px,3.8cqw);letter-spacing:.04em;white-space:nowrap}#tc .ch .hp b{font-size:max(12px,5.6cqw);color:#ff5a4e}
#tc .ch .ty{grid-area:ty;width:max(20px,8.6cqw);height:max(20px,8.6cqw);border-radius:50%;display:grid;place-items:center;font-size:max(12px,5.2cqw);font-weight:900;line-height:1;color:#000;background:var(--tint);box-shadow:0 0 0 2px #fff,0 0 0 3.5px rgba(0,0,0,.7)}
#tc .card.shiny .ch .ty{background:#000;color:#fff;box-shadow:0 0 0 2px var(--gold),0 0 0 3.5px rgba(0,0,0,.7)}
#tc .ph{position:relative;margin:1cqw 3cqw 0;aspect-ratio:1.42;border:2px solid color-mix(in srgb,var(--tint) 60%,#fff 0%);overflow:hidden;min-height:0;background:repeating-conic-gradient(from 0deg at 50% 68%,rgba(255,255,255,.13) 0 5deg,transparent 5deg 15deg),radial-gradient(ellipse 70% 80% at 50% 70%,color-mix(in srgb,var(--tint) 65%,#fff) 0%,var(--tint) 40%,color-mix(in srgb,var(--tint) 45%,#000) 100%)}
#tc .card.shiny .ph{background:repeating-conic-gradient(from 0deg at 50% 68%,rgba(255,255,255,.18) 0 5deg,transparent 5deg 15deg),radial-gradient(ellipse 70% 80% at 50% 70%,#fff2b8 0%,var(--gold) 40%,#6b5400 100%)}
#tc .ph img{position:absolute;left:0;bottom:0;width:100%;height:96%;object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 5px 6px rgba(0,0,0,.5))}
#tc .ph canvas.spr{position:absolute;left:50%;bottom:4%;height:88%;width:auto;transform:translateX(-50%);image-rendering:pixelated;filter:drop-shadow(0 5px 6px rgba(0,0,0,.5))}
#tc .ph canvas.spr.flip{transform:translateX(-50%) scaleX(-1)}
#tc .ph::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.25) 50%,rgba(255,255,255,0) 70%);transform:translateX(-120%);transition:transform .7s var(--ease);pointer-events:none;z-index:2}
#tc .card:hover .ph::after{transform:translateX(120%)}
#tc .meta{margin:1.4cqw 3cqw 0;padding:.8cqw 2cqw;display:flex;justify-content:space-between;gap:6px;background:color-mix(in srgb,var(--tint) 16%,transparent);border:1px solid color-mix(in srgb,var(--tint) 40%,transparent);font-family:'Montserrat',sans-serif;font-weight:700;font-size:max(8.5px,3.4cqw);letter-spacing:.06em;text-transform:uppercase}
#tc .meta span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
#tc .moves{list-style:none;margin:1.4cqw 3cqw 0;padding:0;display:grid;gap:1px}
#tc .moves li{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:2.2cqw;font-family:'Montserrat',sans-serif;font-size:max(10.5px,4.6cqw);font-weight:700;padding:.6cqw 0;border-bottom:1px solid rgba(255,255,255,.08)}
#tc .cost{display:inline-flex;gap:3px}#tc .cost i,#tc .cfoot i{width:max(9px,3.8cqw);height:max(9px,3.8cqw);border-radius:50%;background:var(--tint);box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.45),0 0 0 1.5px rgba(255,255,255,.75);display:inline-block}
#tc .mn{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#tc .dmg{font-family:var(--display);font-size:max(14px,6.4cqw);letter-spacing:.04em}#tc .dmg small{font-family:'Montserrat',sans-serif;font-size:max(7px,2.8cqw);letter-spacing:.1em;text-transform:uppercase;margin-right:3px;color:#fff}
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
#tc #px{display:block;width:100%;aspect-ratio:16/10;image-rendering:pixelated;image-rendering:crisp-edges;border:3px solid #000;box-shadow:0 0 0 2px var(--gold),0 16px 40px rgba(0,0,0,.6);background:#0a3d43}
#tc .shield{position:absolute;inset:-6px;border-radius:14px;box-shadow:0 0 0 3px #8fd1f2,0 0 30px rgba(143,209,242,.8);pointer-events:none;animation:shieldIn .4s var(--ease)}
@keyframes shieldIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}
#tc .vb{position:absolute;left:0;top:0;width:46px;height:46px;z-index:6;pointer-events:none;filter:drop-shadow(0 6px 6px rgba(0,0,0,.55))}
#tc .log{margin-top:12px;max-height:160px;overflow:auto;font-size:15px;line-height:1.5;border-top:1px solid rgba(255,255,255,.12);padding-top:8px;max-width:900px;margin-inline:auto}
#tc .log p{margin:0}#tc .log p b{color:var(--gold)}
#tc .winner{font-family:var(--display);font-size:clamp(30px,4vw,48px);color:var(--gold);text-align:center;margin:8px 0 0;min-height:1em}
#tc .lunge-l{animation:lungeL .55s var(--ease)}#tc .lunge-r{animation:lungeR .55s var(--ease)}
@keyframes lungeL{30%{transform:translateX(44px) rotate(3deg)}60%{transform:translateX(-8px)}100%{transform:none}}
@keyframes lungeR{30%{transform:translateX(-44px) rotate(-3deg)}60%{transform:translateX(8px)}100%{transform:none}}
#tc .hit{animation:hit .5s}@keyframes hit{0%,100%{filter:none;transform:none}20%{filter:brightness(2.2) saturate(0);transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
#tc .pop{position:absolute;left:50%;top:30%;transform:translateX(-50%);font-family:var(--display);font-size:48px;color:#ff5a4e;text-shadow:0 2px 0 #000,0 0 18px rgba(255,90,78,.7);animation:pop 1s var(--ease) forwards;pointer-events:none;z-index:5}
#tc .pop.blk{color:#8fd1f2;text-shadow:0 2px 0 #000,0 0 18px rgba(143,209,242,.8);font-size:32px}
#tc .pop.chg{color:var(--gold);text-shadow:0 2px 0 #000,0 0 18px rgba(229,184,0,.8);font-size:30px}
@keyframes pop{from{opacity:0;transform:translate(-50%,10px) scale(.6)}25%{opacity:1;transform:translate(-50%,-10px) scale(1.15)}to{opacity:0;transform:translate(-50%,-60px) scale(1)}}
#tc .ko{filter:grayscale(1) brightness(.5);transform:translateY(12px) scale(.96)!important;transition:filter .6s,transform .6s}/* no rotation: a rotated card in the left corner painted its right edge clipped after a fight (Chrome compositor), see round 9 */
#tc .champ{box-shadow:0 0 0 3px var(--gold),0 0 60px rgba(229,184,0,.7)!important;animation:champ 1.2s ease-in-out infinite alternate}
@keyframes champ{to{box-shadow:0 0 0 3px #fff,0 0 90px rgba(229,184,0,.95)}}
/* You Play: the left card's move rows become buttons, Charge sits in the portrait; in 16-Bit View a 4-button pad */
#tc .card.pickable .moves li{transition:background .15s}#tc .card.pickable .moves li.can{cursor:pointer;background:rgba(229,184,0,.16);outline:2px solid var(--gold);outline-offset:-2px;animation:canPulse .9s ease-in-out infinite alternate}
#tc .card.pickable .moves li.no{opacity:.38}#tc .card.pickable .moves li.can:hover,#tc .card.pickable .moves li.can:focus-visible{background:var(--gold);color:#000;outline-color:#fff;animation:none}#tc .card.pickable .moves li.can:hover .dmg small,#tc .card.pickable .moves li.can:focus-visible .dmg small{color:#000}#tc .card.pickable .moves li.can:hover .cost i{background:#000}
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
#tc .dex-btn.hide{display:none}
/* end-of-fight overlays over the ring: big K.O., then winner + streak + Next Opponent */
#tc .ring .ov{position:absolute;left:0;right:0;top:42%;transform:translateY(-50%);z-index:8;display:grid;justify-items:center;gap:10px;pointer-events:none;text-align:center}
#tc .ring .ov[hidden]{display:none}
#tc .kobig{font-family:var(--display);font-size:clamp(96px,18vw,220px);line-height:.9;color:#ff5a4e;-webkit-text-stroke:3px #000;text-shadow:0 10px 0 #000,0 0 50px rgba(255,90,78,.9);animation:kobig .9s cubic-bezier(.2,1.4,.4,1) both}
@keyframes kobig{from{opacity:0;transform:scale(3.2) rotate(-10deg)}55%{opacity:1;transform:scale(.92) rotate(2deg)}to{transform:scale(1)}}
#tc .ov .wname{font-family:var(--display);font-size:clamp(32px,5.5vw,60px);color:var(--gold);text-shadow:0 4px 0 #000,0 0 30px rgba(0,0,0,.95);animation:kobig .7s cubic-bezier(.2,1.4,.4,1) both}
#tc .ov .streak{font-family:'Montserrat',sans-serif;font-weight:900;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.8);padding:5px 14px;border:1px solid var(--gold)}
#tc .ov .btn{pointer-events:auto;font-size:18px;padding:16px 36px;box-shadow:0 12px 40px rgba(0,0,0,.8)}
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
@media(max-width:1000px){#tc .grid{grid-template-columns:repeat(2,1fr)}#tc .span-3{grid-column:1/-1}}
@media(max-width:560px){#tc .grid{grid-template-columns:1fr}#tc .grp{grid-column:1/-1}#tc .tiles{grid-template-columns:repeat(2,1fr)}#tc .bt .sub{display:none}#tc .ring{grid-template-columns:1fr;gap:6px}#tc .ring .vs{font-size:36px}#tc .pick{grid-template-columns:1fr}#tc .pick .vsm{display:none}#tc .ring.px{grid-template-columns:1fr 1fr}#tc .hero .hero-btn{display:block;text-align:center}#tc .pxopts{flex-wrap:wrap;justify-content:center;width:100%}#tc .pxopts select{max-width:100%}#tc .pad{position:static;transform:none;margin-top:8px;width:100%;justify-content:flex-start}#tc .pl{font-size:10px}#tc .turnlbl{font-size:15px}}
@media(max-width:400px){#tc .tiles{grid-template-columns:1fr}#tc .lead-grid,#tc .train-grid{grid-template-columns:1fr}}
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
      <div><label for="selL">Left corner</label><select id="selL"><option value="">Choose a card</option>${opts}</select></div>
      <span class="vsm" aria-hidden="true">VS</span>
      <div><label for="selR">Right corner</label><select id="selR"><option value="">Choose a card</option>${opts}</select></div>
    </div>
    <div class="row"><button type="button" class="btn" id="btnRandom">Random Matchup</button><button type="button" class="btn btn-line" id="btnFight" disabled>Fight!</button><button type="button" class="btn btn-line" id="btnNext" disabled title="The winner stays in and fights a new random opponent right away">Next Fight</button><button type="button" class="btn btn-line" id="btnSound" aria-pressed="true">Sound: On</button></div>
    <div class="row"><button type="button" class="btn btn-tab" id="mAuto" aria-pressed="true">Auto Play</button><button type="button" class="btn btn-tab" id="mPlay" aria-pressed="false" title="You pick the left corner's move each turn; the AI plays the right corner">You Play</button></div>
    <div class="row"><button type="button" class="btn btn-tab" id="vCard" aria-pressed="true">Card View</button><button type="button" class="btn btn-tab" id="vPx" aria-pressed="false">16-Bit View</button>
      <span class="pxopts" id="pxopts" hidden><label>Gym <select id="selGym"><option value="fieldhouse">Boomtown Fieldhouse</option><option value="arena">Championship Arena</option><option value="beach">Beach Night</option><option value="retro">Retro Gym</option></select></label><label>Sprites <select id="selStyle"><option value="photo">Photo</option><option value="rpg">RPG</option></select></label></span></div>
    <div class="ring" id="ring"><div class="pxwrap" id="pxwrap"><canvas id="px" width="320" height="200" role="img" aria-label="Pixel-art replay of the fight"></canvas>
      <div class="pad" id="pad" hidden role="group" aria-label="Your move">
        <div class="dia"><button type="button" class="pb pb-y" data-i="0" aria-label="Y: first move">Y</button><button type="button" class="pb pb-x" data-i="1" aria-label="X: second move">X</button><button type="button" class="pb pb-a" data-i="2" aria-label="A: third move">A</button><button type="button" class="pb pb-b" data-i="3" aria-label="B: Charge">B</button></div>
        <ul class="pl"><li data-i="0"><i class="y"></i><span></span></li><li data-i="1"><i class="x"></i><span></span></li><li data-i="2"><i class="a"></i><span></span></li><li data-i="3"><i class="b"></i><span>Charge <b>+3</b></span></li></ul>
        <button type="button" class="pauto" id="padAuto" title="Let the AI play the rest of this fight">Auto</button>
      </div></div><p class="empty" id="ringEmpty">Pick two cards above, or press Random Matchup.</p>
      <div class="ov" id="koOv" hidden aria-live="assertive"><div class="kobig">K.O.</div></div>
      <div class="ov" id="nextOv" hidden><div class="wname" id="ovName"></div><div class="streak" id="ovStreak"></div><button type="button" class="btn" id="ovNext">Next Opponent &rarr;</button></div></div>
    <p class="winner" id="winner"></p>
    <div class="log" id="log"></div>
  </div>
</div></section>`;
  const SCRIPT = `<script>
(function(){
  var DATA=${JSON.stringify(Object.fromEntries(ALLP.map(p => [p.id, { n: p.n, no: p.no, s: p.s, photo: photoOf(p), shiny: p.director }])))};
  var WEAK=${JSON.stringify(WEAK)},RESIST=${JSON.stringify(RESIST)},TINT=${JSON.stringify(TINT)};
  var PERSONAL={'coach-damon-sichler':['coach-tara-tucker','coach-tara-tucker-director'],'coach-damon-sichler-director':['coach-tara-tucker','coach-tara-tucker-director']};
  var $=function(i){return document.getElementById(i);};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MAXE=6,GAIN=3,CHARGE=3;
  /* ---- RPG sprite: 20x28 volleyball player. Front frames carry the jersey number; side frames face the opponent. ---- */
  var F={
    idle:['........HHHH........','.......HHHHHH.......','......HHHHHHHH......','......HHSSSSHH......','......HSSSSSSH......','......SSWSSWSS......','......SSSSSSSS......','.......SSSSSS.......','........SSSS........','......JJJJJJJJ......','.....JJJJJJJJJJ.....','....SJJJJJJJJJJS....','....SJJJJJJJJJJS....','....S.JJJJJJJJ.S....','......JJJJJJJJ......','......KKKKKKKK......','......KKKKKKKK......','......KKK..KKK......','......SSS..SSS......','......SSS..SSS......','......NNN..NNN......','......NNN..NNN......','......SSS..SSS......','......SSS..SSS......','......EEE..EEE......','.....EEEE..EEEE.....','....................','....................'],
    run:['........HHHH........','.......HHHHHH.......','......HHHHHHHH......','......HHSSSSHH......','......HSSSSSSH......','......SSWSSWSS......','......SSSSSSSS......','.......SSSSSS.......','........SSSS........','......JJJJJJJJ......','...S.JJJJJJJJJJ.....','...SJJJJJJJJJJJS....','....JJJJJJJJJJJ.S...','......JJJJJJJJ..S...','......JJJJJJJJ......','......KKKKKKKK......','.....KKKKKKKKKK.....','.....KKK....KKK.....','.....SSS....SSS.....','....SSS......SSS....','....NNN......NNN....','....NNN......NNN....','...SSS........SSS...','...SSS........SSS...','...EEE........EEE...','..EEEE........EEEE..','....................','....................'],
    spike:['........HHHH.....S..','.......HHHHHH....S..','......HHHHHHHH...S..','......HHSSSSHH...S..','......HSSSSSSH...S..','......SSWSSWSS...S..','......SSSSSSSS..S...','.......SSSSSS...S...','........SSSS...S....','......JJJJJJJJ.S....','.....JJJJJJJJJJS....','....SJJJJJJJJJJJ....','....SJJJJJJJJJJ.....','....S.JJJJJJJJ......','......JJJJJJJJ......','......KKKKKKKK......','......KKKKKKKK......','......KKK..KKK......','......SSS..SSS......','......NNN..NNN......','......NNN..NNN......','......SSS..SSS......','......EEE..EEE......','.....EEEE..EEEE.....','....................','....................','....................','....................'],
    block:['..S.....HHHH.....S..','..S....HHHHHH....S..','..S...HHHHHHHH...S..','..S...HHSSSSHH...S..','..S...HSSSSSSH...S..','..S...SSWSSWSS...S..','...S..SSSSSSSS..S...','...S...SSSSSS...S...','....S...SSSS...S....','....SJJJJJJJJJJS....','.....JJJJJJJJJJ.....','....JJJJJJJJJJJJ....','....JJJJJJJJJJJJ....','......JJJJJJJJ......','......JJJJJJJJ......','......KKKKKKKK......','......KKKKKKKK......','......KKK..KKK......','......SSS..SSS......','......NNN..NNN......','......NNN..NNN......','......SSS..SSS......','......EEE..EEE......','.....EEEE..EEEE.....','....................','....................','....................','....................'],
    side:['........HHHH........','.......HHHHHH.......','......HHHHHHHH......','......HHHHSSSS......','......HHHSSSSS......','......HHHSSWSS......','......HHHSSSSS......','.......HHSSSS.......','........SSSS........','........JJJJ........','.......JJJJJJ.......','.......JJJJJJS......','.......JJJJJJS......','.......JJJJJJ.......','.......JJJJJJ.......','.......KKKKKK.......','.......KKKKKK.......','.......KKKKKK.......','........SSSS........','........SSSS........','........NNNN........','........NNNN........','........SSSS........','........SSSS........','........EEEE........','........EEEEE.......','....................','....................'],
    siderun:['........HHHH........','.......HHHHHH.......','......HHHHHHHH......','......HHHHSSSS......','......HHHSSSSS......','......HHHSSWSS......','......HHHSSSSS......','.......HHSSSS.......','........SSSS........','........JJJJ........','.......JJJJJJ.......','.......JJJJJJSS.....','......SJJJJJJ.......','.......JJJJJJ.......','.......JJJJJJ.......','.......KKKKKK.......','......KKKKKKKK......','.....KKK..KKKK......','....SSS....SSS......','...SSS......SSS.....','...NNN......NNN.....','..NNN........NNN....','..SSS........SSS....','.SSS..........SSS...','.EEE..........EEE...','EEEE..........EEEE..','....................','....................'],
    sidespike:['........HHHH...S....','.......HHHHHH..S....','......HHHHHHHH.S....','......HHHHSSSS.S....','......HHHSSSSS.S....','......HHHSSWSSS.....','......HHHSSSSS......','.......HHSSSS.......','........SSSS........','........JJJJ........','.......JJJJJJ.......','......SJJJJJJ.......','......SJJJJJJ.......','.......JJJJJJ.......','.......JJJJJJ.......','.......KKKKKK.......','.......KKKKKK.......','........KKKK........','........SSSS........','........NNNN........','........SSSS........','........EEEE........','.......EEEEE........','....................','....................','....................','....................','....................'],
    dance1:['........HHHH........','.......HHHHHH.......','......HHHHHHHH......','......HHSSSSHH......','...S..HSSSSSSH......','...S..SSWSSWSS......','...S..SSSSSSSS......','...S...SSSSSS.......','...S....SSSS........','...S..JJJJJJJJ......','....SJJJJJJJJJJ.....','......JJJJJJJJJS....','......JJJJJJJJJS....','......JJJJJJJJ.S....','......JJJJJJJJ......','......KKKKKKKK......','......KKKKKKKK......','......KKK..KKK......','......SSS..SSS......','......SSS..SSS......','......NNN..NNN......','......NNN..NNN......','......SSS..SSS......','......SSS..SSS......','......EEE..EEE......','.....EEEE..EEEE.....','....................','....................'],
    dance2:['........HHHH........','.......HHHHHH.......','......HHHHHHHH......','......HHSSSSHH......','......HSSSSSSH..S...','......SSWSSWSS..S...','......SSSSSSSS..S...','.......SSSSSS...S...','........SSSS....S...','......JJJJJJJJ..S...','.....JJJJJJJJJJS....','....SJJJJJJJJJ......','....SJJJJJJJJJ......','....S.JJJJJJJJ......','......JJJJJJJJ......','......KKKKKKKK......','......KKKKKKKK......','......KKK..KKK......','......SSS..SSS......','......SSS..SSS......','......NNN..NNN......','......NNN..NNN......','......SSS..SSS......','......SSS..SSS......','......EEE..EEE......','.....EEEE..EEEE.....','....................','....................'],
    ko:['....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','....................','..HHHSSSJJJJJJKKSSEE','.HHHSWSSJJJJJJKKSSEE','.HHHSSSSJJJJJJKKSSEE','..HHHSSSJJJJJJKKSSEE','....................','....................','....................','....................','....................']
  };
  var DIG={'0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['111','001','111','100','111'],'3':['111','001','111','001','111'],'4':['101','101','111','001','001'],'5':['111','100','111','001','111'],'6':['111','100','111','101','111'],'7':['111','001','001','001','001'],'8':['111','101','111','101','111'],'9':['111','101','111','001','111']};
  var SKIN=['#f6dcc4','#efc9a6','#e4b48d','#d19b70'],HAIR=['#1a1410','#3b2416','#5a3a22','#8a5a2b','#c9a063','#d9b35c','#6b2a1a'];
  var JERSEY={black:{J:'#161616',D:'#0E7C86',num:'#ffffff'},teal:{J:'#0E7C86',D:'#065A62',num:'#ffffff'},white:{J:'#f2f2f2',D:'#0E7C86',num:'#111111'}};
  function paletteFor(id){var d=DATA[id],h=d.s.seed,j=JERSEY[d.s.jersey];return {H:HAIR[(h>>>2)%HAIR.length],S:SKIN[(h>>>6)%SKIN.length],J:j.J,D:j.D,K:'#1a1a1a',N:'#ffffff',W:'#101010',E:'#f2f2f2',num:j.num,no:d.no};}
  var FRONT={idle:1,run:1,spike:1,block:1,dance1:1,dance2:1};var SIDE=/^side/;
  function rpgFrame(name,pal,sc){var rows=F[name],w=20,h=28,c=document.createElement('canvas');c.width=w;c.height=h;var k=c.getContext('2d'),op=[],x,y;
    for(y=0;y<h;y++){op[y]=[];for(x=0;x<w;x++){var ch=rows[y][x];op[y][x]=ch!=='.';if(ch!=='.'){k.fillStyle=pal[ch]||'#f0f';k.fillRect(x,y,1,1);}}}
    if(FRONT[name]){var s=String(pal.no),x0=s.length===1?8:6;k.fillStyle=pal.num;for(var di=0;di<s.length;di++){var g2=DIG[s[di]];for(y=0;y<5;y++)for(x=0;x<3;x++)if(g2[y][x]==='1')k.fillRect(x0+di*4+x,10+y,1,1);}}
    k.fillStyle='#14101a';for(y=0;y<h;y++)for(x=0;x<w;x++){if(op[y][x])continue;if((x>0&&op[y][x-1])||(x<w-1&&op[y][x+1])||(y>0&&op[y-1][x])||(y<h-1&&op[y+1][x]))k.fillRect(x,y,1,1);}
    if(sc===1)return c;var o=document.createElement('canvas');o.width=w*sc;o.height=h*sc;var ok=o.getContext('2d');ok.imageSmoothingEnabled=false;ok.drawImage(c,0,0,o.width,o.height);return o;}
  function rpgSet(pal,sc){var s={};Object.keys(F).forEach(function(n){s[n]=rpgFrame(n,pal,sc||1);});return s;}
  var SETS3={};function set3(id){if(!SETS3[id])SETS3[id]=rpgSet(paletteFor(id),3);return SETS3[id];}
  function drawCard(cv,id,fr){var k=cv.getContext('2d');k.imageSmoothingEnabled=false;k.clearRect(0,0,cv.width,cv.height);k.drawImage(set3(id)[fr]||set3(id).idle,0,0);}
  document.querySelectorAll('canvas.spr').forEach(function(c){drawCard(c,c.dataset.id,'idle');});
  /* sound */
  var AC=null,soundOn=true;function ctx(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;}}return AC;}
  function noise(dur,f0,f1,vol){var c=ctx();if(!c||!soundOn)return;var b=c.createBuffer(1,c.sampleRate*dur,c.sampleRate),d=b.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;var s=c.createBufferSource();s.buffer=b;var f=c.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(f0,c.currentTime);f.frequency.exponentialRampToValueAtTime(f1,c.currentTime+dur);var g=c.createGain();g.gain.setValueAtTime(vol,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+dur);s.connect(f).connect(g).connect(c.destination);s.start();}
  function tone(freq,dur,type,vol,when){var c=ctx();if(!c||!soundOn)return;var o=c.createOscillator(),g=c.createGain();o.type=type||'sine';var t=c.currentTime+(when||0);o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,freq*.5),t+dur);g.gain.setValueAtTime(vol||.2,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(c.destination);o.start(t);o.stop(t+dur);}
  var SFX={whoosh:function(){noise(.25,400,2400,.25);},hit:function(){tone(140,.25,'sine',.5);noise(.12,1200,300,.35);},block:function(){tone(880,.12,'square',.12);tone(1320,.18,'square',.1,.06);},ko:function(){tone(300,.5,'sawtooth',.25);tone(150,.7,'sawtooth',.2,.15);},win:function(){[523,659,784,1047].forEach(function(f,i){tone(f,.25,'triangle',.22,i*.12);});tone(1047,.6,'triangle',.25,.5);},draw:function(){noise(.18,800,3000,.18);tone(660,.15,'triangle',.15,.05);},jump:function(){tone(520,.1,'square',.08);tone(780,.1,'square',.06,.06);},charge:function(){tone(330,.2,'triangle',.1);tone(440,.2,'triangle',.1,.12);tone(660,.25,'triangle',.12,.24);},
    whistle:function(){tone(2600,.14,'square',.07);tone(2600,.22,'square',.07,.18);},crit:function(){[880,1175,1480,1760].forEach(function(f,i){tone(f,.12,'square',.09,i*.05);});},
    thud:function(){noise(.18,120,60,.5);tone(70,.3,'sine',.4);},crowd:function(){noise(1.3,300,1400,.22);noise(.9,600,2200,.12);},
    ready:function(){tone(660,.08,'square',.08);tone(990,.12,'square',.08,.08);},negate:function(){tone(1200,.08,'square',.14);tone(1800,.16,'square',.12,.05);noise(.14,2000,600,.25);}};
  $('btnSound').addEventListener('click',function(){soundOn=!soundOn;this.textContent='Sound: '+(soundOn?'On':'Off');this.setAttribute('aria-pressed',String(soundOn));if(soundOn)SFX.draw();});
  function wait(ms){return new Promise(function(r){setTimeout(r,reduce?0:ms);});}
  /* ---- 16-bit court ---- */
  var PX=(function(){
    var cv=$('px'),g=cv.getContext('2d');var W=320,H=200,NET=160,FY=170,SC=2;var FAR=98,NEAR=188;
    var st={L:null,R:null,fx:[],sparks:[],ball:null,shake:0,flash:0,on:false,t:0,style:'photo'};
    var BALL=['....WWWWW....','..WWWWWWWWW..','.WWWWGWWWWWW.','.WWWGWWWWWGW.','WWWGWWWWWWWGW','WWGWWWWWWWWGW','WWGWWWWWWWWGW','WWGWWWWWWWWGW','WWWGWWWWWWGWW','.WWWGWWWWGWW.','.WWWWGGGGWWW.','..WWWWWWWWW..','....WWWWW....'],BC={W:'#fbfbfb',G:'#c4c9cc'},BR=6;
    var GYMS={
      fieldhouse:{sky:['#0b2f34','#0d3a40'],band:'#0E7C86',trim:'#E5B800',floor:'#8a5a2b',plank:'#704620',court:'#a3692f',zone:'#b5783a',line:'#E5B800',post:'#222',wall:true},
      arena:{sky:['#0d1424','#121c33'],band:'#1b2a4d',trim:'#ff7a1f',floor:'#2a4d8f',plank:'#24427c',court:'#e07a1f',zone:'#ea8d3a',line:'#ffffff',post:'#ddd',crowd:['#ff5a4e','#49d26a','#f2c200','#5ad7ff','#ffffff','#ff6bd6']},
      beach:{sky:['#ff9a4d','#ff5a7a','#7a2a7a','#2a1a4a'],band:'#ffd36b',trim:'#ffffff',floor:'#e8c98a',plank:'#d9b674',court:'#f0d49c',zone:'#f6dfb0',line:'#ffffff',post:'#8a5a2b',sun:true},
      retro:{sky:['#7a3b2e','#6a3327'],band:'#c9a063',trim:'#3b1f1a',floor:'#c9a063',plank:'#b08a50',court:'#d8b676',zone:'#e2c48a',line:'#8b1e1e',post:'#333',brick:true}
    };
    function cx(y,xFar,xNear){var p=(y-FAR)/(NEAR-FAR);return xFar+(xNear-xFar)*p;}
    function poly(k,pts,col){k.fillStyle=col;k.beginPath();k.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)k.lineTo(pts[i][0],pts[i][1]);k.closePath();k.fill();}
    var LOGO=new Image(),curGym='fieldhouse';LOGO.onload=function(){if(curGym==='fieldhouse')bg=buildBg('fieldhouse');};LOGO.src='${IMG}ryl-logo.webp';
    function wall(k){var x;/* upper wall: teal with a gold stripe and a window run (mostly behind the HUD once a fight is set up) */
      k.fillStyle='#0E7C86';k.fillRect(0,0,W,16);k.fillStyle='#0a5a62';for(x=0;x<W;x+=8)k.fillRect(x,0,1,16);k.fillStyle='#E5B800';k.fillRect(0,14,W,2);
      k.fillStyle='#9ad7e8';[12,60,224,272].forEach(function(wx){k.fillRect(wx,3,36,9);k.fillStyle='#062d32';k.fillRect(wx+17,3,2,9);k.fillRect(wx,7,36,1);k.fillStyle='#9ad7e8';});
      /* lower wall: black padded mats with teal seams and a gold pinstripe */
      k.fillStyle='#101416';k.fillRect(0,16,W,FAR-14-16);k.fillStyle='#0E7C86';for(x=0;x<W;x+=32)k.fillRect(x,16,2,FAR-14-16);k.fillStyle='rgba(255,255,255,.06)';for(x=0;x<W;x+=32)k.fillRect(x+2,16,30,1);k.fillStyle='#E5B800';k.fillRect(0,46,W,1);
      /* RYL comic-burst banners either side of the net, below the HUD */
      if(LOGO.complete&&LOGO.naturalWidth){var lw=56,lh=Math.round(lw*LOGO.naturalHeight/LOGO.naturalWidth),ly=FAR-14-lh-2;[100,220].forEach(function(cxp){var lx=Math.round(cxp-lw/2);k.fillStyle='#000';k.fillRect(lx-4,ly-3,lw+8,lh+5);k.fillStyle='#0E7C86';k.fillRect(lx-4,ly-3,lw+8,1);k.fillRect(lx-4,ly+lh+1,lw+8,1);k.imageSmoothingEnabled=true;k.imageSmoothingQuality='high';k.drawImage(LOGO,lx,ly,lw,lh);k.imageSmoothingEnabled=false;});}}
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
      k.fillStyle=G.post;k.fillRect(NET-3,FAR-42,3,44);k.fillRect(NET-3,NEAR-44,3,46);k.fillRect(NET,FAR-42,3,44);k.fillRect(NET,NEAR-44,3,46);
      k.fillStyle='rgba(240,240,240,.55)';for(y=FAR-38;y<NEAR-2;y+=4)k.fillRect(NET-4,y,8,1);for(x=NET-4;x<NET+5;x+=4)k.fillRect(x,FAR-38,1,NEAR-FAR+36);
      k.fillStyle='#f8f8f8';k.fillRect(NET-5,FAR-42,10,3);k.fillRect(NET-5,FAR-42,2,NEAR-FAR);k.fillRect(NET+3,FAR-42,2,NEAR-FAR);
      return c;}
    var bg=buildBg('fieldhouse');
    function photoSprite(src){return new Promise(function(res){var im=new Image();im.onload=function(){var SW=30,SH=38;
      var mid=document.createElement('canvas');mid.width=SW*4;mid.height=SH*4;var mk=mid.getContext('2d');
      var s=Math.min(mid.width/im.naturalWidth,mid.height/im.naturalHeight),dw=im.naturalWidth*s,dh=im.naturalHeight*s;mk.drawImage(im,(mid.width-dw)/2,mid.height-dh,dw,dh);
      var c=document.createElement('canvas');c.width=SW;c.height=SH;var k=c.getContext('2d');k.drawImage(mid,0,0,SW,SH);
      var d;try{d=k.getImageData(0,0,SW,SH);}catch(err){res(null);return;}var p=d.data,n=SW*SH,op=new Uint8Array(n),i;
      for(i=0;i<n;i++){if(p[i*4+3]<110){p[i*4+3]=0;continue;}op[i]=1;for(var ch=0;ch<3;ch++){var v=p[i*4+ch];v=Math.min(255,Math.round(((v-128)*1.15+128)/40)*40);p[i*4+ch]=Math.max(0,v);}p[i*4+3]=255;}
      for(i=0;i<n;i++){if(op[i])continue;var x=i%SW,y=(i/SW)|0;if((x>0&&op[i-1])||(x<SW-1&&op[i+1])||(y>0&&op[i-SW])||(y<SH-1&&op[i+SW])){p[i*4]=20;p[i*4+1]=16;p[i*4+2]=24;p[i*4+3]=255;}}
      k.putImageData(d,0,0);res({kind:'photo',frames:{idle:c}});};im.onerror=function(){res(null);};im.src=src;});}
    function whiteOf(c){var w=document.createElement('canvas');w.width=c.width;w.height=c.height;var wk=w.getContext('2d');wk.drawImage(c,0,0);wk.globalCompositeOperation='source-in';wk.fillStyle='#fff';wk.fillRect(0,0,w.width,w.height);return w;}
    function makeSprite(id){var d=DATA[id];var rpg={kind:'rpg',frames:rpgSet(paletteFor(id),1)};
      if(st.style==='photo'&&d.photo)return photoSprite(d.photo).then(function(p){return p||rpg;});return Promise.resolve(rpg);}
    function fighter(side,id,spr){var f={side:side,id:id,spr:spr,frame:'idle',home:side==='L'?64:W-64,x:0,oy:0,ox:0,hp:DATA[id].s.hp,max:DATA[id].s.hp,shown:DATA[id].s.hp,energy:0,hit:0,shield:0,hide:false,gone:false,shiny:!!DATA[id].shiny,white:{}};f.x=f.home;return f;}
    function frameOf(f){return f.spr.frames[f.frame]||f.spr.frames.idle;}
    function drawBall(x,y,fl){var r,c,ch,N=BALL.length;g.fillStyle='#2a2a2a';for(r=0;r<N;r++)for(c=0;c<N;c++){ch=BALL[r][c];if(ch!=='.'){g.fillRect(x-BR-1+c,y-BR+r,1,1);g.fillRect(x-BR+1+c,y-BR+r,1,1);g.fillRect(x-BR+c,y-BR-1+r,1,1);g.fillRect(x-BR+c,y-BR+1+r,1,1);}}
      for(r=0;r<N;r++)for(c=0;c<N;c++){ch=BALL[r][fl?N-1-c:c];if(ch==='.')continue;g.fillStyle=BC[ch];g.fillRect(x-BR+c,y-BR+r,1,1);}}
    function drawF(f){if(!f||!f.spr||f.hide||f.gone)return;var c=frameOf(f),w=c.width*SC,h=c.height*SC,x=Math.round(f.x-w/2+f.ox),y=Math.round(FY-h+f.oy);
      g.fillStyle='rgba(0,0,0,.35)';g.fillRect(Math.round(f.x-w/2+6+f.ox),FY-2,w-12,3);
      g.save();if(f.side==='R'&&SIDE.test(f.frame)){g.translate(f.x+f.ox,0);g.scale(-1,1);g.translate(-(f.x+f.ox),0);}
      g.imageSmoothingEnabled=false;if(f.hit>0){if(!f.white[f.frame])f.white[f.frame]=whiteOf(c);g.drawImage(f.white[f.frame],x,y,w,h);}else g.drawImage(c,x,y,w,h);g.restore();
      if(f.shield>0&&!f.blocking&&((st.t/90)|0)%2===0){g.strokeStyle='#8fd1f2';g.lineWidth=2;g.strokeRect(x-3,y-3,w+6,h+6);}
      if(f.shiny){var tw=(st.t/120)|0;for(var i=0;i<3;i++){var sx=x+((tw*7+i*23)%(w+16))-8,sy=y+((tw*5+i*31)%(h+10))-6;if(((tw+i)%4)===0){g.fillStyle='#ffe680';g.fillRect(sx,sy,2,2);g.fillRect(sx-1,sy+1,1,1);g.fillRect(sx+2,sy+1,1,1);}}}}
    function panel(f,x){if(!f)return;var d=DATA[f.id],el=d.s.el;g.fillStyle='#111';g.fillRect(x,4,132,38);g.fillStyle='#f6f6f6';g.fillRect(x+1,5,130,36);
      g.fillStyle=TINT[el];g.fillRect(x+5,9,10,10);g.fillStyle='#000';g.font='7px "Press Start 2P",monospace';g.textBaseline='top';g.textAlign='left';g.fillText(el[0],x+7,11);
      g.fillStyle='#111';g.fillText(d.n.toUpperCase().slice(0,15),x+19,10);
      g.fillStyle='#E5B800';g.fillText('HP',x+5,24);var pct=Math.max(0,f.shown)/f.max;g.fillStyle='#333';g.fillRect(x+22,23,46,8);g.fillStyle=pct>.5?'#49d26a':pct>.2?'#f2c200':'#ff5a4e';g.fillRect(x+23,24,Math.round(44*pct),6);
      g.fillStyle='#111';g.textAlign='right';g.fillText(Math.max(0,Math.round(f.shown))+'/'+f.max,x+127,24);g.textAlign='left';
      for(var i=0;i<MAXE;i++){g.fillStyle=i<f.energy?'#E5B800':'#cfcfcf';g.fillRect(x+22+i*11,34,9,4);}g.fillStyle='#555';g.font='5px "Press Start 2P",monospace';g.fillText('EN',x+6,34);}
    var tweens=[];function tween(dur,fn){if(reduce)dur=0;return new Promise(function(res){tweens.push({t0:performance.now(),dur:dur,fn:fn,res:res});});}
    function fxText(txt,x,y,col){st.fx.push({txt:txt,x:x,y:y,col:col,t0:performance.now()});}
    function sparks(x,y,cols,n){for(var i=0;i<n;i++){var a=Math.random()*Math.PI*2,v=1.2+Math.random()*2.4;st.sparks.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1.2,col:cols[i%cols.length],t0:performance.now(),life:380+Math.random()*260});}st.sparks.push({ring:1,x:x,y:y,t0:performance.now(),life:280,col:cols[0]});}
    function drawSparks(now){for(var i=st.sparks.length-1;i>=0;i--){var p=st.sparks[i],q=(now-p.t0)/p.life;if(q>=1){st.sparks.splice(i,1);continue;}
      if(p.ring){g.strokeStyle=p.col;g.lineWidth=2;g.globalAlpha=1-q;g.beginPath();g.arc(p.x,p.y,4+q*22,0,Math.PI*2);g.stroke();g.globalAlpha=1;continue;}
      var t=q*p.life/16;g.fillStyle=p.col;g.globalAlpha=1-q;g.fillRect(Math.round(p.x+p.vx*t),Math.round(p.y+p.vy*t+.12*t*t),2,2);g.globalAlpha=1;}}
    function frame(now){st.t=now;var i;
      for(i=tweens.length-1;i>=0;i--){var tw=tweens[i],p=tw.dur?Math.min(1,(now-tw.t0)/tw.dur):1;tw.fn(p);if(p>=1){tweens.splice(i,1);tw.res();}}
      ['L','R'].forEach(function(s){var f=st[s];if(!f)return;f.shown+=(Math.max(0,f.hp)-f.shown)*.12;if(Math.abs(f.shown-Math.max(0,f.hp))<.5)f.shown=Math.max(0,f.hp);if(f.hit>0)f.hit--;});
      g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);
      if(st.shake>0){g.translate(Math.round(Math.random()*4-2),Math.round(Math.random()*4-2));st.shake--;}
      g.drawImage(bg,0,0);drawF(st.L);drawF(st.R);
      if(st.ball)drawBall(st.ball.x,st.ball.y,st.ball.f);
      drawSparks(now);
      g.font='8px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='alphabetic';
      for(i=st.fx.length-1;i>=0;i--){var e=st.fx[i],q=(now-e.t0)/900;if(q>=1){st.fx.splice(i,1);continue;}g.globalAlpha=1-q*q;g.fillStyle='#000';g.fillText(e.txt,e.x+1,e.y-q*26+1);g.fillStyle=e.col;g.fillText(e.txt,e.x,e.y-q*26);g.globalAlpha=1;}
      panel(st.L,4);panel(st.R,W-4-132);
      if(st.flash>0){g.fillStyle='rgba(255,255,255,'+st.flash+')';g.fillRect(0,0,W,H);st.flash=Math.max(0,st.flash-.2);}
      if(st.on)requestAnimationFrame(frame);}
    function start(){if(!st.on){st.on=true;requestAnimationFrame(frame);}}
    start();
    function runTo(f,tx){var sx=f.x,dist=Math.abs(tx-sx);if(f.spr.kind!=='rpg'||dist<2)return Promise.resolve();return tween(Math.max(120,dist*7),function(p){f.x=sx+(tx-sx)*p;f.frame=((p*dist/8)|0)%2?'siderun':'side';}).then(function(){f.frame='side';});}
    function nearNet(f){return f.side==='L'?NET-34:NET+34;}
    return {
      gym:function(k){curGym=k;bg=buildBg(k);},
      style:function(s){st.style=s;var a=st.L&&st.L.id,b=st.R&&st.R.id;if(!a)return Promise.resolve();return Promise.all([makeSprite(a),makeSprite(b)]).then(function(r){st.L.spr=r[0];st.L.white={};st.R.spr=r[1];st.R.white={};st.L.frame=st.R.frame='idle';});},
      setup:function(a,b){return Promise.all([makeSprite(a),makeSprite(b),document.fonts?document.fonts.load('8px "Press Start 2P"').catch(function(){}):null]).then(function(r){st.L=fighter('L',a,r[0]);st.R=fighter('R',b,r[1]);st.fx=[];st.sparks=[];st.ball=null;tweens=[];start();});},
      hp:function(side,hp){st[side].hp=hp;},
      energy:function(side,e){st[side].energy=e;},
      charge:function(a){var A=st[a];fxText('CHARGE',A.x,FY-frameOf(A).height*SC-8,'#E5B800');return tween(500,function(p){A.oy=-4*Math.abs(Math.sin(p*Math.PI*3));}).then(function(){A.oy=0;});},
      attack:function(a,d,blk){var A=st[a],D=st[d];var rpg=A.spr.kind==='rpg',drpg=D.spr.kind==='rpg';
        return runTo(A,nearNet(A)).then(function(){SFX.jump();if(rpg)A.frame='sidespike';return tween(260,function(p){A.oy=-(rpg?26:16)*Math.sin(p*Math.PI);});}).then(function(){
          var h=frameOf(A).height*SC,sx=A.side==='L'?A.x+10:A.x-10,sy=FY-h-6,dh=frameOf(D).height*SC,ex=D.x+(D.side==='L'?22:-22),ey=FY-5;
          if(blk){var bx=nearNet(D);ex=bx;ey=FY-dh-(drpg?22:12)-4;var dx0=D.x;tween(200,function(p){D.x=dx0+(bx-dx0)*p;D.frame=drpg?(((p*6)|0)%2?'siderun':'side'):'idle';}).then(function(){if(drpg)D.frame='block';D.blocking=1;SFX.jump();return tween(240,function(p){D.oy=-(drpg?22:12)*Math.sin(p*Math.PI/2);});});}
          st.ball={x:sx,y:sy,f:0};SFX.whoosh();
          return tween(480,function(p){st.ball.x=sx+(ex-sx)*p;st.ball.y=sy+(ey-sy)*p-70*Math.sin(p*Math.PI);st.ball.f=((p*12)|0)%2;});}).then(function(){A.oy=0;runTo(A,A.home).then(function(){A.frame='idle';});});},
      impact:function(d,amt,blocked,crit){var D=st[d],dir=D.side==='L'?-1:1,b=st.ball,bx=b?b.x:D.x,by=b?b.y:FY-30,top=FY-frameOf(D).height*SC-8;
        if(blocked){/* the ball meets the hands: deflect it back over the net, no damage flash unless some got through */
          D.shield=0;sparks(bx,by,['#8fd1f2','#ffffff','#E5B800'],12);fxText(amt>0?'BLOCK':'BLOCKED!',D.x,top-14,'#8fd1f2');st.shake=amt>0?8:4;if(amt>0){st.flash=.5;D.hit=6;fxText('-'+amt,D.x,top+4,'#ff5a4e');}
          var back=-dir*58;tween(520,function(p){if(!st.ball)return;st.ball.x=bx+back*p;st.ball.y=by+(FY-6-by)*p*p-26*Math.sin(p*Math.PI);st.ball.f=((p*10)|0)%2;}).then(function(){st.ball=null;});
          return tween(260,function(p){D.oy=-(D.spr.kind==='rpg'?22:12)*(1-p);}).then(function(){D.oy=0;D.blocking=0;return runTo(D,D.home);}).then(function(){D.frame='idle';});}
        st.flash=crit?1:.75;st.shake=crit?16:10;D.hit=8;sparks(bx,by,crit?['#ffd36b','#ff5a4e','#ffffff','#E5B800']:['#ff5a4e','#ffd36b','#ffffff'],crit?22:14);
        tween(320,function(p){D.ox=Math.round(Math.sin(p*28)*3*(1-p)*dir*-1);});fxText('-'+amt,D.x,top,'#ff5a4e');if(crit)fxText('CRITICAL',D.x,top-14,'#ffd36b');
        tween(420,function(p){if(!st.ball)return;st.ball.x=bx+dir*34*p;st.ball.y=FY-6-26*Math.abs(Math.sin(p*Math.PI))*(1-p*.5);st.ball.f=((p*10)|0)%2;}).then(function(){st.ball=null;});return Promise.resolve();},
      block:function(d,amt){var D=st[d];var rpg=D.spr.kind==='rpg';D.shield=1;fxText('BLOCK READY '+amt,D.x,FY-frameOf(D).height*SC-8,'#8fd1f2');if(rpg)D.frame='block';return tween(500,function(p){D.oy=-3*Math.abs(Math.sin(p*Math.PI*2));}).then(function(){D.oy=0;D.frame='idle';});},
      ko:function(l,w){var Lf=st[l],Wf=st[w];Lf.shield=Wf.shield=0;return tween(600,function(p){Lf.hide=((p*12)|0)%2===1;}).then(function(){Lf.hide=false;if(Lf.spr.kind==='rpg'){Lf.frame='ko';return tween(500,function(){});}return tween(500,function(p){Lf.oy=p*p*90;});}).then(function(){if(Lf.spr.kind!=='rpg')Lf.gone=true;fxText('K.O.',Lf.x,FY-40,'#ff5a4e');
        if(Wf.spr.kind==='rpg')return tween(1800,function(p){Wf.frame=((p*9)|0)%2?'dance2':'dance1';Wf.oy=-5*Math.abs(Math.sin(p*Math.PI*9));}).then(function(){Wf.oy=0;Wf.frame='dance1';});
        return tween(700,function(p){Wf.oy=-14*Math.abs(Math.sin(p*Math.PI*2));});}).then(function(){fxText('WINNER',Wf.x,FY-frameOf(Wf).height*SC-10,'#E5B800');});}
    };
  })();
  /* ---- arena ---- */
  var L=null,R=null,busy=false,selL=$('selL'),selR=$('selR'),lastWin=null,view='card',mode='auto',streak=0,streakId=null;
  var VB='<svg viewBox="0 0 40 40" width="46" height="46" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#fbfbfb" stroke="#2a2a2a" stroke-width="2"/><path d="M8 8c8 6 10 16 6 28M32 8c-8 6-10 16-6 28M3 24c10-4 24-4 34 0" fill="none" stroke="#b9bfc4" stroke-width="2"/></svg>';
  function pips(e){var s='<small>Energy</small>';for(var i=0;i<MAXE;i++)s+='<i class="'+(i<e?'on':'')+'"></i>';return s;}
  function clone(id,side){var c=$(id).cloneNode(true);c.id='fight-'+side;c.classList.add('flipped');c.removeAttribute('tabindex');var s=DATA[id].s;var w=document.createElement('div');w.className='fighter';w.id='f'+side;
    w.insertAdjacentHTML('beforeend','<div class="fname">'+DATA[id].n+'</div>');w.appendChild(c);
    var spr=c.querySelector('canvas.spr');if(spr)drawCard(spr,id,'idle');
    w.insertAdjacentHTML('beforeend','<div class="hpbar"><b></b></div><div class="hpnum"><span data-cur>'+s.hp+'</span> / '+s.hp+' HP</div><div class="en" data-en>'+pips(0)+'</div>');return w;}
  function same(a,b){return a.replace('-director','')===b.replace('-director','');}
  function setup(a,b){SFX.draw();L={id:a,s:DATA[a].s,hp:DATA[a].s.hp,shield:0,side:'L',energy:0,round:0};R={id:b,s:DATA[b].s,hp:DATA[b].s.hp,shield:0,side:'R',energy:0,round:0};
    var ring=$('ring');ring.querySelectorAll('.fighter,.vs,.empty,.vb').forEach(function(n){n.remove();});ring.appendChild(clone(a,'L'));ring.insertAdjacentHTML('beforeend','<div class="vs">VS</div>');ring.appendChild(clone(b,'R'));
    $('winner').textContent='';$('nextOv').hidden=true;$('koOv').hidden=true;$('log').innerHTML='<p><b>'+DATA[a].n+'</b> ('+DATA[a].s.el+') vs <b>'+DATA[b].n+'</b> ('+DATA[b].s.el+'). Press Fight.</p>';$('btnFight').disabled=true;$('btnNext').disabled=true;lastWin=null;
    setTimeout(function(){var l=$('fight-L'),r=$('fight-R');if(l)l.classList.remove('flipped');setTimeout(function(){if(r)r.classList.remove('flipped');SFX.draw();},reduce?0:260);},reduce?0:380);
    return PX.setup(a,b).then(function(){$('btnFight').disabled=false;});}
  function fromSelects(){var a=selL.value,b=selR.value;if(busy)return;if(!a||!b){L=R=null;$('btnFight').disabled=true;return;}
    if(same(a,b)){$('log').innerHTML='<p>Pick two different people. A coach cannot fight their own other card.</p>';$('btnFight').disabled=true;L=R=null;return;}setup(a,b);}
  selL.addEventListener('change',fromSelects);selR.addEventListener('change',fromSelects);
  function randomOpp(a){var ids=Object.keys(DATA),b;do{b=ids[Math.floor(Math.random()*ids.length)];}while(same(a,b));return b;}
  function randomPair(keep,side){var ids=Object.keys(DATA),a=keep||ids[Math.floor(Math.random()*ids.length)],b;do{b=ids[Math.floor(Math.random()*ids.length)];}while(same(a,b));return side==='R'?[b,a]:[a,b];}
  $('btnRandom').addEventListener('click',function(){if(busy)return;var p=randomPair();selL.value=p[0];selR.value=p[1];setup(p[0],p[1]);});
  $('btnNext').addEventListener('click',function(){if(busy||!lastWin)return;var p=mode==='play'?[L.id,randomOpp(L.id)]:randomPair(lastWin.id,lastWin.side);selL.value=p[0];selR.value=p[1];setup(p[0],p[1]).then(fight);});
  function setMode(m,force){if(busy&&!force)return;mode=m;$('mAuto').setAttribute('aria-pressed',String(m==='auto'));$('mPlay').setAttribute('aria-pressed',String(m==='play'));$('btnNext').title=m==='play'?'Your card stays in and meets a new random opponent':'The winner stays in and fights a new random opponent right away';if(L)logp(m==='play'?'<b>You Play:</b> you control the left corner. Pick a move each turn; the AI plays the right.':'<b>Auto Play:</b> both corners play themselves.');}
  $('ovNext').addEventListener('click',function(){$('btnNext').click();});
  $('mAuto').addEventListener('click',function(){setMode('auto');});$('mPlay').addEventListener('click',function(){setMode('play');});
  $('battleNow').addEventListener('click',function(e){e.preventDefault();$('arena').scrollIntoView({behavior:'smooth',block:'start'});if(!L&&!busy)$('btnRandom').click();else $('btnFight').focus({preventScroll:true});});
  /* play mode: the user picks from the card's moves (or holds energy). Resolves with a move or null. */
  function userMove(att){var card=$('f'+att.side).querySelector('.card'),ph=card.querySelector('.ph'),lis=card.querySelectorAll('.moves li'),pad=$('pad'),pbs=pad.querySelectorAll('.pb'),pls=pad.querySelectorAll('.pl li');
    return new Promise(function(res){
      function done(mv){lis.forEach(function(li){li.classList.remove('can','no');li.removeAttribute('role');li.removeAttribute('tabindex');li.removeAttribute('aria-disabled');li.onclick=li.onkeydown=null;});card.classList.remove('pickable');var c=ph.querySelector('.chg');if(c)c.remove();var t=card.querySelector('.turnlbl');if(t)t.remove();pad.hidden=true;pbs.forEach(function(b){b.onclick=null;});pls.forEach(function(l){l.onclick=null;});$('padAuto').onclick=null;$('dexBtn').classList.remove('hide');res(mv);}
      function key(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();this.click();}}
      card.classList.add('pickable');card.insertAdjacentHTML('beforeend','<span class="turnlbl">Your move &middot; '+att.energy+' energy</span>');
      att.s.moves.forEach(function(m,i){var ok=m.cost<=att.energy,li=lis[i],pb=pbs[i],pl=pls[i],go=ok?function(){done(m);}:null;
        li.classList.add(ok?'can':'no');li.setAttribute('role','button');li.setAttribute('tabindex',ok?'0':'-1');li.setAttribute('aria-disabled',String(!ok));li.onclick=go;li.onkeydown=key;
        pb.disabled=!ok;pl.classList.toggle('no',!ok);pl.querySelector('span').innerHTML=esc(m.name)+' <b>'+(m.kind==='atk'?m.pow:'stops '+m.kind.split(':')[1])+'</b> '+'\u25cf'.repeat(m.cost);pb.onclick=go;pl.onclick=go;});
      pbs[3].disabled=false;pls[3].classList.remove('no');pbs[3].onclick=pls[3].onclick=function(){done(null);};$('padAuto').onclick=function(){setMode('auto',true);done(pickMove(att));};
      var chg=document.createElement('button');chg.type='button';chg.className='chg';chg.innerHTML='&#9889; Charge <b>+'+CHARGE+'</b>';chg.title='Skip the swing and bank '+CHARGE+' energy';chg.onclick=function(){done(null);};ph.appendChild(chg);
      pad.hidden=false;$('dexBtn').classList.add('hide');
      if(view==='px'){var f=pad.querySelector('.pb:not(:disabled)');if(f)f.focus({preventScroll:true});if(window.innerWidth<=560)pad.scrollIntoView({behavior:'smooth',block:'nearest'});}
      else{var l=card.querySelector('.moves li.can');(l||chg).focus({preventScroll:true});card.scrollIntoView({behavior:'smooth',block:'nearest'});}});}
  function burst(card,blk){var b=document.createElement('span');b.className='burst'+(blk?' blk':'');card.appendChild(b);setTimeout(function(){b.remove();},600);}
  $('selGym').addEventListener('change',function(){PX.gym(this.value);});
  $('selStyle').addEventListener('change',function(){if(busy){this.value=this.value==='photo'?'rpg':'photo';return;}PX.style(this.value);});
  function setView(v){view=v;$('vCard').setAttribute('aria-pressed',String(v==='card'));$('vPx').setAttribute('aria-pressed',String(v==='px'));$('ring').classList.toggle('px',v==='px');$('pxopts').hidden=v!=='px';}
  $('vCard').addEventListener('click',function(){setView('card');});$('vPx').addEventListener('click',function(){setView('px');});
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function logp(h){var l=$('log');l.insertAdjacentHTML('beforeend','<p>'+h+'</p>');l.scrollTop=l.scrollHeight;}
  /* damage: card power x a narrow attack/defense ratio (.85-1.15), x1.5 weak, x.7 resist, x2 personal weakness */
  function dmg(att,def,mv){var ratio=Math.max(.85,Math.min(1.15,att.s.atk/def.s.def));var base=mv.pow*ratio;var note='';
    if(WEAK[def.s.el]===att.s.el){base*=1.5;note=' Super effective!'}else if(RESIST[def.s.el]===att.s.el){base*=.7;note=' Not very effective.'}
    if((PERSONAL[def.id]||[]).indexOf(att.id)>=0){base*=2;note=' '+DATA[def.id].n.split(' ')[0]+'\\u2019s one true weakness!'}
    return {d:Math.max(5,Math.round(base/5)*5),note:note};}
  function hpUI(f){var box=$('f'+f.side);box.querySelector('[data-cur]').textContent=Math.max(0,f.hp);var b=box.querySelector('.hpbar b');var pct=Math.max(0,f.hp)/f.s.hp*100;b.style.width=pct+'%';b.classList.toggle('low',pct<30);PX.hp(f.side,f.hp);}
  function enUI(f){$('f'+f.side).querySelector('[data-en]').innerHTML=pips(f.energy);PX.energy(f.side,f.energy);}
  /* card-art sprite animation: turn toward the opponent, run, spike; defender flashes */
  function cardSpr(f){var c=$('f'+f.side).querySelector('canvas.spr');return c||null;}
  function spriteSeq(f,frames,ms,flip){var c=cardSpr(f);if(!c)return Promise.resolve();var i=0;return new Promise(function(res){(function step(){c.classList.toggle('flip',!!flip&&SIDE.test(frames[i]));drawCard(c,f.id,frames[i]);i++;if(i<frames.length)setTimeout(step,reduce?0:ms);else res();})();});}
  function spriteIdle(f){var c=cardSpr(f);if(c){c.classList.remove('flip');drawCard(c,f.id,'idle');}}
  /* card-view projectile: from the attacker's art window to the centre of the defender's art window */
  function cardBall(att,def){var ring=$('ring');if(ring.classList.contains('px'))return wait(740);var blk=def.shield>0||def._blk;var ap=$('f'+att.side).querySelector('.ph'),dp=$('f'+def.side).querySelector('.ph');
    var rr=ring.getBoundingClientRect(),a=ap.getBoundingClientRect(),d=dp.getBoundingClientRect();
    var sx=(att.side==='L'?a.right-34:a.left-12)-rr.left,sy=a.top+a.height*.3-rr.top,ex=d.left+d.width/2-23-rr.left,ey=d.top+d.height/2-23-rr.top;if(blk){ey=d.top-rr.top-40;}
    var b=document.createElement('span');b.className='vb';b.innerHTML=VB;ring.appendChild(b);
    var anim=b.animate([{transform:'translate('+sx+'px,'+sy+'px) rotate(0deg) scale(.8)'},{transform:'translate('+((sx+ex)/2)+'px,'+(Math.min(sy,ey)-90)+'px) rotate(360deg) scale(1.15)',offset:.5},{transform:'translate('+ex+'px,'+ey+'px) rotate(720deg) scale(1)'}],{duration:reduce?0:740,easing:'linear',fill:'forwards'});
    return anim.finished.catch(function(){}).then(function(){var bx=blk?(sx+ex)/2:ex,by=blk?ey+120:ey+60;return b.animate([{opacity:1,transform:'translate('+ex+'px,'+ey+'px) rotate(720deg)'},{opacity:0,transform:'translate('+bx+'px,'+by+'px) rotate('+(blk?400:800)+'deg) scale(.6)'}],{duration:reduce?0:(blk?520:300),fill:'forwards'}).finished.catch(function(){});}).then(function(){b.remove();});}
  function pickMove(att){var aff=att.s.moves.filter(function(m){return m.cost<=att.energy;});if(!aff.length)return null;
    var best=att.s.moves.reduce(function(a,b){return a.cost>=b.cost?a:b;});var maxAff=aff.reduce(function(a,b){return a.cost>=b.cost?a:b;});
    /* hold energy for a bigger move when it arrives next round */
    if(best.cost>maxAff.cost&&att.energy+CHARGE>=best.cost&&Math.random()<.5)return null;
    var w=aff.map(function(m){return m.cost*m.cost;}),t=w.reduce(function(a,b){return a+b;},0),r=Math.random()*t;for(var i=0;i<aff.length;i++){r-=w[i];if(r<=0)return aff[i];}return aff[aff.length-1];}
  async function turn(att,def){att.round++;att.energy=Math.min(MAXE,att.energy+Math.min(GAIN,att.round));enUI(att);
    var ac=$('f'+att.side).querySelector('.card'),dc=$('f'+def.side).querySelector('.card');
    var mv=(mode==='play'&&att===L)?await userMove(att):pickMove(att);
    if(!mv){var cp=document.createElement('span');cp.className='pop chg';cp.textContent='CHARGE +'+CHARGE;ac.appendChild(cp);SFX.charge();att.energy=Math.min(MAXE,att.energy+CHARGE);enUI(att);logp('<b>'+DATA[att.id].n+'</b> charges up: +'+CHARGE+' energy ('+att.energy+' banked).');await Promise.all([PX.charge(att.side),spriteSeq(att,['block','idle'],250),wait(800)]);cp.remove();return;}
    att.energy=Math.max(0,att.energy-mv.cost);enUI(att);
    if(mv.kind!=='atk'){var amt=parseInt(mv.kind.split(':')[1],10);att.shield=amt;var sh=document.createElement('span');sh.className='shield';ac.appendChild(sh);SFX.block();
      var p=document.createElement('span');p.className='pop blk';p.textContent='BLOCK READY';ac.appendChild(p);SFX.ready();logp('<b>'+DATA[att.id].n+'</b> sets up '+esc(mv.name)+' ('+mv.cost+' energy): it triggers when the next ball comes over and stops up to '+amt+'.');await Promise.all([PX.block(att.side,amt),spriteSeq(att,['block','block','idle'],300),wait(900)]);p.remove();return;}
    ac.classList.add(att.side==='L'?'lunge-l':'lunge-r');SFX.whoosh();var flip=att.side==='R';
    var r=dmg(att,def,mv),d=r.d,blocked=0,willBlock=def.shield>0;def._blk=willBlock;if(willBlock){blocked=Math.min(def.shield,d);d-=blocked;def.shield=0;}
    var seq=spriteSeq(att,['side','siderun','side','siderun','sidespike'],110,flip);var ballP=cardBall(att,def);
    if(willBlock){/* the defender goes up as the ball crosses: card jumps, sprite shows the block frame */setTimeout(function(){dc.classList.add('blockup');spriteSeq(def,['block','block','block','idle'],200,def.side==='L');},reduce?0:300);}
    await PX.attack(att.side,def.side,willBlock);
    var crit=r.note.indexOf('effective!')>0||r.note.indexOf('weakness')>0;
    var sh=dc.querySelector('.shield');if(sh)sh.remove();var pop=document.createElement('span');pop.className='pop'+(d>0?'':' blk');pop.textContent=d>0?'-'+d:'BLOCKED!';dc.appendChild(pop);
    if(willBlock){SFX.negate();burst(dc,true);if(d>0){dc.classList.add('hit');SFX.hit();}}else{dc.classList.add('hit');SFX.hit();if(crit){SFX.crit();}else{SFX.thud();}burst(dc,false);}
    var impP=PX.impact(def.side,d,willBlock,crit);
    def.hp-=d;hpUI(def);logp('<b>'+DATA[att.id].n+'</b> used '+esc(mv.name)+' ('+mv.cost+' energy) for '+(d+blocked)+'.'+(willBlock?(d>0?' <b>'+DATA[def.id].n.split(' ')[0]+'</b> got a hand on it: the block stopped '+blocked+', '+d+' got through.':' <b>'+DATA[def.id].n.split(' ')[0]+'</b> blocked it clean. Nothing got through.'):'')+r.note);
    await Promise.all([ballP,seq,impP,wait(650)]);ac.classList.remove('lunge-l','lunge-r');dc.classList.remove('hit','blockup');pop.remove();spriteIdle(att);def._blk=false;}
  async function fight(){if(busy||!L)return;busy=true;$('btnFight').disabled=true;$('btnNext').disabled=true;$('btnRandom').disabled=true;selL.disabled=selR.disabled=true;
    SFX.whistle();var first=L.s.spd>=R.s.spd?L:R,second=first===L?R:L;if(mode==='play')logp('<b>You Play:</b> you control <b>'+DATA[L.id].n+'</b> on the left.');logp('<b>'+DATA[first.id].n+'</b> is faster and goes first. Energy: 1 in round 1, 2 in round 2, then 3 a round. Charge skips the swing and banks +'+CHARGE+'.');
    var t=0;while(L.hp>0&&R.hp>0&&t<80){var att=t%2===0?first:second,def=att===L?R:L;await turn(att,def);t++;await wait(220);}
    var win=L.hp>0?L:R,lose=win===L?R:L;$('f'+lose.side).querySelector('.card').classList.add('ko');var kc=cardSpr(lose);if(kc)drawCard(kc,lose.id,'ko');SFX.ko();$('koOv').hidden=false;var koP=PX.ko(lose.side,win.side);await wait(1300);$('koOv').hidden=true;$('f'+win.side).querySelector('.card').classList.add('champ');SFX.win();SFX.crowd();spriteSeq(win,['dance1','dance2','dance1','dance2','dance1','dance2','dance1','dance2','dance1'],220);
    if(mode==='play'){if(win===L){streak=streakId===L.id?streak+1:1;streakId=L.id;}else{streak=0;streakId=null;}}else{streak=win.id===streakId?streak+1:1;streakId=win.id;}
    $('winner').textContent=DATA[win.id].n+' wins!'+(streak>1?' \u00b7 '+streak+' in a row':'');logp('<b>'+DATA[win.id].n+'</b> wins with '+Math.max(0,win.hp)+' HP left. '+(mode==='play'?(win===L?'You win! ':'The AI takes it. ')+'Next Fight keeps your card in against a new opponent.':'Next Fight keeps the champion in.'));await koP;busy=false;lastWin=win;$('ovName').textContent=DATA[win.id].n+' wins!';$('ovStreak').textContent=(mode==='play'?'Your win streak: ':'Win streak: ')+streak;$('nextOv').hidden=false;$('btnNext').disabled=false;$('btnRandom').disabled=false;selL.disabled=selR.disabled=false;}
  $('btnFight').addEventListener('click',fight);
  /* boomdex */
  var b=$('dexBtn'),f=$('dex'),x=$('dexX');function open(){f.hidden=false;b.setAttribute('aria-expanded','true');f.querySelector('select').focus();}function close(){f.hidden=true;b.setAttribute('aria-expanded','false');}
  b.addEventListener('click',function(){f.hidden?open():close();});x.addEventListener('click',close);
  $('dexBattle').addEventListener('click',function(){close();$('arena').scrollIntoView({behavior:'smooth',block:'start'});$('btnRandom').focus({preventScroll:true});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!f.hidden){close();b.focus();}});
  ['selTeam','selCoach'].forEach(function(id){var s=$(id);s.addEventListener('change',function(){var el=$(s.value);if(!el)return;var g=el.closest('.grp')||el;g.scrollIntoView({behavior:'smooth',block:'start'});el.classList.add('is-hit');setTimeout(function(){el.classList.remove('is-hit');},1800);s.value='';close();});});
  if(matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches){document.querySelectorAll('#tc .tiles .card,#tc .lead-grid .card,#tc .train-grid .card').forEach(function(c){c.addEventListener('pointermove',function(e){if(c.classList.contains('flipped'))return;var r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(700px) rotateX('+(-py*8)+'deg) rotateY('+(px*10)+'deg) translateY(-4px)';});c.addEventListener('pointerleave',function(){c.style.transform='';});});}
  document.querySelectorAll('#tc .tiles .card,#tc .lead-grid .card,#tc .train-grid .card').forEach(function(c){c.tabIndex=0;c.title='Click to flip';function flip(){c.style.transition='transform .6s var(--ease)';c.style.transform='';c.classList.toggle('flipped');setTimeout(function(){c.style.transition='';},700);}
    c.addEventListener('click',flip);c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();flip();}});});
})();
</script>`;
  const hero = `<section class="hero pat"><img src="${IMG}hero-cast.jpg" alt="" width="1800" height="640"><div class="wrap"><span class="eyebrow">Colorado Boom</span><h1>Coaching Staff</h1><p>Meet the coaches of Colorado Boom Volleyball Club. Our staff brings years of playing and coaching experience to every practice, with a focus on skill development, competitive play and building confident athletes on and off the court.</p><a class="btn hero-btn" href="#arena" id="battleNow">Battle Now &darr;</a></div></section>`;
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
module.exports = { render, ALLP, REAL };

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
