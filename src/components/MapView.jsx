import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

/** Colores pastel (borde un poco más fuerte, relleno suave) */
const COLORS = {
  VERDE: { stroke: "#22c55e", fill: "#bbf7d0" },     // verde pastel
  AMARILLO: { stroke: "#f59e0b", fill: "#fde68a" },  // amarillo pastel
  ROJO: { stroke: "#ef4444", fill: "#fecaca" },      // rojo pastel
};

function FitBounds({ polygons }) {
  const map = useMap();

  const bounds = useMemo(() => {
    // polygons: array de arrays [[lat,lng],...]
    const points = [];
    for (const poly of polygons) {
      for (const [lat, lng] of poly) points.push([lat, lng]);
    }
    if (!points.length) return null;
    return L.latLngBounds(points);
  }, [polygons]);

  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [bounds, map]);

  return null;
}

function Legend() {
  const item = (label, fill, stroke) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          background: fill,
          border: `2px solid ${stroke}`,
          display: "inline-block",
        }}
      />
      <span>{label}</span>
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        right: 12,
        top: 12,
        zIndex: 1000,
        background: "rgba(255,255,255,0.92)",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "10px 12px",
        fontSize: 13,
        lineHeight: 1.2,
        boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Leyenda</div>
      {item("Verde (1 evento)", COLORS.VERDE.fill, COLORS.VERDE.stroke)}
      {item("Amarillo (2–3 eventos)", COLORS.AMARILLO.fill, COLORS.AMARILLO.stroke)}
      {item("Rojo (≥4 eventos)", COLORS.ROJO.fill, COLORS.ROJO.stroke)}
      <div style={{ opacity: 0.75, marginTop: 6 }}>
        Zonas con 0 eventos no se muestran.
      </div>
    </div>
  );
}

/**
 * zones: [{ zoneId, count, level }]
 * zoneEngine: zonePolygonFromId(zoneId)
 */
export default function MapView({ zones, zoneEngine }) {
  const center = [-17.3935, -66.1568];

  const polygons = useMemo(
    () => zones.map((z) => zoneEngine.zonePolygonFromId(z.zoneId)),
    [zones, zoneEngine]
  );

  return (
    <div style={{ height: "75vh", width: "100%", position: "relative" }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Auto-encuadre solo si hay polígonos */}
        {polygons.length > 0 ? <FitBounds polygons={polygons} /> : null}

        {zones.map((z) => {
          const polygon = zoneEngine.zonePolygonFromId(z.zoneId);
          const palette = COLORS[z.level] ?? COLORS.VERDE;

          return (
            <Polygon
              key={z.zoneId}
              positions={polygon}
              pathOptions={{
                color: palette.stroke,
                fillColor: palette.fill,
                fillOpacity: 0.45,
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

      <Legend />
    </div>
  );
}