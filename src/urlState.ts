import { useEffect, useState } from "react";
import { ALIASES, D, LANES } from "./graph";

export type UrlState = {
  item: number | null;
  biome: number | null;
  q: string;
  chain: boolean;
};

const CHAIN_KEY = "vh-compact-depth";

function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const slugToIndex = new Map<string, number>();
const indexToSlug: string[] = [];
D.forEach((row, i) => {
  const slug = slugify(row.n);
  indexToSlug[i] = slug;
  if (slug && !slugToIndex.has(slug)) slugToIndex.set(slug, i);
});
for (const [alias, index] of ALIASES) {
  const slug = slugify(alias);
  if (slug && !slugToIndex.has(slug)) slugToIndex.set(slug, index);
}
if (!slugToIndex.has("root")) {
  const root = D.findIndex((row) => row.n === "Root (creature)");
  if (root >= 0) slugToIndex.set("root", root);
}

const biomeToIndex = new Map<string, number>(LANES.map((name, i) => [slugify(name), i]));

function storedChain(): boolean {
  // The compact view remembers the chain toggle. The full graph stays on direct links
  // unless the URL asks for the chain, so a compact preference cannot blow up the lanes.
  if (!/\/compact(\/|$)/.test(location.pathname)) return false;
  try { return globalThis.localStorage?.getItem(CHAIN_KEY) === "all"; } catch { return false; }
}

function rememberChain(chain: boolean): void {
  if (!/\/compact(\/|$)/.test(location.pathname)) return;
  try { localStorage.setItem(CHAIN_KEY, chain ? "all" : "1"); } catch { /* private mode */ }
}

export function slugFor(index: number): string {
  return indexToSlug[index] || "";
}

export function indexForSlug(slug: string): number {
  if (!slug) return -1;
  const hit = slugToIndex.get(slug.trim().toLowerCase());
  return hit == null ? -1 : hit;
}

export function readUrl(): UrlState {
  const params = new URLSearchParams(location.search);
  const itemSlug = params.get("item") || "";
  const itemHit = itemSlug ? indexForSlug(itemSlug) : -1;
  const biomeSlug = params.get("biome") || "";
  const biomeHit = biomeSlug ? biomeToIndex.get(biomeSlug.toLowerCase()) : undefined;
  const chain = params.has("mode") ? params.get("mode") === "chain" : storedChain();
  return {
    item: itemHit >= 0 ? itemHit : null,
    biome: biomeHit == null ? null : biomeHit,
    q: params.get("q") || "",
    chain,
  };
}

export function hrefFor(state: UrlState, pathname = location.pathname): string {
  const params = new URLSearchParams();
  if (state.item != null && indexToSlug[state.item]) params.set("item", indexToSlug[state.item]);
  if (state.biome != null && state.biome >= 0 && state.biome < LANES.length) params.set("biome", slugify(LANES[state.biome]));
  if (state.q.trim()) params.set("q", state.q);
  if (state.chain) params.set("mode", "chain");
  const qs = params.toString();
  return pathname + (qs ? `?${qs}` : "") + location.hash;
}

export function syncViewLinks(): void {
  document.querySelectorAll<HTMLAnchorElement>("[data-vh-view-base]").forEach((anchor) => {
    const base = anchor.dataset.vhViewBase || "";
    anchor.href = base + location.search + location.hash;
  });
}

let booted = false;
let cached: UrlState = { item: null, biome: null, q: "", chain: false };

/** Seed history so the first Back from a deep link stays on this view. */
export function bootUrl(): UrlState {
  if (booted) return cached;
  booted = true;
  const current = readUrl();
  if (current.item != null) {
    const base = { ...current, item: null };
    history.replaceState(base, "", hrefFor(base));
    history.pushState(current, "", hrefFor(current));
  } else {
    history.replaceState(current, "", hrefFor(current));
  }
  cached = current;
  if (/\/compact(\/|$)/.test(location.pathname)) rememberChain(current.chain);
  syncViewLinks();
  return current;
}

const listeners = new Set<(state: UrlState) => void>();

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    cached = readUrl();
    rememberChain(cached.chain);
    syncViewLinks();
    listeners.forEach((fn) => fn(cached));
  });
}

function sameState(a: UrlState, b: UrlState): boolean {
  return a.item === b.item && a.biome === b.biome && a.q === b.q && a.chain === b.chain;
}

export function commitUrl(next: UrlState, method: "push" | "replace"): void {
  if (sameState(cached, next) && hrefFor(next) === location.pathname + location.search + location.hash) return;
  cached = next;
  const url = hrefFor(next);
  if (method === "push") history.pushState(next, "", url);
  else history.replaceState(next, "", url);
  rememberChain(next.chain);
  syncViewLinks();
}

export function useAppUrl(): {
  state: UrlState;
  commit: (partial: Partial<UrlState>, method: "push" | "replace") => void;
  back: () => void;
} {
  const [state, setState] = useState<UrlState>(() => bootUrl());
  useEffect(() => {
    const onPop = (next: UrlState) => setState(next);
    listeners.add(onPop);
    return () => { listeners.delete(onPop); };
  }, []);
  const commit = (partial: Partial<UrlState>, method: "push" | "replace") => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      commitUrl(next, method);
      return next;
    });
  };
  return { state, commit, back: () => history.back() };
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function shareUrl(): string {
  return location.href;
}
