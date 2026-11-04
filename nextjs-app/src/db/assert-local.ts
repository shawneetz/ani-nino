// What this file does: refuses to run tests against a Supabase database.
// Tests insert and delete rows, so they must only ever touch the LOCAL database.
export function assertLocalDb(url: string, name: string): void {
  if (/supabase/i.test(url)) {
    throw new Error(
      `${name} points at Supabase. Tests must run on the local database. Check your .env file.`,
    );
  }
}
