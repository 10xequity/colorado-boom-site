# v1.82 part C — staff-page team links; tryouts consolidation (items 7-8); ANN + RYL nav
# item on the remaining pages; girls-club cross-reference; programs RYL facts; sitemap.
import re, os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))

def load(p): return open(p, encoding='utf-8').read()
def save(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def swap(s, old, new, n, where):
    c = s.count(old)
    assert c == n, f'{where}: expected {n} of {old[:70]!r}, found {c}'
    return s.replace(old, new)

ANN_OLD_HEAD = 'Girls Club &amp; RYL Tryouts &nbsp;&bull;&nbsp; 10U&ndash;14U<span data-show-until="2026-08-31"> &nbsp;&bull;&nbsp; Mon Aug 31</span> &nbsp;&bull;&nbsp; Tryouts Sept 13 &amp; 20'
ANN_NEW_HEAD = 'Girls Club Tryouts &nbsp;&bull;&nbsp; 10U&ndash;18U &nbsp;&bull;&nbsp; Tryouts Sept 13 &amp; 20'
ANN_OLD_NOTE = '10U&ndash;14U &middot; Sun Sept 13, 6:00&ndash;7:00 PM &middot; Sun Sept 20, 1:00&ndash;2:00 PM &middot; Uniform fitting Sept 13, 5:00&ndash;8:00 PM &middot; Or walk in at any Wed / Fri open gym &middot; RYL tryouts run the same dates'
ANN_NEW_NOTE = '10U&ndash;18U &middot; Sun Sept 13, 6:00&ndash;7:00 PM &middot; Sun Sept 20, 1:00&ndash;2:00 PM &middot; Uniform fitting Sept 13, 5:00&ndash;8:00 PM &middot; Or walk in at any Wed / Fri open gym'
NAV_OLD = '<a href="teams.html" role="menuitem">Our Club Teams</a>'
NAV_NEW = NAV_OLD + '\n            <a href="ryl-teams.html" role="menuitem">RYL Teams</a>'
NOTE = '  <!-- BUILD v1.82 · 2026-08-31 · nav: RYL Teams item added under Club Info; ANN banner combined to "Girls Club Tryouts · 10U-18U" (RYL mention and age split removed per owner). -->\n'

# ================= coaching-staff.html: team names link to their team card =================
C = 'coaching-staff.html'
s = load(C)
LINKS = {
 'coach-mel-erly':        [('14 Colorado', 't14-colorado-erly')],
 'coach-kimberly-krise':  [('14 Colorado', 't14-colorado-krise')],
 'coach-will-ly':         [('16 Regional', 't16-regional'), ('17 Colorado', 't17-colorado')],
 'coach-brian-peterson':  [('15 Regional', 't15-regional'), ('16 Colorado', 't16-colorado-peterson')],
 'coach-sidney-reese':    [('15 National', 't15-national-reese')],
 'coach-jae-spain':       [('15 Colorado', 't15-colorado')],
 'coach-jawn-suzuki':     [('17 National', 't17-national')],
 'coach-kula-tanuvasa':   [('12 Colorado', 't12-colorado')],
 'coach-zhu':             [('13 Colorado', 't13-colorado'), ('16 Colorado', 't16-colorado-zhu')],
 'coach-makayla-clemons': [('13 Colorado', 't13-colorado'), ('16 Colorado', 't16-colorado-zhu')],
 'coach-rudy-garcia':     [('14 Colorado', 't14-colorado-krise')],
 'coach-alicia-hall':     [('14 National', 't14-national'), ('15 National', 't15-national-tucker')],
 'coach-claire-kwok':     [('15 Colorado', 't15-colorado')],
 'coach-kyn-van':         [('16 Regional', 't16-regional'), ('17 Colorado', 't17-colorado')],
 'coach-randy-vang':      [('16 National', 't16-national'), ('17 National', 't17-national')],
}
for cid, teams in LINKS.items():
    start = s.index(f'id="{cid}"')
    end = s.find('id="coach-', start + 10)
    if end == -1:
        end = start + 800
    seg = s[start:end]
    for team, anchor in teams:
        seg = swap(seg, f'&middot; {team}', f'&middot; <a href="teams.html#{anchor}">{team}</a>', 1, f'{cid} {team}')
    s = s[:start] + seg + s[end:]
# link style: inherit the span's teal, underline for affordance; teams.html opens the card on arrival
style_anchor = '    .coach .b span{color:var(--teal);}\n'
style_add = ('    /* team assignments under a name link to that team\'s card on the teams page,\n'
             '       which auto-opens deep-linked cards; links inherit the span\'s teal */\n'
             '    .coach .b span a{color:inherit;text-decoration:underline;text-underline-offset:2px;}\n'
             '    .coach .b span a:hover{color:var(--teal-dark);}\n'
             '    .coach .b span a:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}\n')
s = swap(s, style_anchor, style_anchor + style_add, 1, 'staff link css')
s = swap(s, NAV_OLD, NAV_NEW, 1, 'staff nav')
s = swap(s, ANN_OLD_HEAD, ANN_NEW_HEAD, 1, 'staff ann head')
s = swap(s, ANN_OLD_NOTE, ANN_NEW_NOTE, 1, 'staff ann note')
s = swap(s, '  <!-- BUILD v1.81 ',
         ('  <!-- BUILD v1.82 · 2026-08-31 · [CO-02b]+[CO-03] every team assignment under a coach now LINKS to that team\'s card '
          'on Our Club Teams (the teams page auto-opens a deep-linked card); nav gains RYL Teams; ANN combined to 10U-18U. '
          'Prev BUILD v1.81 '), 1, 'staff stamp')
save(C, s)
print(C, 'OK')

# ================= tryouts.html: items 7 + 8 =================
T = 'tryouts.html'
s = load(T)
# ANN banner
s = swap(s, ANN_OLD_HEAD, ANN_NEW_HEAD, 1, 'ann head')
s = swap(s, ANN_OLD_NOTE, ANN_NEW_NOTE, 1, 'ann note')
# gold THIS-WEEK callout: one combined message, no RYL, no age split
s = swap(s, '<span class="big">Girls Club &amp; RYL Tryouts: September</span>',
             '<span class="big">Girls Club Tryouts: September</span>', 1, 'callout big')
s = swap(s, '<span class="sub">Girls 10U&ndash;14U (all positions) &middot; Sun Sept 13 &middot; Sun Sept 20: one tryout covers Club teams <em>and</em> the RYL fall league</span>',
             '<span class="sub">Girls 10U&ndash;18U (all positions) &middot; Sun Sept 13 &middot; Sun Sept 20</span>', 1, 'callout sub1')
s = swap(s, '\n        <span class="sub">15U&ndash;18U: ongoing tryouts at open gym: 17s &amp; 18s need middles &amp; pin hitters &middot; Regional 15s &amp; 16s have spots for hitters &amp; middles</span>', '', 1, 'callout sub3 removed')
# section heading link
s = swap(s, '>Girls 10U&ndash;14U: Official Club &amp; RYL Tryouts (all positions)</a>',
             '>Girls 10U&ndash;18U: Official Club Tryouts (all positions)</a>', 1, 'h3')
# notes: drop the RYL-concurrent framing and the RYL-only paragraph
s = swap(s, '<p class="sched-note">Tryouts for Club teams and the RYL fall league run concurrently, these sessions place players on 2026&ndash;27 club teams <em>and</em> our RYL fall-league teams. Can&rsquo;t make the first session? The later dates double as make-up tryouts.</p>',
             '<p class="sched-note">These sessions place players on 2026&ndash;27 club teams. Can&rsquo;t make the first session? The later dates double as make-up tryouts.</p>', 1, 'concurrent note')
s = swap(s, '\n      <p class="sched-note"><strong>RYL only?</strong> The RYL is the region&rsquo;s fall youth league for players not yet in high school. Girls <em>and</em> boys who just want RYL try out at these same sessions, boys are welcome to join the RYL without joining club. <a class="ulink" href="programs.html#ryl">Learn about the RYL</a>.</p>', '', 1, 'ryl-only note removed')
# remove the separate 15U-18U block (h3 + callout + checks); the USAV note + CTA stay in TO-04
old_block = '''      <h3 id="ongoing-1518" style="text-align:center;margin:30px 0 12px;"><a class="ulink" href="https://forms.gle/2fEhY72d9GdU5Q8H7" target="_blank" rel="noopener">Girls 15U&ndash;18U: Ongoing Tryouts</a></h3>
      <div class="times-callout">
        <span class="big">Try Out at Any Open Gym</span>
        <span class="sub">Wed / Fri &middot; 5:30&ndash;7:00 PM</span>
        <span class="sub">Register below or just walk in &middot; private evaluations: <a class="ulink" href="mailto:admin@coloradoboom.com">admin@coloradoboom.com</a></span>
      </div>
      <ul class="checks" style="max-width:660px;">
        <li><strong>17s &amp; 18s:</strong> we need middles and pin hitters (outside &amp; right-side).</li>
        <li><strong>Regional 15s &amp; 16s:</strong> open team spots for hitters and middles.</li>
        <li><strong>Willing to try a different position?</strong> Tell us, we&rsquo;ll train you.</li>
      </ul>
'''
s = swap(s, old_block, '', 1, 'ongoing block removed')
# new black band after [TO-04]: the open-gym tryout offer, all ages, template dark section
new_section = '''  <!-- ===== [TO-04b] OPEN-GYM TRYOUTS (v1.82) — the separate 15U-18U "ongoing tryouts" block
       becomes one all-ages black band per owner: no age split on this page, 10U-18U ===== -->
  <section data-section="TO-04b" class="bg-dark" id="open-gym-tryouts">
    <div class="container narrow" style="text-align:center;">
      <h2 class="section-title" style="color:var(--gold);">Try Out at Any Open Gym</h2>
      <p class="section-subtitle">Girls 10U&ndash;18U &middot; every Wed / Fri open gym doubles as a tryout &middot; register or just walk in</p>
      <div class="times-callout">
        <span class="big">Wed / Fri &middot; 5:30&ndash;7:00 PM</span>
        <span class="sub">Private evaluations: <a class="ulink" href="mailto:admin@coloradoboom.com">admin@coloradoboom.com</a></span>
      </div>
      <div class="cta-inline"><a href="https://forms.gle/5wyRdqmmUxUdhkK4A" target="_blank" rel="noopener" class="btn btn-gold">Register for Open Gym</a></div>
    </div>
  </section>
'''
anchor = '  <!-- ===== [TO-07] OCS / GOT AN OFFER ===== -->'
s = swap(s, anchor, new_section + anchor, 1, 'TO-04b inserted')
# the cream callout box turns illegible on black — restate it for the dark band (page-local)
m = re.search(r'</style>', s)
assert m, 'no style block on tryouts.html'
dark_css = ('    /* [TO-04b] the base .times-callout is a cream box; on the black band it goes to the\n'
            '       translucent treatment the teal-d sections already use, with white text and a white\n'
            '       link (the default teal link fails contrast on black) */\n'
            '    .bg-dark .times-callout{background:rgba(255,255,255,.08);}\n'
            '    .bg-dark .times-callout .big,.bg-dark .times-callout .sub{color:#fff;}\n'
            '    .bg-dark .times-callout .ulink{color:#fff;}\n'
            '  ')
s = s[:m.start()] + dark_css + s[m.start():]
# coherence inside the page: open-gym section + OCS bullets follow the combined age range
s = swap(s, '<span class="sub">Girls 10U&ndash;14U: join us at tryouts: <a class="ulink" href="#tryouts">Sun Sept 13 &amp; 20</a></span>',
             '<span class="sub">Girls 10U&ndash;18U: join us at tryouts: <a class="ulink" href="#tryouts">Sun Sept 13 &amp; 20</a></span>', 1, 'open gym sub')
s = swap(s, '<li><strong>10U&ndash;14U offers</strong> are sent', '<li><strong>10U&ndash;18U offers</strong> are sent', 1, 'ocs bullet')
s = swap(s, NAV_OLD, NAV_NEW, 1, 'tryouts nav')
s = swap(s, '  <!-- BUILD v1.69 ',
         ('  <!-- BUILD v1.82 · 2026-08-31 · [TO-04] one tryout message per owner: "Girls Club Tryouts · 10U-18U" — the RYL mentions and '
          'the 10U-14U vs 15U-18U split are gone from this page (RYL still has its own program section and the new ryl-teams.html). '
          'NEW [TO-04b] black band "Try Out at Any Open Gym" (10U-18U, Wed/Fri 5:30-7) replaces the 15U-18U "ongoing tryouts" h3 + callout + '
          'recruiting checks (the position needs stay in the [RB] banner). The #ongoing-1518 anchor is gone; girls-club.html now points at '
          '#open-gym-tryouts. ANN combined the same way; [TO-02]/[TO-07] age mentions follow. Nav gains RYL Teams. Prev BUILD v1.69 '), 1, 'tryouts stamp')
save(T, s)
print(T, 'OK')

# ================= girls-club.html: the ongoing-1518 cross-reference =================
G = 'girls-club.html'
s = load(G)
s = swap(s, '<tr><td>Ongoing</td><td>Girls 15U&ndash;18U tryouts at open gym, 17s &amp; 18s: middles &amp; pin hitters &middot; Regional 15s &amp; 16s: hitters &amp; middles (<a class="ulink" href="tryouts.html#ongoing-1518">details</a>)</td></tr>',
             '<tr><td>Ongoing</td><td>Try out at any Wed / Fri open gym, girls 10U&ndash;18U (<a class="ulink" href="tryouts.html#open-gym-tryouts">details</a>)</td></tr>', 1, 'girls-club row')
s = swap(s, ANN_OLD_HEAD, ANN_NEW_HEAD, 1, 'gc ann head')
s = swap(s, ANN_OLD_NOTE, ANN_NEW_NOTE, 1, 'gc ann note')
s = swap(s, NAV_OLD, NAV_NEW, 1, 'gc nav')
i = s.index('  <!-- BUILD ')
s = s[:i] + NOTE.replace(' -->\n', '; the 15U-18U ongoing-tryouts row now reads "try out at any open gym, 10U-18U" and points at tryouts.html#open-gym-tryouts. -->\n') + s[i:]
save(G, s)
print(G, 'OK')

# ================= programs.html: RYL section facts + link to the new page =================
P = 'programs.html'
s = load(P)
s = swap(s, 'club coaches, three practices per week (5:00&ndash;7:00 PM), all at Boomtown Fieldhouse.',
             'club coaches and weekly team practices, all at Boomtown Fieldhouse (days for each team are on the <a class="ulink" href="ryl-teams.html">RYL Teams</a> page).', 1, 'ryl practices fact')
s = swap(s, 'our Girls 10U&ndash;14U Club &amp; RYL tryouts run Sun Sept 13 &amp; Sun Sept 20',
             'our girls&rsquo; club tryouts (10U&ndash;18U) run Sun Sept 13 &amp; Sun Sept 20', 1, 'ryl tryout fact')
s = swap(s, '<div class="btn-row"><a href="tryouts.html#tryouts" class="btn btn-gold">See Tryout Dates &amp; Register</a><a href="https://www.rmrvolleyball.org/page/show/9160754-rocky-mountain-youth-league" target="_blank" rel="noopener" class="btn btn-outline-teal">RYL on the RMR Site</a></div>',
             '<div class="btn-row"><a href="ryl-teams.html" class="btn btn-teal">RYL Teams &amp; Rosters</a><a href="tryouts.html#tryouts" class="btn btn-gold">See Tryout Dates &amp; Register</a><a href="https://www.rmrvolleyball.org/page/show/9160754-rocky-mountain-youth-league" target="_blank" rel="noopener" class="btn btn-outline-teal">RYL on the RMR Site</a></div>', 1, 'ryl buttons')
s = swap(s, ANN_OLD_HEAD, ANN_NEW_HEAD, 1, 'pg ann head')
s = swap(s, ANN_OLD_NOTE, ANN_NEW_NOTE, 1, 'pg ann note')
s = swap(s, NAV_OLD, NAV_NEW, 1, 'pg nav')
i = s.index('  <!-- BUILD ')
s = s[:i] + NOTE.replace(' -->\n', '; [PG-02r] RYL section: stale "three practices per week (5:00-7:00)" replaced with a pointer to the new ryl-teams.html (per-team days), tryout line follows the combined 10U-18U message, RYL Teams & Rosters button added. -->\n') + s[i:]
save(P, s)
print(P, 'OK')

# ================= index.html: ANN + popup + nav =================
I = 'index.html'
s = load(I)
s = swap(s, ANN_OLD_HEAD, ANN_NEW_HEAD, 1, 'ix ann head')
s = swap(s, ANN_OLD_NOTE, ANN_NEW_NOTE, 1, 'ix ann note')
s = swap(s, '<h2 id="popup-title">Girls Club &amp; RYL Tryouts<br>10U&ndash;14U &middot; September</h2>',
             '<h2 id="popup-title">Girls Club Tryouts<br>10U&ndash;18U &middot; September</h2>', 1, 'popup title')
s = swap(s, '<tr class="wk"><td colspan="2">Official Tryouts, Girls 10U&ndash;14U (Club &amp; RYL)</td></tr>',
             '<tr class="wk"><td colspan="2">Official Tryouts, Girls 10U&ndash;18U</td></tr>', 1, 'popup wk row')
s = swap(s, '<li>Tryouts for Club teams and the RYL fall league, concurrently, 10U&ndash;14U, all positions.</li>',
             '<li>Official club tryouts for Girls 10U&ndash;18U, all positions.</li>', 1, 'popup li1')
s = swap(s, '<li>Girls 10U&ndash;14U: official tryouts <strong>Sept 13 &amp; 20</strong>',
             '<li>Girls 10U&ndash;18U: official tryouts <strong>Sept 13 &amp; 20</strong>', 1, 'popup li2')
s = swap(s, '<li>Girls 15U&ndash;18U: ongoing tryouts at open gym, 17s &amp; 18s need middles &amp; pin hitters; Regional 15s &amp; 16s have spots for hitters &amp; middles. Private evaluations: <a class="inline" href="mailto:admin@coloradoboom.com">admin@coloradoboom.com</a>.</li>',
             '<li>Can&rsquo;t make the dates? Try out at any Wed / Fri open gym. Private evaluations: <a class="inline" href="mailto:admin@coloradoboom.com">admin@coloradoboom.com</a>.</li>', 1, 'popup li4')
s = swap(s, NAV_OLD, NAV_NEW, 1, 'ix nav')
i = s.index('  <!-- BUILD ')
s = s[:i] + NOTE.replace(' -->\n', '; [HM-POP] tryout popup combined the same way (title, table caption row, bullets). -->\n') + s[i:]
save(I, s)
print(I, 'OK')

# ================= remaining pages: ANN + nav + note =================
# legal.html carries the ANN banner but not the Club Info dropdown
for p in ['boys-club.html', 'club.html', 'parent-resources.html', 'schedule.html',
          'volleyball-positions.html', 'volleyball-rules.html']:
    s = load(p)
    s = swap(s, ANN_OLD_HEAD, ANN_NEW_HEAD, 1, f'{p} ann head')
    s = swap(s, ANN_OLD_NOTE, ANN_NEW_NOTE, 1, f'{p} ann note')
    s = swap(s, NAV_OLD, NAV_NEW, 1, f'{p} nav')
    i = s.index('  <!-- BUILD ')
    s = s[:i] + NOTE + s[i:]
    save(p, s)
    print(p, 'OK')
s = load('legal.html')
s = swap(s, ANN_OLD_HEAD, ANN_NEW_HEAD, 1, 'legal ann head')
s = swap(s, ANN_OLD_NOTE, ANN_NEW_NOTE, 1, 'legal ann note')
i = s.index('  <!-- BUILD ')
s = s[:i] + '  <!-- BUILD v1.82 · 2026-08-31 · ANN banner combined to "Girls Club Tryouts · 10U-18U". -->\n' + s[i:]
save('legal.html', s)
print('legal.html OK')

# ================= sitemap =================
s = load('sitemap.xml')
s = swap(s, '  <url><loc>https://coloradoboom.com/teams.html</loc></url>',
             '  <url><loc>https://coloradoboom.com/teams.html</loc></url>\n  <url><loc>https://coloradoboom.com/ryl-teams.html</loc></url>', 1, 'sitemap')
save('sitemap.xml', s)
print('sitemap OK')
print()
print('PART C APPLIED')
