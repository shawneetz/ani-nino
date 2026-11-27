// what this file does: takes the u0 audit screenshots, one per route and width, into docs/ui-audit
// it does nothing unless UI_AUDIT=1 is set, so it never runs with the normal e2e suite
//   run it with: UI_AUDIT=1 pnpm exec playwright test e2e/ui-audit.spec.ts
// the map routes wait for the map canvas, and the drawer shot opens the first result
// files are named <route>-<width>.png, for example home-390.png
import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

test.skip(!process.env.UI_AUDIT, "set UI_AUDIT=1 to take the audit screenshots");

const ROUND = process.env.UI_AUDIT_ROUND;
const OUT = path.resolve(__dirname, "..", "docs", "ui-audit", ROUND ? `round-${ROUND}` : "");
const WIDTHS = [390, 768, 1024, 1440];
const HEIGHT = 900;

const ROUTES = [
  { name: "home", url: "/" },
  { name: "programs", url: "/programs" },
  { name: "program-confirmed", url: "/programs/laguna-operation-land-transfer" },
  { name: "program-checking", url: "/programs/quezon-coconut-levy" },
  { name: "sources", url: "/sources" },
  { name: "about", url: "/about" },
  { name: "not-found", url: "/nope" },
];

async function waitForMap(page: Page) {
  await page.locator(".maplibregl-canvas").waitFor({ timeout: 20_000 }).catch(() => undefined);
  await page.waitForTimeout(1500);
}

for (const width of WIDTHS) {
  test.describe(`audit at ${width}px`, () => {
    test.use({ viewport: { width, height: HEIGHT } });
    test.setTimeout(60_000);

    for (const route of ROUTES) {
      test(route.name, async ({ page }) => {
        await page.goto(route.url);
        await expect(page.locator("main")).toBeVisible();
        await page.screenshot({ path: path.join(OUT, `${route.name}-${width}.png`), fullPage: true });
      });
    }

    test("map", async ({ page }) => {
      await page.goto("/map");
      await waitForMap(page);
      await page.screenshot({ path: path.join(OUT, `map-${width}.png`) });
    });

    test("map-drawer", async ({ page }) => {
      await page.goto("/map");
      await waitForMap(page);
      if (width < 1024) await page.getByRole("button", { name: /^Results sheet/ }).click();
      await page.locator('section[aria-label="Programs"] li button').first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(OUT, `map-drawer-${width}.png`) });
    });
  });
}
