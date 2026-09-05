export interface LiveKitTokenResponse {
  token: string;
  livekit_url: string;
  room_name: string;
}

export interface ScreenShareSession {
  id: string;
  room_id: string;
  participant_id: string | null;
  livekit_room_name: string;
  started_at: string;
  ended_at: string | null;
}

type ScreenShareWSIncoming =
  | { type: "started"; session: ScreenShareSession }
  | { type: "stopped"; session: ScreenShareSession; participant_id: string | null }
  | { type: "error"; detail: string };

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WS_BASE = API_BASE.replace(/^http/, "ws");

export async function fetchLiveKitToken(
  roomId: string,
  participantId: string,
  participantName: string
): Promise<LiveKitTokenResponse> {
  const res = await fetch(`${API_BASE}/screenshare/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      room_id: roomId,
      participant_id: participantId,
      participant_name: participantName,
    }),
  });
  if (!res.ok) throw new Error("Failed to get LiveKit token");
  return res.json();
}

export async function fetchActiveSessions(roomId: string): Promise<ScreenShareSession[]> {
  const res = await fetch(`${API_BASE}/screenshare/${roomId}/active`);
  if (!res.ok) throw new Error("Failed to load active sessions");
  const data = await res.json();
  return data.sessions as ScreenShareSession[];
}

export function createScreenShareSocket(
  roomId: string,
  onMessage: (msg: ScreenShareWSIncoming) => void
): WebSocket {
  const socket = new WebSocket(`${WS_BASE}/screenshare/ws/${roomId}`);
  socket.onmessage = (event) => onMessage(JSON.parse(event.data) as ScreenShareWSIncoming);
  return socket;
}

export function notifyStart(socket: WebSocket, participantId: string) {
  socket.send(JSON.stringify({ type: "start", participant_id: participantId }));
}

export function notifyStop(socket: WebSocket, sessionId: string, participantId: string) {
  socket.send(JSON.stringify({ type: "stop", session_id: sessionId, participant_id: participantId }));
}