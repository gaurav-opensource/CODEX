import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { App as LandingPage } from "@/App";
import { DashboardRoutes } from "@/dashboard/routes/DashboardRoutes";
import RecoverySandboxPage from "@/pages/RecoverySandboxPage";
import { env } from "@/config/env";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard/*" element={<DashboardRoutes />} />
        {env.isSandboxEnabled && <Route path="/sandbox" element={<RecoverySandboxPage />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
