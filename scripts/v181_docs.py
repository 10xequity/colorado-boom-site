# v1.81 documentation updates: CHANGELOG entry + HANDOFF refresh.
import os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))

def load(p): return open(p, encoding='utf-8').read()
def save(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def swap(s, old, new, n=1):
    assert s.count(old) == n, f'expected {n} of {old[:60]!r}, found {s.count(old)}'
    return s.replace(old, new)

# ---------------- CHANGELOG ----------------
entry = '''## v1.81 — 2026-08-31 · "Our Club Teams": Nov 2 start, Friday practices, 12s team, first five rosters
`teams.html`, `coaching-staff.html`, nav on all 12 pages

- **The page (and its nav item everywhere) is renamed "Our Club Teams"** — title, h1, breadcrumb and
  the Club Info menu on every page. Owner's wording.

- **A gold callout now opens the team list: "Practice Begins November 2, 2026."** It reuses the
  site's `.times-callout` (the pattern already used for time-critical facts), white text on the
  dark-teal band. Nov 2, 2026 is a Monday, which fits every team's practice days.

- **Every team adds a Friday practice** at the standard 5:15–7:30 PM window. Two days became three
  for all 14 teams (14 National keeps its Monday 6:30–8:45 exception, its Wed & Fri at the window).
  This also settles a latent contradiction: `club.html` has promised "generally three 2-hour
  practices per week" while every team card listed two days.

- **New team: 12 Colorado - Kula** (Kula Tanuvasa), practice **Tue & Thu** — the owner named this
  team's days explicitly, so it does not get the Friday added elsewhere. Roster and tournament
  schedule show as "posted soon". The owner wrote "Colorado 12 - Kula"; the site's naming is
  age-first everywhere ("13 Colorado", "16 National"), so it is published as **12 Colorado - Kula**.
  Kula Tanuvasa gets a coach card (`coaching-staff.html#coach-kula-tanuvasa`, photo pending) placed
  to keep the head-coach grid alphabetical by last name; the team's coach line deep-links to it.
  A 12U Colorado team was built once before and pulled (v1.72, markup at `3b3c8c5`); this block is
  new, built from the current card pattern rather than the stale markup.

- **First five rosters are live** — 10 players each, name + position, in the same table style as
  the schedules; the Roster summary now shows "· 10 players" the way Schedule shows its season.
  Jersey numbers were not supplied; each roster ends with "Jersey numbers will be posted once
  assigned." Teams: 14 National - Tara, 14 Colorado - Kimberly, 14 Colorado - Mel,
  16 Colorado - Zhu, 16 National - Damon.

- **⚠ One roster was re-labeled, owner should confirm:** the fifth roster arrived as
  **"16 Colorado - Mel"**. No such team exists — the 16 Colorado teams belong to Zhu and Brian, and
  Mel coaches 14 Colorado. Because the other four labels match team+coach exactly and the coach's
  name is how this club tells duplicate team names apart, it is published under
  **14 Colorado - Mel** (the likely cause: the header was copied from the "16 Colorado - Zhu" block
  above it). If those ten players are actually a 16s team, the fix is one block swap.

- **Jump bar breakpoint moved 900px → 1360px.** The centered no-scroll rows were tuned for seven
  links; the 12s makes row one eight links (~1330px), which overflowed the page body between 900
  and 1360. Below 1360 the rows now use their own internal scroll — the same fallback the design
  already used below 900. Verified no horizontal overflow at 390 / 1280 / 1340 / 1366.

- **Pending: RYL teams tab.** Owner will send details separately; stage it on `drafts` first.

'''
s = load('CHANGELOG.md')
s = swap(s, '## v1.80 — 2026-08-31 · First real coach photos', entry + '## v1.80 — 2026-08-31 · First real coach photos')
save('CHANGELOG.md', s)
print('CHANGELOG OK')

# ---------------- HANDOFF ----------------
s = load('HANDOFF.md')
s = swap(s, '**Updated** 2026-08-30 · **Live build** v1.76 · **Status** Active',
            '**Updated** 2026-08-31 · **Live build** v1.81 · **Status** Active')
s = swap(s, '## 4. Current state (v1.76, 2026-08-30)', '## 4. Current state (v1.81, 2026-08-31)')
old = '''**New: `teams.html` (Our Teams)** — linked from **Club Info → Our Teams**.
- **14 teams live**, 13U through 17U.'''
new = '''**New: `teams.html` (Our Club Teams)** — linked from **Club Info → Our Club Teams** (renamed from
"Our Teams" in v1.81).
- **15 teams live**, 12U through 17U. A gold callout opens the list: **"Practice Begins
  November 2, 2026."** Every team practices **three days a week** (Friday added in v1.81, standard
  window 5:15–7:30 PM) — except **12 Colorado - Kula** (new in v1.81, coach Kula Tanuvasa), which is
  **Tue & Thu** per the owner.
- **Five rosters are live** (14 National - Tara, 14 Colorado - Kimberly, 14 Colorado - Mel,
  16 Colorado - Zhu, 16 National - Damon), 10 players each, positions only — **jersey numbers to be
  added when assigned** (swap the note under each table for a # column, or add a # cell per row).
  ⚠ The Mel roster arrived labeled "16 Colorado - Mel" (a team that doesn't exist) and was published
  under 14 Colorado - Mel — confirm with the owner; see CHANGELOG v1.81.
- **Coming: an RYL teams tab** — the owner will send details separately; stage it on the `drafts`
  branch (with `noindex` + draft band) before it ships.'''
s = swap(s, old, new)
save('HANDOFF.md', s)
print('HANDOFF OK')
