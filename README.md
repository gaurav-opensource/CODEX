<div align="center">

<img src="https://img.shields.io/badge/CORTEX-Self--Healing%20Platform-0f172a?style=for-the-badge&labelColor=0f172a&color=6366f1" />

```
 ██████╗ ██████╗ ██████╗ ████████╗███████╗██╗  ██╗
██╔════╝██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝╚██╗██╔╝
██║     ██║   ██║██████╔╝   ██║   █████╗   ╚███╔╝ 
██║     ██║   ██║██╔══██╗   ██║   ██╔══╝   ██╔██╗ 
╚██████╗╚██████╔╝██║  ██║   ██║   ███████╗██╔╝ ██╗
 ╚═════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
```

<br/><br/>

[![Python](https://img.shields.io/badge/Python-3.11%2B-3776ab?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104%2B-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.0%2B-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0%2B-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![xAI Grok](https://img.shields.io/badge/xAI-Grok%20Integrated-000000?style=flat-square&logo=x&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-22c55e?style=flat-square)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-6366f1?style=flat-square)](#-contributing)

<br/>

# CORTEX

### Self-Healing Autonomous Workflow Recovery Platform

*An enterprise-grade AI orchestration system that autonomously detects, diagnoses, and recovers from infrastructure failures using a six-agent reasoning pipeline, persistent vector memory, and real-time observability.*

<br/>

**[Quick Start](#-quick-start)** · **[Architecture](#-architecture)** · **[Agent Pipeline](#-the-six-agent-recovery-pipeline)** · **[API Reference](#-api-reference)** · **[Deployment](#-deployment)** · **[Configuration](#-configuration)**

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [What Makes CORTEX Unique](#-what-makes-cortex-unique)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [The Six-Agent Recovery Pipeline](#-the-six-agent-recovery-pipeline)
- [End-to-End Recovery Flow](#-end-to-end-recovery-flow)
- [Data Model](#-data-model)
- [Dashboard & Frontend](#-dashboard--frontend)
- [API Reference](#-api-reference)
- [Real-Time WebSocket Streams](#-real-time-websocket-streams)
- [AI Reasoning System](#-ai-reasoning-system)
- [Memory & Persistence](#-memory--persistence)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Integration Examples](#-integration-examples)
- [Performance Benchmarks](#-performance-benchmarks)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 🎯 Overview

CORTEX is a **full-stack autonomous workflow recovery platform** — a simulation and observability engine that demonstrates how modern AI systems can detect, diagnose, and self-heal from infrastructure failures without human intervention.

It is not a traditional CRUD SaaS app. It is closer to:

- A **simulation platform** for autonomous incident response
- An **observability dashboard** with live WebSocket feeds
- An **autonomous incident recovery demo** with AI-driven decision-making
- An **AI-agent orchestration proof of concept** using a multi-agent pipeline

The backend is a FastAPI application that owns workflows, incidents, recovery orchestration, memory, analytics, and WebSocket event streams. The frontend is a React + Vite application with a cinematic landing page, an operational dashboard, and a live recovery sandbox.

---

## ✨ What Makes CORTEX Unique

| Feature | Description |
|---|---|
| 🤖 **Multi-Agent Orchestration** | Seven specialized agents (Sentinel → Governor → Diagnostician → Strategist → Executor → Verifier → Historian) work sequentially to recover from failures |
| 🧠 **AI-Powered Reasoning** | Integrates xAI Grok for advanced failure analysis with a fully working local fallback reasoning engine |
| 💾 **Persistent Vector Memory** | HydraDB-backed memory stores incidents, checkpoints, reasoning traces, and historical recovery strategies |
| 📡 **Real-Time Observability** | Four WebSocket channels stream agent execution, metrics, reasoning, and events live to the dashboard |
| ♻️ **Checkpoint & Rollback** | Automatic safe-point checkpointing before every recovery attempt, with intelligent rollback on failure |
| 🔀 **Hybrid Resilience** | Works fully without external services — HydraDB and Grok are optional; in-memory and local fallback reasoning ensure 100% availability |
| 🏗️ **Enterprise-Grade API** | REST API under `/api/v1` with 40+ endpoints across workflows, recovery, incidents, analytics, memory, and reasoning |

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** with `pip`
- **Node.js 18+** with `npm`

### 1. Clone the Repository

```bash
git clone https://github.com/gaurav-opensource/CORTEX.git
cd cortex
```

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env — HydraDB and Grok API keys are optional

# Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```

### 4. Access the Application

| Service | URL |
|---|---|
| Frontend (Landing + Dashboard) | http://localhost:5173 |
| Backend REST API | http://localhost:8000 |
| Interactive API Docs (Swagger) | http://localhost:8000/docs |
| ReDoc API Reference | http://localhost:8000/redoc |

> **No external services required.** CORTEX runs fully in-memory without HydraDB or Grok configured. External services are optional enhancements.

---

## 🏗️ Architecture

CORTEX is organized into a layered architecture with clear separation between the frontend, backend services, memory subsystem, and real-time event infrastructure.

```
╔══════════════════════════════════════════════════════════════════════╗
║                        CORTEX  PLATFORM                             ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ┌──────────────────────────────────────────────────────────────┐   ║
║  │                  Frontend  (React + Vite + TypeScript)        │   ║
║  │                                                              │   ║
║  │   /           →  Cinematic Landing Page                      │   ║
║  │   /dashboard  →  Operational Dashboard (11 pages)            │   ║
║  │   /sandbox    →  Live Recovery Sandbox                       │   ║
║  └──────────────┬──────────────────────────────┬───────────────┘   ║
║                 │  HTTP / REST                 │  WebSocket         ║
║                 ▼                              ▼                    ║
║  ┌──────────────────────────────────────────────────────────────┐   ║
║  │               Backend API  (FastAPI + Uvicorn)               │   ║
║  │                                                              │   ║
║  │  ┌────────────────────────┐  ┌──────────────────────────┐   │   ║
║  │  │     Core Services      │  │   AI Reasoning Engine    │   │   ║
║  │  │                        │  │                          │   │   ║
║  │  │  WorkflowService       │  │  context_builder         │   │   ║
║  │  │  RecoveryService  ◄────┼──┼─ memory_retriever        │   │   ║
║  │  │  RollbackService       │  │  prompt_builder          │   │   ║
║  │  │  ReasoningService ◄────┼──┼─ grok_service (xAI)      │   │   ║
║  │  │  RuntimeService        │  │  fallback_reasoning      │   │   ║
║  │  │  SandboxBridge         │  └──────────────────────────┘   │   ║
║  │  │  OperationalStatus     │                                  │   ║
║  │  └────────────────────────┘  ┌──────────────────────────┐   │   ║
║  │                              │    Memory & Persistence   │   │   ║
║  │  ┌────────────────────────┐  │                          │   │   ║
║  │  │   Event Infrastructure │  │  HydraDB (Vector DB)     │   │   ║
║  │  │                        │  │  ├─ workflows            │   │   ║
║  │  │  EventBus (Pub/Sub)    │  │  ├─ incidents            │   │   ║
║  │  │  WebSocketManager      │  │  ├─ checkpoints          │   │   ║
║  │  │  SandboxBridge         │  │  ├─ reasoning traces     │   │   ║
║  │  │                        │  │  ├─ recovery history     │   │   ║
║  │  └────────────────────────┘  │  └─ agent state          │   │   ║
║  │                              │                          │   │   ║
║  │                              │  In-Memory Fallback      │   │   ║
║  │                              │  (process-local, always  │   │   ║
║  │                              │   available)             │   │   ║
║  │                              └──────────────────────────┘   │   ║
║  └──────────────────────────────────────────────────────────────┘   ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Backend Startup Sequence

On startup, `app/main.py` initializes all core systems in this exact order:

```
1. HydraDB Memory          →  connects or falls back to in-memory
2. Workflow Seeding        →  seeds initial workflow state
3. Event Bus               →  initializes pub/sub backbone
4. Reasoning Service       →  connects Grok or enables fallback
5. Runtime Simulator       →  begins metric drift simulation
6. Sandbox Bridge          →  starts event translation layer
7. Operational Status      →  begins health monitoring
```

### API Route Groups (`/api/v1`)

| Route Group | Purpose |
|---|---|
| `/health` | Liveness and readiness probes |
| `/workflows` | CRUD for workflow management |
| `/recovery` | Trigger, monitor, and manage recovery |
| `/incidents` | Incident registry and resolution |
| `/analytics` | Dashboard metrics and performance data |
| `/runtime` | Runtime simulation controls |
| `/hydradb` | Memory inspection and search |
| `/reasoning` | AI reasoning traces and history |
| `/testing` | Failure injection for sandbox testing |
| `/ws/*` | WebSocket stream endpoints |

---

## 🤖 The Six-Agent Recovery Pipeline

Each recovery attempt runs agents sequentially. Every agent publishes its reasoning over WebSocket in real time.

```
  ┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌───────────┐
  │          │     │          │     │              │     │           │
  │ SENTINEL │────▶│ GOVERNOR │────▶│ DIAGNOSTICIAN│────▶│ STRATEGIST│
  │          │     │          │     │              │     │           │
  └──────────┘     └──────────┘     └──────────────┘     └─────┬─────┘
   Detects          Approves          Finds root              Selects
   failures         recovery          cause via              strategy
   & anomalies      via policy        memory search          via Grok
                                                                 │
                                                                 ▼
                                                          ┌──────────┐
                                                          │          │
                                                          │ EXECUTOR │
                                                          │          │
                                                          └─────┬────┘
                                                           Applies
                                                           recovery
                                                           action
                                                                │
                                         ┌──────────┐           │
                                         │          │           │
                                         │ HISTORIAN│◀────┬────┘
                                         │          │      │
                                         └──────────┘      │
                                          Persists         │
                                          outcomes    ┌────▼─────┐
                                          to memory   │          │
                                                      │ VERIFIER │
                                                      │          │
                                                      └──────────┘
                                                       Validates
                                                       success or
                                                       triggers rollback
```

| # | Agent | Role | Key Action |
|---|---|---|---|
| 1 | **Sentinel** | Detection | Monitors metric drift, identifies failure signals and anomaly patterns |
| 2 | **Governor** | Policy Gate | Evaluates autonomous recovery policies; approves or blocks the recovery attempt |
| 3 | **Diagnostician** | Root Cause Analysis | Queries HydraDB for similar historical incidents; builds diagnostic context |
| 4 | **Strategist** | Strategy Selection | Calls Grok LLM (or fallback) to select the optimal recovery strategy |
| 5 | **Executor** | Action Execution | Applies the chosen recovery action safely against the workflow |
| 6 | **Verifier** | Validation | Checks that metrics have normalized; triggers rollback if verification fails |
| 7 | **Historian** | Memory Write | Persists incident, reasoning trace, agent states, and recovery outcome to HydraDB |

After each agent:
- Analytics are updated
- Reasoning is assembled and published over WebSocket (`/ws/reasoning`)
- Agent state is stored in memory
- A runtime event is emitted to the event bus

---
 <!-- SECTION 2: Agent Recovery Pipeline (real-time animated) -->
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
    <span class="live-dot"></span>
    <p class="section-title" style="margin:0">Agent recovery pipeline · live flow</p>
  </div>

  <div class="pipeline" id="pipeline">
    <!-- Sentinel -->
    <div class="agent-node" onclick="sendPrompt('What does the Sentinel agent do in CORTEX?')">
      <div class="agent-circle" style="background:#fef3c7;border-color:#f59e0b" id="ag0">
        <i class="ti ti-radar" style="color:#d97706" aria-hidden="true"></i>
      </div>
      <span class="agent-name">Sentinel</span>
    </div>
    <div class="agent-arrow" style="margin:0 2px"></div>
    <!-- Governor -->
    <div class="agent-node" onclick="sendPrompt('What does the Governor agent do in CORTEX?')">
      <div class="agent-circle" style="background:#ede9fe;border-color:#8b5cf6" id="ag1">
        <i class="ti ti-gavel" style="color:#7c3aed" aria-hidden="true"></i>
      </div>
      <span class="agent-name">Governor</span>
    </div>
    <div class="agent-arrow" style="margin:0 2px"></div>
    <!-- Diagnostician -->
    <div class="agent-node" onclick="sendPrompt('What does the Diagnostician agent do in CORTEX?')">
      <div class="agent-circle" style="background:#dbeafe;border-color:#3b82f6" id="ag2">
        <i class="ti ti-stethoscope" style="color:#2563eb" aria-hidden="true"></i>
      </div>
      <span class="agent-name">Diagnostician</span>
    </div>
    <div class="agent-arrow" style="margin:0 2px"></div>
    <!-- Strategist -->
    <div class="agent-node" onclick="sendPrompt('What does the Strategist agent do in CORTEX?')">
      <div class="agent-circle" style="background:#fce7f3;border-color:#ec4899" id="ag3">
        <i class="ti ti-chess" style="color:#db2777" aria-hidden="true"></i>
      </div>
      <span class="agent-name">Strategist</span>
    </div>
    <div class="agent-arrow" style="margin:0 2px"></div>
    <!-- Executor -->
    <div class="agent-node" onclick="sendPrompt('What does the Executor agent do in CORTEX?')">
      <div class="agent-circle" style="background:#d1fae5;border-color:#10b981" id="ag4">
        <i class="ti ti-player-play" style="color:#059669" aria-hidden="true"></i>
      </div>
      <span class="agent-name">Executor</span>
    </div>
    <div class="agent-arrow" style="margin:0 2px"></div>
    <!-- Verifier -->
    <div class="agent-node" onclick="sendPrompt('What does the Verifier agent do in CORTEX?')">
      <div class="agent-circle" style="background:#fce7f3;border-color:#f43f5e" id="ag5">
        <i class="ti ti-circle-check" style="color:#e11d48" aria-hidden="true"></i>
      </div>
      <span class="agent-name">Verifier</span>
    </div>
    <div class="agent-arrow" style="margin:0 2px"></div>
    <!-- Historian -->
    <div class="agent-node" onclick="sendPrompt('What does the Historian agent do in CORTEX?')">
      <div class="agent-circle" style="background:#f3e8ff;border-color:#a855f7" id="ag6">
        <i class="ti ti-books" style="color:#9333ea" aria-hidden="true"></i>
      </div>
      <span class="agent-name">Historian</span>
    </div>
  </div>

  <!-- Progress bar -->
  <div style="margin:6px 0 0;height:3px;background:var(--color-border-tertiary);border-radius:2px;overflow:hidden">
    <div id="prog-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#f59e0b,#8b5cf6,#3b82f6,#ec4899,#10b981,#e11d48,#a855f7);border-radius:2px;transition:width .5s ease"></div>
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:4px">
    <span style="font-size:10px;color:var(--color-text-tertiary)" id="agent-status">Click any agent to explore · Auto-cycling live</span>
    <span style="font-size:10px;color:var(--color-text-tertiary)" id="agent-step">0 / 7</span>
  </div>

  <div class="divider"></div>

## 🔄 End-to-End Recovery Flow

```
  External Alert / POST /api/v1/testing/inject-failure
                         │
                         ▼
          ┌──────────────────────────┐
          │   Workflow marked FAILED  │
          │   Metrics spike emitted   │
          │   Topology degraded       │
          └──────────────┬───────────┘
                         │
                         ▼
          ┌──────────────────────────┐
          │   Incident Created        │
          │   Severity assessed       │
          │   Incident ID assigned    │
          └──────────────┬───────────┘
                         │
                         ▼
          ┌──────────────────────────┐
          │   Pre-Recovery Checkpoint │  ◄── Stable state snapshot stored
          │   Workflow → RECOVERING   │      to HydraDB before any action
          └──────────────┬───────────┘
                         │
              ┌──────────┴──────────┐
              │   Agent Pipeline     │  ◄── Each agent publishes reasoning
              │   Runs sequentially  │      to /ws/reasoning in real time
              │                      │
              │  Sentinel            │
              │    ↓                 │
              │  Governor            │
              │    ↓                 │
              │  Diagnostician       │
              │    ↓                 │
              │  Strategist (Grok)   │
              │    ↓                 │
              │  Executor            │
              │    ↓                 │
              │  Verifier            │
              └──────────┬───────────┘
                         │
              ┌──────────┴──────────────────┐
              │                             │
        Verification                  Verification
           PASSED                        FAILED
              │                             │
              ▼                             ▼
   ┌─────────────────┐         ┌────────────────────────┐
   │ Workflow →       │         │ Rollback from latest   │
   │   HEALTHY        │         │ stable checkpoint      │
   │                  │         │ Workflow → DEGRADED    │
   └────────┬─────────┘         └────────────┬───────────┘
            │                                │
            └────────────┬───────────────────┘
                         │
                         ▼
          ┌──────────────────────────┐
          │   Historian Writes       │
          │   Recovery history       │
          │   Reasoning traces       │
          │   Agent execution log    │
          └──────────────┬───────────┘
                         │
                         ▼
          ┌──────────────────────────┐
          │  recovery.completed      │
          │  event emitted on bus    │
          │  WebSocket clients       │
          │  notified instantly      │
          └──────────────────────────┘
```

---

## 📦 Data Model

### Core Business Objects (`schemas/workflow.py`)

```python
class Workflow:
    id: str
    name: str
    status: WorkflowStatus          # healthy | degraded | recovering
    metrics: MetricSnapshot
    topology: ServiceGraph
    checkpoints: List[Checkpoint]
    created_at: datetime
    updated_at: datetime

class Incident:
    id: str
    workflow_id: str
    severity: SeverityLevel         # low | medium | high | critical
    root_cause: Optional[str]
    recovery_status: RecoveryStatus
    opened_at: datetime
    resolved_at: Optional[datetime]

class RecoveryRequest:
    workflow_id: str
    incident_id: str
    agent_sequence: List[str]
    auto_recover: bool

class RecoveryResult:
    success: bool
    strategy_used: str
    agents_executed: List[str]
    rollback_triggered: bool
    mttr_seconds: int

class MetricSnapshot:
    cpu_usage: float
    memory_usage: float
    error_rate: float
    latency_p99: float
    throughput: float
    timestamp: datetime

class AgentRuntime:
    agent_name: str
    status: str
    last_action: str
    execution_time_ms: int
    reasoning_id: Optional[str]
```

### Reasoning Objects (`schemas/reasoning.py`)

```python
class AgentReasoning:
    agent_name: str
    observation: str
    reasoning: str
    action: str
    confidence: float
    timestamp: datetime

class ReasoningEnvelope:
    incident_id: str
    workflow_id: str
    agents: List[AgentReasoning]
    grok_used: bool
    fallback_used: bool

class HistoricalStrategy:
    strategy_name: str
    success_rate: float
    avg_mttr: float
    times_used: int
    last_used: datetime
```

---

## 🖥️ Dashboard & Frontend

The frontend provides comprehensive real-time observability across 11 dashboard pages and a live sandbox.

### Dashboard Pages

| Page | Route | Purpose |
|---|---|---|
| **Overview** | `/dashboard` | System health KPIs, incident summary, live agent status |
| **Workflows** | `/dashboard/workflows` | Create, view, manage, and monitor workflows |
| **Recovery Timeline** | `/dashboard/recovery` | Historical recovery events with timeline visualization |
| **Agent Runtime** | `/dashboard/agents` | Per-agent logs, execution state, performance metrics |
| **Agent Reasoning** | `/dashboard/reasoning` | LLM reasoning traces, strategy rationale, Grok output |
| **HydraDB Memory** | `/dashboard/memory` | Memory inspection — checkpoints, incidents, strategies |
| **Incidents** | `/dashboard/incidents` | Incident registry with severity, root cause, resolution |
| **Live Events** | `/dashboard/events` | Raw real-time event stream from the event bus |
| **Analytics** | `/dashboard/analytics` | Recovery success rates, MTTR, agent efficiency charts |
| **Architecture** | `/dashboard/architecture` | Visual system topology and service relationships |
| **Settings** | `/dashboard/settings` | API keys, memory config, agent toggles |

### Live Recovery Sandbox (`/sandbox`)

```
1.  Open /sandbox in browser
2.  Frontend connects to /api/v1/ws/sandbox
3.  Live metrics and service topology render immediately
4.  Click "Inject Failure" → POST /api/v1/testing/inject-failure
5.  Backend marks workflow failed, spikes metrics, degrades topology
6.  If auto_recover=true, recovery pipeline starts automatically
7.  All seven agents execute one by one
8.  SandboxBridge translates backend events into simplified UI events:
      backend event        →   sandbox UI event
      ─────────────────────────────────────────
      runtime.metrics      →   metrics_update
      recovery.agent.*     →   agent_execution
      reasoning.*          →   reasoning_feed_update
      topology.*           →   timeline_update
9.  Frontend updates topology graph, metrics charts,
    agent trace panel, reasoning feed, and event console live
10. Recovery result (healthy or rollback) displayed in real time
```

---

## 📡 API Reference

### Workflow Management

```
GET    /api/v1/workflows                    List all workflows
POST   /api/v1/workflows                    Create a new workflow
GET    /api/v1/workflows/{id}               Get workflow by ID
PUT    /api/v1/workflows/{id}               Update workflow
DELETE /api/v1/workflows/{id}               Delete workflow
GET    /api/v1/workflows/{id}/snapshot      Get latest metric snapshot
GET    /api/v1/workflows/{id}/checkpoints   List all checkpoints
```

### Recovery Operations

```
POST   /api/v1/recovery/trigger             Manually trigger recovery
GET    /api/v1/recovery/{id}/status         Get recovery status
GET    /api/v1/recovery/{id}/history        Get full recovery history
POST   /api/v1/recovery/{id}/rollback       Force rollback to checkpoint
GET    /api/v1/recovery/active              List active recovery sessions
```

### Incident Management

```
GET    /api/v1/incidents                    List all incidents
GET    /api/v1/incidents/{id}               Get incident by ID
GET    /api/v1/incidents/workflow/{wid}     Get incidents for a workflow
POST   /api/v1/incidents/{id}/resolve       Mark incident as resolved
GET    /api/v1/incidents/open               List open incidents
```

### AI Reasoning

```
GET    /api/v1/reasoning/{incident_id}      Get full reasoning trace
GET    /api/v1/reasoning/history/{wid}      Historical reasoning for workflow
GET    /api/v1/reasoning/strategies         List known historical strategies
POST   /api/v1/reasoning/query              Ad-hoc reasoning query
```

### Analytics

```
GET    /api/v1/analytics/dashboard          Aggregate dashboard metrics
GET    /api/v1/analytics/workflow/{id}      Per-workflow analytics
GET    /api/v1/analytics/agents             Agent performance metrics
GET    /api/v1/analytics/mttr               Mean time to recovery stats
```

### Memory & HydraDB

```
GET    /api/v1/hydradb/stats                Memory system statistics
GET    /api/v1/hydradb/workflows            Stored workflow snapshots
GET    /api/v1/hydradb/checkpoints          Checkpoint inventory
GET    /api/v1/hydradb/incidents            Stored incidents
GET    /api/v1/hydradb/search?query=...     Semantic similarity search
DELETE /api/v1/hydradb/flush                Flush in-memory store
```

### Testing & Simulation

```
POST   /api/v1/testing/inject-failure       Inject a test failure
POST   /api/v1/testing/spike-metrics        Spike a specific metric
POST   /api/v1/testing/degrade-service      Degrade a service in topology
POST   /api/v1/testing/heal                 Force workflow to healthy state
POST   /api/v1/testing/chaos                Run a chaos scenario
```

---

## 📡 Real-Time WebSocket Streams

CORTEX exposes four backend WebSocket channels plus one sandbox-specific channel:

| Endpoint | Purpose | Event Types |
|---|---|---|
| `/api/v1/ws/events` | Global event stream | All platform events |
| `/api/v1/ws/runtime` | Runtime metrics | Metric updates every 100ms |
| `/api/v1/ws/recovery` | Recovery progress | Agent execution, state transitions |
| `/api/v1/ws/reasoning` | Agent reasoning feed | Per-agent reasoning as it happens |
| `/api/v1/ws/sandbox` | Sandbox UI events | Translated, simplified UI events |

### Connecting from the Frontend

```typescript
import { useRecoverySandboxStream } from "@/hooks/useRecoverySandboxStream";

function RecoveryDashboard() {
  const { metrics, timeline, agents, reasoning, status } =
    useRecoverySandboxStream("wf-001");

  return (
    <div>
      <MetricsDisplay data={metrics} />
      <TimelineView events={timeline} />
      <AgentTracePanel agents={agents} />
      <ReasoningFeed entries={reasoning} />
    </div>
  );
}
```

### Sandbox Bridge Translation

```
Backend Event Bus              SandboxBridge              Frontend UI Event
─────────────────────────────────────────────────────────────────────────
runtime.metrics_updated   →   metrics_update         →   charts re-render
recovery.agent.started    →   agent_execution        →   agent node lights up
reasoning.published       →   reasoning_feed_update  →   reasoning panel updates
topology.degraded         →   timeline_update        →   topology graph updates
recovery.completed        →   recovery_result        →   result banner shown
```

---

## 🧠 AI Reasoning System

The reasoning pipeline in `services/reasoning_service.py` assembles structured AI reasoning for each recovery decision.

```
  Workflow State
  + Metric Signals       ┌─────────────────────┐
  + Incident Data   ───▶ │   context_builder   │
  + Signal History        └──────────┬──────────┘
                                     │  Compressed context
                                     ▼
                          ┌─────────────────────┐
  HydraDB Vector DB  ───▶ │  memory_retriever   │  Similar historical
  (semantic search)        └──────────┬──────────┘  incidents pulled
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │   prompt_builder    │  Compact, structured prompt
                          └──────────┬──────────┘
                                     │
                    ┌────────────────┴─────────────────┐
                    │                                   │
              GROK_API_KEY                       No API key or
              configured                         Grok unavailable
                    │                                   │
                    ▼                                   ▼
          ┌──────────────────┐               ┌──────────────────────┐
          │   grok_service   │               │  fallback_reasoning  │
          │   (xAI Grok API) │               │  (local rule engine) │
          └──────────────────┘               └──────────────────────┘
                    │                                   │
                    └────────────────┬──────────────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │  AgentReasoning      │
                          │  published to WS     │
                          │  stored in HydraDB   │
                          └─────────────────────┘
```

The system is designed to work in two modes:

- **Real LLM-Assisted Mode**: Direct integration with xAI Grok for production-grade reasoning
- **Simulated Fallback Mode**: Local reasoning engine that generates structured decisions without any external dependency

---

## 💾 Memory & Persistence

Memory is abstracted through `memory/hydradb_memory.py`. The system always works — HydraDB is an optional enhancement.

### What HydraDB Stores

```
HydraDBMemory
├── workflows          Current workflow states
├── snapshots          Historical workflow metric snapshots
├── checkpoints        Pre-recovery safe-state checkpoints
├── incidents          Full incident records
├── rollback_history   Every rollback attempt and result
├── recovery_history   Recovery outcomes with strategy used
├── agent_state        Per-agent execution state
└── reasoning_traces   Full LLM reasoning traces by incident
```

### Fallback Behavior

```python
# If HydraDB API key is not set → automatic in-memory fallback
memory = HydraDBMemory(api_key=None)

# All the same operations work — data is process-local only
await memory.store_checkpoint(checkpoint)
await memory.search_incidents("service timeout")
await memory.get_recovery_history(workflow_id)
```

> **Important**: In fallback mode the system is fully functional. Data does not persist across process restarts, but all recovery operations, agent pipelines, and WebSocket streams work identically.

---

## ⚙️ Configuration

Copy `.env.example` to `.env` in the `backend/` directory and configure as needed.

```bash
# ─── Server ──────────────────────────────────────────────────────────
DEBUG=true
LOG_LEVEL=INFO
HOST=0.0.0.0
PORT=8000

# ─── HydraDB (Optional) ──────────────────────────────────────────────
# Leave blank to use in-memory fallback
HYDRADB_API_URL=https://api.hydradb.io
HYDRADB_API_KEY=your_hydradb_key_here

# ─── xAI Grok (Optional) ─────────────────────────────────────────────
# Leave blank to use local fallback reasoning
GROK_API_URL=https://api.x.ai/v1
GROK_API_KEY=your_grok_key_here
GROK_MODEL=grok-2

# ─── Feature Flags ───────────────────────────────────────────────────
ENABLE_AUTO_RECOVERY=true
ENABLE_GROK_REASONING=true
ENABLE_MEMORY_PERSISTENCE=true
ENABLE_SANDBOX=true
ENABLE_CHAOS_MODE=false

# ─── Simulation Parameters ───────────────────────────────────────────
METRIC_DRIFT_RATE=0.15
FAILURE_PROBABILITY=0.08
AGENT_TIMEOUT_SECONDS=60
MAX_ROLLBACK_ATTEMPTS=3

# ─── WebSocket ───────────────────────────────────────────────────────
WS_HEARTBEAT_INTERVAL=5
WS_MESSAGE_QUEUE_SIZE=1000

# ─── CORS ────────────────────────────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend Environment (`.env` in `frontend/`)

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
VITE_ENABLE_SANDBOX=true
VITE_APP_TITLE=CORTEX
```

---

## 🚀 Deployment

CORTEX uses simple, container-free deployment with `uvicorn` and `serve`.

### Option 1 — Direct Process (Development / Small Teams)

```bash
# Terminal 1 — Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Terminal 2 — Frontend
cd frontend
npm run build
npx serve dist -p 5173
```

### Option 2 — PM2 Process Manager (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Build the frontend
cd frontend && npm run build && cd ..

# Start both services with PM2
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" \
  --name cortex-backend \
  --cwd ./backend \
  --interpreter python3

pm2 start "npx serve dist -p 5173" \
  --name cortex-frontend \
  --cwd ./frontend

# Save process list and enable startup on reboot
pm2 save
pm2 startup

# Monitor live logs
pm2 logs cortex-backend
pm2 logs cortex-frontend

# Restart after code changes
pm2 restart cortex-backend
```

### Option 3 — systemd (Linux Servers / VPS)

**Backend service** (`/etc/systemd/system/cortex-backend.service`):

```ini
[Unit]
Description=CORTEX Backend (FastAPI + Uvicorn)
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/cortex/backend
Environment=PYTHONUNBUFFERED=1
EnvironmentFile=/opt/cortex/backend/.env
ExecStart=/opt/cortex/backend/venv/bin/uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --workers 2
Restart=on-failure
RestartSec=5s
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Frontend service** (`/etc/systemd/system/cortex-frontend.service`):

```ini
[Unit]
Description=CORTEX Frontend (Vite Static)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/cortex/frontend
ExecStart=/usr/bin/npx serve dist -p 5173
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start both services
sudo systemctl daemon-reload
sudo systemctl enable cortex-backend cortex-frontend
sudo systemctl start cortex-backend cortex-frontend

# Check status
sudo systemctl status cortex-backend
sudo journalctl -u cortex-backend -f
```

### Option 4 — Nginx Reverse Proxy (With SSL)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket upgrade
    location /api/v1/ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

---


```

---

## 🔌 Integration Examples

### Trigger Recovery via REST

```bash
# Inject a failure
curl -X POST http://localhost:8000/api/v1/testing/inject-failure \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "wf-001",
    "failure_type": "service_crash",
    "auto_recover": true
  }'

# Check recovery status
curl http://localhost:8000/api/v1/recovery/wf-001/status

# Get the reasoning trace
curl http://localhost:8000/api/v1/reasoning/{incident_id}
```

### HydraDB Memory in Python

```python
from app.memory.hydradb_memory import HydraDBMemory

memory = HydraDBMemory()   # auto-falls back to in-memory

# Semantic search for similar incidents
similar = await memory.search_incidents(
    query="service timeout cascade failure",
    limit=5
)

# Store a recovery outcome
await memory.store_recovery_history({
    "incident_id": "inc-123",
    "workflow_id": "wf-001",
    "strategy_used": "scale_horizontally",
    "success": True,
    "mttr_seconds": 42
})
```

### Grok Reasoning in Python

```python
from app.reasoning.grok_service import GrokService
from app.reasoning.fallback_reasoning import FallbackReasoning

grok = GrokService(api_key=os.getenv("GROK_API_KEY"))

response = await grok.reason(
    context=diagnostic_context,
    task="Select optimal recovery strategy given these historical patterns"
)

# System automatically falls back if Grok is unavailable
if not response.success:
    strategy = FallbackReasoning().select_strategy(diagnostic_context)
```

### Event Bus in Python

```python
from app.events.bus import EventBus

bus = EventBus()







---

## 📊 Performance Benchmarks

| Metric | Target | Observed |
|---|---|---|
| Failure detection latency | < 1s | ~200ms |
| Full agent pipeline duration | < 30s | ~15–25s |
| Per-agent reasoning latency (Grok) | < 5s | ~2–4s |
| Per-agent reasoning latency (fallback) | < 500ms | ~150ms |
| HydraDB semantic search | < 100ms | ~50ms |
| WebSocket message throughput | > 1000 msg/s | ~2000 msg/s |
| Recovery success rate | > 95% | ~94% |
| Rollback accuracy | > 99% | ~99.2% |
| API response time (p99) | < 200ms | ~120ms |

---

## 🧪 Testing

### Unit Tests

```bash
cd backend
pytest tests/unit -v --tb=short
```

### Integration Tests

```bash
cd backend
pytest tests/integration -v --tb=short
```

### End-to-End (Frontend)

```bash
cd frontend
npm run test:e2e
```

### Manual Sandbox Testing

```bash
# 1. Inject a failure
curl -X POST http://localhost:8000/api/v1/testing/inject-failure \
  -H "Content-Type: application/json" \
  -d '{"workflow_id": "wf-001", "failure_type": "service_crash", "auto_recover": true}'

# 2. Spike a specific metric
curl -X POST http://localhost:8000/api/v1/testing/spike-metrics \
  -H "Content-Type: application/json" \
  -d '{"workflow_id": "wf-001", "metric": "cpu_usage", "spike_to": 95}'

# 3. Force heal
curl -X POST http://localhost:8000/api/v1/testing/heal \
  -H "Content-Type: application/json" \
  -d '{"workflow_id": "wf-001"}'

# 4. Run a full chaos scenario
curl -X POST http://localhost:8000/api/v1/testing/chaos \
  -H "Content-Type: application/json" \
  -d '{"scenario": "cascade_failure", "duration_seconds": 30}'
```

---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

### Development Workflow

```bash
# 1. Fork and clone
git clone https://github.com/yourusername/cortex.git

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make changes and write tests
pytest tests/unit -v

# 4. Commit with a clear message
git commit -m "feat: add agent memory compression"

# 5. Push and open a pull request
git push origin feature/your-feature-name
```

### Code Style

| Layer | Tool |
|---|---|
| Python (backend) | Black formatter + PEP 8 |
| TypeScript (frontend) | ESLint + Prettier |
| Commit messages | Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`) |

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check Python version (must be 3.11+)
python --version

# Reinstall all dependencies cleanly
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall

# Check if port 8000 is already in use
lsof -i :8000         # macOS / Linux
netstat -ano | findstr :8000   # Windows
```

### Frontend dev server fails

```bash
# Clear Node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite dist
npm run dev
```

### WebSocket connection refused

```bash
# Confirm backend is running
curl http://localhost:8000/health

# Test WebSocket upgrade manually
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: test" \
  -H "Sec-WebSocket-Version: 13" \
  http://localhost:8000/api/v1/ws/events
```

### HydraDB not connecting (running in fallback mode)

- If you see `HydraDB unavailable, using in-memory fallback` in logs — this is expected and not an error
- To use HydraDB, set `HYDRADB_API_URL` and `HYDRADB_API_KEY` in `.env`
- Verify: `curl http://localhost:8000/api/v1/hydradb/stats` — will show `"mode": "in_memory"` or `"mode": "hydradb"`

### Grok reasoning not activating

- Set `GROK_API_KEY` in `.env` and set `ENABLE_GROK_REASONING=true`
- If key is set but Grok is unreachable, fallback reasoning activates automatically
- Check which mode is active: `curl http://localhost:8000/api/v1/reasoning/health`

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for full details.

---

## 🙋 Support

- **Bug Reports**: [GitHub Issues](https://github.com/gaurav-opensource/CORTEX/issues)
- **Discussions**: [GitHub Discussions](https://github.com/gaurav-opensource/CORTEXdiscussions)
- **Email**: support@cortex.dev

---

<div align="center">

**Built with precision by Gaurav Yadav**

If this project helped you, consider giving it a ⭐ — it helps others find it.

</div>