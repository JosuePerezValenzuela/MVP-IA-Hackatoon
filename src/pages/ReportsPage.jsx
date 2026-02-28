import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Box,
  Container,
  Stack,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";

import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

import TopNav from "../ui/TopNav";
import { loadMockDataset } from "../services/loadMockDataset";
import { requestExecutiveReport } from "../services/reportApi";

import { createGeohashHexEngine } from "../domain/zones/geohashHexEngine";
import { createZoneLabeler } from "../domain/zones/zoneLabeler";
import { aggregateToxicCountsByWeekAndZone, toZoneSummaries } from "../domain/aggregate";
import { parseLocalTimestamp } from "../domain/time/localTime";

// YYYY-MM-DD -> DD-MM-YYYY
function toDMY(ymd) {
  const [y, m, d] = ymd.split("-");
  return `${d}-${m}-${y}`;
}

// "YYYY-MM-DD_YYYY-MM-DD" -> "DD-MM-YYYY al DD-MM-YYYY"
function formatWeekLabel(weekKey) {
  const [from, to] = weekKey.split("_");
  return `${toDMY(from)} al ${toDMY(to)}`;
}

function precisionLabel(p) {
  if (p === 5) return "Baja";
  if (p === 6) return "Media";
  return "Alta";
}

function cacheKey({ weekKey, precision }) {
  return `report:${weekKey}:p${precision}`;
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // params desde Map: ?week=...&precision=...&autogen=1
  const paramWeek = searchParams.get("week") || "";
  const paramPrecision = Number(searchParams.get("precision") || 6);
  const autoGen = searchParams.get("autogen") === "1";

  const [precision, setPrecision] = useState(Number.isFinite(paramPrecision) ? paramPrecision : 6);
  const zoneEngine = useMemo(() => createGeohashHexEngine({ precision }), [precision]);

  const [dataset, setDataset] = useState({ meta: null, clusters: [], events: [] });
  const [error, setError] = useState(null);

  const [selectedWeek, setSelectedWeek] = useState(paramWeek);
  const [markdown, setMarkdown] = useState("");
  const [modelUsed, setModelUsed] = useState("");
  const [loading, setLoading] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  // 1) cargar dataset completo (meta+clusters+events)
  useEffect(() => {
    loadMockDataset()
      .then(setDataset)
      .catch((e) => setError(e.message));
  }, []);

  // 2) normalizar eventos (agregar ts Date local)
  const normalizedEvents = useMemo(() => {
    return (dataset.events ?? []).map((e) => ({
      id: e.id,
      timestamp: e.timestamp,
      ts: parseLocalTimestamp(e.timestamp),
      lat: e.lat,
      lng: e.lng,
      harmful: Boolean(e.harmful),
      truck_id: e.truck_id,
    }));
  }, [dataset.events]);

  const agg = useMemo(() => {
    if (!normalizedEvents.length) return null;
    return aggregateToxicCountsByWeekAndZone(normalizedEvents, zoneEngine);
  }, [normalizedEvents, zoneEngine]);

  const weeks = useMemo(() => (agg ? Array.from(agg.keys()).sort() : []), [agg]);

  const activeWeek = selectedWeek || (weeks.length ? weeks[0] : "");

  // Mantener URL en sync (si cambias semana o precision manualmente)
  useEffect(() => {
    if (!activeWeek) return;
    const next = new URLSearchParams(searchParams);
    next.set("week", activeWeek);
    next.set("precision", String(precision));
    next.delete("autogen"); // una vez usado, lo quitamos
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWeek, precision]);

  const summaries = useMemo(() => {
    if (!agg || !activeWeek) return [];
    const weekMap = agg.get(activeWeek);
    if (!weekMap) return [];
    return toZoneSummaries(activeWeek, weekMap); // [{zoneId,count,level,weekKey}]
  }, [agg, activeWeek]);

  const totals = useMemo(() => {
    const toxic_events = summaries.reduce((acc, z) => acc + z.count, 0);
    const zones_red = summaries.filter((z) => z.level === "ROJO").length;
    const zones_yellow = summaries.filter((z) => z.level === "AMARILLO").length;
    const zones_green = summaries.filter((z) => z.level === "VERDE").length;

    return { toxic_events, zones_total: summaries.length, zones_red, zones_yellow, zones_green };
  }, [summaries]);

  // 3) Cache: al cambiar semana/precision, intenta cargar markdown cacheado local
  useEffect(() => {
    if (!activeWeek) return;

    const key = cacheKey({ weekKey: activeWeek, precision });
    const raw = localStorage.getItem(key);
    if (!raw) {
      setMarkdown("");
      setModelUsed("");
      setFromCache(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setMarkdown(parsed.markdown || "");
      setModelUsed(parsed.model || "");
      setFromCache(true);
    } catch {
      setMarkdown("");
      setModelUsed("");
      setFromCache(false);
    }
  }, [activeWeek, precision]);

  const generateReport = useCallback(async () => {
    if (!activeWeek) return;

    setLoading(true);
    setError(null);

    try {
      // Labeler: zoneId -> nombre humano (clusters)
      const labeler = createZoneLabeler({ clusters: dataset.clusters, zoneEngine });

      // hotspots (top 10 por count)
      const hotspots = [...summaries]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((z) => ({
          zone_name: labeler.labelForZoneId(z.zoneId),
          level: z.level,
          count: z.count,
        }));

      const payload = {
        context: {
          city: dataset.meta?.city ?? "Cochabamba - Cercado",
          week_range: formatWeekLabel(activeWeek),
          week_rule: "Lunes a Domingo",
          alert_rule: dataset.meta?.alert_rule_per_zone_per_week ?? {
            VERDE: 1,
            AMARILLO: "2-3",
            ROJO: ">=4",
          },
          note: "MVP con zonas automáticas (geohash). Los nombres de zona se aproximan por cercanía a clusters del mock.",
          precision: precisionLabel(precision),
        },
        totals,
        hotspots,
      };

      const resp = await requestExecutiveReport({
        weekLabel: formatWeekLabel(activeWeek),
        payload,
      });

      const md = resp.markdown || "";
      setMarkdown(md);
      setModelUsed(resp.model || "");
      setFromCache(Boolean(resp.cached));

      // cache local persistente
      const key = cacheKey({ weekKey: activeWeek, precision });
      localStorage.setItem(key, JSON.stringify({ markdown: md, model: resp.model || "", ts: Date.now() }));
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [activeWeek, precision, dataset.clusters, dataset.meta, summaries, totals, zoneEngine]);

  // 4) Si vienes desde Mapa con autogen=1 y no hay markdown, genera automáticamente
  useEffect(() => {
    if (!autoGen) return;
    if (!activeWeek) return;
    if (markdown) return; // si ya hay cache, no regeneramos

    generateReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGen, activeWeek]);

  if (error) {
    // dejamos UI MUI, pero sin romper layout
  }
  if (!agg) {
    return (
      <>
        <TopNav />
        <Box sx={{ p: 3 }}>Cargando mock…</Box>
      </>
    );
  }

  return (
    <>
      <TopNav />

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
            px: { xs: 2, sm: 3, md: 4 },
            py: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  Informe Ejecutivo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generado con IA a partir del resumen semanal (sin enviar eventos crudos).
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 260 }}>
                  <InputLabel>Semana</InputLabel>
                  <Select
                    label="Semana"
                    value={activeWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    renderValue={(v) => formatWeekLabel(v)}
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
                    renderValue={(v) => precisionLabel(Number(v))}
                  >
                    <MenuItem value={5}>Baja</MenuItem>
                    <MenuItem value={6}>Media</MenuItem>
                    <MenuItem value={7}>Alta</MenuItem>
                  </Select>
                </FormControl>

                <Chip
                  label={`Tóxicos: ${totals.toxic_events} | Zonas: ${totals.zones_total}`}
                  color="primary"
                  variant="outlined"
                />

                <Button
                  variant="contained"
                  onClick={generateReport}
                  disabled={loading || !activeWeek}
                >
                  {markdown ? "Regenerar" : "Generar reporte"}
                </Button>

                <Button variant="text" onClick={() => navigate("/map")} disabled={loading}>
                  Volver al mapa
                </Button>
              </Stack>
            </Stack>

            {error ? <Alert severity="error">{error}</Alert> : null}

            {/* Panel del markdown: scroll interno (evitamos scroll de página) */}
            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                flex: 1,
                minHeight: 0,
                overflow: "auto",
                p: { xs: 2, sm: 3 },
              }}
            >
              {loading ? (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Generando informe…
                  </Typography>
                </Stack>
              ) : markdown ? (
                <>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Semana: {formatWeekLabel(activeWeek)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {modelUsed ? `Modelo: ${modelUsed}` : ""} {fromCache ? "· cache" : ""}
                    </Typography>
                  </Box>

                  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                    {markdown}
                  </ReactMarkdown>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay informe aún. Presiona “Generar reporte”.
                </Typography>
              )}
            </Paper>
          </Stack>
        </Container>
      </Box>
    </>
  );
}