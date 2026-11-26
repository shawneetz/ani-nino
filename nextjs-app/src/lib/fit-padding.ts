// what this file does: the padding the map keeps free when it fits to pins, as pure functions
// the floating panel, chips, time bar and phone toggle sit on top of the map,
// so a pin must land in the part of the map the reader can actually see
//   mapPadding   = how much room each floating piece takes at a given screen width
//   clampPadding = shrinks a padding that is too big for the canvas, maplibre throws on that
// the numbers match the layout in Explorer.tsx, change them together
// pure functions, so they can be tested without a browser

/**
 * Pixels of the map to keep free on each side when fitting to pins.
 */
export interface FitPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Padding for a map with nothing floating on it, the mini-map on a program page uses this. */
export const DEFAULT_FIT_PADDING: FitPadding = { top: 60, right: 60, bottom: 60, left: 60 };

/** The map never zooms closer than this when fitting. */
export const MAX_FIT_ZOOM = 11;

// px of the canvas that must stay free after padding, so the fit never has a zero size area
const MIN_VISIBLE = 120;

// the root font is 18px, so 1rem is 18px (see globals.css)
const REM = 18;

// the desktop layout starts at tailwind's lg breakpoint
const DESKTOP_MIN = 1024;

// distance of the floating panel from the screen edge, plus the gap between the panel and the pins
const PANEL_EDGE = 12;
const PANEL_GAP = 24;

// height the time bar takes at the bottom on desktop, and the toggle strip on phones
const TIME_BAR_HEIGHT = 200;
const PHONE_BOTTOM = 96;

// room for the header strip on phones and the chip row on desktop
const TOP = 72;

/**
 * Finds how much of each map edge the floating pieces cover at a screen width.
 *
 * @remarks
 * Desktop: the panel on the left is `clamp(20rem, 30vw, 26rem)` wide, the time bar sits at the bottom,
 * and the zoom buttons take a strip on the right.
 * Phone: a strip on top and the toggle at the bottom, the sides are free.
 *
 * @param viewportWidth - The window width in pixels.
 * @returns The padding to pass to maplibre.
 *
 * @example
 * ```ts
 * mapPadding(1440).left; // 468
 * ```
 */
export function mapPadding(viewportWidth: number): FitPadding {
  if (viewportWidth >= DESKTOP_MIN) {
    // same rule as the panel width in css: clamp(20rem, 30vw, 26rem)
    const panel = Math.min(Math.max(20 * REM, viewportWidth * 0.3), 26 * REM);
    return {
      top: TOP,
      right: 72,
      bottom: TIME_BAR_HEIGHT,
      left: Math.round(panel + PANEL_EDGE + PANEL_GAP),
    };
  }
  return { top: TOP, right: 40, bottom: PHONE_BOTTOM, left: 40 };
}

/**
 * Shrinks a padding that would leave too little of the canvas free.
 *
 * @remarks
 * Maplibre throws when the padding is bigger than the canvas. Each axis is scaled down
 * on its own, so a tall panel never squashes the vertical padding.
 *
 * @param padding - The wanted padding.
 * @param width - Canvas width in pixels.
 * @param height - Canvas height in pixels.
 * @returns A padding that always leaves at least 120px free on each axis.
 */
export function clampPadding(padding: FitPadding, width: number, height: number): FitPadding {
  const across = padding.left + padding.right;
  const down = padding.top + padding.bottom;
  // 1 means no change, anything smaller scales both sides of that axis
  const acrossScale = across > 0 ? Math.min(1, Math.max(0, width - MIN_VISIBLE) / across) : 1;
  const downScale = down > 0 ? Math.min(1, Math.max(0, height - MIN_VISIBLE) / down) : 1;
  return {
    top: Math.floor(padding.top * downScale),
    right: Math.floor(padding.right * acrossScale),
    bottom: Math.floor(padding.bottom * downScale),
    left: Math.floor(padding.left * acrossScale),
  };
}
