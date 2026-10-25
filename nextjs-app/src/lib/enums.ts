export const LAYERS = ["martial_law", "today"] as const;
export const STATUSES = ["lead", "verified"] as const;
export const BADGES = [
  "law_or_decree",
  "court_record",
  "government_record",
  "academic_research",
  "advocacy_report",
  "news_report",
] as const;
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
export const SOURCE_ROLES = ["promise", "record", "context"] as const;
export const LOCATION_PRECISIONS = ["municipality", "city", "province", "area"] as const;
export const EVENT_PRECISIONS = ["day", "month", "year"] as const;

export const PROVINCES = [
  "abra", "agusan-del-norte", "agusan-del-sur", "aklan", "albay", "antique",
  "apayao", "aurora", "basilan", "bataan", "batanes", "batangas", "benguet",
  "biliran", "bohol", "bukidnon", "bulacan", "cagayan", "camarines-norte",
  "camarines-sur", "camiguin", "capiz", "catanduanes", "cavite", "cebu",
  "cotabato", "davao-de-oro", "davao-del-norte", "davao-del-sur",
  "davao-occidental", "davao-oriental", "dinagat-islands", "eastern-samar",
  "guimaras", "ifugao", "ilocos-norte", "ilocos-sur", "iloilo", "isabela",
  "kalinga", "la-union", "laguna", "lanao-del-norte", "lanao-del-sur",
  "leyte", "maguindanao-del-norte", "maguindanao-del-sur", "marinduque",
  "masbate", "misamis-occidental", "misamis-oriental", "mountain-province",
  "negros-occidental", "negros-oriental", "northern-samar", "nueva-ecija",
  "nueva-vizcaya", "occidental-mindoro", "oriental-mindoro", "palawan",
  "pampanga", "pangasinan", "quezon", "quirino", "rizal", "romblon",
  "samar", "sarangani", "siquijor", "sorsogon", "south-cotabato",
  "southern-leyte", "sultan-kudarat", "sulu", "surigao-del-norte",
  "surigao-del-sur", "tarlac", "tawi-tawi", "zambales", "zamboanga-del-norte",
  "zamboanga-del-sur", "zamboanga-sibugay", "metro-manila",
] as const;

export type Layer = (typeof LAYERS)[number];
export type Status = (typeof STATUSES)[number];
export type BadgeKind = (typeof BADGES)[number];
export type SourceKind = (typeof SOURCE_KINDS)[number];
export type SourceRole = (typeof SOURCE_ROLES)[number];
export type Province = (typeof PROVINCES)[number];
export type LocationPrecision = (typeof LOCATION_PRECISIONS)[number];
export type EventPrecision = (typeof EVENT_PRECISIONS)[number];
