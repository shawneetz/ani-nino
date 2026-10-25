// What this file does: explains the colors used for program families on the map.
import { FAMILIES, type Family } from "@/lib/vocab";

export function Legend() {
  return (
    <section aria-labelledby="legend-heading" className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 id="legend-heading" className="text-sm font-semibold">Map legend</h2>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
        {(Object.entries(FAMILIES) as [Family, (typeof FAMILIES)[Family]][]).map(([key, family]) => (
          <li key={key} className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ backgroundColor: family.color }} />
            {family.label}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-neutral-600">Approximate locations are identified in pin details.</p>
    </section>
  );
}
