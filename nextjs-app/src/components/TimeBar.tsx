"use client";

import { useId } from "react";
import { FIRST_YEAR, LAST_YEAR } from "@/lib/vocab";
import { Button } from "./Button";
import { tickPercent, YEAR_RANGE_CLASS, YEAR_TICKS } from "./YearSlider";

interface TimeBarProps {
  year: number | null;
  onChange: (year: number | null) => void;
  showNote: boolean;
}

export function TimeBar({ year, onChange, showNote }: TimeBarProps) {
  const id = useId();
  const noYear = year === null;

  return (
    <section aria-label="Time bar" className="w-full space-y-1 rounded-xl border border-stone-400 bg-white p-3 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-baseline gap-3">
          <label htmlFor={id} className="font-sans text-base font-medium text-stone-700">Year</label>
          <p aria-hidden="true" className="figures font-serif text-4xl font-bold leading-none text-accent-strong">
            {noYear ? "All years" : year}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="px-3" disabled={year === FIRST_YEAR} onClick={() => onChange(noYear ? FIRST_YEAR : Math.max(FIRST_YEAR, year - 1))}>Previous year</Button>
          <Button variant="secondary" className="px-3" disabled={year === LAST_YEAR} onClick={() => onChange(noYear ? FIRST_YEAR : Math.min(LAST_YEAR, year + 1))}>Next year</Button>
          <Button variant="secondary" className="px-3" aria-pressed={noYear} onClick={() => onChange(null)}>All years</Button>
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={FIRST_YEAR}
        max={LAST_YEAR}
        step={1}
        value={year ?? FIRST_YEAR}
        aria-valuetext={noYear ? "All years" : String(year)}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerUp={(event) => {
          if (noYear) onChange(Number(event.currentTarget.value));
        }}
        className={`${YEAR_RANGE_CLASS} ${noYear ? "opacity-50" : ""}`}
      />
      <div aria-hidden="true" className="relative mx-[14px] h-6">
        {YEAR_TICKS.map((tick) => (
          <span key={tick} className="absolute -translate-x-1/2 text-sm text-stone-700" style={{ left: `${tickPercent(tick)}%` }}>{tick}</span>
        ))}
      </div>
      {showNote && <p className="text-sm text-stone-700">Year filters martial-law programs only.</p>}
    </section>
  );
}
