/**
 * After vite build, write dist/i/{slug}/index.html for every item.
 * Each page carries its own title and Open Graph tags, then boots the
 * full-graph app as ?item={slug}. Paths stay relative so GitHub Pages
 * project sites (/valheim-progression-graph/) keep working.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const pages = JSON.parse(readFileSync(join(root, ".cache/pages.json"), "utf8"));
const SITE = "https://lonlof.github.io/valheim-progression-graph";

function esc(value) {
  return String(value).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
}

function description(page) {
  const text = page.summary || `${page.name} on the Valheim progression map, by biome.`;
  if (text.length <= 180) return text;
  const cut = text.slice(0, 177);
  const space = cut.lastIndexOf(" ");
  return `${(space > 80 ? cut.slice(0, space) : cut).trim()}…`;
}

let html = readFileSync(join(dist, "index.html"), "utf8");
html = html.replace(/(href|src)="\.\/([^"]*)"/g, '$1="../../$2"');

const seen = new Set();
let written = 0;
for (const page of pages) {
  if (!page.slug || seen.has(page.slug)) continue;
  seen.add(page.slug);
  const title = `${page.name} · Valheim Progression`;
  const desc = description(page);
  const url = `${SITE}/i/${page.slug}/`;
  const slug = encodeURIComponent(page.slug);
  let doc = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  if (doc.includes('name="description"')) {
    doc = doc.replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(desc)}" />`);
  }
  const head = [
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<link rel="canonical" href="${url}" />`,
  ].join("\n    ");
  doc = doc.replace("</head>", `    ${head}\n  </head>`);
  const boot = `<script>history.replaceState(null,"",new URL("../../?item=${slug}",location.href).href);</script>`;
  doc = doc.replace("<body>", `<body>\n    ${boot}`);
  const dir = join(dist, "i", page.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), doc);
  written += 1;
}
console.log(`wrote ${written} item pages`);
