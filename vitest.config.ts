import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/configs/env/schema.ts",
        "src/configs/security-headers.ts",
        "src/lib/{cart,slug,storefront,text,utils}.ts",
        "src/lib/security/rate-limit.ts",
        "src/validations/*.schema.ts",
      ],
      thresholds: {
        branches: 75,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      "server-only": new URL("./vitest.server-only.ts", import.meta.url).pathname,
    },
  },
});
