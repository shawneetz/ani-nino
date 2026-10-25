"use client";

import { useEffect, useState } from "react";
import { pinDetailSchema, type PinDetail } from "@/lib/api-schemas";

export type PinDetailState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; pin: PinDetail }
  | { status: "notfound" }
  | { status: "error" };

const cache = new Map<string, PinDetail>();

export function usePinDetail(slug: string | null): PinDetailState {
  const [stored, setStored] = useState<{ slug: string; state: PinDetailState } | null>(null);

  useEffect(() => {
    if (!slug || cache.has(slug)) return;

    const controller = new AbortController();

    fetch(`/api/pins/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404) {
          setStored({ slug, state: { status: "notfound" } });
          return;
        }
        if (!response.ok) throw new Error(`Pin request failed with status ${response.status}`);
        const pin = pinDetailSchema.parse(await response.json());
        cache.set(slug, pin);
        setStored({ slug, state: { status: "ready", pin } });
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setStored({ slug, state: { status: "error" } });
      });

    return () => controller.abort();
  }, [slug]);

  if (!slug) return { status: "idle" };
  const cached = cache.get(slug);
  if (cached) return { status: "ready", pin: cached };
  return stored?.slug === slug ? stored.state : { status: "loading" };
}
