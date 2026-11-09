/** Midpoint of an amount such as "1", "1–10", "10-30", or "4–7 / 1–2". */
export function amountMid(amount: string | undefined): number {
  if (!amount || amount === "?") return 1;
  const first = amount.split("/")[0];
  const nums = [...first.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
  if (!nums.length) return 1;
  if (nums.length === 1) return nums[0];
  return (nums[0] + nums[1]) / 2;
}

function clauseExpected(clause: string, amt: number): number {
  const at = [...clause.matchAll(/(\d+(?:\.\d+)?)\s+at\s+([\d.]+)\s*%/g)];
  const always = [...clause.matchAll(/(\d+(?:\.\d+)?)\s+always/g)].reduce((sum, m) => sum + Number(m[1]), 0);
  if (at.length || always) {
    const spots = at.reduce((sum, m) => sum + Number(m[1]) * (Number(m[2]) / 100), 0);
    return (spots + always) * amt;
  }
  const rooms = clause.match(/in\s+(\d+)\s+of\s+(\d+)/i);
  const spots = clause.match(/(\d+(?:\.\d+)?)\s+spots?/i);
  const pcts = [...clause.matchAll(/([\d.]+)\s*%/g)].map((m) => Number(m[1]) / 100);
  if (spots && pcts.length) return Number(spots[1]) * pcts[0] * amt;
  if (rooms && !pcts.length) return (Number(rooms[1]) / Number(rooms[2])) * amt;
  if (pcts.length) return pcts[0] * amt;
  if (spots) return Number(spots[1]) * amt;
  if (/100\s*%|\balways\b/i.test(clause)) return amt;
  return 0;
}

/**
 * Expected number of items from a chest, drop, or pickable line.
 * "3.5 on average" is the spot count already, so the detail beside it is not added again.
 */
export function expectedCount(chance: string | undefined, amount: string | undefined): number {
  const amt = amountMid(amount);
  const text = (chance || "").trim();
  if (!text || text === "?") return 0.2 * amt;
  const avgs = [...text.matchAll(/([\d.]+)\s+on average/g)].map((m) => Number(m[1]));
  if (avgs.length) return avgs.reduce((sum, n) => sum + n, 0) * amt;
  let total = 0;
  for (const clause of text.split(";")) total += clauseExpected(clause.trim(), amt);
  return total;
}

/** Creature drop chance is a percent ("50" or "50%") and amount is a count. */
export function dropExpected(chance: string | undefined, amount: string | undefined): number {
  const amt = amountMid(amount);
  const text = (chance || "100").trim();
  if (text.includes("%") || text.includes("average") || text.includes("spot")) return expectedCount(text, amount);
  const n = Number(text);
  if (Number.isFinite(n)) {
    if (n <= 0) return 0;
    if (n <= 100) return (n / 100) * amt;
    return n * amt;
  }
  return expectedCount(text, amount);
}

export function formatYield(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n >= 10) return String(Math.round(n));
  const rounded = Math.round(n * 10) / 10;
  return String(rounded);
}
