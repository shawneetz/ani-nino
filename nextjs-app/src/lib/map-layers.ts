// what this file does: the stacking order of everything on /map, in one place
// the map sits at the bottom and each floating piece above it, so no component picks its own number
// the values are full tailwind class names on purpose, tailwind only sees whole strings
//   map     = the map itself
//   panel   = results panel and the map key
//   bar     = filter chips and time bar
//   sheet   = phone results sheet and map overlays
//   popover = chip popovers, the top bar row and the picker for stacked pins
//   scrim   = the dark layer behind the place drawer
//   drawer  = the place drawer, above everything else on the map
// the filter sheet and the footer are not here, the footer is not on /map
// change in this version (v2): added the scrim and drawer layers

/**
 * Tailwind z-index classes for the layers of the map page, lowest first.
 */
export const LAYER = {
  map: "z-0",
  panel: "z-10",
  bar: "z-20",
  sheet: "z-30",
  popover: "z-40",
  scrim: "z-50",
  drawer: "z-[60]",
} as const;

/** The name of one map layer. */
export type MapLayer = keyof typeof LAYER;