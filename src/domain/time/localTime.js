/**
 * Parse robusto para timestamps "YYYY-MM-DDTHH:mm:ss" (sin offset).
 * Evita ambigüedades de Date.parse en algunos entornos.
 */
export function parseLocalTimestamp(ts) {
  const [datePart, timePart] = ts.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm, ss] = timePart.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, ss);
}

export function formatYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
