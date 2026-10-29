// Health check used by Docker, Coolify, and uptime monitoring.
// Phase 0: only proves the server is running.
// Phase 1: will also check the database connection.

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true });
}
