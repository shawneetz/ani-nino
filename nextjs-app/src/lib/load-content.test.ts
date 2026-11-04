// What this file does: tests content loading, filename checks, gap references,
// sorting and source collection without changing the real content files.
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { stringify } from "yaml";
import { ContentError, loadContent } from "./load-content";

const temporaryDirectories: string[] = [];

async function makeContentDirectory(files: Record<string, string>): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), "anino-content-"));
  temporaryDirectories.push(directory);
  for (const [name, contents] of Object.entries(files)) {
    const file = path.join(directory, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, contents);
  }
  return directory;
}

function programYaml(changes: Record<string, unknown> = {}) {
  return stringify({
    slug: "test-program",
    title: "Test program",
    when: "1972 onward",
    topic: "land",
    status: "checking",
    startYear: 1972,
    endYear: null,
    places: [{ name: "Calamba", province: "laguna", lat: 14.2117, lng: 121.1653 }],
    happened: "Something happened here.",
    question: "What happened next?",
    ...changes,
  });
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true }),
  ));
});

describe("loadContent", () => {
  it("loads and sorts programs, charts and gaps", async () => {
    const directory = await makeContentDirectory({
      "programs/late.yaml": programYaml({ slug: "late", title: "Late", startYear: 1980 }),
      "programs/early.yaml": programYaml({ slug: "early", title: "Early" }),
      "charts/test-chart.yaml": stringify({ id: "test-chart", title: "A chart", points: [] }),
      "gaps.yaml": stringify([{ id: "gap-1", kind: "method", title: "A gap", description: "Missing." }]),
    });
    const content = await loadContent(directory);
    expect(content.programs.map((program) => program.slug)).toEqual(["early", "late"]);
    expect(content.charts).toHaveLength(1);
    expect(content.gaps).toHaveLength(1);
  });

  it("rejects mismatched filenames and unknown gap references", async () => {
    const directory = await makeContentDirectory({
      "programs/wrong-name.yaml": programYaml({ slug: "right-name" }),
      "gaps.yaml": stringify([{ id: "gap", kind: "scope", title: "Gap", description: "Missing.", program: "unknown" }]),
    });
    await expect(loadContent(directory)).rejects.toThrow(ContentError);
    try {
      await loadContent(directory);
    } catch (error) {
      expect(error).toBeInstanceOf(ContentError);
      expect((error as ContentError).issues.join("\n")).toContain("filename must match slug");
      expect((error as ContentError).issues.join("\n")).toContain("unknown program");
    }
  });

  it("collects one shared source with both program usages", async () => {
    const source = { title: "Shared source", publisher: "Publisher", voice: "official", url: "https://example.com/source" };
    const directory = await makeContentDirectory({
      "programs/one.yaml": programYaml({ slug: "one", title: "One", sources: [source] }),
      "programs/two.yaml": programYaml({ slug: "two", title: "Two", sources: [source] }),
      "gaps.yaml": "[]",
    });
    const content = await loadContent(directory);
    expect(content.sources).toHaveLength(1);
    expect(content.sources[0].usedIn).toEqual(["One", "Two"]);
  });
});
