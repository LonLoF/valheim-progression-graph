import { D, GROUPS } from "./graph";

const TYPE_RANK = new Map<string, number>(GROUPS.map(([g], i) => [g, i]));

/** Boss, then miniboss, then the rest of the type order, then A–Z within a type. */
export function compareItems(a: number, b: number): number {
  const byType = (TYPE_RANK.get(D[a].t) ?? 99) - (TYPE_RANK.get(D[b].t) ?? 99);
  if (byType) return byType;
  return D[a].n.localeCompare(D[b].n, "en", { sensitivity: "base" });
}

export function sortedItems(ids: readonly number[]): number[] {
  return ids.slice().sort(compareItems);
}
