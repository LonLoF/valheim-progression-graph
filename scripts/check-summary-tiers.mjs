/**
 * Build-time check: a summary that names a biome tier other than the lane
 * the item is shown in (data_v9) must use the "normally {tier}-tier" phrasing.
 * Also rejects public notes that still read like an internal log.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { lintPublicCopy, selfTestPublicText } from "./public-text.mjs";

// Vite bundles this file into a temporary config, so import.meta.url is not
// the script path. npm and `vite build` both run with the repo as cwd.
const root = process.cwd();

export const LANES = [
  "Meadows",
  "Black Forest",
  "Swamp",
  "Mountain",
  "Plains",
  "Mistlands",
  "Ashlands",
  "Deep North",
  "Ocean",
];

const laneAlt = LANES.join("|");

/** Tiers named in a summary that differ from the lane the item is shown in and lack "normally {tier}-tier". */
export function mismatchedTiers(summary, lane) {
  const text = String(summary || "");
  const tierRe = new RegExp(`\\b(${laneAlt})-tier\\b`, "g");
  const ofTheRe = new RegExp(`\\b(?:creature|boss|miniboss) of the (${laneAlt})\\b`, "g");
  const mentioned = new Set();
  for (const m of text.matchAll(tierRe)) mentioned.add(m[1]);
  for (const m of text.matchAll(ofTheRe)) mentioned.add(m[1]);
  const bad = [];
  for (const tier of mentioned) {
    if (tier === lane) continue;
    if (!text.includes(`normally ${tier}-tier`)) bad.push(tier);
  }
  return bad;
}

const NOTE_RULES = [
  { re: /^v\d+ owner decision/, label: "starts with a versioned owner decision" },
  { re: /\.csv/i, label: "mentions a .csv file" },
  { re: /\bturn \d+\b/i, label: "mentions turn N" },
  { re: /by the user/i, label: "says \"by the user\"" },
];

function load() {
  const data = JSON.parse(readFileSync(join(root, "src/data/data_v9.json"), "utf8"));
  const wiki = JSON.parse(readFileSync(join(root, "src/data/wiki_info.json"), "utf8"));
  return { data, wiki };
}

export function checkSummaryTiers(data, wiki) {
  const laneOf = new Map(data.items.map((it) => [it.name, it.lane]));
  const errors = [];
  for (const [name, entry] of Object.entries(wiki.entries)) {
    const lane = laneOf.get(name);
    if (!lane) continue;
    const summary = entry.summary || "";
    for (const tier of mismatchedTiers(summary, lane)) {
      errors.push(
        `${name}: summary names ${tier}, but the item is shown in ${lane}. Phrase it as "normally ${tier}-tier".`,
      );
    }
  }
  return errors;
}

/** Item notes, plus source notes that the views render (no structure attached). */
export function checkPublicNotes(data) {
  const errors = [];
  const consider = (name, where, note) => {
    if (!note) return;
    for (const rule of NOTE_RULES) {
      if (rule.re.test(note)) errors.push(`${name} ${where}: ${rule.label}.`);
    }
  };
  for (const it of data.items) {
    consider(it.name, "note", it.note || "");
    for (const s of it.sources || []) {
      if (s.note && !s.found_in_structure) consider(it.name, "source note", s.note);
    }
  }
  return errors;
}

function selfTest() {
  const cases = [
    ["Draugr is a creature of the Swamp.", "Meadows", ["Swamp"]],
    ["Draugr is reachable in Meadows (normally Swamp-tier).", "Meadows", []],
    ["Boar is a creature of the Meadows.", "Meadows", []],
    ["Bronze Battle Idol is a Black Forest-tier material.", "Meadows", ["Black Forest"]],
    ["Bronze Battle Idol is reachable in Meadows (normally Black Forest-tier).", "Meadows", []],
    ["Eikthyr is a boss of the Meadows.", "Meadows", []],
  ];
  for (const [summary, lane, expected] of cases) {
    const got = mismatchedTiers(summary, lane);
    if (got.join("|") !== expected.join("|")) {
      throw new Error(`detector self-test failed for "${summary}": got ${got.join(", ") || "(none)"}`);
    }
  }
}

const FONT_FILES = [
  "src/site.css",
  "src/views/CompactView.tsx",
  "src/views/FullView.tsx",
  "src/details.tsx",
  "src/grok-canvas.tsx",
  "index.html",
  "compact/index.html",
];

/** Google Fonts must stay out, and the upgrade / structure copy has to stay wired up. */
export function checkWiring() {
  const errors = [];
  const read = (p) => readFileSync(join(root, p), "utf8");
  for (const p of FONT_FILES) {
    if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(read(p))) errors.push(`${p}: Google Fonts reference`);
  }
  for (const p of ["index.html", "compact/index.html"]) {
    const html = read(p);
    if (!html.includes('rel="preload"') || !html.includes('as="font"') || !html.includes("crossorigin")) {
      errors.push(`${p}: missing font preload`);
    }
    if (!html.includes("fonts/fonts.css")) errors.push(`${p}: fonts.css is not linked`);
  }
  const fonts = read("public/assets/fonts/fonts.css");
  if (!/font-display:\s*swap/.test(fonts)) errors.push("fonts.css: font-display: swap missing");
  if (!/size-adjust:/.test(fonts) || !/ascent-override:/.test(fonts)) errors.push("fonts.css: fallback metric overrides missing");
  const graph = read("src/graph.ts");
  if (!graph.includes("includeBiomeFoundIn")) errors.push("graph.ts does not hide the biome Found in block for structures");
  if (!graph.includes("upgradeUseLabel")) errors.push("graph.ts does not give upgrade uses an amount and level");
  for (const p of ["src/views/CompactView.tsx", "src/views/FullView.tsx"]) {
    if (!read(p).includes("splitUpgradeLabel")) errors.push(`${p}: upgrade chips are not split into amount and level`);
  }
  return errors;
}

export function publicCopyErrors() {
  selfTest();
  selfTestPublicText();
  const { data, wiki } = load();
  return [...checkSummaryTiers(data, wiki), ...checkPublicNotes(data), ...lintPublicCopy(data, wiki), ...checkWiring()];
}

function main() {
  const errors = publicCopyErrors();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log("summary tiers, public notes, text patterns and font wiring ok");
}

const invoked = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invoked) main();
