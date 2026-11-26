// what this file does: the results panel on /map, it floats over the map
//   desktop: a rounded panel on the left, width clamp(20rem, 30vw, 26rem), 12px from the edges
//     it holds the one live count, a collapse button, a search box, the temporary filter controls and the list
//     collapsing turns it into a small pill with the count and a "Show list" button, the map gets all the room
//   phone: a top strip with the filters button and the count, it grows into the list view (m8 replaces it with a sheet)
// the collapse button is the same element in both states, so keyboard focus never has to move
// the panel only draws what it is given: the parent filters and searches first, so panel, pins and count agree
// change in this version (m4): new, replaces the inline panel in Explorer and the ProgramCard list
import Link from "next/link";
import { useId, type ReactNode, type RefObject } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { LAYER } from "@/lib/map-layers";
import { PROVINCE_LABELS, type Province } from "@/lib/vocab";
import { ResultItem } from "./ResultItem";

/**
 * Props for the MapPanel component.
 */
interface MapPanelProps {
  /** Programs to list, already filtered and searched by the parent. */
  programs: ExplorerProgram[];
  /** Slug of the selected program, or `null`. */
  selectedSlug: string | null;
  /** The text in the search box. */
  query: string;
  onQueryChange: (query: string) => void;
  /** Whether the panel is open (desktop only, a phone always shows it). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Phone only: which view is showing, the list view fills the screen. */
  view: "list" | "map";
  /** Number of active filters, shown on the phone filters button. */
  filterCount: number;
  /** Ref of the phone filters button, so the parent can return focus to it. */
  filtersButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenFilters: () => void;
  /** The filter controls shown inside the desktop panel (temporary until the chips in m5). */
  controls: ReactNode;
  /** Picked provinces that have no program at all, they get an explanation instead of an empty list. */
  explainProvinces: Province[];
  onSelect: (slug: string) => void;
  /** Clears the filters and the search text. */
  onClear: () => void;
}

/**
 * Renders the floating results panel.
 *
 * @remarks
 * The count has `role="status"` and `data-testid="result-count"`, there is only one in the page.
 * The list region is named "Programs".
 */
export function MapPanel({
  programs,
  selectedSlug,
  query,
  onQueryChange,
  open,
  onOpenChange,
  view,
  filterCount,
  filtersButtonRef,
  onOpenFilters,
  controls,
  explainProvinces,
  onSelect,
  onClear,
}: MapPanelProps) {
  const searchId = useId();
  const bodyId = useId();
  const countText = programs.length === 1 ? "program" : "programs";

  // phone: the list view fills the screen, the map view keeps only the strip on top
  const phoneShell =
    view === "list" ? "bottom-14 bg-background" : "bg-background/95 backdrop-blur";
  // desktop: a full panel, or a pill when collapsed
  const desktopShell = open
    ? "lg:inset-x-auto lg:bottom-3 lg:left-3 lg:top-3 lg:w-[clamp(20rem,30vw,26rem)] lg:rounded-xl lg:bg-white lg:backdrop-blur-none"
    : "lg:inset-x-auto lg:bottom-auto lg:left-3 lg:top-3 lg:w-auto lg:rounded-full lg:bg-white lg:backdrop-blur-none";

  return (
    <aside
      className={`absolute inset-x-0 top-0 flex flex-col border-b border-stone-300 lg:border lg:shadow-lg ${LAYER.panel} ${phoneShell} ${desktopShell}`}
    >
      {/* header: the filters button on phones, the one live count, and the collapse button on desktop */}
      <div
        className={`flex items-center justify-between gap-3 px-4 py-2 ${
          open ? "lg:border-b lg:border-stone-200" : "lg:gap-4 lg:py-1 lg:pr-2"
        }`}
      >
        <button
          ref={filtersButtonRef}
          type="button"
          aria-haspopup="dialog"
          onClick={onOpenFilters}
          className="tap-target rounded-lg border border-stone-400 bg-white px-4 font-sans text-base font-medium lg:hidden"
        >
          Filters{filterCount > 0 ? ` (${filterCount})` : ""}
        </button>
        <p role="status" data-testid="result-count" className="figures font-sans text-base text-stone-800">
          <strong>{programs.length}</strong> {countText}
        </p>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => onOpenChange(!open)}
          className={`tap-target hidden items-center justify-center rounded-full border border-stone-500 bg-white font-sans text-base font-medium text-stone-900 hover:border-ink lg:inline-flex ${
            open ? "px-2" : "px-4"
          }`}
        >
          {open ? (
            <>
              {/* a chevron pointing at the edge the panel folds into */}
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4 6 10l6 6" />
              </svg>
              <span className="sr-only">Hide list</span>
            </>
          ) : (
            "Show list"
          )}
        </button>
      </div>

      {/* body: search, the temporary filter controls and the list, hidden when collapsed or in the phone map view */}
      <div
        id={bodyId}
        className={`${view === "list" ? "flex" : "hidden"} ${open ? "lg:flex" : "lg:hidden"} min-h-0 flex-1 flex-col`}
      >
        <div className="border-b border-stone-200 px-4 py-2">
          <label htmlFor={searchId} className="font-sans text-base font-medium text-stone-700">
            Search
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Title or place"
            className="mt-1 min-h-[44px] w-full rounded-sm border border-stone-500 bg-white px-3 font-sans text-base text-stone-900 placeholder:text-stone-700"
          />
        </div>

        {/* desktop only: scrolls inside the panel when the controls get tall, m5 replaces them with chips */}
        <div className="hidden max-h-[45%] overflow-y-auto border-b border-stone-200 px-4 py-3 lg:block">{controls}</div>

        <section aria-label="Programs" className="min-h-0 flex-1 overflow-y-auto">
          {programs.length > 0 ? (
            <ul className="divide-y divide-stone-300">
              {programs.map((program) => (
                <ResultItem
                  key={program.slug}
                  program={program}
                  selected={program.slug === selectedSlug}
                  onSelect={onSelect}
                />
              ))}
            </ul>
          ) : explainProvinces.length > 0 ? (
            // a province with no program at all explains itself instead of showing a blank list
            <div className="m-3 space-y-2 rounded-card border border-dashed border-stone-400 p-4">
              <p className="font-serif text-lg font-semibold">
                No {explainProvinces.map((province) => PROVINCE_LABELS[province]).join(" or ")} program yet
              </p>
              <p className="font-serif leading-relaxed text-stone-800">
                No martial-law farm program in this province has been researched yet.
              </p>
              <Link
                href="/sources#gap-cavite-not-covered"
                className="tap-target inline-flex items-center font-sans text-base underline underline-offset-2"
              >
                Here is why
              </Link>
            </div>
          ) : (
            <div className="m-3 space-y-2 rounded-card border border-dashed border-stone-400 p-4">
              <p className="font-serif text-lg font-semibold">No programs match</p>
              <button
                type="button"
                onClick={onClear}
                className="tap-target font-sans text-base underline underline-offset-2"
              >
                Clear filters and search
              </button>
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}