// what this file does: the glossary data, short forms used on program pages in plain words
// keep entries sorted by term
export interface GlossaryEntry {
  term: string;
  name: string;
  meaning: string;
}

export const GLOSSARY: readonly GlossaryEntry[] = [
  {
    term: "CARP",
    name: "Comprehensive Agrarian Reform Program",
    meaning:
      "The land reform program that came after PD 27. Some pages mention it when asking whether an estate was ever covered.",
  },
  {
    term: "CLOA",
    name: "Certificate of Land Ownership Award",
    meaning:
      "A land award document issued by DAR. The Nasugbu page counts the CLOAs issued for Hacienda Looc from 1991 to 1993.",
  },
  {
    term: "CLT",
    name: "Certificate of Land Transfer",
    meaning: "The paper a tenant received under Operation Land Transfer. A certificate was not a title.",
  },
  {
    term: "DAR",
    name: "Department of Agrarian Reform",
    meaning: "The government agency that carries out land reform.",
  },
  {
    term: "EP",
    name: "Emancipation Patent",
    meaning: "The title that came after a tenant paid for the land and met other requirements.",
  },
  {
    term: "IRRI",
    name: "International Rice Research Institute",
    meaning:
      "A rice research institute. PD 457 let UPLB buy or expropriate private farms to expand research for UPLB and IRRI.",
  },
  {
    term: "LLDA",
    name: "Laguna Lake Development Authority",
    meaning:
      "The government body that regulates Laguna de Bay. PD 813 (August 26, 1975) gave it wider powers over the lake.",
  },
  {
    term: "LOI",
    name: "Letter of Instructions",
    meaning:
      "A written order from the president telling officials what to do. This site also cites Letter of Implementation No. 23, which uses the same short form.",
  },
  {
    term: "OLT",
    name: "Operation Land Transfer",
    meaning:
      "The program under PD 27, started in November 1972, to move tenanted rice and corn land to the tenants who tilled it.",
  },
  {
    term: "PCA",
    name: "Philippine Coconut Authority",
    meaning: "The government agency for the coconut industry. Its records are one lead for Quezon levy figures.",
  },
  {
    term: "PCGG",
    name: "Presidential Commission on Good Government",
    meaning:
      "A government commission. The Quezon page cites its figure of 9.695 billion pesos collected from the coconut levy, 1973 to 1983.",
  },
  {
    term: "PD",
    name: "Presidential Decree",
    meaning:
      "A law issued by the president during martial law. PD 27 (October 21, 1972) covered tenants on private rice and corn lands.",
  },
  {
    term: "UPLB",
    name: "University of the Philippines Los Baños",
    meaning: "A state university. It appears on the Masagana 99, Makiling resettlement and land acquisition pages.",
  },
];
