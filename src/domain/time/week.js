import { formatYMD } from "./localTime";

/**
 * Semana calendario: Lunes a Domingo.
 * Retorna el inicio (lunes) y fin (domingo) como fechas a medianoche local.
 */
export function getWeekRangeMondaySunday(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // medianoche
  const day = d.getDay(); // 0=Dom, 1=Lun, ..., 6=Sáb
  const diffToMonday = (day + 6) % 7; // Dom->6, Lun->0, Mar->1...
  const monday = new Date(d);
  monday.setDate(d.getDate() - diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return { monday, sunday };
}

/**
 * Key estable de semana para agrupar: "YYYY-MM-DD_YYYY-MM-DD"
 */
export function getWeekKey(date) {
  const { monday, sunday } = getWeekRangeMondaySunday(date);
  return `${formatYMD(monday)}_${formatYMD(sunday)}`;
}
