export const PUBLIC_CACHE = "public, s-maxage=60, stale-while-revalidate=300";

export function jsonOk<T>(body: T): Response {
  return Response.json(body, { headers: { "Cache-Control": PUBLIC_CACHE } });
}

export function jsonError(
  status: number,
  error: string,
  issues?: { path: string; message: string }[],
): Response {
  return Response.json(issues ? { error, issues } : { error }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function guarded(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    console.error("[api] unexpected failure:", error);
    return jsonError(503, "data_unavailable");
  }
}
