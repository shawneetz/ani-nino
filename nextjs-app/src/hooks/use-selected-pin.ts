"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SLUG_RE } from "@/lib/api-schemas";

export function useSelectedPin() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get("pin");
  const slug = raw && SLUG_RE.test(raw) ? raw : null;

  const go = useCallback(
    (next: URLSearchParams, mode: "push" | "replace") => {
      const query = next.toString().replace(/%2C/g, ",");
      const url = query ? `${pathname}?${query}` : pathname;
      if (mode === "push") router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [router, pathname],
  );

  const selectPin = useCallback(
    (id: string) => {
      if (!SLUG_RE.test(id)) return;
      const next = new URLSearchParams(searchParams.toString());
      next.set("pin", id);
      go(next, "push");
    },
    [searchParams, go],
  );

  const closePin = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("pin");
    go(next, "replace");
  }, [searchParams, go]);

  return { slug, selectPin, closePin };
}
