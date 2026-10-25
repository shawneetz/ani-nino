// What this file does: loads the selected pin and returns focus when its panel closes.
"use client";

import { useEffect, useRef } from "react";
import { usePinDetail } from "@/hooks/use-pin-detail";
import { PinDetailMessage, PinDetailPanel } from "./pin-detail-panel";

export function PinDetailHost({
  slug,
  onSelect,
  onClose,
}: {
  slug: string | null;
  onSelect: (pinId: string) => void;
  onClose: () => void;
}) {
  const state = usePinDetail(slug);
  const triggerRef = useRef<HTMLElement | null>(null);
  const lastSlugRef = useRef<string | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const isOpen = slug !== null;
    if (isOpen && !wasOpenRef.current) {
      // Remember the control that opened the panel so keyboard focus can return to it.
      const active = document.activeElement;
      triggerRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
    }
    if (!isOpen && wasOpenRef.current) {
      const fallback = lastSlugRef.current
        ? document.querySelector<HTMLElement>(`[data-pin-id="${lastSlugRef.current}"]`)
        : null;
      const target = triggerRef.current?.isConnected ? triggerRef.current : fallback;
      target?.focus();
    }
    if (slug) lastSlugRef.current = slug;
    wasOpenRef.current = isOpen;
  }, [slug]);

  if (!slug) return null;
  if (state.status === "ready" && state.pin.id === slug) {
    return <PinDetailPanel pin={state.pin} onClose={onClose} onSelectLinked={onSelect} />;
  }
  if (state.status === "notfound") {
    return (
      <PinDetailMessage
        title="Pin not found"
        message="This link points to a pin that does not exist. It may have been renamed."
        onClose={onClose}
      />
    );
  }
  if (state.status === "error") {
    return (
      <PinDetailMessage
        title="Could not load this pin"
        message="Something went wrong while loading the details. Please try again."
        onClose={onClose}
      />
    );
  }
  return <PinDetailMessage title="Loading pin" message="Loading details…" busy onClose={onClose} />;
}
