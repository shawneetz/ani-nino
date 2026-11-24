// what this file does: the slug rules that keep old urls honest, as a pure function
// scripts/check-content.ts runs it and fails the build on any problem
//   a moved target must be a live program
//   a held slug must have a file in content/holding
//   a live slug must not also be moved or held
import { HELD_TOPICS } from "./held-topics";
import { MOVED } from "./moved";

/**
 * Checks the moved map and the held list against what really exists.
 *
 * @param liveSlugs - Slugs of the programs in `content/programs/`.
 * @param holdingFiles - File name stems found in `content/holding/`.
 * @param moved - The moved map, injectable for tests.
 * @param held - The held list, injectable for tests.
 * @returns One message per problem, empty when everything is fine.
 */
export function slugProblems(
  liveSlugs: string[],
  holdingFiles: string[],
  moved: Readonly<Record<string, string>> = MOVED,
  held: readonly { slug: string }[] = HELD_TOPICS,
): string[] {
  const live = new Set(liveSlugs);
  const files = new Set(holdingFiles);
  const heldSlugs = new Set(held.map((topic) => topic.slug));
  const problems: string[] = [];

  for (const [from, to] of Object.entries(moved)) {
    if (!live.has(to)) problems.push(`moved: "${from}" points to "${to}", which is not a live program`);
    if (live.has(from)) problems.push(`moved: "${from}" is still a live program`);
    if (heldSlugs.has(from)) problems.push(`moved: "${from}" is also in the held list`);
  }

  for (const slug of heldSlugs) {
    if (!files.has(slug)) problems.push(`held: "${slug}" has no file in content/holding`);
    if (live.has(slug)) problems.push(`held: "${slug}" is also a live program`);
  }

  return problems;
}
