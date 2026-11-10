/**
 * Build src/data/more-info.json from valheimdb.com pages that actually exist.
 * A page is kept only when its <title> starts with the item name, so a soft
 * 200 homepage is not stored. Sitemap hits are tried first; other items are
 * checked at /items, /creatures, and /building.
 * valheim.tools answers 403 and is not used.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { slugify } from "./slug.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse((await import("node:fs")).readFileSync(join(root, "src/data/data_v9.json"), "utf8"));
const wiki = JSON.parse((await import("node:fs")).readFileSync(join(root, "src/data/wiki_info.json"), "utf8"));
const UA = "Mozilla/5.0 (compatible; ValheimProgressionBot/1.0)";
const RANK = { items: 0, creatures: 1, bosses: 2, building: 3, locations: 4 };

const sitemap = await (await fetch("https://valheimdb.com/sitemap.xml", { headers: { "user-agent": UA } })).text();
const bySlug = new Map();
for (const match of sitemap.matchAll(/https:\/\/valheimdb\.com\/(items|creatures|bosses|building|locations)\/([a-z0-9-]+)/g)) {
  const [, kind, slug] = match;
  const prev = bySlug.get(slug);
  if (!prev || RANK[kind] < RANK[prev.kind]) bySlug.set(slug, { kind, url: `https://valheimdb.com/${kind}/${slug}` });
}

const entries = wiki.entries || {};
const missing = data.items.filter((it) => !entries[it.name]?.wiki);
const links = {};
const probes = [];
for (const item of missing) {
  const slug = slugify(item.name);
  const hit = bySlug.get(slug);
  const urls = hit
    ? [hit.url]
    : [`https://valheimdb.com/items/${slug}`, `https://valheimdb.com/creatures/${slug}`, `https://valheimdb.com/building/${slug}`];
  probes.push({ name: item.name, urls });
}

async function titleStarts(url, name) {
  try {
    const res = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return false;
    const html = await res.text();
    const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] || "";
    const plain = title.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    return plain.toLowerCase().startsWith(name.toLowerCase());
  } catch {
    return false;
  }
}

let kept = 0;
for (let i = 0; i < probes.length; i += 6) {
  if (i % 30 === 0) console.log(`checking ${i}/${probes.length}`);
  const batch = probes.slice(i, i + 6);
  const answers = await Promise.all(batch.map(async (probe) => {
    for (const url of probe.urls) {
      if (await titleStarts(url, probe.name)) return { name: probe.name, url };
    }
    return null;
  }));
  for (const answer of answers) {
    if (!answer) continue;
    links[answer.name] = answer.url;
    kept += 1;
  }
}

for (const name of Object.keys(links)) {
  if (entries[name]?.wiki) delete links[name];
}
writeFileSync(join(root, "src/data/more-info.json"), `${JSON.stringify({ links }, null, 2)}\n`);
console.log(`without wiki ${missing.length}, title-verified ${kept}, still missing ${missing.length - kept}`);
