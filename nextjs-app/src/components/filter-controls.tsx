// What this file does: renders accessible topic, layer and province filter chips.
// Every chip is at least 44px tall so it is easy to tap on a phone.
"use client";

import { PROVINCE_LABELS, PROVINCE_KEYS, TOPICS, TOPIC_KEYS, type Province, type Topic } from "@/lib/vocab";

type Props = {
  topics: Topic[];
  provinces: Province[];
  today: boolean;
  hasFilters: boolean;
  onToggleTopic: (topic: Topic) => void;
  onToggleProvince: (province: Province) => void;
  onToggleToday: () => void;
  onClear: () => void;
};

// One chip. When pressed it is filled with its color, so state never depends on color alone:
// aria-pressed also tells screen readers.
function Chip({ label, pressed, color = "#44403c", onClick }: { label: string; pressed: boolean; color?: string; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick}
      style={pressed ? { borderColor: color, backgroundColor: color, color: "#fff" } : { borderColor: color }}
      className="tap-target rounded-full border-2 px-4 text-base">
      {label}
    </button>
  );
}

export function FilterControls(props: Props) {
  return (
    <div className="space-y-4">
      <fieldset><legend className="mb-2 text-base font-medium text-stone-700">Topic</legend>
        <div className="flex flex-wrap gap-2">{TOPIC_KEYS.map((key) => <Chip key={key} label={TOPICS[key].label} color={TOPICS[key].color} pressed={props.topics.includes(key)} onClick={() => props.onToggleTopic(key)} />)}</div>
      </fieldset>
      <fieldset><legend className="mb-2 text-base font-medium text-stone-700">Layer</legend>
        {/* A real on/off switch: adds the echo programs of today to the map. */}
        <button type="button" role="switch" aria-checked={props.today} onClick={props.onToggleToday}
          style={props.today ? { borderColor: "#b45309", backgroundColor: "#b45309", color: "#fff" } : { borderColor: "#b45309" }}
          className="tap-target rounded-full border-2 px-4 text-base">
          Today
        </button>
      </fieldset>
      <fieldset><legend className="mb-2 text-base font-medium text-stone-700">Province</legend>
        <div className="flex flex-wrap gap-2">{PROVINCE_KEYS.map((key) => <Chip key={key} label={PROVINCE_LABELS[key]} pressed={props.provinces.includes(key)} onClick={() => props.onToggleProvince(key)} />)}</div>
      </fieldset>
      {props.hasFilters && <button type="button" onClick={props.onClear} className="tap-target text-base text-stone-700 underline underline-offset-2">Clear filters</button>}
    </div>
  );
}
