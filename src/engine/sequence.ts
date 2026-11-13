import filenames from "../data/frames.json";
const urls = import.meta.glob("../../jpeg sequence/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
export const frames = filenames.map((name) => ({
  name,
  url: urls[`../../jpeg sequence/${name}`],
}));
export const cues = [
  { p: 0.16, frame: 0 },
  { p: 0.35, frame: 74 },
  { p: 0.52, frame: 129 },
  { p: 0.68, frame: 174 },
  { p: 0.94, frame: 299 },
  { p: 1, frame: 299 },
];
export function frameAt(p: number) {
  if (!Number.isFinite(p) || p <= cues[0].p) return 0;
  for (let i = 1; i < cues.length; i++) {
    if (p <= cues[i].p) {
      const a = cues[i - 1],
        b = cues[i];
      return Math.round(
        a.frame + ((b.frame - a.frame) * (p - a.p)) / (b.p - a.p),
      );
    }
  }
  return frames.length - 1;
}
