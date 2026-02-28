import { Card, CardContent, Stack, Typography, Box } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

/**
 * zones: [{ zoneId, count, level }]
 */
export default function WeekKpis({ zones }) {
  const theme = useTheme();

  const totalToxic = zones.reduce((acc, z) => acc + z.count, 0);
  const byLevel = zones.reduce(
    (acc, z) => {
      acc[z.level] = (acc[z.level] ?? 0) + 1;
      return acc;
    },
    { ROJO: 0, AMARILLO: 0, VERDE: 0 }
  );

  const items = [
    {
      title: "Eventos tóxicos",
      value: totalToxic,
      hint: "Total semanal",
      dot: theme.palette.primary.main, // verde
    },
    {
      title: "Zonas rojas",
      value: byLevel.ROJO,
      hint: "≥4 eventos",
      dot: theme.palette.error.main,
    },
    {
      title: "Zonas amarillas",
      value: byLevel.AMARILLO,
      hint: "2–3 eventos",
      dot: theme.palette.warning.main,
    },
    {
      title: "Zonas verdes",
      value: byLevel.VERDE,
      hint: "1 evento",
      dot: theme.palette.success.main,
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
      }}
    >
      {items.map((it) => (
        <Card
          key={it.title}
          elevation={0}
          sx={{
            height: "100%",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.75),
            backdropFilter: "blur(6px)",
          }}
        >
          <CardContent
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 130, // clave: todas mismas alturas
              pb: "16px !important",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  bgcolor: it.dot,
                  boxShadow: `0 0 0 4px ${alpha(it.dot, 0.12)}`,
                }}
              />
              <Typography variant="subtitle2" color="text.secondary">
                {it.title}
              </Typography>
            </Stack>

            <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1, mt: 1 }}>
              {it.value}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {it.hint}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}