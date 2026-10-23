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
        ('34', 'guest-gojo', '16', 0), ('32', 'guest-gojo', '32', 1), ('35', 'guest-hinata', '32', 1), ('36', 'guest-kageyama', '32', 1), ('37', 'guest-tsukishima', '32', 1)]
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
    if not rs: raise SystemExit('no cells found: ' + str(CTX) + ' ' + str(ROW))
    while len(rs) < n:
        k = int(np.argmax([r[1] - r[0] for r in rs])); a, b = rs[k]; m = (b - a) // 5
        cut = a + m + int(np.argmin(prof[a + m:b - m + 1])); rs[k:k + 1] = [[a, cut - 1], [cut + 1, b]]
        rs.sort()
    return rs
def col_runs(seg, x0, x1, y0, y1):
    H = seg.shape[0]; sub = seg[y0:y1 + 1, x0:x1 + 1]; prof = sub.sum(axis=0); cols = runs(prof, 2); keep = []
    for c0, c1 in cols:
        ys = np.where(sub[:, c0:c1 + 1].any(axis=1))[0]; h = ys.max() - ys.min() if len(ys) else 0
        if h < 0.045 * H or c1 - c0 < 5: continue           # stray marks and vertical hairlines
        if not keep and h < 0.1 * H:   # the row label sits first and short; it is grey text, a figure has colour
            px = A[y0:y1 + 1, x0 + c0:x0 + c1 + 1][sub[:, c0:c1 + 1]]
            if len(px) and (px.max(axis=1) - px.min(axis=1)).mean() < 28 and px.mean() > bg.mean() + 40: continue   # light grey text; a dark uniform is also low-saturation
        keep.append([c0, c1])
    return keep, prof
ROW = None
def cells_in(segs, soft, rgba, x0, x1, y0, y1, expect):
    global ROW; ROW = (x0, x1, y0, y1, expect)
    # try the plain mask, then the eroded one (which drops panel hairlines); take whichever lands nearest the expected count
    best = None
    for seg in segs:
        keep, prof = col_runs(seg, x0, x1, y0, y1)
        if best is None or abs(len(keep) - expect) < abs(len(best[0]) - expect): best = (keep, prof, seg)
        if len(keep) == expect: break
    keep, prof, seg = best; sub = seg[y0:y1 + 1, x0:x1 + 1]
    keep = split_to(merge_to(keep, expect), prof, expect)
    out = []
    for c0, c1 in keep:
        a0, a1 = max(0, c0 - 3), min(sub.shape[1] - 1, c1 + 3)   # a wider margin pulled the neighbouring row label into the crop
        hs = sub[:, a0:a1 + 1]; colh = np.array([(np.where(col)[0].max() - np.where(col)[0].min() + 1) if col.any() else 0 for col in hs.T])
        lead = int(np.argmax(colh >= 0.03 * H)) if (colh >= 0.03 * H).any() else 0; a0 = a0 + max(0, lead - 2)
        s = soft[y0:y1 + 1, x0 + a0:x0 + a1 + 1]; ys, xs = np.where(s)
        out.append(rgba.crop((x0 + a0 + xs.min(), y0 + ys.min(), x0 + a0 + xs.max() + 1, y0 + ys.max() + 1)))
    return out

def fit(c):
    s = min((CW - 8) / c.width, (CH - 8) / c.height, 1.0)
    return c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), Image.LANCZOS) if s < 1 else c

CTX = None
ONLY = os.environ.get('ONLY', '').split(',') if os.environ.get('ONLY') else None
for img, gid, sfx, want_portrait in JOBS:
    if ONLY and img not in ONLY: continue
    CTX = img
    im = Image.open(f'{I}/{img}.png').convert('RGB'); a = np.array(im).astype(int); H, W = a.shape[:2]; A = a
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]); bg = np.median(border, axis=0)
    d = np.abs(a - bg).sum(axis=2); mask = d > 110; soft = d > 36   # strict mask splits frames; the soft one keeps the glow for alpha
    rowm = mask & np.roll(mask, 4, axis=1) & np.roll(mask, -4, axis=1)   # drops vertical hairlines (dividers, panel borders)
    colm = mask & np.roll(mask, 4, axis=0) & np.roll(mask, -4, axis=0)   # drops horizontal hairlines
    alpha = np.clip((d - 18) * 255 / 30, 0, 255).astype(np.uint8)
    rgba = Image.fromarray(np.dstack([a.astype(np.uint8), alpha]))
    rows = {}
    for side, (x0, x1) in {'L': (int(.075 * W), int(.47 * W)), 'R': (int(.5 * W), W - 1)}.items():
        best = None
        for m in (mask, rowm):
            prof = m[:, x0:x1 + 1].sum(axis=1); rr = [r for r in runs(prof, int(.05 * H)) if r[0] > .3 * H][-4:]
            if best is None or abs(len(rr) - 4) < abs(len(best[0]) - 4): best = (rr, prof)
            if len(rr) == 4: break
        rr, prof = best; rr = split_to(merge_to(rr, 4), prof, 4)
        assert len(rr) == 4, (img, side, rr)
        rows[side] = [(x0, x1, r[0], r[1]) for r in rr]
    M = (mask, colm)
    idle = cells_in(M, soft, rgba, *rows['L'][0], 6); run = cells_in(M, soft, rgba, *rows['L'][3], 6)
    attack = cells_in(M, soft, rgba, *rows['R'][0], 5); jump = cells_in(M, soft, rgba, *rows['R'][1], 5)
    charge = cells_in(M, soft, rgba, *rows['R'][2], 5); hurt = cells_in(M, soft, rgba, *rows['R'][3], 5)
    saitama = gid == 'guest-saitama'
    cells = [idle[0], run[3], jump[0], jump[2], charge[3] if saitama else attack[2], charge[1] if saitama else attack[0],
             hurt[1], hurt[3], hurt[4], jump[1], jump[2], jump[3], charge[0], charge[1], charge[2]]
    sheet = Image.new('RGBA', (CW * 15, CH), (0, 0, 0, 0))
    for i, c in enumerate(cells):
        if gid == 'guest-yuji':
            ca = np.array(c); lum = ca[..., :3].mean(axis=2); sat = ca[..., :3].max(axis=2) - ca[..., :3].min(axis=2)
            ca[(sat < 22) & (lum > 140) & (lum < 236), 3] = 0; c = Image.fromarray(ca)
        c = fit(c); sheet.paste(c, (i * CW + (CW - c.width) // 2, CH - 4 - c.height), c)
    fn = f'{SPR}{gid}-{sfx}.webp'; sheet.save(fn, quality=88, method=6); print('wrote', fn, os.path.getsize(fn))
    if want_portrait:
        x0, x1 = int(.5 * W), W - 1; sub = soft[:int(.4 * H), x0:x1 + 1]
        # the big head is the widest column run in the top-right block; its own y-run (not the faces or palette) is then taken
        band = colm[:int(.4 * H), x0:x1 + 1]; cr = runs(band.sum(axis=0), 3)
        def tall(c):
            ys = np.where(band[:, c[0]:c[1] + 1].any(axis=1))[0]; return (ys.max() - ys.min()) if len(ys) else 0
        c0, c1 = max(cr, key=tall)   # the big head is the tallest thing in the block (the expression heads touch and form a wider but shorter run)
        rr = [r for r in runs(rowm[:int(.4 * H), x0 + c0:x0 + c1 + 1].sum(axis=1), 3) if r[1] - r[0] > .1 * H]; r = rr[0]
        s = sub[r[0]:r[1] + 1, c0:c1 + 1]; ys, xs = np.where(s); xs = xs + c0
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
