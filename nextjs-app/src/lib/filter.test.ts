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
  { slug: "yulo", topic: "land", status: "confirmed", startYear: 1972, endYear: null, places: [{ province: "laguna" }] },
  { slug: "kkk", topic: "support", status: "checking", startYear: 1981, endYear: 1986, places: [{ province: "laguna" }] },
  { slug: "levy", topic: "markets", status: "checking", startYear: 1973, endYear: null, places: [{ province: "quezon" }] },
  { slug: "dam", topic: "displacement", status: "checking", startYear: 1979, endYear: null, places: [{ province: "rizal" }, { province: "quezon" }] },
  { slug: "yulo-today", topic: "land", era: "today", status: "confirmed", startYear: 2010, endYear: 2021, places: [{ province: "laguna" }] },
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

  it("keeps only confirmed programs when confirmed only is on", () => {
    expect(slugs(visiblePrograms(programs, filters({ confirmed: true })))).toEqual(["yulo"]);
  });

  it("applies confirmed only to the today layer too", () => {
    expect(slugs(visiblePrograms(programs, filters({ confirmed: true, today: true })))).toEqual(["yulo", "yulo-today"]);
  });

  it("combines confirmed only with the other filters", () => {
    expect(slugs(visiblePrograms(programs, filters({ confirmed: true, topics: ["support"] })))).toEqual([]);
    expect(slugs(visiblePrograms(programs, filters({ confirmed: true, provinces: ["laguna"] })))).toEqual(["yulo"]);
  });

  it("hides a program with no status when confirmed only is on", () => {
    const noStatus: TestProgram[] = [{ ...programs[0], status: undefined }];
    expect(visiblePrograms(noStatus, filters({ confirmed: true }))).toEqual([]);
    expect(visiblePrograms(noStatus, EMPTY_FILTERS)).toHaveLength(1);
  });
});

describe("yearRange and URL helpers", () => {
  it("formats open, single-year and closed ranges", () => {
    expect(yearRange({ startYear: 1972, endYear: null })).toBe("1972 onward");
    expect(yearRange({ startYear: 1975, endYear: 1975 })).toBe("1975");
    expect(yearRange({ startYear: 1981, endYear: 1986 })).toBe("1981 to 1986");
  });

  it("ignores invalid URL values and removes duplicates", () => {
    expect(parseFilters(new URLSearchParams("year=1900&topic=land,land,sports&province=mars&confirmed=yes"))).toEqual({
      year: null,
      topics: ["land"],
      provinces: [],
      today: false,
      confirmed: false,
    });
  });

  it("round-trips filters through a readable query string", () => {
    const value: Filters = { year: 1980, topics: ["land"], provinces: ["laguna", "rizal"], today: true, confirmed: true };
    const query = toQueryString(value);
    expect(query).toBe("year=1980&topic=land&province=laguna,rizal&today=1&confirmed=1");
    expect(parseFilters(new URLSearchParams(query))).toEqual(value);
  });

  it("writes only the confirmed key when nothing else is set", () => {
    expect(toQueryString(filters({ confirmed: true }))).toBe("confirmed=1");
    expect(parseFilters(new URLSearchParams("confirmed=1")).confirmed).toBe(true);
  });
});
