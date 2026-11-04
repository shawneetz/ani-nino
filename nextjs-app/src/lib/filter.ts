// What this file does: decides which pins are visible for a given month and filters.
// The list, the map, the slider count and /api/pins ALL use this one function.
// What this file does: the one filter function used by the map, list and count.
import {
  FIRST_YEAR,
  LAST_YEAR,
  PROVINCE_KEYS,
  TOPIC_KEYS,
  type Province,
  type Topic,
} from "./vocab";
import type { Layer } from "./enums";
import type { Family } from "./vocab";
export const SLIDER_START_MONTH = "1972-09";
export const SLIDER_END_MONTH = "1986-02";
export const POINT_EVENT_LINGER_MONTHS = 11;
export type FilterMode = "range" | "cumulative";
export interface PinFilters { month?: string | null; mode?: FilterMode; families?: string[]; provinces?: string[]; today?: boolean; pointEventLingerMonths?: number; }
export interface FilterablePin { layer: Layer; family: Family; secondaryFamilies: Family[]; startDate: string; endDate: string | null; locations: { province: Province }[]; }
function addMonths(date: string, count: number): string { const total = Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7)) - 1 + count; const year = Math.floor(total / 12); const month = ((total % 12) + 12) % 12; return `${year}-${String(month + 1).padStart(2, "0")}-01`; }
export function visiblePins<T extends FilterablePin>(pins: readonly T[], filters: PinFilters = {}): T[] {
  const { month = null, mode = "range", families = [], provinces = [], today = false } = filters;
  const linger = filters.pointEventLingerMonths ?? POINT_EVENT_LINGER_MONTHS;
  if (month !== null && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new RangeError(`Invalid month "${month}", expected YYYY-MM`);
  if (!Number.isInteger(linger) || linger < 0) throw new RangeError("pointEventLingerMonths must be a non-negative integer");
  const monthDate = month === null ? null : `${month}-01`;
  return pins.filter((pin) => {
    if (pin.layer === "today") { if (!today) return false; }
    else if (monthDate !== null && (pin.startDate > monthDate || (mode !== "cumulative" && pin.endDate !== null && (pin.endDate === pin.startDate ? addMonths(pin.endDate, linger) : pin.endDate) < monthDate))) return false;
    if (families.length > 0 && !families.includes(pin.family) && !pin.secondaryFamilies.some((family) => families.includes(family))) return false;
    return provinces.length === 0 || pin.locations.some((location) => provinces.includes(location.province));
  });
}

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

export function visiblePrograms<T extends Filterable>(programs: T[], f: Filters): T[] {
  return programs.filter((p) => {
    if (f.year !== null && !isActiveInYear(p, f.year)) return false;
    if (f.topics.length > 0 && !f.topics.includes(p.topic)) return false;
    if (f.provinces.length > 0 && !p.places.some((pl) => f.provinces.includes(pl.province))) return false;
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
