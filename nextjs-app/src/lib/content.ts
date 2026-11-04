// What this file does: the server-only door to program content.
import { loadContent } from "./load-content";
type Content = Awaited<ReturnType<typeof loadContent>>;
let cached: Promise<Content> | null = null;
function load(): Promise<Content> {
  if (process.env.NODE_ENV !== "production") return loadContent("content");
  cached ??= loadContent("content");
  return cached;
}
export async function getPrograms() { return (await load()).programs; }
export async function getProgram(slug: string) { return (await load()).programs.find((program) => program.slug === slug) ?? null; }
export async function getCharts() { return (await load()).charts; }
export async function getGaps() { return (await load()).gaps; }
export async function getSources() { return (await load()).sources; }
