// what this file does: builds the one-line citation shown in the "cite this page" block
// format: Anino ng Ani. "Title." Confirmed, checked 2026-11-05. https://site/programs/slug
//         Anino ng Ani. "Title." Still being checked. https://site/programs/slug
// it is a pure function, so it can be tested and run on the server
// the status is part of the line, so a page that is still being checked is never cited as settled
import { SITE } from "./site";
import type { ProgramStatus } from "./vocab";

/**
 * The program fields the citation reads.
 */
export interface CitationInput {
  /** Program slug, used for the page address. */
  slug: string;
  /** Program title, shown in quotes. */
  title: string;
  /** Confirmed or still checking. */
  status: ProgramStatus;
  /** ISO date the program was checked, shown only for confirmed programs. */
  checkedOn?: string;
}

/**
 * Builds the citation line for a program page.
 *
 * @remarks
 * The date stays ISO, the same as the "Checked on" line in the page header.
 * A closing full stop on the title is dropped so the quote never ends with two.
 */
export function citationText(program: CitationInput, siteUrl: string): string {
  const title = program.title.trim().replace(/[.!?]+$/, "");
  const status =
    program.status === "confirmed"
      ? program.checkedOn
        ? `Confirmed, checked ${program.checkedOn}.`
        : "Confirmed."
      : "Still being checked.";

  const base = siteUrl.replace(/\/+$/, "");
  return `${SITE.title}. "${title}." ${status} ${base}/programs/${program.slug}`;
}
