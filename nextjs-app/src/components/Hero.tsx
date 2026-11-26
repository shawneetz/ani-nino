import Image from "next/image";
import { HERO, SITE } from "@/lib/site";
import { ButtonLink } from "./Button";
import { Container } from "./Container";

function ContourLines() {
  return (
    <svg aria-hidden="true" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full text-stone-700">
      {Array.from({ length: 16 }, (_, index) => {
        const y = 30 + index * 38;
        return <path key={index} d={`M0 ${y} C 240 ${y - 45} 420 ${y + 45} 640 ${y} S 980 ${y - 40} 1200 ${y + 10}`} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.6} />;
      })}
    </svg>
  );
}

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate flex min-h-[28rem] items-end overflow-hidden bg-stone-950 sm:min-h-[36rem] print:min-h-0 print:bg-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 print:hidden">
        {HERO ? (
          <Image src={HERO.src} alt="" fill priority sizes="100vw" className="object-cover grayscale contrast-110" style={{ objectPosition: HERO.position }} />
        ) : (
          <ContourLines />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-stone-950/85 via-stone-950/55 to-stone-950/40" />
      </div>
      <Container className="space-y-4 pb-10 pt-24 print:pt-0">
        <p className="font-sans text-sm font-semibold uppercase tracking-kicker text-amber-300 print:text-stone-700">Martial-law farm programs · CALABARZON · 1972 to 1986</p>
        <h1 id="hero-heading" className="font-serif text-[clamp(3rem,8vw,6rem)] font-bold leading-none tracking-tight text-stone-50 print:text-stone-950">{SITE.title}</h1>
        <p className="font-serif text-2xl text-stone-100 print:text-stone-700">{SITE.tagline}</p>
        <p className="max-w-[68ch] font-serif text-lg leading-relaxed text-stone-100 print:text-stone-800">
          A map of farm programs from the martial-law years: what each promised, what the record shows, and who says
          so, with a link to every source.
        </p>
        <div className="flex flex-wrap gap-3 pt-1 print:hidden">
          <ButtonLink href="/map">Explore the map</ButtonLink>
          <ButtonLink href="#start-here" variant="inverse">Read a program</ButtonLink>
        </div>
        {HERO && (
          <p className="max-w-[68ch] font-sans text-sm leading-relaxed text-stone-200 print:hidden">
            {HERO.caption} Photo: {HERO.author},{" "}
            <a href={HERO.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {HERO.source}<span className="sr-only"> (opens in a new tab)</span>
            </a>
            , {HERO.year}. {HERO.license}.
          </p>
        )}
      </Container>
    </section>
  );
}
