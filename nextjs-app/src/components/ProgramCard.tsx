// what this file does: one program in a list of programs
// shows title, years, topic, first sentence (2 lines), status tag on every card
// and voice chips, the title is the only link
// the "show on map" button only appears when the parent passes onShowOnMap,
// so the explorer keeps it and the programs index leaves it out
import Link from "next/link";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { yearRange } from "@/lib/filter";
import { TOPICS } from "@/lib/vocab";
import { StatusTag } from "./StatusTag";
import { VoiceChip } from "./VoiceChip";

/**
 * Props for the ProgramCard component.
 */
interface ProgramCardProps {
  /** The slim program to show, the same shape the explorer uses. */
  program: ExplorerProgram;
  /** Marks the card as the selected program (accent ring). Defaults to `false`. */
  selected?: boolean;
  /** Called with the slug when the reader taps "Show on map". The button is hidden when this is missing. */
  onShowOnMap?: (slug: string) => void;
}

/**
 * Renders one program as a card with its title link, facts, status and source labels.
 *
 * @remarks
 * This file has no `"use client"` and uses no hooks, so without `onShowOnMap`
 * it can render inside a Server Component (the programs index uses it this way
 * from a client list). A function prop can only be passed by a Client Component,
 * so the explorer, which passes `onShowOnMap`, renders it on the client.
 *
 * @example
 * ```tsx
 * <ProgramCard program={program} />
 * <ProgramCard program={program} selected onShowOnMap={(slug) => select(slug)} />
 * ```
 */
export function ProgramCard({ program, selected = false, onShowOnMap }: ProgramCardProps) {
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
      {onShowOnMap && (
        <button
          type="button"
          aria-pressed={selected}
          onClick={() => onShowOnMap(program.slug)}
          className="tap-target mt-3 rounded-lg border border-stone-400 px-4 text-base font-medium hover:border-stone-600"
        >
          Show on map
          <span className="sr-only"> for {program.title}</span>
        </button>
      )}
    </article>
  );
}