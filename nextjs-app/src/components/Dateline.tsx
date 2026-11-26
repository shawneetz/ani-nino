// what this file does: the dateline strip under a program title
// it shows the large status tag, the "checked on" date and the number of places
// the topic and years sit in the kicker above the title, so they are not repeated here
// ruled above and below like the dateline of a printed article
// it is a server component and ships no client code
import type { ProgramStatus } from "@/lib/vocab";
import type { Topic } from "@/lib/vocab";
import { StatusTag } from "./StatusTag";
import { YearStrip } from "./YearStrip";

/**
 * Props for the Dateline component.
 */
interface DatelineProps {
  /** Confirmed or still checking */
  status: ProgramStatus;
  /** ISO date the program was checked, shown only when present */
  checkedOn?: string;
  /** How many places the program lists */
  placeCount: number;
  startYear: number;
  endYear?: number | null;
  topic: Topic;
}

/**
 * Renders the status, checked date and place count in one wrapping row.
 *
 * @example
 * ```tsx
 * <Dateline status="confirmed" checkedOn="2026-11-25" placeCount={2} />
 * ```
 */
export function Dateline({ status, checkedOn, placeCount, startYear, endYear, topic }: DatelineProps) {
  return (
    <div className="figures space-y-3 border-y border-stone-400 py-3 font-sans text-base text-stone-700">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <StatusTag status={status} size="large" />
        {checkedOn && <span>Checked on {checkedOn}</span>}
        <span>
          {placeCount} {placeCount === 1 ? "place" : "places"}
        </span>
      </div>
      <YearStrip startYear={startYear} endYear={endYear} topic={topic} className="max-w-xl" />
    </div>
  );
}