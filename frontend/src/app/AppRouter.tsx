import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { App as LandingPage } from "@/App";
import { DashboardRoutes } from "@/dashboard/routes/DashboardRoutes";
import RecoverySandboxPage from "@/pages/RecoverySandboxPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard/*" element={<DashboardRoutes />} />
        <Route path="/sandbox" element={<RecoverySandboxPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
