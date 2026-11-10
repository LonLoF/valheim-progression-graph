import { createRoot } from "react-dom/client";
import { loadGraph } from "./graph";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

loadGraph().then(async () => {
  const { bootUrl } = await import("./urlState");
  const { mountVersionBadge } = await import("./versionBadge");
  const { default: App } = await import("./views/CompactView");
  bootUrl();
  mountVersionBadge();
  createRoot(root).render(<App />);
}).catch(() => {
  root.textContent = "The progression data could not be loaded.";
});
