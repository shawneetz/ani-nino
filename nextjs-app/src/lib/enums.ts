// What this file does: lists every allowed value for the fixed vocabularies.
// The database enums, Zod schemas and UI labels all import from here,
// so they cannot drift apart.

// Which layer a pin belongs to.
export const LAYERS = ["martial_law", "today"] as const;

// A pin is either checked against its sources (verified) or still open (lead).
export const STATUSES = ["lead", "verified"] as const;

// Evidence class of a CLAIM (the pin's record, or a chart point).
// It describes the claim, not the outlet that reported it.
export const BADGES = [
  "official",
  "independent_record",
  "advocacy_report",
  "supporters_claim",
] as const;

// What kind of outlet a source is. Different from the badge.
export const SOURCE_KINDS = [
  "law_or_decree",
  "court_decision",
  "government_release",
  "period_publication",
  "archive",
  "academic",
  "news",
  "advocacy_publication",
  "video",
] as const;

// Does a source back the promise, the record, or just give background?
export const SOURCE_ROLES = ["promise", "record", "context"] as const;

export const LOCATION_PRECISIONS = ["municipality", "city", "province", "area"] as const;
export const EVENT_PRECISIONS = ["day", "month", "year"] as const;
export const CHART_TYPES = ["line", "bar"] as const;
export const SERIES_KINDS = ["actual", "target"] as const;
// "at_most" is used for values like "under 14%".
export const QUALIFIERS = ["exact", "approx", "at_most", "at_least"] as const;
export const GAP_KINDS = ["method", "data_missing", "unverified", "scope"] as const;
export const GAP_STATUSES = ["open", "resolved"] as const;

// The five CALABARZON provinces.
export const PROVINCES = ["cavite", "laguna", "batangas", "rizal", "quezon"] as const;

export type Layer = (typeof LAYERS)[number];
export type Status = (typeof STATUSES)[number];
export type BadgeKind = (typeof BADGES)[number];
export type SourceKind = (typeof SOURCE_KINDS)[number];
export type SourceRole = (typeof SOURCE_ROLES)[number];
export type Province = (typeof PROVINCES)[number];
export type LocationPrecision = (typeof LOCATION_PRECISIONS)[number];
export type EventPrecision = (typeof EVENT_PRECISIONS)[number];
export type ChartType = (typeof CHART_TYPES)[number];
export type SeriesKind = (typeof SERIES_KINDS)[number];
export type Qualifier = (typeof QUALIFIERS)[number];
export type GapKind = (typeof GAP_KINDS)[number];
export type GapStatus = (typeof GAP_STATUSES)[number];
