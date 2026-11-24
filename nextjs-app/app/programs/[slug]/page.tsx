// what this file does: renders one program page with evidence context, the
// link between past and present, and github contribution links
// changes in this version
//   u15: "where" is now a lazy-loaded mini-map with the places listed beside it
//   u16: a sticky jump select for phones (the desktop rail was already in place)
//   u17: related programs use the RelatedPrograms component
//   u18: the contribute panel owns its own anchor
// all component imports use PascalCase file names
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/Button";
import { Container } from "@/components/Container";
import { ContributeLinks } from "@/components/ContributeLinks";
import { JumpSelect, PageRail, type NavItem } from "@/components/PageNav";
import { ProgramHeader } from "@/components/ProgramHeader";
import { ProgramMiniMap } from "@/components/ProgramMiniMap";
import { CheckingBox, RecordPanels } from "@/components/RecordPanels";
import { RelatedPrograms } from "@/components/RelatedPrograms";
import { SinceTimeline } from "@/components/SinceTimeline";
import { SourceList } from "@/components/SourceList";
import { VideoEmbed } from "@/components/VideoEmbed";
import { getProgram, getPrograms } from "@/lib/content";
import { toExplorerProgram } from "@/lib/explorer-types";
import { heldTopic, type HeldTopic } from "@/lib/held-topics";
import { programDescription } from "@/lib/program-description";
import { relatedPrograms } from "@/lib/related";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPrograms()).map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgram(slug);
  // description is the first sentence of "happened", trimmed to 160 characters
  if (program) return { title: program.title, description: programDescription(program.happened) };
  // a held page is not meant to be found in search
  const held = heldTopic(slug);
  return held ? { title: held.title, robots: { index: false, follow: false } } : {};
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

// short page for a topic that was researched but is not published
// c3 changes the sources link to /sources#held-topics
function HeldTopicPage({ topic }: { topic: HeldTopic }) {
  return (
    <Container as="main" width="prose" className="space-y-6 py-12">
      <div className="space-y-3">
        <p className="text-base font-medium uppercase tracking-wide text-accent-strong">Held topic</p>
        <h1 className="text-3xl font-bold tracking-tight text-stone-950">{topic.title}</h1>
        <p className="max-w-[68ch] text-lg leading-relaxed text-stone-800">
          This topic is researched but not published yet.
        </p>
        <p className="max-w-[68ch] text-lg leading-relaxed text-stone-800">{topic.reason}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/sources">See what is not known yet</ButtonLink>
        <ButtonLink href="/map" variant="secondary">
          Explore the map
        </ButtonLink>
      </div>
    </Container>
  );
}

export default async function ProgramPage({ params }: Props) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) {
    // a held slug gets its own short page, anything else is a real 404
    const held = heldTopic(slug);
    if (held) return <HeldTopicPage topic={held} />;
    notFound();
  }

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

        {/* phones only: a jump menu that stays at the top while the reader scrolls */}
        <div className="sticky top-0 z-20 -mx-4 border-b border-stone-200 bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
          <JumpSelect items={nav} />
        </div>

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

        {/* mini-map with the places listed beside it, the map loads when it nears the screen */}
        <Block id="where" title="Where">
          <ProgramMiniMap program={toExplorerProgram(program)} />
        </Block>

        {program.sources.length > 0 && (
          <Block id="sources" title="Sources">
            <SourceList sources={program.sources} />
          </Block>
        )}

        {/* github only panel, it carries its own anchor */}
        <ContributeLinks slug={program.slug} />

        {/* related programs replace the old previous and next links */}
        {related.length > 0 && (
          <Block id="related" title="Related programs">
            <RelatedPrograms items={related} />
          </Block>
        )}
      </div>

      {/* desktop only sticky rail */}
      <PageRail items={nav} />
    </main>
  );
}