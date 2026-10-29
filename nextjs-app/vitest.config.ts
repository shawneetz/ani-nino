// What this file does: configures Vitest paths and finds the app's unit tests.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src") },
  },
  test: {
    environment: "node",
    globalSetup: ["./tests/global-setup.ts"],
    fileParallelism: false,
    include: ["tests/**/*.test.ts", "src/**/*.test.{ts,tsx}"],
  },
});
