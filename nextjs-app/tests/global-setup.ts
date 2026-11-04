// What this file does: applies migrations to the LOCAL test database before tests run.
import "dotenv/config";
import { assertLocalDb } from "../src/db/assert-local";
import { runMigrations } from "../src/db/migrate";

export default async function setup() {
  const connectionString = process.env.DATABASE_URL_MIGRATE;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL_MIGRATE is not set. Run `pnpm db:setup-local` and copy .env.example to .env.",
    );
  }
  // Safety: never migrate or test against Supabase from here.
  assertLocalDb(connectionString, "DATABASE_URL_MIGRATE");
  await runMigrations(connectionString);
}
