import { getPin } from "@/db/queries";
import { guarded, jsonError, jsonOk } from "@/lib/api-response";
import { SLUG_RE } from "@/lib/api-schemas";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<Response> {
  return guarded(async () => {
    const { slug } = await context.params;
    if (!SLUG_RE.test(slug)) return jsonError(404, "not_found");

    const pin = await getPin(slug);
    if (!pin) return jsonError(404, "not_found");
    return jsonOk(pin);
  });
}
