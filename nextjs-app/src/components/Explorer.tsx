// what this file does: the shell of the /map page, a full-bleed map with floating pieces on top
//   the map fills the whole area under the header (its parent is the relative main in app/(map)/map/layout.tsx)
//   everything else is an absolute layer above it, the stacking order lives in src/lib/map-layers.ts
//   one filter path (visiblePrograms) feeds the map, the list and the count, so they never disagree
// pieces, all temporary until the stages named below replace them
//   results panel (m4): the count, the filter controls and the list, a left panel on desktop, the top strip
//     and the list view on phones, there is only one count in the page
//   time bar (m6): the year slider, bottom-left on desktop, inside the filter sheet on phones
//   map key (m9): bottom-right, above the zoom buttons
//   place preview (m7): opens over the map, to the right of the panel on desktop
//   phone toggle (m8): a map | list switch at the bottom, the map stays mounted so it keeps its tiles
// pin or "show on map" selects a program, "open program" leaves the page, selection lives in the url as ?sel=<slug>
// accessibility (c6.2): focus moves into the preview and the sheet when they open,
// escape closes them, and focus returns to the control that opened them
// change in this version (m2): full-bleed shell
//   the h1 is visually hidden, the main element now comes from the map layout
//   the old sticky filter bar, the list column and the fixed height calc are gone
// change in this version (m3): the map gets fit padding from useMapPadding,
//   so pins land in the part of the map the panel, time bar and toggle do not cover
//   the map key moved up so it never sits on the zoom buttons
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFilterState } from "@/hooks/use-filter-state";
import { useMapPadding } from "@/hooks/use-map-padding";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { visiblePrograms } from "@/lib/filter";
import { LAYER } from "@/lib/map-layers";
import { PROVINCE_LABELS } from "@/lib/vocab";
import { FilterControls } from "./FilterControls";
import { FilterSheet } from "./FilterSheet";
import { Legend } from "./Legend";
import { PreviewCard } from "./PreviewCard";
import { ProgramCard } from "./ProgramCard";
import { YearSlider } from "./YearSlider";

// the map is loaded in the browser only, with a placeholder while it loads
const PinMap = dynamic(() => import("./PinMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-stone-100" />,
});

type View = "list" | "map";

export function Explorer({ programs }: { programs: ExplorerProgram[] }) {
  const {
    filters,
    selected,
    setSelected,
    setYear,
    toggleTopic,
    toggleProvince,
    toggleToday,
    toggleConfirmed,
    clearAll,
  } = useFilterState();
  const visible = useMemo(() => visiblePrograms(programs, filters), [programs, filters]);
  const selectedProgram = useMemo(() => visible.find((program) => program.slug === selected) ?? null, [visible, selected]);
  const hasToday = useMemo(() => programs.some((program) => program.era === "today"), [programs]);
  // how much of each map edge the floating pieces cover at this screen width
  const fitPadding = useMapPadding();

  const [view, setView] = useState<View>("list"); // phone only, desktop shows both
  const [sheetOpen, setSheetOpen] = useState(false);
  const trigger = useRef<HTMLElement | null>(null); // the control that selected, for returning focus
  const previewRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  const filtersButton = useRef<HTMLButtonElement>(null);

  const activeCount =
    filters.topics.length +
    filters.provinces.length +
    (filters.year !== null ? 1 : 0) +
    (hasToday && filters.today ? 1 : 0) +
    (filters.confirmed ? 1 : 0);
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

  // the same controls are used in the desktop panel and in the phone sheet
  const controls = (showClear: boolean) => (
    <FilterControls
      layout="stack"
      topics={filters.topics}
      provinces={filters.provinces}
      today={filters.today}
      confirmed={filters.confirmed}
      showToday={hasToday}
      hasFilters={showClear && hasFilters}
      onToggleTopic={toggleTopic}
      onToggleProvince={toggleProvince}
      onToggleToday={toggleToday}
      onToggleConfirmed={toggleConfirmed}
      onClear={clearAll}
    />
  );

  return (
    // fills the relative main of the map layout, every child below is a layer
    <div className="absolute inset-0">
      {/* the page needs one h1, the map has no visible heading */}
      <h1 className="sr-only">Explore the map</h1>

      {/* layer: the map, always mounted, always the full area */}
      <div className={`absolute inset-0 ${LAYER.map}`}>
        <PinMap
          programs={visible}
          provinces={filters.provinces}
          selectedSlug={selectedProgram?.slug ?? null}
          onSelect={(slug) => select(slug, false)}
          onClear={() => closePreview(false)}
          fitPadding={fitPadding}
        />
      </div>

      {/* layer: results panel (temporary, m4 replaces it)
          desktop: a floating panel on the left, phone: a top strip that grows into the list view */}
      <aside
        className={`absolute inset-x-0 top-0 flex flex-col border-b border-stone-300 ${LAYER.panel} ${
          view === "list" ? "bottom-14 bg-background" : "bg-background/95 backdrop-blur"
        } lg:inset-x-auto lg:left-3 lg:top-3 lg:bottom-3 lg:w-[clamp(20rem,30vw,26rem)] lg:rounded-xl lg:border lg:bg-white lg:shadow-lg lg:backdrop-blur-none`}
      >
        {/* header: the filters button on phones and the one live count */}
        <div className="flex items-center justify-between gap-3 px-4 py-2 lg:border-b lg:border-stone-200">
          <button
            ref={filtersButton}
            type="button"
            aria-haspopup="dialog"
            onClick={() => setSheetOpen(true)}
            className="tap-target rounded-lg border border-stone-400 bg-white px-4 font-sans text-base font-medium lg:hidden"
          >
            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
          <p role="status" data-testid="result-count" className="figures font-sans text-base text-stone-800">
            <strong>{visible.length}</strong> {countText}
          </p>
        </div>

        {/* desktop only: the filter controls, scroll inside the panel when they get tall */}
        <div className="hidden max-h-[45%] overflow-y-auto border-b border-stone-200 px-4 py-3 lg:block">
          {controls(true)}
        </div>

        {/* list: its own view on phones, always visible on desktop */}
        <section
          aria-label="Programs"
          className={`${view === "list" ? "block" : "hidden"} min-h-0 flex-1 space-y-3 overflow-y-auto p-3 lg:block`}
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
      </aside>

      {/* layer: time bar (temporary, m6 replaces it), desktop only, it starts to the right of the panel
          on phones the year slider lives inside the filter sheet */}
      <div
        className={`absolute bottom-3 left-[calc(clamp(20rem,30vw,26rem)+1.5rem)] hidden w-[22rem] rounded-xl border border-stone-300 bg-white p-3 shadow-lg lg:block ${LAYER.bar}`}
      >
        <YearSlider year={filters.year} onChange={setYear} showNote={hasToday} />
      </div>

      {/* layer: map key (temporary, m9 replaces it), anchored by its bottom edge so it opens upward
          it always clears the zoom buttons that sit at the bottom-right from 640px up
            phone: no zoom buttons, so it sits just above the toggle
            640px to 1024px: the zoom buttons are lifted above the toggle, so the key goes above them
            1024px and up: the toggle is gone, the zoom buttons sit at the bottom edge */}
      <div className={`absolute bottom-16 right-3 w-72 max-w-[calc(100%-1.5rem)] sm:bottom-48 lg:bottom-32 ${LAYER.panel}`}>
        <Legend showToday={hasToday} />
      </div>

      {/* layer: preview card (temporary, m7 replaces it)
          the wrapper ignores clicks, only the card takes them, so the map stays usable around it
          on desktop it starts to the right of the panel and stays above the time bar */}
      {selectedProgram && (
        <div
          className={`pointer-events-none absolute inset-0 bottom-14 lg:bottom-40 lg:left-[calc(clamp(20rem,30vw,26rem)+1.5rem)] [&>*]:pointer-events-auto ${LAYER.sheet}`}
        >
          <PreviewCard program={selectedProgram} containerRef={previewRef} onClose={() => closePreview(true)} />
        </div>
      )}

      {/* layer: phone toggle (temporary, m8 replaces it) */}
      <div className={`absolute inset-x-0 bottom-0 border-t border-stone-200 bg-white px-4 py-2 lg:hidden ${LAYER.bar}`}>
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
        {controls(false)}
        <YearSlider year={filters.year} onChange={setYear} showNote={hasToday} />
      </FilterSheet>
    </div>
  );
}
