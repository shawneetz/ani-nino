// What this file does: tests the confirmed-program audit with small fake programs.
import { describe, expect, it } from "vitest";
import type { Program } from "./content-schema";
import { auditConfirmed } from "./confirmed-audit";

// A minimal confirmed program that passes every rule.
function makeProgram(changes: Partial<Program> = {}): Program {
  return {
    slug: "test",
    title: "Test",
    when: "1972 onward",
    topic: "land",
    era: "martial_law",
    status: "confirmed",
    startYear: 1972,
    endYear: null,
    places: [{ name: "Calamba", province: "laguna", lat: 14.2, lng: 121.1, approximate: false }],
    happened: "Something happened.",
    since: [],
    checkedOn: "2026-11-15",
    sources: [
      {
        title: "A decree",
        publisher: "Official Gazette",
        voice: "official",
        url: "https://example.com/decree",
        accessed: "2026-11-15",
      },
    ],
    ...changes,
  } as Program;
}

describe("auditConfirmed", () => {
  it("passes a clean confirmed program", () => {
    const result = auditConfirmed([makeProgram()]);
    expect(result.problems).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("flags a leftover check-before-publishing note as a problem", () => {
    const program = makeProgram({
      sources: [
        {
          title: "A study",
          publisher: "UNU",
          voice: "independent",
          url: "https://example.com/study",
          accessed: "2026-11-15",
          cite: "Title not captured; check before publishing.",
        },
      ],
    });
    expect(auditConfirmed([program]).problems).toHaveLength(1);
  });

  it("flags a program backed only by advocacy sources", () => {
    const program = makeProgram({
      sources: [
        { title: "A report", publisher: "Group", voice: "advocacy", url: "https://example.com/a", accessed: "2026-11-15" },
      ],
    });
    expect(auditConfirmed([program]).problems.join(" ")).toContain("only advocacy");
  });

  it("warns, but does not fail, when a source has no url", () => {
    const program = makeProgram({
      sources: [
        { title: "PD 813", publisher: "Official Gazette", voice: "official", url: "https://example.com/x", accessed: "2026-11-15" },
        { title: "No link", publisher: "Gazette", voice: "official" },
      ],
    });
    const result = auditConfirmed([program]);
    expect(result.problems).toEqual([]);
    expect(result.warnings.join(" ")).toContain("no url");
  });

  it("ignores programs that are still being checked", () => {
    const program = makeProgram({
      status: "checking",
      question: "What happened?",
      sources: [{ title: "x", publisher: "y", voice: "advocacy", cite: "check before publishing" }],
    });
    expect(auditConfirmed([program])).toEqual({ problems: [], warnings: [] });
  });
});
