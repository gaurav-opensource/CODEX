import { env } from "@/config/env";
import type { CortexEvent } from "@/types/cortex";
import type { SandboxEvent } from "@/types/events";
import { isCortexEvent, isSandboxEvent } from "@/websocket/contracts";

type SocketHandlers<T> = {
  onMessage: (event: T) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
};

function createSocket<T>(url: string, validate: (value: unknown) => value is T, handlers: SocketHandlers<T>) {
  const socket = new WebSocket(url);

  socket.onopen = () => handlers.onOpen?.();
  socket.onclose = () => handlers.onClose?.();
  socket.onerror = (error) => handlers.onError?.(error);
  socket.onmessage = (message) => {
    if (typeof message.data !== "string") {
      return;
    }

    try {
      const payload = JSON.parse(message.data) as unknown;
      if (validate(payload)) {
        handlers.onMessage(payload);
      }
    } catch {
      // Ignore malformed frames to keep the stream alive.
    }
  };

  return socket;
}

export function connectEventSocket(path: string, handlers: SocketHandlers<CortexEvent>): WebSocket {
  return createSocket(`${env.wsBaseUrl}/${path}`, isCortexEvent, handlers);
}

export function connectSandboxSocket(handlers: SocketHandlers<SandboxEvent>): WebSocket {
  return createSocket(env.sandboxWsUrl, isSandboxEvent, handlers);
}
