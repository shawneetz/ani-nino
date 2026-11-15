// what this file does: the explorer at /map, built around one filter path (visiblePrograms)
// so the map, the list and the count can never disagree (c3.1 to c3.12)
//   desktop: filter bar on top, list on the left (scrolls), map fills the rest
//   phone: sticky bar with a filters button (opens a bottom sheet), a map | list toggle
//          at the bottom (default list), the map stays mounted so it keeps its tiles
//   pin or "show on map" selects a program, a preview card opens, "open program" leaves the page
//   selection lives in the url as ?sel=<slug>
// accessibility (c6.2): focus moves into the preview and the sheet when they open,
// escape closes them, and focus returns to the control that opened them
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFilterState } from "@/hooks/use-filter-state";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { visiblePrograms } from "@/lib/filter";
import { PROVINCE_LABELS } from "@/lib/vocab";
import { FilterControls } from "./filter-controls";
import { FilterSheet } from "./FilterSheet";
import { Legend } from "./legend";
import { PreviewCard } from "./PreviewCard";
import { ProgramCard } from "./program-card";
import { YearSlider } from "./YearSlider";

// the map is loaded in the browser only, with a placeholder while it loads
const PinMap = dynamic(() => import("./PinMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse rounded-lg bg-stone-100" />,
});

type View = "list" | "map";

export function Explorer({ programs }: { programs: ExplorerProgram[] }) {
  const { filters, selected, setSelected, setYear, toggleTopic, toggleProvince, toggleToday, clearAll } = useFilterState();
  const visible = useMemo(() => visiblePrograms(programs, filters), [programs, filters]);
  const selectedProgram = useMemo(() => visible.find((program) => program.slug === selected) ?? null, [visible, selected]);

  const [view, setView] = useState<View>("list"); // phone only, desktop shows both
  const [sheetOpen, setSheetOpen] = useState(false);
  const trigger = useRef<HTMLElement | null>(null); // the control that selected, for returning focus
  const previewRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  const filtersButton = useRef<HTMLButtonElement>(null);

  const activeCount = filters.topics.length + filters.provinces.length + (filters.year !== null ? 1 : 0) + (filters.today ? 1 : 0);
  const hasFilters = activeCount > 0;
  const countText = visible.length === 1 ? "program" : "programs";

  // a province with no program at all (cavite) gets an explanation instead of a blank list
  const emptyProvinces = filters.provinces.filter(
    (province) => !programs.some((program) => program.places.some((place) => place.province === province)),
  );
  const explainProvince = visible.length === 0 && emptyProvinces.length > 0 && emptyProvinces.length === filters.provinces.length;

  const select = useCallback(
    (slug: string, showMap: boolean) => {
      trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      moveFocus.current = true;
      setSelected(slug);
      if (showMap) setView("map");
    },
    [setSelected],
  );

  const closePreview = useCallback(
    (restoreFocus: boolean) => {
      setSelected(null);
      if (restoreFocus && trigger.current?.isConnected) trigger.current.focus();
    },
    [setSelected],
  );

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    requestAnimationFrame(() => filtersButton.current?.focus());
  }, []);

  // drop the selection when a filter hides the selected program (or the url has a bad slug)
  useEffect(() => {
    if (selected && !selectedProgram) setSelected(null);
  }, [selected, selectedProgram, setSelected]);

  // move focus into the preview after the reader selects something (not on page load)
  useEffect(() => {
    if (!selectedProgram || !moveFocus.current) return;
    const node = previewRef.current;
    if (node && node.offsetParent !== null) node.focus();
    moveFocus.current = false;
  }, [selectedProgram, view]);

  // escape closes the preview, the sheet and the picker handle their own escape
  useEffect(() => {
    if (!selectedProgram || sheetOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreview(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedProgram, sheetOpen, closePreview]);

  // a picked pin scrolls its card into view (skipped when the list is hidden)
  useEffect(() => {
    if (!selected) return;
    const card = document.getElementById(`program-${selected}`);
    if (!card || card.offsetParent === null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [selected, view]);

  // the same controls are used in the desktop bar and in the phone sheet
  const controls = (layout: "row" | "stack", showClear: boolean) => (
    <FilterControls
      layout={layout}
      topics={filters.topics}
      provinces={filters.provinces}
      today={filters.today}
      hasFilters={showClear && hasFilters}
      onToggleTopic={toggleTopic}
      onToggleProvince={toggleProvince}
      onToggleToday={toggleToday}
      onClear={clearAll}
    />
  );

  return (
    <div className="flex flex-col gap-3 lg:h-[calc(100dvh-10rem)] lg:min-h-[560px]">
      {/* sticky filter bar: full controls on desktop, a filters button on phones */}
      <div className="sticky top-0 z-30 -mx-4 space-y-2 border-b border-stone-200 bg-background/95 px-4 py-2 backdrop-blur lg:static lg:mx-0 lg:px-0">
        <div className="hidden gap-x-8 lg:grid lg:grid-cols-[minmax(0,1fr)_26rem]">
          {controls("row", true)}
          <YearSlider year={filters.year} onChange={setYear} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            ref={filtersButton}
            type="button"
            aria-haspopup="dialog"
            onClick={() => setSheetOpen(true)}
            className="tap-target rounded-lg border border-stone-400 bg-white px-4 text-base font-medium lg:hidden"
          >
            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
          <p role="status" data-testid="result-count" className="text-base text-stone-800">
            <strong>{visible.length}</strong> {countText}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:flex-row">
        {/* list: left panel on desktop, its own view on phones */}
        <section
          aria-label="Programs"
          className={`${view === "list" ? "block" : "hidden"} space-y-3 lg:block lg:w-[440px] lg:shrink-0 lg:overflow-y-auto lg:pr-1`}
        >
          {visible.length > 0 ? (
            visible.map((program) => (
              <ProgramCard
                key={program.slug}
                program={program}
                selected={program.slug === selected}
                onShowOnMap={(slug) => select(slug, true)}
              />
            ))
          ) : explainProvince ? (
            <div className="space-y-2 rounded-card border border-dashed border-stone-400 p-4">
              <p className="text-lg font-semibold">
                No {emptyProvinces.map((province) => PROVINCE_LABELS[province]).join(" or ")} program yet
              </p>
              <p className="leading-relaxed text-stone-800">
                No martial-law farm program in this province has been researched yet.
              </p>
              <Link href="/sources#gap-cavite-not-covered" className="tap-target inline-flex items-center underline underline-offset-2">
                Here is why
              </Link>
            </div>
          ) : (
            <div className="space-y-2 rounded-card border border-dashed border-stone-400 p-4">
              <p className="text-lg font-semibold">No programs match these filters</p>
              <button type="button" onClick={clearAll} className="tap-target underline underline-offset-2">
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* map: right side on desktop, its own view on phones */}
        <div className={`${view === "map" ? "flex" : "hidden"} min-h-0 flex-1 flex-col gap-2 lg:flex`}>
          <div className="relative min-h-[60dvh] flex-1 lg:min-h-0">
            <PinMap
              programs={visible}
              provinces={filters.provinces}
              selectedSlug={selectedProgram?.slug ?? null}
              onSelect={(slug) => select(slug, false)}
              onClear={() => closePreview(false)}
            />
            {selectedProgram && (
              <PreviewCard program={selectedProgram} containerRef={previewRef} onClose={() => closePreview(true)} />
            )}
          </div>
          <Legend />
        </div>
      </div>

      {/* phone view toggle: sticky inside the explorer, so it never covers the footer */}
      <div className="sticky bottom-0 z-30 -mx-4 border-t border-stone-200 bg-white px-4 py-2 lg:hidden">
        <div role="group" aria-label="Show" className="mx-auto grid max-w-sm grid-cols-2 gap-2">
          {(["map", "list"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={`tap-target rounded-lg border-2 text-base font-medium ${
                view === option ? "border-accent bg-accent text-white" : "border-stone-400 bg-white text-stone-900"
              }`}
            >
              {option === "map" ? "Map" : "List"}
            </button>
          ))}
        </div>
      </div>

      <FilterSheet open={sheetOpen} resultCount={visible.length} hasFilters={hasFilters} onClose={closeSheet} onClear={clearAll}>
        {controls("stack", false)}
        <YearSlider year={filters.year} onChange={setYear} />
      </FilterSheet>
    </div>
  );
}
