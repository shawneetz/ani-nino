// what this file does: tests the held topics list and its lookup helper
import { describe, expect, it } from "vitest";
import { HELD_TOPICS, heldTopic } from "./held-topics";

describe("HELD_TOPICS", () => {
  it("has unique, slug-shaped slugs", () => {
    const slugs = HELD_TOPICS.map((topic) => topic.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("has no empty title or reason", () => {
    for (const topic of HELD_TOPICS) {
      expect(topic.title.trim()).not.toBe("");
      expect(topic.reason.trim()).not.toBe("");
    }
  });

  it("keeps titles within the 60 character budget", () => {
    for (const topic of HELD_TOPICS) expect(topic.title.length).toBeLessThanOrEqual(60);
  });
});

describe("heldTopic", () => {
  it("finds a held topic by slug", () => {
    expect(heldTopic("laguna-kkk")?.title).toContain("KKK");
  });

  it("returns null for a live or unknown slug", () => {
    expect(heldTopic("laguna-operation-land-transfer")).toBeNull();
    expect(heldTopic("nope")).toBeNull();
  });
});
