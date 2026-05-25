import { Navigate, Route, Routes } from "react-router-dom";

import { DashboardLayout } from "../components/shell/DashboardLayout";
import { AgentRuntimePage } from "../pages/AgentRuntimePage";
import { AIAgentReasoningPage } from "../pages/AIAgentReasoningPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { ArchitecturePage } from "../pages/ArchitecturePage";
import { HydraDBPage } from "../pages/HydraDBPage";
import { IncidentsPage } from "../pages/IncidentsPage";
import { LiveEventsPage } from "../pages/LiveEventsPage";
import { OverviewPage } from "../pages/OverviewPage";
import { RecoveryTimelinePage } from "../pages/RecoveryTimelinePage";
import { SettingsPage } from "../pages/SettingsPage";
import { WorkflowsPage } from "../pages/WorkflowsPage";

export function DashboardRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="workflows" element={<WorkflowsPage />} />
        <Route path="recovery" element={<RecoveryTimelinePage />} />
        <Route path="agents" element={<AgentRuntimePage />} />
        <Route path="reasoning" element={<AIAgentReasoningPage />} />
        <Route path="memory" element={<HydraDBPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="events" element={<LiveEventsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="architecture" element={<ArchitecturePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
