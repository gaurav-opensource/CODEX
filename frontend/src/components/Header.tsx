import { BrainCircuit, Radio } from "lucide-react";

export function Header({ connected }: { connected: boolean }) {
  return (
    <header className="app-header">
      <div className="brand">
        <BrainCircuit aria-hidden="true" size={30} />
        <div>
          <h1>CORTEX</h1>
          <p>Self-Healing AI Workflow Brain</p>
        </div>
      </div>
      <div className={`connection ${connected ? "online" : "offline"}`}>
        <Radio aria-hidden="true" size={18} />
        {connected ? "Live" : "Offline"}
      </div>
    </header>
  );
}

