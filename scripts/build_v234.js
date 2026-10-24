// v2.34 · 2026-10-23 · roster adds (12 Colorado, 14 Colorado - Janci) + recruiting needs refresh.
// Idempotent: every replacement asserts its anchor is unique, and a page already stamped v2.34 is skipped.
// Pages are CRLF; anchors that span lines are built with the file's own line ending.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const V = 'v2.34', D = '2026-10-23';

const OLD_ANN = 'Now Recruiting: 17 Colorado Middle &nbsp;&bull;&nbsp; 16 Colorado Pin &nbsp;&bull;&nbsp; 12s &amp; 13s Any Position';
const NEW_ANN = 'Now Recruiting: 12 Colorado Any Position (1) &nbsp;&bull;&nbsp; 16 Colorado Outside &amp; Setter';
const OLD_ANN_LEGAL = 'Now Recruiting: 17 Colorado Middle &middot; 16 Colorado Pin &middot; 12s &amp; 13s Any Position';
const NEW_ANN_LEGAL = 'Now Recruiting: 12 Colorado Any Position (1) &middot; 16 Colorado Outside &amp; Setter';

function once(h, from, to, file) {
  const n = h.split(from).length - 1;
  if (n !== 1) throw new Error(`${file}: expected 1 match, found ${n}: ${from.slice(0, 80)}`);
  return h.replace(from, () => to);
}

const pl = name => `              <div class="pl"><span class="pname">${name}</span></div>`;

const pages = fs.readdirSync(root).filter(f => f.endsWith('.html'));
for (const f of pages) {
  const p = path.join(root, f);
  let h = fs.readFileSync(p, 'utf8');
  if (h.includes(`<!-- BUILD ${V} `)) continue;
  const NL = h.includes('\r\n') ? '\r\n' : '\n';
  const notes = [];

  if (h.includes(OLD_ANN)) { h = once(h, OLD_ANN, NEW_ANN, f); notes.push('[ANN] recruiting: 12 Colorado any (1), 16 Colorado OH & setter; 13s full, 17 Colorado middle dropped'); }
  if (h.includes(OLD_ANN_LEGAL)) { h = once(h, OLD_ANN_LEGAL, NEW_ANN_LEGAL, f); notes.push('[ANN] recruiting line refreshed'); }

  if (f === 'index.html') {
    h = once(h,
      '<strong>Open Spots:</strong> 17 Colorado &middot; Middle &nbsp;&bull;&nbsp; 16 Colorado &middot; Pin &nbsp;&bull;&nbsp; 12s &middot; Any (2) &nbsp;&bull;&nbsp; 13s &middot; Any (1)<br>',
      '<strong>Open Spots:</strong> 12 Colorado &middot; Any (1) &nbsp;&bull;&nbsp; 16 Colorado &middot; Outside &amp; Setter<br>All other teams: practice player and developmental league spots only. Ages 6&ndash;11 are welcome to join <a class="inline" href="programs.html#littles">Littles Skills developmental classes</a>.<br>',
      f);
    h = once(h, "var KEY='cobo-popup-v215';", "var KEY='cobo-popup-v234';", f);
    notes.push('[HM-POP] open spots: 12 Colorado any (1), 16 Colorado OH & setter; practice player / developmental league line; Littles ages 6-11; key v234');
  }

  if (f === 'teams.html') {
    // 12 Colorado - Makayla
    h = once(h,
      'href="coaching-staff.html#coach-makayla-clemons">Makayla Clemons</a></span>',
      'href="coaching-staff.html#coach-makayla-clemons">Makayla Clemons</a> &middot; Assistant: Darian Xiong</span>', f);
    h = once(h, pl('Montana Jamal') + NL, pl('Montana Jamal') + NL + pl('Vivien Liebl') + NL, f);
    // 14 Colorado - Janci
    h = once(h, pl('Alana Evans') + NL, pl('Alana Evans') + NL + pl('Tabitha Adams') + NL, f);
    // both rosters were 7; bump the counts inside those two blocks only
    for (const id of ['t12-colorado', 't14-colorado-janci']) {
      const start = h.indexOf(`<details class="team" id="${id}">`);
      const end = h.indexOf('<details class="team"', start + 1);
      const block = h.slice(start, end);
      h = h.slice(0, start) + once(block, '&middot; 7 players', '&middot; 8 players', `${f}#${id}`) + h.slice(end);
    }
    notes.push('[TM] Vivien Liebl -> 12 Colorado - Makayla, Darian Xiong 12 Colorado assistant (unlinked, no staff card), Tabitha Adams -> 14 Colorado - Janci; both rosters 8');
  }

  if (!notes.length) continue;
  // stamp above the newest existing BUILD line (first occurrence only)
  h = h.replace('  <!-- BUILD v', () => `  <!-- BUILD ${V} · ${D} · ${notes.join('. ')}. -->${NL}  <!-- BUILD v`);
  fs.writeFileSync(p, h);
  console.log('updated', f);
}
