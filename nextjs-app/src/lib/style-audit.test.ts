// what this file does: tests the style audit with small fake programs
import { describe, expect, it } from "vitest";
import type { Program } from "./content-schema";
import { auditStyle } from "./style-audit";

const words = (count: number) => Array.from({ length: count }, () => "word").join(" ");

const goodSource = {
  title: "A decree",
  publisher: "Official Gazette",
  voice: "official",
  url: "https://example.com/decree",
  accessed: "2026-11-25",
} as const;

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
    promised: "A short promise.",
    happened: "Something happened. It was recorded.",
    question: "Find a record.",
    since: [],
    sources: [goodSource],
    ...changes,
  } as Program;
}

const run = (changes: Partial<Program>) => auditStyle([makeProgram(changes)]);

describe("auditStyle", () => {
  it("passes a clean program", () => {
    expect(auditStyle([makeProgram()])).toEqual({ problems: [], warnings: [] });
  });

  it("flags first person in every text field", () => {
    const result = run({
      promised: "I think it promised land.",
      happened: "These are my notes.",
      question: "Check your notes.",
      since: [{ year: 1990, text: "I read this.", source: goodSource }],
    });
    expect(result.problems).toHaveLength(4);
  });

  it("does not flag roman numerals or words that contain my", () => {
    const result = run({ happened: "Region IV had a myth about Phase II loans. Mythology is not flagged." });
    expect(result.problems).toEqual([]);
  });

  it("flags a placeholder note in a source and in a since source", () => {
    const result = run({
      sources: [{ ...goodSource, cite: "Headline not captured; check before publishing." }],
      since: [{ year: 1990, text: "Later.", source: { ...goodSource, title: "Title not captured" } }],
    });
    expect(result.problems.filter((problem) => problem.includes("placeholder"))).toHaveLength(2);
  });

  it("flags a missing url or accessed date, including in since sources", () => {
    const bare = {
      title: goodSource.title,
      publisher: goodSource.publisher,
      voice: goodSource.voice,
    };
    const result = run({
      sources: [bare],
      since: [{ year: 1990, text: "Later.", source: bare }],
    });
    expect(result.problems.filter((problem) => problem.includes("no url"))).toHaveLength(2);
    expect(result.problems.filter((problem) => problem.includes("no accessed date"))).toHaveLength(2);
  });

  it("flags a when that does not match the years", () => {
    expect(run({ when: "1970s onward" }).problems.join(" ")).toContain("1972 onward");
    expect(run({ endYear: 1984, when: "1972 onward" }).problems.join(" ")).toContain("1972 to 1984");
    expect(run({ endYear: 1984, when: "1972 to 1984" }).problems).toEqual([]);
  });

  it("limits the title to 60 characters", () => {
    expect(run({ title: "x".repeat(60) }).problems).toEqual([]);
    expect(run({ title: "x".repeat(61) }).problems.join(" ")).toContain("61 characters");
  });

  it("warns above a word budget and fails above 125 percent", () => {
    expect(run({ happened: words(120) })).toEqual({ problems: [], warnings: [] });
    const warned = run({ happened: words(121) });
    expect(warned.problems).toEqual([]);
    expect(warned.warnings.join(" ")).toContain("121 words");
    expect(run({ happened: words(150) }).problems).toEqual([]);
    expect(run({ happened: words(151) }).problems.join(" ")).toContain("151 words");
  });

  it("applies the budget to promised, question and each since entry", () => {
    expect(run({ promised: words(76) }).problems).toHaveLength(1);
    expect(run({ question: words(51) }).problems).toHaveLength(1);
    const since = [{ year: 1990, text: words(38), source: goodSource }];
    expect(run({ since }).problems).toHaveLength(1);
  });

  it("warns on opinion words in happened but does not fail", () => {
    const result = run({ happened: "The program failed. It was a success." });
    expect(result.problems).toEqual([]);
    expect(result.warnings.join(" ")).toContain("opinion word");
  });
});
