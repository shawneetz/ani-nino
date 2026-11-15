// what this file does: tests the 160 character trim used by program metadata
import { describe, expect, it } from "vitest";
import { trimText } from "./trim-text";

describe("trimText", () => {
  it("returns short text unchanged", () => {
    expect(trimText("A short sentence.")).toBe("A short sentence.");
  });

  it("never returns more than the max length", () => {
    const long = "word ".repeat(100);
    expect(trimText(long, 160).length).toBeLessThanOrEqual(160);
  });

  it("cuts at a word edge and adds an ellipsis", () => {
    const result = trimText("one two three four five six", 15);
    expect(result.endsWith("…")).toBe(true);
    expect(result).toBe("one two three…");
  });

  it("hard cuts when there is no good space to cut at", () => {
    const result = trimText("a".repeat(200), 50);
    expect(result).toHaveLength(50);
    expect(result.endsWith("…")).toBe(true);
  });
});
