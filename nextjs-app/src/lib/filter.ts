// What this file does: shared filter logic for the map, list and count, plus
// helpers that read and write filters in the URL.
import {
  FIRST_YEAR,
  LAST_YEAR,
  PROVINCE_KEYS,
  TOPIC_KEYS,
  type Province,
  type Topic,
} from "./vocab";

export type Filterable = {
  startYear: number;
  endYear?: number | null;
  topic: Topic;
  places: { province: Province }[];
};

export type Filters = { year: number | null; topics: Topic[]; provinces: Province[] };
export const EMPTY_FILTERS: Filters = { year: null, topics: [], provinces: [] };

export function isActiveInYear(p: Filterable, year: number): boolean {
  return p.startYear <= year && year <= (p.endYear ?? LAST_YEAR);
}

// The one filter used everywhere. Empty topic/province lists mean no restriction.
export function visiblePrograms<T extends Filterable>(programs: T[], f: Filters): T[] {
  return programs.filter((p) => {
    if (f.year !== null && !isActiveInYear(p, f.year)) return false;
    if (f.topics.length > 0 && !f.topics.includes(p.topic)) return false;
    if (f.provinces.length > 0 && !p.places.some((place) => f.provinces.includes(place.province))) {
      return false;
    }
    return true;
  });
}

export function yearRange(p: Pick<Filterable, "startYear" | "endYear">): string {
  if (p.endYear == null) return `${p.startYear} onward`;
  if (p.endYear === p.startYear) return `${p.startYear}`;
  return `${p.startYear} to ${p.endYear}`;
}

function pickKeys<K extends string>(raw: string | null, allowed: readonly K[]): K[] {
  if (!raw) return [];
  const out: K[] = [];
  for (const part of raw.split(",")) {
    const key = part.trim() as K;
    if (allowed.includes(key) && !out.includes(key)) out.push(key);
  }
  return out;
}

export function parseFilters(params: URLSearchParams): Filters {
  const rawYear = params.get("year");
  let year: number | null = null;
  if (rawYear && /^\d{4}$/.test(rawYear)) {
    const n = Number(rawYear);
    if (n >= FIRST_YEAR && n <= LAST_YEAR) year = n;
  }
  return {
    year,
    topics: pickKeys(params.get("topic"), TOPIC_KEYS),
    provinces: pickKeys(params.get("province"), PROVINCE_KEYS),
  };
}

export function toQueryString(f: Filters): string {
  const params = new URLSearchParams();
  if (f.year !== null) params.set("year", String(f.year));
  if (f.topics.length > 0) params.set("topic", f.topics.join(","));
  if (f.provinces.length > 0) params.set("province", f.provinces.join(","));
  return params.toString().replace(/%2C/g, ",");
}
