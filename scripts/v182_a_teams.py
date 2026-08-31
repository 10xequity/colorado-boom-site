# v1.82 part A — teams.html: pull the 16 Colorado - Zhu roster, convert rosters to tiles,
# full coach names in coach lines, RYL Teams nav item, ANN banner combined to 10U-18U.
import re, os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))

def load(p): return open(p, encoding='utf-8').read()
def save(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def swap(s, old, new, n, where):
    c = s.count(old)
    assert c == n, f'{where}: expected {n} of {old[:70]!r}, found {c}'
    return s.replace(old, new)

T = 'teams.html'
s = load(T)

# ---------- 1. revert 16 Colorado - Zhu roster to TBA ----------
start = s.index('<details class="team" id="t16-colorado-zhu">')
end = s.index('<details class="team" id=', start + 10)
seg = s[start:end]
seg = swap(seg,
    '<summary><span>Roster <span class="cnt">&middot; 10 players</span></span><span class="sic" aria-hidden="true">+</span></summary>',
    '<summary><span>Roster</span><span class="sic" aria-hidden="true">+</span></summary>', 1, 'zhu summary')
seg2, n = re.subn(r'<div class="tbl-wrap">\s*<table class="sched">\s*<thead><tr><th scope="col">Player</th>.*?Jersey numbers will be posted once assigned\.</p>',
                  '<p class="roster-tba">Roster will be posted here soon.</p>', seg, flags=re.S)
assert n == 1, 'zhu roster table not replaced'
s = s[:start] + seg2 + s[end:]

# ---------- 2. remaining four roster tables -> tile grids ----------
def tiles(players):
    rows = '\n'.join(
        f'              <div class="pl"><span class="pname">{n}</span><span class="ppos">{p}</span></div>'
        for n, p in players)
    return ('<div class="roster-grid">\n'
            f'{rows}\n'
            '            </div>\n'
            '            <p class="roster-tba">Jersey numbers will be posted once assigned.</p>')

ROSTERS = {
 't14-national': [
  ('Nahkialya Mabey', 'PIN'), ('Elyse Paffe', 'OH/DS'), ('Ellian Foster', 'PIN'), ('Zohra Farih', 'M/PIN'),
  ('Anelie Daw', 'M'), ('Brooklynn Coursey', 'PIN'), ('Caidyn Marendt', 'S'), ('Brooke Miller', 'S'),
  ('Lilly Born', 'L/DS'), ('Hailey Delaney', 'L/DS')],
 't14-colorado-krise': [
  ('Alli Brumfiel', 'PIN'), ('Skylar Cina', 'PIN'), ('Paige Stewart', 'PIN/M'), ('Marlow Scott', 'R'),
  ('Alice Naveen', 'M'), ('Betanya Molla', 'M'), ('Carol Ndifor', 'S'), ('Alyssa Weinand', 'RS'),
  ('Aimee Aviles Ramirez', 'L/DS'), ('Aven Minjarez', 'L/DS')],
 't16-national': [
  ('Isabel Stebbins', 'OH/DS'), ('Andrea Aguerrevere', 'S'), ('Ashlynn Johnson', 'R'), ('Cecilia Razon', 'R/OH'),
  ('Jola Okunado', 'R'), ('Stella Jenks', 'M'), ('Anaiah Quarcoo', 'M'), ('Autum Caldwell', 'S'),
  ('Emma Kaiser', 'L'), ('Addy Wolf', 'L')],
 't14-colorado-erly': [
  ('Lena Ezzeddine', 'PIN'), ('Mallory Huggins', 'U'), ('Armaghan Bayat', 'PIN/M'), ('Keira Penney', 'R'),
  ('Mary Lehmann', 'M'), ('Alexandra Lee', 'M'), ('Eisley Steiner', 'S'), ('Sara Zwald', 'DS'),
  ('Brooke Weller', 'L/DS'), ('Olivia Farn', 'L/DS')],
}
for tid, players in ROSTERS.items():
    start = s.index(f'<details class="team" id="{tid}">')
    end = s.find('<details class="team" id=', start + 10)
    if end == -1:
        end = len(s)
    seg = s[start:end]
    seg2, n = re.subn(r'<div class="tbl-wrap">\s*<table class="sched">\s*<thead><tr><th scope="col">Player</th>.*?Jersey numbers will be posted once assigned\.</p>',
                      tiles(players), seg, count=1, flags=re.S)
    assert n == 1, f'{tid}: roster table not converted'
    s = s[:start] + seg2 + s[end:]

# ---------- 3. tile CSS (page-local, next to the other [TM] card styles) ----------
anchor = '    [data-section="TM-02"] .times-callout .big{color:#fff;}\n'
tile_css = '''    /* [TM] roster tiles (v1.82): 4-up like the staff page's coach grid, stepping down with
       the viewport. Each tile carries name + position; when jersey numbers arrive, add
       <span class="pnum">12</span> as the FIRST child of a tile and the gold corner badge
       below renders it — no other change needed. */
    .roster-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:2px 0 14px;}
    @media(max-width:900px){.roster-grid{grid-template-columns:repeat(3,1fr);}}
    @media(max-width:620px){.roster-grid{grid-template-columns:repeat(2,1fr);}}
    .pl{position:relative;background:#fff;border:1px solid rgba(0,0,0,.10);border-top:3px solid var(--teal);border-radius:6px;padding:14px 10px 12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);}
    .pl .pname{display:block;font-family:'Montserrat',sans-serif;font-weight:700;font-size:14px;line-height:1.3;color:var(--black);}
    .pl .ppos{display:block;margin-top:4px;font-family:'Montserrat',sans-serif;font-weight:600;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--teal-dark);}
    .pl .pnum{position:absolute;top:-1px;right:-1px;background:var(--gold);color:var(--black);font-family:'Montserrat',sans-serif;font-weight:900;font-size:12px;padding:3px 8px;border-radius:0 6px 0 6px;}
'''
s = swap(s, anchor, anchor + tile_css, 1, 'tile css')

# ---------- 4. full names in coach lines (team titles unchanged; Zhu stays "Zhu") ----------
FULL = {
 'coach-tara-tucker': ('Tara', 'Tara Tucker', 2),
 'coach-alicia-hall': ('Alicia', 'Alicia Hall', 2),
 'coach-makayla-clemons': ('Makayla', 'Makayla Clemons', 2),
 'coach-kimberly-krise': ('Kimberly', 'Kimberly Krise', 1),
 'coach-rudy-garcia': ('Rudy', 'Rudy Garcia', 1),
 'coach-mel-erly': ('Mel', 'Mel Erly', 1),
 'coach-sidney-reese': ('Sidney', 'Sidney Reese', 1),
 'coach-jae-spain': ('Jae', 'Jae Spain', 1),
 'coach-claire-kwok': ('Claire', 'Claire Kwok', 1),
 'coach-brian-peterson': ('Brian', 'Brian Peterson', 2),
 'coach-damon-sichler': ('Damon', 'Damon Sichler', 1),
 'coach-randy-vang': ('Randy', 'Randy Vang', 2),
 'coach-will-ly': ('Will', 'Will Ly', 2),
 'coach-kyn-van': ('Kyn', 'Kyn Van', 2),
 'coach-jawn-suzuki': ('Jawn', 'Jawn Suzuki', 1),
 'coach-kula-tanuvasa': ('Kula', 'Kula Tanuvasa', 1),
}
for cid, (first, full, n) in FULL.items():
    s = swap(s, f'{cid}">{first}</a>', f'{cid}">{full}</a>', n, f'full name {cid}')

# ---------- 5. RYL Teams nav item ----------
s = swap(s, '<a href="teams.html" role="menuitem" aria-current="page">Our Club Teams</a>',
             '<a href="teams.html" role="menuitem" aria-current="page">Our Club Teams</a>\n            <a href="ryl-teams.html" role="menuitem">RYL Teams</a>',
             1, 'nav item')

# ---------- 6. ANN banner: combined 10U-18U, no RYL ----------
ANN_OLD_HEAD = 'Girls Club &amp; RYL Tryouts &nbsp;&bull;&nbsp; 10U&ndash;14U<span data-show-until="2026-08-31"> &nbsp;&bull;&nbsp; Mon Aug 31</span> &nbsp;&bull;&nbsp; Tryouts Sept 13 &amp; 20'
ANN_NEW_HEAD = 'Girls Club Tryouts &nbsp;&bull;&nbsp; 10U&ndash;18U &nbsp;&bull;&nbsp; Tryouts Sept 13 &amp; 20'
ANN_OLD_NOTE = '10U&ndash;14U &middot; Sun Sept 13, 6:00&ndash;7:00 PM &middot; Sun Sept 20, 1:00&ndash;2:00 PM &middot; Uniform fitting Sept 13, 5:00&ndash;8:00 PM &middot; Or walk in at any Wed / Fri open gym &middot; RYL tryouts run the same dates'
ANN_NEW_NOTE = '10U&ndash;18U &middot; Sun Sept 13, 6:00&ndash;7:00 PM &middot; Sun Sept 20, 1:00&ndash;2:00 PM &middot; Uniform fitting Sept 13, 5:00&ndash;8:00 PM &middot; Or walk in at any Wed / Fri open gym'
s = swap(s, ANN_OLD_HEAD, ANN_NEW_HEAD, 1, 'ann head')
s = swap(s, ANN_OLD_NOTE, ANN_NEW_NOTE, 1, 'ann note')

# ---------- 7. build stamp ----------
stamp = ('  <!-- BUILD v1.82 · 2026-08-31 · [TM] ROSTERS AS TILE GRIDS: the roster tables become 4-up tile grids (name + position per tile, '
         'stepping 4/3/2 with the viewport; a gold corner badge renders a jersey number the moment a <span class="pnum"> is added). '
         '16 Colorado - Zhu roster PULLED back to "posted soon" per owner. Coach lines now carry FULL NAMES (Head Coach: Tara Tucker) while '
         'team titles keep first names; Zhu stays "Zhu" per the standing convention. Nav gains Club Info > RYL Teams (new ryl-teams.html). '
         'ANN banner site-wide: "Girls Club Tryouts · 10U-18U" (RYL mention and the 10U-14U/15U-18U split removed per owner). '
         'Prev BUILD v1.81 ')
s = swap(s, '  <!-- BUILD v1.81 ', stamp, 1, 'stamp')

save(T, s)

# positive controls
assert s.count('class="roster-grid"') == 4, 'expected 4 tile grids'
assert s.count('class="pl"') == 40, 'expected 40 player tiles'
assert s.count('Roster will be posted here soon.') == 11, '11 TBA rosters (10 + zhu)'
assert s.count('&middot; 10 players') == 4, '4 counted rosters'
assert 'Tara Tucker</a>' in s and 'Kula Tanuvasa</a>' in s
print('teams.html OK:', len(s), 'chars')
