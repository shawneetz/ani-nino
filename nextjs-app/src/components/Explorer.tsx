"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFilterState } from "@/hooks/use-filter-state";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { useMapPadding } from "@/hooks/use-map-padding";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { visiblePrograms } from "@/lib/filter";
import type { SheetSize } from "@/lib/fit-padding";
import { LAYER } from "@/lib/map-layers";
import { matchesQuery } from "@/lib/program-search";
import { BottomSheet } from "./BottomSheet";
import { FilterChips } from "./FilterChips";
import { Legend } from "./Legend";
import { MapPanel } from "./MapPanel";
import { TimeBar } from "./TimeBar";

const PinMap = dynamic(() => import("./PinMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-stone-100" />,
});

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

  const isDesktop = useIsDesktop();
  const [text, setText] = useState(query);
  const lastWritten = useRef(query);
  const queryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [sheetSize, setSheetSize] = useState<SheetSize>(selected ? "half" : "peek");

  const filtered = useMemo(() => visiblePrograms(programs, filters), [programs, filters]);
  const shown = useMemo(() => filtered.filter((program) => matchesQuery(program, text)), [filtered, text]);
  const selectedProgram = useMemo(() => shown.find((program) => program.slug === selected) ?? null, [shown, selected]);
  const hasToday = useMemo(() => programs.some((program) => program.era === "today"), [programs]);
  const fitPadding = useMapPadding(panelOpen, sheetSize);

  const trigger = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moveFocus = useRef(false);
  const returnTo = useRef<string | null>(null);

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
      setPanelOpen(true);
      setSheetSize("half");
    },
    [setSelected],
  );

  const closePreview = useCallback(
    (restoreFocus: boolean) => {
      moveFocus.current = false;
      returnTo.current = restoreFocus ? selected : null;
      setSelected(null);
    },
    [selected, setSelected],
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

  useEffect(() => () => {
    if (queryTimer.current) clearTimeout(queryTimer.current);
  }, []);

  useEffect(() => {
    if (selected && !selectedProgram) setSelected(null);
  }, [selected, selectedProgram, setSelected]);

  useEffect(() => {
    if (!selectedProgram || !moveFocus.current) return;
    const node = headingRef.current;
    if (!node || node.offsetParent === null) return;
    node.focus();
    moveFocus.current = false;
  }, [selectedProgram, isDesktop, sheetSize, panelOpen]);

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
  }, [selected, isDesktop, sheetSize, panelOpen]);

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
      onClear={clearAll}
    />
  );

  const freeLeft = panelOpen ? "left-[calc(clamp(20rem,30vw,26rem)+1.5rem)]" : "left-3";

  return (
    <div className="absolute inset-0">
      <h1 className="sr-only">Explore the map</h1>
      <div className={`absolute inset-0 ${LAYER.map}`}>
        <PinMap
          programs={shown}
          provinces={filters.provinces}
          selectedSlug={selectedProgram?.slug ?? null}
          onSelect={select}
          onClear={() => closePreview(false)}
          fitPadding={fitPadding}
        />
      </div>

      {isDesktop === true && (
        <>
          <MapPanel
            programs={shown}
            selectedProgram={selectedProgram}
            headingRef={headingRef}
            query={text}
            onQueryChange={handleQueryChange}
            open={panelOpen}
            onOpenChange={setPanelOpen}
            explainProvinces={explainProvinces}
            onSelect={select}
            onBack={() => closePreview(true)}
            onClear={clearFiltersAndSearch}
          />
          <div className={`absolute top-3 w-fit max-w-[calc(100%-1.5rem)] ${panelOpen ? "left-[calc(clamp(20rem,30vw,26rem)+1.5rem)]" : "left-52"} ${LAYER.popover}`}>
            {renderChips(false)}
          </div>
          <div className={`pointer-events-none absolute bottom-3 right-34 flex justify-center ${freeLeft} ${LAYER.bar}`}>
            <div className="pointer-events-auto w-full max-w-xl">
              <TimeBar year={filters.year} onChange={setYear} showNote={hasToday} />
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
            programs={shown}
            selectedProgram={selectedProgram}
            headingRef={headingRef}
            query={text}
            onQueryChange={handleQueryChange}
            explainProvinces={explainProvinces}
            onSelect={select}
            onBack={() => closePreview(true)}
            onClear={clearFiltersAndSearch}
          />
        </>
      )}

      {isDesktop !== null && (
        <div className={`absolute bottom-40 right-3 sm:bottom-60 lg:bottom-24 ${LAYER.panel}`}>
          <Legend showToday={hasToday} />
        </div>
      )}
    </div>
  );
}
