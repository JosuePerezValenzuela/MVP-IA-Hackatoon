/**
 * Reglas:
 * - 0 => null (no se pinta)
 * - 1 => VERDE
 * - 2-3 => AMARILLO
 * - >=4 => ROJO
 */
export function alertLevelFromCount(count) {
  if (count <= 0) return null;
  if (count === 1) return "VERDE";
  if (count <= 3) return "AMARILLO";
  return "ROJO";
}
