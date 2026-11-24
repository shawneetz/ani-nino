// what this file does: lists old program slugs that were merged into a live page
// next.config.ts builds permanent redirects from this map, so old links keep working
// rule: a slug never dies (spec section 4), so every merge adds a line here
// targets must be live programs, scripts/check-content.ts fails the build when one is not

/**
 * Old slug to live slug, for pages that were merged or deleted.
 */
export const MOVED: Readonly<Record<string, string>> = {
  "laguna-certificates-of-land-transfer": "laguna-operation-land-transfer",
  "rizal-lakeshore-fisherfolk": "laguna-lake-fishpens",
  "laguna-hacienda-yulo-today": "laguna-hacienda-yulo",
  "laguna-lake-fishpens-today": "laguna-lake-fishpens",
};

/**
 * Finds the live slug that replaced an old one.
 *
 * @param slug - Any program slug.
 * @returns The live slug it moved to, or `null` when the slug was never moved.
 */
export function movedTarget(slug: string): string | null {
  // hasOwnProperty keeps slugs like "constructor" from matching
  return Object.prototype.hasOwnProperty.call(MOVED, slug) ? MOVED[slug] : null;
}
