// what this file does: shared button and button-link styles
// every button is at least 44px tall. "primary" is the main action on a screen
// ButtonLink opens internal links with next/link, and external links in a new tab
// change in this version (e3): 4px corners on reading pages, sans type, secondary is transparent
// (white is only for map overlays and inputs), and a visible disabled look
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { MOTION } from "./States";

type Variant = "primary" | "secondary" | "inverse" | "quiet";

// one place for the look, so Button and ButtonLink can never drift apart
function styles(variant: Variant, className: string): string {
  const base =
    `tap-target inline-flex items-center justify-center rounded-sm border px-4 py-2 font-sans text-base font-medium disabled:cursor-not-allowed disabled:opacity-50 ${MOTION}`;
  const looks: Record<Variant, string> = {
    primary: "border-accent bg-accent text-white hover:bg-accent-strong active:border-amber-950 active:bg-amber-950",
    inverse: "border-stone-100 bg-transparent text-stone-50 hover:bg-stone-50/15 active:bg-stone-50/25",
    secondary: "border-stone-500 bg-transparent text-stone-900 hover:border-ink active:bg-stone-200",
    quiet: "border-transparent bg-transparent text-stone-900 underline underline-offset-4 hover:border-ink active:bg-stone-200",
  };
  return `${base} ${looks[variant]} ${className}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant = "primary", className = "", type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={styles(variant, className)} {...rest} />;
}

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({ href, variant = "primary", className = "", children }: ButtonLinkProps) {
  // anything that starts with http is outside this site
  const external = /^https?:\/\//.test(href);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={styles(variant, className)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={styles(variant, className)}>
      {children}
    </Link>
  );
}