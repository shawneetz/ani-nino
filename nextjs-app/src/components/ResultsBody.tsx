"use client";

import Link from "next/link";
import { useId, type RefObject } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { PROVINCE_LABELS, type Province } from "@/lib/vocab";
import { PlaceDetails } from "./PlaceDetails";
import { ResultItem } from "./ResultItem";

export function MapSearch({ query, onQueryChange, hideLabel = false }: { query: string; onQueryChange: (query: string) => void; hideLabel?: boolean }) {
  const searchId = useId();
  return (
    <div>
      <label htmlFor={searchId} className={hideLabel ? "sr-only" : "font-sans text-base font-medium text-stone-700"}>Search</label>
      <input
        id={searchId}
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Title or place"
        className={`${hideLabel ? "" : "mt-1"} min-h-11 w-full rounded-sm border border-stone-500 bg-white px-3 font-sans text-base text-stone-900 placeholder:text-stone-700`}
      />
    </div>
  );
}

interface ResultsBodyProps {
  selectedProgram: ExplorerProgram | null;
  headingRef: RefObject<HTMLHeadingElement | null>;
  programs: ExplorerProgram[];
  explainProvinces: Province[];
  onSelect: (slug: string) => void;
  onBack: () => void;
  onClear: () => void;
}

export function ResultsBody({ selectedProgram, headingRef, programs, explainProvinces, onSelect, onBack, onClear }: ResultsBodyProps) {
  if (selectedProgram) return <PlaceDetails program={selectedProgram} headingRef={headingRef} onBack={onBack} />;
  return (
    <section aria-label="Programs">
      {programs.length > 0 ? (
        <ul className="divide-y divide-stone-300">
          {programs.map((program) => (
            <ResultItem key={program.slug} program={program} selected={false} onSelect={onSelect} />
          ))}
        </ul>
      ) : explainProvinces.length > 0 ? (
        <div className="m-3 space-y-2 rounded-card border border-dashed border-stone-400 p-4">
          <p className="font-serif text-lg font-semibold">No {explainProvinces.map((province) => PROVINCE_LABELS[province]).join(" or ")} program yet</p>
          <p className="font-serif leading-relaxed text-stone-800">No martial-law farm program in this province has been researched yet.</p>
          <Link href="/sources#gap-cavite-not-covered" className="tap-target inline-flex items-center font-sans text-base underline underline-offset-2">Here is why</Link>
        </div>
      ) : (
        <div className="m-3 space-y-2 rounded-card border border-dashed border-stone-400 p-4">
          <p className="font-serif text-lg font-semibold">No programs match</p>
          <button type="button" onClick={onClear} className="tap-target font-sans text-base underline underline-offset-2">Clear filters and search</button>
        </div>
      )}
    </section>
  );
}
