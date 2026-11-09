/**
 * Build-time check: a summary that names a biome tier other than the lane
 * the item is shown in (data_v9) must use the "normally {tier}-tier" phrasing.
 * Also rejects public notes that still read like an internal log.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

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

export function publicCopyErrors() {
  selfTest();
  const { data, wiki } = load();
  return [...checkSummaryTiers(data, wiki), ...checkPublicNotes(data)];
}

function main() {
  const errors = publicCopyErrors();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log("summary tiers and public notes ok");
}

const invoked = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invoked) main();
