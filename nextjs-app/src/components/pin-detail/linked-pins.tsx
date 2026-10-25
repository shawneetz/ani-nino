import type { PinDetail } from "@/lib/api-schemas";
import { FAMILIES } from "@/lib/vocab";
import { LAYER_LABELS } from "./detail-labels";
import { Section } from "./section";

export function LinkedPins({
  layer,
  links,
  onSelect,
}: {
  layer: PinDetail["layer"];
  links: PinDetail["links"];
  onSelect: (pinId: string) => void;
}) {
  if (links.length === 0) return null;
  const title = layer === "martial_law" ? "Echoes today" : "Connects back to martial law";

  return (
    <Section title={title}>
      <p className="mt-1 text-xs text-neutral-700">
        <span className="mr-1 rounded bg-neutral-900 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
          My interpretation
        </span>
        These links are my reading of how the older and newer programs connect. They are not
        established findings.
      </p>
      <ul className="mt-3 space-y-2">
        {links.map(({ linkedPin, interpretationNote }) => (
          <li key={linkedPin.id}>
            <button
              type="button"
              data-linked-pin={linkedPin.id}
              onClick={() => onSelect(linkedPin.id)}
              className="w-full rounded-lg border border-neutral-300 p-3 text-left hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span className="block text-sm font-medium text-neutral-900">{linkedPin.title}</span>
              <span className="block text-xs text-neutral-600">
                {linkedPin.dateLabel} · {LAYER_LABELS[linkedPin.layer]} · {FAMILIES[linkedPin.family].label}
              </span>
              <span className="mt-1 block text-sm text-neutral-800">{interpretationNote}</span>
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}
