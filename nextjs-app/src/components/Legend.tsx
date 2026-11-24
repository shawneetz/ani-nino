// what this file does: the "map key" disclosure
// it draws real marker samples from marker-style.ts, so the key always matches the map
// change in this version (c1): hides the today marker row when no today program exists
import type { CSSProperties, ReactNode } from "react";
import { GROUP_LOOK, markerLook } from "@/lib/marker-style";
import { TOPIC_KEYS, TOPICS } from "@/lib/vocab";

// one small sample marker, hidden from screen readers because the text beside it says the same
function Sample({ style, children }: { style: CSSProperties; children?: ReactNode }) {
  return (
    <span aria-hidden="true" style={style} className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-sm font-bold text-white">
      {children}
    </span>
  );
}

const base = { topic: "land", status: "confirmed", approximate: false } as const;

const MARKER_ROWS: { look: CSSProperties; text: string; label?: string; todayOnly?: boolean }[] = [
  { look: markerLook(base), text: "Solid fill: confirmed" },
  { look: markerLook({ ...base, status: "checking" }), text: "Hollow: still checking" },
  { look: markerLook({ ...base, approximate: true }), text: "Dashed border: approximate place" },
  { look: markerLook({ ...base, era: "today" }), text: "Square: a program from today (round is martial law)", todayOnly: true },
  { look: GROUP_LOOK, text: "Number: several programs at one place, tap to choose", label: "3" },
];

export function Legend({ showToday }: { showToday: boolean }) {
  const rows = MARKER_ROWS.filter((row) => showToday || !row.todayOnly);

  return (
    <details className="rounded-card border border-stone-200 bg-white">
      <summary className="tap-target flex cursor-pointer items-center px-4 text-base font-medium">Map key</summary>
      <div className="grid gap-x-8 gap-y-4 px-4 pb-4 sm:grid-cols-2">
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.text} className="flex items-center gap-3 text-base text-stone-800">
              <Sample style={row.look}>{row.label}</Sample>
              {row.text}
            </li>
          ))}
        </ul>
        <ul className="space-y-2">
          {TOPIC_KEYS.map((key) => (
            <li key={key} className="flex items-center gap-3 text-base text-stone-800">
              <span aria-hidden="true" className="h-4 w-4 shrink-0 rounded-full" style={{ background: TOPICS[key].color }} />
              {TOPICS[key].label}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
