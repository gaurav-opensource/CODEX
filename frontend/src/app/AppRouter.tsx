import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { App as LandingPage } from "@/App";
import { DashboardRoutes } from "@/dashboard/routes/DashboardRoutes";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard/*" element={<DashboardRoutes />} />
        <Route path="/sandbox" element={<Navigate to="/dashboard/sandbox" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
