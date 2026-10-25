import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { snapshotSchema, type PinDetail, type Snapshot } from "@/lib/api-schemas";
import type { ExplorerPin } from "@/lib/map-types";
import { visiblePinsForUi } from "@/lib/visible-for-ui";

let cached: Snapshot | undefined;

async function getSnapshot(): Promise<Snapshot> {
  if (cached) return cached;

  const file = path.join(process.cwd(), "snapshot", "snapshot.json");
  const text = await readFile(file, "utf8");
  cached = snapshotSchema.parse(JSON.parse(text));
  return cached;
}

export async function getPins(options: {
  month?: string;
  mode?: "range" | "all";
  families?: string[];
  provinces?: string[];
  today?: boolean;
} = {}): Promise<ExplorerPin[]> {
  const { pins } = await getSnapshot();
  if (options.month === undefined && options.mode === undefined) return pins;

  return visiblePinsForUi(pins, {
    month: options.month ?? "1975-06",
    mode: options.mode ?? "range",
    families: options.families ?? [],
    provinces: options.provinces ?? [],
    today: options.today ?? false,
  });
}

export async function getPinDetail(slug: string): Promise<PinDetail | null> {
  const snapshot = await getSnapshot();
  return snapshot.details[slug] ?? null;
}

export async function getSnapshotMetadata(): Promise<Pick<Snapshot, "generatedAt" | "methods">> {
  const { generatedAt, methods } = await getSnapshot();
  return { generatedAt, methods };
}
