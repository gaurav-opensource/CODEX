import { Bell, BrainCircuit, ChevronDown, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function DashboardNavbar() {
  return (
    <header className="dash-navbar">
      <div className="dash-navbar-glow" />
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100">Production</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <label className="dash-search">
          <Search className="h-4 w-4 text-slate-500" />
          <input placeholder="Search workflows, incidents, checkpoints…" />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="dash-sync-pill"
        >
          <span className="live-dot" />
          Runtime sync
        </motion.div>
        <span className="dash-status-pill">
          <BrainCircuit className="h-3.5 w-3.5" />
          Live
        </span>
        <button type="button" className="dash-icon-btn relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="dash-notify-dot" />
        </button>
        <div className="dash-profile">
          <span className="dash-avatar">CX</span>
          <div className="hidden md:block">
            <strong>Ops Control</strong>
            <small>Administrator</small>
          </div>
        </div>
      </div>
    </header>
  );
}
