import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const names = JSON.parse(await readFile("src/data/frames.json", "utf8"));
const sourceNames = await readdir("jpeg sequence");
const built = (await readdir("dist/assets")).filter((n) => n.endsWith(".jpg"));
const hash = (b) => createHash("sha256").update(b).digest("hex");
const hashes = new Set(
  await Promise.all(
    built.map(async (n) => hash(await readFile("dist/assets/" + n))),
  ),
);
for (const name of names) {
  if (!sourceNames.includes(name)) throw Error("Case mismatch " + name);
  if (!hashes.has(hash(await readFile("jpeg sequence/" + name))))
    throw Error("Missing production bytes " + name);
}
console.log(
  `PASS: ${names.length} exact source filenames and byte-identical production JPEGs (${built.length} distinct assets; Vite deduplicates identical frames).`,
);
