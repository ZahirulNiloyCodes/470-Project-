import { WebSocketEvent } from "@/types/chat";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export function createChatSocket(
  roomId: string,
  onMessage: (event: WebSocketEvent) => void,
  onOpen?: () => void,
  onClose?: () => void,
  onError?: (error: Event) => void
) {
  const url = `${WS_URL}/ws/chat/${roomId}`;

  console.log("Connecting WebSocket:", url);

  const socket = new WebSocket(url);

  socket.onopen = () => {
    console.log("✅ WebSocket connected:", url);
    onOpen?.();
  };

  socket.onmessage = (event) => {
    try {
      const data: WebSocketEvent = JSON.parse(event.data);

      console.log("📩 WebSocket event:", data);

      onMessage(data);
    } catch (error) {
      console.error(
        "❌ Failed to parse WebSocket message:",
        error
      );
    }
  };

  socket.onerror = () => {
    console.warn(
      "⚠️ WebSocket error for:",
      url,
      "readyState:",
      socket.readyState
    );

    onError?.(new Event("websocket-error"));
  };

  socket.onclose = (event) => {
    console.log(
      "🔌 WebSocket closed:",
      event.code,
      event.reason || "No reason provided"
    );

    onClose?.();
  };

  return socket;
}