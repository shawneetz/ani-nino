// What this file does: displays pin claims, sources, locations, and timeline details.
"use client";

import { useEffect, useId, useMemo, useRef, type ReactNode } from "react";
import type { PinDetail } from "@/lib/api-schemas";
import { Badge } from "@/components/badge";
import { StatusTag } from "@/components/status-tag";
import { FAMILIES, PROVINCE_LABELS } from "@/lib/vocab";
import { APPROXIMATE_PRECISIONS, formatDate, LAYER_LABELS } from "./detail-labels";
import { LinkedPins } from "./linked-pins";
import { PinTimeline } from "./pin-timeline";
import { Section } from "./section";
import { SourceList } from "./source-list";

interface FrameProps {
  titleId: string;
  title: string;
  focusKey: string;
  busy?: boolean;
  meta?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

function Frame({ titleId, title, focusKey, busy = false, meta, onClose, children }: FrameProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus into the panel when a pin finishes loading or selection changes.
  useEffect(() => {
    if (!busy) headingRef.current?.focus();
  }, [focusKey, busy]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-busy={busy}
      className="fixed inset-x-0 bottom-0 z-40 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-neutral-300 bg-white shadow-2xl lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[28rem] lg:rounded-none lg:border-l lg:border-t-0"
    >
      <div aria-hidden="true" className="mx-auto mt-2 h-1 w-10 rounded-full bg-neutral-300 lg:hidden" />
      <header className="flex items-start justify-between gap-3 border-b border-neutral-200 p-4">
        <div className="min-w-0">
          <h2
            id={titleId}
            ref={headingRef}
            tabIndex={-1}
            className="text-lg font-semibold leading-snug text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            {title}
          </h2>
          {meta}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="shrink-0 rounded-full border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Close
        </button>
      </header>
      <div className="overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {children}
      </div>
    </section>
  );
}

export function PinDetailMessage({
  title,
  message,
  busy = false,
  onClose,
}: {
  title: string;
  message: string;
  busy?: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  return (
    <Frame titleId={titleId} title={title} focusKey={title} busy={busy} onClose={onClose}>
      <p aria-live="polite" className="text-sm text-neutral-700">{message}</p>
    </Frame>
  );
}

export function PinDetailPanel({
  pin,
  onClose,
  onSelectLinked,
}: {
  pin: PinDetail;
  onClose: () => void;
  onSelectLinked: (pinId: string) => void;
}) {
  const titleId = useId();
  const sourceTitles = useMemo(
    () => Object.fromEntries(pin.sources.map((source) => [source.id, source.title])),
    [pin.sources],
  );
  const families = [pin.family, ...pin.secondaryFamilies];
  const hasContextSources = pin.sources.some((source) => source.role === "context");

  return (
    <Frame
      titleId={titleId}
      title={pin.title}
      focusKey={pin.id}
      onClose={onClose}
      meta={
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-700">
            <span className="rounded border border-neutral-300 px-1.5 py-0.5">{LAYER_LABELS[pin.layer]}</span>
            <StatusTag status={pin.status} />
            <span>{pin.dateLabel}</span>
          </div>
          {(pin.program || pin.instruments.length > 0) && (
            <p className="text-sm text-neutral-700">{[pin.program, pin.instruments.join(", ")].filter(Boolean).join(" · ")}</p>
          )}
          <ul className="flex flex-wrap gap-1.5">
            {families.map((family) => (
              <li key={family} className="flex items-center gap-1.5 rounded-full border border-neutral-300 px-2 py-0.5 text-xs text-neutral-700">
                <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: FAMILIES[family].color }} />
                {FAMILIES[family].label}
              </li>
            ))}
          </ul>
        </div>
      }
    >
      {pin.promise && (
        <Section title="What it promised">
          <p className="mt-1 text-sm text-neutral-800">{pin.promise}</p>
          <SourceList sources={pin.sources} role="promise" />
        </Section>
      )}
      <Section title="What the record shows">
        {pin.record ? <p className="mt-1 text-sm text-neutral-800">{pin.record}</p> : <p className="mt-1 text-sm text-neutral-600">No record statement yet.</p>}
        <div className="mt-2"><Badge badge={pin.badge} /></div>
        {pin.status === "lead" ? (
          <div role="note" className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
            <p className="font-semibold">Lead, not yet verified.</p>
            {pin.openQuestion && <p className="mt-1">Open question: {pin.openQuestion}</p>}
          </div>
        ) : (
          pin.verifiedOn && (
            <p className="mt-3 text-xs text-neutral-700">
              Verified on {formatDate(pin.verifiedOn)}.{pin.verificationNote ? ` ${pin.verificationNote}` : ""}
            </p>
          )
        )}
        <SourceList sources={pin.sources} role="record" />
      </Section>
      {pin.events.length > 0 && (
        <Section title="Timeline"><PinTimeline events={pin.events} sourceTitles={sourceTitles} /></Section>
      )}
      <LinkedPins layer={pin.layer} links={pin.links} onSelect={onSelectLinked} />
      {hasContextSources && (
        <Section title="Background"><SourceList sources={pin.sources} role="context" /></Section>
      )}
      {pin.locations.length > 0 && (
        <Section title="Where">
          <ul className="mt-1 space-y-1 text-sm text-neutral-800">
            {pin.locations.map((location) => (
              <li key={location.id}>
                {location.name}, {PROVINCE_LABELS[location.province]}
                {APPROXIMATE_PRECISIONS.includes(location.precision) && (
                  <span className="ml-1 text-xs text-neutral-600">(approximate area)</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </Frame>
  );
}
