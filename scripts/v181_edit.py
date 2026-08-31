# v1.81 scripted edit: rename Our Teams -> Our Club Teams site-wide, season-start callout,
# Friday practices, new 12 Colorado - Kula team + coach card, first five rosters.
import json, re, os

os.chdir(os.path.join(os.path.dirname(__file__), '..'))

def load(p): return open(p, encoding='utf-8').read()
def save(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def swap(s, old, new, n, where):
    c = s.count(old)
    assert c == n, f'{where}: expected {n} of {old[:60]!r}, found {c}'
    return s.replace(old, new)

T = 'teams.html'
s = load(T)
if 'BUILD v1.81' in s:
    print('teams.html already at v1.81, skipping')
    import sys
    s = None

# ---------- 1. Fridays on all 14 existing practice lines (before the 12s block exists) ----------
s = swap(s, 'Tue &amp; Thu &middot; 5:15&ndash;7:30 PM', 'Tue, Thu &amp; Fri &middot; 5:15&ndash;7:30 PM', 5, 'Tue/Thu')
s = swap(s, 'Mon &amp; Wed &middot; 5:15&ndash;7:30 PM', 'Mon, Wed &amp; Fri &middot; 5:15&ndash;7:30 PM', 7, 'Mon/Wed')
s = swap(s, 'Mon &amp; Tue &middot; 5:15&ndash;7:30 PM', 'Mon, Tue &amp; Fri &middot; 5:15&ndash;7:30 PM', 1, 'Mon/Tue')
s = swap(s, 'Mon &middot; 6:30&ndash;8:45 PM<br>Wed &middot; 5:15&ndash;7:30 PM',
             'Mon &middot; 6:30&ndash;8:45 PM<br>Wed &amp; Fri &middot; 5:15&ndash;7:30 PM', 1, '14N special')
assert s.count('Fri &middot; 5:15') == 14, 'positive control: 14 Friday practice lines'

# ---------- 2. "Practice Begins" callout at the top of [TM-02] ----------
anchor = '  <section id="teams" data-section="TM-02" class="bg-teal-d">\n    <div class="container">\n'
callout = ('      <!-- [TM-02a] season start callout (owner, 2026-08-31) -->\n'
           '      <div class="times-callout"><span class="big">Practice Begins November 2, 2026</span></div>\n')
s = swap(s, anchor, anchor + callout, 1, 'TM-02 callout')
style_anchor = '    .roster-tba{font-size:15px;font-weight:600;color:#111;margin:0;padding:0 0 16px;}\n'
style_add = ('    /* [TM-02a] season-start callout: gold frame, white text on the dark teal band */\n'
             '    [data-section="TM-02"] .times-callout{margin:0 auto 26px;}\n'
             '    [data-section="TM-02"] .times-callout .big{color:#fff;}\n')
s = swap(s, style_anchor, style_anchor + style_add, 1, 'callout style')

# ---------- 3. New team: 12 Colorado - Kula ----------
block = '''      <details class="team" id="t12-colorado">
        <summary>
          <span class="team-head">
            <span class="team-name">12 Colorado - Kula</span>
            <span class="team-coach">Head Coach: <a class="coach-link" href="coaching-staff.html#coach-kula-tanuvasa">Kula</a></span>
          </span>
          <span class="lv lv-colorado">Colorado</span>
          <span class="team-ic" aria-hidden="true">+</span>
        </summary>
        <div class="team-body">
          <details class="tsub">
            <summary><span>Roster</span><span class="sic" aria-hidden="true">+</span></summary>
            <p class="roster-tba">Roster will be posted here soon.</p>
          </details>
          <details class="tsub">
            <summary><span>Practice Times</span><span class="sic" aria-hidden="true">+</span></summary>
            <p class="roster-tba">Tue &amp; Thu &middot; 5:15&ndash;7:30 PM</p>
          </details>
          <details class="tsub">
            <summary><span>Schedule <span class="cnt">&middot; 2026&ndash;27 season</span></span><span class="sic" aria-hidden="true">+</span></summary>
            <p class="roster-tba">Tournament schedule will be posted here soon.</p>
          </details>
        </div>
      </details>
'''
s = swap(s, '      <details class="team" id="t13-colorado">',
             block + '      <details class="team" id="t13-colorado">', 1, '12s block')

s = swap(s, '<nav class="jump-nav jump-row container" aria-label="Teams on this page">\n      <a href="#t13-colorado">',
             '<nav class="jump-nav jump-row container" aria-label="Teams on this page">\n      <a href="#t12-colorado">12 Colorado - Kula</a>\n      <a href="#t13-colorado">',
             1, 'jump link')

# JSON-LD ItemList: prepend the 12s, renumber all positions
m = re.search(r'^(\s*)(\{"@context":"https://schema\.org","@type":"ItemList".*)$', s, re.M)
assert m, 'ItemList line not found'
data = json.loads(m.group(2))
assert len(data['itemListElement']) == 14
org = data['itemListElement'][0]['item']['memberOf']
data['itemListElement'].insert(0, {"@type": "ListItem", "position": 1, "item": {
    "@type": "SportsTeam", "name": "Colorado Boom 12 Colorado", "sport": "Volleyball", "memberOf": org}})
for i, el in enumerate(data['itemListElement']):
    el['position'] = i + 1
s = s[:m.start(2)] + json.dumps(data, separators=(',', ':')) + s[m.end(2):]

# ---------- 4. Rosters (positions as supplied, uppercased; names title-cased/trimmed) ----------
ROSTERS = {
 't14-national': [  # supplied as "14 National Tara"
  ('Nahkialya Mabey', 'PIN'), ('Elyse Paffe', 'OH/DS'), ('Ellian Foster', 'PIN'), ('Zohra Farih', 'M/PIN'),
  ('Anelie Daw', 'M'), ('Brooklynn Coursey', 'PIN'), ('Caidyn Marendt', 'S'), ('Brooke Miller', 'S'),
  ('Lilly Born', 'L/DS'), ('Hailey Delaney', 'L/DS')],
 't14-colorado-krise': [  # "14 Colorado - Kimberly"
  ('Alli Brumfiel', 'PIN'), ('Skylar Cina', 'PIN'), ('Paige Stewart', 'PIN/M'), ('Marlow Scott', 'R'),
  ('Alice Naveen', 'M'), ('Betanya Molla', 'M'), ('Carol Ndifor', 'S'), ('Alyssa Weinand', 'RS'),
  ('Aimee Aviles Ramirez', 'L/DS'), ('Aven Minjarez', 'L/DS')],
 't16-colorado-zhu': [  # "16 Colorado - Zhu"
  ('Izana Avery', 'OH/DS'), ('Emilia Ginzburg', 'OH/DS'), ('Jillian Carmel', 'R/DS'), ('Marlaa Ganbold', 'R'),
  ('Harley Rey', 'M'), ('Addyson Fisher', 'M'), ('Teghan Bramley', 'S'), ('Maddie Madril', 'S'),
  ('Maddison Johnson', 'L'), ('Denver Albarrab', 'L')],
 't16-national': [  # supplied as "16 Nationals - Damon"; the site team is 16 National - Damon
  ('Isabel Stebbins', 'OH/DS'), ('Andrea Aguerrevere', 'S'), ('Ashlynn Johnson', 'R'), ('Cecilia Razon', 'R/OH'),
  ('Jola Okunado', 'R'), ('Stella Jenks', 'M'), ('Anaiah Quarcoo', 'M'), ('Autum Caldwell', 'S'),
  ('Emma Kaiser', 'L'), ('Addy Wolf', 'L')],
 't14-colorado-erly': [  # supplied as "16 Colorado - Mel"; no such team exists -- Mel coaches 14 Colorado. FLAGGED to owner.
  ('Lena Ezzeddine', 'PIN'), ('Mallory Huggins', 'U'), ('Armaghan Bayat', 'PIN/M'), ('Keira Penney', 'R'),
  ('Mary Lehmann', 'M'), ('Alexandra Lee', 'M'), ('Eisley Steiner', 'S'), ('Sara Zwald', 'DS'),
  ('Brooke Weller', 'L/DS'), ('Olivia Farn', 'L/DS')],
}

def roster_html(players):
    rows = '\n'.join(f'              <tr><td>{n}</td><td>{p}</td></tr>' for n, p in players)
    return ('<div class="tbl-wrap">\n'
            '              <table class="sched">\n'
            '                <thead><tr><th scope="col">Player</th><th scope="col">Position</th></tr></thead>\n'
            '                <tbody>\n'
            f'{rows}\n'
            '                </tbody>\n'
            '              </table>\n'
            '            </div>\n'
            '            <p class="roster-tba">Jersey numbers will be posted once assigned.</p>')

TBA = '<p class="roster-tba">Roster will be posted here soon.</p>'
SUM = '<summary><span>Roster</span><span class="sic" aria-hidden="true">+</span></summary>'
for tid, players in ROSTERS.items():
    assert len(players) == 10, tid
    start = s.index(f'<details class="team" id="{tid}">')
    end = s.find('<details class="team" id=', start + 10)
    if end == -1:
        end = len(s)
    seg = s[start:end]
    assert seg.count(TBA) == 1, f'{tid}: roster TBA not unique in block'
    assert seg.count(SUM) == 1, f'{tid}: roster summary not unique in block'
    seg = seg.replace(SUM, '<summary><span>Roster <span class="cnt">&middot; 10 players</span></span><span class="sic" aria-hidden="true">+</span></summary>')
    seg = seg.replace(TBA, roster_html(players))
    s = s[:start] + seg + s[end:]

# ---------- 5. Our Teams -> Our Club Teams on this page (title/og/twitter/breadcrumb/nav/h1) ----------
c = s.count('Our Teams')
assert c == 6, f'teams.html Our Teams count {c}'
s = s.replace('Our Teams', 'Our Club Teams')

# ---------- 6. build stamp ----------
stamp = ('  <!-- BUILD v1.81 · 2026-08-31 · [TM] page renamed "Our Club Teams" (title/h1/nav/breadcrumb, and the nav item on every page). '
         '[TM-02a] NEW gold season-start callout at the top of the team list: "Practice Begins November 2, 2026". '
         'Every team adds a FRIDAY practice at the standard 5:15-7:30 window (owner; also squares this page with club.html, which has promised '
         '"three practices a week" while every team here listed two). NEW team 12 Colorado - Kula (Kula Tanuvasa), Tue & Thu, roster/schedule pending '
         '-- jump nav now 8+7, ItemList 15 teams. FIRST FIVE ROSTERS live (10 players each, positions; jersey numbers to follow): '
         '14 National - Tara, 14 Colorado - Kimberly, 14 Colorado - Mel, 16 Colorado - Zhu, 16 National - Damon. '
         'NOTE: the Mel roster arrived labeled "16 Colorado - Mel" -- no such team exists (the 16 Colorado teams are Zhu and Brian; Mel coaches '
         '14 Colorado), so it is published under 14 Colorado - Mel; if it belongs to a 16s team, moving it is one block swap. '
         'RYL teams tab: owner will send details separately; stage on drafts. Prev BUILD v1.78 ')
s = swap(s, '  <!-- BUILD v1.78 ', stamp, 1, 'stamp')
save(T, s)
print('teams.html OK,', len(s), 'chars')

# ---------- coaching-staff.html: Kula card + rename + stamp ----------
C = 'coaching-staff.html'
s = load(C)
jawn = ('<div class="coach" id="coach-jawn-suzuki"><div class="ph" data-img="coach-jawn-suzuki.jpg">[ Coach photo ]</div>'
        '<div class="b"><h4>Jawn Suzuki</h4><span>Head Coach &middot; 17 National</span></div></div>')
kula = ('\n        <div class="coach" id="coach-kula-tanuvasa"><div class="ph" data-img="coach-kula-tanuvasa.jpg">[ Coach photo ]</div>'
        '<div class="b"><h4>Kula Tanuvasa</h4><span>Head Coach &middot; 12 Colorado</span></div></div>')
s = swap(s, jawn, jawn + kula, 1, 'kula card')
s = swap(s, '>Our Teams</a>', '>Our Club Teams</a>', 1, 'staff nav')
s = swap(s, 'href="teams.html">Our Teams</a> page', 'href="teams.html">Our Club Teams</a> page', 1, 'staff prose')
s = swap(s, '  <!-- BUILD v1.80 ',
         ('  <!-- BUILD v1.81 · 2026-08-31 · [CO-03] NEW coach card: Kula Tanuvasa, Head Coach · 12 Colorado (new team on the teams page) '
          '-- placed between Suzuki and Zhu to keep the grid alphabetical by last name; photo placeholder named coach-kula-tanuvasa.jpg. '
          'Nav + prose: "Our Teams" renamed "Our Club Teams". Prev BUILD v1.80 '), 1, 'staff stamp')
save(C, s)
print('coaching-staff.html OK')

# ---------- nav rename on the remaining 10 pages ----------
pages = ['boys-club.html', 'club.html', 'girls-club.html', 'index.html', 'parent-resources.html',
         'programs.html', 'schedule.html', 'tryouts.html', 'volleyball-positions.html', 'volleyball-rules.html']
note = '  <!-- BUILD v1.81 · 2026-08-31 · nav: "Our Teams" renamed "Our Club Teams" (site-wide). -->\n'
for p in pages:
    s = load(p)
    s = swap(s, '>Our Teams</a>', '>Our Club Teams</a>', 1, p)
    i = s.index('  <!-- BUILD ')
    s = s[:i] + note + s[i:]
    save(p, s)
    print(p, 'OK')

print()
print('ALL EDITS APPLIED')
