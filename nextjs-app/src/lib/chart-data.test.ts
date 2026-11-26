import { describe, expect, it } from "vitest";
import { chartParts, labelFitsInside, labelSide, percentOf } from "./chart-data";

describe("chartParts", () => {
  it("splits bars and targets and keeps the order", () => {
    const points = [
      { value: 5, kind: "bar" },
      { value: 20, kind: "target" },
      { value: 8, kind: "bar" },
    ] as const;
    const parts = chartParts([...points]);
    expect(parts.bars.map((point) => point.value)).toEqual([5, 8]);
    expect(parts.targets.map((point) => point.value)).toEqual([20]);
  });

  it("counts targets in the axis maximum and never goes below 1", () => {
    expect(chartParts([{ value: 5, kind: "bar" }, { value: 20, kind: "target" }]).axisMax).toBe(20);
    expect(chartParts([]).axisMax).toBe(1);
  });
});

describe("percentOf and labelSide", () => {
  it("places a value on the axis and holds it between 0 and 100", () => {
    expect(percentOf(50, 200)).toBe(25);
    expect(percentOf(500, 200)).toBe(100);
    expect(percentOf(-5, 200)).toBe(0);
  });

  it("moves the target label to the left of its line past 55 percent", () => {
    expect(labelSide(55)).toBe("left");
    expect(labelSide(56)).toBe("right");
  });
});

describe("labelFitsInside", () => {
  it("fits a short label in a long bar and never a tiny bar", () => {
    expect(labelFitsInside(40, 5)).toBe(true);
    expect(labelFitsInside(5, 5)).toBe(false);
  });

  it("needs a longer bar for a longer label", () => {
    expect(labelFitsInside(40, 25)).toBe(false);
    expect(labelFitsInside(60, 25)).toBe(false);
    expect(labelFitsInside(70, 25)).toBe(true);
  });

  it("always fits a bar at 70 percent or more", () => {
    expect(labelFitsInside(70, 200)).toBe(true);
    expect(labelFitsInside(100, 19)).toBe(true);
  });
});
