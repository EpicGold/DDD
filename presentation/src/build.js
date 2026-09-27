// Keynote-style WWI aviation deck: real archival photos (Smithsonian Open Access, CC0),
// background-removed cutouts, 1914 maps from real geodata, Morph ("Трансформация") transitions.
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const A = (f) => path.join(__dirname, "assets", f);
const DIMS = JSON.parse(fs.readFileSync(path.join(__dirname, "dims.json")));
const GEO = JSON.parse(fs.readFileSync(path.join(__dirname, "geo.json")));
const W = 13.333, H = 7.5, TOTAL = 14;

const C = {
  bg: "07090D", txt: "F5F3EF", txt2: "B4BAC3", txt3: "7C838F", line: "2A2F38",
  lbg: "F5F5F7", ltxt: "1D1D1F", ltxt2: "515154", ltxt3: "86868B", lline: "D2D2D7",
  red: "FF453A", orange: "FF9F0A", yellow: "FFD60A", gold: "E3B64E", goldDark: "A8781E",
  teal: "64D2FF", blue: "0A84FF", indigo: "7D7AFF", purple: "BF5AF2", green: "30D158",
  ent: "4E93D8", cen: "E4543F",
};
const HF = "Calibri", SERIF = "Cambria";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Авиация Первой мировой войны";
pres.author = "Пономарев Глеб";
pres.subject = "История, 10В класс";

// ---------- helpers ----------
const ratio = (f) => DIMS[f][1] / DIMS[f][0];
const T = (s, text, o) => s.addText(text, { fontFace: HF, fontSize: 14, color: C.txt, margin: 0, valign: "top", isTextBox: true, ...o });
const img = (s, f, x, y, w, h, o = {}) => s.addImage({ path: A(f), x, y, w, h: h ?? w * ratio(f), ...o });
const cover = (s, f, x, y, w, h, o = {}) => s.addImage({ path: A(f), x, y, w, h, sizing: { type: "cover", w, h }, ...o });
const rect = (s, x, y, w, h, color, o = {}) => s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color }, line: { color, width: 0 }, ...o });
const rrect = (s, x, y, w, h, color, o = {}) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color }, line: { color, width: 0 }, ...o });

function chrome(s, n, { accent, kicker, title, light = false, titleW = 8.5, titleSize = 38, titleX = 0.6 }) {
  s.background = { color: light ? C.lbg : C.bg };
  const t1 = light ? C.ltxt : C.txt;
  if (kicker) T(s, kicker, { x: titleX, y: 0.42, w: 9, h: 0.3, fontSize: 12, bold: true, charSpacing: 2.5, color: accent, objectName: "!!kicker" });
  if (title) T(s, title, { x: titleX, y: 0.72, w: titleW, h: 0.8, fontSize: titleSize, bold: true, charSpacing: -0.5, color: t1, valign: "middle", objectName: "!!title" });
  // progress: thin track + accent fill that grows slide by slide (Morph animates it)
  rect(s, 0.6, 7.13, 2.4, 0.035, light ? C.lline : C.line, { objectName: "!!track" });
  rect(s, 0.6, 7.13, (2.4 * n) / TOTAL, 0.035, accent, { objectName: "!!prog" });
  T(s, `${String(n).padStart(2, "0")} / ${TOTAL}`, { x: 11.73, y: 7.02, w: 1.0, h: 0.25, fontSize: 10, align: "right", color: light ? C.ltxt3 : C.txt3, objectName: "!!pg" });
}

// place a map image: returns a projector from map pixels to slide inches
function placeMap(s, file, key, spp, anchor, at, name) {
  const g = GEO[key];
  const p = g.pts[anchor];
  const x0 = at[0] - p[0] * spp, y0 = at[1] - p[1] * spp;
  s.addImage({ path: A(file), x: x0, y: y0, w: g.W * spp, h: g.H * spp, objectName: name });
  return (k) => [x0 + g.pts[k][0] * spp, y0 + g.pts[k][1] * spp];
}

function marker(s, x, y, color, size = 0.16, ring = true) {
  if (ring) s.addShape(pres.shapes.OVAL, { x: x - size * 1.4, y: y - size * 1.4, w: size * 2.8, h: size * 2.8, fill: { color, transparency: 78 }, line: { color, width: 1, transparency: 30 } });
  s.addShape(pres.shapes.OVAL, { x: x - size / 2, y: y - size / 2, w: size, h: size, fill: { color }, line: { color: "FFFFFF", width: 1.25 } });
}

// off-canvas copy of a named object: Morph flies it in/out between slides
const ghost = (s, f, name, x, y, w, rotate = 0) => s.addImage({ path: A(f), x, y, w, h: w * ratio(f), rotate, objectName: name });

function caption(s, text, x, y, w, h, o = {}) {
  T(s, text, { x, y, w, h, fontSize: 9.5, color: C.txt3, ...o });
}

// =====================================================================
// 1. TITLE
{
  const s = pres.addSlide();
  chrome(s, 1, { accent: C.red });
  img(s, "glow_red.png", 5.2, -1.0, 9.0, 9.0, { transparency: 10 });
  T(s, "1914–1918", { x: 0.35, y: 0.05, w: 12.8, h: 2.9, fontSize: 196, bold: true, charSpacing: -6, color: "161920", valign: "middle", objectName: "!!big" });
  img(s, "pfalz.png", 4.85, 0.75, 8.3, null, { rotate: -4, objectName: "!!pfalz" });
  T(s, "ПРЕЗЕНТАЦИЯ ПО ИСТОРИИ", { x: 0.6, y: 4.3, w: 6, h: 0.3, fontSize: 12, bold: true, charSpacing: 2.5, color: C.red, objectName: "!!kicker" });
  T(s, "Авиация Первой мировой войны", { x: 0.6, y: 4.6, w: 7.6, h: 1.75, fontSize: 50, bold: true, charSpacing: -1, color: C.txt, objectName: "!!title" });
  T(s, "Как небо стало полем боя", { x: 0.6, y: 6.45, w: 6.5, h: 0.4, fontSize: 20, color: C.txt2 });
  T(s, "Пономарев Глеб, 10В класс", { x: 0.6, y: 6.83, w: 6.5, h: 0.3, fontSize: 14, bold: true, color: C.txt });
  caption(s, "Pfalz D.XII, Германия, 1918 · Музей авиации и космонавтики США", 7.4, 5.15, 5.4, 0.3, { align: "right" });
  ghost(s, "flyer.png", "!!flyer", -4.6, 2.3, 2.9);
  s.addNotes("Добрый день! Моя презентация посвящена авиации Первой мировой войны. На слайде настоящий немецкий истребитель Pfalz D.XII 1918 года из Национального музея авиации и космонавтики США. В 1914 году самолёт был хрупкой машиной из дерева и ткани, и многие генералы видели в нём забаву. За четыре года небо стало полем боя: появились истребители, бомбардировщики, асы и самостоятельные военно-воздушные силы. Все фотографии в презентации — настоящие музейные экспонаты, рисунки сделаны военными художниками в 1918 году, а карты построены по реальным географическим данным.");
}

// 2. PROLOGUE — Europe 1914 map with aircraft counts
{
  const s = pres.addSlide();
  const spp = W / GEO.europe1914.W;
  const P = placeMap(s, "europe1914.jpg", "europe1914", spp, "paris", [GEO.europe1914.pts.paris[0] * spp, GEO.europe1914.pts.paris[1] * spp], "!!map");
  img(s, "grad_bottom.png", 0, 4.7, W, 2.8);
  img(s, "grad_top.png", 0, 0, W, 1.9);
  chrome(s, 2, { accent: C.gold, kicker: "ПРОЛОГ · 1903–1913", title: "Накануне: спорт или оружие?" });
  // aircraft counts pinned to the powers
  const badge = (k, num, label, dx = 0, dy = 0, align = "center") => {
    const [x, y] = P(k);
    marker(s, x, y, C.txt, 0.11, false);
    const bx = align === "center" ? x - 0.9 + dx : x + dx;
    T(s, [{ text: num, options: { fontSize: 30, bold: true, color: C.txt, breakLine: true } }, { text: label, options: { fontSize: 11, color: C.txt2 } }],
      { x: bx, y: y + dy, w: 1.8, h: 0.9, align });
  };
  badge("russia", "244", "самолёта · Россия", 0, 0.1);
  badge("germany", "232", "Германия", 0, 0.12);
  badge("france", "138", "Франция", 0, 0.12);
  badge("uk", "56*", "Британия", 0.22, -0.35, "left");
  // legend
  const leg = [[C.ent, 0, "Антанта"], [C.cen, 0, "Центральные державы"], [C.ent, 55, "светлее — вступили в войну позже"], ["6B7078", 0, "нейтральные страны"]];
  leg.forEach(([col, tr, t], i) => {
    const y = 5.4 + i * 0.29;
    s.addShape(pres.shapes.OVAL, { x: 10.35, y: y + 0.05, w: 0.15, h: 0.15, fill: { color: col, transparency: tr }, line: { color: col, width: 0.5 } });
    T(s, t, { x: 10.6, y, w: 2.4, h: 0.26, fontSize: 10.5, color: C.txt2 });
  });
  caption(s, "* машины первой линии; данные на 1.08.1914, оценки различаются", 10.35, 6.58, 2.5, 0.36, { fontSize: 8.5 });
  // Wright Flyer over the Atlantic
  img(s, "flyer.png", 0.45, 2.05, 2.9, null, { objectName: "!!flyer" });
  ghost(s, "pfalz.png", "!!pfalz", 14.6, -3.4, 5.2, -16);
  ghost(s, "camera.png", "!!camera", 0.55, 8.2, 1.85);
  caption(s, "«Флайер» братьев Райт, 1903. Оригинал хранится в Смитсоновском музее", 0.5, 3.52, 2.9, 0.4);
  // timeline
  const tl = [
    ["1903", "Братья Райт: первый управляемый полёт с мотором — 12 секунд, 36 метров"],
    ["1909", "Луи Блерио перелетел Ла-Манш: 40 км за 36,5 минуты"],
    ["1911", "Итало-турецкая война: первая бомбардировка с самолёта (Дж. Гавотти)"],
    ["1913", "Пётр Нестеров впервые выполнил «мёртвую петлю» над Киевом"],
  ];
  tl.forEach(([y, t], i) => {
    const x = 0.6 + i * 2.42;
    T(s, y, { x, y: 5.52, w: 2.2, h: 0.4, fontSize: 22, bold: true, color: C.gold });
    T(s, t, { x, y: 5.95, w: 2.2, h: 0.95, fontSize: 11.5, color: C.txt2 });
  });
  s.addNotes("Вот Европа накануне войны: синим показаны страны Антанты, красным — Центральные державы. Цифры — сколько самолётов было у держав к 1 августа 1914 года: у России 244, у Германии 232, у Франции 138. Всего десятью годами раньше братья Райт впервые пролетели 36 метров, а в 1909 году Блерио перелетел Ла-Манш. Первая бомбардировка с самолёта случилась в 1911 году в Ливии, а в 1913-м Нестеров выполнил «мёртвую петлю». Но многие военные всё ещё считали авиацию спортом.");
}

// 3. RECONNAISSANCE — zoom into the map (Morph)
{
  const s = pres.addSlide();
  const spp = 6.0 / (GEO.europe1914.pts.tannenberg[0] - GEO.europe1914.pts.paris[0]);
  const P = placeMap(s, "europe1914.jpg", "europe1914", spp, "paris", [5.4, 4.7], "!!map");
  img(s, "grad_left.png", 0, 0, 7.4, H);
  img(s, "grad_bottom.png", 0, 5.4, W, 2.1);
  chrome(s, 3, { accent: C.gold, kicker: "ГЛАВА 1 · 1914", title: "Глаза армии", titleW: 6 });
  const [mx, my] = P("marne");
  marker(s, mx, my, C.gold, 0.18);
  T(s, [{ text: "Марна", options: { bold: true, fontSize: 17, color: C.txt, breakLine: true } }, { text: "3 сентября 1914: лётчики замечают, что армия фон Клюка поворачивает восточнее Парижа", options: { fontSize: 11.5, color: C.txt2 } }],
    { x: mx + 0.35, y: my - 0.2, w: 3.0, h: 1.0 });
  const [tx, ty] = P("tannenberg");
  marker(s, tx, ty, C.gold, 0.18);
  T(s, [{ text: "Танненберг", options: { bold: true, fontSize: 17, color: C.txt, breakLine: true } }, { text: "август 1914: немецкие лётчики следят за движением русской 2-й армии", options: { fontSize: 11.5, color: C.txt2 } }],
    { x: tx - 3.35, y: ty - 1.3, w: 3.0, h: 1.0, align: "right" });
  [["paris", "Париж", -1], ["berlin", "Берлин", 1], ["london", "Лондон", 1], ["warsaw", "Варшава", 1]].forEach(([k, n, side]) => {
    const [x, y] = P(k);
    s.addShape(pres.shapes.OVAL, { x: x - 0.05, y: y - 0.05, w: 0.1, h: 0.1, fill: { color: C.txt }, line: { color: C.txt, width: 0 } });
    T(s, n, { x: side > 0 ? x + 0.1 : x - 1.3, y: y - 0.12, w: 1.2, h: 0.25, fontSize: 10.5, color: C.txt2, align: side > 0 ? "left" : "right" });
  });
  T(s, [{ text: "Разведка — главная работа самолёта в 1914 году. ", options: { bold: true, color: C.txt } },
    { text: "С сентября лётчики корректируют огонь артиллерии по радио, а в марте 1915-го у Нев-Шапеля британцы впервые готовят наступление по картам, составленным по аэроснимкам.", options: { color: C.txt2 } }],
    { x: 0.6, y: 1.65, w: 4.6, h: 1.6, fontSize: 13.5 });
  T(s, "«Без лётчиков не было бы Танненберга»", { x: 0.6, y: 3.35, w: 4.6, h: 0.8, fontFace: SERIF, italic: true, fontSize: 20, color: C.gold });
  caption(s, "Слова, приписываемые П. фон Гинденбургу", 0.6, 4.15, 4.4, 0.3, { fontSize: 10 });
  img(s, "camera.png", 0.55, 4.8, 1.85, null, { objectName: "!!camera" });
  ghost(s, "flyer.png", "!!flyer", 14.4, -2.4, 2.4, -12);
  ghost(s, "voisin.png", "!!voisin", -9.6, 2.4, 8.0, 4);
  T(s, [{ text: "Камера британского лётчика Уэсли Арчера. ", options: { bold: true, color: C.txt } },
    { text: "После войны он «фотографировал» воздушные бои на моделях — подделку раскрыли только в 1980-х.", options: { color: C.txt2 } }],
    { x: 2.6, y: 5.05, w: 2.9, h: 1.3, fontSize: 11 });
  s.addNotes("В первые месяцы войны главной задачей самолёта была разведка. 3 сентября 1914 года лётчики заметили, что армия фон Клюка поворачивает восточнее Парижа и открывает фланг. Это помогло союзникам начать контрнаступление на Марне. На Востоке немецкая авиаразведка следила за русскими армиями перед Танненбергом. Вскоре появились корректировка огня по радио и аэрофотосъёмка. Интересный факт: камера на слайде принадлежала лётчику Уэсли Арчеру, который после войны снимал «воздушные бои» на моделях, и подделку разоблачили лишь в 1980-х.");
}

// 4. FIRST AIR COMBAT — Voisin hero
{
  const s = pres.addSlide();
  chrome(s, 4, { accent: C.red, kicker: "ГЛАВА 2 · 1914", title: "Первые воздушные бои", titleW: 6 });
  img(s, "glow_red.png", 5.6, -0.6, 8.2, 8.2, { transparency: 20 });
  img(s, "voisin.png", 5.1, 1.55, 8.0, null, { rotate: -3, objectName: "!!voisin" });
  const ev = [
    ["8 СЕНТЯБРЯ 1914", "Таран Нестерова", "Под Жолквой Пётр Нестеров ударил своим самолётом австрийский «Альбатрос». Погибли оба экипажа — это первый воздушный таран в истории."],
    ["5 ОКТЯБРЯ 1914", "Первая победа пулемётом", "Под Реймсом Жозеф Франц и Луи Кено на «Вуазене III» сбили германский «Авиатик» из пулемёта «Гочкис»."],
  ];
  ev.forEach(([d, h, t], i) => {
    const y = 1.85 + i * 2.25;
    T(s, d, { x: 0.6, y, w: 4.5, h: 0.3, fontSize: 12, bold: true, charSpacing: 2, color: C.red });
    T(s, h, { x: 0.6, y: y + 0.32, w: 4.5, h: 0.5, fontSize: 24, bold: true, color: C.txt });
    T(s, t, { x: 0.6, y: y + 0.88, w: 4.3, h: 1.2, fontSize: 13, color: C.txt2 });
  });
  ghost(s, "camera.png", "!!camera", 0.55, 8.3, 1.85);
  T(s, "До этого лётчики стреляли друг в друга из пистолетов и карабинов.", { x: 0.6, y: 6.45, w: 4.6, h: 0.5, fontSize: 12, italic: true, color: C.txt3 });
  caption(s, "«Вуазен» тип 8 (1916) — прямой потомок «Вуазена III». Экземпляр Смитсоновского музея — старейший сохранившийся самолёт, построенный как бомбардировщик", 7.3, 5.25, 5.4, 0.6, { align: "right" });
  s.addNotes("Сначала лётчики противников даже приветствовали друг друга, но очень скоро в ход пошли пистолеты и карабины. 8 сентября 1914 года Пётр Нестеров, пытаясь остановить австрийского разведчика, ударил его своим самолётом. Погибли все. Это был первый воздушный таран. А 5 октября француз Жозеф Франц и механик Луи Кено сбили немецкий самолёт из пулемёта. Они летели на «Вуазене» — самолёте того же семейства, что и на фотографии. Так родился воздушный бой.");
}

// 5. SYNCHRONISER — full-bleed gun photo
{
  const s = pres.addSlide();
  chrome(s, 5, { accent: C.orange, kicker: "ГЛАВА 2 · 1915", title: "Стрельба сквозь винт", titleW: 5.2 });
  cover(s, "gun_photo.jpg", 5.5, 0, W - 5.5, H);
  img(s, "grad_left.png", 5.45, 0, 3.4, H);
  img(s, "grad_bottom.png", 5.5, 5.6, W - 5.5, 1.9);
  const tl = [
    ["1 апр. 1915", "Ролан Гаррос сбивает самолёт, стреляя сквозь винт: стальные клинья на лопастях отражают пули"],
    ["18 апр. 1915", "Гаррос садится за линией фронта и попадает в плен. Немцы изучают его самолёт"],
    ["лето 1915", "Фирма Фоккера ставит синхронизатор: мотор «разрешает» выстрел, только когда перед стволом нет лопасти"],
    ["1 июля 1915", "Курт Винтгенс ведёт первый бой с синхронным пулемётом. Начинается «бич Фоккера»"],
    ["начало 1916", "Nieuport 11 и Airco DH.2 возвращают союзникам равенство в воздухе"],
  ];
  s.addShape(pres.shapes.LINE, { x: 0.72, y: 1.78, w: 0, h: 4.75, line: { color: C.line, width: 1.5 } });
  tl.forEach(([d, t], i) => {
    const y = 1.62 + i * 1.02;
    s.addShape(pres.shapes.OVAL, { x: 0.64, y: y + 0.08, w: 0.16, h: 0.16, fill: { color: i === 2 ? C.orange : C.txt3 }, line: { color: C.bg, width: 2 } });
    T(s, d, { x: 1.0, y, w: 1.4, h: 0.3, fontSize: 12.5, bold: true, color: i === 2 ? C.orange : C.txt });
    T(s, t, { x: 2.4, y, w: 3.3, h: 0.95, fontSize: 12, color: C.txt2 });
  });
  ghost(s, "voisin.png", "!!voisin", 14.6, -3.2, 6.5, -14);
  caption(s, "Синхронный пулемёт LMG 08/15 на истребителе Fokker D.VII (1918). За ним — «ромбовый» камуфляж крыла", 8.3, 6.55, 4.5, 0.4, { color: C.txt2, align: "right" });
  s.addNotes("Главная проблема первых истребителей — винт перед лётчиком: стреляя вперёд, можно было отстрелить собственную лопасть. Француз Ролан Гаррос поставил на лопасти стальные клинья и сбил несколько самолётов, но 18 апреля 1915 года попал в плен. Вскоре фирма Фоккера создала синхронизатор: механизм связывал пулемёт с мотором, и выстрел происходил только в промежутке между лопастями. Истребители Фоккера полгода господствовали в небе — англичане назвали это «бичом Фоккера». На фото — синхронный пулемёт настоящего Fokker D.VII.");
}

// 6. LINEUP — light "product" slide
{
  const s = pres.addSlide();
  chrome(s, 6, { accent: C.blue, kicker: "ГЛАВА 3 · 1914–1918", title: "От «этажерки» к истребителю", light: true, titleW: 11 });
  const planes = [
    { f: "voisin.png", name: "«Вуазен»", meta: "Франция · 1914–1916", sp: "≈100–120", note: "Бомбардировщик-«этажерка» с толкающим винтом", col: C.ent, obj: "!!voisin" },
    { f: "spad.png", name: "SPAD S.XIII", meta: "Франция · 1917", sp: "≈210", note: "8 472 машины к концу 1918 г. Летали Фонк, Гинемер, Рикенбакер", col: C.ent },
    { f: "camel.png", name: "Sopwith Camel", meta: "Великобритания · 1917", sp: "≈185", note: "1 294 сбитых самолёта — рекорд среди истребителей союзников", col: C.ent },
    { f: "fokker.png", name: "Fokker D.VII", meta: "Германия · 1918", sp: "≈190", note: "Единственный самолёт, названный в тексте перемирия", col: C.cen },
    { f: "pfalz.png", name: "Pfalz D.XII", meta: "Германия · 1918", sp: "170", note: "Около 800 машин успели попасть на фронт", col: C.cen, obj: "!!pfalz" },
  ];
  planes.forEach((p, i) => {
    const x = 0.55 + i * 2.5, bw = 2.38, bh = 1.62;
    const r = ratio(p.f);
    let w = bw, h = bw * r;
    if (h > bh) { h = bh; w = bh / r; }
    img(s, p.f, x + (bw - w) / 2, 1.62 + (bh - h), w, h, p.obj ? { objectName: p.obj } : {});
    s.addShape(pres.shapes.OVAL, { x, y: 3.55, w: 0.12, h: 0.12, fill: { color: p.col }, line: { color: p.col, width: 0 } });
    T(s, p.name, { x: x + 0.2, y: 3.44, w: 2.2, h: 0.35, fontSize: 16, bold: true, color: C.ltxt });
    T(s, p.meta, { x, y: 3.82, w: 2.35, h: 0.3, fontSize: 11, color: C.ltxt2 });
    T(s, p.sp, { x, y: 4.3, w: 2.35, h: 0.8, fontSize: 38, bold: true, charSpacing: -1, color: C.ltxt });
    T(s, "км/ч максимальная скорость", { x, y: 5.08, w: 2.35, h: 0.3, fontSize: 10.5, color: C.ltxt3 });
    T(s, p.note, { x, y: 5.55, w: 2.25, h: 0.95, fontSize: 11.5, color: C.ltxt2 });
  });
  T(s, "За четыре года скорость выросла примерно вдвое, мощность моторов — в 2,5–3 раза, а вместо карабина появились два синхронных пулемёта.", { x: 0.55, y: 6.45, w: 10.9, h: 0.5, fontSize: 12, color: C.ltxt3 });
  s.addNotes("За войну самолёты изменились до неузнаваемости. Слева «Вуазен» — медленная «этажерка» с толкающим винтом, около 100 километров в час. Справа истребители 1917–1918 годов: SPAD, Sopwith Camel, Fokker D.VII и Pfalz, вдвое быстрее и с двумя синхронными пулемётами. SPAD выпустили почти в 8,5 тысяч экземпляров, а Camel сбил 1294 самолёта — больше всех истребителей союзников. Fokker D.VII так ценился, что перемирие отдельно требовало передать все эти машины союзникам. Все фото — настоящие самолёты из Смитсоновского музея.");
}

// 7. STRATEGIC BOMBING — night, violet; Voisin magic-move
{
  const s = pres.addSlide();
  chrome(s, 7, { accent: C.indigo, kicker: "ГЛАВА 4 · 1915–1918", title: "Война приходит в города", titleW: 7 });
  cover(s, "art_raid.jpg", 8.7, 0, W - 8.7, H);
  img(s, "grad_left.png", 8.65, 0, 2.4, H);
  img(s, "glow_violet.png", 3.4, -0.9, 7.2, 7.2, { transparency: 15 });
  img(s, "voisin.png", 3.85, 1.2, 6.4, null, { rotate: -9, objectName: "!!voisin" });
  const st = [["557", "погибших от налётов цеппелинов на Британию"], ["162", "жертвы налёта бомбардировщиков «Гота» на Лондон 13 июня 1917 г. — самого кровавого за войну"]];
  st.forEach(([n, t], i) => {
    const y = 3.95 + i * 1.45;
    T(s, n, { x: 0.6, y, w: 2.0, h: 0.9, fontSize: 54, bold: true, charSpacing: -1, color: C.txt });
    T(s, t, { x: 2.45, y: y + 0.18, w: 2.7, h: 1.0, fontSize: 12, color: C.txt2 });
  });
  T(s, "С января 1915 г. Англию бомбят германские дирижабли, с 1917-го — тяжёлые бомбардировщики «Гота». В ответ рождается ПВО: прожекторы, зенитки, ночные истребители.", { x: 0.6, y: 1.65, w: 3.6, h: 1.9, fontSize: 13, color: C.txt2 });
  img(s, "altimeter.png", 5.05, 4.4, 1.5);
  T(s, [{ text: "Альтиметр с цеппелина L\u00A049. ", options: { bold: true, color: C.txt } }, { text: "Шкала — до 8 км. Дирижабль посадили французские лётчики в октябре 1917 г.", options: { color: C.txt2 } }],
    { x: 6.7, y: 4.55, w: 1.95, h: 1.5, fontSize: 10.5 });
  caption(s, "«Вуазен» 8 — ночной бомбардировщик, 1916", 6.1, 3.7, 2.5, 0.3);
  ghost(s, "pfalz.png", "!!pfalz", 14.6, -3.4, 5.2, -16);
  caption(s, "Дж. Хардинг. «Воздушный налёт, Фер-ан-Тарденуа», около 1918 г.", 9.2, 6.7, 3.6, 0.4, { color: C.txt2, align: "right" });
  s.addNotes("Впервые война пришла к мирным жителям с неба. С 1915 года германские цеппелины бомбили Англию: за войну их налёты унесли 557 жизней. Альтиметр на слайде — с настоящего цеппелина L 49, который французские лётчики принудили к посадке в 1917 году. С 1917 года Лондон бомбили самолёты «Гота»: налёт 13 июня унёс 162 жизни. Союзники тоже создали бомбардировочную авиацию, например французские «Вуазены». В ответ появилась противовоздушная оборона: прожекторы, зенитки и ночные истребители. На картине американский военный художник изобразил ночной налёт.");
}

// 8. RUSSIA — blueprint
{
  const s = pres.addSlide();
  chrome(s, 8, { accent: C.teal, kicker: "ГЛАВА 5 · РОССИЯ", title: "Россия: крылья империи", titleW: 9 });
  s.background = { path: A("blueprint_bg.jpg") };
  img(s, "muromets_bp.png", 0.55, 1.9, 6.7);
  T(s, "«ИЛЬЯ МУРОМЕЦ» · И. И. СИКОРСКИЙ · 1913", { x: 0.6, y: 1.55, w: 7, h: 0.3, fontSize: 11, bold: true, charSpacing: 2, color: C.teal });
  T(s, [{ text: "Первый в мире серийный четырёхмоторный бомбардировщик. ", options: { bold: true, color: C.txt } },
    { text: "Эскадра воздушных кораблей совершила около 400 боевых вылетов и сбросила 65 т бомб, а в воздушном бою потеряла лишь один корабль.", options: { color: "C9DDF2" } }],
    { x: 0.6, y: 6.5, w: 7.2, h: 0.55, fontSize: 11 });
  const ppl = [
    ["Пётр Нестеров", "«мёртвая петля» (1913) и первый воздушный таран (1914)"],
    ["Игорь Сикорский", "«Русский витязь» (1913) — первый в мире четырёхмоторный самолёт"],
    ["Александр Казаков", "лучший ас России: 17 официальных побед"],
    ["Дмитрий Григорович", "летающие лодки М‑5 и М‑9 для Балтики и Чёрного моря"],
    ["Глеб Котельников", "ранцевый парашют РК‑1 (1911)"],
  ];
  ppl.forEach(([n, t], i) => {
    const y = 1.65 + i * 0.9;
    s.addShape(pres.shapes.LINE, { x: 8.3, y: y - 0.08, w: 4.4, h: 0, line: { color: "3E6E9E", width: 0.75 } });
    T(s, n, { x: 8.3, y, w: 4.4, h: 0.3, fontSize: 15, bold: true, color: C.txt });
    T(s, t, { x: 8.3, y: y + 0.32, w: 4.4, h: 0.5, fontSize: 12, color: "C9DDF2" });
  });
  ghost(s, "voisin.png", "!!voisin", -8.5, -3.6, 6.5, -20);
  ghost(s, "pfalz.png", "!!pfalz", 14.6, -3.4, 5.2, -16);
  T(s, [{ text: "Слабое место — моторы: ", options: { bold: true, color: C.orange } }, { text: "большую часть двигателей закупали за границей.", options: { color: "C9DDF2" } }],
    { x: 8.3, y: 6.25, w: 4.4, h: 0.6, fontSize: 12 });
  s.addNotes("Россия дала мировой авиации немало первых. Пётр Нестеров выполнил первую «мёртвую петлю» и первый воздушный таран. Игорь Сикорский построил «Русский витязь», первый в мире четырёхмоторный самолёт, а затем «Илью Муромца», чертёж которого вы видите. Эскадра этих гигантов совершила около 400 вылетов и потеряла в воздушном бою лишь один корабль. Александр Казаков одержал 17 официальных побед, Дмитрий Григорович создал летающие лодки, а Глеб Котельников изобрёл ранцевый парашют. Главной бедой были моторы: большую часть закупали за границей.");
}

// 9. ACES — leaderboard + Pfalz
{
  const s = pres.addSlide();
  chrome(s, 9, { accent: C.red, kicker: "ГЛАВА 6 · 1915–1918", title: "Асы: рыцари неба или охотники?", titleW: 9 });
  img(s, "glow_red.png", 7.2, -1.2, 7.0, 7.0, { transparency: 25 });
  img(s, "pfalz.png", 7.35, 1.35, 5.6, null, { rotate: -6, objectName: "!!pfalz" });
  const aces = [
    ["Манфред фон Рихтгофен", 80, C.cen], ["Рене Фонк", 75, C.ent], ["Билли Бишоп", 72, C.ent], ["Эдвард Мэннок", 61, C.ent], ["Жорж Гинемер", 53, C.ent],
    ["Освальд Бёльке", 40, C.cen], ["Франческо Баракка", 34, C.ent], ["Эдди Рикенбакер", 26, C.ent], ["Александр Казаков", 17, C.gold], ["Макс Иммельман", 15, C.cen],
  ];
  const bx = 3.05, bmax = 3.2;
  aces.forEach(([n, v, col], i) => {
    const y = 1.72 + i * 0.44;
    T(s, n, { x: 0.6, y, w: 2.4, h: 0.32, fontSize: 12.5, color: i === 0 ? C.txt : C.txt2, bold: i === 0 || col === C.gold, valign: "middle" });
    rrect(s, bx, y + 0.06, (bmax * v) / 80, 0.2, col, { rectRadius: 0.05 });
    T(s, String(v), { x: bx + (bmax * v) / 80 + 0.08, y, w: 0.6, h: 0.32, fontSize: 13, bold: true, color: C.txt, valign: "middle" });
  });
  [[C.cen, "Германия"], [C.ent, "Антанта"], [C.gold, "Россия"]].forEach(([c, t], i) => {
    s.addShape(pres.shapes.OVAL, { x: 0.6 + i * 1.45, y: 6.25, w: 0.13, h: 0.13, fill: { color: c }, line: { color: c, width: 0 } });
    T(s, t, { x: 0.8 + i * 1.45, y: 6.18, w: 1.2, h: 0.28, fontSize: 10.5, color: C.txt2 });
  });
  caption(s, "Официально засчитанные победы; в источниках числа могут отличаться.", 0.6, 6.55, 6, 0.3);
  caption(s, "Pfalz D.XII в «киношной» раскраске: после войны он снимался в Голливуде, в фильме «Утренний патруль» (1930)", 8.2, 4.35, 4.6, 0.5, { align: "right" });
  img(s, "trenchart.png", 7.55, 4.95, 1.65);
  T(s, [{ text: "Лётчики стали кумирами. ", options: { bold: true, color: C.txt } }, { text: "Солдаты делали модели самолётов из металла — «окопное искусство». Этот самолётик сделан во Франции.", options: { color: C.txt2 } },
    { text: "\n«Заповеди Бёльке» (1916) — первые правила боя: атакуй сверху, со стороны солнца, стреляй в упор.", options: { color: C.txt3 } }],
    { x: 9.4, y: 5.0, w: 3.45, h: 1.8, fontSize: 11 });
  s.addNotes("Асом называли лётчика, сбившего не менее пяти самолётов. Самым результативным стал Манфред фон Рихтгофен — «Красный барон», 80 побед. У французов лучшим был Рене Фонк, у британцев Эдвард Мэннок, у американцев Эдди Рикенбакер, а у нас Александр Казаков. Лётчики стали настоящими кумирами: солдаты даже делали модели самолётов из металла — такое «окопное искусство» вы видите на слайде. Освальд Бёльке первым записал правила воздушного боя. А ярко-красный Pfalz на фото после войны снимался в голливудском фильме «Утренний патруль».");
}

// 10. BATTLES — Western Front map
{
  const s = pres.addSlide();
  const g = GEO.west1914.pts;
  const spp = 4.55 / (g.stmihiel[1] - g.nieuport[1]);
  const P = placeMap(s, "west1914.jpg", "west1914", spp, "arras", [6.75, 1.35 + (g.arras[1] - g.nieuport[1]) * spp], "!!mapw");
  img(s, "grad_left.png", 0, 0, 6.6, H);
  img(s, "grad_bottom.png", 0, 6.0, W, 1.5);
  chrome(s, 10, { accent: C.orange, kicker: "ГЛАВА 7 · 1916–1918", title: "Битвы за небо", titleW: 5 });
  const pts = [
    ["arras", "Аррас", "«Кровавый апрель» 1917", "245 : 66", 1, -0.45],
    ["somme", "Сомма", "июль — ноябрь 1916", "141 день", 1, -0.05],
    ["verdun", "Верден", "февраль — декабрь 1916", "303 дня", -1, -0.78],
    ["stmihiel", "Сен-Мийель", "12–15 сентября 1918", "≈1 480", 1, 0.02],
  ];
  pts.forEach(([k, n, d, big, side, dy]) => {
    const [x, y] = P(k);
    marker(s, x, y, C.orange, 0.16);
    const lx = side > 0 ? x + 0.3 : x - 2.55;
    T(s, [{ text: n + "  ", options: { bold: true, fontSize: 15, color: C.txt } }, { text: big, options: { bold: true, fontSize: 15, color: C.orange, breakLine: true } }, { text: d, options: { fontSize: 10.5, color: C.txt2 } }],
      { x: lx, y: y + dy - 0.2, w: 2.25, h: 0.7, align: side > 0 ? "left" : "right" });
  });
  [["paris", "Париж"], ["brussels", "Брюссель"]].forEach(([k, n]) => {
    const [x, y] = P(k);
    s.addShape(pres.shapes.OVAL, { x: x - 0.05, y: y - 0.05, w: 0.1, h: 0.1, fill: { color: C.txt }, line: { color: C.txt, width: 0 } });
    T(s, n, { x: x + 0.1, y: y - 0.12, w: 1.3, h: 0.25, fontSize: 10.5, color: C.txt2 });
  });
  const rows = [
    ["Верден, 1916", "Французы впервые сводят истребители в отдельные группы, чтобы вернуть себе небо."],
    ["Сомма, 1916", "Британцы наступают и в воздухе; немцы в ответ создают истребительные эскадрильи."],
    ["Аррас, апрель 1917", "«Кровавый апрель»: британцы теряют 245 самолётов, немцы\u00A0—\u00A066."],
    ["Сен-Мийель, 1918", "Билли Митчелл собирает почти 1 500 самолётов — крупнейшая авиаоперация войны."],
  ];
  rows.forEach(([h, t], i) => {
    const y = 1.72 + i * 1.02;
    T(s, h, { x: 0.6, y, w: 4.6, h: 0.3, fontSize: 14, bold: true, color: C.txt });
    T(s, t, { x: 0.6, y: y + 0.32, w: 4.4, h: 0.6, fontSize: 11.5, color: C.txt2 });
  });
  T(s, "«Роз, очистите мне небо! Я ослеп!»", { x: 0.6, y: 5.95, w: 4.6, h: 0.45, fontFace: SERIF, italic: true, fontSize: 17, color: C.orange });
  caption(s, "Генерал Петен — командиру истребителей де Розу, Верден, 1916", 0.6, 6.42, 4.6, 0.3);
  ghost(s, "pfalz.png", "!!pfalz", 14.8, 2.4, 5.6, -6);
  ghost(s, "n9h.png", "!!n9h", -5.5, 8.4, 3.9, -12);
  s.addShape(pres.shapes.LINE, { x: 9.35, y: 6.82, w: 0.45, h: 0, line: { color: "FF6B5E", width: 2.25 } });
  T(s, "линия Западного фронта 1915–1917 (упрощённо)", { x: 9.9, y: 6.7, w: 3.0, h: 0.25, fontSize: 10, color: C.txt2 });
  s.addNotes("Карта показывает Западный фронт: красная линия — окопы, которые почти не двигались с 1915 по 1917 год. Под Верденом в 1916 году впервые развернулась настоящая борьба за господство в воздухе, и французы собрали истребители в отдельные группы. На Сомме британцы наступали и в небе, а немцы ответили истребительными эскадрильями. В апреле 1917 года под Аррасом британцы потеряли 245 самолётов против 66 немецких. А в сентябре 1918-го при Сен-Мийеле американец Билли Митчелл собрал почти полторы тысячи машин — крупнейшую авиаоперацию войны.");
}

// 11. NAVAL — pan the same map to the North Sea (Morph)
{
  const s = pres.addSlide();
  const g = GEO.west1914.pts;
  const spp = 0.0036;
  const P = placeMap(s, "west1914.jpg", "west1914", spp, "london", [6.6, 5.4], "!!mapw");
  img(s, "grad_left.png", 0, 0, 7.2, H);
  img(s, "grad_bottom.png", 0, 6.0, W, 1.5);
  chrome(s, 11, { accent: C.teal, kicker: "ГЛАВА 8 · НА МОРЕ", title: "Крылья над морем", titleW: 5.5 });
  const mk = [
    ["tondern", "Тондерн", "19.07.1918", -1],
    ["cuxhaven", "Куксхафен", "25.12.1914", -1],
    ["london", "Лондон", "цель цеппелинов и «Гот»", 1],
  ];
  mk.forEach(([k, n, d, side]) => {
    const [x, y] = P(k);
    marker(s, x, y, C.teal, 0.15);
    T(s, [{ text: n, options: { bold: true, fontSize: 14, color: C.txt, breakLine: true } }, { text: d, options: { fontSize: 10.5, color: C.txt2 } }],
      { x: side > 0 ? x + 0.28 : x - 2.1, y: y - 0.25, w: 1.85, h: 0.6, align: side > 0 ? "left" : "right" });
  });
  img(s, "n9h.png", 7.25, 2.55, 3.9, null, { rotate: -4, objectName: "!!n9h" });
  ghost(s, "suit.png", "!!suit", 8.55, 8.4, 5.3 / ratio("suit.png"));
  ghost(s, "helmet.png", "!!helmet", 11.2, 8.6, 1.35);
  ghost(s, "mask.png", "!!mask", 11.05, 9.0, 1.6);
  ghost(s, "goggles.png", "!!goggles", 11.0, 9.4, 1.75);
  caption(s, "Curtiss N-9H — учебный гидроплан ВМС США: на нём подготовили 2 500 морских лётчиков", 7.3, 4.2, 3.9, 0.45, { color: C.txt2 });
  const tl = [
    ["25.12.1914", "Куксхафенский рейд: британские гидросамолёты с кораблей атакуют базу цеппелинов"],
    ["12.08.1915", "Дарданеллы: гидросамолёт Short 184 впервые атакует судно торпедой"],
    ["1916", "Гидрокрейсера Черноморского флота наносят удары по побережью Турции"],
    ["17.09.1916", "Ян Нагурский делает «мёртвую петлю» на летающей лодке М‑9"],
    ["19.07.1918", "Семь Sopwith Camel взлетают с HMS Furious и сжигают цеппелины L 54 и L 60"],
  ];
  tl.forEach(([d, t], i) => {
    const y = 1.68 + i * 1.02;
    T(s, d, { x: 0.6, y, w: 1.4, h: 0.3, fontSize: 12.5, bold: true, color: C.teal });
    T(s, t, { x: 2.05, y, w: 3.7, h: 0.95, fontSize: 12, color: C.txt2 });
  });
  s.addNotes("Карта смещается на север, к Северному морю. Уже в декабре 1914 года британские гидросамолёты атаковали базу цеппелинов у Куксхафена. В 1915 году в Дарданеллах гидросамолёт впервые применил торпеду. На Чёрном море действовали русские гидрокрейсера, а лётчик Нагурский выполнил «мёртвую петлю» на летающей лодке Григоровича М-9. В июле 1918 года семь истребителей Camel взлетели с авианосца Furious и уничтожили два цеппелина в Тондерне. На фото — Curtiss N-9H, на котором подготовили 2 500 лётчиков ВМС США.");
}

// 12. PILOT'S LIFE — flight gear callouts
{
  const s = pres.addSlide();
  chrome(s, 12, { accent: C.orange, kicker: "ГЛАВА 9 · ЛЮДИ", title: "Жизнь на высоте 5 000 метров", titleW: 9 });
  img(s, "glow_amber.png", 7.0, -0.2, 6.6, 6.6, { transparency: 35 });
  img(s, "suit.png", 8.55, 1.55, null, 5.3, { w: 5.3 / ratio("suit.png"), objectName: "!!suit" });
  img(s, "helmet.png", 11.2, 1.45, 1.35, null, { objectName: "!!helmet" });
  img(s, "mask.png", 11.05, 3.2, 1.6, null, { objectName: "!!mask" });
  img(s, "goggles.png", 11.0, 4.85, 1.75, null, { objectName: "!!goggles" });
  ghost(s, "n9h.png", "!!n9h", 14.6, 0.6, 3.9, -4);
  ghost(s, "liberty.png", "!!engine", 14.4, 1.15, 5.2);
  img(s, "vaporizer.png", 7.2, 3.55, 0.9);
  const call = (x, y, w, head, text, align = "left") => T(s, [{ text: head, options: { bold: true, color: C.txt, breakLine: true } }, { text, options: { color: C.txt2 } }], { x, y, w, h: 1.0, fontSize: 10.5, align });
  call(5.45, 1.75, 2.9, "Кожаный комбинезон", "Надевали поверх тёплой одежды: в открытой кабине — мороз и ветер", "right");
  call(5.45, 3.55, 1.65, "Жидкий кислород", "Испаритель немецкого экипажа", "right");
  call(10.95, 5.85, 1.95, "Маска, шлем, очки", "от ветра, масла и мороза до\u00A0−20\u00A0°C", "left");
  T(s, [{ text: "Без парашюта. ", options: { bold: true, color: C.orange } },
    { text: "Лётчикам Антанты парашюты так и не выдали — их имели только наблюдатели на аэростатах. Немцы получили парашюты Хайнеке лишь в 1918 г.", options: { color: C.txt2 } }],
    { x: 0.6, y: 1.7, w: 4.6, h: 1.35, fontSize: 13 });
  T(s, [{ text: "Опасна была и учёба. ", options: { bold: true, color: C.orange } },
    { text: "На Sopwith Camel почти столько же лётчиков погибло в авариях, сколько в боях.", options: { color: C.txt2 } }],
    { x: 0.6, y: 3.15, w: 4.6, h: 0.9, fontSize: 13 });
  cover(s, "art_balloons.jpg", 0.6, 4.2, 2.75, 2.35);
  caption(s, "Дж. Хардинг, 1918: наблюдатели прыгают с парашютами из горящих аэростатов", 3.5, 5.5, 1.9, 1.0);
  caption(s, "Снаряжение американского лётчика Э. Гарднера, 1918–1919 (Национальный почтовый музей США). Такое же носили и военные лётчики", 5.45, 6.45, 2.95, 0.6, { fontSize: 8.5, align: "right" });
  s.addNotes("Романтика неба скрывала тяжёлую жизнь. Кабины были открытыми, и на высоте лётчиков сковывал мороз, поэтому они носили кожаные комбинезоны, маски и очки — на слайде настоящее снаряжение американского лётчика 1918 года. Выше четырёх-пяти километров не хватало воздуха, и немецкие экипажи брали с собой жидкий кислород. Лётчики Антанты воевали без парашютов, их имели только наблюдатели на аэростатах, как на рисунке военного художника. Опасной была даже учёба: на Camel почти столько же лётчиков погибло в авариях, сколько в боях.");
}

// 13. RESULTS — light slide with the Liberty engine
{
  const s = pres.addSlide();
  chrome(s, 13, { accent: C.goldDark, kicker: "ИТОГИ · 1914 → 1918", title: "Итоги: взрывной рост", light: true, titleW: 7 });
  img(s, "liberty.png", 7.55, 1.15, 5.2, null, { objectName: "!!engine" });
  ghost(s, "suit.png", "!!suit", 8.55, 8.4, 5.3 / ratio("suit.png"));
  ghost(s, "helmet.png", "!!helmet", 11.2, 8.6, 1.35);
  ghost(s, "mask.png", "!!mask", 11.05, 9.0, 1.6);
  ghost(s, "goggles.png", "!!goggles", 11.0, 9.4, 1.75);
  ghost(s, "stamp.png", "!!stamp", 13.9, -4.2, 2.9, 48);
  T(s, [{ text: "Мотор Liberty V‑12 (США). ", options: { bold: true, color: C.ltxt } }, { text: "Автозаводы Ford, Packard, Buick и другие выпустили 20 748 таких моторов ещё до перемирия.", options: { color: C.ltxt2 } }],
    { x: 7.75, y: 5.75, w: 4.9, h: 0.8, fontSize: 11.5 });
  T(s, "≈670", { x: 0.6, y: 1.65, w: 2.6, h: 0.95, fontSize: 56, bold: true, charSpacing: -1, color: C.ltxt });
  T(s, "самолётов первой линии у четырёх держав в августе 1914", { x: 0.6, y: 2.6, w: 2.6, h: 0.7, fontSize: 11.5, color: C.ltxt2 });
  T(s, "→", { x: 3.05, y: 1.8, w: 0.6, h: 0.7, fontSize: 36, color: C.ltxt3, align: "center" });
  T(s, "22 647", { x: 3.7, y: 1.65, w: 3.4, h: 0.95, fontSize: 56, bold: true, charSpacing: -1, color: C.goldDark });
  T(s, "самолётов только в британских ВВС к 11 ноября 1918", { x: 3.7, y: 2.6, w: 3.2, h: 0.7, fontSize: 11.5, color: C.ltxt2 });
  // production ranges
  T(s, "Выпуск самолётов за войну, тыс.", { x: 0.6, y: 3.55, w: 6, h: 0.35, fontSize: 14, bold: true, color: C.ltxt });
  const x0 = 2.0, sc = 4.0 / 70;
  [0, 20, 40, 60].forEach((v) => {
    s.addShape(pres.shapes.LINE, { x: x0 + v * sc, y: 4.05, w: 0, h: 1.55, line: { color: C.lline, width: 0.75 } });
    T(s, String(v), { x: x0 + v * sc - 0.3, y: 5.62, w: 0.6, h: 0.25, fontSize: 10, color: C.ltxt3, align: "center" });
  });
  [["Франция", 52, 68, "52–68"], ["Британия", 33, 55, "33–55"], ["Германия", 48, 48, "≈48"]].forEach(([n, lo, hi, l], i) => {
    const y = 4.12 + i * 0.5;
    T(s, n, { x: 0.6, y, w: 1.3, h: 0.36, fontSize: 12.5, bold: true, color: C.ltxt, valign: "middle" });
    rect(s, x0, y + 0.06, lo * sc, 0.24, C.goldDark);
    if (hi > lo) rect(s, x0 + lo * sc, y + 0.06, (hi - lo) * sc, 0.24, "E6C77E");
    T(s, l, { x: x0 + hi * sc + 0.08, y, w: 0.8, h: 0.36, fontSize: 12, bold: true, color: C.ltxt, valign: "middle" });
  });
  caption(s, "Тёмная часть — минимальная оценка, светлая — разброс: источники по-разному считают учебные машины.", 0.6, 5.9, 6.3, 0.35, { color: C.ltxt3 });
  T(s, [{ text: "150 000+ ", options: { bold: true, color: C.goldDark, fontSize: 20 } }, { text: "самолётов построено за войну. 1 апреля 1918 г. созданы Королевские ВВС (RAF) — первые в мире самостоятельные военно-воздушные силы.", options: { color: C.ltxt2, fontSize: 12 } }],
    { x: 0.6, y: 6.28, w: 6.6, h: 0.75 });
  s.addNotes("Цифры показывают, насколько стремительным был рост. В 1914 году у четырёх крупнейших держав было около 670 самолётов первой линии. К концу войны только в британских ВВС насчитывалось 22 647 машин. Всего было построено больше 150 тысяч самолётов, а точные цифры по странам в источниках расходятся, поэтому я показываю разброс. Авиация стала отраслью промышленности: американские автозаводы Ford, Packard и Buick выпустили больше двадцати тысяч моторов Liberty. А 1 апреля 1918 года появились британские Королевские ВВС — первые самостоятельные военно-воздушные силы в мире.");
}

// 14. LEGACY — Inverted Jenny
{
  const s = pres.addSlide();
  chrome(s, 14, { accent: C.teal, kicker: "ФИНАЛ · ПОСЛЕ 1918", title: "Наследие: небо после войны", titleW: 8 });
  img(s, "glow_blue.png", 7.7, -0.5, 6.2, 6.2, { transparency: 20 });
  img(s, "stamp.png", 9.15, 1.2, 2.9, null, { rotate: 6, objectName: "!!stamp" });
  ghost(s, "liberty.png", "!!engine", -6.2, 1.15, 5.2);
  T(s, [{ text: "«Перевёрнутая Дженни», 1918. ", options: { bold: true, color: C.txt } }, { text: "Марку выпустили к открытию авиапочты США 15 мая 1918 г. Лист из 100 марок с перевёрнутым самолётом — знаменитая ошибка печати.", options: { color: C.txt2 } }],
    { x: 8.65, y: 4.35, w: 4.1, h: 1.2, fontSize: 11 });
  const items = [
    ["1919", "Версальский договор (ст. 198) запрещает Германии военную авиацию"],
    ["14–15 июня 1919", "Алкок и Браун впервые без посадки перелетают Атлантику на бомбардировщике Vickers Vimy"],
    ["25 августа 1919", "Открывается регулярная международная авиалиния Лондон — Париж"],
    ["1921", "Джулио Дуэ пишет «Господство в воздухе»: войну решает авиация"],
  ];
  items.forEach(([d, t], i) => {
    const x = 0.6 + (i % 2) * 3.85, y = 1.7 + Math.floor(i / 2) * 1.45;
    T(s, d, { x, y, w: 3.6, h: 0.3, fontSize: 13, bold: true, color: C.teal });
    T(s, t, { x, y: y + 0.33, w: 3.5, h: 0.95, fontSize: 12, color: C.txt2 });
  });
  T(s, "За четыре года самолёт прошёл путь от «спорта» до самостоятельного рода войск — и навсегда изменил войны XX века.", { x: 0.6, y: 4.6, w: 7.6, h: 1.2, fontFace: SERIF, italic: true, fontSize: 22, color: C.txt });
  T(s, "Источники: Национальный музей авиации и космонавтики США (описания экспонатов); Imperial War Museums; J. H. Morrow, «The Great War in the Air» (1993); C. Shores, N. Franks, R. Guest, «Above the Trenches» (1990); М. А. Хайрулин, «Илья Муромец. Гордость русской авиации» (2010).\nФото и рисунки: Smithsonian Open Access (CC0). Карты: Natural Earth; A. Ourednik, historical-basemaps.",
    { x: 0.6, y: 5.95, w: 12.1, h: 0.95, fontSize: 9, color: C.txt3 });
  s.addNotes("Первая мировая война определила будущее авиации. Версальский договор запретил Германии военную авиацию, настолько её стали опасаться. Военные технологии быстро пришли в мирную жизнь: уже в 1919 году Алкок и Браун на бывшем бомбардировщике перелетели Атлантику, открылась авиалиния Лондон — Париж, а в США с мая 1918 года летала авиапочта. Марка «Перевёрнутая Дженни» напечатана к её открытию и стала самой знаменитой ошибкой в истории филателии. Вывод: за четыре года авиация превратилась из забавы в силу, изменившую войны XX века. Спасибо за внимание!");
}

pres.writeFile({ fileName: path.join(__dirname, "deck_raw.pptx") }).then(() => console.log("written"));
