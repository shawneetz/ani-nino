// What this file does: checks that every limit blocks when it should.
import { describe, expect, it } from "vitest";
import { checkCanSubmit, findDuplicateUrl, limitsFor, normalizeUrl, type SubmitContext } from "./limits";

const base: SubmitContext = {
  role: "contributor",
  banned: false,
  emailVerified: true,
  approvedCount: 0,
  openCount: 0,
  last24hCount: 0,
  proposalType: "add_source",
  urls: ["https://example.org/a"],
  existingUrls: [],
};

describe("checkCanSubmit", () => {
  it("allows a normal first submission", () => {
    expect(checkCanSubmit(base).ok).toBe(true);
  });

  it("blocks banned accounts", () => {
    expect(checkCanSubmit({ ...base, banned: true }).ok).toBe(false);
  });

  it("blocks unverified email", () => {
    expect(checkCanSubmit({ ...base, emailVerified: false }).ok).toBe(false);
  });

  it("gives a new contributor only 1 open proposal", () => {
    expect(checkCanSubmit({ ...base, openCount: 1 }).ok).toBe(false);
  });

  it("gives 3 open proposals after the first approval", () => {
    expect(checkCanSubmit({ ...base, approvedCount: 1, openCount: 2 }).ok).toBe(true);
    expect(checkCanSubmit({ ...base, approvedCount: 1, openCount: 3 }).ok).toBe(false);
  });

  it("blocks the 6th submission in 24 hours for a contributor", () => {
    const ctx = { ...base, approvedCount: 1, last24hCount: 5 };
    expect(checkCanSubmit(ctx).ok).toBe(false);
  });

  it("does not count a resubmit toward the daily cap", () => {
    const ctx = { ...base, approvedCount: 1, last24hCount: 5, isResubmit: true };
    expect(checkCanSubmit(ctx).ok).toBe(true);
  });

  it("lets only trusted people and admins propose a new program", () => {
    const ctx = { ...base, proposalType: "new_program" };
    expect(checkCanSubmit(ctx).ok).toBe(false);
    expect(checkCanSubmit({ ...ctx, role: "trusted" }).ok).toBe(true);
    expect(checkCanSubmit({ ...ctx, role: "admin" }).ok).toBe(true);
  });

  it("gives trusted people higher caps", () => {
    expect(limitsFor("trusted", 3)).toMatchObject({ maxPending: 6, maxPer24h: 10 });
    expect(checkCanSubmit({ ...base, role: "trusted", approvedCount: 3, openCount: 5 }).ok).toBe(true);
    expect(checkCanSubmit({ ...base, role: "trusted", approvedCount: 3, openCount: 6 }).ok).toBe(false);
  });

  it("blocks a link that already exists", () => {
    const ctx = { ...base, existingUrls: ["https://www.example.org/a/"] };
    expect(checkCanSubmit(ctx).ok).toBe(false);
  });
});

describe("links", () => {
  it("treats www, trailing slash and hash as the same page", () => {
    expect(normalizeUrl("https://www.Example.org/a/#top")).toBe(normalizeUrl("https://example.org/a"));
  });

  it("returns null when there is no duplicate", () => {
    expect(findDuplicateUrl(["https://example.org/x"], ["https://example.org/y"])).toBeNull();
  });
});
