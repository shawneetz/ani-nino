// what this file does: one shared page width wrapper, so every page uses the same gutters and the same width
//   page = every reading page, the header row and the footer row use this width too
//   full = edge to edge, only for special layouts
// change in this version (v1): the old prose and wide widths are gone, there is one page width
//   reading text keeps its own max-w-[68ch] cap, so a wide page fills the row with grids and rails, not long lines
import type { ReactNode } from "react";

export const PAGE_WIDTH = "max-w-6xl";

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
