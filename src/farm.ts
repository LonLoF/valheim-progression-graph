import { D, DROPPERS, FINDS, LANES, STRUCTS, b, ok } from "./graph";
import { dropExpected, expectedCount, formatYield } from "./yield";

export type FarmSource = {
  label: string;
  lane: number;
  gate: string;
  expected: number;
  kind: "gather" | "drop" | "chest" | "pickable" | "container" | "mined" | "other";
  index: number;
};

function gateOf(structure: number): string {
  if (!ok(structure)) return "no gate";
  const reqs = (STRUCTS[structure]?.requirements || []).filter((line) => line && !/^none\b/i.test(line));
  if (!reqs.length) return "no gate";
  return reqs[0].replace(/\s*\(valheimdb\)/ig, "").replace(/\s+/g, " ").trim();
}

function kindOf(via: string): FarmSource["kind"] {
  if (via === "chest") return "chest";
  if (via === "pickable") return "pickable";
  if (via === "container") return "container";
  if (via === "mined") return "mined";
  return "other";
}

export function farmSources(index: number): FarmSource[] {
  if (!ok(index)) return [];
  const sources: FarmSource[] = [];
  D[index].src.forEach((token) => {
    if (token[0] !== "g") return;
    const body = token.slice(1);
    const at = body.indexOf("@");
    const names = (at >= 0 ? body.slice(0, at) : body).split(",").map((s) => s.trim()).filter(Boolean);
    const tool = at >= 0 ? b(body.slice(at + 1)) : -1;
    sources.push({
      label: names.length ? `Gather ${names.slice(0, 3).join(", ")}` : "Gather in the world",
      lane: D[index].l,
      gate: ok(tool) ? D[tool].n : "no gate",
      expected: ok(tool) ? 800 : 1000,
      kind: "gather",
      index: ok(tool) ? tool : -1,
    });
  });

  DROPPERS[index].forEach(([creature, chance, amount]) => {
    if (!ok(creature)) return;
    const expected = dropExpected(chance, amount);
    sources.push({
      label: `Drop from ${D[creature].n}`,
      lane: D[creature].l,
      gate: "no gate",
      expected,
      kind: "drop",
      index: creature,
    });
  });

  FINDS[index].forEach((find) => {
    if (find.via === "spawn") return;
    const structure = find.index;
    const lane = ok(structure) ? D[structure].l : D[index].l;
    const where = find.structure || "the world";
    const via = find.via || "found";
    const container = find.container ? ` · ${find.container}` : "";
    sources.push({
      label: `${where}${container} (${via})`,
      lane,
      gate: gateOf(structure),
      expected: expectedCount(find.chance, find.amount),
      kind: kindOf(via),
      index: ok(structure) ? structure : -1,
    });
  });

  sources.sort((a, b) => b.expected - a.expected || a.lane - b.lane || a.label.localeCompare(b.label, "en"));
  return sources;
}

export function earliestLane(sources: readonly FarmSource[]): number | null {
  if (!sources.length) return null;
  return sources.reduce((min, source) => Math.min(min, source.lane), sources[0].lane);
}

export function sourceDetail(source: FarmSource): string {
  const lane = LANES[source.lane] || "";
  if (source.kind === "gather") return `${lane} · ${source.gate}`;
  return `${lane} · ${source.gate} · ~${formatYield(source.expected)}`;
}

export function bestSourceLabel(index: number): string {
  const top = farmSources(index)[0];
  if (!top) return "no listed source";
  return `${top.label} (${sourceDetail(top)})`;
}
