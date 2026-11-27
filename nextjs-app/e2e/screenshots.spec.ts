// what this file does: optional screenshot baselines for stage u9
// it does nothing unless SCREENSHOTS=1 is set
import { expect, test } from "@playwright/test";

test.skip(!process.env.SCREENSHOTS, "set SCREENSHOTS=1 to run the screenshot baselines");

const WIDTHS = [390, 1440];
const ROUTES = [
  { name: "home", url: "/" },
  { name: "programs", url: "/programs" },
  { name: "program", url: "/programs/laguna-operation-land-transfer" },
];

for (const width of WIDTHS) {
  test.describe(`baselines at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 }, reducedMotion: "reduce" });

    for (const route of ROUTES) {
      test(route.name, async ({ page }) => {
        await page.goto(route.url);
        await expect(page.locator("main")).toBeVisible();
        await expect(page).toHaveScreenshot(`${route.name}-${width}.png`, {
          fullPage: true,
          animations: "disabled",
          maxDiffPixelRatio: 0.02,
          mask: [page.getByRole("region", { name: "Map of this program's places" })],
        });
      });
    }
  });
}
