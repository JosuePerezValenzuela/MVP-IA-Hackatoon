import { getWeekKey } from "./time/week";
import { alertLevelFromCount } from "./alerts/alertLevel";

/**
 * Agrupa eventos tóxicos por (weekKey, zoneId).
 * zoneEngine debe tener: zoneIdFromPoint(lat,lng)
 */
export function aggregateToxicCountsByWeekAndZone(events, zoneEngine) {
  const acc = new Map(); // weekKey -> Map(zoneId -> count)

  for (const e of events) {
    if (!e.harmful) continue;

    const weekKey = getWeekKey(e.ts);
    const zoneId = zoneEngine.zoneIdFromPoint(e.lat, e.lng);

    if (!acc.has(weekKey)) acc.set(weekKey, new Map());
    const zoneMap = acc.get(weekKey);

    zoneMap.set(zoneId, (zoneMap.get(zoneId) ?? 0) + 1);
  }

  return acc;
}

/**
 * Convierte la agregación a un arreglo útil para UI.
 * Devuelve solo zonas con count>0 (porque 0 NO se pinta).
 */
export function toZoneSummaries(weekKey, weekMap) {
  const out = [];
  for (const [zoneId, count] of weekMap.entries()) {
    const level = alertLevelFromCount(count);
    if (!level) continue;
    out.push({ zoneId, count, level, weekKey });
  }
  // orden: más grave primero, luego por count
  const severityRank = { ROJO: 3, AMARILLO: 2, VERDE: 1 };
  out.sort(
    (a, b) =>
      severityRank[b.level] - severityRank[a.level] || b.count - a.count,
  );
  return out;
}
