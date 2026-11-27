// what this file does: end-to-end checks for /map after the drawer redesign
// change in this version (n7): new block for /map?province=cavite
//   the count and list match the content, no empty state shows,
//   every result and every pin opens the drawer
import { expect, test, type Locator, type Page } from "@playwright/test";
import { martialLawCount, provinceCount } from "./live-programs";

const TOTAL = martialLawCount();
const CAVITE = provinceCount("cavite");
type Box = { x: number; y: number; width: number; height: number };
const panel = (page: Page) => page.locator('aside[aria-label="Results"]');
const list = (page: Page) => page.locator('section[aria-label="Programs"]');
const countOf = (page: Page) => page.getByTestId("result-count").locator("strong");
const scrim = (page: Page) => page.locator('[class*="bg-stone-950/50"]');

async function box(locator: Locator): Promise<Box> {
  const result = await locator.boundingBox();
  if (!result) throw new Error("element has no bounding box");
  return result;
}

function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

async function listMatchesCount(page: Page) {
  await expect.poll(async () => {
    const shown = Number(await countOf(page).innerText());
    return (await list(page).locator("li").count()) === shown;
  }).toBe(true);
}

test.describe("map on desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(async ({ page }) => { await page.goto("/map"); });

  test("loads the panel and the map with no footer", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Explore the map" })).toBeAttached();
    await expect(page.getByRole("region", { name: "Map of programs" })).toBeVisible();
    await expect(panel(page)).toBeVisible();
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
    await expect(countOf(page)).toHaveText(String(TOTAL));
  });

  test("the count and list agree", async ({ page }) => {
    await expect(list(page).locator("li")).toHaveCount(TOTAL);
  });

  test("search narrows the list and writes q to the url", async ({ page }) => {
    await page.getByLabel("Search", { exact: true }).fill("binan");
    await expect(page).toHaveURL(/q=binan/);
    await expect(countOf(page)).not.toHaveText(String(TOTAL));
    await listMatchesCount(page);
  });

  test("topic and confirmed filters round-trip through the url", async ({ page }) => {
    await page.getByRole("button", { name: /^Topic/ }).click();
    const group = page.getByRole("group", { name: "Topic filter" });
    await group.getByRole("button", { name: "Land", exact: true }).click();
    await expect(page).toHaveURL(/topic=land/);
    await page.reload();
    await expect(page.getByRole("button", { name: "Topic · 1", exact: true })).toBeVisible();

    await page.goto("/map?confirmed=1");
    await expect(page.getByRole("switch", { name: "Confirmed only" })).toHaveAttribute("aria-checked", "true");
  });

  test("the time bar changes the year and has 15 histogram bars", async ({ page }) => {
    const bar = page.getByRole("region", { name: "Time bar" });
    await expect(bar.locator("span.w-2")).toHaveCount(15);
    const slider = bar.getByRole("slider");
    await slider.focus();
    await page.keyboard.press("End");
    await expect(page).toHaveURL(/year=1986/);
    await expect(slider).toHaveAttribute("aria-valuetext", "1986");
  });

  test("play steps one year then pauses", async ({ page }) => {
    const bar = page.getByRole("region", { name: "Time bar" });
    await bar.getByRole("button", { name: /^Play/ }).click();
    await expect(page).toHaveURL(/year=1972/);
    await expect(page).toHaveURL(/year=1973/, { timeout: 5000 });
    await bar.getByRole("button", { name: /^Pause/ }).click();
  });

  test("a result opens the drawer and background is inert", async ({ page }) => {
    const row = list(page).locator("li button").first();
    await row.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { level: 2 })).toBeFocused();
    await expect(page).toHaveURL(/sel=/);
    await expect(scrim(page)).toBeVisible();
    await expect(page.locator("[inert]")).toHaveCount(1);
  });

  test("previous and next page through results and escape returns focus", async ({ page }) => {
    await list(page).locator("li button").first().click();
    const dialog = page.getByRole("dialog");
    await expect(page).toHaveURL(/sel=/);
    const first = new URL(page.url()).searchParams.get("sel");
    expect(first).not.toBeNull();
    await dialog.getByRole("button", { name: "Next", exact: true }).click();
    await expect(dialog.getByRole("status")).toContainText(/^2 of \d+/);
    await dialog.getByRole("button", { name: "Previous", exact: true }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get("sel")).toBe(first);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.locator(`#program-${first} button`)).toBeFocused();
  });

  test("scrim closes and open program leaves the map", async ({ page }) => {
    await list(page).locator("li button").first().click();
    await scrim(page).click({ position: { x: 40, y: 400 } });
    await expect(page.getByRole("dialog")).toBeHidden();
    await list(page).locator("li button").first().click();
    await page.getByRole("dialog").getByRole("link", { name: "Open program" }).click();
    await expect(page).toHaveURL(/\/programs\//);
  });

  test("the map key and topic popover work", async ({ page }) => {
    await page.getByRole("button", { name: "Map key" }).click();
    await expect(page.getByText("Solid fill: confirmed")).toBeVisible();
    const chip = page.getByRole("button", { name: /^Topic/ });
    await chip.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("group", { name: "Topic filter" })).toBeVisible();
  });
});

// cavite is the thinnest province, so its map view gets its own checks
test.describe("map filtered to cavite", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.skip(CAVITE === 0, "no live cavite program");
  test.beforeEach(async ({ page }) => { await page.goto("/map?province=cavite"); });

  test("the count and list match the cavite programs and no empty state shows", async ({ page }) => {
    await expect(countOf(page)).toHaveText(String(CAVITE));
    await expect(list(page).locator("li")).toHaveCount(CAVITE);
    await expect(page.getByText(/No Cavite program yet/)).toHaveCount(0);
  });

  test("every cavite result opens the drawer with its own title", async ({ page }) => {
    const rows = list(page).locator("li button");
    const total = await rows.count();
    expect(total).toBe(CAVITE);

    for (let index = 0; index < total; index += 1) {
      const row = rows.nth(index);
      const title = (await row.innerText()).trim();
      await row.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(title);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    }
  });

  test("the pins show and each one opens the drawer", async ({ page }) => {
    const pins = page.locator('button[aria-label$="Show details"]');
    await expect(pins.first()).toBeVisible({ timeout: 20_000 });
    const total = await pins.count();
    expect(total).toBeGreaterThan(0);

    for (let index = 0; index < total; index += 1) {
      await pins.nth(index).evaluate((element) => (element as HTMLButtonElement).click());
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    }
  });
});

test.describe("map with reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  test("the play button is turned off", async ({ page }) => {
    await page.goto("/map");
    await expect(page.getByRole("region", { name: "Time bar" }).getByRole("button", { name: /^Play/ })).toBeDisabled();
  });
});

for (const width of [1024, 1440]) {
  test.describe(`top bar at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });
    test("the list pill never overlaps the topic chip", async ({ page }) => {
      await page.goto("/map");
      await page.getByRole("button", { name: "Hide list" }).click();
      const show = await box(page.getByRole("button", { name: "Show list" }));
      const topic = await box(page.getByRole("button", { name: /^Topic/ }));
      expect(overlaps(show, topic)).toBe(false);
    });
  });
}

test.describe("map without the cdn", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test("the list still works", async ({ page }) => {
    await page.route("**/unpkg.com/**", (route) => route.abort());
    await page.goto("/map");
    await expect(page.getByText("The map could not load")).toBeVisible();
    await expect(list(page).locator("li")).toHaveCount(TOTAL);
  });
});

test.describe("map on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test.beforeEach(async ({ page }) => { await page.goto("/map"); });

  test("shows filters, collapsed sheet and no sideways scroll", async ({ page }) => {
    await expect(page.getByRole("group", { name: "Filters" })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Results sheet/ })).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("the handle cycles the sheet sizes", async ({ page }) => {
    const handle = page.getByRole("button", { name: /^Results sheet/ });
    await handle.click();
    await expect(handle).toHaveAttribute("aria-label", /half open/);
    await handle.click();
    await expect(handle).toHaveAttribute("aria-label", /fully open/);
    await handle.click();
    await expect(handle).toHaveAttribute("aria-label", /collapsed/);
  });

  test("selecting a result opens the bottom drawer", async ({ page }) => {
    await page.getByRole("button", { name: /^Results sheet/ }).click();
    await list(page).locator("li button").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Close details" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("has no zoom buttons", async ({ page }) => {
    await expect(page.locator(".maplibregl-canvas")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: "Zoom in" })).toHaveCount(0);
  });
});
