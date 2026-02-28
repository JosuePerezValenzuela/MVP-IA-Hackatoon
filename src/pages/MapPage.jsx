import { useEffect, useMemo, useState } from "react";
import { Container, Stack, Typography, Box, FormControl, InputLabel, Select, MenuItem, Chip } from "@mui/material";

import TopNav from "../ui/TopNav";
import MapView from "../components/MapView";

import { loadMockEvents } from "../services/loadMockEvents";
import { createGeohashHexEngine } from "../domain/zones/geohashHexEngine";
import { aggregateToxicCountsByWeekAndZone, toZoneSummaries } from "../domain/aggregate";

export default function MapPage() {
  const zoneEngine = useMemo(() => createGeohashHexEngine({ precision: 6 }), []);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState("");

  useEffect(() => {
    loadMockEvents().then(setEvents).catch((e) => setError(e.message));
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
  if (!agg) return <Box sx={{ p: 3 }}>Cargando mock…</Box>;

  return (
    <>
      <TopNav />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
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

            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 260 }}>
                <InputLabel>Semana</InputLabel>
                <Select
                  label="Semana"
                  value={activeWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  disabled={!weeks.length}
                >
                  {weeks.map((w) => (
                    <MenuItem key={w} value={w}>
                      {w}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Chip label={`Zonas: ${zonesForSelectedWeek.length}`} color="primary" variant="outlined" />
            </Stack>
          </Stack>

          <MapView zones={zonesForSelectedWeek} zoneEngine={zoneEngine} />
        </Stack>
      </Container>
    </>
  );
}