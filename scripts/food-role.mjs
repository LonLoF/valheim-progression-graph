/** Keep in step with src/foodRole.ts. Used only while emitting the index. */
function plainNumber(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function regenSign(v) {
  if (v == null || v === "") return null;
  const s = String(v);
  const negative = /^\s*[-−]/.test(s) || /-\d/.test(s);
  const positive = s.includes("+");
  if (positive && !negative) return true;
  if (negative && !positive) return false;
  return null;
}

export function classifyFood(type, stats) {
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
