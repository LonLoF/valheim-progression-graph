import { useSyncExternalStore } from "react";
import { D, EK, LANES, PRIMARY, UPS, ok } from "./graph";
import { indexForSlug, slugFor } from "./urlState";

/**
 * Progress rules (vpg.progress.v1):
 * Meadows is open. Each later biome opens when every boss before it is ticked.
 * Ocean opens with Eikthyr. A direct boss unlock also has to be ticked.
 * A gold edge means the primary recipe can be made: the station is available
 * (auto if its biome is open, or the level you set), and every ingredient is
 * owned, gathered in an open biome, or itself craftable. Owned items are not
 * dimmed and do not glow.
 */
export const PROGRESS_KEY = "vpg.progress.v1";
export const MAX_STATION_LEVEL = 7;

export type Progress = {
  v: 1;
  on: boolean;
  bosses: string[];
  stations: Record<string, number>;
  items: string[];
};

export type ItemMark = {
  gated: boolean;
  craftable: boolean;
  owned: boolean;
  gate: string;
};

const EMPTY: Progress = { v: 1, on: false, bosses: [], stations: {}, items: [] };

function bossNamed(name: string): number {
  return D.findIndex((row) => row.t === "B" && row.n === name);
}

/** Boss required before a lane is open. Meadows has none. Ocean follows Eikthyr. */
export const LANE_BOSS: number[] = [
  -1,
  bossNamed("Eikthyr"),
  bossNamed("The Elder"),
  bossNamed("Bonemass"),
  bossNamed("Moder"),
  bossNamed("Yagluth"),
  bossNamed("The Queen"),
  bossNamed("Fader"),
  bossNamed("Eikthyr"),
];

export const BOSS_INDEXES: number[] = D
  .map((row, index) => (row.t === "B" ? index : -1))
  .filter((index) => index >= 0)
  .sort((a, b) => D[a].l - D[b].l || D[a].n.localeCompare(D[b].n, "en"));

export const STATION_INDEXES: number[] = (() => {
  const ids = new Set<number>();
  PRIMARY.forEach((recipe) => { if (recipe && recipe.station >= 0) ids.add(recipe.station); });
  return [...ids].sort((a, b) => D[a].l - D[b].l || D[a].n.localeCompare(D[b].n, "en"));
})();

const NO_MARK: ItemMark = { gated: false, craftable: false, owned: false, gate: "" };

function slugList(value: unknown, accept: (index: number) => boolean): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") continue;
    const index = indexForSlug(entry);
    if (index < 0 || !accept(index)) continue;
    const slug = slugFor(index);
    if (slug && !out.includes(slug)) out.push(slug);
  }
  return out;
}

export function normalizeProgress(value: unknown): Progress | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (row.v !== 1) return null;
  const stations: Record<string, number> = {};
  if (row.stations && typeof row.stations === "object") {
    for (const [slug, level] of Object.entries(row.stations as Record<string, unknown>)) {
      const index = indexForSlug(slug);
      if (index < 0 || !STATION_INDEXES.includes(index)) continue;
      const parsed = typeof level === "number" ? level : Number(level);
      if (!Number.isFinite(parsed)) continue;
      stations[slugFor(index)] = Math.max(0, Math.min(MAX_STATION_LEVEL, Math.floor(parsed)));
    }
  }
  return {
    v: 1,
    on: row.on === true,
    bosses: slugList(row.bosses, (index) => D[index].t === "B"),
    stations,
    items: slugList(row.items, (index) => ok(index)),
  };
}

export function exportProgress(progress: Progress): string {
  return JSON.stringify(progress, null, 2);
}

function load(): Progress {
  if (typeof localStorage === "undefined") return { ...EMPTY, stations: {}, bosses: [], items: [] };
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...EMPTY, stations: {}, bosses: [], items: [] };
    return normalizeProgress(JSON.parse(raw)) ?? { ...EMPTY, stations: {}, bosses: [], items: [] };
  } catch {
    return { ...EMPTY, stations: {}, bosses: [], items: [] };
  }
}

function save(progress: Progress): void {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch { /* private mode */ }
}

let current = load();
const listeners = new Set<() => void>();

function commit(next: Progress): void {
  current = next;
  save(next);
  listeners.forEach((listener) => listener());
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
  );
}

export function setProgress(next: Progress): void {
  const clean = normalizeProgress(next) ?? { ...EMPTY, stations: {}, bosses: [], items: [] };
  commit({ ...clean, on: next.on === true });
}

export function toggleProgress(on: boolean): void {
  commit({ ...current, on });
}

export function toggleBoss(slug: string): void {
  const bosses = current.bosses.includes(slug)
    ? current.bosses.filter((entry) => entry !== slug)
    : [...current.bosses, slug];
  commit({ ...current, bosses });
}

export function setStationLevel(slug: string, level: number | null): void {
  const stations = { ...current.stations };
  if (level == null) delete stations[slug];
  else stations[slug] = Math.max(0, Math.min(MAX_STATION_LEVEL, Math.floor(level)));
  commit({ ...current, stations });
}

export function toggleOwned(index: number): void {
  const slug = slugFor(index);
  if (!slug) return;
  const items = current.items.includes(slug)
    ? current.items.filter((entry) => entry !== slug)
    : [...current.items, slug];
  commit({ ...current, items });
}

export function resetProgress(): void {
  commit({ ...current, bosses: [], stations: {}, items: [] });
}

function laneOpen(lane: number, bosses: Set<number>): boolean {
  if (lane <= 0) return true;
  const needed: number[] = [];
  if (lane >= LANES.length - 1) {
    const ocean = LANE_BOSS[LANES.length - 1];
    if (ocean >= 0) needed.push(ocean);
  } else {
    for (let i = 1; i <= lane && i < LANE_BOSS.length; i++) {
      const boss = LANE_BOSS[i];
      if (boss >= 0) needed.push(boss);
    }
  }
  return needed.every((boss) => bosses.has(boss));
}

function earliestLaneBoss(lane: number, bosses: Set<number>): string {
  if (lane >= LANES.length - 1) {
    const ocean = LANE_BOSS[LANES.length - 1];
    return ocean >= 0 && !bosses.has(ocean) ? D[ocean].n : "";
  }
  for (let step = 1; step <= lane && step < LANE_BOSS.length; step++) {
    const boss = LANE_BOSS[step];
    if (boss >= 0 && !bosses.has(boss)) return D[boss].n;
  }
  return "";
}

function gateNames(index: number, bosses: Set<number>, open: boolean[]): string[] {
  const names: string[] = [];
  if (!open[D[index].l]) {
    const name = earliestLaneBoss(D[index].l, bosses);
    if (name) names.push(name);
  }
  UPS[index].forEach((from) => {
    if (EK.get(from + ">" + index) === "g" && D[from].t === "B" && !bosses.has(from) && !names.includes(D[from].n)) {
      names.push(D[from].n);
    }
  });
  return names;
}

function stationReady(station: number, level: number, explicit: Map<number, number>, open: boolean[]): boolean {
  if (station < 0 || !ok(station)) return true;
  if (explicit.has(station)) return (explicit.get(station) || 0) >= Math.max(1, level || 1);
  return open[D[station].l];
}

export function evaluateProgress(progress: Progress): ItemMark[] {
  if (!progress.on) return D.map(() => NO_MARK);
  const bosses = new Set(progress.bosses.map((slug) => indexForSlug(slug)).filter((index) => index >= 0));
  const owned = new Set(progress.items.map((slug) => indexForSlug(slug)).filter((index) => index >= 0));
  const explicit = new Map<number, number>();
  Object.entries(progress.stations).forEach(([slug, level]) => {
    const index = indexForSlug(slug);
    if (index >= 0) explicit.set(index, level);
  });
  const open = LANES.map((_, lane) => laneOpen(lane, bosses));
  const gated = D.map((_, index) => gateNames(index, bosses, open));
  const memo = new Map<number, boolean>();
  const visiting = new Set<number>();

  const canCraft = (index: number): boolean => {
    if (memo.has(index)) return memo.get(index) === true;
    if (gated[index].length > 0 || owned.has(index)) {
      memo.set(index, false);
      return false;
    }
    const recipe = PRIMARY[index];
    if (!recipe || recipe.ingredients.length === 0) {
      memo.set(index, false);
      return false;
    }
    if (visiting.has(index)) return false;
    visiting.add(index);
    let yes = stationReady(recipe.station, recipe.level, explicit, open);
    if (yes) {
      for (const [ingredient] of recipe.ingredients) {
        const leaf = !PRIMARY[ingredient] || PRIMARY[ingredient].ingredients.length === 0;
        if (owned.has(ingredient) || (!gated[ingredient].length && leaf) || canCraft(ingredient)) continue;
        yes = false;
        break;
      }
    }
    visiting.delete(index);
    memo.set(index, yes);
    return yes;
  };

  return D.map((_, index) => {
    const isOwned = owned.has(index);
    const names = gated[index];
    return {
      gated: names.length > 0 && !isOwned,
      craftable: !isOwned && canCraft(index),
      owned: isOwned,
      gate: names.join(", "),
    };
  });
}
