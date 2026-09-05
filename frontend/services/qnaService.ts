export interface AnonymousQuestion {
  id: string;
  room_id: string;
  participant_id?: string | null;
  question: string;
  status: "pending" | "answered" | "dismissed";
  answer?: string | null;
  answered_at?: string | null;
  dismissed_at?: string | null;
  created_at: string;
  updated_at: string;
}

type QnAWSIncoming =
  | { type: "new"; question: AnonymousQuestion }
  | { type: "answered"; question: AnonymousQuestion }
  | { type: "dismissed"; question: AnonymousQuestion }
  | { type: "error"; detail: string };

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WS_BASE = API_BASE.replace(/^http/, "ws");

export async function fetchQuestions(
  roomId: string,
  view: "host" | "participant" = "participant"
): Promise<AnonymousQuestion[]> {
  const res = await fetch(`${API_BASE}/qna/${roomId}/questions?view=${view}`);
  if (!res.ok) throw new Error("Failed to load questions");
  const data = await res.json();
  return data.questions as AnonymousQuestion[];
}

export async function fetchQueuePosition(questionId: string): Promise<number> {
  const res = await fetch(`${API_BASE}/qna/questions/${questionId}/position`);
  if (!res.ok) throw new Error("Failed to load queue position");
  const data = await res.json();
  return data.position as number;
}

export function createParticipantSocket(
  roomId: string,
  onMessage: (msg: QnAWSIncoming) => void
): WebSocket {
  const socket = new WebSocket(`${WS_BASE}/qna/ws/${roomId}/participant`);
  socket.onmessage = (event) => onMessage(JSON.parse(event.data) as QnAWSIncoming);
  return socket;
}

export function createHostSocket(
  roomId: string,
  onMessage: (msg: QnAWSIncoming) => void
): WebSocket {
  const socket = new WebSocket(`${WS_BASE}/qna/ws/${roomId}/host`);
  socket.onmessage = (event) => onMessage(JSON.parse(event.data) as QnAWSIncoming);
  return socket;
}

export function submitQuestion(
  socket: WebSocket,
  payload: { room_id: string; participant_id?: string | null; question: string }
) {
  socket.send(JSON.stringify({ type: "submit", payload }));
}

export function answerQuestion(socket: WebSocket, questionId: string, answer: string) {
  socket.send(JSON.stringify({ type: "answer", question_id: questionId, answer }));
}

export function dismissQuestion(socket: WebSocket, questionId: string) {
  socket.send(JSON.stringify({ type: "dismiss", question_id: questionId }));
}