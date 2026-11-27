// what this file does: checks the shared states from stage u8
// every keyboard tab stop shows the one focus ring
import { expect, test, type Page } from "@playwright/test";

const ROUTES = ["/", "/programs", "/programs/laguna-operation-land-transfer", "/sources"];
const TAB_STOPS = 12;

async function focusRing(page: Page) {
  return page.evaluate(() => {
    const element = document.activeElement;
    if (!element || element === document.body) return null;
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
}

test.describe("focus ring", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const route of ROUTES) {
    test(`${route}: the first ${TAB_STOPS} tab stops show the ring`, async ({ page }) => {
      await page.goto(route);
      for (let index = 0; index < TAB_STOPS; index += 1) {
        await page.keyboard.press("Tab");
        const ring = await focusRing(page);
        expect(ring, `tab stop ${index + 1} has focus`).not.toBeNull();
        expect(ring!.style).toBe("solid");
        expect(ring!.width).toBe("3px");
      }
    });
  }
});

test.describe("empty states", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("programs and map share one look", async ({ page }) => {
    await page.goto("/programs");
    await page.getByLabel("Search").fill("zzzzzz");
    const programsEmpty = page.getByTestId("empty-state");
    await expect(programsEmpty).toBeVisible();
    await expect(programsEmpty).toHaveClass(/border-dashed/);
    await expect(programsEmpty.getByText("No programs match")).toBeVisible();

    await page.goto("/map?q=zzzzzz");
    const mapEmpty = page.getByTestId("empty-state");
    await expect(mapEmpty).toBeVisible();
    await expect(mapEmpty).toHaveClass(/border-dashed/);
    await expect(mapEmpty.getByText("No programs match")).toBeVisible();
  });

  test("the map failure uses the same look", async ({ page }) => {
    await page.route("**/unpkg.com/**", (route) => route.abort());
    await page.goto("/map");
    const failure = page.getByRole("alert").getByTestId("empty-state");
    await expect(failure).toBeVisible();
    await expect(failure).toHaveClass(/border-dashed/);
  });
});

test.describe("reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("buttons do not animate", async ({ page }) => {
    await page.goto("/");
    const duration = await page
      .getByRole("link", { name: "Explore the map" })
      .evaluate((element) => getComputedStyle(element).transitionDuration);
    for (const value of duration.split(",")) expect(parseFloat(value)).toBeLessThan(0.01);
  });
});
