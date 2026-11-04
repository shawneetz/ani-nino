// What this file does: gives the MapLibre CSP build the same types as the normal build,
// because the package only ships types for "maplibre-gl".
declare module "maplibre-gl/dist/maplibre-gl-csp" {
  export * from "maplibre-gl";
}
