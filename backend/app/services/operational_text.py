"""Enterprise-grade operational copy for incidents, events, and agent narratives."""
from __future__ import annotations

import random
from typing import Any


def incident_title(*, workflow_name: str, signal: str, severity: str) -> str:
    shard = random.choice(["shard-1", "shard-2", "shard-3", "zone-a", "zone-b"])
    templates: dict[str, list[str]] = {
        "latency_spike": [
            f"P99 latency breach on {workflow_name} ({shard}) — downstream saturation",
            f"Workflow queue backlog exceeded SLO on {workflow_name}",
        ],
        "database_timeout": [
            f"Connection pool exhaustion affecting {workflow_name} ({shard})",
            f"Primary DB handshake timeout in {workflow_name} execution plane",
        ],
        "redis_failure": [
            f"Redis replication drift detected in {workflow_name} {shard}",
            f"Cache quorum instability during {workflow_name} fan-out",
        ],
        "memory_leak": [
            f"Heap pressure anomaly in {workflow_name} worker pool",
            f"GC pause cascade observed in {workflow_name} runtime",
        ],
        "cpu_spike": [
            f"CPU saturation on {workflow_name} orchestration plane",
            f"Autoscaling lag during burst on {workflow_name}",
        ],
        "api_crash": [
            f"Upstream API circuit opened for {workflow_name}",
            f"Gateway 5xx burst destabilized {workflow_name}",
        ],
        "dependency_failure": [
            f"Dependency graph divergence in {workflow_name}",
            f"Cross-service contract mismatch blocking {workflow_name}",
        ],
        "network_latency": [
            f"Inter-AZ latency regression on {workflow_name} path",
            f"Packet loss detected on {workflow_name} mesh edge",
        ],
    }
    base = random.choice(templates.get(signal, templates["latency_spike"]))
    if severity in {"high", "critical"}:
        return f"[{severity.upper()}] {base}"
    return base


def ambient_event() -> tuple[str, str, dict[str, Any]]:
    """Returns (type, message, payload)."""
    events = [
        (
            "runtime.drift",
            "retry.executor timeout=180ms attempt=2",
            {"level": "warn", "component": "executor"},
        ),
        (
            "hydradb.sync",
            "HydraDB sync degraded — checkpoint reconciliation delayed",
            {"level": "degraded", "component": "hydradb"},
        ),
        (
            "policy.arbitration",
            "Governor awaiting policy consensus",
            {"level": "warn", "component": "governor"},
        ),
        (
            "memory.lineage",
            "Checkpoint lineage incomplete on historical replay",
            {"level": "warn", "component": "historian"},
        ),
        (
            "verification.delay",
            "Verification delayed due to runtime instability",
            {"level": "warn", "component": "verifier"},
        ),
        (
            "quorum.wait",
            "Agent quorum instability — secondary validation pending",
            {"level": "degraded", "component": "sentinel"},
        ),
        (
            "reasoning.confidence",
            f"Recovery confidence dropped to {random.randint(58, 72)}%",
            {"level": "warn", "component": "strategist"},
        ),
        (
            "historian.mismatch",
            "historian replay mismatch detected",
            {"level": "warn", "component": "historian"},
        ),
    ]
    return random.choice(events)
