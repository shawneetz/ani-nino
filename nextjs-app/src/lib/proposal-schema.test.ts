// What this file does: checks that bad proposals are refused with clear rules.
import { describe, expect, it } from "vitest";
import { proposalInputSchema } from "./proposal-schema";

const source = {
  title: "A report",
  publisher: "DAR",
  voice: "official",
  url: "https://example.org/report",
  accessed: "2020-01-01",
};

function addSource(overrides: object = {}) {
  return {
    programSlug: "laguna-kkk",
    reason: "This is an official report.",
    payload: { type: "add_source", source: { ...source, ...overrides } },
  };
}

describe("proposalInputSchema", () => {
  it("accepts a valid add_source proposal", () => {
    expect(proposalInputSchema.safeParse(addSource()).success).toBe(true);
  });

  it("refuses a source with no access date", () => {
    const { accessed: _unused, ...withoutDate } = source;
    void _unused;
    const input = { ...addSource(), payload: { type: "add_source", source: withoutDate } };
    expect(proposalInputSchema.safeParse(input).success).toBe(false);
  });

  it("refuses a source with no link", () => {
    const { url: _unused, ...withoutUrl } = source;
    void _unused;
    const input = { ...addSource(), payload: { type: "add_source", source: withoutUrl } };
    expect(proposalInputSchema.safeParse(input).success).toBe(false);
  });

  it("refuses HTML", () => {
    expect(proposalInputSchema.safeParse(addSource({ title: "<script>alert(1)</script>" })).success).toBe(false);
  });

  it("refuses links inside text", () => {
    expect(proposalInputSchema.safeParse(addSource({ title: "See https://evil.example" })).success).toBe(false);
  });

  it("refuses markdown", () => {
    expect(proposalInputSchema.safeParse(addSource({ title: "**bold** claim" })).success).toBe(false);
  });

  it("refuses a link that is not http or https", () => {
    expect(proposalInputSchema.safeParse(addSource({ url: "javascript:alert(1)" })).success).toBe(false);
  });

  it("refuses an unknown label", () => {
    expect(proposalInputSchema.safeParse(addSource({ voice: "trustme" })).success).toBe(false);
  });

  it("refuses an access date in the future", () => {
    expect(proposalInputSchema.safeParse(addSource({ accessed: "2999-01-01" })).success).toBe(false);
  });

  it("refuses extra fields such as a confirmed status", () => {
    expect(proposalInputSchema.safeParse(addSource({ status: "confirmed" })).success).toBe(false);
  });

  it("refuses a follow-up that is too long", () => {
    const input = {
      programSlug: "laguna-kkk",
      reason: "Adds a follow-up.",
      payload: { type: "add_since", year: 2000, text: "a".repeat(601), source },
    };
    expect(proposalInputSchema.safeParse(input).success).toBe(false);
  });

  it("refuses a new program that tries to set its status", () => {
    const input = {
      programSlug: "new-one",
      reason: "A new program.",
      payload: {
        type: "new_program",
        program: {
          slug: "new-one",
          title: "New one",
          when: "1975",
          topic: "land",
          status: "confirmed",
          startYear: 1975,
          places: [{ name: "Calamba", province: "laguna", lat: 14.2, lng: 121.1 }],
          happened: "Something happened.",
          question: "What else?",
          sources: [source],
        },
      },
    };
    expect(proposalInputSchema.safeParse(input).success).toBe(false);
  });

  it("refuses a new program whose slug does not match programSlug", () => {
    const input = {
      programSlug: "other-name",
      reason: "A new program.",
      payload: {
        type: "new_program",
        program: {
          slug: "new-one",
          title: "New one",
          when: "1975",
          topic: "land",
          startYear: 1975,
          places: [{ name: "Calamba", province: "laguna", lat: 14.2, lng: 121.1 }],
          happened: "Something happened.",
          question: "What else?",
          sources: [source],
        },
      },
    };
    expect(proposalInputSchema.safeParse(input).success).toBe(false);
  });
});
