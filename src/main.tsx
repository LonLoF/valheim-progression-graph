import { createRoot } from "react-dom/client";
import App from "./views/FullView";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");
createRoot(root).render(<App />);
