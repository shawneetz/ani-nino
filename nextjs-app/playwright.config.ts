// what this file does: runs browser tests against the production build on a local server
//   tests use next start, not next dev, because dev compiles each route on its first visit
//   and that made clicks pass the url check (the failing "start here" and related tests)
//   the host is 127.0.0.1 everywhere, so the browser and the server always agree
// run `pnpm build` first, this config only starts the built app
import { defineConfig, devices } from "@playwright/test";

// one host and port for the browser and the server
const HOST = "127.0.0.1";
const PORT = 3000;
const BASE_URL = `http://${HOST}:${PORT}`;

export default defineConfig({
  testDir: "./e2e",

  // a failing test retries once, a test that only passes on retry is reported as flaky
  retries: 1,
  // two workers keep the server calm on a laptop
  workers: 2,

  // slower machines get room before a test or a check fails
  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,
    // keep the trace of every failure, not only of retries
    trace: "retain-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: {
    // serves the output of `pnpm build`, so it must exist before the tests run
    command: `pnpm exec next start -H ${HOST} -p ${PORT}`,
    url: BASE_URL,
    // reuses a server that is already running, but never in ci
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});