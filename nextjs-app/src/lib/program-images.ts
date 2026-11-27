// what this file does: the image for each program, keyed by slug
// leave the list empty to show the drawn placeholder everywhere
import type { HeroImage } from "./site";

export type ProgramImageConfig = HeroImage;

export const PROGRAM_IMAGES: Readonly<Record<string, ProgramImageConfig>> = {};

export function programImage(slug: string): ProgramImageConfig | null {
  return Object.prototype.hasOwnProperty.call(PROGRAM_IMAGES, slug) ? PROGRAM_IMAGES[slug] : null;
}
