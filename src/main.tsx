import { createRoot } from "react-dom/client";
import App from "./views/FullView";
import { mountVersionBadge } from "./versionBadge";

mountVersionBadge();
const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");
createRoot(root).render(<App />);
