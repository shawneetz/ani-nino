// What this file does: defines the empty-content contract used by the program
// explorer. Content can be added later without changing the page components.
import type { Province, ProgramStatus, Topic, Voice } from "./vocab";

export type Place = {
  name: string;
  province: Province;
  lat: number;
  lng: number;
  approximate: boolean;
};

export type Source = {
  title: string;
  publisher: string;
  voice: Voice;
  cite?: string;
  url?: string;
  accessed?: string;
  backs?: "promise" | "happened" | "context";
};

export type Program = {
  slug: string;
  title: string;
  when: string;
  topic: Topic;
  status: ProgramStatus;
  startYear: number;
  endYear?: number | null;
  places: Place[];
  promised?: string;
  happened: string;
  question?: string;
  since: { year: number; text: string; source: Source }[];
  sources: Source[];
  checkedOn?: string;
  video?: { youtubeId: string; title: string; channel: string };
};
