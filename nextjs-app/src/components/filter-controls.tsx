// What this file does: lets readers filter pins by date, family, province, and layer.
"use client";

import { PROVINCES } from "@/lib/enums";
import type { Province } from "@/lib/enums";
import { useFilterState } from "@/hooks/use-filter-state";
import { FAMILIES, PROVINCE_LABELS, type Family } from "@/lib/vocab";

export function FilterControls() {
  // The shared hook keeps each control in sync with the URL.
  const { state, setToday, toggleFamily, toggleProvince, clearFilters } = useFilterState();

  return (
    <section aria-label="Pin filters" className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Explore the map</h2>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded px-2 py-1 text-sm underline underline-offset-2 focus-visible:outline focus-visible:outline-2"
        >
          Clear filters
        </button>
      </div>
      <label className="mt-3 inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          role="switch"
          checked={state.today}
          onChange={(event) => setToday(event.currentTarget.checked)}
        />
        Include Today pins
      </label>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Program family</legend>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {(Object.entries(FAMILIES) as [Family, (typeof FAMILIES)[Family]][]).map(([key, family]) => (
              <label key={key} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={state.families.includes(key)}
                  onChange={() => toggleFamily(key)}
                />
                {family.label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Province</legend>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {PROVINCES.map((province: Province) => (
              <label key={province} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={state.provinces.includes(province)}
                  onChange={() => toggleProvince(province)}
                />
                {PROVINCE_LABELS[province]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </section>
  );
}
