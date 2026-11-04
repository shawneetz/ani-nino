// What this file does: provides the 1972-1986 year control and match count.
"use client";
import { FIRST_YEAR, LAST_YEAR } from "@/lib/vocab";

export function YearSlider({ year, count, onChange }: { year: number | null; count: number; onChange: (year: number | null) => void }) {
  const all = FIRST_YEAR - 1;
  return <div className="rounded-lg border border-stone-200 bg-white p-3">
    <div className="mb-1 flex justify-between text-sm text-stone-600"><label htmlFor="year-slider">Year</label><span aria-live="polite"><strong className="text-stone-900">{year ?? "All years"}</strong> · {count} {count === 1 ? "program" : "programs"}</span></div>
    <input id="year-slider" type="range" min={all} max={LAST_YEAR} value={year ?? all} onChange={(e) => { const n = Number(e.target.value); onChange(n === all ? null : n); }} aria-valuetext={year === null ? "All years" : String(year)} className="h-8 w-full accent-amber-700" />
    <div className="flex justify-between text-xs text-stone-500" aria-hidden="true"><span>All</span><span>{FIRST_YEAR}</span><span>{LAST_YEAR}</span></div>
  </div>;
}
