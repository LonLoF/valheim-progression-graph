import { createRoot } from "react-dom/client";
import App from "./views/FullView";
import { bootUrl } from "./urlState";
import { mountVersionBadge } from "./versionBadge";

bootUrl();
mountVersionBadge();
const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");
createRoot(root).render(<App />);
