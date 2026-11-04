// What this file does: the short intro at the top of the map page.
// It holds the page's single <h1>, says what the page is, and links to Methods.
// This is plain text, so editing the wording is a copy task only.
import Link from "next/link";

export function IntroStrip() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
        Anino ng Ani: Sino ang Nagbayad sa Masaganang Ani?
      </h1>
      <p className="mt-1 max-w-3xl text-sm text-neutral-700">
        A program can look successful in the numbers and still leave out the people it claims to
        help. Move the slider through 1972 to 1986, filter by program or province, and open a pin
        to read what a program promised, what the record shows and where each claim comes from.
        Laguna is covered in full; the other provinces are starter pins.{" "}
        <Link href="/methods" className="underline underline-offset-2">
          How claims are labeled
        </Link>
        .
      </p>
    </div>
  );
}
