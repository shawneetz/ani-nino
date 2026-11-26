// what this file does: gives the explorer map fit padding for width, height, panel and sheet state
"use client";

import { useEffect, useMemo, useState } from "react";
import { mapPadding, type FitPadding, type SheetSize } from "@/lib/fit-padding";

/**
 * Reads the window size and returns padding for the floating map pieces.
 */
export function useMapPadding(panelOpen = true, sheet: SheetSize = "peek"): FitPadding {
  const [width, setWidth] = useState(390);
  const [height, setHeight] = useState(844);

  useEffect(() => {
    const update = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return useMemo(() => mapPadding(width, panelOpen, sheet, height), [width, height, panelOpen, sheet]);
}