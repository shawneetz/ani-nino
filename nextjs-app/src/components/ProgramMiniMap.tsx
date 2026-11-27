// what this file does: the "where" block of a program page
// a small map of this program's places with the places listed beside it
// the map code is loaded only when the block is close to the screen,
// so readers who never scroll down do not download maplibre
// it reuses PinMap in embedded mode, so markers look the same as on /map
// change in this version (c10): in print the map is hidden and the places list stays,
// the grid falls back to one column so the list does not sit in a half empty row
"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { PROVINCE_LABELS } from "@/lib/vocab";
import { INNER_GAP } from "./Container";

// grey pulsing box shown until the map is ready
function MapPlaceholder() {
    return <div className="absolute inset-0 animate-pulse bg-stone-100" />;
}

// the map is loaded in the browser only
const PinMap = dynamic(() => import("./PinMap"), { ssr: false, loading: () => <MapPlaceholder /> });

export function ProgramMiniMap({ program }: { program: ExplorerProgram }) {
    const box = useRef<HTMLDivElement>(null);
    const [near, setNear] = useState(false);
    // one stable array, so the map does not rebuild its markers on every render
    const programs = useMemo(() => [program], [program]);
    const hasApproximate = program.places.some((place) => place.approximate);

    // start loading the map when the block is within 300px of the screen
    useEffect(() => {
        const node = box.current;
        if (!node) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setNear(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "300px" },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        // stacked on phones, map and list side by side from 768px
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_16rem] print:block!">
            {/* PinMap fills its parent, so the parent needs a position and a height */}
            <div ref={box} className="relative h-80 md:h-96 print:hidden">
                {near ? <PinMap programs={programs} embedded /> : <MapPlaceholder />}
            </div>

            <div className={INNER_GAP}>
                <h3 className="font-sans text-sm font-semibold uppercase tracking-kicker text-stone-700">Places</h3>
                <ul className="border-t border-stone-400">
                    {program.places.map((place) => (
                        <li
                            key={`${place.name}-${place.province}`}
                            className="border-b border-stone-400 py-2 font-serif text-lg text-stone-800"
                        >
                            {place.name}, {PROVINCE_LABELS[place.province]}
                            {place.approximate ? " (approximate)" : ""}
                        </li>
                    ))}
                </ul>
                {hasApproximate && (
                    <p className="text-base text-stone-700 print:hidden">A dashed marker means the place is approximate.</p>
                )}
            </div>
        </div>
    );
}