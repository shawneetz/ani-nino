// what this file does: the searchable list on the /programs page
//   search box (title or place), topic and province chips, confirmed filter,
//   and today's echoes switch when a today program exists
//   sort by year or title, a live count, and a link that opens the map with the same filters
// all state lives here in the browser, the page passes in the slim program list
// the chips reuse FilterControls and the cards reuse ProgramCard, so they match /map
"use client";

import { useId, useMemo, useState } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { EMPTY_FILTERS, toQueryString, visiblePrograms, type Filters } from "@/lib/filter";
import { matchesQuery, sortPrograms, type SortKey } from "@/lib/program-search";
import type { Province, Topic } from "@/lib/vocab";
import { Button, ButtonLink } from "./Button";
import { FilterControls } from "./FilterControls";
import { ProgramCard } from "./ProgramCard";

/**
 * Props for the ProgramsIndex component.
 */
interface ProgramsIndexProps {
    /** Every program to list, already reduced to the slim explorer shape on the server. */
    programs: ExplorerProgram[];
}

/**
 * The choices in the "Sort by" menu, in the order they are shown.
 */
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: "year", label: "Year, oldest first" },
    { value: "title", label: "Title, A to Z" },
];

/**
 * Adds a value to a list, or removes it when it is already there.
 *
 * @typeParam T - The type of the list items.
 * @param list - The current list. It is not changed.
 * @param value - The value to add or remove.
 * @returns A new list.
 */
function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/**
 * Renders the programs list with search, filter chips, sorting and a map link.
 *
 * @remarks
 * Must remain a Client Component because search text, chips and sorting are
 * local state. Filtering uses the same `visiblePrograms` function as the map,
 * so both pages always agree on what a chip means. The search text is not sent
 * to the map: its url only understands topic, province, year, today and confirmed.
 *
 * @example
 * ```tsx
 * <ProgramsIndex programs={(await getPrograms()).map(toExplorerProgram)} />
 * ```
 */
export function ProgramsIndex({ programs }: ProgramsIndexProps) {
    const searchId = useId();
    const sortId = useId();
    const resultsId = useId();

    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortKey>("year");
    const hasToday = useMemo(() => programs.some((program) => program.era === "today"), [programs]);

    // same filter as the map first, then the search, then the sort
    const shown = useMemo(() => {
        const filtered = visiblePrograms(programs, filters);
        return sortPrograms(filtered.filter((program) => matchesQuery(program, query)), sort);
    }, [programs, filters, query, sort]);

    const searching = query.trim() !== "";
    const hasFilters =
        filters.topics.length > 0 ||
        filters.provinces.length > 0 ||
        (hasToday && filters.today) ||
        filters.confirmed ||
        searching;

    // the map reads topic, province, today and confirmed from its url, not the search text
    const mapQuery = toQueryString(filters);
    const mapHref = mapQuery ? `/map?${mapQuery}` : "/map";

    function clearAll() {
        setFilters(EMPTY_FILTERS);
        setQuery("");
    }

    return (
        <div className="space-y-4">
            {/* search, sort and chips in one box */}
            <div className="space-y-4 rounded-card border border-stone-200 bg-white p-4">
                <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
                    <div className="min-w-[16rem] flex-1">
                        <label htmlFor={searchId} className="text-base font-medium text-stone-700">Search</label>
                        <input
                            id={searchId}
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Title or place"
                            className="mt-1 min-h-[44px] w-full rounded-lg border border-stone-400 bg-white px-3 text-base text-stone-900 placeholder:text-stone-600"
                        />
                    </div>
                    <div>
                        <label htmlFor={sortId} className="block text-base font-medium text-stone-700">Sort by</label>
                        <select
                            id={sortId}
                            value={sort}
                            onChange={(event) => {
                                const next = SORT_OPTIONS.find((option) => option.value === event.target.value);
                                if (next) setSort(next.value);
                            }}
                            className="mt-1 min-h-[44px] rounded-lg border border-stone-400 bg-white px-3 text-base text-stone-900"
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <FilterControls
                    layout="row"
                    topics={filters.topics}
                    provinces={filters.provinces}
                    today={filters.today}
                    confirmed={filters.confirmed}
                    showToday={hasToday}
                    hasFilters={hasFilters}
                    onToggleTopic={(topic: Topic) => setFilters((current) => ({ ...current, topics: toggle(current.topics, topic) }))}
                    onToggleProvince={(province: Province) =>
                        setFilters((current) => ({ ...current, provinces: toggle(current.provinces, province) }))
                    }
                    onToggleToday={() => setFilters((current) => ({ ...current, today: !current.today }))}
                    onToggleConfirmed={() => setFilters((current) => ({ ...current, confirmed: !current.confirmed }))}
                    onClear={clearAll}
                />
            </div>

            {/* live count and the map link */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p role="status" data-testid="program-count" className="text-base text-stone-800">
                    <strong>{shown.length}</strong> {shown.length === 1 ? "program" : "programs"}
                </p>
                <ButtonLink href={mapHref} variant="secondary">See on the map</ButtonLink>
            </div>
            {searching && (
                <p className="text-base text-stone-700">The map does not use the search box. It only carries the chips.</p>
            )}

            <section aria-labelledby={resultsId}>
                <h2 id={resultsId} className="sr-only">Program results</h2>
                {shown.length > 0 ? (
                    <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {shown.map((program) => (
                            <li key={program.slug}>
                                <ProgramCard program={program} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="space-y-2 rounded-card border border-dashed border-stone-400 p-4">
                        <p className="text-lg font-semibold text-stone-900">No programs match</p>
                        <Button variant="secondary" onClick={clearAll}>Clear search and filters</Button>
                    </div>
                )}
            </section>
        </div>
    );
}