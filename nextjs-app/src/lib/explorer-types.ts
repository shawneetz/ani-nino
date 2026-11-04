// What this file does: defines the slim browser-safe program representation.
import type { Program } from "./content-schema";
import type { Province, ProgramStatus, Topic } from "./vocab";
export type ExplorerPlace = { name: string; province: Province; lat: number; lng: number; approximate: boolean };
export type ExplorerProgram = { slug: string; title: string; when: string; topic: Topic; status: ProgramStatus; startYear: number; endYear: number | null; places: ExplorerPlace[] };
export function toExplorerProgram(p: Program): ExplorerProgram {
  return { slug: p.slug, title: p.title, when: p.when, topic: p.topic, status: p.status, startYear: p.startYear, endYear: p.endYear ?? null, places: p.places };
}
