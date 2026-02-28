import { createBrowserRouter } from "react-router-dom";
import MapPage from "../pages/MapPage";
import ReportsPage from "../pages/ReportsPage";

export const router = createBrowserRouter([
  { path: "/", element: <MapPage /> },
  { path: "/map", element: <MapPage /> },
  { path: "/reports", element: <ReportsPage /> },
]);