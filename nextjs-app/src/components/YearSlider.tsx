// what this file does: the 1972 to 1986 year control
//   slider with tick labels that sit under the real thumb positions
//   previous / next year buttons and an "all years" button (year = null)
//   a note that the year only filters martial-law programs
// change in this version: the thumb and track styles are tailwind classes here,
// not css in globals.css, sizes use px because the root font is 18px
// the result count lives in the filter bar now, not here
"use client";

import { useId } from "react";
import { FIRST_YEAR, LAST_YEAR } from "@/lib/vocab";
import { Button } from "./Button";

// labels under the slider, spaced so they never touch on a phone
const TICKS = [1972, 1976, 1981, 1986];
const SPAN = LAST_YEAR - FIRST_YEAR;

// the input is 44px tall so it is easy to tap, the track is a thin 6px line
const RANGE_BASE = "h-[44px] w-full cursor-pointer appearance-none bg-transparent";

// chrome, edge and safari: 6px track, 28px thumb centered on it ((6 - 28) / 2 = -11px)
const RANGE_WEBKIT = [
  "[&::-webkit-slider-runnable-track]:h-[6px]",
  "[&::-webkit-slider-runnable-track]:rounded-full",
  "[&::-webkit-slider-runnable-track]:bg-stone-300",
  "[&::-webkit-slider-thumb]:appearance-none",
  "[&::-webkit-slider-thumb]:-mt-[11px]",
  "[&::-webkit-slider-thumb]:h-[28px]",
  "[&::-webkit-slider-thumb]:w-[28px]",
  "[&::-webkit-slider-thumb]:rounded-full",
  "[&::-webkit-slider-thumb]:border-[3px]",
  "[&::-webkit-slider-thumb]:border-white",
  "[&::-webkit-slider-thumb]:bg-accent",
  "[&::-webkit-slider-thumb]:shadow-[0_0_0_1px_#78716c]",
].join(" ");

// firefox: the thumb adds its border to its size, so 22px + 2 x 3px border = 28px
const RANGE_MOZ = [
  "[&::-moz-range-track]:h-[6px]",
  "[&::-moz-range-track]:rounded-full",
  "[&::-moz-range-track]:bg-stone-300",
  "[&::-moz-range-thumb]:h-[22px]",
  "[&::-moz-range-thumb]:w-[22px]",
  "[&::-moz-range-thumb]:rounded-full",
  "[&::-moz-range-thumb]:border-[3px]",
  "[&::-moz-range-thumb]:border-white",
  "[&::-moz-range-thumb]:bg-accent",
  "[&::-moz-range-thumb]:shadow-[0_0_0_1px_#78716c]",
].join(" ");

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
        className={`${RANGE_BASE} ${RANGE_WEBKIT} ${RANGE_MOZ} ${noYear ? "opacity-50" : ""}`}
      />

      {/* ticks: inset by half a thumb (14px) so each label is centered under its thumb position */}
      <div aria-hidden="true" className="relative mx-[14px] h-6">
        {TICKS.map((tick) => (
          <span
            key={tick}
            className="absolute -translate-x-1/2 text-sm text-stone-700"
            // the position is computed from the year, so it has to stay inline
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
