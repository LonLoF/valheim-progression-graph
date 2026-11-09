/**
 * Public-copy helpers shared by the site and the build check.
 * No filesystem access: the graph bundle imports this module.
 */

const PROSE = [
  [
    "WoodHouse2 chest can hold a Mysterious Axe Head, WoodHouse6 a Curious Axe Head (25% per roll). WoodHouse4/5 have no chest (only a 25% bee nest).",
    "One variant's chest can hold a Mysterious Axe Head, and another a Curious Axe Head (25% per roll). Two variants have no chest (only a 25% bee nest).",
  ],
  [
    "Ruin1 and StoneHouse3 always have a Black Forest chest; StoneHouse4 has none.",
    "Two layouts always have a Black Forest chest; one has none.",
  ],
  [
    "Black-Forest-type chest (10%, 75% in SwampHut4) guarded by a one-time Wraith (or Draugr in SwampHut4).",
    "Black-Forest-type chest (10%, or 75% in one layout) guarded by a one-time Wraith (or a Draugr in that layout).",
  ],
  [
    "Restored outpost (StoneTower1) always has a Fuling Totem; top-floor Plains chest 50%.",
    "The restored outpost always has a Fuling Totem; the top-floor Plains chest is 50%.",
  ],
  [
    "Giant helmet with swords stuck in the ground (Mistlands_Swords1–3, 33 each per world).",
    "Giant helmet with swords stuck in the ground. Three sites per world, 33 swords at each.",
  ],
];

/** Internal location ids: Crypt2, WoodVillage1, Mistlands_GuardTower1_new, AshlandRuins. Not "L3". */
const PREFAB_TOKEN = "(?!L\\d+\\b)(?:[A-Za-z]+(?:_[A-Za-z0-9]+)+|[A-Z][A-Za-z]*\\d+[A-Za-z0-9_]*|[A-Z][a-z0-9]{2,}(?:[A-Z][A-Za-z0-9]*)+)";
const PREFAB_RE = new RegExp(`\\b(?:${PREFAB_TOKEN})\\b`, "g");
const PREFAB_CLAUSE_RE = new RegExp(`(?:^|;\\s+)(${PREFAB_TOKEN}):\\s+`, "g");

const UPGRADE_RE = /^(?:(\d+(?:\/\d+)*×) )?upgrade \((.+)\)$/;

export function collapseTypography(text) {
  let s = String(text ?? "");
  s = s.replace(/ {2,}/g, " ");
  // A doubled period (T.W.I.G..) but not an ellipsis (time...).
  s = s.replace(/(?<!\.)\.\.(?!\.)/g, ".");
  return s;
}

export function prefabIds(text) {
  if (!text) return [];
  return [...new Set(String(text).match(PREFAB_RE) || [])];
}

/**
 * Drop internal prefab ids from "Crypt2: in 12 of 18 rooms" clauses.
 * The structure's player-facing name is already shown beside the phrase,
 * and the variants have no separate names. Identical clauses collapse.
 */
export function cleanPrefabPhrases(text) {
  const s = String(text ?? "");
  if (!s.includes(": ")) return s;
  PREFAB_CLAUSE_RE.lastIndex = 0;
  const marks = [];
  let m;
  while ((m = PREFAB_CLAUSE_RE.exec(s))) marks.push({ index: m.index, after: m.index + m[0].length });
  if (!marks.length) return s;
  const clauses = [];
  if (marks[0].index > 0) {
    const pre = s.slice(0, marks[0].index).replace(/[;\s]+$/, "").trim();
    if (pre) clauses.push(pre);
  }
  for (let i = 0; i < marks.length; i++) {
    const end = i + 1 < marks.length ? marks[i + 1].index : s.length;
    const clause = s.slice(marks[i].after, end).replace(/[;\s]+$/, "").trim();
    if (clause && !clauses.includes(clause)) clauses.push(clause);
  }
  return clauses.join("; ");
}

export function presentPublic(text) {
  let s = String(text ?? "");
  for (const [from, to] of PROSE) s = s.split(from).join(to);
  s = cleanPrefabPhrases(s);
  return collapseTypography(s);
}

export function joinClauses(parts) {
  const out = [];
  for (const part of parts || []) {
    if (part && !out.includes(part)) out.push(part);
  }
  return out.join("; ");
}

/** Structures already sit in their biome lane, so "Found in: Meadows" is noise. */
export function includeBiomeFoundIn(type) {
  return type !== "structure";
}

export function upgradeUseLabel(upgrades, materialName) {
  const rows = [];
  for (const u of upgrades || []) {
    for (const pair of u.ingredients || []) {
      if (pair[0] === materialName) rows.push({ quality: Number(u.quality), amount: Number(pair[1]) });
    }
  }
  if (!rows.length) return "";
  rows.sort((a, b) => a.quality - b.quality || a.amount - b.amount);
  const amounts = rows.map((r) => r.amount);
  const amount = amounts.every((a) => a === amounts[0]) ? `${amounts[0]}×` : `${amounts.join("/")}×`;
  const level = Math.min(...rows.map((r) => r.quality));
  return `${amount} upgrade (lvl ${level}+)`;
}

export function upgradeStationLabel(upgrades, stationName) {
  const rows = (upgrades || []).filter((u) => u.station === stationName);
  if (!rows.length) return "";
  const level = Math.min(...rows.map((u) => Number(u.quality) || 0));
  const recorded = rows.some((u) => (u.ingredients || []).length > 0);
  return recorded ? `upgrade (lvl ${level}+)` : `upgrade (lvl ${level}+, cost not recorded)`;
}

export function splitUpgradeLabel(label) {
  const m = UPGRADE_RE.exec(label || "");
  if (!m) return null;
  return { prefix: m[1] ? `${m[1]} upgrade →` : "upgrade →", level: m[2] };
}

export function formatUpgradeUse(label, itemName) {
  const parts = splitUpgradeLabel(label);
  if (!parts) return "";
  return `${parts.prefix} ${itemName} (${parts.level})`;
}

function pushText(out, where, text) {
  if (text) out.push({ where, text: String(text) });
}

function walkStrings(value, where, out) {
  if (typeof value === "string") pushText(out, where, value);
  else if (Array.isArray(value)) value.forEach((v, i) => walkStrings(v, `${where}[${i}]`, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) walkStrings(v, `${where}.${k}`, out);
  }
}

/** Strings the detail panels actually render. */
export function publicStrings(data, wiki) {
  const out = [];
  for (const it of data.items) {
    pushText(out, `${it.name} note`, it.note);
    for (const s of it.sources || []) {
      if (s.note && !s.found_in_structure) pushText(out, `${it.name} source note`, s.note);
      if (s.found_in_structure) {
        pushText(out, `${it.name} found in ${s.found_in_structure}`, s.chance);
        pushText(out, `${it.name} amount`, s.amount);
        pushText(out, `${it.name} container`, s.container);
      }
    }
    if (it.type === "structure") {
      for (const s of it.spawns || []) pushText(out, `${it.name} spawns ${s.creature}`, joinClauses(s.where));
      for (const p of it.pickables || []) pushText(out, `${it.name} pick ${p.item || ""}`, joinClauses(p.where));
      for (const c of it.chests || []) {
        pushText(out, `${it.name} chest`, c.container);
        pushText(out, `${it.name} chest rolls`, c.rolls);
      }
      for (const c of it.containers || []) {
        pushText(out, `${it.name} breakable`, c.container);
        pushText(out, `${it.name} breakable rolls`, c.where || c.rolls);
      }
      for (const r of it.requirements || []) pushText(out, `${it.name} requirement`, r);
      for (const v of it.vegvisir || []) pushText(out, `${it.name} vegvisir`, v);
    }
  }
  for (const [name, entry] of Object.entries(wiki.entries || {})) {
    pushText(out, `${name} summary`, entry.summary);
    walkStrings(entry.stats, `${name} stats`, out);
  }
  return out;
}

export function upgradePublicLines(data) {
  const lines = [];
  for (const it of data.items) {
    if (!it.upgrades?.length) continue;
    const baseIng = new Set([...(it.crafted?.ingredients || []), ...(it.built?.materials || [])].map((p) => p[0]));
    const baseSt = new Set([...(it.crafted?.at || []), ...(it.built?.near_station || [])]);
    const seen = new Set();
    for (const u of it.upgrades) {
      for (const [name] of u.ingredients || []) {
        if (baseIng.has(name) || seen.has(name)) continue;
        seen.add(name);
        const stored = upgradeUseLabel(it.upgrades, name);
        lines.push({ where: `${name} → ${it.name}`, text: formatUpgradeUse(stored, it.name), stored, needsAmount: true });
      }
    }
    const stations = new Set();
    for (const u of it.upgrades) {
      if (u.station && u.station !== "by hand" && u.station !== "By hand" && !baseSt.has(u.station)) stations.add(u.station);
    }
    for (const st of stations) {
      const stored = upgradeStationLabel(it.upgrades, st);
      lines.push({ where: `${st} → ${it.name}`, text: formatUpgradeUse(stored, it.name), stored, needsAmount: false });
    }
  }
  return lines;
}

export function lintPublicCopy(data, wiki) {
  const errors = [];
  for (const row of publicStrings(data, wiki)) {
    if (/ {2,}/.test(row.text)) errors.push(`${row.where}: double space`);
    if (/(?<!\.)\.\.(?!\.)/.test(row.text)) errors.push(`${row.where}: ".."`);
    const ids = prefabIds(row.text);
    if (ids.length) errors.push(`${row.where}: prefab id ${ids.join(", ")}`);
  }
  for (const row of upgradePublicLines(data)) {
    if (!/\(lvl \d+\+/.test(row.text)) errors.push(`${row.where}: upgrade label has no level (${row.text || "empty"})`);
    if (row.needsAmount && !/× upgrade →/.test(row.text)) errors.push(`${row.where}: upgrade label has no amount (${row.text})`);
    if (/^upgrade$/.test(String(row.stored || "").trim())) errors.push(`${row.where}: bare upgrade`);
    if (/ {2,}/.test(row.text)) errors.push(`${row.where}: double space`);
  }
  if (includeBiomeFoundIn("structure")) errors.push("structures still include a biome Found in block");
  return errors;
}

export function selfTestPublicText() {
  const eq = (got, expected, label) => {
    if (got !== expected) throw new Error(`${label}: got ${JSON.stringify(got)}`);
  };
  eq(collapseTypography("Used to make T.W.I.G.."), "Used to make T.W.I.G.", "ellipsis-like double dot");
  eq(collapseTypography("opens with  Swamp Key"), "opens with Swamp Key", "double space");
  eq(collapseTypography("only for a time..."), "only for a time...", "ellipsis kept");
  eq(
    cleanPrefabPhrases("Crypt2: in 12 of 18 rooms; Crypt3: in 12 of 18 rooms; Crypt4: in 12 of 18 rooms"),
    "in 12 of 18 rooms",
    "crypt clauses",
  );
  eq(cleanPrefabPhrases("WoodVillage1: in 8 of 10 rooms"), "in 8 of 10 rooms", "wood village");
  eq(cleanPrefabPhrases("FireHole: 3 spawners"), "3 spawners", "camel prefab");
  eq(cleanPrefabPhrases("AshlandRuins: in 6 of 15 rooms; FortressRuins: in 4 of 12 rooms"), "in 6 of 15 rooms; in 4 of 12 rooms", "ashlands clauses");
  eq(
    cleanPrefabPhrases("Dolmen01: 1 spot (10%); Dolmen02: 1 spot (20%); Dolmen03: 1 spot (30%)"),
    "1 spot (10%); 1 spot (20%); 1 spot (30%)",
    "distinct clauses",
  );
  eq(
    cleanPrefabPhrases("MorgenHole1: up to 13 spots (3 at 50%, 10 at 12.5%; 2.8 on average); MorgenHole2: up to 9 spots (3 at 50%)"),
    "up to 13 spots (3 at 50%, 10 at 12.5%; 2.8 on average); up to 9 spots (3 at 50%)",
    "semicolon inside a clause",
  );
  eq(cleanPrefabPhrases("Two steps: Galdr Table L3 → Cast: Nord Atgeir, then Frost Foundry."), "Two steps: Galdr Table L3 → Cast: Nord Atgeir, then Frost Foundry.", "station level kept");
  if (prefabIds("Black Forge L4 and Galdr Table L3").length) throw new Error("L3/L4 was treated as a prefab id");
  if (prefabIds("Spit: 40 Blunt, AoE").length) throw new Error("AoE was treated as a prefab id");
  const deer = upgradeUseLabel([
    { quality: 2, ingredients: [["Deer Hide", 1]] },
    { quality: 3, ingredients: [["Deer Hide", 2]] },
    { quality: 4, ingredients: [["Deer Hide", 4]] },
  ], "Deer Hide");
  eq(formatUpgradeUse(deer, "Crude Bow"), "1/2/4× upgrade → Crude Bow (lvl 2+)", "crude bow upgrade");
  const flat = upgradeUseLabel([
    { quality: 2, ingredients: [["Wood", 5]] },
    { quality: 4, ingredients: [["Wood", 5]] },
  ], "Wood");
  eq(formatUpgradeUse(flat, "Club"), "5× upgrade → Club (lvl 2+)", "flat upgrade amount");
  const nord = upgradeStationLabel([
    { quality: 2, station: "Black Forge", ingredients: [] },
    { quality: 4, station: "Black Forge", ingredients: [] },
  ], "Black Forge");
  eq(formatUpgradeUse(nord, "Nord Sword"), "upgrade → Nord Sword (lvl 2+, cost not recorded)", "unpriced upgrade");
  if (includeBiomeFoundIn("structure")) throw new Error("structure biome found-in should be hidden");
  if (!includeBiomeFoundIn("material")) throw new Error("materials still show biome found-in");
  const house = presentPublic("13 variants. WoodHouse2 chest can hold a Mysterious Axe Head, WoodHouse6 a Curious Axe Head (25% per roll). WoodHouse4/5 have no chest (only a 25% bee nest).");
  if (prefabIds(house).length) throw new Error(`prose rewrite left a prefab: ${house}`);
}
