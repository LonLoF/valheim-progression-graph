import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// Relative base so the built site works at /valheim-progression-graph/
// and when opened from a nested preview path.
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "grok/canvas": resolve(__dirname, "src/grok-canvas.tsx"),
      "grok-canvas": resolve(__dirname, "src/grok-canvas.tsx"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        compact: resolve(__dirname, "compact/index.html"),
      },
    },
  },
});
