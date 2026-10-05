// Builds "Проверяем себя" answers (§1–3) as a styled A4 PDF via Chromium.
const fs = require("fs"), path = require("path");
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const NM = "/root/intro/node_modules";
const B = (p) => fs.readFileSync(`${NM}/${p}`).toString("base64");
const ff = (fam, file, w, st = "normal") => `@font-face{font-family:"${fam}";font-weight:${w};font-style:${st};src:url(data:font/woff2;base64,${B(file)}) format("woff2")}`;
const FONTS = [
  ...["latin", "cyrillic"].flatMap((s) => [700, 800].map((w) => ff("Mont", `@fontsource/montserrat/files/montserrat-${s}-${w}-normal.woff2`, w))),
  ...["latin", "cyrillic"].flatMap((s) => [["400", "normal"], ["700", "normal"], ["400", "italic"], ["700", "italic"]].map(([w, st]) => ff("PTS", `@fontsource/pt-sans/files/pt-sans-${s}-${w}-${st}.woff2`, w, st))),
].join("\n");
const I = (name, cls = "ic") => fs.readFileSync(`${NM}/lucide-static/icons/${name}.svg`, "utf8")
  .replace(/<!--.*?-->/gs, "").replace(/class="[^"]*"/, "").replace("<svg", `<svg class="${cls}"`).replace(/width="24"/, "").replace(/height="24"/, "");

const Q = (n, q, body, split = false) => `<section class="card${split ? " split" : ""}"><div class="qhead"><span class="qn">${n}</span><h3>${q}</h3></div><div class="ans">${body}</div></section>`;
const def = (term, text) => `<div class="def"><b>${term}</b> — ${text}</div>`;
const tile = (icon, title, text) => `<div class="tile">${I(icon, "tic")}<div><b>${title}</b><p>${text}</p></div></div>`;
const note = (text, icon = "lightbulb") => `<div class="note">${I(icon, "nic")}<div>${text}</div></div>`;
const chips = (arr) => `<div class="chips">${arr.map((c) => `<span>${c}</span>`).join("")}</div>`;

const CSS = `${FONTS}
@page { size: A4; margin: 14mm 13mm 15mm; }
* { box-sizing: border-box; }
:root { --ink:#1d2433; --muted:#5b6578; --line:#e3e7ef; --bg:#f6f8fc; --a:#4f46e5; --a2:#eef0ff; }
body { margin:0; font-family:PTS, sans-serif; color:var(--ink); font-size:10.5pt; line-height:1.34; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
h1,h3,.ptitle,.pnum,.label,.qn,.th,.fh,b.t { font-family:Mont, sans-serif; }
.ic, svg { stroke-width:1.9; }
/* cover */
.cover { height:297mm; padding:26mm 20mm 18mm; color:#fff; position:relative; overflow:hidden; page-break-after:always;
  background: radial-gradient(1200px 700px at 85% -10%, rgba(255,255,255,.18), transparent 60%), linear-gradient(150deg,#312e81 0%,#4f46e5 45%,#0f766e 100%); display:flex; flex-direction:column; }
.cover::after { content:""; position:absolute; right:-60mm; bottom:-60mm; width:170mm; height:170mm; border-radius:50%; border:28mm solid rgba(255,255,255,.06); }
.cv-top { font-family:Mont; font-weight:700; letter-spacing:.08em; text-transform:uppercase; font-size:9.5pt; opacity:.85; }
.cover h1 { font-size:46pt; line-height:1.02; margin:22mm 0 5mm; font-weight:800; }
.cv-sub { font-size:16pt; opacity:.92; max-width:140mm; }
.cv-cards { margin-top:auto; display:grid; gap:5mm; position:relative; z-index:1; }
.cvc { display:grid; grid-template-columns:16mm 16mm 1fr auto; align-items:center; gap:4mm; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.22); border-radius:5mm; padding:5mm 6mm; }
.cvc span { font-family:Mont; font-weight:800; font-size:17pt; }
.cvc b { font-family:Mont; font-weight:700; font-size:11.5pt; }
.cvc em { font-style:normal; font-size:9.5pt; opacity:.8; white-space:nowrap; }
.cvi { width:12mm; height:12mm; color:#fff; padding:2.2mm; border-radius:3mm; background:rgba(255,255,255,.16); }
.cv-foot { margin-top:8mm; font-size:9pt; opacity:.75; position:relative; z-index:1; }
/* paragraph header */
.phead { display:grid; grid-template-columns:auto 1fr auto; gap:5mm; align-items:center; color:#fff; border-radius:5mm; padding:5mm 6.5mm; margin:0 0 4mm; break-after:avoid; }
.phead.p1 { background:linear-gradient(120deg,#4338ca,#6366f1); }
.phead.p2 { background:linear-gradient(120deg,#0f766e,#14b8a6); }
.phead.p3 { background:linear-gradient(120deg,#c2410c,#f97316); }
.pnum { font-weight:800; font-size:24pt; background:rgba(255,255,255,.18); border-radius:3.5mm; padding:2mm 4mm; }
.ptitle { font-weight:800; font-size:15pt; line-height:1.15; }
.psub { font-size:9.5pt; opacity:.9; margin-top:1.5mm; font-style:italic; }
.pic { width:15mm; height:15mm; opacity:.9; }
.part { break-before:page; } .part.first, .part.p3 { break-before:auto; } .part.p3 { margin-top:2mm; }
.part.p1 { --a:#4f46e5; --a2:#eef0ff; } .part.p2 { --a:#0d9488; --a2:#e6f7f5; } .part.p3 { --a:#ea580c; --a2:#fff1e8; }
/* question card */
.card.split { break-inside:auto; }
.card .def, .card .row2, .card .grid3, .card .grid4, .card .note, .card table, .card tr, .card .proof, .card .laws > div, .card .types, .card .forms { break-inside:avoid; }
.qhead { break-after:avoid; }
.card { border:1px solid var(--line); border-radius:4.5mm; padding:4mm 4.6mm 4.2mm; margin:0 0 3.6mm; background:#fff; break-inside:avoid; box-shadow:0 .6mm 2mm rgba(20,30,60,.05); }
.qhead { display:grid; grid-template-columns:9mm 1fr; gap:3mm; align-items:start; margin-bottom:3mm; }
.qn { width:9mm; height:9mm; border-radius:50%; background:var(--a); color:#fff; display:grid; place-items:center; font-weight:800; font-size:12pt; }
.qhead h3 { margin:0.6mm 0 0; font-size:11.6pt; font-weight:700; line-height:1.28; }
.ans p { margin:1.5mm 0; }
.def { background:var(--a2); border-left:1.4mm solid var(--a); border-radius:0 3mm 3mm 0; padding:2.6mm 3.6mm; margin:0 0 3mm; }
.def b { color:var(--a); font-family:Mont; font-size:10.5pt; }
.small { font-size:10pt; color:var(--muted); }
.label { font-weight:700; font-size:9pt; text-transform:uppercase; letter-spacing:.06em; color:var(--a); margin:3mm 0 2mm; }
.grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:2.6mm; margin:0 0 3mm; }
.grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:2.6mm; margin:0 0 3mm; }
.row2 { display:grid; grid-template-columns:1fr 1fr; gap:2.6mm; margin:0 0 2.5mm; }
.tile { display:grid; grid-template-columns:8.5mm 1fr; gap:2.2mm; background:var(--bg); border:1px solid var(--line); border-radius:3mm; padding:2.6mm; font-size:9.6pt; line-height:1.3; }
.grid4 .tile { grid-template-columns:1fr; }
.tile b { font-family:Mont; font-size:9.8pt; display:block; margin-bottom:.8mm; }
.tile p { margin:0; color:var(--muted); }
.tic { width:8mm; height:8mm; padding:1.6mm; border-radius:2.4mm; background:var(--a); color:#fff; }
.mini { background:var(--bg); border:1px solid var(--line); border-radius:3mm; padding:2.6mm 3.2mm; font-size:10pt; }
.mini ul { margin:1mm 0 0; padding-left:4.5mm; } .mini li { margin:.6mm 0; }
.mini em, .step em { color:var(--muted); }
.note { display:grid; grid-template-columns:7mm 1fr; gap:2.5mm; background:#fffbea; border:1px solid #f6e3a1; border-radius:3mm; padding:2.6mm 3.2mm; font-size:10pt; margin:2mm 0 0; }
.nic { width:6.5mm; height:6.5mm; color:#b7791f; }
.chips { display:flex; flex-wrap:wrap; gap:1.6mm; margin:0 0 3mm; }
.chips span { background:var(--a2); color:var(--ink); border:1px solid color-mix(in srgb, var(--a) 25%, transparent); border-radius:10mm; padding:1mm 3mm; font-size:9.4pt; }
.feats > div { background:var(--bg); border-radius:3mm; padding:2.6mm; font-size:9.6pt; border:1px solid var(--line); }
.feats b { font-family:Mont; font-size:9.6pt; display:block; } .feats p { margin:.6mm 0 0; color:var(--muted); }
.fic { width:6.5mm; height:6.5mm; color:var(--a); margin-bottom:1mm; }
.flow { display:grid; grid-template-columns:1fr 6mm 1fr 6mm 1fr; align-items:center; gap:1.6mm; }
.fbox { background:var(--bg); border:1px solid var(--line); border-radius:3mm; padding:2.6mm; font-size:9.6pt; min-height:24mm; }
.fbox small { display:block; font-family:Mont; font-weight:700; color:var(--a); font-size:8.4pt; text-transform:uppercase; letter-spacing:.05em; margin-bottom:1mm; }
.farrow { text-align:center; color:var(--a); font-size:16pt; font-weight:700; }
.core { display:grid; grid-template-columns:44mm 1fr; gap:4mm; align-items:center; }
.ring { border:1.3mm solid var(--a); border-radius:50%; width:42mm; height:42mm; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; font-family:Mont; font-size:8.8pt; color:var(--a); background:var(--a2); padding:3mm; }
.cic { width:9mm; height:9mm; margin-bottom:1mm; }
.ticks { margin:0; padding:0; list-style:none; } .ticks li { position:relative; padding-left:6mm; margin:1.2mm 0; }
.ticks li::before { content:""; position:absolute; left:.5mm; top:1.6mm; width:2.6mm; height:2.6mm; border-radius:50%; background:var(--a); box-shadow:0 0 0 1mm var(--a2); }
.types { display:grid; grid-template-columns:repeat(5,1fr); gap:2mm; align-items:stretch; }
.type { background:var(--bg); border:1px solid var(--line); border-radius:3mm; padding:2.4mm; font-size:9pt; line-height:1.28; }
.type:nth-child(1){border-top:1.2mm solid #a5b4fc}.type:nth-child(2){border-top:1.2mm solid #818cf8}.type:nth-child(3){border-top:1.2mm solid #6366f1}.type:nth-child(4){border-top:1.2mm solid #4f46e5}.type:nth-child(5){border-top:1.2mm solid #3730a3}
.th { font-weight:700; font-size:9.4pt; display:flex; flex-direction:column; gap:1mm; color:var(--a); margin-bottom:1mm; }
.tyic { width:7mm; height:7mm; }
.type p { margin:0; color:#384157; }
.scale { display:grid; grid-template-columns:auto 1fr auto; gap:2mm; align-items:center; font-size:8.6pt; color:var(--muted); margin-top:2.4mm; }
.scale i { height:1.6mm; border-radius:1mm; background:linear-gradient(90deg,#c7d2fe,#3730a3); }
.goal { display:grid; grid-template-columns:11mm 1fr; gap:3mm; align-items:center; background:linear-gradient(90deg,var(--a2),#fff); border:1px solid var(--line); border-radius:3mm; padding:3mm; margin:0 0 3mm; }
.goal small { display:block; font-family:Mont; font-weight:700; color:var(--a); text-transform:uppercase; font-size:8.4pt; letter-spacing:.05em; }
.goal b { font-size:11.5pt; }
.gic { width:10mm; height:10mm; color:var(--a); }
.so { display:grid; grid-template-columns:1fr 34mm 1fr; align-items:center; gap:2mm; }
.sobox { border:1.2mm solid var(--a); border-radius:4mm; padding:3mm; text-align:center; background:#fff; }
.sobox small { display:block; font-family:Mont; font-weight:700; color:var(--a); font-size:9pt; text-transform:uppercase; letter-spacing:.04em; }
.sobox b { display:block; margin:1mm 0 .5mm; } .sobox p { margin:0; color:var(--muted); font-size:10pt; }
.soarrow { position:relative; height:10mm; display:grid; place-items:center; }
.soarrow::before { content:""; position:absolute; left:0; right:3mm; top:50%; height:1.2mm; background:var(--a); transform:translateY(-50%); }
.soarrow::after { content:""; position:absolute; right:0; top:50%; transform:translateY(-50%); border-left:4mm solid var(--a); border-top:2.6mm solid transparent; border-bottom:2.6mm solid transparent; }
.soarrow span { position:relative; background:#fff; padding:0 1.6mm; font-size:9pt; color:var(--a); font-weight:700; top:-4.4mm; }
.forms { display:grid; grid-template-columns:1fr 1fr; gap:3mm; margin-bottom:3mm; }
.form { border:1px solid var(--line); border-radius:3.5mm; padding:3mm; background:var(--bg); }
.fh { display:flex; align-items:center; gap:2mm; font-weight:800; font-size:10.6pt; color:var(--a); }
.fhic { width:7mm; height:7mm; }
.fd { font-size:9.4pt; color:var(--muted); margin:1mm 0 2mm !important; }
.steps { display:grid; gap:1.6mm; }
.step { background:#fff; border:1px solid var(--line); border-left:1.2mm solid var(--a); border-radius:2mm; padding:1.8mm 2.4mm; font-size:9.3pt; position:relative; }
.step b { font-family:Mont; font-size:9.6pt; } .step p { display:inline; margin:0 0 0 1.5mm; color:#384157; } .step em { display:block; font-size:9pt; }
.crit { width:100%; border-collapse:separate; border-spacing:0; font-size:9.6pt; margin:1mm 0 1mm; border:1px solid var(--line); border-radius:3mm; overflow:hidden; }
.crit th { background:var(--a); color:#fff; font-family:Mont; font-size:9pt; text-align:left; padding:2mm 3mm; }
.crit td { padding:2mm 3mm; border-top:1px solid var(--line); vertical-align:top; } .crit td:last-child { color:var(--muted); width:46%; }
.crit tr.key td { background:var(--a2); }
.rel { border-left:1.2mm solid #94a3b8; } .abs { border-left:1.2mm solid var(--a); }
.laws { display:grid; grid-template-columns:1fr 1fr; gap:2.6mm; }
.law { position:relative; background:var(--bg); border:1px solid var(--line); border-radius:3.5mm; padding:3mm 3mm 3mm 13mm; font-size:9.7pt; }
.law > b { font-family:Mont; font-size:10.2pt; color:var(--a); } .law p { margin:1mm 0 1.8mm; }
.ln { position:absolute; left:3mm; top:3mm; width:7.5mm; height:7.5mm; border-radius:2.2mm; background:var(--a); color:#fff; font-family:Mont; font-weight:800; display:grid; place-items:center; }
.bad, .good { display:grid; grid-template-columns:5mm 1fr; gap:1.6mm; font-size:9pt; border-radius:2mm; padding:1.6mm 2mm; }
.bad { background:#fdecec; color:#8a2a2a; } .good { background:#e8f6ee; color:#1f6b45; }
.bic { width:4.6mm; height:4.6mm; }
.proof { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0; margin:1mm 0 3.5mm; }
.proof > div { position:relative; padding:3mm 6mm 3mm 7mm; color:#fff; font-family:Mont; font-weight:800; font-size:11pt; clip-path:polygon(0 0, calc(100% - 5mm) 0, 100% 50%, calc(100% - 5mm) 100%, 0 100%, 5mm 50%); }
.proof > div:first-child { clip-path:polygon(0 0, calc(100% - 5mm) 0, 100% 50%, calc(100% - 5mm) 100%, 0 100%); padding-left:4mm; }
.proof small { display:block; font-family:PTS; font-weight:400; font-size:9pt; opacity:.95; margin-top:.6mm; }
.pa { background:#fdba74; color:#5b2a06 !important; } .pd { background:#f97316; } .pt { background:#c2410c; }
.conds > div { background:var(--bg); border:1px solid var(--line); border-top:1.2mm solid var(--a); border-radius:3mm; padding:2.4mm; font-size:9.4pt; }
.conds b { font-family:Mont; font-size:9.4pt; } .conds p { margin:.6mm 0 0; color:var(--muted); }
.tpl { display:inline-block; background:#fff7d6; border:1px dashed #e0b84a; color:#7a5a00; border-radius:2mm; padding:1mm 2.6mm; font-size:9pt; margin-bottom:1.5mm; }
.bad2 { border-left:1.2mm solid #e05252; } .good2 { border-left:1.2mm solid #2f9e66; }
.verdict { display:flex; align-items:center; gap:2mm; font-family:Mont; font-size:12pt; color:#1f6b45; margin-bottom:1.5mm; }
.vic { width:7mm; height:7mm; }
`;

// ---- WWI test-prep guide (appended after shared helpers + CSS from answers/build.js) ----
const KCSS = fs.readFileSync("/root/konspekt/content.js", "utf8").match(/const KCSS = `([\s\S]*?)`;\n/)[1];
const IMG = (f) => "data:image/jpeg;base64," + fs.readFileSync(path.join(__dirname, f)).toString("base64");
const sec = (n, title, body) => `<section class="ksec"><div class="ks-h"><span class="ks-n">${n}</span><h2>${title}</h2></div>${body}</section>`;
const bullets = (arr) => `<ul class="ticks">${arr.map((x) => `<li>${x}</li>`).join("")}</ul>`;
const chain = (arr) => `<div class="chain">${arr.map((x, i) => `<div class="ch-i">${x}</div>${i < arr.length - 1 ? '<div class="ch-a">→</div>' : ""}`).join("")}</div>`;
const S = `<sup class="st" title="дополнено сверх учебника">★</sup>`;
const phead = (cls, num, title, sub, icon) => `<header class="phead ${cls}"><div class="pnum">${num}</div><div><div class="ptitle">${title}</div><div class="psub">${sub}</div></div>${I(icon, "pic")}</header>`;
const qa = (n, q, a) => `<div class="qa"><div class="qa-q"><span>${n}</span>${q}</div><div class="qa-a">${a}</div></div>`;

// ---------- data ----------
const KEY = [
  ["28.06.1914", "убийство Франца Фердинанда в Сараеве — <b>повод</b> к войне"],
  ["28.07.1914", "Австро-Венгрия объявила войну Сербии — <b>начало войны</b>"],
  ["01.08.1914", "Германия объявила войну <b>России</b>, затем Франции"],
  ["11.11.1918", "<b>Компьенское перемирие</b> — конец войны, поражение Германии"],
  ["70 млн", "мобилизовано в армии; на фронтах — свыше 37 млн"],
  ["9,5 млн", "погибших и свыше 20 млн раненых"],
  ["16 млн", "мобилизовано в России; около 1,6 млн убитых"],
  ["12 млн", "беженцев в Европе — небывалый масштаб"],
  ["2 блока", "<b>Антанта</b>: Россия, Франция, Великобритания · <b>Тройственный союз</b>: Германия, Австро-Венгрия, Италия"],
  ["4 державы", "<b>Четверной союз</b>: Германия, Австро-Венгрия, Османская империя, Болгария (с 1915)"],
];
const CHRONO = [
  ["Накануне войны", [
    ["1882—1907", "образование <b>Тройственного союза</b> (1882) и <b>Антанты</b> (русско-французский союз 1891—1893" + S + ", англо-французское соглашение 1904" + S + ", англо-русское 1907" + S + ")"],
    ["1894", "начало правления императора <b>Николая II</b>"],
    ["1895", "<b>А. Попов</b> передал первую радиограмму"],
    ["1898", "испано-американская война"],
    ["1899, 1907", "<b>Гаагские конференции</b> по инициативе императора России — конвенции о правилах ведения войны"],
    ["1903", "первый самолёт <b>братьев Райт</b>; труды <b>К. Циолковского</b> о космических полётах"],
    ["1904—1905", "русско-японская война"],
    ["1905", "<b>А. Эйнштейн</b> — специальная теория относительности; разработан <b>план Шлиффена</b>; начало революции в Иране"],
    ["1905—1907", "Первая российская революция"],
    ["1905—1913", "«<b>пробуждение Азии</b>» (термин В. Ленина) — революции в Иране, Турции, Китае, волнения в Индии"],
    ["1908", "<b>Младотурецкая революция</b> в Османской империи; Австро-Венгрия присоединила <b>Боснию и Герцеговину</b>"],
    ["1910—1917", "Мексиканская революция"],
    ["1911—1912", "Италия разбила Турцию и захватила <b>Ливию</b>"],
    ["1911—1913", "<b>Синьхайская революция</b> в Китае — свергнута маньчжурская династия Цин"],
    ["1912", "<b>Первая Балканская война</b> — Турция теряет большую часть европейских владений"],
  ]],
  ["1914", [
    ["28 июня", "<b>Сараево</b>: Гаврило Принцип («Молодая Босния») убил эрцгерцога Франца Фердинанда"],
    ["28 июля", "Австро-Венгрия при поддержке Германии объявила войну <b>Сербии</b>"],
    ["1 августа", "Германия объявила войну <b>России</b>, затем Франции"],
    ["4 августа", "Великобритания объявила войну Германии. Италия воздержалась, Япония выступила за Антанту"],
    ["август", "сербы под командованием С. Степановича разбили австрийцев при <b>Цере</b> — первая крупная победа Антанты"],
    ["авг.—сент.", "наступление русских в <b>Восточной Пруссии</b>, победа под <b>Гумбинненом</b>"],
    ["сентябрь", "<b>битва на Марне</b> — «чудо на Марне», наступление на Париж сорвано"],
    ["осень", "успешное наступление русских армий в <b>Галиции</b> против австрийцев"],
    ["конец года", "в войну вступила <b>Османская империя</b>; поражения турок от России на Кавказе"],
  ]],
  ["1915", [
    ["весна", "начало <b>геноцида армян</b> в Османской империи"],
    ["апрель", "первая <b>газовая атака</b> немцев под <b>Ипром</b> (до 5 тыс. погибших)"],
    ["1915 (май" + S + ")", "гибель парохода «<b>Лузитания</b>» — США грозят вступить в войну"],
    ["весна—лето", "<b>Горлицкий прорыв</b> (П. фон Гинденбург); «Великое отступление» — Россия оставила Польшу, Галицию, Литву"],
    ["1915 (май" + S + ")", "<b>Италия</b> перешла на сторону Антанты"],
    ["сентябрь", "в войну вступила <b>Болгария</b> → оформился <b>Четверной союз</b>; Сербия оккупирована («Албанская Голгофа»)"],
  ]],
  ["1916", [
    ["февраль", "начало штурма <b>Вердена</b> — «мясорубка»: немцы потеряли 600 тыс. чел., продвинулись на 7 км"],
    ["май—июнь", "<b>Брусиловский прорыв</b> в Галиции — Австро-Венгрия на грани катастрофы"],
    ["31 мая — 1 июня", "<b>Ютландское сражение</b> флотов Германии и Великобритании — без решающего успеха"],
    ["июль", "наступление Антанты на <b>Сомме</b>: потеряно 900 тыс. чел., продвижение на 10 км"],
    ["сентябрь", "на Сомме британцы впервые применили <b>танки</b>"],
    ["1916", "на стороне Антанты выступила <b>Румыния</b>"],
  ]],
  ["1917", [
    ["февраль—март", "<b>Февральская революция</b> в России, Николай II низложен; Временное правительство продолжает войну"],
    ["апрель" + S, "в войну вступили <b>США</b> (повод — неограниченная подводная война)"],
    ["апрель", "битва при Курси («бойня Нивеля»): <b>Русский экспедиционный корпус</b> во Франции взял высоту Мон-Спен"],
    ["середина года", "на стороне Антанты выступила <b>Греция</b>"],
    ["25—26 октября", "взятие власти <b>большевиками</b>"],
    ["декабрь", "перемирие Советской России со странами Четверного союза"],
  ]],
  ["1918", [
    ["3 марта", "<b>Брестский мир</b>; капитулировала Румыния; Германия перебрасывает войска на Запад"],
    ["март—июль", "5 мощных наступлений Германии на Западном фронте — без решающего успеха"],
    ["сент.—окт.", "штурм и прорыв <b>линии Гинденбурга</b> (важная роль танков)"],
    ["осень", "капитуляция Болгарии, Османской империи, Австро-Венгрии"],
    ["ноябрь", "революция в Германии, Вильгельм II лишился престола, провозглашена республика"],
    ["11 ноября", "<b>Компьенское перемирие</b> (подписал маршал <b>Ф. Фош</b>) — конец войны"],
    ["1918—1920", "пандемия «<b>испанки</b>» — погибли десятки миллионов, больше, чем в боях"],
  ]],
];
const TERMS = [
  ["Индустриальная цивилизация", "пришла на смену аграрной: главное — производство промышленных товаров, преобладает городское население, занятое в промышленности."],
  ["Модернизация", "переход от традиционного (аграрного) общества к индустриальному (городскому)."],
  ["Урбанизация", "рост населения городов, переселение в них жителей сельской местности."],
  ["Империализм", "стадия развития капитализма: монополизация капитала и силовая экспансия государств в его интересах."],
  ["Монополизм", "слияние капиталов и образование крупных монополий (картели, синдикаты, концерны, тресты)."],
  ["Колониализм", "система господства развитых государств над остальным миром (XV—XX вв.)."],
  ["Метрополия", "страна, владеющая колониями; колонии — источник сырья и рынок сбыта для неё."],
  ["Милитаризм", "система политических, экономических и идеологических средств правящих кругов для наращивания военной мощи; воинственные настроения."],
  ["Национализм", "течение, рассматривающее нацию как высшую ценность; сплочение людей для защиты интересов своей нации."],
  ["Шовинизм", "крайняя агрессивная форма национализма — стремление решить проблемы своей нации за счёт других."],
  ["Пацифизм", "движение против угрозы войны, за мир (в нём активно участвовали социалисты)."],
  ["Социализм", "общество без эксплуатации человека человеком, где экономика под контролем трудящихся."],
  ["Позиционная война", "война, в которой главное — попытки прорвать глубоко эшелонированную оборону на сплошном фронте большой протяжённости."],
  ["Геноцид", "действия с намерением уничтожить полностью или частично национальную, этническую, расовую или религиозную группу (термин Р. Лемкина)."],
  ["Антанта", "«Сердечное согласие»: Россия, Франция, Великобритания (+ позже Италия, Румыния, США, Греция и др.)."],
  ["Четверной союз", "Германия, Австро-Венгрия, Османская империя, Болгария (Центральные державы)."],
];
const PEOPLE = [
  ["Николай II", "император России с 1894 г.; низложен в феврале—марте 1917 г."],
  ["Вильгельм II", "германский кайзер, милитаристский режим, экспансионистские планы; лишился престола в ноябре 1918 г."],
  ["Франц Фердинанд", "наследник австро-венгерского престола, убит в Сараеве 28 июня 1914 г."],
  ["Гаврило Принцип", "19-летний серб из «Молодой Боснии», убийца Франца Фердинанда"],
  ["А. фон Шлиффен", "германский генерал, автор плана молниеносного разгрома Франции (1905)"],
  ["П. фон Гинденбург", "германский генерал; Горлицкий прорыв 1915 г.; его имя носила линия укреплений"],
  ["А. А. Брусилов", "русский генерал, Брусиловский прорыв в Галиции (май—июнь 1916)"],
  ["Ф. Фош", "французский маршал, подписал Компьенское перемирие 11 ноября 1918 г."],
  ["С. Степанович", "сербский воевода, победа при Цере (1914), вывел армию на о. Корфу (1916)"],
  ["Д. Ллойд Джордж", "британский министр финансов: социальные реформы 1906—1911 гг. (пенсии, страхование, минимум зарплаты)"],
  ["Р. Малиновский", "ефрейтор Русского экспедиционного корпуса, ранен при Курси (1917); будущий маршал"],
  ["Р. Лемкин", "автор термина «геноцид»"],
  ["В. Ленин", "назвал революции 1905—1913 гг. «пробуждением Азии»; большевики взяли власть в октябре 1917 г."],
  ["Мата Хари", "танцовщица, обвинена в шпионаже в пользу Германии и расстреляна (1917)"],
  ["Л. Корнилов, М. Тухачевский", "русские офицеры, бежавшие из немецкого плена (с 3-й и 5-й попытки)"],
  ["Ш. де Голль", "французский капитан, 6 раз пытался бежать из плена; будущий президент Франции"],
];
const LOSSES = [["Германская империя", 1773], ["Россия", 1635], ["Франция", 1357], ["Австро-Венгрия", 1200], ["Британская империя", 908], ["Италия", 650], ["Румыния", 335], ["Османская империя", 325], ["США", 126], ["Болгария", 87]];

// ---------- test ----------
const MCQ = [
  ["Поводом к Первой мировой войне стало:", ["вступление США в войну", "убийство Франца Фердинанда в Сараеве", "аннексия Боснии и Герцеговины", "Первая Балканская война"], 1],
  ["Эрцгерцога Франца Фердинанда убил:", ["Гаврило Принцип", "Степа Степанович", "Генри Гюнтер", "Рафаэль Лемкин"], 0],
  ["Первая мировая война началась:", ["28 июня 1914 г.", "1 августа 1914 г.", "28 июля 1914 г.", "4 августа 1914 г."], 2],
  ["В Антанту входили:", ["Германия, Австро-Венгрия, Италия", "Россия, Франция, Великобритания", "Россия, Германия, Франция", "Великобритания, США, Япония"], 1],
  ["Италия, член Тройственного союза, в 1915 г.:", ["осталась нейтральной до конца войны", "вступила в войну на стороне Германии", "перешла на сторону Антанты", "заключила сепаратный мир"], 2],
  ["План Шлиффена предусматривал:", ["разгром Франции до окончания мобилизации в России", "морскую блокаду Великобритании", "наступление через Балканы на Ближний Восток", "оборону на Западе и удар по России"], 0],
  ["Германская армия по плану Шлиффена обходила французские укрепления через:", ["Швейцарию", "Нидерланды", "Бельгию", "Люксембург и Италию"], 2],
  ["Наступление немцев на Париж было остановлено в 1914 г. в битве:", ["под Верденом", "на Сомме", "на Марне", "под Ипром"], 2],
  ["Победа русской армии в Восточной Пруссии в 1914 г. была одержана под:", ["Гумбинненом", "Горлицей", "Варшавой", "Цере"], 0],
  ["Немцы впервые применили ядовитый газ:", ["под Верденом в 1916 г.", "под Ипром в апреле 1915 г.", "на Марне в 1914 г.", "на Сомме в 1916 г."], 1],
  ["Танки впервые использовали:", ["немцы под Верденом", "французы на Марне", "британцы на Сомме", "русские в Галиции"], 2],
  ["Сражение, которое современники называли «мясорубкой»:", ["Верденское", "Ютландское", "Гумбинненское", "Горлицкое"], 0],
  ["Брусиловский прорыв произошёл:", ["в мае—июне 1916 г. в Галиции", "в 1915 г. в Польше", "в 1914 г. в Восточной Пруссии", "в 1917 г. под Ригой"], 0],
  ["Ютландское сражение — это:", ["сухопутная битва во Франции", "морское сражение Германии и Великобритании", "битва на Кавказском фронте", "сражение итальянцев с австрийцами"], 1],
  ["Формальным поводом для вступления США в войну стала:", ["атака на Пёрл-Харбор", "неограниченная подводная война Германии", "гибель «Титаника»", "революция в России"], 1],
  ["Четверной союз оформился со вступлением в войну:", ["Румынии", "Италии", "Болгарии", "Греции"], 2],
  ["Брестский мир Советская Россия заключила:", ["3 марта 1918 г.", "11 ноября 1918 г.", "25 октября 1917 г.", "28 июня 1919 г."], 0],
  ["Компьенское перемирие от имени союзников подписал:", ["А. Брусилов", "П. фон Гинденбург", "Ф. Фош", "Д. Ллойд Джордж"], 2],
  ["Всего в Первой мировой войне погибло около:", ["1,6 млн человек", "9,5 млн человек", "37 млн человек", "70 млн человек"], 1],
  ["Наибольшие потери погибшими понесла:", ["Франция", "Германская империя", "Австро-Венгрия", "Британская империя"], 1],
  ["Термин «пробуждение Азии» принадлежит:", ["В. Ленину", "А. Эйнштейну", "Д. Ллойд Джорджу", "К. Циолковскому"], 0],
  ["Младотурецкая революция произошла в:", ["1905 г.", "1908 г.", "1911 г.", "1914 г."], 1],
  ["В ходе Синьхайской революции в Китае была свергнута династия:", ["Мин", "Цин", "Хань", "Сун"], 1],
  ["Первую радиограмму в 1895 г. передал:", ["А. Попов", "братья Райт", "К. Циолковский", "А. Эйнштейн"], 0],
  ["Крайняя агрессивная форма национализма — это:", ["пацифизм", "шовинизм", "колониализм", "модернизация"], 1],
  ["Гаагские конференции 1899 и 1907 гг. были созваны по инициативе:", ["Германии", "Великобритании", "России", "США"], 2],
  ["Эльзас и Лотарингию Германия захватила у Франции в:", ["1871 г.", "1898 г.", "1905 г.", "1914 г."], 0],
  ["Война на истощение была выгоднее:", ["Германии и Австро-Венгрии", "Великобритании и Франции", "Болгарии и Турции", "России и Румынии"], 1],
  ["Термин «геноцид» ввёл:", ["Ф. Фош", "Р. Лемкин", "А. Попов", "В. Вильсон"], 1],
  ["Из России в годы войны было мобилизовано около:", ["4 млн человек", "16 млн человек", "37 млн человек", "70 млн человек"], 1],
];
const MATCH = [
  ["Даты и события", [["28 июня 1914 г.", "Сараевское убийство"], ["сентябрь 1914 г.", "битва на Марне"], ["май—июнь 1916 г.", "Брусиловский прорыв"], ["11 ноября 1918 г.", "Компьенское перемирие"]], [2, 0, 3, 1]],
  ["Страны и события", [["Китай", "Синьхайская революция"], ["Османская империя", "младотурецкий переворот"], ["Мексика", "революция 1910—1917 гг."], ["Иран", "революция 1905 г. во главе с духовенством"]], [1, 3, 0, 2]],
  ["Деятели и факты", [["А. фон Шлиффен", "план разгрома Франции через Бельгию"], ["А. Брусилов", "прорыв фронта в Галиции"], ["Ф. Фош", "подписал перемирие в Компьенском лесу"], ["Г. Принцип", "убийство эрцгерцога"]], [3, 0, 2, 1]],
  ["Причины и последствия", [["наступление русских в Восточной Пруссии", "переброска германских войск на восток, провал плана Шлиффена"], ["средства обороны сильнее средств наступления", "переход к позиционной войне"], ["неограниченная подводная война Германии", "вступление США в войну"], ["Брестский мир", "переброска германских сил на Западный фронт"]], [1, 2, 3, 0]],
];

const T_ANS = MCQ.map((m, i) => `${i + 1}${["А", "Б", "В", "Г"][m[2]]}`).join(" · ");
const L = ["А", "Б", "В", "Г"];
const mcqHTML = `<div class="mcq">${MCQ.map(([q, opts], i) => `<div class="mq"><b>${i + 1}.</b> ${q}<div class="opts">${opts.map((o, j) => `<span><em>${L[j]}</em>${o}</span>`).join("")}</div></div>`).join("")}</div>`;
const matchHTML = MATCH.map(([t, pairs, perm], k) => `<div class="match"><div class="m-h">Задание ${k + 1}. Соотнесите: ${t.toLowerCase()}</div><div class="m-g"><div>${pairs.map((p, i) => `<div><em>${i + 1}</em>${p[0]}</div>`).join("")}</div><div>${perm.map((pi, j) => `<div><em>${L[j]}</em>${pairs[pi][1]}</div>`).join("")}</div></div></div>`).join("");
const matchKey = MATCH.map(([t, pairs, perm], k) => `${k + 1}) ` + pairs.map((p, i) => `${i + 1}${L[perm.indexOf(i)]}`).join(" ")).join(" &nbsp;·&nbsp; ");

// ---------- pages ----------
const COVERP = `
<div class="hero">
  <div class="h-top">Всеобщая история · Глава I · § 1—2</div>
  <h1>Первая мировая война</h1>
  <div class="h-sub">Подготовка к контрольной работе: опорный конспект, хронология, понятия, персоналии, карты, ответы на вопросы параграфов и тренажёр с ключом</div>
  <div class="h-how">
    <div><b>1</b>Прочитай «Главное за 5 минут» и хронологию — это каркас темы.</div>
    <div><b>2</b>Учи понятия и персоналии: закрывай правую колонку и проверяй себя.</div>
    <div><b>3</b>Разбери опорные конспекты § 1 и § 2 и ответы на вопросы.</div>
    <div><b>4</b>Реши тренажёр и сверься с ключом в конце.</div>
  </div>
</div>
<div class="part kx first">
<div class="label">Главное за 5 минут</div>
<div class="keys">${KEY.map(([n, t]) => `<div><b>${n}</b><span>${t}</span></div>`).join("")}</div>
<div class="legend-note">Значком ${S} отмечены факты, добавленные сверх текста учебника (точные даты и общеизвестные сведения) — для полноты подготовки.</div>
</div>`;

const CHRONOP = `<div class="part kc">${phead("pc", I("calendar", "hic"), "Хронология", "от образования блоков до Компьенского перемирия", "calendar")}
${CHRONO.map(([period, rows]) => `<div class="cy"><div class="cy-h">${period}</div><table class="ct">${rows.map(([d, t]) => `<tr><td>${d}</td><td>${t}</td></tr>`).join("")}</table></div>`).join("")}
<div class="mnem">${I("lightbulb", "nic")}<div><b>Запомни «цепочку» лета 1914 г.:</b> 28.06 — выстрел в Сараеве → 28.07 — Австро-Венгрия против Сербии → Россия объявляет мобилизацию → 01.08 — Германия против России → Германия против Франции → 04.08 — Великобритания против Германии.</div></div>
</div>`;

const TERMSP = `<div class="part kt2">${phead("pt2", I("book-open", "hic"), "Понятия и персоналии", "закрой правую колонку и проверь себя", "book-open")}
<div class="label">Понятия (по словарю учебника)</div>
<div class="fc">${TERMS.map(([t, d]) => `<div><b>${t}</b><span>${d}</span></div>`).join("")}</div>
<div class="label">Кто есть кто</div>
<table class="pp">${PEOPLE.map(([n, d]) => `<tr><td>${n}</td><td>${d}</td></tr>`).join("")}</table>
</div>`;

const P1P = `<div class="part k1">${phead("p1w", "§ 1", "Мир накануне Первой мировой войны", "Главный вопрос: в чём состояли причины роста противоречий между мировыми державами в начале XX в.?", "globe")}
${sec(1, "Индустриальная цивилизация", `<div class="grid3">
  ${tile("factory", "Основа — промышленность", "экономикой передовых стран управляет буржуазия; машинное производство, массовый выпуск товаров")}
  ${tile("users", "Урбанизация и рост населения", "крестьяне уходят в города; смертность падает при высокой рождаемости")}
  ${tile("alert-triangle", "Оборотная сторона", "кризисы, «лишние люди», безработица, миграция в Америку и колонии; рабочие — «придаток фабрик»")}
</div><p class="small">Индустриальное общество сложилось лишь в части стран Европы и Северной Америки; Россия и ряд стран находились в состоянии <b>модернизации</b>.</p>`)}
${sec(2, "Империализм и колониализм", `${chain(["свободная конкуренция", "<b>монополии</b>: картели, синдикаты, концерны, тресты", "раздел международных рынков; контроль <b>финансового капитала</b>", "<b>колониальные империи</b>: к концу XIX в. Запад управляет большей частью планеты"])}
<p class="small">Не были колониями лишь <b>Китай, Япония, Сиам, Афганистан</b> (Азия), <b>Абиссиния и Либерия</b> (Африка) — но и они зависели от Европы и США. Колонии — источник сырья и рынок сбыта для <b>метрополий</b>. Пример протеста — <b>Мексиканская революция 1910—1917 гг.</b></p>`)}
${sec(3, "«Пробуждение Азии» (1905—1913)", `<table class="kt"><thead><tr><th>Страна</th><th>Событие</th><th>Итог</th></tr></thead><tbody>
  <tr><td><b>Иран</b></td><td>1905 — демонстрации в Тегеране, движение возглавило духовенство</td><td>гражданская война; прекращена вступлением российских войск на север страны</td></tr>
  <tr><td><b>Османская империя</b></td><td>1908 — переворот офицеров «Единения и прогресса» (<b>младотурки</b>)</td><td>конституция, султан отстранён; потери: Босния (1908), Ливия (1911—1912), Балканы (1912); гонения на нацменьшинства, союз с Германией</td></tr>
  <tr><td><b>Китай</b></td><td>1911—1913 — <b>Синьхайская революция</b></td><td>свергнута маньчжурская династия <b>Цин</b>; период потрясений</td></tr>
  <tr><td><b>Индия</b></td><td>волнения</td><td>борьба против британского колониализма</td></tr>
</tbody></table>`)}
${sec(4, "Технологический рывок", `<div class="grid4">
  <div class="tech"><b>1895</b>А. Попов — радио</div><div class="tech"><b>1903</b>братья Райт — самолёт</div><div class="tech"><b>1903</b>К. Циолковский — космические полёты</div><div class="tech"><b>1905</b>А. Эйнштейн — теория относительности</div>
</div><p class="small">Появились автомобили, кино, самолёты — и <b>средства уничтожения</b>: пулемёты, бронеавтомобили, подводные лодки. Плодами прогресса пользовались в основном обеспеченные слои.</p>`)}
${sec(5, "Рабочее движение и социализм", `<table class="kt cmp"><thead><tr><th></th><th>Социал-демократы</th><th>Анархо-синдикалисты</th></tr></thead><tbody>
  <tr><td><b>Цель</b></td><td colspan="2">замена капитализма <b>социализмом</b></td></tr>
  <tr><td><b>Путь</b></td><td>революция после долгой борьбы за условия труда; демократия и социальные законы; партии объединились во <b>II Интернационал</b>; часть — реформисты, часть — радикалы</td><td>революция разрушит капитализм и государство; заводы — органам самоуправления и профсоюзам (синдикатам); общество без власти — <b>анархия</b></td></tr>
  <tr><td><b>Государство</b></td><td>можно использовать для построения коммунизма</td><td>должно быть уничтожено</td></tr>
</tbody></table><p class="small">Итог борьбы — социальное законодательство (Великобритания, США, Германия): профсоюзы, право на стачки, страхование; реформы <b>Д. Ллойд Джорджа</b> 1906—1911 гг.</p>`)}
${sec(6, "Национализм, шовинизм, пацифизм. Два блока", `
<div class="blocs"><div class="bl ent"><b>Антанта</b><span>Россия · Франция · Великобритания</span></div><div class="vs">VS</div><div class="bl tri"><b>Тройственный союз</b><span>Германия · Австро-Венгрия · Италия</span></div></div>
<table class="kt"><thead><tr><th>Держава</th><th>Чего добивалась</th></tr></thead><tbody>
  <tr><td><b>Германия</b></td><td>«обделена» колониями; экспансия на Ближний Восток по железной дороге через Балканы; передел Европы (планы националистов); гонка флота — тоннаж кораблей ×15 за 1884—1914</td></tr>
  <tr><td><b>Австро-Венгрия</b></td><td>расширить владения на Балканах</td></tr>
  <tr><td><b>Италия</b></td><td>италоговорящие <b>Триест и Трентино</b> (под властью Австро-Венгрии); «обделена» колониями</td></tr>
  <tr><td><b>Франция</b></td><td>вернуть <b>Эльзас и Лотарингию</b>, захваченные Германией в 1871 г.</td></tr>
  <tr><td><b>Великобритания</b></td><td>сохранить колониальное и морское первенство против Германии (тоннаж флота ×3 за 1884—1914)</td></tr>
  <tr><td><b>Россия</b></td><td><b>Черноморские проливы</b> (безопасность юга), <b>Галиция</b>, защита славян и <b>Сербии</b></td></tr>
</tbody></table>
<div class="why"><div class="why-h">${I("target", "nic")}Причины Первой мировой войны</div><ol>
  <li>борьба за передел <b>колоний и рынков сбыта</b>;</li>
  <li>стремление к <b>переделу границ</b> в Европе;</li>
  <li>желание <b>отвлечь рабочих</b> от социальной борьбы;</li>
  <li>интересы <b>милитаристских кругов</b> и военного производства;</li>
  <li>различия политического устройства (парламентские Франция и Британия — против кайзеровской Германии);</li>
  <li>соперничество за <b>Балканы</b> (Германия, Австро-Венгрия, Россия) — «любая искра могла вызвать столкновение».</li></ol></div>`)}
</div>`;

const P2P = `<div class="part k2">${phead("p2w", "§ 2", "Первая мировая война. 1914—1918 гг.", "Главный вопрос: каковы были итоги Первой мировой войны и что на них повлияло?", "swords")}
${sec(1, "Начало войны и план Шлиффена", `${chain(["<b>Сараево</b>, 28.06<br>убийство Франца Фердинанда", "Ультиматум Сербии (следствие на её территории — нарушение суверенитета)", "<b>28.07</b> А-В объявляет войну Сербии; Россия — мобилизация, но продолжает переговоры", "<b>01.08</b> Германия — войну России, затем Франции; <b>04.08</b> Британия — Германии"])}
<div class="box"><div class="box-h">${I("map", "bxic")}План Шлиффена (1905)</div>${bullets(["разгромить <b>Францию до окончания мобилизации в России</b> — избежать войны на 2 фронта;", "обойти французские укрепления через <b>нейтральную Бельгию</b> (нарушение международных договоров);", "Антанта же рассчитывала задушить Германию <b>морской блокадой</b> и ударами с двух сторон."])}</div>`)}
${sec(2, "Ход войны по годам", `<div class="years">
  <div class="yr"><div class="yr-h">1914</div>${bullets(["армии: >6 млн у Антанты, >3,5 млн у Тройственного союза", "<b>Марна</b> — «чудо на Марне», Париж спасён", "Россия наступает в <b>Восточной Пруссии</b> (Гумбиннен) — немцы перебрасывают войска на восток", "русские успехи в <b>Галиции</b>; сербы побеждают при <b>Цере</b>", "Антанта захватывает германские колонии, блокада Германии", "вступает <b>Османская империя</b>, поражения на Кавказе"])}<div class="yr-r">Итог: план Шлиффена провален, война на 2 фронта</div></div>
  <div class="yr"><div class="yr-h">1915</div>${bullets(["геноцид армян в Османской империи", "газ под <b>Ипром</b> (апрель)", "<b>Горлицкий прорыв</b>, «Великое отступление» русских: нехватка снарядов и винтовок", "Италия — за Антанту; <b>Болгария</b> — Четверной союз; Сербия оккупирована", "«Лузитания» — ограничение подводной войны"])}<div class="yr-r">Итог: фронт стабилизировался — <b>позиционная война</b>; Восточный фронт не ликвидирован</div></div>
  <div class="yr"><div class="yr-h">1916</div>${bullets(["<b>Верден</b> — «мясорубка»: −600 тыс., +7 км", "<b>Брусиловский прорыв</b> — Австро-Венгрия на грани катастрофы", "<b>Ютланд</b> — без решающего успеха", "<b>Сомма</b> — −900 тыс., +10 км; первые танки", "Румыния — за Антанту"])}<div class="yr-r">Итог: «борьба на истощение», перевес Антанты</div></div>
  <div class="yr"><div class="yr-h">1917</div>${bullets(["Февральская революция, Николай II низложен", "<b>США</b> вступают в войну (подводная война, экономические связи с Антантой)", "РЭК во Франции — Курси, Мон-Спен", "Греция — за Антанту", "Октябрь: большевики; декабрь — перемирие"])}<div class="yr-r">Итог: Восточный фронт рушится, но на сторону Антанты встаёт экономика США</div></div>
  <div class="yr"><div class="yr-h">1918</div>${bullets(["<b>Брестский мир</b> (3 марта), капитуляция Румынии", "5 германских наступлений на Западе — истощение", "прорыв <b>линии Гинденбурга</b> (танки)", "капитуляция союзников Германии; революция в Германии", "<b>11 ноября</b> — Компьенское перемирие (Ф. Фош)"])}<div class="yr-r">Итог: поражение Четверного союза</div></div>
</div>`)}
${sec(3, "Новое оружие и позиционная война", `<table class="kt"><thead><tr><th>Оружие</th><th>Когда и где</th><th>Как повлияло</th></tr></thead><tbody>
  <tr><td><b>Пулемёты, артиллерия</b></td><td>с начала войны</td><td>оборона стала сильнее наступления → окопы, мины, колючая проволока, <b>позиционная война</b></td></tr>
  <tr><td><b>Химическое оружие</b></td><td>апрель 1915, Ипр (немцы)</td><td>до 5 тыс. погибших, но фронт не прорван; затем применяли обе стороны</td></tr>
  <tr><td><b>Подводные лодки</b></td><td>1915—1917</td><td>попытка прорвать блокаду; «Лузитания»; неограниченная подводная война → вступление США</td></tr>
  <tr><td><b>Танки</b></td><td>сентябрь 1916, Сомма (британцы)</td><td>паника у немцев; усовершенствованные танки помогли прорвать линию Гинденбурга в 1918 г.</td></tr>
  <tr><td><b>Авиация, бронеавтомобили</b></td><td>с 1914 г.</td><td>разведка и бои; кавалерия теряла значение</td></tr>
</tbody></table>`)}
${sec(4, "Тыл: борьба на истощение", `<div class="grid3">
  ${tile("factory", "Военное производство", "большинство предприятий перешло на военную продукцию → дефицит товаров")}
  ${tile("scroll-text", "Госрегулирование", "сначала в Германии: планы производства, нормы ресурсов, продовольственные карточки")}
  ${tile("banknote", "Чёрный рынок", "карточки не покрывали потребностей — часть продуктов продавали нелегально")}
  ${tile("hammer", "Трудовая повинность", "обязательная — из-за нехватки рабочих рук")}
  ${tile("users", "Беженцы", "12 млн человек в Европе; «Албанская Голгофа» сербов")}
  ${tile("alert-triangle", "Эпидемии", "«испанка» 1918—1920 гг. унесла десятки миллионов — больше, чем бои")}
</div>`)}
${sec(5, "Роль России и Восточного фронта", bullets(["в 1914 г. начала наступление, <b>не дожидаясь окончания мобилизации</b>, — сорвала план Шлиффена и помогла спасти Париж;", "сковывала силы Германии и Австро-Венгрии, которым так и <b>не удалось ликвидировать Восточный фронт</b>;", "<b>Брусиловский прорыв</b> 1916 г. заставил немцев снимать войска с Западного фронта;", "Русский экспедиционный корпус сражался во Франции (Курси, 1917);", "Россия не была разбита на фронтах, но её <b>социальная структура не выдержала</b> напряжения войны → революции 1917 г. и Брестский мир."]))}
${sec(6, "Цифры войны", `<div class="stats"><div><b>70 млн</b><span>мобилизовано</span></div><div><b>9,5 млн</b><span>погибших</span></div><div><b>20 млн+</b><span>раненых</span></div></div>
<div class="chart"><div class="ch-t">Потери погибшими и умершими от ран, тыс. человек</div>
${LOSSES.map(([c, v]) => `<div class="hb"><span>${c}</span><i style="width:${(v / 1773 * 100).toFixed(1)}%"></i><em>${v.toLocaleString("ru-RU")}</em></div>`).join("")}
<div class="ch-s">Источник: таблица в учебнике (ресурсы к главе I)</div></div>`)}
${sec(7, "Почему победила Антанта", `<div class="row2"><div class="mini right"><b>Поражение Четверного союза</b><ul><li>провал «молниеносной войны» — война на 2 фронта;</li><li>морская блокада, нехватка сырья и продовольствия;</li><li>слабые союзники Германии (Австро-Венгрия, Турция, Болгария);</li><li>истощение в наступлениях 1918 г.; революция в Германии.</li></ul></div>
<div class="mini left"><b>Победа Антанты</b><ul><li>превосходство в людских и экономических ресурсах;</li><li>колонии и сильный флот — выгодна война на истощение;</li><li>вступление США с огромным экономическим потенциалом;</li><li>жертвы России в 1914—1916 гг.; танки и прорыв линии Гинденбурга.</li></ul></div></div>`)}
</div>`;

const MAPSP = `<div class="land"><div class="mapfull"><img src="${IMG("map_colonies.jpg")}"><div class="cap">Территориальный раздел мира: метрополии и колонии к 1914 г. (карта из учебника, с. 18—19)</div></div></div>
<div class="land"><div class="mapfull"><img src="${IMG("map_war.jpg")}"><div class="cap">Первая мировая война 1914—1918 гг. Европейский театр военных действий (карта из учебника, с. 34—35)</div></div></div>`;

const A1 = `<div class="part ka">${phead("pa", "§ 1", "Ответы на вопросы § 1", "вопросы в тексте параграфа и рубрика «Вопросы и задания»", "check-circle")}
<div class="label">Вопросы в тексте</div>
${qa("1.1", "Сформулируйте особенности индустриальной цивилизации.", "Основа — промышленность, влияющая на все сферы жизни; экономикой управляет буржуазия; разделение труда, машинное и массовое производство, рост потребления ресурсов; урбанизация и быстрый рост населения; жёсткая специализация и стандарты, охватившие весь мир; неустойчивость экономики (кризисы), безработица, миграции. Сложилась лишь в части стран Европы и Северной Америки.")}
${qa("1.2", "Вспомните, как происходил процесс модернизации в России.", `Модернизация шла «сверху» и с опозданием: отмена крепостного права (1861) и Великие реформы${S}; ускоренная индустриализация конца XIX в. — строительство железных дорог, протекционизм, привлечение иностранного капитала, денежная реформа С. Витте (1897)${S}; Столыпинская аграрная реформа (1906—1911)${S}. В начале XX в. Россия оставалась аграрно-индустриальной страной.`)}
${qa("—", "Влияли ли успехи военной промышленности на внешнюю политику Германии?", "Да: мощная военная промышленность (заводы Круппа — около 120 тыс. рабочих, пушка «Большая Берта») подталкивала Германию к агрессивной политике — гонка морских вооружений (тоннаж флота вырос в 15 раз за 1884—1914 гг.), ставка на быструю победу (план Шлиффена), притязания на колонии и Ближний Восток.")}
${qa("2", "Когда и как началось складывание колониальных империй?", `С эпохи Великих географических открытий — колониализм существовал с XV в.${S}: европейцы захватывали земли в Америке, Азии и Африке. К концу XIX в. раздел мира завершился: Старый Свет поделён между державами Запада, которые использовали колонии как источник сырья и рынок сбыта.`)}
${qa("3.1", "В чём состояли причины «пробуждения Азии»?", "Начало модернизации с тяжёлыми социальными последствиями (разорённые крестьяне в городах); засилье иностранного капитала; новые слои — предприниматели и интеллигенция с западными, в том числе революционными, идеями; недовольство офицерства слабостью своих стран; влияние российской революции 1905—1907 гг.")}
${qa("3.2", "Назовите последствия революционных событий в азиатских странах.", "Широкие слои населения Азии вовлечены в политику; завершился период медленного развития; выросло национальное самосознание, азиатские народы стали влиять на мировые события. Конкретно: в Иране — гражданская война, в Турции — конституция и власть младотурок, в Китае — свержение династии Цин.")}
${qa("—", "О каких предателях говорится в листовке младотурок?", "Предположительно — о сторонниках прежних султанских порядков и противниках конституции, а также (в духе агрессивного национализма младотурок) о «внутренних врагах» — национальных меньшинствах империи.")}
${qa("4.1", "Важнейшие научные открытия и изобретения начала XX в.", "Радио (А. Попов, 1895), самолёт (братья Райт, 1903), обоснование космических полётов (К. Циолковский, 1903), теория относительности (А. Эйнштейн, 1905), автомобили, кинематограф; в военной сфере — пулемёты, бронеавтомобили, подводные лодки.")}
${qa("4.2", "Положительные и отрицательные последствия технического прогресса.", "<b>Плюсы:</b> новые средства связи и транспорта, перспектива победы над голодом и болезнями, рост производства. <b>Минусы:</b> разрушение традиционного уклада, эксплуатация, плоды прогресса доступны лишь обеспеченным, ложные надежды на «всеобщее благоденствие», создание средств массового уничтожения.")}
${qa("5", "Дайте характеристику двум течениям в рабочем движении.", "<b>Социал-демократы</b> (в основном марксисты): к социализму через революцию, которая созреет после долгой борьбы за права рабочих; добивались демократии и социальных законов, объединились во II Интернационал; считали, что для построения коммунизма можно использовать государство; делились на умеренных реформистов и радикалов. <b>Анархо-синдикалисты:</b> революция разрушит капитализм и государство, заводы перейдут к профсоюзам (синдикатам), общество без власти — анархия.")}
${qa("6.1", "Какие явления индустриального общества способствовали национализму и шовинизму?", "Конкуренция монополий разных стран за мировые рынки; материальная выгода рабочих от успехов «своих» монополий и государств; борьба за колонии — всё это сплачивало людей по национальному признаку, а национализм перерастал в шовинизм и расизм.")}
${qa("6.2", "Что привело к складыванию двух военно-политических блоков?", "Острые противоречия Великобритании и Франции с Германией (колонии, флот, Эльзас и Лотарингия); борьба Германии, Австро-Венгрии и России за Балканы; «обделённость» Германии, Австро-Венгрии и Италии колониями; гонка вооружений и милитаризм.")}
${qa("—", "Какие территории планировали присоединить к Германии? (карта «Будущий раздел Европы»)", "По карте германских националистов: Нидерланды, Бельгию, Люксембург и северо-восток Франции («новые имперские земли»), российскую Прибалтику, Польшу (как «королевство — германское федеративное государство»); Англия превращалась в германский протекторат, а Австро-Венгрия расширялась на восток.")}
${qa("—", "Объясните символы плаката «Согласие».", "Три женские фигуры олицетворяют союзников по Антанте: в центре — <b>Россия</b> с крестом и щитом (вера и защита), по сторонам — <b>Франция</b> и <b>Великобритания</b> (с якорем — символом морского могущества). Центральное место России подчёркивает её ключевую роль в союзе; единство трёх фигур — прочность «Согласия».")}
<div class="label">Вопросы и задания</div>
${qa("1", "Охарактеризуйте основные черты индустриального общества.", "См. ответ 1.1: промышленность — основа экономики; машинное массовое производство; урбанизация; рост населения; специализация и мировое разделение труда; власть буржуазии; кризисы и социальные противоречия.")}
${qa("2", "Таблица колониальных владений мировых держав в начале XX в.", `<table class="kt mini-t"><tr><td><b>Великобритания</b></td><td>Индия, Египет, Судан, Южная Африка; доминионы — Канада, Австралия, Новая Зеландия${S}</td></tr><tr><td><b>Франция</b></td><td>Индокитай, Алжир, Тунис, Марокко, Западная и Экваториальная Африка, Мадагаскар${S}</td></tr><tr><td><b>Германия</b></td><td>Того, Камерун, Юго-Западная и Восточная Африка, острова в Тихом океане, владение в Китае${S}</td></tr><tr><td><b>Италия</b></td><td>Эритрея, Сомали, Ливия (с 1912)${S}</td></tr><tr><td><b>Бельгия · Нидерланды · Португалия</b></td><td>Бельгийское Конго; Индонезия; Ангола и Мозамбик${S}</td></tr><tr><td><b>США · Япония</b></td><td>Филиппины, Пуэрто-Рико, Гавайи; Корея, Тайвань${S}</td></tr></table>`)}
${qa("3", "Регионы, к контролю над которыми стремилась каждая держава.", "<b>Германия</b> — Ближний Восток, Балканы, колонии в Африке, Западная и Восточная Европа; <b>Австро-Венгрия</b> — Балканы (Сербия); <b>Италия</b> — Триест, Трентино, Северная Африка; <b>Франция</b> — Эльзас и Лотарингия, Африка; <b>Великобритания</b> — сохранение колоний и морского господства, Ближний Восток; <b>Россия</b> — Черноморские проливы, Галиция, Балканы.")}
${qa("4", "Сформулируйте причины Первой мировой войны.", "Передел колоний и рынков; стремление к переделу границ в Европе; борьба за Балканы; гонка вооружений и интересы милитаристских кругов; желание отвлечь рабочих от социальной борьбы; противостояние двух военных блоков; национализм и шовинизм.")}
${qa("5*", "Можно ли было предотвратить войну? По 2 аргумента «за» и «против».", "<b>Можно:</b> 1) работали Гаагские конференции и пацифистское движение (с участием социалистов); 2) формально державы не предъявляли друг другу территориальных претензий, а Россия даже после мобилизации вела переговоры. <b>Нельзя:</b> 1) противоречия были глубокими (колонии, рынки, Балканы, Эльзас и Лотарингия), а Европа разделилась на два враждебных блока; 2) гонка вооружений и милитаризм создали ситуацию, когда «любая искра» вела к войне — Гаагские соглашения остались на бумаге.")}
${qa("Хр.", "Хронологический порядок.", "Создание Антанты (1904—1907) → Младотурецкая революция (1908) → Синьхайская революция (1911—1913) → Первая Балканская война (1912).")}
${qa("Пон.", "Милитаризм и его примеры (курс 9 класса).", `Милитаризм — система средств правящих кругов для наращивания военной мощи, воинственные настроения в обществе. Примеры: объединение Германии «железом и кровью» О. Бисмарка и курс Вильгельма II на гонку флота${S}; военные реформы и экспансия Японии после реставрации Мэйдзи${S}.`)}
${qa("Ист.", "Сравните 2 иллюстрации: какой блок изображает каждая?", "Карта «Будущий раздел Европы» — <b>Тройственный союз</b> (Германия и Австро-Венгрия поглощают соседей): цель — передел Европы и экспансия. Плакат «Согласие» — <b>Антанта</b> (Россия, Франция, Великобритания): единство союзников и защита от агрессора.")}
<div class="concl"><div class="cc-h">${I("check-circle", "ccic")}Ответ на главный вопрос § 1</div><p>Противоречия между державами росли потому, что: 1) монополии и государства боролись за <b>колонии, рынки и сырьё</b> — Германия, Австро-Венгрия и Италия считали себя «обделёнными»; 2) сталкивались <b>территориальные интересы</b> — Эльзас и Лотарингия, Балканы, проливы; 3) усиливались <b>национализм, шовинизм и милитаризм</b> (гонка флотов: у Германии ×15), а Европа разделилась на <b>два блока</b> — Антанту и Тройственный союз.</p></div>
</div>`;

const A2 = `<div class="part ka2">${phead("pa2", "§ 2", "Ответы на вопросы § 2", "вопросы в тексте, «Вопросы и задания», ресурсы к главе", "check-circle")}
<div class="label">Вопросы в тексте</div>
${qa("1.1", "Какое событие послужило толчком к войне? Можно ли считать его причиной?", "Толчок — убийство Франца Фердинанда в Сараеве 28 июня 1914 г. Это <b>повод</b>, а не причина: причины — глубокие противоречия держав (колонии, рынки, Балканы, блоки, гонка вооружений); выстрел лишь «поджёг» уже готовый конфликт.")}
${qa("1.2", "В чём состоял план А. фон Шлиффена?", "Разгромить Францию до окончания мобилизации в России, обойдя французские укрепления через нейтральную Бельгию, а затем повернуть все силы против России — избежать войны на два фронта.")}
${qa("—", "О каких настроениях свидетельствует фото проводов полка в Берлине?", "О патриотическом подъёме и воодушевлении, поддержке войны населением, уверенности в быстрой победе.")}
${qa("2.1", "Причины и последствия провала плана Шлиффена.", "<b>Причины:</b> наступление русских в Восточной Пруссии (Гумбиннен) до окончания мобилизации — немцы сняли часть сил с Запада; стойкость французов и англичан на Марне; наступление русских в Галиции — пришлось спасать Австро-Венгрию. <b>Последствия:</b> война на два фронта, затяжная война, переход к позиционной войне, морская блокада Германии.")}
${qa("2.2", "Какую роль сыграла Россия в кампании 1914 г.?", "Ключевую: её наступление в Восточной Пруссии отвлекло германские силы и помогло спасти Париж; в Галиции русские разбили австрийцев; на Кавказе — турок. Германия не смогла избежать войны на два фронта.")}
${qa("3.1", "Назовите причины перехода к позиционной войне.", "Средства обороны оказались сильнее средств наступления: многокилометровые окопы, минные поля, колючая проволока, пулемётный и артиллерийский огонь; силы сторон были примерно равны, прорвать сплошной фронт было почти невозможно.")}
${qa("3.2", "Цели новых стран, вступивших в войну в 1915 г.", `<b>Болгария</b> — реванш у старого противника Сербии (земли Македонии${S}); <b>Италия</b> — присоединить италоговорящие Триест и Трентино и другие земли Австро-Венгрии.`)}
${qa("—", "Почему мирные жители уходили с отступающими войсками?", "Боялись насилия и репрессий оккупантов, не желали покориться врагу, опасались голода и разорения.")}
${qa("4", "Какие мероприятия проводили государства для работы тыла?", "Перевод предприятий на военную продукцию; государственное регулирование производства и распределения; планы производства и нормы ресурсов; продовольственные карточки; обязательная трудовая повинность.")}
${qa("5.1", "Назовите итоги кампании 1916 г.", "Верден и Сомма — огромные потери при ничтожном продвижении; Брусиловский прорыв поставил Австро-Венгрию на грань катастрофы, немцы перебрасывали войска с Запада; Ютландское сражение — без решающего успеха; Румыния вступила за Антанту. Перевес стал переходить к Антанте.")}
${qa("5.2", "Роль Брусиловского прорыва в изменении тактики и стратегии.", `Впервые позиционный фронт прорвали одновременным наступлением на нескольких участках${S}; прорыв облегчил положение союзников под Верденом и в Италии${S}, Австро-Венгрия больше не проводила крупных самостоятельных наступлений, а стратегическая инициатива перешла к Антанте.`)}
${qa("6", "Какие события привели к Компьенскому перемирию?", "Вступление США; провал пяти германских наступлений 1918 г. и истощение армии; контрнаступление Антанты и прорыв линии Гинденбурга (танки); капитуляция Австро-Венгрии, Болгарии, Османской империи; революция в Германии и падение Вильгельма II.")}
<div class="label">Вопросы и задания</div>
${qa("1", "Факторы: а) поражения Четверного союза; б) победы Антанты.", "См. блок «Почему победила Антанта» в опорном конспекте: провал молниеносной войны, война на 2 фронта, блокада, слабость союзников Германии, истощение и революция — против превосходства ресурсов, колоний и флота, экономики США, жертв России и новых технических средств (танки).")}
${qa("2", "Какой характер носила война для различных стран?", "Для великих держав обоих блоков — <b>империалистическая, захватническая</b> (передел колоний, рынков, границ). Для <b>Сербии и Бельгии</b>, подвергшихся нападению, — оборонительная, за независимость. Для России — защита Сербии и своих интересов на Балканах, но и борьба за проливы и Галицию.")}
${qa("3", "Таблица «Боевые действия в Европе».", `<table class="kt mini-t"><thead><tr><th>Дата</th><th>Событие</th><th>Итоги</th></tr></thead><tbody>
  <tr><td>авг.—сент. 1914</td><td>Восточно-Прусская операция</td><td>немцы перебросили войска с Запада</td></tr>
  <tr><td>сент. 1914</td><td>битва на Марне</td><td>Париж спасён, план Шлиффена провален</td></tr>
  <tr><td>апр. 1915</td><td>газовая атака под Ипром</td><td>до 5 тыс. погибших, фронт не прорван</td></tr>
  <tr><td>весна—лето 1915</td><td>Горлицкий прорыв</td><td>русские оставили Польшу, Галицию, Литву</td></tr>
  <tr><td>февр. 1916</td><td>Верден</td><td>−600 тыс. у немцев, +7 км</td></tr>
  <tr><td>май—июнь 1916</td><td>Брусиловский прорыв</td><td>Австро-Венгрия на грани катастрофы</td></tr>
  <tr><td>июль 1916</td><td>Сомма (танки — сент.)</td><td>−900 тыс., +10 км</td></tr>
  <tr><td>март—июль 1918</td><td>5 наступлений Германии</td><td>истощение германской армии</td></tr>
  <tr><td>сент.—окт. 1918</td><td>прорыв линии Гинденбурга</td><td>капитуляция Германии</td></tr></tbody></table>`)}
${qa("4", "Новое оружие и его влияние на ход войны.", "Пулемёты и артиллерия (позиционная война), отравляющие газы (Ипр, 1915), танки (Сомма, 1916; прорыв линии Гинденбурга, 1918), подводные лодки (блокада, вступление США), авиация, бронеавтомобили. Новое оружие сделало войну затяжной и кровопролитной, а танки в итоге помогли сломить оборону.")}
${qa("5", "Роль Восточного фронта.", "Сорвал план молниеносной войны, приковывал значительные силы Германии и Австро-Венгрии все годы; Брусиловский прорыв спасал союзников; Германия так и не смогла ликвидировать фронт. Выход России из войны (Брестский мир) позволил немцам перебросить силы на Запад, но уже было поздно — вступили США.")}
${qa("6", "Сообщение о военачальнике (образец).", `<b>Алексей Алексеевич Брусилов</b> (1853—1926)${S} — русский генерал, командующий Юго-Западным фронтом. В мае—июне 1916 г. провёл наступление в Галиции, вошедшее в историю как Брусиловский прорыв: фронт прорвали одновременно на нескольких участках, Австро-Венгрия оказалась на грани катастрофы, немцам пришлось перебрасывать войска с Запада. В 1917 г. — Верховный главнокомандующий${S}. Другой пример из учебника — сербский воевода <b>Степа Степанович</b> (победа при Цере, 1914).`)}
${qa("Хр.", "Хронологический порядок событий.", "Убийство Франца Фердинанда (28.06.1914) → битва на Марне (сент. 1914) → первое применение химического оружия (апр. 1915) → Брусиловский прорыв (май—июнь 1916) → танки на Сомме (сент. 1916) → свержение царской власти (февр.—март 1917) → вступление США (апр. 1917) → приход к власти большевиков (окт. 1917) → Брестский мир (3 марта 1918).")}
${qa("Пон.", "Геноцид и его проявления до конца XIX в.", "Геноцид — действия с намерением уничтожить полностью или частично национальную, этническую, расовую или религиозную группу. Примеры из учебника: гибель жителей Карфагена (II в. до н. э.), массовые убийства в ходе Крестовых походов (XI—XV вв.), Индия конца XVIII в. (7 млн жертв), искусственный голод в Ирландии (XVI—XVII вв., середина XIX в.), уничтожение индейцев Америки (XVI—XIX вв.).")}
<div class="label">Ресурсы к главе</div>
${qa("Р1", "Тексты о настроениях: о каких странах речь? Что объединяло людей?", "А — <b>Австро-Венгрия</b> (ликование при разрыве с Сербией); Б — <b>Россия</b> (разгром германского посольства на Исаакиевской площади в Петрограде); В — <b>Франция</b> («На Берлин!», «Марсельеза»); Г — <b>Великобритания</b> (Трафальгарская площадь). Людей объединяли патриотический подъём, вера в быструю и лёгкую победу, ненависть к врагу — шовинистические настроения.")}
${qa("Р2", "Компьенское перемирие: как победители обезопасили себя? Почему условия разные?", "Германия должна была за 15 дней очистить занятые страны и Эльзас-Лотарингию, сдать 5 тыс. пушек, 25 тыс. пулемётов, 3 тыс. миномётов, 1700 самолётов, вывести войска с левого берега Рейна, содержать оккупационные войска и сразу вернуть пленных — то есть лишалась возможности возобновить войну. На Западе шли боевые действия с самими победителями, поэтому условия жёсткие и конкретные; на Востоке Германия должна была вернуть войска в свои границы и отказаться от Брестского и Бухарестского договоров — там победители не воевали напрямую, а Россия уже вышла из войны.")}
<div class="concl"><div class="cc-h">${I("check-circle", "ccic")}Ответ на главный вопрос § 2</div><p>Итоги: <b>поражение Четверного союза</b> и победа Антанты; около 9,5 млн погибших и 20 млн раненых; разрушенная экономика Европы и острый социальный кризис до 1923 г.; революции и крушение монархий в России и Германии. На итоги повлияли: <b>провал плана молниеносной войны</b> и война на два фронта (роль России в 1914—1916 гг.); <b>война на истощение</b>, выгодная Антанте с её колониями и флотом; <b>вступление США</b> с огромным экономическим потенциалом при выходе России из войны.</p></div>
</div>`;

const TESTP = `<div class="part kq">${phead("pq", I("target", "hic"), "Тренажёр к контрольной", "30 тестов + 4 задания на соотнесение; ключ — в конце", "target")}
${mcqHTML}
<div class="label">Задания на соотнесение</div>${matchHTML}
<div class="label">Напиши по памяти</div>
<div class="recall">${["Назови 5 причин Первой мировой войны.", "Объясни суть плана Шлиффена и причины его провала.", "Перечисли новое оружие и где его впервые применили.", "Назови 3 фактора победы Антанты.", "Расскажи о роли России в 1914 и 1916 гг."].map((x, i) => `<div><em>${i + 1}</em>${x}<i></i></div>`).join("")}</div>
<div class="keybox"><div class="kb-h">${I("check-circle", "nic")}Ключ к тренажёру</div><p><b>Тесты:</b> ${T_ANS}</p><p><b>Соотнесение:</b> ${matchKey}</p><p class="small">Ответы на задания «Напиши по памяти» — в опорных конспектах § 1 (п. 6) и § 2 (пп. 1, 3, 5, 7).</p></div>
</div>`;

const XCSS = `
.hero { background:linear-gradient(140deg,#1c1917 0%,#44403c 55%,#7c2d12 100%); color:#fff; border-radius:5mm; padding:9mm 9mm 7mm; margin-bottom:5mm; }
.h-top { font-family:Mont; font-weight:700; text-transform:uppercase; letter-spacing:.08em; font-size:9pt; opacity:.8; }
.hero h1 { font-family:Mont; font-size:30pt; margin:3mm 0 2mm; line-height:1.05; }
.h-sub { font-size:11pt; opacity:.92; max-width:150mm; }
.h-how { display:grid; grid-template-columns:repeat(4,1fr); gap:2.5mm; margin-top:5mm; }
.h-how > div { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2); border-radius:3mm; padding:2.5mm; font-size:9.2pt; }
.h-how b { display:block; font-family:Mont; font-size:14pt; color:#fdba74; }
.part.k2, .part.ka2 { break-before:auto; margin-top:5mm; }
.part.kx { --a:#9a3412; --a2:#fff1e6; } .part.kc { --a:#44403c; --a2:#f2f0ee; } .part.kt2 { --a:#0f766e; --a2:#e6f7f5; }
.part.k1 { --a:#9a3412; --a2:#fff1e6; } .part.k2 { --a:#3f6212; --a2:#f1f7e6; } .part.ka { --a:#9a3412; --a2:#fff1e6; } .part.ka2 { --a:#3f6212; --a2:#f1f7e6; } .part.kq { --a:#6d28d9; --a2:#f3edff; }
.phead.pc { background:linear-gradient(120deg,#292524,#57534e); } .phead.pt2 { background:linear-gradient(120deg,#115e59,#14b8a6); }
.phead.p1w, .phead.pa { background:linear-gradient(120deg,#7c2d12,#c2410c); } .phead.p2w, .phead.pa2 { background:linear-gradient(120deg,#365314,#65a30d); } .phead.pq { background:linear-gradient(120deg,#4c1d95,#7c3aed); }
.hic { width:9mm; height:9mm; }
.keys { display:grid; grid-template-columns:1fr 1fr; gap:2.4mm; }
.keys > div { display:grid; grid-template-columns:30mm 1fr; gap:3mm; align-items:center; background:var(--bg); border:1px solid var(--line); border-left:1.4mm solid var(--a); border-radius:3mm; padding:2.6mm 3mm; break-inside:avoid; }
.keys > div > b { font-family:Mont; font-weight:800; font-size:13.5pt; color:var(--a); } .keys span { font-size:9.8pt; } .keys span b { color:var(--ink); }
.legend-note { margin-top:4mm; font-size:9pt; color:var(--muted); }
.st { color:#c2410c; font-size:7.5pt; margin-left:.3mm; }
.cy { margin:0 0 3mm; break-inside:auto; }
.cy-h { display:inline-block; font-family:Mont; font-weight:800; font-size:11pt; color:#fff; background:var(--a); border-radius:2mm; padding:1mm 3.5mm; margin-bottom:1.5mm; break-after:avoid; }
.ct { width:100%; border-collapse:collapse; font-size:9.6pt; }
.ct td { padding:1.3mm 2mm; border-bottom:1px solid var(--line); vertical-align:top; } .ct tr { break-inside:avoid; }
.ct td:first-child { width:30mm; font-family:Mont; font-weight:700; color:#7c2d12; font-size:9pt; white-space:nowrap; }
.mnem, .why, .keybox { display:block; background:#fffbea; border:1px solid #f6e3a1; border-radius:3mm; padding:3mm; font-size:9.8pt; margin-top:3mm; break-inside:avoid; }
.mnem { display:grid; grid-template-columns:7mm 1fr; gap:2mm; }
.why { background:var(--a2); border-color:var(--line); } .why-h, .kb-h { display:flex; align-items:center; gap:2mm; font-family:Mont; font-weight:800; color:var(--a); margin-bottom:1mm; }
.why ol { margin:0; padding-left:5mm; } .why li { margin:.6mm 0; }
.fc { display:grid; grid-template-columns:1fr 1fr; gap:2mm; margin-bottom:3mm; }
.fc > div { display:grid; grid-template-columns:34mm 1fr; gap:2.5mm; border:1px solid var(--line); border-radius:2.5mm; padding:2mm 2.6mm; font-size:9.2pt; break-inside:avoid; background:#fff; }
.fc b { font-family:Mont; font-size:9.2pt; color:var(--a); } .fc span { border-left:1px dashed var(--line); padding-left:2.5mm; }
.pp { width:100%; border-collapse:collapse; font-size:9.4pt; } .pp tr { break-inside:avoid; }
.pp td { padding:1.5mm 2mm; border-bottom:1px solid var(--line); vertical-align:top; } .pp td:first-child { width:42mm; font-family:Mont; font-weight:700; color:var(--a); font-size:9.2pt; }
.tech { background:var(--a2); border-radius:2.5mm; padding:2.4mm; font-size:9.3pt; border:1px solid var(--line); } .tech b { display:block; font-family:Mont; font-weight:800; font-size:13pt; color:var(--a); }
.blocs { display:grid; grid-template-columns:1fr 12mm 1fr; align-items:center; gap:2mm; margin-bottom:3mm; break-inside:avoid; }
.bl { border-radius:3mm; padding:3mm; color:#fff; text-align:center; } .bl b { display:block; font-family:Mont; font-size:12pt; } .bl span { font-size:9.6pt; }
.bl.ent { background:#1d4ed8; } .bl.tri { background:#57534e; } .vs { text-align:center; font-family:Mont; font-weight:800; color:var(--muted); }
.years { display:grid; gap:2.6mm; }
.yr { display:grid; grid-template-columns:16mm 1fr; gap:0 3mm; border:1px solid var(--line); border-radius:3mm; padding:2.6mm; break-inside:avoid; background:#fff; }
.yr-h { grid-row:span 2; font-family:Mont; font-weight:800; font-size:14pt; color:#fff; background:var(--a); border-radius:2.5mm; display:grid; place-items:center; }
.yr .ticks { font-size:9.4pt; display:grid; grid-template-columns:1fr 1fr; gap:0 4mm; } .yr .ticks li { margin:.6mm 0; }
.yr-r { font-size:9.3pt; background:var(--a2); border-radius:2mm; padding:1.4mm 2.4mm; margin-top:1.2mm; }
.chart { border:1px solid var(--line); border-radius:3mm; padding:3mm 3.5mm; break-inside:avoid; }
.ch-t { font-family:Mont; font-weight:700; font-size:10pt; margin-bottom:2mm; }
.hb { display:grid; grid-template-columns:38mm 1fr 14mm; align-items:center; gap:2mm; font-size:9.4pt; margin:1.1mm 0; }
.hb i { display:block; height:4.2mm; background:#4d7c0f; border-radius:0 1mm 1mm 0; }
.hb em { font-style:normal; font-weight:700; color:var(--ink); text-align:right; }
.ch-s { font-size:8.4pt; color:var(--muted); margin-top:1.5mm; }
.land { page:land; break-before:page; }
@page land { size:A4 landscape; margin:9mm 10mm 12mm; }
.mapfull { text-align:center; } .mapfull img { width:100%; max-height:172mm; object-fit:contain; border:1px solid var(--line); border-radius:2mm; }
.mapfull .cap { font-size:9pt; color:var(--muted); margin-top:1.5mm; }
.qa { border:1px solid var(--line); border-radius:3mm; margin:0 0 2.2mm; break-inside:avoid; overflow:hidden; }
.qa-q { display:grid; grid-template-columns:10mm 1fr; gap:2mm; align-items:start; background:var(--a2); padding:1.8mm 2.6mm; font-family:Mont; font-weight:700; font-size:9.6pt; line-height:1.3; }
.qa-q span { color:var(--a); font-weight:800; }
.qa-a { padding:2mm 2.8mm 2.2mm 14.6mm; font-size:9.8pt; }
.mini-t { margin:1mm 0 0; } .mini-t td:first-child { width:36mm; }
.mcq { display:grid; grid-template-columns:1fr 1fr; gap:2.2mm 3mm; margin-bottom:3mm; }
.mq { border:1px solid var(--line); border-radius:2.5mm; padding:2mm 2.4mm; font-size:9.3pt; break-inside:avoid; }
.mq > b { color:var(--a); font-family:Mont; }
.opts { display:grid; grid-template-columns:1fr 1fr; gap:.6mm 2mm; margin-top:1.2mm; }
.opts span { display:flex; gap:1.4mm; font-size:9pt; } .opts em { font-style:normal; font-weight:700; color:var(--a); }
.match { border:1px solid var(--line); border-radius:3mm; padding:2.4mm 3mm; margin-bottom:2.2mm; break-inside:avoid; }
.m-h { font-family:Mont; font-weight:700; font-size:9.6pt; margin-bottom:1.4mm; }
.m-g { display:grid; grid-template-columns:1fr 1fr; gap:4mm; font-size:9.3pt; } .m-g > div > div { display:flex; gap:2mm; margin:.6mm 0; }
.m-g em { font-style:normal; font-weight:800; color:var(--a); min-width:3.5mm; }
.recall { display:grid; gap:1.6mm; margin-bottom:3mm; }
.recall > div { display:grid; grid-template-columns:6mm 1fr; gap:2mm; font-size:9.6pt; break-inside:avoid; } .recall em { font-style:normal; font-weight:800; color:var(--a); }
.recall i { grid-column:2; height:9mm; border-bottom:1px dashed #c9cfdb; }
.keybox { background:#f3edff; border-color:#d9c8ff; } .keybox p { margin:1mm 0; }
`;

const GHTML = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Первая мировая война — подготовка к контрольной</title><style>${CSS}${KCSS}${XCSS}</style></head><body>
${COVERP}${CHRONOP}${TERMSP}${P1P}${P2P}${MAPSP}${A1}${A2}${TESTP}
</body></html>`;

(async () => {
  const out = process.argv[2] || path.join(__dirname, "guide.pdf");
  fs.writeFileSync(path.join(__dirname, "guide.html"), GHTML);
  const br = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const pg = await br.newPage();
  await pg.setContent(GHTML, { waitUntil: "load" });
  await pg.evaluate(() => document.fonts.ready);
  await pg.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true, headerTemplate: "<span></span>",
    footerTemplate: `<div style="width:100%;font-size:8px;color:#8a93a6;padding:0 13mm;display:flex;justify-content:space-between;font-family:sans-serif"><span>Первая мировая война · подготовка к контрольной</span><span class="pageNumber"></span></div>` });
  await br.close();
  console.log("ok", out);
})();
