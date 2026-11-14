// What this file does: lists sources with their label, publisher, citation and access date.
// The title is normal reading size and the details are at least 15px.
import type { Source } from "@/lib/content-schema";
import { VoiceChip } from "./voice-chip";

const BACKS_LABELS = {
  promise: "Backs the promise",
  happened: "Backs what happened",
  context: "Background",
} as const;

// "usedIn" is added by the sources page to show where a source appears.
type Item = Source & { usedIn?: string[] };

export function SourceList({ sources }: { sources: Item[] }) {
  return (
    <ul className="space-y-4">
      {sources.map((source) => (
        <li key={`${source.title}-${source.url ?? source.publisher}`} className="text-base leading-relaxed text-stone-800">
          {source.url ? (
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {source.title}
            </a>
          ) : (
            <span>{source.title}</span>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone-700">
            <span>{source.publisher}</span>
            <VoiceChip voice={source.voice} />
            {source.backs && <span>{BACKS_LABELS[source.backs]}</span>}
          </div>
          {source.cite && <p className="text-sm text-stone-700">Cite: {source.cite}</p>}
          {source.accessed && <p className="text-sm text-stone-700">Accessed {source.accessed}</p>}
          {source.usedIn && <p className="text-sm text-stone-700">Used in: {source.usedIn.join("; ")}</p>}
        </li>
      ))}
    </ul>
  );
}
