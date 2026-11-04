// What this file does: checks every seed rule with one failing example each.
import { describe, expect, it } from "vitest";
import { sampleBundle } from "./__fixtures__/seed-bundle";
import { validateSeed } from "./seed-validate";
import type { SeedBundle } from "./seed-schemas";

describe("validateSeed", () => {
  it("accepts the clean example", () => {
    expect(validateSeed(sampleBundle()).errors).toEqual([]);
  });

  // Each row: a name, a change that breaks one rule, and the message we expect.
  const cases: [string, (b: SeedBundle) => void, string][] = [
    ["pin with no source", (b) => { b.pins[0].sources = []; }, "needs at least one source"],
    ["unknown source slug", (b) => { b.pins[0].sources[0].source = "nope"; }, 'cites unknown source "nope"'],
    [
      "two anchors",
      (b) => {
        b.pins[0].locations.push({ ...b.pins[0].locations[0], name: "Cabuyao" });
      },
      "exactly one anchor location (found 2)",
    ],
    ["no anchor", (b) => { b.pins[0].locations[0].isAnchor = false; }, "exactly one anchor location (found 0)"],
    ["start not first of month", (b) => { b.pins[0].startDate = "1975-06-15"; }, "startDate must be the first day of a month"],
    ["end not first of month", (b) => { b.pins[0].endDate = "1976-06-15"; }, "endDate must be the first day of a month"],
    ["end before start", (b) => { b.pins[0].startDate = "1976-06-01"; b.pins[0].endDate = "1975-06-01"; }, "endDate is before startDate"],
    ["martial-law pin too early", (b) => { b.pins[0].startDate = "1972-08-01"; }, "martial-law pins must start between"],
    ["today pin too early", (b) => { b.pins[1].startDate = "1986-02-01"; }, "today pins must start on or after"],
    ["lead without question", (b) => { b.pins[0].openQuestion = null; }, "lead pins need an openQuestion"],
    ["record without badge", (b) => { b.pins[0].badge = null; }, "a record needs a badge"],
    ["primary family repeated", (b) => { b.pins[0].secondaryFamilies = ["land_reform"]; }, "primary family is repeated"],
    [
      "verified without record source",
      (b) => {
        b.pins[0].status = "verified";
        b.pins[0].verifiedOn = "2026-11-04";
        b.pins[0].openQuestion = null;
        b.pins[0].sources = [{ source: "pd-27", role: "promise" }];
      },
      'verified pins need a source with role "record"',
    ],
    ["duplicate pin id", (b) => { b.pins.push({ ...b.pins[0] }); }, "duplicate id"],
    ["link with swapped layers", (b) => { b.links[0].today = "fixture-past"; }, "today side must be a today pin"],
    ["link to unknown pin", (b) => { b.links[0].past = "nope"; }, 'unknown pin "nope"'],
    ["chart point with unknown source", (b) => { b.charts[0].series[0].points[0].source = "nope"; }, "cites unknown source"],
    ["video with unknown pin", (b) => { b.videos[0].pin = "nope"; }, 'unknown pin "nope"'],
    ["source url without access date", (b) => { b.sources[0].url = "https://example.org/x"; }, "a url needs accessedOn"],
  ];

  it.each(cases)("rejects: %s", (_name, change, expected) => {
    const bundle = sampleBundle();
    change(bundle);
    expect(validateSeed(bundle).errors.join("\n")).toContain(expected);
  });

  it("warns about a source nobody cites", () => {
    const bundle = sampleBundle();
    bundle.sources.push({ id: "unused", title: "Unused", publisher: "Nobody", kind: "news" });
    expect(validateSeed(bundle).warnings.join("\n")).toContain('source "unused"');
  });
});
