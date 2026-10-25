import type { PinDetail } from "@/lib/api-schemas";

const decreeSource = {
  id: "pd-27",
  title: "Presidential Decree No. 27",
  publisher: "Official Gazette",
  author: null,
  kind: "law_or_decree" as const,
  url: "https://example.org/pd-27",
  archivedUrl: null,
  publishedYear: 1972,
  accessedOn: "2026-10-20",
  note: null,
};

const reportSource = {
  id: "bulatlat-hacienda-yulo",
  title: "Hacienda Yulo report",
  publisher: "Bulatlat",
  author: null,
  kind: "advocacy_publication" as const,
  url: "https://example.org/yulo",
  archivedUrl: "https://web.archive.org/web/example",
  publishedYear: 2010,
  accessedOn: "2026-10-20",
  note: null,
};

export const yuloExemption: PinDetail = {
  id: "laguna-hacienda-yulo-exemption",
  layer: "martial_law",
  title: "Hacienda Yulo exempted from PD 27",
  program: "Operation Land Transfer",
  instruments: ["PD 27"],
  family: "land_reform",
  secondaryFamilies: ["export_tax_monopoly"],
  startDate: "1972-10-01",
  endDate: null,
  dateLabel: "1972 onward (exact date to confirm)",
  promise: "PD 27 declared tenant-farmers of private rice and corn lands owners of the land they till.",
  record: "Advocacy reporting says the 7,100-hectare sugar estate was exempted.",
  badge: "advocacy_report",
  status: "lead",
  openQuestion: "Find the exemption date and legal basis; look for a court or DAR record.",
  verifiedOn: null,
  verificationNote: null,
  locations: [
    { id: 1, name: "Calamba", municipality: "Calamba", province: "laguna", lat: 14.2117, lng: 121.1653, precision: "municipality", isAnchor: true, sortOrder: 0 },
    { id: 2, name: "Laguna Coalition area", municipality: null, province: "laguna", lat: 14.17, lng: 121.24, precision: "area", isAnchor: false, sortOrder: 1 },
  ],
  sources: [
    { ...decreeSource, role: "promise", citationNote: "Sec. 2" },
    { ...reportSource, role: "record", citationNote: null },
  ],
  events: [
    { id: 1, eventDate: "1973-10-03", precision: "day", description: "Threshold lowered from 100 ha to 24 ha.", sourceId: "pd-27", sortOrder: 0 },
  ],
  links: [
    {
      interpretationNote: "Evictions and arson follow the same land.",
      linkedPin: {
        id: "laguna-hacienda-yulo-evictions",
        title: "Hacienda Yulo evictions",
        layer: "today",
        dateLabel: "2010 to 2021",
        family: "land_reform",
      },
    },
  ],
  videos: [],
};

export const yuloEvictions: PinDetail = {
  ...yuloExemption,
  id: "laguna-hacienda-yulo-evictions",
  layer: "today",
  title: "Hacienda Yulo evictions",
  startDate: "2010-01-01",
  dateLabel: "2010 to 2021",
  status: "verified",
  openQuestion: null,
  verifiedOn: "2026-10-24",
  verificationNote: "Checked against the Bulatlat report.",
  events: [],
  links: [
    {
      interpretationNote: "Evictions and arson follow the same land.",
      linkedPin: {
        id: "laguna-hacienda-yulo-exemption",
        title: "Hacienda Yulo exempted from PD 27",
        layer: "martial_law",
        dateLabel: "1972 onward",
        family: "land_reform",
      },
    },
  ],
};
