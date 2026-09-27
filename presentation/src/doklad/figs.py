import json
from PIL import Image, ImageDraw, ImageFont, ImageFilter
Image.MAX_IMAGE_PIXELS = None
G = json.load(open('/root/deck2/geo.json'))
FB = '/usr/share/fonts/truetype/crosextra/Carlito-Bold.ttf'
FR = '/usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf'
def font(p, s): return ImageFont.truetype(p, s)

def shadow_text(d, xy, text, f, fill=(245, 243, 239), anchor='la'):
    x, y = xy
    for dx, dy in ((2, 2), (1, 1), (-1, 1), (1, -1)):
        d.text((x + dx, y + dy), text, font=f, fill=(0, 0, 0), anchor=anchor)
    d.text((x, y), text, font=f, fill=fill, anchor=anchor)

def dot(d, x, y, r, col, ring=True):
    if ring: d.ellipse((x - r * 2.2, y - r * 2.2, x + r * 2.2, y + r * 2.2), outline=col, width=3)
    d.ellipse((x - r, y - r, x + r, y + r), fill=col, outline=(255, 255, 255), width=3)

# --- Fig 1: Europe 1914 with counts
im = Image.open('/root/maps/out/europe1914.jpg').convert('RGB')
P = G['europe1914']['pts']
d = ImageDraw.Draw(im)
fN, fL = font(FB, 160), font(FR, 76)
for k, num, lab, dx, dy in (('russia', '244', 'Россия', 0, 0), ('germany', '232', 'Германия', 0, 0), ('france', '138', 'Франция', 0, 0), ('uk', '56*', 'Великобритания', 420, -90)):
    x, y = P[k]
    dot(d, x, y, 14, (255, 255, 255), ring=False)
    shadow_text(d, (x + dx, y + 30 + dy), num, fN, anchor='ma')
    shadow_text(d, (x + dx, y + 205 + dy), lab, fL, anchor='ma')
im = im.crop((600, 60, 5350, 2990))
im.thumbnail((2400, 2400), Image.LANCZOS)
im.save('img/fig_europe.jpg', quality=88)

# --- Fig 6: Western Front 1915-1917
im = Image.open('/root/maps/out/west1914.jpg').convert('RGB')
P = G['west1914']['pts']
x0, y0, x1, y1 = 1600, 1450, 3750, 2900
im = im.crop((x0, y0, x1, y1))
d = ImageDraw.Draw(im)
f1, f2 = font(FB, 46), font(FR, 34)
labels = [('arras', 'Аррас', '«Кровавый апрель», 1917', 1, -70), ('somme', 'Сомма', 'июль — ноябрь 1916', -1, -20),
          ('verdun', 'Верден', 'февраль — декабрь 1916', -1, -120), ('stmihiel', 'Сен-Мийель', 'сентябрь 1918', 1, 10)]
for k, n, t, side, dy in labels:
    x, y = P[k][0] - x0, P[k][1] - y0
    dot(d, x, y, 11, (255, 159, 10))
    ax = x + 45 if side > 0 else x - 45
    anc = 'la' if side > 0 else 'ra'
    shadow_text(d, (ax, y + dy), n, f1, anchor=anc)
    shadow_text(d, (ax, y + dy + 52), t, f2, fill=(205, 210, 218), anchor=anc)
for k, n in (('paris', 'Париж'), ('london', 'Лондон'), ('brussels', 'Брюссель')):
    x, y = P[k][0] - x0, P[k][1] - y0
    d.ellipse((x - 9, y - 9, x + 9, y + 9), fill=(255, 255, 255))
    shadow_text(d, (x + 20, y - 20), n, f2)
d.rounded_rectangle((30, im.height - 110, 900, im.height - 30), 20, fill=(7, 9, 13))
d.line((60, im.height - 70, 160, im.height - 70), fill=(255, 107, 94), width=8)
d.text((185, im.height - 92), 'линия Западного фронта 1915–1917 (упрощённо)', font=f2, fill=(235, 235, 235))
im.save('img/fig_west.jpg', quality=88)

# --- cutouts on white (smaller files than RGBA PNG)
def on_white(src, out, maxw, pad=30):
    c = Image.open(src).convert('RGBA'); c.thumbnail((maxw, maxw), Image.LANCZOS)
    bg = Image.new('RGBA', (c.width + 2 * pad, c.height + 2 * pad), (255, 255, 255, 255))
    bg.alpha_composite(c, (pad, pad)); bg.convert('RGB').save(out, quality=90)
O = '/root/deck2/orig/'
on_white(O + 'voisin.png', 'img/fig_voisin.jpg', 2000)
on_white(O + 'pfalz.png', 'img/fig_pfalz.jpg', 2000)
on_white(O + 'stamp.png', 'img/fig_stamp.jpg', 800)

# gun photo
Image.open('/root/deck2/assets/gun_photo.jpg').convert('RGB').save('img/fig_gun.jpg', quality=88)

# --- Ilya Muromets blueprint composite
bg = Image.open('/root/deck2/assets/blueprint_bg.jpg').convert('RGBA').resize((1920, 1200))
bp = Image.open('/root/deck2/assets/muromets_bp.png').convert('RGBA'); bp.thumbnail((1640, 1640), Image.LANCZOS)
bg.alpha_composite(bp, ((1920 - bp.width) // 2, (1200 - bp.height) // 2 + 20))
bg.convert('RGB').save('img/fig_muromets.jpg', quality=90)

# --- flight gear composite on white
W, H = 2400, 1500
canvas = Image.new('RGBA', (W, H), (255, 255, 255, 255))
def put(name, box_h, x, y):
    c = Image.open(O + name).convert('RGBA'); r = box_h / c.height
    c = c.resize((int(c.width * r), int(c.height * r)), Image.LANCZOS)
    canvas.alpha_composite(c, (x, y)); return c.size
put('suit.png', 1400, 880, 50)
put('helmet.png', 520, 1560, 90)
put('mask.png', 430, 1540, 640)
put('goggles.png', 230, 360, 620)
canvas.convert('RGB').save('img/fig_gear.jpg', quality=90)
print('figures ok')
