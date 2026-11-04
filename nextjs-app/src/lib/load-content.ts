// What this file does: provides the server-side content boundary for programs.
// The content directory is intentionally empty in this batch.
import type { Program } from "./content-schema";

export type Content = {
  programs: Program[];
  charts: never[];
  gaps: never[];
  sources: never[];
};

export async function loadContent(directory: string): Promise<Content> {
  void directory;
  return { programs: [], charts: [], gaps: [], sources: [] };
}
