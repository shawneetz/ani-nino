// what this file does: one shared card box (border, radius, padding)
// change in this version (e3): square 4px corners and a stone-300 hairline border
// the editorial plan keeps boxes for map overlays and inputs only, so pages drop Card
// as they are redesigned (landing e4, program page e5, charts and about e7)
import type { ReactNode } from "react";

type Props = {
  as?: "div" | "article" | "li";
  className?: string;
  children: ReactNode;
};

export function Card({ as = "div", className = "", children }: Props) {
  const Tag = as;
  return (
    <Tag className={`rounded-sm border border-stone-300 bg-white p-4 sm:p-5 ${className}`}>
      {children}
    </Tag>
  );
}