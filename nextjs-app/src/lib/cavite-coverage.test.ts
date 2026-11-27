// what this file does: keeps the cavite coverage text and the cavite pages honest (stages n6 and n8)
//   the gap text may not claim a count or call the province thin once it has more pages
//   every live cavite page needs a named place, a sourced effect and a standalone first sentence
// it reads the real content/ folder, so it fails when a page or the gap drifts from the rules
import { beforeAll, describe, expect, it } from "vitest";
import { landingStats } from "./landing-stats";
import { loadContent, type Content } from "./load-content";
import { splitFirstSentence } from "./split-first-sentence";

// a claim about how many pages exist, such as "one program" or "no page"
const COUNT_CLAIM =
  /\b(?:\d+|one|two|three|four|five)\s+(?:live\s+|confirmed\s+)?(?:programs?|pages?)\b|\bno\s+(?:live\s+)?(?:programs?|pages?)\b/i;

// a lead sentence that starts with a pronoun cannot stand alone
const DANGLING_START = /^(?:it|this|these|they|that|he|she)\b/i;

// the lead line fits about 25 words, this leaves a little room
const LEAD_MAX_WORDS = 30;

let content: Content;

beforeAll(async () => {
  content = await loadContent("content");
});

describe("cavite gap text", () => {
  it("keeps its anchor id and states no count", () => {
    const gap = content.gaps.find((item) => item.id === "cavite-not-covered");
    expect(gap).toBeDefined();
    expect(`${gap!.title} ${gap!.description}`).not.toMatch(COUNT_CLAIM);
  });

  it("does not call cavite thin once it has more than one program", () => {
    const stats = landingStats(content.programs, content.sources.length);
    // the about page lists a province as thin at one program or fewer
    if (stats.provinceCounts.cavite < 2) return;

    const gap = content.gaps.find((item) => item.id === "cavite-not-covered");
    expect(`${gap!.title} ${gap!.description}`).not.toMatch(/\bthin(?:ly)?\b/i);
  });
});

describe("live cavite pages", () => {
  it("has at least one live cavite page", () => {
    const cavite = content.programs.filter((program) => program.places.some((place) => place.province === "cavite"));
    expect(cavite.length).toBeGreaterThan(0);
  });

  it("gives each one a named place, a sourced effect and a standalone first sentence", () => {
    const cavite = content.programs.filter((program) => program.places.some((place) => place.province === "cavite"));

    for (const program of cavite) {
      expect(
        program.places.some((place) => place.province === "cavite" && place.name.trim() !== ""),
        `${program.slug}: needs a named cavite place`,
      ).toBe(true);

      expect(
        program.sources.some((source) => source.backs === "happened" && source.url),
        `${program.slug}: needs a linked source that backs what happened`,
      ).toBe(true);

      const { first } = splitFirstSentence(program.happened);
      expect(first.endsWith("."), `${program.slug}: first sentence should end with a full stop`).toBe(true);
      expect(first.split(/\s+/).length, `${program.slug}: first sentence is too long`).toBeLessThanOrEqual(LEAD_MAX_WORDS);
      expect(first, `${program.slug}: first sentence cannot start with a pronoun`).not.toMatch(DANGLING_START);
    }
  });
});
