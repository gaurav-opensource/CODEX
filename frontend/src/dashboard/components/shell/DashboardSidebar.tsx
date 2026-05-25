import { motion } from "framer-motion";
import { BrainCircuit, ChevronLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

import { dashboardNavSections } from "../../data/navigation";
import { useOperationalStatus } from "../../hooks/useOperationalStatus";
import { cn } from "../../../lib/utils";

function StatusDot({ tone }: { tone: "ok" | "warn" | "crit" | "idle" }) {
  return (
    <span
      className={cn(
        "dash-status-dot",
        tone === "ok" && "dash-status-ok",
        tone === "warn" && "dash-status-warn",
        tone === "crit" && "dash-status-crit",
        tone === "idle" && "dash-status-idle"
      )}
    />
  );
}

export function DashboardSidebar({
  collapsed,
  onToggle
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const status = useOperationalStatus();
  const runtimeTone =
    status.runtime_health === "healthy" ? "ok" : status.runtime_health === "degraded" ? "crit" : "warn";
  const hydradbTone = status.hydradb_sync === "synced" ? "ok" : "warn";

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 232 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="dash-sidebar"
    >
      <div className="dash-sidebar-head">
        <NavLink to="/" className="dash-logo" title="CORTEX">
          <span className="dash-logo-icon">
            <BrainCircuit className="h-[18px] w-[18px] text-cyan-300" />
          </span>
          {!collapsed ? <span className="dash-logo-text">CORTEX</span> : null}
        </NavLink>
        <button type="button" className="dash-icon-btn" onClick={onToggle} aria-label="Toggle sidebar">
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="dash-nav">
        {dashboardNavSections.map((section) => (
          <div key={section.id} className="dash-nav-section">
            {!collapsed ? <p className="dash-nav-section-label">{section.label}</p> : null}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => cn("dash-nav-item", isActive && "active")}
              >
                <span className="dash-nav-icon-wrap">
                  <item.icon className="h-4 w-4" />
                </span>
                {!collapsed ? <span className="dash-nav-label">{item.label}</span> : null}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className={cn("dash-sidebar-foot", collapsed && "dash-sidebar-foot-collapsed")}>
        {!collapsed ? <p className="dash-foot-title">System status</p> : null}
        <ul className="dash-status-list">
          <li title="Runtime health">
            <StatusDot tone={runtimeTone} />
            {!collapsed && <span>Runtime {status.runtime_health}</span>}
          </li>
          <li title="WebSocket">
            <StatusDot tone={status.websocket_connected ? "ok" : "crit"} />
            {!collapsed && <span>WS {status.websocket_connected ? "connected" : "offline"}</span>}
          </li>
          <li title="HydraDB sync">
            <StatusDot tone={hydradbTone} />
            {!collapsed && <span>HydraDB {status.hydradb_sync}</span>}
          </li>
          {(status.active_recoveries > 0 || status.degraded_workflows > 0) && (
            <li title="Active operations">
              <StatusDot tone="warn" />
              {!collapsed && (
                <span>
                  {status.active_recoveries > 0 ? `${status.active_recoveries} recovering` : ""}
                  {status.active_recoveries > 0 && status.degraded_workflows > 0 ? " · " : ""}
                  {status.degraded_workflows > 0 ? `${status.degraded_workflows} degraded` : ""}
                </span>
              )}
            </li>
          )}
          {status.policy_arbitration_pending && (
            <li title="Policy arbitration">
              <StatusDot tone="warn" />
              {!collapsed && <span>Policy arbitration pending</span>}
            </li>
          )}
        </ul>
      </div>
    </motion.aside>
  );
}
