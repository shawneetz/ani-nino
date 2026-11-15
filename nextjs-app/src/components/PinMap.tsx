// what this file does: draws the map and one marker per place (c3.4)
//   markers are grouped by spot, a spot with several programs shows a count
//   clicking a marker selects the program (or opens a picker for a group), it never leaves the page
//   markers are 28px to look at with a 44px tap area (c3.12)
//   the map fits to the visible pins and flies to the selected program (c3.7)
//   maplibre moves less when the device asks for reduced motion (c6.4a)
// change in this version: static marker styles are tailwind classes now, not inline styles
// only the per-program color, fill, border and shape stay inline (from markerLook)
// maplibre is loaded from a cdn at runtime instead of being bundled by next.js,
// because next's bundler breaks maplibre's web worker ("worker failed to load")
// the version and optional integrity hashes live in src/lib/map-config.ts
"use client";

import type * as MapLibre from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { yearRange } from "@/lib/filter";
import { groupPlaces, type PlaceGroup } from "@/lib/group-places";
import {
  MAP_CENTER,
  MAP_STYLE_URL,
  MAP_ZOOM,
  MAPLIBRE_CSS_INTEGRITY,
  MAPLIBRE_CSS_URL,
  MAPLIBRE_JS_INTEGRITY,
  MAPLIBRE_JS_URL,
} from "@/lib/map-config";
import { GROUP_LOOK, markerLook } from "@/lib/marker-style";
import type { Province } from "@/lib/vocab";
import { Button } from "./button";

type MapLibreLib = typeof MapLibre;
type Group = PlaceGroup<ExplorerProgram>;
type Pin = { marker: MapLibre.Marker; el: HTMLButtonElement; dot: HTMLSpanElement; group: Group };
type Point = [number, number];

// marker classes, the outer button is the 44px tap area and the inner dot is the 28px marker you see
const PIN_BUTTON = "z-[1] flex h-[44px] w-[44px] cursor-pointer items-center justify-center border-0 bg-transparent p-0";
const PIN_DOT = "box-border flex h-[28px] w-[28px] items-center justify-center text-[14px] font-bold text-white";
// the ring and the raised layer are toggled for the selected program
const PIN_RING = "shadow-[0_0_0_3px_#fff,0_0_0_6px_#171717]";
const PIN_RAISED = "z-[2]";

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

// moves the map to show the points, padding 60px and never closer than zoom 11
// options are built without undefined values, maplibre would copy them over its defaults
function fitPoints(lib: MapLibreLib, map: MapLibre.Map, points: Point[], animate: boolean) {
  if (points.length === 0) return; // no results: keep the current view
  const motion = animate ? {} : { duration: 0 };
  if (points.length === 1) {
    map.easeTo({ center: points[0], zoom: Math.min(Math.max(map.getZoom(), 9.5), 11), ...motion });
    return;
  }
  const bounds = new lib.LngLatBounds(points[0], points[0]);
  points.forEach((point) => bounds.extend(point));
  map.fitBounds(bounds, { padding: 60, maxZoom: 11, ...motion });
}

type Props = {
  programs: ExplorerProgram[];
  provinces: Province[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onClear: () => void;
};

export default function PinMap({ programs, provinces, selectedSlug, onSelect, onClear }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const pins = useRef<Pin[]>([]);
  const groupsRef = useRef<Group[]>([]);
  const pending = useRef<{ points: Point[] } | null>(null); // a fit that waited for the map to become visible
  const firstFit = useRef(true);
  const pickerTrigger = useRef<HTMLElement | null>(null);
  // latest callbacks, so markers never need to be rebuilt when the parent re-renders
  const handlers = useRef({ onSelect, onClear });

  const [lib, setLib] = useState<MapLibreLib | null>(null);
  const [map, setMap] = useState<MapLibre.Map | null>(null);
  const [failed, setFailed] = useState(false);
  const [pickerKey, setPickerKey] = useState<string | null>(null);

  useEffect(() => {
    handlers.current = { onSelect, onClear };
  });

  const groups = useMemo(() => groupPlaces(programs, provinces), [programs, provinces]);
  // the fit only reruns when the set of spots changes, not on every render
  const pointsKey = useMemo(() => groups.map((group) => group.key).join("|"), [groups]);
  const pickerGroup = groups.find((group) => group.key === pickerKey) ?? null;

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
      fitPoints(lib, map, points, animate);
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
    const instance = new lib.Map({ container: box.current, style: MAP_STYLE_URL, center: MAP_CENTER, zoom: MAP_ZOOM });
    instance.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");
    // tapping empty map closes the preview and the picker
    instance.on("click", () => {
      handlers.current.onClear();
      setPickerKey(null);
    });
    setMap(instance);
    return () => {
      instance.remove();
      setMap(null);
    };
  }, [lib]);

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

  // step 4: rebuild the markers when the spots change
  useEffect(() => {
    if (!lib || !map) return;
    pins.current.forEach((pin) => pin.marker.remove());

    pins.current = groups.map((group) => {
      const count = group.items.length;
      const first = group.items[0];

      // outer button is the 44px tap area, the inner dot is the 28px marker you see
      const el = document.createElement("button");
      el.type = "button";
      el.className = PIN_BUTTON;

      const dot = document.createElement("span");
      dot.className = PIN_DOT;
      // color, fill, border and shape depend on the program, so they stay inline
      if (count === 1) {
        Object.assign(dot.style, markerLook({ topic: first.topic, era: first.era, status: first.status, approximate: group.approximate }));
      } else {
        Object.assign(dot.style, GROUP_LOOK);
        dot.textContent = String(count); // the number means color is not the only signal
      }
      el.append(dot);

      const label = count === 1 ? `${first.title}, ${group.name}. Show preview` : `${count} programs at ${group.name}. Choose one`;
      el.setAttribute("aria-label", label);
      el.title = label;
      el.addEventListener("click", (event) => {
        // stop the click so it does not also count as a tap on the empty map
        event.stopPropagation();
        if (count === 1) {
          setPickerKey(null);
          handlers.current.onSelect(first.slug);
        } else {
          pickerTrigger.current = el;
          setPickerKey(group.key);
        }
      });

      const marker = new lib.Marker({ element: el }).setLngLat([group.lng, group.lat]).addTo(map);
      return { marker, el, dot, group };
    });
  }, [lib, map, groups]);

  // step 5: ring the markers of the selected program, without rebuilding them
  useEffect(() => {
    pins.current.forEach((pin) => {
      const on = pin.group.items.some((item) => item.slug === selectedSlug);
      pin.dot.classList.toggle(PIN_RING, on);
      pin.el.classList.toggle(PIN_RAISED, on);
    });
  }, [lib, map, groups, selectedSlug]);

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

  // picker: escape closes it, focus moves in on open and goes back to the marker on close
  const closePicker = useCallback((restoreFocus: boolean) => {
    setPickerKey(null);
    if (restoreFocus && pickerTrigger.current?.isConnected) pickerTrigger.current.focus();
  }, []);

  useEffect(() => {
    if (!pickerKey) return;
    panel.current?.querySelector("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePicker(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pickerKey, closePicker]);

  return (
    <div className="absolute inset-0">
      <div ref={box} role="region" aria-label="Map of programs" className="h-full w-full rounded-lg border border-stone-200 bg-stone-100" />

      {/* picker for a spot with several programs */}
      {pickerGroup && (
        <div
          ref={panel}
          role="dialog"
          aria-label={`Programs at ${pickerGroup.name}`}
          className="absolute left-3 top-3 z-10 w-72 max-w-[calc(100%-5rem)] space-y-1 rounded-card border border-stone-300 bg-white p-2 shadow-lg"
        >
          <p className="px-2 py-1 text-base font-semibold">
            {pickerGroup.items.length} programs at {pickerGroup.name}
          </p>
          <ul>
            {pickerGroup.items.map((item) => (
              <li key={item.slug}>
                <button
                  type="button"
                  onClick={() => {
                    setPickerKey(null);
                    handlers.current.onSelect(item.slug);
                  }}
                  className="tap-target w-full rounded-lg px-2 py-1 text-left text-base hover:bg-stone-100"
                >
                  {item.title}
                  <span className="block text-sm text-stone-700">{yearRange(item)}</span>
                </button>
              </li>
            ))}
          </ul>
          <Button variant="secondary" className="w-full" onClick={() => closePicker(true)}>Close</Button>
        </div>
      )}

      {/* shown only if the cdn is blocked or offline, the program list still works */}
      {failed && (
        <p role="alert" className="absolute inset-0 flex items-center justify-center rounded-lg bg-stone-100 p-4 text-center text-sm text-stone-700">
          The map could not load. Check your internet connection. The program list still works.
        </p>
      )}
    </div>
  );
}
