// what this file does: one program in the results panel on /map
// the title is the only control, a button that selects the program
// below it: years, topic, status tag, and the first sentence of "happened" cut to two lines
// the id lets the map scroll this row into view when its pin is picked
// it replaces ProgramCard on the map, rows are flat and split by hairlines (the panel draws them)
// change in this version (m4): new
import type { ExplorerProgram } from "@/lib/explorer-types";
import { yearRange } from "@/lib/filter";
import { TOPICS } from "@/lib/vocab";
import { StatusTag } from "./StatusTag";

/**
 * Props for the ResultItem component.
 */
interface ResultItemProps {
  /** The slim program to show, the same shape the explorer uses. */
  program: ExplorerProgram;
  /** Marks the row as the selected program. */
  selected: boolean;
  /** Called with the slug when the reader picks the title. */
  onSelect: (slug: string) => void;
}

/**
 * Renders one result row for the map panel.
 *
 * @remarks
 * Render it inside a `ul`, it is an `li`. The selected row gets an accent left border and
 * `aria-pressed`, so the state is never carried by color alone.
 *
 * @example
 * ```tsx
 * <ul>{programs.map((p) => <ResultItem key={p.slug} program={p} selected={false} onSelect={select} />)}</ul>
 * ```
 */
export function ResultItem({ program, selected, onSelect }: ResultItemProps) {
  const topic = TOPICS[program.topic];

  return (
    <li
      id={`program-${program.slug}`}
      className={`scroll-mt-4 border-l-4 px-4 py-3 ${
        selected ? "border-accent bg-amber-50" : "border-transparent hover:bg-stone-100"
      }`}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(program.slug)}
        className="tap-target text-left font-serif text-lg font-semibold leading-snug text-stone-950 underline-offset-4 hover:underline"
      >
        {program.title}
      </button>
      <div className="figures mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-base text-stone-700">
        <span>{yearRange(program)}</span>
        {/* the topic color depends on the data, so it stays inline */}
        <span className="font-medium" style={{ color: topic.color }}>
          {topic.label}
        </span>
        {/* marks echo programs so they are not mistaken for martial-law ones */}
        {program.era === "today" && <span className="font-medium text-amber-900">Today</span>}
        <StatusTag status={program.status} />
      </div>
      <p className="mt-1 line-clamp-2 font-serif text-base leading-relaxed text-stone-800">{program.summary}</p>
    </li>
  );
}