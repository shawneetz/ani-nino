// what this file does: describes the reader-flow checks for the landing page, program page, sources and charts
import { expect, test } from "@playwright/test";
import { HERO } from "../src/lib/site";
import { SCOPES } from "../src/lib/vocab";
import { chartCount, provinceCount } from "./live-programs";

const SCOPE_LABEL = new RegExp(`^(${Object.values(SCOPES).map((scope) => scope.label).join("|")})$`);

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
      await expect(tile).toContainText(`${cavite} ${cavite === 1 ? "program" : "programs"}`);
      await expect(tile).toHaveAttribute("href", /\/map\?province=cavite/);
    } else {
      await expect(tile).toContainText("No program yet");
      await expect(tile).toHaveAttribute("href", /\/sources/);
    }
  });

  test("an old shared link redirects to the filtered map", async ({ page }) => {
    await page.goto("/?topic=land&province=laguna");
    await expect(page).toHaveURL(/\/map\?topic=land&province=laguna/);
    await page.getByRole("button", { name: /^Topic/ }).click();
    await expect(page.getByRole("group", { name: "Topic filter" }).getByRole("button", { name: "Land", exact: true })).toHaveAttribute("aria-pressed", "true");
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

test.describe("program page", () => {
  test("opens a program page with evidence sections and contribution links", async ({ page }) => {
    await page.goto("/programs/laguna-operation-land-transfer");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Operation Land Transfer in Laguna");
    await expect(page.getByRole("heading", { name: "Who says so" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What it promised" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What the record shows" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Suggest a source" })).toHaveAttribute("target", "_blank");
    await expect(page.getByRole("link", { name: "Back to the map" })).toHaveAttribute("href", "/map");
  });
});

test.describe("sources anchors", () => {
  test("the cavite gap anchor lands on its gap", async ({ page }) => {
    await page.goto("/sources#gap-cavite-not-covered");
    await expect(page.locator("#gap-cavite-not-covered")).toBeVisible();
  });

  test("held topics are searchable and the old question and gap anchors remain", async ({ page }) => {
    await page.goto("/sources#held-topics");
    await expect(page.getByRole("heading", { name: "Held topics" })).toBeVisible();
    await expect(page.getByRole("link", { name: "See the held files" })).toHaveAttribute("href", /content\/holding$/);
    await expect(page.getByRole("group", { name: "Open on a page" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Missing from the whole site" })).toBeVisible();
    await page.getByRole("searchbox", { name: "Search" }).fill("Laiban and Kaliwa dam plans");
    await expect(page.locator("#held-topics li")).toHaveCount(1);
    await expect(page.getByTestId("sources-count")).toContainText("1 held topic");
    await page.getByRole("group", { name: "Filter sources by label" }).getByRole("button", { name: /Government/ }).click();
    await expect(page.locator("#held-topics li")).toHaveCount(1);
    await page.getByRole("button", { name: "Clear search and label" }).first().click();
  });

  test("held program pages link to the held topics section", async ({ page }) => {
    await page.goto("/programs/laguna-kkk");
    await expect(page.getByRole("link", { name: "See what is not known yet" })).toHaveAttribute("href", "/sources#held-topics");
  });

  test("the rail lists the four sections and jumps to one", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/sources");
    const rail = page.getByRole("navigation", { name: "On this page" });
    await expect(rail).toBeVisible();
    await expect(rail.getByRole("link")).toHaveCount(4);
    await rail.getByRole("link", { name: "Held topics" }).click();
    await expect(page).toHaveURL(/#held-topics$/);
  });
});

test.describe("charts", () => {
  test("each chart states its question and scopes every data row", async ({ page }) => {
    await page.goto("/charts");
    const cards = page.locator('article[id^="chart-"]');
    await expect(cards).toHaveCount(chartCount());
    for (const card of await cards.all()) {
      await expect(card.locator("h2 + p")).toHaveText(/\S+/);
      const rows = card.locator("table tbody tr");
      expect(await rows.count()).toBeGreaterThan(0);
      for (const row of await rows.all()) {
        await expect(row.getByText(SCOPE_LABEL)).toHaveCount(1);
      }
    }
  });

  test("the fishpen area chart has three rows with the Place scope", async ({ page }) => {
    await page.goto("/charts");
    const card = page.locator("#chart-laguna-lake-fishpen-area");
    await expect(card.getByRole("heading", { name: "Fishpen area on Laguna de Bay" })).toBeVisible();
    const rows = card.locator("table tbody tr");
    await expect(rows).toHaveCount(3);
    for (const row of await rows.all()) {
      await expect(row.getByText("Place", { exact: true })).toBeVisible();
    }
  });
});

test.describe("phone viewport", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("landing page does not scroll sideways", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("the hero has one h1, a credit or the fallback, and both buttons in the first screen", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator('section[aria-labelledby="hero-heading"]');
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    if (HERO) await expect(hero.getByText(/Photo:/)).toBeVisible();
    else await expect(hero.locator("svg")).toBeAttached();
    for (const name of ["Explore the map", "Read a program"]) {
      const link = hero.getByRole("link", { name });
      await expect(link).toBeVisible();
      const b = await link.boundingBox();
      expect(b).not.toBeNull();
      expect(b!.y + b!.height).toBeLessThanOrEqual(844);
    }
  });
});
