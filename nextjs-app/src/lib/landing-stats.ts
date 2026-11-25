// what this file does: pure helpers for the landing page, so they can be tested
//   landingstats     = the numbers strip, the province counts and the confirmed counts
//   provinceTileText = the honest line under a province name ("1 program, still checking")
//   timelinebar   = where a program's bar sits on the 1972 to 1986 strip (in percent)
// all of them reuse visibleprograms, so the landing page and the map never disagree
// change in this version (c9): added confirmedCounts and provinceTileText
import { EMPTY_FILTERS, visiblePrograms, type Filterable } from "./filter";
import { FIRST_YEAR, LAST_YEAR, PROVINCE_KEYS, type ProgramStatus, type Province } from "./vocab";

export type StatsProgram = Filterable & { status: ProgramStatus };

export type LandingStats = {
  programs: number; // martial-law programs only
  provincesCovered: number;
  provincesTotal: number;
  sources: number;
  checking: number; // martial-law programs still being checked
  provinceCounts: Record<Province, number>;
  confirmedCounts: Record<Province, number>; // how many of each province's programs are confirmed
};

export function landingStats(programs: StatsProgram[], sourceCount: number): LandingStats {
  // with no filters, visibleprograms returns the martial-law layer only
  const martialLaw = visiblePrograms(programs, EMPTY_FILTERS);

  const provinceCounts = {} as Record<Province, number>;
  const confirmedCounts = {} as Record<Province, number>;
  for (const province of PROVINCE_KEYS) {
    provinceCounts[province] = visiblePrograms(programs, { ...EMPTY_FILTERS, provinces: [province] }).length;
    // same filter plus "confirmed only", so the tile and the map agree
    confirmedCounts[province] = visiblePrograms(programs, {
      ...EMPTY_FILTERS,
      provinces: [province],
      confirmed: true,
    }).length;
  }

  return {
    programs: martialLaw.length,
    provincesCovered: PROVINCE_KEYS.filter((province) => provinceCounts[province] > 0).length,
    provincesTotal: PROVINCE_KEYS.length,
    sources: sourceCount,
    checking: martialLaw.filter((program) => program.status === "checking").length,
    provinceCounts,
    confirmedCounts,
  };
}

/**
 * Builds the line shown under a province name on the landing page.
 *
 * @remarks
 * The words say how solid the coverage is, so a thin province is never hidden.
 * "No program yet" is only for a province with no page at all.
 *
 * @param count - Martial-law programs that touch the province.
 * @param confirmed - How many of them are confirmed.
 * @returns For example "1 program, still checking" or "3 programs, 1 confirmed".
 */
export function provinceTileText(count: number, confirmed: number): string {
  if (count === 0) return "No program yet";
  if (confirmed === 0) return count === 1 ? "1 program, still checking" : `${count} programs, all still checking`;
  if (confirmed === count) return count === 1 ? "1 program, confirmed" : `${count} programs, all confirmed`;
  return `${count} programs, ${confirmed} confirmed`;
}

// the strip covers 1972 to 1986 inclusive, so it has 15 year slots
const SPAN = LAST_YEAR - FIRST_YEAR + 1;

// left edge and width of a bar, as percentages of the strip
// an open-ended program (endyear null) runs to the end of the strip
export function timelineBar(program: { startYear: number; endYear?: number | null }): {
  left: number;
  width: number;
} {
  const start = Math.max(program.startYear, FIRST_YEAR);
  const end = Math.min(program.endYear ?? LAST_YEAR, LAST_YEAR);
  return {
    left: ((start - FIRST_YEAR) / SPAN) * 100,
    width: (Math.max(end - start + 1, 1) / SPAN) * 100,
  };
}
