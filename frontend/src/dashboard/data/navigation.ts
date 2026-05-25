import {
  Activity,
  BrainCircuit,
  Database,
  GitBranch,
  LayoutDashboard,
  FlaskConical,
  Radio,
  Settings,
  Siren,
  Terminal,
  Workflow
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface DashboardNavSection {
  id: string;
  label: string;
  items: DashboardNavItem[];
}

export const dashboardNavSections: DashboardNavSection[] = [
  {
    id: "core",
    label: "Core",
    items: [
      { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/dashboard/workflows", label: "Workflows", icon: Workflow },
      { to: "/sandbox", label: "Recovery Sandbox", icon: FlaskConical },
      { to: "/dashboard/recovery", label: "Recovery Timeline", icon: GitBranch }
    ]
  },
  {
    id: "ai",
    label: "AI System",
    items: [
      { to: "/dashboard/agents", label: "Agent Runtime", icon: BrainCircuit },
      { to: "/dashboard/reasoning", label: "Agent Reasoning", icon: Terminal },
      { to: "/dashboard/memory", label: "HydraDB Memory", icon: Database }
    ]
  },
  {
    id: "observability",
    label: "Observability",
    items: [
      { to: "/dashboard/incidents", label: "Incidents", icon: Siren },
      { to: "/dashboard/events", label: "Live Events", icon: Terminal },
      { to: "/dashboard/analytics", label: "Analytics", icon: Activity }
    ]
  },
  {
    id: "system",
    label: "System",
    items: [
      { to: "/dashboard/architecture", label: "Architecture", icon: Radio },
      { to: "/dashboard/settings", label: "Settings", icon: Settings }
    ]
  }
];

/** @deprecated use dashboardNavSections */
export const dashboardNavigation: DashboardNavItem[] = dashboardNavSections.flatMap((s) => s.items);
