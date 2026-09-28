// Embed logo + fonts into a single self-contained HTML, then (optionally) render MP4.
const fs = require("fs"), path = require("path"), { spawn } = require("child_process");
const F = (p) => fs.readFileSync(path.join(__dirname, p)).toString("base64");
const fp = "node_modules/@fontsource";
const V2 = process.env.VARIANT === "2";
let html = fs.readFileSync(path.join(__dirname, V2 ? "src/intro_v2.html" : "src/intro.html"), "utf8")
  .replace("__LOGO__", F("logo.webp"))
  .replace("__PS2P_LATIN__", F(`${fp}/press-start-2p/files/press-start-2p-latin-400-normal.woff2`))
  .replace("__PS2P_CYR__", F(`${fp}/press-start-2p/files/press-start-2p-cyrillic-400-normal.woff2`))
  .replace("__PIX_LATIN__", F(`${fp}/pixelify-sans/files/pixelify-sans-latin-700-normal.woff2`))
  .replace("__PIX_CYR__", F(`${fp}/pixelify-sans/files/pixelify-sans-cyrillic-700-normal.woff2`));
fs.mkdirSync(path.join(__dirname, "out"), { recursive: true });
const NAME = V2 ? "yarmak_intro_arcade" : "yarmak_intro";
const OUT = path.join(__dirname, `out/${NAME}.html`);
fs.writeFileSync(OUT, html);
console.log("html", (html.length / 1024).toFixed(0), "KB");
if (!process.argv.includes("--video")) process.exit(0);

const { chromium } = require("/opt/node22/lib/node_modules/playwright");
(async () => {
  const FPS = +(process.env.FPS || 60), DUR = V2 ? 12.0 : 9.0, OUTRO = V2 ? 10.4 : 7.9;
  const only = process.env.FRAMES ? process.env.FRAMES.split(",").map(Number) : null;
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--use-gl=swiftshader", "--autoplay-policy=no-user-gesture-required"] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on("console", (m) => console.log("page:", m.text()));
  await page.goto("file://" + OUT + "?capture=1");
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  if (only) {
    for (const t of only) {
      await page.evaluate((t) => window.renderFrame(t), t);
      const d = await page.evaluate(() => document.getElementById("c").toDataURL("image/png"));
      fs.writeFileSync(path.join(__dirname, `out/${V2 ? "v2_" : ""}frame_${t.toFixed(2)}.png`), Buffer.from(d.split(",")[1], "base64"));
    }
    await browser.close(); return;
  }
  const wav = await page.evaluate(([d, o]) => window.renderAudioWav(d, o), [DUR, OUTRO]);
  fs.writeFileSync(path.join(__dirname, `out/${NAME}.wav`), Buffer.from(wav, "base64"));
  const ff = spawn("ffmpeg", ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", "-i", path.join(__dirname, `out/${NAME}.wav`),
    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart",
    path.join(__dirname, `out/${NAME}.mp4`)], { stdio: ["pipe", "inherit", "pipe"] });
  let err = ""; ff.stderr.on("data", (d) => (err += d));
  const n = Math.round(DUR * FPS);
  for (let i = 0; i < n; i++) {
    const t = i / FPS;
    await page.evaluate((t) => window.renderFrame(t), t);
    const d = await page.evaluate(() => document.getElementById("c").toDataURL("image/png"));
    if (!ff.stdin.write(Buffer.from(d.split(",")[1], "base64"))) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 60 === 0) console.log("frame", i, "/", n);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  console.log(err.split("\n").slice(-4).join("\n"));
  await browser.close();
})();
