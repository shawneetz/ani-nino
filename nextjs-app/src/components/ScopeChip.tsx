import { SCOPES, type Scope } from "@/lib/vocab";

export function ScopeChip({ scope }: { scope: Scope }) {
  return (
    <span
      title={SCOPES[scope].blurb}
      className="inline-block rounded-full border border-stone-400 px-2.5 py-0.5 text-sm font-medium text-stone-900"
    >
      {SCOPES[scope].label}
    </span>
  );
}
