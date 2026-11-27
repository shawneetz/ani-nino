"use client";

import Link from "next/link";
import { useId } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { PROVINCE_LABELS, type Province } from "@/lib/vocab";
import { ResultItem } from "./ResultItem";
import { EMPTY_ACTION, EMPTY_BODY, EmptyState } from "./States";

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
  programs: ExplorerProgram[];
  selectedSlug: string | null;
  explainProvinces: Province[];
  onSelect: (slug: string) => void;
  onClear: () => void;
}

export function ResultsBody({ programs, selectedSlug, explainProvinces, onSelect, onClear }: ResultsBodyProps) {
  return (
    <section aria-label="Programs">
      {programs.length > 0 ? (
        <ul className="divide-y divide-stone-300">
          {programs.map((program) => (
            <ResultItem key={program.slug} program={program} selected={program.slug === selectedSlug} onSelect={onSelect} />
          ))}
        </ul>
      ) : explainProvinces.length > 0 ? (
        <EmptyState className="m-3" title={`No ${explainProvinces.map((province) => PROVINCE_LABELS[province]).join(" or ")} program yet`}>
          <p className={EMPTY_BODY}>No martial-law farm program in this province has been researched yet.</p>
          <Link href="/sources#gap-cavite-not-covered" className={EMPTY_ACTION}>Here is why</Link>
        </EmptyState>
      ) : (
        <EmptyState className="m-3" title="No programs match">
          <button type="button" onClick={onClear} className={EMPTY_ACTION}>Clear filters and search</button>
        </EmptyState>
      )}
    </section>
  );
}
