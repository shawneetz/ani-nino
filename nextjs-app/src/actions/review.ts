// What this file does: server actions for the admin (you). Every action checks
// the admin role on the server first. Approving opens a GitHub pull request;
// nothing goes live until you merge it.
"use server";

import { revalidatePath } from "next/cache";
import { fail, messageFor, type ActionResult } from "@/lib/action-result";
import { getRepoFile, openPullRequest } from "@/lib/github";
import { applyProposal, filesNeeded } from "@/lib/proposal-to-yaml";
import {
  getProfile,
  getProposal,
  logChange,
  moveState,
  recordApproval,
  type ProposalRow,
} from "@/lib/proposal-db";
import { proposalPayloadSchema, reviewNoteSchema, type ProposalPayload } from "@/lib/proposal-schema";
import { requireAdmin } from "@/lib/session";
import { getAdminClient } from "@/lib/supabase-server";

function refresh() {
  revalidatePath("/admin/review");
  revalidatePath("/me");
}

// The text of the pull request. It reminds you what to check before merging.
function buildPrBody(row: ProposalRow, payload: ProposalPayload): string {
  const sources = payload.type === "new_program" ? payload.program.sources : [payload.source];
  const sourceLines = sources.map((s) => `- ${s.title} (${s.publisher}), label: ${s.voice}, ${s.url}`);
  return [
    `Proposal \`${row.id}\` (${payload.type}) for \`${row.program_slug}\`.`,
    "",
    `Reason from the contributor: ${row.reason}`,
    "",
    "Sources in this proposal:",
    ...sourceLines,
    "",
    "Before you merge:",
    "- [ ] Open every link and read the source",
    "- [ ] Check that each label (Government, Court/archive/study, ...) is honest",
    "- [ ] Check that the text has no opinions and no long quotes",
    "- [ ] Check the program status. If it says confirmed, check it again",
  ].join("\n");
}

export async function approveProposal(id: string): Promise<ActionResult<{ prUrl: string }>> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return fail(admin.error);
    const db = getAdminClient();

    const row = await getProposal(db, id);
    if (!row) return fail("Proposal not found.");
    // Check the saved payload again. Never trust stored data blindly.
    const payload = proposalPayloadSchema.safeParse(row.payload);
    if (!payload.success) return fail("The saved proposal is not valid anymore.");

    // Step 1: claim it. If two clicks happen, only one wins.
    const claimed = await moveState(db, {
      id,
      allowedFrom: ["pending"],
      to: "approved",
      actorId: admin.user.id,
      reviewed: true,
    });
    if (!claimed.ok) return fail(claimed.error);

    try {
      // Step 2: read the latest files from GitHub and apply the change.
      const paths = filesNeeded(row.program_slug, payload.data);
      const files: Record<string, string | null> = {};
      for (const path of paths) files[path] = await getRepoFile(path);
      const changes = applyProposal({ programSlug: row.program_slug, payload: payload.data, files });

      // Step 3: open the pull request.
      const prUrl = await openPullRequest({
        branch: `proposal/${row.id.slice(0, 8)}-${Date.now().toString(36)}`,
        title: `Proposal (${payload.data.type}): ${row.program_slug}`,
        body: buildPrBody(row, payload.data),
        commitMessage: `Proposal ${row.id.slice(0, 8)}: ${payload.data.type} for ${row.program_slug}`,
        changes,
      });

      await db.from("proposals").update({ pr_url: prUrl }).eq("id", id);
      await recordApproval(db, row.author_id);
      refresh();
      return { ok: true, prUrl };
    } catch (error) {
      // Put it back in the queue so you can try again.
      await db.from("proposals").update({ state: "pending", reviewed_at: null }).eq("id", id);
      await logChange(db, { proposalId: id, actorId: admin.user.id, from: "approved", to: "pending" });
      return fail(messageFor(error));
    }
  } catch (error) {
    return fail(messageFor(error));
  }
}

// Sends the proposal back to its author with a note.
export async function requestChanges(id: string, note: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return fail(admin.error);
    const parsedNote = reviewNoteSchema.safeParse(note);
    if (!parsedNote.success) return fail("Write a short plain-text note for the contributor.");

    const result = await moveState(getAdminClient(), {
      id,
      allowedFrom: ["pending"],
      to: "needs_changes",
      actorId: admin.user.id,
      note: parsedNote.data,
      reviewed: true,
    });
    if (!result.ok) return fail(result.error);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(messageFor(error));
  }
}

// Closes the proposal with a reason the contributor can read.
export async function rejectProposal(id: string, note: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return fail(admin.error);
    const parsedNote = reviewNoteSchema.safeParse(note);
    if (!parsedNote.success) return fail("Write a short plain-text reason.");

    const result = await moveState(getAdminClient(), {
      id,
      allowedFrom: ["pending", "needs_changes"],
      to: "rejected",
      actorId: admin.user.id,
      note: parsedNote.data,
      reviewed: true,
    });
    if (!result.ok) return fail(result.error);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(messageFor(error));
  }
}

// Marks an approved proposal as published after you merged its pull request.
export async function markPublished(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return fail(admin.error);
    const result = await moveState(getAdminClient(), {
      id,
      allowedFrom: ["approved"],
      to: "published",
      actorId: admin.user.id,
    });
    if (!result.ok) return fail(result.error);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(messageFor(error));
  }
}

// Bans an account and closes all of its waiting proposals.
export async function banUser(userId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return fail(admin.error);
    const db = getAdminClient();

    const target = await getProfile(db, userId);
    if (!target) return fail("User not found.");
    if (target.role === "admin") return fail("You cannot ban an admin.");

    const { error } = await db.from("profiles").update({ banned: true }).eq("id", userId);
    if (error) return fail("Could not ban this user.");

    const { data } = await db
      .from("proposals")
      .select("id")
      .eq("author_id", userId)
      .in("state", ["pending", "needs_changes"]);
    for (const item of (data ?? []) as { id: string }[]) {
      await moveState(db, {
        id: item.id,
        allowedFrom: ["pending", "needs_changes"],
        to: "rejected",
        actorId: admin.user.id,
        note: "This account can no longer submit proposals.",
        reviewed: true,
      });
    }
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(messageFor(error));
  }
}

// Promotes to trusted, or takes trusted away.
export async function setUserRole(userId: string, role: "contributor" | "trusted"): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return fail(admin.error);
    if (role !== "contributor" && role !== "trusted") return fail("Invalid role.");
    const db = getAdminClient();

    const target = await getProfile(db, userId);
    if (!target) return fail("User not found.");
    if (target.role === "admin") return fail("You cannot change an admin's role.");

    const { error } = await db.from("profiles").update({ role }).eq("id", userId);
    if (error) return fail("Could not change the role.");
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(messageFor(error));
  }
}
