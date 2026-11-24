// what this file does: describes the reader-flow, keyboard and phone checks
// updated for the new explorer: selecting shows a preview, the list count matches
// the result count, and the phone has a map | list toggle and a filter sheet
// the program page panel is "What the record shows", and the header has a copy link button
// change in this version (b11): program and province counts now come from the yaml files
// (e2e/live-programs.ts), the two today-layer tests are gone, the cavite tests read
// the real count, and the sources anchor test was added
// run with `pnpm test:e2e`
import { expect, test } from "@playwright/test";
import { martialLawCount, provinceCount } from "./live-programs";

// martial-law programs shown by default, counted from content/programs
const MARTIAL_LAW_PROGRAMS = martialLawCount();

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

  test("reaches a program in two taps from the start here cards", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("region", { name: "Start here" }).getByRole("link").first().click();
    await expect(page).toHaveURL(/\/programs\//);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("the cavite tile matches how many cavite programs exist", async ({ page }) => {
    await page.goto("/");
    const tile = page.getByRole("region", { name: "Pick a province" }).getByRole("link", { name: /Cavite/ });
    const cavite = provinceCount("cavite");
    if (cavite > 0) {
      // a province with pages opens the filtered map
      await expect(tile).toContainText(`${cavite} ${cavite === 1 ? "program" : "programs"}`);
      await expect(tile).toHaveAttribute("href", /\/map\?province=cavite/);
    } else {
      // a province with no pages explains itself instead of opening a blank map
      await expect(tile).toContainText("No program yet");
      await expect(tile).toHaveAttribute("href", /\/sources/);
    }
  });

  test("an old shared link redirects to the filtered map", async ({ page }) => {
    await page.goto("/?topic=land&province=laguna");
    await expect(page).toHaveURL(/\/map\?topic=land&province=laguna/);
    await expect(page.getByRole("button", { name: "Land", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("a confirmed-only shared link redirects to the map", async ({ page }) => {
    await page.goto("/?confirmed=1");
    await expect(page).toHaveURL(/\/map\?confirmed=1$/);
    await expect(page.getByRole("switch", { name: "Confirmed only" })).toHaveAttribute("aria-checked", "true");
  });

  test("offers no sign-in, sign-up or admin link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /sign in|sign up|log in|login|admin/i })).toHaveCount(0);
  });
});

test.describe("explorer", () => {
  test("opens the map with all programs and marks map as current", async ({ page }) => {
    await page.goto("/map");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Explore the map");
    await expect(page.getByRole("region", { name: "Map of programs" })).toBeVisible();
    // exact: true, or "Map of programs" also matches
    await expect(page.getByRole("region", { name: "Programs", exact: true }).getByRole("link")).toHaveCount(MARTIAL_LAW_PROGRAMS);
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Map" })).toHaveAttribute("aria-current", "page");
  });

  test("hides the today layer controls when no today programs exist", async ({ page }) => {
    await page.goto("/map");
    await expect(page.getByRole("switch", { name: "Show today's echoes" })).toHaveCount(0);
    await expect(page.getByText("Year filters martial-law programs only.", { exact: true })).toHaveCount(0);
    await page.getByText("Map key", { exact: true }).click();
    await expect(page.getByText("Square: a program from today (round is martial law)", { exact: true })).toHaveCount(0);

    await page.goto("/programs");
    await expect(page.getByRole("switch", { name: "Show today's echoes" })).toHaveCount(0);
    await expect(page.getByText("Adds programs from today that echo the older ones.", { exact: true })).toHaveCount(0);
  });

  test("confirmed only filters programs and round-trips through the URL", async ({ page }) => {
    await page.goto("/map?confirmed=1");
    const confirmedSwitch = page.getByRole("switch", { name: "Confirmed only" });
    await expect(confirmedSwitch).toHaveAttribute("aria-checked", "true");

    const list = page.getByRole("region", { name: "Programs", exact: true });
    const cards = list.locator("article");
    const confirmedCount = await cards.count();
    expect(confirmedCount).toBeGreaterThan(0);
    await expect(page.getByTestId("result-count").locator("strong")).toHaveText(String(confirmedCount));
    for (const card of await cards.all()) {
      await expect(card.getByText("Confirmed", { exact: true })).toBeVisible();
    }

    await page.reload();
    await expect(page.getByRole("switch", { name: "Confirmed only" })).toHaveAttribute("aria-checked", "true");
    await page.getByRole("switch", { name: "Confirmed only" }).click();
    await expect(page).toHaveURL(/\/map$/);
    await expect(page.getByTestId("result-count").locator("strong")).toHaveText(String(MARTIAL_LAW_PROGRAMS));
  });

  test("filters by topic, keeps the url state and the count matches the list", async ({ page }) => {
    await page.goto("/map");
    await page.getByRole("button", { name: "Land", exact: true }).click();
    await expect(page).toHaveURL(/topic=land/);
    await expect(page.getByRole("button", { name: "Land", exact: true })).toHaveAttribute("aria-pressed", "true");
    const total = await page.getByRole("region", { name: "Programs", exact: true }).getByRole("link").count();
    await expect(page.getByTestId("result-count")).toContainText(`${total} program`);
  });

  test("show on map opens a preview, escape closes it, open program leaves the page", async ({ page }) => {
    await page.goto("/map");
    await page.getByRole("button", { name: /Show on map/ }).first().click();
    const preview = page.getByRole("region", { name: "Program preview" });
    await expect(preview).toBeVisible();
    await expect(page).toHaveURL(/sel=/);

    await page.keyboard.press("Escape");
    await expect(preview).toBeHidden();
    await expect(page).not.toHaveURL(/sel=/);

    await page.getByRole("button", { name: /Show on map/ }).first().click();
    await page.getByRole("link", { name: "Open program" }).click();
    await expect(page).toHaveURL(/\/programs\//);
  });

  test("the map key lists real marker samples", async ({ page }) => {
    await page.goto("/map");
    await page.getByText("Map key").click();
    await expect(page.getByText("Solid fill: confirmed")).toBeVisible();
  });

  test("opens a program page with evidence sections and contribution links", async ({ page }) => {
    await page.goto("/programs/laguna-operation-land-transfer");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Operation Land Transfer in Laguna");
    await expect(page.getByRole("heading", { name: "Who says so" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What it promised" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What the record shows" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
    // the header has a copy link button (u12)
    await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Suggest a source" })).toHaveAttribute("target", "_blank");
    await expect(page.getByRole("link", { name: "Back to the map" })).toHaveAttribute("href", "/map");
  });

  test("supports keyboard focus on filters", async ({ page }) => {
    await page.goto("/map");
    const land = page.getByRole("button", { name: "Land", exact: true });
    await land.focus();
    await expect(land).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(land).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("sources anchors", () => {
  // the landing tile and the explorer link to this gap, so the anchor must exist
  test("the cavite gap anchor lands on its gap", async ({ page }) => {
    await page.goto("/sources#gap-cavite-not-covered");
    await expect(page.locator("#gap-cavite-not-covered")).toBeVisible();
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

  test("the map page starts on the list, does not scroll sideways, and toggles to the map", async ({ page }) => {
    await page.goto("/map");
    await expect(page.getByRole("region", { name: "Programs", exact: true })).toBeVisible();
    const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(fits).toBe(true);

    const toggle = page.getByRole("group", { name: "Show" });
    await toggle.getByRole("button", { name: "Map" }).click();
    await expect(page.getByRole("region", { name: "Map of programs" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Programs", exact: true })).toBeHidden();

    await toggle.getByRole("button", { name: "List" }).click();
    await expect(page.getByRole("region", { name: "Programs", exact: true })).toBeVisible();
  });

  test("the filter sheet opens, filters and closes with escape", async ({ page }) => {
    await page.goto("/map");
    await page.getByRole("button", { name: /^Filters/ }).click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Land", exact: true }).click();
    await expect(page).toHaveURL(/topic=land/);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("a stale today url does not count as a visible filter", async ({ page }) => {
    await page.goto("/map?today=1");
    await expect(page.getByRole("button", { name: "Filters", exact: true })).toBeVisible();
    await expect(page.getByTestId("result-count").locator("strong")).toHaveText(String(MARTIAL_LAW_PROGRAMS));
  });
});