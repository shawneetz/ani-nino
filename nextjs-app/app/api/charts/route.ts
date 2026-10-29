import { getCharts } from "@/db/queries";
import { guarded, jsonOk } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return guarded(async () => jsonOk({ charts: await getCharts() }));
}
