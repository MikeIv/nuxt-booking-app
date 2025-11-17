import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", ".nuxt", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".nuxt/",
        "dist/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/types/**",
      ],
    },
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./app"),
      "@": resolve(__dirname, "./app"),
      "~/components": resolve(__dirname, "./app/components"),
      "~/stores": resolve(__dirname, "./app/stores"),
      "~/composables": resolve(__dirname, "./app/composables"),
    },
  },
});
