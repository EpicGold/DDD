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

// ---- konspekt content (appended after shared helpers + CSS from answers/build.js) ----
const MAP = fs.readFileSync(path.join(__dirname, "map_europe.jpg")).toString("base64");
const sec = (n, title, body) => `<section class="ksec"><div class="ks-h"><span class="ks-n">${n}</span><h2>${title}</h2></div>${body}</section>`;
const terms = (arr) => `<div class="terms">${arr.map(([t, d]) => `<div><b>${t}</b><span>${d}</span></div>`).join("")}</div>`;
const tl = (world, rus) => `<div class="tl"><div class="tl-col"><div class="tl-h">${I("globe", "tlic")}Мир</div>${world.map(([d, t]) => `<div class="tl-i"><em>${d}</em><span>${t}</span></div>`).join("")}</div>
  <div class="tl-col ru"><div class="tl-h">${I("flag", "tlic")}Россия</div>${rus.map(([d, t]) => `<div class="tl-i"><em>${d}</em><span>${t}</span></div>`).join("")}</div></div>`;
const mainq = (q) => `<div class="mainq">${I("search", "mqic")}<div><small>Главный вопрос параграфа</small><b>${q}</b></div></div>`;
const bullets = (arr) => `<ul class="ticks">${arr.map((x) => `<li>${x}</li>`).join("")}</ul>`;
const chain = (arr) => `<div class="chain">${arr.map((x, i) => `<div class="ch-i">${x}</div>${i < arr.length - 1 ? '<div class="ch-a">→</div>' : ""}`).join("")}</div>`;
const conclusion = (title, body) => `<div class="concl"><div class="cc-h">${I("check-circle", "ccic")}${title}</div>${body}</div>`;

const K3 = `
<header class="phead p3k"><div class="pnum">§ 3</div><div><div class="ptitle">Распад империй и образование новых национальных государств в Европе</div><div class="psub">Глава II. Мир в 1918—1938 гг. · конспект</div></div>${I("castle", "pic")}</header>
${mainq("Какие факторы повлияли на распад империй после Первой мировой войны?")}
<div class="row2 top">
  <div>${terms([["Оппортунизм", "отказ от поставленных целей и приспособление к существующим общественным условиям; политика компромиссов и соглашений."], ["Этатизм", "идеология, абсолютизирующая ценность государства и его роль в жизни общества."]])}</div>
  ${tl([["1918", "революция в Германии"], ["1918—1923", "Кемалистская революция в Турции"], ["1919", "Веймарская конституция"], ["март—авг. 1919", "Венгерская советская республика"], ["март 1919", "создание Коминтерна"]],
       [["янв. 1918", "создание РККА"], ["июль 1918", "первая советская Конституция"], ["1919—1921", "польско-советская война"], ["30 дек. 1922", "образование СССР"]])}
</div>

${sec(1, "Образование новых национальных государств", `
  <p>Итог войны — распад <b>четырёх империй</b>: Российской, Германской, Австро-Венгерской и Османской.</p>
  <table class="kt"><thead><tr><th>Империя</th><th>Что возникло</th><th>Как это происходило</th></tr></thead><tbody>
    <tr><td><b>Российская</b></td><td>Финляндия, Польша, Эстония, Латвия, Литва</td><td>Правительство Ленина по праву наций на самоопределение признало независимость Финляндии, Польши, Украины, Прибалтики и Закавказья, рассчитывая привести там к власти коммунистов. Удалось только в <b>Закавказье</b>. В Финляндии левых разгромили Белая армия <b>К. Маннергейма</b> и германские интервенты; в Прибалтике сторонников советской власти подавили с помощью германских и белогвардейских отрядов.</td></tr>
    <tr><td><b>Австро-Венгерская</b></td><td>Австрия, Венгрия, Чехословакия, Королевство сербов, хорватов и словенцев (с 1929 г. — <b>Югославия</b>)</td><td>Октябрь 1918 г. — демократическая революция. В Вене власть у социал-демократов, в столицах провинций национальные партии провозгласили независимость. Австрия — небольшая германоязычная республика; южные славяне объединились с Сербией и Черногорией.</td></tr>
    <tr><td><b>Германская</b></td><td>Веймарская республика</td><td>Ноябрьская революция 1918 г. (см. п. 2); часть земель отошла Польше (см. § 4).</td></tr>
    <tr><td><b>Османская</b></td><td>Турецкая республика</td><td>Кемалистская революция 1918—1923 гг. (см. п. 5).</td></tr>
  </tbody></table>
  ${note("<b>Польско-советская война 1919—1921 гг.:</b> Польша пыталась включить в свой состав Советскую Украину; в 1920 г. советские войска выбили поляков из Киева, но потерпели поражение под Варшавой. Польша оккупировала <b>Западную Украину и Западную Белоруссию</b>.", "swords")}`)}

${sec(2, "Ноябрьская революция в Германии. Веймарская республика", `
  ${chain(["<b>Ноябрь 1918</b><br>восстание моряков в Киле против приказа бросить флот в бой", "Вильгельм II бежит, рейхстаг провозглашает <b>республику</b>", "Создаются <b>Советы</b>; власть — Совету народных уполномоченных во главе с <b>Ф. Эбертом</b>", "Свобода профсоюзов и забастовок, <b>8-часовой рабочий день</b>"])}
  <div class="row2">
    <div class="mini"><b>Социал-демократы (большинство)</b><br>предпосылок для социализма ещё нет — сохранить капиталистическую экономику; судьбу страны решит Учредительное собрание.</div>
    <div class="mini"><b>«Союз Спартака»</b> (К. Либкнехт, Р. Люксембург)<br>за советскую власть и социалистическую революцию; в декабре 1918 г. создали <b>КПГ</b>. Январь 1919 г. — бои в Берлине, поражение; Либкнехт и Люксембург убиты офицерами.</div>
  </div>
  <div class="box">
    <div class="box-h">${I("scroll-text", "bxic")}Веймарская конституция (1919) — президент <b>Ф. Эберт</b></div>
    <div class="grid4 cons">
      <div><b>Федерация</b><p>широкие права отдельных земель</p></div>
      <div><b>Канцлер</b><p>назначается президентом; правительство нуждается в одобрении рейхстага</p></div>
      <div><b>Равновесие властей</b><p>при конфликте президента и парламента — риск паралича управления</p></div>
      <div><b>Свободы</b><p>слова, собраний, забастовок — но президент мог их приостановить при угрозе «общественной безопасности»</p></div>
    </div>
  </div>
  <div class="row2">
    <div class="mini left"><b>Угроза слева — коммунисты</b><ul><li>март 1919 — восстание, гражданская война;</li><li>май 1919 — пала последняя советская республика (Бавария);</li><li>1921, 1923 — новые попытки;</li><li>октябрь 1923 — подавлено восстание в Гамбурге (<b>Э. Тельман</b>).</li></ul></div>
    <div class="mini right"><b>Угроза справа — сторонники старых порядков</b><ul><li>весна 1920 — <b>«Капповский путч»</b>: дивизия реакционных добровольцев вошла в Берлин;</li><li>мятеж подавлен <b>всеобщей забастовкой</b> жителей.</li></ul></div>
  </div>
  ${note("<b>Почему коммунисты не пришли к власти:</b> у КПГ не было авторитетных лидеров; социал-демократы были популярнее, объединились с консерваторами, привлекли опытных офицеров; добровольческие отряды подавили очаги восстаний.", "lightbulb")}`)}

${sec(3, "Советская власть в Венгрии (март — август 1919 г.)", `
  ${chain(["Условия мира: Венгрия теряет славянские территории и <b>Трансильванию</b>", "Правительство уступает власть левым социал-демократам", "Провозглашена <b>Венгерская советская республика</b> (лидер — Бела Кун)"])}
  <div class="row2">
    <div class="mini"><b>Меры советской власти</b><ul><li>8-часовой рабочий день;</li><li>страхование трудящихся, бесплатное образование;</li><li>фабрики и банки переданы государству.</li></ul></div>
    <div class="mini"><b>Война</b><ul><li>ВСР не признала новые государства → конфликт с Чехословакией, Румынией;</li><li>апрель 1919 — их армии вторглись при поддержке Антанты;</li><li>Венгерская Красная армия вошла в Словакию → <b>Словацкая советская республика</b>.</li></ul></div>
  </div>
  ${note("<b>Падение ВСР (август 1919):</b> надежду соединиться с Красной Армией Советской России сорвало наступление <b>А. Деникина</b>; под натиском внешних и внутренних врагов республика пала. Власть — у лидера контрреволюции <b>М. Хорти</b>, мир с Антантой на невыгодных условиях.", "alert-triangle")}`)}

${sec(4, "Революционное движение и образование Коминтерна", `
  ${bullets(["1917—1923 гг. — революционные события во многих странах; антиимпериалистические выступления в <b>Индии, Китае, Афганистане, Египте, Корее</b>.", "1920 г., Италия — всеобщая стачка и захват предприятий рабочими; движение плохо организовано, социал-демократы не поддержали — предприятия вернули владельцам.", "II Интернационал распался с началом войны → социалистическое движение раскололось на два течения."])}
  <table class="kt cmp"><thead><tr><th></th><th>Коминтерн (III Интернационал)</th><th>Социнтерн (II Интернационал)</th></tr></thead><tbody>
    <tr><td><b>Создание</b></td><td>1919 г., Москва, делегаты из 21 страны; к 1925 г. — 49 компартий</td><td>воссоздан социал-демократами в 1920 г.</td></tr>
    <tr><td><b>Цель</b></td><td>подготовка и осуществление революций во всех странах</td><td>улучшение положения рабочих реформами, участие в правительствах</td></tr>
    <tr><td><b>Итоги</b></td><td>«экспорт революции» без поддержки населения, восстания терпели поражения; победа только в <b>Монголии</b> (1921)</td><td>за социалистов голосовало большинство рабочих Западной Европы; наибольший успех — <b>Швеция</b> (у власти с 1920 г.)</td></tr>
  </tbody></table>
  <p class="small">Коммунисты обвиняли социалистов в <b>оппортунизме</b> (приспособленчестве). Ответом Запада на Коминтерн стал «санитарный кордон» вокруг Советского государства; Коминтерн распущен в 1943 г.</p>`)}

${sec(5, "Образование Турецкой республики", `
  <div class="steps-v">
    <div><em>после войны</em>Армия разбита, территория оккупирована Антантой: юг — Великобритании и Франции, восток Малой Азии — курдам и Армении, запад — Греции. Турки начинают партизанскую войну, лидер — генерал <b>Мустафа Кемаль</b>.</div>
    <div><em>1920</em>Парламент провозгласил Декларацию независимости — разогнан Антантой. Султан подписал <b>Севрский договор</b>; Великое национальное собрание в <b>Анкаре</b> объявило себя единственной властью и договор не признало.</div>
    <div><em>1921</em>Под Анкарой разбита наступавшая греческая армия; военную помощь кемалистам оказала <b>Советская Россия</b>.</div>
    <div><em>1923</em><b>Лозаннский договор</b>: вся Малая Азия (вместе с Западной Арменией и побережьем Анатолии) — Турции. Провозглашена <b>Турецкая республика</b>, Кемаль — президент. В 1934 г. получил фамилию <b>Ататюрк</b> — «отец турок».</div>
  </div>
  <div class="label">Реформы Ататюрка — модернизация сверху</div>
  <div class="grid3">
    ${tile("crown", "Диктатура", "разгромлены демократические и коммунистические организации")}
    ${tile("landmark", "Секуляризация", "изъяты земли мусульманского духовенства; исламские нормы права заменены европейскими")}
    ${tile("shirt", "Европеизация быта", "латиница вместо арабского алфавита, европейская одежда («закон о шляпах», 1925)")}
    ${tile("factory", "Этатизм", "активная роль государства в экономике")}
    ${tile("users", "Права женщин", "запрет многожёнства, избирательные права женщинам")}
    ${tile("graduation-cap", "Светское образование", "создана система светских школ")}
  </div>`)}

${conclusion("Ответ на главный вопрос", `
  <p>Империи распались под действием нескольких факторов:</p>
  ${bullets(["<b>Военное поражение и разорение</b> — Германия, Австро-Венгрия и Османская империя проиграли войну, их армии были разбиты, территории оккупированы.", "<b>Революции</b> — 1917 г. в России, октябрь 1918 г. в Австро-Венгрии, ноябрь 1918 г. в Германии, кемалистская революция в Турции.", "<b>Национальные движения и право наций на самоопределение</b> — его провозгласили большевики и страны Антанты; народы империй создавали свои государства.", "<b>Решения победителей</b> — Антанта перекраивала границы и делила владения побеждённых."])}
  <p class="small"><b>Итог по учебнику:</b> в Европе и Азии появился ряд новых государств; усилились революционное движение в Европе и национально-освободительное движение в колониях и зависимых странах.</p>`)}
`;

const K4 = `
<header class="phead p4k"><div class="pnum">§ 4</div><div><div class="ptitle">Версальско-Вашингтонская система международных отношений</div><div class="psub">Глава II. Мир в 1918—1938 гг. · конспект</div></div>${I("handshake", "pic")}</header>
${mainq("Какое влияние на развитие международных отношений оказали Версальский договор и Вашингтонские соглашения?")}
${terms([["Аннексия", "насильственное присоединение одним государством всей или части территории другого государства."], ["Контрибуция", "платежи, налагаемые на побеждённое государство в пользу государства-победителя."], ["Репарации", "в международном праве — возмещение государством причинённого им ущерба в денежной или иной форме."], ["Подмандатные территории", "бывшие колонии Германии и большая часть владений Османской империи, переданные Лигой Наций в управление победителям на основе мандата."], ["Доминион", "государство в составе Британской империи, признававшее главой английского короля."]])}
${tl([["янв. 1918", "«14 пунктов» В. Вильсона"], ["28 июня 1919", "подписание Версальского договора"], ["1919", "учреждение Лиги Наций"], ["апр. 1922", "Рапалльский договор"], ["1922", "Вашингтонское соглашение"], ["1924", "«полоса признаний» СССР"]],
     [["окт. 1917", "Декрет о мире"], ["нояб. 1917", "Декларация прав народов России"], ["нояб. 1918", "аннулирование Брестского мира"], ["1920", "мирные договоры с Литвой, Латвией, Эстонией"], ["1921", "Рижский мир с Польшей"]])}

${sec(1, "Планы послевоенного устройства мира", `
  <div class="grid3 plans">
    <div><div class="pl-h">${I("flag", "plic")}Советская Россия</div><small>Декрет о мире, октябрь 1917 г.</small><p>«Демократический мир» <b>без аннексий и контрибуций</b> — отказ от захвата чужих земель и взимания контрибуций.</p></div>
    <div><div class="pl-h">${I("shield-check", "plic")}Антанта</div><small>заявление стран Антанты</small><p>Границы Европы — <b>по национальному принципу</b>; Эльзас и Лотарингия — Франции; отнять у Германии колонии; компенсация за разрушения во Франции и Бельгии.</p></div>
    <div><div class="pl-h">${I("scroll-text", "plic")}США</div><small>«14 пунктов» В. Вильсона, январь 1918 г.</small><p>Свобода торговли и судоходства, сокращение вооружений, границы по национальному принципу, <b>самоопределение народов</b>, независимая Польша, <b>союз наций</b>.</p></div>
  </div>
  <p class="small"><b>Общее у планов:</b> изменение границ с учётом национального принципа и права народов на самоопределение. Условия перемирия (Германия оставила оккупированные земли, сдала тяжёлое вооружение, передала пленных) уже выполнили часть требований Антанты.</p>`)}

${sec(2, "Парижская (Версальская) мирная конференция (январь 1919 г.)", `
  ${bullets(["Участники — страны Антанты; <b>побеждённых не пригласили</b> — они должны были подчиниться решениям победителей.", "<b>Россию не допустили</b> «из-за отсутствия легитимного правительства» (не позвали и «белые правительства»); в 1918—1922 гг. Антанта вела интервенцию в России, но она провалилась."])}
  <div class="label">Позиции «Большой тройки»</div>
  <div class="grid3 big3">
    <div><b>Ж. Клемансо</b><small>Франция</small><p>Самый жёсткий курс: Франция разорена, Советская Россия отказалась платить царские долги → нужна <b>контрибуция с Германии</b>; страх перед немецкой военной мощью → <b>максимальное разоружение</b> Германии.</p></div>
    <div><b>Д. Ллойд Джордж</b><small>Великобритания</small><p>Умереннее: Британия пострадала меньше; Германия должна остаться <b>противовесом Франции</b>. За самоопределение в Европе — но не для своих колоний.</p></div>
    <div><b>В. Вильсон</b><small>США</small><p>Требовал соблюдать <b>принцип самоопределения народов</b>, выступал за создание <b>Лиги Наций</b> для мирного решения споров.</p></div>
  </div>
  ${note("<b>Символизм:</b> договор подписан <b>28 июня 1919 г.</b> — ровно через пять лет после убийства в Сараеве, ставшего поводом к войне, — и в Версальском дворце, где в 1871 г. была провозглашена Германская империя. Надежды союзников — арабского принца Фейсала (единое арабское государство) и Китая (возврат территорий) — не оправдались.", "landmark")}`)}

${sec(3, "Версальская система", `
  <div class="stats">
    <div><b>132</b><span>млрд золотых марок репараций; более половины — Франции</span></div>
    <div><b>100 тыс.</b><span>предельная численность германской армии</span></div>
    <div><b>0</b><span>военно-морского флота, танков, авиации и подводных лодок</span></div>
  </div>
  <div class="mapwrap"><img src="data:image/jpeg;base64,${MAP}"><div class="cap">Территориальные изменения в Европе в 1918—1923 гг. (карта из учебника, с. 61)</div></div>
  <div class="row2">
    <div class="mini"><b>Германия теряет</b><ul><li><b>Эльзас и Лотарингию</b> — Франции;</li><li>небольшие территории — Бельгии и Дании;</li><li>часть земель — <b>Польше</b>, получившей выход к Балтийскому морю;</li><li>все колонии — Великобритании (и доминионам), Франции, Бельгии, Японии как <b>подмандатные территории</b>; владение в Китае — Японии (Китай договор не подписал).</li></ul></div>
    <div class="mini"><b>Договоры с союзниками Германии (1919—1923)</b><ul><li><b>Австрия</b> уступила часть земель Италии; притязания Рима на Истрию столкнулись с претензиями Королевства СХС;</li><li><b>Болгария</b> уступила Греции выход к Эгейскому морю;</li><li>передел породил множество взаимных <b>территориальных претензий</b>.</li></ul></div>
  </div>
  <div class="label">Судьба репараций</div>
  ${chain(["<b>1923—1924</b><br>Германия фактически прекращает выплаты; Франция оккупирует Рур (1923)", "<b>План Дауэса</b>, Лондон, 1924<br>международный заём для выплат", "<b>План Юнга</b>, Гаага, 1929—1930<br>снижение платежей", "<b>1931</b><br>выплаты фактически прекращены"])}
  <div class="row2">
    <div class="mini"><b>Лига Наций (1919)</b><br>Устав: отказ от войны и наказание агрессора. Ежегодно — Ассамблея, постоянно — Совет Лиги.</div>
    <div class="mini right"><b>Слабости Лиги</b><br>колониальные народы не приняты; по сути защищала интересы <b>Великобритании и Франции</b>; <b>США не вошли</b> (доктрина Монро — невмешательство в дела Европы).</div>
  </div>`)}

${sec(4, "Рапалльское соглашение и признание СССР", `
  ${chain(["<b>Генуэзская конференция, 1922</b><br>Запад требует оплатить долги царского и Временного правительств", "Делегация <b>Г. Чичерина</b> выдвигает встречные претензии — возместить ущерб от интервенции", "<b>Рапалльский договор</b> с Германией: восстановлены дипотношения, отказ от взаимных претензий, взаимовыгодная торговля", "<b>1924—1933</b> — СССР признали все ведущие страны Запада; последними — <b>США</b> (1933)"])}
  <p class="small">Вне Версальской системы остались Россия и Тихоокеанский регион. Германия и Советская Россия обе стремились <b>выйти из международной изоляции</b> — поэтому Германия первой из крупных держав признала Советскую Россию. Рапалльский договор прорвал кольцо дипломатической блокады.</p>`)}

${sec(5, "Вашингтонская конференция (1921—1922 гг.)", `
  <p>Цель — урегулировать отношения на <b>Дальнем Востоке и в бассейне Тихого океана</b>. Впервые в истории обсуждалось <b>ограничение морских вооружений</b>: по соглашению 1922 г. ограничены число, размеры и вооружение линкоров, авианосцев и тяжёлых крейсеров.</p>
  <div class="bars">
    <div><span>США</span><i style="width:100%"></i><em>5</em></div>
    <div><span>Великобритания</span><i style="width:100%"></i><em>5</em></div>
    <div><span>Япония</span><i style="width:60%"></i><em>3</em></div>
    <div><span>Франция</span><i style="width:35%"></i><em>1,75</em></div>
    <div><span>Италия</span><i style="width:35%"></i><em>1,75</em></div>
  </div>
  <p class="small">Соотношение тоннажа линейных флотов по договору 1922 г. США и Великобритания официально закрепили своё <b>военно-морское превосходство</b>.</p>
  ${note("<b>Япония</b> вернула Китаю бывшие германские владения, но отказалась вывести войска из Южной Маньчжурии; получила германские острова в Тихом океане. Посчитав приобретения недостаточными, стала готовиться к <b>новой войне за передел мира</b>.", "anchor")}`)}

${sec(6, "Изменение Версальско-Вашингтонской системы", `
  <div class="label">Кто был недоволен системой</div>
  <div class="grid3 unhappy">
    <div><b>Германия</b><p>унижена и разорена → условия для прихода к власти сторонников <b>реванша</b></p></div>
    <div><b>Австрия, Венгрия, Болгария</b><p>проигравшие страны сближались с Германией</p></div>
    <div><b>Италия и Япония</b><p>победители, считавшие себя обделёнными</p></div>
    <div><b>Новые государства</b><p>границы не устоялись, планы передела Восточной Европы</p></div>
    <div><b>Советская Россия / СССР</b><p>система создавалась без учёта её интересов — не признавали</p></div>
    <div><b>Колониальные народы</b><p>самоопределение на них не распространялось; подмандатные территории не отличались от колоний</p></div>
  </div>
  <div class="box">
    <div class="box-h">${I("file-signature", "bxic")}Пакт Бриана — Келлога (27 августа 1928 г., Париж)</div>
    ${bullets(["инициатива министра иностранных дел Франции <b>А. Бриана</b>, расширенная госсекретарём США <b>Ф. Келлогом</b>;", "15 государств обязались решать споры <b>невоенными средствами</b>, отказ от войны как средства политики; СССР присоединился в сентябре 1928 г.;", "мог стать шагом к системе коллективной безопасности, но вопрос о всеобщем разоружении остался нерешённым."])}
  </div>`)}

${conclusion("Ответ на главный вопрос", `
  <p>Версальский договор и Вашингтонские соглашения создали <b>Версальско-Вашингтонскую систему</b> — новый порядок, подведший итоги Первой мировой войны, но <b>недолговечный</b>:</p>
  ${bullets(["<b>Новые границы и государства</b> в Европе, мандатная система вместо германских колоний, Лига Наций как первый опыт международной организации для мирного решения споров.", "<b>Учтены прежде всего интересы победителей</b> — Великобритании, Франции, США: репарации в 132 млрд марок и разоружение Германии, закреплённое морское превосходство США и Британии.", "<b>Недовольство многих стран</b> — Германии и её союзников, Италии, Японии, СССР, колониальных народов — породило стремление к реваншу и переделу мира и предопределило крушение системы."])}`)}
`;

const KCSS = `
.k-title { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #1d2433; padding-bottom:3mm; margin-bottom:5mm; }
.k-title h1 { font-family:Mont; font-size:22pt; margin:0; line-height:1.05; } .k-title div { font-size:9.5pt; color:var(--muted); text-align:right; }
.phead.p3k { background:linear-gradient(120deg,#7f1d1d,#b91c1c); } .phead.p4k { background:linear-gradient(120deg,#1e3a8a,#2563eb); }
.part.k3 { --a:#b91c1c; --a2:#fdeeee; } .part.k4 { --a:#1d4ed8; --a2:#eaf0ff; }
.mainq { display:grid; grid-template-columns:10mm 1fr; gap:3mm; align-items:center; border:1.2mm solid var(--a); border-radius:4mm; padding:3mm 4mm; margin:0 0 4mm; background:var(--a2); }
.mainq small { display:block; font-family:Mont; font-weight:700; text-transform:uppercase; letter-spacing:.05em; font-size:8.4pt; color:var(--a); } .mainq b { font-size:11.6pt; }
.mqic { width:9mm; height:9mm; color:var(--a); }
.row2.top { grid-template-columns:1fr 1.25fr; align-items:start; }
.terms { display:grid; gap:2mm; margin:0 0 3.5mm; }
.terms > div { background:var(--bg); border:1px solid var(--line); border-left:1.2mm solid var(--a); border-radius:2.5mm; padding:2mm 3mm; font-size:9.8pt; }
.terms b { font-family:Mont; color:var(--a); font-size:9.8pt; } .terms b::after { content:" — "; color:var(--ink); font-family:PTS; font-weight:400; }
.part.k4 .terms { grid-template-columns:1fr 1fr; } .part.k4 .terms > div:last-child { grid-column:span 2; }
.tl { display:grid; grid-template-columns:1fr 1fr; gap:2.5mm; margin:0 0 4mm; break-inside:avoid; }
.tl-col { border:1px solid var(--line); border-radius:3mm; padding:2.4mm 3mm; background:#fff; }
.tl-col.ru { background:var(--a2); }
.tl-h { display:flex; align-items:center; gap:1.6mm; font-family:Mont; font-weight:800; font-size:9.4pt; color:var(--a); margin-bottom:1.6mm; text-transform:uppercase; letter-spacing:.05em; }
.tlic { width:5mm; height:5mm; }
.tl-i { display:grid; grid-template-columns:24mm 1fr; gap:2mm; font-size:9.3pt; padding:.9mm 0; border-top:1px dashed var(--line); }
.tl-i em { font-style:normal; font-weight:700; color:var(--a); }
.ksec { margin:0 0 4.5mm; }
.ks-h { display:grid; grid-template-columns:9mm 1fr; gap:3mm; align-items:center; border-bottom:1.5px solid var(--a); padding-bottom:1.6mm; margin-bottom:3mm; break-after:avoid; }
.ks-n { width:9mm; height:9mm; border-radius:2.5mm; background:var(--a); color:#fff; display:grid; place-items:center; font-family:Mont; font-weight:800; }
.ks-h h2 { margin:0; font-family:Mont; font-size:12.4pt; line-height:1.2; }
.ksec > p { margin:0 0 2.5mm; }
.kt { width:100%; border-collapse:separate; border-spacing:0; font-size:9.5pt; border:1px solid var(--line); border-radius:3mm; overflow:hidden; margin:0 0 3mm; }
.kt th { background:var(--a); color:#fff; font-family:Mont; font-size:8.8pt; text-align:left; padding:2mm 2.6mm; }
.kt td { padding:2mm 2.6mm; border-top:1px solid var(--line); vertical-align:top; } .kt tr:nth-child(even) td { background:#fafbfd; }
.kt td:first-child { width:24mm; } .kt td:nth-child(2) { width:44mm; }
.kt.cmp td:first-child { width:20mm; } .kt.cmp td:nth-child(2) { width:auto; }
.chain { display:flex; align-items:stretch; gap:1.4mm; margin:0 0 3mm; break-inside:avoid; }
.ch-i { flex:1; background:var(--a2); border:1px solid var(--line); border-radius:2.5mm; padding:2.2mm 2.6mm; font-size:9.2pt; line-height:1.28; }
.ch-a { display:grid; place-items:center; color:var(--a); font-weight:800; font-size:13pt; }
.box { border:1.4px solid var(--a); border-radius:3.5mm; padding:3mm; margin:0 0 3mm; break-inside:avoid; }
.box-h { display:flex; align-items:center; gap:2mm; font-family:Mont; font-weight:700; font-size:10.4pt; margin-bottom:2.4mm; } .box-h b { color:var(--a); }
.bxic { width:6mm; height:6mm; color:var(--a); }
.cons { margin:0; } .cons > div { background:var(--bg); border-radius:2.5mm; padding:2.2mm; font-size:9.2pt; border:1px solid var(--line); }
.cons b { font-family:Mont; font-size:9.3pt; color:var(--a); } .cons p { margin:.6mm 0 0; }
.mini.left { border-left:1.2mm solid #b91c1c; } .mini.right { border-left:1.2mm solid #475569; }
.steps-v { border-left:1.4mm solid var(--a); margin:0 0 3mm 2mm; padding-left:4mm; display:grid; gap:2.2mm; }
.steps-v > div { position:relative; font-size:9.7pt; break-inside:avoid; }
.steps-v > div::before { content:""; position:absolute; left:-6.6mm; top:1mm; width:3.4mm; height:3.4mm; border-radius:50%; background:#fff; border:1mm solid var(--a); }
.steps-v em { display:block; font-style:normal; font-family:Mont; font-weight:800; color:var(--a); font-size:9.4pt; }
.concl { background:linear-gradient(135deg,var(--a2),#fff); border:1.4mm solid var(--a); border-radius:4.5mm; padding:4mm 4.5mm; margin-top:2mm; break-inside:avoid; }
.cc-h { display:flex; align-items:center; gap:2mm; font-family:Mont; font-weight:800; font-size:12pt; color:var(--a); margin-bottom:2mm; }
.ccic { width:7mm; height:7mm; } .concl p { margin:1.4mm 0; }
.plans > div, .big3 > div, .unhappy > div { background:var(--bg); border:1px solid var(--line); border-top:1.2mm solid var(--a); border-radius:3mm; padding:2.6mm; font-size:9.3pt; }
.pl-h { display:flex; align-items:center; gap:1.6mm; font-family:Mont; font-weight:800; font-size:10pt; color:var(--a); }
.plic { width:5.5mm; height:5.5mm; }
.plans small, .big3 small { display:block; color:var(--muted); font-size:8.6pt; margin:.4mm 0 1.2mm; }
.plans p, .big3 p, .unhappy p { margin:0; }
.big3 b, .unhappy b { font-family:Mont; font-size:10pt; } .unhappy b { color:var(--a); font-size:9.6pt; } .unhappy p { margin-top:.6mm; color:#384157; }
.stats { display:grid; grid-template-columns:repeat(3,1fr); gap:2.6mm; margin:0 0 3mm; }
.stats > div { background:var(--a); color:#fff; border-radius:3mm; padding:3mm; }
.stats b { display:block; font-family:Mont; font-weight:800; font-size:20pt; line-height:1; } .stats span { font-size:9.2pt; opacity:.95; }
.mapwrap { border:1px solid var(--line); border-radius:3.5mm; overflow:hidden; margin:0 0 3mm; break-inside:avoid; }
.mapwrap { text-align:center; background:#fff; } .mapwrap img { display:inline-block; width:auto; max-width:100%; height:188mm; }
.ksec .row2, .ksec .grid3, .ksec .grid4, .ksec .mini, .ksec .note, .ksec table, .ksec tr, .stats, .terms > div, .plans, .big3, .unhappy, .tl-col { break-inside:avoid; }
.label { break-after:avoid; }
.mapwrap .cap { background:var(--bg); font-size:8.8pt; color:var(--muted); padding:1.6mm 3mm; border-top:1px solid var(--line); }
.bars { display:grid; gap:1.6mm; margin:0 0 2mm; break-inside:avoid; }
.bars > div { display:grid; grid-template-columns:30mm 1fr 10mm; align-items:center; gap:2mm; font-size:9.6pt; }
.bars i { height:5mm; border-radius:1.5mm; background:linear-gradient(90deg,var(--a),#60a5fa); }
.bars em { font-style:normal; font-family:Mont; font-weight:800; color:var(--a); }
`;

const KHTML = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Конспекты § 3—4. Всеобщая история 1914—1945</title><style>${CSS}${KCSS}</style></head><body>
<div class="k-title"><h1>Конспекты § 3—4</h1><div>Всеобщая история. 1914—1945 гг.<br>Глава II. Мир в 1918—1938 гг.</div></div>
<div class="part k3 first">${K3}</div>
<div class="part k4">${K4}</div>
</body></html>`;

(async () => {
  const out = process.argv[2] || path.join(__dirname, "konspekt.pdf");
  fs.writeFileSync(path.join(__dirname, "konspekt.html"), KHTML);
  const br = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const pg = await br.newPage();
  await pg.setContent(KHTML, { waitUntil: "load" });
  await pg.evaluate(() => document.fonts.ready);
  await pg.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true, headerTemplate: "<span></span>",
    footerTemplate: `<div style="width:100%;font-size:8px;color:#8a93a6;padding:0 13mm;display:flex;justify-content:space-between;font-family:sans-serif"><span>Конспекты § 3—4 · Всеобщая история 1914—1945</span><span class="pageNumber"></span></div>` });
  await br.close();
  console.log("ok", out);
})();
