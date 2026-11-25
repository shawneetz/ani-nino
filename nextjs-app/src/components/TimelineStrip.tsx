// what this file does: a static 1972 to 1986 strip with one ruled row per martial-law program
// each row links to its program page, it has no client code and no map
// bars are only a visual aid: the years are also written as text beside each title,
// so nothing depends on color or bar length alone
// change in this version (e4): hairline rows and serif titles instead of rounded hover boxes
import Link from "next/link";
import type { Program } from "@/lib/content-schema";
import { yearRange } from "@/lib/filter";
import { timelineBar } from "@/lib/landing-stats";
import { FIRST_YEAR, LAST_YEAR, TOPICS } from "@/lib/vocab";

const MIDDLE_YEAR = Math.round((FIRST_YEAR + LAST_YEAR) / 2);

export function TimelineStrip({ programs }: { programs: Program[] }) {
  return (
    <div>
      {/* axis labels, hidden from screen readers because each row states its own years */}
      <div aria-hidden="true" className="figures flex justify-between px-1 pb-1 font-sans text-sm text-stone-700">
        <span>{FIRST_YEAR}</span>
        <span>{MIDDLE_YEAR}</span>
        <span>{LAST_YEAR}</span>
      </div>
      <ol className="border-t border-stone-400">
        {programs.map((program) => {
          const bar = timelineBar(program);
          return (
            <li key={program.slug} className="border-b border-stone-300">
              <Link href={`/programs/${program.slug}`} className="tap-target block px-1 py-2 hover:bg-stone-100">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-serif text-base font-semibold text-stone-950">{program.title}</span>
                  <span className="figures font-sans text-sm text-stone-700">{yearRange(program)}</span>
                </span>
                {/* the grey track is the full 1972 to 1986 range, the colored bar is the program */}
                <span aria-hidden="true" className="relative mt-1 block h-3 bg-stone-200">
                  <span
                    className="absolute inset-y-0"
                    // position, width and color depend on the data, so they stay inline
                    style={{
                      left: `${bar.left}%`,
                      width: `${bar.width}%`,
                      backgroundColor: TOPICS[program.topic].color,
                    }}
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}