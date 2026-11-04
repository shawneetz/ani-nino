// What this file does: tells server actions who is calling.
// getUser() asks Supabase to check the login token, so it cannot be faked.
import "server-only";
import { fail, type ActionResult } from "./action-result";
import { getProfile } from "./proposal-db";
import { getAdminClient, getUserClient } from "./supabase-server";

export type SessionUser = { id: string; emailVerified: boolean };

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await getUserClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return { id: data.user.id, emailVerified: Boolean(data.user.email_confirmed_at) };
}

// Admin check, done on the server for every review action.
export async function requireAdmin(): Promise<ActionResult<{ user: SessionUser }>> {
  const user = await getSessionUser();
  if (!user) return fail("Please sign in.");
  const profile = await getProfile(getAdminClient(), user.id);
  if (!profile || profile.role !== "admin" || profile.banned) return fail("Admins only.");
  return { ok: true, user };
}
