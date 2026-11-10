/**
 * Dataset 2026-10-28 v9. Builds the same index graph the views already draw
 * (recipes, drops, traders, upgrades) and attaches structure and wiki fields.
 */
import { includeBiomeFoundIn, upgradeStationLabel, upgradeUseLabel } from "../scripts/public-text.mjs";
import type { FoodRole } from "./foodRole";

export { splitUpgradeLabel } from "../scripts/public-text.mjs";

export type N = {
  n: string;
  l: number;
  t: string;
  sub: string;
  st: number[];
  lvl: number;
  y: number;
  rec: number[][];
  dr: string[][];
  src: string[];
  eats: number[];
  v: number;
  note: string;
  ex: string[];
};

export type Find = {
  structure: string;
  via: string;
  container?: string;
  amount?: string;
  chance?: string;
  index: number;
};

export type Loot = { item: string; amount: string; chance: string; inDataset: boolean };
export type Chest = { container: string; rolls: string; loot: Loot[] };
export type NamedRef = { item: string; inDataset: boolean; where: string };
export type StructInfo = {
  spawns: NamedRef[];
  chests: Chest[];
  pickables: NamedRef[];
  breakables: Chest[];
  requirements: string[];
  vegvisir: string[];
  miniboss: { miniboss: string; drops: string }[];
};

export type WikiInfo = {
  summary: string;
  stats: [string, string][];
  wiki?: string;
  mentioned: boolean;
  more?: string;
};

type RawItem = {
  name: string;
  lane: string;
  type: string;
  sub?: string;
  console_only?: boolean;
  crafted?: { at?: string[]; station_level?: number; yields?: number; ingredients?: [string, number][] };
  built?: { tool?: string; near_station?: string[]; materials?: [string, number][]; station_level?: number };
  summon_offering?: [string, number][];
  drops?: (string | number)[][];
  sources?: Record<string, unknown>[];
  tame_food?: string[];
  verified?: string | string[];
  note?: string;
  used_in?: { target: string; relation: string; amount?: number | null; detail?: string; in_dataset?: boolean }[];
  upgrades?: { quality: number; station?: string; station_level?: number; ingredients?: [string, number][] }[];
  alt_recipes?: { at?: string[]; ingredients?: [string, number][]; station_level?: number; yields?: number }[];
  forge_of_potential?: { idol: string; amount: number; when?: string }[];
  fuel?: string[];
  aliases?: string[];
  food_role?: "Eitr" | "Health" | "Stamina" | "Balanced" | null;
  spawns?: { creature: string; in_dataset?: boolean; where?: string[] }[];
  chests?: { container?: string; rolls?: string; loot?: { item: string; amount?: string; chance_per_roll?: string; chance_per_chest?: string; chance?: string; in_dataset?: boolean }[] }[];
  pickables?: { item: string; in_dataset?: boolean; where?: string[] }[];
  containers?: { container?: string; where?: string; rolls?: string | null; loot?: { item: string; amount?: string; chance?: string; in_dataset?: boolean }[] }[];
  requirements?: string[];
  vegvisir?: string[];
  miniboss_drops?: { miniboss?: string; drops?: string }[];
};

const TYPE: Record<string, string> = {
  boss: "B", miniboss: "M", creature: "C", trader: "T", material: "m", station: "S",
  station_upgrade: "E", tool: "t", weapon: "w", shield: "s", ammo: "o", armor: "a",
  food: "f", mead: "d", fish: "h", trophy: "r", misc: "x", structure: "Z",
};
const TRADER: Record<string, string> = { Haldor: "H", Hildir: "h", "Bog Witch": "W" };
export const LANES = ["Meadows", "Black Forest", "Swamp", "Mountain", "Plains", "Mistlands", "Ashlands", "Deep North", "Ocean"];
export const LANE_SUB = ["Boss: Eikthyr", "Boss: The Elder", "Boss: Bonemass", "Boss: Moder", "Boss: Yagluth", "Boss: The Queen", "Boss: Fader", "Boss: Kall Fimbulbringer", "Side lane"];
export const GROUPS: [string, string][] = [["B", "Bosses"], ["M", "Minibosses"], ["C", "Creatures"], ["Z", "Structures"], ["T", "Traders"], ["m", "Materials"], ["S", "Stations & buildings"], ["E", "Station upgrades"], ["t", "Tools"], ["w", "Weapons"], ["s", "Shields"], ["o", "Ammo & bait"], ["a", "Armor & accessories"], ["f", "Food"], ["d", "Meads"], ["h", "Fish"], ["r", "Trophies"], ["x", "Other (valuables, keys, misc)"]];
export const GL: Record<string, string> = {};
GROUPS.forEach((g) => { GL[g[0]] = g[1]; });
export const SUB_EN: Record<string, string> = { "1": "one-handed", "2": "two-handed", b: "bow", t: "torch", H: "head", C: "chest", L: "legs", K: "cape", T: "trinket", U: "utility" };
export const DEF_CLOSED = ["w", "s", "o", "a", "f", "d", "h", "r", "x", "E"];
export const KINDS: [string, string][] = [["c", "Crafted at a station"], ["b", "Built with the Hammer"], ["t", "Trade (coins)"], ["g", "Unlocks (boss / chest)"], ["d", "Creature drop"], ["o", "Gather tool, bait, key, offering, fuel, ammo"], ["q", "Found in a structure"], ["p", "Spawns at a structure"]];

export let DATA_VERSION = "";
export let GAME = "";
export let VERSION_BADGE = "";
export let D: N[] = [];
export let HAMMER = -1;
export let COINS = -1;
export let TRIDX: Record<string, number> = { H: -1, h: -1, W: -1 };
export let UPS: number[][] = [];
export let DROPPERS: [number, string, string][][] = [];
export let SELLS: [number, string, number][][] = [];
export let GATES: number[][] = [];
export let UPGR: number[][] = [];
export let VALS: [number, string][] = [];
export let DOWNS: number[][] = [];
export let COUNTS: number[] = [];
export let FINDS: Find[][] = [];
export let STRUCTS: (StructInfo | null)[] = [];
export let WIKI: WikiInfo[] = [];
export let FOOD_ROLE: (FoodRole | null)[] = [];
export let ALIASES: [string, number][] = [];
export let PRIMARY: (CraftRecipe | null)[] = [];
export let ALTS: CraftRecipe[][] = [];
export let QUALITIES: QualityStep[][] = [];

const indexOf = new Map<string, number>();
const findName = (n: string): number => indexOf.get(n) ?? -1;
export const b = (x: string): number => parseInt(x, 36);
export const ok = (i: number): boolean => i >= 0 && i < D.length && !isNaN(i);
export const isCre = (i: number): boolean => "BMC".indexOf(D[i].t) >= 0;
export const isBuilt = (i: number): boolean => D[i].t === "S" || D[i].t === "E";
export const find = (n: string): number => findName(n);
export const KINDC: Record<string, string> = { c: "#f0a640", b: "#7fb2d9", t: "#9fcf6e", g: "#c79bf0", d: "#e8685a", o: "#cdbf9f", q: "#e6d3a3", p: "#8fb59a" };
export const EK = new Map<string, string>();
export const EXV = new Map<string, string>();
export const xl = (t: string): string => {
  const c = t[0], p = t.slice(1).split("~");
  if (c === "u") return `Quality ${p[0]} · ${p[1] && ok(b(p[1])) ? D[b(p[1])].n + (p[3] ? ` lvl ${p[3]}` : "") : "by hand"}${p[2] ? "" : " · cost not recorded"}`;
  if (c === "p") return `Forge of Potential · past quality ${p[0]}`;
  return p[0];
};

export function dataFileUrl(file: string): string {
  let path = location.pathname.replace(/index\.html$/, "");
  path = path.replace(/\/compact\/?$/, "/").replace(/\/i\/[^/]+\/?$/, "/");
  if (!path.endsWith("/")) path += "/";
  return new URL(`data/${file}`, `${location.origin}${path}`).href;
}

let detailGen = 0;
const detailListeners = new Set<() => void>();
export function subscribeDetails(listener: () => void): () => void {
  detailListeners.add(listener);
  return () => detailListeners.delete(listener);
}
export function detailGeneration(): number {
  return detailGen;
}

const lanesLoaded = new Set<number>();
export async function ensureLane(lane: number): Promise<void> {
  if (lanesLoaded.has(lane) || lane < 0) return;
  lanesLoaded.add(lane);
  const res = await fetch(dataFileUrl(`lane-${lane}.json`));
  if (!res.ok) return;
  const rows = await res.json() as Record<string, {
    summary?: string;
    stats?: [string, string][];
    wiki?: string;
    mentioned?: boolean;
    more?: string;
    struct?: StructInfo | null;
    note?: string;
    gather?: string[];
    xsrc?: string[];
    finds?: Find[];
  }>;
  let changed = false;
  for (const [key, row] of Object.entries(rows)) {
    const i = Number(key);
    if (!ok(i)) continue;
    WIKI[i] = {
      summary: row.summary || "",
      stats: row.stats || [],
      wiki: row.wiki,
      mentioned: !!row.mentioned,
      more: row.more,
    };
    if (row.struct) STRUCTS[i] = row.struct;
    if (row.note) D[i].note = row.note;
    if (row.gather?.length) {
      let g = 0;
      D[i].src = D[i].src.map((token) => {
        if (token[0] !== "g") return token;
        const objs = row.gather?.[g++] || "";
        const at = token.indexOf("@");
        return `g${objs}${at >= 0 ? token.slice(at) : ""}`;
      });
    }
    if (row.xsrc) row.xsrc.forEach((line) => { if (D[i].src.indexOf(line) < 0) D[i].src.push(line); });
    if (row.finds) FINDS[i] = row.finds;
    changed = true;
  }
  if (changed) {
    detailGen += 1;
    detailListeners.forEach((fn) => fn());
  }
}

export async function loadGraph(): Promise<void> {
  if (D.length) return;
  const res = await fetch(dataFileUrl("index.json"));
  if (!res.ok) throw new Error("Could not load the progression index");
  const data = await res.json() as Dense;
  install(data);
}

const TYPE_NAME: Record<string, string> = {
  B: "boss", M: "miniboss", C: "creature", T: "trader", m: "material", S: "station",
  E: "station_upgrade", t: "tool", w: "weapon", s: "shield", o: "ammo", a: "armor",
  f: "food", d: "mead", h: "fish", r: "trophy", x: "misc", Z: "structure",
};
const ROLE_NAME: Record<string, RawItem["food_role"]> = { E: "Eitr", H: "Health", S: "Stamina", B: "Balanced" };

type Dense = { v: string; g: string; names: string[]; roles: string; items: unknown[][] };

function expand(data: Dense): RawItem[] {
  const name = (i: number): string => (i >= 0 && i < data.names.length ? data.names[i] : "");
  const pairs = (list: unknown): [string, number][] => (Array.isArray(list) ? list : [])
    .map((pair) => {
      const [i, q] = pair as [number, number];
      return [name(i), q] as [string, number];
    })
    .filter((pair) => pair[0]);
  return data.items.map((row, index) => {
    const crafted = row[5] as [number[], number, number, number, [number, number][]] | 0;
    const built = row[6] as [number[], number, [number, number][]] | 0;
    const sources: Record<string, unknown>[] = [];
    for (const part of (row[10] as unknown[]) || []) {
      const p = part as unknown[];
      const kind = p[0];
      if (kind === "g") sources.push({ gathered_from: [], tool: name(Number(p[1])) || undefined });
      if (kind === "f") sources.push({ found_in: (p[1] as number[]).map((n) => LANES[n]).filter(Boolean) });
      if (kind === "t") sources.push({ bought_from: p[1], price_coins: p[2], available_after: name(Number(p[3])) || undefined });
      if (kind === "v") sources.push({ sells_to_any_trader_for_coins: p[1] });
      if (kind === "l" && name(Number(p[1]))) sources.push({ laid_by: name(Number(p[1])) });
      if (kind === "k" && name(Number(p[1]))) sources.push({ key: name(Number(p[1])) });
      if (kind === "b" && name(Number(p[1]))) sources.push({ bait: name(Number(p[1])) });
      if (kind === "e" && name(Number(p[1]))) sources.push({ upgrades_station: name(Number(p[1])) });
      if (kind === "q") {
        const structure = typeof p[1] === "number" ? name(p[1]) : String(p[1] || "");
        if (structure) sources.push({ found_in_structure: structure, via: p[2] || "" });
      }
    }
    const role = ROLE_NAME[data.roles[index]] ?? null;
    return {
      name: data.names[index],
      lane: LANES[Number(row[0])] || LANES[0],
      type: TYPE_NAME[String(row[1])] || "misc",
      sub: row[2] ? String(row[2]) : undefined,
      console_only: row[3] ? true : undefined,
      verified: Number(row[4]) === 2 ? "valheim.tools" : Number(row[4]) === 1 ? "valheim.source.gs" : undefined,
      crafted: crafted ? {
        at: [...(crafted[1] ? ["by hand"] : []), ...crafted[0].map((id) => name(id)).filter(Boolean)],
        station_level: crafted[2],
        yields: crafted[3],
        ingredients: pairs(crafted[4]),
      } : undefined,
      built: built ? {
        near_station: built[0].map((id) => name(id)).filter(Boolean),
        station_level: built[1],
        materials: pairs(built[2]),
      } : undefined,
      summon_offering: row[7] ? pairs(row[7]) : undefined,
      drops: ((row[8] as unknown[]) || []).map((d) => {
        const [i, amount, chance] = d as [number, string | number, string | number];
        return [name(i), amount, chance];
      }),
      sources,
      tame_food: ((row[9] as number[]) || []).map((id) => name(id)).filter(Boolean),
      upgrades: ((row[11] as unknown[]) || []).map((u) => {
        const [quality, station, level, ingredients] = u as [number, number, number, [number, number][]];
        return { quality, station: station >= 0 ? name(station) : "by hand", station_level: level || undefined, ingredients: pairs(ingredients) };
      }),
      alt_recipes: ((row[12] as unknown[]) || []).map((a) => {
        const [at, level, yields, ingredients] = a as [number[], number, number, [number, number][]];
        return { at: at.map((id) => name(id)).filter(Boolean), station_level: level, yields, ingredients: pairs(ingredients) };
      }),
      forge_of_potential: ((row[13] as unknown[]) || []).map((f) => {
        const [quality, idol, amount] = f as [number, number, number];
        return { idol: name(idol), amount, when: `quality ${quality}` };
      }),
      fuel: ((row[14] as number[]) || []).map((id) => name(id)).filter(Boolean),
      used_in: ((row[15] as unknown[]) || []).map((u) => {
        const [relation, target] = u as [string, number];
        return { relation, target: name(target), in_dataset: true };
      }).filter((u) => u.target),
      aliases: Array.isArray(row[16]) ? row[16] as string[] : undefined,
      food_role: role,
    };
  });
}

function install(data: Dense) {
  const items = expand(data);
  DATA_VERSION = data.v;
  GAME = data.g;
  const dataDate = /^(\d{4}-\d{2}-\d{2})/.exec(data.v)?.[1] ?? data.v;
  VERSION_BADGE = `${data.g} · data ${dataDate}`;
  indexOf.clear();
  items.forEach((it, i) => { if (!indexOf.has(it.name)) indexOf.set(it.name, i); });
  const id36 = (i: number): string => i.toString(36);
const laneOf = (name: string): number => Math.max(0, LANES.indexOf(name));

const verified = (v: RawItem["verified"]): number => {
  if (v === "valheim.tools") return 2;
  if (v === "valheim.source.gs") return 1;
  if (Array.isArray(v)) return v.some((x) => String(x).includes("valheim.tools")) ? 2 : 1;
  return 0;
};

const ing = (pairs?: [string, number][]): string => (pairs || [])
  .map(([n, q]) => { const i = findName(n); return i >= 0 ? `${id36(i)}*${q}` : ""; })
  .filter(Boolean)
  .join(",");
const stations = (at?: string[]): string => (at || [])
  .map((n) => (n === "by hand" ? "" : id36(findName(n))))
  .filter((s) => s && !s.startsWith("-"))
  .join(">");

D = items.map((it) => {
  const crafted = it.crafted;
  const built = it.built;
  const byHand = !!crafted && (crafted.at || []).indexOf("by hand") >= 0;
  const st: number[] = [];
  if (crafted) {
    if (byHand) st.push(-1);
    (crafted.at || []).forEach((n) => { if (n !== "by hand") { const i = findName(n); if (i >= 0) st.push(i); } });
  } else if (built) {
    (built.near_station || []).forEach((n) => { const i = findName(n); if (i >= 0) st.push(i); });
  }
  const rec: number[][] = [];
  const addRec = (pairs?: [string, number][]) => (pairs || []).forEach(([n, q]) => { const i = findName(n); if (i >= 0) rec.push([i, q]); });
  if (it.summon_offering && "BMC".includes(TYPE[it.type] || "")) addRec(it.summon_offering);
  else if (crafted) addRec(crafted.ingredients);
  else if (built) addRec(built.materials);
  const dr: string[][] = [];
  if (!it.console_only) (it.drops || []).forEach((d) => {
    const i = findName(String(d[0]));
    if (i >= 0) dr.push([id36(i), d[1] != null ? String(d[1]) : "", d[2] != null ? String(d[2]) : ""]);
  });
  const src: string[] = [];
  (it.sources || []).forEach((s) => {
    if (s.gathered_from) {
      const objs = (s.gathered_from as string[]).join(",");
      const tool = s.tool ? findName(String(s.tool)) : -1;
      src.push("g" + objs + (tool >= 0 ? "@" + id36(tool) : ""));
    }
    if (s.found_in && includeBiomeFoundIn(it.type)) src.push("f" + (s.found_in as string[]).map((n) => String(laneOf(n))).join(""));
    if (s.bought_from) {
      const code = TRADER[String(s.bought_from)] || "";
      const gate = s.available_after ? findName(String(s.available_after)) : -1;
      if (code) src.push("t" + code + String(s.price_coins ?? "") + (gate >= 0 ? "@" + id36(gate) : ""));
    }
    if (s.sells_to_any_trader_for_coins != null) src.push("v" + String(s.sells_to_any_trader_for_coins));
    if (s.laid_by) { const i = findName(String(s.laid_by)); if (i >= 0) src.push("l" + id36(i)); }
    if (s.key) { const i = findName(String(s.key)); if (i >= 0) src.push("k" + id36(i)); }
    if (s.bait) { const i = findName(String(s.bait)); if (i >= 0) src.push("b" + id36(i)); }
    if (s.upgrades_station) { const i = findName(String(s.upgrades_station)); if (i >= 0) src.push("e" + id36(i)); }
    if (s.note && !s.found_in_structure) src.push("x" + String(s.note));
  });
  const eats = (it.tame_food || []).map(findName).filter((i) => i >= 0);
  const ex: string[] = [];
  (it.upgrades || []).forEach((u) => {
    const stId = u.station && u.station !== "by hand" && findName(u.station) >= 0 ? id36(findName(u.station)) : "";
    ex.push(`u${u.quality}~${stId}~${ing(u.ingredients)}~${u.station_level || ""}`);
  });
  (it.alt_recipes || []).forEach((a) => ex.push(`aAlternative recipe~${stations(a.at)}~${ing(a.ingredients)}`));
  (it.forge_of_potential || []).forEach((f) => {
    const q = (f.when || "").replace(/[^0-9]/g, "") || "4";
    const idol = findName(f.idol);
    ex.push(`p${q}~~${idol >= 0 ? id36(idol) + "*" + f.amount : ""}`);
  });
  (it.fuel || []).forEach((n) => { const i = findName(n); if (i >= 0) ex.push("F" + id36(i)); });
  if (!it.console_only) (it.used_in || []).forEach((u) => {
    if (u.relation === "obliterator") {
      const j = findName(u.target);
      if (j >= 0) ex.push(`x${(u.detail || "Obliterator").replace(/~/g, " ")}~${id36(j)}`);
    }
    if (u.relation === "plant" && u.in_dataset === false) src.push("xPlants " + u.target + (u.detail ? " (" + u.detail + ")" : ""));
  });
  return {
    n: it.name,
    l: laneOf(it.lane),
    t: TYPE[it.type] || "x",
    sub: it.sub || "",
    st,
    lvl: (crafted || built)?.station_level || 1,
    y: crafted?.yields || 1,
    rec, dr, src, eats,
    v: verified(it.verified),
    note: it.note || "",
    ex,
  };
});

HAMMER = find("Hammer");
COINS = find("Coins");
TRIDX = { H: find("Haldor"), h: find("Hildir"), W: find("Bog Witch") };

UPS = D.map(() => []);
EK.clear();
EXV.clear();
const add = (to: number, from: number, k: string) => {
  if (!ok(to) || !ok(from) || to === from) return;
  if (UPS[to].indexOf(from) < 0) UPS[to].push(from);
  if (!EK.has(from + ">" + to)) EK.set(from + ">" + to, k);
};
DROPPERS = D.map(() => []);
SELLS = D.map(() => []);
GATES = D.map(() => []);
UPGR = D.map(() => []);
VALS = [];

D.forEach((r, i) => {
  const raw = items[i];
  if (raw.console_only) return;
  const k = isCre(i) ? "o" : isBuilt(i) ? "b" : "c";
  r.rec.forEach((x) => add(i, x[0], k));
  r.st.forEach((x) => { if (x >= 0) add(i, x, k); });
  if (isBuilt(i) && HAMMER >= 0) add(i, HAMMER, "b");
  r.src.forEach((t) => {
    const c = t[0], body = t.slice(1), at = t.indexOf("@");
    const gate = at >= 0 ? b(t.slice(at + 1)) : -1;
    if (c === "g" && at >= 0) add(i, gate, "o");
    if (c === "t") {
      const tr = TRIDX[body[0]] as number;
      const price = at >= 0 ? body.slice(1, at) : body.slice(1);
      add(i, tr, "t");
      if (ok(tr)) SELLS[tr].push([i, price, gate]);
      if (ok(gate)) { add(i, gate, "g"); GATES[gate].push(i); }
    }
    if (c === "l" || c === "k" || c === "b") add(i, b(body), "o");
    if (c === "e") { const s = b(body); add(i, s, "b"); if (ok(s)) UPGR[s].push(i); }
    if (c === "v") { add(COINS, i, "t"); VALS.push([i, body]); }
  });
  r.dr.forEach((d) => { const j = b(d[0]); if (!ok(j)) return; add(j, i, "d"); DROPPERS[j].push([i, d[1] || "100", d[2] || "1"]); });
  r.ex.forEach((t) => {
    const c = t[0], p = t.slice(1).split("~");
    if (c === "u" || c === "a" || c === "p") {
      const plain = c === "a" ? "alt. recipe" : c === "p" ? "Forge of Potential" : "";
      (p[1] ? p[1].split(">") : []).forEach((s) => {
        const j = b(s);
        add(i, j, "c");
        if (!ok(j) || r.st.indexOf(j) >= 0 || EXV.has(j + ">" + i)) return;
        if (c === "u") {
          const label = upgradeStationLabel(items[i].upgrades, D[j].n);
          if (label) EXV.set(j + ">" + i, label);
        } else if (plain) EXV.set(j + ">" + i, plain);
      });
      (p[2] ? p[2].split(",") : []).forEach((x) => {
        const j = b(x.split("*")[0]);
        add(i, j, "c");
        if (!ok(j) || EXV.has(j + ">" + i)) return;
        if (c === "u") {
          const label = upgradeUseLabel(items[i].upgrades, D[j].n);
          if (label) EXV.set(j + ">" + i, label);
        } else if (plain) EXV.set(j + ">" + i, plain);
      });
    }
    if (c === "F") { const j = b(t.slice(1)); add(i, j, "o"); EXV.set(j + ">" + i, "fuel"); }
    if (c === "x" && p.length > 1) { const j = b(p[1]); add(j, i, "o"); EXV.set(i + ">" + j, p[0]); }
  });
  (raw.used_in || []).forEach((u) => {
    if (!u.in_dataset && u.in_dataset !== undefined && u.relation !== "plant") return;
    const j = findName(u.target);
    if (!ok(j)) return;
    if (u.relation === "plant") { add(j, i, "o"); if (!EXV.has(i + ">" + j)) EXV.set(i + ">" + j, "plant"); }
    if (u.relation === "ammo") { add(j, i, "o"); if (!EXV.has(i + ">" + j)) EXV.set(i + ">" + j, "ammo"); }
    if (u.relation === "fuel" && !(raw.fuel || []).length) { add(j, i, "o"); EXV.set(i + ">" + j, "fuel"); }
    if (u.relation === "unlocks") { add(j, i, "g"); if (!EXV.has(i + ">" + j)) EXV.set(i + ">" + j, "unlocks"); }
    if (u.relation === "process") {
      const already = (items[j].crafted?.ingredients || []).some((p) => p[0] === raw.name);
      if (!already) { add(j, i, "c"); if (!EXV.has(i + ">" + j)) EXV.set(i + ">" + j, "process"); }
    }
  });
  (raw.sources || []).forEach((s) => {
    if (!s.found_in_structure) return;
    const j = findName(String(s.found_in_structure));
    if (!ok(j)) return;
    const kind = s.via === "spawn" ? "p" : "q";
    add(i, j, kind);
  });
});
Object.keys(TRIDX).forEach((k) => add(TRIDX[k], COINS, "t"));
DOWNS = D.map(() => []);
UPS.forEach((u, i) => u.forEach((j) => { if (DOWNS[j].indexOf(i) < 0) DOWNS[j].push(i); }));
COUNTS = LANES.map((_x, li) => D.filter((r) => r.l === li).length);

FINDS = items.map((it) => (it.sources || []).filter((s) => s.found_in_structure).map((s) => ({
  structure: String(s.found_in_structure),
  via: String(s.via || ""),
  container: s.container ? String(s.container) : undefined,
  amount: s.amount ? String(s.amount) : undefined,
  chance: s.chance ? String(s.chance) : undefined,
  index: findName(String(s.found_in_structure)),
})));

STRUCTS = items.map(() => null);
WIKI = items.map(() => ({ summary: "", stats: [], mentioned: false }));
FOOD_ROLE = items.map((it) => it.food_role ?? null);
ALIASES = [];
items.forEach((it, i) => {
  (it.aliases || []).forEach((alias) => {
    const name = String(alias || "").trim();
    if (name) ALIASES.push([name, i]);
  });
});

function recipeFrom(at: string[] | undefined, ingredients: [string, number][] | undefined, level?: number, yields?: number): CraftRecipe | null {
  const list: [number, number][] = [];
  (ingredients || []).forEach(([n, q]) => {
    const i = findName(n);
    if (i >= 0 && q > 0) list.push([i, q]);
  });
  if (!list.length) return null;
  let station = -1;
  for (const n of at || []) {
    if (n === "by hand" || n === "By hand") { station = -1; break; }
    const i = findName(n);
    if (i >= 0) { station = i; break; }
  }
  return { ingredients: list, station, level: level || 1, yields: yields && yields > 0 ? yields : 1 };
}

PRIMARY = items.map((it) => {
  if (it.crafted) return recipeFrom(it.crafted.at, it.crafted.ingredients, it.crafted.station_level, it.crafted.yields);
  if (it.built) return recipeFrom(it.built.near_station, it.built.materials, it.built.station_level, 1);
  if (it.summon_offering) return recipeFrom(undefined, it.summon_offering, 1, 1);
  return null;
});

ALTS = items.map((it) => (it.alt_recipes || [])
  .map((alt) => recipeFrom(alt.at, alt.ingredients, alt.station_level, alt.yields))
  .filter((r): r is CraftRecipe => r !== null));

QUALITIES = items.map((it) => (it.upgrades || []).map((u) => {
  const named = u.station && u.station !== "by hand" && u.station !== "By hand" ? findName(u.station) : -1;
  return { quality: u.quality, station: named, level: u.station_level || 1 };
}));
}

export type { FoodRole };
export type CraftRecipe = {
  ingredients: [number, number][];
  station: number;
  level: number;
  yields: number;
};
export type QualityStep = { quality: number; station: number; level: number };

export const isStructEdge = (from: number, to: number): boolean => {
  const k = EK.get(from + ">" + to);
  return k === "q" || k === "p";
};

export function closure(start: number, g: number[][]): Set<number> {
  const seen = new Set<number>();
  const st = [...g[start]];
  while (st.length) { const n = st.pop() as number; if (!seen.has(n) && n !== start) { seen.add(n); g[n].forEach((x) => st.push(x)); } }
  return seen;
}

/** One hop on the shortest path toward or away from the selected entry. */
export type ChainHop = { i: number; k: string; dist: number };

/**
 * Every entry reachable through UPS (everything required) or DOWNS (everything
 * it unlocks), nearest hop first. Each entry is recorded once. `seen` stops
 * cycles, so the walk is bounded by the dataset size.
 * The reachable set matches `closure` for the same direction.
 */
export function walkChain(start: number, dir: "up" | "down"): ChainHop[] {
  if (!ok(start)) return [];
  const g = dir === "up" ? UPS : DOWNS;
  const seen = new Set<number>([start]);
  const out: ChainHop[] = [];
  const q: { i: number; dist: number }[] = [];
  const enqueue = (i: number, from: number, dist: number) => {
    if (!ok(i) || seen.has(i)) return;
    seen.add(i);
    out.push({ i, k: EK.get(dir === "up" ? i + ">" + from : from + ">" + i) || "o", dist });
    q.push({ i, dist });
  };
  (g[start] || []).forEach((n) => enqueue(n, start, 1));
  for (let h = 0; h < q.length; h++) {
    const cur = q[h];
    (g[cur.i] || []).forEach((n) => enqueue(n, cur.i, cur.dist + 1));
  }
  return out;
}
