// what this file does: defines the slim, browser-safe program shape used by the explorer
// change in this version: added summary (first sentence of "happened") and voices,
// so list cards and the preview card need no extra data
import type { Program } from "./content-schema";
import { firstSentence } from "./first-sentence";
import { uniqueVoices } from "./source-summary";
import type { Era, Province, ProgramStatus, Topic, Voice } from "./vocab";

export type ExplorerPlace = { name: string; province: Province; lat: number; lng: number; approximate: boolean };

export type ExplorerProgram = {
  slug: string;
  title: string;
  when: string;
  topic: Topic;
  era: Era;
  status: ProgramStatus;
  startYear: number;
  endYear: number | null;
  places: ExplorerPlace[];
  summary: string; // first sentence of "happened"
  voices: Voice[]; // who says so, in a fixed order
  plain?: Program["plain"];
};

export function toExplorerProgram(p: Program): ExplorerProgram {
  return {
    slug: p.slug,
    title: p.title,
    when: p.when,
    topic: p.topic,
    era: p.era,
    status: p.status,
    startYear: p.startYear,
    endYear: p.endYear ?? null,
    places: p.places,
    summary: firstSentence(p.happened, 220),
    voices: uniqueVoices(p.sources),
    plain: p.plain,
  };
}
