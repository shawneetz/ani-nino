// what this file does: tells if the window is 1280px or wider
// the explorer uses it to collapse the results panel while the drawer is open on narrower desktops
// it returns null on the server and before the first measure
"use client";

import { useSyncExternalStore } from "react";

const WIDE_QUERY = "(min-width: 1280px)";

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(WIDE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const getSnapshot = (): boolean | null => window.matchMedia(WIDE_QUERY).matches;
const getServerSnapshot = (): boolean | null => null;

export function useIsWide(): boolean | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
