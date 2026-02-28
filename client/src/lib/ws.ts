import { useQuizStore } from "../store/useQuizStore";

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export function connectWS() {
  const url = import.meta.env.VITE_WS_URL || "ws://localhost:3001";

  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log("[WS] Connected");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "state") {
        useQuizStore.getState().setServerState(
          data.teams,
          data.questions,
          data.gameSettings,
          data.serverNow
        );
      }
    } catch (err) {
      console.error("[WS] Failed to parse message:", err);
    }
  };

  ws.onclose = () => {
    console.log("[WS] Disconnected, reconnecting in 1s...");
    ws = null;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connectWS, 1000);
  };

  ws.onerror = (err) => {
    console.error("[WS] Error:", err);
    ws?.close();
  };
}

export function disconnectWS() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  ws?.close();
  ws = null;
}
