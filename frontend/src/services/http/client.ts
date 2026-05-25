import { env } from "@/config/env";

function getErrorDetail(body: unknown, fallback: string) {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = body.detail;
    return typeof detail === "string" ? detail : fallback;
  }
  return fallback;
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), env.apiTimeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${env.apiBaseUrl}${path}`;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= env.apiRetryCount; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, {
        headers: { "Content-Type": "application/json", ...options?.headers },
        ...options
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(getErrorDetail(body, "Request failed"));
      }

      return response.json() as Promise<T>;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Request failed");
      if (attempt === env.apiRetryCount) {
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error("Request failed");
}
