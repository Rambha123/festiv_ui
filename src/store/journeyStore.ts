import { create } from "zustand";
export type Language = "en" | "ne";
export interface SavedJourney {
  lit: string[];
  discovered: string[];
  language: Language;
}
export const defaults: SavedJourney = {
  lit: [],
  discovered: [],
  language: "en",
};
const lampIds = [
  "first",
  "alley",
  "alley-near-left",
  "alley-near-right",
  "alley-mid-right",
  "court-left",
  "court-right",
  "court-step-left",
  "court-step-right",
  "court-center",
];
export const openingState = (saved: SavedJourney): SavedJourney => ({
  ...saved,
  lit: [],
});
export function parseSaved(raw: string | null): SavedJourney {
  if (!raw) return { ...defaults };
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== "object")
    throw new Error("Saved journey must be an object.");
  const value = data as Record<string, unknown>;
  return {
    lit: Array.isArray(value.lit)
      ? value.lit.filter(
          (id): id is string => typeof id === "string" && lampIds.includes(id),
        )
      : [],
    discovered: Array.isArray(value.discovered)
      ? value.discovered.filter(
          (id): id is string =>
            typeof id === "string" &&
            ["light", "architecture", "courtyard", "garlands", "offerings", "riverbank", "riversteps"].includes(id),
        )
      : [],
    language: value.language === "ne" ? "ne" : "en",
  };
}
let initial = defaults;
let storageError = "";
try {
  if (typeof window !== "undefined")
    initial = openingState(parseSaved(localStorage.getItem("prakash-v1")));
} catch (error) {
  storageError =
    "Saved progress could not be read. You can continue with a fresh journey.";
  console.warn("[PRAKASH] Could not restore progress.", error);
}
interface Journey extends SavedJourney {
  storageError: string;
  light: (id: string) => void;
  toggleLight: (id: string) => void;
  discover: (id: string) => void;
  setLanguage: (language: Language) => void;
  replay: () => void;
}
export const useJourney = create<Journey>((set) => ({
  ...initial,
  storageError,
  light: (id) =>
    set((s) => ({ lit: !lampIds.includes(id) || s.lit.includes(id) ? s.lit : [...s.lit, id] })),
  toggleLight: (id) => set((s) => ({
    lit: !lampIds.includes(id) ? s.lit : s.lit.includes(id)
      ? s.lit.filter((lamp) => lamp !== id) : [...s.lit, id],
  })),
  discover: (id) =>
    set((s) => ({
      discovered: s.discovered.includes(id)
        ? s.discovered
        : [...s.discovered, id],
    })),
  setLanguage: (language) => set({ language }),
  replay: () => set((s) => ({ lit: s.lit.filter((id) => id !== "first") })),
}));
useJourney.subscribe((state) => {
  try {
    localStorage.setItem(
      "prakash-v1",
      JSON.stringify({
        lit: state.lit,
        discovered: state.discovered,
        language: state.language,
      }),
    );
  } catch (error) {
    if (!state.storageError) {
      console.warn("[PRAKASH] Could not save progress.", error);
      useJourney.setState({
        storageError:
          "Progress cannot be saved on this device. Your current journey still works.",
      });
    }
  }
});
