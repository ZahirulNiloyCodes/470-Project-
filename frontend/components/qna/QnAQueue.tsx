"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnonymousQuestion,
  fetchQuestions,
  createParticipantSocket,
  createHostSocket,
  submitQuestion,
  answerQuestion,
  dismissQuestion,
} from "@/services/qnaService";

interface QnAQueueProps {
  roomId: string;
  mode: "host" | "participant";
  participantId?: string | null;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours; // 0 ঘণ্টা মানে 12 AM/PM

  return `${dd}/${mm}/${yyyy}, ${hours}:${minutes} ${ampm}`;
}

export default function QnAQueue({ roomId, mode, participantId }: QnAQueueProps) {
  const [questions, setQuestions] = useState<AnonymousQuestion[]>([]);
  const [input, setInput] = useState("");
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchQuestions(roomId, mode)
      .then((qs) => {
        if (isMounted) setQuestions(qs);
      })
      .catch((err) => console.error("Failed to load questions:", err));

    const handleIncoming = (msg: any) => {
      if (msg.type === "error") {
        console.error("QnA error:", msg.detail);
        return;
      }
      const q: AnonymousQuestion = msg.question;
      setQuestions((prev) => {
        if (msg.type === "new") return [...prev, q];
        return prev.map((existing) => (existing.id === q.id ? q : existing));
      });
    };

    const socket =
      mode === "host"
        ? createHostSocket(roomId, handleIncoming)
        : createParticipantSocket(roomId, handleIncoming);

    socketRef.current = socket;
    return () => {
      isMounted = false;
      socket.close();
    };
  }, [roomId, mode]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (trimmed.length < 3 || !socketRef.current) return;
    submitQuestion(socketRef.current, {
      room_id: roomId,
      participant_id: participantId ?? null,
      question: trimmed,
    });
    setInput("");
  };

  const handleAnswer = (questionId: string) => {
    const draft = (answerDrafts[questionId] || "").trim();
    if (!draft || !socketRef.current) return;
    answerQuestion(socketRef.current, questionId, draft);
    setAnswerDrafts((prev) => ({ ...prev, [questionId]: "" }));
  };

  const handleDismiss = (questionId: string) => {
    if (!socketRef.current) return;
    dismissQuestion(socketRef.current, questionId);
  };

  const pending = questions.filter((q) => q.status === "pending");
  const answered = questions.filter((q) => q.status === "answered");

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100">
      {mode === "participant" && (
        <div className="flex gap-2 p-3 border-b border-zinc-700 bg-zinc-900">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask an anonymous question..."
            className="flex-1 border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={2}
          />
          <button
            onClick={handleSubmit}
            disabled={input.trim().length < 3}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-md text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Ask
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 px-3 py-3">
        <h3 className="text-sm font-semibold text-zinc-400">Pending ({pending.length})</h3>
        {pending.length === 0 && (
          <p className="text-xs text-zinc-600">There are no pending questions.</p>
        )}
        {pending.map((q) => (
          <div key={q.id} className="border border-zinc-700 bg-zinc-800 rounded-md p-3">
            <div className="flex justify-between items-start gap-2">
              <p className="text-sm text-zinc-100">{q.question}</p>
              <span className="text-xs text-zinc-500 whitespace-nowrap">
                {formatTimestamp(q.created_at)}
              </span>
            </div>

            {mode === "host" && (
              <div className="mt-2 flex gap-2">
                <input
                  value={answerDrafts[q.id] || ""}
                  onChange={(e) =>
                    setAnswerDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  placeholder="Write an answer..."
                  className="flex-1 border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 rounded-md p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleAnswer(q.id)}
                  className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 rounded-md transition-colors"
                >
                  Answer
                </button>
                <button
                  onClick={() => handleDismiss(q.id)}
                  className="text-xs bg-zinc-600 hover:bg-zinc-500 text-white px-3 rounded-md transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}

        <h3 className="text-sm font-semibold text-zinc-400 mt-5">Answered ({answered.length})</h3>
        {answered.length === 0 && (
          <p className="text-xs text-zinc-600">There are no answered questions.</p>
        )}
        {answered.map((q) => (
          <div key={q.id} className="border border-zinc-700 bg-zinc-800/60 rounded-md p-3">
            <div className="flex justify-between items-start gap-2">
              <p className="text-sm font-medium text-zinc-100">{q.question}</p>
              <span className="text-xs text-zinc-500 whitespace-nowrap">
                {q.answered_at ? formatTimestamp(q.answered_at) : ""}
              </span>
            </div>
            <div className="mt-2 pl-3 border-l-2 border-green-600">
              <p className="text-sm text-green-400">{q.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}