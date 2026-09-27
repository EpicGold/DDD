// Vector illustrations rendered to PNG (base64) for the deck.
const React = require("react");
const S = require("react-dom/server");
const sharp = require("sharp");
const gi = require("react-icons/gi");

async function png(svg, width) {
  const buf = await sharp(Buffer.from(svg), { density: 300 }).resize({ width }).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

async function icon(name, color, size = 256) {
  const svg = S.renderToStaticMarkup(React.createElement(gi[name], { size, color: "#" + color }));
  return png(svg, size);
}

// Top view of a generic WWI biplane, nose up. 400 x 300.
function biplaneTop(fill, detail) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <ellipse cx="200" cy="24" rx="52" ry="5" fill="${fill}" opacity="0.55"/>
  <rect x="192" y="18" width="16" height="10" rx="3" fill="${fill}"/>
  <rect x="8" y="72" width="384" height="64" rx="16" fill="${fill}"/>
  <path d="M182,40 Q200,16 218,40 L212,252 Q200,262 188,252 Z" fill="${fill}"/>
  <path d="M146,236 L254,236 Q262,256 244,264 L156,264 Q138,256 146,236 Z" fill="${fill}"/>
  <rect x="197" y="230" width="6" height="56" rx="3" fill="${fill}"/>
  <g stroke="${detail}" stroke-width="2" opacity="0.35">
    ${[40, 72, 104, 136, 264, 296, 328, 360].map((x) => `<line x1="${x}" y1="76" x2="${x}" y2="132"/>`).join("")}
    <line x1="14" y1="120" x2="120" y2="120"/><line x1="280" y1="120" x2="386" y2="120"/>
  </g>
  <circle cx="92" cy="104" r="17" fill="none" stroke="${detail}" stroke-width="5" opacity="0.5"/>
  <circle cx="308" cy="104" r="17" fill="none" stroke="${detail}" stroke-width="5" opacity="0.5"/>
  <ellipse cx="200" cy="158" rx="10" ry="13" fill="${detail}" opacity="0.8"/>
</svg>`;
}

// Side view of a Fokker Dr.I-style triplane facing left. 420 x 230.
function triplaneSide(fill, detail) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 230" width="420" height="230">
  <ellipse cx="44" cy="104" rx="5" ry="62" fill="${fill}" opacity="0.5"/>
  <circle cx="74" cy="104" r="26" fill="${fill}"/>
  <path d="M70,80 L120,80 L352,100 L372,94 L380,106 L356,116 L120,128 L70,128 Z" fill="${fill}"/>
  <path d="M348,100 Q352,52 382,58 Q400,76 376,114 Z" fill="${fill}"/>
  <rect x="96" y="26" width="104" height="11" rx="5" fill="${fill}"/>
  <rect x="104" y="76" width="100" height="10" rx="5" fill="${detail}" opacity="0.35"/>
  <rect x="100" y="134" width="104" height="11" rx="5" fill="${fill}"/>
  <g stroke="${fill}" stroke-width="5" stroke-linecap="round">
    <line x1="150" y1="36" x2="150" y2="136"/>
    <line x1="118" y1="36" x2="108" y2="80"/><line x1="142" y1="36" x2="136" y2="80"/>
    <line x1="112" y1="144" x2="128" y2="190"/><line x1="160" y1="144" x2="132" y2="190"/>
  </g>
  <rect x="104" y="184" width="54" height="8" rx="4" fill="${fill}"/>
  <circle cx="130" cy="196" r="19" fill="${fill}"/><circle cx="130" cy="196" r="6" fill="${detail}" opacity="0.6"/>
  <path d="M356,114 L372,142 L364,142 L348,116 Z" fill="${fill}"/>
  <rect x="112" y="68" width="40" height="5" rx="2" fill="${fill}"/>
  <g transform="translate(255,104)"><rect x="-13" y="-4" width="26" height="8" fill="${detail}" opacity="0.7"/><rect x="-4" y="-13" width="8" height="26" fill="${detail}" opacity="0.7"/></g>
</svg>`;
}

// Top view of the Sikorsky Ilya Muromets (four engines), nose up. 500 x 300.
function muromets(fill, detail) {
  const engines = [118, 176, 324, 382];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" width="500" height="300">
  <path d="M230,44 Q250,18 270,44 L262,258 L238,258 Z" fill="${fill}"/>
  <rect x="4" y="84" width="492" height="48" rx="8" fill="${fill}"/>
  ${engines.map((x) => `<rect x="${x - 9}" y="66" width="18" height="30" rx="5" fill="${fill}"/><ellipse cx="${x}" cy="64" rx="27" ry="3.5" fill="${fill}" opacity="0.55"/>`).join("")}
  <rect x="178" y="236" width="144" height="26" rx="6" fill="${fill}"/>
  <rect x="246" y="252" width="8" height="36" rx="3" fill="${fill}"/>
  <g stroke="${detail}" stroke-width="2" opacity="0.35">
    ${[40, 80, 216, 284, 420, 460].map((x) => `<line x1="${x}" y1="88" x2="${x}" y2="128"/>`).join("")}
  </g>
  ${[46, 58, 150, 170, 190].map((y) => `<rect x="242" y="${y}" width="16" height="7" rx="2" fill="${detail}" opacity="0.6"/>`).join("")}
</svg>`;
}

// Stylised aerial reconnaissance photograph of a trench system. 400 x 400.
function aerialPhoto() {
  const trench = (d, w = 6) => `<path d="${d}" fill="none" stroke="#2E2B21" stroke-width="${w}" stroke-linejoin="miter"/>`;
  const zig = (y, amp, step, x0 = 0, x1 = 400) => {
    let d = `M${x0},${y}`;
    for (let x = x0, i = 0; x <= x1; x += step, i++) d += ` L${x},${y + (i % 2 ? amp : -amp)}`;
    return d;
  };
  const craters = [[60, 70, 9], [120, 52, 6], [300, 60, 11], [340, 150, 7], [90, 190, 8], [250, 178, 10], [180, 120, 6], [40, 300, 7], [220, 330, 9], [330, 300, 6], [150, 250, 5], [370, 230, 8]];
  let grid = "";
  for (let i = 1; i < 4; i++) grid += `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="400"/><line x1="0" y1="${i * 100}" x2="400" y2="${i * 100}"/>`;
  const labels = ["A1", "B1", "C1", "D1", "A2", "B2", "C2", "D2"].map((t, k) => `<text x="${(k % 4) * 100 + 6}" y="${Math.floor(k / 4) * 200 + 16}" font-family="DejaVu Sans" font-size="12" fill="#F1E9D6" opacity="0.8">${t}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="#8E866B"/>
  <rect x="0" y="0" width="170" height="110" fill="#9A9275"/><rect x="230" y="250" width="170" height="150" fill="#A09879"/>
  <rect x="0" y="260" width="120" height="140" fill="#857D62"/>
  <path d="M0,340 C120,300 220,380 400,320" fill="none" stroke="#C9C0A2" stroke-width="10" opacity="0.8"/>
  ${trench(zig(150, 10, 22), 7)}
  ${trench(zig(215, 8, 26), 5)}
  ${trench(zig(88, 7, 30), 4)}
  ${trench("M60,150 L72,180 L58,215", 3)}${trench("M210,150 L222,185 L205,215", 3)}${trench("M330,150 L318,182 L336,215", 3)}
  ${trench("M140,88 L150,120 L138,150", 3)}${trench("M280,88 L270,118 L286,150", 3)}
  <path d="${zig(118, 3, 12)}" fill="none" stroke="#D8D0B4" stroke-width="2" stroke-dasharray="3 3" opacity="0.8"/>
  ${craters.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 3}" fill="#B3AB8C" opacity="0.7"/><circle cx="${x}" cy="${y}" r="${r}" fill="#5E583F"/>`).join("")}
  <g stroke="#F1E9D6" stroke-width="1" opacity="0.45">${grid}</g>
  ${labels}
  <rect x="3" y="3" width="394" height="394" fill="none" stroke="#F1E9D6" stroke-width="6"/>
</svg>`;
}

// Side schematic of a synchronised (interrupter) gun firing past the propeller. 420 x 400.
function synchronizer(fill, accent, dark) {
  const label = (x, y, t, anchor = "start") => `<text x="${x}" y="${y}" font-family="DejaVu Sans" font-size="15" fill="${fill}" text-anchor="${anchor}">${t}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 400" width="420" height="400">
  <path d="M30,170 L230,150 L260,160 L260,250 L230,258 L30,236 Z" fill="${fill}" opacity="0.9"/>
  <circle cx="250" cy="205" r="44" fill="${fill}"/>
  <circle cx="250" cy="205" r="30" fill="${dark}" opacity="0.35"/>
  <ellipse cx="300" cy="205" rx="16" ry="165" fill="none" stroke="${fill}" stroke-width="2" stroke-dasharray="6 6" opacity="0.8"/>
  <path d="M296,205 Q288,300 298,368 Q310,300 304,205 Z" fill="${fill}"/>
  <path d="M296,205 Q288,110 298,44 Q310,110 304,205 Z" fill="${fill}" opacity="0.25"/>
  <circle cx="300" cy="205" r="9" fill="${accent}"/>
  <rect x="120" y="128" width="160" height="14" rx="4" fill="${fill}"/>
  <rect x="150" y="120" width="60" height="30" rx="5" fill="${fill}"/>
  ${[320, 348, 376, 404].map((x) => `<rect x="${x}" y="131" width="16" height="7" rx="3" fill="${accent}"/>`).join("")}
  <path d="M250,205 L250,176 L180,176 L180,150" fill="none" stroke="${accent}" stroke-width="3" stroke-dasharray="7 5"/>
  <circle cx="250" cy="205" r="5" fill="${accent}"/>
  ${label(108, 108, "пулемёт")}
  ${label(318, 116, "очередь")}
  ${label(40, 346, "в этот миг лопасть")}
  ${label(40, 366, "ниже линии огня")}
  <path d="M180,352 L286,330" stroke="${fill}" stroke-width="1.5" opacity="0.7"/>
  ${label(40, 292, "мотор через кулачок и тягу")}
  ${label(40, 312, "«разрешает» выстрел")}
</svg>`;
}

// HMS Furious-style carrier with a Camel taking off. 440 x 230.
function carrier(fill, detail) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 230" width="440" height="230">
  <path d="M10,150 L430,150 L408,188 L40,188 Z" fill="${fill}"/>
  <rect x="20" y="138" width="150" height="12" fill="${fill}"/>
  <rect x="270" y="138" width="160" height="12" fill="${fill}"/>
  <rect x="190" y="104" width="54" height="46" fill="${fill}"/>
  <rect x="205" y="82" width="22" height="24" fill="${fill}"/>
  <rect x="212" y="40" width="4" height="44" fill="${fill}"/>
  <line x1="214" y1="44" x2="150" y2="138" stroke="${fill}" stroke-width="1.5"/>
  <line x1="214" y1="44" x2="290" y2="138" stroke="${fill}" stroke-width="1.5"/>
  ${[60, 100, 140, 300, 340].map((x) => `<circle cx="${x}" cy="168" r="4" fill="${detail}" opacity="0.5"/>`).join("")}
  <g transform="translate(360,92) rotate(-12)">
    <rect x="-36" y="-10" width="56" height="5" rx="2" fill="${fill}"/>
    <rect x="-34" y="6" width="52" height="5" rx="2" fill="${fill}"/>
    <path d="M-30,0 L28,-3 L30,5 L-30,8 Z" fill="${fill}"/>
    <ellipse cx="31" cy="1" rx="2.5" ry="14" fill="${fill}" opacity="0.6"/>
    <path d="M-30,0 L-42,-12 L-40,6 Z" fill="${fill}"/>
  </g>
  <g fill="none" stroke="${fill}" stroke-width="2.5" opacity="0.55">
    <path d="M0,204 q20,-8 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0"/>
    <path d="M20,220 q20,-8 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0"/>
  </g>
</svg>`;
}

module.exports = { png, icon, biplaneTop, triplaneSide, muromets, aerialPhoto, synchronizer, carrier };
