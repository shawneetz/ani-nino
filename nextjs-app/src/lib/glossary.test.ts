// what this file does: tests the glossary data
import { describe, expect, it } from "vitest";
import { GLOSSARY } from "./glossary";

describe("GLOSSARY", () => {
  it("has unique terms", () => {
    const terms = GLOSSARY.map((entry) => entry.term);
    expect(new Set(terms).size).toBe(terms.length);
  });

  it("uses 2 to 6 capital letters for every term", () => {
    for (const entry of GLOSSARY) expect(entry.term).toMatch(/^[A-Z]{2,6}$/);
  });

  it("has a name and a meaning for every term", () => {
    for (const entry of GLOSSARY) {
      expect(entry.name.trim()).not.toBe("");
      expect(entry.meaning.trim()).not.toBe("");
    }
  });

  it("is sorted by term", () => {
    const terms = GLOSSARY.map((entry) => entry.term);
    expect(terms).toEqual([...terms].sort((a, b) => a.localeCompare(b)));
  });
});
