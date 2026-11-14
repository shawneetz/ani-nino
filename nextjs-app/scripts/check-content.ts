// What this file does: `pnpm content:check` validates every file in content/.
// It prints a summary and exits with code 1 when any content is invalid.
// It only WARNS about the repo placeholder and the confirmed-program audit,
// so those can never break the build. Run `pnpm content:audit` for the strict check.
import { auditConfirmed } from "../src/lib/confirmed-audit";
import { ContentError, loadContent } from "../src/lib/load-content";
import { isRepoConfigured } from "../src/lib/site";

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

    // Show honesty problems as warnings here. `pnpm content:audit` makes them fail.
    const audit = auditConfirmed(programs);
    audit.problems.forEach((problem) => console.warn(`WARN (confirmed audit): ${problem}`));
    audit.warnings.forEach((warning) => console.warn(`WARN: ${warning}`));
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
