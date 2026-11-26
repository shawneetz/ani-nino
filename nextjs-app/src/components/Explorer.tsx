// what this file does: the shell of the /map page, a full-bleed map with floating pieces on top
//   the map fills the whole area under the header (its parent is the relative main in app/(map)/map/layout.tsx)
//   everything else is an absolute layer above it, the stacking order lives in src/lib/map-layers.ts
//   one filter path (visiblePrograms, then the search) feeds the map, the list and the count, so they never disagree
// pieces, all temporary until the stages named below replace them
//   results panel (m4, done): MapPanel, the count, search and the list
//   filter chips (m5, done): FilterChips, floating on desktop, inside the results strip on phones
//   time bar (m6): the year slider, bottom-left on desktop, the Year chip popover on phones
//   map key (m9): bottom-right, above the zoom buttons
//   place preview (m7): opens over the map, to the right of the panel on desktop
//   phone toggle (m8): a map | list switch at the bottom, the map stays mounted so it keeps its tiles
// pin or a result selects a program, "open program" leaves the page, selection lives in the url as ?sel=<slug>
// accessibility (c6.2): focus moves into the preview when it opens,
// escape closes them, and focus returns to the control that opened them
// change in this version (m2): full-bleed shell
//   the h1 is visually hidden, the main element now comes from the map layout
//   the old sticky filter bar, the list column and the fixed height calc are gone
// change in this version (m3): the map gets fit padding from useMapPadding,
//   so pins land in the part of the map the panel, time bar and toggle do not cover
//   the map key moved up so it never sits on the zoom buttons
// change in this version (m4): the panel is MapPanel and ProgramCard is gone
// change in this version (m5): chips and the q url key
//   the phone filter sheet is no longer used here
//   search text stays local and the url follows after a short wait
//   url changes restore the search box
"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFilterState } from "@/hooks/use-filter-state";
import { useMapPadding } from "@/hooks/use-map-padding";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { visiblePrograms } from "@/lib/filter";
import { LAYER } from "@/lib/map-layers";
import { matchesQuery } from "@/lib/program-search";
import { FilterChips } from "./FilterChips";
import { Legend } from "./Legend";
import { MapPanel } from "./MapPanel";
import { PreviewCard } from "./PreviewCard";
import { YearSlider } from "./YearSlider";

// the map is loaded in the browser only, with a placeholder while it loads
const PinMap = dynamic(() => import("./PinMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-stone-100" />,
});

type View = "list" | "map";

const QUERY_DELAY_MS = 250;

export function Explorer({ programs }: { programs: ExplorerProgram[] }) {
  const {
    filters,
    selected,
    query,
    setSelected,
    setQuery,
    setYear,
    toggleTopic,
    toggleProvince,
    toggleToday,
    toggleConfirmed,
    clearAll,
    clearEverything,
  } = useFilterState();

  const [text, setText] = useState(query);
  const lastWritten = useRef(query);
  const queryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [panelOpen, setPanelOpen] = useState(true); // desktop only, a phone always shows its strip
  const [view, setView] = useState<View>("list"); // phone only, desktop shows both

  // filters first, then the search, so the map, the list and the count read the same list
  const filtered = useMemo(() => visiblePrograms(programs, filters), [programs, filters]);
  const shown = useMemo(() => filtered.filter((program) => matchesQuery(program, text)), [filtered, text]);
  const selectedProgram = useMemo(() => shown.find((program) => program.slug === selected) ?? null, [shown, selected]);
  const hasToday = useMemo(() => programs.some((program) => program.era === "today"), [programs]);
  // how much of each map edge the floating pieces cover at this screen width
  const fitPadding = useMapPadding(panelOpen);

  const trigger = useRef<HTMLElement | null>(null); // the control that selected, for returning focus
  const previewRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);

  const hasFilters =
    filters.topics.length > 0 ||
    filters.provinces.length > 0 ||
    filters.year !== null ||
    (hasToday && filters.today) ||
    filters.confirmed;
  const searching = text.trim() !== "";

  // a province with no program at all (cavite) gets an explanation instead of a blank list
  // it only applies when nothing else could be hiding programs, so no search text and every picked province is empty
  const emptyProvinces = filters.provinces.filter(
    (province) => !programs.some((program) => program.places.some((place) => place.province === province)),
  );
  const explainProvinces =
    shown.length === 0 && !searching && emptyProvinces.length > 0 && emptyProvinces.length === filters.provinces.length
      ? emptyProvinces
      : [];

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

  const handleQueryChange = (value: string) => {
    setText(value);
    lastWritten.current = value;
    if (queryTimer.current) clearTimeout(queryTimer.current);
    queryTimer.current = setTimeout(() => setQuery(value), QUERY_DELAY_MS);
  };

  const clearFiltersAndSearch = () => {
    if (queryTimer.current) clearTimeout(queryTimer.current);
    lastWritten.current = "";
    setText("");
    clearEverything();
  };

  useEffect(() => {
    if (query === lastWritten.current) return;
    lastWritten.current = query;
    setText(query);
  }, [query]);

  useEffect(() => {
    return () => {
      if (queryTimer.current) clearTimeout(queryTimer.current);
    };
  }, []);

  // drop the selection when a filter or the search hides the selected program (or the url has a bad slug)
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

  // escape closes the preview, an open chip popover stops escape first
  useEffect(() => {
    if (!selectedProgram) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreview(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedProgram, closePreview]);

  // a picked pin scrolls its row into view (skipped when the list is hidden)
  useEffect(() => {
    if (!selected) return;
    const row = document.getElementById(`program-${selected}`);
    if (!row || row.offsetParent === null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [selected, view, panelOpen]);

  const renderChips = (showYear: boolean) => (
    <FilterChips
      topics={filters.topics}
      provinces={filters.provinces}
      year={filters.year}
      today={filters.today}
      confirmed={filters.confirmed}
      showToday={hasToday}
      showYear={showYear}
      hasFilters={hasFilters}
      onToggleTopic={toggleTopic}
      onToggleProvince={toggleProvince}
      onSetYear={setYear}
      onToggleConfirmed={toggleConfirmed}
      onToggleToday={toggleToday}
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
          programs={shown}
          provinces={filters.provinces}
          selectedSlug={selectedProgram?.slug ?? null}
          onSelect={(slug) => select(slug, false)}
          onClear={() => closePreview(false)}
          fitPadding={fitPadding}
        />
      </div>

      {/* layer: results panel, a floating panel on the left on desktop, a top strip on phones */}
      <MapPanel
        programs={shown}
        selectedSlug={selected}
        query={text}
        onQueryChange={handleQueryChange}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        view={view}
        chips={renderChips(true)}
        explainProvinces={explainProvinces}
        onSelect={(slug) => select(slug, true)}
        onClear={clearFiltersAndSearch}
      />

      {/* layer: filter chips on desktop, along the top and to the right of the panel */}
      <div
        className={`absolute top-3 hidden w-fit max-w-[calc(100%-1.5rem)] lg:block ${
          panelOpen ? "lg:left-[calc(clamp(20rem,30vw,26rem)+1.5rem)]" : "lg:left-52"
        } ${LAYER.popover}`}
      >
        {renderChips(false)}
      </div>

      {/* layer: time bar (temporary, m6 replaces it), desktop only, it starts to the right of the panel
          on phones the year slider lives in the Year chip popover */}
      <div
        className={`absolute bottom-3 ${
          panelOpen ? "left-[calc(clamp(20rem,30vw,26rem)+1.5rem)]" : "left-3"
        } hidden w-[22rem] rounded-xl border border-stone-400 bg-white p-3 lg:block ${LAYER.bar}`}
      >
        <YearSlider year={filters.year} onChange={setYear} showNote={hasToday} />
      </div>

      {/* layer: map key (temporary, m9 replaces it), anchored by its bottom edge so it opens upward
          it always clears the zoom buttons that sit at the bottom-right from 640px up
            phone: no zoom buttons, so it sits just above the toggle
            640px to 1024px: the zoom buttons are lifted above the toggle, so the key goes above them
            1024px and up: the toggle is gone, the zoom buttons sit at the bottom edge */}
      <div className={`absolute bottom-16 right-3 w-72 max-w-[calc(100%-1.5rem)] sm:bottom-40 lg:bottom-24 ${LAYER.panel}`}>
        <Legend showToday={hasToday} />
      </div>

      {/* layer: preview card (temporary, m7 replaces it)
          the wrapper ignores clicks, only the card takes them, so the map stays usable around it
          on desktop it starts to the right of the panel and stays above the time bar */}
      {selectedProgram && (
        <div
          className={`pointer-events-none absolute inset-0 bottom-14 lg:bottom-40 ${
            panelOpen ? "lg:left-[calc(clamp(20rem,30vw,26rem)+1.5rem)]" : "lg:left-3"
          } [&>*]:pointer-events-auto ${LAYER.sheet}`}
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

    </div>
  );
}