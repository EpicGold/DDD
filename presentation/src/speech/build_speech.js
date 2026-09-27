// Текст выступления к презентации «Авиация Первой мировой войны» (Word).
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, AlignmentType, Footer, PageNumber, ShadingType, BorderStyle, TabStopType } = require("docx");

const S = JSON.parse(fs.readFileSync(path.join(__dirname, "speech.json")));
const FONT = "Calibri", WPM = 130;
const TEXT_W = 11906 - 1418 - 1134;

const nb = (s) => s.replace(/(\d) (\d{3})(?!\d)/g, "$1 $2").replace(/ — /g, " — ").replace(/(\d) (года?|году|км|м|жизн)/g, "$1 $2");
const words = (s) => s.replace(/\*\*/g, "").split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length;
const fmt = (sec) => (sec >= 60 ? `≈ ${Math.floor(sec / 60)} мин ${String(Math.round(sec % 60)).padStart(2, "0")} с` : `≈ ${Math.round(sec / 5) * 5} с`);

// **bold** markup -> runs
function runsOf(text, size = 32) {
  return nb(text).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((part) => part.startsWith("**")
    ? new TextRun({ text: part.slice(2, -2), bold: true, font: FONT, size, color: "1F3864" })
    : new TextRun({ text: part, font: FONT, size }));
}

const total = S.reduce((a, s) => a + s.text.reduce((b, t) => b + words(t), 0), 0);
const children = [
  new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Текст выступления", font: FONT, size: 44, bold: true })] }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "«Авиация Первой мировой войны» · Пономарев Глеб, 10В класс", font: FONT, size: 26, color: "595959" })] }),
  new Paragraph({
    spacing: { after: 320, line: 300 }, shading: { type: ShadingType.CLEAR, fill: "F2F2F2", color: "auto" },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: "1F3864", space: 8 } }, indent: { left: 200 },
    children: [
      new TextRun({ text: `Время: около ${Math.round(total / WPM)} минут (${total} слов). `, font: FONT, size: 24, bold: true }),
      new TextRun({ text: "► СЛАЙД — переключите презентацию на этот слайд и начинайте говорить. ", font: FONT, size: 24 }),
      new TextRun({ text: "Жирным ", font: FONT, size: 24, bold: true, color: "1F3864" }),
      new TextRun({ text: "выделены слова, на которых стоит сделать акцент. В трудных именах поставлено ударение (´). Говорите не торопясь, после каждого слайда — короткая пауза.", font: FONT, size: 24 }),
    ],
  }),
];

for (const s of S) {
  const sec = (s.text.reduce((b, t) => b + words(t), 0) / WPM) * 60;
  children.push(new Paragraph({
    keepNext: true, spacing: { before: 280, after: 120 },
    shading: { type: ShadingType.CLEAR, fill: "DCE6F2", color: "auto" },
    tabStops: [{ type: TabStopType.RIGHT, position: TEXT_W }],
    children: [
      new TextRun({ text: `► СЛАЙД ${s.n}  ·  ${s.title}`, font: FONT, size: 26, bold: true, color: "1F3864" }),
      new TextRun({ text: `\t${fmt(sec)}`, font: FONT, size: 22, color: "595959" }),
    ],
  }));
  s.text.forEach((t, i) => children.push(new Paragraph({
    keepLines: true, keepNext: i < s.text.length - 1, spacing: { after: 160, line: 324 }, children: runsOf(t),
  })));
}

const doc = new Document({
  creator: "Пономарев Глеб", title: "Текст выступления — Авиация Первой мировой войны",
  styles: { default: { document: { run: { font: FONT, size: 32 } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1418, right: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: ["стр. ", PageNumber.CURRENT, " из ", PageNumber.TOTAL_PAGES], font: FONT, size: 20, color: "7F7F7F" })] })] }) },
    children,
  }],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(path.join(__dirname, "speech.docx"), b); console.log("written; words:", total, "minutes:", (total / WPM).toFixed(1)); });
