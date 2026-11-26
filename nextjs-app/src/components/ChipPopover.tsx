"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";

interface ChipPopoverProps {
  id: string;
  label: string;
  boundaryRef: RefObject<HTMLElement | null>;
  anchorLeft: number;
  onClose: (restoreFocus: boolean) => void;
  children: ReactNode;
}

export function ChipPopover({ id, label, boundaryRef, anchorLeft, onClose, children }: ChipPopoverProps) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    panel.current?.querySelector<HTMLElement>("button, input")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      closeRef.current(true);
    };
    const onPointer = (event: PointerEvent) => {
      const boundary = boundaryRef.current;
      if (boundary && event.target instanceof Node && !boundary.contains(event.target)) {
        closeRef.current(false);
      }
    };

    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [boundaryRef]);

  return (
    <div
      ref={panel}
      id={id}
      role="group"
      aria-label={label}
      style={{ "--chip-left": `${anchorLeft}px` } as CSSProperties}
      className="absolute left-0 top-full z-40 mt-2 w-full max-w-full rounded-xl border border-stone-400 bg-white p-3 shadow-lg lg:left-[var(--chip-left)] lg:w-80"
    >
      {children}
    </div>
  );
}
