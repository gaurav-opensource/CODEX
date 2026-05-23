<div align="center">

<br/>

```
 ██████╗ ██████╗ ██████╗ ████████╗███████╗██╗  ██╗
██╔════╝██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝╚██╗██╔╝
██║     ██║   ██║██████╔╝   ██║   █████╗   ╚███╔╝ 
██║     ██║   ██║██╔══██╗   ██║   ██╔══╝   ██╔██╗ 
╚██████╗╚██████╔╝██║  ██║   ██║   ███████╗██╔╝ ██╗
 ╚═════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
```

### **The Self-Healing Workflow Brain**

*"Future AI systems will not survive because they are intelligent. They will survive because they can heal themselves."*

<br/>

[![Recovery Rate](https://img.shields.io/badge/Recovery%20Rate-99.97%25-brightgreen?style=for-the-badge&logo=checkmarx)](/)
[![Detection Latency](https://img.shields.io/badge/Detection-<%20100ms-blue?style=for-the-badge&logo=speedtest)](/)
[![Recovery Time](https://img.shields.io/badge/Recovery-<%201s-orange?style=for-the-badge&logo=clockify)](/)
[![WebSocket Latency](https://img.shields.io/badge/WebSocket-<%2050ms-purple?style=for-the-badge&logo=socket.io)](/)

[![LangGraph](https://img.shields.io/badge/LangGraph-Orchestration-FF6B35?style=flat-square)](/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi)](/)
[![React](https://img.shields.io/badge/React-Dashboard-61DAFB?style=flat-square&logo=react)](/)
[![HydraDB](https://img.shields.io/badge/HydraDB-Memory%20Layer-00A3FF?style=flat-square)](/)

</div>

---

## 🧠 What is CORTEX?

**CORTEX** is an autonomous AI infrastructure platform that acts as an **immune system for distributed AI workflows**. It detects, diagnoses, repairs, and recovers from failures — entirely without human intervention.

Traditional AI systems fail silently. Engineers scramble to debug. Pipelines restart from scratch. CORTEX changes that paradigm entirely.

> **73% of AI pipelines** experience unhandled failures monthly. The average enterprise outage costs **$4.2 Million**, with failures going undetected for an average of **6.8 hours**. CORTEX makes those numbers irrelevant.

---

## ⚡ The Problem CORTEX Solves

| Failure Type | Impact | CORTEX Response |
|---|---|---|
| 🔌 **API Timeout Storms** | Workflows freeze indefinitely | Auto-reroutes requests, no downtime |
| 🤖 **AI Hallucinations** | Corrupted outputs propagate | Detects fabrication, repairs inference config |
| 🧩 **Memory Corruption** | Inconsistent shared state | Restores from nearest valid checkpoint |
| 💥 **Workflow Crashes** | Pipeline total loss | Surgical repair at failure point |
| ♾️ **Infinite Agent Loops** | Resource exhaustion | Identifies and terminates loop conditions |
| 🌊 **Multi-Agent Cascade** | System-wide failure | Isolates, repairs, resynchronizes agents |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CORTEX PLATFORM                          │
│                                                                 │
│  ┌─────────────┐    ┌──────────────────────────────────────┐   │
│  │   React     │◄──►│           FastAPI Backend             │   │
│  │  Dashboard  │    │     (Async REST + WebSocket)          │   │
│  └─────────────┘    └──────────────┬───────────────────────┘   │
│                                    │                            │
│              ┌─────────────────────▼──────────────────────┐    │
│              │           OVERSEER AGENT                    │    │
│              │     (Central Controller + Coordinator)      │    │
│              └──┬──────────┬───────────┬──────────────┬───┘    │
│                 │          │           │              │         │
│          ┌──────▼──┐  ┌────▼────┐ ┌───▼────┐ ┌──────▼──┐     │
│          │  VITAL  │  │FORENSIC │ │SURGEON │ │ CANARY  │     │
│          │ MONITOR │  │  AGENT  │ │ AGENT  │ │  AGENT  │     │
│          │(Detect) │  │(Analyze)│ │ (Fix)  │ │(Verify) │     │
│          └─────────┘  └─────────┘ └────────┘ └─────────┘     │
│                                                                 │
│          ┌──────────────────────────────────────────────┐      │
│          │              ARCHIVIST AGENT                 │      │
│          │    (Checkpoints · Memory · Incident History) │      │
│          └──────────────────────────────────────────────┘      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    HydraDB LAYER                         │  │
│  │  Workflow snapshots · Checkpoints · Incidents · Memory   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### The Seven Recovery Agents

| Agent | Role |
|---|---|
| 🧠 **Overseer** | Central controller — coordinates all recovery agents |
| 👁️ **Vital Monitor** | Continuously watches workflows and surfaces anomalies |
| 🔬 **Forensic Agent** | Performs root-cause analysis after a failure event |
| 🔧 **Surgeon Agent** | Applies targeted, minimal-footprint automated fixes |
| 🐤 **Canary Agent** | Validates whether repairs actually succeeded |
| 📚 **Archivist Agent** | Manages checkpoints, snapshots, and incident history |
| ⚙️ **Task Agents** | Execute business workflows and distributed operations |

---

## 🔄 Recovery Pipeline

```
  ① DETECT          ② DIAGNOSE         ③ REPAIR
  Failure           Root Cause          Apply Fix
     │                  │                  │
     ▼                  ▼                  ▼
 Vital Monitor ──► Forensic Agent ──► Surgeon Agent
                                           │
              ┌────────────────────────────┘
              │
              ▼
  ④ VALIDATE        ⑤ ROLLBACK         ⑥ RESTORE
  System Health    (if validation       Workflow
     │              fails)              State
     ▼                  │                  │
 Canary Agent ──────────┼──────────────────┤
                         ▼                  ▼
                    Archivist          ⑦ RESUME
                    Checkpoint         Execution
                                           │
                                           ▼
                                    ⑧ LEARN
                                    From Incident
```

---

## 🧬 HydraDB — The Memory Layer

CORTEX is powered by **HydraDB**, a unified memory system purpose-built for AI workflow reliability.

```
HydraDB
│
├── Workflow snapshots → Versioned workflow state at every transition
├── Checkpoints        → Fast rollback anchors before and after recovery
├── Incidents          → Root cause, severity, and recovery outcomes
├── Recovery history   → Agent timeline and verification trail
└── Agent state        → Per-agent facts, decisions, and handoff context
```

**HydraDB Capabilities:**
- **Workflow Memory** — Complete execution state snapshots at every stage
- **Checkpoint Memory** — Fast-restore rollback anchors
- **Failure Intelligence** — Reusable repair blueprint database
- **Failure Pattern Recall** — Predicts future failures using unified incident and recovery memory

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install --prefer-binary -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API available at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

HydraDB is optional for local demos. Without credentials, CORTEX automatically falls back to local in-memory storage.

```bash
HYDRADB_API_KEY=your-api-key
HYDRADB_PROJECT_ID=your-project-id
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard available at `http://localhost:5173`

### Run Everything at Once

```bash
# Windows
powershell -ExecutionPolicy Bypass -File scripts/start-local.ps1
```

## 🗂️ Project Structure

```
cortex/
│
├── 📁 frontend/                 # React + Vite monitoring dashboard
│   ├── src/
│   │   ├── components/          # Workflow graph, agent health, recovery panels
│   │   ├── hooks/               # WebSocket hooks, live data streams
│   │   └── pages/               # Dashboard, incidents, analytics
│   └── package.json
│
├── 📁 backend/                  # FastAPI async service
│   ├── app/
│   │   ├── main.py              # Application entry point
│   │   ├── api/                 # REST + WebSocket endpoints
│   │   ├── core/                # Overseer, recovery orchestration
│   │   └── memory/              # HydraDB memory service and local fallback
│   └── requirements.txt
│
├── 📁 agents/                   # Seven recovery agents
│   ├── sentinel.py              # Vital Monitor
│   ├── diagnostician.py         # Forensic Agent
│   ├── strategist.py            # Recovery Strategist
│   ├── governor.py              # Overseer
│   ├── executor.py              # Surgeon Agent
│   ├── verifier.py              # Canary Agent
│   └── historian.py             # Archivist Agent
│
├── 📁 scripts/
│   ├── start-backend.ps1        # Backend startup helper
│   ├── start-frontend.ps1       # Frontend startup helper
│   └── start-local.ps1          # Windows startup script
│
└── README.md
```

---

## 🎭 Chaos Engineering Demo

CORTEX ships with live chaos engineering scenarios to demonstrate recovery in action.

### 1. API Timeout Storm
```
Trigger: Simultaneous API failures across multiple agents
Response: Automatic rerouting, zero workflow interruption
```

### 2. Hallucination Detection
```
Trigger: AI model generates fabricated output
Response: Output flagged, inference configuration repaired
```

### 3. Corrupted Schema Recovery
```
Trigger: Database schema corruption injected
Response: Valid checkpoint restored, integrity verified
```

### 4. Infinite Loop Prevention
```
Trigger: Agent enters recursive execution cycle
Response: Loop identified, agent terminated, workflow resumed
```

### 5. Multi-Agent Cascade
```
Trigger: Cascading failure across distributed agents
Response: Isolation, per-agent repair, full resynchronization
```

---

## 📊 Performance Targets

| Metric | Target |
|---|---|
| 🎯 Detection Latency | `< 100ms` |
| ⚡ Recovery Time | `< 1 second` |
| ✅ Recovery Success Rate | `99.97%` |
| 📡 WebSocket Latency | `< 50ms` |
| 🌐 API Response Time | `< 200ms` |
| 🤖 Agent Scale | `10M+ agents` |

---

## 🌍 Enterprise Use Cases

| Vertical | Application |
|---|---|
| 🏥 **Healthcare AI** | Uninterrupted patient analysis and critical care pipelines |
| 💹 **Finance Automation** | Protecting trading strategies from corruption |
| 💬 **Customer Support AI** | Hallucination detection for verified responses |
| 🚚 **Logistics Orchestration** | Shipment routing continuity during system failures |
| ☁️ **Cloud Infrastructure** | Autonomous AIOps and infrastructure recovery |
| 🔧 **Enterprise AI DevOps** | CI/CD monitoring and autonomous pipeline recovery |

---

## 📈 Market Opportunity

| Industry | Market Size |
|---|---|
| Cloud Infrastructure | $120B |
| Finance Automation | $82B |
| Logistics AI | $65B |
| Healthcare AI | $45B |
| Enterprise AI DevOps | $38B |
| Customer Support AI | $28B |

---

## 🗺️ Roadmap

```
NOW ──────── 6 MONTHS ──────── 12 MONTHS ──────── 24 MONTHS
  │               │                  │                  │
  ▼               ▼                  ▼                  ▼
v1.0           Enterprise         AI DevOps         Autonomous
               Grade              Platform           OS

Multi-agent    SOC2 + HIPAA       Agent             Distributed
self-healing   compliance         marketplace       AI fabric

Checkpoint     Enterprise         Predictive        Cross-cloud
rollback       RBAC               healing           healing

HydraDB        Multi-tenant       Cross-org         Zero-human
memory         architecture       learning          operations

Chaos          SLA                                  Global AI
engineering    monitoring                           reliability
                                                    mesh
```

---

## ⚔️ CORTEX vs. Traditional Systems

| | Traditional AI Systems | **CORTEX** |
|---|---|---|
| Failure detection | Silent, hours later | Real-time, `< 100ms` |
| Diagnosis | Manual engineering effort | Autonomous root-cause analysis |
| Recovery | Full system restart | Surgical, targeted repair |
| Memory | No incident history | Persistent failure intelligence |
| Human intervention | Always required | Fully autonomous |
| Downtime | Minutes to hours | Sub-second |
| Learning | None | Continuous, every incident |

---

## 🧰 Technology Stack

| Layer | Technology |
|---|---|
| **Agent Orchestration** | LangGraph (stateful multi-agent, parallel execution) |
| **Backend API** | FastAPI (async REST + WebSocket streaming) |
| **Frontend** | React + Vite (monitoring dashboard) |
| **Observability** | LangSmith (agent decisions, traces, evaluations) |
| **Database + Memory** | HydraDB |
| **Communication** | WebSockets (live event streaming) |

---

## 🤝 Contributing

Contributions are welcome. Please open an issue to discuss what you'd like to change before submitting a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built for the future of autonomous AI infrastructure.**

*CORTEX — Because intelligence alone isn't enough. Systems must heal.*

</div>
