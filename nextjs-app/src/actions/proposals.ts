// What this file does: server actions for contributors. Every limit is checked
// here on the server, so sending a request directly cannot skip them.
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fail, messageFor, type ActionResult } from "@/lib/action-result";
import { checkCanSubmit } from "@/lib/limits";
import {
  checkTarget,
  countLast24h,
  countOpen,
  existingUrlsFor,
  getProfile,
  getProposal,
  logChange,
  moveState,
} from "@/lib/proposal-db";
import { formatIssues, proposalInputSchema, proposalUrls } from "@/lib/proposal-schema";
import { getSessionUser } from "@/lib/session";
import { getAdminClient } from "@/lib/supabase-server";
import { verifyTurnstile } from "@/lib/turnstile";

// What the form sends. "website" is a hidden honeypot field: real people leave it empty.
const envelopeSchema = z.object({
  proposal: z.unknown(),
  turnstileToken: z.string().optional(),
  website: z.string().optional(),
});

export async function submitProposal(raw: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const envelope = envelopeSchema.safeParse(raw);
    if (!envelope.success) return fail("The form data is not valid.");

    // A bot filled the hidden field. Pretend it worked and save nothing.
    if (envelope.data.website) return { ok: true, id: "ignored" };

    const user = await getSessionUser();
    if (!user) return fail("Please sign in first.");
    if (!(await verifyTurnstile(envelope.data.turnstileToken))) {
      return fail("The bot check failed. Please try again.");
    }

    const parsed = proposalInputSchema.safeParse(envelope.data.proposal);
    if (!parsed.success) return fail(formatIssues(parsed.error));
    const { programSlug, reason, payload } = parsed.data;

    const db = getAdminClient();
    const profile = await getProfile(db, user.id);
    if (!profile) return fail("Your profile was not found.");

    const targetError = await checkTarget(programSlug, payload);
    if (targetError) return fail(targetError);

    const check = checkCanSubmit({
      role: profile.role,
      banned: profile.banned,
      emailVerified: user.emailVerified,
      approvedCount: profile.approved_count,
      openCount: await countOpen(db, user.id),
      last24hCount: await countLast24h(db, user.id),
      proposalType: payload.type,
      urls: proposalUrls(payload),
      existingUrls: await existingUrlsFor(db, programSlug),
    });
    if (!check.ok) return fail(check.error);

    const { data, error } = await db
      .from("proposals")
      .insert({ author_id: user.id, program_slug: programSlug, type: payload.type, payload, reason, state: "pending" })
      .select("id")
      .single();
    if (error || !data) return fail("Could not save your proposal. Please try again.");

    await logChange(db, { proposalId: data.id, actorId: user.id, from: null, to: "pending" });
    revalidatePath("/me");
    revalidatePath("/admin/review");
    return { ok: true, id: data.id };
  } catch (error) {
    return fail(messageFor(error));
  }
}

// The author fixes a proposal that came back with "needs changes".
export async function resubmitProposal(id: string, raw: unknown): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    if (!user) return fail("Please sign in first.");

    const db = getAdminClient();
    const row = await getProposal(db, id);
    if (!row || row.author_id !== user.id) return fail("Proposal not found.");
    if (row.state !== "needs_changes") return fail("Only proposals that need changes can be resubmitted.");

    const parsed = proposalInputSchema.safeParse(raw);
    if (!parsed.success) return fail(formatIssues(parsed.error));
    const { programSlug, reason, payload } = parsed.data;
    // The target program cannot change when resubmitting.
    if (programSlug !== row.program_slug) return fail("You cannot change the program of a proposal.");

    const profile = await getProfile(db, user.id);
    if (!profile) return fail("Your profile was not found.");

    const targetError = await checkTarget(programSlug, payload);
    if (targetError) return fail(targetError);

    const check = checkCanSubmit({
      role: profile.role,
      banned: profile.banned,
      emailVerified: user.emailVerified,
      approvedCount: profile.approved_count,
      openCount: await countOpen(db, user.id, id), // do not count this proposal twice
      last24hCount: 0,
      isResubmit: true,
      proposalType: payload.type,
      urls: proposalUrls(payload),
      existingUrls: await existingUrlsFor(db, programSlug, id),
    });
    if (!check.ok) return fail(check.error);

    const { data, error } = await db
      .from("proposals")
      .update({ payload, type: payload.type, reason, state: "pending", review_note: null })
      .eq("id", id)
      .eq("author_id", user.id)
      .eq("state", "needs_changes")
      .select("id");
    if (error || !data || data.length === 0) return fail("Could not resubmit. Reload and try again.");

    await logChange(db, { proposalId: id, actorId: user.id, from: "needs_changes", to: "pending" });
    revalidatePath("/me");
    revalidatePath("/admin/review");
    return { ok: true };
  } catch (error) {
    return fail(messageFor(error));
  }
}

// The author takes back a proposal that is still waiting.
export async function withdrawProposal(id: string): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    if (!user) return fail("Please sign in first.");

    const result = await moveState(getAdminClient(), {
      id,
      allowedFrom: ["pending", "needs_changes"],
      to: "withdrawn",
      actorId: user.id,
      authorId: user.id,
    });
    if (!result.ok) return fail(result.error);

    revalidatePath("/me");
    revalidatePath("/admin/review");
    return { ok: true };
  } catch (error) {
    return fail(messageFor(error));
  }
}
