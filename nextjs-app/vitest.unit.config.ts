import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src") },
  },
  test: {
    include: [
      "src/db/queries-fallback.test.ts",
      "src/lib/enums.test.ts",
      "src/lib/filter.test.ts",
      "src/lib/pin-query.test.ts",
      "tests/api/routes.test.ts",
    ],
  },
});
