// what this file does: groups programs by the spot they sit on, so the map shows one
// marker per place instead of a stack of pins on top of each other
// coordinates are rounded to 4 decimals (about 11 meters) before comparing
// no program is ever dropped: it appears in every group where one of its places lands
import type { Province } from "./vocab";

export type GroupablePlace = {
  name: string;
  province: Province;
  lat: number;
  lng: number;
  approximate: boolean;
};

export type Groupable = {
  slug: string;
  title: string;
  startYear: number;
  places: GroupablePlace[];
};

export type PlaceGroup<T extends Groupable> = {
  key: string; // rounded "lat,lng", stable between renders
  name: string; // name of the first place seen at this spot
  lat: number;
  lng: number;
  approximate: boolean; // true only when every place here is approximate
  items: T[]; // programs at this spot, oldest first
};

const round4 = (value: number): number => Math.round(value * 10000) / 10000;

// an empty provinces list means no restriction, same rule as visiblePrograms
export function groupPlaces<T extends Groupable>(programs: T[], provinces: Province[] = []): PlaceGroup<T>[] {
  const byKey = new Map<string, PlaceGroup<T>>();

  for (const program of programs) {
    for (const place of program.places) {
      // hide pins that sit in provinces the reader did not pick
      if (provinces.length > 0 && !provinces.includes(place.province)) continue;

      const lat = round4(place.lat);
      const lng = round4(place.lng);
      const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;

      let group = byKey.get(key);
      if (!group) {
        group = { key, name: place.name, lat, lng, approximate: place.approximate, items: [] };
        byKey.set(key, group);
      } else if (!place.approximate) {
        // one exact place makes the whole spot exact
        group.approximate = false;
      }
      // a program that lists the same spot twice still counts once
      if (!group.items.includes(program)) group.items.push(program);
    }
  }

  const groups = [...byKey.values()];
  for (const group of groups) {
    group.items.sort((a, b) => a.startYear - b.startYear || a.title.localeCompare(b.title));
  }
  // busiest spots first, then by name, so the order never changes between renders
  return groups.sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name));
}
