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
        ('34', 'guest-gojo', '16', 0), ('32', 'guest-gojo', '32', 1), ('35', 'guest-hinata', '16', 0), ('36', 'guest-kageyama', '16', 0), ('37', 'guest-tsukishima', '16', 0), ('42', 'guest-hinata', '32', 1), ('43', 'guest-kageyama', '32', 1), ('41', 'guest-tsukishima', '32', 1)]   # 41-43: the 2752 px high-detail sheets
# The three 1024-wide Karasuno sheets (38-40) are too small and tightly packed to cut cleanly: they supply the portrait and faces only;
# after a run, copy guest-<name>-16.webp (the Canva sheet) over guest-<name>-32.webp for hinata, kageyama and tsukishima.
CW, CH = 300, 260   # guest cells are wider than the coach cells (200x240) so slashes, beams and auras are not cut off

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
def col_runs(seg, x0, x1, y0, y1, nolabel=False):
    H = seg.shape[0]; sub = seg[y0:y1 + 1, x0:x1 + 1]; prof = sub.sum(axis=0); cols = runs(prof, 2); keep = []
    for c0, c1 in cols:
        ys = np.where(sub[:, c0:c1 + 1].any(axis=1))[0]; h = ys.max() - ys.min() if len(ys) else 0
        if h < 0.045 * H or c1 - c0 < 5: continue           # stray marks and vertical hairlines
        if not nolabel and not keep and c1 - c0 < LW * seg.shape[1]:   # the row label sits first and narrow (text columns are ~2-3% of the sheet; a pixel figure is wider); grey text at any brightness
            px = A[y0:y1 + 1, x0 + c0:x0 + c1 + 1][sub[:, c0:c1 + 1]]
            if len(px) and (px.max(axis=1) - px.min(axis=1)).mean() < 28: continue   # light grey text; a dark uniform is also low-saturation
        keep.append([c0, c1])
    return keep, prof
ROW = None; LW = .032
def cells_in(segs, soft, rgba, x0, x1, y0, y1, expect):
    global ROW; ROW = (x0, x1, y0, y1, expect)
    # try the plain mask, then the eroded one (which drops panel hairlines); take whichever lands nearest the expected count
    best = None
    for seg in segs:
        keep, prof = col_runs(seg, x0, x1, y0, y1)
        if best is None or abs(len(keep) - expect) < abs(len(best[0]) - expect): best = (keep, prof, seg)
        if len(keep) == expect: break
    keep, prof, seg = best
    if not keep: keep, prof = col_runs(seg, x0, x1, y0, y1, nolabel=True)   # tiny dark figures can look like label text
    sub = seg[y0:y1 + 1, x0:x1 + 1]
    keep = split_to(merge_to(keep, expect), prof, expect)
    out = []; ye0, ye1 = max(0, y0 - 18), min(H - 1, y1 + 18)
    for i, (c0, c1) in enumerate(keep):
        # the frame's rectangle: out to the midpoint of the gap to each neighbour (a short margin at the row ends)
        a0 = (keep[i - 1][1] + c0) // 2 + 1 if i else max(0, c0 - 70); a1 = (c1 + keep[i + 1][0]) // 2 - 1 if i < len(keep) - 1 else min(sub.shape[1] - 1, c1 + 70)   # wide margins at the row ends: a dark half of a figure can fall under the strict mask
        rect = soft[ye0:ye1 + 1, x0 + a0:x0 + a1 + 1]; lab = label(rect); keepk = []
        rowy0, rowy1 = y0 - ye0, y1 - ye0
        for k in np.unique(lab[lab > 0]):
            ys, xs = np.where(lab == k); n = len(xs); cy = ys.mean()
            inrow = ((ys >= rowy0 - 3) & (ys <= rowy1 + 3)).mean()
            if not (rowy0 - 3 <= cy <= rowy1 + 3) or inrow < .6: continue        # the feet of the row above / heads of the row below (most of the piece must lie in this row)
            px = A[ye0 + ys, x0 + a0 + xs]; grey = (px.max(axis=1) - px.min(axis=1)).mean() < 28
            touches_body = xs.min() <= (c1 - a0) + 6 and xs.max() >= (c0 - a0) - 6
            if grey and (not touches_body or (xs.max() - xs.min() < LW * W and ys.max() - ys.min() < 0.12 * H)): continue   # label text, even when it sits against the body
            at_edge = xs.min() == 0 or xs.max() == rect.shape[1] - 1
            if touches_body or (n > 30 and not at_edge): keepk.append(k)   # body + attached effects, and detached effects fully inside; a neighbour's tail entering from the edge is dropped
        m = np.isin(lab, keepk)
        if keepk:   # a figure's own pieces never sit below its feet: drop detached bits whose centre is under the main body's bottom edge
            sizes = {k: int((lab == k).sum()) for k in keepk}; main = max(sizes, key=sizes.get); my, _ = np.where(lab == main); by1, bh = my.max(), my.max() - my.min()
            for k in keepk:
                if k == main: continue
                ky, kx = np.where(lab == k)
                if ky.mean() > by1 - 0.12 * bh and ky.min() > by1 - 0.3 * bh: m[lab == k] = False
        if not m.any(): m = rect
        ys, xs = np.where(m)
        crop = rgba.crop((x0 + a0 + xs.min(), ye0 + ys.min(), x0 + a0 + xs.max() + 1, ye0 + ys.max() + 1)); ca = np.array(crop)
        ca[..., 3] = ca[..., 3] * m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        out.append(Image.fromarray(ca))
    return out
def label(m):
    """4-connected component labels of a boolean mask (small bands only)"""
    H, W = m.shape; lab = np.zeros((H, W), np.int32); nxt = 0
    for y0, x0 in zip(*np.where(m)):
        if lab[y0, x0]: continue
        nxt += 1; st = [(y0, x0)]; lab[y0, x0] = nxt
        while st:
            y, x = st.pop()
            if y > 0 and m[y - 1, x] and not lab[y - 1, x]: lab[y - 1, x] = nxt; st.append((y - 1, x))
            if y < H - 1 and m[y + 1, x] and not lab[y + 1, x]: lab[y + 1, x] = nxt; st.append((y + 1, x))
            if x > 0 and m[y, x - 1] and not lab[y, x - 1]: lab[y, x - 1] = nxt; st.append((y, x - 1))
            if x < W - 1 and m[y, x + 1] and not lab[y, x + 1]: lab[y, x + 1] = nxt; st.append((y, x + 1))
    return lab

def fit(c):
    s = min((CW - 8) / c.width, (CH - 8) / c.height, 1.0)
    return c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), Image.LANCZOS) if s < 1 else c

CTX = None
ONLY = os.environ.get('ONLY', '').split(',') if os.environ.get('ONLY') else None
for img, gid, sfx, want_portrait in JOBS:
    if ONLY and img not in ONLY: continue
    CTX = img
    im = Image.open(f'{I}/{img}.png' if os.path.exists(f'{I}/{img}.png') else f'{I}/{img}.jpg').convert('RGB'); a = np.array(im).astype(int); H, W = a.shape[:2]; A = a
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]); bg = np.median(border, axis=0)
    big = W >= 1400; thr, er = (110, 4) if big else (70, 2)   # the 1024-wide sheets carry smaller, darker figures
    globals()['LW'] = (.065 if W > 2400 else .032) if big else .07   # a label column's width as a share of the sheet
    d = np.abs(a - bg).sum(axis=2); mask = d > thr; soft = d > 36   # strict mask splits frames; the soft one keeps the glow for alpha
    rowm = mask & np.roll(mask, er, axis=1) & np.roll(mask, -er, axis=1)   # drops vertical hairlines (dividers, panel borders)
    colm = mask & np.roll(mask, er, axis=0) & np.roll(mask, -er, axis=0)   # drops horizontal hairlines
    alpha = np.clip((d - 18) * 255 / 30, 0, 255).astype(np.uint8)
    rgba = Image.fromarray(np.dstack([a.astype(np.uint8), alpha]))
    rows = {}
    for side, (x0, x1) in {'L': (int(.075 * W), int(.47 * W)), 'R': (int(.5 * W), W - 1)}.items():   # rows are found from 7.5% in (past the labels); frames are then cut from 2% in, since a figure can start before 7.5%
        best = None
        for m in (mask, rowm):
            prof = m[:, x0:x1 + 1].sum(axis=1); rr = [r for r in runs(prof, int(.05 * H)) if r[0] > .3 * H][-4:]
            if best is None or abs(len(rr) - 4) < abs(len(best[0]) - 4): best = (rr, prof)
            if len(rr) == 4: break
        rr, prof = best; rr = split_to(merge_to(rr, 4), prof, 4)
        assert len(rr) == 4, (img, side, rr)
        rows[side] = [((int(.02 * W) if big else int(.072 * W)) if side == 'L' else x0, x1, r[0], r[1]) for r in rr]
    M = (mask, colm)
    idle = cells_in(M, soft, rgba, *rows['L'][0], 6); walk = cells_in(M, soft, rgba, *rows['L'][1], 6); run = cells_in(M, soft, rgba, *rows['L'][3], 6)
    attack = cells_in(M, soft, rgba, *rows['R'][0], 5); jump = cells_in(M, soft, rgba, *rows['R'][1], 5)
    charge = cells_in(M, soft, rgba, *rows['R'][2], 5); hurt = cells_in(M, soft, rgba, *rows['R'][3], 5)
    def solid(c): return int((np.array(c)[..., 3] > 40).sum())
    for k in range(1, len(hurt)):   # a hurt frame that came out nearly empty (figure lost to the cutter) borrows its neighbour
        if solid(hurt[k]) < .3 * max(solid(h) for h in hurt): hurt[k] = hurt[k - 1]
    saitama = gid == 'guest-saitama'
    # 26 cells: 0 ready, 1 run, 2 crouch, 3 air, 4 strike, 5 stance, 6-8 hurt, 9-11 dance, 12-14 charge, 15-16 walk, 17-19 punches, 20-24 the special row, 25 second run frame
    cells = [idle[0], run[3], jump[0], jump[2], charge[3] if saitama else attack[2], charge[1] if saitama else attack[0],
             hurt[1], hurt[3], hurt[4], jump[1], jump[2], jump[3], charge[0], charge[1], charge[2],
             walk[1], walk[4], attack[0], attack[2], attack[4], charge[0], charge[1], charge[2], charge[3], charge[4], run[0]]
    sheet = Image.new('RGBA', (CW * 26, CH), (0, 0, 0, 0))
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
        blk = soft[r[0]:r[1] + 1, x0 + c0:x0 + c1 + 1]; bl = label(blk); big = max(np.unique(bl[bl > 0]), key=lambda k: (bl == k).sum())
        ys, xs = np.where(bl == big); xs = xs + c0
        ph = ys.max() - ys.min() + 1; pw = min(xs.max() - xs.min() + 1, int(ph * 1.15)); cxm = int(np.median(xs))
        px0 = max(xs.min(), cxm - pw // 2); por = rgba.crop((x0 + px0, r[0] + ys.min(), x0 + px0 + pw, r[0] + ys.max() + 1))
        por.save(f'{SPR}{gid}-portrait.webp', quality=88, method=6); print('  portrait', por.size)
        def heads(y0f, y1f, skip=None):
            fb = colm[y0f:y1f + 1, x0:x1 + 1]; out = []
            for c in runs(fb.sum(axis=0), 3):
                if skip and c[0] <= skip[1] and c[1] >= skip[0]: continue
                ys2 = np.where(fb[:, c[0]:c[1] + 1].any(axis=1))[0]
                if .02 * W < c[1] - c[0] < .12 * W and len(ys2) and .035 * H < ys2.max() - ys2.min() < .18 * H: out.append(c)
            return out[:4]
        below = [q for q in rr[1:] if .04 * H < q[1] - q[0] < .18 * H]
        cand = [(heads(q[0], q[1]), q[0], q[1]) for q in below[:1]] + [(heads(r[0], r[1], (c0, c1)), r[0], r[1])]
        fc, fy0, fy1 = max(cand, key=lambda t: len(t[0])); fy0 = fy0; q = (0, fy1 - fy0)
        if len(fc) >= 2:
            faces = Image.new('RGBA', (160 * 4, 160), (0, 0, 0, 0))
            for k, (c0, c1) in enumerate(fc):
                fs = soft[fy0 + q[0]:fy0 + q[1] + 1, x0 + c0:x0 + c1 + 1]; fys, fxs = np.where(fs)
                f = rgba.crop((x0 + c0 + fxs.min(), fy0 + q[0] + fys.min(), x0 + c0 + fxs.max() + 1, fy0 + q[0] + fys.max() + 1))
                sc = min(152 / f.width, 152 / f.height); f = f.resize((max(1, round(f.width * sc)), max(1, round(f.height * sc))), Image.LANCZOS)
                faces.paste(f, (k * 160 + (160 - f.width) // 2, 160 - f.height - 4), f)
            faces.save(f'{SPR}{gid}-faces.webp', quality=88, method=6); print('  faces', len(fc))
        else: print('  faces NONE')
# preview
ids = sorted(set(j[1] for j in JOBS)); pv = Image.new('RGB', (1250, 60 * len(ids) + 10 + 160), (30, 120, 130)); y = 5
for gid in ids:
    sh = Image.open(f'{SPR}{gid}-32.webp').convert('RGBA'); sh = sh.resize((1250, 52)); pv.paste(sh, (0, y), sh); y += 60
x = 5
for gid in ids:
    p = Image.open(f'{SPR}{gid}-portrait.webp').convert('RGBA'); p.thumbnail((70, 150)); pv.paste(p, (x, y + 5), p); x += 80
pv.save(PV + '/guests_preview.png')
