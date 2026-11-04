// What this file does: shared helpers for the database tests
// (connections, rollback wrapper, and valid example rows to break on purpose).
import "dotenv/config";
import { Pool, type PoolClient } from "pg";
import { expect } from "vitest";
import { assertLocalDb } from "../../src/db/assert-local";

// Reads a required env var and refuses Supabase URLs.
function requiredLocalUrl(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for database tests`);
  assertLocalDb(value, name);
  return value;
}

// ownerPool can write (used to insert test rows); appPool is the read-only role.
export const ownerPool = new Pool({
  connectionString: requiredLocalUrl("DATABASE_URL_MIGRATE"),
  max: 4,
});
export const appPool = new Pool({
  connectionString: requiredLocalUrl("DATABASE_URL"),
  max: 2,
});

export async function closePools() {
  await Promise.all([ownerPool.end(), appPool.end()]);
}

// Runs a test inside a transaction and always rolls it back.
export async function withRollback(fn: (client: PoolClient) => Promise<void>) {
  const client = await ownerPool.connect();
  try {
    await client.query("BEGIN");
    await fn(client);
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }
}

// Postgres error codes we expect to see.
export const CHECK_VIOLATION = "23514";
export const UNIQUE_VIOLATION = "23505";
export const FK_VIOLATION = "23503";

// Expects the statement to fail with a specific Postgres error.
export async function expectDbError(
  statement: Promise<unknown>,
  code: string | string[],
  constraint?: string,
) {
  let error: (Error & { code?: string; constraint?: string }) | undefined;
  try {
    await statement;
  } catch (caught) {
    error = caught as Error & { code?: string; constraint?: string };
  }
  expect(error, "the database should have rejected this statement").toBeDefined();
  if (!error) throw new Error("Expected a PostgreSQL constraint error");
  expect(Array.isArray(code) ? code : [code]).toContain(error.code);
  if (constraint) expect(error.constraint).toBe(constraint);
}

export type Row = Record<string, unknown>;

export function insert(client: PoolClient, table: string, row: Row) {
  const columns = Object.keys(row);
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
  return client.query(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`,
    Object.values(row),
  );
}

// Unique ids so tests never collide with each other.
let counter = 0;
export const uid = (prefix: string) => `${prefix}-${++counter}-${Date.now().toString(36)}`;

// A valid martial-law pin. Tests override one field to break one rule.
export const validPin = (overrides: Row = {}): Row => ({
  id: uid("pin"),
  layer: "martial_law",
  title: "Test pin",
  family: "land_reform",
  start_date: "1975-06-01",
  end_date: "1976-06-01",
  date_label: "Jun 1975 to Jun 1976",
  promise: "What the program said it would do.",
  record: "What the record shows.",
  badge: "official",
  status: "lead",
  open_question: "Find the exact date.",
  ...overrides,
});

export const validTodayPin = (overrides: Row = {}): Row =>
  validPin({
    layer: "today",
    start_date: "2021-01-01",
    end_date: null,
    date_label: "Jan 2021",
    ...overrides,
  });

export const validLocation = (pinId: string, overrides: Row = {}): Row => ({
  pin_id: pinId,
  name: "Calamba",
  municipality: "Calamba",
  province: "laguna",
  lat: 14.2117,
  lng: 121.1653,
  ...overrides,
});

export const validSource = (overrides: Row = {}): Row => ({
  id: uid("source"),
  title: "Test source",
  publisher: "Test publisher",
  kind: "news",
  ...overrides,
});

export const validVideo = (overrides: Row = {}): Row => ({
  id: uid("video"),
  youtube_id: "dQw4w9WgXcQ",
  title: "Test video",
  channel: "Test channel",
  credit_line: "Credit: Test channel",
  ...overrides,
});
