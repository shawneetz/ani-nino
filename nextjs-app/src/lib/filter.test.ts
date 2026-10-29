import { describe, expect, it } from "vitest";
import { visiblePins, type FilterablePin } from "./filter";

type TestPin = FilterablePin & { id: string };

function pin(id: string, overrides: Partial<TestPin> = {}): TestPin {
  return {
    id,
    layer: "martial_law",
    family: "land_reform",
    secondaryFamilies: [],
    startDate: "1973-01-01",
    endDate: null,
    locations: [{ province: "laguna" }],
    ...overrides,
  };
}

const ended = pin("ended", { startDate: "1972-11-01", endDate: "1973-12-01" });
const open = pin("open", { family: "infrastructure", startDate: "1975-01-01" });
const event = pin("event", {
  family: "displacement",
  startDate: "1979-03-01",
  endDate: "1979-03-01",
  locations: [{ province: "laguna" }, { province: "quezon" }],
});
const secondary = pin("secondary", {
  family: "labor",
  secondaryFamilies: ["export_tax_monopoly"],
  startDate: "1978-10-01",
  endDate: "1979-12-01",
});
const today = pin("today", { layer: "today", family: "labor", startDate: "2021-01-01" });
const all = [ended, open, event, secondary, today];
const ids = (pins: TestPin[]) => pins.map(({ id }) => id);

describe("visiblePins", () => {
  it("filters date ranges and cumulative results", () => {
    expect(ids(visiblePins(all, { month: "1973-12" }))).toContain("ended");
    expect(ids(visiblePins(all, { month: "1974-01" }))).not.toContain("ended");
    expect(ids(visiblePins(all, { month: "1980-01", mode: "cumulative" }))).toEqual([
      "ended",
      "open",
      "event",
      "secondary",
    ]);
  });

  it("filters secondary families and any matching location", () => {
    expect(ids(visiblePins(all, { families: ["export_tax_monopoly"] }))).toEqual(["secondary"]);
    expect(ids(visiblePins(all, { provinces: ["quezon"] }))).toEqual(["event"]);
  });

  it("allows explicit linger for point events and keeps Today separate", () => {
    expect(ids(visiblePins(all, { month: "1980-02", pointEventLingerMonths: 11 }))).toContain("event");
    expect(ids(visiblePins(all, { month: "1972-09", today: true }))).toEqual(["today"]);
  });

  it("rejects malformed months and invalid linger values", () => {
    expect(() => visiblePins(all, { month: "1975-13" })).toThrow(RangeError);
    expect(() => visiblePins(all, { pointEventLingerMonths: -1 })).toThrow(RangeError);
  });
});
