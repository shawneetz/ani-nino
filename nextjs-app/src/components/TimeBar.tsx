"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { YearCount } from "@/lib/year-counts";
import { FIRST_YEAR, LAST_YEAR } from "@/lib/vocab";
import { Button } from "./Button";
import { tickPercent, YEAR_RANGE_CLASS, YEAR_TICKS } from "./YearSlider";

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={direction === "left" ? "M12 4 6 10l6 6" : "m8 4 6 6-6 6"} />
    </svg>
  );
}

interface TimeBarProps {
  year: number | null;
  onChange: (year: number | null) => void;
  showNote: boolean;
  counts: YearCount[];
}

const PLAY_STEP_MS = 1200;

export function TimeBar({ year, onChange, showNote, counts }: TimeBarProps) {
  const id = useId();
  const noYear = year === null;
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const active = playing && !reduced && year !== null && year < LAST_YEAR;
  const latest = useRef(onChange);
  useEffect(() => { latest.current = onChange; });

  useEffect(() => {
    if (!active || year === null) return;
    const timer = setTimeout(() => latest.current(year + 1), PLAY_STEP_MS);
    return () => clearTimeout(timer);
  }, [active, year]);

  const change = (next: number | null) => {
    setPlaying(false);
    onChange(next);
  };

  const togglePlay = () => {
    if (active) {
      setPlaying(false);
      return;
    }
    setPlaying(true);
    if (year === null || year >= LAST_YEAR) onChange(FIRST_YEAR);
  };

  const max = Math.max(1, ...counts.map((item) => item.count));

  return (
    <section aria-label="Time bar" className="w-full space-y-1 rounded-xl border border-stone-400 bg-white px-3 py-2 shadow-lg">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="flex items-center gap-1">
          <Button variant="secondary" className="px-3" disabled={year === FIRST_YEAR} onClick={() => change(noYear ? FIRST_YEAR : Math.max(FIRST_YEAR, year - 1))}>
            <Arrow direction="left" /><span className="sr-only">Previous year</span>
          </Button>
          <label htmlFor={id} className="sr-only">Year</label>
          <p aria-hidden="true" className={`figures w-28 text-center font-serif font-bold leading-none text-accent-strong ${noYear ? "text-2xl" : "text-3xl"}`}>
            {noYear ? "All years" : year}
          </p>
          <Button variant="secondary" className="px-3" disabled={year === LAST_YEAR} onClick={() => change(noYear ? FIRST_YEAR : Math.min(LAST_YEAR, year + 1))}>
            <Arrow direction="right" /><span className="sr-only">Next year</span>
          </Button>
        </div>
        <div className="min-w-[16rem] flex-1">
          <div aria-hidden="true" className="relative mx-[14px] h-8">
            {counts.map((item) => (
              <span
                key={item.year}
                className={`absolute bottom-0 w-2 -translate-x-1/2 ${item.year === year ? "bg-accent" : "bg-stone-400"}`}
                style={{
                  left: `${tickPercent(item.year)}%`,
                  height: item.count === 0 ? "2px" : `${Math.max(12, (item.count / max) * 100)}%`,
                }}
              />
            ))}
          </div>
          <input
        id={id}
        type="range"
        min={FIRST_YEAR}
        max={LAST_YEAR}
        step={1}
        value={year ?? FIRST_YEAR}
        aria-valuetext={noYear ? "All years" : String(year)}
        onChange={(event) => change(Number(event.target.value))}
        onPointerUp={(event) => {
          if (noYear) change(Number(event.currentTarget.value));
        }}
        className={`${YEAR_RANGE_CLASS} ${noYear ? "opacity-50" : ""}`}
          />
          <div aria-hidden="true" className="relative mx-[14px] h-6">
            {YEAR_TICKS.map((tick) => (
              <span key={tick} className="absolute -translate-x-1/2 text-sm text-stone-700" style={{ left: `${tickPercent(tick)}%` }}>{tick}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="px-3" aria-pressed={noYear} onClick={() => change(null)}>All years</Button>
          <Button variant="secondary" className="px-3" disabled={reduced} title={reduced ? "Turned off because reduced motion is on" : undefined} onClick={togglePlay}>
            {active ? "Pause" : "Play"}<span className="sr-only"> the years</span>
          </Button>
        </div>
      </div>
      {showNote && <p className="text-sm text-stone-700">Year filters martial-law programs only.</p>}
    </section>
  );
}
