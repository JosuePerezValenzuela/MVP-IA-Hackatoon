import { parseLocalTimestamp } from "../domain/time/localTime";

/**
 * Carga el mock desde /public/mock/toxic-events.json
 * Soporta dos formatos:
 * - Array directo: [...]
 * - Objeto con { events: [...] }
 */
export async function loadMockEvents() {
  const res = await fetch("/mock/toxic-events.json");
  if (!res.ok) throw new Error(`No se pudo cargar el mock: ${res.status}`);

  const data = await res.json();
  const events = Array.isArray(data) ? data : data.events;

  // Normalizamos y validamos mínimo
  return events.map((e) => ({
    id: e.id,
    timestamp: e.timestamp,
    ts: parseLocalTimestamp(e.timestamp), // Date local para cálculos
    lat: e.lat,
    lng: e.lng,
    harmful: Boolean(e.harmful),
    truck_id: e.truck_id,
  }));
}
