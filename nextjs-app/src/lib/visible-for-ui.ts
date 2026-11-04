// What this file does: lets the UI call the shared filter with the UI's option names.
// It adds no rules of its own, so map and list always match the API.
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
    // The UI says "all", the filter says "cumulative". Same thing.
    mode: options.mode === "all" ? "cumulative" : "range",
    families: options.families,
    provinces: options.provinces,
    today: options.today,
  });
}
