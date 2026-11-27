"use client";

import { useId, useRef, useState, type RefObject } from "react";
import type { Province, Topic } from "@/lib/vocab";
import { ChipPopover } from "./ChipPopover";
import { ProvinceOptions, TopicOptions } from "./FilterControls";
import { MOTION } from "./States";
import { YearSlider } from "./YearSlider";

type PopoverKey = "topic" | "province" | "year";

interface FilterChipsProps {
  topics: Topic[];
  provinces: Province[];
  year: number | null;
  confirmed: boolean;
  today: boolean;
  showToday: boolean;
  showYear: boolean;
  hasFilters: boolean;
  onToggleTopic: (topic: Topic) => void;
  onToggleProvince: (province: Province) => void;
  onSetYear: (year: number | null) => void;
  onToggleConfirmed: () => void;
  onToggleToday: () => void;
  onClear: () => void;
}

const CHIP =
  "tap-target inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border-2 px-4 font-sans text-base";
const CHIP_ON = `border-stone-900 bg-stone-900 text-white hover:bg-stone-700 ${MOTION}`;
const CHIP_OFF = `border-stone-500 bg-white text-stone-900 hover:border-ink active:bg-stone-200 ${MOTION}`;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-4 w-4 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m5 8 5 5 5-5" />
    </svg>
  );
}

function PopoverChip({
  label,
  count,
  open,
  controlsId,
  buttonRef,
  onClick,
}: {
  label: string;
  count: string | null;
  open: boolean;
  controlsId: string;
  buttonRef: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
}) {
  const active = count !== null;
  return (
    <button ref={buttonRef} type="button" aria-expanded={open} aria-controls={open ? controlsId : undefined} onClick={onClick} className={`${CHIP} ${active ? CHIP_ON : CHIP_OFF}`}>
      {count ? `${label} · ${count}` : label}
      <Chevron open={open} />
    </button>
  );
}

function SwitchChip({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={onClick} className={`${CHIP} ${checked ? CHIP_ON : CHIP_OFF}`}>
      {label}
    </button>
  );
}

export function FilterChips({
  topics,
  provinces,
  year,
  confirmed,
  today,
  showToday,
  showYear,
  hasFilters,
  onToggleTopic,
  onToggleProvince,
  onSetYear,
  onToggleConfirmed,
  onToggleToday,
  onClear,
}: FilterChipsProps) {
  const popoverId = useId();
  const root = useRef<HTMLDivElement>(null);
  const topicButton = useRef<HTMLButtonElement | null>(null);
  const provinceButton = useRef<HTMLButtonElement | null>(null);
  const yearButton = useRef<HTMLButtonElement | null>(null);
  const buttons = { topic: topicButton, province: provinceButton, year: yearButton };
  const [open, setOpen] = useState<PopoverKey | null>(null);
  const [anchorLeft, setAnchorLeft] = useState(0);

  function toggleOpen(key: PopoverKey) {
    if (open === key) {
      setOpen(null);
      return;
    }
    setAnchorLeft(buttons[key].current?.offsetLeft ?? 0);
    setOpen(key);
  }

  function close(restoreFocus: boolean) {
    const key = open;
    setOpen(null);
    if (restoreFocus && key) buttons[key].current?.focus();
  }

  return (
    <div ref={root} className="relative">
      <div role="group" aria-label="Filters" className="relative -mx-1 flex items-center gap-2 overflow-x-auto px-1 py-1 lg:overflow-visible">
        <PopoverChip label="Topic" count={topics.length > 0 ? String(topics.length) : null} open={open === "topic"} controlsId={popoverId} buttonRef={topicButton} onClick={() => toggleOpen("topic")} />
        <PopoverChip label="Province" count={provinces.length > 0 ? String(provinces.length) : null} open={open === "province"} controlsId={popoverId} buttonRef={provinceButton} onClick={() => toggleOpen("province")} />
        {showYear && <PopoverChip label="Year" count={year !== null ? String(year) : null} open={open === "year"} controlsId={popoverId} buttonRef={yearButton} onClick={() => toggleOpen("year")} />}
        <SwitchChip label="Confirmed only" checked={confirmed} onClick={onToggleConfirmed} />
        {showToday && <SwitchChip label="Today's echoes" checked={today} onClick={onToggleToday} />}
        {hasFilters && (
          <button type="button" aria-label="Clear filters" onClick={onClear} className="tap-target shrink-0 whitespace-nowrap rounded-full bg-white px-3 font-sans text-base text-stone-900 underline underline-offset-2">
            Clear
          </button>
        )}
      </div>

      {open && (
        <ChipPopover
          key={open}
          id={popoverId}
          label={open === "topic" ? "Topic filter" : open === "province" ? "Province filter" : "Year filter"}
          boundaryRef={root}
          anchorLeft={anchorLeft}
          onClose={close}
        >
          {open === "topic" && <TopicOptions topics={topics} onToggle={onToggleTopic} />}
          {open === "province" && <ProvinceOptions provinces={provinces} onToggle={onToggleProvince} />}
          {open === "year" && <YearSlider year={year} onChange={onSetYear} showNote={showToday} />}
        </ChipPopover>
      )}
    </div>
  );
}
