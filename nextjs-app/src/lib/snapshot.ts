import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { snapshotSchema, type Snapshot } from "./api-schemas";

let memo: { file: string; snapshot: Snapshot } | undefined;

export function clearSnapshotCache(): void {
  memo = undefined;
}

export async function readSnapshot(): Promise<Snapshot> {
  const file = path.resolve(process.env.SNAPSHOT_PATH ?? "snapshot/snapshot.json");
  if (memo?.file === file) return memo.snapshot;

  try {
    const raw = await readFile(file, "utf8");
    const snapshot = snapshotSchema.parse(JSON.parse(raw));
    memo = { file, snapshot };
    return snapshot;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Snapshot unavailable at ${file}: ${reason}`);
  }
}
