import { afterEach, describe, expect, it, vi } from "vitest";

type PoolHolder = { __aninoPool?: { end: () => Promise<void> } };

async function resetDbClient() {
  const holder = globalThis as typeof globalThis & PoolHolder;
  await holder.__aninoPool?.end().catch(() => undefined);
  delete holder.__aninoPool;
  vi.resetModules();
}

afterEach(async () => {
  vi.unstubAllEnvs();
  await resetDbClient();
});

describe("GET /api/health", () => {
  it("reports db: up when the database is reachable", async () => {
    await resetDbClient();
    const { GET } = await import("../../app/api/health/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.db).toBe("up");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("stays 200 with db: down when the database cannot be reached", async () => {
    await resetDbClient();
    vi.stubEnv("DATABASE_URL", "postgres://anino_app:test@127.0.0.1:1/anino");
    const { GET } = await import("../../app/api/health/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.db).toBe("down");
  });

  it("stays 200 with db: down when DATABASE_URL is not set", async () => {
    await resetDbClient();
    vi.stubEnv("DATABASE_URL", "");
    const { GET } = await import("../../app/api/health/route");
    const response = await GET();

    expect(response.status).toBe(200);
    expect((await response.json()).db).toBe("down");
  });
});
