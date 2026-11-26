"use client";

import type { RefObject } from "react";

interface ListPillProps {
  count: number;
  buttonRef: RefObject<HTMLButtonElement | null>;
  onOpen: () => void;
}

export function ListPill({ count, buttonRef, onOpen }: ListPillProps) {
  const countText = count === 1 ? "program" : "programs";

  return (
    <div className="pointer-events-auto flex shrink-0 items-center gap-3 rounded-full border border-stone-300 bg-white/90 py-1 pl-4 pr-1 shadow-lg backdrop-blur">
      <p role="status" data-testid="result-count" className="figures font-sans text-base text-stone-800">
        <strong>{count}</strong> {countText}
      </p>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={false}
        onClick={onOpen}
        className="tap-target inline-flex items-center justify-center rounded-full border border-stone-500 bg-white px-4 font-sans text-base font-medium text-stone-900 hover:border-ink"
      >
        Show list
      </button>
    </div>
  );
}
