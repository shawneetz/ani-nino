// what this file does: checks live programs against the voice and format rules in spec sections 3 and 7
// pure function, scripts/audit-confirmed.ts runs it and fails on problems, scripts/check-content.ts only warns
//   problems = break a rule, must fix before launch
//   warnings = over a budget or an opinion word, worth fixing
import type { AuditResult } from "./confirmed-audit";
import type { Program, Source } from "./content-schema";
import { yearRange } from "./filter";

// word budgets from the format rule, about this many words
export const WORD_BUDGETS = { promised: 60, happened: 120, question: 40, since: 30 } as const;

// title limit in characters
export const TITLE_MAX = 60;

// fail above this share of a budget, warn above the budget itself
const FAIL_FACTOR = 1.25;

// "I" is case sensitive so "i" in a code or id never matches
const FIRST_PERSON = [/\bI\b/, /\b(?:my|your)\b/i];

// leftover notes that mean a source was never opened
const PLACEHOLDER = /check before publishing|not captured|to be added|\btbd\b/i;

// verdict words stay out of the record text
const OPINION = /\b(?:fail(?:s|ed|ure|ures)?|success(?:ful|fully)?|scandal(?:s|ous)?)\b/i;

// counts words the way a reader would, split on any space
function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Checks every live program against the style rules.
 *
 * @param programs - live programs from `content/programs/`
 * @returns problems to fix and warnings, same shape as the confirmed audit
 */
export function auditStyle(programs: Program[]): AuditResult {
  const problems: string[] = [];
  const warnings: string[] = [];

  for (const program of programs) {
    const where = `programs/${program.slug}.yaml`;

    if (program.title.length > TITLE_MAX) {
      problems.push(`${where}: title is ${program.title.length} characters, the limit is ${TITLE_MAX}`);
    }

    const expected = yearRange(program);
    if (program.when !== expected) {
      problems.push(`${where}: "when" is "${program.when}" but the years say "${expected}"`);
    }

    const fields: { label: string; text: string; budget?: number }[] = [
      { label: "promised", text: program.promised ?? "", budget: WORD_BUDGETS.promised },
      { label: "happened", text: program.happened, budget: WORD_BUDGETS.happened },
      { label: "question", text: program.question ?? "", budget: WORD_BUDGETS.question },
      ...program.since.map((item) => ({
        label: `since ${item.year}`,
        text: item.text,
        budget: WORD_BUDGETS.since,
      })),
    ];

    for (const { label, text, budget } of fields) {
      if (FIRST_PERSON.some((pattern) => pattern.test(text))) {
        problems.push(`${where}: ${label} uses first person (I, my or your)`);
      }
      if (budget === undefined) continue;
      const words = wordCount(text);
      if (words > budget * FAIL_FACTOR) {
        problems.push(`${where}: ${label} is ${words} words, over 125 percent of the ${budget} word budget`);
      } else if (words > budget) {
        warnings.push(`${where}: ${label} is ${words} words, the budget is ${budget}`);
      }
    }

    const opinion = program.happened.match(OPINION);
    if (opinion) warnings.push(`${where}: happened uses the opinion word "${opinion[0]}"`);

    const sources: { label: string; source: Source }[] = [
      ...program.sources.map((source) => ({ label: `source "${source.title}"`, source })),
      ...program.since.map((item) => ({
        label: `since ${item.year} source "${item.source.title}"`,
        source: item.source,
      })),
    ];

    for (const { label, source } of sources) {
      if (PLACEHOLDER.test(`${source.title} ${source.cite ?? ""}`)) {
        problems.push(`${where}: ${label} still has a placeholder note`);
      }
      if (!source.url) problems.push(`${where}: ${label} has no url`);
      if (!source.accessed) problems.push(`${where}: ${label} has no accessed date`);
    }
  }

  return { problems, warnings };
}
