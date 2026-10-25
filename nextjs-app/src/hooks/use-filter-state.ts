"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PROVINCES } from "@/lib/enums";
import type { Province } from "@/lib/enums";
import { DEFAULT_MONTH, isValidMonth } from "@/lib/slider";
import { FAMILIES, type Family } from "@/lib/vocab";

function values<T extends string>(raw: string | null, allowed: readonly T[]): T[] {
  return raw?.split(",").filter((value): value is T => allowed.includes(value as T)) ?? [];
}

export function useFilterState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(() => {
    const monthParam = searchParams.get("month");
    return {
      month: monthParam && isValidMonth(monthParam) ? monthParam : DEFAULT_MONTH,
      today: ["1", "true"].includes(searchParams.get("today") ?? ""),
      families: values(searchParams.get("family"), Object.keys(FAMILIES) as Family[]),
      provinces: values(searchParams.get("province"), PROVINCES),
    };
  }, [searchParams]);

  const update = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      const query = next.toString().replace(/%2C/g, ",");
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setMonth = useCallback(
    (month: string) => update("month", month === DEFAULT_MONTH ? null : month),
    [update],
  );
  const setToday = useCallback((today: boolean) => update("today", today ? "1" : null), [update]);
  const toggleFamily = useCallback(
    (family: Family) => {
      const next = state.families.includes(family)
        ? state.families.filter((item) => item !== family)
        : [...state.families, family];
      update("family", next.length ? next.join(",") : null);
    },
    [state.families, update],
  );
  const toggleProvince = useCallback(
    (province: Province) => {
      const next = state.provinces.includes(province)
        ? state.provinces.filter((item) => item !== province)
        : [...state.provinces, province];
      update("province", next.length ? next.join(",") : null);
    },
    [state.provinces, update],
  );
  const clearFilters = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("family");
    next.delete("province");
    next.delete("today");
    const query = next.toString().replace(/%2C/g, ",");
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return { state, setMonth, setToday, toggleFamily, toggleProvince, clearFilters };
}
