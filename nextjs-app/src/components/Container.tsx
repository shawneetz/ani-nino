// what this file does: one shared page width wrapper, so every page uses the same gutters and the same width
//   page = every reading page, the header row and the footer row use this width too
//   full = edge to edge, only for special layouts
// change in this version (v1): the old prose and wide widths are gone, there is one page width
//   reading text keeps its own max-w-[68ch] cap, so a wide page fills the row with grids and rails, not long lines
// change in this version (u1): added the rhythm and type constants below
import type { ReactNode } from "react";

export const PAGE_WIDTH = "max-w-6xl";

export const PAGE_STACK = "space-y-12 py-8";
export const SECTION_GAP = "space-y-12";
export const BLOCK_GAP = "space-y-6";
export const INNER_GAP = "space-y-3";
export const PAGE_HEADER = "space-y-3 border-t-2 border-ink pt-4";
export const PAGE_TITLE =
  "font-serif text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-tight tracking-tight text-stone-950";
export const HEADING = "font-serif text-2xl font-semibold tracking-tight text-stone-950";
export const BODY = "max-w-[68ch] font-serif text-lg leading-relaxed text-stone-800";

const WIDTHS = {
  page: PAGE_WIDTH,
  full: "max-w-none",
} as const;

type Props = {
  width?: keyof typeof WIDTHS;
  // "main" is for the page's single main area (it carries the skip-link id).
  as?: "div" | "main" | "section";
  className?: string;
  children: ReactNode;
};

export function Container({ width = "page", as = "div", className = "", children }: Props) {
  const Tag = as;
  return (
    <Tag
      // The skip link in layout.tsx jumps to #main, so only <main> gets that id.
      id={as === "main" ? "main" : undefined}
      className={`mx-auto w-full px-4 ${WIDTHS[width]} ${className}`}
    >
      {children}
    </Tag>
  );
}
