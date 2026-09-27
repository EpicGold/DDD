const pptxgen = require("pptxgenjs");
const art = require("./art");

const W = 13.333, H = 7.5, TOTAL = 14;
const C = {
  paper: "EFE8D8", card: "E3D8BE", line: "C9BD9C", ink: "1E1D1A", muted: "57513F",
  panel: "27301F", onPanel: "F2EBDA", khaki: "D8C79F", khakiD: "A8966C", red: "A3262A", olive: "4A5A2E",
};
const HF = "Cambria", BF = "Calibri";

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = "Авиация Первой мировой войны";
  pres.subject = "История. Презентация на 14 слайдов";

  // ---------- artwork ----------
  const hex = (c) => "#" + c;
  const IMG = {
    plane: await art.png(art.biplaneTop(hex(C.khaki), hex(C.panel)), 900),
    tri: await art.png(art.triplaneSide(hex(C.khaki), hex(C.panel)), 900),
    muromets: await art.png(art.muromets(hex(C.khaki), hex(C.panel)), 1000),
    photo: await art.png(art.aerialPhoto(), 900),
    sync: await art.png(art.synchronizer(hex(C.khaki), "#D9573F", hex(C.panel)), 900),
    carrier: await art.png(art.carrier(hex(C.khaki), hex(C.panel)), 1000),
  };
  const iconNames = ["GiBinoculars", "GiCrosshair", "GiPhotoCamera", "GiPistolGun", "GiFallingBomb", "GiMachineGun",
    "GiAnchor", "GiZeppelin", "GiBomber", "GiAntiAircraftGun", "GiBiplane", "GiParachute", "GiThermometerCold",
    "GiDrop", "GiSteampunkGoggles", "GiBrodieHelmet", "GiOpenBook", "GiScrollUnfurled", "GiCommercialAirplane",
    "GiAirplaneDeparture", "GiLaurelCrown", "GiFactory", "GiCog", "GiMedal"];
  const ICON = {}, ICON_D = {};
  for (const n of iconNames) {
    ICON[n] = await art.icon(n, C.khaki);   // light icon, for dark circles / panel
    ICON_D[n] = await art.icon(n, C.panel); // dark icon, for light circles
  }

  // ---------- helpers ----------
  const T = (s, text, o) => s.addText(text, { fontFace: BF, fontSize: 14, color: C.ink, margin: 0, valign: "top", isTextBox: true, ...o });
  const card = (s, x, y, w, h, color = C.card) =>
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color }, line: { color, width: 0 } });
  const iconDot = (s, name, x, y, d, onDark = false) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: onDark ? C.khaki : C.panel }, line: { color: onDark ? C.khaki : C.panel, width: 0 } });
    const p = d * 0.22;
    s.addImage({ data: onDark ? ICON_D[name] : ICON[name], x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
  };

  // Persistent morph objects: !!panel, !!plane, !!year, !!title, !!count
  function base(n, cfg) {
    const s = pres.addSlide();
    s.background = { color: C.paper };
    const p = cfg.panel;
    s.addShape(pres.shapes.RECTANGLE, { x: p[0], y: p[1], w: p[2], h: p[3], fill: { color: C.panel }, line: { color: C.panel, width: 0 }, objectName: "!!panel" });
    const y = cfg.year;
    T(s, y.text, { x: y.x, y: y.y, w: y.w || 4, h: y.h || 0.6, fontFace: HF, fontSize: y.size || 28, bold: true, color: C.khaki, objectName: "!!year" });
    if (cfg.title) {
      const t = cfg.title;
      T(s, t.text, { x: t.x, y: t.y, w: t.w, h: t.h || 0.8, fontFace: HF, fontSize: t.size || 32, bold: true, color: t.dark ? C.onPanel : C.ink, valign: "middle", objectName: "!!title" });
    }
    const c = cfg.count || {};
    T(s, `${String(n).padStart(2, "0")} / ${TOTAL}`, { x: c.x ?? W - 1.55, y: 6.95, w: 1.0, h: 0.3, fontSize: 10, align: "right", color: c.dark ? C.khaki : C.muted, objectName: "!!count" });
    return s;
  }
  const plane = (s, x, y, w, rotate = 0) => s.addImage({ data: IMG.plane, x, y, w, h: w * 0.75, rotate, objectName: "!!plane" });

  // =====================================================================
  // 1. Title
  {
    const s = base(1, { panel: [0, 0, W, H], year: { text: "1914–1918", x: 0.8, y: 1.15, w: 5, size: 30 }, count: { dark: true } });
    plane(s, 7.6, 0.9, 5.0, 28);
    T(s, "Авиация Первой мировой войны", { x: 0.8, y: 1.95, w: 7.2, h: 2.4, fontFace: HF, fontSize: 52, bold: true, color: C.onPanel, valign: "middle", objectName: "!!title" });
    T(s, "Как небо стало полем боя", { x: 0.8, y: 4.45, w: 7, h: 0.6, fontFace: HF, fontSize: 24, italic: true, color: C.khaki });
    T(s, "Подготовил(а): ____________________      Класс / группа: ________      2026", { x: 0.8, y: 6.3, w: 9, h: 0.4, fontSize: 14, color: C.khakiD });
    s.addNotes("Добрый день! Тема моего выступления — авиация Первой мировой войны. В 1914 году самолёт был хрупкой «этажеркой» из дерева и полотна, которую многие генералы считали забавой. Через четыре года небо стало полноценным полем боя: появились истребители, бомбардировщики, асы и первые самостоятельные военно-воздушные силы. Я расскажу, как это произошло, какие изобретения изменили войну в воздухе и какую роль сыграли российские лётчики и конструкторы.");
  }

  // 2. Before the war
  {
    const s = base(2, { panel: [0, 0, 4.4, H], year: { text: "1903–1913", x: 0.5, y: 0.5, w: 3.6, size: 30 },
      title: { text: "Накануне: спорт или оружие?", x: 4.9, y: 0.4, w: 7.9 } });
    s.addChart(pres.charts.BAR, [{ name: "Самолёты", labels: ["Британия*", "Франция", "Германия", "Россия"], values: [56, 138, 232, 244] }], {
      x: 0.3, y: 1.35, w: 3.85, h: 3.4, barDir: "bar", chartColors: [C.khaki], barGapWidthPct: 55,
      showTitle: true, title: "Самолёты к 1 августа 1914 г.", titleColor: C.onPanel, titleFontFace: HF, titleFontSize: 14,
      catAxisLabelColor: C.onPanel, catAxisLabelFontSize: 12, catAxisLabelFontFace: BF, catAxisLineShow: false,
      valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
      showValue: true, dataLabelColor: C.onPanel, dataLabelFontSize: 12, dataLabelPosition: "outEnd", showLegend: false,
      plotArea: { fill: { color: C.panel } },
    });
    T(s, "* Британия — машины первой линии. Оценки численности в источниках различаются.", { x: 0.5, y: 4.8, w: 3.5, h: 0.6, fontSize: 10, color: C.khakiD });
    plane(s, 1.3, 5.55, 1.8, -8);
    // timeline
    const xs = [4.9, 6.9, 8.9, 10.9], cw = 1.85;
    s.addShape(pres.shapes.LINE, { x: 4.95, y: 2.3, w: 7.85, h: 0, line: { color: C.khakiD, width: 1.5 } });
    const events = [
      ["1903", "«Флайер» братьев Райт: первый управляемый полёт с мотором длится 12 секунд"],
      ["1909", "Луи Блерио перелетает Ла-Манш за 37 минут"],
      ["1911", "Итало-турецкая война: первая разведка и первая бомбардировка с аэроплана (Дж. Гавотти, 1 ноября)"],
      ["1913", "П. Н. Нестеров впервые выполняет «мёртвую петлю» над Киевом"],
    ];
    events.forEach(([yr, txt], i) => {
      T(s, yr, { x: xs[i], y: 1.55, w: cw, h: 0.5, fontFace: HF, fontSize: 22, bold: true, color: C.red });
      s.addShape(pres.shapes.OVAL, { x: xs[i], y: 2.2, w: 0.2, h: 0.2, fill: { color: C.panel }, line: { color: C.paper, width: 2 } });
      T(s, txt, { x: xs[i], y: 2.6, w: cw - 0.1, h: 1.6, fontSize: 13 });
    });
    card(s, 4.9, 4.55, 4.75, 2.25);
    T(s, [
      { text: "«Авиация — это хороший спорт, но для армии аэроплан — ноль»", options: { fontFace: HF, fontSize: 17, italic: true, breakLine: true } },
      { text: "Фраза, приписываемая Фердинанду Фошу (около 1910 г.). До войны военные видели в самолёте в лучшем случае «летающий бинокль».", options: { fontSize: 12, color: C.muted, paraSpaceBefore: 8 } },
    ], { x: 5.15, y: 4.75, w: 4.25, h: 1.9 });
    T(s, "≈670", { x: 9.95, y: 4.5, w: 2.9, h: 1.0, fontFace: HF, fontSize: 54, bold: true, color: C.red });
    T(s, "самолётов первой линии было у России, Германии, Франции и Британии вместе в начале войны", { x: 9.95, y: 5.5, w: 2.85, h: 1.3, fontSize: 13, color: C.ink });
    s.addNotes("Всего за десять лет до войны братья Райт впервые поднялись в воздух на самолёте с мотором. В 1909 году Блерио перелетел Ла-Манш, а в 1911-м итальянцы в Ливии впервые применили самолёты в бою: лейтенант Гавотти сбросил с аэроплана несколько гранат. В 1913 году наш Пётр Нестеров выполнил «мёртвую петлю». При этом многие генералы считали авиацию спортом. К августу 1914 года у четырёх ведущих держав было лишь около 670 самолётов первой линии, и Россия по их числу была среди лидеров.");
  }

  // 3. Reconnaissance
  {
    const s = base(3, { panel: [8.6, 0, W - 8.6, H], year: { text: "1914", x: 9.05, y: 0.5, w: 3.8, size: 30 },
      title: { text: "Глаза армии: разведка с воздуха", x: 0.55, y: 0.4, w: 7.9, size: 29 }, count: { dark: true } });
    s.addImage({ data: IMG.photo, x: 9.05, y: 1.4, w: 3.85, h: 3.85 });
    plane(s, 11.35, 3.95, 1.5, 215);
    T(s, "Реконструкция: траншеи на аэрофотоснимке, разбитом сеткой квадратов для артиллерии", { x: 9.05, y: 5.4, w: 3.85, h: 0.8, fontSize: 11, color: C.khaki });
    const rows = [
      ["GiBinoculars", "Марна, сентябрь 1914", "3 сентября лётчики заметили, что 1-я германская армия фон Клюка поворачивает восточнее Парижа. Эти данные помогли союзникам нанести контрудар на Марне."],
      ["GiCrosshair", "Корректировка огня", "С сентября 1914 г. британские экипажи передают поправки артиллерии по радио. Пушки начинают «видеть» за линию горизонта."],
      ["GiPhotoCamera", "Аэрофотосъёмка", "В марте 1915 г. у Нев-Шапеля британцы впервые готовят наступление по картам, составленным с аэроснимков."],
    ];
    rows.forEach(([ic, head, body], i) => {
      const y = 1.45 + i * 1.4;
      card(s, 0.55, y, 7.6, 1.22);
      iconDot(s, ic, 0.75, y + 0.26, 0.7);
      T(s, [{ text: head, options: { bold: true, fontSize: 15, breakLine: true } }, { text: body, options: { fontSize: 13 } }], { x: 1.65, y: y + 0.13, w: 6.3, h: 1.0 });
    });
    T(s, [
      { text: "«Без лётчиков не было бы Танненберга»", options: { fontFace: HF, fontSize: 20, italic: true, color: C.red, breakLine: true } },
      { text: "Слова, приписываемые П. фон Гинденбургу: германская авиаразведка следила за движением русской 2-й армии", options: { fontSize: 12, color: C.muted } },
    ], { x: 0.55, y: 5.75, w: 7.6, h: 1.1 });
    s.addNotes("В первые месяцы войны главной задачей самолёта была разведка. 3 сентября 1914 года британские и французские лётчики увидели, что армия фон Клюка обходит Париж с востока, подставляя фланг. Это помогло союзникам начать контрнаступление на Марне и остановить германский блицкриг. На Восточном фронте немецкие разведчики следили за русскими войсками перед Танненбергом. Вскоре появились корректировка артиллерии по радио и аэрофотосъёмка: к 1915 году по снимкам уже составляли точные карты вражеских окопов.");
  }

  // 4. Birth of air combat
  {
    const s = base(4, { panel: [0, 0, 6.1, H], year: { text: "1914", x: 0.55, y: 1.25, w: 3, size: 30 },
      title: { text: "Первые воздушные бои", x: 0.55, y: 0.4, w: 5.4, size: 27, dark: true } });
    T(s, [
      { text: "8 СЕНТЯБРЯ · ВОСТОЧНЫЙ ФРОНТ", options: { bold: true, fontSize: 14, color: C.khaki, charSpacing: 1, breakLine: true } },
      { text: "Под Жолквой штабс-капитан П. Н. Нестеров таранит австрийский разведчик «Альбатрос». Погибают оба экипажа.", options: { fontSize: 16, color: C.onPanel, paraSpaceBefore: 6, breakLine: true } },
      { text: "Первый воздушный таран в истории.", options: { fontSize: 16, bold: true, color: C.onPanel, paraSpaceBefore: 6 } },
    ], { x: 0.55, y: 2.25, w: 5.1, h: 2.6 });
    plane(s, 3.6, 4.85, 2.0, -35);
    T(s, "Нестеров первым доказал, что самолёт может уничтожить самолёт, но заплатил за это жизнью.", { x: 0.55, y: 5.2, w: 2.9, h: 1.5, fontSize: 12, italic: true, color: C.khaki });
    T(s, [
      { text: "5 ОКТЯБРЯ · ЗАПАДНЫЙ ФРОНТ", options: { bold: true, fontSize: 14, color: C.red, charSpacing: 1, breakLine: true } },
      { text: "Под Реймсом сержант Жозеф Франц и механик Луи Кено на «Вуазене» сбивают германский «Авиатик» из пулемёта «Гочкис».", options: { fontSize: 16, paraSpaceBefore: 6, breakLine: true } },
      { text: "Первая победа, одержанная огнём пулемёта.", options: { fontSize: 16, bold: true, paraSpaceBefore: 6 } },
    ], { x: 6.6, y: 1.45, w: 6.2, h: 2.6 });
    T(s, "Чем воевали в воздухе в 1914 году", { x: 6.6, y: 4.35, w: 6.2, h: 0.4, fontFace: HF, fontSize: 17, bold: true });
    const steps = [["GiPistolGun", "Пистолеты и карабины в руках лётчика"], ["GiFallingBomb", "Стальные стрелы-флешетты против пехоты"], ["GiMachineGun", "Пулемёт у наблюдателя"]];
    steps.forEach(([ic, txt], i) => {
      const x = 6.6 + i * 2.1;
      iconDot(s, ic, x, 4.95, 0.75);
      T(s, txt, { x, y: 5.85, w: 1.85, h: 0.9, fontSize: 12.5 });
      if (i < 2) T(s, "→", { x: x + 0.95, y: 5.05, w: 0.9, h: 0.5, fontSize: 24, color: C.khakiD, align: "center" });
    });
    s.addNotes("Сначала лётчики противников иногда просто приветствовали друг друга. Но очень быстро в ход пошли пистолеты и карабины. 8 сентября 1914 года Пётр Нестеров, пытаясь помешать австрийскому разведчику, ударил его своим самолётом. Погибли и австрийцы, и сам Нестеров. Это был первый воздушный таран. А 5 октября французский экипаж Франца и Кено сбил немецкий самолёт из пулемёта. С этого момента стало ясно, что самолёту нужно оружие, а войне в воздухе — новая техника.");
  }

  // 5. Synchroniser
  {
    const s = base(5, { panel: [8.3, 0, W - 8.3, H], year: { text: "1915", x: 8.75, y: 0.5, w: 3, size: 30 },
      title: { text: "Стрельба сквозь винт", x: 0.55, y: 0.4, w: 7.4 }, count: { dark: true } });
    s.addImage({ data: IMG.sync, x: 8.75, y: 1.3, w: 4.1, h: 3.9 });
    plane(s, 11.6, 0.35, 1.2, 20);
    T(s, "Синхронизатор связывает пулемёт с мотором: выстрел происходит только тогда, когда перед стволом нет лопасти.", { x: 8.75, y: 5.4, w: 4.1, h: 1.2, fontSize: 13, color: C.onPanel });
    const tl = [
      ["1 апреля 1915", "Ролан Гаррос сбивает первый самолёт, стреляя через винт: стальные клинья на лопастях отражают пули"],
      ["18 апреля 1915", "Гаррос садится за линией фронта и попадает в плен. Немцы изучают его «Моран-Солнье L»"],
      ["Лето 1915", "Инженеры Антона Фоккера ставят синхронизатор на моноплан Fokker E.I «Айндеккер»"],
      ["1 июля 1915", "Курт Винтгенс проводит первый бой с синхронным пулемётом. Начинается «бич Фоккера»"],
      ["Начало 1916", "Nieuport 11 и Airco DH.2 возвращают союзникам равенство в воздухе"],
    ];
    s.addShape(pres.shapes.LINE, { x: 2.3, y: 1.6, w: 0, h: 5.05, line: { color: C.khakiD, width: 1.5 } });
    tl.forEach(([d, txt], i) => {
      const y = 1.45 + i * 1.07;
      T(s, d, { x: 0.55, y: y, w: 1.55, h: 0.6, fontSize: 13, bold: true, color: i === 3 ? C.red : C.olive, align: "right" });
      s.addShape(pres.shapes.OVAL, { x: 2.21, y: y + 0.07, w: 0.18, h: 0.18, fill: { color: i === 3 ? C.red : C.panel }, line: { color: C.paper, width: 2 } });
      T(s, txt, { x: 2.6, y: y, w: 5.35, h: 0.95, fontSize: 14 });
    });
    s.addNotes("Главная проблема ранних истребителей — винт перед пилотом. Стрелять вперёд значило рисковать отстрелить собственную лопасть. Француз Ролан Гаррос поставил на винт стальные клинья-отражатели и за две недели сбил три самолёта, но 18 апреля 1915 года сел за линией фронта и попал в плен. Вскоре инженеры фирмы Фоккера создали синхронизатор, который разрешал выстрел только в промежутке между лопастями. Монопланы Fokker E на полгода захватили господство в небе — англичане назвали это «бичом Фоккера».");
  }

  // 6. Aircraft types
  {
    const s = base(6, { panel: [0, 0, 4.0, H], year: { text: "1916–1918", x: 0.5, y: 0.5, w: 3.3, size: 28 },
      title: { text: "От «этажерки» к истребителю", x: 4.5, y: 0.4, w: 8.4 } });
    const roles = [
      ["GiCrosshair", "Истребитель", "завоёвывает господство в воздухе"],
      ["GiBinoculars", "Разведчик", "двухместный, с фотокамерой и радио"],
      ["GiFallingBomb", "Бомбардировщик", "от ручных бомб к многомоторным гигантам"],
      ["GiAnchor", "Гидросамолёт", "морская разведка и охота на подлодки"],
    ];
    roles.forEach(([ic, head, body], i) => {
      const y = 1.4 + i * 1.12;
      iconDot(s, ic, 0.5, y, 0.7, true);
      T(s, [{ text: head, options: { bold: true, fontSize: 15, color: C.onPanel, breakLine: true } }, { text: body, options: { fontSize: 12, color: C.khaki } }], { x: 1.35, y: y + 0.02, w: 2.5, h: 0.9 });
    });
    plane(s, 1.1, 5.95, 1.5, 12);
    const hd = (t) => ({ text: t, options: { bold: true, color: C.onPanel, fill: { color: C.panel } } });
    const rowsData = [
      ["Nieuport 17", "Франция", "1916", "≈165", "лёгкий «полутораплан», очень манёвренный"],
      ["Albatros D.III", "Германия", "1917", "≈175", "главная машина «Кровавого апреля»"],
      ["SPAD S.XIII", "Франция", "1917", "≈210", "быстрый и прочный; летали Фонк и Рикенбакер"],
      ["Sopwith Camel", "Великобритания", "1917", "≈185", "около 1 300 побед — рекорд союзников"],
      ["Fokker Dr.I", "Германия", "1917", "≈185", "триплан «Красного барона»"],
      ["Fokker D.VII", "Германия", "1918", "≈190", "единственный самолёт, названный в тексте перемирия"],
    ];
    const rows = [[hd("Самолёт"), hd("Страна"), hd("В строю"), hd("км/ч"), hd("Чем знаменит")]];
    rowsData.forEach((r, i) => rows.push(r.map((v, j) => ({ text: v, options: { bold: j === 0, fill: { color: i % 2 ? C.paper : C.card } } }))));
    s.addTable(rows, { x: 4.5, y: 1.35, w: 8.3, colW: [1.7, 1.55, 0.95, 0.75, 3.35], rowH: 0.47, fontFace: BF, fontSize: 12.5, color: C.ink,
      valign: "middle", margin: [0, 0.08, 0, 0.08], border: { type: "solid", pt: 0.5, color: C.line } });
    const stats = [["100 → 200+", "км/ч — рост скорости"], ["80 → 200+", "л. с. — мощность мотора"], ["0 → 2", "синхронных пулемёта"]];
    stats.forEach(([big, small], i) => {
      const x = 4.5 + i * 2.85;
      T(s, big, { x, y: 5.0, w: 2.7, h: 0.75, fontFace: HF, fontSize: 30, bold: true, color: C.red });
      T(s, small, { x, y: 5.75, w: 2.7, h: 0.5, fontSize: 13, color: C.muted });
    });
    T(s, "Скорость — максимальная, округлённо; данные разных модификаций различаются.", { x: 4.5, y: 6.45, w: 7, h: 0.3, fontSize: 10, color: C.muted });
    s.addNotes("За войну сложились основные типы боевых самолётов: истребители, разведчики, бомбардировщики и гидросамолёты. Сравните машины 1914 года, летавшие около 100 километров в час, с истребителями 1918-го — они были вдвое быстрее и несли по два синхронных пулемёта. Albatros стал главным оружием немцев в «Кровавом апреле». Sopwith Camel одержал больше побед, чем любой другой самолёт союзников. А Fokker D.VII так ценился, что условия перемирия отдельно требовали передать союзникам все эти машины.");
  }

  // 7. Strategic bombing
  {
    const s = base(7, { panel: [8.9, 0, W - 8.9, H], year: { text: "1915–1918", x: 9.3, y: 0.5, w: 3.6, size: 28 },
      title: { text: "Война приходит в города", x: 0.55, y: 0.4, w: 8.0 }, count: { dark: true } });
    s.addImage({ data: ICON.GiZeppelin, x: 9.6, y: 1.05, w: 2.9, h: 2.9 });
    plane(s, 11.7, 3.55, 1.1, 250);
    T(s, [
      { text: "557", options: { fontFace: HF, fontSize: 44, bold: true, color: C.khaki, breakLine: true } },
      { text: "погибших от налётов цеппелинов на Британию", options: { fontSize: 13, color: C.onPanel, breakLine: true } },
      { text: "162", options: { fontFace: HF, fontSize: 44, bold: true, color: C.khaki, paraSpaceBefore: 10, breakLine: true } },
      { text: "погибших за один налёт «Гот» на Лондон — самый кровавый в войне", options: { fontSize: 13, color: C.onPanel } },
    ], { x: 9.3, y: 3.95, w: 3.6, h: 3.0 });
    const cards = [
      ["GiZeppelin", "Цеппелины", "С января 1915 г. дирижабли бомбят Англию по ночам. Сбивать их научились лишь в 1916 г., когда появились зажигательные пули."],
      ["GiBomber", "Бомбардировщики «Гота»", "13 июня 1917 г. — дневной налёт на Лондон. Среди погибших — 18 детей в школе на Аппер-Норт-стрит."],
      ["GiAntiAircraftGun", "Рождение ПВО", "Прожекторы, зенитки, аэростатные заграждения и ночные истребители. Доклад Я. Смэтса (1917) ведёт к созданию RAF."],
      ["GiBiplane", "«Илья Муромец»", "Эскадра воздушных кораблей: около 400 боевых вылетов и 65 т бомб. В воздушном бою потерян лишь один корабль."],
    ];
    cards.forEach(([ic, head, body], i) => {
      const x = 0.55 + (i % 2) * 4.05, y = 1.45 + Math.floor(i / 2) * 2.75;
      card(s, x, y, 3.85, 2.55);
      iconDot(s, ic, x + 0.25, y + 0.25, 0.65);
      T(s, head, { x: x + 1.05, y: y + 0.3, w: 2.65, h: 0.6, fontSize: 15, bold: true, valign: "middle" });
      T(s, body, { x: x + 0.25, y: y + 1.05, w: 3.4, h: 1.4, fontSize: 13 });
    });
    s.addNotes("Впервые война пришла к мирным жителям с неба. С 1915 года германские цеппелины бомбили Англию. Долгое время их почти не удавалось сбить, пока не появились зажигательные пули: в сентябре 1916 года Уильям Лиф Робинсон сбил первый дирижабль над Британией. В 1917 году их сменили бомбардировщики «Гота». Налёт 13 июня унёс 162 жизни. В России Игорь Сикорский создал «Илью Муромца» — первый серийный четырёхмоторный бомбардировщик. Его эскадра за войну потеряла в воздушном бою лишь один корабль.");
  }

  // 8. Russian aviation
  {
    const s = base(8, { panel: [0, 0, 5.0, H], year: { text: "1913–1917", x: 0.5, y: 0.5, w: 4, size: 28 } });
    T(s, "Россия: крылья империи", { x: 5.45, y: 0.4, w: 7.4, h: 0.8, fontFace: HF, fontSize: 32, bold: true, valign: "middle", objectName: "!!title" });
    s.addImage({ data: IMG.muromets, x: 0.45, y: 1.45, w: 4.1, h: 2.46 });
    T(s, [
      { text: "«Илья Муромец» И. И. Сикорского", options: { fontFace: HF, fontSize: 17, bold: true, color: C.onPanel, breakLine: true } },
      { text: "Первый полёт — декабрь 1913 г. Летом 1914 г. совершил перелёт Петербург — Киев и обратно. В войну стал первым серийным четырёхмоторным бомбардировщиком.", options: { fontSize: 13, color: C.khaki, paraSpaceBefore: 6 } },
    ], { x: 0.5, y: 4.2, w: 4.1, h: 2.0 });
    plane(s, 3.55, 6.1, 1.0, 40);
    const cards = [
      ["Пётр Нестеров", "«Мёртвая петля» (1913) и первый в истории воздушный таран (1914)."],
      ["Игорь Сикорский", "«Русский витязь» и «Илья Муромец» — начало тяжёлой авиации в мире."],
      ["Александр Казаков", "Лучший ас России: 17 официальных побед. В 1915 г. протаранил врага и уцелел."],
      ["Дмитрий Григорович", "Летающие лодки М‑5 и М‑9. В 1916 г. Я. Нагурский выполнил на М‑9 первую «петлю» на гидросамолёте."],
      ["Глеб Котельников", "Изобрёл ранцевый парашют РК-1 (1911) — прообраз всех современных парашютов."],
      ["Слабое место — моторы", "Большую часть двигателей закупали за границей: заводы не успевали за нуждами фронта."],
    ];
    cards.forEach(([head, body], i) => {
      const x = 5.45 + (i % 3) * 2.5, y = 1.45 + Math.floor(i / 3) * 2.7;
      const warn = i === 5;
      card(s, x, y, 2.35, 2.5, warn ? "E6CFC5" : C.card);
      T(s, head, { x: x + 0.18, y: y + 0.18, w: 2.0, h: 0.7, fontSize: 15, bold: true, color: warn ? C.red : C.ink, fontFace: HF });
      T(s, body, { x: x + 0.18, y: y + 0.95, w: 2.0, h: 1.5, fontSize: 12.5 });
    });
    s.addNotes("Россия дала мировой авиации немало «первых». Пётр Нестеров выполнил первую «мёртвую петлю» и первый таран. Игорь Сикорский построил гигантов «Русский витязь» и «Илья Муромец». Александр Казаков одержал 17 официальных побед и стал лучшим русским асом. Летающие лодки Григоровича воевали на Балтике и Чёрном море, а Глеб Котельников ещё в 1911 году изобрёл ранцевый парашют. Главной бедой была слабая промышленность: большую часть моторов приходилось покупать у союзников.");
  }

  // 9. Aces
  {
    const s = base(9, { panel: [9.0, 0, W - 9.0, H], year: { text: "1915–1918", x: 9.4, y: 0.5, w: 3.5, size: 28 },
      title: { text: "Асы: рыцари или охотники?", x: 0.55, y: 0.4, w: 8.2 }, count: { dark: true } });
    s.addImage({ data: IMG.tri, x: 9.4, y: 1.35, w: 3.55, h: 1.94 });
    plane(s, 11.85, 0.4, 1.0, 60);
    T(s, [
      { text: "80", options: { fontFace: HF, fontSize: 66, bold: true, color: C.khaki, breakLine: true } },
      { text: "побед Манфреда фон Рихтгофена, «Красного барона», — лучший результат войны. Погиб 21 апреля 1918 г.", options: { fontSize: 14, color: C.onPanel } },
    ], { x: 9.4, y: 3.5, w: 3.5, h: 2.6 });
    const hd = (t) => ({ text: t, options: { bold: true, color: C.onPanel, fill: { color: C.panel } } });
    const aces = [
      ["Манфред фон Рихтгофен", "Германия", "80", "погиб в 1918"],
      ["Рене Фонк", "Франция", "75", "пережил войну"],
      ["Билли Бишоп", "Канада", "72", "пережил войну"],
      ["Эдвард Мэннок", "Великобритания", "61", "погиб в 1918"],
      ["Жорж Гинемер", "Франция", "53", "пропал в 1917"],
      ["Освальд Бёльке", "Германия", "40", "погиб в 1916"],
      ["Франческо Баракка", "Италия", "34", "погиб в 1918"],
      ["Эдди Рикенбакер", "США", "26", "пережил войну"],
      ["Александр Казаков", "Россия", "17", "погиб в 1919"],
      ["Макс Иммельман", "Германия", "15", "погиб в 1916"],
    ];
    const rows = [[hd("Ас"), hd("Страна"), hd("Побед*"), hd("Судьба")]];
    aces.forEach((r, i) => rows.push(r.map((v, j) => ({ text: v, options: { bold: j === 0 || j === 2, color: j === 2 ? C.red : C.ink, align: j === 2 ? "center" : "left", fill: { color: i % 2 ? C.paper : C.card } } }))));
    s.addTable(rows, { x: 0.55, y: 1.35, w: 8.0, colW: [3.0, 2.0, 1.0, 2.0], rowH: 0.37, fontFace: BF, fontSize: 12.5, color: C.ink,
      valign: "middle", margin: [0, 0.1, 0, 0.1], border: { type: "solid", pt: 0.5, color: C.line } });
    card(s, 0.55, 5.6, 8.0, 1.2);
    T(s, [
      { text: "«Заповеди Бёльке» (1916) — ", options: { bold: true } },
      { text: "первые правила воздушного боя: добейся преимущества до атаки, заходи со стороны солнца, открывай огонь только с близкой дистанции.", options: {} },
    ], { x: 0.75, y: 5.7, w: 7.6, h: 0.75, fontSize: 13 });
    T(s, "* Официально засчитанные победы; в разных источниках числа могут отличаться.", { x: 0.75, y: 6.45, w: 7.6, h: 0.3, fontSize: 10, color: C.muted });
    s.addNotes("Асом называли лётчика, сбившего не менее пяти самолётов противника. Самым результативным стал Манфред фон Рихтгофен — 80 побед. Он летал на ярко-красных машинах, за что его прозвали «Красным бароном». У французов лучшим был Рене Фонк, у британцев — Эдвард Мэннок, у американцев — Эдди Рикенбакер, у нас — Александр Казаков. Интересный факт: гарцующий конь с самолёта итальянского аса Франческо Баракки позже стал эмблемой Ferrari. Освальд Бёльке первым сформулировал правила воздушного боя.");
  }

  // 10. Air battles
  {
    const s = base(10, { panel: [0, 0, 4.3, H], year: { text: "1916–1918", x: 0.5, y: 0.5, w: 3.6, size: 28 },
      title: { text: "Битвы за господство в воздухе", x: 4.8, y: 0.4, w: 8.0 } });
    T(s, [
      { text: "«Роз, очистите мне небо! Я ослеп!»", options: { fontFace: HF, fontSize: 22, italic: true, color: C.onPanel, breakLine: true } },
      { text: "Генерал Ф. Петен — командиру истребителей Ш. де Розу. Верден, 1916 г.", options: { fontSize: 13, color: C.khaki, paraSpaceBefore: 10 } },
    ], { x: 0.5, y: 1.5, w: 3.4, h: 2.6 });
    plane(s, 1.2, 4.6, 2.0, -20);
    const rows = [
      ["Верден", "февр. — дек. 1916", "Французы впервые сводят истребители в отдельные группы, чтобы вернуть себе небо над полем боя.", "303 дня"],
      ["Сомма", "июль — нояб. 1916", "Британцы ведут «непрерывное наступление» в воздухе; немцы отвечают истребительными эскадрильями — Jasta.", "141 день"],
      ["«Кровавый апрель»", "апрель 1917, Аррас", "Британцы теряют 245 самолётов, немцы — 66: сказывается превосходство «Альбатросов».", "245 : 66"],
      ["Сен-Мийель", "12–15 сент. 1918", "Билли Митчелл командует почти 1 500 самолётами союзников — крупнейшая авиаоперация войны.", "≈1 480"],
    ];
    rows.forEach(([name, date, body, big], i) => {
      const y = 1.4 + i * 1.38;
      card(s, 4.8, y, 8.0, 1.22);
      T(s, [{ text: name, options: { bold: true, fontSize: 15, fontFace: HF, breakLine: true } }, { text: date, options: { fontSize: 12, color: C.muted } }], { x: 5.0, y: y + 0.18, w: 2.0, h: 0.95 });
      T(s, body, { x: 7.1, y: y + 0.15, w: 3.75, h: 0.95, fontSize: 13, valign: "middle" });
      T(s, big, { x: 10.9, y: y + 0.15, w: 1.75, h: 0.95, fontFace: HF, fontSize: 24, bold: true, color: C.red, align: "right", valign: "middle" });
    });
    s.addNotes("В 1916 году под Верденом впервые развернулась настоящая борьба за господство в воздухе. Командующий Петен потребовал от майора де Роза «очистить небо», и французы собрали лучших лётчиков в специальные истребительные группы. На Сомме британцы действовали наступательно, а немцы в ответ создали истребительные эскадрильи. В апреле 1917 года под Аррасом британцы потеряли 245 самолётов против 66 немецких. А в сентябре 1918-го при Сен-Мийеле американец Билли Митчелл впервые собрал в одной операции почти полторы тысячи самолётов.");
  }

  // 11. Naval aviation
  {
    const s = base(11, { panel: [8.4, 0, W - 8.4, H], year: { text: "1914–1918", x: 8.85, y: 0.5, w: 4, size: 28 },
      title: { text: "Крылья над морем", x: 0.55, y: 0.4, w: 7.5 }, count: { dark: true } });
    s.addImage({ data: IMG.carrier, x: 8.8, y: 1.45, w: 4.1, h: 2.14 });
    plane(s, 11.85, 0.35, 1.0, 100);
    T(s, [
      { text: "19.07.1918", options: { fontFace: HF, fontSize: 34, bold: true, color: C.khaki, breakLine: true } },
      { text: "Рейд на Тондерн: семь Sopwith Camel взлетают с HMS Furious и сжигают цеппелины L 54 и L 60. Первый удар колёсных самолётов с авианосца.", options: { fontSize: 14, color: C.onPanel, paraSpaceBefore: 6 } },
    ], { x: 8.85, y: 4.0, w: 4.0, h: 2.8 });
    const tl = [
      ["25.12.1914", "Куксхафенский рейд: британские гидросамолёты с кораблей атакуют базу цеппелинов"],
      ["12.08.1915", "Дарданеллы: гидросамолёт Short 184 впервые атакует судно торпедой"],
      ["1916", "Гидрокрейсера Черноморского флота «Император Николай I» и «Император Александр I» наносят удары по побережью Турции"],
      ["17.09.1916", "Ян Нагурский выполняет «мёртвую петлю» на летающей лодке М‑9"],
      ["02.08.1917", "Эдвин Даннинг впервые сажает самолёт на идущий корабль — HMS Furious"],
    ];
    s.addShape(pres.shapes.LINE, { x: 2.15, y: 1.55, w: 0, h: 5.1, line: { color: C.khakiD, width: 1.5 } });
    tl.forEach(([d, txt], i) => {
      const y = 1.4 + i * 1.08;
      T(s, d, { x: 0.55, y, w: 1.4, h: 0.5, fontSize: 13, bold: true, color: C.olive, align: "right" });
      s.addShape(pres.shapes.OVAL, { x: 2.06, y: y + 0.07, w: 0.18, h: 0.18, fill: { color: C.panel }, line: { color: C.paper, width: 2 } });
      T(s, txt, { x: 2.45, y, w: 5.6, h: 1.0, fontSize: 14 });
    });
    s.addNotes("Самолёт быстро пришёл и на флот. Уже в декабре 1914 года британские гидросамолёты атаковали базу цеппелинов в Куксхафене. В 1915 году гидросамолёт впервые применил торпеду. На Чёрном море действовали русские гидрокрейсера, а летающая лодка Григоровича М‑9 стала одной из лучших в мире: лётчик Нагурский даже выполнил на ней «мёртвую петлю». В 1917 году Эдвин Даннинг впервые посадил самолёт на идущий корабль, а в июле 1918-го с авианосца Furious был нанесён первый удар колёсными самолётами.");
  }

  // 12. Pilot's life
  {
    const s = base(12, { panel: [0, 0, 4.6, H], year: { text: "1914–1918", x: 0.5, y: 0.5, w: 3.8, size: 28 },
      title: { text: "Жизнь на высоте 5 000 метров", x: 5.1, y: 0.4, w: 7.7 } });
    s.addImage({ data: ICON.GiParachute, x: 0.5, y: 1.35, w: 1.3, h: 1.3 });
    plane(s, 2.6, 1.3, 1.5, 150);
    T(s, [
      { text: "Без парашюта", options: { fontFace: HF, fontSize: 28, bold: true, color: C.onPanel, breakLine: true } },
      { text: "Лётчикам Антанты парашюты так и не выдали — их имели лишь наблюдатели на аэростатах. Немецкие пилоты получили парашюты Хайнеке только в 1918 г.", options: { fontSize: 14, color: C.khaki, paraSpaceBefore: 8, breakLine: true } },
      { text: "29 июня 1918 г. ас Эрнст Удет одним из первых спасся на парашюте из подбитого истребителя.", options: { fontSize: 14, color: C.onPanel, paraSpaceBefore: 8 } },
    ], { x: 0.5, y: 2.85, w: 3.7, h: 4.0 });
    const cards = [
      ["GiThermometerCold", "Холод", "Открытая кабина: на высоте 5–6 км мороз до −25…−30 °C. Меховые комбинезоны и жир на лице от обморожения."],
      ["GiDrop", "Масло и выхлоп", "Ротативные моторы разбрызгивали касторовое масло прямо в лицо пилоту — отсюда постоянные отравления."],
      ["GiSteampunkGoggles", "Нехватка кислорода", "Выше 4–5 км — головная боль и замедленная реакция. Кислородные приборы были редкостью."],
      ["GiBrodieHelmet", "Короткое обучение", "Новичков отправляли на фронт после считанных часов самостоятельного налёта; многие разбивались ещё в учебных полётах."],
    ];
    cards.forEach(([ic, head, body], i) => {
      const x = 5.1 + (i % 2) * 3.9, y = 1.4 + Math.floor(i / 2) * 2.12;
      card(s, x, y, 3.75, 1.95);
      iconDot(s, ic, x + 0.2, y + 0.2, 0.6);
      T(s, head, { x: x + 0.95, y: y + 0.2, w: 2.65, h: 0.6, fontSize: 15, bold: true, valign: "middle" });
      T(s, body, { x: x + 0.2, y: y + 0.9, w: 3.4, h: 1.0, fontSize: 12.5 });
    });
    T(s, [
      { text: "Рыцарский миф и реальность. ", options: { bold: true, color: C.red } },
      { text: "22 апреля 1918 г. австралийские лётчики похоронили Рихтгофена с воинскими почестями. Но чаще в небе побеждал тот, кто атаковал внезапно и со спины.", options: {} },
    ], { x: 5.1, y: 5.8, w: 7.65, h: 1.0, fontSize: 14 });
    s.addNotes("Романтика неба скрывала тяжёлую реальность. Кабины были открытыми, и на высоте лётчиков сковывал мороз. Ротативные моторы разбрызгивали касторовое масло, выше четырёх-пяти километров не хватало кислорода. Британские и французские лётчики воевали без парашютов: командование опасалось, что пилоты будут покидать машины слишком рано. Немцы получили парашюты лишь в 1918 году. Многие новички погибали в первых же боях. И всё же рыцарские жесты случались: Рихтгофена противники похоронили с воинскими почестями.");
  }

  // 13. Results
  {
    const s = base(13, { panel: [0, 0, 6.0, H], year: { text: "1918", x: 0.55, y: 1.3, w: 3, size: 28 },
      title: { text: "Итоги в цифрах", x: 0.55, y: 0.4, w: 5.2, dark: true } });
    T(s, [
      { text: "≈670", options: { fontFace: HF, fontSize: 44, bold: true, color: C.khaki, breakLine: true } },
      { text: "самолётов первой линии у четырёх ведущих держав в августе 1914 г.", options: { fontSize: 14, color: C.onPanel, breakLine: true } },
      { text: "22 647", options: { fontFace: HF, fontSize: 44, bold: true, color: C.khaki, paraSpaceBefore: 14, breakLine: true } },
      { text: "самолётов было только в британских Королевских ВВС к 11 ноября 1918 г. — крупнейших ВВС мира", options: { fontSize: 14, color: C.onPanel } },
    ], { x: 0.55, y: 2.0, w: 5.0, h: 3.6 });
    plane(s, 4.15, 5.2, 1.4, 30);
    T(s, "1 апреля 1918 г. созданы Королевские ВВС (RAF) — первые в мире самостоятельные военно-воздушные силы.", { x: 0.55, y: 5.85, w: 3.5, h: 1.0, fontSize: 13, color: C.khaki });
    // range chart
    T(s, "Выпуск самолётов в 1914–1918 гг., тыс.", { x: 6.5, y: 0.45, w: 6.3, h: 0.6, fontFace: HF, fontSize: 20, bold: true, valign: "middle" });
    const x0 = 8.2, scale = 4.3 / 70; // 70 thousand = 4.3"
    [0, 20, 40, 60].forEach((v) => {
      const x = x0 + v * scale;
      s.addShape(pres.shapes.LINE, { x, y: 1.35, w: 0, h: 3.15, line: { color: C.line, width: 0.75 } });
      T(s, String(v), { x: x - 0.3, y: 4.55, w: 0.6, h: 0.3, fontSize: 11, color: C.muted, align: "center" });
    });
    const bars = [["Франция", 52, 68, "52–68"], ["Британия", 33, 55, "33–55"], ["Германия", 48, 48, "≈48"]];
    bars.forEach(([name, lo, hi, label], i) => {
      const y = 1.55 + i * 0.98;
      T(s, name, { x: 6.5, y, w: 1.6, h: 0.55, fontSize: 15, bold: true, valign: "middle" });
      s.addShape(pres.shapes.RECTANGLE, { x: x0, y: y + 0.05, w: lo * scale, h: 0.45, fill: { color: C.olive }, line: { color: C.olive, width: 0 } });
      if (hi > lo) s.addShape(pres.shapes.RECTANGLE, { x: x0 + lo * scale, y: y + 0.05, w: (hi - lo) * scale, h: 0.45, fill: { color: C.khakiD, transparency: 35 }, line: { color: C.khakiD, width: 0 } });
      T(s, label, { x: x0 + hi * scale + 0.1, y, w: 0.8, h: 0.55, fontSize: 14, bold: true, color: C.red, valign: "middle" });
    });
    T(s, "Тёмная часть — минимальная оценка, светлая — разброс данных: источники по-разному учитывают учебные машины и недостроенные планеры.", { x: 6.5, y: 4.95, w: 6.3, h: 0.6, fontSize: 11, color: C.muted });
    card(s, 6.5, 5.7, 6.3, 1.15);
    T(s, "150 000+", { x: 6.7, y: 5.8, w: 2.7, h: 0.95, fontFace: HF, fontSize: 32, bold: true, color: C.red, valign: "middle" });
    T(s, "самолётов построили воюющие страны за четыре года войны", { x: 9.45, y: 5.8, w: 3.2, h: 0.95, fontSize: 14, valign: "middle" });
    s.addNotes("Цифры показывают, насколько стремительным был рост. В 1914 году у четырёх крупнейших держав было около 670 боевых самолётов. К концу войны только в британских ВВС их насчитывалось более 22 тысяч. Всего за войну было построено свыше 150 тысяч самолётов; лидировали Франция, Великобритания и Германия. Точные цифры в источниках расходятся, поэтому на диаграмме показан разброс. Главный организационный итог: 1 апреля 1918 года появились Королевские ВВС Великобритании — первые в мире самостоятельные военно-воздушные силы.");
  }

  // 14. Legacy
  {
    const s = base(14, { panel: [0, 0, W, H], year: { text: "после 1918", x: 0.6, y: 1.25, w: 5, size: 26 },
      title: { text: "Наследие: небо после войны", x: 0.6, y: 0.4, w: 8.5, dark: true }, count: { dark: true } });
    plane(s, 11.4, 0.3, 1.3, 50);
    const items = [
      ["GiOpenBook", "1921", "Джулио Дуэ, «Господство в воздухе»: теория, по которой войну выигрывает авиация"],
      ["GiScrollUnfurled", "1919", "Версальский договор (ст. 198) запрещает Германии иметь военную авиацию"],
      ["GiCommercialAirplane", "14–15 июня 1919", "Алкок и Браун без посадки пересекают Атлантику на бомбардировщике Vickers Vimy"],
      ["GiAirplaneDeparture", "25 августа 1919", "Открывается регулярная международная авиалиния Лондон — Париж"],
    ];
    items.forEach(([ic, yr, txt], i) => {
      const x = 0.6 + (i % 2) * 4.2, y = 2.0 + Math.floor(i / 2) * 1.75;
      iconDot(s, ic, x, y, 0.7, true);
      T(s, [{ text: yr, options: { bold: true, fontSize: 15, color: C.khaki, breakLine: true } }, { text: txt, options: { fontSize: 13, color: C.onPanel } }], { x: x + 0.9, y, w: 3.1, h: 1.5 });
    });
    T(s, "За четыре года авиация прошла путь от «спорта» и разведки до самостоятельного рода войск и навсегда изменила войны XX века.", {
      x: 0.6, y: 5.6, w: 8.0, h: 1.2, fontFace: HF, fontSize: 19, italic: true, color: C.onPanel, valign: "middle" });
    T(s, [
      { text: "Источники", options: { bold: true, fontSize: 13, color: C.khaki, breakLine: true } },
      { text: "Morrow J. H. The Great War in the Air: Military Aviation from 1909 to 1921. Washington, 1993.", options: { breakLine: true, paraSpaceBefore: 6 } },
      { text: "Shores C., Franks N., Guest R. Above the Trenches. London: Grub Street, 1990.", options: { breakLine: true, paraSpaceBefore: 6 } },
      { text: "Хайрулин М. А. «Илья Муромец»: гордость русской авиации. М.: Яуза; Эксмо, 2010.", options: { breakLine: true, paraSpaceBefore: 6 } },
      { text: "Imperial War Museums: The Air Raids That Shook Britain (iwm.org.uk).", options: { breakLine: true, paraSpaceBefore: 6 } },
      { text: "1914-1918-online. International Encyclopedia of the First World War.", options: { paraSpaceBefore: 6 } },
    ], { x: 9.2, y: 2.0, w: 3.6, h: 4.6, fontSize: 11, color: C.khaki });
    s.addNotes("Первая мировая война определила будущее авиации. Итальянский генерал Дуэ написал книгу о господстве в воздухе, которая повлияла на всю военную мысль. Версальский договор запретил Германии военную авиацию — настолько её стали опасаться. А военные технологии быстро пришли в мирную жизнь: уже в 1919 году Алкок и Браун на бывшем бомбардировщике пересекли Атлантику, и открылись первые регулярные международные авиалинии. Вывод: за четыре года авиация превратилась из забавы в силу, изменившую войны XX века. Спасибо за внимание!");
  }

  await pres.writeFile({ fileName: "deck_raw.pptx" });
  console.log("written");
})();
