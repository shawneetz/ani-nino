// what this file does: the frame for every normal page (landing, programs, charts, sources, about)
// header on top, the page in the middle, footer at the bottom
// each page renders its own <main id="main"> through Container, so the skip link still lands
// the route group name "(site)" is not part of the url, so no address changes
// it is a server component and ships no client code
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function SiteLayout({ children }: { children: ReactNode }) {
  // a fragment keeps the same flex column the root body had, so the footer still sticks to the bottom
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}