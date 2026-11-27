// what this file does: a button that copies the current page link
// it shows a visible "copied" confirmation and announces it to screen readers
// change in this version (c10): hidden in print, the page address is not needed on paper
// (the cite block keeps the address in print)
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

type Status = "idle" | "copied" | "failed";

export function CopyLinkButton() {
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // clear any pending reset when the component unmounts
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    // copy the clean page url without any hash
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      // clipboard can be blocked, so say so instead of failing silently
      setStatus("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2500);
  }

  const label = status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : "Copy link";
  return (
    <>
      <Button variant="quiet" onClick={copy} className="print:hidden">
        {label}
      </Button>
      {/* live region so the result is announced */}
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied" ? "Link copied to clipboard" : status === "failed" ? "Could not copy the link" : ""}
      </span>
    </>
  );
}
