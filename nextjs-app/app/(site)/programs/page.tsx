// what this file does: the /programs page, a searchable, filterable reading list of every program
// all state lives in ProgramsIndex (a client component), this page is a server component
// that loads the full program list and converts it to the slim explorer shape
// change in this version (e6): editorial intro with a kicker, a serif title and a 2px ink rule
//   the intro mentions search, filters and the confirmed only switch
import type { Metadata } from "next";
import { BODY, Container, PAGE_HEADER, PAGE_STACK, PAGE_TITLE } from "@/components/Container";
import { Kicker } from "@/components/Kicker";
import { ProgramsIndex } from "@/components/ProgramsIndex";
import { getPrograms } from "@/lib/content";
import { toExplorerProgram } from "@/lib/explorer-types";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Every martial-law farm program in CALABARZON, 1972 to 1986. Search, filter by topic or province, and compare what each promised with what the record shows.",
};

/**
 * Renders the programs reading list: a heading and the interactive list.
 *
 * @remarks
 * Server Component. The slim explorer shape is serialised to the client so the
 * full Program objects (which include raw yaml) never reach the browser
 */
export default async function ProgramsPage() {
  const programs = (await getPrograms()).map(toExplorerProgram);

  return (
    <Container as="main" className={PAGE_STACK}>
      <header className={PAGE_HEADER}>
        <Kicker>Reading list</Kicker>
        <h1 className={PAGE_TITLE}>Programs</h1>
        <p className={BODY}>
          Every martial-law farm program tracked on this site. Search by title or place, filter by topic or province,
          or show only the programs checked against their sources.
        </p>
      </header>

      <ProgramsIndex programs={programs} />
    </Container>
  );
}