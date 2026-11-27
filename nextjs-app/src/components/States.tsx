// what this file does: shared hover, pressed, motion and empty state pieces (spec 8.2 rules 6 and 9)
// the focus ring is global (globals.css), so it is not repeated here
import type { ReactNode } from "react";
import { INNER_GAP } from "./Container";

export const MOTION = "motion-safe:transition-colors motion-safe:duration-150";
export const ROW_HOVER = `${MOTION} hover:bg-stone-100 active:bg-stone-200`;
export const EMPTY_BODY = "max-w-[68ch] font-serif leading-relaxed text-stone-800";
export const EMPTY_ACTION = `tap-target inline-flex items-center font-sans text-base underline underline-offset-2 ${MOTION} hover:text-stone-950`;

interface EmptyStateProps {
  title: string;
  children?: ReactNode;
  role?: "alert" | "status";
  className?: string;
}

export function EmptyState({ title, children, role, className = "" }: EmptyStateProps) {
  return (
    <div
      role={role}
      data-testid="empty-state"
      className={`${INNER_GAP} rounded-sm border border-dashed border-stone-500 p-4 ${className}`}
    >
      <p className="font-serif text-lg font-semibold text-stone-950">{title}</p>
      {children}
    </div>
  );
}
