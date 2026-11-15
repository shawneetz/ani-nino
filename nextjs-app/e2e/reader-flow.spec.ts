// what this file does: describes the reader-flow, keyboard and mobile checks
// updated for the landing page (c7.2): "/" is now the landing page and the explorer
// lives at "/map". old filter links must redirect to /map. run with `pnpm test:e2e`
import { expect, test } from "@playwright/test";

// martial-law programs shown by default. today programs are hidden until the switch is on
const MARTIAL_LAW_PROGRAMS = 14;

test.describe("landing page", () => {
  test("shows the project name and the two hero buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Anino ng Ani");
    await expect(page.getByRole("link", { name: "Explore the map" })).toHaveAttribute("href", "/map");
    await expect(page.getByRole("link", { name: "Read a program" })).toBeVisible();
  });

  test("explains labels and statuses before the reader meets them", async ({ page }) => {
    await page.goto("/");
    const section = page.getByRole("region", { name: "How to read this site" });
    await expect(section.getByText("Government", { exact: true })).toBeVisible();
    await expect(section.getByText("Confirmed", { exact: true })).toBeVisible();
    await expect(section.getByText("Still checking", { exact: true })).toBeVisible();
  });

  test("reaches a program in two taps from the Start here cards", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("region", { name: "Start here" }).getByRole("link").first().click();
    await expect(page).toHaveURL(/\/programs\//);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("Cavite explains itself instead of opening a blank map", async ({ page }) => {
    await page.goto("/");
    const tile = page.getByRole("region", { name: "Pick a province" }).getByRole("link", { name: /Cavite/ });
    await expect(tile).toContainText("No program yet");
    await expect(tile).toHaveAttribute("href", /\/sources/);
  });

  test("an old shared link redirects to the filtered map", async ({ page }) => {
    await page.goto("/?topic=land&province=laguna");
    await expect(page).toHaveURL(/\/map\?topic=land&province=laguna/);
    await expect(page.getByRole("button", { name: "Land", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("offers no sign-in, sign-up or admin link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /sign in|sign up|log in|login|admin/i })).toHaveCount(0);
  });
});

test.describe("reader flow", () => {
  test("opens the map with all programs and marks Map as current", async ({ page }) => {
    await page.goto("/map");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Explore the map");
    await expect(page.getByRole("region", { name: "Map of programs" })).toBeVisible();
    // exact: true, or "map of programs" also matches and adds its attribution links
    await expect(page.getByRole("region", { name: "Programs", exact: true }).getByRole("link")).toHaveCount(MARTIAL_LAW_PROGRAMS);
    await expect(
      page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Map" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("the Today switch adds the echo programs", async ({ page }) => {
    await page.goto("/map");
    const links = page.getByRole("region", { name: "Programs", exact: true }).getByRole("link");
    await page.getByRole("switch", { name: "Today" }).click();
    await expect(page).toHaveURL(/today=1/);
    await expect(links).not.toHaveCount(MARTIAL_LAW_PROGRAMS);
  });

  test("filters by topic and keeps the URL state", async ({ page }) => {
    await page.goto("/map");
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
    await expect(page.getByRole("link", { name: "Back to the map" })).toHaveAttribute("href", "/map");
  });

  test("supports keyboard focus on filters and navigation", async ({ page }) => {
    await page.goto("/map");
    const land = page.getByRole("button", { name: "Land", exact: true });
    await land.focus();
    await expect(land).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(land).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("phone viewport", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("landing page does not scroll sideways", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(fits).toBe(true);
  });

  test("renders the map page", async ({ page }) => {
    await page.goto("/map");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("region", { name: "Programs", exact: true })).toBeVisible();
  });
});
