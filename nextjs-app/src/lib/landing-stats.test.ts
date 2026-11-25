// what this file does: tests the landing numbers, province counts, tile text and timeline bars
import { describe, expect, it } from "vitest";
import { landingStats, provinceTileText, timelineBar, type StatsProgram } from "./landing-stats";

const programs: StatsProgram[] = [
  { topic: "land", status: "confirmed", startYear: 1972, endYear: null, places: [{ province: "laguna" }] },
  { topic: "support", status: "checking", startYear: 1981, endYear: 1986, places: [{ province: "laguna" }] },
  { topic: "displacement", status: "checking", startYear: 1979, endYear: null, places: [{ province: "rizal" }, { province: "quezon" }] },
  // a today program must not be counted
  { topic: "land", status: "confirmed", era: "today", startYear: 2010, endYear: 2021, places: [{ province: "batangas" }] },
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

  it("counts confirmed programs per province and skips the today layer", () => {
    expect(landingStats(programs, 0).confirmedCounts).toEqual({
      cavite: 0,
      laguna: 1,
      batangas: 0,
      rizal: 0,
      quezon: 0,
    });
  });
});

describe("provinceTileText", () => {
  it("says no program yet only when the province has no page", () => {
    expect(provinceTileText(0, 0)).toBe("No program yet");
  });

  it("says still checking for a thin province with nothing confirmed", () => {
    expect(provinceTileText(1, 0)).toBe("1 program, still checking");
    expect(provinceTileText(2, 0)).toBe("2 programs, all still checking");
  });

  it("says confirmed when every program is confirmed", () => {
    expect(provinceTileText(1, 1)).toBe("1 program, confirmed");
    expect(provinceTileText(3, 3)).toBe("3 programs, all confirmed");
  });

  it("gives the confirmed count when the mix is uneven", () => {
    expect(provinceTileText(3, 1)).toBe("3 programs, 1 confirmed");
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
