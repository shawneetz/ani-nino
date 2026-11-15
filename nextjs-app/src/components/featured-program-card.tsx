// what this file does: one large "start here" card on the landing page
// it shows the topic, years, title, first sentence of "happened", the status tag
// and the voice chips. the whole card is one big tap target through a stretched
// link on the title, so the card is a single link for keyboard and screen readers
import Link from "next/link";
import type { Program } from "@/lib/content-schema";
import { yearRange } from "@/lib/filter";
import { firstSentence } from "@/lib/first-sentence";
import { uniqueVoices } from "@/lib/source-summary";
import { TOPICS } from "@/lib/vocab";
import { Card } from "./card";
import { StatusTag } from "./status-tag";
import { VoiceChip } from "./voice-chip";

export function FeaturedProgramCard({ program }: { program: Program }) {
  const topic = TOPICS[program.topic];
  const voices = uniqueVoices(program.sources);

  return (
    // "relative" keeps the stretched link inside this card
    <Card as="article" className="relative flex h-full flex-col gap-3 hover:border-stone-400">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-stone-700">
        <span className="font-medium" style={{ color: topic.color }}>{topic.label}</span>
        <span>{yearRange(program)}</span>
      </div>
      <h3 className="text-xl font-semibold leading-snug text-stone-900">
        {/* the ::after layer makes the whole card clickable */}
        <Link href={`/programs/${program.slug}`} className="underline-offset-4 after:absolute after:inset-0 hover:underline">
          {program.title}
        </Link>
      </h3>
      <p className="max-w-[68ch] leading-relaxed text-stone-800">{firstSentence(program.happened)}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <StatusTag status={program.status} />
        {voices.map((voice) => <VoiceChip key={voice} voice={voice} />)}
      </div>
    </Card>
  );
}
