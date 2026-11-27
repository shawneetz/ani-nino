// what this file does: topic, province, show and layer filter controls
// change in this version
//   c1: hides the today layer when there are no today programs, and keeps clear in its own row
//   c2: adds the confirmed only switch
//   layout "row" puts labels and chips inline for the programs page filter bar
//   layout "stack" is the roomy version used in stacked layouts
//   m5: the topic and province option lists are exported on their own (TopicOptions, ProvinceOptions)
//   so the map chip popovers reuse the exact same chips as this component
// every chip and switch is at least 44px tall so it is easy to tap on a phone
"use client";

import { useId } from "react";
import { PROVINCE_KEYS, PROVINCE_LABELS, TOPIC_KEYS, TOPICS, type Province, type Topic } from "@/lib/vocab";
import { MOTION } from "./States";

type Props = {
  topics: Topic[];
  provinces: Province[];
  today: boolean;
  confirmed: boolean;
  hasFilters: boolean;
  showToday: boolean;
  layout?: "row" | "stack";
  onToggleTopic: (topic: Topic) => void;
  onToggleProvince: (province: Province) => void;
  onToggleToday: () => void;
  onToggleConfirmed: () => void;
  onClear: () => void;
};

// one chip, when pressed it is filled with its color
// aria-pressed also tells screen readers, so state never depends on color alone
function Chip({ label, pressed, color = "#44403c", onClick }: { label: string; pressed: boolean; color?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      style={pressed ? { borderColor: color, backgroundColor: color, color: "#fff" } : { borderColor: color }}
      className={`tap-target rounded-full border-2 px-4 text-base hover:bg-stone-100 active:bg-stone-200 ${MOTION}`}
    >
      {label}
    </button>
  );
}

export function TopicOptions({ topics, onToggle }: { topics: Topic[]; onToggle: (topic: Topic) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TOPIC_KEYS.map((key) => (
        <Chip key={key} label={TOPICS[key].label} color={TOPICS[key].color} pressed={topics.includes(key)} onClick={() => onToggle(key)} />
      ))}
    </div>
  );
}

export function ProvinceOptions({ provinces, onToggle }: { provinces: Province[]; onToggle: (province: Province) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PROVINCE_KEYS.map((key) => (
        <Chip key={key} label={PROVINCE_LABELS[key]} pressed={provinces.includes(key)} onClick={() => onToggle(key)} />
      ))}
    </div>
  );
}

// full class names for each switch tone, tailwind only sees whole strings
const SWITCH_TONES = {
  accent: {
    on: "border-accent bg-accent text-white hover:bg-accent-strong",
    off: "border-accent bg-white text-stone-900 hover:bg-stone-100 active:bg-stone-200",
  },
  confirmed: {
    on: "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800",
    off: "border-emerald-700 bg-white text-stone-900 hover:bg-stone-100 active:bg-stone-200",
  },
} as const;

function Switch({
  label,
  hint,
  checked,
  tone,
  onClick,
}: {
  label: string;
  hint: string;
  checked: boolean;
  tone: keyof typeof SWITCH_TONES;
  onClick: () => void;
}) {
  const hintId = useId();
  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={hintId}
        onClick={onClick}
        className={`tap-target rounded-full border-2 px-4 text-base ${MOTION} ${checked ? SWITCH_TONES[tone].on : SWITCH_TONES[tone].off}`}
      >
        {label}
      </button>
      <span id={hintId} className="text-sm text-stone-700">{hint}</span>
    </>
  );
}

export function FilterControls({ layout = "stack", ...props }: Props) {
  // useId keeps ids unique when the controls render in the bar and in the sheet
  const uid = useId();
  const row = layout === "row";
  const group = row ? "flex flex-wrap items-center gap-2" : "space-y-2";
  const label = "text-base font-medium text-stone-700";

  return (
    <div className={row ? "space-y-2" : "space-y-5"}>
      <div role="group" aria-labelledby={`${uid}-topic`} className={group}>
        <span id={`${uid}-topic`} className={label}>Topic</span>
        <TopicOptions topics={props.topics} onToggle={props.onToggleTopic} />
      </div>

      <div role="group" aria-labelledby={`${uid}-province`} className={group}>
        <span id={`${uid}-province`} className={label}>Province</span>
        <ProvinceOptions provinces={props.provinces} onToggle={props.onToggleProvince} />
      </div>

      <div role="group" aria-labelledby={`${uid}-show`} className={group}>
        <span id={`${uid}-show`} className={label}>Show</span>
        <Switch
          label="Confirmed only"
          hint="Programs checked against their sources."
          checked={props.confirmed}
          tone="confirmed"
          onClick={props.onToggleConfirmed}
        />
      </div>

      {props.showToday && (
        <div role="group" aria-labelledby={`${uid}-layer`} className={group}>
          <span id={`${uid}-layer`} className={label}>Layer</span>
          <Switch
            label="Show today's echoes"
            hint="Adds programs from today that echo the older ones."
            checked={props.today}
            tone="accent"
            onClick={props.onToggleToday}
          />
        </div>
      )}

      {props.hasFilters && (
        <div>
          <button type="button" onClick={props.onClear} className="tap-target text-base text-stone-700 underline underline-offset-2">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
