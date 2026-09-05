export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  content: string;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

type ChatWSIncoming =
  | { type: "new"; message: ChatMessage }
  | { type: "edit"; message: ChatMessage }
  | { type: "delete"; message_id: string; message: ChatMessage }
  | { type: "error"; detail: string };

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WS_BASE = API_BASE.replace(/^http/, "ws");

export async function fetchMessages(roomId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE}/chat/${roomId}/messages`);
  if (!res.ok) throw new Error("Failed to load messages");
  const data = await res.json();
  return data.messages as ChatMessage[];
}

export function createChatSocket(
  roomId: string,
  onMessage: (msg: ChatWSIncoming) => void
): WebSocket {
  const socket = new WebSocket(`${WS_BASE}/chat/ws/${roomId}`);
  socket.onmessage = (event) => {
    onMessage(JSON.parse(event.data) as ChatWSIncoming);
  };
  return socket;
}

export function sendNewMessage(
  socket: WebSocket,
  payload: { room_id: string; user_id: string; username: string; content: string }
) {
  socket.send(JSON.stringify({ type: "new", payload }));
}

export function sendEditMessage(
  socket: WebSocket,
  messageId: string,
  userId: string,
  content: string
) {
  socket.send(
    JSON.stringify({ type: "edit", message_id: messageId, user_id: userId, content })
  );
}

export function sendDeleteMessage(socket: WebSocket, messageId: string, userId: string) {
  socket.send(JSON.stringify({ type: "delete", message_id: messageId, user_id: userId }));
}