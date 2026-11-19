export type RiverScene = "riverbank" | "riversteps" | "offerings" | null;

// Activate a detail only once its artwork is visible through the transition.
export function riverSceneAt(progress: number): RiverScene {
  if (progress < 0.61 || progress >= 0.94 || !Number.isFinite(progress)) return null;
  if (progress < 0.79) return "riverbank";
  if (progress < 0.89) return "riversteps";
  return "offerings";
}
