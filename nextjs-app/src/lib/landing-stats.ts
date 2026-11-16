// what this file does: pure helpers for the landing page, so they can be tested
//   landingstats  = the numbers strip and the province counts
//   timelinebar   = where a program's bar sits on the 1972 to 1986 strip (in percent)
// both reuse visibleprograms, so the landing page and the map never disagree
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
};

export function landingStats(programs: StatsProgram[], sourceCount: number): LandingStats {
  // with no filters, visibleprograms returns the martial-law layer only
  const martialLaw = visiblePrograms(programs, EMPTY_FILTERS);

  const provinceCounts = {} as Record<Province, number>;
  for (const province of PROVINCE_KEYS) {
    provinceCounts[province] = visiblePrograms(programs, { ...EMPTY_FILTERS, provinces: [province] }).length;
  }

  return {
    programs: martialLaw.length,
    provincesCovered: PROVINCE_KEYS.filter((province) => provinceCounts[province] > 0).length,
    provincesTotal: PROVINCE_KEYS.length,
    sources: sourceCount,
    checking: martialLaw.filter((program) => program.status === "checking").length,
    provinceCounts,
  };
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
