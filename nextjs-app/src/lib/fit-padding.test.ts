// what this file does: tests the map fit padding helpers
import { describe, expect, it } from "vitest";
import { clampPadding, DEFAULT_FIT_PADDING, mapPadding } from "./fit-padding";

describe("mapPadding", () => {
  it("keeps the left free for the panel on desktop", () => {
    // 30vw of 1440 is 432, between the 360 and 468 limits, plus 12 edge and 24 gap
    expect(mapPadding(1440).left).toBe(468);
  });

  it("uses the minimum panel width on a narrow desktop", () => {
    // 20rem = 360, plus 36
    expect(mapPadding(1024).left).toBe(396);
  });

  it("uses the maximum panel width on a wide desktop", () => {
    // 26rem = 468, plus 36
    expect(mapPadding(2000).left).toBe(504);
  });

  it("leaves the sides free on a phone and keeps room top and bottom", () => {
    const phone = mapPadding(390);
    expect(phone.left).toBe(phone.right);
    expect(phone.top).toBeGreaterThan(0);
    expect(phone.bottom).toBeGreaterThan(phone.top);
  });

  it("switches layout at 1024px", () => {
    expect(mapPadding(1023).left).toBe(40);
    expect(mapPadding(1024).left).toBeGreaterThan(300);
  });
});

describe("clampPadding", () => {
  it("returns the padding unchanged when it fits", () => {
    expect(clampPadding(DEFAULT_FIT_PADDING, 800, 600)).toEqual(DEFAULT_FIT_PADDING);
  });

  it("scales one axis down without touching the other", () => {
    const result = clampPadding({ top: 50, right: 300, bottom: 50, left: 500 }, 500, 600);
    // 380px of width can be padded, 800 was asked for
    expect(result.left + result.right).toBeLessThanOrEqual(380);
    expect(result.top).toBe(50);
    expect(result.bottom).toBe(50);
  });

  it("keeps at least 120px free on both axes", () => {
    const result = clampPadding({ top: 400, right: 400, bottom: 400, left: 400 }, 300, 300);
    expect(300 - (result.left + result.right)).toBeGreaterThanOrEqual(120 - 2);
    expect(300 - (result.top + result.bottom)).toBeGreaterThanOrEqual(120 - 2);
  });

  it("never returns a negative padding on a tiny canvas", () => {
    const result = clampPadding({ top: 100, right: 100, bottom: 100, left: 100 }, 50, 50);
    for (const side of Object.values(result)) expect(side).toBeGreaterThanOrEqual(0);
  });
});
