// What this file does: shows whether a pin is a lead or has been verified.
import type { Status } from "@/lib/enums";
import { STATUS_LABELS } from "@/lib/vocab";

export function StatusTag({ status }: { status: Status }) {
  const color = status === "verified" ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950";
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>{STATUS_LABELS[status]}</span>;
}
