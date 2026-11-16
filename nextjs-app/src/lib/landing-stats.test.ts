// what this file does: tests the landing numbers, province counts and timeline bars
import { describe, expect, it } from "vitest";
import { landingStats, timelineBar, type StatsProgram } from "./landing-stats";

const programs: StatsProgram[] = [
  { topic: "land", status: "confirmed", startYear: 1972, endYear: null, places: [{ province: "laguna" }] },
  { topic: "support", status: "checking", startYear: 1981, endYear: 1986, places: [{ province: "laguna" }] },
  { topic: "displacement", status: "checking", startYear: 1979, endYear: null, places: [{ province: "rizal" }, { province: "quezon" }] },
  // a today program must not be counted
  { topic: "land", status: "checking", era: "today", startYear: 2010, endYear: 2021, places: [{ province: "batangas" }] },
];

describe("landingStats", () => {
  it("counts martial-law programs only", () => {
    const stats = landingStats(programs, 9);
    expect(stats.programs).toBe(3);
    expect(stats.checking).toBe(2);
    expect(stats.sources).toBe(9);
  });

  it("counts programs per province and the provinces covered", () => {
    const stats = landingStats(programs, 0);
    expect(stats.provinceCounts).toEqual({ cavite: 0, laguna: 2, batangas: 0, rizal: 1, quezon: 1 });
    expect(stats.provincesCovered).toBe(3);
    expect(stats.provincesTotal).toBe(5);
  });
});

describe("timelineBar", () => {
  it("fills the strip for a program that runs the whole time", () => {
    expect(timelineBar({ startYear: 1972, endYear: null })).toEqual({ left: 0, width: 100 });
  });

  it("places a closed range by year slots", () => {
    const bar = timelineBar({ startYear: 1981, endYear: 1986 });
    expect(bar.left).toBeCloseTo(60);
    expect(bar.width).toBeCloseTo(40);
  });

  it("gives a single year one slot", () => {
    const bar = timelineBar({ startYear: 1975, endYear: 1975 });
    expect(bar.left).toBeCloseTo(20);
    expect(bar.width).toBeCloseTo(100 / 15);
  });
});
