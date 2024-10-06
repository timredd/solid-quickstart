import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@solidjs/start/config";
import devtools from "solid-devtools/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  middleware: "./src/middleware.ts",
  ssr: true,
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
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      sourcemap: true,
      minify: false,
      rollupOptions: {
        external: ["node:async_hooks"],
      },
    },
    plugins: [devtools({ autoname: true })],
  },
});
