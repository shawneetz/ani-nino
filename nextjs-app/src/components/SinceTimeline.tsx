// what this file does: shows the "what came after" entries as a vertical timeline
// every entry has its year, text, a linked source title, the publisher, a voice label
// and the date the source was accessed
// entries are sorted by year, so the order never depends on the yaml order
// change in this version (c8): the publisher and "Accessed <date>" now show next to each source,
// because these sources are not in the Sources list of the page, so this is the only place a reader sees them
import type { Program } from "@/lib/content-schema";
import { VoiceChip } from "./VoiceChip";

/**
 * Renders the dated "what came after" entries of a program.
 *
 * @remarks
 * Server Component, it has no state. Each entry shows the source title (a link when
 * the yaml has a url), the publisher, the source label and the access date.
 * `accessed` is optional in the schema, so the date line is skipped when it is missing.
 */
export function SinceTimeline({ items }: { items: Program["since"] }) {
  // copy before sorting, the original array must not change
  const sorted = [...items].sort((a, b) => a.year - b.year);

  return (
    // the left border is the timeline line
    <ol className="space-y-6 border-l-2 border-stone-300 pl-5">
      {sorted.map((item) => (
        <li key={`${item.year}-${item.text}`} className="relative">
          {/* dot sitting on the line */}
          <span aria-hidden="true" className="absolute -left-[1.72rem] top-2 h-3 w-3 rounded-full border-2 border-stone-500 bg-white" />
          <p className="text-lg font-semibold text-stone-900">{item.year}</p>
          <p className="mt-1 max-w-[68ch] text-lg leading-relaxed text-stone-800">{item.text}</p>

          {/* source title is a link when the yaml has a url, plus the voice label */}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-base text-stone-700">
            <span>Source:</span>
            {item.source.url ? (
              <a
                href={item.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target inline-flex items-center underline underline-offset-2"
              >
                {item.source.title}
                {/* tells screen reader users the link leaves the site */}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <span>{item.source.title}</span>
            )}
            <VoiceChip voice={item.source.voice} />
          </div>

          {/* publisher and access date, the same details the Sources list shows */}
          <p className="text-sm text-stone-700">
            {item.source.publisher}
            {item.source.accessed && <span data-testid="since-accessed">. Accessed {item.source.accessed}</span>}
          </p>
        </li>
      ))}
    </ol>
  );
}