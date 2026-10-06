# v1.96 — 16 Colorado - Zhu: Friendship 2 (Jan 3) -> Friendship 1 (Dec 13); 15 Regional - Brian -> 15 Regional - Adam, practice Mon/Wed/Fri.
import os, re
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
def load(p): return open(p, encoding='utf-8').read()
def save(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def swap(s, old, new, where):
    c = s.count(old)
    if c != 1: raise SystemExit(f'{where}: expected 1 of {old[:80]!r}, found {c}')
    return s.replace(old, new)
def block(s, start, end):
    i = s.index(start); j = s.index(end, i); return i, j

t = load('teams.html'); c = load('coaching-staff.html')
if 'BUILD v1.96' in t: raise SystemExit('already v1.96 — refusing second run')

# 16 Colorado - Zhu: row replaced and moved to the top of its table
i, j = block(t, '<span class="team-name">16 Colorado - Zhu</span>', '<details class="team" id="t16-colorado-peterson">')
b = t[i:j]
b = swap(b, '              <tr><td>Jan 3</td><td>Friendship Tournament 2</td></tr>\n', '', '16 Zhu')
b = swap(b, '                <tbody>\n', '                <tbody>\n              <tr><td>Dec 13</td><td>Friendship Tournament 1</td></tr>\n', '16 Zhu')
t = t[:i] + b + t[j:]

# 15 Regional: Brian -> Adam (no staff card yet, so the coach name is unlinked)
i, j = block(t, '<details class="team" id="t15-regional">', '<details class="team" id="t16-national">')
b = t[i:j]
b = swap(b, '<span class="team-name">15 Regional - Brian</span>', '<span class="team-name">15 Regional - Adam</span>', '15R')
b = swap(b, '<span class="team-coach">Head Coach: <a class="coach-link" href="coaching-staff.html#coach-brian-peterson">Brian Peterson</a></span>',
            '<span class="team-coach">Head Coach: Adam</span>', '15R')
b = swap(b, '<p class="roster-tba">Tue, Thu &amp; Fri &middot; 5:15&ndash;7:30 PM</p>',
            '<p class="roster-tba">Mon, Wed &amp; Fri &middot; 5:15&ndash;7:30 PM</p>', '15R')
t = t[:i] + b + t[j:]
t = swap(t, '<a href="#t15-regional">15 Regional - Brian</a>', '<a href="#t15-regional">15 Regional - Adam</a>', 'jump nav')

c = swap(c, '<span>Head Coach &middot; <a href="teams.html#t15-regional">15 Regional</a> &middot; <a href="teams.html#t16-colorado-peterson">16 Colorado</a></span>',
            '<span>Head Coach &middot; <a href="teams.html#t16-colorado-peterson">16 Colorado</a></span>', 'Brian card')

t = swap(t, '<head>\n', '<head>\n  <!-- BUILD v1.96 · 2026-10-06 · [TM] 16 Colorado - Zhu: Jan 3 Friendship Tournament 2 -> Dec 13 Friendship Tournament 1 (top row). 15 Regional - Brian -> 15 Regional - Adam (coach unlinked until Adam has a staff card); practice Mon, Wed & Fri. -->\n', 'stamp')
c = swap(c, '<head>\n', '<head>\n  <!-- BUILD v1.96 · 2026-10-06 · [CO] 15 Regional moved from Brian Peterson to Adam; Brian now heads 16 Colorado only. -->\n', 'stamp')
assert '15 Regional - Brian' not in re.sub(r'<!--.*?-->', '', t, flags=re.S)
save('teams.html', t); save('coaching-staff.html', c); print('ok')
