# v1.82 part B — generate ryl-teams.html from the freshly edited teams.html so it inherits
# the tile CSS, banners, nav (with the RYL item) and card patterns.
import json, re, os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))

def load(p): return open(p, encoding='utf-8').read()
def save(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def swap(s, old, new, n, where):
    c = s.count(old)
    assert c == n, f'{where}: expected {n} of {old[:70]!r}, found {c}'
    return s.replace(old, new)

s = load('teams.html')

# ---------- 1. strip the club page's build-comment history; fresh stamp for a fresh page ----------
s, n = re.subn(r'^\s*<!--\s*BUILD .*?-->\s*\n', '', s, flags=re.M)
assert n >= 1, 'no build comments removed'
stamp = ('  <!-- BUILD v1.82 · 2026-08-31 · NEW PAGE [RT] RYL Teams — the fall-league mirror of Our Club Teams (generated from it, '
         'so it shares the card, tile and jump-bar patterns). Five teams: 12 Colorado (roster withheld per owner — section kept), '
         '13 Colorado - Zhu, 14 National - Tara, 14 Colorado - Jae, 14 Colorado - Mel. Rosters are tile grids with full-word positions; '
         'no Schedule panel (RYL is five Sunday tournaments, scheduled by the RMR) and no jersey-number note (not promised for RYL). '
         '14 Colorado - Mel practice days were not supplied and show as "posted soon". Jump bar is one row of five, so the centered '
         'breakpoint returns to 900px (the club page needs 1360 for its eight-link row). -->\n')
s = s.replace('<head>\n', '<head>\n' + stamp, 1)

# ---------- 2. head metadata ----------
s = swap(s, '<title>Our Club Teams | Colorado Boom Volleyball Club</title>',
             '<title>RYL Teams | Colorado Boom Volleyball Club</title>', 1, 'title')
DESC_OLD = 'Colorado Boom Volleyball Club teams: coaches, rosters, and 2026-27 tournament schedules for every squad.'
DESC_NEW = 'Colorado Boom RYL fall-league teams: coaches, rosters, and practice times for every RYL squad.'
for tag in ('meta name="description"', 'meta property="og:description"', 'meta name="twitter:description"'):
    pass
assert s.count(DESC_OLD) == 3
s = s.replace(DESC_OLD, DESC_NEW)
s = swap(s, '<meta property="og:title" content="Our Club Teams | Colorado Boom Volleyball Club">',
             '<meta property="og:title" content="RYL Teams | Colorado Boom Volleyball Club">', 1, 'og title')
s = swap(s, '<meta name="twitter:title" content="Our Club Teams | Colorado Boom Volleyball Club">',
             '<meta name="twitter:title" content="RYL Teams | Colorado Boom Volleyball Club">', 1, 'tw title')
assert s.count('https://coloradoboom.com/teams.html') >= 2
s = s.replace('https://coloradoboom.com/teams.html', 'https://coloradoboom.com/ryl-teams.html')
s = swap(s, '"name":"Our Club Teams","item"', '"name":"RYL Teams","item"', 1, 'breadcrumb')

# ---------- 3. ItemList: five RYL teams ----------
m = re.search(r'^(\s*)(\{"@context":"https://schema\.org","@type":"ItemList".*)$', s, re.M)
org = {"@type": "SportsOrganization", "name": "Colorado Boom Volleyball Club", "url": "https://coloradoboom.com/"}
items = [{"@type": "ListItem", "position": i + 1,
          "item": {"@type": "SportsTeam", "name": f"Colorado Boom RYL {t}", "sport": "Volleyball", "memberOf": org}}
         for i, t in enumerate(["12 Colorado", "13 Colorado", "14 National", "14 Colorado", "14 Colorado"])]
data = {"@context": "https://schema.org", "@type": "ItemList",
        "name": "Colorado Boom RYL Teams, 2026", "itemListElement": items}
s = s[:m.start(2)] + json.dumps(data, separators=(',', ':')) + s[m.end(2):]

# ---------- 4. nav aria-current moves to the RYL item ----------
s = swap(s, '<a href="teams.html" role="menuitem" aria-current="page">Our Club Teams</a>',
             '<a href="teams.html" role="menuitem">Our Club Teams</a>', 1, 'uncurrent teams')
s = swap(s, '<a href="ryl-teams.html" role="menuitem">RYL Teams</a>',
             '<a href="ryl-teams.html" role="menuitem" aria-current="page">RYL Teams</a>', 1, 'current ryl')

# ---------- 5. hero ----------
s = swap(s, '<h1>Our Club Teams</h1>', '<h1>RYL Teams</h1>', 1, 'h1')
s = swap(s, '<p>2026&ndash;27 club teams: coaches, rosters, practice times, and tournament schedules for every Colorado Boom squad.</p>',
             '<p>Our fall-league squads: coaches, rosters, and practice times for every Colorado Boom RYL team.</p>', 1, 'hero sub')

# ---------- 6. jump bar: one row of five; centered breakpoint back to 900 ----------
m = re.search(r'(<div class="page-jump" data-section="TM-NAV">\n)(.*?)(\s*<div class="jump-tools container">)', s, re.S)
assert m, 'jump region not found'
jump = '''    <nav class="jump-nav jump-row container" aria-label="Teams on this page">
      <a href="#t12-colorado">12 Colorado</a>
      <a href="#t13-colorado">13 Colorado - Zhu</a>
      <a href="#t14-national">14 National - Tara</a>
      <a href="#t14-colorado-jae">14 Colorado - Jae</a>
      <a href="#t14-colorado-mel">14 Colorado - Mel</a>
    </nav>
'''
s = s[:m.end(1)] + jump + s[m.start(3):]
assert s.count('@media(min-width:1360px)') == 2
s = s.replace('@media(min-width:1360px)', '@media(min-width:900px)')
s, n = re.subn(r'    /\* the centered no-scroll rows need room for 8 links.*?\*/\n', '', s, flags=re.S)
assert n == 1

# ---------- 7. team list ----------
def tiles(players):
    rows = '\n'.join(
        f'              <div class="pl"><span class="pname">{n}</span><span class="ppos">{p}</span></div>'
        for n, p in players)
    return ('<div class="roster-grid">\n' + rows + '\n            </div>')

def card(tid, name, lv, coach, roster, practice):
    coach_line = f'\n            <span class="team-coach">Head Coach: <a class="coach-link" href="coaching-staff.html#{coach[0]}">{coach[1]}</a></span>' if coach else ''
    if isinstance(roster, list):
        summary = f'<summary><span>Roster <span class="cnt">&middot; {len(roster)} players</span></span><span class="sic" aria-hidden="true">+</span></summary>'
        body = tiles(roster)
    else:
        summary = '<summary><span>Roster</span><span class="sic" aria-hidden="true">+</span></summary>'
        body = f'<p class="roster-tba">{roster}</p>'
    return f'''      <details class="team" id="{tid}">
        <summary>
          <span class="team-head">
            <span class="team-name">{name}</span>{coach_line}
          </span>
          <span class="lv lv-{lv.lower()}">{lv}</span>
          <span class="team-ic" aria-hidden="true">+</span>
        </summary>
        <div class="team-body">
          <details class="tsub">
            {summary}
            {body}
          </details>
          <details class="tsub">
            <summary><span>Practice Times</span><span class="sic" aria-hidden="true">+</span></summary>
            <p class="roster-tba">{practice}</p>
          </details>
        </div>
      </details>'''

R14N = [('Caidyn Marendt', 'Setter'), ('Brooke Miller', 'Setter'), ('Elyse Paffe', 'Outside'),
        ('Brooklynn Coursey', 'Outside'), ('Maddison Woodman', 'Middle'), ('Anelie Daw', 'Middle'),
        ('Lilly Born', 'Libero'), ('Aven Minjarez', 'DS'), ('Ellian Foster', 'Right Side')]
R14J = [('Carol Ndifor', 'Setter'), ('Delilah Dunbar', 'Setter'), ('Alyssa Weinand', 'Outside'),
        ('Alli Brumfiel', 'Outside'), ('Betanya Molla', 'Middle'), ('Alice Naveen', 'Middle'),
        ('Aimee Weinand', 'Libero'), ('Skylar Cina', 'DS'), ('Marlow Scott', 'Right Side'),
        ('Paige Stewart', 'Right Side')]
R14M = [('Lena Ezzeddine', 'Setter'), ('Mallory Huggins', 'Setter'), ('Keira Penney', 'Outside'),
        ('Eisley Steiner', 'Outside'), ('Mary Lehmann', 'Middle'), ('Jackie Wasinger-Rouse', 'Middle'),
        ('Olivia Farn', 'Libero'), ('Sara Zwald', 'DS'), ('Armaghan Bayat', 'Right Side'),
        ('Averly Salem', 'Right Side')]
R13Z = [('Ellie Marwitz', 'Setter'), ('Bentleigh Bramley', 'Setter'), ('Naomi Martinez Flores', 'Outside'),
        ('Sophia Vargas', 'Outside'), ('Kix Touchard', 'Middle'), ('Olivia Pallodino', 'Middle'),
        ('Octavia Ladson', 'Libero'), ('Kiarya Mccready', 'DS'), ('Lily Milosevich', 'Right Side'),
        ('Marnie Rosino', 'Right Side')]

TT = 'Tue &amp; Thu &middot; 5:30&ndash;7:00 PM'
cards = '\n'.join([
    # 12s: roster withheld per owner ("do not publish the 12s roster but please keep their section available"); no coach supplied
    card('t12-colorado', '12 Colorado', 'Colorado', None, 'Roster will be posted here soon.', TT),
    card('t13-colorado', '13 Colorado - Zhu', 'Colorado', ('coach-zhu', 'Zhu'), R13Z, TT),
    card('t14-national', '14 National - Tara', 'National', ('coach-tara-tucker', 'Tara Tucker'), R14N,
         'Wed &amp; Fri &middot; 6:30&ndash;8:00 PM'),
    card('t14-colorado-jae', '14 Colorado - Jae', 'Colorado', ('coach-jae-spain', 'Jae Spain'), R14J, TT),
    # practice days for Mel's RYL team were not supplied — do not guess
    card('t14-colorado-mel', '14 Colorado - Mel', 'Colorado', ('coach-mel-erly', 'Mel Erly'), R14M,
         'Practice times will be posted here soon.'),
])

sec_start = s.index('<section id="teams" data-section="TM-02" class="bg-teal-d">')
open_div = s.index('<div class="container">', sec_start)
sec_end = s.index('  <!-- ============ [FT] FOOTER', sec_start)
inner = '''<div class="container">
      <!-- [RT-02a] league callout -->
      <div class="times-callout">
        <span class="big">RYL Fall Season &middot; Five Sunday Tournaments &middot; September&ndash;October</span>
        <span class="sub">Included for rostered 14U &amp; under club players &middot; <a class="ulink" href="programs.html#ryl">About the RYL</a></span>
      </div>
      <p class="section-subtitle" style="margin-bottom:26px;">Tap a team to see its coaches, roster, and practice times.</p>
''' + cards + '''
    </div>
  </section>
'''
s = s[:open_div] + inner + s[sec_end:]

# ---------- 8. section codes: TM -> RT on this page; CSS selectors first (they contain the
# bare attribute substring, so the bare swap must come after) ----------
assert s.count('[data-section="TM-02"]') == 2
s = s.replace('[data-section="TM-02"]', '[data-section="RT-02"]')
for a, b in (('data-section="TM-01"', 'data-section="RT-01"'),
             ('data-section="TM-NAV"', 'data-section="RT-NAV"'),
             ('data-section="TM-02"', 'data-section="RT-02"')):
    s = swap(s, a, b, 1, a)
# the callout sub holds white text + a link on the dark band
s = swap(s, '    [data-section="RT-02"] .times-callout .big{color:#fff;}\n',
             '    [data-section="RT-02"] .times-callout .big{color:#fff;}\n'
             '    [data-section="RT-02"] .times-callout .sub{color:#fff;}\n'
             '    [data-section="RT-02"] .times-callout .sub .ulink{color:#fff;}\n', 1, 'sub white')
# season-start comment text came along inside the style comment; harmless, but retitle
s = s.replace('/* [TM-02a] season-start callout: gold frame, white text on the dark teal band */',
              '/* [RT-02a] league callout: gold frame, white text on the dark teal band */')

save('ryl-teams.html', s)

# positive controls
assert s.count('<details class="team"') == 5
assert s.count('class="pl"') == 39, s.count('class="pl"')  # 9+10+10+10
assert 'Practice Begins November 2, 2026' not in s
assert 'Mia Salem' not in s and 'Sloane James' not in s and 'London James' not in s, '12s roster must not publish'
assert 'Alexandra lee for 11' not in s and 'Can add 1 more' not in s and 'total' not in s.lower().replace('totals',''), 'notes must not publish'
assert s.count('Tournament</th>') == 0, 'no schedule tables on RYL page'
assert 'lv-national">National' in s and s.count('lv-colorado">Colorado') == 4
print('ryl-teams.html OK:', len(s), 'chars')
