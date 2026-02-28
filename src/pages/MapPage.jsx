import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Stack,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import TopNav from "../ui/TopNav";
import MapView from "../components/MapView";
import WeekKpis from "../components/WeekKpis";

import { loadMockEvents } from "../services/loadMockEvents";
import { createGeohashHexEngine } from "../domain/zones/geohashHexEngine";
import {
  aggregateToxicCountsByWeekAndZone,
  toZoneSummaries,
} from "../domain/aggregate";

/** YYYY-MM-DD -> DD-MM-YYYY */
function toDMY(ymd) {
  const [y, m, d] = ymd.split("-");
  return `${d}-${m}-${y}`;
}

/** "YYYY-MM-DD_YYYY-MM-DD" -> "DD-MM-YYYY al DD-MM-YYYY" */
function formatWeekLabel(weekKey) {
  const [from, to] = weekKey.split("_");
  return `${toDMY(from)} al ${toDMY(to)}`;
}

export default function MapPage() {
  // Granularidad (geohash precision) internamente 5/6/7
  const [precision, setPrecision] = useState(6);

  // Filtro de color para el mapa
  const [levelFilter, setLevelFilter] = useState("ALL"); // "ALL" | "ROJO" | "AMARILLO" | "VERDE"

  const zoneEngine = useMemo(
    () => createGeohashHexEngine({ precision }),
    [precision],
  );

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

  const weeks = useMemo(
    () => (agg ? Array.from(agg.keys()).sort() : []),
    [agg],
  );
  const activeWeek = selectedWeek || (weeks.length ? weeks[0] : "");

  const zonesForSelectedWeek = useMemo(() => {
    if (!agg || !activeWeek) return [];
    const weekMap = agg.get(activeWeek);
    if (!weekMap) return [];
    return toZoneSummaries(activeWeek, weekMap);
  }, [agg, activeWeek]);

  const visibleZones = useMemo(() => {
    if (levelFilter === "ALL") return zonesForSelectedWeek;
    return zonesForSelectedWeek.filter((z) => z.level === levelFilter);
  }, [zonesForSelectedWeek, levelFilter]);

  if (error) return <pre>Error: {error}</pre>;
  if (!agg) return <Box sx={{ p: 3 }}>Cargando mock…</Box>;

  return (
    <>
      <TopNav />

      {/* Layout full-height: sin scroll vertical */}
      <Box
        sx={{
          height: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Container
          maxWidth="xl"
          disableGutters
          sx={{
            px: { xs: 2, sm: 3, md: 4 }, // padding controlado (no margen gigante)
            py: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ md: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Mapa de alertas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Eventos tóxicos por zona — semana calendario (lunes a domingo)
                </Typography>
              </Box>

              {/* Controles con GAP y PADDING para que respiren */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.25,
                  py: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",

                  // ✅ en desktop no se estira innecesariamente
                  width: { xs: "100%", md: "fit-content" },
                  maxWidth: "100%",
                  alignSelf: { md: "flex-end" },
                }}
              >
                {/* Fila 1: selects */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: { xs: "flex-start", md: "flex-end" },
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: 260 }}>
                    <InputLabel>Semana</InputLabel>
                    <Select
                      label="Semana"
                      value={activeWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      disabled={!weeks.length}
                      renderValue={(value) => formatWeekLabel(value)}
                    >
                      {weeks.map((w) => (
                        <MenuItem key={w} value={w}>
                          {formatWeekLabel(w)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 170 }}>
                    <InputLabel>Granularidad</InputLabel>
                    <Select
                      label="Granularidad"
                      value={precision}
                      onChange={(e) => setPrecision(Number(e.target.value))}
                      renderValue={(value) =>
                        value === 5 ? "Baja" : value === 6 ? "Media" : "Alta"
                      }
                    >
                      <MenuItem value={5}>Baja</MenuItem>
                      <MenuItem value={6}>Media</MenuItem>
                      <MenuItem value={7}>Alta</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Fila 2: filtros + chip, ocupando el ancho */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.25,
                    flexWrap: "wrap",
                  }}
                >
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={levelFilter}
                    onChange={(_, next) => {
                      if (next !== null) setLevelFilter(next);
                    }}
                    sx={{
                      "& .MuiToggleButton-root": {
                        textTransform: "none",
                        px: 1.4,
                        borderRadius: 1.5,
                      },
                    }}
                  >
                    <ToggleButton value="ALL">Todos</ToggleButton>
                    <ToggleButton value="ROJO">Rojo</ToggleButton>
                    <ToggleButton value="AMARILLO">Amarillo</ToggleButton>
                    <ToggleButton value="VERDE">Verde</ToggleButton>
                  </ToggleButtonGroup>

                  <Chip
                    label={`Zonas visibles: ${visibleZones.length}`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Stack>

            <WeekKpis zones={zonesForSelectedWeek} />

            <Box sx={{ flex: 1, minHeight: 0 }}>
              <MapView zones={visibleZones} zoneEngine={zoneEngine} />
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
