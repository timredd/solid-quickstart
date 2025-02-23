import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import devtools from "solid-devtools/vite";

import { fileURLToPath } from "node:url";
import { defineConfig } from "@solidjs/start/config";
import { version } from "./package.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const revision = process.env.GITHUB_SHA?.slice(0, 7) ?? "fadedead";

export default defineConfig({
  middleware: "./src/middleware.ts",
  devOverlay: true,
  server: {
    preset: "cloudflare-pages",
    sourceMap: true,
    minify: false,
    rollupConfig: {
      external: ["__STATIC_CONTENT_MANIFEST", "node:async_hooks"],
    },
  },
  vite: {
    define: {
      "import.meta.env.VERSION": JSON.stringify(version),
      "import.meta.env.REVISION": JSON.stringify(revision),
    },
    build: {
      sourcemap: true,
      minify: false,
      rollupOptions: {
        external: ["node:async_hooks"],
      },
    },
    plugins: [tailwindcss(), devtools({ autoname: true })],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  },
});
