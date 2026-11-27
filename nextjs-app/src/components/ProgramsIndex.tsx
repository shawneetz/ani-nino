// what this file does: the searchable reading list on the /programs page
//   search box (title or place), topic and province chips, confirmed filter,
//   and today's echoes switch when a today program exists
//   sort by year or title, a live count, and a link that opens the map with the same filters and search
// all state lives here in the browser, the page passes in the slim program list
// the chips reuse FilterControls and the rows use ProgramRow
// change in this version (e6): ruled rows instead of the card grid
//   the filter box is flat (inputs stay white), the "see on the map" link also carries the search text as q
//   the old note "the map does not use the search box" is gone, the map reads q from stage m5
// change in this version (u5): shared rhythm and a tighter filter bar
//   blocks are 6 apart, the filter bar content is 3 apart and its padding is smaller
"use client";

import { useId, useMemo, useState } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { EMPTY_FILTERS, toQueryString, visiblePrograms, type Filters } from "@/lib/filter";
import { matchesQuery, sortPrograms, type SortKey } from "@/lib/program-search";
import type { Province, Topic } from "@/lib/vocab";
import { Button, ButtonLink } from "./Button";
import { BLOCK_GAP, INNER_GAP } from "./Container";
import { FilterControls } from "./FilterControls";
import { ProgramRow } from "./ProgramRow";

/**
 * Props for the ProgramsIndex component.
 */
interface ProgramsIndexProps {
  /** Every program to list, already reduced to the slim explorer shape on the server */
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
 * @typeParam T - The type of the list items
 * @param list - The current list, it is not changed
 * @param value - The value to add or remove
 * @returns A new list
 */
function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/**
 * Renders the programs reading list with search, filter chips, sorting and a map link.
 *
 * @remarks
 * Must remain a Client Component because search text, chips and sorting are
 * local state. Filtering uses the same `visiblePrograms` function as the map,
 * so both pages always agree on what a chip means.
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

  // the map link carries the chips and the search text (q)
  const mapParts = [toQueryString(filters), searching ? `q=${encodeURIComponent(query.trim())}` : ""].filter(Boolean);
  const mapHref = mapParts.length > 0 ? `/map?${mapParts.join("&")}` : "/map";

  function clearAll() {
    setFilters(EMPTY_FILTERS);
    setQuery("");
  }

  return (
    <div className={BLOCK_GAP}>
      {/* search, sort and chips on the page, no box, only the inputs are white */}
      <div className={`${INNER_GAP} border-y border-stone-400 py-3`}>
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <div className="min-w-[16rem] flex-1">
            <label htmlFor={searchId} className="font-sans text-base font-medium text-stone-700">
              Search
            </label>
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title or place"
              className="mt-1 min-h-[44px] w-full rounded-sm border border-stone-500 bg-white px-3 font-sans text-base text-stone-900 placeholder:text-stone-700"
            />
          </div>
          <div>
            <label htmlFor={sortId} className="block font-sans text-base font-medium text-stone-700">
              Sort by
            </label>
            <select
              id={sortId}
              value={sort}
              onChange={(event) => {
                const next = SORT_OPTIONS.find((option) => option.value === event.target.value);
                if (next) setSort(next.value);
              }}
              className="mt-1 min-h-[44px] rounded-sm border border-stone-500 bg-white px-3 font-sans text-base text-stone-900"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
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
        <p role="status" data-testid="program-count" className="figures font-sans text-base text-stone-800">
          <strong>{shown.length}</strong> {shown.length === 1 ? "program" : "programs"}
        </p>
        <ButtonLink href={mapHref} variant="secondary">
          See on the map
        </ButtonLink>
      </div>

      <section aria-labelledby={resultsId}>
        <h2 id={resultsId} className="sr-only">
          Program results
        </h2>
        {shown.length > 0 ? (
          // a hairline opens the list and each row closes with one
          <ul className="border-t border-stone-400">
            {shown.map((program) => (
              <li key={program.slug} className="border-b border-stone-400">
                <ProgramRow program={program} />
              </li>
            ))}
          </ul>
        ) : (
          <div className={`${INNER_GAP} border border-dashed border-stone-500 p-4`}>
            <p className="font-serif text-lg font-semibold text-stone-950">No programs match</p>
            <Button variant="secondary" onClick={clearAll}>
              Clear search and filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}