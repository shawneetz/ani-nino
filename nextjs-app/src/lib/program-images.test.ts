// what this file does: keeps program images honest, every entry is credited and its file exists
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PROGRAM_IMAGES, programImage } from "./program-images";

describe("PROGRAM_IMAGES", () => {
  it("credits every image and points at a real file", () => {
    for (const [slug, image] of Object.entries(PROGRAM_IMAGES)) {
      for (const field of [image.author, image.source, image.sourceUrl, image.license, image.caption, image.position]) {
        expect(field.trim(), `${slug}: missing credit field`).not.toBe("");
      }
      expect(image.sourceUrl).toMatch(/^https?:\/\//);
      expect(image.src.startsWith("/")).toBe(true);
      expect(existsSync(path.join(process.cwd(), "public", image.src)), `${slug}: file missing`).toBe(true);
      expect(image.width).toBeLessThanOrEqual(2400);
    }
  });
});

describe("programImage", () => {
  it("returns null for a slug with no image", () => {
    expect(programImage("nope")).toBeNull();
    expect(programImage("constructor")).toBeNull();
  });
});
