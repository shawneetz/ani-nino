import type { PinDetail } from "@/lib/api-schemas";
import type { SourceKind } from "@/lib/enums";

type SourceRole = PinDetail["sources"][number]["role"];
type EventPrecision = PinDetail["events"][number]["precision"];
type LocationPrecision = PinDetail["locations"][number]["precision"];

export const LAYER_LABELS: Record<PinDetail["layer"], string> = {
  martial_law: "Martial-law era",
  today: "Today",
};

export const ROLE_LABELS: Record<SourceRole, string> = {
  promise: "Sources for the promise",
  record: "Sources for the record",
  context: "Background sources",
};

export const KIND_LABELS: Record<SourceKind, string> = {
  law_or_decree: "Law or decree",
  court_decision: "Court decision",
  government_release: "Government release",
  period_publication: "Period publication",
  archive: "Archive",
  academic: "Academic",
  news: "News",
  advocacy_publication: "Advocacy publication",
  video: "Video",
};

export const APPROXIMATE_PRECISIONS: LocationPrecision[] = ["province", "area"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string, precision: EventPrecision = "day"): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (precision === "year") return String(year);
  const monthName = MONTHS[month - 1];
  return precision === "month" ? `${monthName} ${year}` : `${monthName} ${day}, ${year}`;
}
