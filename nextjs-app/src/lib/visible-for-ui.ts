// What this file does: applies the same date and filter rules to map and list pins.
import type { ExplorerPin } from "./map-types";
import { addMonths } from "./slider";

interface VisibleOptions {
  month: string;
  mode: "range" | "all";
  families: string[];
  provinces: string[];
  today: boolean;
}

function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function visiblePinsForUi(pins: ExplorerPin[], options: VisibleOptions): ExplorerPin[] {
  return pins.filter((pin) => {
    // Family and province filters narrow results before date rules are applied.
    if (pin.layer === "today" && !options.today) return false;
    if (options.families.length > 0 && !options.families.includes(pin.family)) return false;
    if (
      options.provinces.length > 0 &&
      !pin.locations.some((location) => options.provinces.includes(location.province))
    ) {
      return false;
    }

    if (pin.layer === "today" || options.mode === "all") return true;

    const selected = options.month;
    const start = monthOf(pin.startDate);
    const end = pin.endDate ? monthOf(pin.endDate) : null;
    if (selected < start) return false;
    // A one-day event stays visible for one year so it can be found on the month slider.
    if (end) return selected <= (end === start ? addMonths(start, 11) : end);

    return true;
  });
}
