/**
 * Sum the gzip size of the JS the full-graph page loads plus the initial
 * data index. Lane files are on demand and are not counted.
 *
 * Before this split (build of ed861a8) the shared data chunk alone was
 * 268.8 KB gzip, about 278 KB with the entry script.
 */
import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const html = readFileSync(join(dist, "index.html"), "utf8");

function gzipLen(path) {
  return gzipSync(readFileSync(path)).length;
}

const seen = new Set();
const rows = [];
function walkJs(path) {
  if (seen.has(path)) return;
  seen.add(path);
  const text = readFileSync(path, "utf8");
  rows.push([path.slice(dist.length + 1), gzipLen(path)]);
  for (const match of text.matchAll(/["'](\.\/[^"']+\.js)["']/g)) {
    walkJs(join(dirname(path), match[1]));
  }
}
const entry = html.match(/src="\.\/([^"]+\.js)"/);
if (!entry) throw new Error("dist/index.html has no entry script");
walkJs(join(dist, entry[1]));
let js = rows.reduce((sum, row) => sum + row[1], 0);
let css = 0;
for (const match of html.matchAll(/href="\.\/([^"]+\.css)"/g)) {
  const size = gzipLen(join(dist, match[1]));
  css += size;
  rows.push([match[1], size]);
}
const indexPath = join(dist, "data/index.json");
const indexGz = gzipLen(indexPath);
const total = js + indexGz;
const kb = (n) => (n / 1024).toFixed(1);
console.log("Initial full-graph payload (gzip):");
for (const [ref, size] of rows) console.log(`  ${kb(size).padStart(6)} KB  ${ref}`);
console.log(`  ${kb(indexGz).padStart(6)} KB  data/index.json`);
console.log(`  ${kb(total).padStart(6)} KB  JS + index`);
console.log(`  ${kb(css).padStart(6)} KB  CSS (not in the JS+data budget)`);
const limit = 100 * 1024;
if (total > limit) {
  console.error(`Initial JS+data gzip ${kb(total)} KB exceeds 100 KB`);
  process.exit(1);
}
console.log("Initial JS+data gzip is under 100 KB.");

const laneDir = join(dist, "data");
let lanes = 0;
for (const name of readdirSync(laneDir)) {
  if (/^lane-\d+\.json$/.test(name)) lanes += statSync(join(laneDir, name)).size;
}
console.log(`Lane detail files (raw, on demand): ${kb(lanes)} KB`);
