import { alleyLamps } from "../data/alleyLamps";

// Opacity compositing preserves the original artwork at full illumination.
export function openingDarkness(lit: readonly string[], continued: boolean) {
  if (!lit.includes("first") && !continued) return 1;
  const count = alleyLamps.filter((lamp) => lit.includes(lamp.id)).length;
  return 0.64 * (1 - count / alleyLamps.length);
}
