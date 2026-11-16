// what this file does: returns the first sentence of a text, trimmed to a max length
// used for landing cards now, and for list cards and page metadata later (c3.11, c4.9)
// it skips full stops that belong to abbreviations such as "mt." or "g.r.",
// so "mt. makiling" is not cut in half. it never edits the yaml wording

// words that end with a full stop but do not end a sentence
const ABBREVIATIONS = new Set([
  "mt", "no", "nos", "st", "dr", "mr", "mrs", "ms", "jr", "sr",
  "inc", "co", "vs", "sec", "gen", "hon", "fr", "atty", "engr", "etc",
]);

export function firstSentence(text: string, maxLength = 160): string {
  // collapse line breaks and double spaces first
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean === "") return "";

  // a sentence ends at . ! or ? when a capital letter (or the end of the text) follows
  const pattern = /[.!?]+(?=\s+["“‘(]?[A-Z]|$)/g;
  let end = clean.length;
  for (const match of clean.matchAll(pattern)) {
    const index = match.index ?? 0;
    // the word just before the full stop decides if it is an abbreviation
    const word = clean.slice(0, index).match(/([A-Za-z]+)$/)?.[1] ?? "";
    const isAbbreviation = ABBREVIATIONS.has(word.toLowerCase()) || word.length === 1;
    if (!isAbbreviation) {
      end = index + match[0].length;
      break;
    }
  }

  const sentence = clean.slice(0, end);
  if (sentence.length <= maxLength) return sentence;

  // too long: cut at the last full word and add an ellipsis
  const cut = sentence.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[,;:\s]+$/, "")}…`;
}
