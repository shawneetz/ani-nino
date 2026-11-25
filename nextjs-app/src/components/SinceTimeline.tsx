// what this file does: shows the "what came after" entries as a ruled list
// every entry has its year, text, a linked source title, the publisher, a voice label
// and the date the source was accessed
// entries are sorted by year, so the order never depends on the yaml order
// the publisher and "Accessed <date>" show next to each source, because these sources
// are not in the Sources list of the page, so this is the only place a reader sees them
// change in this version (e5): hairline rows with the year in serif numerals, replacing the dotted vertical line
// in print the source url follows its linked title
import type { Program } from "@/lib/content-schema";
import { VoiceChip } from "./VoiceChip";

// print only: writes the link address after the link text, "attr(href)" reads it from the link
const PRINT_URL = "print:after:break-all print:after:content-['_('attr(href)')']";

/**
 * Renders the dated "what came after" entries of a program.
 *
 * @remarks
 * Server Component, it has no state. Each entry shows the source title (a link when
 * the yaml has a url), the publisher, the source label and the access date.
 * `accessed` is optional in the schema, so the date line is skipped when it is missing
 */
export function SinceTimeline({ items }: { items: Program["since"] }) {
  // copy before sorting, the original array must not change
  const sorted = [...items].sort((a, b) => a.year - b.year);

  return (
    <ol className="border-t border-stone-400">
      {sorted.map((item) => (
        <li
          key={`${item.year}-${item.text}`}
          className="grid gap-1 border-b border-stone-400 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-x-6"
        >
          <p className="figures font-serif text-2xl font-bold text-accent-strong">{item.year}</p>
          <div>
            <p className="max-w-[68ch] font-serif text-lg leading-relaxed text-stone-800">{item.text}</p>

            {/* source title is a link when the yaml has a url, plus the voice label */}
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-base text-stone-700">
              <span>Source:</span>
              {item.source.url ? (
                <a
                  href={item.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`tap-target inline-flex items-center underline underline-offset-2 ${PRINT_URL}`}
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
            <p className="font-sans text-sm text-stone-700">
              {item.source.publisher}
              {item.source.accessed && <span data-testid="since-accessed">. Accessed {item.source.accessed}</span>}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}