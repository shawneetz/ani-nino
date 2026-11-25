// what this file does: cross-checks the glossary against live program text
// this audit only returns warnings
import type { AuditResult } from "./confirmed-audit";
import type { Program } from "./content-schema";
import { GLOSSARY, type GlossaryEntry } from "./glossary";

export const IGNORED_TOKENS: ReadonlySet<string> = new Set(["KASAMA", "TK"]);

const TOKEN = /\b([A-Z]{2,6})s?\b/g;
const ROMAN = /^[IVX]+$/;

function prose(program: Program): string[] {
  return [program.promised ?? "", program.happened, program.question ?? "", ...program.since.map((item) => item.text)];
}

function pageText(program: Program): string[] {
  const sources = [...program.sources, ...program.since.map((item) => item.source)];
  return [program.title, ...prose(program), ...sources.flatMap((source) => [source.title, source.cite ?? ""])];
}

export function auditGlossary(
  programs: Program[],
  glossary: readonly GlossaryEntry[] = GLOSSARY,
  ignored: ReadonlySet<string> = IGNORED_TOKENS,
): AuditResult {
  const warnings: string[] = [];
  const known = new Set(glossary.map((entry) => entry.term));

  for (const program of programs) {
    const seen = new Set<string>();
    for (const text of prose(program)) {
      for (const match of text.matchAll(TOKEN)) {
        const token = match[1];
        if (known.has(token) || ignored.has(token) || ROMAN.test(token) || seen.has(token)) continue;
        seen.add(token);
        warnings.push(`programs/${program.slug}.yaml: "${token}" is used in the text but is not in the glossary`);
      }
    }
  }

  const everything = programs.flatMap(pageText).join("\n");
  for (const entry of glossary) {
    if (!new RegExp(`\\b${entry.term}s?\\b`).test(everything)) {
      warnings.push(`glossary: "${entry.term}" appears in no live page`);
    }
  }

  return { problems: [], warnings };
}
