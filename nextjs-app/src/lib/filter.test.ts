// What this file does: tests year, topic, province, today-layer and URL filter behavior.
import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTERS,
  isActiveInYear,
  parseFilters,
  toQueryString,
  visiblePrograms,
  yearRange,
  type Filterable,
  type Filters,
} from "./filter";

type TestProgram = Filterable & { slug: string };
const programs: TestProgram[] = [
  { slug: "yulo", topic: "land", startYear: 1972, endYear: null, places: [{ province: "laguna" }] },
  { slug: "kkk", topic: "support", startYear: 1981, endYear: 1986, places: [{ province: "laguna" }] },
  { slug: "levy", topic: "markets", startYear: 1973, endYear: null, places: [{ province: "quezon" }] },
  { slug: "dam", topic: "displacement", startYear: 1979, endYear: null, places: [{ province: "rizal" }, { province: "quezon" }] },
  { slug: "yulo-today", topic: "land", era: "today", startYear: 2010, endYear: 2021, places: [{ province: "laguna" }] },
];
const filters = (changes: Partial<Filters>): Filters => ({ ...EMPTY_FILTERS, ...changes });
const slugs = (items: TestProgram[]) => items.map((program) => program.slug);

describe("visiblePrograms", () => {
  it("returns all programs without filters", () => {
    expect(slugs(visiblePrograms(programs, EMPTY_FILTERS))).toEqual(["yulo", "kkk", "levy", "dam"]);
  });

  it("shows today programs when the switch is on, even with a year selected", () => {
    expect(slugs(visiblePrograms(programs, filters({ today: true })))).toContain("yulo-today");
    expect(slugs(visiblePrograms(programs, filters({ today: true, year: 1972 })))).toEqual(["yulo", "yulo-today"]);
  });

  it("matches inclusive and open-ended year ranges", () => {
    expect(isActiveInYear(programs[1], 1981)).toBe(true);
    expect(isActiveInYear(programs[1], 1986)).toBe(true);
    expect(isActiveInYear(programs[1], 1980)).toBe(false);
    expect(isActiveInYear(programs[0], 1986)).toBe(true);
    expect(slugs(visiblePrograms(programs, filters({ year: 1972 })))).toEqual(["yulo"]);
  });

  it("combines topic and province filters with AND", () => {
    expect(slugs(visiblePrograms(programs, filters({ topics: ["land", "support"] })))).toEqual(["yulo", "kkk"]);
    expect(slugs(visiblePrograms(programs, filters({ provinces: ["quezon"] })))).toEqual(["levy", "dam"]);
    expect(slugs(visiblePrograms(programs, filters({ topics: ["support"], provinces: ["quezon"] })))).toEqual([]);
  });
});

describe("yearRange and URL helpers", () => {
  it("formats open, single-year and closed ranges", () => {
    expect(yearRange({ startYear: 1972, endYear: null })).toBe("1972 onward");
    expect(yearRange({ startYear: 1975, endYear: 1975 })).toBe("1975");
    expect(yearRange({ startYear: 1981, endYear: 1986 })).toBe("1981 to 1986");
  });

  it("ignores invalid URL values and removes duplicates", () => {
    expect(parseFilters(new URLSearchParams("year=1900&topic=land,land,sports&province=mars"))).toEqual({
      year: null,
      topics: ["land"],
      provinces: [],
      today: false,
    });
  });

  it("round-trips filters through a readable query string", () => {
    const value: Filters = { year: 1980, topics: ["land"], provinces: ["laguna", "rizal"], today: true };
    const query = toQueryString(value);
    expect(query).toBe("year=1980&topic=land&province=laguna,rizal&today=1");
    expect(parseFilters(new URLSearchParams(query))).toEqual(value);
  });
});
