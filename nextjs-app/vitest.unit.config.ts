// What this file does: runs only the tests that need no database.
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
      "src/lib/seed-validate.test.ts",
      "tests/api/routes.test.ts",
    ],
  },
});
