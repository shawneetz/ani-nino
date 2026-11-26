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

  it("frees the left side when the panel is collapsed on desktop", () => {
    expect(mapPadding(1440, false).left).toBe(40);
    // the other sides do not change
    expect(mapPadding(1440, false).bottom).toBe(mapPadding(1440).bottom);
  });

  it("ignores the panel state on a phone", () => {
    expect(mapPadding(390, false)).toEqual(mapPadding(390, true));
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

  it("leaves more room at the bottom of a phone when the sheet is half open", () => {
    const peek = mapPadding(390, true, "peek", 844);
    const half = mapPadding(390, true, "half", 844);
    expect(half.bottom).toBeGreaterThan(peek.bottom);
    expect(half.top).toBe(peek.top);
    expect(half.left).toBe(peek.left);
  });

  it("treats the full sheet like the half sheet", () => {
    expect(mapPadding(390, true, "full", 844)).toEqual(mapPadding(390, true, "half", 844));
  });

  it("ignores the sheet size on desktop", () => {
    expect(mapPadding(1440, true, "half", 900)).toEqual(mapPadding(1440, true, "peek", 900));
  });

  it("frees the drawer width on the right on desktop", () => {
    expect(mapPadding(1440, true, "peek", 900, true).right).toBe(468);
    expect(mapPadding(1440, true, "peek", 900, false).right).toBe(72);
  });

  it("uses half-sheet bottom padding on a phone when the drawer is open", () => {
    expect(mapPadding(390, true, "peek", 844, true).bottom).toBe(mapPadding(390, true, "half", 844).bottom);
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