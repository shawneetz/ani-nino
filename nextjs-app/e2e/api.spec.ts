// What this file does: checks the pages and APIs in a real server.
// It no longer expects an empty database: it checks shapes and statuses,
// so it keeps passing once real pins are loaded.
import { expect, test } from "@playwright/test";

test("home route renders the site title", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  expect(await response.text()).toContain("Anino ng Ani");
});

test("charts and methods pages render", async ({ request }) => {
  const charts = await request.get("/charts");
  expect(charts.ok()).toBeTruthy();
  expect(await charts.text()).toContain("Charts");

  const methods = await request.get("/methods");
  expect(methods.ok()).toBeTruthy();
  expect(await methods.text()).toContain("Methods and sources");
});

test("pins API returns a valid response and rejects malformed months", async ({ request }) => {
  const response = await request.get("/api/pins?month=1975-06");
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body).toMatchObject({
    filters: { month: "1975-06", mode: "range", families: [], provinces: [], today: false },
  });
  // Check the shape, not a fixed count, so the test survives real data.
  expect(typeof body.count).toBe("number");
  expect(body.pins).toHaveLength(body.count);

  const invalidMonth = await request.get("/api/pins?month=June-1975");
  expect(invalidMonth.status()).toBe(400);
});

test("detail API returns not found for an unknown slug", async ({ request }) => {
  const response = await request.get("/api/pins/not-a-real-pin");
  expect(response.status()).toBe(404);
});

test("health endpoint stays healthy and reports database availability", async ({ request }) => {
  const response = await request.get("/api/health");
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.ok).toBe(true);
  expect(["up", "down"]).toContain(body.db);
  expect(response.headers()["cache-control"]).toContain("no-store");
});
