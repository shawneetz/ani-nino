// What this file does: explains topic colors and marker styles.
import { TOPICS, TOPIC_KEYS } from "@/lib/vocab";
export function Legend() {
  return <div className="space-y-2 text-sm text-stone-700"><ul className="flex flex-wrap gap-4">{TOPIC_KEYS.map((key) => <li key={key} className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded-full" style={{ background: TOPICS[key].color }} />{TOPICS[key].label}</li>)}</ul><p className="text-stone-600">Solid marker: confirmed · hollow marker: still checking · dashed border: approximate place</p></div>;
}
