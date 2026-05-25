from app.schemas.reasoning import RuntimeMetricsSummary


class MetricsSummarizer:
    def summarize(self, *, latency_ms: int, baseline_latency_ms: int, retries: int, severity: str) -> RuntimeMetricsSummary:
        baseline = max(baseline_latency_ms, 1)
        error_rate_pct = round(min(100.0, max(0.5, ((latency_ms - baseline) / baseline) * 12.5)), 2)
        retry_budget_used_pct = round(min(100.0, retries * 16.5), 2)
        saturation_pct = round(min(100.0, (latency_ms / max(baseline, 100)) * 28.0), 2)
        traffic_shift_pct = 35.0 if severity in {"high", "critical"} else 0.0
        summary_lines = [
            f"lat:{latency_ms}ms base:{baseline_latency_ms}ms",
            f"err:{error_rate_pct}% retry:{retry_budget_used_pct}%",
            f"sat:{saturation_pct}% shift:{traffic_shift_pct}%",
        ]
        return RuntimeMetricsSummary(
            latency_ms=latency_ms,
            baseline_latency_ms=baseline_latency_ms,
            error_rate_pct=error_rate_pct,
            retry_budget_used_pct=retry_budget_used_pct,
            saturation_pct=saturation_pct,
            traffic_shift_pct=traffic_shift_pct,
            summary_lines=summary_lines,
        )


metrics_summarizer = MetricsSummarizer()
