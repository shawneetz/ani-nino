// what this file does: shows whether a program is Confirmed or Still checking
// "Still checking" is highlighted in amber so unchecked programs stand out
// size "large" is used in the program header
// change in this version (e3): small rectangle tag, uppercase text, thin border, wide letter spacing
// the words carry the meaning, color is only extra help
import { PROGRAM_STATUSES, type ProgramStatus } from "@/lib/vocab";

type Props = {
  status: ProgramStatus;
  hideConfirmed?: boolean;
  size?: "normal" | "large";
};

// padding and text size for each size, never smaller than 15px
const SIZES = {
  normal: "px-2 py-0.5 text-sm font-semibold",
  large: "px-3 py-1 text-base font-semibold",
} as const;

export function StatusTag({ status, hideConfirmed = false, size = "normal" }: Props) {
  // some views stay quiet about confirmed programs when asked
  if (status === "confirmed" && hideConfirmed) return null;

  // green for confirmed, amber for still checking
  const style =
    status === "confirmed"
      ? "border-emerald-700 bg-emerald-50 text-emerald-900"
      : "border-amber-600 bg-amber-50 text-amber-900";

  return (
    <span className={`inline-block rounded-sm border font-sans uppercase tracking-wider ${SIZES[size]} ${style}`}>
      {PROGRAM_STATUSES[status]}
    </span>
  );
}