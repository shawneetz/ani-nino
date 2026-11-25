// what this file does: returns the first sentence of a text, trimmed to a max length
// used for landing cards, list cards and page metadata
// it skips full stops that belong to abbreviations such as "mt." or "g.r.",
// so "mt. makiling" is not cut in half, it never edits the yaml wording
// change in this version (e5): the end-of-sentence search is now exported as sentenceEnd,
// so splitFirstSentence (the program page lead) uses the exact same abbreviation rules

// words that end with a full stop but do not end a sentence
const ABBREVIATIONS = new Set([
  "mt", "no", "nos", "st", "dr", "mr", "mrs", "ms", "jr", "sr",
  "inc", "co", "vs", "sec", "gen", "hon", "fr", "atty", "engr", "etc",
]);

/**
 * Finds where the first sentence of a text ends.
 *
 * @remarks
 * The text must already have its whitespace collapsed.
 * A sentence ends at . ! or ? when a capital letter (or the end of the text) follows
 *
 * @param clean - Text with single spaces only
 * @returns The index just after the first sentence, or the text length when there is one sentence
 */
export function sentenceEnd(clean: string): number {
  const pattern = /[.!?]+(?=\s+["“‘(]?[A-Z]|$)/g;
  for (const match of clean.matchAll(pattern)) {
    const index = match.index ?? 0;
    // the word just before the full stop decides if it is an abbreviation
    const word = clean.slice(0, index).match(/([A-Za-z]+)$/)?.[1] ?? "";
    const isAbbreviation = ABBREVIATIONS.has(word.toLowerCase()) || word.length === 1;
    if (!isAbbreviation) return index + match[0].length;
  }
  return clean.length;
}

export function firstSentence(text: string, maxLength = 160): string {
  // collapse line breaks and double spaces first
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean === "") return "";

  const sentence = clean.slice(0, sentenceEnd(clean));
  if (sentence.length <= maxLength) return sentence;

  // too long: cut at the last full word and add an ellipsis
  const cut = sentence.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[,;:\s]+$/, "")}…`;
}