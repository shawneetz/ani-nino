import { expect, test } from "@playwright/test";
import { readdirSync } from "node:fs";

test.describe("post-C11 UI checks", () => {
  test("390px map and programs filters have no sideways scroll", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/map");
    await expect(page.getByText("Layer", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("group", { name: "Filters" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

    await page.goto("/programs");
    await expect(page.getByText("Layer", { exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test("featured card remains keyboard and hover visible", async ({ page }) => {
    await page.goto("/");
    const cardLink = page.getByRole("region", { name: "Start here" }).getByRole("link").first();
    await cardLink.hover();
    await cardLink.focus();
    await expect(cardLink).toBeFocused();
    await expect(cardLink).toBeVisible();
  });

  test("sticky source and map bars do not cover target headings", async ({ page }) => {
    await page.goto("/sources#held-topics");
    await expect(page.getByRole("heading", { name: "Held topics" })).toBeVisible();
    await page.goto("/map");
    await page.getByText("Map key", { exact: true }).click();
    await expect(page.getByText("Solid fill: confirmed", { exact: true })).toBeVisible();
  });

  test("program keyboard path includes the skip link and cite button", async ({ page }) => {
    await page.goto("/programs/laguna-operation-land-transfer");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    const cite = page.getByRole("button", { name: "Copy citation" });
    await cite.focus();
    await expect(cite).toBeFocused();
  });

  test("print mode keeps citation and place list while hiding chrome", async ({ page }) => {
    for (const slug of ["laguna-operation-land-transfer", "quezon-coconut-levy"]) {
      await page.goto(`/programs/${slug}`);
      await page.emulateMedia({ media: "print" });
      await expect(page.getByTestId("citation-text")).toBeVisible();
      await expect(page.getByRole("heading", { name: "Places" })).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
      await expect(page.getByRole("button", { name: "Copy citation" })).toBeHidden();
      await expect(page.getByRole("link", { name: "Back to the map" })).toBeHidden();
    }
  });

  test("charts remain contained at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/charts");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test("live program text has no first-person draft phrases", async ({ page }) => {
    const slugs = readdirSync("content/programs").filter((name) => name.endsWith(".yaml")).map((name) => name.replace(/\.yaml$/, ""));
    for (const slug of slugs) {
      await page.goto(`/programs/${slug}`);
      const text = await page.locator("body").innerText();
      expect(text, slug).not.toMatch(/\bI\b|\bmy notes\b|\byour notes\b/);
    }
  });
});
