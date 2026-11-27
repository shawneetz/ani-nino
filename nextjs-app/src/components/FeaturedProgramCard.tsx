// what this file does: one "start here" article on the landing page
// it shows the topic and years, a serif title, the first sentence of "happened",
// the status tag and the voice chips
// the whole article is a single link, so a keyboard or screen reader user reaches
// the program in one interaction
// change in this version (e4): article layout with a top rule, no box
import Link from "next/link";
import type { Program } from "@/lib/content-schema";
import { yearRange } from "@/lib/filter";
import { firstSentence } from "@/lib/first-sentence";
import { uniqueVoices } from "@/lib/source-summary";
import { TOPICS } from "@/lib/vocab";
import { ProgramImage } from "./ProgramImage";
import { StatusTag } from "./StatusTag";
import { VoiceChip } from "./VoiceChip";

export function FeaturedProgramCard({ program }: { program: Program }) {
  const topic = TOPICS[program.topic];
  const voices = uniqueVoices(program.sources);

  return (
    // "group" lets the title underline when anywhere on the article is hovered
    <Link href={`/programs/${program.slug}`} className="group flex h-full flex-col gap-3">
      <ProgramImage slug={program.slug} topic={program.topic} size="card" />
      <p className="figures font-sans text-sm font-semibold uppercase tracking-kicker text-stone-700">
        {/* the topic color depends on the data, so it stays inline */}
        <span style={{ color: topic.color }}>{topic.label}</span> · {yearRange(program)}
      </p>
      <h3 className="font-serif text-xl font-semibold leading-snug text-stone-950 group-hover:underline">
        {program.title}
      </h3>
      <p className="max-w-[68ch] font-serif leading-relaxed text-stone-800">{firstSentence(program.happened)}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <StatusTag status={program.status} />
        {voices.map((voice) => (
          <VoiceChip key={voice} voice={voice} />
        ))}
      </div>
    </Link>
  );
}