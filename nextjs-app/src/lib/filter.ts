// What this file does: decides which pins are visible for a given month and filters.
// The list, the map, the slider count and /api/pins ALL use this one function.
import type { Layer, Province } from "./enums";
import type { Family } from "./vocab";

// The slider covers martial law only: Sept 1972 to Feb 1986.
export const SLIDER_START_MONTH = "1972-09";
export const SLIDER_END_MONTH = "1986-02";

// A one-off event (start = end) would flash by in a single month,
// so it stays visible this many extra months (12 months in total).
export const POINT_EVENT_LINGER_MONTHS = 11;

export type FilterMode = "range" | "cumulative";

export interface PinFilters {
  month?: string | null;
  mode?: FilterMode;
  families?: string[];
  provinces?: string[];
  today?: boolean;
  pointEventLingerMonths?: number;
}

// The only pin fields the filter needs.
export interface FilterablePin {
  layer: Layer;
  family: Family;
  secondaryFamilies: Family[];
  startDate: string;
  endDate: string | null;
  locations: { province: Province }[];
}

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// Adds months to a YYYY-MM-DD date and returns the first of that month.
function addMonths(date: string, count: number): string {
  const total = Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7)) - 1 + count;
  const year = Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

// Is this pin active in the chosen month?
function isActive(pin: FilterablePin, monthDate: string, mode: FilterMode, linger: number): boolean {
  if (pin.startDate > monthDate) return false;
  // Cumulative = "has happened by this month". Open-ended pins stay active.
  if (mode === "cumulative" || pin.endDate === null) return true;
  const lastMonth = pin.endDate === pin.startDate ? addMonths(pin.endDate, linger) : pin.endDate;
  return lastMonth >= monthDate;
}

export function visiblePins<T extends FilterablePin>(
  pins: readonly T[],
  filters: PinFilters = {},
): T[] {
  const { month = null, mode = "range", families = [], provinces = [], today = false } = filters;
  const linger = filters.pointEventLingerMonths ?? POINT_EVENT_LINGER_MONTHS;

  if (month !== null && !MONTH_RE.test(month)) {
    throw new RangeError(`Invalid month "${month}", expected YYYY-MM`);
  }
  if (!Number.isInteger(linger) || linger < 0) {
    throw new RangeError("pointEventLingerMonths must be a non-negative integer");
  }
  const monthDate = month === null ? null : `${month}-01`;

  return pins.filter((pin) => {
    // Today pins ignore the slider and only show when the Today switch is on.
    if (pin.layer === "today") {
      if (!today) return false;
    } else if (monthDate !== null && !isActive(pin, monthDate, mode, linger)) {
      return false;
    }
    // Family filter also matches secondary families.
    if (
      families.length > 0 &&
      !families.includes(pin.family) &&
      !pin.secondaryFamilies.some((family) => families.includes(family))
    ) {
      return false;
    }
    // Province filter matches any of the pin's markers.
    if (
      provinces.length > 0 &&
      !pin.locations.some((location) => provinces.includes(location.province))
    ) {
      return false;
    }
    return true;
  });
}
