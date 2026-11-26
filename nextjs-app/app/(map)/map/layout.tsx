// what this file does: the frame for /map, a full height column with the header and no footer
// the main area takes all the space under the header, and the explorer fills it with an absolute layer
// this layout owns <main id="main">, so the skip link still lands and the page must not render another main
// the main area does not scroll, the map and its floating pieces scroll on their own
// the route group name "(map)" is not part of the url, /map stays /map
// change in this version (m2): the main area no longer scrolls, the map fills it
// it is a server component and ships no client code
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export default function MapLayout({ children }: { children: ReactNode }) {
  return (
    // h-dvh is the visible height on phones, so the browser bar never hides the bottom of the map
    <div className="flex h-dvh flex-col">
      <SiteHeader />
      {/* min-h-0 lets the flex child shrink to the screen, overflow-hidden keeps floating layers inside */}
      <main id="main" className="relative min-h-0 flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}