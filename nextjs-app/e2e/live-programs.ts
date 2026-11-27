// what this file does: counts live content straight from content/*.yaml
// so e2e tests never hardcode how many programs or dated records exist,
// adding or cutting a page in content/ then needs no test edit
// it runs in node (playwright), never in the browser
// a program without an era counts as martial law, same default as the schema
// change in this version (e8): added since years and two helpers
//   fromThenToNowCount = how many entries the landing block should show
// change in this version (fix): content paths come from this file's own location
//   the old process.cwd() broke when playwright ran from the workspace root instead of nextjs-app
// change in this version (n7): added status and four helpers for the cavite gate
//   confirmedProvinceCount, checkingCount, provincesCoveredCount and sourceCount
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { loadContent } from "../src/lib/load-content";

// only the fields the tests need
type LiveProgram = {
  slug: string;
  era: "martial_law" | "today";
  status: "confirmed" | "checking";
  provinces: string[];
  sinceYears: number[];
};

// this file lives in nextjs-app/e2e, so the project root is one level up
// __dirname does not depend on where the test runner was started
const PROJECT_ROOT = path.resolve(__dirname, "..");
const PROGRAMS_DIR = path.join(PROJECT_ROOT, "content", "programs");
const CONTENT_DIR = path.join(PROJECT_ROOT, "content");

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
      status: "confirmed" | "checking";
      places?: { province: string }[];
      since?: { year: number }[];
    };
    return {
      slug: data.slug,
      era: data.era ?? "martial_law",
      status: data.status,
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
 * Counts the confirmed martial-law programs that have a place in one province.
 *
 * @param province - A province key such as `"cavite"`.
 * @returns The number of confirmed programs with a place there.
 */
export function confirmedProvinceCount(province: string): number {
  return PROGRAMS.filter(
    (program) => program.era === "martial_law"
      && program.status === "confirmed"
      && program.provinces.includes(province),
  ).length;
}

/**
 * Counts the martial-law programs that are still being checked.
 *
 * @returns The number shown as "Still being checked" on the landing page.
 */
export function checkingCount(): number {
  return PROGRAMS.filter(
    (program) => program.era === "martial_law" && program.status === "checking",
  ).length;
}

/**
 * Counts the provinces that have at least one martial-law program.
 *
 * @returns The first number of "n of 5" on the landing page.
 */
export function provincesCoveredCount(): number {
  return new Set(
    PROGRAMS
      .filter((program) => program.era === "martial_law")
      .flatMap((program) => program.provinces),
  ).size;
}

/**
 * Counts the sources the sources page lists.
 *
 * @remarks
 * Duplicates are merged by the content loader, so this reuses it instead of
 * repeating the merge rule here.
 *
 * @returns The number shown as "Sources" on the landing page.
 */
export async function sourceCount(): Promise<number> {
  return (await loadContent(CONTENT_DIR)).sources.length;
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
