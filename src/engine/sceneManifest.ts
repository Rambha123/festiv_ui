const url = (path: string) =>
  `${import.meta.env.BASE_URL}${path.split("/").map(encodeURIComponent).join("/")}`;
export const assets = {
  unlit: url(
    "assets/environments/Extinguished Diyas Beneath Temple Lights-1.png",
  ),
  alley: url("assets/environments/lit Basantapur Alley.png"),
  courtyard: url("assets/environments/temple-courtyard.png"),
  front: url("assets/objects/diya-unlit-frontfacing.png"),
  side: url("assets/objects/diya-unlit-sidefacing.png"),
};
export const flameAnchors = {
  front: { left: "50%", top: "26%" },
  side: { left: "91%", top: "44%" },
};
export const chapters = [
  { start: 0, name: "The First Spark", ne: "पहिलो ज्योति" },
  { start: 0.12, name: "The Alley of Lights", ne: "उज्यालो गल्ली" },
  { start: 0.35, name: "The Courtyard of Lights", ne: "उज्यालो आँगन" },
  { start: 0.52, name: "Before the Dawn", ne: "बिहानीअघि" },
  { start: 0.68, name: "Arunodaya", ne: "अरुणोदय" },
  { start: 0.94, name: "Carry the Light", ne: "उज्यालो साथ लैजानुहोस्" },
];
export const clampProgress = (value: number) =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
export function chapterAt(value: number) {
  const p = clampProgress(value);
  return chapters.reduce(
    (result, chapter, index) => (p >= chapter.start ? index : result),
    0,
  );
}
