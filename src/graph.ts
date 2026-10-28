/**
 * Dataset 2026-10-28 v9. Builds the same index graph the views already draw
 * (recipes, drops, traders, upgrades) and attaches structure and wiki fields.
 */
import rawData from "./data/data_v9.json";
import wikiFile from "./data/wiki_info.json";

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
  alt_recipes?: { at?: string[]; ingredients?: [string, number][] }[];
  forge_of_potential?: { idol: string; amount: number; when?: string }[];
  fuel?: string[];
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

const data = rawData as { version: string; lanes: string[]; items: RawItem[] };
const wikiEntries = (wikiFile as { entries: Record<string, { summary?: string; stats?: Record<string, unknown>; wiki?: string; wiki_match?: string }> }).entries;

export const DATA_VERSION = data.version;
export const LANES = ["Meadows", "Black Forest", "Swamp", "Mountain", "Plains", "Mistlands", "Ashlands", "Deep North", "Ocean"];
export const LANE_SUB = ["Boss: Eikthyr", "Boss: The Elder", "Boss: Bonemass", "Boss: Moder", "Boss: Yagluth", "Boss: The Queen", "Boss: Fader", "Boss: Kall Fimbulbringer", "Side lane"];
export const GROUPS: [string, string][] = [["B", "Bosses"], ["M", "Minibosses"], ["C", "Creatures"], ["Z", "Structures"], ["T", "Traders"], ["m", "Materials"], ["S", "Stations & buildings"], ["E", "Station upgrades"], ["t", "Tools"], ["w", "Weapons"], ["s", "Shields"], ["o", "Ammo & bait"], ["a", "Armor & accessories"], ["f", "Food"], ["d", "Meads"], ["h", "Fish"], ["r", "Trophies"], ["x", "Other (valuables, keys, misc)"]];
export const GL: Record<string, string> = {};
GROUPS.forEach((g) => { GL[g[0]] = g[1]; });
export const SUB_EN: Record<string, string> = { "1": "one-handed", "2": "two-handed", b: "bow", t: "torch", H: "head", C: "chest", L: "legs", K: "cape", T: "trinket", U: "utility" };
export const DEF_CLOSED = ["w", "s", "o", "a", "f", "d", "h", "r", "x", "E"];
export const KINDS: [string, string][] = [["c", "Crafted at a station"], ["b", "Built with the Hammer"], ["t", "Trade (coins)"], ["g", "Unlocks (boss / chest)"], ["d", "Creature drop"], ["o", "Gather tool, bait, key, offering, fuel, ammo"], ["q", "Found in a structure"], ["p", "Spawns at a structure"]];

const items = data.items;
const indexOf = new Map<string, number>();
items.forEach((it, i) => { if (!indexOf.has(it.name)) indexOf.set(it.name, i); });
const findName = (n: string): number => indexOf.get(n) ?? -1;
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

export const b = (x: string): number => parseInt(x, 36);

export const D: N[] = items.map((it) => {
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
    if (s.found_in) src.push("f" + (s.found_in as string[]).map((n) => String(laneOf(n))).join(""));
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

export const ok = (i: number): boolean => i >= 0 && i < D.length && !isNaN(i);
export const isCre = (i: number): boolean => "BMC".indexOf(D[i].t) >= 0;
export const isBuilt = (i: number): boolean => D[i].t === "S" || D[i].t === "E";
export const find = (n: string): number => findName(n);
export const HAMMER = find("Hammer");
export const COINS = find("Coins");
export const TRIDX: Record<string, number> = { H: find("Haldor"), h: find("Hildir"), W: find("Bog Witch") };

export const KINDC: Record<string, string> = { c: "#f0a640", b: "#7fb2d9", t: "#9fcf6e", g: "#c79bf0", d: "#e8685a", o: "#cdbf9f", q: "#e6d3a3", p: "#8fb59a" };

export const UPS: number[][] = D.map(() => []);
export const EK = new Map<string, string>();
export const EXV = new Map<string, string>();
export const xl = (t: string): string => {
  const c = t[0], p = t.slice(1).split("~");
  if (c === "u") return `Quality ${p[0]} · ${p[1] && ok(b(p[1])) ? D[b(p[1])].n + (p[3] ? ` lvl ${p[3]}` : "") : "by hand"}${p[2] ? "" : " · cost not recorded"}`;
  if (c === "p") return `Forge of Potential · past quality ${p[0]}`;
  return p[0];
};
const add = (to: number, from: number, k: string) => {
  if (!ok(to) || !ok(from) || to === from) return;
  if (UPS[to].indexOf(from) < 0) UPS[to].push(from);
  if (!EK.has(from + ">" + to)) EK.set(from + ">" + to, k);
};
export const DROPPERS: [number, string, string][][] = D.map(() => []);
export const SELLS: [number, string, number][][] = D.map(() => []);
export const GATES: number[][] = D.map(() => []);
export const UPGR: number[][] = D.map(() => []);
export const VALS: [number, string][] = [];

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
      const v = c === "u" ? "upgrade" : c === "a" ? "alt. recipe" : "Forge of Potential";
      (p[1] ? p[1].split(">") : []).forEach((s) => { const j = b(s); add(i, j, "c"); if (r.st.indexOf(j) < 0 && !EXV.has(j + ">" + i)) EXV.set(j + ">" + i, v); });
      (p[2] ? p[2].split(",") : []).forEach((x) => { const j = b(x.split("*")[0]); add(i, j, "c"); if (!EXV.has(j + ">" + i)) EXV.set(j + ">" + i, v); });
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
export const DOWNS: number[][] = D.map(() => []);
UPS.forEach((u, i) => u.forEach((j) => { if (DOWNS[j].indexOf(i) < 0) DOWNS[j].push(i); }));

export function closure(start: number, g: number[][]): Set<number> {
  const seen = new Set<number>();
  const st = [...g[start]];
  while (st.length) { const n = st.pop() as number; if (!seen.has(n) && n !== start) { seen.add(n); g[n].forEach((x) => st.push(x)); } }
  return seen;
}
export const COUNTS = LANES.map((_x, li) => D.filter((r) => r.l === li).length);

const whereOf = (w?: string[]): string => (w || []).join("; ");
const lootOf = (rows?: { item: string; amount?: string; chance_per_roll?: string; chance_per_chest?: string; chance?: string; in_dataset?: boolean }[]): Loot[] => (rows || []).map((r) => {
  const roll = r.chance_per_roll || r.chance || "";
  const chest = r.chance_per_chest && r.chance_per_chest !== roll ? `${r.chance_per_chest} per chest` : "";
  const chance = [roll && (r.chance_per_roll ? `${roll} per roll` : roll), chest].filter(Boolean).join(" · ");
  return { item: r.item, amount: r.amount || "", chance, inDataset: r.in_dataset !== false && findName(r.item) >= 0 };
});

export const FINDS: Find[][] = items.map((it) => (it.sources || []).filter((s) => s.found_in_structure).map((s) => ({
  structure: String(s.found_in_structure),
  via: String(s.via || ""),
  container: s.container ? String(s.container) : undefined,
  amount: s.amount ? String(s.amount) : undefined,
  chance: s.chance ? String(s.chance) : undefined,
  index: findName(String(s.found_in_structure)),
})));

export const STRUCTS: (StructInfo | null)[] = items.map((it) => {
  if (it.type !== "structure") return null;
  return {
    spawns: (it.spawns || []).map((s) => ({ item: s.creature, inDataset: !!s.in_dataset && findName(s.creature) >= 0, where: whereOf(s.where) })),
    chests: (it.chests || []).map((c) => ({ container: c.container || "Chest", rolls: c.rolls || "", loot: lootOf(c.loot) })),
    pickables: (it.pickables || []).map((p) => ({ item: p.item, inDataset: !!p.in_dataset && findName(p.item) >= 0, where: whereOf(p.where) })),
    breakables: (it.containers || []).map((c) => ({ container: c.container || "Container", rolls: c.where || c.rolls || "", loot: lootOf(c.loot) })),
    requirements: (it.requirements || []).filter((x) => x && x !== "None"),
    vegvisir: it.vegvisir || [],
    miniboss: (it.miniboss_drops || []).map((m) => ({ miniboss: m.miniboss || "", drops: m.drops || "" })),
  };
});

const labelStat = (k: string): string => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const showStat = (v: unknown): string => {
  if (v == null || v === "") return "";
  if (Array.isArray(v)) return v.map(showStat).filter(Boolean).join(", ");
  if (typeof v === "object") return Object.entries(v as Record<string, unknown>).map(([k, val]) => `${labelStat(k)} ${showStat(val)}`).join("; ");
  return String(v);
};

export const WIKI: WikiInfo[] = items.map((it) => {
  const e = wikiEntries[it.name] || {};
  const stats: [string, string][] = [];
  Object.entries(e.stats || {}).forEach(([k, v]) => { const s = showStat(v); if (s) stats.push([labelStat(k), s]); });
  return { summary: e.summary || "", stats, wiki: e.wiki || undefined, mentioned: e.wiki_match === "mentioned" };
});

export const isStructEdge = (from: number, to: number): boolean => {
  const k = EK.get(from + ">" + to);
  return k === "q" || k === "p";
};
