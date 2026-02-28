import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { Box, Paper, Typography, Stack } from "@mui/material";

/** Pasteles que se ven bien sobre mapa oscuro */
const COLORS = {
  VERDE: { stroke: "#22c55e", fill: "#16a34a" },
  AMARILLO: { stroke: "#a3e635", fill: "#65a30d" },
  ROJO: { stroke: "#fb7185", fill: "#e11d48" },
};

function FitBounds({ polygons }) {
  const map = useMap();

  const bounds = useMemo(() => {
    const points = [];
    for (const poly of polygons) for (const [lat, lng] of poly) points.push([lat, lng]);
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
  const Item = ({ label, fill, stroke }) => (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ width: 14, height: 14, borderRadius: 1, background: fill, border: `2px solid ${stroke}` }} />
      <Typography variant="body2">{label}</Typography>
    </Stack>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        position: "absolute",
        right: 12,
        top: 12,
        zIndex: 1000,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        px: 1.5,
        py: 1.25,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "primary.main" }}>
        Leyenda
      </Typography>

      <Stack spacing={0.75}>
        <Item label="Verde (1 evento)" fill={COLORS.VERDE.fill} stroke={COLORS.VERDE.stroke} />
        <Item label="Amarillo (2–3 eventos)" fill={COLORS.AMARILLO.fill} stroke={COLORS.AMARILLO.stroke} />
        <Item label="Rojo (≥4 eventos)" fill={COLORS.ROJO.fill} stroke={COLORS.ROJO.stroke} />
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
        Zonas con 0 eventos no se muestran.
      </Typography>
    </Paper>
  );
}

export default function MapView({ zones, zoneEngine }) {
  const center = [-17.3935, -66.1568];

  const polygons = useMemo(
    () => zones.map((z) => zoneEngine.zonePolygonFromId(z.zoneId)),
    [zones, zoneEngine]
  );

  return (
    <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
      <Box sx={{ height: "75vh", width: "100%", position: "relative" }}>
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            // Mapa base oscuro (CARTO)
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

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
                  fillOpacity: 0.22, // pastel sobre mapa oscuro
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
      </Box>
    </Paper>
  );
}