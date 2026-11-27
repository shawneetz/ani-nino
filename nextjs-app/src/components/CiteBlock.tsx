// what this file does: the "cite this page" box on a program page
// it shows the citation line and a button that copies exactly that line
// the line is built on the server and passed in as a prop
// change in this version (c10): the citation stays in print, only the copy button is hidden
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { INNER_GAP } from "./Container";

type Status = "idle" | "copied" | "failed";

interface CiteBlockProps {
  /** The finished citation line, built on the server. */
  text: string;
}

export function CiteBlock({ text }: CiteBlockProps) {
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2500);
  }

  const label = status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : "Copy citation";

  return (
    <div className={`${INNER_GAP} border-l-4 border-stone-500 py-1 pl-4`}>
      <p
        data-testid="citation-text"
        className="max-w-[68ch] font-serif text-lg leading-relaxed text-stone-800 [overflow-wrap:anywhere]"
      >
        {text}
      </p>
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Button variant="secondary" onClick={copy}>
          {label}
        </Button>
        <span role="status" aria-live="polite" className="sr-only">
          {status === "copied" ? "Citation copied to clipboard" : status === "failed" ? "Could not copy the citation" : ""}
        </span>
      </div>
    </div>
  );
}
