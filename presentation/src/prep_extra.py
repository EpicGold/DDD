import json, numpy as np
from PIL import Image
from pyproj import Transformer
import cairosvg
A='/root/deck2/assets/'
# --- map geo positions (pixel coordinates in the 5600x3150 map images)
places = {
 'europe1914': {
   'russia': (37.0, 55.2), 'germany': (10.2, 51.2), 'france': (2.4, 46.9), 'uk': (-1.6, 52.6),
   'paris': (2.35, 48.86), 'berlin': (13.40, 52.52), 'london': (-0.13, 51.51), 'vienna': (16.37, 48.21), 'petrograd': (30.32, 59.94),
   'marne': (3.4, 48.95), 'tannenberg': (20.10, 53.50), 'kiev': (30.52, 50.45), 'zhovkva': (23.97, 50.06), 'moscow': (37.62, 55.75),
   'reims': (4.03, 49.26), 'warsaw': (21.01, 52.23), 'jablonna': (20.93, 52.38), 'constantinople': (28.98, 41.01)},
 'west1914': {
   'arras': (2.78, 50.29), 'somme': (2.65, 50.00), 'verdun': (5.38, 49.16), 'stmihiel': (5.54, 48.89), 'paris': (2.35, 48.86),
   'reims': (4.03, 49.26), 'london': (-0.13, 51.51), 'cuxhaven': (8.69, 53.87), 'tondern': (8.87, 54.93), 'harwich': (1.29, 51.94),
   'ypres': (2.88, 50.85), 'nieuport': (2.75, 51.13), 'dardanelles': (26.4, 40.2), 'berlin': (13.40, 52.52), 'amsterdam': (4.90, 52.37),
   'brussels': (4.35, 50.85), 'nordholz': (8.66, 53.78)},
}
out = {}
for m, pts in places.items():
    meta = json.load(open(f'/root/maps/out/{m}.json'))
    fwd = Transformer.from_crs('EPSG:4326', meta['proj'], always_xy=True)
    x0, y0, x1, y1 = meta['bounds']; W, H = meta['width'], meta['height']
    out[m] = {'W': W, 'H': H, 'pts': {}}
    for k, (lo, la) in pts.items():
        X, Y = fwd.transform(lo, la)
        out[m]['pts'][k] = [(X - x0) / (x1 - x0) * W, (y1 - Y) / (y1 - y0) * H]
json.dump(out, open('/root/deck2/geo.json', 'w'), indent=1)
print(json.dumps(out)[:400])

# --- blueprint background
W, H = 1920, 1080
yy, xx = np.mgrid[0:H, 0:W]
r = np.sqrt(((xx - W * 0.35) / W) ** 2 + ((yy - H * 0.45) / H) ** 2)
base = np.stack([np.full((H, W), c) for c in (14, 52, 96)], -1).astype(np.float32)
base *= np.clip(1.15 - 0.9 * r, 0.55, 1.15)[..., None]
img = base
for step, a in ((24, 0.07), (120, 0.16)):
    g = ((xx % step) == 0) | ((yy % step) == 0)
    img = np.where(g[..., None], img * (1 - a) + np.array([150, 200, 255]) * a, img)
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(A + 'blueprint_bg.jpg', quality=88)

# --- Ilya Muromets blueprint line drawing (top view)
S = '#D8ECFF'; C = '#64D2FF'
eng = [300, 390, 610, 700]
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="2000" height="1400">
<g fill="none" stroke="{S}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
 <path d="M470 70 Q500 30 530 70 L522 560 L478 560 Z"/>
 <rect x="20" y="190" width="960" height="96" rx="10"/>
 <rect x="110" y="200" width="780" height="80" rx="8" stroke-dasharray="10 8" stroke-width="1.6" opacity="0.7"/>
 {''.join(f'<rect x="{x-14}" y="158" width="28" height="60" rx="8"/><ellipse cx="{x}" cy="154" rx="46" ry="5"/>' for x in eng)}
 <rect x="360" y="536" width="280" height="46" rx="7"/>
 <rect x="360" y="548" width="280" height="22" rx="5" stroke-dasharray="8 6" stroke-width="1.4" opacity="0.6"/>
 <path d="M500 560 L500 640"/>
 {''.join(f'<line x1="{x}" y1="194" x2="{x}" y2="282" stroke-width="1.2" opacity="0.55"/>' for x in range(60, 960, 45))}
 {''.join(f'<rect x="488" y="{y}" width="24" height="12" rx="3" stroke-width="1.6"/>' for y in (90, 112, 330, 360, 390))}
 <line x1="120" y1="286" x2="120" y2="200" stroke-width="1.4" opacity="0.7"/>
 <line x1="880" y1="286" x2="880" y2="200" stroke-width="1.4" opacity="0.7"/>
</g>
<g stroke="{C}" stroke-width="2" fill="{C}">
 <line x1="20" y1="660" x2="980" y2="660"/>
 <line x1="20" y1="645" x2="20" y2="675"/><line x1="980" y1="645" x2="980" y2="675"/>
 <path d="M20 660 l18 -7 l0 14 z"/><path d="M980 660 l-18 -7 l0 14 z"/>
</g>
<text x="500" y="648" fill="{C}" font-family="DejaVu Sans" font-size="26" text-anchor="middle">размах крыльев ≈ 30 м</text>
</svg>'''
cairosvg.svg2png(bytestring=svg.encode(), write_to=A + 'muromets_bp.png')
print('blueprint ok')
