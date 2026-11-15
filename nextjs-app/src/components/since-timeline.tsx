// what this file does: shows the "what came after" entries as a vertical timeline
// every entry has its year, text, a linked source title and a voice label
import type { Program } from "@/lib/content-schema";
import { VoiceChip } from "./voice-chip";

export function SinceTimeline({ items }: { items: Program["since"] }) {
  return (
    // the left border is the timeline line
    <ol className="space-y-6 border-l-2 border-stone-300 pl-5">
      {items.map((item) => (
        <li key={`${item.year}-${item.text}`} className="relative">
          {/* dot sitting on the line */}
          <span aria-hidden="true" className="absolute -left-[1.72rem] top-2 h-3 w-3 rounded-full border-2 border-stone-500 bg-white" />
          <p className="text-lg font-semibold text-stone-900">{item.year}</p>
          <p className="mt-1 max-w-[68ch] text-lg leading-relaxed text-stone-800">{item.text}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-base text-stone-700">
            <span>Source:</span>
            {item.source.url ? (
              <a
                href={item.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                {item.source.title}
              </a>
            ) : (
              <span>{item.source.title}</span>
            )}
            <VoiceChip voice={item.source.voice} />
          </div>
        </li>
      ))}
    </ol>
  );
}
