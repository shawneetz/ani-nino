// what this file does: the card list inside "related programs" on a program page (u17)
// the picks come from relatedPrograms in src/lib/related.ts
// (same province first, then same topic, never the page itself or its echo links)
import Link from "next/link";
import type { Program } from "@/lib/content-schema";
import { yearRange } from "@/lib/filter";
import { TOPICS } from "@/lib/vocab";
import { StatusTag } from "./StatusTag";

export function RelatedPrograms({ items }: { items: Program[] }) {
    return (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
                <li key={item.slug}>
                    <Link
                        href={`/programs/${item.slug}`}
                        className="block h-full rounded-card border border-stone-300 bg-white p-4 hover:border-stone-500"
                    >
                        <span className="block text-lg font-semibold text-stone-900">{item.title}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-stone-700">
                            <span>{yearRange(item)}</span>
                            <span style={{ color: TOPICS[item.topic].color }}>{TOPICS[item.topic].label}</span>
                            <StatusTag status={item.status} />
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}