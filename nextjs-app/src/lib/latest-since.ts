// what this file does: picks the dated "what came after" records for the landing page
// "from then to now" block (spec 5.1 block 6)
//   only entries from 2000 onward, newest first, up to 4
//   it reads the `since` lists of every program, so it adds no claim of its own
// pure function, so it can be tested and run on the server

/**
 * The source fields the landing block shows.
 */
export interface SinceSource {
  /** Source title, kept for tests and future use */
  title: string;
  /** Publisher, shown next to the label */
  publisher: string;
  /** Who is speaking, shown as a label chip */
  voice: import("./vocab").Voice;
}

/**
 * The program fields this helper reads.
 */
export interface SinceProgram {
  slug: string;
  title: string;
  since: { year: number; text: string; source: SinceSource }[];
}

/**
 * One entry of the "from then to now" block.
 */
export interface LatestSinceItem {
  year: number;
  text: string;
  programSlug: string;
  programTitle: string;
  source: SinceSource;
}

/** First year that counts as "now" for the block */
export const LATEST_FROM_YEAR = 2000;

/** Most entries the block shows */
export const LATEST_LIMIT = 4;

/**
 * Collects dated `since` entries from every program, newest first.
 *
 * @remarks
 * Ties are broken by program title and then text, so the order never changes between builds
 *
 * @param programs - Programs with their `since` lists
 * @param limit - Most entries to return
 * @param fromYear - Entries before this year are skipped
 * @returns Up to `limit` entries, empty when none qualifies
 */
export function latestSince(
  programs: SinceProgram[],
  limit: number = LATEST_LIMIT,
  fromYear: number = LATEST_FROM_YEAR,
): LatestSinceItem[] {
  return programs
    .flatMap((program) =>
      program.since
        .filter((entry) => entry.year >= fromYear)
        .map((entry) => ({
          year: entry.year,
          text: entry.text,
          programSlug: program.slug,
          programTitle: program.title,
          source: entry.source,
        })),
    )
    .sort(
      (a, b) =>
        b.year - a.year || a.programTitle.localeCompare(b.programTitle) || a.text.localeCompare(b.text),
    )
    .slice(0, limit);
}