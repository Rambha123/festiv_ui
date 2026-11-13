import { useState } from "react";
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  return {
    reduced,
    toggleMotion: () => setReduced((value) => !value),
    resetMotion: () => setReduced(false),
  };
}
