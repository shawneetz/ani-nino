// what this file does: labels who is speaking in a source (Government, Court/archive/study, and so on)
// a neutral outline tag, no color says "good" or "bad", the label is not a verdict
// change in this version (e3): small rectangle tag, uppercase text, thin border, wide letter spacing
// the text is 15px or larger
import { VOICES, type Voice } from "@/lib/vocab";

export function VoiceChip({ voice }: { voice: Voice }) {
  return (
    <span
      title={VOICES[voice].blurb}
      className="inline-block rounded-sm border border-stone-500 px-2 py-0.5 font-sans text-sm font-semibold uppercase tracking-wider text-stone-900"
    >
      {VOICES[voice].label}
    </span>
  );
}