// what this file does: one image slot for a program
// it shows a real image or a drawn placeholder in the topic color
import Image from "next/image";
import { programImage } from "@/lib/program-images";
import { TOPICS, type Topic } from "@/lib/vocab";

type Size = "banner" | "card" | "drawer";

interface ProgramImageProps {
  slug: string;
  topic: Topic;
  size?: Size;
  className?: string;
}

const SHAPES: Record<Size, string> = {
  banner: "aspect-[21/9]",
  card: "aspect-[4/3]",
  drawer: "aspect-[16/7]",
};

const LINE_COUNT = 9;
const ACCENT_LINE = 3;

function Terraces({ color }: { color: string }) {
  return (
    <>
      <div aria-hidden="true" className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${color}40 0%, transparent 65%)` }} />
      <svg aria-hidden="true" viewBox="0 0 600 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {Array.from({ length: LINE_COUNT }, (_, index) => {
          const y = 20 + index * 30;
          const lift = 14 + (index % 3) * 10;
          const accent = index === ACCENT_LINE;
          return (
            <path
              key={index}
              d={`M-10 ${y} C 150 ${y - lift} 300 ${y + lift} 460 ${y} S 580 ${y - lift} 620 ${y + 6}`}
              fill="none"
              stroke={color}
              strokeWidth={accent ? 3 : 1.5}
              strokeLinecap="round"
              opacity={accent ? 0.9 : 0.35}
              className="[vector-effect:non-scaling-stroke]"
            />
          );
        })}
      </svg>
    </>
  );
}

export function ProgramImage({ slug, topic, size = "card", className = "" }: ProgramImageProps) {
  const image = programImage(slug);

  return (
    <div className={`print:hidden ${className}`}>
      <div aria-hidden="true" className={`relative isolate overflow-hidden bg-stone-900 ${SHAPES[size]}`}>
        {image ? (
          <>
            <Image
              src={image.src}
              alt=""
              fill
              sizes={size === "banner" ? "(min-width: 1152px) 1152px, 100vw" : "(min-width: 768px) 33vw, 100vw"}
              className="object-cover grayscale contrast-110"
              style={{ objectPosition: image.position }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-stone-950/50 to-transparent" />
          </>
        ) : (
          <Terraces color={TOPICS[topic].color} />
        )}
      </div>
      {image && size === "banner" && (
        <p className="max-w-[68ch] pt-2 font-sans text-sm leading-relaxed text-stone-700">
          {image.caption} Photo: {image.author},{" "}
          <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            {image.source}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          , {image.year}. {image.license}.
        </p>
      )}
    </div>
  );
}
