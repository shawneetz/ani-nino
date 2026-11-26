import type { RefObject } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { yearRange } from "@/lib/filter";
import { PROVINCE_LABELS, TOPICS } from "@/lib/vocab";
import { Button, ButtonLink } from "./Button";
import { StatusTag } from "./StatusTag";
import { VoiceChip } from "./VoiceChip";

const HEADING_ID = "place-details-heading";

export function PlaceDetails({ program, headingRef, onBack }: { program: ExplorerProgram; headingRef: RefObject<HTMLHeadingElement | null>; onBack: () => void }) {
  const topic = TOPICS[program.topic];
  return (
    <section aria-labelledby={HEADING_ID} className="space-y-3 px-4 py-4">
      <h2 ref={headingRef} id={HEADING_ID} tabIndex={-1} className="font-serif text-xl font-semibold leading-snug text-stone-950">{program.title}</h2>
      <div className="figures flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-base text-stone-700">
        <span>{yearRange(program)}</span>
        <span className="font-medium" style={{ color: topic.color }}>{topic.label}</span>
        <StatusTag status={program.status} />
      </div>
      <p className="font-serif text-lg leading-relaxed text-stone-800">{program.summary}</p>
      {program.voices.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {program.voices.map((voice) => <VoiceChip key={voice} voice={voice} />)}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="font-sans text-sm font-semibold uppercase tracking-kicker text-stone-700">Places</h3>
        <ul className="font-serif text-lg text-stone-800">
          {program.places.map((place) => (
            <li key={`${place.name}-${place.province}`}>{place.name}, {PROVINCE_LABELS[place.province]}{place.approximate ? " (approximate)" : ""}</li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <ButtonLink href={`/programs/${program.slug}`}>Open program</ButtonLink>
        <Button variant="secondary" onClick={onBack}>Back to results</Button>
      </div>
    </section>
  );
}
