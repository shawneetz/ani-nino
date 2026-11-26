// what this file does: labels how far a number reaches (National, Region, Province, Town, Place)
// a neutral outline tag, same look as VoiceChip so every tag on a reading page matches
// change in this version (e3): small rectangle tag, uppercase text, thin border, wide letter spacing
// the text is 15px or larger
import { SCOPES, type Scope } from "@/lib/vocab";

export function ScopeChip({ scope }: { scope: Scope }) {
  return (
    <span
      title={SCOPES[scope].blurb}
      className="inline-block rounded-sm border border-stone-500 px-2 py-0.5 font-sans text-sm font-semibold uppercase tracking-wider text-stone-900"
    >
      {SCOPES[scope].label}
    </span>
  );
}