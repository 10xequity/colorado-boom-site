"""Round 13 assets: 8 template sheets of 15 cells (ready, run, dig, set, spike, block, faint1-3, dance1-3, charge1-3) for the
four drawn coaches and their Asian variants; the power-up aura frames; the hit / block / beam effects."""
import sys, os, numpy as np
from PIL import Image
I, OUT, S = sys.argv[1], sys.argv[2], sys.argv[3]
SPR = OUT + '/assets/img/coaches/sprites32/'; FX = OUT + '/assets/img/coaches/fx32/'
os.makedirs(FX, exist_ok=True)
ROWS = ['tara', 'damon', 'will', 'sidney']; CW, CH = 200, 240

def bands(profile, n, minw):
    on = profile > 0; runs = []; i = 0
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and on[j]: j += 1
            runs.append([i, j - 1]); i = j
        else: i += 1
    runs = [r for r in runs if r[1] - r[0] >= minw]
    while len(runs) > n:
        gaps = [runs[k + 1][0] - runs[k][1] for k in range(len(runs) - 1)]
        k = int(np.argmin(gaps)); runs[k] = [runs[k][0], runs[k + 1][1]]; del runs[k + 1]
    return runs

def split_runs(profile, run, n, centers):
    cuts = [run[0]]
    for k in range(n - 1):
        a, b = int(centers[k]), int(centers[k + 1]); cuts.append(a + int(np.argmin(profile[a:b])))
    cuts.append(run[1] + 1); return [[cuts[k], cuts[k + 1] - 1] for k in range(n)]

def grid_cells(path, ncols):
    """returns cells[row][col] as RGBA crops using column / row profiles (poses of neighbouring rows may touch)"""
    im = Image.open(path).convert('RGBA'); a = np.array(im)[..., 3] > 40
    xs = bands(a.sum(axis=0), ncols, 30); assert len(xs) == ncols, (path, 'cols', xs)
    rows_ref = bands(a[:, xs[0][0]:xs[0][1] + 1].sum(axis=1), 4, 30); assert len(rows_ref) == 4, (path, 'rows', rows_ref)
    centers = [(r[0] + r[1]) / 2 for r in rows_ref]; cells = [[None] * ncols for _ in range(4)]
    for c, (x0, x1) in enumerate(xs):
        prof = a[:, x0:x1 + 1].sum(axis=1); runs = bands(prof, 4, 25)
        if len(runs) < 4:
            fixed = []
            for r in runs:
                inside = [k for k, cy in enumerate(centers) if r[0] - 12 <= cy <= r[1] + 12]
                fixed += split_runs(prof, r, len(inside), [centers[k] for k in inside]) if len(inside) > 1 else [r]
            runs = fixed
        assert len(runs) == 4, (path, c, runs)
        for r, (y0, y1) in enumerate(runs):
            sub = a[y0:y1 + 1, x0:x1 + 1]; ys, xx = np.where(sub)
            cells[r][c] = im.crop((x0 + xx.min(), y0 + ys.min(), x0 + xx.max() + 1, y0 + ys.max() + 1))
    return cells

def fit(crop):
    s = min((CW - 8) / crop.width, (CH - 8) / crop.height, 1.0)
    return crop.resize((round(crop.width * s), round(crop.height * s)), Image.LANCZOS) if s < 1 else crop

faint = grid_cells(I + '/20.png', 6); dance = grid_cells(I + '/21.png', 6); charge = grid_cells(I + '/22.png', 6); asian = grid_cells(I + '/23.png', 6)
for r, name in enumerate(ROWS):
    for variant in ('', 'a'):
        sheet = Image.new('RGBA', (CW * 15, CH), (0, 0, 0, 0)); cells = []
        if variant == '':
            old = Image.open(f'{SPR}{name}-32.webp').convert('RGBA')
            for c in range(6): cells.append(old.crop((c * CW, 0, (c + 1) * CW, CH)))
            off = 0
        else:
            cells = [fit(asian[r][c]) for c in range(6)]; off = 3
        cells += [fit(faint[r][off + k]) for k in range(3)] + [fit(dance[r][off + k]) for k in range(3)] + [fit(charge[r][off + k]) for k in range(3)]
        for i, c in enumerate(cells):
            if c.width == CW and c.height == CH: sheet.paste(c, (i * CW, 0), c)   # an existing cell, already placed
            else: sheet.paste(c, (i * CW + (CW - c.width) // 2, CH - 4 - c.height), c)
        fn = f'{SPR}{name}{variant}-32.webp'; sheet.save(fn, quality=88, method=6); print('wrote', fn, os.path.getsize(fn))
# ---- aura (24.png): 3 colours x 3 frames, clean the low-alpha haze, square cells
au = Image.open(I + '/24.png').convert('RGBA'); a = np.array(au); a[..., 3] = np.where(a[..., 3] < 90, 0, a[..., 3]); au = Image.fromarray(a)
cw, ch = au.width // 3, au.height // 3; sheet = Image.new('RGBA', (3 * 420, 3 * 420), (0, 0, 0, 0))
for r in range(3):
    for c in range(3):
        cell = au.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)); bb = cell.getbbox(); cell = cell.crop(bb) if bb else cell
        cell = fit_cell = cell.resize((min(412, cell.width), min(412, round(cell.height * min(412, cell.width) / cell.width))), Image.LANCZOS)
        sheet.paste(cell, (c * 420 + (420 - cell.width) // 2, r * 420 + 420 - cell.height - 4), cell)
sheet.save(f'{FX}aura.webp', quality=85, method=6); print('aura', os.path.getsize(f'{FX}aura.webp'))
# ---- effects (16.png, white background): alpha from darkness-from-white, then crop the burst row, the spark row and a beam
fx = Image.open(I + '/16.png').convert('RGB'); rgb = np.array(fx).astype(int)
alpha = 255 - rgb.min(axis=2); alpha = np.clip((alpha - 10) * 2.6, 0, 255).astype(np.uint8)
fxa = Image.fromarray(np.dstack([rgb.astype(np.uint8), alpha]))
def row_cells(y0, y1, n):
    band = np.array(fxa)[y0:y1, :, 3] > 40; xs = bands(band.sum(axis=0), n, 20); out = []
    for x0, x1 in xs:
        sub = np.array(fxa)[y0:y1, x0:x1 + 1, 3] > 40; ys, xx = np.where(sub)
        out.append(fxa.crop((x0 + xx.min(), y0 + ys.min(), x0 + xx.max() + 1, y0 + ys.max() + 1)))
    return out
bursts = row_cells(1300, 1450, 5); sparks = row_cells(900, 1070, 4); beam = row_cells(400, 480, 1)[0]
def strip(cells, size, name):
    sh = Image.new('RGBA', (size * len(cells), size), (0, 0, 0, 0))
    for i, c in enumerate(cells):
        s = min((size - 4) / c.width, (size - 4) / c.height); c = c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), Image.LANCZOS)
        sh.paste(c, (i * size + (size - c.width) // 2, (size - c.height) // 2), c)
    sh.save(f'{FX}{name}.webp', quality=85, method=6); print(name, len(cells), os.path.getsize(f'{FX}{name}.webp'))
strip(bursts, 160, 'burst'); strip(sparks, 200, 'spark'); beam.save(f'{FX}beam.webp', quality=85, method=6); print('beam', beam.size)
# preview
pv = Image.new('RGB', (3000, 240 * 2 + 420 + 200), (30, 120, 130))
for i, n in enumerate(['damon', 'damona']):
    im = Image.open(f'{SPR}{n}-32.webp').convert('RGBA'); pv.paste(im, (0, i * 240), im)
pv.paste(Image.open(f'{FX}aura.webp').convert('RGBA').resize((420, 420)), (0, 480), Image.open(f'{FX}aura.webp').convert('RGBA').resize((420, 420)))
b = Image.open(f'{FX}burst.webp').convert('RGBA'); pv.paste(b, (500, 480), b); sp = Image.open(f'{FX}spark.webp').convert('RGBA'); pv.paste(sp, (500, 660), sp); pv.paste(beam, (1400, 500), beam)
pv.save(S + '/r13_preview.png')
