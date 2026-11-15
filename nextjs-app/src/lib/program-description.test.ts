// what this file does: tests the meta description rule for program pages
// covers short, long, abbreviation and empty text
import { describe, expect, it } from "vitest";
import { DESCRIPTION_MAX, programDescription } from "./program-description";

describe("programDescription", () => {
  it("uses only the first sentence", () => {
    expect(programDescription("Operation Land Transfer started in November 1972. Nine towns were chosen.")).toBe(
      "Operation Land Transfer started in November 1972.",
    );
  });

  it("keeps a short first sentence unchanged", () => {
    expect(programDescription("A short one.")).toBe("A short one.");
  });

  it("never goes over 160 characters and ends with an ellipsis", () => {
    // one very long sentence followed by a second one
    const long = `This sentence goes on ${"and on ".repeat(40)}forever. Second sentence.`;
    const result = programDescription(long);
    expect(result.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(result.endsWith("…")).toBe(true);
    expect(result).not.toContain("Second");
  });

  it("does not cut at an abbreviation", () => {
    expect(programDescription("The order covers land at Mt. Makiling. Another sentence follows.")).toBe(
      "The order covers land at Mt. Makiling.",
    );
  });

  it("returns an empty string for empty text", () => {
    expect(programDescription("   ")).toBe("");
  });
});
