// what this file does: tests the slug rules with small fake lists
import { describe, expect, it } from "vitest";
import { slugProblems } from "./slug-check";

const moved = { "old-page": "live-page" };
const held = [{ slug: "held-page" }];

describe("slugProblems", () => {
  it("passes when everything lines up", () => {
    expect(slugProblems(["live-page"], ["held-page"], moved, held)).toEqual([]);
  });

  it("fails when a moved target is not live", () => {
    expect(slugProblems([], ["held-page"], moved, held).join(" ")).toContain("not a live program");
  });

  it("fails when a moved slug is still live", () => {
    expect(slugProblems(["live-page", "old-page"], ["held-page"], moved, held).join(" ")).toContain("still a live program");
  });

  it("fails when a held slug has no file", () => {
    expect(slugProblems(["live-page"], [], moved, held).join(" ")).toContain("no file in content/holding");
  });

  it("fails when a held slug is also live", () => {
    expect(slugProblems(["live-page", "held-page"], ["held-page"], moved, held).join(" ")).toContain("also a live program");
  });

  it("fails when a slug is both moved and held", () => {
    const both = slugProblems(["live-page"], ["old-page"], moved, [{ slug: "old-page" }]);
    expect(both.join(" ")).toContain("also in the held list");
  });
});
