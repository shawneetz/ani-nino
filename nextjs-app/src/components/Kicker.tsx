// what this file does: a small uppercase label that sits above a title
// examples: "Martial-law farm programs · CALABARZON · 1972 to 1986" or "Land · 1972 onward"
// sans type, 0.875rem, wide letter spacing, accent-strong color (spec section 8)
// it is a server component and ships no client code
import type { ReactNode } from "react";

/**
 * Props for the Kicker component.
 */
interface KickerProps {
  /** The label text. Keep it short, one line on a phone if possible. */
  children: ReactNode;
  /** The element to render. Defaults to `"p"`, use `"span"` inside a heading row. */
  as?: "p" | "span" | "div";
  /** Extra classes, for example spacing from the parent layout. */
  className?: string;
}

/**
 * Renders the uppercase label above a title.
 *
 * @remarks
 * Server Component. The color is accent-strong on paper, which keeps the
 * contrast rule (stone-700 or darker, never under 15px) intact.
 *
 * @example
 * ```tsx
 * <Kicker>Land · 1972 onward</Kicker>
 * ```
 */
export function Kicker({ children, as = "p", className = "" }: KickerProps) {
  const Tag = as;
  return (
    <Tag className={`font-sans text-sm font-semibold uppercase tracking-kicker text-accent-strong ${className}`}>
      {children}
    </Tag>
  );
}