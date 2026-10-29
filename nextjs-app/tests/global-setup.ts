import "dotenv/config";
import { runMigrations } from "../src/db/migrate";

export default async function setup() {
  const connectionString = process.env.DATABASE_URL_MIGRATE;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL_MIGRATE is not set. Run `pnpm db:setup-local` and copy .env.example to .env.",
    );
  }
  await runMigrations(connectionString);
}
