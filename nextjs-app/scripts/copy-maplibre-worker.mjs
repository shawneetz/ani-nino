// What this file does: copies MapLibre's worker file into /public so the browser
// can load it from a normal URL. Runs after install and before dev/build.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";

const source = "node_modules/maplibre-gl/dist/maplibre-gl-csp-worker.js";
const target = "public/maplibre-gl-csp-worker.js";

// Fail loudly if the package layout changes, instead of breaking the map silently.
if (!existsSync(source)) {
  console.error(`Missing ${source}. Is maplibre-gl installed?`);
  process.exit(1);
}

mkdirSync("public", { recursive: true });
copyFileSync(source, target);
console.log(`Copied MapLibre worker to ${target}`);
