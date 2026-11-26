// what this file does: automated parts of the stage v10 visual pass
import { expect, test, type Locator } from "@playwright/test";

const WIDTHS = [390, 768, 1024, 1440];
const ROUTES = [
  "/",
  "/map",
  "/programs",
  "/charts",
  "/sources",
  "/about",
  "/programs/laguna-operation-land-transfer",
  "/programs/quezon-coconut-levy",
];

type Box = { x: number; y: number; width: number; height: number };
async function box(locator: Locator): Promise<Box> {
  const result = await locator.boundingBox();
  if (!result) throw new Error("element has no bounding box");
  return result;
}
function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

for (const width of WIDTHS) {
  test.describe(`no sideways scroll at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    for (const route of ROUTES) {
      test(route, async ({ page }) => {
        await page.goto(route);
        await expect(page.getByRole("heading", { level: 1 })).toBeAttached();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      });
    }
  });
}

for (const width of [1024, 1440]) {
  test.describe(`map pieces at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });
    test("time bar keeps clear of panel, key and zoom buttons", async ({ page }) => {
      await page.goto("/map");
      const bar = await box(page.getByRole("region", { name: "Time bar" }));
      const panel = await box(page.locator('aside[aria-label="Results"]'));
      const key = await box(page.getByRole("button", { name: "Map key" }));
      expect(overlaps(bar, panel)).toBe(false);
      expect(overlaps(bar, key)).toBe(false);
      const zoom = page.getByRole("button", { name: "Zoom in" });
      await expect(zoom).toBeVisible({ timeout: 20_000 });
      expect(overlaps(bar, await box(zoom))).toBe(false);
      expect(overlaps(key, await box(zoom))).toBe(false);
    });
  });
}
