// what this file does: keeps the map's cdn version, style and start view in one place
// to pin the files, get each hash with this command and paste it below
//   curl -s <url> | openssl dgst -sha384 -binary | openssl base64 -A
// then write it as "sha384-<hash>", while a hash is empty the file loads without a check
// change in this version (m3): the basemap is now openfreemap positron
//   liberty is full color, so its parks and water blend with the topic colors of the pins
//   positron is near grayscale, so the pin colors and the solid or hollow fill carry the meaning

// keep this in sync with the maplibre-gl version in package.json (pnpm list maplibre-gl)
export const MAPLIBRE_VERSION = "5.24.0";

export const MAPLIBRE_JS_URL = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js`;
export const MAPLIBRE_CSS_URL = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css`;
export const MAPLIBRE_JS_INTEGRITY = "";
export const MAPLIBRE_CSS_INTEGRITY = "";

// free tiles, no key needed, swap this one line if the provider changes
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

// first view before the map fits itself to the pins (lng, lat)
export const MAP_CENTER: [number, number] = [121.3, 14.1];
export const MAP_ZOOM = 8.2;

export const MAP_MIN_ZOOM = 7;
export const MAP_BOUNDS: [[number, number], [number, number]] = [
  [119.8, 12.4],
  [123.2, 15.6],
];