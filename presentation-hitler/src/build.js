// Documentary redesign of "Адольф Гитлер. До политической карьеры (1889–1919)".
// Text and speaker notes come verbatim from the original deck (content.json).
const fs = require("fs"), path = require("path");
const pptxgen = require("pptxgenjs");
const A = (f) => path.join("/root/deckwork/assets", f);
const C = JSON.parse(fs.readFileSync("/root/deckwork/content.json", "utf8"));
const OUT = process.argv[2] || "/root/deckwork/build/raw.pptx";

const W = 13.333, H = 7.5, ML = 0.75;
const COL = { bg: "0F0E0D", ink: "F3EEE6", body: "D8D2C6", muted: "9E978C", dim: "6E6A63", gold: "C9A15B", line: "3A3632", tick: "57514A", print: "E7E0D2", capt: "B9B2A6" };
const HEAD = "Cambria", BODY = "Calibri";
const TL = { x0: ML, x1: W - ML, y: 7.0 };
const pos = (yr) => TL.x0 + (TL.x1 - TL.x0) * (yr - 1889) / 30;
const CHAPTERS = [1889, 1899, 1907, 1910, 1912, 1913, 1914, 1916, 1918, 1919];

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Адольф Гитлер. До политической карьеры (1889–1919)";
pres.author = "Пономарев Глеб, 10В класс";
pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };

// ---------- helpers ----------
const runs = (paras, base, opts = {}) => {
  const out = [];
  paras.forEach((p, pi) => p.forEach((r, ri) => out.push({ text: r.t, options: { color: r.gold ? COL.gold : base, ...(opts.goldBold && r.gold ? { bold: true } : {}), ...(ri === p.length - 1 && pi < paras.length - 1 ? { breakLine: true } : {}) } })));
  return out;
};
const T = (s, n) => C[s - 1].shapes[n];
const plain = (s, n) => T(s, n).map((p) => p.map((r) => r.t).join("")).join("\n");
const txt = (slide, text, o) => slide.addText(text, { isTextBox: true, margin: 0, valign: "top", fontFace: BODY, color: COL.body, ...o });
const shadow = (blur = 14, off = 5, op = 0.6) => ({ type: "outer", blur, offset: off, angle: 90, color: "000000", opacity: op });
const img = (slide, f, x, y, w, h, o = {}) => slide.addImage({ path: A(f), x, y, w, h, ...o });

function chrome(slide, n, year) {
  // film-style progress bar: chapter ticks, gold progress and a moving dot (morphs between slides)
  slide.addShape(pres.shapes.LINE, { x: TL.x0, y: TL.y, w: TL.x1 - TL.x0, h: 0, line: { color: COL.line, width: 0.75 }, objectName: "!!tl" });
  CHAPTERS.forEach((c) => slide.addShape(pres.shapes.RECTANGLE, { x: pos(c) - 0.006, y: TL.y - 0.035, w: 0.012, h: 0.07, fill: { color: COL.tick }, line: { type: "none" }, objectName: "!!tk" + c }));
  const px = pos(year);
  slide.addShape(pres.shapes.RECTANGLE, { x: TL.x0, y: TL.y - 0.009, w: Math.max(0.02, px - TL.x0), h: 0.018, fill: { color: COL.gold }, line: { type: "none" }, objectName: "!!tlp" });
  slide.addShape(pres.shapes.OVAL, { x: px - 0.15, y: TL.y - 0.15, w: 0.3, h: 0.3, fill: { color: COL.gold, transparency: 82 }, line: { type: "none" }, objectName: "!!tlh" });
  slide.addShape(pres.shapes.OVAL, { x: px - 0.06, y: TL.y - 0.06, w: 0.12, h: 0.12, fill: { color: COL.gold }, line: { type: "none" }, objectName: "!!tld" });
  txt(slide, String(year), { x: px - 0.5, y: TL.y - 0.36, w: 1.0, h: 0.2, fontSize: 9, bold: true, color: COL.gold, align: "center", charSpacing: 1, objectName: "!!tly" });
  txt(slide, "1889", { x: TL.x0, y: TL.y + 0.1, w: 0.8, h: 0.18, fontSize: 8, color: COL.dim, objectName: "!!tl0" });
  txt(slide, "1919", { x: TL.x1 - 0.8, y: TL.y + 0.1, w: 0.8, h: 0.18, fontSize: 8, color: COL.dim, align: "right", objectName: "!!tl1" });
  txt(slide, `${String(n).padStart(2, "0")} / 15`, { x: W - ML - 1.4, y: 0.34, w: 1.4, h: 0.2, fontSize: 9, bold: true, color: COL.dim, align: "right", charSpacing: 2, objectName: "!!count" });
}
const grain = (slide) => img(slide, "grain.png", 0, 0, W, H, { objectName: "!!grain" });

function head(slide, s, x, w, o = {}) {
  txt(slide, plain(s, "!!year"), { x, y: o.yy ?? 0.42, w, h: 1.0, fontFace: HEAD, fontSize: o.yearSize ?? 60, color: COL.gold, objectName: "!!year" });
  txt(slide, runs(T(s, "!!title"), COL.ink), { x, y: o.ty ?? 1.46, w, h: o.th ?? 0.66, fontFace: HEAD, fontSize: o.titleSize ?? 36, color: COL.ink, italic: !!o.italic, objectName: "!!title", lineSpacingMultiple: 0.95 });
}
function body(slide, s, x, y, w, h, o = {}) {
  txt(slide, runs(T(s, "!!body"), COL.body), { x, y, w, h, fontSize: o.size ?? 16, lineSpacingMultiple: 1.12, objectName: "!!body", ...o.extra });
}
const cap = (slide, s, x, y, w, align = "left", h = 0.36) => txt(slide, runs(T(s, "!!cap"), COL.capt), { x, y, w, h, fontSize: 9, color: COL.capt, align, valign: "bottom", objectName: "!!cap" });
const name2 = (slide, paras, x, y, w) => txt(slide, [
  { text: paras[0].map((r) => r.t).join(""), options: { fontFace: HEAD, fontSize: 16, color: COL.ink, breakLine: true } },
  { text: paras[1].map((r) => r.t).join(""), options: { fontSize: 10.5, color: COL.gold, bold: true, charSpacing: 1 } }], { x, y, w, h: 0.6 });
function print(slide, f, x, y, w, h, rot = 0, border = 0.06) {
  // archival print: light paper border + soft drop shadow
  slide.addShape(pres.shapes.RECTANGLE, { x: x - border, y: y - border, w: w + 2 * border, h: h + 2 * border, fill: { color: COL.print }, line: { type: "none" }, rotate: rot, shadow: shadow(16, 6, 0.65) });
  img(slide, f, x, y, w, h, { rotate: rot });
}
const newSlide = (sec) => { const s = pres.addSlide({ sectionTitle: sec }); s.background = { color: COL.bg }; return s; };
const notes = (slide, n) => slide.addNotes(C[n - 1].notes);

// ---------- sections ----------
const SEC = ["Детство", "Вена", "Мюнхен и фронт", "Итоги"];
SEC.forEach((t) => pres.addSection({ title: t }));

// 1 — title
{ const s = newSlide(SEC[0]);
  txt(s, "1889", { x: 0.45, y: 4.05, w: 8.6, h: 3.0, fontFace: HEAD, fontSize: 230, color: "1B1917", objectName: "!!year" });
  img(s, "cut_title.png", W - 5.83, 0, 5.83, 7.5, { objectName: "hero" });
  img(s, "ov_amb_soft.png", 0, 0, W, H, { objectName: "shade" });
  txt(s, plain(1, "!!title"), { x: ML, y: 1.72, w: 7.4, h: 1.05, fontFace: HEAD, fontSize: 62, color: COL.ink, objectName: "!!title" });
  txt(s, plain(1, "!!body"), { x: ML + 0.02, y: 2.86, w: 6.8, h: 0.5, fontSize: 24, color: "B9B4AA", objectName: "!!body" });
  txt(s, plain(1, "years"), { x: ML + 0.02, y: 3.5, w: 4, h: 0.3, fontSize: 13, bold: true, color: COL.gold, charSpacing: 4 });
  txt(s, plain(1, "author"), { x: ML + 0.02, y: 3.92, w: 6, h: 0.3, fontSize: 14, color: COL.ink });
  cap(s, 1, W - ML - 4.4, 6.3, 4.4, "right");
  chrome(s, 1, 1889); grain(s); notes(s, 1); }

// 2 — family: split portraits bleeding off the right edge
{ const s = newSlide(SEC[0]);
  img(s, "p_alois.jpg", 6.3, 0, 3.49, H); img(s, "ov_split_a.png", 6.3, 0, 3.49, H);
  img(s, "p_klara.jpg", 9.833, 0, 3.5, H); img(s, "ov_split_b.png", 9.833, 0, 3.5, H);
  name2(s, T(2, "c1"), 7.55, 5.55, 2.2); name2(s, T(2, "c2"), 10.1, 5.55, 2.4);
  head(s, 2, ML, 5.62); body(s, 2, ML, 2.42, 5.25, 3.6);
  cap(s, 2, W - ML - 5.2, 6.24, 5.2, "right", 0.3);
  chrome(s, 2, 1889); grain(s); notes(s, 2); }

// 3 — school: class photo bleeds right, Adolf ringed, baby photo as a print
{ const s = newSlide(SEC[0]);
  img(s, "p_school.jpg", 6.0, 0, 7.333, H); img(s, "ov_school.png", 6.0, 0, 7.333, H);
  s.addShape(pres.shapes.OVAL, { x: 9.66 - 0.3, y: 0.49 - 0.3, w: 0.6, h: 0.6, fill: { type: "none" }, line: { color: COL.gold, width: 1.75 }, objectName: "ring" });
  print(s, "a_child.jpg", 6.5, 4.42, 1.45, 1.93, -3);
  head(s, 3, ML, 5.1); body(s, 3, ML, 2.42, 4.95, 3.7);
  cap(s, 3, 8.35, 6.2, W - ML - 8.35, "right", 0.38);
  chrome(s, 3, 1899); grain(s); notes(s, 3); }

// 4 — mother: portrait bleeds off the left edge
{ const s = newSlide(SEC[0]);
  img(s, "p_mother.jpg", 0, 0, 5.9, H); img(s, "ov_mother.png", 0, 0, 5.9, H);
  head(s, 4, 6.7, 5.88); body(s, 4, 6.7, 2.42, 5.6, 3.6);
  cap(s, 4, ML, 6.24, 4.6, "left", 0.3);
  chrome(s, 4, 1907); grain(s); notes(s, 4); }

// 5 — the Academy: full-bleed, the examiners' note as the headline
{ const s = newSlide(SEC[1]);
  img(s, "bg_academy.jpg", 0, 0, W, H); img(s, "ov_hero.png", 0, 0, W, H);
  head(s, 5, ML, 6.6, { italic: true, titleSize: 34, th: 1.62 });
  txt(s, plain(5, "attr"), { x: ML + 0.02, y: 3.2, w: 6.0, h: 0.4, fontSize: 10.5, bold: true, color: COL.gold, charSpacing: 1 });
  body(s, 5, ML, 3.7, 5.6, 2.4);
  cap(s, 5, W - ML - 5.4, 6.24, 5.4, "right", 0.3);
  chrome(s, 5, 1907); grain(s); notes(s, 5); }

// 6 — watercolours on an ambient wall
{ const s = newSlide(SEC[1]);
  img(s, "amb_paint.jpg", 0, 0, W, H); img(s, "ov_amb_soft.png", 0, 0, W, H);
  const h = 4.05, w1 = h * 1406 / 1045, w2 = h * 2301 / 1656, gap = 0.35, x1 = ML, x2 = ML + w1 + gap;
  s.addShape(pres.shapes.RECTANGLE, { x: x1, y: 0.72, w: w1, h, fill: { color: "000000" }, line: { type: "none" }, shadow: shadow(18, 7, 0.7) });
  img(s, "a_oper.jpg", x1, 0.72, w1, h);
  s.addShape(pres.shapes.RECTANGLE, { x: x2, y: 0.72, w: w2, h, fill: { color: "000000" }, line: { type: "none" }, shadow: shadow(18, 7, 0.7) });
  img(s, "a_hof.jpg", x2, 0.72, w2, h);
  txt(s, plain(6, "c1"), { x: x1, y: 4.9, w: w1, h: 0.25, fontFace: HEAD, italic: true, fontSize: 12, color: COL.muted });
  txt(s, plain(6, "c2"), { x: x2, y: 4.9, w: w2, h: 0.25, fontFace: HEAD, italic: true, fontSize: 12, color: COL.muted });
  txt(s, runs(T(6, "!!title"), COL.ink), { x: ML, y: 5.32, w: 5.6, h: 0.65, fontFace: HEAD, fontSize: 34, color: COL.ink, objectName: "!!title" });
  txt(s, runs(T(6, "!!body"), COL.body), { x: x2, y: 5.36, w: W - ML - x2, h: 1.2, fontSize: 14, lineSpacingMultiple: 1.1, objectName: "!!body" });
  cap(s, 6, ML, 5.98, 5.4, "left", 0.25);
  chrome(s, 6, 1912); grain(s); notes(s, 6); }

// 7 — Vienna years: the hostel postcard as an artifact
{ const s = newSlide(SEC[1]);
  img(s, "amb_hostel.jpg", 0, 0, W, H); img(s, "ov_amb.png", 0, 0, W, H);
  const pw = 6.25, ph = pw * 1063 / 1800;
  print(s, "a_hostel.jpg", 6.2, 1.15, pw, ph, -2, 0.0);
  txt(s, runs(T(7, "!!cap"), COL.capt), { x: 6.2, y: 1.15 + ph + 0.32, w: pw, h: 0.25, fontSize: 9, color: COL.capt, align: "right", objectName: "!!cap" });
  head(s, 7, ML, 5.1); body(s, 7, ML, 2.42, 4.95, 3.8);
  chrome(s, 7, 1910); grain(s); notes(s, 7); }

// 8 — what Vienna breathed: two politicians bleed off the left edge
{ const s = newSlide(SEC[1]);
  img(s, "p_lueger.jpg", 0, 0, 3.37, H); img(s, "ov_split_c.png", 0, 0, 3.37, H);
  img(s, "p_schoen.jpg", 3.41, 0, 3.4, H); img(s, "ov_split_d.png", 3.41, 0, 3.4, H);
  name2(s, T(8, "c1"), 0.45, 5.55, 2.8); name2(s, T(8, "c2"), 3.7, 5.55, 2.6);
  head(s, 8, 7.4, 5.18); body(s, 8, 7.4, 2.42, 5.18, 3.7);
  cap(s, 8, 0.45, 6.24, 5.8, "left", 0.3);
  chrome(s, 8, 1910); grain(s); notes(s, 8); }

// 9 — to Munich: full-bleed
{ const s = newSlide(SEC[2]);
  img(s, "bg_munich.jpg", 0, 0, W, H); img(s, "ov_hero.png", 0, 0, W, H);
  head(s, 9, ML, 6.1); body(s, 9, ML, 2.42, 5.5, 3.6);
  cap(s, 9, W - ML - 5.0, 6.24, 5.0, "right", 0.3);
  chrome(s, 9, 1913); grain(s); notes(s, 9); }

// 10 — List Regiment: soldier portrait bleeds left, the losses as a stat
{ const s = newSlide(SEC[2]);
  img(s, "cut_list.png", 0, 0, 6.53, H); img(s, "ov_amb_soft.png", 0, 0, W, H, { objectName: "shade" });
  head(s, 10, 7.25, 5.33);
  txt(s, plain(10, "!!stat"), { x: 7.25, y: 2.3, w: 5.33, h: 0.85, fontFace: HEAD, fontSize: 54, color: COL.gold, objectName: "!!stat" });
  txt(s, plain(10, "!!statl"), { x: 7.27, y: 3.2, w: 5.2, h: 0.45, fontSize: 11, color: COL.muted, objectName: "!!statl" });
  body(s, 10, 7.25, 3.82, 5.33, 2.4);
  cap(s, 10, 0.45, 6.24, 5.9, "left", 0.3);
  chrome(s, 10, 1914); grain(s); notes(s, 10); }

// 11 — decorations and the wound: hospital photo bleeds right, the cross as a print
{ const s = newSlide(SEC[2]);
  img(s, "p_beelitz.jpg", 6.0, 0, 7.333, H); img(s, "ov_beelitz.png", 6.0, 0, 7.333, H);
  print(s, "a_cross.jpg", 6.45, 4.3, 1.42, 1.9, 3);
  head(s, 11, ML, 5.32); body(s, 11, ML, 2.42, 5.0, 3.8);
  cap(s, 11, 8.3, 6.12, W - ML - 8.3, "right", 0.46);
  chrome(s, 11, 1916); grain(s); notes(s, 11); }

// 12 — defeat: gas photo bleeds left
{ const s = newSlide(SEC[2]);
  img(s, "p_gas.jpg", 0, 0, 5.6, H); img(s, "ov_gas.png", 0, 0, 5.6, H);
  head(s, 12, 6.45, 6.13); body(s, 12, 6.45, 2.42, 6.0, 3.6);
  cap(s, 12, ML, 6.24, 4.6, "left", 0.3);
  chrome(s, 12, 1918); grain(s); notes(s, 12); }

// 13 — first step into politics: full-bleed crowd, card No. 555
{ const s = newSlide(SEC[3]);
  img(s, "bg_demo.jpg", 0, 0, W, H); img(s, "ov_hero.png", 0, 0, W, H);
  head(s, 13, ML, 6.0); body(s, 13, ML, 2.42, 5.7, 2.3);
  txt(s, plain(13, "!!stat"), { x: ML, y: 4.7, w: 5.5, h: 0.85, fontFace: HEAD, fontSize: 54, color: COL.gold, objectName: "!!stat" });
  txt(s, plain(13, "!!statl"), { x: ML + 0.02, y: 5.58, w: 5.6, h: 0.4, fontSize: 11, color: COL.muted, objectName: "!!statl" });
  cap(s, 13, W - ML - 5.0, 6.24, 5.0, "right", 0.3);
  chrome(s, 13, 1919); grain(s); notes(s, 13); }

// 14 — thirty years on one map (labels keep the original coordinates of the map image)
{ const s = newSlide(SEC[3]);
  img(s, "bg_map.jpg", 0, 0, W, H); img(s, "ov_map.png", 0, 0, W, H);
  head(s, 14, ML, 4.7, { yearSize: 54, th: 1.3 });
  body(s, 14, ML, 2.95, 4.45, 3.1);
  const DOTS = [[10.69, 5.75, 0.14, 1], [11.34, 5.68, 0.14, 1], [12.43, 5.68, 0.14, 1], [9.94, 5.87, 0.14, 1], [5.61, 3.59, 0.14, 1], [5.49, 4.21, 0.12, 0], [10.54, 2.65, 0.12, 0], [10.97, 1.63, 0.14, 1]];
  const LAB = [[9.54, 5.26, 1.17, "right"], [10.86, 5.17, 1.11, "center"], [11.44, 5.17, 1.11, "right"], [8.51, 5.85, 1.36, "right"], [5.85, 3.1, 1.64, "left"], [5.72, 4.3, 1.39, "left"], [9.08, 2.52, 1.39, "right"], [11.21, 1.48, 1.53, "left"]];
  DOTS.forEach(([x, y, d, solid], i) => s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: solid ? COL.gold : "0A0A0B" }, line: { color: solid ? "0A0A0B" : COL.gold, width: 1.5 }, objectName: "d" + i }));
  LAB.forEach(([x, y, w, align], i) => { const p = T(14, "l" + i);
    txt(s, [{ text: p[0].map((r) => r.t).join(""), options: { bold: true, fontSize: 11, color: COL.ink, breakLine: true } }, { text: p[1].map((r) => r.t).join(""), options: { fontSize: 9, color: COL.gold } }], { x, y, w, h: 0.42, align, objectName: "l" + i }); });
  cap(s, 14, W - ML - 5.3, 6.24, 5.3, "right", 0.3);
  chrome(s, 14, 1919); grain(s); notes(s, 14); }

// 15 — what made him: four factors, conclusion, literature
{ const s = newSlide(SEC[3]);
  img(s, "bg_trench.jpg", 0, 0, W, H); img(s, "ov_end.png", 0, 0, W, H);
  head(s, 15, ML, 9.5);
  [[0, ML, 2.62], [1, 6.75, 2.62], [2, ML, 3.55], [3, 6.75, 3.55]].forEach(([i, x, y]) => {
    txt(s, plain(15, "n" + i), { x, y: y - 0.05, w: 0.7, h: 0.5, fontFace: HEAD, fontSize: 26, color: COL.gold, objectName: "n" + i });
    txt(s, runs(T(15, "ct" + i), COL.ink, { goldBold: true }), { x: x + 0.72, y, w: 5.0, h: 0.75, fontSize: 15, lineSpacingMultiple: 1.08, objectName: "ct" + i });
  });
  txt(s, plain(15, "!!body"), { x: ML, y: 4.62, w: 10.8, h: 0.9, fontFace: HEAD, italic: true, fontSize: 20, color: "E8E1D3", lineSpacingMultiple: 1.05, objectName: "!!body" });
  txt(s, runs(T(15, "!!cap"), COL.capt), { x: ML, y: 5.78, w: W - 2 * ML, h: 0.42, fontSize: 9, color: COL.capt, objectName: "!!cap" });
  chrome(s, 15, 1919); grain(s); notes(s, 15); }

pres.writeFile({ fileName: OUT }).then((f) => console.log("written", f));
