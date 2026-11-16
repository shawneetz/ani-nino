// what this file does: keeps old shared links working
// before the landing page existed, "/" was the map, so links like
// "/?topic=land&province=laguna" are out there. this helper turns such a query
// into the new "/map?..." address. it returns null when "/" has no filters,
// which means the landing page should simply show

// the only query keys the explorer understands (see use-filter-state)
const FILTER_KEYS = ["year", "topic", "province", "today"] as const;

export type RawParams = Record<string, string | string[] | undefined>;

export function legacyRedirect(params: RawParams): string | null {
  const query = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const raw = params[key];
    // if a key is repeated, use the first value
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value) query.set(key, value);
  }
  // keep commas readable, for example topic=land,support
  const text = query.toString().replace(/%2C/g, ",");
  return text ? `/map?${text}` : null;
}
