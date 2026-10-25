import { getPins } from "@/db/queries";
import { isValidMonth } from "@/lib/slider";

function csv(value: string | null): string[] {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const rawMonth = params.get("month");
  if (rawMonth && !isValidMonth(rawMonth)) {
    return Response.json({ error: "month must use YYYY-MM format" }, { status: 400 });
  }

  const pins = await getPins({
    month: rawMonth ?? undefined,
    mode: params.get("mode") === "all" ? "all" : "range",
    families: csv(params.get("family")),
    provinces: csv(params.get("province")),
    today: ["1", "true"].includes(params.get("today") ?? ""),
  });
  return Response.json({ pins });
}
