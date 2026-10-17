# Prepare graded / cropped photos and gradient overlays for the documentary redesign.
import sys, os, json, math
import numpy as np
from PIL import Image, ImageOps, ImageFilter, ImageEnhance

SRC = sys.argv[1]            # unpacked ppt/media dir (untrusted data, read only)
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
BG = (15, 14, 13)
PPI = 80
W, H = 13.333, 7.5
rng = np.random.default_rng(7)

def tone(img):
    """Unified warm black-and-white documentary grade."""
    L = ImageOps.autocontrast(img.convert("L"), cutoff=0.6)
    a = np.asarray(L, dtype=np.float32) / 255.0
    k = 1.7
    a = 0.5 + 0.5 * np.tanh(k * (a - 0.5)) / math.tanh(k * 0.5)
    L = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8))
    return ImageOps.colorize(L, black=(14, 12, 11), white=(241, 233, 218), mid=(124, 113, 99))

def paint_grade(img):
    img = img.convert("RGB")
    img = ImageEnhance.Color(img).enhance(0.78)
    img = ImageEnhance.Contrast(img).enhance(1.04)
    return img

def crop_to(img, aspect, fx=0.5, fy=0.5):
    """Cover-crop to aspect (w/h) around focus point fx, fy (0..1)."""
    w, h = img.size
    if w / h > aspect:
        nw = round(h * aspect); x = round(min(max(fx * w - nw / 2, 0), w - nw))
        return img.crop((x, 0, x + nw, h))
    nh = round(w / aspect); y = round(min(max(fy * h - nh / 2, 0), h - nh))
    return img.crop((0, y, w, y + nh))

def save_jpg(img, name, q=88):
    img.convert("RGB").save(os.path.join(OUT, name), quality=q, optimize=True, progressive=True)

def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)

def overlay(name, w_in, h_in, left=0.0, right=0.0, top=0.0, bottom=0.0, frac=0.42, vign=0.0, full_left=None, base=0.0, bstart=0.70):
    pw, ph = max(2, round(w_in * PPI)), max(2, round(h_in * PPI))
    x = np.linspace(0, 1, pw)[None, :].repeat(ph, 0)
    y = np.linspace(0, 1, ph)[:, None].repeat(pw, 1)
    a = np.full((ph, pw), base, np.float32)
    if left:  a = np.maximum(a, left * (1 - smooth(0.0, frac, x)))
    if right: a = np.maximum(a, right * smooth(1 - frac, 1.0, x))
    if full_left: a = np.maximum(a, full_left[0] * (1 - smooth(full_left[1], full_left[2], x)))
    if top:   a = np.maximum(a, top * (1 - smooth(0.0, 0.17, y)))
    if bottom: a = np.maximum(a, bottom * smooth(bstart, 1.0, y))
    if vign:
        r = np.sqrt(((x - 0.55) / 0.75) ** 2 + ((y - 0.5) / 0.75) ** 2)
        a = np.maximum(a, vign * smooth(0.55, 1.15, r))
    a = np.clip(a * 255 + rng.normal(0, 0.35, a.shape), 0, 255).astype(np.uint8)   # dither: no banding
    rgba = np.zeros((ph, pw, 4), np.uint8); rgba[..., 0], rgba[..., 1], rgba[..., 2] = BG; rgba[..., 3] = a
    Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, name), optimize=True)

M = lambda f: Image.open(os.path.join(SRC, f))
info = {}

# --- hero / full-bleed backgrounds (5 Academy, 9 Munich, 13 Ludwigstrasse, 15 trench)
for f, n in [("image8.jpg", "bg_academy"), ("image17.jpg", "bg_munich"), ("image22.jpg", "bg_demo"), ("image24.jpg", "bg_trench")]:
    save_jpg(tone(M(f)), n + ".jpg")
M("image23.png").convert("RGB").save(os.path.join(OUT, "bg_map.jpg"), quality=92)
overlay("ov_hero.png", W, H, full_left=(0.95, 0.32, 0.72), top=0.55, bottom=0.94, vign=0.45, base=0.10)
overlay("ov_map.png", W, H, full_left=(0.90, 0.20, 0.44), top=0.45, bottom=0.85)
overlay("ov_end.png", W, H, full_left=(0.93, 0.40, 0.98), top=0.6, bottom=0.95, vign=0.5, base=0.50)

# --- cut-out portraits with alpha (title, Liszt regiment)
for f, n in [("image1.png", "cut_title"), ("image18.png", "cut_list")]:
    im = M(f).convert("RGBA"); g = tone(im).convert("RGBA"); g.putalpha(im.getchannel("A")); g.save(os.path.join(OUT, n + ".png"), optimize=True)

# --- bleed panels (full height); aspect = w/7.5
def panel(f, n, w_in, fx=0.5, fy=0.5, grade=tone):
    im = crop_to(M(f), w_in / H, fx, fy); save_jpg(grade(im), n + ".jpg"); info[n] = im.size

panel("image3.jpg", "p_alois", 3.49, fx=0.47)            # slide 2 split, right side
panel("image4.jpg", "p_klara", 3.50, fx=0.52)
overlay("ov_split_a.png", 3.49, H, left=1.0, frac=0.55, top=0.5, bottom=0.97, bstart=0.58)
overlay("ov_split_b.png", 3.50, H, top=0.5, bottom=0.97, bstart=0.58)

panel("image5.jpg", "p_school", 7.333, fx=0.555)         # slide 3, Adolf in top row
overlay("ov_school.png", 7.333, H, left=1.0, frac=0.40, top=0.0, bottom=0.985, bstart=0.52)

panel("image7.jpg", "p_mother", 5.9, fy=0.45)            # slide 4, bleed left
overlay("ov_mother.png", 5.9, H, right=1.0, frac=0.45, top=0.45, bottom=0.95)

panel("image15.jpg", "p_lueger", 3.37, fx=0.5)           # slide 8 split, left side
panel("image16.jpg", "p_schoen", 3.40, fx=0.5)
overlay("ov_split_c.png", 3.37, H, top=0.5, bottom=0.97, bstart=0.58)
overlay("ov_split_d.png", 3.40, H, right=1.0, frac=0.55, top=0.5, bottom=0.97, bstart=0.58)

panel("image19.jpg", "p_beelitz", 7.333, fx=1.0)         # slide 11, keep the right side (Hitler 2nd from right)
overlay("ov_beelitz.png", 7.333, H, left=1.0, frac=0.42, top=0.15, bottom=0.985, bstart=0.5)

panel("image21.jpg", "p_gas", 5.6, fy=0.55)              # slide 12, bleed left
overlay("ov_gas.png", 5.6, H, right=1.0, frac=0.45, top=0.45, bottom=0.95)

# --- prints / artifacts (kept whole)
for f, n in [("image6.jpg", "a_child"), ("image20.jpg", "a_cross"), ("image14.jpg", "a_hostel")]:
    save_jpg(tone(M(f)), n + ".jpg"); info[n] = M(f).size
for f, n in [("image12.jpg", "a_oper"), ("image13.jpg", "a_hof")]:
    save_jpg(paint_grade(M(f)), n + ".jpg", q=90); info[n] = M(f).size

# --- ambient blurred backdrops for artifact slides
def ambient(f, n, grade, dark):
    im = grade(crop_to(M(f), W / H)).resize((960, 540)).filter(ImageFilter.GaussianBlur(28))
    im = ImageEnhance.Brightness(im).enhance(dark); save_jpg(im, n + ".jpg", q=85)
ambient("image14.jpg", "amb_hostel", tone, 0.42)
ambient("image13.jpg", "amb_paint", paint_grade, 0.30)
overlay("ov_amb.png", W, H, full_left=(0.85, 0.20, 0.60), top=0.5, bottom=0.9, vign=0.6)
overlay("ov_amb_soft.png", W, H, top=0.6, bottom=0.92, vign=0.7)

# grain: reuse the deck's own film grain
M("image2.png").save(os.path.join(OUT, "grain.png"), optimize=True)
json.dump(info, open(os.path.join(OUT, "info.json"), "w"), indent=1)
print("ok", len(os.listdir(OUT)), "files")
