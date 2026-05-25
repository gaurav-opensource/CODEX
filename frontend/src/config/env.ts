const DEFAULT_API_BASE_URL = "http://localhost:8000/api/v1";
const DEFAULT_WS_BASE_URL = "ws://localhost:8000/api/v1/ws";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL);
const wsBaseUrl = trimTrailingSlash(import.meta.env.VITE_WS_BASE_URL ?? DEFAULT_WS_BASE_URL);

function resolveSandboxWsUrl(): string | null {
  const explicit = import.meta.env.VITE_SANDBOX_WS_URL as string | undefined;
  if (explicit) {
    return trimTrailingSlash(explicit);
  }

  // Only use testing websocket in development mode
  if (import.meta.env.DEV && apiBaseUrl.startsWith("http")) {
    const origin = apiBaseUrl.replace(/\/api\/v1$/, "");
    return `${origin.replace(/^http/, "ws")}/api/v1/testing/ws`;
  }

  // In production, sandbox is disabled unless explicitly configured
  return null;
}

export const env = {
  apiBaseUrl,
  wsBaseUrl,
  sandboxWsUrl: resolveSandboxWsUrl(),
  apiTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 10000),
  apiRetryCount: Number(import.meta.env.VITE_API_RETRY_COUNT ?? 1),
  eventBatchWindowMs: Number(import.meta.env.VITE_EVENT_BATCH_WINDOW_MS ?? 120),
  isSandboxEnabled: import.meta.env.DEV || Boolean(import.meta.env.VITE_SANDBOX_WS_URL)
};
