"""32-bit stages: add the beach, then stamp the Colorado Boom logos into every stage in the pixel-art render style
(floor decal across the centre line in perspective, club logo on the wall banners / fence cloths)."""
import sys, os, numpy as np
from PIL import Image, ImageOps
I, OUT = sys.argv[1], sys.argv[2]
STG = OUT + '/assets/img/coaches/stages32/'
logo = Image.open(OUT + '/assets/img/logo.png').convert('RGBA')          # gold / teal / white club logo
ryl = Image.open(OUT + '/assets/img/coaches/ryl-logo.webp').convert('RGBA')  # comic-burst logo

def pixelate(im, f=3):
    """match the stage render: quantise to a coarse pixel grid and fewer tones"""
    w, h = im.size
    small = im.resize((max(1, w // f), max(1, h // f)), Image.BOX)
    rgb = np.array(small).astype(int)
    rgb[..., :3] = (rgb[..., :3] // 12) * 12
    return Image.fromarray(rgb.astype(np.uint8)).resize((w, h), Image.NEAREST)

def warp(im, quad, size):
    """perspective-map an RGBA image onto quad (tl, tr, br, bl) inside a canvas of `size`"""
    w, h = im.size
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = quad
    # solve the 8 perspective coefficients mapping output quad -> input rect
    A = []; B = []
    for (X, Y), (x, y) in zip([(x0, y0), (x1, y1), (x2, y2), (x3, y3)], [(0, 0), (w, 0), (w, h), (0, h)]):
        A.append([X, Y, 1, 0, 0, 0, -x * X, -x * Y]); B.append(x)
        A.append([0, 0, 0, X, Y, 1, -y * X, -y * Y]); B.append(y)
    c = np.linalg.solve(np.array(A, float), np.array(B, float))
    return im.transform(size, Image.PERSPECTIVE, tuple(c), Image.BICUBIC)

def floor_decal(stage, quad, alpha=.55, src=logo):
    """logo laid flat on the floor across the centre line, pixelated, blended so the planks / sand show through"""
    dec = warp(src, quad, stage.size); dec = pixelate(dec, 3)
    a = np.array(dec); a[..., 3] = (a[..., 3] * alpha).astype(np.uint8)
    out = stage.copy(); out.alpha_composite(Image.fromarray(a)); return out

def banner(stage, box, src=logo, pad=0.08, bg=None, alpha=1.0):
    """logo fitted inside a rectangle on a wall (optional backing colour), pixelated"""
    x0, y0, x1, y1 = box; w, h = x1 - x0, y1 - y0
    layer = Image.new('RGBA', stage.size, (0, 0, 0, 0))
    if bg: layer.paste(Image.new('RGBA', (w, h), bg), (x0, y0))
    iw, ih = int(w * (1 - 2 * pad)), int(h * (1 - 2 * pad))
    l = ImageOps.contain(src, (iw, ih), Image.LANCZOS)
    layer.paste(l, (x0 + (w - l.width) // 2, y0 + (h - l.height) // 2), l)
    layer = pixelate(layer, 3)
    a = np.array(layer); a[..., 3] = (a[..., 3] * alpha).astype(np.uint8)
    out = stage.copy(); out.alpha_composite(Image.fromarray(a)); return out

def load_stage(name): return Image.open(f'{STG}{name}.webp').convert('RGBA')
def save(im, name): im.convert('RGB').save(f'{STG}{name}.webp', quality=80, method=6); print(name, os.path.getsize(f'{STG}{name}.webp'))

# ---- beach: crop the 1536x1024 drawing to 16:10 and size it like the others
b = Image.open(f'{I}/14.png').convert('RGB'); H = round(b.width * 10 / 16); top = (b.height - H) // 2
b = b.crop((0, top, b.width, top + H)).resize((1280, 800), Image.LANCZOS); b.save(f'{STG}beach.webp', quality=80, method=6)
Image.open(f'{I}/14.png').convert('RGB').save(f'{STG}beach-src.png')  # keep the untouched source for the next edit
# source copies for the other three stay as the previously generated files; the logo versions overwrite the live files
# ---- fieldhouse: decal across the centre line, club logo on the two big wall banners
s = load_stage('fieldhouse')
s = floor_decal(s, [(520, 470), (760, 470), (820, 560), (460, 560)], .5)
s = banner(s, (62, 148, 150, 310), bg=(8, 40, 44, 255)); s = banner(s, (1130, 148, 1218, 310), bg=(8, 40, 44, 255))
save(s, 'fieldhouse')
# ---- arena: decal on the court, comic logo on the front of the stands either side of the tunnel
s = load_stage('arena')
s = floor_decal(s, [(540, 480), (740, 480), (800, 560), (480, 560)], .5)
s = banner(s, (180, 410, 420, 470), src=ryl, bg=(0, 0, 0, 235)); s = banner(s, (860, 410, 1100, 470), src=ryl, bg=(0, 0, 0, 235))
save(s, 'arena')
# ---- retro: decal on the court, club logo on the brick wall between the window pairs
s = load_stage('retro')
s = floor_decal(s, [(540, 470), (740, 470), (790, 545), (490, 545)], .45)
s = banner(s, (560, 120, 720, 230), bg=(26, 18, 14, 230))
save(s, 'retro')
# ---- beach: decal in the sand, club logo on the centre fence cloth and the comic logo on the two outer cloths
s = load_stage('beach')
s = floor_decal(s, [(540, 440), (740, 440), (790, 530), (490, 530)], .5)
s = banner(s, (556, 356, 724, 404), bg=(14, 124, 134, 255)); s = banner(s, (150, 356, 318, 404), src=ryl, bg=(14, 124, 134, 255)); s = banner(s, (962, 356, 1130, 404), src=ryl, bg=(14, 124, 134, 255))
save(s, 'beach')
# preview sheet
sheet = Image.new('RGB', (1280 * 2 // 2, 800 * 2 // 2))
for i, n in enumerate(['fieldhouse', 'arena', 'retro', 'beach']):
    im = Image.open(f'{STG}{n}.webp').convert('RGB').resize((640, 400)); sheet.paste(im, ((i % 2) * 640, (i // 2) * 400))
sheet.save(sys.argv[3] + '/stages_preview.png')
