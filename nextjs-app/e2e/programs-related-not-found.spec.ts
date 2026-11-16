// what this file does: end-to-end checks for u19, u17 and u23
//   programs index: list, count, search, empty state, filter chips and the map link
//   related programs: a few links, never the page itself, never echo links
//   not found: 404 status, message, both buttons and the shared header and footer
// nothing here hardcodes how many programs exist, counts are compared to what is on screen
// so adding a program in content/ never breaks these tests
import { expect, test, type Page } from "@playwright/test";

/**
 * Reads the number shown in the live count of the programs index.
 *
 * @param page - The current page, already on /programs.
 * @returns The count as a number.
 */
async function shownCount(page: Page): Promise<number> {
    const text = await page.getByTestId("program-count").locator("strong").innerText();
    return Number(text);
}

test.describe("programs index", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/programs");
    });

    test("lists programs and the count matches the cards", async ({ page }) => {
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        const cards = page.locator("section[aria-labelledby] article");
        const count = await shownCount(page);
        expect(count).toBeGreaterThan(0);
        await expect(cards).toHaveCount(count);
    });

    test("search narrows the list and ignores accents", async ({ page }) => {
        const before = await shownCount(page);
        // "binan" must find a program placed in Biñan
        await page.getByLabel("Search").fill("binan");
        await expect(page.getByRole("link", { name: "Operation Land Transfer in Laguna" })).toBeVisible();
        expect(await shownCount(page)).toBeLessThan(before);
    });

    test("shows an empty state and clears it", async ({ page }) => {
        const before = await shownCount(page);
        await page.getByLabel("Search").fill("zzzzzz");
        await expect(page.getByText("No programs match")).toBeVisible();
        await page.getByRole("button", { name: "Clear search and filters" }).click();
        await expect(page.getByText("No programs match")).toHaveCount(0);
        expect(await shownCount(page)).toBe(before);
    });

    test("province chip filters the list and the map link carries it", async ({ page }) => {
        const before = await shownCount(page);
        const chip = page.getByRole("button", { name: "Quezon", exact: true });
        await chip.click();
        await expect(chip).toHaveAttribute("aria-pressed", "true");
        expect(await shownCount(page)).toBeLessThan(before);
        await expect(page.getByRole("link", { name: "See on the map" })).toHaveAttribute(
            "href",
            /province=quezon/,
        );
    });

    test("today's echoes switch adds programs", async ({ page }) => {
        const before = await shownCount(page);
        await page.getByRole("switch", { name: "Show today's echoes" }).click();
        expect(await shownCount(page)).toBeGreaterThan(before);
        await expect(page.getByRole("link", { name: "See on the map" })).toHaveAttribute("href", /today=1/);
    });
});

test.describe("related programs", () => {
    test("shows up to 3 links and never the page itself", async ({ page }) => {
        await page.goto("/programs/laguna-operation-land-transfer");
        const links = page.locator("#related a");
        const count = await links.count();
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThanOrEqual(3);
        for (const href of await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")))) {
            expect(href).not.toBe("/programs/laguna-operation-land-transfer");
        }
    });

    test("leaves out programs already shown as echo links", async ({ page }) => {
        await page.goto("/programs/laguna-lake-fishpens");
        // the echo is listed under "past and present"
        await expect(page.locator("#echoes").getByRole("link", { name: "Laguna de Bay fishpens today" })).toBeVisible();
        // and must not repeat under related programs
        await expect(page.locator('#related a[href="/programs/laguna-lake-fishpens-today"]')).toHaveCount(0);
    });

    test("a related link opens that program", async ({ page }) => {
        await page.goto("/programs/laguna-operation-land-transfer");
        const first = page.locator("#related a").first();
        const href = await first.getAttribute("href");
        await first.click();
        await expect(page).toHaveURL(new RegExp(`${href}$`));
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
});

test.describe("not found page", () => {
    test("unknown url returns 404 with the message and both buttons", async ({ page }) => {
        const response = await page.goto("/nope");
        expect(response?.status()).toBe(404);
        await expect(page.getByRole("heading", { level: 1, name: "We could not find that page" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Explore the map" })).toHaveAttribute("href", "/map");
        await expect(page.getByRole("link", { name: "Browse all programs" })).toHaveAttribute("href", "/programs");
    });

    test("a bad program slug also lands on it", async ({ page }) => {
        const response = await page.goto("/programs/bad-slug");
        expect(response?.status()).toBe(404);
        await expect(page.getByRole("heading", { level: 1, name: "We could not find that page" })).toBeVisible();
    });

    test("keeps the shared header and footer, and the map button works", async ({ page }) => {
        await page.goto("/nope");
        await expect(page.getByRole("banner")).toBeVisible();
        await expect(page.getByRole("contentinfo")).toBeVisible();
        await page.getByRole("link", { name: "Explore the map" }).click();
        await expect(page).toHaveURL(/\/map$/);
    });
});