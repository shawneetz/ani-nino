// What this file does: draws filtered programs as accessible MapLibre markers.
// Every place of a program gets its own pin. Round = martial law, square = today.
"use client";
// The CSP build runs its worker from a real file, which works with Next's bundler.
import * as maplibregl from "maplibre-gl/dist/maplibre-gl-csp";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { TOPICS, type Province } from "@/lib/vocab";
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// Must match the file copied by scripts/copy-maplibre-worker.mjs.
maplibregl.setWorkerUrl("/maplibre-gl-csp-worker.js");

export default function PinMap({ programs, provinces }: { programs: ExplorerProgram[]; provinces: Province[] }) {
  const router = useRouter(); const box = useRef<HTMLDivElement>(null); const map = useRef<maplibregl.Map | null>(null); const markers = useRef<maplibregl.Marker[]>([]);
  useEffect(() => { if (!box.current) return; const instance = new maplibregl.Map({ container: box.current, style: STYLE_URL, center: [121.3, 14.1], zoom: 8.2 }); instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right"); map.current = instance; return () => { instance.remove(); map.current = null; }; }, []);
  useEffect(() => { const instance = map.current; if (!instance) return; markers.current.forEach((marker) => marker.remove()); markers.current = programs.flatMap((program) => program.places.filter((place) => provinces.length === 0 || provinces.includes(place.province)).map((place) => { const color = TOPICS[program.topic].color; const el = document.createElement("button"); el.type = "button"; el.title = `${program.title} (${place.name})`; el.setAttribute("aria-label", `${program.title}, ${place.name}. Open program page`); Object.assign(el.style, { width: "22px", height: "22px", cursor: "pointer", borderRadius: program.era === "today" ? "4px" : "9999px", background: program.status === "confirmed" ? color : "#fff", border: `3px ${place.approximate ? "dashed" : "solid"} ${color}` }); el.addEventListener("click", () => router.push(`/programs/${program.slug}`)); return new maplibregl.Marker({ element: el }).setLngLat([place.lng, place.lat]).addTo(instance); })); }, [programs, provinces, router]);
  return <div ref={box} role="region" aria-label="Map of programs" className="h-full min-h-[320px] w-full rounded-lg border border-stone-200" />;
}
