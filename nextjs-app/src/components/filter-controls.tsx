// What this file does: renders accessible topic and province filter chips.
"use client";

import { PROVINCE_LABELS, PROVINCE_KEYS, TOPICS, TOPIC_KEYS, type Province, type Topic } from "@/lib/vocab";

type Props = {
  topics: Topic[];
  provinces: Province[];
  hasFilters: boolean;
  onToggleTopic: (topic: Topic) => void;
  onToggleProvince: (province: Province) => void;
  onClear: () => void;
};

function Chip({ label, pressed, color = "#44403c", onClick }: { label: string; pressed: boolean; color?: string; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick}
      style={pressed ? { borderColor: color, backgroundColor: color, color: "#fff" } : { borderColor: color }}
      className="rounded-full border px-3 py-1.5 text-sm focus-visible:outline focus-visible:outline-2">
      {label}
    </button>
  );
}

export function FilterControls(props: Props) {
  return (
    <div className="space-y-3">
      <fieldset><legend className="mb-1 text-sm font-medium text-stone-700">Topic</legend>
        <div className="flex flex-wrap gap-2">{TOPIC_KEYS.map((key) => <Chip key={key} label={TOPICS[key].label} color={TOPICS[key].color} pressed={props.topics.includes(key)} onClick={() => props.onToggleTopic(key)} />)}</div>
      </fieldset>
      <fieldset><legend className="mb-1 text-sm font-medium text-stone-700">Province</legend>
        <div className="flex flex-wrap gap-2">{PROVINCE_KEYS.map((key) => <Chip key={key} label={PROVINCE_LABELS[key]} pressed={props.provinces.includes(key)} onClick={() => props.onToggleProvince(key)} />)}</div>
      </fieldset>
      {props.hasFilters && <button type="button" onClick={props.onClear} className="text-sm text-stone-600 underline">Clear filters</button>}
    </div>
  );
}
