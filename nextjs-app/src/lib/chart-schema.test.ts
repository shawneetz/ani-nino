import { describe, expect, it } from "vitest";
import { chartSchema } from "./content-schema";

const source = {
  title: "Test report",
  publisher: "Test publisher",
  voice: "official",
  url: "https://example.com/report",
  accessed: "2026-11-25",
};

function point(label: string, kind: "bar" | "target" = "bar", scope: unknown = "national") {
  return { label, value: 10, kind, scope, source };
}

function chart(points: unknown[]) {
  return {
    id: "test-chart",
    title: "Test chart",
    question: "What does this chart compare?",
    points,
  };
}

describe("chartSchema", () => {
  it("allows empty charts and defaults sameTotal to false", () => {
    const result = chartSchema.safeParse(chart([]));

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sameTotal).toBe(false);
  });

  it("allows two bars and one bar with a target", () => {
    expect(chartSchema.safeParse(chart([point("One"), point("Two")])).success).toBe(true);
    expect(chartSchema.safeParse(chart([point("One"), point("Goal", "target")])).success).toBe(true);
  });

  it("rejects one bar alone and targets without a bar", () => {
    expect(chartSchema.safeParse(chart([point("One")])).success).toBe(false);
    expect(chartSchema.safeParse(chart([point("Goal", "target")])).success).toBe(false);
  });

  it("requires a scope for every point and a question for every chart", () => {
    const missingScope = { ...point("One"), scope: undefined };
    expect(chartSchema.safeParse(chart([missingScope, point("Two")])).success).toBe(false);
    expect(chartSchema.safeParse({ ...chart([point("One"), point("Two")]), question: undefined }).success).toBe(false);
  });
});
