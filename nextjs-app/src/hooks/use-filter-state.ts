// what this file does: keeps the filters, search text and selected program in the url
// so shared links reproduce the same view and browser navigation works
// change in this version: added "sel" (the selected program slug)
// sel is kept apart from the filters, so selecting a program never recomputes the filters
// (and so never refits the map)
// change in this version (c2): added toggleConfirmed for the confirmed only switch
// change in this version (m5): added "q" (the search text), kept apart from filters like sel
// setQuery writes q, clearAll clears filters and keeps q, clearEverything clears both
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { EMPTY_FILTERS, parseFilters, toQueryString, type Filters } from "@/lib/filter";
import type { Province, Topic } from "@/lib/vocab";

// adds the value to the list, or removes it if it is already there
function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const MAX_QUERY_LENGTH = 100;

export function useFilterState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.toString();

  // the filter key ignores sel and q on purpose
  const filterKey = useMemo(() => {
    const params = new URLSearchParams(raw);
    params.delete("sel");
    params.delete("q");
    return params.toString();
  }, [raw]);
  const filters = useMemo(() => parseFilters(new URLSearchParams(filterKey)), [filterKey]);

  // only accept slug-shaped values, anything else is ignored
  const selected = useMemo(() => {
    const value = new URLSearchParams(raw).get("sel");
    return value && /^[a-z0-9-]+$/.test(value) ? value : null;
  }, [raw]);

  const query = useMemo(() => (new URLSearchParams(raw).get("q") ?? "").slice(0, MAX_QUERY_LENGTH), [raw]);

  // writes filters, selection and search text to the url without scrolling or adding history
  const write = useCallback(
    (next: Filters, sel: string | null, q: string) => {
      const parts: string[] = [];
      const filterQuery = toQueryString(next);
      if (filterQuery) parts.push(filterQuery);
      if (q) parts.push(`q=${encodeURIComponent(q.slice(0, MAX_QUERY_LENGTH))}`);
      if (sel) parts.push(`sel=${encodeURIComponent(sel)}`);
      router.replace(parts.length ? `${pathname}?${parts.join("&")}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const latest = useRef({ filters, selected });
  useEffect(() => {
    latest.current = { filters, selected };
  });

  const setSelected = useCallback((slug: string | null) => write(filters, slug, query), [write, filters, query]);
  const setQuery = useCallback(
    (value: string) => write(latest.current.filters, latest.current.selected, value),
    [write],
  );

  return {
    filters,
    selected,
    query,
    setSelected,
    setQuery,
    setYear: (year: number | null) => write({ ...filters, year }, selected, query),
    toggleTopic: (topic: Topic) => write({ ...filters, topics: toggle(filters.topics, topic) }, selected, query),
    toggleProvince: (province: Province) =>
      write({ ...filters, provinces: toggle(filters.provinces, province) }, selected, query),
    toggleToday: () => write({ ...filters, today: !filters.today }, selected, query),
    toggleConfirmed: () => write({ ...filters, confirmed: !filters.confirmed }, selected, query),
    clearAll: () => write(EMPTY_FILTERS, selected, query),
    clearEverything: () => write(EMPTY_FILTERS, selected, ""),
  };
}
