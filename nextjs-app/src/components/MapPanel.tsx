"use client";

import type { RefObject } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { LAYER } from "@/lib/map-layers";
import type { Province } from "@/lib/vocab";
import { MapSearch, ResultsBody, type SpotBanner } from "./ResultsBody";

interface MapPanelProps {
  programs: ExplorerProgram[];
  selectedSlug: string | null;
  panelRef: RefObject<HTMLElement | null>;
  query: string;
  onQueryChange: (query: string) => void;
  onCollapse: () => void;
  explainProvinces: Province[];
  spot?: SpotBanner | null;
  onSelect: (slug: string) => void;
  onClear: () => void;
}

export function MapPanel({ programs, selectedSlug, panelRef, query, onQueryChange, onCollapse, explainProvinces, spot = null, onSelect, onClear }: MapPanelProps) {
  const countText = programs.length === 1 ? "program" : "programs";

  return (
    <aside
      ref={panelRef}
      tabIndex={-1}
      aria-label="Results"
      className={`absolute bottom-3 left-3 top-3 flex w-[clamp(20rem,30vw,26rem)] flex-col rounded-xl border border-stone-300 bg-white/90 shadow-lg backdrop-blur focus:outline-none ${LAYER.panel}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-2">
        <p role="status" data-testid="result-count" className="figures font-sans text-base text-stone-800"><strong>{programs.length}</strong> {countText}</p>
        <button
          type="button"
          aria-expanded={true}
          onClick={onCollapse}
          className="tap-target inline-flex items-center justify-center rounded-full border border-stone-500 bg-white px-2 font-sans text-base font-medium text-stone-900 hover:border-ink"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4 6 10l6 6" /></svg>
          <span className="sr-only">Hide list</span>
        </button>
      </div>
      <div className="border-b border-stone-200 px-4 py-2"><MapSearch query={query} onQueryChange={onQueryChange} /></div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ResultsBody programs={programs} selectedSlug={selectedSlug} explainProvinces={explainProvinces} spot={spot} onSelect={onSelect} onClear={onClear} />
      </div>
    </aside>
  );
}
