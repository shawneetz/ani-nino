// What this file does: displays visible pins on a MapLibre map of the Philippines.
"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, Marker, StyleSpecification } from "maplibre-gl";
import type { ExplorerPin } from "@/lib/map-types";

const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    // OpenStreetMap provides the map tiles without an app-specific key.
    openstreetmap: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm-tiles", type: "raster", source: "openstreetmap" }],
};

interface Props {
  pins: ExplorerPin[];
  familyColors: Record<string, string>;
  selectedPinId: string | null;
  onSelectPin: (pinId: string | null) => void;
}

export function PinMap({ pins, familyColors, selectedPinId, onSelectPin }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the map only in the browser; Next.js cannot render it on the server.
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [122.3, 12.4],
      zoom: 5.2,
      minZoom: 4,
      maxZoom: 15,
      cooperativeGestures: true,
    });
    mapRef.current = map;
    const onLoad = () => setMapReady(true);
    const onMapClick = () => onSelectPin(null);
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
  }, [onSelectPin]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = pins.flatMap((pin) =>
      pin.locations.map((location) => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", pin.title);
        button.title = `${pin.title} — ${location.name}`;
        button.style.cssText = [
          "width:18px",
          "height:18px",
          "border:2px solid white",
          "border-radius:50%",
          `background:${familyColors[pin.family] ?? "#6b7280"}`,
          `box-shadow:0 1px 5px #0008${pin.id === selectedPinId ? ",0 0 0 4px #c2410c" : ""}`,
          "cursor:pointer",
        ].join(";");
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectPin(pin.id);
        });
        return new maplibregl.Marker({ element: button })
          .setLngLat([location.lng, location.lat])
          .addTo(map);
      }),
    );

    if (selectedPinId) {
      const selected = pins.find((pin) => pin.id === selectedPinId);
      const location = selected?.locations.find((item) => item.isAnchor) ?? selected?.locations[0];
      if (location) map.flyTo({ center: [location.lng, location.lat], essential: true });
    }
  }, [familyColors, mapReady, onSelectPin, pins, selectedPinId]);

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
          Loading map…
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
