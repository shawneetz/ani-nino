// What this file does: displays the visible pins on a MapLibre map of CALABARZON.
// Marker styles: filled = verified, hollow ring = lead, dashed border = approximate place.
// Map tiles come from OpenFreeMap (free, no API key).
"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { APPROXIMATE_PRECISIONS } from "@/components/pin-detail/detail-labels";
import type { ExplorerPin } from "@/lib/map-types";

// OpenFreeMap style URL. It includes its own attribution. Check their terms before launch.
const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
const CALABARZON_CENTER: [number, number] = [121.2, 14.05];

interface Props {
  pins: ExplorerPin[];
  familyColors: Record<string, string>;
  selectedPinId: string | null;
  onSelectPin: (pinId: string | null) => void;
}

type Location = ExplorerPin["locations"][number];

// Builds one marker button. Style rules:
// - lead: white fill with a colored ring; verified: colored fill with a white ring
// - approximate place (province or area): dashed ring, so it does not look exact
function buildMarker(pin: ExplorerPin, location: Location, color: string, selected: boolean) {
  const lead = pin.status === "lead";
  const approximate = APPROXIMATE_PRECISIONS.includes(location.precision);
  const ringColor = lead ? color : approximate ? "#171717" : "white";

  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", pin.title);
  button.title = `${pin.title} — ${location.name}`;
  button.style.cssText = [
    "width:20px",
    "height:20px",
    "border-radius:50%",
    `border:3px ${approximate ? "dashed" : "solid"} ${ringColor}`,
    `background:${lead ? "white" : color}`,
    `box-shadow:0 1px 5px #0008${selected ? ",0 0 0 4px #c2410c" : ""}`,
    "cursor:pointer",
    "padding:0",
  ].join(";");
  return button;
}

export function PinMap({ pins, familyColors, selectedPinId, onSelectPin }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // Keep the newest callback and pins in refs. This lets the map be created ONCE,
  // instead of being rebuilt every time the URL (and so the callback) changes.
  const onSelectRef = useRef(onSelectPin);
  const pinsRef = useRef(pins);
  useEffect(() => {
    onSelectRef.current = onSelectPin;
    pinsRef.current = pins;
  });

  // Create the map once, in the browser only (Next.js cannot render it on the server).
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: CALABARZON_CENTER,
      zoom: 8.2,
      minZoom: 6,
      maxZoom: 15,
      cooperativeGestures: true,
    });
    mapRef.current = map;

    const onLoad = () => setMapReady(true);
    const onMapClick = () => onSelectRef.current(null);
    map.on("load", onLoad);
    map.on("click", onMapClick);

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.off("load", onLoad);
      map.off("click", onMapClick);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Redraw the markers whenever the visible pins or the selection change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = pins.flatMap((pin) =>
      pin.locations.map((location) => {
        const color = familyColors[pin.family] ?? "#6b7280";
        const button = buildMarker(pin, location, color, pin.id === selectedPinId);
        button.addEventListener("click", (event) => {
          // Stop the click from reaching the map, which would close the panel.
          event.stopPropagation();
          onSelectRef.current(pin.id);
        });
        return new maplibregl.Marker({ element: button })
          .setLngLat([location.lng, location.lat])
          .addTo(map);
      }),
    );
  }, [familyColors, mapReady, pins, selectedPinId]);

  // Fly to the selected pin only when the selection changes
  // (not every time the slider moves).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !selectedPinId) return;
    const selected = pinsRef.current.find((pin) => pin.id === selectedPinId);
    const location = selected?.locations.find((item) => item.isAnchor) ?? selected?.locations[0];
    if (location) map.flyTo({ center: [location.lng, location.lat], essential: true });
  }, [mapReady, selectedPinId]);

  return (
    <div
      data-testid="pin-map"
      data-map-ready={String(mapReady)}
      data-pin-count={pins.length}
      aria-label="Map of selected pins"
      className="relative h-[50vh] min-h-[360px] overflow-hidden rounded-xl border border-neutral-300 bg-neutral-100 lg:h-[70vh]"
    >
      <div ref={containerRef} className="absolute inset-0" />
      {!mapReady && (
        <p className="absolute left-3 top-3 rounded bg-white/90 px-3 py-2 text-sm text-neutral-700">
          Loading map… The list of pins works even if the map does not load.
        </p>
      )}
      {mapReady && pins.length === 0 && (
        <p className="absolute left-3 top-3 rounded bg-white/95 px-3 py-2 text-sm text-neutral-700">
          No pins match these filters.
        </p>
      )}
    </div>
  );
}
