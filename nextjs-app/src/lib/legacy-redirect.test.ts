// what this file does: tests that old filter links map to /map and plain links do not
import { describe, expect, it } from "vitest";
import { legacyRedirect } from "./legacy-redirect";

describe("legacyRedirect", () => {
  it("returns null when there are no filters", () => {
    expect(legacyRedirect({})).toBeNull();
    expect(legacyRedirect({ utm_source: "chat" })).toBeNull();
    expect(legacyRedirect({ year: "" })).toBeNull();
  });

  it("keeps every filter in a stable order", () => {
    expect(legacyRedirect({ province: "laguna", topic: "land" })).toBe("/map?topic=land&province=laguna");
    expect(legacyRedirect({ today: "1", year: "1980" })).toBe("/map?year=1980&today=1");
  });

  it("keeps commas readable and uses the first repeated value", () => {
    expect(legacyRedirect({ topic: "land,support" })).toBe("/map?topic=land,support");
    expect(legacyRedirect({ topic: ["land", "markets"] })).toBe("/map?topic=land");
  });
});
