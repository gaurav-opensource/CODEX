import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "../components/shared/card";
import { cortexApi } from "../lib/api";
import type { HydraDBStatus } from "../types/cortex";

function Toggle({ label, description, defaultOn = false }: { label: string; description: string; defaultOn?: boolean }) {
  return (
    <label className="settings-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <input type="checkbox" defaultChecked={defaultOn} className="dash-toggle" />
    </label>
  );
}

export function SettingsPage() {
  const [status, setStatus] = useState<HydraDBStatus | null>(null);

  useEffect(() => {
    void cortexApi.hydradbStatus().then(setStatus);
  }, []);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">Control plane</p>
          <h1>Settings</h1>
          <p className="page-subtitle">Runtime controls, notifications, and recovery behavior.</p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Runtime</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <Toggle label="Autonomous recovery" description="Allow agents to execute recovery without manual approval." defaultOn />
            <Toggle label="Auto rollback" description="Restore from stable checkpoint when verification fails." defaultOn />
            <Toggle label="Live event stream" description="Broadcast recovery events to connected dashboards." defaultOn />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <Toggle label="Critical incidents" description="Alert on severity critical and quarantine events." defaultOn />
            <Toggle label="Rollback notifications" description="Notify when HydraDB restores a checkpoint." />
            <Toggle label="Weekly reliability digest" description="Email summary of recovery performance." />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Environment</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <label className="settings-field">
              <span>API endpoint</span>
              <input defaultValue="http://localhost:8000/api/v1" />
            </label>
            <label className="settings-field">
              <span>WebSocket URL</span>
              <input defaultValue="ws://localhost:8000/api/v1/ws/events" />
            </label>
            <label className="settings-field">
              <span>HydraDB project</span>
              <input defaultValue={status?.project_id ?? "cortex-local"} />
            </label>
            <label className="settings-field">
              <span>Recovery policy</span>
              <select defaultValue="balanced">
                <option value="aggressive">Aggressive</option>
                <option value="balanced">Balanced</option>
                <option value="conservative">Conservative</option>
              </select>
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
