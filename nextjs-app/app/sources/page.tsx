// what this file does: the /sources page
// it loads programs, gaps and sources on the server, shapes them into plain data
// and hands them to the client SourcesBrowser, which owns search, the label filter
// and the sticky in-page nav
// content is read at build time, so the page is static
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SourcesBrowser, type GapItem, type OpenQuestionItem } from "@/components/SourcesBrowser";
import { getGaps, getPrograms, getSources } from "@/lib/content";

export const metadata: Metadata = {
  title: "Sources",
  description: "Source labels, open questions, research gaps and every source used on the site.",
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
    <Container as="main" width="prose" className="space-y-4 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-stone-950">Sources</h1>
        <p className="max-w-[68ch] text-lg leading-relaxed text-stone-800">
          This page lists source labels, unchecked material, research gaps and every source used on the site.
        </p>
      </div>
      <SourcesBrowser openQuestions={openQuestions} gaps={gapItems} sources={sources} />
    </Container>
  );
}