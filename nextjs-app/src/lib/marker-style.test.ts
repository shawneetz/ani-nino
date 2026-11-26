// what this file does: tests the shape, fill and border rules of map markers
import { describe, expect, it } from "vitest";
import { GROUP_LOOK, HALO_SHADOW, markerLook, SELECTED_SHADOW } from "./marker-style";

const base = { topic: "land", status: "confirmed", approximate: false } as const;

describe("markerLook", () => {
  it("fills confirmed markers and leaves checking markers hollow", () => {
    expect(markerLook(base).background).toBe("#b45309");
    expect(markerLook({ ...base, status: "checking" }).background).toBe("#fff");
  });

  it("uses a dashed border for approximate places", () => {
    expect(markerLook({ ...base, approximate: true }).border).toContain("dashed");
    expect(markerLook(base).border).toContain("solid");
  });

  it("is round for martial law and square for today", () => {
    expect(markerLook(base).borderRadius).toBe("9999px");
    expect(markerLook({ ...base, era: "today" }).borderRadius).toBe("6px");
  });

  it("gives every marker the same halo", () => {
    expect(markerLook(base).boxShadow).toBe(HALO_SHADOW);
    expect(GROUP_LOOK.boxShadow).toBe(HALO_SHADOW);
  });

  it("keeps the selected ring apart from the halo", () => {
    expect(SELECTED_SHADOW).not.toBe(HALO_SHADOW);
  });
});
