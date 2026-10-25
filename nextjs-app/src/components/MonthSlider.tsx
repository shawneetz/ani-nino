// What this file does: lets readers choose a month and see the current pin count.
"use client";

import { MAX_MONTH, MIN_MONTH, monthFromIndex, monthIndex, monthLabel } from "@/lib/slider";

export function MonthSlider({
  month,
  onChange,
  visibleCount,
}: {
  month: string;
  onChange: (month: string) => void;
  visibleCount: number;
}) {
  return (
    <section aria-label="Timeline" className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor="month-slider" className="font-semibold">Month</label>
        <p aria-live="polite" className="text-sm text-neutral-700">
          {monthLabel(month)} · {visibleCount} {visibleCount === 1 ? "pin" : "pins"}
        </p>
      </div>
      <input
        id="month-slider"
        aria-label="Month"
        type="range"
        min={monthIndex(MIN_MONTH)}
        max={monthIndex(MAX_MONTH)}
        value={monthIndex(month)}
        onChange={(event) => onChange(monthFromIndex(Number(event.currentTarget.value)))}
        className="mt-3 w-full accent-orange-700"
      />
      <div className="flex justify-between text-xs text-neutral-600">
        <span>{monthLabel(MIN_MONTH)}</span>
        <span>{monthLabel(MAX_MONTH)}</span>
      </div>
    </section>
  );
}
