import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, type Filterable } from "./filter";
import { yearCounts } from "./year-counts";

const programs: Filterable[] = [
  { topic: "land", status: "confirmed", startYear: 1972, endYear: null, places: [{ province: "laguna" }] },
  { topic: "support", status: "checking", startYear: 1981, endYear: 1986, places: [{ province: "laguna" }] },
  { topic: "markets", status: "checking", startYear: 1975, endYear: 1975, places: [{ province: "quezon" }] },
  { topic: "land", era: "today", status: "confirmed", startYear: 2010, endYear: 2021, places: [{ province: "laguna" }] },
];

describe("yearCounts", () => {
  it("returns 15 years and counts ranges inclusively", () => {
    const result = yearCounts(programs, EMPTY_FILTERS);
    expect(result).toHaveLength(15);
    expect(result[0].year).toBe(1972);
    expect(result[14].year).toBe(1986);
    expect(result.find((item) => item.year === 1972)?.count).toBe(1);
    expect(result.find((item) => item.year === 1975)?.count).toBe(2);
    expect(result.find((item) => item.year === 1986)?.count).toBe(2);
  });

  it("ignores year and today while applying topic, province and confirmed", () => {
    expect(yearCounts(programs, { ...EMPTY_FILTERS, year: 1990 as never, today: true }).find((item) => item.year === 1975)?.count).toBe(2);
    expect(yearCounts(programs, { ...EMPTY_FILTERS, topics: ["support"] }).find((item) => item.year === 1981)?.count).toBe(1);
    expect(yearCounts(programs, { ...EMPTY_FILTERS, provinces: ["quezon"] }).find((item) => item.year === 1975)?.count).toBe(1);
  });
});
