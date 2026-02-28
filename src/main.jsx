import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";

import { router } from "./app/router";
import { theme } from "./ui/theme";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          /* Contenedor Leaflet */
          ".leaflet-container": {
            background: "#0b1220",
            outline: "none",
            fontFamily:
              "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial",
          },

          /* Barra de zoom y controles */
          ".leaflet-bar": {
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            background: "rgba(15,23,42,0.85)",
            backdropFilter: "blur(6px)",
          },
          ".leaflet-bar a": {
            background: "transparent",
            color: "#e5e7eb",
            borderBottom: "1px solid rgba(34,197,94,0.18)",
            width: 34,
            height: 34,
            lineHeight: "34px",
          },
          ".leaflet-bar a:last-child": {
            borderBottom: "none",
          },
          ".leaflet-bar a:hover": {
            background: "rgba(34,197,94,0.10)",
            color: "#22c55e",
          },
          ".leaflet-bar a:focus": {
            outline: "none",
          },

          /* Atribución (abajo a la derecha) */
          ".leaflet-control-attribution": {
            background: "rgba(15,23,42,0.85)",
            color: "#9ca3af",
            border: "1px solid rgba(34,197,94,0.18)",
            borderRadius: 10,
            padding: "4px 8px",
            margin: "0 10px 10px 0",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            backdropFilter: "blur(6px)",
          },
          ".leaflet-control-attribution a": {
            color: "#86efac",
            textDecoration: "none",
          },
          ".leaflet-control-attribution a:hover": {
            color: "#22c55e",
            textDecoration: "underline",
          },

          /* Tooltips (si quieres que se vean más dark) */
          ".leaflet-tooltip": {
            background: "rgba(15,23,42,0.95)",
            color: "#e5e7eb",
            border: "1px solid rgba(34,197,94,0.20)",
            borderRadius: 10,
            boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
          },
          ".leaflet-tooltip-top:before, .leaflet-tooltip-bottom:before, .leaflet-tooltip-left:before, .leaflet-tooltip-right:before":
            {
              borderTopColor: "rgba(15,23,42,0.95)",
              borderBottomColor: "rgba(15,23,42,0.95)",
              borderLeftColor: "rgba(15,23,42,0.95)",
              borderRightColor: "rgba(15,23,42,0.95)",
            },
        }}
      />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);
