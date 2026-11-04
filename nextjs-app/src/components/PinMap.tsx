// What this file does: draws filtered programs as accessible MapLibre markers.
// Every place of a program gets its own pin. Round = martial law, square = today.
// MapLibre is loaded from a CDN at runtime instead of being bundled by Next.js,
// because Next's bundler breaks MapLibre's web worker ("Worker failed to load").
"use client";
// Type-only import: nothing from the npm package is bundled into the page.
import type * as MapLibre from "maplibre-gl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { TOPICS, type Province } from "@/lib/vocab";

type MapLibreLib = typeof MapLibre;

// "@5" matches the major version of the npm package used for types.
const JS_URL = "https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js";
const CSS_URL = "https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css";
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// The CDN script puts MapLibre on window.maplibregl.
declare global {
  interface Window {
    maplibregl?: MapLibreLib;
  }
}

// Loads the MapLibre script and stylesheet once, then reuses them.
let loading: Promise<MapLibreLib> | null = null;
function loadMapLibre(): Promise<MapLibreLib> {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  if (loading) return loading;

  loading = new Promise<MapLibreLib>((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = CSS_URL;
    document.head.appendChild(css);

    const script = document.createElement("script");
    script.src = JS_URL;
    script.async = true;
    script.onload = () =>
      window.maplibregl ? resolve(window.maplibregl) : reject(new Error("MapLibre did not load"));
    // Reset the cache on failure so a later render can try again.
    script.onerror = () => {
      loading = null;
      reject(new Error("Could not load MapLibre from the CDN"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export default function PinMap({ programs, provinces }: { programs: ExplorerProgram[]; provinces: Province[] }) {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const markers = useRef<MapLibre.Marker[]>([]);
  const [lib, setLib] = useState<MapLibreLib | null>(null);
  const [map, setMap] = useState<MapLibre.Map | null>(null);
  const [failed, setFailed] = useState(false);

  // Step 1: load the MapLibre library in the browser.
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

  // Step 2: create the map once the library and the container are ready.
  useEffect(() => {
    if (!lib || !box.current) return;
    const instance = new lib.Map({ container: box.current, style: STYLE_URL, center: [121.3, 14.1], zoom: 8.2 });
    instance.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");
    setMap(instance);
    return () => {
      instance.remove();
      setMap(null);
    };
  }, [lib]);

  // Step 3: rebuild the pins whenever the map or the filters change.
  useEffect(() => {
    if (!lib || !map) return;
    markers.current.forEach((marker) => marker.remove());

    markers.current = programs.flatMap((program) =>
      program.places
        // When provinces are filtered, hide pins that sit in other provinces.
        .filter((place) => provinces.length === 0 || provinces.includes(place.province))
        .map((place) => {
          const color = TOPICS[program.topic].color;
          const el = document.createElement("button");
          el.type = "button";
          el.title = `${program.title} (${place.name})`;
          el.setAttribute("aria-label", `${program.title}, ${place.name}. Open program page`);
          Object.assign(el.style, {
            width: "22px",
            height: "22px",
            cursor: "pointer",
            // Square for today, round for martial law.
            borderRadius: program.era === "today" ? "4px" : "9999px",
            // Solid = confirmed, hollow = still checking.
            background: program.status === "confirmed" ? color : "#fff",
            // Dashed border = approximate place.
            border: `3px ${place.approximate ? "dashed" : "solid"} ${color}`,
          });
          el.addEventListener("click", () => router.push(`/programs/${program.slug}`));
          return new lib.Marker({ element: el }).setLngLat([place.lng, place.lat]).addTo(map);
        }),
    );
  }, [lib, map, programs, provinces, router]);

  return (
    <div className="relative h-full min-h-[320px] w-full">
      <div ref={box} role="region" aria-label="Map of programs" className="h-full min-h-[320px] w-full rounded-lg border border-stone-200" />
      {/* Shown only if the CDN is blocked or offline. The program list still works. */}
      {failed && (
        <p role="alert" className="absolute inset-0 flex items-center justify-center rounded-lg bg-stone-100 p-4 text-center text-sm text-stone-700">
          The map could not load. Check your internet connection. The program list still works.
        </p>
      )}
    </div>
  );
}
