// What this file does: decides which view setting must change to reveal a selected pin.
import type { ExplorerPin } from "@/lib/map-types";
import { visiblePinsForUi } from "@/lib/visible-for-ui";

export const toMonth = (isoDate: string): string => isoDate.slice(0, 7);

export type RevealPatch = { month?: string; today?: true };

export function revealPatch(
  pin: ExplorerPin,
  view: { month: string; today: boolean },
): RevealPatch | null {
  if (pin.layer === "today") return view.today ? null : { today: true };

  const shown = visiblePinsForUi([pin], {
    month: view.month,
    mode: "range",
    families: [],
    provinces: [],
    today: false,
  }).length > 0;

  return shown ? null : { month: toMonth(pin.startDate) };
}
