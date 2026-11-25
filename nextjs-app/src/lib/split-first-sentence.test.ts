// what this file does: tests the lead sentence split
import { describe, expect, it } from "vitest";
import { splitFirstSentence } from "./split-first-sentence";

describe("splitFirstSentence", () => {
  it("splits after the first sentence", () => {
    expect(splitFirstSentence("Operation Land Transfer started in November 1972. Nine towns were chosen.")).toEqual({
      first: "Operation Land Transfer started in November 1972.",
      rest: "Nine towns were chosen.",
    });
  });

  it("does not cut at Mt.", () => {
    expect(splitFirstSentence("The order covers land at Mt. Makiling. Another sentence follows.")).toEqual({
      first: "The order covers land at Mt. Makiling.",
      rest: "Another sentence follows.",
    });
  });

  it("does not cut at G.R. or No.", () => {
    const result = splitFirstSentence("See G.R. No. 152797 for details. More text.");
    expect(result.first).toBe("See G.R. No. 152797 for details.");
    expect(result.rest).toBe("More text.");
  });

  it("returns an empty rest for one sentence", () => {
    expect(splitFirstSentence("Just one sentence.")).toEqual({ first: "Just one sentence.", rest: "" });
    expect(splitFirstSentence("No final mark")).toEqual({ first: "No final mark", rest: "" });
  });

  it("does not shorten a long first sentence", () => {
    const long = `${"word ".repeat(80)}end. Next one.`;
    expect(splitFirstSentence(long).first.endsWith("end.")).toBe(true);
  });

  it("handles empty text and collapses line breaks", () => {
    expect(splitFirstSentence("   ")).toEqual({ first: "", rest: "" });
    expect(splitFirstSentence("One\n sentence.  Two.")).toEqual({ first: "One sentence.", rest: "Two." });
  });
});