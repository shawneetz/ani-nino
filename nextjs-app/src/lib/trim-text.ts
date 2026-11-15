// what this file does: trims a string to a max length for meta descriptions
// it cuts at a word edge when it can and adds an ellipsis

export function trimText(text: string, max = 160): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;

  // leave room for the ellipsis character
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");

  // only cut at a space if it does not throw away too much text
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.trimEnd()}…`;
}
