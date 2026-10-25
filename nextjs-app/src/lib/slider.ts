export const DEFAULT_MONTH = "1975-06";
export const MIN_MONTH = "1972-09";
export const MAX_MONTH = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

export function isValidMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

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

export function monthLabel(value: string): string {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}
