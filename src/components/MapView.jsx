import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polygon, Tooltip } from "react-leaflet";

/**
 * Renderiza hexágonos (polígonos) por zona.
 * zones: [{ zoneId, count, level }]
 * zoneEngine: debe exponer zonePolygonFromId(zoneId) y zoneCenterFromId(zoneId)
 */
export default function MapView({ zones, zoneEngine }) {
  // Centro aproximado de Cochabamba Cercado
  const center = [-17.3935, -66.1568];

  const fillByLevel = (level) => {
    // No especifico colores “raros”; solo semáforo claro
    if (level === "ROJO") return "#ef4444";
    if (level === "AMARILLO") return "#f59e0b";
    return "#22c55e"; // VERDE
  };

  return (
    <div style={{ height: "75vh", width: "100%" }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {zones.map((z) => {
          const polygon = zoneEngine.zonePolygonFromId(z.zoneId); // [[lat,lng],...]
          const fillColor = fillByLevel(z.level);

          return (
            <Polygon
              key={z.zoneId}
              positions={polygon}
              pathOptions={{
                color: fillColor,
                fillColor,
                fillOpacity: 0.35,
                weight: 2,
              }}
            >
              <Tooltip sticky>
                <div>
                  <div><b>{z.level}</b></div>
                  <div>zoneId: {z.zoneId}</div>
                  <div>eventos: {z.count}</div>
                </div>
              </Tooltip>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
}