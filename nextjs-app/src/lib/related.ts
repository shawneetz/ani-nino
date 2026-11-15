// what this file does: picks up to 3 related programs for a program page
// same province ranks first, then same topic
// programs already shown through echo links are left out so nothing repeats
import type { Province, Topic } from "./vocab";

// the smallest shape needed, so tests do not need full programs
export type RelatedInput = {
  slug: string;
  topic: Topic;
  startYear: number;
  echoOf?: string;
  places: { province: Province }[];
};

export function relatedPrograms<T extends RelatedInput>(current: T, all: T[], limit = 3): T[] {
  const provinces = new Set(current.places.map((place) => place.province));

  return all
    // never list the page itself or programs already linked as echoes
    .filter((item) => item.slug !== current.slug)
    .filter((item) => item.slug !== current.echoOf && item.echoOf !== current.slug)
    .map((item) => {
      const sameProvince = item.places.some((place) => provinces.has(place.province));
      const sameTopic = item.topic === current.topic;
      // province counts double so it always outranks topic alone
      const score = (sameProvince ? 2 : 0) + (sameTopic ? 1 : 0);
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    // best score first, then older programs, then slug for a stable order
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.item.startYear - b.item.startYear ||
        a.item.slug.localeCompare(b.item.slug),
    )
    .slice(0, limit)
    .map((entry) => entry.item);
}
