// What this file does: configures the unit tests for the static content layer.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // "@/lib/x" resolves to "src/lib/x", matching tsconfig.json.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // Browser tests in e2e/ run separately with Playwright.
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});
