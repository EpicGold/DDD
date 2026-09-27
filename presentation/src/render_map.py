"""Render dark keynote-style maps of Europe in 1914 from real geodata.

Layers: Natural Earth shaded relief (SR_HR) + land/lakes/rivers,
1914 political borders from aourednik/historical-basemaps (world_1914.geojson).
Writes a JPEG plus a JSON with the projection so slide overlays can be placed.
"""
import json, sys
import numpy as np
from PIL import Image
import shapefile
from pyproj import Transformer
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.path import Path
from matplotlib.patches import PathPatch

Image.MAX_IMAGE_PIXELS = None
SR = None

ENTENTE = {"Russian Empire", "Finland", "France", "United Kingdom of Great Britain and Ireland", "Belgium", "Serbia", "Montenegro", "Algeria", "Tunisia", "Morocco", "Malta"}
ENTENTE_LATER = {"Kingdom of Italy", "Libya", "Romania", "Portugal", "Greece", "Egypt"}
CENTRAL = {"German Empire", "Austro-Hungarian Empire"}
CENTRAL_LATER = {"Ottoman Empire", "Bulgaria"}

COL = {
    "ocean": (0.035, 0.055, 0.085),
    "land": (0.16, 0.175, 0.20),
    "entente": "#4E93D8", "entente_later": "#4E93D8",
    "central": "#E4543F", "central_later": "#E4543F",
    "neutral": "#6B7078",
}
ALPHA = {"entente": 0.62, "entente_later": 0.30, "central": 0.66, "central_later": 0.32, "neutral": 0.0}


def side(name):
    if name in ENTENTE: return "entente"
    if name in ENTENTE_LATER: return "entente_later"
    if name in CENTRAL: return "central"
    if name in CENTRAL_LATER: return "central_later"
    return "neutral"


def rings_of(geom):
    t = geom["type"]
    if t == "Polygon":
        return [geom["coordinates"]]
    if t == "MultiPolygon":
        return geom["coordinates"]
    return []


def poly_path(polys, fwd):
    verts, codes = [], []
    for poly in polys:
        for ring in poly:
            a = np.asarray(ring, dtype=float)
            if len(a) < 3: continue
            x, y = fwd.transform(a[:, 0], a[:, 1])
            pts = np.column_stack([x, y])
            verts.extend(pts.tolist()); verts.append(pts[0].tolist())
            codes.extend([Path.MOVETO] + [Path.LINETO] * (len(pts) - 1) + [Path.CLOSEPOLY])
    return Path(verts, codes) if verts else None


def shp_polys(reader, bbox):
    out = []
    for sr in reader.iterShapes():
        b = sr.bbox
        if b[2] < bbox[0] or b[0] > bbox[2] or b[3] < bbox[1] or b[1] > bbox[3]:
            continue
        parts = list(sr.parts) + [len(sr.points)]
        rings = [sr.points[parts[i]:parts[i + 1]] for i in range(len(parts) - 1)]
        out.append([rings])
    return out


FRONT_1915_17 = [  # simplified Western Front trench line, north -> south (lon, lat)
    (2.75, 51.13), (2.86, 51.03), (2.92, 50.91), (2.96, 50.86), (2.90, 50.80), (2.92, 50.73), (2.93, 50.68),
    (2.80, 50.58), (2.76, 50.53), (2.79, 50.46), (2.77, 50.37), (2.82, 50.29), (2.62, 50.14), (2.65, 50.08),
    (2.69, 50.05), (2.71, 49.99), (2.79, 49.97), (2.83, 49.94), (2.75, 49.82), (2.79, 49.70), (2.85, 49.59),
    (2.95, 49.55), (3.00, 49.47), (3.33, 49.41), (3.79, 49.44), (3.90, 49.40), (4.02, 49.33), (4.13, 49.23),
    (4.35, 49.20), (4.55, 49.19), (4.78, 49.18), (5.07, 49.20), (5.18, 49.24), (5.24, 49.25), (5.33, 49.27),
    (5.47, 49.25), (5.62, 49.10), (5.58, 49.07), (5.57, 48.97), (5.54, 48.89), (5.63, 48.87), (5.79, 48.87),
    (5.84, 48.88), (5.95, 48.90), (6.06, 48.92), (6.23, 48.89), (6.53, 48.73), (6.84, 48.59), (6.90, 48.50),
    (6.98, 48.39), (7.10, 48.30), (7.10, 48.16), (7.16, 47.86), (7.13, 47.80), (7.15, 47.62), (7.17, 47.50)]


def render(name, proj, box, width, height, out_dir, front=None):
    global SR
    fwd = Transformer.from_crs("EPSG:4326", proj, always_xy=True)
    inv = Transformer.from_crs(proj, "EPSG:4326", always_xy=True)
    lon0, lat0, lon1, lat1 = box
    # projected bounds of the geographic box, expanded to the requested aspect
    lons = np.concatenate([np.linspace(lon0, lon1, 60), np.full(60, lon1), np.linspace(lon1, lon0, 60), np.full(60, lon0)])
    lats = np.concatenate([np.full(60, lat0), np.linspace(lat0, lat1, 60), np.full(60, lat1), np.linspace(lat1, lat0, 60)])
    X, Y = fwd.transform(lons, lats)
    cx, cy = (X.min() + X.max()) / 2, (Y.min() + Y.max()) / 2
    w, h = X.max() - X.min(), Y.max() - Y.min()
    aspect = width / height
    if w / h > aspect: h = w / aspect
    else: w = h * aspect
    x0, x1, y0, y1 = cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2

    # --- relief shading sampled from the equirectangular SR_HR raster
    if SR is None:
        SR = np.asarray(Image.open("/root/maps/SR_HR.tif"), dtype=np.uint8)
    shade = np.empty((height, width), dtype=np.float32)
    xs = x0 + (np.arange(width) + 0.5) * (x1 - x0) / width
    for r0 in range(0, height, 256):
        r1 = min(height, r0 + 256)
        ys = y1 - (np.arange(r0, r1) + 0.5) * (y1 - y0) / height
        gx, gy = np.meshgrid(xs, ys)
        lo, la = inv.transform(gx, gy)
        col = np.clip((lo + 180) / 360 * SR.shape[1] - 0.5, 0, SR.shape[1] - 1.001)
        row = np.clip((90 - la) / 180 * SR.shape[0] - 0.5, 0, SR.shape[0] - 1.001)
        from scipy import ndimage as _nd
        shade[r0:r1] = _nd.map_coordinates(SR, [row.ravel(), col.ravel()], order=1, mode="nearest").reshape(row.shape)
    shade = np.clip((shade - 206.0) / 60.0, -1, 1)  # 206 = flat

    dpi = 100
    fig = plt.figure(figsize=(width / dpi, height / dpi), dpi=dpi)
    ax = fig.add_axes([0, 0, 1, 1]); ax.set_axis_off()
    ax.set_xlim(x0, x1); ax.set_ylim(y0, y1)

    geo_bbox = (lon0 - 25, lat0 - 15, lon1 + 25, lat1 + 15)
    # land mask
    land_polys = shp_polys(shapefile.Reader("/root/maps/ne_10m_land"), geo_bbox)
    lake_polys = shp_polys(shapefile.Reader("/root/maps/ne_10m_lakes"), geo_bbox)

    def mask_of(polys):
        f2 = plt.figure(figsize=(width / dpi, height / dpi), dpi=dpi)
        a2 = f2.add_axes([0, 0, 1, 1]); a2.set_axis_off(); a2.set_xlim(x0, x1); a2.set_ylim(y0, y1)
        f2.patch.set_facecolor("black")
        for p in polys:
            pp = poly_path(p, fwd)
            if pp is not None: a2.add_patch(PathPatch(pp, facecolor="white", edgecolor="none", antialiased=True))
        f2.canvas.draw()
        m = np.asarray(f2.canvas.buffer_rgba())[:, :, 0].astype(np.float32) / 255.0
        plt.close(f2)
        return m
    land = mask_of(land_polys) * (1 - mask_of(lake_polys))

    ocean = np.array(COL["ocean"], dtype=np.float32)
    landc = np.array(COL["land"], dtype=np.float32)
    yy, xx = np.mgrid[0:height, 0:width]
    rr = np.sqrt(((xx - width / 2) / (width / 2)) ** 2 + ((yy - height / 2) / (height / 2)) ** 2)
    vign = np.clip(1.10 - 0.30 * rr, 0.65, 1.10)[..., None].astype(np.float32)
    del yy, xx, rr
    sh = shade[..., None]
    lit = landc[None, None, :] * (1 + 0.85 * sh)

    gj = json.load(open("/home/user/aourednik/historical-basemaps/geojson/world_1914.geojson"))

    def layer(draw_fn):
        f2 = plt.figure(figsize=(width / dpi, height / dpi), dpi=dpi)
        a2 = f2.add_axes([0, 0, 1, 1]); a2.set_axis_off(); a2.set_xlim(x0, x1); a2.set_ylim(y0, y1)
        f2.patch.set_facecolor("black"); a2.set_facecolor("black")
        draw_fn(a2)
        f2.canvas.draw()
        m = np.asarray(f2.canvas.buffer_rgba())[:, :, :3].astype(np.float32) / 255.0
        plt.close(f2)
        return m

    def draw_fill(a2):
        for f in gj["features"]:
            s_ = side(f["properties"].get("NAME") or "")
            if s_ == "neutral": continue
            pp = poly_path(rings_of(f["geometry"]), fwd)
            if pp is None: continue
            a2.add_patch(PathPatch(pp, facecolor=COL[s_], edgecolor=COL[s_], linewidth=0.8, antialiased=True))
    def draw_alpha(a2):
        for f in gj["features"]:
            s_ = side(f["properties"].get("NAME") or "")
            if s_ == "neutral": continue
            pp = poly_path(rings_of(f["geometry"]), fwd)
            if pp is None: continue
            g = ALPHA[s_]
            a2.add_patch(PathPatch(pp, facecolor=(g, g, g), edgecolor=(g, g, g), linewidth=0.8, antialiased=True))
    def draw_cov(a2):
        for f in gj["features"]:
            pp = poly_path(rings_of(f["geometry"]), fwd)
            if pp is None: continue
            a2.add_patch(PathPatch(pp, facecolor="white", edgecolor="white", linewidth=0.8, antialiased=True))
    # shared (land) borders only: boundary of A lying inside a thin buffer of B
    from shapely.geometry import shape
    feats = []
    for f in gj["features"]:
        try:
            g = shape(f["geometry"]).buffer(0)
        except Exception:
            continue
        if g.is_empty: continue
        b = g.bounds
        if b[2] < geo_bbox[0] or b[0] > geo_bbox[2] or b[3] < geo_bbox[1] or b[1] > geo_bbox[3]: continue
        feats.append(g)
    shared = []
    for i in range(len(feats)):
        for j in range(i + 1, len(feats)):
            a, b = feats[i], feats[j]
            ba, bb = a.bounds, b.bounds
            if ba[2] < bb[0] or bb[2] < ba[0] or ba[3] < bb[1] or bb[3] < ba[1]: continue
            seg = a.boundary.intersection(b.buffer(0.04))
            if not seg.is_empty: shared.append(seg)
    def draw_borders(a2):
        for seg in shared:
            geoms = getattr(seg, "geoms", [seg])
            for g in geoms:
                if g.geom_type == "LineString":
                    c = np.asarray(g.coords)
                    if len(c) < 2: continue
                    x, y = fwd.transform(c[:, 0], c[:, 1])
                    a2.plot(x, y, color="white", linewidth=width / 2800, solid_capstyle="round")
    def draw_rivers(a2):
        rv = shapefile.Reader("/root/maps/ne_10m_rivers_lake_centerlines")
        for sr, rec in zip(rv.iterShapes(), rv.iterRecords()):
            b = sr.bbox
            if b[2] < geo_bbox[0] or b[0] > geo_bbox[2] or b[3] < geo_bbox[1] or b[1] > geo_bbox[3]: continue
            if rec["scalerank"] > 8 and rec["name"] not in ("Marne", "Somme", "Meuse", "Aisne", "Oise"): continue
            parts = list(sr.parts) + [len(sr.points)]
            for i in range(len(parts) - 1):
                a = np.asarray(sr.points[parts[i]:parts[i + 1]], dtype=float)
                if len(a) < 2: continue
                x, y = fwd.transform(a[:, 0], a[:, 1])
                lw = width / 1900 if rec["name"] == "Marne" else width / 3600
                a2.plot(x, y, color="white", linewidth=lw, solid_capstyle="round")
    def draw_grat(a2):
        for lo in range(-40, 70, 5):
            la = np.linspace(20, 75, 200); x, y = fwd.transform(np.full_like(la, lo), la); a2.plot(x, y, color="white", linewidth=width / 5000)
        for la in range(25, 80, 5):
            lo = np.linspace(-40, 70, 400); x, y = fwd.transform(lo, np.full_like(lo, la)); a2.plot(x, y, color="white", linewidth=width / 5000)

    fillc = layer(draw_fill)
    alpha = layer(draw_alpha)[..., :1]
    cov = layer(draw_cov)[..., 0]
    # fill coastal gaps (coarse 1914 polygons vs precise coastline) from the nearest covered pixel
    from scipy import ndimage
    dist, (iy, ix) = ndimage.distance_transform_edt(cov < 0.98, return_indices=True)
    gap = (cov < 0.98) & (dist < width / 28)
    fillc[gap] = fillc[iy[gap], ix[gap]]
    alpha[gap] = alpha[iy[gap], ix[gap]]
    alpha = alpha * land[..., None]
    tint = fillc * (0.66 + 0.45 * sh)
    land_rgb = lit * (1 - alpha) + tint * alpha
    rgb = (ocean[None, None, :] * vign) * (1 - land[..., None]) + land_rgb * land[..., None]
    grat = layer(draw_grat)[..., :1] * (1 - land[..., None])
    rgb = rgb + grat * 0.05
    riv = layer(draw_rivers)[..., :1] * land[..., None]
    rgb = rgb * (1 - riv * 0.55) + np.array([0.42, 0.66, 0.90])[None, None, :] * riv * 0.55
    bor = layer(draw_borders)[..., :1] * land[..., None]
    rgb = rgb * (1 - bor * 0.55) + np.array([0.95, 0.93, 0.88])[None, None, :] * bor * 0.55
    ax.imshow(np.clip(rgb, 0, 1), extent=(x0, x1, y0, y1), origin="upper", zorder=0, interpolation="bilinear")
    if front:
        a = np.asarray(front, dtype=float)
        fx, fy = fwd.transform(a[:, 0], a[:, 1])
        for lw, al in ((width / 170, 0.06), (width / 330, 0.12), (width / 700, 0.35)):
            ax.plot(fx, fy, color="#FF453A", alpha=al, linewidth=lw, solid_capstyle="round", solid_joinstyle="round", zorder=5)
        ax.plot(fx, fy, color="#FF6B5E", linewidth=width / 1500, solid_capstyle="round", solid_joinstyle="round", zorder=6)

    fig.savefig(f"{out_dir}/{name}.png", dpi=dpi, facecolor="black")
    plt.close(fig)
    Image.open(f"{out_dir}/{name}.png").convert("RGB").save(f"{out_dir}/{name}.jpg", quality=88, optimize=True)
    meta = {"proj": proj, "bounds": [x0, y0, x1, y1], "width": width, "height": height}
    json.dump(meta, open(f"{out_dir}/{name}.json", "w"))
    print(name, meta)


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "/root/maps/out"
    import os; os.makedirs(out, exist_ok=True)
    # Europe overview (slides 2, 3, 8)
    if len(sys.argv) > 2 and sys.argv[2] == "west": pass
    else: render("europe1914", "+proj=laea +lat_0=51 +lon_0=16 +datum=WGS84", (-10.5, 36.0, 42.0, 61.5), 5600, 3150, out)
    # Western Europe detail (slides 10, 11)
    render("west1914", "+proj=laea +lat_0=52 +lon_0=4.5 +datum=WGS84", (-4.0, 46.8, 12.5, 57.2), 5600, 3150, out, front=FRONT_1915_17)
