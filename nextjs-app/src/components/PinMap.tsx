// What this file does: draws filtered programs as accessible MapLibre markers.
"use client";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { TOPICS } from "@/lib/vocab";
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
export default function PinMap({ programs }: { programs: ExplorerProgram[] }) {
  const router = useRouter(); const box = useRef<HTMLDivElement>(null); const map = useRef<maplibregl.Map | null>(null); const markers = useRef<maplibregl.Marker[]>([]);
  useEffect(() => { if (!box.current) return; const instance = new maplibregl.Map({ container: box.current, style: STYLE_URL, center: [121.3, 14.1], zoom: 8.2 }); instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right"); map.current = instance; return () => { instance.remove(); map.current = null; }; }, []);
  useEffect(() => { const instance = map.current; if (!instance) return; markers.current.forEach((marker) => marker.remove()); markers.current = programs.flatMap((program) => { const place = program.places[0]; if (!place) return []; const el = document.createElement("button"); el.type = "button"; el.title = program.title; el.setAttribute("aria-label", `${program.title}. Open program page`); Object.assign(el.style, { width: "22px", height: "22px", borderRadius: "9999px", cursor: "pointer", background: program.status === "confirmed" ? TOPICS[program.topic].color : "#fff", border: `3px ${place.approximate ? "dashed" : "solid"} ${TOPICS[program.topic].color}` }); el.addEventListener("click", () => router.push(`/programs/${program.slug}`)); return [new maplibregl.Marker({ element: el }).setLngLat([place.lng, place.lat]).addTo(instance)]; }).flat(); }, [programs, router]);
  return <div ref={box} role="region" aria-label="Map of programs" className="h-full min-h-[320px] w-full rounded-lg border border-stone-200" />;
}
