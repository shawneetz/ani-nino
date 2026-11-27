// what this file does: the card list inside "related programs" on a program page (u17)
// the picks come from relatedPrograms in src/lib/related.ts
// (same province first, then same topic, never the page itself or its echo links)
import Link from "next/link";
import type { Program } from "@/lib/content-schema";
import { yearRange } from "@/lib/filter";
import { TOPICS } from "@/lib/vocab";
import { ROW_HOVER } from "./States";
import { StatusTag } from "./StatusTag";

export function RelatedPrograms({ items }: { items: Program[] }) {
    return (
        <ul className="border-t border-stone-400">
            {items.map((item) => (
                <li key={item.slug} className="border-b border-stone-400">
                    <Link
                        href={`/programs/${item.slug}`}
                        className={`tap-target group block space-y-1 px-1 py-3 ${ROW_HOVER}`}
                    >
                        <span className="block font-serif text-xl font-semibold leading-snug text-stone-950 group-hover:underline">{item.title}</span>
                        <span className="figures flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-base text-stone-700">
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