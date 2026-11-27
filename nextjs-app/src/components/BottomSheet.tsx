"use client";

import { useId, useRef } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import type { SheetSize } from "@/lib/fit-padding";
import { LAYER } from "@/lib/map-layers";
import type { Province } from "@/lib/vocab";
import { MapSearch, ResultsBody, type SpotBanner } from "./ResultsBody";

interface BottomSheetProps {
  size: SheetSize;
  onSizeChange: (size: SheetSize) => void;
  programs: ExplorerProgram[];
  selectedSlug: string | null;
  query: string;
  onQueryChange: (query: string) => void;
  explainProvinces: Province[];
  spot?: SpotBanner | null;
  onSelect: (slug: string) => void;
  onClear: () => void;
}

const ORDER: SheetSize[] = ["peek", "half", "full"];
const SHAPE: Record<SheetSize, string> = { peek: "", half: "h-1/2", full: "top-16" };
const SIZE_WORDS: Record<SheetSize, string> = { peek: "collapsed", half: "half open", full: "fully open" };
const DRAG_MIN = 32;

function cycle(size: SheetSize): SheetSize {
  return ORDER[(ORDER.indexOf(size) + 1) % ORDER.length];
}

function step(size: SheetSize, direction: 1 | -1): SheetSize {
  const next = ORDER.indexOf(size) + direction;
  return ORDER[Math.min(ORDER.length - 1, Math.max(0, next))];
}

export function BottomSheet({ size, onSizeChange, programs, selectedSlug, query, onQueryChange, explainProvinces, spot = null, onSelect, onClear }: BottomSheetProps) {
  const bodyId = useId();
  const startY = useRef<number | null>(null);
  const dragged = useRef(false);
  const countText = programs.length === 1 ? "program" : "programs";
  const open = size !== "peek";

  return (
    <aside aria-label="Results" className={`absolute inset-x-0 bottom-0 flex flex-col rounded-t-2xl border-t border-stone-400 bg-white shadow-lg ${LAYER.sheet} ${SHAPE[size]}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        aria-label={`Results sheet, ${SIZE_WORDS[size]}. Press to change the height`}
        onPointerDown={(event) => {
          startY.current = event.clientY;
          dragged.current = false;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          if (startY.current === null) return;
          const distance = event.clientY - startY.current;
          startY.current = null;
          if (Math.abs(distance) >= DRAG_MIN) {
            dragged.current = true;
            onSizeChange(step(size, distance < 0 ? 1 : -1));
          }
        }}
        onPointerCancel={() => { startY.current = null; }}
        onClick={() => {
          if (dragged.current) {
            dragged.current = false;
            return;
          }
          onSizeChange(cycle(size));
        }}
        className="tap-target flex w-full touch-none items-center justify-center"
      >
        <span aria-hidden="true" className="h-1.5 w-12 rounded-full bg-stone-500" />
      </button>
      <p role="status" data-testid="result-count" className="figures px-4 pb-1 font-sans text-base text-stone-800"><strong>{programs.length}</strong> {countText}</p>
      <div className="px-4 pb-2"><MapSearch query={query} onQueryChange={onQueryChange} hideLabel /></div>
      <div id={bodyId} className={`${open ? "block" : "hidden"} min-h-0 flex-1 overflow-y-auto border-t border-stone-200`}>
        <ResultsBody programs={programs} selectedSlug={selectedSlug} explainProvinces={explainProvinces} spot={spot} onSelect={onSelect} onClear={onClear} />
      </div>
    </aside>
  );
}
