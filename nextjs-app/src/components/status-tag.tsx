// What this file does: highlights programs whose evidence is still being checked.
import { PROGRAM_STATUSES, type ProgramStatus } from "@/lib/vocab";

export function StatusTag({
  status,
  hideConfirmed = false,
}: {
  status: ProgramStatus;
  hideConfirmed?: boolean;
}) {
  // The program list stays quiet about confirmed programs when requested.
  if (status === "confirmed" && hideConfirmed) return null;

  const style =
    status === "confirmed"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : "border-amber-400 bg-amber-50 text-amber-900";

  return (
    <span className={`inline-block rounded border px-1.5 py-0.5 text-xs font-medium ${style}`}>
      {PROGRAM_STATUSES[status]}
    </span>
  );
}
