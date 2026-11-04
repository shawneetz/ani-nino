// What this file does: one shared result shape for server actions, plus an
// error type whose message is safe to show to the user.

// Every action returns either { ok: true, ...data } or { ok: false, error }.
export type ActionResult<T extends object = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

export function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

// An error whose message can be shown to the user as it is.
export class SafeError extends Error {}

// Shows SafeError messages. Hides everything else behind a generic message,
// so secrets or database details never reach the browser.
export function messageFor(error: unknown): string {
  if (error instanceof SafeError) return error.message;
  console.error(error);
  return "Something went wrong. Please try again.";
}
