// what this file does: end-to-end checks for the editorial pages (stage e)
//   landing: masthead, ledger strip, "from then to now", timeline rows, province rows
//   program page: the lead sentence shows once, the dateline matches the status
//   programs: ruled rows, oldest first by default, title sort
//   about: the "ask at a relative" section, the "reading notes" section, the sticky rail
//   charts: figure numbers in order
//   404: the kicker and the two buttons
// nothing here hardcodes how many programs, charts or dated records exist,
// counts come from the yaml files (e2e/live-programs.ts)
import { expect, test } from "@playwright/test";
import { chartCount, fromThenToNowCount, martialLawCount } from "./live-programs";

// one confirmed and one checking page, both live in the current content
const CONFIRMED_SLUG = "laguna-operation-land-transfer";
const CHECKING_SLUG = "quezon-coconut-levy";

test.describe("editorial landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has one h1 and a ledger strip of four numbers", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const ledger = page.getByRole("region", { name: "The site in numbers" });
    await expect(ledger.locator("dt")).toHaveCount(4);
    // the first number is the program count, computed from the content
    await expect(ledger.locator("dd").first()).toHaveText(String(martialLawCount()));
  });

  test("from then to now shows dated records from 2000 onward, newest first", async ({ page }) => {
    const block = page.getByRole("region", { name: "From then to now" });
    const expected = fromThenToNowCount();

    // no qualifying record means the block is not rendered at all
    if (expected === 0) {
      await expect(block).toHaveCount(0);
      return;
    }

    const items = block.locator("ol > li");
    await expect(items).toHaveCount(expected);

    const years = (await items.locator("p.figures").allInnerTexts()).map(Number);
    expect(years).toHaveLength(expected);
    for (const year of years) expect(year).toBeGreaterThanOrEqual(2000);
    expect(years).toEqual([...years].sort((a, b) => b - a));

    // every entry links to its program
    for (const item of await items.all()) {
      await expect(item.getByRole("link", { name: /^Program:/ })).toHaveAttribute("href", /^\/programs\//);
    }

    // the interpretation line links to the limits, and the word echo never appears
    await expect(block.getByRole("link", { name: "Read the limits" })).toHaveAttribute("href", "/about#limits");
    await expect(block).not.toContainText(/echo/i);
  });

  test("the timeline has one ruled row per martial-law program", async ({ page }) => {
    const timeline = page.getByRole("region", { name: "1972 to 1986" });
    await expect(timeline.locator("ol > li")).toHaveCount(martialLawCount());
    await expect(timeline.getByRole("link")).toHaveCount(martialLawCount());
  });

  test("the province list has five ruled rows", async ({ page }) => {
    const provinces = page.getByRole("region", { name: "Pick a province" });
    await expect(provinces.locator("li")).toHaveCount(5);
  });
});

test.describe("editorial program page", () => {
  for (const slug of [CONFIRMED_SLUG, CHECKING_SLUG]) {
    test(`${slug}: the lead sentence shows once`, async ({ page }) => {
      await page.goto(`/programs/${slug}`);

      // the lead is the paragraph right after the "what the record shows" heading
      const lead = page
        .locator("#record")
        .locator("h2", { hasText: "What the record shows" })
        .locator("xpath=following-sibling::p[1]");
      const text = (await lead.innerText()).trim();
      expect(text.length).toBeGreaterThan(0);

      // the header must not repeat it
      await expect(page.getByText(text, { exact: true })).toHaveCount(1);
    });
  }

  test("a confirmed page shows its checked date and no open question", async ({ page }) => {
    await page.goto(`/programs/${CONFIRMED_SLUG}`);
    await expect(page.getByText(/^Checked on \d{4}-\d{2}-\d{2}$/)).toBeVisible();
    await expect(page.locator("#checking")).toHaveCount(0);
  });

  test("a checking page shows the open question and no checked date", async ({ page }) => {
    await page.goto(`/programs/${CHECKING_SLUG}`);
    await expect(page.locator("#checking")).toBeVisible();
    await expect(page.getByText(/^Checked on /)).toHaveCount(0);
  });

  test("section headings are not numbered", async ({ page }) => {
    await page.goto(`/programs/${CONFIRMED_SLUG}`);
    for (const heading of await page.getByRole("heading", { level: 2 }).allInnerTexts()) {
      expect(heading.trim()).not.toMatch(/^\d/);
    }
  });
});

test.describe("programs reading list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/programs");
  });

  test("every row has one title link and one status tag", async ({ page }) => {
    const rows = page.locator("section[aria-labelledby] article");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    for (const row of await rows.all()) {
      await expect(row.locator("h3 a")).toHaveCount(1);
      await expect(row.getByText(/^(Confirmed|Still checking)$/)).toHaveCount(1);
    }
  });

  test("the default order is oldest first", async ({ page }) => {
    // the full year range is read once by screen readers, its first four digits are the start year
    const ranges = await page.locator("article p.figures .sr-only").allInnerTexts();
    const starts = ranges.map((range) => Number(range.slice(0, 4)));
    expect(starts.length).toBeGreaterThan(0);
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
  });

  test("sorting by title puts rows in alphabetical order", async ({ page }) => {
    await page.getByLabel("Sort by").selectOption("title");
    const titles = await page.locator("article h3").allInnerTexts();
    expect(titles.length).toBeGreaterThan(0);
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
  });
});

test.describe("about page", () => {
  test("keeps its sections in the agreed order", async ({ page }) => {
    await page.goto("/about");
    const ids = await page.locator("main section[id]").evaluateAll((nodes) => nodes.map((node) => node.id));
    expect(ids).toEqual([
      "story",
      "using",
      "method",
      "limits",
      "where-to-start",
      "reading-notes",
      "ask-at-a-relative",
      "glossary",
      "contribute",
    ]);
  });

  test("ask at a relative has three questions and collects nothing", async ({ page }) => {
    await page.goto("/about#ask-at-a-relative");
    const section = page.locator("#ask-at-a-relative");
    await expect(section.getByRole("heading", { name: "Ask at a relative" })).toBeVisible();
    await expect(section.locator("ol > li")).toHaveCount(3);
    // no form, no input, nothing is collected
    await expect(section.locator("form, input, textarea, select")).toHaveCount(0);
  });

  test("reading notes are labeled as interpretation and link to program pages", async ({ page }) => {
    await page.goto("/about#reading-notes");
    const section = page.getByRole("region", { name: "Reading notes" });
    await expect(section).toBeVisible();
    await expect(section.getByText("Interpretation", { exact: true })).toBeVisible();

    const notes = section.locator("ol > li");
    expect(await notes.count()).toBeGreaterThan(0);
    for (const note of await notes.all()) {
      // every note points back to the pages it rests on
      expect(await note.locator('a[href^="/programs/"]').count()).toBeGreaterThan(0);
    }
    await expect(section).not.toContainText(/echo/i);
  });

  test("the sticky rail lists the sections and jumps to one", async ({ page }) => {
    await page.goto("/about");
    const rail = page.getByRole("navigation", { name: "On this page" });
    await expect(rail).toBeVisible();
    await rail.getByRole("link", { name: "Ask at a relative" }).click();
    await expect(page).toHaveURL(/#ask-at-a-relative$/);
  });

  test.describe("on a phone", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("the rail is hidden and nothing scrolls sideways", async ({ page }) => {
      await page.goto("/about");
      await expect(page.getByRole("navigation", { name: "On this page" })).toBeHidden();
      const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
      expect(fits).toBe(true);
    });
  });
});

test.describe("charts as figures", () => {
  test("figures are numbered in page order", async ({ page }) => {
    await page.goto("/charts");
    const cards = page.locator('article[id^="chart-"]');
    const total = chartCount();
    await expect(cards).toHaveCount(total);

    for (let index = 0; index < total; index += 1) {
      await expect(cards.nth(index).getByText(`Figure ${index + 1}`, { exact: true })).toBeVisible();
    }
  });
});

test.describe("not found page", () => {
  test("shows the error kicker and both ways back", async ({ page }) => {
    const response = await page.goto("/nope");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("Error 404", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore the map" })).toHaveAttribute("href", "/map");
    await expect(page.getByRole("link", { name: "Browse all programs" })).toHaveAttribute("href", "/programs");
  });
});