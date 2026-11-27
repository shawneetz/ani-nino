"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFilterState } from "@/hooks/use-filter-state";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { useIsWide } from "@/hooks/use-is-wide";
import { useMapPadding } from "@/hooks/use-map-padding";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { visiblePrograms } from "@/lib/filter";
import type { SheetSize } from "@/lib/fit-padding";
import { LAYER } from "@/lib/map-layers";
import { matchesQuery } from "@/lib/program-search";
import { yearCounts } from "@/lib/year-counts";
import { BottomSheet } from "./BottomSheet";
import { FilterChips } from "./FilterChips";
import { Legend } from "./Legend";
import { ListPill } from "./ListPill";
import { MapPanel } from "./MapPanel";
import type { SpotPick } from "./PinMap";
import { PlaceDrawer } from "./PlaceDrawer";
import { TimeBar } from "./TimeBar";

const PinMap = dynamic(() => import("./PinMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-stone-100" />,
});

const QUERY_DELAY_MS = 250;
const AFTER_PANEL = "left-[calc(clamp(20rem,30vw,26rem)+1.5rem)]";

export function Explorer({ programs }: { programs: ExplorerProgram[] }) {
  const {
    filters, selected, query, setSelected, setQuery, setYear,
    toggleTopic, toggleProvince, toggleToday, toggleConfirmed, clearAll, clearEverything,
  } = useFilterState();

  const isDesktop = useIsDesktop();
  const isWide = useIsWide();
  const [text, setText] = useState(query);
  const lastWritten = useRef(query);
  const queryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [sheetSize, setSheetSize] = useState<SheetSize>("peek");
  const [spot, setSpot] = useState<SpotPick | null>(null);

  const filtered = useMemo(() => visiblePrograms(programs, filters), [programs, filters]);
  const shown = useMemo(() => filtered.filter((program) => matchesQuery(program, text)), [filtered, text]);
  const selectedProgram = useMemo(() => shown.find((program) => program.slug === selected) ?? null, [shown, selected]);
  const hasToday = useMemo(() => programs.some((program) => program.era === "today"), [programs]);
  const searched = useMemo(() => programs.filter((program) => matchesQuery(program, text)), [programs, text]);
  const counts = useMemo(() => yearCounts(searched, filters), [searched, filters]);

  const activeSpot = useMemo(
    () => (spot && shown.some((program) => spot.slugs.includes(program.slug)) ? spot : null),
    [spot, shown],
  );
  const listed = useMemo(
    () => (activeSpot ? shown.filter((program) => activeSpot.slugs.includes(program.slug)) : shown),
    [shown, activeSpot],
  );
  const pool = selectedProgram && listed.includes(selectedProgram) ? listed : shown;

  const drawerOpen = selectedProgram !== null;
  const panelShown = panelOpen && !(drawerOpen && isWide === false);
  const fitPadding = useMapPadding(panelShown, sheetSize, drawerOpen);

  const trigger = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moveFocus = useRef(false);
  const returnTo = useRef<string | null>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const panelFocus = useRef<"pill" | "panel" | null>(null);

  const hasFilters =
    filters.topics.length > 0 ||
    filters.provinces.length > 0 ||
    filters.year !== null ||
    (hasToday && filters.today) ||
    filters.confirmed;
  const searching = text.trim() !== "";

  const emptyProvinces = filters.provinces.filter(
    (province) => !programs.some((program) => program.places.some((place) => place.province === province)),
  );
  const explainProvinces =
    shown.length === 0 && !searching && emptyProvinces.length > 0 && emptyProvinces.length === filters.provinces.length
      ? emptyProvinces
      : [];

  const select = useCallback(
    (slug: string) => {
      trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      moveFocus.current = true;
      setSelected(slug);
    },
    [setSelected],
  );

  const selectFromPin = useCallback(
    (slug: string) => {
      setSpot(null);
      select(slug);
    },
    [select],
  );

  const pickSpot = useCallback((next: SpotPick) => {
    setSpot(next);
    setPanelOpen(true);
    setSheetSize((size) => (size === "peek" ? "half" : size));
  }, []);

  const closePreview = useCallback(
    (restoreFocus: boolean) => {
      moveFocus.current = false;
      returnTo.current = restoreFocus ? selected : null;
      setSelected(null);
    },
    [selected, setSelected],
  );

  const stepSelected = useCallback(
    (direction: 1 | -1) => {
      if (!selectedProgram || pool.length === 0) return;
      const index = pool.indexOf(selectedProgram);
      const next = pool[(index + direction + pool.length) % pool.length];
      setSelected(next.slug);
    },
    [pool, selectedProgram, setSelected],
  );

  const changePanel = (open: boolean) => {
    panelFocus.current = open ? "panel" : "pill";
    setPanelOpen(open);
  };

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
    setSpot(null);
    clearEverything();
  };

  useEffect(() => {
    if (query === lastWritten.current) return;
    lastWritten.current = query;
    setText(query);
  }, [query]);

  useEffect(() => () => {
    if (queryTimer.current) clearTimeout(queryTimer.current);
  }, []);

  useEffect(() => {
    if (selected && !selectedProgram) setSelected(null);
  }, [selected, selectedProgram, setSelected]);

  useEffect(() => {
    if (panelFocus.current === "pill") pillRef.current?.focus();
    if (panelFocus.current === "panel") panelRef.current?.focus();
    panelFocus.current = null;
  }, [panelOpen]);

  useEffect(() => {
    if (!selectedProgram || !moveFocus.current) return;
    const node = headingRef.current;
    if (!node || node.offsetParent === null) return;
    node.focus();
    moveFocus.current = false;
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedProgram || !returnTo.current) return;
    const slug = returnTo.current;
    returnTo.current = null;
    const row = document.getElementById(`program-${slug}`)?.querySelector("button");
    if (row instanceof HTMLElement && row.offsetParent !== null) row.focus();
    else if (trigger.current?.isConnected) trigger.current.focus();
  }, [selectedProgram]);

  useEffect(() => {
    if (!selectedProgram) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreview(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedProgram, closePreview]);

  useEffect(() => {
    if (!selected) return;
    const row = document.getElementById(`program-${selected}`);
    if (!row || row.offsetParent === null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [selected, isDesktop, sheetSize, panelShown]);

  const renderChips = (showYear: boolean) => (
    <FilterChips
      topics={filters.topics}
      provinces={filters.provinces}
      year={filters.year}
      confirmed={filters.confirmed}
      today={filters.today}
      showToday={hasToday}
      showYear={showYear}
      hasFilters={hasFilters}
      onToggleTopic={toggleTopic}
      onToggleProvince={toggleProvince}
      onSetYear={setYear}
      onToggleConfirmed={toggleConfirmed}
      onToggleToday={toggleToday}
      onClear={() => {
        setSpot(null);
        clearAll();
      }}
    />
  );

  const freeLeft = panelShown ? AFTER_PANEL : "left-3";

  return (
    <div className="absolute inset-0">
      <div inert={drawerOpen} className="absolute inset-0">
        <h1 className="sr-only">Explore the map</h1>
        <div className={`absolute inset-0 ${LAYER.map}`}>
          <PinMap
            programs={shown}
            provinces={filters.provinces}
            selectedSlug={selectedProgram?.slug ?? null}
            activeSpotKey={activeSpot?.key ?? null}
            onSelect={selectFromPin}
            onSelectGroup={pickSpot}
            onClear={() => {
              setSpot(null);
              closePreview(false);
            }}
            fitPadding={fitPadding}
          />
        </div>

        {isDesktop === true && (
          <>
            {panelShown && (
              <MapPanel
                programs={listed}
                selectedSlug={selectedProgram?.slug ?? null}
                panelRef={panelRef}
                query={text}
                onQueryChange={handleQueryChange}
                onCollapse={() => changePanel(false)}
                explainProvinces={explainProvinces}
                spot={activeSpot ? { name: activeSpot.name, onClear: () => setSpot(null) } : null}
                onSelect={select}
                onClear={clearFiltersAndSearch}
              />
            )}
            <div
              className={`pointer-events-none absolute right-3 top-3 flex items-center gap-2 ${panelShown ? AFTER_PANEL : "left-3"} ${LAYER.popover}`}
            >
              {!panelShown && <ListPill count={listed.length} buttonRef={pillRef} onOpen={() => changePanel(true)} />}
              <div className="pointer-events-auto w-fit min-w-0">{renderChips(false)}</div>
            </div>
            <div className={`pointer-events-none absolute bottom-3 right-34 flex justify-center ${freeLeft} ${LAYER.bar}`}>
              <div className="pointer-events-auto w-full max-w-4xl">
                <TimeBar year={filters.year} onChange={setYear} showNote={hasToday} counts={counts} />
              </div>
            </div>
          </>
        )}

        {isDesktop === false && (
          <>
            <div className={`absolute inset-x-0 top-0 px-3 pt-3 ${LAYER.popover}`}>{renderChips(true)}</div>
            <BottomSheet
              size={sheetSize}
              onSizeChange={setSheetSize}
              programs={listed}
              selectedSlug={selectedProgram?.slug ?? null}
              query={text}
              onQueryChange={handleQueryChange}
              explainProvinces={explainProvinces}
              spot={activeSpot ? { name: activeSpot.name, onClear: () => setSpot(null) } : null}
              onSelect={select}
              onClear={clearFiltersAndSearch}
            />
          </>
        )}

        {isDesktop !== null && (
          // the key sits above the zoom buttons and the attribution
          <div className={`absolute bottom-40 right-3 sm:bottom-64 lg:bottom-32 ${LAYER.panel}`}>
            <Legend showToday={hasToday} />
          </div>
        )}
      </div>

      {selectedProgram && (
        <PlaceDrawer
          program={selectedProgram}
          position={pool.indexOf(selectedProgram) + 1}
          total={pool.length}
          headingRef={headingRef}
          onClose={() => closePreview(true)}
          onPrev={() => stepSelected(-1)}
          onNext={() => stepSelected(1)}
        />
      )}
    </div>
  );
}
