// what this file does: the evidence block of a program page
//   RecordPanels = "what it promised", then "what the record shows", then "who says so"
//   CheckingBox = the flat "still checking" note that comes right after the record
// change in this version (e5): editorial layout, no boxes
//   the first sentence of the record is a large serif lead, the rest is normal text
//   the lead sentence is not repeated anywhere else on the page
// text is capped at 68 characters wide so lines are easy to follow
// the yaml wording is shown as written, nothing is edited here
import type { Source } from "@/lib/content-schema";
import { partisanNote, uniqueVoices } from "@/lib/source-summary";
import { splitFirstSentence } from "@/lib/split-first-sentence";
import { BLOCK_GAP, BODY, INNER_GAP } from "./Container";
import { VoiceChip } from "./VoiceChip";

// shared looks, so both panels always match
const HEADING = "font-serif text-xl font-semibold text-stone-950";
const LEAD = "max-w-[68ch] font-serif text-2xl leading-snug text-stone-950";
const BLOCK = `${INNER_GAP} border-t border-stone-400 pt-4`;

type RecordProps = {
  promised?: string;
  happened: string;
  sources: Pick<Source, "voice">[];
};

export function RecordPanels({ promised, happened, sources }: RecordProps) {
  const voices = uniqueVoices(sources);
  const balanceNote = partisanNote(sources);
  // the first sentence is the lead, a one-sentence text has an empty rest
  const { first, rest } = splitFirstSentence(happened);

  return (
    <section id="record" aria-label="Promise and record" className={`scroll-mt-24 ${BLOCK_GAP}`}>
      {promised && (
        <div className={BLOCK}>
          <h2 className={HEADING}>What it promised</h2>
          <p className={BODY}>{promised}</p>
        </div>
      )}

      <div className={BLOCK}>
        <h2 className={HEADING}>What the record shows</h2>
        <p className={LEAD}>{first}</p>
        {rest && <p className={BODY}>{rest}</p>}
      </div>

      {/* who says so, set like a byline, with the balance note when sources lean one way */}
      <div className={BLOCK}>
        <h2 className="font-sans text-sm font-semibold uppercase tracking-kicker text-stone-700">Who says so</h2>
        {voices.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {voices.map((voice) => (
              <VoiceChip key={voice} voice={voice} />
            ))}
          </div>
        ) : (
          <p className="font-sans text-base text-stone-700">No sources have been attached to this page yet.</p>
        )}
        {balanceNote && <p className="font-sans text-base text-amber-900">{balanceNote}</p>}
      </div>
    </section>
  );
}

export function CheckingBox({ question }: { question: string }) {
  return (
    // a flat note with a thick amber left border, so an unchecked program cannot be missed
    <section
      id="checking"
      aria-labelledby="checking-heading"
      className="scroll-mt-24 border-l-4 border-amber-600 bg-amber-50 py-4 pl-5 pr-4"
    >
      <h2 id="checking-heading" className="font-serif text-xl font-semibold text-amber-950">
        Still checking
      </h2>
      <p className="mt-2 max-w-[68ch] font-serif text-lg leading-relaxed text-amber-950">{question}</p>
    </section>
  );
}