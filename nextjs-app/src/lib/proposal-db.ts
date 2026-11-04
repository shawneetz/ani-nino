// What this file does: small database helpers for proposals. Every state
// change goes through moveState, so it is checked and logged the same way.
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fail } from "./action-result";
import { getGaps, getProgram } from "./content";
import { shouldBecomeTrusted, type Role } from "./limits";
import {
  OPEN_STATES,
  proposalPayloadSchema,
  proposalUrls,
  type ProposalPayload,
  type ProposalState,
} from "./proposal-schema";

export type ProfileRow = { id: string; role: Role; banned: boolean; approved_count: number };

export type ProposalRow = {
  id: string;
  author_id: string;
  program_slug: string;
  type: string;
  payload: unknown;
  reason: string;
  state: ProposalState;
  review_note: string | null;
  pr_url: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export async function getProfile(db: SupabaseClient, userId: string): Promise<ProfileRow | null> {
  const { data } = await db
    .from("profiles")
    .select("id, role, banned, approved_count")
    .eq("id", userId)
    .maybeSingle();
  return (data as ProfileRow | null) ?? null;
}

export async function getProposal(db: SupabaseClient, id: string): Promise<ProposalRow | null> {
  const { data } = await db.from("proposals").select("*").eq("id", id).maybeSingle();
  return (data as ProposalRow | null) ?? null;
}

// Adds one line to the audit trail.
export async function logChange(
  db: SupabaseClient,
  entry: { proposalId: string; actorId: string; from: ProposalState | null; to: ProposalState },
) {
  await db.from("proposal_log").insert({
    proposal_id: entry.proposalId,
    actor_id: entry.actorId,
    from_state: entry.from,
    to_state: entry.to,
  });
}

// How many open proposals (pending or needs changes) this person has.
export async function countOpen(db: SupabaseClient, authorId: string, excludeId?: string): Promise<number> {
  let query = db
    .from("proposals")
    .select("id", { count: "exact", head: true })
    .eq("author_id", authorId)
    .in("state", OPEN_STATES);
  if (excludeId) query = query.neq("id", excludeId);
  const { count, error } = await query;
  if (error) throw new Error("Could not count open proposals");
  return count ?? 0;
}

// How many proposals this person sent in the last 24 hours.
export async function countLast24h(db: SupabaseClient, authorId: string): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await db
    .from("proposals")
    .select("id", { count: "exact", head: true })
    .eq("author_id", authorId)
    .gte("created_at", since);
  if (error) throw new Error("Could not count recent proposals");
  return count ?? 0;
}

// Links already used on this program: published ones and ones waiting for review.
export async function existingUrlsFor(db: SupabaseClient, slug: string, excludeId?: string): Promise<string[]> {
  const program = await getProgram(slug);
  const published = program
    ? [...program.sources.map((s) => s.url), ...program.since.map((s) => s.source.url)].filter(
        (url): url is string => Boolean(url),
      )
    : [];

  let query = db
    .from("proposals")
    .select("payload")
    .eq("program_slug", slug)
    .in("state", ["pending", "needs_changes", "approved"]);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query;
  if (error) throw new Error("Could not read waiting proposals");

  const waiting = (data ?? []).flatMap((row: { payload: unknown }) => {
    const parsed = proposalPayloadSchema.safeParse(row.payload);
    return parsed.success ? proposalUrls(parsed.data) : [];
  });
  return [...published, ...waiting];
}

// Checks that the program, gap or place a proposal points to really exists.
// Returns an error message, or null when everything is fine.
export async function checkTarget(programSlug: string, payload: ProposalPayload): Promise<string | null> {
  const program = await getProgram(programSlug);
  if (payload.type === "new_program") {
    return program ? "A program with this slug already exists." : null;
  }
  if (!program) return "That program does not exist.";
  if (payload.type === "fill_gap") {
    const gap = (await getGaps()).find((item) => item.id === payload.gapId);
    if (!gap || gap.program !== programSlug) return "That gap is not listed for this program.";
  }
  if (payload.type === "correction_place" && !program.places.some((p) => p.name === payload.placeName)) {
    return "That place is not on this program.";
  }
  return null;
}

type MoveOptions = {
  id: string;
  allowedFrom: ProposalState[];
  to: ProposalState;
  actorId: string;
  authorId?: string; // when set, only the author may move it
  note?: string | null;
  reviewed?: boolean; // set reviewed_at (admin actions)
};

// Moves a proposal to a new state, only if it is in an allowed state now.
export async function moveState(
  db: SupabaseClient,
  options: MoveOptions,
): Promise<{ ok: true; row: ProposalRow } | { ok: false; error: string }> {
  const row = await getProposal(db, options.id);
  // Do not reveal that someone else's proposal exists.
  if (!row || (options.authorId && row.author_id !== options.authorId)) return fail("Proposal not found.");
  if (!options.allowedFrom.includes(row.state)) {
    return fail(`This proposal is "${row.state}", so that action is not allowed.`);
  }

  const patch: Record<string, unknown> = { state: options.to };
  if (options.note !== undefined) patch.review_note = options.note;
  if (options.reviewed) patch.reviewed_at = new Date().toISOString();

  // The extra state check stops two people changing the same row at once.
  const { data, error } = await db
    .from("proposals")
    .update(patch)
    .eq("id", options.id)
    .eq("state", row.state)
    .select("*");
  if (error || !data || data.length === 0) {
    return fail("This proposal just changed. Reload and try again.");
  }

  await logChange(db, { proposalId: options.id, actorId: options.actorId, from: row.state, to: options.to });
  return { ok: true, row: data[0] as ProposalRow };
}

// Counts an approval and promotes the author to trusted after enough of them.
export async function recordApproval(db: SupabaseClient, authorId: string) {
  const profile = await getProfile(db, authorId);
  if (!profile) return;
  const approvedCount = profile.approved_count + 1;
  const role = shouldBecomeTrusted(profile.role, approvedCount) ? "trusted" : profile.role;
  await db.from("profiles").update({ approved_count: approvedCount, role }).eq("id", authorId);
}
