// what this file does: tests firstsentence with plain, abbreviation and long texts
import { describe, expect, it } from "vitest";
import { firstSentence } from "./first-sentence";

describe("firstSentence", () => {
  it("returns the first sentence of a paragraph", () => {
    expect(firstSentence("Operation Land Transfer started in November 1972. Nine towns were chosen.")).toBe(
      "Operation Land Transfer started in November 1972.",
    );
  });

  it("does not stop at abbreviations", () => {
    expect(firstSentence("The order covers land at Mt. Makiling. Another sentence follows.")).toBe(
      "The order covers land at Mt. Makiling.",
    );
    expect(firstSentence("See G.R. No. 152797 for details. More text.")).toBe("See G.R. No. 152797 for details.");
  });

  it("does not stop at a full stop followed by a lowercase word", () => {
    expect(firstSentence("Roxas and Co. later cited it. Next sentence.")).toBe("Roxas and Co. later cited it.");
  });

  it("returns the whole text when there is only one sentence", () => {
    expect(firstSentence("Just one sentence without a final mark")).toBe("Just one sentence without a final mark");
  });

  it("trims long sentences at a word boundary with an ellipsis", () => {
    const result = firstSentence("This sentence is much longer than the limit we set for it today.", 30);
    expect(result.length).toBeLessThanOrEqual(30);
    expect(result.endsWith("…")).toBe(true);
  });

  it("handles empty text", () => {
    expect(firstSentence("   ")).toBe("");
  });
});
