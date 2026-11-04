// What this file does: summarizes the perspectives represented in a program.
import type { Source } from "./content-schema";
import type { Voice } from "./vocab";
export function uniqueVoices(sources: Pick<Source, "voice">[]): Voice[] {
  const order: Voice[] = ["official", "independent", "advocacy", "supporter"];
  return order.filter((voice) => sources.some((source) => source.voice === voice));
}
export function partisanNote(sources: Pick<Source, "voice">[]): string | null {
  const voices = uniqueVoices(sources);
  if (voices.some((voice) => voice === "official" || voice === "independent")) return null;
  if (voices.length === 1 && voices[0] === "advocacy") return "Based only on advocacy sources";
  if (voices.length === 1 && voices[0] === "supporter") return "Based only on program supporters";
  return voices.length ? "Based only on advocacy sources and program supporters" : null;
}
