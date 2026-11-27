"use client";

import type { RefObject } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { yearRange } from "@/lib/filter";
import { LAYER } from "@/lib/map-layers";
import { PROVINCE_LABELS, TOPICS } from "@/lib/vocab";
import { Button, ButtonLink } from "./Button";
import { Kicker } from "./Kicker";
import { StatusTag } from "./StatusTag";
import { VoiceChip } from "./VoiceChip";

const HEADING_ID = "place-drawer-heading";

interface PlaceDrawerProps {
  program: ExplorerProgram;
  position: number;
  total: number;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function PlaceDrawer({ program, position, total, headingRef, onClose, onPrev, onNext }: PlaceDrawerProps) {
  const topic = TOPICS[program.topic];

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-stone-950/50 transition-opacity duration-150 starting:opacity-0 motion-reduce:transition-none ${LAYER.scrim}`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={HEADING_ID}
        className={`absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl border-t border-ink bg-paper shadow-lg transition-transform duration-200 ease-out starting:translate-y-full motion-reduce:transition-none lg:inset-x-auto lg:bottom-0 lg:right-0 lg:top-0 lg:max-h-none lg:w-[clamp(22rem,30vw,28rem)] lg:rounded-l-xl lg:rounded-tr-none lg:border-l lg:border-t-0 lg:starting:translate-x-full lg:starting:translate-y-0 ${LAYER.drawer}`}
      >
        <div className="flex items-start justify-between gap-3 px-4 pt-3">
          <Kicker className="pt-3">
            <span style={{ color: topic.color }}>{topic.label}</span> · {yearRange(program)}
          </Kicker>
          <button
            type="button"
            onClick={onClose}
            className="tap-target inline-flex shrink-0 items-center justify-center rounded-full border border-stone-500 bg-transparent text-stone-900 hover:border-ink"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
            <span className="sr-only">Close details</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          <h2 ref={headingRef} id={HEADING_ID} tabIndex={-1} className="font-serif text-2xl font-semibold leading-snug text-stone-950">
            {program.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
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
                <li key={`${place.name}-${place.province}`}>
                  {place.name}, {PROVINCE_LABELS[place.province]}
                  {place.approximate ? " (approximate)" : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-3 border-t border-stone-400 px-4 py-3">
          {total > 1 && (
            <div className="flex items-center justify-between gap-2">
              <Button variant="secondary" onClick={onPrev}>Previous</Button>
              <p role="status" className="figures font-sans text-base text-stone-800">
                {position} of {total}
                <span className="sr-only">: {program.title}</span>
              </p>
              <Button variant="secondary" onClick={onNext}>Next</Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={`/programs/${program.slug}`}>Open program</ButtonLink>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </>
  );
}
