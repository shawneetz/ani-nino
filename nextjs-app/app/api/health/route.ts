// The app stays healthy when Postgres is unreachable because its data snapshot is bundled.
import { desc } from "drizzle-orm";
import { checkDb, getDb } from "@/db/client";
import { seedRuns } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await checkDb();
  let seed: { gitSha: string | null; seededAt: Date } | null = null;
  if (db.up) {
    try {
      const [row] = await getDb()
        .select({ gitSha: seedRuns.gitSha, seededAt: seedRuns.seededAt })
        .from(seedRuns)
        .orderBy(desc(seedRuns.id))
        .limit(1);
      seed = row ?? null;
    } catch (error) {
      console.error(
        "[db] failed to read latest seed run:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return Response.json(
    {
      ok: true,
      db: db.up ? "up" : "down",
      dbLatencyMs: db.up ? db.latencyMs : null,
      seed,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
