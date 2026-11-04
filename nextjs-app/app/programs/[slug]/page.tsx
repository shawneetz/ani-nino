// What this file does: renders one program detail page and its source context.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusTag } from "@/components/status-tag";
import { VoiceChip } from "@/components/voice-chip";
import { getProgram, getPrograms } from "@/lib/content";
import { yearRange } from "@/lib/filter";
import { editUrl, issueUrl } from "@/lib/site";
import { PROVINCE_LABELS, TOPICS } from "@/lib/vocab";
type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() { return (await getPrograms()).map((program) => ({ slug: program.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const program = await getProgram((await params).slug); return program ? { title: program.title, description: program.happened } : {}; }
export default async function ProgramPage({ params }: Props) {
  const program = await getProgram((await params).slug); if (!program) notFound();
  const all = await getPrograms(); const index = all.findIndex((item) => item.slug === program.slug);
  const topic = TOPICS[program.topic];
  return <main id="main" className="mx-auto max-w-3xl space-y-8 px-4 py-6"><Link href="/" className="text-sm underline">Back to the map</Link><header className="space-y-2"><h1 className="text-2xl font-semibold">{program.title}</h1><div className="flex flex-wrap gap-3 text-sm text-stone-600"><span>{program.when} ({yearRange(program)})</span><span style={{ color: topic.color }}>{topic.label}</span><StatusTag status={program.status} /></div></header><section className="space-y-2"><h2 className="text-lg font-semibold">Who says so</h2><div className="flex flex-wrap gap-2">{[...new Set(program.sources.map((source) => source.voice))].map((voice) => <VoiceChip key={voice} voice={voice} />)}</div></section>{program.promised && <section className="space-y-2"><h2 className="text-lg font-semibold">What it promised</h2><p>{program.promised}</p></section>}<section className="space-y-2"><h2 className="text-lg font-semibold">What happened</h2><p>{program.happened}</p></section>{program.status === "checking" && program.question && <section className="rounded-lg border border-amber-400 bg-amber-50 p-4"><h2 className="font-semibold">Still checking</h2><p>{program.question}</p></section>}<section className="space-y-2"><h2 className="text-lg font-semibold">Where</h2><ul className="list-disc pl-5">{program.places.map((place) => <li key={`${place.name}-${place.province}`}>{place.name}, {PROVINCE_LABELS[place.province]}{place.approximate ? " (approximate)" : ""}</li>)}</ul></section><section className="flex gap-4 border-t pt-4 text-sm"><a href={editUrl(program.slug)} className="underline">Edit this on GitHub</a><a href={issueUrl(program.slug)} className="underline">Report a problem</a></section><nav aria-label="Other programs" className="flex justify-between text-sm">{index > 0 ? <Link href={`/programs/${all[index - 1].slug}`} className="underline">Previous</Link> : <span />}{index < all.length - 1 ? <Link href={`/programs/${all[index + 1].slug}`} className="underline">Next</Link> : <span />}</nav></main>;
}
