# v1.82 part D — CHANGELOG entry + HANDOFF refresh.
import os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))

def load(p): return open(p, encoding='utf-8').read()
def save(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def swap(s, old, new, n=1):
    assert s.count(old) == n, f'expected {n} of {old[:60]!r}, found {s.count(old)}'
    return s.replace(old, new)

entry = '''## v1.82 — 2026-08-31 · Roster tiles, RYL Teams page, one tryout message (10U–18U)
`teams.html`, NEW `ryl-teams.html`, `coaching-staff.html`, `tryouts.html`, and the ANN banner + nav on every page

- **Rosters are tile grids now, not tables.** Four tiles across (3, then 2, as the viewport
  narrows), each tile a white card with a teal top rule: player name in bold, position in teal
  small caps beneath — the same visual grammar as the coach cards. The grid is ready for jersey
  numbers: adding `<span class="pnum">12</span>` as a tile's first child renders a gold corner
  badge, no other edit needed.

- **16 Colorado - Zhu's roster is pulled** back to "posted here soon" per the owner. The other
  four club rosters stay up, as tiles.

- **Coach lines carry full names** ("Head Coach: Tara Tucker"); team *titles* keep the
  first-name convention ("14 National - Tara") per the owner. Zhu remains "Zhu" — the standing
  convention for him. Assistants got last names too: a line reading "Tara Tucker · Assistant:
  Alicia" would have looked half-done.

- **NEW `ryl-teams.html`** — the fall-league mirror of Our Club Teams, generated from it so the
  two pages share card, tile and jump-bar patterns; in the Club Info menu and sitemap. Five
  teams: **12 Colorado** (roster withheld per owner — card kept, practice published),
  **13 Colorado - Zhu**, **14 National - Tara** (9 players, Wed & Fri 6:30–8:00 PM),
  **14 Colorado - Jae**, **14 Colorado - Mel** (practice days not supplied — shows "posted
  soon"; the other Colorado teams are Tue & Thu 5:30–7:00 PM). Positions are full words
  (Setter, Outside…) as supplied. No Schedule panels — RYL is five RMR-scheduled Sunday
  tournaments — and no jersey-number note, since numbers were only promised for club rosters.
  The roster sheet's margin notes were not published.

- **⚠ Name spellings the owner should confirm.** The RYL sheet spells four already-published
  players differently; the site keeps ONE spelling per player (the club page's, already live):
  **Ezzeddine** (sheet: Ezzedine), **Penney** (Penny), **Brooklynn** (Booklynn), **Betanya**
  (Batanya), and **Ellian Foster** (sheet: Elliana). Also as-supplied but worth a glance:
  **Aimee Weinand** (the club page has Aimee *Aviles Ramirez* and a separate Alyssa Weinand —
  same player renamed, or a different one?), and **Kiarya Mccready** (Mccready or McCready?).

- **Coach cards deep-link to their teams.** Every team assignment on the staff page
  ("Head Coach · 14 Colorado") is now a link to that team's card, which auto-opens on arrival —
  the reverse of the coach links the teams page already had. 22 links across 15 cards.

- **One tryout message: "Girls Club Tryouts · 10U–18U."** Per the owner, the tryout page no
  longer mentions RYL tryouts and no longer splits 10U–14U from 15U–18U: one heading, one date
  table, one register button. The 15U–18U "ongoing tryouts" block (heading, callout, recruiting
  checks) is replaced by a **black template band, "Try Out at Any Open Gym"** (10U–18U,
  Wed/Fri 5:30–7:00) — the position-needs copy lives on in the [RB] recruiting banner, which is
  unchanged. The ANN banner on every page, the home-page popup, the open-gym and OCS age
  mentions, and girls-club's cross-reference all follow (the `#ongoing-1518` anchor is gone;
  girls-club points at `#open-gym-tryouts`). The RYL *program* section on `programs.html` stays,
  now pointing at the new RYL Teams page — and its stale "three practices per week (5:00–7:00)"
  claim, contradicted by the owner's practice days, was replaced by a pointer to the per-team
  days.

'''
s = load('CHANGELOG.md')
s = swap(s, '## v1.81 — 2026-08-31 ·', entry + '## v1.81 — 2026-08-31 ·')
save('CHANGELOG.md', s)
print('CHANGELOG OK')

s = load('HANDOFF.md')
s = swap(s, '**Updated** 2026-08-31 · **Live build** v1.81 · **Status** Active',
            '**Updated** 2026-08-31 · **Live build** v1.82 · **Status** Active')
s = swap(s, '## 4. Current state (v1.81, 2026-08-31)', '## 4. Current state (v1.82, 2026-08-31)')
s = swap(s, '- **coloradoboom.com** — a plain static site (HTML/CSS/JS, no build step), **13 pages**.',
            '- **coloradoboom.com** — a plain static site (HTML/CSS/JS, no build step), **14 pages**.')
old = '''- **Five rosters are live** (14 National - Tara, 14 Colorado - Kimberly, 14 Colorado - Mel,
  16 Colorado - Zhu, 16 National - Damon), 10 players each, positions only — **jersey numbers to be
  added when assigned** (swap the note under each table for a # column, or add a # cell per row).
  ⚠ The Mel roster arrived labeled "16 Colorado - Mel" (a team that doesn't exist) and was published
  under 14 Colorado - Mel — confirm with the owner; see CHANGELOG v1.81.
- **Coming: an RYL teams tab** — the owner will send details separately; stage it on the `drafts`
  branch (with `noindex` + draft band) before it ships.'''
new = '''- **Four club rosters are live as tile grids** (14 National - Tara, 14 Colorado - Kimberly,
  14 Colorado - Mel, 16 National - Damon); 16 Colorado - Zhu was pulled back to "posted soon"
  (v1.82, owner). **Jersey numbers**: add `<span class="pnum">12</span>` as a tile's first child
  and a gold corner badge renders it. ⚠ The Mel roster arrived labeled "16 Colorado - Mel" (no
  such team) and is published under 14 Colorado - Mel — still unconfirmed; see CHANGELOG v1.81.
- **`ryl-teams.html` is live** (v1.82) — five RYL fall-league teams, tile rosters, per-team
  practice days. 12 Colorado's roster is deliberately withheld (owner); 14 Colorado - Mel's RYL
  practice days were not supplied. ⚠ CHANGELOG v1.82 lists player-name spellings that differ
  between the owner's two roster sheets — one spelling is live, owner should confirm.
- **Tryouts message is combined** (v1.82): "Girls Club Tryouts · 10U-18U", no RYL mention and no
  age split on tryouts.html; the 15U-18U "ongoing" block became the black "Try Out at Any Open
  Gym" band (`#open-gym-tryouts`). The ANN banner everywhere and the home popup follow suit.'''
s = swap(s, old, new)
save('HANDOFF.md', s)
print('HANDOFF OK')
