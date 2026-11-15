// what this file does: the 1972 to 1986 year control (c3.9)
//   slider with tick labels that sit under the real thumb positions
//   previous / next year buttons and an "all years" button (year = null)
//   a note that the year only filters martial-law programs
// the result count lives in the filter bar now, not here
"use client";

import { useId } from "react";
import { FIRST_YEAR, LAST_YEAR } from "@/lib/vocab";
import { Button } from "./Button";

// labels under the slider, spaced so they never touch on a phone
const TICKS = [1972, 1976, 1981, 1986];
const SPAN = LAST_YEAR - FIRST_YEAR;
// half of the 28px thumb in globals.css, the tick row is inset by this much
const THUMB_HALF = 14;

type Props = { year: number | null; onChange: (year: number | null) => void };

export function YearSlider({ year, onChange }: Props) {
  const id = useId();
  const noYear = year === null;

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-base font-medium text-stone-700">Year</label>
        <span className="text-base font-semibold text-stone-900">{noYear ? "All years" : year}</span>
      </div>

      {/* when no year is picked the thumb rests at 1972 and the slider looks muted */}
      <input
        id={id}
        type="range"
        min={FIRST_YEAR}
        max={LAST_YEAR}
        step={1}
        value={year ?? FIRST_YEAR}
        aria-valuetext={noYear ? "All years" : String(year)}
        onChange={(event) => onChange(Number(event.target.value))}
        // a tap on the thumb at 1972 fires no change event, so set the year when the pointer lifts
        onPointerUp={(event) => {
          if (noYear) onChange(Number(event.currentTarget.value));
        }}
        className={`year-range ${noYear ? "opacity-50" : ""}`}
      />

      {/* ticks: inset by half a thumb so each label is centered under its thumb position */}
      <div aria-hidden="true" className="relative h-6" style={{ marginLeft: THUMB_HALF, marginRight: THUMB_HALF }}>
        {TICKS.map((tick) => (
          <span
            key={tick}
            className="absolute -translate-x-1/2 text-sm text-stone-700"
            style={{ left: `${((tick - FIRST_YEAR) / SPAN) * 100}%` }}
          >
            {tick}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="px-3"
          disabled={year === FIRST_YEAR}
          onClick={() => onChange(noYear ? FIRST_YEAR : Math.max(FIRST_YEAR, year - 1))}
        >
          Previous year
        </Button>
        <Button
          variant="secondary"
          className="px-3"
          disabled={year === LAST_YEAR}
          onClick={() => onChange(noYear ? FIRST_YEAR : Math.min(LAST_YEAR, year + 1))}
        >
          Next year
        </Button>
        <Button variant="secondary" className="px-3" aria-pressed={noYear} onClick={() => onChange(null)}>
          All years
        </Button>
      </div>
      <p className="text-sm text-stone-700">Year filters martial-law programs only.</p>
    </div>
  );
}
