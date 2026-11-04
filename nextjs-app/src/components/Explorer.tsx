// What this file does: keeps controls, map, list and count on one filter path.
"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useFilterState } from "@/hooks/use-filter-state";
import { visiblePrograms } from "@/lib/filter";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { FilterControls } from "./filter-controls";
import { Legend } from "./legend";
import { ProgramCard } from "./program-card";
import { YearSlider } from "./YearSlider";
const PinMap = dynamic(() => import("./PinMap"), { ssr: false, loading: () => <div className="min-h-[320px] animate-pulse rounded-lg bg-stone-100" /> });
export function Explorer({ programs }: { programs: ExplorerProgram[] }) {
  const { filters, setYear, toggleTopic, toggleProvince, toggleToday, clearAll } = useFilterState();
  const visible = useMemo(() => visiblePrograms(programs, filters), [programs, filters]);
  const hasFilters = filters.year !== null || filters.topics.length > 0 || filters.provinces.length > 0 || filters.today;
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]"><div className="space-y-4"><YearSlider year={filters.year} count={visible.length} onChange={setYear} /><FilterControls topics={filters.topics} provinces={filters.provinces} today={filters.today} hasFilters={hasFilters} onToggleTopic={toggleTopic} onToggleProvince={toggleProvince} onToggleToday={toggleToday} onClear={clearAll} /><div className="h-[55vh] lg:h-[560px]"><PinMap programs={visible} provinces={filters.provinces} /></div><Legend /></div><section aria-label="Programs" className="space-y-2">{visible.length ? visible.map((program) => <ProgramCard key={program.slug} program={program} />) : <p className="rounded-lg border border-dashed p-4 text-sm">No programs match these filters. <button type="button" onClick={clearAll} className="underline">Clear filters</button></p>}</section></div>;
}
