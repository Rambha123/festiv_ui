// Permanent experience setting: full motion remains enabled across reloads and replay.
export function useReducedMotion() {
  return { reduced: false } as const;
}
