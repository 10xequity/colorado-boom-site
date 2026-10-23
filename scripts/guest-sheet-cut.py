"""Cut a ChatGPT character sheet (grey background; turnaround row, portrait top-right, then IDLE / WALK / WALK BACK / RUN on the
left and ATTACK / JUMP / CHARGE-SPECIAL / HURT on the right) into the game's 15-cell sheet (ready, run, dig, set, spike,
block, faint x3, dance x3, charge x3) and a card portrait.
  python scripts/guest-sheet-cut.py <image dir> <repo> <preview dir>"""
import sys, os, numpy as np
from PIL import Image
I, OUT, PV = sys.argv[1], sys.argv[2], sys.argv[3]
SPR = OUT + '/assets/img/coaches/sprites32/'
# (image, id, suffix, take portrait)
JOBS = [('25', 'guest-akuma', '32', 1), ('26', 'guest-scorpion', '32', 1), ('27', 'guest-tanjiro', '32', 1), ('28', 'guest-goku', '32', 1),
        ('29', 'guest-yuji', '32', 1), ('30', 'guest-goku-black', '32', 1), ('31', 'guest-saitama', '16', 0), ('33', 'guest-saitama', '32', 1),
        ('34', 'guest-gojo', '16', 0), ('32', 'guest-gojo', '32', 1)]
CW, CH = 200, 240

def runs(prof, minlen):
    on = prof > 0; out = []; i = 0
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and on[j]: j += 1
            if j - i >= minlen: out.append([i, j - 1])
            i = j
        else: i += 1
    return out

def merge_to(rs, n):
    rs = [list(r) for r in rs]
    while len(rs) > n:
        gaps = [rs[k + 1][0] - rs[k][1] for k in range(len(rs) - 1)]; k = int(np.argmin(gaps)); rs[k] = [rs[k][0], rs[k + 1][1]]; del rs[k + 1]
    return rs

def split_to(rs, prof, n):
    rs = [list(r) for r in rs]
    while len(rs) < n:
        k = int(np.argmax([r[1] - r[0] for r in rs])); a, b = rs[k]; m = (b - a) // 5
        cut = a + m + int(np.argmin(prof[a + m:b - m + 1])); rs[k:k + 1] = [[a, cut - 1], [cut + 1, b]]
        rs.sort()
    return rs
def cells_in(seg, soft, rgba, x0, x1, y0, y1, expect):
    H = seg.shape[0]; sub = seg[y0:y1 + 1, x0:x1 + 1]; prof = sub.sum(axis=0); cols = runs(prof, 2)
    keep = []
    for c0, c1 in cols:
        ys = np.where(sub[:, c0:c1 + 1].any(axis=1))[0]; h = ys.max() - ys.min() if len(ys) else 0
        if h < 0.045 * H: continue                         # stray marks
        if not keep and h < 0.1 * H and c1 - c0 < 0.07 * seg.shape[1]: continue   # the row label (multi-line text) sits first and short
        keep.append([c0, c1])
    keep = split_to(merge_to(keep, expect), prof, expect)
    out = []
    for c0, c1 in keep:
        a0, a1 = max(0, c0 - 10), min(sub.shape[1] - 1, c1 + 10); s = soft[y0:y1 + 1, x0 + a0:x0 + a1 + 1]; ys, xs = np.where(s)
        out.append(rgba.crop((x0 + a0 + xs.min(), y0 + ys.min(), x0 + a0 + xs.max() + 1, y0 + ys.max() + 1)))
    return out

def fit(c):
    s = min((CW - 8) / c.width, (CH - 8) / c.height, 1.0)
    return c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), Image.LANCZOS) if s < 1 else c

for img, gid, sfx, want_portrait in JOBS:
    im = Image.open(f'{I}/{img}.png').convert('RGB'); a = np.array(im).astype(int); H, W = a.shape[:2]
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]); bg = np.median(border, axis=0)
    d = np.abs(a - bg).sum(axis=2); mask = d > 110; soft = d > 36   # strict mask splits frames; the soft one keeps the glow for alpha
    alpha = np.clip((d - 18) * 255 / 30, 0, 255).astype(np.uint8)
    rgba = Image.fromarray(np.dstack([a.astype(np.uint8), alpha]))
    rows = {}
    for side, (x0, x1) in {'L': (int(.075 * W), int(.47 * W)), 'R': (int(.5 * W), W - 1)}.items():
        prof = mask[:, x0:x1 + 1].sum(axis=1); rr = runs(prof, int(.05 * H))
        rr = [r for r in rr if r[0] > .42 * H]; rr = split_to(merge_to(rr, 4), prof, 4)
        assert len(rr) == 4, (img, side, rr)
        rows[side] = [(x0, x1, r[0], r[1]) for r in rr]
    idle = cells_in(mask, soft, rgba, *rows['L'][0], 6); run = cells_in(mask, soft, rgba, *rows['L'][3], 6)
    attack = cells_in(mask, soft, rgba, *rows['R'][0], 5); jump = cells_in(mask, soft, rgba, *rows['R'][1], 5)
    charge = cells_in(mask, soft, rgba, *rows['R'][2], 5); hurt = cells_in(mask, soft, rgba, *rows['R'][3], 5)
    saitama = gid == 'guest-saitama'
    cells = [idle[0], run[3], jump[0], jump[2], charge[3] if saitama else attack[2], charge[1] if saitama else attack[0],
             hurt[1], hurt[3], hurt[4], jump[1], jump[2], jump[3], charge[0], charge[1], charge[2]]
    sheet = Image.new('RGBA', (CW * 15, CH), (0, 0, 0, 0))
    for i, c in enumerate(cells):
        c = fit(c); sheet.paste(c, (i * CW + (CW - c.width) // 2, CH - 4 - c.height), c)
    fn = f'{SPR}{gid}-{sfx}.webp'; sheet.save(fn, quality=88, method=6); print('wrote', fn, os.path.getsize(fn))
    if want_portrait:
        x0, x1 = int(.6 * W), W - 1; sub = soft[:int(.4 * H), x0:x1 + 1]
        rr = [r for r in runs(sub.sum(axis=1), 3) if r[1] - r[0] > .1 * H]; r = rr[0]
        s = sub[r[0]:r[1] + 1]; ys, xs = np.where(s)
        por = rgba.crop((x0 + xs.min(), r[0] + ys.min(), x0 + xs.max() + 1, r[0] + ys.max() + 1))
        por.save(f'{SPR}{gid}-portrait.webp', quality=88, method=6); print('  portrait', por.size)
# preview
ids = sorted(set(j[1] for j in JOBS)); pv = Image.new('RGB', (750, 60 * len(ids) + 10 + 160), (30, 120, 130)); y = 5
for gid in ids:
    sh = Image.open(f'{SPR}{gid}-32.webp').convert('RGBA').resize((750, 60)); pv.paste(sh, (0, y), sh); y += 60
x = 5
for gid in ids:
    p = Image.open(f'{SPR}{gid}-portrait.webp').convert('RGBA'); p.thumbnail((70, 150)); pv.paste(p, (x, y + 5), p); x += 80
pv.save(PV + '/guests_preview.png')
