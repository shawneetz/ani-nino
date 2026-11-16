// What this file does: one shared card box (border, radius, padding).
// Use it for any grouped content so cards look the same on every page.
import type { ReactNode } from "react";

type Props = {
  as?: "div" | "article" | "li";
  className?: string;
  children: ReactNode;
};

export function Card({ as = "div", className = "", children }: Props) {
  const Tag = as;
  return (
    <Tag className={`rounded-card border border-stone-200 bg-white p-4 sm:p-5 ${className}`}>
      {children}
    </Tag>
  );
}
