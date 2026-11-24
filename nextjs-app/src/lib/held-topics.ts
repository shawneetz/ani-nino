// what this file does: lists topics that were researched but are not published
// the held page on /programs/[slug] and the held topics section on /sources both read this
// the files themselves live in content/holding, which loadContent never reads
// reasons say what is missing, in the passive, with no verdicts (spec sections 3 and 7)

/**
 * One held topic.
 */
export interface HeldTopic {
  /** Old program slug, also the file name in `content/holding/`. */
  slug: string;
  /** Plain title, same as the held file. */
  title: string;
  /** Why it is held and what source would bring it back. */
  reason: string;
}

/**
 * Every held topic, in the order they show on the sources page.
 *
 * @remarks
 * Keep this list in step with `content/holding/README.md`.
 */
export const HELD_TOPICS: readonly HeldTopic[] = [
  {
    slug: "laguna-kkk",
    title: "Kilusang Kabuhayan at Kaunlaran (KKK) in Laguna",
    reason: "No Laguna project was found, so no sourced effect on farmers is shown. A Laguna project list or loan record would bring it back.",
  },
  {
    slug: "batangas-sugar-trading",
    title: "Sugar trading under government bodies",
    reason: "No sources were found. The names and legal basis of the trading bodies, and the prices paid to Batangas growers, would bring it back.",
  },
  {
    slug: "cavite-mataas-na-gulod-national-park",
    title: "Mataas na Gulod National Park in Cavite",
    reason: "No link to farmers was found. The full proclamation text and any account of people living in the area would bring it back.",
  },
  {
    slug: "cavite-coastal-road-reclamation",
    title: "Manila-Cavite coastal road and reclamation",
    reason: "The decree was found, but no 1970s source on its effect. A count of affected fisherfolk or farm families in Bacoor and Kawit would bring it back.",
  },
  {
    slug: "cavite-maragondon-ternate-tourist-zone",
    title: "Maragondon and Ternate tourist zone",
    reason: "No source says what the zone did to farmers in the two towns. A record of tenants or farmers there before 1986 would bring it back.",
  },
  {
    slug: "rizal-kaliwa-laiban-dam",
    title: "Laiban and Kaliwa dam plans",
    reason: "Nothing before 1986 was found on affected communities. A source on Dumagat communities in those years would bring it back, and the PCIJ Laiban Dam chronology is a lead.",
  },
];

/**
 * Finds a held topic by slug.
 *
 * @param slug - Any program slug.
 * @returns The held topic, or `null` when the slug is not held.
 */
export function heldTopic(slug: string): HeldTopic | null {
  return HELD_TOPICS.find((topic) => topic.slug === slug) ?? null;
}
