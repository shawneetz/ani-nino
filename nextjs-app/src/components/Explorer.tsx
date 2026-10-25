"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/badge";
import { FilterControls } from "@/components/filter-controls";
import { Legend } from "@/components/legend";
import { MonthSlider } from "@/components/MonthSlider";
import { PinDetailHost } from "@/components/pin-detail/pin-detail-host";
import { StatusTag } from "@/components/status-tag";
import { useFilterState } from "@/hooks/use-filter-state";
import { useSelectedPin } from "@/hooks/use-selected-pin";
import type { ExplorerPin } from "@/lib/map-types";
import { revealPatch } from "@/lib/pin-nav";
import { DEFAULT_MONTH, isValidMonth } from "@/lib/slider";
import { visiblePinsForUi } from "@/lib/visible-for-ui";

const PinMap = dynamic(() => import("@/components/PinMap").then((module) => module.PinMap), {
  ssr: false,
  loading: () => <div className="h-[50vh] min-h-[360px] animate-pulse rounded-xl bg-neutral-200 lg:h-[70vh]" />,
});

const URL_DEBOUNCE_MS = 200;

export function Explorer({
  pins,
  familyColors,
}: {
  pins: ExplorerPin[];
  familyColors: Record<string, string>;
}) {
  const { state, setMonth: setUrlMonth, setToday } = useFilterState();
  const { slug, selectPin, closePin } = useSelectedPin();
  const urlMonth = isValidMonth(state.month) ? state.month : DEFAULT_MONTH;
  const [month, setMonth] = useState(urlMonth);
  const pendingRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setUrlMonthRef = useRef(setUrlMonth);
  const setTodayRef = useRef(setToday);

  useEffect(() => {
    setUrlMonthRef.current = setUrlMonth;
    setTodayRef.current = setToday;
  });

  useEffect(() => {
    if (pendingRef.current !== null && pendingRef.current !== urlMonth) return;
    setMonth(urlMonth);
  }, [urlMonth]);

  const handleMonthChange = useCallback((next: string) => {
    setMonth(next);
    pendingRef.current = next;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setUrlMonthRef.current(next);
      pendingRef.current = null;
    }, URL_DEBOUNCE_MS);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const visible = useMemo(
    () =>
      visiblePinsForUi(pins, {
        month,
        mode: "range",
        families: state.families,
        provinces: state.provinces,
        today: state.today,
      }),
    [pins, month, state.families, state.provinces, state.today],
  );
  const pinById = useMemo(() => new Map(pins.map((pin) => [pin.id, pin])), [pins]);
  const activeId = slug && visible.some((pin) => pin.id === slug) ? slug : null;
  const viewRef = useRef({ month, today: state.today });

  useEffect(() => {
    viewRef.current = { month, today: state.today };
  });

  useEffect(() => {
    if (!slug) return;
    const pin = pinById.get(slug);
    if (!pin) return;
    const patch = revealPatch(pin, viewRef.current);
    if (patch?.today) setTodayRef.current(true);
    if (patch?.month) handleMonthChange(patch.month);
  }, [slug, pinById, handleMonthChange]);

  const handleMapSelect = useCallback(
    (pinId: string | null) => {
      if (pinId) selectPin(pinId);
      else closePin();
    },
    [selectPin, closePin],
  );

  return (
    <div className={`mx-auto max-w-7xl space-y-4 px-4 py-6 transition-[padding] ${slug ? "lg:pr-[29rem]" : ""}`}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">A map of promises and records</h1>
        <p className="mt-1 max-w-3xl text-sm text-neutral-700">
          Explore public programs across time and place, and follow the sources behind each claim.
        </p>
      </div>
      <FilterControls />
      <MonthSlider month={month} onChange={handleMonthChange} visibleCount={visible.length} />
      {state.today && <p className="text-sm text-neutral-700">Today pins stay on the map whatever month is selected.</p>}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <PinMap
          pins={visible}
          familyColors={familyColors}
          selectedPinId={activeId}
          onSelectPin={handleMapSelect}
        />
        <section aria-labelledby="pin-list-heading" className="min-w-0">
          <h2 id="pin-list-heading" className="mb-2 text-lg font-semibold">
            <span data-testid="pin-count" data-count={visible.length}>{visible.length}</span>{" "}
            {visible.length === 1 ? "pin" : "pins"}
          </h2>
          {visible.length === 0 && (
            <p className="mb-2 text-sm text-neutral-700">
              No pins are active for this month and these filters. Move the slider or clear a filter.
            </p>
          )}
          <ul data-testid="pin-list" className="space-y-2">
            {visible.map((pin) => (
              <li key={pin.id}>
                <button
                  type="button"
                  data-testid="pin-card"
                  data-pin-id={pin.id}
                  aria-pressed={pin.id === slug}
                  aria-haspopup="dialog"
                  onClick={() => (pin.id === slug ? closePin() : selectPin(pin.id))}
                  className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-left text-neutral-900 hover:border-neutral-500 aria-pressed:border-orange-700 aria-pressed:ring-2 aria-pressed:ring-orange-700"
                >
                  <span className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 inline-block h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: familyColors[pin.family] ?? "#6b7280" }}
                    />
                    <span className="min-w-0">
                      <span className="block font-medium">{pin.title}</span>
                      <span className="block text-sm text-neutral-700">
                        {pin.dateLabel}{pin.locations.length > 1 ? ` · ${pin.locations.length} places` : ""}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-2">
                        {pin.layer === "today" && (
                          <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs font-medium text-white">Today</span>
                        )}
                        <Badge badge={pin.badge} />
                        <StatusTag status={pin.status} />
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <Legend />
      <PinDetailHost slug={slug} onSelect={selectPin} onClose={closePin} />
    </div>
  );
}
