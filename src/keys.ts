import { D } from "./graph";

export type SearchKeyHandlers = {
  getQuery: () => string;
  clearQuery: () => void;
  closePanel: () => void;
  openIndex: (index: number) => void;
  getResultIds: () => readonly number[];
};

// Enter opens an exact name match, or the first visible result.
// Esc clears the query, then closes the detail panel when the query is empty.
// Up/Down move focus through the visible result buttons.
export function handleSearchKey(e: KeyboardEvent, handlers: SearchKeyHandlers): boolean {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return false;
  if (e.key === "Escape") {
    e.preventDefault();
    if (handlers.getQuery().trim()) handlers.clearQuery();
    else handlers.closePanel();
    return true;
  }
  const target = e.target instanceof HTMLElement ? e.target : null;
  const inSearch = target?.id === "vh-search";
  const onResult = !!target?.hasAttribute("data-vh-result");
  if ((e.key === "ArrowDown" || e.key === "ArrowUp") && (inSearch || onResult)) {
    e.preventDefault();
    moveResult(e.key === "ArrowDown" ? 1 : -1);
    return true;
  }
  if (e.key === "Enter" && inSearch) {
    e.preventDefault();
    openMatch(handlers);
    return true;
  }
  return false;
}

function visibleResults(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>("[data-vh-result]")].filter((el) => {
    if (el.closest("[hidden]")) return false;
    const style = getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  });
}

function moveResult(dir: 1 | -1): void {
  const list = visibleResults();
  if (!list.length) return;
  const idx = list.findIndex((el) => el === document.activeElement);
  if (idx < 0) {
    list[dir === 1 ? 0 : list.length - 1].focus();
    return;
  }
  const next = idx + dir;
  if (next >= 0 && next < list.length) list[next].focus();
  else if (next < 0) document.getElementById("vh-search")?.focus();
}

function openMatch(handlers: SearchKeyHandlers): void {
  const q = handlers.getQuery().trim().toLowerCase();
  if (!q) return;
  const visible = handlers.getResultIds();
  const matching = visible.filter((i) => D[i]?.n.toLowerCase().includes(q));
  const ids = matching.length ? matching : visible;
  if (!ids.length) return;
  const exact = ids.find((i) => D[i]?.n.toLowerCase() === q);
  handlers.openIndex(exact ?? ids[0]);
}
