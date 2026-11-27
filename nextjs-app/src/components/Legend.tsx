"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { GROUP_LOOK, markerLook } from "@/lib/marker-style";
import { TOPIC_KEYS, TOPICS } from "@/lib/vocab";

function Sample({ style, children }: { style: CSSProperties; children?: ReactNode }) {
  return <span aria-hidden="true" style={style} className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-sm font-bold text-white">{children}</span>;
}

const base = { topic: "land", status: "confirmed", approximate: false } as const;
const MARKER_ROWS: { look: CSSProperties; text: string; label?: string; todayOnly?: boolean }[] = [
  { look: markerLook(base), text: "Solid fill: confirmed" },
  { look: markerLook({ ...base, status: "checking" }), text: "Hollow: still checking" },
  { look: markerLook({ ...base, approximate: true }), text: "Dashed border: approximate place" },
  { look: markerLook({ ...base, era: "today" }), text: "Square: a program from today (round is martial law)", todayOnly: true },
  { look: GROUP_LOOK, text: "Number: several programs at one place, tap to list them on the left", label: "3" },
];

export function Legend({ showToday }: { showToday: boolean }) {
  const rows = MARKER_ROWS.filter((row) => showToday || !row.todayOnly);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
      button.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (root.current && event.target instanceof Node && !root.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      {open && (
        <div id={panelId} role="group" aria-label="Map key" className="absolute bottom-full right-0 mb-2 w-80 max-w-[calc(100vw-1.5rem)] space-y-4 rounded-xl border border-stone-400 bg-white p-3 shadow-lg">
          <ul className="space-y-2">
            {rows.map((row) => (
              <li key={row.text} className="flex items-center gap-3 text-base text-stone-800"><Sample style={row.look}>{row.label}</Sample>{row.text}</li>
            ))}
          </ul>
          <ul className="space-y-2">
            {TOPIC_KEYS.map((key) => (
              <li key={key} className="flex items-center gap-3 text-base text-stone-800"><span aria-hidden="true" className="h-4 w-4 shrink-0 rounded-full" style={{ background: TOPICS[key].color }} />{TOPICS[key].label}</li>
            ))}
          </ul>
        </div>
      )}
      <button ref={button} type="button" aria-expanded={open} aria-controls={open ? panelId : undefined} onClick={() => setOpen((value) => !value)} className="tap-target inline-flex items-center rounded-full border-2 border-stone-500 bg-white px-4 font-sans text-base font-medium text-stone-900 shadow-lg hover:border-ink">Map key</button>
    </div>
  );
}
