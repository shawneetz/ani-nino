// what this file does: builds the meta description for a program page
// rule: first sentence of "happened", trimmed to 160 characters
// one helper so the page and the tests use the exact same rule
import { firstSentence } from "./first-sentence";
import { trimText } from "./trim-text";

// search engines show about 160 characters, so we stop there
export const DESCRIPTION_MAX = 160;

export function programDescription(happened: string): string {
  // take the whole first sentence, then let trimText do the one and only trim
  return trimText(firstSentence(happened, 1000), DESCRIPTION_MAX);
}
