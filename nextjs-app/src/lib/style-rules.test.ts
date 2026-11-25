// what this file does: keeps page text readable by rejecting light stone text and tiny text classes
// change in this version (c11): reads app/ and src/components/ so a future light color or text-xs does not return
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// collect tsx files below one root, in a stable order for readable failures
function tsxFiles(root: string): string[] {
  const names = readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  return names.flatMap((name) => {
    const path = join(root, name.name);
    if (name.isDirectory()) return tsxFiles(path);
    return name.name.endsWith(".tsx") ? [path] : [];
  });
}

describe("style rules", () => {
  it("uses stone-700 or darker text and never text-xs", () => {
    const violations: string[] = [];
    const lightText = /(?:placeholder:)?text-stone-[3-6]00\b/g;
    const tinyText = /(?:^|[\s`"'"])text-xs(?:$|[\s`"'"])/g;

    for (const directory of ["app", "src/components"]) {
      for (const file of tsxFiles(join(process.cwd(), directory))) {
        const text = readFileSync(file, "utf8");
        if (lightText.test(text)) {
          violations.push(`${relative(process.cwd(), file)}: uses light text-stone-[3-6]00`);
        }
        lightText.lastIndex = 0;
        if (tinyText.test(text)) {
          violations.push(`${relative(process.cwd(), file)}: uses text-xs`);
        }
        tinyText.lastIndex = 0;
      }
    }

    expect(violations).toEqual([]);
  });
});
