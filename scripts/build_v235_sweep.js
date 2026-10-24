// v2.35 sweep · 2026-10-23 · runs after build_v235.js. Fixes from the site audit:
// - pages still promised "try out at any Wed / Fri open gym" after tryouts.html (v2.15) moved 2026-27 to appointments;
// - schedule.html listed old position needs; three links pointed at section ids that did not exist.
// Idempotent: each page's v2.35 stamp gains a "sweep" note once; a page already carrying it is skipped.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const APPT = '<a class="ulink" href="mailto:admin@coloradoboom.com?subject=Tryout%20appointment">admin@coloradoboom.com</a>';

function once(h, from, to, file) {
  const n = h.split(from).length - 1;
  if (n !== 1) throw new Error(`${file}: expected 1 match, found ${n}: ${from.slice(0, 80)}`);
  return h.replace(from, () => to);
}

const FIX = {
  'girls-club.html': [
    ['<section data-section="GC-05" class="bg-cream">', '<section data-section="GC-05" class="bg-cream" id="GC-05">'],
    ['<tr><td>Ongoing</td><td>Try out at any Wed / Fri open gym, girls 10U&ndash;18U (<a class="ulink" href="tryouts.html#open-gym-tryouts">details</a>)</td></tr>',
     `<tr><td>By appt.</td><td>Remaining 2026&ndash;27 roster spots, private evaluation, email ${APPT}</td></tr>`],
  ],
  'boys-club.html': [
    ['<section data-section="BC-05" class="bg-cream">', '<section data-section="BC-05" class="bg-cream" id="BC-05">'],
  ],
  'club.html': [
    ['href="programs.html#add-on-training"', 'href="programs.html#dev-training"'],
  ],
  'index.html': [
    ['<span data-show-from="2026-10-12" hidden style="display:none"> continue at any Wed / Fri open gym</span>',
     '<span data-show-from="2026-10-12" hidden style="display:none"> are now by appointment: email admin@coloradoboom.com</span>'],
  ],
  'programs.html': [
    ['<span data-show-from="2026-10-12" hidden style="display:none">at any Wed / Fri open gym</span>',
     '<span data-show-from="2026-10-12" hidden style="display:none">by appointment (email admin@coloradoboom.com)</span>'],
  ],
  'parent-resources.html': [
    ['"text":"15U-18U tryouts are ongoing at open gym, with offers',
     '"text":"Remaining 2026-27 roster spots are filled by private evaluation (email admin@coloradoboom.com), with offers'],
    ['<p>15U&ndash;18U tryouts are ongoing at open gym, with offers',
     `<p>Remaining 2026&ndash;27 roster spots are filled by private evaluation (email ${APPT}), with offers`],
  ],
  'schedule.html': [
    ['<tr><td>Girls 15U&ndash;18U, ongoing tryouts at open gym</td><td>Wed / Fri &middot; 5:30&ndash;7:00 PM</td></tr>',
     `<tr><td>Remaining 2026&ndash;27 roster spots</td><td>By appointment &middot; email ${APPT}</td></tr>`],
    ['<strong>Girls 15U&ndash;18U tryouts are ongoing</strong>: 17s &amp; 18s: middles &amp; pin hitters &middot; Regional 15s &amp; 16s: hitters &amp; middles. Willing to try a different position? We&rsquo;ll train you.',
     '<strong>Open spots</strong>: 17 Colorado Middle &middot; 16 Colorado Outside &amp; Setter &middot; 12 Colorado Any Position (1). All other teams: practice player and developmental league spots only. Willing to try a different position? We&rsquo;ll train you.'],
  ],
};

const NOTE = ' Sweep: tryout lines now say by appointment (open gym is not a tryout, per tryouts.html v2.15); schedule.html open spots refreshed; GC-05/BC-05 ids added, #add-on-training -> #dev-training.';

for (const [f, swaps] of Object.entries(FIX)) {
  const p = path.join(root, f);
  let h = fs.readFileSync(p, 'utf8');
  if (h.includes(' Sweep: tryout lines')) continue;
  for (const [a, b] of swaps) h = once(h, a, b, f);
  const stamp = h.indexOf('  <!-- BUILD v2.35 ');
  if (stamp < 0) {
    const NL = h.includes('\r\n') ? '\r\n' : '\n';
    h = h.replace('  <!-- BUILD v', () => `  <!-- BUILD v2.35 · 2026-10-23 ·${NOTE} -->${NL}  <!-- BUILD v`);
  } else {
    const end = h.indexOf(' -->', stamp);
    h = h.slice(0, end) + NOTE + h.slice(end);
  }
  fs.writeFileSync(p, h);
  console.log('swept', f);
}
