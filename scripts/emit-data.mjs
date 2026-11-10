/**
 * Writes public/data/index.json (names, lanes, types, links) and
 * public/data/lane-N.json (stats, loot, summaries) for on-demand fetch.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { joinClauses } from "./public-text.mjs";
import { classifyFood } from "./food-role.mjs";
import { slugify } from "./slug.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const LANES = ["Meadows", "Black Forest", "Swamp", "Mountain", "Plains", "Mistlands", "Ashlands", "Deep North", "Ocean"];
const EDGE_RELATIONS = new Set(["plant", "ammo", "fuel", "unlocks", "process", "obliterator"]);

const data = JSON.parse(readFileSync(join(root, "src/data/data_v9.json"), "utf8"));
const wiki = JSON.parse(readFileSync(join(root, "src/data/wiki_info.json"), "utf8"));
let moreInfo = {};
try {
  moreInfo = JSON.parse(readFileSync(join(root, "src/data/more-info.json"), "utf8")).links || {};
} catch { /* optional until the map is built */ }

const labelStat = (k) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const showStat = (v) => {
  if (v == null || v === "") return "";
  if (Array.isArray(v)) return v.map(showStat).filter(Boolean).join(", ");
  if (typeof v === "object") return Object.entries(v).map(([k, val]) => `${labelStat(k)} ${showStat(val)}`).join("; ");
  return String(v);
};

const TYPE_CHAR = {
  boss: "B", miniboss: "M", creature: "C", trader: "T", material: "m", station: "S",
  station_upgrade: "E", tool: "t", weapon: "w", shield: "s", ammo: "o", armor: "a",
  food: "f", mead: "d", fish: "h", trophy: "r", misc: "x", structure: "Z",
};
const ROLE_CHAR = { Eitr: "E", Health: "H", Stamina: "S", Balanced: "B" };
const idOf = new Map(data.items.map((it, i) => [it.name, i]));
const num = (name) => (idOf.has(name) ? idOf.get(name) : -1);
const pairs = (list) => (list || []).map(([name, qty]) => [num(name), qty]).filter((row) => row[0] >= 0);
const stations = (at) => (at || []).filter((name) => name !== "by hand" && name !== "By hand").map((name) => num(name)).filter((n) => n >= 0);
const verifiedCode = (v) => {
  if (v === "valheim.tools") return 2;
  if (v === "valheim.source.gs") return 1;
  if (Array.isArray(v)) return v.some((x) => String(x).includes("valheim.tools")) ? 2 : 1;
  return 0;
};

const indexItems = data.items.map((it) => {
  const src = [];
  const gather = [];
  const xsrc = [];
  for (const s of it.sources || []) {
    if (s.gathered_from) {
      src.push(["g", num(String(s.tool || ""))]);
      gather.push((s.gathered_from || []).join(","));
    }
    if (s.found_in) src.push(["f", s.found_in.map((name) => LANES.indexOf(name)).filter((n) => n >= 0)]);
    if (s.bought_from) src.push(["t", String(s.bought_from), s.price_coins ?? 0, num(String(s.available_after || ""))]);
    if (s.sells_to_any_trader_for_coins != null) src.push(["v", s.sells_to_any_trader_for_coins]);
    if (s.laid_by) src.push(["l", num(String(s.laid_by))]);
    if (s.key) src.push(["k", num(String(s.key))]);
    if (s.bait) src.push(["b", num(String(s.bait))]);
    if (s.upgrades_station) src.push(["e", num(String(s.upgrades_station))]);
    if (s.note && !s.found_in_structure) xsrc.push(`x${s.note}`);
    if (s.found_in_structure) {
      const structureId = num(String(s.found_in_structure));
      src.push(["q", structureId >= 0 ? structureId : String(s.found_in_structure), s.via || ""]);
    }
  }
  for (const u of it.used_in || []) {
    if (u.relation === "plant" && u.in_dataset === false) {
      xsrc.push(`xPlants ${u.target}${u.detail ? ` (${u.detail})` : ""}`);
    }
  }
  const used = (it.used_in || [])
    .filter((u) => EDGE_RELATIONS.has(u.relation) && u.in_dataset !== false && num(u.target) >= 0)
    .map((u) => [u.relation, num(u.target)]);
  return {
    row: [
      Math.max(0, LANES.indexOf(it.lane)),
      TYPE_CHAR[it.type] || "x",
      it.sub || 0,
      it.console_only ? 1 : 0,
      verifiedCode(it.verified),
      it.crafted ? [stations(it.crafted.at), (it.crafted.at || []).some((n) => n === "by hand" || n === "By hand") ? 1 : 0, it.crafted.station_level || 1, it.crafted.yields || 1, pairs(it.crafted.ingredients)] : 0,
      it.built ? [stations(it.built.near_station), it.built.station_level || 1, pairs(it.built.materials)] : 0,
      it.summon_offering ? pairs(it.summon_offering) : 0,
      (it.drops || []).map((d) => [num(String(d[0])), d[1] ?? "", d[2] ?? ""]).filter((d) => d[0] >= 0),
      (it.tame_food || []).map((name) => num(name)).filter((n) => n >= 0),
      src,
      (it.upgrades || []).map((u) => [u.quality, u.station && u.station !== "by hand" && u.station !== "By hand" ? num(u.station) : -1, u.station_level || 0, pairs(u.ingredients)]),
      (it.alt_recipes || []).map((a) => [stations(a.at), a.station_level || 1, a.yields || 1, pairs(a.ingredients)]),
      (it.forge_of_potential || []).map((f) => [Number(String(f.when || "").replace(/\D/g, "")) || 4, num(f.idol), f.amount]),
      (it.fuel || []).map((name) => num(name)).filter((n) => n >= 0),
      used,
      it.aliases?.length ? it.aliases : 0,
    ],
    gather,
    xsrc,
    note: it.note || "",
  };
});
let roles = "";
data.items.forEach((it) => {
  const role = classifyFood(it.type, wiki.entries[it.name]?.stats);
  roles += role ? ROLE_CHAR[role] : ".";
});

const names = new Map(data.items.map((it, i) => [it.name, i]));
const known = (name) => names.has(name);
const whereOf = (parts) => joinClauses(parts);
const lootOf = (rows) => (rows || []).map((r) => {
  const roll = r.chance_per_roll || r.chance || "";
  const chest = r.chance_per_chest && r.chance_per_chest !== roll ? `${r.chance_per_chest} per chest` : "";
  const chance = [roll && (r.chance_per_roll ? `${roll} per roll` : roll), chest].filter(Boolean).join(" · ");
  return { item: r.item, amount: r.amount || "", chance, inDataset: r.in_dataset !== false && known(r.item) };
});

const lanes = LANES.map(() => ({}));
data.items.forEach((it, i) => {
  const lane = Math.max(0, LANES.indexOf(it.lane));
  const entry = wiki.entries[it.name] || {};
  const detail = {};
  if (entry.summary) detail.summary = entry.summary;
  const stats = [];
  Object.entries(entry.stats || {}).forEach(([k, v]) => {
    const s = showStat(v);
    if (s) stats.push([labelStat(k), s]);
  });
  if (stats.length) detail.stats = stats;
  if (entry.wiki) detail.wiki = entry.wiki;
  if (entry.wiki_match === "mentioned") detail.mentioned = true;
  const more = moreInfo[it.name];
  if (!entry.wiki && more) detail.more = more;
  const packed = indexItems[i];
  if (packed.note) detail.note = packed.note;
  if (packed.gather.length) detail.gather = packed.gather;
  if (packed.xsrc.length) detail.xsrc = packed.xsrc;
  const finds = (it.sources || []).filter((s) => s.found_in_structure).map((s) => ({
    structure: String(s.found_in_structure),
    via: String(s.via || ""),
    container: s.container ? String(s.container) : undefined,
    amount: s.amount ? String(s.amount) : undefined,
    chance: s.chance ? String(s.chance) : undefined,
    index: num(String(s.found_in_structure)),
  }));
  if (finds.length) detail.finds = finds;
  if (it.type === "structure") {
    detail.struct = {
      spawns: (it.spawns || []).map((s) => ({ item: s.creature, inDataset: !!s.in_dataset && known(s.creature), where: whereOf(s.where) })),
      chests: (it.chests || []).map((c) => ({ container: c.container || "Chest", rolls: c.rolls || "", loot: lootOf(c.loot) })),
      pickables: (it.pickables || []).map((p) => ({ item: p.item, inDataset: !!p.in_dataset && known(p.item), where: whereOf(p.where) })),
      breakables: (it.containers || []).map((c) => ({ container: c.container || "Container", rolls: c.where || c.rolls || "", loot: lootOf(c.loot) })),
      requirements: (it.requirements || []).filter((x) => x && x !== "None"),
      vegvisir: it.vegvisir || [],
      miniboss: (it.miniboss_drops || []).map((m) => ({ miniboss: m.miniboss || "", drops: m.drops || "" })),
    };
  }
  if (Object.keys(detail).length) lanes[lane][String(i)] = detail;
});

const outDir = join(root, "public/data");
mkdirSync(outDir, { recursive: true });
const index = {
  v: data.version,
  g: data.game,
  names: data.items.map((it) => it.name),
  roles,
  items: indexItems.map((it) => it.row),
};
const pages = data.items.map((it) => ({
  slug: slugify(it.name),
  name: it.name,
  summary: (wiki.entries[it.name]?.summary || "").replace(/\s+/g, " ").trim(),
}));
writeFileSync(join(outDir, "index.json"), JSON.stringify(index));
const cacheDir = join(root, ".cache");
mkdirSync(cacheDir, { recursive: true });
writeFileSync(join(cacheDir, "pages.json"), JSON.stringify(pages));
lanes.forEach((lane, i) => writeFileSync(join(outDir, `lane-${i}.json`), JSON.stringify(lane)));
console.log(`emitted index (${indexItems.length} items) and ${lanes.length} lane files`);
