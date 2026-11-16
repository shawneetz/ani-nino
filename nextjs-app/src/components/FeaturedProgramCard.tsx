// what this file does: one large "start here" card on the landing page
// it shows the topic, years, title, first sentence of "happened", the status tag
// and the voice chips. the whole card is a single link so both a keyboard and a
// screen reader user can reach the program in one interaction.
// change in this version: the card wrapper is now the <a> element directly,
// replacing the stretched pseudo-element trick that caused playwright to miss the target
import Link from "next/link";
import type { Program } from "@/lib/content-schema";
import { yearRange } from "@/lib/filter";
import { firstSentence } from "@/lib/first-sentence";
import { uniqueVoices } from "@/lib/source-summary";
import { TOPICS } from "@/lib/vocab";
import { StatusTag } from "./StatusTag";
import { VoiceChip } from "./VoiceChip";

export function FeaturedProgramCard({ program }: { program: Program }) {
  const topic = TOPICS[program.topic];
  const voices = uniqueVoices(program.sources);

  return (
    // the whole card is the link — one tap target, fully accessible
    <Link
      href={`/programs/${program.slug}`}
      className="flex h-full flex-col gap-3 rounded-card border border-stone-200 bg-white p-4 hover:border-stone-400 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-stone-700">
        <span className="font-medium" style={{ color: topic.color }}>{topic.label}</span>
        <span>{yearRange(program)}</span>
      </div>
      <h3 className="text-xl font-semibold leading-snug text-stone-900">{program.title}</h3>
      <p className="max-w-[68ch] leading-relaxed text-stone-800">{firstSentence(program.happened)}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <StatusTag status={program.status} />
        {voices.map((voice) => <VoiceChip key={voice} voice={voice} />)}
      </div>
    </Link>
  );
}
