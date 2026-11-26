import { isActiveInYear, visiblePrograms, type Filterable, type Filters } from "./filter";
import { FIRST_YEAR, LAST_YEAR } from "./vocab";

export interface YearCount {
  year: number;
  count: number;
}

export function yearCounts<T extends Filterable>(programs: T[], filters: Filters): YearCount[] {
  const pool = visiblePrograms(programs, { ...filters, year: null, today: false });
  return Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, index) => {
    const year = FIRST_YEAR + index;
    return { year, count: pool.filter((program) => isActiveInYear(program, year)).length };
  });
}
