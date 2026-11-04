// What this file does: renders one program page with evidence context, the
// link between past and present, and GitHub contribution links.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContributeLinks } from "@/components/contribute-links";
import { SourceList } from "@/components/source-list";
import { StatusTag } from "@/components/status-tag";
import { VideoEmbed } from "@/components/video-embed";
import { VoiceChip } from "@/components/voice-chip";
import { getProgram, getPrograms } from "@/lib/content";
import { yearRange } from "@/lib/filter";
import { partisanNote, uniqueVoices } from "@/lib/source-summary";
import { PROVINCE_LABELS, TOPICS } from "@/lib/vocab";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPrograms()).map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const program = await getProgram((await params).slug);
  return program ? { title: program.title, description: program.happened } : {};
}

export default async function ProgramPage({ params }: Props) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) notFound();

  const all = await getPrograms();
  const index = all.findIndex((item) => item.slug === program.slug);
  const previous = index > 0 ? all[index - 1] : null;
  const next = index < all.length - 1 ? all[index + 1] : null;
  const topic = TOPICS[program.topic];
  const voices = uniqueVoices(program.sources);
  const balanceNote = partisanNote(program.sources);
  // Past/present links: the older program this one echoes, and today's echoes of this one.
  const origin = program.echoOf ? all.find((item) => item.slug === program.echoOf) : null;
  const echoes = all.filter((item) => item.echoOf === program.slug);

  return (
    <main id="main" className="mx-auto max-w-3xl space-y-8 px-4 py-6">
      <Link href="/" className="text-sm underline">Back to the map</Link>
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

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Who says so</h2>
        {voices.length > 0 ? (
          <div className="flex flex-wrap gap-2">{voices.map((voice) => <VoiceChip key={voice} voice={voice} />)}</div>
        ) : <p className="text-sm text-stone-600">No sources have been attached to this page yet.</p>}
        {balanceNote && <p className="text-sm text-amber-900">{balanceNote}</p>}
      </section>

      {program.promised && <section className="space-y-2"><h2 className="text-lg font-semibold">What it promised</h2><p>{program.promised}</p></section>}
      <section className="space-y-2"><h2 className="text-lg font-semibold">What happened</h2><p>{program.happened}</p></section>

      {program.status === "checking" && program.question && (
        <section className="rounded-lg border border-amber-400 bg-amber-50 p-4">
          <h2 className="font-semibold">Still checking</h2>
          <p>{program.question}</p>
        </section>
      )}

      {program.since.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">What came after</h2>
          <ul className="space-y-2">{program.since.map((item) => <li key={`${item.year}-${item.text}`}><strong>{item.year}:</strong> {item.text} <span className="text-sm text-stone-600">(Source: {item.source.title})</span></li>)}</ul>
        </section>
      )}

      {/* Today program -> the martial-law program it echoes. */}
      {origin && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Echoes an older program</h2>
          <p>This connects to <Link href={`/programs/${origin.slug}`} className="underline underline-offset-2">{origin.title}</Link>. The link is my interpretation, not an established finding.</p>
        </section>
      )}

      {/* Martial-law program -> today programs that echo it. */}
      {echoes.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Echoed today</h2>
          <ul className="list-disc space-y-1 pl-5">{echoes.map((item) => <li key={item.slug}><Link href={`/programs/${item.slug}`} className="underline underline-offset-2">{item.title}</Link></li>)}</ul>
          <p className="text-sm text-stone-600">These links are my interpretation, not established findings.</p>
        </section>
      )}

      {program.video && <section className="space-y-2"><h2 className="text-lg font-semibold">Video</h2><VideoEmbed video={program.video} /></section>}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Where</h2>
        <ul className="list-disc pl-5">{program.places.map((place) => <li key={`${place.name}-${place.province}`}>{place.name}, {PROVINCE_LABELS[place.province]}{place.approximate ? " (approximate)" : ""}</li>)}</ul>
      </section>
      {program.sources.length > 0 && <section className="space-y-2"><h2 className="text-lg font-semibold">Sources</h2><SourceList sources={program.sources} /></section>}
      <ContributeLinks slug={program.slug} />
      <nav aria-label="Other programs" className="flex justify-between text-sm">
        {previous ? <Link href={`/programs/${previous.slug}`} className="underline">Previous</Link> : <span />}
        {next ? <Link href={`/programs/${next.slug}`} className="underline">Next</Link> : <span />}
      </nav>
    </main>
  );
}
