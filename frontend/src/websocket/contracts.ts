import type { CortexEvent } from "@/types/cortex";
import type { SandboxEvent } from "@/types/events";

export function isCortexEvent(value: unknown): value is CortexEvent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CortexEvent>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.created_at === "string" &&
    Boolean(candidate.payload) &&
    typeof candidate.payload === "object"
  );
}

export function isSandboxEvent(value: unknown): value is SandboxEvent {
  return Boolean(value) && typeof value === "object";
}
