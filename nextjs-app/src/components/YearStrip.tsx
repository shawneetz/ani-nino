// what this file does: a small strip that shows where a program sits on the 1972 to 1986 track
import { timelineBar } from "@/lib/landing-stats";
import { FIRST_YEAR, LAST_YEAR, TOPICS, type Topic } from "@/lib/vocab";

interface YearStripProps {
  startYear: number;
  endYear?: number | null;
  topic: Topic;
  compact?: boolean;
  className?: string;
}

export function YearStrip({ startYear, endYear, topic, compact = false, className = "" }: YearStripProps) {
  const bar = timelineBar({ startYear, endYear });
  const endText = endYear == null ? "onward" : String(endYear);

  return (
    <div
      aria-hidden="true"
      className={`figures grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 font-sans text-sm text-stone-700 ${className}`}
    >
      <span>{startYear}</span>
      <span className={`relative block bg-stone-200 ${compact ? "h-2" : "h-3"}`}>
        <span
          className="absolute inset-y-0 print:[print-color-adjust:exact]"
          style={{ left: `${bar.left}%`, width: `${bar.width}%`, backgroundColor: TOPICS[topic].color }}
        />
      </span>
      <span>{endText}</span>
      {!compact && (
        <span className="col-start-2 flex justify-between pt-1">
          <span>{FIRST_YEAR}</span>
          <span>{LAST_YEAR}</span>
        </span>
      )}
    </div>
  );
}
