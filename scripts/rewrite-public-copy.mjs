/**
 * One-shot rewrite of public strings in the dataset. Idempotent.
 * Run: node scripts/rewrite-public-copy.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { presentPublic } from "./public-text.mjs";

function plan(raw, value, bag) {
  if (typeof value !== "string" || !value) return;
  const next = presentPublic(value);
  if (next !== value) bag.set(JSON.stringify(value), JSON.stringify(next));
}

function walkStrings(raw, value, bag, where) {
  if (typeof value === "string") plan(raw, value, bag);
  else if (Array.isArray(value)) value.forEach((v) => walkStrings(raw, v, bag, where));
  else if (value && typeof value === "object") {
    for (const v of Object.values(value)) walkStrings(raw, v, bag, where);
  }
}

function collect(data, wiki) {
  const bag = new Map();
  for (const it of data.items) {
    plan(null, it.note, bag);
    for (const s of it.sources || []) {
      for (const k of ["note", "chance", "amount", "container"]) plan(null, s[k], bag);
    }
    for (const s of it.spawns || []) for (const w of s.where || []) plan(null, w, bag);
    for (const p of it.pickables || []) for (const w of p.where || []) plan(null, w, bag);
    for (const c of [...(it.chests || []), ...(it.containers || [])]) {
      for (const k of ["container", "rolls", "where"]) plan(null, c[k], bag);
      for (const w of c.placement || []) plan(null, w, bag);
    }
    for (const r of it.requirements || []) plan(null, r, bag);
    for (const v of it.vegvisir || []) plan(null, v, bag);
  }
  for (const entry of Object.values(wiki.entries || {})) {
    plan(null, entry.summary, bag);
    walkStrings(null, entry.stats, bag);
  }
  return bag;
}

function apply(path, bag) {
  let raw = readFileSync(path, "utf8");
  const pairs = [...bag.entries()].sort((a, b) => b[0].length - a[0].length);
  let applied = 0;
  const hit = new Set();
  for (const [from, to] of pairs) {
    const count = raw.split(from).length - 1;
    if (!count) continue;
    raw = raw.split(from).join(to);
    applied += count;
    hit.add(from);
  }
  writeFileSync(path, raw);
  return { applied, hit };
}

const dataPath = "src/data/data_v9.json";
const wikiPath = "src/data/wiki_info.json";
const data = JSON.parse(readFileSync(dataPath, "utf8"));
const wiki = JSON.parse(readFileSync(wikiPath, "utf8"));
const bag = collect(data, wiki);
const examples = [...bag.entries()].slice(0, 8).map(([from, to]) => `${JSON.parse(from)}\n  → ${JSON.parse(to)}`);
console.log(`${bag.size} distinct strings`);
console.log(examples.join("\n\n"));
const dataResult = apply(dataPath, bag);
const wikiResult = apply(wikiPath, bag);
const missed = [...bag.keys()].filter((from) => !dataResult.hit.has(from) && !wikiResult.hit.has(from));
if (missed.length) throw new Error(`unapplied strings:\n${missed.slice(0, 5).join("\n")}`);
console.log(`replaced ${dataResult.applied} occurrences in data, ${wikiResult.applied} in wiki`);
