// What this file does: checks everything in data/ without touching any database.
// Run it with: pnpm db:validate. CI runs it, so a bad commit fails before deploy.
import { loadSeedData, SeedDataError } from "../src/lib/seed-load";
import { validateSeed } from "../src/lib/seed-validate";

async function main(): Promise<void> {
  // Step 1: parse the files (shape and allowed values).
  const bundle = await loadSeedData("data");

  // Step 2: cross-check the data (sources exist, one anchor, and so on).
  const { errors, warnings } = validateSeed(bundle);

  for (const warning of warnings) console.warn(`warning: ${warning}`);

  if (errors.length > 0) {
    console.error(`\n${errors.length} validation error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `data/ is valid: ${bundle.pins.length} pins, ${bundle.sources.length} sources, ` +
      `${bundle.links.length} links, ${bundle.charts.length} charts, ` +
      `${bundle.videos.length} videos, ${bundle.gaps.length} gaps`,
  );
}

main().catch((error: unknown) => {
  // Parse problems are already formatted as a readable list.
  console.error(error instanceof SeedDataError ? error.message : error);
  process.exitCode = 1;
});
