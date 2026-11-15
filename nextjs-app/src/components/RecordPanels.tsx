// what this file does: the evidence block of a program page
//   RecordPanels = "what it promised" and "what the record shows" side by side
//   from 768px (stacked on phones), with the "who says so" strip right under them
//   CheckingBox = the stronger "still checking" box that comes right after the record
// text is large and capped at 68 characters wide so lines are easy to follow
// the yaml wording is shown as written, nothing is edited here
import type { Source } from "@/lib/content-schema";
import { partisanNote, uniqueVoices } from "@/lib/source-summary";
import { VoiceChip } from "./voice-chip";

// shared looks, so both panels always match
const PANEL = "rounded-card border border-stone-300 bg-white p-5";
const HEADING = "text-xl font-semibold text-stone-900";
const BODY = "mt-2 max-w-[68ch] text-lg leading-relaxed text-stone-800";

type RecordProps = {
    promised?: string;
    happened: string;
    sources: Pick<Source, "voice">[];
};

export function RecordPanels({ promised, happened, sources }: RecordProps) {
    const voices = uniqueVoices(sources);
    const balanceNote = partisanNote(sources);

    return (
        <section id="record" aria-label="Promise and record" className="scroll-mt-24 space-y-4">
            {/* two columns only when there is a promise to show */}
            <div className={`grid gap-4 ${promised ? "md:grid-cols-2" : ""}`}>
                {promised && (
                    <div className={PANEL}>
                        <h2 className={HEADING}>What it promised</h2>
                        <p className={BODY}>{promised}</p>
                    </div>
                )}
                <div className={PANEL}>
                    <h2 className={HEADING}>What the record shows</h2>
                    <p className={BODY}>{happened}</p>
                </div>
            </div>

            {/* who says so strip, with the balance note when sources lean one way */}
            <div className="space-y-2 rounded-card border border-stone-200 bg-stone-50 p-4">
                <h2 className="text-lg font-semibold text-stone-900">Who says so</h2>
                {voices.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {voices.map((voice) => <VoiceChip key={voice} voice={voice} />)}
                    </div>
                ) : (
                    <p className="text-base text-stone-700">No sources have been attached to this page yet.</p>
                )}
                {balanceNote && <p className="text-base text-amber-900">{balanceNote}</p>}
            </div>
        </section>
    );
}

export function CheckingBox({ question }: { question: string }) {
    return (
        // thick amber border so an unchecked program cannot be missed
        <section
            id="checking"
            aria-labelledby="checking-heading"
            className="scroll-mt-24 rounded-card border-2 border-amber-500 bg-amber-50 p-5"
        >
            <h2 id="checking-heading" className="text-xl font-semibold text-amber-950">Still checking</h2>
            <p className="mt-2 max-w-[68ch] text-lg leading-relaxed text-amber-950">{question}</p>
        </section>
    );
}