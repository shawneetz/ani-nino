// what this file does: tests grouping, counts, ordering and that no program is lost
import { describe, expect, it } from "vitest";
import { groupPlaces, type Groupable } from "./group-places";
import type { Province } from "./vocab";

type Spot = [name: string, province: Province, lat: number, lng: number, approximate?: boolean];

// builds a tiny fake program from a list of spots
function make(slug: string, startYear: number, spots: Spot[]): Groupable {
  return {
    slug,
    title: slug.toUpperCase(),
    startYear,
    places: spots.map(([name, province, lat, lng, approximate = false]) => ({ name, province, lat, lng, approximate })),
  };
}

const calamba: Spot = ["Calamba", "laguna", 14.2117, 121.1653, true];
const programs = [
  make("late", 1980, [calamba]),
  make("early", 1972, [["Calamba", "laguna", 14.21171, 121.16529, true]]), // rounds to the same spot
  make("dam", 1979, [["Tanay", "rizal", 14.4975, 121.2864], ["General Nakar", "quezon", 14.7667, 121.6333]]),
  make("coco", 1973, [["Lucena", "quezon", 13.9373, 121.6171]]),
];

describe("groupPlaces", () => {
  it("merges programs on the same rounded spot and sorts them oldest first", () => {
    const group = groupPlaces(programs).find((item) => item.key === "14.2117,121.1653");
    expect(group?.items.map((item) => item.slug)).toEqual(["early", "late"]);
  });

  it("keeps different places apart and puts the busiest spot first", () => {
    const groups = groupPlaces(programs);
    expect(groups).toHaveLength(4);
    expect(groups[0].items).toHaveLength(2);
  });

  it("does not lose any program", () => {
    const seen = new Set(groupPlaces(programs).flatMap((group) => group.items.map((item) => item.slug)));
    expect([...seen].sort()).toEqual(["coco", "dam", "early", "late"]);
  });

  it("only keeps places in the picked provinces", () => {
    const groups = groupPlaces(programs, ["quezon"]);
    expect(groups.map((group) => group.name).sort()).toEqual(["General Nakar", "Lucena"]);
    expect(groupPlaces(programs, ["cavite"])).toEqual([]);
  });

  it("is approximate only when every place at the spot is approximate", () => {
    const mixed = [make("a", 1972, [calamba]), make("b", 1973, [["Calamba", "laguna", 14.2117, 121.1653, false]])];
    expect(groupPlaces(mixed)[0].approximate).toBe(false);
    expect(groupPlaces([mixed[0]])[0].approximate).toBe(true);
  });

  it("counts a program once when it lists the same spot twice", () => {
    const twice = make("twice", 1972, [calamba, ["Calamba lakeshore", "laguna", 14.2117, 121.1653]]);
    expect(groupPlaces([twice])[0].items).toHaveLength(1);
  });
});
