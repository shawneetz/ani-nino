// what this file does: gives the explorer the map fit padding for the current screen width
// it recalculates on resize and rotation, and keeps the same object when nothing changed,
// so the map does not react to every resize event
// the first render uses the phone padding, the real value is set as soon as the page is in the browser
// change in this version (m3): new
"use client";

import { useEffect, useState } from "react";
import { mapPadding, type FitPadding } from "@/lib/fit-padding";

// two paddings are the same when every side matches
function same(a: FitPadding, b: FitPadding): boolean {
  return a.top === b.top && a.right === b.right && a.bottom === b.bottom && a.left === b.left;
}

/**
 * Reads the window width and returns the padding the floating map pieces need.
 *
 * @returns A padding that changes only when a side really changes.
 */
export function useMapPadding(): FitPadding {
  // 390 is a phone width, the server never knows the real one
  const [padding, setPadding] = useState<FitPadding>(() => mapPadding(390));

  useEffect(() => {
    const update = () => {
      const next = mapPadding(window.innerWidth);
      setPadding((current) => (same(current, next) ? current : next));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return padding;
}
