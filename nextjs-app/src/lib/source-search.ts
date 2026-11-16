// what this file does: pure search helper for the sources page, so it can be tested
// accents and case are ignored, so "binan" finds "Biñan"

// strips accents and lowercases text, so both sides of a comparison look the same
function normalize(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * Checks whether a list of text fields matches the text typed in the search box.
 *
 * @remarks
 * Every typed word must appear in at least one field, in any order, so a
 * longer search narrows the list. Missing fields are skipped.
 *
 * @param fields - The searchable text of one item (title, notes, publisher and so on).
 * @param query - The raw text from the search box.
 * @returns `true` when every word is found, or when the query is empty.
 *
 * @example
 * ```ts
 * matchesSearch(["Removing roadblocks", "The Republic"], "republic roadblocks"); // true
 * ```
 */
export function matchesSearch(fields: (string | undefined)[], query: string): boolean {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    // an empty search matches everything
    if (words.length === 0) return true;

    const haystack = normalize(fields.filter(Boolean).join(" "));
    // every word must appear somewhere, so "levy quezon" narrows the list
    return words.every((word) => haystack.includes(word));
}