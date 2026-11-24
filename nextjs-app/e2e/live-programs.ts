// what this file does: counts live programs straight from content/programs/*.yaml
// so e2e tests never hardcode how many programs exist, adding or cutting a page
// in content/ then needs no test edit
// it runs in node (playwright), never in the browser
// a program without an era counts as martial law, same default as the schema
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

// only the fields the tests need
type LiveProgram = {
  slug: string;
  era: "martial_law" | "today";
  provinces: string[];
};

// playwright runs from the project root, so content/ is found from the working directory
const PROGRAMS_DIR = path.join(process.cwd(), "content", "programs");

// reads every program file once when this module loads
const PROGRAMS: LiveProgram[] = readdirSync(PROGRAMS_DIR)
  .filter((name) => name.endsWith(".yaml"))
  .map((name) => {
    const data = parse(readFileSync(path.join(PROGRAMS_DIR, name), "utf8")) as {
      slug: string;
      era?: "martial_law" | "today";
      places?: { province: string }[];
    };
    return {
      slug: data.slug,
      era: data.era ?? "martial_law",
      provinces: (data.places ?? []).map((place) => place.province),
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
