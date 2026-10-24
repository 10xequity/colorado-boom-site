// v2.35 · 2026-10-23 · 17 Colorado Middle back on the recruiting lines (owner: unconfirmed, keep for now);
// popup's Littles phrase in Title Case. Idempotent: a page already stamped v2.35 is skipped.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const V = 'v2.35', D = '2026-10-23';

function once(h, from, to, file) {
  const n = h.split(from).length - 1;
  if (n !== 1) throw new Error(`${file}: expected 1 match, found ${n}: ${from.slice(0, 80)}`);
  return h.replace(from, () => to);
}

const SWAPS = [
  ['Now Recruiting: 12 Colorado Any Position (1) &nbsp;&bull;&nbsp; 16 Colorado Outside &amp; Setter',
   'Now Recruiting: 17 Colorado Middle &nbsp;&bull;&nbsp; 16 Colorado Outside &amp; Setter &nbsp;&bull;&nbsp; 12 Colorado Any Position (1)'],
  ['Now Recruiting: 12 Colorado Any Position (1) &middot; 16 Colorado Outside &amp; Setter',
   'Now Recruiting: 17 Colorado Middle &middot; 16 Colorado Outside &amp; Setter &middot; 12 Colorado Any Position (1)'],
  ['<strong>Open Spots:</strong> 12 Colorado &middot; Any (1) &nbsp;&bull;&nbsp; 16 Colorado &middot; Outside &amp; Setter<br>',
   '<strong>Open Spots:</strong> 17 Colorado &middot; Middle &nbsp;&bull;&nbsp; 16 Colorado &middot; Outside &amp; Setter &nbsp;&bull;&nbsp; 12 Colorado &middot; Any (1)<br>'],
  ['>Littles Skills developmental classes</a>', '>Littles Skills Development classes</a>'],
];

for (const f of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
  const p = path.join(root, f);
  let h = fs.readFileSync(p, 'utf8');
  if (h.includes(`<!-- BUILD ${V} `)) continue;
  const NL = h.includes('\r\n') ? '\r\n' : '\n';
  let hit = false;
  for (const [a, b] of SWAPS) if (h.includes(a)) { h = once(h, a, b, f); hit = true; }
  if (!hit) continue;
  if (f === 'index.html') h = once(h, "var KEY='cobo-popup-v234';", "var KEY='cobo-popup-v235';", f);
  h = h.replace('  <!-- BUILD v', () => `  <!-- BUILD ${V} · ${D} · [ANN] 17 Colorado Middle back on the recruiting line (unconfirmed, kept for now)${f === 'index.html' ? '. [HM-POP] same in Open Spots; "Littles Skills Development" in Title Case; key v235' : ''}. -->${NL}  <!-- BUILD v`);
  fs.writeFileSync(p, h);
  console.log('updated', f);
}
