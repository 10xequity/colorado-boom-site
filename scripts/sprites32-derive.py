"""32-bit sheets for every coach: the drawn bodies (Tara, Damon, Will, Sidney and their Asian variants) are the templates;
each other coach gets a template by build, then hair, skin and jersey are recoloured to that coach (photo colours where a
photo exists, the card's own palette otherwise). Palette-swapped variants, the classic sprite trick, not newly drawn figures.
  python scripts/sprites32-derive.py <repo> '<json list of {id, template, hair, skin, jersey, no}>'"""
import sys, os, json, numpy as np
from PIL import Image, ImageFilter
OUT = sys.argv[1]; SPR = OUT + '/assets/img/coaches/sprites32/'
data = json.loads(sys.argv[2])
JER = {'black': (22, 22, 22), 'teal': (14, 124, 134), 'white': (236, 236, 236)}
TRIM = {'black': (14, 124, 134), 'teal': (6, 90, 98), 'white': (14, 124, 134)}

def hexrgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))

def rgb_to_hsv(rgb):
    """vectorised: rgb in 0..1 -> h (0..360), s, v"""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = rgb.max(axis=-1); mn = rgb.min(axis=-1); d = mx - mn
    h = np.zeros_like(mx)
    m = d > 1e-6
    rc = np.where(m, (mx - r) / np.where(m, d, 1), 0); gc = np.where(m, (mx - g) / np.where(m, d, 1), 0); bc = np.where(m, (mx - b) / np.where(m, d, 1), 0)
    h = np.where(mx == r, bc - gc, np.where(mx == g, 2 + rc - bc, 4 + gc - rc))
    h = (h / 6.0) % 1.0 * 360; h = np.where(m, h, 0)
    s = np.where(mx > 0, d / np.where(mx > 0, mx, 1), 0)
    return h, s, mx

def clean(m, r=2):
    """morphological opening: drop small scattered patches (shadowed skin that reads as hair, trim pixels on legs)"""
    im = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(2 * r + 1)).filter(ImageFilter.MaxFilter(2 * r + 1))
    return np.array(im) > 128

def masks(a):
    rgb = a[..., :3].astype(float) / 255; al = a[..., 3] > 40
    h, s, v = rgb_to_hsv(rgb)
    skin = al & (h >= 8) & (h <= 40) & (s >= .15) & (s <= .78) & (v >= .32)   # wide enough for the tanner variant bodies' arm shading
    rough = al & (((h >= 8) & (h <= 48) & (s >= .25) & (v >= .08) & (v < .5)) | ((s < .3) & (v < .22) & (h < 60)))
    # the template's real hair colour: median of the rough mask in the top of the cells (heads), then keep only pixels close to it,
    # which leaves shadowed skin on arms and legs alone
    top = np.zeros_like(rough); top[:70, :] = True
    ref = np.median(a[..., :3][rough & top], axis=0) if (rough & top).any() else np.array([60, 40, 30])
    dist = np.sqrt(((a[..., :3].astype(float) - ref) ** 2).sum(axis=-1))
    hair = al & (dist < 42) & ~((h >= 8) & (h <= 38) & (s >= .18) & (s <= .62) & (v >= .5))
    hair = clean(hair, 1); skin = skin & ~hair
    jersey = al & (h >= 165) & (h <= 235) & (s >= .32) & (v >= .08) & (v <= .92)   # navy (originals) and teal (variants)
    trim = al & (h >= 35) & (h <= 60) & (s >= .3) & (v >= .5)                      # gold pinstripe on the jersey
    jersey = clean(jersey & ~skin, 1)
    return skin, hair, jersey, trim, al

def recolour(a, m, target, mode='mul'):
    if not m.any(): return
    rgb = a[..., :3].astype(float); lum = rgb[m].mean(axis=1); ref = lum.mean()
    t = np.array(target, float)
    if mode == 'mul':   # keep the drawn shading as a ratio around the mask's average brightness
        k = np.clip(lum / max(ref, 1), .35, 1.6)[:, None]; new = t[None, :] * k
    else:               # white jersey: lift to the target, keep folds as mild darkening
        k = np.clip(lum / max(ref, 1), .6, 1.05)[:, None]; new = t[None, :] * k
    a[..., :3][m] = np.clip(new, 0, 255).astype(np.uint8)

def digits(no):
    DIG = {'0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'], '2': ['111', '001', '111', '100', '111'], '3': ['111', '001', '111', '001', '111'], '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '111', '001', '111'], '6': ['111', '100', '111', '101', '111'], '7': ['111', '001', '001', '001', '001'], '8': ['111', '101', '111', '101', '111'], '9': ['111', '101', '111', '001', '111']}
    return [DIG[c] for c in str(no)]

templates = {}
for t in ['tara', 'damon', 'will', 'sidney', 'taraa', 'damona', 'willa', 'sidneya']:
    templates[t] = Image.open(f'{SPR}{t}-32.webp').convert('RGBA')
for d in data:
    tpl = templates[d['template']]; a = np.array(tpl).copy()
    skin, hair, jersey, trim, al = masks(a)
    recolour(a, hair, hexrgb(d['hair']))
    recolour(a, skin, hexrgb(d['skin']))
    recolour(a, jersey, JER[d['jersey']], 'lift' if d['jersey'] == 'white' else 'mul')
    recolour(a, trim, TRIM[d['jersey']])
    im = Image.fromarray(a)
    num = digits(d['no']); col = (20, 20, 20) if d['jersey'] == 'white' else (240, 240, 240)
    cx, cy = 96 - (len(num) * 16) // 2, 118
    for i, g in enumerate(num):
        for y in range(5):
            for x in range(3):
                if g[y][x] == '1':
                    for yy in range(4):
                        for xx in range(4):
                            px, py = cx + i * 16 + x * 4 + xx, cy + y * 4 + yy
                            if a[py, px, 3] > 40 and jersey[py, px]: im.putpixel((px, py), col + (255,))
    im.save(f'{SPR}{d["id"]}-32.webp', quality=88, method=6)
print('wrote', len(data))
