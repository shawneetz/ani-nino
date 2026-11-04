// What this file does: explains the map for readers: program-family colors,
// what the three marker styles mean (verified, lead, approximate area),
// and the four evidence labels. All wording comes from vocab.ts.
import { BADGES } from "@/lib/enums";
import { BADGE_DEFINITIONS, BADGE_LABELS, FAMILIES, type Family } from "@/lib/vocab";

export function Legend() {
  return (
    <section aria-labelledby="legend-heading" className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 id="legend-heading" className="text-sm font-semibold">Map legend</h2>

      {/* Colors = program family. */}
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
        {(Object.entries(FAMILIES) as [Family, (typeof FAMILIES)[Family]][]).map(([key, family]) => (
          <li key={key} className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ backgroundColor: family.color }} />
            {family.label}
          </li>
        ))}
      </ul>

      {/* Marker shapes = how sure we are and how precise the place is. */}
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-700">
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full border-2 border-white bg-neutral-700 shadow" />
          Verified
        </li>
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full border-[3px] border-neutral-700 bg-white" />
          Lead (not yet verified)
        </li>
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full border-[3px] border-dashed border-neutral-900 bg-neutral-300" />
          Approximate area
        </li>
      </ul>

      {/* Evidence labels shown on each pin. */}
      <dl className="mt-3 grid gap-x-6 gap-y-1 text-xs text-neutral-600 sm:grid-cols-2">
        {BADGES.map((badge) => (
          <div key={badge}>
            <dt className="inline font-semibold text-neutral-800">{BADGE_LABELS[badge]}: </dt>
            <dd className="inline">{BADGE_DEFINITIONS[badge]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
