// what this file does: gives the explorer the map fit padding for the current screen width
// it recalculates on resize and rotation and when the results panel opens or collapses,
// and keeps the same object while nothing changed, so the map does not react to every resize event
// the first render uses the phone width, the real width is set as soon as the page is in the browser
// change in this version (m3): new
// change in this version (m4): takes panelOpen, the width is state and the padding is derived from it
"use client";

import { useEffect, useMemo, useState } from "react";
import { mapPadding, type FitPadding } from "@/lib/fit-padding";

/**
 * Reads the window width and returns the padding the floating map pieces need.
 *
 * @param panelOpen - Whether the results panel is open. Defaults to `true`.
 * @returns A padding object that only changes when the width or the panel state changes.
 */
export function useMapPadding(panelOpen = true): FitPadding {
  // 390 is a phone width, the server never knows the real one
  const [width, setWidth] = useState(390);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // react skips the update when the width is the same, so resize events cost nothing
  return useMemo(() => mapPadding(width, panelOpen), [width, panelOpen]);
}