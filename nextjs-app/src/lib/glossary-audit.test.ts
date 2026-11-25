// what this file does: tests the glossary audit
import { describe, expect, it } from "vitest";
import type { Program } from "./content-schema";
import { auditGlossary } from "./glossary-audit";
import type { GlossaryEntry } from "./glossary";

const glossary: GlossaryEntry[] = [
  { term: "DAR", name: "Department of Agrarian Reform", meaning: "A government agency." },
  { term: "CLOA", name: "Certificate of Land Ownership Award", meaning: "A land award document." },
];

function makeProgram(changes: Partial<Program> = {}): Program {
  return {
    slug: "test",
    title: "Test",
    when: "1972 onward",
    topic: "land",
    era: "martial_law",
    status: "checking",
    startYear: 1972,
    endYear: null,
    places: [{ name: "Calamba", province: "laguna", lat: 14.2, lng: 121.1, approximate: false }],
    happened: "DAR issued 25 CLOAs in 1991.",
    question: "Find a record.",
    since: [],
    sources: [],
    ...changes,
  } as Program;
}

describe("auditGlossary", () => {
  it("passes when every short form is defined and used, plural included", () => {
    expect(auditGlossary([makeProgram()], glossary)).toEqual({ problems: [], warnings: [] });
  });

  it("warns about a short form that is not in the glossary", () => {
    const result = auditGlossary([makeProgram({ happened: "DAR and the LLDA issued 25 CLOAs." })], glossary);
    expect(result.problems).toEqual([]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('"LLDA"');
  });

  it("warns once per program for a repeated short form", () => {
    const result = auditGlossary(
      [makeProgram({ happened: "DAR, CLOA and PCA. Then PCA again.", question: "Ask PCA." })],
      glossary,
    );
    expect(result.warnings.filter((warning) => warning.includes('"PCA"'))).toHaveLength(1);
  });

  it("skips roman numerals and ignored names", () => {
    const result = auditGlossary(
      [makeProgram({ happened: "DAR told Region IV about CLOA and KASAMA-TK." })],
      glossary,
    );
    expect(result.warnings).toEqual([]);
  });

  it("warns about a glossary term that no live page uses", () => {
    const result = auditGlossary([makeProgram({ happened: "DAR issued a paper." })], glossary);
    expect(result.warnings).toEqual(['glossary: "CLOA" appears in no live page']);
  });

  it("counts a term used only in a source title as used", () => {
    const program = makeProgram({
      happened: "DAR issued a paper.",
      sources: [{ title: "List of CLOA holders", publisher: "DAR", voice: "official" }],
    });
    expect(auditGlossary([program], glossary).warnings).toEqual([]);
  });
});
