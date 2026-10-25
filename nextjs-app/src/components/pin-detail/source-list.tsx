import type { PinDetail } from "@/lib/api-schemas";
import { formatDate, KIND_LABELS, ROLE_LABELS } from "./detail-labels";

type PinSource = PinDetail["sources"][number];

export function SourceList({ sources, role }: { sources: PinSource[]; role: PinSource["role"] }) {
  const rows = sources.filter((source) => source.role === role);
  if (rows.length === 0) return null;

  return (
    <div className="mt-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-600">{ROLE_LABELS[role]}</h4>
      <ul className="mt-1 space-y-2">
        {rows.map((source) => {
          const meta = [source.publisher, source.author, source.publishedYear, KIND_LABELS[source.kind]]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={`${role}-${source.id}`} className="text-sm text-neutral-800">
              {source.url ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                  {source.title}
                </a>
              ) : <span>{source.title}</span>}
              <p className="text-xs text-neutral-600">{meta}</p>
              {source.citationNote && <p className="text-xs text-neutral-600">Cite: {source.citationNote}</p>}
              <p className="text-xs text-neutral-600">
                {source.accessedOn && <>Accessed {formatDate(source.accessedOn)}. </>}
                {source.archivedUrl && (
                  <a href={source.archivedUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                    Archived copy
                  </a>
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
