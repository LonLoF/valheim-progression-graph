/**
 * Ask the Valheim wiki which titles exist.
 * Default is a report only. --write records item names that now have their
 * own page in src/data/wiki-found.json. The scheduled workflow must not pass
 * --write and must not commit.
 *
 * A recorded link is broken only when the page in that URL is missing.
 * Group pages and section links stay valid. A title is "new" when the item
 * name itself resolves to a page and the dataset does not already point at it.
 */
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const write = process.argv.includes("--write");
const data = JSON.parse(readFileSync(join(root, "src/data/data_v9.json"), "utf8"));
const wiki = JSON.parse(readFileSync(join(root, "src/data/wiki_info.json"), "utf8"));
const foundPath = join(root, "src/data/wiki-found.json");
let stored = {};
try { stored = JSON.parse(readFileSync(foundPath, "utf8")).titles || {}; } catch { stored = {}; }

const API = "https://valheim.fandom.com/api.php";

function titleFromUrl(url) {
  try {
    const path = new URL(url).pathname;
    const slug = path.split("/wiki/")[1];
    if (!slug) return "";
    return decodeURIComponent(slug).replace(/_/g, " ");
  } catch {
    return "";
  }
}

function wikiUrl(title) {
  return `https://valheim.fandom.com/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
}

async function query(titles) {
  const url = `${API}?${new URLSearchParams({
    action: "query",
    titles: titles.join("|"),
    format: "json",
    redirects: "1",
  })}`;
  const res = await fetch(url, { headers: { "user-agent": "ValheimProgressionBot/1.0" } });
  if (!res.ok) throw new Error(`wiki API ${res.status}`);
  const body = await res.json();
  const normalized = new Map((body.query?.normalized || []).map((row) => [row.from, row.to]));
  const redirects = new Map((body.query?.redirects || []).map((row) => [row.from, row.to]));
  const pages = new Map();
  for (const page of Object.values(body.query?.pages || {})) pages.set(page.title, page);
  const resolved = new Map();
  for (const title of titles) {
    let current = normalized.get(title) || title;
    const seen = new Set();
    while (redirects.has(current) && !seen.has(current)) {
      seen.add(current);
      current = redirects.get(current);
    }
    const page = pages.get(current);
    resolved.set(title, page && page.missing === undefined && page.pageid ? page : null);
  }
  return resolved;
}

const names = [...new Set(data.items.map((it) => it.name))];
const recorded = new Map(names.map((name) => [name, wiki.entries?.[name]?.wiki || ""]));
const recordedTitles = [...recorded.values()].map(titleFromUrl).filter(Boolean);
const wanted = [...new Set([...names, ...recordedTitles])];
const foundPages = new Map();
for (let i = 0; i < wanted.length; i += 40) {
  const batch = wanted.slice(i, i + 40);
  const resolved = await query(batch);
  for (const [title, page] of resolved) foundPages.set(title, page);
}

const broken = [];
const direct = [];
for (const name of names) {
  const url = recorded.get(name) || "";
  const target = titleFromUrl(url);
  if (url && target && !foundPages.get(target)) broken.push(`${name} → ${url}`);
  const own = foundPages.get(name);
  if (!own) continue;
  const current = target ? foundPages.get(target) : null;
  if (!current || current.pageid !== own.pageid) direct.push(name);
}

const lines = [
  `Checked ${names.length} item titles and ${new Set(recordedTitles).size} recorded wiki URLs.`,
  `Item names that are themselves a wiki page: ${names.filter((name) => foundPages.get(name)).length}.`,
  `Recorded links whose page is missing: ${broken.length}.`,
  `Items whose own page is not the page the dataset links: ${direct.length}.`,
];
if (broken.length) lines.push("", "Broken recorded links:", ...broken.slice(0, 40).map((line) => `- ${line}`));
if (direct.length) lines.push("", "Own page available:", ...direct.slice(0, 40).map((name) => `- ${name}`));
const report = lines.join("\n");
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`);

if (write) {
  const titles = { ...stored };
  for (const name of direct) titles[name] = wikiUrl(foundPages.get(name).title);
  writeFileSync(foundPath, `${JSON.stringify({ titles }, null, 2)}\n`);
  console.log(`wrote ${foundPath}`);
}
