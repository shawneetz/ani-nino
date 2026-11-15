// what this file does: tests the ranking and filtering of related programs
import { describe, expect, it } from "vitest";
import { relatedPrograms, type RelatedInput } from "./related";

const make = (changes: Partial<RelatedInput> & { slug: string }): RelatedInput => ({
  topic: "land",
  startYear: 1972,
  places: [{ province: "laguna" }],
  ...changes,
});

const current = make({ slug: "current" });
const slugs = (items: RelatedInput[]) => items.map((item) => item.slug);

describe("relatedPrograms", () => {
  it("never includes the current program", () => {
    expect(slugs(relatedPrograms(current, [current, make({ slug: "other" })]))).toEqual(["other"]);
  });

  it("ranks same province and topic above province only above topic only", () => {
    const both = make({ slug: "both" });
    const provinceOnly = make({ slug: "province-only", topic: "markets" });
    const topicOnly = make({ slug: "topic-only", places: [{ province: "rizal" }] });
    const result = relatedPrograms(current, [topicOnly, provinceOnly, both]);
    expect(slugs(result)).toEqual(["both", "province-only", "topic-only"]);
  });

  it("drops programs that share neither province nor topic", () => {
    const unrelated = make({ slug: "unrelated", topic: "markets", places: [{ province: "quezon" }] });
    expect(relatedPrograms(current, [unrelated])).toEqual([]);
  });

  it("skips echo links in both directions", () => {
    const origin = make({ slug: "origin" });
    const today = make({ slug: "today", echoOf: "current" });
    const echoing = make({ slug: "echoing", echoOf: "origin" });
    const result = relatedPrograms({ ...current, echoOf: "origin" }, [origin, today, echoing]);
    expect(slugs(result)).toEqual(["echoing"]);
  });

  it("limits the result to 3 by default", () => {
    const many = ["a", "b", "c", "d", "e"].map((slug) => make({ slug }));
    expect(relatedPrograms(current, many)).toHaveLength(3);
  });

  it("breaks ties by start year then slug", () => {
    const late = make({ slug: "aaa", startYear: 1980 });
    const early = make({ slug: "zzz", startYear: 1973 });
    expect(slugs(relatedPrograms(current, [late, early]))).toEqual(["zzz", "aaa"]);
  });
});
