// Round Telegram watermark frames: transparent centre for a photo, handle along the top arc.
const fs = require("fs");
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const fp = "/root/intro/node_modules/@fontsource";
const B = (p) => fs.readFileSync(`${fp}/${p}`).toString("base64");
const HANDLE = "@astazia_karina_18";
const S = 2048, C = S / 2, RO = 1000, RI = 720, RM = (RO + RI) / 2;
const FONTS = {
  Mont: "montserrat/files/montserrat-latin-800-normal.woff2",
  Comf: "comfortaa/files/comfortaa-latin-700-normal.woff2",
  Unb: "unbounded/files/unbounded-latin-700-normal.woff2",
};
const css = Object.entries(FONTS).map(([n, p]) => `@font-face{font-family:${n};src:url(data:font/woff2;base64,${B(p)})}`).join("");
const polar = (r, deg) => [C + r * Math.sin(deg * Math.PI / 180), C - r * Math.cos(deg * Math.PI / 180)];   // 0° = top, clockwise
const f1 = (n) => n.toFixed(1);
const stops = (arr) => arr.map((c, i) => `<stop offset="${(i / (arr.length - 1)).toFixed(3)}" stop-color="${c}"/>`).join("");
const star = (x, y, r, fill, extra = "") => { const k = r * 0.2; return `<path d="M${f1(x)} ${f1(y - r)} Q${f1(x + k)} ${f1(y - k)} ${f1(x + r)} ${f1(y)} Q${f1(x + k)} ${f1(y + k)} ${f1(x)} ${f1(y + r)} Q${f1(x - k)} ${f1(y + k)} ${f1(x - r)} ${f1(y)} Q${f1(x - k)} ${f1(y - k)} ${f1(x)} ${f1(y - r)}Z" fill="${fill}" ${extra}/>`; };
const TG_PATH = "M54.3 118.8c35-15.2 58.3-25.3 70-30.2 33.3-13.9 40.3-16.3 44.8-16.4 1 0 3.2.2 4.7 1.4 1.2 1 1.5 2.3 1.7 3.3s.4 3.1.2 4.7c-1.8 19-9.6 65.1-13.6 86.3-1.7 9-5 12-8.2 12.3-7 .6-12.3-4.6-19-9-10.6-6.9-16.5-11.2-26.8-18-11.9-7.8-4.2-12.1 2.6-19.1 1.8-1.8 32.5-29.8 33.1-32.3.1-.3.1-1.5-.6-2.1-.7-.6-1.7-.4-2.5-.2-1.1.2-17.9 11.4-50.6 33.5-4.8 3.3-9.1 4.9-13 4.8-4.3-.1-12.5-2.4-18.7-4.4-7.5-2.4-13.5-3.7-13-7.9.3-2.2 3.3-4.4 8.9-6.7z";
function tgBadge(ring, opts = {}) {
  const [x, y] = polar(RM, 180), s = opts.scale || 1;
  const inner = opts.neon
    ? `<circle cx="120" cy="120" r="112" fill="#0b0612"/><path transform="translate(-6 0)" fill="none" stroke="#7ff3ff" stroke-width="7" stroke-linejoin="round" d="${TG_PATH}" filter="url(#glowC)"/><path transform="translate(-6 0)" fill="#e9fdff" d="${TG_PATH}"/>`
    : `<circle cx="120" cy="120" r="112" fill="url(#tgGrad)"/><path transform="translate(-6 0)" fill="#fff" d="${TG_PATH}"/>`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s}) translate(-120 -120)"><circle cx="120" cy="120" r="128" fill="${ring}" filter="url(#sh)" ${opts.neon ? 'stroke="#ff4fd8" stroke-width="6"' : ""}/>${inner}</g>`;
}
const COMMON_DEFS = `
  <linearGradient id="tgGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#37BBFE"/><stop offset="1" stop-color="#007DBB"/></linearGradient>
  <radialGradient id="inner" cx="0.5" cy="0.5" r="0.5"><stop offset="${((RI - 50) / RI).toFixed(3)}" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.32"/></radialGradient>
  <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.2"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.45"/></filter>
  <filter id="tsh" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity="0.55"/></filter>
  <mask id="ring"><rect width="${S}" height="${S}" fill="#000"/><circle cx="${C}" cy="${C}" r="${RO}" fill="#fff"/><circle cx="${C}" cy="${C}" r="${RI}" fill="#000"/></mask>`;
const arcPath = (r) => `M ${C - r} ${C} A ${r} ${r} 0 1 1 ${C + r} ${C} A ${r} ${r} 0 1 1 ${C - r} ${C}`;
// text on the top arc; style = {font,size,spacing,fill,stroke,strokeW,filter}
function arcText(t) {
  return `<path id="arcTop" d="${arcPath(t.r)}" fill="none"/>
  <text font-family="${t.font}" font-size="${t.size}" letter-spacing="${t.spacing}" fill="${t.fill}" ${t.stroke ? `stroke="${t.stroke}" stroke-width="${t.strokeW}" stroke-linejoin="round" paint-order="stroke"` : ""} ${t.filter ? `filter="url(#${t.filter})"` : ""}>
    <textPath href="#arcTop" startOffset="25%" text-anchor="middle">${HANDLE}</textPath></text>`;
}
// degrees spanned by the handle (half-span), from measured width
const halfSpan = (w, r) => (w / r) * 180 / Math.PI / 2;
const ringDots = (r, from, to, step, fill, big = 5, small = 3, op = 0.75) => { let s = ""; for (let a = from; a <= to + 1e-6; a += step) { const [x, y] = polar(r, a), isBig = Math.round((a - from) / step) % 5 === 0;
  s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${isBig ? big : small}" fill="${fill}" opacity="${isBig ? 1 : op}"/>`; } return s; };

// ---------------- classic family (better legibility) ----------------
function classic(v, m, withTg) {
  const T = { font: "Mont", size: 132, spacing: 8, r: RM - 46 };
  const hs = halfSpan(m(T), T.r) + 7, metal = "url(#metal)";
  const sideFrom = hs + 8, botGap = withTg ? 17 : 0;
  let deco = ringDots(RM, sideFrom, 180 - botGap - 8, 3.6, v.dots, 9, 5) + ringDots(RM, 180 + botGap + 8, 360 - sideFrom, 3.6, v.dots, 9, 5);
  for (const a of [-hs, hs]) { const [x, y] = polar(RM, a); deco += star(x, y, 32, v.dots); }
  if (withTg) for (const a of [180 - botGap - 2, 180 + botGap + 2]) { const [x, y] = polar(RM, a); deco += star(x, y, 22, v.dots); }
  return { defs: `<linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">${stops(v.metal)}</linearGradient><radialGradient id="band" cx="0.38" cy="0.3" r="0.85">${stops(v.band)}</radialGradient>`,
    body: `<g filter="url(#sh)"><rect width="${S}" height="${S}" fill="url(#band)" mask="url(#ring)"/></g>
  <circle cx="${C}" cy="${C}" r="${RO}" fill="url(#gloss)" mask="url(#ring)"/>
  <circle cx="${C}" cy="${C}" r="${RI}" fill="url(#inner)"/>
  <circle cx="${C}" cy="${C}" r="${RO - 9}" fill="none" stroke="${metal}" stroke-width="18"/>
  <circle cx="${C}" cy="${C}" r="${RO - 32}" fill="none" stroke="${metal}" stroke-width="4"/>
  <circle cx="${C}" cy="${C}" r="${RI + 9}" fill="none" stroke="${metal}" stroke-width="18"/>
  <circle cx="${C}" cy="${C}" r="${RI + 32}" fill="none" stroke="${metal}" stroke-width="4"/>
  ${deco}${arcText({ ...T, fill: v.text, stroke: v.stroke, strokeW: 12, filter: v.shadow ? "tsh" : "" })}${withTg ? tgBadge(metal) : ""}` };
}
const CLASSIC = {
  burgundy: { band: ["#4a0f22", "#8c2648", "#5e1430"], metal: ["#8a5a14", "#f8e6a0", "#c8963e", "#fff4cf", "#9c6d22"], text: "#fff1c9", stroke: "#3a0a18", shadow: true, dots: "#f3d98f" },
  black: { band: ["#050505", "#2b2b2b", "#0d0d0d"], metal: ["#8a5a14", "#f8e6a0", "#c8963e", "#fff4cf", "#9c6d22"], text: "#f9e3a3", stroke: "#000000", shadow: true, dots: "#e9cf86" },
  powder: { band: ["#e9b3bf", "#fbe3e7", "#e6a9b7"], metal: ["#9b5560", "#f6d2c4", "#c27f86", "#ffe9df", "#a8636c"], text: "#6e1736", stroke: "#fff4f6", shadow: false, dots: "#ffffff" },
  lavender: { band: ["#3b2a63", "#7a62b8", "#4a3678"], metal: ["#7d7f8c", "#ffffff", "#b9bcc8", "#f4f5fa", "#8d909c"], text: "#ffffff", stroke: "#2a1b4d", shadow: true, dots: "#ffffff" },
};

// ---------------- unusual ----------------
function neon(m, withTg) {
  const T = { font: "Unb", size: 100, spacing: 6, r: RM - 34 };
  const hs = halfSpan(m(T), T.r) + 7;
  let deco = "";
  for (const a of [-hs, hs]) { const [x, y] = polar(RM, a); deco += star(x, y, 30, "#fff", 'filter="url(#glowP)"'); }
  for (let a = hs + 14; a < 360 - hs - 10; a += 9) { if (withTg && Math.abs(a - 180) < 20) continue; const [x, y] = polar(RM, a); deco += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${Math.round(a) % 27 < 9 ? 7 : 4}" fill="#7ff3ff" filter="url(#glowC)"/>`; }
  const tube = (r, col, glow, w) => `<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="${col}" stroke-width="${w * 2.2}" opacity="0.55" filter="url(#${glow})"/><circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="${col}" stroke-width="${w}" filter="url(#${glow})"/><circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="#fff" stroke-width="${w * 0.4}" opacity="0.9"/>`;
  return { defs: `
    <radialGradient id="band" cx="0.5" cy="0.5" r="0.5"><stop offset="0.7" stop-color="#1a0b2b"/><stop offset="0.86" stop-color="#0c0616"/><stop offset="1" stop-color="#1a0b2b"/></radialGradient>
    <filter id="glowP" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" result="b"/><feFlood flood-color="#ff3fd2"/><feComposite in2="b" operator="in" result="c"/><feMerge><feMergeNode in="c"/><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glowC" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" result="b"/><feFlood flood-color="#37e6ff"/><feComposite in2="b" operator="in" result="c"/><feMerge><feMergeNode in="c"/><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glowT" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="12" result="b"/><feFlood flood-color="#ff2fcf"/><feComposite in2="b" operator="in" result="c"/><feMerge><feMergeNode in="c"/><feMergeNode in="c"/><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    body: `<rect width="${S}" height="${S}" fill="url(#band)" mask="url(#ring)" filter="url(#sh)"/>
    <circle cx="${C}" cy="${C}" r="${RI}" fill="url(#inner)"/>
    ${tube(RO - 16, "#ff4fd8", "glowP", 10)}${tube(RI + 14, "#37e6ff", "glowC", 9)}${deco}
    ${arcText({ ...T, fill: "#fff4fd", stroke: "#ff4fd8", strokeW: 5, filter: "glowT" })}${withTg ? tgBadge("#0b0612", { neon: true }) : ""}` };
}
function holoImage() {   // pastel holographic conic gradient, made once with canvas in the page
  return `(() => { const c = document.createElement("canvas"); c.width = c.height = ${S}; const g = c.getContext("2d");
    const cg = g.createConicGradient(-Math.PI / 2, ${C}, ${C}); const cols = ["#ffc4ec","#c9b8ff","#9fe6ff","#b8ffe0","#fff4ad","#ffc9a8","#ffc4ec","#bba9ff","#9fe6ff","#c7ffd8","#ffe7b0","#ffc4ec"];
    cols.forEach((col, i) => cg.addColorStop(i / (cols.length - 1), col)); g.fillStyle = cg; g.fillRect(0, 0, ${S}, ${S});
    const rg = g.createRadialGradient(${C}, ${C}, ${RI}, ${C}, ${C}, ${RO}); rg.addColorStop(0, "rgba(255,255,255,0.0)"); rg.addColorStop(0.5, "rgba(255,255,255,0.35)"); rg.addColorStop(1, "rgba(255,255,255,0.0)");
    g.fillStyle = rg; g.fillRect(0, 0, ${S}, ${S}); return c.toDataURL("image/png"); })()`;
}
function holo(m, withTg, holoURL) {
  const T = { font: "Unb", size: 112, spacing: 6, r: RM - 40 };
  const hs = halfSpan(m(T), T.r) + 7;
  let deco = "";
  for (const a of [-hs, hs]) { const [x, y] = polar(RM, a); deco += star(x, y, 34, "#fff", 'filter="url(#sh)"'); }
  const r2 = (a) => polar(RM, a);
  for (let a = hs + 16; a < 360 - hs - 10; a += 24) { if (withTg && Math.abs(a - 180) < 22) continue; const [x, y] = r2(a); deco += star(x, y, a % 48 < 24 ? 16 : 11, "#ffffff", 'opacity="0.95"'); }
  return { defs: `<linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">${stops(["#d9dbe6", "#ffffff", "#b6b9cc", "#ffffff", "#c6c9da"])}</linearGradient>`,
    body: `<g filter="url(#sh)"><image href="${holoURL}" x="0" y="0" width="${S}" height="${S}" mask="url(#ring)"/></g>
    <circle cx="${C}" cy="${C}" r="${RO}" fill="url(#gloss)" mask="url(#ring)"/>
    <circle cx="${C}" cy="${C}" r="${RI}" fill="url(#inner)"/>
    <circle cx="${C}" cy="${C}" r="${RO - 8}" fill="none" stroke="url(#chrome)" stroke-width="16"/>
    <circle cx="${C}" cy="${C}" r="${RI + 8}" fill="none" stroke="url(#chrome)" stroke-width="16"/>
    ${deco}${arcText({ ...T, fill: "#ffffff", stroke: "#4b2f86", strokeW: 16, filter: "tsh" })}${withTg ? tgBadge("url(#chrome)") : ""}` };
}
function floral(m, withTg) {
  const T = { font: "Mont", size: 120, spacing: 8, r: RM - 40 };
  const hs = halfSpan(m(T), T.r) + 6;
  const leaf = (a, r, rot, len, w, col) => { const [x, y] = polar(r, a);
    return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(a + rot)})"><path d="M0 0 Q${w} ${-len * 0.5} 0 ${-len} Q${-w} ${-len * 0.5} 0 0Z" fill="${col}"/><path d="M0 -4 L0 ${-len * 0.85}" stroke="#ffffff" stroke-opacity="0.35" stroke-width="3"/></g>`; };
  const flower = (a, r, size, petal, center) => { const [x, y] = polar(r, a); let s = `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(a * 2.3)})">`;
    for (let k = 0; k < 5; k++) s += `<ellipse cx="0" cy="${-size * 0.55}" rx="${size * 0.42}" ry="${size * 0.6}" fill="url(#${petal})" transform="rotate(${k * 72})"/>`;
    return s + `<circle r="${size * 0.28}" fill="${center}"/><circle r="${size * 0.12}" cx="${-size * 0.06}" cy="${-size * 0.06}" fill="#fff6c8"/></g>`; };
  let wreath = "", buds = "";
  const from = hs + 6, to = 360 - hs - 6, skip = (a) => withTg && Math.abs(a - 180) < 16;
  for (let a = from; a <= to; a += 5.5) { if (skip(a)) continue; const out = Math.round(a / 5.5) % 2;
    wreath += leaf(a, RM + (out ? 18 : -18), out ? 55 : 125, 100, 32, out ? "#5f8f62" : "#7fae79"); }
  let i = 0;
  for (let a = from + 6; a <= to - 4; a += 17, i++) { if (skip(a)) continue;
    wreath += i % 3 === 2 ? flower(a, RM, 46, "petW", "#f4c04e") : flower(a, RM + (i % 2 ? 8 : -8), i % 3 ? 66 : 76, i % 3 ? "petP" : "petR", "#f0b43a"); }
  for (let a = from + 14; a <= to - 4; a += 34) { if (skip(a)) continue; const [x, y] = polar(RM + 48, a); buds += `<circle cx="${f1(x)}" cy="${f1(y)}" r="9" fill="#f6a6bd"/>`; const [x2, y2] = polar(RM - 50, a + 7); buds += `<circle cx="${f1(x2)}" cy="${f1(y2)}" r="7" fill="#ffffff"/>`; }
  return { defs: `<radialGradient id="band" cx="0.4" cy="0.3" r="0.9">${stops(["#fffaf5", "#fbeee9", "#f6e0dc"])}</radialGradient>
    <radialGradient id="petP" cx="0.5" cy="0.8" r="0.9">${stops(["#ffffff", "#f8b7c9", "#ee7f9f"])}</radialGradient>
    <radialGradient id="petR" cx="0.5" cy="0.8" r="0.9">${stops(["#ffe9ef", "#f08aa6", "#d44f78"])}</radialGradient>
    <radialGradient id="petW" cx="0.5" cy="0.8" r="0.9">${stops(["#ffffff", "#fff7f2", "#f2dfe6"])}</radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">${stops(["#b88a4a", "#f6e2b3", "#c99a5b", "#fff1d0", "#ad7f40"])}</linearGradient>`,
    body: `<g filter="url(#sh)"><rect width="${S}" height="${S}" fill="url(#band)" mask="url(#ring)"/></g>
    <circle cx="${C}" cy="${C}" r="${RI}" fill="url(#inner)"/>
    <circle cx="${C}" cy="${C}" r="${RO - 6}" fill="none" stroke="url(#gold)" stroke-width="12"/>
    <circle cx="${C}" cy="${C}" r="${RI + 6}" fill="none" stroke="url(#gold)" stroke-width="12"/>
    <g filter="url(#sh)">${wreath}</g>${buds}
    ${arcText({ ...T, fill: "#2f5a37", stroke: "#ffffff", strokeW: 12 })}${withTg ? tgBadge("url(#gold)") : ""}` };
}
function pearl(m, withTg) {
  const T = { font: "Mont", size: 120, spacing: 8, r: RM - 34 };
  const hs = halfSpan(m(T), T.r) + 6;
  // scalloped lace edge
  const n = 56, rA = RO - 34; let d = "";
  for (let k = 0; k < n; k++) { const a0 = k * 360 / n, a1 = (k + 1) * 360 / n, [x0, y0] = polar(rA, a0), [x1, y1] = polar(rA, a1), ch = Math.hypot(x1 - x0, y1 - y0) / 2;
    d += (k ? "" : `M${f1(x0)} ${f1(y0)} `) + `A${f1(ch)} ${f1(ch)} 0 0 1 ${f1(x1)} ${f1(y1)} `; }
  let holes = ""; for (let k = 0; k < n; k++) { const [x, y] = polar(rA + 4, (k + 0.5) * 360 / n); holes += `<circle cx="${f1(x)}" cy="${f1(y)}" r="9" fill="#000"/>`; const [x2, y2] = polar(rA - 22, k * 360 / n); holes += `<circle cx="${f1(x2)}" cy="${f1(y2)}" r="5" fill="#000"/>`; }
  let pearls = ""; const pr = RI + 26, cnt = Math.round(2 * Math.PI * pr / 38);
  for (let k = 0; k < cnt; k++) { const [x, y] = polar(pr, k * 360 / cnt); pearls += `<circle cx="${f1(x)}" cy="${f1(y)}" r="17.5" fill="url(#pearl)"/>`; }
  let big = ""; for (let a = hs + 12; a < 360 - hs - 8; a += 12) { if (withTg && Math.abs(a - 180) < 18) continue; const [x, y] = polar(RM + 30, a); big += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${Math.round(a) % 36 < 12 ? 15 : 10}" fill="url(#pearl)"/>`; }
  for (const a of [-hs, hs]) { const [x, y] = polar(RM + 6, a); big += `<circle cx="${f1(x)}" cy="${f1(y)}" r="26" fill="url(#pearl)"/>`; }
  return { defs: `<radialGradient id="satin" cx="0.35" cy="0.25" r="0.95">${stops(["#ffffff", "#fbf3f5", "#efdbe2", "#f9eef1"])}</radialGradient>
    <radialGradient id="pearl" cx="0.35" cy="0.3" r="0.75">${stops(["#ffffff", "#f6eef4", "#dccfdc", "#b9a9bd"])}</radialGradient>
    <linearGradient id="rose" x1="0" y1="0" x2="1" y2="1">${stops(["#9b5560", "#f6d2c4", "#c27f86", "#ffe9df", "#a8636c"])}</linearGradient>
    <mask id="lace"><rect width="${S}" height="${S}" fill="#000"/><path d="${d}Z" fill="#fff"/><circle cx="${C}" cy="${C}" r="${RI}" fill="#000"/>${holes}</mask>`,
    body: `<g filter="url(#sh)"><rect width="${S}" height="${S}" fill="url(#satin)" mask="url(#lace)"/></g>
    <circle cx="${C}" cy="${C}" r="${RI}" fill="url(#inner)"/>
    <circle cx="${C}" cy="${C}" r="${rA - 40}" fill="none" stroke="url(#rose)" stroke-width="4"/>
    <circle cx="${C}" cy="${C}" r="${RI + 6}" fill="none" stroke="url(#rose)" stroke-width="10"/>
    <g filter="url(#sh)">${pearls}${big}</g>
    ${arcText({ ...T, fill: "#7a3348", stroke: "#ffffff", strokeW: 10 })}${withTg ? tgBadge("url(#rose)") : ""}` };
}

(async () => {
  const br = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const pg = await br.newPage({ viewport: { width: S, height: S } });
  await pg.setContent(`<style>${css}</style><div style="font-family:Mont">a</div><div style="font-family:Comf">a</div><div style="font-family:Unb">a</div>`);
  await pg.evaluate(async () => { await Promise.all(["Mont", "Comf", "Unb"].map((f) => document.fonts.load(`100px ${f}`, "@astazia_karina_18"))); });
  const widths = {};
  for (const [font, size, sp] of [["Mont", 132, 8], ["Mont", 120, 8], ["Unb", 112, 6], ["Unb", 100, 6]])
    widths[`${font}|${size}|${sp}`] = await pg.evaluate(([f, s, l, h]) => { const c = document.createElement("canvas").getContext("2d"); c.font = `${s}px ${f}`; c.letterSpacing = `${l}px`; return c.measureText(h).width; }, [font, size, sp, HANDLE]);
  const m = (t) => widths[`${t.font}|${t.size}|${t.spacing}`];
  const holoURL = await pg.evaluate(holoImage());
  const jobs = { ...Object.fromEntries(Object.entries(CLASSIC).map(([k, v]) => [k, (tg) => classic(v, m, tg)])),
    neon: (tg) => neon(m, tg), holo: (tg) => holo(m, tg, holoURL), floral: (tg) => floral(m, tg), pearl: (tg) => pearl(m, tg) };
  fs.mkdirSync("out2", { recursive: true });
  for (const [k, fn] of Object.entries(jobs)) for (const tg of [true, false]) {
    const { defs, body } = fn(tg);
    await pg.setContent(`<style>${css}html,body{margin:0;background:transparent}</style><svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><defs>${COMMON_DEFS}${defs}</defs>${body}</svg>`);
    await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(120);
    await pg.screenshot({ path: `out2/frame_${k}${tg ? "" : "_notg"}.png`, omitBackground: true, clip: { x: 0, y: 0, width: S, height: S } });
  }
  await br.close();
})();
