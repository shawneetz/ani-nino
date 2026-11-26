// what this file does: the /sources page
// it loads programs, gaps and sources on the server, shapes them into plain data
// and hands them to the client SourcesBrowser, which owns search, the label filter
// and the sticky in-page nav
// content is read at build time, so the page is static
// change in this version (c3): also passes the held topics and the github folder link
// change in this version (c6): the intro links to the glossary on the About page
// change in this version (e7): editorial header with a kicker, a serif title and a 2px ink rule
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Kicker } from "@/components/Kicker";
import { SourcesBrowser, type GapItem, type OpenQuestionItem } from "@/components/SourcesBrowser";
import { getGaps, getPrograms, getSources } from "@/lib/content";
import { HELD_TOPICS } from "@/lib/held-topics";
import { HOLDING_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sources",
  description: "Source labels, what is not known yet, held topics and every source used on the site.",
};

/**
 * Renders the sources page: a heading and the interactive browser.
 *
 * @remarks
 * Server Component. Only data that the browser needs is passed down, and it is
 * all plain text, so it crosses the server and client boundary safely.
 */
export default async function SourcesPage() {
  const [programs, gaps, sources] = await Promise.all([getPrograms(), getGaps(), getSources()]);

  // only programs that are still being checked have an open question
  const openQuestions: OpenQuestionItem[] = programs.flatMap((program) =>
    program.status === "checking" && program.question
      ? [{ slug: program.slug, title: program.title, question: program.question }]
      : [],
  );

  // look up each gap's related program here, so the browser needs no program list
  const titleBySlug = new Map(programs.map((program) => [program.slug, program.title]));
  const gapItems: GapItem[] = gaps.map((gap) => ({
    id: gap.id,
    kind: gap.kind,
    title: gap.title,
    description: gap.description,
    programSlug: gap.program,
    programTitle: gap.program ? titleBySlug.get(gap.program) : undefined,
  }));

  return (
    <Container as="main" width="prose" className="space-y-6 py-8">
      <header className="space-y-3 border-t-2 border-ink pt-4">
        <Kicker>Evidence</Kicker>
        <h1 className="font-serif text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-tight tracking-tight text-stone-950">
          Sources
        </h1>
        <p className="max-w-[68ch] font-serif text-lg leading-relaxed text-stone-800">
          This page lists source labels, what is not known yet, topics held back and every source used on the site.
          Short forms such as PD and DAR are explained in the{" "}
          <Link href="/about#glossary" className="underline underline-offset-2">
            glossary
          </Link>
          .
        </p>
      </header>
      <SourcesBrowser
        openQuestions={openQuestions}
        gaps={gapItems}
        heldTopics={HELD_TOPICS}
        holdingUrl={HOLDING_URL}
        sources={sources}
      />
    </Container>
  );
}