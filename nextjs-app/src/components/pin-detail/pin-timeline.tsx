import type { PinDetail } from "@/lib/api-schemas";
import { formatDate } from "./detail-labels";

export function PinTimeline({
  events,
  sourceTitles,
}: {
  events: PinDetail["events"];
  sourceTitles: Record<string, string>;
}) {
  if (events.length === 0) return null;
  const sorted = [...events].sort(
    (a, b) => a.eventDate.localeCompare(b.eventDate) || a.sortOrder - b.sortOrder,
  );

  return (
    <ol className="mt-2 space-y-3 border-l border-neutral-300 pl-4">
      {sorted.map((event) => {
        const sourceTitle = event.sourceId ? sourceTitles[event.sourceId] : undefined;
        return (
          <li key={event.id}>
            <time dateTime={event.eventDate} className="text-xs font-semibold text-neutral-700">
              {formatDate(event.eventDate, event.precision)}
            </time>
            <p className="text-sm text-neutral-800">{event.description}</p>
            {sourceTitle && <p className="text-xs text-neutral-600">Source: {sourceTitle}</p>}
          </li>
        );
      })}
    </ol>
  );
}
