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

const P1 = `
<header class="phead p1"><div class="pnum">§ 1</div><div><div class="ptitle">Сознание человека. Мировоззрение и ценности</div><div class="psub">«Каждый хочет изменить человечество, но никто не задумывается, как изменить себя». — Л. Н. Толстой</div></div>${I("brain", "pic")}</header>
${Q(1, "Что такое сознание? Какие компоненты сознания выделяют учёные?", `
  ${def("Сознание", "связанная с речью высшая функция мозга: обобщённое и целенаправленное отражение действительности, планирование и прогнозирование результатов своих действий, разумный самоконтроль и самооценка.")}
  <div class="grid4">
    ${tile("search", "Осознание", "мыслительные процессы, приобретение и систематизация знаний об объектах мира")}
    ${tile("heart", "Переживание", "эмоциональное отношение к объекту: сопереживание, неприятие, восхищение")}
    ${tile("archive", "Память", "запечатлевать, сохранять и воспроизводить информацию — основа всех психических процессов")}
    ${tile("target", "Воля", "осознанная саморегуляция, способность управлять своими действиями")}
  </div>
  <div class="row2">
    <div class="mini"><b>Самосознание</b> — осознание своих действий, чувств, мотивов, положения в семье и обществе.</div>
    <div class="mini"><b>Рефлексия</b> — размышления о себе, своих целях, поступках и смысле жизни.</div>
  </div>
  <p class="small">Помимо индивидуального, выделяют <b>общественное сознание</b> — значимые для общества ценности, идеи, представления и верования.</p>`)}
${Q(2, "Что такое мировоззрение?", `
  ${def("Мировоззрение", "обобщённая система взглядов человека (и общества) на мир в целом, на своё место в нём, понимание и оценка смысла своей жизни и деятельности, судеб человечества.")}
  <div class="flow">
    <div class="fbox"><small>Из чего состоит</small>научные, социально-политические, правовые, нравственные, религиозные, эстетические ориентиры; верования, убеждения, идеалы</div>
    <div class="farrow">→</div>
    <div class="fbox"><small>Как выражается</small>через образ жизни человека и общества</div>
    <div class="farrow">←</div>
    <div class="fbox"><small>Что формирует</small>жизненные обстоятельства, окружение, воспитание, образование</div>
  </div>`)}
${Q(3, "На примере традиционных ценностей российского общества охарактеризуйте высшие ценности.", `
  ${def("Высшие ценности", "то, что определяет смысл человеческой жизни, признаётся священным, обладает высочайшей степенью важности и обязательности.")}
  <div class="label">Традиционные ценности российского общества</div>
  ${chips(["жизнь", "достоинство", "права и свободы человека", "патриотизм", "гражданственность", "служение Отечеству", "высокие нравственные идеалы", "крепкая семья", "созидательный труд", "приоритет духовного над материальным", "гуманизм", "милосердие", "справедливость", "коллективизм", "взаимопомощь и взаимоуважение", "историческая память", "преемственность поколений", "единство народов России"])}
  <div class="grid3 feats">
    <div>${I("landmark", "fic")}<b>Сложились веками</b><p>вместе со становлением Российского государства</p></div>
    <div>${I("users", "fic")}<b>Объединяют</b><p>лежат в основе общероссийской идентичности и гражданского единства</p></div>
    <div>${I("link", "fic")}<b>Связывают эпохи</b><p>передаются от поколения к поколению; защищаются государством</p></div>
  </div>`)}
${Q(4, "Что такое идеал? Приведите примеры идеалов.", `
  ${def("Идеал", "высшая цель, к которой стремятся люди, высший смысл их деятельности и духовных устремлений, наиболее совершенное воплощение чего-либо.")}
  ${note("<b>Социальный идеал</b> — мечта о совершенном устройстве общества и о гармонично развитой личности, в полной мере реализующей свои возможности на благо человечества.", "sparkles")}
  <div class="label">Примеры</div>
  ${chips(["справедливое общество без бедности и войн", "гармонично развитая личность", "герой — защитник Отечества", "честный и милосердный человек", "истина — идеал учёного"])}`)}
${Q(5, "Какую роль в мировоззрении и практической деятельности человека играют убеждения?", `
  ${def("Убеждения", "устойчивая система взглядов человека, в которой объединяются его разум, воля и чувства.")}
  <div class="core"><div class="ring">${I("shield-check", "cic")}<b>Стержень мировоззрения<br>и духовное ядро личности</b></div>
    <ul class="ticks">
      <li>направляют поступки и выбор человека;</li>
      <li>помогают преодолеть утрату удобств, физическую немощь и даже страх смерти — вспомните героев российской истории;</li>
      <li>если поступки расходятся с убеждениями (эмоции, мода, авторитеты), раскаяние и нравственные переживания становятся <b>источником духовного роста</b>.</li>
    </ul></div>`)}
${Q(6, "Какие типы мировоззрения существуют? Дайте краткую характеристику каждого из них.", `
  <div class="types">
    <div class="type"><div class="th">${I("home", "tyic")}Обыденное</div><p>Формируется естественно в процессе социализации: родной язык, сказки, пословицы, общение, школа, опыт. Часто фрагментарно, может содержать суеверия, стереотипы, предрассудки.</p></div>
    <div class="type"><div class="th">${I("feather", "tyic")}Мифологическое</div><p>Опирается на мифы — образные истории о происхождении мира и человека; природа описывается через человеческие качества. Сегодня ту же роль играет мифология массовой культуры и СМИ.</p></div>
    <div class="type"><div class="th">${I("church", "tyic")}Религиозное</div><p>Системная картина прошлого, настоящего и будущего; объединяет мир природы и общества со сверхъестественным. Нравственные нормы — как Божья воля, поэтому сильно влияют на жизнь верующего.</p></div>
    <div class="type"><div class="th">${I("scale", "tyic")}Философское</div><p>Возникло в Античности. Критическое отношение к утверждениям (нужны обоснования), переход от образов к абстрактным понятиям; не догмы, а инструменты объяснения мира.</p></div>
    <div class="type"><div class="th">${I("microscope", "tyic")}Научное</div><p>Включает научную картину мира — систему взглядов, основанную на научных знаниях и методах исследования. Изменяется от эпохи к эпохе.</p></div>
  </div>
  <div class="scale"><span>менее системное</span><i></i><span>более системное и обоснованное</span></div>`)}
`;

const P2 = `
<header class="phead p2"><div class="pnum">§ 2</div><div><div class="ptitle">Мнение или знание? Способы познания окружающего мира</div><div class="psub">«Весь огромный мир кругом меня… полон неизведанных тайн». — В. В. Бианки</div></div>${I("telescope", "pic")}</header>
${Q(1, "Какова цель познания? Что такое объект познания, субъект познания?", `
  <div class="goal">${I("target", "gic")}<div><small>Цель познания</small><b>получение истинного знания</b></div></div>
  ${def("Познание", "активная деятельность человека, направленная на получение новых знаний о каких-либо объектах, явлениях, процессах.")}
  <div class="so">
    <div class="sobox"><small>Субъект познания</small><b>тот, кто познаёт</b><p>человек (и общество)</p></div>
    <div class="soarrow"><span>познаёт</span></div>
    <div class="sobox"><small>Объект познания</small><b>то, что познаётся</b><p>окружающий мир и сам человек</p></div>
  </div>`)}
${Q(2, "Какие формы познания выделяют учёные? Дайте краткую характеристику и укажите конкретные проявления каждой формы.", `
  <div class="forms">
    <div class="form"><div class="fh">${I("eye", "fhic")}Чувственное познание</div><p class="fd">через органы чувств: зрение, слух, осязание, обоняние, вкус</p>
      <div class="steps">
        <div class="step"><b>Ощущение</b><p>образ отдельного свойства</p><em>солёный вкус морской воды, запах цветка</em></div>
        <div class="step"><b>Восприятие</b><p>целостный образ предмета</p><em>яблоко: красное, ароматное, сладкое</em></div>
        <div class="step"><b>Представление</b><p>образ, сохранённый в памяти</p><em>вспоминаем вкус яблока, когда его нет рядом</em></div>
      </div></div>
    <div class="form rat"><div class="fh">${I("lightbulb", "fhic")}Рациональное познание</div><p class="fd">через мышление по законам логики: обобщение, выявление закономерностей</p>
      <div class="steps">
        <div class="step"><b>Понятие</b><p>общие существенные признаки</p><em>«школа», «ученик», «урок»</em></div>
        <div class="step"><b>Суждение</b><p>утверждает или отрицает</p><em>«Все коты — млекопитающие»</em></div>
        <div class="step"><b>Умозаключение</b><p>вывод из суждений</p><em>«Барсик — кот» ⇒ «Барсик — млекопитающее»</em></div>
      </div></div>
  </div>
  <div class="row2">
    <div class="mini"><b>Индукция</b>: от частного к общему — попробовали несколько зелёных яблок, все кислые ⇒ все такие яблоки кислые.</div>
    <div class="mini"><b>Дедукция</b>: от общего к частному — все зелёные яблоки кислые ⇒ это зелёное яблоко подойдёт для пирога.</div>
  </div>`)}
${Q(3, "Перечислите виды познания и назовите особенности каждого из них.", `
  <div class="grid3 kinds">
    ${tile("home", "Обыденное", "практические наблюдения, здравый смысл, смекалка, бытовой опыт")}
    ${tile("hammer", "Практическое", "поиск путей к конкретному результату; обучение через практику (кулинарный блог, бизнес)")}
    ${tile("feather", "Мифологическое", "древние сказания и легенды, сегодня — образы массовой культуры и СМИ")}
    ${tile("church", "Религиозное", "вера в Бога, принятие духовных истин, обряды; соприкосновение со сверхъестественным")}
    ${tile("palette", "Художественное", "понимание мира через творчество: образы, эмоции, красота, символы")}
    ${tile("flask-conical", "Научное", "объективные факты, доказательность, логика; знание системно, проверяемо, прогнозирует результаты")}
  </div>
  <div class="row2">
    <div class="mini"><b>Уровни научного познания:</b> эмпирический (наблюдение, измерение, эксперимент) и теоретический (анализ, синтез, моделирование, гипотезы, теории).</div>
    <div class="mini"><b>Социальное познание</b> — о человеке и обществе: субъект и объект совпадают, знание ценностно окрашено, объект сложен и изменчив, эксперимент ограничен; бывает научным и ненаучным.</div>
  </div>`)}
${Q(4, "Что такое истина? Какие критерии истины используются в процессе познания? Почему не существует единственного универсального критерия?", `
  ${def("Истина", "знание, соответствующее свойствам познаваемого предмета; адекватное отражение действительности. Истина <b>объективна</b> (не зависит от желаний субъекта) и <b>конкретна</b> (верна при определённых условиях).")}
  <div class="row2">
    <div class="mini rel"><b>Относительная истина</b> — неполное знание, верное лишь при определённых условиях. <em>Законы Ньютона верны для инерциальных систем отсчёта.</em></div>
    <div class="mini abs"><b>Абсолютная истина</b> — полное, точное, окончательное знание; скорее идеал и цель научного познания.</div>
  </div>
  <table class="crit"><thead><tr><th>Критерий истины</th><th>Слабое место</th></tr></thead><tbody>
    <tr><td><b>Непротиворечивость</b> и согласованность с существующей системой знаний</td><td>революционные открытия сначала отвергались, но оказывались верными</td></tr>
    <tr><td><b>Историческая проверка</b> — испытание временем</td><td>новую идею так сразу не проверить</td></tr>
    <tr><td><b>Полезность</b>, <b>авторитетный источник</b> (в быту)</td><td>полезное и авторитетное не всегда истинно</td></tr>
    <tr class="key"><td><b>Практика</b> — эксперимент, наблюдение, применение в жизни (ключевой критерий)</td><td>фундаментальные законы и абстрактную математику напрямую не проверить; подтверждение может запаздывать на десятилетия</td></tr>
  </tbody></table>
  ${note("<b>Почему нет единственного критерия:</b> у каждого критерия есть ограничения, а цели, объекты, виды, формы и методы познания многообразны — поэтому разнообразны и критерии истинности знания.", "alert-triangle")}`, true)}
`;

const P3 = `
<header class="phead p3"><div class="pnum">§ 3</div><div><div class="ptitle">Логика и её законы. Как правильно спорить? Доказательство и опровержение</div><div class="psub">«Вырази ложную мысль ясно, и она сама себя опровергнет». — Л. де Вовенарг</div></div>${I("messages-square", "pic")}</header>
${Q(1, "Что такое логика? Какова её основная задача?", `
  ${def("Логика", "наука о законах и формах познающего мышления; универсальный инструмент, позволяющий структурировать мысли, убеждать окружающих и приходить к правильным выводам.")}
  <div class="goal">${I("lightbulb", "gic")}<div><small>Основная задача</small><b>пробудить стремление пользоваться способностью к самостоятельному размышлению — научить эффективно использовать и развивать разум</b></div></div>
  <p class="small">Образ из пособия: если сознание — это дом, то логика — его <b>фундамент</b>, без которого рассуждения шатки и ненадёжны.</p>`)}
${Q(2, "Назовите и объясните смысл четырёх законов логики.", `
  <div class="laws">
    <div class="law"><div class="ln">1</div><b>Закон тождества</b><p>Всякая мысль в рассуждении должна оставаться тождественной самой себе — понятие не меняет смысла.</p><div class="bad">${I("x-circle", "bic")}Нарушение: собеседники произносят одно слово, но вкладывают в него разный смысл и не понимают друг друга.</div></div>
    <div class="law"><div class="ln">2</div><b>Закон непротиворечия</b><p>Два противоположных суждения не могут быть одновременно истинными — хотя бы одно ложно.</p><div class="bad">${I("x-circle", "bic")}Нарушение: утверждать и отрицать одно и то же одновременно и в одном отношении.</div></div>
    <div class="law"><div class="ln">3</div><b>Закон исключённого третьего</b><p>Из двух противоречащих суждений одно обязательно истинно — третьего не дано.</p><div class="good">${I("check-circle", "bic")}«Солнце восходит на востоке» / «Солнце не восходит на востоке» — верно одно. Помогает принимать чёткие решения «да / нет».</div></div>
    <div class="law"><div class="ln">4</div><b>Закон достаточного основания</b><p>Всякая истинная мысль должна иметь аргументы и доказательства.</p><div class="good">${I("check-circle", "bic")}Неподтверждённая мысль — лишь мнение. Закон учит критически оценивать свои убеждения и избегать голословности.</div></div>
  </div>`)}
${Q(3, "Что такое доказательство? Каковы его элементы? Что называют опровержением?", `
  ${def("Доказательство", "система логических аргументов и рассуждений, используемых для подтверждения истинности определённого утверждения.")}
  <div class="proof">
    <div class="pa">Аргументы<small>мысли, на основе фактов подтверждающие тезис</small></div>
    <div class="pd">Демонстрация<small>способ связать аргументы с тезисом</small></div>
    <div class="pt">Тезис<small>мысль, которую надо доказать</small></div>
  </div>
  ${def("Опровержение", "логическая операция, доказывающая, что высказывание неверно или недостаточно доказано; действие, обратное доказательству.")}
  ${note("<b>Пример из пособия:</b> Наполеон объяснял гибель армии морозами. Денис Давыдов опроверг это: мороз не превышал 12°, а в прежних кампаниях французы переносили куда более сильные и долгие холода.", "quote")}`)}
${Q(4, "Какой спор называют рациональным? Почему для каждого человека важно уметь вести рациональный спор?", `
  ${def("Рациональный спор", "спор (дискуссия, полемика), участники которого придерживаются требований логики, ведут себя корректно и не позволяют эмоциям увести себя от цели спора.")}
  <div class="label">Условия рационального спора</div>
  <div class="grid4 conds">
    <div><b>Предмет спора</b><p>понятная проблема или тема</p></div>
    <div><b>Общая основа</b><p>положения, признаваемые обеими сторонами</p></div>
    <div><b>Знание предмета</b><p>не спорить о том, чего не знаешь</p></div>
    <div><b>Уважение и честность</b><p>слушать оппонента, признавать свои ошибки</p></div>
  </div>
  <ul class="ticks">
    <li>спорить приходится постоянно — в учёбе, работе, семье;</li>
    <li>рациональный спор ведёт к <b>истине, согласию или убеждению</b>, а не к ссоре и выпадам личного характера;</li>
    <li>умение спорить показывает воспитанность человека (Д. С. Лихачёв), а понимание оппонента открывает долю истины, которая «сделает богаче вас обоих».</li>
  </ul>`, true)}
${Q(5, "Каким образом лучше распределять свои аргументы в ходе спора?", `
  <div class="grid3 tactics">
    ${tile("target", "Концентрация усилий", "бить в самое уязвимое место аргументации оппонента, а не по всей системе доводов")}
    ${tile("sparkles", "Эффект внезапности", "не выкладывать всё сразу — сильнейший аргумент приберечь к финалу")}
    ${tile("archive", "Отложенный ответ", "на трудный вопрос — уточнение или другие доводы, пока не найдётся ответ")}
    ${tile("scale", "Бремя доказательства", "добиваться, чтобы обосновывать позицию пришлось оппоненту")}
    ${tile("swords", "Его доводы — против него", "обратить аргументы соперника в поддержку своей позиции")}
    ${tile("crown", "Инициатива и последнее слово", "задать формулировку спора в начале, подвести итоги в конце")}
  </div>`)}
${Q(6, "Вспомните случай из жизни, когда вы участвовали в споре, и проанализируйте его с учётом изученных техник.", `
  <div class="tpl">Личный вопрос — ниже образец; замените его своим примером.</div>
  <p><b>Ситуация:</b> спор с другом о том, нужно ли запрещать телефоны в школе.</p>
  <div class="row2">
    <div class="mini bad2"><b>Что было неэффективно</b><ul><li>не уточнили, что значит «запретить» — совсем или только на уроках (нарушение закона тождества);</li><li>все аргументы сразу;</li><li>повышенный тон и «ты всегда так думаешь» — некорректный аргумент.</li></ul></div>
    <div class="mini good2"><b>Что можно улучшить</b><ul><li>уточнить предмет спора и найти общую основу (на уроках телефоны отвлекают);</li><li>сосредоточиться на самом слабом доводе;</li><li>сильный аргумент — в конце; говорить спокойно, уважать позицию друга.</li></ul></div>
  </div>`)}
${Q(7, "Согласны ли вы с утверждением автора о важности уважения к оппоненту в любом споре? Обоснуйте свой ответ примерами.", `
  <div class="verdict">${I("check-circle", "vic")}<b>Да, согласен.</b></div>
  <ul class="ticks">
    <li><b>Цель спора — истина или согласие</b>, а не победа любой ценой. Без уважения «противоборство идей» превращается в «столкновение характеров», а спор становится пустым (Д. С. Лихачёв).</li>
    <li><b>Уважение помогает услышать</b> долю правды в позиции другого человека.</li>
    <li><b>Пример из пособия:</b> картина Ю. Пименова «Спор» — собеседники расходятся в деталях, но не кричат и не оскорбляют друг друга, а вместе ищут истину.</li>
    <li><b>Пример из жизни:</b> на школьных дебатах выигрывает не тот, кто перебивает, а тот, кто выслушал оппонента и точно ответил на его довод.</li>
    <li><b>Обратный пример:</b> ток-шоу, где участники кричат и переходят на личности, — зрители так и не понимают, кто прав.</li>
  </ul>`)}
`;

const COVER = `
<div class="cover">
  <div class="cv-top">Обществознание · Глава I. Человек и окружающий мир</div>
  <h1>Проверяем себя</h1>
  <div class="cv-sub">Наглядные ответы на вопросы к параграфам 1–3</div>
  <div class="cv-cards">
    <div class="cvc c1">${I("brain", "cvi")}<span>§ 1</span><b>Сознание человека. Мировоззрение и ценности</b><em>6 вопросов</em></div>
    <div class="cvc c2">${I("telescope", "cvi")}<span>§ 2</span><b>Мнение или знание? Способы познания окружающего мира</b><em>4 вопроса</em></div>
    <div class="cvc c3">${I("messages-square", "cvi")}<span>§ 3</span><b>Логика и её законы. Как правильно спорить?</b><em>7 вопросов</em></div>
  </div>
  <div class="cv-foot">Ответы составлены по тексту учебного пособия · определения даны в формулировках пособия</div>
</div>`;

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

const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Проверяем себя — ответы к §1–3</title><style>${CSS}</style></head><body>
<div class="part p1 first">${P1}</div>
<div class="part p2">${P2}</div>
<div class="part p3">${P3}</div>
</body></html>`;

(async () => {
  const out = process.argv[2] || path.join(__dirname, "answers.pdf");
  fs.writeFileSync(path.join(__dirname, "answers.html"), html);
  const br = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const pg = await br.newPage();
  await pg.setContent(html, { waitUntil: "load" });
  await pg.evaluate(() => document.fonts.ready);
  const coverHtml = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>${CSS}@page{margin:0}</style></head><body>${COVER}</body></html>`;
  const cp = await br.newPage(); await cp.setContent(coverHtml, { waitUntil: "load" }); await cp.evaluate(() => document.fonts.ready);
  await cp.pdf({ path: path.join(__dirname, "cover.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
  await pg.pdf({ path: path.join(__dirname, "body.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `<div style="width:100%;font-size:8px;color:#8a93a6;padding:0 13mm;display:flex;justify-content:space-between;font-family:sans-serif"><span>Проверяем себя · ответы к §1–3</span><span class="pageNumber"></span></div>` });
  await br.close();
  require("child_process").execFileSync("python3", ["-c", "import sys,pypdf;w=pypdf.PdfWriter();[w.append(f) for f in sys.argv[1:3]];w.add_metadata({'/Title':'Проверяем себя — ответы к §1–3'});w.write(sys.argv[3])", path.join(__dirname, "cover.pdf"), path.join(__dirname, "body.pdf"), out]);
  console.log("ok", out);
})();
