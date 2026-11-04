// What this file does: keeps site-wide text, navigation and GitHub links together.
export const SITE = {
  title: "Anino ng Ani",
  subtitle: "Sino ang Nagbayad sa Masaganang Ani?",
  tagline: "Who Paid for the Harvest?",
  description:
    "An evidence-labeled map of martial-law farm programs in CALABARZON, 1972 to 1986: what each promised, what the record shows, and who says so.",
} as const;

// TODO: replace YOUR-NAME with the real GitHub account before launch.
export const REPO_URL = "https://github.com/YOUR-NAME/anino-ng-ani";
const BRANCH = "main";

export const NAV_LINKS = [
  { href: "/", label: "Map" },
  { href: "/charts", label: "Charts" },
  { href: "/sources", label: "Sources" },
  { href: "/about", label: "About" },
] as const;

export function editUrl(slug: string): string {
  return `${REPO_URL}/edit/${BRANCH}/content/programs/${slug}.yaml`;
}

function newIssueUrl(title: string, body: string): string {
  return `${REPO_URL}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

export function issueUrl(slug: string): string {
  return newIssueUrl(`Problem with program: ${slug}`, `Program: ${slug}\n\nWhat is wrong?\n`);
}

export function sourceIssueUrl(slug: string): string {
  return newIssueUrl(
    `Source for program: ${slug}`,
    `Program: ${slug}\n\nSource title:\nPublisher:\nLink:\nWhat it shows:\n`,
  );
}
