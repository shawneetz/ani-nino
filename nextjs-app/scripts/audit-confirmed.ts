// What this file does: `pnpm content:audit` runs the strict honesty check on confirmed programs.
// It exits with code 1 if any problem is found. It is NOT part of `build`,
// so it can never block a deploy. Run it by hand before you launch.
import { auditConfirmed } from "../src/lib/confirmed-audit";
import { loadContent } from "../src/lib/load-content";

async function main() {
  const { programs } = await loadContent("content");
  const { problems, warnings } = auditConfirmed(programs);

  warnings.forEach((warning) => console.warn(`WARN: ${warning}`));
  if (problems.length > 0) {
    console.error(`AUDIT FAILED: ${problems.length} problem(s)`);
    problems.forEach((problem) => console.error(`  - ${problem}`));
    process.exit(1);
  }
  console.log("AUDIT OK: every confirmed program passed the honesty rules");
}

void main();
