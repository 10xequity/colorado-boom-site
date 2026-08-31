# v1.83 docs — CHANGELOG entry + HANDOFF touch-ups.
import os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))

def load(p): return open(p, encoding='utf-8').read()
def save(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def swap(s, old, new, n=1):
    assert s.count(old) == n, f'expected {n} of {old[:60]!r}, found {s.count(old)}'
    return s.replace(old, new)

entry = '''## v1.83 — 2026-08-31 · Positions spelled out; RYL schedule, Makayla's 12s, name calls
`teams.html`, `ryl-teams.html`, `programs.html`

- **Positions are spelled out on every roster tile, both pages** — Pin Hitter, Setter, Middle,
  Right Side, Libero, Defensive Specialist, Outside Hitter, Utility; multi-position players keep
  the slash ("Libero / Defensive Specialist"). Verified against real volleyball titles; "Middle"
  (not "Middle Blocker") per the owner's own naming. **Paige Stewart is a Pin Hitter** per the
  owner, on both pages (she had been PIN/M on club, Right Side on RYL).

- **Official 2026 RYL schedule on every RYL card**, taken from the RMR's RYL page
  (rmrvolleyball.org, page 9160754): RYL #1 Sun Sept 20, #2 Sun Sept 27, #3 Sun Oct 4 (3:30 PM
  start), #4 Sun Oct 11 — 8:30 AM starts unless noted — and a two-day Championships Sat–Sun
  Oct 17–18 (times TBD; three events played = eligible). The league schedules by event, not by
  team, so all five cards carry the same table plus the 8:30–1:00 / locations-by-RMR note.
  Because the fifth event is a Saturday–Sunday championship, the "five Sunday tournaments" copy
  on `programs.html` was measurably wrong and now reads "four one-day Sunday tournaments plus a
  two-day championship weekend"; its lead says "five league events".

- **RYL practice counts:** owner confirms RYL is two practices a week and club is three.
  **Mel's RYL team: 5:30–7:00 PM per the owner — the days (Tue & Thu) are ASSUMED** to match the
  other RYL Colorado teams; correct in one line if wrong. The club **12 Colorado - Kula adds
  Friday** (Tue, Thu & Fri), which was the one club team still on two days. `programs.html`'s
  RYL blurb now says "two team practices per week".

- **RYL 12 Colorado is coached by Makayla Clemons** — title "12 Colorado - Makayla", coach line
  linked to her staff card, jump label updated. Her staff card keeps listing club assignments
  only (13/16 Colorado), consistent with the other RYL coaches' cards.

- **Name calls (owner asked for best guesses, checked against club data on file):**
  - **Elliana Foster** on both pages — the RYL sheet carries the fuller form; "Ellian" reads as a
    truncation. GUESS: no roster export contains her.
  - **Aimee Aviles Ramirez** replaces the RYL sheet's "Aimee Weinand" — Jae's RYL team is 8/10
    identical to club 14 Colorado - Kimberly, whose only unaccounted libero-type is Aviles
    Ramirez; "Weinand" sits two rows under Alyssa Weinand and reads as autopilot. EVIDENCED but
    not certain.
  - **Kiarya McCready** — the OCS export on file has a Cassia McCready (same family email
    pattern), so the family spells it McCready. EVIDENCED.
  - **Kept:** Ezzeddine, Penney (no source found for either variant; the already-live club
    spellings stand), Betanya Molla (confirmed by the March members report), Brooklynn Coursey.

'''
s = load('CHANGELOG.md')
s = swap(s, '## v1.82 — 2026-08-31 ·', entry + '## v1.82 — 2026-08-31 ·')
save('CHANGELOG.md', s)
print('CHANGELOG OK')

s = load('HANDOFF.md')
s = swap(s, '**Updated** 2026-08-31 · **Live build** v1.82 · **Status** Active',
            '**Updated** 2026-08-31 · **Live build** v1.83 · **Status** Active')
s = swap(s, '## 4. Current state (v1.82, 2026-08-31)', '## 4. Current state (v1.83, 2026-08-31)')
old = '''- **`ryl-teams.html` is live** (v1.82) — five RYL fall-league teams, tile rosters, per-team
  practice days. 12 Colorado's roster is deliberately withheld (owner); 14 Colorado - Mel's RYL
  practice days were not supplied. ⚠ CHANGELOG v1.82 lists player-name spellings that differ
  between the owner's two roster sheets — one spelling is live, owner should confirm.'''
new = '''- **`ryl-teams.html` is live** — five RYL teams, tile rosters (positions spelled out, v1.83),
  per-team practice days (all two a week; club teams are three), the official RMR event schedule
  on every card, and Makayla Clemons coaching the 12s. 12 Colorado's roster is deliberately
  withheld (owner). ⚠ Mel's RYL practice DAYS are an assumption (Tue & Thu at the owner's
  5:30–7:00); ⚠ name best-guesses (Elliana Foster, Aimee Aviles Ramirez, Kiarya McCready) are
  reasoned in CHANGELOG v1.83 — owner should confirm.'''
s = swap(s, old, new)
save('HANDOFF.md', s)
print('HANDOFF OK')
