// What this file does: shows whether a program is Confirmed or Still checking.
// "Still checking" is highlighted in amber so unchecked programs stand out.
import { PROGRAM_STATUSES, type ProgramStatus } from "@/lib/vocab";

export function StatusTag({
  status,
  hideConfirmed = false,
}: {
  status: ProgramStatus;
  hideConfirmed?: boolean;
}) {
  // Some views stay quiet about confirmed programs when asked.
  // (The redesign shows the tag on every card, so it will stop using this later.)
  if (status === "confirmed" && hideConfirmed) return null;

  // The words carry the meaning. Color is only extra help.
  const style =
    status === "confirmed"
      ? "border-emerald-400 bg-emerald-50 text-emerald-900"
      : "border-amber-500 bg-amber-50 text-amber-900";

  return (
    <span className={`inline-block rounded border px-2 py-0.5 text-sm font-medium ${style}`}>
      {PROGRAM_STATUSES[status]}
    </span>
  );
}
