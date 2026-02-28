import { useEffect, useMemo, useState } from "react";
import { loadMockEvents } from "../services/loadMockEvents";
import { createGeohashHexEngine } from "../domain/zones/geohashHexEngine";
import { aggregateToxicCountsByWeekAndZone, toZoneSummaries } from "../domain/aggregate";
import MapView from "../components/MapView";
import TopNav from "../ui/TopNav";

export default function MapPage() {
  const zoneEngine = useMemo(() => createGeohashHexEngine({ precision: 6 }), []);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState("");

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
  const activeWeek = selectedWeek || (weeks.length ? weeks[0] : "");

  const zonesForSelectedWeek = useMemo(() => {
    if (!agg || !activeWeek) return [];
    const weekMap = agg.get(activeWeek);
    if (!weekMap) return [];
    return toZoneSummaries(activeWeek, weekMap);
  }, [agg, activeWeek]);

  if (error) return <pre>Error: {error}</pre>;
  if (!agg) return <div style={{ padding: 16 }}>Cargando mock…</div>;

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <TopNav />

      <h2>Mapa de alertas (harmful=true)</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <label>Semana:</label>
        <select
          value={activeWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          disabled={!weeks.length}
        >
          {weeks.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>

        <div style={{ opacity: 0.8 }}>Zonas con alerta: {zonesForSelectedWeek.length}</div>
      </div>

      <MapView zones={zonesForSelectedWeek} zoneEngine={zoneEngine} />
    </div>
  );
}