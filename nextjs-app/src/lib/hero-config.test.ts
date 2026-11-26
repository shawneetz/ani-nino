import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { HERO } from "./site";

describe("HERO", () => {
  it("is null or fully credited", () => {
    if (HERO === null) return;
    for (const field of [HERO.author, HERO.source, HERO.sourceUrl, HERO.license, HERO.caption, HERO.position]) {
      expect(field.trim()).not.toBe("");
    }
    expect(HERO.sourceUrl).toMatch(/^https?:\/\//);
    expect(Number.isInteger(HERO.year)).toBe(true);
  });

  it("points at a real file inside public/hero and stays within 2400px", () => {
    if (HERO === null) return;
    expect(HERO.src.startsWith("/hero/")).toBe(true);
    expect(existsSync(path.join(process.cwd(), "public", HERO.src))).toBe(true);
    expect(HERO.width).toBeLessThanOrEqual(2400);
  });
});
