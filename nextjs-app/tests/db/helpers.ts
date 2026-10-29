import "dotenv/config";
import { Pool, type PoolClient } from "pg";
import { expect } from "vitest";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for database tests`);
  return value;
}

export const ownerPool = new Pool({
  connectionString: requiredEnv("DATABASE_URL_MIGRATE"),
  max: 4,
});
export const appPool = new Pool({
  connectionString: requiredEnv("DATABASE_URL"),
  max: 2,
});

export async function closePools() {
  await Promise.all([ownerPool.end(), appPool.end()]);
}

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

export const CHECK_VIOLATION = "23514";
export const UNIQUE_VIOLATION = "23505";
export const FK_VIOLATION = "23503";

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

let counter = 0;
export const uid = (prefix: string) => `${prefix}-${++counter}-${Date.now().toString(36)}`;

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
  badge: "government_record",
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
