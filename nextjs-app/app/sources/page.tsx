// What this file does: explains source labels and lists open questions, gaps
// and every source used on the site.
import type { Metadata } from "next";
import Link from "next/link";
import { SourceList } from "@/components/source-list";
import { getGaps, getPrograms, getSources } from "@/lib/content";
import { GAP_KINDS, VOICES, VOICE_KEYS } from "@/lib/vocab";

export const metadata: Metadata = { title: "Sources" };

export default async function SourcesPage() {
  const [programs, gaps, sources] = await Promise.all([getPrograms(), getGaps(), getSources()]);
  const openQuestions = programs.filter((program) => program.status === "checking" && program.question);
  const titleBySlug = new Map(programs.map((program) => [program.slug, program.title]));

  return (
    <main id="main" className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Sources</h1>
        <p className="mt-1 max-w-3xl text-sm text-stone-700">This page lists source labels, unchecked material, research gaps and every source used on the site.</p>
      </div>
      <section aria-labelledby="labels-heading">
        <h2 id="labels-heading" className="text-lg font-semibold">Source labels</h2>
        <p className="mt-1 text-sm text-stone-700">A label describes who is speaking; it is not a verdict about whether the source is right or wrong.</p>
        <dl className="mt-2 space-y-2 text-sm">{VOICE_KEYS.map((voice) => <div key={voice}><dt className="font-medium">{VOICES[voice].label}</dt><dd className="text-stone-700">{VOICES[voice].blurb}</dd></div>)}</dl>
      </section>
      <section aria-labelledby="questions-heading">
        <h2 id="questions-heading" className="text-lg font-semibold">Open questions</h2>
        {openQuestions.length === 0 ? <p className="mt-2 text-sm text-stone-700">No open questions.</p> : <ul className="mt-2 space-y-3">{openQuestions.map((program) => <li key={program.slug} className="text-sm"><Link href={`/programs/${program.slug}`} className="font-medium underline underline-offset-2">{program.title}</Link><p className="text-stone-700">{program.question}</p></li>)}</ul>}
      </section>
      <section aria-labelledby="gaps-heading">
        <h2 id="gaps-heading" className="text-lg font-semibold">Research gaps</h2>
        {gaps.length === 0 ? <p className="mt-2 text-sm text-stone-700">No gaps have been added.</p> : <ul className="mt-2 space-y-3">{gaps.map((gap) => <li key={gap.id} className="text-sm"><span className="font-medium">{gap.title}</span> <span className="text-stone-600">({GAP_KINDS[gap.kind]})</span><p className="text-stone-700">{gap.description}</p>{gap.program && <Link href={`/programs/${gap.program}`} className="text-xs underline underline-offset-2">Related program: {titleBySlug.get(gap.program)}</Link>}</li>)}</ul>}
      </section>
      <section aria-labelledby="all-sources-heading">
        <h2 id="all-sources-heading" className="text-lg font-semibold">All sources</h2>
        {sources.length === 0 && <p className="mt-2 text-sm text-stone-700">No sources have been added yet.</p>}
        {VOICE_KEYS.map((voice) => { const group = sources.filter((source) => source.voice === voice); return group.length ? <div key={voice} className="mt-4"><h3 className="mb-2 text-sm font-semibold text-stone-900">{VOICES[voice].label}</h3><SourceList sources={group} /></div> : null; })}
      </section>
    </main>
  );
}
