import "dotenv/config";
import { runMigrations } from "../src/db/migrate";

const connectionString = process.env.DATABASE_URL_MIGRATE;
if (!connectionString) {
  console.error("DATABASE_URL_MIGRATE is not set. Copy .env.example to .env first.");
  process.exit(1);
}

const target = new URL(connectionString);
console.log(
  `Migrating ${target.hostname}:${target.port || 5432}${target.pathname} as ${target.username} ...`,
);

runMigrations(connectionString)
  .then(() => console.log("Migrations applied."))
  .catch((error: unknown) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  });
