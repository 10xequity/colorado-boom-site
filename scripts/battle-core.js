/* Battle Arena rules shared by coaching-staff.html (inlined by gen_v7.js) and the balance simulator (balance-sim.js).
   Plain ES5 so it can be pasted into the page script unchanged. */
var BattleCore = (function () {
  /* Energy models. 'rally' (live from v2.22): +2 flat every turn, nobody opens with a bank, a block that stops a hit refunds its
     cost, Charge banks +3. 'owner' (v2.21): +1 on a card's first turn then +2, the second mover opens with 2, Charge +2. */
  var MODELS = { rally: { gain: function (r) { return 2; }, start: function (first) { return 0; }, charge: 3, refund: true },
                 owner: { gain: function (r) { return r <= 1 ? 1 : 2; }, start: function (first) { return first ? 0 : 2; }, charge: 2, refund: false } };
  var MODEL = MODELS.rally;
  var MAXE = 6, CHARGE = MODEL.charge, TURN_CAP = 24, SCALES = 10;
  function gain(round, f) { return (f && f.s.slow) ? 1 : MODEL.gain(round); }   /* a slow card (Kula) always +1 */
  function startEnergy(first) { return MODEL.start(first); }
  function maxCost(round) { return Math.min(3, round); }   /* a card's first turn allows 1-cost moves only, its second up to 2: no opening supers, no free big swing for the first mover */
  function mkFighter(id, s, side, first) { return { id: id, s: s, side: side, hp: s.hp, max: s.hp, energy: startEnergy(first), shield: 0, round: 0, scales: !!s.scales }; }
  function shieldAmt(mv) { var v = mv.kind.split(':')[1]; return v === 'all' ? 'all' : parseInt(v, 10); }
  function dmg(att, def, mv, rng, T) {
    var base = mv.pow, note = '', crit = false;
    if (T.WEAK[def.s.el] === att.s.el) { base *= 1.5; note = ' Super effective!'; }
    else if (T.RESIST[def.s.el] === att.s.el) { base *= .7; note = ' Not very effective.'; }
    if ((T.PERSONAL[def.id] || []).indexOf(att.id) >= 0) { base *= 2; note = ' ' + T.first(def.id) + '’s one true weakness!'; }
    if (rng() < .12) { base *= 1.5; crit = true; }
    return { d: Math.max(5, Math.round(base / 5) * 5), note: note, crit: crit };
  }
  /* resolve one chosen move (null = Charge). Mutates att/def, returns what happened for the animation + log. */
  function resolve(att, def, mv, rng, T) {
    if (!mv) { att.energy = Math.min(MAXE, att.energy + CHARGE); return { kind: 'charge', amt: CHARGE }; }
    att.energy = Math.max(0, att.energy - mv.cost);
    if (mv.kind !== 'atk' && mv.kind.indexOf('shield') === 0) { att.shield = shieldAmt(mv); att.shieldCost = mv.cost; return { kind: 'shield', amt: att.shield, mv: mv }; }
    if (mv.kind === 'heal') { var h = Math.min(mv.pow, att.max - att.hp); att.hp += h; return { kind: 'heal', amt: h, mv: mv }; }
    var r = dmg(att, def, mv, rng, T), d = r.d, blocked = 0, scaled = 0, willBlock = !!def.shield && !mv.pierce;
    if (def.scales) { scaled = Math.min(Math.max(0, d - 5), SCALES); d -= scaled; }   /* the scales never take a hit all the way to zero */
    if (def.s.invuln) { d = 0; }   /* Saitama: nothing lands */
    var refund = 0; if (willBlock) { blocked = def.shield === 'all' ? d : Math.min(def.shield, d); d -= blocked; def.shield = 0; if (MODEL.refund && blocked > 0) { refund = Math.min(def.shieldCost || 0, MAXE - def.energy); def.energy += refund; } }
    var drained = 0; if (mv.drain) { drained = mv.drain === 'all' ? def.energy : Math.min(def.energy, mv.drain); def.energy -= drained; }
    def.hp -= d;
    return { kind: 'atk', mv: mv, d: d, blocked: blocked, scaled: scaled, willBlock: willBlock, crit: r.crit, note: r.note, drained: drained, refund: refund, pierce: !!mv.pierce };
  }
  /* AI: lethal first, shield when the other side can afford a big swing, biggest attack otherwise, hold for a bigger one sometimes. */
  function expected(att, def, mv, T) { var b = mv.pow; if (T.WEAK[def.s.el] === att.s.el) b *= 1.5; else if (T.RESIST[def.s.el] === att.s.el) b *= .7; if ((T.PERSONAL[def.id] || []).indexOf(att.id) >= 0) b *= 2; b = Math.round(b / 5) * 5; if (def.scales) b = Math.max(0, b - SCALES); if (def.shield && !mv.pierce) b = def.shield === 'all' ? 0 : Math.max(0, b - def.shield); return b; }
  function pickMove(att, def, rng, T) {
    var aff = att.s.moves.filter(function (m) { return m.cost <= att.energy && m.cost <= maxCost(att.round); });
    var atks = aff.filter(function (m) { return m.kind === 'atk'; });
    var i, best = null, bestE = -1;
    for (i = 0; i < atks.length; i++) { var e = expected(att, def, atks[i], T); if (e >= def.hp) return atks[i]; if (e > bestE) { bestE = e; best = atks[i]; } }
    var shield = aff.filter(function (m) { return m.kind.indexOf('shield') === 0; })[0];
    var heal = aff.filter(function (m) { return m.kind === 'heal'; })[0];
    var oppBig = def.s.moves.reduce(function (a, m) { return m.kind === 'atk' && m.cost <= def.energy + gain(def.round + 1, def) && m.pow > a ? m.pow : a; }, 0);
    if (heal && att.hp <= att.max * .5 && rng() < .7) return heal;
    var sAmt = shield ? (shield.kind.split(':')[1] === 'all' ? 99 : parseInt(shield.kind.split(':')[1], 10)) : 0;
    var drain = aff.filter(function (m) { return m.drain; })[0];
    if (drain && def.energy >= 3 && rng() < .6) return drain;
    if (shield && !att.shield && oppBig >= 20 && sAmt >= oppBig * .5 && rng() < .65) return shield;
    var top = att.s.moves.reduce(function (a, m) { return m.kind === 'atk' && m.cost > a.cost ? m : a; }, { cost: 0 });
    if (top.cost && top.cost > att.energy && att.energy + CHARGE >= top.cost && rng() < .5) return null;
    if (best && (bestE >= 15 || rng() < .75)) return best;
    if (shield && !att.shield && sAmt >= 20 && rng() < .5) return shield;
    return best || (aff.length ? aff[0] : null);
  }
  /* one whole fight for the simulator. move(att,def) picks a move; returns {win, turns}. */
  function fight(A, B, rng, T, move) {
    var first = A.s.spd >= B.s.spd ? A : B, second = first === A ? B : A, t = 0;
    first.energy = startEnergy(true); second.energy = startEnergy(false);
    while (A.hp > 0 && B.hp > 0 && t < TURN_CAP) { var att = t % 2 ? second : first, def = att === A ? B : A; att.round++; att.energy = Math.min(MAXE, att.energy + gain(att.round, att)); resolve(att, def, move(att, def), rng, T); t++; }
    var win = A.hp <= 0 ? B : B.hp <= 0 ? A : (A.hp / A.max >= B.hp / B.max ? A : B);
    return { win: win, turns: t, capped: t >= TURN_CAP && A.hp > 0 && B.hp > 0 };
  }
  return { MODEL: MODEL, maxCost: maxCost, MAXE: MAXE, CHARGE: CHARGE, TURN_CAP: TURN_CAP, SCALES: SCALES, gain: gain, startEnergy: startEnergy, mkFighter: mkFighter, resolve: resolve, pickMove: pickMove, expected: expected, fight: fight };
})();
if (typeof module !== 'undefined') module.exports = BattleCore;
