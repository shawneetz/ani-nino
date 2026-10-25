import { describe, expect, it } from "vitest";
import type { ExplorerPin } from "./map-types";
import { revealPatch } from "./pin-nav";

function pin(overrides: Partial<ExplorerPin> = {}): ExplorerPin {
  return {
    id: "p",
    layer: "martial_law",
    title: "Pin",
    program: null,
    instruments: [],
    family: "land_reform",
    secondaryFamilies: [],
    startDate: "1975-01-01",
    endDate: "1975-03-01",
    dateLabel: "1975",
    promise: null,
    record: null,
    badge: null,
    status: "lead",
    openQuestion: null,
    verifiedOn: null,
    verificationNote: null,
    locations: [
      {
        id: 1,
        name: "Calamba",
        municipality: "Calamba",
        province: "laguna",
        lat: 14.2,
        lng: 121.1,
        precision: "municipality",
        isAnchor: true,
        sortOrder: 0,
      },
    ],
    ...overrides,
  };
}

describe("revealPatch", () => {
  it("does nothing when the pin is already visible", () => {
    expect(revealPatch(pin(), { month: "1975-02", today: false })).toBeNull();
  });

  it("moves the slider to the start month when the pin is hidden", () => {
    expect(revealPatch(pin(), { month: "1980-01", today: false })).toEqual({ month: "1975-01" });
  });

  it("includes the final month of a date window", () => {
    expect(revealPatch(pin(), { month: "1975-03", today: false })).toBeNull();
    expect(revealPatch(pin(), { month: "1975-04", today: false })).toEqual({ month: "1975-01" });
  });

  it("keeps a one-off event visible for 12 months", () => {
    const event = pin({ startDate: "1973-02-01", endDate: "1973-02-01" });
    expect(revealPatch(event, { month: "1974-01", today: false })).toBeNull();
    expect(revealPatch(event, { month: "1974-02", today: false })).toEqual({ month: "1973-02" });
  });

  it("turns Today on without changing the slider", () => {
    const today = pin({ layer: "today", startDate: "2021-01-01", endDate: null });
    expect(revealPatch(today, { month: "1975-01", today: false })).toEqual({ today: true });
    expect(revealPatch(today, { month: "1975-01", today: true })).toBeNull();
  });
});
