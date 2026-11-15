// what this file does: keeps the map's cdn version, style and start view in one place
// to pin the files, get each hash with this command and paste it below
//   curl -s <url> | openssl dgst -sha384 -binary | openssl base64 -A
// then write it as "sha384-<hash>", while a hash is empty the file loads without a check

// keep this in sync with the maplibre-gl version in package.json (pnpm list maplibre-gl)
export const MAPLIBRE_VERSION = "5.6.0";

export const MAPLIBRE_JS_URL = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js`;
export const MAPLIBRE_CSS_URL = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css`;
export const MAPLIBRE_JS_INTEGRITY = "";
export const MAPLIBRE_CSS_INTEGRITY = "";

// free tiles, no key needed, swap this one line if the provider changes
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// first view before the map fits itself to the pins (lng, lat)
export const MAP_CENTER: [number, number] = [121.3, 14.1];
export const MAP_ZOOM = 8.2;
