// What this file does: checks that "confirmed" programs really earned that label.
// The schema only checks that fields exist. This audit checks the honesty rules:
//   problems = must fix before the program can stay "confirmed"
//   warnings = worth fixing, but not blocking
import type { Program } from "./content-schema";

export type AuditResult = { problems: string[]; warnings: string[] };

// Leftover notes that mean "I have not opened this source yet".
const PLACEHOLDER = /check before publishing|not captured|not verified|unverified/i;

export function auditConfirmed(programs: Program[]): AuditResult {
  const problems: string[] = [];
  const warnings: string[] = [];

  // Only confirmed programs are audited. "Still checking" is allowed to be incomplete.
  for (const program of programs.filter((item) => item.status === "confirmed")) {
    const where = `programs/${program.slug}.yaml`;

    // Rule 1: a placeholder note means a source was never opened.
    for (const source of program.sources) {
      const notes = `${source.title} ${source.cite ?? ""}`;
      if (PLACEHOLDER.test(notes)) {
        problems.push(`${where}: source "${source.title}" still has a "check before publishing" note`);
      }
      // A reader cannot open a source without a link.
      if (!source.url) warnings.push(`${where}: source "${source.title}" has no url`);
      if (source.url && !source.accessed) {
        warnings.push(`${where}: source "${source.title}" has a url but no accessed date`);
      }
    }

    // Rule 2: confirmed needs at least one government, court, archive or study source.
    const hasStrongVoice = program.sources.some(
      (source) => source.voice === "official" || source.voice === "independent",
    );
    if (!hasStrongVoice) {
      problems.push(`${where}: confirmed, but only advocacy or supporter sources`);
    }
  }

  return { problems, warnings };
}
