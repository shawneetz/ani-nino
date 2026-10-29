import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & { __aninoPool?: Pool };

export function getPool(): Pool {
  if (!globalForDb.__aninoPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set");

    const pool = new Pool({
      connectionString,
      max: 5,
      connectionTimeoutMillis: 2_000,
      idleTimeoutMillis: 30_000,
    });
    pool.on("error", (error) => {
      console.error("[db] idle client error:", error.message);
    });
    globalForDb.__aninoPool = pool;
  }
  return globalForDb.__aninoPool;
}

export function getDb() {
  return drizzle(getPool(), { schema });
}

export async function closePool(): Promise<void> {
  const pool = globalForDb.__aninoPool;
  if (!pool) return;
  delete globalForDb.__aninoPool;
  await pool.end();
}

export type DbStatus = { up: true; latencyMs: number } | { up: false };

export async function checkDb(timeoutMs = 3_000): Promise<DbStatus> {
  const started = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      getPool().query("SELECT 1"),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("db check timed out")), timeoutMs);
      }),
    ]);
    return { up: true, latencyMs: Date.now() - started };
  } catch (error) {
    console.error(
      "[db] check failed:",
      error instanceof Error ? error.message : error,
    );
    return { up: false };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
