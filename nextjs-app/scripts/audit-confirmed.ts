// what this file does: `pnpm content:audit` runs the strict checks on live content
// it runs the confirmed honesty audit and the style audit (voice, budgets, placeholders, when)
// it exits with code 1 if any problem is found
// it is not part of `build`, so it can never block a deploy, run it by hand before you launch
// change in this version (b5a): added the style audit
import { auditConfirmed } from "../src/lib/confirmed-audit";
import { loadContent } from "../src/lib/load-content";
import { auditStyle } from "../src/lib/style-audit";

async function main() {
  const { programs } = await loadContent("content");
  const confirmed = auditConfirmed(programs);
  const style = auditStyle(programs);

  const warnings = [...confirmed.warnings, ...style.warnings];
  const problems = [
    ...confirmed.problems.map((problem) => `(confirmed) ${problem}`),
    ...style.problems.map((problem) => `(style) ${problem}`),
  ];

  warnings.forEach((warning) => console.warn(`WARN: ${warning}`));
  if (problems.length > 0) {
    console.error(`AUDIT FAILED: ${problems.length} problem(s)`);
    problems.forEach((problem) => console.error(`  - ${problem}`));
    process.exit(1);
  }
  console.log("AUDIT OK: confirmed programs and the style rules passed");
}

void main();
