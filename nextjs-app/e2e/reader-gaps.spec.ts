// what this file does: end-to-end checks for the gaps that t1 found in the other e2e files
import { expect, test } from "@playwright/test";
import { GLOSSARY } from "../src/lib/glossary";
import { heldTopic } from "../src/lib/held-topics";

const CITED_SLUG = "laguna-operation-land-transfer";
const SINCE_SLUG = "quezon-coconut-levy";
const HELD_SLUG = "laguna-kkk";
const MOVED_SLUG = "laguna-certificates-of-land-transfer";

test.describe("cite this page", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("the copied citation equals the text shown and ends with the program path", async ({ page }) => {
    await page.goto(`/programs/${CITED_SLUG}`);
    const shown = (await page.getByTestId("citation-text").innerText()).trim();
    await page.getByRole("button", { name: "Copy citation" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe(shown);
    expect(copied.endsWith(`/programs/${CITED_SLUG}`)).toBe(true);
  });
});

test.describe("glossary", () => {
  test("the about page lists every glossary entry", async ({ page }) => {
    await page.goto("/about#glossary");
    const section = page.locator("#glossary");
    await expect(section.getByRole("heading", { name: "Glossary" })).toBeVisible();
    await expect(section.locator("dt")).toHaveCount(GLOSSARY.length);
    for (const entry of GLOSSARY) {
      await expect(section.locator("dt", { hasText: `${entry.term}: ${entry.name}` })).toBeVisible();
    }
  });
});

test.describe("old slugs", () => {
  test("a merged page lands on the live program", async ({ page }) => {
    await page.goto(`/programs/${MOVED_SLUG}`);
    await expect(page).toHaveURL(/\/programs\/laguna-operation-land-transfer$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Operation Land Transfer in Laguna");
  });
});

test.describe("what came after", () => {
  test("every dated entry shows the date its source was accessed", async ({ page }) => {
    await page.goto(`/programs/${SINCE_SLUG}`);
    const entries = page.locator("#after ol > li");
    const total = await entries.count();
    expect(total).toBeGreaterThan(0);
    for (const entry of await entries.all()) {
      await expect(entry.getByTestId("since-accessed")).toHaveText(/Accessed \d{4}-\d{2}-\d{2}$/);
    }
  });
});

test.describe("held topics", () => {
  test("a held slug shows the held page and not the 404", async ({ page }) => {
    const held = heldTopic(HELD_SLUG);
    expect(held).not.toBeNull();
    const response = await page.goto(`/programs/${HELD_SLUG}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(held!.title);
    await expect(page.getByText("Held topic", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "We could not find that page" })).toHaveCount(0);
  });
});
