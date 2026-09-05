import { TLRecord } from "tldraw";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WS_BASE = API_BASE.replace(/^http/, "ws");

export async function fetchCanvasSnapshot(roomId: string): Promise<TLRecord[]> {
  const res = await fetch(`${API_BASE}/canvas/${roomId}/snapshot`);
  if (!res.ok) throw new Error("Failed to load canvas snapshot");
  const data = await res.json();
  return data.records as TLRecord[];
}

export type CanvasWSMessage =
  | { type: "update"; records: TLRecord[] }
  | { type: "delete"; ids: string[] };

export function createCanvasSocket(
  roomId: string,
  onMessage: (msg: CanvasWSMessage) => void
): WebSocket {
  const socket = new WebSocket(`${WS_BASE}/canvas/ws/${roomId}`);
  socket.onmessage = (event) => {
    onMessage(JSON.parse(event.data) as CanvasWSMessage);
  };
  return socket;
}