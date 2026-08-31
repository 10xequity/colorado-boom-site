# v1.83 — positions spelled out on both roster pages; name best-guesses; RYL: Mel practice,
# Makayla coaches the 12s, official RMR schedule on every card; club 12s gets its third practice.
import re, os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))

def load(p): return open(p, encoding='utf-8').read()
def save(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def swap(s, old, new, n, where):
    c = s.count(old)
    assert c == n, f'{where}: expected {n} of {old[:70]!r}, found {c}'
    return s.replace(old, new)

def pos(s, mapping, page):
    """Replace <span class="ppos">ABBR</span> tokens by exact value."""
    for old, new, n in mapping:
        s = swap(s, f'<span class="ppos">{old}</span>', f'<span class="ppos">{new}</span>', n, f'{page} pos {old}')
    return s

# ================= teams.html =================
T = 'teams.html'
s = load(T)
# Paige Stewart first — owner: she is a Pin Hitter (her PIN/M would otherwise collide with Armaghan's)
s = swap(s, '<span class="pname">Paige Stewart</span><span class="ppos">PIN/M</span>',
             '<span class="pname">Paige Stewart</span><span class="ppos">Pin Hitter</span>', 1, 'paige club')
s = pos(s, [
    ('OH/DS', 'Outside Hitter / Defensive Specialist', 2),
    ('M/PIN', 'Middle / Pin Hitter', 1),
    ('PIN/M', 'Pin Hitter / Middle', 1),
    ('L/DS', 'Libero / Defensive Specialist', 6),
    ('R/OH', 'Right Side / Outside Hitter', 1),
    ('PIN', 'Pin Hitter', 6),
    ('RS', 'Right Side', 1),
    ('DS', 'Defensive Specialist', 1),
    ('R', 'Right Side', 4),
    ('M', 'Middle', 7),
    ('S', 'Setter', 6),
    ('U', 'Utility', 1),
    ('L', 'Libero', 2),
], 'club')
# name best-guess: Elliana (the RYL sheet's fuller form; "Ellian" reads as a truncation)
s = swap(s, '<span class="pname">Ellian Foster</span>', '<span class="pname">Elliana Foster</span>', 1, 'elliana club')
# club teams practice three times a week — the 12s was the one team still on two
s = swap(s, 'Tue &amp; Thu &middot; 5:15&ndash;7:30 PM', 'Tue, Thu &amp; Fri &middot; 5:15&ndash;7:30 PM', 1, '12s third practice')
s = swap(s, '  <!-- BUILD v1.82 ',
         ('  <!-- BUILD v1.83 · 2026-08-31 · [TM] positions SPELLED OUT on every tile (PIN -> Pin Hitter, S -> Setter, M -> Middle, '
          'R/RS -> Right Side, L -> Libero, DS -> Defensive Specialist, OH -> Outside Hitter, U -> Utility; combos keep the slash). '
          'Paige Stewart is a Pin Hitter per owner (was PIN/M). Ellian -> ELLIANA Foster (best guess per owner: the RYL sheet carries the '
          'fuller form). 12 Colorado - Kula adds FRIDAY (owner: club teams practice three times a week; RYL twice). Prev BUILD v1.82 '), 1, 'stamp')
save(T, s)
assert '>PIN<' not in s and '>M<' not in s and '>S<' not in s and '>RS<' not in s
print('teams.html OK')

# ================= ryl-teams.html =================
R = 'ryl-teams.html'
s = load(R)
# Paige first (Right Side -> Pin Hitter, owner)
s = swap(s, '<span class="pname">Paige Stewart</span><span class="ppos">Right Side</span>',
             '<span class="pname">Paige Stewart</span><span class="ppos">Pin Hitter</span>', 1, 'paige ryl')
s = pos(s, [
    ('Outside', 'Outside Hitter', 8),
    ('DS', 'Defensive Specialist', 4),
], 'ryl')
# names: Elliana (fuller form); Aimee = Aviles Ramirez (RYL Jae's team is 8/10 identical to club
# 14C Kimberly, whose only libero left unaccounted is Aimee Aviles Ramirez — "Weinand" reads as
# autopilot from Alyssa Weinand two rows above); McCready (family spelling per the OCS export's
# Cassia McCready)
s = swap(s, '<span class="pname">Ellian Foster</span>', '<span class="pname">Elliana Foster</span>', 1, 'elliana ryl')
s = swap(s, '<span class="pname">Aimee Weinand</span>', '<span class="pname">Aimee Aviles Ramirez</span>', 1, 'aimee ryl')
s = swap(s, '<span class="pname">Kiarya Mccready</span>', '<span class="pname">Kiarya McCready</span>', 1, 'mccready ryl')
# Mel's practice: 5:30-7 per owner; days assumed Tue & Thu like the other RYL Colorado teams
s = swap(s, '<p class="roster-tba">Practice times will be posted here soon.</p>',
             '<p class="roster-tba">Tue &amp; Thu &middot; 5:30&ndash;7:00 PM</p>', 1, 'mel practice')
# 12s coached by Makayla Clemons
s = swap(s, '<span class="team-name">12 Colorado</span>\n          </span>',
             '<span class="team-name">12 Colorado - Makayla</span>\n            <span class="team-coach">Head Coach: <a class="coach-link" href="coaching-staff.html#coach-makayla-clemons">Makayla Clemons</a></span>\n          </span>', 1, '12s coach')
s = swap(s, '<a href="#t12-colorado">12 Colorado</a>', '<a href="#t12-colorado">12 Colorado - Makayla</a>', 1, '12s jump')
# official RMR schedule on every card (same league-wide table, per owner)
SCHED = '''          <details class="tsub">
            <summary><span>Schedule <span class="cnt">&middot; 2026 RYL season</span></span><span class="sic" aria-hidden="true">+</span></summary>
            <div class="tbl-wrap">
              <table class="sched">
                <thead><tr><th scope="col">Date</th><th scope="col">Event</th></tr></thead>
                <tbody>
              <tr><td>Sun, Sept 20</td><td>RYL #1 &middot; 8:30 AM start</td></tr>
              <tr><td>Sun, Sept 27</td><td>RYL #2 &middot; 8:30 AM start</td></tr>
              <tr><td>Sun, Oct 4</td><td>RYL #3 &middot; 3:30 PM start</td></tr>
              <tr><td>Sun, Oct 11</td><td>RYL #4 &middot; 8:30 AM start</td></tr>
              <tr><td>Sat&ndash;Sun, Oct 17&ndash;18</td><td>RYL Championships &middot; times TBD</td></tr>
                </tbody>
              </table>
            </div>
            <p class="roster-tba">Tournaments generally run 8:30 AM&ndash;1:00 PM; locations are announced by the RMR. Athletes must play in three RYL events to be eligible for the Championships.</p>
          </details>
'''
CARD_END = '          </details>\n        </div>\n      </details>'
assert s.count(CARD_END) == 5, s.count(CARD_END)
s = s.replace(CARD_END, '          </details>\n' + SCHED + '        </div>\n      </details>')
# callout: the fifth event is a two-day championship, not a fifth Sunday
s = swap(s, 'RYL Fall Season &middot; Five Sunday Tournaments &middot; September&ndash;October',
             'RYL Fall Season &middot; Five League Events &middot; September&ndash;October', 1, 'callout')
s = swap(s, '  <!-- BUILD v1.82 ',
         ('  <!-- BUILD v1.83 · 2026-08-31 · [RT] OFFICIAL 2026 SCHEDULE on every card, from the RMR RYL page (rmrvolleyball.org 9160754): '
          'RYL #1-#4 Sundays Sept 20 / Sept 27 / Oct 4 (3:30 PM) / Oct 11 (8:30 AM starts unless noted), Championships Sat-Sun Oct 17-18 '
          '(3 events played = eligible). Same table on all five teams — the league schedules by event, not by team. 12 Colorado is coached by '
          'MAKAYLA CLEMONS (title now "12 Colorado - Makayla"). Mel practices Tue & Thu 5:30-7:00 (time per owner; DAYS ASSUMED to match the '
          'other RYL Colorado teams — flagged). Positions spelled out and names aligned with the club page: Elliana Foster, Aimee AVILES '
          'RAMIREZ (the "Aimee Weinand" on the sheet — Jae\'s RYL team is 8/10 club-14C-Kimberly, whose unaccounted libero is Aviles Ramirez), '
          'Kiarya McCREADY (family spelling per the OCS export). Paige Stewart -> Pin Hitter per owner. Prev BUILD v1.82 '), 1, 'stamp')
save(R, s)
assert s.count('<td>RYL #1 &middot;') == 5 and s.count('<td>RYL Championships &middot;') == 5
assert '>Outside<' not in s and '>DS<' not in s
print('ryl-teams.html OK')

# ================= programs.html: RYL facts follow the official schedule + two practices =================
P = 'programs.html'
s = load(P)
s = swap(s, 'Five one-day Sunday tournaments run September through October at participating clubs across the Denver metro.',
             'Four one-day Sunday tournaments plus a two-day championship weekend run September and October at participating clubs across the Denver metro.', 1, 'pg tournaments')
s = swap(s, 'Girls 14U &amp; under &nbsp;|&nbsp; Season: Sep&ndash;Oct &nbsp;|&nbsp; Five Sunday tournaments &nbsp;|&nbsp; $500',
             'Girls 14U &amp; under &nbsp;|&nbsp; Season: Sep&ndash;Oct &nbsp;|&nbsp; Five league events &nbsp;|&nbsp; $500', 1, 'pg lead')
s = swap(s, 'club coaches and weekly team practices, all at Boomtown Fieldhouse',
             'club coaches and two team practices per week, all at Boomtown Fieldhouse', 1, 'pg practices')
i = s.index('  <!-- BUILD ')
s = s[:i] + ('  <!-- BUILD v1.83 · 2026-08-31 · [PG-02r] RYL facts squared with the official RMR page: "five Sunday tournaments" -> four Sundays '
             '+ a two-day championship (Oct 17-18 is Sat-Sun); practices stated as two per week (owner: RYL is 2, club is 3). -->\n') + s[i:]
save(P, s)
print('programs.html OK')
print()
print('V1.83 APPLIED')
