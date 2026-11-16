// what this file does: the /programs page — a searchable, filterable list of every program
// all state lives in ProgramsIndex (a client component); this page is a server component
// that loads the full program list and converts it to the slim explorer shape
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { ProgramsIndex } from "@/components/ProgramsIndex";
import { getPrograms } from "@/lib/content";
import { toExplorerProgram } from "@/lib/explorer-types";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Every martial-law farm program in CALABARZON, 1972 to 1986. Search, filter by topic or province, and compare what each promised with what the record shows.",
};

/**
 * Renders the programs index: a heading and the interactive list.
 *
 * @remarks
 * Server Component. The slim explorer shape is serialised to the client so the
 * full Program objects (which include raw yaml) never reach the browser.
 */
export default async function ProgramsPage() {
  const programs = (await getPrograms()).map(toExplorerProgram);

  return (
    <Container as="main" width="wide" className="space-y-6 py-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-stone-950">Programs</h1>
        <p className="mt-2 max-w-[68ch] leading-relaxed text-stone-700">
          Every martial-law farm program tracked on this site. Search by title or place, filter by
          topic or province, or switch on today&apos;s echoes to see which patterns repeat.
        </p>
      </header>

      <ProgramsIndex programs={programs} />
    </Container>
  );
}
