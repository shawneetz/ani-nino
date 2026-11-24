// what this file does: keeps the filters and the selected program in the url so shared
// links reproduce the same view and browser navigation works
// change in this version: added "sel" (the selected program slug)
// sel is kept apart from the filters, so selecting a program never recomputes the filters
// (and so never refits the map)
// change in this version (c2): added toggleConfirmed for the confirmed only switch
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { EMPTY_FILTERS, parseFilters, toQueryString, type Filters } from "@/lib/filter";
import type { Province, Topic } from "@/lib/vocab";

// adds the value to the list, or removes it if it is already there
function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function useFilterState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.toString();

  // the filter key ignores sel on purpose
  const filterKey = useMemo(() => {
    const params = new URLSearchParams(raw);
    params.delete("sel");
    return params.toString();
  }, [raw]);
  const filters = useMemo(() => parseFilters(new URLSearchParams(filterKey)), [filterKey]);

  // only accept slug-shaped values, anything else is ignored
  const selected = useMemo(() => {
    const value = new URLSearchParams(raw).get("sel");
    return value && /^[a-z0-9-]+$/.test(value) ? value : null;
  }, [raw]);

  // writes filters and selection to the url without scrolling or adding history
  const write = useCallback(
    (next: Filters, sel: string | null) => {
      const parts: string[] = [];
      const query = toQueryString(next);
      if (query) parts.push(query);
      if (sel) parts.push(`sel=${encodeURIComponent(sel)}`);
      router.replace(parts.length ? `${pathname}?${parts.join("&")}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const setSelected = useCallback((slug: string | null) => write(filters, slug), [write, filters]);

  return {
    filters,
    selected,
    setSelected,
    setYear: (year: number | null) => write({ ...filters, year }, selected),
    toggleTopic: (topic: Topic) => write({ ...filters, topics: toggle(filters.topics, topic) }, selected),
    toggleProvince: (province: Province) =>
      write({ ...filters, provinces: toggle(filters.provinces, province) }, selected),
    toggleToday: () => write({ ...filters, today: !filters.today }, selected),
    toggleConfirmed: () => write({ ...filters, confirmed: !filters.confirmed }, selected),
    clearAll: () => write(EMPTY_FILTERS, selected),
  };
}
