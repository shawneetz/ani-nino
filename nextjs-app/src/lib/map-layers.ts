// what this file does: the stacking order of everything on /map, in one place
// the map sits at the bottom and each floating piece above it, so no component picks its own number
// the values are full tailwind class names on purpose, tailwind only sees whole strings
//   map     = the map itself
//   panel   = results panel, place details and the map key
//   bar     = filter chips and time bar
//   sheet   = place details, bottom sheet and map overlays
//   popover = chip popovers and the picker for stacked pins
// the filter sheet and the footer are not here, the sheet is fixed at z-50 and the footer is not on /map

/**
 * Tailwind z-index classes for the layers of the map page, lowest first.
 */
export const LAYER = {
  map: "z-0",
  panel: "z-10",
  bar: "z-20",
  sheet: "z-30",
  popover: "z-40",
} as const;

/** The name of one map layer. */
export type MapLayer = keyof typeof LAYER;