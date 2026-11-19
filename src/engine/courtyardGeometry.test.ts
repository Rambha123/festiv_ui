import { describe, expect, it } from "vitest";
import { courtyardFrame, inspectionTransform, revealTransform } from "./courtyardGeometry";
import { courtyardHotspots } from "../data/courtyardHotspots";

describe("courtyard artwork coordinates", () => {
  it.each([[1827, 672], [1440, 900], [390, 844], [320, 568]])("reveals every full keyboard target in the %i × %i crop", (width, height) => {
    const frame = courtyardFrame(width, height);
    for (const spot of courtyardHotspots) {
      const look = revealTransform(frame, spot.x, spot.y);
      const x = frame.left + spot.x * frame.width + look.x;
      const y = frame.top + spot.y * frame.height + look.y;
      expect(x).toBeGreaterThanOrEqual(24);
      expect(x).toBeLessThanOrEqual(width - 24);
      expect(y).toBeGreaterThanOrEqual(24);
      expect(y).toBeLessThanOrEqual(height - 24);
      expect(frame.left + look.x).toBeLessThanOrEqual(0.001);
      expect(frame.top + look.y).toBeLessThanOrEqual(0.001);
      expect(frame.left + look.x + frame.width).toBeGreaterThanOrEqual(width - 0.001);
      expect(frame.top + look.y + frame.height).toBeGreaterThanOrEqual(height - 0.001);
    }
  });
  it.each([[1440, 900], [390, 844], [1920, 700]])("covers the %i × %i viewport without moving hotspot anchors away from artwork", (width, height) => {
    const frame = courtyardFrame(width, height);
    expect(frame.width).toBeGreaterThan(width);
    expect(frame.height).toBeGreaterThan(height);
    expect(frame.width / frame.height).toBeCloseTo(1672 / 941);
    expect(frame.left).toBeLessThanOrEqual(0);
    expect(frame.top).toBeLessThanOrEqual(0);
    expect(frame.left + frame.width).toBeGreaterThan(width);
    expect(frame.top + frame.height).toBeGreaterThan(height);
  });

  it.each([[1440, 900], [390, 844]])("keeps artwork covering viewport when inspecting an edge object at %i × %i", (width, height) => {
    const frame = courtyardFrame(width, height);
    for (const [x, y] of [[0.066, 0.518], [0.71, 0.667], [0.128, 0.888]]) {
      const transform = inspectionTransform(frame, x, y);
      expect(frame.left + transform.x).toBeLessThanOrEqual(0);
      expect(frame.top + transform.y).toBeLessThanOrEqual(0);
      expect(frame.left + transform.x + frame.width * transform.scale).toBeGreaterThanOrEqual(width - 0.001);
      expect(frame.top + transform.y + frame.height * transform.scale).toBeGreaterThanOrEqual(height - 0.001);
    }
  });
});
