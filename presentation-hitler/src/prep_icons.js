const fs = require("fs"), sharp = require("/root/deck2/node_modules/sharp");
const DIR = "/root/intro/node_modules/lucide-static/icons/";
const icons = { i_grudge: "file-x-2", i_ideas: "newspaper", i_war: "swords", i_defeat: "flag-off" };
(async () => {
  for (const [out, name] of Object.entries(icons)) {
    let svg = fs.readFileSync(DIR + name + ".svg", "utf8").replace(/<!--.*?-->/gs, "")
      .replace(/stroke="currentColor"/, 'stroke="#C9A15B"').replace(/stroke-width="2"/, 'stroke-width="1.6"')
      .replace(/width="24"/, 'width="256"').replace(/height="24"/, 'height="256"');
    await sharp(Buffer.from(svg)).png().toFile(`/root/deckwork/extra/${out}.png`);
  }
  console.log("icons ok");
})();
