// what this file does: one program as a row in the reading list on /programs
// years in large serif numerals on the left, then the title, the first sentence (2 lines),
// the status tag and the source labels
// no box and no image, rows are split by hairlines (the list draws them)
// the title is the only link, and the row is an article so tests and screen readers see one unit
// it is a server-safe component, it has no hooks and no client code
// change in this version (u5): row rhythm
//   rows are a little taller (py-6), the text column uses the shared 3-step gap
//   the year strip lines up with the title column and stops at the same width as the text
import Link from "next/link";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { yearRange } from "@/lib/filter";
import { TOPICS } from "@/lib/vocab";
import { INNER_GAP } from "./Container";
import { StatusTag } from "./StatusTag";
import { VoiceChip } from "./VoiceChip";
import { YearStrip } from "./YearStrip";

/**
 * Props for the ProgramRow component.
 */
interface ProgramRowProps {
  /** The slim program to show, the same shape the explorer uses */
  program: ExplorerProgram;
}

const PLAIN_BOX = `${INNER_GAP} max-w-[68ch] border-l-4 border-stone-500 py-1 pl-4 font-serif text-lg leading-relaxed text-stone-800`;

/**
 * Builds the small line under the large start year.
 *
 * @remarks
 * Open programs say "onward", closed ranges say "to <year>", a single year has no line
 *
 * @param program - Only the two year fields are read
 * @returns The line, or an empty string for a single year
 */
function yearNote(program: Pick<ExplorerProgram, "startYear" | "endYear">): string {
  if (program.endYear == null) return "onward";
  if (program.endYear === program.startYear) return "";
  return `to ${program.endYear}`;
}

/**
 * Renders one program as a reading list row.
 *
 * @example
 * ```tsx
 * <ProgramRow program={program} />
 * ```
 */
export function ProgramRow({ program }: ProgramRowProps) {
  const topic = TOPICS[program.topic];
  const note = yearNote(program);
  const plain = program.plain;

  return (
    <article
      id={`program-${program.slug}`}
      className="grid scroll-mt-4 gap-x-6 gap-y-3 py-6 sm:grid-cols-[7rem_minmax(0,1fr)]"
    >
      {/* the full range is read once by screen readers, the split years below are only for the eye */}
      <p className="figures sm:text-right">
        <span className="sr-only">{yearRange(program)}</span>
        <span aria-hidden="true" className="block font-serif text-4xl font-bold leading-none text-accent-strong">
          {program.startYear}
        </span>
        {note && (
          <span aria-hidden="true" className="block pt-1 font-sans text-sm text-stone-700">
            {note}
          </span>
        )}
      </p>

      <div className={INNER_GAP}>
        {/* the topic color depends on the data, so it stays inline */}
        <p className="font-sans text-sm font-semibold uppercase tracking-kicker" style={{ color: topic.color }}>
          {topic.label}
          {/* marks echo programs so they are not mistaken for martial-law ones */}
          {program.era === "today" && <span className="text-amber-900"> · Today</span>}
        </p>
        <h3 className="font-serif text-xl font-semibold leading-snug text-stone-950">
          <Link href={`/programs/${program.slug}`} className="underline-offset-4 hover:underline">
            {program.title}
          </Link>
        </h3>
        <YearStrip
          compact
          startYear={program.startYear}
          endYear={program.endYear}
          topic={program.topic}
          className="hidden max-w-[68ch] sm:grid"
        />
        {plain ? (
          <div className={PLAIN_BOX}>
            <p>
              <strong>They promised to</strong> {plain.promised}.
            </p>
            <p>
              <strong>But in the end, according to</strong> {plain.according},{" "}
              <strong>what actually happened was</strong> {plain.happened}.
            </p>
            {plain.missing && (
              <p className="font-sans text-base text-stone-700">
                <strong>Still not known:</strong> {plain.missing}.
              </p>
            )}
          </div>
        ) : (
          <p className="line-clamp-2 max-w-[68ch] font-serif leading-relaxed text-stone-800">{program.summary}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <StatusTag status={program.status} />
          {program.voices.map((voice) => (
            <VoiceChip key={voice} voice={voice} />
          ))}
        </div>
      </div>
    </article>
  );
}