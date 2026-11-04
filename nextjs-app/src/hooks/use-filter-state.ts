// What this file does: keeps the filters in the URL so shared links reproduce
// the same view and browser navigation works.
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { EMPTY_FILTERS, parseFilters, toQueryString, type Filters } from "@/lib/filter";
import type { Province, Topic } from "@/lib/vocab";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function useFilterState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = searchParams.toString();
  const filters = useMemo(() => parseFilters(new URLSearchParams(key)), [key]);

  const apply = useCallback((next: Filters) => {
    const qs = toQueryString(next);
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname]);

  return {
    filters,
    setYear: (year: number | null) => apply({ ...filters, year }),
    toggleTopic: (topic: Topic) => apply({ ...filters, topics: toggle(filters.topics, topic) }),
    toggleProvince: (province: Province) => apply({ ...filters, provinces: toggle(filters.provinces, province) }),
    clearAll: () => apply(EMPTY_FILTERS),
  };
}
