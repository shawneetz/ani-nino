// What this file does: applies the same date and filter rules to map and list pins.
import type { ExplorerPin } from "./map-types";
import { visiblePins } from "./filter";

interface VisibleOptions {
  month: string;
  mode: "range" | "all";
  families: string[];
  provinces: string[];
  today: boolean;
}

export function visiblePinsForUi(pins: ExplorerPin[], options: VisibleOptions): ExplorerPin[] {
  return visiblePins(pins, {
    month: options.month,
    mode: options.mode === "all" ? "cumulative" : "range",
    families: options.families,
    provinces: options.provinces,
    today: options.today,
    pointEventLingerMonths: 11,
  });
}
