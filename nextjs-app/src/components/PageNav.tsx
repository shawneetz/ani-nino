// what this file does: "on this page" navigation for program pages
// PageRail is a sticky side list on desktop, JumpSelect is a compact dropdown on phones
"use client";

export type NavItem = { id: string; label: string };

// scrolls to a section and respects the reduced motion setting
function jumpTo(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  // keep the hash in the url so the position can be shared
  history.replaceState(null, "", `#${id}`);
}

export function PageRail({ items }: { items: NavItem[] }) {
  return (
    <nav aria-label="On this page" className="sticky top-6 hidden self-start lg:block">
      <p className="mb-2 text-base font-semibold text-stone-900">On this page</p>
      <ul className="space-y-1 border-l-2 border-stone-200">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                jumpTo(item.id);
              }}
              className="-ml-0.5 inline-flex min-h-[44px] items-center border-l-2 border-transparent pl-3 text-base text-stone-700 hover:border-stone-500 hover:text-stone-900 focus-visible:outline focus-visible:outline-2"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function JumpSelect({ items }: { items: NavItem[] }) {
  return (
    <div className="lg:hidden">
      <label htmlFor="jump-select" className="sr-only">
        Jump to a section
      </label>
      <select
        id="jump-select"
        defaultValue=""
        onChange={(event) => {
          if (event.target.value) jumpTo(event.target.value);
          // reset so the same section can be picked again
          event.target.value = "";
        }}
        className="min-h-[44px] w-full rounded-lg border border-stone-400 bg-white px-3 text-base text-stone-900 focus-visible:outline focus-visible:outline-2"
      >
        <option value="" disabled>
          Jump to a section
        </option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
