import { useEffect, useMemo, useState } from "react";
import TopNav from "../ui/TopNav";
import { loadMockEvents } from "../services/loadMockEvents";
import { createGeohashHexEngine } from "../domain/zones/geohashHexEngine";
import { aggregateToxicCountsByWeekAndZone, toZoneSummaries } from "../domain/aggregate";

export default function ReportsPage() {
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

  const weeks = useMemo(() => (agg ? Array.from(agg.keys()).sort() : []), [agg]);

  if (error) return <pre>Error: {error}</pre>;
  if (!agg) return <div style={{ padding: 16 }}>Cargando mock…</div>;

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <TopNav />

      <h2>Informes (placeholder, sin IA aún)</h2>
      <p style={{ opacity: 0.8 }}>
        Aquí luego mostraremos el Markdown del agente. Por ahora, un resumen calculado localmente.
      </p>

      {weeks.map((weekKey) => {
        const weekMap = agg.get(weekKey);
        const rows = toZoneSummaries(weekKey, weekMap);
        const totalToxic = rows.reduce((acc, r) => acc + r.count, 0);

        return (
          <div key={weekKey} style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600 }}>Semana: {weekKey}</div>
                <div style={{ opacity: 0.8 }}>Zonas con alerta: {rows.length}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600 }}>Eventos tóxicos</div>
                <div>{totalToxic}</div>
              </div>
            </div>

            {rows.length === 0 ? (
              <div style={{ marginTop: 8 }}>(Sin alertas)</div>
            ) : (
              <ul style={{ marginTop: 8 }}>
                {rows.map((r) => (
                  <li key={r.zoneId}>
                    {r.level} — <code>{r.zoneId}</code> — eventos: {r.count}
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