// what this file does: renders one program page with evidence context, the
// link between past and present, and github contribution links
// change in this version: "back to the map" now goes to /map (not the landing page)
// the rest of the page is rebuilt in c4
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ContributeLinks } from "@/components/contribute-links";
import { CopyLinkButton } from "@/components/copy-link-button";
import { JumpSelect, PageRail, type NavItem } from "@/components/page-nav";
import { SinceTimeline } from "@/components/since-timeline";
import { SourceList } from "@/components/source-list";
import { StatusTag } from "@/components/status-tag";
import { VideoEmbed } from "@/components/video-embed";
import { VoiceChip } from "@/components/voice-chip";
import { getProgram, getPrograms } from "@/lib/content";
import { yearRange } from "@/lib/filter";
import { firstSentence } from "@/lib/first-sentence";
import { relatedPrograms } from "@/lib/related";
import { partisanNote, uniqueVoices } from "@/lib/source-summary";
import { trimText } from "@/lib/trim-text";
import { PROVINCE_LABELS, TOPICS } from "@/lib/vocab";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPrograms()).map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const program = await getProgram((await params).slug);
  // description is the first sentence of "happened", trimmed to 160 characters
  return program ? { title: program.title, description: trimText(firstSentence(program.happened), 160) } : {};
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
  const topic = TOPICS[program.topic];
  const voices = uniqueVoices(program.sources);
  const balanceNote = partisanNote(program.sources);
  // past/present links: the older program this one echoes, and today's echoes of this one
  const origin = program.echoOf ? all.find((item) => item.slug === program.echoOf) : null;
  const echoes = all.filter((item) => item.echoOf === program.slug);
  const showChecking = program.status === "checking" && Boolean(program.question);

  // build the nav from the sections that actually render
  const nav: NavItem[] = [{ id: "record", label: "Promise and record" }];
  if (showChecking) nav.push({ id: "checking", label: "Still checking" });
  if (program.since.length > 0) nav.push({ id: "after", label: "What came after" });
  if (origin || echoes.length > 0) nav.push({ id: "echoes", label: "Past and present" });
  if (program.video) nav.push({ id: "video", label: "Video" });
  nav.push({ id: "where", label: "Where" });
  if (program.sources.length > 0) nav.push({ id: "sources", label: "Sources" });
  nav.push({ id: "contribute", label: "Help improve this page" });
  if (related.length > 0) nav.push({ id: "related", label: "Related programs" });

  return (
    <main id="main" className="mx-auto max-w-3xl space-y-8 px-4 py-6">
      <Link href="/map" className="tap-target inline-flex items-center text-sm underline">Back to the map</Link>
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{program.title}</h1>
        <div className="flex flex-wrap gap-3 text-sm text-stone-600">
          <span>{program.when} ({yearRange(program)})</span>
          <span style={{ color: topic.color }}>{topic.label}</span>
          {program.era === "today" && <span className="font-medium text-amber-800">Today</span>}
          <StatusTag status={program.status} />
          {program.checkedOn && <span>Checked on {program.checkedOn}</span>}
        </div>
      </header>

      {/* promise vs record, side by side from 768px and stacked on phones */}
      <section id="record" aria-label="Promise and record" className="scroll-mt-24 space-y-4">
        <div className={`grid gap-4 ${program.promised ? "md:grid-cols-2" : ""}`}>
          {program.promised && (
            <div className="rounded-xl border border-stone-300 bg-white p-5">
              <h2 className="text-xl font-semibold text-stone-900">What it promised</h2>
              <p className="mt-2 max-w-[68ch] text-lg leading-relaxed text-stone-800">{program.promised}</p>
            </div>
          )}
          <div className="rounded-xl border border-stone-300 bg-white p-5">
            <h2 className="text-xl font-semibold text-stone-900">What the record shows</h2>
            <p className="mt-2 max-w-[68ch] text-lg leading-relaxed text-stone-800">{program.happened}</p>
          </div>
        </div>

        {/* who says so strip, right under the two panels */}
        <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <h2 className="text-lg font-semibold text-stone-900">Who says so</h2>
          {voices.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {voices.map((voice) => (
                <VoiceChip key={voice} voice={voice} />
              ))}
            </div>
          ) : (
            <p className="text-base text-stone-700">No sources have been attached to this page yet.</p>
          )}
          {balanceNote && <p className="text-base text-amber-900">{balanceNote}</p>}
        </div>
      </section>

      {/* stronger open-question box right after the record */}
      {showChecking && (
        <section
          id="checking"
          aria-labelledby="checking-heading"
          className="scroll-mt-24 rounded-xl border-2 border-amber-500 bg-amber-50 p-5"
        >
          <h2 id="checking-heading" className="text-xl font-semibold text-amber-950">
            Still checking
          </h2>
          <p className="mt-2 max-w-[68ch] text-lg leading-relaxed text-amber-950">{program.question}</p>
        </section>
      )}

      {program.since.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">What came after</h2>
          <ul className="space-y-2">{program.since.map((item) => <li key={`${item.year}-${item.text}`}><strong>{item.year}:</strong> {item.text} <span className="text-sm text-stone-600">(Source: {item.source.title})</span></li>)}</ul>
        </section>
      )}

      {/* today program -> the martial-law program it echoes */}
      {origin && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Echoes an older program</h2>
          <p>This connects to <Link href={`/programs/${origin.slug}`} className="underline underline-offset-2">{origin.title}</Link>. The link is my interpretation, not an established finding.</p>
        </section>
      )}

      {/* martial-law program -> today programs that echo it */}
      {echoes.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Echoed today</h2>
          <ul className="list-disc space-y-1 pl-5">{echoes.map((item) => <li key={item.slug}><Link href={`/programs/${item.slug}`} className="underline underline-offset-2">{item.title}</Link></li>)}</ul>
          <p className="text-sm text-stone-600">These links are my interpretation, not established findings.</p>
        </section>
      )}

      {program.video && (
        <Block id="video" title="Video">
          <VideoEmbed video={program.video} />
        </Block>
      )}

      {/* mini-map goes here later, for now a plain place list */}
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

        {/* desktop only sticky rail */ }
  <PageRail items={nav} />
      </div >
    </main >
  );
}
