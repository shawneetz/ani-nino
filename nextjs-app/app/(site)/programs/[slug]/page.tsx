// what this file does: renders one program page with evidence context, the
// link between past and present, and github contribution links
// changes in this version
//   u15: "where" is now a lazy-loaded mini-map with the places listed beside it
//   u16: a sticky jump select for phones (the desktop rail was already in place)
//   u17: related programs use the RelatedPrograms component
//   u18: the contribute panel owns its own anchor
//   c5: new "cite this page" section after sources, and a canonical url in the metadata
//   c8: the two echo blocks no longer use first person, they say "This project reads ..."
//   c10: print styles, in print the back link, jump bar, video, related programs and
//        contribute panel are hidden, and the page is one column so a long page prints in about 3 pages
//   e5: editorial layout
//       section headings are serif with a 2px ink top rule (no numbering)
//       the header has a kicker and a dateline, the record has a large lead sentence
//       the held topic page uses the same kicker and serif type
// the echo blocks stay hidden when no program uses them
// all component imports use PascalCase file names
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/Button";
import { CiteBlock } from "@/components/CiteBlock";
import { Container } from "@/components/Container";
import { ContributeLinks } from "@/components/ContributeLinks";
import { Kicker } from "@/components/Kicker";
import { JumpSelect, PageRail, type NavItem } from "@/components/PageNav";
import { ProgramHeader } from "@/components/ProgramHeader";
import { ProgramMiniMap } from "@/components/ProgramMiniMap";
import { CheckingBox, RecordPanels } from "@/components/RecordPanels";
import { RelatedPrograms } from "@/components/RelatedPrograms";
import { SinceTimeline } from "@/components/SinceTimeline";
import { SourceList } from "@/components/SourceList";
import { VideoEmbed } from "@/components/VideoEmbed";
import { citationText } from "@/lib/citation";
import { getProgram, getPrograms } from "@/lib/content";
import { toExplorerProgram } from "@/lib/explorer-types";
import { heldTopic, type HeldTopic } from "@/lib/held-topics";
import { programDescription } from "@/lib/program-description";
import { relatedPrograms } from "@/lib/related";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPrograms()).map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgram(slug);
  // description is the first sentence of "happened", trimmed to 160 characters
  if (program) {
    return {
      title: program.title,
      description: programDescription(program.happened),
      alternates: { canonical: `/programs/${program.slug}` },
    };
  }
  // a held page is not meant to be found in search
  const held = heldTopic(slug);
  return held ? { title: held.title, robots: { index: false, follow: false } } : {};
}

// shared section wrapper: gives each section an anchor id for the page nav
// a 2px ink rule opens the section and the heading is serif
// className is for extra classes, for example print:hidden on a section that paper does not need
function Block({
  id,
  title,
  className = "",
  children,
}: {
  id: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`scroll-mt-24 space-y-3 border-t-2 border-ink pt-4 ${className}`}
    >
      <h2 id={`${id}-heading`} className="font-serif text-2xl font-semibold text-stone-950">
        {title}
      </h2>
      {children}
    </section>
  );
}

// short page for a topic that was researched but is not published
// the sources link goes to the held topics section
function HeldTopicPage({ topic }: { topic: HeldTopic }) {
  return (
    <Container as="main" className="space-y-6 py-12">
      <div className="space-y-3 border-t-2 border-ink pt-4">
        <Kicker>Held topic</Kicker>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-950">{topic.title}</h1>
        <p className="max-w-[68ch] font-serif text-lg leading-relaxed text-stone-800">
          This topic is researched but not published yet.
        </p>
        <p className="max-w-[68ch] font-serif text-lg leading-relaxed text-stone-800">{topic.reason}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/sources#held-topics">See what is not known yet</ButtonLink>
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
  const citation = citationText(program, SITE_URL);

  // build the nav from the sections that actually render
  const nav: NavItem[] = [{ id: "record", label: "Promise and record" }];
  if (question) nav.push({ id: "checking", label: "Still checking" });
  if (program.since.length > 0) nav.push({ id: "after", label: "What came after" });
  if (origin || echoes.length > 0) nav.push({ id: "echoes", label: "Past and present" });
  if (program.video) nav.push({ id: "video", label: "Video" });
  nav.push({ id: "where", label: "Where" });
  if (program.sources.length > 0) nav.push({ id: "sources", label: "Sources" });
  nav.push({ id: "cite", label: "Cite this page" });
  nav.push({ id: "contribute", label: "Help improve this page" });
  if (related.length > 0) nav.push({ id: "related", label: "Related programs" });

  return (
    // on desktop the content and the sticky rail sit side by side
    <Container as="main" className="py-6 lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-10 print:block!">
      <div className="min-w-0 space-y-8">
        <Link
          href="/map"
          className="tap-target inline-flex items-center font-sans text-base underline underline-offset-2 print:hidden"
        >
          Back to the map
        </Link>

        <ProgramHeader program={program} />

        {/* phones only: a jump menu that stays at the top while the reader scrolls */}
        <div className="sticky top-0 z-20 -mx-4 border-b border-stone-400 bg-background/95 px-4 py-2 backdrop-blur lg:hidden print:hidden">
          <JumpSelect items={nav} />
        </div>

        {/* promise vs record, then who says so */}
        <RecordPanels promised={program.promised} happened={program.happened} sources={program.sources} />

        {/* flat open-question note right after the record */}
        {question && <CheckingBox question={question} />}

        {/* what came after: year, text, linked source, publisher, access date and voice label for each entry */}
        {program.since.length > 0 && (
          <Block id="after" title="What came after">
            <SinceTimeline items={program.since} />
          </Block>
        )}

        {/* the past/present links share one anchor so the nav can jump to them */}
        {(origin || echoes.length > 0) && (
          <div id="echoes" className="scroll-mt-24 space-y-8 border-t-2 border-ink pt-4">
            {/* today program -> the martial-law program it echoes */}
            {origin && (
              <section className="space-y-2">
                <h2 className="font-serif text-xl font-semibold text-stone-950">Echoes an older program</h2>
                <p className="font-serif text-lg leading-relaxed text-stone-800">
                  This connects to{" "}
                  <Link href={`/programs/${origin.slug}`} className="underline underline-offset-2">
                    {origin.title}
                  </Link>
                  . This project reads the link as interpretation, not an established finding.
                </p>
              </section>
            )}

            {/* martial-law program -> today programs that echo it */}
            {echoes.length > 0 && (
              <section className="space-y-2">
                <h2 className="font-serif text-xl font-semibold text-stone-950">Echoed today</h2>
                <ul className="list-disc space-y-1 pl-5 font-serif text-lg text-stone-800">
                  {echoes.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/programs/${item.slug}`} className="underline underline-offset-2">
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="font-sans text-sm text-stone-700">
                  This project reads these links as interpretation, not established findings.
                </p>
              </section>
            )}
          </div>
        )}

        {program.video && (
          <Block id="video" title="Video" className="print:hidden">
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

        <Block id="cite" title="Cite this page">
          <CiteBlock text={citation} />
        </Block>

        {/* github only panel, it carries its own anchor */}
        <ContributeLinks slug={program.slug} />

        {/* related programs replace the old previous and next links */}
        {related.length > 0 && (
          <Block id="related" title="Related programs" className="print:hidden">
            <RelatedPrograms items={related} />
          </Block>
        )}
      </div>

      {/* desktop only sticky rail */}
      <PageRail items={nav} />
    </Container>
  );
}