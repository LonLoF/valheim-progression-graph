import { D, LANES, QUALITIES, ok } from "./graph";

export type Ladder = { id: string; label: string; items: number[] };

const WEAPON_FAMILY: [RegExp, string][] = [
  [/crossbow/i, "Crossbow"],
  [/greatsword/i, "Greatsword"],
  [/greataxe/i, "Greataxe"],
  [/atgeir/i, "Atgeir"],
  [/sledge/i, "Sledge"],
  [/spear|harpoon/i, "Spear"],
  [/knife|dagger|razor/i, "Knife"],
  [/sword/i, "Sword"],
  [/axe/i, "Axe"],
  [/club|mace|frostner|porcupine|bloodgeon|storm star/i, "Mace"],
  [/bow/i, "Bow"],
  [/bomb/i, "Bomb"],
];

const ARMOR_SETS = ["Thunderblood", "Frostfire", "Eitr-weave", "Carapace", "Flametal", "Padded", "Fenris", "Drake", "Bronze", "Troll", "Leather", "Root", "Iron", "Wolf", "Lox", "Ask", "Embla", "Nord"];
const FOOD_STOP = new Set(["cooked", "grilled", "roasted", "smoked", "baked", "uncooked", "meat", "soup", "stew", "pie", "bread", "jam", "with", "from", "base", "mead", "minor", "medium", "major", "lingering", "tasty", "the", "and"]);

function weaponFamily(name: string): string {
  for (const [re, label] of WEAPON_FAMILY) if (re.test(name)) return label;
  return "Other";
}

function shieldFamily(name: string): string {
  if (/tower|greatshield/i.test(name)) return "Tower shield";
  if (/buckler/i.test(name)) return "Buckler";
  return "Shield";
}

function ammoFamily(name: string): string {
  if (/bait/i.test(name)) return "Bait";
  if (/bolt/i.test(name)) return "Bolt";
  if (/missile/i.test(name)) return "Missile";
  if (/arrow/i.test(name)) return "Arrow";
  return "Other";
}

function meadFamily(name: string): string {
  if (/eitr/i.test(name)) return "Eitr";
  if (/stamina/i.test(name)) return "Stamina";
  if (/heal/i.test(name)) return "Healing";
  if (/resistance|barley wine/i.test(name)) return "Resistance";
  return "Other";
}

function foodToken(name: string): string {
  const tokens = name.toLowerCase().replace(/[^a-z]+/g, " ").split(" ").filter((t) => t.length >= 4 && !FOOD_STOP.has(t));
  return tokens[0] || name.toLowerCase();
}

function familyId(index: number): string | null {
  const row = D[index];
  if (row.t === "w") return `weapon:${weaponFamily(row.n)}`;
  if (row.t === "s") return `shield:${shieldFamily(row.n)}`;
  if (row.t === "a") {
    const set = ARMOR_SETS.find((name) => row.n.includes(name));
    const slot = row.sub || "x";
    return set ? `armor:${slot}:set` : `armor:${slot}:wearable`;
  }
  if (row.t === "t") return "tool:Tools";
  if (row.t === "o") return `ammo:${ammoFamily(row.n)}`;
  if (row.t === "d") return `mead:${meadFamily(row.n)}`;
  if (row.t === "f" || row.t === "h") return `food:${foodToken(row.n)}`;
  return null;
}

const byFamily = new Map<string, number[]>();
D.forEach((_row, index) => {
  const id = familyId(index);
  if (!id) return;
  const list = byFamily.get(id);
  if (list) list.push(index);
  else byFamily.set(id, [index]);
});
for (const list of byFamily.values()) {
  list.sort((a, b) => D[a].l - D[b].l || D[a].n.localeCompare(D[b].n, "en", { sensitivity: "base" }));
}

const SLOT: Record<string, string> = { H: "Head", C: "Chest", L: "Legs", K: "Cape", T: "Trinket", U: "Utility", "1": "One-handed", "2": "Two-handed", b: "Bow", t: "Torch" };

function labelFor(id: string): string {
  const [kind, name, extra] = id.split(":");
  if (kind === "weapon") return name;
  if (kind === "shield") return name;
  if (kind === "armor") return `${SLOT[name] || name} · ${extra === "set" ? "armour sets" : "other wearables"}`;
  if (kind === "tool") return "Tools";
  if (kind === "ammo") return name;
  if (kind === "mead") return `${name} meads`;
  if (kind === "food") return name.charAt(0).toUpperCase() + name.slice(1);
  return id;
}

export function familyOf(index: number): string | null {
  return ok(index) ? familyId(index) : null;
}

export function ladderItems(index: number): number[] {
  const id = familyId(index);
  if (!id) return [];
  return (byFamily.get(id) || []).slice();
}

/** The next item in the same ladder that sits in a later biome. */
export function nextBetter(index: number): number | null {
  const list = ladderItems(index);
  const at = list.indexOf(index);
  if (at < 0) return null;
  for (let i = at + 1; i < list.length; i++) {
    if (D[list[i]].l > D[index].l) return list[i];
  }
  return null;
}

export function categoryOf(index: number): string | null {
  const id = familyId(index);
  return id ? id.split(":")[0] : null;
}

export function laddersFor(index: number): Ladder[] {
  const category = categoryOf(index);
  if (!category) return [];
  const out: Ladder[] = [];
  for (const [id, items] of byFamily) {
    if (!id.startsWith(category + ":")) continue;
    if (items.length < 2 && id !== familyId(index)) continue;
    out.push({ id, label: labelFor(id), items: items.slice() });
  }
  out.sort((a, b) => a.label.localeCompare(b.label, "en"));
  return out;
}

export function qualitySteps(index: number): { quality: number; station: number; level: number }[] {
  const ups = QUALITIES[index] || [];
  if (!ups.length) return [];
  return [{ quality: 1, station: ups[0].station, level: ups[0].level || 1 }, ...ups];
}

export function biomeName(index: number): string {
  return LANES[D[index].l] || "";
}
