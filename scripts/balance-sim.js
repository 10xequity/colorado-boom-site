// Balance simulator for the Battle Arena. Round-robins every card against every other with the in-game AI on both
// sides (battle-core.js, the same rules the page runs), then adjusts HP (+-15 of the kit band) and the top two attack
// values (+-10 of the kit) per card until every win rate sits in its band: directors 51.5-52.5%, everyone else
// 48.5-51.5%. Writes balance-tune.json, which gen_v7.js reads at build time.
//   node scripts/balance-sim.js            tune, then verify
//   node scripts/balance-sim.js --report   verify only (no changes)
//   node scripts/balance-sim.js --boss     every player card vs Kula, AI on both sides
const fs = require('fs');
const core = require('./battle-core.js');
const TUNE_F = __dirname + '/balance-tune.json';
const args = process.argv.slice(2);
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function load() { delete require.cache[require.resolve('./gen_v7.js')]; return require('./gen_v7.js'); }
function tables(g) {
  const PERSONAL = { 'coach-damon-sichler': ['coach-tara-tucker', 'coach-tara-tucker-director'], 'coach-damon-sichler-director': ['coach-tara-tucker', 'coach-tara-tucker-director'] };
  return { WEAK: g.WEAK, RESIST: g.RESIST, PERSONAL, first: id => id.split('-')[1] };
}
const same = (a, b) => a.replace('-director', '') === b.replace('-director', '');
function play(a, b, r, T) { const A = core.mkFighter(a.id, a.s, 'L', true), B = core.mkFighter(b.id, b.s, 'R', false); return core.fight(A, B, r, T, (att, def) => core.pickMove(att, def, r, T)); }
function roundRobin(g, N, seed) {
  const T = tables(g), cards = g.ALLP.concat(g.GUESTS.filter(x => !x.s.saitama)), wins = {}, games = {}; let turns = 0, capped = 0, total = 0; const r = rng(seed);
  for (const p of cards) { wins[p.id] = 0; games[p.id] = 0; }
  for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) {
    const a = cards[i], b = cards[j]; if (same(a.id, b.id)) continue;
    for (let n = 0; n < N; n++) { const res = play(n % 2 ? b : a, n % 2 ? a : b, r, T); wins[res.win.id]++; games[a.id]++; games[b.id]++; turns += res.turns; total++; if (res.capped) capped++; }
  }
  const rate = {}; for (const id in wins) rate[id] = 100 * wins[id] / games[id];
  return { rate, avgTurns: turns / total, capped: 100 * capped / total, total };
}
/* one card's rate against the field */
function rateOf(g, p, N, seed) { const T = tables(g); const r = rng(seed); let w = 0, n = 0; for (const q of g.ALLP.concat(g.GUESTS.filter(x => !x.s.saitama))) { if (q === p || same(p.id, q.id)) continue; for (let k = 0; k < N; k++) { const res = play(k % 2 ? q : p, k % 2 ? p : q, r, T); if (res.win.id === p.id) w++; n++; } } return 100 * w / n; }
function band(p) { return p.director ? [51.5, 52.5] : [48.5, 51.5]; }
function target(p) { return p.director ? 52 : 50; }
function report(g, res) {
  const rows = g.ALLP.concat(g.GUESTS.filter(x => !x.s.saitama)).map(p => ({ p, r: res.rate[p.id] })).sort((x, y) => y.r - x.r); let bad = 0;
  for (const { p, r } of rows) { const [lo, hi] = band(p); const ok = r >= lo && r <= hi; if (!ok) bad++; console.log((ok ? '  ' : '!!') + r.toFixed(1).padStart(5) + '%  ' + p.n.padEnd(18) + p.s.el.padEnd(8) + 'HP ' + String(p.s.hp).padStart(3) + '  ' + p.s.moves.map(m => m.name + ' ' + (m.kind === 'atk' ? m.pow : m.kind === 'heal' ? 'heal' + m.pow : m.kind.replace('shield:', 'B'))).join(' / ')); }
  console.log('avg turns ' + res.avgTurns.toFixed(2) + '  capped ' + res.capped.toFixed(2) + '%  games ' + res.total + '  out of band ' + bad);
  return bad;
}
function bossRun(g, N) {
  const T = tables(g); const r = rng(99); const K = g.KULA; let turns = 0, wins = 0, total = 0;
  for (const p of g.ALLP) { let w = 0; for (let n = 0; n < N; n++) { const A = core.mkFighter(p.id, p.s, 'L', true), B = core.mkFighter(K.id, K.s, 'R', false); const res = core.fight(A, B, r, T, (att, def) => core.pickMove(att, def, r, T)); if (res.win === A) w++; turns += res.turns; total++; } wins += w; console.log(p.n.padEnd(18) + (100 * w / N).toFixed(0).padStart(4) + '% vs Kula'); }
  console.log('player wins vs Kula ' + (100 * wins / total).toFixed(1) + '%  avg turns ' + (turns / total).toFixed(1));
}
if (args.includes('--boss')) { bossRun(load(), 300); process.exit(0); }
let tune = {}; try { tune = JSON.parse(fs.readFileSync(TUNE_F, 'utf8')); } catch (e) { }
const save = () => fs.writeFileSync(TUNE_F, JSON.stringify(tune, null, 1));
const polish = args.includes('--polish');
if (!args.includes('--report')) {
  for (let pass = 0; pass < (polish ? 1 : 16); pass++) {
    let g = load(); const res = roundRobin(g, polish ? 400 : 120, 500 + pass);
    const worst = g.ALLP.concat(g.GUESTS.filter(x => !x.s.saitama)).map(p => ({ p, dev: Math.abs(res.rate[p.id] - target(p)), r: res.rate[p.id] })).filter(x => x.r < band(x.p)[0] || x.r > band(x.p)[1]).sort((a, b) => b.dev - a.dev);
    console.log('pass ' + pass + ': ' + worst.length + ' out of band, avg turns ' + res.avgTurns.toFixed(2));
    if (!worst.length) break;
    for (const { p } of worst) {
      const id = p.id, t = tune[id] = tune[id] || { hp: 0, pow: {} }; const hb = g.HPB[p.s.el];
      const atks = p.s.moves.map((m, i) => i).filter(i => p.s.moves[i].kind === 'atk').sort((a, b) => p.s.moves[b].cost - p.s.moves[a].cost).slice(0, 2);
      const cands = [];
      /* HP and power move in 5s (damage is in 5s, so finer HP steps change nothing); speed is the fine lever: it flips who goes
         first (and so who opens with 2 energy) against a slice of the field without touching a number on the card */
      for (const d of [-10, -5, 5, 10]) if (p.s.hp + d >= Math.max(hb[0] - 25, 70) && p.s.hp + d <= hb[1] + 25) cands.push({ hp: d });   /* nobody drops below 70 HP: a fragile card reads as dying instantly */
      for (const i of atks) for (const d of [-5, 5]) if (Math.abs((t.pow[i] || 0) + d) <= 15) cands.push({ pow: i, d });
      for (const d of [-25, -12, -6, 6, 12, 25]) if (Math.abs((t.spd || 0) + d) <= 60) cands.push({ spd: d });
      const NN = polish ? 400 : 240; const base = rateOf(g, p, NN, 9); let best = { score: Math.abs(base - target(p)), c: null };
      for (const c of cands) {
        if (c.hp !== undefined) t.hp += c.hp; else if (c.spd !== undefined) t.spd = (t.spd || 0) + c.spd; else t.pow[c.pow] = (t.pow[c.pow] || 0) + c.d;
        save(); const g2 = load(); const p2 = g2.ALLP.concat(g2.GUESTS).find(x => x.id === id); const r2 = rateOf(g2, p2, NN, 9);
        if (c.hp !== undefined) t.hp -= c.hp; else if (c.spd !== undefined) t.spd -= c.spd; else t.pow[c.pow] -= c.d;
        const sc = Math.abs(r2 - target(p)); if (sc < best.score - 0.2) best = { score: sc, c, r: r2 };
      }
      if (best.c) { if (best.c.hp !== undefined) t.hp += best.c.hp; else if (best.c.spd !== undefined) t.spd = (t.spd || 0) + best.c.spd; else t.pow[best.c.pow] = (t.pow[best.c.pow] || 0) + best.c.d; console.log('  ' + p.n.padEnd(18) + base.toFixed(1) + ' -> ' + best.r.toFixed(1) + '  ' + JSON.stringify(best.c)); }
      save(); g = load();
    }
  }
}
const g = load(); const bad = report(g, roundRobin(g, 400, 7));
process.exitCode = bad ? 1 : 0;
