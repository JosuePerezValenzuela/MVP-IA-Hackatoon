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

          /* Atribución: forzar dark (alto nivel de especificidad + !important) */
          ".leaflet-container .leaflet-control-attribution, .leaflet-container .leaflet-control-attribution.leaflet-control":
            {
              background: "rgba(15,23,42,0.88) !important",
              color: "#9ca3af !important",
              border: "1px solid rgba(34,197,94,0.18) !important",
              borderRadius: "999px !important",
              padding: "6px 10px !important",
              margin: "0 12px 12px 0 !important",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35) !important",
              backdropFilter: "blur(6px)",
            },
          ".leaflet-container .leaflet-control-attribution a": {
            color: "#86efac !important",
            textDecoration: "none !important",
          },
          ".leaflet-container .leaflet-control-attribution a:hover": {
            color: "#22c55e !important",
            textDecoration: "underline !important",
          },
        }}
      />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);
