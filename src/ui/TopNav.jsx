import { NavLink } from "react-router-dom";

export default function TopNav() {
  const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: isActive ? "#f3f4f6" : "white",
    color: "black",
  });

  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
      <NavLink to="/map" style={linkStyle}>Mapa</NavLink>
      <NavLink to="/reports" style={linkStyle}>Informes</NavLink>
    </div>
  );
}