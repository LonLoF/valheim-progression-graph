import { VERSION_BADGE } from "./graph";

export function mountVersionBadge(): void {
  const el = document.getElementById("view-version");
  if (el) el.textContent = VERSION_BADGE;
}
