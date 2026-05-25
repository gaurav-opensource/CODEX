export type SandboxMetrics = {
  latency?: number;
  error_rate?: number;
  saturation?: number;
  workflow_id?: string;
  status?: string;
};

export type SandboxTopologyNode = {
  id: string;
  label: string;
  status: string;
};

export type SandboxTopology = {
  nodes?: SandboxTopologyNode[];
  edges?: Array<Record<string, unknown>>;
};

export type SandboxEvent = {
  id?: string;
  type?: string;
  agent?: string;
  reasoning?: string;
  confidence?: number;
  strategy?: string;
  risk?: string;
  status?: string;
  message?: string;
  metrics?: SandboxMetrics;
  topology?: SandboxTopology | null;
  step?: number;
  stage?: string;
  payload?: Record<string, unknown>;
};
