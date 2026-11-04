// What this file does: keeps EVERY contributor limit in one place.
// These are plain functions with no database, so they are easy to test.
// The server actions call them before anything is saved.

// Maximum text lengths. Used by the proposal schema.
export const LENGTHS = {
  sourceTitle: 200,
  publisher: 120,
  cite: 300,
  followUp: 600,
  correction: 300,
  reason: 400,
  reviewNote: 500,
  placeName: 80,
  programTitle: 150,
  when: 40,
  promised: 500,
  happened: 800,
  question: 300,
  url: 500,
} as const;

export type Role = "contributor" | "trusted" | "admin";

// A contributor becomes trusted after this many approved proposals.
export const TRUSTED_AFTER = 3;

export type RoleLimits = {
  maxPending: number;
  maxPer24h: number;
  canProposeNewProgram: boolean;
};

// The limits for each role. A new contributor gets 1 open proposal until
// their first one is approved. After that they get 3.
export function limitsFor(role: Role, approvedCount: number): RoleLimits {
  if (role === "admin") {
    return { maxPending: Infinity, maxPer24h: Infinity, canProposeNewProgram: true };
  }
  if (role === "trusted") {
    return { maxPending: 6, maxPer24h: 10, canProposeNewProgram: true };
  }
  return {
    maxPending: approvedCount >= 1 ? 3 : 1,
    maxPer24h: 5,
    canProposeNewProgram: false,
  };
}

export function shouldBecomeTrusted(role: Role, approvedCount: number): boolean {
  return role === "contributor" && approvedCount >= TRUSTED_AFTER;
}

// Makes two links to the same page look the same, so duplicates are caught.
export function normalizeUrl(raw: string): string {
  try {
    const url = new URL(raw.trim());
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const path = url.pathname.replace(/\/+$/, "");
    return `${host}${path}${url.search}`;
  } catch {
    return raw.trim().toLowerCase();
  }
}

// Returns the first link that already exists, or null when all are new.
export function findDuplicateUrl(urls: string[], existing: string[]): string | null {
  const known = new Set(existing.map(normalizeUrl));
  for (const url of urls) {
    if (known.has(normalizeUrl(url))) return url;
  }
  return null;
}

export type SubmitContext = {
  role: Role;
  banned: boolean;
  emailVerified: boolean;
  approvedCount: number;
  openCount: number; // pending + needs_changes, NOT counting the proposal being sent
  last24hCount: number; // proposals this person sent in the last 24 hours
  proposalType: string;
  urls: string[]; // links in the new proposal
  existingUrls: string[]; // links already used on this program
  isResubmit?: boolean; // resubmitting does not count toward the daily cap
};

export type Check = { ok: true } | { ok: false; error: string };

// The one gate every submission must pass.
export function checkCanSubmit(ctx: SubmitContext): Check {
  if (ctx.banned) return { ok: false, error: "This account cannot submit proposals." };
  if (!ctx.emailVerified) {
    return { ok: false, error: "Please verify your email before submitting." };
  }

  const limits = limitsFor(ctx.role, ctx.approvedCount);

  if (ctx.proposalType === "new_program" && !limits.canProposeNewProgram) {
    return { ok: false, error: "Only trusted contributors can propose a new program." };
  }
  if (ctx.openCount >= limits.maxPending) {
    return {
      ok: false,
      error: `You already have ${ctx.openCount} proposal(s) waiting. The limit for your account is ${limits.maxPending}. Wait for a review first.`,
    };
  }
  if (!ctx.isResubmit && ctx.last24hCount >= limits.maxPer24h) {
    return {
      ok: false,
      error: `You have reached the daily limit of ${limits.maxPer24h} submissions. Try again tomorrow.`,
    };
  }
  if (findDuplicateUrl(ctx.urls, ctx.existingUrls)) {
    return { ok: false, error: "That link is already on this program or in a waiting proposal." };
  }
  return { ok: true };
}
