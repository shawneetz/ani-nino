// what this file does: renders one program page with evidence context, the
// link between past and present, and github contribution links
// changes in this version
//   the header is ProgramHeader (large title, status tag, copy link)
//   promise vs record and the still checking box are components
//   "what came after" is now the SinceTimeline (linked sources and labels)
// the rest of the page is rebuilt 
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ContributeLinks } from "@/components/ContributeLinks";
import { PageRail, type NavItem } from "@/components/PageNav";
import { ProgramHeader } from "@/components/ProgramHeader";
import { CheckingBox, RecordPanels } from "@/components/RecordPanels";
import { SinceTimeline } from "@/components/SinceTimeline";
import { SourceList } from "@/components/SourceList";
import { StatusTag } from "@/components/StatusTag";
import { VideoEmbed } from "@/components/VideoEmbed";
import { getProgram, getPrograms } from "@/lib/content";
import { yearRange } from "@/lib/filter";
import { programDescription } from "@/lib/program-description";
import { relatedPrograms } from "@/lib/related";
import { PROVINCE_LABELS, TOPICS } from "@/lib/vocab";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPrograms()).map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const program = await getProgram((await params).slug);
  // description is the first sentence of "happened", trimmed to 160 characters
  return program ? { title: program.title, description: programDescription(program.happened) } : {};
}

// shared section wrapper: gives each section an anchor id for the page nav
function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 space-y-3">
      <h2 id={`${id}-heading`} className="text-2xl font-semibold text-stone-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function ProgramPage({ params }: Props) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) notFound();

  const all = await getPrograms();
  // past/present links: the older program this one echoes, and today's echoes of this one
  const origin = program.echoOf ? all.find((item) => item.slug === program.echoOf) : null;
  const echoes = all.filter((item) => item.echoOf === program.slug);
  // up to 3 related programs, echo links are left out so nothing repeats
  const related = relatedPrograms(program, all);
  // the open question only shows while the program is still being checked
  const question = program.status === "checking" ? program.question : undefined;

  // build the nav from the sections that actually render
  const nav: NavItem[] = [{ id: "record", label: "Promise and record" }];
  if (question) nav.push({ id: "checking", label: "Still checking" });
  if (program.since.length > 0) nav.push({ id: "after", label: "What came after" });
  if (origin || echoes.length > 0) nav.push({ id: "echoes", label: "Past and present" });
  if (program.video) nav.push({ id: "video", label: "Video" });
  nav.push({ id: "where", label: "Where" });
  if (program.sources.length > 0) nav.push({ id: "sources", label: "Sources" });
  nav.push({ id: "contribute", label: "Help improve this page" });
  if (related.length > 0) nav.push({ id: "related", label: "Related programs" });

  return (
    // on desktop the content and the sticky rail sit side by side
    <main id="main" className="mx-auto max-w-6xl px-4 py-6 lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-10">
      <div className="max-w-3xl space-y-8">
        <Link href="/map" className="tap-target inline-flex items-center text-base underline underline-offset-2">
          Back to the map
        </Link>

        <ProgramHeader program={program} />

        {/* promise vs record, then who says so */}
        <RecordPanels promised={program.promised} happened={program.happened} sources={program.sources} />

        {/* stronger open-question box right after the record */}
        {question && <CheckingBox question={question} />}

        {/* what came after: year, text, linked source and voice label for each entry */}
        {program.since.length > 0 && (
          <Block id="after" title="What came after">
            <SinceTimeline items={program.since} />
          </Block>
        )}

        {/* the past/present links share one anchor so the nav can jump to them */}
        {(origin || echoes.length > 0) && (
          <div id="echoes" className="scroll-mt-24 space-y-8">
            {/* today program -> the martial-law program it echoes */}
            {origin && (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold">Echoes an older program</h2>
                <p>
                  This connects to{" "}
                  <Link href={`/programs/${origin.slug}`} className="underline underline-offset-2">{origin.title}</Link>.
                  The link is my interpretation, not an established finding.
                </p>
              </section>
            )}

            {/* martial-law program -> today programs that echo it */}
            {echoes.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold">Echoed today</h2>
                <ul className="list-disc space-y-1 pl-5">
                  {echoes.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/programs/${item.slug}`} className="underline underline-offset-2">{item.title}</Link>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-stone-600">These links are my interpretation, not established findings.</p>
              </section>
            )}
          </div>
        )}

        {program.video && (
          <Block id="video" title="Video">
            <VideoEmbed video={program.video} />
          </Block>
        )}

        {/* mini-map goes here later (u15), for now a plain place list */}
        <Block id="where" title="Where">
          <ul className="list-disc space-y-1 pl-6 text-lg">
            {program.places.map((place) => (
              <li key={`${place.name}-${place.province}`}>
                {place.name}, {PROVINCE_LABELS[place.province]}
                {place.approximate ? " (approximate)" : ""}
              </li>
            ))}
          </ul>
        </Block>

        {program.sources.length > 0 && (
          <Block id="sources" title="Sources">
            <SourceList sources={program.sources} />
          </Block>
        )}

        <div id="contribute" className="scroll-mt-24">
          <ContributeLinks slug={program.slug} />
        </div>

        {/* related programs replace the old previous and next links */}
        {related.length > 0 && (
          <Block id="related" title="Related programs">
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/programs/${item.slug}`}
                    className="block h-full rounded-xl border border-stone-300 bg-white p-4 hover:border-stone-500 focus-visible:outline focus-visible:outline-2"
                  >
                    <span className="block text-lg font-semibold text-stone-900">{item.title}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-stone-700">
                      <span>{yearRange(item)}</span>
                      <span style={{ color: TOPICS[item.topic].color }}>{TOPICS[item.topic].label}</span>
                      <StatusTag status={item.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Block>
        )}
      </div>

      {/* desktop only sticky rail */}
      <PageRail items={nav} />
    </main>
  );
}