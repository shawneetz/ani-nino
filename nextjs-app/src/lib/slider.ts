// What this file does: validates, moves and labels the month used by the slider.
// The range comes from filter.ts, so the slider and the API accept the same months.
import { SLIDER_END_MONTH, SLIDER_START_MONTH } from "./filter";

export const DEFAULT_MONTH = "1975-06";
export const MIN_MONTH = SLIDER_START_MONTH;
export const MAX_MONTH = SLIDER_END_MONTH;

// True only for a real YYYY-MM inside the slider range.
export function isValidMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && value >= MIN_MONTH && value <= MAX_MONTH;
}

// Converts YYYY-MM to a whole number so the range input can use it.
export function monthIndex(value: string): number {
  const [year, month] = value.split("-").map(Number);
  return year * 12 + month - 1;
}

export function monthFromIndex(index: number): string {
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function addMonths(value: string, count: number): string {
  return monthFromIndex(monthIndex(value) + count);
}

// "June 1975", for the label above the slider.
export function monthLabel(value: string): string {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}
