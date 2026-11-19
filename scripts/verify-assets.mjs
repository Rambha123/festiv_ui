import { readFile, readdir } from "node:fs/promises";
import { dirname, basename, join } from "node:path";
import { createHash } from "node:crypto";
const paths = [
  "assets/environments/Extinguished Diyas Beneath Temple Lights-1.png",
  "assets/environments/lit Basantapur Alley.png",
  "assets/environments/temple-courtyard.png",
  "assets/environments/Before Dawn at the Quiet Riverbank.png",
  "assets/environments/Worn River Steps Before Dawn.png",
  "assets/environments/Quiet Sunrise on the Riverbank.png",
  "assets/objects/diya-unlit-frontfacing.png",
  "assets/objects/diya-unlit-sidefacing.png",
];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const path of paths) {
  const source = await readFile(join("public", path));
  for (const folder of ["public", "dist"]) {
    if (!(await readdir(join(folder, dirname(path)))).includes(basename(path)))
      throw new Error(`Case mismatch: ${folder}/${path}`);
    if (hash(await readFile(join(folder, path))) !== hash(source))
      throw new Error(`Altered asset: ${folder}/${path}`);
  }
  for (const base of process.argv.slice(2)) {
    const url = new URL(
      path.split("/").map(encodeURIComponent).join("/"),
      base,
    );
    const response = await fetch(url);
    if (
      !response.ok ||
      !response.headers.get("content-type")?.includes("image/png")
    )
      throw new Error(`Failed image response: ${url} (${response.status})`);
    if (hash(Buffer.from(await response.arrayBuffer())) !== hash(source))
      throw new Error(`Response differs from original: ${url}`);
    console.log(`PASS ${url}`);
  }
}
console.log(
  `All ${paths.length} active artwork assets have exact casing and identical production bytes.`,
);
