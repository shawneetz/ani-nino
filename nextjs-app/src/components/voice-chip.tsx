// What this file does: labels the perspective represented by a source.
import { VOICES, type Voice } from "@/lib/vocab";
export function VoiceChip({ voice }: { voice: Voice }) {
  return <span title={VOICES[voice].blurb} className="inline-block rounded-full border border-stone-300 px-2 py-0.5 text-xs font-medium">{VOICES[voice].label}</span>;
}
