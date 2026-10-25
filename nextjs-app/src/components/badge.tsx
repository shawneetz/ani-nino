// What this file does: shows the evidence label attached to a pin.
import type { BadgeKind } from "@/lib/enums";
import { BADGE_LABELS } from "@/lib/vocab";

export function Badge({ badge }: { badge: BadgeKind | null }) {
  if (!badge) return null;
  return (
    <span className="inline-flex rounded bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-950">
      {BADGE_LABELS[badge]}
    </span>
  );
}
