import { getPins } from "@/db/queries";
import { guarded, jsonError, jsonOk } from "@/lib/api-response";
import type { PinsResponse } from "@/lib/api-schemas";
import { parsePinQuery } from "@/lib/pin-query";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return guarded(async () => {
    const parsed = parsePinQuery(new URL(request.url).searchParams);
    if (!parsed.success) {
      return jsonError(
        400,
        "invalid_query",
        parsed.error.issues.map((issue) => ({
          path: issue.path.map(String).join("."),
          message: issue.message,
        })),
      );
    }

    const pins = await getPins(parsed.data);
    const body: PinsResponse = { count: pins.length, filters: parsed.data, pins };
    return jsonOk(body);
  });
}
