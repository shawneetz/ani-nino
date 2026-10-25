import { getPins } from "@/db/queries";
import type { ExplorerPin } from "@/lib/map-types";

export async function loadPins(): Promise<ExplorerPin[]> {
  return getPins({ mode: "all", today: true });
}
