import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { publicCopyErrors } from "./scripts/check-summary-tiers.mjs";

// Fails `vite build` when a summary names a different tier than the lane
// the item is shown in, unless it uses the "normally {tier}-tier" phrasing.
function summaryTierCheck(): Plugin {
  return {
    name: "summary-tier-check",
    buildStart() {
      const errors = publicCopyErrors();
      if (errors.length) {
        this.error("Public copy check failed:\n" + errors.join("\n"));
      }
    },
  };
}

// Relative base so the built site works at /valheim-progression-graph/
// and when opened from a nested preview path.
export default defineConfig({
  base: "./",
  plugins: [summaryTierCheck(), react()],
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
