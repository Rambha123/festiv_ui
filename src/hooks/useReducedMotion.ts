import { useEffect, useState } from "react";

const preference = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export function useReducedMotion() {
  const [systemReduced, setSystemReduced] = useState(preference);
  const [override, setOverride] = useState<boolean | null>(null);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setSystemReduced(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  const reduced = override ?? systemReduced;
  return {
    reduced,
    toggleMotion: () => setOverride(!reduced),
    resetMotion: () => setOverride(null),
  };
}
