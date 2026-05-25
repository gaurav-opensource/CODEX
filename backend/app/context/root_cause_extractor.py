class RootCauseExtractor:
    def extract(self, signal: str, facts: dict[str, object]) -> str:
        if root_cause := facts.get("root_cause"):
            return str(root_cause)

        causes = {
            "latency_spike": "Dependency saturation amplified by retry pressure",
            "error_burst": "Upstream provider instability tripped the error budget",
            "health_probe_failed": "Canary drift caused health probes to fail",
        }
        return causes.get(signal, "Workflow instability pattern requires containment")


root_cause_extractor = RootCauseExtractor()
