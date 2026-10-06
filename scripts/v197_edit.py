# v1.97 — club.html restructure (owner, 2026-10-06) + Advanced Club Training is now Tues/Thurs 5-7 PM,
# coach unnamed, no "open gyms included", no Nov-1 pause gates (club, programs, schedule, tryouts).
# Every anchor must match exactly the expected number of times or nothing is written; a second run refuses.
import os, re
os.chdir(os.path.join(os.path.dirname(__file__), '..'))

def load(p): return open(p, encoding='utf-8').read()
def save(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def nocomments(s): return re.sub(r'<!--.*?-->', '', s, flags=re.S)
class Miss(Exception): pass
def swap(s, old, new, where, n=1):
    c = s.count(old)
    if c != n: raise Miss(f'{where}: expected {n} of {old[:90]!r}, found {c}')
    return s.replace(old, new)
def resub(s, pat, new, where):
    s2, c = re.subn(pat, new, s, count=1, flags=re.S)
    if c != 1: raise Miss(f'{where}: regex {pat[:60]!r} did not match once')
    return s2

FORM = 'https://forms.gle/yvnstZ89psTTLmux7'
TODAY = '2026-10-06'
out = {}

# ───────────────────────── club.html ─────────────────────────
p = 'club.html'; s = load(p)
if 'BUILD v1.97' in s: raise Miss('already v1.97 — refusing second run')

# SEO: title (3 places incl. og/twitter), description (3 places), h1
s = swap(s, 'Club Information | Colorado Boom Volleyball Club',
            'Club Fees, Team Levels &amp; Schedule 2026&ndash;27 | Colorado Boom Volleyball Club', 'title', 3)
s = swap(s, 'Club information for Colorado Boom Volleyball Club: practice philosophy, schedule, benefits, fees, uniforms, and parent FAQ.',
            'Colorado Boom 2026&ndash;27 club volleyball fees ($4,500&ndash;$6,000), Regional, Colorado and National team levels, practice schedule, RYL and parent FAQ. Aurora, CO.', 'description', 3)
s = swap(s, '<h1>Club Information</h1>', '<h1>Club Information: Team Levels, Fees &amp; Schedule</h1>', 'h1')

# Page CSS: shared Total Fee style (replaces two inline-styled <p>s) + breathing room between cards and table
s = swap(s, "    .level--info .addon-h + p{margin:0 0 12px;}\n",
            "    .level--info .addon-h + p{margin:0 0 12px;}\n"
            "    /* v1.97 — Total Fee line shared by the 11U-14U and 15U-18U cards; space between a level grid and the fee table under it. */\n"
            "    .level-body .total{font-family:'Montserrat',sans-serif;font-weight:900;font-size:20px;color:#111;text-align:center;margin:0 0 10px;}\n"
            "    .level-grid + .tbl-wrap{margin-top:28px;}\n", 'css')
INLINE = '<p style="font-family:\'Montserrat\',sans-serif;font-weight:900;font-size:20px;color:#111;text-align:center;margin:0 0 10px;">'
s = swap(s, INLINE + 'Total Fee: $4,875</p>', '<p class="total">Total Fee: $4,875</p>', '14U CO total')
s = swap(s, INLINE + 'Total Fee: $5,500</p>', '<p class="total">Total Fee: $5,500</p>', '14U NAT total')

# 14U table header
s = swap(s, '<thead><tr><th>Component</th><th>Colorado<br>(11U&ndash;14U)</th>', '<thead><tr><th>Features</th><th>Colorado<br>(11U&ndash;14U)</th>', '14U thead')

# 15U cards: title + Total Fee lines
s = swap(s, '<h2 class="section-title reveal">Team Levels: 15U&ndash;18U</h2>', '<h2 class="section-title reveal">Team Levels &amp; Fees: 15U&ndash;18U</h2>', '15U h2')
for fee, total in (('$0', '$4,500'), ('$1,000', '$5,500'), ('$1,500', '$6,000')):
    s = swap(s, f'<div class="level-body"><p class="travel">Team Travel Fee: {fee}</p>\n',
                f'<div class="level-body"><p class="travel">Team Travel Fee: {fee}</p>\n            <p class="total">Total Fee: {total}</p>\n', f'15U total {total}')

# 15U fee table + its note: lift out of CL-06, drop under the 15U cards
TABLE = ('      <div class="tbl-wrap reveal"><table class="sched fee-table">\n'
         '        <thead><tr><th>Component</th><th>Regional<br>(15U&ndash;18U)</th><th>Colorado<br>(15U&ndash;18U)</th><th>National<br>(15U&ndash;18U)</th></tr></thead>\n'
         '        <tbody>\n'
         '          <tr><td>Base Club Fee</td><td>$4,500</td><td>$4,500</td><td>$4,500</td></tr>\n'
         '          <tr><td>Committed travel events</td><td>0</td><td>2</td><td>3</td></tr>\n'
         '          <tr><td>Travel Fee (committed)</td><td>$0</td><td>$1,000</td><td>$1,500</td></tr>\n'
         '          <tr><td>Uniforms</td><td>Included</td><td>Included</td><td>Included</td></tr>\n'
         '          <tr class="total-row"><td>Total Fee</td><td>$4,500</td><td>$5,500</td><td>$6,000</td></tr>\n'
         '        </tbody>\n'
         '      </table></div>\n'
         '      <p class="sched-note"><strong>Looking for 11U&ndash;14U?</strong> Younger-team levels, fees, and RYL are in the <a href="#age-11-14" class="ulink">11U&ndash;14U section</a> above. Amounts exclude payment-processing fees and applicable sales tax (approx. 3.75%, City of Aurora).</p>\n')
s = swap(s, TABLE + '\n', '', 'lift 15U table out of CL-06')
VOTE = '      <p class="sched-note"><strong>Team tournament vote, late January/February.</strong>'
s = swap(s, VOTE, TABLE.replace('<th>Component</th>', '<th>Features</th>') + VOTE, 'drop 15U table under cards')

# CL-06 becomes the deposits / payments / conditional-fees section (its table now lives above)
s = swap(s, '<h2 class="section-title reveal">2026&ndash;27 Club Fees: 15U&ndash;18U</h2>', '<h2 class="section-title reveal">Deposits, Payments &amp; Conditional Fees</h2>', 'CL-06 h2')
s = resub(s, r'<p class="section-subtitle reveal">One Base Club Fee across every level:[^<]*</p>',
             '<p class="section-subtitle reveal">Applies to every team level, 11U&ndash;18U, for the 2026&ndash;27 season.</p>', 'CL-06 subtitle')
s = swap(s, '  <!-- ===== [CL-04b] RMR Age Groups ===== -->\n  <section id="fees"',
            '  <!-- ===== [CL-06] Deposits, payments & conditional fees (the fee tables sit under their level cards, CL-04a / CL-04c, since v1.97) ===== -->\n  <section id="fees"', 'CL-06 comment')

# Advanced Club Training: Tues/Thurs 5-7, no coach named, no "open gyms included", no pause gates
s = swap(s, '      <p class="section-subtitle">Off-season reps for competitive and committed players, led by Coach Damon Sichler: open gyms included.</p>\n'
            '      <!-- [KEEP] Damon training paused until Nov 2026 (was Mon/Wed). Note retires Oct 31; Wed/Fri listing + CTA restore Nov 1 via main.js date engine. -->\n'
            '      <div class="times-callout">\n'
            '        <span class="big" data-show-until="2026-10-31">Returns in November &middot; Wed / Fri &middot; 7:00&ndash;8:30 PM</span>\n'
            '        <span class="big" data-show-from="2026-11-01" hidden style="display:none">Wed / Fri &middot; 7:00&ndash;8:30 PM</span>\n'
            '        <span class="sub">High-rep, position-focused training at Boomtown Fieldhouse: open gyms included</span>\n'
            '        <span class="sub" data-show-from="2026-11-01" hidden style="display:none">Try a free week: register, walk in, or contact admin@coloradoboom.com.</span>\n'
            '      </div>\n'
            f'      <div class="cta-inline" data-show-from="2026-11-01" hidden style="display:none"><a href="{FORM}" target="_blank" rel="noopener" class="btn btn-gold">Try a Free Week</a></div>\n',
            '      <p class="section-subtitle">Off-season reps for competitive and committed players.</p>\n'
            '      <!-- v1.97: Tues/Thurs 5:00-7:00 PM, coach unnamed per owner (was Coach Damon Sichler, Wed/Fri 7:00-8:30, paused until Nov). -->\n'
            '      <div class="times-callout">\n'
            '        <span class="big">Tues / Thurs &middot; 5:00&ndash;7:00 PM</span>\n'
            '        <span class="sub">High-rep, position-focused training at Boomtown Fieldhouse</span>\n'
            '        <span class="sub">Try a free week: register, walk in, or contact admin@coloradoboom.com.</span>\n'
            '      </div>\n'
            f'      <div class="cta-inline"><a href="{FORM}" target="_blank" rel="noopener" class="btn btn-gold">Try a Free Week</a></div>\n', 'CL-03b')

# Section order: Season Schedules above Advanced Club Training; RYL between the 14U and 15U fee sections
def mark(prefix):
    c = s.count(prefix)
    if c != 1: raise Miss(f'marker {prefix!r}: found {c}')
    return s.index(prefix)
iA = mark('  <!-- ===== [CL-03b] Advanced Summer Club Training ===== -->\n')
iB = mark('  <!-- ===== [CL-04] Club benefits (v1.36')
iC = mark('  <!-- ===== [CL-04a] Team Levels & Fees')
iD = mark('  <!-- ===== [CL-04c] Team Levels')
iE = mark('  <!-- ===== [CL-04d] Rocky Mountain Youth League ===== -->\n')
iF = mark('  <!-- ===== [CL-05] Season schedule pointer ===== -->\n')
iG = mark('  <!-- ===== [CL-06] Club Fees (v1.36')
assert iA < iB < iC < iD < iE < iF < iG
pre, adv, ages, u14, u15, ryl, sched, post = s[:iA], s[iA:iB], s[iB:iC], s[iC:iD], s[iD:iE], s[iE:iF], s[iF:iG], s[iG:]
s = pre + sched + adv + ages + u14 + ryl + u15 + post

s = swap(s, '<head>\n', '<head>\n  <!-- BUILD v1.97 · ' + TODAY + ' · [CL] Season Schedules moved above Advanced Club Training; RYL moved between the 11U-14U and 15U-18U fee sections. [CL-04c] now "Team Levels & Fees: 15U-18U": Total Fee on each card + the fee table under the cards (lifted from CL-06, which is now "Deposits, Payments & Conditional Fees"). Both fee tables: "Component" -> "Features"; 28px gap between cards and table; Total Fee line is a shared .total class. [CL-03b] Advanced Club Training: Tues/Thurs 5:00-7:00 PM, no coach named, "open gyms included" removed, Nov-1 pause gates removed. SEO: title / description / h1 now name fees, levels and schedule. -->\n', 'stamp')

body = nocomments(s)
for bad in ('Component', 'Damon', 'open gyms included', 'data-show-from="2026-11-01"', 'data-show-until="2026-10-31"', 'Returns in November'):
    assert bad not in body, f'club.html: {bad!r} still on the page'
assert body.count('<th>Features</th>') == 2
assert body.count('class="total"') == 5
for t in ('Total Fee: $4,500', 'Total Fee: $6,000'): assert body.count(t) == 1
assert body.count('Total Fee: $5,500') == 2
assert s.index('[CL-05] Season schedule pointer') < s.index('[CL-03b] Advanced Summer') < s.index('[CL-04a] Team Levels') < s.index('[CL-04d] Rocky') < s.index('[CL-04c] Team Levels') < s.index('[CL-06] Deposits')
out[p] = s

# ───────────────────────── programs.html ─────────────────────────
p = 'programs.html'; s = load(p)
if 'BUILD v1.97' in s: raise Miss('programs already v1.97')
s = swap(s, '          <!-- [KEEP] Damon advanced club training paused until Nov 2026 (was Mon/Wed). Interim note retires itself Oct 31; full listing (now Wed/Fri) restores itself Nov 1 via main.js date engine. -->\n'
            '          <li data-show-until="2026-10-31"><strong>Advanced club training &middot; Coach Damon</strong>: returns in November &middot; Wed / Fri &middot; 7:00&ndash;8:30 PM</li>\n'
            '          <li data-show-from="2026-11-01" hidden style="display:none"><a href="#s-damon" style="color:#fff;border-bottom:1px solid var(--gold);"><strong>Advanced club training &middot; Coach Damon</strong></a>: Wed / Fri &middot; 7:00&ndash;8:30 PM</li>\n',
            '          <li><a href="#s-club" style="color:#fff;border-bottom:1px solid var(--gold);"><strong>Advanced club training</strong></a>: Tues / Thurs &middot; 5:00&ndash;7:00 PM</li>\n', 'PG list')
HD = "font-family:'Montserrat',sans-serif;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:var(--teal-dark);"
s = swap(s, '        <div data-show-until="2026-10-31" style="padding:16px 0 0;">\n'
            '          <h4 style="margin:0 0 2px;">Advanced Club Training &middot; Coach Damon Sichler</h4>\n'
            f'          <p style="margin:0;{HD}">Returns in November &middot; Wed / Fri &middot; 7:00&ndash;8:30 PM</p>\n'
            '        </div>\n'
            '        <div id="s-damon" data-show-from="2026-11-01" hidden style="display:none;scroll-margin-top:90px;padding:16px 0 0;">\n'
            '          <h4 style="margin:0 0 2px;">Advanced Club Training &middot; Coach Damon Sichler</h4>\n'
            f'          <p style="margin:0 0 6px;{HD}">Wed / Fri &middot; 7:00&ndash;8:30 PM</p>\n'
            '          <p style="margin:0;">High-rep, competitive training led by Coach Damon for committed players preparing for the club season. The most game-like reps of the week.</p>\n'
            '        </div>\n',
            '        <div id="s-club" style="scroll-margin-top:90px;padding:16px 0 0;">\n'
            '          <h4 style="margin:0 0 2px;">Advanced Club Training</h4>\n'
            f'          <p style="margin:0 0 6px;{HD}">Tues / Thurs &middot; 5:00&ndash;7:00 PM</p>\n'
            '          <p style="margin:0;">High-rep, competitive training for committed players preparing for the club season. The most game-like reps of the week.</p>\n'
            '        </div>\n', 'PG session')
s = swap(s, '<head>\n', '<head>\n  <!-- BUILD v1.97 · ' + TODAY + ' · [PG-02] Advanced Club Training: Tues/Thurs 5:00-7:00 PM, coach unnamed (was Coach Damon, Wed/Fri 7:00-8:30, paused until Nov); pause gates removed; #s-damon -> #s-club. -->\n', 'stamp')
body = nocomments(s)
for bad in ('Damon', 'data-show-from="2026-11-01"', 'data-show-until="2026-10-31"', 's-damon'):
    assert bad not in body, f'programs.html: {bad!r} still on the page'
out[p] = s

# ───────────────────────── schedule.html ─────────────────────────
p = 'schedule.html'; s = load(p)
if 'BUILD v1.97' in s: raise Miss('schedule already v1.97')
s = swap(s, '          <!-- [KEEP] Damon training paused until Nov 2026 (was Mon/Wed). Interim row retires Oct 31; Wed/Fri row restores Nov 1 via main.js date engine. -->\n'
            '          <tr data-show-until="2026-10-31"><td>Advanced Club Training, Coach Damon Sichler (returns in November)</td><td>Wed / Fri</td><td>7:00&ndash;8:30 PM</td><td>Starts Nov</td></tr>\n'
            f'          <tr data-show-from="2026-11-01" hidden style="display:none"><td>Advanced Club Training, Coach Damon Sichler</td><td>Wed / Fri</td><td>7:00&ndash;8:30 PM</td><td><a class="ulink" href="{FORM}" target="_blank" rel="noopener">Free Week</a></td></tr>\n',
            f'          <tr><td>Advanced Club Training</td><td>Tues / Thurs</td><td>5:00&ndash;7:00 PM</td><td><a class="ulink" href="{FORM}" target="_blank" rel="noopener">Free Week</a></td></tr>\n', 'SC row')
s = swap(s, '<head>\n', '<head>\n  <!-- BUILD v1.97 · ' + TODAY + ' · [SC] Advanced Club Training row: Tues/Thurs 5:00-7:00 PM, coach unnamed, live now (was Coach Damon Sichler, Wed/Fri 7:00-8:30, "Starts Nov"). -->\n', 'stamp')
body = nocomments(s)
for bad in ('Damon', 'data-show-from="2026-11-01"', 'data-show-until="2026-10-31"'):
    assert bad not in body, f'schedule.html: {bad!r} still on the page'
out[p] = s

# ───────────────────────── tryouts.html ─────────────────────────
p = 'tryouts.html'; s = load(p)
if 'BUILD v1.97' in s: raise Miss('tryouts already v1.97')
s = swap(s, '      <!-- [KEEP] Damon training paused until Nov 2026 (was Mon/Wed). Note retires Oct 31; Wed/Fri callout + CTA restore Nov 1 via main.js date engine. -->\n'
            '      <div class="times-callout" style="margin-top:26px;" data-show-until="2026-10-31">\n'
            '        <span class="big">Advanced Club Training: Coach Damon Sichler</span>\n'
            '        <span class="sub">Returns in November &middot; Wed / Fri &middot; 7:00&ndash;8:30 PM</span>\n'
            '      </div>\n'
            '      <div class="times-callout" style="margin-top:26px;display:none;" data-show-from="2026-11-01" hidden>\n'
            '        <span class="big">Advanced Club Training: Coach Damon Sichler</span>\n'
            '        <span class="sub">Wed / Fri &middot; 7:00&ndash;8:30 PM: high-rep training for competitive and committed players (open gyms included)</span>\n'
            '        <span class="sub">Try a free week: register, walk in, or contact admin@coloradoboom.com.</span>\n'
            '      </div>\n'
            f'      <div class="cta-inline" data-show-from="2026-11-01" hidden style="display:none"><a href="{FORM}" target="_blank" rel="noopener" class="btn btn-gold">Try a Free Week</a></div>\n',
            '      <div class="times-callout" style="margin-top:26px;">\n'
            '        <span class="big">Advanced Club Training</span>\n'
            '        <span class="sub">Tues / Thurs &middot; 5:00&ndash;7:00 PM: high-rep training for competitive and committed players</span>\n'
            '        <span class="sub">Try a free week: register, walk in, or contact admin@coloradoboom.com.</span>\n'
            '      </div>\n'
            f'      <div class="cta-inline"><a href="{FORM}" target="_blank" rel="noopener" class="btn btn-gold">Try a Free Week</a></div>\n', 'TO callout')
s = swap(s, '<head>\n', '<head>\n  <!-- BUILD v1.97 · ' + TODAY + ' · [TO-03] Advanced Club Training callout: Tues/Thurs 5:00-7:00 PM, coach unnamed, "open gyms included" removed, live now (was Coach Damon Sichler, Wed/Fri 7:00-8:30, paused until Nov). -->\n', 'stamp')
body = nocomments(s)
for bad in ('Damon', 'open gyms included', 'data-show-from="2026-11-01"', 'data-show-until="2026-10-31"'):
    assert bad not in body, f'tryouts.html: {bad!r} still on the page'
out[p] = s

# ───────────────────────── CHANGELOG ─────────────────────────
p = 'CHANGELOG.md'; s = load(p)
ENTRY = '''## v1.97 — 2026-10-06 · Club page restructure; Advanced Club Training Tues/Thurs 5–7 PM
`club.html`, `programs.html`, `schedule.html`, `tryouts.html`

- **Section order on `club.html`** (owner): Season Schedules now sits directly above Advanced Club
  Training; the RYL section now sits between the 11U–14U and 15U–18U fee sections. Backgrounds still
  alternate (teal → cream → white → dark → cream → teal → white → cream → white).
- **15U–18U is now "Team Levels & Fees"**, matching the 11U–14U section: every card carries a
  **Total Fee** line (Regional $4,500 · Colorado $5,500 · National $6,000) and the fee table sits
  directly under the cards. The table was *moved* from the old "2026–27 Club Fees: 15U–18U" section
  rather than copied, so there is still one source per number. That lower section is now
  **"Deposits, Payments & Conditional Fees"** (`id="fees"` kept; nothing links to it today).
- **Both fee tables:** header "Component" → **"Features"**. A 28px gap now separates each level grid
  from its table (`.level-grid + .tbl-wrap`). The 14U cards' inline-styled Total Fee `<p>`s became a
  shared `.level-body .total` class so both sections render identically.
- **Advanced Club Training: Tues / Thurs · 5:00–7:00 PM**, no coach named ("remove Damon's name for
  now"), "open gyms included" removed from both lines. The Nov-1 pause gates (`data-show-until` /
  `data-show-from`) and `[KEEP]` comments are gone on all four pages that carried the block; the
  "Try a Free Week" CTA shows now. *Assumption:* the new time matches the training already running,
  so the listing is live rather than "returns in November" — the owner did not say either way.
  `programs.html` anchor `#s-damon` → `#s-club`.
- **SEO (`club.html`):** title "Club Information | …" → "Club Fees, Team Levels & Schedule 2026–27 |
  Colorado Boom Volleyball Club"; meta/og/twitter description now names the fee range, the three
  levels, practice schedule, RYL and Aurora; h1 → "Club Information: Team Levels, Fees & Schedule".
  Canonical, breadcrumbs, alt text and geo tags were already in order. No FAQPage schema added:
  Google stopped showing FAQ rich results for non-government/health sites in Aug 2023.
- Script: `scripts/v197_edit.py`.

---

'''
s = swap(s, '## v1.96 — 2026-10-06', ENTRY + '## v1.96 — 2026-10-06', 'changelog')
out[p] = s

for p, s in out.items(): save(p, s)
print('ok', sorted(out))
