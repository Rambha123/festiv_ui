import { readdirSync, writeFileSync } from "node:fs";
const files = readdirSync("jpeg sequence")
  .filter((n) => /^ezgif-frame-\d+\.jpe?g$/i.test(n))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
writeFileSync("src/data/frames.json", JSON.stringify(files, null, 2));
