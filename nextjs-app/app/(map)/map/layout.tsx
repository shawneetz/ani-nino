// what this file does: the frame for /map, a full height column with the header and no footer
// the main area takes all the space under the header, so the map can fill it (m2)
// this layout owns <main id="main">, so the skip link still lands and the page must not render another main
// until m2 lands the explorer is still a scrolling page, so the main area scrolls on its own
//   overflow-y-auto can be removed in m2 when the map fills the area
// the route group name "(map)" is not part of the url, /map stays /map
// it is a server component and ships no client code
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export default function MapLayout({ children }: { children: ReactNode }) {
  return (
    // h-dvh is the visible height on phones, so the browser bar never hides the bottom of the map
    <div className="flex h-dvh flex-col">
      <SiteHeader />
      {/* min-h-0 lets the flex child shrink and scroll instead of growing past the screen */}
      <main id="main" className="relative min-h-0 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}