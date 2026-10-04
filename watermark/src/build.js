const fs = require("fs"), path = require("path");
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const fp = "/root/intro/node_modules/@fontsource";
const B = (p) => fs.readFileSync(`${fp}/${p}`).toString("base64");
const HANDLE = "@astazia_karina_18";
const S = 2048, C = S / 2, RO = 1000, RI = 735;   // outer edge / photo hole radius
const VARIANTS = {
  burgundy: { name: "Бордо и золото", band: ["#4a0f22", "#8c2648", "#5e1430"], metal: ["#8a5a14", "#f8e6a0", "#c8963e", "#fff4cf", "#9c6d22"], text: "metal", dots: "#f3d98f" },
  black:    { name: "Чёрный и золото", band: ["#050505", "#2b2b2b", "#0d0d0d"], metal: ["#8a5a14", "#f8e6a0", "#c8963e", "#fff4cf", "#9c6d22"], text: "metal", dots: "#e9cf86" },
  powder:   { name: "Пудровый и розовое золото", band: ["#e9b3bf", "#fbe3e7", "#e6a9b7"], metal: ["#9b5560", "#f6d2c4", "#c27f86", "#ffe9df", "#a8636c"], text: "#7d2240", dots: "#ffffff" },
  lavender: { name: "Лаванда и серебро", band: ["#3b2a63", "#7a62b8", "#4a3678"], metal: ["#7d7f8c", "#ffffff", "#b9bcc8", "#f4f5fa", "#8d909c"], text: "#fbf8ff", dots: "#ffffff" },
};
const star = (x, y, r, fill) => { const k = r * 0.22; return `<path d="M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r}Z" fill="${fill}"/>`; };
const polar = (r, deg) => [C + r * Math.cos((deg - 90) * Math.PI / 180), C + r * Math.sin((deg - 90) * Math.PI / 180)];
function svg(v, withTg = true) {
  const RM = (RO + RI) / 2, RT = RM - 46; // text baseline radius
  const metal = `url(#metal)`;
  const textFill = v.text === "metal" ? "url(#metalText)" : v.text;
  // dotted rows along the band
  let dots = "";
  for (let a = 0; a < 360; a += 3.6) { const inTop = a > 280 || a < 80, inBot = a > 150 && a < 210; if (inTop || (withTg && inBot)) continue;
    const [x, y] = polar(RM, a); dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${a % 18 === 0 ? 10 : 5.5}" fill="${v.dots}" opacity="${a % 18 === 0 ? 0.95 : 0.6}"/>`; }
  for (const a of [-88, 88]) { const [x, y] = polar(RM, a); dots += star(x, y, 30, v.dots); }
  if (withTg) for (const a of [158, 202]) { const [x, y] = polar(RM, a); dots += star(x, y, 22, v.dots); }
  const [tx, ty] = polar(RM, 180);
  const tg = withTg ? `<g transform="translate(${tx - 120} ${ty - 120})">
      <circle cx="120" cy="120" r="128" fill="${metal}" filter="url(#sh)"/>
      <circle cx="120" cy="120" r="114" fill="url(#tgGrad)"/>
      <path transform="translate(-6 0)" fill="#fff" d="M54.3 118.8c35-15.2 58.3-25.3 70-30.2 33.3-13.9 40.3-16.3 44.8-16.4 1 0 3.2.2 4.7 1.4 1.2 1 1.5 2.3 1.7 3.3s.4 3.1.2 4.7c-1.8 19-9.6 65.1-13.6 86.3-1.7 9-5 12-8.2 12.3-7 .6-12.3-4.6-19-9-10.6-6.9-16.5-11.2-26.8-18-11.9-7.8-4.2-12.1 2.6-19.1 1.8-1.8 32.5-29.8 33.1-32.3.1-.3.1-1.5-.6-2.1-.7-.6-1.7-.4-2.5-.2-1.1.2-17.9 11.4-50.6 33.5-4.8 3.3-9.1 4.9-13 4.8-4.3-.1-12.5-2.4-18.7-4.4-7.5-2.4-13.5-3.7-13-7.9.3-2.2 3.3-4.4 8.9-6.7z"/>
    </g>` : "";
  const stops = (arr) => arr.map((c, i) => `<stop offset="${(i / (arr.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">${stops(v.metal)}</linearGradient>
    <linearGradient id="metalText" x1="0" y1="0" x2="1" y2="0.3">${stops(v.metal)}</linearGradient>
    <radialGradient id="band" cx="0.38" cy="0.3" r="0.85">${stops(v.band)}</radialGradient>
    <linearGradient id="tgGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#37BBFE"/><stop offset="1" stop-color="#007DBB"/></linearGradient>
    <radialGradient id="inner" cx="0.5" cy="0.5" r="0.5"><stop offset="${((RI - 46) / RI).toFixed(3)}" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></radialGradient>
    <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.45"/></filter>
    <filter id="tsh" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.5"/></filter>
    <mask id="ring"><rect width="${S}" height="${S}" fill="#000"/><circle cx="${C}" cy="${C}" r="${RO}" fill="#fff"/><circle cx="${C}" cy="${C}" r="${RI}" fill="#000"/></mask>
    <path id="arcTop" d="M ${C - RT} ${C} A ${RT} ${RT} 0 1 1 ${C + RT} ${C} A ${RT} ${RT} 0 1 1 ${C - RT} ${C}"/>
  </defs>
  <g filter="url(#sh)"><rect width="${S}" height="${S}" fill="url(#band)" mask="url(#ring)"/></g>
  <circle cx="${C}" cy="${C}" r="${RO}" fill="url(#gloss)" mask="url(#ring)"/>
  <circle cx="${C}" cy="${C}" r="${RI}" fill="url(#inner)"/>
  <circle cx="${C}" cy="${C}" r="${RO - 9}" fill="none" stroke="${metal}" stroke-width="18"/>
  <circle cx="${C}" cy="${C}" r="${RO - 34}" fill="none" stroke="${metal}" stroke-width="4"/>
  <circle cx="${C}" cy="${C}" r="${RI + 9}" fill="none" stroke="${metal}" stroke-width="18"/>
  <circle cx="${C}" cy="${C}" r="${RI + 34}" fill="none" stroke="${metal}" stroke-width="4"/>
  ${dots}
  <text font-family="Cormorant" font-weight="700" font-style="italic" font-size="170" letter-spacing="6" fill="${textFill}" ${v.text === "metal" ? 'filter="url(#tsh)"' : ""}>
    <textPath href="#arcTop" startOffset="25%" text-anchor="middle">${HANDLE}</textPath></text>
  ${tg}
</svg>`;
}
const css = ["600", "700"].map((w) => `@font-face{font-family:Cormorant;font-weight:${w};font-style:italic;src:url(data:font/woff2;base64,${B(`cormorant-garamond/files/cormorant-garamond-latin-${w}-italic.woff2`)})}`).join("");
(async () => {
  const br = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const pg = await br.newPage({ viewport: { width: S, height: S } });
  fs.mkdirSync("out", { recursive: true });
  for (const [k, v] of Object.entries(VARIANTS)) {
    for (const tg of [true, false]) {
      await pg.setContent(`<style>${css}html,body{margin:0;background:transparent}</style>${svg(v, tg)}`);
      await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(150);
      await pg.screenshot({ path: `out/frame_${k}${tg ? "" : "_notg"}.png`, omitBackground: true, clip: { x: 0, y: 0, width: S, height: S } });
    }
  }
  await br.close();
})();
