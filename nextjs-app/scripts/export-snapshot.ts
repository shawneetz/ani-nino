import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { closePool } from "../src/db/client";
import { buildSnapshot } from "../src/db/queries";
import { snapshotSchema } from "../src/lib/api-schemas";

const outputFile = process.argv[2] ?? path.join("snapshot", "snapshot.json");

async function main(): Promise<void> {
  const snapshot = snapshotSchema.parse(await buildSnapshot());
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(
    `Snapshot written to ${outputFile}: ${snapshot.pins.length} pins, ` +
      `${snapshot.charts.length} charts, ${snapshot.methods.counts.sources} sources`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closePool);
