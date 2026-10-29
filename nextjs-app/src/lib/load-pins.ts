// What this file does: loads every pin for the server-rendered explorer.
import { getPins } from "@/db/queries";
import type { ExplorerPin } from "@/lib/map-types";

export async function loadPins(): Promise<ExplorerPin[]> {
  // Load both layers up front so client-side filters can respond immediately.
  return getPins({ mode: "cumulative", today: true });
}
