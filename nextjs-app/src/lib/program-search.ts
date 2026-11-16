// what this file does: pure helpers for the programs index, so they can be tested
// accents and case are ignored, so "binan" finds "Biñan"

/**
 * The fields {@link matchesQuery} reads from a program.
 */
export interface Searchable {
    /** Program title, searched together with the place names. */
    title: string;
    /** Places of the program. Only their names are searched. */
    places: { name: string }[];
}

/**
 * The fields {@link sortPrograms} reads from a program.
 */
export interface Sortable {
    /** Program title, used for the "title" sort and as the tie breaker. */
    title: string;
    /** First year of the program, used for the "year" sort. */
    startYear: number;
}

/**
 * How the programs index orders its list.
 */
export type SortKey = "year" | "title";

/**
 * Strips accents and lowercases text, so both sides of a comparison look the same.
 *
 * @param text - Any text.
 * @returns The text without accents, in lowercase.
 */
function normalize(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * Checks whether a program matches the text typed in the search box.
 *
 * @remarks
 * Every typed word must appear in the title or in a place name, in any order,
 * so a longer search narrows the list. Accents and letter case are ignored.
 *
 * @param program - The program to test.
 * @param query - The raw text from the search box.
 * @returns `true` when every word is found, or when the query is empty.
 *
 * @example
 * ```ts
 * matchesQuery({ title: "Land", places: [{ name: "Biñan" }] }, "binan land"); // true
 * ```
 */
export function matchesQuery(program: Searchable, query: string): boolean {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    // an empty search matches everything
    if (words.length === 0) return true;

    const haystack = normalize([program.title, ...program.places.map((place) => place.name)].join(" "));
    // every word must appear somewhere, so "land laguna" narrows the list
    return words.every((word) => haystack.includes(word));
}

/**
 * Sorts programs by start year or by title.
 *
 * @remarks
 * Returns a new array and never changes the one passed in. Programs that
 * start in the same year are ordered by title, so the order is stable.
 *
 * @typeParam T - Any program shape that has a title and a start year.
 * @param programs - The programs to sort.
 * @param key - `"year"` for oldest first, `"title"` for A to Z.
 * @returns A sorted copy of the list.
 */
export function sortPrograms<T extends Sortable>(programs: T[], key: SortKey): T[] {
    // copy first, the original list must not change
    const copy = [...programs];
    if (key === "title") return copy.sort((a, b) => a.title.localeCompare(b.title));
    return copy.sort((a, b) => a.startYear - b.startYear || a.title.localeCompare(b.title));
}