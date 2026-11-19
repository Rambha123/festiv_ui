import { expect, it } from "vitest";
import { riverSceneAt } from "./riverScene";
import { discoveries } from "../data/discoveries";
import { parseSaved } from "../store/journeyStore";

it("enables only the visible river detail through forward and reverse travel", () => {
  expect([0.52, 0.609, 0.61, 0.789, 0.79, 0.889, 0.89, 0.94, 0.8, 0.7, NaN].map(riverSceneAt))
    .toEqual([null, null, "riverbank", "riverbank", "riversteps", "riversteps", "offerings", null, "riversteps", "riverbank", null]);
});

it("provides and persists the river discoveries", () => {
  const ids = ["riverbank", "riversteps", "offerings"];
  for (const id of ids) expect(discoveries.find((entry) => entry.id === id)?.text).toBeTruthy();
  expect(parseSaved(JSON.stringify({ discovered: ids })).discovered).toEqual(ids);
});
