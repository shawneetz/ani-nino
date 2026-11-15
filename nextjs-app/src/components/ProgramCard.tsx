// what this file does: one program in the explorer list
// shows title, years, topic, first sentence , status tag on every card
// and voice chips, the title is the only link, "show on map" selects the program
import Link from "next/link";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { yearRange } from "@/lib/filter";
import { TOPICS } from "@/lib/vocab";
import { StatusTag } from "./StatusTag";
import { VoiceChip } from "./VoiceChip";

type Props = {
  program: ExplorerProgram;
  selected: boolean;
  onShowOnMap: (slug: string) => void;
};

export function ProgramCard({ program, selected, onShowOnMap }: Props) {
  const topic = TOPICS[program.topic];

  return (
    // the id lets the map scroll this card into view when its pin is picked
    <article
      id={`program-${program.slug}`}
      className={`scroll-mt-4 rounded-card border bg-white p-4 ${selected ? "border-accent ring-2 ring-accent" : "border-stone-200 hover:border-stone-400"
        }`}
    >
      <h3 className="text-lg font-semibold leading-snug text-stone-900">
        <Link href={`/programs/${program.slug}`} className="underline-offset-4 hover:underline">
          {program.title}
        </Link>
      </h3>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-base text-stone-700">
        <span>{yearRange(program)}</span>
        <span className="font-medium" style={{ color: topic.color }}>{topic.label}</span>
        {/* marks echo programs so they are not mistaken for martial-law ones */}
        {program.era === "today" && <span className="font-medium text-amber-800">Today</span>}
      </div>
      <p className="mt-2 line-clamp-2 leading-relaxed text-stone-800">{program.summary}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusTag status={program.status} />
        {program.voices.map((voice) => <VoiceChip key={voice} voice={voice} />)}
      </div>
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onShowOnMap(program.slug)}
        className="tap-target mt-3 rounded-lg border border-stone-400 px-4 text-base font-medium hover:border-stone-600"
      >
        Show on map
        <span className="sr-only"> for {program.title}</span>
      </button>
    </article>
  );
}
