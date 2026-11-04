// What this file does: validates data/ and then loads it into the database.
// Run it with: pnpm db:seed  (it reads .env.supabase, see package.json).
// It does NOT load .env on purpose, so it can never silently use the wrong database.
import { execSync } from "node:child_process";
import { seedDatabase } from "../src/db/seed";
import { loadSeedData, SeedDataError } from "../src/lib/seed-load";
import { validateSeed } from "../src/lib/seed-validate";

// Short git commit id, saved in seed_runs so you know which data was loaded.
function gitSha(): string | null {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL_MIGRATE;
  if (!connectionString) {
    console.error("DATABASE_URL_MIGRATE is not set. Run this through the pnpm script.");
    process.exitCode = 1;
    return;
  }

  // Never seed anything that did not pass validation.
  const bundle = await loadSeedData("data");
  const { errors, warnings } = validateSeed(bundle);
  for (const warning of warnings) console.warn(`warning: ${warning}`);
  if (errors.length > 0) {
    console.error(`\n${errors.length} validation error(s), nothing was seeded:`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  // Show where we are writing, without printing the password.
  const target = new URL(connectionString);
  console.log(`Seeding ${target.hostname}:${target.port || 5432}${target.pathname} as ${target.username} ...`);

  const counts = await seedDatabase(bundle, connectionString, gitSha());
  console.log("Seed complete. Rows loaded:");
  console.table(counts);
}

main().catch((error: unknown) => {
  console.error(error instanceof SeedDataError ? error.message : error);
  process.exitCode = 1;
});
