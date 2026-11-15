// what this file does: the phone filter bottom sheet
//   opens from the "filters" button, shows the same controls as the desktop bar
//   focus moves in on open, tab stays inside, escape or the backdrop closes it
//   the page behind stops scrolling while it is open
// the parent returns focus to the filters button after close
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./Button";

type Props = {
  open: boolean;
  resultCount: number;
  hasFilters: boolean;
  onClose: () => void;
  onClear: () => void;
  children: ReactNode;
};

export function FilterSheet({ open, resultCount, hasFilters, onClose, onClear, children }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  // keep the latest onClose without re-running the effect (that would steal focus on every render)
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;
      // simple focus trap: wrap from last to first and back
      const items = panel.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), a[href]");
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 max-h-[85dvh] space-y-5 overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl outline-none"
      >
        <h2 id="filter-sheet-title" className="text-xl font-semibold">Filters</h2>
        {children}
        {/* actions stay visible while the controls scroll */}
        <div className="sticky bottom-0 -mx-4 -mb-4 flex gap-3 border-t border-stone-200 bg-white p-4">
          <Button className="flex-1" onClick={onClose}>
            Show {resultCount} {resultCount === 1 ? "program" : "programs"}
          </Button>
          <Button variant="secondary" onClick={onClear} disabled={!hasFilters}>Clear</Button>
        </div>
      </div>
    </div>
  );
}
