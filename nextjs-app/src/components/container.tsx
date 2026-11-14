// What this file does: one shared page-width wrapper, so every page uses the
// same side gutters and the same three widths.
//   prose = reading pages, wide = explorer and landing, full = edge to edge.
import type { ReactNode } from "react";

const WIDTHS = {
  prose: "max-w-3xl",
  wide: "max-w-7xl",
  full: "max-w-none",
} as const;

type Props = {
  width?: keyof typeof WIDTHS;
  // "main" is for the page's single main area (it carries the skip-link id).
  as?: "div" | "main" | "section";
  className?: string;
  children: ReactNode;
};

export function Container({ width = "wide", as = "div", className = "", children }: Props) {
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
