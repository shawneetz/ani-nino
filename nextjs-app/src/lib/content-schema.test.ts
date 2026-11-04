// What this file does: tests the validation rules in content-schema.ts.
// These tests are written now and should be run later with the unit test command.
import { describe, expect, it } from "vitest";
import { placeSchema, programSchema, sourceSchema } from "./content-schema";

const validProgram = {
  slug: "test-program",
  title: "Test program",
  when: "1972 onward",
  topic: "land",
  status: "checking",
  startYear: 1972,
  endYear: null,
  places: [{ name: "Calamba", province: "laguna", lat: 14.2117, lng: 121.1653 }],
  happened: "Something happened here.",
  question: "What happened next?",
};

const validSource = {
  title: "Presidential Decree No. 27",
  publisher: "Official Gazette",
  voice: "official",
  url: "https://example.com/pd-27",
};

function failedPaths(input: unknown): string[] {
  const result = programSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
}

describe("programSchema", () => {
  it("accepts a checking program with a question", () => {
    expect(programSchema.safeParse(validProgram).success).toBe(true);
  });

  it("requires a question while a program is checking", () => {
    expect(failedPaths({ ...validProgram, question: undefined })).toContain("question");
  });

  it("requires checkedOn and a linked source for confirmed programs", () => {
    const confirmed = {
      ...validProgram,
      status: "confirmed",
      question: undefined,
      checkedOn: "2026-11-01",
      sources: [validSource],
    };
    expect(programSchema.safeParse(confirmed).success).toBe(true);
    expect(failedPaths({ ...confirmed, checkedOn: undefined })).toContain("checkedOn");
    expect(failedPaths({ ...confirmed, sources: [] })).toContain("sources");
    expect(
      failedPaths({
        ...confirmed,
        sources: [{ title: "A book", publisher: "A press", voice: "independent" }],
      }),
    ).toContain("sources");
  });

  it("rejects invalid years, slugs, topics and unknown fields", () => {
    expect(failedPaths({ ...validProgram, startYear: 1971 })).toContain("startYear");
    expect(failedPaths({ ...validProgram, endYear: 1971 })).toContain("endYear");
    expect(failedPaths({ ...validProgram, slug: "Bad Slug" })).toContain("slug");
    expect(failedPaths({ ...validProgram, topic: "sports" })).toContain("topic");
    expect(programSchema.safeParse({ ...validProgram, extra: true }).success).toBe(false);
  });
});

describe("placeSchema and sourceSchema", () => {
  it("defaults approximate places to false and rejects out-of-range coordinates", () => {
    expect(placeSchema.parse(validProgram.places[0]).approximate).toBe(false);
    expect(placeSchema.safeParse({ ...validProgram.places[0], lat: 16 }).success).toBe(false);
    expect(placeSchema.safeParse({ ...validProgram.places[0], lng: 119 }).success).toBe(false);
  });

  it("accepts HTTP(S) sources and rejects invalid URLs and voices", () => {
    expect(sourceSchema.safeParse(validSource).success).toBe(true);
    expect(sourceSchema.safeParse({ ...validSource, url: "ftp://example.com" }).success).toBe(false);
    expect(sourceSchema.safeParse({ ...validSource, voice: "rumor" }).success).toBe(false);
  });
});
