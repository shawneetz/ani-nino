// What this file does: describes the reader-flow, keyboard and mobile checks.
// These browser tests are written now and should be run later with Playwright.
import { expect, test } from "@playwright/test";

const TOTAL_PROGRAMS = 12;

test.describe("reader flow", () => {
  test("opens the map with all programs and marks Map as current", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Who Paid for the Harvest?");
    await expect(page.getByRole("region", { name: "Map of programs" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Programs" }).getByRole("link")).toHaveCount(TOTAL_PROGRAMS);
    await expect(
      page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Map" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("filters by topic and keeps the URL state", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Land", exact: true }).click();
    await expect(page).toHaveURL(/topic=land/);
    await expect(page.getByRole("button", { name: "Land", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("opens a program page with evidence sections and contribution links", async ({ page }) => {
    await page.goto("/programs/laguna-operation-land-transfer");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Operation Land Transfer in Laguna",
    );
    await expect(page.getByRole("heading", { name: "Who says so" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What happened" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Suggest a source" })).toHaveAttribute(
      "target",
      "_blank",
    );
  });

  test("supports keyboard focus on filters and navigation", async ({ page }) => {
    await page.goto("/");
    const land = page.getByRole("button", { name: "Land", exact: true });
    await land.focus();
    await expect(land).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(land).toHaveAttribute("aria-pressed", "true");
  });

  test("renders the reader at a phone viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("region", { name: "Programs" })).toBeVisible();
  });
});
