// what this file does: splits a text into its first sentence and the rest
// the program page sets the first sentence of "what the record shows" as a large lead
// and the rest as normal text, so the lead is never repeated elsewhere on the page
// it reuses sentenceEnd from first-sentence.ts, so abbreviations such as "mt." are handled the same way
// it never trims or edits the wording, it only finds where to cut
import { sentenceEnd } from "./first-sentence";

/**
 * The two parts of a split text.
 */
export interface SplitSentence {
  /** The first sentence, with its closing mark */
  first: string;
  /** Everything after the first sentence, empty when the text has one sentence */
  rest: string;
}

/**
 * Splits a text after its first sentence.
 *
 * @param text - Any text, line breaks and double spaces are collapsed
 * @returns The first sentence and the rest, both empty for empty text
 *
 * @example
 * ```ts
 * splitFirstSentence("One. Two."); // { first: "One.", rest: "Two." }
 * ```
 */
export function splitFirstSentence(text: string): SplitSentence {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean === "") return { first: "", rest: "" };

  const end = sentenceEnd(clean);
  return { first: clean.slice(0, end).trim(), rest: clean.slice(end).trim() };
}