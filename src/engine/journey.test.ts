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

import { frameAt, frames } from "./sequence";
it("maps actual numeric sequence cues reversibly", () => {
  expect(frames).toHaveLength(300);
  expect(frames[0].name).toBe("ezgif-frame-001.jpg");
  expect([0.16, 0.35, 0.52, 0.68, 0.94, 0.35].map(frameAt)).toEqual([
    0, 74, 129, 174, 299, 74,
  ]);
});
