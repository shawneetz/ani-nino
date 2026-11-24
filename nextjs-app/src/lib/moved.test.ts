// what this file does: tests the moved-slug map and its lookup helper
import { describe, expect, it } from "vitest";
import { MOVED, movedTarget } from "./moved";

describe("movedTarget", () => {
  it("returns the live slug for a moved page", () => {
    expect(movedTarget("laguna-certificates-of-land-transfer")).toBe("laguna-operation-land-transfer");
    expect(movedTarget("laguna-lake-fishpens-today")).toBe("laguna-lake-fishpens");
  });

  it("returns null for a slug that never moved", () => {
    expect(movedTarget("laguna-operation-land-transfer")).toBeNull();
    expect(movedTarget("constructor")).toBeNull();
  });
});

describe("MOVED", () => {
  it("never points a slug at itself", () => {
    for (const [from, to] of Object.entries(MOVED)) expect(from).not.toBe(to);
  });

  it("has no redirect chains, so every target is a final page", () => {
    for (const target of Object.values(MOVED)) expect(movedTarget(target)).toBeNull();
  });
});
