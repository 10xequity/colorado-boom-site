"""32-bit sheets for every coach: the four drawn bodies (Tara, Damon, Will, Sidney) are the templates; each other coach gets a
template by build, then hair, skin and jersey are recoloured to that coach (photo colours where a photo exists, the card's
own palette otherwise). Palette-swapped variants, the classic sprite trick, not newly drawn figures."""
import sys, os, json, colorsys, numpy as np
from PIL import Image
OUT = sys.argv[1]; SPR = OUT + '/assets/img/coaches/sprites32/'
data = json.loads(sys.argv[2])  # [{id, template, hair, skin, jersey, no}]
JER = {'black': (22, 22, 22), 'teal': (14, 124, 134), 'white': (236, 236, 236)}
TRIM = {'black': (14, 124, 134), 'teal': (6, 90, 98), 'white': (14, 124, 134)}

def hexrgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))

def masks(a):
    rgb = a[..., :3].astype(float) / 255; al = a[..., 3] > 40
    hsv = np.array([colorsys.rgb_to_hsv(*p) for p in rgb.reshape(-1, 3)]).reshape(rgb.shape)
    h, s, v = hsv[..., 0] * 360, hsv[..., 1], hsv[..., 2]
    skin = al & (h >= 8) & (h <= 38) & (s >= .18) & (s <= .62) & (v >= .5)
    hair = al & (h >= 8) & (h <= 48) & (s >= .25) & (v >= .08) & (v < .5)
    hair |= al & (s < .3) & (v < .22) & (h < 60)            # very dark hair reads as near-black
    jersey = al & (h >= 170) & (h <= 240) & (s >= .18) & (v >= .08) & (v <= .5)
    trim = al & (h >= 35) & (h <= 60) & (s >= .3) & (v >= .5)  # gold pinstripe on the jersey
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
for t in ['tara', 'damon', 'will', 'sidney']:
    templates[t] = Image.open(f'{SPR}{t}-32.webp').convert('RGBA')
for d in data:
    tpl = templates[d['template']]; a = np.array(tpl).copy()
    skin, hair, jersey, trim, al = masks(a)
    recolour(a, hair, hexrgb(d['hair']))
    recolour(a, skin, hexrgb(d['skin']))
    if d['jersey'] != 'black':
        recolour(a, jersey, JER[d['jersey']], 'lift' if d['jersey'] == 'white' else 'mul')
        recolour(a, trim, TRIM[d['jersey']])
    im = Image.fromarray(a)
    # card number on the chest of the ready pose (cell 0): a 3x5 pixel font at 4 px per dot, colour by jersey
    cell0 = (0, 0, 200, 240); num = digits(d['no']); col = (20, 20, 20) if d['jersey'] == 'white' else (240, 240, 240)
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
