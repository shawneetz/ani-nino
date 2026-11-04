// What this file does: reads every file in data/ and parses it with the seed schemas.
// It collects ALL problems and reports them together, with the file and item id,
// so you can fix a whole batch in one go.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { z } from "zod";
import {
  seedChartSchema,
  seedGapSchema,
  seedLinkSchema,
  seedPinSchema,
  seedSourceSchema,
  seedVideoSchema,
  type SeedBundle,
} from "./seed-schemas";

// Thrown when files are missing, not valid JSON, or fail the schemas.
export class SeedDataError extends Error {
  problems: string[];
  constructor(problems: string[]) {
    super(`Seed data has ${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
    this.name = "SeedDataError";
    this.problems = problems;
  }
}

function isNotFound(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

// Reads one JSON file. Optional files that do not exist count as an empty list.
async function readJson(file: string, required: boolean, problems: string[]): Promise<unknown> {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (!required && isNotFound(error)) return [];
    problems.push(`${file}: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

// Parses each array item on its own so a message can name the item's id.
function parseArray<S extends z.ZodType>(
  file: string,
  raw: unknown,
  schema: S,
  problems: string[],
): z.output<S>[] {
  if (!Array.isArray(raw)) {
    problems.push(`${file}: must contain a JSON array`);
    return [];
  }
  const parsed: z.output<S>[] = [];
  raw.forEach((item, index) => {
    const result = schema.safeParse(item);
    if (result.success) {
      parsed.push(result.data);
      return;
    }
    const maybeId = (item as { id?: unknown } | null)?.id;
    const label = typeof maybeId === "string" ? maybeId : `item #${index}`;
    for (const issue of result.error.issues) {
      const where = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      problems.push(`${file} [${label}]: ${where}${issue.message}`);
    }
  });
  return parsed;
}

export async function loadSeedData(dir = "data"): Promise<SeedBundle> {
  const problems: string[] = [];

  const sources = parseArray(
    `${dir}/sources.json`,
    await readJson(path.join(dir, "sources.json"), true, problems),
    seedSourceSchema,
    problems,
  );

  // Every .json file inside data/pins/ is loaded, in alphabetical order.
  const pins: SeedBundle["pins"] = [];
  try {
    const files = (await readdir(path.join(dir, "pins"))).filter((f) => f.endsWith(".json")).sort();
    for (const file of files) {
      const raw = await readJson(path.join(dir, "pins", file), true, problems);
      pins.push(...parseArray(`${dir}/pins/${file}`, raw, seedPinSchema, problems));
    }
  } catch (error) {
    problems.push(`${dir}/pins: ${error instanceof Error ? error.message : String(error)}`);
  }

  const links = parseArray(
    `${dir}/links.json`,
    await readJson(path.join(dir, "links.json"), false, problems),
    seedLinkSchema,
    problems,
  );
  const charts = parseArray(
    `${dir}/charts.json`,
    await readJson(path.join(dir, "charts.json"), false, problems),
    seedChartSchema,
    problems,
  );
  const videos = parseArray(
    `${dir}/videos.json`,
    await readJson(path.join(dir, "videos.json"), false, problems),
    seedVideoSchema,
    problems,
  );
  const gaps = parseArray(
    `${dir}/gaps.json`,
    await readJson(path.join(dir, "gaps.json"), false, problems),
    seedGapSchema,
    problems,
  );

  if (problems.length > 0) throw new SeedDataError(problems);
  return { sources, pins, links, charts, videos, gaps };
}
