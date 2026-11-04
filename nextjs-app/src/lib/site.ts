// What this file does: keeps site-wide labels and contribution links together.
export const SITE = { title: "Anino ng Ani", subtitle: "Sino ang Nagbayad sa Masaganang Ani?", tagline: "Who Paid for the Harvest?", description: "An educational map of martial-law farm programs in CALABARZON (1972 to 1986)." } as const;
export const REPO_URL = "https://github.com/YOUR-NAME/anino-ng-ani";
const BRANCH = "main";
export function editUrl(slug: string): string { return `${REPO_URL}/edit/${BRANCH}/content/${slug}.yaml`; }
export function issueUrl(slug: string): string { return `${REPO_URL}/issues/new?title=${encodeURIComponent(`Problem with program: ${slug}`)}&body=${encodeURIComponent(`Program: ${slug}\n\nWhat is wrong?\n`)}`; }
