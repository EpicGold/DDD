// v2 — documentary redesign with in-slide animation (Ken Burns, staged reveals), chapter kickers,
// unit-chart infographic, sequential map route, icon cards. Text + notes verbatim from content.json.
// Animated objects are named "A|kind|delayMs|durMs|label"; anim.py turns these into <p:timing>.
const fs = require("fs"), path = require("path");
const pptxgen = require("pptxgenjs");
const A = (f) => (f.startsWith("/") ? f : path.join("/root/deckwork/assets", f));
const X = (f) => path.join("/root/deckwork/extra", f);
const C = JSON.parse(fs.readFileSync("/root/deckwork/content.json", "utf8"));
const OUT = process.argv[2] || "/root/deckwork/build/raw2.pptx";

const W = 13.333, H = 7.5, ML = 0.75;
const COL = { bg: "0F0E0D", ink: "F3EEE6", body: "D8D2C6", muted: "9E978C", dim: "6E6A63", gold: "C9A15B", kick: "B08F56", line: "3A3632", tick: "57514A", print: "E7E0D2", capt: "B9B2A6" };
const HEAD = "Cambria", BODY = "Calibri";
const TL = { x0: ML, x1: W - ML, y: 7.0 };
const pos = (yr) => TL.x0 + (TL.x1 - TL.x0) * (yr - 1889) / 30;
const CHAPTERS = [1889, 1899, 1907, 1910, 1912, 1913, 1914, 1916, 1918, 1919];
const KB = 24000;                                  // Ken Burns push-in duration, ms

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Адольф Гитлер. До политической карьеры (1889–1919)";
pres.author = "Пономарев Глеб, 10В класс";
pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };

// ---------- helpers ----------
const an = (kind, delay, dur, label) => `A|${kind}|${delay}|${dur}|${label}`;
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
// photo + its fade overlay share one Ken Burns move so the soft edge travels with the picture
const photo = (slide, f, ov, x, y, w, h, o = {}) => {
  img(slide, f, x, y, w, h, { objectName: an(o.kb === false ? "fade" : "fkb", o.delay ?? 0, o.dur ?? 1100, o.label ?? "Фото") });
  if (ov) img(slide, ov, x, y, w, h, { objectName: an(o.kb === false ? "none" : "kb", o.delay ?? 0, 0, "Тень фото") });
};

function chrome(slide, n, year, kicker) {
  slide.addShape(pres.shapes.LINE, { x: TL.x0, y: TL.y, w: TL.x1 - TL.x0, h: 0, line: { color: COL.line, width: 0.75 }, objectName: "!!tl" });
  CHAPTERS.forEach((c) => slide.addShape(pres.shapes.RECTANGLE, { x: pos(c) - 0.006, y: TL.y - 0.035, w: 0.012, h: 0.07, fill: { color: COL.tick }, line: { type: "none" }, objectName: "!!tk" + c }));
  const px = pos(year);
  slide.addShape(pres.shapes.RECTANGLE, { x: TL.x0, y: TL.y - 0.009, w: Math.max(0.02, px - TL.x0), h: 0.018, fill: { color: COL.gold }, line: { type: "none" }, objectName: "!!tlp" });
  slide.addShape(pres.shapes.OVAL, { x: px - 0.15, y: TL.y - 0.15, w: 0.3, h: 0.3, fill: { color: COL.gold, transparency: 82 }, line: { type: "none" }, objectName: "!!tlh" });
  slide.addShape(pres.shapes.OVAL, { x: px - 0.06, y: TL.y - 0.06, w: 0.12, h: 0.12, fill: { color: COL.gold }, line: { type: "none" }, objectName: "!!tld" });
  txt(slide, String(year), { x: px - 0.5, y: TL.y - 0.36, w: 1.0, h: 0.2, fontSize: 9, bold: true, color: COL.gold, align: "center", charSpacing: 1, objectName: "!!tly" });
  txt(slide, "1889", { x: TL.x0, y: TL.y + 0.1, w: 0.8, h: 0.18, fontSize: 8, color: COL.dim, objectName: "!!tl0" });
  txt(slide, "1919", { x: TL.x1 - 0.8, y: TL.y + 0.1, w: 0.8, h: 0.18, fontSize: 8, color: COL.dim, align: "right", objectName: "!!tl1" });
  txt(slide, `${String(n).padStart(2, "0")} / 15`, { x: W - ML - 1.4, y: 0.34, w: 1.4, h: 0.2, fontSize: 9, bold: true, color: "A39C90", align: "right", charSpacing: 2, objectName: "!!count" });
  if (kicker) txt(slide, kicker.t, { x: kicker.x, y: 0.34, w: 5.6, h: 0.2, fontSize: 9, bold: true, color: COL.kick, charSpacing: 3, objectName: "!!kick" });
}
const grain = (slide) => img(slide, "grain.png", 0, 0, W, H, { objectName: "!!grain" });

function head(slide, s, x, w, o = {}) {
  txt(slide, plain(s, "!!year"), { x, y: o.yy ?? 0.5, w, h: 1.0, fontFace: HEAD, fontSize: o.yearSize ?? 60, color: COL.gold, objectName: "!!year" });
  txt(slide, runs(T(s, "!!title"), COL.ink), { x, y: o.ty ?? 1.5, w, h: o.th ?? 0.66, fontFace: HEAD, fontSize: o.titleSize ?? 36, color: COL.ink, italic: !!o.italic, lineSpacingMultiple: 0.95, objectName: an("fade", o.td ?? 250, 700, "Заголовок") });
}
function body(slide, s, x, y, w, h, o = {}) {
  txt(slide, runs(T(s, "!!body"), COL.body), { x, y, w, h, fontSize: o.size ?? 16, lineSpacingMultiple: 1.12, objectName: an("fade", o.delay ?? 600, 800, "Текст") });
}
const cap = (slide, s, x, y, w, align = "left", h = 0.36, delay = 1300) => txt(slide, runs(T(s, "!!cap"), COL.capt), { x, y, w, h, fontSize: 9, color: COL.capt, align, valign: "bottom", objectName: an("fade", delay, 700, "Подпись") });
const name2 = (slide, paras, x, y, w, delay) => txt(slide, [
  { text: paras[0].map((r) => r.t).join(""), options: { fontFace: HEAD, fontSize: 16, color: COL.ink, breakLine: true } },
  { text: paras[1].map((r) => r.t).join(""), options: { fontSize: 10.5, color: COL.gold, bold: true, charSpacing: 1 } }], { x, y, w, h: 0.6, objectName: an("fade", delay, 700, "Имя") });
function print(slide, f, x, y, w, h, rot, delay, border = 0.06) {
  // archival print: paper border + soft drop shadow, appears as one piece
  if (border) slide.addShape(pres.shapes.RECTANGLE, { x: x - border, y: y - border, w: w + 2 * border, h: h + 2 * border, fill: { color: COL.print }, line: { type: "none" }, rotate: rot, shadow: shadow(16, 6, 0.65), objectName: an("fade", delay, 900, "Рамка отпечатка") });
  img(slide, f, x, y, w, h, { rotate: rot, objectName: an("fade", delay, 900, "Отпечаток"), ...(border ? {} : { shadow: shadow(18, 7, 0.7) }) });
}
const newSlide = (sec) => { const s = pres.addSlide({ sectionTitle: sec }); s.background = { color: COL.bg }; return s; };
const notes = (slide, n) => slide.addNotes(C[n - 1].notes);
const K = { I: "ГЛАВА I · ДЕТСТВО", II: "ГЛАВА II · ВЕНА", III: "ГЛАВА III · МЮНХЕН И ФРОНТ", IV: "ГЛАВА IV · ПОСЛЕ ВОЙНЫ", E: "ЭПИЛОГ" };

const SEC = ["Пролог", "I. Детство", "II. Вена", "III. Мюнхен и фронт", "IV. После войны", "Эпилог"];
SEC.forEach((t) => pres.addSection({ title: t }));

// 1 — title
{ const s = newSlide(SEC[0]);
  txt(s, "1889", { x: 0.45, y: 4.05, w: 8.6, h: 3.0, fontFace: HEAD, fontSize: 230, color: "1B1917", objectName: "!!year" });
  img(s, "cut_title.png", W - 5.83, 0, 5.83, 7.5, { objectName: an("fkb", 0, 1800, "Портрет") });
  img(s, "ov_amb_soft.png", 0, 0, W, H, { objectName: "shade" });
  txt(s, plain(1, "!!title"), { x: ML, y: 1.72, w: 7.4, h: 1.05, fontFace: HEAD, fontSize: 62, color: COL.ink, objectName: an("fade", 500, 1200, "Заголовок") });
  txt(s, plain(1, "!!body"), { x: ML + 0.02, y: 2.86, w: 6.8, h: 0.5, fontSize: 24, color: "B9B4AA", objectName: an("fade", 1100, 900, "Подзаголовок") });
  txt(s, plain(1, "years"), { x: ML + 0.02, y: 3.5, w: 4, h: 0.3, fontSize: 13, bold: true, color: COL.gold, charSpacing: 4, objectName: an("fade", 1500, 800, "Годы") });
  txt(s, plain(1, "author"), { x: ML + 0.02, y: 3.92, w: 6, h: 0.3, fontSize: 14, color: COL.ink, objectName: an("fade", 1800, 800, "Автор") });
  cap(s, 1, W - ML - 4.4, 6.3, 4.4, "right", 0.36, 2200);
  chrome(s, 1, 1889, null); grain(s); notes(s, 1); }

// 2 — family
{ const s = newSlide(SEC[1]);
  photo(s, "p_alois.jpg", "ov_split_a.png", 6.3, 0, 3.49, H, { kb: false, label: "Алоис" });
  photo(s, "p_klara.jpg", "ov_split_b.png", 9.833, 0, 3.5, H, { kb: false, delay: 350, label: "Клара" });
  name2(s, T(2, "c1"), 7.55, 5.55, 2.2, 1000); name2(s, T(2, "c2"), 10.1, 5.55, 2.4, 1250);
  head(s, 2, ML, 5.62); body(s, 2, ML, 2.45, 5.25, 3.6);
  cap(s, 2, W - ML - 5.2, 6.24, 5.2, "right", 0.3);
  chrome(s, 2, 1889, { t: K.I, x: ML }); grain(s); notes(s, 2); }

// 3 — school
{ const s = newSlide(SEC[1]);
  photo(s, "p_school.jpg", "ov_school.png", 6.0, 0, 7.333, H, { kb: false, label: "Класс 1899" });
  print(s, "a_child.jpg", 6.5, 4.42, 1.45, 1.93, -3, 1100);
  s.addShape(pres.shapes.OVAL, { x: 9.66 - 0.3, y: 0.49 - 0.3, w: 0.6, h: 0.6, fill: { type: "none" }, line: { color: COL.gold, width: 1.75 }, objectName: an("fade", 1700, 600, "Круг") });
  head(s, 3, ML, 5.1); body(s, 3, ML, 2.45, 4.95, 3.7);
  cap(s, 3, 8.35, 6.2, W - ML - 8.35, "right", 0.38, 1900);
  chrome(s, 3, 1899, { t: K.I, x: ML }); grain(s); notes(s, 3); }

// 4 — mother
{ const s = newSlide(SEC[1]);
  photo(s, "p_mother.jpg", "ov_mother.png", 0, 0, 5.9, H, { label: "Клара" });
  head(s, 4, 6.7, 5.88); body(s, 4, 6.7, 2.45, 5.6, 3.6);
  cap(s, 4, ML, 6.24, 4.6, "left", 0.3);
  chrome(s, 4, 1907, { t: K.I, x: 6.7 }); grain(s); notes(s, 4); }

// 5 — the Academy
{ const s = newSlide(SEC[2]);
  photo(s, "bg_academy.jpg", null, 0, 0, W, H, { label: "Академия" }); img(s, "ov_hero.png", 0, 0, W, H, { objectName: "Тень" });
  head(s, 5, ML, 6.6, { italic: true, titleSize: 34, th: 1.62, ty: 1.48 });
  txt(s, plain(5, "attr"), { x: ML + 0.02, y: 3.22, w: 6.0, h: 0.4, fontSize: 10.5, bold: true, color: COL.gold, charSpacing: 1, objectName: an("fade", 600, 700, "Источник") });
  body(s, 5, ML, 3.72, 5.6, 2.4, { delay: 900 });
  cap(s, 5, W - ML - 5.4, 6.24, 5.4, "right", 0.3);
  chrome(s, 5, 1907, { t: K.II, x: ML }); grain(s); notes(s, 5); }

// 6 — watercolours
{ const s = newSlide(SEC[2]);
  img(s, "amb_paint.jpg", 0, 0, W, H, { objectName: an("kb", 0, 0, "Фон") }); img(s, "ov_amb_soft.png", 0, 0, W, H, { objectName: "Тень" });
  const h = 4.05, w1 = h * 1406 / 1045, w2 = h * 2301 / 1656, gap = 0.35, x1 = ML, x2 = ML + w1 + gap;
  print(s, "a_oper.jpg", x1, 0.72, w1, h, 0, 0, 0);
  print(s, "a_hof.jpg", x2, 0.72, w2, h, 0, 450, 0);
  txt(s, plain(6, "c1"), { x: x1, y: 4.9, w: w1, h: 0.25, fontFace: HEAD, italic: true, fontSize: 12, color: COL.muted, objectName: an("fade", 900, 600, "Название") });
  txt(s, plain(6, "c2"), { x: x2, y: 4.9, w: w2, h: 0.25, fontFace: HEAD, italic: true, fontSize: 12, color: COL.muted, objectName: an("fade", 1100, 600, "Название") });
  txt(s, runs(T(6, "!!title"), COL.ink), { x: ML, y: 5.32, w: 5.6, h: 0.65, fontFace: HEAD, fontSize: 34, color: COL.ink, objectName: an("fade", 1300, 700, "Заголовок") });
  txt(s, runs(T(6, "!!body"), COL.body), { x: x2, y: 5.36, w: W - ML - x2, h: 1.2, fontSize: 14, lineSpacingMultiple: 1.1, objectName: an("fade", 1600, 800, "Текст") });
  cap(s, 6, ML, 5.98, 5.4, "left", 0.25, 1900);
  chrome(s, 6, 1912, { t: K.II, x: ML }); grain(s); notes(s, 6); }

// 7 — Vienna years
{ const s = newSlide(SEC[2]);
  img(s, "amb_hostel.jpg", 0, 0, W, H, { objectName: an("kb", 0, 0, "Фон") }); img(s, "ov_amb.png", 0, 0, W, H, { objectName: "Тень" });
  const pw = 6.25, ph = pw * 1063 / 1800;
  print(s, "a_hostel.jpg", 6.2, 1.15, pw, ph, -2, 300, 0);
  txt(s, runs(T(7, "!!cap"), COL.capt), { x: 6.2, y: 1.15 + ph + 0.32, w: pw, h: 0.25, fontSize: 9, color: COL.capt, align: "right", objectName: an("fade", 1500, 700, "Подпись") });
  head(s, 7, ML, 5.1); body(s, 7, ML, 2.45, 4.95, 3.8);
  chrome(s, 7, 1910, { t: K.II, x: ML }); grain(s); notes(s, 7); }

// 8 — what Vienna breathed
{ const s = newSlide(SEC[2]);
  photo(s, "p_lueger.jpg", "ov_split_c.png", 0, 0, 3.37, H, { kb: false, label: "Люгер" });
  photo(s, "p_schoen.jpg", "ov_split_d.png", 3.41, 0, 3.4, H, { kb: false, delay: 350, label: "Шёнерер" });
  name2(s, T(8, "c1"), 0.45, 5.55, 2.8, 1000); name2(s, T(8, "c2"), 3.7, 5.55, 2.6, 1250);
  head(s, 8, 7.4, 5.18); body(s, 8, 7.4, 2.45, 5.18, 3.7);
  cap(s, 8, 0.45, 6.24, 5.8, "left", 0.3);
  chrome(s, 8, 1910, { t: K.II, x: 7.4 }); grain(s); notes(s, 8); }

// 9 — to Munich
{ const s = newSlide(SEC[3]);
  photo(s, "bg_munich.jpg", null, 0, 0, W, H, { label: "Мюнхен 1913" }); img(s, "ov_hero.png", 0, 0, W, H, { objectName: "Тень" });
  head(s, 9, ML, 6.1); body(s, 9, ML, 2.45, 5.5, 3.6);
  cap(s, 9, W - ML - 5.0, 6.24, 5.0, "right", 0.3);
  chrome(s, 9, 1913, { t: K.III, x: ML }); grain(s); notes(s, 9); }

// 10 — List Regiment + unit chart: 3600 cells, 611 stay gold
{ const s = newSlide(SEC[3]);
  img(s, "cut_list.png", 0, 0, 6.53, H, { objectName: an("fkb", 0, 1200, "Портрет") });
  img(s, "ov_amb_soft.png", 0, 0, W, H, { objectName: "Тень" });
  head(s, 10, 7.25, 5.33);
  txt(s, plain(10, "!!stat"), { x: 7.25, y: 2.3, w: 3.6, h: 0.85, fontFace: HEAD, fontSize: 54, color: COL.gold, objectName: an("fade", 500, 700, "Цифра") });
  txt(s, plain(10, "!!statl"), { x: 7.27, y: 3.2, w: 3.5, h: 0.6, fontSize: 11, color: COL.muted, objectName: an("fade", 700, 700, "Пояснение") });
  const gx = 10.98, gy = 2.33, gs = 1.6;
  img(s, X("grid_all.png"), gx, gy, gs, gs, { objectName: an("fade", 800, 600, "Полк: 3600") });
  img(s, X("grid_left.png"), gx, gy, gs, gs, { objectName: an("fade", 2100, 1600, "Осталось 611") });
  txt(s, "каждая клетка — один солдат", { x: gx - 0.2, y: gy + gs + 0.06, w: gs + 0.2, h: 0.18, fontSize: 8, color: COL.dim, align: "right", objectName: an("fade", 1000, 600, "Легенда") });
  body(s, 10, 7.25, 4.18, 5.33, 2.2, { delay: 1200 });
  cap(s, 10, 0.45, 6.24, 5.9, "left", 0.3, 1500);
  chrome(s, 10, 1914, { t: K.III, x: 7.25 }); grain(s); notes(s, 10); }

// 11 — decorations and the wound
{ const s = newSlide(SEC[3]);
  photo(s, "p_beelitz.jpg", "ov_beelitz.png", 6.0, 0, 7.333, H, { label: "Белиц 1916" });
  print(s, "a_cross.jpg", 6.45, 4.3, 1.42, 1.9, 3, 1300);
  head(s, 11, ML, 5.32); body(s, 11, ML, 2.45, 5.0, 3.8);
  cap(s, 11, 8.3, 6.12, W - ML - 8.3, "right", 0.46, 1700);
  chrome(s, 11, 1916, { t: K.III, x: ML }); grain(s); notes(s, 11); }

// 12 — defeat
{ const s = newSlide(SEC[3]);
  photo(s, "p_gas.jpg", "ov_gas.png", 0, 0, 5.6, H, { label: "Газ" });
  head(s, 12, 6.45, 6.13); body(s, 12, 6.45, 2.45, 6.0, 3.6);
  cap(s, 12, ML, 6.24, 4.6, "left", 0.3);
  chrome(s, 12, 1918, { t: K.III, x: 6.45 }); grain(s); notes(s, 12); }

// 13 — first step into politics
{ const s = newSlide(SEC[4]);
  photo(s, "bg_demo.jpg", null, 0, 0, W, H, { label: "Демонстрация 1919" }); img(s, "ov_hero.png", 0, 0, W, H, { objectName: "Тень" });
  head(s, 13, ML, 6.0); body(s, 13, ML, 2.45, 5.7, 2.3);
  txt(s, plain(13, "!!stat"), { x: ML, y: 4.7, w: 5.5, h: 0.85, fontFace: HEAD, fontSize: 54, color: COL.gold, objectName: an("fade", 1300, 800, "Партбилет") });
  txt(s, plain(13, "!!statl"), { x: ML + 0.02, y: 5.58, w: 5.6, h: 0.4, fontSize: 11, color: COL.muted, objectName: an("fade", 1500, 700, "Пояснение") });
  cap(s, 13, W - ML - 5.0, 6.24, 5.0, "right", 0.3, 1800);
  chrome(s, 13, 1919, { t: K.IV, x: ML }); grain(s); notes(s, 13); }

// 14 — the map: places appear in the order he lived them
{ const s = newSlide(SEC[5]);
  img(s, "bg_map.jpg", 0, 0, W, H, { objectName: an("fade", 0, 1000, "Карта") }); img(s, "ov_map.png", 0, 0, W, H, { objectName: "Тень" });
  head(s, 14, ML, 4.7, { yearSize: 54, th: 1.3 });
  body(s, 14, ML, 2.98, 4.45, 3.1);
  const DOTS = [[10.69, 5.75, 0.14, 1], [11.34, 5.68, 0.14, 1], [12.43, 5.68, 0.14, 1], [9.94, 5.87, 0.14, 1], [5.61, 3.59, 0.14, 1], [5.49, 4.21, 0.12, 0], [10.54, 2.65, 0.12, 0], [10.97, 1.63, 0.14, 1]];
  const LAB = [[9.54, 5.26, 1.17, "right"], [10.86, 5.17, 1.11, "center"], [11.44, 5.17, 1.11, "right"], [8.51, 5.85, 1.36, "right"], [5.85, 3.1, 1.64, "left"], [5.72, 4.3, 1.39, "left"], [9.08, 2.52, 1.39, "right"], [11.21, 1.48, 1.53, "left"]];
  DOTS.forEach(([x, y, d, solid], i) => s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: solid ? COL.gold : "0A0A0B" }, line: { color: solid ? "0A0A0B" : COL.gold, width: 1.5 }, objectName: an("fade", 1100 + i * 420, 450, "Точка " + (i + 1)) }));
  LAB.forEach(([x, y, w, align], i) => { const p = T(14, "l" + i);
    txt(s, [{ text: p[0].map((r) => r.t).join(""), options: { bold: true, fontSize: 11, color: COL.ink, breakLine: true } }, { text: p[1].map((r) => r.t).join(""), options: { fontSize: 9, color: COL.gold } }], { x, y, w, h: 0.42, align, objectName: an("fade", 1150 + i * 420, 450, "Место " + (i + 1)) }); });
  cap(s, 14, W - ML - 5.3, 6.24, 5.3, "right", 0.3, 4700);
  chrome(s, 14, 1919, { t: K.E, x: ML }); grain(s); notes(s, 14); }

// 15 — what made him: icon cards
{ const s = newSlide(SEC[5]);
  photo(s, "bg_trench.jpg", null, 0, 0, W, H, { label: "Окоп, Сомма" }); img(s, "ov_end.png", 0, 0, W, H, { objectName: "Тень" });
  head(s, 15, ML, 9.5);
  const ICON = ["i_grudge.png", "i_ideas.png", "i_war.png", "i_defeat.png"];
  [[0, ML, 2.55], [1, 6.83, 2.55], [2, ML, 3.55], [3, 6.83, 3.55]].forEach(([i, x, y]) => {
    const d = 700 + i * 380, cw = 5.75, ch = 0.82;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, rectRadius: 0.08, fill: { color: "0B0A09", transparency: 35 }, line: { color: "4A4237", width: 0.75 }, objectName: an("fade", d, 600, "Карточка " + (i + 1)) });
    s.addShape(pres.shapes.OVAL, { x: x + 0.16, y: y + 0.14, w: 0.54, h: 0.54, fill: { color: COL.gold, transparency: 86 }, line: { color: COL.gold, width: 1 }, objectName: an("fade", d, 600, "Круг иконки") });
    s.addImage({ path: X(ICON[i]), x: x + 0.27, y: y + 0.25, w: 0.32, h: 0.32, objectName: an("fade", d, 600, "Иконка") });
    txt(s, plain(15, "n" + i), { x: x + 0.86, y: y + 0.16, w: 0.55, h: 0.5, fontFace: HEAD, fontSize: 22, color: COL.gold, objectName: an("fade", d, 600, "Номер") });
    txt(s, runs(T(15, "ct" + i), COL.ink, { goldBold: true }), { x: x + 1.38, y: y + 0.13, w: cw - 1.52, h: 0.6, fontSize: 14, lineSpacingMultiple: 1.05, valign: "middle", objectName: an("fade", d, 600, "Причина") });
  });
  txt(s, plain(15, "!!body"), { x: ML, y: 4.68, w: 10.8, h: 0.9, fontFace: HEAD, italic: true, fontSize: 20, color: "E8E1D3", lineSpacingMultiple: 1.05, objectName: an("fade", 2400, 1000, "Вывод") });
  txt(s, runs(T(15, "!!cap"), COL.capt), { x: ML, y: 5.8, w: W - 2 * ML, h: 0.42, fontSize: 9, color: COL.capt, objectName: an("fade", 3000, 800, "Литература") });
  chrome(s, 15, 1919, { t: K.E, x: ML }); grain(s); notes(s, 15); }

pres.writeFile({ fileName: OUT }).then((f) => console.log("written", f));
