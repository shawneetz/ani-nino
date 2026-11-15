// what this file does: shows whether a program is Confirmed or Still checking
// "Still checking" is highlighted in amber so unchecked programs stand out
// added a size prop, "large" is used in the program header
import { PROGRAM_STATUSES, type ProgramStatus } from "@/lib/vocab";

type Props = {
  status: ProgramStatus;
  hideConfirmed?: boolean;
  size?: "normal" | "large";
};

// padding and text size for each size, so the tag is never smaller than 15px
const SIZES = {
  normal: "px-2 py-0.5 text-sm font-medium",
  large: "px-3 py-1 text-base font-semibold",
} as const;

export function StatusTag({ status, hideConfirmed = false, size = "normal" }: Props) {
  // some views stay quiet about confirmed programs when asked
  // (the redesign shows the tag on every card, so it will stop using this later)
  if (status === "confirmed" && hideConfirmed) return null;

  // the words carry the meaning, color is only extra help
  const style =
    status === "confirmed"
      ? "border-emerald-400 bg-emerald-50 text-emerald-900"
      : "border-amber-500 bg-amber-50 text-amber-900";

  return (
    <span className={`inline-block rounded border ${SIZES[size]} ${style}`}>
      {PROGRAM_STATUSES[status]}
    </span>
  );
}