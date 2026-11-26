// what this file does: keeps page text readable and keeps the editorial look honest
//   rule 1: text is stone-700 or darker and never text-xs
//   rule 2 (e3): shadow classes are allowed only in map overlay files and the nav dropdown
// reads app/ and src/components/ so a future light color, tiny text or stray shadow does not return
import { readdirSync, readFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// files that may use shadow classes, they are overlays that float over something
// the last group is map pieces planned in stage m, listed now so they do not need a test edit later
const SHADOW_ALLOWED = new Set([
  "SiteNav.tsx",
  "PinMap.tsx",
  "YearSlider.tsx",
  "MapPanel.tsx",
  "TimeBar.tsx",
  "BottomSheet.tsx",
  "PlaceDrawer.tsx",
  "ListPill.tsx",
  "ChipPopover.tsx",
  "FilterChips.tsx",
  "Legend.tsx",
]);

// collect tsx files below one root, in a stable order for readable failures
function tsxFiles(root: string): string[] {
  const names = readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  return names.flatMap((name) => {
    const path = join(root, name.name);
    if (name.isDirectory()) return tsxFiles(path);
    return name.name.endsWith(".tsx") ? [path] : [];
  });
}

// every tsx file under app/ and src/components/
function allFiles(): string[] {
  return ["app", "src/components"].flatMap((directory) => tsxFiles(join(process.cwd(), directory)));
}

describe("style rules", () => {
  it("uses stone-700 or darker text and never text-xs", () => {
    const violations: string[] = [];
    const lightText = /(?:placeholder:)?text-stone-[3-6]00\b/;
    const tinyText = /(?:^|[\s`"'"])text-xs(?:$|[\s`"'"])/;

    for (const file of allFiles()) {
      const text = readFileSync(file, "utf8");
      const name = relative(process.cwd(), file);
      if (lightText.test(text)) violations.push(`${name}: uses light text-stone-[3-6]00`);
      if (tinyText.test(text)) violations.push(`${name}: uses text-xs`);
    }

    expect(violations).toEqual([]);
  });

  it("uses shadow classes only in map overlay files and the nav dropdown", () => {
    const violations: string[] = [];
    // \b also catches variants such as sm:shadow-none
    const shadow = /\bshadow-/;

    for (const file of allFiles()) {
      if (SHADOW_ALLOWED.has(basename(file))) continue;
      if (shadow.test(readFileSync(file, "utf8"))) {
        violations.push(`${relative(process.cwd(), file)}: uses a shadow class outside the allow list`);
      }
    }

    expect(violations).toEqual([]);
  });
});