import { ALTS, D, LANES, PRIMARY, type CraftRecipe, ok } from "./graph";
import { bestSourceLabel } from "./farm";

export type PlanStep = {
  index: number;
  output: number;
  station: number;
  level: number;
  lane: number;
};

export type PlanRaw = {
  index: number;
  qty: number;
  lane: number;
  best: string;
};

export type PlanGroup = {
  lane: number;
  station: number;
  level: number;
  title: string;
  steps: PlanStep[];
};

export type Plan = {
  root: number;
  qty: number;
  alt: boolean;
  groups: PlanGroup[];
  rawGroups: { lane: number; raws: PlanRaw[] }[];
};

export type PlanPin = { index: number; qty: number };

export type CombinedPlan = {
  pins: PlanPin[];
  alt: boolean;
  groups: PlanGroup[];
  rawGroups: { lane: number; raws: PlanRaw[] }[];
};

function recipeFor(index: number, alt: boolean): CraftRecipe | null {
  if (alt && ALTS[index]?.length) return ALTS[index][0];
  return PRIMARY[index];
}

function explode(roots: readonly PlanPin[], alt: boolean): { steps: PlanStep[]; raws: PlanRaw[] } {
  const nodes = new Map<number, { qty: number; expanded: number }>();
  const stack = new Set<number>();

  const bump = (index: number, need: number) => {
    if (!ok(index) || need <= 0) return;
    let node = nodes.get(index);
    if (!node) nodes.set(index, node = { qty: 0, expanded: 0 });
    node.qty += need;
    const recipe = recipeFor(index, alt);
    const ingredients = recipe?.ingredients || [];
    if (!recipe || !ingredients.length || stack.has(index)) return;
    const yields = Math.max(1, recipe.yields || 1);
    if (node.qty <= node.expanded) return;
    stack.add(index);
    const extra = node.qty - node.expanded;
    const crafts = Math.ceil(extra / yields);
    node.expanded += crafts * yields;
    ingredients.forEach(([ingredient, each]) => bump(ingredient, crafts * each));
    stack.delete(index);
  };

  roots.forEach((pin) => bump(pin.index, pin.qty));

  const steps: PlanStep[] = [];
  const raws: PlanRaw[] = [];
  nodes.forEach((node, index) => {
    const recipe = recipeFor(index, alt);
    if (node.expanded > 0 && recipe) {
      steps.push({
        index,
        output: node.expanded,
        station: recipe.station,
        level: recipe.level || 1,
        lane: D[index].l,
      });
    } else {
      raws.push({
        index,
        qty: node.qty,
        lane: D[index].l,
        best: bestSourceLabel(index),
      });
    }
  });

  steps.sort((a, b) => a.lane - b.lane || a.level - b.level || D[a.index].n.localeCompare(D[b.index].n, "en"));
  raws.sort((a, b) => a.lane - b.lane || D[a.index].n.localeCompare(D[b.index].n, "en"));
  return { steps, raws };
}

function groupParts(steps: PlanStep[], raws: PlanRaw[]): { groups: PlanGroup[]; rawGroups: CombinedPlan["rawGroups"] } {
  const groups: PlanGroup[] = [];
  steps.forEach((step) => {
    const stationName = step.station >= 0 && ok(step.station) ? D[step.station].n : "By hand";
    const title = `${LANES[step.lane]} · ${stationName}${step.level > 1 ? ` lvl ${step.level}` : ""}`;
    const last = groups[groups.length - 1];
    if (last && last.title === title) last.steps.push(step);
    else groups.push({ lane: step.lane, station: step.station, level: step.level, title, steps: [step] });
  });

  const rawGroups: Plan["rawGroups"] = [];
  raws.forEach((raw) => {
    const last = rawGroups[rawGroups.length - 1];
    if (last && last.lane === raw.lane) last.raws.push(raw);
    else rawGroups.push({ lane: raw.lane, raws: [raw] });
  });

  return { groups, rawGroups };
}

export function buildPlan(root: number, qty: number, alt: boolean): Plan {
  const count = Math.max(1, Math.floor(qty) || 1);
  const exploded = explode([{ index: root, qty: count }], alt);
  return { root, qty: count, alt, ...groupParts(exploded.steps, exploded.raws) };
}

export function buildCombinedPlan(pins: readonly PlanPin[], alt: boolean): CombinedPlan {
  const exploded = explode(pins, alt);
  return { pins: pins.map((pin) => ({ index: pin.index, qty: pin.qty })), alt, ...groupParts(exploded.steps, exploded.raws) };
}

export function combinedToText(plan: CombinedPlan): string {
  const lines = ["Plan"];
  plan.pins.forEach((pin) => lines.push(`${D[pin.index].n} × ${pin.qty}`));
  lines.push("");
  if (!plan.groups.length) lines.push("Nothing to craft. These are gathered or dropped.");
  plan.groups.forEach((group) => {
    lines.push(group.title);
    group.steps.forEach((step) => lines.push(`  ${D[step.index].n} × ${step.output}`));
    lines.push("");
  });
  if (plan.rawGroups.length) {
    lines.push("Raw materials");
    plan.rawGroups.forEach((group) => {
      lines.push(LANES[group.lane]);
      group.raws.forEach((raw) => lines.push(`  ${D[raw.index].n} × ${raw.qty} — ${raw.best}`));
    });
  }
  return lines.join("\n").trim();
}

export function combinedToDiscord(plan: CombinedPlan): string {
  const lines = ["**Valheim plan**"];
  plan.pins.forEach((pin) => lines.push(`**${D[pin.index].n}** × ${pin.qty}`));
  if (plan.groups.length) {
    lines.push("", "**Craft**");
    plan.groups.forEach((group) => {
      lines.push(group.title);
      group.steps.forEach((step) => lines.push(`• ${D[step.index].n} × ${step.output}`));
    });
  }
  if (plan.rawGroups.length) {
    lines.push("", "**Raw**");
    plan.rawGroups.forEach((group) => {
      lines.push(LANES[group.lane]);
      group.raws.forEach((raw) => lines.push(`• ${D[raw.index].n} × ${raw.qty}`));
    });
  }
  return lines.join("\n").trim();
}

export function planToText(plan: Plan): string {
  const lines = [`${D[plan.root].n} × ${plan.qty}${plan.alt ? " (alt recipe)" : ""}`, ""];
  if (!plan.groups.length) lines.push("Nothing to craft. The item is gathered or dropped.");
  plan.groups.forEach((group) => {
    lines.push(group.title);
    group.steps.forEach((step) => lines.push(`  ${D[step.index].n} × ${step.output}`));
    lines.push("");
  });
  if (plan.rawGroups.length) {
    lines.push("Raw materials");
    plan.rawGroups.forEach((group) => {
      lines.push(LANES[group.lane]);
      group.raws.forEach((raw) => lines.push(`  ${D[raw.index].n} × ${raw.qty} — ${raw.best}`));
    });
  }
  return lines.join("\n").trim();
}

export function hasAltRecipe(index: number): boolean {
  return ok(index) && ALTS[index].length > 0;
}
