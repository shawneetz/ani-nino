// what this file does: `pnpm content:check` validates every file in content/
// it prints a summary and exits with code 1 when any content is invalid
// it only warns about the repo placeholder, the confirmed audit and the style audit,
// so those can never break the build, run `pnpm content:audit` for the strict check
// change in this version (b4a): validates moved targets and held slugs against content
// change in this version (b5a): shows the style audit as warnings
import { readdir } from "node:fs/promises";
// change in this version (c6): shows the glossary audit as warnings
import { auditConfirmed } from "../src/lib/confirmed-audit";
import { auditGlossary } from "../src/lib/glossary-audit";
import { ContentError, loadContent } from "../src/lib/load-content";
import { isRepoConfigured } from "../src/lib/site";
import { slugProblems } from "../src/lib/slug-check";
import { auditStyle } from "../src/lib/style-audit";

// file name stems of held yaml files; a missing folder means there are no held files
async function holdingFiles(): Promise<string[]> {
  try {
    const names = await readdir("content/holding");
    return names.filter((name) => name.endsWith(".yaml")).map((name) => name.replace(/\.yaml$/, ""));
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return [];
    }
    throw error;
  }
}

async function main() {
  try {
    const { programs, charts, gaps, sources } = await loadContent("content");
    const confirmed = programs.filter((program) => program.status === "confirmed").length;
    console.log(
      `OK: ${programs.length} programs (${confirmed} confirmed, ${
        programs.length - confirmed
      } still checking)`,
    );
    console.log(`    ${charts.length} charts, ${gaps.length} gaps, ${sources.length} sources`);

    // Empty charts are allowed for now, but remain visible as launch work.
    for (const chart of charts) {
      if (chart.points.length === 0) {
        console.warn(`WARN: chart "${chart.id}" has no data points yet`);
      }
    }

    // Every contribution link depends on this, so make the problem loud.
    if (!isRepoConfigured()) {
      console.warn(
        "WARN: REPO_OWNER in src/lib/site.ts is still YOUR-NAME. All GitHub contribution links are broken.",
      );
    }

    // old urls must keep working, so a bad moved or held entry stops the build
    const slugIssues = slugProblems(
      programs.map((program) => program.slug),
      await holdingFiles(),
    );
    if (slugIssues.length > 0) {
      console.error(`FAILED: ${slugIssues.length} slug problem(s)`);
      slugIssues.forEach((issue) => console.error(`  - ${issue}`));
      process.exit(1);
    }

    // show honesty and style problems as warnings here, `pnpm content:audit` makes them fail
    const audit = auditConfirmed(programs);
    audit.problems.forEach((problem) => console.warn(`WARN (confirmed audit): ${problem}`));
    audit.warnings.forEach((warning) => console.warn(`WARN: ${warning}`));
    const style = auditStyle(programs);
    style.problems.forEach((problem) => console.warn(`WARN (style audit): ${problem}`));
    style.warnings.forEach((warning) => console.warn(`WARN: ${warning}`));
    const glossary = auditGlossary(programs);
    glossary.warnings.forEach((warning) => console.warn(`WARN (glossary): ${warning}`));
  } catch (error) {
    if (error instanceof ContentError) {
      console.error(`FAILED: ${error.issues.length} problem(s)`);
      error.issues.forEach((issue) => console.error(`  - ${issue}`));
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

void main();
