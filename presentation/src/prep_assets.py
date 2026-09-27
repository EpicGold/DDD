import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
Image.MAX_IMAGE_PIXELS = None
CUT = '/root/cut/{}__birefnet-general-lite.png'
SRC = '/root/si/img/small/{}.jpg'
A = '/root/deck2/assets/'

def trim(im, pad=6):
    a = np.array(im.split()[-1])
    ys, xs = np.where(a > 8)
    x0, x1, y0, y1 = max(xs.min() - pad, 0), min(xs.max() + pad, im.width), max(ys.min() - pad, 0), min(ys.max() + pad, im.height)
    return im.crop((x0, y0, x1, y1))

def save_cut(src_id, name, maxdim, fix=None, flip=False):
    im = Image.open(CUT.format(src_id)).convert('RGBA')
    if fix: im = fix(im)
    im = trim(im)
    if flip: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    im.thumbnail((maxdim, maxdim), Image.LANCZOS)
    im.save(A + name + '.png', optimize=True)
    print(name, im.size)

def helmet_fix(im):
    rgb = np.array(im.convert('RGB')).astype(np.float32) / 255
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(np.float32) / 255
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    brown = (s > 0.30) & (v > 0.18) & (h > 0.01) & (h < 0.13)
    brown = ndimage.binary_opening(brown, iterations=2)
    lab, n = ndimage.label(brown)
    if n:
        sizes = ndimage.sum(brown, lab, range(1, n + 1))
        brown = lab == (np.argmax(sizes) + 1)
    keep = ndimage.binary_fill_holes(ndimage.binary_dilation(brown, iterations=10))
    a = np.array(im.split()[-1]).astype(np.float32)
    a *= ndimage.gaussian_filter(keep.astype(np.float32), 1.5)
    out = im.copy(); out.putalpha(Image.fromarray(a.clip(0, 255).astype(np.uint8)))
    return out

save_cut('NASM-A19540015000-NASM2018-10191', 'pfalz', 2200)
save_cut('NASM-A19190007000-NASM2018-10173', 'voisin', 2200)
save_cut('NASM-A19200001000-NASM2018-10135-000001', 'spad', 1600)
save_cut('NASM-NASM2020-00141-000001', 'camel', 1600)
save_cut('NASM-A19200004000-NASM2018-10468-000002', 'fokker', 1600)
save_cut('NASM-NASM2022-00100A-000001', 'flyer', 1600)
save_cut('NASM-NASM2021-00106', 'n9h', 2000)
save_cut('NASM-NASM2021-03403', 'jenny', 1600)
save_cut('NASM-A19940151000-NASM2018-10192', 'snipe', 1600)
save_cut('NASM-A19570999000_PS01', 'rotary', 1300)
save_cut('NASM-A19660043000-NASM2015-02207', 'liberty', 1800)
save_cut('NASM-A19830206000_PS01', 'camera', 1300)
save_cut('NASM-A19900366000_PS01', 'altimeter', 900)
save_cut('NASM-A19570093000_PS01', 'vaporizer', 1000)
save_cut('NASM-A19590121000_PS01', 'trenchart', 1200)
save_cut('NASM-A19710189000_PS01', 'badge', 800)
save_cut('NASM-A19830192000_PS01', 'cap', 1000)
save_cut('NPM-1982_0157_520x', 'helmet', 900, fix=helmet_fix)
save_cut('NPM-1982_0157_521z', 'mask', 900)
save_cut('NPM-1982_0157_523z', 'suit', 1300)
save_cut('NPM-1982_0157_525', 'goggles', 800)
save_cut('NPM-0_217665_1c', 'stamp', 900)
save_cut('NMAH-2011-04375', 'teddy', 1200)

def save_jpg(src_id, name, maxdim, crop=None):
    im = Image.open(SRC.format(src_id)).convert('RGB')
    if crop: im = im.crop(crop)
    im.thumbnail((maxdim, maxdim), Image.LANCZOS)
    im.save(A + name + '.jpg', quality=86, optimize=True)
    print(name, im.size)

save_jpg('NASM-A19200004000-NASM2018-10467-000002', 'gun_photo', 2400)
save_jpg('NMAH-2003-17779', 'art_raid', 1700)
save_jpg('NMAH-2000-10401', 'art_dunn', 1500)
save_jpg('NMAH-2011-04118', 'art_verdun', 1700)
save_jpg('NMAH-2011-04127', 'art_balloons', 1700)
save_jpg('NMAH-2011-04228', 'art_issoudun', 2000)
save_jpg('NMAH-2011-04242', 'art_repair', 2000)
save_jpg('SAAM-1927.8.11_1', 'lufbery', 1400)
save_jpg('NASM-A19940181000_PS01', 'license', 1600)

# maps
for n in ('europe1914', 'west1914'):
    Image.open(f'/root/maps/out/{n}.jpg').save(A + n + '.jpg', quality=86, optimize=True)

# gradient overlays (black -> transparent)
def grad(name, w, h, horizontal=True, start=0.92, stop=0.0, color=(7, 9, 13), power=1.4):
    t = np.linspace(0, 1, w if horizontal else h)
    a = (start + (stop - start) * (t ** (1 / power)))
    a = np.clip(a, 0, 1)
    if horizontal: A2 = np.tile(a[None, :], (h, 1))
    else: A2 = np.tile(a[:, None], (1, w))
    img = np.zeros((h, w, 4), np.uint8); img[..., :3] = color; img[..., 3] = (A2 * 255).astype(np.uint8)
    Image.fromarray(img, 'RGBA').save(A + name + '.png', optimize=True)
grad('grad_left', 1200, 64, True, 0.95, 0.0)
grad('grad_right', 1200, 64, True, 0.0, 0.95, power=0.7)
grad('grad_bottom', 64, 800, False, 0.0, 0.95, power=0.8)
grad('grad_top', 64, 800, False, 0.85, 0.0)

def glow(name, rgb, size=1200, strength=0.55):
    yy, xx = np.mgrid[0:size, 0:size]
    r = np.sqrt((xx - size / 2) ** 2 + (yy - size / 2) ** 2) / (size / 2)
    a = np.clip(1 - r, 0, 1) ** 2.2 * strength
    img = np.zeros((size, size, 4), np.uint8); img[..., :3] = rgb; img[..., 3] = (a * 255).astype(np.uint8)
    Image.fromarray(img, 'RGBA').save(A + name + '.png', optimize=True)
glow('glow_red', (255, 69, 58))
glow('glow_amber', (255, 159, 10))
glow('glow_blue', (10, 132, 255))
glow('glow_teal', (100, 210, 255))
glow('glow_violet', (94, 92, 230))
glow('glow_white', (255, 255, 255), strength=0.35)
print('done')
