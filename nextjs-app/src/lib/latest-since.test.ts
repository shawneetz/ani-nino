// what this file does: tests the "from then to now" picker
import { describe, expect, it } from "vitest";
import { latestSince, type SinceProgram } from "./latest-since";

const source = { title: "A report", publisher: "A publisher", voice: "independent" } as const;

function make(slug: string, years: number[]): SinceProgram {
  return {
    slug,
    title: slug.toUpperCase(),
    since: years.map((year) => ({ year, text: `${slug} in ${year}`, source })),
  };
}

const years = (items: ReturnType<typeof latestSince>) => items.map((item) => item.year);

describe("latestSince", () => {
  it("skips entries before 2000", () => {
    expect(years(latestSince([make("a", [1988, 1999, 2000])]))).toEqual([2000]);
  });

  it("returns newest first across programs", () => {
    const result = latestSince([make("a", [2001, 2020]), make("b", [2012])]);
    expect(years(result)).toEqual([2020, 2012, 2001]);
  });

  it("limits the result to 4 by default", () => {
    const result = latestSince([make("a", [2001, 2002, 2003, 2004, 2005, 2006])]);
    expect(years(result)).toEqual([2006, 2005, 2004, 2003]);
  });

  it("breaks ties by program title", () => {
    const result = latestSince([make("zzz", [2010]), make("aaa", [2010])]);
    expect(result.map((item) => item.programSlug)).toEqual(["aaa", "zzz"]);
  });

  it("is empty when nothing qualifies", () => {
    expect(latestSince([make("a", [1988])])).toEqual([]);
    expect(latestSince([])).toEqual([]);
  });

  it("keeps the program link and the source label", () => {
    const [item] = latestSince([make("a", [2020])]);
    expect(item.programSlug).toBe("a");
    expect(item.programTitle).toBe("A");
    expect(item.source.voice).toBe("independent");
  });
});