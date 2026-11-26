// what this file does: lists sources with their label, publisher, citation and access date
// the title is normal reading size and the details are at least 15px
// change in this version (c10): in print each linked title is followed by its url,
// because a printed page cannot be clicked
// change in this version (e7): ruled rows instead of spacing only, serif titles
import type { Source } from "@/lib/content-schema";
import { VoiceChip } from "./VoiceChip";

const BACKS_LABELS = {
  promise: "Backs the promise",
  happened: "Backs what happened",
  context: "Background",
} as const;

// print only: writes the link address after the link text, "attr(href)" reads it from the link
const PRINT_URL = "print:after:break-all print:after:content-['_('attr(href)')']";

// "usedIn" is added by the sources page to show where a source appears
type Item = Source & { usedIn?: string[] };

export function SourceList({ sources }: { sources: Item[] }) {
  return (
    // a hairline opens the list and every row closes with one
    <ul className="border-t border-stone-400">
      {sources.map((source) => (
        <li
          key={`${source.title}-${source.url ?? source.publisher}`}
          className="border-b border-stone-400 py-3 font-serif text-lg leading-relaxed text-stone-800"
        >
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline underline-offset-2 ${PRINT_URL}`}
            >
              {source.title}
            </a>
          ) : (
            <span>{source.title}</span>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-2 font-sans text-sm text-stone-700">
            <span>{source.publisher}</span>
            <VoiceChip voice={source.voice} />
            {source.backs && <span>{BACKS_LABELS[source.backs]}</span>}
          </div>
          {source.cite && <p className="font-sans text-sm text-stone-700">Cite: {source.cite}</p>}
          {source.accessed && <p className="figures font-sans text-sm text-stone-700">Accessed {source.accessed}</p>}
          {source.usedIn && <p className="font-sans text-sm text-stone-700">Used in: {source.usedIn.join("; ")}</p>}
        </li>
      ))}
    </ul>
  );
}