// What this file does: checks the home page and pin APIs in a real browser server.
import { expect, test } from "@playwright/test";

test("home route renders the explorer", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  expect(await response.text()).toContain("A map of promises and records");
});

test("pins API serves a valid empty snapshot and rejects malformed months", async ({ request }) => {
  const response = await request.get("/api/pins?month=1975-06");
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toEqual({ pins: [] });

  const invalidMonth = await request.get("/api/pins?month=June-1975");
  expect(invalidMonth.status()).toBe(400);
});

test("detail API returns not found for an unknown slug", async ({ request }) => {
  const response = await request.get("/api/pins/not-a-real-pin");
  expect(response.status()).toBe(404);
});
