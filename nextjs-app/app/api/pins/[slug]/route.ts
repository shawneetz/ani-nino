import { getPinDetail } from "@/db/queries";
import { SLUG_RE } from "@/lib/api-schemas";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (!SLUG_RE.test(slug)) return Response.json({ error: "Pin not found" }, { status: 404 });

  const pin = await getPinDetail(slug);
  if (!pin) return Response.json({ error: "Pin not found" }, { status: 404 });
  return Response.json(pin);
}
