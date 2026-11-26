"use client";

import { useId, type RefObject } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { LAYER } from "@/lib/map-layers";
import type { Province } from "@/lib/vocab";
import { MapSearch, ResultsBody } from "./ResultsBody";

interface MapPanelProps {
  programs: ExplorerProgram[];
  selectedProgram: ExplorerProgram | null;
  headingRef: RefObject<HTMLHeadingElement | null>;
  query: string;
  onQueryChange: (query: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  explainProvinces: Province[];
  onSelect: (slug: string) => void;
  onBack: () => void;
  onClear: () => void;
}

export function MapPanel({ programs, selectedProgram, headingRef, query, onQueryChange, open, onOpenChange, explainProvinces, onSelect, onBack, onClear }: MapPanelProps) {
  const bodyId = useId();
  const countText = programs.length === 1 ? "program" : "programs";
  const shell = open ? "bottom-3 w-[clamp(20rem,30vw,26rem)] rounded-xl" : "w-auto rounded-full";

  return (
    <aside aria-label="Results" className={`absolute left-3 top-3 flex flex-col border border-stone-300 bg-white shadow-lg ${LAYER.panel} ${shell}`}>
      <div className={`flex items-center justify-between gap-3 px-4 py-2 ${open ? "border-b border-stone-200" : "gap-4 py-1 pr-2"}`}>
        <p role="status" data-testid="result-count" className="figures font-sans text-base text-stone-800"><strong>{programs.length}</strong> {countText}</p>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => onOpenChange(!open)}
          className={`tap-target inline-flex items-center justify-center rounded-full border border-stone-500 bg-white font-sans text-base font-medium text-stone-900 hover:border-ink ${open ? "px-2" : "px-4"}`}
        >
          {open ? (
            <>
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4 6 10l6 6" /></svg>
              <span className="sr-only">Hide list</span>
            </>
          ) : "Show list"}
        </button>
      </div>
      <div id={bodyId} className={`${open ? "flex" : "hidden"} min-h-0 flex-1 flex-col`}>
        {!selectedProgram && (
          <div className="border-b border-stone-200 px-4 py-2"><MapSearch query={query} onQueryChange={onQueryChange} /></div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ResultsBody selectedProgram={selectedProgram} headingRef={headingRef} programs={programs} explainProvinces={explainProvinces} onSelect={onSelect} onBack={onBack} onClear={onClear} />
        </div>
      </div>
    </aside>
  );
}
