// What this file does: proves the seed script really writes the data,
// and that running it twice gives the same result (no duplicates, no orphans).
// WARNING: it empties the content tables of the LOCAL test database.
import { afterAll, describe, expect, it } from "vitest";
import { requireTestDbUrl } from "../../src/db/test-fixtures";
import { seedDatabase } from "../../src/db/seed";
import { sampleBundle } from "../../src/lib/__fixtures__/seed-bundle";
import { closePools, ownerPool } from "./helpers";

afterAll(closePools);

const TABLES = [
  "sources", "pins", "pin_locations", "pin_sources", "pin_events",
  "pin_links", "videos", "research_gaps", "charts", "chart_series", "chart_points",
];

// Counts rows in every content table.
async function tableCounts() {
  const result: Record<string, number> = {};
  for (const table of TABLES) {
    const { rows } = await ownerPool.query(`SELECT count(*)::int AS n FROM ${table}`);
    result[table] = rows[0].n;
  }
  return result;
}

describe("seedDatabase", () => {
  it("loads every row from the bundle", async () => {
    const counts = await seedDatabase(sampleBundle(), requireTestDbUrl(), "test");
    expect(counts.pins).toBe(2);
    expect(await tableCounts()).toEqual({
      sources: 2,
      pins: 2,
      pin_locations: 2,
      pin_sources: 3,
      pin_events: 1,
      pin_links: 1,
      videos: 1,
      research_gaps: 1,
      charts: 1,
      chart_series: 2,
      chart_points: 2,
    });
  });

  it("gives identical counts when run twice and records each run", async () => {
    await seedDatabase(sampleBundle(), requireTestDbUrl(), "run-1");
    const first = await tableCounts();
    await seedDatabase(sampleBundle(), requireTestDbUrl(), "run-2");
    expect(await tableCounts()).toEqual(first);

    const { rows } = await ownerPool.query(
      "SELECT git_sha, counts FROM seed_runs ORDER BY id DESC LIMIT 1",
    );
    expect(rows[0].git_sha).toBe("run-2");
    expect(rows[0].counts.pins).toBe(2);
  });
});
