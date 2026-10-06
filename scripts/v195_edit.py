# v1.95 — roster edits + 12 Colorado - Kula tournament schedule (owner, 2026-10-06).
# Every anchor must match exactly once or nothing is written; a second run refuses.
import os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
p = 'teams.html'
s = open(p, encoding='utf-8').read()
if 'BUILD v1.95' in s: raise SystemExit('already v1.95 — refusing second run')

def swap(old, new):
    global s
    c = s.count(old)
    if c != 1: raise SystemExit(f'expected 1 of {old[:80]!r}, found {c}')
    s = s.replace(old, new)

def pl(name, pos=None):
    return f'              <div class="pl"><span class="pname">{name}</span>' + (f'<span class="ppos">{pos}</span>' if pos else '') + '</div>\n'

# 16 National - Damon: spelling fixes
swap('<span class="pname">Jola Okunado</span>', '<span class="pname">Jola Okunande</span>')
swap('<span class="pname">Autum Caldwell</span>', '<span class="pname">Autumn Caldwell</span>')

# 14 Colorado - Kimberly: + Sivan Goldstein (position not given yet)
swap(pl('Aven Minjarez', 'Libero / Defensive Specialist'),
     pl('Aven Minjarez', 'Libero / Defensive Specialist') + pl('Sivan Goldstein'))
# 14 Colorado - Mel: + Averly Salem, Right Side (as on ryl-teams.html), after the other Right Side
swap(pl('Keira Penney', 'Right Side'), pl('Keira Penney', 'Right Side') + pl('Averly Salem', 'Right Side'))

# player counts: Kimberly and Mel cards go 10 -> 11 (anchor each on the next roster line)
for first in ('Alli Brumfiel', 'Lena Ezzeddine'):
    swap(f'Roster <span class="cnt">&middot; 10 players</span></span><span class="sic" aria-hidden="true">+</span></summary>\n            <div class="roster-grid">\n{pl(first, "Pin Hitter")}',
         f'Roster <span class="cnt">&middot; 11 players</span></span><span class="sic" aria-hidden="true">+</span></summary>\n            <div class="roster-grid">\n{pl(first, "Pin Hitter")}')

# 12 Colorado - Kula schedule (names spelled out as on the other teams)
ROWS = [('Jan 3', 'Friendship Tournament 2'), ('Jan 16-17', 'RMR Classic'), ('Jan 24', 'Power 1'),
        ('Feb 5-7', 'Crossroads'), ('Feb 13-15', 'RMR Showdown'), ('Feb 21', 'Power 2'),
        ('Mar 7', 'Power 3'), ('Apr 4', 'Power 4'), ('Apr 9-11', 'Hype Nation Rumble (Casper WY)'),
        ('Apr 18', 'Power 5'), ('Apr 30-May 2', 'RMR End of Year Regionals')]
table = ('            <div class="tbl-wrap">\n              <table class="sched">\n'
         '                <thead><tr><th scope="col">Date</th><th scope="col">Tournament</th></tr></thead>\n                <tbody>\n'
         + ''.join(f'              <tr><td>{d}</td><td>{t}</td></tr>\n' for d, t in ROWS)
         + '                </tbody>\n              </table>\n            </div>\n')
i = s.index('<span class="team-name">12 Colorado - Kula</span>'); j = s.index('<details class="team" id="t13-colorado">', i)
blk = s[i:j]
old = '            <p class="roster-tba">Tournament schedule will be posted here soon.</p>\n'
assert blk.count(old) == 1
s = s[:i] + blk.replace(old, table) + s[j:]

swap('<head>\n', '<head>\n  <!-- BUILD v1.95 · 2026-10-06 · [TM] 12 Colorado - Kula schedule posted (11 events). 14 Colorado - Kimberly + Sivan Goldstein (position TBC); 14 Colorado - Mel + Averly Salem (Right Side, per ryl-teams); both cards 11 players. 16 National - Damon: Jola Okunado -> Okunande, Autum -> Autumn Caldwell. Michon Robinson was not on the site; nothing removed. -->\n')
open(p, 'w', encoding='utf-8', newline='').write(s)
print('ok')
