// what this file does: checks that every page main lines up with the header and footer rows
// at 1440px the page width token is active, so left edge and width must match on every route
// /map is left out on purpose, it is full bleed
// change in this version (n7): added a live cavite page route
import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/programs",
  "/charts",
  "/sources",
  "/about",
  "/programs/laguna-operation-land-transfer",
  // a live cavite page, confirmed
  "/programs/cavite-export-processing-zone",
  "/programs/laguna-kkk",
  "/nope",
];

test.use({ viewport: { width: 1440, height: 900 } });

test.describe("one page width", () => {
  for (const route of ROUTES) {
    test(`${route}: main, header row and footer row share one box`, async ({ page }) => {
      await page.goto(route);

      const headerRow = await page.getByRole("banner").locator("> div").first().boundingBox();
      const footerRow = await page.getByRole("contentinfo").locator("> div").first().boundingBox();
      const main = await (route === "/"
        ? page.locator("main#main > div").first()
        : page.locator("main#main")
      ).boundingBox();

      expect(headerRow).not.toBeNull();
      expect(footerRow).not.toBeNull();
      expect(main).not.toBeNull();

      expect(main!.x).toBeCloseTo(headerRow!.x, 0);
      expect(main!.width).toBeCloseTo(headerRow!.width, 0);
      expect(footerRow!.x).toBeCloseTo(headerRow!.x, 0);
      expect(footerRow!.width).toBeCloseTo(headerRow!.width, 0);
    });
  }
});
