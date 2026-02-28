import { useEffect, useMemo, useState } from "react";
import { loadMockEvents } from "./services/loadMockEvents";
import { createGeohashHexEngine } from "./domain/zones/geohashHexEngine";
import { aggregateToxicCountsByWeekAndZone, toZoneSummaries } from "./domain/aggregate";

export default function App() {
  const zoneEngine = useMemo(() => createGeohashHexEngine({ precision: 6 }), []);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMockEvents()
      .then(setEvents)
      .catch((e) => setError(e.message));
  }, []);

  const agg = useMemo(() => {
    if (!events.length) return null;
    return aggregateToxicCountsByWeekAndZone(events, zoneEngine);
  }, [events, zoneEngine]);

  if (error) return <pre>Error: {error}</pre>;
  if (!agg) return <div>Cargando mock…</div>;

  const weeks = Array.from(agg.keys()).sort();

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h2>MVP — Resumen por semana (harmful=true)</h2>
      <p>Motor de zonas: {zoneEngine.name} (precision {zoneEngine.precision})</p>

      {weeks.map((weekKey) => {
        const weekMap = agg.get(weekKey);
        const rows = toZoneSummaries(weekKey, weekMap);

        return (
          <div key={weekKey} style={{ marginTop: 16 }}>
            <h3>Semana: {weekKey}</h3>
            {rows.length === 0 ? (
              <div>(Sin zonas con toxicidad — no se pinta nada)</div>
            ) : (
              <ul>
                {rows.map((r) => (
                  <li key={r.zoneId}>
                    {r.level} — zoneId: <code>{r.zoneId}</code> — eventos: {r.count}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}