import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [solid()],
  test: {
    includeSource: ["src/**/*.{js,ts}"],
  },
  resolve: {
    conditions: ["development", "browser"],
  },
  define: {
    "import.meta.vitest": "undefined",
  },
});
