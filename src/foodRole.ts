export type FoodRole = "Eitr" | "Health" | "Stamina" | "Balanced";

function plainNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** True when a regen string is a buff, false when it is a penalty, null when absent. */
function regenSign(v: unknown): boolean | null {
  if (v == null || v === "") return null;
  const s = String(v);
  const negative = /^\s*[-−]/.test(s) || /-\d/.test(s);
  const positive = s.includes("+");
  if (positive && !negative) return true;
  if (negative && !positive) return false;
  if (positive && negative) return false;
  return null;
}

/**
 * Health, stamina, eitr, or balanced, from wiki stat fields.
 * Raw fish and utility meads with none of those stats stay unclassified.
 */
export function classifyFood(type: string, stats: Record<string, unknown> | undefined): FoodRole | null {
  if (type !== "food" && type !== "mead" && type !== "fish") return null;
  const s = stats || {};
  if (s.eitr != null || s.eitr_regen != null || s.eitr_cost != null) return "Eitr";

  const health = plainNumber(s.health);
  const stamina = plainNumber(s.stamina);
  if (health != null || stamina != null) {
    if (health == null || health <= 0) return stamina != null && stamina > 0 ? "Stamina" : null;
    if (stamina == null || stamina <= 0) return "Health";
    const ratio = Math.min(health, stamina) / Math.max(health, stamina);
    if (ratio >= 0.75) return "Balanced";
    return health > stamina ? "Health" : "Stamina";
  }

  const healthUp = regenSign(s.health_regen) ?? regenSign(typeof s.health === "string" ? s.health : null);
  const staminaUp = regenSign(s.stamina_regen) ?? regenSign(typeof s.stamina === "string" ? s.stamina : null);
  if (healthUp && staminaUp) return "Balanced";
  if (healthUp) return "Health";
  if (staminaUp) return "Stamina";
  return null;
}
