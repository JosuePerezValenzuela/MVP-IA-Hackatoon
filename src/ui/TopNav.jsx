import { AppBar, Toolbar, Tabs, Tab, Typography, Box } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import DescriptionIcon from "@mui/icons-material/Description";
import { Link, useLocation } from "react-router-dom";

export default function TopNav() {
  const { pathname } = useLocation();
  const value = pathname.startsWith("/reports") ? "/reports" : "/map";

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main", letterSpacing: 0.3 }}>
          EcoGuard
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Tabs value={value} indicatorColor="primary" textColor="inherit">
          <Tab
            value="/map"
            label="Mapa"
            icon={<MapIcon />}
            iconPosition="start"
            component={Link}
            to="/map"
          />
          <Tab
            value="/reports"
            label="Informes"
            icon={<DescriptionIcon />}
            iconPosition="start"
            component={Link}
            to="/reports"
          />
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}