import { describe, it, expect, vi } from "vitest";
import {
  chapterAt,
  clampProgress,
  assets,
  flameAnchors,
} from "./sceneManifest";
import { parseSaved, useJourney, openingState } from "../store/journeyStore";
describe("native journey mapping", () => {
  it("clamps invalid progress", () => {
    expect([NaN, Infinity, -1, 2].map(clampProgress)).toEqual([0, 0, 0, 1]);
  });
  it("maps boundaries and reverse travel", () => {
    expect([0, 0.119, 0.12, 0.819, 0.82, 1, 0.5, 0].map(chapterAt)).toEqual([
      0, 0, 1, 4, 4, 5, 2, 0,
    ]);
  });
  it("preserves filenames and uses independent flame anchors", () => {
    expect(assets.unlit).toContain(
      "Extinguished%20Diyas%20Beneath%20Temple%20Lights-1.png",
    );
    expect(assets.alley).toContain("lit%20Basantapur%20Alley.png");
    expect(flameAnchors.front).not.toEqual(flameAnchors.side);
  });
});
describe("persistent journey validation", () => {
  it("starts a fresh opening even when the first spark was saved as lit", () => {
    const saved = parseSaved(
      '{"lit":["first","alley-near-left"],"language":"ne","discovered":["light"]}',
    );
    expect(openingState(saved)).toEqual({
      lit: [],
      language: "ne",
      discovered: ["light"],
    });
    expect(saved.lit).toContain("first");
  });
  it("persists ignition and keeps environmental lamps on replay", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { setItem });
    useJourney.getState().light("first");
    useJourney.getState().light("court-left");
    useJourney.getState().replay();
    expect(useJourney.getState().lit).toEqual(["court-left"]);
    const [key, saved] = setItem.mock.calls.at(-1)!;
    expect(key).toBe("prakash-v1");
    expect(parseSaved(saved).lit).toEqual(["court-left"]);
    vi.unstubAllGlobals();
  });
  it("restores valid state", () => {
    expect(
      parseSaved(
        '{"lit":["first","court-left"],"discovered":["light"],"language":"ne"}',
      ),
    ).toEqual({
      lit: ["first", "court-left"],
      discovered: ["light"],
      language: "ne",
    });
  });
  it("filters unknown and malformed fields", () => {
    expect(
      parseSaved(
        '{"lit":[1,"unknown","alley"],"language":"xx","discovered":false}',
      ),
    ).toEqual({ lit: ["alley"], language: "en", discovered: [] });
  });
  it("rejects invalid JSON and null objects", () => {
    expect(() => parseSaved("{broken")).toThrow();
    expect(() => parseSaved("null")).toThrow();
  });
  it("supplies defaults", () => {
    expect(parseSaved(null)).toEqual({
      lit: [],
      discovered: [],
      language: "en",
    });
  });
});

import { openingDarkness } from "./lighting";
import { alleyLamps } from "../data/alleyLamps";
it("reveals the original artwork progressively and starts pitch black", () => {
  expect(openingDarkness([], false)).toBe(1);
  const levels = [0, 1, 2, 3, 4].map((n) => openingDarkness(["first", ...alleyLamps.slice(0, n).map((lamp) => lamp.id)], false));
  expect(levels[0]).toBeLessThan(1);
  expect(levels.at(-1)).toBe(0);
  expect(levels.every((value, i) => i === 0 || value < levels[i - 1])).toBe(true);
  expect(openingDarkness(["court-left"], false)).toBe(1);
  expect(openingDarkness([], true)).toBeLessThan(1);
});
it("validates and restores all courtyard lamps and cultural discoveries", () => {
  const lit = ["court-left", "court-right", "court-step-left", "court-step-right", "court-center"];
  const discovered = ["light", "garlands", "architecture", "courtyard", "offerings"];
  expect(parseSaved(JSON.stringify({ lit, discovered })).lit).toEqual(lit);
  expect(parseSaved(JSON.stringify({ discovered })).discovered).toEqual(discovered);
});
it("toggles courtyard lamps reversibly and ignores unknown IDs", () => {
  vi.stubGlobal("localStorage", { setItem: vi.fn() });
  useJourney.setState({ lit: [] });
  useJourney.getState().toggleLight("court-center");
  expect(useJourney.getState().lit).toEqual(["court-center"]);
  useJourney.getState().toggleLight("court-center");
  useJourney.getState().light("unknown");
  expect(useJourney.getState().lit).toEqual([]);
  vi.unstubAllGlobals();
});
