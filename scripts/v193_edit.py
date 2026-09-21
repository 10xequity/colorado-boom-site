# v1.93 — tryouts move from Sun Sept 20 (1:00–2:00 PM) to Sun Oct 11 (2:00–3:00 PM).
# Same self-retiring gates as v1.91: data-show-until moves to 2026-10-11, the open-gym
# fallback twins (data-show-from) move to 2026-10-12. Popup key bumped (new date).
# Every anchor must match exactly the expected number of times or the file is left untouched.
import datetime, os, sys
os.chdir(os.path.join(os.path.dirname(__file__), '..'))

assert datetime.date(2026, 10, 11).weekday() == 6, 'Oct 11 2026 is not a Sunday'
assert datetime.date(2026, 10, 11) < datetime.date(2026, 11, 1), 'still MDT (-06:00) on Oct 11'

def load(p): return open(p, encoding='utf-8').read()
def save(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)

class Miss(Exception): pass

def swap(s, old, new, n, where):
    c = s.count(old)
    if c != n: raise Miss(f'{where}: expected {n} of {old[:70]!r}, found {c}')
    return s.replace(old, new)

SHARED = ['boys-club', 'club', 'coaching-staff', 'girls-club', 'index', 'join-our-staff',
          'parent-resources', 'programs', 'ryl-teams', 'schedule', 'teams', 'tryouts',
          'volleyball-positions', 'volleyball-rules']

ANN = [
    ('<span data-show-until="2026-09-20"> &nbsp;&bull;&nbsp; Tryouts Sept 20</span>',
     '<span data-show-until="2026-10-11"> &nbsp;&bull;&nbsp; Tryouts Oct 11</span>'),
    ('<span data-show-until="2026-09-20"> &middot; Sun Sept 20, 1:00&ndash;2:00 PM</span>',
     '<span data-show-until="2026-10-11"> &middot; Sun Oct 11, 2:00&ndash;3:00 PM</span>'),
]

PAGE = {
  'index': [
    ('<span data-show-until="2026-09-20"> run Sept 20, 2026</span><span data-show-from="2026-09-21" hidden style="display:none"> continue at any Wed / Fri open gym</span>',
     '<span data-show-until="2026-10-11"> run Oct 11, 2026</span><span data-show-from="2026-10-12" hidden style="display:none"> continue at any Wed / Fri open gym</span>'),
    ('<tr data-show-until="2026-09-20"><td>Sunday, September 20</td><td>1:00&ndash;2:00 PM</td></tr>',
     '<tr data-show-until="2026-10-11"><td>Sunday, October 11</td><td>2:00&ndash;3:00 PM</td></tr>'),
    ('<tr data-show-from="2026-09-21" hidden style="display:none"><td>Any Wed / Fri open gym</td>',
     '<tr data-show-from="2026-10-12" hidden style="display:none"><td>Any Wed / Fri open gym</td>'),
    ('<span data-show-until="2026-09-20">official tryouts <strong>Sept 20</strong> (date above), register, or </span>',
     '<span data-show-until="2026-10-11">official tryouts <strong>Oct 11</strong> (date above), register, or </span>'),
    ('10U&ndash;18U &middot; September</h2>', '10U&ndash;18U &middot; October</h2>'),
    ("var KEY='cobo-popup-v187';", "var KEY='cobo-popup-v193';"),
  ],
  'tryouts': [
    ('"startDate":"2026-09-20T13:00:00-06:00","endDate":"2026-09-20T14:00:00-06:00"',
     '"startDate":"2026-10-11T14:00:00-06:00","endDate":"2026-10-11T15:00:00-06:00"'),
    ('<span class="big">Girls Club Tryouts: September</span>', '<span class="big">Girls Club Tryouts: October</span>'),
    ('<span data-show-until="2026-09-20"> &middot; Sun Sept 20</span>',
     '<span data-show-until="2026-10-11"> &middot; Sun Oct 11</span>'),
    ('<tr data-show-until="2026-09-20"><td>Sun, Sept 20</td><td>1:00&ndash;2:00 PM</td></tr>',
     '<tr data-show-until="2026-10-11"><td>Sun, Oct 11</td><td>2:00&ndash;3:00 PM</td></tr>'),
    ('<tr data-show-from="2026-09-21" hidden style="display:none"><td>Any Wed / Fri open gym</td>',
     '<tr data-show-from="2026-10-12" hidden style="display:none"><td>Any Wed / Fri open gym</td>'),
    ('<span class="sub" data-show-until="2026-09-20">Girls 10U&ndash;18U: join us at tryouts: <a class="ulink" href="#tryouts">Sun Sept 20</a></span>',
     '<span class="sub" data-show-until="2026-10-11">Girls 10U&ndash;18U: join us at tryouts: <a class="ulink" href="#tryouts">Sun Oct 11</a></span>'),
  ],
  'club': [('<span data-show-until="2026-09-20">, Sept 20</span>', '<span data-show-until="2026-10-11">, Oct 11</span>')],
  'girls-club': [('<tr data-show-until="2026-09-20"><td>Sept 20</td>', '<tr data-show-until="2026-10-11"><td>Oct 11</td>')],
  'programs': [
    ('<span data-show-until="2026-09-20">Sun Sept 20</span><span data-show-from="2026-09-21" hidden style="display:none">at any Wed / Fri open gym</span>',
     '<span data-show-until="2026-10-11">Sun Oct 11</span><span data-show-from="2026-10-12" hidden style="display:none">at any Wed / Fri open gym</span>'),
  ],
  'schedule': [
    ('<td>Sun Sept 20 &middot; 1:00&ndash;2:00 PM</td></tr>', '<td>Sun Oct 11 &middot; 2:00&ndash;3:00 PM</td></tr>'),
    ('<tr data-show-until="2026-09-20"><td>Girls 10U&ndash;14U, Official Club', '<tr data-show-until="2026-10-11"><td>Girls 10U&ndash;14U, Official Club'),
  ],
  'legal': [('&middot; Tryouts Sept 20</div>', '&middot; Tryouts Oct 11</div>')],
}

STAMP = {
  'index':   '[ANN]+[HM-POP]+[HM-03]+[HM-06 bullet] tryouts moved: Sun Sept 20 1-2 PM -> Sun Oct 11 2:00-3:00 PM; gates to 2026-10-11, open-gym twins to 2026-10-12; popup title September -> October; popup key bumped v187 -> v193 (new date, returning visitors should see it).',
  'tryouts': '[ANN]+[TO-04]+[TO-07] tryouts moved: Sun Sept 20 1-2 PM -> Sun Oct 11 2:00-3:00 PM; callout September -> October; SportsEvent JSON-LD 2026-10-11 14:00-15:00 MDT; gates to 2026-10-11, open-gym fallback row to 2026-10-12.',
  'legal':   '[ANN] Tryouts Sept 20 -> Oct 11 by hand (no date engine on this page); must be hand-edited again after Oct 11.',
}
DEFAULT_STAMP = '[ANN] tryouts moved: Sun Sept 20 1-2 PM -> Sun Oct 11 2:00-3:00 PM; date gate now 2026-10-11 so it retires itself on Oct 12.'
EXTRA = {'club': ' [CL-03] practice-note date follows.', 'girls-club': ' Season timeline row follows.',
         'programs': ' RYL paragraph date + open-gym twin (2026-10-12) follow.', 'schedule': ' [SC] 2026 Tryouts row follows.'}

pages = SHARED + ['legal']
touched, failed = [], []
for name in pages:
    p = f'{name}.html'
    s = load(p)
    try:
        for old, new in (ANN if name in SHARED else []) + PAGE.get(name, []):
            s = swap(s, old, new, 1, p)
        stamp = STAMP.get(name, DEFAULT_STAMP + EXTRA.get(name, ''))
        s = swap(s, '<head>\n  <!-- BUILD v1.91 ',
                 f'<head>\n  <!-- BUILD v1.93 · 2026-09-21 · {stamp} -->\n  <!-- BUILD v1.91 ', 1, p)
        # post-conditions: no September gate or September tryout time survives
        # (attribute form on purpose: the new BUILD stamp itself carries today's date 2026-09-21)
        for needle in ('data-show-until="2026-09-20"', 'data-show-from="2026-09-21"', '2026-09-20T',
                       '1:00&ndash;2:00 PM', 'Tryouts: September', '&middot; September</h2>', 'cobo-popup-v187'):
            if needle in s: raise Miss(f'{p}: {needle!r} still present after edit')
    except Miss as e:
        failed.append(str(e)); continue
    save(p, s); touched.append(p)

print('touched:', len(touched)); [print('  ', t) for t in touched]
if failed:
    print('FAILED (file left untouched):'); [print('  ', f) for f in failed]; sys.exit(1)
