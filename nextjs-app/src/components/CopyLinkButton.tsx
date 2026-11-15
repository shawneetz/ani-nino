// what this file does: a button that copies the current page link
// it shows a visible "copied" confirmation and announces it to screen readers
"use client";

import { useEffect, useRef, useState } from "react";

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
  const color =
    status === "copied"
      ? "border-emerald-700 bg-emerald-50 text-emerald-900"
      : status === "failed"
        ? "border-rose-700 bg-rose-50 text-rose-900"
        : "border-stone-400 bg-white text-stone-900 hover:border-stone-600";

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex min-h-[44px] items-center rounded-lg border px-4 text-base font-medium focus-visible:outline focus-visible:outline-2 ${color}`}
    >
      {label}
      {/* live region so the result is announced */}
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied" ? "Link copied to clipboard" : status === "failed" ? "Could not copy the link" : ""}
      </span>
    </button>
  );
}
