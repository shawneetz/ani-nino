// What this file does: labels the perspective represented by a source
// (Government, Court/archive/study, and so on). The text is 15px or larger.
import { VOICES, type Voice } from "@/lib/vocab";

export function VoiceChip({ voice }: { voice: Voice }) {
  return (
    <span
      title={VOICES[voice].blurb}
      className="inline-block rounded-full border border-stone-400 px-2.5 py-0.5 text-sm font-medium text-stone-900"
    >
      {VOICES[voice].label}
    </span>
  );
}
