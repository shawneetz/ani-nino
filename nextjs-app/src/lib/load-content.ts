// What this file does: reads every YAML file in content/, validates it, and
// returns clean data for the pages. All errors are reported in one pass.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import type { z } from "zod";
import {
  chartSchema,
  gapSchema,
  programSchema,
  type Chart,
  type Gap,
  type Program,
  type Source,
} from "./content-schema";

export type SourceEntry = Source & { usedIn: string[] };
export type Content = {
  programs: Program[];
  charts: Chart[];
  gaps: Gap[];
  sources: SourceEntry[];
};

export class ContentError extends Error {
  issues: string[];
  constructor(issues: string[]) {
    super(`Content check failed:\n- ${issues.join("\n- ")}`);
    this.issues = issues;
  }
}

async function parseFile<T>(file: string, schema: z.ZodType<T>, issues: string[]): Promise<T | null> {
  try {
    const result = schema.safeParse(parse(await readFile(file, "utf8")));
    if (result.success) return result.data;
    for (const issue of result.error.issues) {
      issues.push(`${file}: ${issue.path.join(".") || "(root)"} ${issue.message}`);
    }
  } catch (error) {
    issues.push(`${file}: ${error instanceof Error ? error.message : String(error)}`);
  }
  return null;
}

async function yamlFiles(dir: string): Promise<string[]> {
  const names = await readdir(dir).catch(() => [] as string[]);
  return names
    .filter((name) => name.endsWith(".yaml"))
    .sort()
    .map((name) => path.join(dir, name));
}

function collectSources(programs: Program[], charts: Chart[]): SourceEntry[] {
  const byKey = new Map<string, SourceEntry>();
  const add = (source: Source, label: string) => {
    const key = `${source.title}|${source.publisher}|${source.url ?? ""}`;
    const entry = byKey.get(key) ?? { ...source, usedIn: [] };
    if (!entry.usedIn.includes(label)) entry.usedIn.push(label);
    byKey.set(key, entry);
  };

  for (const program of programs) {
    program.sources.forEach((source) => add(source, program.title));
    program.since.forEach((item) => add(item.source, program.title));
  }
  for (const chart of charts) {
    chart.points.forEach((point) => add(point.source, `Chart: ${chart.title}`));
  }
  return [...byKey.values()].sort((a, b) => a.title.localeCompare(b.title));
}

export async function loadContent(directory: string): Promise<Content> {
  const issues: string[] = [];
  const programs: Program[] = [];
  const charts: Chart[] = [];

  // The filename must match the slug or id so links and edit URLs stay predictable.
  for (const file of await yamlFiles(path.join(directory, "programs"))) {
    const program = await parseFile(file, programSchema, issues);
    if (!program) continue;
    if (path.basename(file, ".yaml") !== program.slug) {
      issues.push(`${file}: filename must match slug "${program.slug}"`);
    }
    programs.push(program);
  }
  for (const file of await yamlFiles(path.join(directory, "charts"))) {
    const chart = await parseFile(file, chartSchema, issues);
    if (!chart) continue;
    if (path.basename(file, ".yaml") !== chart.id) {
      issues.push(`${file}: filename must match id "${chart.id}"`);
    }
    charts.push(chart);
  }

  // A today program may only echo a real martial-law program.
  for (const program of programs) {
    if (!program.echoOf) continue;
    const target = programs.find((item) => item.slug === program.echoOf);
    if (!target) {
      issues.push(`programs/${program.slug}.yaml: echoOf points to unknown program "${program.echoOf}"`);
    } else if (target.era === "today") {
      issues.push(`programs/${program.slug}.yaml: echoOf must point to a martial-law program`);
    }
  }

  const gapsFile = path.join(directory, "gaps.yaml");
  const gaps = (await parseFile(gapsFile, gapSchema.array(), issues)) ?? [];
  const slugs = new Set(programs.map((program) => program.slug));
  const seenIds = new Set<string>();
  for (const gap of gaps) {
    if (seenIds.has(gap.id)) issues.push(`${gapsFile}: duplicate gap id "${gap.id}"`);
    seenIds.add(gap.id);
    if (gap.program && !slugs.has(gap.program)) {
      issues.push(`${gapsFile}: gap "${gap.id}" points to unknown program "${gap.program}"`);
    }
  }

  if (issues.length > 0) throw new ContentError(issues);
  programs.sort((a, b) => a.startYear - b.startYear || a.title.localeCompare(b.title));
  return { programs, charts, gaps, sources: collectSources(programs, charts) };
}
