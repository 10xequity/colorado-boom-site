# v1.94 — uniform fitting: "postponed, date TBA" -> families email tt@coloradoboom.com to schedule.
# Banner note is plain text (.announcement a renders as a black button). Popup key bumped
# (v1.88 precedent: fitting info changed, returning visitors should see it).
# Every anchor must match exactly the expected number of times or nothing is written.
import os, re
os.chdir(os.path.join(os.path.dirname(__file__), '..'))

def load(p): return open(p, encoding='utf-8').read()
def save(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
class Miss(Exception): pass
def swap(s, old, new, n, where):
    c = s.count(old)
    if c != n: raise Miss(f'{where}: expected {n} of {old[:70]!r}, found {c}')
    return s.replace(old, new)

MAIL = '<a class="ulink" href="mailto:tt@coloradoboom.com">tt@coloradoboom.com</a>'
SHARED = ['boys-club', 'club', 'coaching-staff', 'girls-club', 'index', 'join-our-staff',
          'parent-resources', 'programs', 'ryl-teams', 'schedule', 'teams', 'tryouts',
          'volleyball-positions', 'volleyball-rules']
ANN = ('&middot; Uniform fitting postponed &mdash; date TBA &middot;',
       '&middot; Uniform fitting: email tt@coloradoboom.com to schedule &middot;')
PAGE = {
  'index': [
    ('<tr><td>Postponed</td><td>Date to be announced</td></tr>',
     '<tr><td>By appointment</td><td><a class="inline" href="mailto:tt@coloradoboom.com">Email to schedule</a></td></tr>'),
    ('<li><strong>Uniform fitting:</strong> Postponed &mdash; date to be announced.</li>',
     '<li><strong>Uniform fitting:</strong> email <a class="inline" href="mailto:tt@coloradoboom.com">tt@coloradoboom.com</a> to schedule your fitting.</li>'),
    ("var KEY='cobo-popup-v193';", "var KEY='cobo-popup-v194';"),
  ],
  'tryouts': [
    ('<p class="sched-note"><strong>Uniform fitting:</strong> Postponed &mdash; date to be announced, for players joining a 2026&ndash;27 team.</p>',
     f'<p class="sched-note"><strong>Uniform fitting:</strong> players joining a 2026&ndash;27 team, email {MAIL} to schedule your fitting.</p>'),
  ],
  'schedule': [
    ('<tr><td>Uniform Fitting</td><td>Postponed &middot; date to be announced</td></tr>',
     f'<tr><td>Uniform Fitting</td><td>By appointment &middot; email {MAIL}</td></tr>'),
  ],
  'girls-club': [
    ('<tr><td>TBA</td><td>Uniform fitting postponed &mdash; date to be announced, for players joining a 2026&ndash;27 team</td></tr>',
     f'<tr><td>By appt.</td><td>Uniform fitting for players joining a 2026&ndash;27 team, email {MAIL} to schedule</td></tr>'),
  ],
}
STAMP = '  <!-- BUILD v1.94 · 2026-09-26 · Uniform fitting: "postponed, date TBA" -> "email tt@coloradoboom.com to schedule".{extra} -->\n'
EXTRA = {'index': ' [HM-POP] table row + bullet; popup key v193 -> v194.',
         'tryouts': ' Tryouts sched-note.', 'schedule': ' 2026 Tryouts table row.',
         'girls-club': ' Season timeline row.'}

out = {}
for name in SHARED:
    p = f'{name}.html'; s = load(p)
    if 'BUILD v1.94' in s: raise Miss(f'{p}: already v1.94 — refusing second run')
    s = swap(s, *ANN, 1, p)
    for old, new in PAGE.get(name, []): s = swap(s, old, new, 1, p)
    s = swap(s, '<head>\n', '<head>\n' + STAMP.format(extra=(' ' + EXTRA[name]) if name in EXTRA else ''), 1, p)
    # post-checks
    assert 'postponed' not in re.sub(r'<!--.*?-->', '', s, flags=re.S).lower(), f'{p}: "postponed" left'
    assert 'tt@coloradoboom.com' in s
    out[p] = s
for p, s in out.items(): save(p, s)
print('ok', len(out), 'files')
