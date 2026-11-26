// what this file does: counts live content straight from content/*.yaml
// so e2e tests never hardcode how many programs, charts or dated records exist,
// adding or cutting a page in content/ then needs no test edit
// it runs in node (playwright), never in the browser
// a program without an era counts as martial law, same default as the schema
// change in this version (e8): added since years and two helpers
//   fromThenToNowCount = how many entries the landing block should show
//   chartCount = how many charts have data and so render on /charts
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

// only the fields the tests need
type LiveProgram = {
  slug: string;
  era: "martial_law" | "today";
  provinces: string[];
  sinceYears: number[];
};

// playwright runs from the project root, so content/ is found from the working directory
const PROGRAMS_DIR = path.join(process.cwd(), "content", "programs");
const CHARTS_DIR = path.join(process.cwd(), "content", "charts");

// same limits as src/lib/latest-since.ts
const LATEST_FROM_YEAR = 2000;
const LATEST_LIMIT = 4;

// reads every program file once when this module loads
const PROGRAMS: LiveProgram[] = readdirSync(PROGRAMS_DIR)
  .filter((name) => name.endsWith(".yaml"))
  .map((name) => {
    const data = parse(readFileSync(path.join(PROGRAMS_DIR, name), "utf8")) as {
      slug: string;
      era?: "martial_law" | "today";
      places?: { province: string }[];
      since?: { year: number }[];
    };
    return {
      slug: data.slug,
      era: data.era ?? "martial_law",
      provinces: (data.places ?? []).map((place) => place.province),
      sinceYears: (data.since ?? []).map((entry) => entry.year),
    };
  });

/**
 * Counts the martial-law programs, the ones the map shows by default.
 *
 * @returns The number of live programs without `era: today`.
 */
export function martialLawCount(): number {
  return PROGRAMS.filter((program) => program.era === "martial_law").length;
}

/**
 * Counts the martial-law programs that have a place in one province.
 *
 * @remarks
 * Same rule as the landing page tiles: a program counts once per province it touches.
 *
 * @param province - A province key such as `"cavite"`.
 * @returns The number of martial-law programs with a place there.
 */
export function provinceCount(province: string): number {
  return PROGRAMS.filter(
    (program) => program.era === "martial_law" && program.provinces.includes(province),
  ).length;
}

/**
 * Counts the entries the landing "from then to now" block should show.
 *
 * @remarks
 * Same rule as `latestSince`: dated `since` entries from 2000 onward, at most 4.
 * A result of 0 means the block is not rendered.
 *
 * @returns The expected number of list items in the block.
 */
export function fromThenToNowCount(): number {
  const dated = PROGRAMS.flatMap((program) => program.sinceYears).filter((year) => year >= LATEST_FROM_YEAR);
  return Math.min(dated.length, LATEST_LIMIT);
}

/**
 * Counts the charts that render on /charts.
 *
 * @remarks
 * A chart file with no points is a valid placeholder, but the page does not render it.
 *
 * @returns The number of chart files that have at least one point.
 */
export function chartCount(): number {
  return readdirSync(CHARTS_DIR)
    .filter((name) => name.endsWith(".yaml"))
    .filter((name) => {
      const data = parse(readFileSync(path.join(CHARTS_DIR, name), "utf8")) as { points?: unknown[] };
      return (data.points ?? []).length > 0;
    }).length;
}