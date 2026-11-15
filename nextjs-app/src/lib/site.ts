// what this file does: keeps site-wide text, navigation and github links together
// github is the only way to contribute in v1, so every link here must point to a real repo
// changes in this version: "map" now points to /map (the landing page owns "/"),
// plus featured / featured_gaps for the landing page and two general github links
export const SITE = {
  title: "Anino ng Ani",
  subtitle: "Sino ang Nagbayad sa Masaganang Ani?",
  tagline: "Who Paid for the Harvest?",
  description:
    "An evidence-labeled map of martial-law farm programs in CALABARZON, 1972 to 1986: what each promised, what the record shows, and who says so.",
} as const;

export const REPO_OWNER = "shawneetz";
export const REPO_NAME = "ani-nino";
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
const BRANCH = "main";

// always true: repo_owner is now set to the real account
// kept for backward compat with pnpm content:check which calls this
export function isRepoConfigured(): boolean {
  return true;
}

// file names of the issue forms in .github/issue_template/. keep them in sync
const SOURCE_TEMPLATE = "suggest-source.yml";
const PROBLEM_TEMPLATE = "report-problem.yml";

export const NAV_LINKS = [
  { href: "/map", label: "Map" },
  { href: "/charts", label: "Charts" },
  { href: "/sources", label: "Sources" },
  { href: "/about", label: "About" },
] as const;

// landing page "start here" cards. slugs must match files in content/programs/
// a slug that does not exist is skipped, so a typo never breaks the page
export const FEATURED = [
  "laguna-operation-land-transfer",
  "laguna-lake-fishpens",
  "quezon-coconut-levy",
] as const;

// landing page "what we do not know yet" gaps. ids must match content/gaps.yaml
export const FEATURED_GAPS = [
  "laguna-land-transfer-numbers",
  "coconut-levy-flow",
  "hacienda-yulo-coverage",
] as const;

// general github links (not tied to one program)
export const ISSUES_URL = `${REPO_URL}/issues/new/choose`;
export const CONTENT_URL = `${REPO_URL}/tree/${BRANCH}/content/programs`;

export function editUrl(slug: string): string {
  return `${REPO_URL}/edit/${BRANCH}/content/programs/${slug}.yaml`;
}

// opens a new issue from a form. the "program" field is pre-filled with the slug
function formUrl(template: string, slug: string): string {
  return `${REPO_URL}/issues/new?template=${encodeURIComponent(template)}&program=${encodeURIComponent(slug)}`;
}

export function issueUrl(slug: string): string {
  return formUrl(PROBLEM_TEMPLATE, slug);
}

export function sourceIssueUrl(slug: string): string {
  return formUrl(SOURCE_TEMPLATE, slug);
}
