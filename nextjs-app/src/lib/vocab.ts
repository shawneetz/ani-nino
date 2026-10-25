import type { BadgeKind, Province, SourceKind, Status } from "./enums";
import { PROVINCES } from "./enums";

export const FAMILIES = {
  land_reform: { label: "Land reform", color: "#b45309" },
  export_tax_monopoly: { label: "Export taxes and monopolies", color: "#7c3aed" },
  infrastructure: { label: "Infrastructure", color: "#0369a1" },
  displacement: { label: "Displacement", color: "#be123c" },
  labor: { label: "Labor", color: "#047857" },
  public_services: { label: "Public services", color: "#4f46e5" },
} as const;

export type Family = keyof typeof FAMILIES;

const provinceNames: Record<Province, string> = Object.fromEntries(
  PROVINCES.map((province) => [
    province,
    province.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "),
  ]),
) as Record<Province, string>;
provinceNames["metro-manila"] = "Metro Manila";

export const PROVINCE_LABELS = provinceNames;

export const BADGE_LABELS: Record<BadgeKind, string> = {
  law_or_decree: "Law or decree",
  court_record: "Court record",
  government_record: "Government record",
  academic_research: "Academic research",
  advocacy_report: "Advocacy report",
  news_report: "News report",
};

export const STATUS_LABELS: Record<Status, string> = {
  lead: "Lead",
  verified: "Verified",
};

export const SOURCE_KIND_LABELS: Record<SourceKind, string> = {
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
