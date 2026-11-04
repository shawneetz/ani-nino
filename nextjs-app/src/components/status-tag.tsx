// What this file does: highlights programs whose evidence is still being checked.
import { PROGRAM_STATUSES, type ProgramStatus } from "@/lib/vocab";
import type { Status } from "@/lib/enums";

export function StatusTag({ status, hideConfirmed = false }: { status: ProgramStatus | Status; hideConfirmed?: boolean }) {
  if (status === "confirmed" && hideConfirmed) return null;
  const isConfirmed = status === "confirmed" || status === "verified";
  const label = status in PROGRAM_STATUSES ? PROGRAM_STATUSES[status as ProgramStatus] : "Lead";
  const style = isConfirmed ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-amber-400 bg-amber-50 text-amber-900";
  return <span className={`inline-block rounded border px-1.5 py-0.5 text-xs font-medium ${style}`}>{label}</span>;
}
