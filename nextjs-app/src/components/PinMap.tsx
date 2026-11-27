// what this file does: draws the map and one marker per place
//   markers are grouped by spot, a spot with several programs shows a count
//   clicking a marker selects the program (or opens a picker for a group), it never leaves the page
//   markers are 28px to look at with a 44px tap area
//   the map fits to the visible pins and flies to the selected program
//   maplibre moves less when the device asks for reduced motion
// change in this version: new "embedded" mode for the single-program mini-map
//   embedded markers are plain divs (the places list beside the map says the same thing)
//   embedded maps use cooperative gestures, so a swipe on a phone still scrolls the page
//   onSelect, onClear, provinces and selectedSlug are optional now
// change in this version (m3): fit padding and zoom buttons
//   fitPadding keeps pins out from under the floating panel, chips, time bar and toggle
//   it is read from a ref, so a resize changes where the next fit lands but never refits on its own
//   every fit is capped at zoom 11 (MAX_FIT_ZOOM) and the padding is clamped to the canvas size
//   the zoom buttons sit at the bottom-right and only exist from 640px up, pinch works everywhere
//   the mini-map keeps its zoom buttons at the top-right
//   map.resize() runs whenever the padding changes, for example when the results panel collapses
// maplibre is loaded from a cdn at runtime instead of being bundled by next.js,
// because next's bundler breaks maplibre's web worker ("worker failed to load")
// the version and optional integrity hashes live in src/lib/map-config.ts
"use client";

import type * as MapLibre from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { clampPadding, DEFAULT_FIT_PADDING, MAX_FIT_ZOOM, type FitPadding } from "@/lib/fit-padding";
import { groupPlaces, type PlaceGroup } from "@/lib/group-places";
import {
  MAP_BOUNDS,
  MAP_CENTER,
  MAP_MIN_ZOOM,
  MAP_STYLE_URL,
  MAP_ZOOM,
  MAPLIBRE_CSS_INTEGRITY,
  MAPLIBRE_CSS_URL,
  MAPLIBRE_JS_INTEGRITY,
  MAPLIBRE_JS_URL,
} from "@/lib/map-config";
import { GROUP_LOOK, markerLook, SELECTED_SHADOW } from "@/lib/marker-style";
import type { Province } from "@/lib/vocab";
import { EMPTY_BODY, EmptyState } from "./States";

type MapLibreLib = typeof MapLibre;
type Group = PlaceGroup<ExplorerProgram>;
type Pin = { marker: MapLibre.Marker; el: HTMLElement; dot: HTMLSpanElement; pulse: HTMLSpanElement; group: Group; base: string };
type Point = [number, number];

export interface SpotPick {
  key: string;
  name: string;
  slugs: string[];
}

// marker classes, the outer element is the 44px tap area and the inner dot is the 28px marker you see
// the cursor is added in code, because embedded markers are not clickable
const PIN_BUTTON = "z-[1] flex h-[44px] w-[44px] items-center justify-center border-0 bg-transparent p-0";
const PIN_DOT =
  "relative box-border flex h-[32px] w-[32px] items-center justify-center text-[14px] font-bold text-white motion-safe:transition-transform group-hover:scale-110";
const PIN_PULSE =
  "pointer-events-none absolute hidden h-[32px] w-[32px] rounded-full bg-stone-900/40 motion-safe:animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]";
const PIN_RAISED = "z-[2]";
const TINT_CLASS = "pointer-events-none absolute inset-0 bg-amber-100/40 mix-blend-multiply";

// zoom buttons only exist from this width, the same as tailwind's sm breakpoint
const ZOOM_BUTTONS_QUERY = "(min-width: 640px)";

// a stable empty list, a new [] on every render would rebuild the markers every time
const NO_PROVINCES: Province[] = [];

// the cdn script puts maplibre on window.maplibregl
declare global {
  interface Window {
    maplibregl?: MapLibreLib;
  }
}

// loads the maplibre script and stylesheet once, then reuses them
let loading: Promise<MapLibreLib> | null = null;
function loadMapLibre(): Promise<MapLibreLib> {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  if (loading) return loading;

  loading = new Promise<MapLibreLib>((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = MAPLIBRE_CSS_URL;
    if (MAPLIBRE_CSS_INTEGRITY) {
      css.integrity = MAPLIBRE_CSS_INTEGRITY;
      css.crossOrigin = "anonymous";
    }
    document.head.appendChild(css);

    const script = document.createElement("script");
    script.src = MAPLIBRE_JS_URL;
    script.async = true;
    if (MAPLIBRE_JS_INTEGRITY) {
      script.integrity = MAPLIBRE_JS_INTEGRITY;
      script.crossOrigin = "anonymous";
    }
    script.onload = () =>
      window.maplibregl ? resolve(window.maplibregl) : reject(new Error("MapLibre did not load"));
    // reset the cache on failure so a later render can try again
    script.onerror = () => {
      loading = null;
      reject(new Error("Could not load MapLibre from the CDN"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

// moves the map to show the points, inside the padding and never closer than MAX_FIT_ZOOM
// the padding is clamped to the canvas first, maplibre throws when it is bigger than the canvas
// options are built without undefined values, maplibre would copy them over its defaults
function fitPoints(lib: MapLibreLib, map: MapLibre.Map, points: Point[], padding: FitPadding, animate: boolean) {
  if (points.length === 0) return; // no results: keep the current view
  const canvas = map.getContainer();
  const safe = clampPadding(padding, canvas.clientWidth, canvas.clientHeight);
  const motion = animate ? {} : { duration: 0 };
  if (points.length === 1) {
    map.easeTo({
      center: points[0],
      zoom: Math.min(Math.max(map.getZoom(), 9.5), MAX_FIT_ZOOM),
      padding: safe,
      ...motion,
    });
    return;
  }
  const bounds = new lib.LngLatBounds(points[0], points[0]);
  points.forEach((point) => bounds.extend(point));
  map.fitBounds(bounds, { padding: safe, maxZoom: MAX_FIT_ZOOM, ...motion });
}

type Props = {
  programs: ExplorerProgram[];
  provinces?: Province[];
  selectedSlug?: string | null;
  activeSpotKey?: string | null;
  onSelect?: (slug: string) => void;
  onSelectGroup?: (spot: SpotPick) => void;
  onClear?: () => void;
  // true for the small map on a program page: no clicks on markers, gentler gestures
  embedded?: boolean;
  // pixels of each edge covered by floating pieces, the pins are fitted inside what is left
  fitPadding?: FitPadding;
};

export default function PinMap({
  programs,
  provinces = NO_PROVINCES,
  selectedSlug = null,
  activeSpotKey = null,
  onSelect,
  onSelectGroup,
  onClear,
  embedded = false,
  fitPadding = DEFAULT_FIT_PADDING,
}: Props) {
  const box = useRef<HTMLDivElement>(null);
  const pins = useRef<Pin[]>([]);
  const groupsRef = useRef<Group[]>([]);
  const pending = useRef<{ points: Point[] } | null>(null); // a fit that waited for the map to become visible
  const firstFit = useRef(true);
  // latest callbacks, so markers never need to be rebuilt when the parent re-renders
  const handlers = useRef({ onSelect, onSelectGroup, onClear });
  // latest padding, read when a fit runs, so a resize never causes a refit by itself
  const paddingRef = useRef(fitPadding);

  const [lib, setLib] = useState<MapLibreLib | null>(null);
  const [map, setMap] = useState<MapLibre.Map | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    handlers.current = { onSelect, onSelectGroup, onClear };
  });

  useEffect(() => {
    paddingRef.current = fitPadding;
  });

  const groups = useMemo(() => groupPlaces(programs, provinces), [programs, provinces]);
  // the fit only reruns when the set of spots changes, not on every render
  const pointsKey = useMemo(() => groups.map((group) => group.key).join("|"), [groups]);
  // a plain string, so the resize effect below only runs when a side really changes
  const paddingKey = `${fitPadding.top},${fitPadding.right},${fitPadding.bottom},${fitPadding.left}`;

  useEffect(() => {
    groupsRef.current = groups;
  }, [groups]);

  // fits to points, or waits when the map is hidden (phone list view) and fits once it shows
  const fit = useCallback(
    (points: Point[], animate: boolean) => {
      if (!lib || !map || !box.current) return;
      if (box.current.clientWidth === 0) {
        pending.current = { points };
        return;
      }
      map.resize();
      fitPoints(lib, map, points, paddingRef.current, animate);
    },
    [lib, map],
  );

  // step 1: load the maplibre library in the browser
  useEffect(() => {
    let cancelled = false;
    loadMapLibre()
      .then((loaded) => {
        if (!cancelled) setLib(loaded);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // step 2: create the map once the library and the container are ready
  useEffect(() => {
    if (!lib || !box.current) return;
    const instance = new lib.Map({
      container: box.current,
      style: MAP_STYLE_URL,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      maxBounds: MAP_BOUNDS,
      minZoom: MAP_MIN_ZOOM,
      // on a long page, ctrl-scroll or two fingers zoom the map, so the page stays scrollable
      cooperativeGestures: embedded,
    });

    const tint = document.createElement("div");
    tint.className = TINT_CLASS;
    tint.setAttribute("aria-hidden", "true");
    instance.getCanvasContainer().after(tint);

    // zoom buttons: the mini-map keeps them top-right, the big map has them bottom-right from 640px up
    // under 640px they are left out, pinch and double tap still zoom
    let zoomControl: MapLibre.NavigationControl | null = null;
    const wide = window.matchMedia(ZOOM_BUTTONS_QUERY);
    const syncZoomControl = () => {
      const wanted = embedded || wide.matches;
      if (wanted && !zoomControl) {
        zoomControl = new lib.NavigationControl({ showCompass: false });
        instance.addControl(zoomControl, embedded ? "top-right" : "bottom-right");
      } else if (!wanted && zoomControl) {
        instance.removeControl(zoomControl);
        zoomControl = null;
      }
    };
    syncZoomControl();
    wide.addEventListener("change", syncZoomControl);

    // tapping empty map closes the preview and the spot list
    instance.on("click", () => {
      handlers.current.onClear?.();
    });
    setMap(instance);
    return () => {
      wide.removeEventListener("change", syncZoomControl);
      tint.remove();
      instance.remove();
      setMap(null);
    };
  }, [lib, embedded]);

  // step 3: keep the map sized to its box, and run a fit that was waiting for it to show
  useEffect(() => {
    if (!map || !box.current) return;
    const observer = new ResizeObserver(() => {
      if (!box.current || box.current.clientWidth === 0) return;
      map.resize();
      if (pending.current) {
        const waiting = pending.current;
        pending.current = null;
        fit(waiting.points, false);
      }
    });
    observer.observe(box.current);
    return () => observer.disconnect();
  }, [map, fit]);

  // step 3b: tell maplibre when the padding changes, for example when the results panel collapses
  // this only resizes, it does not move the view, so the reader's position is never lost
  useEffect(() => {
    if (!map || !box.current || box.current.clientWidth === 0) return;
    map.resize();
  }, [map, paddingKey]);

  // step 4: rebuild the markers when the spots change
  useEffect(() => {
    if (!lib || !map) return;
    pins.current.forEach((pin) => pin.marker.remove());

    pins.current = groups.map((group) => {
      const count = group.items.length;
      const first = group.items[0];

      // outer element is the 44px tap area, the inner dot is the 28px marker you see
      // embedded maps use a plain div, the others use a real button
      const el = document.createElement(embedded ? "div" : "button");
      if (el instanceof HTMLButtonElement) el.type = "button";
      el.className = `group ${PIN_BUTTON} ${embedded ? "cursor-default" : "cursor-pointer"}`;

      const dot = document.createElement("span");
      dot.className = PIN_DOT;
      const look =
        count === 1
          ? markerLook({ topic: first.topic, era: first.era, status: first.status, approximate: group.approximate })
          : GROUP_LOOK;
      Object.assign(dot.style, look);
      if (count > 1) dot.textContent = String(count);

      const pulse = document.createElement("span");
      pulse.className = PIN_PULSE;
      el.append(pulse, dot);

      if (embedded) {
        // the places list beside the map already says this, so screen readers skip the marker
        el.setAttribute("aria-hidden", "true");
      } else {
        const label = count === 1 ? `${first.title}, ${group.name}. Show details` : `${count} programs at ${group.name}. Choose one`;
        el.setAttribute("aria-label", label);
        el.title = label;
        el.addEventListener("click", (event) => {
          // stop the click so it does not also count as a tap on the empty map
          event.stopPropagation();
          if (count === 1) {
            handlers.current.onSelect?.(first.slug);
          } else {
            handlers.current.onSelectGroup?.({
              key: group.key,
              name: group.name,
              slugs: group.items.map((item) => item.slug),
            });
          }
        });
      }

      const marker = new lib.Marker({ element: el }).setLngLat([group.lng, group.lat]).addTo(map);
      return { marker, el, dot, pulse, group, base: look.boxShadow };
    });
  }, [lib, map, groups, embedded]);

  // step 5: ring and pulse the markers of the selected program, without rebuilding them
  useEffect(() => {
    pins.current.forEach((pin) => {
      const on = pin.group.items.some((item) => item.slug === selectedSlug) || pin.group.key === activeSpotKey;
      pin.dot.style.boxShadow = on ? SELECTED_SHADOW : pin.base;
      pin.pulse.classList.toggle("hidden", !on);
      pin.el.classList.toggle(PIN_RAISED, on);
    });
  }, [lib, map, groups, selectedSlug, activeSpotKey]);

  // step 6: fit to the visible pins (first fit has no animation)
  useEffect(() => {
    if (!lib || !map) return;
    const animate = !firstFit.current;
    firstFit.current = false;
    fit(groupsRef.current.map((group): Point => [group.lng, group.lat]), animate);
  }, [lib, map, pointsKey, fit]);

  // step 7: fly to the selected program's pins
  useEffect(() => {
    if (!lib || !map || !selectedSlug) return;
    const points = groupsRef.current
      .filter((group) => group.items.some((item) => item.slug === selectedSlug))
      .map((group): Point => [group.lng, group.lat]);
    fit(points, true);
  }, [lib, map, selectedSlug, fit]);

  return (
    // on the big map, lift zoom buttons above the phone sheet peek from 640px to 1024px
    <div
      className={`absolute inset-0 ${
        embedded ? "" : "[&_.maplibregl-ctrl-bottom-right]:mb-36 lg:[&_.maplibregl-ctrl-bottom-right]:mb-0"
      }`}
    >
      <div
        ref={box}
        role="region"
        aria-label={embedded ? "Map of this program's places" : "Map of programs"}
        className={`isolate h-full w-full border bg-stone-100 ${
          embedded ? "border-stone-400" : "rounded-lg border-stone-200"
        }`}
      />

      {/* shown only if the cdn is blocked or offline, the program list still works */}
      {failed && (
        <div role="alert" className="absolute inset-0 flex items-center justify-center bg-stone-100 p-4">
          <EmptyState title="The map could not load" className="max-w-sm bg-white">
            <p className={EMPTY_BODY}>Check your internet connection. The program list still works.</p>
          </EmptyState>
        </div>
      )}
    </div>
  );
}
